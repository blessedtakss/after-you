// After You: gate runner (specification section 4).
// Run:  cd "<this folder>" && "$JSC" harness.js
// Prints the measured numbers for every gate and one PASS/FAIL line per gate.
// Other scripts may set  globalThis.HARNESS_LIB = true  before load('harness.js') to get
// globalThis.Harness without running the gates.
//
// How the gates are measured (and why):
//   - "Share of seeds in which the need is met" (G1, and the need column of G10) needs no futures,
//     so it is taken over 6000 seeds.
//   - Mean marks (G2, G10) come from 120 seeds at 200 futures per verdict, as the specification says.
//   - G6 is the specification's statistic with the selection bias taken out: the what-if with the
//     largest effect is picked exactly as section 2.7 says, and its effect is then measured on
//     futures the pick never saw. Read off the futures it was picked on, the largest of ten noisy
//     differences clears 5 points by noise alone in many Lives. The wording read to the letter,
//     and the stricter reading (only a habit verdict() itself dares to name), are printed beside it.
//   - Besides the specification's policies the list holds recipes that use only what the screen
//     shows and still play well or take well (careful, cold-opener, their grabbing versions, the
//     sharpest day-12 grab, milker), so that G10 is tested against a competent player and not
//     only against weak ones.
//   - X1 and X2 are checks added after review. They are not in the specification; their
//     thresholds are stated on their lines. Other lines marked "beyond the specification" are
//     measurements, not gates.
load('engine.js');

