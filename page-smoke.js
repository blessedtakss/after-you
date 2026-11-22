/*
 * After You: page smoke test (jsc).
 *   cd <this folder> && "$JSC" page-smoke.js
 * Loads engine.js and words.js, then for many seeds and several ways of playing performs the
 * same sequence of engine calls that app.js performs for a complete Life (every day, every
 * reveal, every Why?, every season's end, Leaving, the watched future, the verdict by
 * verdictJob), calls every function of AYWords with the real engine data at each point, and
 * throws if a sentence is malformed or an engine field the page draws from is undefined.
 */
load('engine.js');
load('words.js');

var A = AfterYou, W = AYWords;
var T0 = preciseTime();

// ---- sentence checks ------------------------------------------------------------------------

var FORBIDDEN = ['cooperate', 'cooperates', 'cooperated', 'cooperation', 'defect', 'defects', 'defected', 'defection',
                 'prisoner', 'prisoners', 'dilemma', 'strategy', 'strategies', 'payoff', 'payoffs', 'tit for tat',
                 'game theory', 'player', 'players', 'firm', 'soft', 'taker', 'takers', 'wary', 'steady'];
var FORBIDDEN_RE = new RegExp('(^|[^a-z])(' + FORBIDDEN.join('|') + ')([^a-z]|$)', 'i');
var BAD_BITS = ['undefined', 'NaN', 'null', '[object', '  '];

var sentences = 0, where = '', depth = 0, called = {};

function checkString(s, fn) {
  var at = ' (AYWords.' + fn + ' at ' + where + ')';
  if (typeof s !== 'string') throw new Error('not a string: ' + String(s) + at);
  if (!s.length || !s.replace(/\s/g, '').length) throw new Error('empty sentence' + at);
  for (var i = 0; i < BAD_BITS.length; i++) {
    if (s.indexOf(BAD_BITS[i]) >= 0) throw new Error('"' + BAD_BITS[i] + '" in: "' + s + '"' + at);
  }
  var m = FORBIDDEN_RE.exec(s);
  if (m) throw new Error('forbidden word "' + m[2] + '" in: "' + s + '"' + at);
  if (/[!—]/.test(s)) throw new Error('exclamation mark or em-dash in: "' + s + '"' + at);
  if (s !== s.trim()) throw new Error('leading or trailing space in: "' + s + '"' + at);
  sentences++;
}
function checkValue(v, fn) {
  if (typeof v === 'string') return checkString(v, fn);
  if (typeof v === 'number') { if (!isFinite(v)) throw new Error('non-finite number from AYWords.' + fn + ' at ' + where); return; }
  if (typeof v === 'boolean') return;
  if (v === null || v === undefined) throw new Error(String(v) + ' returned by AYWords.' + fn + ' at ' + where);
  if (Array.isArray(v)) { for (var i = 0; i < v.length; i++) checkValue(v[i], fn); return; }
  if (typeof v === 'object') { for (var k in v) checkValue(v[k], fn + '.' + k); return; }
  throw new Error('unexpected ' + typeof v + ' from AYWords.' + fn + ' at ' + where);
}

// Wrap every function of AYWords: count the call, check what it returns (top-level calls only).
var NAMES = Object.keys(W).filter(function (k) { return typeof W[k] === 'function'; });
NAMES.forEach(function (name) {
  var fn = W[name];
  called[name] = 0;
  W[name] = function () {
    depth++;
    var out;
    try { out = fn.apply(W, arguments); } finally { depth--; }
    if (depth === 0) { called[name]++; checkValue(out, name); }
    return out;
  };
});

// ---- engine field checks --------------------------------------------------------------------

var fieldsRead = 0;
function need(obj, path, label) {
  var parts = path.split('.'), cur = obj;
  for (var i = 0; i < parts.length; i++) {
    if (cur === null || cur === undefined) throw new Error('engine field missing: ' + label + '.' + path + ' at ' + where);
    cur = cur[parts[i]];
  }
  if (cur === undefined) throw new Error('engine field undefined: ' + label + '.' + path + ' at ' + where);
  fieldsRead++;
  return cur;
}
function needAll(obj, paths, label) { for (var i = 0; i < paths.length; i++) need(obj, paths[i], label); }
function isNum(x, label) { if (typeof x !== 'number' || !isFinite(x)) throw new Error('not a finite number: ' + label + ' = ' + x + ' at ' + where); }

// ---- ways of playing ------------------------------------------------------------------------

var POLICIES = {
  'always send': function (n, day) { return true; },
  'send unless left short': function (n, day) { return n.situation !== 2; },
  'send unless left short, stay home on day 12': function (n, day) { return day === 12 ? false : n.situation !== 2; },
  // three more, for the corners of the copy: untested ways, a store below the need, mixed
  // tallies, and a careful Life that can earn the seal
  'never send': function (n, day) { return false; },
  // the old way itself: the two rows of the Chronicle are then the same in every future
  'the old way': function (n, day) { return n.situation === 0 || n.situation === 1 || n.situation === 3; },
  'mixed': function (n, day, seed) { return A.draw(seed, 99, day, n.id, 0, 0) < 0.6; },
  'send, except to a house never seen to send': function (n, day) {
    var h = 0, c = 0, s;
    for (s = 0; s < 5; s++) { h += n.seen[s].h; c += n.seen[s].n; }
    return !(day > 2 && c >= 3 && h === 0);
  }
};
var REQUIRED = ['always send', 'send unless left short', 'send unless left short, stay home on day 12'];

// ---- one complete Life, as app.js runs it ---------------------------------------------------

var stats = { lives: 0, whyYou: 0, whyOwn: 0, whyHouse: 0, whyBlank: 0, third: 0, lost: 0, seasonEnds: 0,
              sealed: 0, kept: 0, lastDay: 0, matteredHabit: 0, matteredLast: 0, matteredNone: 0, held: 0,
              ownSince: [0, 0, 0],   // own-way cards on a house that changed a way: not seen since, seen once, seen more
              keepsNoArc: 0,         // neighbours the map marks as keeping your ways with no habit learned from you directly
              lastFrameMoved: 0,     // watched futures whose resting map differs from season 30's frame
              secondHand: 0,         // season's-end lines for a house that took up your ways from another house
              noHand: 0,             // reveals in which no hand went either way
              markSame: 0, rangeSaid: 0,   // Chronicles with two equal counts; with "yours holds in N%" under the scale
              matteredOneSided: 0,   // "mattered" lines for a way the reader always kept one way
              wentBack: 0 };         // watched futures' lines for a house that gives up your ways and goes back to its own
