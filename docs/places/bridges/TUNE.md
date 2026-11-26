> **Record of its time.** Written 2026-11-25 11:24 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Bridges [bridges]: tuning report

All numbers are labelled. **[m: file]** means measured by this folder's script that wrote that file. **[argued]** means reasoned, not run. Every tuning run used seeds below 100000. The final gates ran on fresh bands from 300001 up, which no tuning run touched.

## 0. Verdict

- **Pick:** version (ii), the prover's. That is S −2, H 2, with two pushers among the three near carters. It is exactly the `PLACES.bridges` preset already in `e1/engine-places.js`. No dial moved [m: final-gates.txt, line 1].
- **Honest policy:** take-turns, written as a function. It is the seat's rule and placelab's placeholder: identical choices in 500 of 500 Lives [m: same-as-placeholder-out.txt].
- **Selfish act:** "cross while you can".
- **Final gates at the shipped counts, on fresh seeds:** 13 of 14 pass [m: final-gates.txt].
- **The one failure, PG10, is in its ratio part only.** It fails because of two road-serving forms of turn-taking that I added to the battery as place schemes:
  - turns-after-jams: seal/kept 1.00;
  - the prover's road way `[1,0,0,1,0.5]` ("half a turn after locked wheels"): 0.92.
- **With placelab's own 19-policy battery, PG10 passes in the same run** [m: final-gates.txt, last lines]. So with that battery, all 14 gates pass.
- **No dial brings the road's way clearly under 0.8 while PG6 and PG11 keep a margin** (section 3).
  - The best corner is HOLD_LINE 0.40, with or without R_AFTER 1.5. There the road ways sit at 0.71–0.78, PG6 at 61.7%, and the trade at 10.1–10.3 against the 10 needed.
  - Going further breaks PG6 or the trade.
  - So the question is what PG10 should count, not a setting.

## 1. Settings (preset.json) and why

`B 3, C 1, S −2, H 2, FLOW_KIND 'one', HOLD_LINE 0.5, FOUNDERS { near: ['taker','taker',['firm','wary','steady']], far: ['firm','firm','firm','soft','wary','steady'] }, STORE_START 40, NEED_PIVOT −38, NEED_WEIGHT 0.5, MARGIN 24, REPLAY 'habit', RANGE_WAYS = the seat's thirteen`. CUSTOM stays at the default, the valley's `[1,1,0,1,0]`.

What each setting does in play:
- **Stakes.** Both wait: 0. You give way and they cross: −1. They give way and you cross: +3. Wheels lock: −2.
- **What counts as the road moving.** Tie-days on which exactly one cart crossed. The road "moves" in a future when the late share of such days is at least half.

Why (ii), with turn-taking as the honest policy. All rows below use the same honest policy, selfish act and battery subset. Kept is over 2000 Lives (seeds 2001–4000). Verdicts are over 40 seeds (5001–5040) at 2000/1000 futures. The need is re-centred so that take-turns keeps about half [m: versions-out-0..5.txt, versions.js]:

| Version | honest kept / mark / seal / seal÷kept | What breaks |
|---|---|---|
| (i) seat: H 3, valley founders | 49.4 / +33.8 / 50.0 / **0.91** | PG11: seal 50 > 40. PG10 ratio: honest 0.91, strict turns 0.86, turns-after-jams 0.95. |
| (ii) prover: H 2, two pushers (preset) | 49.4 / +12.9 / 27.5 / 0.65 | Nothing on this band. The road ways are 0.76 and 0.57 here. |
| H 2, valley founders | 51.2 / +27.2 / 47.5 / 0.86 | PG11 seal > 40; PG10 ratio (honest and three schemes) |
| H 3, two pushers | 48.9 / +21.4 / 27.5 / 0.69 | PG13: need −11..42, so need ≤ 0. Always-give-way keeps 54.7% and push-the-polite 78.9%. Road ways 0.86 / 0.89. |
| H 2, one pusher + (pusher or soft) | 50.7 / +21.8 / 50.0 / 0.83 | PG11 seal > 40; PG10 ratio (five policies) |
| H 3, one pusher + (pusher or soft) | 50.9 / +29.1 / 50.0 / 0.87 | PG11 seal > 40; PG10 ratio (five policies) |

