> **Record of its time.** Written 2026-11-25 08:55 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Four new Places: the theorist's proposal

Folder: `<scratch>/places/propose-theorist/`. Nothing in the game folder was touched.

## 0. How to read this

Every number is labelled.

- **[measured]** I ran it on the prototype lab (`engine-proto.js` through `lab.js`, plus my helpers in `tlab.js`). The script and its unedited output sit side by side in this folder (`confirm-*.js` → `confirm-*-out.txt`, and so on). Unless I say otherwise: kept% comes from 2000 seeds with no futures; the sweep tables come from 60 seeds × 200 futures, so a mean mark carries about 1.5 points of standard error; grids are 243 ways × 10 seeds × 60 futures, which is indicative only; "carried" rows are 20 seeds × 150 futures with heir and kin both carrying the way (the valley's G3/G4 method).
- **[derived]** Worked out by hand from the stakes, or from measured pulls. No new run.
- **[theory]** A published result I rely on but did not reproduce in the lab.
- **Seal rates are lower bounds.** The lab counts 150–200 futures, so markSE is about 2.5–3 and a mark has to reach about +10 to be "clear". The real verdict uses 2000 futures (markSE about 1), so the same Life clears at about +7. Every seal% below would be higher in the shipped game.
- **"careful"** is the valley harness's competent honest policy. It is not tuned to any place. The Bridge also gets a policy of its own, `courteous` (in `tlab.js`).
- Every place re-centres the need with `Lab.tuneNeed`, so that its honest way keeps the house in about 50% of 2000 Lives.

One code change was needed for the Shoal's charter. `engine-theorist.js` is `engine-proto.js` plus `FLOW_KIND: 'stock'`: a season's flow is the mean level of the 16 ties at the season's end divided by `STOCK.start`. That is 4 lines. Against the proto on the existing flow kinds it gave identical holds on 9 projections (`t-stock-identity.js`, `t-proto-identity.js`). The full identity suite was not run on it.

## 1. Why these four: one map of the dilemma's family

The valley is the prisoner's dilemma: greed, meaning T − R (3 − 2 = 1), and fear, meaning P − S (0 − (−1) = 1). The two classic relatives each remove one of these. Two structural twists then change who pays and who counts.

| Place | Stage game per tie (R, T, S, P) | Greed T−R | Fear P−S | What it adds | Lesson family |
|---|---|---|---|---|---|
| Valley | 2, 3, −1, 0 | +1 | +1 | known end | PD; the last-day trade |
| **Shoal** | 3L−1, 3L, −1, 0, with L moving | +1 | +1 | a stock on each tie | dynamic commons, hysteresis |
| **Salt Road** | 2, 3, −1, 0 | +1 | +1 | the Mark counts outsiders | collusion; noise and the endgame read from outside |
| **Narrow Bridge** | 2, 3, −1, −2 | +1 | −1 (no fear) | collisions | chicken / hawk–dove; costly punishment |
| **Watchtowers** | 4, 3, −2, 0 | −1 (no greed) | +2 | fearful neighbours | stag hunt / assurance; reassurance |

The four also cover what the user was told:

- **Fishing grounds and shared pastures:** the Shoal.
- **Trade routes:** the Salt Road.
- **Arms races:** the Watchtowers. If the Watchtowers are cut, the Bridge takes this skin; see section 4.
- **Twists on cost:** C 2 in the Watchtowers, collisions in the Bridge, a cost that moves with the ground in the Shoal.
- **Noise:** in the Salt Road, doubt is the town's friend.
- **Who watches whom:** in the Salt Road the people who score you are outside the deal; in the Shoal the ground keeps the score.

## 2. The four Places, ranked

### Rank 1. The Shoal (fishing grounds; also shared pastures)

- **Real-world domain:** fisheries (atlas 16), common grazing, groundwater. Gordon 1954 (open-access rent); Levhari & Mirman 1980 ("the great fish war"); Ostrom 1990; shallow-lake hysteresis (Mäler, Xepapadeas & de Zeeuw 2003).
- **Pitch:** "Every quarrel is paid for by the ground you both fish."
- **Dials moved:**
  - **D6:** `STOCK: { start: 1, min: 0.25, max: 1.25, delta: [-0.25, 0, +0.125] }`. Each tie has a ground level L. A hand is worth 3 × L (the level before today's change). After the day, L falls 1/4 if both fished hard, stays put if one rested, and rises 1/8 if both rested.
  - **Charter:** `FLOW_KIND: 'stock'` (new), `HOLD_LINE: 0.9`. The shore holds if, over the last ten seasons, the grounds keep at least nine tenths of their first richness.
  - **Need:** `NEED_PIVOT 72, MARGIN 10` (NEED_WEIGHT 0.5) [measured].
  - Everything else is the valley's.
- **Custom of the place:** `[1,1,0,1,0]`. "Rest your nets the first day you share a ground; after that, fish as they fished yesterday." These are the valley's numbers. Here they matter because this custom can never end a quarrel.
- **The two choices:** **Rest your nets** (a hand; costs you 1, worth 3 × the ground to the other boat) / **Fish hard**.
- **Stakes per day at ground level L:** both rest +(3L − 1); you rest alone −1; they rest alone +3L; both fish hard 0.
- **What the Mark measures:** futures in which the grounds hold (mean level ≥ 0.9 over the last ten seasons) with your ways, minus the same with the old way.
- **Hidden lesson, as a result a theorist would sign:**

  In a commons with a stock, a quarrel's cost falls on the shared stock, not on the house being punished. Answering a hard day with a hard day lowers what every later catch is worth to both sides. So the habit that matters most is the one that ends quarrels (rest after both fished hard), not the one that punishes.

  Once a ground is thin enough that resting together pays less than taking together that day (3L − 1 < 0, so L < C/B = 1/3), plain reciprocity cannot restart it. Someone must rest at a loss (hysteresis).

  The numbers that make it true [derived]:
  - The floor 0.25 sits below 1/3: 3 × 0.25 − 1 = −0.25.
  - One day of both fishing hard (−1/4) costs two days of resting together (+1/8 each).
  - Climbing from the floor back to 1.0 takes six days of both resting.
- **How best play differs from the valley [measured]:**

| | Valley | Shoal |
|---|---|---|
| Ending quarrels: `[1,1,0,1,1]` vs the custom `[1,1,0,1,0]`, carried | 43.3 vs 47.2 (**−3.9**) | 66.2 vs 51.0 (**+15.2**) |
| `[1,1,0.5,1,1]` vs `[1,1,0.5,1,0]`, carried | 50.0 vs 56.9 (**−6.9**) | 75.9 vs 60.9 (**+15.0**) |
| Five best ways by mark (grid) | all have truce 0: `[0,1,1,1,0]` +13.7, `[0,1,0.5,1,0]`, `[0.5,1,0.5,1,0]`, `[0.5,1,1,1,0]`, `[1,1,0.5,1,0]` | all reopen (truce 0.5–1): `[0.5,1,0.5,1,1]` +30.5, `[0.5,1,0.5,1,0.5]`, `[0,1,0.5,1,0.5]`, `[0,1,0.5,1,1]`, `[1,1,0.5,1,1]` |
| The valley's best way by mark, `[0,1,1,1,0]`, lived | +15.1 | +16.5, behind `[1,1,0.5,1,1]` at +25.4 (seal 15%) |
| A best way by store in the valley, `[0,1,0,0,1]` (guarded greeting) | 36.7% kept (30 seeds), store 60.1 | **0.1%** kept (2000 seeds), store 51.0 against a need of 83.3: a guarded first day thins every tie by 1/4 |
| Grim (never deals again after a lapse) | mark −17.0 | mark −13.5, and 50.8% of its four ties end the Life at the floor (always: 0%, mean level 1.18) |
| Staying home against all four on day 3, custom way | +4.0 that day, −18.0 later | +4.0 that day, **−26.4** later |

- **The valley's trade survives [measured]:**
  - careful keeps the house in 51.8% of 2000 Lives (40.0% of 60), with mark +12.9 and seal 10%.
  - careful+grab keeps it in 77.8% (70.0%), with mark +5.5. In 23.3% of Lives the house was kept only by the grab; seal 3.3%, all in Lives the grab did not decide.
  - Staying home on day 12 still gains 3.8.
- **Engine changes, by dial:**
  - **D6:** in the proto as is (9 patches listed in the ENGINE-MAP).
  - **Charter:** `'stock'`, 4 lines, built and spot-checked here.
  - **For the page:** per-season tie levels in `runFuture().seasons` (about 3 lines; not built) and kin's tie levels in `kinWith` (not in the proto).
  - **Need:** re-centre to pivot 72, margin 10.
  - **Stores:** stay exact in eighths.
- **Page changes (PAGE-MAP 3.2 d, its estimate):** a gauge in each card's head (the tightest day has 15 px to spare at 1280×800) and on the sheet's crossings and mid-ties; the Opening states "worth 3 × the ground"; a clause in each reveal for the ground's change; the Afterwards strip reads levels, not hands; the Chronicle's "held" sentence; an afterword. About 10 strings, 90–120 app lines, 15 of style and 25 of check.
- **Risks:**
  - The page work is the largest of the four.
  - "Rest your nets" is a restraint dressed as a hand (PAGE-MAP risk 2).
  - Stock-aware play cannot be carried by five numbers: the heir never sees the ground.
  - always is strong by mark (+11.6) though not best.
  - The new charter code needs the identity gate.
- **Gates it should pass** (measured values in brackets):
  - G1: careful keeps 35–65% [51.8 ✓]; careful+grab is at least 12 points above [77.8 ✓].
  - G2: the grab costs the mark [−7.4 ✓].
  - G3: spread of 25 points in at least 80% of seeds [100% ✓].
  - G4: the grid's best is flat in at most 20% of seeds [0% ✓, 10 seeds].
  - G5: determinism [stock covered by proto checks 1, 6, 7].
  - G6: at least 60% [80% ✓].
  - G7: baseline inside 15..85 in at least 60% of seeds [93.3% ✓].
  - G8: at least 85% [100% ✓].
  - G9: median at least 4 [5 ✓].
  - G10, X1, X2: as in the valley.
  - **New, S1 (ending quarrels pays):** the carried gap `[1,1,0,1,1]` − `[1,1,0,1,0]` is at least +8 in the Shoal and at most 0 in the valley [+15.2 / −3.9 ✓].
  - **New, S2 (the ground pays):** grim's mark is at most −8 [−13.5 ✓].
  - **New, S3:** a valley Life through the extended engine stays byte-identical (identity hashes with the `'stock'` code present) [not run].

### Rank 2. The Salt Road (a trade route's price ring)

- **Real-world domain:** price-fixing among sellers (atlas 8 duopoly fares, 10 leniency programmes, 12 oil quotas); merchant guilds; caravan markets. Friedman 1971 (folk theorem); Stigler 1964 (secret price cuts); Green & Porter 1984 (price wars from noise).
- **Pitch:** "The traders who trust each other most cost the town the most."
- **Dials moved:**
  - **D3:** charter inverted. Mark = (ring holds with the old way) − (ring holds with your ways). "Holds" is the valley's count: late flow at least 0.5.
  - **D4:** `CUSTOM [1,1,0,1,1]`.
  - **D2:** `FOG 0.06`, kind 'lost'.
  - **Need:** `NEED_PIVOT 53, MARGIN 8`.
  - The stakes stay the valley's (B 3, C 1), so inside the ring holding the price is a true dilemma.
- **Custom of the place:** `[1,1,0,1,1]`. "Hold the guild's price with a stall you have just met; after that, do as they did yesterday; after a day when both of you undercut, hold the price again." The guild forgives a price war.
- **The two choices:** **Hold the price** (a hand; costs you 1 in buyers you could have won, and is worth 3 to the partner stall whose buyers you leave alone) / **Undercut**.
- **What the Mark measures:** how much more often the ring breaks with your ways than with the guild's way, which is the town's gain. The seal reads "House kept, town better off".
- **Hidden lesson, as a result a theorist would sign:**
  1. A price ring is held together by exactly the habits that hold neighbours together: reciprocity, forgiveness, reopening after a quarrel. These are the folk-theorem strategies, so the valley's best habits are the town's worst.
  2. Doubt protects the town. The more often a held price cannot be seen to be held, the more often the ring breaks (Stigler; Green & Porter).
  3. Inside a ring, each seller's temptation to undercut (T − R = 1 > 0) is the town's protection, and a ring with a known end unravels from its last days.
- **The numbers that make it true [measured, 30 seeds × 150]:** the guild's own ring holds in 53.1 / 41.4 / 32.1 / 26.9 / 20.9% of futures at FOG 0.02 / 0.04 / 0.06 / 0.08 / 0.10. Over the same range careful's harm to the town shrinks from −16.5 to −7.2.
- **How best play differs from the valley [measured, 60 × 200; kept% in brackets is from 2000 seeds]:**

| Way | Kept | Town mark | Seal |
|---|---|---|---|
| valley's best by mark `[0,1,1,1,0]` | 38.3% (33.5) | **−19.3** (the worst listed) | 0 |
| careful (the valley's honest best) | 48.3% (49.0) | **−14.7** | 0 |
| careful+grab | 76.7% (72.3) | −6.8 | 0; kept only by the grab in 28.3% |
| careful+grab3 | 56.7% (54.3) | +10.9 | 30.0% |
| grim | 13.3% (14.9) | +14.5 | 6.7% |
| `[1,1,0,0,0]` (loyal while it lasts, never forgives, never reopens) | 18.3% (18.1) | +23.5 | 13.3% |
| `[0,0,1,0,1]` (presses the soft stall) | 45.0% (47.6) | +23.0 | 38.3% |
| `[1,0,1,0,0]` | 36.7% | +25.0 | 33.3% |

  The inverted grid's best by mark are `[1,0,1,0,0]` +31.7, `[1,0,0.5,0,0]` and `[1,0.5,0,0,0]` (loyalty 0–0.5). In the valley `[1,0,1,0,0]` scores −35.0 with 0% kept and `[0,0,1,0,1]` scores −31.6 with 10% kept (30 × 150).
- **Engine changes, by dial:**
  - **D3 inside `verdict()`:** not in the proto; the lab only re-reads counts. The ENGINE-MAP sites are `stepRun` 1092, `runFuture` 1131, `levelOf` 1120–1122, `headline` 1267, `verdictStep` 1219 and 1223–1227 (rank, best, worst flip), and 1250–1253 (the seal).
  - **Seal for this charter:** keep `boughtOnLastDay`; replace `lastDayCost` with its mirror; add the lab's `markBoughtOnLastDay` ("with a hand sent on day 12 to every partner, would the town's gain still be clear?").
  - The page asks for counts that already face the charter (PAGE-MAP 3.2 b).
  - **D4:** in the proto (the custom joins the range: fourteen ways).
  - **FOG:** an existing parameter.
- **Page changes:** about 20 strings, about 15 app lines and about 15 of check [PAGE-MAP estimate]. The strip's good side flips; the Chronicle's "town" sentences; the last-day sentence takes its verbs from the entry; the seal's words; an afterword.
- **Risks:**
  - **Greed earns the seal.** `[0,0,1,0,1]` keeps the house in 45% with seal 38%. That is the lesson, and players may read it as "cheating pays".
  - **A three-day break earns the seal (30%) at no store cost against careful.** That is backward induction, and true, but it is a last-days recipe. Forbidding it needs a per-place replay rule, which is not in the proto.
  - **G6 is 57%** (valley 73–80% by the same method).
  - The inverted verdict is the riskiest engine change to H4: it must be a separate path, off by default.
  - **A variant I measured and do not recommend:** a guild chest (`S` 0.5) with no soft stall near. It stops greed paying, but then every town-helping way keeps the house in 3–7% and the seal almost vanishes (at most 6.7%; `scan4-salt-out.txt`, `scan5-salt-out.txt`).
- **Gates it should pass** (measured values in brackets):
  - G1: careful keeps 35–65% [49.0 ✓].
  - G1/X2: the one-day grab buys the house but never the seal [seal 0%, bought 28.3% ✓].
  - G3 [98.3% ✓]. G4 [0% flat ✓]. G6 [57%, just short]. G7 [96.7% ✓]. G8 [100% ✓]. G9 [5 ✓].
  - G10: the best way by kept% (careful+grab) is not the best by mark, and no way has both 85% kept and +3 [✓].
  - **New, R1 (the valley's best is the town's worst):** `[0,1,1,1,0]` has a town mark of −5 or below [−19.3 ✓].
  - **New, R2 (doubt helps the town):** the baseline falls as FOG rises [✓].
  - **New, R3:** the inverted range, rank and level are mirror-true (lab: 36 Lives, 0 differ).

### Rank 3. The Narrow Bridge (a standoff)

- **Real-world domain:** right of way (one-lane bridges, merging lanes), brinkmanship (Russell 1959; Schelling 1960), the breakaway that needs someone to pull and vaccination as snowdrift games (atlas 29, 21), and animal contests (Maynard Smith & Price 1973).
- **Pitch:** "Giving way costs a little; colliding costs a lot. The bold do well until everyone is bold."
- **Dials moved:**
  - **D1:** `H 2` (B 3, C 1, S 0).
  - **D4:** `CUSTOM [1,1,0,1,1]`.
  - **Charter count:** `FLOW_KIND 'both'`.
  - **Need:** `NEED_PIVOT 44, MARGIN 6`.
- **Custom of the place:** `[1,1,0,1,1]`. "Give way to a carter you have not met; after that, do as they did yesterday; after a day you both held the road, give way." The custom has to reopen; without that, two carters keeping the custom collide forever.
- **The two choices:** **Give way** (a hand) / **Hold the road**.
- **Stakes:** both give way +2; you give way, they hold −1; you hold, they give way +3; both hold −2 (charged when neither give-way arrived, so the card never says whose it was).
- **What the Mark measures:** futures in which both carters give way on at least half the crossings over the last ten seasons, with your ways minus the old way.
- **Hidden lesson, as a result a theorist would sign:**
  1. Where giving way beats colliding (S > P) but pressing a yielder pays (T > R), there is greed without fear. The best reply is the opposite of the other's act: give way to the stubborn, press the yielder.
  2. So stubbornness pays only while it is rare. In the one-shot game the stable mix is stubborn with probability (T−R)/((T−R)+(S−P)) = 1/2 at these stakes (hawk–dove) [derived].
  3. Standing up to a stubborn house is a public good. It costs the one who stands (−2 a day instead of −1) and cuts the stubborn house's income from +3 to −2, so others stop copying it. This is costly punishment and the second-order free-rider problem (Fehr & Gächter 2002; Boyd, Gintis, Bowles & Richerson 2003) [theory].
- **How best play differs from the valley [measured, 60 × 200; kept% in brackets is from 2000 seeds]:**

| Way | Kept | Mark | Seal |
|---|---|---|---|
| careful (the valley's honest best: stops giving way to a house that never does) | **3.3% (8.3)** | +15.8 | 3.3% |
| courteous (gives way to a house that held twice; holds once when pressed) | 48.3% (47.5) | +10.0 | 18.3% |
| always give way | 61.7% (71.1) | +2.1 | 16.7% |
| always+grab | 70.0% (74.0) | −2.2 | 1.7%; kept only by the grab in 8.3% |
| shrewd (presses known yielders) | 38.3% (36.0) | **−10.8** | 1.7% |
| `[0,0,1,0,1]` (presses after a gain, gives way after a loss) | 31.7% | **−23.4** (holds 6.8% against 30.2%) | 0 |
| valley's best by mark `[0,1,1,1,0]` | 1.7% (1.9) | +18.8 | 1.7% |

  The grid's best by store are `[1,1,0,1,1]`, `[1,1,1,0,0]`, `[1,1,1,0,0.5]`, `[1,1,0,0,1]` and `[1,1,1,0.5,1]`, unlike the valley's list. Its best by mark are the valley's (`[0,1,1,1,0]` +21.2), but they starve (store 35.6 against 55.6 at the top).

  Staying home against all four on day 2 gains 1.6 that day (4.0 in the valley); on day 12 it gains 1.7 (3.8 in the valley).
- **Engine changes, by dial:**
  - **D1 `H`:** in the proto (3 sites; charged on "neither arrived", so no leak).
  - **D4:** in the proto.
  - **`FLOW_KIND 'both'`:** in the proto.
  - **Need:** re-centre to pivot 44, margin 6.
- **Page changes:**
  - the Opening's numbers (+2, −1, +3, −2) and a reveal for −2;
  - the meter must draw stores below zero (never ends at −12.5 on average; the need, 52, is above zero);
  - the luck skin: "your signal was not seen in time; to them you held the road";
  - about 4 strings, 6 app lines and 10 of check for the stakes [PAGE-MAP], plus the custom's sentence.
- **Risks:**
  - Always-give-way keeps the house more often (71% against 47.5%) and earns the seal about as often (16.7% against 18.3%), so a trivial way sits close to best. This is the true maximin of the game. Retuning (H 3, C 1.5, two stubborn houses near, three stubborn arrivals) did not fix it (`scan3-bridge-out.txt`).
  - **G6 fails:** 43–53% against the valley's 73–80% by the same method. The Chronicle's "way that mattered most" will often be "No single way stands out".
  - The valley's competent way starving (8% kept) may feel punishing to a returning player. That is the point, and it is also a risk.
- **Gates it should pass** (measured values in brackets):
  - G1: courteous keeps 35–65% [47.5 ✓].
  - G2: the grab costs the mark [always+grab −4.3 against always ✓].
  - G3 [95% ✓]. G4 [0% flat ✓]. G6 [43–53% ✗]. G7 [90% ✓]. G8 [100% ✓]. G9 [5 ✓]. G10 [✓].
  - **New, B1 (the valley's competent way starves):** careful keeps at most 15% [8.3 ✓].
  - **New, B2 (pressing does not pay):** shrewd's kept% and mark are below courteous's [✓].
  - **New, B3 (a trivial way is not best by seal):** always's seal% is at or below courteous's [16.7 against 18.3, too close to call].

### Rank 4. The Watchtowers (an arms race)

- **Real-world domain:** arms races and the security dilemma (atlas 3, 4; Jervis 1978; Kydd 2005); also bank runs (atlas 11; Diamond & Dybvig 1983) and any venture that needs both crews (Rousseau's stag hunt).
- **Pitch:** "No one gains by letting down a neighbour who stands down. Peace still fails, from fear."
- **Dials moved:**
  - **D1:** `C 2, S 3` (B 3).
  - **Charter count:** `FLOW_KIND 'both'`.
  - **D9:** `FOUNDERS: { near: ['taker', 'wary', ['wary','firm','soft']] }` and `NEWCOMER: [0, 1, [0,0.15], 1, [0.3,0.5]]` (one hawk, mostly frightened neighbours, a frightened newcomer).
  - **Need:** `NEED_PIVOT 68, MARGIN 43`.
- **Custom of the place:** `[1,1,0,1,0]`. "Stand down for a new neighbour; after that, do as they did yesterday."
- **The two choices:** **Stand down** (a hand; costs 2) / **Keep watch**.
- **Stakes:** both stand down +4; you alone −2; they alone +3; both keep watch 0.
- **What the Mark measures:** futures in which both sides stand down on at least half the border-days over the last ten seasons.
- **Hidden lesson, as a result a theorist would sign:**
  1. In an assurance game (R > T > P > S) nobody profits from betraying trust (T − R = −1), so punishment deters nothing: a missing stand-down is fear or luck.
  2. Both "all stand down" and "all keep watch" are stable. Keeping watch is the safer (risk-dominant) one, since (P−S)² = 4 > (R−T)² = 1, and a stand-down pays only if you are at least 2/3 sure of theirs [derived; Harsanyi & Selten 1988].
  3. So the border is held by the house that stands down again after a miss (reassurance) and still tells the hawk from the frightened. Under noisy imitation the risk-dominant convention is the long-run state (Kandori, Mailath & Rob 1993; Young 1993; Ellison 1993) [theory; not shown in 30 seasons, where baselines stay near 46%].
- **How best play differs from the valley [measured, 60 × 200; kept% in brackets is from 2000 seeds]:**
  - **The valley's temptation is gone.** careful+grab keeps 31.7% (39.6) with mark +2.8, against careful's 40.0% (50.6) and +19.9: taking on the last day loses both results. Staying home on day 12 *costs* 0.5.
  - **Forgiving every miss pays here.** `[1,1,1,1,0]` keeps 38.3% (39.1) with mark +29.2 and seal 35.0%, beating careful's seal of 26.7%. Carried, `[1,1,1,1,0]` − `[1,1,0,1,0]` is **+27.5** points here against **+6.7** in the valley.
  - **The valley's best ways by store fail.** `[1,1,0,0,1]` keeps 5.0% (8.7); `[0,1,0,0,1]` keeps 5.0%.
  - **Grid:** the best by store all have mercy 1 (`[1,1,1,1,0]` #1, `[0.5,1,1,1,0]`, `[1,1,1,0.5,0]`); in the valley the best by store have mercy 0 to 0.5.
- **Engine changes:** D1 (proto), `FLOW_KIND 'both'` (proto), D9 founders and newcomer (proto), need re-centred. No new code.
- **Page changes:** the Opening's numbers (−2, +4); the cards; a newcomer of another kind in the Afterwards. The last-day line will rarely appear.
- **Risks:**
  - **Little trade.** The reassuring way is near the best for both the house and the valley (grid: `[1,1,1,1,0]` is #1 by store and #3 by mark).
  - **The seal is easy:** 27–35% for several plain ways, and higher at 2000 futures.
  - G7 is marginal (68.3%).
  - **The founders carry the place.** With the valley's founders it plays like the valley without its grab (grid lists almost identical; `confirm-watch-out.txt`). With no hawk, always wins everything (73% kept, seal 53%; `scan6-watch-out.txt`).
- **Gates it should pass** (measured values in brackets):
  - G1: careful keeps 35–65% [50.6 ✓]. G3 [100% ✓]. G4 [0% flat ✓]. G6 [83% ✓]. G7 [68.3% ✓, marginal]. G8 [100% ✓]. G9 [5 ✓].
  - **New, W1 (no greed):** careful+grab's kept% is at or below careful's, and sending on day 12 is worth at least 0 [✓].
  - **New, W2 (mercy pays):** the carried gap `[1,1,1,1,0]` − `[1,1,0,1,0]` is at least +15 here and at most +10 in the valley [+27.5 / +6.7 ✓].
  - **New, W3 (no all-send recipe):** always is neither best by kept% nor by seal [✓ with this founder mix only].

## 3. Reserves, ranked

**Reserve 5. The Fog Line** (the trench truce, atlas 1; noise and forgiveness)

- **Dials:** FOG 0.10, kind 'lost'; custom `[1,1,0,1,1]`.
- **Lesson:** the forgiveness that keeps a peace must rise with the noise (Molander 1985; Nowak & Sigmund 1992; Wu & Axelrod 1995).
- **Measured, carried:** the best way moves from `[1,1,0.75,1,0]` (59.4) at FOG 0.04, to `[1,1,1,1,0]` (29.1) at 0.10, to `[1,1,1,1,1]` (17.5) at 0.15.
- **Why it is a reserve:**
  - It asks the valley's own question louder (weak H3).
  - It fails G3 as measured: a spread of 25 points in only 45 / 5 / 10% of seeds.
  - It would need another dial (fewer arrivals, or a higher K) to open the range.

**Reserve 6. The Crossroads** (a trade road of strangers, atlas 2 and 34; the shadow of the future)

- **Dials:** TURNOVER (taker, wary, soft at day 5 or 9); ARRIVALS 3 in seasons 2..20.
- **Measured:** strangers do not change the best way.
  - `[0,1,1,1,0]` stays best by mark: +13.5 against careful's +7.3 in R1, and +20.5 in R2.
  - The baseline only falls (31% median in R1; 18% with five arrivals).
  - It fails H3.
- **Where the theorist's real lesson lies:** an end not known in advance (D5c), which is not in the proto. Even then, a hidden end with a known latest day still unravels on that day.
- **Derived from measured careful pulls in the valley:** staying home on days 9–11 gains 3.8–3.9 that day and loses 5.3–5.4 afterwards. With the end uniform on days 10..12:
  - taking on day 10 is worth about +0.3 (1/3 × 3.8 + 2/3 × (−1.5));
  - taking on day 11 is worth about +1.2;
  - taking on a reached day 12 is worth +3.8 (it is then known to be the last).
- **Conclusion:** only an end with no known bound (geometric) protects trust, and that breaks H1's twelve days.

## 4. If only three can be built

**Cut the Watchtowers first.**

- It has the weakest trade: the reassuring way is good for the house and the valley alike.
- It is the most dependent on founder tuning: with the valley's founders it plays as the valley minus the grab.
- Its seal is the easiest to earn.

The Bridge already teaches the other half of greed against fear (greed without fear), and the valley teaches both together. To keep the promise of "arms races", skin the Bridge as **The Border** instead of the bridge:

- **Pull back** / **Hold the line**;
- both hold: a skirmish, −2;
- Russell named the game of chicken after nuclear brinkmanship.

**If only two:** keep the Shoal (strongest evidence, the valley's trade intact, the user's fishing and pastures) and the Salt Road (the reversal that no other place gives).

## 5. Open questions for the design lead

1. **Salt Road: may greed earn the seal?** `[0,0,1,0,1]` keeps 45% with seal 38%. That is the truest lesson of collusion, and possibly a bad feeling. The alternative I measured (a guild chest, no soft stall near) removes the seal almost entirely.
2. **Salt Road: may a three-day break at the end earn the seal (30%)?** If not, a per-place replay rule for days 10–12 is needed. It is not in the proto.
3. **Bridge: always-give-way keeps 71%.** Accept it as the game's maximin route, with a lower mark and seal no higher than the honest way's, or keep searching? Four retunings did not move it.
4. **Bridge G6 fails (43–53%).** Accept "No single way stands out" as common there, or add a dial?
5. **Watchtowers: is a place with little trade a Place?** Or should its lesson live as one line in the Bridge's afterword?
6. **Shoal: count the ground (the new `'stock'` charter, recommended) or both-days (`'both'`, in the proto)?** Both pass the gates (`scan-grounds-out.txt`, `scan2-shoal-out.txt`).
7. **Seal rates.** All the seal% here are at 150–200 futures and understate the shipped game's. Re-measure each place at 2000 futures before setting margins.
8. **Competent ways.** Every place's competent way is the valley's careful, except the Bridge's courteous. Place-aware competent ways (for example, one that reads the ground) were not written.

## 6. Files

- `tlab.js`, `tlab-stock.js`: helpers (`place`, `confirm`, the G6/G8/G9 checks, and the grim, courteous, shrewd and starter ways).
- `engine-theorist.js`: the proto plus `FLOW_KIND 'stock'`.
- Final runs: `confirm-shoal`, `confirm-salt`, `confirm-bridge`, `confirm-watch9` (and `confirm-watch`, valley founders), `grid-valley`, `grid-salt`, `grid-shoal`, `g6-compare`, `reserves`. Each is `.js` with its `-out.txt`.
- Exploration: `scan*`, `fear1`.
