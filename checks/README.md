# Checks

These are the checks that After You's version 2 was built with, kept so that later changes can be held to them. They hold the valley to what was published, play every place's page through a stand-in DOM, and measure each place's design gates. They need only the `jsc` shell that ships with macOS and Python 3 (for five comparisons and the preview check); nothing is installed, and Node is not used.

Every shell script finds the repository from its own location, so it can be started from any folder. `jsc` is not on the PATH: the scripts use `/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc`, and the environment variable `JSC` overrides that path. Where a command below says `jsc`, type that full path (or `"$JSC"`). Outputs go to `checks/out/` (the page check run's to `checks/out/run-all/`), which git ignores. Like `harness.js`, several outputs contain spoilers (the engine's own measurements).

The times below were measured on an Apple M4 Pro with other checks running beside them; on a quiet machine they are a little shorter.

## At a glance

| Check | What it proves | Command | Time | Passing looks like |
| --- | --- | --- | --- | --- |
| The page check run | Every page check below, with the valley's sentences, page and maps, every place's words, every drawing of every place's sheet and a whole Life's page and maps in every place compared line for line with a tagged version, `preview.html` checked against `index.html`, and the motion and the sound held to their contract | `checks/run-all.sh` | about 8 min | last line `RUN-ALL: PASS (15 of 15 checks, against v0.2.0, … s)`, exit 0 |
| The motion and the sound (part 15 alone) | `motion.js` and `sound.js` against their contract: the payloads app.js hands them, the timings, a missing act the same whatever its cause, the calendar, and a page exactly the same with them as without them | `jsc checks/page/motion-sound.js` | about 70 s (20 s for one place) | last line `MOTION-SOUND: PASS (…) fnv1a32 …`, exit 0 |
| Valley identity | `engine.js` plays the valley exactly as v0.1.0's engine did, output for output | `checks/engine/run-identity.sh` | about 4 min | `PASS  the valley is unchanged`, exit 0 |
| Design gates, smoke | The gate lab runs on all five places with the final ways of playing, and shows roughly where each stands | `checks/engine/run-gates.sh smoke` | about 2 min | ends `smoke run finished in … s`, exit 0 (the smoke counts are too small to judge the gates) |
| Design gates, full | PG1 to PG14 for a place at the full counts, read by the lead's rule | `checks/engine/run-gates.sh full banks` (or `watch`, `bridges`, `saltmarket`, `all`) | 5 to 11 min a place | `READ: PASS  for banks …`, exit 0 |
| Design gates, pooled | The same, with the seals on 200 seeds so that PG10's ratio part and PG11's seal bounds are read too | `checks/engine/run-gates.sh full banks --pool` | 15 to 40 min a place | `READ: PASS … PG10 and PG11 read on 200 pooled seeds` |
| Browser tools | Page heights and block positions in a real browser, through whole Lives | pasted into the console of `preview.html` | about 15 s a Life | numbers to read; no verdict |

The values these checks gave on v0.2.0 and v0.3.0 are in [BASELINE.md](BASELINE.md).

## When to run which

