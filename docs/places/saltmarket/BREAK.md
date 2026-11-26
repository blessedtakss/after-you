> **Record of its time.** Written 2026-11-25 13:05 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Saltmarket [saltmarket]: break report

Place attacked: `tune-saltmarket/preset.json` put into `AfterYou.PLACES.saltmarket` (exactly as the tuner's `final.js` does), on `e1/engine-places.js` and `e1/placelab.js`, unedited. Honest policy, selfish act and battery: the tuner's, loaded unchanged from `tune-saltmarket/policies.js`. Nothing outside this folder was edited. Setup: `bs-common.js`.

Labels: **[m: file]** = measured by a script in this folder that wrote that file. **[argued]** = reasoned, not run. Counts are the shipped ones (2000 headline futures, 1000 for the last-day replay) unless a line says otherwise. Every seed behind a reported number is 51001 or above (one smoke test used 50121) (the tuner used 1..3000, 10001..10040, 20001..20040, 30001..30120, 40001..40120, 50001..50120 (mirror only), 60001..60040, 70001..70040, 80001.., 90001.., placelab's 100001..190003 and 500001..500300); the need scan used 200001..1,200,000.

## 0. Verdict: broken

1. **A recipe exists: stage a precedent (§2.1).** A plain seller that, on day 9 or 10, cuts once against its softest stall *when it has never yet had to choose after its own price slipped*, and plays day 12 by habit, earns the seal over the PG10 cap on **6 of 11 fresh 40-seed bands**. Pooled over 440 fresh seeds it is sealed in **37.7%** of Lives against honest's **23.9%** (cap 35.8). Its seal/kept is **0.83 to 0.92 on every seed set** (PG10's ratio part fails on 9 of 11 bands). R2 sees none of it: the staged act is on day 9 or 10, and day 12 is played by habit, so there is nothing to replay.
2. **PG10 (ratio part) fails on fresh seeds with the tuner's own battery (§2.2).** The gate run on my fresh bands prints FAIL: `[1,1,0,0,0]` is sealed in 2 of the 2 Lives it keeps (1.00). On 2 more fresh bands the honest policy itself crosses 0.8 (10/12 = 0.83; 9/11 = 0.82), and honest+selfish2 once (11/13 = 0.85). 3 of 13 fresh 40-seed bands fail (counting only the battery policies I ran on each band).
3. **The honest policy is not the best honest play (§2.3).** A simpler seller written straight from the cards (hold; cut after your own price slipped or you cut and theirs held; cut a stall that has cut you 3 days running) keeps more and seals more than the tuner's honest, and exceeds the PG10 cap on 2 of 5 bands by itself. So the cap is anchored on a weak honest. Redefining honest does not rescue the place: with the recipe as honest, PG11 (seal 10..40) and PG10's ratio fail for honest itself (§2.1, last paragraph).

The place is not the valley with new nouns (§3), and the old recipe (hold all Life, cut on day 12) stays closed. The other schemes I tried (§2.4) do not beat honest.

The recipe has a measured fix (§4): R2's *won* clause read over the last season (days 9 to 12, the days after the sister last learned from you) instead of day 12 alone. Lab-side, on 120 seeds, it brings the recipe from 40.8% to 22.5% (exactly its base without the staged cut) and honest from 24.2% to 23.3%. It needs an engine change (REPLAY 'season'), described in §4; no engine was edited here.


## 1. Every gate re-run on fresh seeds

**Main run** [m: gates-fresh-out.txt, gates-fresh.js]: placelab's `gates()` at the full scale (shipped counts) with the tuner's honest, selfish act and 19-policy battery. Bands: lives 51001–53000, seal 53001–53040, grid 54001–54012, spread 54101–54220, g6 54301–54420, mirror 54501–54620, pull 54701–54740, sealGrid 54801–54812, det 54901–54902, speed 54951–54953.

**Extra seal bands** [m: mb-*.txt, mb2-*.txt, mbg-*.txt from multiband.js; tabulated by pg10-bands.js → pg10-bands-out.txt]: 200 seeds 61001–61200 and 200 seeds 67001–67200 (five bands of 40 each), kept over 2000 Lives 62001–64000 and 68001–70000; plus 60001–60040 (screen.js) and 66001–66040 (findable.js).

| Gate | Tuner (fresh band 100001..) | Mine (fresh) | Result |
|---|---|---|---|
| PG1 honest keeps 35–65 | 41.9 | 39.6 (51001–53000); 39.7 (62001–64000); 40.6 (68001–70000); 37.7 (58001–60000); 40.0 (64001–66000) | holds |
| PG2 last days | 22.5 / 25.0 / 25.0 vs 27.5 | 25.0 / 30.0 / 30.0 vs 35.0 (gate band); by band on 61001–61200: 1 day 20 / 15 / 22.5 / 15 / 20 vs honest 25 / 17.5 / 30 / 17.5 / 25; 2 days +2.5 at most; 3 days +2.5 at most | holds (6 of 6 bands) |
| PG3 spread | 99.2% | 100.0% (median 46.3) | holds |
| PG4 no trivial way | 91.7% | 100.0% (best on average [0,0,0.5,0,1]) | holds |
| PG5 determinism | 0 differ | 0 differ of 898,399 shared draws, 16 flips | holds |
| PG6 a habit matters | 96.7% | 90.8% (median 15.7) | holds |
| PG7 not a lottery | 91.7% | 95.0% (median 50.0) | holds |
| PG8 mirror | 100% | 100% | holds |
| PG9 situations | 5 (min 3) | 5 (min 3) | holds |
| **PG10 no recipe** | pass | **FAIL in the gate run**: `[1,1,0,0,0]` seal/kept 1.00 (2 of 2 kept Lives sealed). Cap part passes for the battery (highest honest+selfish2 30.0 vs cap 52.5). Ratio part fails on 3 of 13 fresh bands with the battery alone (§2.2); the recipe fails both parts (§2.1) | **broken** |
| PG11 a trade, honest seal 10–40 | 27.5 | 35.0 (gate band); 12.5 (60001–40), 27.5 (66001–40), 25.0 / 17.5 / 30.0 / 17.5 / 25.0 (61001–61200), 22.5 / 17.5 / 22.5 / 25.0 / 25.0 (67001–67200): 13 fresh bands. Trade: careful 69.3% / −10.8 against honest 39.6% / +16.3 | holds (13 of 13; lowest 12.5, 2.5 above the floor) |
| PG12 not the valley | (a) #17 at shipped counts, (b) −0.95 | (a) #17 in the gate run (12 seeds 200/200); **#32 of 243 at the shipped counts** (40 seeds 55001–55040, seal 0.0%) [m: sgrid-merge-out.txt]; (b) ρ −0.93; (c) BOTH mark −6.8 vs +1.2, SHORTED mark −2.9 vs +1.2, OWING mark −17.4 vs +13.5, NEITHER store +3.8 vs −0.7 | holds |
| PG13 page sanity | need 87..169 | 86..169 over 19 policies × 2000 Lives; **need 78..180 on 1,000,000 seeds 200001–1200000, all whole, none outside (0, 300]** [m: needscan-out.txt] | holds |
| PG14 cost | 0.94–0.97 s alone | 1.46 / 1.26 / 1.30 s in the gate run at a machine load of 30–130 (other jobs) | holds, thin margin under load |

The gate run's top of the lived seal grid at the shipped counts on 55001–55040 [m: sgrid-merge-out.txt]: `[1,1,1,0,1]` 22.5% (kept 52.5), `[1,1,1,0,0.5]` 20.0, `[1,1,1,0,0]` 20.0, `[0.5,1,1,0,1]` 10.0; the valley's top four rank #32, #40, #31, #42 with 0.0%. No fixed way with at least 4 kept Lives has seal/kept above 0.8.

R1 spot check [m: valley-id-out.txt]: the shipped engine.js (md5 6090c8f6…, same as e1/engine-shipped.js) against engine-places.js with this preset in PLACES.saltmarket, valley Lives on seeds 58001–58010, careful and a 0.7 coin, with and without the key 'valley', every today/playDay/verdict JSON at the default counts: 1000 comparisons, 0 differ. engine-places.js md5 69c48ff7… as claimed.

## 2. Breaks

### 2.1 Recipe: stage a precedent (blocking)

**The policy** (`plain + patience 3 + maker d9 + habit12` in bs-plain.js; everything it reads is on the page):
1. Hold the price, except:
2. after your price slipped or you cut, and theirs held ("After you cut and they held"): cut;
3. against a stall that has cut you 3 days running: cut until it holds again;
4. **on day 9, if you have never yet been in "after you cut and they held", cut once against the stall you are holding with that has most often held after being cut on (the softest)**. From day 10 rule 2 does the rest;
5. on day 12, in every tie, do what your habit there says (sent h of n with h/n ≥ 0.5 means hold; never met means the guild's rule).

**Why it works** [m: waysens-out.txt, why-maker-out.txt]:
- The Saltmarket's town mark is almost one lever: the heir's habit "after you cut and they held". Carried by heir and kin in the custom's end state (40 seeds × 1000 futures): `[1,1,0,1,0]` +0.1, `[1,1,1,1,1]` −11.8, `[1,1,1,0,1]` +12.7, `[1,1,1,0,0]` +25.8, `[1,1,0,0,0]` +25.0, but `[1,1,0,0.5,0]` +5.0 and `[1,1,1,0.33,0]` +4.6.
- A situation never met leaves the heir (and the sister) on the guild's rule, which there is "put the price back" (1). Honest's tallies over 400 Lives: that situation is never met in 67 of 400; honest keeps 143, and 41 of those have it unmet.
- On 61001–61200, honest keeps 22 Lives with it unmet and seals **0** of them. The staged cut fires in 67 Lives (unmet by day 8); of those the recipe keeps 35 and seals **33**.
- The cut costs about 3 coins against a soft stall (3 instead of 4 per day while it keeps holding). The sister learns "never put it back" only at the day-12 looking-round, so she never turns it against you during the Life.
- R2 replays only day-12 acts against habit. With rule 5 there is none (season replays 0.0% in every habit12 row). Without rule 5 the recipe still earns 40.0% on 61001–61200: R2 withholds almost nothing (bought 0.5, cost 5.5, won 0.5%).

**Numbers** (shipped counts) [m: pg10-bands-out.txt from mb-ppmaker.txt, mb2-ppmaker.txt, mbg-ppmaker.txt, mb-honest.txt, mb2-honest.txt]:

| Seeds | Recipe seal | Honest seal | Cap | Over the cap | Recipe seal/kept |
|---|---|---|---|---|---|
| 61001–61200 (5 bands) | 42.5 (27.5 / 42.5 / 52.5 / 40.0 / 50.0) | 23.0 (25.0 / 17.5 / 30.0 / 17.5 / 25.0) | 34.5 pooled | 4 of 5 bands, and pooled | 85/93 = 0.91; > 0.8 on 5 of 5 |
| 67001–67200 (5 bands) | 31.0 (37.5 / 35.0 / 27.5 / 35.0 / 20.0) | 22.5 (22.5 / 17.5 / 22.5 / 25.0 / 25.0) | 33.8 pooled | 2 of 5 bands | 62/75 = 0.83; > 0.8 on 3 of 5 |
| 53001–53040 (gate band) | 47.5 | 35.0 | 52.5 | 0 of 1 | 19/22 = 0.86 |
| **all 440** | **37.7** (166) | **23.9** (105) | **35.8** | **6 of 11** | **0.87** |

Kept over 2000 Lives: recipe 39.0% (62001–64000), 41.1% (68001–70000), 40.3% (51001–53000); honest 39.7, 40.6, 39.6. The recipe keeps the house as often as honest and is sealed far more often.

Relatives on 61001–61200 (same table form, pg10-bands-out.txt): cut on day 10 instead: 44.5%, over the cap on 4 of 5, seal/kept 0.92; day 8: 38.5%, 4 of 5, 0.89; day 6: 30.0%, 1 of 5 (the sister learns it at the day-8 round and quarrels cost the store); day 11: 33.5%, 2 of 5 (day 12 by habit keeps the guild's rule, so the precedent is never written); the tuner's honest with the staged cut (owing-maker d9 soft+habit12): 31.0%, at the cap on 2 bands and over it on none, seal/kept 0.86 (> 0.8 on 5 of 5).

**What if the lead adopts the recipe as honest?** [m: gates-recipe-as-honest-out.txt, same fresh bands as §1] With honest = the recipe: PG1 40.3% passes; PG2 passes (47.5% against 25.0 / 30.0 / 25.0%); **PG10 fails** (honest's own seal/kept 0.86, `[1,1,0,0,0]` 1.00); **PG11 fails** (honest seal 47.5% > 40). So the place cannot be rescued by moving the honest policy up to the recipe.

### 2.2 PG10's ratio part fails with the tuner's own battery (blocking as written)

[m: gates-fresh-out.txt; pg10-bands-out.txt]
- Gate band 53001–53040: `[1,1,0,0,0]` kept in 2 of 40, sealed in both: 1.00. `gates()` prints FAIL. (Over 240 seeds it is kept 3 times and sealed twice.)
- 61001–61040: honest 10 of 12 kept Lives sealed (0.83); honest+selfish2 11 of 13 (0.85).
- 67081–67120: honest 9 of 11 (0.82).
- Pooled, honest is 0.58 (46/79, 61001–61200) and 0.65 (45/69, 67001–67200), and 0.78 on the gate band. With 11 to 22 kept Lives per 40-seed band, sampling alone carries it over 0.8 on 2 of 11 bands; a grudge kept in 1–3 Lives of 40 is all-or-nothing.
- The tuner saw the grudge half of this on a tuning band (TUNE.md §2, out-FINchk-30001.txt). It is not one unlucky band: 3 of 13 fresh bands fail. Bands and policies run: 53001 all 19; 61001–61200 honest, honest+selfish1/2/3, one-strike, `[1,1,0,0,0]`, careful+grab, forgiving; 60001 honest and honest+selfish1; 66001 and 67001–67200 honest only.

### 2.3 The honest policy is not the best honest play (minor on its own; it sets the cap)

[m: findable-out.txt (64001–66000 / 66001–66040), mb-pp*.txt (61001–61200)]

| Policy (all written from the cards) | Kept (2000 Lives) | Seal 66001–66040 | Seal 61001–61200 | Same choices as honest |
|---|---|---|---|---|
| tuner's honest (careful + cut in "after you cut and they held") | 40.0 / 39.7 | 27.5 | 23.0 | — |
| plain: cut in "after you cut and they held", else hold (= fixed `[1,1,1,0,1]`) | 32.3 | 25.0 | — | 0 of 300 |
| plain + patience 3 | 45.1 / 44.8 | 32.5 | **29.5** (over the cap on 2 of 5) | 0 of 300 |
| plain + patience 3 + no opening to a stall that never held and cuts newcomers | 36.8 | 30.0 | — | 207 of 300 |
| plain + patience 3 + day 12 by habit | 44.7 | — | 32.0 (over on 2 of 5) | — |

- The honest seller is findable: its core rule ("never be the one to put the price back") is one line on a card, and the plain seller with careful's no-opening rule plays exactly as honest in 207 of 300 Lives.
- But careful's extra valley rules (do not open to a stall never seen to hold; cut back once against a stall seen not to return) cost about 5 points of kept here, and a plainer seller beats honest on both kept and seal. PG10's cap is anchored on the weaker policy.
- Fix: take `plain + patience 3` as the honest policy (PG1 44.8%, seal 29.5% pooled). That alone does not clear §2.1 (the recipe is still over the new cap on 2 of 5 bands, and its seal/kept stays 0.91).

### 2.4 Schemes that did not break it [m: screen-*.txt, screen-sf-*.txt (lives 58001–60000, seal 60001–60040; honest 12.5% there, cap 22.5), mb-*.txt]

| Scheme | Kept | Mark | Seal | Note |
|---|---|---|---|---|
| sister played differently: honest but careful with her / always hold with her / careful but honest only with her | 47.5 / 47.3 / 56.5 | +4.6 / +4.4 / +0.4 | 10.0 / 10.0 / 5.0 | holding after your own slip anywhere breaks the one lever |
| milk soft stalls: honest + cut the softest every day from day 4 | 12.0 | +26.3 | 7.5 | a cut never pays more than a hold here |
| soft stalls cut once per break | 41.0 | +15.5 | 15.0 | small gain; adds holds to the lever |
| kingmaker: hold with takers from day 9 / all Life | 31.9 / 35.4 | +15.9 / +11.6 | 12.5 / 12.5 | one house reconsiders per round |
| betray on the looking-round days 4 and 8 | 1.9 | +28.8 | 0.0 | quarrels ruin the store |
| store first (careful until the store covers the need, then cut; a cut never lowers the store) | 69.4–70.2 | −7.2 to −9.4 | 2.5 | the need is met too late (day 11–12) to matter |
| against habit on days 9–11: honest + selfish days 9–11 only | 40.2 | +16.4 | 12.5 | = honest |
| cut on day 11 (all / non-kin / kin) + day 12 by habit | 11.6 / 19.4 / 27.3 | +23.3 / +22.2 / +18.9 | 15.0 / 15.0 / 17.5 | non-kin on 200 seeds: 14.0% vs 23.0, seal/kept 0.60 |
| cut on days 10–11 + habit | 4.9 | +27.9 | 10.0 | |
| poison "after both held" against the softest (days 3; 3,6; 9,10; 5,8,11) | 4.3–13.6 | +25.9 to +27.6 | 5.0–12.5 | seal/kept 0.71–1.00 at tiny kept |
| store-best act on the last 1/2/3 days (also cuts where they are expected to cut) | 38.0–38.6 | +17.3 to +18.2 | 15.0 / 17.5 / 17.5 | serves store and town alike; not a selfish act |
| early virtue (honest d1–8, careful d9–11) / late virtue (careful d1–8, honest d9–12), both + habit | 40.7 / 65.8 | +9.3 / −3.7 | 12.5 / 7.5 | |
| patience 1 / 2 (seller) | 6.2 / 29.6 | +23.7 / +19.0 | 5.0 / 12.5 | |
| R2 neutralised alone: honest + day 12 by habit | 36.9 / 39.1 | +17.4 / +17.2 | 17.5 / 23.5 (200 seeds) | +0.5 to +5; R2 then never replays anything |

The old recipe stays closed on the gate band [m: gates-fresh-out.txt]: careful+grab (cut on day 12) 0.0% seal (won 12.5%), careful+grab2 7.5% (won 65.0%), careful+grab3 5.0%; honest+grab1/2/3 25.0 / 17.5 / 5.0% against honest's 35.0%.

## 3. Claims confirmed

- Not the valley with new nouns: the store side is a coordination game (a cut never earns more than a hold: +3 against +4, or 0 against −1); the valley's good neighbour (careful) keeps 69.3% here with a mark of −10.8 and no seal; the valley's best fixed way is #32 of 243 with 0.0% seal at the shipped counts; ρ −0.93. The town mark is close to the valley's mark turned over, as designed.
- The need rule re-tunes to the tuner's values on fresh seeds: placelab's tuneNeed for honest at 42% on 70001–72000 gives pivot 103, margin 17 (preset 104 / 17) [m: fogfix-004.txt].
- honestPolicy = seller(3,'careful','cut','careful'), and my re-implementation plays identically (0 of 300 Lives differ, 57501–57800) [m: eqre-out.txt].
- The gates the tuner claims, other than PG10, pass on fresh seeds (§1), PG12(a) also at the shipped counts.
- R3/PG13 hold on a million seeds.
- R1: 0 differences in the spot check (§1); the e1 identity result is not re-run in full.
- PG14 depends on machine load, not on the place [m: cost-out.txt]: re-timed at load 55–60 (about 25 other jsc jobs on 12 cores) a full verdict takes 1.83–2.12 s for honest Lives and 1.80–2.18 s for recipe Lives; the gate run at load 30–130 gave 1.26–1.46 s; the tuner's 0.94–0.97 s was at load about 17. Not a place break; the gate needs an idle machine to be read.

## 4. Fixes, with what was measured

**For §2.1 (the recipe): R2's won clause over the last season.** [m: season-check.js → sc2-*.txt; 120 seeds 61001–61120; lab-side, no engine edited]
- Rule: replay days 9..12 with the house playing, on every tie, its habit as it stood before day 9 (h/n ≥ 0.5 over the deeds of days 1..8 means hold; never met means the custom); days 1..8 as lived; keyed draws, so nothing else moves. Run the same 1000 futures from both. Withhold the seal if the mark is clear but mark + delta − 2 se < 5 (R2's won clause with the season in place of day 12). Keep bought and cost on day 12 as now.
- Why days 9..12: they are the days after the sister last learned from you (day-8 looking-round). A precedent written there reaches the heir and the sister but is never tested in the Life.

| Policy | Seal now (engine) | With the season won clause | seal/kept after |
|---|---|---|---|
| tuner's honest | 24.2 | 23.3 | 0.58 |
| honest + selfish 1 / 2 / 3 days | 19.2 / 23.3 / 21.7 | 19.2 / 21.7 / 20.8 | 0.48 / 0.53 / 0.49 (PG2 still holds) |
| plain + patience 3 + habit12 (the recipe without the staged cut) | 30.8 | 22.5 (bands 3 / 13 / 11) | 0.46 |
| **recipe, staged cut day 9** | **40.8** | **22.5 (bands 3 / 13 / 11: identical to its base)** | 0.50 |
| recipe, day 10 | 44.2 | 22.5 | 0.47 |
| recipe, day 8 | 38.3 | 24.2 | 0.57 |
| recipe, day 7 (precedent written on day 8, before the window) | 28.3 | 25.8 | **0.82** |
| tuner's honest + staged cut day 9 | 31.7 | 24.2 | 0.66 |

- The staged cut then adds nothing. One residual: staging on day 7 survives (25.8 against 22.5 for its base, seal/kept 0.82), at a price in the store (kept 31.7% of these seeds against 49.2%), because the sister learns the habit at the day-8 round. Opening the window at day 8 (habit before day 8) would catch it [argued; not run].
- Applying all three clauses over the season (bought and cost too) is too blunt: it cuts honest from 24.2 to 15.8 (bought 7, cost 5) [m: sc2-a.txt].
- Engine change needed (not made here): REPLAY 'season'. In playDay, when REPLAY is 'season' and the day is 9, keep `life.season = { before: cloneLife(life), sent: [] }` and push each day's choices from day 9 to 12. A `replaySeason(life)` plays days 9..12 from that snapshot with the habit before day 9 on every tie. verdictJob adds one more run of m futures. verdictStep computes the won clause from its delta. The valley never takes the path (REPLAY 'valley'), so its objects stay the same; identity must be re-proved with e1/identity-places.js. Cost: one more run of 1000 futures, about 4% of a full verdict (28,000 futures) [argued].
- Not a fix: more luck at the stall. With FOG 0.08 (need re-tuned) the recipe still earns 37.5% against honest's 23.8%, and the mark shrinks to +8.0. With FOG 0.12 the mark collapses to +0.7 and nothing is sealed [m: fogfix-008.txt, fogfix-012.txt; 80 seeds 74001–74080].

**For §2.3: take the plain seller as honest.** Use `plain + patience 3`, with day 12 by habit if wanted. Without the season clause it is beaten by the recipe (§2.1). With it, honest, the plain seller and the recipe all sit at 22.5–23.3% on 61001–61120.

**For §2.2: read the ratio part on enough kept Lives.** As written (40 seeds), PG10's ratio part fails on fresh bands for the tuner's own honest policy (pooled 0.58–0.65) and for any grudge that keeps 1–3 Lives. Suggested gate wording: pool at least 120 seeds and judge only policies with at least 20 kept Lives there; otherwise report the count. With the season clause, honest's pooled seal/kept is 0.58 and the recipe's 0.50 (120 seeds).

## 5. Files (all in this folder)

| File | What it is |
|---|---|
| bs-common.js | setup: engine, lab, the tuner's policies, preset.json into PLACES.saltmarket |
| bs-schemes.js, bs-combo.js, bs-storefirst.js, bs-plain.js | the schemes (the recipe is `plain + patience 3 + maker d9 + habit12` in bs-plain.js) |
| gates-fresh.js → gates-fresh-out.txt | every gate on fresh bands |
| sgrid.js, sgrid-merge.js → sgrid-0..5.txt, sgrid-merge-out.txt | PG12(a) at the shipped counts, 40 seeds |
| needscan.js → needscan-out.txt | need on 1,000,000 seeds |
| valley-id.js → valley-id-out.txt | R1 spot check |
| waysens.js → waysens-out.txt | carried marks near honest's tallies; honest's tallies |
| screen.js, screen-sf.js → screen-0..3.txt, screen-sf-0..1.txt | scheme screen |
| multiband.js → mb-*.txt, mb2-*.txt, mbg-*.txt | seal by 40-seed band, per-seed rows |
| pg10-bands.js → pg10-bands-out.txt | PG10 cap and ratio by band |
| why-maker.js → why-maker-out.txt | the mechanism |
| findable.js → findable-out.txt | the honest seller against plain sellers |
| gates-recipe-as-honest.js → gates-recipe-as-honest-out.txt | the recipe as honest |
| season-check.js → sc-*.txt, sc2-*.txt | the fix, lab-side |
| fogfix.js → fogfix-*.txt | FOG as a fix (rejected) |
| cost.js → cost-out.txt | PG14 re-timed |
| eqre.js → eqre-out.txt | re-implemented honest = tuner's honest |
