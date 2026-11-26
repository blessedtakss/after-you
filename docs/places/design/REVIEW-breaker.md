> **Record of its time.** Written 2026-11-25 09:25 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The breaker's review of the twelve proposed Places

Folder: `<scratch>/places/judge-breaker/`. Nothing in the game folder was touched.

My brief was to assume every place is either the valley with new nouns or has one way of playing that simply wins, and to try to prove it. I tried six attacks on each place:

- **(a)** one way that tops both the store and the mark, or earns the seal far more often than honest play;
- **(b)** the valley's best way is also best there;
- **(c)** a last-day grab or a bully buys the seal;
- **(d)** the honest follower keeps the house in under 25% or over 75% of Lives;
- **(e)** plain ways finish within 25 points of each other on most seeds;
- **(f)** a lesson the numbers do not bear out.

Where I was unsure whether a place differs from the valley, I scored it as not differing.

## 0. Method, and what is measured

Every number below is **[measured]** unless it is marked **[argued]**. Every run used each proposer's own engine copy and their exact overrides and need rule, copied into `places-def.js`. All of them ran on **seeds the proposers did not tune on**:

| Use | Seeds | Futures |
|---|---|---|
| Store side (kept%) | 5001–7000 (2000 Lives) | none |
| Mark side (sweep) | 301–360 (60 Lives) | 200 |
| 243-way grid | 401–416 (16 Lives) | 100 |
| Seal at near-shipped resolution | 501–530 (30 Lives) | 1000 |
| Plain ways carried (G3/G4 form) | 601–620 (20 Lives) | 150 |
| G6/G8/G9 | 701–730 (30 Lives) | 1000 per what-if |

Each place got the same battery (`breaker.js`, `run.js`; output in `out-<place>.txt`):

1. Store side for about 20 ways: the honest way, the valley's named policies, the valley's best fixed ways, and the honest way with +grab, +grab2, +grab3, +give and +grab-if-decides.
2. A 60-seed sweep of the same ways.
3. Plain ways carried.
4. Pulls on days 1, 2, 3 and 12.
5. The 243-way grid with a simple seal (kept, and mark − 2 SE ≥ 5), compared way by way with the **valley's grid on the same seeds** (Spearman rank agreement over the 243 ways).
6. A 1000-future sweep of the temptations.

Round 2 (`round2.js`, `r2-*.txt`) attacked the survivors:

- the end-game rule against longer grabs;
- milkers (exploit neighbours who forgive);
- G6/G8/G9 at 1000 futures;
- a combined bridge.

`fear.js` and `fear-W0..W5.txt` hold six arms-race variants.

**Cautions.**

- A sweep mark over 60 seeds carries a standard error of about 1–2 points.
- **The grid's store numbers on 16 seeds are not evidence.** On seeds 401–416 the theorist's Watchtowers' `always` keeps 75%; on 2000 fresh seeds it keeps 31.1%. I use the grid only for rank agreement and for which ways lead.
- Seal rates at 200 futures understate the shipped game. At 1000 futures they are 1.5–2× higher.

### The valley on the same footing (reference) [`out-valley.txt`]

