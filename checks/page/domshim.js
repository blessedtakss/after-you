/*
 * A small stand-in for the browser, enough to run after-you/app.js in the jsc shell and walk a
 * whole Life through it. Not a deliverable: a check that the page's logic runs without a browser.
 * Layout is not modelled (no CSS): widths come from shim.view, media queries are evaluated
 * against shim.view, timers and the clock are stepped by hand.
 */
var shim = { view: { w: 1280, h: 800, still: false }, clock: 1000, timers: [], nextTimer: 1, scrolls: [], focusLog: [], store: {}, storeFails: false };

function decode(s) { return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'); }

function TextNode(t) { this.nodeType = 3; this.data = t; this.parentNode = null; }
Object.defineProperty(TextNode.prototype, 'textContent', { get: function () { return this.data; }, set: function (v) { this.data = String(v); } });

function Element(tag) {
  this.nodeType = 1; this.tagName = tag.toUpperCase(); this.localName = tag.toLowerCase();
  this.attrs = {}; this.childNodes = []; this.parentNode = null; this.listeners = {};
  this._checked = false; this.scrollTop = 0;
  var self = this;
  this.style = { setProperty: function (k, v) { self.style[k] = v; } };
  this.classList = {
    contains: function (c) { return self.className.split(/\s+/).indexOf(c) >= 0; },
    add: function (c) { if (!this.contains(c)) self.className = (self.className + ' ' + c).trim(); },
    remove: function (c) { self.className = self.className.split(/\s+/).filter(function (x) { return x && x !== c; }).join(' '); },
    toggle: function (c, on) { if (on === undefined) on = !this.contains(c); if (on) this.add(c); else this.remove(c); return on; }
  };
}
var EP = Element.prototype;
function boolProp(name) {
  Object.defineProperty(EP, name, {
    get: function () { return Object.prototype.hasOwnProperty.call(this.attrs, name); },
    set: function (v) { if (v) this.attrs[name] = ''; else delete this.attrs[name]; }
  });
}
['hidden', 'disabled', 'open'].forEach(boolProp);
Object.defineProperty(EP, 'checked', { get: function () { return this._checked; }, set: function (v) { this._checked = !!v; } });
['id', 'name', 'value', 'type', 'lang'].forEach(function (name) {
  Object.defineProperty(EP, name, { get: function () { return this.attrs[name] || ''; }, set: function (v) { this.attrs[name] = String(v); } });
});
Object.defineProperty(EP, 'className', { get: function () { return this.attrs['class'] || ''; }, set: function (v) { this.attrs['class'] = String(v); } });
Object.defineProperty(EP, 'children', { get: function () { return this.childNodes.filter(function (c) { return c.nodeType === 1; }); } });
Object.defineProperty(EP, 'firstChild', { get: function () { return this.childNodes[0] || null; } });
Object.defineProperty(EP, 'nextSibling', { get: function () { var p = this.parentNode; if (!p) return null; return p.childNodes[p.childNodes.indexOf(this) + 1] || null; } });
Object.defineProperty(TextNode.prototype, 'nextSibling', { get: function () { var p = this.parentNode; if (!p) return null; return p.childNodes[p.childNodes.indexOf(this) + 1] || null; } });
Object.defineProperty(EP, 'nextElementSibling', { get: function () {
  var p = this.parentNode, i; if (!p) return null;
  for (i = p.childNodes.indexOf(this) + 1; i < p.childNodes.length; i++) if (p.childNodes[i].nodeType === 1) return p.childNodes[i];
  return null;
} });
Object.defineProperty(EP, 'previousElementSibling', { get: function () {
  var p = this.parentNode, i; if (!p) return null;
  for (i = p.childNodes.indexOf(this) - 1; i >= 0; i--) if (p.childNodes[i].nodeType === 1) return p.childNodes[i];
  return null;
} });
Object.defineProperty(EP, 'textContent', {
  get: function () { return this.childNodes.map(function (c) { return c.textContent; }).join(''); },
  set: function (v) { this.childNodes.forEach(function (c) { c.parentNode = null; }); this.childNodes = []; if (String(v) !== '') this.appendChild(new TextNode(String(v))); }
});
Object.defineProperty(EP, 'innerHTML', {
  get: function () { return serialize(this, true); },
  set: function (v) { this.childNodes.forEach(function (c) { c.parentNode = null; }); this.childNodes = []; parseInto(this, String(v)); }
});
Object.defineProperty(EP, 'scrollHeight', { get: function () { return this.childNodes.length * 20; } });
Object.defineProperty(EP, 'clientWidth', { get: function () { return shim.widthOf(this); } });
Object.defineProperty(EP, 'offsetWidth', { get: function () { return 0; } });
EP.setAttribute = function (k, v) { this.attrs[k] = String(v); };
EP.getAttribute = function (k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; };
EP.hasAttribute = function (k) { return Object.prototype.hasOwnProperty.call(this.attrs, k); };
EP.removeAttribute = function (k) { delete this.attrs[k]; };
function detach(node) {
  if (node.parentNode) { var a = node.parentNode.childNodes, i = a.indexOf(node); if (i >= 0) a.splice(i, 1); node.parentNode = null; }
}
EP.appendChild = function (node) { detach(node); node.parentNode = this; this.childNodes.push(node); return node; };
EP.insertBefore = function (node, ref) {
  if (!ref) return this.appendChild(node);
  detach(node);
  var i = this.childNodes.indexOf(ref);
  if (i < 0) throw new Error('insertBefore: the reference node is not a child');
  node.parentNode = this; this.childNodes.splice(i, 0, node); return node;
};
EP.removeChild = function (node) { if (node.parentNode !== this) throw new Error('removeChild: not a child'); detach(node); return node; };
EP.contains = function (node) { while (node) { if (node === this) return true; node = node.parentNode; } return false; };
EP.focus = function () {
  if (!shim.displayed(this)) throw new Error('focus() on an element that is not displayed: ' + describe(this));
  if (this.disabled) throw new Error('focus() on a disabled control: ' + describe(this));
  var n = this; while (n) { if (n.nodeType === 1 && n.hasAttribute('inert')) throw new Error('focus() inside an inert part: ' + describe(this)); n = n.parentNode; }
  document.activeElement = this; shim.focusLog.push(describe(this));
};
EP.scrollIntoView = function (o) { shim.scrolls.push(describe(this) + ':' + (o && o.block)); };
EP.addEventListener = function (type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); };
EP.dispatch = function (type, props) {
  var ev = { type: type, target: this, preventDefault: function () {}, stopPropagation: function () {} }, k, n = this;
  for (k in (props || {})) ev[k] = props[k];
  while (n) { (n.listeners && n.listeners[type] || []).slice().forEach(function (fn) { fn.call(n, ev); }); n = n.parentNode; }
};
EP.click = function () {
  if (this.disabled) throw new Error('click on a disabled control: ' + describe(this));
  if (!shim.displayed(this)) throw new Error('click on a control that is not displayed: ' + describe(this));
  this.dispatch('click');
};
function matches(node, sel) {
  var m, rest = sel.trim(), re = /^(?:([a-zA-Z][a-zA-Z0-9]*)|#([\w-]+)|\.([\w-]+)|\[([\w-]+)(?:="([^"]*)")?\])/;
  if (node.nodeType !== 1) return false;
  while (rest.length) {
    m = re.exec(rest);
    if (!m) throw new Error('the shim does not know this selector: ' + sel);
    if (m[1] && node.localName !== m[1].toLowerCase()) return false;
    if (m[2] && node.id !== m[2]) return false;
    if (m[3] && !node.classList.contains(m[3])) return false;
    if (m[4]) { if (!node.hasAttribute(m[4])) return false; if (m[5] !== undefined && node.getAttribute(m[4]) !== m[5]) return false; }
    rest = rest.slice(m[0].length);
  }
  return true;
}
function walk(node, fn) { node.childNodes.forEach(function (c) { if (c.nodeType === 1) { fn(c); walk(c, fn); } }); }
EP.querySelectorAll = function (sel) { var out = []; walk(this, function (n) { if (matches(n, sel)) out.push(n); }); return out; };
EP.querySelector = function (sel) { return this.querySelectorAll(sel)[0] || null; };
EP.closest = function (sel) { var n = this; while (n && n.nodeType === 1) { if (matches(n, sel)) return n; n = n.parentNode; } return null; };
EP.matches = function (sel) { return matches(this, sel); };

function describe(n) { return n.localName + (n.id ? '#' + n.id : '') + (n.className ? '.' + n.className.split(/\s+/).join('.') : ''); }
function serialize(node, inner) {
  if (node.nodeType === 3) return node.data;
  var kids = node.childNodes.map(function (c) { return serialize(c); }).join('');
  if (inner) return kids;
  return '<' + node.localName + Object.keys(node.attrs).map(function (k) { return ' ' + k + '="' + node.attrs[k] + '"'; }).join('') + '>' + kids + '</' + node.localName + '>';
}
var VOID = { meta: 1, link: 1, br: 1, input: 1, img: 1, hr: 1 };
function parseInto(root, html) {
  var re = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[\w:-]+(?:\s*=\s*"[^"]*")?)*)\s*(\/?)>|([^<]+)/g, m, cur = root, am, node;
  var raw = null;
  while ((m = re.exec(html))) {
    if (m[1]) {                                   // closing tag
      if (cur === root) throw new Error('parse: a closing tag with nothing open: </' + m[1] + '>');
      if (cur.localName !== m[1].toLowerCase()) throw new Error('parse: </' + m[1] + '> closes <' + cur.localName + '>');
      cur = cur.parentNode;
    } else if (m[2]) {
      node = new Element(m[2]);
      var ar = /([\w:-]+)(?:\s*=\s*"([^"]*)")?/g;
      while ((am = ar.exec(m[3] || ''))) node.attrs[am[1]] = am[2] === undefined ? '' : decode(am[2]);
      if (node.attrs.checked !== undefined) node._checked = true;
      cur.appendChild(node);
      if (m[2].toLowerCase() === 'style' || m[2].toLowerCase() === 'script') {     // raw text: skip to the end tag
        var end = html.indexOf('</' + m[2] + '>', re.lastIndex);
        if (end < 0) throw new Error('parse: <' + m[2] + '> is not closed');
        node.appendChild(new TextNode(html.slice(re.lastIndex, end)));
        re.lastIndex = end + m[2].length + 3;
      } else if (!m[4] && !VOID[m[2].toLowerCase()]) cur = node;
    } else if (m[5] !== undefined) {
      if (m[5].replace(/\s+/g, '') !== '' || cur !== root) cur.appendChild(new TextNode(decode(m[5])));
    }
  }
  if (cur !== root) throw new Error('parse: <' + cur.localName + (cur.id ? '#' + cur.id : '') + '> is never closed');
}

