#!/bin/bash
# Puts a tagged version of the game on GitHub Pages, at https://blessedtakss.github.io/after-you/
#
#   tools/pages.sh [vX.Y.Z]           build the site from that tag (default: the newest vX.Y.Z tag), list
#                                     what it holds and say whether GitHub's gh-pages branch already has it
#   tools/pages.sh [vX.Y.Z] --push    the same, then commit the site to the gh-pages branch and push it
#
# GitHub Pages serves the gh-pages branch as it is. The site is the tag's game and nothing else: the tag's
# preview.html (its index.html in the host's skeleton, re-checked with checks/page/preview.py) as
# index.html, the files that page loads, the music its sound.js registers (each src in TRACKS, under
# music/; a registered file the tag does not have stops the build, and with none registered nothing is
# added), a .nojekyll so that GitHub serves the files untouched, and a version.txt naming the tag and
# its commit. The variants are left out: served from the same address they
# would share the main page's list of earlier lives, shorten it and relabel its places.
#
# Only the gh-pages branch is written. The working tree, the index and every other branch are untouched,
# so this can run with uncommitted work in the folder. Push the tag before the site, and one version at a
# time; naming an older tag puts that older version back up.
set -eu
cd "$(dirname "$0")/.."

usage() { echo "usage: tools/pages.sh [vX.Y.Z] [--push]" >&2; exit 2; }
TAG= PUSH=
for a in "$@"; do
  case $a in
    --push) PUSH=1 ;;
    -*) usage ;;
    *) [ -z "$TAG" ] || usage; TAG=$a ;;
  esac
done
if [ -z "$TAG" ]; then
  TAG=$(git tag -l 'v*' --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -n 1 || true)
