> **Record of its time.** Written 2026-11-25 17:28 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Banks [banks]: fix report

Folder: `<scratch>/places/fix-banks/`. File names below are in that folder unless they start with `e1/`, `break-banks/` or `tune-banks/`.

**Labels.** **[m: file]** = measured by a script in this folder that wrote that file. **[argued]** = reasoned from code or from measured numbers, not run.

**Counts.** Shipped counts throughout: 2000 headline futures, 1000 for the what-ifs and the last-day replay, kept over 2000 Lives. Lines that differ say so. Sweeps used 200 futures for pulls, carried grids and seal grids (the gate's own forms).

**Seeds.**
- **Final gate run:** 90001–94520, used once for the final preset. None of these is in the tuner's sets or the breaker's (51001–58160, 61001–69999, 71001–76060).
  - Bands: lives 90001–92000; seal 92001–92200 (200 seeds); grid 92301–92312; spread 92401–92520; g6 92601–92720; mirror 92801–92920; pull 93001–93040; seal grid 93101–93112; det 93201–93202; speed 93301–93303.
  - PG3/PG7 robustness: 93401–94520.
- **Tuning (all below 100000):** 11001–19024, 32001–35303, 40001–49000. One probe's kept Lives (19001–21000) overlap the tuner's 20001.. range; that was tuning only.
- **Need scan:** 200001–300000.
- **Re-runs of the breaker's scripts:** the breaker's own bands.

**Nothing outside `fix-banks/` was edited.**
- `e1/engine-places.js` (md5 `69c48ff7…`), `e1/placelab.js` (md5 `50abdfe4…`), `tune-banks/policies.js` and `break-banks/bk-schemes.js` are loaded unedited.
- The engine change is in a copy, `engine-banks.js` (md5 `e6f83070…`).

## 0. Verdict

**All four blocking breaks are closed, and all 14 gates pass on fresh seeds 90001–94520** [m: final-gates.txt]. The fix needs **one engine change**, a sixth founder kind, the poacher (§2). Without it no setting of the dials closes PG12(c), and the valley's cast keeps PG12(a) failing in 7 of 8 blocks (§1.4, §8). The valley is unchanged on the changed engine: 0 differences in 19,856 comparisons over 472 Lives [m: identity-banks-out.txt].

**What changed.**

| | Tuner | Fix | Why |
|---|---|---|---|
| Honest policy | the bank reader (one peace offer per quarrel, only on a bank of 3 or less) | **the peacemaker**: offer peace in every quarrel. This is the breaker's own `peace-every1` (0 of 500 Lives differ [m: t-same-policies-out.txt]) | It plays the place's lesson in full. No peace rhythm out-seals it (§5, PG10) |
| Selfish act | fish across everyone on each of the last 1–3 days | **fish across where it pays**: on day 12 everyone, as before; on the days before, only boats that will not answer in time | The design's "whatever serves the store". Fishing across everyone on days 10–11 costs the store (kept 40.3% / 27.5% against 56.0% / 55.7%) [m: final-gates.txt] |
| Near cast (FOUNDERS) | the valley's: taker, soft, one of firm/wary/steady | **poacher**, soft, one of firm/wary/steady; far pool as the valley's | §1.3, §1.4: needs the new kind |
| R_AFTER | 2 | **2.5** | Compresses the marks, so a peacemaker's seal is not near-certain once the house is kept (PG10 ratio, PG11's 40% ceiling) |
| Need | pivot 180, margin 14 | **pivot 181, margin 53** (weight 0.5) | Honest keeps 43.7% (PG1) |
| RANGE_WAYS | the valley's 13 | the valley's 13 with `[1,1,0.67,1,0]` replaced by **`[1,1,0.5,1,1]`** | PG3 margin (§3). It changes only `verdict().range` |

Unchanged from the tuner: B 1, C 2, K 1, FOG 0.04, STOCK {start 6, min 1, max 9, delta [−4, +1, +1]}, FLOW_KIND 'stock', HOLD_LINE 7/6, CUSTOM [1,1,0,1,0], REPLAY 'habit'.

