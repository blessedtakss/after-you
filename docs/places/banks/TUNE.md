> **Record of its time.** Written 2026-11-25 14:11 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Banks: tuning report

Folder: `<scratch>/places/tune-banks/`. File names below are in that folder unless they start with `e1/`.

Labels:
- **[measured: file]** means a run in this folder, and the file named is its output.
- **[argued]** means reasoned from the code or from other measurements.

Every tuning run used seeds below 100000. The final gate run (`final-gates.txt`) is the only run on PlaceLab's gate bands, from 100001 up, and it was run once. `pullcases-final-out.txt` was run after it as analysis, on seeds 160001–160120.

Engine: `e1/engine-places.js` (md5 69c48ff7…), unedited. The lab is `e1/placelab.js`, also unedited.

## 1. Result

**All 14 place gates pass on fresh seeds** [measured: `final-gates.txt`, 375.9 s, run alone].

Two of them passed with no margin or by luck. The odds measured on tuning seeds are in section 3 and the risks in section 9.

## 2. Settings and why

`preset.json` is exactly what goes into `AfterYou.PLACES.banks`:

```
{"B":1,"C":2,"K":1,"FOG":0.04,"R_AFTER":2,
 "STOCK":{"start":6,"min":1,"max":9,"delta":[-4,1,1]},
 "FLOW_KIND":"stock","HOLD_LINE":1.1666666666666667,"CUSTOM":[1,1,0,1,0],
 "NEED_PIVOT":180,"NEED_WEIGHT":0.5,"MARGIN":14,"REPLAY":"habit"}
```

### What moved from the starting preset (E1's `banks`)

| Dial | E1 | Now | Why |
|---|---|---|---|
| `STOCK.delta` | [−3, 0, +1] | **[−4, +1, +1]** | The bank falls only when both boats fish across, by four. If either boat keeps to its water it fills by one, so a slip answered in kind costs the ground nothing; a quarrel costs it a lot. With delta[1] = 0, the PG12b Spearman was 0.80–0.92 at R_AFTER 1 (E1 preset 0.904; it reached 0.80 only with a custom baseline median of 9%, which fails PG7) [measured: `out-g1-*.txt`, `out-g2-*.txt`], and at best 0.74–0.82 at R_AFTER 2 [measured: `out-g5-1.txt`, `out-g5-3.txt`, `out-g5-10.txt`]. With +1 it is 0.61–0.72. |
| `R_AFTER` | 1 (valley) | **2** | Two boats look round each season in the Afterwards, not one. With the new delta this takes PG12b from about 0.79–0.83 to 0.61–0.72 on four tuning seed sets [measured: `out-g3-a.txt`, `out-pr1-1.txt`, `out-g5-5.txt`, `out-g7-1.txt`, `out-reh3-grid.txt`]. It is not R_AFTER alone: the valley with R_AFTER 2 against the valley ranks the 243 ways at 0.97 / 0.96 [measured: `out-g6-1.txt`]. It also lowers `[1,1,0.5,1,1]`'s seal/kept, pooled over 160 tuning seeds: 0.80 at R_AFTER 1.5 [measured: `out-bl-4.txt`] against 0.71 at 2 [measured: `out-fin-2.txt`]. It was 0.63 in the gate run. |
| `HOLD_LINE` | 1.0 | **7/6** | "The banks average at least 7 baskets over the last ten seasons; they began at 6." This is a whole number for the words. PG3 needs at least about 1.15 under R_AFTER 2 (table below). |
| `NEED_PIVOT`, `MARGIN` | 171, 31 | **180, 14** | Re-centred so that the honest policy keeps about 60%: 60.0% on seeds 1–4000 [measured: `t-need-final-out.txt`]. At 60% rather than 50%, the honest policy's seal sits higher against the cap in PG10 and the floor of 10% in PG11 [measured: `out-bl-2.txt` against `out-bl-3.txt`]. |

Unchanged: B 1, C 2, K 1, FOG 0.04, start 6, **floor 1**, max 9, FLOW_KIND 'stock', CUSTOM [1,1,0,1,0], REPLAY 'habit', and **one arrival**. That is four dials plus the need. There are no engine changes.

