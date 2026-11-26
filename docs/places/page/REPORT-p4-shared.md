> **Record of its time.** Written 2026-11-25 21:29 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Stage report: shared

(Written by the lead from the stage's structured result: the subagent harness refused report files.)

Status: done

## Fingerprints

Valley sentences (page-p2 stream-words.js -- valley): fnv1a32 6d84219b, 382,559 sentences, 11,556,895 characters. Identical, line for line, to stages 2 and 3. All five places (page-map/golden-words.js, unmodified): e034e97c, 2,359,003 sentences, 74,892,917 characters. Stage 3's 908,287 sentences are kept in order, and 1,450,716 are added as one run of new-place Lives. Valley alone (page-p1/golden-page-p1.js): page abf3fee6, maps 7a78d3e9, equal to stages 2 and 3. Valley walk with five places (page-p2 stream-page.js): page c8f9bb5d, maps 7a78d3e9. Per size: phone 28da0013 / a80b5f11, laptop cc441f42 / f3d5aeae, tall 9426ad5c / f3d5aeae. Maps are the same in all 168 steps; the only markup changes are the chooser's label/vh spans and its 3 new options. page-map/golden-page.js still cannot load the page (exit 3), as before. Harness: 12 gate lines identical to harness-mine.txt.

valleyIdentical: False

## Summary (the full report)

STAGE 4 (shared features for the Watch, the Bridges and the Saltmarket, and a first draft of each place file): DONE. Every check passes.

The valley's sentences (6d84219b, 382,559) and its maps (7a78d3e9) are unchanged from stage 2. The valley-only page is byte-identical (abf3fee6). No git command that changes anything was run. engine.js and harness.js are untouched (md5 2fa86b59, cae4bd3f).

Labels: [m] means measured (outputs in page-p4/out, scripts in page-p4/check); [a] means argued.

## 1. Shared code built (words.js, sheet.js, app.js, index.html, page-smoke.js)

1. **Shared stakes (S, H)**
   - W.stakes(p) gains storeStart.
   - stakeSlots gives, for each outcome (both, mine, theirs, neither), {xSigned} (+7), {xAbs} (5) and {xGoods}, plus {storeStart} and {storeStartGoods}.
   - W.reveal(r, p) and W.yesterday(y, p) fill the place's template with those slots plus {number}, the day's own payoff. Without p they read as before. app.js always passes life.params. A template with no slot reads the same either way, so valley output is identical [m].
   - Each of the six reveal and yesterday keys names one outcome (lostTheirs reads as theirs, lostNone as neither). The engine charges S when both acts arrived and H when neither did.
   - page-smoke now checks:
     - every non-stock card's payoff equals B·they − C·arrived + S·both − H·neither, worked out independently;
     - an act counts as arrived only if it was sent and not lost;
     - in an S/H place, the Opening states every non-zero outcome number;
     - no digit is typed into any reveal or yesterday template.
2. **A store below zero; the need; a starting store**
   - meterInto draws a store below zero hatched from a zero mark leftward. The scale starts at the next ten below the store, and the ticks and need use the same scale.
   - A store at or above zero draws exactly as before, so the valley's markup is unchanged [m: golden-page-p1].
   - The store, day total, leaving line, Chronicle and past-life lines print the true signed number.
   - page-smoke checks:
     - need > 0 on every Life;
     - the store on day 1 equals STORE_START;
     - a negative store is told as '−N of …' in the store, the leaving line and the Chronicle;
     - the shortfall is stated;
     - a place with H must show at least one negative store.
   - STORE_START is included in the Opening's allowed numbers and in moved(). It must be stated where non-zero. writtenFor may carry STORE_START (true or false).
   - The dom-run checks the meter markup and arithmetic.
3. **The inverted charter**
   - flowSide gives the good side by CHARTER: under 'breaks' a column at or over HOLD_LINE is drawn hollow.
   - The strip's line comes from HOLD_LINE.
   - W.flowAlt gains the slots {high}, {highSeason} and {stretch}, where {stretch} is runFuture().worstStretch. The Saltmarket words {stretch} as "the town's best five seasons running".
   - The scale's bracket is checked (bestPct ≥ worstPct, every Life).
   - The Chronicle's rows, range, mark, futureEnd, legendMarks and seal all come from the charter words. The Saltmarket's say "the ring broke" throughout.
   - The dom-run checks all 30 columns against the charter in every place.
4. **The Saltmarket's town line**
   - W.dayTown(results, p) returns lexicon.town.some, filled with {extra} = 2·S·(ties where both acts arrived), {goods} and {pairs}, or lexicon.town.none when the extra is 0.
   - It throws unless CHARTER is 'breaks'. AYPlaces.add requires lexicon.town exactly when writtenFor.CHARTER is 'breaks'.
   - app.js appends it to the day's total as span.status-town, inside the live status line.
   - page-smoke works out the extra from the results and requires both branches to be reached. Feature groups are now predicates: stock iff STOCK, town iff 'breaks'. Their words must not be asked for elsewhere.
5. **Flow kinds 'one' and 'both'**
   - The strip's top is 1.05, the line is a share ("half", "3 in 10"), flowAlt counts in 100, and page-smoke rejects a share above 1.
   - The Afterwards key items (legendAfter.help, income) and the strip's head, rule and line label are the place's words.
   - Interpretation [a]: no new UI was added for these kinds. Correctness is checked by page-smoke and by the dom-run's strip check.
6. **Colours**: three token blocks each (light, dark by media, dark by attribute) for watch, bridges and saltmarket. Every pair is at least as far apart as the valley's [m].
7. **Sheet draw kinds (sheet.js)**
   - Barriers: 'border' (a pale band with dash-dot) and 'lane' (paving between two edges).
   - Far lines: 'downs' (crests) and 'arcade' (arches hung on the near side).
   - Crossings: 'post', 'bridge' (a deck with parapets laid along the tie; geo now records each crossing's direction) and 'cross'.
   - Bodies: 'tower', 'cart' and 'stall'. Each keeps the house square in its corner.
   - New CSS classes use tokens only; so do the glyph and seal classes (key-border, key-lane, seal-tower, seal-arch, seal-deck, seal-beam, seal-pan).
8. **Chooser room and labels**
   - With five places the chooser wrapped to 2 rows (86 px) at 1280x800 [m]. That broke the Opening with earlier lives listed.
   - Fix: a lexicon 'label' per place (one short word), read through W.placeLabel. It is a lookup, excluded from wrapping like 'title', so the valley stream is unchanged.
   - The option shows the label for the eye and placeName in a vh span for a listener. The options are now 12 px with tighter padding.
   - Result: one row, 40 px, in all five places [m].
9. **The last day**
   - lastActs now uses lastAct.hadSent and hadStayed for the "Had you …" half, so the Bridges reads "Had you given way" and "Had you driven on".
   - valley.js and banks.js got the same strings as their lastAct, so their sentences are identical.
   - page-smoke's last-day check reads the had* leads.
10. **page-smoke**
    - New: PLACE_POLICIES for watch, bridges and saltmarket (honest plus a selfish act), adapted from policies-fw.js, fix-bridges and tune-bridges, and tune-saltmarket.
    - New: PLACE_REQUIRED for each; PLACE_SEAL_SEEDS {watch: [4], bridges: [4], saltmarket: [10, 15]} (honest at full counts; found by seal-seeds.js).
    - New: PLACE_COVER_LIVES {watch: [[39, honest]], saltmarket: [[40, honest]]}, which reach the 'seen once since a change' card wording.
    - New: PLACE_RULES neutral patterns (they kept watch / they drove on / they cut, and their 'both …' forms).
    - 'the old way' now plays the Life's own CUSTOM. The valley's choices are unchanged [m: same stream].
    - New hooks for the meter, the town line, flowSide and reveal/yesterday with params.

## 2. The three place files (first drafts, each in clear sections)

- **places/watch.js**
  - Acts: Stand down / Keep watch. Goods: sacks. Store head: Winter stores.
  - Custom: 'The border custom' ([0,1,1,1,0]). Luck: "your watchman lit a fire at a shadow".
  - Titles: Meeting a new tower; After you both stood down; After a fire on their tower; After a fire on yours; After fires on both towers.
  - Charter: "the border was at peace". Seal: "Tower kept, border better off."
  - Sheet: border, scarp, post, tower. Afterword from TUNE.
- **places/bridges.js**
  - Acts: Give way / Drive on. Goods: loads. Store head: Yard. The actors are carters; kin is 'your sister'.
  - The Opening states the yard's start ({storeStart}). Luck: "your mule would not stand, and your cart came on".
  - Titles: Meeting a new carter; After you both waited; After their cart crossed; After your cart crossed; After the wheels locked.
  - Charter: the road moving or jammed. Seal: "Yard kept, road better off."
  - Sheet: stream, downs, bridge, cart. writtenFor includes STORE_START: true.
- **places/saltmarket.js**
  - Acts: Hold the price / Cut the price. Goods: coins. Store head: Takings. The Opening says the town pays {S} of each stall's gain.
  - Every count reads "the ring broke". Strip: "Pairs of stalls that both held the price"; flowAlt calls the weakest ring season and {stretch} the town's best.
  - Seal: "Stall kept, town clearly better off."
  - Town words: "Where both prices held, the town paid {extra} {goods} more today." / "The town paid nothing extra today."
  - Sheet: lane, arcade, cross, stall.

Every key the valley has is present, and every place's own skin words pass the leak lists [m]. Sample Lives read true, including the Chronicle, the stores below zero and the last-day lines [m: final-sample-life-*.txt].

## 3. What each place relies on in shared code

- **All three:**
  - W.stakes / stakeSlots for the Opening, and reveal/yesterday with params;
  - the meter;
  - lastAct.hadSent and hadStayed;
  - lexicon.label (placeLabel);
  - their [data-place] token blocks;
  - SKINS, PLACE_RULES, PLACE_POLICIES, PLACE_REQUIRED, PLACE_SEAL_SEEDS and PLACE_COVER_LIVES in page-smoke.js.
- **Watch:** FLOW_KIND 'both' ("3 in 10"); draw kinds border, scarp, post and tower; the key-border and seal-tower classes.
- **Bridges:** {storeStart} and writtenFor.STORE_START; FLOW_KIND 'one'; draw kinds stream, downs, bridge and cart; the key-river, seal-arch, seal-deck and seal-water classes.
- **Saltmarket:** lexicon.town and W.dayTown; the 'breaks' strip side; flowAlt {stretch}; the {S} slot; draw kinds lane, arcade, cross and stall; the key-lane, seal-beam and seal-pan classes.

## 4. What a place file must not do (each is enforced by page-smoke or by measured room)

- **Shared files**: do not edit words.js, app.js, sheet.js, index.html or page-smoke.js. Do not drop or add keys beyond the valley's, except the feature groups (stock iff STOCK, town iff CHARTER 'breaks'). Keep 'label' and lastAct.hadSent/hadStayed.
- **Numbers**:
  - Type no digit into the Opening, the rule templates (flow.half, flow.rule, rowRule) or the reveal/yesterday templates.
  - The Opening must state C, B·level, every non-zero outcome number in an S/H place, and STORE_START where non-zero.
  - Opening line 3 must contain 'every fourth day' and be ≤95 characters.
- **Templates**:
  - The gloss must start with custom.Name, and its only number must come from {purse}.
  - rangeLine and rangeNote must use {of}, never 'thirteen'.
  - flow.half, flow.rule, flowAlt and rowRule must use {line}.
  - lastDayHabit must keep {holds} {futures} {base} with no other number between them.
- **Words**:
  - No word on another place's SKINS list. For example, 'holding' is the valley's, so the Saltmarket cannot say "Holding the price".
  - No forbidden theory word, '!', em-dash or double space.
  - Never say the other side's act was a choice: the neutral patterns above.
  - label must be one capitalised word of at most 10 letters.
  - The afterword must be one paragraph of 2-3 sentences, at most 600 characters.
- **Sheet**: the barrier must meet each of your four ties exactly once; the far line must stay within 0.20–0.38 and below the phone crop; use only the draw kinds and classes that exist.
- **Room at 1280x800, with 6 earlier lives and a seed fixed by the hash** [m]: every Opening is exactly 800 now, with no spare. Bridges and Saltmarket lines were trimmed to get there. Any longer Opening text adds a scrollbar.

## 5. Valley identity (record)

- Sentences: 6d84219b over 382,559, identical to stage 2 line for line [m].
- Valley-only page: abf3fee6 / 7a78d3e9 [m].
- Five-place page walk: maps 7a78d3e9 in all 168 steps. Page c8f9bb5d, changed only in the chooser (label plus vh, and 3 more options) [m].
- The six valley dom-run configurations: all OK [m].
- Harness: 12 gates identical [m].

Size: the page files total 454,680 bytes [m: wc].

## Checks

- **page-smoke.js, all five places**: PASS in 200.7 s against a limit of 300 s (60 s a place); load was about 1.3. 114 of 114 AYWords functions called; 2,359,003 sentences checked; 306 hooks; colours checked for banks, watch, bridges and saltmarket. Lives played: valley 120, banks 149, watch 151, bridges 150, saltmarket 152. Seals: 6, 1, 21, 13, 8. Card numbers checked against the stakes of their outcome: watch 7248, bridges 7200, saltmarket 7296. Stores told below zero: watch 324, bridges 31. Saltmarket town lines: 1647 with an extra cost, 177 with none. MEASURED. (cd game && jsc page-smoke.js -> page-p4/out/final-page-smoke.txt)
- **page-smoke.js, each new place alone**: PASS for each, run in parallel on earlier files (before the lastAct and label edits): watch 45.3 s, bridges 45.3 s, saltmarket 41.5 s. The final full run above covers the final files. MEASURED. (page-p4/out/try2-smoke-{watch,bridges,saltmarket}.txt)
- **page-smoke.js -- nowhere**: Refused, exit 3, with: no place "nowhere" is registered (valley, banks, watch, bridges, saltmarket). MEASURED. (page-p4/out/final-page-smoke-unknown.txt)
- **The valley's sentences against stage 2**: IDENTICAL, line for line: 382,559 sentences, fnv1a32 6d84219b, 11,556,895 characters. MEASURED. (page-p2/check/stream-words.js -- valley -> page-p4/out/final-words-stream-valley.txt; page-p3/check/same-sentences.py -> final-same-valley-sentences.txt)
- **Every sentence, five places, against stage 3**: Every one of stage 3's 908,287 sentences (valley and banks) is still there, in its order. The 1,450,716 added sentences form one run, at positions 908256..2358971: the Lives of the three new places, before the hooks. Hash e034e97c over 2,359,003 sentences. MEASURED. (page-p2/check/stream-words.js -> final-words-stream-all.txt; diff-words-stream.py -> final-diff-words-all.txt)
- **page-map/golden-words.js (unmodified)**: fnv1a32 e034e97c over 2,359,003 sentences and 74,892,917 characters; exit 0. This is the same stream as above, now covering five places. The published 20bddf72 cannot recur, as in stages 2 and 3. MEASURED. (page-p4/out/final-golden-words-pagemap.txt)
- **The valley alone (page-p1/golden-page-p1.js, loads valley.js only)**: page abf3fee6, maps 7a78d3e9. Equal to stages 2 and 3: the shared code changes leave a valley-only page byte-identical. MEASURED. (page-p4/out/final-golden-page-p1.txt)
- **The valley page walk with five places (page-p2/check/stream-page.js) against stage 3**: Maps 7a78d3e9, the same in all 168 steps. Page f4d4e3ff became c8f9bb5d; per size: phone 28da0013 / a80b5f11, laptop cc441f42 / f3d5aeae, tall 9426ad5c / f3d5aeae. Exactly 3 distinct changes, all in the hidden-at-rest chooser: (1) the valley's option is now a short label 'Valley' for the eye plus a vh 'The valley' for a listener; (2) the same for the banks; (3) three more options are inserted. MEASURED. (final-page-stream.txt, diff-page-stream.py -> final-diff-page.txt)
- **page-map/golden-page.js (unmodified)**: Still cannot load the page (it lacks places/ and sheet.js), exit 3, exactly as in stages 2 and 3. MEASURED. (page-p4/out/final-golden-page-pagemap.txt)
- **harness.js**: Its 12 gate lines are identical to harness-mine.txt (empty diff). Finished in 136.0 s; verdict mean 1.016 s, PASS. engine.js md5 2fa86b59 and harness.js md5 cae4bd3f are unchanged at the start and the end. MEASURED. (page-p4/out/final-harness.txt, final-gates.txt, final-gates-diff.txt, harness-md5.txt, final-md5-engine-harness.txt)
- **Stand-in DOM, the six valley configurations (dom-run-p4.js)**: All 6 OK, with 1053 to 1130 checks each. Every stage-3 check is kept; five places replace two in the chooser checks. The new checks run every day and screen: the store on day 1, the meter, each card's sentence and number against the stakes of its outcome, no town line where the charter holds, and all 30 strip columns on the charter's side. The valley never drew a meter below zero in them (0). MEASURED. (page-p4/check/run-dom.sh -> page-p4/out/final-dom.txt)
- **Stand-in DOM, Banks (stage 3's five configurations) and the three new places**: All 15 OK: banks 5; watch 3 (laptop honest seed 3, phone 'old' with 5 lives, phone320); bridges 4 (laptop honest seed 1, tablet with 6 lives, phone, laptop 'never'); saltmarket 3 (laptop honest seed 10, phone 'old' with 4 lives, phone320 watched by the clock). Meters below zero were drawn and checked: watch 2/8/2, bridges 'never' 5. Town lines were checked: 12 in each saltmarket run. All strip columns matched the charter (saltmarket under 'breaks'). MEASURED. (page-p4/out/final-dom.txt)
- **Stand-in DOM: chooser, hash, stored lives, reload (dom-places-p4.js on the five real places)**: All 6 PASS: two (now five places) 17, hash-two 8, choose 232, hash 16, restore 21, store 12. The stage-3 copy registered throwaway watch, bridges and saltmarket places. Those now collide with the real places, so the copy loads none and reads their literal words from the real lexicons. MEASURED. (page-p4/check/run-dom-places.sh -> page-p4/out/final-dom-places.txt)
- **Sheet rules (AYSheet.check) for all five sheets**: valley [], banks [], watch [], bridges [], saltmarket []. On both sizes each barrier meets each of your four ties exactly once with a real hit, and the far line stays in its band. Every mode draws whole. MEASURED. (page-p4/check/sheet-probe.js -> page-p4/out/final-sheet-probe.txt)
- **Colour contrast against the valley (11 pairs, light and dark)**: Banks, watch, bridges and saltmarket: no pair lower than the valley's. Each place sets the same 5 tokens in all three blocks. Worst margins for the candidates: watch +0.134, bridges +0.017, saltmarket +0.016. MEASURED. (page-p3/check/contrast.py -> page-p4/out/final-contrast.txt; page-p4/check/pick-colours.py)
- **Real browser (preview.html on port 8791), 1280x800 light and dark, 400x800**: Opening: the five-place chooser is one row (40 px) at 1280x800 in all five places. With 6 earlier lives stored and the seed fixed by the hash (the worst case), the document is 800 tall in every place. Before the label and draft fixes it was 2 rows (86 px), and bridges and saltmarket reached 805-807. Saltmarket day: 800 tall at every step of 12 days with the town line (status 49 px). Watch store below zero: drawn hatched left of the zero mark. Bridges deck and parapets are drawn across the stream. 400x800: no horizontal scroll, Begin ends at 648. No console errors. Test lives were removed from the preview's storage afterwards. MEASURED. (Browser pane, preview.html#saltmarket-10, #watch-3, #bridges-1)
- **Sample Lives of the three places (all sentences through AYWords)**: Seals: watch seed 3 (mark +13), bridges seed 1 (+19), saltmarket seed 10 (+28). Last-day lines from the selfish act, stores below zero ('−18 of 146 sacks ... 164 sacks short'), and town lines all read true. They exposed one fault: 'Had you drove on'. It is fixed in shared code (lastAct.hadSent and hadStayed). MEASURED. (page-p4/check/sample-life.js -> page-p4/out/final-sample-life-{watch,bridges,saltmarket}.txt)

## Shared changes needed

- None are required for the place files as drafted. Possible later changes, all in shared code: (1) the wonOnSeason Chronicle line (LEAD 4.2); (2) a Bridges daily count with the day total, if the lead wants it; (3) re-find PLACE_SEAL_SEEDS and PLACE_COVER_LIVES in page-smoke.js if a preset moves; (4) more Opening room if the polishers need longer Opening lines: today every place is exactly 800 px at 1280x800 with lives listed and a fixed seed.

## Open issues

- LEAD 4.2's Chronicle line for a seal withheld by the season replay (seal.wonOnSeason) is not built. LEAD says the round's decisions apply after the page build. page-smoke still fails the check if app.js or words.js reads wonOnSeason or verdict.season. Building it later means editing shared code (words, app, the check) plus one lexicon key per place.
- The Bridges' 'daily count beside the day total' (TUNE §7) is not built: LEAD 3.8 does not list it, and the laptop day has little room [a]. The new town mechanism (W.dayTown) could host it as a further feature group if the lead wants it.
- 'Flow kinds one and both … and their key items' was read as: the strip, line, top, words and the Afterwards key items are correct for these kinds, checked by page-smoke and the DOM run. No new strip key was added, because one would change the valley's page [a].
- Room was measured at 1280x800 (light and dark) and 400x800 only. The Opening is exactly 800 in all five places with 6 earlier lives and a seed fixed by the hash, so there is no spare. The saltmarket day stays at 800. LEAD 3.10's 1366x700 and 1440x960, and full Lives of watch and bridges in a real browser, are for the polish stage [m for what was measured].
- To fit, the Saltmarket's fourth Opening line no longer says that the town is better off when the ring breaks; it now says 'whether the town is better off for your ways'. The Bridges premise and line 4 were shortened too. The polishers may want to restore the wording within the room.
- The chooser options are now 12 px (the cards' options are 13 px) and show a short label ('Valley', 'Banks', 'Border', 'Bridges', 'Saltmarket'), with the full name in a vh span for a listener. This is the only visible valley difference, and only when there are several places.
- PLACE_SEAL_SEEDS and PLACE_COVER_LIVES in page-smoke.js were found on the current presets. If the confirmation round moves a preset (for example the Watch taking REPLAY 'season'), those seeds may stop sealing or covering, and the fix is in shared page-smoke.js.
- The stage-3 copies dom-run-p3.js and dom-places-p3.js encode two places or throwaway places and now fail by design. Their page-p4 copies replace them, changing only the place-count checks and the throwaway words.
- The Saltmarket never told a store below zero in page-smoke (0; the facts table allows -4). The requirement is enforced only where H ≠ 0 (watch and bridges).
- README.md is still stale, as in stages 2 and 3; not edited.

## Files changed

- after-you/words.js
- after-you/sheet.js
- after-you/app.js
- after-you/index.html
- after-you/page-smoke.js
- after-you/places/valley.js
- after-you/places/banks.js
- after-you/places/watch.js (new)
- after-you/places/bridges.js (new)
- after-you/places/saltmarket.js (new)
- after-you/preview.html (regenerated)
- `<scratch>/places/page-p4/check/` (dom-run-p4.js, dom-places-p4.js, run-dom.sh, run-dom-places.sh, run-final.sh, policies-p4.js, seal-seeds.js, find-ownsince.js, probe-coverage.js, sample-life.js, sheet-probe.js, pick-colours.py)
- `<scratch>/places/page-p4/out/` (final-*.txt, try*.txt, seal-seeds-*.txt, probe-*.txt, sample-life-*.txt)
- `<scratch>/places/page-p4/before/` (stage-3 copies)