**Breaks.**

| Break (BREAK.md) | Before (breaker, fresh bands) | Now, re-run with the breaker's own scripts on the breaker's bands | Status |
|---|---|---|---|
| **PG10**: offering peace more than once per quarrel is a recipe | peace-every3 45.0% against honest 27.5% over 240 paired seeds (+17.5 ± 2.9). Cap or ratio broken in 7 of 8 bands | **Same 240 seeds:** honest 20.8%; peace-every1/2/3 20.8% (+0.0); peace-from9 19.6% (−1.3 ± 0.7). **All six 40-seed bands:** no peace scheme over the cap or the ratio, largest 0.77 [m: rerun/pg10-sum-out.txt]. **Their gate run** (73001.., 25 policies): PG10 PASS, highest other 27.5% against a cap of 37.5 [m: rerun/gates-alt-73001-out.txt] | **closed** |
| **PG11**: no trade in 3 of 4 bands | milker-kin / careful+grab short by 0.3–4.1 kept or 1.2–1.3 mark | **58001:** PASS, honest+selfish2 57.6% / −5.2 against 46.4% / +7.9. **58041:** PASS, 55.4% / −6.0 against 45.4% / +8.7. **58081:** PASS, 55.4% / −3.7 against 43.6% / +10.0 [m: rerun/pg11-*-out.txt]. Their gate runs: PASS and PASS [m: rerun/gates-alt-73001-out.txt, rerun/gates-fresh-out.txt]. Final: honest+selfish2 56.0% / −4.9 against 43.7% / +9.2 | **closed** |
| **PG12(a)**: the valley's best ranks in the top 10 in 6 of 9 blocks | #3–#19 | **The breaker's nine blocks:** #29, #35, #26, #27, #37, #28, #75, #41, #28. The valley's best keeps 0–2 of 12 [m: rerun/pg12a-*-out.txt]. Final #42 | **closed** (needs the engine change) |
| **PG12(c)**: the flip rests on one magic number in the honest policy | lost when spent ≤ 2 or ≤ 4, or with any peace rhythm | **NEITHER store +14.5 to +19.0 (valley −0.65 ± 0.18) in 20 of 20 policy × band runs:** the honest policy, peace-every2/3, peace-from9, the old reader, reader-spent2/4/9, peace-spent-every1/2, on 55201.. and 55241.. [m: rerun/pg12c-out.txt]. SHORTED mark is often opposite too (−0.9 to −3.4). Final: NEITHER store +16.7 ± 2.8 | **closed** (needs the engine change) |

## 1. What was wrong, measured

### 1.1 PG10 and PG11: the honest policy played the lesson too little

The breaker showed that the mark is the habit the heir carries after "both fished across" (`break-banks/mech-out.txt`). The fix takes the most peaceful reasonable policy as honest, the peacemaker. With the valley's cast that alone does not do it. Peacemakers keep the house and have a clear mark together too often [m: out/p1-*.txt, 80 seeds 11001.. at 2000/1000, honest pm3, need re-centred]:

| Setting (valley cast) | pm1 s/k | P(clear given kept) | P(clear given not kept) |
|---|---|---|---|
| tuner's place | 0.91 | 0.91 | 0.73 |
| H 1 | 0.84 | 0.84 | 0.60 |
| R_AFTER 3 | 0.84 | 0.84 | 0.58 |
| H 1, R_AFTER 3 | 0.70 | 0.73 | 0.40 |

With H 1 and R_AFTER 3, and pm1 as honest, PG10 and PG11 pass on 80 seeds (pm1 seal 35.0%, s/k 0.70; trades careful+grab and always) [m: out/p2-A.txt]. PG12(a) and (c) still fail (§1.4, §1.3).

### 1.2 The poacher cast removes the link between keeping the house and a clear mark

Same seeds, same honest policy (pm1), poacher in the taker's seat, tuner's R_AFTER 2 [m: out/p3-P1R2.txt]:
- honest seal 28.8%, s/k 0.55;
- P(clear given kept) 0.57 against P(clear given not kept) 0.66;
- pm2 0.55, pm3 0.54, [1,1,0.5,1,1] 0.59.

