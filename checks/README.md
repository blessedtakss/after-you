# Checks

These are the checks that After You's version 2 was built with, kept so that later changes can be held to them. They hold the valley to what was published, play every place's page through a stand-in DOM, and measure each place's design gates. They need only the `jsc` shell that ships with macOS and Python 3 (for five comparisons and the preview check); nothing is installed, and Node is not used.

Every shell script finds the repository from its own location, so it can be started from any folder. `jsc` is not on the PATH: the scripts use `/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc`, and the environment variable `JSC` overrides that path. Where a command below says `jsc`, type that full path (or `"$JSC"`). Outputs go to `checks/out/` (the page check run's to `checks/out/run-all/`), which git ignores. Like `harness.js`, several outputs contain spoilers (the engine's own measurements).

The times below were measured on an Apple M4 Pro with other checks running beside them; on a quiet machine they are a little shorter.

## At a glance

| Check | What it proves | Command | Time | Passing looks like |
| --- | --- | --- | --- | --- |
| The page check run | Every page check below, with the valley's sentences, page and maps, every place's words, every drawing of every place's sheet and a whole Life's page and maps in every place compared line for line with a tagged version, and `preview.html` checked against `index.html` | `checks/run-all.sh` | about 8 min | last line `RUN-ALL: PASS (14 of 14 checks, against v0.2.0, … s)`, exit 0 |
| Valley identity | `engine.js` plays the valley exactly as v0.1.0's engine did, output for output | `checks/engine/run-identity.sh` | about 4 min | `PASS  the valley is unchanged`, exit 0 |
| Design gates, smoke | The gate lab runs on all five places with the final ways of playing, and shows roughly where each stands | `checks/engine/run-gates.sh smoke` | about 2 min | ends `smoke run finished in … s`, exit 0 (the smoke counts are too small to judge the gates) |
| Design gates, full | PG1 to PG14 for a place at the full counts, read by the lead's rule | `checks/engine/run-gates.sh full banks` (or `watch`, `bridges`, `saltmarket`, `all`) | 5 to 11 min a place | `READ: PASS  for banks …`, exit 0 |
| Design gates, pooled | The same, with the seals on 200 seeds so that PG10's ratio part and PG11's seal bounds are read too | `checks/engine/run-gates.sh full banks --pool` | 15 to 40 min a place | `READ: PASS … PG10 and PG11 read on 200 pooled seeds` |
| Browser tools | Page heights and block positions in a real browser, through whole Lives | pasted into the console of `preview.html` | about 15 s a Life | numbers to read; no verdict |

The values these checks gave on v0.2.0 are in [BASELINE.md](BASELINE.md).

## When to run which

