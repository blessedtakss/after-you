> **Record of its time.** Written 2026-11-25 16:04 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Saltmarket [saltmarket]: fix report

Folder: `<scratch>/places/fix-saltmarket/`. Files are named relative to it.

**Labels.**
- **[m: file]** = measured by a script in this folder; the file holds the output.
- **[argued]** = reasoned, not run.

Every seal and every mark is at the shipped counts: 2000 headline futures, and 1000 for the last-day replay and the new season replay.

**What was not touched.** Nothing in the game folder, `e1/`, `tune-saltmarket/` or `break-saltmarket/` was edited. The honest policy, the selfish act and `policies.js` are the tuner's, unchanged.

**How the breaker's scripts were re-run.** They were run unchanged through `redirect.js` (`jsc redirect.js <their script> -- <their args>`). That file swaps two globals before their script runs:
- `load(e1/engine-places.js)` loads this folder's engine instead;
- `readFile(tune-saltmarket/preset.json)` reads this folder's `preset.json` instead.

## 0. Verdict

**Both blocking breaks are closed. All 14 gates pass on fresh seeds. Two engine additions were needed.**

**Engine additions.** Both are in `engine-saltmarket-fix.js`. The valley is unchanged: 0 of 19,856 comparisons differ.
1. **REPLAY 'season'** is the breaker's proposed fix. It adds R2's won clause over the last season (days 9 to 12). It closes the staged precedent on days 8 to 11.
2. **SEAL_MARK**, an optional place key, set to 20 here. It closes the rest of that family: a precedent staged on days 2 to 7, before the last season. No dial could do this (§1.2).

**`preset.json`:**

```
{ "B": 3, "C": 1, "S": 2, "H": 0, "CUSTOM": [1, 1, 0, 1, 0],
  "CHARTER": "breaks", "FLOW_KIND": "both", "HOLD_LINE": 0.5,
  "NEED_PIVOT": 104, "NEED_WEIGHT": 0.5, "MARGIN": 14,
  "REPLAY": "season", "SEAL_MARK": 20 }
```

**The gates.** Fresh bands 90101..94403, 85-policy battery, seal rates on 1000 seeds [m: final-gates.txt]. Every row passes.

| Gate | Value |
|---|---|
| PG1 | 46.4 |
| PG2 | 18.6 vs 14.6 / 14.9 / 14.4 |
| PG3 | 99.2 |
| PG4 | 100 |
| PG5 | 0 differ |
| PG6 | 91.7 |
| PG7 | 89.2 |
| PG8 | 100 |
| PG9 | 5 |
| PG10 | highest 24.0 vs cap 28.6; highest seal/kept 0.61 |
| PG11 | honest seal 18.6 |
| PG12 | #38 (placelab form) and #13 (shipped counts); ρ −0.94 |
| PG13 | need 86..176 |
| PG14 | 1.13–1.27 s |

**The breaks.**

| Break | Before | After |
|---|---|---|
| Recipe, stage on day 9 + habit12 (fresh 1000 seeds) | | 14.3%, against honest 18.6% |
| Same, on the breaker's own 61001..61200 | 42.5%, s/k 0.91 | 17.5% against honest 16.0%; 0 of 5 bands over the cap; pooled s/k 0.32 |
| Why the cut worked (why-maker.js) | in Lives where the staged cut fires: kept 35, sealed 33 | kept 40, sealed 1 |

**Caveat 1: PG10 and PG11 read on 40-seed bands are noise in this place, for any setting I measured (§6).**
- The honest seal rate falls below PG11's 10% floor on 4 of my 25 forty-seed bands. On the breaker's gate band 53001..53040 it is 7.5%, so their unchanged `gates-fresh.js` prints PG11 FAIL.
- A policy with 1 to 3 kept Lives can show seal/kept 1.00 on a single band.
- Pooled over 200 to 1000 seeds, every gate passes.

**Caveat 2: SEAL_MARK 20 is a design change.** "Clearly better" means 20 points here, not 5. That is a call for the lead (§6).

## 1. What changed, and why

### 1.1 The preset

