/*
 * motion-and-sound changes (2026-11-27), every other check kept as it was:
 *  - every clock read of the run (performance.now) is counted, and the OK line ends with the count, so that two
 *    configurations can be compared (run-dom.sh compares the fxThrow configuration with the first);
 *  - CONFIG.fxThrow: stand-in modules take the place of motion.js and sound.js before app.js loads, whose boot
 *    returns true and whose every cue throws; the Life must pass whole, with every check, and the same clock reads
 *    as without them (the page never needs the modules: app.js catches what they throw, SPEC 6.5).
 *
 * review-fix1 changes (2026-11-26), every other check kept as it was:
 *  - the season replay's line shows exactly where the seal would otherwise have been earned (LEAD L1:
 *    seal.wonOnSeason, the house kept, the mark clear, no last-day clause), not on every wonOnSeason;
 *  - the Chronicle lists the newest twenty earlier lives (as the first page kept twenty), not sixty;
 *  - the Banks' Leaving map says the four banks you leave, as the day's map says them (finding banks-07);
 *  - on every day, open and closed, the store's text is W.store of the engine's purse and need, and once
 *    the day is closed its total is W.dayTotal of the four cards' numbers (summed here, each worked out
 *    here from the stakes, the Banks' at the level the day was played on) and the store after it.
 *
 * page-p6 copy of page-p4/check/dom-run-p4.js. What changes here: one check, made at both Chronicles of
 * the run, for the line of a seal withheld by the season replay (LEAD 4.2): it stands right after the
 * mark's noise line, in the place's words (lexicon.lastSeason.rests), exactly when the verdict says
 * seal.wonOnSeason, and nowhere otherwise (a line from an earlier Chronicle is not left behind). The OK
 * line also counts those lines. Every other check of the page-p4 copy is kept as it was.
 *
 * page-p4 copy of page-p3/check/dom-run-p3.js. What changes here:
 *  - the page now has five places (the valley, the Banks, the Watch, the Bridges, the Saltmarket): where
 *    stage 3 checked that the choice shows two, this checks that it shows all five in the play order;
 *  - the policy 'old' plays the place's own custom (life.params.CUSTOM: in the valley the old way, as before),
 *    and the three new places' honest ways of playing are added: 'watch', 'bridges', 'salt'
 *    (dom-policies.js beside this file, as page-smoke.js plays them);
 *  - checks are added for the shared features of stage 4, at every point of every day: the store on day 1 is
 *    the starting store (STORE_START); the meter draws a store below zero hatched from a zero mark, and one
 *    at or above zero as before; each card's number and sentence are the reveal's with the Life's stakes,
 *    the number the stakes of its outcome; the day's total carries the town's line exactly where the
 *    charter breaks, from the day's results; and, once the future has played, each column of the strip
 *    is on the charter's good or worse side by its own flow and the Life's HOLD_LINE.
 * Every check of the stage-3 copy is kept as it was.
 *
 * page-p3 copy of page-p2/check/dom-run-p2.js (itself a copy of the first review's dom-run.js). What changes here:
 *  - CONFIG.place (default 'valley'): the Life is of that place (#<place>-<seed>); the stored lives made
 *    up for the run carry that place where it is not the valley (an entry with no place is the valley's);
 *  - the page now has two places (the valley and the Banks), so where stage 2 checked that one place
 *    shows no choice, this checks that the choice shows both, in the play order, with the place in hand
 *    chosen; that the Opening lists two lives where it lists any before the rest (PAST_SHOWN_CHOOSING);
 *    that the Chronicle shows the way back to the choice; and that the afterword is the place's own;
 *  - the policy 'peace' (the Banks' peacemaker, checks/engine/ways/banks.js) is added;
 *  - a place with a stock (the Banks) is checked for its gauges: the card head's gauge and words at
 *    each point of the day, the day map's gauges (and the sister's after the reveal), the Leaving
 *    map's, the sixteen of the Afterwards against the watched future's last season, the banks at the
 *    end in words, the gauge in the map keys; the place's colours marked on the root;
 *  - at the end the way back to the Opening is taken and the other place chosen, and the Opening
 *    must then be that place's (words, mark, sheet), and the first place's again when chosen back.
 * Every check of the stage-2 copy is kept as it was.
 *
 * page-p2 copy of the first review's dom-run.js: the same checks, with these changes only:
 *  - it loads the scripts index.html loads, in its order (places/<id>.js and sheet.js are new);
 *  - the Chronicle lists up to 60 earlier lives (the store keeps 60 now, every place together),
 *    so the expected count is min(60, lives + 1), where it was min(20, lives + 1);
 *  - three checks are added: with one place the choice of places and the way back to it stay
 *    hidden, and the Chronicle ends with the place's afterword.
 *
 * Runs app.js through a whole Life in the stand-in DOM (dom-harness.js) and checks the page logic
 * that the review asked to change. From the game folder (run-dom.sh runs the 28 configurations):
 *   jsc -e "var CHECKS_DIR='<checks folder>'; var CONFIG = {...}" <checks folder>/page/dom-run.js
 */
