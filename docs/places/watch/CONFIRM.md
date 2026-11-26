> **Record of its time.** Written 2026-11-25 19:16 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Watch [watch]: confirmation attack

Folder: `<scratch>/places/confirm-watch/` (called `cw/` below). Every output file named here is in `cw/out/`.

What was tested:
- The engine is `final/engine.js` (md5 `2fa86b599b692dd86cbc8f6ef5c2d13c`), loaded unchanged.
- Every Life is `createLife(seed, 'watch')`, the shipped preset. `cw/cw.js` checks that `AfterYou.PLACES.watch` equals `fix-watch/preset.json` key for key before it runs anything.
- The policies are the fixer's honest policy, selfish act and five Watch schemes (`fix-watch/policies-fw.js`). The breaker's 30 schemes (`break-watch/schemes.js`) run on top of the shipped honest policy, wired the way `fix-watch/rerun/bw-fix.js` does it. My own 75 schemes are in `cw/cx.js`.
- Nothing outside `cw/` was written.

Labels:
- **[m: file]** means measured by a script in `cw/`; the output file is named.
- **[argued]** means reasoned, not run.

Seeds: all in 2,100,001..2,199,999, which nobody had used.

Load: the machine ran at a load average of 60 to 160 for most of the work. PG14 was timed alone, at load 1.8.

## 0. Verdict: holds

| Question | Answer |
|---|---|
| All fourteen gates, read as LEAD-DECISIONS 2.6 says | **14 of 14 pass** on fresh seeds (section 1). |
| A recipe that beats PG10 | **None.** 125 policies were measured on 240 pooled seeds and 19 again on 240 more. None is over the cap. Every one with at least 20 kept Lives has seal/kept at or under 0.48 (section 2). |
| A late act that buys the seal | **Yes, but not above honest play (risk 1).** A store-first player can do it. It plays without second chances, reopens standoffs with the hawk against its own habit on days 9 and 11, and then plays day 12 "by habit" (the reopenings have flipped that habit). R2 never sees it. This lifts the base's seal by +5.4 and +11.3 points (captain) and by +3.3 and +5.8 points (first), on the two pools. It still stays under honest's seal. |
| Honest play punished | It is rare under the shipped rule: 1 of 114 kept-and-clear honest Lives. It is 10 of 114 under REPLAY 'season'. |
| REPLAY 'season' | Every gate passes under it. It closes the days 9-11 lift (it becomes −0.4 to −1.3). It costs honest about 2 points of seal and 'first' about 4. Reopenings started on day 6 still lift 'first' by +4 to +7 under it. **Recommended, with these costs stated** (section 3). |
| Page facts | Measured on 99,999 seeds. The need is always a whole number from 58 to 198. The store ends between −135 and 274 (section 4). |

## 1. The fourteen gates on fresh seeds

How they were run:
- Gate parts with `PlaceLab.gates()` at 'full', plus the fixer's two raised counts (PG12c pulls on 200 seeds, PG12a seal grid on 24 seeds) [m: `gates-A..D-habit.txt`; script `cw/gates.js`].
- PG2, PG10 and PG11 on 240 pooled seeds at 2000/1000, as LEAD-DECISIONS 2.6 asks [m: `merge-A.txt`; scripts `cw/pool.js` and `cw/merge.js`]. Kept rates are over 2000 Lives.
- PG14 alone [m: `pg14-out.txt`].

Bands:

| Band | Seeds |
|---|---|
| lives | 2100001–2102000 |
| pooled seal (pool A) | 2110001–2110240 |
| second pool (pool B) | 2111001–2111240, with kept over 2102001–2104000 |
| grid | 2120001–2120012 |
| spread | 2130001–2130120 |
| g6 | 2140001–2140120 |
| mirror | 2150001–2150120 |
| pull | 2160001–2160200 |
| sealGrid | 2170001–2170024 (gate form); 2171001–2171048 at 2000/1000 |
| det | 2180001–2180002 |
| speed | 2190001–2190011 |
| page facts | 2100001–2199999 |

