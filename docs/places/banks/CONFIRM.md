> **Record of its time.** Written 2026-11-25 19:19 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Banks: confirmation report

Folder: `<scratch>/places/confirm-banks/`. File names below are in that folder.

**Labels.** **[m: file]** = measured by a script in this folder that wrote that file. **[argued]** = reasoned from code or from measured numbers, not run.

## 0. Verdict: holds

There is no blocking break.
- All fourteen gates pass on fresh seeds, read as LEAD-DECISIONS 2.6 says [m: out/gates-combined.txt, out/pg14-quiet-out.txt].
- PG14 failed only in the run where my 12 processes started at once (1.63 s at load about 20). Timed with the machine quiet it is 1.07 s, and 1.09 s at load 6 [m: out/pg14-quiet-out.txt, out/pg14-late-out.txt].
- I measured the fixer's 86-policy battery (which holds every breaker and fixer scheme), 83 schemes of my own, and 10 follow-ups on four more fresh bands. Every one was on at least 200 pooled fresh seeds. None goes over the PG10 cap. None breaks the PG10 ratio with 20 or more kept Lives.

These findings are not blocking. Details are in §3–§6.
1. **The need can be 301.** One seed in 99,999 has a need of 301, so the page fact "need ≤ 300" does not hold (§6). PG13 still passes as gated.
2. **Shaping the SHORTED habit beats the honest policy, below the cap.** Keeping your forgiveness at about one slip in three beats honest by **+3.0 ± 1.4** seal points over 600 seeds. The cap allows +12 (§3.3).
3. **Late shaping against habit is a small, real late-act hole.** Doing it only on days 9–11 against your habit gains **+2.0 ± 0.8** over 1000 seeds under REPLAY 'habit'. REPLAY 'season' closes it (−0.8 ± 0.5) (§3.3, §5).
4. **Honest players lose some seals in ways they cannot see coming.** Under 'habit', the day-12 replay withholds 4 of 148 kept-with-clear-mark honest seals. Under 'season' it is 11 of 148. One of those 11 is the peacemaker's own peace offer in a first quarrel that came in the last season (§4).
5. **The breaker's day-11 peace finding is not reproduced.** It was about +11 points. Now peace-on11 against the reader is +0.0 over 600 seeds, and peace-on9-11 is +1.3 over 1000 (§3.4).

**REPLAY 'season':** every gate passes under it, and it closes the late-shaping hole. But it costs the honest policy 1.7 seal points: 17 of its 241 seals in 1000 seeds. It also withholds seals from late learners of the place's own lesson. **I do not recommend it for the Banks.** If the design lead holds the seal-integrity principle strictly, it is safe to adopt: no gate fails (§5).

## 1. Setup

