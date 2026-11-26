> **Record of its time.** Written 2026-11-25 09:23 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# Review of the three Place proposals: the engine view

Angle: the engineer who has to extend the shipped `engine.js` without moving the valley by one bit. For each proposed place this review asks which dials it really needs, what they cost in `engine.js`, and what they do to determinism, the what-ifs, the last-day replay, the reference ways, the need rule and the seal. It also asks which gates can verify the place.

Folder: `<scratch>/places/judge-engineer/`. Nothing in the game folder was touched.

Labels:
- **[measured]**: I ran it in this folder. The script and its unedited output sit side by side (`*-judge.js` and `*-judge-out.txt`, `pack-gates.js` and `pack-gates-out.txt`).
- **[theirs]**: a proposer's measurement. I did not repeat it.
- **[argued]**: reasoned from the code, not run.

## 0. Verdict

**Build these four places, in this order.**

1. **The Watchtowers**: the prover's settings. Arms race.
2. **The Banks**: the seat's whole-basket skin, with the theorist's floor below cost and the valley's single arrival. The Mark counts the ground. Fishing grounds and shared pasture.
3. **The Bridges**: the seat's settings, plus a starting store. A trade road.
4. **The Saltmarket**: the seat's settings, with the charter inverted inside the engine. A price ring on the road.

**Reserves, in order.**
- **R1, the Fog Line.** In the theorist's form (FOG, CUSTOM) it needs nothing beyond E1; the prover's form also needs `ARRIVALS 0` (2 sites in the prototype). The user was promised noise, and this place is noise. As measured it fails H3, so the remaining work is design work.
- **R2, the Salt Ring** (prover). It is the fallback for the ring family if the Saltmarket's mirror reads wrongly to players. It costs an end-game replay rule of about 30 lines.

**The engine extension (E1, section 4).**
- Ten place parameters: `S`, `H`, `CUSTOM` (0s and 1s only), `STOCK`, `FLOW_KIND` (`hands` | `one` | `stock`), `CHARTER` (`holds` | `breaks`), `REPLAY_SITS`, `REPLAY_FLIP`, `RANGE_WAYS`, `STORE_START`.
- Ported **by dial, not by copying the prototype**: about 80 lines in `engine.js` [argued].
- No new draw purposes.
- None of these, which the prototype carries: `LUCK_KIND` and its split of yesterday into two views, `TURNOVER`, multiple `ARRIVALS`, `SIDES`, `FOUNDERS`, `NEWCOMER`, middling customs (`P_REF`).

**Evidence for E1.**
- `engine-judge.js` is a superset of E1: the prototype, plus the seat's four patches, plus my three.
- Against the shipped `engine.js` with no overrides it differs in **0 of 6,496 JSON comparisons over 152 Lives**. That covers `today()`, `playDay()`, `ways()`, `legacy()`, the whole life state, `verdict()`, `runFuture()` and `project()`, with every new default also spelled out as an override [measured, `identity-judge-out.txt`].

## 1. What I ran

All runs use `engine-judge.js`, made by `make-judge.py` from the seat's `engine-seat.js` with three patches. Each patch is off by default.

1. `FLOW_KIND 'stock'` is the season's **mean tie level divided by `STOCK.start`**. `HOLD_LINE` stays a fraction, and `levelOf`'s absolute `NEAR_LINE` of 0.05 keeps its meaning.
2. `CHARTER 'breaks'` sits **inside the engine, at three sites**: `stepRun`'s `held`, `runFuture().holds` and `levelOf`. All three are turned to face the charter. The mark, range rank and best/worst, the what-ifs, the last-day delta and both seal clauses then follow with no code of their own.
3. `STORE_START`: house 0 and its reference Life begin with this store.

| Script → output | What it shows |
|---|---|
| `identity-judge.js` | Valley identity against shipped `engine.js` (md5 `6090c8f6…`), as above. This is a lighter run than the engine map's 337 Lives. **PASS, 0 differ.** |
| `ring-judge.js` | (1) The in-engine inverted verdict equals the lab's re-reading on 48 Lives: mark, seal, `lastDayCost`, `boughtOnLastDay`, best and worst, and the counts as complements, **0 differ**. The lab's mirrored clause (`markBoughtOnLastDay`) never fires under `REPLAY_FLIP`. (2) Leak tests on seeds 1–40 and 41–80. (3) The seal at 1000 futures. |
| `endgame-judge.js` | The prover's end-game rule with the policy asked again, against an engine-implementable replay of recorded choices: **the replayed world differs in 0 of 440 Lives**. |
| `commons-judge.js`, `commons2-judge.js` | The Shoal on the normalised charter; the Banks with one arrival, and with floor 1; the prover's Shoal with the ground counted. G6 at 1000 futures. |
| `towers-judge.js` | The prover's Watchtowers reproduced, and the seat's false alarms (FOG 0.08) merged in. |
| `bridge-judge.js` | The seat's Bridges reproduced; `STORE_START`; the prover's two takers; G6 with a turn-taking policy. |
| `pack-gates.js` | The recommended pack: G7 on 200 seeds, the smallest need, G6 for the Saltmarket, G8/G9, and the carried range ways. |

