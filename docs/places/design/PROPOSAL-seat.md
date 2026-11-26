> **Record of its time.** Written 2026-11-25 08:58 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Four new Places, seen from the seat

Folder: `<scratch>/places/propose-seat/`

Angle: start from the chair. Each place below is written from what the person sees on the cards, the sheet and the Chronicle. Every pull described is checked in the lab, and every number is marked **[measured]** or **[argued]**.

## 0. Summary

| Rank | Place | Domain | What pulls by day 3 | Main dials | New engine work |
|---|---|---|---|---|---|
| 1 | **The Banks** | fishing grounds (a skin for shared pasture too) | The water you share shows its worth on the card. Answering a slip in kind empties it, so letting a slip go pays your own store here. | D6 stock, charter by stock, D5 two arrivals | `FLOW_KIND 'stock'` (4 lines), levels in `runFuture().seasons` (about 3 lines) |
| 2 | **The Bridges** | trade road: carters at single-lane bridges | The valley's own old way ("after you") waits for ever, or jams for ever. Only taking turns pays. | D1 S −2, H 3, charter "one crossed", the place's own range | `FLOW_KIND 'one'` (2 lines), `REPLAY_SITS` (1 line), a starting store (2 lines) |
| 3 | **The Saltmarket** | price ring (guild of salt sellers) | Holding the price together pays more than cutting it, and the town pays for it every day. | D1 S 2, D3 inverted charter, D4 custom "always hold", K 2 | inverted verdict (range, rank, level), `REPLAY_FLIP` (1 line) and its seal clause |
| 4 | **The Watch** | arms race at a border | There is nothing to take, only something to fear. A fire on their tower is often a shadow. | D1 C 2, S 3, D2 FOG 0.08 (false alarms), D4 wary custom | none |
| R1 | The Crossroads | trade road of strangers | A stranger takes a neighbour's place before day 3, and three more come afterwards. | D5 turnover and arrivals, B 4 | turnover already in the proto (one stranger) |
| R2 | The Two Shores | who learns from whom | Ways cross the river only one way: your shore copies your shore. | D7 sides, D9 far founders | kin on your side (1 line), seats by side |

Between them the four honour what the user was told:
- **fishing grounds and shared pastures:** the Banks.
- **trade routes:** the Bridges, with the Crossroads in reserve.
- **arms races:** the Watch.
- **twists on cost:** the Bridges (S −2, H 3), the Watch (C 2, S 3) and the Saltmarket (S 2).
- **noise:** the Watch's false alarms at 8%, and the Banks' drifting nets.
- **who watches whom:** the Saltmarket's town, which pays and never sits at the table, and the Watch's towers.

Each one breaks a different valley habit:
- **The Banks:** forgiving a lapse pays your store, where in the valley it costs you a little.
- **The Bridges:** the valley's competent way keeps the house in 0% of Lives.
- **The Saltmarket:** the competent way is the town's problem.
- **The Watch:** the last-day grab loses the house points instead of winning them.

### What was run

All runs use the lab, on `engine-seat.js` in this folder. That file is the lab's `engine-proto.js` plus four small patches (`make-seat.py`):
- `FLOW_KIND 'one'`
- `FLOW_KIND 'stock'`
- `REPLAY_SITS`
- `REPLAY_FLIP`

At the existing measures it gives the same verdicts as `engine-proto.js` (`idcheck.js`: 16 verdicts over 4 settings, 0 differ [measured]). That is a light check, not the 337-Life identity run.

Script outputs, unedited:
- `gates-*-out.txt`: 40 seeds x 200 futures sweeps, 2000-seed store runs, carried ways, best way, pulls, and the G6, G8 and G9 forms.
- `pulls2-out.txt`: pulls by situation, 120 seeds x 150 futures.
- `bridge3-out.txt`, `ring2-out.txt`, `fish*-out.txt`, `tower1-out.txt`, `reserves-out.txt`: the tuning history.

A mean mark over 40 seeds carries a standard error of about 2 to 3 points (printed as `+-sem`). Kept percentages quoted "on 2000 seeds" come from Lives played without futures.

The ways a place is judged by are written for that place (`places.js`): `take-turns` and `push-the-polite` for the Bridges, `mender` for the Banks, `one-strike` for the Saltmarket. Valley ways are reused where they are fair.

The counts in the example Chronicle sentences below are the honest way's 40-seed mean holds and baseline, scaled to 2000 futures. They show the shape of the sentence; they are not one Life's verdict.

### What was not run

- The full valley harness for any place.
- G6 at 1000 futures. It was run at 300; those numbers are marked.
- Determinism checks on the four new patches. They take no draws, but this was argued, not run.
- Any page code.
- The sheet drawings, the page sizes and the extra word counts. These are all argued.
- The walkthroughs below are real Lives (named seed and way). The card wording is proposed, not built.

---

## 1. The Banks (fishing grounds)

**Pitch.** Eight boats share a cove. The water between each pair of neighbours is a bank whose worth shows on the card. Keep off each other's water and it fills; answer a slip in kind and you empty it together.

**Real-world domain.** Inshore fisheries with unwritten lines between grounds. The same skin works for common grazing, shared wells and woodlots.

### Rules

**Dials moved (exact):**

| Dial | Setting |
|---|---|
| D6 stock | `STOCK: { start: 6, min: 2, max: 9, delta: [-3, 0, +1] }` with `B: 1`, so a bank's level is worth that many baskets |
| D1 cost | `C: 2` (baskets) |
| Copying scale | `K: 1`. Incomes are counted in baskets, about two to a valley measure, so this is the valley's 0.5. |
| Charter | `FLOW_KIND: 'stock'`, `HOLD_LINE: 6` |
| D5 | `ARRIVALS: 2`, `ARRIVE_FROM: 3`, `ARRIVE_TO: 15` |
| Need | `NEED_PIVOT: 172`, `NEED_WEIGHT: 0.5`, `MARGIN: 30` [measured, 2000 seeds] |

