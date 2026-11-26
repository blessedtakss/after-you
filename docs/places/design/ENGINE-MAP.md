> **Record of its time.** Written 2026-11-23 01:15 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Engine map: what each place dial touches

Scope: `engine.js` as shipped (1295 lines, md5 `6090c8f63791b1ea6ef39a197db9bc7e`). Line numbers are that file's. "Proto" is `engine-proto.js` in this folder, generated from it by `make-proto.py` (36 exact-string patches; the patch names in brackets below are that script's tags).

Every statement here is marked by how it is known:

- **[measured]** run in this folder; the output is in `map-evidence-out.txt`, `example-*-out.txt`, `proto-checks-out.txt` or `identity-out.txt`. Sweeps are 30 seeds at 150 or 200 futures unless a count is given; a mean mark carries a standard error of about 2 points across seeds.
- **[argued]** reasoned from the code, not run.

All place measurements are one dial moved off the valley with nothing else tuned. They show what a dial does to the engine, not what a finished place will score.

## 1. Summary

| Dial | In proto | Engine sites | Draws | Need rule | "Holds" | Last-day replay and seal | Range | Risk |
|---|---|---|---|---|---|---|---|---|
| D1 stakes `S`, `H` (and `B`, `C`) | yes | 3 arithmetic sites | none | must be re-centred | unchanged for S; H needs another count | grab stops paying; seal's last-day clauses go quiet | best region moves | low in code, high in tuning |
| D2 luck level `FOG` | already there | none | same | drifts (custom's store 49.1 at 0.10 against 60.2) | baseline falls fast | unchanged | unchanged | low |
| D2 luck kind `LUCK_KIND` | yes | 12 (one shared yesterday becomes two views) | same key, taken on sent or unsent hands | small shift | denominator changes | reads the house's belief | unchanged | medium; the store gives the truth away |
| D3 charter inverted | lab only | 5 (verdict side only) | none | unchanged | same counts, read reversed | **breaks**: the grab serves both results | best/worst/rank must flip | high in design, low in code |
| D4 custom `CUSTOM` | yes | 5 uses of `OLD_WAY` + the range list | none for 0/1 customs; one new purpose otherwise | re-centre | unchanged | unchanged | custom joins the list | low for 0/1, medium otherwise |
| D5 stranger in the Life `TURNOVER` | yes | 4 + a state reset | 3 keyed by seed | small shift | unchanged | unchanged | unchanged | medium |
| D5 more arrivals `ARRIVALS` | yes | 2 in the futures | one per arrival | unchanged | baseline moves a lot | unchanged | unchanged | low |
| D5 end not known in advance | no | about 8 | one keyed by seed | scales with length | unchanged | "day 12" becomes "the last day" | unchanged | medium |
| D6 stock `STOCK` | yes | 8 | none | re-centre | hands do not see the level | carried in the cloned state | unchanged | low in code |
| D7 own side `SIDES` | yes | 2 (one line each) | same | unchanged | baseline moves | unchanged | unchanged | low |
| D7 copy the many | no | 2 blocks of about 15 lines | fewer | unchanged | unknown | unchanged | unchanged | medium to high (way labels, Why? sources) |
| D8 sight | no | 4 to 10 | none | unchanged | unchanged | "a day late" changes the tested situation | unchanged | high on the page |
| D9 founders `FOUNDERS`, `NEWCOMER` | yes | 3 | seat-keyed | re-centre | baseline moves | unchanged | unchanged | low in code, high in tuning |

Two extra proto parameters that are not on the dial list but were needed to read the others: `FLOW_KIND` (what "holds" counts) and `RANGE_WAYS`.

## 2. Anatomy the dials share

**The stakes are computed in three places.** `playDay` 678-679 (every house's gain), `playDay` 701 (the player's payoff as handed to the page) and `simulate` 985 (the futures). The Life and the futures are two separate implementations of the same day; any rule added to one must be added to the other. Proto check 2 ties them together: a season's total income in the futures must equal `(B - C) x hands + 2S x both-days - 2H x neither-days` [measured: 1800 seasons, 0 wrong].

**One shared yesterday per tie.** `life.last[t] = [aArrived, bArrived]` (677) is read as each side's situation in seven places: `createLife` 601-602, `today` 616, `playDay` 673-674, `replayLastDay` 849-851, `endState` 835, `scenario` 887 (as `la`, `lb`), and in `simulate` 972-973. Both sides always agree about yesterday. D2's other kinds and D8's delay break exactly this.

**The custom is `OLD_WAY` in five places.** 390 (definition), 533 (kin's founding way), 602 (the reference Life, which tests `=== 1`), 821 (the heir's untested ways), 896 (the baseline heir), 1220 (finding the old way among the range ways).

**Two Looking-Rounds.** In the Life: `lookingRound` 731-804 (kin learns 741-754; never house 0 or kin 758; model 764; chance 765; copy as witnessed 773-782; drift 787-792). In the futures: 996-1052 (pick 997-1005; model 1008-1010; chance 1011-1013; copy 1014; drift 1016-1025; applied together 1037-1052). D7 touches both.

**What crosses from the Life to the futures.** `endState` 829-839 to `scenario` 872-908 to `scratch` 910-918 and the copies at 929-930. New per-tie or per-house state (D2's views, D6's stock) must be added at all four.

**Keyed draws.** `draw(seed, purpose, t, a, b, future)` 453; the key packs `a` and `b` into 4 bits each (452). Purposes 1 to 19 are in use (11 is retired and must stay retired). The proto adds 20 (the reference Life's coin, only for a custom with a middling chance) and 21 (the stranger), and reuses existing purposes with fresh sub-keys (seat index for D9, arrival index for D5). A new purpose can never disturb an old draw.

**The copying scale.** `chanceToCopy` 511 takes income per tie per day (765, 1013) against `K = 0.5` measures. Any dial that widens incomes sharpens copying without touching `K`.

## 3. The dials

### D1 Stakes: `mine = B x [theirs arrived] - C x [mine arrived] + S x [both arrived] - H x [neither arrived]`

**Sites.** 360-361 (`B`, `C` exist, marked "fixed by the design"); 678-679, 701, 985 [proto: `playday-loop`, `sim-loop`]. Indirect: 765 and 1013 (copying scale), 588-591 (need). The header's "payoff (-1, 0, 2 or 3 with the default stakes)" at line 150 is documentation only. Valley harness: `bestReply` 154-174 and `grabIfDecides` 139-140 hard-code 3 and 1.

**Easy.** Three lines of arithmetic. No draws. With whole-number stakes the store stays a whole number. Cost paid only on a hand that arrived, as now.

**Risky.**

- *Need.* `NEED_PIVOT 59` is the custom's typical store in the valley [measured: median 58, mean 57.1, sd 8.9 over 2000 seeds]. With `S 2` the custom's median store is 104 (sd 21.9) and the rule collapses to "custom + 1": the need is on average 1.2 above the custom, `always` keeps the house in 75.0% of 2000 Lives and `careful` in 92.2% [measured]. With `H 3` the median is 23 (range -56 to 78), the rule puts the need 25.2 above it, `careful` keeps 8.2% and `always` 81.7% [measured]. Re-centred with `Lab.tuneNeed` (pivot = the custom's median there, margin searched): `S 2` gives pivot 103, margin 22, `careful` 50.6%, `always` 35.8%; `H 3` gives pivot 23, margin 8, `careful` 50.3% but `always` 97.3% [measured, 1000 seeds]. So re-centring repairs S and does not repair H.
- *The valley's temptation disappears when `S > C`.* Staying home against a house that sends now loses grain: on day 12 sending to all four is worth +1.0 instead of -3.8 (30 seeds), and `careful+grab` ends 2.5 measures below `careful` (2000 seeds) [measured]. `boughtOnLastDay` is then never true (0% [measured]). A fear place needs its own tempting act; the engine has no notion of one other than the day-12 grab.
- *With `H` large one plain way wins the store.* At `H 3` `always` ends with 53.1 measures against 21.2 for the custom and 32.2 for `careful` (2000 seeds), and on the grid of 243 lived ways the five best by store all send after being left short, `always` third among them (6 seeds) [measured]. H5 forbids a trivially best way; an H place needs founders and a custom under which yielding is not free.
- *Copying sharpens.* `S 2`: baseline holds in 84.6% of futures at `K 0.5`, 71.8% at `K 1`, 58.7% at `K 2`, and the share of seeds with a baseline inside 15..85 goes 40%, 83%, 97% [measured]. `K` is the lever that brings an S place back from the ceiling.
- *Negative stores* (`never` under `H 3`: -48.2 [measured]) and, with fractional stakes, fractional stores. The engine copes; the page's meter and wording must.

**Determinism.** Untouched [measured: proto check 7].
**What-ifs.** Unchanged in mechanism.
**Last-day replay.** Still replays "stayed home after both helped", which under `S > C` or large `H` is no longer the selfish act. The seal reduces to "house kept and mark clear".
**Range.** The thirteen were chosen for the valley. Best lived ways by mark: valley `[0,1,1,1,0]`, `S 2` `[.,1,0.5,1,0.5]`, `H 3` `[1,1,0.5,.,0.5]` [measured, 6 seeds x 60 futures: indicative only].
**Holds.** `S 2`: the baseline holds in 84.8% of futures (median seed 87.0), is inside 15..85 in 47% of seeds, and the listed ways are 25 points apart in 70% of seeds. `H 3`: 89.6% (median 93.5), inside 15..85 in 20%, 25 points apart in 13% [measured]. Counting tie-days on which both hands arrived (`FLOW_KIND 'both'`) gives `H 3` a baseline of 43.0%, inside 15..85 in 87% of seeds, 25 points apart in 67%; counting tie-days with at least one hand gives 95 to 99% whatever the house does [measured]. Why hands separate the ways so little under H is not established here.

### D2 Luck

**Level.** `FOG` 362, used at 664, 926, 936, 979, 983. Already a parameter. At 0.10 (kind 'lost') the baseline falls to 18.9%, `careful` still keeps 36.7% with a mark of +9.3, the spread reaches 25 points in 57% of seeds [measured]. The valley's custom cannot reopen a quarrel, so a foggy place needs a forgiving custom (D4) or it starts near the floor.

**Kind.** Sites: `move` 657-666 (the draw at 664); the tie loop 673-694 (`last`, tallies, `seen`, the Why? records); 702-711 (`lost`, `arrived`, `they`, `kinWith`); `today` 616; `createLife` 601-602; `replayLastDay` 849-851; `endState` 835; `scenario` 880, 887; `scratch` 913; `simulate` 936 (the `1 - FOG` in the denominator), 973, 979, 983, 984, 987; `whyRecord` 501-507 [proto: `playday-move`, `playday-loop`, `today-sit`, `createlife-ref`, `replay-sit`, `endstate`, `scenario-arrays`, `scenario-last`, `scratch`, `sim-vars`, `sim-denom`, `sim-loop`].

The proto keeps `last[t]` as what really arrived and adds `view[t] = [a's hand as b saw it, b's as a saw it]` only when the kind is not 'lost'. Each side's situation is (its own deed, the other's as seen). Tallies, `seen` and the Why? records take what was seen.

- `'lost'` (valley): turned back, costs and pays nothing, the sender knows.
- `'unseen'`: arrives and pays; the receiver and every witness saw none. [measured: 9.9% of 2880 sent hands at FOG 0.1; at FOG 1 with mirror founders every day-1 hand pays and no neighbour sends on day 2]
- `'phantom'`: nothing sent or paid; a hand was seen. [measured: 9.9% of 2880 unsent hands]

**Easy.** About 25 changed lines; the draw keeps its key.

**Risky.**

- *The store tells the truth that sight hides.* Under 'unseen' a hand that "did not come" still added 3 to the store. Any page that prints the day's income, or the store before and after, lets the reader work out what really happened, which breaks the rule that the page never says whether a missing hand was luck or choice. Either the store is shown only at the season's end (a D8 change with its own cost) or the fiction must make "it reached you, you could not tell whose doing it was" natural. This is the main cost of the dial and it is on the page, not in the engine.
- *The sender no longer knows.* `yesterday.lost` is always false under the other kinds. The valley's "your hand was turned back" line and the `forgiving` policy's repair have nothing to act on. The truth is carried in `results[i].seenByThem` and `.theyArrived`, marked internal.
- *The same `FOG` number means different amounts of noise.* 'lost' and 'unseen' draw per hand sent; 'phantom' per hand not sent. In a place where few send, phantoms are common.
- *Phantoms repair quarrels.* At FOG 0.04 the baseline holds in 94.6% of futures (valley 45.7%), `careful` has a mark of -2.8, the baseline is inside 15..85 in 10% of seeds [measured]. A phantom place needs a different custom or founders to have any room.
- *'Unseen' alone barely changes the outcome.* Baseline 46.9% at 0.04 and 18.8% at 0.10 against 45.7% and 18.9% for 'lost'. What changes is the store: `careful` keeps 40% and 67% against 30% and 37%, because unseen hands still pay [measured]. Its effect on play is entirely in what the person knows.
- *Witnesses inherit the misperception.* Copying "as witnessed" (773-782, 1014) uses the seen tallies, so under 'unseen' a house that always sends is witnessed at `1 - FOG`.

**Determinism.** Same purpose and key; the draw is consumed on a sent hand ('lost', 'unseen') or an unsent one ('phantom'). G5's line "the ford agrees wherever both runs sent" needs rewording for 'phantom'. [measured: check 7 passes on both kinds]
**What-ifs.** Unchanged.
**Last-day replay.** `sitOf(...) === 1` at 851 becomes the house's belief that both helped. [proto does this]
**Need.** The reference Life lives the same luck; only the pivot drifts (custom's mean store 62.1 under unseen 0.04, 67.5 under phantom 0.04, against 60.2 on the same 30 seeds) [measured].
**Holds.** Help flow divides by `1 - FOG` (936) so that full sending reads 1.0. Under the other kinds every sent hand arrives and the proto drops that term.

### D3 Charter inverted

**Sites.** `stepRun` 1092 and `runFuture` 1131 (`held`), `levelOf` 1120-1122, `headline` 1267 (mark), `verdictStep` 1219 (rank counts ways that hold *more* often), 1223-1227 (best, worst), 1250-1253 (seal: `delta > 0`, `markClear`). `simulate` is untouched if only the reading flips.

**Easy.** The inverted mark is the negative of the mark on the same futures, with the same standard error. `Lab` does this with `CHARTER: 'breaks'` [measured: 36 Lives, every inverted row is the mirror image].

**Risky.** Inversion alone removes the game's trade instead of reversing it. On valley stakes read the other way [measured]:

| way | store kept | charter mark | seal (lab rule) |
|---|---|---|---|
| `careful` | 30.0% | -10.0 | 0% |
| `careful+grab` | 80.0% | -3.2 | 0% |
| `careful+grab3` | 36.7% | +21.4 | 30.0% |
| `never` | 0% | +33.4 | 0% |

Taking on the last day now improves both results, and taking for the last three days earns the seal in 30% of Lives while keeping the house more often than honest play. The engine's two last-day clauses cannot see it: `boughtOnLastDay` still withholds the seal for the act the charter wants, `lastDayCost` has the wrong sign, and the replay only looks at day 12 "after both helped", which a three-day taker is no longer in (0% of `careful+grab3` Lives have a last-day entry). The lab adds a mirrored clause (`markBoughtOnLastDay`), which catches a one-day grab and not a three-day one.

A ring place therefore needs, argued and not built: stakes under which the *store* depends on the ring to the last day (so that leaving it costs the house), and a seal rule written for that place's act. The need rule does not move.

**Determinism, what-ifs.** Untouched; `mattered` already uses the absolute effect.
**Range.** `rank`, `bestPct`, `worstPct` assume more holding is better.
**Holds.** `level` ('holds', 'frays', 'fails') reads backwards.

### D4 Custom of the place

**Sites.** The five uses of `OLD_WAY` listed in section 2, plus `RANGE_WAYS` 405 [proto: `founder-kin`, `createlife-ref`, `legacy-heir`, `scenario-old`, `job-range`, `step-range`]. Valley harness: `OLD_WAY` 29, `plainRule` 39, `milker` 182, the mirror's "unlike" test 262, G1's "plain = 0".

**Easy.** For a custom of 0s and 1s (32 exist): five substitutions. The custom lived by a house is then the reference Life exactly: store equal, need never met, mark exactly 0 [measured: 140 Lives across 14 settings].

**Risky.**

- *A middling chance.* Line 602 tests `=== 1`, so a custom such as `[1,1,0.33,1,0.33]` silently becomes "never" there. The proto draws it with a keyed coin (purpose 20). But a house that follows such a custom to the letter leaves tallies (3 of 10), while the baseline heir carries the custom itself, so its mark is no longer 0 (up to 2.5 points at 80 futures [measured]). The page would also have to state the custom as a rate. Recommendation: 0s and 1s only.
- *A custom must be able to start.* With 0 in the first place two houses on the custom never begin. The valley's own custom cannot reopen after both stayed home, which is why it falls short; that is a design property, not an accident.
- *A kinder custom is not a stronger baseline.* `[1,1,0,1,1]` (reopens every time): baseline 41.4% against the valley's 45.7% on the same seeds [measured]; a house that reopens also reopens with the taker [argued]. `forgiving` keeps 46.7% and `careful` 50.0% against 16.7% and 30.0% while the mean need barely moves (65.6 against 65.9) [measured]: stores sit so close to the need that a small shift in the reference Life moves the kept share a long way.
- `verdict().range.oldWayPct` (1220) is found by matching the custom among the range ways. With a custom outside the thirteen it would be `null`; the proto appends the custom, making fourteen [measured: check 9]. The page's "thirteen plain ways" must then read `range.of`.

**Determinism.** Untouched for 0/1 customs.
**What-ifs.** A never-tested way starts from the custom's habit (821 feeds 1176).
**Need.** Still "the custom's store on the same luck"; re-centre the pivot.

### D5 Clock

**(a) A stranger replaces a neighbour during the Life** [proto: `TURNOVER`, patches `helpers`, `newlife-return`, `playday-turnover`, `today-push`].

What has to be reset for house x: name, kind, custom (fresh jitter draws: the proto uses ids 8..15, free in the key), sources, public tally, purse and season income, its four ties back to "meeting someone new" (`last`, and `view`), `seen`, `seenSince`, `seenFar`, `changedDay`, `yesterday[x]`. Never kin. Who, when and what kind come from the seed alone, so the reference Life gets the same stranger and the need stays fair [measured: 60 Lives, none differ between a house that always sends and one that never does].

Found while building it: the stranger must arrive *between* days, after the previous day's Looking-Round, so that `today()` already shows the new house. Arriving inside `playDay` books the choice made for the old family under "meeting someone new" and the custom's own Life stops matching the baseline [measured: 4 of 30 seeds, before the fix].

Loose ends in the proto: the stranger keeps way label x (the label then means two families in the Afterwards strip); one name is held back from the Afterwards newcomer's pool; arrival is at a season's start (days 5 or 9) because a mid-season arrival would be compared on a short season's income at 765.

Effect: small. One stranger gives one more "meeting someone new" precedent (5.0 against 4.0 per Life [measured]), baseline 47.6% against 45.7%, `careful` 30.0% kept with +12.9, the grab still decides (63.3%) [measured]. One replacement does not by itself make a place play differently; a crossroads place would need the stranger's kind or the founders to carry it.

**(b) More arrivals in the Afterwards** [proto: `ARRIVALS`, patches `sim-arrive-when`, `sim-arrive-if`]. Sites 935, 945-965. Each arrival has its own keyed season. Loose end: all newcomers share way label 8. `runFuture().arrival` stays the valley's; `arrivals` lists all (in the order they happen). Effect: none 60.2%, one 45.7%, three in seasons 2..20 28.1% baseline; with three, the spread reaches 25 points in 70% of seeds and `careful+grab` has a mark of -0.3 [measured]. This is a strong, cheap lever on how hard the place is to hold.

**(c) An end not known in advance** [not in proto; argued]. `DAYS = 12` (388) is used at 631 (`today`), 650 (capturing the last day), 726 (`over`) and 970 (day numbers in the futures, where it only needs to stay unique). A Life that ends on a seed-keyed day in 10..12 needs: a per-life length; a final Looking-Round on whatever day is last (719 fires only on days 4, 8, 12, so kin's last lesson and the season's pay would be skipped); a short last season normalised at 765; "the last day" in place of "day 12" in the replay and the page. About 25 lines, and the need should then follow the reference Life one for one or use a pivot per length. Its effect on play is to remove the timed grab, which is the valley's central trade; a place using it needs a different one.

**Determinism.** All of (a), (b), (c) are choice-independent keyed draws [measured for (a), (b)].

### D6 Stock

**Sites** [proto: `newlife-return`, `playday-loop`, `today-push`, `endstate`, `scenario-arrays`, `scenario-last`, `scratch`, `sim-vars`, `sim-loop`]. A level per tie; a hand is worth `B x level` (the level before today's change); then the level moves by `delta[hands that arrived on the tie today]` within `min..max`. State added to the Life only when the dial is on. `today().neighbours[i].stock` and `results[i].stock` expose it. An arrival leaves a tie's level as it is (the level belongs to the ground, not the family).

**Easy.** No draws. The reference Life, the last-day replay and the what-ifs all carry the level because it lives in the state they clone. [measured: check 1 recomputes 5376 payoffs and every level; check 6 bounds]

**Risky.**

- *Fractional stores.* Use steps of 1/8 so sums stay exact; the need is rounded at 589.
- *Need.* With `start 1, min 0.5, max 1.5, delta [-1/8, -1/8, +1/8]` the custom's store is 87.0 and the valley's pivot gives "custom + 2": `careful` keeps 63%, `careful+grab` 90% [measured]. Re-centre.
- *"Holds" does not see the level.* Help flow counts hands. A place can hold by hands on exhausted ground. If the charter is about the ground, the futures need a fourth count (mean level over the last ten seasons): about four lines at 986-991, not in the proto.
- *The last day is not made costlier by this setting.* Sending instead of staying home on day 12 is worth -3.8 to the store and +7.6 points of mark, against -3.8 and +8.0 without stock [measured]. If a stock place is meant to make the last day bite harder, the level has to enter the charter.
- `runFuture().seasons` does not record levels; the Afterwards strip could not draw them without about three more lines.
- Baseline 81.7%, inside 15..85 in 47% of seeds: this setting also pushes against the ceiling [measured].

### D7 Schooling

**Own side** [proto: `SIDES`, patches `helpers`, `round-model`, `sim-model`]. The model is drawn among own-side neighbours (764, 1010); the draw keeps its key. Two halves `[0,0,0,0,1,1,1,1]`: baseline 36.4%, `careful` +9.2, spread of 25 in 80% of seeds. Alternate houses: 44.0%, +9.8, 90% [measured]. Kin is still drawn among all four neighbours (544); a place that wants kin on the player's side needs one more line. [measured: 452 looks and adoptions, none across sides]

**Copy the many** [not in proto; argued]. The adopter takes, per situation, the average witnessed habit of its neighbours, with a chance that does not depend on income. Both Looking-Rounds change (773-782 and 1014-1015). The cost is not the arithmetic but the labels: `way` (whose way a house runs), the 'adopt' events' `model` and `wayName`, `yourWaysAtEnd`, and the Why? card's `source.from` all assume one model. A new source type and a new sentence on the Afterwards strip are needed. Expected effect: whatever is common stays common, so both good and bad ways spread less and marks shrink; G3 and G6 are the gates at risk.

**Determinism, what-ifs, replay, need, range.** Untouched in mechanism for both.

### D8 Sight [not in proto; argued]

Three audiences read what happened: the houses (their situations), the witnesses (tallies, hence copying) and the person (`today()`).

- *Totals only, for the person's knowledge of neighbours.* `today().seen` pooled over situations. A page change; the engine already has the numbers (617-629).
- *Totals only, for witnesses.* Copy the model's overall rate into all five habits (773-782, 1014): about four lines each. It removes conditional ways from everything except kin, so reciprocity cannot be taught; G3's spread is the gate at risk.
- *Totals only, for the person's own ties* ("three hands came, not from whom") conflicts with H1: the card could not name the situation the choice is tallied under.
- *A day late.* Situations read the day before yesterday: a second `last` array at the sites listed in section 2, plus `scratch`; about 15 lines. Every tie becomes two interleaved chains, "meeting someone new" lasts two days (8 precedents), and the page must withhold today's results for a day while the store, again, gives them away.

No draws are involved in any form.

### D9 Founders

**Sites.** `BANDS` 379-385, `FAR_POOL` 386, `founder` 521-535, the seats 546-552, the newcomer 949 and 961 [proto: `founder-sig`, `newlife-seats`, `sim-newcomer`]. A place may give `near` (three entries, each a kind or a list to draw from), `far` (a pool), its own `kinds` as five bands, and a `NEWCOMER` kind. [measured: 200 valleys, seats and bands as asked]

**Risky.** The valley's balance is one taker and one soft house beside the player.

- No taker near: the custom's store is 80.7, the pivot gives "custom + 1", `careful` keeps 80% and `careful+grab` 100%; baseline 61.7% [measured].
- Two takers near: the custom's store is 36.3, the need 54.0 is out of reach (`careful` 3.3%); baseline 25.6%, inside 15..85 in 67% of seeds [measured].
- Every helping kind must be able to reopen after both stayed home (the valley's own finding: the ford only removes hands, so a zero there makes quarrels permanent). Under 'phantom' luck that no longer holds.
- The valley harness names kinds in `reader` (56-65), `kindLikelihood` (474-492) and line 587; a place with other kinds needs its own.

**Determinism.** Seat draws keep purpose 14 with the seat index as sub-key when `near` is given; the valley's path is untouched.

## 4. Cross-cutting

**The need rule.** `need = max(custom's store + 1, round(PIVOT + WEIGHT x (custom's store - PIVOT) + MARGIN))`, 588-591. The pivot is a typical store for the custom in that world. It must be set per place from a measurement (`Lab.tuneNeed`, 0.5 s for 1000 seeds); with the pivot left at 59 the rule degenerates in every setting that moves the custom's store [measured: S 2, H 3, stock, both founder settings]. `tuneNeed` with pivot 59 and a target of 39.3% returns margin 6 for the valley, the shipped rule [measured, 2000 seeds]. The margin that gives a competent honest house an even chance is not a fixed multiple of the spread (valley 0.6 sd, S 2 1.0 sd, H 3 0.5 sd [measured]); it has to be searched with the place's own honest way.

**"Holds".** `late help flow >= HOLD_LINE` at 1092, flow at 991 and 936. It carries over where hands arriving is what the charter is about. It needs a place form under `H` (use both-days), under luck kinds other than 'lost' (denominator), under D3 (reversed) and under D6 if the ground matters (a level count). The valley's "not a lottery" gate (baseline inside 15..85 in at least 60% of seeds) fails as measured for S 2, H 3, phantom luck and the stock setting, and passes for fog 0.10, unseen luck, turnover, sides, 0 or 3 arrivals, the two custom variants and both founder variants.

**The range of thirteen.** 398-405, 1167-1172, 1215-1228. A per-place list plus the custom. The proto takes `RANGE_WAYS`. The count on the page must come from `range.of`.

**The what-ifs.** 863-866, 900-905, 1173-1184, 1229-1239. No dial changes the mechanism. Each is a row of 1000 futures; the proto's loop is 13% slower than the shipped one (0.158 s against 0.140 s per 4000 futures; a full verdict 0.93 s against 0.81 s [measured, `speed.js`]).

**The last-day replay and the seal.** 844-858, 1185-1191, 1240-1255. They encode one specific act: staying home on day 12 against a neighbour after both helped. That act is the place's temptation only where stakes keep `C > S` and `C > H`, the charter is 'holds' and the end is known. Elsewhere the seal still computes but no longer means "not bought". A place whose temptation is another act needs that act named in the engine (a per-place replay rule), which is the largest piece of engine work not in the proto.

**Determinism.** Every dial in the proto leaves every shared draw unchanged when one choice is flipped [measured: 14 settings x 2 seeds, 224 flips, 10.8 million shared draws, 0 differ, no key drawn twice with two values].

## 5. Valley gates in a place

| Gate | Carries over | What a place needs |
|---|---|---|
| G1 temptation is real | form only | Its own honest and tempted policies; `reader` reads the valley's kinds. "Custom = 0%" holds everywhere by construction [measured]. "+last1 at least 12 points above" applies only where the grab is the temptation: at S 2 the grab *loses* 7 points of need-met (92.2% to 85.2%, 2000 seeds) [measured]. |
| G2 the grab costs the valley | form only | The place's tempting act in place of the grab. |
| G3 attribution (spread of 25 in 80% of seeds) | yes | The place's range ways. `Lab.carried` and the spread line of `Lab.sweep`. |
| G4 no trivial way | yes | Also check by store: `Lab.bestWay().trivial`. |
| G5 determinism | yes | One wording change under 'phantom'. Turnover and an unknown end must not depend on play. |
| G6 a habit matters | yes | Not measured in any place setting. |
| G7 not a lottery (baseline in 15..85) | yes | The baseline line of `Lab.sweep`. |
| G8 the mirror shows | yes | The kin rule is untouched by every dial. Not measured in any place setting. |
| G9 the situations come up | yes | Median 5 of 5 for S 2, H 3, fog 0.10, unseen 0.10, turnover; 4 of 5 for phantom 0.10 [measured, 400 seeds, forgiving]. |
| G10 no recipe wins both | form only | Its own policy list. |
| X1 the last day decides | no | Valley-specific. |
| X2 the seal is not for sale | form only | The place's tempting act; a different clause under D3. |

The harness's `live(seed, policy, overrides, script)` (244) already takes overrides, so a per-place harness can reuse it once the policies are the place's own.

## 6. Extending the shipped engine without moving the valley (H4)

What the proto proves: all the dials above can live in one engine and leave the valley's output identical. `identity.js` compares `engine.js` with `engine-proto.js` at defaults: 337 Lives (60 seeds x 5 ways at 300 futures, 3 seeds x 5 ways at 2000 / 1000 futures, 22 with string seeds or the valley's own tunables moved), 14,136 JSON strings (`today()` after every day, `playDay()`, `ways()`, `legacy()`, the whole life state less `params`, `verdict()`, `runFuture()`, `project()`), 43.5 MB, 0 differ [measured, 197 s].

How it was kept identical, as rules for the real change:

1. A place is an overrides object given to `createLife`; the Life already carries its `params` everywhere (replay, verdict, clones).
2. New state exists only when its dial is on (`view`, `stock`, `turnover`), so a valley Life is the same object as before, field for field. Only `life.params` gains keys.
3. New randomness is a new purpose or a new sub-key, never a reordering.
4. Default arithmetic adds exact zeros (`+ 0 x both - 0 x neither`) and multiplies by the same factors in the same order.
5. Ship `identity.js`'s method as a gate: hashes of the valley's JSON for fixed seeds and ways, recorded from today's engine, compared on every run.

Costs: the futures loop is 13% slower with the extra branches; the alternative is two loops to keep in step.

## 7. Not in the proto

D5 an end not known in advance; D7 copying the many; D8 sight; a per-place replay rule for a temptation other than the day-12 grab; an inverted charter inside `verdict()` itself (range, rank, seal); a stock count in "holds"; levels in `runFuture().seasons`; kin restricted to the player's side. Each is described above with its sites. None was run.
