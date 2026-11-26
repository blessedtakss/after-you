> **Record of its time.** Written 2026-11-25 20:33 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Stage report: banks

(Written by the lead from the stage's structured result: the subagent harness refused report files.)

Status: done

## Fingerprints

Words, valley alone (page-p2 stream-words.js -- valley): fnv1a32 6d84219b over 382,559 sentences and 11,556,895 characters. This is identical, line for line, to stage 2's stream [m: final-same-valley-sentences.txt].

Words, both places (page-map/golden-words.js, unmodified): fnv1a32 6604b452 over 908,287 sentences and 30,116,824 characters. Stage 2's 382,559 sentences are a subsequence of it, and the 525,728 added sentences form one run of Banks Lives, at positions 382528..908255 [m: final-golden-words-pagemap.txt, final-diff-words-all.txt].

Page, valley walk (page-p2 stream-page.js): page f4d4e3ff, maps 7a78d3e9. Per size:
- phone: 096ef293 / a80b5f11
- laptop: ffdd4df4 / f3d5aeae
- tall: 9a9fc812 / f3d5aeae

All maps match stage 2 in all 168 steps. The markup has exactly 3 changes: the chooser is shown, it holds two options, and other-place is shown in the Chronicle [m: final-diff-page.txt].

Valley-only scripts (page-p1/golden-page-p1.js): page abf3fee6, maps 7a78d3e9, equal to stage 2 [m].

valleyIdentical: False

## Summary (the full report)

STAGE 3 (the Banks, end to end): DONE. Every check passes.

The valley's sentences are identical line for line to stage 2's, and its maps are identical. The only change in the valley's page is the one two places require: the choice of places is shown, and so is 'Choose another place'. No git command that changes anything was run. engine.js, harness.js and places/valley.js are untouched (md5 equal to stage 2's).

REPORT.md was not written: my agent instructions forbid report files, so this summary is the report. Labels: [m] means measured, with the output file in page-p3/out/; [a] means argued.

## 1. What was built

### places/banks.js (new, 310 lines, 19.6 KB)
One AYPlaces.add with every lexicon and charter key the valley has, in the Banks' words, plus a feature group lexicon.stock for the gauge words.
- **Acts.** 'Keep to your water' and 'Fish across'.
- **Actors.** 'the {name} boat' and "your sister's boat".
- **Goods.** basket(s). The store head is 'Winter catch'.
- **Custom.** 'The old rule of the cove'. Its gloss: 'The old rule of the cove, to keep off with a new boat and then do as they did yesterday, would bring in {purse} {goods} this season.'
- **Luck.** 'The tide can carry your nets into their water. Keeping off then costs nothing, brings nothing and fills nothing. Each boat sees only the nets in its own water.' The actor knows; the other side sees only nets. The day's sentences are neutral (section 3).
- **Charter.** The grounds held or failed; the key says 'held' and 'failed'.
- **Strip rule.** 'The grounds hold if, over the last ten seasons, the banks between boats average at least {line}; they began at {start}.' Here {line} comes from HOLD_LINE (7) and {start} from STOCK.start (6).
- **Seal.** 'Boat kept, grounds better off.'
- **Afterword.** TUNE section 8, tightened into three sentences.
- **Sheet.** A coast:
  - barrier 'race', a tide race: a water band with two wave lines;
  - far line 'shore', the headland, stippled on its land side;
  - crossing 'gauge', the bank dial;
  - body 'boat': water, hull, mast and sail, with the house square kept in the corner for the diamond and tent;
  - notes 'the banks', 'the headland' and 'beyond the headland';
  - glyphs: a wavy race, and a seal with a boat;
  - the 8 positions and 16 ties are kept;
  - three tie gauges are moved along their ties, clear of lettering: '1-3' 0.3, '5-7' 0.7, '3-5' 0.25.
- **writtenFor.** The valley's keys plus B 1 (the words say a day's water yields what the bank holds) and STOCK_MOVES 'either-fills'. page-smoke checks both against life.params.

