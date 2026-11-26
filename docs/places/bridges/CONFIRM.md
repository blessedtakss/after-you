> **Record of its time.** Written 2026-11-25 19:19 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Bridges [bridges]: confirmation attack

**Labels.**
- **[m: file]** means measured by a script in this folder that wrote that file. Paths are relative to `confirm-bridges/`.
- **[argued]** means reasoned, not run.

**Engine and place.** Every run loads `final/engine.js` and `e1/placelab.js` and plays `createLife(seed, 'bridges')`.
- `PLACES.bridges` equals `fix-bridges/preset.json` key by key: 16 keys, none differ [m: out/preset-check.txt].
- The season runs use `createLife(seed, 'bridges', { REPLAY: 'season' })`. REPLAY_FROM is left at its default of 9.

**Policies.** All are copied into `copies/`, and nothing outside this folder was edited.
- The honest policy is the fixer's "take turns, at the jams too".
- The selfish act is the fixer's "cross while you can".
- The battery is the fixer's 57 policies, built exactly as `fx-battery.js` builds it.
- The breaker's schemes add 31 more. All 52 of `bb-schemes.js` are covered: 19 are already in the battery, and two are the same function as a battery policy.
- I wrote 77 new schemes (`cb-schemes.js`).
- In all, 165 policies were measured.

**Counts.** The shipped counts throughout: 2000 headline futures, and 1000 for the what-ifs, the last-day replay, the season replay and the range.

**Seeds** (all inside 2,200,001–2,299,999):

| Purpose | Seeds |
|---|---|
| kept (Lives) | 2,200,001–2,202,000 |
| seal and verdict pool | 2,203,001–2,203,400 (400 seeds; two halves of 200) |
| other gates, shipped | grid 2,204,001–012; spread 2,204,101–220; g6 2,204,301–420; mirror 2,204,501–620; pull 2,204,701–740; seal grid 2,204,801–812; det 2,204,901–902; speed 2,204,951–953 |
| other gates, season | the same layout from 2,205,001 |
| page facts | 2,200,001–2,299,999 (every seed in my range) |
| smoke tests only | 2,299,001–2,299,150 |

**How the gates are read (LEAD-DECISIONS 2.6).**
- PG10's ratio and PG11's seal band are read on pooled seeds: 400, and each half of 200.
- The ratio is judged only for policies with at least 20 kept Lives in the pool.
- 40-seed slices are printed as noise only.

## 0. Verdict: holds

- **All 14 gates pass on fresh seeds with the shipped preset.** PG10 and PG11 pass on the 400-seed pool and on each 200-seed half.
- **No way of playing earns the seal unfairly.** I tried 165 policies. None of them:
  - is over PG10's cap;
  - is over 0.8 seal/kept with 20 or more kept Lives;
  - seals more often than honest through a late act or a staged precedent.

  The best any scheme does is tie honest.
- **REPLAY 'season': not recommended for the Bridges.**
  - All 14 gates still pass under it.
  - But it closes no real hole here, because the shipped rule has no late-act hole to close.
  - It also withholds 21% of honest's seals (18 of 87).
  - It removes the reward for taking turns at the jams in the last season.
- **Page facts.** Over 99,999 seeds the need is always a whole number from 6 to 68. My range holds 99,999 seeds, one short of the 100,000 asked for.

## 1. All fourteen gates on fresh seeds, beside the fixer's

Sources:
- Shipped: [m: out/battery-sum-400.txt, out/rest-habit.txt, out/pg14-cpu-2.txt].
- Season: [m: out/battery-sum-400.txt, out/rest-season.txt, out/pg14-cpu-2.txt].
- Fixer: `fix-bridges/final-gates.txt` (seeds 95001–98303, 200 seal seeds).