On 200 rehearsal seeds (34001..) this was still 0.73 at R_AFTER 2 and 0.64 at R_AFTER 2.5 [m: out/dr7-gates.txt; bands.js on out/cxC-b-*.txt]. Need weight 0 / 0.25 / 0.5 changed it by less than 0.03 [m: bands.js on out/cxE-, cxG-]. So R_AFTER 2.5 was chosen. Final pooled: 0.48 for the honest policy, 0.43–0.48 for every peace scheme [m: final-gates.txt].

### 1.3 PG12(c): no dial gives an opposite early pull with the valley's cast

Pulls in the gate's form, 60 seeds 14001–14060, 200 futures [m: out/pk*.txt; pullkind.js splits each pull by the founder kind of the neighbour, read from the Life for analysis only]. The valley's clear pulls are:
- NEW mark −1.52 ± 0.21;
- SHORTED mark +1.17 ± 0.33;
- NEITHER store −0.65 ± 0.18.

| Tried | NEW mark | SHORTED mark | NEITHER store | File |
|---|---|---|---|---|
| tuner's place, pm3 | −0.9 ± 0.3 | +1.1 ± 0.4 | −0.4 ± 0.9 (taker: −1.5 ± 0.4, 53 of 57 cases) | pk-base |
| H 1 (pm3 / pm1) | −0.7 / −0.6 | +0.8 / +0.2 | 0.0 ± 1.1 / +1.5 ± 0.9 | pk-H1, pk-H1pm1 |
| newcomer in seasons 16–24, 21–30, 25–30 | −0.9 to −1.0 | +1.3 to +1.6 | −0.4 | pk2-A* |
| K 0.5 / 0.25 / 0.1 / 2; R_AFTER 3, 4, 6; their mixes; MUT 0 | −1.3 to +0.0 | −0.5 to +1.1 (never clear negative) | −1.0 to +0.7 | pk2-, pk4-, pk5- |
| STOCK delta [−4,0,1], [−4,0,2], [−5,1,1], [−4,−1,1], [−4,−1,2], [−3,−1,2], [−4,−2,2], [−2,−1,1] | −0.9 to −2.1 | +1.7 to +3.9 | −0.6 to +1.1 | pk2-D*, pk3- |
| honest policy without forgiveness (pm1-nf, pm3-nf), H 0/1, R_AFTER 3 | −0.1 to −0.3 | +2.9 to +3.9 | +0.8 to +2.6 ± 1.0–1.2 (borderline, from 4 non-taker cases) | pk6- |
| delta [−4,−1,1] with pm1-nf | −0.2 | **−1.0 ± 0.5** (borderline) | +1.8 | pk7-Dm4m11pm1nf |

**Why** [argued from the per-kind rows]:
- **NEITHER store.** In the valley's cast the only near neighbour who quarrels on days 2–3 is the taker. He never takes peace, so in a prisoner's dilemma an offer to him can only cost the store.
- **NEW and SHORTED marks.** These are driven by what kin learns at the day-4 season end. Kin's forgiveness protects the ground in every commons variant tried.

The one borderline flip needs an honest policy that never forgives, in a place where forgiving is plainly right. That would be a lab artefact of the kind the breaker rejected.

**With a poacher in the cast** [m: out/pk8-*.txt; same seeds; pm1; H 1, R_AFTER 3]:
- Poacher in the taker's seat: NEITHER store +13.5 ± 2.5, SHORTED mark −1.5 ± 0.6.
- Poacher in the soft seat: NEITHER store +9.5 ± 1.7.
- Poacher in the third seat: NEITHER store +7.6 ± 1.7.

The poacher fishes across a stranger, but he takes peace after a quarrel. So the day-3 offer pays the house's own store, which is the place's lesson made visible in play.

### 1.4 PG12(a): with the valley's cast the valley's best keeps as often as the best fixed ways

