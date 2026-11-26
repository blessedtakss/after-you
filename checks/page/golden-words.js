/*
 * The valley's sentences as a fingerprint (read-only: nothing in the game folder is written).
 * Run FROM THE GAME FOLDER (page-smoke.js loads engine.js and words.js by relative path):
 *   cd "<game folder>" && jsc "<this file>"
 * It runs the game's own page-smoke.js unchanged except for one hook in checkString, so every
 * sentence the smoke test checks (each top-level AYWords call, in order, with its function name)
 * goes into a running FNV-1a hash. After words.js is rebuilt on a lexicon, the same command must
 * print the same hash for the valley: then the valley's copy is byte-identical on these Lives.
 * It also counts, per AYWords function, the sentences and the distinct sentence shapes (digits
 * and family names blanked), which sizes the lexicon a new place has to fill.
 */
var __h = 0x811c9dc5 >>> 0, __n = 0, __per = {}, __shapes = {}, __chars = 0;
function __acc(s, fn) {
  var t = fn + '\u0001' + s + '\u0002', i;
  for (i = 0; i < t.length; i++) { __h ^= t.charCodeAt(i); __h = Math.imul(__h, 0x01000193) >>> 0; }
  __n++; __chars += s.length;
  var root = fn.split('.')[0];
  __per[root] = (__per[root] || 0) + 1;
  var shape = s.replace(/\b(the|The) [A-Z][a-z]+ (house|way|holding)\b/g, '$1 NAME $2').replace(/[+−]?\d+/g, '#');
  (__shapes[root] = __shapes[root] || {})[shape] = true;
}
var __src = readFile('page-smoke.js');
if (__src.indexOf('  sentences++;\n}') < 0) throw new Error('page-smoke.js: the hook point in checkString was not found');
__src = __src.replace('  sentences++;\n}', '  sentences++; __acc(s, fn);\n}');
(0, eval)(__src);

print('');
print('GOLDEN (valley, published words.js)');
print('sentences hashed: ' + __n + ', characters: ' + __chars);
print('fnv1a32: ' + ('00000000' + __h.toString(16)).slice(-8));
var names = Object.keys(__per).sort(function (a, b) { return Object.keys(__shapes[b]).length - Object.keys(__shapes[a]).length; });
var total = 0;
print('function | sentences | distinct shapes');
names.forEach(function (k) { var d = Object.keys(__shapes[k]).length; total += d; print(k + ' | ' + __per[k] + ' | ' + d); });
print('distinct sentence shapes over all functions: ' + total);
if (globalThis.__DUMP) names.forEach(function (k) { print('## ' + k); Object.keys(__shapes[k]).slice(0, 60).forEach(function (s) { print('   ' + s); }); });
