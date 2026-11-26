#!/bin/sh
# The per-place design gates PG1 to PG14 (placelab.js), on the working tree's engine.js, each place by its preset
# key, with the ways of playing the final rounds used (final-ways.js).
#
#   checks/engine/run-gates.sh smoke [place]              every place (or one) at the smoke counts, about 2 minutes
#   checks/engine/run-gates.sh full <place|all> [--pool]  the full counts, then the lead's reading (READ: PASS/FAIL);
#                                                        all = the four new places (the valley, the reference, by name)
#
# full: 5 to 8 minutes a place (the Bridges, with a battery of 57 policies, about 11); --pool measures the seals
# on 200 seeds instead of 40, so that PG10's ratio part and PG11's seal floor and ceiling are read (LEAD-DECISIONS
# 2.6 and 4.3): about 15 to 20 minutes a place, the Bridges about 40. 'all' runs JOBS places at a time (default 3).
# Environment: JSC (the jsc path), JOBS, GATES_ENGINE (another engine file to test instead of engine.js),
# GATES_WAYS ('final', the default, or 'placeholder' for placelab's own placeholder policies), GATES_OPTS (JSON
# merged into the gates() options, e.g. '{"only":["PG1","PG9"]}' or '{"counts":{"lives":500}}').
# Outputs: checks/out/gates-smoke.txt, checks/out/gates-full-<place>[-pool].txt.
# Exit: smoke 0 when the run finishes; full 0 when every place's reading is PASS.
JSC=${JSC:-/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc}
ROOT=$(cd "$(dirname "$0")/../.." && pwd) || exit 2
OUT="$ROOT/checks/out"
mkdir -p "$OUT" || exit 2
cd "$ROOT" || exit 2
jstr() { printf '"%s"' "$(printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g')"; }
CK=$(jstr "$ROOT/checks")
ENG=""; [ -n "${GATES_ENGINE:-}" ] && ENG=",\"engine\":$(jstr "$GATES_ENGINE")"
WAYS=",\"ways\":$(jstr "${GATES_WAYS:-final}")"
OPTS=""; [ -n "${GATES_OPTS:-}" ] && OPTS=",\"opts\":$GATES_OPTS"
PLACES="valley banks watch bridges saltmarket"; NEWPLACES="banks watch bridges saltmarket"
known() { for p in $PLACES; do [ "$p" = "$1" ] && return 0; done; return 1; }
usage() { sed -n '2,17p' "$0" | sed 's/^# \{0,1\}//'; exit 2; }

case "${1:-}" in
smoke)
  P=${2:-all}; [ "$P" = all ] || known "$P" || usage
  F="$OUT/gates-smoke.txt"; [ "$P" = all ] || F="$OUT/gates-smoke-$P.txt"
  "$JSC" -e "var CHECKS_DIR=$CK; var GATES={\"place\":\"$P\"$ENG$WAYS$OPTS}" checks/engine/gates-smoke.js > "$F" 2>&1
  echo "exit $?" >> "$F"
  sed -E -n '/^==== gates/p; /^(PASS|FAIL)  PG/p; /^(ALL|SOME) GATES/p; /^smoke run finished/,$p' "$F"
  grep -q '^smoke run finished' "$F"
  ;;
full)
  P=${2:-}; [ "$P" = all ] || known "$P" || usage
  POOL=""; SUF=""; [ "${3:-}" = --pool ] && { POOL=",\"pool\":200"; SUF="-pool"; }
  [ "$P" = all ] && LIST=$NEWPLACES || LIST=$P
  JOBS=${JOBS:-3}; i=0
  echo "full gates for: $LIST$( [ -n "$POOL" ] && echo ' (seals on 200 pooled seeds)'); load: $(uptime | sed 's/.*load averages*: //')"
  for p in $LIST; do
    ( s=$(date +%s); "$JSC" -e "var CHECKS_DIR=$CK; var GATES={\"place\":\"$p\"$POOL$ENG$WAYS$OPTS}" checks/engine/gates-full.js > "$OUT/gates-full-$p$SUF.txt" 2>&1
      e=$?; echo "seconds $(( $(date +%s) - s ))" >> "$OUT/gates-full-$p$SUF.txt"; echo "exit $e" >> "$OUT/gates-full-$p$SUF.txt" ) &
    i=$((i + 1)); [ $((i % JOBS)) -eq 0 ] && wait
  done
  wait
  fail=0
  for p in $LIST; do
    f="$OUT/gates-full-$p$SUF.txt"
    sed -E -n '/^==== gates/p; /^(PASS|FAIL)  PG/p; /^reading \(LEAD/,$p' "$f"
    echo
    grep -q '^READ: PASS' "$f" || fail=1
  done
  for p in $LIST; do grep '^READ: ' "$OUT/gates-full-$p$SUF.txt" || echo "READ: FAIL  for $p  (the run did not finish: see checks/out/gates-full-$p$SUF.txt)"; done
  exit $fail
  ;;
*) usage ;;
esac