Seal grids, 12 seeds at 200/200, valley cast, honest pm1 [m: out/p2-*.txt]. Rank of `[1,1,0.5,1,0]` per block (15001.., 15013..):

| Setting | Block 1 | Block 2 |
|---|---|---|
| H 1, R_AFTER 3 | #5 | #14 |
| H 1, R_AFTER 3, K 0.5 | #8 | #3 |
| H 1, R_AFTER 2.5 | #5 | #8 |
| H 1, R_AFTER 4 | #4 | #2 |

That is 7 of 8 blocks failing. It keeps 4–6 of 12, as often as the top fixed ways.

With the poacher it never ends the quarrel with him: it keeps 0–2 of 12 and ranks #19–#75 in every block measured [m: out/p3-*.txt, out/p4-*.txt, out/p5-HL8t45.txt, out/dr7-gates.txt, final-gates.txt, rerun/pg12a-*-out.txt].

## 2. The engine change

`engine-banks.js` = `e1/engine-places.js` plus one founder kind [diff: engine-banks.diff]:

```
BANDS.poacher = { back: [0, 0.15], truce: [0.6, 0.9] }          // [0, 1, 0, back, truce]
case 'poacher': return [0, 1, 0, band(B.back, 0), band(B.truce, 1)];   // in founder()
KINDS = ['firm', 'soft', 'taker', 'wary', 'steady', 'poacher']
```

Three header lines say what the kind is.

**The poacher.** He fishes across a boat he has not fished beside, and keeps fishing across while you let him: 0–0.15 after he left you short. He never lets a slip go. He keeps to his water after you both kept off, and takes peace after a quarrel 60–90% of the time.

**Draws.** The poacher draws with the existing `P_JITTER` keys (house id, sub-key 0/1), as firm and wary do. There is no new purpose, key or ordering, and the kind is never seated in the valley.

**Checks.**
- **Valley identity**, e1's script with only the engine path changed (`identity-banks.js`): 472 Lives, 19,856 JSON comparisons, 61.5 MB, **0 differ**. `life.place` is recorded only for a key, and a valley Life has no stock field. PASS (489 s) [m: identity-banks-out.txt].
- **Determinism with the poacher seated** (PG5, check-7 form): 1,019,914 shared draws, 0 differ [m: final-gates.txt]. Also 1,014,722 / 1,076,528 on the breaker's bands [m: rerun/gates-*-out.txt].
- **Page.** `archetype` is never shown, so the page needs no change for the kind [argued: engine header line 26].

**What would ship:**
1. the kind (above);
2. `PLACES.banks` = `preset.json`.

## 3. Settings (`preset.json`, md5 `36082c6c…`)

```
{"B":1,"C":2,"K":1,"FOG":0.04,"R_AFTER":2.5,"STOCK":{"start":6,"min":1,"max":9,"delta":[-4,1,1]},
 "FLOW_KIND":"stock","HOLD_LINE":1.1666666666666667,"CUSTOM":[1,1,0,1,0],"NEED_PIVOT":181,"NEED_WEIGHT":0.5,"MARGIN":53,
 "REPLAY":"habit","FOUNDERS":{"near":["poacher","soft",["firm","wary","steady"]],"far":["firm","firm","firm","soft","wary","steady"]},
 "RANGE_WAYS":[[1,1,1,1,1],[0,0,0,0,0],[1,1,0,1,0],[1,1,0.33,1,0.33],[1,1,0.5,1,0.5],[1,1,0.67,1,0.67],[1,1,0,0,1],
               [1,1,0,0,0],[1,1,0.33,1,0],[1,1,0.5,1,0],[1,1,0.5,1,1],[1,1,1,1,0],[0,1,1,1,0]]}
```

**Need.** Honest kept at margin 53 on five 2000-Life tuning blocks: 42.3–46.8% [m: out/kblocks-final.txt]. Final: 43.7%.
- Over 100,000 seeds (200001–300000) the need is 160..288, never outside 1..300 [m: out/need-final.txt].
- The margin is large because the custom (fish as they fished) never makes peace with the poacher. At the pivot the need is the custom's purse + 53 (181 → 234). "A little above what the custom earns" is now about 29% above [argued].

