// The Banks (fixed): the honest policy and the selfish act, as functions for PlaceLab (e1/placelab.js).
// Load after the engine and placelab.js. Sets globalThis.BANKS_FIX. (The gate scripts use fx-policies.js 'pm1',
// which makes the same choices: t-same-policies-out.txt.)
//
// A "hand" in the Banks is keeping to your own water (true); fishing across is false. The policy sees only what
// the page shows: today(life) + { ways, seed, params, place, memo }.
//
// honest, "the peacemaker", in one sentence: keep to your water with a boat you have not fished beside and with any
// boat that kept to its water yesterday; when their nets were in your water and yours were not in theirs, let a
// first slip go from a boat that has kept to its water before, and otherwise fish across theirs; when you both
// fished across yesterday, keep to your water to offer peace.
// (It is the breaker's peace-every1. Against a boat that never keeps off it offers peace every other day: the day
// after an offer is refused you are the one left short, and you answer.)
//
// selfish act, "fish across where it pays": on the last day fish across every neighbour's water (the store's best on
// the day whatever they do); on the days before it (the last 2 or 3 days), fish across only boats that will not answer
// before the end: not the sister, a boat seen to keep to its water after being fished across (at least 60% of the times
// seen), on a day after you both kept off. (Fishing across everyone a day early is not selfish here: they answer on the
// last day and the store loses what their water was worth.) What it costs falls on the banks the heir inherits.
(function () {
  'use strict';
  var BOTH = 1, SHORTED = 2, NEITHER = 4;
  function peacemaker(view) {
    var m = view.memo.peacemaker || (view.memo.peacemaker = { miss: {}, ever: {} });
    return view.neighbours.map(function (nb) {
      var id = nb.id, y = nb.yesterday;
      if (!y) return true;                                                  // a boat you have not fished beside
      if (y.they) { m.miss[id] = 0; m.ever[id] = true; return true; }       // they kept to their water yesterday
      m.miss[id] = (m.miss[id] || 0) + 1;                                   // their nets were in your water
      if (nb.situation === NEITHER) return true;                            // you both fished across: offer peace
      return !!m.ever[id] && m.miss[id] < 2;                                // let a first slip go from a known keeper
    });
  }
  function fishAcross(nb, view, honestChoice) {
    if (view.day === 12) return false;
    var t = nb.seen[SHORTED];
    return !nb.kin && t.n >= 1 && t.h / t.n >= 0.6 && nb.situation === BOTH ? false : null;   // null: the honest choice
  }
  function withLastDays(n) {
    return function (view) {
      var c = peacemaker(view);
      if (view.day <= 12 - n) return c;
      return view.neighbours.map(function (nb, i) { var a = fishAcross(nb, view, c[i]); return a === null ? c[i] : a; });
    };
  }
  globalThis.BANKS_FIX = {
    honest: { name: 'the peacemaker', policy: peacemaker },
    selfish: { name: 'fish across where it pays', act: fishAcross },
    fns: { peacemaker: peacemaker, fishAcross: fishAcross, honestSelfish1: withLastDays(1), honestSelfish2: withLastDays(2), honestSelfish3: withLastDays(3) }
  };
})();
