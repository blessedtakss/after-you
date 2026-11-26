// The ways of playing that the final rounds (the fixers and the confirmation round) used for each place, set up
// for PlaceLab.gates() the way the confirmation round set them up. Load after the engine and placelab.js.
// Sets globalThis.FINAL_WAYS[place] = { honest, selfish, counts, source }; where honest and selfish are absent,
// placelab's own are used.
//   valley      placelab's own: careful, with the valley's grab (stay home) as the selfish act.
//   banks       ways/banks.js (the fixer's): honest "the peacemaker", selfish "fish across where it pays". The
//               confirmation round passed the fixer's other file, fx-policies.js with honest 'pm1', which makes the
//               same choices (the fixer measured no difference in 500 Lives); placelab's battery for the Banks.
//   watch       ways/watch.js (the fixer's, as shipped): honest "first to stand down, second chances (page-true)",
//               selfish "keep watch unless answered (page-true)". Loading it puts the Watch's five schemes in its
//               battery (PlaceLab.SCHEMES.watch). At the full counts the two the fixer raised are kept, as the
//               confirmation round ran them: PG12c's pulls on 200 seeds, PG12a's seal grid on 24.
//   bridges     ways/bridges-tuner.js, ways/bridges-breaker.js and ways/bridges.js (the fixer's): honest "take
//               turns, at the jams too", selfish "cross while you can". Placelab's Bridges defaults are set to them
//               and its battery is extended to the fixer's 57 (placelab's 16 and 3, the tuner's 8 and the fixer's
//               30, by name, the first of a name kept), as the confirmation round did.
//   saltmarket  ways/saltmarket.js (the tuner's, kept by the fixer): honest "never puts the price back", selfish
//               "hold on (keep the price where honest would cut it)"; placelab's battery for the Saltmarket.
// The situations by number, as globals: the breaker's Bridges schemes read them.
var NEW = 0, BOTH = 1, SHORTED = 2, OWING = 3, NEITHER = 4;
var THEIRS = [0, 1, 3, 2, 4];
(function () {
  var D = (typeof globalThis.CHECKS_DIR === 'string' ? globalThis.CHECKS_DIR : 'checks') + '/engine/ways/';
  var L = globalThis.PlaceLab;
  if (!L) throw new Error('final-ways.js: load placelab.js first');
  load(D + 'banks.js');            // BANKS_FIX
  load(D + 'watch.js');            // FWP; puts the Watch's five schemes into PlaceLab.SCHEMES.watch
  load(D + 'bridges-tuner.js');    // Bridges: the tuner's turn forms
  load(D + 'bridges-breaker.js');  // BX: the breaker's schemes, which the fixer's battery reuses
  load(D + 'bridges.js');          // BridgesFix
  load(D + 'saltmarket.js');       // SaltPolicies
  // The Bridges' battery, as the confirmation round built it (from the fixer's fx-common.js and fx-battery.js).
  L.HONEST.bridges = BridgesFix.honest;
  L.SELFISH.bridges = BridgesFix.selfish;
  (function () {
    var seen = {}, out = [];
    function asEntry(s) { return s.policy ? { name: s.name, maker: L.makers.policyAsMaker(s.policy) } : s; }
    L.SCHEMES.bridges.concat(Bridges.schemes.map(asEntry)).concat(BridgesFix.schemes.map(asEntry))
      .forEach(function (s) { if (!seen[s.name]) { seen[s.name] = true; out.push(s); } });
    L.SCHEMES.bridges = out;
  })();
  globalThis.FINAL_WAYS = {
    valley: { source: 'placelab\'s own for the valley: careful, grab on the last days' },
    banks: { honest: BANKS_FIX.honest, selfish: BANKS_FIX.selfish, source: 'ways/banks.js' },
    watch: { honest: FWP.honest, selfish: FWP.selfish, counts: { pull: 200, sealGrid: 24 }, source: 'ways/watch.js, its five schemes in the battery' },
    bridges: { honest: BridgesFix.honest, selfish: BridgesFix.selfish, source: 'ways/bridges-tuner.js, bridges-breaker.js, bridges.js; battery of ' + L.battery('bridges').length },
    saltmarket: { honest: SaltPolicies.honest, selfish: SaltPolicies.holdOn, source: 'ways/saltmarket.js' }
  };
})();