| Item | Value |
|---|---|
| Engine | `final/engine.js` md5 `2fa86b59…`, unedited. createLife(seed, 'banks'). `cb-common.js` checks that `PLACES.banks` equals `fix-banks/preset.json` (canonical JSON) |
| Lab | `e1/placelab.js` md5 `50abdfe4…`, unedited |
| Honest | `pm1`, the peacemaker (`src/fx-policies.js`, a copy of the fixer's, unedited) |
| Selfish | the fixer's "fish across where it pays" |
| Battery | the fixer's 86 policies (`src/fx-battery.js`): placelab's 16, the Banks schemes, the tuner's 3, all 39 of the breaker's (`src/bk-schemes.js`), and the fixer's 27 |
| Counts | 2000 headline futures, 1000 for the last-day and season replays; kept over 2000 Lives; rest gates at placelab's full counts |
| Seeds | all in 2,000,001–2,099,999 (table below) |

| Seeds | Use |
|---|---|
| 2000001–2002000 | kept (lives band) |
| 2002001–2002200 | seal band, 200 seeds (gates, round-1 attack) |
| 2002301–2003303 | rest-gate bands (grid, spread, g6, mirror, pull, seal grid, det, speed), as in the fixer's layout |
| 2004001–2004200 / 2006001–2008000 | round 2: seal / kept |
| 2010001–2010200 / 2012001–2014000 | round 3 |
| 2016001–2016200 / 2020001–2022000 | round 4 |
| 2018001–2018200 / 2022001–2024000 | round 5 |
| 2040001–2040400, 2041001–2041300, 2090001–2090015, 2095001–2095030 | exploration and checks |
| 2000001–2099999 | page facts (Lives only) |

**One verdict, read under both rules.** Each seal-band Life is judged once under `{ REPLAY: 'season' }`. I read two seals from that one verdict:
- the 'habit' seal is houseKept, markClear, and not bought, cost or won;
- the 'season' seal is the habit seal and not wonOnSeason.

Over 180 Lives (12 policies × 15 seeds), the habit fields from that one verdict equal the shipped preset's own verdict: 0 differ [m: out/equiv-out.txt]. `judge2` also checks every Life against `seal.earned`.

**Shortcut.** In cb-attack.js, a Life whose twelve days of choices equal the honest Life's choices reuses the honest verdict. Same seed and same choices give the same Life [argued: deterministic engine]. The "differ" column counts the Lives that were judged on their own.

## 2. The fourteen gates, fresh, against the fixer's final-gates.txt

Seal band 200 seeds; ratio judged only where kept ≥ 20 (LEAD 2.6) [m: out/gates-combined.txt, rest from out/rest-habit-2000001.txt].

| Gate | Mine (2000001..) | Fixer (90001..) | Pass |
|---|---|---|---|
| PG1 | honest kept 45.8% of 2000 | 43.7% | ✓ |
| PG2 | honest 22.0%; selfish 1/2/3 days 3.0 / 0.0 / 2.5% | 23.5; 4.5 / 1.0 / 4.0 | ✓ |
| PG3 | 90.8% of 120 (median 35.0) | 87.5% | ✓ |
| PG4 | 100% of 12; best [0,1,0.5,1,1] | 100% | ✓ |
| PG5 | 0 of 2 reruns differ; 1,010,926 shared draws, 0 differ | 0 differ | ✓ |
| PG6 | 88.3% (median 9.6) | 80.8% | ✓ |
| PG7 | 98.3% (median 57.3) | 98.3% | ✓ |
| PG8 | 100% | 100% | ✓ |
| PG9 | median 4 (min 2) | 4 | ✓ |
| PG10 | highest other [1,1,0.5,1,1] 23.5% (cap 33.0). Largest s/k with ≥ 20 kept: [1,1,0.5,1,1] 47/77 = 0.61. Under 20 kept and over 0.8: none | 23.5 (cap 35.3); 0.67 | ✓ |
| PG11 | honest+selfish2 55.6% / −5.8 against honest 45.8% / +10.7; also honest+grab-soft11, and four thin trades (mark −0.7 to +0.2 against ≤ +0.7 needed); honest seal 22.0% | 56.0 / −4.9 against 43.7 / +9.2 | ✓ |
| PG12 | (a) #49; (b) Spearman 0.69; (c) SHORTED mark −1.7 vs +1.2 and NEITHER store +11.7 vs −0.7 | #42; 0.52; NEITHER +16.7 | ✓ |
| PG13 | need 172..284 over 86 × 2000 Lives; all whole; tie levels whole in 450 seasons | 165..283 | ✓ |
| PG14 | quiet: 1.07, 0.93, 1.05 s (max of 6: 1.07). User CPU 6.13 s for 6 verdicts | 1.00–1.09 | ✓ |

**Notes.**
- The PG14 run inside cb-rest.js read 1.63, 1.23 and 1.36 s. At that moment the load was rising from 2 to over 20, because my 12 processes started together [m: out/rest-habit-2000001.txt]. That is load, not a break.
- **PG12(b)** rose from 0.52 to 0.69. It is still under 0.8 but has less room (one 12-seed grid each).
- **40-seed slices** are robustness only (LEAD 2.6). PG2 and PG11 pass in 5 of 5. The cap is over in 1 slice ([1,1,0.5,1,1] 27.5 against 22.5). The ratio is over 0.8 only on 1–2 kept Lives [m: out/gates-combined.txt].
- **Residuals named in the brief.**
  - PG12(a) and (c) pass with the poacher cast.
  - The PG10 ratio is clean once the 20-kept floor applies.
  - The PG11 trade with room is still the new selfish act (honest+selfish2, mark 6.5 below the bar). The other trades are thin.

## 3. Attack

All rows use shipped counts and are paired with honest on the same seeds. d = seal − honest seal, ± its paired standard error. Cap = max(1.5 × honest, honest + 10).

### 3.1 What the peacemaker's habit looks like

[m: out/explore-out.txt, 400 Lives]
- At day 12 its ways are [1, 1, 0.49, 1, 1]. SHORTED is the only mixed habit (n about 5).
- Before day 9, its SHORTED habit says "fish across" in 208 of 400 Lives. Every other habit says "keep off".
- On days 9–12 it acts against its own habit 312 times in 400 Lives, every time in SHORTED (and twice in NEITHER).
- So **generous acts against habit late barely exist for this honest policy.** Peace is already its habit. The only lever late is SHORTED: forgive, or refuse.

### 3.2 Round 1: 83 schemes on the seal band (200 seeds)

Honest has 44 seals (22.0%). The cap is 33.0 under 'habit' and 31.5 under 'season' (honest 21.0%) [m: out/gates-combined.txt, attack tables].

| Family | Schemes | Seal % habit (d) | Seal % season | Note |
|---|---|---|---|---|
| Generous against habit, days 9 / 10 / 11 / 12 / 9–11 / 10–11 / 9–12 | cb:gen-against-* | 21.5–22.0 (−0.5 to 0) | 20.5–21.0 | changes 7–30 Lives of 200 |
| All generous on 11 / 12 / 9–11 / 10–11 | cb:gen-all-* | 21.0–22.0 (−1.0 to 0) | 20.5–21.0 | |
| Selfish against habit, day 9 / 10 / 11 (all, soft, kin, not kin), 9–11, 10–11 | cb:self-against-* | 0.0–21.0 (−22 to −1) | 0.0–18.0 | soft on day 11 is the best, −1.0 ± 2.0 |
| Fish where it pays, days 9–11 / 10–11 / 11 only (day 12 honest) | cb:fwp-* | 19.0–20.5 (−3.0 to −1.5) | 17.0–18.0 | |
| Flip against habit, day 11 / 9–11 | cb:flip-against-* | 7.0 / 0.0 | 6.0 / 0.0 | |
| Staged generous precedent on day d = 2..12 | cb:prec-gen-d | 17.0–22.5 (−5.0 to +0.5) | 16.5–21.5 | day 2 (forgive a stranger's first slip) costs 5 |
| Staged grab on day d = 2..12 | cb:prec-grab-d | 1.5–8.0 (−20.5 to −14.0) | 0.5–7.0 | |
| NEW on day 1: the sister / one / two / sister+one | cb:new-fish-* | 13.0–19.0 (−9.0 to −3.0) | 12.5–18.0 | |
| The sister: milk 9–11 / 11 / 2–11; grab on 4 and 8; forgive all; forgive only her | cb:kin-*, cb:forgive-kin-only | 2.5–22.5 (−19.5 to +0.5) | 2.5–21.5 | |
| Milking soft boats from 2 / alternate / from 9 | cb:milk-soft-* | 9.0–19.0 (−13 to −3) | 8.0–17.0 | |
| Season ends: grab soft / grab all / generous on days 4 and 8; grab soft on 12; grab soft on 8 then generous 9–11 | cb:grab-*-4-8, cb:gen-4-8, cb:grab-soft-12, cb:grab-soft-8+gen-9-11 | 0.0–21.5 (−22 to −0.5) | 0.0–20.5 | grab-soft-12: cost clause 15.5% |
| The stock: refill on 9–12 / 9–11; keep off on a spent bank; grab on a full bank (soft 2–11, soft 9–11, all 9–11) | cb:refill-*, cb:spent-keep, cb:full-grab-* | 0.0–22.0 (−22 to 0) | 0.0–21.0 | |
| Near-honest rules: forgive two slips; strangers late; never forgive to day 8; forgive all from 9 | cb:pm1-*, cb:nf-then-pm1-9 | 17.0–22.0 (−5.0 to 0) | 8.5–21.0 | never forgive to day 8 falls to 8.5% under 'season' |
| **SHORTED shaped to a target** | cb:shape-sh33-life / sh33-9-11 / sh50-9-11 / sh50-9-12 / sh50-life / sh67-* | **29.0 (+7.0 ± 2.4)** / 25.0 (+3.0 ± 1.9) / 23.5 (+1.5) / 23.5 (+1.5) / 22.5 / 20.5–21.0 | 24.5 (+3.5) / 20.5 (−0.5) / 20.5 / 20.5 / 19.0 / 18.0–20.0 | the only family above honest |

The fixer's 86-policy battery on the same seeds is in §2. Every breaker scheme seals at or below honest. peace-every1 equals honest; it makes the same choices as the peacemaker. The best breaker scheme built on the reader is peace-from7 at 19.5%.

### 3.3 Follow-up: the SHORTED target, on fresh bands

The schemes, all built on the honest policy:
- **cb:shape-sh33-life:** whenever in SHORTED, keep off or fish across, whichever brings your SHORTED tally closest to 1/3. Its carried SHORTED is 0.33, against honest's 0.50. For the -9-11 form it is 0.43, and kept moves by less than 2 points [m: out/tally-out.txt, 300 Lives].
- **-9-11 / -9-12:** the same on those days only. Day 12 is honest in the -9-11 form.

| Scheme | Seeds pooled | Habit d | Season d | Seal habit / cap | File |
|---|---|---|---|---|---|
| cb:shape-sh33-life | 600 (bands 1–3) | **+3.0 ± 1.4** | +1.2 ± 1.3 | 27.0% / 36.0 | out/pair-poolB.txt |
| cb:shape-sh33-9-11 | 1000 (bands 1–5) | **+2.0 ± 0.8** | −0.8 ± 0.5 | 26.1% / 36.2 | out/pair-poolA.txt |
| cb:shape-sh33-9-11 | 800 (bands 2–5, fresh after round 1) | +1.8 ± 0.8 | −0.9 ± 0.6 | 26.4% / 36.9 | out/pair-poolC.txt |
| cb:shape-sh25-9-12 | 800 (bands 2–5) | +2.1 ± 0.8 | −0.1 ± 0.6 | 26.8% / 36.9 | out/pair-poolC.txt |
| cb:shape-sh33-9-12 | 600 (bands 3–5) | +1.7 ± 1.0 | −1.0 ± 0.7 | 26.0% / 36.5 | out/pair-poolD.txt |
| sh20 / sh25 / sh40-life; sh33-from5; sh33-1-8; forgive-one-in-three | 200 (band 2) | −2.5 to +3.5 (all within 1.3 s.e.) | −4.0 to +2.5 | ≤ 29.0% / 38.3 | out/pair-band2.txt |

**Judgement against PG10 and PG2.**
- Not over the cap. The largest pooled seal is 27.0% against a cap of 36.0.
- No ratio breach: 162/250 = 0.65 [m: out/pair-poolB.txt].
- PG2 is untouched, since these are not last-day acts.
- So it is **not a PG10 break**.

**What it means.**
- The honest policy is not the best way to play. A player who keeps forgiveness near one slip in three beats it by about 3 points.
- Most of that is available late: refusing forgiveness on days 9–11 against a habit of forgiving gives +2.0 ± 0.8 (2.5 s.e.).
- That is a real late-act hole, small and well under PG10. The 'habit' replay does not see it, because it only looks at day 12. REPLAY 'season' removes it.

### 3.4 The breaker's late peace on the reader (M1)

[m: out/pair-poolA.txt, out/pair-poolB.txt]

| Scheme against x-reader (same seeds) | Seeds | Habit | Season |
|---|---|---|---|
| peace-on11 | 600 | +0.0 | +0.0 |
| peace-on10-11 | 600 | +1.0 | +0.5 |
| peace-on9-11 | 1000 | +1.3 | +0.6 |

The breaker measured +11.3 ± 4.0 for peace-on11 on the old cast. With the poacher cast and the peacemaker as honest, it is gone or small [argued: the reader now makes its one offer to a poacher who takes peace].

### 3.5 Honest players with the store

Policies that keep the house more often than honest all have lower marks, and none of them seals more:
- pm1-sf: 50.6% kept, mark +8.1, seal 17.0%;
- prec-gen-2: 50.6% kept, seal 17.0%;
- the selfish acts: kept 54–56%, seal 0–4.5%.

[m: out/gates-combined.txt]

## 4. Honest play punished

Honest Lives that are kept with a clear mark but lose the seal. Rounds 1–3, 600 seeds, 148 such Lives [m: out/withheld-honest-out.txt, out/withheld-honest-b2-out.txt, out/withheld-honest-b3-out.txt].

| Rule | Withheld | What the honest policy did |
|---|---|---|
| 'habit' | 4 of 148 (2.7%) | **Day 12, its own rule against its tally habit.** It refused a slip in SHORTED where the habit said forgive (seeds 2004180, 2004200, 2010183: the 'won' clause, delta −3.0 to −16.7). Or it forgave where the habit said refuse (2002073: the 'cost' clause, delta +4.6 ± 1.6) |
| 'season' | 11 of 148 (7.4%) | the four above, plus 7 more from days 9–11. Late forgiveness or refusal in SHORTED that differs from the day-8 habit. And **seed 2010125: peace offered on days 9, 11 and 12 in its first quarrel of the Life**. The day-8 habit was the custom's "fish across" (never met), so the replay quarrels, delta −19.5 |

Over 1000 seeds the honest seal is 24.1% under 'habit' and 22.4% under 'season'. That is 17 seals lost, none gained [m: out/pair-poolA.txt].

The page never says why a seal is missing (LEAD 1). A player could not see either case coming. Under 'season', a player who learns the place's lesson (offer peace) in the last season is the one who loses.

## 5. REPLAY 'season'

Preset override `{ REPLAY: 'season' }`, REPLAY_FROM 9 (the default).

**Gates under it** (same fresh seeds; rest gates re-run under the override) [m: out/gates-combined.txt, out/rest-season-2000001.txt, out/pg14-quiet-out.txt, out/pg14-late-out.txt]:

| Gate | Season | Pass |
|---|---|---|
| PG1, PG3, PG4, PG6, PG7, PG8, PG9, PG13 | identical to 'habit' (45.8%; 90.8%; 100%; 88.3%; 98.3%; 100%; 4; need 172..284). These gates do not read the seal [argued], and they measured identical | ✓ |
| PG2 | honest 21.0%; selfish 3.0 / 0.0 / 2.5%. Band 2: 23.5 against 4.0 / 1.5 / 3.5 [m: out/pair-band2.txt] | ✓ |
| PG5 | 1,016,497 shared draws, 0 differ | ✓ |
| PG10 | highest other honest+kin-always 21.5% (cap 31.5); largest s/k (≥ 20 kept) [0,1,0.5,1,1] 16/30 = 0.53; every attack scheme under the cap (largest cb:shape-sh33-life 24.5%) | ✓ |
| PG11 | same trades; honest seal 21.0% (22.4% over 1000 seeds) | ✓ |
| PG12 | (a) #49, the same seal-grid ranking; (b) 0.69; (c) the same | ✓ |
| PG14 | quiet 1.11 s max (1.12 s at load 6); user CPU 6.20 s for 6 verdicts | ✓ |

**Holes.**

| Late act | Habit d | Season d | Closed? |
|---|---|---|---|
| Late SHORTED shaping (cb:shape-sh33-9-11, 1000 seeds) | +2.0 ± 0.8 | −0.8 ± 0.5 | yes |
| cb:shape-sh25-9-12 (800 seeds) | +2.1 ± 0.8 | −0.1 ± 0.6 | yes |
| Whole-Life shaping (cb:shape-sh33-life, 600 seeds) | +3.0 ± 1.4 | +1.2 ± 1.3 | partly |
| Peace on day 11 for the reader (the brief's case) | +0.0 | +0.0 | no hole left to close |
| peace-on9-11 for the reader | +1.3 | +0.6 | partly |

**Costs.**
- **Honest:** −1.7 points (17 of 241 honest seals in 1000 seeds). That includes the peacemaker's own late peace offers (§4).
- **Mixed habits pay more.** The fixed way [1,1,0.5,1,1] falls from 23.5% to 18.5% on the seal band, because its coin-flip late acts differ from its day-8 habit [m: out/gates-combined.txt].
- **Human play is mixed too** [argued].

**Recommendation: do not adopt it in the Banks.**
- Both of the lead's conditions hold: every gate passes, and it closes a hole that is real here.
- But the hole is small (+2 points, a sixth of what PG10 allows). The cure takes almost as much from honest players (−1.7 points).
- It also lands on the behaviour the place teaches when it is learned late.
- If the lead weighs the seal-integrity principle above that cost, adopting it is safe. It is a data change, and no gate fails.

## 6. Page facts

All 99,999 seeds of my range, 2000001–2099999 (one short of 100,000; the brief's range holds 99,999). Lives only, the shipped Banks [m: out/facts-1..4.txt, out/facts-sum-out.txt, out/needtail-out.txt].

| Fact | Value |
|---|---|
| Need whole | 99,999 of 99,999 |
| Need above zero | 99,999 of 99,999 (lowest 156, seed 2092466) |
| **Need ≤ 300** | **99,998 of 99,999. Seed 2050732 has need 301**: the custom earns 300 there, and the floor "custom's purse + 1" sets the need. Need > 280 in 41 seeds, > 290 in 1 |
| Custom's purse | 25..300 |
| always: store at the end | **29 (seed 2087339) .. 318 (seed 2038511)**; during the Life −8 .. 318; kept 30.7% |
| never: store at the end | **13 (seed 2034082) .. 197 (seed 2020003)**; during the Life 0 .. 197; kept 0.0% |
| honest: store at the end | **73 (seed 2038007) .. 304 (seed 2081919)**; during the Life −8 .. 304; kept 44.4% |
| Stores, payoffs, levels | all whole; bank levels always within 1..9 |

**For the page.**
- Draw stores from −8 to at least 320.
- Do not assume need ≤ 300.

**Argued.**
- The pegged formula reaches 301 only when the custom earns 314 or more.
- The floor makes the need 301 when the custom earns 300. It can go higher still if the custom ever earns more than 300. The custom earns at most 7 baskets a tie-day, so about 336 in twelve days.

If the page needs a hard 300, this is a preset or engine call for the lead, such as a cap on the need. The confirmation round should not settle it.

## 7. Files

| What | Script → output |
|---|---|
| Setup and checks | `cb-common.js`; `cb-equiv.js` → `out/equiv-out.txt`; copies in `src/` (fx-policies, fx-battery, policies, preset.json, tune-policies, bk-schemes; unedited) |
| Gates | `cb-run-gates.sh`: `cb-battery.js` → `out/gb-*.txt`, `cb-rest.js` → `out/rest-habit-2000001.txt`, `out/rest-season-2000001.txt`; `cb-combine.js` → `out/gates-combined.txt` (both rules, battery tables, round-1 attack tables) |
| PG14 | `cb-pg14.js` → `out/pg14-quiet-out.txt`, `out/pg14-late-out.txt` |
| Attack | `cb-schemes.js` (93 schemes; rounds 2–3 appended), `cb-attack.js`; `cb-run-attack.sh` → `out/atk-*.txt`; `cb-run-band2.sh`, `cb-run-band3.sh`, `cb-run-band45.sh` → `out/b2-*`, `out/b3-*`, `out/b4-*`, `out/b5-*`; `cb-pair.js` → `out/pair-band2.txt`, `out/pair-band3.txt`, `out/pair-poolA..E.txt` |
| Honest punished | `cb-withheld.js` → `out/withheld-honest-out.txt`, `-b2-`, `-b3-` |
| Habits explored | `cb-explore.js` → `out/explore-out.txt`; `cb-tally.js` → `out/tally-out.txt` |
| Page facts | `cb-facts.js` → `out/facts-1..4.txt`; `cb-facts-sum.js` → `out/facts-sum-out.txt`; `cb-needtail.js` → `out/needtail-out.txt` |

Nothing outside this folder was edited.