### Questions the brief asked, settled by measurement

**Floor 1 or 2: floor 1.** Same final settings, tuning seeds [measured: `out-fin-2.txt` for floor 1, `out-fin-1.txt` for floor 2]:

| | Floor 1 | Floor 2 |
|---|---|---|
| PG12a passed, of eight 12-seed blocks | 4 | 3 |
| PG10 passed, of four 40-seed blocks | 3 | 3 |
| PG11 passed, of four 40-seed blocks | 4 | 4 |
| PG3 | 84.2 / 90.8% | 88.3 / 91.7% |

Floor 1 also keeps the hysteresis [argued]: on a spent bank, resting together pays 1 − 2 < 0, so someone must keep off at a loss to restart it. At floor 2 it pays 0.

**One or two arrivals: one.** Measured on the seat's prototype engine, which has `ARRIVALS`. With one arrival it gives E1's numbers exactly (24 of 24 projections identical) [measured: `t-seat-arrivals-out.txt`]. Two arrivals change little, and E1 would need new engine code for them:
- Spearman: 0.612 with one arrival, 0.601 with two;
- baseline median: 68.5 with one, 65.0 with two.

**HOLD_LINE.** R_AFTER 2, delta [−4,1,1], floor 1:

| HOLD_LINE | PG3 (≥ 80% needed) | Spearman | Source |
|---|---|---|---|
| 1.0 | 60.0% (60 seeds) | 0.650 / 0.749 | [measured: `out-s4-1.txt`, `out-g5-4.txt`] |
| 1.05 | 75.0% | not run | [measured: `out-s4-2.txt`] |
| 1.10 | 74.2% (120 seeds) | 0.61–0.72 | [measured: `out-reh-A.txt`] |
| 1.15 | 80.8% | 0.66–0.72 | [measured: `out-reh-B.txt`, `out-g7-2.txt`] |
| 7/6 | 84.2 / 90.8%; 89.2% at the gate | 0.71 at the gate | [measured: `out-fin-2.txt`, `final-gates.txt`] |

PG7 stays above 90% throughout.

**The honest policy.** On the screen counts, the seat's mender fails only PG12c under the new place, because it has no opposite pull [measured: `out-s4-6.txt`]. That screen also failed PG14, but only because the machine was loaded. The bank reader below gives one in every 40-seed band tried (section 6).

**Does the stock make ending quarrels worth more here than in the valley? Yes.** See section 6.

## 3. The gates

All values are [measured: `final-gates.txt`] unless marked. The odds column comes from tuning seeds with the same settings [measured: `out-fin-2.txt`].

| Gate | Value | Pass | Odds on tuning seeds |
|---|---|---|---|
| PG1 honest kept | 59.4% of 2000 Lives | ✓ | 60.0% on seeds 1–4000 |
| PG2 seal: honest / selfish 1, 2, 3 days | 15.0 / 0.0 / 0.0 / 0.0% | ✓ | |
| PG3 spread | 89.2% of 120 seeds (median 34.5) | ✓ | 84.2 / 90.8% |
| PG4 best carried way not flat | 100% of 12; best on average [0.5,1,0.5,1,1] | ✓ | |
| PG5 determinism | 1,013,887 shared draws, 0 differ, 0 keys with two values | ✓ | |
| PG6 a habit matters | 83.3% of 120 (median 8.7) | ✓ | 73–78% in full-count rehearsals of nearby settings (`out-reh-B.txt`, `out-reh-C.txt`) |
| PG7 baseline in 15..85 | 98.3% (median 60.5) | ✓ | |
| PG8 mirror | 100% | ✓ | |
| PG9 situations met | median 5 (min 4) | ✓ | |
| PG10 no recipe | highest other seal `[1,1,0.5,1,1]` 25.0%, cap 25.0; largest seal/kept 0.63 | ✓ **at the cap** | 3 of 4 blocks |
| PG11 a trade | honest seal 15.0%; milker 57.9% kept at −9.9, milker-kin 57.4% at −5.8 (honest +6.3) | ✓ | 4 of 4 blocks |
| PG12a | the valley's best `[1,1,0.5,1,0]` ranks #15 | ✓ | **4 of 8 blocks** |
| PG12b | Spearman 0.71 | ✓ | 0.61–0.72 |
| PG12c | SHORTED mark −2.6 ± 0.7, against the valley's +1.2 ± 0.3 | ✓ | 3 of 3 bands, in every delta-4 / spent-3 setting tried |
| PG13 | need 142..248; all whole | ✓ | |
| PG14 | 1.02, 1.08, 1.04 s | ✓ | |