| Dial | Tuner | Fix | Why |
|---|---|---|---|
| REPLAY | 'habit' | **'season'** (§2.1) | Closes the blocking recipe: a precedent staged in the last season stops counting toward the seal. |
| SEAL_MARK | 5 (engine constant) | **20** (§2.2) | Closes the same family staged earlier, which the season replay cannot see (§1.2). |
| MARGIN | 17 | **14** | With the higher bar, honest's seal rate fell to 13.3% at margin 17 (SEAL_MARK 20; 16.3% at 15) [m: out/sw3-sm20.txt, sw3-sm15.txt]. Margin 14 lets honest keep the house in 46–50% of Lives (PG1 35..65) and lifts its seal to about 18–19% [m: out/sw4-sm20.txt, final-gates.txt]. |
| everything else | | unchanged | B, C, S, H, CUSTOM, CHARTER, FLOW_KIND, HOLD_LINE, NEED_PIVOT and NEED_WEIGHT are the tuner's. |

### 1.2 Why the dials could not close it (all on my tuning seeds 95001..99999)

**1. The season replay alone closes days 8 to 11 and nothing earlier.**
- Settings: the tuner's preset with REPLAY 'season' from day 9. Seal seeds 95001..95200 (200), kept over 96001..98000 [m: out/e1-r9-1..4.txt].
- Honest: 22.0%.
- The recipe staged on day 9: 17.5%. Staged on day 8: 17.0%.
- Staging earlier:

  | Policy | Seal | seal/kept |
  |---|---|---|
  | staged on day 7 | 27.0% | 0.84 |
  | staged on day 6 | 23.0% | 0.84 |
  | staged on day 5 | 20.5% | 0.79 |
  | staged on days 7 and 8 | 19.5% | 0.81 |
  | tuner's honest + staging on day 7 | 26.0% | 0.87 |

- Why: a precedent written before day 9 is the house's own habit when the season starts, so the replay keeps it. The sister learns it at the day-8 round and carries it.
- Once the lever ("never put the price back") is set, the town mark is clear in about 91% of Lives.
- Cross-check: my engine reproduces the breaker's lab-side season check to the Life. On 61001..61120, honest gets 23.3% (bands 9/7/12) and the recipe 22.5% (bands 3/13/11) [m: out/xA-cross.txt; = break-saltmarket/sc2-a.txt, sc2-c.txt].

**2. An earlier window moves the boundary, it does not remove it.** Seal seeds 95201..96000 [m: out/e1-r8-*.txt, out/sw-from5.txt, sw-from6.txt, sw-from7.txt, out/sw2-from5-*.txt, sw2-from6-*.txt, sw2-from9-*.txt].

| Window starts | A staging it misses | Its seal/kept | Honest seal |
|---|---|---|---|
| day 9 | | | 22.0% |
| day 8 | day 6 | 0.84 | 21.5% |
| day 7 | day 5 | 0.84 | 20.3% |
| day 6 | tuner's honest staged on day 4 | 0.82 | 17.8% |
| day 5 | tuner's honest staged on day 3 | 0.87 | 14.5% |

**3. FOG (need re-tuned at each value)** [m: out/sw-fog04.txt .. sw-fog08.txt; out/g07-*.txt, out/g08-*.txt].

| FOG | Stagers' seal/kept | Gates broken |
|---|---|---|
| 0.04 | 0.84–0.88 | |
| 0.05 | 0.80–0.86 | |
| 0.06 | 0.80–0.84 | |
| 0.07 | 0.70–0.73 | PG3 74.2%, PG6 32.5% |
| 0.08 | 0.56–0.59 | PG3 53.3%, PG6 14.2%, PG7 50.0% |

At FOG 0.07 and above, a single precedent stops mattering.

**4. HOLD_LINE** 0.55 or 0.6: the stagers stay at 0.84–0.88 [m: out/sw-hl55.txt, out/sw-hl6.txt].

**5. A higher seal bar works.** Under the season replay, the stagers' seal/kept falls as SEAL_MARK rises:

| SEAL_MARK | MARGIN | Seeds | Max stager seal/kept | Honest seal | File |
|---|---|---|---|---|---|
| 10 | 17 | 95601..96000 | 0.84 | | out/sw3-sm10.txt |
| 15 | 17 | 95601..96000 | 0.76 | | out/sw3-sm15.txt |
| 20 | 17 | 95601..96000 | 0.71 | | out/sw3-sm20.txt |
| 18 | 14 | 95201..95600 | 0.69 | 20.5% | out/sw4-sm18.txt |
| 20 | 14 | 95201..95600 | 0.61 | 18.3% | out/sw4-sm20.txt |

- Why: once set, the lever puts the mark near +25 (seed sd about 8). A bar of 20 + 2 se leaves a real share of kept stagers unsealed; a bar of 5 left almost none [argued from the clear rates in those files].
- SEAL_MARK was a constant, so this is an engine change.