| Gate | Fixer | Mine, shipped | Mine, REPLAY 'season' | Pass |
|---|---|---|---|---|
| PG1 honest keeps 35–65 | 45.1% | 47.0% of 2000 Lives (46.1% of 99,999 [m: out/facts-sum.txt]) | same Lives | ✓ ✓ |
| PG2 last days | 24.5 vs 15.5 / 5.5 / 1.5 | 400 seeds: 21.8 vs 11.3 / 2.8 / 3.5. Halves: 24.5 vs 12.5 / 1.5 / 3.0 and 19.0 vs 10.0 / 4.0 / 4.0 | 400 seeds: 17.3 vs 8.8 / 2.8 / 3.5. Halves: 19.0 vs 9.0 / 1.5 / 3.0 and 15.5 vs 8.5 / 4.0 / 4.0 | ✓ ✓ |
| PG3 spread | 98.3% (median 42.8) | 100% (42.3) | 95.8% (41.3), other seeds | ✓ ✓ |
| PG4 no trivial way | 100% | 100% (best on average `[0,0.5,0,1,0.5]`) | 100% (`[0.5,0,0,1,0.5]`) | ✓ ✓ |
| PG5 determinism | 0 differ | 0 of 803,546 shared draws differ | 0 of 905,828 | ✓ ✓ |
| PG6 a habit matters | 69.2% (7.0) | **79.2%** (7.2) | 73.3% (6.9); this gate does not depend on REPLAY, so this is a second sample | ✓ ✓ |
| PG7 not a lottery | 98.3% (57.0) | 97.5% (57.5) | 93.3% (58.0) | ✓ ✓ |
| PG8 mirror | 100% | 100% | 100% | ✓ ✓ |
| PG9 situations | 5 (min 4) | 5 (min 4) | 5 (min 4) | ✓ ✓ |
| PG10 no recipe | cap 36.8, highest other 25.5; highest ratio 0.62 | 400 seeds: cap 32.6, none over; highest other 21.8; highest ratio 0.55 (strangers drive on, 71/130), honest 0.51. Halves: ratio at most 0.55 and 0.65 | 400 seeds: cap 27.3, none over; highest ratio 0.44. Halves: at most 0.43 and 0.55 | ✓ ✓ |
| PG11 a trade | 45.1 / +11.4 / seal 24.5; 22 trades | 47.0 / +10.6 / seal 21.8 (halves 24.5, 19.0); 22 trades, e.g. honest+selfish3 59.6% / −4.9 | seal 17.3 (halves 19.0, 15.5); the same trades | ✓ ✓ |
| PG12 not the valley | #142, ρ 0.38, two pulls | #134, ρ 0.27; BOTH store −2.7 vs +3.3, SHORTED mark −4.1 vs +1.2, NEITHER store +1.2 vs −0.7 | #120, ρ 0.22; SHORTED mark −4.9 vs +1.2 | ✓ ✓ |
| PG13 page sanity | need 8..64 | need 14..56 over 57 × 2000 Lives, all whole; 6..68 over 99,999 seeds | same Lives | ✓ ✓ |
| PG14 cost | 1.04–1.06 s at load 12 | CPU 1.14 s per verdict; wall 1.07–1.22 at load 17–20 | CPU 1.21 s; wall 1.17–1.26 | ✓ ✓ |

**Notes:**
- **PG14 under heavy load.** `gates()` printed FAIL for PG14 in both rest runs: 4.66–5.31 s and 5.23–5.78 s of wall time at machine loads of 80–140 from other jobs. That is load.
  - Re-timed in fresh processes at load about 17–20, the times are as in the table [m: out/pg14-cpu-2.txt].
  - At load 140 the CPU per verdict was 1.38 s (shipped) and 1.50 s (season) [m: out/pg14-cpu-1.txt]. These are inflated, likely by efficiency cores [argued].
  - The season verdict costs about 6% more CPU: 7.27 s against 6.83 s for six verdicts [m: out/pg14-cpu-2.txt].
- **The season verdict's headline and last-day clauses are the shipped verdict's.** On 7,200 battery rows run once per preset, no field differs. 2,400 of those rows have a verdict on every Life; the rest are the kept Lives of 12 low-keeping policies. The shipped seal also equals the season row with its season clause dropped [m: out/battery-sum-400.txt, line 1].
  - So 39 battery policies and every scheme were run under 'season' only, and their shipped seal was read from the same row.
  - The first, two-preset run was cut short by machine load; out/r1/ keeps what it finished.

