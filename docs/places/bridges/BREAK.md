> **Record of its time.** Written 2026-11-25 11:53 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Bridges [bridges]: break report

Place attacked: the preset `PLACES.bridges` in `e1/engine-places.js`, identical to `tune-bridges/preset.json`. Policies: the tuner's honest policy (take-turns), selfish act ("cross while you can") and 27-policy battery, all loaded unchanged from `tune-bridges/policies.js` and `tune-bridges/common.js`. Nothing outside this folder was edited.

Labels: **[m: file]** means measured by a script in this folder that wrote that file. **[argued]** means reasoned, not run. Every seed I used is 50001 or above, plus one need scan over seeds 1 to 1,000,000. The tuner used 1–9120, 20001–25001 and 300001 up. Counts are the shipped ones (2000 headline futures, 1000 for the replay) unless a line says otherwise.

## 0. Verdict: broken

Four gates fail on seeds the tuner never used.

- **PG10, ratio part: fails on all 10 fresh 40-seed bands.** The road's ways are sealed in 86–100% of the Lives they keep. My new place schemes also fail it, and two of them fail even the tuner's own fallback (b), the sacrifice exemption.
- **PG10, cap part: fails on 2 of 10 bands.** turns-after-jams earns the seal in 42.5% against a cap of 41.3, and in 55.0% against 52.5. Over all 400 fresh seeds, the road's way is sealed more often than honest (42.3% against 36.5%) while keeping the house less often (42.4% against 53.0%).
- **PG11, honest seal ≤ 40: fails on 2 of 10 bands** (55.0% and 50.0%). On one band honest's own seal/kept is 0.89, so honest breaks PG10's ratio too.
- **R3 / PG13: the need is 0 on seed 619188** (1 seed in 1,000,000). This one has a one-line preset fix.

No recipe in the sense of an exploit was found. Last-day grabs are caught by R2, and grabs on days 9–11 are punished by the mark. Neither playing the sister differently, milking soft carters, timing the season's end nor locking the pushers beats honest. The place is not the valley with new nouns.

The honest policy has an artefact: it waits forever with polite carters. A one-clause fix gives a policy that dominates it.

## 1. Every gate re-run on fresh seeds

**Main run** [m: gates-fresh-out.txt, gates-fresh.js]. Full `gates()` at the shipped counts.

Bands:

| Purpose | Seeds |
|---|---|
| lives | 50001–52000 |
| seal | 52001–52040 |
| grid | 52101–52112 |
| spread | 52201–52320 |
| g6 | 52401–52520 |
| mirror | 52601–52720 |
| pull | 52801–52840 |
| sealGrid | 52901–52912 |
| det | 52951–52952 |
| speed | 52961–52963 |

**Extra bands for the seal-rate gates:**
- 120 seeds 66001–66120 (three bands of 40), with kept over 2000 Lives 68001–70000 [m: big-*.txt, bigx*.txt → bigbattery-sum-out.txt];
- 40 seeds 62001–62040 for the scheme screen [m: screen-all-out.txt];
- 200 seeds 74001–74200 (five bands of 40) for honest and the road's ways [m: capbands-out.txt].