**6. SEAL_MARK 18 with MARGIN 11, measured in full on the same final bands and set aside** [m: out/alt-sm18m11/final-gates-sm18m11.txt].
- All 14 gates pass pooled. Honest seal 22.2%; the PG11 floor is safer (2 of 25 forty-seed bands under 10%).
- But PG10's cap gets thin. Staging on day 7 gets 31.1% against a cap of 33.3.
- On the first 200 seal seeds, staging on day 6 gets 39.5% against a cap of 38.2: over.
- I kept 20/14: its cap margin on 200-seed bands is 0 to 4 points, never over (§4, PG10).
- SEAL_MARK 18 with MARGIN 14 is probably in between: honest 20.5% against a top stager of 25.8% and a cap of 30.75, on 95201..95600 [m: out/sw4-sm18.txt]. It has not been run on the final bands.

## 2. Engine changes

The engine is `engine-saltmarket-fix.js` (md5 694d2b39928c8b662c8574f6ac821dcf). Its diff against `e1/engine-places.js` (md5 69c48ff7…) is in `engine-saltmarket-fix.diff`.
- 105 lines added or changed: 69 code, the rest header and comments. 15 lines replaced.
- No new draw purpose, key or ordering. The season replay draws exactly the keys the Life drew on those days.

### 2.1 REPLAY 'season'

**Rule.**
- Everything REPLAY 'habit' does is kept: the day-12 replay and its bought, cost and won clauses.
- Added: days REPLAY_FROM..12 (default 9) are played again. On every tie the house plays its habit as it stood before REPLAY_FROM: h/n ≥ 0.5 means hold, and a situation never met means the custom. The habit is applied to whatever situation the replay is in.
- Days before REPLAY_FROM stay as lived. Draws are keyed, so the neighbours act as they would have.
- The same 1000 futures are run, and delta = replay − lived.
- The seal is also withheld (seal.wonOnSeason) when the mark is clear but mark + delta − 2 se < SEAL_MARK.
- Bought and cost stay on day 12. Applying them over the season cuts honest from 24.2% to 15.8% [break-saltmarket/sc2-a.txt].

**Why the last season.** Day 8 is the sister's last looking-round that she can act on in the Life. A precedent written later reaches the heir and her, but is never tested.

**Code** (line numbers in `engine-saltmarket-fix.js`):

| Lines | What |
|---|---|
| 91–106 | header for REPLAY, REPLAY_FROM and SEAL_MARK |
| 125–132 | page notes |
| 399–411 | verdict docs: `season` entry, `seal.wonOnSeason` |
| 588–603 | PLACES.saltmarket = this preset |
| 727–735 | `checkPlace`: 'season', REPLAY_FROM 2..12, SEAL_MARK 0..100 |
| 941–966 | `playDay`, real Life only: at REPLAY_FROM it keeps `life.season = { from, before, sent }` and each day's choices; the day-12 `lastDay` clone leaves it out |
| 1173 | `replayLastDay` treats 'season' as 'habit' |
| 1190–1225 | `seasonFrom()` and `replaySeason()` |
| 1527–1537 | `project({ season: true })` |
| 1578–1590 | `verdictJob`: one more run of m futures when the replay changes an act |
| 1641–1676 | `verdictStep`: `res.season`, `wonOnSeason`; the replay is never `mattered` |
| 1712 | export |

A withheld seal passes silently, as for the other clauses. The page must treat REPLAY 'season' as 'habit' wherever it tests `params.REPLAY`. `lastDay.rule` is still 'habit' [argued].

### 2.2 SEAL_MARK

`verdictStep` (lines 1655–1670) uses `P.SEAL_MARK` when it is set, else 5. It is used in `markClear` and in both won clauses. The valley never sets it.

### 2.3 R1: the valley is unchanged

- **Result: PASS.** 472 Lives, 19,856 JSON comparisons (61.5 MB), 0 differ; `life.place` and no-stock checks true; 535.5 s [m: out/identity-fix-out.txt].
- `identity-fix.js` is `e1/identity-places.js` with only HERE and the engine file name changed. It compares against the shipped `engine.js` (md5 6090c8f6…).
- The intermediate copies also passed:
  - `engine-season.js`, the season replay only (md5 a60378f6…) [m: out/identity-season-out.txt];
  - `engine-season-sm.js` [m: out/identity-season-sm-out.txt].
