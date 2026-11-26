// After You: the place gate lab, shared by the four tuners. Design evidence only; nothing here ships.
//
//   load('engine.js');  load('checks/engine/placelab.js');          (from the repository root)
//   PlaceLab.gates('banks', { scale: 'smoke' });
//
// A "place" argument is a PLACES key ('valley', 'banks', 'watch', 'bridges', 'saltmarket') or
// PlaceLab.place(key, overrides) for a key with parameters moved on top (what a tuner sweeps).
//
// Policies. A policy is any of:
//   - five chances [p0..p4] (a fixed way, played with keyed draws);
//   - a battery name ('always', 'careful+grab', 'honest+selfish2', ...; see PlaceLab.NAMES);
//   - a function policy(view) -> choices ([4 x bool] in the order [1, 2, 6, 7], or { id: bool }),
//     where view = today(life) plus { ways: ways(life) (the house's own tallies), seed, params,
//     place, memo (an object kept for the whole Life: the policy's own memory) };
//   - PlaceLab.fromDecide(maker, name) for a maker in the style of lab.js and harness.js
//     (maker(ctx) -> decide(nb, view) -> bool, ctx = { seed, params, place, fog }).
//   - { name, policy } to give a function a name.
// Every policy sees only what the page shows (founder kinds are never handed to it).
//
// Numbers printed by this file are measured by it; nothing is quoted from elsewhere. Seeds: the
// gates draw their own seeds from 100001 up (see SEED_BANDS); tune on seeds below 100000.
(function () {
  'use strict';
  var AY = globalThis.AfterYou;
  if (!AY || !AY.PLACES) throw new Error('PlaceLab: load engine.js first');
  var NEW = 0, BOTH = 1, SHORTED = 2, OWING = 3, NEITHER = 4;
  var THEIRS = [0, 1, 3, 2, 4];   // my situation on a tie -> the neighbour's
  var COIN = 20;                  // fixed ways' coin (as lab.js)
  var COIN2 = 101;                // the harness's coin (forgiving)

  // ---- small helpers ----------------------------------------------------------------------------
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; }
  function sd(a) { if (a.length < 2) return 0; var m = mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return Math.sqrt(s / (a.length - 1)); }
  function sem(a) { return a.length > 1 ? sd(a) / Math.sqrt(a.length) : 0; }
  function median(a) { var b = a.slice().sort(function (x, y) { return x - y; }), k = b.length >> 1; return b.length ? (b.length % 2 ? b[k] : (b[k - 1] + b[k]) / 2) : 0; }
  function share(a, test) { var k = 0; for (var i = 0; i < a.length; i++) if (test(a[i])) k++; return a.length ? 100 * k / a.length : 0; }
  function f1(x) { return x === null || x === undefined || isNaN(x) ? '-' : x.toFixed(1); }
  function sg(x) { return x === null || x === undefined || isNaN(x) ? '-' : (x >= 0 ? '+' : '') + x.toFixed(1); }
  function pad(s, n) { s = String(s); while (s.length < n) s = ' ' + s; return s; }
  function padr(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }
  function seeds(a, b) { var s = []; for (var i = a; i <= b; i++) s.push(i); return s; }
  function say(line) { if (!PlaceLab.quiet) print(line); }
  function now() { return preciseTime(); }
  function isWhole(x) { return typeof x === 'number' && isFinite(x) && Math.floor(x) === x; }
  function sameWay(a, b) { for (var i = 0; i < 5; i++) if (a[i] !== b[i]) return false; return true; }
  function flat(w) { return w.every(function (x) { return x === w[0]; }) && (w[0] === 0 || w[0] === 1); }
  function wayStr(w) { return '[' + w.join(',') + ']'; }

  // ---- places -------------------------------------------------------------------------------------
  // place(key, overrides) -> { key, overrides, label }. A bare key is the preset as it stands.
  function place(key, overrides) {
    if (key && typeof key === 'object' && 'key' in key) return key;
    if (typeof key !== 'string' || !AY.PLACES.hasOwnProperty(key)) throw new Error('PlaceLab: unknown place ' + JSON.stringify(key));
    var ov = overrides && Object.keys(overrides).length ? overrides : null;
    return { key: key, overrides: ov, label: key + (ov ? ' ' + JSON.stringify(ov) : '') };
  }
  function makeLife(pl, seed) { return AY.createLife(seed, pl.key, pl.overrides || undefined); }
  var paramCache = {};
  function paramsOf(pl) { var k = pl.label; if (!paramCache[k]) paramCache[k] = makeLife(pl, 1).params; return paramCache[k]; }

  // ---- policies -----------------------------------------------------------------------------------
  // Internally every policy is { name, start(ctx) -> step(view) -> [4 x bool] }.
  function fromDecide(maker, name) {
    return { name: name || maker.labName || maker.name || 'decide', start: function (ctx) {
      var decide = maker(ctx);
      return function (view) { return view.neighbours.map(function (nb) { return !!decide(nb, view); }); };
    } };
  }
  function fromPolicy(fn, name) {
    return { name: name || fn.labName || fn.name || 'policy', start: function () {
      return function (view) {
        var c = fn(view);
        return Array.isArray(c) ? c.map(function (x) { return !!x; }) : view.neighbours.map(function (nb) { return !!c[nb.id]; });
      };
    } };
  }
  // A fixed way: five chances, keyed draws (a way equal to the custom replays the reference Life).
  function five(chances) {
    return function (ctx) {
      return function (nb, T) {
        var p = chances[nb.situation];
        return p >= 1 ? true : p <= 0 ? false : AY.draw(ctx.seed, COIN, T.day, 0, nb.id, 0) < p;
      };
    };
  }
  // From lab.js: stays home against a neighbour until two hands have come from it, then mirrors.
  function bully(k) {
    k = k || 2;
    return function () {
      var got = {};
      return function (nb) {
        if (!nb.yesterday) got[nb.id] = 0;
        else if (nb.yesterday.they) got[nb.id] = (got[nb.id] || 0) + 1;
        if ((got[nb.id] || 0) < k) return false;
        return nb.yesterday.they;
      };
    };
  }
  // From the valley harness, unchanged: forgiving; careful (cold = opens to kin only on day 1).
  function forgiving(ctx) {
    return function (nb, T) {
      if (nb.situation === NEW) return true;
      if (nb.yesterday.lost) return true;
      if (nb.situation === SHORTED) return AY.draw(ctx.seed, COIN2, T.day, 0, nb.id, 0) < 1 / 3;
      return nb.yesterday.they;
    };
  }
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
  // one-strike (the seat's hardRing; the grudge): sends to someone new and to those whose hand came,
  // and never again to a house whose hand failed to come once.
  function oneStrike() {
    var cut = {};
    return function (nb) {
      if (nb.yesterday && !nb.yesterday.they) cut[nb.id] = true;
      if (!nb.yesterday) return true;
      return !cut[nb.id];
    };
  }
  // The seat's mender (the Banks): keeps off anyone who has kept off it at least once; forgives one
  // miss in a row from such a house; stops after three misses running (two from one never seen to send).
  function mender() {
    var miss = {}, ever = {};
    return function (nb, T) {
      if (nb.yesterday) { miss[nb.id] = nb.yesterday.they ? 0 : (miss[nb.id] || 0) + 1; if (nb.yesterday.they) ever[nb.id] = true; }
      if (T.day === 1 || !nb.yesterday) return true;
      if (!ever[nb.id]) return (miss[nb.id] || 0) < 2;
      return (miss[nb.id] || 0) < 3;
    };
  }
  // The seat's take-turns (the Bridges): gives way to someone new; after one gave way and the other
  // crossed, swaps; after both waited, drives on unless that has jammed with this house before;
  // after a jam, gives way.
  function takeTurns() {
    var jammed = {};
    return function (nb) {
      var s = nb.situation;
      if (s === NEW) return true;
      if (s === SHORTED) return false;
      if (s === OWING) return true;
      if (s === NEITHER) { jammed[nb.id] = true; return true; }
      return !!jammed[nb.id];
    };
  }
  // The seat's push-the-polite (the Bridges): gives way to anyone who did not give way yesterday;
  // drives on against one who did, if that house has been seen to give way again after being driven
  // on at least half the time.
  function pushPolite() {
    return function (nb) {
      if (!nb.yesterday) return true;
      if (!nb.yesterday.they) return true;
      var t = nb.seen[SHORTED];
      return !(t.n >= 1 && t.h / t.n >= 0.5);
    };
  }
  // Whether a neighbour's hand is expected today: it mostly sent one in the situation it is now in
  // (as seen), or, where nothing is known of that, the two are on good terms (both helped). From the
  // harness's grabIfDecides.
  function expected(nb) {
    var theirs = nb.seen[THEIRS[nb.situation]];
    return theirs.n ? theirs.h * 2 >= theirs.n : nb.situation === BOTH;
  }
  // The store's best reply today: send when, with the neighbour's hand as expected, sending gains
  // more today than staying home (S - C if their hand comes, H - C if it does not; a level does not
  // enter: it pays whatever this house does). null when the two are equal. In the valley it always
  // stays home: the valley's grab.
  function storeBest(nb, view) {
    var P = view.params, d = expected(nb) ? P.S - P.C : P.H - P.C;
    return d > 0 ? true : d < 0 ? false : null;
  }
  // The same maker, but on the last n days each choice is act(nb, view, choice) when that is a bool.
  function lastDays(maker, n, act) {
    return function (ctx) {
      var inner = maker(ctx);
      return function (nb, T) {
        var c = inner(nb, T);
        if (T.day <= 12 - n) return c;
        var a = typeof act === 'function' ? act(nb, T, c, ctx) : act;
        return a === true || a === false ? a : c;
      };
    };
  }
  // From lab.js (place stakes): on day 12 takes exactly when that keeps the house, and no more.
  function grabIfDecides(maker) {
    return function (ctx) {
      var inner = maker(ctx), plan = null, P = ctx.params;
      return function (nb, T) {
        if (T.day !== 12) return inner(nb, T);
        if (!plan) {
          plan = {};
          var store = T.purse, sends = [];
          T.neighbours.forEach(function (x) {
            var comes = expected(x), level = x.stock === undefined ? 1 : x.stock;
            plan[x.id] = inner(x, T);
            store += comes ? P.B * level : 0;
            if (plan[x.id]) { store += comes ? P.S - P.C : -P.C; sends.push({ nb: x, saves: comes ? P.C - P.S : P.C - P.H }); }
            else if (!comes) store -= P.H;
          });
          sends = sends.filter(function (x) { return x.saves > 0; });
          sends.sort(function (p, q) { return q.saves - p.saves || (p.nb.situation === BOTH ? 1 : 0) - (q.nb.situation === BOTH ? 1 : 0); });
          var short = T.need - store, could = 0, i;
          for (i = 0; i < sends.length; i++) could += sends[i].saves;
          if (short > 0 && short <= could) for (i = 0; i < sends.length && short > 0; i++) { plan[sends[i].nb.id] = false; short -= sends[i].saves; }
        }
        return plan[nb.id];
      };
    };
  }
  // The harness's best reply in grain to a neighbour whose custom q is known, with the place's
  // stakes (a tie's level is taken as fixed at `level`: an approximation for STOCK places).
  function bestReply(q, daysLeft, sit, P, level) {
    var V = [0, 0, 0, 0, 0], act = null, d, s, k, fog = P.FOG, Bt = P.B * (level === undefined ? 1 : level);
    var outcomes = [[1, 1], [1, 0], [0, 1], [0, 0]];
    for (d = 0; d < daysLeft; d++) {
      var NV = [0, 0, 0, 0, 0], A = [false, false, false, false, false];
      for (s = 0; s < 5; s++) {
        var pt = q[THEIRS[s]] * (1 - fog), best = -1e9;
        for (var send = 1; send >= 0; send--) {
          var pm = send ? 1 - fog : 0, v = 0;
          for (k = 0; k < 4; k++) {
            var o = outcomes[k], pr = (o[0] ? pm : 1 - pm) * (o[1] ? pt : 1 - pt);
            if (pr > 0) v += pr * (Bt * o[1] - P.C * o[0] + P.S * o[0] * o[1] - P.H * (1 - o[0]) * (1 - o[1]) + V[4 - 2 * o[0] - o[1]]);
          }
          if (v > best + 1e-12) { best = v; A[s] = send === 1; }
        }
        NV[s] = best;
      }
      V = NV; act = A;
    }
    return act[sit];
  }
  // The harness's milker with the place's stakes: the cold-opening careful game until day `from`
  // (9: after kin has learned twice); from then the best reply in grain to kin's custom (the
  // house's own tallies as they stood at the last season's end) and to any neighbour seen to send
  // after being left short at least 3 times in 5; on day 12 the store's best reply to everyone
  // else. kinOnly: milks kin alone.
  function milker(from, kinOnly) {
    from = from || 9;
    return function (ctx) {
      var inner = careful(true)(ctx), P = ctx.params, kinCustom = P.CUSTOM.slice(), h = [0, 0, 0, 0, 0], n = [0, 0, 0, 0, 0], day = 0, mine = [];
      return function (nb, T) {
        var s;
        if (T.day !== day) {
          for (s = 0; s < mine.length; s++) { n[mine[s][0]]++; if (mine[s][1]) h[mine[s][0]]++; }
          mine = [];
          if (T.day === 5 || T.day === 9) for (s = 0; s < 5; s++) if (n[s] >= 1) kinCustom[s] = h[s] / n[s];
          day = T.day;
        }
        var c = inner(nb, T), short = nb.seen[SHORTED];
        if (T.day >= from) {
          if (nb.kin) c = bestReply(kinCustom, 13 - T.day, nb.situation, P, nb.stock);
          else if (!kinOnly && short.n >= 2 && short.h / short.n >= 0.6) { var r = short.h / short.n; c = bestReply([1, 1, r, 1, r], 13 - T.day, nb.situation, P, nb.stock); }
          else if (T.day === 12) { var b = storeBest(nb, T); if (b !== null) c = b; }
        }
        mine.push([nb.situation, c]);
        return c;
      };
    };
  }

  // Each place's honest policy and selfish act (the tuners replace these: gates(place, { honest,
  // selfish })). honest: a maker or a policy. selfish(nb, view, honestChoice) -> bool | null.
  var HONEST = {
    valley: { name: 'careful', maker: careful(false) },
    banks: { name: 'mender', maker: mender },
    watch: { name: 'careful', maker: careful(false) },
    bridges: { name: 'take-turns', maker: takeTurns },
    saltmarket: { name: 'careful', maker: careful(false) }
  };
  var SELFISH = {
    valley: { name: 'grab (stay home)', act: function () { return false; } },
    banks: { name: 'store-best', act: storeBest },
    watch: { name: 'store-best', act: storeBest },
    bridges: { name: 'store-best', act: storeBest },
    saltmarket: { name: 'store-best', act: storeBest }
  };
  // Schemes particular to a place, added to its battery.
  var SCHEMES = {
    valley: [],
    banks: [{ name: 'careful', maker: careful(false) }, { name: '[1,1,0.5,1,1]', way: [1, 1, 0.5, 1, 1] }],
    watch: [{ name: 'wait-for-them [0,1,1,1,0]', way: [0, 1, 1, 1, 0] }, { name: 'mirror [1,1,0,1,0]', way: [1, 1, 0, 1, 0] }, { name: 'careful+give', maker: lastDays(careful(false), 1, true) }],
    bridges: [{ name: 'push-the-polite', maker: pushPolite }, { name: '[1,0,0,1,1]', way: [1, 0, 0, 1, 1] }, { name: 'take-turns+drive-on-day-12', maker: lastDays(takeTurns, 1, false) }],
    saltmarket: [{ name: '[1,1,0,0,0]', way: [1, 1, 0, 0, 0] }, { name: 'careful+cut-day-12', maker: lastDays(careful(false), 1, false) }, { name: 'mirror [1,1,0,1,0]', way: [1, 1, 0, 1, 0] }]
  };

  // Resolves a policy for a place. opts.honest / opts.selfish override the place's defaults.
  // A policy(view) as a decide-maker (so suffixes such as +selfish2 can wrap it): asked once a day,
  // with the Life's memo in view.memo, its four choices handed out one neighbour at a time.
  function policyAsMaker(fn) {
    return function () {
      var day = -1, ch = null;
      return function (nb, view) {
        if (view.day !== day) {
          day = view.day; ch = {};
          var c = fn(view);
          view.neighbours.forEach(function (x, i) { ch[x.id] = Array.isArray(c) ? !!c[i] : !!c[x.id]; });
        }
        return ch[nb.id];
      };
    };
  }
  // The decide-maker of a battery base name, or null.
  function baseMaker(base, pl) {
    switch (base) {
      case 'always': return five([1, 1, 1, 1, 1]);
      case 'never': return five([0, 0, 0, 0, 0]);
      case 'custom': return five(paramsOf(pl).CUSTOM);
      case 'bully': return bully(2);
      case 'forgiving': return forgiving;
      case 'careful': return careful(false);
      case 'cold': return careful(true);
      case 'one-strike': return function () { return oneStrike(); };
      case 'milker': return milker(9, false);
      case 'milker-kin': return milker(9, true);
      case 'milker-early': return milker(5, false);
      case 'mender': return mender;
      case 'take-turns': return takeTurns;
      case 'push-the-polite': return pushPolite;
    }
    return null;
  }
  // Any policy form as a decide-maker: [5 chances], a battery base name, a policy(view) function,
  // { maker }, { policy } or { way }.
  function asMaker(x, pl) {
    if (Array.isArray(x)) return five(x);
    if (typeof x === 'function') return policyAsMaker(x);
    if (typeof x === 'string') { var b = baseMaker(x, pl); if (!b) throw new Error('PlaceLab: unknown policy "' + x + '"'); return b; }
    if (x && x.maker) return x.maker;
    if (x && x.policy) return policyAsMaker(x.policy);
    if (x && x.way) return five(x.way);
    throw new Error('PlaceLab: cannot use ' + JSON.stringify(x) + ' as a policy');
  }
  function nameOf(x) { return typeof x === 'string' ? x : Array.isArray(x) ? wayStr(x) : (x && (x.name || x.labName)) || 'policy'; }
  // The selfish hook in its object form: { name, act(nb, view, honestChoice) -> bool | null }.
  function selfishOf(x) { return typeof x === 'function' ? { name: x.name || 'selfish', act: x } : x; }

  // Resolves a policy for a place. opts.honest / opts.selfish override the place's defaults:
  //   honest: any policy form (a policy(view) function, { name, policy }, { name, maker }, [5], a name);
  //   selfish: act(nb, view, honestChoice) -> true | false | null (null keeps the honest choice), or { name, act }.
  function resolve(policy, pl, opts) {
    opts = opts || {};
    if (policy && policy.start) return policy;
    if (Array.isArray(policy)) return fromDecide(five(policy), wayStr(policy));
    if (typeof policy === 'function') return fromPolicy(policy);
    if (policy && typeof policy === 'object') {
      if (policy.policy) return fromPolicy(policy.policy, policy.name);
      if (policy.maker) return fromDecide(policy.maker, policy.name);
      if (policy.way) return fromDecide(five(policy.way), policy.name || wayStr(policy.way));
    }
    var name = String(policy), parts = name.split('+'), base = parts[0], maker = null, key = pl ? pl.key : 'valley';
    // A place's own scheme is matched by its whole name first (its name may hold a '+').
    for (var q = 0; SCHEMES[key] && q < SCHEMES[key].length; q++) {
      var whole = SCHEMES[key][q];
      if (whole.name === name) return fromDecide(whole.maker || five(whole.way), name);
    }
    if (base === 'honest') maker = asMaker(opts.honest || HONEST[key], pl);
    else maker = baseMaker(base, pl);
    if (!maker) for (var i = 0; SCHEMES[key] && i < SCHEMES[key].length; i++) if (SCHEMES[key][i].name === base) { var sc = SCHEMES[key][i]; maker = sc.maker || five(sc.way); }
    if (!maker) throw new Error('PlaceLab: unknown policy "' + name + '"');
    var selfish = selfishOf(opts.selfish || SELFISH[key]);
    for (var j = 1; j < parts.length; j++) {
      var m = /^(grab|give|selfish)(\d?)$/.exec(parts[j]), nd;
      if (m) {
        nd = m[2] ? Number(m[2]) : 1;
        maker = lastDays(maker, nd, m[1] === 'grab' ? false : m[1] === 'give' ? true : function (nb, T, c) { return selfish.act(nb, T, c); });
      } else if (parts[j] === 'grab-if-decides') maker = grabIfDecides(maker);
      else throw new Error('PlaceLab: unknown suffix "+' + parts[j] + '"');
    }
    return fromDecide(maker, name);
  }
  // The battery of named policies for a place (PG10, PG11). Each entry: a policy name.
  function battery(pl) {
    pl = place(pl);
    var list = ['always', 'never', 'bully', 'milker', 'milker-kin', 'milker-early', 'one-strike', 'cold', 'careful', 'forgiving',
                'careful+grab', 'careful+grab-if-decides', 'honest', 'honest+selfish1', 'honest+selfish2', 'honest+selfish3'];
    (SCHEMES[pl.key] || []).forEach(function (s) { if (list.indexOf(s.name) < 0) list.push(s.name); });
    return list;
  }

  // ---- living a Life --------------------------------------------------------------------------------
  // playLife(place, policy, seed, script?, opts?) -> { life, choices, days, name, mirrors }
  //   script(day, choices, view) -> choices may overrule a day. mirrors: the harness's G8 flags.
  function playLife(pl, policy, seed, script, opts) {
    pl = place(pl);
    var pol = resolve(policy, pl, opts), life = makeLife(pl, seed), P = life.params;
    var ctx = { seed: life.seed, params: P, place: pl.key, fog: P.FOG }, step = pol.start(ctx), memo = {};
    var choices = [], days = [], mir = { mirror: false, outside: false, unlike: false, around: false };
    function fromYou(why) { return why.source.type === 'you' && why.source.deeds.length >= 1; }
    while (!life.over) {
      var view = AY.today(life);
      view.ways = AY.ways(life); view.seed = life.seed; view.params = P; view.place = pl.key; view.memo = memo;
      var arr = step(view), ch = {};
      view.neighbours.forEach(function (nb, i) { ch[nb.id] = !!arr[i]; });
      if (script) ch = script(view.day, ch, view) || ch;
      var r = AY.playDay(life, ch);
      choices.push(ch); days.push(r);
      if (r.day >= 5) {
        r.results.forEach(function (x) {
          if (!x.kin || !fromYou(x.why)) return;
          mir.mirror = true;
          if (x.why.situation !== BOTH) { mir.outside = true; mir.around = true; }
          var c = P.CUSTOM[x.why.situation];
          if (x.why.habit !== c && x.they !== (c === 1)) mir.unlike = true;
        });
        r.kinWith.forEach(function (x) { if (fromYou(x.why) && x.why.situation !== BOTH) mir.around = true; });
      }
    }
    return { life: life, choices: choices, days: days, name: pol.name, mirrors: mir };
  }

  // ---- measuring ------------------------------------------------------------------------------------
  // Whether a Life's numbers are what the page can show: whole-number stores, need and levels.
  function wholeLife(life, days) {
    if (!isWhole(life.purse) || !isWhole(life.need) || !isWhole(life.old.purse)) return false;
    if (life.stock && !life.stock.every(isWhole)) return false;
    for (var d = 0; d < days.length; d++) {
      if (!isWhole(days[d].gained)) return false;
      for (var i = 0; i < days[d].results.length; i++) {
        var x = days[d].results[i];
        if (!isWhole(x.payoff) || (x.stock !== undefined && (!isWhole(x.stock) || !isWhole(x.stockAfter)))) return false;
      }
    }
    return true;
  }
  // measureKept(place, policy, seeds, opts) -> the store side only, no futures.
  function measureKept(pl, policy, seedList, opts) {
    pl = place(pl);
    var t = now(), kept = [], purses = [], needs = [], whole = true, name = null;
    seedList.forEach(function (seed) {
      var run = playLife(pl, policy, seed, null, opts);
      name = run.name;
      kept.push(run.life.purse >= run.life.need ? 1 : 0); purses.push(run.life.purse); needs.push(run.life.need);
      if (!wholeLife(run.life, run.days)) whole = false;
    });
    var out = { place: pl.label, policy: name, lives: seedList.length, keptPct: 100 * mean(kept), purse: mean(purses), need: mean(needs),
                needMin: Math.min.apply(null, needs), needMax: Math.max.apply(null, needs), whole: whole, kept: kept, purses: purses, seconds: now() - t };
    say('[placelab] measureKept ' + pl.label + ' / ' + name + ': kept ' + f1(out.keptPct) + '% of ' + seedList.length + ' Lives, purse ' + f1(out.purse) +
        ', need ' + f1(out.need) + ' (' + out.needMin + '..' + out.needMax + ')' + (whole ? '' : ', NOT WHOLE') + '  (' + out.seconds.toFixed(1) + ' s)');
    return out;
  }
  // One finished Life through the engine's own verdict (range and what-ifs off; the last-day replay
  // on, so the seal is the engine's).
  function judge(life, futures, whatIfFutures) {
    var v = AY.verdict(life, { futures: futures, whatIfFutures: whatIfFutures, range: false, whatIfs: false }), s = v.seal;
    return { seed: life.seed, purse: life.purse, need: life.need, kept: v.houseKept, holdsPct: v.holdsPct, baselinePct: v.baselinePct,
             mark: v.mark, markSE: v.markSE, lastDay: !!v.lastDay, lastDayDelta: v.lastDay ? v.lastDay.delta : null,
             seal: { earned: s.earned, houseKept: s.houseKept, markClear: s.markClear, boughtOnLastDay: s.boughtOnLastDay,
                     lastDayCost: s.lastDayCost, wonOnLastDay: s.wonOnLastDay === undefined ? null : s.wonOnLastDay } };
  }
  function countsOf(opts) {
    if (typeof opts === 'number') return { futures: opts, whatIfFutures: Math.min(opts, AY.params.WHATIF_FUTURES) };
    opts = opts || {};
    var f = opts.futures || AY.params.FUTURES;
    return { futures: f, whatIfFutures: Math.min(f, opts.whatIfFutures || AY.params.WHATIF_FUTURES) };
  }
  // measureFull(place, policy, seeds, futures | { futures, whatIfFutures }, opts) -> kept, mark, seal and its clauses.
  //   Defaults are the shipped counts: 2000 headline futures, 1000 for the last-day replay.
  function measureFull(pl, policy, seedList, counts, opts) {
    pl = place(pl);
    var c = countsOf(counts), t = now(), rows = [], name = null;
    seedList.forEach(function (seed) {
      var run = playLife(pl, policy, seed, null, opts);
      name = run.name;
      rows.push(judge(run.life, c.futures, c.whatIfFutures));
    });
    var marks = rows.map(function (r) { return r.mark; });
    var out = {
      place: pl.label, policy: name, seeds: seedList.length, futures: c.futures, whatIfFutures: c.whatIfFutures, rows: rows,
      keptPct: share(rows, function (r) { return r.kept; }), purse: mean(rows.map(function (r) { return r.purse; })),
      holdsPct: mean(rows.map(function (r) { return r.holdsPct; })), baselinePct: mean(rows.map(function (r) { return r.baselinePct; })),
      mark: mean(marks), markSEM: sem(marks),
      sealPct: share(rows, function (r) { return r.seal.earned; }),
      markClearPct: share(rows, function (r) { return r.seal.markClear; }),
      lastDayPct: share(rows, function (r) { return r.lastDay; }),
      boughtPct: share(rows, function (r) { return r.seal.boughtOnLastDay; }),
      costPct: share(rows, function (r) { return r.seal.lastDayCost; }),
      wonPct: share(rows, function (r) { return r.seal.wonOnLastDay === true; }),
      seconds: now() - t
    };
    out.sealOverKept = out.keptPct > 0 ? out.sealPct / out.keptPct : 0;
    say('[placelab] measureFull ' + pl.label + ' / ' + name + ': ' + seedList.length + ' seeds at ' + c.futures + '/' + c.whatIfFutures + ': kept ' + f1(out.keptPct) +
        '%, mark ' + sg(out.mark) + ' +-' + f1(out.markSEM) + ', seal ' + f1(out.sealPct) + '% (clear ' + f1(out.markClearPct) + ', last-day entry ' + f1(out.lastDayPct) +
        ', bought ' + f1(out.boughtPct) + ', cost ' + f1(out.costPct) + ', won ' + f1(out.wonPct) + ')  (' + out.seconds.toFixed(1) + ' s)');
    return out;
  }

  // ---- grids ------------------------------------------------------------------------------------------
  function grid() {
    var out = [], v = [0, 0.5, 1], a, b, c, d, e;
    for (a = 0; a < 3; a++) for (b = 0; b < 3; b++) for (c = 0; c < 3; c++) for (d = 0; d < 3; d++) for (e = 0; e < 3; e++) out.push([v[a], v[b], v[c], v[d], v[e]]);
    return out;
  }
  var GRID = grid();
  // grid243(place, seeds, futures): the harness's G4 method. Heir and kin CARRY each of the 243
  // ways in the place the custom's own Life leaves. Ranked by holdsPct (charter-facing), ties by
  // late flow toward the charter's side.
  //   { ways: [243 x { way, holdsPct, mark }] (means, grid order), perSeed: [{ seed, best, trivial, baseline }],
  //     nonTrivialPct, order (grid indices best first by mean holdsPct) }
  function grid243(pl, seedList, futures) {
    pl = place(pl); futures = futures || 200;
    var t = now(), sums = GRID.map(function () { return 0; }), marks = GRID.map(function () { return 0; }), per = [], breaks = paramsOf(pl).CHARTER === 'breaks';
    seedList.forEach(function (seed) {
      var life = makeLife(pl, seed), base = AY.project(life, { history: 'old', futures: futures }).holdsPct;
      var rows = GRID.map(function (c, i) {
        var p = AY.project(life, { history: 'old', custom: c, futures: futures });
        sums[i] += p.holdsPct; marks[i] += p.holdsPct - base;
        return { i: i, holdsPct: p.holdsPct, lateFlow: p.lateFlow };
      });
      rows.sort(function (x, y) { return y.holdsPct - x.holdsPct || (breaks ? x.lateFlow - y.lateFlow : y.lateFlow - x.lateFlow) || x.i - y.i; });
      var best = GRID[rows[0].i];
      per.push({ seed: seed, best: best, trivial: flat(best), baseline: base });
    });
    var ways = GRID.map(function (w, i) { return { way: w, holdsPct: sums[i] / seedList.length, mark: marks[i] / seedList.length }; });
    var order = GRID.map(function (w, i) { return i; }).sort(function (x, y) { return ways[y].holdsPct - ways[x].holdsPct || x - y; });
    var out = { place: pl.label, seeds: seedList.length, futures: futures, ways: ways, perSeed: per, order: order,
                nonTrivialPct: share(per, function (p) { return !p.trivial; }), seconds: now() - t };
    say('[placelab] grid243 ' + pl.label + ': ' + seedList.length + ' seeds x 243 carried ways x ' + futures + ' futures; best is neither all ones nor all zeros in ' +
        f1(out.nonTrivialPct) + '%; best on average ' + wayStr(GRID[order[0]]) + ' ' + f1(ways[order[0]].holdsPct) + '%  (' + out.seconds.toFixed(1) + ' s)');
    return out;
  }
  // sealGrid(place, seeds, counts): each of the 243 ways LIVED for twelve days as a fixed way, judged
  // by the engine's verdict. Ranked by seal rate, then kept rate, then mean mark.
  function sealGrid(pl, seedList, counts) {
    pl = place(pl);
    var c = countsOf(counts || { futures: 200, whatIfFutures: 200 }), t = now();
    var rows = GRID.map(function (w) { return { way: w, seal: 0, kept: 0, mark: 0 }; });
    seedList.forEach(function (seed) {
      GRID.forEach(function (w, i) {
        var j = judge(playLife(pl, w, seed).life, c.futures, c.whatIfFutures);
        if (j.seal.earned) rows[i].seal++; if (j.kept) rows[i].kept++; rows[i].mark += j.mark;
      });
    });
    rows.forEach(function (r) { r.sealPct = 100 * r.seal / seedList.length; r.keptPct = 100 * r.kept / seedList.length; r.mark /= seedList.length; });
    var ranked = rows.slice().sort(function (x, y) { return y.sealPct - x.sealPct || y.keptPct - x.keptPct || y.mark - x.mark; });
    ranked.forEach(function (r, i) { r.rank = i + 1; });
    var out = { place: pl.label, seeds: seedList.length, futures: c.futures, whatIfFutures: c.whatIfFutures, rows: rows, ranked: ranked, seconds: now() - t };
    say('[placelab] sealGrid ' + pl.label + ': 243 lived ways x ' + seedList.length + ' seeds at ' + c.futures + '/' + c.whatIfFutures + '; best by seal ' +
        ranked.slice(0, 3).map(function (r) { return wayStr(r.way) + ' ' + f1(r.sealPct) + '%'; }).join(', ') + '  (' + out.seconds.toFixed(1) + ' s)');
    return out;
  }
  // Spearman rank agreement of two equal-length lists (average ranks for ties).
  function ranks(a) {
    var idx = a.map(function (x, i) { return i; }).sort(function (x, y) { return a[x] - a[y]; }), r = new Array(a.length), i = 0;
    while (i < idx.length) { var j = i; while (j + 1 < idx.length && a[idx[j + 1]] === a[idx[i]]) j++; for (var k = i; k <= j; k++) r[idx[k]] = (i + j) / 2 + 1; i = j + 1; }
    return r;
  }
  function corr(a, b) {
    var ma = mean(a), mb = mean(b), s = 0, sa = 0, sb = 0;
    for (var i = 0; i < a.length; i++) { s += (a[i] - ma) * (b[i] - mb); sa += (a[i] - ma) * (a[i] - ma); sb += (b[i] - mb) * (b[i] - mb); }
    return sa && sb ? s / Math.sqrt(sa * sb) : 0;
  }
  function spearman(a, b) { return corr(ranks(a), ranks(b)); }

  // ---- the harness's methods, in a place ----------------------------------------------------------------
  // G6 (harness habitMatters): the what-if with the largest |delta| among the ten, picked on
  // `futures` futures as verdict() picks it, measured on `futures` fresh ones.
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
  // PG12c: the pull of one act on one tie-day, by situation. The policy is lived; on day d (1..3)
  // the act toward one neighbour is turned the other way, and the policy plays on from there.
  // store: final purse with a hand sent minus with none; mark: holdsPct (charter-facing) the same,
  // on the same futures.
  function pullBySituation(pl, policy, seedList, futures, opts) {
    pl = place(pl); futures = futures || 200;
    var t = now(), by = [0, 1, 2, 3, 4].map(function () { return { store: [], mark: [] }; });
    seedList.forEach(function (seed) {
      var base = playLife(pl, policy, seed, null, opts), baseHolds = AY.project(base.life, { futures: futures }).holdsPct;
      for (var d = 1; d <= 3; d++) {
        base.life.neighbours.forEach(function (id, i) {
          var sit = base.days[d - 1].results[i].situation, sent = base.choices[d - 1][id];
          var alt = playLife(pl, policy, seed, function (day, ch) { if (day === d) { var c = {}; for (var k in ch) c[k] = ch[k]; c[id] = !sent; return c; } return ch; }, opts);
          var altHolds = AY.project(alt.life, { futures: futures }).holdsPct, sign = sent ? 1 : -1;
          by[sit].store.push(sign * (base.life.purse - alt.life.purse));
          by[sit].mark.push(sign * (baseHolds - altHolds));
        });
      }
    });
    var out = by.map(function (b, s) {
      return { situation: s, n: b.store.length, store: mean(b.store), storeSEM: sem(b.store), mark: mean(b.mark), markSEM: sem(b.mark) };
    });
    return { place: pl.label, seeds: seedList.length, futures: futures, rows: out, seconds: now() - t };
  }
  // PG5: the engine lab's check 7 form. Same seed and choices give the same JSON; one choice
  // flipped (days 3 and 12, each neighbour) changes no draw both runs make, draws no key twice with
  // two values, and leaves the need and the custom's purse alone.
  function determinism(pl, policy, seedList, opts) {
    pl = place(pl);
    var t = now(), bad = 0, flips = 0, shared = 0, clash = 0, differ = 0;
    function traced(seed, script) {
      var tape = {};
      AY.trace = function (p, tt, a, b, f, u) { var k = p + ':' + tt + ':' + a + ':' + b + ':' + f; if (k in tape && tape[k] !== u) clash++; tape[k] = u; };
      try {
        var run = playLife(pl, policy, seed, script, opts);
        AY.verdict(run.life, { futures: 10, whatIfs: false, range: false });
      } finally { AY.trace = null; }
      return { run: run, tape: tape };
    }
    seedList.forEach(function (seed) {
      var x = playLife(pl, policy, seed, null, opts), y = playLife(pl, policy, seed, null, opts);
      var jx = JSON.stringify([x.life, x.days, AY.verdict(x.life, { futures: 60 }), AY.runFuture(x.life, 1)]);
      var jy = JSON.stringify([y.life, y.days, AY.verdict(y.life, { futures: 60 }), AY.runFuture(y.life, 1)]);
      if (jx !== jy) bad++;
      var A = traced(seed, null);
      [3, 12].forEach(function (day) {
        A.run.life.neighbours.forEach(function (flipped) {
          var B = traced(seed, function (d) { var c = {}; for (var id in A.run.choices[d - 1]) c[id] = A.run.choices[d - 1][id]; if (d === day) c[flipped] = !c[flipped]; return c; });
          flips++;
          for (var k in A.tape) if (k in B.tape) { shared++; if (A.tape[k] !== B.tape[k]) differ++; }
          if (B.run.life.need !== A.run.life.need || B.run.life.old.purse !== A.run.life.old.purse) differ++;
        });
      });
    });
    return { place: pl.label, seeds: seedList.length, reruns: seedList.length, rerunsDiffer: bad, flips: flips, shared: shared, differ: differ, clash: clash,
             pass: bad === 0 && clash === 0 && differ === 0 && shared > 0, seconds: now() - t };
  }

  // tuneNeed(place, policy, seeds, targetPct, opts): lab.js's need search with the place's rule
  // (STORE_START included). Lives are played once: sound for policies that never read the need.
  //   { NEED_PIVOT, NEED_WEIGHT, MARGIN, keptPct, needMin, also: [{ policy, keptPct }], overrides }
  function tuneNeed(pl, policy, seedList, targetPct, opts) {
    pl = place(pl); opts = opts || {};
    var t = now(), list = [policy].concat(opts.also || []), data = list.map(function () { return []; }), old = [], names = [], P = paramsOf(pl);
    list.forEach(function (w, k) {
      seedList.forEach(function (seed) {
        var run = playLife(pl, w, seed);
        names[k] = run.name; data[k].push(run.life.purse);
        if (k === 0) old.push(run.life.old.purse - P.STORE_START);
      });
    });
    var pivot = opts.pivot !== undefined ? opts.pivot : Math.round(median(old)), weight = opts.weight !== undefined ? opts.weight : P.NEED_WEIGHT;
    function needOf(o, margin) { var pv = pivot + P.STORE_START, op = o + P.STORE_START; return Math.max(op + 1, Math.round(pv + weight * (op - pv) + margin)); }
    function kept(k, margin) { var c = 0; for (var i = 0; i < old.length; i++) if (data[k][i] >= needOf(old[i], margin)) c++; return 100 * c / old.length; }
    var best = null, lo = opts.from !== undefined ? opts.from : -40, hi = opts.to !== undefined ? opts.to : 160;
    for (var m = lo; m <= hi; m += opts.step || 1) {
      var kp = kept(0, m);
      if (!best || Math.abs(kp - targetPct) < Math.abs(best.keptPct - targetPct)) best = { margin: m, keptPct: kp };
    }
    var needs = old.map(function (o) { return needOf(o, best.margin); });
    var ov = {}, key;
    for (key in (pl.overrides || {})) ov[key] = pl.overrides[key];
    ov.NEED_PIVOT = pivot; ov.NEED_WEIGHT = weight; ov.MARGIN = best.margin;
    var out = { NEED_PIVOT: pivot, NEED_WEIGHT: weight, MARGIN: best.margin, keptPct: best.keptPct, needMin: Math.min.apply(null, needs), needMax: Math.max.apply(null, needs),
                also: list.map(function (w, k) { return { policy: names[k], keptPct: kept(k, best.margin) }; }), overrides: ov, seconds: now() - t };
    say('[placelab] tuneNeed ' + pl.label + ': custom earns median ' + f1(median(old)) + ' -> NEED_PIVOT ' + pivot + ', NEED_WEIGHT ' + weight + ', MARGIN ' + best.margin +
        '; need ' + out.needMin + '..' + out.needMax + '; ' + out.also.map(function (r) { return r.policy + ' ' + f1(r.keptPct) + '%'; }).join(', ') + '  (' + out.seconds.toFixed(1) + ' s)');
    return out;
  }

  // timing(place): seconds per 1000 futures, per 1000 Lives, per full verdict at the shipped counts.
  function timing(pl, policy) {
    pl = place(pl);
    var run = playLife(pl, policy || 'honest', 1), t = now();
    AY.project(run.life, { futures: 4000 });
    var perK = (now() - t) / 4;
    t = now();
    for (var n = 1; n <= 200; n++) playLife(pl, policy || 'honest', n);
    var perLives = (now() - t) / 0.2;
    t = now(); AY.verdict(run.life); var full = now() - t;
    var out = { secondsPer1000Futures: perK, secondsPer1000Lives: perLives, fullVerdict: full };
    say('[placelab] timing ' + pl.label + ': 1000 futures of one row ' + perK.toFixed(3) + ' s; 1000 Lives ' + perLives.toFixed(2) + ' s; one full verdict ' + full.toFixed(2) + ' s');
    return out;
  }

  // ---- the gates ------------------------------------------------------------------------------------------
  // Seed bands the gates draw from (fresh: tune below 100000).
  var SEED_BANDS = { lives: 100001, seal: 110001, grid: 120001, spread: 130001, g6: 140001, mirror: 150001, pull: 160001, sealGrid: 170001, det: 180001, speed: 190001 };
  var SCALES = {
    full:  { lives: 2000, seal: 40, sealFutures: 2000, sealWhatIf: 1000, grid: 12, gridFutures: 200, spread: 120, spreadFutures: 200, g6: 120, g6Futures: 1000,
             mirror: 120, pull: 40, pullFutures: 200, sealGrid: 12, sealGridFutures: 200, det: 2, speed: 3 },
    smoke: { lives: 300, seal: 10, sealFutures: 300, sealWhatIf: 200, grid: 3, gridFutures: 60, spread: 12, spreadFutures: 100, g6: 6, g6Futures: 300,
             mirror: 30, pull: 6, pullFutures: 100, sealGrid: 3, sealGridFutures: 100, det: 1, speed: 1 }
  };
  // The valley's best fixed way by seal (PG12a). Computed once by valley-seal-grid.js (see
  // VALLEY_SEAL_GRID_NOTE); gates() uses it unless opts.valleyBest is given or opts.valleySealGrid
  // asks for a fresh run ({ seeds, futures, whatIfFutures }).
  // (the two data files sit beside this file: PLACELAB_DIR, or CHECKS_DIR + '/engine/', or 'checks/engine/' from the repository root)
  var DIR = typeof globalThis.PLACELAB_DIR === 'string' ? globalThis.PLACELAB_DIR : (typeof globalThis.CHECKS_DIR === 'string' ? globalThis.CHECKS_DIR : 'checks') + '/engine/';
  if (!globalThis.PLACELAB_VALLEY_BEST) { try { load(DIR + 'valley-best.js'); } catch (e) { /* not computed yet: PG12a reports "(not set)" */ } }
  // The valley's reference pulls for PG12c (valley-pulls.js: careful, 200 seeds, 200 futures). Without
  // them, PG12c measures the valley on the place's own pull seeds.
  if (!globalThis.PLACELAB_VALLEY_PULLS) { try { load(DIR + 'valley-pulls-data.js'); } catch (e) { /* computed per run instead */ } }
  var VALLEY_BEST = globalThis.PLACELAB_VALLEY_BEST || null;
  var cache = {};
  function cached(key, fn) { if (!(key in cache)) cache[key] = fn(); return cache[key]; }

  // gates(place, opts) -> runs PG1..PG14 and prints a table with pass/fail and timings.
  //   opts: { honest: maker | { name, maker } | policy, selfish: { name, act(nb, view, honestChoice) -> bool|null },
  //           scale: 'full' (default) | 'smoke', counts: { ...override any SCALES entry },
  //           seeds: { lives: [..], seal: [..], ... override a band }, only: ['PG1', ...], valleyBest: [5],
  //           battery: [names] (default battery(place)) }
  function gates(plIn, opts) {
    opts = opts || {};
    var pl = place(plIn), P = paramsOf(pl), K = {}, k;
    var sc = SCALES[opts.scale || 'full'];
    for (k in sc) K[k] = sc[k];
    for (k in (opts.counts || {})) K[k] = opts.counts[k];
    function band(name, n) { return (opts.seeds && opts.seeds[name]) || seeds(SEED_BANDS[name], SEED_BANDS[name] + n - 1); }
    var S = { lives: band('lives', K.lives), seal: band('seal', K.seal), grid: band('grid', K.grid), spread: band('spread', K.spread), g6: band('g6', K.g6),
              mirror: band('mirror', K.mirror), pull: band('pull', K.pull), sealGrid: band('sealGrid', K.sealGrid), det: band('det', K.det), speed: band('speed', K.speed) };
    var pol = { honest: opts.honest || HONEST[pl.key], selfish: selfishOf(opts.selfish || SELFISH[pl.key]) };
    var popts = { honest: pol.honest, selfish: pol.selfish };
    var honestName = 'honest (' + nameOf(pol.honest) + ')';
    var only = opts.only || null, want = function (g) { return !only || only.indexOf(g) >= 0; };
    var rows = [], detail = [], t0 = now(), wasQuiet = PlaceLab.quiet;
    PlaceLab.quiet = true;
    function gate(id, name, measured, threshold, pass, seconds) { rows.push({ id: id, name: name, measured: measured, threshold: threshold, pass: pass, seconds: seconds }); }
    function timed(fn) { var t = now(); var r = fn(); return { r: r, s: now() - t }; }

    var list = opts.battery || battery(pl);
    var kept = {}, full = {}, tk = 0, tf = 0;
    // The store side for every battery policy (PG1, PG11, PG13) and the verdict side (PG2, PG10, PG11).
    if (want('PG1') || want('PG2') || want('PG10') || want('PG11') || want('PG13')) {
      list.forEach(function (name) {
        var a = timed(function () { return measureKept(pl, name, S.lives, popts); }); kept[name] = a.r; tk += a.s;
        if (want('PG2') || want('PG10') || want('PG11')) {
          var b = timed(function () { return measureFull(pl, name, S.seal, { futures: K.sealFutures, whatIfFutures: K.sealWhatIf }, popts); }); full[name] = b.r; tf += b.s;
        }
      });
    }
    var H = kept.honest, HF = full.honest;
    if (want('PG1')) gate('PG1', 'Honest play keeps the house', honestName + ' kept ' + f1(H.keptPct) + '% of ' + S.lives.length + ' Lives', '35..65', H.keptPct >= 35 && H.keptPct <= 65, kept.honest.seconds);
    if (want('PG2')) {
      var s1 = full['honest+selfish1'].sealPct, s2 = full['honest+selfish2'].sealPct, s3 = full['honest+selfish3'].sealPct;
      gate('PG2', 'Last days do not buy the seal', 'seal honest ' + f1(HF.sealPct) + '%, selfish last 1/2/3 days ' + f1(s1) + ' / ' + f1(s2) + ' / ' + f1(s3) + '% (' + S.seal.length + ' seeds at ' + K.sealFutures + '/' + K.sealWhatIf + ')',
           '1 day <= honest; 2, 3 days <= honest + 3', s1 <= HF.sealPct && s2 <= HF.sealPct + 3 && s3 <= HF.sealPct + 3, full['honest+selfish1'].seconds + full['honest+selfish2'].seconds + full['honest+selfish3'].seconds);
    }

    // PG14 early, before anything traces draws (tracing leaves the futures loop slower for a while).
    if (want('PG14')) {
      var g14 = timed(function () {
        return S.speed.map(function (seed) { var life = playLife(pl, 'honest', seed, null, popts).life, t = now(); AY.verdict(life); return now() - t; });
      });
      var slow = Math.max.apply(null, g14.r);
      gate('PG14', 'Cost', 'full verdict at the shipped counts: ' + g14.r.map(function (x) { return x.toFixed(2); }).join(', ') + ' s (' + S.speed.length + ' Lives)', '<= 1.5 s', slow <= 1.5, g14.s);
    }

    // PG3 spread of the place's range ways carried; PG7 the custom's baseline (the harness's G3, G7 forms).
    if (want('PG3') || want('PG7')) {
      var g37 = timed(function () {
        var spreads = [], bases = [], ways = null;
        S.spread.forEach(function (seed) {
          var life = makeLife(pl, seed);
          if (!ways) ways = AY.rangeWays(life);
          var pcts = ways.map(function (c) { return AY.project(life, { history: 'old', custom: c, futures: K.spreadFutures }).holdsPct; });
          spreads.push(Math.max.apply(null, pcts) - Math.min.apply(null, pcts));
          bases.push(AY.project(life, { history: 'old', futures: K.spreadFutures }).holdsPct);
        });
        return { spreads: spreads, bases: bases, ways: ways };
      });
      var sp = g37.r, sh25 = share(sp.spreads, function (x) { return x >= 25; }), inside = share(sp.bases, function (x) { return x >= 15 && x <= 85; });
      if (want('PG3')) gate('PG3', 'Spread of the reference ways', 'the ' + sp.ways.length + ' ways (custom among them: ' + sp.ways.some(function (w) { return sameWay(w, P.CUSTOM); }) + ') carried are >= 25 points apart in ' + f1(sh25) + '% of ' + S.spread.length + ' seeds (median ' + f1(median(sp.spreads)) + ')',
                            '>= 80%', sh25 >= 80, g37.s);
      if (want('PG7')) gate('PG7', 'Not a lottery', 'custom\'s baseline inside 15..85 in ' + f1(inside) + '% of seeds (median ' + f1(median(sp.bases)) + ', ' + f1(Math.min.apply(null, sp.bases)) + '..' + f1(Math.max.apply(null, sp.bases)) + ')',
                            '>= 60%', inside >= 60, want('PG3') ? 0 : g37.s);
    }

    // PG4 the 243 grid carried; PG12 a/b against the valley.
    var G = null, GV = null;
    if (want('PG4') || want('PG12')) {
      var g4 = timed(function () { return grid243(pl, S.grid, K.gridFutures); }); G = g4.r;
      if (want('PG4')) gate('PG4', 'No trivial way', 'best of 243 carried ways is neither all ones nor all zeros in ' + f1(G.nonTrivialPct) + '% of ' + S.grid.length + ' seeds (best on average ' + wayStr(GRID[G.order[0]]) + ')',
                            '>= 80% of >= 12 seeds', G.nonTrivialPct >= 80 && S.grid.length >= 12, g4.s);
    }
    if (want('PG6')) {
      var g6 = timed(function () { return S.g6.map(function (seed) { return habitMatters(playLife(pl, 'honest', seed, null, popts).life, K.g6Futures); }); });
      var fresh = g6.r.map(function (h) { return h.fresh; }), sh5 = share(fresh, function (x) { return x >= 5; });
      gate('PG6', 'A habit matters', 'largest what-if (picked on ' + K.g6Futures + ', measured on ' + K.g6Futures + ' fresh futures) moves holdsPct >= 5 in ' + f1(sh5) + '% of ' + S.g6.length + ' seeds (median ' + f1(median(fresh)) + ')',
           '>= 60%', sh5 >= 60, g6.s);
    }
    if (want('PG8') || want('PG9')) {
      var g8 = timed(function () {
        var three = ['custom', 'forgiving', 'honest'], all = 0, each = {}, sits = [], sitsF = [];
        three.forEach(function (p) { each[p] = 0; });
        S.mirror.forEach(function (seed) {
          var ok = true;
          three.forEach(function (p) {
            var run = playLife(pl, p, seed, null, popts);
            if (run.mirrors.mirror) each[p]++; else ok = false;
            if (p === 'honest') sits.push(run.life.ways.filter(function (w) { return w.n >= 2; }).length);
            if (p === 'forgiving') sitsF.push(run.life.ways.filter(function (w) { return w.n >= 2; }).length);
          });
          if (ok) all++;
        });
        return { all: 100 * all / S.mirror.length, each: each, sits: sits, sitsF: sitsF };
      });
      var M = g8.r;
      if (want('PG8')) gate('PG8', 'The mirror shows', 'kin acts toward the house from a "from you" habit with a dated deed on days 5..12: custom ' + f1(100 * M.each.custom / S.mirror.length) + '%, forgiving ' +
                            f1(100 * M.each.forgiving / S.mirror.length) + '%, honest ' + f1(100 * M.each.honest / S.mirror.length) + '%; all three in ' + f1(M.all) + '% of ' + S.mirror.length + ' seeds', '>= 85%', M.all >= 85, g8.s);
      if (want('PG9')) gate('PG9', 'The situations come up', 'honest: median situations with n >= 2 by day 12 = ' + median(M.sits) + ' (min ' + Math.min.apply(null, M.sits) + '); forgiving ' + median(M.sitsF), 'median >= 4', median(M.sits) >= 4, 0);
    }
    if (want('PG10')) {
      var cap = Math.max(1.5 * HF.sealPct, HF.sealPct + 10), worst = null, ratioBad = [];
      list.forEach(function (n) { var f = full[n]; if (n !== 'honest' && (!worst || f.sealPct > full[worst].sealPct)) worst = n; if (f.sealOverKept > 0.8) ratioBad.push(n + ' ' + f.sealOverKept.toFixed(2)); });
      var over = list.filter(function (n) { return full[n].sealPct > cap; });
      gate('PG10', 'No recipe', list.length + ' policies: highest seal besides honest ' + worst + ' ' + f1(full[worst].sealPct) + '% (cap ' + f1(cap) + '); over the cap: ' + (over.join(', ') || 'none') +
           '; seal/kept > 0.8: ' + (ratioBad.join(', ') || 'none'), 'none over cap, seal/kept <= 0.8', !over.length && !ratioBad.length, tf);
    }
    if (want('PG11')) {
      var trades = list.filter(function (n) { return n !== 'honest' && kept[n].keptPct >= H.keptPct - 3 && full[n].mark <= HF.mark - 10; });
      var okSeal = HF.sealPct >= 10 && HF.sealPct <= 40;
      gate('PG11', 'A trade exists', 'kept within 3 of honest (' + f1(H.keptPct) + '%) with mark >= 10 lower (honest ' + sg(HF.mark) + '): ' + (trades.map(function (n) { return n + ' ' + f1(kept[n].keptPct) + '% ' + sg(full[n].mark); }).join(', ') || 'none') +
           '; honest seal ' + f1(HF.sealPct) + '%', 'a trade, and seal 10..40', trades.length > 0 && okSeal, 0);
    }
    if (want('PG12')) {
      var g12 = timed(function () {
        var vb = opts.valleyBest || (opts.valleySealGrid ? sealGrid('valley', opts.valleySealGrid.seeds, opts.valleySealGrid).ranked[0].way : VALLEY_BEST);
        var SG = sealGrid(pl, S.sealGrid, { futures: K.sealGridFutures, whatIfFutures: K.sealGridFutures });
        var top10 = SG.ranked.slice(0, 10), vbRank = null;
        if (vb) SG.ranked.forEach(function (r) { if (sameWay(r.way, vb)) vbRank = r.rank; });
        GV = cached('valleygrid|' + S.grid.join(',') + '|' + K.gridFutures, function () { return grid243('valley', S.grid, K.gridFutures); });
        var rho = spearman(G.ways.map(function (w) { return w.mark; }), GV.ways.map(function (w) { return w.mark; }));
        var honestV = HONEST.valley;
        var stored = globalThis.PLACELAB_VALLEY_PULLS && !opts.valleyPullsHere;
        var pv = stored ? { seeds: globalThis.PLACELAB_VALLEY_PULLS.seeds, futures: globalThis.PLACELAB_VALLEY_PULLS.futures, rows: globalThis.PLACELAB_VALLEY_PULLS.rows, stored: true }
                        : cached('valleypull|' + S.pull.join(',') + '|' + K.pullFutures, function () { return pullBySituation('valley', 'honest', S.pull, K.pullFutures, { honest: honestV }); });
        var pp = pullBySituation(pl, 'honest', S.pull, K.pullFutures, popts);
        var flips = [], loose = [];
        pp.rows.forEach(function (r, s) {
          var v = pv.rows[s];
          if (r.n < 5 || v.n < 5) return;
          [['store', 'storeSEM'], ['mark', 'markSEM']].forEach(function (q) {
            var clearP = Math.abs(r[q[0]]) >= 2 * r[q[1]] && r[q[0]] !== 0, clearV = Math.abs(v[q[0]]) >= 2 * v[q[1]] && v[q[0]] !== 0;
            var text = AY.SITUATIONS[s].key + ' ' + q[0] + ' ' + sg(r[q[0]]) + ' vs valley ' + sg(v[q[0]]);
            if (clearP && clearV && (r[q[0]] > 0) !== (v[q[0]] > 0)) flips.push(text);
            else if (clearP && !clearV && v[q[0]] !== 0 && (r[q[0]] > 0) !== (v[q[0]] > 0)) loose.push(text + ' (valley not clear: +-' + f1(v[q[1]]) + ')');
          });
        });
        return { vb: vb, vbRank: vbRank, top10: top10, rho: rho, flips: flips, loose: loose, pp: pp, pv: pv, SG: SG };
      });
      var R12 = g12.r, a = R12.vb && R12.vbRank !== null && R12.vbRank > 10, b = R12.rho < 0.8, c = R12.flips.length > 0;
      gate('PG12', 'Different from the valley', '(a) valley\'s best by seal ' + (R12.vb ? wayStr(R12.vb) : '(not set)') + ' ranks #' + R12.vbRank + ' of 243 by seal here; (b) Spearman of carried marks ' + R12.rho.toFixed(2) +
           '; (c) opposite clear pulls by day 3: ' + (R12.flips.join('; ') || 'none'), '(a) not top 10, (b) < 0.8, (c) one', a && (b || (pl.key === 'watch' && a && c)) && c, g12.s);
      detail.push('  PG12 top 10 by seal here (' + S.sealGrid.length + ' seeds at ' + K.sealGridFutures + '/' + K.sealGridFutures + '): ' + R12.top10.map(function (r) { return wayStr(r.way) + ' ' + f1(r.sealPct); }).join('  '));
      if (globalThis.PLACELAB_VALLEY_SEAL_GRID) detail.push('  PG12 the valley\'s top four by seal (valley-best.js) rank here: ' + globalThis.PLACELAB_VALLEY_SEAL_GRID.top.slice(0, 4).map(function (t) {
        var rk = null; R12.SG.ranked.forEach(function (r) { if (sameWay(r.way, t.way)) rk = r.rank; }); return wayStr(t.way) + ' (valley ' + f1(t.sealPct) + '%) #' + rk; }).join(', '));
      detail.push('  PG12 pulls by day 3 (here ' + S.pull.length + ' seeds, ' + K.pullFutures + ' futures; valley ' + (R12.pv.stored ? 'from valley-pulls-data.js, ' + R12.pv.seeds + ' seeds, ' + R12.pv.futures + ' futures' : 'on the same seeds') +
                  '; sending instead of staying home; store / mark +-sem; n):');
      R12.pp.rows.forEach(function (r, s) { var v = R12.pv.rows[s];
        detail.push('      ' + padr(AY.SITUATIONS[s].key, 8) + ' here store ' + sg(r.store) + ' +-' + f1(r.storeSEM) + ', mark ' + sg(r.mark) + ' +-' + f1(r.markSEM) + ' (n ' + r.n + ')   valley store ' + sg(v.store) + ' +-' + f1(v.storeSEM) +
                    ', mark ' + sg(v.mark) + ' +-' + f1(v.markSEM) + ' (n ' + v.n + ')'); });
      if (R12.loose.length) detail.push('  PG12 (c) not counted, the valley\'s pull not clear of zero: ' + R12.loose.join('; '));
      if (pl.key === 'watch' && !b) detail.push('  PG12 (b) missed by the Watch: rank agreement ' + R12.rho.toFixed(2) + ' (allowed when (a) and (c) pass; report the gap)');
    }
    if (want('PG13')) {
      var needMin = Infinity, needMax = -Infinity, whole = true, levelsOk = true;
      Object.keys(kept).forEach(function (n) { needMin = Math.min(needMin, kept[n].needMin); needMax = Math.max(needMax, kept[n].needMax); if (!kept[n].whole) whole = false; });
      if (P.STOCK) S.det.concat(S.speed).forEach(function (seed) {
        var life = playLife(pl, 'honest', seed, null, popts).life;
        [0, 1, 2].forEach(function (i) { AY.runFuture(life, i).seasons.forEach(function (x) { if (!x.ties || !x.ties.every(isWhole)) levelsOk = false; }); });
      });
      gate('PG13', 'Page sanity', 'need ' + needMin + '..' + needMax + ' over ' + Object.keys(kept).length + ' policies x ' + S.lives.length + ' Lives; stores, payoffs and levels whole: ' + (whole && levelsOk), 'need > 0 and <= 300, whole',
           needMin > 0 && needMax <= 300 && whole && levelsOk, 0);
    }
    // PG5 last: it sets AfterYou.trace, after which the futures loop runs slower.
    if (want('PG5')) {
      var d5 = timed(function () { return determinism(pl, 'honest', S.det, popts); }), D = d5.r;
      gate('PG5', 'Determinism with the dials on', 'reruns that differ ' + D.rerunsDiffer + ' of ' + D.reruns + '; ' + D.flips + ' choices flipped, ' + D.shared + ' shared draws, ' + D.differ + ' differ, ' + D.clash + ' keys with two values',
           'all 0', D.pass, d5.s);
    }
    PlaceLab.quiet = wasQuiet;
    var order = ['PG1', 'PG2', 'PG3', 'PG4', 'PG5', 'PG6', 'PG7', 'PG8', 'PG9', 'PG10', 'PG11', 'PG12', 'PG13', 'PG14'];
    rows.sort(function (x, y) { return order.indexOf(x.id) - order.indexOf(y.id); });
    var out = { place: pl.label, scale: opts.scale || 'full', counts: K, honest: nameOf(pol.honest), selfish: pol.selfish.name || 'selfish', rows: rows, kept: kept, full: full,
                grid: G, valleyGrid: GV, detail: detail, pass: rows.every(function (r) { return r.pass; }), seconds: now() - t0 };
    if (!PlaceLab.quiet) printGates(out, list);
    return out;
  }
  function printGates(out, list) {
    print('');
    print('==== gates: ' + out.place + '   scale ' + out.scale + '   honest ' + out.honest + '   selfish ' + out.selfish);
    print('counts: ' + JSON.stringify(out.counts));
    out.rows.forEach(function (r) {
      print((r.pass ? 'PASS' : 'FAIL') + '  ' + padr(r.id, 5) + padr(r.name, 32) + r.measured + '   [needs ' + r.threshold + ']  (' + r.seconds.toFixed(1) + ' s)');
    });
    out.detail.forEach(function (l) { print(l); });
    if (Object.keys(out.full).length) {
      print('  battery (kept over ' + out.counts.lives + ' Lives; the rest over ' + out.counts.seal + ' seeds at ' + out.counts.sealFutures + '/' + out.counts.sealWhatIf + ' futures):');
      print('      ' + padr('policy', 30) + pad('kept%', 7) + pad('purse', 8) + pad('mark', 7) + pad('+-sem', 6) + pad('seal%', 7) + pad('s/k', 6) + pad('lastday%', 9) + pad('bought%', 8) + pad('cost%', 7) + pad('won%', 6));
      list.forEach(function (n) {
        var k = out.kept[n], f = out.full[n];
        print('      ' + padr(n, 30) + pad(f1(k.keptPct), 7) + pad(f1(k.purse), 8) + pad(sg(f.mark), 7) + pad(f1(f.markSEM), 6) + pad(f1(f.sealPct), 7) + pad(f.sealOverKept.toFixed(2), 6) +
              pad(f1(f.lastDayPct), 9) + pad(f1(f.boughtPct), 8) + pad(f1(f.costPct), 7) + pad(f1(f.wonPct), 6));
      });
    }
    var ran = out.rows.length === 14 ? '' : ' (' + out.rows.length + ' of 14 gates run)';
    print((out.pass ? 'ALL GATES PASS' : 'SOME GATES FAIL') + ran + '  for ' + out.place + '  (' + out.seconds.toFixed(1) + ' s)');
  }

  var PlaceLab = {
    quiet: false, AY: AY,
    seeds: seeds, place: place, playLife: playLife, measureKept: measureKept, measureFull: measureFull, grid243: grid243, sealGrid: sealGrid,
    battery: battery, gates: gates, determinism: determinism, habitMatters: habitMatters, pullBySituation: pullBySituation, tuneNeed: tuneNeed, timing: timing,
    resolve: resolve, fromDecide: fromDecide, fromPolicy: fromPolicy, spearman: spearman,
    makers: { five: five, bully: bully, forgiving: forgiving, careful: careful, oneStrike: function () { return oneStrike; }, mender: mender, takeTurns: takeTurns,
              pushPolite: pushPolite, milker: milker, lastDays: lastDays, grabIfDecides: grabIfDecides, bestReply: bestReply,
              policyAsMaker: policyAsMaker, asMaker: function (x, pl) { return asMaker(x, place(pl || 'valley')); } },
    acts: { storeBest: storeBest, expected: expected },
    HONEST: HONEST, SELFISH: SELFISH, SCHEMES: SCHEMES, SEED_BANDS: SEED_BANDS, SCALES: SCALES, GRID: GRID,
    get VALLEY_BEST() { return VALLEY_BEST; }, setValleyBest: function (w) { VALLEY_BEST = w; },
    stats: { mean: mean, sd: sd, sem: sem, median: median, share: share }
  };
  globalThis.PlaceLab = PlaceLab;
})();
