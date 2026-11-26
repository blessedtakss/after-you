> **Record of its time.** Written 2026-11-25 12:35 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# The Saltmarket: tuning report

Folder: `<scratch>/places/tune-saltmarket/` (files below are named relative to it). Engine: `e1/engine-places.js`, unedited. Lab: `e1/placelab.js`, unedited. No engine change was needed.

How numbers are labelled:
- **[m: file]**: measured in this folder, and the file named holds the output.
- **[argued]**: reasoned, not run.
- Tuning used seeds below 100000 only. The final gates use placelab's own bands from 100001 up, which were never tuned on.

## 0. Verdict

| | Custom | Gates on fresh seeds | Files |
|---|---|---|---|
| **preset.json (recommended)** | the guild's rule = `[1,1,0,1,0]` | **all 14 pass** (PG14 when re-run alone; PG12(a) also at the shipped counts) | `final-gates.txt`, `pg12a-shipped.txt`, `pg14-rerun.txt` |
| preset-as-briefed.json | "hold with every stall" `[1,1,1,1,1]` | 13 pass; **PG12(a) fails at the shipped counts**: the valley's best way is #1 of 243 by seal | `final-gates-as-briefed.txt`, `pg12a-shipped-as-briefed.txt` |
| Salt Ring (fallback, prover) | `[1,1,0,1,0]`, valley stakes | **PG2 and PG10 fail** (a cut on the last 2–3 days pays the store and the town alike) | `ring-gates.txt` |

**preset.json changes the custom from what the brief gave.** The brief's custom was "hold the price with every stall". preset.json uses "hold the price with a stall new to you, then do as each stall did yesterday", which is the valley's old way read as the guild's rule. That is a design call for the lead. The reason is in section 7: with "hold with every stall", PG12(a) cannot pass in any setting I tried.

The old recipe (hold the price all Life, cut on the last day) is closed in both versions [m: `final-gates.txt`, `final-gates-as-briefed.txt`]:
- careful plus a cut on day 12 earns the seal in 0.0% of Lives (careful alone 0.0%). In the as-briefed version it is 17.5% against careful's 20.0%.
- Cuts on the last 2 and 3 days earn 0.0% and 2.5%. The honest seller earns 27.5%.

## 1. Settings and why

`preset.json` (exactly what goes into `AfterYou.PLACES.saltmarket`):

```
{ "B": 3, "C": 1, "S": 2, "H": 0, "CUSTOM": [1, 1, 0, 1, 0],
  "CHARTER": "breaks", "FLOW_KIND": "both", "HOLD_LINE": 0.5,
  "NEED_PIVOT": 104, "NEED_WEIGHT": 0.5, "MARGIN": 17, "REPLAY": "habit" }
```

K is not set, so it is the valley's 0.5. CUSTOM and HOLD_LINE are the valley's defaults, written out for clarity. Measured from the valley, the place moves six dials: S, CHARTER, FLOW_KIND, REPLAY, NEED_PIVOT and MARGIN.