var MIRROR = [0, 1, 3, 2, 4];        // my situation on a tie -> theirs (as in app.js)

// app.js: which habits of each neighbour came from the reader, and which neighbours run the
// reader's ways as a whole (followNow and keepsNow there)
function followOf(life) {
  var out = {}, i, s, src;
  for (i = 0; i < life.neighbours.length; i++) {
    src = life.houses[life.neighbours[i]].source; out[life.neighbours[i]] = [];
    for (s = 0; s < 5; s++) out[life.neighbours[i]].push(!!(src && src[s] && src[s].type === 'you'));
  }
  return out;
}
function keepsOf(life) {
  var out = {}, follow = followOf(life), i, id, way;
  for (i = 0; i < life.neighbours.length; i++) {
    id = life.neighbours[i]; way = life.houses[id].way;
    out[id] = (way === 0 || way === life.kin) && (id !== life.kin || follow[id].indexOf(true) >= 0);
  }
  return out;
}
// The day's map in words, as app.js builds it (drawDayMap): plans while choosing, results once closed.
function mapItems(t, follow, keeps, pending, results) {
  return t.neighbours.map(function (nb, k) {
    var arcs = 0, q;
    for (q = 0; q < 5; q++) if (follow[nb.id][q]) arcs++;
    return { name: nb.name, kin: nb.kin, plan: pending[nb.id], result: results ? results[k] : null, arcs: arcs, keeps: !!keeps[nb.id] };
  });
}
// No sentence about a day's dealings may say that the other house stayed home: the page only
// knows that no hand arrived (engine header: never say whether a missing hand was a choice).
function neutral(s, fn) {
  if (/both (houses )?stayed home|they stayed home/i.test(s)) throw new Error('a missing hand told as a choice by AYWords.' + fn + ': "' + s + '" at ' + where);
}

