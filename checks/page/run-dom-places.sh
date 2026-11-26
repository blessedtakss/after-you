#!/bin/sh
# Every scenario of dom-places.js (the chooser, the hash, stored lives, the reload) on the game folder as it
# is, with its five real places: two, hash-two, choose, hash, restore, store.
#   checks/page/run-dom-places.sh     (from anywhere; JSC overrides the jsc path)
# Exits 1 if any scenario fails.
JSC=${JSC:-/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc}
HERE=$(cd "$(dirname "$0")" && pwd) || exit 2
ROOT=$(cd "$HERE/../.." && pwd) || exit 2
CK=$(printf '%s' "$ROOT/checks" | sed "s/\\\\/\\\\\\\\/g; s/'/\\\\'/g")
cd "$ROOT" || exit 2
fail=0
for s in two hash-two choose hash restore store; do
  out=$("$JSC" -e "var CHECKS_DIR='$CK'; var CONFIG={scenario:'$s'}" "$HERE/dom-places.js" 2>&1); st=$?
  echo "$out" | tail -2; echo "exit $st"
  [ $st -eq 0 ] || fail=1
done
exit $fail