shim.displayed = function (node) { var n = node; while (n && n.nodeType === 1) { if (n.hidden) return false; n = n.parentNode; } return true; };
shim.rem = 16;
shim.widthOf = function (node) {
  if (!shim.displayed(node)) return 0;
  var w = shim.view.w - 32, id = node.id;
  if (id === 'map-day') return shim.view.w >= 992 ? (shim.view.h < 928 ? 384 : Math.min(499, w)) : Math.min(608, w);
  if (id === 'map-leaving') return shim.view.w >= 960 ? 555 : Math.min(608, w);
  if (id === 'map-opening' || id === 'map-after') return Math.min(608, w);
  if (id === 'chron-scale') return Math.min(600, w);
  return w;
};
function evalMedia(q) {
  return q.split(/\s+and\s+/).every(function (part) {
    var m = /^\(\s*(min|max)-(width|height)\s*:\s*([\d.]+)rem\s*\)$/.exec(part.trim());
    if (m) { var px = parseFloat(m[3]) * 16, v = m[2] === 'width' ? shim.view.w : shim.view.h; return m[1] === 'min' ? v >= px : v <= px; }
    if (/prefers-reduced-motion:\s*reduce/.test(part)) return !!shim.view.still;
    throw new Error('the shim does not know this media query: ' + q);
  });
}
shim.media = [];
shim.setView = function (w, h, still) {                 // change the window and tell the page, as a browser would
  var before = shim.media.map(function (m) { return m.matches; });
  shim.view = { w: w, h: h, still: !!still };
  shim.media.forEach(function (m, i) { if (m.matches !== before[i]) m.fns.slice().forEach(function (fn) { fn({ matches: m.matches }); }); });
  (window.listeners.resize || []).forEach(function (fn) { fn({}); });
};
shim.advance = function (ms) {                          // step the clock, running what falls due, in order
  var until = shim.clock + ms, due, guard = 0;
  for (;;) {
    due = shim.timers.filter(function (t) { return t.at <= until; }).sort(function (a, b) { return a.at - b.at || a.id - b.id; })[0];
    if (!due) break;
    if (++guard > 200000) throw new Error('timers never settle');
    shim.clock = Math.max(shim.clock, due.at);
    if (due.every) due.at += due.every; else shim.timers.splice(shim.timers.indexOf(due), 1);
    due.fn();
  }
  shim.clock = until;
};

