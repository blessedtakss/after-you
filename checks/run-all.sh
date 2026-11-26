#!/bin/sh
# The page check run: every check of the page on the working tree as it is, with the fingerprints compared
# line for line against reference streams made the same way from a git ref (default v0.2.0): the valley's
# sentences, page and maps, every place's words, every drawing of every place's sheet, and a whole Life's
# page and maps in every place.
#
#   checks/run-all.sh [ref]          ref: a tag, branch or commit (default v0.2.0; or set AY_REF)
#
# The reference is never stored: the ref is extracted with git archive into a temporary folder, the same
# check scripts (from this working tree) are run there, and the two runs are compared. Outputs go to
# checks/out/run-all/ (ignored by git; emptied at the start of each run; the streams there take about 75 MB).
# RUN_ALL_OUT names another output folder (relative to the folder the run is started from). The run empties it
# too, so it must be empty, new, or a folder an earlier run wrote (it leaves a .run-all mark there); any other
# folder is refused.
# Ends with a PASS/FAIL line for each check and an overall line; exits 1 if any check fails, 2 if the run
# could not start. JSC overrides the path of jsc, RUN_ALL_OUT the output folder. Python 3 is needed for five of
# the comparisons. About 8 minutes.
JSC=${JSC:-/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc}
ROOT=$(cd "$(dirname "$0")/.." && pwd) || exit 2
REF=${1:-${AY_REF:-v0.2.0}}
OUT=${RUN_ALL_OUT:-$ROOT/checks/out/run-all}                                    # (RUN_ALL_OUT: another output folder)
PAGE="$ROOT/checks/page"
CK=$(printf '%s' "$ROOT/checks" | sed "s/\\\\/\\\\\\\\/g; s/'/\\\\'/g")      # the checks folder, quoted for jsc -e
GAME="index.html engine.js words.js sheet.js places/*.js app.js page-smoke.js harness.js smoke.js preview.html"

[ -x "$JSC" ] || { echo "run-all: jsc not found at $JSC (set JSC)"; exit 2; }
command -v python3 > /dev/null || { echo "run-all: python3 not found"; exit 2; }
git -C "$ROOT" rev-parse --verify --quiet "$REF^{commit}" > /dev/null || { echo "run-all: no such ref: $REF"; exit 2; }
if [ -n "$RUN_ALL_OUT" ] && [ -d "$OUT" ] && [ ! -e "$OUT/.run-all" ] && [ -n "$(ls -A "$OUT")" ]; then
  echo "run-all: $OUT holds files that run-all did not write, and the run empties its output folder;"
  echo "         name a new or empty folder in RUN_ALL_OUT (or leave it unset for checks/out/run-all/)"; exit 2
