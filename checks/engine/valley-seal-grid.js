// The valley's best fixed way by seal (PG12a), computed once for every place's gates.
// Each of the 243 ways {0, 0.5, 1}^5 is lived for twelve days in the valley and judged by the
// engine's own verdict at the shipped counts (2000 headline futures, 1000 for the last-day replay),
// on seeds 170001..170024. Writes valley-best.js (the copy in checks/engine/ is loaded by placelab.js) and prints the top 20.
//   jsc checks/engine/valley-seal-grid.js
// (Run from the repository root. It writes into checks/out/, or OUT_DIR, never over the file in checks/engine/;
//  compare the two to see whether the reference still holds.)
var DIR = typeof globalThis.OUT_DIR === 'string' ? globalThis.OUT_DIR : 'checks/out/';
load('engine.js'); load((typeof globalThis.CHECKS_DIR === 'string' ? globalThis.CHECKS_DIR : 'checks') + '/engine/placelab.js');
var SEEDS = PlaceLab.seeds(170001, 170024), t0 = preciseTime();
var G = PlaceLab.sealGrid('valley', SEEDS, { futures: 2000, whatIfFutures: 1000 });
var best = G.ranked[0];
print('valley seal grid: 243 lived ways x ' + SEEDS.length + ' seeds (170001..170024) at 2000/1000 futures, ' + (preciseTime() - t0).toFixed(0) + ' s');
G.ranked.slice(0, 20).forEach(function (r) { print('  #' + r.rank + '  [' + r.way.join(',') + ']  seal ' + r.sealPct.toFixed(1) + '%  kept ' + r.keptPct.toFixed(1) + '%  mark ' + r.mark.toFixed(1)); });
['[1,1,0,1,0]', '[1,1,1,1,1]', '[0,0,0,0,0]'].forEach(function (s) { G.ranked.forEach(function (r) { if ('[' + r.way.join(',') + ']' === s) print('  named ' + s + ' #' + r.rank + ' seal ' + r.sealPct.toFixed(1) + '% kept ' + r.keptPct.toFixed(1) + '% mark ' + r.mark.toFixed(1)); }); });
var ties = G.ranked.filter(function (r) { return r.sealPct === best.sealPct; }).length;
writeFile(DIR + 'valley-best.js', '// written by valley-seal-grid.js: the valley\'s best fixed way by seal (243 lived ways, seeds 170001..170024, 2000/1000 futures)\n' +
  'globalThis.PLACELAB_VALLEY_BEST = ' + JSON.stringify(best.way) + ';\n' +
  'globalThis.PLACELAB_VALLEY_SEAL_GRID = ' + JSON.stringify({ seeds: SEEDS.length, futures: 2000, whatIfFutures: 1000, top: G.ranked.slice(0, 20).map(function (r) { return { way: r.way, sealPct: r.sealPct, keptPct: r.keptPct, mark: r.mark }; }) }) + ';\n');
print('best ' + JSON.stringify(best.way) + ' (ways sharing its seal rate: ' + ties + '); wrote valley-best.js');