| Gate | Fixer (`fix-watch/final-gates.txt`) | Mine (fresh) | Pass |
|---|---|---|---|
| PG1 honest kept | 50.1% | 52.4% of 2000 Lives [m: `gates-A-habit.txt`] | yes |
| PG2 last days | 30.0 / 27.5 / 25.0 / 25.0 on 40 seeds | Pooled 240: honest 21.7; selfish on the last 1 / 2 / 3 days 19.6 / 17.5 / 12.1 [m: `merge-A.txt`] | yes |
| PG3 spread | 95.0% (median 43.0) | 94.2% (median 41.8) [m: `gates-B-habit.txt`] | yes |
| PG4 no trivial way | 91.7%, best [0,1,1,1,1] | 91.7%, best [0,1,1,1,1] [m: same] | yes |
| PG5 determinism | 0 differ of 899,939 | 0 of 2 reruns differ; 16 flips; 953,719 shared draws, 0 differ, 0 keys with two values [m: `gates-D-habit.txt`] | yes |
| PG6 a habit matters | 74.2% (median 7.1) | 79.2% (median 7.8) [m: `gates-C-habit.txt`] | yes |
| PG7 not a lottery | 94.2% (median 49.5) | 93.3% (median 48.5) [m: `gates-B-habit.txt`] | yes |
| PG8 mirror | 100% | 100% [m: `gates-D-habit.txt`] | yes |
| PG9 situations | median 5 (min 3) | median 5 (min 3) [m: same] | yes |
| PG10 no recipe | none over cap 45.0; largest s/k 0.64 | Pooled 240: none over cap 32.5. Largest s/k among policies with at least 20 kept is honest's own 0.43 (watch-first 0.42) [m: `merge-A.txt`] | yes |
| PG11 a trade | "first, last night on watch" 50.2% / −4.9; honest seal 30.0 | Same scheme: kept 53.6% (honest 52.4%), mark −7.2 (honest +6.9). Honest seal 21.7% pooled [m: `merge-A.txt`] | yes |
| PG12 different | (a) #20; (b) 0.92; (c) NEW mark, NEITHER store | (a) #18 in the gate form. (b) Spearman 0.94. (c) NEW mark +0.7 ± 0.1 (n 800) against the valley's −1.5 ± 0.2, and NEITHER store +2.8 ± 0.8 (n 97) against −0.7 ± 0.2 [m: `gates-B-habit.txt`] | yes (Watch exemption: (a) and (c) pass) |
| PG12 (a) at 2000/1000 | #22 on 48 seeds | **#22** on 48 seeds. The valley's best never seals (0 of 48), keeps 27.1%, mark −6.1. 21 ways seal at all [m: `sg-merge-out.txt`] | yes |
| PG13 page sanity | need 75..186 | need 79..187 over 21 policies × 2000 Lives; all whole [m: `gates-A-habit.txt`]. 58..198 over 99,999 seeds (section 4) | yes |
| PG14 cost | 1.11 / 1.09 / 1.00 s at load 8 | 1.11 / 1.04 / 1.01 s at load 1.8. Eight more Lives: 0.95–1.13 s (valley careful 0.70–0.94 s). The process's CPU time was 29.4 s for 30 full verdicts [m: `pg14-out.txt`] | yes |

Notes:
- **PG12 (a) is thin in the gate form.** Only 3 of 243 ways seal at all on 24 seeds at 200/200. Rank #18 is decided by kept rate. The 48-seed run at the shipped counts (#22, no seal) is the firmer reading.
- **PG12 (b)** is 0.94, against 0.92 for the fixer. It misses 0.8, which the Watch's exemption allows (LEAD-DECISIONS 2.4).
- **Honest's seal by 40-seed band** over 12 fresh bands (pools A and B) [m: `merge-A.txt`, `merge-B.txt`]:
  - The bands read 25.0, 25.0, 12.5, 10.0, 32.5, 25.0, 12.5, 17.5, 35.0, 22.5, 35.0, 30.0.
  - None is over 40. The fixer's 42.5% band is not repeated.
  - Pooled over 480 seeds it is 23.5% (113 of 480). That matches the fixer's pooled figure of about 24%.
- **'first (no second chances)' is below honest on both pools, paired on the same seeds:** −3.8 ± 1.9 (pool A) and −7.9 ± 2.4 (pool B) [m: `pairs-out.txt`].

## 2. Attack

Every scheme was measured on the 240 seeds of pool A at 2000/1000, with kept over 2000 Lives. Each was compared with honest on the same seeds (paired) [m: `merge-A.txt`]. The ones that mattered were run again on pool B [m: `merge-B.txt`, `pairs-out.txt`].

### 2.1 What was tried (125 policies on pool A)

