/*
 * After You: page smoke test (jsc).   cd <this folder> && "$JSC" page-smoke.js
 *
 * Loads engine.js and words.js and, for 24 valleys and six ways of playing (the three the brief
 * names and three more that reach the branches those never do), makes the same engine calls in
 * the same order as app.js makes for a complete Life: every day, every reveal, every Why?, every
 * season's end, Leaving, the watched future, and the verdict by verdictJob / verdictStep.
 * Every function of AYWords is called with the real engine data at each point. Every returned
 * sentence is checked; every engine field app.js reads for drawing is read and must be defined.
 * Along the way it checks that what the page says adds up: the list under "In the future you
 * watched" against the closing count, the ring at rest against the same count, the two sides of
 * a card, and that the second click of a double click does nothing.
 */
load('engine.js');
load('words.js');

var A = AfterYou, RAW = AYWords, T0 = preciseTime();

// ---- the checks ---------------------------------------------------------------------------------

var FORBIDDEN = ['cooperate', 'cooperates', 'cooperated', 'cooperation', 'defect', 'defects', 'defected', 'defection',
  'prisoner', 'prisoners', 'dilemma', 'strategy', 'strategies', 'payoff', 'payoffs', 'tit for tat', 'game theory',
  'player', 'players', 'firm', 'soft', 'taker', 'takers', 'wary', 'steady'];
var FORBIDDEN_RE = new RegExp('\\b(' + FORBIDDEN.join('|') + ')\\b', 'i');
var BAD = [
  [/undefined/, 'contains "undefined"'], [/NaN/, 'contains "NaN"'], [/null/, 'contains "null"'],
  [/\[object/, 'contains "[object"'], [/ {2}/, 'contains a double space'],
  [/!/, 'contains an exclamation mark'], [/\u2014/, 'contains an em dash'], [/^\s|\s$/, 'starts or ends with a space']
];

var sentences = 0, calls = {}, produced = {}, where = 'start';

function fail(msg) { throw new Error('page-smoke: ' + msg + '  [at ' + where + ']'); }
function checkSentence(s, fn) {
  if (typeof s !== 'string' || !s.length) fail(fn + ' returned ' + JSON.stringify(s) + ', not a non-empty string');
  for (var i = 0; i < BAD.length; i++) if (BAD[i][0].test(s)) fail(fn + ': sentence ' + BAD[i][1] + ': "' + s + '"');
  var m = FORBIDDEN_RE.exec(s);
  if (m) fail(fn + ': forbidden word "' + m[1] + '" in "' + s + '"');
  sentences++;
}
function need(v, label) {
  if (v === undefined) fail('engine field app.js draws from is undefined: ' + label);
  if (typeof v === 'number' && v !== v) fail('engine field app.js draws from is NaN: ' + label);
  return v;
}
function assert(cond, msg) { if (!cond) fail('check failed: ' + msg); }

// Every AYWords function, wrapped so that each call is counted and each result checked. Each one
// returns a string or an array of strings (brief, section 1): anything else fails in checkSentence.
var W = {};
Object.keys(RAW).forEach(function (k) {
  if (typeof RAW[k] !== 'function') fail('AYWords.' + k + ' is not a function');
  calls[k] = 0; produced[k] = 0;
  W[k] = function () {
    var out = RAW[k].apply(RAW, arguments), i;
    calls[k]++;
    if (Array.isArray(out)) {
      for (i = 0; i < out.length; i++) checkSentence(out[i], k + '[' + i + ']');
      produced[k] += out.length;
    } else {
      checkSentence(out, k);
      produced[k]++;
    }
    return out;
  };
});

// ---- ways of playing ----------------------------------------------------------------------------

var POLICIES = [
  { name: 'always send', pick: function () { return true; } },
  { name: 'send unless left short yesterday', pick: function (n) { return n.situation !== 2; } },
  { name: 'send unless left short yesterday, and stay home against everyone on day 12',
    pick: function (n, t) { return t.day === 12 ? false : n.situation !== 2; } },
  // three more, for the branches the first three never reach
  { name: 'never send', pick: function () { return false; } },
  { name: 'a coin for every choice', pick: function (n, t, seed) { return A.draw(seed, 977, t.day, n.id, 0, 0) < 0.5; } },
  { name: 'stay home on first meeting, then do as they did',
    pick: function (n) { return n.yesterday ? n.yesterday.they : false; } }
];
var SEEDS = [48213, 1, 2, 3, 7, 11, 19, 42, 101, 256, 777, 1024, 2024, 4096, 5150, 8191, 9001, 12345, 31337, 54321, 65535, 77777, 90210, 99991];
var FULL = { '48213/2': 1, '7/0': 1, '42/1': 1, '31337/4': 1, '2024/3': 1, '9001/5': 1 };   // verdicts counted on the full 2000 futures
var SAMPLES = ['48213/2', '7/0', '42/1', '31337/4', '2024/3'];

var seenStats = { lives: 0, lost: 0, youWhy: 0, houseWhy: 0, farWhy: 0, blankWhy: 0, against: 0, kinWhyYou: 0, tookYours: 0,
  changedDay: 0, wholeHarvest: 0, twoCounts: 0, hollow: 0, kept: 0, seal: 0, lastDay: 0, matteredHabit: 0, matteredLastDay: 0, matteredNone: 0,
  kinArrival: 0, heirGivesUp: 0, othersTakeUp: 0, backToOwnWay: 0, arrivalOnYourWays: 0, othersKeptAtStart: 0, ringOneRoundBehind: 0,
  negativePurse: 0, barely: 0 };

function mirror(s) { return s === 2 ? 3 : s === 3 ? 2 : s; }

// The day a neighbour took up the reader's own ways, as the season's end reported it (app.js: tookDay).
function tookDay(life, id) {
  for (var r = life.rounds.length - 1; r >= 0; r--) {
    var list = life.rounds[r].reconsidered;
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (e.house === id && e.adopted && e.took > 0) return e.model === 0 ? life.rounds[r].season * 4 : 0;
    }
  }
  return 0;
}

// Which events of the watched future get a line, and which lines are about the reader
// (app.js: yoursWay, kinHolds, tickerShows, wayBefore, aboutYou). Each must answer both ways somewhere.
var answered = { kinHolds: [0, 0], tickerShows: [0, 0], aboutYou: [0, 0] };
var twoCountsCase = null;      // the first card whose two sides count differently, for a look at it on the page itself
function answer(name, yes) { answered[name][yes ? 1 : 0]++; return yes; }
function yoursWay(w, kin) { return w === 0 || w === kin; }
function kinHolds(f, kin, season) {
  var a = f.arrival;
  return answer('kinHolds', !(a && a.house === kin && season >= a.season));
}
function tickerShows(ev, kin) {
  if (ev.type === 'arrival') return answer('tickerShows', true);
  if (ev.type !== 'adopt' || !ev.changed) return answer('tickerShows', false);
  return answer('tickerShows', !(yoursWay(ev.way, kin) && yoursWay(ev.from, kin)));
}
function wayBefore(life, f, id, season) {
  if (season < 2) return life.houses[id].way;
  var prev = f.seasons[season - 2], w = prev.houses[id].way, j;
  for (j = 0; j < prev.events.length; j++) if (prev.events[j].type === 'adopt' && prev.events[j].adopter === id) w = prev.events[j].way;
  return w;
}
function aboutYou(ev, season, life, f) {
  var kin = life.kin;
  if (ev.type === 'arrival') return answer('aboutYou', ev.house === kin || yoursWay(wayBefore(life, f, ev.house, season), kin));
  if (ev.adopter === 0) return answer('aboutYou', true);
  if (ev.adopter === kin && kinHolds(f, kin, season)) return answer('aboutYou', true);
  return answer('aboutYou', yoursWay(ev.way, kin) || yoursWay(ev.from, kin));
}
// The list under "In the future you watched", as app.js builds it (renderChronicle, watchedLines).
function watchedList(life, f) {
  var out = [RAW.watchedStart(life.houses, life.kin)], s, j, S, ctx;
  for (s = 1; s <= 30; s++) {
    S = f.seasons[s - 1]; ctx = { kinId: life.kin, kinHolds: kinHolds(f, life.kin, s) };
    for (j = 0; j < S.events.length; j++) {
      if (tickerShows(S.events[j], life.kin) && aboutYou(S.events[j], s, life, f)) out.push(RAW.tickerLine(S.events[j], s, ctx));
    }
  }
  return out.concat([RAW.futureEnd(f), RAW.yourWaysEnd(f)]);
}

function wordsForWhy(why, ctx) {
  need(why.situation, 'why.situation'); need(why.source.type, 'why.source.type'); need(why.seen.n, 'why.seen.n');
  need(why.againstHabit, 'why.againstHabit'); need(why.source.far, 'why.source.far'); need(why.source.deeds, 'why.source.deeds');
  var out = [W.whyStood(why, ctx)].concat(W.whySource(why, ctx), W.whyDeeds(why, ctx), W.whyClose(why, ctx));
  if (why.source.type === 'own') {
    // The front of a card counts since the house last changed a way; this side quotes the whole Life and says so.
    var whole = / counted over the whole harvest\.$/.test(out[2] || '');
    assert(whole === (ctx.changedDay !== null && why.seen.n > 0), 'an own way of a house that changed says which count it quotes');
    if (whole) seenStats.wholeHarvest++;
    if (ctx.front && (ctx.front.h !== why.seen.h || ctx.front.n !== why.seen.n)) {
      assert(whole, 'the two sides of a card give different counts and the Why? side does not say why');
      seenStats.twoCounts++;
    }
  }
  if (why.source.type === 'you') {
    need(why.source.digest.n, 'digest.n'); need(why.source.digest.sent, 'digest.sent');
    assert(why.source.digest.n >= 1, 'a habit learned from you quotes at least one deed');
    assert(why.source.deeds.length === why.source.digest.n, 'digest.n counts source.deeds');
    for (var i = 0; i < why.source.deeds.length; i++) { need(why.source.deeds[i].helped, 'deed.helped'); need(why.source.deeds[i].day, 'deed.day'); }
    assert(W.whyDeeds(why, ctx).length >= 1, 'a Why? card from you lists a deed');
    seenStats.youWhy++;
    if (why.againstHabit) seenStats.against++;
  }
  if (why.source.type === 'house') { seenStats.houseWhy++; if (why.source.far) seenStats.farWhy++; }
  if (why.source.type === 'blank') seenStats.blankWhy++;
  return out;
}

// ---- one complete Life, as app.js runs it ------------------------------------------------------