var HERE = (typeof CHECKS_DIR === 'string' ? CHECKS_DIR : 'checks') + '/page/';   // this folder (CHECKS_DIR: the checks folder)
load(HERE + 'dom-harness.js');
var CLOCK_READS = 0, FX_BOOTED = 0, FX_THROWN = 0;
(function () { var now = performance.now; performance.now = function () { CLOCK_READS++; return now.call(this); }; })();
var C = globalThis.CONFIG || {};
C.screen = C.screen || 'laptop'; C.lives = C.lives || 0; C.seed = C.seed || 48213; C.policy = C.policy || 'short'; C.place = C.place || 'valley';
location.hash = '#' + C.place + '-' + C.seed;
if (C.lives) {
  var past = [], pi;
  for (pi = 0; pi < C.lives; pi++) {
    past.push({ seed: 100 + pi, kept: pi % 2 === 0, purse: 60 + pi, need: 64, mark: pi - 3, seal: pi === 0 });
    if (C.place !== 'valley') past[pi].place = C.place;
  }
  STORE['after-you.lives.v1'] = JSON.stringify(past);
}
screen(C.screen);
(function () {
  var html = readFile('index.html'), re = /<script src="([^"]+)"><\/script>/g, m;
  while ((m = re.exec(html))) {
    if (C.fxThrow && m[1] === 'app.js') ['AYMotion', 'AYSound'].forEach(function (k) {     // modules that start and then throw at every cue
      globalThis[k] = { TIMING: {}, boot: function () { FX_BOOTED++; return true; }, cue: function (name) { FX_THROWN++; throw new Error(k + ' throws at ' + name); } };
    });
    load(m[1]);
  }
})();