function liveOne(seedIn, policyName, verdictOptions) {
  var policy = POLICIES[policyName];
  where = 'valley ' + seedIn + ', "' + policyName + '", start';
  var out = [];                                     // the Chronicle, for printing
  var life = A.createLife(seedIn);
  needAll(life, ['seed', 'kin', 'neighbours', 'houses', 'need', 'purse', 'over'], 'life');
  var seed = life.seed, kinId = life.kin, i, s, d;
  if (life.neighbours.join(',') !== '1,2,6,7') throw new Error('neighbours are not [1,2,6,7]');

  // opening (static copy, the list of earlier lives is checked at the end)
  var op = W.opening();
  if (op.lines.length !== 4) throw new Error('the opening has four lines: the choice, the cost, the copying, and what is counted at the end');
  if (!/two things are counted/.test(op.lines[3])) throw new Error('the opening does not say what is counted at the end');
  // the seasons are in words before day 4: ways are taken up at the end of every fourth day
  if (!/^What you do, others see\. Some will take it up as their own way, at the end of every fourth day\.$/.test(op.lines[2])) throw new Error('the opening does not say when ways are taken up: ' + op.lines[2]);
  if (op.lines[2].length > 95) throw new Error('the third line of the opening has grown past two lines on a phone: ' + op.lines[2].length + ' characters');
  // the Opening lists the latest lives and names the control that holds the rest
  if (W.pastMore(1) !== '1 older life' || W.pastMore(17) !== '17 older lives') throw new Error('the count of older lives is worded wrongly');
  W.pastHead(); W.valleyNo(seed); needAll(W.mapLabels(), ['ford', 'ridge', 'beyond', 'yours', 'heir', 'sister', 'north'], 'mapLabels');
  W.mapAlt('sheet'); W.mapAlt('day'); W.mapAlt('after');
  W.signed(-1); W.signed(3); W.num(21);          // the stakes on the opening sheet, the sample number in the key
  W.legendHead(); W.legendDay(); W.legendAfter(); W.legendMarks(); W.legendWays(); W.mapHint();
  W.heir(true); W.heir(false); W.kin(true); W.kin(false);
  for (i = 0; i < 4; i++) { W.bearing(i); W.bearingShort(i); W.bearingSay(i); }
  W.send(); W.stay(); W.chooseLine(); W.knowHead(); W.knowFoot(); W.whyLabel(); W.whyBack(); W.whyHeads(); W.whyMarked();
  W.elsewhereHead(); W.waysHead(); W.waysNote(); W.fordNote(); W.storeHead(); W.mapFold(true); W.mapFold(false);

  var titles = [], youSeen = false;
  for (d = 1; d <= 12; d++) {
    where = 'valley ' + seed + ', "' + policyName + '", day ' + d;
    var t = A.today(life), w = A.ways(life);
    needAll(t, ['day', 'season', 'dayOfSeason', 'purse', 'need', 'oldWayPurse', 'over', 'neighbours'], 'today');
    if (t.day !== d) throw new Error('today().day is ' + t.day + ', expected ' + d);
    if (t.neighbours.length !== 4) throw new Error('today().neighbours is not four long');
    W.dayOf(t.day); W.dayTrackAlt(t.day); if (t.day === 12) W.lastDayNote();
    W.statusDay(t.day);                               // the status line names the day where the header is out of sight
    var lw = W.legendWays();                          // the key of Your ways, by the point of the day
    needAll(lw, ['sent', 'stayed', 'yesterday', 'today', 'planned'], 'legendWays');
    needAll(W.legendDay(), ['arrived', 'turned', 'planned', 'home', 'yours', 'keeps'], 'legendDay');
    W.store(t.purse, t.need); W.storeNeedTick(t.need); W.oldWay(t.oldWayPurse);
    isNum(t.purse, 'purse'); isNum(t.need, 'need'); isNum(t.oldWayPurse, 'oldWayPurse');

    // your ways panel
    if (w.length !== 5) throw new Error('ways() is not five long');
    for (s = 0; s < 5; s++) {
      needAll(w[s], ['situation', 'title', 'h', 'n', 'deeds'], 'ways[' + s + ']');
      titles[s] = w[s].title;
      W.wayCount(w[s].h, w[s].n);
      if (w[s].deeds.length !== w[s].n) throw new Error('ways deeds do not match n');
      for (i = 0; i < w[s].deeds.length; i++) {
        needAll(w[s].deeds[i], ['day', 'to', 'toName', 'helped'], 'ways.deeds');
        W.deed(w[s].deeds[i], s, kinId);              // each mark carries its deed as a title
      }
    }

    // the four cards, and the map's holdings
    var choices = {}, left = 4;
    var followNow = followOf(life), keepsNow = keepsOf(life);
    if (W.closeDay(left) !== 'Choose for all 4 houses') throw new Error('before any choice the button must not say "more"');
    W.mapAltDay(t.day, 'choose', mapItems(t, followNow, keepsNow, {}, null));      // nothing chosen yet
    for (i = 0; i < 4; i++) {
      var n = t.neighbours[i];
      needAll(n, ['id', 'name', 'kin', 'situation', 'situationTitle', 'yesterday', 'seen', 'seenSince', 'changedDay'], 'today.neighbours');
      if (n.yesterday) needAll(n.yesterday, ['intended', 'lost', 'arrived', 'they', 'payoff'], 'today.neighbours.yesterday');
      W.cardName(n); neutral(W.yesterday(n.yesterday), 'yesterday'); W.choiceLegend(n); W.wayHere(n.situationTitle);
      W.who(n.name, n.kin, true); W.who(n.name, n.kin, false); W.house(n.name); W.House(n.name);
      var tallies = n.changedDay !== null ? n.seenSince : n.seen;
      if (n.changedDay !== null) W.knowChanged(n.changedDay);
      if (tallies.length !== 5) throw new Error('seen is not five long');
      for (s = 0; s < 5; s++) {
        needAll(tallies[s], ['h', 'n'], 'seen[' + s + ']');
        W.knowLabel(s); W.knowValue(tallies[s].h, tallies[s].n);
      }
      // the ring on the map: how many of this house's habits came from the reader
      var src = need(life.houses[n.id], 'source', 'life.houses'), arcs = 0;
      for (s = 0; s < 5; s++) if (need(src[s], 'type', 'life.houses.source') === 'you') arcs++;
      need(life.houses[n.id], 'name', 'life.houses');
      // and the diamond: the house runs your ways as a whole (the label the Afterwards opens with)
      var wayNow = need(life.houses[n.id], 'way', 'life.houses');
      isNum(wayNow, 'life.houses.way');
      if ((wayNow === 0 || wayNow === kinId) && (n.id !== kinId || arcs > 0) && arcs === 0) stats.keepsNoArc++;
      choices[n.id] = !!policy(n, d, seed);
      left--; W.closeDay(left);
      W.mapAltDay(t.day, 'choose', mapItems(t, followNow, keepsNow, choices, null));   // the map as each choice is made
    }

    // close the day
    var r = A.playDay(life, choices);
    var tAfter = A.today(life);                       // app.js: what was seen today goes into the cards' tallies at the reveal
    if (tAfter.neighbours.length !== 4) throw new Error('today() after the day closed is not four long');
    W.mapAltDay(t.day, 'revealed', mapItems(t, followNow, keepsNow, {}, r.results));
    w = A.ways(life);
    needAll(r, ['day', 'gained', 'purse', 'need', 'over', 'results', 'kinWith', 'lookingRound'], 'playDay');
    if (r.results.length !== 4) throw new Error('playDay().results is not four long');
    W.dayTotal(r.gained, r.purse, r.need); W.signed(r.gained); W.num(r.purse);
    for (i = 0; i < 4; i++) {
      var x = r.results[i];
      needAll(x, ['id', 'name', 'kin', 'situation', 'intended', 'lost', 'arrived', 'they', 'payoff',
                  'why.situation', 'why.source.type', 'why.source.from', 'why.source.fromName', 'why.source.far',
                  'why.source.deeds', 'why.source.digest', 'why.seen', 'why.againstHabit'], 'results');
      if (x.id !== t.neighbours[i].id) throw new Error('results are not in the order of the cards');
      var rv = W.reveal(x);
      neutral(rv.text, 'reveal');
      if (!x.arrived && !x.they && !x.lost) stats.noHand++;
      // "What you know of them" once the day is closed: the morning's tallies plus what the
      // whole-Life tally gained today (app.js knowNodes). A count, never negative, never h above n;
      // for a house that has not changed a way it is today()'s own tally.
      var nbA = tAfter.neighbours[i], nbB = t.neighbours[i], baseT = nbB.changedDay !== null ? nbB.seenSince : nbB.seen, gained = 0;
      if (nbA.id !== nbB.id) throw new Error('today() after the day lists the neighbours in another order');
      for (s = 0; s < 5; s++) {
        needAll(nbA.seen[s], ['h', 'n'], 'today(after).seen[' + s + ']');
        var th = baseT[s].h + nbA.seen[s].h - nbB.seen[s].h, tn = baseT[s].n + nbA.seen[s].n - nbB.seen[s].n;
        if (!(th >= 0 && tn >= th && tn >= baseT[s].n)) throw new Error('tallies after the reveal are not counts: ' + th + ' of ' + tn);
        if (nbB.changedDay === null && (th !== nbA.seen[s].h || tn !== nbA.seen[s].n)) throw new Error('tallies after the reveal differ from today()');
        gained += tn - baseT[s].n;
        W.knowValue(th, tn);
      }
      if (gained < 1) throw new Error('a day was closed and nothing new is known of the ' + nbB.name + ' house');
      // every Why? is turned over. For a house that changed a way the back counts since that
      // change, from the same tally as the row the front marks for today.
      var nb = t.neighbours[i], since = null;
      if (MIRROR[nb.situation] !== x.why.situation) throw new Error('the row marked for today is not the situation on the back of the card');
      if (nb.changedDay !== null) {
        since = { changedDay: nb.changedDay, seen: need(nb.seenSince, String(x.why.situation), 'today.neighbours.seenSince') };
        needAll(since.seen, ['h', 'n'], 'seenSince[why.situation]');
      }
      var card = W.why(x, kinId, since);
      if (since && x.why.source.type === 'own') {
        stats.ownSince[Math.min(2, since.seen.n)]++;
        var front = W.knowValue(since.seen.h, since.seen.n), tail = card.lines[card.lines.length - 1].text;
        if (tail.indexOf('at the end of day ' + nb.changedDay + '.') < 0) throw new Error('a changed house\'s card does not say since when it counts: ' + tail);
        if (since.seen.n > 1 && tail.indexOf(since.seen.h + ' of ' + since.seen.n + ' times') < 0) throw new Error('front "' + front + '" and back "' + tail + '" count differently');
      }
      if (!card.lines.length) throw new Error('empty Why? card');
      card.lines.forEach(function (ln) {
        if (['lead', 'count', 'deed', 'more', 'even', 'plain'].indexOf(ln.kind) < 0) throw new Error('unknown Why? line kind: ' + ln.kind);
        if (ln.kind === 'deed' && typeof ln.sent !== 'boolean') throw new Error('a deed line without its mark');
      });
      stats['why' + x.why.source.type.charAt(0).toUpperCase() + x.why.source.type.slice(1)]++;
      if (x.lost) stats.lost++;
      if (x.why.source.type === 'you') {
        needAll(x.why.source.digest, ['n', 'sent', 'stayed', 'latest', 'dissent'], 'why.source.digest');
        youSeen = true;
      } else if (x.why.source.type === 'own') needAll(x.why.seen, ['h', 'n'], 'why.seen');
    }
    for (i = 0; i < r.kinWith.length; i++) {
      var e = r.kinWith[i];
      needAll(e, ['id', 'name', 'kinSent', 'theySent', 'why.situation', 'why.source.type'], 'kinWith');
      neutral(W.elsewhere(e), 'elsewhere');
      if (e.why.source.type === 'you') { W.whyThird(e, life.houses[kinId].name, kinId); stats.third++; youSeen = true; }
    }
    for (s = 0; s < 5; s++) W.wayCount(w[s].h, w[s].n);
    var lr = r.lookingRound;
    if ((d % 4 === 0) !== !!lr) throw new Error('lookingRound present on the wrong day');
    W.nextDay(lr ? 'season' : 'day');
    if (lr) {
      needAll(lr, ['season', 'kin.id', 'kin.name', 'kin.changed', 'kin.habits', 'reconsidered'], 'lookingRound');
      for (i = 0; i < lr.kin.habits.length; i++) needAll(lr.kin.habits[i], ['situation', 'before', 'after', 'source', 'h', 'n'], 'lookingRound.kin.habits');
      for (i = 0; i < lr.reconsidered.length; i++) {
        needAll(lr.reconsidered[i], ['house', 'name', 'model', 'modelName', 'adopted', 'took', 'visible', 'modelVisible', 'changed'], 'lookingRound.reconsidered');
      }
      // the map now shows what was taken up: a house that keeps your ways at second hand is told so
      var keepsAfter = keepsOf(life), followAfter = followOf(life);
      var se = W.seasonEnd(lr, kinId, titles, keepsAfter);
      if (!se.kin) throw new Error("season's end without the kin line");
      se.changes.forEach(function (line) { if (/: they /.test(line)) throw new Error('a pronoun that reads two ways: ' + line); });
      lr.reconsidered.forEach(function (e2) {
        if (!e2.visible || !(e2.adopted && e2.took > 0) || e2.model === 0 || !keepsAfter[e2.house]) return;
        stats.secondHand++;
        if (!se.houses.some(function (line) { return /had from you\.$/.test(line); })) throw new Error('a house took up your ways at second hand and was not told so');
      });
      W.mapAltDay(t.day, 'season', mapItems(t, followAfter, keepsAfter, {}, null));
      W.kinFollows(0);
      stats.seasonEnds++;
      W.nextDay(d === 12 ? 'leave' : 'day');
    }
    if (r.over !== (d === 12)) throw new Error('playDay().over is wrong on day ' + d);
  }

  // leaving
  where = 'valley ' + seed + ', "' + policyName + '", leaving';
  var lg = A.legacy(life), wf = A.ways(life), tf = A.today(life);
  needAll(lg, ['hollow', 'heir', 'h', 'n', 'kin.fromYou', 'kin.name'], 'legacy');
  W.leavingHead(); W.leavingStore(tf.purse, tf.need); W.leaveHead(); W.leaveSub(); W.leaveButton();
  var fromYou = 0;
  for (s = 0; s < 5; s++) {
    need(lg.hollow, String(s), 'legacy.hollow'); need(lg.heir, String(s), 'legacy.heir'); need(lg.kin.fromYou, String(s), 'legacy.kin.fromYou');
    isNum(lg.heir[s], 'legacy.heir');
    W.leaveNote(wf[s].h, wf[s].n, lg.hollow[s], lg.heir[s]);
    if (lg.kin.fromYou[s]) fromYou++;
  }
  W.kinFollows(fromYou);

  // the Afterwards: one watched future, and the verdict in slices
  where = 'valley ' + seed + ', "' + policyName + '", afterwards';
  var f = A.runFuture(life, 0);
  var job = A.verdictJob(life, verdictOptions);
  needAll(job, ['futures', 'futuresDone', 'done', 'progress'], 'job');
  needAll(f, ['holds', 'level', 'arrival', 'yourWaysLastSeason', 'yourWaysAtEnd', 'seasons', 'finalWay', 'lateFlow'], 'future');
  isNum(f.lateFlow, 'lateFlow');
  if (f.arrival) needAll(f.arrival, ['season', 'house', 'replaced', 'name'], 'future.arrival');
  if (f.seasons.length !== 30) throw new Error('the future is not thirty seasons long');
  W.afterHead(); W.oneFuture(job.futures); W.tickerHead(); needAll(W.flowLabels(), ['head', 'half', 'late', 'rule'], 'flowLabels'); W.skip(); W.seeCount();
  var flowSaid = W.flowAlt(f);                        // the strip in words, set when the future has played
  if (!/Season 1: \d+ in 100\. Lowest: \d+ in 100, in season \d+\. Last ten seasons: \d+ in 100/.test(flowSaid)) throw new Error('the strip in words lost a number: ' + flowSaid);
  var all = W.futureLines(f, kinId);
  // a house that returns from your ways to the way it began with "goes back to its own"
  all.forEach(function (l) {
    if (/gives up your ways for the \w+ way again/.test(l.text)) throw new Error('a house going back to its own way is told as taking it "again": ' + l.text);
    if (/gives up your ways and goes back to its own\.$/.test(l.text)) {
      stats.wentBack++;
      if (!l.yours) throw new Error('a line about your ways is not marked as yours: ' + l.text);
    }
  });
  for (i = 0; i < 30; i++) {
    var S = f.seasons[i];
    needAll(S, ['season', 'flow', 'houses', 'events'], 'future.seasons');
    isNum(S.flow, 'flow');
    if (S.flow < 0 || S.flow > 1.05) throw new Error('flow outside the strip: ' + S.flow);
    if (S.houses.length !== 8) throw new Error('a season does not list eight houses');
    for (s = 0; s < 8; s++) {
      needAll(S.houses[s], ['id', 'name', 'helpRate', 'income', 'purse', 'way'], 'future.seasons.houses');
      isNum(S.houses[s].helpRate, 'helpRate'); isNum(S.houses[s].income, 'income');
      if (S.houses[s].helpRate < 0 || S.houses[s].helpRate > 1) throw new Error('helpRate outside 0..1: the field would overfill');
      W.house(S.houses[s].name); W.num(S.houses[s].income);        // the number lettered on each holding
    }
    for (s = 0; s < S.events.length; s++) need(S.events[s], 'type', 'future.seasons.events');
    W.seasonCount(S.season);
  }
  // the resting map marks houses by finalWay; the closing line counts yourWaysAtEnd: they must agree
  var atEnd = 0, atThirty = 0;
  for (i = 0; i < 8; i++) {
    if (need(f.finalWay, String(i), 'future.finalWay') === 0 || f.finalWay[i] === kinId) atEnd++;
    if (f.seasons[29].houses[i].way === 0 || f.seasons[29].houses[i].way === kinId) atThirty++;
  }
  if (atEnd !== f.yourWaysAtEnd) throw new Error('the resting map would mark ' + atEnd + ' houses, the closing line counts ' + f.yourWaysAtEnd);
  // the resting map in words (app.js drawHousesAtEnd): eight lines, and as many "keeps your ways" as the closing line counts
  var saidKeep = 0;
  for (i = 0; i < 8; i++) {
    var hEnd = f.seasons[29].houses[i], newEnd = !!(f.arrival && f.arrival.house === i), handsEnd = Math.round(hEnd.helpRate * 16);
    if (Math.abs(handsEnd - hEnd.helpRate * 16) > 1e-6) throw new Error('helpRate is not a count of sixteen hands: ' + hEnd.helpRate);
    var whoEnd = i === 0 ? W.heir(true) : i === kinId && !newEnd ? W.kin(true) : W.House(hEnd.name);
    var lineEnd = W.houseAtEnd(whoEnd, hEnd.income, handsEnd, f.finalWay[i] === 0 || f.finalWay[i] === kinId, newEnd);
    if (/keeps your ways/.test(lineEnd)) saidKeep++;
  }
  if (saidKeep !== f.yourWaysAtEnd) throw new Error('the map in words and the closing line count your ways differently');
  if (atEnd !== atThirty) stats.lastFrameMoved++;
  // the Leaving sheet's diamonds are the houses the Afterwards opens as keeping your ways
  for (i = 0; i < 4; i++) {
    var hid = life.neighbours[i], hh = life.houses[hid], w1 = f.seasons[0].houses[hid].way;
    var fromYouNow = hh.source.some(function (q) { return q.type === 'you'; });
    var keeps = (hh.way === 0 || hh.way === kinId) && (hid !== kinId || fromYouNow);
    if (keeps !== (w1 === 0 || w1 === kinId)) throw new Error('the Leaving sheet and season 1 mark the ' + hh.name + ' holding differently');
  }
  var endLine = W.futureEnd(f), waysLine = W.waysEnd(f);
  if (f.holds) stats.held++;

  var guard = 0, sawHeadline = false;
  W.counting(job.futuresDone, job.futures);
  while (!A.verdictStep(job, 200)) {
    if (++guard > 100000) throw new Error('verdict job does not finish');
    if (guard % 25 === 0) W.counting(job.futuresDone, job.futures);
    if (job.headline) sawHeadline = true;
  }
  if (!job.done || !job.result) throw new Error('verdict job finished without a result');
  var v = job.result;

  // the Chronicle
  where = 'valley ' + seed + ', "' + policyName + '", chronicle';
  needAll(v, ['futures', 'holds', 'holdsPct', 'held', 'baselinePct', 'mark', 'markSE', 'baseline.holds', 'baseline.held',
              'purse', 'need', 'houseKept', 'whatIfFutures', 'whatIfBaseHolds', 'range.bestPct', 'range.worstPct',
              'range.scaleLow', 'range.scaleHigh', 'range.yourPct', 'range.inside', 'whatIfs', 'lastDay', 'seal.earned', 'mattered'], 'verdict');
  if (v.held.length < 200 || v.baseline.held.length < 200) throw new Error('fewer than 200 futures to draw');
  for (i = 0; i < 200; i++) if (typeof v.held[i] !== 'boolean' || typeof v.baseline.held[i] !== 'boolean') throw new Error('held[] is not boolean');
  if (!(v.range.scaleLow <= Math.min(v.holdsPct, v.baselinePct, v.range.worstPct) &&
        v.range.scaleHigh >= Math.max(v.holdsPct, v.baselinePct, v.range.bestPct))) throw new Error('the scale does not hold its markers');
  if (v.whatIfs.length !== 10) throw new Error('whatIfs is not ten long');
  var H = W.heads(), rl = W.rowLabels();
  out.push(W.chronicleHead() + ' (valley ' + seed + ', ' + policyName + ')');
  out.push('  ' + H.house + ': ' + W.houseLine(v));
  out.push('  ' + H.valley + ': ' + W.valleyLine(v));
  W.rowsExplain(v).forEach(function (line) { out.push('    ' + line); });      // what a future and "held" are, before the mark that rests on them
  out.push('    ' + W.markLine(v) + '  [' + W.markNumber(v) + ']');
  // the mark is explained from the two counts just given: the gap it names is their difference
  var means = W.markMeans(v), gap = v.holds - v.baseline.holds;
  if (gap === 0) { stats.markSame++; if (means !== 'The two counts are the same.') throw new Error('equal counts, and the mark is explained otherwise: ' + means); }
  else if (means.indexOf(': ' + Math.abs(gap) + (gap > 0 ? ' more ' : ' fewer ')) < 0) throw new Error('the mark is not explained by the gap of ' + gap + ': ' + means);
  out.push('    ' + means);
  var noise = W.markNoise(v);
  if (v.markSE === 0 && Math.round(v.mark) === 0 && /would move/.test(noise)) throw new Error('a margin given where every future is the same: ' + noise);
  out.push('    ' + noise);
  // each row of marks in words: its name and how many of the first 200 held
  var heldYou = 0, heldOld = 0;
  for (i = 0; i < 200; i++) { if (v.held[i]) heldYou++; if (v.baseline.held[i]) heldOld++; }
  out.push('    ' + W.rowAlt(rl.you, heldYou, 200) + ' ' + W.rowAlt(rl.old, heldOld, 200) + ' ' + W.rowsCaption(v));
  var rng = W.rangeLabels(v);
  var rline = W.rangeLine(v), rnote = W.rangeNote(v);
  if (rline.indexOf('of the first ' + v.whatIfFutures + ' futures') < 0) throw new Error('the thirteen ways are not said to be counted on the first ' + v.whatIfFutures);
  if (/yours holds in/.test(rnote)) stats.rangeSaid++;
  if (v.range.inside && (v.holdsPct < v.range.worstPct || v.holdsPct > v.range.bestPct) && !/yours holds in/.test(rnote)) throw new Error('"You" is drawn outside the thirteen with no word that it lies inside on their futures');
  out.push('  ' + H.range + ': ' + rline);
  out.push('    ' + rnote);
  out.push('    [' + rng.you + '] [' + rng.old + '] [' + rng.worst + '] [' + rng.best + '] ' + rng.axis);
  if (v.lastDay) {
    needAll(v.lastDay, ['changed', 'holds', 'futures', 'purse'], 'verdict.lastDay');
    var ldLine = W.lastDayLine(v, kinId);
    if (ldLine.indexOf(v.lastDay.holds + ' of the first ' + v.lastDay.futures + ' futures, against ' + v.whatIfBaseHolds + ' of those') < 0) throw new Error('the last day is not counted against the same futures in words: ' + ldLine);
    out.push('  ' + H.lastDay + ': ' + ldLine);
    stats.lastDay++;
  }
  if (v.seal.earned) { out.push('  SEAL: ' + W.seal()); stats.sealed++; } else W.seal();
  if (v.mattered && v.mattered.kind === 'habit') {
    needAll(v.mattered, ['situation', 'h', 'n'], 'verdict.mattered');
    need(v.whatIfs[2 * v.mattered.situation], 'holds', 'whatIfs'); need(v.whatIfs[2 * v.mattered.situation + 1], 'holds', 'whatIfs');
    stats.matteredHabit++;
  } else if (v.mattered) stats.matteredLast++; else stats.matteredNone++;
  var mLine = W.mattered(v, titles);
  if (/One fewer|One more hand/.test(mLine)) throw new Error('the what-ifs are one more precedent each way, not one fewer: ' + mLine);
  if (v.mattered && v.mattered.kind === 'habit') {
    var mh = v.mattered.h, mn = v.mattered.n;
    if (mLine.indexOf('of the first ' + v.whatIfFutures + ' futures') < 0) throw new Error('"mattered" does not say which futures it counts: ' + mLine);
    if ((mh === 0) === /stayed home there once more/.test(mLine)) throw new Error('"stayed home once more" must be left out exactly where the reader never sent a hand: ' + mLine);
    if ((mh === mn) === /sent a hand there once more/.test(mLine)) throw new Error('"sent a hand once more" must be left out exactly where the reader always sent one: ' + mLine);
    if (mh === 0 || mh === mn) stats.matteredOneSided++;
  }
  out.push('  ' + H.mattered + ': ' + mLine);
  out.push('  ' + H.became + ' (' + H.becameSub + '):');
  W.became(f, kinId).forEach(function (line) { out.push('    ' + line); });
  out.push('    ' + endLine);
  out.push('  ' + W.valleyNo(seed) + '   [' + W.again() + '] [' + W.againSame() + ']');
  var entry = { seed: seed, kept: v.houseKept, purse: v.purse, need: v.need, mark: v.mark, seal: !!v.seal.earned };
  out.push('  ' + W.pastHead() + ': ' + W.pastLife(entry));
  if (v.houseKept) stats.kept++;
  stats.lives++;

  // a Life must be rebuildable from its seed and its choices: app.js relies on it after a reload
  return { chronicle: out, ticker: all.map(function (l) { return l.text; }), end: [endLine, waysLine], sawHeadline: sawHeadline, life: life };
}

