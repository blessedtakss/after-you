> **Record of its time.** Written 2026-11-25 09:00 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Places: the prover's proposal

Angle: fewest engine changes, most evidence. Every number below was run in this folder on the engine-map prototype (`engine-proto.js`, identical to the shipped engine at defaults) through the lab, unless it is marked **[argued]** or **[guess]**. Output files are named next to each claim; all are in `<scratch>/places/propose-prover/`.

## 0. Verdict in one table

| Rank | Place | Real-world domain | Dials moved | Engine work beyond the proto | Measured status |
|---|---|---|---|---|---|
| 1 | **The Watchtowers** | arms race, security dilemma | C 2, S 3, custom [0,1,0,1,0], K 2, need | none | passes every gate measured |
| 2 | **The Shoal** (skin B: the Common pasture) | fishing grounds, shared pasture | stock, C 1.5, K 2, need | none (optional: levels in `runFuture().seasons`) | passes every gate measured; one named risk ("always" is a strong naive route) |
| 3 | **The Salt Ring** | price ring of traders on a trade road | charter read the other way, need | verdict inversion + an end-game seal rule (both measured in the lab, neither in the proto) | passes; seal leak of 7.5-10% for an end-game undercut (honest route 15-20%) |
| 4 | **The Narrow Bridge** (conditional) | carters taking turns on a one-lane bridge | S -2, H 2, a new "exactly one hand" count, two bullies near, need | 2-line flow patch (measured) + the Salt Ring's end-game rule | the only remaining candidate that passes H3 (by the widest margin of all); fails G6 (22.5%, measured with the valley's forgiving policy); every store is below zero |
| R1 | The Fog Line | trench truce, noise | FOG 0.10, no arrivals | none | **fails H3** on fresh seeds; G6 fails (47.5%) |
| R2 | The Trade Road | caravan strangers | stranger in the Life, 3-5 arrivals, B5 C2 | none | **fails H3** in all 6 variants tried |
| - | The Narrow Bridge, stubborn form (H > C) | chicken | H 1.5-3 | none | rejected: "always" keeps 79-100% (fails H5) |

What would be cut first if only three are built: **the Narrow Bridge** (section 9).

### 0b. What the custom earns, and the need rule (1000 seeds, no futures) [measured]

| Place | Custom's store: median (sd) | Honest way's mean store | Need rule (pivot / weight / margin) | Need above the custom, on average | Honest way keeps |
|---|---|---|---|---|---|
| Valley | 57.0 (8.7) | careful 62.8 | 59 / 0.5 / 6 (shipped) | +7.4 | 38.8% |
| Watchtowers | 51.0 (14.3) | careful 114.5 | 51 / 0.5 / 63 | +62.1 | 48.2% |
| Shoal | 60.8 (18.7) | careful 73.8 | 61 / 0.5 / 13 | +13.8 | 48.4% |
| Salt Ring | 57.0 (8.7) | careful 62.8 | 57 / 0.5 / 6 | +6.5 | 48.0% |
| Narrow Bridge | -38.0 (10.2) | strict turns -14.0 | -38 / 0.5 / 24 | +23.9 | 49.6% |
| Fog Line (R1) | 47.0 (9.3) | careful 55.7 | 47 / 0.5 / 9 | +9.3 | 51.2% |
| Trade Road (R2, T6) | 86.0 (16.8) | careful 91.7 | 86 / 0.5 / 5 | +7.2 | 49.1% |

The stubborn bridge (H > C) was rejected on the store side alone: under every need tried, always keeps 79.5-97.8% of 600 seeds (`x-bridge-out.txt`, `x-bridge2-out.txt`; mark side on 20 seeds only).

## 1. Method (applies to every place)

