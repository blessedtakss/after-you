> **Record of its time.** Written 2026-11-22 13:37 (local time, UTC+10) for v0.1.0, copied here on 2026-11-26 with its paths made neutral and a remark about a space in the old path dropped, and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../checks/). The game has changed since; the code is the authority on what it does now.

# After You — first playable slice: specification

> ## Revision 3 (after the engine was attacked, fixed and re-verified). Read this first.
> The engine in `engine.js` is final and its header comment is the authority. These decisions were taken by the design lead and override the sections named:
> 1. **Need (overrides 2.8 and the numbers in 5.4).** The winter need follows the old way's purse at half weight: `need = round(59 + 0.5 x (old - 59) + 6)`, never less than `old + 1`. Reason: pegged one for one, whether a house was kept depended mostly on the luck of the tape; at half weight it depends on play, and the last day decides about 29% of Lives instead of 14%. Never describe the need as "the old way plus six".
> 2. **What is known of neighbours (overrides 2.5).** `seen` also counts each neighbour's dealings with the far houses it is tied to, as counts only. The far houses stay unseen.
> 3. **The seal (overrides UI-SPEC rev 1).** "House kept, valley better off" is decided by the engine (`verdict().seal.earned`): house kept, mark clear of +5 beyond the noise of the count, and not when the house was kept only by what was taken on day 12 or when those hands would clearly have been worth something to the valley.
> 4. **A way never tested (overrides 2.7).** The heir keeps the old way there. It is not a draw.
> 5. **Counts.** 2000 futures behind the two headline rows, 1000 behind every other row. The range is over thirteen plain ways, measured in the valley the player left. FOG is 0.04.
> 6. **Accepted as the design, not a defect.** A house that takes on the last day only when that fills its store keeps the house far more often (+25 to +30 points) for a small average cost to the valley (about 2 points; about 6 in the Lives where it takes). It does not earn the seal for it, and the Chronicle states the last-day replay as a fact whenever it applies. This trade is the game.
> Gates G1 to G10 and two added checks (X1 the last day decides, X2 the seal is not for sale) all pass on the installed engine (harness run: 136 s).

Working title: **After You**. A single-player browser game built on the iterated prisoner's dilemma.

## 1. What the slice must prove

Two things, in one six-to-eight-minute sitting:

1. **The player is personally tempted.** Their own household must put by enough grain for winter. Plain reciprocity falls a little short of that need, so they must either read their neighbours well or take from someone who trusts them.
2. **What they did is what they leave.** Their choices are counted as precedents ("your ways"). A kin household copies those precedents while the player is still alive and quotes the player's own dated deeds back at them. After twelve days the player leaves; an heir runs the precedents; thirty seasons play out without the player; the game reports the valley with them against the valley as it would have been had their house simply kept the old family way.

Two separate results: **House kept** (purse met the winter need) and **Your mark on the valley** (difference in how often the valley holds, with you versus without you). The best outcome needs both.

Design rules that are not negotiable:
- No payoff matrix on screen, no "cooperate/defect" words anywhere, no game-theory vocabulary anywhere in player-facing text. The verbs are **Send a hand** and **Stay home**.
- Stakes are stated in the world's own terms: sending a hand costs you 1 measure of your own grain left standing; a hand received is worth 3 measures.
- No moral sentences in results. Report events, counts and quotes only.
- All randomness is keyed (see 2.9) so that changing one decision changes no unrelated draw.

## 2. The model

### 2.1 World
- 8 households on a ring, ids 0..7. Each is tied to the 4 houses at ring distance 1 and 2. That is 16 ties.
- House 0 is the player. The player's neighbours are 1, 2, 6, 7. Houses 3, 4, 5 are "far houses": the player never deals with them directly and does not see them until the Afterwards.
- One of the player's four neighbours (chosen by seed) is **kin** (the player's sibling's household).
- Every house has a family name from a seeded pool (for example Kesh, Maren, Tobin, Hale, Wren, Ansel, Brix, Corra, Fenn, Garrow, Odile, Dunmore). No real-world names.

### 2.2 A day
On each day, on each tie, both sides simultaneously choose **help** or **hold**.
- Payoff per side: +b if the other side's help arrived, -c if my help was sent and arrived. Defaults b = 3, c = 1. So: both help +2 each; I help and they hold: me -1, them +3; both hold 0.
- **The ford (noise):** each intended help independently fails to arrive with probability FOG (default 0.05, tunable 0.03 to 0.08). A failed help counts as a hold in every respect: the sender pays nothing, the receiver gets nothing, and everyone else sees only that no hand came. The sender knows it was an accident; nobody else does.

