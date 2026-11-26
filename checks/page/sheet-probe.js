/*
 * Every place's sheet by its own rules, and every drawing of it as a fingerprint (read-only).
 * For each place, in the play order: AYSheet.check (the sheet's own rules), where each of your four
 * ties meets the barrier, and then, on the wide and the compact sheet, the map in each of its modes
 * with fixed options that reach every branch of the drawing (the Opening's sheet; the day open, with
 * two hands planned, one tie hot and clickable; the same cut for a phone; the day closed, with a hand
 * arrived and answered, one lost, one kept home and answered, one arrived unanswered, the sister's
 * dealings with two others; the same lettered up for a narrow box; Leaving; the Afterwards), each
 * printed with its place as its length and an fnv1a32 of its SVG (so that a diff of two outputs names
 * each drawing that moved). Then the day's dealing in miniature (four ways),
 * every drawn key, the seal, and for a place with a stock the gauge of every tie. A drawing with
 * "undefined" or "NaN" in it is marked BAD; a crossing that misses its tie is marked (no hit).
 * The options are made up, not played: they hold the drawing still, whatever the engine does.
 * The words the maps letter are the place's own (AYWords.use), so a change to a map's lettering
 * shows here too. The last line is one fnv1a32 over every drawing of every place.
 * Run from a game folder (it loads the scripts index.html loads, except app.js, by relative path):
 *   cd <game folder> && jsc <checks folder>/page/sheet-probe.js
 * run-all.sh runs it here and at the ref and fails when the two outputs differ.
 */
(function () { var html = readFile('index.html'), re = /<script src="([^"]+)"><\/script>/g, m; while ((m = re.exec(html))) if (m[1] !== 'app.js') load(m[1]); })();
var S = AYSheet;
function fnv(s, h) {
  h = h === undefined ? 0x811c9dc5 >>> 0 : h;
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
}
function hex(h) { return ('00000000' + h.toString(16)).slice(-8); }
function pad(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }
var ALL = 0x811c9dc5 >>> 0, DRAWINGS = 0, PLACE = '';
function show(label, svg) {                       // one drawing, named with its place: its length and fingerprint
  label = PLACE + ' ' + label;
  ALL = fnv(label + '\u0001' + svg + '\u0002', ALL); DRAWINGS++;
  print('  ' + pad(label, 40) + pad(svg.length + ' chars', 13) + 'fnv1a32 ' + hex(fnv(svg)) + (/undefined|NaN/.test(svg) ? ' BAD' : ''));
}

// The made-up Life the maps are drawn for: eight houses (0 is yours; 3, 4 and 5 are the far three),
// the sister at 2, two holdings kept, every follow pattern from none to all.
var NAMES = ['Ada', 'Bramwell', 'Coe', 'Dunstan', 'Ede', 'Fenn', 'Fairweather-Lyle', 'Hob'];
var KIN = 2;
var FOLLOW = { 1: [true, false, true, false, true], 2: [true, true, true, true, true], 6: [false, false, false, false, false], 7: [true, false, false, false, false] };
var KEEPS = { 1: true, 7: true };
var PLANNED = { 1: { plan: true }, 2: { plan: false } };
var REVEALED = {
  1: { revealed: true, arrived: true, lost: false, they: true },
  2: { revealed: true, arrived: false, lost: true, they: false },
  6: { revealed: true, arrived: false, lost: false, they: true },
  7: { revealed: true, arrived: true, lost: false, they: false }
};
function kinWith(stock) {                          // the sister's dealings with 1 and 3 (and the bank after, with a stock)
  var out = [{ id: 1, kinSent: true, theySent: false }, { id: 3, kinSent: false, theySent: true }];
  if (stock) { out[0].stock = stock.start; out[0].stockAfter = stock.max; out[1].stock = stock.start; out[1].stockAfter = stock.min; }
  return out;
}
function levels(stock) { return { 1: stock.min, 2: stock.max, 6: stock.start, 7: Math.min(stock.max, stock.min + 1) }; }
function withGauge(o, stock, lv) { if (stock) o.gauge = lv ? { top: stock.max, levels: lv } : { top: stock.max }; return o; }

AYPlaces.order.forEach(function (id) {
  var sh = AYPlaces.byId[id].sheet, stock = AfterYou.createLife(1, id).params.STOCK || null;
  AYWords.use(id); PLACE = id;
  print(id + ': check ' + JSON.stringify(S.check(sh)));
  ['wide', 'compact'].forEach(function (kind) {
    var g = S.geo(sh, kind), narrow = S.letterUp(kind, kind === 'wide' ? 320 : 240);
    print('  ' + id + ' ' + kind + ' crossings: ' + [1, 2, 6, 7].map(function (h) { var c = g.crossings[h]; return h + '@' + S.f(c.p[0]) + ',' + S.f(c.p[1]) + (c.hit ? '' : ' (no hit)'); }).join('  '));
    var open = function (crop) { return withGauge({ names: NAMES, kin: KIN, follow: FOLLOW, keeps: KEEPS, hands: PLANNED, kinWith: null, hot: 6, click: true, crop: crop, alt: 'the day, open' }, stock, stock && levels(stock)); };
    var closed = function (up) { return withGauge({ names: NAMES, kin: KIN, follow: FOLLOW, keeps: KEEPS, hands: REVEALED, kinWith: kinWith(stock), hot: null, click: false, crop: false, alt: 'the day, closed', up: up }, stock, stock && levels(stock)); };
    show(kind + ' sheet', S.map(sh, kind, 'sheet', withGauge({ demo: [-1, 3] }, stock, stock && { 1: stock.start, 2: stock.start, 6: stock.start, 7: stock.start })));
    show(kind + ' day open', S.map(sh, kind, 'day', open(false)));
    show(kind + ' day open, cropped', S.map(sh, kind, 'day', open(true)));
    show(kind + ' day closed', S.map(sh, kind, 'day', closed(undefined)));
    show(kind + ' day closed, up ' + narrow, S.map(sh, kind, 'day', closed(narrow)));
    show(kind + ' leaving', S.map(sh, kind, 'leaving', withGauge({ names: NAMES, kin: KIN, follow: FOLLOW, keeps: KEEPS }, stock, stock && levels(stock))));
    show(kind + ' after', S.map(sh, kind, 'after', withGauge({ kin: KIN }, stock, null)));
    if (stock) show(kind + ' gauges, 16 ties', S.TIES.map(function (t) { return t.key + ' ' + S.gaugeD(sh, kind, t.key, { level: stock.start, top: stock.max }); }).join('\n'));
  });
  show('glyph arrived, answered', S.glyph(sh, { arrived: true, they: true }));
  show('glyph lost, answered', S.glyph(sh, { lost: true, they: true }));
  show('glyph lost', S.glyph(sh, { lost: true }));
  show('glyph kept home', S.glyph(sh, {}));
  show('keys', ['gauge', 'arrived', 'turned', 'planned', 'home', 'follows', 'help', 'income', 'keeps', 'newcomer', 'held', 'fell', 'sent', 'stayed', 'fresh', 'ghost', 'diamond'].map(function (k) {
    return S.key(sh, k, k === 'gauge' ? (stock ? { level: stock.start, top: stock.max } : null) : undefined);
  }).join('\n'));
  show('seal', S.seal(sh));
  if (stock) show('card gauges, every level', (function () { var s = [], v; for (v = stock.min; v <= stock.max; v++) s.push(S.gauge({ level: v, top: stock.max })); return s.join('\n'); })());
});
print('SHEET PROBE: ' + AYPlaces.order.length + ' places, ' + DRAWINGS + ' drawings, fnv1a32 ' + hex(ALL));
