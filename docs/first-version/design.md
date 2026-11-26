> **Record of its time.** Written 2026-11-22 12:41 (local time, UTC+10) for v0.1.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../checks/). The game has changed since; the code is the authority on what it does now.

## 1. NAME AND ONE-SENTENCE PITCH

Candidates: **After You**, **The Afterwards**, **Hollow Petals**.

You live eight seasons as one household among sixteen whose neighbours copy whoever prospers, then you leave, and the game scores the world your habits left behind across 200 futures run on identical luck.

## 2. DESIGN PILLARS

1. **You write a strategy by living it.** Hand-played choices compile into a visible five-number custom.
2. **The verdict is the world without you.** A custom must survive being copied, misremembered and invaded.
3. **Every outcome is traceable.** Luck is a pre-rolled tape, so what-ifs replay exactly and the game can name the decision that mattered.
4. **Structure, not sermon.** No matrix is shown, and cooperation is sometimes the harm.

**Spine:** C2 (After You), the only concept where the dilemma itself is the engine.

**Grafts:** (a) C4's luck tape and sealed forecast; (b) C6's dated deed card as the answer to "Why?", with C3's seating rule as one Borrowed Day; (c) C3's conjecture tiles; (d) C3's validator as a build gate.

**Left out:** C5's promise-weighing and C1's remembered town each need a second engine and heavy writing. C4's card programming removes the hand play that compiles the custom. C3's clause drafting relies on authored exploits players exhaust. C6's one-soul premise dissolves the conflict of interest; it survives as one day and one Place.

## 3. THE CORE LOOP

A Life takes about six minutes.

1. **Read the map.** Sixteen houses on a ring, drawn as five-petal flowers sized by wealth. A hollow petal is a trait nobody has seen tested.
2. **Play the day.** One card per neighbour (four), each a domain lever such as lend or keep.
3. **Habits take over.** Each choice moves the matching petal. Settled petals auto-play; the game stops only at flashpoints (a slight, a stranger, a peace offer), and each mints a dated deed card.
4. **Looking-Round, every fifth day.** Each house may adopt a richer neighbour's custom as it saw it.
5. **One Deed per season.** Endow (make a house look successful), Shun (cut a tie) or Tell (pay to have a petal witnessed).
6. **Borrowed Day, season 5.** You play one day from the house your custom has cost most, facing copies of yourself.
7. **Seal a forecast** (falls, contested, holds) and depart. An heir runs your custom.
8. **The Afterwards.** Thirty seasons in twenty seconds, with one shock (takers arrive).
9. **The Chronicle.** Verdict over 200 futures, the hinge decision, and rewind.

**Example turn.** Quiet Valley, season 6. Three cards auto-lend. The game pauses on Kesh: yesterday you lent and he kept. You tap "Why?" and his card turns over: "You let it pass: season 4, day 3." You pull Keep; Mercy drops from 0.44 to 0.31. Then you tap Odile, who keeps feeding him. Her Mercy card is blank: she copied you before you had ever answered a slight, and guessed 0.8. You spend your Deed on Tell, so nearby houses see your real Mercy.

## 4. THE DILEMMA ENGINE

**Payoff per tie per day:** mine = b×[they gave] − c×[I gave] + s×[both gave] − h×[both held]. Default b=3, c=1, s=h=0: temptation 3, reward 2, punishment 0, sucker −1.

**Custom:** five probabilities of giving. Greeting (first meeting), Loyalty (after both gave), Mercy (I gave, you held), Conscience (I held, you gave), Truce (both held). This is the full memory-one strategy space plus an opening move.

**Spread and verdict:** a house copies a neighbour with chance income gap/20, capped at 60%. A future holds if income per tie stays above 60% of the all-giving level at season +30. A hinge is named only when changing one decision moves the verdict 15 points on the same tapes.

|Dial|Range|Effect on play|
|---|---|---|
|Stakes|b 2-5, c 1-2, s 0-3, h 0-3, per seat|s, h both under c: true dilemma. s over c: assurance. h over c: standoff. c/b sets the future reciprocity needs; 1 − c/b caps safe Mercy at s=h=0|
|Fog|0-15%; slip or misread|Strict customs feud by accident|
|Clock|settled; turnover 5-20%; known last day|A known end unravels from the back|
|Web|ring, two rows, hubs, directed chain, islands|Decides who can answer whom|
|Schooling|copy as seen; copy whole; own side only; by birth|Separates whom you play from whom you teach|
|Sight|exact; totals only; delayed; hidden stock|Decides whether blame can be assigned|
|Table|pairs; pooled pot; volunteer|Free-riding and one-hero problems|
|Shore|none; outsiders lose 0-2 per mutual give; overseer punishes peace|Cooperation becomes the harm; the charter can invert|

**No dominant custom.** Low Mercy feuds under fog, Mercy above 1 − c/b feeds takers, unbroken peace hollows Mercy, and the Guild punishes loyalty itself. All numbers are untested; the harness in section 9 must confirm this.

## 5. SCENARIO SYSTEM

A Place is a world sheet (eight dial settings), a skin (nouns, verbs, art) and a charter (keep cooperation, break it, or protect outsiders). The generator moves two or three dials off baseline, attaches a matching skin, and runs the validator: a seed ships only if three scripted proxies (saint, hawk, measured) finish 25 points apart and its best custom differs from every other Place's.

