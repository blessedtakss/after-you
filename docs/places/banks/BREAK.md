> **Record of its time.** Written 2026-11-25 14:49 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Banks: break report

Folder: `<scratch>/places/break-banks/`. Every file named below is in that folder.

**Verdict: broken.** Four blocking findings:
- PG10 fails. A recipe exists, and it is the place's own lesson played a little harder: offer peace more than once per quarrel.
- PG11 fails in 3 of 4 fresh bands.
- PG12(a) fails in 6 of 9 fresh blocks.
- PG12(c) passes only because of one magic number in the honest policy.

## What was tested

**Setup.** Engine `e1/engine-places.js` (md5 69c48ff7…) and lab `e1/placelab.js` (md5 50abdfe4…), both unedited. The tuner's files are also unedited:
- `tune-banks/preset.json` (md5 f97e81b1…), put into `AfterYou.PLACES.banks`;
- `tune-banks/policies.js` (md5 1d33ae34…): honest = `BANKS.honest` (the bank reader), selfish = `BANKS.selfish` (fish across);
- the battery is placelab's 17 plus `careful`, `[1,1,0.5,1,1]` and the tuner's three schemes (exactly the tuner's 20).

Shared setup: `bk-common.js`. My schemes: `bk-schemes.js`. `x-reader` in that file is the reader rewritten with options, and it makes the same choices as `BANKS.honest` in 400 of 400 Lives [measured: `t-same-out.txt`].

**Seeds.** Every seed I used is fresh: 51001–58160, 61001–69999, 71001–76060. The tuner used:
- 1–4000, 6001.., 7001.., 8001..;
- 20001–31160, 36001.., 41001–44040;
- 50001–50012, 60001–60012, 70001–70012, 80001–80012;
- placelab's gate bands from 100001.

The two sets do not overlap.

**Counts.** Everything is at the shipped counts (2000 headline futures, 1000 for what-ifs and the replay; kept over 2000 Lives) unless a line says otherwise.

**Load.** The machine was shared with other agents' jsc runs throughout (load average 25–80 on 12 cores). This matters only for PG14.

## 1. The gates re-run on fresh seeds

`gates-fresh.js` → `gates-fresh-out.txt` (691 s). Same counts and battery as the tuner's `final-gates.txt`. Bands: lives 51001.., seal 53001.., grid 54001.., spread 54101.., g6 54301.., mirror 54501.., pull 54701.., sealGrid 54801.., det 54901.., speed 54951...

| Gate | Fresh (mine) | Tuner's gate run | |
|---|---|---|---|
| PG1 | honest kept 59.9% | 59.4% | pass |
| PG2 | seal honest 30.0%; selfish 1/2/3 days 2.5 / 2.5 / 0.0%; selfish1 has a replay entry in 100% of Lives | 15.0 / 0 / 0 / 0 | pass |
| PG3 | 92.5% (median 33.8) | 89.2% | pass |
| PG4 | 100% (best on average [0,1,0.5,1,1]) | 100% | pass |
| PG5 | 976,216 shared draws, 0 differ | 0 differ | pass |
| PG6 | 80.0% (median 8.0) | 83.3% | pass |
| PG7 | 97.5% (median 60.0) | 98.3% | pass |
| PG8 | 100% | 100% | pass |
| PG9 | median 5 (min 4) | 5 | pass |
| PG10 | tuner's battery: highest other [1,1,0.5,1,1] 32.5% (cap 45.0) | 25.0 (cap 25.0) | pass with the tuner's battery; **fails with mine** (§2) |
| **PG11** | **no trade**: milker-kin 56.3% and milker 55.8% kept, against the 56.9% needed (honest 59.9%) | milker 57.9 | **FAIL** |
| **PG12** | **(a) the valley's best [1,1,0.5,1,0] ranks #8**; (b) Spearman 0.63; (c) SHORTED mark −4.0 against +1.2 | #15 / 0.71 / −2.6 | **FAIL (a)** |
| PG13 | need 131..260, all whole | 142..248 | pass |
| PG14 | 2.88, 2.61, 2.53 s, at load about 30 | 1.02–1.08 | fail as measured; probably load (§6, M3) |

## 2. BREAK 1 (blocking): PG10 fails; the place's lesson is a recipe

**The recipe.** Play the bank reader, but offer peace more than once per quarrel. "When you both fished across yesterday, keep to your water on the first day of the quarrel and on every third day after, whatever the bank holds." That is `peace-every3` in `bk-schemes.js`. Its relatives fail too:
- `peace-every2` (every second day);
- `peace-every1` (every quarrel day; against a boat that never keeps off, that comes round every other day);
- `peace-from9` (the reader until day 8, then keep off after every day you both fished across);
- `peace-on9-11` (the same on days 9–11 only).

**Gate form.** PG10 needs, on 40 seeds at 2000/1000, no seal above max(1.5 × honest, honest + 10), and seal/kept ≤ 0.8 for every policy.

| 40-seed band | honest seal | cap | peace-every3 | peace-every2 | peace-from9 | [1,1,0.5,1,1] (tuner's battery) | source |
|---|---|---|---|---|---|---|---|
| 53001 (the fresh gate band) | 30.0 | 45.0 | **47.5** | **55.0** | 45.0 | 32.5 | `gates-fresh-out.txt`, `conf-gateband-out.txt`; peace-every1 **57.5, s/k 0.85** |
| 56001 | 32.5 | 48.8 | **52.5** | **50.0 (s/k 0.83)** | 47.5 | 35.0 | `scr1-*-out.txt` |
| 56041 | 27.5 | 41.3 | **52.5 (s/k 0.81)** | **52.5 (0.88)** | **52.5 (0.84)** | 35.0 | `scr1-*-out.txt` |
| 58001 | 37.5 | 56.3 | 45.0 | 40.0 | **45.0 (s/k 0.82)** | 22.5 | `conf-58001-out.txt` |
| 58041 | 20.0 | 30.0 | 30.0 (at the cap) | 30.0 | 30.0 | 30.0 (s/k 0.80) | `conf-58041-out.txt` |
| 58081 | 25.0 | 37.5 | **45.0** | **42.5** | **40.0** | 30.0 (s/k 0.80) | `conf-58081-out.txt` |
| 58121 | 22.5 | 33.8 | **45.0** | **52.5 (0.84)** | **42.5** | **42.5 (s/k 0.85)** | `conf-58121-out.txt` |
| 75001 (lab gate form, 25 policies) | 17.5 | 27.5 | **42.5 (0.85)** | **42.5 (0.85)** | **32.5 (0.87)** | **35.0** | `gates-alt-reader-73001-out.txt`: PG10 FAIL; peace-every1 **40.0 (0.84)** |

Bold means over the cap or seal/kept > 0.8.

**How often PG10 fails.**
- With the peace schemes in the battery: 7 of 8 fresh bands. The one pass, 58041, has every policy sitting exactly at the cap.
- With the tuner's own 20-policy battery: at least 2 of 8 bands, both from `[1,1,0.5,1,1]` (58121 and 75001). On the six bands 56001–58121, only `[1,1,0.5,1,1]` from that battery was run. On the tuner's gate run and on the 53001 and 75001 bands it is the battery's top policy other than honest.

**Paired over the same 240 seeds** [measured: `pg10-sum-out.txt`]:

| Policy | Seal | Difference from honest | Ratio |
|---|---|---|---|
| honest | 27.5% | | |
| peace-every3 | 45.0% | +17.5 ± 2.9 | 1.64 |
| peace-every2 | 44.6% | +17.1 ± 3.2 | |
| peace-from9 | 42.9% | +15.4 ± 2.9 | |

Kept costs almost nothing. Over 2000 Lives from 61001 [measured: `conf-58001-out.txt`]:

| Policy | Kept | Mark (the four 58xxx bands) |
|---|---|---|
| honest | 61.4% | +6.7 to +7.3 |
| peace-every3 | 60.7% | +10.6 to +11.8 |

**Why it works.** The whole gain is the habit the heir and kin carry. The world the Life leaves plays no part [measured: `mech-out.txt`, 80 seeds × 1000 futures]:
- Mean carried ways: honest [1,1,0.44,1,0.15], peace-every3 [1,1,0.34,1,0.48].
- Gain as lived: +5.3 ± 0.5.
- Ways alone, in the honest Life's world: +5.2 ± 0.4.
- World alone: +0.1 ± 0.3.

On fresh seeds, carried in the custom's world, that habit move is worth **+4.8 ± 0.4 here and −5.0 ± 0.6 in the valley** [measured: `lesson-check-out.txt`, 60 seeds from 76001 × 400 futures]. The same file confirms the tuner's lesson: `[1,1,0,1,1]` − `[1,1,0,1,0]` is +9.5 ± 0.6 here and −1.9 ± 1.0 in the valley.

So the recipe is the place's lesson, and the tuned honest policy plays it too little. Its NEITHER habit is about 0.15, because it offers peace once per quarrel and only on a bank of 3 or less.

**Why it is a recipe and not noise** [argued from the numbers above]:
- The honest policy's mean mark (+6.3 to +8.6 across bands) sits right at the seal line (mark − 2 se ≥ 5, about 7.5).
- So any habit that adds +4 to +5 to the mark lifts the share of clear marks from 37.5–47.5% to 67.5–82.5% (honest against peace-every3, band by band in `conf-*-out.txt` and `scr1-a-out.txt`).
- It costs about 1 kept point.

**Fix.** The honest policy has to play the lesson, and the need has to be re-centred for it. I tested peace-every3 as the honest policy with MARGIN 20 (it keeps 47.7% on 2000 fresh Lives [measured: `tn-out.txt`]); the result is in §8. Alone this does not repair PG12(c) (§5). Keeping the bank reader and widening the replay would not fix PG10: peace-every3 offers on days 3, 7 and 11 all Life, and is not a last-days scheme.

## 3. BREAK 2 (blocking): PG11 fails in 3 of 4 fresh bands

PG11 needs a battery policy within 3 kept points of the honest policy with a mark at least 10 lower. The candidates sit 3.3–4.1 points short on kept, or 1.2–1.3 points short on mark.

| Seal band / Lives | Honest kept, mark | Best candidates (kept, mark) | Result | Source |
|---|---|---|---|---|
| 53001 / 51001.. | 59.9, +6.3 | milker-kin 56.3 / −9.6 (needs 56.9); careful+grab 86.2 / −3.3 (needs ≤ −3.7) | **FAIL** | `gates-fresh-out.txt` |
| 58001 / 61001.. | 61.4, +6.7 | honest+selfish2 58.3 / −9.6 (needs 58.4); milker-kin 57.8; careful+grab mark −2.1 (needs ≤ −3.3) | **FAIL** | `pg11-58001-out.txt` |
| 58041 / 63001.. | 60.7, +6.7 | milker 58.2 / −11.4 | pass | `pg11-58041-out.txt` |
| 58081 / 65001.. | 60.3, +7.2 | milker-kin 57.0 (short by 0.3); careful+grab mark short by 1.3 | **FAIL** | `pg11-58081-out.txt` |
| 75001 / 73001.. | 59.6, +8.1 | milker 58.3 / −8.0 | pass | `gates-alt-reader-73001-out.txt` |

The tuner passed 4 of 4 tuning blocks, but its gate run passed by only 1.5 kept points (milker 57.9 against 56.4 needed).

**Fix.** The same as Break 1. A peacemaking honest policy has a mark of about +11 to +12, so careful+grab (kept about 87%, mark −0.2 to −3.3) becomes a clear trade. See §8.

## 4. BREAK 3 (blocking): PG12(a) fails in 6 of 9 fresh blocks

`pg12.js` mode a runs placelab's `sealGrid`: 12 seeds at 200/200, valley best `[1,1,0.5,1,0]` from `valley-best.js`. Outputs: `pg12a-55001-out.txt`, `pg12a-55049-out.txt`, plus the gate band in `gates-fresh-out.txt`.

| Block | Rank of the valley's best | Ways with any seal | Valley's best: seals, kept of 12 |
|---|---|---|---|
| 54801 | **#8** | 5 | 0, – |
| 55001 | **#10** | 19 | 1, 7 |
| 55013 | #19 | 12 | 0, 6 |
| 55025 | #15 | 8 | 0, 5 |
| 55037 | **#5** | 13 | 1, 10 |
| 55049 | **#10** | 9 | 0, 11 |
| 55061 | #16 | 13 | 0, 4 |
| 55073 | **#3** | 2 | 0, 6 |
| 55085 | **#9** | 4 | 0, 5 |

**Why.**
- At 200/200 on 12 seeds, only 2–19 ways earn any seal.
- The valley's best keeps the house often (4–11 of 12), so it ranks high among the ways with no seal.
- It even earns a seal itself in 2 of 8 blocks.

The tuner saw 4 of 8 on tuning seeds and called it "half luck". On fresh seeds it is worse than half: pass 3 of 9.

**Fix.** This needs a change to the place, not to the policy [argued]. The valley's best has to keep less often than the ways that end quarrels, or more ways must earn seals at 200/200. The tuner's H 1 lifted PG12a to 6–7 of 8 but broke PG10 [`tune-banks/out-bl*.txt`, not re-run here].

A peacemaking honest policy with a higher need (Break 1's fix) makes this gate harder, since fewer ways seal. See §8.

## 5. BREAK 4 (blocking): PG12(c) rests on one magic number; the honest policy is a lab artefact

PG12(c) passes on fresh seeds with the tuner's reader: SHORTED mark −4.0, −3.1 and −3.3 against the valley's +1.2 [measured: `gates-fresh-out.txt`, `pg12c-a-out.txt`]. Change one detail of the reader and the flip is gone, in every case. 40-seed bands 55201 and 55241, 200 futures, in the gate's form [measured: `pg12c-a-out.txt`, `pg12c-b-out.txt`, `pg12c-c-out.txt`]:

| Honest-policy variant | PG12(c) flip |
|---|---|
| reader, spent ≤ 3, one offer (the tuner's) | yes, 2 of 2 |
| reader, spent ≤ 2 | **none**, 0 of 2 |
| reader, spent ≤ 4 | **none**, 0 of 2 |
| reader, one offer on any bank (`reader-spent9`) | **none**, 0 of 2 |
| peace-every3, peace-every2, peace-from9, peace-spent-every1 | **none**, 0 of 2 each |
| peace-spent-every2 | 1 of 2 (−1.2 ± 0.6) |

**The 3 is not a natural choice.** The reader's only offer against the boat that never keeps off happens because the day-3 bank is exactly 6 + 1 − 4 = 3. Same 80 seeds, 56001.. [measured: `scr3-out.txt`, `scr2-b-out.txt`, `scr1-a-out.txt`]:

| Spent line | Kept | Mark | Seal |
|---|---|---|---|
| ≤ 2 (it never offers to the taker) | 58.8% | +1.5 | **7.5%** |
| ≤ 3 (the tuner's) | 60.7% | +8.6 | 30.0% |
| ≤ 4 | 61.7% | +9.0 | 30.0% (no flip) |
| any bank (`reader-spent9`) | **66.8%** | **+10.1** | 33.8% (no flip) |

The tuner's "spent" rule costs about 6 kept points and 1.5 mark points against simply offering peace once per quarrel. A person reading the card ("if both fish across the bank falls by four") would offer while the bank is still full. The honest policy is beaten on both store and mark by a simpler one. The only thing it buys is the PG12(c) flip.

**Fix.**
- Choose the honest policy for play (Break 1's fix).
- Find PG12(c) in the place itself. One option is a situation whose day-1–3 pull is clearly opposite to one of the valley's clear pulls:
  - NEW mark (valley −1.5 ± 0.2);
  - SHORTED mark (valley +1.2 ± 0.3);
  - NEITHER store (valley −0.7 ± 0.2).
- Under every peacemaking variant, the pulls here match the valley's sign or the valley's pull is not clear (`pg12c-b-out.txt`). With today's stakes there is no such flip [argued from those rows]; it needs a stake or stock change.

## 6. Minor findings

**M1. Late generosity is invisible to the 'habit' replay.** It looks only at day 12. The 'won' clause catches a peace offer on day 12, but not the same offer on days 9–11. Same 80 seeds, against the honest policy's 30.0% [measured: `pg10-sum-out.txt`, `scr2-a-out.txt`]:

| Policy | Seal | Difference | Note |
|---|---|---|---|
| peace-on12 | 28.8% | −1.3 ± 2.2 | won 20% |
| peace-on11 | 41.3% | +11.3 ± 4.0 | won 3.8% |
| peace-on10-11 | 43.8% | +13.8 ± 4.3 | |
| peace-on9-11 | 50.0% | +20.0 ± 5.2 | |

It is a real change of habit (the heir carries it), so I count it under Break 1 rather than as a bought seal. If the design wants R2's 'won' to mean "not won by acts against habit at the end", the window must reach day 9: the replay would then reverse every act on days 9–12 against the habit as it stood before day 9 [argued; engine change, not built].

**M2. The tuner's own `[1,1,0.5,1,1]` breaks PG10 without any new scheme** in 2 of 8 fresh bands:
- 58121: 42.5 against a cap of 33.8, s/k 0.85;
- 75001: 35.0 against a cap of 27.5.

It sits at s/k 0.80 in two more bands. In the tuner's run it was exactly at the cap.

**M3. PG14 is not confirmed.**
- Wall time under load about 30: 2.53–2.99 s per full verdict [measured: `gates-fresh-out.txt`, `cost-out-1.txt`].
- A later timing gave 1.62–1.79 s per verdict, at a reported load average of about 80 [measured: `cost-out-2.txt`].
- CPU time for 6 full verdicts: 8.37 s user, so 1.40 s each [measured: `cost-cpu-out.txt`, `/usr/bin/time`]. That is under 1.5 s with 0.1 s to spare.
- The tuner timed 1.02–1.08 s. It is probably a pass, but it needs one run on a quiet machine.

## 7. Recipes hunted that do not work (the place holds against them)

All rows: 80 seeds 56001.. at 2000/1000, kept over 2000 Lives 57001..; honest kept 60.7, mark +8.6, seal 30.0 [measured: `scr1-*-out.txt`, `scr3-out.txt`].

| Scheme | Kept | Mark | Seal |
|---|---|---|---|
| Milk the soft house (fish across a boat seen to keep off after being fished across, on days you both kept off): from day 1 / from day 5 / every day | 49.8 / 56.5 / 41.3 | +1.6 / +2.6 / −7.0 | 8.8 / 12.5 / 3.8 |
| peace + milk the soft house (every 1 / every 2 / spent) | 40.6 / 43.5 / 37.4 | +10.8 / +8.6 / +9.8 | 20.0 / 18.8 / 16.3 |
| Sister kept always / sister milked from day 9 / from day 5 | 61.3 / 51.3 / 31.6 | +8.7 / +5.8 / +2.7 | 30.0 / 15.0 / 10.0 |
| Against habit on day 11: everyone / soft only | 44.3 / 60.2 | +2.7 / +6.5 | 8.8 / 22.5 |
| Against habit days 9–11, soft only / days 10–11, all but the sister / fish across soft from day 9 | 61.2 / 45.6 / 61.1 | −1.7 / −4.8 / −1.8 | 7.5 / 3.8 / 7.5 |
| OWING habit made "fish across" early, so that a day-12 grab is with habit | 49.8 | −7.2 | 0.0 (cost 86%) |
| Betrayal timed on the looking-round days 4 and 8: all / soft only | 7.4 / 51.2 | −2.2 / +5.4 | 0.0 / 12.5 |
| peace-every3 + the tuner's fish-where-free on days 10–12 | 76.3 | +4.2 | 5.0 (cost 76%) |

On the store side the place is sound:
- Fishing across a keeper does not drain the bank, yet every way of milking lowers the mark more than it raises the store.
- The day-12 replay catches every last-day grab: lastday 100%, cost 65–92%.

## 8. The fix, tested: peace-every3 as the honest policy, MARGIN 20

`gates-alt.js -- {"honest":"peace-every3","over":{"MARGIN":20},"base":67001}` → `gates-alt-every3-m20-out.txt`. The battery is the tuner's 20, plus peace-every1, peace-every2, peace-from9 and the tuner's reader as `x-reader`. Fresh bands from 67001.

846 s [measured: `gates-alt-every3-m20-out.txt`].

| Gate | Result | |
|---|---|---|
| PG1 | honest (peace-every3) kept 46.8% | pass |
| PG2 | honest 27.5%; selfish 1/2/3 days 0.0 / 0.0 / 0.0% | pass |
| PG3 | 88.3% | pass |
| PG4 | 100%, best [0,1,0.5,1,1] | pass |
| PG5 | 0 differ | pass |
| PG6 | 91.7% (median 10.8) | pass |
| PG7 | 99.2% | pass |
| PG8 | 100% | pass |
| PG9 | 5 | pass |
| **PG10** | none over the cap (41.3; highest peace-every1 37.5%, peace-every2 35.0%, [1,1,0.5,1,1] 30.0%); **seal/kept: peace-every1 0.83** | **FAIL (ratio only)** |
| PG11 | honest mark +10.8, seal 27.5%. Trades: milker 50.4% / −9.9, milker-kin 50.3% / −6.7, careful+grab 80.1% / −1.1, reader+fish-where-free3 66.3% / −0.2 | pass |
| **PG12** | **(a) #5**; (b) 0.76; **(c) none** (SHORTED mark is now +1.0, the valley's sign) | **FAIL** |
| PG13 | need 134..258, whole | pass |
| PG14 | 2.37–2.55 s under load | (load) |

The tuner's reader (`x-reader`) at this need keeps 50.7% with mark +5.4 and seal 7.5%.

**What the fix does.**
- Break 1 is repaired except for the ratio clause on peace-every1. `[1,1,0.5,1,1]` is at s/k 0.80, at the limit.
- Break 2 is repaired with room: five trades.
- PG12(a) and (c) still fail, and (b) rises to 0.76, close to the 0.8 limit.

So the Banks needs a further tuning round of the place, not of the policy [argued]:
- a stake or stock change that gives a clear opposite pull by day 3 under a peacemaking honest policy;
- one that drops the valley's best fixed way out of the top 10 by seal more than half the time.

Within this engine I have not found one. I tried no place dials; that is a tuner's job.

## 9. Claims confirmed

- PG1–PG9 and PG13 pass on fresh seeds at the shipped counts, with values close to the tuner's (§1).
- PG2: the selfish act on 1/2/3 last days seals 2.5 / 2.5 / 0.0% against honest 30.0% (`gates-fresh-out.txt`), and 0 / 0 / 0 against 17.5% (`gates-alt-reader-73001-out.txt`).
  - The replay finds a day-12 entry in 100% of honest+selfish1 Lives.
  - The tuner's sharper scheme (reader+fish-where-free3) seals 2.5% and 0.0%.
- PG12(b) holds (Spearman 0.63), and PG12(c) holds with the tuner's exact reader (−4.0 / −3.1 / −3.3).
- The lesson holds on fresh seeds: ending quarrels is worth +9.5 here and −1.9 in the valley (`lesson-check-out.txt`).
- The 'won' clause catches day-12 generosity: peace-on12 seals 28.8% against 30.0%, won 20%.
- No store-side recipe exists (§7). Milking soft houses, playing the sister differently, timed betrayals on looking-round days and grabs on days 9–11 against habit all lower the seal.
- `x-reader` = `BANKS.honest` in 400 of 400 Lives (`t-same-out.txt`).

## 10. Files

| What | Script → output |
|---|---|
| Fresh gates (tuner's battery) | `gates-fresh.js` → `gates-fresh-out.txt` |
| Gate form with the peace schemes; fix candidate | `gates-alt.js` → `gates-alt-reader-73001-out.txt`, `gates-alt-every3-m20-out.txt` |
| Screens | `screen.js` → `scr1-a/b/c/d-out.txt`, `scr2-a/b-out.txt`, `scr3-out.txt`, `conf-*-out.txt`; per-seed verdicts in `json/` |
| PG10 per band and paired | `pg10-sum.js` → `pg10-sum-out.txt` |
| PG11 per band | `pg11.js` → `pg11-58001/58041/58081-out.txt` |
| PG12 (a), (c) | `pg12.js` → `pg12a-55001-out.txt`, `pg12a-55049-out.txt`, `pg12c-a/b/c-out.txt` |
| Mechanism | `mech.js` → `mech-out.txt` |
| Lesson | `lesson-check.js` → `lesson-check-out.txt` |
| Need by margin | `tn.js` → `tn-out.txt` |
| Cost | `cost.js` → `cost-out-1.txt`, `cost-out-2.txt`; `cost-cpu.js` → `cost-cpu-out.txt` |
| Schemes; setup; trace | `bk-schemes.js`; `bk-common.js`; `trace.js` |