**RANGE_WAYS.**
- The 13 are the valley's, with `[1,1,0.67,1,0]` (one of the four "never reopen" extras) replaced by `[1,1,0.5,1,1]`, the place's own plain way (forgive half, always offer peace). That is where careful play here ends up.
- It is read only by `verdict().range` (engine-banks.js lines 731–735, 1485, 1623). Placelab's `judge()` sets range: false [argued: code]. So only PG3 and the range the page shows move.
- PG3 on 7 bands without it: 80.0–85.8% [m: out/final-rest-noRange.txt, out/final-pg37.txt, rerun/gates-*-out.txt]. With it, on 10 bands: 85.8–92.5% [m: out/final-pg37-range.txt, rerun/pg3-breaker-bands-out.txt, final-gates.txt].

**Rejected on measurement:**

| Candidate | Why rejected | File |
|---|---|---|
| HOLD_LINE 4/3 | PG3 73.3%, s/k 0.75 | out/rt-HL8.txt, out/p5-HL8t45.txt |
| HOLD_LINE 1.25 at R_AFTER 2 | pooled honest s/k 0.82 | out/dr75-gates.txt |
| poacher in the soft seat (taker kept) | honest s/k 0.88 at R_AFTER 2 | out/p3-P2R2.txt |
| H 1 with the poacher | honest seal 18.8% and no trade in that battery | out/p3-P1H1R3.txt |

## 4. Honest policy and selfish act (`policies.js`; the gates use `fx-policies.js` 'pm1', identical)

**Honest, "the peacemaker".**
- Keep to your water with a boat you have not fished beside, and with any boat that kept to its water yesterday.
- When their nets were in your water and yours were not in theirs, let a first slip go from a boat that has kept to its water before; otherwise fish across theirs.
- When you both fished across yesterday, keep to your water to offer peace.

**Selfish act, "fish across where it pays".**
- On the last day, fish across every neighbour's water.
- On the days before it, fish across only a boat that will not answer before the end: not the sister, a boat seen to keep to its water after being fished across (at least 60% of the times seen), on a day after you both kept off.
- On the last day it is the tuner's act. Over the last 2 or 3 days it serves the store better: 56.0% / 55.7% kept against 40.3% / 27.5% for the tuner's act (kept in the battery as honest+fish-across-all2/3) [m: final-gates.txt].
- policies.js `honestSelfish2` = placelab `honest+selfish2` in 0 of 500 differing Lives [m: t-same-policies-out.txt].

## 5. Every gate (final run, fresh seeds 90001–94520) [m: final-gates.txt]

| Gate | Value | Pass |
|---|---|---|
| PG1 | honest kept 43.7% of 2000 Lives | ✓ |
| PG2 | seal: honest 23.5%; selfish on the last 1 / 2 / 3 days 4.5 / 1.0 / 4.0% (200 seeds at 2000/1000) | ✓ |
| PG3 | 87.5% of 120 seeds ≥ 25 apart (median 33.0) | ✓ |
| PG4 | 100% of 12; best on average [0,1,0.5,1,1] | ✓ |
| PG5 | 2 reruns identical; 16 flips; 1,019,914 shared draws, 0 differ | ✓ |
| PG6 | 80.8% of 120 (median 9.3) | ✓ |
| PG7 | 98.3% (median 58.5) | ✓ |
| PG8 | 100% (custom, forgiving, honest) | ✓ |
| PG9 | median 4 (min 2). On 240 tuning Lives, 84.6% have ≥ 4, so the median is 4 or 5 [m: out/pg9-final.txt; R_AFTER and the need do not touch the twelve days] | ✓ |
| PG10 | 86 policies. Highest other: peace-every1 23.5% (it is the honest policy), then [1,1,0.5,1,1], pm2–pm4 and peace-every2/3 at 22.0%; cap 35.3. Seal/kept > 0.8: none; largest [0,1,0,1,1] 0.67 (2 of 3 kept); every peace scheme 0.43–0.48 | ✓ |
| PG11 | honest+selfish2 56.0% kept, mark −4.9, against honest 43.7% / +9.2; honest seal 23.5% | ✓ |
| PG12 | (a) #42; (b) Spearman 0.52; (c) NEITHER store +16.7 ± 2.8 against the valley's −0.65 ± 0.18 | ✓ |
| PG13 | need 165..283 over 86 policies × 2000 Lives; stores, payoffs and levels whole (and tie levels in 450 future seasons) | ✓ |
| PG14 | 1.05, 1.09, 1.00 s | ✓ |