Checking what the reviewers said:
- **The seat's recipe.** I measured honest seal÷kept at 0.91. The reviewer's figure was 96%.
- **"Two pushers on H 3 make always-give-way keep 50 to 61%."** Confirmed: 54.7% [m: versions-out-3.txt]. It is 66.9% when the need is tuned for strict turns [m: explore2-out-1.txt].
- **The prover's G6.** With take-turns it passes: PG6 99.2% on the final band [m: final-gates.txt] and 91.7% on tuning seeds [m: ex5-0.5.txt].

Why take-turns (with its memory) is the honest form rather than strict turns `[1,0,0,1,1]`:
- **Strict turns has too little seal for PG10's cap.** On (ii) its seal is 20.0, so the cap is 30.0. Take-turns-with-memory (32.5) and turns-after-jams (35.0) would both exceed it [m: ex3-strict-2-two.txt].
- **Strict turns' mark is thin** (+7.1).
- **Turns-after-jams as honest fails the ratio itself** (0.84) [m: ex3-jams-2-two.txt].

## 2. The gates: final run

Settings: the preset. Policies: honest take-turns, selfish "cross while you can". Counts: the full shipped counts. Battery: 27 policies, which is placelab's 16, its 3 Bridges schemes and the 8 in policies.js. Fresh seed bands from 300001. Run time 698 s [m: final-gates.txt, final-gates.js].

| Gate | Measured | Pass |
|---|---|---|
| PG1 honest keeps 35–65 | take-turns kept 50.7% of 2000 Lives | ✓ |
| PG2 last days | seal: honest 32.5%; selfish on the last 1 / 2 / 3 days 7.5 / 7.5 / 10.0% | ✓ |
| PG3 spread | the 13 ways carried are ≥ 25 apart in 95.0% of 120 seeds (median 53.5) | ✓ |
| PG4 no trivial way | best of 243 not flat in 100% of 12 seeds (best on average `[0,0,0,1,0.5]`) | ✓ |
| PG5 determinism | 0 of 2 reruns differ; 16 flips, 784,575 shared draws, 0 differ | ✓ |
| PG6 a habit matters | ≥ 5 points in 99.2% of 120 seeds (median 10.5) | ✓ |
| PG7 not a lottery | custom baseline inside 15..85 in 80.8% (median 30.5) | ✓ |
| PG8 mirror | custom, forgiving and honest all show it in 100% of 120 seeds | ✓ |
| PG9 situations | median 5 met twice (min 4) | ✓ |
| **PG10 no recipe** | No policy is over the cap: the highest is turns-after-jams at 35.0 against a cap of 48.8. **But two exceed seal/kept 0.8: turns-after-jams 1.00 (35.0 of 35.0) and `[1,0,0,1,0.5]` 0.92 (30.0 of 32.5).** With the lab's 19-policy battery, from the same run: PASS. | **✗** |
| PG11 a trade | Four trades: honest+selfish2 60.0% / +6.7; honest+selfish3 66.5% / +1.1; cross while you can, last season 65.5% / −1.8; turns-yield-to-pushers 48.9% / −9.4. Honest is 50.7% / +16.9, seal 32.5. | ✓ |
| PG12 not the valley | (a) the valley's best `[1,1,0.5,1,0]` ranks #89; (b) ρ 0.22; (c) BOTH store −2.1 against the valley's +3.3, and SHORTED mark −3.6 against +1.2 | ✓ |
| PG13 page sanity | need 9..48 over 27 policies × 2000 Lives, all whole | ✓ |
| PG14 cost | 0.83 / 0.95 / 0.96 s | ✓ |

Close calls on the final band, all under 0.8 [m: final-gates.txt]:
- honest's own seal/kept: 0.76;
- strict turns: 0.79;
- `[1,0.5,0,1,1]`: 0.78.

On other 40-seed bands, honest's ratio ran 0.45–0.75 [m: ex4-0.5-*.txt, versions-out-1.txt].