var document = {
  documentElement: new Element('html'), body: new Element('body'), activeElement: null,
  createElement: function (tag) { return new Element(tag); },
  createTextNode: function (t) { return new TextNode(String(t)); },
  getElementById: function (id) { var hit = null; walk(document.documentElement, function (n) { if (!hit && n.id === id) hit = n; }); return hit; },
  querySelectorAll: function (sel) { return document.documentElement.querySelectorAll(sel); },
  querySelector: function (sel) { return document.documentElement.querySelector(sel); }
};
document.documentElement.appendChild(document.body);
document.activeElement = document.body;

var window = globalThis;
window.document = document;
window.listeners = {};
window.addEventListener = function (type, fn) { (window.listeners[type] = window.listeners[type] || []).push(fn); };
window.matchMedia = function (q) {
  var m = { media: q, fns: [], addEventListener: function (type, fn) { m.fns.push(fn); } };
  Object.defineProperty(m, 'matches', { get: function () { return evalMedia(q); } });
  shim.media.push(m);
  return m;
};
window.performance = { now: function () { shim.clock += 0.5; return shim.clock; } };      // work takes time: budgets by the clock run out
window.setTimeout = function (fn, ms) { var id = shim.nextTimer++; shim.timers.push({ id: id, at: shim.clock + (ms || 0), fn: fn }); return id; };
window.setInterval = function (fn, ms) { var id = shim.nextTimer++; shim.timers.push({ id: id, at: shim.clock + ms, fn: fn, every: ms }); return id; };
window.clearTimeout = window.clearInterval = function (id) { shim.timers = shim.timers.filter(function (t) { return t.id !== id; }); };
window.getComputedStyle = function () { return { fontSize: '16px' }; };
window.scrollTo = function (x, y) { shim.scrolls.push('window:' + y); };
window.location = { hash: '' };
window.localStorage = {
  getItem: function (k) { if (shim.storeFails) throw new Error('storage is off'); return Object.prototype.hasOwnProperty.call(shim.store, k) ? shim.store[k] : null; },
  setItem: function (k, v) { if (shim.storeFails) throw new Error('storage is off'); shim.store[k] = String(v); }
};
shim.loadPage = function (dir) {                        // index.html's markup into the body
  var html = readFile(dir + '/index.html'), from = html.indexOf('</style>') + 8, to = html.indexOf('<script src="engine.js">');
  if (from < 8 || to < 0) throw new Error('index.html: the style block or the scripts were not found');
  document.body.childNodes = [];
  parseInto(document.body, html.slice(from, to));
  document.activeElement = document.body;
  shim.timers = []; shim.media = []; shim.scrolls = []; shim.focusLog = []; window.listeners = {};
};