**PG14** was timed in the final rest run, with the machine quieter. During the parallel battery run (13 jsc processes plus other agents) the same gate read 1.63–1.88 s [m: out/final-pg14-noRange.txt]. CPU time: 6.34 s user for 6 full verdicts, so 1.06 s each [m: rerun/cost-cpu-out.txt]. The breaker's cost.js gave 0.98–1.09 s on 6 seeds × 2 [m: rerun/cost-out-1.txt].

**Battery** (86 policies [m: out/battery-list.txt]). It is placelab's 16 plus its Banks scheme [1,1,0.5,1,1], the tuner's three schemes, all 39 of the breaker's schemes, and 27 of the fix's. Highlights (kept / mark / seal):

| Policy | Kept | Mark | Seal |
|---|---|---|---|
| always | 31.4% | −11.3 | 2.0% |
| careful+grab | 18.9% | +2.0 | 0% |
| milker | 11.2% | −3.7 | 0% |
| the valley's best [1,1,0.5,1,0] | 9.5% | −2.3 | 0.5% |
| old reader (x-reader) | 35.8% | +7.3 | 16.5% |
| pm1-sf (forgive strangers) | 50.3% | +6.8 | 18.5% |
| honest+fish-where-free3 | 53.8% | +0.9 | 4.0% |
| honest+selfish1 | 55.5% | +3.1 | 4.5% |

## 6. Robustness

**40-seed slices of the final seal band** (not the gate) [m: final-gates.txt].
- PG2 passes in 5 of 5. PG11 passes in 5 of 5: honest mark +8.0 to +10.2, 2–6 trades, honest seal 20–30%.
- The PG10 cap passes in 5 of 5.
- **The PG10 ratio fails in 4 of 5 slices, every time from a policy with 1–3 kept Lives:**
  - forgiving 1/1 and 3/3 (pooled 5/14);
  - [0,1,0,1,1] 2/2 (pooled 2/3);
  - reader-spent2 1/1 (pooled 4/21);
  - pm1-known 2/2 (pooled 5/19);
  - cold 1/1 (pooled 2/6).
- Among policies with ≥ 8 kept Lives in a slice, the largest ratio is 0.50–0.73 [m: out/final-ratio-counts.txt].
- The breaker's gate-form run on 51001.. fails PG10 the same way: cold 1/1 (2.5% seal, 1.00) [m: rerun/gates-fresh-out.txt].
- These policies keep 4–9% of Lives because the poacher punishes anyone who does not make peace. A 40-seed ratio for them is a coin on 1–3 Lives. This is E1's open issue 9; it is not a recipe [argued].

**The breaker's full gate-form runs on the breaker's bands:**
- 73001.. with their 25-policy battery: **ALL 14 PASS** [m: rerun/gates-alt-73001-out.txt].
- 51001.. with the tuner's 20: all but PG10 (cold 1/1) [m: rerun/gates-fresh-out.txt].

Both were run before RANGE_WAYS was added. Their PG3 then read 80.0% / 81.7%; with the final preset the same spread bands read 85.8% / 88.3% [m: rerun/pg3-breaker-bands-out.txt]. Nothing else in them reads RANGE_WAYS. The runs made with the tuner's selfish act are kept as `rerun/gates-*-oldselfish-out.txt`: PG11 had no trade on 73001 (the fwf3 trades sat 9.6–9.9 below).

**Dress rehearsals** (tuning 32001.., before R_AFTER moved to 2.5) [m: out/dr7-gates.txt, out/dr75-gates.txt].