- **A words change** (`words.js`, a place's lexicon or afterword in `places/`): `checks/run-all.sh`. The valley's sentence stream and both valley page fingerprints must stay identical unless the valley's own words were meant to change. The words fingerprint over all places changes with any place's words: compare `checks/out/run-all/golden-words-table.txt` with `checks/out/run-all/ref-golden-words-table.txt` to see which word functions moved. Every place's walk (part 12) fails with them too, because the page carries the words, and so do the sheet drawings (part 10) where a map's lettering changes; their diffs name the place and the step or drawing. While working, `jsc page-smoke.js -- <place>` checks one place in under a minute.
- **A page or map change** (`app.js`, `index.html` and its styles, `sheet.js`, a place's `sheet` in `places/`): `checks/run-all.sh` (the stand-in DOM, the walks, the sheet probe, the colours). Any change to what a map draws in any place fails the sheet drawings (part 10: each mode of each place's map on both sheets, with fixed options) and every place's walk (part 12: the maps and markup as a whole Life shows them); if the change was meant, read the diffs, then tag it and record the new hashes. After any change to `index.html`, rebuild `preview.html` (the page as the host wraps it, which local browsers open) with `python3 checks/page/preview.py --write`; part 13 fails while it is stale. The stand-in DOM lays nothing out, so also look at the page in a real browser at 1280x800, 1366x700, 1440x960 and 400x800, light and dark, through a whole Life, with the browser tools for the heights.
- **An engine or preset change** (`engine.js`, `AfterYou.PLACES`): `checks/engine/run-identity.sh` (the valley must stay identical to v0.1.0), `checks/engine/run-gates.sh smoke`, then `checks/engine/run-gates.sh full <place>` for each place that changed (with `--pool` to read PG10 and PG11), and `checks/run-all.sh`, since `page-smoke.js` and `harness.js` play the engine and the page shows its numbers.
- **Before tagging a release**: all of the above. After tagging, `checks/run-all.sh <new tag>` prints the new tag's hashes in its "Hashes" block; record them in `BASELINE.md`.

## The page check run

```bash
checks/run-all.sh            # against v0.2.0
checks/run-all.sh v0.3.0     # against another tag, branch or commit (or set AY_REF)
```

The reference streams are never stored in the repository. `run-all.sh` extracts the ref with `git archive` into a temporary folder, runs the same check scripts there (the working tree's copies of them), runs them again on the working tree, and compares the two line for line, printing both hashes. Long runs go five at a time, the stand-in DOM four at a time, and the words fingerprint last, two at a time, because it keeps `page-smoke.js`'s own time limit. It ends with a PASS or FAIL line for each of its fourteen parts and an overall line, and exits 1 if any part fails (2 if it cannot start: no `jsc`, no `python3`, or an unknown ref). The run writes its outputs, about 75 MB of them streams, to `checks/out/run-all/`, which it empties first (`RUN_ALL_OUT=<folder>` names another one, relative to the folder the run is started from; since the run empties it too, it must be new, empty, or one an earlier run wrote, and any other folder is refused); when a place's walk differs from the ref's, that place's walk is also dumped at both versions (about 20 to 30 MB each) and compared step by step.

Each part can also be run on its own, from the repository root:

| Part | What it proves | Command | Time | Passing looks like |
| --- | --- | --- | --- | --- |
| 1. `page-smoke.js` | All five places played as the page would, every word function called, every sentence checked against its rules | `jsc page-smoke.js` | about 4 min | `PAGE SMOKE: PASS` |
| 2. An unknown place | `page-smoke.js` refuses a place that is not registered instead of checking nothing | `jsc page-smoke.js -- nowhere` | 1 s | an error naming `no place "nowhere" is registered`, and a non-zero exit |
| 3. `harness.js` gates | The twelve gate lines (G1 to G10, X1, X2) are the same as at the ref | `jsc harness.js` | about 2.5 min | 12 lines, all `PASS` on v0.2.0 |
| 4. The valley's sentence stream | Every sentence `page-smoke.js` checks in the valley (382,559 of them, in order) is byte for byte the ref's | `jsc checks/page/stream-words.js -- valley > checks/out/words.txt`, then `python3 checks/page/same-sentences.py checks/out/ref-words.txt checks/out/words.txt` | about 30 s | `IDENTICAL, line for line` |
| 5. The valley-only page | The page's markup and its four maps at every step of one whole valley Life, at three window sizes, with only the valley's files loaded | `jsc checks/page/golden-page.js` | 3 s | `GOLDEN PAGE (valley 48213, send unless left short): page abf3fee6, maps 7a78d3e9` |
| 6. The five-place valley walk | The same walk with every place's files loaded, in `index.html`'s order, compared step by step | `jsc checks/page/stream-page.js > checks/out/walk.txt`, then `python3 checks/page/diff-page-stream.py checks/out/ref-walk.txt checks/out/walk.txt` | 3 s, and a few seconds to compare | `distinct changes: 0` |
| 7. The words fingerprint, all places | One hash over every sentence `page-smoke.js` checks in all five places, and a table of sentences and sentence shapes per word function | `jsc checks/page/golden-words.js > checks/out/golden-words.txt`, then compare its lines from `GOLDEN (valley` on with the ref's (the lines above them include the run's time) | about 4 min | the same `fnv1a32` and table as the ref |
| 8. The stand-in DOM | `app.js` through whole Lives in 27 configurations (window sizes, places, ways of playing, stored lives, the seal and season-line cases), about 1,100 to 1,700 checks each, with a second Life and the way back to the chooser | `checks/page/run-dom.sh` | 20 s | `ALL OK` |
| 9. Chooser, hash, store, restore | The choice of places, the `#place-seed` address, the stored lives and the reload snapshot, in six scenarios | `checks/page/run-dom-places.sh` | 11 s | six `PASS` lines |
| 10. The sheet rules and drawings | Each place's sheet keeps its own rules (`AYSheet.check`) and hits all four crossings, and every drawing of it is the ref's: on the wide and the compact sheet, the map in each mode (the Opening, the day open, the same cut for a phone, the day closed, the same lettered up, Leaving, the Afterwards) with fixed options that reach every kind of hand and the sister's dealings, then the dealing glyphs, the keys, the seal and a place's gauges, each as a length and an `fnv1a32` | `jsc checks/page/sheet-probe.js > checks/out/sheet-probe.txt`, then `diff checks/out/ref-sheet-probe.txt checks/out/sheet-probe.txt` | 1 s | `check []` for each place, no `BAD` or `(no hit)`, last line `SHEET PROBE: 5 places, 103 drawings, fnv1a32 035800f1` on v0.2.0, and no difference from the ref |
| 11. Colour contrast | No colour pair a place moves is lower in contrast than the valley's, in light or dark | `python3 checks/page/contrast.py index.html banks` (and `watch`, `bridges`, `saltmarket`) | under 1 s | `pairs lower than the valley: 0` |
| 12. Every place's walk | One whole Life in each registered place (seed 48213, sending unless left short, at the three window sizes of part 5: 168 steps a place), with the page's markup and the four maps fingerprinted at every step, the same as the ref's step by step | `jsc checks/page/stream-page.js -- all steps > checks/out/walks.txt`, then `python3 checks/page/diff-walks.py checks/out/ref-walks.txt checks/out/walks.txt` | about 17 s, and under a second to compare | `places that differ: 0` |
| 13. `preview.html` current | `preview.html`, in the game folder and in each variant, is exactly its `index.html` inside the skeleton the host adds when it publishes (doctype, utf-8 charset, viewport, base styles), so a local browser shows what the published page shows | `python3 checks/page/preview.py` (`--write` rebuilds them) | under a second | `previews stale: 0 of 4`, exit 0 |
| 14. Nothing changed under the run | The game files were the same at the end of the run as at its start | (md5 inside `run-all.sh`) | | |

Parts 4 to 7, 10 and 12 load the game's files by relative path, so they are run from the folder being checked; outside the repository root, tell them where the checks are with `jsc -e "var CHECKS_DIR='<path to checks>'" …`. Parts 5, 6 and 12 use the stand-in DOM in `checks/page/domshim.js`; parts 8 and 9 use the one in `checks/page/dom-harness.js`. Neither lays anything out: widths come from rules of thumb and timers are stepped by hand.

**The ref's side, by hand.** Parts 4, 6, 7, 10 and 12 compare the working tree with the ref, and `run-all.sh` makes the ref's side itself. To run one of them alone, make the ref's side as `run-all.sh` does: extract the ref with `git archive` into a temporary folder and run the working tree's check script there. From the repository root, in zsh or bash:

```bash
JSC=${JSC:-/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc}
CK="$PWD/checks"; mkdir -p checks/out
REF=$(mktemp -d) && git archive v0.2.0 | tar -x -C "$REF"
(cd "$REF" && "$JSC" "$CK/page/stream-words.js" -- valley) > checks/out/ref-words.txt                              # part 4
(cd "$REF" && "$JSC" -e "var CHECKS_DIR='$CK'" "$CK/page/stream-page.js") > checks/out/ref-walk.txt                 # part 6
(cd "$REF" && "$JSC" "$CK/page/golden-words.js") > checks/out/ref-golden-words.txt                                  # part 7 (about 4 min)
(cd "$REF" && "$JSC" "$CK/page/sheet-probe.js") > checks/out/ref-sheet-probe.txt                                    # part 10
(cd "$REF" && "$JSC" -e "var CHECKS_DIR='$CK'" "$CK/page/stream-page.js" -- all steps) > checks/out/ref-walks.txt   # part 12
rm -rf "$REF"
```

Keep only the lines of the parts wanted. Then make the working tree's side with the table's command (`"$JSC"` for `jsc`) and compare as the table says. For part 7, `diff <(sed -n '/^GOLDEN (valley/,$p' checks/out/ref-golden-words.txt) <(sed -n '/^GOLDEN (valley/,$p' checks/out/golden-words.txt)` prints nothing when the fingerprint and its table are the ref's. (`CHECKS_DIR` is a JavaScript string in single quotes, so a checks path with a `'` in it would need escaping; `run-all.sh` does that.)

**Reading a failure.** A fingerprint that differs means something the valley shows (or, in part 7, any place's words; in parts 10 and 12, any place's maps or page) is no longer what the ref shows. `checks/out/run-all/same-valley-sentences.txt` gives the first sentence that differs and `checks/out/run-all/diff-page-stream.txt` every distinct change in the valley's markup with the steps it appears in. `sheet-probe-diff.txt` names each drawing that moved (place, sheet and mode). `diff-walks.txt` gives, for each place, the steps with the same maps and markup and the first step where each differs; for each place that differs, `diff-walk-<place>.txt` lists every distinct change with the steps it appears in. `preview.txt` names each stale `preview.html`. If the change was meant, commit and tag it, then run against the new tag and record its hashes in `BASELINE.md`.

## The engine checks

### Valley identity

```bash
checks/engine/run-identity.sh          # against v0.1.0's engine
checks/engine/run-identity.sh v0.2.0   # against another ref's engine
```

`identity.js` loads the earlier engine (taken out of git with `git show <ref>:engine.js` into a temporary file) and the working tree's `engine.js` side by side, plays 472 valley Lives in both with five ways of playing (always, never, forgiving, careful with a last-day grab, a keyed coin), and compares every `today()`, `playDay()`, `ways()`, `legacy()`, whole Life state, `verdict()`, `runFuture()` and `project()` as JSON: 19,856 comparisons and 61.5 MB of JSON. It also spells out every new place parameter at its default, writes the valley's seats and range out explicitly, and makes the valley by its key (`createLife(seed, 'valley')`) as the page does. Passing: `PASS  the valley is unchanged`, `0 differ`.

### The per-place design gates

```bash
checks/engine/run-gates.sh smoke                  # all five places at the smoke counts
checks/engine/run-gates.sh full banks             # one place at the full counts, then the reading
checks/engine/run-gates.sh full all               # the four new places, three at a time (JOBS=n to change)
checks/engine/run-gates.sh full watch --pool      # the seals on 200 pooled seeds
```

The gate lab (`placelab.js`) measures fourteen design gates for a place, each by its preset key (`createLife(seed, key)`): PG1 honest play keeps the house; PG2 the last days do not buy the seal; PG3 the reference ways are spread apart; PG4 no trivial way is best; PG5 determinism with the dials on; PG6 a habit matters; PG7 not a lottery; PG8 the mirror shows; PG9 the situations come up; PG10 no recipe; PG11 a trade exists; PG12 different from the valley; PG13 the page's numbers are sane; PG14 the cost of a verdict. Its seeds are its own fixed bands from 100001 up.

The ways of playing are the ones the final rounds used, set up as the confirmation round set them up (`final-ways.js`, with the policy files in `ways/`):

| Place | Honest | Selfish act on the last days | Battery |
| --- | --- | --- | --- |
| valley | careful | stay home (the grab) | placelab's 16 |
| banks | the peacemaker (`ways/banks.js`) | fish across where it pays | placelab's 16 and one of the Banks' own: 17 |
| watch | first to stand down, second chances (`ways/watch.js`) | keep watch unless answered | placelab's 16 and the Watch's 5: 21 |
| bridges | take turns, at the jams too (`ways/bridges.js`, with `bridges-tuner.js` and `bridges-breaker.js`) | cross while you can | the fixer's 57 |
| saltmarket | never puts the price back (`ways/saltmarket.js`) | hold on, keeping the price where honest would cut it | placelab's 16 and the Saltmarket's 3: 19 |

The full counts are 2000 Lives for kept rates, 40 seeds at 2000/1000 futures for seals, 12 grid seeds and 120 seeds for the spread, habit, lottery and mirror gates; the Watch keeps the two counts its fixer raised (PG12's pulls on 200 seeds and its seal grid on 24).

**The reading** (sections 2.6 and 4.3 of the design lead's decisions, [docs/places/LEAD-DECISIONS.md](../docs/places/LEAD-DECISIONS.md), printed after placelab's own table): PG10's ratio part and PG11's seal floor and ceiling are read on at least 200 pooled seeds. On placelab's 40-seed band they are reported and not read, because a 40-seed band is noise, not a failure; `--pool` measures 200. On a pool, the ratio is judged only for policies with at least 20 kept Lives in it, and a policy is over the line only when its seal/kept is above 0.8 by more than two standard errors (`sqrt(p(1-p)/kept)`). The Watch may miss PG12's rank agreement when the other two parts pass (placelab applies this). PG12 does not apply to the valley, which is what it measures every place against; the valley's own play is held by the identity proof. PG14 is timed on the machine as it is; the lead reads it on a quiet machine. The last line is `READ: PASS` or `READ: FAIL` with the gates that failed.

Testing something else: `GATES_ENGINE=<file>` tests another engine file, `GATES_WAYS=placeholder` uses placelab's own placeholder policies (as the first gate runs did), and `GATES_OPTS='<json>'` passes more options to `gates()`, for example `'{"only":["PG1","PG9"]}'`.

**The valley's reference data.** PG12 compares each place with two measurements of the valley kept beside the lab: `valley-best.js` (the valley's best fixed way by seal, from 243 ways on 24 seeds) and `valley-pulls-data.js` (the valley's pulls by situation, careful on 200 seeds). From the repository root, `mkdir -p checks/out`, then `jsc checks/engine/valley-pulls.js` (about 20 s) or `jsc checks/engine/valley-seal-grid.js` (about 14 minutes) measures them again into `checks/out/`, never over the kept files, so the two can be compared with `cmp`.

## The browser tools

`checks/browser/autoplayer.js` and `checks/browser/stepper.js` run in the real page. Serve the repository as the main README says (`python3 -m http.server 8796 --bind 127.0.0.1`), open http://127.0.0.1:8796/preview.html at the window size to check, open the browser's developer console, paste the whole text of one file and press Enter. Then:

```js
__queue([['valley', 48213, 'tft'], ['banks', 12, 'send'], ['watch', 45, 'never']]);   // autoplayer.js
__state            // 'running', 'done n of m', then 'finished'
__fmt()            // one line per Life
await __step('bridges', 4, 'late', 6, true);   // stepper.js: place, seed, way, day, closed (true) or open (false)
```

- **autoplayer.js** plays whole Lives through the page's own controls, from the Opening (it returns there through "Choose another place"). For each Life it records `document.scrollingElement.scrollHeight` in every state of every day (open, four choices made, closed, at the season's end), at Leaving, at the end of the Afterwards and at the Chronicle, the widest `scrollWidth` of the closed days, whether the seal was earned, and whether the Chronicle shows the season line. A height above the window's height means the page scrolls in that state; a `scrollWidth` above the window's width means a horizontal scrollbar. The ways of playing: `tft`, `stft`, `mix`, `alt`, `late`, `send`, `never`.
- **stepper.js** plays one Life to a given day, open or closed, and returns where each block of the day ends (`day-track`, `store`, the map, `ways`, `day-status`, `day-actions`, `cards`, `season-end`, `elsewhere`, `ford-note`, each card) and the page's `scrollHeight`, so the tallest column and what fills it can be read. `__layout()` reports the same for the page as it stands.

They give numbers, not a verdict. Each Life takes about 15 seconds by the tools' own pauses.

## Files

| Path | Role |
| --- | --- |
| `run-all.sh` | The page check run. |
| `BASELINE.md` | The values the checks gave on v0.2.0. |
| `page/stream-words.js`, `page/same-sentences.py` | The valley's sentence stream (page-smoke.js with one hook) and its line-for-line comparison. |
| `page/golden-page.js` | The valley-only page and maps fingerprint. |
| `page/stream-page.js`, `page/diff-page-stream.py` | A place's walk (the valley's unless another is named), dumped step by step, and its comparison; `-- all steps` lists every place's walk as one fingerprint line per step. |
| `page/diff-walks.py` | The comparison of two such listings, place by place. |
| `page/golden-words.js` | The words fingerprint over all places. |
| `page/domshim.js` | The stand-in DOM for the fingerprints. |
| `page/dom-harness.js` | The stand-in DOM for the page checks. |
| `page/dom-run.js`, `page/dom-policies.js`, `page/run-dom.sh` | A whole Life through `app.js`, the new places' honest ways of playing in `page-smoke.js`'s form, and the 27 configurations. |
| `page/dom-places.js`, `page/run-dom-places.sh` | The chooser, hash, store and restore scenarios. |
| `page/sheet-probe.js` | Every place's sheet by its own rules, and every drawing of it as a fingerprint. |
| `page/contrast.py` | The colour contrast of each place against the valley. |
| `page/preview.py` | Checks, or with `--write` rebuilds, each `preview.html` from its `index.html`. |
| `engine/identity.js`, `engine/run-identity.sh` | The valley-identity proof. |
| `engine/placelab.js` | The gate lab. |
| `engine/lab.js`, `engine/gates-full.js`, `engine/gates-smoke.js`, `engine/run-gates.sh` | The gate runs and the lead's reading. |
| `engine/final-ways.js`, `engine/ways/` | The final rounds' ways of playing for each place. |
| `engine/valley-best.js`, `engine/valley-pulls-data.js` | The valley's reference data for PG12. |
| `engine/valley-seal-grid.js`, `engine/valley-pulls.js` | Measure that data again. |
| `browser/autoplayer.js`, `browser/stepper.js` | The browser tools. |

## Not kept here

The design rounds also used many one-off probes, scans, parameter sweeps, intermediate engines, the confirmation round's attack batteries (86 policies for the Banks, the breakers' schemes for the Saltmarket and the Watch) and mutation tests of the page. They answered questions that are settled, and their findings are in the design notes ([../docs/README.md](../docs/README.md)). The earlier engine for the identity proof comes from git, not from a copy.