| | Value |
|---|---|
| careful kept, 2000 fresh Lives | 40.2% |
| careful, sweep | mark +10.4, seal 11.7% (200 f); seal 26.7% (1000 f) |
| cold (the valley harness's careful that opens to kin only on day 1) | kept 44.5%, seal 16.7%: the valley's best listed policy |
| `[0,1,1,1,0]` | best on the grid by seal (31.3%) and by mark (+20.5) |
| careful+grab-if-decides | kept 68.3% against 38.3% in the sweep, same seal: the accepted trade |
| careful+give (send to all on day 12) | seal 11.7%, the same as careful |
| Plain ways carried | ≥ 25 points apart in 95% of seeds; best is flat in 0% |
| Baseline | inside 15..85 in 100% of seeds |

The valley's grid has four ways in the top ten by both store and mark. So "tops both" alone cannot disqualify a place. The valley's tension sits in the last-day trade.

## 1. Scores

H3 columns: **ρ mark** is the rank agreement of the 243 ways' marks with the valley's (1.0 means the futures want the same habits). **Valley-best** is the rank by seal, on the place's grid, of the valley's best fixed way `[0,1,1,1,0]`, plus the kept% of the valley's best policy, `cold`.

| Place (proposer) | Honest kept (2000 fresh) | Seal 200 f / 1000 f | Way that breaks it | Grab buys seal? | Carried ≥ 25 / flat best | ρ mark | Valley-best here | Score | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| **Salt Ring** (prover) | careful 50.8 | careful 0 / 0; grudge ways 7.5–17.5 / 20–33 under the end-game rule | none | 10–12 rule: grab2/3 0–2.5%, **grab5 23.3%**; 8–12 rule: grab2–6 ≤ 2.5% | 95 / 0 | **−1.00** | #243 of 243 | **8** | keep (window 8–12) |
| **Narrow Bridge** (prover) | strict turns 50.9 | strict 16.7 / 10; `[1,0,0,1,0.5]` 26.7 / 26.7 | none | no gain (13.3 = 13.3) | **50** / 5 with the valley range; 95 / 0 with the seat's range | 0.08 | kept 0% | **7** | fix |
| **The Banks** (seat) | careful 44.9, mender 48.6 | mender 25 / 36.7 | none (milkers 13–22% kept, mark −18 to −21) | seal 0, bought 21.7% | 100 / 10 | 0.91 | `[0,1,1,1,0]` #25, kept 4.3%; cold kept 15.6% | **7** | keep (fix engine) |
| **The Bridges** (seat) | take-turns 44.4 | 43.3 / 46.7 (seal ≈ kept) | the turn recipe: seal in 96% of kept Lives; 6 ways top-10 by both | no gain | 100 / 0 | −0.11 | kept 0% | **5** | fix (→ merged into the Bridge) |
| **The Watch** (seat) | careful 57.2 (margin 56: 48.3) | careful 33.3 / 20; **cold 28.3 / 53.3** | the valley's cold is best at 1000 f | grab loses store | 95 / 15 (243-carried 0) | 0.92 | `[0,1,1,1,0]` #26, kept 0%; **cold best** | **5** | fix, conditional |
| **The Shoal** (theorist) | careful 53.4 | 23.3 / 36.7 | careful+give 36.7 at 200 f | seal 3.3, bought 21.7% | 100 / 10 | 0.91 | **#3**, top-10 overlap 5 of 10; cold kept 29.6% | **5** | reserve 1 |
| **The Shoal** (prover) | careful 50.9 | 31.7 / 43.3 | `always` best plain way carried in **90%** of seeds | seal 5, bought 23.3% | 100 / **90** | 0.71 | #13; cold kept 17.3% | **4** | reserve 2 (fix range and charter) |
| **Watchtowers** (prover) | careful 51.5 | 23.3 / 33.3; **cold 30** | carried flat 30%; cold best | grab loses | 100 / **30** | 0.86 | #26; cold best | **4** | reject (folded into the Watch) |
| **Watchtowers** (theorist) | careful 48.5 | 25 / 40; cold 33.3 | `always` #2 by seal on the grid; carried flat **50%** | grab loses | 100 / **50** | **0.96** | #10; cold best | **3** | reject |
| **Salt Road** (theorist) | careful 50.8 | careful 0; **`[0,0,1,0,1]` 38.3 / 73.3** | `[0,0,1,0,1]`: kept 73% and sealed 73% at 1000 f | lab rule: grab3 43.3% sealed | 90 / 0 | −0.98 | #243 | **3** | reject (→ the Salt Ring) |
| **Narrow Bridge** (theorist) | courteous 49.1 | 23.3 / 46.7 | **always keeps 72.3%** with seal 23.3 (= honest) | always+grab 74.7% kept | 90 / 0 | 0.84 | valley's best by mark is #1 by mark | **2** | reject |
| **Saltmarket** (seat) | careful 41.6 | careful 5 / 6.7; **careful+cut on day 12: 15 / 36.7** | 0 of 243 fixed ways ever earn the seal; the seal is a day-12 recipe | — | 100 / **50** | −0.86 | #232 | **2** | reject |

(d) never fails: every honest way keeps 41.6–57.2% on fresh seeds. The proposers' tuning holds out of sample.

## 2. Place by place

### Proposal 1 (theorist)

**The Shoal — 5, reserve 1.**

- It plays like the valley at the top.
  - careful is the best listed way by seal (23.3%), with cold close behind (21.7%).
  - The valley's best fixed way `[0,1,1,1,0]` is #3 by seal on the grid (12.5% against 18.8% at the top).
  - Five of the valley's top ten by seal are in the Shoal's top ten.
  - Mark rank agreement is 0.91.
- **(f) holds.** Reopening pays here and costs in the valley. Carried `[1,1,0.67,1,0.67]` beats `[1,1,0.67,1,0]` by +15.3 here and loses by 4.6 in the valley. G6 passes (83–87%).
- **(c) holds.** careful+grab: bought 21.7%, seal 3.3%.
- **New lever.** careful+give earns the seal in 36.7% against careful's 23.3% (200 f). Sending to all four on day 12 plants forgiving precedents in the heir. It costs 6.6 kept points, so it is a sacrifice rather than a purchase.
- **Not tested:** the hysteresis lesson (the ground below 1/3 cannot be restarted by reciprocity). It is argued, not measured, and the page would show it only through the gauge.
- Under my rule it does not differ enough. Kept as the commons fallback.

**The Salt Road — 3, reject.**

- **(a) fails badly.** `[0,0,1,0,1]` stays home with a stranger and after both held, and holds the price after being undercut and after both undercut. Results:
  - #1 by seal on the grid (50%, #3 by purse);
  - at 1000 futures: kept 73.3% and **sealed 73.3%**, with the highest store of any listed way (65.7 against careful's 61.5).
- The cause is the custom `[1,1,0,1,1]`: reopening neighbours can be lived off in a three-day cycle. With the valley's custom (the prover's Salt Ring) the same way keeps 13.3%.
- **(c) fails as proposed.** With the lab's one-day clause, careful+grab2 and +grab3 are sealed in 36.7% and 43.3% at 1000 f. The prover's end-game rule takes both to 0%.
- **Fix:** the Salt Ring's settings.

**The Narrow Bridge (chicken) — 2, reject.**

- **(a) fails.** always-give-way keeps 72.3% of 2000 fresh Lives against courteous's 49.1%, with an equal seal at 200 f (23.3%) and 33.3% against 46.7% at 1000 f.
- always+grab keeps 74.7%.
- The valley's best-by-mark way is #1 by mark here (ρ 0.84). It starves, but the futures want what the valley wants.
- The theorist's four retunings and the prover's H > C runs agree.

**The Watchtowers — 3, reject.**

- **(a) and G4 fail.**
  - `always` and `[1,1,1,1,0]` lead the grid (seal 68.8%; #1–3 by purse and #3–5 by mark).
  - Plain ways carried name all-send as best in 50% of seeds (gate ≤ 20%).
- **(b) fails.** The valley's cold is the best listed policy (seal 33.3%), and mark rank agreement with the valley is 0.96, the highest of all twelve.
- The baseline is inside 15..85 in only 56.7% of seeds at 1000 f.

### Proposal 2 (seat)

**The Banks — 7, keep (engine changes below).**

- **(b) passes in the strong sense.**
  - The valley's best fixed way keeps 4.3% (valley 22.8%).
  - The valley's best policy, cold, keeps 15.6% with seal 3.3% (valley 44.5% and 16.7%).
  - A guarded greeting empties a bank by 3, so the valley's habit fails on day 1.
  - Pull on day 1: sending to all four costs 7.7 baskets that day and returns 34.8 later (valley −3.8 and +5.1).
- **(a), (c) and (e) pass.**
  - mender (forgive one slip) is the best listed way: seal 25% at 200 f, 36.7% at 1000 f.
  - always keeps 27.4% with seal 8.3–13.3%.
  - Milkers that exploit forgiving neighbours collapse (13–22% kept, mark −18 to −21).
  - careful+grab: bought 21.7%, seal 0.
  - G6 70–80%, G8 100%, G9 4–5 (1000 f).
- **(f) mostly holds.** Mercy pays the store far more here: `[1,1,0.5,1,0]` is +19.1 baskets (about +9.5 measures) over the custom, against +3.2 measures in the valley. The claim that forgiving "costs a little" in the valley is not borne out (it gains 3.2 there).
- **Weakness.** Mark rank agreement 0.91: the futures want the valley's habits plus reopening, and what differs is the store side and the greeting.

**The Bridges — 5, fix (merged into the Bridge).**

- Truly different: ρ −0.11; every valley way keeps about 0%.
- **(a) fails.** take-turns is sealed in 43.3% of Lives with 45% kept (46.7% with 53.3% at 1000 f): once kept, almost always sealed.
- Six ways sit in the top ten by both store and mark, and the last-day act gains nothing.
- The seat says so itself ("the house-versus-mark trade is weak").
- Its **range list** and **replay of "drove on in their turn"** (`REPLAY_SITS [3]`) are the two things the prover's Bridge lacks. Both are adopted below.
- Its stakes (H 3) cannot be kept: with the two takers near needed to break the recipe, always-give-way keeps **61.2%** (`r2-bridge.txt`, B2).

**The Saltmarket — 2, reject.**

- With S 2 above C, holding pays the store at every point. Day-3 pull: holding is +0.7 that day and +14.7 later. There is never a store reason to cut.
- On the grid **0 of 243 ways ever earn the seal**.
- The seal exists only by being complicit all Life and cutting on day 12: careful+cut is sealed in 36.7% at 1000 f against careful's 6.7%. That is a last-day recipe.
- G4 fails: the carried best is all-send in 50% of seeds, because the custom is all-send. G7 is 63–68%.

**The Watch — 5, fix (conditional fourth).** The best arms-race variant, and the weakest member of my pack.

- **Passes:**
  - G4 (15% on the 13-way range; 0% on the 243-way carried grid, 12 seeds);
  - G7 98%;
  - the grab loses the store (sending on day 12 is worth +0.1);
  - the valley's best fixed way keeps 0% (#26 by seal);
  - the pull differs: no greed, standing down first costs 3.4 on day 1, the sister keeps watch on day 1.
- **(b) fails at the top of play.**
  - The valley's cold is sealed in **53.3%** at 1000 f against careful's 20% (30 seeds; at 200 f the order flips, 28.3 against 33.3).
  - The best five-number way, `[0,1,1,1,0.5]` (also `[0,1,0.5,1,1]`), is one step from the valley's `[0,1,1,1,0]`.
  - Mark rank agreement 0.92.
- G6 with the valley's `forgiving` is 53% (careful 80%).
- The proposed margin 53 gives careful 57.2%. The lab's `tuneNeed` caps the margin at 4 sd; a wider search gives 56 (48.3% on fresh seeds).
- Five fixes tried, none moves the top away from the valley's (`fear-W1..W5.txt`):
  - frightened newcomers ×1, ×2, ×3: the baseline rises and the ranking does not change;
  - FOG 0.12: carried flat 55%;
  - no hawk near: always keeps 82.7%.

### Proposal 3 (prover)

**The Watchtowers — 4, reject.** The seat's Watch without the false alarms and with K 2.

- Carried flat best 30% (G4).
- The valley's cold is the best listed policy (seal 30% against careful's 23.3%).
- ρ 0.86.
- Nothing it does is not done better by the Watch.

**The Shoal — 4, reserve 2.**

- **G4 fails.** The page's thirteen plain ways name "send every time" as the best way in **90%** of fresh seeds (the prover found 65% on theirs).
- On the grid the always family leads by seal (37.5%), though lived `always` keeps only 15.7% on 2000 seeds.
- "Holds" counts hands, not the ground, so the stock never reaches the Mark.
- What it does well:
  - the trade survives (careful+grab: bought 23.3%, seal 5%);
  - cold drops to 17.3% kept;
  - ρ 0.71, the most distinct of the three commons.

**The Salt Ring — 8, keep.**

- Same Life as the valley (purse ρ 1.00); every act is scored the other way (mark ρ −1.00). The valley's best way is #243 of 243.
- **Nothing dominates.**
  - 94 of 243 ways earn the seal somewhere, and the best is 31.3% on 16 seeds.
  - With the end-game rule at 1000 f, the grudge ways are sealed in 20–33% with 23–37% kept.
  - careful (the honest follower) keeps 50.8% and is never sealed, which is the place's point.
- **One leak in the proposed window.** The rule replays days 10–12, and a house that starts undercutting on day 8 (careful+grab5) is sealed in 17.5% (200 f) and **23.3% (1000 f)**. With the window widened to **days 8–12**, grab2 to grab6 are all at 0–2.5% (200 f), and the honest grudge ways are unaffected (`[1,1,0,0,0]` 15%, grim 12.5%, `[0,0,1,0,1]` 15%).
- G6 63–73%, G8 100%, G9 5.
- **Not run:** the 8–12 window at 1000 futures.

**The Narrow Bridge (turns) — 7, fix.** The only bridge with a real trade.

- strict turns `[1,0,0,1,1]` is the store way: kept 50.9%, seal 10–17%.
- `[1,0,0,1,0.5]` (half a turn after locked wheels) is the road's way: kept 33–37%, seal 26.7%.
- No recipe; ρ 0.08.
- **(e) fails with the valley's thirteen ways** (25 points apart in 50% of seeds). With the seat's range list it passes (95%; best flat 0%).
- G6 with turn-taking passes at 97–100%. With the valley's forgiving it fails (20%), which is why the prover saw 22.5%.
- Stores are all below zero (need −13.5 on average).

## 3. The pack I would build

| # | Place | Built from | Real-world fit | What the person feels by day 3 |
|---|---|---|---|---|
| 1 | **The Salt Ring** | prover's, with the seat's daily town count | trade routes, price rings | every hand that fills the store holds the ring the town pays for |
| 2 | **The Narrow Bridge** | prover's founders and stakes + seat's range and replay | trade road, one-lane crossings, rotas | the old way jams every polite neighbour by day 2; driving on after both waited pays (pull day 2: −4.1 for giving way again) |
| 3 | **The Banks** | seat's | fishing grounds, shared pasture | a guarded greeting empties the water; the bank's number on the card moves |
| 4 | **The Watch** (conditional) | seat's, margin 56 | arms races | nothing to take, a fire may be a shadow, the last day holds no grab |

The pack's best five-number ways (grid, 16 seeds, indicative) are all different from each other and from the valley's `[0,1,1,1,0]`:

| Place | Best way |
|---|---|
| Salt Ring | `[0,0,1,0,0.5]` |
| Bridge | `[0.5,0.5,0,1,1]` / `[1,0.5,0,1,1]` |
| Banks | `[1,1,1,1,0]` |
| Watch | `[0,1,1,1,0.5]` (one step from the valley's) |

### 3.1 The Salt Ring: required changes

1. **Settings:** `CHARTER 'breaks'`, need pivot 57, weight 0.5, margin 6. Everything else is the valley's. Do **not** use the Salt Road's custom `[1,1,0,1,1]` or FOG 0.06.
2. **End-game seal rule, window days 8–12, not 10–12.** Replay those days with a hand wherever the house stayed home in a situation where its habit before day 8 was at least one half. Withhold the seal unless the house is kept and the mark is clear both as lived and as replayed. Measured at 200 f only; re-measure at 2000 f.
3. **Inverted verdict inside the engine.** Every count must face the charter: `held`, `holdsPct`, baseline, mark, rank, best ≥ worst, `level`, `lastDay.holds`. A separate path, off by default (H4). [argued, sites in ENGINE-MAP §3 D3]
4. **Page.**
   - About 20 charter sentences, and the strip's good side from the place.
   - The last-day paragraph rebuilt around "the last days", taking its verbs from the replay entry.
   - **A daily count on the day total** ("the town paid more at N of your stalls today"). This is the number of your ties where both held. It is page-only, since the valley's stakes have no town term, and it makes the town felt from day 1.
5. **The Opening must say the seal goes to houses that break the ring**, because the honest follower is never sealed (0% at 200 and 1000 f).

### 3.2 The Narrow Bridge: required changes

1. **Settings:**
   - B 3, C 1, **S −2, H 2** (not H 3);
   - `FLOW_KIND 'one'`;
   - `FOUNDERS { near: ['taker','taker',['firm','wary','steady']] }`;
   - **`RANGE_WAYS` = the seat's list**;
   - **`REPLAY_SITS [3]`**: replay "drove on although they gave way to you yesterday" on day 12;
   - need pivot −38, weight 0.5, margin 24 (strict turns 51.0% on seeds 1–2000, 50.9% fresh).

   Measured as variant B1 in `r2-bridge.txt`: identical Lives to the prover's Bridge, carried spread 95% and flat 0%, G6 97–100% with turn ways.
2. **Engine:** `FLOW_KIND 'one'` (2 lines) and `REPLAY_SITS` (1 line), both in `engine-seat.js`. My light identity check against the proto at valley defaults: 2250 JSON comparisons over 90 Lives, 0 differ (`identity-seat-out.txt`). The full 337-Life identity run on the final engine is still required.
3. **Negative stores.** Add a starting store of +40 to house 0, to the reference Life, and to `NEED_PIVOT`. Need = max(old + 1, round(pivot + 0.5(old − pivot) + margin)) then shifts by exactly 40, so kept% is unchanged. Copying reads incomes, not stores. [argued, by algebra]
4. **The harness's G6 must use turn-taking**, not the valley's forgiving.

### 3.3 The Banks: required changes

1. **Settings as proposed:**
   - B 1, C 2, K 1;
   - `STOCK { start 6, min 2, max 9, delta [−3, 0, +1] }`;
   - `FLOW_KIND 'stock'` (the season's mean level), `HOLD_LINE 6`;
   - `ARRIVALS 2`, `ARRIVE_FROM 3`, `ARRIVE_TO 15`;
   - need 172 / 0.5 / 30.

   The honest way for the page is mender (48.6% fresh). careful keeps 44.9%.
2. **Engine:**
   - `FLOW_KIND 'stock'` (4 lines, built in `engine-seat.js`);
   - levels in `runFuture().seasons` (about 3 lines, not built);
   - kin's tie levels in `kinWith` (not built);
   - the identity gate.
3. **Page:**
   - a gauge in the card head;
   - the Opening cannot promise "worth 3";
   - stores near 200 baskets;
   - the bank shading in the Afterwards strip.

   PAGE-MAP's estimate: 90–120 app lines, the largest page job in the pack.
4. **Correct the afterword's claim:** forgiving pays much more here; it does not cost in the valley.

### 3.4 The Watch: required changes, and the condition

1. **Settings:**
   - C 2, S 3, FOG 0.08 ('lost', read as false alarms), K 1;
   - custom `[0,1,0,1,0]`;
   - need pivot 47, weight 0.5, **margin 56**: careful 49.1% on seeds 1–2000, 48.3% fresh, against the proposed 53, which gives 57%.

   No engine change.
2. **Run G6 with the place's honest way** (careful 80%). The valley's forgiving gives 53%.
3. **The condition.** The design lead must accept that H3 is met by the pull and by the five-number ways (the valley's best fixed way keeps 0%; no last-day grab; the custom earns half the need), not by the adaptive best. The valley's cold is still best at 1000 f, and the futures rank habits almost as the valley does (ρ 0.92). If that reading is not accepted, build three, and give "arms race" a line in the Bridge's afterword instead.
4. **Reserves, in order:**
   - **The theorist's Shoal** (passes every gate; weak on H3; needs eighths on the page);
   - **the prover's Shoal**, once its range stops naming all-send (90%) and its charter counts the ground.

## 4. What the proposers missed

1. **The grids mislead on the store.** 16-seed store numbers differ from 2000-seed numbers by up to 44 points (the theorist's Watchtowers' `always`: 75% against 31.1%). Every grid-based balance claim in the three proposals (6–16 seeds) is indicative only. The prover warned of this; the others did not.
2. **G4 in the page's own thirteen-way form fails in four places:** the prover's Shoal 90%, the theorist's Watchtowers 50%, the Saltmarket 50%, the prover's Watchtowers 30%. The Chronicle's range would show "send every time" as the best plain way. Only the prover flagged one of them (the Shoal, at 65%).
3. **The valley's own best policy (cold) was never measured in a place.** All three proposers compared against careful. cold is the best listed policy in all three Watchtowers variants. That is the H3 failure the fear family carries.
4. **A last-day gift raises the seal.** Sending to all four on day 12 plants forgiving precedents in the heir. In places whose futures reward forgiveness it lifts the seal by 7–13 points at 200 f:

   | Place | Seal with the gift | Seal without |
   |---|---|---|
   | Theorist's Shoal | 36.7% | 23.3% |
   | Prover's Shoal | 40% | 31.7% |
   | Theorist's Watchtowers | 33.3% | 25% |
   | Watch | 41.7% | 33.3% |
   | Prover's Watchtowers | 30% | 23.3% |
   | Valley | 11.7% | 11.7% |

   At 1000 f it is within noise in the Banks (33.3 against 36.7) and the Watch (26.7 against 20). It costs about 5 kept points, so it is a sacrifice, not a purchase. But it is a day-12 lever on the mark that no rule names and the Chronicle never mentions.
5. **The end-game rule's window leaks a five-day defection** (23.3% sealed at 1000 f). Days 8–12 closes it.
6. **Stakes and founders interact.** H 3 is harmless with the valley's founders and fatal with two takers near (always-give-way 61%). The fix for one degeneracy produced another; any retune needs the whole battery again.
7. **Seal difficulty.** At 1000 futures the best honest seals reach 37–53% in several places: the theorist's Shoal 36.7%, the prover's Shoal 43.3%, the theorist's Bridge 46.7%, the seat's Bridges 46.7%, and the Watch's cold 53.3%. The valley's careful is 26.7%. At the shipped 2000 futures the seal gets easier still. Set each place's need margin and check seal% at 2000 futures, aiming near the valley's.
8. **The Saltmarket's shape (S > C with an inverted charter) has no store temptation at all.** The prover found the same and named it; the seat proposed it anyway.

## 5. Measured and not measured

**Measured here** (files in this folder):

- all twelve batteries (`out-*.txt`, about 90–115 s each);
- round 2 (`r2-ring.txt`, `r2-bridge.txt`, `r2-banks.txt`, `r2-watch.txt`, `r2-shoal.txt`);
- six arms-race variants (`fear-W0..W5.txt`);
- engine-seat identity at defaults (`identity-seat-out.txt`).

**Argued, not run:**

- the starting-store shift for the Bridge;
- every unbuilt engine change (the inverted verdict, the end-game rule inside the engine, levels in seasons, kin's levels);
- every page size (taken from PAGE-MAP);
- the theorist's hysteresis lesson;
- the cause of the Salt Road recipe (living off reopeners in a three-day cycle), which is consistent with the 13.3% kept under the valley's custom but was not traced Life by Life.

**Not run:**

- the valley harness (G1–G10, X1, X2) on any place;
- the 8–12 end-game window at 1000 or 2000 futures;
- any pack member at 2000 futures;
- marks on more than 60 seeds;
- the full identity suite on any extended engine.