- PG5 also covers the season replay: placelab's check traces the verdict's draws, and the replay is part of the verdict.

### 2.4 Cost

- Placelab's PG14 at load 13–15: 1.21, 1.27 and 1.13 s [m: out/fg-14.txt, out/fg-14-load.txt].
- Against the unfixed engine on the same 6 honest Lives, timed interleaved [m: out/cost-final.txt]:
  - fixed: max 1.26 s, median 1.16 s;
  - unfixed (REPLAY 'habit'): max 1.21 s, median 1.15 s;
  - ratio 1.042. The season replay ran in 5 of the 6 Lives.
- Earlier, at load 5 with the season-only engine: max 1.03 s against 0.98, ratio 1.035 [m: out/cost-1.txt].
- Under load 45–80 the same verdicts take 2.1–2.6 s in the breaker's `gates-fresh.js` [m: rerun/gates-fresh-out.txt]. PG14 needs a quiet machine, as BREAK.md §3 found.

## 3. Seeds

- **Tuner:** 1..3000; 10001..90003 (its bands, including the speed band 90001..90003); 100001..190003; 500001..500300.
- **Breaker:** 50121..79999 and 200001..1,200,000.
- **My tuning:** 95001..99999.
- **Final gates (fresh to all three):**

  | Band | Seeds |
  |---|---|
  | lives | 90101..92100 |
  | seal | 92201..93200: 1000 seeds; every Life judged on the first 200, kept Lives on the other 800 (the seal needs the house kept, so seal rate and seal/kept are exact) |
  | grid | 93301..93312 |
  | spread | 93401..93520 |
  | g6 | 93601..93720 |
  | mirror | 93801..93920 |
  | pull | 94001..94040 |
  | sealGrid | 94101..94112, plus 94201..94240 at the shipped counts |
  | det | 94301..94302 |
  | speed | 94401..94403 |

- **The breaker's re-runs** used the breaker's own seeds.

## 4. Every gate [m: final-gates.txt]

**Battery (85 policies, `battery-list.js`):**
- placelab's saltmarket battery (19);
- the old recipe: careful+grab2/3, honest+grab1/2/3;
- the tuner's alternatives;
- the breaker's schemes: plain sellers, the recipe, staging on days 2..11 one or two times, owing-makers on days 2..11, store-first, kingmaker, cut d11, both-poison, early/late virtue and others;
- retaliation staging (added here).

| Gate | Value | Pass |
|---|---|---|
| PG1 | Honest kept the house in 46.4% of 2000 Lives. | yes |
| PG2 | Seal on 1000 seeds: honest 18.6%; selfish act on the last 1/2/3 days 14.6 / 14.9 / 14.4%. First 200 seeds: 22.0 against 18.0 / 18.0 / 17.0. | yes |
| PG3 | Spread ≥ 25 in 99.2% of 120 seeds (median 46.8). | yes |
| PG4 | Best of the carried 243 is not flat in 100% of 12 seeds (best on average [0.5,0,1,0,1]). | yes |
| PG5 | 0 of 2 reruns differ; 16 flips; 928,683 shared draws, 0 differ, 0 clashes. | yes |
| PG6 | The largest what-if moves holdsPct ≥ 5 in 91.7% of 120 seeds (median 15.3). | yes |
| PG7 | Baseline inside 15..85 in 89.2% (median 50.5). | yes |
| PG8 | All three in 100% of 120 seeds. | yes |
| PG9 | Median 5 situations met (min 3). | yes |
| PG10 | 85 policies on 1000 seeds. Highest besides honest: plain seller + staging on day 7 + habit12, 24.0%; honest 18.6%, cap 28.6. None over the cap. Highest seal/kept: owing-maker d6, 0.61 (223/367). Placelab form (first 200): highest 33.0 against a cap of 33.0, at the cap, not over; highest seal/kept 0.68. By 200-seed band: highest stager against cap 33.0/33.0, 23.0/27.0, 24.5/27.0, 23.5/27.0 and 24.0/30.0. | yes |
| PG11 | Trades: always 57.0% kept, −10.4; careful 78.7%, −9.4; cold 57.6%, −17.0; milkers 58%, −16.4; and more. Honest mark +20.5; honest seal 18.6% (first 200: 22.0%). | yes |
| PG12 | (a) Valley's best [1,1,0.5,1,0] is #38 by seal (placelab, 12 seeds at 200/200), and #13 at the shipped counts on 40 seeds (only 11 ways have any seal; it has 0.0%) [m: out/sgf-merge.txt]. (b) ρ −0.94. (c) BOTH mark −8.3 vs +1.2; SHORTED mark −4.1 vs +1.2; OWING mark −21.5 vs +13.5; NEITHER store +4.0 vs −0.7. | yes |
| PG13 | Need 86..176 over 85 policies × 2000 Lives; all whole. | yes |
| PG14 | 1.21, 1.27, 1.13 s (load 13–15). | yes |