### 2.3 Situations and customs
Each side of a tie is, each day, in exactly one of five situations, determined by what actually happened on that tie yesterday (after the ford):
0. NEW: no dealings yet on this tie ("Meeting someone new")
1. BOTH: both helped ("After you both helped")
2. SHORTED: I helped, they did not ("After they left you short")
3. OWING: I did not, they helped ("After you left them short")
4. NEITHER: neither helped ("After you both stayed home")

A **custom** is five probabilities of helping, one per situation. This is the full memory-one strategy space plus an opening move.

### 2.4 Founders
Non-player houses start from archetypes, with seeded jitter:
- firm: [1, 1, m, 1, t], m in [0.05, 0.2], t in [0.3, 0.5]
- soft: [1, 1, m, 1, m], m in [0.7, 1.0]
- taker: [0, x, 0, x, 0], x in [0, 0.15]
- wary: [0, 1, m, 1, t], m in [0, 0.15], t in [0.3, 0.5]
- steady: [1, 1, 0, 0, 1] with jitter up to 0.1 toward the interior

(Cooperative founders must be able to reopen after both sides have stood down. The ford only ever turns a hand back, it never sends one by accident, so with a zero in the last place a quarrel between two such houses is permanent and every valley dies. See section 5.)

Layout per seed: the player's three non-kin neighbours are one taker, one soft, and one drawn from {firm, wary, steady}, in shuffled seats. The three far houses are drawn without replacement from {firm, firm, firm, soft, wary, steady}: no far house starts as a taker (the arrival in the Afterwards brings the second one). **Kin** starts with the old family way, exactly [1, 1, 0, 1, 0]: send a hand to someone new, then do as they did yesterday.

Archetype names are internal. They are never shown to the player.