Every number on the page is a whole basket [measured: the stock moves in whole steps]. Earlier settings in eighths of a measure gave the same picture but printed fractions (`fish2-out.txt`, `fish4-out.txt`).

**The custom of the place:** `[1, 1, 0, 1, 0]`. "The old rule of the cove, which is to keep to your water with a new neighbour and then fish as they fished the day before." It is the valley's own rule, and here it is the destructive habit.

**What the Mark measures.** The cove holds in a future if, over its last ten seasons, the banks between boats are worth at least 6 baskets on average: as much as when you came. This counts the ground, not the politeness.

**Hidden lesson.** The ground remembers. Paying back in kind empties the water you share, so a slip let go is worth more here than anywhere.

### Words

| Atom | The Banks |
|---|---|
| actor | boat ("the Rusk boat"); kin "your sister's boat"; "your heir" |
| send / stay | **Keep to your water** / **Fish across** |
| unit, store | baskets; "Winter store" stays |
| the extra state | the bank: a whole number from 2 to 9 on each of your four ties |
| luck | drift: "Your nets drifted across the line in the night. They saw only nets in their water." This costs you nothing and costs them the bank's worth. It is the valley's "lost" kind, unchanged. |
| span, place | twelve days of fishing; the cove |
| custom | "the old rule of the cove" |
| charter | the cove holds / the cove fails; "the banks were worth at least 6" |
| far line | the headland, which hides the far three boats |

**Outcome sentences.** No sentence says whether a missing restraint was luck or choice.

| Outcome | Card |
|---|---|
| Both kept off | "Both boats kept to their own water. +5. The bank fills to 8." |
| You kept off, they fished across | "You kept to your water. Their nets were in yours. −2. The bank stays at 7." |
| They kept off, you fished across | "Their nets stayed out of yours. Yours were in theirs. +7." |
| Both fished across | "Both boats had nets across the line. 0. The bank falls to 4." |

**Opening, line 3:** "Keeping to your water costs you 2 baskets. When they keep to theirs, your water is worth what the bank between you holds: 6 to begin with. Both keep to their water and the bank fills by one; both fish across and it loses three."

### The first three days

Life 11, played by `mender` (trace `trace.js -- fishing 11 mender` [measured]). Need 201; the old rule would land 171. The four neighbours:
- the Rusk boat (east)
- the Ansel boat (north-east)
- the Brix boat (north-west)
- your sister's boat, the Hale boat (west)

**Day 1.** Every card reads "You have not fished beside them yet. The bank: 6." Under the store: "The old rule of the cove, which is to keep to your water with a new neighbour and then fish as they fished the day before, would land 171 this season." You keep to your water with all four.
- Rusk, Ansel and your sister: "Both boats kept to their own water. +4. The bank fills to 7."
- Brix: "You kept to your water. Their nets were in yours. −2. The bank stays at 6."
- "Today: +10. Winter store: 10 of 201 baskets."

*The surprise:* the number on the card moved. Trust has a level.

**Day 2.**
- Rusk and Ansel: +5, and their banks reach 8. The same act now pays one more.
- Brix: −2 again.
- Your sister's card: "You kept to your water. Their nets were in yours. −2. The bank stays at 7."

*The surprise:* your sister. The page does not say whether it was drift. In this Life it was.

**Day 3: the pull.**
- Your sister's card reads "Yesterday you kept to your water. Their nets were in yours."
- The old rule, quoted under your store, says fish across hers today.
- *What tempts:* fishing across her water pays +7 if she keeps to hers, which by the old rule she will.
- *What the cards let you see:* the Rusk bank stands at 8 and pays more every day. If you answer your sister in kind, the two of you fall out of step. One boat loses 2 and the other takes 7, turn about, and her bank stops at 7 while Rusk's climbs to 9. On a day you both have nets across, the bank drops by three.

`mender` keeps to its water with her: +5, and the bank goes to 8. With Brix it fishes across: +6 on a rare day Brix kept off. Today: +23.

Day 4, for the drift: "Your nets drifted across the line in the night. They saw only nets in their water." Brix's nets were in yours too, and that bank fell from 6 to 3 on an accident.

**Is the pull real? [measured, `pulls2-out.txt`, 120 seeds, `careful`]**
- **Keeping off again after they fished across (day 3):**
  - Store: −2.0 baskets that day, +2.7 in all (about +1.3 measures).
  - Mark: +3.3.
  - In the valley the same act is −0.1 in all and +3.8 on the mark.
  - Forgiving pays your store here.
- **Fishing across after both kept off (day 3):**
  - Store: +4.5 that day and −31.6 over the days after.
  - In the valley: +2.3 and −8.5.
  - Taking early costs about four times as much.
- **Reopening after both fished across (day 3):**
  - Store: −2.1 in all.
  - Mark: +4.3.
  - In the valley: −0.6 in all, mark −1.9.
  - Reopening helps the cove and hurts the valley.

### Sheet, Chronicle, afterword

**Sheet.**
- The ring of eight holdings becomes moorings round a cove.
- Each of your four ties crosses a band of water. Where the valley draws the ford mark, a gauge of up to nine pips shows the bank's level, by count of pips, not by colour.
- The headland replaces the ridge, with its hachures.
- In the Afterwards every tie is shaded by its bank level, season by season.

**Chronicle.**
- **House:** "Kept: 210 of 207 baskets." / "Not kept: 199 of 207 baskets."
- **Mark:** "With you, the cove held in 1444 of 2000 futures. Had your boat kept the old rule: 1230 of 2000." Then "Your mark: +11." The rule line: "A future counts as held if, in its last ten seasons, the banks between boats are worth at least 6 baskets on average, as much as when you came."
- **The last day:** the valley's sentence with the place's verbs. "On the last day you fished across the Rusk boat's water, after both boats had kept to their own…"
- **Seal:** "Boat kept, banks full."

