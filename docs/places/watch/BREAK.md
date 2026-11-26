> **Record of its time.** Written 2026-11-25 13:50 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Watch [watch]: break report

**What I attacked:** `tune-watch/preset.json`, installed as `AfterYou.PLACES.watch` the same way `tune-watch/final-gates.js` does it. The honest policy, the selfish act and the four Watch schemes come from `tune-watch/policies.js`, loaded unchanged. The engine and lab are `e1/engine-places.js` and `e1/placelab.js`, also unchanged.

Everything here was written in `break-watch/` (called `bw/` below). Nothing outside it was edited. The common loader is `bw/bw.js`. It checks that every preset value is actually in force before running anything.

**Labels:**
- **[m: file]**: measured by a script in `bw/`; the file named is its output.
- **[argued]**: reasoned, not run.

**Seeds:** all fresh, and all from 51001 up. The tuner used these ranges, and I avoided every one of them:
- 1 to about 20040;
- 50001–50120 (G6 tuning);
- 60001, 70001, 80001 and 90001 up;
- 100001 up (their gates);
- 200001 up.

The gate bands are 51001–54213. The seal bands are 53001, 55001 and 56001–56520 in steps of 40. Kept rates use 51001–53000 and 57001–59000.

**Counts** are the shipped ones (2000 headline futures, 1000 for the last-day replay) unless a line says otherwise.

**Load:** the machine ran at a load average of 45–100 throughout. That matters only for PG14.

## 0. Verdict: broken

Two of the tuner's passing gates fail on fresh seeds:

- **PG12 (blocking): fails.**
  - **(a) fails.** The valley's best fixed way `[1,1,0.5,1,0]` ranks in the Watch's top 10 by seal:
    - #7 in the tuner's own form (24 seeds at 200/200);
    - #5 (#3 if ties share a rank) at the shipped 2000/1000 counts on 24 seeds;
    - **#3 on 48 seeds** at 2000/1000 (#2 on the second 24 alone).
  - **(b) misses:** Spearman is 0.96.
  - The Watch's exemption needs both (a) and (c), so PG12 fails.
  - The cause is structural. The Watch's custom `[0,1,1,1,0]` is the valley's best carried way, and it is also the Watch's own best carried way on average. The Watch's futures rank ways like the valley's. So no way can beat the custom in the futures, fixed ways almost never earn the seal, and (a) is settled by ties.
