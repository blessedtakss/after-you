> **Record of its time.** Written 2026-11-25 17:19 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Watch [watch]: fixed

Folder: `<scratch>/places/fix-watch/` (called `fw/` below). Engine and lab: `e1/engine-places.js` (md5 `69c48ff7df21bdca45c44369b62240ad`, checked) and `e1/placelab.js`, loaded unchanged. Nothing outside `fw/` was written.

Labels: **[m: file]** = measured by a script in `fw/`, output file named; **[argued]** = reasoned, not run. Numbers from the tuner or the breaker are marked **[theirs]**.

Seeds:
- **Tuning** (mine): 1..8000, 10001..14224, 30001..34224, 60001..64224, 70001..74224.
- **Final gates** (fresh): 96801..96848 and 97001..99973. Nobody used these. The tuner used 90001..90002 and 91001..91003 only in the 9xxxx range; the breaker used 51001..59000.
- **Extra PG11 bands** (fresh): 90011..90410.
- **The breaker's own seeds** (51001..59000), for re-running the breaker's scripts unchanged. Nothing was tuned on them.
- A rejected candidate's final ran on 92001..96703 (section 8). The shipped preset was then judged on new fresh bands.

## 0. Verdict

| Break | Status |
|---|---|
| PG12 (a): the valley's best fixed way `[1,1,0.5,1,0]` in the Watch's top 10 by seal | **Closed.** #20 in the gate's form on fresh seeds; #22 at the shipped counts on 48 fresh seeds; #23 / #24 / #14 in the breaker's three forms on the breaker's seeds. One 24-seed subset (the breaker's "second 24 alone") puts it at #10, through two lucky seals (§4.1). |
| PG12 (b): Spearman | **Not closed.** 0.92 on fresh seeds (0.96 before). The gate allows the Watch to miss (b) when (a) and (c) pass; both pass. Why it cannot fall below 0.8 with these dials: §5. |
| PG12 (c) | **Passes on two clauses** (it was one weak clause): NEITHER store +3.1 ± 1.1 against the valley's −0.7 ± 0.2, and NEW mark +0.3 ± 0.1 against −1.5 ± 0.2. |
| PG11: honest's seal under the 10% floor on some 40-seed bands | **Closed.** Honest's seal is 30.0% on the fresh gate band. On the breaker's 11 bands it is 15.0–27.5% (pooled 20.0 ± 1.9), against 5.0–20.0% before; none is under 10%. On 10 more fresh bands it is 12.5–42.5% (pooled 28.3 ± 2.3). **One band of those 21 reads above the 40% ceiling** (42.5%, band 90131; risk 1). |
| Gates | **14 of 14 pass on the fresh gate bands.** PG14 passes when timed alone at load 8: 1.11, 1.09, 1.00 s. In the parallel gates() run at load 50–57 it reads 4.7–5.3 s wall and fails as logged. |
| The 21 extra 40-seed bands | One fresh band (90131) is lucky enough to break two band-level tests by the letter: PG11's ceiling (honest 42.5%) and PG10's ratio (watch-first 0.87). The other 20 bands pass both (risk 1). |

**Engine changes needed: none.** Every setting is an existing dial.

## 1. Settings (`fw/preset.json`, exactly what goes into `AfterYou.PLACES.watch`)

```
{ "B": 6, "C": 5, "S": 6, "H": 3, "K": 1.5, "FOG": 0.1, "CUSTOM": [0,1,1,1,0], "FLOW_KIND": "both", "HOLD_LINE": 0.3,
  "FOUNDERS": { "near": ["taker","soft","wary"], "far": ["firm","firm","firm","soft","wary","steady"] },
  "NEED_PIVOT": 22, "NEED_WEIGHT": 0.5, "MARGIN": 112, "REPLAY": "habit" }
```

**Stakes on one tie for one day:**

| | Both stand down | You alone | They alone | Both keep watch |
|---|---|---|---|---|
| Now | **+7** | **−5** | **+6** | **−3** |
| Tuner | +6 | −3 | +5 | 0 |

- There is still nothing to take: +6 < +7.
- Standing down alone costs 5, which is 2 more than a standoff. So fear is real.
- A standoff is no longer free: each tower pays its watch 3 a day.