### The gauge: shared code that reads the engine
- **sheet.js**
  - The draw kinds race, shore, gauge and boat.
  - gaugeSVG: a dial cut into STOCK.max wedges, filled clockwise from twelve o'clock up to the level, with spokes. It is read by form, not colour.
  - A gauge sheet draws its gauges over the hands.
  - In the Afterwards all 16 ties get a gauge with an id af-gauge-\<tie>; your four sit at the crossing, the others mid-tie.
  - The sister's ties get a gauge after the reveal (kinWith.stockAfter).
  - check() now also tests that every gauge is inside the frame and clear of holdings and of other gauges.
  - New exports: AYSheet.gauge (the card dial), gaugeD and gaugeSpot.
- **words.js**
  - New: bankNow(level, p), bankDay(before, after, p, them), banksAtEnd(levels, p) and legendGauge(p). Each throws where the place has no stock.
  - The day's result is 'fills to N', 'falls to N', 'stays full' or 'is spent'. The spoken sentences say 'fills to 9 and is full', 'falls to 1 and is spent' and 'is spent: it cannot fall further', so they are true at both ends.
  - mapAltDay takes an optional 4th argument, p, and then names the banks.
  - flowLabels, flowAlt and rowRule gain a {start} slot.
  - AYPlaces.add requires lexicon.stock exactly when writtenFor.STOCK.
- **app.js**
  - data-place is set on the root.
  - Each card's head carries a .bank between the names and the bearing: the dial, a caption ('holds 6', 'full at 9', 'spent at 1', then 'fills to 7' and so on) and a vh sentence.
  - The day, Leaving and Opening maps draw gauges from today().neighbours[i].stock, results[i].stockAfter and STOCK.start.
  - drawBanks30 sets the 16 gauges from runFuture().seasons[k].ties in tieList order.
  - The resting map in words ends with the banks at the end.
  - Elsewhere today says the sister's bank for a listener (vh).
  - The gauge goes into both map keys.
  - For the valley, every path is inert, which the fingerprints prove.

### index.html
- Three Banks token blocks (light, dark by media, dark by attribute) in the token section, setting field, field-wash, river, river-wash and madder.
- Classes for race, shore, boat, gauge and .bank. Only tokens are used.
- The chooser options are now as wide as their names, with the check's room always kept. Before this, 'The banks' wrapped onto two lines. [m]
- The places/banks.js script tag.

### page-smoke.js
- **Banks policies.** PLACE_POLICIES.banks: 'the peacemaker', played on every seed as required, and 'the peacemaker, fishing across where it pays on the last two days'. Both are adapted from fix-banks/policies.js.
- **Neutral pattern.** PLACE_RULES.banks.neutral forbids the day's sentences saying that the other boat fished across.
- **Banks word list.** SKINS.banks is confirmed, with mooring(s), headland, tides, grounds and shore added.
- **Feature group.** The stock group must be present exactly where the rules have a stock, and shaped alike in every such place.
- **writtenFor.** B and STOCK_MOVES are checked; an unknown writtenFor key throws.
- **Per Banks Life, tie by tie:**
  - the level the day was played on equals the card's;
  - the level moved by the Life's delta;
  - the next morning's level equals stockAfter;
  - the card's number is B x level x theirs - C x mine;
  - the gauge words equal those worked out in page-smoke from the templates;
  - kinWith banks move by the same rule;
  - all 16 tie levels of every future season are whole and within min..max;
  - banksAtEnd counts correctly;
  - the map in words names every bank.
- **Coverage.** Every gauge word must be reached. Stock words must never be called in the valley.
- **Colours.** A hook checks that each place's colours keep all 11 pairs at least as far apart as the valley's.
- **Hooks.** The Opening-sheet hook was rewritten with the same meaning. New hooks cover data-place, bankNode, the sister's bank under Elsewhere today, and gaugeD in the Afterwards.
- **One relaxation.** In the lexicon strings, template slot names such as {hands} are blanked before the leak test. They are never on screen, and the filled sentences are still checked whole.

