# page-p3: WCAG contrast of the colour pairs the page draws with, valley against a candidate place.
#   python3 contrast.py <index.html> [place]
# Reads the token blocks of index.html: the valley's (:root, the dark media block, the dark attribute
# block) and the place's ([data-place="<place>"] blocks), and prints each pair's contrast in light
# and dark, with the place's value against the valley's. Exit 1 if any place value is lower.
import re, sys

def lum(hexc):
    h = hexc.lstrip('#')
    if len(h) == 3: h = ''.join(c * 2 for c in h)
    rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]

def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

def tokens(block):
    return dict(re.findall(r'--([a-z-]+):\s*(#[0-9A-Fa-f]{3,8})', block))

html = open(sys.argv[1], encoding='utf-8').read()
place = sys.argv[2] if len(sys.argv) > 2 else 'banks'
css = html[html.index('<style>'):html.index('*, *::before')]
# the valley: the first :root block, then the dark media block and the dark attribute block
root = re.search(r':root \{(.*?)\n\}', css, re.S).group(1)
dark_media = re.search(r'@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme="light"\]\) \{(.*?)\}', css, re.S).group(1)
dark_attr = re.search(r'\n:root\[data-theme="dark"\] \{(.*?)\}', css, re.S).group(1)
V_light = tokens(root)
V_dark = dict(V_light); V_dark.update(tokens(dark_media))
V_dark2 = dict(V_light); V_dark2.update(tokens(dark_attr))
assert V_dark == V_dark2, 'the two dark blocks of the valley differ'
sel = r'\[data-place="%s"\]' % place
pl = re.search(r'\n:root' + sel + r' \{(.*?)\}', css, re.S)
pdm = re.search(r'@media \(prefers-color-scheme: dark\) \{\s*:root' + sel + r':not\(\[data-theme="light"\]\) \{(.*?)\}', css, re.S)
pda = re.search(r'\n:root' + sel + r'\[data-theme="dark"\] \{(.*?)\}', css, re.S)
if not (pl and pdm and pda):
    print('the place %s has not all three token blocks (light %s, dark by media %s, dark by attribute %s)' % (place, bool(pl), bool(pdm), bool(pda)))
    sys.exit(1)
P_light = dict(V_light); P_light.update(tokens(pl.group(1)))
P_dark = dict(V_dark); P_dark.update(tokens(pdm.group(1)))
P_dark2 = dict(V_dark); P_dark2.update(tokens(pda.group(1)))
assert P_dark == P_dark2, 'the two dark blocks of %s differ' % place
setl, setd, seta = set(tokens(pl.group(1))), set(tokens(pdm.group(1))), set(tokens(pda.group(1)))
assert setl == setd == seta, 'the three blocks of %s set different tokens: %s / %s / %s' % (place, sorted(setl), sorted(setd), sorted(seta))
print('tokens the place sets: ' + ', '.join(sorted(setl)))

# (foreground, background, what): every pair in the style sheet where a moved token is drawn
PAIRS = [
    ('field', 'paper-raised', 'a hand kept on the sheet, a parcel outline, a held mark'),
    ('field', 'paper', 'held marks in the Chronicle rows, the strip'),
    ('paper', 'field', 'the chosen option\'s words (keep to your water)'),
    ('field-wash', 'field', 'a parcel: its wash against its outline'),
    ('river', 'paper-raised', 'the water note on the sheet, the gauge, focus rings'),
    ('river', 'paper', 'focus rings on the page'),
    ('river-wash', 'paper-raised', 'the water inside the barrier'),
    ('madder', 'paper', 'the last day note, the store meter'),
    ('madder', 'paper-raised', 'the house square, the seal'),
    ('ink', 'field-wash', 'lettering over a parcel'),
    ('paper-raised', 'river', 'the gauge\'s spokes over its fill'),
]
worse = 0
print('%-14s %-14s %8s %8s %8s %8s   %s' % ('fg', 'bg', 'valley', place, 'valley', place, 'what'))
print('%-14s %-14s %8s %8s %8s %8s' % ('', '', 'light', 'light', 'dark', 'dark'))
for fg, bg, what in PAIRS:
    vl, pl_, vd, pd = ratio(V_light[fg], V_light[bg]), ratio(P_light[fg], P_light[bg]), ratio(V_dark[fg], V_dark[bg]), ratio(P_dark[fg], P_dark[bg])
    flag = ''
    if pl_ + 1e-9 < vl or pd + 1e-9 < vd:
        flag = '  LOWER'; worse += 1
    print('%-14s %-14s %8.2f %8.2f %8.2f %8.2f   %s%s' % (fg, bg, vl, pl_, vd, pd, what, flag))
print('pairs lower than the valley: %d' % worse)
sys.exit(1 if worse else 0)