## 7. The lesson, as it plays

**Carried, in the custom's world** (breaker's lesson-check.js, 60 seeds 76001 × 400) [m: rerun/lesson-check-out.txt]:

| Comparison | Banks | Valley |
|---|---|---|
| [1,1,0,1,1] − [1,1,0,1,0] (end quarrels) | +5.4 ± 0.7 | −1.9 ± 1.0 |
| [1,1,0.5,1,1] − [1,1,0.5,1,0] | +13.6 ± 0.8 | −5.7 ± 1.2 |

**Lived** [m: final-gates.txt]:
- The peacemaker keeps 43.7% with a mark of +9.2 and seals 23.5%.
- The valley's best, which never ends a quarrel, keeps 9.5% with a mark of −2.3.
- always keeps 31.4% with a mark of −11.3.

**Early in the Life.** On days 2–3, offering peace after a quarrel adds about +17 baskets to the house's own store. In the valley, reopening after both stayed home costs 0.65 (PG12c).

## 8. What could not be closed with the dials, and risks

1. **PG12(c) and PG12(a) need the engine change** (§1.3, §1.4, §2). The dials-only best (valley cast, H 1, R_AFTER 3, peacemaker) passes PG10 and PG11 on 80 tuning seeds. It fails PG12(a) in 7 of 8 blocks and has no opposite pull [m: out/p2-*.txt, out/pk*.txt].
2. **The cast is a design change.** The Banks' near neighbours no longer include a pure taker; the Afterwards newcomer still is one. Placing the poacher in the soft or third seat instead keeps the taker and still flips NEITHER store (+9.5, +7.6) [m: out/pk8-P2/P3.txt]. But in the soft seat the honest policy's s/k was 0.88 at R_AFTER 2 [m: out/p3-P2R2.txt]; not explored further.
3. **PG10's ratio clause on 40 seeds** trips on policies with 1–3 kept Lives in most slices (§6). Pooled on 200 seeds it passes with room (0.67 largest, 0.48 for peacemakers). The design lead may want a floor (for example, at least 8 kept Lives) or 200 seeds for the ratio.
4. **PG6** has 80.8% against 60%, and **PG9** a median of 4. Both hold on every band measured [m: final-gates.txt, rerun/gates-*-out.txt, out/dr*-gates.txt].
5. **The need margin is 53** (§3). The Chronicle's need sentence should say "above what the old rule of the cove would have earned".
6. **The page.**
   - The tuner's gauge statistics (`tune-banks/gauge-out.txt`) were measured without the poacher, so the share of cards whose level moves will differ [argued; not re-measured].
   - The words of TUNE.md §8 still fit.
   - The Afterwards now shows 2 or 3 "looked round" entries per season (R_AFTER 2.5).
   - The range shows `[1,1,0.5,1,1]` among its 13 (never named).
7. **PG14** holds at 1.0–1.1 s when timed alone, and at 1.06 s of CPU per verdict. It read 1.6–1.9 s with the machine loaded.

## 9. Files

| What | Files |
|---|---|
| Deliverables | `preset.json`, `final-gates.txt`, `FIX.md`, `policies.js`, `engine-banks.js` + `engine-banks.diff`, `identity-banks.js` → `identity-banks-out.txt` |
| Gate machinery | `fx-common.js`, `fx-policies.js`, `fx-battery.js` (86 policies, with placelab's), `fg-battery.js`, `fg-rest.js`, `fg-combine.js`, `fg-run.sh`; final outputs in `out/final-*.txt` |
| Re-runs of the breaker's scripts | `rerun/` (their scripts with only the path of `bk-common.js` changed; `rerun/bk-common.js` lists its four changes) |
| Analysis | `probe.js`, `scr.js`, `scr2.js`, `pullkind.js`, `spear.js`, `bands.js`, `ratio-counts.js`, `pg9.js`, `pg37.js`, `pg3why.js`, `kblocks.js`, `needscan.js`, `tn2.js`, `t-same.js`, `t-same-policies.js`, `t-battery.js` → `out/` |