## 2. Room [m, real browser]
- **First 1280x800 day.** The Banks day first overflowed by 63 px. The causes: situation titles wrapped in Your ways (+55 px), the gloss ran to 3 lines (+19) and the key gained a line (+20).
- **Fixes.**
  - Shorter titles. TUNE's titles are replaced by: 'Meeting a new boat', 'After you both kept off', 'After their nets crossed', 'After your nets crossed', 'After both nets crossed'. These are also neutral: TUNE's 'After you both fished across' asserted the other boat's choice.
  - A shorter gloss and luck note.
  - Key text 'a bank', placed after 'you fish across'.
- **Result.** The day view stayed at scrollHeight 800 through a whole Life, and with 42 marks in one row. A longer key text gave 802 px on days 11-12.
- **Opening.** The Banks lines first gave 829 px with lives listed. Lines 1 and 4 were shortened; it is now 800 with 2 lives and '4 older lives'.
- **Phone.** At 400x800, Begin ends at 625 with no horizontal scroll. Card heads are 37 px (bearing 28), and the first card starts at 556.

## 3. The Banks' sentences across a Life (seed 19, the peacemaker, which earns the seal; [m] page-p3/out/final-sample-life.txt)

**Opening**
- Twelve days of fishing in a cove of eight boats. Then you leave, and the cove goes on without you.
- You share a fishing bank with each of your four neighbours. Each day you can keep to your water or fish across. So can they.
- Keeping to your water costs you 2 baskets. While they keep to theirs, yours yields what the bank holds, 6 at first. It fills by 1 if either of you keeps off, and falls by 4 if you both fish across.
- What you do, others see. Some will take it up as their own way, at the end of every fourth day.
- At the end two things are counted: whether your catch is enough for winter, and whether you left the banks better or worse off.
- The sheet's hand reads −2 at your end and +6 at theirs.

**Day 1**
- Winter catch: 0 of 200 baskets. The old rule of the cove, to keep off with a new boat and then do as they did yesterday, would bring in 113 baskets this season.
- Each card head: [holds 6], said as 'The bank between you holds 6; it can hold 9.'
- Closed:
  - "The Garrow boat: The tide carried your nets into their water. They saw only nets there. They kept to theirs. +6 [fills to 7]"
  - "The Pell boat: You kept to your water. Their nets were in yours. −2 [fills to 7]"
  - "Your sister's boat kept to its water beside the Pell boat, whose nets went across." The map adds: The bank between them fills to 7.

**Day 2**
- "Yesterday you kept to your water. Their nets were in yours. Counts in your ways under: After their nets crossed". You fish across.
- "The Pell boat: You fished across. Their nets were in yours. 0 [falls to 3] The bank between you falls to 3."
- "Why? The Yarrow boat: After both kept off. This is the Yarrow way. They did not learn it from you."

**Day 3**
- The peace offer: "The Pell boat: Both boats kept to their water. +1 [fills to 4]".
- "The Garrow boat: Both boats kept to their water. +6 [fills to 9] The bank between you fills to 9 and is full."
- Elsewhere: "Your sister's boat and the Pell boat: nets went across both ways." The map adds: The bank between them falls to 1 and is spent.

**The end of the first season**
- At each season's end, boats look at who is doing well and may take up their ways. Your sister's boat follows your ways in 5 of 5 situations.
- "After their nets crossed: now keeps out of their water 2 of 3 times, as you did."

**Leaving**
- The boats are in. Winter catch: 270 of 200 baskets. Your boat is kept.
- After your nets crossed: kept to your water 2 of 2.

**The Afterwards**
- Thirty seasons without you. This is one future of 2000. Each has its own tides and its own chances taken.
- The banks between boats, season by season (line label '7'). The grounds hold if, over the last ten seasons, the banks between boats average at least 7; they began at 6.
- "Season 5: newcomers, the Corra boat, take over the Fenn mooring." … In this future the grounds failed. At the end, 8 boats keep your ways.
- Strip in words: Season 1: 7.3. Lowest: 3.3, in season 27. Last ten seasons: 4.4. The grounds hold at 7 or more.
- Resting map in words: "The sixteen banks at the end: full 1, spent 1, in between 14."

