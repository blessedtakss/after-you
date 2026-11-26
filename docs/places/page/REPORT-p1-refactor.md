> **Record of its time.** Written 2026-11-25 19:28 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Stage report: refactor

(Written by the lead from the stage's structured result: the subagent harness refused report files.)

Status: done

## Fingerprints

The valley did not move. Words: fnv1a32 20bddf72 over 362,279 sentences and 10,913,441 characters, for all places and for -- valley alone (baseline: the same). Page: page 72a7c55d, maps 7a78d3e9; phone e12c6dff/a80b5f11, laptop 8e09c6a0/f3d5aeae, tall 4bfbb956/f3d5aeae (baseline: the same).

valleyIdentical: True

## Summary (the full report)

I couldn't write REPORT.md: the subagent harness refused report files, so the full report is below. The valley did not move. Both fingerprints equal the baseline: words 20bddf72 over 362,279 sentences, and page 72a7c55d with maps 7a78d3e9. The new engine is installed, and harness.js's twelve gate lines match harness-mine.txt.

Two clock limits failed, both because the parallel confirmation round kept the machine loaded at 120 to 190:
- page-smoke's 60-second limit: 268.6 s elapsed, 36.7 s of CPU. The untouched published page-smoke failed the same limit under the same load (284.1 s, 39.4 s CPU); on a quiet machine it took 25.8 s.
- harness.js's verdict-timing line: 10.7 s mean against a 2.5 s target. The same engine file passed that line earlier at 1.469 s.

Every content check passed. One rerun of `jsc page-smoke.js` and `jsc harness.js` on a quiet machine is still owed for those two PASS lines.

All outputs are in `<scratch>/places/page-p1/out/`. Each claim below is labelled measured (with its output file) or argued. "jsc" means `/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc`, run from the game folder.

## 1. Baseline and engine [measured]

**Baseline.** The published files are copied to page-p1/before/; md5s are in out/before-md5.txt and match PAGE-MAP's. On those files:
- golden-words printed 20bddf72 over 362,279 sentences and 10,913,441 characters.
- golden-page printed page 72a7c55d, maps 7a78d3e9 (phone e12c6dff/a80b5f11, laptop 8e09c6a0/f3d5aeae, tall 4bfbb956/f3d5aeae).
- page-smoke passed in 25.8 s.
- The six dom-run configurations were all OK.

These are the expected values; outputs are out/baseline-*.txt.

**Engine install.** final/engine.js was copied in (cmp identical, md5 2fa86b59).
- harness.js's 12 gate lines are identical character for character to harness-mine.txt (out/gates-ref.txt vs out/gates-engine.txt).
- Only the two timing lines differed; that run overlapped my other jsc runs.
- golden-words, golden-page and page-smoke on the published page files were unchanged (out/engine-*.txt).

## 2. New layout

The scripts load in this order (the last line of index.html, which page-smoke pins): engine.js, words.js, places/valley.js (then each later place), sheet.js, app.js.

- **words.js** (632 lines, was 623)
  - It keeps the register of places, `AYPlaces = { order, byId, add }`.
  - `AYWords.use(id)` puts a place's words in force; an unknown id throws.
  - `AYWords.title(s)` gives the place's name for situation s.
  - The 104 word functions keep their names, signatures and logic, and read the words in force through `L(path)` and `fill(path, slots)`.
  - A missing key, or a slot nothing fills, throws. Only the place in force is read, so no word can fall back to the valley's.
  - Every string left in the file is the shared base.
- **places/valley.js** (278 lines, new): one `AYPlaces.add({ id: 'valley', lexicon, charter, sheet, afterword: null })`.
- **sheet.js** (520 lines, new; AYSheet). These moved from app.js code for code:
  - app.js lines 206–571: layout, positions, ties, geometry, letterUp, lettered, the drawing helpers, holdSVG and mapSVG;
  - keySVG, exchangeGlyph and sealSVG;
  - esc and f, which only the drawing used.

  Its API is `map(sheet, kind, mode, o)`, `key(sheet, kind)`, `glyph(sheet, r)`, `seal(sheet)`, `geo(sheet, kind)` (cached per definition and size), `labelAt`, `nameRoom`, `lettered`, `letterUp`, `f`, `LAYOUT`, `ORDER`, `TIES` and `check(sheet)`. The decoration now comes from the sheet definition:
  - barrier `{ draw: 'stream', smooth: 10, points }`: the river;
  - farLine `{ draw: 'scarp', smooth: 8, points }`: the ridge and its hachures;
  - crossing `'ring'`: the ford rings;
  - body `'field'`: the furrows and the house square;
  - notes, placed `'house'`, `'farLine'` or `'sheet'`;
  - glyph `{ barrier, keyBarrier, seal }`: SVG pieces for the result glyph, the key's lost act and the seal's device.

  The draw kinds are named tables (BARRIERS, FAR_LINES, CROSSINGS, BODIES); an unknown kind throws. Internal names were generalised (g.barrier, g.farLine, g.crossings, LAYOUT.cross). CSS classes are unchanged.

  `check()` applies two rules on both sizes: the barrier meets each of ties 0-1, 0-2, 0-6 and 0-7 exactly once, and the far line stays between 0.20 and 0.38 of the height and below the phone's crop. The valley passes both.
- **app.js** (1,364 lines, was 1,771)
  - `state.place = 'valley'`, and `W.use(state.place)` runs at start before fillStatic.
  - All three engine calls are `A.createLife(…, state.place)`.
  - `sheetDef()` returns `AYPlaces.byId[state.place].sheet`, which every drawing call receives.
  - The five situation titles come from `W.title(s)`; the engine's `way.title` and `situationTitle` are no longer read.
  - legendInto, drawMap and refitMap (the DOM side) and CHECK_SVG (a control's check mark) stay in app.js.
- **index.html**: one line changed, the five script tags.
- **preview.html**: regenerated.
- The page files total 320 KB including the 109 KB engine. There are no external scripts and every path is relative.

## 3. The lexicon's shape

The valley has 146 keys holding 171 strings and 1,550 words (out/lexicon-keys.txt). The functions that read each key are derived from the code (out/key-readers.txt). A path starting `charter.` is read in the place's charter; anything else is read in its lexicon. Plural, capital and list grammar stays in words.js.

**lexicon**

| Key | Holds | Read by |
|---|---|---|
| house, House | `'the {name} house'`, capital | house, House; through them who, cardName, whyThird, elsewhere, futureLines |
| way | `'the {name} way'` | why (own way), futureLines |
| kin, Kin | "your sister's house", capital | kin |
| heir, Heir | 'your heir', capital | heir |
| actor.one, actor.many | 'house', 'houses' | closeDay |
| actor.yours, actor.far | 'your house', 'a house beyond your neighbours' | why, seasonEnd |
| newcomers | 'newcomers' | legendAfter, houseAtEnd |
| goods.one, goods.many | 'measure', 'measures' | measures(): store, oldWay, leavingStore, houseAtEnd |
| act.send, act.stay | the two buttons | send, stay |
| act.sends, act.stays | 'sends a hand', 'stays home' | seasonEnd's kin changes, leaveNote |
| custom.Name | 'The old way' | rowLabels, rangeLabels |
| custom.gloss | the custom in plain words, `{purse} {goods}` | oldWay |
| titles (list of 5) | the situation titles; equal to the engine's valley titles, which page-smoke asserts | title → app.js |
| knowRows, whereThey, deedSit, whereThird (lists of 5) | the situations as each part of the page names them | knowLabel, why, deed, whyThird |
| opening.premise, opening.lines (4) | the Opening | opening |
| pastName, placeNo | `'Valley {seed}'`, `'Valley no. {seed}'` | pastLife, valleyNo |
| map.crossing, farLine, beyond, seat, heir, kin | the sheet's labels | mapLabels (fields ford, ridge, beyond, yours, heir, sister) |
| mapAlt.sheet, day, after | the map's text alternatives | mapAlt |
| mapAltDay.head, plan, stay | the day map in words | mapAltDay |
| bearingSay | `'To the {bearing} of your holding.'` | bearingSay |
| legendDay.arrived, lost, planned, stay | the day key | legendDay |
| legendAfter.help, income | the Afterwards key | legendAfter |
| legendWays.sent, stayed | the ways key | legendWays |
| mapHint, storeHead, chooseLine, whyMarked, waysNote | single lines | the functions of the same names |
| knowValue, wayCount | `'sent a hand {h} of {n}'` | knowValue, wayCount |
| yesterday.*, reveal.* (lostTheirs, lostNone, both, mine, theirs, neither) | the six outcomes, whole | yesterday, reveal |
| luckNote | the luck note | fordNote |
| knew.* (6) | what was known of them | why |
| hereYou.* (3) | your deeds when they learned | why, whyThird |
| deed.sent, deed.stayed | `'Day {day}: you sent a hand to {who}, {sit}.'` and its pair | deed |
| even.own, even.third | a habit from you, and no act today | why, whyThird |
| elsewhere.* (4) | with `{Kin} {kin} {other} {Other}` | elsewhere |
| reconsidered.* (8) | the season's-end lines | seasonEnd |
| seasonHeads (3), seasonIntro, seasonNone | the season's-end panel | seasonEnd |
| leaving.head, kept, short, sub, button | Leaving | leavingHead, leavingStore, leaveSub, leaveButton |
| leaveNote.never, tested | the heir's note | leaveNote |
| oneFuture, houseAtEnd | Afterwards lines | oneFuture, houseAtEnd |
| arrival.kin, arrival.house | newcomers taking over | futureLines |
| adopt.backFromYours, adopt.back | a house going back to its own way | futureLines |
| waysEnd.* (4) | the closing line | waysEnd, became |
| heads.house, heads.place | 'House', 'Valley' | heads |
| rowsCaption, rowsExplain, rangeNote | Chronicle lines naming the place | the functions of the same names |
| mattered.none, mattered.count | the "mattered" line | mattered |
| againSame | 'Live this valley again' | againSame |

**charter** (words only)

| Key | Read by |
|---|---|
| legendMarks.held, fell | legendMarks |
| flow.head, half, rule | flowLabels |
| flowAlt | flowAlt |
| futureEnd.* (4) | futureEnd |
| placeLine | valleyLine |
| markMeans | markMeans |
| rowAlt, rowRule | rowAlt, rowsExplain |
| rangeLine, rangeYours, rangeAxis | rangeLine, rangeNote, rangeLabels |
| lastDay.one, lastDay.many | lastDayLine |
| seal | seal |
| mattered.more, lessShort, lessLong | mattered |

The good side of the line and the line itself come from the engine (`life.params.CHARTER`, `HOLD_LINE`), so the place file cannot contradict it [argued].

**Other parts of a place file**
- afterword: a string or null; null for the valley; no word function reads it yet.
- sheet: the decoration listed in section 2.

## 4. How a place file registers

1. places/\<id>.js is one IIFE calling `AYPlaces.add(...)`. It loads after words.js and before sheet.js and app.js.
2. `add()` requires a lower-case id that is not already registered, lexicon, charter and sheet objects, and an afterword that is a string or null. Places keep their load order, which is the play order.
3. page-smoke loads exactly the place files index.html names. Before any Life it requires that:
   - the valley is first;
   - each file registered the place it is named for;
   - each id is a key of AfterYou.PLACES, in PLACE_ORDER;
   - every place's key set and shapes equal the valley's;
   - every string obeys the page's sentence rules;
   - the five titles are sentences, and the valley's equal the engine's;
   - AYSheet.check reports nothing, and the sheet draws whole in every mode and size;
   - with luckNote removed from the valley, W.fordNote() throws and names the key;
   - an unknown place is refused.
4. `jsc page-smoke.js -- <place>` runs one place; with no argument it runs every registered place, the valley first.
5. Per place it resets the call counts and statistics, runs the same Lives with the place in force, then asserts every function was called and every branch reached.
6. The hooks then run with the valley in force. They now also require: the five scripts in order with the valley first; no address and no forbidden call in any script; every createLife call in app.js passing state.place; no engine titles shown; W.use(state.place) present.
7. 'poacher' and 'poachers' joined the forbidden words.
8. AYWords.use and AYWords.title are not wrapped by the call counter (NOT_WORDS); the places check above covers every string they can give.

## 5. Proofs after the refactor [measured]

**Adapted harness copies.** Each differs from its original only as follows:
- golden-words-p1.js: in the page-smoke it evaluates, the 60-second limit line is turned into a printed note, so a slow run still prints its hash. The hook and the hash are unchanged.
- golden-page-p1.js and dom-run-p1.js: they also load places/valley.js and sheet.js.

**Results**
- golden-words-p1: 20bddf72, 362,279 sentences, 10,913,441 characters; per-function table identical (out/after-golden-words-p1.txt).
- golden-words-p1 -- valley: 20bddf72 (out/after-golden-words-p1-valley.txt).
- golden-page-p1: page 72a7c55d, maps 7a78d3e9, with every size's pair identical (out/after-golden-page-try1.txt).
- dom-run-p1, six configurations: all OK; the output is byte-identical to the baseline run's (out/after-dom-run.txt).
- diff-words.js: the published words.js against the new one gives identical output for 104 of 104 functions on 1,079 branch-reaching cases. All 171 lexicon strings are reached and the titles are equal (out/diff-words.txt).
- diff-maps.js: the published mapSVG, cut from before/app.js, against AYSheet.map gives 632 identical maps and fittings. The cases cover both sizes, all modes, lettering enlarged, the crop, lost, arrived and planned hands, and the sister's dealings (out/diff-maps.txt).
- diff-drawings.js: all 26 keys, result glyphs and the seal are identical (out/diff-drawings.txt).
- page-smoke (official): every content check passes; it failed only the clock limit, as described at the top (out/after-page-smoke-busy.txt). `-- nowhere` is refused at once (out/after-page-smoke-unknown.txt).
- harness.js after the refactor: the 12 gate lines are identical (out/gates-after.txt); only the timing line failed, as described at the top (out/after-harness.txt).
- CPU cost: the new words and the published words took 36.8 s and 37.2 s of CPU under the same load, so the lexicon costs nothing measurable.
- Real browser (preview server, port 8791): the Opening, a closed day and a whole Life to the Chronicle all rendered; state.place was 'valley'; no console messages. golden-page is the markup proof; this was a visual check only.

## 6. Left for later stages

The details are in openIssues and sharedChangesNeeded: rule numbers still typed in, the chooser, hash, stored lives and reload, page-smoke's valley-worded assertions and its PLACE_RULES, re-baselining the words fingerprint once a new word function exists, the stale README, and sheet rule 3.

No git command that changes anything was run, and nothing outside the game folder and the scratch folder was written.

## Checks

- **Baseline before any edit**: Matches the expected values: golden-words 20bddf72 over 362,279 sentences and 10,913,441 characters; golden-page page 72a7c55d and maps 7a78d3e9; page-smoke PASS in 25.8 s; the 6 dom-run configurations all OK (measured: out/baseline-golden-words.txt, out/baseline-golden-page.txt, out/baseline-page-smoke.txt, out/baseline-dom-run.txt)
- **Engine installed (final/engine.js)**: The copy is byte-identical (cmp; md5 2fa86b59). harness.js's 12 gate lines are identical to harness-mine.txt; only the two timing lines differ. On the published page files, golden-words, golden-page and page-smoke are all unchanged. (measured: out/engine-harness.txt, out/gates-ref.txt vs out/gates-engine.txt, out/engine-golden-*.txt, out/engine-page-smoke.txt)
- **Words fingerprint after the refactor**: fnv1a32 20bddf72, 362,279 sentences, 10,913,441 characters. The per-function table of sentences and shapes is identical to the baseline's. (measured: jsc page-p1/golden-words-p1.js -> out/after-golden-words-p1.txt)
- **Words fingerprint, valley alone (-- valley)**: fnv1a32 20bddf72, 362,279 sentences (measured: jsc page-p1/golden-words-p1.js -- valley -> out/after-golden-words-p1-valley.txt)
- **Unmodified page-map/golden-words.js on the new page-smoke**: Every check passed (104 of 104 functions, 362,279 sentences). It then threw on page-smoke's 60 s clock limit (294.7 s elapsed, 37.8 s CPU, on a busy machine) before printing its hash. That is why the adapted copy exists. (measured: out/after-golden-words-try1.txt)
- **Page fingerprint after the refactor**: page 72a7c55d, maps 7a78d3e9. The per-size pairs are identical: phone e12c6dff/a80b5f11, laptop 8e09c6a0/f3d5aeae, tall 4bfbb956/f3d5aeae. (measured: jsc page-p1/golden-page-p1.js -> out/after-golden-page-try1.txt)
- **Every word function on every branch (published vs new words.js)**: PASS: 104 of 104 functions identical on 1,079 cases; titles equal; 171 of 171 valley lexicon strings reached (measured: jsc page-p1/diff-words.js -> out/diff-words.txt)
- **Every map mode and size (published mapSVG cut from before/app.js vs AYSheet.map)**: PASS: 632 maps and name fittings identical, covering lost hands, plans, the crop, lettering enlarged x1.06 and x1.31, and the sister's dealings (measured: jsc page-p1/diff-maps.js -> out/diff-maps.txt)
- **Keys, result glyphs and the seal (published vs AYSheet)**: PASS: 26 drawings identical (measured: jsc page-p1/diff-drawings.js -> out/diff-drawings.txt)
- **DOM harness, 6 configurations (adapted copy)**: All 6 OK. The output is byte-identical to the baseline run's (same check counts, lettering, pins and fitted name). (measured: jsc -e 'var CONFIG=...' page-p1/dom-run-p1.js -> out/after-dom-run.txt (diff with out/baseline-dom-run.txt is empty))
- **page-smoke.js (official, all places = valley)**: Every content check passes: the places check (171 strings, 10 sheets, missing-key throw); 104 of 104 functions exercised; all branches reached; 176 hooks; 362,279 sentences. It FAILED only its 60 s clock limit (268.6 s elapsed, 36.7 s CPU, load about 120). The untouched published files fail the same way under the same load (284.1 s elapsed, 39.4 s CPU). The baseline on a quiet machine took 25.8 s. (measured: out/after-page-smoke-busy.txt, out/before-page-smoke-busy.txt, out/baseline-page-smoke.txt)
- **page-smoke -- nowhere**: Refused at once: no place "nowhere" is registered (valley) (measured: out/after-page-smoke-unknown.txt)
- **harness.js after the refactor**: The 12 gate lines are identical to harness-mine.txt. The separate verdict-timing line FAILED on the clock: 10.7 s mean, 1,564 s wall time at load about 150. The same engine file passed that line at 1.469 s earlier. (measured: out/after-harness.txt, out/gates-after.txt vs out/gates-ref.txt)
- **Sheet rules on the valley (AYSheet.check)**: No problems on either size: each of ties 0-1, 0-2, 0-6 and 0-7 meets the river exactly once; the ridge runs at y 0.285 to 0.315, inside 0.20 to 0.38 and below the crop (measured: inline jsc run; also inside page-smoke's places check)
- **Real browser (preview.html#valley-48213, port 8791)**: Opening, one closed day and a whole Life through to the Chronicle all render; state.place is 'valley'; no console messages (measured: Browser pane, 1280x800)
- **CPU cost of the lexicon**: No measurable change under the same load: new words.js 36.8 s CPU, published 37.2 s CPU, on the same Lives (measured: out/probe-words-only2.txt vs out/probe-before-same-load.txt)

## Shared changes needed

- Stakes and lines from life.params: W.opening and its lexicon template need B, C (and S, H) slots plus a params source, since the Opening has no Life yet. AYSheet.map's demo numbers need the same. app.js's strip needs HOLD_LINE and CHARTER instead of 0.5 and 1.05. charter.flow.rule, charter.rowRule and charter.flowAlt need {line} slots.
- Chooser, hash, stored lives and reload: snapshot() and restore() must carry state.place and call W.use. The hash parser must take the text before the first hyphen as the place when it is a registered key.
- A new place adds: one file places/\<id>.js calling AYPlaces.add with the valley's exact lexicon and charter key set (page-smoke checks it); one script tag after places/valley.js; its draw kinds in sheet.js's BARRIERS, FAR_LINES, CROSSINGS and BODIES tables when new; and a PLACE_RULES entry in page-smoke.js.
- New engine fields (stock levels, lastDay.ties lived/replayed, CHARTER 'breaks') need new lexicon keys. Add them to the valley too, so the key sets stay equal, and expect the words fingerprint to need re-baselining once a new word function exists.

## Open issues

- Both wall-clock limits failed on this machine because the parallel confirmation round kept about 90 to 100 jsc processes on 12 cores (load 120 to 190): page-smoke's 60 s total and harness's verdict-timing line. The untouched published page-smoke fails identically under the same load (284.1 s vs 268.6 s elapsed; 39.4 s vs 36.7 s CPU). Every content check, both fingerprints and all 12 gate lines pass. One rerun on a quiet machine is still owed to print the two clock PASS lines: cd after-you && jsc page-smoke.js, and jsc harness.js.
- REPORT.md was not written: the subagent harness refused report files. The full report is in summary.
- valleyIdentical is true on the evidence above: both fingerprints, the branch-complete diffs, byte-identical DOM-run output and the gates. The only checks not printing PASS are the clock limits, which fail equally for the published files under this load.
- Rule numbers are still typed in, which LEAD principle 3 forbids for later stages. The Opening's 'costs you 1 ... worth 3' is a valley sentence in the lexicon. The sheet's demo numbers are W.signed(-1) and W.signed(3) in AYSheet.map. The strip's line and ceiling are 0.5 and 1.05 in app.js. 'at least half', 'every fourth day' and 'twelve' sit in charter and opening sentences. All must come from life.params.
- Chooser-stage work not done here: the hash #\<place>-\<seed>; place on stored lives with a cap of 60; place in snapshot() and restore() (restore uses state.place, today always 'valley'); and changing place (state.place = id; W.use(id); fillStatic(); drawOpening()).
- page-smoke for a new place: each place needs a PLACE_RULES entry (today only 'neutral'); runPlace refuses a place without one. These assertions still test valley wording and will fail loudly for another place: opening lines 2 and 3, closeDay(4), the flowAlt regex, the markMeans gap, 'yours holds in', the last-day phrase, 'sent a hand / stayed home there once more', 'goes back to its own', 'had from you.', and 'N of M times'. The 60 s limit is still for the whole run. The leak list is not written.
- Any new word function (afterword, gauge words) will change 20bddf72, because page-smoke hashes every word function's output. From then on, compare the valley with golden-words-p1.js -- valley restricted to the 104 published function names, or re-baseline with a stated reason. diff-words.js stays valid for the 104.
- README.md is stale: it still describes three scripts, has no sheet.js or places/ in its file table, and says the variants' engine copies equal the top-level one. README and variants/ were left untouched.
- AYSheet.check covers sheet rules 1 and 2 and the known-draw-kinds part of rule 4. Rule 3 (notes and names inside the frame) needs a browser.

## Files changed

- after-you/engine.js
- after-you/words.js
- after-you/places/valley.js
- after-you/sheet.js
- after-you/app.js
- after-you/index.html
- after-you/page-smoke.js
- after-you/preview.html
- `<scratch>/places/page-p1/before/`
- `<scratch>/places/page-p1/golden-words-p1.js`
- `<scratch>/places/page-p1/golden-page-p1.js`
- `<scratch>/places/page-p1/dom-run-p1.js`
- `<scratch>/places/page-p1/diff-words.js`
- `<scratch>/places/page-p1/diff-drawings.js`
- `<scratch>/places/page-p1/diff-maps.js`
- `<scratch>/places/page-p1/check/`
- `<scratch>/places/page-p1/out/`
