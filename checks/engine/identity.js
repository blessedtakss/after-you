// Proves that the engine plays the valley exactly as an earlier engine did, output for output: by default
// the working tree's engine.js against the v0.1.0 engine.js (the first published valley).
// Adapted from the engine map's identity.js (same 337 Lives, same ways, same JSON comparisons), plus:
//   - every new place parameter spelled out at its default as an override,
//   - the valley's own seats and range spelled out as explicit FOUNDERS and RANGE_WAYS,
//   - the valley chosen by key: createLife(seed, 'valley').
// Run by run-identity.sh (from the repository root, with the earlier engine taken out of git):
//   jsc -e "var OLD_ENGINE='<file>', OLD_LABEL='v0.1.0:engine.js'" checks/engine/identity.js
// OLD_ENGINE is the earlier engine (A); NEW_ENGINE (default 'engine.js', from the current folder) the one tested (B).
var SHIPPED = globalThis.OLD_ENGINE;
if (typeof SHIPPED !== 'string') throw new Error('identity.js: OLD_ENGINE (the earlier engine file) is not set; run checks/engine/run-identity.sh');
var NEW_FILE = typeof globalThis.NEW_ENGINE === 'string' ? globalThis.NEW_ENGINE : 'engine.js';
load(SHIPPED);
var A = globalThis.AfterYou;
globalThis.AfterYou = null;
load(NEW_FILE);
var B = globalThis.AfterYou;
if (A === B || !A || !B || !B.PLACES) throw new Error('two engines needed');

var NEW = 0, BOTH = 1, SHORTED = 2, OWING = 3, NEITHER = 4;

// Ways of playing (as in engine-map/identity.js). Each maker(AY, seed) returns decide(nb, T).
var WAYS = {
  'always': function () { return function () { return true; }; },
  'never': function () { return function () { return false; }; },
  'forgiving': function (AY, seed) {
    return function (nb, T) {
      if (nb.situation === NEW) return true;
      if (nb.yesterday.lost) return true;
      if (nb.situation === SHORTED) return AY.draw(seed, 101, T.day, 0, nb.id, 0) < 1 / 3;
      return nb.yesterday.they;
    };
  },
  'careful+last1': function () {          // the harness's careful, staying home against all on day 12
    var missed = {}, ever = {};
    return function (nb, T) {
      if (nb.yesterday) { missed[nb.id] = nb.yesterday.they ? 0 : (missed[nb.id] || 0) + 1; if (nb.yesterday.they) ever[nb.id] = true; }
      var owing = nb.seen[OWING], patient = (missed[nb.id] || 0) < 3, c;
      if (T.day === 1) c = true;
      else if (!ever[nb.id]) c = (nb.kin || nb.seen[NEW].h >= 1) && patient;
      else if (!nb.kin && owing.n >= 1 && owing.h / owing.n < 0.5) c = nb.situation !== SHORTED;
      else c = patient;
      return T.day === 12 ? false : c;
    };
  },
  'coin': function (AY, seed) {           // a keyed coin: reaches situations the tidy ways never do
    return function (nb, T) { return AY.draw(seed, 102, T.day, 0, nb.id, 0) < 0.6; };
  }
};

var count = { lives: 0, today: 0, playDay: 0, ways: 0, legacy: 0, life: 0, verdict: 0, runFuture: 0, project: 0, bytes: 0 }, bad = [];
var group = {};
function same(what, x, y, tag) {
  var a = JSON.stringify(x), b = JSON.stringify(y);
  count[what]++; count.bytes += a.length;
  if (a !== b) bad.push(tag + ' ' + what);
}
// The places engine's params carry the new keys and a Life made by key records it; everything
// else must match byte for byte.
function strip(life) {
  var c = JSON.parse(JSON.stringify(life));
  delete c.params; delete c.place;
  if (c.lastDay) { delete c.lastDay.before.params; delete c.lastDay.before.place; }
  return c;
}

