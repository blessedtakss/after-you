/*
 * A small stand-in DOM for the jsc shell, enough to run app.js through whole Lives and catch
 * runtime errors in the page logic. Not a browser: nothing here lays anything out.
 * Run from the page's folder:  jsc <this file>
 */
var NOW = 1000, timers = [], timerSeq = 1, LOG = { scrolls: [], scrollBy: [] };
globalThis.window = globalThis;
globalThis.setTimeout = function (fn, ms) { var id = timerSeq++; timers.push({ id: id, fn: fn, at: NOW + (ms || 0), every: 0 }); return id; };
globalThis.setInterval = function (fn, ms) { var id = timerSeq++; timers.push({ id: id, fn: fn, at: NOW + ms, every: ms }); return id; };
globalThis.clearTimeout = globalThis.clearInterval = function (id) { timers = timers.filter(function (t) { return t.id !== id; }); };
function advance(ms) {
  var end = NOW + ms, guard = 0;
  for (;;) {
    timers.sort(function (a, b) { return a.at - b.at; });
    var t = timers[0];
    if (!t || t.at > end) break;
    if (++guard > 100000) throw new Error('timers never settle');
    if (t.at > NOW) NOW = t.at;
    if (t.every) t.at = NOW + t.every; else timers.shift();
    t.fn();
  }
  if (end > NOW) NOW = end;
}
globalThis.performance = { now: function () { NOW += 10; return NOW; } };

var BOX_W = 384, ACTIVE = null;

function Text(s) { this.nodeType = 3; this._t = s; this.parentNode = null; }
Object.defineProperty(Text.prototype, 'textContent', { get: function () { return this._t; }, set: function (v) { this._t = String(v); } });

