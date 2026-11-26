/*
 * A place's walk with every place loaded: golden-page.js's walk and hashes (one whole Life, seed
 * 48213, sending unless left short, at three window sizes), loading the scripts index.html loads, in
 * its order (all five places), so that a new script file needs no edit here.
 *
 *   cd <game folder> && jsc -e "var CHECKS_DIR='<checks folder>'" <checks folder>/page/stream-page.js > page-stream.txt
 *       the valley's walk, with a dump of every hashed step (the page's markup and the four maps, one
 *       JSON line each) so that two runs can be compared step by step with diff-page-stream.py
 *   ... stream-page.js -- banks > banks-stream.txt
 *       the same for another place (its Life is #banks-48213)
 *   ... stream-page.js -- all steps > walks.txt
 *       every registered place in the play order, one line per step with the fingerprint and length
 *       of the page's markup and of the four maps (no dump), so that two runs can be compared with
 *       diff; a place name instead of "all" walks that place alone
 *
 * From the repository root, CHECKS_DIR may be left out: it defaults to 'checks'.
 */
var PAGE_CHECKS = (typeof CHECKS_DIR === 'string' ? CHECKS_DIR : 'checks') + '/page';
load(PAGE_CHECKS + '/domshim.js');
var SCRIPTS = (function () {
  var html = readFile('index.html'), re = /<script src="([^"]+)"><\/script>/g, m, out = [];
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
})();
SCRIPTS.forEach(function (src) { if (src !== 'app.js') load(src); });
function $(id) { return document.getElementById(id); }
function fnv(s, h) {
  h = h === undefined ? 0x811c9dc5 >>> 0 : h;
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
}
function hex(h) { return ('00000000' + h.toString(16)).slice(-8); }
function boot(hash) { shim.loadPage('.'); shim.store = {}; window.location.hash = hash; window.claude = undefined; load('app.js'); return window.AYApp.state; }

var ARGS = typeof arguments !== 'undefined' ? Array.prototype.slice.call(arguments).map(String) : [];
var STEPS_ONLY = ARGS.indexOf('steps') >= 0;
var WHICH = ARGS.filter(function (a) { return a !== 'steps'; })[0] || 'valley';
var PLACES = WHICH !== 'all' ? [WHICH] : typeof AYPlaces === 'undefined' ? ['valley'] : AYPlaces.order.slice();
PLACES.forEach(function (pl) {                  // (a version with no places, v0.1.0, has the valley alone)
  if (typeof AYPlaces === 'undefined' ? pl !== 'valley' : !AYPlaces.byId[pl]) throw new Error('stream-page.js: no place "' + pl + '" is registered');
});

var SEED = 48213;
var SIZES = [['phone 400x800', 400, 800], ['laptop 1280x800', 1280, 800], ['tall 1280x1100', 1280, 1100]];
var walksAll = 0x811c9dc5 >>> 0, walksMaps = 0x811c9dc5 >>> 0, walksSteps = 0;

PLACES.forEach(function (place) {
  var all = 0x811c9dc5 >>> 0, allMaps = 0x811c9dc5 >>> 0, steps = 0, mapChars = 0, pageChars = 0;
  SIZES.forEach(function (sz) {
    shim.setView(sz[1], sz[2], false);
    var st = boot('#' + place + '-' + SEED), page = 0x811c9dc5 >>> 0, maps = 0x811c9dc5 >>> 0, d, i, kinds = {};
    if ((st.place || 'valley') !== place) throw new Error('stream-page.js: the page opened ' + st.place + ', not ' + place);
    function mark(what) {
      var body = serialize(document.body), m = ['map-opening', 'map-day', 'map-leaving', 'map-after'].map(function (id) { return serialize($(id), true); }).join('\u0001');
      page = fnv(what + '\u0001' + body, page); maps = fnv(what + '\u0001' + m, maps);
      all = fnv(body, all); allMaps = fnv(m, allMaps);
      walksAll = fnv(body, walksAll); walksMaps = fnv(m, walksMaps); walksSteps++;
      steps++; pageChars += body.length; mapChars += m.length;
      if (STEPS_ONLY) print('WALK\t' + place + '\t' + sz[0] + '\t' + what + '\tpage ' + hex(fnv(body)) + ' ' + body.length + '\tmaps ' + hex(fnv(m)) + ' ' + m.length);
      else print('STEP\t' + sz[0] + '\t' + what + '\t' + JSON.stringify(body) + '\t' + JSON.stringify(m));
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
    print((STEPS_ONLY ? 'SIZE\t' + place + ' ' : 'SIZE\t') + sz[0] + ': page ' + hex(page) + ', maps ' + hex(maps) + '  (opening sheet viewBox ' + kinds.opening + ')');
  });
  print((STEPS_ONLY ? place + ': ' : '') + 'steps hashed: ' + steps + '; page markup ' + pageChars + ' characters, map SVG ' + mapChars + ' characters');
  print('GOLDEN PAGE (' + place + ' ' + SEED + ', send unless left short): page ' + hex(all) + ', maps ' + hex(allMaps));
});
if (STEPS_ONLY) print('WALKS (' + PLACES.length + ' places, ' + walksSteps + ' steps, seed ' + SEED + ', send unless left short): page ' + hex(walksAll) + ', maps ' + hex(walksMaps));
