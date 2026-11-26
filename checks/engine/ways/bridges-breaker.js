// The breaker's schemes for the Bridges, beyond the tuner's battery. Each is a policy(view) or
// { name, policy }. A policy sees only what the page shows (today(), the house's own ways, a memo).
// Load after bb-common.js.  Sets globalThis.BX = { list: [...], byName: {...}, fns }.
(function () {
  var F = Bridges.fns, takeTurns = F.takeTurns, cww = F.crossWhileYouCan, likely = F.likelyToGiveWay;
  function favoured(view, s) { var w = view.ways[s]; return w.n ? 2 * w.h >= w.n : view.params.CUSTOM[s] === 1; }
  // base policy with act(nb, view, baseChoice, i) applied on the days where when(day) holds.
  function on(base, when, act, name) {
    return { name: name, policy: function (view) {
      var c = base(view);
      if (!when(view.day)) return c;
      return view.neighbours.map(function (nb, i) { var a = act(nb, view, c[i], i); return a === null || a === undefined ? c[i] : a; });
    } };
  }
  function days(a, b) { return function (d) { return d >= a && d <= b; }; }
  function dayIn(list) { return function (d) { return list.indexOf(d) >= 0; }; }
  // A carter seen to drive on again after crossing (its OWING: it drove on, the other gave way), and
  // never seen to give way there: the pusher test a carter can make by day 2 or 3.
  function pushy(nb) { var t = nb.seen[OWING]; return t.n >= 1 && t.h === 0; }
  // give way to a pusher on your own turn (the store's half of "cross while you can")
  function yieldPusher(nb, view, c) { return nb.situation === SHORTED && c === false && pushy(nb) ? true : null; }
  // drive on where the other looks likely to give way and the honest act was to give way (the milk half)
  function milk(nb, view, c) { return c === true && likely(nb) ? false : null; }
  // the R2-aware day-12 act: play the house's own habit in that situation wherever that serves the
  // store at least as well as the honest act (so nothing on day 12 is against habit).
  function storeVal(give, nb) {     // today's payoff with the other's act as likely
    var g = likely(nb);
    if (give) return g ? 0 : -1;
    return g ? 3 : -2;
  }
  function habitGrab(nb, view, c) {
    var fav = favoured(view, nb.situation);
    if (fav === c) return null;
    return storeVal(fav, nb) >= storeVal(c, nb) ? fav : null;
  }
  // day 12: follow the habit whatever it says (R2 can never fire)
  function habitAlways(nb, view, c) { return favoured(view, nb.situation); }
  // the best day-12 act among those R2 cannot reverse: the store-best act if it is with habit, else
  // the habit act (never against habit)
  function habitBest(nb, view, c) {
    var fav = favoured(view, nb.situation), best = storeVal(true, nb) >= storeVal(false, nb);
    return best === fav ? best : fav;
  }

  // turns-after-jams with memory of jams (the tuner's) but give way to pushers on your own turn
  function tajYield(view) {
    var c = F.turnsAfterJams(view);
    return view.neighbours.map(function (nb, i) { return nb.situation === SHORTED && pushy(nb) ? true : c[i]; });
  }
  // take turns everywhere; after locked wheels with a pusher, drive on again (lock them up for good)
  function lockPushers(view) {
    var c = takeTurns(view);
    return view.neighbours.map(function (nb, i) { return nb.situation === NEITHER && pushy(nb) ? false : c[i]; });
  }
  // take turns with your sister always giving way / always driving on / honest elsewhere
  function kinRule(rule) {
    return function (view) {
      var c = takeTurns(view);
      return view.neighbours.map(function (nb, i) { return nb.kin ? rule(nb, view, c[i]) : c[i]; });
    };
  }
  // strict alternation by the calendar with each carter: give way on odd days, drive on on even days
  function calendar(view) { return view.neighbours.map(function () { return view.day % 2 === 1; }); }
  // half-turn after jams, but with memory: after a jam with someone you have jammed with before, drive on
  // the first time and give way the second (like turns-after-jams) only toward pushers; with others give way
  function tajPushersOnly(view) {
    var jams = view.memo.jp || (view.memo.jp = {}), c = takeTurns(view);
    return view.neighbours.map(function (nb, i) {
      if (nb.situation !== NEITHER) return c[i];
      jams[nb.id] = (jams[nb.id] || 0) + 1;
      return pushy(nb) ? jams[nb.id] % 2 === 1 : true;
    });
  }
  // base policy; on the listed days, when the store looks short of the need at the end (purse now +
  // today's likely payoffs + the average day so far for the days after today), switch the ties where
  // the store's best reply gains most until the shortfall (+ spare) is covered; only if it can be
  // covered today. Uses only what the page shows (purse, need, day, what each carter has done).
  function grabIfShort(base, grabDays, spare) {
    return function (view) {
      var c = base(view), m = view.memo;
      if (m.startPurse === undefined) m.startPurse = view.purse;
      if (grabDays.indexOf(view.day) < 0) return c;
      var avg = view.day > 1 ? (view.purse - m.startPurse) / (view.day - 1) : 0, today = 0, gains = [];
      view.neighbours.forEach(function (nb, i) {
        var mine = storeVal(c[i], nb), alt = storeVal(!c[i], nb);
        today += mine;
        if (alt > mine) gains.push({ i: i, g: alt - mine });
      });
      var end = view.purse + today + avg * (12 - view.day), short = view.need + (spare || 0) - end;
      if (short <= 0) return c;
      gains.sort(function (a, b) { return b.g - a.g; });
      var could = 0; gains.forEach(function (x) { could += x.g; });
      if (short > could) return c;
      var out = c.slice();
      for (var k = 0; k < gains.length && short > 0; k++) { out[gains[k].i] = !out[gains[k].i]; short -= gains[k].g; }
      return out;
    };
  }
  // Take turns, but never wait a second day running after you both waited: "if you both waited
  // yesterday and the day before, go" (the memory clause can otherwise hold two polite carters in
  // "both waited" for the rest of the Life). unstuckN: go after n days running of both waiting.
  function unstuckN(base, n) {
    return function (view) {
      var run = view.memo.bothRun || (view.memo.bothRun = {}), c = base(view);
      return view.neighbours.map(function (nb, i) {
        run[nb.id] = nb.situation === BOTH ? (run[nb.id] || 0) + 1 : 0;
        return nb.situation === BOTH && run[nb.id] >= n ? false : c[i];
      });
    };
  }
  function unstuck(base) { return unstuckN(base, 2); }
  // [1,0,0,1,0.5] played as a person would: after locked wheels, alternate per carter; after both
  // waited, drive on; turns otherwise (= turns-after-jams without memory of anything else)
  var list = [
    { name: 'honest', policy: takeTurns },
    { name: 'turns-after-jams', policy: F.turnsAfterJams },
    on(takeTurns, days(9, 11), cww, 'cross-while-you-can days 9-11 only'),
    on(takeTurns, days(9, 11), yieldPusher, 'yield to pushers days 9-11 only'),
    on(takeTurns, days(11, 11), cww, 'cross-while-you-can day 11 only'),
    on(takeTurns, days(5, 8), cww, 'cross-while-you-can days 5-8'),
    on(takeTurns, days(1, 4), cww, 'cross-while-you-can days 1-4'),
    on(takeTurns, dayIn([4, 8]), cww, 'cross-while-you-can on season ends 4, 8'),
    on(takeTurns, dayIn([3, 4, 7, 8, 11]), cww, 'cross-while-you-can before each round (3,4,7,8,11)'),
    on(takeTurns, days(12, 12), habitGrab, 'take-turns + habit-grab day 12'),
    on(takeTurns, days(12, 12), habitAlways, 'take-turns + follow habit day 12'),
    on(takeTurns, days(12, 12), habitBest, 'take-turns + best-with-habit day 12'),
    on(takeTurns, days(10, 12), habitBest, 'take-turns + best-with-habit days 10-12'),
    on(takeTurns, days(1, 12), yieldPusher, 'yield to pushers (quick test) all Life'),
    on(takeTurns, days(1, 12), milk, 'milk the polite all Life'),
    on(takeTurns, days(9, 12), milk, 'milk the polite days 9-12'),
    { name: 'lock the pushers', policy: lockPushers },
    { name: 'tat-jams + yield to pushers', policy: tajYield },
    { name: 'half turns after jams with pushers only', policy: tajPushersOnly },
    { name: 'sister: always give way', policy: kinRule(function () { return true; }) },
    { name: 'sister: always drive on', policy: kinRule(function () { return false; }) },
    { name: 'sister: milk', policy: kinRule(function (nb, v, c) { return c && likely(nb) ? false : c; }) },
    { name: 'calendar turns (odd days give way)', policy: calendar },
    on(F.turnsAfterJams, days(9, 11), cww, 'turns-after-jams + cww days 9-11'),
    on(F.turnsAfterJams, days(12, 12), habitBest, 'turns-after-jams + best-with-habit day 12'),
    on(F.turnsAfterJams, days(10, 12), cww, 'turns-after-jams + cww days 10-12'),
    // ---- second wave (indices 26..) ----
    on(takeTurns, days(1, 1), function () { return false; }, 'strangers: drive on, then take turns'),
    on(F.turnsAfterJams, days(1, 1), function () { return false; }, 'turns-after-jams, strangers drive on'),
    on(F.turnsAfterJams, days(9, 11), yieldPusher, 'turns-after-jams + yield to pushers days 9-11'),
    on(F.turnsAfterJams, days(7, 11), cww, 'turns-after-jams + cww days 7-11'),
    on(on(F.turnsAfterJams, days(9, 11), cww, 'x').policy, days(12, 12), habitBest, 'turns-after-jams + cww 9-11 + best-with-habit 12'),
    on(takeTurns, days(8, 11), cww, 'cross-while-you-can days 8-11 only'),
    on(on(F.turnsAfterJams, days(1, 1), function () { return false; }, 'x').policy, days(9, 11), cww, 'tat-jams, strangers drive on, cww 9-11'),
    on(tajPushersOnly, days(9, 11), cww, 'half turns w/ pushers + cww 9-11'),
    // ---- third wave (indices 34..) ----
    on(takeTurns, days(9, 11), milk, 'milk the polite days 9-11'),
    on(takeTurns, days(5, 11), milk, 'milk the polite days 5-11'),
    on(on(takeTurns, days(9, 11), milk, 'x').policy, days(12, 12), habitBest, 'milk 9-11 + best-with-habit 12'),
    on(F.turnsAfterJams, days(9, 11), milk, 'turns-after-jams + milk 9-11'),
    on(calendar, days(9, 11), milk, 'calendar + milk 9-11'),
    // ---- fourth wave (indices 39..): grab only when the store is short, before day 12 ----
    { name: 'take-turns + grab-if-short day 11', policy: grabIfShort(takeTurns, [11], 0) },
    { name: 'take-turns + grab-if-short days 10-11', policy: grabIfShort(takeTurns, [10, 11], 0) },
    { name: 'take-turns + grab-if-short day 11 (+2 spare)', policy: grabIfShort(takeTurns, [11], 2) },
    { name: 'turns-after-jams + grab-if-short day 11', policy: grabIfShort(F.turnsAfterJams, [11], 0) },
    { name: 'turns-after-jams + grab-if-short days 10-11', policy: grabIfShort(F.turnsAfterJams, [10, 11], 0) },
    { name: 'take-turns + grab-if-short day 12', policy: grabIfShort(takeTurns, [12], 0) },
    { name: 'calendar + grab-if-short days 10-11', policy: grabIfShort(calendar, [10, 11], 0) },
    // ---- fifth wave (46..): the honest rule as a thoughtful carter would keep it ----
    { name: 'honest, unstuck', policy: unstuck(takeTurns) },
    { name: 'honest, unstuck after 3', policy: unstuckN(takeTurns, 3) },
    // ---- sixth wave (48..): combinations ----
    on(unstuck(takeTurns), days(9, 11), milk, 'unstuck + milk 9-11'),
    { name: 'unstuck + half turns w/ pushers', policy: unstuck(tajPushersOnly) },
    on(unstuck(tajPushersOnly), days(9, 11), milk, 'unstuck + half turns w/ pushers + milk 9-11'),
    { name: 'unstuck turns-after-jams', policy: unstuck(F.turnsAfterJams) }
  ];
  var byName = {};
  list.forEach(function (p) { byName[p.name] = p; });
  globalThis.BX = { list: list, byName: byName, fns: { on: on, days: days, dayIn: dayIn, pushy: pushy, yieldPusher: yieldPusher, milk: milk, habitGrab: habitGrab,
    habitAlways: habitAlways, habitBest: habitBest, favoured: favoured, storeVal: storeVal, kinRule: kinRule, tajYield: tajYield, lockPushers: lockPushers } };
})();
