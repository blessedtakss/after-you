> **Record of its time.** Written 2026-11-25 22:58 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Stage report: integrate

(Written by the lead from the stage's structured result: the subagent harness refused report files.)

Status: done

## Fingerprints

Valley sentences (page-p2 stream-words.js -- valley): fnv1a32 6d84219b over 382,559 sentences and 11,556,895 characters. This is identical line for line to stage 2.

Valley-only page (page-p1 golden-page-p1.js): page abf3fee6, maps 7a78d3e9, equal to stage 2. Per size:
- phone 48692bf0 / a80b5f11
- laptop 025ac673 / f3d5aeae
- tall 2b13eb85 / f3d5aeae

Valley walk with five places (page-p2 stream-page.js): page c8f9bb5d, maps 7a78d3e9. It is identical to stage 4 in all 168 steps. Per size:
- phone 28da0013 / a80b5f11
- laptop cc441f42 / f3d5aeae
- tall 9426ad5c / f3d5aeae

All five places (page-map golden-words.js, unmodified): fnv1a32 e6a4acd4 over 2,362,215 sentences and 74,778,296 characters. Stage 5 ended at 5b3a9f2b over 2,359,003. The added 3,212 are 3 Saltmarket season lines and one Watch Life with REPLAY 'season'.

page-map golden-page.js and the original dom-run.js both exit 3, as before.

harness.js: 12 gate lines identical to harness-mine.txt.

Final md5s:
- index 9d692282
- words 6379ccae
- sheet 7b36d3df
- app 52c123a4
- page-smoke 6b0a3245
- banks ff68d6f9
- watch ffff6de4
- saltmarket 12f1f489
- bridges bb98132d (unchanged)
- valley c0258324 (unchanged)
- engine 2fa86b59 (unchanged)

valleyIdentical: True

## Summary (the full report)

STAGE 6 (INTEGRATE): DONE. Every check passes on the final files, and the valley's fingerprints equal stage 2's. No git command that changes anything was run, and engine.js and harness.js are untouched. Labels: [m] measured (outputs in page-p6/out), [a] argued.

## 1. The changes asked for, judged

**Applied: the line for a seal withheld by the season replay (LEAD 4.2; asked for by the Watch and Saltmarket polishers)**
- words.js: a new function, `W.seasonRests(v)`. It throws unless `v.seal.wonOnSeason`, and reads `lexicon.lastSeason.rests`.
- app.js: `seasonLine(v)` makes one plain `<p id="chron-season">` right after the mark's noise line, only when the engine says so. index.html is unchanged, so the valley's page stays byte-identical.
- The season entry's numbers are never read. page-smoke enforces this: no `v.season`, `verdict.season` or `.season.<field>` in app.js or words.js, and exactly one `wonOnSeason` in app.js.
- page-smoke has a new feature group, `lastSeason`, required where REPLAY is 'season' and never in the valley.
  - A place may give it ahead of its rules (FEATURE_AHEAD). The Watch does, because LEAD 4.1 decides it takes the season replay after the page build.
  - Its Lives are then also played with `{REPLAY:'season'}` (PLACE_AHEAD_LIVES watch seed 13), so its line is read in play.
  - Each Life with the line checks: seal not earned; `season.from` is 9 (the words say "the last season"); no digit in the line.
  - The words must refuse any other verdict.
  - A place that gives the group must show the line and refuse it at least once.
- Words. I kept the polishers' wording, except one change to the ending of each line: their "those" and "which" could be read as pointing back at the earlier ways, so each now ends with "that".
  - Saltmarket: "The town's gain rests on what your stall did in the last season beyond the ways it had kept before, and no stall had yet sold beside that."
  - Watch: "The border's gain rests on what your tower did in the last season beyond the ways it had before, and no tower had yet lived with that."
- Seeds were found with check/season-seeds.js: Saltmarket seed 4 at full and small counts, and 23 at small counts; Watch seed 13 [m].

**Applied: the Bridges deck (sheet.js CROSSINGS.bridge)**
- The deck's half-width is now `b = L.lane + 2.4`; it was `L.cross * 0.8`. Only the Bridges draws a bridge.
- Both lanes of hands now run on the deck between the parapets (browser zooms, screens 06 and 23 [m]).
- check() still returns [] [m].

**Rejected (each with a reason)**
- **Moving the Watch tower body.** In the browser the Afterwards number "44" spans x 299.5-313.5 and the tower 300-310.5. The proposed tower (x+0.62w to 0.86w, so 305.3-315.8) would still sit under it, and the holding has no room further right [m, screen 10]. The halo keeps the number legible, as in the valley and the Banks.
- **The Bridges' daily count beside the day total.** It is not in LEAD 3.8, it needs a new feature group, and the laptop day is exactly 800 px.
- **Raising the east and west names (labelAt).** It would move the valley's maps, which LEAD 3.1 forbids. The overlap is the shared layout: a 7-letter name at a 320 px phone touches the barrier in every place, the valley included [m].
- **A text-box estimate of PAGE-MAP rule 3 inside AYSheet.check.** I measured rule 3 with real getBBox in the browser instead, over every map in every walk: 0 note or name boxes outside the frame, 0 notes on a holding [m]. An estimate rule risks false alarms.

## 2. Found and fixed

- **The Banks and the Watch at phone width.** The north mark's N sat on the Banks race (−3.5 px at a 400 px phone [m, screens 25-26]), and the Watch border touched it.
  - Both east reaches now take the Bridges' end points, [0.88, 0.815] and [1.03, 0.80].
  - N is now clear by 11.0-11.1 px at 368 px, 2.6-2.7 px at the 320 px enlargement and 36 px wide [m, getBBox].
  - Name gaps are unchanged and check() returns [].
  - Screens 27 and 33 show the result.
- **Unused `.seal-arch` rule** removed from index.html.
- **README.md** brought up to date: the five places, the `#<place>-<seed>` hash, places/ and sheet.js, 60 stored lives with their place, check times. It also now says the variants keep the v0.1.0 engine and code: on the same origin they relist all lives as the valley's and trim the shared list to 20 without places [a, from variants/b/app.js].
- preview.html regenerated.

## 3. Valley fingerprints against stage 2 [m]

- Valley sentences: 6d84219b over 382,559 sentences, identical line for line to stage 2.
- Valley-only page: abf3fee6 / 7a78d3e9, equal to stage 2.
- Five-place valley walk: c8f9bb5d, 0 changes from stage 4. It differs from stage 2's page hash only by the chooser added in stages 3-4.
- page-map golden-words over all five places: e6a4acd4, 2,362,215 sentences (stage 5: 5b3a9f2b, 2,359,003). It moved only because new sentences were added: 3 Saltmarket season lines and one Watch Life with the season replay. Every stage-5 sentence is still there, in order.

## 4. Real browser [m]

- Every place was played to its Chronicle at 1280x800 dark and at 400x800 light (11 Lives).
- Openings with the chooser were measured at 1366x700 and 1440x960.
- No console errors, no scrollbar on the 1280x800 day, and no horizontal scroll.
- The chooser, the hash, "Live another life", "Choose another place" and reload all work.
- Restore was tested through a host-hot shim in an iframe.
- Test lives were cleared, the viewport reset and the server stopped.

## Checks

- **page-smoke.js, all five places (final files)**: PASS. 212.7 s against a 300 s limit. 115 of 115 AYWords functions; 2,362,215 sentences; 309 hooks. Seals withheld by the season replay and told in a line: Saltmarket 3; Watch 1, played with REPLAY 'season' as an override. MEASURED (cd game && jsc page-smoke.js -> page-p6/out/final-page-smoke.txt)
- **page-smoke.js -- nowhere**: Refused with exit 3: no place "nowhere" is registered (valley, banks, watch, bridges, saltmarket). MEASURED (out/final-page-smoke-unknown.txt)
- **The new season-line checks are not vacuous (mutation test)**: 8 of 8 mutations were caught. They were: Saltmarket without its line; valley given a line; app.js never draws it; app.js draws it without wonOnSeason; words.js says it for any verdict; the line holds a digit; Watch words given ahead with no Life to read them; app.js reads v.season. MEASURED (python3 page-p6/check/mutate.py (shadow copies, never the game folder) -> out/mutate.txt)
- **harness.js**: Its 12 gate lines are identical to harness-mine.txt (empty diff). Verdict mean 1.044 s, PASS. 145 s. engine.js md5 2fa86b59 is unchanged. MEASURED (out/final-harness.txt, final-gates.txt, final-gates-diff.txt)
- **Valley sentences (page-p2 stream-words.js -- valley) against stage 2**: IDENTICAL line for line: 382,559 sentences, fnv1a32 6d84219b, 11,556,895 characters. This equals stage 2's recorded value. MEASURED (out/final-words-stream-valley.txt, out/final-same-valley-sentences.txt)
- **Valley-only page (page-p1/golden-page-p1.js) against stage 2**: page abf3fee6, maps 7a78d3e9. This equals stage 2's recorded value. MEASURED (out/final-golden-page-p1.txt)
- **Valley page walk with five places (page-p2 stream-page.js) against stage 4/5**: page c8f9bb5d, maps 7a78d3e9. 168 of 168 steps have the same maps and markup: 0 changes. It differs from stage 2's abf3fee6 only by the chooser (stages 3-4, explained there). MEASURED (out/final-page-stream.txt, out/final-diff-page.txt)
- **page-map/golden-words.js (unmodified), five places**: PASS inside; fnv1a32 e6a4acd4 over 2,362,215 sentences (stage 5 end: 5b3a9f2b over 2,359,003). Diff of the two streams: every stage-5 sentence is still there, in order. The 3,212 added sentences are 3 Saltmarket season lines plus one Watch Life with the season replay (3,209 sentences, one run, including the Watch's line). MEASURED (out/final-golden-words-pagemap.txt; out/stage5-words-stream-all.txt vs out/try2-words-stream-all.txt -> out/try2-diff-words-all.txt)
- **page-map/golden-page.js and the original `<scratch>/dom-run.js` (unmodified)**: Both exit 3: they cannot load places/ and sheet.js, as in stages 2-5. The adapted copies above replace them. MEASURED (out/final-golden-page-pagemap.txt, out/final-dom-run-original.txt)
- **Stand-in DOM: 6 valley configurations, 4 per new place, and Saltmarket seeds 4 and 10**: All 23 OK, exit 0. 1039 to 1652 checks each. Season lines 2 in Saltmarket seed 4 (both Chronicles) and 0 elsewhere, as the engine says. Meters below zero: Watch 2/25/8/2, Bridges 5. Lettering at least 11.14 px. MEASURED (page-p6/check/run-dom.sh (dom-run-p6.js = page-p4 copy + season-line check) -> out/final-dom.txt)
- **Stand-in DOM: chooser, hash, stored lives, restore (page-p4 dom-places-p4.js)**: All 6 PASS: two 17, hash-two 8, choose 232, hash 16, restore 21, store 12. MEASURED (out/final-dom-places.txt)
- **AYSheet.check, all five sheets (after the bridge deck and the Banks/Watch east reach)**: valley, banks, watch, bridges and saltmarket all return []. MEASURED (page-p4/check/sheet-probe.js -> out/final-sheet-probe.txt)
- **Colour contrast against the valley**: 0 of 11 pairs lower, light and dark, in all four places. MEASURED (out/final-contrast.txt)
- **Real browser 1280x800 dark: a whole Life to the Chronicle in each place**: Valley 48213, Banks 12 (restored mid-Life), Watch 3 (seal), Bridges 4 (seal), Saltmarket 4 (seal withheld by the season replay; its line shown right under the noise line). The day's scrollHeight is at most 800 in every state, so there is no scrollbar. No horizontal scroll. No note or name box outside the frame or on a holding (getBBox). No console messages. MEASURED (Browser pane, preview.html#\<place>-\<seed>; screens 01-14)
- **Real browser 400x800 light: a whole Life to the Chronicle in each place**: Saltmarket 10 (seal) and 4 (season line), Watch 4 (seal, store below zero drawn), Bridges 1 (seal), Banks 31, Valley 7. scrollWidth stays 400 throughout. Begin ends at 625-670, on the first screen. No note boxes out. No console messages. MEASURED (screens 15-29, 33)
- **Real browser: Openings with the chooser at 1366x700 and 1440x960**: Chooser is one row (40 px) in every place. 1440x960, light and dark, 6 earlier lives: every Opening is 960, no scroll. 1366x700 with no lives: every Opening is exactly 700. With 6 lives listed it is 751-784, the valley highest. Begin is at 575-608, on the first screen. MEASURED (Browser pane; screens 30-32)
- **Real browser: the day at 1366x700 and 1440x960**: 1440x960: Bridges and Banks whole Lives stay at 960, no scroll. 1366x700: every closed day scrolls in every place, the valley included (valley 723-768). The Bridges reaches 788. Banks and Saltmarket also scroll 6-20 px in some open or chosen states. MEASURED; that the valley's own scroll is the published behaviour is ARGUED (same markup per golden-page, CSS diff since v0.1.0 adds place-only rules) (Browser pane, __walk logs)
- **Chooser, hash, 'Live another life', 'Choose another place', reload**: All work. Chooser to Bridges: words, data-place and sheet change. #bridges-4 on the Opening fixes the seed; a hash change during a Life is only recorded. 'Live another life' stays in Bridges with a new seed. 'Choose another place' opens the Opening focused on the place in hand. Plain reload goes to the hash's Opening. Host-hot reload (snapshot shim in an iframe): a Banks Life at day 7 with 2 pending choices is rebuilt exactly (purse 116), even under #watch-3. A Chronicle snapshot is not listed twice. MEASURED (Browser pane; screen 12)
- **Browser cleanup**: localStorage started empty. The 42 test entries were removed at the end, along with every sessionStorage key used. The viewport was reset to desktop and the preview server was stopped. MEASURED (Browser pane)
- **Size and artifact constraints**: Page files total 462,721 bytes (index 62,640; engine 108,890; words 47,253; sheet 50,571; app 89,469; places 103,898). No external scripts; relative paths only; index.html stays content-only (the hooks pass). MEASURED (out/final-sizes.txt, page-smoke hooks)

## Shared changes needed

- None outstanding from this stage.
- When the Watch takes REPLAY 'season' (LEAD 4.1, an engine.js preset change), the page needs no edit. The Watch's line is already given and read in page-smoke (seed 13). PLACE_SEAL_SEEDS {watch: [4]} still seals under the season replay, at mark 7.9 [m: out/season-seeds-watch-1-26.txt]. At that point, PLACE_AHEAD_LIVES.watch becomes inert and can be removed.

## Open issues

- REPORT.md was not written: my agent rules forbid report files. The summary is the full report.
- At 1366x700 the laptop day scrolls after a day is closed in every place, the valley included: valley 723-768, Banks up to 750, Watch 770, Bridges 788, Saltmarket 758 [m]. Banks (706-720) and Saltmarket (706) also scroll in some open or chosen states, which the valley did not [m]. The valley's scroll there is the published behaviour [a: same markup per golden-page, and the CSS added since v0.1.0 is place-only]. 1280x800 and 1440x960 have no scroll [m]. The review round should decide whether 700-tall laptops are a target.
- At 1366x700, the Opening with earlier lives listed is 751-784 px tall (the valley most); without lives it is exactly 700. Begin is always on the first screen [m].
- seal.wonOnSeason can be true when the house is short: Watch seed 13 under the season override [m]. The line then shows, as LEAD 4.2 says (only when wonOnSeason), and stays true about the gain, though the seal was out of reach anyway. The lead may prefer to show it only when the seal would otherwise have been earned.
- Restoring a snapshot taken at the Chronicle lands at the Afterwards' end, with 'See the count'. It does not reopen the Chronicle, and the life is not listed twice [m]. This is the valley's restore logic, unchanged.
- A 7-letter east or west name (Dunmore, Garrow, Yarrow) touches the barrier at a 320 px phone in every place, the valley included [m, getBBox]. Fixing it needs a shared labelAt change that would move the valley's maps.
- Not walked in a real browser: a 320 px phone, and whole Lives at 1366x700 and 1440x960 in every place. Days at 1366x700 were walked in all five; whole Lives at 1440x960 only for Bridges and Banks.
- The variants (v0.1.0 code), served from the same origin, rewrite the shared lives list without places and keep only 20. This is documented in README; the variants were left alone.
- The adapted harness copies (page-p1 golden-page-p1, page-p2 stream-*, page-p4 dom-*, page-p6 dom-run-p6) are the working checks. The unmodified page-map/golden-page.js and `<scratch>/dom-run.js` cannot load the page (exit 3).

## Files changed

- after-you/words.js
- after-you/app.js
- after-you/page-smoke.js
- after-you/sheet.js
- after-you/index.html
- after-you/places/saltmarket.js
- after-you/places/watch.js
- after-you/places/banks.js
- after-you/README.md
- after-you/preview.html
- `<scratch>/places/page-p6/check/` (run-final.sh, run-dom.sh, dom-run-p6.js, season-seeds.js, mutate.py)
- `<scratch>/places/page-p6/out/`
- `<scratch>/places/page-p6/screens/`
- `<scratch>/places/page-p6/before/`
