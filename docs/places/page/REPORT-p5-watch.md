> **Record of its time.** Written 2026-11-25 22:04 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Stage report: place:watch

(Written by the lead from the stage's structured result: the subagent harness refused report files.)

Status: done

## Fingerprints

Watch sentences (stream-words.js -- watch, in the shadow folder): fnv1a32 2dbc0911 over 481,969 sentences. Stage 4 was 495a4a0d with the same count. Valley sentences: 6d84219b over 382,559, identical to stages 2-4. Valley-only page: abf3fee6, maps 7a78d3e9, unchanged. page-map golden-words.js in the game folder (five places, including the other polishers' in-progress files): 5b3a9f2b over 2,359,003 sentences, PASS. golden-page.js: exit 3, as before. Harness: 12 gate lines identical.

valleyIdentical: True

## Summary (the full report)

STAGE 5, the Watch, is done. Every check passes. I changed only places/watch.js (18,339 to 20,358 bytes). No git command was run, and no shared file was edited.

Labels: [m] means measured, with the output in page-p5-watch/out/; [a] means argued.

## 1. What changed in watch.js, and why

**The custom's gloss**
- It said the custom "would bring in N sacks this season". Both parts were wrong:
  - the purse covers all twelve days, which is three seasons;
  - the purse is below zero in 25% of Lives [m]. It read "would bring in −41 sacks" [m: try0 stream].
- It also said "let a single fire pass", which can be read as "once". The custom lets every fire on their tower pass.
- Now: "The border custom, to keep watch unless either tower stood down the day before, would leave your stores at N sacks by winter." This is exactly [0,1,1,1,0]. Played as written it matches the engine's custom purse in 1000 of 1000 Lives [m].

**Luck**
- The luck note was "...for good and ill..." (159 characters). Now: "Your watchman can light a fire at a shadow: your tower then keeps watch that day. Each tower sees the other's fire, never why it burns." The actor knows; the other side sees only a fire; whether a fire was luck or choice is never said.
- The two lost reveals are shortened to 76 and 88 characters (they were 107 and 118, about 3 lines in a card) [a: widths.py estimate]:
  - "Your watchman lit a fire at a shadow. They saw only a fire. They stood down." / "...A fire burned on theirs too."
  - The number is accounted for by the note (your tower kept watch) and the Opening's stakes.

**Elsewhere, and the sister's Why? card**
- Elsewhere now reads "Your sister's tower stood down toward the Pell tower, where a fire burned." It no longer says only "stood down" with no direction.
- whereThird[3] was "After a fire on theirs, with X standing down", which is ambiguous. It is now "After a fire on her own tower".

**Strip and rule**
- Head: "Towers standing down together, season by season".
- Rule and row rule: "...neighbouring towers stood down together on at least 3 in 10 of the days." It was "...of the days two towers faced each other." The {line} slot is kept.

**Smaller fixes**
- Afterwards key: "sacks gained or lost this season". Incomes can be negative: 337 lines [m].
- Day key: "your fire lit at a shadow".
- "Your heir follows the border custom here and keeps watch" replaces the doubled "keeps".
- "Live this border again" replaces "Keep this watch again", which echoed the "Keep watch" button.
- Afterword: two sentences, no theory words, a generic real-world parallel. "Neighbouring countries that arm because each fears the other can stay armed long after both want peace, and one false alarm can undo years of quiet. Such standoffs have ended when one side stood down first, in steps the other could see, and kept on after an alarm instead of answering it."

**Left alone (true and measured for room in stage 4)**
- The Opening premise and its four lines.
- The five titles: Meeting a new tower; After you both stood down; After a fire on their tower; After a fire on yours; After fires on both towers.
- The custom's name "The border custom", the charter words and the seal "Tower kept, border better off."

## 2. Sheet
- **"the border" note.** It sat between ties 0-2 and 0-6 and overlapped them in every mode. It now sits at (0.16, 0.89), under the west wing of the line, 25 px clear of everything else [m]. The spot was searched over a grid (note-spot.js).
- **Border line.** The inner wings were lowered slightly (0.255/0.80, 0.36/0.70 and the mirror points). The Afterwards names of the east and west towers now clear the band on the compact sheet. The crossings moved to 417.8/182.2 (the valley's are 418.2/181.5). check() passes [m].
- **Seal.** The tower (three merlons, a slit, a door) now stands left of the check mark, with 4 px between. Before, the check was drawn across the tower.
- **Lettering** is at least 11 px [m: DOM, 11.14-11.62]. All classes are token classes that already exist.

## 3. Sample Life: seed 3, the honest way of playing [m: out/final-sample-life-watch-3.txt]

**Opening**
- "Twelve days on a border of eight watchtowers. Then you leave, and the border goes on without you."
- "Between you and each of your four neighbours runs the border. Each day you can stand down or keep watch. So can they."
- "If both towers stand down, each gains 7 sacks. Standing down alone loses you 5; keeping watch while they stand down gains 6. If both keep watch, each pays its watchmen 3."
- "What you do, others see. Some will take it up as their own way, at the end of every fourth day."
- "At the end two things are counted: whether your stores last the winter, and whether the border is more at peace or less for the ways you left."

**Day 1**
- "Winter stores: 0 of 146 sacks. The border custom, to keep watch unless either tower stood down the day before, would leave your stores at 46 sacks by winter."
- Quill: "Both towers stood down. +7"
- Wren: "You stood down alone. A fire burned on their tower. −5"
- "Today: −8. Winter stores: −8 of 146 sacks."
- Elsewhere: "Your sister's tower and the Rusk tower: fires burned on both."

**Day 2**
- Wren's card: "Yesterday you stood down. A fire burned on their tower. Counts in your ways under: After a fire on their tower."
- Reveal: "Your watchman lit a fire at a shadow. They saw only a fire. A fire burned on theirs too. −3"
- "Today: +18. Winter stores: 10 of 146 sacks."

**Day 4**
- Wren: "You kept watch. A fire burned on their tower too, and both paid their watchmen. −3"

**The end of the first season**
- "At each season's end, towers look at who is doing well and may take up their ways. Your sister's tower follows your ways in 4 of 5 situations. Meeting a new tower: now stands down, as you did 4 of 4 times. After fires on both towers: now stands down 1 of 2 times, as you did."

**Leaving**
- "Your watch is over. Winter stores: 164 of 146 sacks. Your tower is kept."

**Afterwards**
- "Thirty seasons without you. This is one future of 2000. Each has its own shadows and its own chances taken."
- Strip "Towers standing down together, season by season" (line 3 in 10): "The border is at peace if, over the last ten seasons, neighbouring towers stood down together on at least 3 in 10 of the days."
- "Season 3: your heir gives up your ways for the Rusk way. … Season 12: newcomers, the Garrow tower, take over the Quill tower. … In this future the border was at peace. At the end, 4 towers keep your ways."

**Chronicle**
- "Kept: 164 of 146 sacks."
- "With you, the border was at peace in 1023 of 2000 futures. Had your tower kept the border custom: 754 of 2000."
- "Your mark: +13. The mark is the gap between the two counts: 269 more futures at peace with you, about 13 in every hundred."
- "Of thirteen plain ways a tower might have left here, the best keeps the peace in 50% of the first 1000 futures and the worst in 8%."
- Seal: "Tower kept, border better off."
- "After a fire on yours: you stood down 2 of 2 times. Had you kept watch there once more: at peace in 361 of the first 1000 futures. As you left it: 488."
- The selfish act on the same seed: "On the last day you kept watch on the Rusk tower. Had you stood down toward the Rusk tower, the border was at peace in 488 of the first 1000 futures, against 275 of those as you left it. Your stores would have been 164 of 146 sacks." The seal is withheld silently.
- A Life that never stands down: "Winter stores: −18 of 146 sacks. Your tower is 164 sacks short."

## 4. Room [a]
Not measured in a browser (forbidden this stage). Every text that shares the day's room is no longer than the measured valley or Banks equivalent:
- gloss: 128 characters at most;
- luck note: 135, against the Banks' 158;
- lost reveals: 88 at most, against the valley's 89;
- elsewhere: 73 at most, against the Banks' 80;
- titles: estimated at most 145 px, against the valley's 152.

The Opening is unchanged.

## Checks

- **page-smoke.js -- watch, in the game folder as it stands**: PASS in 45.8 s. MEASURED (cd game && jsc page-smoke.js -- watch -> out/final-page-smoke-watch-game.txt)
- **page-smoke.js -- watch and -- valley, in the shadow folder (shared files + valley, banks, watch; no bridges or saltmarket)**: watch PASS 45.7 s; valley PASS 28.1 s. MEASURED (check/shadow.sh, then jsc page-smoke.js -> out/final-page-smoke-{watch,valley}-shadow.txt)
- **Every Watch sentence page-smoke makes, dumped and read**: 481,969 sentences, 151 Lives, fnv1a32 2dbc0911 (stage 4: 495a4a0d, the same count). 459 distinct shapes, all read. The diff against stage 4 is exactly the intended edits. No sentence uses another place's words. MEASURED (check/stream-words.js -- watch (shadow) -> out/final-stream-watch.txt; check/shapes.py -> out/final-shapes-watch.txt; stage 4: out/try0-shapes.txt)
- **Valley sentences unchanged**: fnv1a32 6d84219b over 382,559 sentences and 11,556,895 characters: identical to stages 2-4. MEASURED (check/stream-words.js -- valley (shadow) -> out/final-stream-valley.txt)
- **Valley-only page (page-p1/golden-page-p1.js)**: page abf3fee6, maps 7a78d3e9: equal to stages 2-4. MEASURED (out/final-golden-page-p1.txt)
- **page-map/golden-words.js, unmodified, game folder (all five places)**: PAGE SMOKE PASS. 2,359,003 sentences (the same count as stage 4), fnv1a32 5b3a9f2b. The hash moved from e034e97c because of the Watch's words and the other polishers' bridges and saltmarket files. MEASURED (out/final-golden-words-pagemap.txt)
- **page-map/golden-page.js, unmodified**: exit 3 ('no place valley is registered'): it cannot load the place files, as in stages 2-4. MEASURED (out/final-golden-page-pagemap.txt)
- **harness.js**: 12 gate lines identical to harness-mine.txt (empty diff). 143.7 s, verdict mean 1.043 s, PASS. MEASURED (out/final-harness.txt, out/final-gates-diff.txt)
- **Stand-in DOM, the Watch through whole Lives on four screens**: All 4 OK, exit 0: laptop seed 3 honest (1055 checks), tablet seed 11 'never' with 6 stored lives (1166 checks, 25 meters below zero), phone seed 9 custom with 5 lives (1090), phone320 seed 2024 'short' watched by the clock (1075). Lettering on day 1 is 11.14-11.62 px. MEASURED (page-p4/check/dom-run-p4.js in the game folder -> out/final-dom-watch.txt)
- **The custom's gloss is exactly the preset's custom**: Played as written ('keep watch unless either tower stood down the day before'), it ends with the engine's custom purse in 1000 of 1000 Lives (seeds 900001-901000). The custom's purse runs from -81 to 126 and is below zero in 252 of 1000. MEASURED (check/verify-gloss.js -> out/final-verify-gloss.txt)
- **Sheet rules (AYSheet.check) and lettering clearances, 6 modes x 2 sizes**: check []. No note is outside the frame, on a holding, a post, the band, a tie or the far line (0 flags; stage 4 had 'the border' over ties 0-2/0-6 in every mode). 'the border' is 25 px clear of everything else and 3-11 px from the band. For comparison, the valley's 'the ford' is flagged on ties 6 times and the Banks' notes 13 times. MEASURED (text widths are estimates) (check/sheet-room.js -> out/final-sheet-room-{watch,valley,banks}.txt; check/note-spot.js -> out/try3-note-spot.txt)
- **Sheet drawn, looked at (Quick Look renders, not the browser)**: Wide and compact, light and dark: sheet, day, cropped day, Afterwards, plus the glyph, key and seal. They show the border band and dash-dot line, the posts, the hills and towers, and the note under the west wing. The seal's tower now stands left of the check. MEASURED (renders) (check/render-svgs.js + check/render.py -> out/render/try3/*.png)
- **Files touched**: Only places/watch.js changed. The md5 of engine, words, app, sheet, index, page-smoke, harness, valley, banks and preview are equal to the start. bridges.js and saltmarket.js were changed by the other polishers. MEASURED (out/before-md5.txt, out/final-md5.txt)

## Shared changes needed

- None are required. watch.js uses only existing keys, draw kinds and classes.
- When LEAD 4.2's withheld-seal line (seal.wonOnSeason) is built in words.js, app.js and page-smoke.js, the Watch needs its lexicon key. Proposed words: 'The border's gain rests on what your tower did in the last season beyond the ways it had before, which no tower had yet lived with.' It cannot be added now: page-smoke rejects a key the valley lacks.
- Optional, sheet.js 'tower' body: in the Afterwards the income number (af-num at c[0]+hb/2+1.5) is lettered over the tower. The halo keeps it legible, but it looks busy (out/render/try3/wide-after.svg.png). Drawing the tower further right (l = x+0.62w, r = x+0.86w) would clear it. This is the same kind of thing as the Banks' number over the sail.

## Open issues

- Not checked in a real browser (this stage forbade it). LEAD 3.10 asks for 1280x800, 1366x700, 1440x960 and 400x800, light and dark, through a whole Watch Life. The texts were only shortened or kept within the measured valley and Banks lengths [a].
- REPORT.md was not written (my instructions forbid report files). This summary is the report.
- The Watch's sentence and page checks ran in a shadow folder without bridges.js and saltmarket.js, because a saltmarket edit in progress briefly failed page-smoke's up-front leak check. The final run of page-smoke -- watch, and of golden-words over all five places, then passed in the game folder itself.
- The 5b3a9f2b five-place hash includes the other polishers' bridges and saltmarket files as they stood at about 22:00. It is a snapshot, not a reference.
- preview.html was not regenerated (it is not my file). It still holds the stage-4 watch.js.
- If the Watch takes REPLAY 'season' (LEAD 4.1), the words stay true: the last-day line already reads lived and replayed. PLACE_SEAL_SEEDS {watch: [4]} in page-smoke may need re-finding then (shared).

## Files changed

- after-you/places/watch.js
- `<scratch>/places/page-p5-watch/` (check/: shadow.sh, run-final.sh, stream-words.js (copy of page-p2's), shapes.py, sheet-room.js, note-spot.js, render-svgs.js, render.py, widths.py, verify-gloss.js; out/: final-*.txt, try*.txt, render/; before/watch.js; draft/; shadow/)