**The battery** [measured: `final-gates.txt`]. It has 20 policies: placelab's 17, plus the place's schemes `[1,1,0,1,1]`, `reader+fish-where-free3` and `fish-the-full-bank`.

| Policy | Kept | Mark | Seal | Note |
|---|---|---|---|---|
| always | 45.9% | −8.4 | 0% | |
| careful | 68.5% | +1.5 | 7.5% | |
| careful+grab | 87.0% | −2.2 | 0% | |
| honest+selfish1 | 75.9% | −0.6 | 0% | the replay finds it in 100% of Lives |
| [1,1,0.5,1,1] | 42.5% | +11.3 | 25% | s/k 0.63 |
| [1,1,0,1,1] | 10.1% | +8.9 | 7.5% | s/k 0.60 |
| fish-the-full-bank | 0.9% | −12.7 | 0% | |

## 4. The honest policy and the selfish act

Both are in `policies.js`. The honest policy is `BANKS.honest` = `bankReader`. The variants are `BANKS.fns.honestSelfish1`, `honestSelfish2` and `honestSelfish3`. (`BANKS.fns.honest` is still the mender, so that early tuning runs reproduce; the final run uses `BANKS.honest`.)

**The honest policy, "the bank reader", in one sentence:** keep to your water with a boat you have not fished beside and with any boat whose nets stayed out of yours yesterday; let a first slip go from a boat that has kept to its water before, and otherwise fish across theirs while their nets are in yours; and when you both fished across and the bank between you is spent (3 or less), keep to your water for one day to let it fill and offer peace.

**The selfish act, "fish across":** on the last day (or the last 2 or 3 days), fish across every neighbour's water.
- It is the store's best on the day whatever they do: it saves 2 baskets, and their side of the bank pays you the same either way.
- What it costs falls on the banks the heir inherits.
- A sharper version is in the battery: fish across everyone on day 12, and on days 10–11 only boats already fishing across yours. It keeps 74.9% with a mark of −2.2 and seals 0%.

## 5. Why PG12c holds

On days 2–3, the bank reader answers a first slip from a boat that has never kept to its water.
- **Answering it:** both fish across, and the bank falls 7 → 3, which is spent. The reader offers peace on day 3, so your sister's first lesson (day 4) includes ending a quarrel.
- **Letting it go:** the bank goes 7 → 8. The quarrel comes a day later at 8 → 4, which is not yet spent. The first offer comes on day 5, after that lesson.

So forgiving that slip costs the cove −5.2 points per case against the boat that never keeps off (n 120). Against everyone else it is about 0 [measured: `pullcases-final-out.txt`]. In the valley the same act is +1.2.

This depends on two things [measured: `out-p3-*.txt`, `out-p4-*.txt`, `out-q2-*.txt`, `out-q5-*.txt`, `out-q6-*.txt`]:
- **The spent line matching the fall.** It needs 7 − |delta[0]| = 3. Spent at 2 or 4, or delta −5 with spent 3, loses the flip.
- **Making one offer per quarrel.** Offering on more days (every 2nd or 3rd quarrel day, or every day from day 5 or day 9) raises the honest policy's mark to +11–16 and removes the flip.

## 6. The lesson as it plays

**Every quarrel is paid for by the ground, so ending quarrels is worth more here than in the valley.**