**The Chronicle**
- Boat: Kept: 270 of 200 baskets.
- Grounds: With you, the grounds held in 1155 of 2000 futures. Had your boat kept the old rule of the cove: 854 of 2000.
- Your mark: +15. The mark is the gap between the two counts: 301 more futures held with you, about 15 in every hundred.
- Where that sits: Of thirteen plain ways a boat might have left here, the best holds in 60% … the worst in 17%.
- SEAL: Boat kept, grounds better off.
- Mattered: After your nets crossed: you kept to your water 2 of 2 times. Had you fished across there once more: held in 486 of the first 1000 futures. As you left it: 578.
- Banks 19: kept, 270 of 200. Mark +15. Seal. [Live another life] [Fish these banks again] [Choose another place]

**Last day, selfish act (also seed 19)**
- "On the last day you fished across into the water of your sister's boat, the Yarrow boat, the Dunmore boat and the Pell boat. Had you kept to your water beside your sister's boat, the Yarrow boat, the Dunmore boat and the Pell boat, the grounds held in 578 of the first 1000 futures, against 497 of those as you left it. Your catch would have been 270 of 200 baskets."
- The seal is withheld silently.

## 4. Screenshots [m]
All are in page-p3/out/screens/:
- 01 Opening, laptop dark
- 02 closed day 2
- 03 day map enlarged: gauges over the hands
- 04 and 05 Afterwards
- 06 Chronicle
- 07 the chooser back on the valley
- 08 Opening, phone light
- 09 phone cards with gauges
- 10 phone Afterwards
- 11 phone Chronicle

Size: the 7 page files total 378 KB (engine 109 KB) [m].

## Checks

