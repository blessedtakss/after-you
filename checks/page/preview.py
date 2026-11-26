# preview.html is index.html inside the same skeleton the host adds when it publishes the page (a doctype, a
# utf-8 charset, a viewport and a few base styles), so that a local browser shows the page as the published one
# does. This rebuilds that wrapper from index.html and compares it byte for byte with preview.html, in the game
# folder and in each variant folder that has a preview.html.
#
#   python3 checks/page/preview.py            check: prints one line a folder, exits 1 if any preview.html is stale
#   python3 checks/page/preview.py --write    rebuild every preview.html from its index.html (run after a page change)
#
# The folders are found from this file's own location, so it can be started from any folder.
import os, sys

HEAD = ('<!doctype html><html><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
        '<style>:root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}'
        'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
        '</head><body>')
TAIL = '</body></html>'

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
write = sys.argv[1:] == ['--write']
if sys.argv[1:] and not write:
    sys.exit('usage: preview.py [--write]')

folders = ['.'] + sorted(os.path.join('variants', v) for v in os.listdir(os.path.join(root, 'variants'))
                         if os.path.isfile(os.path.join(root, 'variants', v, 'preview.html')))
stale = 0
for f in folders:
    with open(os.path.join(root, f, 'index.html'), 'rb') as fh:
        want = HEAD.encode('utf-8') + fh.read() + TAIL.encode('utf-8')
    path = os.path.join(root, f, 'preview.html')
    have = open(path, 'rb').read() if os.path.isfile(path) else None
    name = os.path.join(f, 'preview.html') if f != '.' else 'preview.html'
    if write:
        if have != want:
            with open(path, 'wb') as fh:
                fh.write(want)
            print('rebuilt  ' + name)
        else:
            print('current  ' + name)
    elif have == want:
        print('same     ' + name + ' (index.html in the host skeleton, %d bytes)' % len(want))
    else:
        stale += 1
        print('STALE    ' + name + ' differs from index.html in the host skeleton: run python3 checks/page/preview.py --write')
if not write:
    print('previews stale: %d of %d' % (stale, len(folders)))
sys.exit(1 if stale else 0)