// makeB(seed) -> the places engine's Life for the same valley.
function runPair(label, seed, wayName, overrides, makeB, futures, deep) {
  var tag = label + ' seed ' + seed + ' ' + wayName + (overrides ? ' ' + JSON.stringify(overrides) : '') + ' @' + futures;
  var la = A.createLife(seed, overrides), lb = makeB(seed);
  var da = WAYS[wayName](A, la.seed), db = WAYS[wayName](B, lb.seed);
  count.lives++; group[label] = (group[label] || 0) + 1;
  same('today', A.today(la), B.today(lb), tag + ' day 0');
  while (!la.over) {
    var Ta = A.today(la), Tb = B.today(lb), ca = {}, cb = {};
    Ta.neighbours.forEach(function (nb) { ca[nb.id] = da(nb, Ta); });
    Tb.neighbours.forEach(function (nb) { cb[nb.id] = db(nb, Tb); });
    same('playDay', A.playDay(la, ca), B.playDay(lb, cb), tag + ' day ' + Ta.day);
    same('today', A.today(la), B.today(lb), tag + ' after day ' + Ta.day);
    same('ways', A.ways(la), B.ways(lb), tag + ' day ' + Ta.day);
  }
  same('legacy', A.legacy(la), B.legacy(lb), tag);
  same('life', strip(la), strip(lb), tag);
  var opt = futures ? { futures: futures, whatIfFutures: futures } : undefined;
  same('verdict', A.verdict(la, opt), B.verdict(lb, opt), tag);
  if (deep) {
    for (var i = 0; i < 3; i++) same('runFuture', A.runFuture(la, i), B.runFuture(lb, i), tag + ' future ' + i);
    same('runFuture', A.runFuture(la, 5, { history: 'old' }), B.runFuture(lb, 5, { history: 'old' }), tag + ' old future');
    same('runFuture', A.runFuture(la, 6, { whatIf: { situation: 2, toward: 'help' } }), B.runFuture(lb, 6, { whatIf: { situation: 2, toward: 'help' } }), tag + ' what-if future');
    same('project', A.project(la, { custom: [1, 1, 0.5, 1, 0.5], futures: 60, lateFlows: true }), B.project(lb, { custom: [1, 1, 0.5, 1, 0.5], futures: 60, lateFlows: true }), tag);
    same('project', A.project(la, { lastDay: true, futures: 60 }), B.project(lb, { lastDay: true, futures: 60 }), tag + ' lastDay');
    same('project', A.project(la, { history: 'old', futures: 60, from: 300 }), B.project(lb, { history: 'old', futures: 60, from: 300 }), tag + ' old');
  }
}

var t0 = preciseTime(), names = Object.keys(WAYS), seed, tg = {};
function plain(ov) { return function (s) { return B.createLife(s, ov); }; }
// 1. 60 seeds x 5 ways at 300 futures (what-ifs, range and last-day replay included).
tg[1] = preciseTime();
for (seed = 1; seed <= 60; seed++) names.forEach(function (w) { runPair('1', seed, w, null, plain(null), 300, seed <= 12); });
// 2. Three seeds x 5 ways at the shipped default: 2000 futures behind the headline, 1000 behind the rest.
[3, 17, 4242].forEach(function (s) { names.forEach(function (w) { runPair('2', s, w, null, plain(null), 0, false); }); });
// 3. String seeds and the valley's own tunables pass through the same code.
['harvest', '0042'].forEach(function (s) { runPair('3', s, 'forgiving', null, plain(null), 300, true); });
[{ FOG: 0.08 }, { R_LIFE: 2, R_AFTER: 1.5 }, { MUT: 0, K: 0.3, HOLD_LINE: 0.55 }, { MARGIN: 5, NEED_WEIGHT: 1 }, { ARRIVE_FROM: 2, ARRIVE_TO: 20 }].forEach(function (ov, k) {
  for (seed = 101; seed <= 104; seed++) runPair('3', seed, names[(k + seed) % names.length], ov, plain(ov), 200, true);
});
var base337 = count.lives, t337 = preciseTime() - tg[1];