- **PG11 (blocking by the gate's letter): fails on 3 of 11 fresh 40-seed bands.** Honest's seal is 7.5, 5.0 and 7.5% on those bands, against a floor of 10%. Pooled over 440 seeds it is 12.3 ± 1.6%, so about a quarter of 40-seed draws land below the floor. A page-true honest is still below 10% on 2 of 12 bands.

**No recipe found.** I tried 31 schemes beyond the battery (30 in `schemes.js`, plus cold+selfish1) (§3):
- milking;
- timing a betrayal before a season's end;
- playing the sister differently;
- going against habit on days 9–11;
- deviations on day 12 that R2 cannot see;
- standing down to everyone;
- a showman who is rich at each season's end.

None earns the seal above max(1.5 × honest, honest + 10) on any band, and none exceeds a seal/kept of 0.8. The seal cannot be bought on the last days: selfish 1, 2 and 3 never beat honest on any of the 23 band readings.

**Minor findings:**
- The honest policy reads a record the page hides after a tower changes a way (§2.3).
- `cold` matches or beats honest (go first only to your sister; answer anyone who stands down). Combined with the carried result that going first costs and reopening a standoff earns nothing, this means the mark does not teach the lesson that going first is the hard act (§2.4).
- PG14 fails as logged under load, but CPU time passes (§2.5).

## 1. Every gate re-run on fresh seeds

The main run is `gates()` at the 'full' scale, plus the tuner's two raised counts (pull 200 seeds, sealGrid 24 seeds). It was split into four processes [m: `gates-A-out.txt` (PG1, 2, 10, 11, 13), `gates-B-out.txt` (PG3, 4, 7, 12), `gates-C-out.txt` (PG6), `gates-D-out.txt` (PG5, 8, 9, 14); script `gates-fresh.js`].

Bands:

| Band | Seeds |
|---|---|
| lives | 51001–53000 |
| seal | 53001–53040 |
| grid | 53101–53112 |
| spread | 53201–53320 |
| g6 | 53401–53520 |
| mirror | 53601–53720 |
| pull | 53801–54000 |
| sealGrid | 54101–54124 |
| det | 54201–54202 |
| speed | 54211–54213 |

Extra seal bands, 40 seeds each at 2000/1000 [m: `bands-orig-sum-out.txt`, `bands-pt-sum-out.txt`, `bands-g-sum-out.txt`, `scr1-*-out.txt`, `scr2-*-out.txt`]:
- 56001–56361 (10 bands; 11 with the gate band 53001);
- 55001 for the page-true honest and the `a3` analysis;
- 56401–56481 for the second screen.

| Gate | Tuner (100001+) | Mine (fresh) | Result |
|---|---|---|---|
| PG1 honest kept 35–65 | 55.4 | 57.6 (51001–53000); 56.6 (57001–59000) | holds |
| PG2 last days | 12.5 / 15.0 / 12.5 vs 12.5 | 7.5 / 5.0 / 5.0 vs 7.5. On all 11 bands no selfish run beats honest: pooled 10.0 / 9.1 / 7.5 against 12.3 (440 seeds). Page-true versions on 12 bands: 10.8 / 10.2 / 8.8 against 13.3 | holds |
| PG3 spread | 95.8% | 95.8% (median 42.3) | holds |
| PG4 no trivial way | 100% (best on average [0,1,0.5,1,1]) | 100%; **best on average [0,1,1,1,0], the custom itself** | holds (see §2.1) |
| PG5 determinism | 0 differ | 0 differ of 852,427 shared draws | holds |
| PG6 a habit matters | 79.2% | 77.5% (median 7.7) | holds |
| PG7 not a lottery | 94.2% | 96.7% (median 46.0) | holds |
| PG8 mirror | 100% | 100% | holds |
| PG9 situations | 5 (min 4) | 5 (min 4) | holds |
| PG10 no recipe | max 15.0 vs cap 22.5; s/k max 0.29 | Gate band: max 15.0 (always, brave) vs cap 17.5. s/k max 0.72 (always: 15.0 seal over 40 seeds against 20.8 kept over 2000 Lives). No policy over the cap on any of 14 bands (§3) | holds |
| **PG11 trade + honest seal 10–40** | 12.5 | **7.5 on the gate band: gates() prints FAIL.** By band: 7.5, 5.0, 10.0, 17.5, 10.0, 17.5, 7.5, 12.5, 20.0, 12.5, 15.0, so **3 of 11 bands < 10**. The trade exists (careful+grab 61.3% / −11.7 against honest 57.6% / +4.6) | **broken (§2.2)** |
| **PG12 different from the valley** | (a) #15, (b) 0.97, (c) NEW mark +0.6 vs −1.5 | **(a) #7 at 200/200; #5 at 2000/1000 (24 seeds); #3 at 2000/1000 (48 seeds).** (b) 0.96. (c) NEW mark +0.3 ± 0.1 vs −1.5 (weaker) | **broken (§2.1)** |
| PG13 page sanity | need 98..198 | need 103..207; all whole | holds |
| PG14 cost ≤ 1.5 s | FAIL as logged | gates() 2.97–3.55 s wall at load 50–80 (FAIL as logged). CPU time is 1.33–1.34 s per verdict even under load, against the valley's careful at 1.14–1.15 s at the same moments [m: `t-cost-out.txt`] | holds on CPU time (§2.5) |

## 2. Breaks

### 2.1 PG12 fails: in its futures the Watch is the valley with the valley's best way as custom (blocking)

**Evidence for (a), on fresh seeds:**
- **Tuner's form** (sealGrid 24 seeds 54101–54124 at 200/200) [m: `gates-B-out.txt`]: `[1,1,0.5,1,0]` ranks **#7**. Only 3 of 243 ways earn a seal at all, each 1 of 24, so ranks #4–#243 are ties at 0, broken by kept rate. The valley's best way keeps the house often, so it sits high.
- **At the shipped counts** (2000/1000), the rule under which `valley-best.js` found the valley's best:
  - 24 seeds: **#5 (#3 with ties shared)**; it earns the seal in 1 of 24 and keeps 33.3% [m: `sg-merge-out.txt`].
  - 48 seeds: **#3** (2 seals of 48, kept 41.7%); on the second 24 seeds alone **#2** [m: `sg-merge48-out.txt`, `sg-merge-2nd24-out.txt`]. The tenth way earns 1 seal in 48.
  - Only 14 of 243 fixed ways earn any seal on 24 seeds, and 19 on 48. The best earns 2 of 24, then 3 of 48.

**Evidence for (b):** Spearman 0.96 on 12 fresh seeds [m: `gates-B-out.txt`]; the tuner had 0.97.

**Why: the mechanism, measured:**
- **The custom is the best carried way, in both places.**
  - In the Watch, the best carried way on average over 12 fresh seeds is the custom `[0,1,1,1,0]` [m: `gates-B-out.txt`, PG4 line]. On 8 other fresh seeds the top 15 carried ways have marks from +0.8 down to −3.3 against the custom's own baseline; the custom carried scores −0.8 [m: `a1-grid-out.txt`, 200 futures].
  - In the valley the same `[0,1,1,1,0]` is the best carried way: +14.3 on 8 seeds [m: `a1-grid-valley-out.txt`]; +14.4 ± 0.9 on 40 seeds [m: `a5-carried-valley-out.txt`].
  - So the Watch took the valley's best way as its custom, and its futures rank ways like the valley's.
  - The Watch's futures leave almost no room above the custom. No grid way is carried above +0.8, and the best off-grid way found (honest's heir, below) reaches +4.2 ± 0.8. Both fall short of the seal's +5 + 2 se. The mark of a lived Life comes almost entirely from how the twelve days leave the ring (who copied whom, how each tie stands at the end), not from the ways.