fi
mkdir -p "$OUT" && OUT=$(cd "$OUT" && pwd) || exit 2                           # (absolute: the run changes folder)
if [ -n "$RUN_ALL_OUT" ]; then SHOWOUT=$OUT; else SHOWOUT=checks/out/run-all; fi # the output folder, as the report names it
: > "$OUT/.run-all" || exit 2
rm -f "$OUT"/*.txt
REFDIR=$(mktemp -d "${TMPDIR:-/tmp}/after-you-ref.XXXXXX") || exit 2
trap 'rm -rf "$REFDIR"' EXIT
trap 'exit 130' INT TERM
git -C "$ROOT" archive "$REF" | tar -x -C "$REFDIR" || { echo "run-all: git archive $REF failed"; exit 2; }

cd "$ROOT" || exit 2
T0=$(date +%s)
{
  echo "run-all: working tree against $REF ($(git rev-parse --short "$REF^{commit}")), started $(date '+%Y-%m-%d %H:%M:%S')"
  echo "game files that differ from $REF: $(git diff --name-only "$REF" -- $GAME | tr '\n' ' ')"
  uptime
} > "$OUT/load.txt"
cat "$OUT/load.txt"
md5 $GAME > "$OUT/md5-start.txt"

note() { echo "  [$(( $(date +%s) - T0 )) s] $*"; }
gates() { grep '^\(PASS\|FAIL\)  \(G[0-9]*\|X[12]\) ' "$1"; }

# ---- phase 1: the long runs, five at a time ------------------------------------------------------------
note "page-smoke.js, harness.js (here and at $REF), the valley's sentence stream (here and at $REF)"
( s=$(date +%s); "$JSC" page-smoke.js > "$OUT/page-smoke.txt" 2>&1; e=$?; echo "seconds $(( $(date +%s) - s ))" >> "$OUT/page-smoke.txt"; echo "exit $e" >> "$OUT/page-smoke.txt" ) &
( s=$(date +%s); "$JSC" harness.js > "$OUT/harness.txt" 2>&1; e=$?; echo "seconds $(( $(date +%s) - s ))" >> "$OUT/harness.txt"; echo "exit $e" >> "$OUT/harness.txt" ) &
( cd "$REFDIR" && "$JSC" harness.js > "$OUT/ref-harness.txt" 2>&1; echo "exit $?" >> "$OUT/ref-harness.txt" ) &
( "$JSC" "$PAGE/stream-words.js" -- valley > "$OUT/words-stream-valley.txt" 2>&1; echo "exit $?" >> "$OUT/words-stream-valley.txt" ) &
( cd "$REFDIR" && "$JSC" "$PAGE/stream-words.js" -- valley > "$OUT/ref-words-stream-valley.txt" 2>&1; echo "exit $?" >> "$OUT/ref-words-stream-valley.txt" ) &

# the short ones meanwhile, one after the other
note "page-smoke.js on a place that does not exist"
"$JSC" page-smoke.js -- nowhere > "$OUT/page-smoke-unknown.txt" 2>&1; echo "exit $?" >> "$OUT/page-smoke-unknown.txt"
note "the valley-only page and maps fingerprint"
"$JSC" -e "var CHECKS_DIR='$CK'" "$PAGE/golden-page.js" > "$OUT/golden-page.txt" 2>&1; echo "exit $?" >> "$OUT/golden-page.txt"
( cd "$REFDIR" && "$JSC" -e "var CHECKS_DIR='$CK'" "$PAGE/golden-page.js" > "$OUT/ref-golden-page.txt" 2>&1; echo "exit $?" >> "$OUT/ref-golden-page.txt" )
note "the five-place valley walk"
"$JSC" -e "var CHECKS_DIR='$CK'" "$PAGE/stream-page.js" > "$OUT/page-stream.txt" 2> "$OUT/page-stream-errors.txt"; echo "exit $?" >> "$OUT/page-stream-errors.txt"
( cd "$REFDIR" && "$JSC" -e "var CHECKS_DIR='$CK'" "$PAGE/stream-page.js" > "$OUT/ref-page-stream.txt" 2> "$OUT/ref-page-stream-errors.txt"; echo "exit $?" >> "$OUT/ref-page-stream-errors.txt" )
python3 "$PAGE/diff-page-stream.py" "$OUT/ref-page-stream.txt" "$OUT/page-stream.txt" > "$OUT/diff-page-stream.txt" 2>&1; echo "exit $?" >> "$OUT/diff-page-stream.txt"
note "the sheet rules probe and the colour contrast"
"$JSC" "$PAGE/sheet-probe.js" > "$OUT/sheet-probe.txt" 2>&1; echo "exit $?" >> "$OUT/sheet-probe.txt"
( cd "$REFDIR" && "$JSC" "$PAGE/sheet-probe.js" > "$OUT/ref-sheet-probe.txt" 2>&1; echo "exit $?" >> "$OUT/ref-sheet-probe.txt" )
diff "$OUT/ref-sheet-probe.txt" "$OUT/sheet-probe.txt" > "$OUT/sheet-probe-diff.txt"; echo "exit $?" >> "$OUT/sheet-probe-diff.txt"
note "every place's walk, step by step (here and at $REF)"
"$JSC" -e "var CHECKS_DIR='$CK'" "$PAGE/stream-page.js" -- all steps > "$OUT/walks.txt" 2>&1; echo "exit $?" >> "$OUT/walks.txt"
( cd "$REFDIR" && "$JSC" -e "var CHECKS_DIR='$CK'" "$PAGE/stream-page.js" -- all steps > "$OUT/ref-walks.txt" 2>&1; echo "exit $?" >> "$OUT/ref-walks.txt" )
python3 "$PAGE/diff-walks.py" "$OUT/ref-walks.txt" "$OUT/walks.txt" > "$OUT/diff-walks.txt" 2>&1; echo "exit $?" >> "$OUT/diff-walks.txt"
WALKDIFF=$(sed -n 's/^places that differ: [0-9]* (\(.*\))$/\1/p' "$OUT/diff-walks.txt")
for pl in $WALKDIFF; do                 # a place that differs: its walk dumped at both versions and compared step by step
  case $pl in *[!a-z0-9-]*) continue ;; esac
  grep -q "^$pl: walked only" "$OUT/diff-walks.txt" && continue          # (a place one version does not have: nothing to compare)
  "$JSC" -e "var CHECKS_DIR='$CK'" "$PAGE/stream-page.js" -- "$pl" > "$OUT/walk-$pl.txt" 2>&1
  ( cd "$REFDIR" && "$JSC" -e "var CHECKS_DIR='$CK'" "$PAGE/stream-page.js" -- "$pl" > "$OUT/ref-walk-$pl.txt" 2>&1 )
  python3 "$PAGE/diff-page-stream.py" "$OUT/ref-walk-$pl.txt" "$OUT/walk-$pl.txt" > "$OUT/diff-walk-$pl.txt" 2>&1
done
( for pl in banks watch bridges saltmarket; do echo "== $pl"; python3 "$PAGE/contrast.py" index.html $pl; echo "exit $?"; done ) > "$OUT/contrast.txt" 2>&1
note "preview.html against index.html in the host skeleton (and each variant's)"
python3 "$PAGE/preview.py" > "$OUT/preview.txt" 2>&1; echo "exit $?" >> "$OUT/preview.txt"

note "waiting for the long runs"
wait
gates "$OUT/harness.txt" > "$OUT/harness-gates.txt"
gates "$OUT/ref-harness.txt" > "$OUT/ref-harness-gates.txt"
diff "$OUT/ref-harness-gates.txt" "$OUT/harness-gates.txt" > "$OUT/harness-gates-diff.txt"; echo "exit $?" >> "$OUT/harness-gates-diff.txt"
python3 "$PAGE/same-sentences.py" "$OUT/ref-words-stream-valley.txt" "$OUT/words-stream-valley.txt" > "$OUT/same-valley-sentences.txt" 2>&1; echo "exit $?" >> "$OUT/same-valley-sentences.txt"

# ---- phase 2: the stand-in DOM (four at a time) ---------------------------------------------------------
note "the stand-in DOM: 27 configurations, then the chooser, hash, storage and restore scenarios"
"$PAGE/run-dom.sh" > "$OUT/dom.txt" 2>&1; echo "exit $?" >> "$OUT/dom.txt"
"$PAGE/run-dom-places.sh" > "$OUT/dom-places.txt" 2>&1; echo "exit $?" >> "$OUT/dom-places.txt"

# ---- phase 3: the page-map's words fingerprint over all places, here and at the ref, on a quiet machine --
# (it runs page-smoke.js with its own time limit, so it goes last, two at a time)
note "the page-map's words fingerprint over all places (here and at $REF)"
( s=$(date +%s); "$JSC" "$PAGE/golden-words.js" > "$OUT/golden-words.txt" 2>&1; e=$?; echo "seconds $(( $(date +%s) - s ))" >> "$OUT/golden-words.txt"; echo "exit $e" >> "$OUT/golden-words.txt" ) &
( cd "$REFDIR" && "$JSC" "$PAGE/golden-words.js" > "$OUT/ref-golden-words.txt" 2>&1; echo "exit $?" >> "$OUT/ref-golden-words.txt" ) &
wait
md5 $GAME > "$OUT/md5-end.txt"
{ uptime; echo "finished $(date '+%Y-%m-%d %H:%M:%S') after $(( $(date +%s) - T0 )) s"; } >> "$OUT/load.txt"

# ---- the reading ---------------------------------------------------------------------------------------
lastexit() { tail -1 "$1" | sed -n 's/^exit //p'; }
tailfrom() { sed -n "/$2/,\$p" "$1" | grep -v '^seconds \|^exit '; }       # a file from the first line matching $2
RES="$OUT/summary.txt"; : > "$RES"; NF=0; NC=0
result() {   # result PASS|FAIL "name" "detail"
  NC=$((NC + 1)); [ "$1" = PASS ] || NF=$((NF + 1))
  printf '%s  %-36s %s\n' "$1" "$2" "$3" >> "$RES"
}
H="$OUT/hashes.txt"; : > "$H"

# 1. page-smoke.js, the five places
if [ "$(lastexit "$OUT/page-smoke.txt")" = 0 ] && grep -q '^PAGE SMOKE: PASS' "$OUT/page-smoke.txt"; then
  result PASS "page-smoke.js (five places)" "PAGE SMOKE: PASS in $(sed -n 's/^seconds //p' "$OUT/page-smoke.txt") s"
else result FAIL "page-smoke.js (five places)" "see $SHOWOUT/page-smoke.txt"; fi
# 2. page-smoke.js refuses a place that is not registered
if [ "$(lastexit "$OUT/page-smoke-unknown.txt")" != 0 ] && grep -q 'no place "nowhere" is registered' "$OUT/page-smoke-unknown.txt"; then
  result PASS "page-smoke.js -- nowhere" "refused: no place \"nowhere\" is registered"
else result FAIL "page-smoke.js -- nowhere" "expected an error naming the unknown place; see $SHOWOUT/page-smoke-unknown.txt"; fi
# 3. harness.js: the twelve gate lines, as at the ref
n=$(wc -l < "$OUT/harness-gates.txt" | tr -d ' '); nr=$(wc -l < "$OUT/ref-harness-gates.txt" | tr -d ' '); np=$(grep -c '^PASS' "$OUT/harness-gates.txt")
hg=$(shasum -a 256 < "$OUT/harness-gates.txt" | cut -c1-16); hr=$(shasum -a 256 < "$OUT/ref-harness-gates.txt" | cut -c1-16)
echo "harness.js gate lines: here $n lines ($np PASS) sha256 $hg; $REF $nr lines sha256 $hr" >> "$H"
if [ "$n" = 12 ] && [ "$(lastexit "$OUT/harness-gates-diff.txt")" = 0 ]; then
  result PASS "harness.js gate lines" "12 lines, $np PASS, the same as at $REF (sha256 $hg)"
else result FAIL "harness.js gate lines" "$n lines here, $nr at $REF; see $SHOWOUT/harness-gates-diff.txt"; fi
# 4. the valley's sentence stream, line for line
hw=$(sed -n 's/^fnv1a32: //p' "$OUT/words-stream-valley.txt"); hwr=$(sed -n 's/^fnv1a32: //p' "$OUT/ref-words-stream-valley.txt")
cw=$(sed -n 's/^sentences hashed: \([0-9]*\),.*/\1/p' "$OUT/words-stream-valley.txt"); cwr=$(sed -n 's/^sentences hashed: \([0-9]*\),.*/\1/p' "$OUT/ref-words-stream-valley.txt")
echo "valley sentence stream: here fnv1a32 $hw over $cw sentences; $REF fnv1a32 $hwr over $cwr sentences" >> "$H"
if [ "$(lastexit "$OUT/same-valley-sentences.txt")" = 0 ] && [ -n "$hw" ] && [ "$hw" = "$hwr" ]; then
  result PASS "valley sentence stream" "fnv1a32 $hw over $cw sentences, identical line for line to $REF"
