// The Bridges: the honest policy and the selfish last-day act, written as functions for PlaceLab.
// Load after engine-places.js and placelab.js:
//   load(E1 + 'engine-places.js'); load(E1 + 'placelab.js'); load(TB + 'policies.js');
// Sets globalThis.Bridges = { honest, selfish, selfish1, selfish2, selfish3, schemes, fns }.
//
// In the Bridges a "hand" is GIVING WAY and "staying home" is DRIVING ON. The player's situation
// on a tie, as the engine counts it from what arrived yesterday:
//   NEW      not met at the bridge yet
//   BOTH     yesterday you both gave way (nobody crossed)
//   SHORTED  yesterday you gave way and they drove on (they crossed: today is your turn)
//   OWING    yesterday you drove on and they gave way (you crossed: today is their turn)
//   NEITHER  yesterday you both drove on (the wheels locked)
// A policy sees only what the page shows: today(life) plus the house's own tallies (view.ways)
// and a memo kept for the whole Life (view.memo). Founder kinds are never read.
(function () {
  'use strict';
  var NEW = 0, BOTH = 1, SHORTED = 2, OWING = 3, NEITHER = 4;
  var THEIRS = [0, 1, 3, 2, 4];   // my situation on a tie -> theirs

  // ---- the honest policy ----------------------------------------------------------------------
  // Taking turns, as a carter keeps them:
  //   "Let a carter you have not met go first. After one of you crossed, the other goes next.
  //    If your wheels locked, give way. If you both waited, go; but with a carter whose wheels
  //    have locked with yours before, wait and let them go."
  // (The seat's take-turns, which is placelab's placeholder, written as a policy(view).)
  // The memory is per carter; the house's ways count by situation only, so on day 12 an act of
  // this policy can go against the house's own habit (after both waited) and be replayed.
  function takeTurns(view) {
    var locked = view.memo.locked || (view.memo.locked = {});
    return view.neighbours.map(function (nb) {
      switch (nb.situation) {
        case NEW: return true;                              // let a stranger go first
        case SHORTED: return false;                         // they crossed yesterday: your turn
        case OWING: return true;                            // you crossed yesterday: their turn
        case NEITHER: locked[nb.id] = true; return true;    // wheels locked: give way
        default: return !!locked[nb.id];                    // both waited: go, unless you have locked with them
      }
    });
  }

  // ---- the selfish act ------------------------------------------------------------------------
  // Whether this carter looks likely to give way today: what the house has seen it do in the
  // situation it is now in (its side of the tie), at least a quarter of the time. With nothing seen
  // there, what it has done anywhere; with nothing seen at all, yes. A quarter is where driving on
  // starts to pay on the day: +3 when they wait (against 0), -2 on locked wheels (against -1).
  function likelyToGiveWay(nb) {
    var t = nb.seen[THEIRS[nb.situation]];
    if (t.n) return 4 * t.h >= t.n;
    var h = 0, n = 0;
    for (var s = 0; s < 5; s++) { h += nb.seen[s].h; n += nb.seen[s].n; }
    return n ? 4 * h >= n : true;
  }
  // "Cross while you can": with no tomorrow to take turns for, play each bridge for today's loads
  // alone. Drive on wherever the other carter looks likely to give way (above all when it was
  // their turn: you crossed yesterday and cross again), and give way wherever they look likely to
  // drive on (even when it was your turn: -1 rather than locked wheels at -2). It writes "push the
  // polite, give way to the pushy" into the house's ways, which the heir carries into the road.
  // act(nb, view, honestChoice) -> true (give way) | false (drive on) | null (keep the honest choice).
  function crossWhileYouCan(nb, view, honestChoice) {
    var mine = !likelyToGiveWay(nb);
    return mine === honestChoice ? null : mine;
  }
  // The brief's named last-day act alone: drive on when it was their turn (you crossed yesterday)
  // and they look likely to give way again. (Serves the store only against a carter who gives way
  // twice running.) A place scheme, not the selfish act.
  function driveOnInTheirTurn(nb, view, honestChoice) {
    if (nb.situation === OWING && honestChoice === true && likelyToGiveWay(nb)) return false;
    return null;
  }
  // The same, whatever they are likely to do (it locks wheels with a carter who takes his turn).
  function pushInTheirTurn(nb, view, honestChoice) {
    return nb.situation === OWING && honestChoice === true ? false : null;
  }

  // ---- other turn-taking forms (place schemes; not the honest policy) ---------------------------
  // Strict turns: no memory; after both waited always go. Five chances [1,0,0,1,1].
  function strictTurns(view) {
    return view.neighbours.map(function (nb) { return [true, false, false, true, true][nb.situation]; });
  }
  // Turns that take it in turn after a jam too: after locked wheels give way the first time, hold
  // the next, and so on, with each carter separately ("half a turn after locked wheels").
  function turnsAfterJams(view) {
    var jams = view.memo.jams || (view.memo.jams = {});
    return view.neighbours.map(function (nb) {
      switch (nb.situation) {
        case NEW: return true;
        case SHORTED: return false;
        case OWING: return true;
        case NEITHER: jams[nb.id] = (jams[nb.id] || 0) + 1; return jams[nb.id] % 2 === 1;
        default: return false;
      }
    });
  }
  // Turns, but give way to a carter never seen to give way to anyone ("no use locking wheels with
  // a pusher").
  function turnsYieldToPushers(view) {
    var base = takeTurns(view);
    return view.neighbours.map(function (nb, i) {
      var h = 0, n = 0;
      for (var s = 0; s < 5; s++) { h += nb.seen[s].h; n += nb.seen[s].n; }
      return n >= 3 && h === 0 ? true : base[i];
    });
  }

  // base policy with act(nb, view, baseChoice) applied from day `from` on.
  function withAct(base, act, name, from) {
    return { name: name, policy: function (view) {
      var c = base(view);
      if (view.day < from) return c;
      return view.neighbours.map(function (nb, i) { var a = act(nb, view, c[i]); return a === null ? c[i] : a; });
    } };
  }

  var B = {
    honest: { name: 'take-turns', policy: takeTurns },
    selfish: { name: 'cross while you can', act: crossWhileYouCan },
    fns: { takeTurns: takeTurns, crossWhileYouCan: crossWhileYouCan, likelyToGiveWay: likelyToGiveWay, driveOnInTheirTurn: driveOnInTheirTurn,
           pushInTheirTurn: pushInTheirTurn, strictTurns: strictTurns, turnsAfterJams: turnsAfterJams, turnsYieldToPushers: turnsYieldToPushers, withAct: withAct,
           takeTurnsWithMemory: takeTurns }   // the name the explore3..8 scripts used for this same policy
  };
  // The 1-, 2- and 3-day variants: the selfish act on the last 1, 2 or 3 days. PlaceLab's
  // 'honest+selfish1/2/3' build the same thing from B.honest and B.selfish.act; these are the
  // stand-alone forms.
  B.selfish1 = withAct(takeTurns, crossWhileYouCan, 'take-turns + cross while you can, last day', 12);
  B.selfish2 = withAct(takeTurns, crossWhileYouCan, 'take-turns + cross while you can, last 2 days', 11);
  B.selfish3 = withAct(takeTurns, crossWhileYouCan, 'take-turns + cross while you can, last 3 days', 10);
  // Place schemes for the battery (PG10, PG11), beside placelab's push-the-polite, [1,0,0,1,1]
  // (strict turns) and take-turns+drive-on-day-12.
  B.schemes = [
    withAct(takeTurns, driveOnInTheirTurn, 'take-turns + drive on in their turn, last day', 12),
    withAct(takeTurns, driveOnInTheirTurn, 'take-turns + drive on in their turn, last 3 days', 10),
    withAct(takeTurns, pushInTheirTurn, 'take-turns + push in their turn, last day', 12),
    withAct(takeTurns, crossWhileYouCan, 'take-turns + cross while you can, last season', 9),
    { name: 'turns-after-jams', policy: turnsAfterJams },
    { name: 'turns-yield-to-pushers', policy: turnsYieldToPushers },
    { name: '[1,0,0,1,0.5]', way: [1, 0, 0, 1, 0.5] },
    { name: '[1,0.5,0,1,1]', way: [1, 0.5, 0, 1, 1] }
  ];
  globalThis.Bridges = B;
})();