**Not run:**
- the full 337-Life identity on a real port (only on the superset, at 152 Lives);
- any page code;
- seal rates at the shipped 2000 + 1000 futures (I went up to 1000 for the Saltmarket only);
- the 243-way carried G4 for the Banks with floor 1 and for the Saltmarket;
- the futures-loop speed of E1.

Sizes in lines are argued.

## 2. Scores

Scores run from 0 to 10, from the engine side. A 7 means "build it, with the listed fixes".

| # | Place (proposal) | Score | Verdict | Reason |
|---|---|---|---|---|
| 1 | **Watchtowers** (prover) | 7 | **keep** | Needs only D1 `S` and D4 `CUSTOM`, both in the prototype; no founders. Reproduced on fresh seeds 41–80: careful keeps 47.5%, mark +14.3, seal 20%; G6 67.5%; G8 100%; G9 5/5 [measured]. Weakness: the last-day temptation is gone (sending on day 12 is worth +0.1 to +0.7), so the trade moves to "going first". |
| 2 | **Banks** (seat) | 7 | **fix** | Whole-basket stock and the ground charter are the right engineering. As proposed, G6 is marginal: 60% with forgiving and 56.7% with mender at 1000 futures [measured], and it needs a second arrival. With floor 1 and one arrival, G6 is 70% / 70%, G7 84.5% on 200 seeds, mender keeps 47.1% of 1000 seeds, and the grab is bought in 30% [measured]. |
| 3 | **Bridges** (seat) | 7 | **keep** (fixes) | 5 engine lines; reproduced exactly (take-turns +35.0, seal 45%). G6 with turn-taking: 86.7% and 76.7% [measured]; the prover's "G6 fails" came from using the valley's forgiving policy. `STORE_START 40` leaves kept% bit-for-bit the same (45.5 / 16.8 / 0.3 on 2000 seeds) and makes the smallest need 24 > 0 [measured]. Weakness: the seal is close to kept% for take-turns (45–50%): a coordination place with a weak house-against-mark trade. |
| 4 | **Saltmarket** (seat) | 7 | **keep** (fixes) | The cleanest inversion. With S 2 the store-serving last-day act (hold) costs the town, so the valley's trade is mirrored and only a one-line `REPLAY_FLIP` is needed. The charter inside the engine is verified (0 differ, 48 Lives). Leak tests: holding on days 10–12 after breaking rings earns the seal in at most 7.5% [measured]. G7 76% on 200 seeds; G6 70% / 70% [measured]. G4 must use the seal form (section 6). |
| 5 | Shoal (theorist) | 7 | **fix → merged into the Banks** | The strongest single-place evidence. On my normalised daily-mean charter, marks move by at most 0.5 points against their end-of-season snapshot, and G6 is 80% at 1000 futures [measured]. But stores are in eighths (3 × L): fractions on cards, meter and Chronicle, and a rounding hazard at the "kept" test. Its hysteresis (floor below cost) is carried into the Banks as floor 1 < C 2. |
| 6 | Watch (seat) | 5 | **fix → merged into the Watchtowers** | FOG 0.08 as false alarms fails G6: 50% at K 2, 1000 futures [measured]; 55% at K 1, 300 futures [theirs]. Without the noise it is the prover's Watchtowers. |
| 7 | Shoal, skin B (prover) | 6 | **fix → merged into the Banks** | Counts hands, not the ground. Switched to the ground at 0.9, the baseline falls to 18.8% median, inside 15..85 in only 67.5% [measured], so it would need its own line. C 1.5 gives fractional stores. |
| 8 | Narrow Bridge, turns (prover) | 5 | **fix → the seat's Bridges** | Needs FOUNDERS, negative stores and the end-game rule. Two takers near, on the seat's stakes, make always-give-way keep 50–55% (a store route; mark −24.9) and leave take-turns' seal at 45% [measured]: the founder fix does not do its job. |
| 9 | Salt Ring (prover) | 5 | **reserve R2** | The ring on valley stakes. The last-day undercut serves both results, so it needs the inverted charter plus a 25–35-line end-game rule with a day-10 snapshot, and that rule withholds the seal for an act the charter rewards. Leak 5–10% [theirs]. Its lab shortcut is cleared: 0 of 440 Lives differ [measured]. |
| 10 | Watchtowers (theorist) | 4 | reject | Needs D9 founders to work; with the valley's founders it is the valley minus the grab [theirs]. Superseded by the prover's founder-free version. |
| 11 | Salt Road (theorist) | 3 | reject | Valley stakes, inverted. Its seal numbers rest on the lab-only clause `markBoughtOnLastDay`. Greed earns the seal in 38% and a three-day break in 30% [theirs]; closing that needs the unbuilt multi-day rule. G6 57% [theirs]. |
| 12 | Narrow Bridge, hawk-dove (theorist) | 3 | reject | Always-give-way keeps 71%; G6 43–53% [theirs]. |
| R | Fog Line (theorist, prover) | 3 | **reserve R1** | Nothing beyond E1 in the theorist's form (the prover's `ARRIVALS 0` adds 2 sites). Fails H3 on fresh seeds and G6 at 0.10 [theirs]. Its future is the 'unseen' luck kind (a page decision) or more tuning. |
| R | Crossroads (seat) / Trade Road (prover) | 2–3 | reject | Fail H3 in every variant tried [theirs]; the real lesson needs D5c, an end not known in advance. |
| R | Two Shores (seat) | 3 | reject | Felt only at the first season's end (fails "by day 3"); needs seat-by-side code. |