- **The futures do not reward the place's two lessons.** Heir and kin carry a way in the custom's Life; 40 seeds × 1000 futures [m: `a5-carried-out.txt`]:
  - going first to strangers (NEW 1 − 0) costs −1.7 ± 0.2 (with never-reopen);
  - reopening a standoff (NEITHER 1 − 0) gives −0.9 ± 1.4 (no effect);
  - `[1,1,1,1,1]` against the custom gives −1.0 ± 1.4.
  - The one way clearly above the custom is honest's own heir `[1,1,0.71,1,0.27]`, at +4.2 ± 0.8, followed by `[0,1,0.5,1,0.5]` at +1.7 ± 0.9. Both forgive fewer fires than the custom; that this is the reason is [argued].
- **The seal partly belongs to the seed rather than to the play** [m: `a6-lottery-out.txt`, 440 seeds]:
  - each policy's marks correlate across policies at 0.38–0.82 seed by seed;
  - P(cold sealed | honest sealed) is 0.50, against cold's base rate of 0.15;
  - on the gate band, corr(need, custom's baseline) is +0.35, so low-need seeds are also seeds where the custom's border is weak.

**Fix:**
- The gate cannot be passed by re-tuning PG12's counts. (a) is noise-dominated here: fixed ways almost never earn the seal.
- The place needs a difference in the futures. Tried as experiments, on carried marks only [m: `a7-*-out.txt`; engine copy `engine-exp.js`, one line changed under `params.NEWCOMER`; its default reproduces `a5-carried-out.txt` exactly; not identity-checked, not a proposal]:
  - A fearful newcomer that answers (`[0,1,x,1,0.3+x]`) instead of the taker: going first becomes 0.0 ± 0.1 and reopening +1.1 ± 1.6. **Not enough.**
  - **More false alarms (FOG 0.12):** reopening a standoff becomes worth **+4.8 ± 0.7**, and **+9.9 ± 1.1** with the fearful newcomer as well. The valley's reopening is −16.1 ± 1.8. So "let a false alarm pass and reopen" would then be a real difference in the futures, matching the lesson, and (b) should fall [argued].
  - FOG 0.12 moves everything else, so the place needs re-tuning. The tuner found the day-1 pull (c) weakening at FOG 0.065–0.07, so the trade-off must be re-measured.
- The alternative is a design-lead decision: accept the Watch on (c) alone, with (a) and (b) reported as missed.

### 2.2 PG11: honest's seal sits on the 10% floor (blocking by the gate's letter)

**Evidence.** Honest's seal by 40-seed band at 2000/1000 [m: `bands-orig-sum-out.txt`; the gate band also in `gates-A-out.txt`]:

| Band | 53001 | 56001 | 56041 | 56081 | 56121 | 56161 | 56201 | 56241 | 56281 | 56321 | 56361 | Pooled (440) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Seal % | **7.5** | **5.0** | 10.0 | 17.5 | 10.0 | 17.5 | **7.5** | 12.5 | 20.0 | 12.5 | 15.0 | 12.3 ± 1.6 |

- Three more bands read 12.5, 15.0 and 20.0 [m: `scr2-*-out.txt`]. A fourth, 55001, reads 17.5 [m: `a3-why-out.txt`].
- The page-true honest of §2.3 pools to 13.3 ± 1.6% and is still below 10 on 56001 and 56201 [m: `bands-pt-sum-out.txt`].
- At p ≈ 0.12, a 40-seed band reads ≤ 3 of 40 about 26% of the time [argued, binomial]; I observed 3 of 11 bands (27%). The tuner's risk 1 predicted 17%.

**Fix (pick one):**
- **(i)** Raise honest's seal to about 18–20%, so that the floor is three standard errors away at 40 seeds. The tuner's R_LIFE 2 gave about 20% (`q31`). A lower MARGIN raises kept, and the seal with it, but honest's kept must stay ≤ 65.
- **(ii)** Have the design lead measure PG11's seal clause on ≥ 200 seeds. The pooled 12.3 ± 1.6 passes.
- (ii) costs nothing, but leaves the Watch with the lowest honest seal of the pack [argued].

### 2.3 The honest policy reads a record the page no longer shows (minor; lab artefact)

**What happens:**
- `WATCH.honest` judges a tower by `nb.seen`, its whole-Life record.
- After a tower changes a way at a season's end, the page shows only `seenSince`: "They changed a way at the end of day 8. Counted since then." (`app.js knowNodes`, lines 1009–1012; `words.js` 178–180).
- When the taker copies the player's ways (it becomes `[1,1,0.75,1,0.33]`), a person reading the cards sees a fresh record and stands down. `WATCH.honest` still sees "refused three times", and keeps watch for the rest of the Life.
- These are exactly the Lives with the highest marks: a reformed taker improves the border.

**Seed 53010** [m: `a4-change-out.txt`]:
- The taker copied the player at day 8.
- Honest kept watch on it on days 9–12 and ended 147 against a need of 155, with a mark of +32: no seal.
- The page-true version stands down to the reformed taker on day 9; they stand down together on days 11 and 12, and it ends at 162: kept.
- `always`, which never stops standing down, kept the house and earned the seal.

**Size.** The page-true honest (`schemes.js` honestPT: reads `seenSince` after a change and gives fresh second chances):
- kept 57.5% against 56.6% (57001–59000) [m: `scr2-*-out.txt`];
- seal 12.7% against 12.3% on the same 440 seeds (11 bands) [m: `bands-pt-sum-out.txt`, `bands-orig-sum-out.txt`]; with band 55001 added, 13.3% against 12.7% (that band reads 20.0 against 17.5 [m: `a3-why-out.txt`]).

The tuner's `first`, `brave` and `expected()` (the selfish act) have the same reading.

**Fix:** use `nb.changedDay !== null ? nb.seenSince : nb.seen`, and reset that tower's second chances when its `changedDay` changes (code in `bw/schemes.js`, `honestPT` / `selfishPT`).

**The rest of the honest policy is playable from the cards [argued]:**
- "does it stand down after someone went first" is the tower's row "after leaving the other short";
- two second chances per tower can be kept in the head.

**Its one oddity:** it stands down to the taker four times (days 1, 2, 3 and 5; trace of 55001–55004 [m: `a2-trace-out.txt`]). That costs about 12 measures, and is the likely reason [argued] `first` keeps 64.1–64.3% against honest's 56.6–57.6% [m: `gates-A-out.txt`, `scr1-0-out.txt`, `scr2-*-out.txt`].

### 2.4 The mark does not teach "going first"; `cold` does as well as honest (minor, design)

`cold` is the valley's careful with a cold opening. It stands down on day 1 only to the sister, then only to towers that have stood down.

**Seal by band**, cold against honest [m: `bands-orig-sum-out.txt`, `scr2-*-out.txt`]:

| Band | 53001 | 56001 | 56041 | 56081 | 56121 | 56161 | 56201 | 56241 | 56281 | 56321 | 56361 | 56401 | 56441 | 56481 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| cold | 12.5 | 0 | 15 | 15 | 10 | 12.5 | 10 | 20 | 27.5 | 17.5 | 20 | 12.5 | **25.0** | 22.5 |
| honest | 7.5 | 5 | 10 | 17.5 | 10 | 17.5 | 7.5 | 12.5 | 20 | 12.5 | 15 | 12.5 | 15.0 | 20 |

- Pooled over the 11 main bands: cold 14.5% (mark +4.2 ± 0.4) against honest 12.3% (+3.6 ± 0.4).
- Kept over 2000 Lives: 57.8% against 56.6% on 57001–59000 [m: `scr2-*-out.txt`], and 56.8% against 57.6% on 51001–53000 [m: `gates-A-out.txt`]. Equal within noise.
- On band 56441, cold's 25.0 equals the PG10 cap (15 + 10) exactly. "More than the cap" is not met, so it is not a failure, but it has no margin.

**Why:**
- In the futures, going first costs (−1.7 ± 0.2) and reopening a standoff earns nothing (§2.1).
- In the Life, the only tower worth going first to is the sister. She never goes first and always answers.
- Soft, firm and steady towers go first themselves. The wary eventually go first (truce 0.3–0.5). The taker never answers.
- So "peace fails from fear; going first is the hard act" reduces to one act, standing down to your sister on day 1. The Chronicle's mark never rewards going first.

**Fix:** the FOG 0.12 direction of §2.1 makes reopening after a standoff worth +4.8..+9.9 in the futures [m: `a7-fog12*-out.txt`], which would put the second half of the lesson ("let a false alarm pass") into the mark. Otherwise, reword the lesson to what the place actually rewards.

### 2.5 PG14 under load (minor; measurement)

- gates() logs 2.97–3.55 s wall per full verdict at load 50–80: FAIL as written [m: `gates-D-out.txt`].
- CPU time per full verdict (`/usr/bin/time`, 1 warm-up and 3 verdicts) is **1.33–1.34 s** for the Watch and 1.14–1.15 s for the valley's careful at the same moments (load 74–85), a ratio of 1.16–1.18 [m: `t-cost-out.txt`; user time over 4 verdicts, which includes the warm-up and the Lives played].
- CPU time is itself inflated under contention, so on a quiet machine the Watch should sit near the tuner's 1.0–1.1 s [argued].
- Re-time `tune-watch/final-pg14.js` on a quiet machine before shipping.

## 3. Recipe hunt (no recipe)

All at 2000/1000 on fresh 40-seed bands. Kept is over 2000 Lives (57001–59000) unless marked S (kept over the 40 seal seeds). Seal is %; the cap is the band's PG10 cap.

**Band 56001** (honest 5.0, cap 15.0) [m: `scr1-*-out.txt`]:

| Policy | Kept | Mark | Seal |
|---|---|---|---|
| captain, chances days 9–11 | 55.8 | +2.6 | 7.5 |
| sister watch day 1, honest | 43.9 | +1.4 | 7.5 |
| honest, shape ways days 9–11 (stand down after every fire and standoff) | 41.5 | −1.3 | 5.0 |
| honest, shape days 10–11 | 46.7 | −0.3 | 2.5 |
| captain, shape days 9–11 | 48.5 | +2.2 | 5.0 |
| honest, selfish days 9–11 only | 55.4 | −3.9 | 5.0 |
| honest, selfish days 10–11 only | 56.0 | −1.1 | 5.0 |
| honest, selfish day 11 only | 56.6 | +0.4 | 5.0 |
| honest, day 12 by habit | 56.0 | +2.0 | 5.0 |
| honest, hidden selfish day 12 (keep watch where that is with habit; R2 cannot see it) | 56.8 | +2.1 | 5.0 |
| honest, hidden selfish days 10–12 | 56.6 | +2.0 | 5.0 |
| honest, day 12 habit-best | 56.0 | +2.0 | 5.0 |
| honest, grab days 9–11 | 16.4 | −27.9 | 0 |
| honest, grab day 11 | 30.3 | −10.7 | 0 |
| honest, give days 9–12 | 36.0 | −1.6 | 5.0 |
| honest, give days 9–11 | 41.5 | −1.3 | 5.0 |
| fast-cut honest | 57.0 | +2.0 | 5.0 |
| captain (fast cut, no chances) | 64.5 | −2.1 | 2.5 |
| sister honest, others captain | 64.5 | −2.1 | 2.5 |
| sister captain, others honest | 56.7 | +2.0 | 5.0 |
| captain, hidden selfish day 12 | 64.6 | −2.2 | 2.5 |
| captain, selfish days 9–11 | 63.5 | −7.2 | 2.5 |
| careful | 66.1 | −3.4 | 0 |
| careful+grab-if-decides | 66.8 | −3.4 | 0 |
| first (no second chances) | 64.3 | −1.6 | 2.5 |
| milker | 58.9 | +2.7 | 0 |
| cold+selfish1 | 58.8 | +2.2 | 0 |

**Bands 56401 / 56441 / 56481** (honest 12.5 / 15.0 / 20.0; caps 22.5 / 25.0 / 30.0) [m: `scr2-*-out.txt`]:

| Policy | Kept | Seals | Marks |
|---|---|---|---|
| honest (page-true) | 57.5 | 12.5 / 17.5 / 20.0 | |
| brave (page-true) | 45.0 | 5.0 / 7.5 / 12.5 | |
| showman (page-true honest; keeps watch unless answered on each season's last two days, to be rich at the looking-round) | 61.5 | 5.0 / 12.5 / 10.0 | −8.3 / −4.7 / −6.9 |
| stand down to all days 1–4, then honest | 52.6 | 12.5 / 15.0 / 17.5 | |
| honest (page-true), hidden selfish day 12 | 57.6 | 12.5 / 17.5 / 20.0 | |
| honest (page-true), always with the sister | 57.5 | 12.5 / 17.5 / 20.0 | |
| cold | 57.8 | 12.5 / 25.0 / 22.5 | |
| cold (page-true rewrite, too cold) | 41.7 | 5.0 / 7.5 / 5.0 | |

**The tuner's battery on 10 more bands** [m: `bands-g-sum-out.txt`, 400 seeds]:

| Policy | Seal (pooled) | Band range | Kept S | s/k on those seeds |
|---|---|---|---|---|
| always | 4.3% | 0–7.5 | 21.3% | 0.20 |
| brave | 11.0% | 5–17.5 | 43.5% | |
| watch-first | 7.5% | 5–12.5 | 22.8% | 0.33 |
| forgiving | 0.3% | | | |

- On the gate band, always and watch-first had seal/kept of 0.55 (6 of 11) and 0.50 (5 of 10) on the seal seeds themselves [m: `gA.json`]. Against kept over 2000 Lives, as PG10 measures it, they were 0.72 and 0.51. None exceeds 0.8.

**What did not work, and why [measured as above; reasons argued]:**
- **Milking:** there is nothing to take. Keeping watch on a tower that stands down earns 5 against 6, so the milker plays exactly as `cold` (identical seals on the gate band).
- **Season-end timing:** grabbing at the looking-round costs both the store and the mark. Kin relearns your ways at day 12, and BOTH is the habit that matters most (carried main effect +14.2 [m: `a1-grid-out.txt`]).
- **Days 9–11 against habit:** this is invisible to R2, but there is nothing to win. Selfish acts lower the mark, and generous ones cost the store (kept falls by about 2.5 points per measure lost [argued, from watch-first against honest]).
- **Day 12 with habit:** R2-invisible acts change nothing measurable.
- **The sister:** every variant either equals honest or costs a day of peace.

## 4. Claims confirmed

- PG1, PG3, PG4, PG5, PG6, PG7, PG8, PG9, PG10 and PG13 pass on fresh seeds at the shipped counts (table in §1).
- PG11's trade exists: careful+grab keeps 61.3% with mark −11.7, against honest's 57.6% and +4.6. careful+grab never earns the seal on 400 seeds, mark −11.9 ± 0.4 [m: `bands-orig-sum-out.txt`].
- **R2 holds:**
  - the selfish act on the last 1/2/3 days never beats honest on any of 23 band readings;
  - pooled, it lowers the seal (12.3 → 10.0 / 9.1 / 7.5) and the mark (+3.6 → +2.2 / +0.8 / −0.5);
  - the clauses do fire: bought reaches at most 10% of a band (honest, shape days 10–11) and won at most 7.5% (cold on 56441; careful+give on the gate band);
  - the replay catches careful+grab in 95–100% of its Lives.
- PG12(c): NEW mark +0.3 ± 0.1 against the valley's −1.5 ± 0.2 on 200 fresh seeds. It still passes, but at half the tuner's +0.6.
- The tuner's reading that PG14 fails from machine load is supported by CPU time (§2.5).
- The tuner's honest policy is a policy a person could play, apart from §2.3.
- Need 103..207 and whole numbers everywhere (PG13).

## 5. Files (all in `bw/`)

**Loaders and policies:**
- `bw.js`: loader; installs `preset.json`.
- `schemes.js`: 30 schemes, including the page-true honest and selfish act.

**Gates:**
- `gates-fresh.js` → `gates-A/B/C/D-out.txt`, `gA.json`.

**Seal grid:**
- `sg-chunk.js` → `sg-0..11.json`;
- `sg-merge.js` → `sg-merge-out.txt` (24 seeds), `sg-merge48-out.txt` (48), `sg-merge-2nd24-out.txt` (second 24 alone).

**Screens and bands:**
- `screen.js` → `scr1-*-out.txt`, `scr2-*-out.txt`;
- `bands.js` → `band-*.json`, `bandg-*.json`, `bandpt-*.json`;
- `to-band.js` (format adapter);
- `bands-sum.js` → `bands-orig-sum-out.txt`, `bands-g-sum-out.txt`, `bands-pt-sum-out.txt`.

**Analyses:**
- `a1-grid.js` → `a1-grid-out.txt`, `a1-grid-valley-out.txt`. The latter's seven "carried" lines were run with the Watch by a bug fixed afterwards; they are not used.
- `a2-trace.js` → `a2-trace-out.txt`; `a3-why.js` → `a3-why-out.txt`; `a4-change.js` → `a4-change-out.txt`.
- `a5-carried.js` → `a5-carried-out.txt`, `a5-carried-valley-out.txt`.
- `a6-lottery.js` → `a6-lottery-out.txt`.
- `a7-newcomer.js` + `engine-exp.js` (experiment only) → `a7-newcomer-taker-out.txt`, `a7-newcomer-wary-out.txt`, `a7-fog12-out.txt`, `a7-fog12-wary-out.txt`.

**Timing:**
- `t-cost.js` → `t-cost-out.txt`.
