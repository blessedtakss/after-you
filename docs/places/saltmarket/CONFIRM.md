> **Record of its time.** Written 2026-11-25 19:21 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Saltmarket [saltmarket]: confirmation report

Folder: `<scratch>/places/confirm-saltmarket/`. Files below are named relative to it.

**Labels.**
- **[m: file]** = measured by a script in this folder. The file holds the output.
- **[argued]** = reasoned, not run.

**What was tested.**
- Engine: `final/engine.js` (md5 2fa86b59…), loaded unchanged. Every Life is `createLife(seed, 'saltmarket')`.
- Preset: the engine's own `PLACES.saltmarket`. `cs.js` checks on every run that it equals `fix-saltmarket/preset.json`. It always did.
- Honest policy and selfish act: the tuner's, unchanged.
- Battery: the fixer's 85 policies, plus the 24 breaker and fixer schemes that were not in it. That is 109 policies.
- New schemes: 81, in `cs-schemes.js`.
- Counts: 2000 headline futures and 1000 for the last-day and season replays, for every seal and mark.
- Seeds: only 2,300,001 to 2,399,999. Section 7 lists the bands.
- Nothing outside this folder was edited. The breaker's and fixer's scheme files were copied into `lib/` and loaded unchanged.

**Machine load.** Other agents kept the load between 45 and 190 during the long runs. PG14 was timed at the start, when the machine was quiet (load 1.5 to 1.8).

## 0. Verdict: holds

1. **All 14 gates pass on fresh seeds**, read the way LEAD-DECISIONS 2.6 says [m: out/gates-confirm.txt].
2. **No scheme earns the seal over PG10's cap.** The best is the known residual: a precedent staged on day 6 or 7. It gets 23.3% against honest's 17.0%, with a cap of 27.0, on the same 1000 seeds [m: out/top-stagers-main1000.txt]. Over 4000 fresh seeds it gets 22.6% against 16.9% [m: out/gates-400-battery.txt, out/attacks-all.txt, out/season-check-merged.txt].
3. **The season replay does what FIX.md 2.1 says.** A precedent staged on days 8 to 11 adds nothing on fresh seeds. Its seal equals that of the same seller who never staged, to the Life [m: out/season-check-merged.txt].
4. **Page facts hold** on 99,999 seeds. The need is always a whole number from 78 to 176 [m: out/pagefacts.txt].

**Two findings the lead should read (not blocking):**

- **R1. PG10's ratio part sits on the 0.8 line for one recipe** (§2.3). The recipe is: stage a precedent on day 4, and always cut after both cut. Its seal/kept is 0.796 pooled over 10,000 fresh seeds (se 0.013). Two variants read 0.801. A single 1000-seed pool can read anywhere from 0.72 to 0.89.
  - I do not count this as a break. No pooled reading is clear of the line.
  - The recipe also earns fewer seals than honest play: 7.2% against 17%. Its staging lowers its own seal rate.
  - If the lead reads 0.801 as over the line, PG10 fails here.
- **R2. The season replay withholds the seal from honest play that a player cannot see coming** (§3.2). Suppose an honest seller first meets "after you cut and they held" on day 9 to 12, by its boy's slip or by its own usual rule. It is then never sealed: 0 of 62 kept Lives. 43 of those 62 had a clear mark [m: out/why-honest.txt].
  - The size matches what the fixer measured (§3.1). What is new is that all of it falls on these Lives.

## 1. The gates on fresh seeds

Bands: lives 2,300,001..2,302,000. Seal: 2,302,001..2,303,000 (1000 seeds) for the core 19 policies, and 2,302,001..2,302,400 (400 seeds) for all 109. On the seal band every Life is judged on the first 200 seeds, and kept Lives on the rest. Other bands are in §7.

