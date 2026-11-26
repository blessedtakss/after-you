> **Record of its time.** Written 2026-11-25 13:21 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Watch [watch]: tuned

Folder: `<scratch>/places/tune-watch/` (called `tw/` below). Engine and lab: `e1/engine-places.js` and `e1/placelab.js`, loaded unchanged. Nothing in the game folder or in `e1/` was edited.

Labels: **[measured: file]** = run in `tw/`, output file named; **[argued]** = reasoned, not run. Tuning used seeds below 100000 only. The final gates used placelab's own bands (100001 and up), which were never used for tuning. `lesson.js` used seeds from 200001.

## 1. Settings (`preset.json`, exactly what goes into `AfterYou.PLACES.watch`)

```
{ "B": 5, "C": 3, "S": 4, "H": 0, "K": 1.5, "FOG": 0.06, "CUSTOM": [0, 1, 1, 1, 0],
  "FLOW_KIND": "both", "HOLD_LINE": 0.4, "NEED_PIVOT": 99, "NEED_WEIGHT": 0.5, "MARGIN": 63, "REPLAY": "habit" }
```

`RANGE_WAYS` is left out (null): the new custom `[0,1,1,1,0]` is already the 13th of the valley's thirteen, so `range.of` is 13 and the custom is among them [measured: `final-gates.txt`, header lines]. This also removes e1's open issue 1 (the tie in "custom in place of the nearest way").

**Stakes on one tie for one day:**
- both stand down: +6;
- you stand down alone: −3;
- they stand down alone: +5;
- both keep watch: 0.

So nothing is gained by taking (5 < 6), standing down alone costs 3, and false alarms happen 6 times in 100.

### Why each setting

- **CUSTOM `[0,1,1,1,0]`**: "never stand down first; once a tower stands down to you, stand down with it and let one fire pass; after both kept watch, wait".
  - With the old custom `[0,1,0,1,0]`, any noise breaks the custom's own border. Every decent heir then beats it by 13 to 24 points. In every such world some battery policy had seal/kept above 0.8 (PG10): cold 0.83 to 1.00, always 0.83 to 1.00, careful 0.81 to 0.91, and milker [measured: `s51-out.txt`…`s70-out.txt`, `p4A-out.txt`].
  - With the forgiving custom, marks compress. In the final run the highest seal/kept is 0.29 [measured: `final-gates.txt`].
  - It also moves the valley's best fixed way `[1,1,0.5,1,0]` below the custom (it forgives less, SHORTED 0.5 against 1, and never reopens). Its seal falls to about 0 and it ranks #15 [measured: `final-gates.txt`].
  - The lesson is kept: the custom still never goes first. After a standoff (often a double false alarm) its border stays dark until somebody does.
- **FLOW_KIND `both`, HOLD_LINE 0.4.** What holds is the open border: in the last ten seasons, both towers stood down on at least 40% of tie-days.
  - Under 'hands' with the forgiving custom, PG6 failed: 54.2% [measured: `gt1-out.txt`] and 42.5% [measured: `q1-out.txt`]. An heir that fails to answer is carried by forgiving partners, whose one-sided stand-downs still count as flow.
  - Under 'both', a tower that does not answer breaks the shared peace, so a single habit matters again. PG6 is 79.2% on fresh seeds [measured: `final-gates.txt`].
  - Line 0.4 rather than 0.35 gives G6 78.8% against 72.5% on 80 seeds [measured: `q25-out.txt`, `q21-out.txt`].
- **B 5, C 3, S 4** (the old 3/2/3 scaled by about 1.5, keeping the gap between standing down together and taking at exactly 1). The valley's day-12 grab costs 1 measure per peaceful tie.
  - At 3/2/3 the grab kept careful+grab only 2.7 points inside the PG11 margin [measured: `s01-out.txt`].
  - At 5/3/4 the same 1 measure is small against a larger store, so careful+grab keeps more than honest: 60.6% against 55.4% [measured: `final-gates.txt`].
