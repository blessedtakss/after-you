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
              lastFrameMoved: 0 };   // watched futures whose resting map differs from season 30's frame
var MIRROR = [0, 1, 3, 2, 4];        // my situation on a tie -> theirs (as in app.js)

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
  if (op.lines.length !== 3) throw new Error('the opening has three lines of stakes');
  W.pastHead(); W.valleyNo(seed); W.mapLabels(); W.mapAlt('sheet'); W.mapAlt('day'); W.mapAlt('after');
  W.signed(-1); W.signed(3); W.num(21);          // the stakes on the opening sheet, the sample number in the key
  W.legendHead(); W.legendDay(); W.legendAfter(); W.legendMarks(); W.legendWays(); W.mapHint();
  W.heir(true); W.heir(false); W.kin(true); W.kin(false);
  for (i = 0; i < 4; i++) { W.bearing(i); W.bearingShort(i); }
  W.send(); W.stay(); W.chooseLine(); W.knowHead(); W.knowFoot(); W.whyLabel(); W.whyBack(); W.whyHeads();
  W.elsewhereHead(); W.waysHead(); W.fordNote(); W.storeHead();

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
    W.closeDay(left);
    for (i = 0; i < 4; i++) {
      var n = t.neighbours[i];
      needAll(n, ['id', 'name', 'kin', 'situation', 'situationTitle', 'yesterday', 'seen', 'seenSince', 'changedDay'], 'today.neighbours');
      if (n.yesterday) needAll(n.yesterday, ['intended', 'lost', 'arrived', 'they', 'payoff'], 'today.neighbours.yesterday');
      W.cardName(n); W.yesterday(n.yesterday); W.choiceLegend(n); W.wayHere(n.situationTitle);
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
    }

    // close the day
    var r = A.playDay(life, choices);
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
      W.reveal(x);
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
      W.elsewhere(e);
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
      var se = W.seasonEnd(lr, kinId, titles);
      if (!se.kin) throw new Error("season's end without the kin line");
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
  W.leavingHead(); W.leavingStore(tf.purse, tf.need); W.leaveHead(); W.leaveButton();
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
  needAll(f, ['holds', 'level', 'arrival', 'yourWaysLastSeason', 'yourWaysAtEnd', 'seasons', 'finalWay'], 'future');
  if (f.arrival) needAll(f.arrival, ['season', 'house', 'replaced', 'name'], 'future.arrival');
  if (f.seasons.length !== 30) throw new Error('the future is not thirty seasons long');
  W.afterHead(); W.oneFuture(job.futures); W.tickerHead(); W.flowLabels(); W.skip(); W.seeCount();
  var all = W.futureLines(f, kinId);
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
              'range.scaleLow', 'range.scaleHigh', 'whatIfs', 'lastDay', 'seal.earned', 'mattered'], 'verdict');
  if (v.held.length < 200 || v.baseline.held.length < 200) throw new Error('fewer than 200 futures to draw');
  for (i = 0; i < 200; i++) if (typeof v.held[i] !== 'boolean' || typeof v.baseline.held[i] !== 'boolean') throw new Error('held[] is not boolean');
  if (!(v.range.scaleLow <= Math.min(v.holdsPct, v.baselinePct, v.range.worstPct) &&
        v.range.scaleHigh >= Math.max(v.holdsPct, v.baselinePct, v.range.bestPct))) throw new Error('the scale does not hold its markers');
  if (v.whatIfs.length !== 10) throw new Error('whatIfs is not ten long');
  var H = W.heads(), rl = W.rowLabels();
  out.push(W.chronicleHead() + ' (valley ' + seed + ', ' + policyName + ')');
  out.push('  ' + H.house + ': ' + W.houseLine(v));
  out.push('  ' + H.valley + ': ' + W.valleyLine(v));
  out.push('    ' + W.markLine(v) + '  [' + W.markNumber(v) + ']');
  out.push('    ' + W.markNoise(v));
  out.push('    ' + rl.you + ' / ' + rl.old + ': ' + W.rowsCaption(v));
  W.rowsExplain(v).forEach(function (line) { out.push('    ' + line); });
  var rng = W.rangeLabels(v);
  out.push('  ' + H.range + ': ' + W.rangeLine(v));
  out.push('    [' + rng.you + '] [' + rng.old + '] [' + rng.worst + '] [' + rng.best + '] ' + rng.axis);
  if (v.lastDay) {
    needAll(v.lastDay, ['changed', 'holds', 'futures', 'purse'], 'verdict.lastDay');
    out.push('  ' + H.lastDay + ': ' + W.lastDayLine(v, kinId));
    stats.lastDay++;
  }
  if (v.seal.earned) { out.push('  SEAL: ' + W.seal()); stats.sealed++; } else W.seal();
  if (v.mattered && v.mattered.kind === 'habit') {
    needAll(v.mattered, ['situation', 'h', 'n'], 'verdict.mattered');
    need(v.whatIfs[2 * v.mattered.situation], 'holds', 'whatIfs'); need(v.whatIfs[2 * v.mattered.situation + 1], 'holds', 'whatIfs');
    stats.matteredHabit++;
  } else if (v.mattered) stats.matteredLast++; else stats.matteredNone++;
  out.push('  ' + H.mattered + ': ' + W.mattered(v, titles));
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
var samples = [], livesByPolicy = {};

SEEDS.forEach(function (seed, si) {
  Object.keys(POLICIES).forEach(function (name, pi) {
    var extra = REQUIRED.indexOf(name) < 0;
    if (extra && si % 3 !== 0) return;                       // the extra ways on every third valley
    var full = si < 3 && !extra;                             // the page's own counts (2000 futures) on nine Lives
    var res = liveOne(seed, name, full ? undefined : { futures: 400, whatIfFutures: 200 });
    livesByPolicy[name] = (livesByPolicy[name] || 0) + 1;
    if (full && !res.sawHeadline) throw new Error('job.headline never appeared during a full count');
    if ((si === 0 && pi < 3) || (si === 3 && pi === 3) || (si === 6 && pi === 5)) samples.push(res);
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
  if (/https?:\/\/(?!fonts\.googleapis\.com|www\.w3\.org)/.test(html + app)) throw new Error('an external address other than the font host');
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
  has(html, '@media (min-width: 62rem) and (max-height: 57.99rem)', 'the compact day of a laptop of ordinary height');
  has(app, "media('(min-width: 40rem) and (min-height: 58rem)')", 'the same line in app.js');
  has(app, 'window.AYApp = { state: state }', 'state hook');
  has(app, '#valley-', 'valley hash');
  has(app, 'after-you.lives.v1', 'storage key');
  has(html, 'aria-live="polite"', 'live region');
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
print('AYWords functions exercised: ' + NAMES.length + ' of ' + NAMES.length);
print('Engine fields read: ' + fieldsRead + '; page hooks found: ' + hooks);
print('Sentences checked: ' + sentences);
print('Time: ' + secs.toFixed(1) + ' s');
if (secs > 60) throw new Error('page-smoke.js took longer than 60 seconds');
print('PAGE SMOKE: PASS');
