// The Watch (border towers): the place's honest policy, its selfish act and its schemes, as fix-watch ships them.
// They are the tuner's (tune-watch/policies.js) word for word, with one change, the breaker's §2.3 fix: a tower's
// record is read as the page shows it. After a tower changes a way at a season's end, the page shows only its
// record since then ("They changed a way at the end of day 8. Counted since then."; today().seenSince), so a
// player judges it afresh: its record is seenSince and its second chances are new.
//   PlaceLab.gates('watch', { honest: FWP.honest, selfish: FWP.selfish });   with FWP.installSchemes() first.
// Situations, from the house's own side: 0 NEW, 1 BOTH (both stood down), 2 SHORTED (you stood down, they kept
// watch), 3 OWING (you kept watch, they stood down), 4 NEITHER (both kept watch). nb.seen[s] / nb.seenSince[s] =
// { h, n }: that tower's acts by ITS situation. Its own OWING row (it kept watch while the other stood down: did
// it then stand down?) is its record of answering a tower that went first.
var FWP = (function () {
  var NEW = 0, BOTH = 1, SHORTED = 2, OWING = 3, NEITHER = 4;
  function rec(nb) { return nb.changedDay !== null ? nb.seenSince : nb.seen; }   // what the page shows
  // Does this tower answer a tower that went first? Known once it has been in that spot at least twice.
  function answers(nb) { var r = rec(nb)[OWING]; return r.n < 2 || 2 * r.h >= r.n; }
  // A tower's second chances start again when the page starts its record again.
  function era(view, nb) {
    var m = view.memo, e = m.era || (m.era = {}), f = m.afterFire || (m.afterFire = {}), s = m.afterStandoff || (m.afterStandoff = {});
    if (e[nb.id] !== nb.changedDay) { e[nb.id] = nb.changedDay; delete f[nb.id]; delete s[nb.id]; }
    return { fire: f, standoff: s };
  }
  // HONEST, "first to stand down, with second chances":
  //   Stand down to every tower on the first day: somebody has to go first.
  //   Keep standing down with any tower that stood down with you, and answer any tower that stood down to you.
  //   If a tower kept watch on you, or you both kept watch, stand down again (a fire may be a shadow), unless it
  //   is known not to answer; even then, give each tower one second chance after a fire and one after a standoff.
  //   After that, keep watch on a tower that never answers.
  function honest(view) {
    return view.neighbours.map(function (nb) {
      var s = nb.situation, ch = era(view, nb);
      if (s === NEW || s === BOTH || s === OWING) return true;
      if (answers(nb)) return true;
      if (s === SHORTED && !ch.fire[nb.id]) { ch.fire[nb.id] = true; return true; }
      if (s === NEITHER && !ch.standoff[nb.id]) { ch.standoff[nb.id] = true; return true; }
      return false;
    });
  }
  // SELFISH (the last days): stand down only where a stand-down is expected back today; otherwise keep watch.
  // Expected = it mostly stood down in the spot it is now in (as the page shows it), or, knowing nothing there,
  // the two stood down together yesterday. With the place's stakes this is the store's best reply today.
  function expected(nb) { var theirs = rec(nb)[[0, 1, 3, 2, 4][nb.situation]]; return theirs.n ? 2 * theirs.h >= theirs.n : nb.situation === BOTH; }
  function selfish(nb, view, honestChoice) { if (!honestChoice) return null; return expected(nb); }
  // The Watch's own schemes for the battery (PG10, PG11), page-true like honest:
  //   first        goes first on day 1 and after a standoff only toward towers not known to refuse; no second chances
  //   brave        always goes first again after a standoff, even to a tower that never answers
  //   watch-first  keeps watch toward every stranger on day 1, then plays as honest
  //   careful+give the valley's careful, standing down to everyone on the last day
  //   first, last night on watch   first all Life, then keeps watch toward everyone on day 12 (nothing comes back
  //                after winter): the Watch's own form of the valley's careful+grab (added by fix-watch)
  function first(view) { return view.neighbours.map(function (nb) { var s = nb.situation; return s === NEW || s === BOTH || s === OWING || answers(nb); }); }
  function brave(view) { return view.neighbours.map(function (nb) { return nb.situation !== SHORTED || answers(nb); }); }
  function watchFirst(view) { var c = honest(view); return view.neighbours.map(function (nb, i) { return nb.situation === NEW ? false : c[i]; }); }
  function installSchemes(PL) {
    PL = PL || globalThis.PlaceLab;
    PL.SCHEMES.watch = [
      { name: 'first (no second chances)', maker: PL.makers.policyAsMaker(first) },
      { name: 'brave (always reopens)', maker: PL.makers.policyAsMaker(brave) },
      { name: 'watch-first', maker: PL.makers.policyAsMaker(watchFirst) },
      { name: 'careful+give', maker: PL.makers.lastDays(PL.makers.careful(false), 1, true) },
      { name: 'first, last night on watch', maker: PL.makers.lastDays(PL.makers.policyAsMaker(first), 1, false) }
    ];
    return PL.SCHEMES.watch.map(function (s) { return s.name; });
  }
  return {
    honest: { name: 'first to stand down, second chances (page-true)', policy: honest },
    selfish: { name: 'keep watch unless answered (page-true)', act: selfish },
    honestFn: honest, selfishFn: selfish, answers: answers, expected: expected, rec: rec,
    schemes: { first: first, brave: brave, watchFirst: watchFirst }, installSchemes: installSchemes
  };
})();
globalThis.FWP = FWP;
FWP.installSchemes(globalThis.PlaceLab);