- **A words change** (`words.js`, a place's lexicon or afterword in `places/`): `checks/run-all.sh`. The valley's sentence stream and both valley page fingerprints must stay identical unless the valley's own words were meant to change. The words fingerprint over all places changes with any place's words: compare `checks/out/run-all/golden-words-table.txt` with `checks/out/run-all/ref-golden-words-table.txt` to see which word functions moved. Every place's walk (part 12) fails with them too, because the page carries the words, and so do the sheet drawings (part 10) where a map's lettering changes; their diffs name the place and the step or drawing. While working, `jsc page-smoke.js -- <place>` checks one place in under a minute.
- **A page or map change** (`app.js`, `index.html` and its styles, `sheet.js`, a place's `sheet` in `places/`): `checks/run-all.sh` (the stand-in DOM, the walks, the sheet probe, the colours). Any change to what a map draws in any place fails the sheet drawings (part 10: each mode of each place's map on both sheets, with fixed options) and every place's walk (part 12: the maps and markup as a whole Life shows them); if the change was meant, read the diffs, then tag it and record the new hashes. After any change to `index.html`, rebuild `preview.html` (the page as the host wraps it, which local browsers open) with `python3 checks/page/preview.py --write`; part 13 fails while it is stale. The stand-in DOM lays nothing out, so also look at the page in a real browser at 1280x800, 1366x700, 1440x960 and 400x800, light and dark, through a whole Life, with the browser tools for the heights.
- **A motion or sound change** (`motion.js`, `sound.js`, their blocks in `index.html`'s style sheet, the cues in `app.js`): `jsc checks/page/motion-sound.js` while working (with a place's name after `--`, that place alone, in about 20 seconds), then `checks/run-all.sh`. A change to the cues in `app.js` must leave every fingerprint as it was: the page never needs the modules, and parts 5, 6 and 12 load them or not without a difference. Also look and listen in a real browser (the matrix in section 7 of the motion and sound design), since the stand-in DOMs run no real animation or audio.
- **An engine or preset change** (`engine.js`, `AfterYou.PLACES`): `checks/engine/run-identity.sh` (the valley must stay identical to v0.1.0), `checks/engine/run-gates.sh smoke`, then `checks/engine/run-gates.sh full <place>` for each place that changed (with `--pool` to read PG10 and PG11), and `checks/run-all.sh`, since `page-smoke.js` and `harness.js` play the engine and the page shows its numbers.
- **Before tagging a release**: all of the above. After tagging, `checks/run-all.sh <new tag>` prints the new tag's hashes in its "Hashes" block; record them in `BASELINE.md`.

## The page check run

```bash
checks/run-all.sh            # against v0.2.0
checks/run-all.sh v0.3.0     # against another tag, branch or commit (or set AY_REF)
```

The reference streams are never stored in the repository. `run-all.sh` extracts the ref with `git archive` into a temporary folder, runs the same check scripts there (the working tree's copies of them), runs them again on the working tree, and compares the two line for line, printing both hashes. Long runs go five at a time, the stand-in DOM four at a time, and the words fingerprint last, two at a time, because it keeps `page-smoke.js`'s own time limit. It ends with a PASS or FAIL line for each of its fifteen parts and an overall line, and exits 1 if any part fails (2 if it cannot start: no `jsc`, no `python3`, or an unknown ref). The run writes its outputs, about 75 MB of them streams, to `checks/out/run-all/`, which it empties first (`RUN_ALL_OUT=<folder>` names another one, relative to the folder the run is started from; since the run empties it too, it must be new, empty, or one an earlier run wrote, and any other folder is refused); when a place's walk differs from the ref's, that place's walk is also dumped at both versions (about 20 to 30 MB each) and compared step by step.

Each part can also be run on its own, from the repository root:

| Part | What it proves | Command | Time | Passing looks like |
| --- | --- | --- | --- | --- |
| 1. `page-smoke.js` | All five places played as the page would, every word function called, every sentence checked against its rules; and of the page's files: no theory word in `motion.js` or `sound.js` (comments included), every byte of `index.html`, `app.js`, `words.js`, `sheet.js`, the places and the two modules below 0x80, the cue that builds nothing while no module listens and the quiet restore in `app.js`, every registered track under `music/` | `jsc page-smoke.js` | about 4 min | `PAGE SMOKE: PASS` |
| 2. An unknown place | `page-smoke.js` refuses a place that is not registered instead of checking nothing | `jsc page-smoke.js -- nowhere` | 1 s | an error naming `no place "nowhere" is registered`, and a non-zero exit |
| 3. `harness.js` gates | The twelve gate lines (G1 to G10, X1, X2) are the same as at the ref | `jsc harness.js` | about 2.5 min | 12 lines, all `PASS` on v0.2.0 |
| 4. The valley's sentence stream | Every sentence `page-smoke.js` checks in the valley (382,559 of them, in order) is byte for byte the ref's | `jsc checks/page/stream-words.js -- valley > checks/out/words.txt`, then `python3 checks/page/same-sentences.py checks/out/ref-words.txt checks/out/words.txt` | about 30 s | `IDENTICAL, line for line` |
| 5. The valley-only page | The page's markup and its four maps at every step of one whole valley Life, at three window sizes, with only the valley's files loaded | `jsc checks/page/golden-page.js` | 3 s | `GOLDEN PAGE (valley 48213, send unless left short): page abf3fee6, maps 7a78d3e9` |
| 6. The five-place valley walk | The same walk with every place's files loaded, in `index.html`'s order, compared step by step | `jsc checks/page/stream-page.js > checks/out/walk.txt`, then `python3 checks/page/diff-page-stream.py checks/out/ref-walk.txt checks/out/walk.txt` | 3 s, and a few seconds to compare | `distinct changes: 0` |
| 7. The words fingerprint, all places | One hash over every sentence `page-smoke.js` checks in all five places, and a table of sentences and sentence shapes per word function | `jsc checks/page/golden-words.js > checks/out/golden-words.txt`, then compare its lines from `GOLDEN (valley` on with the ref's (the lines above them include the run's time) | about 4 min | the same `fnv1a32` and table as the ref |
| 8. The stand-in DOM | `app.js` through whole Lives in 28 configurations (window sizes, places, ways of playing, stored lives, the seal and season-line cases), about 1,100 to 1,700 checks each, with a second Life and the way back to the chooser; the 28th (fxThrow) is the first again with modules that start and throw at every cue, which must pass whole with the first's clock reads | `checks/page/run-dom.sh` | 20 s | `fxThrow: … clock reads, the same as the first configuration without it`, then `ALL OK` |
| 9. Chooser, hash, store, restore | The choice of places, the `#place-seed` address, the stored lives and the reload snapshot, in six scenarios | `checks/page/run-dom-places.sh` | 11 s | six `PASS` lines |
| 10. The sheet rules and drawings | Each place's sheet keeps its own rules (`AYSheet.check`) and hits all four crossings, and every drawing of it is the ref's: on the wide and the compact sheet, the map in each mode (the Opening, the day open, the same cut for a phone, the day closed, the same lettered up, Leaving, the Afterwards) with fixed options that reach every kind of hand and the sister's dealings, then the dealing glyphs, the keys, the seal and a place's gauges, each as a length and an `fnv1a32` | `jsc checks/page/sheet-probe.js > checks/out/sheet-probe.txt`, then `diff checks/out/ref-sheet-probe.txt checks/out/sheet-probe.txt` | 1 s | `check []` for each place, no `BAD` or `(no hit)`, last line `SHEET PROBE: 5 places, 103 drawings, fnv1a32 035800f1` on v0.2.0, and no difference from the ref |
| 11. Colour contrast | No colour pair a place moves is lower in contrast than the valley's, in light or dark; and at the strongest dusk (the light's washes at Leaving and the Afterwards' start) `--field`, `--river` and `--ink-soft` keep 3:1 or more over the sheet, in light and dark, the valley's and the place's (`--dusk` and `--dusk-k` from the valley's token blocks, or the design's values while they are not there yet, which the output says) | `python3 checks/page/contrast.py index.html banks` (and `watch`, `bridges`, `saltmarket`) | under 1 s | `pairs lower than the valley: 0` and `marks under 3:1 at the strongest dusk: 0`, exit 0 |
| 12. Every place's walk | One whole Life in each registered place (seed 48213, sending unless left short, at the three window sizes of part 5: 168 steps a place), with the page's markup and the four maps fingerprinted at every step, the same as the ref's step by step | `jsc checks/page/stream-page.js -- all steps > checks/out/walks.txt`, then `python3 checks/page/diff-walks.py checks/out/ref-walks.txt checks/out/walks.txt` | about 17 s, and under a second to compare | `places that differ: 0` |
| 13. `preview.html` current | `preview.html`, in the game folder and in each variant, is exactly its `index.html` inside the skeleton the host adds when it publishes (doctype, utf-8 charset, viewport, base styles), so a local browser shows what the published page shows | `python3 checks/page/preview.py` (`--write` rebuilds them) | under a second | `previews stale: 0 of 4`, exit 0 |
| 14. Nothing changed under the run | The game files were the same at the end of the run as at its start | (md5 inside `run-all.sh`) | | |
| 15. The motion and the sound | `motion.js` and `sound.js` held to their contract, on the working tree alone (there is nothing to compare at a ref); see below | `jsc checks/page/motion-sound.js -- strict` (strict as `run-all.sh` runs it) | about 70 s | `MOTION-SOUND: PASS (…) fnv1a32 …`, exit 0 |

Parts 4 to 7, 10, 12 and 15 load the game's files by relative path, so they are run from the folder being checked; outside the repository root, tell them where the checks are with `jsc -e "var CHECKS_DIR='<path to checks>'" …`. Parts 5, 6, 12 and 15 use the stand-in DOM in `checks/page/domshim.js`; parts 8 and 9 use the one in `checks/page/dom-harness.js` (part 15 loads both). Neither lays anything out: widths come from rules of thumb and timers are stepped by hand.

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

### Part 15: the motion and the sound

```bash
jsc checks/page/motion-sound.js                    # every place, about 70 s
jsc checks/page/motion-sound.js -- valley          # one place (or several), about 20 s
jsc checks/page/motion-sound.js -- strict          # a check that waits for a module that boots fails instead (as run-all.sh runs it)
AY_FX_STUB=1 checks/run-all.sh v0.3.0              # the page check run with part 15 not strict
```

`motion-sound.js` holds `motion.js` (`window.AYMotion`) and `sound.js` (`window.AYSound`) to the contract in the motion and sound design (its sections 2.2, 2.4, 4.3, 6.1 and 6.3). Each page it plays runs in a realm of its own (jsc's `runString`), so the Lives never share a global. It prints a line for each check, a summary line for each of its seven sections and `MOTION-SOUND: PASS` or `FAIL` with an `fnv1a32` of its log (the times left out), and exits non-zero on a failure.

1. **Loading.** Each module loads twice in the bare shell, in `domshim.js` and in `dom-harness.js` without throwing, adding only its own global and touching no timer, media query, listener or clock. `AYMotion.TIMING` is the table of the design's 2.2 and `AYSound.TIMING` equals it. Each has the API of 6.1. Each source passes the page's scans: `page-smoke.js`'s own `FORBIDDEN_RE` (comments included), every byte below 0x80, no address, no timer, no clock but the document timeline and the audio clock, no `matchMedia`, nothing the host forbids, no namespace, no read of `AfterYou` or `AYApp`, no `getTotalLength`, no SVG filter or blur, no literal colour, no `commitStyles`, no ES2015 syntax.
2. **Disabled.** In `dom-harness.js` and in `domshim.js` both modules are asked to boot and decline (neither stand-in DOM has animations or audio). With them loaded, declining, a whole Life in each place reads the clock exactly as often as without them, with the same page and maps at every step.
3. **Stubbed.** The browser's `animate`, `document.timeline`, `AudioContext`, `Audio`, `fetch`, `XMLHttpRequest`, `IntersectionObserver` and `document.addEventListener` are stood in for in `domshim.js`; an animation runs and ends by the shim's clock, the audio clock is the same clock, and every call a module makes while its own code runs (its boot, its cues, every callback it gave) is counted. Each module in the game folder must boot there. Two Lives a place, at 400x800 and 1280x800, the Sound button pressed on the Opening, each against the same Life with no module: every cue's payload within the whitelist of 6.3; the same clock reads and timers, none made by the modules; the page and the four maps, minus `.fx` and the Sound button, the same at every step; the Afterwards at rest by 21 s with the count in the same slices; no module throwing or reading `AfterYou` or `AYApp`. With `sound.js` booting: no `AudioContext` before the button and exactly one after it, `aria-pressed` and the `ambient` audio session, the button where 4.5 puts it in each view, no `Audio`, `fetch` or XHR with no track, and with a test track registered (`valley: null` in `var TRACKS = {` replaced in a copy) one `Audio` with a relative `src` under `music/`, only once sound is on and the wait has passed; an arrival at 320 + 30k ms on the house's pan for each hand that came, a thump at 240 + 30k for each of yours turned back, nothing in the slot of a missing act; the season's end chiming the page's N of 5; the count-ready sound the same for every result; and under reduced motion a whole Life whose reveals sound just so (counted by the reveal's own voices, not the bed's), with the count-ready sound of the moving Lives. With `motion.js` booting: every animation within its cue's window, finite, with no forward fill on the page's own nodes; the reveal's marks on the map (found by `AYSheet.lanes`) and the cards' glyphs starting in their slots of 2.4; no animation at all under reduced motion. With either booting: a Life restored from a snapshot into a day, into Leaving and into the Afterwards is set down with every cue after the Opening's map (drawn before the restore) quiet, no transient and no sound. Turned in the middle of a Life (the document's listeners are kept and told when the check fires them, and `document.hidden` is the check's): reduced motion turned on through the stand-in's media change 100 ms into a reveal, on a day at rest with its loops and 2 s into the Afterwards' light arc sends a `still` cue each time, after which nothing runs (the Afterwards' light set at the light it rests on) and no animation starts, and the loops come back at the next cue once it is off, while `sound.js` takes the cue without moving a voice, node, parameter or its state; the first reveal's finish held back 2 s with the page hidden meanwhile leaves the loops off while hidden and on for day 2, and held back as long with the page in front still turns them off; a second Life (`again`) after the Afterwards moves its day 1 light from the light the Afterwards rests on; a bed one-shot (the Saltmarket's steps) sounding when a reveal comes has its sources stopped within 20 ms and its gains at 0 within 15 ms; a test track whose `play()` is refused with `NotAllowedError` is held (not ended for the session), is not played again by cues or waits, and plays at the next document click; a test track whose `play()` is still pending when the page's own `pause()` comes (a hidden page) is rejected with `AbortError`, is not ended for it and plays again when the page is shown; with sound on, the page hidden, shown and hidden again 100 ms apart suspends the audio once, after the last hide's 0.25 s fade; and with the memory option switched on in a copy (`ARM_FROM_MEMORY = true`) and `on` kept, a first press on the Sound button (its `pointerdown` and `click` told to the document first, then the button's own click) leaves sound on and `on` kept, while a first press elsewhere starts sound in its `click`, not its `pointerdown`.
4. **Twins.** For each place the engine alone (no page) finds two Lives whose reveal on one day hands the modules exactly the same payload while a neighbour's missing act is luck in one and a choice in the other: this check, and never the page, sorts each missing act by the engine's own draws (the neighbour's habit, `AfterYou.draw` with `PURPOSES.ACT` and `PURPOSES.FORD`, `params.FOG`). Those two Lives are the ones section 3 plays; their reveals' logs (every animation started, every voice starting in the reveal's window with its own envelope and pan, the map's `.fx` as the reveal leaves it) must be byte-identical.
5. **Calendar.** The light and weather each map is dressed with are the same for every seed at the same place, map, sheet, crop, day and phase; the `.fx` groups are `aria-hidden`, hold nothing focusable, and sit as 2.1 puts them; every `.fx-wx` lies at y <= 0.36 H and clear of every holding, its bound and 4 units; `AYMotion._test.lightFor(place, view, day, phase)` gives the table of 2.5 (`view` and `phase` in the words of the `view` and `map` cues, `day` null outside the day), the Border's dusk the same every day; `lightFor` and `weatherFor` answer the same in a bare shell and inside a page in the middle of a Life.
6. **Geometry.** `AYSheet.lanes` and `AYSheet.lane` give the `d` of every drawn `.m-hand`, `.m-lost`, `.m-stay` and `.m-plan`, and the heads' tips, for every place, both sheets, crop on and off, lettering 1 and 1.13, under `sheet-probe.js`'s PLANNED and REVEALED and every kind of hand on every tie; they hand out copies; the cards' glyphs carry the marks motion finds them by; the card glyph of your hand turned back, as `revealPlan` plans it in every place and sheet, carries no dash pattern but `index.html`'s `.key-lost`, starts and ends on whole periods of it and ends opaque, so that its last frame is its rest.
7. **Planted faults.** Each of these, planted in a copy, must make its check fail: a payload carrying `why` (the dispatcher of a copy of `app.js`), a module `setTimeout`, an `https` string, a twin mismatch (a module that reads the engine's hidden records), a byte above 0x7F, "soft" in a module, a `sound.js` that mutes every cue under reduced motion, a restore that is not quiet (`fxQuiet = true;` written `fxQuiet = false;` in a copy of `app.js`), and each fix of the review undone in a copy: a `motion.js` with no `still` cue, an `app.js` that never sends it, a `motion.js` that judges the first reveal across a hidden page, one whose card glyph of a hand turned back draws on solid (`drawOnKf(6)`), one that does not keep the Afterwards' rest as the last light shown, a `sound.js` that lets a one-shot sound on through a reveal, one that ends the music when `play()` is refused for want of a tap, one that ends it when its own `pause()` cuts a pending `play()` short, one whose first hide's wait suspends the audio through a later hide's fade, one whose memory option takes a first press on the Sound button as its own, one whose memory option starts sound at a `pointerdown`, and one that takes the `still` cue as input.

**WAIT and strict.** A module in the game folder must boot in the stood-in browser: one that declines fails section 3, strict or not, and a module missing from the folder fails section 1. While a module does not boot, the checks that need it booted are printed as `WAIT` with what they would have checked, and a listener that boots stands in for the modules so that app.js's side (the payloads, the clock, the page) is still checked. With `-- strict` a WAIT fails; without it, a run with only WAITs and passes ends `MOTION-SOUND: PASS`, and its summary names the sections that wait. `run-all.sh` runs part 15 with `-- strict` unless `AY_FX_STUB=1` is set, so the page check run, and a release, is checked strict.

**Reading a failure.** Each FAIL line names the place, the window size, the Life (its way of playing and seed) and the step or day, with up to three examples. A page that differs gives the first step and character where it parts from the Life without the modules; a twin mismatch gives the character where the two logs part and both sides of it.

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
| `BASELINE.md` | The values the checks gave on v0.2.0 and v0.3.0. |
| `page/stream-words.js`, `page/same-sentences.py` | The valley's sentence stream (page-smoke.js with one hook) and its line-for-line comparison. |
| `page/golden-page.js` | The valley-only page and maps fingerprint. |
| `page/stream-page.js`, `page/diff-page-stream.py` | A place's walk (the valley's unless another is named), dumped step by step, and its comparison; `-- all steps` lists every place's walk as one fingerprint line per step. |
| `page/diff-walks.py` | The comparison of two such listings, place by place. |
| `page/golden-words.js` | The words fingerprint over all places. |
| `page/domshim.js` | The stand-in DOM for the fingerprints. |
| `page/dom-harness.js` | The stand-in DOM for the page checks. |
| `page/dom-run.js`, `page/dom-policies.js`, `page/run-dom.sh` | A whole Life through `app.js`, the new places' honest ways of playing in `page-smoke.js`'s form, and the 28 configurations. |
| `page/dom-places.js`, `page/run-dom-places.sh` | The chooser, hash, store and restore scenarios. |
| `page/sheet-probe.js` | Every place's sheet by its own rules, and every drawing of it as a fingerprint. |
| `page/contrast.py` | The colour contrast of each place against the valley, and of the marks drawn over the strongest dusk. |
| `page/motion-sound.js` | Part 15: the motion and the sound held to their contract. |
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
