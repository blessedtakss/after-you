> **Record of its time.** Written 2026-11-25 22:11 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Stage report: place:bridges

(Written by the lead from the stage's structured result: the subagent harness refused report files.)

Status: done

## Fingerprints

Valley sentences (page-p2 stream-words.js -- valley): fnv1a32 6d84219b over 382,559 sentences and 11,556,895 characters. These are identical line for line to stage 2's.

Valley-only page (page-p1/golden-page-p1.js): page abf3fee6, maps 7a78d3e9. Per size:
- phone: 48692bf0 / a80b5f11
- laptop: 025ac673 / f3d5aeae
- tall: 2b13eb85 / f3d5aeae

The Bridges' own sentences (stream-words.js -- bridges, 482,152 sentences):
- before: a6ee3b96 (14,116,578 characters)
- after: 5f4ffd20 (14,118,432 characters)

All five places (page-map/golden-words.js, unmodified): 5b3a9f2b over 2,359,003 sentences and 74,679,932 characters. This includes the Watch and Saltmarket polishers' work in progress, so it is not a stage fingerprint.

page-map/golden-page.js: exit 3, as in stages 2 to 4.

harness.js: its 12 gate lines are identical to harness-mine.txt.

valleyIdentical: True

## Summary (the full report)

STAGE 5 (polish the Bridges): DONE. The only file changed is places/bridges.js (final md5 bb98132d). Every check passes. [m] = measured, with outputs in page-p5-bridges/out; [a] = argued.

## 1. Words: what changed and why

The before/after diff of all 1,356 sentence shapes is in out/try0-shapes.txt and out/final-shapes-bridges.txt [m].

**Opening premise**
- Was: "a road of eight yards". That reads as a length.
- Now: "Twelve days of carting on a road of eight carters. Then you leave, and the road goes on without you."

**Opening line 2**
- Was: "Giving way costs you 1 load; when they give way, you cross and gain 3. If you both wait, nobody crosses. …"
- Problem: read literally, those clauses add up to −1 or +2 when both wait. The card says 0.
- Now each outcome is stated with its own number, all from slots: "Waiting while they cross costs you 1 load; crossing while they wait gains 3. If both wait, nobody crosses: 0. If both drive on, the wheels lock and each loses 2."
- {bothSigned} makes the 0 a slot from the Life, so it stays true if a preset moves. page-smoke's 'moved stakes' check passes.

**Day sentences**
- yesterday.theirs: "Yesterday they gave way. You crossed." (was "Your cart came on"). It now matches the reveal.

**Sister's Why? card**
- whereThird[2]: "After the Corra carter's cart crossed" (was "After the cart of the Corra carter crossed").

**Luck, said as the valley says it**
- The Afterwards and the Chronicle now say "luck at the bridges" (oneFuture, rowsCaption, rowsExplain, mattered.none). They used to say "its own mules" and "the same mules".
- The card words are unchanged and follow LEAD 3.2: "Your mule would not stand, and your cart came on. They saw only a cart coming on. They gave way, and you crossed. +3". Whether the other cart came on by choice is never said.

**Names**
- pastName and placeNo are now "Bridges {seed}" and "Bridges no. {seed}" (were "Roads"). They match the chooser's label and the #bridges-\<seed> hash.
- "Leave the road" and "Drive this road again": the premise's "the road".
- rangeNote: "starts from the road as your twelve days left it".

**Afterwards key**
- "loads gained or lost this season" (was "loads carried this season"). A season's number is below zero in about 60% of the resting-map lines [m: shapes, houseAtEnd].

**Afterword** (one paragraph, two sentences, no theory words): "At a one-lane bridge, a crossroads with no lights or a merge where two lanes become one, people get through by taking turns, and it works only while everyone knows whose turn it is. When two arrive together, waving each other on for ever stops everyone as surely as both pushing ahead; what moves the road is one going now and the other going next."

**Kept as they were**
- The five titles: Meeting a new carter / After you both waited / After their cart crossed / After your cart crossed / After the wheels locked. They are short and neutral.
- The custom: "The old rule of the road, to let a new carter cross first and then do as they did the day before, would leave the yard at {purse} loads." It matches [1,1,0,1,0] situation by situation [a].
- The luck note.
- The charter words: moved / jammed; "The road moves if, over the last ten seasons, one cart crossed while the other waited on at least half of the days at the bridges."
- The seal: "Yard kept, road better off."
- The last-day words.
- The two long luck 'yesterday' lines are kept at their stage-4 length (105 and 110 characters), because the laptop day's room was not measured.

## 2. Sheet decoration

The drawings were rendered with Quick Look, light and dark, at both sizes, before and after [m: out/pics-*].

**The map note**
- Before, "the bridges" at (0.5, 0.745) crossed the NE and NW roads and the hands on both sheets [m].
- The note now reads "the stream". It is lettered in water colour under the stream's west reach at (0.235, 0.92), clear of every road, hand, name and the frame at all three drawn sizes [m: final-sheet-room.txt].
- There is no room between the middle bridges on the compact sheet.
- The bridges are drawn, and the Opening names them.

**The stream's east reach**
- It was reshaped ([0.635,0.695],[0.75,0.805],[0.88,0.815],[1.03,0.80]).
- It now passes over the north mark (3.3 px at the 320px enlargement, was −3.5) and under the east name (3.1, was −1.1).
- AYSheet.check is still [] [m].

**Result glyph:** the stream plus a bridge's two parapets (key-bridge) across the carts' lanes.

**Seal:** a humped stone bridge (seal-parcel) with its parapet (seal-deck) and water (seal-water), inside the inner ring. The check sits on it as on the valley's parcel.

**Lettering:** at least 11.14 px on every screen [m: DOM]. All classes use tokens only [m].

## 3. A sample Life: seed 1, "take turns, at the jams too" [m: out/final-sample-life.txt]

**Opening**
- The bridges: Twelve days of carting on a road of eight carters. Then you leave, and the road goes on without you.
- Between you and each of your four neighbours is a bridge one cart wide. Each day you can give way or drive on. So can they.
- Waiting while they cross costs you 1 load; crossing while they wait gains 3. If both wait, nobody crosses: 0. If both drive on, the wheels lock and each loses 2.
- What you do, others see. Some will take it up as their own way, at the end of every fourth day.
- Your yard starts with 50 loads. At the end two things are counted: whether it lasts the winter, and how well the road moves.
- The sheet shows −1 at your end and +3 at theirs.
- Luck note: "A mule can refuse to stand, and then your cart comes on though you meant to give way. It costs and brings what driving on does. The other carter sees only a cart coming on."

**Day 1**
- "Yard: 50 of 36 loads. The old rule of the road, to let a new carter cross first and then do as they did the day before, would leave the yard at 17 loads."
- "The Corra carter: You gave way. Their cart came on and crossed. −1"
- "Your sister: You both gave way. Nobody crossed. 0"
- "Today: −3. Yard: 47 of 36 loads."
- Elsewhere: "Your sister gave way to the Corra carter, whose cart came on."

**Day 2**
- "The Corra carter: Yesterday you gave way. Their cart came on. Counts in your ways under: After their cart crossed". You drive on.
- "You drove on. Their cart came on too: the wheels locked. −2"
- "The Quill carter: They gave way. You crossed. +3"
- "Today: +2. Yard: 49 of 36 loads."
- Elsewhere: "Your sister and the Corra carter: both carts came on."

**Day 3**
- "The Quill carter: Yesterday they gave way. You crossed. Counts in your ways under: After your cart crossed". You give way.
- "You gave way. Their cart came on and crossed. −1"
- "The Corra carter: Yesterday you drove on. Their cart came on too." (After the wheels locked): you give way.
- "Today: −4. Yard: 45 of 36 loads."

**A mule card** (from the stream): "Your mule would not stand, and your cart came on. They saw only a cart coming on. They gave way, and you crossed. +3"

**The end of the first season**
- "At each season's end, carters look at who is doing well and may take up their ways. Your sister follows your ways in 5 of 5 situations."
- "After you both waited: now drives on, as you did the one time it came up."
- "After the wheels locked: now gives way, as you did 2 of 2 times."

**Leaving**
- "The carting is done. Yard: 43 of 36 loads. Your yard is kept. Your heir takes the yard and does in each situation as you did."
- "After the wheels locked: gave way 7 of 12".

**The Afterwards**
- "Thirty seasons without you. This is one future of 2000. Each has its own luck at the bridges and its own chances taken."
- Strip: "Days one cart crossed while the other waited, season by season", with the line at "half".
- In words: "Season 1: 39 in 100. Lowest: 19 in 100, in season 14. Last ten seasons: 32 in 100 on average. The line for a moving road is half."
- "Season 1: the Quill carter takes up your ways." "Season 4: your sister gives up your ways for the Corra way."
- "In this future the road jammed. No carter keeps your ways after season 19."

**The Chronicle**
- "Yard: Kept: 43 of 36 loads."
- "Road: With you, the road kept moving in 1046 of 2000 futures. Had you kept the old rule of the road: 674 of 2000."
- "The same road played forward 2000 times, with different luck at the bridges and different chances taken."
- "Your mark: +19. The mark is the gap between the two counts: 372 more futures with the road moving, about 19 in every hundred."
- "Of thirteen plain ways a carter might have left here, the best keeps the road moving in 56% of the first 1000 futures and the worst in 12%."
- SEAL: "Yard kept, road better off."
- "After your cart crossed: you gave way 11 of 11 times. Had you driven on there once more: the road moved in 456 of the first 1000 futures. As you left it: 530."
- "Bridges 1: kept, 43 of 36. Mark +19. Seal."
- Then the afterword.

**Same seed, selfish act**
- "On the last day you gave way to the Corra carter. Had you driven on toward the Corra carter, the road kept moving in 393 of the first 1000 futures, against 391 of those as you left it. Your yard would have been 41 of 36 loads."
- The seal is withheld silently.

**Same seed, never give way:** "Yard: −16 of 36 loads. Your yard is 52 loads short."

## 4. Valley identity [m]
- Sentences: 6d84219b, identical line for line.
- Valley-only page: abf3fee6 / 7a78d3e9.
- The 6 valley DOM configurations: OK.
- Harness: 12 gates identical.
- No shared file touched.

## Checks

- **page-smoke.js -- bridges (final file, md5 bb98132d)**: PASS in 42.7 s. 150 Lives (the valley's 7 policies, plus 27 x take turns at the jams too and 9 x its selfish act). 482,152 sentences checked. 13 seals. Card numbers checked against their outcome's stakes: 7200. Stores told below zero: 31. 109 of 114 AYWords functions used; the other 5 are the stock and town words this place lacks. MEASURED. (cd game && jsc page-smoke.js -- bridges -> page-p5-bridges/out/final2-page-smoke-bridges.txt (also final-page-smoke-bridges.txt, 45.3 s, on the pre-comment-edit file))
- **page-smoke.js, all five places**: PASS in 211.6 s (limit 300 s). 2,359,003 sentences. 114 of 114 functions. 306 hooks. Colours checked for banks, watch, bridges and saltmarket. Run on the other polishers' watch.js and saltmarket.js as they stood then. MEASURED. (jsc page-smoke.js -> out/final-page-smoke-all.txt)
- **Every Bridges sentence read**: The stream dump has 482,152 sentences, which reduce to 1,356 distinct shapes (numbers as N, carter names as X). All were read. The before/after shape diff shows exactly the intended changes and nothing else: premise, Opening line 2, afterword, placeNo/pastName, the map note, legendAfter.income, yesterday.theirs, leave button, againSame, oneFuture, rowsExplain, rowsCaption, rangeNote, mattered.none, whereThird[2]. MEASURED. (check/stream-words.js -- bridges + check/shapes.py -> out/try0-shapes.txt (before), out/final-shapes-bridges.txt (after); hash a6ee3b96 -> 5f4ffd20)
- **The valley's sentences**: IDENTICAL line for line to stage 2: 382,559 sentences, fnv1a32 6d84219b, 11,556,895 characters. MEASURED. (page-p2/check/stream-words.js -- valley -> out/final-words-stream-valley.txt; page-p3/check/same-sentences.py -> out/final-same-valley-sentences.txt)
- **Valley-only page (page-p1/golden-page-p1.js)**: page abf3fee6, maps 7a78d3e9, equal to stages 2-4. Per size: phone 48692bf0/a80b5f11, laptop 025ac673/f3d5aeae, tall 2b13eb85/f3d5aeae. MEASURED. (out/final-golden-page-p1.txt)
- **page-map/golden-words.js (unmodified)**: PASS, exit 0. fnv1a32 5b3a9f2b over 2,359,003 sentences and 74,679,932 characters. All five places as they stood, including the Watch and Saltmarket polishers' work in progress, so the hash is not a stage fingerprint. MEASURED. (out/final-golden-words-pagemap.txt)
- **page-map/golden-page.js (unmodified)**: Exit 3: it cannot load the page without places/ and sheet.js, exactly as in stages 2-4. MEASURED. (out/final-golden-page-pagemap.txt)
- **harness.js**: Its 12 gate lines (G1-G10, X1, X2) are identical to harness-mine.txt (empty diff). 140.7 s. verdict mean 1.014 s, PASS. engine.js and harness.js md5 unchanged (2fa86b59, cae4bd3f). MEASURED. (out/final-harness.txt, final-gates.txt, final-gates-diff.txt, final-md5-start/end.txt)
- **Stand-in DOM, Bridges whole Lives on four screens**: All 5 OK, each through a whole Life to the Chronicle, then a second Life and the chooser away and back: laptop seed 4 honest (1058 checks); tablet seed 11 'send' with 6 stored lives (1081); phone seed 31 'old' (1128); phone320 seed 5 'never' with 3 lives (1083 checks; 5 meters drawn below zero); phone320 seed 1 honest (1128). Smallest map lettering on day 1: 11.62 / 11.43 / 11.14 / 11.14 / 11.14 px. MEASURED. (check/run-dom.sh (page-p4's dom-run-p4.js unchanged) -> out/final-dom.txt; rerun on the final file: 5 OK)
- **Stand-in DOM, the six valley configurations**: All 6 OK (1053-1130 checks). MEASURED. (out/final-dom.txt)
- **Sheet rules (AYSheet.check) and crossings**: bridges: [] on both sizes. Each of your four ties meets the stream exactly once, and the downs stay in their band. Crossings: wide 1@417.7,340 2@347.7,302 6@253,303.4 7@184.8,341. MEASURED. (page-p4/check/sheet-probe.js -> out/final-sheet-probe.txt)
- **Notes, names and north mark against frame, stream, roads and yards (PAGE-MAP 2.4 rule 3), three drawn sizes**: 'the stream' note: inside the frame by at least 15.5. Clear of your yard's name by 83.6 / 28.9 / 9.1, of the stream by 22.3 / 10.1 / 6.6, and of the hands on the west road by at least 27.9 (wide / compact at 368px / compact enlarged x1.27 for 320px). North mark to stream: 37 / 11.6 / 3.3 (stage 4: -3.5 at the 320px enlargement). East name (5 letters) to stream: 28.6 / 9.1 / 3.1 (stage 4: -1.1). 'the downs' stays 4.8 above the crests. MEASURED by text-box estimates (italic 0.46 em a letter). (check/note-room.js, check/geo-probe.js -> out/final-sheet-room.txt)
- **Classes the Bridges draws with use tokens only (rule 4)**: 16 of 16 use tokens only: key-river, key-bridge, seal-parcel, seal-deck, seal-water, m-bridge, m-parapet, m-crest, m-cart, m-wheel, m-shaft, m-ground, m-river-bank, m-river-water, m-note, m-ridge. MEASURED. (out/final-classes.txt)
- **Colour contrast against the valley**: 0 of 11 pairs lower, light and dark. The water note ('the stream', river on paper-raised) is 6.69 / 7.02, against the valley's 5.43 / 6.69. MEASURED. (page-p3/check/contrast.py index.html bridges -> out/final-contrast.txt)
- **Drawings rendered and looked at (Quick Look, not the browser)**: Every mode at both sizes, light and dark, plus glyphs, keys and the seal. Before: the note 'the bridges' crossed the NE/NW roads and the hands on both sheets, and the north mark sat on the stream at the 320px enlargement. After: both are clear (see the room check). MEASURED (pictures). (check/sheet-svgs.js + check/render-sheets.py -> out/pics-before/, out/pics-after/, out/pics-after-dark/ (e.g. compact-day-revealed, compact-sheet-up, seal))
- **Opening room**: The new premise (100 characters, was 98) and line 2 (161, was 160) never wrap to more lines than the stage-4 lines at any column from 12 to 40 em. yesterday.theirs got shorter. The Afterwards key item 'loads gained or lost this season' is 7 characters longer. ARGUED by a proportional width model; not measured in a browser (this stage was told not to use it). (check/wrap.py + wrap-pairs.json -> out/final-wrap.txt)
- **Sample Lives**: Seed 1, honest: kept 43 of 36, mark +19, seal. Same seed, selfish: last-day line from 'gave way' and 'driven on', seal withheld. Never give way: 'Yard: -16 of 36 loads. Your yard is 52 loads short.' Seed 4, honest: also printed. MEASURED. (page-p4/check/sample-life.js -- bridges [4] -> out/final-sample-life.txt, out/final-sample-life-seed4.txt)
- **Only my file changed**: Between the start and the end, the only shared-folder files that changed were places/bridges.js (mine) and places/watch.js and places/saltmarket.js (the other polishers'). words.js, app.js, sheet.js, index.html, page-smoke.js, engine.js, harness.js, smoke.js and preview.html are unchanged. preview.html needs no regeneration: it loads places/bridges.js through index.html. No git command was run. MEASURED. (out/before-md5.txt, final-md5-start.txt, final-md5-end.txt, final2-md5-bridges.txt)

## Shared changes needed

- sheet.js, CROSSINGS.bridge. The deck's half-width is b = L.cross * 0.8: 4.4 on the wide sheet, 3.7 on the compact. A hand's lane plus half its stroke reaches L.lane + 1.3: 5.5 and 4.9. So on any road that carries a hand, the arrows run over both parapets, and the bridge reads as a gap in the stream [measured in renders: page-p5-bridges/out/pics-zoom-before/zoom-wide-revealed-2-light.svg.png]. Change: b = L.lane + 2.4 (6.6 wide, 6.0 compact), with a = L.cross * 1.45 kept, so that both lanes run on the deck between the parapets. Only the Bridges draws 'bridge', so no other place's drawing and none of the valley's fingerprints can move [argued].
- Optional, sheet.js AYSheet.check. PAGE-MAP 2.4's rule 3 (no note or name box outside the frame or on a holding, at every drawn size including the 320px enlargement) is not checked anywhere today. page-p5-bridges/check/note-room.js does it by text-box estimates and could become a check() rule.
- Optional, TUNE section 7's daily count beside the day total (at how many bridges you crossed, they crossed, both waited, the wheels locked). It is still not built (LEAD 3.8 does not list it). It would be a new feature group in words.js, app.js and page-smoke.js.

## Open issues

- Room was not measured in a real browser: this stage was told not to use it. A proportional width model argues that the changed Opening premise and line 2 never wrap to more lines than stage 4's at any column from 12 to 40 em (out/final-wrap.txt). The day's card lines are no longer than before. The Afterwards key item for income grew by 7 characters. LEAD 3.10's 1280x800 / 1366x700 / 1440x960 / 400x800 light-and-dark walk of a whole Bridges Life is still to do [argued].
- The map note now reads 'the stream', under the stream's west reach. Stage 4's 'the bridges' crossed the NE and NW roads and the hands at the valley's spot, and the compact sheet has no clear room for it between the middle bridges. If the lead wants the bridges lettered, every clear spot on the compact sheet is at least 35 px from a bridge.
- On the compact sheet enlarged for a 320px phone, a 6- or 7-letter name in the east seat (Garrow, Yarrow, Dunmore) can still run over the stream near the east bridge; a 5-letter name clears it by 3.1 px. This is a limit of the shared layout [measured by estimate].
- For the other polishers (the valley must not move): by the same estimate, at the 320px enlargement the north mark touches the barrier in the valley (-1.2 px), the Banks (-3.5) and the Watch (-3.5). It is clear in the Saltmarket (6.4) and now in the Bridges (3.3) [measured by estimate, out/final-sheet-room.txt].
- The bridge deck is narrower than the hands' lanes (see sharedChangesNeeded). Until that is changed, the bridges read clearly only on roads without a hand: the Opening sheet apart from the demo road, the Afterwards, and roads where you drove on.
- The two luck lines on the card ('Yesterday your mule would not stand…', 105 and 110 characters) were not lengthened to add 'and you crossed' or 'the wheels locked'. The laptop day's height is unmeasured for this place.
- The .seal-arch class in index.html is no longer used by any place: the Bridges' seal now uses seal-parcel, seal-deck and seal-water. It is harmless, and the owner of the shared code can remove it.
- The full page-smoke run and golden-words.js ran on the Watch and Saltmarket files as they stood mid-stage. Their hashes will move again as those polishers finish.

## Files changed

- after-you/places/bridges.js
- `<scratch>/places/page-p5-bridges/check/` (new: stream-words.js, a copy of page-p2's; shapes.py, sheet-svgs.js, render-sheets.py, zoom.py, geo-probe.js, note-room.js, wrap.py, wrap-pairs.json, run-dom.sh, run-final.sh)
- `<scratch>/places/page-p5-bridges/out/` (final-*.txt, final2-*.txt, try0/try1-*.txt, svgs-*.txt, pics-*/)
- `<scratch>/places/page-p5-bridges/before/bridges.js` (the stage-4 copy)