var S = AYApp.state, W = AYWords, KIN_WHYS = 0, SLICES = 0, FITTED = [];
var PEACE = {};
load(HERE + 'dom-policies.js');                     // the three new places' honest ways (PLACE_POLICIES_P4, MEMO)
var LIFE_NO = 0;                                     // a new Life starts the policies' memory afresh (their memo is keyed by it)
function honestOf(place) { var k = Object.keys(PLACE_POLICIES_P4[place])[0]; return function (n) { return !!PLACE_POLICIES_P4[place][k](n, S.today.day, 'life' + LIFE_NO); }; }
var POLICY = {
  short: function (n) { return n.situation !== 2; },
  // the place's own custom (the valley's old way: send a hand to someone new, then do as they did yesterday)
  old: function (n) { return S.life.params.CUSTOM[n.situation] === 1; },
  watch: honestOf('watch'), bridges: honestOf('bridges'), salt: honestOf('saltmarket'),
  never: function () { return false; },               // a store that runs below zero where the stakes can take it there
  send: function () { return true; },
  // the Banks' peacemaker (checks/engine/ways/banks.js): keep to your water with a new boat and one that kept to
  // its water yesterday; let a first slip go from a known keeper; after nets crossed both ways, offer peace
  peace: function (n) {
    var m = PEACE[n.id] || (PEACE[n.id] = { miss: 0, ever: false }), y = n.yesterday;
    if (!y) return true;
    if (y.they) { m.miss = 0; m.ever = true; return true; }
    m.miss++;
    if (n.situation === 4) return true;
    return m.ever && m.miss < 2;
  }
}[C.policy];
var STOCK = AfterYou.createLife(1, C.place).params.STOCK || null, GAUGES = 0, BANK_WORDS = 0;
function gaugesIn(id) { return ($(id).innerHTML.match(/<g class="m-gauge">/g) || []).length; }
// a place with a stock: the gauge on each card's head says what the engine says of that tie
function checkBanks(when) {
  var p = S.life.params;
  S.today.neighbours.forEach(function (n, i) {
    var card = $('cards').querySelector('[data-house="' + n.id + '"]'), bank = card.querySelector('.bank');
    if (!STOCK) { ok(!bank, 'no gauge on a card of a place without a stock'); return; }
    var r = S.phase === 'choose' ? null : S.result.results[i], words = r ? W.bankDay(r.stock, r.stockAfter, p, false) : W.bankNow(n.stock, p);
    ok(!!bank && bank.getAttribute('data-bank') === String(n.id), 'the card of house ' + n.id + ' carries its bank ' + when);
    var kids = bank.children, svg = kids[0].innerHTML;
    ok(kids[0].getAttribute('aria-hidden') === 'true' && svg.indexOf('m-gauge-fill') > 0, 'its gauge is a drawing, hidden from a listener');
    ok(kids[1].textContent === words.text && kids[1].getAttribute('aria-hidden') === 'true', 'its caption: ' + kids[1].textContent);
    ok(kids[2].className === 'vh' && kids[2].textContent === words.say, 'and its words for a listener: ' + kids[2].textContent);
    var lv = r ? r.stockAfter : n.stock;
    ok(svg === AYSheet.gauge({ level: lv, top: STOCK.max }), 'the gauge is drawn at ' + lv + ' of ' + STOCK.max);
    ok(card.querySelector('.card-head').children[1] === bank && card.querySelector('.card-head').children[2].className === 'bearing', 'the bank stands between the names and the bearing');
    BANK_WORDS++;
  });
  if (STOCK) {
    var want = 4 + (S.phase === 'revealed' ? S.result.kinWith.filter(function (e) { return typeof e.stockAfter === 'number'; }).length : 0);
    ok(gaugesIn('map-day') === want, 'the day map draws ' + want + ' gauges ' + when + ' (got ' + gaugesIn('map-day') + ')');
    if (S.phase === 'revealed') S.result.kinWith.forEach(function (e) {      // and Elsewhere today says each of them for a listener
      var row = $('else-line-' + e.id).parentNode, said = row.children.filter(function (c) { return c.className === 'vh'; }).map(function (c) { return c.textContent; });
      ok(said.length === 1 && said[0] === W.bankDay(e.stock, e.stockAfter, S.life.params, true).say, 'the sister\'s bank with house ' + e.id + ' is said under Elsewhere today: ' + said.join(' '));
    });
    GAUGES += want;
  } else ok(gaugesIn('map-day') === 0, 'no gauge on the map of a place without a stock');
}
// ---- stage 4: the store, the card numbers, the town, the strip --------------------------------------
var METER_BELOW = 0, CARDS_COUNTED = 0, TOWN_LINES = 0, COLS_CHECKED = 0, STORES_READ = 0, TOTALS_READ = 0;
// the meter of a store: below zero, a hatched part from the zero mark leftward; otherwise as ever
function checkMeter(id, purse, need, when) {
  var bar = $(id).children[0], kids = bar.children, fill = kids[0];
  if (purse < 0) {
    ok(fill.className === 'meter-fill is-below' && kids[1].className === 'meter-zero', 'a store of ' + purse + ' is drawn below the zero mark ' + when);
    var lo = -10 * Math.ceil((3 - purse) / 10), hi = Math.max(need + Math.max(6, Math.round(need * 0.12)), purse + 3), span = hi - lo;
    ok(fill.getAttribute('style') === 'left:' + ((purse - lo) / span * 100).toFixed(2) + '%;width:' + ((0 - purse) / span * 100).toFixed(2) + '%', 'the part below zero runs from ' + purse + ' to the zero mark: ' + fill.getAttribute('style'));
    ok(kids[1].getAttribute('style') === 'left:' + ((0 - lo) / span * 100).toFixed(2) + '%', 'the zero mark stands at zero on the scale');
    METER_BELOW++;
  } else ok(fill.className === 'meter-fill' && bar.querySelector('.meter-zero') === null, 'a store of ' + purse + ' fills from zero, with no zero mark ' + when);
  ok($(id).children[1].textContent === W.storeNeedTick(need), 'the need is marked: ' + $(id).children[1].textContent);
}
function checkDay(when) {
  var p = S.life.params, t = S.today, r = S.result, purse = S.phase === 'choose' ? t.purse : r.purse;
  if (t.day === 1 && S.phase === 'choose') ok(t.purse === p.STORE_START && $('store-text').textContent === W.store(p.STORE_START, t.need), 'day 1 shows the starting store: ' + $('store-text').textContent);
  checkMeter('store-meter', purse, t.need, when);
  ok($('store-text').textContent === W.store(purse, t.need), 'the store says the engine\'s purse and need ' + when + ': ' + $('store-text').textContent);
  STORES_READ++;
  var town = $('day-status').querySelector('.status-town');
  if (S.phase === 'revealed') {
    var sum = 0;
    r.results.forEach(function (x) {
      var lv = p.STOCK ? x.stock : 1;
      sum += p.B * lv * (x.they ? 1 : 0) - p.C * (x.arrived ? 1 : 0) + p.S * (x.arrived && x.they ? 1 : 0) - p.H * (!x.arrived && !x.they ? 1 : 0);
    });
    var totalNode = $('day-status').children[0];
    ok(r.purse === t.purse + sum && totalNode.textContent === W.dayTotal(sum, t.purse + sum, t.need), 'the day\'s total is the four cards\' numbers (' + sum + ') and the store after them ' + when + ': ' + totalNode.textContent);
    TOTALS_READ++;
  }
  if (S.phase === 'revealed') {
    r.results.forEach(function (x, i) {        // each card: its sentence and number with the Life's stakes, the number the stakes of its outcome
      var card = $('cards').querySelector('[data-house="' + x.id + '"]'), rv = W.reveal(x, p);
      var pay = p.B * (p.STOCK ? x.stock : 1) * (x.they ? 1 : 0) - p.C * (x.arrived ? 1 : 0) + p.S * (x.arrived && x.they ? 1 : 0) - p.H * (!x.arrived && !x.they ? 1 : 0);
      ok(card.querySelector('.result-text').textContent === rv.text && card.querySelector('.result-num').textContent === W.signed(x.payoff) && x.payoff === pay, 'the card of house ' + x.id + ' says its outcome and number: ' + rv.full);
      CARDS_COUNTED++;
    });
    if (p.CHARTER === 'breaks') {
      ok(!!town && town.textContent === ' ' + W.dayTown(r.results, p), 'the day\'s total carries what the town paid: ' + (town && town.textContent));
      TOWN_LINES++;
    } else ok(!town, 'no town line where the charter holds');
  } else ok(!town, 'no town line while choosing');
}
// the strip, once the future has played: each season's column on the charter's side of the line by its flow
function checkStrip() {
  var p = S.life.params, s, flow, col, worse;
  for (s = 1; s <= 30; s++) {
    flow = S.future.seasons[s - 1].flow; col = $('flow-col-' + s);
    worse = p.CHARTER === 'breaks' ? flow >= p.HOLD_LINE : flow < p.HOLD_LINE;
    ok(col.classList.contains(p.CHARTER === 'breaks' ? 'is-over' : 'is-under') === worse && !col.classList.contains(p.CHARTER === 'breaks' ? 'is-under' : 'is-over'), 'season ' + s + ' (flow ' + flow.toFixed(3) + ') is drawn on the ' + (worse ? 'worse' : 'good') + ' side for the charter ' + p.CHARTER);
    COLS_CHECKED++;
  }
  ok($('flow-rule').textContent === W.flowLabels(p).rule && $('flow-strip').getAttribute('aria-label') === W.flowAlt(S.future, p), 'the strip\'s rule and words are the place\'s, from the Life');
}
function sheetW() { return BOX_W < 34 * 16 ? 380 : 600; }
function wide() { return matchMedia(Q.wide).matches; }
function two() { return matchMedia(Q.two).matches; }
function checkLetters(mapId) {
  var px = minLetterPx(mapId, sheetW());
  ok(px >= 11, mapId + ': smallest lettering is ' + px.toFixed(2) + 'px in a box of ' + BOX_W + 'px (' + C.screen + ')');
  return px;
}
function checkOrder(what) {
  ok(cardOrder() === (wide() ? '6,2,7,1' : '1,2,6,7'), 'card order ' + what + ': ' + cardOrder() + ' with two-by-two ' + wide());
}
function checkActions(what) {
  var box = $('day-actions');
  if (S.phase === 'revealed' && two()) ok(box.nextElementSibling === $('cards'), 'the day\'s button comes before the cards ' + what);
  else ok($('elsewhere').nextElementSibling === box, 'the day\'s button comes after the cards, the season\'s end and Elsewhere today ' + what);
}

