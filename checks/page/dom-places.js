/*
 * review-fix1 changes (2026-11-26), for LEAD L3 and the review's findings; every other check is as it was:
 *  - the stand-in DOM gains window.history.replaceState, which writes location.hash as a browser does;
 *  - choosing a place rewrites the address to "#<place>" alone, with no new history entry, and a number line
 *    that was showing keeps its room, unseen (nothing above the choice moves); choosing back the hash's own
 *    place no longer brings its seed back, because the address no longer carries it ('hash');
 *  - "#<place>" alone puts that place in hand with no seed fixed ("#valley" was nothing before), and a place
 *    may be named by its label ("#border-3" is the Watch's no. 3) ('hash');
 *  - a hash changed during a Life is obeyed on the way back to the Opening ('hash');
 *  - a snapshot that puts another place in hand than the address names rewrites the address to that place,
 *    and a snapshot of the Opening keeps the place chosen there unless the address names one ('restore');
 *  - the Banks' Opening states the ends of the bank ('choose'); the Chronicle lists twenty lives ('store').
 *
 * page-p4 copy of page-p3/check/dom-places-p3.js: the page now ships all five places (the valley, the
 * Banks, the Watch, the Bridges, the Saltmarket), so the throwaway test places are no longer registered
 * (they would collide with the real ones); the scenarios run on the page's own places.
 *
 * page-p3 copy of page-p2/check/dom-places.js, now that the page ships two places (the valley and the
 * real Banks). Changes, and only these: the throwaway test places register the watch, the bridges and
 * the saltmarket only (TEST_PLACES; the Banks are the page's own); the scenarios 'one' and 'hash-one'
 * (the valley alone) become 'two' and 'hash-two' (the page as it ships: the valley and the Banks); in
 * 'choose' the Banks' option is named in its own words and its Opening and strip are checked against
 * the Banks' real lines. Every other check is as it was.
 *
 * page-p2: the machinery for many places, run through app.js in the stand-in DOM
 * (dom-harness.js beside this file). From the game folder (run-dom-places.sh runs the six scenarios):
 *   jsc -e "var CHECKS_DIR='<checks folder>'; var CONFIG = { scenario: 'choose' }" <checks folder>/page/dom-places.js
 * Scenarios (stage 2): 'one' (the valley alone, as the page shipped then), 'hash-one', 'choose', 'hash',
 * 'restore', 'store'. Stage 2 registered THROWAWAY test places (test-places.js) for every scenario but the
 * two '-one's; since stage 4 the scenarios are 'two', 'hash-two', 'choose', 'hash', 'restore', 'store' on
 * the page's own five places, and nothing is registered. Nothing in the game folder is touched.
 */
var HERE = (typeof CHECKS_DIR === 'string' ? CHECKS_DIR : 'checks') + '/page/';   // this folder (CHECKS_DIR: the checks folder)
var C = globalThis.CONFIG || {};
var SNAP = null, CREATE_CALLS = [], TOTAL = 0, HASH_WRITES = [];
function noteHeld() { var n = $('opening-valley'); return !n.hidden && n.classList.contains('is-held') && n.getAttribute('aria-hidden') === 'true'; }
function noteShown() { var n = $('opening-valley'); return !n.hidden && !n.classList.contains('is-held') && n.getAttribute('aria-hidden') === null; }

