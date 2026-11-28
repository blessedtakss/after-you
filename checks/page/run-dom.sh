#!/bin/sh
# The stand-in DOM run (dom-run.js) on the game folder as it is: the six known-good valley configurations,
# then four for each new place (laptop, tablet, phone, phone320; earlier lives stored on some; policies
# honest, the custom, always, never, short), plus the Saltmarket seeds where the season replay withholds
# the seal (4) and where the seal is earned (10). Runs four at a time.
# Then four more, so that each is read in a check: the Banks' seal (seed 19, the peacemaker); the Watch's
# season line, shown where the season replay alone withholds its seal (seed 115, its honest way), and refused
# where it withholds a seal out of reach anyway (seed 13, a short tower); and the Watch's season line where
# the replayed mark still stands above the noise the page states (seed 45, its honest way: +6 against about 2),
# so the line is read in app.js where only the seal's bar makes it true. Then the first configuration again with
# fxThrow: motion.js and sound.js stood in for by modules that start and throw at every cue; it must pass whole with
# the same clock reads as the first (SPEC 6.6). 28 configurations in all.
#   checks/page/run-dom.sh            (from anywhere; JSC overrides the jsc path)
# Prints the last lines of each run, the fxThrow comparison and "ALL OK" or "ALL FAILED"; exits 1 if any run fails.
JSC=${JSC:-/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc}
HERE=$(cd "$(dirname "$0")" && pwd) || exit 2
ROOT=$(cd "$HERE/../.." && pwd) || exit 2
CK=$(printf '%s' "$ROOT/checks" | sed "s/\\\\/\\\\\\\\/g; s/'/\\\\'/g")
cd "$ROOT" || exit 2
T=$(mktemp -d "${TMPDIR:-/tmp}/after-you-dom.XXXXXX") || exit 2
trap 'rm -rf "$T"' EXIT
i=0
for c in "{screen:'laptop'}" "{screen:'laptop',lives:20,seed:167}" "{screen:'tablet',seed:7}" "{screen:'phone',seed:7,policy:'old'}" "{screen:'phone320',seed:2024,policy:'send'}" "{screen:'phone',lives:4,seed:1}" \
         "{place:'banks',screen:'laptop',seed:12,policy:'peace'}" "{place:'banks',screen:'tablet',seed:48213,policy:'short',lives:6}" "{place:'banks',screen:'phone',seed:31,policy:'old'}" "{place:'banks',screen:'phone320',seed:2024,policy:'send',watch:true}" \
         "{place:'watch',screen:'laptop',seed:3,policy:'watch'}" "{place:'watch',screen:'tablet',seed:11,policy:'never',lives:6}" "{place:'watch',screen:'phone',seed:9,policy:'old',lives:5}" "{place:'watch',screen:'phone320',seed:2024,policy:'short',watch:true}" \
         "{place:'bridges',screen:'laptop',seed:4,policy:'bridges'}" "{place:'bridges',screen:'tablet',seed:11,policy:'send',lives:6}" "{place:'bridges',screen:'phone',seed:31,policy:'old'}" "{place:'bridges',screen:'phone320',seed:5,policy:'never',lives:3}" \
         "{place:'saltmarket',screen:'laptop',seed:4,policy:'salt'}" "{place:'saltmarket',screen:'tablet',seed:15,policy:'salt',lives:6}" "{place:'saltmarket',screen:'phone',seed:48213,policy:'old',lives:4}" "{place:'saltmarket',screen:'phone320',seed:7,policy:'send',watch:true}" \
         "{place:'saltmarket',screen:'laptop',seed:10,policy:'salt'}" \
         "{place:'banks',screen:'laptop',seed:19,policy:'peace'}" "{place:'watch',screen:'tablet',seed:115,policy:'watch'}" "{place:'watch',screen:'phone',seed:13,policy:'watch'}" \
         "{place:'watch',screen:'laptop',seed:45,policy:'watch'}" \
         "{screen:'laptop',fxThrow:true}"; do
  i=$((i+1))
  ( "$JSC" -e "var CHECKS_DIR='$CK'; var CONFIG=$c" "$HERE/dom-run.js" > "$T/$(printf %02d $i).txt" 2>&1; echo "exit $?" >> "$T/$(printf %02d $i).txt" ) &
  [ $((i % 4)) -eq 0 ] && wait
done
wait
fail=0
for f in "$T"/*.txt; do tail -3 "$f" | grep -v '^$'; grep -q '^exit 0$' "$f" || fail=1; done
# fxThrow (the last) against the first: the same Life, the same clock reads
r1=$(sed -n 's/^OK .*; clock reads \([0-9]*\)$/\1/p' "$T/01.txt"); rt=$(sed -n 's/^OK .*; clock reads \([0-9]*\)$/\1/p' "$T/$(printf %02d $i).txt")
if [ -n "$r1" ] && [ "$r1" = "$rt" ]; then echo "fxThrow: $rt clock reads, the same as the first configuration without it"
else echo "fxThrow: clock reads ${rt:-none}, the first configuration ${r1:-none}: NOT THE SAME"; fail=1; fi
echo "configurations run: $i"
echo "ALL $([ $fail -eq 0 ] && echo OK || echo FAILED)"
exit $fail
