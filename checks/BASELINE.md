# Baseline

What the checks gave on each release, newest first. The page check run compares against a tag itself, so these values are for reading a failure, not inputs to the run. After a new release is tagged, `checks/run-all.sh <tag>` prints the new values in its "Hashes" block.

## v0.3.0: the motion and the sound

Measured on 27 November 2026 with `checks/run-all.sh v0.2.1` on the working tree that was then committed and tagged v0.3.0 (the md5 of every game file at the start and end of the run is the tagged file's): `RUN-ALL: PASS (15 of 15 checks, against v0.2.1, 477 s)`.

Every fingerprint the run compares at a ref is the same as at v0.2.1, and so the same as v0.2.0's in the tables below: the `harness.js` gate lines (12 PASS, sha256 `8039556e2f3d7e3d…`), the valley's sentence stream (fnv1a32 `6d84219b` over 382,559 sentences, identical line for line), the valley-only page (page `abf3fee6`, maps `7a78d3e9`), the five-place valley walk (page `c8f9bb5d`, maps `7a78d3e9`, 168 of 168 steps with the same markup and maps), the words fingerprint over all places (fnv1a32 `5ac5fa25` over 2,381,819 sentences, its table unchanged), the sheet drawings (5 places, 103 drawings, fnv1a32 `035800f1`) and every place's walk (5 places, 840 steps, page `e95ec1c3`, maps `0e6f0738`). The page never needs `motion.js` or `sound.js`: parts 6 and 12 load them as `index.html` does, and in their stand-in browser, which has no animation or audio, the modules decline to start; part 15 shows that a page whose modules do start has the same markup and maps at every step, apart from the modules' `.fx` layers and the Sound button.

What is new or has moved in this release:

| Part | v0.3.0 |
| --- | --- |
| 15. The motion and the sound (`page/motion-sound.js -- strict`, new) | `MOTION-SOUND: PASS (7 sections, 89 checks, 0 failed; motion.js boots, sound.js boots) fnv1a32 006e45ae`, 66.5 s. By section: loading 14, disabled 6, stubbed 29, twins 12, calendar 5, geometry 3, planted faults 20 (all 20 planted faults caught) |
| 1. `page-smoke.js` | `PAGE SMOKE: PASS` in 223 s: 2,381,819 sentences checked, 115 of 115 word functions exercised, 4,849,132 engine fields read, 330 page hooks found; with the new scans of the two modules (no theory word, every byte below 0x80) and of `app.js`'s cues |
| 8. The stand-in DOM | 28 of 28 configurations (v0.2.0: 27). The 28th, fxThrow, is the first again with modules that start and throw at every cue (896 cues thrown); it passes whole with the first's 341 clock reads |
| 11. Colour contrast | As at v0.2.0 (4 places, no pair lower than the valley's), and newly checked at the strongest dusk (`--dusk` `#1C2A3A` at 0.14 in light, `#05080D` at 1.5 x 0.14 in dark): no mark under 3:1; the lowest is `--field` on the dusk in the valley's light, 3.88 |
| 9, 13 | Six of six chooser, hash, store and restore scenarios; `preview.html` current in 4 of 4 places it is kept |

Seen in a real browser before the release (the matrix in section 7 of `docs/motion-sound/SPEC.md`): the Sound button keeps to the day's line at 320 px in the valley, the Banks and the Border and wraps flush with the edge in the Bridges and the Saltmarket, with no sideways scroll; the sound starts only from a click on it, its bed peaking at about -28.5 dBFS and a reveal at about -22.6 dBFS (the limit is -18); no console errors. Not seen here: a hidden browser pane throttles its frames, so the motion's self-downgrade rightly turns the loops off there, and the timing of the loops, a tab switched away during the first reveal, reduced motion turned on mid-Life, Safari, iOS and Android are left to a real device.

## v0.2.0

What the checks gave on v0.2.0, measured on 26 November 2026 on the working tree when its game files were exactly the tag's (`git diff --name-only v0.2.0` listed none).

### Page fingerprints (`checks/run-all.sh`, against v0.2.0)

| Fingerprint | v0.2.0 |
| --- | --- |
| The valley's sentence stream (`page/stream-words.js -- valley`) | fnv1a32 `6d84219b` over 382,559 sentences, identical line for line at the tag |
| The valley-only page and maps (`page/golden-page.js`: valley 48213, send unless left short, 168 steps at three window sizes) | page `abf3fee6`, maps `7a78d3e9` |
| — by window size | phone 400x800: page `48692bf0`, maps `a80b5f11`; laptop 1280x800: page `025ac673`, maps `f3d5aeae`; tall 1280x1100: page `2b13eb85`, maps `f3d5aeae` |
| The five-place valley walk (`page/stream-page.js`: the same walk with every place's files loaded) | page `c8f9bb5d`, maps `7a78d3e9`; 168 of 168 steps with the same markup and maps at the tag |
| — by window size | phone 400x800: page `28da0013`, maps `a80b5f11`; laptop 1280x800: page `cc441f42`, maps `f3d5aeae`; tall 1280x1100: page `9426ad5c`, maps `f3d5aeae` |
| The words fingerprint over all places (`page/golden-words.js`) | fnv1a32 `5ac5fa25` over 2,381,819 sentences (74,404,141 characters), 12,167 distinct sentence shapes |
| Every drawing of every place's sheet (`page/sheet-probe.js`: each map mode on the wide and compact sheets with fixed options, the dealing glyphs, the keys, the seal and the Banks' gauges) | 5 places, 103 drawings, fnv1a32 `035800f1`; every place `check []`, no `BAD`, every crossing hit |
| Every place's walk (`page/stream-page.js -- all steps`: one Life a place, seed 48213, send unless left short, 168 steps a place at three window sizes) | 5 places, 840 steps: page `e95ec1c3`, maps `0e6f0738`; every step's markup and maps the same at the tag |
| — by place | valley: page `c8f9bb5d`, maps `7a78d3e9` (the five-place valley walk's); banks: page `05efea8e`, maps `4f611df7`; watch: page `24812d89`, maps `21d20b35`; bridges: page `976cdf7d`, maps `0bce14a3`; saltmarket: page `2de5e910`, maps `d06a5a70` |
| `harness.js` gate lines (G1 to G10, X1, X2) | 12 lines, all PASS; sha256 of the twelve lines `8039556e2f3d7e3d0ab843bdd478e23b2cd7b0d368c5e3b2fb50946f24dde9ea` |

The valley-only page and the five-place walk hash the same Life; their page hashes differ because the five-place page carries the choice of places, and their maps agree. The valley's line in every place's walk is the five-place valley walk's. The other parts of the run passed as well: `page-smoke.js` (PAGE SMOKE: PASS, 218 to 223 s), the refusal of an unknown place, the stand-in DOM (27 of 27 configurations), the six chooser, hash, store and restore scenarios and the colour contrast (no pair lower than the valley's in four places). With twelve parts the whole run took 475 to 481 s in three runs, with the same values each time; with the sheet drawings compared and every place's walk added (thirteen parts) it took 476 s, with the same values for the parts it had before. With the `preview.html` check added (fourteen parts), and `words.js` writing its minus sign as the escape `'\u2212'` instead of the character itself (so the file is plain ASCII), the run took 475 s and gave every value above unchanged: the escape is the same string to the page.

Run against v0.1.0 instead (`checks/run-all.sh v0.1.0`), the same working tree fails exactly the six comparisons where the page has moved since the first version, and exits 1 (6 of 13 parts, 469 s): the valley's sentence stream (v0.1.0: fnv1a32 `20bddf72` over 362,279 sentences; v0.2.0's `page-smoke.js` plays more valley Lives), the valley-only page (v0.1.0 has no `places/valley.js` for it to load), the valley walk (v0.1.0: page `72a7c55d`, maps `7a78d3e9`: the maps have not moved; v0.2.0's page carries the choice of places), the words fingerprint (v0.1.0: `20bddf72` over 362,279 sentences, the valley alone), the sheet drawings (v0.1.0 has no `sheet.js`, so the probe draws nothing there: 103 drawings differ) and every place's walk (v0.1.0 walks the valley alone, with the same maps at all 168 steps and different markup at every step; the four new places are walked only here). The `harness.js` gate lines are the same at both tags.

### Engine checks

**Valley identity** (`checks/engine/run-identity.sh`): v0.1.0's `engine.js` against v0.2.0's, 472 Lives, 19,856 JSON comparisons (61.5 MB), 0 differ: `PASS  the valley is unchanged` (247 s).

**Design gates at the full counts** (`checks/engine/run-gates.sh full all`, the final ways of playing; seals on placelab's 40-seed band; the four places ran at once beside two other runs, which the times include):

| Place | Placelab's verdict | Reading | Honest kept (PG1) | Honest seal (PG2) | Time |
| --- | --- | --- | --- | --- | --- |
| banks | all 14 PASS | READ: PASS (PG10 and PG11 not read on a band) | 44.0% of 2000 | 20.0% of 40 | 346 s |
| watch | all 14 PASS | READ: PASS (PG10 and PG11 not read on a band) | 50.2% | 12.5% | 499 s |
| bridges | all 14 PASS | READ: PASS (PG10 and PG11 not read on a band) | 46.4% | 20.0% | 652 s |
| saltmarket | all 14 PASS | READ: PASS (PG10 and PG11 not read on a band) | 50.5% | 22.5% | 335 s |
| valley (the reference, `full valley`) | 12 PASS; PG10 and PG12 FAIL | READ: PASS (PG12 not applicable to the valley; PG10 and PG11 not read on a band) | 38.3% | 17.5% | 246 s |

The valley's PG10 fails as written with careful as its honest way, as the first gate run found (cold is sealed in 35.0% against careful's 17.5% on the band); PG12 compares every place with the valley, so the valley cannot pass it.

**Design gates at the smoke counts** (`checks/engine/run-gates.sh smoke`, 129 s): valley 11 of 14 (not PG4, PG10, PG12), banks 12 of 14 (not PG4, PG11), watch, bridges and saltmarket 13 of 14 (not PG4). PG4 needs at least 12 grid seeds and the smoke run has 3, so it cannot pass there; the smoke counts show that the lab runs, not the verdicts.

**The Banks with the seals pooled** (`checks/engine/run-gates.sh full banks --pool`, 894 s): all 14 PASS and `READ: PASS (14 gates read; PG10 and PG11 read on 200 pooled seeds)`. On the 200 seeds the honest peacemaker is sealed in 22.0% (44 of its 88 kept Lives), the selfish last 1, 2 and 3 days in 3.0%, 0.0% and 3.0%; the highest seal besides honest is `[1,1,0.5,1,1]` at 16.5% against a cap of 33.0%; no policy is over the ratio line, and eight are not judged for having fewer than 20 kept Lives. The other three places were not run pooled for this baseline (the Bridges' 57 policies take about 40 minutes).
