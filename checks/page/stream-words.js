/*
 * page-p2: page-map/golden-words.js with the same hook and the same hash, plus a dump of every
 * hashed sentence ("fn<TAB>sentence", in order) so that two runs can be compared line by line.
 * Run from a game folder:  cd <folder> && jsc <this file> [-- <place>] > stream.txt
 * As in page-p1's copy, a run over the page check's time limit by the clock (a busy machine)
 * prints a note instead of throwing; nothing that is hashed changes. page-smoke.js itself is run
 * on its own for its PASS line.
 */
var __h = 0x811c9dc5 >>> 0, __n = 0, __chars = 0;
function __acc(s, fn) {
  var t = fn + '\u0001' + s + '\u0002', i;
  for (i = 0; i < t.length; i++) { __h ^= t.charCodeAt(i); __h = Math.imul(__h, 0x01000193) >>> 0; }
  __n++; __chars += s.length;
  print('S\t' + fn + '\t' + s);
}
var __src = readFile('page-smoke.js');
if (__src.indexOf('  sentences++;\n}') < 0) throw new Error('page-smoke.js: the hook point in checkString was not found');
__src = __src.replace('  sentences++;\n}', '  sentences++; __acc(s, fn);\n}');
var __lim = /if \(secs > ([^)]+)\) throw new Error\('page-smoke\.js took longer than [^;]*;/;      // the published line and the new one alike
if (!__lim.test(__src)) throw new Error('page-smoke.js: the time limit was not found');
__src = __src.replace(__lim, "if (secs > $1) print('(stream-words: over the limit by the clock on a busy machine; page-smoke.js on its own keeps the limit)');");
// NOHABIT (a global, for comparison only): the run without the habit-replay Lives page-smoke.js
// plays last in each place, so that what they add can be told apart from the rest.
if (globalThis.NOHABIT) {
  var __hb = "  if (A.createLife(1, id).params.REPLAY === 'valley') {";
  if (__src.split(__hb).length !== 2) throw new Error('page-smoke.js: the habit-replay Lives were not found');
  __src = __src.replace(__hb, "  if (false) {");
  __src = __src.replace("  if (!stats.lastDayHabit) throw new Error(", "  if (false) throw new Error(");
}
(0, eval)(__src);
print('');
print('sentences hashed: ' + __n + ', characters: ' + __chars);
print('fnv1a32: ' + ('00000000' + __h.toString(16)).slice(-8));