else result FAIL "valley sentence stream" "here $hw ($cw), $REF $hwr ($cwr); see $SHOWOUT/same-valley-sentences.txt"; fi
# 5. the valley-only page and maps fingerprint
gp=$(sed -n 's/^GOLDEN PAGE ([^)]*): //p' "$OUT/golden-page.txt"); gpr=$(sed -n 's/^GOLDEN PAGE ([^)]*): //p' "$OUT/ref-golden-page.txt")
echo "valley-only page and maps: here $gp; $REF $gpr" >> "$H"
if [ "$(lastexit "$OUT/golden-page.txt")" = 0 ] && [ -n "$gp" ] && cmp -s "$OUT/golden-page.txt" "$OUT/ref-golden-page.txt"; then
  result PASS "valley-only page fingerprint" "$gp, the same as at $REF"
else result FAIL "valley-only page fingerprint" "here: $gp; $REF: $gpr; see $SHOWOUT/golden-page.txt"; fi
# 6. the five-place valley walk, step by step
sp=$(sed -n 's/^GOLDEN PAGE ([^)]*): //p' "$OUT/page-stream.txt"); spr=$(sed -n 's/^GOLDEN PAGE ([^)]*): //p' "$OUT/ref-page-stream.txt")
steps=$(sed -n 's/^steps with the same maps: \(.*\)/\1/p' "$OUT/diff-page-stream.txt")
echo "five-place valley walk: here $sp; $REF $spr" >> "$H"
if [ "$(lastexit "$OUT/diff-page-stream.txt")" = 0 ] && grep -q '^distinct changes: 0$' "$OUT/diff-page-stream.txt" && [ -n "$sp" ]; then
  result PASS "five-place valley walk" "$sp; steps with the same maps $steps"
