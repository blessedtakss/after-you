> **Record of its time.** Written 2026-11-25 09:16 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Review of the twelve proposed places, from the first-time visitor's seat

Judge: first-timer and page. Folder: `<scratch>/places/judge-first-timer/`. Nothing in the game folder was touched.

## 0. What I measured and what I argued

**Measured.** Every script below sits next to its unedited output. All run on the seat proposal's `engine-seat.js`, which is the lab prototype plus `FLOW_KIND 'one'`/`'stock'`, `REPLAY_SITS` and `REPLAY_FLIP`, or on the lab prototype itself.

| Script | Output | What it checks |
|---|---|---|
| `firsttimer.js` | `firsttimer-out.txt` | Does each place's proposed wording stay true? The Banks' clamped levels; whole or fractional card numbers in the three fishing places; the Bridges' stores and need below zero, its card numbers and kin's tie; the zero case of the Saltmarket's town clause; the Watch's day 1 and its store line. 300 seeds, no futures. |
| `banks-gauge.js` | `banks-gauge-out.txt` | What the Banks' gauge reads on the four cards each morning (300 seeds). |
| `watch-merge.js` | `watch-merge-out.txt` | The Watch with the seat's false alarms (FOG 0.08) and the prover's K 2. Neither proposer ran this combination. Need tuned on 1000 seeds; sweeps on seeds 1-40 and 41-80 at 200 futures; pulls; G6, G8 and G9 at 1000 futures per what-if. |
| `salt-both.js` | `salt-both-out.txt` | The Saltmarket with the Mark counting pairs where both held, against the proposed count of single held prices. 40 seeds x 200 futures. |
| `bridges-founders.js` | `bridges-founders-out.txt` | The seat's Bridges with the valley's founders and with two stubborn houses near. 40 seeds x 200 futures. |

**Argued, not run.** Pixel and line counts on the Opening and the cards: these are estimates from PAGE-MAP's measured spare room (15 px on the day at 1280x800; 50 px on the Opening with earlier lives listed). Everything about sheet drawing. Any page code. No page-smoke run, no browser. Every other number I quote comes from the proposers' own output files and is marked as theirs.

## 1. How I judged

For each place I asked five questions:

1. **Day 1.** Can someone who has only played the valley tell, from the Opening and the first reveal, what the two choices are and what each costs and brings? Do the stated numbers add up to what the card prints?
2. **Day 3.** Is the twist felt by then, from the cards, the store line and the sheet, with no theory word?
3. **True in every case.** Does the wording hold for zero, one and many; for each kind of luck; at the ends of any scale; and under an inverted Mark?
4. **Fit.** Does the place live inside today's cards, sheet and Chronicle (PAGE-MAP), or does it quietly need a new screen, a third choice, or a paragraph of rules?
5. **A different evening.** Is it a different experience from the valley and from the other places in the pack?

## 2. Scores

| # | Place (proposal) | Score | Verdict | Reason in one line |
|---|---|---|---|---|
| 1 | **The Banks** (seat) | **8** | keep | Whole baskets on every card, the bank's level is the worth of their restraint, and the Mark counts that same level. The wording must be fixed at the two ends of the scale (section 3.1). |
| 2 | **The Bridges** (seat) | **7** | fix | The twist is visible on day 1 and it is the most original evening. The Opening's sums do not add up, and the store sits below zero unless a starting store is added. |
| 3 | **The Saltmarket** (seat) | **7** | fix | The only ring with a trade you feel every day, and the town appears on every day's total. It needs the inverted verdict built, and its Mark should count pairs (measured fix). |
| 4 | **The Watchtowers** (prover) | **7** | fix | The best-measured fear place (G6 67.5%, no engine work). Its wording is thin: take the seat's. |
| 5 | **The Watch** (seat) | **6** | fix | Right wording (your sister keeps watch on day 1, false alarms). FOG 0.08 costs G6 (50%, measured): use the prover's numbers. |
| 6 | **The Shoal** (theorist) | **6** | fix | Right idea (the ground keeps the score). Its eighths put a fraction on 61% of cards (measured), and "worth 3 x the ground" is a formula. Merge into the Banks. |
| 7 | **The Shoal / Common** (prover) | **5** | fix | Fractions on 46% of cards (measured). Its Mark counts hands while the card shows a bank level, so the gauge does not decide the result. Merge into the Banks. |
| 8 | **The Narrow Bridge** (prover) | **5** | fix | Right count ("exactly one crossed") and right to switch the valley's replay off. Every store and the need sit below zero. Merge into the Bridges. |
| 9 | **The Salt Ring** (prover) | **5** | reject | On days 1-3 it is the valley: same stakes, same custom. It needs a 25-35-line end-game rule, a new "last days" paragraph, and still leaks 5-10%. Superseded by the Saltmarket. |
| 10 | **The Salt Road** (theorist) | **4** | reject | Valley stakes, so days 1-3 are the valley. A 3-day break earns the seal in 30% of Lives, and pressing the soft stall earns it in 38%. Superseded. |
| 11 | **The Watchtowers** (theorist) | **4** | reject | Valley custom, so nothing surprising happens on day 1. Easy seal (27-35%), and its balance rests on hand-picked founders. Superseded by 4 and 5. |
| 12 | **The Narrow Bridge** (theorist) | **3** | reject | "Both give way: +2 each" cannot be told truthfully on a one-lane bridge. Always-give-way keeps 71%. G6 fails. |

