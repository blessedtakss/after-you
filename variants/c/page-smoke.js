/*
 * After You: page smoke test for the jsc shell (no browser).
 *   cd <this folder> && "$JSC" page-smoke.js
 * Plays complete Lives through the same engine calls app.js makes, in the same order, calls
 * every function of AYWords with the real engine data at each point, and throws on the first
 * sentence that is empty, malformed or uses a forbidden word, and on any engine field app.js
 * reads for drawing that is undefined.
 */
load('engine.js');
load('words.js');

var A = AfterYou;
var T0 = preciseTime();

// ---- checking -------------------------------------------------------------------------------

var FORBIDDEN = /\b(cooperat\w*|defect\w*|prisoners?|dilemmas?|strateg\w*|payoffs?|tit for tat|game theory|players?|firm|soft|taker|wary|steady)\b/i;
var BROKEN = /undefined|NaN|null|\[object|  /;
var STYLE = /[!—]/;
var COUNT = /\b1 times\b/;                               // "1 of 1 times": a count of one is "1 time"
var OWN_WAY = /\bthe (\w+) house takes up the \1 way\b/;   // a house does not take up its own family's way: it goes back to it
var DATA = { pickDeeds: 1, record: 1, futureEvents: 1, eventShown: 1 };   // return plain values, not sentences

var sentences = 0, where = '';
var cover = {};
function saw(key) { cover[key] = (cover[key] || 0) + 1; }
function fail(msg) { throw new Error('page-smoke: ' + msg + '   [' + where + ']'); }
function sentence(s, from) {
  if (typeof s !== 'string') fail(from + ' returned ' + (s === null ? 'null' : typeof s) + ' where a sentence was expected');
  if (!s.length) fail(from + ' returned an empty string');
  if (s !== s.trim()) fail(from + ' has space at an end: "' + s + '"');
  if (BROKEN.test(s)) fail(from + ' is malformed: "' + s + '"');
  if (FORBIDDEN.test(s)) fail(from + ' uses a forbidden word: "' + s + '"');
  if (STYLE.test(s)) fail(from + ' has an exclamation mark or a long dash: "' + s + '"');
  if (COUNT.test(s)) fail(from + ' counts one as many: "' + s + '"');
  if (OWN_WAY.test(s)) fail(from + ' has a house take up its own way: "' + s + '"');
  if (/\bof 1 time\b/.test(s)) saw('counts: "of 1 time" (' + from + ')');
  sentences++;
}
function strings(x, from) {            // every string inside a data value is checked too
  if (typeof x === 'string') return sentence(x, from);
  if (x === undefined) fail(from + ' holds undefined');
  if (Array.isArray(x)) return x.forEach(function (y) { strings(y, from); });
  if (x && typeof x === 'object') Object.keys(x).forEach(function (k) { strings(x[k], from + '.' + k); });
}
function checkOut(out, name) {
  if (DATA[name]) { if (out === undefined || out === null) fail(name + ' returned nothing'); return strings(out, name); }
  if (typeof out === 'string') return sentence(out, name);
  if (!Array.isArray(out)) fail(name + ' must return a string or an array of strings');
  out.forEach(function (s) { sentence(s, name); });
}

// Every function of AYWords, wrapped: counted, and its output checked on every call.
var W = {}, calls = {};
Object.keys(AYWords).forEach(function (k) {
  if (typeof AYWords[k] !== 'function') fail('AYWords.' + k + ' is not a function');
  calls[k] = 0;
  W[k] = function () { calls[k]++; var out = AYWords[k].apply(AYWords, arguments); checkOut(out, k); return out; };
});

// An engine field the page reads for drawing: must be defined (null is allowed only where said).
function must(v, path, nullable) {
  if (v === undefined) fail('engine field undefined: ' + path);
  if (v === null && !nullable) fail('engine field null: ' + path);
  if (typeof v === 'number' && v !== v) fail('engine field NaN: ' + path);
  return v;
}

// ---- the three ways of playing (and a fourth, contrary one, for the rarer sentences) --------

var WAYS = [
  { name: 'always send', pick: function () { return true; } },
  { name: 'send unless left short yesterday', pick: function (nb) { return nb.situation !== 2; } },
  { name: 'the same, and stay home against everyone on day 12',
    pick: function (nb, day) { return day === 12 ? false : nb.situation !== 2; } },
  { name: 'contrary: stay home on meeting, then by turns',
    pick: function (nb, day, seed) { return nb.situation === 0 ? false : (seed + day * 7 + nb.id * 3) % 3 !== 0; } }
];

// ---- one whole Life, as app.js runs it ------------------------------------------------------

// In the two situations that differ from bank to bank, the count line on a "learned from you" card
// must say where YOU stood, so that the heading (their side) and the deeds (your side) do not read as a slip.
var TURN = { 2: 'When a house had left you short, you sent a hand ', 3: 'When you had left a house short, you sent a hand ' };

// What app.js hands to the back of a card when its front counts only since a change (countedSince).
function sinceOf(nb, s) {
  if (nb.changedDay === null) return null;
  return { day: nb.changedDay, h: must(nb.seenSince[s].h, 'seenSince.h'), n: must(nb.seenSince[s].n, 'seenSince.n') };
}

function whyCheck(why, actor, kinId, other, tag, since) {
  must(why.situation, tag + '.why.situation'); must(why.source.type, tag + '.why.source.type');
  must(why.source.far, tag + '.why.source.far'); must(why.source.from, tag + '.why.source.from', true);
  must(why.source.fromName, tag + '.why.source.fromName', true); must(why.source.digest, tag + '.why.source.digest', true);
  must(why.seen.h, tag + '.why.seen.h'); must(why.seen.n, tag + '.why.seen.n');
  must(why.againstHabit, tag + '.why.againstHabit', true);
  W.whyFor(actor);
  var card = W.whyCard(why, actor, kinId, other, since);
  // the same parts, as the page asks for them one by one
  var parts = [W.whySituation(why, other)].concat(W.whyLead(why, actor, kinId, !!other, since));
  if (why.source.type === 'own' && since) {
    // the front of this card shows `since`, its back quotes why.seen: when they differ the back must give both
    if (since.n > why.seen.n || since.h > why.seen.h) fail('more was counted since the change than over the whole harvest');
    var both = card.indexOf(AYWords.whySince(since)) >= 0;
    if (both !== (since.n !== why.seen.n)) fail('the back of the card and its front give different counts with nothing said: ' + card.join(' | '));
    if (both) W.whySince(since);
    saw('why card: own, after a change, ' + (both ? 'both counts given' : 'one count on both sides'));
  }
  if (why.source.type === 'you') {
    var d = why.source.digest, deeds = W.pickDeeds(d);
    must(d.n, tag + '.digest.n'); must(d.sent, tag + '.digest.sent');
    if (parts[2].indexOf(TURN[why.situation] || 'Here you sent a hand ') !== 0) fail('the count line does not say where you stood: "' + parts[2] + '"');
    saw('why: learned from you, situation ' + why.situation + (TURN[why.situation] ? ' (told from your side)' : ''));
    if (deeds.length < 1 || deeds.length > 3) fail('pickDeeds gave ' + deeds.length + ' deeds');
    deeds.forEach(function (x) {
      must(x.day, tag + '.deed.day'); must(x.helped, tag + '.deed.helped'); must(x.toName, tag + '.deed.toName');
      parts.push(W.whyDeed(x, why.situation, kinId));
    });
    if (d.n > deeds.length) { parts.push(W.whyMore(d.n - deeds.length)); saw('why: and k more'); }
    if (why.againstHabit) { parts.push(W.whyEven(why)); saw('why: even so'); }
    if (d.dissent.length) saw('why: deeds against the majority');
  }
  if (parts.join('|') !== card.join('|')) fail('whyCard and its parts disagree');
  saw('why ' + (other ? 'elsewhere' : 'card') + ': ' + why.source.type + (why.source.far ? ' (far)' : ''));
  return card;
}

// One future as the Afterwards and the Chronicle tell it. watched: it is the one the page draws.
function futureCheck(fut, kinId, watched) {
  var lines = [], tag = watched ? 'future: ' : 'another future: ';
  function keeps(w) { return w === 0 || w === kinId; }
  fut.seasons.forEach(function (se) {
    must(se.season, 'future.seasons.season'); must(se.flow, 'future.seasons.flow'); must(se.events, 'future.seasons.events');
    if (watched) W.seasonCount(se.season);
    var kinGone = fut.arrival.house === kinId && se.season >= fut.arrival.season;
    if (se.houses.length !== 8) fail('a season has ' + se.houses.length + ' houses');
    se.houses.forEach(function (h) {
      ['id', 'name', 'helpRate', 'income', 'purse', 'way'].forEach(function (f) { must(h[f], 'future.seasons.houses.' + f); });
      if (h.helpRate < 0 || h.helpRate > 1) fail('helpRate out of range: ' + h.helpRate);
      if (watched) W.ringLabel(h, kinId, kinGone);
    });
    se.events.forEach(function (ev) {
      must(ev.type, 'future.events.type');
      if (ev.type === 'adopt') {
        ['adopter', 'adopterName', 'way', 'wayName', 'from', 'changed'].forEach(function (f) { must(ev[f], 'future.events.' + f); });
        if (ev.changed !== (ev.way !== ev.from)) fail('an adopt event says changed ' + ev.changed + ' with way ' + ev.way + ' from ' + ev.from);
      }
      if (!W.eventShown(ev, kinId)) return;
      var kept = false, kind;
      if (ev.type === 'arrival') {
        // whose way the house that gives way was keeping: last season's, unless it changed at that season's end
        var prev = fut.seasons[se.season - 2], w = must(prev.houses[ev.house].way, 'the way before an arrival');
        prev.events.forEach(function (e) { if (e.type === 'adopt' && e.adopter === ev.house) w = e.way; });
        kept = keeps(w);
      }
      var line = W.eventLine(ev, se.season, kinId, kinGone, kept); lines.push(line);
      if (ev.type === 'arrival') {
        must(ev.name, 'future.events.name'); must(ev.replaced, 'future.events.replaced');
        if (/ kept your ways until then\.$/.test(line) !== (kept && ev.house !== kinId)) fail('"kept your ways until then" is said of the wrong arrival: "' + line + '"');
        kind = ev.house === kinId ? "newcomers take your sister's holding"
             : kept ? 'newcomers take the holding of a house that kept your ways' : 'newcomers arrive';
      } else {
        var actor = ev.adopter === 0 ? 'your heir' : ev.adopter === kinId && !kinGone ? "your sister's house" : 'another house';
        var back = / goes back to its own way\.$/.test(line), gave = / gives up your ways /.test(line), took = / takes up your ways\.$/.test(line);
        if (gave !== (keeps(ev.from) && !keeps(ev.way))) fail('"gives up your ways" must be said of every house that leaves them, and of no other: "' + line + '"');
        if (took !== keeps(ev.way)) fail('"takes up your ways" is said of the wrong event: "' + line + '"');
        if (back !== (!keeps(ev.way) && ev.wayName === ev.adopterName)) fail('"goes back to its own way" is said of the wrong event: "' + line + '"');
        if (back && (ev.adopter === 0 || (ev.adopter === kinId && !kinGone))) fail('your heir and your sister have no way of their own but yours: "' + line + '"');
        kind = gave ? actor + ' gives up your ways' + (back ? ' and goes back to its own' : ' for another way')
             : took ? actor + ' takes up your ways'
             : back ? 'a house goes back to its own way' : actor + ' takes up another way';
      }
      saw(tag + kind);
    });
  });
  var evs = W.futureEvents(fut, kinId), toldAt = {}, mine = 0;
  if (evs.map(function (e) { return e.text; }).join('|') !== lines.join('|')) fail('futureEvents and the ticker disagree');
  if (W.futureLines(fut, kinId).join('|') !== lines.join('|')) fail('futureLines and the ticker disagree');
  evs.forEach(function (e) {
    must(e.season, 'futureEvents.season'); must(e.yours, 'futureEvents.yours'); must(e.house, 'futureEvents.house');
    if (e.yours) { toldAt[e.season + ':' + e.house] = true; mine++; }
  });
  // "In the future you watched": every time a house starts or stops keeping your ways, a line says so.
  // A change shows between one season and the next (or the end): it is an adoption at the end of
  // the first of the two, or newcomers taking the holding before the second.
  var si, h, a, b, arrived;
  for (si = 0; si < 30; si++) {
    for (h = 0; h < 8; h++) {
      a = fut.seasons[si].houses[h].way; b = si < 29 ? fut.seasons[si + 1].houses[h].way : fut.finalWay[h];
      if (keeps(a) === keeps(b)) continue;
      arrived = si < 29 && fut.arrival.season === si + 2 && fut.arrival.house === h;
      if (!toldAt[(si + 1) + ':' + h] && !(arrived && toldAt[(si + 2) + ':' + h])) {
        fail('house ' + h + (keeps(a) ? ' stops' : ' starts') + ' keeping your ways after season ' + (si + 1) + ' and no line says so');
      }
      saw(tag + 'told: a house ' + (keeps(a) ? 'stops' : 'starts') + ' keeping your ways' + (arrived && !toldAt[(si + 1) + ':' + h] ? ' (newcomers)' : ''));
    }
  }
  var became = W.became(fut, kinId);
  if (became.length !== mine + 1 || became[became.length - 1] !== AYWords.yoursEnd(fut)) fail('became is not the lines about your ways and then the closing line');
  saw(tag + W.futureEnd(fut)); saw(tag + W.yoursEnd(fut).replace(/\d+/g, 'N'));
}

function playLife(seed, way, verdictOptions) {
  where = 'valley ' + seed + ', ' + way.name;
  var life = A.createLife(seed), kinId = must(life.kin, 'life.kin'), quoted = false;
  must(life.seed, 'life.seed'); must(life.params.HOLD_LINE, 'life.params.HOLD_LINE'); must(life.params.FOG, 'life.params.FOG');
  must(life.houses[kinId].name, 'life.houses[kin].name');
  var titles = A.ways(life).map(function (w) { return W.wayTitle(w); });
  var day, i, s;

  for (day = 1; day <= 12; day++) {
    where = 'valley ' + seed + ', ' + way.name + ', day ' + day;
    // the day as it opens
    var t = A.today(life), w = A.ways(life);
    must(t.day, 'today.day'); must(t.purse, 'today.purse'); must(t.need, 'today.need'); must(t.oldWayPurse, 'today.oldWayPurse');
    if (t.day !== day) fail('today().day is ' + t.day);
    W.dayTitle(t.day); if (t.day === 12) W.lastDayNote();
    W.storeLabel(); W.store(t.purse, t.need); W.oldWay(t.oldWayPurse);
    if (t.neighbours.length !== 4) fail('today() has ' + t.neighbours.length + ' neighbours');
    var choices = [];
    t.neighbours.forEach(function (nb, k) {
      must(nb.id, 'today.neighbours.id'); must(nb.name, 'today.neighbours.name'); must(nb.kin, 'today.neighbours.kin');
      must(nb.yesterday, 'today.neighbours.yesterday', true); must(nb.changedDay, 'today.neighbours.changedDay', true);
      must(nb.situation, 'today.neighbours.situation');
      W.houseTitle(nb); if (nb.kin) W.houseSub(nb);
      W.choiceFor(nb);
      W.yesterday(nb.yesterday);
      if (nb.yesterday && nb.yesterday.lost) saw('yesterday: turned back at the ford');
      if (nb.changedDay !== null) { W.knowChanged(nb.changedDay); saw('know: counted since a change'); }
      var seen = nb.changedDay !== null ? nb.seenSince : nb.seen;
      must(seen, 'today.neighbours.seen'); must(nb.seenSince, 'today.neighbours.seenSince');
      for (s = 0; s < 5; s++) {
        must(seen[s].h, 'today.neighbours.seen.h'); must(seen[s].n, 'today.neighbours.seen.n');
        W.knowLabel(s); W.knowCount(seen[s]); W.knowRow(s, seen[s]);
      }
      choices.push(!!way.pick(nb, day, seed));
      W.closeLabel(3 - k);
    });
    W.knowHeading(); W.knowColumn(); W.knowNote(); W.send(); W.stay(); W.smallPrint();
    W.waysHeading();
    w.forEach(function (x) {
      W.wayTitle(x); W.wayCount(x); must(x.h, 'ways.h'); must(x.n, 'ways.n');
      x.deeds.forEach(function (d) { must(d.day, 'ways.deeds.day'); must(d.helped, 'ways.deeds.helped'); });
      if (x.deeds.length !== x.n) fail('ways().deeds does not match n');
    });

    // close the day
    var res = A.playDay(life, choices);
    W.closedLabel();
    must(res.day, 'playDay.day'); must(res.gained, 'playDay.gained'); must(res.purse, 'playDay.purse');
    must(res.need, 'playDay.need'); must(res.over, 'playDay.over'); must(res.lookingRound, 'playDay.lookingRound', true);
    W.dayTotal(res);
    res.results.forEach(function (r, k) {
      ['id', 'name', 'kin', 'intended', 'lost', 'arrived', 'they', 'payoff'].forEach(function (f) { must(r[f], 'playDay.results.' + f); });
      if (r.intended !== choices[k]) fail('result does not match the choice made');
      W.reveal(r); W.revealText(r); W.signed(r.payoff); W.markYours(r); W.markTheirs(r);
      saw('reveal: ' + (r.lost ? 'turned back' : r.arrived ? 'sent' : 'stayed') + ', ' + (r.they ? 'theirs came' : 'none came'));
      var nb = t.neighbours[k], known = nb.seen[r.why.situation];
      if (nb.id !== r.id) fail('today() and playDay() list the neighbours in different orders');
      if (r.why.seen.h !== known.h || r.why.seen.n !== known.n) fail('why.seen is not what today().seen counted for that situation');
      whyCheck(r.why, r, kinId, null, 'results', sinceOf(nb, r.why.situation));
      if (r.why.source.type === 'you' && !quoted) { quoted = true; saw('first quoted back: day ' + (day < 10 ? '0' : '') + day); }
    });
    W.whyLabel(); W.whyBack();
    must(res.kinWith, 'playDay.kinWith');
    if (res.kinWith.length) W.elsewhereHeading();
    res.kinWith.forEach(function (e) {
      must(e.id, 'kinWith.id'); must(e.name, 'kinWith.name'); must(e.kinSent, 'kinWith.kinSent'); must(e.theySent, 'kinWith.theySent');
      W.elsewhere(e, kinId);
      saw('elsewhere: ' + (e.kinSent ? 'sent' : 'none') + ' / ' + (e.theySent ? 'sent' : 'none'));
      var kin = life.houses[kinId];
      whyCheck(e.why, { name: kin.name, kin: true }, kinId, { name: e.name, kin: false }, 'kinWith', null);
      if (e.why.source.type === 'you' && !quoted) { quoted = true; saw('first quoted back: day ' + (day < 10 ? '0' : '') + day); }
    });
    A.ways(life).forEach(function (x) { W.wayTitle(x); W.wayCount(x); if (!x.n) saw('ways: not yet tested'); });

    // next
    W.nextLabel(day, false);
    var round = res.lookingRound;
    if (day % 4 === 0 && !round) fail('no season end on day ' + day);
    if (day % 4 !== 0 && round) fail('season end on day ' + day);
    if (round) {
      W.seasonHeading(); W.nextLabel(day, true);
      must(round.kin.changed, 'lookingRound.kin.changed');
      round.kin.habits.forEach(function (h) {
        ['situation', 'before', 'after', 'source', 'h', 'n'].forEach(function (f) { must(h[f], 'lookingRound.kin.habits.' + f); });
        if (h.source === 'blank') saw('season: a way your sister never saw tested');
      });
      round.reconsidered.forEach(function (e) {
        ['house', 'name', 'model', 'modelName', 'adopted', 'took', 'visible', 'modelVisible', 'changed'].forEach(function (f) { must(e[f], 'lookingRound.reconsidered.' + f); });
        var line = W.seasonHouse(e, kinId);
        if (e.visible) saw('season: ' + (e.adopted && e.took > 0 ? (e.model === 0 ? 'took up your ways' : !e.modelVisible ? 'took up a far way' : 'took up a named way')
                                       : e.changed ? 'changed on its own' : 'looked and kept'));
      });
      var all = W.seasonLines(round, titles, kinId);
      var again = [W.seasonIntro(), W.seasonKin(round)].concat(W.seasonKinChanges(round, titles), W.seasonHouses(round, kinId));
      if (all.join('|') !== again.join('|')) fail('seasonLines and its parts disagree');
      if (W.seasonKinChanges(round, titles).length) saw('season: your sister changed a way');
      if (all.indexOf(AYWords.seasonNone()) >= 0) saw('season: no house you can see');
      W.seasonNone();
    }
  }

  // leaving
  where = 'valley ' + seed + ', ' + way.name + ', leaving';
  if (!life.over) fail('the Life is not over after day 12');
  var leg = A.legacy(life), last = A.ways(life);
  must(life.purse, 'life.purse'); must(life.need, 'life.need');
  W.leavingTitle(); W.leavingStore(life.purse, life.need); W.leaveHeading(); W.leaveLabel();
  saw(life.purse >= life.need ? 'leaving: house kept' : 'leaving: house short');
  for (s = 0; s < 5; s++) {
    must(leg.hollow[s], 'legacy.hollow'); must(leg.heir[s], 'legacy.heir'); must(leg.h[s], 'legacy.h'); must(leg.n[s], 'legacy.n');
    must(leg.kin.fromYou[s], 'legacy.kin.fromYou');
    W.leaveValue(leg, s); W.leaveWay(titles[s], leg, s);
    if (leg.hollow[s]) saw('leaving: never tested, heir ' + (leg.heir[s] >= 0.5 ? 'sends' : 'stays'));
    last[s].deeds.forEach(function (d) { must(d.helped, 'ways.deeds.helped'); });
  }
  W.leaveKin(leg);

  // the Afterwards: one future watched, the verdict counted in slices
  where = 'valley ' + seed + ', ' + way.name + ', afterwards';
  var fut = A.runFuture(life, 0), job = A.verdictJob(life, verdictOptions);
  must(fut.holds, 'future.holds'); must(fut.level, 'future.level'); must(fut.arrival, 'future.arrival');
  must(fut.arrival.season, 'future.arrival.season'); must(fut.arrival.house, 'future.arrival.house');
  must(fut.yourWaysAtEnd, 'future.yourWaysAtEnd'); must(fut.yourWaysLastSeason, 'future.yourWaysLastSeason');
  if (fut.seasons.length !== 30) fail('the future has ' + fut.seasons.length + ' seasons');
  must(fut.finalWay, 'future.finalWay');
  if (fut.finalWay.length !== 8) fail('future.finalWay has ' + fut.finalWay.length + ' entries');
  if (fut.finalWay.filter(function (w) { return w === 0 || w === kinId; }).length !== fut.yourWaysAtEnd) fail('finalWay and yourWaysAtEnd disagree');
  W.afterTitle(); W.oneFuture(must(job.futures, 'job.futures')); W.skip(); W.toChronicle();
  W.legendFill(); W.legendNumber(); W.legendYours(); W.flowCaption(); W.lastTen(); W.tickerHeading(); W.fordLabel();
  futureCheck(fut, kinId, true);
  // The page watches future 0 only. Three more futures of the same Life pass through the same
  // words, so that the rarer ticker sentences are met on real engine data too.
  for (i = 1; i <= 3; i++) {
    where = 'valley ' + seed + ', ' + way.name + ', future ' + i;
    futureCheck(A.runFuture(life, i), kinId, false);
  }

  where = 'valley ' + seed + ', ' + way.name + ', verdict';
  var steps = 0, sawHeadlineFirst = false;
  W.counting(job);
  while (!A.verdictStep(job, 200)) {
    steps++;
    if (steps % 16 === 1) W.counting(job);
    must(job.futuresDone, 'job.futuresDone'); must(job.done, 'job.done');
    if (job.headline && !job.done) sawHeadlineFirst = true;
  }
  W.counting(job);
  var v = must(job.result, 'job.result');
  if (!job.done) fail('verdictStep returned true but job.done is false');

  // the Chronicle
  where = 'valley ' + seed + ', ' + way.name + ', chronicle';
  ['futures', 'holds', 'holdsPct', 'baselinePct', 'mark', 'markSE', 'purse', 'need', 'houseKept', 'whatIfFutures', 'whatIfBaseHolds']
    .forEach(function (f) { must(v[f], 'verdict.' + f); });
  must(v.baseline.holds, 'verdict.baseline.holds'); must(v.seal.earned, 'verdict.seal.earned');
  must(v.lastDay, 'verdict.lastDay', true); must(v.mattered, 'verdict.mattered', true);
  var shown = Math.min(200, v.futures);
  for (i = 0; i < shown; i++) { must(v.held[i], 'verdict.held[' + i + ']'); must(v.baseline.held[i], 'verdict.baseline.held[' + i + ']'); }
  ['bestPct', 'worstPct', 'scaleLow', 'scaleHigh'].forEach(function (f) { must(v.range[f], 'verdict.range.' + f); });
  if (v.range.scaleLow > Math.min(v.holdsPct, v.baselinePct, v.range.worstPct) ||
      v.range.scaleHigh < Math.max(v.holdsPct, v.baselinePct, v.range.bestPct)) fail('the scale does not hold what is drawn on it');
  if (v.whatIfs.length !== 10) fail('verdict.whatIfs has ' + v.whatIfs.length + ' rows');
  v.whatIfs.forEach(function (x) { must(x.holds, 'verdict.whatIfs.holds'); });

  W.chronicleTitle(); W.headHouse(); W.houseLine(v);
  W.headValley(); W.valleyLine(v); W.markNumber(v); W.markLine(v); W.markNote(v);
  W.rowYou(); W.rowOld(); W.rowsLegend(); W.rowsCaption(v); W.explain(v);
  W.headSits(); W.rangeLine(v); W.tickBest(v); W.tickWorst(v); W.markerYou(); W.markerOld();
  W.pct(v.holdsPct); W.pct(v.baselinePct);
  if (v.lastDay) {
    v.lastDay.changed.forEach(function (c) { must(c.id, 'verdict.lastDay.changed.id'); must(c.name, 'verdict.lastDay.changed.name'); });
    must(v.lastDay.holds, 'verdict.lastDay.holds'); must(v.lastDay.futures, 'verdict.lastDay.futures'); must(v.lastDay.purse, 'verdict.lastDay.purse');
    W.headLastDay(); W.lastDayLine(v, kinId);
    saw('chronicle: last day, ' + (v.lastDay.changed.length > 1 ? 'several houses' : 'one house'));
  }
  if (v.seal.earned) saw('chronicle: the seal');
  W.seal();
  W.headMattered(); W.mattered(v, titles);
  saw('chronicle: mattered ' + (v.mattered ? v.mattered.kind : 'nothing'));
  saw('chronicle: mark ' + (Math.round(v.mark) > 0 ? 'above' : Math.round(v.mark) < 0 ? 'below' : 'zero'));
  W.headBecame(); W.became(fut, kinId);
  W.valleyNo(life.seed); W.again(); W.againSame();
  var rec = W.record(v, life.seed);
  W.lifeRow(rec); W.livesHeading();
  var text = W.chronicle(v, fut, kinId, titles, life.seed);
  if (verdictOptions === undefined && !sawHeadlineFirst) fail('the headline never came before the result');
  return { seed: seed, way: way.name, text: text, row: AYWords.lifeRow(rec), full: verdictOptions === undefined,
           seal: v.seal.earned, mattered: v.mattered ? v.mattered.kind : null, lastDay: !!v.lastDay };
}

// ---- run ------------------------------------------------------------------------------------

where = 'opening';
W.title(); W.opening(); W.begin(); W.stakeNear(); W.stakeFar(); W.who('Maren', false, true); W.who('Wren', true, false);

var SEEDS = [48213, 7, 19, 42, 101, 256, 999, 1234, 2718, 3141, 5000, 6174, 8128, 10007, 27182, 31415, 65537, 77777, 90210, 99991];
var QUICK = { futures: 400, whatIfFutures: 200 };    // the same work on fewer futures, to stay inside a minute
var lives = [], fullCount = 0;
SEEDS.forEach(function (seed, k) {
  for (var w = 0; w < 3; w++) {
    var full = (k % 3) === w;                        // the page's own default count on one Life per valley
    lives.push(playLife(seed, WAYS[w], full ? undefined : QUICK));
    if (full) fullCount++;
  }
  if (k % 3 === 0) lives.push(playLife(seed, WAYS[3], QUICK));
});

where = 'after the run';
Object.keys(calls).forEach(function (k) { if (!calls[k]) fail('AYWords.' + k + ' was never called'); });
// Sentences that only some Lives reach: the run must have met each of them on real engine data.
function met(test, what) {
  var keys = Object.keys(cover).filter(function (k) { return typeof test === 'string' ? k === test : test.test(k); });
  if (!keys.length) fail('the run never met: ' + what);
}
met('why card: own, after a change, both counts given', 'a card whose back gives the whole count and the count since a change');
met('why: learned from you, situation 2 (told from your side)', '"When a house had left you short, you sent a hand ..."');
met('why: learned from you, situation 3 (told from your side)', '"When you had left a house short, you sent a hand ..."');
met(/^counts: "of 1 time" \(whyLead\)/, '"1 of 1 time" on a Why? card');
met(/^counts: "of 1 time" \(seasonKinChanges\)/, '"1 of 1 time" at a season\'s end');
met(/^counts: "of 1 time" \(mattered\)/, '"1 of 1 time" in the way that mattered most');
met('future: another house gives up your ways for another way', 'a house other than your heir or your sister giving up your ways, in a watched future');
met(/future: another house gives up your ways and goes back to its own$/, 'a house giving up your ways for its own');
met('future: a house goes back to its own way', 'a house going back to its own way, in a watched future');
met('future: newcomers take the holding of a house that kept your ways', 'newcomers taking the holding of a house that kept your ways, in a watched future');
met('future: told: a house stops keeping your ways', 'a watched future telling of a house that stops keeping your ways');
met('future: told: a house stops keeping your ways (newcomers)', 'a watched future telling of a house that kept your ways until newcomers came');

// five sample Chronicles in full: one of each way of playing, then one with the seal and one
// where a single way stood out, when the run has them
function pick(test) { for (var i = 0; i < lives.length; i++) if (!lives[i].printed && test(lives[i])) { lives[i].printed = true; return lives[i]; } return null; }
var samples = [
  pick(function (l) { return l.full && l.way === WAYS[0].name; }),
  pick(function (l) { return l.full && l.way === WAYS[1].name; }),
  pick(function (l) { return l.full && l.way === WAYS[2].name && l.lastDay; }),
  pick(function (l) { return l.seal; }) || pick(function (l) { return l.full; }),
  pick(function (l) { return l.mattered === 'habit'; }) || pick(function (l) { return l.full; })
];
samples.forEach(function (l, i) {
  print('');
  print('--- Chronicle ' + (i + 1) + ' of 5: valley ' + l.seed + ', ' + l.way + (l.full ? '' : ' (counted on fewer futures)') + ' ---');
  l.text.forEach(function (line) { print('  ' + line); });
  print('  [' + l.row + ']');
});

print('');
print('--- sentences met, by kind ---');
Object.keys(cover).sort().forEach(function (k) { print('  ' + cover[k] + '\t' + k); });
var T1 = preciseTime();

// ---- part 2: the page itself, on a stand-in DOM ------------------------------------------------
// There is no browser here, so index.html is parsed into a small stand-in DOM and app.js is run on
// it with a pretend clock. Every id and data attribute the page relies on is found by using it,
// whole Lives are clicked through by the hooks of the brief, and every text the page then shows is
// checked like the sentences above. It proves the page's logic and wiring, not how it looks.

var clock = 0, timers = [], timerId = 1, reducedMotion = false, snapFn = null, pageTexts = 0, pageChecks = 0, pageBoth = 0;

function Txt(t) { this.nodeType = 3; this.nodeValue = t; this.parentNode = null; }
function El(tag, ns) {
  var self = this;
  this.nodeType = 1; this.nodeName = ns ? tag : tag.toUpperCase(); this.childNodes = []; this.parentNode = null;
  this.attrs = {}; this.listeners = {}; this.checked = false; this.disabled = false; this.open = false;
  this.offsetHeight = 300; this.scrollTop = 0; this.scrollHeight = 0;
  this.style = { setProperty: function (k, v) { this[k] = v; } };
  this.classList = {
    add: function (c) { if (!self.classList.contains(c)) self.className = (self.className + ' ' + c).trim(); },
    remove: function (c) { self.className = self.className.split(/\s+/).filter(function (x) { return x && x !== c; }).join(' '); },
    contains: function (c) { return self.className.split(/\s+/).indexOf(c) >= 0; }
  };
}
El.prototype = {
  get className() { return this.attrs['class'] || ''; }, set className(v) { this.attrs['class'] = String(v); },
  get id() { return this.attrs.id || ''; }, set id(v) { this.attrs.id = String(v); },
  get hidden() { return 'hidden' in this.attrs; }, set hidden(v) { if (v) this.attrs.hidden = ''; else delete this.attrs.hidden; },
  get type() { return this.attrs.type || ''; }, set type(v) { this.attrs.type = v; },
  get name() { return this.attrs.name || ''; }, set name(v) { this.attrs.name = v; },
  get value() { return this.attrs.value || ''; }, set value(v) { this.attrs.value = v; },
  get firstChild() { return this.childNodes[0] || null; },
  get lastChild() { return this.childNodes[this.childNodes.length - 1] || null; },
  get children() { return this.childNodes.filter(function (n) { return n.nodeType === 1; }); },
  get textContent() { return this.childNodes.map(function (n) { return n.nodeType === 3 ? n.nodeValue : n.textContent; }).join(''); },
  set textContent(v) {
    this.childNodes.forEach(function (n) { n.parentNode = null; }); this.childNodes = [];
    if (v !== '' && v !== null && v !== undefined) this.appendChild(new Txt(String(v)));
  },
  setAttribute: function (k, v) { if (typeof v !== 'string') fail('setAttribute("' + k + '") was given a ' + typeof v); this.attrs[k] = v; },
  getAttribute: function (k) { return k in this.attrs ? this.attrs[k] : null; },
  hasAttribute: function (k) { return k in this.attrs; },
  appendChild: function (n) {
    var self = this;
    if (n.isFragment) { n.childNodes.slice().forEach(function (c) { self.appendChild(c); }); return n; }
    if (n.parentNode) n.parentNode.removeChild(n);
    n.parentNode = this; this.childNodes.push(n); return n;
  },
  removeChild: function (n) {
    var i = this.childNodes.indexOf(n);
    if (i < 0) fail('removeChild of a node that is not a child');
    this.childNodes.splice(i, 1); n.parentNode = null; return n;
  },
  addEventListener: function (type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); },
  dispatch: function (type) {
    var e = { type: type, target: this, repeat: false, key: '', preventDefault: function () {} }, n = this;
    while (n) { ((n.listeners && n.listeners[type]) || []).slice().forEach(function (fn) { fn.call(n, e); }); n = n.parentNode; }
  },
  click: function () {
    if (this.disabled) return;
    if (this.nodeName === 'INPUT' && this.type === 'radio') {
      var was = this.checked, name = this.name;
      document.querySelectorAll('input').forEach(function (i) { if (i.name === name) i.checked = false; });
      this.checked = true; this.dispatch('click'); if (!was) this.dispatch('change');
      return;
    }
    this.dispatch('click');
    if (this.nodeName === 'SUMMARY') this.parentNode.open = !this.parentNode.open;
  },
  focus: function () { document.activeElement = this; },
  scrollIntoView: function () {},
  matches: function (sel) {         // tag, .class and [attr] or [attr="value"], in that order: all this page needs
    var m = /^([a-zA-Z0-9]*)((?:\.[\w-]+)*)((?:\[[^\]]+\])*)$/.exec(sel), self = this;
    if (!m) fail('stand-in DOM: selector not supported: ' + sel);
    if (m[1] && this.nodeName.toLowerCase() !== m[1].toLowerCase()) return false;
    if (!m[2].split('.').filter(Boolean).every(function (c) { return self.classList.contains(c); })) return false;
    return (m[3].match(/\[[^\]]+\]/g) || []).every(function (a) {
      var p = /^\[([\w-]+)(?:=["']?([^"'\]]*)["']?)?\]$/.exec(a);
      return p[2] === undefined ? p[1] in self.attrs : self.attrs[p[1]] === p[2];
    });
  },
  querySelectorAll: function (sel) {
    var out = [];
    (function walk(n) { n.childNodes.forEach(function (c) { if (c.nodeType === 1) { if (c.matches(sel)) out.push(c); walk(c); } }); })(this);
    return out;
  },
  querySelector: function (sel) { return this.querySelectorAll(sel)[0] || null; }
};