// A fresh page: the stand-in DOM, the store, the hash and the host's snapshot, then the scripts
// index.html loads (the test places after the game's own places, before app.js).
function boot(o) {
  if (typeof CHECKS === 'number') TOTAL += CHECKS;            // each page starts its own count
  load(HERE + 'dom-harness.js');
  if (o.store) STORE['after-you.lives.v1'] = JSON.stringify(o.store);
  location.hash = o.hash || '';
  SNAP = null;
  globalThis.claude = { hot: { snapshot: function (fn) { SNAP = fn; } } };
  // a browser's history: replaceState writes the address (and makes no entry: the count stays)
  globalThis.history = { state: null, length: 1, replaceState: function (st, title, url) { this.state = st; location.hash = String(url).replace(/^[^#]*/, ''); HASH_WRITES.push(location.hash); } };
  if (o.data) globalThis.claude.hot.data = o.data;
  screen(o.screen || 'laptop');
  var html = readFile('index.html'), re = /<script src="([^"]+)"><\/script>/g, m;
  while ((m = re.exec(html))) {
    if (m[1] === 'app.js') {
      // (stage 4: the page ships all five places, so no throwaway place is registered)
      // every Life the page makes is recorded, with the place it was made for
      var real = AfterYou.createLife;
      if (!real.recorded) {
        AfterYou.createLife = function (seed, place) { CREATE_CALLS.push({ args: arguments.length, place: place }); return real.apply(this, arguments); };
        AfterYou.createLife.recorded = true;
      }
    }
    load(m[1]);
  }
  return AYApp.state;
}
function done(what) { TOTAL += CHECKS; CHECKS = 0; print('  ' + what + ': ' + TOTAL + ' checks'); }
function text(id) { return $(id).textContent; }
function lexOf(id) { return AYPlaces.byId[id].lexicon; }
var POLICY = function (n) { return n.situation !== 2; };      // send unless left short
function playDays(S, days) {
  for (var day = 1; day <= days; day++) {
    S.today.neighbours.forEach(function (n) {
      var send = !!POLICY(n), a = $('choice-' + n.id + '-send'), b = $('choice-' + n.id + '-stay');
      a.checked = send; b.checked = !send; fire(send ? a : b, 'change');
    });
    click($('close-day')); advance(400); click($('next-day'));
    if (S.view === 'day' && S.phase === 'season') { advance(400); click($('next-day')); }
  }
}
function toChronicle(S) {
  playDays(S, 12 - S.today.day + 1);
  oneView('leaving'); advance(400); click($('leave')); oneView('afterwards');
  click($('skip'));
  var g = 0; while (!S.verdict) { advance(40); if (++g > 2000) throw new Error('the count never finished'); }
  advance(300); click($('to-chronicle')); oneView('chronicle');
}
function chooseOption(id) {
  var input = $('place-' + id);
  input.checked = true; fire(input, 'change');
  return input;
}
function demoNumbers() {
  var m, re = /<text class="m-num"[^>]*>([^<]*)<\/text>/g, out = [], html = $('map-opening').innerHTML;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}
function storedNow() { return JSON.parse(STORE['after-you.lives.v1'] || '[]'); }
function pastNames(listId) { return $(listId).children.map(function (li) { return li.textContent.split(':')[0]; }); }
function createsAllPlaced(S) {
  ok(CREATE_CALLS.length > 0 && CREATE_CALLS.every(function (c) { return c.args >= 2 && typeof c.place === 'string' && AYPlaces.byId[c.place]; }),
     'every Life the page made was made for a place this page has (' + CREATE_CALLS.length + ' made)');
}
// The strip as drawn, against the Life's own line, top and charter.
function checkStrip(S) {
  var p = S.life.params, top = p.FLOW_KIND === 'stock' ? p.STOCK.max / p.STOCK.start : p.FLOW_KIND === 'hands' ? Math.max(1.05, 1 / (1 - p.FOG)) : 1.05;
  var half = $('flow-strip').querySelector('.flow-half');
  ok(half.getAttribute('style') === 'bottom:' + (p.HOLD_LINE / top * 100).toFixed(2) + '%', 'the strip\'s line stands at HOLD_LINE ' + p.HOLD_LINE.toFixed(3) + ' of a top of ' + top.toFixed(3) + ': ' + half.getAttribute('style'));
  var under = 0, over = 0, s;
  for (s = 1; s <= 30; s++) {
    var col = $('flow-col-' + s), flow = S.future.seasons[s - 1].flow;
    var bad = p.CHARTER === 'breaks' ? flow >= p.HOLD_LINE : flow < p.HOLD_LINE;
    ok(col.classList.contains(p.CHARTER === 'breaks' ? 'is-over' : 'is-under') === bad && !col.classList.contains(p.CHARTER === 'breaks' ? 'is-under' : 'is-over'),
       'season ' + s + ' is drawn on the right side of the line (' + flow.toFixed(3) + ' against ' + p.HOLD_LINE.toFixed(3) + ', ' + p.CHARTER + ')');
    if (bad) { if (p.CHARTER === 'breaks') over++; else under++; }
    var h = parseFloat(col.firstChild.style.height);
    ok(Math.abs(h - Math.min(Math.max(flow, 0), top) / top * 100) < 0.051, 'season ' + s + ' is drawn to its height against the top');
  }
  return { under: under, over: over, top: top };
}

var SCN = C.scenario || 'choose';
function pastOf(id, seed) { return lexOf(id).pastName.replace('{seed}', seed); }
function noOf(id, seed) { return lexOf(id).placeNo.replace('{seed}', seed); }
print('dom-places: ' + SCN);

if (SCN === 'two') {
  // the page as it ships: the valley and the Banks
  var S = boot({ store: [{ seed: 11, kept: true, purse: 70, need: 64, mark: 4, seal: false }] });
  oneView('opening');
  ok(AYPlaces.order.join() === 'valley,banks,watch,bridges,saltmarket', 'five places registered: ' + AYPlaces.order.join());
  ok(!$('opening-places').hidden, 'the choice of places is shown');
  ok($('opening-places-row').children.map(function (l) { return l.textContent; }).join('|') === AYPlaces.order.map(function (id) { return AYWords.placeLabel(id) + AYWords.placeName(id); }).join('|') && $('place-valley').checked, 'with its five options (a short label for the eye, the name for a listener), the valley chosen');
  ok(demoNumbers().join(' ') === '−1 +3', 'the Opening sheet\'s hand: −1 at your end, +3 at theirs');
  ok(text('opening-lines').indexOf('costs you 1 measure of your own grain') >= 0 && text('opening-lines').indexOf('is worth 3 to the house it reaches') >= 0, 'the Opening states the valley\'s stakes');
  ok(pastNames('opening-past-list').join() === 'Valley 11', 'a stored life without a place is the valley\'s');
  click($('begin'));
  oneView('day');
  ok(S.life.place === 'valley', 'the Life is made for the valley, by its key');
  toChronicle(S);
  ok(!$('other-place').hidden, 'the way back to the choice of places');
  ok(text('chron-afterword') === AYPlaces.byId.valley.afterword, 'the Chronicle ends with the valley\'s afterword');
  ok(text('h-chron-afterword') === 'Afterword', 'under its heading');
  var st = storedNow();
  ok(st.length === 2 && st[0].place === 'valley' && st[0].seed === S.life.seed && st[1].place === 'valley' && st[1].seed === 11, 'the new life is stored with its place, the old one kept (written back with its place, the valley)');
  createsAllPlaced(S);
  done('the five places, as the page ships');
}

if (SCN === 'hash-two') {
  var S = boot({ hash: '#valley-48213' });
  ok(S.place === 'valley' && S.fixedSeed === '48213' && !$('opening-valley').hidden && text('opening-valley') === 'Valley no. 48213', '#valley-48213 is the valley numbered 48213');
  click($('begin')); ok(S.life.seed === 48213, 'and Begin plays it');
  S = boot({ hash: '#valley-shoal-3' });
  var shoal = AfterYou.createLife('shoal-3', 'valley').seed;
  ok(S.fixedSeed === 'shoal-3' && text('opening-valley') === 'Valley no. ' + shoal, '#valley-shoal-3 is the valley of the seed "shoal-3" (no. ' + shoal + ')');
  click($('begin')); ok(S.life.seed === shoal && S.life.place === 'valley', 'and Begin plays it');
  S = boot({ hash: '#banks-12' });
  ok(S.place === 'banks' && S.fixedSeed === '12' && !$('opening-valley').hidden && text('opening-valley') === 'Banks no. 12' && $('place-banks').checked, '#banks-12 is the Banks numbered 12, its option chosen');
  S = boot({ hash: '#moor-12' });
  ok(S.hash === null && S.fixedSeed === null && $('opening-valley').hidden && S.place === 'valley', '#moor-12 fixes nothing where the page has no moor');
  location.hash = '#valley-7'; fire(WIN, 'hashchange');
  ok(S.fixedSeed === '7' && !$('opening-valley').hidden && text('opening-valley') === 'Valley no. 7', 'a change of hash redraws the Opening');
  location.hash = ''; fire(WIN, 'hashchange');
  ok(S.fixedSeed === null && $('opening-valley').hidden, 'and a hash taken away unfixes the seed');
  done('the hash, the page as it ships');
}

if (SCN === 'choose') {
  var mixed = [
    { place: 'watch', seed: 901, kept: true, purse: 120, need: 110, mark: 6, seal: true },
    { place: 'watch', seed: 902, kept: false, purse: 90, need: 110, mark: -2, seal: false },
    { seed: 801, kept: true, purse: 66, need: 64, mark: 1, seal: false },
    { place: 'moor', seed: 601, kept: true, purse: 50, need: 40, mark: 2, seal: false },
    { place: 'valley', seed: 701, kept: false, purse: 50, need: 64, mark: -3, seal: false },
    { place: 42, seed: 501, kept: true, purse: 50, need: 40, mark: 2, seal: false },
    { place: 'Watch', seed: 502, kept: true, purse: 50, need: 40, mark: 2, seal: false },
    { place: 'valley', seed: 702, kept: true, purse: 70, need: 64, mark: 5, seal: false },
    { seed: 802, kept: false, purse: 40, need: 64, mark: 0, seal: false },
    { place: 'watch', seed: 903, kept: true, purse: 111, need: 110, mark: 3, seal: false },
    { place: 'moor', seed: 602, kept: true, purse: 50, need: 40, mark: 2, seal: false }
  ];
  var S = boot({ test: true, store: mixed });
  oneView('opening');
  // the choice: five options in the engine's play order, the place in hand chosen
  var row = $('opening-places-row'), opts = row.children;
  ok(!$('opening-places').hidden && opts.length === 5, 'the choice of places shows five options');
  ok(opts.map(function (l) { return l.querySelector('input').value; }).join() === 'valley,banks,watch,bridges,saltmarket', 'in the play order: ' + opts.map(function (l) { return l.querySelector('input').value; }).join());
  ok(opts.every(function (l) { var i = l.querySelector('input'); return l.className === 'opt is-place' && i.type === 'radio' && i.name === 'place' && i.id === 'place-' + i.value; }), 'each a radio of the group "place", in the cards\' option style');
  ok(opts.map(function (l) { return l.textContent; }).join('|') === AYPlaces.order.map(function (id) { return AYWords.placeLabel(id) + AYWords.placeName(id); }).join('|'), 'each named in its own words: ' + opts.map(function (l) { return l.textContent; }).join('|'));
  ok($('opening-places-head').className === 'vh' && text('opening-places-head') === 'Where you live', 'the group is named for a listener');
  ok($('place-valley').checked && opts.filter(function (l) { return l.querySelector('input').checked; }).length === 1, 'the valley is chosen, and only it');
  // the valley's earlier lives only: a life without a place is the valley's, an unknown or malformed place is never listed
  ok(pastNames('opening-past-list').join() === 'Valley 801,Valley 701', 'two latest valley lives listed while the choice takes a row: ' + pastNames('opening-past-list').join());
  ok(pastNames('opening-past-rest').join() === 'Valley 702,Valley 802' && text('opening-past-more-head') === '2 older lives', 'the older ones behind their count: ' + pastNames('opening-past-rest').join());
  ok(S.lives.length === 9 && S.lives.filter(function (e) { return e.place === 'moor'; }).length === 2, 'the unknown place\'s lives are kept in store, the malformed ones dropped');
  // choose a place with the keys: the option keeps the focus, the Opening is drawn in its words
  var before = opts.slice(), watch = $('place-watch');
  watch.focus();
  chooseOption('watch');
  ok(S.place === 'watch' && $('place-watch').checked && !$('place-valley').checked, 'the watch is in hand');
  ok(location.hash === '#watch' && history.length === 1 && S.hash.place === 'watch' && S.hash.seed === null, 'the address names the place chosen, alone, with no new entry in the history: ' + location.hash);
  ok(document.activeElement === watch && row.children.every(function (l, i) { return l === before[i]; }), 'the option keeps the focus: the choice is not built again');
  var p = AfterYou.createLife(1, 'watch').params;
  ok(text('opening-premise') === lexOf('watch').opening.premise, 'the premise is the place\'s');
  // (stage 4: the real Watch's lines) the four lines are the place's, filled from the Life's rules, and
  // state every outcome's number: both stand down, you alone, they alone, both keep watch
  var said4 = $('opening-lines').children.map(function (li) { return li.textContent; }), nums4 = said4.join(' ');
  ok(said4.join('|') === AYWords.opening(p).lines.join('|') && [p.B - p.C + p.S, p.C, p.B, p.H].every(function (n) { return nums4.indexOf(' ' + n + ' ') >= 0 || nums4.indexOf(' ' + n + '.') >= 0 || nums4.indexOf(' ' + n + ';') >= 0; }), 'the four lines state the Life\'s stakes: ' + $('opening-lines').children[1].textContent);
  ok(demoNumbers().join(' ') === AYWords.signed(-p.C) + ' ' + AYWords.signed(p.B), 'the Opening sheet\'s hand carries the Life\'s stakes: ' + demoNumbers().join(' '));
  ok(pastNames('opening-past-list').join() === [901, 902, 903].map(function (n) { return pastOf('watch', n); }).join() && $('opening-past-more').hidden, 'the watch\'s three lives, in its own name: ' + pastNames('opening-past-list').join());
  ok(text('again-same') === lexOf('watch').againSame && text('flow-rule').indexOf('3 in 10') >= 0, 'the copy at rest is written again in its words and rules');
  ok($('opening-valley').hidden, 'no hash, no number');
  // a Life of the place, to the Chronicle
  click($('begin'));
  oneView('day');
  ok(S.life.place === 'watch' && S.life.params.CUSTOM.join() === p.CUSTOM.join() && S.life.params.S === p.S, 'the Life is the watch\'s');
  toChronicle(S);
  var strip = checkStrip(S);
  ok(text('flow-rule').indexOf('3 in 10') >= 0 && text('chron-explain-2').indexOf('3 in 10') >= 0, 'the strip\'s rule and the Chronicle\'s name the line: 3 in 10');
  ok(text('chron-range').indexOf(['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'][S.verdict.range.of]) >= 0, 'the plain ways counted as range.of: ' + S.verdict.range.of);
  ok(text('chron-afterword') === AYPlaces.byId.watch.afterword, 'the afterword is the place\'s');
  ok(!$('other-place').hidden && text('other-place') === 'Choose another place', 'the quiet way back to the choice is there');
  ok(pastNames('chron-past-list').join() === [S.life.seed, 901, 902, 903].map(function (n) { return pastOf('watch', n); }).join(), 'the Chronicle lists the watch\'s lives only: ' + pastNames('chron-past-list').join());
  ok(storedNow()[0].place === 'watch' && storedNow()[0].seed === S.life.seed && storedNow().length === 10, 'stored with its place, the rest kept');
  // another life in the same place
  advance(400); click($('again'));
  oneView('day');
  ok(S.place === 'watch' && S.life.place === 'watch' && S.life.day === 1, '"Live another life" stays in the place');
  toChronicle(S);
  // back to the Opening to choose another place
  advance(400); click($('other-place'));
  oneView('opening');
  ok(S.life === null && $('place-watch').checked && document.activeElement === $('place-watch'), 'back at the Opening, the place in hand chosen and in focus');
  ok(pastNames('opening-past-list').length === 2 && text('opening-past-more-head') === '3 older lives', 'its lives listed, the newest two first');
  // the saltmarket: the town is better off when the ring breaks, so the worse side is over the line
  chooseOption('saltmarket');
  click($('begin'));
  toChronicle(S);
  var salt = checkStrip(S);
  ok(text('chron-afterword') === AYPlaces.byId.saltmarket.afterword && S.life.params.CHARTER === 'breaks', 'the saltmarket\'s Chronicle');
  if (S.verdict.lastDay) {
    var ld = S.verdict.lastDay, line = text('chron-last');
    ok(ld.rule === 'habit' && ld.changed.every(function (c) { return line.indexOf((c.lived ? 'sent a hand to ' : 'stayed home against ')) >= 0 && line.indexOf((c.replayed ? 'sent a hand to ' : 'stayed home against ')) >= 0; }), 'the last day told by each tie\'s act, lived and replayed: ' + line);
  }
  ok(!S.verdict.seal || !S.verdict.seal.earned || text('chron-seal').indexOf(AYPlaces.byId.saltmarket.charter.seal) >= 0, 'the seal, if earned, in the place\'s words');
  // the banks: a stock, so the hand on the Opening is worth B x its start and the strip tops out at max / start
  advance(400); click($('other-place'));
  chooseOption('banks');
  var pb = AfterYou.createLife(1, 'banks').params;
  ok(demoNumbers().join(' ') === AYWords.signed(-pb.C) + ' ' + AYWords.signed(pb.B * pb.STOCK.start), 'the banks\' Opening hand: ' + demoNumbers().join(' '));
  ok(text('opening-lines').indexOf('what the bank holds, ' + (pb.B * pb.STOCK.start) + ' at first. It fills by ' + pb.STOCK.delta[1] + ' if either keeps off and falls by ' + (-pb.STOCK.delta[0]) + ' if both fish across, but stays between ' + pb.STOCK.min + ' and ' + pb.STOCK.max + '.') >= 0, 'its stock stated from the Life, with its ends: ' + $('opening-lines').children[1].textContent);
  click($('begin'));
  toChronicle(S);
  var banks = checkStrip(S);
  ok(text('flow-rule').indexOf('at least ' + Math.round(pb.HOLD_LINE * pb.STOCK.start) + ';') >= 0 && text('flow-rule').indexOf('began at ' + pb.STOCK.start + '.') >= 0, 'the banks\' line as a level of the stock: ' + text('flow-rule'));
  createsAllPlaced(S);
  done('the choice of places (watch: ' + strip.under + ' seasons under the line; saltmarket: ' + salt.over + ' over it; banks: top ' + banks.top.toFixed(2) + ')');
}

if (SCN === 'hash') {
  var S = boot({ test: true, hash: '#watch-12' });
  ok(S.place === 'watch' && $('place-watch').checked && S.fixedSeed === '12' && text('opening-valley') === noOf('watch', 12), '#watch-12 puts the watch in hand, its option chosen, seed 12 fixed');
  ok(text('opening-premise') === lexOf('watch').opening.premise, 'and its words in force');
  var h1Before = text('h-opening');
  chooseOption('valley');
  ok(S.place === 'valley' && S.fixedSeed === null && noteHeld() && text('h-opening') === h1Before, 'another place chosen: no seed fixed there, and the number line keeps its room unseen (nothing above the choice moves)');
  ok(location.hash === '#valley' && history.length === 1, 'and the address names the place chosen, alone: ' + location.hash);
  chooseOption('watch');
  ok(S.place === 'watch' && S.fixedSeed === null && noteHeld() && location.hash === '#watch', 'the hash\'s place again: the address no longer carries its seed, so none is fixed, and the line still keeps its room');
  location.hash = '#border-3'; fire(WIN, 'hashchange');
  ok(S.place === 'watch' && S.fixedSeed === '3' && noteShown() && text('opening-valley') === noOf('watch', 3), '#border-3: the Watch by the word the page letters it with, seed 3');
  location.hash = '#banks'; fire(WIN, 'hashchange');
  ok(S.place === 'banks' && $('place-banks').checked && S.fixedSeed === null && $('opening-valley').hidden, '#banks alone: the Banks in hand, no seed fixed, no number');
  location.hash = '#valley'; fire(WIN, 'hashchange');
  ok(S.place === 'valley' && $('place-valley').checked && S.fixedSeed === null && $('opening-valley').hidden, '#valley alone: the valley in hand, no seed fixed');
  location.hash = '#valley-48213'; fire(WIN, 'hashchange');
  ok(S.place === 'valley' && $('place-valley').checked && S.fixedSeed === '48213' && text('opening-valley') === 'Valley no. 48213', '#valley-48213 keeps its meaning');
  location.hash = '#valley-shoal-3'; fire(WIN, 'hashchange');
  ok(S.place === 'valley' && S.fixedSeed === 'shoal-3' && text('opening-valley') === 'Valley no. ' + AfterYou.createLife('shoal-3', 'valley').seed, '#valley-shoal-3 keeps its meaning');
  ['#moor-5', '#watch-', '#WATCH-3', '#-5', '#watch_5', '#moor'].forEach(function (h) {
    location.hash = h; fire(WIN, 'hashchange');
    ok(S.hash === null && S.fixedSeed === null && $('opening-valley').hidden && S.place === 'valley', h + ' fixes nothing and leaves the place in hand');
  });
  location.hash = '#saltmarket-77'; fire(WIN, 'hashchange');
  ok(S.place === 'saltmarket' && $('place-saltmarket').checked && text('opening-valley') === noOf('saltmarket', 77), '#saltmarket-77');
  click($('begin'));
  ok(S.life.seed === 77 && S.life.place === 'saltmarket', 'Begin plays the hash\'s Life');
  location.hash = '#banks-5'; fire(WIN, 'hashchange');
  ok(S.place === 'saltmarket' && S.life.place === 'saltmarket' && S.view === 'day', 'a hash changed during a Life leaves the Life alone');
  toChronicle(S);
  advance(400); click($('other-place'));
  oneView('opening');
  ok(S.place === 'banks' && $('place-banks').checked && S.fixedSeed === '5' && text('opening-valley') === noOf('banks', 5), 'and is obeyed on the way back to the Opening, as on a load: the Banks, seed 5');
  createsAllPlaced(S);
  done('the hash');
}

if (SCN === 'restore') {
  // a Life of the watch, half way through a day, rebuilt by the host's snapshot
  var S = boot({ test: true, hash: '#valley-48213' });
  chooseOption('watch');
  click($('begin'));
  playDays(S, 5);
  var t = S.today; $('choice-' + t.neighbours[0].id + '-send').checked = true; fire($('choice-' + t.neighbours[0].id + '-send'), 'change');
  $('choice-' + t.neighbours[1].id + '-stay').checked = true; fire($('choice-' + t.neighbours[1].id + '-stay'), 'change');
  var snap = JSON.parse(JSON.stringify(SNAP())), lifeJSON = JSON.stringify(S.life);
  ok(snap.place === 'watch' && snap.view === 'day' && snap.choices.length === 5, 'the snapshot carries the place: ' + JSON.stringify({ place: snap.place, view: snap.view, days: snap.choices.length }));
  S = boot({ test: true, hash: '#valley-48213', data: snap });
  oneView('day');
  ok(S.place === 'watch' && S.life.place === 'watch' && JSON.stringify(S.life) === lifeJSON, 'rebuilt in the watch, the same Life, though the hash named the valley');
  ok(location.hash === '#watch', 'and the address now names the watch: ' + location.hash);
  ok(S.today.day === 6 && S.pending[t.neighbours[0].id] === true && S.pending[t.neighbours[1].id] === false, 'the day and the choices half made');
  ok(text('again-same') === lexOf('watch').againSame && text('store-head') === lexOf('watch').storeHead, 'in the watch\'s words');
  toChronicle(S);
  var chronSnap = JSON.parse(JSON.stringify(SNAP())), stored = storedNow().length;
  ok(chronSnap.place === 'watch' && chronSnap.view === 'chronicle', 'a snapshot at the Chronicle');
  // a reload at the Chronicle: rebuilt, and not stored twice
  S = boot({ test: true, data: chronSnap, store: storedNow() });
  oneView('afterwards');
  ok(S.after.done && $('skip').hidden, 'rebuilt at the Afterwards, the watched future already told');
  var g = 0; while (!S.verdict) { advance(40); if (++g > 2000) throw new Error('the count never finished'); }
  advance(300); click($('to-chronicle'));
  ok(S.place === 'watch' && storedNow().length === stored, 'rebuilt at the Chronicle in the watch, the life not stored twice');
  advance(400); click($('other-place'));
  ok(S.view === 'opening' && $('place-watch').checked && !$('opening-places').hidden, 'and back at the Opening the watch is the place in hand');
  // a snapshot of a place this page has no words for cannot be rebuilt: the Opening, as it was
  S = boot({ test: true, data: { place: 'moor', seed: 5, choices: [], pending: {}, view: 'day', phase: 'choose' } });
  oneView('opening');
  ok(S.place === 'valley' && S.life === null && $('place-valley').checked, 'a snapshot of an unknown place: the Opening');
  // a snapshot from before there were places is the valley's
  S = boot({ test: true, hash: '#watch-3', data: { seed: 48213, choices: [[true, true, true, true]], pending: {}, view: 'day', phase: 'choose' } });
  oneView('day');
  ok(S.place === 'valley' && S.life.place === 'valley' && S.life.seed === 48213 && S.today.day === 2 && location.hash === '#valley', 'a snapshot without a place is the valley\'s, whatever the hash, and the address says so: ' + location.hash);
  // a snapshot whose choices are not a list: day 1 of that Life, as before there were places
  S = boot({ test: true, hash: '#watch-3', data: { place: 'banks', seed: 5, choices: 'nonsense', pending: {}, view: 'day', phase: 'choose' } });
  ok(S.view === 'day' && S.place === 'banks' && S.life.place === 'banks' && S.today.day === 1, 'choices that are not a list: day 1 of that place\'s Life');
  // a snapshot of another place that fails while it is rebuilt (an empty seed throws) leaves a whole
  // Opening, drawn again in the place the snapshot had put in hand
  S = boot({ test: true, hash: '#watch-3', data: { place: 'banks', seed: '', choices: [], pending: {}, view: 'day', phase: 'choose' } });
  oneView('opening');
  ok(S.life === null && S.place === 'banks' && $('place-banks').checked && text('opening-premise') === lexOf('banks').opening.premise &&
     demoNumbers().join(' ') === AYWords.signed(-AfterYou.createLife(1, 'banks').params.C) + ' ' + AYWords.signed(6) && location.hash === '#banks', 'a snapshot that fails: the Opening, whole, in its place, the address naming it');
  // a snapshot of the Opening keeps the place chosen there; an address that names a place wins
  S = boot({ test: true, data: { place: 'banks', seed: null, choices: [], pending: {}, view: 'opening', phase: 'choose' } });
  oneView('opening');
  ok(S.place === 'banks' && $('place-banks').checked && S.life === null && text('opening-premise') === lexOf('banks').opening.premise, 'a snapshot of the Opening: the place chosen there, in hand again');
  S = boot({ test: true, hash: '#watch-3', data: { place: 'banks', seed: null, choices: [], pending: {}, view: 'opening', phase: 'choose' } });
  oneView('opening');
  ok(S.place === 'watch' && S.fixedSeed === '3' && location.hash === '#watch-3', 'but the address\'s place where it names one');
  createsAllPlaced(S);
  done('snapshot and restore');
}

if (SCN === 'store') {
  // the store keeps 60 lives, every place together, newest first
  var many = [], i;
  for (i = 0; i < 75; i++) many.push({ place: ['valley', 'watch', 'moor'][i % 3], seed: 1000 + i, kept: true, purse: 70, need: 64, mark: 1, seal: false });
  var S = boot({ test: true, store: many });
  ok(S.lives.length === 60 && S.lives[0].seed === 1000 && S.lives[59].seed === 1059, 'sixty lives read, the newest first');
  ok($('opening-past-list').children.length === 2 && text('opening-past-more-head') === '18 older lives', 'twenty valley lives among them: two listed, eighteen behind the count');
  click($('begin')); toChronicle(S);
  var st = storedNow();
  ok(st.length === 60 && st[0].place === 'valley' && st[0].seed === S.life.seed && st[59].seed === 1058, 'one more stored, the oldest let go');
  ok($('chron-past-list').children.length === 20 && pastNames('chron-past-list').every(function (n) { return /^Valley /.test(n); }), 'the Chronicle lists the newest twenty of the valley\'s 21');
  ok(st.filter(function (e) { return e.place === 'moor'; }).length === 19 && st[59].place === 'watch', 'the lives of a place this page has not are kept in store (twenty read, the oldest of them let go)');
  // storage that throws: the page plays on with the list in memory
  S = boot({ test: true });
  globalThis.localStorage = { getItem: function () { throw new Error('off'); }, setItem: function () { throw new Error('off'); } };
  click($('begin')); toChronicle(S);
  ok(S.lives.length === 1 && S.lives[0].place === 'valley' && $('chron-past-list').children.length === 1, 'without storage the life is listed from memory');
  done('the store');
}

print('dom-places ' + SCN + ': PASS (' + TOTAL + ' checks)');