- **page-smoke.js, both places (valley, banks)**: PASS in 72.7 s (limit 120 s for 2 places). 113 of 113 AYWords functions called (the valley calls 109; the 4 stock-word functions are required in the Banks and must not be called in the valley). 908,287 sentences. 231 hooks. MEASURED (cd game && jsc page-smoke.js -> page-p3/out/final-page-smoke.txt)
- **page-smoke.js -- banks**: PASS in 46.0 s. 149 Lives (the 7 valley policies plus 26 x the peacemaker and 9 x its selfish act). Seals 1. Last-day lines 48, all from the habit replay. Every gauge word reached: holds 2893, full 3958, spent 301, fills 2116, fillsFull 561, falls 292, fallsSpent 175, staysFull 3850, staysSpent 158. The sister's banks were told 2568 times. MEASURED (page-p3/out/final-page-smoke-banks.txt)
- **page-smoke.js -- nowhere**: Refused at once with: no place "nowhere" is registered (valley, banks). Exit 3. MEASURED (page-p3/out/final-page-smoke-unknown.txt)
- **The valley's sentences against stage 2**: IDENTICAL, line for line: 382,559 sentences, fnv1a32 6d84219b (page-p2's stream-words.js -- valley). MEASURED (page-p3/out/final-words-stream-valley.txt, final-same-valley-sentences.txt)
- **Every sentence, both places, against stage 2**: Every stage-2 sentence is still there, in order. The 525,728 added sentences form a single run, at positions 382528..908255: the Banks' Lives, between the valley's Lives and the hooks. Hash 6604b452 over 908,287 sentences; page-map/golden-words.js, unmodified, prints the same hash. MEASURED (final-words-stream-all.txt, final-diff-words-all.txt, final-golden-words-pagemap.txt)
- **The valley page walk against stage 2 (page-p2 stream-page.js)**: Maps 7a78d3e9, identical in all 168 steps. Page abf3fee6 became f4d4e3ff, with exactly 3 distinct changes: the choice of places is shown, it has 2 options, and 'Choose another place' is shown in the Chronicle. MEASURED (final-page-stream.txt, final-diff-page.txt)
- **The valley alone (page-p1/golden-page-p1.js loads valley.js only)**: page abf3fee6, maps 7a78d3e9: equal to stage 2. The shared code changes leave a valley-only page byte-identical. MEASURED (final-golden-page-p1.txt)
- **page-map/golden-page.js**: Cannot load the page (no places/ or sheet.js), exactly as in stage 2. Exit 3. MEASURED (final-golden-page-pagemap.txt)
- **harness.js**: Its 12 gate lines are identical to those in harness-mine.txt (empty diff). Finished in 140.3 s. Verdict 1.034 s mean, PASS. engine.js unchanged (md5 2fa86b59). MEASURED (final-harness.txt, final-gates.txt, final-gates-diff.txt)
- **Stand-in DOM, the six valley configurations (adapted copy dom-run-p3.js)**: All 6 OK, exit 0, 896 to 973 checks each. The checks that encoded 'one place' now encode 'two places': the choice is shown, two lives are listed on the Opening, and the way back is shown. Every other check is kept. MEASURED (check/run-dom.sh -> final-dom.txt)
- **Stand-in DOM, the Banks**: 5 configurations OK, each a whole Life to the Chronicle, then a second Life, then the chooser switched away and back: laptop seed 12 'peace' (1404 checks); tablet seed 48213 'short' with 6 stored Banks lives (1401); phone seed 31 'old' (1469); phone320 seed 2024 'send' (1414); laptop seed 5 'peace' watched by the clock (1397). Each run checks:
- every card's gauge, caption and vh sentence, before and after the reveal;
- the 4 crossing gauges on the day map, plus the sister's gauges;
- the sister's bank said under Elsewhere today;
- the Leaving gauges;
- the 16 Afterwards gauges against seasons[29].ties;
- the banks at the end in words;
- the gauge in both keys;
- data-place on the root.
MEASURED (final-dom.txt)
- **Stand-in DOM, chooser, hash, store, restore (dom-places-p3.js: the real Banks plus page-p2's throwaway watch, bridges and saltmarket)**: All PASS: two 17, hash-two 8, choose 232, hash 16, restore 21, store 12. MEASURED (check/run-dom-places.sh -> final-dom-places.txt)
- **Stage-2 dom-run-p2.js on the new page**: Fails, as expected, at 'with one place the choice of places stays hidden': the page now has two places. MEASURED (final-dom-run-p2-on-p3.txt)
- **The sheet's rules (AYSheet.check, with the new gauge rule)**: Banks [] and valley []. On both sizes the race meets each of your ties once, and the shore stays in its band. All 16 gauges are inside the frame, clear of every holding and its ring, and clear of each other. MEASURED (check/sheet-probe.js -> final-sheet-probe.txt)
- **Colour contrast, Banks against the valley**: 0 of 11 pairs lower, light and dark. The three Banks blocks set the same 5 tokens. Examples: field on paper-raised 5.94 vs 5.10 (light) and 7.59 vs 6.93 (dark); river-wash on paper-raised 1.34 vs 1.29 and 1.37 vs 1.25. The same check also runs inside page-smoke. MEASURED (check/contrast.py -> final-contrast.txt)
- **Real browser at 1280x800 dark (Banks seed 12, the peacemaker)**: A whole Life to the Chronicle.
- Day view: document scrollHeight was 800 at all 27 states (chosen, closed, season's end), so no scrollbar.
- A worst case, keeping to your water with everyone (42 marks in one row), also stayed at 800.
- Opening: 800 with 6 Banks lives stored (2 listed and '4 older lives').
- No console messages.
- The chooser switched banks -> valley -> banks, changing words, sheet, colours (--field) and listed lives.
- After the last app.js change (a vh span), the Life was re-run: day max 800, sister's bank said, no console messages.
MEASURED (Browser pane, preview.html#banks-12; screenshots page-p3/out/screens/01-07)
- **Real browser at 400x800 light (Banks seed 31, the old rule)**: A whole Life to the Chronicle. scrollWidth was 400 at every step, so no horizontal scroll. Begin ends at 625, on the first screen. The chooser switched to the valley and back. No console messages. MEASURED (Browser pane, preview.html#banks-31; screenshots page-p3/out/screens/08-11)

## Shared changes needed

- A place with a stock must give lexicon.stock with the Banks' keys: you, them, holds, full, spent, fills, fillsFull, falls, fallsSpent, staysFull, staysSpent, stays, with, mapLevels, atEnd and legend. page-smoke compares the shape against the first stock place. A place without a stock must not give it.
- writtenFor may carry B and STOCK_MOVES ('either-fills'), which page-smoke checks. Any other extra key throws until page-smoke learns it.
- A place's own colours need all three token blocks: ':root[data-place="\<id>"]', the dark media block with :not([data-theme="light"]), and '[data-theme="dark"]'. They must set the same tokens and go before '*, *::before'. page-smoke requires each of its 11 colour pairs to be at least as far apart as the valley's.
- Each new place needs:
- a PLACE_RULES neutral pattern;
- a confirmed SKINS entry;
- optionally PLACE_POLICIES and PLACE_REQUIRED, including one way of playing that earns its seal.
- AYSheet now carries the draw kinds race, shore, gauge and boat. A sheet with a 'gauge' crossing may move tie gauges along their ties with sheet.gauges, and check() verifies that every gauge is clear of holdings and of other gauges. Rule 3 (lettering against gauges) still needs a browser.
- W.mapAltDay accepts life.params as a 4th argument. flowLabels, flowAlt and rowRule now fill {start} where the place has a stock. Other places can use {start} in those templates.

## Open issues

- Words that differ from TUNE section 8, for the lead to confirm [argued, measured by room]:
- The five situation titles are now 'Meeting a new boat', 'After you both kept off', 'After their nets crossed', 'After your nets crossed' and 'After both nets crossed'. TUNE's titles wrapped in Your ways and added 55 px to the laptop day [m], and 'After you both fished across' claimed a choice for the other boat.
- The Opening no longer states 'never below 1' or 'at most 9'. The card gauge says 'is spent' and 'stays full' instead, which keeps the Opening at 800 px with lives listed [m].
- The seal's coverage in page-smoke for the Banks is thin. 1 of 149 Banks Lives sealed [m]: most Lives use 400/200 futures, where the mark's standard error is larger. Seed 19 seals at full counts with the peacemaker [m: sample-life]. If the preset moves, the 'no Life earned the seal' check could trip; adding a Banks-only full-count seed would make it robust.
- The day key's gauge item is worded only 'a bank' and sits right after 'you fish across'. With 'a bank, filled as far as it holds', or placed last, the key took a 4th line and the laptop day reached 802 px on days 11-12 with the peacemaker [m]. The Afterwards key uses the same word.
- Room was checked only at 1280x800 dark and 400x800 light, as this stage asked. LEAD 3.10 also asks for 1366x700 and 1440x960 in light and dark; that is not done. At 1280x800 the day's scrollHeight is exactly 800, and the spare room under it was not measured.
- The banks Afterwards map letters each holding's income number over the boat's sail. It is legible thanks to the halo, but busy [argued from screenshots 04/05].
- Stale or broken harnesses, as in stage 2. page-map/golden-page.js still cannot load the page (no places/ or sheet.js). The stage-2 dom-run-p2.js and dom-places 'one' and 'hash-one' encode a single place and now fail at that check; their page-p3 copies replace them, and those copies change only the place-count checks.
- README.md is stale (as reported in stage 2) and was not edited.
- Size: the page files total 378 KB [m]. Three more places at about 20 KB each would make about 440 KB [argued].
- The chooser's options now size to their names. With all five real names (including 'The saltmarket') the row should still fit one line at 34rem [argued], but that has not been measured.

## Files changed

- after-you/places/banks.js (new)
- after-you/words.js
- after-you/sheet.js
- after-you/app.js
- after-you/index.html
- after-you/page-smoke.js
- after-you/preview.html (regenerated)
- `<scratch>/places/page-p3/before/` (copies of the stage-2 files)
- `<scratch>/places/page-p3/check/` (dom-run-p3.js, dom-places-p3.js, run-dom.sh, run-dom-places.sh, run-final.sh, run-final2.sh, contrast.py, same-sentences.py, sample-life.js, sheet-probe.js, tie-points.js, probe1.js)
- `<scratch>/places/page-p3/out/` (final-*.txt, try1-*.txt, screens/*.jpg)