### 2.5 The Life
- 12 days, in 3 seasons of 4 days.
- Each day the player chooses help or hold for each of their 4 neighbours, knowing each tie's current situation. Everyone else acts from their custom.
- **Your ways:** for each situation, the tally of what the player *chose* (intended), as "helped h of n". Accidents at the ford do not change the player's tally; they do change what happened on the tie and therefore tomorrow's situation.
- **What you have seen of a neighbour:** for each situation, the tally of that neighbour's *actual* behaviour toward the player and toward the player's other neighbours (ties 1-2, 1-7, 6-7 and each neighbour's tie with house 0). Dealings with far houses are not seen during the Life.
- **Purse:** the sum of the player's payoffs. **Need:** a per-seed number, see 2.8.

### 2.6 Looking-Round (end of every season, in the Life and in the Afterwards)
1. **Kin learns from the player** (Life only; days 4, 8 and 12). For each situation s: if the player's tally has n >= 1, kin's habit becomes h/n and its source is "from you", carrying the list of the player's dated deeds in that situation. If n = 0, kin keeps its current habit and the source is "blank" (never saw you tested).
2. **Other houses reconsider.** R houses (default 1 during the Life, 1 per season in the Afterwards, tunable 1 to 2; never house 0 during the Life, never kin during the Life) are chosen by keyed draw. Each picks one of its neighbours as a model by keyed draw and adopts the model's way with probability 1 / (1 + exp(-(incModel - incSelf) / K)), where inc is average payoff per tie per day over the season just ended and K defaults to 0.5 (tunable).
3. **Adoption is "as witnessed".** For each situation s, if the model's public tally since it last changed custom has n >= 1, the adopter's habit becomes the observed frequency h/n and the source becomes "from \<model>". Otherwise the adopter keeps its own habit. When the model is house 0 during the Life, use the player's ways and attach the dated deeds. After adopting, the adopter's own public tally resets.
4. Optional mutation: with small probability MUT (default 0.05, tunable 0 to 0.15) one habit of an adopting house moves by plus or minus 0.2, clamped to [0, 1].

Every habit of every house carries a **source** record: {type: 'own' | 'you' | 'house' | 'blank', from, deeds}. This is what the "Why?" card shows.

### 2.7 The heir and the Afterwards
- When the Life ends, house 0 passes to an heir. For each situation with n >= 1 in the player's ways, the heir's habit is h/n. A situation with n = 0 is **hollow**: in each future the heir's habit for it is an independent uniform draw in [0, 1].
- The Afterwards is 30 seasons of 4 days. Looking-Round applies each season to all houses including house 0 and kin (their ways can now be displaced like anyone's).
- **One arrival per future:** at a season drawn uniformly from 4..12, the poorest house other than house 0 (by payoff over the last 3 seasons) is replaced by a newcomer taker. Its ties reset to NEW.
- **Help flow** for a span = (helps that arrived) / (ties x 2 x days x (1 - FOG)). A future **holds** if help flow over the final 10 seasons is at least HOLD_LINE (default 0.50: at least half of the hands that could arrive are still arriving).
- **Verdict:** over N futures (default 200) sharing the Life's history: holdsPct, mean help flow, and the worst 5-season stretch (median across futures).
- **Baseline ("the old way"):** the same seed and the same futures, but house 0 lives the Life as [1, 1, 0, 1, 0] and leaves that to its heir, and kin therefore stays [1, 1, 0, 1, 0]. baselinePct is its holdsPct.
- **Mark** = holdsPct - baselinePct, in points.
- **Range:** so the mark can be read in context, the verdict also reports the best and worst holdsPct among nine reference ways, each carried by both the heir and kin in this same valley on these same futures: [1,1,1,1,1], [0,0,0,0,0], [1,1,0,1,0], [1,1,0.33,1,0.33], [1,1,0.5,1,0.5], [1,1,0.67,1,0.67], [1,1,0,0,1], [1,1,0,0,0], [1,1,0.33,1,0]. Report them as `range: { bestPct, worstPct }`. The reference ways are never named to the player.
- **The habit that mattered most:** for each of the five situations, recompute holdsPct with the heir's (and kin's, where kin learned it from the player) habit for that situation moved one precedent toward help and one toward hold (h+1 of n+1, h of n+1; for a hollow habit: fixed at 1 and at 0). Report the single change with the largest absolute effect. Only the Afterwards is recomputed; the Life is not replayed.

### 2.8 The winter need
need = (purse a plain reciprocator earns living this exact Life on this exact tape: help on NEW, then do what the neighbour did yesterday) + MARGIN, where MARGIN is tuned (default +6, range +5 to +7) so that the gates in section 4 hold. Compute it once when the Life is created. Note that the reference run must not change any random draw in the real run.

### 2.9 Keyed randomness
Every draw is a pure function of (seed, purpose, day or season, house a, house b, future index) through an integer hash. Never use a sequential generator. Never use Math.random or Date in the engine.

## 3. Engine deliverable

Folder: `after-you/`.

**Runtime: Node is NOT installed on this machine, and nothing may be installed.** Use the JavaScriptCore shell that ships with macOS:
`JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc`
It provides `print(...)`, `load('file.js')` (path relative to the current directory), `readFile(path)`, `preciseTime()` and standard ES2020+. It has no `require`, no `module`, no `process`, no filesystem writes. Run scripts as `cd "<folder>" && "$JSC" harness.js`.

- `engine.js`: the whole model as one dependency-free file. It must work in a browser (`<script src="engine.js">` sets `window.AfterYou`) and in the jsc shell (`load('engine.js')` sets `globalThis.AfterYou`); also set `module.exports` when `module` exists. No DOM access. State objects are plain data.
- `harness.js`: a jsc script (`load('engine.js')` at the top, output through `print`) that runs the gates in section 4 and prints a readable report plus a one-line PASS/FAIL per gate. It must finish in under 3 minutes.

The engine must expose, at minimum (names may be refined, but document the final API in a header comment because the page will be built from it):
- `createLife(seed)`: a new Life state: houses with names and roles, need, day 1.
- `today(life)`: for each of the four neighbours, the current situation, what happened yesterday, and what the player has seen of them.
- `playDay(life, choices)`: resolves one day. Returns per neighbour: what the player intended, whether it was lost at the ford, what the neighbour did, the payoff, and the neighbour's "why" record (situation they were in and the source of that habit, including the player's dated deeds when the habit came from the player). Also returns any Looking-Round events when the day ends a season.
- `ways(life)`: the player's five tallies.
- `legacy(life)`: the heir's custom with hollow flags.
- `runFuture(life, index, options)`: one future, season by season, with enough detail to animate: each house's help rate, purse and whose way it is running that season, plus events (adoptions with model and adopter, the arrival, house 0's or kin's way being displaced).
- `verdict(life, options)`: holdsPct, baselinePct, mark, mean help flow, worst stretch, the per-habit what-ifs and the habit that mattered most. It must be callable in slices (for example a `futures` range or a progress callback) so a page can stay responsive.

Performance target: a full verdict (baseline plus the ten what-ifs, 200 futures each) in under 2.5 seconds in jsc on this laptop. If that cannot be met, say so and offer a cheaper setting.

## 4. Gates the harness must check

Policies that live the Life (they may use only what `today(life)` shows, except `reader`, which may read archetypes):
- **saint**: always sends a hand. **hawk**: never does. **plain**: sends to someone new, then does what the neighbour did yesterday.
- **forgiving**: as plain, but sends one time in three after being left short, and always sends after its own accident at the ford.
- **reader**: knows the archetypes: never sends to the taker after day 1, forgives cooperative neighbours' lapses, repairs its own accidents, opens twice to a wary neighbour.
- **reader+last1**, **reader+last2**, **reader+last3**: reader, but stays home against everyone on the last 1, 2 or 3 days.
- **forgiving+last1**: forgiving, but stays home against everyone on day 12.
- **soft-grabber**: as forgiving, but stays home against any neighbour it has seen send a hand after being left short.

Run at least 60 seeds, 200 futures per verdict.