// 4. Every new place parameter spelled out at its default, as an override: 12 seeds x 5 ways.
var SPELLED = { B: 3, C: 1, S: 0, H: 0, CUSTOM: [1, 1, 0, 1, 0], STORE_START: 0, STOCK: null, FLOW_KIND: 'hands',
                CHARTER: 'holds', REPLAY: 'valley', RANGE_WAYS: null, FOUNDERS: null };
for (seed = 201; seed <= 212; seed++) names.forEach(function (w) { runPair('4 spelled', seed, w, null, plain(SPELLED), 300, seed <= 203); });
// 5. The valley's seats and range written out as explicit FOUNDERS and RANGE_WAYS: 6 seeds x 5 ways.
var VALLEY_EXPLICIT = { FOUNDERS: { near: ['taker', 'soft', ['firm', 'wary', 'steady']], far: ['firm', 'firm', 'firm', 'soft', 'wary', 'steady'] },
                        RANGE_WAYS: A.RANGE_WAYS.map(function (w) { return w.slice(); }) };
for (seed = 301; seed <= 306; seed++) names.forEach(function (w) { runPair('5 explicit', seed, w, null, plain(VALLEY_EXPLICIT), 300, seed <= 302); });
// 6. The valley chosen by key, as the page will: createLife(seed, 'valley'): 6 seeds x 5 ways.
for (seed = 401; seed <= 406; seed++) names.forEach(function (w) { runPair('6 key', seed, w, null, function (s) { return B.createLife(s, 'valley'); }, 300, seed <= 402); });
// 7. The key with a valley tunable on top: createLife(seed, 'valley', { FOG: 0.08 }) = shipped createLife(seed, { FOG: 0.08 }).
for (seed = 501; seed <= 503; seed++) names.forEach(function (w) { runPair('7 key+override', seed, w, { FOG: 0.08 }, function (s) { return B.createLife(s, 'valley', { FOG: 0.08 }); }, 200, seed === 501); });

// The key is recorded; the earlier forms record none.
var keyOk = B.createLife(9, 'valley').place === 'valley' && !('place' in B.createLife(9)) && !('place' in B.createLife(9, { FOG: 0.05 })) &&
            !('stock' in B.createLife(9)) && B.createLife(9, 'banks').place === 'banks';

var OLD_NAME = typeof globalThis.OLD_LABEL === 'string' ? globalThis.OLD_LABEL : SHIPPED;
print('identity: the earlier engine (' + OLD_NAME + ') against ' + NEW_FILE + ' in the valley');
print('  shipped: ' + OLD_NAME);
print('  Lives compared: ' + count.lives + ' = ' + base337 + ' (engine-map identity set: 60 seeds x 5 ways at 300 futures, 3 seeds x 5 ways at the default 2000 / 1000, 22 with string seeds or valley tunables moved; ' +
      t337.toFixed(1) + ' s) + ' + Object.keys(group).filter(function (g) { return g.length > 1; }).map(function (g) { return group[g] + ' "' + g + '"'; }).join(' + '));
print('  ways of playing: ' + names.join(', '));
print('  JSON strings compared: today() ' + count.today + ', playDay() ' + count.playDay + ', ways() ' + count.ways + ', legacy() ' + count.legacy +
      ', whole life state less params (and place) ' + count.life + ', verdict() ' + count.verdict + ', runFuture() ' + count.runFuture + ', project() ' + count.project);
print('  total ' + (count.today + count.playDay + count.ways + count.legacy + count.life + count.verdict + count.runFuture + count.project) +
      ' comparisons, ' + (count.bytes / 1e6).toFixed(1) + ' MB of JSON, ' + bad.length + ' differ');
print('  life.place recorded only for a key, no stock field in the valley: ' + keyOk);
if (bad.length) print('  FIRST DIFFERENCES: ' + bad.slice(0, 10).join(' | '));
print((bad.length === 0 && keyOk ? 'PASS' : 'FAIL') + '  the valley is unchanged  (' + (preciseTime() - t0).toFixed(1) + ' s)');