- **Seeds and counts.** Store side: 1000 seeds (no futures). Mark side: 40 seeds x 200 futures, and for the four recommended places a second, disjoint set of 40 fresh seeds (41-80) for the key comparisons (`cross-*.js`). Grids: 243 five-number ways lived, 12 seeds x 60 futures (`examine`) and 16 seeds x 100 futures (`sealGrid`). A mean mark over 40 seeds carries a standard error of 1.2-2.4 points (printed as `+-sem`).
- **Warning learned the hard way [measured].** 16-seed grids mislead on the store: in the Watchtowers, `[1,1,0.5,1,0]` keeps the house in 50% of seeds 1-16 but 12.5% of seeds 17-40, 5% of 41-80 and 21.6% of 81-400 (`x-tower-seeds.js`). Every claim below that ranks ways is checked on 40-seed sweeps; grid rankings are quoted only as indicative.
- **Honest competent way.** The custom itself never keeps the house (need >= custom's store + 1 by construction, Caution 1 of LAB.md). H5's "honest follower" is read as the valley harness's `careful` (screen information only, never takes on purpose), except on the Narrow Bridge, where the honest way is turn-taking (section 5).
- **Need rule.** The engine's rule unchanged, `need = max(custom + 1, round(PIVOT + 0.5 x (custom - PIVOT) + MARGIN))`, with PIVOT = the custom's median store in the place and MARGIN searched over -40..160 (my `tuneNeed2`; the lab's `tuneNeed` caps the margin at 4 sd, which is too low when the custom is far below competent play) so that the honest way keeps the house in 50% of 1000 seeds.
- **Seal.** The engine's rule (`verdict().seal`), and for the two places whose tempting act is not "stay home on day 12 after both helped", the end-game rule of section 4.
- **G6 / G8 / G9** as the valley SPEC defines them (`gates.js`): forgiving's habit-that-mattered moves holds by >= 5 points in >= 60% of seeds (1000 futures per what-if); kin acts toward the player from a "from you" habit with a dated deed on days 5-12 in >= 85% of seeds for mirror, forgiving and careful; forgiving meets >= 4 of 5 situations twice.
- **G4** in the SPEC's form: heir and kin carry each of the 243 ways; the best is all-send or all-stay in <= 20% of seeds (`sealGrid(..., {carried: true})`). The lab's 13-way `carried` list is coarser and is reported separately where it disagrees.

### The valley on the same footing (reference) [measured: `valley-out.txt`, `cross-valley-out.txt`, `sg-valley-out.txt`, `gates-run-out.txt`]

careful keeps 38.8% (1000 seeds), mark +9.8 / +9.8 (seeds 1-40 / 41-80), seal 10% / 7.5%; careful+grab keeps 74.6%, mark +1.5, bought 40%. Baseline 51.8% median, inside 15..85 in 97.5%. Spread of the 13 plain ways >= 25 in 97.5%. G4 carried 0% flat. G6 72.5%, G8 100%, G9 5/5. Best by seal on the 243 grid: `[0,1,1,1,0]` (18.8%), the only way above 12.5%; 8 of 243 ways ever earn it. Pull: sending to all four instead of staying home on day 12 is worth -3.9 to the store.

---

## 2. Rank 1: The Watchtowers

- **Real-world domain.** Arms races and the security dilemma (atlas 3 and 4: arms control, launch-on-warning); any case where standing down alone is the danger and standing down together pays more than either side could take.
- **Pitch.** Two towers that stand down on the same day open the road between them; a tower that stands down alone is left thin.
- **Dials moved (exact).** D1: B 3, **C 2, S 3**, H 0 (cards read: both stood down +4 each; you alone -2; they alone +3 to you; neither 0). D4: **CUSTOM [0,1,0,1,0]**. Schooling softness **K 2** (valley 0.5; tuned, see risks). Need: **NEED_PIVOT 51, NEED_WEIGHT 0.5, MARGIN 63**. Unchanged: FOG 0.04 'lost', HOLD_LINE 0.5 on hands, founders, one arrival, 12 days.
- **Custom of the place.** `[0,1,0,1,0]`: "Never stand down first; stand down the day after they do, and only then."
- **The two choices.** *Stand down* (send a hand) / *Keep the watch* (stay home).
- **What the Mark measures.** How often the border stays open in the futures (late flow of stand-downs at least half) with your ways, against your tower having kept the old way. Unchanged machinery.
- **Hidden lesson.** The danger here is fear, not greed: the old way never goes first, and a standoff begun by one missing stand-down lasts until somebody does.
- **How best play differs from the valley (numbers).**
  - The valley's best way for the seal, `[0,1,1,1,0]` (never open first), keeps the house in **0%** of Lives here (store 62 against a need of 117; seeds 41-80) and earns no seal; in the valley on the same seeds it keeps 25% and earns the seal in 7.5% [`cross-towers-out.txt`, `cross-valley-out.txt`].
  - The last-day grab is gone: sending to all four on day 12 is worth **+0.7** here against -3.9 in the valley; careful+grab keeps the house **less** often than careful (41.3% vs 48.2%, 1000 seeds; 37.5% vs 47.5% on both 40-seed sets) and earns the seal in 5% / 0% [`ex-fear-out.txt`].
  - The old way earns half the need: custom's median store 51 against careful's 114 (1000 seeds). In the valley the custom is 6 below careful.
  - Ways that reopen after a standoff carry the land: `[1,1,0.5,1,1]` mark **+16.7** here, **-4.7** in the valley (seeds 41-80); always +13.3 / +14.0 here, -3.2 / -3.5 in the valley. Every top-5 way by mark on the 243 grid has a truce habit >= 0.5; the valley's top way has truce 0 [`ex-fear-out.txt`].
  - Day 1: going first to all four costs 3.0 that day and returns 18.1 later (valley: -3.9, +14.8).
  - **Pull by day 3.** The cards show the new numbers from the first reveal (alone -2, together +4); the custom tells the house never to go first; the meter shows the old way heading for half the need. Sending to all four on day 3 instead of staying home: -3.6 that day, +22.6 later, mark +13.0 (valley -3.9, +16.1, +6.2).
- **H5 evidence [measured].** careful keeps 48.2% (1000 seeds); seal 17.5% (seeds 1-40), 20% (41-80). Exploits: never 0% kept, mark -29.4; bully 0%, -6.2; always 16.1% kept, seal 12.5%; careful+grab cannot buy the seal (it lowers the store). Plain ways: spread >= 25 in 100% (13 carried ways and the sweep). Baseline median 57.3%, inside 15..85 in 100% / 95%. G4 carried 243: 0% flat. G6 **67.5%** (at K 1 it was 42.5%: K 2 is what passes it; HOLD_LINE 0.55 at K 1 also gives 67.5%). G8 100%, G9 5/5. G10: no way reaches 85% kept.
- **Afterword (draft, plain words).** Nations that keep weapons pointed at each other often both want to stand down, and neither wants to be first. What has eased that fear is standing down a little at a time, on both sides at once, where each can see the other do it.
- **Engine changes, by dial.** D1 `S` (3 arithmetic sites, in the proto). D4 `CUSTOM` (5 uses of `OLD_WAY` + the range list, in the proto). C, K and the need parameters already exist. Nothing else: the last-day replay still fires on the rare day-12 stay-home and simply finds it cost the house.
- **Page changes.** Opening's stakes line (+4 / -2 / +3 / 0) and the demo numbers (app 561-562); one reveal clause for the shared +3 ("the road opened"); the custom's sentence and "the old way" gloss (a 0/1 custom, so `leaveNote` works); the meter will show the old way at about half the need (need > 0, so the scale holds); the last-day paragraph will almost never appear; lexicon and sheet (towers on the ring, the road drawn between paired towers). PAGE-MAP (a) and D4: about 4 strings, 6 app lines and 10 check lines for stakes, plus the place's lexicon.
- **Risks.** (1) The need is +62 on the old way: the winter need is set by competent play, not by the custom; the design lead must accept a need sentence that does not lean on the old way. (2) No last-day trade: the valley's central sentence ("you took on the last day; it cost the valley") is absent here; the place's trade is earlier (going first costs the store now and pays the land later). (3) K 2 is a moved tunable; at K 1 the baseline sits at 70% and G6 fails (42.5%); the valley's K 0.5 was not run with these stakes. (4) Five-number ways look far better on seeds 1-16 than elsewhere (above): any balance claim on fewer than 200 seeds is unsafe. (5) The valley harness's adaptive `careful` is still the best listed way here (section 8): what changes is the old way's worth, the fixed ways worth leaving and the absence of a last-day temptation, not whether reading neighbours pays.
- **Gates it should pass.** G1-form: careful keeps 35-65% (>= 1000 seeds); careful+grab keeps <= careful. G2-form: sending on day 12 is worth >= 0 to the store. G3 spread >= 25 in >= 80%. G4 (243 carried) flat <= 20%. G5. G6 >= 60%. G7 >= 60%. G8 >= 85%. G9 >= 4. G10. H3 gate: the valley's seal-best way earns at most half the seal share of careful here. X2: seal of careful+grab <= seal of careful.

## 3. Rank 2: The Shoal (skin B: the Common)

- **Real-world domain.** Fisheries and other commons (atlas 16: hidden stock, slow recovery); shared pasture is the same machine with another skin.
- **Pitch.** Each pair of boats shares a bank of water: keep off their side and it fills; take from it and it thins for both of you.
- **Dials moved (exact).** D6: **STOCK { start 1, min 0.25, max 1.5, delta [-0.25, -0.125, +0.125] }** (both took: the bank thins by a quarter; one took: by an eighth; both kept off: fills by an eighth; a hand is worth 3 x the bank's level, the level before today's change). D1: **C 1.5** (B 3, S 0, H 0). **K 2**. Need: **NEED_PIVOT 61, NEED_WEIGHT 0.5, MARGIN 13**. Unchanged: custom [1,1,0,1,0], FOG 0.04 'lost', founders, one arrival, HOLD_LINE 0.5 on hands.
- **Custom of the place.** `[1,1,0,1,0]`: "Keep off the water of a boat that keeps off yours; fish the water of one that fished yours."
- **The two choices.** *Keep to your water* (send a hand: you leave a basket and a half in the water) / *Fish their side* (stay home).
- **What the Mark measures.** How often the grounds hold in the futures (late flow of kept-off days at least half), as now. The level is not counted (see risks).
- **Hidden lesson.** Paying a neighbour back in kind empties the water you share; the water punishes the taker for you.
- **How best play differs from the valley (numbers).**
  - Taking costs three times as much: staying home against all four on day 1 costs **35.9** measures over the Life here, 10.9 in the valley (`pull`).
  - Generosity carries the grounds: always has mark **+25.4** here (seeds 1-40), -3.2 in the valley; `[0,1,1,1,1]` (keep faith, reopen, never open first) is #1 by mark on the grid (+31.1) and has mark **-11.1** in the valley (seeds 41-80).
  - The valley's seal-best `[0,1,1,1,0]` keeps the house in 0% here (store 59.8 against about 77; grid) and is #37 by seal; the place's seal-best ways on 40 seeds are `[1,1,1,1,0]` (22.5%) and careful (17.5%) [`ex-shoal2-out.txt`].
  - The valley's trade survives, sharpened: careful+grab keeps 74.5% vs careful 48.4% (1000 seeds), mark +6.8 vs +15.7, bought 22.5%.
  - **Pull by day 3.** The bank's level on each card drops the first day anyone takes, and the card's number for a hand drops with it. Sending to all four on day 3 instead of staying home: -5.9 that day, +33.8 later, mark +10.4 (valley -3.9, +16.1, +6.2).
- **H5 evidence [measured, `ex-shoal2-out.txt`, `cross-shoal-out.txt`].** careful keeps 48.4% (1000 seeds), seal 17.5% (seeds 1-40) / 27.5% (41-80). careful+grab seal 2.5% / 5% (bought 22.5% / 25%: the seal is withheld exactly as in the valley). never 0% (mark -20.5), bully 0%, always 16.1% kept (1000 seeds), seal 15% / 10%. Spread >= 25 in 97.5% (sweep), 100% (13 carried). Baseline median 52.3%, inside 97.5%. G4 carried 243: 0% flat. G6 **80%**, G8 100%, G9 5/5.
- **Why C 1.5 [measured].** At C 1 (`ex-stock-out.txt`, `cross-shoalC1-out.txt`) always kept 33.6% (1000 seeds) and earned the seal in 20-22.5% of Lives, tying or beating every other way on fresh seeds: a trivially good naive route. At C 1.5 always keeps 16.1% and its seal falls to 15% against 22.5% for the best way (`x-shoal-always-out.txt`, `ex-shoal2-out.txt`). Slower one-sided thinning (delta[1] = -1/16) did not help (always 17.5%, best 17.5%).
- **Afterword (draft, plain words).** Fishing grounds, grazing commons and shared wells fail the same way: each take is small, the loss is shared, and answering a take with a take empties the water faster. Places that kept their commons for centuries usually let small lapses go and watched the stock together.
- **Engine changes, by dial.** D6 `STOCK` (8-9 sites, in the proto: Life, `today()`, `playDay()` results, `endState`, `scenario`, `scratch`, `simulate`). C, K, need parameters exist. Optional, not in the proto [argued, about 3 lines]: levels in `runFuture().seasons` so the Afterwards strip can draw the banks.
- **Page changes.** A gauge for the bank on each of the four cards (in the card head, PAGE-MAP (d): 90-120 app lines, 15 style, 10 strings, 25 check), and on the sheet's crossing marks; the Opening cannot promise "worth 3" ("worth 3 when the water is full"); stores are multiples of 1/8 (3 x 0.125 and 1.5): the page must round for display; the strip needs the levels if it is to show them.
- **Risks.** (1) "always" is still a decent naive route (seal 15% / 10% against 17.5% / 27.5% for careful on the two seed sets); keep the gate below. (2) Its seal-best family (`[1,1,1,1,0]`, `[1,1,0.5,1,1]`) overlaps the Watchtowers' (`[1,1,0.5,1,1]` is in both top fives): the two places differ in the pull and the trade far more than in the best five numbers. (3) The page's thirteen-way range shows all-send as the best plain way in 65% of seeds (the 243 carried grid has it #3, 0.2 points off the top): never name it. (4) The level is not in "holds": a future could hold by hands over thin water [argued; in practice levels follow hands]. (5) As in the Watchtowers, the adaptive `careful` remains the best listed way (section 8).
- **Gates it should pass.** As the Watchtowers, plus: always's seal share at least 5 points below the place's best way and its kept% <= 20% (>= 200 seeds); careful+grab bought% > 0 and seal(careful+grab) <= seal(careful) (the valley's trade must survive); stores display without fractions leaking odd digits.

## 4. Rank 3: The Salt Ring

- **Real-world domain.** Price rings and cartels (atlas 8, 10, 12: duopoly fares, leniency races, quota cheating), set among the trading houses of a salt road: this is the "trade routes" place.
- **Pitch.** Eight trading houses along the road hold one price; every day the ring holds, the towns pay more.
- **Dials moved (exact).** D3: **CHARTER 'breaks'** (the Mark counts futures in which the ring breaks, against the old way). Need: **NEED_PIVOT 57, NEED_WEIGHT 0.5, MARGIN 6**. Seal: **the end-game rule** below. Stakes, luck, founders, custom: the valley's.
- **Custom of the place.** `[1,1,0,1,0]`: "Hold the price with a house that holds it; undercut a house that undercut you."
- **The two choices.** *Hold the price* (send a hand) / *Undercut* (stay home).
- **What the Mark measures.** How often the ring breaks in the futures (late flow below half) with your ways, against the old way: the towns' side of the ledger.
- **Hidden lesson.** Trust and cartels are built the same way: the habits that make a ring last are making amends and reopening; a house that keeps faith but never forgives leaves a brittle ring behind it.
- **The end-game rule (new).** The valley's last-day replay looks only at "stayed home on day 12 after both helped". In a ring that act serves both the store and the towns, so the valley's clauses point the wrong way, and a three-day undercut earned the seal in 30-37.5% of Lives with the lab's mirrored clause [measured: `map-evidence-out.txt`, `ring3-out.txt`]. Rule: replay days 10-12 with a hand sent wherever the house stayed home **against its own habit** (a situation where it had sent at least half the time before day 10); the seal needs house kept and mark clear both as lived and as replayed. (Flipping only "after both helped" left 15% of three-day undercuts sealed, because they also stop making amends.)
- **How best play differs from the valley (numbers).** On the 243 grid the valley's best way by mark is **#243 of 243** here; careful's mark is -9.8 (valley +9.8, the same counts read backwards). The seal goes to houses that keep faith but never forgive or reopen: `[1,1,0.5,0,0]` seal 15% / 17.5% (seeds 1-40 / 41-80) with the end-game rule, `[0.5,1,0.5,0,0]` 20% / 12.5%, `[1,1,0,0,0]` 17.5% / 15%; in the valley `[1,1,0.5,0,0]` has mark -34.0. Sending on day 3 lowers the towns' mark by 6.2 points (valley: raises it by 6.2) [`ring3b-out.txt`, `ex-ring0-out.txt`, `cross-ring-out.txt`].
- **Pull by day 3.** The store's numbers are the valley's (-3.9 that day, +16.1 later for holding with all four on day 3); what is different is that the Opening and the Chronicle count the towns, so every hand that fills the store is felt as a hand that strengthens the ring.
- **H5 evidence [measured].** careful keeps 48.0% (1000 seeds), seal 0% (it holds the ring). never: towns' mark +34.2 but 0.7% kept. 1-day grab: kept 81.7-85%, seal 0% under the rule. 2- and 3-day undercuts: seal 5-10% under the rule (37.5% without it) against 12.5-20% for the honest grim ways: **the leak is halved, not closed**. Spread >= 25 in 97.5-100%; baseline inside 15..85 in 97.5% (the valley's counts). G6 72.5%, G8 100%, G9 5/5. G4 in the valley's form fails by construction (never is the towns' best way); in its seal form it passes (the seal-best ways are not flat; never earns 0%).
- **Why not S > C [measured].** With S 1.5-2 (so that undercutting never pays) 0 of 243 ways earned the seal on any of 16 seeds at the 50% need, and 2 of 243 on one seed at a 75% need (`sg-ring-out.txt`): store and towns are then perfectly opposed.
- **Afterword (draft, plain words).** Sellers who agree on a price build their ring out of the same things neighbours build trust from: keeping faith and making amends. Rings come apart when members stop forgiving one another, which is why the law offers the first to step out a pardon.
- **Engine changes, by dial.** D3 inside `verdict()` (not in the proto; about 5 sites: `held`, `levelOf`, the mark, rank/best/worst, the seal's sign) [argued, sites from ENGINE-MAP]. The end-game rule (not in the proto; a generalisation of `replayLastDay` that replays from the state before day 10 with a per-situation habit test; about 25-35 lines) [argued size; behaviour measured in the lab by replaying the Life with a script]. Need parameters exist.
- **Page changes.** PAGE-MAP (b): about 20 strings, 15 app lines, 15 check lines; the strip's line and its good side from the place; the last-day paragraph rebuilt around "the last days"; the towns drawn outside the ring on the sheet (who watches whom).
- **Risks.** (1) The seal leak (5-10%). (2) The heaviest engine work of the four, all in `verdict()`. (3) Moral framing: the Chronicle must report counts, not praise undercutting. (4) Every honest instinct the valley taught scores negatively here; first-time players will feel cheated unless the Opening states the charter plainly.
- **Gates it should pass.** G1-form; G3; G5; G6; G7 (on the inverted reading); G8; G9; G4 in seal form; X2-form: the seal share of careful+grab2 and careful+grab3 at most half that of the best honest way; the end-game rule never withholds the seal from a way that is constant over the Life (test: every 0/1 way on the 243 grid has caught% 0).

## 5. Rank 4 (conditional): The Narrow Bridge

- **Real-world domain.** Carters on a one-lane bridge on the trade road; any good that works only if people take turns (rotas for water, crossing, airtime). In the dilemma family this is "chicken with turns" (T 3 > R 0 > S -1 > P -2 and T + S > 2R).
- **Pitch.** If both carts wait, nobody crosses; if both go, they lock wheels; someone has to go first, and it had better not always be the same one.
- **Dials moved (exact).** D1: B 3, C 1, **S -2, H 2** (both wait 0; you wait alone -1; you go while they wait +3; locked wheels -2 each). New charter count **FLOW_KIND 'one'**: a tie-day counts when exactly one cart crossed. D9: **FOUNDERS { near: ['taker', 'taker', ['firm','wary','steady']] }** (two bullies near: a founding taker never gives way). Need: **NEED_PIVOT -38, NEED_WEIGHT 0.5, MARGIN 24** (strict turn-taking keeps half). Seal: the Salt Ring's end-game rule, window day 12 only. Unchanged: K 0.5, FOG 0.04 'lost', HOLD_LINE 0.5, one arrival.
- **Custom of the place.** `[1,1,0,1,0]`, the valley's: "Give way to whoever gives way to you." Here it jams the bridge (both wait forever), which is the point.
- **The two choices.** *Give way* (send a hand) / *Drive on* (stay home).
- **What the Mark measures.** How often the bridge keeps moving (late share of tie-days on which exactly one cart crossed, at least half).
- **Hidden lesson.** Where both giving way is as useless as neither, kindness answered with kindness jams the road: a convention of turns has to form, and copied habits collide.

### 5a. Evidence [measured: `bridge-out.txt`, `bridge2-out.txt`, `bridge3-out.txt`, all on `engine-proto-bridge.js`]

- **Honest ways.** Strict turns `[1,0,0,1,1]` (give way to someone new; after both waited, drive on; after you waited and they drove, drive on; after you drove and they waited, give way; after locked wheels, give way) keeps the house in 49.6% of 1000 seeds; turns with a coin after both waited `[1,0.5,0,1,1]` 45.0%; always 4.5%; never, the custom and bully 0%.
- **Seeds 41-80, 150 futures.** Coin turns: mark +16.4, seal 32.5% (end-game rule; engine rule 27.5%). Strict turns: +8.3, 20%. `[1,0,0,1,0.5]` (half a turn after locked wheels): +28.1, 32.5%. Driving on everywhere on day 12: strict+grab 17.5%, coin+grab 20% (no gain over honest play; caught 0-7.5%). careful (the valley's competent way): 0% kept, mark -9.9. The valley's seal-best `[0,1,1,1,0]`: 0% kept, mark -13.8. always: 2.5% kept, mark -20.7.
- **Pull by day 3.** From the first reveal the house sees that both waiting earns nothing and both driving on costs 2; by day 2 the custom (give way to whoever gives way) has jammed every polite neighbour. Driving on to all four on day 1 instead of giving way (coin turns elsewhere): +2.7 that day, -2.5 later.
- **Afterword (draft, plain words).** Where only one can go at a time (a narrow bridge, a single well, one track) both waiting is as useless as both pushing. Such places run on turns, and on a custom that says whose turn it is.
- **H3** is passed by the widest margin of any place: every valley way listed keeps the house in 0% of Lives here, and the custom, which in the valley is the reference, jams the bridge.
- **H5.** Honest keeps 35-65% (tuned). Plain ways >= 25 apart in 95% (sweep) and 92.5% (13 range ways + 3 turn ways carried). Baseline median 28.7%, inside 15..85 in 70%. Best carried way flat in 0% of seeds. Seal earnable (12.5-32.5% across the turn ways), not bought by driving on at the end.
- **Why two bullies [measured].** With the valley's founders, strict turns earned the seal in 47.5% of Lives at their own 50% need and 25 of 243 ways earned it in 44-62% of 16 seeds: a recipe, found once, wins. Two bullies near bring the simple recipe down to 20% and make the habit after locked wheels decide (12.5% to 32.5%).
- **Failures, as measured.** G6 22.5% (forgiving's habit that mattered moves holds by >= 5 points; forgiving is a valley policy that jams here, so the gate should be re-run with turn-taking: not done). G8 100%, G9 5/5. **Every store is below zero** (need -12.8 on average; PAGE-MAP: a need at or below zero breaks the meter's scale, app 672, and the saved entry, app 173). B 4 lifts stores to about zero but lets always keep the house in 41.7% (rejected).
- **Engine changes, by dial.** D1 `S`, `H` (in the proto); D9 `FOUNDERS` (in the proto); `FLOW_KIND 'one'` (2 lines, measured: the futures count tie-days with exactly one hand); the end-game rule shared with the Salt Ring (not in the proto). The engine's own last-day replay must be switched off here: it reads "drove on after both waited" as greed, and that is the turn-taking act (it fires in 25-40% of honest Lives).
- **Page changes.** Negative stores (meter drawn from a negative floor, saved lives with need <= 0); stakes line with four numbers; the reveal for "both waited" and "locked wheels"; the strip's rule ("exactly one cart crossed"); lexicon and sheet (a bridge on each tie).
- **Risks.** Balance rests on 40-seed sweeps and two founder settings; G6 unmeasured with the right policy; the stores; and the dilemma is chicken-with-turns rather than the strict dilemma (T > R > S > P with T + S > 2R).
- **Gates.** As the Watchtowers, with G6 measured on turn-taking, plus: no single five-number way earns the seal in more than 40% of Lives; driving on at the end earns no more seal than honest turn-taking; the custom's store is the lowest of the honest ways.

## 6. Reserve 1: The Fog Line

- FOG 0.10 'lost', ARRIVALS 0, need pivot 47 / margin 9. Passes the H5 list: careful keeps 51.2% (1000 seeds), seal 35% / 22.5%; careful+grab bought 12.5-17.5%; spread >= 25 in 95-97.5%; baseline inside 80-92.5% [`ex-fog-out.txt`, `cross-fog-out.txt`].
- **Fails H3 [measured].** On fresh seeds 41-80 the valley's seal-best `[0,1,1,1,0]` earns the seal in 15% here (careful 22.5%); the 16-seed grid had shown win-stay-lose-shift ways on top (`[0,1,0,0,1]` 25%), but on seeds 41-80 that way earns 10%. At FOG 0.08 G6 passes (67.5%) but the valley's best way is again the best (seal 30%) [`x-fog3-out.txt`]. **G6 fails at 0.10 (47.5%).** A reopening custom `[1,1,0,1,1]` made it worse (careful mark +3.3). Two sides (`SIDES`) pushed the baseline to 8-21%.
- What would make it a place [argued]: noise of another kind ('unseen': the hand arrived and paid but was not seen) changes what the person knows rather than the odds, which is qualitatively different; its cost is on the page (the store reveals the truth, ENGINE-MAP D2) and it was not tuned here (one run: baseline 15.8%, inside 55%).

## 7. Reserve 2: The Trade Road (strangers)

- Variants run: stranger in the Life (days 5 or 9; taker/wary/soft/firm), 3 or 5 arrivals in the Afterwards (takers or a mixed newcomer), B 5 C 2, a wary custom, two takers near (`x-road-out.txt`, `ex-road-out.txt`, `sg-road-out.txt`, `x-road2-out.txt`).
- **Fails H3 in all of them [measured].** On the 243 seal grid (T6: B5 C2, 5 mixed arrivals) the valley's seal-best `[0,1,1,1,0]` and best-by-purse `[1,1,0.5,1,0]` are **#1 and #2**. With two takers near, `[0,1,1,1,0]` earns the seal in 27.5-40%, and the only way above it in every variant is the valley harness's own `cold` policy: the best play is the valley's best play. The stranger arrives on day 5 or 9, after the day-3 window H3 names.
- What might fix it [argued, not run]: more than one stranger per Life starting by day 3 (TURNOVER supports one), or an end not known in advance (D5c, about 25 engine lines, not in the proto), which would make the timed grab a gamble.

## 8. Cross-place evidence on fresh seeds (41-80, 200 futures) [measured: `cross-*-out.txt`]

Seal share / kept share / mark, same ten ways in every place (five-number ways are lived with keyed draws).

| way | Valley | Watchtowers | Shoal | Salt Ring | Fog Line |
|---|---|---|---|---|---|
| careful | 7.5 / 37.5 / +9.8 | **20.0** / 47.5 / +14.3 | **27.5** / 45.0 / +15.7 | 0.0 / 45.0 / -9.8 | **22.5** / 50.0 / +13.8 |
| valley best `[0,1,1,1,0]` | **7.5** / 25.0 / +13.2 | 0.0 / 0.0 / +15.0 | 2.5 / 2.5 / +20.8 | 0.0 / 25.0 / -13.2 | 15.0 / 20.0 / +16.1 |
| `[1,1,0.5,1,1]` | 0.0 / 10.0 / -4.7 | 5.0 / 7.5 / +16.7 | 5.0 / 5.0 / +26.6 | 0.0 / 10.0 / +4.7 | 5.0 / 12.5 / +9.3 |
| `[1,1,1,1,0.5]` | 0.0 / 5.0 / -2.4 | 5.0 / 7.5 / +13.7 | 12.5 / 15.0 / +22.2 | 0.0 / 5.0 / +2.4 | 5.0 / 7.5 / +7.3 |
| `[1,1,0.5,0,0]` | 0.0 / 20.0 / -34.0 | 0.0 / 0.0 / -24.8 | 0.0 / 5.0 / -19.8 | **20.0** / 20.0 / +34.0 | 0.0 / 5.0 / -29.4 |
| always | 0.0 / 5.0 / -3.5 | 5.0 / 7.5 / +14.0 | 10.0 / 12.5 / +22.7 | 0.0 / 5.0 / +3.5 | 5.0 / 7.5 / +5.6 |
| careful+grab | 0.0 / 72.5 / +1.4 | 0.0 / 37.5 / +6.5 | 5.0 / 75.0 / +7.6 | 0.0 / 82.5 / -1.4 | 10.0 / 72.5 / +8.6 |

The Salt Ring column uses the engine's seal with the lab's mirrored one-day clause; with the end-game rule `[1,1,0.5,0,0]` is 17.5% on these seeds. The Shoal column is the proposed C 1.5 setting; the earlier C 1 setting is in `cross-shoalC1-out.txt` (always 22.5%, tied for the top: the reason for C 1.5). The Narrow Bridge is not in this table (it needs `engine-proto-bridge.js`); its fresh-seed numbers are in 5a.

Reading the table. In the Watchtowers, the Shoal and the Salt Ring the valley's best fixed way earns at most a tenth of the seal share of the place's competent way (0, 2.5 and 0 against 20-27.5); in the Fog Line it earns two-thirds (15.0 against 22.5), which is the H3 failure. A caveat the table also shows: `careful`, the valley harness's adaptive policy (read the neighbours, never take on purpose), is the best listed way by seal in the valley, the Watchtowers, the Shoal and the Fog Line, and fails only in the Salt Ring (0%) and on the Bridge (0% kept). So in the Watchtowers and the Shoal what changes is which fixed ways a competent house should leave behind, which act tempts it and what the old way is worth, not whether reading one's neighbours pays. If the design lead reads H3 as "competent valley play must not be competent play there", only the Salt Ring and the Bridge pass it.

## 9. If only three can be built

Cut **the Narrow Bridge** first: it is the only one that needs a new count in the futures, a place-specific seal window, its own founders and a page that copes with negative stores, and its balance rests on fewer runs than the others. Then, if a second cut were forced, **the Salt Ring** (all of its engine work is in `verdict()`, and its seal leak is halved, not closed). The Watchtowers and the Shoal use only dials the proto already has, and pass every gate measured.

## 10. Engine changes in one place (H4: the valley stays bit-identical)

| Change | Places | In the proto | Size | Valley-safe because |
|---|---|---|---|---|
| D1 `S`, `H` (and `B`, `C` as params) | Watchtowers, Shoal (C), Bridge | yes | 3 sites | default adds exact zeros (identity.js: 0 differ) |
| D4 `CUSTOM` | Watchtowers | yes | 5 sites + range | default is `[1,1,0,1,0]` |
| D6 `STOCK` | Shoal | yes | 8-9 sites | state exists only when on |
| D9 `FOUNDERS` | Bridge | yes | 3 sites | valley path untouched |
| `K`, need parameters | all | already params | 0 | - |
| `FLOW_KIND 'one'` | Bridge | **no**; measured on `engine-proto-bridge.js` | 2 lines | new branch only when asked; 60 JSON comparisons against the proto (valley + 4 settings), 0 differ (`identity-bridge-out.txt`) |
| D3 inside `verdict()` | Salt Ring | **no** | about 5 sites [argued] | branch on the charter |
| End-game replay "against your own habit" | Salt Ring, Bridge | **no**; measured in the lab by scripted replay | about 25-35 lines [guess] | a place option; the valley keeps `replayLastDay` |
| Levels in `runFuture().seasons` | Shoal (optional) | no | about 3 lines [argued] | only when stock is on |

Run `identity.js` against the extended engine as the H4 gate.

## 11. Measured vs argued

Measured: every table row above, with its file. Argued: the size of every unbuilt engine change; why a 0/1 way on the grid never trips the end-game rule (checked only on the ways listed); the page sizes (from PAGE-MAP); that hands and levels move together in the Shoal; the fixes offered for the reserves. Not run at all: the valley harness (G1-G10) on any place as a whole; a page; the end-game rule inside the engine (only its lab equivalent); G6 for the Salt Ring with the end-game rule (it does not touch what-ifs); any place on more than 80 seeds for the mark.

## 12. Files

`common.js` (examine, tuneNeed2, sealGrid), `explore.js`, `gates.js`, `places.js` (the exact overrides), `ring3.js` / `ring3b.js` (end-game rule), `bridge.js`, `bridge2.js`, `bridge3.js`, `engine-proto-bridge.js` (proto + 2 lines), and every `*-out.txt`.

## 13. Open questions for the design lead

1. **H3's reading.** The valley harness's adaptive `careful` is still the best listed way in the Watchtowers and the Shoal (what differs there is the old way's worth, the fixed ways worth leaving and the tempting act). If H3 means "competent valley play must not be competent play there", only the Salt Ring and the Bridge pass.
2. **The Watchtowers' need** sits 62 above a custom that never goes first. Accept a need led by competent play, or give the need its own reference way per place (an engine change, not costed)?
3. **K per place** (2 in the Watchtowers and the Shoal): accept K as a place dial? Both fail a gate at K 1 or less (G6 in the Watchtowers; G7 margins in the Shoal).
4. **The Salt Ring's end-game rule** leaves 5-10% of end-game undercuts sealed. Accept, or try a longer window or a stricter habit threshold (not measured)?
5. **The Bridge's stores are all below zero.** Shift the page's meter (store against the need, from a negative floor) or add a daily base to the stakes (not a dial)? G6 must be re-measured with turn-taking.
6. **Noise** was promised to the user and the Fog Line fails H3. Make noise a secondary twist inside one of the four (for example FOG 0.08 in the Watchtowers as false alarms: not measured), or wait for 'unseen' luck and the page decision it forces?
7. **The Shoal's charter**: count the bank's level in "holds" (about four lines in the futures, not measured) instead of hands?
8. **The Shoal's range list**: add `[0,1,1,1,1]` and `[1,1,1,1,0.5]` so that all-send is not the best plain way in 65% of seeds?