function parseHTML(src) {
  var root = new El('body'), stack = [root], i = 0, VOID = { meta: 1, link: 1, input: 1, br: 1 }, RAW = { style: 1, script: 1, title: 1 };
  while (i < src.length) {
    if (src[i] !== '<') {
      var j = src.indexOf('<', i); if (j < 0) j = src.length;
      var t = src.slice(i, j).replace(/\s+/g, ' ').trim();
      if (t) stack[stack.length - 1].appendChild(new Txt(t));
      i = j; continue;
    }
    if (src.substr(i, 4) === '<!--') { i = src.indexOf('-->', i) + 3; continue; }
    var end = src.indexOf('>', i), inside = src.slice(i + 1, end);
    if (inside[0] === '/') {
      var name = inside.slice(1).trim().toLowerCase(), top = stack.pop();
      if (top.nodeName.toLowerCase() !== name) fail('index.html: </' + name + '> closes <' + top.nodeName.toLowerCase() + '>');
      i = end + 1; continue;
    }
    var m = /^([a-zA-Z0-9]+)([\s\S]*)$/.exec(inside), tag = m[1].toLowerCase(), e = new El(tag), am;
    var re = /([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
    while ((am = re.exec(m[2]))) e.attrs[am[1]] = am[2] !== undefined ? am[2] : am[3] !== undefined ? am[3] : '';
    stack[stack.length - 1].appendChild(e);
    i = end + 1;
    if (RAW[tag]) { var close = src.indexOf('</' + tag + '>', i); e.raw = src.slice(i, close); i = close + tag.length + 3; continue; }
    if (!VOID[tag]) stack.push(e);
  }
  if (stack.length !== 1) fail('index.html: <' + stack[stack.length - 1].nodeName.toLowerCase() + '> is never closed');
  return root;
}

var HTML = readFile('index.html');
function memoryStore() { return { data: {}, getItem: function (k) { return k in this.data ? this.data[k] : null; }, setItem: function (k, v) { this.data[k] = String(v); } }; }
// A fresh page: index.html parsed, the globals app.js expects, then app.js itself.
function openPage(hash, hotData, storage) {
  var body = parseHTML(HTML);
  clock = 0; timers = []; timerId = 1; snapFn = null;
  globalThis.window = globalThis;
  globalThis.document = {
    body: body, documentElement: new El('html'), activeElement: null, readyState: 'complete',
    getElementById: function (id) {
      var r = body.querySelectorAll('[id="' + id + '"]');
      if (r.length !== 1) fail(r.length ? 'duplicate id "' + id + '"' : 'no element with id "' + id + '"');
      return r[0];
    },
    createElement: function (t) { return new El(t); },
    createElementNS: function (ns, t) { return new El(t, ns); },
    createTextNode: function (t) { return new Txt(t); },
    createDocumentFragment: function () { var f = new El('fragment'); f.isFragment = true; return f; },
    querySelectorAll: function (sel) { return body.querySelectorAll(sel); },
    querySelector: function (sel) { return body.querySelector(sel); },
    addEventListener: function () {}
  };
  globalThis.location = { hash: hash || '' };
  globalThis.localStorage = storage || memoryStore();
  globalThis.matchMedia = function (q) { return { matches: /min-width/.test(q) ? true : reducedMotion && /reduced-motion/.test(q) }; };
  globalThis.performance = { now: function () { clock += 4; return clock; } };     // every look at the clock costs 4 ms
  globalThis.scrollTo = function () {};
  globalThis.crypto = { getRandomValues: function (a) { a[0] = 123456789; return a; } };   // so that a fresh valley is the same one each run
  globalThis.setTimeout = function (fn, ms) { var id = timerId++; timers.push({ id: id, at: clock + (ms || 0), fn: fn }); return id; };
  globalThis.setInterval = function (fn, ms) { var id = timerId++; timers.push({ id: id, at: clock + ms, fn: fn, every: ms }); return id; };
  globalThis.clearTimeout = globalThis.clearInterval = function (id) { timers = timers.filter(function (t) { return t.id !== id; }); };
  globalThis.claude = hotData === undefined ? undefined : { hot: { data: hotData, snapshot: function (fn) { snapFn = fn; } } };
  var scripts = body.querySelectorAll('script').map(function (x) { return x.getAttribute('src'); }).join(' ');
  if (scripts !== 'engine.js words.js app.js') fail('index.html must end with engine.js, words.js, app.js; found: ' + scripts);
  load('app.js');
  if (!globalThis.AYApp || !AYApp.state) fail('window.AYApp.state is missing');
  return AYApp.state;
}
// Let the pretend clock run, firing timers as they fall due. step: how far it jumps at a time.
function advance(ms, step) {
  var until = clock + ms, due, guard = 0;
  step = step || 10;
  while (clock < until) {
    clock = Math.min(until, clock + step);
    for (;;) {
      due = timers.filter(function (t) { return t.at <= clock; }).sort(function (a, b) { return a.at - b.at || a.id - b.id; })[0];
      if (!due) break;
      if (due.every) due.at = Math.max(due.at + due.every, clock - due.every); else timers = timers.filter(function (t) { return t !== due; });
      due.fn();
      if (++guard > 200000) fail('timers never settle');
    }
  }
}

function ok(cond, what) { pageChecks++; if (!cond) fail('the page: ' + what); }
function byId(id) { return document.getElementById(id); }
function all(sel) { return document.querySelectorAll(sel); }
function viewNow() {
  var open = all('[data-view]').filter(function (n) { return !n.hidden; });
  ok(all('[data-view]').length === 5 && open.length === 1, 'exactly one of the five views is shown (found ' + open.length + ')');
  return open[0];
}
function visibleTexts(n, out) {
  out = out || [];
  if (n.nodeType === 3) { if (n.nodeValue.trim()) out.push(n.nodeValue.trim()); return out; }
  if (n.hidden || n.raw !== undefined) return out;
  n.childNodes.forEach(function (c) { visibleTexts(c, out); });
  return out;
}
function readPage(tag) {            // every text now on screen passes the same test as the sentences
  var texts = visibleTexts(viewNow());
  if (!texts.length) fail('the page shows no text: ' + tag);
  texts.forEach(function (t) { sentence(t, 'page text (' + tag + ')'); sentences--; pageTexts++; });
  return texts;
}
function radio(id, value) {
  var found = all('input[type="radio"][name="choice-' + id + '"]').filter(function (i) { return i.value === value; });
  ok(found.length === 1, 'one radio "' + value + '" for house ' + id);
  return found[0];
}

// One Life through the page by the hooks of the brief. stopAt: { day, season } to stop early.
function clickLife(st, policy, stopAt) {
  stopAt = stopAt || {};
  var quotedOn = 0;
  for (var day = 1; day <= 12; day++) {
    where = 'the page, valley ' + st.seed + ', day ' + day;
    ok(viewNow().getAttribute('data-view') === 'day', 'the day view is shown');
    ok(byId('day-title').textContent === AYWords.dayTitle(day), 'the title reads "' + byId('day-title').textContent + '"');
    ok(byId('day-last').hidden === (day !== 12), 'the last-day note shows on day 12 only');
    ok(byId('day-track').querySelectorAll('i').length === 12 && byId('day-track').querySelectorAll('li').length === 3, 'twelve marks in three groups');
    ok(byId('day-track').querySelectorAll('i.today').length === 1 && byId('day-track').querySelectorAll('i.spent').length === day - 1, 'today marked, past days spent');
    ok(all('[data-house]').map(function (c) { return c.getAttribute('data-house'); }).join() === '1,2,6,7', 'four neighbour cards in the engine order');
    ok(byId('close-day').disabled && byId('close-day').textContent === AYWords.closeLabel(4) && byId('next-day').hidden, 'close-day waits for four choices');
    [1, 2, 6, 7].forEach(function (id, k) {
      ok(all('input[type="radio"][name="choice-' + id + '"]').length === 2, 'two radios for house ' + id);
      radio(id, 'stay').click();                                   // one thing first, then a change of mind
      ok(byId('close-day').textContent === AYWords.closeLabel(3 - k), 'close-day counts down: "' + byId('close-day').textContent + '"');
      if (policy(st.today.neighbours[k], day)) radio(id, 'send').click();
      ok(radio(id, 'send').checked !== radio(id, 'stay').checked, 'one of the two is chosen');
    });
    ok(!byId('close-day').disabled, 'close-day is enabled once all four are chosen');
    if (day === 1 || day === 9) readPage('choosing');
    byId('close-day').click();
    ok(st.phase === 'reveal' && st.choices.length === day && st.result.day === day, 'the day closed');
    ok(byId('close-day').disabled && !byId('next-day').hidden, 'close-day is inert, next-day is shown');
    ok(all('input[type="radio"]').every(function (i) { return i.disabled; }), 'the choices are inert once the day is closed');
    byId('close-day').click(); radio(1, 'send').click();
    ok(st.choices.length === day, 'a second activation changes nothing');
    ok(byId('day-total').textContent === AYWords.dayTotal(st.result) && byId('day-total').getAttribute('aria-live') === 'polite', 'the day total is announced');
    ok(all('.m.new').length === 4, 'the four marks added today stand out in your ways');
    var quoted = all('button.quoted');
    ok(quoted.length <= 1, 'at most one Why? is marked');
    if (quoted.length) { ok(!quotedOn, 'the mark comes once in a Life'); quotedOn = day; }
    [1, 2, 6, 7].forEach(function (id, k) {                        // every card over, and back
      var card = all('[data-house="' + id + '"]')[0], why = card.querySelectorAll('button[data-why="' + id + '"]');
      var nb = st.today.neighbours[k], rw = st.result.results[k].why, since = sinceOf(nb, rw.situation);
      ok(why.length === 1 && !why[0].hidden, 'a Why? control on card ' + id);
      why[0].click(); advance(600);
      ok(card.querySelector('.front').hidden && !card.querySelector('.back').hidden, 'card ' + id + ' turns over');
      ok(card.querySelector('.back').textContent.indexOf(AYWords.whySituation(rw, null)) >= 0, 'its back says where they stood');
      if (since) {                                                 // the front counts since a change: the back must not give another number unexplained
        ok(card.querySelector('.front').textContent.indexOf(AYWords.knowChanged(nb.changedDay)) >= 0, 'the front of card ' + id + ' says it counts since the change');
        if (rw.source.type === 'own' && since.n !== rw.seen.n) {
          ok(card.querySelector('.back').textContent.indexOf(AYWords.whySince(since)) >= 0, 'the back of card ' + id + ' gives the count its front shows');
          pageBoth++;
        }
      }
      if (id !== 6) { card.querySelector('button[data-unturn]').click(); advance(600); ok(!card.querySelector('.front').hidden, 'card ' + id + ' turns back'); }
    });
    all('button[data-why]').filter(function (b) { return /^elsewhere-/.test(b.getAttribute('data-why')); }).forEach(function (b) {
      b.click(); ok(!byId('why-' + b.getAttribute('data-why')).hidden && b.getAttribute('aria-expanded') === 'true', 'an elsewhere Why? opens');
    });
    ok(all('button.quoted').length === 0, 'the mark goes once the card has been turned');
    readPage('revealed');
    if (stopAt.day === day) return quotedOn;
    byId('next-day').click();
    if (day % 4 === 0) {
      ok(st.phase === 'season' && !byId('season').hidden && byId('bank').hidden, "the season's end panel comes first");
      ok(byId('next-day').textContent === AYWords.nextLabel(day, true), 'next-day reads "' + byId('next-day').textContent + '"');
      byId('next-day').click();                                    // the second half of a double click or a double tap
      ok(st.phase === 'season' && !byId('season').hidden && st.choices.length === day && viewNow().getAttribute('data-view') === 'day',
         "a second press straight after the first does not pass the season's end unread");
      readPage("season's end");
      if (stopAt.season === day) return quotedOn;
      advance(500);                                                // the reader reads; then the same button goes on
      byId('next-day').click();
      ok(day === 12 ? st.view === 'leaving' : st.phase === 'choose' && st.today.day === day + 1, "next-day leaves the season's end once it has been up a moment");
    }
  }
  where = 'the page, valley ' + st.seed + ', leaving';
  ok(viewNow().getAttribute('data-view') === 'leaving', 'the leaving view follows day 12');
  ok(byId('leaving-store').textContent === AYWords.leavingStore(st.life.purse, st.life.need), 'the store is stated');
  ok(byId('leaving-ways').children.length === 5, 'five ways are left');
  readPage('leaving');
  return quotedOn;
}
function toTheCount(st) {
  where = 'the page, valley ' + st.seed + ', chronicle';
  byId('to-chronicle').click();
  ok(viewNow().getAttribute('data-view') === 'chronicle' && st.verdict && st.verdict === st.job.result, 'the Chronicle opens with the verdict');
  ok(byId('c-held').children.length === 200 && byId('c-base').children.length === 200, 'two rows of 200 marks');
  ok(byId('c-held').querySelectorAll('i.held').length === st.verdict.held.slice(0, 200).filter(Boolean).length, 'the marks follow held');
  ok(byId('c-seal').hidden === !st.verdict.seal.earned, 'the seal shows when earned, and only then');
  ok(byId('c-last-section').hidden === (st.verdict.lastDay === null), 'the last-day line shows whenever lastDay is not null');
  ok(all('.sc-mark').length === 2 && all('.sc-tick').length >= 1, 'the scale has its two markers and its ticks');
  all('.sc-mark').concat(all('.sc-tick')).forEach(function (m) { var at = parseFloat(m.style.left); ok(at >= 0 && at <= 100, 'a scale mark sits on the scale'); });
  ok(byId('c-valley-no').textContent === AYWords.valleyNo(st.seed), 'the valley number is printed');
  return readPage('chronicle');
}

// a. the hash fixes the valley; a whole Life; a few seconds of the Afterwards; Skip; the count
where = 'the page, opening';
var st = openPage('#valley-48213');
ok(viewNow().getAttribute('data-view') === 'opening', 'the opening is shown first');
ok(byId('opening-title').textContent === AYWords.title() && byId('op-lede').textContent === AYWords.opening()[0], 'the opening states the name and the premise');
ok(byId('op-lives').hidden, 'no earlier lives yet');
readPage('opening');
byId('begin').click();
ok(st.seed === 48213, 'Begin uses the valley in the hash');
ok(clickLife(st, WAYS[2].pick) > 0, 'the first habit learned from you was marked');
byId('leave').click();
where = 'the page, valley 48213, afterwards';
ok(viewNow().getAttribute('data-view') === 'afterwards', 'the Afterwards opens');
ok(all('.house').length === 8 && all('.tie').length === 16, 'the ring: eight houses, sixteen ties');
ok(!byId('skip').hidden && byId('to-chronicle').hidden && st.shown === 1, 'it starts at season 1 with Skip');
advance(5000, 50);
ok(st.shown >= 7 && st.shown <= 9 && byId('season-count').textContent === AYWords.seasonCount(st.shown), 'five seconds in, about a quarter is played (season ' + st.shown + ')');
ok(byId('flow-bars').children.length === 30 && byId('ticker').children.length <= st.events.length, 'bars and ticker follow the seasons');
readPage('afterwards, playing');
byId('skip').click();
ok(st.ended && st.shown === 30 && byId('skip').hidden && !byId('to-chronicle').hidden, 'Skip jumps to the end');
ok(byId('ticker').children.length === st.events.length, 'every told event is listed');
ok(byId('after-held').textContent === AYWords.futureEnd(st.future) && byId('after-yours').textContent === AYWords.yoursEnd(st.future), 'the end is stated');
ok(all('.house.yours').length === st.future.yourWaysAtEnd, 'the ring marks the houses that keep your ways at the end');
advance(3000, 50);
ok(st.job.done && byId('after-counting').hidden, 'the count finishes after Skip');
readPage('afterwards, ended');
var store = localStorage;
toTheCount(st);
ok(st.lives.length === 1 && JSON.parse(store.data['after-you.lives.v1']).length === 1, 'the Life is kept, once');

// b. the same valley again; no Skip, in a tab whose timers fire once a second
byId('again-same').click();
ok(viewNow().getAttribute('data-view') === 'day' && st.seed === 48213 && st.choices.length === 0, 'the same valley, from day 1');
clickLife(st, WAYS[0].pick);
byId('leave').click();
where = 'the page, valley 48213 again, afterwards';
advance(2000, 100); advance(19000, 1000);
ok(st.ended && st.shown === 30, 'it ends on the clock in a slow tab');
advance(4000, 1000);
ok(st.job.done, 'and the count finishes in large slices');
toTheCount(st);
ok(st.lives.length === 2 && !byId('c-lives').hidden && byId('c-lives-list').children.length === 1, 'the earlier life is listed');

// c. another life: a fresh valley; the count asked for at once
byId('again').click();
ok(viewNow().getAttribute('data-view') === 'day' && st.seed === 76789 && st.choices.length === 0, 'a fresh valley of five digits (' + st.seed + ')');
clickLife(st, WAYS[3].pick.bind(null));
byId('leave').click(); byId('skip').click();
where = 'the page, a fresh valley, afterwards';
ok(st.job.done || (!byId('after-counting').hidden && byId('after-counting').textContent === AYWords.counting(st.job)), 'the counting line shows while the count runs');
toTheCount(st);

// d. reduced motion: the end of the Afterwards at once; earlier lives on the opening
reducedMotion = true;
st = openPage('', undefined, store);
where = 'the page, reduced motion';
ok(!byId('op-lives').hidden && byId('op-lives-list').children.length === 3, 'earlier lives are listed on the opening');
readPage('opening with earlier lives');
byId('begin').click();
clickLife(st, WAYS[1].pick);
byId('leave').click();
ok(st.ended && st.shown === 30 && !byId('to-chronicle').hidden && byId('ticker').children.length === st.events.length, 'the final state and the events, without playing');
reducedMotion = false;

// e. a reload brings the Life back from its seed and its choices, wherever the reader was
function reloadAfter(run) {
  var s = openPage('#valley-777', {});
  byId('begin').click(); run(s);
  if (typeof snapFn !== 'function') fail('the page: no snapshot was registered');
  return openPage('', JSON.parse(JSON.stringify(snapFn())));
}
where = 'the page, reload';
st = reloadAfter(function (s) { clickLife(s, WAYS[0].pick, { day: 3 }); byId('next-day').click(); radio(1, 'send').click(); radio(6, 'stay').click(); });
ok(viewNow().getAttribute('data-view') === 'day' && st.seed === 777 && st.choices.length === 3 && byId('day-title').textContent === AYWords.dayTitle(4), 'back on day 4');
ok(radio(1, 'send').checked && radio(6, 'stay').checked && !radio(2, 'send').checked && byId('close-day').textContent === AYWords.closeLabel(2), 'with the choices made so far');
st = reloadAfter(function (s) { clickLife(s, WAYS[0].pick, { day: 5 }); });
ok(st.phase === 'reveal' && byId('day-title').textContent === AYWords.dayTitle(5) && !byId('next-day').hidden, 'back on a closed day');
readPage('reloaded, revealed');
st = reloadAfter(function (s) { clickLife(s, WAYS[0].pick, { season: 8 }); });
ok(st.phase === 'season' && !byId('season').hidden, "back at a season's end");
byId('next-day').click();
ok(byId('day-title').textContent === AYWords.dayTitle(9), 'and on to day 9');
st = reloadAfter(function (s) { clickLife(s, WAYS[0].pick); byId('leave').click(); byId('skip').click(); byId('to-chronicle').click(); });
ok(viewNow().getAttribute('data-view') === 'chronicle' && st.verdict && st.lives.length === 0, 'back at the Chronicle, not kept a second time');
readPage('reloaded, chronicle');
st = openPage('', { seed: 5, choices: 'nonsense', view: 'day' });
ok(viewNow().getAttribute('data-view') === 'opening', 'a broken snapshot falls back to the opening');

// f. storage that throws
where = 'the page, no storage';
st = openPage('#valley-12', undefined, { getItem: function () { throw new Error('no storage'); }, setItem: function () { throw new Error('no storage'); } });
byId('begin').click();
clickLife(st, WAYS[1].pick);
byId('leave').click(); byId('skip').click();
var lastPage = toTheCount(st);
ok(st.lives.length === 1, 'the page works with storage unavailable');

// g. a hash the engine cannot read as a valley: Begin still begins, in a fresh valley
where = 'the page, a hash that is no valley';
st = openPage('#valley-' + new Array(401).join('9'));
byId('begin').click();
ok(viewNow().getAttribute('data-view') === 'day' && st.seed === 76789 && st.choices.length === 0, 'Begin starts a fresh valley when the hash cannot be read');

where = 'the page, both counts';
ok(pageBoth > 0, 'at least one card turned on the page gave the whole count and the count since a change');

where = 'summary';
print('');
print('--- the page on a stand-in DOM: the Chronicle as shown for valley 12 ---');
print('  ' + lastPage.join(' | '));
print('');
print('part 1, words and engine: ' + lives.length + ' Lives (' + SEEDS.length + ' valleys x 3 ways of playing, and ' + (lives.length - SEEDS.length * 3) +
      ' contrary ones), ' + fullCount + ' with the full count of futures, the rest on ' + QUICK.futures);
print('  functions of AYWords called: ' + Object.keys(calls).length + ' of ' + Object.keys(calls).length);
print('  sentences checked: ' + sentences);
print('  time: ' + (T1 - T0).toFixed(1) + ' s');
print('part 2, the page on a stand-in DOM: 9 Lives clicked through index.html and app.js');
print('  checks passed: ' + pageChecks);
print('  texts on screen checked: ' + pageTexts);
print('  time: ' + (preciseTime() - T1).toFixed(1) + ' s');
print('page-smoke: OK');