|Place (skin)|Dials off baseline|Hidden lesson|
|---|---|---|
|Quiet Valley (grain loans)|none; takers arrive at season +12|Peace forgets how to defend itself|
|Fog Line (trench truce)|fog 10%; two rows; copy own side|Forgiveness must match the noise|
|The Guild (price ring)|outsiders lose 2 per mutual give; charter: break|Trust and cartels are built the same way|
|The Fair (harvest crews)|known last day; ties redrawn|A known end rots trust backwards|
|The Ridge (stag drive)|s=2|The danger is fear, not greed|
|Narrow Bridge (carters)|h=3|Identical customs collide; a convention must form|
|Crossroads (caravans)|turnover 20%; b=5; hubs|Strangers punish an open Greeting|
|Night Lamp (fire watch)|volunteer table|More watchers, darker nights|
|The Shoal (fishery)|pooled table; totals only; hidden stock|The boat everyone copies is the overfisher|
|The River (water rights)|directed chain; reversed market road|The weak answer the strong in another currency|

## 6. OPPONENTS AND THEIR MINDS

- **Generation.** No scripted bots. Each house is five numbers, a purse and a copy ledger. Each Place seeds founding lineages from parameter bands (firm, soft, taker) plus one toll-taker on the extortion vector for its stakes. At default stakes that is Loyalty 5/7, Mercy 0, Conscience 5/7, Truce 0; I re-derived that it earns 16/7 to an always-giver's 8/7. Thereafter imitation, drift and mutation take over.
- **Reading.** Looking-Round arcs show who copied whom. "Why?" turns over the petal that fired and its source: your dated deed if the copier saw it, a blank card if it guessed.
- **Unexploitable.** An exploit that pays gets copied and becomes the culture you live in. Founders are redrawn per seed and Endow is capped. Verdicts average 200 tapes and rewinds replay the same tape, so only decisions change outcomes.

## 7. PROGRESSION, META AND ENDINGS

- **Atlas.** Places unlock in three books; each moves one new dial.
- **Seals.** Holds (charter met in 60% of futures), Foreseen (forecast correct) and one odd constraint (hold the valley with Mercy under 0.2).
- **Casebook.** After each Chronicle you pin a conjecture built from tiles ("More Mercy always helps"). Later Places confirm or refute it.
- **Herbarium.** Customs you left return as lineages in later Places. The Mirror Vale holds only your last one.
- **Ending.** The final Place, Home, runs every custom you ever left for 200 seasons and settles into one of six cultures: Open Hand, Long Memory, the Toll (stable and unfair), the Wheel, Shut Doors or Silence. None is graded.

## 8. WHY THIS IS NEW

Claims are against the supplied landscape only; run a prior-art and name check before publishing them.

- Sandboxes give you sliders and tournaments take a program. Here play itself is the genome.
- No surveyed work scores the world after the player leaves, across many futures on shared luck, or traces that result to one named decision.
- Traits are inherited as seen, so the collapse of cooperation has a visible cause: blank cards.
- Your opponents quote you, and for one day you are their victim.

## 9. MVP AND EXPANSION ROADMAP

**Build first:** a headless engine and harness in Node. Gate: the proxies differ by 25 points in survival, none is best in all three Places, always-give fails in two, and the forgetting cycle also appears under plain copying. If tuning cannot pass it, switch to the runner-up.

**First playable** (one HTML file, no server): the whole core loop with fog and the luck tape, on three structurally different Places: Quiet Valley, Fog Line (ring variant), the Guild.

**Cut:** extra petals, graded levers, crowds, other webs, Casebook, Herbarium, generator, art, sound.

**Roadmap:**
1. **Clocks and conjectures.** The Fair with a Last Days petal, turnover, Casebook.
2. **Crowds and webs.** Pooled and volunteer tables, hidden stock, the River, graded levers.
3. **Memory across Lives.** Herbarium, Mirror Vale, flower codes, a daily valley, Home, generated Places.
4. **The other chair.** A world-sheet editor: tune the dials to meet a charter for a given population.

## 10. OPEN DECISIONS FOR THE CREATOR

1. **Binary or graded lever?** A 0 to 3 lever feels less like two buttons but muddies the five-number custom. Recommend binary under domain verbs first, graded in stage 2.
2. **One world or an anthology?** Recommend one valley world first; other eras come as later books.
3. **Faces or flowers?** Recommend four named neighbours at your table, flowers elsewhere.
4. **Do theory terms appear?** Recommend only on the back of a Casebook card, after the pattern has been lived.
5. **Is "as seen" the default?** It is authored, not a theorem. Recommend yes if plain copying gives the same cycle in the harness.

## 11. RUNNER-UP DIRECTION

Rulewright (C3): communities hire you to rewrite their rules, then the game seats you at your own charter's weakest point. It has the clearest ten-minute loop (fail, read testimony, amend), provable with one Case. Its costs: hand-authored Cases are consumed faster than one person writes them, and its agents follow scripted exploits instead of reasoning. The engine, luck tape and validator carry over, so switching loses little.
