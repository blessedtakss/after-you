// Smoke test: gates() once on each place (the valley with careful as honest and its grab as selfish; each other
// place with the ways of playing the final rounds used, lab.js and final-ways.js), at the small 'smoke' counts.
// The numbers say that the lab runs and roughly where each preset stands; they are not the gate verdicts.
// From the repository root (run-gates.sh smoke does this):
//   jsc checks/engine/gates-smoke.js            (GATES.place: one place instead of all five)
load((typeof CHECKS_DIR === 'string' ? CHECKS_DIR : 'checks') + '/engine/lab.js');
print('placelab smoke run; valley best fixed way by seal (PG12a): ' + JSON.stringify(PlaceLab.VALLEY_BEST));
var t0 = preciseTime(), SUMMARY = [];
(GATES.place && GATES.place !== 'all' ? [GATES.place] : AfterYou.PLACE_ORDER).forEach(function (key) {
  var out = PlaceLab.gates(key, gateOpts(key, 'smoke'));
  SUMMARY.push('smoke: ' + key + '  ' + out.rows.filter(function (r) { return r.pass; }).length + ' of ' + out.rows.length + ' pass at the smoke counts' +
               (out.pass ? '' : ' (not passing there: ' + out.rows.filter(function (r) { return !r.pass; }).map(function (r) { return r.id; }).join(', ') + ')') + '; ' + waysLine(key));
});
print('');
print('smoke run finished in ' + (preciseTime() - t0).toFixed(1) + ' s');
print('');
print('engine: ' + (GATES.engine || 'engine.js'));
SUMMARY.forEach(function (l) { print(l); });