| Measure | Banks | Valley | Source |
|---|---|---|---|
| Carried gap: the custom plus "keep to your water after both fished across", `[1,1,0,1,1]` − `[1,1,0,1,0]` (60 seeds × 400 futures, paired) | **+10.8 ± 0.7** | **−2.5 ± 0.8** | [measured: `lesson-out.txt`] |
| `[1,1,0.5,1,1]` − `[1,1,0.5,1,0]` | +16.2 ± 0.9 | −6.9 ± 1.2 | [measured: `lesson-out.txt`] |
| Keeping to your water after both fished across, on days 1–3, effect on the mark | +4.4 ± 0.9 | −0.1 ± 0.4 | [measured: `final-gates.txt`] |
| The same, one offer against the boat that never keeps off | +5.7 per case | | [measured: `pullcases-final-out.txt`] |

**Lived** [measured: `lesson-out.txt`], 40 seeds at 2000/1000:

| | Kept | Mark | Seal |
|---|---|---|---|
| The bank reader | 62.5% | +4.7 | 17.5% |
| The same reader without its one peace offer per quarrel | 61.1% | −1.9 | 2.5% |

The offer costs 1.4 points of kept. It is worth 6.6 points of mark, and it is the difference between a seal and almost none.

**Best ways.**
- Here the best carried way always ends quarrels and forgives half: [0.5,1,0.5,1,1] [measured: `final-gates.txt`].
- The valley's best fixed way `[1,1,0.5,1,0]` never ends a quarrel. It earned 0 to 2 seals in 96 tuning Lives in every setting near the final one [measured: `out-fin-2.txt`, `out-12a-*.txt`].

**Generosity is not the answer either.**
- **always** keeps the house 45.9% of the time, but its mark is −8.4: what you give a boat that fishes across fills its catch, and the cove copies the better-off.
- **careful** keeps 68.5% with a mark of only +1.5: it rarely ends a quarrel.

## 7. What the page must show

**Gauge on every card: the bank, a whole number from 1 to 9.**
- The level a hand is worth is `today().neighbours[i].stock`.
- The card result shows `results[i].stock` → `stockAfter`.

How often it moves [measured: `gauge-out.txt`, 2000 honest Lives]:

| Days | Level moved on | At the top (9) | At the floor (1) | In between, not moving |
|---|---|---|---|---|
| 1–4 | 81.3% of cards | 18.5% | 0.5% | |
| 5–8 | 9.5% | 70.6% | 21.8% | 0.0% |
| 9–12 | 10.0% | 69.7% | 22.1% | |

From day 5, 61% of cards are "both kept off, bank full" and 21% are "both fished across, bank spent". So the words must be true at both ends:
- at 9: "The bank is full; it cannot fill further";
- at 1: "The bank is spent; it cannot fall further".

**Card outcomes** (L = the level before today):

| Outcome | Card text |
|---|---|
| Both kept off | "+(L−2). The bank fills to L+1" (or "stays full") |
| You kept off, their nets in yours | "−2. The bank fills to L+1": one boat keeping off is enough |
| Yours in theirs, theirs out | "+L. The bank fills to L+1" |
| Both fished across | "0. The bank falls to max(L−4, 1)" (or "is spent") |

**Opening line:** "Keeping to your water costs you 2 baskets. When they keep to theirs, your water is worth what the bank between you holds: 6 to begin with. If either of you keeps to your water the bank fills by one; if you both fish across it falls by four, never below 1."

**Afterwards strip.** `runFuture().seasons[k].ties` gives the 16 tie levels at each season's end, in `tieList` order. Draw them as a strip or shading, with the season mean against a line at 7 [measured: `gauge-out.txt`, 40 Lives × 25 futures]:
- 68.5% of tie-ends are at 9 and 11.7% at 1;
- a tie changes level between season ends 30.6% of the time;
- season mean, held futures: 7.1 → 8.0;
- season mean, failed futures: 7.0 → 5.4;
- an example future is printed in that file.

R_AFTER 2 means two "looked round" entries per season in the Afterwards events.

**Chronicle rule line:** "A future counts as held if, in its last ten seasons, the banks between boats are worth at least 7 baskets on average (they began at 6)."

**The need sentence** uses the custom's wording: `oldWayPurse` is the custom's purse.

