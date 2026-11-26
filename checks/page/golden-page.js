/*
 * The valley's page as a fingerprint, the valley alone (read-only). Runs the game's app.js in the
 * stand-in DOM (domshim.js beside this file: no CSS, widths by rule of thumb), loading only engine.js,
 * words.js, places/valley.js and sheet.js, walks one whole Life at three window sizes, and hashes
 * (a) the four maps' SVG and (b) the whole page's markup at each step. The same command must print
 * the same hashes for the valley as long as the valley's page does not move.
 * Run from a game folder (it loads the game's files by relative path); CHECKS_DIR is this checks folder:
 *   jsc -e "var CHECKS_DIR='<checks folder>'" <checks folder>/page/golden-page.js
 * (From the repository root, CHECKS_DIR may be left out: it defaults to 'checks'.)
 * History: the page-map's golden-page.js, with places/valley.js and sheet.js loaded once app.js
 * needed them; what it hashes is unchanged.
 */
var PAGE_CHECKS = (typeof CHECKS_DIR === 'string' ? CHECKS_DIR : 'checks') + '/page';
load(PAGE_CHECKS + '/domshim.js'); load('engine.js'); load('words.js'); load('places/valley.js'); load('sheet.js');
function $(id) { return document.getElementById(id); }
function fnv(s, h) {
  h = h === undefined ? 0x811c9dc5 >>> 0 : h;
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
}
function hex(h) { return ('00000000' + h.toString(16)).slice(-8); }
function boot(hash) { shim.loadPage('.'); shim.store = {}; window.location.hash = hash; window.claude = undefined; load('app.js'); return window.AYApp.state; }

var SEED = 48213;
var SIZES = [['phone 400x800', 400, 800], ['laptop 1280x800', 1280, 800], ['tall 1280x1100', 1280, 1100]];
var all = 0x811c9dc5 >>> 0, allMaps = 0x811c9dc5 >>> 0, steps = 0, mapChars = 0, pageChars = 0;

SIZES.forEach(function (sz) {
  shim.setView(sz[1], sz[2], false);
  var st = boot('#valley-' + SEED), page = 0x811c9dc5 >>> 0, maps = 0x811c9dc5 >>> 0, d, i, kinds = {};
  function mark(what) {
    var body = serialize(document.body), m = ['map-opening', 'map-day', 'map-leaving', 'map-after'].map(function (id) { return serialize($(id), true); }).join('\u0001');
    page = fnv(what + '\u0001' + body, page); maps = fnv(what + '\u0001' + m, maps);
    all = fnv(body, all); allMaps = fnv(m, allMaps);
    steps++; pageChars += body.length; mapChars += m.length;
  }
  mark('opening');
  kinds.opening = $('map-opening').querySelector('svg').getAttribute('viewBox');
  $('begin').click();
  for (d = 1; d <= 12; d++) {
    var t = AfterYou.today(st.life);
    mark('day ' + d + ' open');
    for (i = 0; i < 4; i++) {
      var send = t.neighbours[i].situation !== 2;          // send unless left short
      var a = $('choice-' + t.neighbours[i].id + (send ? '-send' : '-stay'));
      a.checked = true; a.dispatch('change');
    }
    mark('day ' + d + ' chosen');
    $('close-day').click();
    mark('day ' + d + ' closed');
    var why = $('why-' + t.neighbours[0].id); if (why) { why.click(); mark('day ' + d + ' why'); }
    shim.advance(400); $('next-day').click();
    if (st.phase === 'season') { mark('day ' + d + ' season'); shim.advance(400); $('next-day').click(); }
  }
  if (st.view !== 'leaving') throw new Error('not at Leaving after day 12: ' + st.view);
  mark('leaving');
  shim.advance(400); $('leave').click();
  mark('afterwards start');
  $('skip').click();
  var guard = 0;
  while (!st.verdict) { shim.advance(50); if (++guard > 20000) throw new Error('the count never finished'); }
  shim.advance(400);
  mark('afterwards end');
  $('to-chronicle').click();
  if (st.view !== 'chronicle') throw new Error('not at the Chronicle: ' + st.view);
  mark('chronicle');
  kinds.day = st.view;
  print(sz[0] + ': page ' + hex(page) + ', maps ' + hex(maps) + '  (opening sheet viewBox ' + kinds.opening + ')');
});
print('steps hashed: ' + steps + '; page markup ' + pageChars + ' characters, map SVG ' + mapChars + ' characters');
print('GOLDEN PAGE (valley ' + SEED + ', send unless left short): page ' + hex(all) + ', maps ' + hex(allMaps));