- **FOG 0.06** (false alarms). FOG 0.07 and 0.065 lost the day-1 pull that separates the Watch from the valley: NEW mark −0.1 ± 0.2 and +0.3 ± 0.2 [measured: `gt9-out.txt`, `gt11-out.txt`]. FOG 0.05 lowered the honest seal [measured: `q15-out.txt`]. So 0.06 is the noise that passes.
- **K 1.5** (from 2). It sharpens copying in the Life and the futures, so a house that goes first is copied more [argued]. Measured on 200 seeds:
  - NEW mark +0.8 ± 0.1 against +0.5 ± 0.1 at K 2;
  - G6 72.5% against 70.0%.

  [measured: `q21-out.txt`, `q26-out.txt`]
- **Need 99 / 0.5 / 63.** `tuneNeed` on seeds 1..2000 with a target of 57% kept, not 50% [measured: `gt12-out.txt`, header]. The higher target keeps the honest seal clear of PG11's 10% floor.
  - Need 98..198 over every battery policy [measured: `final-gates.txt`]; 103..202 on seeds 200001.. [measured: `lesson-out.txt`].
  - `NEED_WEIGHT` 0.75, 1.0 and 1.25 changed the honest seal by no more than noise (13.3, 15.0, 14.2%) [measured: `q51`, `q52`, `q56-out.txt`], so it stays at 0.5.
- **Unchanged:** H 0, REPLAY 'habit', R_LIFE 1, R_AFTER 1, MUT, ARRIVE window.
  - R_LIFE 2 raised the honest seal to about 20%, but blurred the day-1 pull (SEM 0.2 on 200 seeds) [measured: `q31-out.txt`, `q36-out.txt`].
  - R_AFTER 2 cut G6 [measured: `s20-out.txt`].

### What moved from the starting settings (prover's numbers, e1 preset)

| Dial | Start | Final |
|---|---|---|
| B / C / S | 3 / 2 / 3 | 5 / 3 / 4 |
| K | 2 | 1.5 |
| FOG | 0.04 | 0.06 |
| CUSTOM | [0,1,0,1,0] | [0,1,1,1,0] |
| FLOW_KIND / HOLD_LINE | hands / 0.5 | both / 0.4 |
| need | 51 / 0.5 / 63 | 99 / 0.5 / 63 |
| RANGE_WAYS | valley's 13 with the custom swapped in | null (the valley's 13) |
| H, REPLAY | 0, habit | unchanged |

## 2. The policies (`policies.js`)

- **Honest, in one sentence.** Stand down to every tower on the first day, keep standing down with any tower that does, answer any tower that stands down to you, and after a fire or a standoff stand down again unless that tower is known not to answer; even then, give each tower one second chance after a fire and one after a standoff, then keep watch on a tower that never answers. ("Known" means its record of answering a tower that went first, from what the page shows, after at least two such moments.)
- **Selfish act (last 1, 2 or 3 days).** Stand down only where a stand-down is expected back today; otherwise keep watch. It never goes first and never gives a second chance.
  - Each refused stand-down saves 3 measures, because nobody can answer before winter.
  - The heir inherits "keep watch" in exactly the spots (after a fire, after a standoff) where going first keeps the peace.
  - It is the store's best reply on the last days. Taking is not, because keeping watch on a tower that stands down costs 1.
- **The Watch's schemes in the battery** (`WATCH.installSchemes`):
  - first (no second chances);
  - brave (always reopens after a standoff, even to a tower that never answers);
  - watch-first (keeps watch on day 1 toward everyone, then honest);
  - careful+give.

  They replace e1's placeholders. e1's "wait-for-them [0,1,1,1,0]" is now the custom itself, and mirror [1,1,0,1,0] belongs to the valley.

## 3. The gates on fresh seeds

Source: `final-gates.txt` (placelab `gates()`, scale 'full', preset installed as `AfterYou.PLACES.watch`), unless named. Two counts were raised to the size of the valley references they are compared with:
- PG12c pulls on 200 seeds, because `valley-pulls-data.js` is 200 seeds;
- the PG12a seal grid on 24 seeds, because `valley-best.js` was found on 24 seeds.

Everything else is at placelab's defaults: kept over 2000 Lives; seal, mark and clauses over 40 seeds at 2000/1000.