else result FAIL "five-place valley walk" "here: $sp; $REF: $spr; see $SHOWOUT/diff-page-stream.txt"; fi
# 7. the page-map's words fingerprint over all places
hg=$(sed -n 's/^fnv1a32: //p' "$OUT/golden-words.txt"); hgr=$(sed -n 's/^fnv1a32: //p' "$OUT/ref-golden-words.txt")
cg=$(sed -n 's/^sentences hashed: \([0-9]*\),.*/\1/p' "$OUT/golden-words.txt"); cgr=$(sed -n 's/^sentences hashed: \([0-9]*\),.*/\1/p' "$OUT/ref-golden-words.txt")
tailfrom "$OUT/golden-words.txt" '^GOLDEN (valley' > "$OUT/golden-words-table.txt"; tailfrom "$OUT/ref-golden-words.txt" '^GOLDEN (valley' > "$OUT/ref-golden-words-table.txt"
echo "page-map words fingerprint, all places: here fnv1a32 $hg over $cg sentences; $REF fnv1a32 $hgr over $cgr sentences" >> "$H"
if [ "$(lastexit "$OUT/golden-words.txt")" = 0 ] && [ -n "$hg" ] && cmp -s "$OUT/golden-words-table.txt" "$OUT/ref-golden-words-table.txt"; then
  result PASS "words fingerprint, all places" "fnv1a32 $hg over $cg sentences; its table as at $REF ($(sed -n 's/^seconds //p' "$OUT/golden-words.txt") s)"