function liveOne(seedIn, policy, policyIndex) {
  var tag = seedIn + '/' + policyIndex;
  where = 'valley ' + seedIn + ', ' + policy.name;
  var life = A.createLife(seedIn), record = [], firstYou = null, s, i, j;
  need(life.seed, 'life.seed'); need(life.kin, 'life.kin'); need(life.need, 'life.need');
  assert(String(life.seed) === String(seedIn), 'life.seed is the valley number');
  var titles = A.ways(life).map(function (w) { return need(w.title, 'ways().title'); });
  assert(titles.length === 5, 'five ways');

  for (var day = 1; day <= 12; day++) {
    where = 'valley ' + seedIn + ', ' + policy.name + ', day ' + day;
    var t = A.today(life);
    assert(t.day === day && !t.over, 'today().day counts 1..12');
    need(t.purse, 'today().purse'); need(t.need, 'today().need'); need(t.oldWayPurse, 'today().oldWayPurse');
    need(t.season, 'today().season'); need(t.dayOfSeason, 'today().dayOfSeason');
    W.dayOf(t.day); if (t.day === 12) W.lastDayNote();
    W.storeHeading(); W.store(t.purse, t.need); W.storeNeed(t.need); W.oldWay(t.oldWayPurse);
    assert(t.neighbours.length === 4, 'four neighbours');
    var choices = {}, left = 4;
    W.closeDay(left);
    for (i = 0; i < 4; i++) {
      var n = t.neighbours[i];
      assert(n.id === life.neighbours[i], 'today().neighbours keeps the engine order');
      need(n.name, 'neighbour.name'); need(n.kin, 'neighbour.kin'); need(n.situation, 'neighbour.situation');
      need(n.changedDay, 'neighbour.changedDay'); need(n.yesterday, 'neighbour.yesterday');
      need(life.houses[n.id].way, 'life.houses[id].way');
      W.cardTitle(n); if (n.kin) W.cardSub(n);
      var td = tookDay(life, n.id);
      if (td) { W.tookYourWays(td); seenStats.tookYours++; }
      W.choiceFor(n); W.yesterday(n.yesterday); W.send(); W.stay();
      W.knowHeading(); W.standsToday(); W.todayTag();
      var rows = n.changedDay !== null ? n.seenSince : n.seen;
      if (n.changedDay !== null) { W.seenChanged(n.changedDay); seenStats.changedDay++; }
      assert(rows.length === 5, 'five rows of what you know');
      for (s = 0; s < 5; s++) {
        need(rows[s].h, 'seen.h'); need(rows[s].n, 'seen.n');
        W.seenLabel(s); W.seenCount(rows[s]); W.seenRow(s, rows[s]);
      }
      W.seenNote();
      choices[n.id] = !!policy.pick(n, t, life.seed);
      left--; W.closeDay(left);
    }
    record.push(choices);

    // Your ways, with today's pending cuts placed by the reader's situation on each tie.
    var wy = A.ways(life);
    W.waysHeading(); W.waysKey(); W.waysPending();
    for (s = 0; s < 5; s++) { need(wy[s].h, 'ways().h'); need(wy[s].deeds, 'ways().deeds'); W.wayCount(wy[s]); }

    var res = A.playDay(life, choices);
    need(res.gained, 'playDay().gained'); need(res.purse, 'playDay().purse'); need(res.over, 'playDay().over');
    assert(res.day === day, 'playDay().day');
    W.dayTotal(res);
    if (res.purse < 0) seenStats.negativePurse++;
    for (i = 0; i < 4; i++) {
      var r = res.results[i], n0 = t.neighbours[i];
      assert(r.id === n0.id, 'results keep the order of today().neighbours');
      need(r.intended, 'result.intended'); need(r.lost, 'result.lost'); need(r.arrived, 'result.arrived');
      need(r.they, 'result.they'); need(r.payoff, 'result.payoff');
      assert(r.intended === choices[r.id], 'result.intended is the choice made');
      assert(r.why.situation === mirror(n0.situation), 'a neighbour stands in the mirror of your situation');
      W.reveal(r); W.delta(r.payoff); W.revealLine(r);
      if (r.lost) seenStats.lost++;
      W.why(); W.back();
      var frontRow = (n0.changedDay !== null ? n0.seenSince : n0.seen)[r.why.situation];
      wordsForWhy(r.why, { name: r.name, kin: r.kin, kinId: life.kin, arrived: r.they, third: null, changedDay: n0.changedDay, front: frontRow });
      if (!twoCountsCase && r.why.source.type === 'own' && n0.changedDay !== null && (frontRow.h !== r.why.seen.h || frontRow.n !== r.why.seen.n)) {
        twoCountsCase = { seed: life.seed, days: record.slice(), index: i, id: r.id };
      }
      if (r.why.source.type === 'you' && !firstYou) { firstYou = { day: day, key: 'card-' + r.id }; W.whyFromYou(); }
    }
    assert(res.kinWith.length >= 1 && res.kinWith.length <= 2, 'kin deals with one or two of your other neighbours');
    W.elsewhereHeading();
    for (j = 0; j < res.kinWith.length; j++) {
      var e = res.kinWith[j];
      need(e.kinSent, 'kinWith.kinSent'); need(e.theySent, 'kinWith.theySent'); need(e.name, 'kinWith.name');
      assert(e.id !== life.kin && life.neighbours.indexOf(e.id) >= 0, 'kinWith names one of your other neighbours');
      W.elsewhere(e);
      if (e.why.source.type === 'you') {
        seenStats.kinWhyYou++;
        wordsForWhy(e.why, { name: life.houses[life.kin].name, kin: true, kinId: life.kin, arrived: e.kinSent, third: { name: e.name }, changedDay: null });
        if (!firstYou) { firstYou = { day: day, key: 'kin-' + e.id }; W.whyFromYou(); }
      }
    }
    wy = A.ways(life);
    for (s = 0; s < 5; s++) {
      W.wayCount(wy[s]);
      for (j = 0; j < wy[s].deeds.length; j++) { need(wy[s].deeds[j].helped, 'ways().deeds.helped'); need(wy[s].deeds[j].day, 'ways().deeds.day'); }
    }
    W.fordNote();
    assert((res.lookingRound !== null) === (day % 4 === 0), 'a season ends on days 4, 8 and 12 only');
    if (res.lookingRound) {
      var round = res.lookingRound;
      need(round.kin.changed, 'lookingRound.kin.changed'); need(round.kin.id, 'lookingRound.kin.id');
      assert(round.kin.habits.length === 5, 'kin has five habits');
      for (s = 0; s < 5; s++) { need(round.kin.habits[s].source, 'kin.habits.source'); need(round.kin.habits[s].before, 'kin.habits.before'); }
      for (j = 0; j < round.reconsidered.length; j++) {
        var q = round.reconsidered[j];
        need(q.visible, 'reconsidered.visible'); need(q.modelVisible, 'reconsidered.modelVisible'); need(q.adopted, 'reconsidered.adopted');
        need(q.took, 'reconsidered.took'); need(q.changed, 'reconsidered.changed'); need(q.model, 'reconsidered.model');
      }
      W.toSeasonEnd(); W.seasonHeading(); W.seasonIntro();
      var kinLines = W.seasonKin(round, titles), others = W.seasonOthers(round);
      assert(kinLines.length >= 1, 'the season\'s end always says how far kin follows you');
      assert(kinLines.length + others.length >= 2 || round.kin.changed, 'the season\'s end is never one bare line');
    }
    if (day < 12) W.nextDay(); else W.toLeaving();
  }

  // Leaving
  where = 'valley ' + seedIn + ', ' + policy.name + ', leaving';
  var end = A.today(life);
  assert(end.over && life.over && life.day === 13, 'the Life is over after day 12');
  var lg = A.legacy(life);
  W.leavingHeading(); W.leavingStore(life.purse, life.need); W.leaveHeading();
  for (s = 0; s < 5; s++) {
    need(lg.hollow[s], 'legacy().hollow'); need(lg.h[s], 'legacy().h'); need(lg.n[s], 'legacy().n'); need(lg.heir[s], 'legacy().heir');
    W.leaveCount(s, lg); W.leaveRow(s, lg, titles);
    if (lg.hollow[s]) {
      seenStats.hollow++;
      assert(lg.heir[s] === [1, 1, 0, 1, 0][s], 'the heir keeps the old way where you left no precedent');
    }
  }
  need(lg.kin.fromYou, 'legacy().kin.fromYou');
  W.leaveKin(lg); W.leave();

  // A Life is rebuilt from its seed and its choices (app.js: rebuild).
  var again = A.createLife(life.seed);
  for (i = 0; i < record.length; i++) A.playDay(again, record[i]);
  assert(again.purse === life.purse && again.over, 'the same seed and choices give the same Life');

  // The Afterwards: one future, watched.
  where = 'valley ' + seedIn + ', ' + policy.name + ', the Afterwards';
  var f = A.runFuture(life, 0), ticker = [], about = [], keeping = {}, startCount = 0;
  need(f.holds, 'runFuture().holds'); need(f.level, 'runFuture().level'); need(f.yourWaysAtEnd, 'runFuture().yourWaysAtEnd');
  need(f.arrival, 'runFuture().arrival');
  assert(f.seasons.length === 30, 'thirty seasons');
  // "In the future you watched" opens with who kept your ways when you left.
  for (j = 0; j < 8; j++) {
    need(life.houses[j].way, 'life.houses[j].way'); need(life.houses[j].name, 'life.houses[j].name');
    assert(life.houses[j].id === j, 'life.houses is in ring order');
    assert(f.seasons[0].houses[j].way === life.houses[j].way, 'season 1 opens on the ways the Life ended with');
    if (yoursWay(life.houses[j].way, life.kin)) { keeping[j] = 1; startCount++; }      // the houses the opening line names
  }
  assert(yoursWay(life.houses[0].way, life.kin) && yoursWay(life.houses[life.kin].way, life.kin), 'your heir and your sister\'s house start on your ways');
  about.push(W.watchedStart(life.houses, life.kin));
  if (startCount > 2) seenStats.othersKeptAtStart++;
  W.afterHeading(); W.seasonWord(); W.legendHands(); W.legendIncome(); W.legendYours(); W.flowCaption(); W.flowLastTen();
  W.tickerHeading(); W.tickerEmpty(); W.skip(); W.seeCount();
  for (i = 0; i < 30; i++) {
    var S = f.seasons[i];
    assert(S.season === i + 1, 'seasons run 1 to 30');
    need(S.flow, 'season.flow');
    assert(S.flow >= 0 && S.flow <= 1.06, 'help flow stays between 0 and a little over 1');
    W.seasonOf(S.season);
    var ctx = { kinId: life.kin, kinHolds: kinHolds(f, life.kin, S.season) };
    assert(S.houses.length === 8, 'eight houses');
    for (j = 0; j < 8; j++) {
      var h = S.houses[j];
      need(h.name, 'season.houses.name'); need(h.helpRate, 'season.houses.helpRate'); need(h.income, 'season.houses.income');
      need(h.purse, 'season.houses.purse'); need(h.way, 'season.houses.way');
      var hands = h.helpRate * 16;
      assert(hands === Math.round(hands) && hands >= 0 && hands <= 16, 'helpRate x 16 is a count of hands, 0 to 16');
      assert(h.income >= -16 && h.income <= 48, 'a season\'s income lies between -16 and 48');
      W.ringName(h, ctx);
    }
    for (j = 0; j < S.events.length; j++) {
      var ev = S.events[j];
      need(ev.type, 'event.type');
      if (ev.type === 'adopt') { need(ev.adopter, 'event.adopter'); need(ev.way, 'event.way'); need(ev.from, 'event.from'); need(ev.changed, 'event.changed'); need(ev.wayName, 'event.wayName'); need(ev.adopterName, 'event.adopterName'); }
      if (ev.type === 'arrival') { need(ev.house, 'event.house'); need(ev.replaced, 'event.replaced'); need(ev.name, 'event.name'); }
      if (!tickerShows(ev, life.kin)) continue;
      var line = W.tickerLine(ev, S.season, ctx);
      assert(!/the (\w+) house (takes up|gives up your ways for) the \1 way/.test(line), 'no house takes up the way that carries its own name: ' + line);
      if (/ its own way\.$/.test(line)) seenStats.backToOwnWay++;
      ticker.push(line);
      if (aboutYou(ev, S.season, life, f)) {
        about.push(line);
        // The tally a reader keeps, house by house, from the lines as printed.
        if (ev.type === 'arrival') {
          if (ev.house !== life.kin) { assert(keeping[ev.house] === 1, 'newcomers listed for a holding that was not on your ways'); seenStats.arrivalOnYourWays++; }
          delete keeping[ev.house];
        } else if (/takes up your ways\.$/.test(line)) {
          assert(!keeping[ev.adopter], 'a house takes up your ways that the list already has on them: ' + line);
          keeping[ev.adopter] = 1;
        } else if (/gives up your ways/.test(line)) {
          assert(keeping[ev.adopter] === 1, 'a house gives up your ways that the list never had on them: ' + line);
          delete keeping[ev.adopter];
        }
      }
      if (ev.type === 'arrival' && ev.house === life.kin) seenStats.kinArrival++;
      if (ev.type === 'adopt' && ev.adopter === 0 && /gives up/.test(line)) seenStats.heirGivesUp++;
      if (ev.type === 'adopt' && ev.adopter !== 0 && /takes up your ways/.test(line)) seenStats.othersTakeUp++;
    }
  }
  need(f.finalWay, 'runFuture().finalWay');
  // The ring at rest is marked from finalWay (app.js: markEndState), and that is what the closing line counts.
  var atRest = 0, inSeason30 = 0;
  for (j = 0; j < 8; j++) {
    need(f.finalWay[j], 'runFuture().finalWay[j]');
    if (yoursWay(f.finalWay[j], life.kin)) atRest++;
    if (yoursWay(f.seasons[29].houses[j].way, life.kin)) inSeason30++;
  }
  assert(atRest === f.yourWaysAtEnd, 'finalWay marks as many houses as the closing line counts');
  if (inSeason30 !== atRest) seenStats.ringOneRoundBehind++;
  assert(Object.keys(keeping).length === f.yourWaysAtEnd,
    'the list under "In the future you watched" leaves ' + Object.keys(keeping).length + ' houses on your ways; the closing line says ' + f.yourWaysAtEnd);
  assert(about.concat([RAW.futureEnd(f), RAW.yourWaysEnd(f)]).join('|') === watchedList(life, f).join('|'), 'watchedList() gives the same list');
  var endLines = [W.futureEnd(f), W.yourWaysEnd(f)];
  if (f.level === 'frays') seenStats.barely++;

  // The verdict, in slices, as the page counts it.
  where = 'valley ' + seedIn + ', ' + policy.name + ', the verdict';
  var job = FULL[tag] ? A.verdictJob(life) : A.verdictJob(life, { futures: 200 });
  need(job.futures, 'job.futures'); need(job.futuresDone, 'job.futuresDone');
  W.counting(job);
  W.oneFuture(job.futures);
  var guard = 0, lastDone = 0;
  while (!A.verdictStep(job, 200)) {
    assert(job.futuresDone >= lastDone && job.futuresDone <= job.futures, 'futuresDone climbs to futures');
    lastDone = job.futuresDone;
    if (guard % 40 === 0) W.counting(job);
    if (++guard > 5000) fail('the verdict job never finished');
  }
  assert(job.done && job.futuresDone === job.futures, 'a finished job has counted every future');
  var v = need(job.result, 'job.result');

  where = 'valley ' + seedIn + ', ' + policy.name + ', the Chronicle';
  need(v.futures, 'verdict.futures'); need(v.holds, 'verdict.holds'); need(v.holdsPct, 'verdict.holdsPct');
  need(v.baselinePct, 'verdict.baselinePct'); need(v.mark, 'verdict.mark'); need(v.markSE, 'verdict.markSE');
  need(v.baseline.holds, 'verdict.baseline.holds'); need(v.houseKept, 'verdict.houseKept');
  need(v.purse, 'verdict.purse'); need(v.need, 'verdict.need');
  need(v.whatIfFutures, 'verdict.whatIfFutures'); need(v.whatIfBaseHolds, 'verdict.whatIfBaseHolds');
  need(v.range.bestPct, 'range.bestPct'); need(v.range.worstPct, 'range.worstPct');
  need(v.range.scaleLow, 'range.scaleLow'); need(v.range.scaleHigh, 'range.scaleHigh');
  need(v.seal.earned, 'seal.earned'); need(v.lastDay, 'verdict.lastDay'); need(v.mattered, 'verdict.mattered');
  assert(v.held.length >= 200 && v.baseline.held.length >= 200, 'at least 200 futures to draw');
  for (i = 0; i < 200; i++) {
    assert(v.held[i] === true || v.held[i] === false, 'held[i] is true or false');
    assert(v.baseline.held[i] === true || v.baseline.held[i] === false, 'baseline.held[i] is true or false');
  }
  assert(v.held[0] === f.holds, 'the watched future is the first one counted');
  assert(v.range.scaleLow <= v.range.scaleHigh, 'the scale runs low to high');
  assert(v.range.scaleLow <= Math.min(v.holdsPct, v.baselinePct, v.range.worstPct), 'the scale holds every mark, low end');
  assert(v.range.scaleHigh >= Math.max(v.holdsPct, v.baselinePct, v.range.bestPct), 'the scale holds every mark, high end');
  assert(v.whatIfs.length === 10, 'ten what-ifs');
  assert(v.purse === life.purse && v.need === life.need, 'the verdict carries the store');

  var C = [];
  C.push(W.chronHeading());
  C.push(W.houseHeading().toUpperCase()); C.push(W.chronHouse(v));
  C.push(W.valleyHeading().toUpperCase()); C.push(W.chronValley(v)); C.push(W.chronMark(v)); C.push(W.chronNoise(v));
  W.markValue(v);
  C.push(W.rowWith() + ' (' + W.fieldCount(v.held) + ')');
  C.push(W.rowOld() + ' (' + W.fieldCount(v.baseline.held) + ')');
  C.push(W.fieldCaption(v)); C.push(W.fieldKey());
  C = C.concat(W.explain(v));
  C.push(W.rangeHeading().toUpperCase()); C.push(W.rangeLine(v));
  C.push('[scale ' + W.scaleUnit() + ': ' + W.scaleWorst(v) + ' | ' + W.scaleBest(v) + ' | ' + W.scaleYou() + ' | ' + W.scaleOld() + ']');
  C.push('[scale, spoken label only: ' + W.scaleYouAt(v) + ' | ' + W.scaleOldAt(v) + ']');
  assert(W.scaleYou() === 'You' && W.scaleOld() === 'The old way', 'the two markers are named as the brief names them, without numbers');
  if (v.lastDay !== null) {
    seenStats.lastDay++;
    need(v.lastDay.holds, 'lastDay.holds'); need(v.lastDay.futures, 'lastDay.futures'); need(v.lastDay.purse, 'lastDay.purse');
    assert(v.lastDay.changed.length >= 1, 'the last-day replay names a house');
    C.push(W.lastDayHeading().toUpperCase()); C.push(W.lastDay(v, life.kin));
  }
  if (v.seal.earned === true) { seenStats.seal++; C.push('[seal] ' + W.seal()); }
  C.push(W.matteredHeading().toUpperCase());
  if (v.mattered && v.mattered.kind === 'habit') {
    seenStats.matteredHabit++;
    need(v.mattered.situation, 'mattered.situation'); need(v.mattered.h, 'mattered.h'); need(v.mattered.n, 'mattered.n');
    need(v.whatIfs[2 * v.mattered.situation].holds, 'whatIfs[2s].holds'); need(v.whatIfs[2 * v.mattered.situation + 1].holds, 'whatIfs[2s+1].holds');
    assert(v.whatIfs[2 * v.mattered.situation].toward === 'help' && v.whatIfs[2 * v.mattered.situation + 1].toward === 'hold', 'what-ifs come as help, hold');
  } else if (v.mattered) {
    assert(v.mattered.kind === 'lastDay' && v.lastDay !== null, 'mattered is a habit or the last day');
    seenStats.matteredLastDay++;
  } else seenStats.matteredNone++;
  C.push(W.mattered(v, titles));
  C.push(W.watchedHeading().toUpperCase());
  C = C.concat(about); C = C.concat(endLines);
  C.push(W.valleyNo(life.seed));
  C.push('[' + W.again() + '] [' + W.againSame() + ']');
  var rec = { seed: life.seed, kept: v.houseKept, purse: v.purse, need: v.need, mark: Math.round(v.mark), seal: v.seal.earned === true };
  C.push(W.pastHeading().toUpperCase()); C.push(W.pastLife(rec));
  for (i = 0; i < C.length; i++) checkSentence(C[i], 'chronicle line');

  seenStats.lives++;
  if (v.houseKept) seenStats.kept++;
  return { tag: tag, policy: policy.name, chronicle: C, ticker: ticker, life: life, future: f, verdict: v, record: record };
}

