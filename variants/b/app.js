/*
 * After You: the page. Plain JavaScript, no frameworks, no build step.
 * Rules come from engine.js (AfterYou), every sentence from words.js (AYWords).
 * The map of the valley is drawn here as inline SVG; its colours come from the CSS tokens
 * through classes, so a change of theme needs no redraw.
 *
 * A Life is rebuildable from state.seed and state.choices (see restore()).
 */
(function () {
  'use strict';

  var A = window.AfterYou, W = window.AYWords;
  var ORDER = [1, 2, 6, 7];                 // the engine's order of the four neighbours
  var MIRROR = [0, 1, 3, 2, 4];             // my situation on a tie -> theirs
  var SEASON_MS = 660;                      // thirty seasons in about twenty seconds
  var SETTLE_MS = 350;                      // what has just appeared stands this long before its button takes a click
  var STORE_KEY = 'after-you.lives.v1';

  var state = {
    view: 'opening',
    viewAt: 0,             // when the view on screen was shown by the reader's own step (see fresh)
    seed: null,            // valley number of the Life in progress
    fixedSeed: null,       // from #valley-<number>
    life: null,            // the engine's Life (rebuildable from seed + choices)
    choices: [],           // closed days, each [bool x 4] in the order [1, 2, 6, 7]
    pending: {},           // today's choices so far: { houseId: bool }
    phase: 'choose',       // within the day view: 'choose' | 'revealed' | 'season'
    phaseAt: 0,            // when the day was closed or its season's end opened (see nextDay)
    today: null,           // today() as it stood before the day was closed
    result: null,          // playDay() of the day just closed
    follow: null,          // { houseId: [bool x 5] } habits learned from you, as the map shows them
    keeps: null,           // { houseId: bool } neighbours running your ways, as the map shows them
    flipped: {},           // cards turned over
    thirdOpen: {},         // "elsewhere" reasons opened
    knowOpen: {},          // "What you know of them": sections the reader opened or closed by hand
    youMark: null,         // { day, key }: where a habit learned from you first showed
    hot: null,             // neighbour under the pointer or focus
    future: null,          // runFuture(life, 0), the watched future
    after: null,           // the Afterwards as it plays: { t0, shown, done, lines, upTo }
    job: null,             // verdictJob(life)
    verdict: null,         // its result
    scaleAt: null,         // where the Chronicle's scale puts its four marks, in percent
    saved: false,          // this Life is in the list of earlier lives
    lives: []              // earlier lives, newest first
  };
  window.AYApp = { state: state };

  // ---- small helpers ------------------------------------------------------------------------

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;';
    });
  }
  function el(tag, attrs, kids) {
    var node = document.createElement(tag), k, i, v;
    if (attrs) {
      for (k in attrs) {
        v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;          // only SVG strings built in this file
        else if (k === 'hidden') node.hidden = true;
        else if (k === 'disabled') node.disabled = true;
        else if (k === 'checked') node.checked = true;
        else node.setAttribute(k, v === true ? '' : String(v));
      }
    }
    if (kids) for (i = 0; i < kids.length; i++) if (kids[i]) node.appendChild(kids[i]);
    return node;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function setText(id, text) { var n = $(id); if (n) n.textContent = text; }
  function now() { return window.performance && performance.now ? performance.now() : Date.now(); }
  function f(n) { return String(Math.round(n * 10) / 10); }
  function clamp(x, lo, hi) { return x < lo ? lo : x > hi ? hi : x; }
  function media(q) {
    var m = window.matchMedia ? window.matchMedia(q) : null;
    return m || { matches: false, addEventListener: function () {} };
  }
  function onMedia(m, fn) {
    if (m.addEventListener) m.addEventListener('change', fn);
    else if (m.addListener) m.addListener(fn);
  }
  var mqCompact = media('(max-width: 36rem)');          // the map goes compact (used where its box cannot be measured)
  var mqWide = media('(min-width: 40rem)');             // cards two by two: the day map's key stays open
  var mqRoomy = media('(min-width: 40rem) and (min-height: 58rem)');   // and height to spare: "What you know" stays open
  var mqTwo = media('(min-width: 62rem)');              // the day in two columns
  var mqStill = media('(prefers-reduced-motion: reduce)');

  // ---- timers: every pending one is cancelled when the view changes or a Life starts ---------

  var timeouts = [], intervals = [];
  function later(fn, ms) {
    var id = setTimeout(function () {
      var i = timeouts.indexOf(id);
      if (i >= 0) timeouts.splice(i, 1);
      fn();
    }, ms);
    timeouts.push(id);
    return id;
  }
  function every(fn, ms) { var id = setInterval(fn, ms); intervals.push(id); return id; }
  function cancelTimers() {
    var i;
    for (i = 0; i < timeouts.length; i++) clearTimeout(timeouts[i]);
    for (i = 0; i < intervals.length; i++) clearInterval(intervals[i]);
    timeouts = []; intervals = [];
  }

  // ---- views --------------------------------------------------------------------------------

  var HEADS = { opening: 'h-opening', day: 'h-day', leaving: 'h-leaving', afterwards: 'h-after', chronicle: 'h-chronicle' };
  function focusOn(node) {
    if (!node || !node.focus) return;
    try { node.focus({ preventScroll: true }); } catch (e) { node.focus(); }
  }
  function toTop() { try { window.scrollTo(0, 0); } catch (e) { /* no window to scroll */ } }
  function bringUp(node) {                       // put a node at the top of the window
    if (!node || !node.scrollIntoView) { toTop(); return; }
    try { node.scrollIntoView({ block: 'start' }); } catch (e) { toTop(); }
  }
  // True for a moment after a view opens: the second click of a double click on the button that
  // opened it must not reach a button that now lies under the pointer ("See the count" would
  // otherwise pass straight through the Chronicle into a new Life).
  function fresh() { return now() - state.viewAt < SETTLE_MS; }
  function showView(name, quiet) {
    cancelTimers();
    state.view = name;
    state.viewAt = quiet ? 0 : now();
    var nodes = document.querySelectorAll('[data-view]'), i;
    for (i = 0; i < nodes.length; i++) nodes[i].hidden = nodes[i].getAttribute('data-view') !== name;
    refitMap();                                  // the view's map can now be measured
    if (!quiet) { toTop(); focusOn($(HEADS[name])); }
  }

  // ---- earlier lives (localStorage, optional) -----------------------------------------------

  function loadLives() {
    var out = [], raw, list, i, e;
    try {
      raw = window.localStorage.getItem(STORE_KEY);
      list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      for (i = 0; i < list.length && out.length < 20; i++) {
        e = list[i];
        if (!e || !isFinite(e.seed) || !isFinite(e.purse) || !isFinite(e.need) || !isFinite(e.mark)) continue;
        out.push({ seed: Number(e.seed), kept: !!e.kept, purse: Number(e.purse), need: Number(e.need), mark: Number(e.mark), seal: !!e.seal });
      }
    } catch (err) { out = []; }
    return out;
  }
  function saveLife(entry) {
    state.lives.unshift(entry);
    if (state.lives.length > 20) state.lives.length = 20;
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state.lives)); } catch (err) { /* storage unavailable: the list lives in memory */ }
  }
  function drawPast(boxId, listId) {
    var box = $(boxId), list = $(listId), i;
    clear(list);
    for (i = 0; i < state.lives.length; i++) list.appendChild(el('li', { text: W.pastLife(state.lives[i]) }));
    box.hidden = !state.lives.length;
  }

  // ---- geometry of the sheet ----------------------------------------------------------------
  // One layout of the valley, used by every view: your holding at the foot inside the bend of
  // the river, four neighbours on an arc across the ford, three holdings beyond the ridge.
  // Positions are fractions of the sheet; two sheet sizes keep lettering legible on a phone.

  var LAYOUT = {
    wide:    { W: 600, H: 450, pw: 44, ph: 30, hb: 10, bound: 6, name: 12, sub: 11, num: 13, note: 11.5, pad: 6, grid: 49, river: 9, water: 6.2, ford: 5.5, lane: 4.2, head: 4.6 },
    compact: { W: 380, H: 300, pw: 36, ph: 25, hb: 8, bound: 5, name: 11, sub: 10, num: 11.5, note: 10.5, pad: 5, grid: 37, river: 7, water: 4.6, ford: 4.6, lane: 3.6, head: 4.2 }
  };
  var POS = [[0.50, 0.845], [0.83, 0.665], [0.67, 0.42], [0.81, 0.165], [0.50, 0.13], [0.19, 0.165], [0.33, 0.42], [0.17, 0.665]];
  var RIVER = [[-0.03, 0.87], [0.10, 0.845], [0.255, 0.80], [0.36, 0.695], [0.50, 0.655], [0.64, 0.695], [0.745, 0.80], [0.90, 0.83], [1.03, 0.80]];
  var RIDGE = [[-0.02, 0.315], [0.12, 0.30], [0.27, 0.31], [0.40, 0.295], [0.50, 0.285], [0.62, 0.30], [0.76, 0.29], [0.90, 0.305], [1.02, 0.295]];
  var BEND = { '0-1': 0.07, '0-7': -0.07, '0-2': 0.05, '0-6': -0.05, '1-2': 0.08, '6-7': 0.08, '1-7': 0.18,
               '1-3': 0.10, '5-7': 0.10, '2-4': 0.10, '4-6': 0.10, '3-5': -0.16 };
  var TIES = (function () {                 // sixteen ties: each house with the two on either side
    var out = [], a, b, d;
    for (a = 0; a < 8; a++) for (b = a + 1; b < 8; b++) {
      d = Math.min(b - a, 8 - (b - a));
      if (d <= 2) out.push({ a: a, b: b, key: a + '-' + b });
    }
    return out;
  })();
  function isFar(id) { return id >= 3 && id <= 5; }

  function dist(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
  function catmull(pts, per) {
    var out = [], i, j, p0, p1, p2, p3, t, t2, t3, k;
    for (i = 0; i < pts.length - 1; i++) {
      p0 = pts[Math.max(0, i - 1)]; p1 = pts[i]; p2 = pts[i + 1]; p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (j = 0; j < per; j++) {
        t = j / per; t2 = t * t; t3 = t2 * t;
        var q = [0, 0];
        for (k = 0; k < 2; k++) {
          q[k] = 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
                 (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t3);
        }
        out.push(q);
      }
    }
    out.push(pts[pts.length - 1].slice());
    return out;
  }
  function quadLine(a, b, k, n) {            // a gently bent path from a to b; k bends it to one side
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
    var cx = mx - dy * k, cy = my + dx * k, out = [], i, t, u;
    for (i = 0; i <= n; i++) {
      t = i / n; u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * cx + t * t * b[0], u * u * a[1] + 2 * u * t * cy + t * t * b[1]]);
    }
    return out;
  }
  function segHit(a, b, c, d) {
    var r0 = b[0] - a[0], r1 = b[1] - a[1], s0 = d[0] - c[0], s1 = d[1] - c[1];
    var den = r0 * s1 - r1 * s0;
    if (Math.abs(den) < 1e-9) return null;
    var t = ((c[0] - a[0]) * s1 - (c[1] - a[1]) * s0) / den, u = ((c[0] - a[0]) * r1 - (c[1] - a[1]) * r0) / den;
    if (t < 0 || t > 1 || u < 0 || u > 1) return null;
    return [a[0] + t * r0, a[1] + t * r1];
  }
  function crossing(line, other) {           // where a tie meets the river: the ford
    var i, j, p;
    for (i = 0; i < line.length - 1; i++) for (j = 0; j < other.length - 1; j++) {
      p = segHit(line[i], line[i + 1], other[j], other[j + 1]);
      if (p) return { i: i, p: p };
    }
    i = Math.floor(line.length * 0.4);
    return { i: i, p: line[i + 1] };
  }
  function trimStart(line, r) {              // drop the part of the line within r of its first point
    var c = line[0], i = 1, k, lo = 0, hi = 1, m, a, b;
    while (i < line.length && dist(line[i], c) < r) i++;
    if (i >= line.length) return line.slice(line.length - 2);
    a = line[i - 1]; b = line[i];
    for (k = 0; k < 7; k++) {
      m = (lo + hi) / 2;
      if (dist([a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m], c) < r) lo = m; else hi = m;
    }
    return [[a[0] + (b[0] - a[0]) * hi, a[1] + (b[1] - a[1]) * hi]].concat(line.slice(i));
  }
  function trimEnd(line, r) { return trimStart(line.slice().reverse(), r).reverse(); }
  function offsetLine(line, d) {             // shift to the right of the direction of travel
    var out = [], i, a, b, dx, dy, len;
    for (i = 0; i < line.length; i++) {
      a = line[Math.max(0, i - 1)]; b = line[Math.min(line.length - 1, i + 1)];
      dx = b[0] - a[0]; dy = b[1] - a[1]; len = Math.sqrt(dx * dx + dy * dy) || 1;
      out.push([line[i][0] - dy / len * d, line[i][1] + dx / len * d]);
    }
    return out;
  }
  function pathD(line) {
    var s = 'M' + f(line[0][0]) + ' ' + f(line[0][1]), i;
    for (i = 1; i < line.length; i++) s += 'L' + f(line[i][0]) + ' ' + f(line[i][1]);
    return s;
  }

  var geoCache = {};
  function geo(kind) {
    if (geoCache[kind]) return geoCache[kind];
    var L = LAYOUT[kind], g = { L: L, pos: [], ties: {}, fords: {} }, i;
    function scaled(list) { return list.map(function (p) { return [p[0] * L.W, p[1] * L.H]; }); }
    g.pos = scaled(POS);
    g.river = catmull(scaled(RIVER), 10);
    g.ridge = catmull(scaled(RIDGE), 8);
    for (i = 0; i < TIES.length; i++) {
      g.ties[TIES[i].key] = quadLine(g.pos[TIES[i].a], g.pos[TIES[i].b], BEND[TIES[i].key] || 0, 40);
    }
    for (i = 0; i < ORDER.length; i++) g.fords[ORDER[i]] = crossing(g.ties['0-' + ORDER[i]], g.river);
    geoCache[kind] = g;
    return g;
  }
  function tieLine(g, from, to) {            // the tie's path, walked from one house to the other
    var line = g.ties[from < to ? from + '-' + to : to + '-' + from];
    return from < to ? line : line.slice().reverse();
  }

  // ---- drawing the map ----------------------------------------------------------------------

  function roundRect(x, y, w, h, r) {
    var a = 'A' + r + ' ' + r + ' 0 0 1 ';
    return 'M' + f(x + r) + ' ' + f(y) + 'H' + f(x + w - r) + a + f(x + w) + ' ' + f(y + r) + 'V' + f(y + h - r) +
           a + f(x + w - r) + ' ' + f(y + h) + 'H' + f(x + r) + a + f(x) + ' ' + f(y + h - r) + 'V' + f(y + r) +
           a + f(x + r) + ' ' + f(y) + 'Z';
  }
  function arrowSVG(pts, L) {                // a hand that arrived: a solid stroke with a head
    var n = pts.length, tip = pts[n - 1], back = pts[Math.max(0, n - 4)];
    var dx = tip[0] - back[0], dy = tip[1] - back[1], len = Math.sqrt(dx * dx + dy * dy) || 1, h = L.head;
    dx /= len; dy /= len;
    var bx = tip[0] - dx * h * 2, by = tip[1] - dy * h * 2;
    return '<path class="m-hand" d="' + pathD(trimEnd(pts, h * 1.6)) + '"/>' +
           '<path class="m-hand-head" d="M' + f(tip[0]) + ' ' + f(tip[1]) + 'L' + f(bx - dy * h) + ' ' + f(by + dx * h) +
           'L' + f(bx + dy * h) + ' ' + f(by - dx * h) + 'Z"/>';
  }
  function barSVG(p, q, half, cls) {         // a short bar through p, square to the direction p -> q
    var dx = q[0] - p[0], dy = q[1] - p[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= len; dy /= len;
    return '<path class="' + cls + '" d="M' + f(p[0] - dy * half) + ' ' + f(p[1] + dx * half) + 'L' + f(p[0] + dy * half) + ' ' + f(p[1] - dx * half) + '"/>';
  }
  function labelAt(g, id, withSub) {         // where a holding's name is lettered
    var L = g.L, c = g.pos[id], gap = L.pw / 2 + L.bound + 4;
    if (id === 2 || id === 6) {
      var x = id === 2 ? c[0] + gap : c[0] - gap, y = withSub ? c[1] - 2 : c[1] + L.name * 0.35;
      return { x: x, y: y, subY: c[1] + L.sub + 1, anchor: id === 2 ? 'start' : 'end' };
    }
    if (isFar(id)) {
      var top = c[1] - L.ph / 2 - L.bound - 4;
      return { x: c[0], y: withSub ? top - L.sub - 1 : top, subY: top, anchor: 'middle' };
    }
    var base = c[1] + L.ph / 2 + L.bound + L.name + 1;
    return { x: c[0], y: base, subY: base + L.sub + 2, anchor: 'middle' };
  }
  function textSVG(cls, x, y, size, anchor, text, id) {
    return '<text class="' + cls + '"' + (id ? ' id="' + id + '"' : '') + ' x="' + f(x) + '" y="' + f(y) + '" font-size="' + size + '"' +
           (anchor && anchor !== 'middle' ? ' style="text-anchor:' + anchor + '"' : '') + '>' + esc(text) + '</text>';
  }

  // One holding: a field parcel with its house. o: { unseen, plain, yours, segs, slot, click, hot, after }
  function holdSVG(g, id, o) {
    var L = g.L, c = g.pos[id], x = c[0] - L.pw / 2, y = c[1] - L.ph / 2, s, k;
    var cls = 'm-hold' + (o.yours ? ' is-yours' : '') + (o.click ? ' is-click' : '') + (o.hot ? ' is-hot' : '');
    s = '<g class="' + cls + '" data-map-house="' + id + '"' + (o.after ? ' id="af-hold-' + id + '"' : '') + '>';
    if (o.unseen) {
      return s + '<rect class="m-parcel is-unseen" x="' + f(x) + '" y="' + f(y) + '" width="' + L.pw + '" height="' + L.ph + '"/></g>';
    }
    var bd = roundRect(x - L.bound, y - L.bound, L.pw + 2 * L.bound, L.ph + 2 * L.bound, 4);
    if (o.slot) s += '<path class="m-bound-slot" d="' + bd + '"/>';
    if (o.segs) {
      for (k = 0; k < 5; k++) {
        if (o.segs[k]) s += '<path class="m-bound" pathLength="100" stroke-dasharray="15 85" stroke-dashoffset="' + (-(k * 20 + 2.5)) + '" d="' + bd + '"/>';
      }
    }
    if (o.after) s += '<path class="m-bound m-bound-full" d="' + bd + '"/>';
    s += '<rect class="m-parcel' + (o.plain || o.after ? ' is-plain' : '') + '" x="' + f(x) + '" y="' + f(y) + '" width="' + L.pw + '" height="' + L.ph + '"/>';
    if (o.after) {
      s += '<rect class="m-fill" id="af-fill-' + id + '" x="' + f(x + 0.6) + '" y="' + f(y + 0.6) + '" width="' + f(L.pw - 1.2) + '" height="' + f(L.ph - 1.2) + '" style="transform:scaleY(0)"/>';
    }
    for (k = 1; k <= 3; k++) {
      s += '<path class="m-furrow" d="M' + f(x + 2) + ' ' + f(y + L.ph * k / 4) + 'H' + f(x + L.pw - 2) + '"/>';
    }
    var hx = x + 3, hy = y + 3, hc = L.hb / 2, hr = L.hb * 0.72;
    s += '<rect class="m-house" x="' + f(hx) + '" y="' + f(hy) + '" width="' + L.hb + '" height="' + L.hb + '"/>';
    s += '<path class="m-diamond" d="M' + f(hx + hc) + ' ' + f(hy + hc - hr) + 'L' + f(hx + hc + hr) + ' ' + f(hy + hc) + 'L' + f(hx + hc) + ' ' + f(hy + hc + hr) + 'L' + f(hx + hc - hr) + ' ' + f(hy + hc) + 'Z"/>';
    if (o.after) s += '<path class="m-tent" d="M' + f(hx + hc) + ' ' + f(hy - 1) + 'L' + f(hx + L.hb + 1.5) + ' ' + f(hy + L.hb) + 'L' + f(hx - 1.5) + ' ' + f(hy + L.hb) + 'Z"/>';
    if (o.click) {
      s += '<rect class="m-hit" x="' + f(x - L.bound - 8) + '" y="' + f(y - L.bound - 8) + '" width="' + f(L.pw + 2 * L.bound + 16) + '" height="' + f(L.ph + 2 * L.bound + L.name + 20) + '"/>';
    }
    return s + '</g>';
  }

  /*
   * mode 'sheet'   the opening: the place, unnamed, with one hand to show the stakes
   *      'day'     o: { names, kin, follow, keeps, hands, kinWith, hot, click }
   *      'leaving' o: { names, kin, follow, keeps }
   *      'after'   o: { kin }; all eight holdings and sixteen ties, filled season by season (drawSeason30)
   */
  function mapSVG(kind, mode, o) {
    var g = geo(kind), L = g.L, labels = W.mapLabels(), s = [], i, id, t, cls, lab, c;
    var after = mode === 'after', clip = 'clip-' + mode;
    var r = L.pw / 2 + L.bound + 3;
    o = o || {};
    s.push('<svg viewBox="0 0 ' + L.W + ' ' + L.H + '" role="img" aria-label="' + esc(W.mapAlt(mode === 'leaving' ? 'day' : mode)) + '" xmlns="http://www.w3.org/2000/svg" focusable="false">');
    s.push('<defs><clipPath id="' + clip + '"><rect x="' + L.pad + '" y="' + L.pad + '" width="' + (L.W - 2 * L.pad) + '" height="' + (L.H - 2 * L.pad) + '"/></clipPath></defs>');
    s.push('<rect class="m-frame" x="' + L.pad + '" y="' + L.pad + '" width="' + (L.W - 2 * L.pad) + '" height="' + (L.H - 2 * L.pad) + '"/>');
    s.push('<rect class="m-frame-outer" x="' + (L.pad - 3.5) + '" y="' + (L.pad - 3.5) + '" width="' + (L.W - 2 * L.pad + 7) + '" height="' + (L.H - 2 * L.pad + 7) + '"/>');
    s.push('<g clip-path="url(#' + clip + ')">');
    for (t = L.pad + L.grid; t < L.W - L.pad - 2; t += L.grid) s.push('<path class="m-gridline" d="M' + f(t) + ' ' + L.pad + 'V' + (L.H - L.pad) + '"/>');
    for (t = L.pad + L.grid; t < L.H - L.pad - 2; t += L.grid) s.push('<path class="m-gridline" d="M' + L.pad + ' ' + f(t) + 'H' + (L.W - L.pad) + '"/>');
    // the ridge, with hachures on its near side
    s.push('<path class="m-ridge" d="' + pathD(g.ridge) + '"/>');
    for (i = 1; i < g.ridge.length - 1; i += 2) {
      var ra = g.ridge[i - 1], rb = g.ridge[i + 1], rdx = rb[0] - ra[0], rdy = rb[1] - ra[1], rl = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
      var hl = (i % 4 === 1 ? 5 : 3.2) * (L.W / 600 * 0.5 + 0.5);
      s.push('<path class="m-hachure" d="M' + f(g.ridge[i][0]) + ' ' + f(g.ridge[i][1] + 1) + 'l' + f(-rdy / rl * hl) + ' ' + f(rdx / rl * hl) + '"/>');
    }
    // the river
    s.push('<path class="m-river-bank" stroke-width="' + L.river + '" d="' + pathD(g.river) + '"/>');
    s.push('<path class="m-river-water" stroke-width="' + L.water + '" d="' + pathD(g.river) + '"/>');
    // ties
    for (i = 0; i < TIES.length; i++) {
      t = TIES[i];
      var farEnds = (isFar(t.a) ? 1 : 0) + (isFar(t.b) ? 1 : 0);
      if (!after && farEnds === 2) continue;                       // ties you never saw
      cls = 'm-tie';
      if (!after && t.a === 0) cls += ' is-mine' + (o.hot === t.b ? ' is-hot' : '');
      if (!after && farEnds === 1) cls += ' is-far';
      s.push('<path class="' + cls + '" data-tie="' + t.key + '" d="' + pathD(g.ties[t.key]) + '"/>');
    }
    s.push('</g>');
    // the ford: where each of your ties meets the river
    for (i = 0; i < ORDER.length; i++) {
      c = g.fords[ORDER[i]].p;
      s.push('<circle class="m-ford" cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + L.ford + '"/>');
    }
    // holdings
    for (id = 0; id < 8; id++) {
      if (after) s.push(holdSVG(g, id, { after: true }));
      else if (isFar(id)) s.push(holdSVG(g, id, { unseen: true }));
      else if (id === 0) s.push(holdSVG(g, id, { yours: true, segs: [true, true, true, true, true] }));
      else if (mode === 'sheet') s.push(holdSVG(g, id, {}));
      else s.push(holdSVG(g, id, { yours: !!(o.keeps && o.keeps[id]), segs: o.follow ? o.follow[id] : null, slot: id === o.kin, click: !!o.click, hot: o.hot === id }));
    }
    // hands
    if (mode === 'sheet') {
      s.push(arrowSVG(offsetLine(trimEnd(trimStart(tieLine(g, 0, 1), r), r), L.lane), L));
    }
    if (mode === 'day' && o.hands) {
      for (i = 0; i < ORDER.length; i++) {
        id = ORDER[i];
        var h = o.hands[id], out = tieLine(g, 0, id), ford = g.fords[id];
        if (!h) continue;
        var toFord = out.slice(0, ford.i + 1).concat([ford.p]);
        var gate = trimStart(out, r + 3);
        if (h.revealed) {
          if (h.arrived) s.push(arrowSVG(offsetLine(trimEnd(trimStart(out, r), r), L.lane), L));
          else if (h.lost) {
            var broken = offsetLine(trimEnd(trimStart(toFord, r), L.ford + 1.5), L.lane);
            s.push('<path class="m-lost" d="' + pathD(broken) + '"/>');
            s.push(barSVG(broken[broken.length - 1], broken[broken.length - 2], L.lane + 1.5, 'm-lost-bar'));
          } else s.push(barSVG(gate[0], gate[1], L.lane + 2.5, 'm-stay'));
          if (h.they) s.push(arrowSVG(offsetLine(trimEnd(trimStart(tieLine(g, id, 0), r), r), L.lane), L));
        } else if (h.plan === true) {
          var stub = offsetLine(trimEnd(trimStart(toFord, r), L.ford + 7), L.lane), tip = stub[stub.length - 1];
          s.push('<path class="m-plan" d="' + pathD(stub) + '"/>');
          s.push('<circle class="m-plan-tip" cx="' + f(tip[0]) + '" cy="' + f(tip[1]) + '" r="' + f(L.lane * 0.85) + '"/>');
        } else if (h.plan === false) s.push(barSVG(gate[0], gate[1], L.lane + 2.5, 'm-stay'));
      }
      if (o.kinWith) {
        for (i = 0; i < o.kinWith.length; i++) {
          var kw = o.kinWith[i];
          if (kw.kinSent) s.push(arrowSVG(offsetLine(trimEnd(trimStart(tieLine(g, o.kin, kw.id), r), r), L.lane), L));
          if (kw.theySent) s.push(arrowSVG(offsetLine(trimEnd(trimStart(tieLine(g, kw.id, o.kin), r), r), L.lane), L));
        }
      }
    }
    // lettering, last so that it stays legible
    if (!after) {
      c = g.pos[4];
      s.push(textSVG('m-note', c[0], c[1] - L.ph / 2 - 6, L.note, 'middle', labels.beyond));
    }
    s.push(textSVG('m-note', L.W * 0.5, g.ridge[Math.floor(g.ridge.length / 2)][1] - 5, L.note, 'middle', labels.ridge));
    s.push(textSVG('m-note is-water', L.W * 0.5, L.H * 0.745, L.note, 'middle', labels.ford));
    for (id = 0; id < 8; id++) {
      if (after) {
        lab = labelAt(g, id, id === o.kin);          // the sister's holding keeps room for its second line
        s.push(textSVG('m-name', lab.x, lab.y, L.name, lab.anchor, '', 'af-name-' + id));
        s.push(textSVG('m-sub', lab.x, lab.subY, L.sub, lab.anchor, '', 'af-sub-' + id));
        c = g.pos[id];
        s.push(textSVG('m-num', c[0] + L.hb / 2 + 1.5, c[1] + L.num * 0.36, L.num, 'middle', '', 'af-num-' + id));
        continue;
      }
      if (isFar(id)) continue;
      if (id === 0) {
        lab = labelAt(g, 0, false);
        s.push(textSVG('m-name', lab.x, lab.y, L.name, lab.anchor, labels.yours.toUpperCase()));
        continue;
      }
      if (mode === 'sheet') continue;
      var isKin = id === o.kin;
      lab = labelAt(g, id, isKin);
      s.push(textSVG('m-name', lab.x, lab.y, L.name, lab.anchor, String(o.names[id]).toUpperCase()));
      if (isKin) s.push(textSVG('m-sub', lab.x, lab.subY, L.sub, lab.anchor, labels.sister));
    }
    if (mode === 'sheet') {                      // the stakes, on the sheet itself
      var demo = tieLine(g, 0, 1);
      var p1 = offsetLine(demo, L.lane + L.num)[Math.floor(demo.length * 0.27)];        // below the path, at your end
      var p2 = offsetLine(demo, -(L.lane + L.num * 0.9))[Math.floor(demo.length * 0.82)];   // above it, at theirs
      s.push(textSVG('m-num', p1[0], p1[1] + L.num * 0.36, L.num, 'middle', W.signed(-1)));
      s.push(textSVG('m-num', p2[0], p2[1] + L.num * 0.36, L.num, 'middle', W.signed(3)));
    }
    s.push('</svg>');
    return s.join('');
  }
  // Which sheet a map is drawn on follows the width of its own box, not of the window: in the
  // two-column day the map has well under half the window. Where the box cannot be measured
  // (its view is hidden) the window decides, and refitMap() corrects it once the view shows.
  var MAP_OF = { opening: 'map-opening', day: 'map-day', leaving: 'map-leaving', afterwards: 'map-after' };
  var mapKinds = {};                             // map id -> the sheet it was last drawn on
  function remPx() {
    var v = 16;
    try { v = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16; } catch (e) { v = 16; }
    return v;
  }
  function sheetFor(node) {
    var w = node && node.clientWidth ? node.clientWidth : 0;
    if (w > 0) return w < 34 * remPx() ? 'compact' : 'wide';
    return mqCompact.matches ? 'compact' : 'wide';
  }
  function mapKind(id) { mapKinds[id] = sheetFor($(id)); return mapKinds[id]; }
  function drawOpeningMap() { $('map-opening').innerHTML = mapSVG(mapKind('map-opening'), 'sheet', {}); }
  function drawLeavingMap() {
    $('map-leaving').innerHTML = mapSVG(mapKind('map-leaving'), 'leaving', { names: names(), kin: state.life.kin, follow: state.follow, keeps: state.keeps });
  }
  function drawAfterMap() {
    var a = state.after;
    $('map-after').innerHTML = mapSVG(mapKind('map-after'), 'after', { kin: state.life.kin });
    if (a && a.shown > 0) drawSeason30(a.shown);
    if (a && a.done) drawFinalWays();
  }
  function drawViewMap() {                       // the map of the view on screen, again
    if (state.view === 'opening') { drawOpeningMap(); return; }
    if (!state.life) return;
    if (state.view === 'day') drawDayMap();
    else if (state.view === 'leaving') drawLeavingMap();
    else if (state.view === 'afterwards' && state.after) drawAfterMap();
  }
  function refitMap() {                          // after a view shows or the window changes size
    var id = MAP_OF[state.view], node = id ? $(id) : null;
    if (!node || !(node.clientWidth > 0) || sheetFor(node) === mapKinds[id]) return;
    drawViewMap();
  }

  // ---- drawn keys ---------------------------------------------------------------------------

  function keySVG(kind) {
    var w = 30, h = 14, b = '';
    if (kind === 'arrived') b = '<path class="key-line" d="M2 7H19"/><path class="key-head" d="M27 7l-7.5 -3.8v7.6z"/>';
    else if (kind === 'turned') b = '<path class="key-lost" d="M2 7H16"/><path class="key-ink" d="M18.5 3v8"/><path class="key-river" d="M24.5 0.5q-2.2 3.2 0 6.5t0 6.5"/>';
    else if (kind === 'planned') b = '<path class="key-ink" d="M2 7H16"/><circle class="key-open" cx="20.5" cy="7" r="3.3"/>';
    else if (kind === 'home') b = '<path class="key-tie" d="M2 7H28"/><path class="key-ink" d="M11 2.5v9"/>';
    else if (kind === 'follows') b = '<path class="key-yours" pathLength="100" stroke-dasharray="15 5" stroke-dashoffset="-2.5" d="' + roundRect(3, 2, 24, 10, 3) + '"/>';
    else if (kind === 'help') b = '<rect class="key-parcel" x="4" y="1.5" width="22" height="11"/><rect class="key-fill" x="4.6" y="6.5" width="20.8" height="5.4"/>';
    else if (kind === 'income') b = '<text class="key-text" x="15" y="11" font-size="11" text-anchor="middle">' + esc(W.num(21)) + '</text>';
    else if (kind === 'keeps') b = '<path class="key-yours" d="' + roundRect(3, 1.5, 24, 11, 3) + '"/><path class="key-diamond" d="M15 3.2l3.8 3.8l-3.8 3.8l-3.8 -3.8z"/>';
    else if (kind === 'newcomer') { b = '<path class="key-square" d="M15 2l5.5 10h-11z"/>'; }
    else {
      w = 14;
      if (kind === 'held') b = '<rect class="key-held" x="3" y="3" width="8" height="8"/>';
      else if (kind === 'fell') b = '<rect class="key-fell" x="3" y="3" width="8" height="8"/>';
      else if (kind === 'sent') b = '<circle class="key-sent" cx="7" cy="7" r="3.6"/>';
      else if (kind === 'stayed') b = '<circle class="key-stayed" cx="7" cy="7" r="3.6"/>';
      else if (kind === 'fresh') b = '<circle class="key-stayed" cx="7" cy="5.5" r="3.4"/><path class="key-ink" d="M2.8 12.6h8.4"/>';
      else if (kind === 'ghost') b = '<circle class="key-ghost" cx="7" cy="7" r="3.6"/>';
      else if (kind === 'diamond') b = '<path class="key-diamond" d="M7 2.2l4.8 4.8l-4.8 4.8l-4.8 -4.8z"/>';
    }
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true" focusable="false">' + b + '</svg>';
  }
  function legendInto(node, items, withHead) {
    clear(node);
    if (withHead) node.appendChild(el('span', { class: 'legend-head', text: W.legendHead() }));
    for (var i = 0; i < items.length; i++) {
      node.appendChild(el('span', { class: 'legend-item' }, [
        items[i][0] ? el('span', { html: keySVG(items[i][0]) }) : null,
        el('span', { text: items[i][1] })
      ]));
    }
  }
  function exchangeGlyph(r) {                    // the day's dealing in miniature: you, the river, them
    var b = '<path class="key-river" d="M29 1q-2.6 5.5 0 11t0 11"/>' +
            '<path class="key-diamond" d="M8 7.5l4.5 4.5l-4.5 4.5l-4.5 -4.5z"/>' +
            '<rect class="key-square" x="46.5" y="8" width="8" height="8"/>';
    if (r.arrived) b += '<path class="key-line" d="M17 7H37"/><path class="key-head" d="M44 7l-7.5 -3.8v7.6z"/>';
    else if (r.lost) b += '<path class="key-lost" d="M17 7H26"/><path class="key-ink" d="M27.2 3.2v7.6"/>';
    else b += '<path class="key-ink" d="M17.5 3.2v7.6"/>';
    if (r.they) b += '<path class="key-line" d="M42 17H22"/><path class="key-head" d="M15 17l7.5 -3.8v7.6z"/>';
    return '<svg width="58" height="24" viewBox="0 0 58 24" aria-hidden="true" focusable="false">' + b + '</svg>';
  }

  // ---- shared pieces: the store meter, a row of your ways -----------------------------------

  function meterInto(node, purse, need) {
    clear(node);
    var max = Math.max(need + Math.max(6, Math.round(need * 0.12)), purse + 3), t;
    var bar = el('div', { class: 'meter-bar' });
    bar.appendChild(el('span', { class: 'meter-fill', style: 'width:' + (clamp(purse, 0, max) / max * 100).toFixed(2) + '%' }));
    for (t = 10; t < max; t += 10) {
      bar.appendChild(el('span', { class: 'meter-ten' + (t >= purse ? ' is-beyond' : ''), style: 'left:' + (t / max * 100).toFixed(2) + '%' }));
    }
    node.appendChild(bar);
    node.appendChild(el('span', { class: 'meter-need' + (purse >= need ? ' is-met' : ''), style: 'left:' + (need / max * 100).toFixed(2) + '%' },
      [el('span', { text: W.storeNeedTick(need) })]));
  }
  function titles() { return A.ways(state.life).map(function (w) { return w.title; }); }
  // way: one entry of ways(); o: { newDay, ghosts, hot, note, hollow }
  function wayRow(way, o) {
    var kin = state.life.kin, marks = el('span', { class: 'way-marks', 'aria-hidden': 'true' }), i, d, cls, prev = null;
    for (i = 0; i < way.deeds.length; i++) {
      d = way.deeds[i];
      cls = 'm' + (d.helped ? ' is-sent' : '') + (d.day === o.newDay ? ' is-new' : '') + (prev !== null && d.day !== prev ? ' is-daygap' : '');
      marks.appendChild(el('i', { class: cls, title: W.deed(d, way.situation, kin) }));
      prev = d.day;
    }
    for (i = 0; o.ghosts && i < o.ghosts.length; i++) {
      marks.appendChild(el('i', { class: 'm is-ghost' + (o.ghosts[i] ? ' is-sent' : '') + (i === 0 && prev !== null ? ' is-daygap' : '') }));
    }
    var empty = !way.n && !(o.ghosts && o.ghosts.length);
    return el('div', { class: 'way-row' + (empty ? ' is-empty' : '') + (o.hot ? ' is-hot' : '') + (o.hollow ? ' is-hollow' : ''), 'data-sit': String(way.situation) }, [
      el('span', { class: 'way-title', text: way.title }),
      marks,
      el('span', { class: 'way-count', text: o.note || W.wayCount(way.h, way.n) })
    ]);
  }
  function followNow() {                         // which habits of each neighbour came from you
    var out = {}, i, s, src;
    for (i = 0; i < ORDER.length; i++) {
      src = state.life.houses[ORDER[i]].source; out[ORDER[i]] = [];
      for (s = 0; s < 5; s++) out[ORDER[i]].push(!!(src && src[s] && src[s].type === 'you'));
    }
    return out;
  }
  // Which neighbours run your ways as a whole: the label the Afterwards opens with (way 0, or
  // the sister's). It also covers a house that took your ways up from another house, which has
  // no habit learned from you directly. The sister's house counts once it has learned from you.
  function keepsNow() {
    var out = {}, kin = state.life.kin, follow = followNow(), i, id, way;
    for (i = 0; i < ORDER.length; i++) {
      id = ORDER[i]; way = state.life.houses[id].way;
      out[id] = (way === 0 || way === kin) && (id !== kin || follow[id].indexOf(true) >= 0);
    }
    return out;
  }
  function names() { return state.life.houses.map(function (h) { return h.name; }); }

  // ---- opening ------------------------------------------------------------------------------

  function fillStatic() {
    var op = W.opening(), ul = $('opening-lines'), H = W.heads(), i;
    setText('h-opening', op.title); setText('opening-premise', op.premise); setText('begin', op.begin);
    clear(ul);
    for (i = 0; i < op.lines.length; i++) ul.appendChild(el('li', { text: op.lines[i] }));
    setText('opening-past-head', W.pastHead()); setText('chron-past-head', W.pastHead());
    setText('store-head', W.storeHead()); setText('h-ways', W.waysHead()); setText('h-elsewhere', W.elsewhereHead());
    setText('ford-note', W.fordNote()); setText('day-last', W.lastDayNote());
    setText('h-leaving', W.leavingHead()); setText('h-leave', W.leaveHead()); setText('leave', W.leaveButton());
    setText('h-after', W.afterHead()); setText('skip', W.skip()); setText('h-ticker', W.tickerHead()); setText('to-chronicle', W.seeCount());
    setText('h-chronicle', W.chronicleHead()); setText('h-chron-house', H.house); setText('h-chron-valley', H.valley);
    setText('h-chron-range', H.range); setText('h-chron-last', H.lastDay); setText('h-chron-mattered', H.mattered);
    setText('h-chron-became', H.became); setText('chron-became-sub', H.becameSub);
    setText('again', W.again()); setText('again-same', W.againSame());
    var ld = W.legendDay(), la = W.legendAfter(), lm = W.legendMarks(), fl = W.flowLabels();
    setText('map-day-key-head', W.legendHead());
    legendInto($('map-day-legend'), [['arrived', ld.arrived], ['turned', ld.turned], ['planned', ld.planned], ['home', ld.home], ['follows', ld.yours], ['diamond', ld.keeps], [null, W.mapHint()]], false);
    foldKey();
    drawWaysLegend(false, 1);
    legendInto($('map-after-legend'), [['help', la.help], ['income', la.income], ['keeps', la.yours], ['newcomer', la.newcomer]], true);
    legendInto($('chron-rows-legend'), [['held', lm.held], ['fell', lm.fell]], false);
    setText('flow-head', fl.head);
    $('flow-strip').setAttribute('aria-label', fl.head);
  }
  function foldKey() {                           // the day map's key: open where there is width for it
    var key = $('map-day-key');
    if (key) key.open = mqWide.matches;
  }
  function drawOpening() {
    drawOpeningMap();
    var note = $('opening-valley');
    if (state.fixedSeed !== null) {
      var n = null;
      try { n = A.createLife(state.fixedSeed).seed; } catch (e) { n = null; }
      if (n === null) state.fixedSeed = null;
      else note.textContent = W.valleyNo(n);
    }
    note.hidden = state.fixedSeed === null;
    drawPast('opening-past', 'opening-past-list');
  }
  function readHash() {
    var m = /^#valley-([A-Za-z0-9-]+)$/.exec(String(window.location && window.location.hash || ''));
    state.fixedSeed = m ? m[1] : null;
  }
  function randomSeed() {
    var n;
    try { var a = new Uint32Array(1); window.crypto.getRandomValues(a); n = a[0]; }
    catch (e) { n = Math.floor(Math.random() * 4294967296); }
    return 1 + (n % 99999);
  }

  // ---- a Life -------------------------------------------------------------------------------

  function beginLife(seedIn) {
    cancelTimers();
    var life = A.createLife(seedIn);
    state.life = life; state.seed = life.seed;
    state.choices = []; state.result = null; state.youMark = null; state.knowOpen = {};
    state.future = null; state.after = null; state.job = null; state.verdict = null; state.saved = false;
    startDay();
    showView('day');
  }
  function startDay() {
    state.phase = 'choose'; state.pending = {}; state.flipped = {}; state.thirdOpen = {}; state.result = null; state.hot = null;
    state.today = A.today(state.life);
    state.follow = followNow(); state.keeps = keepsNow();
    drawDay();
  }
  function noteYou(result) {                     // remember where a habit learned from you first shows
    var i;
    if (state.youMark) return;
    for (i = 0; i < result.results.length; i++) {
      if (result.results[i].why.source.type === 'you') { state.youMark = { day: result.day, key: String(result.results[i].id) }; return; }
    }
    for (i = 0; i < result.kinWith.length; i++) {
      if (result.kinWith[i].why.source.type === 'you') { state.youMark = { day: result.day, key: 'kin-' + result.kinWith[i].id }; return; }
    }
  }
  function isMarked(key) {
    return !!(state.youMark && state.result && state.youMark.day === state.result.day && state.youMark.key === key);
  }
  function chosenCount() {
    var n = 0, i;
    for (i = 0; i < ORDER.length; i++) if (typeof state.pending[ORDER[i]] === 'boolean') n++;
    return n;
  }

  // ---- the day ------------------------------------------------------------------------------

  function drawDay() {
    var t = state.today, r = state.result, revealed = state.phase !== 'choose';
    var purse = revealed ? r.purse : t.purse;
    setText('h-day', W.dayOf(t.day));
    $('day-last').hidden = t.day !== 12;
    setText('day-valley', W.valleyNo(state.seed));
    drawTrack(t.day);
    setText('store-text', W.store(purse, t.need));
    meterInto($('store-meter'), purse, t.need);
    setText('store-old', W.oldWay(t.oldWayPurse));
    drawCards();
    drawSeason();
    drawElsewhere();
    drawStatus();
    drawActions();
    drawWays();
    drawDayMap();
  }
  function drawTrack(day) {
    var node = $('day-track'), s, k, d, box;
    clear(node);
    node.setAttribute('aria-label', W.dayTrackAlt(day));
    for (s = 0; s < 3; s++) {
      box = el('div', { class: 'track-season' });
      for (k = 1; k <= 4; k++) {
        d = s * 4 + k;
        box.appendChild(el('span', { class: 'track-day' + (d < day ? ' is-spent' : d === day ? ' is-today' : '') }));
      }
      node.appendChild(box);
    }
  }
  function drawStatus() {
    var node = $('day-status'), r = state.result;
    clear(node);
    if (state.phase === 'choose') {
      node.className = 'status';
      // the day is named here too: in one column "Next day" brings the reader to this line, below the header
      node.appendChild(el('span', { class: 'status-day', text: W.statusDay(state.today.day) + ' ' }));
      node.appendChild(el('span', { text: W.chooseLine() }));
    } else {
      node.className = 'status is-total';
      node.appendChild(el('span', { text: W.dayTotal(r.gained, r.purse, r.need) }));
    }
  }
  function drawActions() {
    var close = $('close-day'), next = $('next-day'), r = state.result, left;
    if (state.phase === 'choose') {
      left = 4 - chosenCount();
      close.hidden = false; close.disabled = left > 0; close.textContent = W.closeDay(left);
      next.hidden = true; next.disabled = true;
    } else {
      close.hidden = true; close.disabled = true;
      next.hidden = false; next.disabled = false;
      if (state.phase === 'revealed') next.textContent = W.nextDay(r.lookingRound ? 'season' : r.over ? 'leave' : 'day');
      else next.textContent = W.nextDay(r.over ? 'leave' : 'day');
    }
  }
  function drawWays() {
    var ws = A.ways(state.life), node = $('ways-rows'), t = state.today, revealed = state.phase !== 'choose';
    var ghosts = [[], [], [], [], []], hotSit = -1, i, s, n;
    if (!revealed) {
      for (i = 0; i < t.neighbours.length; i++) {
        n = t.neighbours[i];
        if (typeof state.pending[n.id] === 'boolean') ghosts[n.situation].push(state.pending[n.id]);
        if (state.hot === n.id) hotSit = n.situation;
      }
    }
    clear(node);
    for (s = 0; s < 5; s++) node.appendChild(wayRow(ws[s], { newDay: revealed ? t.day : t.day - 1, ghosts: ghosts[s], hot: hotSit === s }));
    drawWaysLegend(revealed, t.day);
  }
  // The key says what the marks are at this point of the day: the underlined ones are
  // yesterday's until the day is closed and today's after; the dashed ones are today's, planned.
  function drawWaysLegend(revealed, day) {
    var lw = W.legendWays(), items = [['sent', lw.sent], ['stayed', lw.stayed]];
    if (revealed) items.push(['fresh', lw.today]);
    else {
      if (day > 1) items.push(['fresh', lw.yesterday]);
      items.push(['ghost', lw.planned]);
    }
    legendInto($('ways-legend'), items, false);
  }
  function drawDayMap() {
    var t = state.today, r = state.result, hands = {}, i, id, x;
    if (state.phase === 'choose') {
      for (i = 0; i < ORDER.length; i++) { id = ORDER[i]; if (typeof state.pending[id] === 'boolean') hands[id] = { plan: state.pending[id] }; }
    } else if (state.phase === 'revealed') {
      for (i = 0; i < r.results.length; i++) { x = r.results[i]; hands[x.id] = { revealed: true, arrived: x.arrived, lost: x.lost, they: x.they }; }
    }
    $('map-day').innerHTML = mapSVG(mapKind('map-day'), 'day', {
      names: names(), kin: state.life.kin, follow: state.follow, keeps: state.keeps, hands: hands,
      kinWith: state.phase === 'revealed' ? r.kinWith : null,
      hot: state.hot, click: state.phase === 'choose'
    });
  }

  // cards -------------------------------------------------------------------------------------

  function linesNode(lines) {
    var box = el('div', { class: 'back-lines' }), i, ln, cls;
    for (i = 0; i < lines.length; i++) {
      ln = lines[i];
      cls = ln.kind === 'deed' ? 'is-deed' + (ln.sent ? ' is-sent' : '') : ln.kind === 'more' ? 'is-more' : ln.kind === 'lead' ? 'is-from-you' : null;
      box.appendChild(el('p', { class: cls, text: ln.text }));
    }
    return box;
  }
  // key: where the first habit learned from you is marked (see noteYou); attrs: the control's own
  // hook, data-why="<id>" on a card and data-why-kin="<id>" under "Elsewhere today".
  function whyButton(key, attrs) {
    attrs.type = 'button';
    attrs['class'] = 'why-btn' + (isMarked(key) ? ' is-marked' : '');
    return el('button', attrs, [
      isMarked(key) ? el('span', { class: 'why-mark', 'aria-hidden': 'true' }) : null,
      el('span', { text: W.whyLabel() })
    ]);
  }
  function optionNode(n, value, checked, disabled) {
    var send = value === 'send';
    return el('label', { class: 'opt ' + (send ? 'is-send' : 'is-stay') + (disabled ? ' is-disabled' : '') }, [
      el('input', { type: 'radio', name: 'choice-' + n.id, id: 'choice-' + n.id + '-' + value, value: value, checked: checked, disabled: disabled }),
      el('span', { class: 'opt-face' }, [
        el('span', { class: 'glyph' + (send ? ' is-sent' : ''), 'aria-hidden': 'true' }),
        el('span', { text: send ? W.send() : W.stay() })
      ])
    ]);
  }
  // "What you know of them" is open where the window has height to spare and folded elsewhere,
  // unless the reader has opened or closed this house's by hand.
  function knowIsOpen(id) {
    var v = state.knowOpen[id];
    return typeof v === 'boolean' ? v : mqRoomy.matches;
  }
  function knowRow(tag, s, t, today) {
    var row = el(tag, { class: 'know-row' + (t.n ? '' : ' is-unseen') + (today ? ' is-today' : '') }, [
      el('span', { class: 'know-label', text: W.knowLabel(s) }),
      el('span', { text: W.knowValue(t.h, t.n) })
    ]);
    if (t.n) row.style.setProperty('--share', String(Math.round(t.h / t.n * 100)));
    return row;
  }
  // Two nodes: the whole section behind its toggle, and its short form, which the style sheet
  // shows while the section is closed on cards that sit two by two: the one row for the
  // situation the neighbour is in today (with the note that the count restarted, if it did).
  function knowNodes(n) {
    var changed = n.changedDay !== null, tallies = changed ? n.seenSince : n.seen, theirs = MIRROR[n.situation], s;
    var det = el('details', { class: 'know', 'data-know': String(n.id) });
    det.open = knowIsOpen(n.id);
    det.appendChild(el('summary', { text: W.knowHead() }));
    if (changed) det.appendChild(el('p', { class: 'know-changed', text: W.knowChanged(n.changedDay) }));
    var rows = el('ul', { class: 'know-rows' });
    for (s = 0; s < 5; s++) rows.appendChild(knowRow('li', s, tallies[s], s === theirs));
    det.appendChild(rows);
    det.appendChild(el('p', { class: 'know-foot', text: W.knowFoot() }));
    var now = el('div', { class: 'know-now' }, [
      changed ? el('p', { class: 'know-changed', text: W.knowChanged(n.changedDay) }) : null,
      knowRow('div', theirs, tallies[theirs], true)
    ]);
    return [det, now];
  }
  function cardNode(n, i, r) {
    var cardNames = W.cardName(n), id = n.id, revealed = !!r, choice, front, back = null, y, heads, know, since;
    front = el('div', { class: 'card-face card-front' });
    front.appendChild(el('div', { class: 'card-head' }, [
      el('div', { class: 'card-names' }, [
        el('h3', { class: 'card-title', text: cardNames[0] }),
        cardNames[1] ? el('p', { class: 'card-sub', text: cardNames[1] }) : null
      ]),
      el('span', { class: 'bearing', title: W.bearing(i), 'aria-hidden': 'true', text: W.bearingShort(i) })
    ]));
    if (!revealed) {
      front.appendChild(el('p', { class: 'card-yesterday', text: W.yesterday(n.yesterday) }));
      front.appendChild(el('p', { class: 'card-way', text: W.wayHere(n.situationTitle) }));
      choice = state.pending[id];
    } else {
      var rv = W.reveal(r);
      front.appendChild(el('div', { class: 'card-result' }, [
        el('span', { class: 'result-glyph', html: exchangeGlyph(r) }),
        el('span', { class: 'result-num', text: rv.number }),
        whyButton(String(id), { 'data-why': String(id) }),
        el('p', { class: 'result-text', text: rv.text })
      ]));
      choice = r.intended;
    }
    front.appendChild(el('fieldset', { class: 'choice' }, [
      el('legend', { class: 'vh', text: W.choiceLegend(n) }),
      el('div', { class: 'choice-row' }, [
        optionNode(n, 'send', choice === true, revealed),
        optionNode(n, 'stay', choice === false, revealed)
      ])
    ]));
    know = knowNodes(n);
    front.appendChild(know[0]); front.appendChild(know[1]);
    if (revealed) {
      // for a house that has changed a way the back counts as the front does: since that change
      since = n.changedDay !== null ? { changedDay: n.changedDay, seen: n.seenSince[r.why.situation] } : null;
      y = W.why(r, state.life.kin, since); heads = W.whyHeads();
      back = el('div', { class: 'card-face card-back', inert: true, 'aria-hidden': 'true' }, [
        el('h4', { class: 'back-title', tabindex: '-1', text: y.title }),
        el('p', { class: 'label', text: heads.where }),
        el('p', { class: 'back-where', text: y.where }),
        el('p', { class: 'label', text: heads.source }),
        linesNode(y.lines),
        el('span', { class: 'back-gap' }),
        el('button', { type: 'button', class: 'why-back', 'data-why-back': String(id), text: W.whyBack() })
      ]);
    }
    return el('article', { class: 'card' + (state.hot === id ? ' is-hot' : ''), 'data-house': String(id) },
      [el('div', { class: 'card-inner' }, [front, back])]);
  }
  function drawCards() {
    var node = $('cards'), t = state.today, i;
    clear(node);
    node.hidden = state.phase === 'season';      // at the season's end the day's cards stay in the page, out of sight
    for (i = 0; i < t.neighbours.length; i++) {
      node.appendChild(cardNode(t.neighbours[i], i, state.phase === 'choose' ? null : state.result.results[i]));
    }
  }
  function cardOf(id) { return $('cards').querySelector('[data-house="' + id + '"]'); }
  function setInert(node, on) {
    if (!node) return;
    if (on) { node.setAttribute('inert', ''); node.setAttribute('aria-hidden', 'true'); }
    else { node.removeAttribute('inert'); node.removeAttribute('aria-hidden'); }
  }
  function flip(id, on) {                        // turn a card over, or back
    var card = cardOf(id);
    if (!card || state.phase !== 'revealed') return;
    var front = card.querySelector('.card-front'), back = card.querySelector('.card-back');
    if (!back) return;
    state.flipped[id] = on;
    card.classList.toggle('is-flipped', on);
    setInert(front, on); setInert(back, !on);
    focusOn(on ? back.querySelector('.back-title') : front.querySelector('.why-btn'));
  }

  function drawElsewhere() {
    var sec = $('elsewhere'), body = $('elsewhere-body'), r = state.result, i, e, key, open, y, heads, row;
    clear(body);
    if (state.phase !== 'revealed' || !r || !r.kinWith.length) { sec.hidden = true; return; }
    heads = W.whyHeads();
    for (i = 0; i < r.kinWith.length; i++) {
      e = r.kinWith[i];
      row = el('div', { class: 'else-line' }, [el('p', { text: W.elsewhere(e) })]);
      body.appendChild(row);
      if (e.why.source.type !== 'you') continue;
      key = 'kin-' + e.id; open = !!state.thirdOpen[key];
      row.appendChild(whyButton(key, { 'data-why-kin': String(e.id), 'aria-expanded': open ? 'true' : 'false', 'aria-controls': 'else-why-' + e.id }));
      y = W.whyThird(e, state.life.houses[state.life.kin].name, state.life.kin);
      body.appendChild(el('div', { class: 'else-why', id: 'else-why-' + e.id, hidden: !open }, [
        el('p', { class: 'label', text: y.title }),
        el('p', { class: 'back-where', text: y.where }),
        linesNode(y.lines)
      ]));
    }
    sec.hidden = false;
  }
  function listNode(items, cls) {
    var ul = el('ul', { class: cls }), i;
    for (i = 0; i < items.length; i++) ul.appendChild(el('li', { text: items[i] }));
    return ul;
  }
  function drawSeason() {
    var sec = $('season-end'), body = $('season-body');
    clear(body);
    if (state.phase !== 'season') { sec.hidden = true; return; }
    var se = W.seasonEnd(state.result.lookingRound, state.life.kin, titles());
    setText('h-season', se.head);
    body.appendChild(el('p', { class: 'small', text: se.intro }));
    body.appendChild(el('p', { class: 'season-kin', text: se.kin }));
    if (se.changes.length) body.appendChild(listNode(se.changes, 'season-list is-yours'));
    if (se.houses.length) body.appendChild(listNode(se.houses, 'season-list'));
    sec.hidden = false;
  }

  // what the reader does in the day ------------------------------------------------------------

  function choose(id, send, fromMap) {
    if (state.view !== 'day' || state.phase !== 'choose' || ORDER.indexOf(id) < 0) return;
    state.pending[id] = !!send;
    if (fromMap) {
      var a = $('choice-' + id + '-send'), b = $('choice-' + id + '-stay');
      if (a) a.checked = !!send;
      if (b) b.checked = !send;
    }
    drawActions(); drawWays(); drawDayMap();
  }
  function setHot(id) {
    if (state.hot === id) return;
    state.hot = id;
    var cards = $('cards').querySelectorAll('.card'), i, hid;
    for (i = 0; i < cards.length; i++) {
      hid = Number(cards[i].getAttribute('data-house'));
      cards[i].classList.toggle('is-hot', hid === id);
    }
    var holds = $('map-day').querySelectorAll('.m-hold');
    for (i = 0; i < holds.length; i++) holds[i].classList.toggle('is-hot', id !== null && Number(holds[i].getAttribute('data-map-house')) === id);
    var ties = $('map-day').querySelectorAll('.m-tie');
    for (i = 0; i < ties.length; i++) ties[i].classList.toggle('is-hot', id !== null && ties[i].getAttribute('data-tie') === '0-' + id);
    if (state.phase === 'choose') {
      var sit = -1, rows = $('ways-rows').querySelectorAll('.way-row');
      for (i = 0; i < state.today.neighbours.length; i++) if (state.today.neighbours[i].id === id) sit = state.today.neighbours[i].situation;
      for (i = 0; i < rows.length; i++) rows[i].classList.toggle('is-hot', Number(rows[i].getAttribute('data-sit')) === sit);
    }
  }
  function closeDay() {
    var list = [], i;
    if (state.view !== 'day' || state.phase !== 'choose') return;      // a day closes once
    for (i = 0; i < ORDER.length; i++) {
      if (typeof state.pending[ORDER[i]] !== 'boolean') return;
      list.push(state.pending[ORDER[i]]);
    }
    state.phase = 'revealed';
    state.phaseAt = now();
    state.choices.push(list);
    state.result = A.playDay(state.life, list);
    state.hot = null;
    noteYou(state.result);
    drawDay();
    focusOn($('next-day'));
    var status = $('day-status');
    if (status.scrollIntoView) { try { status.scrollIntoView({ block: 'nearest' }); } catch (e) { /* older engines */ } }
  }
  // "Next day" appears where "Close the day" was, and carries "Season's end" and then "Next day"
  // in turn. The second click of a double click (or a key held down) must not land on it and
  // pass over the reveal or the season's end: what has just appeared stands for a moment first,
  // and a click inside that moment is refused (state.phaseAt is set where the button changes).
  function nextDay() {
    if (state.view !== 'day' || state.phase === 'choose') return;
    if (now() - state.phaseAt < SETTLE_MS) return;
    if (state.phase === 'revealed' && state.result.lookingRound) {
      state.phase = 'season';
      state.phaseAt = now();
      state.follow = followNow(); state.keeps = keepsNow();     // the map now shows what was taken up
      drawDay();
      focusOn($('h-season'));
      var sec = $('season-end');
      if (sec.scrollIntoView) { try { sec.scrollIntoView({ block: 'nearest' }); } catch (e) { /* older engines */ } }
      return;
    }
    if (state.result.over) { showLeaving(false); return; }
    startDay();
    if (mqTwo.matches) toTop();
    else bringUp($('day-status'));               // in one column the cards are far down: stay with them
    focusOn($('h-day'));
  }

  // ---- leaving ------------------------------------------------------------------------------

  function showLeaving(quiet) {
    var life = state.life, t = A.today(life), lg = A.legacy(life), ws = A.ways(life), rows = $('leaving-ways'), s, count = 0;
    setText('leaving-store', W.leavingStore(t.purse, t.need));
    meterInto($('leaving-meter'), t.purse, t.need);
    clear(rows);
    for (s = 0; s < 5; s++) {
      rows.appendChild(wayRow(ws[s], { newDay: -1, hollow: !!lg.hollow[s], note: W.leaveNote(ws[s].h, ws[s].n, lg.hollow[s], lg.heir[s]) }));
      if (lg.kin.fromYou[s]) count++;
    }
    setText('leaving-kin', W.kinFollows(count));
    state.follow = followNow(); state.keeps = keepsNow();
    drawLeavingMap();
    showView('leaving', quiet);
  }

  // ---- the Afterwards -----------------------------------------------------------------------

  function startAfterwards(skipNow, quiet) {
    var life = state.life;
    if (!life || !life.over) return;
    state.future = A.runFuture(life, 0);
    state.job = A.verdictJob(life);
    state.verdict = null;
    state.after = { t0: now(), shown: 0, done: false, lines: W.futureLines(state.future, life.kin), told: 0, quiet: !!quiet };
    showView('afterwards', quiet);
    buildAfter();
    if (skipNow || mqStill.matches) finishAfter();
    else { every(tickAfter, 100); tickAfter(); pump(); }
  }
  function buildAfter() {
    var fl = W.flowLabels(), strip = $('flow-strip'), axis = $('flow-axis'), i, col;
    setText('after-one', W.oneFuture(state.job.futures));
    setText('after-season', W.seasonCount(1));
    drawAfterMap();
    clear(strip); clear(axis);
    for (i = 1; i <= 30; i++) {
      col = el('span', { class: 'flow-col is-waiting' + (i > 20 ? ' is-late' : ''), id: 'flow-col-' + i }, [el('i')]);
      strip.appendChild(col);
    }
    strip.appendChild(el('span', { class: 'flow-half', style: 'bottom:' + (0.5 / 1.05 * 100).toFixed(2) + '%' }, [el('span', { text: fl.half })]));
    axis.appendChild(el('span', { style: 'grid-column:1', text: '1' }));
    axis.appendChild(el('span', { style: 'grid-column:10', text: '10' }));
    axis.appendChild(el('span', { style: 'grid-column:20', text: '20' }));
    axis.appendChild(el('span', { class: 'flow-late', style: 'grid-column:21 / 31', text: fl.late }));
    clear($('ticker'));
    $('after-end').hidden = true;
    $('after-counting').hidden = true;
    $('skip').hidden = false; $('skip').disabled = false;
    $('to-chronicle').hidden = true; $('to-chronicle').disabled = true;
  }
  function drawSeason30(upTo) {                  // the map as it stands in season `upTo` (1..30)
    var life = state.life, fut = state.future, S = fut.seasons[upTo - 1], labels = W.mapLabels(), j, h, hold, isNew, node;
    for (j = 0; j < 8; j++) {
      h = S.houses[j];
      isNew = !!(fut.arrival && fut.arrival.house === j && fut.arrival.season <= S.season);
      hold = $('af-hold-' + j);
      if (!hold) continue;
      hold.classList.toggle('is-yours', h.way === 0 || h.way === life.kin);
      hold.classList.toggle('is-new', isNew);
      node = $('af-fill-' + j); if (node) node.style.transform = 'scaleY(' + clamp(h.helpRate, 0, 1).toFixed(3) + ')';
      node = $('af-num-' + j); if (node) node.textContent = W.num(h.income);
      node = $('af-name-' + j); if (node) node.textContent = j === 0 ? labels.heir.toUpperCase() : String(h.name).toUpperCase();
      node = $('af-sub-' + j); if (node) node.textContent = j === life.kin && !isNew ? labels.sister : '';
    }
  }
  // The resting map: whose ways each house runs after the last Looking-Round, which is what
  // the closing line counts. (Season 30's own frame is the valley before that Looking-Round.)
  function drawFinalWays() {
    var fut = state.future, kin = state.life.kin, j, hold;
    for (j = 0; j < 8; j++) {
      hold = $('af-hold-' + j);
      if (hold) hold.classList.toggle('is-yours', fut.finalWay[j] === 0 || fut.finalWay[j] === kin);
    }
  }
  function showSeasons(upTo) {                   // bring the page up to season `upTo`
    var a = state.after, fut = state.future, ticker = $('ticker'), s, col, flow, ln;
    if (!a || upTo <= a.shown) return;
    for (s = a.shown + 1; s <= upTo; s++) {
      flow = fut.seasons[s - 1].flow;
      col = $('flow-col-' + s);
      if (col) {
        col.className = 'flow-col' + (s > 20 ? ' is-late' : '') + (flow < 0.5 ? ' is-under' : '');
        col.firstChild.style.height = (clamp(flow, 0, 1.05) / 1.05 * 100).toFixed(1) + '%';
      }
      while (a.told < a.lines.length && a.lines[a.told].season <= s) {
        ln = a.lines[a.told++];
        ticker.appendChild(el('li', { class: ln.yours ? 'is-yours' : null, text: ln.text }));
      }
    }
    a.shown = upTo;
    setText('after-season', W.seasonCount(upTo));
    drawSeason30(upTo);
    ticker.scrollTop = ticker.scrollHeight;
  }
  function tickAfter() {
    var a = state.after;
    if (!a || a.done || state.view !== 'afterwards') return;
    var elapsed = now() - a.t0;
    showSeasons(clamp(Math.floor(elapsed / SEASON_MS) + 1, 1, 30));
    if (elapsed >= 30 * SEASON_MS) finishAfter();
  }
  function finishAfter() {
    var a = state.after, i;
    if (!a || a.done || state.view !== 'afterwards') return;
    showSeasons(30);
    a.done = true;
    drawFinalWays();
    for (i = 0; i < intervals.length; i++) clearInterval(intervals[i]);
    intervals = [];
    setText('after-held', W.futureEnd(state.future));
    setText('after-ways', W.waysEnd(state.future));
    $('after-end').hidden = false;
    $('skip').hidden = true; $('skip').disabled = true;
    if (!a.quiet && $('after-end').scrollIntoView) {           // on a phone the closing lines sit below the map
      try { $('after-end').scrollIntoView({ block: 'nearest' }); } catch (e) { /* older engines */ }
    }
    drawCounting();
    for (i = 0; i < timeouts.length; i++) clearTimeout(timeouts[i]);      // the pump restarts in large slices
    timeouts = [];
    later(pump, 0);
  }
  function drawCounting() {
    var a = state.after, job = state.job, ready = !!state.verdict, btn = $('to-chronicle'), line = $('after-counting');
    if (!a || !a.done) return;
    line.hidden = ready;
    if (!ready && job) line.textContent = W.counting(job.futuresDone, job.futures);
    btn.hidden = !ready; btn.disabled = !ready;
    if (ready && state.view === 'afterwards') focusOn(btn);
  }
  // The verdict, in slices by time budget: small ones while the future plays, large ones after.
  function pump() {
    var job = state.job, a = state.after, t = now(), done = false, budget;
    if (!job || state.verdict || state.view !== 'afterwards') return;
    budget = a && a.done ? 220 : 25;
    do { done = A.verdictStep(job, 200); } while (!done && now() - t < budget);
    if (done) { state.verdict = job.result; drawCounting(); return; }
    drawCounting();
    later(pump, a && a.done ? 0 : 12);
  }

  // ---- the Chronicle ------------------------------------------------------------------------

  function marksRow(label, held) {
    var box = el('div', { class: 'row-marks', role: 'img', 'aria-label': label }), i, n = Math.min(200, held.length);
    for (i = 0; i < n; i++) box.appendChild(el('i', { class: 'k' + (held[i] ? ' is-held' : '') }));
    return el('div', { class: 'row' }, [el('span', { class: 'row-label', text: label }), box]);
  }
  function drawScale(v) {
    var node = $('chron-scale'), rg = v.range, lab = W.rangeLabels(v), lo = rg.scaleLow, hi = rg.scaleHigh, span = (hi - lo) || 1, k, a, b;
    function at(p) { return clamp((p - lo) / span * 100, 0, 100); }
    function pos(p) { return 'left:' + at(p).toFixed(2) + '%'; }
    clear(node);
    node.setAttribute('aria-label', [lab.you, lab.old, lab.worst, lab.best].join(', '));
    var bar = el('div', { class: 'scale-bar' });
    for (k = Math.floor(lo / 10); k * 10 < hi; k++) {              // a scale bar: every other ten points filled
      if (k % 2 !== 0) continue;
      a = Math.max(lo, k * 10); b = Math.min(hi, k * 10 + 10);
      if (b > a) bar.appendChild(el('span', { class: 'scale-block', style: 'left:' + at(a).toFixed(2) + '%;width:' + (at(b) - at(a)).toFixed(2) + '%' }));
    }
    bar.appendChild(el('i', { class: 'scale-pin is-old', style: pos(v.baselinePct) }));
    bar.appendChild(el('i', { class: 'scale-pin is-you', style: pos(v.holdsPct) }));
    node.appendChild(el('span', { class: 'scale-lead is-you is-upper', id: 'scale-lead-you', style: pos(v.holdsPct) }));
    node.appendChild(el('span', { class: 'scale-lead is-old is-lower', id: 'scale-lead-old', style: pos(v.baselinePct) }));
    node.appendChild(el('span', { class: 'scale-flag is-you is-upper', id: 'scale-flag-you', style: pos(v.holdsPct), text: lab.you }));
    node.appendChild(el('span', { class: 'scale-flag is-old is-lower', id: 'scale-flag-old', style: pos(v.baselinePct), text: lab.old }));
    node.appendChild(bar);
    node.appendChild(el('span', { class: 'scale-range', style: 'left:' + at(rg.worstPct).toFixed(2) + '%;width:' + Math.max(0, at(rg.bestPct) - at(rg.worstPct)).toFixed(2) + '%' }));
    node.appendChild(el('span', { class: 'scale-end', id: 'scale-end-worst', style: pos(rg.worstPct), text: lab.worst }));
    node.appendChild(el('span', { class: 'scale-end', id: 'scale-end-best', style: pos(rg.bestPct), text: lab.best }));
    setText('chron-scale-axis', lab.axis);
    state.scaleAt = { you: at(v.holdsPct), old: at(v.baselinePct), worst: at(rg.worstPct), best: at(rg.bestPct) };
    layoutScale();
  }
  // Labels on the scale are set by measured width, so that no label leaves the sheet, no leader
  // line runs through a label, and the two range labels do not sit on each other.
  function layoutScale() {
    var node = $('chron-scale'), p = state.scaleAt;
    if (!node || !p || !$('scale-flag-you')) return;
    var Wd = node.clientWidth || 560;
    function width(id, guess) { var n = $(id); return (n && n.offsetWidth) || guess; }
    function fits(x, w, dir) { return dir > 0 ? x + w <= Wd + 2 : x - w >= -2; }
    function clear1(xL, wL, xU, dir) {         // the lower label, drawn to one side, keeps clear of the upper leader
      var a = dir > 0 ? xL : xL - wL, b = dir > 0 ? xL + wL : xL;
      return fits(xL, wL, dir) && !(xU > a + 2 && xU < b - 2);
    }
    var xy = p.you / 100 * Wd, xo = p.old / 100 * Wd, wy = width('scale-flag-you', 66), wo = width('scale-flag-old', 114);
    var tries = [['old', 1], ['old', -1], ['you', 1], ['you', -1]], pick = null, i;
    for (i = 0; i < tries.length && !pick; i++) {
      if (tries[i][0] === 'old' ? clear1(xo, wo, xy, tries[i][1]) : clear1(xy, wy, xo, tries[i][1])) pick = tries[i];
    }
    if (!pick) pick = ['old', xo > Wd / 2 ? -1 : 1];
    var lower = pick[0], upper = lower === 'old' ? 'you' : 'old';
    var xu = upper === 'you' ? xy : xo, wu = upper === 'you' ? wy : wo, dirU = fits(xu, wu, 1) ? 1 : -1;
    function put(which, row, dir) {
      var flag = $('scale-flag-' + which), lead = $('scale-lead-' + which);
      flag.className = 'scale-flag is-' + which + ' is-' + row + (dir < 0 ? ' at-end' : '');
      lead.className = 'scale-lead is-' + which + ' is-' + row;
    }
    put(lower, 'lower', pick[1]); put(upper, 'upper', dirU);
    // worst and best: outward where there is room, else inward; a second line if they would collide
    var xw = p.worst / 100 * Wd, xb = p.best / 100 * Wd, ww = width('scale-end-worst', 60), wb = width('scale-end-best', 56);
    var dw = fits(xw, ww, -1) ? -1 : 1, db = fits(xb, wb, 1) ? 1 : -1;
    var w0 = dw > 0 ? xw : xw - ww, w1 = dw > 0 ? xw + ww : xw, b0 = db > 0 ? xb : xb - wb, b1 = db > 0 ? xb + wb : xb;
    var clash = w0 < b1 + 6 && b0 < w1 + 6;
    $('scale-end-worst').className = 'scale-end' + (dw < 0 ? ' at-end' : '');
    $('scale-end-best').className = 'scale-end' + (db < 0 ? ' at-end' : '') + (clash ? ' is-low' : '');
    node.className = 'scale' + (clash ? ' has-low' : '');
  }
  function sealSVG() {
    var s = '<svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true" focusable="false">', i, a;
    s += '<circle class="seal-ring" cx="38" cy="38" r="35"/><circle class="seal-ring-thin" cx="38" cy="38" r="28.5"/>';
    for (i = 0; i < 24; i++) {
      a = i / 24 * Math.PI * 2;
      s += '<path class="seal-tick" d="M' + f(38 + Math.cos(a) * 30) + ' ' + f(38 + Math.sin(a) * 30) + 'L' + f(38 + Math.cos(a) * 33.5) + ' ' + f(38 + Math.sin(a) * 33.5) + '"/>';
    }
    s += '<rect class="seal-parcel" x="22" y="27" width="32" height="22"/><rect class="seal-house" x="25" y="30" width="8" height="8"/>';
    s += '<path class="seal-check" d="M35 41l5 5l10 -12"/>';
    return s + '</svg>';
  }
  function showChronicle() {
    var v = state.verdict, life = state.life, i, lines, rows, list, seal, rl, ex;
    if (!v || !life || state.view !== 'afterwards') return;
    if (!state.saved) {
      state.saved = true;
      saveLife({ seed: life.seed, kept: !!v.houseKept, purse: v.purse, need: v.need, mark: v.mark, seal: !!(v.seal && v.seal.earned) });
    }
    setText('chron-valley', W.valleyNo(life.seed));
    setText('chron-house', W.houseLine(v));
    meterInto($('chron-meter'), v.purse, v.need);
    setText('chron-valley-line', W.valleyLine(v));
    setText('chron-mark', W.markLine(v));
    setText('chron-noise', W.markNoise(v));
    rl = W.rowLabels(); rows = $('chron-rows'); clear(rows);
    rows.appendChild(marksRow(rl.you, v.held));
    rows.appendChild(marksRow(rl.old, v.baseline.held));
    rows.appendChild(el('p', { class: 'small', text: W.rowsCaption(v) }));
    ex = W.rowsExplain(v);
    setText('chron-explain-1', ex[0]); setText('chron-explain-2', ex[1]);
    drawScale(v);
    setText('chron-range', W.rangeLine(v));
    $('chron-last-block').hidden = !v.lastDay;
    setText('chron-last', v.lastDay ? W.lastDayLine(v, life.kin) : '');
    seal = $('chron-seal'); clear(seal);
    if (v.seal && v.seal.earned) {
      seal.appendChild(el('span', { html: sealSVG() }));
      seal.appendChild(el('p', { text: W.seal() }));
      seal.hidden = false;
    } else seal.hidden = true;
    setText('chron-mattered', W.mattered(v, titles()));
    list = $('chron-became'); clear(list);
    lines = W.became(state.future, life.kin);
    for (i = 0; i < lines.length; i++) list.appendChild(el('li', { class: i === lines.length - 1 ? 'is-close' : null, text: lines[i] }));
    drawPast('chron-past', 'chron-past-list');
    showView('chronicle');
    layoutScale();                               // again, now that the view has a width
  }

  // ---- reload: a Life is rebuilt from its seed and its choices ------------------------------

  function snapshot() {
    return { seed: state.seed, choices: state.choices, pending: state.pending, view: state.view, phase: state.phase };
  }
  function restore(data) {
    if (!data || data.seed === null || data.seed === undefined || !data.view || data.view === 'opening') return false;
    var life = A.createLife(data.seed), list = Array.isArray(data.choices) ? data.choices : [], i, c, k;
    var before = null, follow = null, keeps = null, result = null;
    state.life = life; state.seed = life.seed; state.choices = []; state.youMark = null; state.result = null;
    state.future = null; state.after = null; state.job = null; state.verdict = null; state.knowOpen = {};
    state.saved = data.view === 'chronicle';     // a Life already counted is not listed twice
    for (i = 0; i < list.length && !life.over; i++) {
      c = [];
      for (k = 0; k < 4; k++) c.push(!!(list[i] && list[i][k]));
      before = A.today(life); follow = followNow(); keeps = keepsNow();
      result = A.playDay(life, c);
      state.result = result;
      noteYou(result);
      state.choices.push(c);
    }
    if (life.over && data.view !== 'day') {
      state.result = result;
      if (data.view === 'leaving') showLeaving(true);
      else startAfterwards(true, true);
      return true;
    }
    if (result && (data.phase === 'revealed' || data.phase === 'season' || life.over)) {
      state.today = before; state.result = result; state.pending = {}; state.flipped = {}; state.thirdOpen = {}; state.hot = null;
      state.phase = data.phase === 'season' && result.lookingRound ? 'season' : 'revealed';
      state.follow = state.phase === 'season' ? followNow() : follow;
      state.keeps = state.phase === 'season' ? keepsNow() : keeps;
      state.phaseAt = 0;
      drawDay();
    } else {
      startDay();
      if (data.pending) {
        for (i = 0; i < ORDER.length; i++) if (typeof data.pending[ORDER[i]] === 'boolean') state.pending[ORDER[i]] = data.pending[ORDER[i]];
        drawDay();
      }
    }
    showView('day', true);
    return true;
  }

  // ---- wiring -------------------------------------------------------------------------------

  function closest(node, sel) { return node && node.closest ? node.closest(sel) : null; }
  function wire() {
    $('begin').addEventListener('click', function () {
      if (state.view !== 'opening') return;
      beginLife(state.fixedSeed !== null ? state.fixedSeed : randomSeed());
    });
    $('close-day').addEventListener('click', closeDay);
    $('next-day').addEventListener('click', nextDay);
    function noRepeat(e) { if (e.repeat && e.key === 'Enter') e.preventDefault(); }   // a held key activates once
    $('close-day').addEventListener('keydown', noRepeat);
    $('next-day').addEventListener('keydown', noRepeat);
    $('leave').addEventListener('click', function () { if (state.view === 'leaving' && !fresh()) startAfterwards(false, false); });
    $('skip').addEventListener('click', function () { if (state.view === 'afterwards') finishAfter(); });
    $('to-chronicle').addEventListener('click', showChronicle);
    $('again').addEventListener('click', function () { if (state.view === 'chronicle' && !fresh()) beginLife(randomSeed()); });
    $('again-same').addEventListener('click', function () { if (state.view === 'chronicle' && !fresh() && state.seed !== null) beginLife(state.seed); });

    var cards = $('cards');
    cards.addEventListener('change', function (e) {
      var t = e.target;
      if (!t || t.type !== 'radio' || !t.checked) return;
      var m = /^choice-(\d+)$/.exec(t.name || '');
      if (m) choose(Number(m[1]), t.value === 'send', false);
    });
    cards.addEventListener('click', function (e) {
      var why = closest(e.target, '[data-why]'), back = closest(e.target, '[data-why-back]');
      if (why) flip(Number(why.getAttribute('data-why')), true);
      else if (back) flip(Number(back.getAttribute('data-why-back')), false);
    });
    cards.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var card = closest(e.target, '.card');
      if (card && card.classList.contains('is-flipped')) flip(Number(card.getAttribute('data-house')), false);
    });
    cards.addEventListener('toggle', function (e) {              // toggle does not bubble: listen in capture
      var det = e.target, id = det && det.getAttribute ? det.getAttribute('data-know') : null;
      if (id && !!det.open !== knowIsOpen(id)) state.knowOpen[id] = !!det.open;      // only what the reader did by hand
    }, true);
    function hotFrom(e) { var card = closest(e.target, '.card'); setHot(card ? Number(card.getAttribute('data-house')) : null); }
    cards.addEventListener('mouseover', hotFrom);
    cards.addEventListener('focusin', hotFrom);
    cards.addEventListener('mouseleave', function () { setHot(null); });
    cards.addEventListener('focusout', function (e) { if (!closest(e.relatedTarget, '#cards')) setHot(null); });

    var map = $('map-day');
    map.addEventListener('click', function (e) {                  // the map is an instrument: a holding takes the choice too
      var hold = closest(e.target, '[data-map-house]');
      if (!hold || state.phase !== 'choose') return;
      var id = Number(hold.getAttribute('data-map-house'));
      if (ORDER.indexOf(id) < 0) return;
      choose(id, state.pending[id] !== true, true);
    });
    map.addEventListener('mouseover', function (e) {
      var hold = closest(e.target, '[data-map-house]'), id = hold ? Number(hold.getAttribute('data-map-house')) : null;
      setHot(id !== null && ORDER.indexOf(id) >= 0 ? id : null);
    });
    map.addEventListener('mouseleave', function () { setHot(null); });

    $('elsewhere-body').addEventListener('click', function (e) {
      var btn = closest(e.target, '[data-why-kin]');
      if (!btn) return;
      var id = btn.getAttribute('data-why-kin'), key = 'kin-' + id, box = $('else-why-' + id);
      if (!box) return;
      state.thirdOpen[key] = !state.thirdOpen[key];
      box.hidden = !state.thirdOpen[key];
      btn.setAttribute('aria-expanded', state.thirdOpen[key] ? 'true' : 'false');
    });

    onMedia(mqCompact, drawViewMap);                              // where the box cannot be measured, the window decides
    onMedia(mqRoomy, function () {
      var all = $('cards').querySelectorAll('details'), i;
      for (i = 0; i < all.length; i++) all[i].open = knowIsOpen(all[i].getAttribute('data-know'));
    });
    onMedia(mqWide, foldKey);
    if (window.addEventListener) {
      window.addEventListener('hashchange', function () { readHash(); if (state.view === 'opening') drawOpening(); });
      window.addEventListener('resize', function () {
        refitMap();                                               // the sheet is redrawn at its other size when its box crosses over
        if (state.view === 'chronicle') layoutScale();
      });
    }
  }

  // ---- start --------------------------------------------------------------------------------

  var started = false;
  function start(data) {
    if (started) return;
    started = true;
    fillStatic();
    state.lives = loadLives();
    readHash();
    wire();
    drawOpening();
    var ok = false;
    try { ok = restore(data); } catch (e) { ok = false; }
    if (!ok) {
      state.life = null; state.seed = null; state.choices = [];
      showView('opening', true);
    }
  }

  window.claude?.hot?.snapshot?.(function () { return snapshot(); });
  if (window.claude?.hot?.ready) window.claude.hot.ready(start);
  else start(window.claude?.hot?.data ?? {});
})();