| Gate | Tuner (final band) | Fresh seeds (mine) | Result |
|---|---|---|---|
| PG1 honest keeps 35–65 | 50.7 | 51.9 (50001–52000); 53.0 (68001–70000) | holds |
| PG2 last days | 7.5 / 7.5 / 10.0 vs honest 32.5 | 7.5 / 2.5 / 2.5 vs 55.0; and by band 10.0 / 7.5 / 7.5 vs 37.5, 10.0 / 5.0 / 2.5 vs 50.0, 5.0 / 7.5 / 2.5 vs 25.0 | holds (4 of 4 bands) |
| PG3 spread | 95.0% | 96.7% (median 51.0) | holds |
| PG4 no trivial way | 100% | 100% (best on average [0,0,0,1,0.5]) | holds |
| PG5 determinism | 0 differ | 0 differ of 661,673 shared draws | holds |
| PG6 a habit matters | 99.2% | 96.7% (median 10.2) | holds |
| PG7 not a lottery | 80.8% | 72.5% (median 30.3) | holds (margin 12.5) |
| PG8 mirror | 100% | 100% | holds |
| PG9 situations | 5 (min 4) | 5 (min 4) | holds |
| **PG10 no recipe** | FAIL (ratio): 1.00 / 0.92 | **FAIL: ratio on 10 of 10 bands; cap on 2 of 10** (§2.1, §2.2) | **broken** |
| **PG11 a trade, honest seal 10–40** | 32.5 | **55.0 on 52001–52040** (gates() prints FAIL); 50.0 on 66041–66080; the other 8 bands 20.0–40.0 (§2.3). The trade exists: honest+selfish3 67.8% / −0.2 against 53.0% / +14.7 | **broken on 2 of 10 bands** |
| PG12 not the valley | #89, ρ 0.22, 2 opposite pulls | (a) #127; (b) ρ −0.01; (c) four opposite pulls, e.g. BOTH store −2.4 vs +3.3 and SHORTED mark −7.8 vs +1.2 | holds |
| **PG13 page sanity** | need 9..48 | 2..48 over 27 × 2000 Lives; 7..47 on 68001–70000; **need 0 at seed 619188** in a scan of seeds 1–1,000,000 (§2.4) | **broken (rare)** |
| PG14 cost | 0.83–0.96 s | gates() printed 2.49–2.90 s under a machine load of about 70 (other jobs). Re-timed at load 27: wall 1.01–1.17 s, CPU 6.48 s for 6 verdicts [m: cost-out.txt] | holds (the FAIL line in gates-fresh-out.txt is a load artefact) |

## 2. Breaks

### 2.1 PG10 ratio: the road's ways are sealed whenever they keep the house (blocking)

**Evidence.** Seal/kept, band by band at 2000/1000 [m: gates-fresh-out.txt, screen-all-out.txt, bigbattery-sum-out.txt, capbands-out.txt]:

| Policy | 52001 | 62001 | 66001 | 66041 | 66081 | 74001 | 74041 | 74081 | 74121 | 74161 |
|---|---|---|---|---|---|---|---|---|---|---|
| turns-after-jams (tuner's scheme) | 1.00 | 1.00 | 0.86 | 0.94 | 0.88 | 1.00 | 0.89 | 0.96 | 1.00 | 0.89 |
| `[1,0,0,1,0.5]` (tuner's scheme) | 0.94 | – | 0.88 | 0.95 | 1.00 | 0.82 | 0.94 | 0.93 | 0.95 | 0.85 |
| half turns after jams, with pushers only (new) | – | 0.90 | 0.79 | 1.00 | 0.86 | 0.94 | 0.90 | 0.90 | 0.90 | 0.90 |
| honest, unstuck + half turns w/ pushers (new) | – | 0.91 | 0.75 | 0.95 | 0.81 | 0.89 | 0.90 | 0.91 | 0.95 | 0.91 |
| lock the pushers (new) | – | 0.93 | 0.85 | 1.00 | 0.75 | – | – | – | – | – |

Pooled over 120 seeds 66001–66120, these also exceed 0.8 [m: bigbattery-sum-out.txt]:

| Way | seal/kept | seal | kept |
|---|---|---|---|
| `[1,0.5,0,1,0.5]` | 0.93 | 31.7 | 34.2 |
| `[0.5,0,0,1,0.5]` | 0.89 | 32.5 | 36.7 |
| `[0,0,0,1,0.5]` | 0.85 | 28.3 | 33.3 |

**The new schemes, as a carter would play them:**
- *Half turns after jams with pushers only:* take turns. After locked wheels with a carter who never gives way after crossing, drive on and give way by turns. With anyone else, give way.
- *Unstuck:* never wait a second day running after you both waited (§2.5).
- *Lock the pushers:* after locked wheels with such a carter, drive on again.

**Why the tuner's fallback (b) does not save PG10.** Option (b), from TUNE.md §3, lets a policy past the ratio when it keeps at least 10 points less than honest and has a higher mark. Two new schemes fail the ratio without qualifying for that exemption:
- *half turns w/ pushers* keeps 46.4% against honest's 53.0, only 6.6 under;
- *unstuck + half turns* keeps 50.0%, 3.0 under.

Both have marks well above honest's (+22.3 and +23.2 against +14.7) and seal/kept 0.89 and 0.84 pooled [m: bigbattery-sum-out.txt]. Only (a), counting exploits alone, or (c), accepting the road's way, would pass.

**Measured fixes that do not work:**
- *A stricter seal mark* (SEAL_MARK 8–15, recomputed from the per-seed rows): honest's seal falls faster than the road's, because honest's marks are smaller. turns-after-jams and `[1,0,0,1,0.5]` go **over the cap** on band 66081–66120 at every threshold from 8 to 15, and their pooled ratios stay at 0.77–0.92 [m: sealmark-whatif-out.txt].
- *A higher MARGIN* (26–30): the road's ratio stays at 0.80–1.00 band by band, and honest's own ratio rises to 0.82–0.90 on band 66041–66080 [m: margin-whatif-out.txt; the seal there is an estimate that holds "bought" as recorded].

**Fix: a design call** [argued]:
- Either accept (c) and rewrite PG10 for the Bridges so that the road's way being sealed whenever it keeps the house is allowed. The cap part must change too (§2.2).
- Or re-tune toward the tuner's HOLD_LINE 0.40 + R_AFTER 1.5 corner, then re-check, with my four schemes in the battery, on at least 200 fresh seeds per rate. On tuning seeds that corner had the road ways at 0.73 / 0.78 and PG6 at 61.7% (TUNE.md §3; I did not verify it).

Neither the threshold nor the margin can carry the fix.

### 2.2 PG10 cap: the road's way out-seals honest by more than the cap on 2 bands (blocking)

**Evidence** [m: capbands-out.txt; seeds 74001–74200 at 2000/1000]:

| Band | honest seal | cap | turns-after-jams seal | Over cap? |
|---|---|---|---|---|
| 74001–74040 | 27.5 | 41.3 | **42.5** | yes |
| 74081–74120 | 35.0 | 52.5 | **55.0** | yes |
| 74121–74160 | 37.5 | 56.3 | 52.5 | no; unstuck + half turns 50.0 |
| 66081–66120 | 25.0 | 37.5 | 35.0 | no, one seed short |

Pooled over my 400 fresh seeds [m: the four files above]:
- turns-after-jams is sealed in 169 of 400 (42.3%); honest in 146 of 400 (36.5%).
- turns-after-jams keeps 42.4% of 2000 Lives; honest keeps 53.0%.
- So the way that keeps the house less often wins the seal more often.

**Mechanism** [argued from the rows]:
- turns-after-jams writes NEITHER ≈ 0.58 and BOTH 0 into the ways [m: screen-all-out.txt, ways column]. That is the best carried way, `[x,0,0,1,0.5]` (PG4 best on average `[0,0,0,1,0.5]`).
- Its mark is +26.0 ± 1.3 against honest's +14.7 ± 1.5, and the mark is clear in 92.5% of its Lives against 71.7% of honest's.
- Honest's seal is limited by its mark. The road's way is limited only by its yard.

**Fix:** the same design call as §2.1. A gate that compares seal rates to honest's on 40 seeds cannot hold here. Even pooled, the road's way is at 1.16 × honest, inside the cap, but a 40-seed band swings honest from 20.0 to 55.0. Measure PG10 on at least 200 seeds, or exempt the road's ways explicitly.

### 2.3 PG11: honest's seal rate sits on the 40% ceiling (blocking on 2 of 10 bands)

**Evidence.** Honest seal by fresh band:

| Band | Seal | Source |
|---|---|---|
| 52001–52040 | **55.0** | gates-fresh-out.txt |
| 62001–62040 | 40.0 | screen-all-out.txt |
| 66001–66040 | 37.5 | bigbattery-sum-out.txt |
| 66041–66080 | **50.0** | bigbattery-sum-out.txt |
| 66081–66120 | 25.0 | bigbattery-sum-out.txt |
| 74001–74040 | 27.5 | capbands-out.txt |
| 74041–74080 | 37.5 | capbands-out.txt |
| 74081–74120 | 35.0 | capbands-out.txt |
| 74121–74160 | 37.5 | capbands-out.txt |
| 74161–74200 | 20.0 | capbands-out.txt |

- Pooled: 146 of 400 = 36.5% (± 2.4 binomial).
- With the tuner's tuning bands (22.5–37.5) and final band (32.5), a 40-seed band lands above 40 often enough that PG11's seal part is close to a coin flip on 40 seeds [argued].
- Honest's own seal/kept is **0.89 on 74161–74200** (8 sealed of 9 kept) and 0.80 on 66041–66080. So honest is at or over PG10's ratio on 2 of 10 bands.

**Fix:**
- Measure PG11's seal rate on at least 200 seeds.
- If it must sit lower, MARGIN 27 is estimated to give honest kept 40.0% (PG1 holds) and a seal of 30.0% pooled (bands 32.5 / 37.5 / 20.0). The trade survives: honest+selfish3 keeps 54.4% with mark −0.2.
- But at MARGIN 27, honest's own ratio on 66041–66080 rises to 0.88 [m: margin-whatif-out.txt; kept exact, seal estimated]. PG10 and PG11 pull against each other here.
- That is a design call: widen PG11's band for the Bridges, or accept honest's ratio on noisy bands.

### 2.4 R3 / PG13: the need is 0 on seed 619188 (blocking by the rule, rare)

**Evidence** [m: needscan-1.txt, needscan-2.txt, need-fix-out.txt]:
- Scan of seeds 1–1,000,000: need 0 at seed **619188**, where the custom's purse is −50. The need is 1 at 11 seeds and 2 at 19.
- On seed 619188, `today().need` is 0 from day 1, and honest keeps the house with a yard of 18 "of 0".
- **Mechanism** [argued from engine-places.js `winterNeed`]: need − STORE_START = max(earned + 1, round(−38 + 0.5 (earned + 38) + 24)). This reaches 0 once the custom earns −90 or less. The custom locks both takers by day 3, and fog can lock its tie with kin, since kin runs the custom, whose NEITHER is 0.

**Fix (preset only, no engine change):** STORE_START 50.
- Store and need both move up by 10 on every seed.
- Kept differs in 0 of 2000 Lives (50.3% at both).
- The needs go from 7..46 to 17..56.
- Seed 619188 gets a need of 10 [m: need-fix-out.txt].
- It also shrinks the page's negative-yard cases, which is TUNE.md risk 4 [argued].

### 2.5 The honest policy waits forever with polite carters (minor; it changes no gate)

**Evidence** [m: deadlock-out.txt, 2000 Lives 70001–72000; trace-50007-out.txt]:
- In **39.4%** of honest Lives the house and one carter both wait three or more days running.
- In 578 of 2000 Lives that carter is the steady carter. Strict turns and the unstuck form never do this.
- The cause is the memory clause: "if you both waited, go, unless your wheels have locked with that carter before". After one lock with a carter who gives way after locks and after both waited (steady, firm, wary), both wait for the rest of the Life.
- Seed 50007: Pell (steady) and the house both wait on days 6–12, at 0 a day, and the road does not move on that bridge.

**A thoughtful carter's version dominates it.** "Honest, unstuck" adds one clause: after two days running of both waiting, go. Over 2000 Lives 68001–70000 and 120 seeds 66001–66120 [m: bigbattery-sum-out.txt]:

| | kept | mark | seal | seal/kept |
|---|---|---|---|---|
| honest | 53.0% | +14.7 | 37.5% | 0.69 |
| honest, unstuck | **57.0%** | +15.3 | 38.3% | 0.69 |
| honest, unstuck after 3 | 56.3% | +15.4 | 40.0% | – |

**Can a person find the honest rule from the cards?**
- The four turn clauses map one-to-one onto the five situation cards, so yes [argued].
- The memory clause is not suggested by the cards. "What you know of them" mixes in dealings with others, so locks with this carter must be remembered from the day log.
- The tuner chose this form over strict turns because strict turns put PG10's cap out of reach on one band (TUNE.md §1). That choice is the gate steering the honest policy.

**Fix:** adopt "honest, unstuck" as the place's honest policy [argued]. PG1 holds at 57.0, but PG11 still fails on band 66041–66080 (50.0). §2.3 stands either way.

### 2.6 R2's day-12 window can be stepped around for store at no seal cost (minor)

**Evidence.** 120 seeds 66001–66120 and 2000 Lives [m: bigbattery-sum-out.txt]:

| Policy | kept | mark | seal | last-day entries |
|---|---|---|---|---|
| honest | 53.0 | +14.7 | 37.5 | 3.3% |
| take-turns + grab-if-short days 10–11 | 56.0 | +13.9 | 38.3 | 5.0% |
| milk the polite days 9–11 | 54.5 | +14.1 | 39.2 | – |
| cross-while-you-can day 11 only | 54.5 | +13.1 | 32.5 | – |

- *Grab-if-short:* switch to the store's best reply on day 10 or 11 only when the yard looks short and the switch covers the gap.
- *Milk:* drive on where the honest act was to give way and the other carter looks likely to give way.
- None of these is over the cap or over seal/kept 0.8. Wider grabs are held down by the mark: cross-while-you-can on days 9–11 has seal 20.8, mark +2.4. So this is not a recipe.
- But R2 does not see days 10–11. A player can buy about 3 points of kept with no loss of seal.
- Milking is mark-neutral here because its acts (drive on in BOTH or NEITHER against a giver) move the ways toward the road's way [argued from the ways columns in screen-all-out.txt].

**Fix:** none needed for the gates. Note it in the design: the replay window is the last day only, as E1 open issue 7 says.

### 2.7 Smaller corrections to the tuning report (minor)

- **"Drive on in their turn, done only where they look likely to give way again, never fires."** It fires in 15 of 2000 Lives 68001–70000, and the 3-day form in 130 [m: fires-out.txt]. Its seal is 36.7 against honest's 37.5. So it is harmless, but the claim should read "rarely".
- **PG14 in my gates run printed FAIL** (2.49–2.90 s) because the machine was at load ≈ 70 from other jobs. The re-time is in §1. Gate runs should note the load.
- **The calendar rota** gives way on odd days and drives on on even days, to everyone, reading nothing. It keeps 52.9% (honest 53.0), with mark +11.9 and seal 33.3% (honest 37.5) [m: bigbattery-sum-out.txt]. The place can be played nearly as well without reading anyone. This is consistent with the lesson, and is noted only.

## 3. Recipes hunted and not found

Every row is at 2000/1000.
- "screen" rows: seeds 62001–62040, honest 40.0 seal / 52.1 kept / +17.2 mark [m: screen-all-out.txt].
- "120" rows: seeds 66001–66120, honest 37.5 seal / 53.0 kept / +14.7 mark [m: bigbattery-sum-out.txt].

| Hunt | Best form found | Seal (honest beside it) | Verdict |
|---|---|---|---|
| Milk soft carters | milk the polite days 9–11 | 39.2 vs 37.5 (120) | noise; milk all Life 0.0 (screen) |
| Betray before a season's end | cross-while-you-can on days 4 and 8 | 25.0 vs 40.0 (screen) | the mark punishes it (+10.8) |
| | before each round (3, 4, 7, 8, 11) | 7.5 (screen) | |
| Play the sister differently | always give way to her / drive on / milk her | 5.0 / 0.0 / 5.0 (screen) | far worse |
| Against habit on days 9–11, not 12 | cross-while-you-can 9–11; yield to pushers 9–11; day 11 only | 20.8 / 29.2 / 32.5 (120) | the mark punishes it |
| | grab-if-short 10–11 | 38.3 (120) | §2.6 |
| Habit-aware day-12 grab (only acts R2 cannot reverse) | best-with-habit on day 12 / days 10–12 | 40.0 vs 40.0 (screen) / 34.2 (120) | no gain: honest's day-12 acts already follow habit |
| Giving way | yield to pushers all Life | 7.5 (screen) | PG11's trade side |
| | lock the pushers | 22.5 (120) | ratio 0.87 (§2.1) |
| | strangers: drive on | 25.0 (screen) | worse |
| The road's way, improved | unstuck + half turns w/ pushers | 40.0 vs 37.5 (120); 42.0 vs 31.5 (74001–74200) | best non-exploit seal; ratio 0.84–0.91 (§2.1) |
| Last-day grabs (R2) | honest+selfish1 / 2 / 3 | 8.3 / 6.7 / 4.2 vs 37.5 (120) | R2 catches them: cost 83%, bought 12% |
| Seal grid, 243 fixed ways (64001–64040 at 500/300) | `[1,0,0,1,0.5]` | 42.5 (ratio 0.89) | the road's way again; nothing flat in the top 12 [m: sealgrid-screen-out.txt] |

**The valley with new nouns? No.**
- The valley's careful keeps 0.1% here, and its best fixed way ranks #127 of 243 by seal.
- The marks' rank agreement with the valley is −0.01.
- Four day-3 pulls have the opposite sign to the valley's [m: gates-fresh-out.txt].
- The stakes order is 3 > 0 > −1 > −2 (drive on against a giver > both wait > give way to a pusher > lock). That is the order of the game of chicken, not the valley's [argued from B, C, S, H].

## 4. Claims confirmed

- **PG1–PG9, PG12, PG14 and PG13's range** hold on fresh seeds (table in §1).
- **PG2 holds on 4 of 4 fresh bands.** R2 withholds the seal from "cross while you can" on the last day for cost in 83% of Lives (120 seeds).
- **A trade exists (PG11's first part):** honest+selfish3 and cross-while-you-can for the last season keep 67.8% and 67.3%, against honest's 53.0%, with marks −0.2 and −1.6 against +14.7 [m: bigbattery-sum-out.txt].
- **The tuner's PG10 ratio failure:** turns-after-jams and `[1,0,0,1,0.5]` are over 0.8 on every fresh band (§2.1).
- **Placelab's own 19-policy battery passes PG10** on the gates band [m: gates-fresh-out.txt, last lines].
- **Day-3 pulls opposite to the valley:** BOTH store −2.4 vs +3.3 and SHORTED mark −7.8 vs +1.2 [m: gates-fresh-out.txt].
- **Stores, payoffs and needs are whole,** and the need is at most 65 over 10^6 seeds (needscan-*.txt).
- **Determinism with the dials on:** 0 shared draws differ.
- **No engine change was needed** for any of this. The one fix proposed for a rule (STORE_START 50) is a preset value.

## 5. Files (all in this folder)

**Setup:**
- `bb-common.js`: loads the tuner's common.js and adds helpers.
- `bb-schemes.js`: 52 breaker schemes as policy(view) functions. Each reads only what the page shows.

**Runs:**

| Script | Output | What it is |
|---|---|---|
| `gates-fresh.js` | `gates-fresh-out.txt` | all 14 gates, full counts, fresh bands |
| `screen.js` | `screen-*.txt` → `screen-all-out.txt` | schemes on 62001–62040 |
| `bigbattery.js`, `-x.js`, `-x2.js`, `-x3.js` | `big-*.txt`, `bigx*.txt` | 46 policies on 120 seeds + 2000 Lives |
| `bigbattery-sum.js` | `bigbattery-sum-out.txt` | the pooled summary of those runs |
| `capbands.js` | `capband-*.txt` | honest and the road's ways on 74001–74200 |
| `capbands-sum.js` | `capbands-out.txt` | band-by-band cap and ratio |
| `sealgrid.js` | `sealgrid-s-*.txt` → `sealgrid-screen-out.txt` | the 243 fixed ways |
| `sealmark-whatif.js` | `sealmark-whatif-out.txt` | stricter seal marks |
| `margin-whatif.js` | `margin-whatif-out.txt` | higher margins |
| `deadlock.js` | `deadlock-out.txt` | both-wait runs |
| `trace.js` | `trace-50007-out.txt` | one Life traced |
| `needscan.js` | `needscan-1.txt`, `needscan-2.txt` | the need over 10^6 seeds |
| `need-fix.js` | `need-fix-out.txt` | the need-0 seed and the STORE_START fix |
| `fires.js` | `fires-out.txt` | how often the brief's act fires |
| `cost.js` | `cost-out.txt` | PG14 re-timed |