## 3. PG10: why the ratio part cannot pass with the road's way counted

**The mechanism [argued from the rows].** Turn-taking that also takes turns after locked wheels gives the heir a habit of about 0.5 after a jam, and that habit unlocks the road in the futures. Its mark is nearly always clear: 75–100% clear across settings. Against the two pushers it locks wheels more often, so its yard is short more often (kept 33–41%). When it does keep the house, the seal follows.

**Band to band** at the preset [m: ex3-memory-2-two.txt, ex4-0.5-6001/7001/8001.txt, versions-out-1.txt, final-gates.txt]:
- turns-after-jams: 0.75, 0.92, 0.86, 1.00, 0.76, 1.00;
- `[1,0,0,1,0.5]`: 0.67, 0.91, 0.83, 1.00, 0.57, 0.92.

**The dial search.** Honest is take-turns throughout. Each row lists both road ways as turns-after-jams / `[1,0,0,1,0.5]`. Samples are 40-seed bands, 80 seeds or 150 seeds, all tuning seeds at 2000/1000. PG6 is from a 60-seed tuning check. The trade column is honest mark − honest+selfish3 mark, and PG11 needs ≥ 10.

| Setting | Road ways seal/kept | PG6 | Trade | Source |
|---|---|---|---|---|
| preset (HOLD_LINE 0.5) | 0.75–1.00 / 0.57–1.00 by band | 91.7% | 14.9 | ex3/ex4/versions/final, ex5-0.5, ex7-50 |
| HOLD_LINE 0.6 | 1.00 / 1.00 (PG7 38.3% ✗) | – | 12.5 | ex6-10 |
| HOLD_LINE 0.45 | 0.69–0.86 / 0.58–0.91 by band | 80.0% | 13.3 | ex3-memory-2-two-hl45, ex4-0.45-*, ex5-0.45, ex7-45 |
| HOLD_LINE 0.45 + R_AFTER 1.5 | 0.78 / 0.84 (150 seeds) | – | 12.5 | ex8-A |
| HOLD_LINE 0.42 (+ R_AFTER 1.5) | 0.78 / 0.88 (0.76 / 0.82) | – | 11.2 | ex8-B, ex8-A2 |
| HOLD_LINE 0.40 | 0.71 / 0.71 (80 seeds) | – | 10.3 | ex6-1 |
| HOLD_LINE 0.40 + R_AFTER 1.5 | 0.73 / 0.78 (150 seeds) | **61.7%** | 10.1 | ex8-D, ex10-D, ex11-D |
| HOLD_LINE 0.38 + R_AFTER 1.75 | 0.71 / 0.71 | **51.7% ✗** | 9.3 ✗ | ex10-E1, ex11-E1 |
| HOLD_LINE 0.40 + R_AFTER 2 | 0.67 / 0.71 | **56.7% ✗** | 10.1 | ex10-E2, ex11-E2 |
| HOLD_LINE 0.35 (R_AFTER 1 / 1.5) | 0.68 / 0.62 ; 0.67 / 0.65 | **45.0% ✗** (R 1.5) | 7.2 / 7.8 ✗ | ex6-2, ex10-E3, ex11-E3 |
| R_AFTER 2 | 0.79 / 0.67 | – | 13.3 | ex6-7 |
| K 1 / K 0.25 | 1.00 / 1.00 ; 0.88 / 0.86 | – | – | ex6-3, ex6-4 |
| FOG 0.03 / 0.06 | 0.97 / 0.83 ; 0.90 / 0.77 | – | – | ex6-5, ex6-6 |
| MUT 0.1 | 0.96 / 0.95 | – | – | ex6-8 |
| CUSTOM `[1,1,0,1,1]` (HOLD_LINE 0.45–0.6) | 0.87–0.96 / 0.83–0.90 | – | 12.8–15.6 | ex9-C1* |
| valley founders, or one pusher + (pusher or soft) | 0.90–0.96 / 0.75–1.00 | – | – | versions-out-0,2,4,5 |

