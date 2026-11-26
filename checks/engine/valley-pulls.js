// The valley's reference pulls for PG12c, measured once on a large sample so that their signs are
// established: careful lived on 200 seeds (165001..165200); on each of days 1..3 the act toward one
// neighbour is turned the other way and careful plays on; store and mark pulls by situation
// (sending instead of staying home), 200 futures. Writes valley-pulls-data.js (the copy in checks/engine/ is loaded by placelab.js).
//   jsc checks/engine/valley-pulls.js
// (Run from the repository root. It writes into checks/out/, or OUT_DIR, never over the file in checks/engine/;
//  compare the two to see whether the reference still holds.)
var DIR = typeof globalThis.OUT_DIR === 'string' ? globalThis.OUT_DIR : 'checks/out/';
load('engine.js'); load((typeof globalThis.CHECKS_DIR === 'string' ? globalThis.CHECKS_DIR : 'checks') + '/engine/placelab.js');
var t0 = preciseTime(), R = PlaceLab.pullBySituation('valley', 'careful', PlaceLab.seeds(165001, 165200), 200);
R.rows.forEach(function (r) {
  print('  ' + AfterYou.SITUATIONS[r.situation].key + ': store ' + r.store.toFixed(2) + ' +-' + r.storeSEM.toFixed(2) + ', mark ' + r.mark.toFixed(2) + ' +-' + r.markSEM.toFixed(2) + ' (n ' + r.n + ')');
});
writeFile(DIR + 'valley-pulls-data.js', '// written by valley-pulls.js: the valley\'s pulls by situation on days 1..3 (careful, seeds 165001..165200, 200 futures)\n' +
  'globalThis.PLACELAB_VALLEY_PULLS = ' + JSON.stringify({ seeds: 200, from: 165001, futures: 200, policy: 'careful', rows: R.rows }) + ';\n');
print('valley pulls: 200 seeds x 200 futures in ' + (preciseTime() - t0).toFixed(1) + ' s; wrote valley-pulls-data.js');