// ---- run ------------------------------------------------------------------------------------

var SEEDS = [];
for (var q = 1; q <= 22; q++) SEEDS.push(q);
SEEDS.push(48213); SEEDS.push('valley-7'); SEEDS.push(4294967295);
SEEDS.push(167);                                             // where a house was seen to go back to its own way from yours
var samples = [], livesByPolicy = {};

SEEDS.forEach(function (seed, si) {
  Object.keys(POLICIES).forEach(function (name, pi) {
    var extra = REQUIRED.indexOf(name) < 0;
    if (extra && si % 3 !== 0) return;                       // the extra ways on every third valley
    var full = si < 3 && !extra;                             // the page's own counts (2000 futures) on nine Lives
    var res = liveOne(seed, name, full ? undefined : { futures: 400, whatIfFutures: 200 });
    livesByPolicy[name] = (livesByPolicy[name] || 0) + 1;
    if (full && !res.sawHeadline) throw new Error('job.headline never appeared during a full count');
    if ((si === 0 && pi < 3) || (si === 3 && pi === 3) || (si === 6 && pi === 6)) samples.push(res);
  });
});

// rebuilding a Life from its seed and its list of choices gives the same Life (what a reload does)
(function () {
  where = 'rebuild check';
  var a = A.createLife(48213), list = [], d, i;
  for (d = 1; d <= 12; d++) {
    var t = A.today(a), c = [];
    for (i = 0; i < 4; i++) c.push(POLICIES.mixed(t.neighbours[i], d, 48213));
    list.push(c); A.playDay(a, c);
  }
  var b = A.createLife(a.seed), last = null;
  for (d = 0; d < list.length; d++) last = A.playDay(b, list[d]);
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('a Life rebuilt from seed and choices differs');
  if (!last.over) throw new Error('the rebuilt Life is not over');
})();