| Dial | Value | Why |
|---|---|---|
| Stakes B 3, C 1, S 2, H 0 | unchanged | The design: holding together pays +4, cutting against a stall that holds pays +3, holding alone pays −1, both cutting pays 0. The town pays the extra 2 at each stall where both hold. |
| CHARTER 'breaks', FLOW_KIND 'both', REPLAY 'habit' | unchanged | The brief: the Mark counts the town, measured on pairs where both held. The seal integrity rule R2 applies. |
| K | 2 → unset (0.5) | At K 2, careful's town mark was +8.3 (HOLD_LINE 0.45). No town-minded policy that keeps its stall was 10 points above it, so PG11 failed [m: `out-E0a.txt`, `out-F1*.txt`]. At K 0.5 careful's mark drops below zero and the trade appears [m: `out-F3-*.txt`]. |
| CUSTOM | [1,1,1,1,1] → [1,1,0,1,0] | Needed for PG12(a) (section 7). It also makes the lesson literal: the guild enforces its price with the valley's own habit. |
| HOLD_LINE | 0.45 → 0.5 | The custom's baseline has a median of 53.0% of futures broken and lies inside 15..85 in 91.7% of seeds [m: `final-gates.txt` PG7]. Between 0.45 and 0.55, on 40 tuning seeds: honest seal 30.0% at every line, honest mark +20.1 / +18.4 / +15.3, careful −12.3 / −12.2 / −11.4, baseline inside 15..85 in 92.5 / 95.0 / 90.0% [m: `out-ALT1.txt`]. The valley's best way ranks #48 / #49 / #51 [m: `out-SGB-merged.txt`]. |
| NEED_PIVOT / WEIGHT / MARGIN | 122 / 0.5 / 6 → 104 / 0.5 / 17 | The pivot is the guild's rule's median store: 104, out of a range of 33..164 on seeds 1..3000 [m: `out-needcheck.txt`]. A margin of 17 makes the honest seller keep its stall in 40.6% of Lives on seeds 1..2000 [m: `out-GTB-tune.txt`] and 41.9% on the fresh band. The need runs 87..169, and every value is a whole number. |

## 2. Gates (preset.json, fresh bands, shipped counts) [m: `final-gates.txt` unless stated]

| Gate | Value | Pass |
|---|---|---|
| PG1 honest keeps the house | 41.9% of 2000 Lives (100001..102000) | ✓ |
| PG2 last days | seal: honest 27.5%; selfish act on the last 1/2/3 days 22.5 / 25.0 / 25.0% (40 seeds 110001.., 2000/1000) | ✓ |
| PG3 spread | the 13 ways carried are at least 25 points apart in 99.2% of 120 seeds (median 47.3) | ✓ |
| PG4 no trivial way | best of the 243 carried ways is neither flat extreme in 91.7% of 12 seeds | ✓ |
| PG5 determinism | 0 of 2 reruns differ; 16 flips; 920,134 shared draws, 0 differ | ✓ |
| PG6 a habit matters | moves the outcome by at least 5 in 96.7% of 120 seeds (median 14.8) | ✓ |
| PG7 not a lottery | baseline inside 15..85 in 91.7% (median 53.0) | ✓ |
| PG8 mirror | all three in 100% of 120 seeds | ✓ |
| PG9 situations | median 5 met, minimum 3 | ✓ |
| PG10 no recipe | highest seal besides honest is honest+selfish2 at 25.0% (cap 41.3); none over the cap; no policy above 0.8 seal/kept (honest 0.58) | ✓ |
| PG11 a trade | always 48.7% kept / mark −11.8; cold 48.4% / −15.7; careful 70.3% / −10.8 (honest 41.9% / +18.6); honest seal 27.5% | ✓ |
| PG12 different from the valley | see the three rows below | ✓ |
| PG12 (a) | valley's best `[1,1,0.5,1,0]` is #27 on the lab's grid (12 seeds at 200/200). At the shipped counts (40 fresh seeds 170001..170040, 2000/1000) it is **#17 of 243**, with a seal rate of 5.0% [m: `pg12a-shipped.txt`]; on tuning seeds 70001.. it is #49 [m: `out-SGB-merged.txt`] | ✓ |
| PG12 (b) | Spearman −0.95 | ✓ |
| PG12 (c) | clear pulls of opposite sign: BOTH mark −10.1 vs +1.2; SHORTED mark −3.5 vs +1.2; OWING mark −15.6 vs +13.5 | ✓ |
| PG13 page sanity | need 87..169; every store, payoff and need a whole number | ✓ |
| PG14 cost | 2.03–2.24 s in the gate run, which shared 12 cores with 20–40 other processes. Re-run alone three times: 0.94–0.97 s [m: `pg14-rerun.txt`] | ✓ |

The same preset on the tuning bands (shift −100000) also passed all 14 [m: `out-GTB-tune.txt`]. That run included careful+cut-last-2 and careful+cut-last-3 in the battery: the 3-day cut had a seal/kept of 0.78 and a seal of 17.5%, against a cap of 45.