## 3. Each place, through the first-timer's eyes

### 3.1 Fishing: the Banks (seat), the Shoal (theorist), the Shoal/Common (prover)

The concept is the same in all three: a level on each tie that quarrels drain. Only the seat's version reads cleanly on the page.

**Day 1.**

- **Banks.** The card head says "The bank: 6". Keeping off costs 2, and their keeping off is worth the bank's level. Both kept off gives 6 − 2 = +4. The stated rule and the card agree, and every number is a whole basket (measured: 0 non-whole card numbers in 14,400 tie-days per way).
- **Theorist's Shoal.** It asks the reader to multiply ("3 x the ground"). The cards then print values such as 2.375, 1.625 and −0.25 (measured: 60.9% of card numbers and 90% of final stores are not whole).
- **Prover's Shoal.** C 1.5 gives "a basket and a half" and cards such as 2.625 and −0.375 (measured: 46.3% of card numbers and 88% of stores are not whole). Rounding for display would break the visible sum "Today: +N", which is the first thing a newcomer checks.

**Day 3.** In all three the number on the card moves on day 1 or 2. The pull is real and measured by the seat: answering a slip in kind costs your own store here, and taking early costs about four times what it does in the valley.

**True in every case: the Banks' clamps.** The wording proposed by the seat is false on most days.

- Their Opening says "Both keep to their water and the bank fills by one; both fish across and it loses three". The reveal examples read "The bank fills to 8" and "falls to 4".
- From day 5, 59-70% of card gauges stand at 9 and 21-26% at 2. From day 6 only 5-14% are in between (`banks-gauge-out.txt`).
- "Fills by one" is false on 65-69% of days when both kept off (the bank is already at 9).
- "Loses three" is false on 85% of days when both fished across (the floor is 2).
- 99-100% of Lives have a tie at the floor at some point, under every way except `always`.

So the gauge works as a full / fished-out status after the first few days. That reads well, but only if the words say so: "fills by one, up to 9", "loses three, never below 2", "The bank stays full at 9", "The bank is at 2, as low as it goes".

**Fit.**

- A gauge in the card head is the one extra state H1 allows. PAGE-MAP measured 15 px to spare on a laptop day, so the gauge must be pips beside the bearing, not a new line.
- The seat lists the per-season levels in `runFuture().seasons` as "about 3 lines, not built". They are not optional. The Mark counts banks, so an Afterwards strip that still draws hands would show one thing and count another.
- The seat's Banks has `ARRIVALS: 2`, but the page assumes one arrival per future (PAGE-MAP 3.2e: words.js 457-460, app.js 1329 and 1366, page-smoke 343-345 and 384). The seat's page list omits this.
- The prover's Shoal counts hands in "holds", so the bank on the card never decides the Mark. That is incoherent for a reader who watched the gauge all Life.

**A different evening.** Yes. The valley's trade stays intact: the seat measured the last-day grab buying the house in 27.5% of Lives and costing 11 points of mark. The one new thing is in plain sight on the card, and it reverses one valley habit: here a slip let go pays your own store.

### 3.2 The road: the Bridges (seat), the Narrow Bridge (prover), the Narrow Bridge (theorist)