else result FAIL "words fingerprint, all places" "here $hg ($cg), $REF $hgr ($cgr); see $SHOWOUT/golden-words.txt"; fi
# 8. the stand-in DOM, 27 configurations
if [ "$(lastexit "$OUT/dom.txt")" = 0 ] && grep -q '^ALL OK$' "$OUT/dom.txt"; then
  result PASS "stand-in DOM (dom-run.js)" "$(grep -c '^OK ' "$OUT/dom.txt") of 27 configurations OK"
else result FAIL "stand-in DOM (dom-run.js)" "see $SHOWOUT/dom.txt"; fi
# 9. the chooser, hash, storage and restore scenarios
if [ "$(lastexit "$OUT/dom-places.txt")" = 0 ] && [ "$(grep -c ': PASS (' "$OUT/dom-places.txt")" = 6 ]; then
  result PASS "chooser, hash, store, restore" "6 of 6 scenarios PASS"
else result FAIL "chooser, hash, store, restore" "see $SHOWOUT/dom-places.txt"; fi
# 10. the sheet probe: every place's sheet by its own rules, and every drawing of it as at the ref
nc=$(grep -c ': check \[\]$' "$OUT/sheet-probe.txt")
sd=$(sed -n 's/^SHEET PROBE: //p' "$OUT/sheet-probe.txt"); sdr=$(sed -n 's/^SHEET PROBE: //p' "$OUT/ref-sheet-probe.txt"); sdd=$(printf '%s' "$sd" | sed 's/^[0-9]* places, //')
nd=$(grep -c '^>   .*fnv1a32 ' "$OUT/sheet-probe-diff.txt"); first=$(grep -m1 '^>   .*fnv1a32 ' "$OUT/sheet-probe-diff.txt" | sed 's/^>   //; s/  *[0-9][0-9]* chars .*//')
echo "sheet drawings: here ${sd:-none}; $REF ${sdr:-none}" >> "$H"
if [ "$(lastexit "$OUT/sheet-probe.txt")" != 0 ] || [ "$nc" != "$(grep -c '^[a-z]*: check ' "$OUT/sheet-probe.txt")" ] || [ "$nc" -lt 5 ] || grep -q 'BAD\|(no hit)' "$OUT/sheet-probe.txt"; then
  result FAIL "sheet rules and drawings" "a sheet breaks its rules, misses a crossing or draws BAD; see $SHOWOUT/sheet-probe.txt"