// ---- every branch of every sentence, from real records with single fields changed --------------

function variants(sample) {
  where = 'variants';
  var life = sample.life, v = sample.verdict, f = sample.future, i, s, k;
  var titles = A.ways(life).map(function (w) { return w.title; });
  W.title(); W.premise(); W.begin(); W.stakeCost(); W.stakeWorth();
  for (i = 0; i <= 4; i++) W.closeDay(i);
  var ys = [null];
  [true, false].forEach(function (intended) { [true, false].forEach(function (lost) { [true, false].forEach(function (they) {
    if (lost && !intended) return;
    ys.push({ intended: intended, lost: lost, arrived: intended && !lost, they: they, payoff: (they ? 3 : 0) - (intended && !lost ? 1 : 0) });
  }); }); });
  ys.forEach(function (y) { W.yesterday(y); if (y) { W.reveal(y); W.revealLine(y); W.delta(y.payoff); } });
  [-3, 0, 5].forEach(function (p) { W.store(p, 64); W.leavingStore(p, 64); });
  W.leavingStore(63, 64); W.leavingStore(64, 64); W.leavingStore(70, 64);
  W.seenCount({ h: 0, n: 0 }); W.seenCount({ h: 1, n: 3 }); W.wayCount({ h: 0, n: 0 }); W.wayCount({ h: 2, n: 5 });

  // Why? in every source, on a neighbour's card and for a third party.
  var kinName = life.houses[life.kin].name;
  var deeds = [{ day: 2, to: life.kin, toName: kinName, helped: true }, { day: 3, to: 1, toName: life.houses[1].name, helped: false },
               { day: 5, to: 2, toName: life.houses[2].name, helped: true }, { day: 6, to: 7, toName: life.houses[7].name, helped: true },
               { day: 7, to: 7, toName: life.houses[7].name, helped: false }];
  var digest = { n: 5, sent: 3, stayed: 2, latest: deeds[4], dissent: [deeds[4], deeds[1]] };
  var sources = [
    { type: 'own', from: null, fromName: null, far: false, deeds: [], digest: null },
    { type: 'you', from: 0, fromName: life.houses[0].name, far: false, deeds: deeds, digest: digest },
    { type: 'you', from: 0, fromName: life.houses[0].name, far: false, deeds: deeds.slice(0, 1), digest: { n: 1, sent: 1, stayed: 0, latest: deeds[0], dissent: [] } },
    { type: 'blank', from: null, fromName: null, far: false, deeds: [], digest: null },
    { type: 'house', from: 7, fromName: life.houses[7].name, far: false, deeds: [], digest: null },
    { type: 'house', from: life.kin, fromName: kinName, far: false, deeds: [], digest: null },
    { type: 'house', from: 4, fromName: life.houses[4].name, far: true, deeds: [], digest: null }
  ];
  var ctxs = [
    { name: life.houses[1].name, kin: false, kinId: life.kin, arrived: false, third: null, changedDay: null },
    { name: kinName, kin: true, kinId: life.kin, arrived: true, third: null, changedDay: null },
    { name: kinName, kin: true, kinId: life.kin, arrived: false, third: { name: life.houses[7].name }, changedDay: null },
    { name: life.houses[1].name, kin: false, kinId: life.kin, arrived: true, third: null, changedDay: 4 }
  ];
  var ownWhy = { situation: 1, source: sources[0], habit: null, seen: { h: 3, n: 3 }, againstHabit: null };
  assert(W.whySource(ownWhy, ctxs[0])[1] === 'Before today you knew them to send a hand here 3 of 3 times.', 'an own way, the house never changed');
  assert(W.whySource(ownWhy, ctxs[3])[1] === 'Before today you knew them to send a hand here 3 of 3 times, counted over the whole harvest.', 'an own way, after the house changed a way');
  ownWhy.seen = { h: 0, n: 0 };
  assert(W.whySource(ownWhy, ctxs[3])[1] === 'You had not seen them here before.', 'an own way never seen needs no such note');
  for (s = 0; s < 5; s++) for (i = 0; i < sources.length; i++) for (k = 0; k < ctxs.length; k++) {
    [{ h: 0, n: 0 }, { h: 1, n: 1 }, { h: 3, n: 4 }].forEach(function (seen) {
      [true, false].forEach(function (against) {
        var why = { situation: s, source: sources[i], habit: null, seen: seen, againstHabit: sources[i].type === 'you' ? against : null };
        W.whyStood(why, ctxs[k]); W.whySource(why, ctxs[k]); W.whyDeeds(why, ctxs[k]); W.whyClose(why, ctxs[k]);
      });
    });
  }
  for (s = 0; s < 5; s++) for (i = 0; i < deeds.length; i++) W.deed(deeds[i], s, life.kin);
  [[true, true], [true, false], [false, true], [false, false]].forEach(function (p) {
    W.elsewhere({ id: 7, name: life.houses[7].name, kinSent: p[0], theySent: p[1] });
  });

  // Season's end: every kind of entry.
  var kinRound = { id: life.kin, name: kinName, changed: true, habits: [
    { situation: 0, before: 1, after: 1, source: 'you', h: 4, n: 4 }, { situation: 1, before: 1, after: 0.75, source: 'you', h: 3, n: 4 },
    { situation: 2, before: 0, after: 1, source: 'you', h: 1, n: 1 }, { situation: 3, before: 1, after: 0, source: 'you', h: 0, n: 2 },
    { situation: 4, before: 0, after: 0, source: 'blank', h: 0, n: 0 }] };
  var quiet = { id: life.kin, name: kinName, changed: false, habits: kinRound.habits.map(function (h) {
    return { situation: h.situation, before: h.before, after: h.before, source: h.source, h: h.h, n: h.n }; }) };
  function entry(o) {
    var e = { house: 1, name: life.houses[1].name, model: 7, modelName: life.houses[7].name, chance: 0.5, adopted: false, took: 0,
              visible: true, modelVisible: true, changed: false, changes: [], mutation: null };
    for (var key in o) e[key] = o[key];
    return e;
  }
  var entries = [
    entry({ adopted: true, took: 3, model: 0, modelName: life.houses[0].name, changed: true }),
    entry({ adopted: true, took: 2, model: 4, modelName: life.houses[4].name, modelVisible: false, changed: true }),
    entry({ adopted: true, took: 2, changed: true }),
    entry({ adopted: true, took: 2, model: life.kin, modelName: kinName, changed: true }),
    entry({ adopted: true, took: 0, changed: true }),
    entry({ adopted: false, changed: false }),
    entry({ adopted: false, model: 0, modelName: life.houses[0].name }),
    entry({ adopted: false, model: 4, modelName: life.houses[4].name, modelVisible: false }),
    entry({ adopted: false, model: life.kin, modelName: kinName }),
    entry({ house: life.kin, name: kinName, adopted: true, took: 2, changed: true }),
    entry({ visible: false, house: 4, name: life.houses[4].name })
  ];
  W.seasonKin({ season: 1, kin: kinRound, reconsidered: [] }, titles);
  W.seasonKin({ season: 1, kin: quiet, reconsidered: [] }, titles);
  W.seasonOthers({ season: 1, kin: kinRound, reconsidered: entries });
  var none = W.seasonOthers({ season: 1, kin: quiet, reconsidered: [entries[10]] });
  assert(none.length === 1, 'a season in which nothing visible moved says so');
  assert(W.seasonOthers({ season: 1, kin: kinRound, reconsidered: [] }).length === 0, 'kin changing is news enough');
  for (i = 0; i <= 5; i++) W.kinFollows(i);

  // Leaving: a way never tested, in each situation.
  var lg = A.legacy(life);
  for (s = 0; s < 5; s++) {
    var hollow = { hollow: [false, false, false, false, false], h: lg.h, n: lg.n, heir: lg.heir, kin: lg.kin };
    hollow.hollow[s] = true;
    W.leaveCount(s, hollow); W.leaveRow(s, hollow, titles);
  }

  // The Afterwards: every kind of line.
  var kinId = life.kin, here = { kinId: kinId, kinHolds: true }, gone = { kinId: kinId, kinHolds: false };
  var other = kinId === 1 ? 2 : 1, nm = function (id) { return life.houses[id].name; };
  function adopt(adopter, from, way, wayName) {
    return { type: 'adopt', adopter: adopter, adopterName: nm(adopter), model: 7, modelName: nm(7), way: way, wayName: wayName, from: from, changed: way !== from };
  }
  var evs = [
    { type: 'arrival', house: other, replaced: nm(other), name: 'Quill' }, { type: 'arrival', house: kinId, replaced: kinName, name: 'Quill' },
    adopt(other, other, 0, nm(0)), adopt(other, other, kinId, kinName), adopt(other, 0, 7, nm(7)), adopt(other, other, 8, 'Quill'),
    adopt(0, 0, 7, nm(7)), adopt(0, 7, 0, nm(0)), adopt(0, 7, 8, 'Quill'), adopt(0, 0, kinId, kinName),
    adopt(kinId, kinId, 7, nm(7)), adopt(kinId, 7, kinId, kinName), adopt(kinId, 7, 8, 'Quill'), adopt(kinId, 7, 7, nm(7)),
    { type: 'displaced', house: 0, by: 7, byName: nm(7), cause: 'adopt' }, { type: 'mutation', house: 3, situation: 2, to: 0.4 }
  ];
  evs.forEach(function (ev) {
    [here, gone].forEach(function (c) { if (tickerShows(ev, kinId)) W.tickerLine(ev, 9, c); });
  });
  assert(kinHolds({ arrival: { season: 5, house: kinId } }, kinId, 4) && !kinHolds({ arrival: { season: 5, house: kinId } }, kinId, 5) &&
    kinHolds({ arrival: { season: 5, house: other } }, kinId, 9), 'kin holds its house until newcomers take it');
  // A house going back to the way that carries its own name.
  var back = adopt(other, 7, other, nm(other)), backFromYours = adopt(other, 0, other, nm(other)), backFromKin = adopt(other, kinId, other, nm(other));
  var quill = { type: 'adopt', adopter: other, adopterName: 'Quill', model: 7, modelName: nm(7), way: 8, wayName: 'Quill', from: 7, changed: true };
  var quillKin = { type: 'adopt', adopter: kinId, adopterName: 'Quill', model: 7, modelName: nm(7), way: 8, wayName: 'Quill', from: 0, changed: true };
  assert(W.tickerLine(back, 9, here) === 'Season 9: the ' + nm(other) + ' house goes back to its own way.', 'back to its own way');
  assert(W.tickerLine(backFromYours, 9, here) === 'Season 9: the ' + nm(other) + ' house gives up your ways and goes back to its own way.', 'gives up your ways and goes back');
  assert(W.tickerLine(backFromKin, 9, gone) === W.tickerLine(backFromYours, 9, here), 'what kin learned from you counts as your ways');
  assert(W.tickerLine(quill, 9, here) === 'Season 9: the Quill house goes back to its own way.', 'newcomers go back to their own way');
  assert(W.tickerLine(quillKin, 9, gone) === 'Season 9: the Quill house gives up your ways and goes back to its own way.', 'newcomers on kin\'s holding');
  assert(W.tickerLine(adopt(other, other, 7, nm(7)), 9, here) === 'Season 9: the ' + nm(other) + ' house takes up the ' + nm(7) + ' way.', 'another family\'s way keeps its name');
  // Who kept your ways when you left.
  function housesOn(waysById) { return life.houses.map(function (h) { return { id: h.id, name: h.name, way: waysById[h.id] }; }); }
  var own8 = [0, 1, 2, 3, 4, 5, 6, 7], w3 = own8.slice(), far = kinId === 6 ? 7 : 6;
  w3[other] = 0; w3[far] = kinId;
  assert(W.watchedStart(housesOn(own8), kinId) === 'When you left, your heir and your sister\'s house kept your ways.', 'the usual start');
  assert(W.watchedStart(housesOn(w3), kinId) === 'When you left, your heir, your sister\'s house, the ' + nm(other) + ' house and the ' + nm(far) + ' house kept your ways.', 'others on your ways at the start');
  var onlyHeir = own8.slice(); onlyHeir[kinId] = 7;
  assert(W.watchedStart(housesOn(onlyHeir), kinId) === 'When you left, your heir kept your ways.', 'the heir alone');
  assert(W.watchedStart(housesOn([8, 8, 8, 8, 8, 8, 8, 8]), kinId) === 'When you left, no house kept your ways.', 'no house at all');
  [0, kinId, other].forEach(function (id) { W.ringName({ id: id, name: nm(id) }, here); W.ringName({ id: id, name: 'Quill' }, gone); });
  [[true, 'holds'], [true, 'frays'], [false, 'frays'], [false, 'fails']].forEach(function (p) { W.futureEnd({ holds: p[0], level: p[1] }); });
  W.yourWaysEnd({ yourWaysAtEnd: 3, yourWaysLastSeason: 30 }); W.yourWaysEnd({ yourWaysAtEnd: 1, yourWaysLastSeason: 30 });
  W.yourWaysEnd({ yourWaysAtEnd: 0, yourWaysLastSeason: 23 }); W.yourWaysEnd({ yourWaysAtEnd: 0, yourWaysLastSeason: 0 });
  W.yourWaysEnd({ yourWaysAtEnd: 0 });

  // The Chronicle: every form of every line.
  function withFields(o) { var c = {}; for (var key in v) c[key] = v[key]; for (key in o) c[key] = o[key]; return c; }
  [true, false].forEach(function (kept) { W.chronHouse(withFields({ houseKept: kept, purse: kept ? 66 : -2 })); });
  [-7.35, -0.4, 0, 0.49, 6.6].forEach(function (m) { W.chronMark(withFields({ mark: m })); W.markValue(withFields({ mark: m })); });
  [0, 0.3, 0.5, 0.91, 3.2].forEach(function (se) { W.chronNoise(withFields({ markSE: se })); });
  var names = [{ id: 1, name: nm(1) }, { id: 2, name: nm(2) }, { id: 6, name: nm(6) }, { id: 7, name: nm(7) }];
  for (i = 1; i <= 4; i++) {
    var ld = { kind: 'lastDay', changed: names.slice(0, i), purse: 61, houseKept: false, holds: 588, holdsPct: 58.8, futures: v.whatIfFutures, delta: 6.5, se: 1.2, clear: true };
    W.lastDay(withFields({ lastDay: ld }), kinId);
    W.mattered(withFields({ lastDay: ld, mattered: ld }), titles);
  }
  for (s = 0; s < 5; s++) W.mattered(withFields({ mattered: v.whatIfs[2 * s] }), titles);
  W.mattered(withFields({ mattered: null }), titles);
  W.seal();
  W.fieldCount([true, false, true]); W.fieldCaption(withFields({ futures: 120 }));
  [true, false].forEach(function (kept) { [true, false].forEach(function (seal) { [-12, 0, 7].forEach(function (m) {
    W.pastLife({ seed: life.seed, kept: kept, purse: kept ? 66 : 58, need: 64, mark: m, seal: seal });
  }); }); });
  need(f.seasons[0].houses[0].helpRate, 'variants: future');
}