## 2. The attack

**Setup.**
- Each scheme is a policy(view) that reads only what the page shows.
- Every scheme was measured on 200 seeds (2,203,001–2,203,200), paired with honest on the same seeds.
- The 17 nearest to honest were extended to 400.
- Schemes far below honest's kept were measured kept-only: their mark is not computed, and their seal is exact.

**Sources:**
- 200 seeds: [m: out/schemes-sum-200.txt].
- 400 seeds: [m: out/schemes-sum-400.txt].
- Battery rows: [m: out/battery-sum-400.txt].

**Reference, shipped:**
- Honest seal 24.5 on the 200 seeds (49/89 kept), with cap 36.8.
- Honest seal 21.8 on the 400 seeds (87/170), with cap 32.6.

### 2.1 Best of each family (seal %, shipped preset)

| Family | Schemes | Best | Seal | Honest | Verdict |
|---|---|---|---|---|---|
| Late acts against habit, days 9–12, singly and together (cross while you can) | d9, d10, d11, d12, d9-10, d10-11, d11-12, d10-12, d9-11, d9-12, d9+11, d9+12, d10+12, d9+10+12 | day 11 only: 18.5 | 18.5 | 24.5 | the mark punishes all of them. Day 9: 16.5; day 10: 12.5; days 9–12: 2.5 |
| The three halves of that act, late | milk d11 / d12 / d10-11 / d9-12; yield to pushers d10-11 / d12; give way at jams to likely pushers d9-12 / d11-12; give way at every jam d9-12 | milk day 12: 23.5 (200); yield day 12: 20.0 (400); soft jams d11-12: 19.3 (400) | ≤ 23.5 | 24.5 / 21.8 | none above honest |
| Staged precedents at every day | cross while you can on day d, d = 1..12; every act reversed on day d, d = 1..12 | cww day 6: 22.0 (200), 20.0 (400) | ≤ 22.0 | 24.5 / 21.8 | none. Reversing all four acts on any day: 0.0–14.0 |
| Store early, polish the jam habit late | give way at jams d1–8 then drive on at jams d9–12; soft jams d1–8 then polish d9–12; old turns d1–8; yield d1–8; polish d9-12 / d11-12 / d12 / d5-8 / all Life | polish jams d5–8: 24.5 (ratio 0.57) | 24.5 | 24.5 | a tie. Store early, polish late: 23.0 and 21.5, both below honest |
| The sister | milk / always give way / cww with her all Life; cww with all but her; polish only with her; cww with her d9–12; the breaker's three | cww with her d9–12: 24.5 (200), 21.8 (400) | = honest | 24.5 / 21.8 | a tie. Next best: soft jams with others, polishing with her, 12.0; the rest at most 3.5 |
| Milking | all Life, d1–4, d5–8, d9–11, d9–12, d5–11; drive on in their turn (all Life, d9–11) | drive on in their turn d9–11: 19.5; milk d5–8: 19.0 (200), 18.0 (400) | ≤ 19.5 | | none |
| Season ends | cww d4,8 / d4,8,12 / d3-4,7-8; best-with-habit d4,8,12; the breaker's | best-with-habit d4,8,12: 15.5 | ≤ 15.5 | | none |
| The need on the page | play honest or another way by the day-1 need (four forms) | always give way if need ≤ 20: 24.0 (200), 21.3 (400) | ≤ 24.0 | | none |
| The R2 and season windows | grab-if-short d9-11 / d10-12 / d10-11 + best-with-habit 12 / +2 spare; play the pre-day-9 or pre-day-11 habit; cww d7-8 / d6-8 | grab-if-short d10–12: 22.5 (200), 20.5 (400) | ≤ 22.5 | | none (see 2.3) |
| Battery and breaker best | 57 + 31 | turns-after-jams + best-with-habit day 12: 25.0 (200), 21.8 (400) | 25.0 | 24.5 / 21.8 | inside the cap |

