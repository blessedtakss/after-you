> **Record of its time.** Written 2026-11-25 19:29 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Stage report: machinery

(Written by the lead from the stage's structured result: the subagent harness refused report files.)

Status: done

## Fingerprints

golden-words (page-map/golden-words.js run on G): fnv1a32 6d84219b, 382,559 sentences (was 20bddf72, 362,279). Without the 6 habit-replay Lives: 4530f136-class run of 362,859 sentences, which equals the published 362,279 in order plus 580 inserted. golden-page (page-p2/check/stream-page.js and page-p1/golden-page-p1.js): page abf3fee6, maps 7a78d3e9 (was 72a7c55d / 7a78d3e9). Per size: phone 48692bf0 / a80b5f11, laptop 025ac673 / f3d5aeae, tall 2b13eb85 / f3d5aeae.

valleyIdentical: False

## Summary (the full report)

STAGE 2 (machinery for many places, valley content only): DONE. Every check passes. With only the valley registered, the one visible change is the afterword.

What was built in the game folder (G = after-you). No git command changed anything. engine.js and harness.js are untouched (md5 2fa86b59…, cae4bd3f…).

1. Chooser. index.html has a hidden fieldset #opening-places (vh legend "Where you live") between the title and the premise.
   - app.js drawChooser() lists AfterYou.PLACE_ORDER filtered to AYPlaces as radios (name "place", ids place-\<id>) in the cards' option style (.opt.is-place).
   - The group shows only for two or more places. It is built once and only re-checked after that, so arrow keys keep focus.
   - choosePlace calls setPlace (state.place, AYWords.use, fillStatic, the hash's seed), then drawOpening (premise, four lines, sheet with stakes, sheet number, earlier lives).
   - PAST_SHOWN = 3 and PAST_SHOWN_CHOOSING = 2.
2. Hash. The pattern is HASH_RE /^#([a-z]+)-([A-Za-z0-9-]+)$/ and only a registered place counts.
   - #valley-48213 and #valley-shoal-3 keep their meaning. #banks-12 with no banks, #moor-5, #watch-, #WATCH-3, #valley and #-5 fix nothing.
   - The hash's place is put in hand and its option checked. Its seed is fixed only while that place is in hand.
   - hashchange on the Opening re-applies and redraws; during a Life it is only recorded.
3. Stored lives. The key is the same, with KEEP_LIVES = 60.
   - Entries carry place; an absent place is the valley; a malformed place is dropped.
   - Entries of places this build lacks are kept in store, never listed.
   - livesHere() limits the Opening and the Chronicle to the place in hand.
   - pastLife uses the entry's own place's pastName. saveLife stores place.
   - snapshot() carries place. restore() honours it: absent means valley, unknown is refused. If a snapshot of another place fails mid-restore, start() redraws the Opening.
   - Every createLife call passes state.place, checked statically and at run time.
4. End of a Life. "Live another life" stays in the place. A new quiet #other-place ("Choose another place") button shows only for two or more places; it goes to the Opening and focuses the place in hand.
5. Afterword. A block last in .chron-side shows W.afterword(). AYPlaces.add now requires an afterword and writtenFor. The valley's afterword: "Farming neighbours have long brought in each other's harvests and raised each other's barns in a single day, with no written count of who owes what. The help goes round because each house remembers who came last time, and a house that never comes soon finds that nobody comes to it."
6. Engine-driven copy.
   - W.stakes(p) gives B, C, S, H, level, cost, worth, the outcomes both/mine/theirs/neither and the stock numbers.
   - The Opening's line templates are filled by slots; the valley's line 2 is now 'costs you {cost} {costGoods} … worth {worth}'.
   - The Opening sheet's numbers come from o.demo = [st.mine, st.theirs]; sheet.js throws without them.
   - The strip's line words (half, 'N in 10', 'N in 100', or a stock level) are computed from HOLD_LINE and the flow kind into {line}. The line sits at HOLD_LINE / flowTop(p).
   - flowTop is max/start for a stock, max(1.05, 1/(1-FOG)) for hands, 1.05 otherwise. Bad side: is-under for 'holds', is-over for 'breaks'.
   - range.of is worded by countWord into {of}.
   - lastDay.rule 'habit' (REPLAY 'season' gives the same) builds the line from each changed tie's lived/replayed in both directions via lastAct. Measured: "On the last day you sent a hand to the Garrow house. Had you stayed home against the Garrow house, the valley held in 43 of the first 200 futures, against 45 of those as you left it. …". Otherwise the valley's sentence is used.
   - verdict().season and wonOnSeason are never read (check enforced). The seal text comes from charter.seal.
7. page-smoke.js.
   - SKINS for all five places, and a leak list per place (76 words for the valley) applied to every sentence, every lexicon string and the afterword.
   - rulesAgainstCopy per place:
     - writtenFor (CUSTOM, CHARTER, FLOW_KIND, STOCK, S, H) must equal the Life's params.
     - No digit may appear in the Opening or rule templates.
     - The Opening's numbers must be among the Life's stakes, worked out independently, and must include C and B x level. With the stakes moved to sentinel values the numbers must move.
     - The sheet's demo must equal signed(-C) and signed(B x level).
     - The strip and rule lines must name the line computed independently and move with HOLD_LINE.
     - {of} must give 'seven' for 7.
     - The gloss must start with the custom's own name.
     - The afterword must be 2-3 sentences.
   - Per Life: line, flow top, range.of and habit last-day checks. 6 extra valley Lives run with {REPLAY:'habit'}.
   - Valley-only phrases are guarded; other places get lexicon-driven or structural forms.
   - New hooks cover the hash, chooser, store, snapshot, demo, strip and afterword position. 'poacher' was already forbidden.
   - The limit is SECONDS_A_PLACE = 60 for each place checked.

Proof (MEASURED; outputs in page-p2/out).
- page-smoke: PASS in 26.2 s, quiet machine.
- harness: 12 gate lines identical to harness-mine.txt.
- dom-run: six configurations OK with the same metrics as stage 1. The adapted copy changes the Chronicle-list expectation from min(20, n+1) to min(60, n+1), because the cap moved to 60, and adds 3 checks.
- dom-places: 6 scenarios PASS (305 checks).
- smoke-places (4 throwaway places on real rules): PASS.

Fingerprint differences, all MEASURED.
- golden words: 20bddf72 became 6d84219b. The 362,279 published sentences are a subsequence of the new 382,559, with no change or loss. +570 come from 114 Lives × 5 new calls (placesHead, otherPlace, placeName, afterword, heads().afterword). +10 come from the hooks' copy-at-rest check. +19,700 are the 6 habit-replay Lives appended at the end of the valley's run.
- golden page: 72a7c55d became abf3fee6, maps unchanged at 7a78d3e9. The step diff finds exactly 4 insertions: the hidden chooser fieldset, the hidden other-place button, the empty afterword block, and the afterword text in the 3 Chronicle steps.
- page-map/golden-page.js itself cannot load the stage-1 page (it lacks places/ and sheet.js). stream-page.js is the same walk and hash, and reproduces 72a7c55d on stage 1's files.
- Not seen in the walk: the Chronicle lists up to 60 lives (was 20), and stored entries now carry place 'valley'.

Room (MEASURED, real browser).
- At 1280x800 with six lives: the valley alone ends at 717 of 800 with no scroll. With five places and two lives it ends at 754. With three lives it would end at 776.
- I kept two (ARGUED): other places' own premise and lines are longer, and the Banks line 2 in TUNE.md is about two lines longer than the valley's.
- At 400x800 dark: Begin stays on the first screen and there is no horizontal scroll.
- Keyboard arrows keep focus. No console errors.

Open items: see openIssues.

## Checks

- **page-smoke.js (valley, the only registered place)**: PASS. 26.2 s by the clock against the new limit of 60 s a place (26.6 s CPU). 120 Lives (114 plus 6 with the habit replay), 109 of 109 AYWords functions, 382,559 sentences, 203 hooks. MEASURED. (cd G && jsc page-smoke.js -> page-p2/out/final-page-smoke.txt)
- **page-smoke.js -- nowhere**: throws 'no place "nowhere" is registered', exit 3. MEASURED. (page-p2/out/final-page-smoke-unknown.txt)
- **harness.js**: Its 12 gate lines are identical to those in `<scratch>/harness-mine.txt` (diff empty). Finished in 139.9 s; engine.js is unchanged. MEASURED. (cd G && jsc harness.js -> page-p2/out/final-harness.txt, final-gates.txt vs gates-ref.txt)
- **dom-run, six known-good valley configurations (adapted copy dom-run-p2.js)**: All six OK, exit 0. Checks 767/762/823/837/782/837, three more each than stage 1, with the same lettering, Why? counts, slices, pin gaps and fitted name. MEASURED. (page-p2/check/run-dom-six.sh -> page-p2/out/final-dom-six.txt)
- **dom-places: chooser, hash, stored lives, restore in the stand-in DOM (throwaway test places from page-p2/check/test-places.js only)**: All PASS: one 17 checks, hash-one 7, choose 232, hash 16, restore 21, store 12. MEASURED. (page-p2/check/run-dom-places.sh -> page-p2/out/final-dom-places.txt)
- **page-smoke with the four throwaway places registered (smoke-places.js -- valley)**: PASS. Rules were checked against the words of 5 places (880 strings, 50 sheets). 36 Lives on the real banks, watch, bridges and saltmarket rules went through every per-Life check, with 23 habit-replay last-day lines. MEASURED. (page-p2/out/final-smoke-places.txt)
- **golden-words fingerprint**: 20bddf72 (362,279 sentences) became 6d84219b (382,559). Every published sentence is still there, in order. Without the habit Lives the run adds 580 sentences, all from new calls; the 6 habit Lives append 19,700 more. MEASURED. (page-map/golden-words.js -> out/final-golden-words.txt; stream-words.js + diff-words-stream.py -> out/final-diff-words-nohabit.txt, out/final-diff-words-habit.txt)
- **golden-page fingerprint**: page 72a7c55d became abf3fee6; maps stay 7a78d3e9 (identical in all 168 steps). The step diff finds exactly 4 insertions: the hidden chooser fieldset, the hidden other-place button, the empty afterword block, and the filled afterword (Chronicle steps only). MEASURED. (page-p2/check/stream-page.js and page-p1/golden-page-p1.js -> out/final-page-stream.txt, out/final-golden-page-p1.txt; diff-page-stream.py -> out/final-diff-page.txt)
- **Room in a real browser, 1280x800, six earlier lives**: Valley alone: chooser hidden, sheet ends at 717 of 800, no scroll. Five places (test places injected into the running page): chooser 42 px, two lives listed, sheet ends at 754, no scroll; with three lives it would end at 776. At 400x800 dark, Begin ends at 598 and there is no horizontal scroll. ArrowRight keeps focus and redraws the Opening. No console errors. MEASURED. (Browser pane on preview.html (port 8791))

## Shared changes needed

- Every future places/\<id>.js must supply writtenFor, name, lastAct and charter.lastDayHabit, use slots in place of typed numbers (Opening, {line}, {of}), and give a non-empty afterword. AYPlaces.add and page-smoke enforce all of this.
- page-smoke.js PLACE_RULES needs a neutral pattern for each place added. SKINS already lists draft skin words for banks, watch, bridges and saltmarket; each place's writer should confirm them.

## Open issues

- Visible valley differences, as the task requires: the afterword block in the Chronicle. Also, when more than 20 lives are stored, the Chronicle now lists up to 60 (the store keeps 60 across all places).
- The page-smoke time limit is wall-clock time, 60 s for each place checked. On this machine under load average 60-100, the valley alone took 67.4 s wall for 45.9 s CPU and tripped the limit. A quiet run took 26.2 s. A busy machine can fail the clock while every check passes (measured).
- PAST_SHOWN_CHOOSING = 2 was kept as a margin (argued). With the test names, three lives would still fit at 1280x800 (776 of 800 px). Re-measure with each real place's premise and lines.
- The afterword sits after the earlier-lives list, as LEAD 3.5 and PAGE-MAP 4.1 place it. With many lives of one place it ends up far down the side column. Moving it before the list would be a one-line change if the lead prefers.
- Choosing a place on the Opening does not rewrite the hash. A reload on the Opening returns to the hash's place; a Life in progress restores its own place from the snapshot.
- Stored lives of places this build does not know are kept (never listed) rather than dropped, and they count toward the 60.
- New required fields for every place file: writtenFor (CUSTOM, CHARTER, FLOW_KIND, STOCK/S/H presence; checked against life.params), name, lastAct.{sent,stayed}, charter.lastDayHabit, and an afterword string. Templates must use {cost}/{worth}/... slots, {line} and {of}. Each new place also needs a SKINS entry checked by its writer, a PLACE_RULES neutral pattern, and policies that reach page-smoke's coverage demands.
- flowAlt's 'Lowest' is the lowest flow. Under CHARTER 'breaks' that is the town's best season, so the Saltmarket's template must word it that way. For a stock place, flowAlt's amounts are levels, not 'in 100'.
- README.md is stale (three scripts, #valley- only, 20 stored games). It was not edited in this stage.
- Not in this stage (LEAD 3.8): Banks gauges and the stock on cards and in the Afterwards, the Saltmarket town cost on the day total, a meter for a store below zero, and each place's real words.
- Size: the six page files total about 344 KB (about 13 KB more than stage 1). Four place files of about 20 KB each would bring the page to about 420 KB.

## Files changed

- after-you/words.js
- after-you/places/valley.js
- after-you/sheet.js
- after-you/app.js
- after-you/index.html
- after-you/page-smoke.js
- after-you/preview.html