| Gate | Measured | Pass |
|---|---|---|
| PG1 honest kept | 55.4% of 2000 Lives (35..65) | yes |
| PG2 last days | seal honest 12.5%; selfish 1/2/3 days 12.5 / 15.0 / 12.5% (≤ 12.5 / ≤ 15.5 / ≤ 15.5) | yes |
| PG3 spread | the 13 ways ≥ 25 points apart in 95.8% of 120 seeds (median 40.0) | yes |
| PG4 no trivial way | best of 243 carried is neither all ones nor all zeros in 100% of 12 seeds (best on average [0,1,0.5,1,1]) | yes |
| PG5 determinism | 0 of 2 reruns differ; 16 flips, 930,827 shared draws, 0 differ, 0 keys with two values | yes |
| PG6 a habit matters | 79.2% of 120 seeds (median 8.8) | yes |
| PG7 not a lottery | custom's baseline in 15..85 in 94.2% (median 42.0) | yes |
| PG8 mirror | all three in 100% of 120 seeds | yes |
| PG9 situations | median 5 of 5 (min 4) | yes |
| PG10 no recipe | 20 policies; highest seal besides honest is 15.0% (cap 22.5); none over the cap; highest seal/kept 0.29 | yes |
| PG11 a trade | careful+grab keeps 60.6% (honest 55.4%) with mark −12.9 (honest +0.9); honest seal 12.5% (10..40) | yes |
| PG12 different | (a) the valley's best [1,1,0.5,1,0] ranks #15 of 243; (b) Spearman 0.97, missed, which the Watch is allowed when (a) and (c) pass; (c) NEW mark +0.6 ± 0.1 against the valley's −1.5 ± 0.2, opposite and both clear (n 800 against 800) | yes |
| PG13 page sanity | need 98..198; stores, payoffs and levels whole | yes |
| PG14 cost | see below | FAIL as logged (machine load); passes when timed alone |

**PG14 in detail** (all in jsc):