**The lesson still plays** [m: final-gates.txt battery rows]:
- careful keeps 78.7% with mark −9.4 and no seal;
- always-hold keeps 57.0% with −10.4;
- the honest seller (never put the price back) keeps 46.4% with +20.5 and is sealed in 18.6%.

## 5. The breaks

### 5.1 Recipe: stage a precedent on day 9 or 10, then day 12 by habit (blocking): **CLOSED**

- **The breaker's own scripts, unchanged, under the fix** [m: rerun/*.txt, rerun/pg10-bands-out.txt]:

  | Seeds | Recipe | Honest | Cap | Bands over the cap | Recipe s/k |
  |---|---|---|---|---|---|
  | 61001..61200 | 17.5% | 16.0% | 26.0 | 0 of 5 | 35/108 = 0.32 (before 0.91) |
  | 67001..67200 | 11.5% | 11.0% | | 0 of 5 | |
  | 53001..53040 | 10.0% | 7.5% | | | |

  - Variants on 61001..61200: day 10 17.5%, day 8 17.0%, day 11 17.5%, without day-12-by-habit 16.5%, tuner's honest + staging on day 9 17.0%.
- **Mechanism, why-maker.js** [m: rerun/why-maker-out.txt]: the staged cut fires in 67 Lives. They are kept 40 times and sealed once; before the fix, kept 35 and sealed 33.
- **Fresh 1000 seeds** [m: final-gates.txt]:
  - staged on day 9: 14.3%, s/k 0.29;
  - day 10: 14.3%;
  - day 8: 14.1%;
  - against honest 18.6%.