// ---- run ----------------------------------------------------------------------------------------

Object.keys(RAW).forEach(function (k) { if (typeof RAW[k] !== 'function') fail('AYWords.' + k + ' is not a function'); });
A.createLife(1).houses.forEach(function () {});
(function namesAreClean() {
  var seenNames = {};
  SEEDS.forEach(function (sd) { A.createLife(sd).houses.forEach(function (h) { seenNames[h.name] = 1; }); });
  Object.keys(seenNames).forEach(function (nm) { checkSentence('The ' + nm + ' house', 'house name'); });
})();

var samples = {}, first = null;
SEEDS.forEach(function (seed) {
  POLICIES.forEach(function (policy, pi) {
    var out = liveOne(seed, policy, pi);
    if (!first) first = out;
    if (SAMPLES.indexOf(out.tag) >= 0) samples[out.tag] = out;
  });
});
variants(first);

where = 'coverage';
var never = [], silent = [], oneSided = [];
Object.keys(calls).forEach(function (k) {
  if (!calls[k]) never.push(k);
  else if (!produced[k]) silent.push(k);
});
Object.keys(answered).forEach(function (k) { if (!answered[k][0] || !answered[k][1]) oneSided.push(k); });
if (never.length) fail('AYWords functions never called: ' + never.join(', '));
if (silent.length) fail('AYWords functions that never produced a sentence: ' + silent.join(', '));
if (oneSided.length) fail('questions about the watched future that only ever got one answer: ' + oneSided.join(', '));
['wholeHarvest', 'twoCounts', 'backToOwnWay', 'arrivalOnYourWays', 'othersKeptAtStart', 'ringOneRoundBehind'].forEach(function (k) {
  if (!seenStats[k]) fail('no life reached the case "' + k + '", so its check proved nothing');
});

