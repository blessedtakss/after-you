// The Bridges, as fixed: the honest policy, the selfish last-day act and the place schemes for the
// battery, written as functions for PlaceLab. Load after engine-places.js, placelab.js, the tuner's
// policies.js (tune-bridges/policies.js, which defines the turn forms reused here) and the breaker's
// bb-schemes.js (break-bridges/bb-schemes.js). fx-common.js does all of that.
// Sets globalThis.BridgesFix = { honest, selfish, schemes, fns }.
//
// In the Bridges a "hand" is GIVING WAY and "staying home" is DRIVING ON. Situations (the player's):
//   NEW not met yet; BOTH you both gave way yesterday (nobody crossed); SHORTED you gave way and they
//   crossed (your turn today); OWING you crossed and they gave way (their turn); NEITHER both drove on
//   (the wheels locked). A policy sees only what the page shows: today(), the house's own ways and a
//   memo kept for the whole Life. Founder kinds are never read.
(function () {
  'use strict';
  var NEW = 0, BOTH = 1, SHORTED = 2, OWING = 3, NEITHER = 4;
  var F = Bridges.fns, X = BX.fns;

  // ---- the honest policy ------------------------------------------------------------------------
  // "Take turns, at the jams too":
  //   Let a carter you have not met go first. After one of you crossed, the other goes next. If you
  //   both waited, go. If your wheels locked, give way the first time, and the next time they lock
  //   with that carter it is their turn to give way (and so on, by turns, with each carter).
  // It is the tuner's turns-after-jams scheme, unchanged (the memory is per carter: the number of
  // times the wheels have locked with that carter).
  function takeTurnsAtJams(view) { return F.turnsAfterJams(view); }

  // ---- the selfish act (the tuner's, unchanged) -------------------------------------------------
  // "Cross while you can": drive on wherever the other looks likely to give way, give way wherever
  // they look likely to drive on. act(nb, view, honestChoice) -> true | false | null.
  var crossWhileYouCan = F.crossWhileYouCan;

  function withAct(base, act, name, from) { return F.withAct(base, act, name, from); }
  function on(base, when, act, name) { return X.on(base, when, act, name); }

  var honest = { name: 'take turns, at the jams too', policy: takeTurnsAtJams };
  var selfish = { name: 'cross while you can', act: crossWhileYouCan };

  // ---- place schemes for the battery (PG10, PG11) -----------------------------------------------
  // (placelab adds its own three: push-the-polite, [1,0,0,1,1], take-turns+drive-on-day-12.)
  var schemes = [
    // the honest rule with the brief's and the tuner's last-day acts
    withAct(takeTurnsAtJams, F.driveOnInTheirTurn, 'jams-turns + drive on in their turn, last day', 12),
    withAct(takeTurnsAtJams, F.driveOnInTheirTurn, 'jams-turns + drive on in their turn, last 3 days', 10),
    withAct(takeTurnsAtJams, F.pushInTheirTurn, 'jams-turns + push in their turn, last day', 12),
    withAct(takeTurnsAtJams, crossWhileYouCan, 'jams-turns + cross while you can, last season', 9),
    // the tuner's honest policy and its last-day forms, now schemes
    { name: 'take-turns (give way after a jam)', policy: F.takeTurns },
    withAct(F.takeTurns, crossWhileYouCan, 'take-turns + cross while you can, last 3 days', 10),
    withAct(F.takeTurns, F.driveOnInTheirTurn, 'take-turns + drive on in their turn, last day', 12),
    { name: 'turns-yield-to-pushers', policy: F.turnsYieldToPushers },
    // the road's fixed ways (tuner's and breaker's)
    { name: '[1,0,0,1,0.5]', way: [1, 0, 0, 1, 0.5] },
    { name: '[1,0.5,0,1,1]', way: [1, 0.5, 0, 1, 1] },
    { name: '[1,0.5,0,1,0.5]', way: [1, 0.5, 0, 1, 0.5] },
    { name: '[0.5,0,0,1,0.5]', way: [0.5, 0, 0, 1, 0.5] },
    { name: '[0,0,0,1,0.5]', way: [0, 0, 0, 1, 0.5] },
    // the breaker's schemes that broke PG10, and their neighbours
    BX.byName['half turns after jams with pushers only'],
    BX.byName['unstuck + half turns w/ pushers'],
    BX.byName['lock the pushers'],
    BX.byName['honest, unstuck'],
    BX.byName['calendar turns (odd days give way)'],
    BX.byName['unstuck + half turns w/ pushers + milk 9-11'],
    BX.byName['half turns w/ pushers + cww 9-11'],
    BX.byName['take-turns + grab-if-short days 10-11'],
    // the breaker's turns-after-jams forms: with honest = turns-after-jams these are the honest rule
    // with a grab, a milk or a yield before the last day (R2 sees day 12 only)
    BX.byName['turns-after-jams + cww days 9-11'],
    BX.byName['turns-after-jams + cww days 7-11'],
    BX.byName['turns-after-jams + cww days 10-12'],
    BX.byName['turns-after-jams + grab-if-short day 11'],
    BX.byName['turns-after-jams + grab-if-short days 10-11'],
    BX.byName['turns-after-jams + milk 9-11'],
    BX.byName['turns-after-jams + yield to pushers days 9-11'],
    BX.byName['tat-jams + yield to pushers'],
    BX.byName['turns-after-jams + best-with-habit day 12'],
    BX.byName['turns-after-jams + cww 9-11 + best-with-habit 12'],
    BX.byName['turns-after-jams, strangers drive on'],
    on(takeTurnsAtJams, X.days(11, 11), crossWhileYouCan, 'jams-turns + cross while you can day 11 only'),
    on(takeTurnsAtJams, X.days(10, 12), X.habitBest, 'jams-turns + best-with-habit days 10-12')
  ];
  schemes.forEach(function (s, i) { if (!s) throw new Error('policies.js: scheme ' + i + ' not found'); });
  globalThis.BridgesFix = { honest: honest, selfish: selfish, schemes: schemes,
    fns: { takeTurnsAtJams: takeTurnsAtJams, crossWhileYouCan: crossWhileYouCan } };
})();