| Gate | Mine | Fixer (final-gates.txt) | Pass | File |
|---|---|---|---|---|
| PG1 | honest kept 48.5% of 2000 Lives | 46.4 | yes | out/gates-1000-core.txt |
| PG2 | 1000 seeds: honest 17.0%; selfish act on the last 1/2/3 days 13.0 / 13.5 / 13.2% | 18.6 vs 14.6 / 14.9 / 14.4 | yes | out/gates-1000-core.txt |
| PG3 | 95.8% of 120 seeds (median 47.0) | 99.2 (46.8) | yes | out/g-37.txt |
| PG4 | 100% of 12 seeds; best on average [1,0,0.5,0,1] | 100 ([0.5,0,1,0,1]) | yes | out/g-412.txt |
| PG5 | 0 of 2 reruns differ; 16 flips; 848,342 shared draws, 0 differ, 0 clashes | 0 differ | yes | out/g-895.txt |
| PG6 | 88.3% of 120 seeds (median 14.9) | 91.7 (15.3) | yes | out/g-6.txt |
| PG7 | 91.7% (median 51.3, range 14.5..96.0) | 89.2 (50.5) | yes | out/g-37.txt |
| PG8 | 100% of 120 seeds | 100 | yes | out/g-895.txt |
| PG9 | median 5 situations (min 3) | 5 (3) | yes | out/g-895.txt |
| PG10 | 109 policies on 400 pooled seeds: highest owing-maker d7 soft+habit12 24.5% (honest 17.0, cap 27.0); none over. On 1000 seeds: 23.3% against 17.0. Ratio judged for policies with 20 or more kept Lives: highest 0.67 (14/21); stagers at most 0.62. | 24.0 vs 28.6; ratio 0.61 | yes | out/gates-400-battery.txt, out/top-stagers-main1000.txt |
| PG11 | trades (kept within 3 of 48.5%, mark 10 or more below honest's +19.0): always 55.9% −9.9, careful 80.7% −10.2, milker 57.9% −16.2, cold 57.3% −16.7 and others. Honest seal 17.0% over 1000 seeds; by 200-seed band 16.0 to 18.5 | 18.6 | yes | out/gates-1000-core.txt, out/gates-400-battery.txt |
| PG12 | (a) placelab form #17. At the shipped counts on 40 seeds: #28 of 243, with 20 ways earning some seal. (b) ρ −0.96. (c) BOTH mark −7.3 vs +1.2; SHORTED −3.9 vs +1.2; OWING −21.8 vs +13.5 | #38 / #13 (11 ways); −0.94 | yes | out/g-412.txt, out/sgrid-merge.txt |
| PG13 | need 79..173 over 109 policies × 2000 Lives; all whole | 86..176 | yes | out/gates-400-battery.txt |
| PG14 | full verdict: 0.99, 0.98, 1.00 s for placelab's three Lives; max 1.05 s over 20 honest Lives. CPU 18.36 s against 18.29 s wall, so CPU per verdict equals wall time. | 1.13–1.27 (load 13–15) | yes | out/pg14-quiet.txt |

Notes:
- **PG10 on 200-seed bands.** The highest stager was 26.5 against a cap of 27.5, then 23.0 against 26.5. Neither is over [m: out/gates-400-battery.txt].
- **PG12(a) is less thin on my band** than on the fixer's: #28 with 20 sealing ways, against #13 with 11. It is still a 40-seed count [m: out/sgrid-merge.txt].
- **Ratio not judged.** These policies had fewer than 20 kept Lives in the 400-seed pool: one-strike 1/13, [1,1,0,0,0] 1/11, never, bully, mirror.

## 2. Attacks

Each scheme was screened on dev seeds. The best were then measured on fresh seeds never used for choosing. Each confirmation pool has at least 1000 seeds, and the pooled readings use 2000 to 10,000. Each scheme is judged against honest on the same seeds [m: out/attacks-all.txt].

### 2.1 What moves the mark

Here the heir and the kin carry a fixed five-habit way. The data is 40 honest end states at 500 futures [m: out/levers.txt].

| Way carried [NEW, BOTH, SHORTED, OWING, NEITHER] | Mark |
|---|---|
| the guild's rule [1,1,0,1,0] | +0.1 |
| [1,1,1,0,0] (never put the price back, cut after both cut) | +21.3 |
| [1,1,1,0,1] (the same, but hold after both cut) | +7.7 |
| [1,1,1,0,0.5] | +13.8 |
| [1,1,1,0.1,0] / [1,1,1,0.2,0] | +13.7 / +8.1 |
| NEW 0 or 0.5; BOTH 0.8 to 0.95; SHORTED 0.5 | +20.3 to +22.0 |

Only two habits move the town: "after you cut and they held" and "after you both cut". Both must be near zero. Every attack below works through them.

### 2.2 Staged precedents and the PG10 cap

The fresh confirmation pool is 2,320,001..2,322,000 (honest 16.6%, cap 26.6) [m: out/attacks-all.txt, confirmation 1].

| Scheme | Kept | Seal | Seal/kept |
|---|---|---|---|
| owing-maker d7 soft+habit12 (honest, stage day 7) | 39.6% | 22.1% | 0.58 |
| plain seller, stage day 7, day 12 by habit | 41.1% | 21.9% | 0.54 |
| sealer, stage day 7, days 9–12 by habit | 36.6% | 19.8% | 0.57 |
| sealer, stage day 6 | 35.9% | 19.6% | 0.58 |
| sealer, stage day 5 | 32.6% | 18.7% | 0.59 |
| honest | 49.6% | 16.6% | 0.34 |

- Over every fresh band, owing-maker d7 gets 904/4000 = 22.6%; honest gets 16.9% (cap 26.9). Measured, pooled from out/top-stagers-main1000.txt, out/attacks-all.txt and out/season-check-merged.txt.
- On the dev screen, staging on days 2 to 4, staging twice, or staging against the kin, the first stall or the firmest stall all did worse [m: out/screen-merged.txt].

Other probes, each on the main 400 seeds unless noted [m: out/battery-400-table.txt, out/screen-merged.txt]:
- **Retaliation staging** (days 4 to 8): 18.5–21.0%.
- **The sister.** "Careful with sister" gets 12.3% and "always hold with sister" 12.5%. Staging against the kin gets 18.0–18.3% on the season band, on days 8 and 10 [m: out/season-check-merged.txt], and 18.7% on dev, on day 7 [m: out/screen-merged.txt].
- **Milking.** Cutting the softest stall every day from day 4 gets 9.3%. The milkers get 0.0%.
- **Season-end timing.** Cutting non-kin on round days 4 and 8 gets 3.5%. Staging on day 8 is covered in §3.
- **Store first, then the town** (the place's twist: a cut never lowers the store): 0.0% for the careful base, 16.3–19.0% for the honest base.
- **The gap left by having no season "bought" clause.** The test holds where habit says cut on days 9 to 11, for the store, with a stage on day 7. It got 17.0% and 13.3%, against 22.0–22.3% and 19.7% for the same seller without the store grab (dev). The lost mark costs more than the store gains.

### 2.3 PG10's ratio part: one recipe on the line (risk R1)

- **The recipe ("nc", in `cs-schemes.js`):**
  1. Hold with a new stall, and while both hold.
  2. After a stall cuts you, wait up to 3 days, then cut.
  3. After you cut and they held, cut. After you both cut, cut.
  4. On day 4, if you have never been in "after you cut and they held", cut once against the stall held with that most readily holds after being cut on.
  5. Play days 9 to 12 by your own habit.
- **Why the 0.8 line is reached.** The staged cut sets the first lever before the season window. "After you both cut" stays at zero. The Life ends with ties broken. In the Lives where the store still covers the need, the mark clears 20 about four times in five.
- **The unsealed kept Lives.** Of 715 kept Lives on fresh seeds, all 139 unsealed ones are "mark not clear" (median mark +16.8). No clause withholds any of them [m: out/ncd4-unsealed.txt].

Pooled over the fresh bands [m: out/ratio-pooled-fresh.txt, out/ratio-pooled-round4.txt]:

| Scheme | Fresh seeds | Kept | Seal | Seal/kept (se) |
|---|---|---|---|---|
| nc: stage d4 soft | 10,000 | 9.1% | 7.2% | 724/909 = 0.796 (0.013) |
| nc: stage d4 soft, patience 4 | 8,000 | 9.4% | 7.5% | 604/754 = 0.801 (0.015) |
| nc: stage d4 soft, patience 6 | 8,000 | 9.3% | 7.4% | 592/741 = 0.799 (0.015) |
| nc: stage d4, kin or not | 6,000 | 9.1% | 7.3% | 435/543 = 0.801 (0.017) |
| nc: stage d4 soft, habit from day 8 | 6,000 | 8.7% | 6.8% | 405/522 = 0.776 (0.018) |
| nc: stage d5 / d6 / d7 | 2,000 each | 14.6–21.6% | 11.1–16.1% | 0.70–0.76 |
| nc: stage d3 | 4,000 | 4.6% | 3.4% | 0.730 |
| nc: two staged cuts (d4 and d6, or d4 and d7) | 10,000 each | 0.9–1.1% | 0.6–0.8% | 0.69 / 0.72 |
| nc: no stage (same seller, never stages) | 2,000 | 34.9% | 8.1% | 0.231 |

What this means:
- Dev pools read higher, which is the winner's curse. On 1000 dev seeds nc d4 read 0.86. Across these variants, single pools of 1000 to 3000 seeds read from 0.72 to 0.89. The ratio for this recipe passes or fails by pool [m: out/attacks-all.txt].
- **It does not buy seals.** Staging takes the seller from 8.1% to 7.2% sealed, because it throws away kept Lives that would not be sealed. Honest gets about 17%. The cap part passes by far.
- **Not a blocking break** [argued]: no pooled reading is clear of 0.8, and the recipe earns fewer seals than honest play.
- **If the lead wants the ratio part clear here,** two options [argued, not run]:
  - read the ratio only for policies whose seal rate is at least honest's (the cases the ratio exists to catch);
  - or state a margin (for example, 0.8 + 2 se).

### 2.4 Late acts against habit (days 9–12)

Fresh band 2,330,001..2,331,000; honest 17.4% [m: out/season-check-merged.txt]. Dev rows are from out/screen-merged.txt.

| Scheme | Seal (season) | Seal if REPLAY were 'habit' |
|---|---|---|
| honest + cut every stall on day 9, then day 12 by habit | 2.5% | 5.3% |
| honest + cut every stall on days 9–11 | 1.3% | 2.6% |
| honest + cut the softest stall after both held on days 9, 10, 11 | 8.0% | 15.2% |
| honest + cut on day 10, on days 9–10, or on days 9–12 (dev) | 1.0–2.0% | 2.0–5.7% |
| honest + put the price back on days 9–11 (dev) | 11.7% | 11.7% |
| honest + play the habit it had before day 9 on days 9–12 (dev) | 16.7% | 16.7% (honest 17.0 / 21.0) |

Every late act scores below honest.

## 3. The season replay (REPLAY 'season')

### 3.1 What FIX.md 2.1 says, checked on fresh seeds

Fresh band 2,330,001..2,331,000, 1000 seeds [m: out/season-check-merged.txt]. "Seal if habit" is the seal from the same verdicts with the season clause dropped. `cs-habitcheck.js` checked this against the engine run with REPLAY 'habit': it matched in 58 of 58 kept Lives, 28 of them with a season entry [m: out/habitcheck.txt].

| Scheme | Seal (season) | Seal if habit | Its unstaged base (season) |
|---|---|---|---|
| plain seller, staged d8 / d9 / d10 / d11, day 12 by habit | 11.9 / 12.5 / 12.5 / 12.5% | 25.4 / 28.5 / 29.0 / 19.0% | 12.5% |
| honest, staged d8 / d9 / d10 / d11 (soft stall), day 12 by habit | 18.3% each | 25.0 / 26.7 / 27.4 / 22.4% | honest+habit12 18.3% |
| honest, staged d8 / d10 against the kin | 18.0 / 18.3% | 23.8 / 25.6% | 18.3% |
| staged d7 (outside the window, for contrast) | 21.2–23.0% | 22.6–23.7% | |
| honest | 17.4% | 20.9% | |

- **A staged precedent on days 8 to 11 no longer buys the seal** [m: out/season-sameseeds.txt].
  - Staged on days 9, 10 or 11: the sealed seeds are exactly the unstaged base's (183 of 183, 125 of 125).
  - Staged on day 8: the same number or fewer (183 vs 183, 180 vs 183, 119 vs 125). The staged cut itself falls before the window and changes the Life, but adds no seal.
- **Honest is not punished beyond what the fixer measured.**
  - Measured like the fixer (all Lives of the first 200 seeds), the season clause withheld honest's seal in 9.5% and 6.5% of Lives, against the fixer's 8.0% [m: out/honest-wons-first200.txt].
  - Over 4000 fresh seeds honest gets 16.9% with the season clause, and would get 20.2% without it [m: out/why-honest.txt, out/season-check-merged.txt, out/attacks-all.txt].

### 3.2 Who pays: risk R2

Honest kept Lives on 2,302,001..2,303,000, by the day "after you cut and they held" was first met [m: out/why-honest-days.txt, out/why-honest.txt]:

| First met | Kept | Mark clear | Sealed | Withheld by the season clause |
|---|---|---|---|---|
| days 2–8 | 330 | 182 | 169 | 0 |
| days 9–12 | 62 | 43 | 0 | 43 (34 after the boy's slip, 9 after its own cut) |
| never | 90 | 1 | 1 | 0 |

- **What happens.** The replay plays the guild's rule ("put the price back") in a situation never met before day 9. So the seller's first answer there counts as a staged precedent, even when it came from a slip the seller did not choose.
- **What the player sees.** A clear mark (for example +36.7 on seed 2,302,086) and no seal, with no word why.
- **Fixed ways too.** Ways that never change their habit lose seals the same way. Over 40 seeds, pure 0/1 ways had 18 kept Lives with a clear mark. 7 were sealed and 11 were withheld by the season clause. The Saltmarket's own best way, [1,1,1,0,0], had 2 sealed and 6 withheld [m: out/sgrid-wons.txt].
- **A narrower rule** might help: treat a situation first entered through the house's own lost hand as tested [argued, not run]. A slip cannot be staged. It would restore most of the 34 slip cases, but not the 9 own-cut cases.

## 4. Page facts

Measured on 99,999 seeds, 2,300,001..2,399,999, Lives only. That is the whole allotted range, one seed short of 100,000 [m: out/pagefacts.txt].

**The need.**
- Always a whole number from 78 to 176.
- Never at or below 0, never above 300.
- It does not depend on how the house plays: it is identical seed by seed under all 8 policies (same checksum).
- The guild's rule's own purse runs 24 to 175.
- Distribution: 70s 5; 80s 189; 90s 4,554; 100s 18,646; 110s 31,947; 120s 28,535; 130s 10,338; 140s 5,298; 150s 388; 160s 77; 170s 22.

| Policy | Store at the end: lowest | highest | Lowest during the Life | Kept |
|---|---|---|---|---|
| always hold | 30 | 181 | −4 | 57.2% |
| never hold | 9 | 84 | 0 | 0.0% |
| honest | 39 | 173 | −4 | 48.7% |
| careful | 62 | 180 | −4 | 80.3% |
| bully | 9 | 121 | 0 | 0.0% |
| milker | 59 | 173 | −1 | 57.9% |
| [1,1,0,0,0] | 15 | 167 | −4 | 2.2% |
| stage-day-7 sealer | 28 | 181 | −4 | 35.1% |

- **Below zero.** The store can go below zero, to −4 (seed 2,300,656). The page must draw below the zero line.
  - A pair pays at worst −1 a day. So −4 means four pairs where the house held alone, most likely all on day 1 [argued].
- **Day gain and payoffs.** The day's gain runs −4 to +16. Each pair's payoff is always −1, 0, 3 or 4, and every number is whole.
- **Bounds** [argued]: 4 ties × 12 days give a store between −48 and 192. The measured range is −4 to 181.

## 5. Risks and minor findings

1. **R1, PG10's ratio on the line** (§2.3). Not blocking. The lead may want a reading for policies that seal less often than honest.
2. **R2, a late first slip costs the seal** (§3.2). By design of the season replay, not blocking. It is about 3.3 points of honest's seal (16.9 against 20.2). The page passes it silently.
3. **The cap margin is about 4 points** (22.6 against 26.9 pooled) for staging on day 6 or 7. On one 200-seed band it came within 1.0 point (26.5 against 27.5) [m: out/gates-400-battery.txt]. A preset change that lifts the stagers or lowers honest could cross it.
4. **PG12(a) at the shipped counts is a 40-seed count.** It was #28 here and #13 on the fixer's band.
5. **The day-12 cost clause withholds honest's seal** in 32 of 482 kept Lives. This is R2's "cost" clause, unchanged from REPLAY 'habit' [m: out/why-honest.txt].
6. **The need range** on 99,999 seeds (78..176) is a little wider than the fixer's 86..176. Both are well inside (0, 300].
7. **A small bug in my own scheme file, not the engine.** The `guard` option in `cs-schemes.js` never fires, so the "guard" sealers equal the unstaged seller. Their rows are labelled so in out/screen-merged.txt. No conclusion rests on them.

## 6. How to re-run

```
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc
cd <this folder>
$JSC cs.js cs-pg14.js -- '{"seeds":[2304101,20]}'          # PG14 (quiet machine)
./run-gates.sh; ./run-bat400.sh                               # part 1 (battery, placelab gates, PG12(a) grid)
./run-screen.sh; ./run-screen2.sh; ./run-screen3.sh; ./run-screen4.sh   # part 2 screens (dev)
./run-confirm.sh; ./run-confirm2.sh; ./run-confirm3.sh; ./run-confirm4.sh   # part 2 fresh confirmations
./run-season.sh                                               # part 3
$JSC cs.js cs-schemes.js cs-why.js -- '{"pol":"honest","seal":[2302001,1000]}'
$JSC cs.js cs-schemes.js cs-pagefacts.js -- '{"seeds":[2300001,99999],"pol":"honest"}'
```

`run-gates.sh` starts all 109 policies on 1000 seal seeds. I stopped that battery after its first 19 policies (kept in out/bat1000/) because the machine was overloaded. `run-bat400.sh` ran the other 90 on the first 400 of those seeds, and `cs-trunc.js` cuts the 19 to the same 400 for pooling.

Merges: `cs-gate-read.js` (PG reading per 2.6), `cs-merge.js`, `cs-pool.js`, `cs-sgrid-merge.js`, `cs-sgrid-wons.js`, `cs-trunc.js`, `cs-why-days.js`.

## 7. Seeds (all inside 2,300,001..2,399,999)

| Use | Seeds |
|---|---|
| lives (PG1, PG11, PG13) | 2,300,001..2,302,000 |
| seal | 2,302,001..2,303,000 (19 core policies and the top stagers); 2,302,001..2,302,400 (all 109) |
| grid / spread / g6 / mirror / pull | 2,303,001..012 / 2,303,101..220 / 2,303,301..420 / 2,303,501..620 / 2,303,701..740 |
| sealGrid (placelab) / PG12(a) at shipped counts | 2,303,801..812 / 2,303,901..940 |
| det / speed | 2,304,001..002 / 2,304,101..120 |
| attack dev screens | 2,310,001..2,311,000 (kept over 2,311,001..2,313,000) |
| lever study | 2,315,001..040 |
| fresh confirmations | 2,320,001..2,322,000; 2,326,001..2,328,000; 2,350,001..2,356,000; 2,360,001..2,376,000 |
| season check | 2,330,001..2,331,000 (kept over 2,331,001..2,333,000); habit check 2,335,001..040 |
| page facts (Lives only) | 2,300,001..2,399,999 |

The confirmation bands from 2,350,001 up were used before only for the Lives-only page facts. That involved no selection.