**Robustness (tuning seeds, same preset)** [m: `out-FINchk-20001.txt`, `out-FINchk-30001.txt`]: on two more 40-seed sets, two gates missed once each.
- **PG2** on seeds 20001..: honest 15.0% against honest+selfish3 20.0%, which is over the +3 allowance.
- **PG10** on seeds 30001..: the grudges kept 2 and 3 Lives of 40, and every one was sealed (seal/kept 1.00).

Both are small-count effects:
- The grudges keep only 1.4–1.6% of 2000 Lives.
- In a kept Life a grudge's town mark is nearly always clear.

## 3. What moved from the starting settings

| Dial | Start (E1 preset) | Final |
|---|---|---|
| K | 2 | unset (0.5) |
| CUSTOM | [1,1,1,1,1] | [1,1,0,1,0] |
| HOLD_LINE | 0.45 | 0.5 |
| NEED_PIVOT | 122 | 104 |
| MARGIN | 6 | 17 |
| B, C, S, H, CHARTER, FLOW_KIND, NEED_WEIGHT, REPLAY | — | unchanged |

The as-briefed alternative (`preset-as-briefed.json`) keeps CUSTOM [1,1,1,1,1] and NEED_PIVOT 122, with K unset, HOLD_LINE 0.625 and MARGIN 0.
- Its HOLD_LINE of 0.625 was needed for the grudges' seal/kept. At 0.45–0.6, `[1,1,0,0,0]` was sealed in 83–100% of its kept Lives [m: `out-HL1a.txt`, `out-HL2-once-*.txt`, `out-GT1-*.txt`].

## 4. The honest policy and the selfish act (`policies.js`)

**Honest, in one sentence:** "Hold the price with every stall that holds it and be patient when one slips, but never be the one to put the price back: once your own price has slipped while theirs held, keep yours down until they cut too."

In code, `honestPolicy` is the valley harness's careful, unchanged, with one rule added: in OWING ("after you cut, or your boy sold below the price, and theirs held") it always cuts.
- I chose it over the "patient seller" (`patientSeller`: cut only the first day after your own slip) on measurement.
- The patient seller's trade gap over careful was 9.3–12.7 points across four seed sets, against 11.7–17.4 for this one. Both were measured with the as-briefed custom at HOLD_LINE 0.625–0.65.
- Its PG2 margin was zero on one set [m: `out-HL2-once-*.txt`, `out-HL4-cut-*.txt`, `out-HL5-*.txt`].

**Selfish act** (`selfishAct`; `honestSelfish(1|2|3)` are the 1-, 2- and 3-day variants): on the last days, hold the price where the honest seller would cut it, with a stall whose price is expected to hold.
- For this honest policy that means: put the price back with a stall still holding it after your own price slipped.
- It earns +4 instead of +3 for you, and the town pays 4 more at that pair.
- It changes a choice in 56, 69 and 90 of 300 Lives (1, 2, 3 days) [m: `out-eqcheck.txt`].
- `out-eqcheck.txt` also shows that the written functions play exactly as the forms the gates use (0 of 300 Lives differ).

Rejected along the way [m]:
- **store-then-town** (careful until the store covers the need, then cut with all): its kept rate equals careful's exactly, and its mark is +9.4 against careful's +8.3, so there is no trade [`out-E0a.txt`].
- **careful plus a cut on day 12** as honest: R2's won clause withholds its own seal, so the selfish hold beats it on seal and PG2 fails [argued from `out-E0c.txt`: careful+grab 10.0% against careful 17.5%].

## 5. The lesson as it now plays (fresh bands) [m: `final-gates.txt`]