## 3. Each place through the engine checklist

Notation: "base" means E1's shared code (section 4). Only what a place adds is listed.

### Watchtowers (prover): `C 2, S 3, K 2, CUSTOM [0,1,0,1,0]`, need 51 / 0.5 / 63

- **Dials truly needed:** D1 `S`; D4 `CUSTOM` (0s and 1s, so no new draw). C, K and the need parameters already exist. Nothing beyond the base.
- **Determinism:** untouched; no draws added.
- **What-ifs:** unchanged. A habit the house never wrote starts from `[0,1,0,1,0]` (the heir's untested ways).
- **Last-day replay:** the valley's form. Under S > C it rarely fires: careful+grab has an entry in 100% of Lives, is bought in 0%, and its seal is 0–5% through `lastDayCost` and `markClear` [measured]. The clause still means something ("you stayed home on the last day; it cost the border").
- **Reference ways:** the custom is not among the valley's thirteen, so the list becomes fourteen. Either the page reads `range.of`, or the Watchtowers gets its own thirteen with the custom in place of one valley way. On the coarse 14-way carried list the best way is all-send in **20.0%** of seeds: exactly at G4's limit [measured]. The prover's 243-way carried form gave 0% [theirs]. Run the 243 form as the gate.
- **Need:** the shipped rule. The need sits about 62 above the custom (smallest need 94 on 200 seeds) [measured], so the need sentence cannot lean on "the old way would land".
- **Seal:** unchanged code; it reduces to "kept, mark clear, no clear last-day cost".
- **Gates:** E1 identity; G1′ (careful 35–65%; careful+grab at or below careful); G2′ (sending on day 12 is worth at least 0); G3; G4 in the 243 form; G5; G6 at least 60 [67.5 measured]; G7 [97.5% on 200 seeds, measured]; G8; G9; G10; H3-W (the valley's `[0,1,1,1,0]` keeps at most 5% and earns at most half of careful's seal [0% / 0% measured]).

### Banks (seat skin, adjusted): `B 1, C 2, K 1, STOCK {start 6, min 1, max 9, delta [-3, 0, +1]}, FLOW_KIND 'stock', HOLD_LINE 1.0`, one arrival, need 171 / 0.5 / 31

- **Dials truly needed:**
  - D6 `STOCK`, in the prototype at 8–9 sites;
  - `FLOW_KIND 'stock'`, 4 lines;
  - levels for the page: `today()` and `results` (prototype), `kinWith` (not in the prototype, 1 line), `runFuture().seasons` (not in the prototype, about 3 lines).
  - `ARRIVALS 2` is **not needed**. With one arrival the baseline rises 4 points (median 72.5 against 68.5) and G7 holds at 82.5% [measured].
- **Determinism:** the stock takes no draws [the prototype's check 7 covers it].
- **What-ifs:** carry the levels as left, because the stock lives in the cloned state.
- **Last-day replay:** the valley's. The replay restores the level before day 12.
- **Reference ways:** the valley's thirteen; the custom is among them. Carried: best is flat in 5%, spread 95% [measured].
- **Need:** the shipped rule, re-centred. Stores are whole baskets, so no rounding layer is needed [measured: the stock moves in whole steps].
- **Seal:** unchanged. Bought in 27.5–30%; the grab costs about 7–9 mark points [measured].
- **Gates:**
  - E1 identity;
  - G1: mender or careful at 35–65% [47.1 / 42.0 on 1000 seeds, measured]; careful+grab at least 12 points above careful [67.2, measured];
  - G2 [careful+grab +4.8 against careful +12.2, measured];
  - G3 [87.5%, measured]; G4 in the 243 form [not run];
  - G6 [70%, measured]; G7 [84.5% on 200 seeds, measured]; G8 [100%, measured]; G9 [5/5, measured];
  - X2;
  - S1: the carried gap `[1,1,0,1,1]` − `[1,1,0,1,0]` is positive here and not in the valley [not run on this setting];
  - an assertion that every stock and store is a whole number.

### Bridges (seat): `H 3, S -2, FLOW_KIND 'one', REPLAY_SITS [3]`, own thirteen ways, `STORE_START 40`, need 15 / 0.5 / 36

- **Dials truly needed:**
  - D1 `S`, `H` (base);
  - `FLOW_KIND 'one'`, 2 lines;
  - `REPLAY_SITS`, 1 line;
  - `STORE_START`, 2 lines;
  - `RANGE_WAYS` (base).
  - H is charged on "neither arrived", so the store never says whether a missing give-way was luck (PAGE-MAP 3.2a).
- **Determinism:** no draws added. Two identical strict turn-takers cycle between waiting and jamming, and only the ford breaks the tie [theirs, argued from the rules]. That is the lesson, not a bug.
- **What-ifs:** unchanged.
- **Last-day replay:** `REPLAY_SITS [3]`. The replayed act is "drove on although you crossed yesterday and they waited". Driving on at day 12 raises kept from 52.5% to 65% on 40 seeds [measured] (49.3% against 45.5% on 2000 seeds [theirs]). The seal falls from 45% to 37.5% because `lastDayCost` fires in 35%; bought 0% [measured].
- **Reference ways:** the place's own thirteen (the custom included); `range.of` is 13.
- **Need:** `STORE_START` keeps every need above zero (smallest 24 on 200 seeds), which removes the page blocker (PAGE-MAP 3.2a: a need at or below zero breaks the meter at 672 and saved entries at 173) [measured]. Bad play can still end below zero (never ends near −10) and draws an empty meter, as in the valley.
- **Seal:** unchanged code.
- **Gates:**
  - E1 identity;
  - G1: take-turns 35–65% [45.5 theirs]; the custom and the valley's careful at 0% [measured];
  - G2′: driving on at day 12 does not raise the seal [measured];
  - G3 with the place's range [theirs]; G4;
  - G6 with take-turns [86.7%, measured]; G7 [71.0% on 200 seeds, measured]; G8; G9;
  - need above zero in every seed [measured];
  - R1: the old way's day 2 shows both failures [not run].

### Saltmarket (seat): `S 2, K 2, CHARTER 'breaks', CUSTOM [1,1,1,1,1], REPLAY_FLIP true`, need 122 / 0.5 / 6

- **Dials truly needed:**
  - D1 `S`, D4 `CUSTOM` (base);
  - `CHARTER`: 3 sites, charter-facing (section 4);
  - `REPLAY_FLIP`, 1 line.
  - Nothing else. No multi-day rule is needed, because the leak it would close was measured small (below).
- **Determinism:** untouched; the charter is read at the end of each future.
- **What-ifs:** their deltas face the charter automatically. "The habit that mattered" then means "moved how often the ring broke".
- **Last-day replay:** flipped. A hand sent on day 12 after both held is replayed as a cut.
  - Bought (held to the end and kept only by that hold): 17.5% / 7.5% of careful Lives [measured].
  - `lastDayCost` fires in 40–48% of careful Lives [measured].
  - The lab's `markBoughtOnLastDay` never fires [measured], so the engine does not need it.
- **Leak tests** [measured, seeds 1–40 / 41–80, 200 futures]:

| Way | Seal |
|---|---|
| break rings, then hold all on days 10–12 (one-strike) | 2.5% / 0% |
| `[1,1,0,0,0]` the same way | 2.5% / 2.5% |
| mirror the same way | 0% / 0% |
| never, then hold on days 10–12 | 0% / 0% |
| careful + cut on day 12 (the honest sacrifice) | 17.5% / 7.5%; 25% at 1000 futures |

- **Reference ways:** the custom `[1,1,1,1,1]` is in the valley's thirteen. With charter-facing counts, `range.bestPct` ≥ `worstPct` automatically (checked on 48 Lives), so the page's bracket (app.js 1493) works.
- **Need:** the shipped rule, re-centred.
- **Seal:** unchanged code.
- **Gates:**
  - E1 identity;
  - G1′ (careful 35–65% [43.6 theirs; 45.0 measured on 40 seeds]);
  - X2′ (flipped bought caught [measured]);
  - L1 (holding late after breaking rings earns at most half the honest seal [measured]);
  - G3 [100%, measured]; G4 in the seal form;
  - G6 [70%, measured]; G7 [76.0% on 200 seeds, measured]; G8 [100%] and G9 [5/5] [measured];
  - S1 (`bestPct` ≥ `worstPct` [measured]);
  - S2 (the town clause equals 4 × both-held ties; a page check).

### The rejected and merged places, in engine terms

- **The theorist's Shoal and the prover's Shoal B:**
  - Both put fractions into stores (3 × L in eighths; C 1.5).
  - Display rounding can then disagree with `purse >= need`: a store of 82.6 shown as "83 of 83" but not kept. That is a defect class the integer Banks avoids.
- **The Salt Road and the Salt Ring:**
  - Both need the inverted charter plus a seal clause aimed at a town-serving act.
  - The Salt Ring's rule needs a clone at the start of day 10, recorded choices for days 10–12, and a per-situation habit test from dated deeds: about 25–35 lines [argued], plus page verbs for "the last days".
  - With the policy asked again or with recorded choices it gives the same world [measured]. So it is buildable, just dearer than `REPLAY_FLIP`, and its Chronicle sentence is incoherent ("you undercut at the end; it helped the town; no seal").
- **The theorist's hawk-dove Bridge:** costs nothing in the engine (H, `FLOW_KIND 'both'`), but fails H5 and G6 [theirs].
- **The theorist's Watchtowers:** needs D9 (3 sites, keyed with the seat index as sub-key). It is the only pack candidate that would force FOUNDERS into the shipped engine.

## 4. The one engine extension (E1)

**Principle.** A place is an overrides object given to `createLife`. `life.params` carries it into the replay, the verdict and every clone. New state exists only when its dial is on. Default arithmetic adds exact zeros. No new randomness at all.

### Parameters added to `PARAMS` (engine.js 359–376)

| Parameter | Default | Used by |
|---|---|---|
| `S`, `H` | 0, 0 | Watchtowers, Bridges, Saltmarket |
| `CUSTOM` | `[1,1,0,1,0]` | Watchtowers, Saltmarket. Must be 0s and 1s (`need()` throws otherwise), so `createLife`'s `=== 1` test and the mark-exactly-0 property both hold. |
| `STOCK` | null | Banks |
| `FLOW_KIND` | `'hands'` | `'one'` for the Bridges, `'stock'` (normalised by start) for the Banks |
| `CHARTER` | `'holds'` | Saltmarket |
| `REPLAY_SITS`, `REPLAY_FLIP` | `[1]`, false | Bridges (`[3]`), Saltmarket (flip) |
| `RANGE_WAYS` | null (the valley's thirteen) | Bridges (and the Watchtowers if it gets its own thirteen) |
| `STORE_START` | 0 | Bridges |

### Sites in `engine.js`

All line counts are argued; the total is about 80.

| Area (shipped lines) | Change | Lines |
|---|---|---|
| helpers | `flowKind`, `stockStep`, `rangeWaysOf` (the custom appended if missing) | ~13 |
| `founder` 521–535 | kin returns `P.CUSTOM`; P passed in | 3 |
| `newLife` 539–574 | `STORE_START` on house 0 and `life.purse`; a stock array when STOCK is set; validation | ~9 |
| `createLife` 602 | `OLD_WAY` → `P.CUSTOM` | 1 |
| `today` 624 | `neighbours[i].stock` | 1 |
| `playDay` 678–679, 701–710 | `bt = B × level`, `sy = S·both − H·neither`; the stock step; level in results, yesterday, kinWith | ~7 |
| `legacy` 821, `scenario` 896 | `OLD_WAY` → `P.CUSTOM` | 2 |
| `endState`, `scenario`, `scratch` | carry the stock | ~6 |
| `replayLastDay` 849–852 | `REPLAY_SITS` / `REPLAY_FLIP`; each changed entry carries `act: 'sent' / 'stayed'` so the page takes its verb from the entry (PAGE-MAP 3.2b) | ~4 |
| `simulate` 926, 984–991, 1027–1035 | read the dials once; the stakes; the stock step; `tieOne` and the stock sum computed **only for their own flow kind**; the flow by kind; levels per season when `rec` | ~14 |
| `stepRun` 1092, `runFuture` 1131, `levelOf` 1120–1122 | charter-facing `held` / `holds` / level | 4 |
| `verdictJob` 1167–1172, `verdictStep` 1220 | range ways from `rangeWaysOf`; the custom found by `P.CUSTOM` | 3 |

### Left out on purpose

None of the four places needs these, and each one widens the identity surface:
- `LUCK_KIND` and the `view[]` split, the prototype's riskiest change: 12 sites, and the "one shared yesterday" invariant broken;
- `TURNOVER`, `ARRIVALS > 1`, `SIDES`, `FOUNDERS`, `NEWCOMER`;
- `P_REF` (middling customs);
- `FLOW_KIND 'ties'` and `'both'`;
- a multi-day end-game replay;
- D5c, D7 "copy the many", D8.

### Why the charter is three lines and not seven

The proposers costed D3 as "mark sign, rank, best, worst, level, held, seal" (ENGINE-MAP section 3, D3). If instead `held` itself means "the charter's good outcome", then:
- holdsPct and baselinePct become complements;
- the mark becomes old − you;
- the paired standard errors are equal;
- `lastDayCost`'s sign comes out right;
- the range runs best to worst correctly.

All of this happens with no further code. I measured it equal to the lab's re-reading on 48 Lives (0 differ) [measured]. It is also exactly what the page asks for (PAGE-MAP 3.2b: "engine must hand over every count already turned to face the charter").

Two consequences:
- `lateFlow` and `meanFlow` stay "the ring's flow", so the strip's good side must come from the place.
- `Lab.measureLife`'s own `CHARTER` sign must be removed once the engine has the charter, or marks invert twice. `Lab.carried` and `Lab.bestWay` become right with no change.

### Determinism, identity, speed

- **Determinism:** no new draw purposes, keys or orderings. S, H, the stock, the flow kinds, the charter, the replay flags and the starting store are all draw-free. G5 runs as in the valley.
- **Identity:**
  - Ship `identity.js`'s method as a gate, with hashes of the valley's JSON recorded from today's engine (ENGINE-MAP section 6, rule 5).
  - My superset run passed (0 of 6,496).
  - The real port must pass the full 337-Life run.
- **Speed:** the prototype's loop was 13% slower with every dial. E1 drops the luck-kind branches (`xa`, `xb`, `view`) from the hot loop, so it should be cheaper [argued, not timed].

## 5. Build order and gates

The order runs from least to most engine and page risk. Each step lands only when E1 identity passes.

| Step | Engine work landed | Place | Per-place gates (beyond identity, G5, G8, G9) |
|---|---|---|---|
| 0 | E1 skeleton: PARAMS, `S`/`H`, `CUSTOM` (0/1), `RANGE_WAYS`, `rangeWaysOf`; the identity gate as hashes | none | identity 337 Lives + defaults spelled out; determinism check 7 with S, H on |
| 1 | nothing new | **Watchtowers** | G1′, G2′, G3, G4 (243 carried), G6 ≥ 60, G7, G10, H3-W, seal at 2000 + 1000 |
| 2 | `STOCK`, `FLOW_KIND 'stock'`, levels in today / results / kinWith / seasons | **Banks** | G1, G2, G3, G4 (243 carried), G6, G7, X2, S1, whole numbers, seal at 2000 + 1000 |
| 3 | `FLOW_KIND 'one'`, `REPLAY_SITS`, `STORE_START`, the replay entry's `act` | **Bridges** | G1 (take-turns), G2′, G3 (own range), G4, G6 (take-turns), G7, need > 0, R1, seal at 2000 + 1000 |
| 4 | `CHARTER` (3 sites), `REPLAY_FLIP` | **Saltmarket** | G1′, X2′ (flipped), L1 (late-hold leak), G3, G4 seal form, G6, G7, S1, S2, seal at 2000 + 1000 |

Gate definitions specific to places:
- **G1′:** honest way at 35–65%, and the place's tempting act does not raise kept% where there is none (Watchtowers).
- **G2′:** the place's last-day act. For the Watchtowers, sending on day 12 is worth at least 0. For the Bridges, driving on out of turn does not raise the seal.
- **X2′:** flipped replay. A Life held to the end and kept only by that hold is refused the seal.
- **L1:** holding on days 10–12 after breaking rings earns at most half of careful+cut's seal.
- **G4 seal form:** the best way by seal is not all-send or all-stay.

The Saltmarket needs the seal form of G4 because in the carried form the town's best way is all-stay in **65%** of seeds [measured]. That is true by construction, since never-hold breaks every ring, and it keeps the house in 0%.

## 6. The pack: settings and what must change before building

1. **The Watchtowers.** `{C:2, S:3, K:2, CUSTOM:[0,1,0,1,0], NEED_PIVOT:51, NEED_WEIGHT:0.5, MARGIN:63}`.
   - Keep FOG at 0.04. False alarms at 0.08 fail G6 (50%) [measured].
   - Decide on fourteen range ways (page reads `range.of`) or a thirteen that contains the custom.
   - Write a need sentence that does not lean on the old way.
   - Re-measure the seal at 2000 + 1000 futures before freezing the margin.
   - Check the 243-way carried G4: it sits at the limit on the coarse list.
2. **The Banks.** `{B:1, C:2, K:1, STOCK:{start:6, min:1, max:9, delta:[-3,0,1]}, FLOW_KIND:'stock', HOLD_LINE:1.0, NEED_PIVOT:171, NEED_WEIGHT:0.5, MARGIN:31}`, with the valley's single arrival.
   - Floor 1 instead of 2: resting together on a spent bank loses (1 − 2 < 0). That is the theorist's hysteresis in whole baskets, and it lifts G6 from 60% to 70% [measured].
   - Engine hand-overs: levels in `kinWith` and in `runFuture().seasons` (not in the prototype).
   - Run G4 (243 carried) and S1 on this setting.
   - Pull on day 3: sending to all four instead of staying home is worth −7.8 baskets that day and +40.9 afterwards (mender) [measured]; the valley's custom gets −4.0 and +18.0 measures (LAB.md). The store unit differs (a basket is about half a measure), so no multiplier is claimed.
3. **The Bridges.** `{H:3, S:-2, FLOW_KIND:'one', REPLAY_SITS:[3], RANGE_WAYS:<seat's 13>, STORE_START:40, NEED_PIVOT:15, NEED_WEIGHT:0.5, MARGIN:36}`, with the valley's founders.
   - Do not add the prover's two takers: always-give-way would then keep 50–55% [measured].
   - Consider raising MARGIN so take-turns keeps about 40%. Its seal tracks its kept% (its mark is always clear), and 45–50% is the easiest seal in the game. Re-measure at 2000 + 1000.
4. **The Saltmarket.** `{S:2, K:2, CHARTER:'breaks', CUSTOM:[1,1,1,1,1], REPLAY_FLIP:true, NEED_PIVOT:122, NEED_WEIGHT:0.5, MARGIN:6}`.
   - The charter goes inside the engine, charter-facing.
   - Remove the lab's own inversion.
   - Use G4 in the seal form.
   - Report the town's coins as a count only, computed by the page from results (4 × both-held ties).
   - Re-measure the seal at 2000 + 1000: the seal grows with the count (careful+cut is 17.5% at 200 futures and 25% at 1000) [measured].

## 7. Evidence that came from a prototype shortcut

| Place | Shortcut | Status |
|---|---|---|
| Salt Ring and the prover's Bridge seal | The end-game rule re-lived the whole Life with the **policy asked again** on days 10–12 (`ring3b.js`, `bridge3.js`). The engine has no policy, only recorded choices. | **Cleared.** A recorded-choice replay gives the identical world in 440 of 440 Lives across 11 ways [measured]. Still not in any engine: it needs a day-10 clone and stored choices. |
| Theorist's Salt Road seal | The lab's `markBoughtOnLastDay` is a lab-only clause. | **Not reproducible as is.** It would have to be added to `verdictStep`; even then the three-day leak (30%) stays open [theirs]. |
| Every seal rate | Measured at 150–200 futures, with what-ifs and the replay at the same count. The engine uses 2000 + 1000. | **Systematic understatement.** The Saltmarket's careful+cut seal goes from 17.5% to 25%, one-strike from 12.5% to 15% (200 → 1000) [measured]. Margins must be set at the shipped counts. |
| Seat's G6 | 300 futures, and `mattered` included the last-day entry. | A lower bound, close to the SPEC. At 1000, last day off: Bridges 76.7–86.7%, Banks as proposed 56.7–60%, Saltmarket 70% [measured]. |
| Prover's Bridge G6 22.5% | Measured with the valley's `forgiving`, which jams on a bridge. | **An artefact.** 76.7–86.7% with turn-taking [measured]. |
| Two different `'stock'` charters | Theorist: snapshot at season end ÷ start. Seat: daily mean in absolute baskets. | **Unified.** Daily mean ÷ start reproduces the seat's Banks exactly (HOLD_LINE 6 → 1.0) and moves the Shoal by at most 0.5 mark points [measured]. Absolute units would have left `levelOf`'s ±0.05 "frays" band meaningless. |
| Lab's `CHARTER 'breaks'` | Re-reads a `'holds'` verdict; the engine's range, what-ifs and wording were not inverted. | **Replaced** by the charter-facing in-engine version, equal on 48 Lives [measured]. |
| `engine-seat.js` | Light identity (16 verdicts). | My superset identity run covers its patches: 0 differ [measured]. |

## 8. What the proposers missed

1. **The page's request fixes the charter design.** PAGE-MAP 3.2b asks for counts already facing the charter, and flipping only the mark collapses the page's bracket (app.js 1493). The charter-facing `held` is both what the page needs and the smallest engine change (3 sites).
2. **`NEAR_LINE` is absolute.** The seat's absolute-basket stock charter (HOLD_LINE 6) makes "frays" a ±0.05-basket band. Normalise by `STOCK.start`.
3. **A need at or below zero breaks the page.** The Bridges' custom earns about −25 and both turn-taking proposals left the need negative or near zero. `STORE_START` fixes it without moving kept% (bit-identical on 2000 seeds) [measured].
4. **Port by dial, not by patch.** The prototype's `playday-loop` and `sim-loop` patches bundle `LUCK_KIND`'s view split with S, H and STOCK. Copying `engine-proto.js` would ship four dials no place uses, plus the riskiest identity surface.
5. **Fractional stores** (eighths × 3, C 1.5) create a display-rounding hazard against `purse >= need`. Integer stakes avoid it.
6. **"Thirteen" is not constant.** The Watchtowers' custom is outside the valley's list (14 ways). Either the page reads `range.of` everywhere, or each place gets a 13-list that contains its custom.
7. **Hot-loop hygiene.** The seat's patch adds `stkSum` for every STOCK place, whatever the flow kind. Compute each count only for its own flow kind.
8. **The replay entry must carry its act** (`sent` / `stayed`) so the Chronicle's last-day sentence takes its verb from the entry. Under `REPLAY_FLIP` the act is a hold, not a stay-home.
9. **Levels for the page are not in the prototype:** kin's ties (`kinWith`) and all sixteen ties per season (`runFuture().seasons`).
10. **The lab inverts twice** once the engine carries the charter: `Lab.measureLife` must drop its sign.
11. **Noise is not carried by the pack.** FOG 0.08 in the Watchtowers fails G6 [measured]. The pack's luck is the valley's 'lost' kind under new names (drift, a balking mule, a stall boy), so the promised "noise" twist survives only as reserve R1.
12. **No founders in the pack** means every pack place shares the valley's founder mix, a taker and a soft house beside the player. That keeps D9 out of the engine. It is also the main reason two places have weak trades: the Watchtowers has no last-day temptation, and the Bridges' house and road agree.

## 9. Files

- `make-judge.py` writes `engine-judge.js`: the seat's engine plus the three patches above. Design evidence only.
- `identity-judge.js` → `identity-judge-out.txt`
- `ring-judge.js` → `ring-judge-out.txt`
- `endgame-judge.js` → `endgame-judge-out.txt`
- `commons-judge.js` → `commons-judge-out.txt`; `commons2-judge.js` → `commons2-judge-out.txt`
- `towers-judge.js` → `towers-judge-out.txt`
- `bridge-judge.js` → `bridge-judge-out.txt`
- `pack-gates.js` → `pack-gates-out.txt`
- `jcommon.js`: shared helpers, including `nativeSweep`, which reads the engine's own verdict so it is right under an in-engine charter.