R_AFTER 2 also drops the honest seal to 16.3%. That makes the cap 26.3, and turns-after-jams at 27.5 is over it [m: ex6-7.txt].

Every setting that brings the road ways under about 0.7 also compresses every mark, and then PG6 or the trade fails with it.

**A higher seal threshold** (an engine change, not built) is no cure either [argued, from measured rows, whatif-sealmark.js]. Taking markSE ≈ 1.25 and asking for a mark 12 clear:
- the road ways reach 0.51–0.69 only where PG6 is already marginal (HOLD_LINE 0.40–0.45 with R_AFTER 1.5);
- they stay at 0.80–0.82 with the polite custom;
- at the preset it was not estimated, for want of 150-seed rows at HOLD_LINE 0.5.

**What the design lead can decide:**
- (a) Count only exploits as "schemes" for the ratio. Then PG10 passes [m: final-gates.txt].
- (b) Let a sacrifice policy past the ratio. A sacrifice here means kept at least 10 points under honest with a mark above honest's. On the final band the road way is 36.3% kept against 50.7%, with a mark of +28.2 against +16.9.
- (c) Accept the road's way as a policy that is sealed whenever it keeps the house. Its seal rate (30–35%) is near honest's (32.5%) and under the cap.

## 4. What moved from the starting settings

- **From (ii) as E1 set it: nothing.** The preset is identical [m: final-gates.txt line 1].
- **From the prover's own Narrow Bridge,** E1 had already added three things: STORE_START 40, the seat's thirteen ways, and REPLAY 'habit' in place of the prover's end-game lab rule.
- **From (i), the seat's version:**
  - H 3 → 2;
  - the valley's near seats (taker, soft, one of three) → two pushers and one of firm/wary/steady;
  - REPLAY_SITS [3] → REPLAY 'habit';
  - need re-centred, from 15/0.5/36 or −25/0.5/35 → −38/0.5/24.

Tuning changed only the policies, not the place:
- the honest policy is now a function;
- the selfish act is "cross while you can" instead of placelab's store-best, which is the same rule with the threshold at one half instead of one quarter;
- eight place schemes were added to the battery.

## 5. Honest policy, selfish act, and the last day under REPLAY 'habit'

**Honest policy (one sentence).** Let a carter you have not met go first; after one of you crossed, the other goes next; if your wheels locked, give way; if you both waited, go, unless your wheels have locked with that carter before, and then wait.

**Selfish act ("cross while you can")**, on the last 1, 2 or 3 days:
- drive on wherever the other carter looks likely to give way (they did so at least a quarter of the time in that spot), above all when it was their turn;
- give way wherever they look likely to drive on, even on your own turn.

It is the store's best reply with no tomorrow. Through the heir it writes "push the polite, give way to the pushy" into the house's ways.

**The last day under REPLAY 'habit'** [m: lastday-out.txt, 40 tuning seeds at 2000/1000; final rates from final-gates.txt]:
- **Cross while you can on day 12.** A replay exists in 40 of 40 Lives. 87 acts were reversed:
  - "after they crossed, gave way → drove on": 70;
  - after both waited: 13;
  - after locked wheels: 4.
  
  The replay is better for the road by +5.6 points on average. The seal was withheld for cost in 32 Lives and for bought in 3; it was earned in 1 of 40. On the final band: seal 7.5% against honest 32.5%, cost 75%, bought 10%.
