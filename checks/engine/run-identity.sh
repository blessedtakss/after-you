#!/bin/sh
# The valley-identity proof: the working tree's engine.js plays the valley exactly as an earlier engine
# did (default: v0.1.0's engine.js, the first published valley), on 472 Lives with five ways of playing,
# comparing every output of the engine as JSON. About 4 minutes.
#   checks/engine/run-identity.sh [ref]        ref: the git ref of the earlier engine (default v0.1.0)
# Prints the proof's report (also saved in checks/out/identity.txt); exits 0 only on its PASS line.
JSC=${JSC:-/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc}
ROOT=$(cd "$(dirname "$0")/../.." && pwd) || exit 2
OLD=${1:-${IDENTITY_REF:-v0.1.0}}
mkdir -p "$ROOT/checks/out" || exit 2
T=$(mktemp -d "${TMPDIR:-/tmp}/after-you-identity.XXXXXX") || exit 2
trap 'rm -rf "$T"' EXIT
git -C "$ROOT" show "$OLD:engine.js" > "$T/engine-old.js" 2> /dev/null || { echo "run-identity: cannot read $OLD:engine.js"; exit 2; }
F=$(printf '%s' "$T/engine-old.js" | sed "s/\\\\/\\\\\\\\/g; s/'/\\\\'/g")
L=$(printf '%s' "$OLD:engine.js" | sed "s/\\\\/\\\\\\\\/g; s/'/\\\\'/g")
cd "$ROOT" || exit 2
"$JSC" -e "var OLD_ENGINE='$F', OLD_LABEL='$L'" checks/engine/identity.js > "$ROOT/checks/out/identity.txt" 2>&1
echo "exit $?" >> "$ROOT/checks/out/identity.txt"
cat "$ROOT/checks/out/identity.txt"
grep -q '^PASS  the valley is unchanged' "$ROOT/checks/out/identity.txt"