elif [ "$(lastexit "$OUT/sheet-probe-diff.txt")" = 0 ] && [ -n "$sd" ]; then
  result PASS "sheet rules and drawings" "$nc places by their own rules, every sheet whole; $sdd, the same as at $REF"
else result FAIL "sheet rules and drawings" "$nd drawings differ from $REF (first: ${first:-none}); see $SHOWOUT/sheet-probe-diff.txt"; fi
# 11. colour contrast, each place against the valley
if [ "$(grep -c '^exit 0$' "$OUT/contrast.txt")" = 4 ] && [ "$(grep -c '^pairs lower than the valley: 0$' "$OUT/contrast.txt")" = 4 ]; then
  result PASS "colour contrast" "4 places, no pair lower than the valley's, light or dark"
else result FAIL "colour contrast" "see $SHOWOUT/contrast.txt"; fi
# 12. every place's walk, step by step
wn=$(sed -n 's/^WALKS (\([0-9]* places, [0-9]* steps\),.*/\1/p' "$OUT/walks.txt"); wnr=$(sed -n 's/^WALKS (\([0-9]* places, [0-9]* steps\),.*/\1/p' "$OUT/ref-walks.txt")
wh=$(sed -n 's/^WALKS ([^)]*): //p' "$OUT/walks.txt"); whr=$(sed -n 's/^WALKS ([^)]*): //p' "$OUT/ref-walks.txt")
echo "every place's walk: here ${wn:-none}, $wh; $REF ${wnr:-none}, $whr" >> "$H"
if [ "$(lastexit "$OUT/walks.txt")" = 0 ] && [ "$(lastexit "$OUT/diff-walks.txt")" = 0 ] && [ -n "$wh" ]; then
  result PASS "every place's walk" "$wn, every step's markup and maps as at $REF ($wh)"
else
  more=""; for pl in $WALKDIFF; do [ -f "$OUT/diff-walk-$pl.txt" ] && more="$more, diff-walk-$pl.txt"; done
  result FAIL "every place's walk" "differ: ${WALKDIFF:-see the file}; see $SHOWOUT/diff-walks.txt$more"
fi
# 13. preview.html is index.html in the host skeleton, in the game folder and each variant
if [ "$(lastexit "$OUT/preview.txt")" = 0 ] && grep -q '^previews stale: 0 of ' "$OUT/preview.txt"; then
  result PASS "preview.html current" "$(sed -n 's/^previews stale: 0 of \([0-9]*\)$/\1/p' "$OUT/preview.txt") previews, each index.html in the host skeleton"
else result FAIL "preview.html current" "stale: $(grep '^STALE' "$OUT/preview.txt" | awk '{print $2}' | tr '\n' ' ')(python3 checks/page/preview.py --write); see $SHOWOUT/preview.txt"; fi
# 14. nothing changed under the run
if cmp -s "$OUT/md5-start.txt" "$OUT/md5-end.txt"; then result PASS "game files unchanged during the run" "md5 of the game files at start and end"
else result FAIL "game files unchanged during the run" "FILES CHANGED DURING THE RUN"; fi

echo
echo "Hashes"
sed 's/^/  /' "$H"
echo
cat "$RES"
if [ "$NF" -eq 0 ]; then
  echo "RUN-ALL: PASS ($NC of $NC checks, against $REF, $(( $(date +%s) - T0 )) s)" | tee -a "$RES"; exit 0
else
  echo "RUN-ALL: FAIL ($NF of $NC checks failed, against $REF, $(( $(date +%s) - T0 )) s)" | tee -a "$RES"; exit 1
fi