**What these numbers show:**
- **Seal.** Of all 165 policies, the highest seal besides honest's duplicate is 25.0 on 200 seeds, against honest's 24.5 and a cap of 36.8.
- **Ratio.** The highest seal/kept with 20 or more kept Lives is 0.57 on 200 seeds ("polish jams d5–8", 49/86) and 0.55 on 400 (strangers drive on, 71/130).
- **No flags.** No CAP or RATIO flag appears in any table, shipped or season.
- **The seal integrity principle holds** [argued from the above]. A late act against habit costs the mark. A staged precedent costs more. The fixed ways that serve the road keep the house in only 32–42% of Lives (2000 Lives), and their ratios are 0.46–0.55 on 400 seeds.

### 2.2 Why late acts do not pay here

- **Honest's ways are already the road's way.** Measured, honest's jam tally at the end has deciles 0.56 / 0.56 / 0.58 / 0.60 / 0.62 (10/25/50/75/90%) [m: out/honest-diag.txt]. Its other situations are pure: give way to a stranger, drive on in your turn, give way in theirs, go after both waited.
- **So a late act cannot improve the road** [argued]. Every store-serving act dirties a habit that matters to the mark:
  - driving on in their turn costs OWING;
  - giving way to a pusher in your turn costs SHORTED.
- **Giving way at jams moves the tally the least**, which is why those schemes come closest (18–23).

### 2.3 Minor findings (not breaks)

1. **The R2 window can still be stepped around for yard.**
   - "Grab only when short, days 10–12" keeps 51.7% against honest's 47.0% (2000 Lives), with seal 20.5 against 21.8 (400 seeds).
   - R2 catches part of it: bought 5.0% and cost 1.0% of Lives.
   - The fixer's days 10–11 form keeps 47.4% with seal 20.3.
   - This is about 5 points of yard for about 1 point of seal. It is not a seal recipe.
2. **Single 40-seed slices still reach 0.80–0.83 seal/kept.**
   - `[1,0.5,0,1,0.5]` was 8/10 on one slice. "Strangers drive on" was 10/12 on another.
   - Their pooled ratios are 0.48 and 0.55 [m: out/battery-sum-400.txt, slices]. This is noise, as 2.6 says.
3. **R2 replays honest acts often but withholds rarely** [m: out/honest-diag.txt; 400 seeds].
   - R2 makes an entry in 26.8% of honest Lives (107 of 400). Every reversed act is "drove on at a jam where the habit is to give way" (114 acts).
   - The replay is worse for the road, by a mean of −1.22.
   - R2 withheld a kept-and-clear honest seal in 1 Life of 400. That is honest punished, but rarely.
   - The fixer's 20–25% entry rate is confirmed as roughly right (26.8% here).
4. **The honest seal moves between halves:** 24.5 and 19.0 on 200 seeds each, 21.8 pooled. This is inside PG11's band of 10–40, but in its lower half.

### 2.4 Honest play punished?

**Under the shipped rule, rarely.** R2 withholds 0.25% of kept-and-clear honest Lives (above). The need is luck by design. No other loss of the seal was found that a player following the rule could not see coming.

## 3. REPLAY 'season'

**Gates.** All 14 pass on fresh seeds (table in §1).
- PG10 and PG11 pass on 400 seeds and on each half.
- The other gates pass on their own band (2,205,001 up).
- PG14 is 1.21 s of CPU per verdict.

**Does it close a hole? None exists to close.**
- It does catch the "store early, polish late" schemes:
  - "give way at jams d1–8, drive on at jams d9–12" falls from 23.0 to 2.0;
  - "soft jams d1–8, polish d9–12" falls from 21.5 to 2.0 (200 seeds).
- But under the shipped rule both already seal below honest's 24.5. So they were never holes.
- No late act beats honest under R2 (§2). The Banks' hole, peace offered against habit on day 11, has no counterpart here.

**What it costs** [m: out/honest-diag.txt, out/schemes-sum-400.txt, out/season-overlap.txt; 400 seeds]:

| | Shipped (R2) | Season |
|---|---|---|
| honest seal | 87 / 400 (21.8%) | 69 / 400 (17.3%) |
| honest Lives with a season entry | – | 398 (99.5%); mean delta −3.68; 368 negative, 28 positive |
| honest seals withheld by the season clause | – | 18 of 87 (21%). Marks were 8.1–14.4 and deltas −0.6 to −8.2 |
| give way at every jam on days 9–12 | seal 17.3, kept 46.8% | seal 17.3, kept 46.8% |
| play the pre-day-9 habit on days 9–12 | 17.3, kept 46.5% | 17.3 |
| give way at jams to likely pushers, days 9–12 | 18.0, kept 46.8% | 17.3 |

**Why** [argued from the rows]:
- Honest's first jam with each carter is a give-way, so its jam tally sits just above one half, and its habit reads "give way at jams".
- The season replay therefore gives way at every late jam. That feeds the pushers, and the replay is worse for the road in 368 of the 398 honest Lives with an entry (92%).
- Any policy that plays as honest on days 1–8 starts its season replay from the same Life with the same habit. Under 'season' such policies are sealed on nearly the same Lives: 62–67 of honest's 69 [m: out/season-overlap.txt].
- So under 'season', taking turns at the jams in the last season earns nothing toward the seal.
- Giving way at those jams becomes free yard: 51.0% against 47.0% kept over 2000 Lives, at an equal seal.
- A player who keeps to the lesson to the end loses the seal in 1 honest seal in 5, for a reason the page never shows (the replay is not shown).

**Recommendation: do not adopt REPLAY 'season' for the Bridges.** Every gate passes under it, but it closes no real hole here, and it punishes the honest policy.

## 4. Page facts

Lives only, over all 99,999 seeds of 2,200,001–2,299,999 [m: out/facts-sum.txt; out/facts-1.txt, out/facts-2.txt; 208 s]:

| Fact | Value |
|---|---|
| need | 6 (seed 2,216,658) .. 68 (seed 2,291,878); not whole on 0 seeds; outside 1..300 on 0 |
| need ≤ 10 | 12 seeds |
| custom's purse (the old-way figure) | −42 .. 67 |
| always give way: store at the end | 4 .. 50 (on any day: 4 .. 57); never below zero |
| never give way: store at the end | −46 .. 39 (on any day: −46 .. 52); below zero at the end in 96.4% |
| honest: store at the end | −9 .. 87 (on any day: −9 .. 87); below zero at the end in 80 Lives (0.08%) |
| stores and payoffs whole | yes, in every Life |
| kept | always 14.6%, never 0.0%, honest 46.1% |

**Bounds** [argued from `winterNeed` and the stakes]:
- Store start is 50 and a tie-day pays −2 to +3.
- So any store ends in −46..194, and the custom's purse lies in the same range.
- The need is max(old + 1, round(12 + 0.5 (old − 12) + 21)), which lies in 4..195.
- So it is always whole, above zero and at most 300.

**For the page:**
- An honest yard can end below zero (as low as −9).
- A never-give-way yard reaches the floor of −46.

## 5. Files (all in confirm-bridges/)

**Scripts:**
- `cb-common.js` (setup, battery, judge)
- `cb-schemes.js` (77 new schemes)
- `cb-run.js` (runs a set)
- `cb-sum.js` (pools rows, reads the gates)
- `cb-rest.js` (PG3–9, PG12, PG14, PG5 via `gates()`)
- `cb-honest.js` (honest under the replays)
- `cb-overlap.js`
- `cb-facts.js` and `cb-facts-sum.js`
- `cb-pg14.js`
- `cb-preset-check.js`

**Copies:** `copies/` holds snapshots of the policies, the engine, placelab and the fixer's preset.

**Outputs (in `out/`):**
- `battery-sum-400.txt` (headline gates, both presets)
- `battery-sum.txt` (the 200-seed read with 100-seed halves)
- `rest-habit.txt`, `rest-season.txt`
- `pg14-cpu-1.txt`, `pg14-cpu-2.txt`
- `honest-diag.txt`
- `schemes-sum-200.txt`, `schemes-sum-400.txt`
- `season-overlap.txt`
- `facts-sum.txt`
- `preset-check.txt`

**Raw rows:**
- `out/bat-*.txt`, `out/r1/` (the first run, cut short by load)
- `out/r2-*.txt`
- `out/ext-*.txt`