**Afterword.** "On many coasts, fishing families keep unwritten lines between their grounds, and a ground fished hard from both sides can take years to fill again. Common grazing, shared wells and woodlots work the same way: what is taken in a quarrel is lost to both sides for seasons after."

### How best play differs from the valley [measured]

| Way | Kept, 2000 seeds | Mark, 40 x 200 | Seal | Bought on the last day |
|---|---|---|---|---|
| custom | 0% | 0 | — | — |
| careful | 45.1% | +10.8 | 10% | — |
| mender (forgives one slip, gives up after three) | 48.1% | +13.1 | 17.5% | — |
| `[1,1,0.5,1,1]` | 19.5% | +20.9 | — | — |
| always | 26.1% | +9.5 | — | — |
| careful+grab | 68.2% | +3.3 | — | 27.5% of Lives |
| never | 0% | −25.4 | — | — |

- **Baseline:** median 68.5%; inside 15..85 in 82.5% of seeds.
- **Spread among the listed ways:** at least 25 points in 85% of seeds.
- **Ways carried by heir and kin:** best `[1,1,0.67,1,0.67]`. The best is all-send or all-stay in 0% of seeds.
- **Best lived way by mark:** `[0.5,1,0.5,1,1]` and `[1,1,0.5,1,1]`. These always reopen after both fished across and forgive half of all slips. The valley's best by mark is `[0,1,1,1,0]`, which never reopens.
- **Best by store:** `[1,1,0.5,1,0]`.
- **The last-day grab:**
  - Store: +7.7 baskets.
  - Mark: costs 11.2 points (valley 9.4), because the heir inherits the banks as you left them.
  - Kept: +23 points (45.1% to 68.2%).

### Engine changes

| Dial | Change | Status |
|---|---|---|
| D6 stock | as in the proto | built |
| Charter | `FLOW_KIND 'stock'` | 4 lines, built in `engine-seat.js` |
| D6 stock | levels in `runFuture().seasons[s]` per tie, for the Afterwards strip and shading | about 3 lines, not built |
| D5 | two arrivals | proto |
| Need | the place's pivot and margin | parameters |

### Page changes [argued; sizes are page-map guesses]

- The lexicon, about 150 strings, with the four outcomes and their bank clauses.
- A gauge in each card's head beside the bearing. The page map says a new line on every card costs about 36 px on a laptop, where 15 px are spare.
- The Opening's third line cannot promise "worth 3".
- The strip's line at 6 on a 2..9 scale, in place of 0.5 on 0..1.05 (app.js 1295, 1298, 1381, 1382).
- Bank shading in `drawSeason30`, about 15 lines.
- `mapAltDay` gains the level.
- One key item for the gauge.

### Risks

- The baseline sits high (median 68.5%) and the "not a lottery" gate passes at 82.5%. One more arrival lowers it (measured on the eighths setting, `fish4-out.txt`).
- `always` has a respectable mark (+9.5). It keeps only 26% of houses, so it is not a trivial way, but a reviewer may read the place as "be generous".
- Stores are about three times the valley's in size (about 200 baskets).
- The gauge has to fit in the card head.
- G6 at 300 futures: 11 of 20 Lives (55%), under the valley's 60% gate. Not established at 1000 futures.

### Gates it should pass

- **G1:** careful or mender keeps 35..65 [45.1, 48.1 ✓]; careful+grab at least 12 points above careful [68.2 ✓].
- **G2:** the grab costs at least 4 points of mark [7.5 ✓].
- **G3:** spread [85% ✓].
- **G4:** carried best not flat [100% ✓].
- **G5:** determinism with stock on (proto check passes; the new measure takes no draws [argued]).
- **G6:** at 1000 futures [not run].
- **G7:** [82.5% ✓]. **G8:** [100/100 ✓]. **G9:** [5 of 5 ✓]. **G10:** [✓ on the listed ways].
- **X2:** the seal is withheld when bought on the last day [27.5% caught ✓].
- **Place gate B1:** keeping off after being fished across is worth at least 0 to the store on day 2 or 3 [+1.6, +2.7 ✓].
- **Place gate B2:** the mark counts banks, not hands. The best lived way by mark reopens after both fished across.

---

## 2. The Bridges (trade road)

**Pitch.** Carters meet at single-lane bridges on the salt road. The valley's own old way ("let a stranger cross first, then do as they did") waits at every bridge for ever, or jams for ever. Only taking turns moves the road.

**Real-world domain.** Single-track bridges and roads, merging lanes, shared radio channels: anywhere one lane serves two directions.

### Rules

**Dials moved (exact):**

