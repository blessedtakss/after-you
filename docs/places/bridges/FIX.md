> **Record of its time.** Written 2026-11-25 13:59 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Bridges [bridges]: fix report

**Labels.** **[m: file]** means measured by a script in this folder that wrote that file; paths are relative to `fix-bridges/`. **[argued]** means reasoned, not run.

**Counts.** The shipped ones throughout: 2000 headline futures, 1000 for the last-day replay. A line says so when it differs.

**Seeds used:**
- **Tuning:** 10001–14000 and 30001–46080. Neither the tuner nor the breaker used these.
- **First candidate (V5), final run:** 90001–93303 (kept in `out/v5/`).
- **Shipped preset, final run:** 95001–98303.
- **The breaker's own bands, re-run on the shipped preset with the breaker's scripts:** 50001–74200.
- **Need scan:** seeds 1–1,000,000.

Nothing outside `fix-bridges/` was edited. The engine was not changed.

## 0. Verdict

**All four blocking breaks are closed, and all 14 gates pass on fresh seeds.** The final run is on 95001–98303, with the seal and verdict rates measured on 200 seeds [m: final-gates.txt]. The engine was not changed.

**What changed:**
- **The honest policy** is now "take turns, at the jams too". This is the tuner's own `turnsAfterJams` scheme, unchanged.
- **The place, as overrides on e1's `PLACES.bridges`:**
  - R_AFTER 1 → **4**;
  - K 0.5 → **0.25**;
  - FOG 0.04 → **0.06**;
  - MARGIN 24 → **21**;
  - STORE_START 40 → **50**.
- **The battery** grows from 27 to 57 policies. It now holds every breaker scheme that broke PG10.

| Break (BREAK.md) | Before (breaker, fresh bands) | Now | Status |
|---|---|---|---|
| **PG10 ratio**: the road's ways are sealed whenever they keep the house | turns-after-jams 0.86–1.00 on 10 of 10 bands; `[1,0,0,1,0.5]` 0.82–1.00 on 9 of 9 | Highest 0.62 on 200 seeds; under 0.8 on 14 of 15 forty-seed bands (see below) | **closed at 200 seeds**; one 40-seed band in 15 still trips on a low-keeping fixed way (§6.1) |
| **PG10 cap**: turns-after-jams out-seals honest by more than the cap | over the cap on 2 of 10 bands; 42.3% against honest 36.5% pooled | turns-after-jams *is* honest. Highest other seal 25.5 against a cap of 36.8 (final). No policy over the cap on any of 15 bands | **closed** |
| **PG11**: honest's seal on the 40% ceiling | 55.0 and 50.0 on 2 of 10 bands; 36.5 pooled | 24.5 (final, 200 seeds); 17.5–35.0 on every 40-seed band of 15 | **closed** |
| **R3/PG13**: need 0 on seed 619188 | need 0 (1 seed in 10^6) | Seed 619188 → 7; need 5..75 over 10^6 seeds; at least 4 on every seed by bound | **closed** |

**Where the PG10 ratio stands now:**
- **Pooled:** the highest seal/kept in the battery is 0.62 on the 200 final seeds.
- **The breaker's 40-seed bands** (highest seal/kept in each): 52001–52040 0.62; 62001–62040 0.50; 66001–66120 0.54 / 0.63 / 0.64; 74001–74200 0.47 / 0.41 / 0.64 / 0.67 / 0.50.
- **One slice still trips.** Of the 15 forty-seed bands measured on the shipped preset, one has a policy over 0.8: final slice 97161–97200, where `[0,0,0,1,0.5]` was 12/13 and a scheme 11/13.

**What remains (§6):**
1. **The ratio part on 40 seeds is noisy for policies that keep the house in a third of Lives.** About 13 kept Lives make the denominator. One band in 15 still tripped (above), on policies whose pooled ratios are 0.57 and 0.58. Cutting that further fails PG6 (§1). The gate passes as run, on 200 seeds, which is what the breaker asked for.
2. **PG6's margin is thinner:** 69.2% against 60%, where the tuner's preset had 99.2%.
3. **R_AFTER 4 makes a verdict about 18% slower:** 1.03 against 0.87 s. That is still inside 1.5 s.

## 1. Why the road's way was sealed whenever it kept the house, and how the fix was found