| Run | Result | Source |
|---|---|---|
| Full gates() run, machine load average 40–50 (other tuners' jobs, 13–20 jsc processes) | 2.06, 2.17, 2.14 s: FAIL | `final-gates.txt` |
| Re-runs of the gate alone, load 12–22 | 1.46–1.72 s | appended to `final-gates.txt` |
| Dedicated timing after one warm-up verdict: Watch | 1.00–1.08 s at load 11; 1.17–1.31 s at load 20–22 | `t-pg14-out.txt` |
| Same moments: valley careful verdicts | 0.84–0.94 and 0.99–1.13 s | `t-pg14-out.txt` |
| Eight earlier gates() runs of this family on tuning seeds at lower load | 0.99–1.16 s | `gt1`…`gt8-out.txt` |

The Watch's verdict costs about 1.15–1.2 times the valley's at the same moment.

**Counted as:** PG14 fails as logged in `final-gates.txt`, so this report does not claim all 14. Measured alone it passes (≤ 1.31 s after a warm-up) [measured], and e1 timed its own Watch preset at ≤ 0.97 s on a quiet machine [theirs]. The failure comes from machine load, not from the place [argued]. Re-time `final-pg14.js` on a quiet machine before shipping.

**The same gates on tuning seeds.** All gates but PG14 also passed on tuning seeds [measured: `gt12-out.txt`]:
- honest kept 57.1%, seal 12.5%;
- G6 79.2%;
- careful+grab 59.9% / −11.3;
- PG12 (a) #11, (c) NEW mark +0.6 ± 0.1.

PG14 failed there too, under the same load.

## 4. The lesson as it now plays

All numbers [measured: `lesson-out.txt`, fresh seeds 200001..; 120-seed rows at 2000/1000] unless named.

- **There is nothing to take, and fear at the end costs the border.** careful+grab (keep watch on the last day):
  - keeps 60.8%, against careful's 63.8%, because the grab costs store;
  - leaves a mark of −10.4, against honest +3.8;
  - is caught by the habit replay in 97.5% of its Lives (cost), seal 0.8%.
- **Going first on day 1 pays both, here and not in the valley.** One stand-down to a stranger on days 1–3 is worth:
  - +2.8 to the store and +0.6 to the mark;
  - in the valley, +0.4 and −1.5 [measured: `final-gates.txt`, PG12 pulls].

  In the valley, opening to a stranger costs the futures. On the border it helps them.
- **Going first again is the hard act.** Honest (second chances) against first (no second chances):
  - honest keeps 54.2% with mark +3.8 and seal 15.8%;
  - first keeps 58.3% with mark +0.1 and seal 5.0%;
  - so the two second chances cost about 4 points of kept and buy about 4 points of border.

  Bravery without judgment does not help: brave (always reopens, even to a hawk) keeps 50.8% with mark −1.6.
- **The custom never goes first:**
  - the sister keeps watch toward you on day 1 in 100% of Lives;
  - the day-1 total is below zero in 37.2%;
  - the custom brings in 56.3% of the need on average;
  - its border holds in a median 42% of futures (PG7).
- **False alarms are part of life:**
  - 2.4 of your own stand-downs per Life are turned back;
  - 6.9 tie-days per Life follow a standoff;
  - 20.5% of Lives have one by day 3.
- **The honest heir** is [1, 1, 0.71, 1, 0.27] (mean of 200). Its late share of open-border days is 37.7% against the custom's 36.5% (line 40%). The margin is thin: the honest mark is +0.9 on the 40 gate seeds and +3.8 on 120 seeds.
- **The last days do not buy the seal.**
  - Keeping watch unless answered raises kept by about half a point (55.5 against 54.9).
  - It lowers the mark by up to 3.4 points (−2.5 against +0.9, three days) [measured: `final-gates.txt`].
  - On day 12 the replay reverses it where it went against habit (cost 7.5–10%).

## 5. What the page must show for this place

- **Cards and stakes.** Both stand down +6; you alone −3; they alone +5; both keep watch 0. Do not hard-code the valley's −1/0/2/3.
- **Day 1.** Your sister's tower keeps watch on day 1 in every Life. The day-1 total is often negative (37%). The store line must carry the custom's sentence.
- **False alarms.** FOG 0.06 is the 'lost' luck worded as false alarms ("Your watchman lit a fire at a shadow. They saw only a fire."). As in the valley, never say whether a missing stand-down was a false alarm or a choice.
- **Store line.** The custom brings in about half the need (56%). The need is 98..202, so the meter scale must reach about 210.
- **Afterwards strip.**
  - FLOW_KIND 'both': each season's share of tie-days on which both towers stood down (`seasons[k].flow`).
  - Draw the line at 40%; the good side is high (CHARTER 'holds').
  - Label it as the open border, not as hands sent.
  - "Holds" = in the last ten seasons, both towers stood down on at least 4 of every 10 tie-days.
  - The newcomer is the engine's usual taker (a tower that never stands down first).
- **Range.** `range.of` is 13 (the valley's list, the custom among them). Read `range.of` anyway.
- **Last day.** Under 'habit', the reversed acts are usually "you kept watch" (lived) turned into "stood down" (replayed). Take the verb from `lived`/`replayed`.
- **Mark sentence.** It counts futures with an open border. Word it as "the border stays open", not "the valley holds".

## 6. Words (the place's everyday words)

- **The two choices:** *Stand down* / *Keep watch*.
- **The custom:** On the border nobody stands down first: once a tower stands down to you, stand down with it and let a single fire pass, but when both towers keep watch, wait for the other side.
- **The five situations:**
  - Meeting a new tower;
  - After you both stood down;
  - After a fire on their tower (you stood down, they kept watch);
  - After a fire on yours (they stood down, you kept watch);
  - After you both kept watch.
- **Afterword:** Neighbours who arm because each fears the other can stay armed long after both want peace, and a single false alarm can undo years of quiet. What has ended such standoffs is usually one side standing down first, in small steps the other can see, and letting one alarm pass.

## 7. Risks

1. **The honest seal sits near PG11's floor.** 12.5% on the 40 gate seeds, 15.8% on 120 fresh seeds [measured]. Across tuning variants it was about 12–17% (SE 3) [measured: q-files]. A fresh 40-seed draw reads below 10% (3 sealed Lives or fewer) about 17% of the time [argued: binomial at p ≈ 0.14].
2. **PG2's 2-day margin is one Life:** 15.0 against 15.5.
3. **PG12 is the weakest gate.**
   - (a) depends on a noisy seal grid: the top ten have a single seal in 24 seeds. Here #15; #11 on tuning seeds [measured]; #15 at 2000/1000 on 24 tuning seeds for the K 3 neighbour [measured: `sgt-*.json` via `sg-merge.js`].
   - (b) is 0.97: in the futures, the Watch ranks carried habits as the valley does (after both helped, after you left them short). The 'both' flow raised it from 0.75–0.83 under 'hands' [measured: `p2A-out.txt`, `gt1-out.txt`] to 0.93–0.97 [measured: `gt4`…`gt12-out.txt`].
   - (c) rests on a small effect, +0.6 per act on 200 seeds. At placelab's default 40 pull seeds its SEM is about 0.2, so it would be borderline.
   - The standoff pull (going first after both kept watch) is not a usable difference. With the final settings on 400 fresh seeds (200001..), it is +5.8 per act toward the sister (n 33) and −4.3 toward the taker (n 45) [measured: `p-nei-out.txt`]. The two cancel: +0.6 ± 1.8 in the gate run [measured: `final-gates.txt`] and +0.3 ± 0.8 on 200 tuning seeds [measured: `pg12c-tune-out.txt`]. Earlier 40-seed readings of +2.4 to +3.6 were noise.
4. **The honest house beats the custom's border only slightly** (+0.9 to +3.8). careful keeps more than honest: 63.8% against 54.9% [measured: `lesson-out.txt`]. Its mark is −1.1 against honest's +0.9 on the 40 gate seeds [measured: `final-gates.txt`]. cold equals honest on the mark: +4.1 against +3.8 on 120 seeds [measured: `lesson-out.txt`]. Competent valley play is still competent here in store; what differs is the day-1 pull, the trade and which fixed ways earn the seal.
5. **PG14 is sensitive to machine load** (above).
6. **The custom and the stakes changed from the proposals' words.** The custom now forgives a single fire, and the stakes are 6/−3/5/0 rather than 4/−2/3/0. The seat's day-1 card text ("You stood down. A fire burned on their tower. −3") still holds.
7. **Kept and seal are 5–10 points apart between seed sets.** For example, honest kept is 57.1% on tuning seeds and 55.4% on fresh ones. That is why each number above names its file.
8. **Rejected variants and why** (all [measured]):
   - always reopening (brave) as honest: G6 0–10%, because a reopening heir is robust to any single precedent [`g6b`, `g6d-out.txt`];
   - watch-first honest: G6 31% [`ph-watchFirstS-out.txt`];
   - watch-kin honest (keep watch with the sister on day 1) passes PG12c robustly through the standoff pull (+4.4 ± 0.3, n 242), but wastes a day of peace with her and is not what a thoughtful player would do [`ph-watchKinS-out.txt`];
   - the old custom fails PG10 or PG11 in every world tried;
   - two takers near gives a robust trade and G6 90%, but makes "wait for others" the best store policy (cold keeps 72%), which inverts the lesson [`s11-out.txt`].

## 8. Engine changes needed

None. Every setting is an existing dial of `e1/engine-places.js`. R_LIFE stays 1. The `P_EXTRA` draw a fractional R_LIFE would add was tried but not kept.

## 9. Files

- `policies.js`: honest, selfish, schemes.
- `preset.json`: the settings.
- `final-gates.js` → `final-gates.txt`; `final-pg14.js` (appended to `final-gates.txt`); `t-pg14.js` → `t-pg14-out.txt`; `lesson.js` → `lesson-out.txt`; `p-nei.js` → `p-nei-out.txt`.
- Tuning helpers:
  - `tw.js`, `variants.js` (candidate honests);
  - `p-run.js`, `p-trade.js`, `p-sweep.js`, `p-q.js`, `p-g6.js`, `p-g6q.js`, `p-hon.js`, `p-nei.js`, `pg12c.js`;
  - `g-tune.js` (gates on tuning seeds), `sg-chunk.js` / `sg-merge.js` (seal grid at shipped counts).
- Tuning outputs: `p*`, `t*`, `s*`, `q*`, `g6*`, `gt*`, `ph-*`, `pg12c-*`.