**The last-day line** ('habit'): take each verb from `lived` / `replayed`.

## 8. Words, in the place's own terms

- **The two choices:** **Keep to your water** / **Fish across**.
- **The custom:** "The old rule of the cove: keep to your water with a boat you have not fished beside, then fish as they fished the day before."
- **The five situations:**
  1. A boat you have not fished beside
  2. After you both kept to your water
  3. After their nets were in your water
  4. After your nets were in theirs
  5. After you both fished across
- **Afterword:** "On many coasts, fishing families keep unwritten lines between their grounds, and a ground fished hard from both sides can take years to fill again. Common grazing, shared wells and woodlots work the same way: what is taken in a quarrel is lost to both neighbours for seasons after, until one of them stops first."

## 9. Risks

1. **PG10 passed exactly at the cap.** `[1,1,0.5,1,1]` seals 25.0% against a cap of 25.0. On tuning seeds it failed 1 block in 4 [measured: `out-fin-2.txt`]. The honest policy's seal on 40 seeds swings from 5% to 37.5% between blocks [measured: `out-bl*.txt`, `out-reh3.txt`], and the cap follows it.
2. **PG12a is half luck.** It passed 4 of 8 tuning blocks. The valley's best never earns a seal here, but it keeps more often than most ways, so it ranks just below however few ways earn any seal in 12 seeds at 200/200. That number is small under R_AFTER 2.
   - With `H 1` (both fishing across fouls the nets: −1 each), PG12a passed 6–7 of 8.
   - But `[1,1,0.5,1,1]` then keeps 42–56% and seals 25–40%. PG10 failed in 4 of 4 blocks at R_AFTER 1.5, 3 of 4 at 1.75 and 1 of 4 at 2, and in the full rehearsal [measured: `out-bl-5.txt`, `out-bl2-3.txt`, `out-bl2-1.txt`, `out-reh3.txt`]. Not used.
3. **PG12c rests on the bank reader's one offer and on 7 − 4 = 3** (section 5). The flip is entirely about the boat that never keeps off. The honest policy's mark is modest (+6.3) because it rarely makes peace.
4. **The gauge is pinned from day 5**: about 10% of cards move.
5. **always keeps 45.9% and careful keeps 68.5%**, more than the honest policy, both with small or negative marks. The store does not punish generosity here; the mark does.
6. **R_AFTER 2** means more copying in the Afterwards. Kin and heir lines are displaced sooner [argued].
7. **The replay sometimes catches the honest policy's own last-day peace offers:** 17.5% of its Lives have a last-day entry; cost 2.5%, won 2.5% [measured: `final-gates.txt`].
8. **PG14** was measured while other agents' jsc runs shared the machine, at 1.02–1.08 s. Under heavy load the rehearsals timed 3.2–3.5 s [measured: `out-reh-*.txt`].
9. **The valley is untouched.** Replacing `PLACES.banks` with the preset leaves 80 valley Lives byte-identical [measured: `t-valley-untouched-out.txt`]. No engine code changed.

## 10. Files

| What | Files |
|---|---|
| Final | `preset.json`, `policies.js`, `run-gates.js` → `final-gates.txt` |
| Lesson, page, checks | `lesson.js` → `lesson-out.txt`; `gauge.js` → `gauge-out.txt`; `exp-pullcases.js` → `pullcases-final-out.txt`; `t-need.js` → `t-need-final-out.txt`; `t-seat-arrivals.js` → `-out.txt`; `t-valley-untouched.js` → `-out.txt`; `t-same.js` (bankReader = the tuned reader, 0 of 300 differ) |
| Tuning tools | `tb.js` (common), `exp-grid.js` / `exp-grid2.js` (Spearman), `screen.js`, `probe*.js`, `quick*.js`, `exp-pulls.js`, `exp-pg12a.js`, `exp-blocks.js`, `exp-pg3.js`, `exp-ratio.js`, `exp-sealgrid.js`, `exp-movers.js`, with outputs `out-*.txt`. The valley grids are cached in `vg-*.js`. |