| Dial | Tuner | Now | Why (the evidence is in §4 and §8) |
|---|---|---|---|
| H | 0 | **3** | Standoffs now cost each tower 3 a day. Three effects: (1) in the Life, ending one today pays, so the NEITHER store pull is opposite to the valley's (PG12c); (2) in the futures, houses stuck in standoffs are poorer and are copied less, so reopening spreads; (3) a way that never reopens (the valley's best has NEITHER 0) keeps the house less often. |
| FOG | 0.06 | **0.10** | Double false alarms (about 1 tie-day in 100) are now common enough over 30 seasons that never reopening leaves borders dark. Single alarms (about 19 in 100 tie-days) punish forgiving only half of fires. This is the breaker's direction (FOG 0.12 [theirs]); above 0.10, PG3 and PG6 weaken [m: `out/g-V4-a.txt`, `out/g-V5-a.txt`, `out/g-G5a.txt`]. |
| C / S / B | 3 / 4 / 5 | **5 / 6 / 6** | S − C = 1 keeps "nothing to take". A refused stand-down costs 5, so going first to the hawk again and again is expensive: judgment (honest) beats standing down to everyone (always keeps 36.8% against 50.1%). |
| HOLD_LINE | 0.40 | **0.30** | With 10 false alarms in 100, the share of tie-days on which both stood down is lower. 0.30 puts the custom's baseline at a median of about 50% (PG7). |
| FOUNDERS | valley seats | **near: taker, soft, wary** (far: the valley's pool) | A fearful tower (never goes first, answers, sometimes reopens) is always next door. With your sister, two of the four neighbours never go first; with the hawk, three. Going first is the hard act: the NEW mark pull turns positive (PG12c). Waiting fails: cold keeps 18.4% and the valley's careful 28.3%, against honest's 50.1% [m: `out/final-A.txt`]. The gentle seat is fixed rather than drawn: drawing it from soft, firm or steady, as the valley draws its third seat, cost PG3 on two of three bands [m: `out/g-X6-a.txt`, `out/g-X6-c.txt`]. |
| Need | 99 / 0.5 / 63 | **22 / 0.5 / 112** | `tuneNeed` on seeds 1..8000: honest kept 49.2% at margin 112 (the custom's median purse is 22) [m: `out/n-Y1-final.txt`; see §8]. Honest's seal now sits mid-band, not on the 10% floor: 25–30% on the 4 tuning bands at this margin, 20.0% pooled on the breaker's bands, 28.3% on the fresh extra bands. Need 75..186 on fresh seeds. |
| K, CUSTOM, FLOW_KIND, REPLAY | 1.5, [0,1,1,1,0], both, habit | unchanged | |
| RANGE_WAYS | null | null | The custom is the 13th of the valley's thirteen, so `range.of` is 13 [m: `out/final-B.txt` header]. |

## 2. Policies (`fw/policies-fw.js`)

- **Honest:** the tuner's "first to stand down, second chances", word for word, with the breaker's §2.3 fix. It reads a tower's record as the page shows it (`seenSince` after the tower changes a way) and gives that tower fresh second chances. In one sentence: stand down to every tower on the first day; keep standing down with any tower that does; answer any tower that stands down to you; after a fire or a standoff stand down again unless that tower is known not to answer, and even then give each tower one second chance after a fire and one after a standoff.
- **Selfish act (last 1/2/3 days):** the tuner's "keep watch unless answered", page-true. With these stakes it is still the store's best reply each day. If they will stand down, standing down pays 7 against 6; if they will not, keeping watch costs 3 against 5 [argued from the stakes].
- **Schemes:** the tuner's four (first, brave, watch-first, careful+give), page-true, plus one new scheme, **"first, last night on watch"**. It plays first all Life, then keeps watch toward everyone on day 12. It is the Watch's own form of the valley's careful+grab, and PG11's trade now comes from it (§4.2, risk 3).

## 3. The gates on fresh seeds

Source: `fw/final-gates.txt`, assembled from `fw/out/final-A..E.txt` (`final-gates.js`, placelab `gates()` at 'full' with the tuner's two raised counts: PG12c pulls on 200 seeds, PG12a seal grid on 24). Part E is PG14 alone. Bands:

| Band | Seeds |
|---|---|
| lives | 97001–99000 |
| seal | 99001–99040 |
| grid | 99101–99112 |
| spread | 99201–99320 |
| g6 | 99401–99520 |
| mirror | 99601–99720 |
| pull | 99751–99950 |
| sealGrid | 96801–96824 |
| det | 99961–99962 |
| speed | 99971–99973 |

| Gate | Measured | Pass |
|---|---|---|
| PG1 honest kept | 50.1% of 2000 Lives (35..65) | yes |
| PG2 last days | seal honest 30.0%; selfish on the last 1 / 2 / 3 days 27.5 / 25.0 / 25.0% | yes |
| PG3 spread | 95.0% of 120 seeds ≥ 25 apart (median 43.0) | yes |
| PG4 no trivial way | 91.7% of 12 seeds (best on average [0,1,1,1,1]) | yes |
| PG5 determinism | 0 of 2 reruns differ; 16 flips, 899,939 shared draws, 0 differ, 0 keys with two values | yes |
| PG6 a habit matters | 74.2% of 120 seeds (median 7.1) | yes |
| PG7 not a lottery | 94.2% (median 49.5) | yes |
| PG8 mirror | 100% | yes |
| PG9 situations | median 5 (min 3) | yes |
| PG10 no recipe | 21 policies; highest besides honest is honest+selfish1 at 27.5% (cap 45.0); none over the cap; highest seal/kept is watch-first 0.64 (honest 0.57) | yes |
| PG11 a trade | "first, last night on watch" keeps 50.2% (honest 50.1%) with mark −4.9 (honest +8.4); honest seal 30.0% | yes |
| PG12 different | (a) #20 of 243 (24 seeds at 200/200); (b) Spearman 0.92, missed, which the Watch is allowed; (c) NEW mark +0.3 ± 0.1 against −1.5 ± 0.2, and NEITHER store +3.1 ± 1.1 against −0.7 ± 0.2 | yes |
| PG12 (a) at the shipped counts | 2000/1000 on 48 fresh seeds (96801–96848): **#22**, no seal in 48, kept 18.8%, mark −6.4; 19 ways earn a seal; #20 and #21 on each 24 alone [m: `out/fsg-merge48-out.txt`, `out/fsg-merge24a/b-out.txt`] | yes |
| PG13 page sanity | need 75..186; stores, payoffs and levels whole | yes |
| PG14 cost | gates() alone at load about 8: **1.11, 1.09, 1.00 s** [m: `out/final-E.txt`]. In the parallel run at load 50–57: 5.17, 5.26, 4.72 s wall, FAIL as logged [m: `out/final-D.txt`]. CPU: 1.06 s per verdict at load 8–10, against the valley's careful at 0.80 s [m: `rerun/t-cost-out-2.txt`]; 1.46 s against 1.10 s at load 120–135 [m: `rerun/t-cost-out-1.txt`] | yes, alone |

Battery on the fresh seal band (kept over 2000 Lives; mark and seal over 40 seeds at 2000/1000) [m: `out/final-A.txt`]:

| Policy | Kept | Mark | Seal | s/k |
|---|---|---|---|---|
| honest | 50.1 | +8.4 | 30.0 | 0.57 |
| honest+selfish1 / 2 / 3 | 50.6 / 49.4 / 47.3 | +7.1 / +5.6 / +4.2 | 27.5 / 25.0 / 25.0 | |
| first (no second chances) | 53.8 | +6.2 | 27.5 | 0.46 |
| first, last night on watch | 50.2 | −4.9 | 0.0 | |
| brave | 42.4 | +3.9 | 22.5 | |
| always | 36.8 | +2.7 | 22.5 | 0.53 |
| careful (the valley's) | 28.3 | +0.5 | 2.5 | |
| careful+grab | 26.5 | −8.8 | 0.0 | |
| watch-first | 26.5 | +7.0 | 22.5 | 0.64 |
| milker | 19.7 | +4.9 | 7.5 | |
| cold | 18.4 | +4.8 | 7.5 | |
| never | 0.0 (store −33.2) | −34.4 | 0.0 | |

## 4. Each break, re-run with the breaker's own scripts

The breaker's scripts are copied to `fw/rerun/` with one line changed: they load `rerun/bw-fix.js` instead of `break-watch/bw.js`. `bw-fix.js` is `bw.js` line for line, with three changes:
- it installs `fw/preset.json`;
- it puts the shipped policies (`policies-fw.js`) behind the names the scripts use (`WATCH.honest`, ...);
- it writes into `fw/rerun/`.

Same seeds and counts as the breaker.

### 4.1 PG12: closed (a), (c); (b) missed and allowed

**(a), every form the breaker ran:**

| Form | Breaker (tuner's preset) [theirs] | Now |
|---|---|---|
| Gate form: 24 seeds 54101–54124 at 200/200 | #7 | **#23**: 10 ways seal once; the valley's best never [m: `rerun/gates-B-out.txt`] |
| 2000/1000, 24 seeds 54101–54124 | #5 | **#24** (no seal, kept 16.7%, mark −6.6) [m: `rerun/sg-merge-out.txt`] |
| 2000/1000, 48 seeds 54101–54148 | #3 | **#14**: 2 seals in 48, kept 16.7%, mark −5.7; 35 ways earn a seal [m: `rerun/sg-merge48-out.txt`] |
| 2000/1000, second 24 alone (54125–54148) | #2 | **#10**: those same 2 seals, tied with nine ways at 2 of 24, ranked by kept [m: `rerun/sg-merge-2nd24-out.txt`] |
| Fresh gate form (96801–96824, 200/200) | | #20 [m: `out/final-B.txt`] |
| Fresh 2000/1000, 48 seeds (96801–96848) | | #22, no seal; #20 and #21 on each 24 [m: `out/fsg-merge*.txt`] |

The one 24-seed subset at #10 is below the brief's own floor of 40 seeds for seal rates. On every set of 40 or more seeds the valley's best is #14 or lower.

**Why (a) is closed, measured.** The futures now reward what the valley punishes. Heir and kin carry a way in the custom's own Life; 40 seeds × 1000 futures, the breaker's `a5-carried.js` [m: `rerun/a5-carried-out.txt`; valley [theirs]: `break-watch/a5-carried-valley-out.txt`]:

| | Watch now | Watch before [theirs] | Valley [theirs] |
|---|---|---|---|
| Reopen a standoff (NEITHER 1 − 0), never go first | **+5.3 ± 1.9** | −0.9 ± 1.4 | −16.1 ± 1.8 |
| Reopen, going first | **+6.5 ± 1.8** | +0.7 ± 1.3 | −11.9 ± 1.6 |
| [1,1,1,1,1] − the custom | **+5.1 ± 1.9** | −1.0 ± 1.4 | −16.2 ± 1.8 |
| The valley's best [1,1,0.5,1,0] carried | **−6.7 ± 0.5** | −6.8 ± 0.7 | +10.1 ± 0.6 |
| Go first to strangers (NEW 1 − 0), never reopen | −1.3 ± 0.1 | −1.7 ± 0.2 | −4.3 ± 0.4 |

- The breaker's `a1-grid.js`: the top carried ways are now [x,1,1,1,1] and [x,1,1,1,0.5] (+5.1..+5.4). The valley's best is #24 carried at −6.5 [m: `rerun/a1-grid-out.txt`].
- In the Life, the valley's best keeps the house in 16.7% of 2000 fresh Lives. 14 of the 243 fixed ways keep it more often [m: `out/keptrank-final.txt`; with the tuner's preset the breaker had it at 41.7% on 48 seeds, the top kept rate in the grid [theirs]]. Its lived mark is −4.6 to −8.4 on every 24-seed set [m: the sg-merge files above]. It enters the top 10 only through seals of its own, and it earned 2 in the 96 shipped-count Lives I ran on non-tuning seeds.

**(b)**: 0.92 on fresh seeds and 0.92 on the breaker's grid seeds [m: `out/final-B.txt`, `rerun/gates-B-out.txt`] (0.96 before [theirs]). Missed; the gap is reported in §5.

**(c)**, two clauses, each clear in both places:

| Seeds | NEITHER store (valley −0.7 ± 0.2) | NEW mark (valley −1.5 ± 0.2) |
|---|---|---|
| Fresh, 99751–99950 [m: `out/final-B.txt`] | +3.1 ± 1.1 | +0.3 ± 0.1 |
| The breaker's 53801–54000 [m: `rerun/gates-B-out.txt`] | +4.4 ± 1.0 | +0.3 ± 0.1 |

SHORTED store is +3.1..+3.3 ± 0.3, but the valley's −0.2 ± 0.2 is not clear, so it is not counted.

### 4.2 PG11: closed

**Honest's seal by 40-seed band at 2000/1000** [m: `rerun/bands-orig-sum-out.txt` for the breaker's bands, `rerun/bands-fresh-sum-out.txt` for the fresh ones]:

| Band | 53001 | 56001 | 56041 | 56081 | 56121 | 56161 | 56201 | 56241 | 56281 | 56321 | 56361 | Pooled (440) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Before [theirs] | 7.5 | 5.0 | 10.0 | 17.5 | 10.0 | 17.5 | 7.5 | 12.5 | 20.0 | 12.5 | 15.0 | 12.3 ± 1.6 |
| **Now** | 17.5 | 15.0 | 17.5 | 27.5 | 22.5 | 17.5 | 25.0 | 20.0 | 20.0 | 15.0 | 22.5 | **20.0 ± 1.9** |

| Fresh band | 90011 | 90051 | 90091 | 90131 | 90171 | 90211 | 90251 | 90291 | 90331 | 90371 | Pooled (400) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Honest | 35.0 | 20.0 | 20.0 | **42.5** | 25.0 | 32.5 | 12.5 | 27.5 | 37.5 | 30.0 | 28.3 ± 2.3 |

- None of the 21 bands is under 10%. One (90131) is over 40% (risk 1).
- Over all 23 bands with the two gate bands, honest's seal pools to about 24% [argued from the counts above: 220 of 920].
- **PG2 on the same bands:** the selfish act on the last day never seals more than honest on any of the 21 bands. On 2 and 3 days it is at or under honest on all 11 of the breaker's bands. The pooled marks are +6.4 / +4.7 / +3.1 / +1.1 for honest and then 1 / 2 / 3 selfish days.
- **PG10 on the same bands:** no policy is over the cap on any band.

**Gate bands:**
- 30.0% on the fresh gate band [m: `out/final-A.txt`];
- 17.5% on the breaker's gate band 53001 [m: `rerun/gates-A-out.txt`]. That band read 7.5% before [theirs].

**The trade:**
- "first, last night on watch" keeps 50.2% (honest 50.1%), mark −4.9 against +8.4 [m: fresh, `out/final-A.txt`].
- 52.7% (honest 51.6%), −6.2 against +6.1 [m: the breaker's band, `rerun/gates-A-out.txt`].
- In the 7 tuning-band runs of the shipped settings it kept 0.5–2.1 points more than honest, with marks 13.2–17.1 points lower [m: `out/g-Y1-a..c.txt`, `out/g-Y1m-a..d.txt`].
- Pooled over the breaker's 11 bands: 52.5% kept, mark −7.7 ± 0.5 (honest 49.5%, +6.4 ± 0.5) [m: `rerun/bands-orig-sum-out.txt`].
- The valley's careful+grab no longer keeps as often as honest here (26.5% [m: `out/final-A.txt`]). Careful waits for the fearful tower to go first.

## 5. What could not be closed: PG12 (b)

- Spearman of the 243 carried marks, Watch against valley: 0.92–0.96 in every setting I ran (over 20 settings: `out/x3-*.txt`, `out/s-*-sum.txt`, and the PG12 lines of `out/g-*.txt`).
- The 243-way ranking is dominated by two main effects that both places share. Answering a tower that stood down (OWING) and keeping a peace (BOTH) are worth +9..+17 points in the Watch and +17..+18 in the valley (chance 1 against 0, over the grid) [m: `out/x3-*.txt`].
- The Watch's own difference (reopen and forgive: NEITHER, SHORTED) is worth +2..+4 over the grid. It moves the top of the ranking (which is why (a) closes) but not the 243-way correlation.
- To push (b) under 0.8, the Watch would have to stop rewarding answering and keeping the peace. That is not the place [argued].
- No dial I tried came close: FOG 0.06..0.12, H 0..4, C 2..5, three seat layouts, HOLD_LINE 0.25..0.40.
- The design lead's rule lets the Watch miss (b) when (a) and (c) pass, with the gap reported. **The gap: 0.92 against 0.8.**

## 6. Risks

1. **One lucky band breaks two gates by the letter: fresh band 90131.**
   - On that band honest's seal is 42.5%, over PG11's ceiling of 40.
   - On the same band watch-first's seal/kept is 0.87 (13 sealed of 15 kept), over PG10's 0.8 [m: `rerun/bands-fresh-sum-out.txt`, `out/ratio-bands-out.txt`].
   - Every other policy and band of the 21 extra bands stays inside. Largest seal/kept elsewhere: honest 0.70, always 0.69, first 0.53. Both gate bands pass.
   - This is the 40-seed noise the breaker found on the floor, now on the other side and rarer [m: `out/binom-out.txt`, `x12-binom.js`]:
     - at the pooled rate (about 24%), a 40-seed band reads above 40% 0.8% of the time and under 10% 0.7% of the time;
     - at the fresh extra bands' 28%, it reads above 40% 3.5% of the time;
     - at the breaker's 12.3% [theirs], it read under 10% far more often.
   - Before: 3 of 11 bands under the floor [theirs]. Now: 0 of 21 under it and 1 of 21 over the ceiling.
   - A lower honest seal would move the risk back to the floor: the breaker's bands pool at 20.0%.
   - The ratio part has a second cause: on seeds where peace comes easily, the store and the border are both good, so s/k is high for any policy with a positive mark (the breaker's §2.1 lottery effect [theirs]).
2. **PG12 (a) on 24-seed subsets.**
   - Fixed ways keep the house only 10–45% of the time, so their seal rates are small (the top ways 6–12%) and 24-seed rankings are noisy.
   - The valley's best seals in about 2 of 96 non-tuning Lives at 2000/1000 [m: §4.1].
   - One 24-seed subset puts it at #10. It is the only form of the 8 run on non-tuning seeds that does.
   - On a tuning band (74001–74024), tried variants (FOG 0.11/0.12, a warier far pool) put it at #6–#8 through one seal [m: `out/z-Y4/Y5/Y6-sgm.txt`]; the shipped preset has it at #12 there [m: `out/sgd-*`].
   - Measure (a) on at least 40 seeds at the shipped counts, as the brief requires for seal rates.
3. **PG11's trade rests on the new scheme** "first, last night on watch", not on careful+grab. It is the Watch's own form of the grab, and it is in the battery as a scheme particular to the place. The design lead should confirm it belongs there.
4. **"first (no second chances)" seals close to honest.**
   - Pooled, it is below honest on every set:
     - the breaker's 11 bands: 17.0 against 20.0;
     - the fresh extra 10: 21.0 against 28.3;
     - the 7 tuning runs: 15–27.5 against 25–32.5.
   - It reached 25.0% against honest's 17.5% on the breaker's gate band (cap 27.5) [m: `rerun/gates-A-out.txt`, `rerun/bands-*-sum-out.txt`, `out/g-Y1*`].
   - It is honest without the second chances, not a recipe [argued].
5. **PG4** is 91.7–100%.
   - The best carried ways are a near-tied cluster ([x,1,1,1,1], [x,1,1,1,0.5]) that includes all ones.
   - In a place with nothing to take, forgiving everything is close to the best for the border. It is not the best in the Life: always keeps 36.8% against honest's 50.1%.
   - In 5 runs of the shipped settings, 0 or 1 of 12 seeds had a flat best; three would fail the gate [m: `out/g-Y1-*.txt`, `out/final-B.txt`, `rerun/gates-B-out.txt`].
6. **PG14** depends on machine load:
   - 1.00–1.11 s alone at load 8;
   - 4.7–5.3 s wall in parallel runs at load 50–57.
   - A verdict costs about 1.3 times the valley's at the same moment (1.06 against 0.80 s CPU at load 8–10) [m: `out/final-E.txt`, `rerun/t-cost-out-2.txt`].
7. **Negative stores.**
   - A house that keeps watch everywhere pays its watch every day: never ends at −33 on average, bully at −15 [m: `out/final-A.txt`].
   - Honest's purse is 133 against a need of 75..186.
   - If the page should not show a negative store, `STORE_START` lifts every store and the need by the same amount and leaves kept unchanged (E1 check 4 [theirs]); 100 would keep the need ≤ 286 [argued].
8. **The stakes and the noise are new words for the page:** +7 / −5 / +6 / −3, and false alarms 10 in 100 (§7).

## 7. What the page must show (changes from TUNE.md §5)

- **Cards:** both stand down +7; you alone −5; they alone +6; both keep watch −3. Never hard-code the valley's numbers or the tuner's.
- **False alarms:** 10 in 100 ("Your watchman lit a fire at a shadow"). Never say whether a missing stand-down was an alarm or a choice.
- **Neighbours:** one tower next door always keeps watch first and answers (fearful); one never stands down (the hawk); one is gentle; and the sister keeps the custom. The page never names kinds.
- **Afterwards strip:** the share of tie-days on which both towers stood down, with the line at **30%**. "Holds" means that in the last ten seasons both stood down on at least 3 of every 10 tie-days.
- **Store line:** the custom brings in little here: it never goes first and pays the watch every day of a standoff. The need is 75..186 on fresh seeds; draw the meter to about 200. Stores can be below zero (risk 7).
- **Custom words, situations and afterword:** unchanged from TUNE.md §6.

## 8. How the settings were found (all tuning seeds; [m] files in `fw/out/`)

1. **Carried screens** (`x1-carried.js`):
   - Raising FOG makes reopening pay in the futures, but it lowers the custom's baseline (PG7) [m: `x1-*.txt`]. Carried [x,1,1,1,1] scores +4.4..+5.9 at FOG 0.08..0.12 with the tuner's stakes, and +8.8 with C 2 / S 3, against −0.3 at FOG 0.06.
   - Lowering C/S/B and adding H raised it further [m: `x1-G5*.txt`, `s-H*-sum.txt`].
   - The seal grid then put the valley's best at #18..#48 on 12 seeds [m: `s-*-sum.txt`].
2. **Gates on three tuning bands** (`x7-gates.js`):
   - H 0..2 with C 2..3 failed PG11's trade or (c) on some band [m: `g-G5*`, `g-H*`, `g-T2*`, `g-V*`, `g-W*.txt`].
   - C 5 / S 6 / H 2 held the trade; (c) at 200 seeds was about 3 sem [m: `w-*-pull.txt`, `g-W*.txt`].
3. **A fearful tower always near** (`x-X1/X2/X5`): NEW mark became a second (c) clause [m: `x-*-pull.txt`].
   - The valley's careful+grab collapsed (40–44% kept against honest's 57–61%), so the trade moved to the new scheme [m: `g-X2-*.txt`].
   - X2 (H 2) passed all 12 gates on 3 tuning bands [m: `g-X2-*.txt`] and all but PG14 on fresh seeds 92001..96703. There (a) was only #13 [m: `out/x2-candidate/`].
4. **Rank by kept** (`x10-keptrank.js`):
   - Under X2 the valley's best was #9 of 243 by kept, so (a) leaned on other ways' seals [m: `keptrank-fresh.txt` in `x2-candidate/`].
   - H 3 moved it to #17 (C 4 / S 5: #14) [m: `y-Y1-kr.txt`, `y-Y3-kr.txt`]. Y1 (shipped) passed all 12 gates on 3 tuning bands [m: `g-Y1-*.txt`].
5. **Need:** at margin 106 honest's seal read 32.5% on all 3 bands, near PG11's 40% ceiling. Margin 112 centres it (25–30% on 4 bands) [m: `g-Y1m-*.txt`].
6. **Rejected:**
   - two fearful towers near (Z1): the valley's best fell to #27, but always's seal/kept read 0.82 [m: `z-Z1-*.txt`];
   - C − H = 1 (Y7, Y8): no trade [m: `z-Y7/Y8-*.txt`];
   - FOG 0.11 with the valley's seats: PG3 and (c) failed [m: `g-V4/V5-*.txt`];
   - a drawn gentle seat (X6: soft, firm or steady, with the fearful tower fixed): PG3 failed on two of three bands [m: `g-X6-*.txt`].

## 9. Files (`fw/`)

- **The deliverables:** `preset.json` (the settings) and `policies-fw.js` (honest, selfish, schemes). `final-gates.js` produces `out/final-A..E.txt`; those and the supplementary fresh runs are gathered in `final-gates.txt`.
- **Loader:** `fw.js`.
- **Screens and gates:** `x1-carried.js`, `x2-sg.js` + `x2-merge.js`, `x3-rho.js`, `x4-need.js`, `x5-pull.js`, `x7-gates.js`, `x8-trade.js`, `x10-keptrank.js`, `x11-ratio.js`, `x12-binom.js`, `screen.sh`.
- **`rerun/`:** the breaker's scripts (one load line changed) with `bw-fix.js`, and their outputs:
  - `gates-A..D-out.txt`;
  - `sg-merge-out.txt`, `sg-merge48-out.txt`, `sg-merge-2nd24-out.txt`;
  - `a5-carried-out.txt`, `a1-grid-out.txt`;
  - `bands-orig-sum-out.txt`, `bands-fresh-sum-out.txt`;
  - `t-cost-out-1.txt`, `t-cost-out-2.txt`.
- **`out/`:** every tuning output named above. `out/x2-candidate/` holds the rejected candidate's fresh run.
