# Compares two step listings of stream-page.js ("-- all steps": one WALK line per step, with the
# fingerprint and length of the page's markup and of the four maps) place by place: for each place,
# the steps with the same maps and the same markup, and the first step where each differs. The last
# line names the places that differ; the exit is 1 when any does. For a place that differs, dump its
# walk at both versions (stream-page.js -- <place>) and compare the dumps with diff-page-stream.py.
#   python3 diff-walks.py before.txt after.txt
import sys, collections
def read(path):
    out = collections.OrderedDict()
    for line in open(path, encoding='utf-8'):
        if line.startswith('WALK\t'):
            _, place, size, what, page, maps = line.rstrip('\n').split('\t')
            out.setdefault(place, []).append((size + ' / ' + what, page, maps))
    return out
a, b = read(sys.argv[1]), read(sys.argv[2])
print('places: before %d (%s), after %d (%s)' % (len(a), ' '.join(a), len(b), ' '.join(b)))
differ = []
for place in list(a) + [p for p in b if p not in a]:
    sa, sb = a.get(place), b.get(place)
    if sa is None or sb is None:
        print('%s: walked only %s' % (place, 'before' if sb is None else 'after')); differ.append(place); continue
    if [s[0] for s in sa] != [s[0] for s in sb]:
        print('%s: THE WALKS DIFFER IN THEIR STEPS (%d and %d steps)' % (place, len(sa), len(sb))); differ.append(place); continue
    same_maps = sum(1 for x, y in zip(sa, sb) if x[2] == y[2])
    same_page = sum(1 for x, y in zip(sa, sb) if x[1] == y[1])
    first_maps = next((x[0] for x, y in zip(sa, sb) if x[2] != y[2]), None)
    first_page = next((x[0] for x, y in zip(sa, sb) if x[1] != y[1]), None)
    line = '%s: %d steps; the same maps %d, the same markup %d' % (place, len(sa), same_maps, same_page)
    if first_maps: line += '; maps first differ at %s' % first_maps
    if first_page: line += '; markup first differs at %s' % first_page
    print(line)
    if first_maps or first_page: differ.append(place)
print('places that differ: %d%s' % (len(differ), ' (' + ' '.join(differ) + ')' if differ else ''))
sys.exit(1 if differ else 0)