| Family | Schemes | Best seal (honest 21.7, cap 32.5) |
|---|---|---|
| The battery (21) | the fixer's | honest 21.7; then selfish1 19.6 |
| Breaker's schemes (30) | captain, fast cut, the sister four ways, shaping and selfish acts on days 9–11, hidden day-12 acts, showman, page-true variants | honest, day 12 habit-best: 22.5 |
| Against habit on one day, d = 1..12, both directions (24) | "gen" stands down where habit says keep watch; "sel" keeps watch where habit says stand down and nothing comes back | gen on days 1–8 changes nothing for honest (its habit is to stand down); gen on day 9: 21.3 |
| Against habit on spans 1–4, 5–8, 9–11, 10–11, 11–12, 9–12, three directions (18) | gen, keep watch, flip | gen 5–8: 21.7; every keep-watch and flip span: 0.0–0.4 |
| Store-first bases with late shaping (15) | first or captain, plus shape / reopen / gen on days 9–11 or day 11, plus day 12 by habit | first, gen 9–11, day 12 by habit: 21.3 |
| Sister and heir (4) | sister always on days 9–12; a fire on the sister on day 11; day 1 to the sister only, or to the sister and one stranger (NEW written as 0.5) | 21.7 (no change) |
| Season-end timing (4) | selfish on days 4 and 8, or on 3–4 and 7–8; first then brave; captain then honest | captain then honest: 19.2 |
| False alarms and standoffs (2) | forgive every fire but cut standoffs; reopen every standoff but cut fires | 15.8 |
| Store-max (3) | the selfish act all 12 days; first with day 12 by habit or hidden | 17.9 |
| Late reopening, tuned (6) | reopen against habit on days 9–11 or 6–11, then day 12 by habit, on first, honest and captain | 21.3 |

- **Nothing reaches the PG10 cap in either reading** [m: `merge-A.txt`, `merge-B.txt`].
- The highest seal is honest with day 12 played by habit: +0.8 ± 0.6 over honest (2 Lives).
- Milking cannot work: keeping watch on a tower that stands down pays 6 against 7.
- The selfish last days lower both the mark and the seal (PG2).
- Shaping the ways late always costs honest play: honest, shape 9–11 is −3.8 ± 1.4 (pool A) and −8.3 ± 1.8 (pool B).

### 2.2 The one real finding: late reopening lifts a store-first player (risk 1, not blocking)

The seal gained, paired against the same play without the late acts [m: `pairs-out.txt`]:

| Scheme against its base | Pool A, shipped | Pool B, shipped | Under season (A / B) |
|---|---|---|---|
| captain + reopen against habit on days 9–11, day 12 by habit | 12.9 → 18.3 (**+5.4 ± 1.9**; 17 Lives gained, 4 lost) | 10.4 → 21.7 (**+11.3 ± 2.5**; 33 gained, 6 lost) | −0.8 ± 1.2 / −0.4 ± 1.3 |
| captain, second chances only on days 9–11 | +6.7 ± 2.0 | – | −0.4 ± 1.1 |
| captain, shape ways days 9–11 | +4.6 ± 2.1 | +9.2 ± 2.6 | −2.1 / −1.7 |
| first + reopen against habit on days 9–11, day 12 by habit | 17.9 → 21.3 (**+3.3 ± 1.7**) | 17.5 → 23.3 (**+5.8 ± 2.2**) | −1.3 / −1.3 |
| first + reopen against habit on days 6–11, day 12 by habit | +0.4 ± 1.8 | +3.8 ± 1.9 | **+4.2 ± 2.0 / +6.7 ± 2.2** |
| the same recipe on honest | −0.8 ± 1.4 | −4.2 ± 1.3 | −1.7 / −3.8 |