var wordsSentences = sentences;

// ==== part 2: index.html and app.js themselves ====================================================
// No browser here, so app.js is run against a stand-in DOM built from index.html: just the parts of
// the DOM that app.js uses, a clock that only moves when told to, and timers that fire on that clock.
// Whole Lives are then played through the page's own controls, found by the hooks of section 2.

var HTML = readFile('index.html'), APP = readFile('app.js'), staticInfo = { words: 0, ids: 0 };

(function staticChecks() {
  where = 'index.html and app.js, read as text';
  var m, re;
  assert(/^<title>After You<\/title>\s*<meta name="claude:viewport-fit-sides" content="cover">\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*display=swap">\s*<style>/.test(HTML),
    'index.html starts with the title, the viewport meta, one Google Fonts link, then the style block');
  assert(/<script src="engine\.js"><\/script><script src="words\.js"><\/script><script src="app\.js"><\/script>\s*$/.test(HTML), 'index.html ends with the three scripts');
  assert(!/<!DOCTYPE|<html[\s>]|<head[\s>]|<body[\s>]/i.test(HTML), 'index.html is page content only');
  assert((HTML.match(/<style>/g) || []).length === 1, 'one style block');
  var urls = HTML.match(/https?:\/\/[^\s"')]+/g) || [];
  assert(urls.length === 1 && urls[0].indexOf('https://fonts.googleapis.com/css2?') === 0, 'the only outside address is the Google Fonts stylesheet');
  assert(!/https?:\/\//.test(APP.replace(/http:\/\/www\.w3\.org\/2000\/svg/g, '')), 'app.js asks for nothing from the network');
  // every colour is a token: a literal colour may only appear where a custom property is defined
  var style = HTML.slice(HTML.indexOf('<style>'), HTML.indexOf('</style>'));
  style.split('\n').forEach(function (line) {
    if (/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(line)) assert(/^\s*--[a-z-]+:/.test(line), 'a literal colour outside a token: ' + line.trim());
  });
  assert(/@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme="light"\]\) \{[^}]*color-scheme: dark;/.test(style), 'dark tokens under the media query');
  assert(/:root\[data-theme="dark"\] \{[^}]*color-scheme: dark;/.test(style), 'dark tokens under data-theme');
  assert(/\[hidden\] \{ display: none !important; \}/.test(style), 'the hidden rule is in the style block');
  assert(/padding-left: max\(16px, env\(safe-area-inset-left, 0px\)\);\s*padding-right: max\(16px, env\(safe-area-inset-right, 0px\)\);/.test(style), 'the side gutter');
  assert(/prefers-reduced-motion: reduce/.test(style), 'reduced motion is respected in the style block');
  // the section 2 hook is the radio itself: each one lies over its own label and takes the pointer
  assert(!/\.choice-row input[^{]*\{[^}]*(pointer-events:\s*none|position:\s*absolute)/.test(style), 'the radio inputs are not parked on one pixel with pointer events off');
  assert(/\.choice-row input\[value="send"\], \.opt-send \{ grid-area: 1 \/ 1; \}/.test(style) && /\.choice-row input\[value="stay"\], \.opt-stay \{ grid-area: 1 \/ 2; \}/.test(style),
    'each radio shares the grid cell of its own label');
  // digits set in the display face are lining figures everywhere
  ['.leave-kin', '.season-kin li:first-child', '.after-end p + p', '.watched li.end', '.legend .l-inc', '.ring .inc', '.chron-big', '.statement'].forEach(function (sel) {
    var at = style.indexOf('\n  ' + sel + ' {');
    assert(at >= 0 && /font-variant-numeric: lining-nums/.test(style.slice(at, style.indexOf('}', at))), sel + ' sets lining figures');
  });
  assert(!/\b(alert|confirm|prompt)\s*\(|window\.print|\.submit\(|style\.display|innerHTML|requestAnimationFrame/.test(APP), 'app.js uses none of the forbidden calls');
  // every AYWords function app.js names exists, and every id it looks up is in index.html
  var used = {};
  re = /\bW\.([A-Za-z]+)\b/g;
  while ((m = re.exec(APP))) used[m[1]] = 1;
  Object.keys(used).forEach(function (k) { assert(typeof RAW[k] === 'function', 'app.js calls AYWords.' + k + ', which words.js defines'); });
  var ids = {};
  [/\$\('([a-z0-9-]+)'\)/g, /setText\('([a-z0-9-]+)'/g, /show\('[a-z]+', '([a-z0-9-]+)'/g].forEach(function (rx) { while ((m = rx.exec(APP))) ids[m[1]] = 1; });
  re = /renderLives\('([a-z0-9-]+)', '([a-z0-9-]+)', '([a-z0-9-]+)'\)/g;
  while ((m = re.exec(APP))) { ids[m[1]] = 1; ids[m[2]] = 1; ids[m[3]] = 1; }
  Object.keys(ids).forEach(function (id) { assert(HTML.indexOf('id="' + id + '"') >= 0, 'app.js looks up #' + id + ', which index.html has'); });
  ['opening', 'day', 'leaving', 'afterwards', 'chronicle'].forEach(function (v) {
    assert((HTML.match(new RegExp('data-view="' + v + '"', 'g')) || []).length === 1, 'one container with data-view="' + v + '"');
  });
  ['begin', 'close-day', 'next-day', 'leave', 'skip', 'to-chronicle', 'again', 'again-same'].forEach(function (id) {
    assert(new RegExp('<button [^>]*id="' + id + '"').test(HTML), 'a real button with id ' + id);
  });
  staticInfo.words = Object.keys(used).length; staticInfo.ids = Object.keys(ids).length;
})();

// ---- the stand-in DOM ----

var clock = 0, timerSeq = 1, timerList = [], fakeDoc = null, mqListeners = [], storeBox = {}, storageThrows = false;

function FNode(kind, tag) {
  this.nodeType = kind; this.localName = tag || null; this.tagName = tag ? tag.toUpperCase() : null;
  this.childNodes = []; this.parentNode = null; this.attrs = {}; this.listeners = {}; this.data = '';
  this.checked = false; this.tabIndex = 0; this.scrollTop = 0; this.scrollHeight = 0;
  var node = this;
  this.style = { setProperty: function (k, v) { this[k] = v; } };
  this.classList = {
    contains: function (c) { return (' ' + (node.attrs['class'] || '') + ' ').indexOf(' ' + c + ' ') >= 0; },
    add: function (c) { if (!this.contains(c)) node.attrs['class'] = ((node.attrs['class'] || '') + ' ' + c).trim(); },
    remove: function (c) { node.attrs['class'] = (' ' + (node.attrs['class'] || '') + ' ').replace(' ' + c + ' ', ' ').trim(); },
    toggle: function (c, on) { if (on === undefined) on = !this.contains(c); if (on) this.add(c); else this.remove(c); return on; }
  };
}
[['id', 'id'], ['className', 'class'], ['type', 'type'], ['name', 'name'], ['value', 'value'], ['htmlFor', 'for']].forEach(function (p) {
  Object.defineProperty(FNode.prototype, p[0], {
    get: function () { return p[1] in this.attrs ? this.attrs[p[1]] : ''; },
    set: function (v) { this.attrs[p[1]] = String(v); }
  });
});
['hidden', 'disabled', 'open'].forEach(function (p) {
  Object.defineProperty(FNode.prototype, p, {
    get: function () { return p in this.attrs; },
    set: function (v) { if (v) this.attrs[p] = ''; else delete this.attrs[p]; }
  });
});
Object.defineProperty(FNode.prototype, 'textContent', {
  get: function () {
    if (this.nodeType === 3) return this.data;
    var s = '', i;
    for (i = 0; i < this.childNodes.length; i++) s += this.childNodes[i].textContent;
    return s;
  },
  set: function (v) {
    if (this.nodeType === 3) { this.data = String(v); return; }
    while (this.childNodes.length) this.removeChild(this.childNodes[0]);
    if (v !== null && v !== '') { var t = new FNode(3); t.data = String(v); this.appendChild(t); }
  }
});
Object.defineProperty(FNode.prototype, 'firstChild', { get: function () { return this.childNodes.length ? this.childNodes[0] : null; } });
Object.defineProperty(FNode.prototype, 'children', { get: function () { return this.childNodes.filter(function (c) { return c.nodeType === 1; }); } });
FNode.prototype.appendChild = function (c) {
  if (!(c instanceof FNode)) fail('appendChild was given something that is not a node: ' + JSON.stringify(c));
  if (c.parentNode) c.parentNode.removeChild(c);
  this.childNodes.push(c); c.parentNode = this;
  return c;
};
FNode.prototype.removeChild = function (c) {
  var i = this.childNodes.indexOf(c);
  if (i < 0) fail('removeChild: not a child');
  this.childNodes.splice(i, 1); c.parentNode = null;
  return c;
};
FNode.prototype.setAttribute = function (k, v) { this.attrs[k] = String(v); };
FNode.prototype.getAttribute = function (k) { return k in this.attrs ? this.attrs[k] : null; };
FNode.prototype.hasAttribute = function (k) { return k in this.attrs; };
FNode.prototype.removeAttribute = function (k) { delete this.attrs[k]; };
FNode.prototype.addEventListener = function (type, fn, capture) { (this.listeners[type] = this.listeners[type] || []).push({ fn: fn, capture: capture === true }); };
FNode.prototype.focus = function () { fakeDoc.activeElement = this; };
FNode.prototype.getBoundingClientRect = function () { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }; };
FNode.prototype.scrollIntoView = function () {};
FNode.prototype.click = function (detail) { return this.disabled ? null : fire(this, 'click', { detail: detail === undefined ? 1 : detail }); };

// An event as a browser delivers it: down from the document to the target (capture listeners),
// at the target, then back up (the others). stopPropagation ends the journey where it is called.
function fire(node, type, props) {
  var ev = { type: type, target: node, defaultPrevented: false, stopped: false,
             preventDefault: function () { this.defaultPrevented = true; }, stopPropagation: function () { this.stopped = true; } }, key, n, at, path = [];
  for (key in props) ev[key] = props[key];
  for (n = node; n; n = n.parentNode) path.push(n);
  path.push(fakeDoc);
  function run(target, which) {
    var L = (target.listeners[type] || []).slice(), i;
    for (i = 0; i < L.length && !ev.stopped; i++) if (which === 'both' || L[i].capture === (which === 'down')) L[i].fn.call(target, ev);
  }
  for (at = path.length - 1; at >= 1 && !ev.stopped; at--) run(path[at], 'down');
  if (!ev.stopped) run(node, 'both');
  for (at = 1; at < path.length && !ev.stopped; at++) run(path[at], 'up');
  return ev;
}

// selectors: compounds of tag, #id, .class, [attr], [attr=value], joined by descendant spaces
function parseCompound(src) {
  var c = { tag: null, id: null, classes: [], attrs: [] }, rest = src, m;
  while (rest.length) {
    if ((m = /^[a-zA-Z][a-zA-Z0-9-]*/.exec(rest))) c.tag = m[0].toLowerCase();
    else if ((m = /^#([\w-]+)/.exec(rest))) c.id = m[1];
    else if ((m = /^\.([\w-]+)/.exec(rest))) c.classes.push(m[1]);
    else if ((m = /^\[([\w-]+)(?:=(?:"([^"]*)"|([^\]]*)))?\]/.exec(rest))) c.attrs.push({ name: m[1], value: m[2] !== undefined ? m[2] : m[3] });
    else fail('the stand-in DOM cannot read the selector "' + src + '"');
    rest = rest.slice(m[0].length);
  }
  return c;
}
function matchesCompound(n, c) {
  var i;
  if (n.nodeType !== 1) return false;
  if (c.tag && n.localName.toLowerCase() !== c.tag) return false;
  if (c.id && n.attrs.id !== c.id) return false;
  for (i = 0; i < c.classes.length; i++) if (!n.classList.contains(c.classes[i])) return false;
  for (i = 0; i < c.attrs.length; i++) {
    if (!(c.attrs[i].name in n.attrs)) return false;
    if (c.attrs[i].value !== undefined && n.attrs[c.attrs[i].name] !== c.attrs[i].value) return false;
  }
  return true;
}
function selectAll(root, selector) {
  var parts = selector.trim().split(/\s+/).map(parseCompound), out = [];
  (function walk(n) {
    for (var i = 0; i < n.childNodes.length; i++) {
      var c = n.childNodes[i];
      if (c.nodeType !== 1) continue;
      if (matchesCompound(c, parts[parts.length - 1])) {
        var k = parts.length - 2, a = c.parentNode;
        while (k >= 0 && a && a !== root.parentNode) { if (matchesCompound(a, parts[k])) k--; a = a.parentNode; }
        if (k < 0) out.push(c);
      }
      walk(c);
    }
  })(root);
  return out;
}
FNode.prototype.querySelectorAll = function (sel) { return selectAll(this, sel); };
FNode.prototype.querySelector = function (sel) { var r = selectAll(this, sel); return r.length ? r[0] : null; };
FNode.prototype.closest = function (sel) {
  var c = parseCompound(sel), n;
  for (n = this; n; n = n.parentNode) if (matchesCompound(n, c)) return n;
  return null;
};

function makeDocument() {
  var d = {
    body: new FNode(1, 'body'), documentElement: { clientHeight: 800 }, readyState: 'complete', activeElement: null, listeners: {},
    createElement: function (tag) { return new FNode(1, tag.toLowerCase()); },
    createElementNS: function (ns, tag) { return new FNode(1, tag); },
    createTextNode: function (text) { var t = new FNode(3); t.data = String(text); return t; },
    getElementById: function (id) { return this.body.querySelector('#' + id); },
    querySelector: function (sel) { return this.body.querySelector(sel); },
    querySelectorAll: function (sel) { return this.body.querySelectorAll(sel); },
    addEventListener: function (type, fn, capture) { (this.listeners[type] = this.listeners[type] || []).push({ fn: fn, capture: capture === true }); }
  };
  d.activeElement = d.body;
  return d;
}
function parseHTML(html, d) {
  var VOID = { meta: 1, link: 1, input: 1, br: 1, img: 1, hr: 1 }, stack = [d.body], last = 0, m, a, text, node, ids = {};
  var re = /<(style|script)\b[^>]*>[\s\S]*?<\/\1>|<\/([a-zA-Z0-9-]+)\s*>|<([a-zA-Z0-9-]+)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>/g;
  var attrRe = /([^\s=>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
  while ((m = re.exec(html))) {
    text = html.slice(last, m.index);
    if (/\S/.test(text)) stack[stack.length - 1].appendChild(d.createTextNode(text.replace(/&amp;/g, '&')));
    last = re.lastIndex;
    if (m[1]) continue;
    if (m[2]) {
      if (stack.length < 2 || stack[stack.length - 1].localName !== m[2]) fail('index.html: </' + m[2] + '> does not close <' + stack[stack.length - 1].localName + '>');
      stack.pop();
      continue;
    }
    node = new FNode(1, m[3]);
    attrRe.lastIndex = 0;
    while ((a = attrRe.exec(m[4]))) {
      node.attrs[a[1]] = (a[2] !== undefined ? a[2] : a[3] !== undefined ? a[3] : '').replace(/&amp;/g, '&');
      if (a[1] === 'id') { if (ids[node.attrs.id]) fail('index.html: the id "' + node.attrs.id + '" is used twice'); ids[node.attrs.id] = 1; }
    }
    stack[stack.length - 1].appendChild(node);
    if (!VOID[m[3]] && !m[5]) stack.push(node);
  }
  if (stack.length !== 1) fail('index.html: <' + stack[stack.length - 1].localName + '> is never closed');
}

// ---- the stand-in window: a clock that moves when told to, and the timers that hang on it ----

var G = globalThis;
G.window = G;
G.setTimeout = function (fn, ms) { var t = { id: timerSeq++, at: clock + Math.max(0, ms || 0), fn: fn, every: 0 }; timerList.push(t); return t.id; };
G.setInterval = function (fn, ms) { var t = { id: timerSeq++, at: clock + Math.max(1, ms || 0), fn: fn, every: Math.max(1, ms || 0) }; timerList.push(t); return t.id; };
G.clearTimeout = G.clearInterval = function (id) { timerList = timerList.filter(function (t) { return t.id !== id; }); };
G.performance = { now: function () { clock += 0.5; return clock; } };      // reading the clock costs half a millisecond
G.scrollTo = function () {};
G.innerHeight = 800;
G.crypto = { getRandomValues: function (a) { a[0] = Math.floor(A.draw(4242, 91, timerSeq & 255, 0, 0, clock | 0) * 4294967296); return a; } };
G.matchMedia = function (q) {
  return { matches: /reduced-motion/.test(q) ? pageOpts.reduced : /max-width: 620px/.test(q) ? pageOpts.narrow : false,
           addEventListener: function (type, fn) { mqListeners.push(fn); } };
};
Object.defineProperty(G, 'localStorage', { configurable: true, get: function () {
  if (storageThrows) throw new Error('storage is not available here');
  return { getItem: function (k) { return k in storeBox ? storeBox[k] : null; }, setItem: function (k, v) { storeBox[k] = String(v); } };
} });
function advance(ms) {
  var end = clock + ms, guard = 0;
  for (;;) {
    var next = null, i;
    for (i = 0; i < timerList.length; i++) if (timerList[i].at <= end && (!next || timerList[i].at < next.at)) next = timerList[i];
    if (!next) break;
    if (next.at > clock) clock = next.at;
    if (next.every) next.at = clock + next.every; else timerList.splice(timerList.indexOf(next), 1);
    next.fn();
    if (clock > end) end = clock;
    if (++guard > 200000) fail('timers never settle');
  }
  if (clock < end) clock = end;
}

var pageOpts = { reduced: false, narrow: false };
function openPage(opts) {
  opts = opts || {};
  pageOpts = { reduced: !!opts.reduced, narrow: !!opts.narrow };
  clock = 0; timerList = []; mqListeners = [];
  storageThrows = !!opts.storageThrows;
  fakeDoc = makeDocument();
  parseHTML(HTML, fakeDoc);
  G.document = fakeDoc;
  G.location = { hash: opts.hash || '' };
  G.claude = opts.hot ? { hot: opts.hot } : undefined;
  G.AYWords = W;                 // the checked wrappers: every sentence app.js asks for is verified too
  G.AYApp = undefined;
  load('app.js');
  assert(G.AYApp && G.AYApp.state, 'window.AYApp = { state } is exposed');
  return fakeDoc;
}

// ---- driving the page ----

function byId(id) { var n = fakeDoc.getElementById(id); if (!n) fail('the page has no #' + id); return n; }
function currentView() {
  var views = fakeDoc.querySelectorAll('[data-view]'), open = views.filter(function (v) { return !v.hidden; });
  assert(views.length === 5, 'five view containers');
  assert(open.length === 1, 'exactly one view is not hidden (found ' + open.length + ')');
  assert(G.AYApp.state.view === open[0].getAttribute('data-view'), 'state.view names the view on screen');
  return open[0];
}
function inHidden(n) { for (; n; n = n.parentNode) if (n.nodeType === 1 && n.hidden) return true; return false; }
var pageTexts = 0;
function checkPage(label) {
  var view = currentView(), name = view.getAttribute('data-view');
  (function walk(n) {
    if (n.nodeType === 3) { var t = n.data.trim(); if (t) { checkSentence(t, 'text on the ' + name + ' view (' + label + ')'); pageTexts++; } return; }
    if (n.hidden) return;
    for (var i = 0; i < n.childNodes.length; i++) walk(n.childNodes[i]);
  })(view);
  return name;
}
function filled(id) { var t = byId(id).textContent.trim(); if (!t) fail('#' + id + ' is empty'); return t; }
function chooseRadio(input) {
  assert(!input.disabled, 'a radio that is still live');
  fakeDoc.querySelectorAll('input[name="' + input.name + '"]').forEach(function (r) { r.checked = false; });
  input.checked = true;
  fire(input, 'change', {});
}
// A click on a radio as a browser delivers it: the click first, and the choice only if nothing
// on the way prevented it. Returns whether the choice was taken.
function clickRadio(input, detail) {
  var ev = input.click(detail === undefined ? 1 : detail);
  if (!ev || ev.defaultPrevented) return false;
  chooseRadio(input);
  return true;
}
function noPicks(st) { return Object.keys(st.picks).length === 0 && fakeDoc.querySelectorAll('input[type=radio]').filter(function (r) { return r.checked; }).length === 0; }
function radioFor(id, value) {
  var card = fakeDoc.querySelector('[data-house="' + id + '"]');
  assert(card, 'a card with data-house="' + id + '"');
  var radios = card.querySelectorAll('input[type=radio][name="choice-' + id + '"]');
  assert(radios.length === 2 && radios[0].value === 'send' && radios[1].value === 'stay', 'two radios, send and stay, named choice-' + id);
  return value === 'send' ? radios[0] : radios[1];
}

var domStats = { lives: 0, days: 0, flips: 0, elsewhere: 0, seasons: 0, restores: 0 };

// One day through the page's own controls. Returns the view that follows.
function domDay(policy, stopAfterReveal, stopAtSeason) {
  var st = G.AYApp.state, t = st.today, day = t.day, i, n, want, card;
  where = 'page run, valley ' + st.seed + ', day ' + day;
  assert(currentView().getAttribute('data-view') === 'day' && st.phase === 'choose', 'the day opens for choosing');
  assert(filled('day-title') === 'Day ' + day + ' of 12', 'the heading counts the day');
  assert(byId('day-last').hidden === (day !== 12), '"The last day." shows on day 12 only');
  var notches = byId('track').querySelectorAll('.notch');
  assert(notches.length === 12 && byId('track').querySelectorAll('.stick-group').length === 3, 'twelve notches in three groups');
  assert(byId('track').querySelectorAll('.spent').length === day - 1 && byId('track').querySelectorAll('.today').length === 1, 'past days are spent, today is marked');
  assert(fakeDoc.querySelectorAll('[data-house]').length === 4, 'four neighbour cards');
  assert(byId('close-day').disabled && !byId('close-day').hidden && byId('next-day').hidden, 'Close the day waits for four choices');
  assert(fakeDoc.querySelectorAll('button[data-why]').length === 0, 'no Why? before the reveal');
  checkPage('choosing');
  for (i = 0; i < 4; i++) {
    n = t.neighbours[i];
    want = !!policy.pick(n, t, st.seed);
    if (i === 0) chooseRadio(radioFor(n.id, want ? 'stay' : 'send'));       // a change of mind before closing
    if (i === 3) chooseRadio(radioFor(n.id, want ? 'send' : 'stay'));       // by the keyboard: no click at all
    else assert(clickRadio(radioFor(n.id, want ? 'send' : 'stay')), 'a plain click on a radio takes the choice');
    assert(st.picks[n.id] === want, 'the choice is in state.picks');
    assert(byId('close-day').disabled === (i < 3), 'Close the day is enabled once all four choices are made');
    if (i < 3) assert(/^Choose for \d more houses?$/.test(byId('close-day').textContent), 'the button says how many are left');
  }
  assert(byId('ways-rows').querySelectorAll('.cut.pending').length === 4, 'four pending cuts in your ways');
  var before = st.choices.length;
  byId('close-day').click();
  assert(st.phase === 'revealed' && st.choices.length === before + 1, 'the day is closed');
  byId('next-day').click(2);                    // the second click of a double click on Close the day
  assert(st.phase === 'revealed', 'a double click does not skip the reveal');
  fakeDoc.querySelector('button[data-why]').click(2);          // or it lands on a Why? that has just appeared
  assert(fakeDoc.querySelectorAll('.card.flipped').length === 0 && Object.keys(st.flipped).length === 0, 'a double click does not turn a card over');
  byId('close-day').click(); fire(byId('close-day'), 'click', { detail: 1 });
  assert(st.choices.length === before + 1 && st.life.day === day + 1, 'a closed day cannot be closed twice');
  assert(byId('close-day').hidden && !byId('next-day').hidden, 'Next day replaces Close the day');
  assert(fakeDoc.activeElement === byId('next-day'), 'focus moves to the next step');
  assert(/^Today: /.test(filled('day-result')), 'the day\'s total is announced');
  assert(byId('day-result').getAttribute('aria-live') === 'polite', 'the result area is a polite live region');
  assert(byId('ways-rows').querySelectorAll('.cut.pending').length === 0 && byId('ways-rows').querySelectorAll('.cut.fresh').length === 4, 'today\'s four cuts are marked as new');
  checkPage('revealed');
  for (i = 0; i < 4; i++) {
    n = t.neighbours[i];
    card = fakeDoc.querySelector('[data-house="' + n.id + '"]');
    card.querySelectorAll('input[type=radio]').forEach(function (r) { assert(r.disabled, 'choices are inert after the day is closed'); });
    assert(card.querySelector('input[value="' + (st.result.results[i].intended ? 'send' : 'stay') + '"]').checked, 'the card still shows what was chosen');
    var whyBtn = card.querySelector('button[data-why="' + n.id + '"]');
    assert(whyBtn, 'a Why? button on each card after the reveal');
    whyBtn.click();
    assert(card.classList.contains('flipped') && st.flipped[n.id] === true, 'Why? turns the card over');
    advance(400);
    assert(fakeDoc.activeElement === card.querySelector('[data-back]'), 'focus follows to the back of the card');
    assert(card.querySelector('.back .why-claim').textContent.length > 10, 'the back gives a reason');
    checkPage('card turned over');
    card.querySelector('[data-back]').click();
    assert(!card.classList.contains('flipped'), 'and back again');
    advance(400);
    domStats.flips++;
  }
  fakeDoc.querySelectorAll('button[data-why-kin]').forEach(function (b) {
    b.click();
    assert(b.getAttribute('aria-expanded') === 'true' && !byId(b.getAttribute('aria-controls')).hidden, 'an Elsewhere reason opens');
    checkPage('elsewhere reason open');
    domStats.elsewhere++;
  });
  domStats.days++;
  if (stopAfterReveal) return 'day';
  byId('next-day').click();
  if (day % 4 === 0) {
    byId('next-day').click(2);
    assert(st.phase === 'season', 'a double click does not skip the season\'s end');
    assert(st.phase === 'season' && !byId('season-end').hidden && byId('cards').hidden, 'a season\'s end comes first on days 4, 8 and 12');
    assert(byId('season-kin').children.length >= 1, 'the season\'s end says how far kin follows you');
    assert(fakeDoc.activeElement === byId('season-h'), 'focus moves to the season\'s end');
    checkPage('season\'s end');
    domStats.seasons++;
    if (stopAtSeason) return 'day';
    byId('next-day').click();
  }
  var view = currentView().getAttribute('data-view');
  assert(view === (day === 12 ? 'leaving' : 'day'), 'after day ' + day + ' comes ' + (day === 12 ? 'the leaving' : 'the next day'));
  if (day < 12) assert(st.today.day === day + 1 && st.phase === 'choose' && byId('season-end').hidden && !byId('cards').hidden, 'the next day opens');
  return view;
}
function domLife(policy) {
  for (var d = 1; d <= 12; d++) domDay(policy, false, false);
  where = 'page run, leaving';
  var st = G.AYApp.state;
  assert(checkPage('leaving') === 'leaving', 'the leaving view');
  assert(/^Winter store: /.test(filled('leaving-store')) && byId('leave-rows').children.length === 5, 'the store and five ways are stated');
  assert(/follows your ways in \d of 5 situations\.$/.test(filled('leave-kin')), 'kin is counted');
  assert(fakeDoc.activeElement === byId('leaving-h'), 'focus moves to the new view\'s heading');
  assert(timerList.length === 0, 'no timer is left pending outside the Afterwards');
  domStats.lives++;
  return st;
}
function watchToEnd(st) {
  where = 'page run, the Afterwards';
  assert(currentView().getAttribute('data-view') === 'afterwards', 'the Afterwards view');
  assert(byId('ring').querySelectorAll('.house').length === 8 && byId('ring').querySelectorAll('.tie').length === 16, 'a ring of eight houses and sixteen ties');
  assert(byId('ring').querySelectorAll('.hand').length === 128, 'sixteen strokes a house');
  assert(/^This is one future of 2000\.$/.test(filled('after-one')), 'one future of 2000');
  assert(byId('to-chronicle').hidden && !byId('skip').hidden, 'Skip is offered while it plays');
}
function finishCount(st) {
  var guard = 0;
  while (byId('to-chronicle').hidden) {
    assert(!byId('after-counting').hidden && /^Counting futures: \d+ of 2000$/.test(filled('after-counting')), 'the count in progress is shown');
    advance(1000);
    if (++guard > 60) fail('the verdict never arrived');
  }
  assert(st.verdict && st.verdict.futures === 2000 && byId('after-counting').hidden && byId('skip').hidden, 'the count is in');
  ringAtRest(st);
  checkPage('the Afterwards, ended');
}
// The ring's resting state and the sentence beside it count the same houses.
function ringAtRest(st) {
  var f = st.future, marked = byId('ring').querySelectorAll('.house.yours').length;
  assert(st.afterDone && byId('ring').querySelector('.season-num').textContent === '30', 'the ring rests on season 30');
  assert(filled('after-yours') === RAW.yourWaysEnd(f), 'the closing line about your ways');
  assert(marked === f.yourWaysAtEnd, 'the ring at rest marks ' + marked + ' houses as running your ways; the line beside it counts ' + f.yourWaysAtEnd);
  for (var j = 0; j < 8; j++) {
    assert(byId('ring').querySelectorAll('.house')[j].classList.contains('yours') === yoursWay(f.finalWay[j], st.life.kin), 'house ' + j + ' is marked from finalWay');
  }
}
function readChronicle(st) {
  where = 'page run, the Chronicle';
  byId('to-chronicle').click();
  byId('again').click(2); byId('again-same').click(2);         // the second click of a double click on See the count
  assert(checkPage('the Chronicle') === 'chronicle' && st.verdict, 'the Chronicle view (and a double click does not start another life)');
  var listed = fakeDoc.querySelectorAll('.watched li').map(function (li) { return li.textContent; }), expected = watchedList(st.life, st.future);
  assert(/^When you left, your heir/.test(listed[0]), 'the list opens with who kept your ways when you left');
  assert(listed.join('|') === expected.join('|'), 'the list under "In the future you watched" is the one that adds up to the closing count');
  assert(fakeDoc.querySelector('.scale-mark.you .lab').textContent === 'You' && fakeDoc.querySelector('.scale-mark.old .lab').textContent === 'The old way',
    'the two markers on the scale are named, not numbered');
  assert(/You, \d+%\. The old way, \d+%\./.test(fakeDoc.querySelector('.scale').getAttribute('aria-label')), 'the scale\'s spoken label still says where they sit');
  assert(fakeDoc.querySelectorAll('.field i').length === 400, 'two fields of 200 strokes');
  assert(fakeDoc.querySelectorAll('.field i.held').length + fakeDoc.querySelectorAll('.field i.fell').length === 400, 'each stroke stands or has fallen');
  assert(fakeDoc.querySelectorAll('.scale-mark').length === 4, 'the scale carries two ends and two markers');
  assert((fakeDoc.querySelectorAll('.seal').length === 1) === (st.verdict.seal.earned === true), 'the seal shows when the engine says so, and only then');
  assert(filled('chron-valley') === 'Valley no. ' + st.life.seed, 'the valley number');
  assert(byId('chron-past-list').children.length >= 1 && !byId('chron-past').hidden, 'this life is listed among past lives');
  assert(timerList.length === 0, 'no timer is left pending on the Chronicle');
  return byId('chron-main').textContent + ' ' + byId('chron-side').textContent;
}

(function pageRuns() {
  var st, d, snap = null, before;

  // 1. A whole Life, watched to the end, on a valley fixed by the hash.
  where = 'page run 1';
  storeBox = {};
  d = openPage({ hash: '#valley-48213' });
  assert(checkPage('opening') === 'opening', 'the page opens on the opening view');
  assert(filled('opening-h') === 'After You' && filled('begin') === 'Begin' && byId('op-premise').children.length === 4, 'the opening is complete');
  assert(byId('op-past').hidden, 'no past lives yet');
  assert(byId('op-stick').querySelectorAll('.notch').length === 12, 'twelve uncut notches on the opening');
  byId('begin').click();
  st = G.AYApp.state;
  assert(st.seed === 48213 && st.life.seed === 48213, '#valley-48213 fixes the valley');
  // the second click of a double click on Begin lands on whatever is now under the pointer
  assert(!clickRadio(radioFor(st.today.neighbours[2].id, 'send'), 2) && !clickRadio(radioFor(st.today.neighbours[0].id, 'stay'), 3) && noPicks(st),
    'a double click on Begin makes no choice on day 1');
  assert(fakeDoc.activeElement === byId('day-h'), 'focus moves to the day heading');
  domLife(POLICIES[2]);
  assert(st.life.purse === samples['48213/2'].life.purse, 'the page lived the same Life as the direct engine calls');
  byId('leave').click();
  watchToEnd(st);
  var lastNum = 0, steps = 0, t0 = clock;
  while (!st.afterDone) {
    advance(250);
    var num = Number(byId('ring').querySelector('.season-num').textContent);
    assert(num >= lastNum && num >= 1 && num <= 30, 'the season counter only climbs');
    lastNum = num;
    if (++steps > 200) fail('the Afterwards never ended');
  }
  assert(clock - t0 >= 19500 && clock - t0 <= 21500, 'thirty seasons take about twenty seconds (took ' + Math.round(clock - t0) + ' ms)');
  assert(lastNum === 30 && !byId('after-end').hidden, 'season 30 and the closing lines');
  assert(/^In this future the valley (held|fell)(, barely)?\.$/.test(filled('after-held')), 'how this future went');
  assert(byId('ticker').children.length === samples['48213/2'].ticker.length, 'the ticker printed every event line');
  assert(byId('flow').children.length === 30, 'thirty bars of help flow');
  finishCount(st);
  assert(st.verdict.holds === samples['48213/2'].verdict.holds, 'the page counted the same verdict');
  var text = readChronicle(st);
  samples['48213/2'].chronicle.forEach(function (line) {
    if (/^\[|^[A-Z ]+$|^The count$|^Valley |^With you \(|^The old way \(/.test(line)) return;
    assert(text.indexOf(line) >= 0, 'the Chronicle on the page carries the line: ' + line);
  });
  assert(JSON.parse(storeBox['after-you.lives.v1']).length === 1, 'the life is kept in localStorage');
  byId('again-same').click();
  assert(currentView().getAttribute('data-view') === 'day' && st.seed === 48213 && st.choices.length === 0 && st.today.day === 1, 'Live this valley again: same valley, day 1');
  assert(!clickRadio(radioFor(st.today.neighbours[1].id, 'stay'), 2) && noPicks(st), 'a double click on Live this valley again makes no choice');
  advance(600);
  assert(clickRadio(radioFor(st.today.neighbours[1].id, 'stay'), 2) && st.picks[st.today.neighbours[1].id] === false, 'half a second on, a quick second click is an ordinary click again');
  byId('next-day').click(); byId('close-day').click();
  assert(st.choices.length === 0, 'nothing happens before four choices are made');

  // 2. Skipped, with storage unavailable and reduced motion off; then another life.
  where = 'page run 2';
  d = openPage({ storageThrows: true });
  assert(byId('op-past').hidden, 'no stored lives, and no error, when storage throws');
  byId('begin').click();
  st = G.AYApp.state;
  assert(st.seed >= 10000 && st.seed <= 99999, 'a fresh valley number');
  domLife(POLICIES[4]);
  byId('leave').click(2);                       // the second click of a double click on The harvest is in
  assert(currentView().getAttribute('data-view') === 'leaving' && !st.future && timerList.length === 0, 'a double click does not leave the valley unread');
  byId('leave').click();
  watchToEnd(st);
  advance(1500);
  assert(st.shownSeason >= 2 && st.shownSeason <= 4 && !st.afterDone, 'the seasons are playing');
  byId('skip').click();
  assert(st.afterDone && st.shownSeason === 30 && byId('ring').querySelector('.season-num').textContent === '30', 'Skip jumps to the end');
  finishCount(st);
  readChronicle(st);
  before = st.seed;
  byId('again').click();
  assert(currentView().getAttribute('data-view') === 'day' && st.choices.length === 0, 'Live another life opens day 1');
  assert(!clickRadio(radioFor(st.today.neighbours[3].id, 'send'), 2) && noPicks(st), 'a double click on Live another life makes no choice');
  assert(st.lives.length === 1, 'past lives are kept in memory when storage is unavailable');

  // 3. Reduced motion: the final state and the list of events, without animating.
  where = 'page run 3';
  storeBox = { 'after-you.lives.v1': '{not json' };
  d = openPage({ reduced: true, narrow: true });
  assert(byId('op-past').hidden, 'a broken store is ignored');
  byId('begin').click();
  st = G.AYApp.state;
  assert(fakeDoc.querySelectorAll('details.know').filter(function (k) { return k.open; }).length === 0, 'on a phone, what you know is folded away');
  pageOpts.narrow = false; mqListeners.forEach(function (fn) { fn(); });
  assert(fakeDoc.querySelectorAll('details.know').filter(function (k) { return k.open; }).length === 4, 'and open on a wider screen');
  domLife(POLICIES[0]);
  byId('leave').click();
  assert(st.afterDone && st.shownSeason === 30 && !byId('after-end').hidden, 'with reduced motion the end state is shown at once');
  finishCount(st);
  readChronicle(st);
  assert(JSON.parse(storeBox['after-you.lives.v1']).length === 1, 'a broken store is replaced');

  // 4. A reload keeps the Life: every stage is rebuilt from its seed and its choices.
  where = 'page run 4';
  storeBox = {};
  var hot = { data: undefined, snapshot: function (fn) { snap = fn; }, ready: function (cb) { cb(this.data); } };
  d = openPage({ hot: hot });
  assert(currentView().getAttribute('data-view') === 'opening', 'nothing to resume: the opening');
  byId('begin').click();
  st = G.AYApp.state;
  var pol = POLICIES[1], k;
  for (k = 1; k <= 3; k++) domDay(pol, false, false);
  function reload(label, check) {
    var saved = JSON.parse(JSON.stringify(snap())), purse = st.life.purse, day = st.life.day, seed = st.seed;
    hot.data = saved;
    openPage({ hot: hot });
    advance(50);
    st = G.AYApp.state;
    assert(st.seed === seed && st.life.purse === purse && st.life.day === day, 'reload (' + label + '): the same Life');
    assert(st.view === saved.view && currentView().getAttribute('data-view') === saved.view, 'reload (' + label + '): the same view');
    check(saved);
    checkPage('reloaded, ' + label);
    domStats.restores++;
  }
  chooseRadio(radioFor(1, 'send')); chooseRadio(radioFor(6, 'stay'));
  reload('choosing', function (saved) {
    assert(st.phase === 'choose' && st.today.day === 4 && st.picks[1] === true && st.picks[6] === false, 'choices in hand survive');
    assert(radioFor(1, 'send').checked && radioFor(6, 'stay').checked && byId('close-day').disabled, 'and are shown');
  });
  domDay(pol, true, false);
  reload('revealed', function () { assert(st.phase === 'revealed' && st.today.day === 4 && fakeDoc.querySelectorAll('button[data-why]').length === 4, 'the reveal survives'); });
  byId('next-day').click();
  reload('season\'s end', function () { assert(st.phase === 'season' && !byId('season-end').hidden, 'the season\'s end survives'); });
  byId('next-day').click();
  for (k = 5; k <= 12; k++) domDay(pol, false, false);
  reload('leaving', function () { assert(st.life.over && /^Winter store: /.test(filled('leaving-store')), 'the leaving survives'); });
  byId('leave').click();
  advance(3000);
  reload('the Afterwards', function () { assert(st.afterDone && st.shownSeason === 30, 'the Afterwards comes back at its end'); });
  finishCount(st);
  byId('to-chronicle').click();
  var mark = st.verdict.mark;
  reload('the Chronicle', function () {
    advance(5000);
    assert(st.view === 'chronicle' && st.verdict && st.verdict.mark === mark, 'the Chronicle comes back with the same count');
    assert(st.lives.length === 1 && JSON.parse(storeBox['after-you.lives.v1']).length === 1, 'and the life is not recorded a second time');
  });
  // 5. A future whose last Looking-Round moves a house on or off your ways (valley 513, never sending):
  // season 30 shows one house on them, the closing line counts two. Reached by a reload, so nothing animates.
  where = 'page run 5';
  var stay12 = [];
  for (k = 0; k < 12; k++) stay12.push({ 1: false, 2: false, 6: false, 7: false });
  hot.data = { seed: 513, choices: stay12, view: 'afterwards', phase: 'choose', picks: {}, recorded: false };
  openPage({ hot: hot });
  st = G.AYApp.state;
  assert(st.view === 'afterwards' && st.afterDone && st.life.seed === 513, 'valley 513 comes back at the end of its Afterwards');
  var in30 = st.future.seasons[29].houses.filter(function (h) { return yoursWay(h.way, st.life.kin); }).length;
  assert(in30 !== st.future.yourWaysAtEnd, 'valley 513 is a future whose last round changes the count (season 30: ' + in30 + ', at the end: ' + st.future.yourWaysAtEnd + ')');
  ringAtRest(st);
  checkPage('the Afterwards at rest, valley 513');

  // 6. A future in which a third house kept your ways when you left and newcomers then took its holding
  // (valley 42, sending unless left short): both lines must be on the page's own list, or the count cannot be followed.
  where = 'page run 6';
  storeBox = {};
  hot.data = { seed: 42, choices: samples['42/1'].record, view: 'chronicle', phase: 'choose', picks: {}, recorded: true };
  openPage({ hot: hot });
  advance(8000);
  st = G.AYApp.state;
  assert(st.view === 'chronicle' && checkPage('the Chronicle, valley 42') === 'chronicle' && st.life.purse === samples['42/1'].life.purse, 'valley 42 comes back on its Chronicle');
  var listed42 = fakeDoc.querySelectorAll('.watched li').map(function (li) { return li.textContent; });
  assert(/^When you left, your heir, your sister's house and the \w+ house kept your ways\.$/.test(listed42[0]), 'valley 42: a third house kept your ways when you left, and the list says so');
  assert(listed42.filter(function (l) { return /^Season \d+: newcomers, the \w+ house, take over the \w+ holding\.$/.test(l); }).length === 1,
    'valley 42: newcomers take a holding that kept your ways, and the list says so');
  assert(listed42.join('|') === watchedList(st.life, st.future).join('|'), 'valley 42: the list on the page is the one that adds up to the closing count');
  assert(byId('chron-past').hidden && st.lives.length === 0, 'a life already recorded is not recorded again');

  // 7. A card whose front counts since the house changed a way while its Why? side quotes the whole Life:
  // the Why? side has to say which count it gives. Reached by a reload onto that day's reveal.
  where = 'page run 7';
  assert(twoCountsCase, 'some life has a card whose two sides count differently');
  hot.data = { seed: twoCountsCase.seed, choices: twoCountsCase.days, view: 'day', phase: 'revealed', picks: {}, recorded: false };
  openPage({ hot: hot });
  st = G.AYApp.state;
  var cardN = st.today.neighbours[twoCountsCase.index], cardR = st.result.results[twoCountsCase.index], sit = cardR.why.situation;
  var card7 = fakeDoc.querySelector('[data-house="' + twoCountsCase.id + '"]');
  assert(st.phase === 'revealed' && st.choices.length === twoCountsCase.days.length && cardN.id === twoCountsCase.id && cardN.changedDay !== null && cardR.why.source.type === 'own',
    'the card is back as it was: an own way of a house that changed a way');
  assert(card7.querySelector('.front .know-changed').textContent === RAW.seenChanged(cardN.changedDay), 'its front says it counts since the change');
  assert(card7.querySelectorAll('.front .know-rows dd')[sit].textContent === RAW.seenCount(cardN.seenSince[sit]), 'and shows the count since then');
  card7.querySelector('button[data-why]').click();
  assert(card7.querySelector('.back .why-count').textContent ===
    'Before today you knew them to send a hand here ' + cardR.why.seen.h + ' of ' + cardR.why.seen.n + (cardR.why.seen.n === 1 ? ' time' : ' times') + ', counted over the whole harvest.',
    'its Why? side gives the whole count and says so: ' + card7.querySelector('.back .why-count').textContent);
  checkPage('a card whose two sides count differently');

  hot.data = { seed: 5, choices: [{ 1: true }], view: 'day', phase: 'choose' };
  openPage({ hot: hot });
  assert(currentView().getAttribute('data-view') === 'opening', 'a snapshot that makes no sense falls back to the opening');
  G.claude = undefined;
})();
where = 'done';

SAMPLES.forEach(function (tag, i) {
  var sm = samples[tag];
  print('');
  print('=== Chronicle ' + (i + 1) + ' of 5: valley ' + sm.life.seed + ', played as "' + sm.policy + '" ===');
  sm.chronicle.forEach(function (line) { print('  ' + line); });
});
print('');
print('The page itself, on a stand-in DOM: ' + domStats.lives + ' lives played through its own controls (' + domStats.days + ' days, ' +
  domStats.flips + ' cards turned over, ' + domStats.elsewhere + ' reasons opened elsewhere, ' + domStats.seasons + ' season\'s ends, ' +
  domStats.restores + ' reloads), ' + pageTexts + ' pieces of text on screen checked.');
print('Static: app.js names ' + staticInfo.words + ' AYWords functions and ' + staticInfo.ids + ' ids, all present; hooks of section 2 present.');
print('');
print('What the lives reached (counts over ' + seenStats.lives + ' lives):');
print('  ' + Object.keys(seenStats).map(function (k) { return k + ' ' + seenStats[k]; }).join(', '));
print('');
print('page-smoke: ' + SEEDS.length + ' valleys x ' + POLICIES.length + ' ways of playing = ' + seenStats.lives + ' complete lives.');
print('page-smoke: ' + Object.keys(calls).length + ' AYWords functions, every one called; ' + sentences + ' sentences checked.');
print('page-smoke: ' + (preciseTime() - T0).toFixed(1) + ' s. PASS');