**Diagnosis at the tuner's preset** [m: out/d0-*.txt; dsum.js; 200 tuning seeds 30001–30200 at 2000/1000]:

| | kept | mark | clear | P(clear given kept) | P(clear given not kept) | seal/kept |
|---|---|---|---|---|---|---|
| take-turns (the tuner's honest) | 50.5 | +14.4 | 72.5 | 0.78 | 0.67 | 0.78 |
| turns-after-jams (the road's way) | 39.5 | +27.2 | 90.0 | 0.95 | 0.87 | 0.92 |

- **The road's way has a large mark in every kind of valley.**
  - By third near seat: firm +31.5, steady +25.7, wary +23.9.
  - By far trio: +19 to +35, clear in 78–100% [same files].
  - The reason [argued]: the custom `[1,1,0,1,0]` jams both ways. It waits for ever with polite carters and locks for ever with pushers. The road's way `[x,0,0,1,0.5]` undoes both, and the house and kin hold 7 of the 16 ties.
- **Keeping the house makes the mark more likely to clear** (0.95 against 0.87). A firm third neighbour raises both the yard and the mark.
- So seal/kept ≈ P(clear | kept), and no need, margin or seal threshold pulls it down. The breaker showed this for MARGIN 26–30 and SEAL_MARK 8–15, and the correlation above explains it.

**Single dials first, with the tuner's honest policy** [m: out/sw-A, C, F, F8, H1, H3, K2, RL2, R2, R3, R2F6, R2H45, R2H55, R2K1 .txt]. Each run is 100 tuning seeds at 2000/1000, with the need re-centred so that take-turns keeps about 50%. Columns are seal/kept and P(clear | kept).

| Setting | turns-after-jams | `[1,0,0,1,0.5]` | take-turns s/k, mark |
|---|---|---|---|
| a taker in the far pool | 0.92 (0.95) | 0.85 | 0.73, +16.4 |
| soft added to the third seat | 0.94 | 0.91 | 0.80, +17.3 |
| newcomer early (seasons 1–6) | 0.94 | 0.88 | 0.77, +15.6 |
| FOG 0.08 | 0.84 (0.89) | 0.84 | 0.59, +12.5 |
| H 1 / H 3 | 0.86 / 1.00 | 0.80 / 0.89 | 0.50, +4.8 / 0.94, +24.6 |
| K 2 / R_LIFE 2 | 0.95 / 0.97 | 0.91 / 0.87 | 0.93 / 0.73 |
| R_AFTER 2 / R_AFTER 3 | 0.91 / 0.77 | 0.82 / 0.67 | 0.47, +6.9 / 0.32, +2.9 |
| R_AFTER 2 + FOG 0.06 | 0.69 (0.76) | 0.70 | 0.38, +4.8 |

- **Only faster copying in the Afterwards (R_AFTER) brings the road's way down.**
- **But it brings take-turns down faster.**
  - Take-turns teaches the heir to give way after every jam. That feeds the pushers, and with copying quick their way spreads [argued]. The measured result: at the shipped preset take-turns' mark is −0.7 (§4).
  - So with take-turns as honest, compressing the marks breaks the cap instead. At R_AFTER 3, take-turns' seal is 15.0 and turns-after-jams' is 27.0, against a cap of 25.0 [m: out/sw-R3.txt].

**Therefore the fix has two parts:**
1. Make the road's way the honest policy (§3). No turn form then out-seals honest beyond the cap, because honest is the best of them.
2. Compress all marks until the road ways clear in only about half the Lives that keep the house.

**The search with turns-after-jams as honest** [m: out/sw-U-*.txt, out/sw-V*.txt, out/sw-W*.txt]. The "worst road way" column is the highest seal/kept among the other road-like policies measured in that run (5 to 8 of them). Each run is 200 tuning seeds 30001–30200 at 2000/1000, with the need re-centred for honest. PG6 is in the gate's form on 60 seeds at 1000 futures, unless marked.

| Setting | honest s/k | honest seal | worst road way s/k | PG6 |
|---|---|---|---|---|
| R_AFTER 2, FOG 0.06 | 0.76 | 38.0 | 0.75 | 87.5 (40 seeds at 500) |
| R_AFTER 3 | 0.73 | 39.0 | 0.74 | 75.0 (40 at 500) |
| R_AFTER 3, FOG 0.06 | 0.68 | 34.0 | 0.69 | 80.0 (40 at 500) |
| R_AFTER 3, FOG 0.08 | 0.60 | 28.0 | 0.63 | 80.0 |
| R_AFTER 4, FOG 0.06 | 0.61 | 30.5 | 0.61 | 66.7 |
| R_AFTER 4, HOLD_LINE 0.45 | 0.56 | 30.0 | 0.61 | **58.3 ✗** |
| R_AFTER 2, FOG 0.06, HOLD_LINE 0.42 | 0.67 | 33.5 | 0.66 | 66.7 |
| **V5:** R_AFTER 3, FOG 0.06, K 0.25 | 0.58 | 32.0 | 0.56 | 83.3 |
| **shipped (W1):** R_AFTER 4, FOG 0.06, K 0.25 | **0.50** | **27.5** | **0.49** | **75.0** |
| R_AFTER 3, FOG 0.06, K 0.25, HOLD_LINE 0.47 | 0.55 | 30.5 | 0.56 | 73.3 |
| R_AFTER 3, FOG 0.07, K 0.25 | 0.56 | 29.0 | 0.58 | 88.3 |

**Why V5 was set aside.** V5 passed all 14 gates on its own final run, 90001–93303 at 200 seeds [m: out/v5/final-gates-V5.txt]:
- honest kept 51.1%, seal 28.0%, seal/kept 0.56;
- the highest seal/kept in the battery was 0.62;
- PG6 85.0%.

It also passed the breaker's 66001–66120 bands [m: rerun/v5/bigbattery-sum-out-V5.txt]. But single 40-seed bands tripped:
- a scheme at 9/11 = 0.82 on 92081–92120;
- honest at 42.5% seal and 17/21 = 0.81 on 74121–74160 [m: rerun/v5/capband-*.txt].

That is binomial noise at a true seal of about 30% and a true ratio of about 0.6 [argued]. The breaker's complaint was exactly band-level failure. So I moved to W1 and set MARGIN 21 so that honest keeps about 46%. On tuning seeds [m: out/bW1-*.txt, bsum.js; 57 policies]:
- pooled highest ratio 0.54;
- highest on any 40-seed band 0.67;
- honest seal 26.5 (22.5–30.0 by band).

The cost was PG6: 70.0% on 120 tuning seeds [m: out/pre-rest-W1.txt].

## 2. Settings (preset.json) and why

`B 3, C 1, S −2, H 2, FOG 0.06, K 0.25, R_AFTER 4, FLOW_KIND 'one', HOLD_LINE 0.5, FOUNDERS { near: ['taker','taker',['firm','wary','steady']], far: ['firm','firm','firm','soft','wary','steady'] }, STORE_START 50, NEED_PIVOT −38, NEED_WEIGHT 0.5, MARGIN 21, REPLAY 'habit', RANGE_WAYS = the seat's thirteen`

CUSTOM stays `[1,1,0,1,0]`. Unchanged from the tuner: stakes, founders, flow, HOLD_LINE, range, REPLAY, pivot and weight.

**As overrides on e1's preset:** `{ R_AFTER: 4, FOG: 0.06, K: 0.25, MARGIN: 21, STORE_START: 50 }` [fx-preset.js; NEED_PIVOT −38 and NEED_WEIGHT 0.5 are restated there unchanged]. preset.json, given to createLife as an overrides object, gives identical Lives: 200 honest Lives on every field except `place`, plus 100 futures on 10 of them, 0 differ [m: out/check-preset-out.txt].

| Dial | Was | Now | What it does in play |
|---|---|---|---|
| R_AFTER | 1 | 4 | **Word travels fast on a trade road.** After you leave, four of the eight carters look round each season and copy whoever did better. Whatever way pays spreads within a few seasons. So the house's own ties decide less, every mark moves toward the custom's, and the road's way clears in about half the kept Lives instead of all of them. |
| K | 0.5 | 0.25 | **Carters copy the better-off more surely.** Feeding pushers then spreads pushing. That is what separates "give way after every jam" (mark −0.7) from "take turns at the jams" (+11.4) [m: final-gates.txt]. At R_AFTER 4 and FOG 0.06 it also lowers honest's seal/kept (0.50 against 0.61) and buys back PG6 margin (75.0 against 66.7) [m: out/sw-W1.txt, out/sw-V1.txt; same seeds and the same gate form]. |
| FOG | 0.04 | 0.06 | **The mule balks 6% of the time:** a give-way becomes a drive-on. More of the custom's for-ever jams break [argued]. Together with R_AFTER, the custom's baseline rises (PG7 median 57.0 against the tuner's 26–31) and the road ways' margin over it falls. Compare R_AFTER 3 alone at 0.73 / 0.74 with R_AFTER 3 + FOG 0.06 at 0.68 / 0.69 (§1). |
| MARGIN | 24 | 21 | **Need re-centred for the new honest policy.** Honest keeps 45.1% of the 2000 final Lives (46.9% on tuning Lives 10001–12000) [m: final-gates.txt, tn.js]. |
| STORE_START | 40 | 50 | **The breaker's fix (§5.4).** The custom cannot earn less than −96 in twelve days (four ties at −2 a tie-day), so the need is at least 4 on every seed [argued from the formula; m: rerun/need-fix-out.txt]. |

## 3. Honest policy, selfish act, battery (policies.js, fx-battery.js)

**Honest policy (one sentence):** "Let a carter you have not met go first; after one of you crossed, the other goes next; if you both waited, go; if your wheels locked, give way the first time, and the next time they lock with that carter it is their turn to give way."

It is `Bridges.fns.turnsAfterJams` from the tuner's policies.js, unchanged. Its memory is per carter: how many times the wheels have locked with that carter.

**Why this is the honest policy:**
- **It is the lesson written as a rule:** take turns, and take turns at the jams too.
- **It removes the breaker's artefact.** The old honest left both carters waiting 3 or more days running in 39.4% of Lives (breaker). This one does so in 0.0%: after both waited it always goes [m: rerun/deadlock-out.txt, 2000 Lives 70001–72000].
- **The tuner set it aside only for its seal/kept** (0.84 at the old preset). It is 0.57 now [m: final-gates.txt].
- **The old honest is now a store-serving policy and stays in the battery as a scheme.** It keeps 54.5% with a mark of −0.7.
- **Honest is not dominated.** No battery policy keeps at least as often with at least its mark, other than its own duplicate, the tuner's "turns-after-jams" row [m: out/final-bsum.txt].

**Last day under R2** [m: out/lastday-out.txt; 80 tuning seeds 46001–46080]:
- Honest's day-12 acts go against habit in 20 of 80 Lives: 21 acts "drove on at a jam where the habit is to give way", and 1 "after both waited, never met before". The replays are worse for the road (mean −1.8 points). Nothing was withheld.
- "Cross while you can" on the last day: R2 withholds for cost in 31 of 80 and for bought in 2. Seal 10/80 against honest's 22/80.

**Selfish act:** "cross while you can", the tuner's, unchanged. It is applied on the last 1, 2 or 3 days.

**Battery: 57 policies.**
- placelab's 16;
- placelab's three Bridges schemes;
- the tuner's eight (turns-after-jams among them, now the same as honest);
- 30 added (policies.js). These are:
  - the honest rule with the brief's and the tuner's last-day acts;
  - the old honest and its last-day forms;
  - the fixed ways `[1,0.5,0,1,0.5]`, `[0.5,0,0,1,0.5]`, `[0,0,0,1,0.5]`;
  - every breaker scheme that broke PG10 (half turns with pushers only, unstuck + half turns, lock the pushers, honest unstuck), plus the calendar rota;
  - the breaker's turns-after-jams grabs, which are now honest-based grabs before the last day: cww 9–11, 7–11, 10–12; grab-if-short 11 and 10–11; milk 9–11; yield to pushers 9–11; best-with-habit 12; strangers drive on; and two more.

## 4. The gates: final run

**Setup.** The shipped preset, honest and selfish as in §3, the 57-policy battery.

**Seeds:**

| Purpose | Seeds |
|---|---|
| lives | 95001–97000 |
| seal | 97001–97200 (200 seeds) |
| grid | 97301–97312 |
| spread | 97401–97520 |
| g6 | 97601–97720 |
| mirror | 97801–97920 |
| pull | 98001–98040 |
| sealGrid | 98101–98112 |
| det | 98201–98202 |
| speed | 98301–98303 |

**How it was run** [m: final-gates.txt; final-gates.sh runs final-gates.js and battery.js]:
- PG3–9, PG12 and PG5 come from `PlaceLab.gates(…, only: …)` [m: out/fg-rest.txt].
- PG1, PG2, PG10, PG11 and PG13 use placelab's formulas on the battery rows [m: out/fg-b-*.txt].
- PG14 was re-timed in a fresh process at machine load about 12 [m: out/fg-pg14.txt].

| Gate | Measured | Pass |
|---|---|---|
| PG1 honest keeps 35–65 | 45.1% of 2000 Lives | ✓ |
| PG2 last days | seal: honest 24.5; selfish on the last 1 / 2 / 3 days 15.5 / 5.5 / 1.5 | ✓ |
| PG3 spread | ≥ 25 apart in 98.3% of 120 (median 42.8) | ✓ |
| PG4 no trivial way | 100% of 12 (best on average `[0,0.5,0,1,0.5]`) | ✓ |
| PG5 determinism | 0 of 2 reruns differ; 16 flips, 849,874 shared draws, 0 differ | ✓ |
| PG6 a habit matters | ≥ 5 in 69.2% of 120 (median 7.0) | ✓ |
| PG7 not a lottery | inside 15..85 in 98.3% (median 57.0) | ✓ |
| PG8 mirror | 100% (custom, forgiving, honest) | ✓ |
| PG9 situations | median 5 (min 4) | ✓ |
| PG10 no recipe | See below | ✓ |
| PG11 a trade | See below | ✓ |
| PG12 not the valley | (a) the valley's best `[1,1,0.5,1,0]` ranks #142; (b) ρ 0.38; (c) SHORTED mark −6.0 against the valley's +1.2, and NEITHER store +1.8 against −0.7 | ✓ |
| PG13 page sanity | need 8..64 over 57 policies × 2000 Lives, all whole. Need 5..75 over seeds 1–10^6 [m: rerun/needscan-1.txt, needscan-2.txt] | ✓ |
| PG14 cost | 1.04, 1.05, 1.06 s at load about 12. The rest run printed 2.11–2.40 s at load 55–80 | ✓ |

**PG10 in detail:**
- Highest seal besides honest: 25.5 (turns-after-jams + best-with-habit day 12), against a cap of 36.8. None over the cap.
- Highest seal/kept: `[1,0.5,0,1,0.5]` 0.62 (40/65).
- Then turns-after-jams + best-with-habit 0.60, strangers-drive-on 0.58, honest 0.57.

**PG11 in detail:**
- Honest: 45.1% kept, mark +11.4, seal 24.5.
- Trades: 22 policies keep within 3 of honest with a mark at least 10 lower. Among them:
  - honest+selfish3: 60.2% / −4.1;
  - take-turns + cross while you can, last season: 71.0% / −10.3;
  - the old honest: 54.5% / −0.7;
  - turns-yield-to-pushers: 58.6% / −18.9.

**The battery gates on each 40-seed slice of the seal band** (the gate's minimum count) [m: final-gates.txt]:

| Slice | honest seal | over cap | highest s/k | PG2 |
|---|---|---|---|---|
| 97001–97040 | 22.5 | none | 0.56 `[1,0.5,0,1,0.5]` | ok |
| 97041–97080 | 27.5 | none | 0.78 lock the pushers | ok |
| 97081–97120 | 20.0 | none | 0.67 `[1,0.5,0,1,0.5]` | ok |
| 97121–97160 | 25.0 | none | 0.63 honest | ok |
| 97161–97200 | 27.5 | none | **0.92 `[0,0,0,1,0.5]` (12/13); 0.85 strangers drive on (11/13)** | ok |

**Clause rates on the 200 seeds** [m: out/final-bsum.txt]:
- honest: last-day entry 19.5%, bought 1.0, cost 0.5, won 1.5;
- honest+selfish1: entry 66.0%, bought 6.0, cost 39.0.

## 5. Each break, re-run with the breaker's own scripts on the breaker's own bands

**Copies.** Each copy is in `rerun/`. It differs from the breaker's file only in its first load line, which names `bb-common-fixed.js` instead of `bb-common.js`. That file is the breaker's helpers with PL set to the shipped preset, and with Bridges.honest, POPTS and the battery set to the fixed ones.

Two copies needed one more change each:
- `rerun-capbands-sum.js` reads its own folder and maps the new honest's name to "honest".
- `rerun-needscan.js` loads fx-preset.js and creates Lives with it.

**Not re-run:** `sealmark-whatif.js` and `margin-whatif.js`, which test fixes the breaker proposed rather than breaks, and `trace.js` and `list-schemes.js`, which are diagnostics.

**A naming trap.** In `bb-schemes.js` the scheme named "honest" is the old take-turns. So in the screen and bigbattery outputs, the row "turns-after-jams" is the shipped honest, and the row "honest" is the new honest only where the battery supplies it.

### 5.1 PG10 ratio: closed

| Band | Breaker (tuner's preset) | Shipped preset | Source |
|---|---|---|---|
| 52001–52040 | turns-after-jams 1.00, `[1,0,0,1,0.5]` 0.94 | turns-after-jams (= honest) 0.61, `[1,0,0,1,0.5]` 0.55. The highest of the 57 is 0.62 (`[0.5,0,0,1,0.5]`). All 14 gates pass on the breaker's bands at 40 seeds, and the lab's 19-policy battery passes too | rerun/gates-fresh-out.txt |
| 62001–62040 | turns-after-jams 1.00; half turns w/ pushers 0.90; unstuck + half turns 0.91; lock the pushers 0.93 | 0.43 / 0.42 / 0.35 / 0.29. The highest of all 52 breaker schemes is 0.50 (strangers drive on). New honest seal 25.0 | rerun/screen-all-out.txt |
| 66001–66120, three bands | turns-after-jams 0.86 / 0.94 / 0.88; `[1,0,0,1,0.5]` 0.88 / 0.95 / 1.00 | No policy of 70 over 0.8 on any band. Highest 0.54 / 0.63 / 0.64; pooled highest 0.54 | rerun/bigbattery-sum-out.txt; bsum.js on the same files |
| 74001–74200, five bands | turns-after-jams 0.89–1.00; `[1,0,0,1,0.5]` 0.82–0.95 | Highest 0.47 / 0.41 / 0.64 / 0.67 / 0.50; pooled honest 0.50, `[1,0,0,1,0.5]` 0.46 | rerun/capbands-out.txt |
| 64001–64040, the 243 fixed ways at 500/300 | `[1,0,0,1,0.5]` seal 42.5, s/k 0.89; six ways over 0.8 | Top seal 17.5 (`[0.5,0,0,1,0.5]`, s/k 0.39). One way over 0.8, kept in 1 seed of 40 (1/1) | rerun/sealgrid-screen-out.txt |

**The pooled ratios are well under 0.8:** 0.62 is the highest of 57 on the 200 final seeds, 0.54 of 70 on the breaker's 120 seeds, and 0.50 of the 5 capbands policies on the breaker's 200 seeds. The remaining risk is single 40-seed bands on policies that keep about a third of Lives (§6.1).

### 5.2 PG10 cap: closed

- Honest is turns-after-jams, so the scheme that out-sealed honest is honest.
- On every band of 5.1, no policy is over max(1.5 × honest, honest + 10).
  - On 74001–74200, honest's seal by band is 22.5 / 17.5 / 22.5 / 30.0 / 17.5 against caps of 33.8 / 27.5 / 33.8 / 45.0 / 27.5. The highest other policy is 27.5 [m: rerun/capbands-out.txt].
  - On 66001–66120 the band caps are 30.0 / 41.3 / 27.5, with "over cap: none" [m: rerun/bigbattery-sum-out.txt].

### 5.3 PG11 seal ceiling: closed

**Honest's seal by band:**

| Band(s) | Honest seal |
|---|---|
| 52001–52040 | 35.0 (the breaker had 55.0 here) |
| 62001–62040 | 25.0 (row "turns-after-jams") |
| 66001–66120 | 20.0 / 27.5 / 17.5 |
| 74001–74200 | 22.5 / 17.5 / 22.5 / 30.0 / 17.5 |
| final slices | 22.5 / 27.5 / 20.0 / 25.0 / 27.5 |

Pooled it is 24.5 on the final 200 seeds. On 15 forty-seed bands it never goes above 35.0 and never below 17.5. The trade survives everywhere (above).

### 5.4 R3/PG13 need 0: closed

- Seed 619188: need 0 → 7. Honest's purse there is 19, kept.
- Seed 130466: 1 → 8 [m: rerun/need-fix-out.txt].
- Over seeds 1–1,000,000 the need runs 5..75, with none at 0 or below. The lowest custom purse is −44, store start included, so the custom earned −94 [m: rerun/needscan-1.txt, needscan-2.txt].
- **Bound:** need ≥ 50 + max(e + 1, round(−38 + 0.5 (e + 38) + 21)) with e ≥ −96, so need ≥ 4 on every seed [argued; printed in rerun/need-fix-out.txt].

### 5.5 Minor items from BREAK.md

- **§2.5, honest waits for ever: gone.** 0.0% of Lives with a run of 3 or more days both waiting [m: rerun/deadlock-out.txt].
- **§2.6, stepping around R2's day-12 window: still possible, still small.**
  - turns-after-jams + grab-if-short days 10–11 keeps 45.8% against 45.1%, with seal 21.5 against 24.5.
  - Grabs on days 9–11 (cww 9–11) give seal 7.5 and mark −2.4 [m: final-gates.txt].
  - This is not a recipe. R2 still sees day 12 only (E1 open issue 7).
- **§2.7, the brief's act "drive on in their turn where they look likely to give way":** it changes honest's choices in 43 of 2000 Lives (1 day) and 172 (3 days). Seal 24.0 against honest's 24.5 [m: rerun/fx-fires-out.txt, final-gates.txt]. The breaker's `fires.js` itself now compares the tuner's take-turns scheme with the new honest, so it says nothing about this policy [m: rerun/fires-out.txt].
- **PG14 under load.** At load about 9 the breaker's `cost.js` gives 0.89–1.05 s per verdict [m: rerun/cost-out.txt].

## 6. What could not be closed, and the risks

1. **The ratio part on 40 seeds stays noisy for low-keeping policies.**
   - What happened: on 1 of 15 forty-seed bands, a fixed way that keeps about 30% of Lives was sealed in 12 of its 13 kept Lives. Its pooled ratio is 0.57.
   - How often to expect it [argued]: with a true 0.57, 12 or more of 13 has probability about 0.7%. But 10 or so road-like policies share the same seeds, and their marks move together band by band.
   - Why it was not pushed further: the next compression step (R_AFTER 4 + HOLD_LINE 0.45) fails PG6 (58.3%) [m: out/sw-V4.txt]. A lower ratio needs smaller marks, which PG6 and PG11's 10% floor will not allow.
   - **Design call:** the gate is measured here on 200 seeds, which BREAK.md §2.2 and §2.3 recommend. If the lead wants it on every 40-seed band, the lab's PG10 needs a floor on kept Lives (E1 open issue 9). Otherwise this place does not pass it for the fixed ways `[x,0,0,1,0.5]`.
2. **PG6's margin.** 69.2% on the final band (70.0% on tuning seeds), against the tuner's 99.2%. With 120 seeds the standard error is about 4.2 points [argued].
3. **PG14 margin.** R_AFTER 4 costs about 18% more per verdict than the tuner's preset, measured alternately in one process: 1.03 s mean (max 1.08) against 0.87 (max 0.91) at load about 11 [m: out/cost-both-final.txt]. Under heavy load (55–80) both exceed 1.5 s of wall time [m: out/fg-rest.txt; out/cost-*.txt].
4. **The honest seal is now in the lower half of PG11's band.** It is 24.5 pooled and 17.5–35.0 by band. A 40-seed band falls under 10% with probability under 1% [argued].
5. **R2 replays honest acts.** Honest's even-jam hold goes against its own give-way habit at jams, so day 12 is replayed in about 20–25% of honest Lives. "won" withheld honest's seal in 1.5% of the final seeds; on tuning seeds nothing was withheld [m: out/final-bsum.txt, out/lastday-out.txt].
6. **Negative yards.**
   - Honest's yard goes below zero in 0.1% of Lives (lowest −3), and `[1,0,0,1,0.5]` in 0.3%.
   - The custom's yard is negative in 12.4% of Lives (39.5% at the tuner's preset), never-give-way's in 96.3% [m: out/yard-out.txt, 2000 tuning Lives].
   - So the page must still word a negative yard.
7. **R_AFTER 4 is outside the valley's tunable range (1..2).** That is a place dial, so the engine accepts it [argued]. The Afterwards will show four looking-round entries a season instead of one.

## 7. The lesson as it plays

Kept is over the 2000 final Lives; mark and seal are over the 200 final seeds [m: final-gates.txt].

| Play | kept | mark | seal |
|---|---|---|---|
| always give way (the polite) | 15.0 | −26.0 | 0.0 |
| push the polite (the pushy) | 55.4 | −27.8 | 0.0 |
| never give way | 0.0 | −8.8 | 0.0 |
| the valley's careful | 0.1 | −2.7 | 0.0 |
| give way after every jam (the tuner's honest) | 54.5 | −0.7 | 10.0 |
| strict turns `[1,0,0,1,1]` | 53.0 | −2.9 | 6.5 |
| give way to a carter who never does | 58.6 | −18.9 | 0.5 |
| **take turns, at the jams too (honest)** | **45.1** | **+11.4** | **24.5** |
| honest, then cross while you can for the last 3 days | 60.2 | −4.1 | 1.5 |

- **The road against the yard.** Taking turns at a jam means locking wheels again with a pusher every other time. That costs loads (45% kept against 54–60%). Of the human-sized rules in the table, it is the one that leaves the road moving.
- **Giving way after every jam saves loads and feeds the pushers.** With word travelling fast, their way spreads, and the mark goes to about zero.
- **Crossing while you can in the last days** buys about 15 points of kept for about 15 points of road. R2 withholds the seal.

**Day-3 pulls against the valley** [m: final-gates.txt, PG12]:
- Giving way again after they crossed costs the road (−6.0); in the valley the same act helps (+1.2).
- Giving way after locked wheels pays the store here (+1.8; −1 against −2); in the valley it costs (−0.7).

## 8. What the page must show for this place (changes from TUNE.md §7)

- **The yard** starts at 50 loads. The need is 5..75 (over 10^6 seeds). Honest ends at a median of 32 against a median need of 33 [m: out/yard-out.txt].
- **The balking mule** acts 6% of the time (was 4%).
- **The Afterwards** has four looking-round entries a season. Adoptions are more frequent and follow payoff more sharply.
- **The last-day line under 'habit'.** Honest's replayed act is "you drove on at the jam" where its habit was to give way. The line must take its verb from `lived` / `replayed` (as TUNE.md said).
- **Unchanged from TUNE.md §7–8:** stakes card, words, range, FLOW_KIND strip, the custom's wording.

## 9. Engine changes

None. Every setting is a dial in `e1/engine-places.js`, and the engine file was neither copied nor edited. Valley identity therefore stands as E1 proved it.

## 10. Files (all in fix-bridges/)

**Deliverables:**
- `preset.json`
- `final-gates.txt`
- `FIX.md`
- `policies.js` (honest, selfish, and the place schemes; 30 of them are new to the battery)
- `fx-battery.js` (registers them with placelab)
- `fx-preset.js` (the overrides)

**Gate run:**
- `final-gates.sh` runs `final-gates.js` (modes rest, pg14, combine) and `battery.js` → out/fg-*.txt and final-gates.txt
- `bsum.js` → out/final-bsum.txt

**Breaker re-runs:** in `rerun/` (rerun-*.js), with `bb-common-fixed.js`:
- gates-fresh-out.txt
- capband-0..4.txt → capbands-out.txt
- big-*.txt and bigx*-57.txt → bigbattery-sum-out.txt (the breaker's own `bigbattery-sum.js`)
- screen-*.txt → screen-all-out.txt
- sealgrid-s-*.txt → sealgrid-screen-out.txt
- needscan-1/2.txt
- deadlock-out.txt
- cost-out.txt
- fires-out.txt

Plus `fx-fires.js` → rerun/fx-fires-out.txt and `fx-needcheck.js` → rerun/need-fix-out.txt.

**The V5 candidate:** out/v5/ (its final run and fx-preset) and rerun/v5/ (its capbands and bigbattery re-runs).

**Evidence:**
- `fx-common.js`, `fx-policies.js` (setup)
- `diag.js` + `dsum.js` → out/d0-*.txt
- `sweep.js` + `run.sh` → out/sw-*.txt
- `battery.js` + `runb.sh` → out/bV3-*, bV5-*, bW1-*.txt
- `pre-rest.js` → out/pre-rest*.txt
- `pg37.js`
- `tn.js`
- `fx-yard.js` → out/yard-out.txt, out/lastday-out.txt
- `fx-cost.js` → out/cost-*.txt
- `check-preset.js` → out/check-preset-out.txt