| Dial | Setting |
|---|---|
| D1 stakes | `S: -2, H: 3`, with B 3 and C 1. The four outcomes on the card are −1, 0, +3, −3. |
| Charter | `FLOW_KIND: 'one'` (share of tie-days on which exactly one cart crossed), `HOLD_LINE: 0.5` |
| The place's own range | `RANGE_WAYS: [[1,1,1,1,1],[0,0,0,0,0],[1,1,0,1,0],[1,1,0,1,1],[1,0,0,1,1],[1,0.5,0,1,1],[0.5,0.5,0,1,0.5],[1,0.5,0,1,0.5],[0,0,1,0,1],[0,0,1,0,0.5],[1,1,0,0,1],[0.5,0.5,0.5,0.5,0.5],[1,0.5,0.5,1,0.5]]`. The valley's thirteen are all bad here; their spread is only 17.7 points [measured]. |
| Last-day replay | `REPLAY_SITS: [3]`. The replayed temptation is driving on when they gave way to you the day before (their turn), not after both waited. |
| Need | `NEED_PIVOT: -25`, `NEED_WEIGHT: 0.5`, `MARGIN: 36` [measured] |
| Starting store | `STORE_START: 40` (proposed; the custom's median store is −25 without it [measured]) |

**The custom of the place:** `[1, 1, 0, 1, 0]`, the valley's own. "The old way of the road, which is to let a stranger cross first and then do as they did the day before." Two such carts wave each other on for ever. Against one that came on, it comes on for ever and jams.

**What the Mark measures.** The road moves in a future if, over its last ten seasons, at least half of all meetings at the bridges end with one cart crossing while the other waits.

**Hidden lesson.** Politeness and stubbornness fail the same way when everyone has the same habit. What works is a turn, and a way to break a tie.

### Words

| Atom | The Bridges |
|---|---|
| actor | house ("the Rusk house"); carts on the road |
| send / stay | **Give way** / **Drive on** |
| unit, store | loads; "your yard" |
| luck | a balking mule ("lost"): "Your mule would not stand, and your cart came on. They saw only that you came on." |
| place | the salt road; four bridges |
| custom | "the old way of the road" |
| charter | the road moves / the road stops |

**Outcome sentences.**

| Outcome | Card |
|---|---|
| Both gave way | "You both waved the other on. Nobody crossed. 0." |
| You gave way, they came on | "You gave way. Their cart crossed. −1." |
| They gave way, you came on | "They gave way. Your cart crossed. +3." |
| Both came on | "Both carts came on. The bridge jammed. −3." |

**Opening, line 3:** "Giving way costs you 1 load. Crossing while they wait brings you 3. If you both give way, nobody crosses. If you both drive on, the carts jam and each loses 3."

### The first three days

Life 11 (traces `trace.js -- bridge 11 custom` and `-- bridge 11 turns` [measured]). The four neighbours:
- the Rusk house (east)
- the Ansel house (north-east)
- the Brix house (north-west)
- your sister's house, the Hale house (west), which keeps the old way

**Day 1.** Every card reads "You have not met them at the bridge yet." The old way, quoted under your yard, says let a stranger cross first. You give way to all four.
- Rusk, Ansel and your sister: "You both waved the other on. Nobody crossed. 0."
- Brix: "You gave way. Their cart crossed. −1."
- "Today: −1."

*The surprise:* courtesy earned nothing at three bridges.

**Day 2.** The old way says do as they did.
- Wave again at Rusk and Ansel: 0, 0.
- Your sister's cart came on (a balking mule in this Life; the card cannot say): −1.
- Drive on at Brix, as they did: "Both carts came on. The bridge jammed. −3."
- "Today: −4."

**Day 3: the pull.**
- Two cards read "Yesterday you both waved the other on." Nobody gains while both wait. Going first pays 3 if they wait and costs 3 if they come on too.
- The Brix card reads "Yesterday both carts came on." The old way says come on again, which means another −3.
- The person feels both failures of one rule on the second day: endless waiting with the polite, endless jams with the pushy.

The turn-taker in the same Life:
- Day 2: drives on where both waited. +3 at Rusk and at Ansel; −3 at Brix and at your sister's (both came on).
- Day 3: gives way where it crossed yesterday. "You gave way. Their cart crossed. −1."
- Day 4: crosses again. Total +6 on day 4, where the old way made −4.

**Is the pull real? [measured, `pulls2-out.txt`, 120 seeds, `take-turns`]**
- **After you both waited (day 2):** driving on is worth +6.7 to the store over giving way again.
- **Giving way when it is their turn (day 3, after you crossed and they waited):** +1.5 that day, +22.4 in all, mark +30.0.
- **Taking your turn (day 3, after they crossed):** driving on is worth +1.3 to the store and +7.3 on the mark.
- **After a jam:** giving way is store-neutral (+0.6). Coming on sometimes is worth +6.5 on the mark, which matches the best lived ways' coin of 0.5 there.

### Sheet, Chronicle, afterword

**Sheet.** The cheapest of the four: the valley's river stays. The four places where your ties cross it, now drawn as ford circles, become bridges (two short parallel strokes). "Gave way" is an open-palm mark sent toward them, and the crossing a cart mark on the bridge. A jam is the two cart marks meeting at the bridge. The ridge stays.

**Chronicle.**
- **House:** "Kept: 52 of 50 loads." / "Not kept: 46 of 50 loads." (with the starting store)
- **Mark:** "With you, the road moved in 1330 of 2000 futures. Had your house kept the old way: 630 of 2000." Then "Your mark: +35."
- **The last day (place replay):** "On the last day you drove on at the Rusk bridge, though they had given way to you the day before. With way given to them, the road moves in … of 1000 futures, against … as you left it. Your store would have been … of 50 loads."
- **Seal:** "House kept, road moving."

**Afterword.** "Wherever one lane has to serve two directions, on single-track bridges, mountain roads, or a radio channel shared by many, people settle into taking turns. The trouble comes from two habits that each look sensible alone, always giving way and never giving way, and it comes worst when everyone has the same one."

### How best play differs from the valley [measured]

| Way | Kept, 2000 seeds | Mark, 40 x 200 | Seal |
|---|---|---|---|
| the valley's careful | 0% | −8.2 | — |
| custom (the valley's old way) | 0% | 0 | — |
| always give way | 0.3% | −16.7 | — |
| take-turns | 45.5% | +35.0 | 45% |
| `[1,0,0,1,0.5]` | — | +43.9 | — |
| take-turns + milk the polite | 45.3% | +13.7 | — |
| take-turns + drive on, day 12 | 49.3% | +32.3 | 37.5% (bought 0%) |
| take-turns + drive on, last 3 days | 29.4% | +17.5 | — |

- **Baseline:** median 31%; inside 15..85 in 75% of seeds.
- **Spread:** at least 25 points in 100% of seeds.
- **Carried, place range:** median spread 60 points; best never flat.
- **Best lived way by mark:** `[x,0,0,1,0.5]`.
- **Best by store:** `[0,0,1,0,0.5]` (push the polite, yield to the pushy), mark +15.8. This is 6 seeds x 60 futures: indicative.

### Engine changes

| Dial | Change | Status |
|---|---|---|
| D1 | S, H | proto |
| Charter | `FLOW_KIND 'one'` | 2 lines, built in `engine-seat.js` |
| Last day | `REPLAY_SITS` | 1 line, built in `engine-seat.js` |
| Range | `RANGE_WAYS` | proto |
| Store | `STORE_START`: added to house 0's purse and the reference Life's. Kept% is unchanged, since need and store shift together [argued]. | 2 lines, not built |

### Page changes [argued]

- The lexicon.
- The ford glyph becomes a bridge glyph.
- The day-12 sentence takes its situation from the place.
- The range count comes from `range.of`.
- Nothing on the cards beyond words. This is the smallest page change of the four.

### Risks

- **The house-versus-mark trade is weak.** The honest turn-taker earns both: 45% seal for `take-turns`. The day-12 drive-on gains only 3.8 kept points on 2000 seeds; the 40-seed sweep said 12.5, so the small sample overstated it. This is a coordination place: its tension is between you and each neighbour, not between your house and the road.
- **Marks are large** (+35) because the custom is so bad.
- **Breaking a tie depends on luck at the bridge.** With FOG 0.04 that is slow. Two identical turn-takers otherwise cycle between waiting and jamming [argued from the rules; the bestWay coin in BOTH and NEITHER supports it].
- **Stores below zero** without the starting store.
- G7 passes at 75%.

### Gates it should pass

- **G1:** take-turns keeps 35..65 [45.5 ✓]; custom and the valley's careful 0% [✓].
- **G2:** drive-on in the last 3 days costs at least 15 points of mark [17.5 ✓]; day 12 alone [2.7, not established].
- **G3:** place range [100% ✓]. **G4:** [✓].
- **G6:** at 300 futures [15/20, 75%].
- **G7:** [75% ✓]. **G8:** [100/100 ✓]. **G9:** [5/5 ✓]. **G10:** [✓].
- **X2:** with `REPLAY_SITS [3]` [bought 0% ✓].
- **Place gate R1:** the old way's day 2 shows both failures (0 with the polite, −3 with the pushy) in at least 80% of Lives [not run].
- **Place gate R2:** the store needs a starting store, or the page meter handles values below zero.

---

## 3. The Saltmarket (price ring)

**Pitch.** Eight salt stalls round a square. Holding the price together pays you more than cutting it, and the town pays the difference. The valley's trade is mirrored: here the selfish act on the last day is to keep the ring.

**Real-world domain.** Price-fixing between sellers: guild prices, bid rigging, cartels.

### Rules

**Dials moved (exact):**

| Dial | Setting |
|---|---|
| D1 stakes | `S: 2`. Both hold +4; you hold and they cut −1; you cut and they hold +3; both cut 0. |
| D3 charter | `CHARTER: 'breaks'`: the Mark counts futures in which the ring breaks |
| D4 custom | `CUSTOM: [1,1,1,1,1]` |
| Copying | `K: 2`. This brings the baseline off the ceiling: 79% instead of 88% [measured]. |
| Last-day replay | `REPLAY_FLIP: true`. The replayed act is a hand *sent*: a price held on day 12 after both held is replayed as a cut. |
| Need | `NEED_PIVOT: 122`, `NEED_WEIGHT: 0.5`, `MARGIN: 6` [measured] |

**The custom of the place:** `[1, 1, 1, 1, 1]`. "The guild's rule, which is to hold the price with every stall whatever it did."

**What the Mark measures.** The ring breaks in a future if, over its last ten seasons, fewer than half of the prices that could be held are held. A positive mark means the town is better off than under the guild's rule.

**Hidden lesson.** Trust and a price ring are built the same way. The people they cost are not at the table.

### Words

| Atom | The Saltmarket |
|---|---|
| actor | stall ("the Rusk stall"); kin "your sister's stall" |
| send / stay | **Hold the price** / **Cut the price** |
| unit | coins |
| luck | a stall boy ("lost"): "Your boy sold below the price. They saw only a cut price." |
| place | the square; the town |
| custom | "the guild's rule" |
| charter | the ring holds / the ring breaks; "the town better off" |
| far line | the arcade |

The page's forbidden list includes "firm" and "steady". No sentence here needs them.

**Outcome sentences.**

| Outcome | Card |
|---|---|
| Both held | "Both stalls held the price. +4." |
| You held, they cut | "You held the price. Theirs was cut. −1." |
| They held, you cut | "Their price held. Yours was cut. +3." |
| Both cut | "Both prices were cut. 0." |

**The town, on every day.** The day total gains one clause: "Today: +11. The town paid 12 coins more at your stalls." That is 4 coins for each of your stall pairs where both held, computed from the results. This is the place's "who watches whom", visible from day 1 [argued].

**Opening, line 3:** "Holding costs you 1 coin of trade you could have taken. When they hold, you keep 3 coins of trade. When you both hold, buyers pay 2 more at each stall, and the town pays it."

### The first three days

Life 11, played by `careful` (trace `trace.js -- ring 11 careful` [measured]). Need 130; the guild's rule would take 127. The four neighbours:
- the Rusk stall (east)
- the Ansel stall (north-east)
- the Brix stall (north-west)
- your sister's stall, the Hale stall (west), which keeps the guild's rule

**Day 1.** Every card reads "You have not traded beside them yet." You hold with all four.
- Rusk, Ansel and your sister: "Both stalls held the price. +4."
- Brix: "You held the price. Theirs was cut. −1."
- "Today: +11. The town paid 12 coins more at your stalls."

*The surprise:* holding together pays more than cutting would have (4 against 3). There is no greed to resist, only a town to think of.

**Day 2.**
- You cut against Brix. "Both prices were cut. 0."
- Your sister's card: "You held the price. Theirs was cut. −1." It was her boy, which the card does not say.
- Rusk and Ansel: +4 each.
- "Today: +7. The town paid 8 coins more."

**Day 3: the pull.**
- Every hold with Rusk and Ansel pays you 4 and costs the town 4.
- A cut against them brings 3 today, the town pays nothing at that pair, and they will likely cut back tomorrow.
- *What tempts:* the ring itself. Your store wants it to the last day; the town wants it broken.

**Is the pull real? [measured, `pulls2-out.txt`, 120 seeds, `careful`; mark is the town's]**
- **Holding after both held (day 2 or 3):**
  - Store: +2.0 that day, +13 in all.
  - Mark: −2.8 (sem 0.5).
- **On day 12:**
  - Store: +2.3.
  - Mark: −5.2 (sem 0.4).
- **Cutting back after they cut (day 3):** costs the store nothing (−0.4 either way) and helps the town by 5.9.

### Sheet, Chronicle, afterword

**Sheet.**
- Stalls round a square on the ring.
- The ties are the lanes buyers walk between stalls.
- The barrier curve becomes the market cross and its steps; the crossing mark becomes a price tally.
- The arcade replaces the ridge.
- The town is a band drawn outside the ring. On the day sheet it carries the day's "paid more" count; in the Afterwards it carries a season count.

**Chronicle.**
- **House:** "Kept: 131 of 129 coins." / "Not kept: 127 of 130 coins."
- **Mark:** "With you, the ring broke in 560 of 2000 futures. Had your stall kept the guild's rule: 420 of 2000." Then "Your mark: +7." The rule line: "A future counts as broken if, in its last ten seasons, fewer than half of the prices that could be held are held."
- **The last day (flipped):** "On the last day you held the price with the Rusk and Ansel stalls, after both had held. With the price cut there, the ring breaks in … of 1000 futures, against … as you left it. Your store would have been … of 129 coins."
- **Seal:** "Stall kept, town better off."

**Afterword.** "Sellers who agree not to undercut each other keep that agreement the way neighbours keep trust: by matching each other day after day and answering a cut with a cut. That is why many countries forbid such agreements, and why the buyers, who never sit at the table, are the ones who pay for them."

### How best play differs from the valley [measured]

Kept on 2000 seeds. Mark, seal and bought on 40 seeds x 200 futures (`ring2-out.txt`), with the flipped replay; the seal under the lab's mirrored valley clause is shown for comparison.

| Way | Kept | Mark | Seal (flipped) | Seal (valley clause) | Bought (flipped) |
|---|---|---|---|---|---|
| careful (the valley's competent way: here the complicit one) | 43.6% | +6.9 | 2.5% | 7.5% | 17.5% (held to the end and was kept only by it) |
| careful + cut on day 12 | 31.6% | +13.9 | 17.5% | 10% | 0% |
| one-strike + cut on day 12 | — | +32.0 | 17.5% | — | — |
| one-strike (ends the ring with any stall that cut once) | 11.4% | +31.5 | 12.5% | — | — |
| mirror | 14.4% | +18.6 | 10% | — | — |
| careful + cut on the last 2 days | 7.8% | +28.1 | — | — | — |
| never | 0% | +41.9 | — | — | — |

- **The last-day cut:** costs 12 kept points and gains the town 7. It is a sacrifice, not a grab.
- **Baseline:** median 79%; inside 15..85 in 67.5% of seeds.
- **Spread:** at least 25 points in 100% of seeds (gates ways); 72.5% with the `ring2` ways.
- **Best lived way by mark:** near-never, e.g. `[1,0,0,0,0]`, which keeps 0%.
- **Best by store:** `[1,1,0,0,1]`.

### Engine changes

| Dial | Change | Status |
|---|---|---|
| D1 | S | proto |
| D4 | custom | proto |
| D3 | inverted charter inside `verdict()`: range, rank, best, worst, `level`, `held` and the scale must all face the charter | not built ("high in design, low in code", per the engine map) |
| Last day | `REPLAY_FLIP` | 1 line, built in `engine-seat.js` |
| Seal | `boughtOnLastDay` stays "kept, and the replayed store is short"; `lastDayCost` reads the inverted delta. The lab computes both [measured]; the engine clause is not built. | not built |

### Page changes [argued]

- About 20 charter sentences (page map 3.2b).
- The strip's good side of the line is reversed (app.js 1298, 1381).
- The town clause on the day total.
- The last-day sentence with "held" in place of "stayed home".
- The town band on the sheet.

### Risks

- The most engine and page work of the four.
- G7 passes at 67.5%, narrowly.
- Moral framing: the page must report the town's coins as a count and never praise a cut.
- The best way by mark is near-never (it can never keep the house).
- The carried check in the valley's form reads "best" as most held, which is backwards here. Using `carried()` unmodified gives a meaningless 41.7% "flat best".
- In the Life it shares its stakes shape (holding together pays more than taking) with the Watch.

### Gates it should pass

- **G1:** careful keeps 35..65 [43.6 ✓]; the place's temptation is to hold to the end.
- **G2:** the last-day hold costs the town at least 4 points against a cut [7.0 ✓].
- **G3:** [✓]. **G4:** written for the inverted charter: the best lived way by mark is not flat [0% flat seeds ✓].
- **G6:** at 300 futures [13/20, 65%].
- **G7:** [67.5% ✓]. **G8:** [100/100 ✓]. **G9:** [5/5 ✓].
- **G10:** the most-kept way is not the best-mark way [✓].
- **X2 (flipped):** a hold-to-the-end Life kept only by that hold is refused the seal [17.5% caught ✓]; a cutter can earn it [17.5% ✓].
- **Place gate S1:** after inversion, `range.bestPct` sits on the town's side of `worstPct` on the scale.
- **Place gate S2:** the town clause equals 4 x (your ties where both held) on every day.

---

## 4. The Watch (arms race)

**Pitch.** Hill houses watch each other's towers across a border. Standing down together pays more than anything taking could, but standing down alone costs you, and one fire in eight is a jumpy watchman. The danger here is fear, not greed.

**Real-world domain.** Arms races and border standoffs; false warnings such as the 1983 one that wrongly reported a missile launch.

### Rules

**Dials moved (exact):**

| Dial | Setting |
|---|---|
| D1 stakes | `C: 2, S: 3`, with B 3. Both stand down +4; you alone −2; they alone +3; both keep watch 0. |
| D2 luck | `FOG: 0.08` (twice the valley; kind "lost") |
| D4 custom | `CUSTOM: [0,1,0,1,0]` |
| Copying | `K: 1` |
| Need | `NEED_PIVOT: 47`, `NEED_WEIGHT: 0.5`, `MARGIN: 53` [measured] |

**The custom of the place:** `[0, 1, 0, 1, 0]`. "The border custom, which is to keep a fire lit for a new face and then do as they did the day before." Kin starts with it, so on day 1 your own sister's fire is lit toward you.

**What the Mark measures.** The valley's charter in border words. The border holds in a future if, over its last ten seasons, at least half of the towers that could stand down still do.

**Hidden lesson.** There is nothing to take, and a lit fire is often a shadow. Do not be first with a stranger, but be first after a standoff.

### Words

| Atom | The Watch |
|---|---|
| actor | house ("the Garrow house") |
| send / stay | **Stand down** / **Keep watch** |
| unit | measures |
| luck | false alarms ("lost"): "Your watchman lit a fire at a shadow. They saw only a fire." |
| place | the border |
| custom | "the border custom" |
| charter | the border holds / the border fails |

**Outcome sentences.**

| Outcome | Card |
|---|---|
| Both stood down | "Both towers stood down. The border was quiet. +4." |
| You stood down, they kept watch | "You stood down. A fire burned on their tower. −2." |
| They stood down, you kept watch | "Their tower stood down. Yours kept watch. +3." |
| Both kept watch | "Both towers kept watch. 0." |

**Opening, line 3:** "Standing down costs you 2. When they stand down, you gain 3; when both do, trade crosses the quiet border and each gains 3 more. Watchmen sometimes light fires at shadows."

### The first three days

Life 7, played by `careful` (trace `trace.js -- towers 7 careful` [measured]). Need 101; the custom would bring in 46. The four neighbours:
- your sister's house, the Wren house (east)
- the Garrow house (north-east)
- the Kesh house (north-west)
- the Maren house (west)

**Day 1.** Every card reads "You have not faced them across the border before." Under the store: "The border custom, which is to keep a fire lit for a new face and then do as they did the day before, would bring in 46 this season." You stand down toward all four.
- Your sister, Garrow and Maren: "You stood down. A fire burned on their tower. −2."
- Kesh: "Both towers stood down. The border was quiet. +4."
- "Today: −2. Winter store: −2 of 101 measures."

*The surprise:* your own sister kept watch on you. It is the custom.

**Day 2.**
- Your sister stands down now, as the custom says: +4.
- Garrow: "Their tower stood down. Yours kept watch. +3."
- Kesh: "Your watchman lit a fire at a shadow. They saw only a fire." Kesh stood down anyway: +3.
- Maren: "Both towers kept watch. 0."
- "Today: +10."

**Day 3: the pull.**
- Kesh, having seen your fire, stood down again: +4.
- Garrow, answering your watch of day 2, lit a fire: −2.
- *What tempts:* keeping watch. It never costs a measure, and the custom does it.
- *What the numbers say:* standing down together pays 4, more than keeping watch while they stand down (3). There is nothing to take, and a fire may be a shadow.

**Is the pull real? [measured, `pulls2-out.txt`, 120 seeds, `careful`]**
- **Standing down again after a fire (day 2):** −0.9 that day, +6.6 in all, mark +1.6. In the valley the same act is −0.4 in all.
- **Standing down to a stranger on day 1:**
  - Store: −3.1 that day, +4.1 in all.
  - Mark: −4.7 (sem 0.8): the heir learns to stand down to newcomers.
- **Reopening after both kept watch (day 3):** store −0.9 in all, mark +4.1.
- **Day 12:** standing down is worth +0.2 to the store. There is nothing to take.

### Sheet, Chronicle, afterword

**Sheet.**
- Holdings are hill houses, each with a tower.
- Your four ties are sight lines across a border line, where the valley draws its river.
- The crossing mark is a beacon: open when stood down, flame when watch was kept. A false alarm is a flame on your own tower.
- The ridge stays as the hills hiding the far three.

**Chronicle.**
- **House:** "Kept: 104 of 103 measures."
- **Mark:** "With you, the border held in 1150 of 2000 futures. Had your house kept the border custom: 920 of 2000." Then "Your mark: +11."
- **Seal:** "House kept, border quiet."
- The last-day paragraph rarely appears: staying home on day 12 costs the store here.

**Afterword.** "Neighbouring powers that arm because each fears the other can stay armed long after either wants to, and a single false alarm, like the warning that wrongly reported a missile launch in 1983, can undo years of standing down. The way out has usually been small steps answered in kind, and a readiness to let one alarm pass."

### How best play differs from the valley [measured]

| Way | Kept, 2000 seeds | Mark, 40 x 200 | Seal |
|---|---|---|---|
| careful | 57.3% | +11.4 | 20% |
| cold (opens to kin only on day 1) | 51.0% | +14.3 | 30% |
| always | 25.2% | +13.6 | — |
| careful+grab | 52.8% | +4.5 | 7.5% |
| forgiving | 17.6% | +5.5 | — |

- **The last-day grab:** loses 4.5 kept points here. In the valley it gains 35 (39.3% to 75.1%).
- **Baseline:** median 48%; inside 15..85 in 92.5% of seeds.
- **Spread:** at least 25 points in 97.5% of seeds.
- **Carried:** best is flat in 16.7% of seeds.
- **Best lived way by mark:** `[0,1,1,1,0.5]`.
- **Best by store:** `[1,1,0.5,1,0]`.

### Engine and page changes

**Engine:** none. Every dial is in the proto or is already a parameter.

**Page [argued]:**
- The lexicon.
- The beacon glyph.
- The S clause in the reveal ("The border was quiet").
- The luck note's new rate.
- The custom's sentence explains the sister's lit fire on day 1.

### Risks

- Closest to the valley in what wins by mark: the Watch's best is `[0,1,1,1,0.5]`, the valley's `[0,1,1,1,0]` [measured]. The difference is in the stakes felt each day and the absent last-day trade, not in the final way.
- The house and the mark mostly agree, so the seal is about competence.
- It shares "holding together pays more than taking" with the Saltmarket.
- G6 at 300 futures: 11 of 20 (55%).

### Gates it should pass

- **G1:** careful keeps 35..65 [57.3 ✓]; the grab does *not* raise kept [52.8 < 57.3 ✓: this inverts the valley's G1 clause].
- **G3:** [97.5% ✓]. **G4:** [83.3% non-flat ✓].
- **G6:** at 1000 futures [not run].
- **G7:** [92.5% ✓]. **G8:** [100/100 ✓]. **G9:** [5/5 ✓]. **G10:** [✓].
- **X2:** trivially true (the grab costs the store).
- **Place gate W1:** standing down again after a fire is worth at least 0 to the store [+6.6 ✓].
- **Place gate W2:** day-1 opening to strangers costs the mark [−4.7 ✓].

---

## 5. Reserves

### R1. The Crossroads (trade road of strangers)

- **Dials:** `B: 4`, `TURNOVER: { days: [3], kinds: ['taker','wary','soft'] }`, `ARRIVALS: 3`, `ARRIVE_FROM: 2`, `ARRIVE_TO: 20`.
- **Need:** pivot 85, margin 10.
- **The pull by day 3:** a stranger has taken a neighbour's stall before day 3, so the card resets to "You have not dealt with them yet." Trade with strangers is worth 4.

**Measured (one tuning pass, 30 seeds x 150 futures, `reserves-out.txt`):**

| Way | Kept | Mark | Seal |
|---|---|---|---|
| careful | 53.3% | +7.3 | — |
| cold | 40% | +9.9 | — |
| always | — | −4.8 | — |
| careful+grab | 70% | +0.1 | — |

- Baseline: median 41.7%; inside 15..85 in 96.7% of seeds.
- Spread: at least 25 points in 93.3% of seeds.

**Lesson:** strangers punish an open greeting.

**Gaps:**
- One stranger per Life is all the proto does; more would be engine work (costed in the engine map).
- The page traps for a stranger (frozen deed names, the restart of what you know) are listed in the page map (3.2e).
- **Why reserve:** the grab still decides, so the Life plays close to the valley.

### R2. The Two Shores (who learns from whom)

- **Dials:** `SIDES: [0,0,0,0,1,1,1,1]`, `FOUNDERS: { far: ['wary','wary','firm','wary'] }`.
- **Need:** pivot 57, margin 6.

**Measured (one pass, 30 seeds x 150 futures):**

| Way | Kept | Mark | Seal |
|---|---|---|---|
| careful | 33.3% | +11.6 | — |
| cold | 50% | +17.4 | 26.7% |
| careful+grab | 80% | +3.6 | — |

- Baseline: median 36%; inside 15..85 in 90% of seeds.

**Lesson:** what spreads is decided on your own shore.

**Gaps:**
- It is felt only at the first season's end, so it fails "by day 3" as it stands.
- The fix is to seat the wary founders across the river among your near neighbours (6 and 7), and keep kin on your side: a seat-by-side rule, about 5 lines [argued].

---

## 6. If only three can be built

**Cut the Watch first.** It is the nearest to the valley in what wins by mark. It shares the Saltmarket's stakes shape. Its two lessons partly reappear elsewhere: forgive a slip (the Banks) and noise (the Banks' drift).

Cutting it leaves "arms races" unrepresented. Say so to the user, or re-skin the Banks' drift note as "noise" and keep the Watch as the first reserve.

**If the binding limit is engine work rather than variety**, cut the Saltmarket instead and keep the Watch. The Saltmarket needs the inverted verdict, the flipped replay and about 20 charter sentences; the Watch needs no engine change at all.

Do not cut the Banks (named to the user; its twist is visible on the card) or the Bridges (the most original; it turns the valley's own custom into the punchline).

## 7. Files

All in `<scratch>/places/propose-seat/`:

| File | What it is |
|---|---|
| `make-seat.py` | writes `engine-seat.js`: the four patches |
| `engine-seat.js` | lab proto plus `FLOW_KIND 'one'`, `FLOW_KIND 'stock'`, `REPLAY_SITS`, `REPLAY_FLIP` |
| `idcheck.js` | identity with `engine-proto.js` on existing measures, 16 verdicts |
| `places.js` | the four places as lab overrides, with their own ways (`take-turns`, `push-the-polite`, `mender`, `one-strike`) |
| `gates.js` | per-place gates: `jsc gates.js -- <fishing\|bridge\|towers\|ring> 40 200` |
| `sitpull.js`, `pulls2.js` | pulls by situation and day |
| `trace.js` | the day-by-day traces behind the walkthroughs: `jsc trace.js -- <place> <seed> [way]` |
| `common.js`, `common2.js` | shared helpers |
| `*-out.txt` | unedited outputs of every run quoted here |