**Day 1.** The seat's Bridges has the best first day of any place.

- With valley founders, the custom waves at three of four bridges on day 1: "You both waved the other on. Nobody crossed. 0." On day 2 it jams with the pushy one.
- Both failures of the valley's own old way show by day 2 with no word of theory.
- The cards print −3, −1, 0 and +3 (measured).

**Problem 1: the Opening's sums.** The seat's line does not add up: "Giving way costs you 1 load. Crossing while they wait brings you 3. If you both give way, nobody crosses."

- A reader adds −1 for giving way and nothing for crossing, and expects −1. The card says 0, because S −2 cancels B 3 − C 1.
- Fix: state the four outcomes whole. "Crossing while they wait brings you 3. Waiting while they cross costs you 1. If you both wait, nobody crosses: 0. If you both come on, the carts jam: −3 each."

**Problem 2: stores below zero** (measured, valley founders, no starting store).

- The old way's store is below zero in 97.7% of Lives, so the store line would print "The old way ... would bring in −25 loads".
- Take-turns, the honest way, is below zero after day 3 in 21% of Lives.
- The need is at or below zero in 5.7% of Lives, which breaks the meter's scale and the saved entry (PAGE-MAP: app.js 672, 173).
- The seat's `STORE_START 40` is therefore required, not optional. The Opening then gains "You start with 40 loads in your yard." The store line becomes "would leave you with".
- The prover's bridge is worse: the need averages −12.8 and every store is below zero. "You need −13 loads for winter" cannot be said.

**Theorist's bridge.** It is chicken (+2 / −1 / +3 / −2). "Both give way, +2 each" has no honest wording on a one-lane bridge: who crossed? It also fails H5, since always-give-way keeps 71%. Its "Border" re-skin fits the numbers better, but the balance problem stays.

**True in every case.**

- Luck as a balking mule ("Your mule would not stand, and your cart came on. They saw only that you came on.") stays neutral on their side.
- H is charged on "neither arrived", so the number never says whose fault a jam was.
- The five situation titles must be rewritten for the road: "After you both waited", "After they crossed and you waited", "After you crossed and they waited", "After the carts jammed". The valley's "After you both helped" would name a stalemate as a kindness. No proposer wrote these.

**Seal.** Turn-taking earns the seal in 45% of Lives, and `[1,0,0,1,0.5]` and `[1,0,0,1,1]` earn 42.5-45% (measured, valley founders). The prover's cure, two stubborn houses near, does not transfer to H 3: `always` then keeps 49.7% (1000 seeds) and push-the-polite 72.5% (40 seeds), so it is worse (`bridges-founders-out.txt`).

My reading: the Bridges is a puzzle with a solution, and its evening is "find the rhythm", not "resist the take". That is a legitimately different experience. The design lead should either accept the generous seal or raise the seal's mark threshold for this place (not measured).

**Kin.** I expected a sister who copies symmetric turns to jam with you. Measured, she does the opposite: under take-turns, only 8.1% of kin tie-days on days 5-12 were both-waited or jammed, against 42.5% with the other three. Turn-taking learned from you alternates well. G8 is safe.

**A different evening.** The most different of all.

### 3.3 The ring: the Saltmarket (seat), the Salt Road (theorist), the Salt Ring (prover)

**Day 1.**

- **Saltmarket.** S 2 makes holding together pay 4 against 3 for cutting, and "the town pays it". The day total adds "The town paid 12 coins more at your stalls."
  - The twist is felt on day 1: your store wants the ring, the town wants it broken.
  - The stated sums add up: −1 + 3 + 2 = 4.
- **Salt Road and Salt Ring.** Valley stakes. Days 1-3 print the valley's numbers, and the prover says so: "The store's numbers are the valley's". The only day-3 difference is a sentence on the Opening. That passes H3 on paper and not in the chair.

**The end of the Life.**

- **Valley stakes (Road, Ring).** Cutting on the last day fills the store and helps the town, so the two results agree and the valley's guard points the wrong way. The theorist leaves a 30% seal for a three-day break. The prover's end-game rule (25-35 lines, not built) halves the leak to 5-10% and needs a new "in the last days" paragraph.
- **Saltmarket.** It mirrors the valley's trade exactly: the selfish act on the last day is to keep holding, and the replay (`REPLAY_FLIP`, one line) tests a cut. The Chronicle's sentence is the valley's sentence with a different verb.