- **Residual from BREAK.md §4, staging on day 7 or earlier.** Closed by SEAL_MARK. On 1000 fresh seeds, the 18 staging policies on days 2..7 (once or twice; plain seller or tuner's honest) give 3.5–24.0%, all under the cap of 28.6, with seal/kept 0.49–0.61 [m: final-gates.txt]. Staging by retaliation gives 16.5–19.8%, s/k 0.34–0.45.
- **On the breaker's band**, staging on day 6 gives 24.5% pooled against a cap of 26.0. It is over the cap on 1 of 5 forty-seed bands (32.5 against 30.0) and over 0.8 seal/kept on 1 of 5 (11/13); pooled s/k 0.56 [m: rerun/pg10-bands-out.txt]. That is the 40-seed noise of §6.

### 5.2 PG10's ratio part on fresh seeds with the tuner's battery (blocking): **CLOSED pooled; on single 40-seed bands it cannot be closed by any setting**

- **Honest no longer crosses 0.8 anywhere.**
  - Pooled seal/kept: 0.38 on 1000 fresh seeds [m: final-gates.txt]; 0.33 on 61001..61200; 0.26 on 67001..67200; 0.14 on 53001..53040 [m: rerun/pg10-bands-out.txt].
  - Worst 40-seed band: 0.64 of 25 bands. Before the fix it crossed 0.8 on 2 of 11.
  - honest+selfish1/2/3: 0.29–0.30 pooled; worst band 0.55.
- **The grudges, pooled:** [1,1,0,0,0] 3/17 = 0.18; one-strike 2/22 = 0.09.
- **But on a band where a grudge is kept once, it reads 1/1.** That happens on my band 92241 for both, and on the breaker's band 61041 [m: final-gates.txt "worst 40-band" column; rerun/pg10-bands-out.txt].
  - No setting can fix this. A grudge keeps the house in 2.6–2.9% of Lives, about one Life per 40 seeds.
  - The breaker's gate band now passes: the unchanged `gates-fresh.js` prints PG10 PASS (cap 17.5; none over; none above 0.8) [m: rerun/gates-fresh-out.txt].
- **Gate wording the lead should adopt** (the breaker's suggestion): judge the ratio on at least 200 pooled seeds, and only for policies with at least 20 kept Lives there; otherwise report the count. My final PG10 uses 1000 seeds.

### 5.3 The honest policy is not the best honest play (minor; BREAK.md §2.3): **no longer matters for the cap**

- Plain seller (patience 3): 13.8%, s/k 0.26. With day 12 by habit: 14.3%. Honest: 18.6% [m: final-gates.txt].
- The plain seller keeps more (52.1% against 46.4%) and is sealed less.
- The honest policy is unchanged.

## 6. What could not be closed, and risks

1. **40-seed bands.**
   - The honest seal rate is 18.6% pooled. Its 25 forty-seed bands run 3..14 sealed of 40, and 4 of 25 are under 4 (under PG11's 10%).
   - Every 200-seed band is at least 17.0%.
   - On the breaker's gate band 53001..53040 honest is 7.5%, so their unchanged `gates-fresh.js` prints PG11 FAIL there [m: rerun/gates-fresh-out.txt]. It prints PG14 FAIL too (load 45–80); everything else passes.
   - The stagers also cross the cap or 0.8 on single 40-seed bands (§5.1).
   - A higher honest seal rate makes PG10's cap tighter (§1.2, item 6). In this place PG10 and PG11 must be read on 200 or more seeds.
2. **SEAL_MARK 20 is a design change.**
   - The seal now needs the ring to break in at least 20 more of every 100 futures than under the guild's rule, beyond two standard errors.
   - "Stall kept, town better off" is withheld from a stall with a mark of +12, which is clearly better by the valley's standard of 5.
   - The page may want "clearly better off". Its seal text and Chronicle need the lead's word.
   - Without SEAL_MARK, `engine-season.js` with the tuner's preset and REPLAY 'season' closes the blocking recipe. But PG10's ratio part then fails for staging on days 4–7 (0.79–0.89, §1.2).
3. **PG12(a) at the shipped counts is thin.**
   - With a bar of 20, only 11 of 243 fixed ways earn any seal on 40 seeds. The valley's best ranks #13 only because ways with 0% seal are ranked by kept, and it keeps the most.
   - On 99801..99840 (tuning) it was #29 with 21 sealed ways [m: out/sg20-merge.txt]; on the final band #13; placelab form #38.
4. **Early staging still pays a little more than honest.** On 1000 fresh seeds it gets up to 24.0% against honest's 18.6%, always under the cap. It costs store: kept 34–40% against 46%. It is a legitimate trade, but it remains the closest thing to a recipe.
5. **R2 is "written once for all new places"; REPLAY 'season' is a new mode used only here.** Whether the banks, the watch and the bridges should adopt it is the lead's call. It costs about 3.5–4% of a verdict where the replay changes an act [argued from §2.4].
6. **The honest seller's seal leans on luck.** Honest Lives in which the house never met "after you cut and they held" are never sealed: 25 kept Lives on 61001..61200, 0 sealed [m: rerun/why-maker-out.txt]. This is the custom's "put the price back" default; the brief has the page say so ("Never tested. Your heir keeps the guild's rule here").

## 7. Files

| File | What |
|---|---|
| `preset.json` | the fixed preset |
| `engine-saltmarket-fix.js`, `engine-saltmarket-fix.diff` | the engine with REPLAY 'season' and SEAL_MARK |
| `engine-season.js` | the season replay alone (minimal change) |
| `identity-fix.js` → `out/identity-fix-out.txt` | R1 (also identity-season.js, identity-season-sm.js) |
| `final-gates.txt` ← `final-gates.sh`, `final-merge.js`, `final-battery.js` (out/fb-sm20m14-0..10.txt), `fx-gates.js` (out/fg-*.txt), `battery-list.js` | the final gates |
| `redirect.js`, `fx.sh`, `rerun-one.sh`, `rerun-jobs.txt`, `pre-rerun.js` | how the breaker's scripts were re-run unchanged |
| `rerun/` | their multiband.js outputs under the fix (same names), pg10-bands-out.txt, why-maker-out.txt, gates-fresh-out.txt |
| `out/alt-sm18m11/` | the full alternative run (SEAL_MARK 18, MARGIN 11) and its re-runs |
| `fx-policies.js` | the registry and the staging variants added here |
| `fx-run.js`, `fx-sweep.js`, `fx-ratio.js`, `fx-cost.js` | tuning tools; out/e1-*, sw-*, sw2-*, sw3-*, sw4-*, sw5-*, g07-*, g08-*, xA-cross, cost-* |