// ---- opening ----
oneView('opening');
ok(document.documentElement.getAttribute('data-place') === C.place, 'the place in hand is marked on the root for its colours: ' + document.documentElement.getAttribute('data-place'));
if (STOCK) ok(gaugesIn('map-opening') === 4, 'the Opening sheet draws the four banks as they begin');
var shownLives = $('opening-past-list').children.length, restLives = $('opening-past-rest').children.length, more = $('opening-past-more');
ok(shownLives + restLives === C.lives, 'every earlier life is in the page: ' + shownLives + ' + ' + restLives + ' of ' + C.lives);
ok($('opening-past').hidden === (C.lives === 0), 'the list of earlier lives is hidden exactly when there is none');
if (C.lives > 3) {
  // (two places: the choice takes a row of the Opening, so it lists two lives, not three)
  ok(shownLives === 2 && !more.hidden && !more.open, 'two latest lives, the rest behind a closed control');
  ok($('opening-past-more-head').textContent === (C.lives - 2) + ' older lives', 'the control is named by its count: ' + $('opening-past-more-head').textContent);
  var pastLead = W.pastLife({ place: C.place, seed: 100, kept: true, purse: 1, need: 2, mark: 0, seal: false }).split(':')[0] + ':';
  ok($('opening-past-list').children[0].textContent.indexOf(pastLead) === 0 && $('opening-past-rest').children[0].textContent.indexOf(pastLead.replace('100', '102')) === 0, 'newest first, and the older ones follow on: ' + pastLead);
} else ok(shownLives === C.lives && more.hidden, 'up to three lives are listed outright (two places: the Opening lists two, and a single older life outright)');
ok($('opening-lines').children[2].textContent === W.opening(S.life ? S.life.params : AfterYou.createLife(1, S.place).params).lines[2] && /every fourth day/.test($('opening-lines').children[2].textContent), 'the opening says every fourth day');
var opts = $('opening-places-row').children.map(function (l) { return l.querySelector('input'); });
ok(!$('opening-places').hidden && AYPlaces.order.join() === 'valley,banks,watch,bridges,saltmarket' && opts.map(function (o) { return o.value; }).join() === 'valley,banks,watch,bridges,saltmarket', 'five places: the choice shows all five, in the play order');
ok(opts.filter(function (o) { return o.checked; }).map(function (o) { return o.value; }).join() === C.place, 'the place of the hash is the one chosen');
ok($('opening-premise').textContent === W.opening(AfterYou.createLife(1, C.place).params).premise, 'the Opening speaks the words of the place in hand');
checkLetters('map-opening');