**True in every case.**

- The town clause needs a zero branch. Measured: 8.4% of days for a one-strike house, every day for `never`.
- The flipped last-day paragraph appears in nearly every honest Life: the seat measured 100% for careful and 95% for mirror. Its words must state a fact ("you held the price with the Rusk and Ansel stalls, after both had held"), never an accusation.
- **The count mismatch.** The day clause counts pairs where both held, which is where the town pays. The proposed Mark counts single held prices (`FLOW_KIND 'hands'`). Counting pairs (`FLOW_KIND 'both'`) aligns the two, and it also fixes the narrow G7 (measured, `salt-both-out.txt`, 40 x 200, same need, flipped replay on):

| Mark counts | baseline median | inside 15..85 | spread >= 25 | careful mark / seal | cut on day 12: mark / seal |
|---|---|---|---|---|---|
| held prices, line 0.5 (as proposed) | 79.3% | 67.5% | 100% | +6.9 / 2.5% | +13.9 / 17.5% |
| pairs both held, line 0.5 | 45.0% | 100% | 80% | +11.1 / 5.0% | +19.4 / 15.0% |
| pairs both held, line 0.4 | 62.3% | 97.5% | 92.5% | +8.8 / 2.5% | +19.2 / 15.0% |

**Inverted Chronicle.**

- The rows of 200 marks should fill the mark for the event the Mark counts as good ("broke" here, "held" in the valley). Then "more filled marks in your row than in the old way's" means a positive mark in every place.
- The strip's good side flips, and the range's "best" becomes the most broken.
- Opening line 4 must name the town.
- The seat's town band on the sheet has no free room. The far three fill the top band and your holding sits at the foot. In the Afterwards it would also need per-season both-held counts that `runFuture` does not hand over. Keep the town in the day total and the Chronicle, not on the sheet (argued).

**A different evening.** Yes. It is the reversal. It should come last, after the visitor has learned to trust.

### 3.4 Fear: the Watchtowers (prover), the Watch (seat), the Watchtowers (theorist)

**Day 1.** In the seat's and the prover's versions the custom is "never stand down first".

- Your sister keeps watch toward you on day 1 in 100% of Lives (measured). The card reads "You stood down. A fire burned on their tower. −2". The custom's sentence under the store explains why.
- The day-1 total is below zero in about a third of Lives (measured).
- The stated sums add up: −2 + 3 + 3 = +4.
- The theorist's version keeps the valley's custom, so day 1 looks like the valley with bigger numbers.

**Day 3.** You feel fear, not greed. Taking from a neighbour who stood down pays 3 against 4 for standing down too, so there is nothing to take, only something to fear. This is felt on the cards.

**True in every case.**