function El(tag) {
  this.nodeType = 1; this.tagName = String(tag).toUpperCase(); this.childNodes = []; this.attrs = {}; this.parentNode = null;
  this.hidden = false; this.disabled = false; this.checked = false; this.open = false; this.className = ''; this._html = '';
  this.listeners = []; this.scrollTop = 0; this.scrollHeight = 0; this._top = 0;
  this.style = { setProperty: function (k, v) { this[k] = v; } };
  var self = this;
  this.classList = {
    contains: function (c) { return (' ' + self.className + ' ').indexOf(' ' + c + ' ') >= 0; },
    add: function (c) { if (!this.contains(c)) self.className = (self.className + ' ' + c).trim(); },
    remove: function (c) { self.className = (' ' + self.className + ' ').replace(' ' + c + ' ', ' ').trim(); },
    toggle: function (c, on) { if (on === undefined) on = !this.contains(c); if (on) this.add(c); else this.remove(c); return on; }
  };
}
['id', 'type', 'name', 'value'].forEach(function (k) {
  Object.defineProperty(El.prototype, k, { get: function () { return this.attrs[k] === undefined ? '' : this.attrs[k]; }, set: function (v) { this.attrs[k] = String(v); } });
});
Object.defineProperty(El.prototype, 'children', { get: function () { return this.childNodes.filter(function (c) { return c.nodeType === 1; }); } });
Object.defineProperty(El.prototype, 'firstChild', { get: function () { return this.childNodes[0] || null; } });
Object.defineProperty(El.prototype, 'nextSibling', { get: function () { var p = this.parentNode; if (!p) return null; return p.childNodes[p.childNodes.indexOf(this) + 1] || null; } });
Object.defineProperty(El.prototype, 'nextElementSibling', { get: function () {
  var p = this.parentNode, i; if (!p) return null;
  for (i = p.childNodes.indexOf(this) + 1; i < p.childNodes.length; i++) if (p.childNodes[i].nodeType === 1) return p.childNodes[i];
  return null;
} });
Object.defineProperty(El.prototype, 'textContent', {
  get: function () { return this.childNodes.map(function (c) { return c.textContent; }).join(''); },
  set: function (v) { this.childNodes.forEach(function (c) { c.parentNode = null; }); this.childNodes = []; this._html = ''; if (v !== '') this.appendChild(new Text(String(v))); }
});
Object.defineProperty(El.prototype, 'innerHTML', {
  get: function () { return this._html; },
  set: function (v) {
    var self = this, re = /<([a-z]+)((?:\s+[a-zA-Z:-]+(?:="[^"]*")?)*)\s*\/?>/g, m, am, are, node;
    this.childNodes.forEach(function (c) { c.parentNode = null; }); this.childNodes = []; this._html = String(v);
    // the drawn map is not parsed, but its nodes that carry an id can be found and written to
    while ((m = re.exec(this._html))) {
      if (!/\sid="/.test(m[2])) continue;
      node = new El(m[1]); are = /([a-zA-Z:-]+)(?:="([^"]*)")?/g;
      while ((am = are.exec(m[2]))) node.setAttribute(am[1], am[2] === undefined ? '' : am[2]);
      self.appendChild(node);
    }
  }
});
function shown(n) { for (; n; n = n.parentNode) if (n.hidden) return false; return true; }
Object.defineProperty(El.prototype, 'clientWidth', { get: function () { return shown(this) ? BOX_W : 0; } });
Object.defineProperty(El.prototype, 'offsetWidth', { get: function () { return shown(this) ? 70 : 0; } });
El.prototype.setAttribute = function (k, v) {
  v = String(v);
  if (k === 'class') this.className = v; else if (k === 'hidden') this.hidden = true; else if (k === 'disabled') this.disabled = true;
  else if (k === 'open') this.open = true; else this.attrs[k] = v;
};
El.prototype.getAttribute = function (k) { if (k === 'class') return this.className; return this.attrs[k] === undefined ? null : this.attrs[k]; };
El.prototype.removeAttribute = function (k) { delete this.attrs[k]; };
function detach(n) {
  var p = n.parentNode;
  if (p) { p.childNodes.splice(p.childNodes.indexOf(n), 1); n.parentNode = null; }
  if (n.nodeType === 1 && ACTIVE && (n === ACTIVE || n.contains(ACTIVE))) ACTIVE = BODY;     // a browser drops the focus of a node taken out of the page
}
El.prototype.appendChild = function (n) { detach(n); this.childNodes.push(n); n.parentNode = this; return n; };
El.prototype.insertBefore = function (n, ref) {
  detach(n);
  var i = ref ? this.childNodes.indexOf(ref) : -1;
  if (ref && i < 0) throw new Error('insertBefore: the reference is not a child');
  if (i < 0) this.childNodes.push(n); else this.childNodes.splice(i, 0, n);
  n.parentNode = this; return n;
};
El.prototype.removeChild = function (n) { if (n.parentNode !== this) throw new Error('removeChild: not a child'); detach(n); return n; };
El.prototype.contains = function (n) { for (; n; n = n.parentNode) if (n === this) return true; return false; };
function parseSel(sel) {
  var m, out = { tag: null, id: null, cls: [], attrs: [] }, s = sel.trim();
  if (/[\s,>+~]/.test(s.replace(/"[^"]*"/g, ''))) throw new Error('selector not supported by the stand-in DOM: ' + sel);
  if ((m = /^[a-z0-9]+/i.exec(s))) { out.tag = m[0].toUpperCase(); s = s.slice(m[0].length); }
  while (s.length) {
    if ((m = /^#([a-z0-9-]+)/i.exec(s))) out.id = m[1];
    else if ((m = /^\.([a-z0-9-]+)/i.exec(s))) out.cls.push(m[1]);
    else if ((m = /^\[([a-z-]+)(?:="([^"]*)")?\]/i.exec(s))) out.attrs.push([m[1], m[2]]);
    else throw new Error('selector not understood by the stand-in DOM: ' + sel);
    s = s.slice(m[0].length);
  }
  return out;
}
El.prototype.matches = function (sel) {
  var p = parseSel(sel), i, v;
  if (p.tag && p.tag !== this.tagName) return false;
  if (p.id && this.attrs.id !== p.id) return false;
  for (i = 0; i < p.cls.length; i++) if (!this.classList.contains(p.cls[i])) return false;
  for (i = 0; i < p.attrs.length; i++) {
    v = p.attrs[i][0] === 'hidden' ? (this.hidden ? '' : null) : this.getAttribute(p.attrs[i][0]);
    if (v === null) return false;
    if (p.attrs[i][1] !== undefined && v !== p.attrs[i][1]) return false;
  }
  return true;
};
El.prototype.querySelectorAll = function (sel) {
  var out = [];
  (function walk(n) { n.childNodes.forEach(function (c) { if (c.nodeType !== 1) return; if (c.matches(sel)) out.push(c); walk(c); }); })(this);
  return out;
};
El.prototype.querySelector = function (sel) { return this.querySelectorAll(sel)[0] || null; };
El.prototype.closest = function (sel) { for (var n = this; n && n.nodeType === 1; n = n.parentNode) if (n.matches(sel)) return n; return null; };
El.prototype.addEventListener = function (type, fn) { this.listeners.push({ type: type, fn: fn }); };
El.prototype.focus = function () { ACTIVE = this; };
El.prototype.scrollIntoView = function (o) { LOG.scrolls.push({ id: this.attrs.id || this.className, block: o && o.block }); };
El.prototype.getBoundingClientRect = function () { return { top: this._top, left: 0, width: BOX_W, height: 20 }; };

var BODY = new El('body'), ROOT = new El('html');
ROOT.appendChild(BODY);
function fire(node, type, props) {
  var e = { type: type, target: node, key: '', repeat: false, relatedTarget: null, preventDefault: function () {} }, k, n, i;
  for (k in props || {}) e[k] = props[k];
  for (n = node; n; n = n.parentNode) for (i = 0; i < (n.listeners || []).length; i++) if (n.listeners[i].type === type) n.listeners[i].fn(e);
}
function click(node) { if (!node) throw new Error('click on nothing'); if (node.disabled) throw new Error('click on a disabled control: #' + node.id); fire(node, 'click'); }

// the page's own markup, read from index.html
(function () {
  var html = readFile('index.html'), from = html.indexOf('<main'), to = html.indexOf('</main>') + 7, src = html.slice(from, to);
  var re = /<(\/)?([a-z0-9]+)((?:\s+[a-z:-]+(?:="[^"]*")?)*)\s*>|([^<]+)/gi, m, stack = [BODY], node, am, are;
  while ((m = re.exec(src))) {
    if (m[4] !== undefined) { if (m[4].trim()) stack[stack.length - 1].appendChild(new Text(m[4].replace(/\s+/g, ' ').trim())); continue; }
    if (m[1]) { if (stack[stack.length - 1].tagName !== m[2].toUpperCase()) throw new Error('index.html: </' + m[2] + '> closes <' + stack[stack.length - 1].tagName + '>'); stack.pop(); continue; }
    node = new El(m[2]); are = /([a-z:-]+)(?:="([^"]*)")?/gi;
    while ((am = are.exec(m[3] || ''))) node.setAttribute(am[1], am[2] === undefined ? '' : am[2]);
    stack[stack.length - 1].appendChild(node); stack.push(node);
  }
  if (stack.length !== 1) throw new Error('index.html: unclosed <' + stack[stack.length - 1].tagName + '>');
})();

var MEDIA = {};
globalThis.matchMedia = function (q) {
  if (!MEDIA[q]) MEDIA[q] = { media: q, matches: false, fns: [], addEventListener: function (t, fn) { this.fns.push(fn); } };
  return MEDIA[q];
};
function setMedia(q, on) { var m = matchMedia(q); if (m.matches === on) return; m.matches = on; m.fns.forEach(function (fn) { fn({ matches: on }); }); }
var Q = { compact: '(max-width: 36rem)', wide: '(min-width: 40rem)', roomy: '(min-width: 40rem) and (min-height: 66rem)', two: '(min-width: 62rem)', still: '(prefers-reduced-motion: reduce)' };
function screen(kind) {
  if (kind === 'laptop') { BOX_W = 384; setMedia(Q.compact, false); setMedia(Q.wide, true); setMedia(Q.two, true); }
  else if (kind === 'tablet') { BOX_W = 560; setMedia(Q.compact, false); setMedia(Q.two, false); setMedia(Q.wide, true); }
  else { BOX_W = kind === 'phone320' ? 288 : 368; setMedia(Q.two, false); setMedia(Q.wide, false); setMedia(Q.compact, true); }
  fire(WIN, 'resize');
}

var STORE = {};
var WIN = new El('window');
globalThis.document = {
  documentElement: ROOT, hidden: false,
  getElementById: function (id) { return ROOT.querySelector('#' + id); },
  createElement: function (tag) { return new El(tag); },
  createTextNode: function (s) { return new Text(String(s)); },
  querySelectorAll: function (sel) { return ROOT.querySelectorAll(sel); }
};
Object.defineProperty(document, 'activeElement', { get: function () { return ACTIVE || BODY; } });
globalThis.localStorage = { getItem: function (k) { return STORE[k] === undefined ? null : STORE[k]; }, setItem: function (k, v) { STORE[k] = String(v); } };
globalThis.location = { hash: '' };
globalThis.getComputedStyle = function () { return { fontSize: '16px' }; };
globalThis.scrollTo = function () {};
globalThis.scrollBy = function (x, y) { LOG.scrollBy.push(y); };
globalThis.addEventListener = function (type, fn) { WIN.addEventListener(type, fn); };

function $(id) { var n = document.getElementById(id); if (!n) throw new Error('no #' + id + ' in the page'); return n; }
function ok(cond, what) { if (!cond) throw new Error('CHECK FAILED: ' + what); CHECKS++; }
var CHECKS = 0;
function oneView(name) {
  var open = document.querySelectorAll('[data-view]').filter(function (n) { return !n.hidden; });
  ok(open.length === 1 && open[0].getAttribute('data-view') === name, 'exactly the ' + name + ' view is shown (got ' + open.map(function (n) { return n.getAttribute('data-view'); }).join(',') + ')');
}
function idsExist(list) { String(list).split(' ').forEach(function (id) { ok(!!document.getElementById(id), 'aria reference to #' + id + ' resolves'); }); }
function letterSizes(html) { var out = [], m, re = /font-size="([0-9.]+)"/g; while ((m = re.exec(html))) out.push(Number(m[1])); return out; }
function minLetterPx(mapId, sheetW) {
  var sizes = letterSizes($(mapId).innerHTML);
  ok(sizes.length > 0, mapId + ' carries lettering');
  return Math.min.apply(null, sizes) * BOX_W / sheetW;
}
function cardOrder() { return $('cards').children.map(function (c) { return c.getAttribute('data-house'); }).join(','); }