// the hooks of the brief (section 2) and the shape of index.html (sections 1 and 5)
var hooks = 0;
(function () {
  where = 'index.html and app.js';
  var html = readFile('index.html'), app = readFile('app.js');
  function has(text, bit, what) { if (text.indexOf(bit) < 0) throw new Error('missing ' + what + ': ' + bit); hooks++; }
  if (html.indexOf('<title>After You</title>') !== 0) throw new Error('index.html does not start with its title');
  has(html, '<meta name="claude:viewport-fit-sides" content="cover">', 'viewport promise');
  if (/<!DOCTYPE|<html[\s>]|<head[\s>]|<body[\s>]/i.test(html)) throw new Error('index.html carries document tags the host adds itself');
  if (!/<script src="engine\.js"><\/script><script src="words\.js"><\/script><script src="app\.js"><\/script>\s*$/.test(html)) throw new Error('index.html does not end with the three scripts');
  if ((html.match(/<link /g) || []).length !== 1 || html.indexOf('https://fonts.googleapis.com/css2?') < 0 || html.indexOf('&display=swap') < 0) throw new Error('fonts: one Google Fonts link expected');
  if (/https?:\/\/(?!fonts\.googleapis\.com)/.test(html + app)) throw new Error('an address other than the font host (a namespace name counts)');
  ['opening', 'day', 'leaving', 'afterwards', 'chronicle'].forEach(function (v) { has(html, 'data-view="' + v + '"', 'view'); });
  if ((html.match(/data-view="[a-z]+"[^>]* hidden>/g) || []).length !== 4) throw new Error('exactly one view must start visible');
  ['begin', 'close-day', 'next-day', 'leave', 'skip', 'to-chronicle', 'again', 'again-same'].forEach(function (id) {
    if (!new RegExp('<button[^>]* id="' + id + '"').test(html)) throw new Error('missing button #' + id);
    hooks++;
  });
  has(app, "'data-house': String(id)", 'card hook');
  has(app, "name: 'choice-' + n.id", 'radio group name');
  has(app, "value === 'send'", 'radio values'); has(app, "optionNode(n, 'stay'", 'radio values');
  has(app, "'data-why': String(id)", 'Why? hook');
  has(app, "'data-why-kin': String(e.id)", 'the hook of the Why? under Elsewhere today (its own, so that data-why names a card)');
  if (/'data-why': *key/.test(app)) throw new Error('a data-why value that is not a house id');
  has(html, '<details class="key" id="map-day-key"', 'the folding map key');
  has(app, 'now() - state.phaseAt < SETTLE_MS', 'the pause before Next day takes a click');
  has(app, 'now() - state.viewAt < SETTLE_MS', 'the pause before a new view takes a click');
  // one line decides both: below it the style sheet keeps the day compact, above it app.js opens "What you know of them"
  has(html, '@media (min-width: 62rem) and (max-height: 65.99rem)', 'the compact day of a laptop of ordinary height');
  has(app, "media('(min-width: 40rem) and (min-height: 66rem)')", 'the same line in app.js');
  has(app, 'window.AYApp = { state: state }', 'state hook');
  has(app, '#valley-', 'valley hash');
  has(app, 'after-you.lives.v1', 'storage key');
  has(html, 'aria-live="polite"', 'live region');
  // the Afterwards: one quiet region that is never hidden; the list of events and the counting line are not live
  has(html, '<p class="vh" id="after-say" aria-live="polite"></p>', 'the one live line of the Afterwards');
  if ((html.match(/aria-live=/g) || []).length !== 2) throw new Error('live regions: the day\'s status and the Afterwards\' one line, no others');
  if (/role="log"/.test(html)) throw new Error('the ticker must not be a live log');
  has(html, '<main class="sheet" id="app">', 'main landmark');
  // every id app.js asks for by name is in the page, or is made by app.js itself
  var asked = {}, m2, reIds = /(?:\$|setText)\('([a-z0-9-]+)'[,)]/g;      // a whole name, not the stem of a made-up one
  while ((m2 = reIds.exec(app))) asked[m2[1]] = true;
  Object.keys(asked).forEach(function (id) {
    if (html.indexOf('id="' + id + '"') < 0 && app.indexOf("id: '" + id + "'") < 0) throw new Error('app.js asks for #' + id + ', which is nowhere in the page');
    hooks++;
  });
  // copy that stands in the page at rest is the copy in words.js
  [W.fordNote(), W.waysNote(), W.leaveSub(), W.flowLabels().rule, W.mapHint(), W.mapFold(false), W.whyMarked()].forEach(function (line) {
    has(html, '>' + line + '<', 'copy at rest');
  });
  // an unchosen option carries no mark; the chosen one is shown by the style sheet
  if (/class: 'glyph/.test(app) || /\.glyph\b/.test(html)) throw new Error('the radio-like dot is back on the options');
  has(html, '.opt input:checked + .opt-face .opt-check { display: block; }', 'the check on the chosen option only');
  has(app, "'data-bearing': W.bearingShort(i).toLowerCase()", 'where a card lies when the four are two by two');
  // two by two the cards stand in the page row by row, as they lie: north-west, north-east, west, east
  var rowOrder = [2, 1, 3, 0].map(function (k) { return W.bearingShort(k); }).join(' ');
  if (rowOrder !== 'NW NE W E') throw new Error('the cards\' order by row no longer matches their bearings: ' + rowOrder);
  has(app, 'var CARDS_BY_ROW = [2, 1, 3, 0];', 'the order of the cards in the page when they lie two by two');
  has(app, 'orderCards();', 'the cards put in order again when the window crosses the two-by-two line');
  has(app, 'onMedia(mqTwo, function () {', 'the day\'s button placed again when the window crosses the two-column line');
  // an unturned card is as tall as its face: the back lies over it until it is asked for
  has(html, '.card-back { position: absolute; inset: 0; overflow: hidden;', 'the back of a card out of the flow until it is turned');
  has(html, '.card.is-flipped .card-back { position: static; overflow: visible;', 'the back of a turned card in the flow');
  has(html, '.card-inner { position: relative;', 'the box the back of a card is laid over');
  // the Why? under "Elsewhere today" is named by its own word and its sentence
  has(app, "id: 'why-kin-' + e.id, 'aria-labelledby': 'why-kin-' + e.id + ' else-line-' + e.id", 'the name of the Why? under Elsewhere today');
  has(app, "id: 'else-line-' + e.id", 'the sentence that names it');
  // the strip of hands arriving heads the second column of the Afterwards, above the list of events
  var atRight = html.indexOf('<div class="after-right">'), atStrip = html.indexOf('id="flow-strip"'), atTicker = html.indexOf('id="h-ticker"');
  if (!(atRight > 0 && atRight < atStrip && atStrip < atTicker)) throw new Error('the strip is not at the head of the second column of the Afterwards');
  hooks++;
  // the Opening keeps its list of earlier lives short
  has(html, '<details id="opening-past-more" hidden>', 'the older lives, behind their count');
  has(app, 'var PAST_SHOWN = 3;', 'how many earlier lives the Opening lists');
  // once the future has ended the count is finished in a few large slices, and straight through where the page is not in front
  has(app, 'budget = over ? (away ? Infinity : 800) : (away ? 250 : 25);', 'the slices of the count');
  if (/\btitle: W\./.test(app)) throw new Error('words that only a pointer can reach (a title attribute)');
  has(html, 'padding-left: max(16px, env(safe-area-inset-left, 0px))', 'side gutter'); has(html, 'padding-right: max(16px, env(safe-area-inset-right, 0px))', 'side gutter');
  has(html, '@media (prefers-color-scheme: dark)', 'dark theme'); has(html, ':root:not([data-theme="light"])', 'dark theme guard'); has(html, ':root[data-theme="dark"]', 'dark theme toggle');
  has(html, '[hidden] { display: none !important; }', 'hidden rule'); has(html, '@media (prefers-reduced-motion: reduce)', 'reduced motion');
  if (/\b(alert|confirm|prompt)\s*\(|window\.print|<form|requestAnimationFrame/.test(app + html)) throw new Error('a call or tag the host forbids');
  // the opening is complete at rest: its static copy is the copy in words.js
  var op = W.opening();
  [op.title, op.premise, op.begin].concat(op.lines).forEach(function (line) { has(html, '>' + line + '<', 'opening copy at rest'); });
  // every colour is a token: no literal colour after the token blocks
  var css = html.slice(html.indexOf('*, *::before'), html.indexOf('</style>'));
  if (/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(css)) throw new Error('a literal colour in a component rule');
})();

// every function of AYWords was called with real data
var missed = NAMES.filter(function (n) { return !called[n]; });
if (missed.length) throw new Error('AYWords functions never called: ' + missed.join(', '));
REQUIRED.forEach(function (name) {
  if ((livesByPolicy[name] || 0) < 20) throw new Error('fewer than 20 valleys for "' + name + '"');
});
if (!stats.whyYou && !stats.third) throw new Error('no Why? card ever quoted the reader');
if (!stats.ownSince[0] || !stats.ownSince[1] || !stats.ownSince[2]) throw new Error('a wording of "what you knew since they changed a way" was never reached: ' + stats.ownSince.join(', '));
if (!stats.sealed) throw new Error('no Life earned the seal: its line was never shown as earned');
if (!stats.lastDay || !stats.matteredHabit || !stats.matteredLast || !stats.matteredNone) throw new Error('a branch of the Chronicle was never reached');
if (!stats.noHand) throw new Error('no reveal in which no hand went either way: its wording was never checked');
if (!stats.markSame) throw new Error('no Chronicle with two equal counts: "The two counts are the same." was never shown');
if (!stats.secondHand) throw new Error("no house took up your ways at second hand: that season's-end line was never shown");
if (!stats.matteredOneSided || !stats.rangeSaid) throw new Error('a wording of the Chronicle was never reached (one-sided "mattered", or "yours holds in")');
if (!stats.wentBack) throw new Error('no watched future had a house give up your ways and go back to its own: that line was never shown');

print('Sample Chronicles');
print('=================');
samples.slice(0, 5).forEach(function (res) {
  print('');
  res.chronicle.forEach(function (line) { print(line); });
  print('  -- the watched future, as the ticker told it --');
  res.ticker.forEach(function (line) { print('    ' + line); });
  res.end.forEach(function (line) { print('    ' + line); });
});

var secs = preciseTime() - T0;
print('');
print('Lives played: ' + stats.lives + ' (' + Object.keys(livesByPolicy).map(function (k) { return livesByPolicy[k] + ' x ' + k; }).join('; ') + ')');
print('Why? cards turned: from you ' + stats.whyYou + ', own ' + stats.whyOwn + ', another house ' + stats.whyHouse +
      ', never seen ' + stats.whyBlank + '; sister toward others, from you ' + stats.third + '; hands turned back ' + stats.lost);
print("Season's ends: " + stats.seasonEnds + '; houses kept ' + stats.kept + '; seals ' + stats.sealed + '; last-day lines ' + stats.lastDay +
      '; mattered: habit ' + stats.matteredHabit + ', last day ' + stats.matteredLast + ', none ' + stats.matteredNone +
      '; watched futures held ' + stats.held);
print('Own-way cards on a house that had changed a way: not seen since ' + stats.ownSince[0] + ', seen once ' + stats.ownSince[1] +
      ', seen more ' + stats.ownSince[2] + '; neighbour-days marked as keeping your ways with no arc ' + stats.keepsNoArc +
      '; resting maps that differ from season 30 ' + stats.lastFrameMoved);
print('Reveals with no hand either way: ' + stats.noHand + "; season's-end lines for your ways taken at second hand: " + stats.secondHand +
      '; Chronicles with equal counts ' + stats.markSame + ', with "yours holds in" under the scale ' + stats.rangeSaid +
      ', with a one-sided "mattered" line ' + stats.matteredOneSided +
      '; lines for a house that goes back to its own way from yours ' + stats.wentBack);
print('AYWords functions exercised: ' + NAMES.length + ' of ' + NAMES.length);
print('Engine fields read: ' + fieldsRead + '; page hooks found: ' + hooks);
print('Sentences checked: ' + sentences);
print('Time: ' + secs.toFixed(1) + ' s');
if (secs > 60) throw new Error('page-smoke.js took longer than 60 seconds');
print('PAGE SMOKE: PASS');