Trust and a ring are built from the same habits.
- careful, the valley's good neighbour (patient, always goes back to the price), keeps its stall in 70.3% of Lives. The ring breaks 10.8 points less often than under the guild's rule (mark −10.8), and careful earns no seal.
- Holding the price with every stall keeps the stall in 48.7% of Lives, with a mark of −11.8.
- A cold opener keeps it in 48.4%, with a mark of −15.7.
- The honest seller, whose only difference from careful is that it never puts the price back itself, gives up about 8 coins (purse 117.2 against 125.4) and 28 points of kept. It moves the town by 29 points against careful: kept 41.9%, mark +18.6, seal 27.5%.

The pulls by day 3, as one act turned with the honest policy playing on (40 seeds) [m: `final-gates.txt` PG12 detail]:
- Holding after both held: store +21.9, town −10.1. In the valley: +3.3 and +1.2.
- Going back to the price after you left them short: store +7.0, town −15.6. In the valley: +3.5 and +13.5.

Every hand that fills the store holds the ring the town pays for.

The last days [m: `final-gates.txt`, last table]:

| Policy | Kept | Mark | Seal |
|---|---|---|---|
| careful | 70.3% | −10.8 | 0.0% |
| careful + cut on day 12 | 58.5% | +1.4 | 0.0% (won 12.5%) |
| careful + cut 2 days | 27.4% | +15.2 | 0.0% (won 72.5%) |
| careful + cut 3 days | 10.1% | +18.3 | 2.5% |
| honest | 41.9% | +18.6 | 27.5% |
| honest + cut 1 / 2 / 3 days | — | — | 22.5 / 5.0 / 2.5% |

A late change of heart costs the stall and does not buy the seal.

## 6. R2 and the old recipe

The brief's question was whether REPLAY 'habit' with the won clause closes the recipe of holding all Life and cutting on day 12. It does, in both versions [m: `final-gates.txt`, `final-gates-as-briefed.txt`].
- **As briefed:** careful + cut on day 12 is sealed in 17.5% of Lives against careful's 20.0%; won fires in 32.5% of its Lives. Cuts on the last 2 and 3 days earn 10.0% and 5.0%. The honest seller earns 25.0%.
- **Final preset:** 0.0 / 0.0 / 2.5% against honest's 27.5%.
- **Soft spot:** R2 sees day 12 only.
  - On one tuning band a 3-day cut was sealed in 17.5% of Lives with seal/kept 0.78, still below honest's 30.0% [m: `out-GTB-tune.txt`].
  - In the Salt Ring the same blind spot is fatal (section 8).

## 7. Why "hold with every stall" cannot pass PG12(a)

At the shipped counts, the valley's best fixed way `[1,1,0.5,1,0]` was always among the Saltmarket's best by seal:
- #1–#8 of 243 in 25 settings on seeds 70001..70040: need margins −20..8, need weights 0 and 0.5, HOLD_LINE 0.55–0.7 [m: `out-SG2-merged.txt`];
- #1–#6 at HOLD_LINE 0.5–0.7 with margin 3 [m: `out-SG1-merged.txt`];
- #5–#7 with FOG 0.03 [m: `out-SG3-merged.txt`];
- **#1 (seal 30.0%)** on the fresh band 170001..170040 at the as-briefed settings [m: `pg12a-shipped-as-briefed.txt`].

The reasons [argued from those runs]:
1. The need is always above what the custom earns. Always-hold earns well here, so a fixed way can keep its stall only by beating always-hold. That means escaping the one taker quickly and keeping every other pair through a slip, which is exactly what `[1,1,0.5,1,0]` does. It has the highest kept rate of any fixed way (32.5–52.5%).
2. Every way that holds less than "always" leaves the town no worse off. So its small positive mark (+2..+8) clears in a third to a half of Lives.

With the guild's rule `[1,1,0,1,0]` as the custom, forgiving half the time is more ring-friendly than the custom. The valley's best way then has a mark of about −10, is almost never sealed (5.0%), and drops to #17–#77 [m: `pg12a-shipped.txt`, `out-SGB-merged.txt`].
- The Saltmarket's own best fixed ways are then `[1,1,1,0,0.5]`, `[1,1,1,0,0]` and `[1,1,1,0,1]`: forgive any stall's cut, but never put your own price back. That is a habit the valley never rewards.

