> **Record of its time.** Written 2026-11-25 22:06 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Stage report: place:saltmarket

(Written by the lead from the stage's structured result: the subagent harness refused report files.)

Status: done

## Fingerprints

Valley sentences: fnv1a32 6d84219b over 382,559 sentences (11,556,895 characters), identical line for line to stage 2. Valley-only page (page-p1 golden-page-p1.js): page abf3fee6, maps 7a78d3e9. Valley page walk with five places (page-p2 stream-page.js): page c8f9bb5d, maps 7a78d3e9, identical to stage 4 in all 168 steps. All five places (page-map golden-words.js, unmodified): 5b3a9f2b over 2,359,003 sentences and 74,679,932 characters. It changes by design: the Saltmarket words are new, and watch.js and bridges.js were edited by other agents during this stage. Saltmarket alone (stream-words -- saltmarket): 8dfce569 over 486,688 sentences; it was 122c4d42. page-map golden-page.js still cannot load the page (exit 3), as in stages 2 to 4. Harness: 12 gate lines identical to harness-mine.txt.

valleyIdentical: True

## Summary (the full report)

STAGE 5, the Saltmarket polished: DONE. Every check passes. Only places/saltmarket.js changed. Labels: [m] means measured (outputs in page-p5-saltmarket/out); [a] means argued.

## 1. Words: what changed, and why
I read every one of the 486,688 sentences that page-smoke produces, as 1,372 distinct shapes [m: out/base-shapes.txt, out/final-shapes-saltmarket.txt].

**False or loose sentences, fixed:**
1. **Town line.** "The town paid nothing extra today." was false whenever your sister's pairs held, because the town pays there too and Elsewhere today shows it.
   - Now: "The town paid nothing extra beside you today."
   - And: "Where both prices held beside you, the town paid {extra} coins more today."
   - W.dayTown counts only your four ties.
2. **What you see of another stall is its price, not its choice.** The engine counts arrivals there.
   - Before today: "...you had seen their price hold here 3 of 3 times." (was "knew them to hold the price")
   - What you know of them: "price held 3 of 4" (was "held the price 3 of 4")
   - Afterwards resting map: "price held 13 of 16 times"
   - Afterwards key: "filled by how often the stall's price held"
   - Your ways, Leaving and the heir still count what you chose: "held the price 4 of 4".
3. **Your own cut is your choice.**
   - Card: "Their price held. Yours was cut." is now "You cut the price. Theirs held." Yesterday's line changed the same way.
   - The old "Yours was cut" could be misread as your boy's slip.
   - Every card now starts with what you did, which you know, then says what you saw of theirs.
4. **Strip and rule.** They counted "both stalls held the price"; they now say "both prices held", because the flow counts arrivals. Inequality checked: broke = late < HOLD_LINE.
   - Rule: "The ring breaks if, over the last ten seasons, both prices held on fewer than half of the days two stalls sold side by side."
   - Head: "Both prices held across the market, season by season". "holding" is a valley word, and the check caught it.
   - Strip in words: "The town's best five seasons in a row: {stretch} in 100 on average."
   - Chronicle: "The ring counts as broken in a future if, over its last ten seasons, ..."
5. **Luck in the futures.** "Each has its own stall boys" (as if they were different boys) is now "Each has its own luck at the stalls and its own chances taken"; the rows caption and the futures explanation say the same.
6. **Clumsy or repetitive lines.**
   - Why? deed: "...beside the Corra stall, beside a new stall." is now "...beside the Corra stall, when it was new to you."
   - Elsewhere where: "After the price of the Pell stall was cut" is now "After the Pell stall's price was cut".
   - The sister's Why?: "Even so, their price was cut today" was ambiguous next to the other stall's name. It is now "Even so, your sister's price was cut today."
7. **Tense.** Last-day line and mattered: "Had you held the price..., the ring would have broken in N of the first 1000 futures" (was "the ring broke in").
8. **Other phrasing.**
   - Gloss: "...then do as each stall did yesterday, would bring in {purse} coins in twelve days". "this year" was wrong: the custom's purse is the twelve days.
   - Luck note: "A stall boy can sell below the price. Your price then counts as cut, costing nothing and bringing nothing. The other stall sees only a cut price."
   - Leaving head: "The salt is sold".
   - Again button: "Mind this stall again". "Keep" clashed with "your stall is kept".
9. **Afterword** (rewritten; the old "That is why" did not follow): "Sellers who agree not to undercut one another keep that agreement the way good neighbours keep trust: each matches the others day after day, lets a single slip pass and goes back to the price. The same habits that hold a village together hold a price ring together, and the buyers pay for it. That is why most countries forbid such agreements by law."

**Kept as they were:**
- The five titles: Beside a new stall / After both prices held / After their price was cut / After your price was cut / After both prices were cut. They are neutral and short; TUNE's "After they cut and you held" claims a choice.
- The custom: "The guild's rule", exactly [1,1,0,1,0].
- The Opening, word for word, so its measured 800 px room is untouched.
- The luck words, per LEAD: "Your boy sold below the price. They saw only a cut price."
- The seal: "Stall kept, town clearly better off."
- No theory word, no luck-or-choice claim: page-smoke passes [m].

## 2. Sheet
1. **"the lane" moved.** It was lettered across ties 0-2 and 0-6 and over the hands (0.0 px). It is now under the lane's west arm (x 0.16, y 0.95), at least 47 px from any tie [m].
2. **The lane reshaped.**
   - Its east end rises to 0.76, so it no longer runs under the north mark. Before, 'N' overlapped it by 5 px on the compact and phone320 sheets; now it is clear by 13.8 / 5.6 px.
   - Its shoulders are lower (0.83), clearing the east and west names. The worst 7-letter name at phone320 went from -4.1 to -1.7 px, by a generous box estimate [m].
3. **Result glyph.** The lane lines moved to x 28 and 33. The lost-act cross now meets the near edge, as the valley's meets its river.
4. **Seal.** It is now a hanging balance (hook, beam, two pans on cords) clear above the check. The old standing post ran through the check.
5. **Rules.** AYSheet.check passes [] on both sizes. Lettering is at least 11.14 px in every stand-in DOM run. Nothing is outside the frame, and no note sits on a holding [m].

## 3. Sample Life
Seed 10, the honest seller "never put the price back"; sealed [m: out/sample-life.txt]. All sentences come through AYWords.

**Opening**
- Twelve days at a salt market of eight stalls. Then you leave, and the market goes on without you.
- Beside each of your four neighbours you sell the same salt. Each day you can hold the guild price or cut it. So can they.
- To hold the price costs you 1 coin of trade; while theirs holds, you gain 3. When both prices hold, each stall gains 4, and the town pays 2 of it.
- What you do, others see. Some will take it up as their own way, at the end of every fourth day.
- At the end two things are counted: whether your takings last the winter, and whether the town is better off for your ways.
- The sheet's hand: −1 at your end, +3 at theirs.

**Day 1**
- Takings: 0 of 127 coins. The guild's rule, to hold the price beside a new stall and then do as each stall did yesterday, would bring in 122 coins in twelve days.
- Cards:
  - The Corra stall: You held the price. Theirs was cut. −1
  - Your sister's stall: Both prices held, and the town paid for it. +4
- Total: "Today: +6. Takings: 6 of 127 coins. Where both prices held beside you, the town paid 8 coins more today."
- Why? (the Corra stall): "Beside you for the first time | This is the Corra way. They did not learn it from you. You had not seen them here before."
- Elsewhere today: "Your sister's stall and the Quill stall: both prices held."

**Day 2**
- "Yesterday you held the price. Theirs was cut. Counts in your ways under: After their price was cut" -> Cut the price.
- The Corra stall: You cut the price. Theirs held. +3
- The Pell stall: You cut the price. Theirs was cut too. 0
- Total: "Today: +11. Takings: 17 of 127 coins. Where both prices held beside you, the town paid 8 coins more today."

**Day 3**
- What you know of them (the Corra stall): "beside a new stall: price held 0 of 4; ... after their own price was cut: price held 3 of 3".
- Elsewhere's Why?: "Your sister's stall, toward the Quill stall | After both prices held | This is the Ansel way. They did not learn it from you. Before today you had seen their price hold here 3 of 3 times."

**Your boy's slip** (seed 11, day 5)
- "The Rusk stall: Your boy sold below the price. They saw only a cut price. Theirs held. +3"
- Next morning: "Yesterday your boy sold below the price. They saw only a cut price. Theirs held. Counts in your ways under: After your price was cut"

**The end of the first season**
- At each season's end, stalls look at who is doing well and may take up their ways. Your sister's stall follows your ways in 5 of 5 situations.
- After your price was cut: now cuts the price, as you did the one time it came up.
- After both prices were cut: now holds the price 1 of 3 times, as you did.
- The Quill stall looked to your stall and kept its own way.

**Leaving**
- The salt is sold. Takings: 140 of 127 coins. Your stall is kept.
- After your price was cut: held the price 0 of 4.

**Afterwards**
- Thirty seasons without you. This is one future of 2000. Each has its own luck at the stalls and its own chances taken.
- Strip in words: "Days on which both prices held, season by season. Season 1: 73 in 100. The ring was weakest, and the town best off, in season 6: 41 in 100. The town's best five seasons in a row: 43 in 100 on average. Last ten seasons: 81 in 100 on average. The ring breaks below half."
- "Season 9: newcomers, the Wren stall, take over your sister's stall. Her line ends there."
- "In this future the ring held. No stall keeps your ways after season 25."
- Resting map: "Your heir: 58 coins in the last season, price held 13 of 16 times."

**The Chronicle**
- Stall: Kept: 140 of 127 coins.
- Town: With you, the ring broke in 1346 of 2000 futures. Had your stall kept the guild's rule: 796 of 2000.
- Your mark: +28. The mark is the gap between the two counts: 550 more futures in which the ring broke with you, about 28 in every hundred.
- Where that sits: Of thirteen plain ways a stall might have left here, the best breaks the ring in 65% of the first 1000 futures and the worst in 28%. ...
- SEAL: Stall kept, town clearly better off.
- The way that mattered most: After your price was cut: you held the price 0 of 4 times. Had you held the price there once more: the ring would have broken in 561 of the first 1000 futures. As you left it: 660.
- Market 10: kept, 140 of 127. Mark +28. Seal. [Live another life] [Mind this stall again] [Choose another place]

**Last day** (seed 15, the selfish act)
- "On the last day you held the price beside the Yarrow stall. Had you cut the price beside the Yarrow stall, the ring would have broken in 764 of the first 1000 futures, against 614 of those as you left it. Your takings would have been 125 of 125 coins."

## 4. Room
- No browser was used, as this stage asks. The Opening's text is unchanged.
- On the laptop day the changed strings were compared in a stand-in font [m: out/room-pairs-13px.txt]. By estimate, each keeps its line count [a]:
  - the town line: the status stays 2 lines, its second line about 404 of about 465 px;
  - the gloss and the luck note stay 2 lines in their 65ch boxes;
  - the card texts are shorter.
- The Afterwards' "one future" line is within 1% of the valley's width.

## Checks

- **page-smoke.js -- saltmarket (final)**: PASS in 41.3 s. 486,688 sentences; 7,296 card numbers checked against the stakes of their outcome; town lines: 1,647 with an extra cost, 177 with none; 45 last-day lines (habit replay); 8 seals; 110 of 114 AYWords functions (the 4 stock functions are not asked for here). MEASURED (cd game && jsc page-smoke.js -- saltmarket -> page-p5-saltmarket/out/final-page-smoke-saltmarket.txt (first try FAILED on 'holding', a valley word, in flow.head; fixed: out/try1-page-smoke.txt))
- **Every saltmarket sentence read, as distinct shapes**: 486,688 sentences reduced to 1,372 shape lines (digits -> #, names -> NAME), read before and after. The changed shapes are listed in the summary. Stream fnv1a32 went from 122c4d42 to 8dfce569, same sentence count. MEASURED (page-p2/check/stream-words.js -- saltmarket -> out/base-stream.txt, out/final-stream-saltmarket.txt; check/distinct.py -> out/base-shapes.txt, out/final-shapes-saltmarket.txt)
- **Stand-in DOM: Saltmarket through whole Lives on the four screens, plus 'never'**: All 5 OK, each to the Chronicle and on to a second Life. laptop seed 10 'salt' (1,058 checks); tablet seed 15 'salt' with 6 lives (1,109); phone seed 48213 'old' with 4 lives (1,074); phone320 seed 7 'send', watched by the clock (1,070); laptop seed 3 'never' (1,058). Each run: 12 town lines and 30 strip columns on the charter's side. Smallest lettering is 11.14 px (phone, phone320). MEASURED (page-p5-saltmarket/check/run-dom.sh (runs page-p4/check/dom-run-p4.js unchanged) -> out/final-dom.txt)
- **Stand-in DOM: the six valley configurations**: All 6 OK, 1,053 to 1,130 checks each. The unadapted `<scratch>/dom-run.js` still cannot load the page (exit 3), as in stages 2 to 4: it loads no places/ files. MEASURED (out/final-dom.txt; out/final-dom-run-original.txt)
- **Stand-in DOM: chooser, hash, stored lives, reload**: All 6 PASS: two 17, hash-two 8, choose 232, hash 16, restore 21, store 12. MEASURED (page-p4/check/run-dom-places.sh -> out/final-dom-places.txt)
- **Valley sentences against stage 2**: IDENTICAL, line for line: 382,559 sentences, fnv1a32 6d84219b, 11,556,895 characters. MEASURED (page-p2/check/stream-words.js -- valley -> out/final-words-stream-valley.txt; page-p3/check/same-sentences.py -> out/final-same-valley-sentences.txt)
- **Valley-only page (page-p1/golden-page-p1.js)**: page abf3fee6, maps 7a78d3e9, equal to stages 2 to 4. MEASURED (out/final-golden-page-p1.txt)
- **Valley page walk with five places, against stage 4**: page c8f9bb5d, maps 7a78d3e9. Same maps and same markup in all 168 of 168 steps; 0 distinct changes. MEASURED (page-p2/check/stream-page.js -> out/final-page-stream.txt; diff-page-stream.py against page-p4/out/final-page-stream.txt -> out/final-diff-page.txt)
- **page-map/golden-words.js (unmodified, all five places)**: exit 0; PAGE SMOKE PASS inside; fnv1a32 5b3a9f2b over 2,359,003 sentences (74,679,932 characters); 217.4 s. The hash differs from stage 4's e034e97c by design: the Saltmarket words changed, and so did watch.js and bridges.js, which other agents edited during this stage. No place file changed during the run (md5 before = after). MEASURED (out/final-golden-words-pagemap.txt, out/final-golden-words-md5-before.txt, out/final-golden-words-md5-after.txt)
- **page-map/golden-page.js (unmodified)**: Still cannot load the page (no places/ or sheet.js), exit 3, as in stages 2 to 4. MEASURED (out/final-golden-page-pagemap.txt)
- **harness.js**: Its 12 gate lines are identical to harness-mine.txt (empty diff). Verdict mean 1.051 s, PASS; finished in 144.9 s. engine.js (2fa86b59) and harness.js (cae4bd3f) unchanged from start to end. MEASURED (jsc harness.js -> out/final-harness.txt; out/gates-ref.txt vs out/final-gates.txt -> out/final-gates-diff.txt (0 bytes); out/final-md5-engine-harness-*.txt)
- **Sheet rules (AYSheet.check), all five places**: Every place [], the Saltmarket included. On both sizes the lane meets each of your four ties once, and the arcade stays in its band and below the phone crop. MEASURED (page-p4/check/sheet-probe.js -> out/final-sheet-probe.txt)
- **Saltmarket sheet: PAGE-MAP 2.4 rule 3 and clearances (estimate)**: SHEET OK at wide, compact and phone320 (lettering x1.27). Every note is inside the frame and off every holding. 'the lane' note: 16.2 / 6.1 / 2.9 px from the lane band, and at least 47 px from any tie; before, 0.0 px from ties 0-2 and 0-6. North mark: 42.8 / 13.8 / 5.6 px from the lane; before, it overlapped by 4.9 to 5.0 px on the compact and phone320 sheets. Worst east/west name under the lane, by a generous box estimate for a 7-letter name: -1.7 px (before -4.1 to -5.0). MEASURED (estimate boxes, not a browser) (check/sheet-check.js -> out/final-sheet-check.txt, out/sheet-check-before.txt; check/lane-sweep.js -> out/final-lane-sweep.txt)
- **Drawings looked at (rendered locally by Quick Look, not the browser)**: Looked at: Opening wide; day compact (laptop) and wide (tablet, dark); phone choosing; phone320 dark; Afterwards; seal light and dark; result glyphs. The stage-4 drawings had 'the lane' lettered across two ties and the hands, and 'N' sitting on the lane. Both are fixed. The first seal redesign read as a face once a salt heap was added; the heap was removed. MEASURED (renders) (check/dump-maps.js, check/glyphs.js, check/build-render.py, qlmanage -t -> out/screens/final-*.png (stage-4 renders in render/base-*.png))
- **Room on the laptop day (changed strings)**: Not checked in a browser (this stage forbids it). Widths were compared in a stand-in font (Avenir Next; Barlow is not installed): the gloss grows +4.4 px (it wraps in a <=65ch box); the luck note grows +27 px of 798; the card texts 'You cut the price. Theirs held.' and 'price held h of n' are shorter. The town line grows +69 px at 15 px; by estimate its second status line stays about 404 of about 465 px, so the status stays 2 lines. The Opening's text is unchanged. MEASURED widths, ARGUED line counts (check/measure.js (osascript JXA, AppKit) -> out/room-pairs-13px.txt; status estimate from index.html CSS)
- **Shared files untouched**: index.html, engine.js, words.js, sheet.js, app.js, page-smoke.js, harness.js and places/valley.js have the same md5 as at the start; only places/saltmarket.js changed (diff of 176 lines). No git command was run. MEASURED (out/before-md5.txt, out/final-md5.txt, out/final-saltmarket.diff)
- **Size**: The page files total 459,726 bytes; saltmarket.js is 20,464 (it was 19,223). MEASURED (out/final-sizes.txt)

## Shared changes needed

- LEAD 4.2 (not built in shared code; the Saltmarket is the place it matters most, since it uses REPLAY 'season'): a seal withheld by the season replay (seal.wonOnSeason) should get one plain Chronicle line. That needs a lexicon key the valley lacks, so words.js, app.js and page-smoke.js must add it as a feature group (present exactly where REPLAY is 'season'). Proposed Saltmarket words: "The town's gain rests on what your stall did in the last season, beyond the ways it had kept before, and no stall had yet sold beside those."
- Optional, shared sheet.js labelAt: the names lettered under the east and west holdings sit just above every place's barrier. With a narrow phone's enlarged lettering (x1.27), a 7-letter name such as DUNMORE comes within about 2 px of the Saltmarket lane, by estimate, and the valley's river is the same. Lifting the names of houses 1 and 7 by a few px when the lettering is enlarged would clear them in every place. The halo keeps them legible today.

## Open issues

- Room was not checked in a real browser, because this stage forbids it. Please check the Saltmarket at 1280x800 with lives listed, in a browser: (1) the day's status line with the longer town sentence 'Where both prices held beside you, the town paid N coins more today.' (2 lines by estimate); (2) the luck note; (3) a card's Why? back with 'when it was new to you'; (4) the Afterwards' 'one future' line. LEAD 3.10's 1366x700 and 1440x960 sizes are still unmeasured too.
- The drawings were looked at in local Quick Look renders of the stand-in DOM's SVG with the page's style sheet (out/screens/), not in the browser. The Afterwards renders show no names, because the stand-in DOM does not carry text set into SVG text nodes; names use the same placement as on the day map.
- The words of 'mattered.none' ('the luck of the stall boys') and of the futures ('luck at the stalls') name the same luck in two phrasings. Both are true; I kept the shorter one where room is tight.
- page-map/golden-words.js now hashes 5b3a9f2b. That includes the other polishers' watch.js and bridges.js as they stood mid-stage, so it is not a final fingerprint for the stage.
- Seal device: a hanging balance, clear of the check. A salt heap under the check was tried and removed, because the composition read as a face.

## Files changed

- after-you/places/saltmarket.js