fi
if ! [[ $TAG =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || ! git show-ref --verify --quiet "refs/tags/$TAG"; then
  echo "pages: no version tag named '$TAG' (a tag of the form vX.Y.Z is needed)" >&2; exit 1
fi
COMMIT=$(git rev-parse "refs/tags/$TAG^{commit}")

TMP=$(mktemp -d "${TMPDIR:-/tmp}/after-you-pages.XXXXXX")
trap 'rm -rf "$TMP"' EXIT
mkdir "$TMP/build"
git archive "refs/tags/$TAG" | tar -x -C "$TMP/build"

# The tag's own preview check when it has one (any tag from v0.2.1 on), otherwise this folder's.
if [ ! -f "$TMP/build/checks/page/preview.py" ]; then
  mkdir -p "$TMP/build/checks/page" && cp checks/page/preview.py "$TMP/build/checks/page/preview.py"
fi
CHECK=$(python3 "$TMP/build/checks/page/preview.py" 2>&1) || true
if ! printf '%s\n' "$CHECK" | grep -q '^same  *preview\.html '; then
  printf '%s\n' "$CHECK" >&2
  echo "pages: $TAG's preview.html is not its index.html in the host skeleton; nothing was built" >&2; exit 1
fi

python3 - "$TMP/build" "$TMP/site" <<'PY'
import os, re, shutil, sys
build, site = sys.argv[1], sys.argv[2]
page = open(os.path.join(build, 'preview.html'), encoding='utf-8').read()
refs = sorted({r for r in re.findall(r'(?:src|href)\s*=\s*["\']([^"\']+)["\']', page, re.I)
               if not re.match(r'([a-z][a-z0-9+.-]*:|//|#)', r, re.I)})
os.makedirs(site)
shutil.copyfile(os.path.join(build, 'preview.html'), os.path.join(site, 'index.html'))
for r in refs:
    p = os.path.normpath(r.split('?')[0].split('#')[0])
    if os.path.isabs(p) or p == '..' or p.startswith('..' + os.sep):
        sys.exit('pages: refusing a file outside the game folder: ' + r)
    if not os.path.isfile(os.path.join(build, p)):
        sys.exit('pages: preview.html loads ' + r + ', which the tag does not have')
    os.makedirs(os.path.join(site, os.path.dirname(p)), exist_ok=True)
    shutil.copyfile(os.path.join(build, p), os.path.join(site, p))

# The music the page's sound.js registers: its TRACKS object, read with the comments taken out (the
# strings kept). Every entry is null or an object literal with a src under music/; each src is copied
# beside the page, and one the tag does not have stops the build. No sound.js loaded: nothing to do.
def code_of(js):
    out, i, n, q = [], 0, len(js), None
    while i < n:
        c = js[i]
        if q:
            out.append(c)
            if c == '\\' and i + 1 < n:
                out.append(js[i + 1]); i += 2; continue
            if c == q:
                q = None
        elif c in '\'"':
            q = c; out.append(c)
        elif js.startswith('//', i):
            j = js.find('\n', i); i = n if j < 0 else j; continue
        elif js.startswith('/*', i):
            j = js.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        else:
            out.append(c)
        i += 1
    return ''.join(out)
def top_level(text, start, close):
    # the parts of text from start up to the bracket that closes it, split at its top-level commas
    parts, depth, q, i, k = [], 0, None, start, start
    while i < len(text):
        c = text[i]
        if q:
            if c == '\\':
                i += 2; continue
            if c == q:
                q = None
        elif c in '\'"':
            q = c
        elif c in '{[(':
            depth += 1
        elif c in '}])':
            if depth == 0:
                if c != close:
                    break
                parts.append(text[k:i]); return [x.strip() for x in parts if x.strip()]
            depth -= 1
        elif c == ',' and depth == 0:
            parts.append(text[k:i]); k = i + 1
        i += 1
    sys.exit('pages: sound.js: TRACKS could not be read')
def registered_music(js):
    code = code_of(js)
    m = re.search(r'\bvar\s+TRACKS\s*=\s*\{', code)
    if not m:
        sys.exit('pages: preview.html loads sound.js, which has no TRACKS to read its music from')
    srcs = []
    for entry in top_level(code, m.end(), '}'):
        e = re.match(r'([A-Za-z_$][\w$]*|\'[^\']*\'|"[^"]*")\s*:\s*([\s\S]*)$', entry)
        if not e:
            sys.exit('pages: sound.js: a TRACKS entry that is not "place: null" or "place: { ... }": ' + entry)
        key, val = e.group(1).strip('\'"'), e.group(2).strip()
        if val == 'null':
            continue
        if not (val.startswith('{') and val.endswith('}')):
            sys.exit('pages: sound.js registers music for ' + key + ' that is neither null nor an object: ' + val)
        src = [f for f in top_level(val, 1, '}') if re.match(r'(src|\'src\'|"src")\s*:', f)]
        v = re.match(r'[^:]*:\s*([\'"])(.*)\1$', src[0]) if len(src) == 1 else None
        if not v:
            sys.exit('pages: sound.js registers music for ' + key + ' without one src string')
        srcs.append((key, v.group(2)))
    return srcs
loaded = {os.path.normpath(r.split('?')[0].split('#')[0]) for r in refs}
if 'sound.js' in loaded:
    for key, src in registered_music(open(os.path.join(build, 'sound.js'), encoding='utf-8').read()):
        if not re.match(r'^music/[a-z0-9-]+\.(mp3|m4a)$', src):
            sys.exit('pages: sound.js registers ' + src + ' for ' + key + ', which is not an .mp3 or .m4a file directly under music/')
        if not os.path.isfile(os.path.join(build, src)):
            sys.exit('pages: sound.js registers ' + src + ' for ' + key + ', which the tag does not have')
        os.makedirs(os.path.join(site, 'music'), exist_ok=True)
        shutil.copyfile(os.path.join(build, src), os.path.join(site, src))
PY
: > "$TMP/site/.nojekyll"
printf '%s %s\n' "$TAG" "$COMMIT" > "$TMP/site/version.txt"

echo "Site for $TAG ($COMMIT):"
if command -v sha256sum >/dev/null; then SUM='sha256sum'; else SUM='shasum -a 256'; fi
(cd "$TMP/site" && find . -type f | sed 's|^\./||' | LC_ALL=C sort | while IFS= read -r f; do
  printf '  %8s  %s  %s\n' "$(wc -c < "$f" | tr -d ' ')" "$($SUM "$f" | cut -c1-16)" "$f"
done)

# The site as a tree of its own, written through a temporary index.
export GIT_INDEX_FILE="$TMP/index"
git --work-tree="$TMP/site" add -A -f
TREE=$(git write-tree)
unset GIT_INDEX_FILE

if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  git fetch -q origin '+refs/heads/gh-pages:refs/remotes/origin/gh-pages'
  PARENT=$(git rev-parse refs/remotes/origin/gh-pages)
else
  PARENT=
fi
if [ -n "$PARENT" ] && [ "$(git rev-parse "$PARENT^{tree}")" = "$TREE" ]; then
  echo "gh-pages on GitHub already holds exactly this site; nothing to push."; exit 0
fi
if [ -n "$PARENT" ]; then
  echo "Differs from gh-pages on GitHub ($(git log -1 --format=%s "$PARENT")):"
  git diff-tree -r --name-status "$PARENT" "$TREE" | sed 's/^/  /'
else
  echo "GitHub has no gh-pages branch yet; --push creates it."
fi
if [ -z "$PUSH" ]; then
  echo "Nothing pushed. Run again with --push to put this on the site."; exit 0
fi

MSG="Site: $TAG ($COMMIT)

Built by tools/pages.sh from tag $TAG: its preview.html as index.html,
the files that page loads, .nojekyll and version.txt.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
if [ -n "$PARENT" ]; then NEW=$(git commit-tree "$TREE" -p "$PARENT" -m "$MSG"); else NEW=$(git commit-tree "$TREE" -m "$MSG"); fi
git push -q origin "$NEW:refs/heads/gh-pages"
git fetch -q origin '+refs/heads/gh-pages:refs/remotes/origin/gh-pages'
echo "Pushed $TAG to gh-pages ($(git rev-parse --short "$NEW")). GitHub Pages usually shows it within a minute or two."