// ---- the twelve days ----
click($('begin'));
oneView('day');
ok(S.life.seed === C.seed && S.life.place === C.place, 'the Life of the hash: ' + S.life.place + ' ' + S.life.seed);
var day, firstLetters = null;
for (day = 1; day <= 12; day++) {
  ok(S.phase === 'choose' && S.today.day === day, 'day ' + day + ' is open for choosing');
  checkOrder('while choosing on day ' + day); checkActions('while choosing');
  var px = checkLetters('map-day');
  if (firstLetters === null) firstLetters = px;
  S.today.neighbours.forEach(function (n) {
    var send = !!POLICY(n), a = $('choice-' + n.id + '-send'), b = $('choice-' + n.id + '-stay');
    ok(a.name === 'choice-' + n.id && a.value === 'send' && b.value === 'stay' && a.type === 'radio', 'radio hooks of house ' + n.id);
    a.checked = send; b.checked = !send;
    fire(send ? a : b, 'change');
  });
  ok(!$('close-day').disabled && $('next-day').hidden, 'four choices made: the day can be closed');
  checkBanks('while choosing on day ' + day);
  checkDay('while choosing on day ' + day);
  click($('close-day'));
  ok(S.phase === 'revealed', 'the day is closed');
  checkBanks('once day ' + day + ' is closed');
  checkDay('once day ' + day + ' is closed');
  checkOrder('after the reveal'); checkActions('after the reveal');
  checkLetters('map-day');
  // every Why? on the cards
  S.result.results.forEach(function (r) {
    var card = $('cards').querySelector('[data-house="' + r.id + '"]'), why = card.querySelector('[data-why="' + r.id + '"]');
    ok(!!why && why.tagName === 'BUTTON', 'Why? on the card of house ' + r.id);
    idsExist(why.getAttribute('aria-labelledby')); idsExist(why.getAttribute('aria-controls'));
    var before = LOG.scrolls.length;
    click(why);
    ok(card.classList.contains('is-flipped') && why.getAttribute('aria-expanded') === 'true', 'the card of house ' + r.id + ' turns over');
    ok(document.activeElement === card.querySelector('.back-title'), 'focus goes to the back of the card');
    ok(LOG.scrolls.length === before + 1 && LOG.scrolls[before].block === 'nearest', 'the turned card is kept in the window');
    ok(card.querySelector('.card-back').getAttribute('inert') === null && card.querySelector('.card-front').getAttribute('inert') !== null, 'the face out of sight is inert');
    click(card.querySelector('[data-why-back="' + r.id + '"]'));
    ok(!card.classList.contains('is-flipped') && document.activeElement === why, 'the card turns back and focus returns to Why?');
    ok(LOG.scrolls.length === before + 1, 'turning back moves nothing');
  });
  // every Why? under Elsewhere today
  var kinBtns = $('elsewhere-body').querySelectorAll('[data-why-kin]'), names = {};
  kinBtns.forEach(function (btn) {
    ok(!!btn.id && btn.getAttribute('aria-labelledby') === btn.id + ' else-line-' + btn.getAttribute('data-why-kin'), 'the Why? under Elsewhere is named by itself and its sentence');
    idsExist(btn.getAttribute('aria-labelledby')); idsExist(btn.getAttribute('aria-controls'));
    var said = btn.getAttribute('aria-labelledby').split(' ').map(function (id) { return $(id).textContent; }).join(' ');
    ok(/^Why\? .+\.$/.test(said) && !names[said], 'its name is its own: ' + said);
    names[said] = true;
    var box = $(btn.getAttribute('aria-controls'));
    click(btn); ok(!box.hidden && btn.getAttribute('aria-expanded') === 'true', 'the reason under Elsewhere opens');
    click(btn); ok(box.hidden, 'and closes');
  });
  if (kinBtns.length) KIN_WHYS += kinBtns.length;
  // once in the Life: the window crosses both lines while the day is closed, and comes back
  if (day === 5) {
    var home = C.screen, away = home === 'laptop' ? 'phone' : 'laptop';
    $('next-day').focus();
    screen(away);
    checkOrder('after the window became a ' + away); checkActions('after the window became a ' + away);
    ok(document.activeElement === $('next-day'), 'the button moved with the layout keeps the focus');
    checkLetters('map-day');
    var whyBtn = $('cards').querySelector('[data-why="6"]');
    whyBtn.focus();
    screen(home);
    checkOrder('back on a ' + home); checkActions('back on a ' + home);
    ok(document.activeElement === whyBtn, 'a card moved with the layout keeps the focus');
    screen('tablet'); checkOrder('on a tablet'); checkActions('on a tablet'); screen(home);
  }
  // a phone: fold the map away while scrolled down, and bring it back
  if (!wide() && (day === 2 || day === 6)) {
    var bar = $('map-bar'), fig = $('day-map-figure'), s0 = LOG.scrolls.length, b0 = LOG.scrollBy.length;
    bar._top = 6;
    var fold = $('map-fold');
    // the stand-in lays nothing out: say where the bar lands once the map above it is gone
    var realToggle = bar.classList.toggle;
    bar.classList.toggle = function (c, on) { if (c === 'is-folded') bar._top = on ? -198 : 6; return realToggle.call(bar.classList, c, on); };
    click(fold);
    ok(fig.hidden && fold.getAttribute('aria-expanded') === 'false' && fold.textContent === W.mapFold(true), 'the map is folded away');
    ok(LOG.scrollBy.length === b0 + 1 && LOG.scrollBy[b0] === -204, 'the page moves up by what was folded away: ' + LOG.scrollBy[b0]);
    ok(LOG.scrolls.length === s0 + 1 && LOG.scrolls[s0].id === 'map-bar', 'and the bar is kept in the window');
    click(fold);
    ok(!fig.hidden && fold.textContent === W.mapFold(false), 'the map is shown again');
    ok(LOG.scrolls[LOG.scrolls.length - 1].id === 'day-map-figure', 'and brought into the window');
    checkLetters('map-day');
    bar.classList.toggle = realToggle;
  }
  advance(400);
  click($('next-day'));
  if (S.view === 'day' && S.phase === 'season') {
    ok(day % 4 === 0 && $('cards').hidden && !$('season-end').hidden, 'the season\'s end stands in place of the cards');
    checkActions('at the season\'s end');
    advance(400);
    click($('next-day'));
  }
}