- **Driving on when it was their turn (the brief's act).**
  - *Done only where they look likely to give way twice running:* it never fires. No near carter gives way twice running (two pushers; firm, wary and steady all take their turn). Its rows equal honest's on both bands [m: lastday-out.txt, final-gates.txt].
  - *Done regardless:* it locks wheels with a carter who takes his turn, so the store is lower as lived (24.5 against 25.8 in the replay). R2 reverses it ("after you crossed, drove on → gave way", 7 Lives) and withholds the seal for cost in 7 Lives. Seal 10/40 against honest 11/40 on tuning seeds, and 22.5% against 32.5% on the final band. In the example, seed 5001: drove on at Corra against a habit of 11 of 11; the replay is better by 10.1 ± 1.3 points; seal withheld.
  - So R2 handles it: it never buys the seal.
- **Honest's own acts against habit.** Take-turns' per-carter memory sometimes gives way after both waited, against the pooled habit. Its replay row appears in 4 of 40 tuning Lives, with a mean delta of −5.0. It withheld one seal ("won", 1 of 40) [m: lastday-out.txt]. On the final band: last-day entries 2.5%, no clause fired [m: final-gates.txt].

## 6. The lesson as it plays

The lesson is that the polite and the pushy both jam the road, and taking turns moves it. Two of your three near carters never give way.

Final band; kept over 2000 Lives, the rest over 40 seeds at 2000/1000 [m: final-gates.txt]:

| Play | kept | mark | seal |
|---|---|---|---|
| always give way (the polite) | 4.8% | −17.8 | 0 |
| push-the-polite (the pushy) | 43.0% | −13.9 | 5.0% |
| never give way | 0.0% | −13.8 | 0 |
| the valley's careful | 0.1% | −6.7 | 0 |
| **take turns (honest)** | **50.7%** | **+16.9** | **32.5%** |
| strict turns (after both waited, always go) | 50.9% | +9.5 | 27.5% |
| take turns at the jams too (the road's way, `[1,0,0,1,0.5]`) | 36.3% | +28.2 | 30.0% |
| give way to a carter who never does | 48.9% | −9.4 | 0 |
| take turns, then cross while you can for the last 3 days | 66.5% | +1.1 | 10.0% |
| take turns, then cross while you can for the last season | 65.5% | −1.8 | 7.5% |

How the trades read in play:
- **The yard against the road.** Crossing while you can in the last days buys about 16 points of kept and costs about 16 points of road. The seal is withheld.
- **Yielding to the pusher** saves loads but teaches your heir to yield to anyone, which costs 26 points of road.
- **Taking turns at the jams too** serves the road best and costs the yard.

The day-3 pulls show how the place differs from the valley [m: final-gates.txt, PG12]:
- Giving way again after you both waited costs the store (−2.1); in the valley, sending after both helped pays (+3.3).
- Giving way again after they crossed costs the road (−3.6); in the valley it helps (+1.2).

## 7. What the page must show for this place

- **Stakes card.** Four outcomes:
  - "You both waited. Nobody crossed. 0."
  - "You gave way. They crossed. −1."
  - "They gave way. You crossed. +3."
  - "Both carts came on. The wheels locked. −2."
  
  Payoffs are whole. No level and no gauge (no STOCK).
- **The yard.**
  - It starts at 40 loads (STORE_START) and usually falls: honest ends at a median of 26 against a median need of 26.
  - The need runs 9..48 over 27 policies × 2000 Lives [m: final-gates.txt PG13]. It is never at or below zero.
  - An honest yard never goes below zero [m: yard-out.txt].
  - Two cases do: the old way's yard is below zero at the end in 39.5% of Lives, and never-give-way's in 99.2% [m: yard-out.txt]. So the need sentence ("the old way would bring in {oldWayPurse}") must word a negative yard. The meter must also draw a negative floor for pushers.
- **Daily count** beside the day total: at how many bridges you crossed, they crossed, both waited, or the wheels locked.
- **The balking mule (FOG 0.04).** "Your mule would not stand, and your cart came on. They saw only that you came on."
- **Mark sentence.** "With you, the road kept moving in N of 2000 futures; had your house kept the old way, in M."
- **The Afterwards strip.**
  - It draws `seasons[k].flow`, the share of meetings at which exactly one cart crossed, with the line at 0.5 and the good side up (CHARTER 'holds').
  - The strip's rule must say "one cart crossed while the other waited", not "hands".
- **The last-day line under 'habit'.** Take the verb from each changed tie's `lived` / `replayed`: "you gave way" or "you drove on". The act may be a give-way, for example giving way to a pusher on your own turn.
- **Range.** The place's own thirteen ways (`range.of` 13). Never name them.

## 8. Words (the place's everyday words)

- **The two choices:** **Give way** / **Drive on**.
- **The custom (the old way of the road):** "Let a carter you have not met cross first, and after that do as they did the day before."
- **The five situations:**
  1. A carter you have not met
  2. After you both waited
  3. After they crossed while you waited
  4. After you crossed while they waited
  5. After your wheels locked
- **Afterword:** "Wherever one lane has to serve two directions (a single-track bridge, a mountain road with passing places, a ford, one well, one radio channel), people get through by taking turns, and the way works only while everyone knows whose turn it is. Waiting for ever and pushing for ever look like opposite habits, but on a narrow way both stop everyone, and they stop it worst when everyone shares the same one."

## 9. Risks

1. **PG10 ratio** (section 3). The road's way is sealed in 57–100% of the Lives it keeps, depending on the 40-seed band. Close to the line on the final band: honest's own ratio 0.76, strict turns 0.79, `[1,0.5,0,1,1]` 0.78. A different band could put one of these over 0.8 [m: final-gates.txt; ex4-*].
2. **Honest acts replayed.** Take-turns remembers locks per carter, but the house's ways count by situation. So R2 sometimes replays an honest day-12 act, and once in 40 tuning Lives withheld the seal ("won") [m: lastday-out.txt].
3. **The brief's last-day act has no target here.**
   - "Drive on in their turn" pays only against a carter who gives way twice running, and no near carter does.
   - The store-serving last-day act in this place is the other half: give way to a pusher on your own turn. R2 catches it (cost 75% on the final band).
   - The Chronicle's last-day line will mostly read "you gave way …", not "you drove on …".
4. **Negative yards.** The old way's yard is negative in 39.5% of Lives [m: yard-out.txt]. This touches the need sentence and saved Lives.
5. **PG7 margin.** The custom's baseline has a median of 26–31 and a minimum of 0. The share inside 15..85 was:
   - 80.8% on the final band [m: final-gates.txt];
   - 73.3% on E1's band [e1/gates-full-bridges-out.txt, not re-run here];
   - 75.8% on tuning seeds [m: ex5-0.5.txt].
6. **A harsh Life.**
   - Two pushers near: always-give-way keeps 4.8%, the old way 0% (by the need rule) and careful 0.1%.
   - The yard runs on a few loads: honest median end 26 against a need of 26.
   - Marks are large partly because the old way locks wheels for ever with a pusher [argued: CUSTOM NEITHER 0, and a lock never breaks by the mule].
7. **The honest seal near the top of the band.** It is 32.5% on the final band and 22.5–37.5% across tuning bands [m: ex4-*, versions-out-1.txt]. PG11 allows 10–40.

## 10. Engine changes

None. The preset uses only dials in `e1/engine-places.js`. The engine was not copied or edited.

## 11. Files (all in this folder)

**Deliverables:** `policies.js` (honest, selfish 1/2/3, eight schemes), `preset.json`, `final-gates.js` → `final-gates.txt`.

**Evidence:**
- `versions.js` → `versions-out-0..5.txt`
- `lastday.js` → `lastday-out.txt`
- `yard.js` → `yard-out.txt`
- `same-as-placeholder.js` → `same-as-placeholder-out.txt`
- `explore6.js` → `ex6-*.txt`, `ex6b-*.txt`
- `explore7.js` → `ex7-*.txt`
- `explore8.js` + `pool8.js` → `ex8-*.txt`
- `explore9.js` → `ex9-*.txt`
- `explore10.js` → `ex10-*.txt`
- `explore11.js` → `ex11-*.txt`
- `explore5.js` → `ex5-*.txt`
- `whatif-sealmark.js` (argued estimate from measured rows)
- `common.js` (shared setup)

**Earlier runs:** `explore1.js`, `explore2.js`, `explore3.js` and `explore4.js` ran against an earlier `policies.js` in which honest was strict turns, and `explore1` also used an earlier selfish act. Their outputs (`explore1-out-*`, `explore2-out-*`, `ex3-*`, `ex4-*`) are measured for the policy each file names on its CONFIG/VERSION line. `explore1.js`, `explore2.js` and `probe-selfish.js` will not re-run unchanged: they use names the current `policies.js` no longer has.
