# Compares two page-stream dumps (stream-page.js) step by step and lists every difference in the
# page's markup and in the maps, grouped: each distinct change with the steps it occurs in.
#   python3 diff-page-stream.py before.txt after.txt
import sys, json, re, difflib, collections
def read(path):
    steps = []
    for line in open(path, encoding='utf-8'):
        if line.startswith('STEP\t'):
            _, size, what, body, maps = line.rstrip('\n').split('\t')
            steps.append((size, what, json.loads(body), json.loads(maps)))
    return steps
def toks(s):
    return re.findall(r'<[^>]*>|[^<]+', s)
a, b = read(sys.argv[1]), read(sys.argv[2])
print('steps: before %d, after %d' % (len(a), len(b)))
if [(x[0], x[1]) for x in a] != [(x[0], x[1]) for x in b]:
    print('THE WALKS DIFFER IN THEIR STEPS'); sys.exit(1)
changes = collections.OrderedDict(); same_maps = 0; same_body = 0
for (size, what, ba, ma), (_, _, bb, mb) in zip(a, b):
    if ma == mb: same_maps += 1
    else: changes.setdefault(('MAPS', 'differ'), []).append(size + ' / ' + what)
    if ba == bb: same_body += 1; continue
    ta, tb = toks(ba), toks(bb)
    sm = difflib.SequenceMatcher(None, ta, tb, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal': continue
        key = (op, ''.join(ta[i1:i2])[:600] + ' ==> ' + ''.join(tb[j1:j2])[:600])
        changes.setdefault(key, []).append(size + ' / ' + what)
print('steps with the same maps: %d of %d; with the same markup: %d of %d' % (same_maps, len(a), same_body, len(a)))
print('distinct changes: %d' % len(changes))
for (op, text), where in changes.items():
    print('---- %s, in %d steps (first: %s; last: %s)' % (op, len(where), where[0], where[-1]))
    print(text)