(gen and reopen are the same scheme here: NEITHER is the only situation where these bases' habit is to keep watch.)

**The mechanism**, traced on the 30 pool-B Lives where captain's recipe seals [m: `why-captgen.txt`; this analysis reads founder kinds]:
- 74 of the 79 reversed acts are toward the hawk (the taker), and the other 5 toward the wary tower. All are stand-downs in a standoff on days 9, 11 and 12.
- Replaying the last season by the old habit costs the border 5 to 32 points (median about 13).
- The first one or two reopenings flip a thin NEITHER tally. Day 12 is then "with habit", so R2 sees nothing on any day.
- The sister learns these ways at day 12. The heir carries them too. Neither ever has to live them.

**How it reads against the rules:**
- This is what the seal-integrity principle forbids: a staged precedent, against habit, late in the Life.
- It is not a break as LEAD-DECISIONS defines one:
  - the lifted seal stays at or under honest's: 18.3 against 21.7, and 21.7 against 25.4 (captain); 21.3 against 21.7, and 23.3 against 25.4 (first);
  - it costs store: kept 47.8–50.0% against 51–52% for honest.

### 2.3 Honest play punished

[m: `punished-out.txt`, `why-hones.txt`, `why-honestB.txt`, `why-first.txt`]

| | Kept with a clear mark | Withheld under the shipped R2 | Withheld only by the season replay |
|---|---|---|---|
| honest (pools A + B) | 114 | **1** (seed 2111125) | **9** |
| first (pools A + B) | 87 | 2 | **19** |

- **The shipped case (2111125).**
  - On day 12 honest kept watch on the hawk after its chances were spent.
  - Its NEITHER tally was 1 of 2. A tie counts as "stand down", so R2 read the act as against habit.
  - Replaying it as a stand-down was worse for the border (delta −2.3), but the "won" clause still withheld the seal.
  - The player cannot see this coming. It happened once in 240 Lives.
- **Every act behind the season losses is toward the hawk** (31 of 31 for honest).
  - Mostly honest kept watch on a hawk that had used up its second chances, while its tally (built from those early chances) said "stand down".
  - Three times honest gave the hawk a second chance in a standoff while its tally said "keep watch".
  - For 'first' (pool A), all 28 acts are reopenings in a standoff that the replay turns into keeping watch. 'first' reopens only toward a tower whose record, as the page shows it, does not show it refusing [argued from the policy].
  - In each case the replay was worse for the border (delta −1 to −31). The seal was withheld only because the mark was clear by less than that delta.
  - From the player's side, one rule was followed all Life [argued]. The page passes a withheld seal silently (LEAD-DECISIONS 1).

## 3. REPLAY 'season'

The override is `{ REPLAY: 'season' }`, with REPLAY_FROM at its default of 9.

One run under season gives both seals:
- On 240 pairs (40 seeds × 6 policies), the Lives and every field the shipped rule reads are identical [m: `ident-out.txt`].
- So the season seal is the shipped seal with `!wonOnSeason` added.

### 3.1 The gates under season

| Gate | Under season | Pass |
|---|---|---|
| PG1, PG13 | 52.4%; need 79..187, whole (identical) [m: `gates-A-season.txt`] | yes |
| PG2 | honest 19.6; selfish 17.9 / 15.8 / 10.8 (pooled 240) [m: `merge-A.txt`] | yes |
| PG3, PG4, PG7, PG12 (b), (c) | identical to the shipped run [m: `gates-B-season.txt`] | yes |
| PG12 (a) | #18 in the gate form; **#22** at 2000/1000 on 48 seeds, 0 of 48 seals [m: `gates-B-season.txt`, `sg-merge-out.txt`] | yes |
| PG5 | 0 differ; 977,618 shared draws; 0 keys with two values [m: `gates-D-season.txt`] | yes |
| PG6 | 79.2% (median 7.8) [m: `gates-C-season.txt`] | yes |
| PG8, PG9 | 100%; median 5 [m: `gates-D-season.txt`] | yes |
| PG10 | none over cap 29.6 (pool A) or 35.6 (pool B); largest s/k 0.45 [m: `merge-A.txt`, `merge-B.txt`] | yes |
| PG11 | the same trade; honest seal 19.6% (pool A), 23.8% (pool B), 21.7% pooled over 480. Three of 12 bands sit exactly on the 10% floor | yes |
| PG14 | 1.10 / 1.05 / 1.02 s; eight more Lives 0.99–1.16 s (a season entry in 3 of 8) [m: `pg14-out.txt`] | yes |

### 3.2 What it does

- **It closes the days 9–11 lift.**
  - Every days 9–11 scheme of section 2.2 falls to its base or below: −0.4 to −2.9 against its base. The day-11-only shaping schemes fall further, −3.3 to −4.6 [m: `pairs-out.txt`].
  - The tuned captain recipe falls from 21.7 to 9.2 on pool B.
- **It costs honest play.**
  - Honest's seal falls 21.7 → 19.6 (A) and 25.4 → 23.8 (B): 9 of 113 seals, about 8%.
  - 'first' falls 17.9 → 13.3 and 17.5 → 14.2: 19 of 85 seals, about 22%.
- **It does not close a reopening started on day 6.**
  - That recipe lifts 'first' by +4.2 ± 2.0 and +6.7 ± 2.2 under season.
  - It still stays under honest: 17.5 against 19.6, and 20.8 against 23.8.
  - Those precedents are lived in season 3 (the sister learns them at day 8). That is the replay's own line [argued].
- **No policy beats honest under season.** The top is honest with day 12 by habit, +0.4.

### 3.3 Recommendation

- Both of LEAD-DECISIONS 2.1's conditions are met:
  - every gate passes under season;
  - it closes a late-act hole that is real here, measured on two pools with the mechanism traced.
- **I recommend adopting it for the Watch, with these costs stated:**
  - about 2 points of honest's seal (about 8% of honest's seals);
  - about 4 points of 'first';
  - seals withheld for acts toward the hawk that follow one consistent rule.
