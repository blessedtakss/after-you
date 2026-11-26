// gates() at the full counts (2000 Lives for kept rates, 40 seeds at 2000/1000 for seals, 12 grid seeds,
// 120 seeds for G3/G6/G7/G8/G9 forms) for one place (GATES.place) by its preset key, createLife(seed, key), with
// the ways of playing the final rounds used (lab.js, final-ways.js), then the lead's reading of the result.
// From the repository root (run-gates.sh does this):
//   jsc -e "var GATES = { place: 'banks' }" checks/engine/gates-full.js
load((typeof CHECKS_DIR === 'string' ? CHECKS_DIR : 'checks') + '/engine/lab.js');
var PLACE = GATES.place;
if (!PLACE || !AfterYou.PLACES.hasOwnProperty(PLACE)) throw new Error('gates-full.js: GATES.place must be one of ' + AfterYou.PLACE_ORDER.join(', '));
print('valley best fixed way by seal (PG12a): ' + JSON.stringify(PlaceLab.VALLEY_BEST));
var OUT = PlaceLab.gates(PLACE, gateOpts(PLACE, 'full'));
print('');
print('engine: ' + (GATES.engine || 'engine.js') + '; ' + waysLine(PLACE) + '; options: ' + JSON.stringify(gateOpts(PLACE, 'full'), function (k, v) { return k === 'honest' || k === 'selfish' ? (v && v.name) : v; }));
readGates(OUT);
