// Shared setup for gates-full.js and gates-smoke.js: the engine, the gate lab and the ways of playing, and the
// gate reading of LEAD-DECISIONS 2.6 and 4.3. Run from the repository root (run-gates.sh does). GATES (a global,
// all fields optional) says what to run:
//   engine  the engine file to test (default 'engine.js', the working tree's)
//   ways    'final' (default): the ways of playing the final rounds used (final-ways.js);
//           'placeholder': placelab's own placeholder policies, as the first gate runs had them
//   place   a PLACES key, or 'all'
//   pool    a seal count of at least 200 reads PG10's ratio part and PG11's seal floor and ceiling on that pool
//   opts    more options for PlaceLab.gates(): { counts, seeds, only, battery } (counts merged over the place's)
var GATES = typeof GATES === 'object' && GATES ? GATES : {};
var CHECKS_ENGINE = (typeof CHECKS_DIR === 'string' ? CHECKS_DIR : 'checks') + '/engine/';
load(GATES.engine || 'engine.js');
load(CHECKS_ENGINE + 'placelab.js');
if (!PlaceLab.VALLEY_BEST || !globalThis.PLACELAB_VALLEY_PULLS || !globalThis.PLACELAB_VALLEY_SEAL_GRID)
  throw new Error('placelab.js did not find valley-best.js and valley-pulls-data.js in ' + CHECKS_ENGINE + ' (run from the repository root)');
var WAYS_KIND = GATES.ways || 'final';
if (WAYS_KIND === 'final') load(CHECKS_ENGINE + 'final-ways.js');
else if (WAYS_KIND !== 'placeholder') throw new Error('GATES.ways must be \'final\' or \'placeholder\', not ' + JSON.stringify(WAYS_KIND));

// The options for PlaceLab.gates(key, ...) at a scale, with the ways of playing in force.
function gateOpts(key, scale) {
  var o = { scale: scale }, w = WAYS_KIND === 'final' ? FINAL_WAYS[key] : {}, x = GATES.opts || {}, k;
  if (w.honest) o.honest = w.honest;
  if (w.selfish) o.selfish = w.selfish;
  var counts = {};
  if (scale === 'full' && w.counts) for (k in w.counts) counts[k] = w.counts[k];
  if (GATES.pool) counts.seal = GATES.pool;
  for (k in (x.counts || {})) counts[k] = x.counts[k];
  if (Object.keys(counts).length) o.counts = counts;
  ['seeds', 'only', 'battery'].forEach(function (f) { if (x[f]) o[f] = x[f]; });
  return o;
}
function waysLine(key) {
  if (WAYS_KIND !== 'final') return 'ways of playing: placelab\'s placeholders';
  return 'ways of playing: the final rounds\', ' + FINAL_WAYS[key].source;
}

// The reading of LEAD-DECISIONS 2.6 and 4.3 on placelab's gates() result. PG10's ratio part and PG11's seal floor
// and ceiling are read on at least 200 pooled seeds: on fewer (placelab's full count is 40) they are reported and not
// read, as a 40-seed band is noise and not a failure. On a pool, the ratio is judged only for policies with at least
// 20 kept Lives in the pool, and a policy is over the line only when its seal/kept is above 0.8 by more than two
// standard errors (sqrt(p(1-p)/kept)). PG14 is timed on the machine as it is (the lead reads it on a quiet one).
// Prints the reading and a last line "READ: PASS" or "READ: FAIL"; returns true on PASS.
function readGates(out) {
  var n = out.counts.seal, pooled = n >= 200, byId = {}, read = {}, notRead = [], na = out.place === 'valley' ? ['PG12'] : [];
  out.rows.forEach(function (r) { byId[r.id] = r; });
  print('');
  print('reading (LEAD-DECISIONS 2.6 and 4.3) for ' + out.place + ': PG10\'s ratio part and PG11\'s seal floor and ceiling are read on at least 200 pooled seeds; this run measured ' + n + ' seal seeds');
  if (byId.PG10 && byId.PG11 && out.full.honest) {
    if (pooled) {
      var HF = out.full.honest, cap = Math.max(1.5 * HF.sealPct, HF.sealPct + 10), over = [], ratioOver = [], unjudged = [];
      print('  ' + ('policy' + new Array(40).join(' ')).slice(0, 40) + ' kept  sealed  seal/kept     se');
      Object.keys(out.full).forEach(function (name) {
        var f = out.full[name], k = 0, s = 0, flag = '';
        f.rows.forEach(function (r) { if (r.kept) k++; if (r.seal.earned) s++; });
        var p = k ? s / k : 0, se = k ? Math.sqrt(p * (1 - p) / k) : 0;
        if (f.sealPct > cap) { over.push(name + ' ' + f.sealPct.toFixed(1) + '%'); flag += '  OVER THE CAP'; }
        if (k < 20) { unjudged.push(name + ' (' + k + ' kept)'); flag += '  (ratio not judged: fewer than 20 kept)'; }
        else if (p - 0.8 > 2 * se) { ratioOver.push(name + ' ' + p.toFixed(3) + ' (se ' + se.toFixed(3) + ')'); flag += '  OVER THE LINE'; }
        print('  ' + (name + new Array(40).join(' ')).slice(0, Math.max(40, name.length + 1)) + ('    ' + k).slice(-5) + ('       ' + s).slice(-8) + ('          ' + p.toFixed(3)).slice(-11) + ('       ' + se.toFixed(3)).slice(-7) + flag);
      });
      read.PG10 = !over.length && !ratioOver.length;
      read.PG11 = byId.PG11.pass;
      print('  PG10 read: ' + (read.PG10 ? 'PASS' : 'FAIL') + '  over the cap (' + cap.toFixed(1) + '%): ' + (over.join(', ') || 'none') + '; seal/kept above 0.8 by more than 2 se: ' + (ratioOver.join(', ') || 'none') +
            '; ratio not judged: ' + (unjudged.join(', ') || 'none'));
      print('  PG11 read: ' + (read.PG11 ? 'PASS' : 'FAIL') + '  placelab\'s PG11 on the same ' + n + ' seeds: ' + byId.PG11.measured);
    } else {
      notRead = ['PG10', 'PG11'];
      print('  PG10 and PG11 not read: ' + n + ' seeds is a band, not a pool (40-seed bands are noise and not a failure); run-gates.sh full <place> --pool reads them on 200 seeds');
    }
  }
  if (na.length) print('  PG12 not applicable: the valley is the reference PG12 holds every place against, and it cannot differ from itself (its carried marks agree with themselves; the first gate run called PG12 meaningless for the valley); the valley\'s own play is held by run-identity.sh');
  var fails = [], counted = 0;
  out.rows.forEach(function (r) {
    if (notRead.indexOf(r.id) >= 0 || na.indexOf(r.id) >= 0) return;
    counted++;
    if (!(r.id in read ? read[r.id] : r.pass)) fails.push(r.id);
  });
  if (fails.indexOf('PG14') >= 0) print('  PG14 failed as timed on this machine as it was; the lead reads PG14 on a quiet machine (or by CPU time per verdict): run the place alone to read it');
  var ok = fails.length === 0;
  print('READ: ' + (ok ? 'PASS' : 'FAIL') + '  for ' + out.place + '  (' + counted + ' gates read' + (na.length ? '; PG12 not applicable to the valley' : '') + (notRead.length ? '; PG10 and PG11 not read on a band of ' + n + ' seeds' : (byId.PG10 ? '; PG10 and PG11 read on ' + n + ' pooled seeds' : '')) +
        (fails.length ? '; failing: ' + fails.join(', ') : '') + ')');
  return ok;
}