- If the design lead weighs the honest cost above the integrity principle, the shipped R2 is defensible: under it no recipe reaches honest's seal either [argued].

## 4. Page facts

[m: `facts-sum-out.txt`, from `facts-0..3.json`; script `cw/facts.js`]

The run covered 99,999 seeds, every seed in the assigned range. That is one short of 100,000, because the range holds 99,999.

**The need:**
- It is always a whole number, from **58** (seed 2159016) to **198** (seed 2112411).
- No seed gives a need ≤ 0 or > 300.
- The need never depends on the policy (0 exceptions).

**The store:**

| Policy | Lowest end store | Highest end store | Lowest store on any day | Highest on any day | Mean end store | Ends below 0 | Kept |
|---|---|---|---|---|---|---|---|
| always | −40 | 274 | −48 | 274 | 125.4 | 46 (0.05%) | 37.07% |
| never | −135 | 90 | −135 | 90 | −33.7 | 90,789 (90.79%) | 0.00% |
| honest | −14 | 274 | −48 | 274 | 133.0 | 14 (0.01%) | 50.09% |

- All payoffs and stores are whole numbers.
- **For the page:** the meter must draw from about −140 to about 280. FIX.md section 7's "about 200" is too small: honest and always reach 274.

## 5. Risks and minor findings

1. **Late reopening lifts store-first play under the shipped rule** (section 2.2).
   - It lifts captain by +5..+11 points and first by +3..+6. It is never above honest.
   - REPLAY 'season' closes it. A day-6 start partly reopens it, and that version stays under honest.
2. **The season replay withholds honest seals** for consistent play toward the hawk: 9 of 113 (section 2.3). The page shows nothing, so a player cannot learn why.
3. **R2's "won" clause with a thin tally.** A 1-of-2 NEITHER tally counts as "stand down", so cutting off the hawk on day 12 can withhold an honest seal. This happened in 1 of 480 honest Lives.
4. **PG12 (a) rests on very few seals.** In the gate form only 3 ways seal on 24 seeds. At 2000/1000 on 48 seeds the valley's best is #22 with no seal, which is firmer.
5. **PG12 (b)** is 0.94 (allowed).
6. **PG14** is about 1.0–1.16 s on a quiet machine and about 1.3 times the valley's.
7. **Under season, honest's band seals** reach exactly 10.0% on 3 of 12 bands. That is noise by 2.6, but the floor is close.

## 6. Files (`cw/`)

**Scripts:**
- `cw.js` is the loader. It checks the preset and holds `judgeRow`, which reads both seals.
- `cx.js` holds my 75 schemes and the groups.
- `pool.js` → `out/pool-*.json`, `poolB-*`, `poolC-*`, `poolBC-*`.
- `merge.js` → `out/merge-A.txt`, `merge-B.txt`, `merge-battery.txt`.
- `pairs.js` → `out/pairs-out.txt`.
- `gates.js` → `out/gates-{A,B,C,D}-{habit,season}.txt`.
- `sg.js` and `sg-merge.js` → `out/sg-merge-out.txt`.
- `pg14.js` → `out/pg14-out.txt`.
- `ident.js` → `out/ident-out.txt`.
- `why.js` → `out/why-*.txt`.
- `facts.js` and `facts-sum.js` → `out/facts-sum-out.txt`.

**Other outputs:** `out/punished-out.txt`.