// ---- leaving, the Afterwards, the Chronicle ----
oneView('leaving');
checkMeter('leaving-meter', AfterYou.today(S.life).purse, S.life.need, 'on Leaving');
checkLetters('map-leaving');
ok(gaugesIn('map-leaving') === (STOCK ? 4 : 0), 'the Leaving map draws the banks you leave');
if (STOCK) {                                        // review-fix1: and says them, for a listener (finding banks-07)
  var leaveAlt = /aria-label="([^"]*)"/.exec($('map-leaving').innerHTML)[1];
  ok(leaveAlt.indexOf('at the end of day 12') >= 0 && AfterYou.today(S.life).neighbours.every(function (n) { return leaveAlt.indexOf(n.stock + ' with ') >= 0; }), 'the Leaving map says the banks you leave: ' + leaveAlt);
}
advance(400);
click($('leave'));
oneView('afterwards');
checkLetters('map-after');
// names lettered beside their holdings (houses 2 and 6) keep inside the frame where the lettering is enlarged
[2, 6].forEach(function (id) {
  var node = $('af-name-' + id), name = node.textContent, set = node.getAttribute('textLength');
  ok(name === S.future.seasons[0].houses[id].name.toUpperCase(), 'the Afterwards map letters house ' + id + ': ' + name);
  var size = Number(node.getAttribute('font-size')), long = name.length * size * 0.92;
  if (set !== null) { FITTED.push(name + ' set to ' + set + ' of about ' + long.toFixed(0)); ok(Number(set) > 60 && Number(set) < long, 'a long name is set to the room there is'); }
  ok((set !== null) === (BOX_W === 288 && name.length >= 7), 'only a long name on a narrow phone is fitted: ' + name + ' in ' + BOX_W + 'px');
});
ok((/textLength=/.test($('map-leaving').innerHTML)) === (FITTED.length > 0), 'the Leaving map fits the same names');
ok(!!$('flow-col-30') && $('flow-strip').closest('.after-right') !== null, 'the strip stands in the second column');
ok($('flow-strip').closest('.after-right').children[0].classList.contains('flow'), 'at its head, above the list of events');
if (C.awayTab) document.hidden = true;
if (C.watch) {
  advance(21000);
  ok(S.after.done && S.after.shown === 30, 'the future plays to its end by the clock');
} else {
  advance(700);
  ok(!S.after.done && S.after.shown >= 1, 'the future is playing');
  var doneBefore = S.job.futuresDone;
  click($('skip'));
  ok(S.after.done && $('skip').hidden, 'Skip ends it');
  if (!S.verdict) {
    var slices = 0;
    while (!S.verdict) { advance(40); if (++slices > 50) throw new Error('the count does not finish after Skip'); }
    ok(C.awayTab ? slices === 1 : slices <= 6, 'after Skip the count finishes in ' + slices + ' slice(s) from ' + doneBefore + ' futures' + (C.awayTab ? ' (page not in front)' : ''));
    SLICES = slices;
  }
}
advance(300);
ok(!!S.verdict && !$('to-chronicle').hidden && !$('to-chronicle').disabled && $('after-counting').hidden, 'the count is in and the way on is open');
checkStrip();
if (STOCK) {
  // the sixteen banks of the Afterwards, as the watched future's last season left them
  var ties30 = S.future.seasons[29].ties, kind30 = BOX_W < 34 * 16 ? 'compact' : 'wide', set30 = 0;
  AfterYou.tieList.forEach(function (tie, k) {
    var key = tie[0] + '-' + tie[1], node = $('af-gauge-' + key);
    ok(node.getAttribute('d') === AYSheet.gaugeD(AYPlaces.byId[C.place].sheet, kind30, key, { level: ties30[k], top: STOCK.max }), 'the bank ' + key + ' stands at ' + ties30[k] + ' in season 30');
    set30++;
  });
  var housesEnd = $('after-houses').children;
  ok(set30 === 16 && housesEnd.length === 9 && housesEnd[8].textContent === W.banksAtEnd(ties30, S.life.params), 'the resting map in words ends with the banks: ' + housesEnd[8].textContent);
  ok($('map-after-legend').textContent.indexOf(W.legendGauge(S.life.params)) >= 0 && $('map-day-legend').textContent.indexOf(W.legendGauge(S.life.params)) >= 0, 'both map keys carry the gauge');
} else ok($('after-houses').children.length === 8 && gaugesIn('map-after') === 0, 'no banks where the place has no stock');
click($('to-chronicle'));
oneView('chronicle');
checkMeter('chron-meter', S.verdict.purse, S.verdict.need, 'in the Chronicle');
ok($('chron-house').textContent === W.houseLine(S.verdict), 'the Chronicle tells the store: ' + $('chron-house').textContent);
var at = S.scaleAt, gapPx = Math.abs(at.you - at.old) / 100 * BOX_W, pin = $('scale-pin-old');
ok(pin.classList.contains('is-under') === (gapPx < 11), 'the old way\'s ring is drawn wide exactly where the pins coincide (gap ' + gapPx.toFixed(1) + 'px)');
ok($('chron-past-list').children.length === Math.min(20, C.lives + 1), 'the Chronicle lists the newest twenty earlier lives at most, this one with them');
ok(!$('other-place').hidden, 'five places: the way back to the choice of places is shown');
ok($('chron-afterword').textContent === AYPlaces.byId[C.place].afterword && $('chron-afterword').textContent.length > 100, 'the Chronicle ends with the place\'s afterword');
var SEASON_LINES = 0;
// the line of a seal withheld by the season replay: right after the mark's noise line, in the place's words,
// exactly where the seal would otherwise have been earned (LEAD L1)
var SEASON_REFUSED = 0;
function checkSeasonLine() {
  var node = document.getElementById('chron-season'), sl = S.verdict.seal || {}, lex = AYPlaces.byId[C.place].lexicon;
  var due = !!(sl.wonOnSeason && sl.houseKept && sl.markClear && !sl.boughtOnLastDay && !sl.lastDayCost && !sl.wonOnLastDay);
  if (due) {
    ok(!!node && $('chron-noise').nextElementSibling === node && node.textContent === lex.lastSeason.rests && !S.verdict.seal.earned && /^No seal this time: /.test(node.textContent),
       'a seal withheld by the season replay alone: its line under the mark, in the place\'s words: ' + (node ? node.textContent : 'none'));
    SEASON_LINES++;
  } else {
    ok(!node, 'no line of the season replay where it did not withhold, alone, a seal otherwise earned');
    if (sl.wonOnSeason) SEASON_REFUSED++;
  }
}
var sealNode = $('chron-seal'), SEAL_SAID = S.verdict.seal && S.verdict.seal.earned ? 'earned' : 'not earned';
ok(sealNode.hidden === !(S.verdict.seal && S.verdict.seal.earned) && (sealNode.hidden || sealNode.textContent === AYPlaces.byId[C.place].charter.seal), 'the seal, in the place\'s words, exactly when earned');
checkSeasonLine();
advance(400);
click($('again-same'));
oneView('day');
ok(S.life.day === 1 && S.life.seed === C.seed && S.life.place === C.place, 'the same place and seed again');
checkOrder('in the new Life');
// the way back to the Opening, and the other place chosen there; then the first place again
var other = C.place === 'valley' ? 'banks' : 'valley';
PEACE = {}; LIFE_NO++;                              // a new Life: the policies' memory starts afresh
for (day = 1; day <= 12; day++) {                   // this second Life, played through to its Chronicle without the checks above
  S.today.neighbours.forEach(function (n) { var send = !!POLICY(n), a = $('choice-' + n.id + '-send'), b = $('choice-' + n.id + '-stay'); a.checked = send; b.checked = !send; fire(send ? a : b, 'change'); });
  click($('close-day')); advance(400); click($('next-day'));
  if (S.view === 'day' && S.phase === 'season') { advance(400); click($('next-day')); }
}
oneView('leaving'); advance(400); click($('leave')); advance(700); click($('skip'));
var g2 = 0; while (!S.verdict) { advance(40); if (++g2 > 2000) throw new Error('the second count never finished'); }
advance(300); click($('to-chronicle')); oneView('chronicle');
ok($('chron-past-list').children.length === Math.min(20, C.lives + 2), 'both Lives of this run are listed (of the newest twenty)');
checkSeasonLine();
advance(400);
click($('other-place'));
oneView('opening');
var pick = $('place-' + other); pick.checked = true; fire(pick, 'change');
ok(S.place === other && document.documentElement.getAttribute('data-place') === other, 'the chooser puts ' + other + ' in hand and marks it');
ok($('opening-premise').textContent === W.opening(AfterYou.createLife(1, other).params).premise && $('h-chron-valley').textContent === W.heads().valley, 'the Opening and the copy at rest are ' + other + '\'s');
ok(gaugesIn('map-opening') === (AfterYou.createLife(1, other).params.STOCK ? 4 : 0), 'the Opening sheet is ' + other + '\'s');
pick = $('place-' + C.place); pick.checked = true; fire(pick, 'change');
ok(S.place === C.place && document.documentElement.getAttribute('data-place') === C.place && $('opening-premise').textContent === W.opening(AfterYou.createLife(1, C.place).params).premise, 'and back to ' + C.place);
if (C.fxThrow) ok(FX_BOOTED === 2 && FX_THROWN > 100, 'both throwing modules started, and every cue they were given threw (' + FX_THROWN + ' cues)');

print('OK ' + JSON.stringify(C) + ': ' + CHECKS + ' checks; season lines ' + SEASON_LINES + ' (refused where the replay withheld a seal out of reach anyway ' + SEASON_REFUSED + '); seal ' + SEAL_SAID + '; stores read ' + STORES_READ + ', day totals read ' + TOTALS_READ + '; cards counted ' + CARDS_COUNTED + ', meters below zero ' + METER_BELOW + ', town lines ' + TOWN_LINES + ', strip columns ' + COLS_CHECKED + '; gauges on the day maps ' + GAUGES + ', banks on the cards ' + BANK_WORDS + '; lettering on day 1 ' + firstLetters.toFixed(2) + 'px; Why? under Elsewhere ' + KIN_WHYS +
      '; slices after Skip ' + SLICES + '; pins ' + gapPx.toFixed(1) + 'px apart' + (pin.classList.contains('is-under') ? ' (ring drawn wide)' : '') + (FITTED.length ? '; fitted: ' + FITTED.join(', ') : '') +
      (C.fxThrow ? '; modules that throw: ' + FX_THROWN + ' cues thrown' : '') + '; clock reads ' + CLOCK_READS);