- **G1 Temptation is real.** Share of seeds in which the need is met: reader between 40% and 70%; reader+last1 at least 12 points above reader; forgiving between 10% and 50%; saint at most 30%; hawk at most 20%; plain 0% by construction. Mean purse of reader+last1 is at least 2 measures above reader.
- **G2 The grab costs the valley.** Mean mark of reader+last1 is at least 4 points below reader; mean mark of reader+last3 is at least 15 points below reader.
- **G3 Attribution.** Within the same seed, the spread of holdsPct across the nine reference ways of 2.7 is at least 25 points in at least 80% of seeds.
- **G4 No trivial way.** Search heir customs on the grid {0, 0.5, 1}^5 for a sample of at least 12 seeds (heir and kin both carry the custom). The best custom by holdsPct is neither all ones nor all zeros in at least 80% of sampled seeds. Report the five best on average, and where always-help, always-hold, mirror [1,1,0,1,0], win-stay-lose-shift [1,1,0,0,1] and generous mirror [1,1,0.5,1,0.5] rank.
- **G5 Determinism.** Same seed and decisions give identical output. Changing one decision on day 3 leaves every ford draw and every unrelated draw unchanged.
- **G6 A habit matters.** In at least 60% of seeds, for the forgiving policy, the habit that mattered most moves holdsPct by at least 5 points.
- **G7 Not a lottery.** baselinePct lies between 15% and 85% in at least 60% of seeds.
- **G8 The mirror shows.** In at least 85% of seeds, for each of plain, forgiving and reader, kin acts toward the player at least once during days 5 to 12 from a habit whose source is "from you" with at least one dated deed.
- **G9 The situations come up.** For the forgiving policy, the median number of the player's five situations with n >= 2 by day 12 is at least 4.
- **G10 No recipe wins both.** Among all the policies above, the one with the highest need-met rate is not the one with the highest mean mark, and no policy both meets the need in 85% or more of seeds and has a mean mark of +3 or better.

Tune only the parameters marked tunable (FOG, K, MUT, MARGIN, reconsiderations per season, HOLD_LINE within 0.45 to 0.6, the arrival window) and, if needed, the founder bands in 2.4 within principled limits. Do not weaken a gate to make it pass, do not special-case a policy, do not hard-code an outcome. If a gate cannot be met, report the best numbers reached and what stands in the way.

## 5. What the first build found (read this before tuning)

A first builder implemented the original numbers and was interrupted while tuning. Its engine.js and harness.js are in the code folder and are structurally sound (keyed draws, a full verdict in about 0.1 s). Its findings, and follow-up experiments by the design lead on a scratch copy (in the `<scratch>` folder under `exp/`: a patched engine.js plus scan.js, scan2.js, scan3.js; read them if useful, do not copy them blindly):

1. **With the original founders every valley dies.** Firm and wary houses had almost no chance of reopening after both sides stood down, and the old way has none. Because the ford only removes hands, a quarrel between two such houses is permanent. Baseline holdsPct was under 10% in most seeds and every policy's mark was within a few points of zero. Hence the revised founder bands in 2.4.
2. **More copying means faster collapse.** With 2 or more reconsiderations a season, takers' ways spread from the soft houses. With 1 a season, K = 0.5, FOG = 0.05 and HOLD_LINE = 0.5 the valley is open: over 24 seeds the baseline median was 43%, it lay between 15% and 85% in every seed, and the median spread between the best and worst reference way was about 40 points.
3. **In that setting the shape of the landscape is right.** Mean holdsPct by way (heir and kin both carrying it): always-hold 11, [1,1,0,0,0] 13, always-help 35, soft 38, mirror 40, win-stay-lose-shift 41, [1,1,0.67,1,0.67] 43, [1,1,0.5,1,0.5] 46, [1,1,0.33,1,0.33] 48. Too hard and too soft both lose; taking loses most.
4. **Grabbing early does not pay; grabbing on the last day does.** Over 60 seeds: reader earns 7.2 measures more than plain with a mark of +6.6. reader+last1 earns 10.0 more with a mark of -0.8. reader+last2 earns 8.3 more, mark -17.3. reader+last3 earns 7.5 more, mark -21.2. Kin, who copies the player from day 4, hands back whatever the player has been doing, so mid-Life taking is self-punishing; only the last day is free of consequence to the purse. With MARGIN = 6, reader meets the need in 58% of seeds and reader+last1 in 73%. That is the dilemma the slice needs: keep it.
5. The earlier "grabber" and "late-grabber" policies were badly specified and are replaced by the policies in section 4.

Suggested starting point: FOG 0.05, K 0.5, MUT 0.05, MARGIN 6, R_LIFE 1, R_AFTER 1, HOLD_LINE 0.5, arrival 4..12, founder bands as in 2.4. Verify these numbers yourself; do not take them on trust.