The lab's own PG12 (12 seeds at 200/200) passed the as-briefed version (#26). At 200 futures, almost no fixed way's mark clears, so that check cannot see the problem.

## 8. The fallback: the prover's Salt Ring [m: `ring-gates.txt`]

Settings: valley stakes, custom [1,1,0,1,0], FLOW 'hands', HOLD_LINE 0.5, CHARTER 'breaks', REPLAY 'habit', need 58 / 0.5 / 4. Same honest policy. The selfish act is the store's best on the last days: a cut, which here also serves the town.

| Gate | Result |
|---|---|
| PG1 | 46.2% ✓ |
| **PG2** | **FAIL**: honest 25.0% against 30.0 / 32.5 / 37.5% for cutting the last 1/2/3 days |
| **PG10** | **FAIL**: milker-early 50.0% against a cap of 37.5; seal/kept never 1.00, honest+selfish3 0.83, `[1,1,0,0,0]` 0.86 |
| PG12 | ✓ (#87, Spearman −1.00) |
| PG14 | ✓ (0.87–0.98 s) |
| Others | ✓ |

The tuning band said the same: honest+selfish3 45–47.5% against honest 27.5–32.5%, and careful+cut-3-days 50% [m: `out-RING1a.txt`, `out-RING1b.txt`]. A last-days cut pays the store and the town together, and R2 sees only day 12. The fallback is worse than either Saltmarket.

## 9. What the page must show for this place

- **Cards.** The choices are **Hold the price** / **Cut the price**. The four outcomes, every one a whole number:
  - "Both prices held. +4."
  - "You held the price. Theirs was cut. −1."
  - "Their price held. Yours was cut. +3."
  - "Both prices were cut. 0."
- **Luck.** A lost hand reads: "Your boy sold below the price; they saw only a cut price." Never say whether a stall's cut was its boy or itself.
- **The town, every day.** Add to the day total: "The town paid {4 × pairs where both held} coins more at your stalls today." This is computed from `results` (both `intended && !lost` and `they`). It needs a zero branch: "The town paid nothing extra at your stalls today." [argued; page only, no engine change]
- **No gauge.** There is no STOCK, so the card head is the valley's.
- **Need line.** "Winter store: {purse} of {need} coins." Beneath it: "The guild's rule, which is to hold the price with a stall new to you and then do as each stall did yesterday, would bring in {oldWayPurse} this year." Never derive one number from the other.
- **Chronicle.** Under CHARTER 'breaks', every count is futures in which the ring broke.
  - Mark: "With you, the ring broke in {holds} of {futures} futures. Had your stall kept the guild's rule: {baseline.holds} of {futures}."
  - Rule line: "A future counts as broken if, over its last ten seasons, both stalls held the price on fewer than half of the days a pair traded side by side."
  - Rows of marks: fill the mark for "broke".
  - Range: "best" means most broken. Draw the scale from `range.scaleLow` to `range.scaleHigh`, and read `range.of`.
- **Afterwards strip.** `seasons[k].flow` is the share of pair-days on which both held: the ring's strength, which is the bad side.
  - Draw the line at one half, with the town's side below it.
  - `worstStretch` is the ring's weakest five seasons, which is the town's best stretch; word it that way.
  - Read `level` as charter-facing: 'holds' means the ring broke.
- **Last-day line under 'habit'.** Take the verbs from each changed tie's `lived` / `replayed`. For example: "On the last day you put the price back with Rusk, against your habit; with it kept cut there, the ring breaks in … of 1000 futures, against … as you left it. Your store would have been … of …"
  - A withheld seal (`wonOnLastDay`, `boughtOnLastDay`, `lastDayCost`) passes silently.
- **Seal text:** "Stall kept, town better off."
- **Untested situations:** "Never tested. Your heir keeps the guild's rule here."
- **Other lines.** Kin is "your sister's stall". The Afterwards newcomer (the valley's taker) is "a stall that cuts every price". Far houses are "stalls across the square".

## 10. Words

- **Two choices:** Hold the price / Cut the price.
- **Custom:** "The guild's rule: hold the price with a stall new to you, then do as each stall did yesterday." (As briefed: "hold the price with every stall, whatever it did yesterday.")
- **Five situations:**
  1. Beside a new stall
  2. After you both held the price
  3. After they cut and you held
  4. After you cut and they held
  5. After you both cut
- **Afterword:** "Sellers who agree not to undercut one another keep that agreement the way neighbours keep trust: matching each other day after day, letting a slip pass and going back to the price. That is why many towns forbid such agreements, and why the buyers, who never stand behind the stalls, are the ones who pay for them."

## 11. Risks

1. **The custom change is a design change.** The brief described "hold with every stall". With it, PG12(a) fails at the shipped counts (section 7). The lead must choose between the guild's rule (all 14 pass) and the brief's custom (PG12(a) fails).
2. **Small-count gates.**
   - PG2 missed on one of four 40-seed sets (honest+selfish3 +5 points).
   - PG10's seal/kept missed on one: the grudges keep 1.4–1.6% of Lives, and when 2–3 of 40 happen to be kept they are all sealed [m: `out-FINchk-*.txt`].
   - The fresh gate bands passed both.
3. **R2 sees day 12 only.** A 3-day cut is sealed in 2.5% of Lives on the fresh band but 17.5% on one tuning band (still below honest) [m: `final-gates.txt`, `out-GTB-tune.txt`].
4. **Few seals outside the honest family.**
   - Battery policies other than the honest family earn 0–2.5%.
   - Fixed ways: 49 of 243 earn a seal somewhere on 40 seeds, the best 22.5–25% [m: `pg12a-shipped.txt`].
   - Players may feel there is one way to win. The signature habit is: forgive others' cuts, never put your own price back.
5. **The honest seller's rule is harsh after a slip.** After your boy's slip it keeps cutting while the other stall holds.
   - Under the guild's rule your sister cuts back, so the break heals in a few days.
   - Under "hold with every stall" she would hold forever while you cut [argued from the custom's habits].
   - The page must report the town's coins as counts and never praise a cut.
6. **Every honest valley habit scores against the town here.** careful −10.8, forgiving −5.7. The Opening must say plainly that the Mark counts the town.
7. **PG14 depends on machine load.** It was 2.0–2.2 s under 20–40 parallel processes and 0.94–0.97 s alone.
8. **Placelab's PG12(a) is too coarse here.** At 12 seeds × 200/200 it cannot see the as-briefed failure (#26 against #1 at the shipped counts). Other places' PG12(a) may need the shipped-count check too.

## 12. Files

**Deliverables**
- `policies.js`: the honest policy, the selfish act and its 1/2/3-day variants, the patient seller, the search family, and the Salt Ring's cut act.
- `preset.json`: the recommended preset.
- `preset-as-briefed.json` and `preset-reciprocal.json`.
- `final-gates.txt`, `final-gates-as-briefed.txt` and `ring-gates.txt`, produced by `final.js` and `ring-gates.js`.
- `pg12a-shipped*.txt`, produced by `sgrid2.js` and `sgmerge2.js`.
- `pg14-rerun*.txt`.

**Tools**

| File | What it does |
|---|---|
| `x.js` | kept, mark, seal and clauses for named policies |
| `hl.js` | the same at many HOLD_LINEs from one run of futures; checked equal to the gate output |
| `gt.js` | `gates()` on tuning bands |
| `tn.js` | need tuning |
| `curve.js` | kept against margin |
| `g.js` | the carried 243 grid |
| `peek.js` | per-Life detail |
| `eqcheck.js` | the function forms against the gate forms |
| `needcheck.js` | need ranges |

**Evidence:** the `out-*.txt` files cited above.
