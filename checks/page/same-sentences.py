# page-p3: are the hashed sentences ("S<TAB>fn<TAB>sentence" lines of stream-words.js) of two runs the same, in order?
#   python3 same-sentences.py a.txt b.txt
import sys
def read(p): return [l for l in open(p, encoding='utf-8') if l.startswith('S\t')]
a, b = read(sys.argv[1]), read(sys.argv[2])
print('sentences: %d and %d' % (len(a), len(b)))
if a == b: print('IDENTICAL, line for line'); sys.exit(0)
for i, (x, y) in enumerate(zip(a, b)):
    if x != y: print('first difference at sentence %d:\n  %s  %s' % (i, x, y)); break
sys.exit(1)