(function () {
  'use strict';
  var AY = AfterYou;
  var NEW = 0, BOTH = 1, SHORTED = 2, OWING = 3, NEITHER = 4;
  var OLD_WAY = [1, 1, 0, 1, 0];
  var POLICY_DRAW = 101;     // the harness's own keyed draw, for "one time in three"
  var THEIRS = [0, 1, 3, 2, 4];     // my situation on a tie -> the neighbour's

  // ---- policies that live the Life ------------------------------------------------------------
  // Each maker takes ctx = { seed, archetypes, fog } and returns decide(nb, T) -> true (send a
  // hand) | false (stay home), where T = today(life) and nb is one entry of T.neighbours. decide
  // is called once per neighbour per day, in order. A policy sees only that; ctx.seed feeds the
  // policy's own coin and ctx.archetypes is read by the `reader` family alone.

  function plainRule(nb) { return nb.situation === NEW ? true : nb.yesterday.they; }

  function forgiving(ctx) {
    return function (nb, T) {
      if (nb.situation === NEW) return true;
      if (nb.yesterday.lost) return true;                     // always sends after its own accident
      if (nb.situation === SHORTED) return AY.draw(ctx.seed, POLICY_DRAW, T.day, 0, nb.id, 0) < 1 / 3;
      return nb.yesterday.they;
    };
  }

  // reader: knows the archetypes and uses, with each, the repair that works with it.
  function reader(ctx) {
    var missed = {};         // days running each neighbour's hand has failed to come
    return function (nb, T) {
      var kind = ctx.archetypes[nb.id];
      if (nb.yesterday) missed[nb.id] = nb.yesterday.they ? 0 : (missed[nb.id] || 0) + 1;
      if (kind === 'taker') return T.day === 1;               // never sends to the taker after day 1
      if (kind === 'steady') {
        // A steady house answers a miss by staying home once and then starting over, and goes on
        // taking from a house that keeps sending. The repair that works with it is to do the same.
        return nb.situation === NEW || nb.situation === BOTH || nb.situation === NEITHER;
      }
      if (kind === 'wary' && T.day <= 2) return true;         // opens twice to a wary neighbour
      // kin, firm, soft, wary: forgive lapses and repair accidents by sending anyway, until
      // the neighbour has stayed away three days running.
      return (missed[nb.id] || 0) < 3;
    };
  }
  // The same with section 4's wording taken to the letter: it forgives and repairs by sending
  // again with every helping neighbour, the steady one included. Reported next to `reader`.
  function readerLiteral(ctx) {
    var missed = {};
    return function (nb, T) {
      var kind = ctx.archetypes[nb.id];
      if (nb.yesterday) missed[nb.id] = nb.yesterday.they ? 0 : (missed[nb.id] || 0) + 1;
      if (kind === 'taker') return T.day === 1;
      if (kind === 'wary' && T.day <= 2) return true;
      return (missed[nb.id] || 0) < 3;
    };
  }

  // careful: what a competent player can do from the screen alone.
  //   Day 1: send to all four (cold: to kin only).
  //   A neighbour that has never got a hand through to you: stay home, unless it is kin or you
  //     have seen it send to someone new; those are treated like any other neighbour.
  //   A neighbour seen to stay home after leaving someone short (its "After you left them short"
  //     tally is under half): send unless it left you short yesterday.
  //   Otherwise: send until its hand has failed to come three days running.
  function careful(cold) {
    return function () {
      var missed = {}, ever = {};
      return function (nb, T) {
        if (nb.yesterday) { missed[nb.id] = nb.yesterday.they ? 0 : (missed[nb.id] || 0) + 1; if (nb.yesterday.they) ever[nb.id] = true; }
        var owing = nb.seen[OWING], patient = (missed[nb.id] || 0) < 3;
        if (T.day === 1) return cold ? nb.kin : true;
        if (!ever[nb.id]) return (nb.kin || nb.seen[NEW].h >= 1) && patient;
        if (!nb.kin && owing.n >= 1 && owing.h / owing.n < 0.5) return nb.situation !== SHORTED;
        return patient;
      };
    };
  }

  // The same policy, but staying home against everyone on the last n days.
  function lastDays(maker, n) {
    return function (ctx) {
      var inner = maker(ctx);
      return function (nb, T) { var c = inner(nb, T); return T.day > 12 - n ? false : c; };
    };
  }
  // The same policy, but on day 12 it stays home against everyone if the store is still more
  // than `gap` measures short of the need.
  function grabIfShort(maker, gap) {
    return function (ctx) {
      var inner = maker(ctx);
      return function (nb, T) { var c = inner(nb, T); return T.day === 12 && T.need - T.purse > gap ? false : c; };
    };
  }

  // The same policy, but on day 12 it takes exactly when taking is what keeps the house, and
  // no more than it takes. It expects a hand from a neighbour who has mostly sent one in the
  // situation that neighbour is now in (what the screen shows of them) or, where the screen
  // shows nothing of that situation yet, from a neighbour it is on good terms with ("after you
  // both helped"). If sending wherever the policy would send leaves the store short of the
  // need, and staying home against some of those neighbours would fill it, it stays home
  // against just that many (each hand not sent is one measure kept): first those it is not on
  // good terms with, then the others. Otherwise it plays the day as the policy would. This is
  // the sharpest day-12 grab found that uses only the screen: it spends the valley only where
  // the grab decides, and as little of it as will do.
  function grabIfDecides(maker) {
    return function (ctx) {
      var inner = maker(ctx), plan = null;
      return function (nb, T) {
        if (T.day !== 12) return inner(nb, T);
        if (!plan) {               // first call of day 12: ask the policy about all four, in order
          plan = {};
          var store = T.purse, sends = [];
          T.neighbours.forEach(function (x) {
            var theirs = x.seen[THEIRS[x.situation]];
            plan[x.id] = inner(x, T);
            if (theirs.n ? theirs.h * 2 >= theirs.n : x.situation === BOTH) store += 3;
            if (plan[x.id]) { store -= 1; sends.push(x); }
          });
          var short = T.need - store;
          if (short > 0 && short <= sends.length) {
            sends.sort(function (p, q) { return (p.situation === BOTH ? 1 : 0) - (q.situation === BOTH ? 1 : 0); });
            for (var i = 0; i < short; i++) plan[sends[i].id] = false;
          }
        }
        return plan[nb.id];
      };
    };
  }

  // The best reply in grain to a neighbour whose custom q is known, with `daysLeft` days to go.
  function bestReply(q, daysLeft, sit, fog) {
    var V = [0, 0, 0, 0, 0], act = null, d, s, k;
    var outcomes = [[1, 1], [1, 0], [0, 1], [0, 0]];
    for (d = 0; d < daysLeft; d++) {
      var NV = [0, 0, 0, 0, 0], A = [false, false, false, false, false];
      for (s = 0; s < 5; s++) {
        var pt = q[THEIRS[s]] * (1 - fog), best = -1e9;
        for (var send = 1; send >= 0; send--) {
          var pm = send ? 1 - fog : 0, v = 0;
          for (k = 0; k < 4; k++) {
            var o = outcomes[k], pr = (o[0] ? pm : 1 - pm) * (o[1] ? pt : 1 - pt);
            if (pr > 0) v += pr * (3 * o[1] - o[0] + V[4 - 2 * o[0] - o[1]]);
          }
          if (v > best + 1e-12) { best = v; A[s] = send === 1; }
        }
        NV[s] = best;
      }
      V = NV; act = A;
    }
    return act[sit];
  }
  // milker: the largest take found that uses only the screen. It plays the cold-opening careful
  // game for two seasons. Kin's habits are the player's own tallies as they stood at the last
  // season's end, so from day 9 it plays the best reply in grain to exactly that custom; from
  // day 9 it does the same to any neighbour seen to send after being left short at least 3 times
  // in 5 (taken as a house that forgives at the rate seen); and on day 12 it stays home against
  // everyone else.
  function milker(ctx) {
    var inner = careful(true)(ctx), kinCustom = OLD_WAY.slice(), h = [0, 0, 0, 0, 0], n = [0, 0, 0, 0, 0], day = 0, mine = [];
    return function (nb, T) {
      var s;
      if (T.day !== day) {       // a new day: book yesterday's own choices, then note what kin now knows
        for (s = 0; s < mine.length; s++) { n[mine[s][0]]++; if (mine[s][1]) h[mine[s][0]]++; }
        mine = [];
        if (T.day === 5 || T.day === 9) for (s = 0; s < 5; s++) if (n[s] >= 1) kinCustom[s] = h[s] / n[s];
        day = T.day;
      }
      var c = inner(nb, T), short = nb.seen[SHORTED];
      if (T.day >= 9) {
        if (nb.kin) c = bestReply(kinCustom, 13 - T.day, nb.situation, ctx.fog);
        else if (short.n >= 2 && short.h / short.n >= 0.6) { var r = short.h / short.n; c = bestReply([1, 1, r, 1, r], 13 - T.day, nb.situation, ctx.fog); }
        else if (T.day === 12) c = false;
      }
      mine.push([nb.situation, c]);
      return c;
    };
  }

  var POLICIES = {
    'saint': function () { return function () { return true; }; },
    'hawk': function () { return function () { return false; }; },
    'plain': function () { return plainRule; },
    'forgiving': forgiving,
    'reader': reader,
    'reader+last1': lastDays(reader, 1),
    'reader+last2': lastDays(reader, 2),
    'reader+last3': lastDays(reader, 3),
    'forgiving+last1': lastDays(forgiving, 1),
    'soft-grabber': function (ctx) {
      // As forgiving, but stays home against any neighbour seen to send a hand after being left short.
      var inner = forgiving(ctx);
      return function (nb, T) { var c = inner(nb, T); return nb.seen[SHORTED].h >= 1 ? false : c; };
    },
    // beyond the specification's list
    'reader-literal': readerLiteral,
    'reader-literal+last1': lastDays(readerLiteral, 1),
    'careful': careful(false),
    'careful+last1': lastDays(careful(false), 1),
    'cold-opener': careful(true),
    'cold-opener+last1': lastDays(careful(true), 1),
    'cold-opener+grab-if-short': grabIfShort(careful(true), 3),
    'reader+grab-if-decides': grabIfDecides(reader),
    'careful+grab-if-decides': grabIfDecides(careful(false)),
    'milker': milker
  };
  var SPEC_POLICIES = ['saint', 'hawk', 'plain', 'forgiving', 'reader', 'reader+last1', 'reader+last2', 'reader+last3',
                       'forgiving+last1', 'soft-grabber'];
  var EXTRA_POLICIES = ['reader-literal', 'reader-literal+last1', 'careful', 'careful+last1', 'cold-opener', 'cold-opener+last1',
                        'cold-opener+grab-if-short', 'reader+grab-if-decides', 'careful+grab-if-decides', 'milker'];
  var POLICY_NAMES = SPEC_POLICIES.concat(EXTRA_POLICIES);
  var MIRROR_POLICIES = ['plain', 'forgiving', 'reader'];

  // Lives one Life. Returns the finished life, the choices made, the day results, and what the
  // kin mirror showed on days 5..12:
  //   mirror   kin acted toward the player from a habit sourced "from you" with a dated deed (G8)
  //   outside  the same, in a situation other than "after both helped"
  //   unlike   the same, from a habit that differs from the old way's, with kin's visible act
  //            being the one the old way would not have made
  //   around   kin acted "from you" outside "after both helped" toward the player OR toward
  //            another neighbour the player can see (playDay().kinWith)
  function live(seed, policy, overrides, script) {
    var life = AY.createLife(seed, overrides), archetypes = {};
    life.houses.forEach(function (h) { archetypes[h.id] = h.archetype; });
    var maker = typeof policy === 'function' ? policy : POLICIES[policy];
    var decide = maker({ seed: life.seed, archetypes: archetypes, fog: life.params.FOG }), choices = [], days = [];
    var seenMirror = { mirror: false, outside: false, unlike: false, around: false };
    function fromYou(why) { return why.source.type === 'you' && why.source.deeds.length >= 1; }
    while (!life.over) {
      var T = AY.today(life), ch = {};
      T.neighbours.forEach(function (nb) { ch[nb.id] = decide(nb, T); });
      if (script) ch = script(T.day, ch);
      var r = AY.playDay(life, ch);
      choices.push(ch); days.push(r);
      if (r.day >= 5) {
        r.results.forEach(function (x) {
          if (!x.kin || !fromYou(x.why)) return;
          seenMirror.mirror = true;
          if (x.why.situation !== BOTH) { seenMirror.outside = true; seenMirror.around = true; }
          var old = OLD_WAY[x.why.situation];
          if (x.why.habit !== old && x.they !== (old === 1)) seenMirror.unlike = true;
        });
        r.kinWith.forEach(function (x) { if (fromYou(x.why) && x.why.situation !== BOTH) seenMirror.around = true; });
      }
    }
    return { life: life, choices: choices, days: days, mirror: seenMirror.mirror, mirrors: seenMirror };
  }

  // ---- small statistics ------------------------------------------------------------------------

  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; }
  function median(a) { var b = a.slice().sort(function (x, y) { return x - y; }), k = b.length >> 1; return b.length % 2 ? b[k] : (b[k - 1] + b[k]) / 2; }
  function share(a, test) { var k = 0; for (var i = 0; i < a.length; i++) if (test(a[i])) k++; return a.length ? 100 * k / a.length : 0; }
  function corr(a, b) {
    var ma = mean(a), mb = mean(b), s = 0, sa = 0, sb = 0;
    for (var i = 0; i < a.length; i++) { s += (a[i] - ma) * (b[i] - mb); sa += (a[i] - ma) * (a[i] - ma); sb += (b[i] - mb) * (b[i] - mb); }
    return sa && sb ? s / Math.sqrt(sa * sb) : 0;
  }
  function f1(x) { return x.toFixed(1); }
  function sg(x) { return (x >= 0 ? '+' : '') + x.toFixed(1); }
  function pad(s, n) { s = String(s); while (s.length < n) s = ' ' + s; return s; }
  function padr(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }
  function seedRange(a, b) { var s = []; for (var i = a; i <= b; i++) s.push(i); return s; }

  // ---- the need, over many seeds (no futures needed) --------------------------------------------

  // For each policy: kept[i] (0/1) and purse[i] per seed, plus the old way's purse per seed.
  function wideSample(seeds, overrides, names) {
    names = names || POLICY_NAMES;
    var out = { seeds: seeds.length, kept: {}, purse: {}, met: {}, meanPurse: {}, old: [], need: [] };
    names.forEach(function (p) { out.kept[p] = []; out.purse[p] = []; });
    seeds.forEach(function (seed) {
      names.forEach(function (p, k) {
        var life = live(seed, p, overrides).life;
        out.kept[p].push(life.purse >= life.need ? 1 : 0);
        out.purse[p].push(life.purse);
        if (k === 0) { out.old.push(life.old.purse); out.need.push(life.need); }
      });
    });
    names.forEach(function (p) { out.met[p] = 100 * mean(out.kept[p]); out.meanPurse[p] = mean(out.purse[p]); });
    return out;
  }
  function g1Parts(met, purseGap) {
    return {
      'reader 40..70': met.reader >= 40 && met.reader <= 70,
      'reader+last1 at least 12 points above reader': met['reader+last1'] - met.reader >= 12,
      'forgiving 10..50': met.forgiving >= 10 && met.forgiving <= 50,
      'saint <= 30': met.saint <= 30,
      'hawk <= 20': met.hawk <= 20,
      'plain = 0': met.plain === 0,
      'purse of reader+last1 at least 2 above reader': purseGap >= 2
    };
  }
  function allTrue(parts) { return Object.keys(parts).every(function (k) { return parts[k]; }); }
  // How one policy and its day-12 grab divide the Lives: kept anyway, kept only by the grab,
  // lost even with it.
  // needOf(i), when given, replaces the Life's own need (to show the same Lives under another rule;
  // sound for policies that never look at the need).
  function decisive(wide, honest, grabbing, needOf) {
    var a = wide.kept[honest], b = wide.kept[grabbing], home = 0, dec = 0, lost = 0;
    for (var i = 0; i < a.length; i++) {
      var ka = needOf ? wide.purse[honest][i] >= needOf(i) : a[i], kb = needOf ? wide.purse[grabbing][i] >= needOf(i) : b[i];
      if (ka) home++; else if (kb) dec++; else lost++;
    }
    return { kept: 100 * home / a.length, decides: 100 * dec / a.length, lost: 100 * lost / a.length };
  }
  // Share of Lives kept, by quarter of the old way's purse on the same tape (lowest quarter first).
  function byOldQuarter(wide, policy, needOf) {
    var idx = wide.old.map(function (o, i) { return i; }).sort(function (x, y) { return wide.old[x] - wide.old[y] || x - y; }), q = Math.floor(idx.length / 4), out = [];
    for (var k = 0; k < 4; k++) {
      var part = idx.slice(k * q, (k + 1) * q);
      out.push(100 * part.filter(function (i) { return needOf ? wide.purse[policy][i] >= needOf(i) : wide.kept[policy][i]; }).length / part.length);
    }
    return out;
  }

  // ---- G4: grid of heir customs ----------------------------------------------------------------

  var NAMED = {
    'always-help': [1, 1, 1, 1, 1], 'always-hold': [0, 0, 0, 0, 0], 'mirror': [1, 1, 0, 1, 0],
    'win-stay-lose-shift': [1, 1, 0, 0, 1], 'generous mirror': [1, 1, 0.5, 1, 0.5]
  };
  function grid() {
    var out = [], v = [0, 0.5, 1], a, b, c, d, e;
    for (a = 0; a < 3; a++) for (b = 0; b < 3; b++) for (c = 0; c < 3; c++) for (d = 0; d < 3; d++) for (e = 0; e < 3; e++)
      out.push([v[a], v[b], v[c], v[d], v[e]]);
    return out;
  }
  // Heir and kin both carry the custom, in the valley as the old-way Life leaves it.
  function gridSearch(seed, overrides, futures) {
    var life = AY.createLife(seed, overrides), rows = grid().map(function (c) {
      var p = AY.project(life, { history: 'old', custom: c, futures: futures });
      return { custom: c, holdsPct: p.holdsPct, lateFlow: p.lateFlow };
    });
    // Best by holdsPct; ties are settled by late help flow so the order is not an accident of the grid.
    rows.sort(function (x, y) { return y.holdsPct - x.holdsPct || y.lateFlow - x.lateFlow; });
    rows.forEach(function (r, i) { r.rank = i + 1; });
    return rows;
  }
  function same(a, b) { for (var i = 0; i < 5; i++) if (a[i] !== b[i]) return false; return true; }

  // ---- G5: determinism --------------------------------------------------------------------------

  // cfg: { seeds: [..], days: [..], futures } One decision is flipped at a time (each listed day,
  // each of the four neighbours, each listed seed) and the two runs are compared.
  function determinism(cfg, overrides) {
    var out = { identical: true, flips: 0, ford: 0, fordBad: 0, other: 0, otherBad: 0, onlyOne: 0, sameDayOthers: true,
                lostAgree: true, structure: true, afterwards: true, changedResults: 0, day3Flips: 0 };
    function everything(run) {
      return JSON.stringify([run.life, run.days, AY.verdict(run.life, { futures: cfg.futures, whatIfFutures: cfg.futures }), AY.runFuture(run.life, 3)]);
    }
    // Everything a Life decides that no choice of the player may touch.
    function skeleton(run) {
      return JSON.stringify([run.life.need, run.life.kin, run.life.old.purse,
        run.life.rounds.map(function (rd) { return rd.reconsidered.map(function (e) { return [e.house, e.model]; }); })]);
    }
    function arrivals(run) {
      return JSON.stringify([0, 1, 2, 3].map(function (i) { var a = AY.runFuture(run.life, i).arrival; return [a.season, a.name]; }));
    }
    function traced(seed, script) {
      var tape = {}, count = 0, clash = 0;
      AY.trace = function (purpose, t, a, b, f, u) {
        var k = purpose + ':' + t + ':' + a + ':' + b + ':' + f;
        if (!(k in tape)) count++; else if (tape[k] !== u) clash++;     // one key, two values: not keyed
        tape[k] = u;
      };
      var run = live(seed, 'forgiving', overrides, script);
      AY.verdict(run.life, { futures: 12, whatIfs: false, range: false });
      AY.trace = null;
      return { run: run, tape: tape, count: count, clash: clash };
    }
    cfg.seeds.forEach(function (seed) {
      if (everything(live(seed, 'forgiving', overrides)) !== everything(live(seed, 'forgiving', overrides))) out.identical = false;
      var A = traced(seed, null), fordCode = AY.PURPOSES.FORD + ':';
      if (A.clash) out.otherBad += A.clash;
      cfg.days.forEach(function (day) {
        A.run.life.neighbours.forEach(function (flipped) {
          var B = traced(seed, function (d, ch) {
            var c = {}; for (var id in A.run.choices[d - 1]) c[id] = A.run.choices[d - 1][id];
            if (d === day) c[flipped] = !c[flipped];
            return c;
          });
          var k;
          out.flips++; if (day === 3) out.day3Flips++;
          if (B.clash) out.otherBad += B.clash;
          for (k in A.tape) {
            if (!(k in B.tape)) { out.onlyOne++; continue; }
            if (k.indexOf(fordCode) === 0) { out.ford++; if (A.tape[k] !== B.tape[k]) out.fordBad++; }
            else { out.other++; if (A.tape[k] !== B.tape[k]) out.otherBad++; }
          }
          for (k in B.tape) if (!(k in A.tape)) out.onlyOne++;
          if (skeleton(A.run) !== skeleton(B.run)) out.structure = false;
          if (arrivals(A.run) !== arrivals(B.run)) out.afterwards = false;
          // The other three ties on the flipped day must play out exactly as before, and wherever
          // the player meant to send on the same day to the same house in both runs, the ford agrees.
          A.run.days.forEach(function (dayA, i) {
            dayA.results.forEach(function (ra, j) {
              var rb = B.run.days[i].results[j];
              if (i === day - 1 && ra.id !== flipped && JSON.stringify(ra) !== JSON.stringify(rb)) out.sameDayOthers = false;
              if (ra.intended && rb.intended && ra.lost !== rb.lost) out.lostAgree = false;
              if (JSON.stringify(ra) !== JSON.stringify(rb)) out.changedResults++;
            });
          });
        });
      });
    });
    return out;
  }

  // ---- G6: the habit that mattered most, without the selection bias --------------------------------

  // The specification's statistic: of the ten what-ifs take the one with the largest absolute
  // effect (section 2.7) and ask whether it moves holdsPct by 5 points. Read off the futures it
  // was picked on, that number is inflated: it is the largest of ten noisy differences. So the
  // pick is made exactly as the specification says, on verdict()'s own what-ifs, and its effect
  // is then measured on `futures` fresh futures the pick never saw, signed by the pick (a habit
  // that points the other way on fresh futures counts against).
  //   literal   |effect| of the pick on the futures it was picked on (the wording to the letter)
  //   fresh     the pick's effect on fresh futures: the gate
  //   named     the same for the habit verdict() itself names, 0 when it names none (it names
  //             only a way the player wrote, and only if it clears three standard errors):
  //             stricter than the specification
  function largestOfTen(life, futures) {
    var pick = null;
    AY.verdict(life, { futures: futures, whatIfFutures: futures, range: false, lastDay: false }).whatIfs.forEach(function (w) {
      if (!pick || Math.abs(w.delta) > Math.abs(pick.delta)) pick = w;
    });
    return Math.abs(pick.delta);
  }
  function habitMatters(life, futures) {
    var v = AY.verdict(life, { futures: futures, whatIfFutures: futures, range: false, lastDay: false }), pick = null, base = null;
    v.whatIfs.forEach(function (w) { if (!pick || Math.abs(w.delta) > Math.abs(pick.delta)) pick = w; });
    function fresh(w) {
      if (w.delta === 0) return 0;
      if (base === null) base = AY.project(life, { futures: futures, from: futures }).holdsPct;
      var a = AY.project(life, { whatIf: { situation: w.situation, toward: w.toward }, futures: futures, from: futures }).holdsPct;
      return w.delta > 0 ? a - base : base - a;
    }
    var m = v.mattered, out = { literal: Math.abs(pick.delta), fresh: fresh(pick), named: 0, none: !m || m.kind !== 'habit' };
    if (!out.none) out.named = m.situation === pick.situation && m.toward === pick.toward ? out.fresh : fresh(m);
    return out;
  }

  // ---- telling the neighbours apart (beyond the specification) ----------------------------------

  // An observer who knows the five founder bands and the ford's rate, and reads nothing but the
  // tallies the screen shows at the start of `day`, names a non-kin neighbour's kind when its
  // share of the likelihood is at least 80%. If even this observer cannot, no player can.
  // (archetype is read here only to score the observer.) Returns the share of Lives in which
  // all three non-kin neighbours are named: from `seen` as the engine gives it, and from the
  // near ties alone (seen minus seenFar: section 2.5 to the letter).
  var KINDS = ['firm', 'soft', 'taker', 'wary', 'steady'];
  function kindLikelihood(kind, tally, fog) {
    var G = 12, i, j, tot = 0, cnt = 0, s;
    function binom(h, n, q) { return Math.pow(q, h) * Math.pow(1 - q, n - h); }
    function L(c) { var p = 1; for (var s2 = 0; s2 < 5; s2++) if (tally[s2].n) p *= binom(tally[s2].h, tally[s2].n, c[s2] * (1 - fog)); return p; }
    function at(lo, hi, k) { return lo + (hi - lo) * (k + 0.5) / G; }
    if (kind === 'firm') { for (i = 0; i < G; i++) for (j = 0; j < G; j++) { tot += L([1, 1, at(0.05, 0.2, i), 1, at(0.3, 0.5, j)]); cnt++; } return tot / cnt; }
    if (kind === 'soft') { for (i = 0; i < G; i++) { var m = at(0.7, 1.0, i); tot += L([1, 1, m, 1, m]); cnt++; } return tot / cnt; }
    if (kind === 'taker') { for (i = 0; i < G; i++) { var x = at(0, 0.15, i); tot += L([0, x, 0, x, 0]); cnt++; } return tot / cnt; }
    if (kind === 'wary') { for (i = 0; i < G; i++) for (j = 0; j < G; j++) { tot += L([0, 1, at(0, 0.15, i), 1, at(0.3, 0.5, j)]); cnt++; } return tot / cnt; }
    var out = 1, base = [1, 1, 0, 0, 1];             // steady: five independent jitters
    for (s = 0; s < 5; s++) {
      if (!tally[s].n) continue;
      var acc = 0;
      for (i = 0; i < G; i++) { var p = base[s] ? 1 - 0.1 * (i + 0.5) / G : 0.1 * (i + 0.5) / G; acc += binom(tally[s].h, tally[s].n, p * (1 - fog)); }
      out *= acc / G;
    }
    return out;
  }
  function isNamed(kind, tally, fog) {
    var l = KINDS.map(function (k) { return kindLikelihood(k, tally, fog); }), z = 0;
    l.forEach(function (x) { z += x; });
    return z > 0 && l[KINDS.indexOf(kind)] / z >= 0.8;
  }
  function tellApart(seeds, policy, overrides, day) {
    var all = 0, near = 0;
    seeds.forEach(function (seed) {
      var life = AY.createLife(seed, overrides), archetypes = {}, T;
      life.houses.forEach(function (x) { archetypes[x.id] = x.archetype; });
      var decide = POLICIES[policy]({ seed: life.seed, archetypes: archetypes, fog: life.params.FOG });
      while (life.day < day) { T = AY.today(life); var ch = {}; T.neighbours.forEach(function (nb) { ch[nb.id] = decide(nb, T); }); AY.playDay(life, ch); }
      T = AY.today(life);
      var okAll = true, okNear = true;
      T.neighbours.forEach(function (nb) {
        if (nb.kin) return;
        var close = nb.seen.map(function (x, s) { return { h: x.h - nb.seenFar[s].h, n: x.n - nb.seenFar[s].n }; });
        if (!isNamed(archetypes[nb.id], nb.seen, life.params.FOG)) okAll = false;
        if (!isNamed(archetypes[nb.id], close, life.params.FOG)) okNear = false;
      });
      if (okAll) all++; if (okNear) near++;
    });
    return { day: day, all: 100 * all / seeds.length, near: 100 * near / seeds.length };
  }

  // ---- the combined seal, as the page will show it (beyond the specification) -------------------

  // verdict().seal at the engine's defaults for each policy and seed.
  //   earned   the seal is shown            kept      house kept
  //   plain    house kept and mark >= +5 with no further rule (what an earlier page brief said)
  //   taking   the Life has a last-day entry: the player stayed home on day 12 against a
  //            neighbour who had just sent a hand, both having helped the day before
  //   earnedTaking   the seal is shown in such a Life
  //   earnedBought   the seal is shown although the house was kept only by that taking (must be 0)
  function sealStudy(seeds, policies, overrides) {
    var out = {};
    policies.forEach(function (p) { out[p] = { n: 0, earned: 0, kept: 0, plain: 0, taking: 0, earnedTaking: 0, earnedBought: 0 }; });
    seeds.forEach(function (seed) {
      policies.forEach(function (p) {
        var v = AY.verdict(live(seed, p, overrides).life, { range: false, whatIfs: false }), o = out[p];
        o.n++;
        if (v.seal.earned) o.earned++;
        if (v.houseKept) o.kept++;
        if (v.houseKept && v.mark >= 5) o.plain++;
        if (v.lastDay) { o.taking++; if (v.seal.earned) o.earnedTaking++; if (v.seal.earned && !v.lastDay.houseKept) o.earnedBought++; }
      });
    });
    return out;
  }

  // ---- all gates --------------------------------------------------------------------------------

  // cfg: { seeds: [..], wideSeeds: [..], futures, overrides, g4Seeds, g4Futures, g5Seeds, g6Seeds, g6Futures,
  //        rangeSeeds, skipG4, skipG5, skipG6, skipRange }
  function runGates(cfg) {
    cfg = cfg || {};
    var seeds = cfg.seeds, futures = cfg.futures || 200, ov = cfg.overrides || null;
    var wideSeeds = cfg.wideSeeds || seedRange(1, 6000);
    var R = { seeds: seeds.length, futures: futures, overrides: ov, perSeed: [], gates: {}, beyond: {}, extra: {} };
    var met = {}, marks = {}, holdsBy = {}, edge = {}, purses = {}, mirror = {}, seal = {};
    POLICY_NAMES.forEach(function (p) { met[p] = []; marks[p] = []; holdsBy[p] = []; edge[p] = []; purses[p] = []; mirror[p] = []; seal[p] = []; });
    var spread = [], base = [], situations = [], mirrorAll = [];
    var refSum = AY.REFERENCE_WAYS.map(function () { return 0; });
    var hollowOwing = { yes: [], no: [] };

    seeds.forEach(function (seed) {
      var row = { seed: seed }, baseline = null, plainPurse = null;
      POLICY_NAMES.forEach(function (p) {
        var run = live(seed, p, ov), life = run.life;
        if (baseline === null) { baseline = AY.project(life, { history: 'old', futures: futures }).holdsPct; plainPurse = life.old.purse; }
        var pct = AY.project(life, { futures: futures }).holdsPct;
        if (p === 'plain') {
          // G3: each reference way carried by heir and kin in the valley the old-way Life leaves:
          // one valley per seed, whatever the policy.
          var refs = AY.REFERENCE_WAYS.map(function (c, i) {
            var x = AY.project(life, { history: 'old', custom: c, futures: futures }).holdsPct;
            refSum[i] += x;
            return x;
          });
          row.best = Math.max.apply(null, refs); row.worst = Math.min.apply(null, refs);
          spread.push(row.best - row.worst);
        }
        if (p === 'forgiving') situations.push(life.ways.filter(function (w) { return w.n >= 2; }).length);
        if (p === 'careful') hollowOwing[life.ways[OWING].n === 0 ? 'yes' : 'no'].push(pct - baseline);
        var kept = life.purse >= life.need;
        met[p].push(kept ? 1 : 0);
        purses[p].push(life.purse);
        edge[p].push(life.purse - plainPurse);
        holdsBy[p].push(pct);
        marks[p].push(pct - baseline);
        seal[p].push(kept && pct - baseline >= 5 ? 1 : 0);
        mirror[p].push(run.mirrors);
        row[p] = { purse: life.purse, holdsPct: pct };
        row.need = life.need;
        row.third = life.houses.filter(function (h) { return h.role === 'neighbour' && h.archetype !== 'taker' && h.archetype !== 'soft'; })[0].archetype;
      });
      base.push(baseline);
      mirrorAll.push(MIRROR_POLICIES.every(function (p) { return mirror[p][mirror[p].length - 1].mirror; }) ? 1 : 0);
      row.baseline = baseline; row.spread = spread[spread.length - 1];
      R.perSeed.push(row);
    });

    var wide = wideSample(wideSeeds, ov, POLICY_NAMES);
    R.wide = wide;
    var g = R.gates, pct = {}, mk = {};
    POLICY_NAMES.forEach(function (p) { pct[p] = 100 * mean(met[p]); mk[p] = mean(marks[p]); });
    R.policies = POLICY_NAMES.map(function (p) {
      return { name: p, spec: SPEC_POLICIES.indexOf(p) >= 0, metPct: pct[p], wideMetPct: wide.met[p], purse: mean(purses[p]), edge: mean(edge[p]),
               wideEdge: wide.meanPurse[p] - mean(wide.old), holdsPct: mean(holdsBy[p]), mark: mk[p],
               sealPct: 100 * mean(seal[p]), mirrorPct: share(mirror[p], function (m) { return m.mirror; }) };
    });

    // G1 on the wide sample. The small sample and its blocks are shown as context.
    var purseGap = wide.meanPurse['reader+last1'] - wide.meanPurse.reader;
    var smallGap = mean(purses['reader+last1']) - mean(purses.reader);
    var blocks = 0, blocksOk = 0, gaps = [];
    for (var b0 = 0; b0 + 120 <= wideSeeds.length; b0 += 120) {
      var bm = {}, bp = {};
      ['saint', 'hawk', 'plain', 'forgiving', 'reader', 'reader+last1'].forEach(function (p) {
        bm[p] = 100 * mean(wide.kept[p].slice(b0, b0 + 120)); bp[p] = mean(wide.purse[p].slice(b0, b0 + 120));
      });
      blocks++; gaps.push(bm['reader+last1'] - bm.reader);
      if (allTrue(g1Parts(bm, bp['reader+last1'] - bp.reader))) blocksOk++;
    }
    g.G1 = { name: 'Temptation is real', met: wide.met, purseGap: purseGap, parts: g1Parts(wide.met, purseGap), wideSeeds: wideSeeds.length,
             small: { met: pct, purseGap: smallGap, pass: allTrue(g1Parts(pct, smallGap)) },
             blocks: blocks, blocksOk: blocksOk, gapMin: Math.min.apply(null, gaps), gapMax: Math.max.apply(null, gaps),
             literal: { reader: wide.met['reader-literal'], last1: wide.met['reader-literal+last1'],
                        purseGap: wide.meanPurse['reader-literal+last1'] - wide.meanPurse['reader-literal'] } };
    g.G1.pass = allTrue(g.G1.parts);

    g.G2 = { name: 'The grab costs the valley', reader: mk.reader, last1: mk['reader+last1'], last3: mk['reader+last3'],
             gap1: mk.reader - mk['reader+last1'], gap3: mk.reader - mk['reader+last3'], pass: false,
             also: { literal: mk['reader-literal'] - mk['reader-literal+last1'], careful: mk.careful - mk['careful+last1'],
                     cold: mk['cold-opener'] - mk['cold-opener+last1'], milker: mk['cold-opener'] - mk.milker } };
    g.G2.pass = g.G2.gap1 >= 4 && g.G2.gap3 >= 15;

    // G3, and a check that verdict().range is what it says: the thirteen ways in the valley the
    // player left, on the same futures.
    var rangeChecked = 0, rangeAgrees = 0;
    seeds.slice(0, 4).forEach(function (seed) {
      var life = live(seed, 'forgiving', ov).life, vr = AY.verdict(life, { futures: futures, whatIfs: false, lastDay: false }).range;
      var direct = AY.RANGE_WAYS.map(function (c) { return AY.project(life, { custom: c, futures: futures }).holdsPct; });
      rangeChecked++;
      if (vr.bestPct === Math.max.apply(null, direct) && vr.worstPct === Math.min.apply(null, direct) && vr.of === direct.length) rangeAgrees++;
    });
    g.G3 = { name: 'Attribution', sharePct: share(spread, function (x) { return x >= 25; }), medianSpread: median(spread),
             minSpread: Math.min.apply(null, spread), rangeChecked: rangeChecked, rangeAgrees: rangeAgrees,
             means: refSum.map(function (x) { return x / seeds.length; }), pass: false };
    g.G3.pass = g.G3.sharePct >= 80 && rangeAgrees === rangeChecked;

    if (!cfg.skipG4) {
      var gs = cfg.g4Seeds || seeds.slice(0, 12), trivial = 0, rows = [], sum = {}, key;
      gs.forEach(function (seed) {
        var ranked = gridSearch(seed, ov, cfg.g4Futures || futures), best = ranked[0];
        var isTrivial = same(best.custom, NAMED['always-help']) || same(best.custom, NAMED['always-hold']);
        if (isTrivial) trivial++;
        var named = {};
        for (key in NAMED) ranked.forEach(function (r) { if (same(r.custom, NAMED[key])) named[key] = { rank: r.rank, holdsPct: r.holdsPct }; });
        ranked.forEach(function (r) { var k = r.custom.join(','); sum[k] = (sum[k] || 0) + r.holdsPct; });
        rows.push({ seed: seed, top: ranked.slice(0, 5), named: named, trivial: isTrivial });
      });
      var overall = Object.keys(sum).map(function (k) { return { custom: k, holdsPct: sum[k] / gs.length }; })
        .sort(function (x, y) { return y.holdsPct - x.holdsPct; });
      overall.forEach(function (r, i) { r.rank = i + 1; });
      g.G4 = { name: 'No trivial way', sampled: gs.length, nonTrivialPct: 100 * (gs.length - trivial) / gs.length, rows: rows, overall: overall, pass: false };
      g.G4.pass = gs.length >= 12 && g.G4.nonTrivialPct >= 80;
    }

    if (!cfg.skipG5) {
      var det = determinism({ seeds: cfg.g5Seeds || seeds.slice(0, 3), days: [3, 7, 12], futures: Math.min(futures, 40) }, ov);
      g.G5 = { name: 'Determinism', detail: det,
               pass: det.identical && det.fordBad === 0 && det.otherBad === 0 && det.sameDayOthers && det.lostAgree && det.structure &&
                     det.afterwards && det.ford > 0 && det.other > 0 && det.day3Flips > 0 };
    }

    if (!cfg.skipG6) {
      var g6Seeds = cfg.g6Seeds || seeds, g6Futures = cfg.g6Futures || AY.params.WHATIF_FUTURES;
      var fresh = [], namedMove = [], literal = [], small = [], none = 0, smallSeeds = cfg.g6SmallSeeds === undefined ? 30 : cfg.g6SmallSeeds;
      g6Seeds.forEach(function (seed, i) {
        var life6 = live(seed, 'forgiving', ov).life, hm = habitMatters(life6, g6Futures);
        fresh.push(hm.fresh); namedMove.push(hm.named); literal.push(hm.literal); if (hm.none) none++;
        if (i < smallSeeds) small.push(largestOfTen(life6, 200));
      });
      g.G6 = { name: 'A habit matters', seeds: g6Seeds.length, futures: g6Futures,
               sharePct: share(fresh, function (x) { return x >= 5; }), medianMove: median(fresh), nonePct: 100 * none / g6Seeds.length,
               namedPct: share(namedMove, function (x) { return x >= 5; }), literalPct: share(literal, function (x) { return x >= 5; }),
               smallSeeds: small.length, literalSmallPct: small.length ? share(small, function (x) { return x >= 5; }) : null, pass: false };
      g.G6.pass = g.G6.sharePct >= 60;
    }

    g.G7 = { name: 'Not a lottery', sharePct: share(base, function (x) { return x >= 15 && x <= 85; }), medianBaseline: median(base),
             min: Math.min.apply(null, base), max: Math.max.apply(null, base), pass: false };
    g.G7.pass = g.G7.sharePct >= 60;

    g.G8 = { name: 'The mirror shows', each: {}, outside: {}, unlike: {}, around: {}, allThree: 100 * mean(mirrorAll), pass: false };
    MIRROR_POLICIES.forEach(function (p) {
      g.G8.each[p] = share(mirror[p], function (m) { return m.mirror; });
      g.G8.outside[p] = share(mirror[p], function (m) { return m.outside; });
      g.G8.unlike[p] = share(mirror[p], function (m) { return m.unlike; });
      g.G8.around[p] = share(mirror[p], function (m) { return m.around; });
    });
    g.G8.pass = g.G8.allThree >= 85;

    g.G9 = { name: 'The situations come up', median: median(situations), min: Math.min.apply(null, situations), pass: median(situations) >= 4 };

    // G10: over every policy in the list (the specification's and the extra ones). Need-met from
    // the wide sample, mean mark from the verdict sample. A tie counts as holding the top place.
    var topMet = Math.max.apply(null, POLICY_NAMES.map(function (p) { return wide.met[p]; }));
    var topMark = Math.max.apply(null, POLICY_NAMES.map(function (p) { return mk[p]; }));
    var metLeaders = POLICY_NAMES.filter(function (p) { return wide.met[p] === topMet; });
    var markLeaders = POLICY_NAMES.filter(function (p) { return mk[p] === topMark; });
    var both = POLICY_NAMES.filter(function (p) { return (wide.met[p] >= 85 || pct[p] >= 85) && mk[p] >= 3; });
    var closest = POLICY_NAMES.filter(function (p) { return mk[p] >= 3; }).sort(function (x, y) { return wide.met[y] - wide.met[x]; })[0] || null;
    g.G10 = { name: 'No recipe wins both', metLeaders: metLeaders, topMet: topMet, markLeaders: markLeaders, topMark: topMark, both: both,
              closest: closest, closestMet: closest ? wide.met[closest] : 0, closestMark: closest ? mk[closest] : 0,
              pass: both.length === 0 && !metLeaders.some(function (p) { return markLeaders.indexOf(p) >= 0; }) };

    // ---- checks added after review (not in the specification) ---------------------------------
    var B = R.beyond, X = R.extra = {}, P = AY.params, margin = ov && ov.MARGIN !== undefined ? ov.MARGIN : P.MARGIN;
    function specNeed(i) { return wide.old[i] + margin; }       // section 2.8 to the letter
    B.decisive = { reader: decisive(wide, 'reader', 'reader+last1'), careful: decisive(wide, 'careful', 'careful+last1'),
                   cold: decisive(wide, 'cold-opener', 'cold-opener+last1'), literal: decisive(wide, 'reader-literal', 'reader-literal+last1') };
    B.decisiveSpec = { reader: decisive(wide, 'reader', 'reader+last1', specNeed), careful: decisive(wide, 'careful', 'careful+last1', specNeed),
                       cold: decisive(wide, 'cold-opener', 'cold-opener+last1', specNeed) };
    B.tape = { corr: corr(wide.old, wide.purse.reader.map(function (p, i) { return p - wide.need[i]; })),
               corrSpec: corr(wide.old, wide.purse.reader.map(function (p, i) { return p - specNeed(i); })),
               quarters: byOldQuarter(wide, 'reader'), quartersGrab: byOldQuarter(wide, 'reader+last1'),
               quartersSpec: byOldQuarter(wide, 'reader', specNeed), quartersGrabSpec: byOldQuarter(wide, 'reader+last1', specNeed),
               needMinusOld: mean(wide.need.map(function (n, i) { return n - wide.old[i]; })) };
    // X1: whoever is short on the last morning can more often than not still keep the house by taking.
    X.X1 = { name: 'The last day decides', parts: {} };
    ['reader', 'careful'].forEach(function (p) { X.X1.parts[p] = B.decisive[p].decides >= B.decisive[p].lost; });
    X.X1.pass = allTrue(X.X1.parts);

    if (!cfg.skipSeal) {
      // X2: the combined seal, as verdict() gives it at the engine's defaults.
      var sealSeeds = cfg.sealSeeds || seeds.slice(0, 20);
      var sealPairs = [['careful', 'careful+last1'], ['cold-opener', 'cold-opener+last1']];
      var sealNames = ['careful', 'careful+last1', 'careful+grab-if-decides', 'cold-opener', 'cold-opener+last1', 'cold-opener+grab-if-short'];
      var st = sealStudy(sealSeeds, sealNames, ov), bought = 0;
      sealNames.forEach(function (p) { bought += st[p].earnedBought; });
      X.X2 = { name: 'The seal is not for sale', seeds: sealSeeds.length, study: st, names: sealNames, bought: bought, parts: {} };
      X.X2.parts['no seal on a house kept only by the last day\'s taking'] = bought === 0;
      sealPairs.forEach(function (pr) { X.X2.parts[pr[1] + ' earns it less often than ' + pr[0]] = st[pr[1]].earned < st[pr[0]].earned; });
      X.X2.pass = allTrue(X.X2.parts);
    }

    // ---- beyond the specification: measurements the reviewers asked to see ----------------------
    B.milker = { met: wide.met.milker, edge: wide.meanPurse.milker - mean(wide.old), overGrab: wide.meanPurse.milker - wide.meanPurse['cold-opener+last1'], mark: mk.milker };
    B.hollowOwing = { share: 100 * hollowOwing.yes.length / seeds.length, markHollow: mean(hollowOwing.yes), markOther: mean(hollowOwing.no) };
    B.plainMark = { mean: mk.plain, maxAbs: Math.max.apply(null, marks.plain.map(Math.abs)) };
    if (!cfg.skipTell) {
      var tellSeeds = cfg.tellSeeds || seedRange(1, 400);
      B.tell = [6, 9].map(function (day) { return tellApart(tellSeeds, 'careful', ov, day); });
      B.tellSeeds = tellSeeds.length;
    }
    if (!cfg.skipRange) {
      // Where the player's result sits against verdict().range, in the valley the player left.
      var rs = cfg.rangeSeeds || seeds.slice(0, 20);
      B.range = { seeds: rs.length, policies: {} };
      ['careful', 'forgiving', 'hawk'].forEach(function (p) {
        var above = 0, below = 0, baseOut = 0, ranks = [];
        rs.forEach(function (seed) {
          var r = AY.verdict(live(seed, p, ov).life, { futures: futures, whatIfs: false, lastDay: false }).range;
          if (r.yourPct > r.bestPct) above++; if (r.yourPct < r.worstPct) below++; if (!r.baselineInside) baseOut++;
          ranks.push(r.rank);
        });
        B.range.policies[p] = { above: 100 * above / rs.length, below: 100 * below / rs.length, baselineOutside: 100 * baseOut / rs.length, medianRank: median(ranks) };
      });
    }
    return R;
  }

  // ---- report -----------------------------------------------------------------------------------

  function line(id, gate, numbers) { print((gate.pass ? 'PASS' : 'FAIL') + '  ' + id + ' ' + gate.name + ': ' + numbers); }
  function failing(parts) { return Object.keys(parts).filter(function (k) { return !parts[k]; }).join('; ') || 'none'; }

  function printReport(R, brief) {
    var g = R.gates, B = R.beyond, P = {}, k;
    for (k in AY.params) P[k] = AY.params[k];
    if (R.overrides) for (k in R.overrides) P[k] = R.overrides[k];
    print('After You: gates. Need over ' + R.wide.seeds + ' seeds (no futures needed); marks over ' + R.seeds + ' seeds, ' + R.futures + ' futures per verdict');
    print('parameters: FOG ' + P.FOG + '  K ' + P.K + '  MUT ' + P.MUT + '  MARGIN ' + P.MARGIN + '  NEED_WEIGHT ' + P.NEED_WEIGHT + '  NEED_PIVOT ' + P.NEED_PIVOT + '  R_LIFE ' + P.R_LIFE +
          '  R_AFTER ' + P.R_AFTER + '  HOLD_LINE ' + P.HOLD_LINE + '  arrival ' + P.ARRIVE_FROM + '..' + P.ARRIVE_TO +
          '  FUTURES ' + P.FUTURES + '  WHATIF_FUTURES ' + P.WHATIF_FUTURES);
    print('');
    print('policy                      meets need   (' + R.seeds + ' seeds)   vs plain   holdsPct    mark   kept and mark >= +5 (200 futures, no seal rule)');
    R.policies.forEach(function (p, i) {
      if (i === SPEC_POLICIES.length) print('  -- beyond the specification\'s list --');
      print(padr(p.name, 27) + pad(f1(p.wideMetPct) + '%', 11) + pad(f1(p.metPct) + '%', 14) + pad(sg(p.wideEdge), 11) + pad(f1(p.holdsPct), 11) +
            pad(sg(p.mark), 8) + pad(f1(p.sealPct) + '%', 15));
    });
    print('');
    if (!brief) {
      print('per seed: baseline% | holds% ' + SPEC_POLICIES.join(' ') + ' | reference ways worst..best spread | need | purse (same order) | third neighbour');
      R.perSeed.forEach(function (r) {
        print(pad(r.seed, 4) + pad(f1(r.baseline), 7) + ' |' + SPEC_POLICIES.map(function (p) { return pad(f1(r[p].holdsPct), 6); }).join('') + ' |' +
              pad(f1(r.worst), 6) + '..' + padr(f1(r.best), 5) + pad(f1(r.spread), 6) + ' |' + pad(r.need, 4) + ' |' +
              SPEC_POLICIES.map(function (p) { return pad(r[p].purse, 4); }).join('') + ' | ' + r.third);
      });
      print('');
    }

    print('reference ways, mean holdsPct over the seeds (heir and kin both carry the way, old-way Life):');
    print('  ' + AY.REFERENCE_WAYS.map(function (c, i) { return '[' + c.join(',') + '] ' + f1(g.G3.means[i]); }).join('   '));
    print('');

    if (g.G4) {
      print('G4 grid search {0, 0.5, 1}^5 (243 customs), heir and kin carry the custom, ' + g.G4.sampled + ' seeds');
      if (!brief) g.G4.rows.forEach(function (row) {
        print('  seed ' + pad(row.seed, 3) + ' best five: ' + row.top.map(function (t) { return '[' + t.custom.join(',') + '] ' + f1(t.holdsPct); }).join('   '));
        print('           ranks of 243: ' + Object.keys(row.named).map(function (k) { return k + ' #' + row.named[k].rank + ' (' + f1(row.named[k].holdsPct) + ')'; }).join(', '));
      });
      print('  mean over sampled seeds, best five: ' + g.G4.overall.slice(0, 5).map(function (t) { return '[' + t.custom + '] ' + f1(t.holdsPct); }).join('   '));
      print('  mean over sampled seeds, named: ' + Object.keys(NAMED).map(function (k) {
        var r = g.G4.overall.filter(function (o) { return o.custom === NAMED[k].join(','); })[0];
        return k + ' #' + r.rank + ' (' + f1(r.holdsPct) + ')';
      }).join(', '));
      print('');
    }

    var m = g.G1.met, sm = g.G1.small.met;
    line('G1', g.G1, 'meets need over ' + g.G1.wideSeeds + ' seeds: reader ' + f1(m.reader) + '% (40..70), reader+last1 ' + f1(m['reader+last1']) + '% (' + sg(m['reader+last1'] - m.reader) +
         ' points on reader, >= 12), forgiving ' + f1(m.forgiving) + '% (10..50), saint ' + f1(m.saint) + '% (<= 30), hawk ' + f1(m.hawk) + '% (<= 20), plain ' +
         f1(m.plain) + '% (0); mean purse reader+last1 minus reader ' + sg(g.G1.purseGap) + ' (>= 2)  [failing parts: ' + failing(g.G1.parts) + ']');
    print('      context: the same on the ' + R.seeds + ' verdict seeds alone: reader ' + f1(sm.reader) + '%, reader+last1 ' + f1(sm['reader+last1']) + '% (' +
          sg(sm['reader+last1'] - sm.reader) + '), would ' + (g.G1.small.pass ? 'pass' : 'FAIL') + '; over ' + g.G1.blocks + ' blocks of 120 seeds all parts hold in ' +
          g.G1.blocksOk + ', and the 12-point part ranges ' + sg(g.G1.gapMin) + '..' + sg(g.G1.gapMax));
    print('      context: reader with section 4 taken to the letter (repairs by sending again even with a steady neighbour): ' + f1(g.G1.literal.reader) + '%, +last1 ' +
          f1(g.G1.literal.last1) + '% (' + sg(g.G1.literal.last1 - g.G1.literal.reader) + '), purse gap ' + sg(g.G1.literal.purseGap));
    line('G2', g.G2, 'mean mark reader ' + sg(g.G2.reader) + ', reader+last1 ' + sg(g.G2.last1) + ', reader+last3 ' + sg(g.G2.last3) +
         '; reader minus reader+last1 ' + f1(g.G2.gap1) + ' (>= 4), reader minus reader+last3 ' + f1(g.G2.gap3) + ' (>= 15)');
    print('      context: the day-12 grab costs reader-literal ' + f1(g.G2.also.literal) + ' points, careful ' + f1(g.G2.also.careful) + ', cold-opener ' + f1(g.G2.also.cold) +
          '; milking (kin and a forgiving neighbour from day 9, the rest on day 12) costs cold-opener ' + f1(g.G2.also.milker));
    line('G3', g.G3, 'spread of holdsPct across the nine reference ways is >= 25 points in ' + f1(g.G3.sharePct) +
         '% of seeds (>= 80); median spread ' + f1(g.G3.medianSpread) + ', smallest ' + f1(g.G3.minSpread) +
         '; verdict().range equals a direct count of its thirteen ways in ' + g.G3.rangeAgrees + ' of ' + g.G3.rangeChecked + ' Lives checked');
    if (g.G4) line('G4', g.G4, 'best grid custom is neither all ones nor all zeros in ' + f1(g.G4.nonTrivialPct) + '% of ' + g.G4.sampled + ' sampled seeds (>= 80, at least 12 seeds)');
    if (g.G5) {
      var d = g.G5.detail;
      line('G5', g.G5, 'same seed and decisions identical: ' + d.identical + '; ' + d.flips + ' single decisions flipped (' + d.day3Flips + ' on day 3): ' + d.ford +
           ' shared ford draws, ' + d.fordBad + ' differ; ' + d.other + ' other shared draws, ' + d.otherBad + ' differ; need, kin, who reconsiders and whom they look at unchanged: ' +
           d.structure + '; arrival season and newcomer unchanged in the futures: ' + d.afterwards + '; other ties on the flipped day unchanged: ' + d.sameDayOthers +
           '; ford agrees wherever both runs sent: ' + d.lostAgree + ' (' + d.changedResults + ' later results did change, ' + d.onlyOne + ' draws were needed by one run only)');
    }
    if (g.G6) {
      line('G6', g.G6, 'for forgiving, the what-if with the largest effect among the ten (picked on ' + g.G6.futures + ' futures as section 2.7 says, measured on ' + g.G6.futures +
           ' fresh ones) moves holdsPct by >= 5 points in ' + f1(g.G6.sharePct) + '% of ' + g.G6.seeds + ' seeds (>= 60); median move ' + f1(g.G6.medianMove));
      print('      context: the wording to the letter (the largest of ten read off the futures it was picked on, which noise inflates): ' + f1(g.G6.literalPct) + '% at ' + g.G6.futures +
            ' futures' + (g.G6.literalSmallPct === null ? '' : ', ' + f1(g.G6.literalSmallPct) + '% at 200 futures (first ' + g.G6.smallSeeds + ' seeds)') +
            '; stricter than the specification (only a habit verdict() itself names, measured on fresh futures): ' + f1(g.G6.namedPct) + '%, with no habit named in ' + f1(g.G6.nonePct) + '% of Lives');
    }
    line('G7', g.G7, 'baselinePct within 15..85 in ' + f1(g.G7.sharePct) + '% of seeds (>= 60); median ' + f1(g.G7.medianBaseline) + ', range ' + f1(g.G7.min) + '..' + f1(g.G7.max));
    line('G8', g.G8, 'kin acts toward the player from a "from you" habit with a dated deed on days 5..12: ' +
         MIRROR_POLICIES.map(function (p) { return p + ' ' + f1(g.G8.each[p]) + '%'; }).join(', ') + '; all three in ' + f1(g.G8.allThree) + '% of seeds (>= 85)');
    print('      beyond the specification (the gate above is met by the routine "after both helped" card in every Life): from a "from you" habit ' +
          'outside "after both helped": ' + MIRROR_POLICIES.map(function (p) { return p + ' ' + f1(g.G8.outside[p]) + '%'; }).join(', ') +
          '; the same counting kin\'s dealings with the player\'s other neighbours (playDay().kinWith): ' +
          MIRROR_POLICIES.map(function (p) { return p + ' ' + f1(g.G8.around[p]) + '%'; }).join(', ') +
          '; from a habit unlike the old way\'s, kin visibly doing what the old way would not: ' +
          MIRROR_POLICIES.map(function (p) { return p + ' ' + f1(g.G8.unlike[p]) + '%'; }).join(', '));
    line('G9', g.G9, 'forgiving: median number of situations with n >= 2 by day 12 is ' + g.G9.median + ' (>= 4); minimum ' + g.G9.min);
    line('G10', g.G10, 'over all ' + POLICY_NAMES.length + ' policies: highest need-met rate: ' + g.G10.metLeaders.join(', ') + ' (' + f1(g.G10.topMet) + '%); highest mean mark: ' +
         g.G10.markLeaders.join(', ') + ' (' + sg(g.G10.topMark) + '); policies with need met >= 85% and mean mark >= +3: ' + (g.G10.both.join(', ') || 'none') +
         (g.G10.closest ? '; nearest to both: ' + g.G10.closest + ' (' + f1(g.G10.closestMet) + '%, ' + sg(g.G10.closestMark) + ')' : ''));

    var X = R.extra;
    print('');
    print('checks added after review (not in the specification):');
    if (X.X1) {
      line('X1', X.X1, 'of the Lives honest play does not keep, the day-12 grab keeps at least half: ' + ['reader', 'careful'].map(function (p) {
        var x = B.decisive[p];
        return p + ' kept ' + f1(x.kept) + '%, kept only by the grab ' + f1(x.decides) + '%, lost even with it ' + f1(x.lost) + '% (needs ' + f1(x.decides) + ' >= ' + f1(x.lost) + ')';
      }).join('; ') + '  [failing parts: ' + failing(X.X1.parts) + ']');
      print('      context: cold-opener ' + f1(B.decisive.cold.kept) + ' / ' + f1(B.decisive.cold.decides) + ' / ' + f1(B.decisive.cold.lost) + ', reader-literal ' + f1(B.decisive.literal.kept) + ' / ' +
            f1(B.decisive.literal.decides) + ' / ' + f1(B.decisive.literal.lost) + '. The same Lives under section 2.8 to the letter (need = the old way\'s purse + MARGIN): reader ' +
            f1(B.decisiveSpec.reader.kept) + ' / ' + f1(B.decisiveSpec.reader.decides) + ' / ' + f1(B.decisiveSpec.reader.lost) + ', careful ' + f1(B.decisiveSpec.careful.kept) + ' / ' +
            f1(B.decisiveSpec.careful.decides) + ' / ' + f1(B.decisiveSpec.careful.lost) + ', cold-opener ' + f1(B.decisiveSpec.cold.kept) + ' / ' + f1(B.decisiveSpec.cold.decides) + ' / ' + f1(B.decisiveSpec.cold.lost));
      print('      context: how much of it is the tape: correlation of the old way\'s purse with (reader\'s purse minus the need) ' + B.tape.corr.toFixed(2) + ' (to the letter: ' + B.tape.corrSpec.toFixed(2) +
            '); reader keeps the house, by quarter of the old way\'s purse, lowest first: ' + B.tape.quarters.map(f1).join(' / ') + ', with the grab ' + B.tape.quartersGrab.map(f1).join(' / ') +
            ' (to the letter: ' + B.tape.quartersSpec.map(f1).join(' / ') + ', with the grab ' + B.tape.quartersGrabSpec.map(f1).join(' / ') + '); the need is on average ' + f1(B.tape.needMinusOld) + ' above the old way\'s purse');
    }
    if (X.X2) {
      line('X2', X.X2, 'verdict().seal at the engine\'s defaults, ' + X.X2.seeds + ' seeds: seal shown in ' + X.X2.names.map(function (p) {
        var o = X.X2.study[p];
        return p + ' ' + f1(100 * o.earned / o.n) + '%';
      }).join(', ') + '; Lives that earn it with a house kept only by the last day\'s taking: ' + X.X2.bought + ' (must be 0)  [failing parts: ' + failing(X.X2.parts) + ']');
      print('      context (house kept % / kept and mark >= +5 with no further rule % / Lives with a last-day taking % / of those, seal shown %): ' + X.X2.names.map(function (p) {
        var o = X.X2.study[p];
        return p + ' ' + f1(100 * o.kept / o.n) + ' / ' + f1(100 * o.plain / o.n) + ' / ' + f1(100 * o.taking / o.n) + ' / ' + (o.taking ? f1(100 * o.earnedTaking / o.taking) : '-');
      }).join('; '));
    }
    print('');
    print('beyond the specification (measurements, not gates):');
    print('  milker: meets need ' + f1(B.milker.met) + '%, ' + sg(B.milker.edge) + ' measures on plain, ' + sg(B.milker.overGrab) + ' on cold-opener+last1; mean mark ' + sg(B.milker.mark));
    print('  careful Lives that never left anyone short (' + f1(B.hollowOwing.share) + '% of seeds): mean mark ' + sg(B.hollowOwing.markHollow) + ', the others ' + sg(B.hollowOwing.markOther));
    print('  plain: mean mark ' + sg(B.plainMark.mean) + ', largest |mark| ' + f1(B.plainMark.maxAbs));
    if (B.tell) print('  telling the neighbours apart (' + B.tellSeeds + ' careful Lives; an observer who knows the founder bands and reads only the tallies on screen names all three non-kin neighbours): ' +
                      B.tell.map(function (t) { return 'start of day ' + t.day + ' in ' + f1(t.all) + '% of Lives (from the near ties alone, section 2.5 to the letter: ' + f1(t.near) + '%)'; }).join('; '));
    if (B.range) Object.keys(B.range.policies).forEach(function (p) {
      var x = B.range.policies[p];
      print('  range (' + B.range.seeds + ' seeds), ' + padr(p, 10) + ': above the best of the thirteen ways in ' + f1(x.above) + '% of Lives, below the worst in ' + f1(x.below) +
            '%, median rank ' + x.medianRank + ' of 13; old-way baseline outside the range in ' + f1(x.baselineOutside) + '%');
    });
  }

  function timeVerdict(seed) {
    var life = live(seed, 'careful+last1', null).life, t = preciseTime();
    var v = AY.verdict(life);
    return { seconds: preciseTime() - t, verdict: v };
  }

  globalThis.Harness = { POLICIES: POLICIES, POLICY_NAMES: POLICY_NAMES, SPEC_POLICIES: SPEC_POLICIES, live: live, runGates: runGates, printReport: printReport,
                         gridSearch: gridSearch, determinism: determinism, timeVerdict: timeVerdict, seedRange: seedRange,
                         wideSample: wideSample, habitMatters: habitMatters, largestOfTen: largestOfTen, bestReply: bestReply,
                         lastDays: lastDays, grabIfShort: grabIfShort, grabIfDecides: grabIfDecides, careful: careful,
                         tellApart: tellApart, sealStudy: sealStudy, decisive: decisive,
                         mean: mean, median: median, share: share, corr: corr };

  if (!globalThis.HARNESS_LIB) {
    var t0 = preciseTime();
    var R = runGates({ seeds: seedRange(1, 120), wideSeeds: seedRange(1, 6000), g4Seeds: seedRange(1, 12), g6Seeds: seedRange(1, 120) });
    printReport(R);
    print('');
    var slow = 0, total = 0, n = 0, ses = [], runs = 0;
    [1, 2, 3].forEach(function (seed) {
      var tv = timeVerdict(seed);
      total += tv.seconds; n++; if (tv.seconds > slow) slow = tv.seconds;
      ses.push(tv.verdict.markSE);
      runs = 2 + tv.verdict.range.of + tv.verdict.whatIfs.length + (tv.verdict.lastDay ? 1 : 0);
    });
    print('verdict() full run at the defaults (two headline rows of ' + AY.params.FUTURES + ' futures; thirteen reference ways, ten what-ifs and the last-day replay at ' +
          AY.params.WHATIF_FUTURES + ' each; up to ' + runs + ' rows): mean ' + (total / n).toFixed(3) + ' s, slowest ' + slow.toFixed(3) + ' s over ' + n +
          ' seeds (target < 2.5 s): ' + (slow < 2.5 ? 'PASS' : 'FAIL') + '; standard error of the mark ' + f1(Math.min.apply(null, ses)) + '..' + f1(Math.max.apply(null, ses)) + ' points');
    print('harness finished in ' + (preciseTime() - t0).toFixed(1) + ' s (limit 180 s)');
  }
})();