- The store line shows the old way bringing in 45-46% of the need on average, against 88% in the valley (measured).
- A newcomer reads "the custom would bring in 46" beside "−2 of 101" and may conclude the need is impossible. Careful keeps about half, so it is not.
- The sentence is true. Its framing should be read by a person on day 1 before build (prover's open question 2).

**The settings.**

- The seat's false alarms (FOG 0.08) give the user the promised "noise", but they cost G6.
- Merged with the prover's K 2, measured: careful keeps 50.5% (1000 seeds) with seal 22.5-27.5%; cold keeps 42.7% with seal 32.5-35%. G6 is **50%**, against the prover's 67.5% at FOG 0.04 by the same method (`watch-merge-out.txt`).
- Keep the valley's 4% and give it the false-alarm wording.

**The Watch's own trade.**

- It is on the first day, not the last. Standing down to all four on day 1 is worth +3.9 to the store and −7.1 to the mark (measured, merged setting; the seat measured −4.7 at K 1).
- Your heir learns to open to strangers, and the Afterwards brings a hawk.
- "In the valley the last day decides; on the border the first day does" is a clean line for the afterword.

**A different evening.** Partly.

- Its cards (4 / −2 / 3 / 0) nearly match the Saltmarket's (4 / −1 / 3 / 0).
- Its best ways overlap the Banks': the prover found `[1,1,0.5,1,1]` in both top fives.
- Competent valley play is still competent here.
- It is the weakest member of the pack, and the first to cut.

## 4. The pack I would build

Play order after the valley: **Banks, Watch, Bridges, Saltmarket.**

| Order | Place | Settings | From |
|---|---|---|---|
| 2nd | **The Banks** | `B 1, C 2, K 1, STOCK {start 6, min 2, max 9, delta [-3, 0, +1]}, FLOW_KIND 'stock', HOLD_LINE 6, ARRIVALS 2 (3..15)`; need 172 / 0.5 / 30; custom `[1,1,0,1,0]`; luck 'lost' as drift | seat's numbers and words; the theorist's hysteresis line in the afterword; the prover's gate on `always` |
| 3rd | **The Watch** | `C 2, S 3, K 2, CUSTOM [0,1,0,1,0], FOG 0.04 'lost'`; need 51 / 0.5 / 63 | prover's numbers; seat's words (the sister's day-1 fire, false-alarm luck, beacon glyph) |
| 4th | **The Bridges** | `S −2, H 3, FLOW_KIND 'one', HOLD_LINE 0.5, REPLAY_SITS [3]`, the place's own range, valley founders, `STORE_START 40`; need re-tuned with the start (pivot −25, margin 36 before the start) | seat's; the prover's finding that the valley's replay must be off here |
| 5th | **The Saltmarket** | `S 2, K 2, CUSTOM [1,1,1,1,1], CHARTER breaks` inside `verdict()`, `REPLAY_FLIP`, **`FLOW_KIND 'both'`, HOLD_LINE 0.4** (or 0.5); need 122 / 0.5 / 6 | seat's, with my measured change of count; the prover's afterword line on pardons for the first to step out |

### What must change before each is built

**The Banks**

1. Word the two ends of the scale. Opening: "fills by one, up to 9; loses three, never below 2". Reveal branches: full at 9; at 2, as low as it goes; "stays at" when it cannot move.
2. Add the missing bank clause to the row "They kept off, you fished across".
3. Cut the Opening's stakes line from 45 words to 30 or fewer. Leave the fill and empty rule to the card and the key.
4. Build the per-season tie levels in `runFuture().seasons`. Draw the Afterwards strip on the 2..9 scale with its line at 6.
5. Make the page read `arrivals` as a list (two newcomers).
6. Draw the gauge as pips in the card head, by form not colour. Draw the sheet gauge at the crossings.
7. Measure G6 at 1000 futures (the seat measured 55% at 300).
8. Run the identity gate on the `'stock'` count.

**The Watch**

1. FOG 0.04, not 0.08 (G6 50% at 0.08, measured).
2. Have a person read the store line on day 1: the old way brings in about 45% of the need. Never phrase the need from the custom.
3. Put the first day's trade in the afterword.
4. Never place the Watch next to the Saltmarket in the order.
5. Run the prover's gates on the final settings.

**The Bridges**

1. Build `STORE_START` (two lines) and its Opening and store-line wording.
2. Write the stakes line as four whole outcomes.
3. Write the five situation titles for the road, and the "against habit" line ("Even so, they came on today").
4. Decide the seal. Turn-taking earns 45%: accept it, or raise this place's seal threshold (not measured; two stubborn houses near makes it worse, measured).
5. Read the range count from `range.of`.
6. Run G6 with turn-taking, not `forgiving`.

**The Saltmarket**

1. Build the inverted charter inside `verdict()` (held, level, mark, range rank, best and worst, seal sign, `lastDayCost`) as a separate path that is off by default. Add `REPLAY_FLIP`. Run the identity gate.
2. Count the Mark by pairs (`FLOW_KIND 'both'`).
3. Give the town clause a zero branch, and have the engine hand over the town count rather than the page computing it.
4. Word the last-day paragraph neutrally; it will appear in nearly every honest Life.
5. Fill the Chronicle's marks for "broke", flip the strip and the scale, and name the town in Opening line 4.
6. Keep the town off the sheet.
7. Place it last.

### The pack as a whole

- **Which place comes second: the Banks.** It keeps the whole valley Chronicle (the last-day paragraph, the seal's guard), so what the visitor learned carries over. Its one new thing is on the card, where the eye already is. It reverses exactly the habit the valley just taught: answering a slip in kind.
  - The Watch would remove the grab and change the Chronicle, so it comes third.
  - The Bridges breaks "helping is good" (the valley's careful keeps 0%), so it comes fourth.
  - The Saltmarket breaks "holding together is good for the world", so it comes last.
  - Each step moves one notch further from the valley. The Watch and the Saltmarket, which share card shapes, are kept apart.
- **Build order is not play order.** Build the Watch first: no engine work, no extra state, so it proves the lexicon and sheet machinery. Then the Bridges (small engine work), then the Banks (the gauge), then the Saltmarket (the inverted verdict).
- **Four is the right number, and the Watch is the first to cut.**
  - The four cover what the user was told: fishing and pasture (Banks), trade routes (Bridges on the road, Saltmarket at the market), arms races (Watch).
  - They give four different evenings: be gentle, the water remembers; be first after a standoff, not with strangers; find the rhythm; your trust costs someone else.
  - If only three are built, cut the Watch and say plainly that arms races are not covered. No reserve measured so far fills that slot: the Fog Line and the Crossroads fail H3, the Two Shores is not felt by day 3, and the theorist's Border fails H5.
- **Not too alike, with two cautions.** The Watch and the Saltmarket share card numbers. The Banks and the Watch both reward reopening after a standoff. Order and wording keep them apart; the settings do not.

## 5. What the proposers missed

1. **Every proposed kind act is a restraint**: keep to your water, give way, hold the price, stand down. PAGE-MAP warns that a restraint gives "sent", "arrived" and "turned back" nothing to attach to. So every place costs the top of its range (about 170 strings and 1,150 words), not 133. The seat's "smallest page change of the four" for the Bridges understates this.
2. **The sheet's grammar.** In the valley the arrow is the kind act arriving. In all four new places the conspicuous event is the unkind one: nets across, a fire, a cut price, a cart that comes on. Decide once: keep "filled arrow and filled mark = the costly kind act" in every place, so "Your ways" reads the same everywhere, and let the crossing glyph carry the skin.
3. **The five situation titles.** These are 25 strings per place (the engine's titles, KNOW_ROWS, WHERE_THEY, DEED_SIT, the whyThird list). They are what the visitor reads most, since "Your ways" is always on screen. No proposal wrote them in full.
4. **Scales have ends.** The Banks' "fills by one" and "loses three" are false on most days (measured).
5. **Whole numbers.** Eighths make the day's sum unreadable (measured: 46-61% of cards). Only the seat avoided them.
6. **Stated sums must equal the card.** The Bridges' line does not.
7. **Zero.** The Saltmarket's town clause, and stores and needs at or below zero in the Bridges, break the meter and the stored lives.
8. **What is counted must be what is shown.**
   - Banks: the Afterwards must draw levels.
   - Saltmarket: the Mark should count pairs.
   - Prover's Shoal: it counts hands while the card shows water.
9. **Arrivals as a list** (Banks), on four page sites.
10. **Opening length.** The Banks' stakes line is 45 words against the valley's 23. PAGE-MAP measured 50 px spare on a laptop Opening with earlier lives, and the place chooser needs about 56. Cap each place's stakes line near 30 words (argued).
11. **Keep 'lost' luck in all four.** None of the chosen four uses 'unseen' or 'phantom'. That keeps the store from witnessing what the sentence withholds, and it should be a stated rule for the pack.
12. **Forbidden words in new skins.** "Firm" and "steady" stay forbidden: no "hold the price firm", no "the bank holds steady". Each place needs a leak list of the other places' skin words in page-smoke.
13. **Earlier lives across places.** List only the place in hand. The Saltmarket's mark is the town's and is not comparable with the valley's.

## 6. Reserves (ranked; neither is ready)

- **R1. The Crossroads** (seat's version: B 4, a stranger replaces a neighbour before day 3, three arrivals). The card resetting to "You have not dealt with them yet" is felt by day 3. The prover measured that strangers leave the valley's best way best (H3 fails); fixing that needs more than one stranger per Life (engine work).
- **R2. The Two Shores** (`SIDES`). It is felt only at the first season's end. It needs the seat's seat-by-side rule (about 5 lines, argued) to be felt by day 3.

## 7. Files

`firsttimer.js` and `-out.txt`, `banks-gauge.js` and `-out.txt`, `watch-merge.js` and `-out.txt`, `salt-both.js` and `-out.txt`, `bridges-founders.js` and `-out.txt`, and this `REVIEW.md`.
