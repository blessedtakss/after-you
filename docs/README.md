# Design notes

These notes record how After You was designed and built: the first version (v0.1.0, published 22 November 2026) and the four new places of v0.2.0 (published 26 November 2026). They were written during the build in a scratch folder that does not last, and were copied here on 2026-11-26 so that later work keeps them.

Each note is a record of its time: it says what was decided, believed and measured when it was written. Later notes, the binding decisions below and the code supersede it where they differ. The code is the authority on what the game does now: the header comment of `engine.js`, then `words.js` and `places/`. The notes describe the model and the scoring in full, so they are spoilers.

## Binding: the design lead's decisions

**[places/LEAD-DECISIONS.md](places/LEAD-DECISIONS.md)**, written 2026-11-25 17:39, last changed 2026-11-26 02:33. Everything in it was binding on the v0.2.0 build, and where a report disagrees with it, it wins. Its five sections:

1. **The engine.** One engine, built from E1 plus the Banks' and the Saltmarket's engine additions, with the four fixers' presets; the page always calls `createLife(seed, placeKey)`.
2. **Settled design calls.** The last-day rule (R2) stays for every new place; the Saltmarket's seal bar is 20 and is never printed; the Banks' poacher is accepted and never named; the Watch's PG12(b) and the Bridges' R_AFTER 4 are accepted; how the gates are read.
3. **The page.** The valley does not move; plain words; every number on screen comes from the Life; the architecture, chooser, address, stored lives, per-place features, words and room on screen.
4. **The confirmation round.** All four places hold; the facts the page must hold for each place (need and store ranges); the Watch takes the season replay; a plain line for a seal it withholds; how PG10's ratio is read.
5. **The review round.** "Even so" on a Why? card is accepted in all five places; the valley's laptop day is fixed by CSS in every place; 320x640 is exempt from "Begin on the first screen"; four things are accepted as they are.

## How to read them

- **The header line.** Each copied note starts with one quoted line: when it was written (from the file's own timestamps in the scratch folder, local time, UTC+10), for which version, and where the kept checks are.
- **Paths.** `<scratch>/...` stands for the build's scratch folder, which was not kept, and `after-you/...` for this repository. Folders named without a prefix (`e1/`, `final/`, `tune-banks/`, `page-p3/`, `review-banks/` and so on) are scratch folders too. The table at the end maps each kept note's scratch location to its place here; the scripts, outputs and engine copies the notes cite were not kept.
- **Checks.** The check tools kept from that work are in [`checks/`](../checks/). The game's own checks (`page-smoke.js`, `harness.js`) are at the top of the repository.
- **Labels.** Most notes label each number: [measured] or [m: file] means a script was run and its output saved (in the scratch folder); [argued] means reasoned, not run.
- **Gates.** G1 to G10, X1 and X2 are the valley's checks (`first-version/SPEC.md` section 4, run by `harness.js`). PG1 to PG14 are the place gates ([places/design/E1-REPORT.md](places/design/E1-REPORT.md) section 8.4).

## The story

1. **The first version** (22 November 2026): an atlas of real dilemmas, a game concept, the rules (SPEC) and the page (UI-SPEC). Published as v0.1.0.
2. **Designing the places** (23 to 25 November): a map of what each "dial" does to the engine and a lab to measure it; three proposals from different angles; three judges; then E1, the dials ported into the engine with fourteen place gates.
3. **Each place** (25 November), in four rounds: a tuner set the preset and the honest policy; a breaker attacked it on fresh seeds; a fixer closed the breaks; a confirmer attacked the final engine on seeds nobody had used. Then the final preset.
4. **The page** (map 23 November, build 25 November): the page map, then six stages, from a refactor that leaves the valley unchanged to the integration of all five places.
5. **The review round** (26 November): seven reviewers, two fix rounds, two verifications.
6. **The lead's decisions**, above, settle what the rounds left open.

## Index

### 1. The first version (v0.1.0)

In the order they were written.

| Document | What it is | Written |
|---|---|---|
| [first-version/atlas.md](first-version/atlas.md) | A scenario atlas: 37 situations shaped like the prisoner's dilemma, all real but the last two, which come from science fiction (history, war, business, finance and more), each with a twist a game could use, and ten recurring twist dimensions. | 2026-11-22 12:16 |
| [first-version/design.md](first-version/design.md) | The game concept that became After You: name candidates, pitch, four pillars, core loop, dilemma engine, scenario system, opponents, roadmap, open decisions and a runner-up direction. | 2026-11-22 12:41 |
| [first-version/SPEC.md](first-version/SPEC.md) | The rules of the first playable slice: the model, founders, the Life, Looking-Round, heir and Afterwards, winter need, keyed randomness and gates G1 to G10, under the lead's "Revision 3" note. | 2026-11-22 13:37 |
| [first-version/UI-SPEC.md](first-version/UI-SPEC.md) | The page specification (revision 2): files, test hooks, the five views, the plain-words rule, technical rules, look, and the self-check without a browser. | 2026-11-22 17:55 |

### 2. Designing the places

The engine map and the lab came first (23 November); the proposers measured with that lab, the judges compared the proposals, and E1 built what the judges chose.

| Document | What it is | Written |
|---|---|---|
| [places/design/ENGINE-MAP.md](places/design/ENGINE-MAP.md) | What each place dial (stakes, luck, inverted charter, custom, clock, stock, schooling, sight, founders) touches in the v0.1.0 engine, measured on a prototype engine. | 2026-11-23 01:15 |
| [places/design/LAB.md](places/design/LAB.md) | How to use the place lab (the prototype engine with the dials and its lab.js helpers) that the proposers measured with; two worked examples. | 2026-11-23 01:12 |
| [places/design/PROPOSAL-seat.md](places/design/PROPOSAL-seat.md) | Proposal 1, "seen from the seat": the Banks, the Bridges, the Saltmarket and the Watch, written from what the player sees, with reserves. | 2026-11-25 08:58 |
| [places/design/PROPOSAL-theorist.md](places/design/PROPOSAL-theorist.md) | Proposal 2, the theorist's: the Shoal, the Salt Road, the Narrow Bridge and the Watchtowers, chosen as one map of the dilemma's family. | 2026-11-25 08:55 |
| [places/design/PROPOSAL-prover.md](places/design/PROPOSAL-prover.md) | Proposal 3, the prover's: fewest engine changes and most evidence; the Watchtowers, the Shoal, the Salt Ring and the Narrow Bridge (conditional). | 2026-11-25 09:00 |
| [places/design/REVIEW-breaker.md](places/design/REVIEW-breaker.md) | Judge 1, the breaker: six attacks on each of the twelve proposed places on seeds the proposers did not tune on, and the pack it would build. | 2026-11-25 09:25 |
| [places/design/REVIEW-engineer.md](places/design/REVIEW-engineer.md) | Judge 2, the engineer: what each place costs in engine.js without moving the valley; recommends the Watchtowers, Banks, Bridges and Saltmarket and the one engine extension (E1). | 2026-11-25 09:23 |
| [places/design/REVIEW-first-timer.md](places/design/REVIEW-first-timer.md) | Judge 3, the first-time visitor: whether each place's words stay true and read clearly on the page, and the pack it would build. | 2026-11-25 09:16 |
| [places/design/E1-REPORT.md](places/design/E1-REPORT.md) | E1: the place dials ported into the engine with the valley proved unchanged, the gate lab, and the fourteen place gates PG1 to PG14 (section 8.4). | 2026-11-25 10:11 |

### 3. Each place

In play order. Within a place: tune, break, fix, confirm, then the final preset.

#### The Banks

| Document | What it is | Written |
|---|---|---|
| [places/banks/TUNE.md](places/banks/TUNE.md) | The tuner's preset, honest policy and selfish act; all 14 gates pass on fresh seeds. | 2026-11-25 14:11 |
| [places/banks/BREAK.md](places/banks/BREAK.md) | The breaker's attack on fresh seeds: broken (PG10, offering peace more than once a quarrel is a recipe; PG11; PG12(a); PG12(c)). | 2026-11-25 14:49 |
| [places/banks/FIX.md](places/banks/FIX.md) | The fix: the peacemaker as honest policy, a sixth founder kind (the poacher), R_AFTER 2.5 and a new need; all four breaks closed, 14 gates pass. | 2026-11-25 17:28 |
| [places/banks/CONFIRM.md](places/banks/CONFIRM.md) | A fresh attack on the final engine: holds; non-blocking findings (one need of 301, small gains from shaping a habit). | 2026-11-25 19:19 |
| [places/banks/PRESET.md](places/banks/PRESET.md) | The final preset as it is in engine.js at v0.2.0, quoted, and how it compares with the fixer's. | 2026-11-26 (quoted from engine.js) |

#### The Watch (shown as "Border")

| Document | What it is | Written |
|---|---|---|
| [places/watch/TUNE.md](places/watch/TUNE.md) | The tuner's preset with the custom [0,1,1,1,0] (never stand down first) and its reasons; 13 gates pass on fresh seeds, PG14 only when timed alone. | 2026-11-25 13:21 |
| [places/watch/BREAK.md](places/watch/BREAK.md) | The breaker's attack: broken (PG12(a), the valley's best way ranks in the top ten; PG11 on 3 of 11 bands); no recipe found. | 2026-11-25 13:50 |
| [places/watch/FIX.md](places/watch/FIX.md) | The fix: new stakes and luck with no engine change; PG12(a) and PG11 closed, PG12(b) left to the Watch's exemption. | 2026-11-25 17:19 |
| [places/watch/CONFIRM.md](places/watch/CONFIRM.md) | A fresh attack on the final engine: holds, 14 of 14; a late act can lift the seal, so it recommends the season replay (adopted, LEAD-DECISIONS section 4). | 2026-11-25 19:16 |
| [places/watch/PRESET.md](places/watch/PRESET.md) | The final preset as it is in engine.js at v0.2.0, quoted, and how it compares with the fixer's. | 2026-11-26 (quoted from engine.js) |

#### The Bridges

| Document | What it is | Written |
|---|---|---|
| [places/bridges/TUNE.md](places/bridges/TUNE.md) | The tuner's pick (S -2, H 2, two pushers near) and take-turns as honest policy; 13 of 14 gates, PG10's ratio failing. | 2026-11-25 11:24 |
| [places/bridges/BREAK.md](places/bridges/BREAK.md) | The breaker's attack: broken (PG10 ratio and cap, PG11's ceiling, and a need of 0 on one seed in a million). | 2026-11-25 11:53 |
| [places/bridges/FIX.md](places/bridges/FIX.md) | The fix: "take turns, at the jams too", R_AFTER 4, K 0.25, FOG 0.06, MARGIN 21, STORE_START 50; all breaks closed, no engine change. | 2026-11-25 13:59 |
| [places/bridges/CONFIRM.md](places/bridges/CONFIRM.md) | A fresh attack with 165 policies: holds; the season replay is not recommended for the Bridges. | 2026-11-25 19:19 |
| [places/bridges/PRESET.md](places/bridges/PRESET.md) | The final preset as it is in engine.js at v0.2.0, quoted, and how it compares with the fixer's. | 2026-11-26 (quoted from engine.js) |

#### The Saltmarket

| Document | What it is | Written |
|---|---|---|
| [places/saltmarket/TUNE.md](places/saltmarket/TUNE.md) | The tuner's preset, with the custom changed to the guild's rule [1,1,0,1,0]; all 14 gates pass, while the briefed custom and the Salt Ring fallback fail. | 2026-11-25 12:35 |
| [places/saltmarket/BREAK.md](places/saltmarket/BREAK.md) | The breaker's attack: broken (a "stage a precedent" recipe over the PG10 cap; PG10's ratio; the honest policy is not the best honest play). | 2026-11-25 13:05 |
| [places/saltmarket/FIX.md](places/saltmarket/FIX.md) | The fix: both breaks closed with two engine additions, the season replay (REPLAY 'season') and a seal mark of 20 (SEAL_MARK). | 2026-11-25 16:04 |
| [places/saltmarket/CONFIRM.md](places/saltmarket/CONFIRM.md) | A fresh attack on the final engine: holds; 14 gates pass, the season replay checked. | 2026-11-25 19:21 |
| [places/saltmarket/PRESET.md](places/saltmarket/PRESET.md) | The final preset as it is in engine.js at v0.2.0, quoted, and how it compares with the fixer's. | 2026-11-26 (quoted from engine.js) |

### 4. The page

The page map was written on 23 November, before the places were designed; the six stages ran on 25 November.

| Document | What it is | Written |
|---|---|---|
| [places/page/PAGE-MAP.md](places/page/PAGE-MAP.md) | Where the valley is written into the v0.1.0 page (words, sheet, rules on screen, chooser, hash, stored lives, the check), the baseline fingerprints, and the recommended architecture. | 2026-11-23 01:03 |
| [places/page/REPORT-p1-refactor.md](places/page/REPORT-p1-refactor.md) | Stage 1, refactor: the new engine installed and the page split into per-place files; the valley's fingerprints unchanged. | 2026-11-25 19:28 |
| [places/page/REPORT-p2-machinery.md](places/page/REPORT-p2-machinery.md) | Stage 2, machinery: the chooser, the address, stored lives and per-place files, with the valley alone. | 2026-11-25 19:29 |
| [places/page/REPORT-p3-banks.md](places/page/REPORT-p3-banks.md) | Stage 3: the Banks end to end. | 2026-11-25 20:33 |
| [places/page/REPORT-p4-shared.md](places/page/REPORT-p4-shared.md) | Stage 4: shared features for the Watch, the Bridges and the Saltmarket, and a first draft of each place file. | 2026-11-25 21:29 |
| [places/page/REPORT-p5-watch.md](places/page/REPORT-p5-watch.md) | Stage 5: the Watch's words polished (places/watch.js only). | 2026-11-25 22:04 |
| [places/page/REPORT-p5-bridges.md](places/page/REPORT-p5-bridges.md) | Stage 5: the Bridges' words polished (places/bridges.js only). | 2026-11-25 22:11 |
| [places/page/REPORT-p5-saltmarket.md](places/page/REPORT-p5-saltmarket.md) | Stage 5: the Saltmarket's words polished (places/saltmarket.js only). | 2026-11-25 22:06 |
| [places/page/REPORT-p6-integrate.md](places/page/REPORT-p6-integrate.md) | Stage 6, integrate: the line for a seal withheld by the season replay, the final checks and the final file hashes. | 2026-11-25 22:58 |

### 5. The review round

| Document | What it is | Written |
|---|---|---|
| [places/REVIEW-ROUND.md](places/REVIEW-ROUND.md) | The review round: 77 findings from seven lenses (read:banks, read:watch, read:bridges, read:saltmarket, rules-leaks, browser, code), two fix rounds and two verifications, rendered from the workflow result. | 2026-11-26 02:30 (rendered 2026-11-26) |

### 6. The binding decisions

| Document | What it is | Written |
|---|---|---|
| [places/LEAD-DECISIONS.md](places/LEAD-DECISIONS.md) | The design lead's binding decisions for v0.2.0: the one engine, settled design calls, the page's principles, and the rulings after the confirmation and review rounds. | 2026-11-25 17:39, last changed 2026-11-26 02:33 |

## Where each note came from

| Here | Source (the scratch folder was not kept) |
|---|---|
| `first-version/atlas.md` | `<scratch>/atlas.md` |
| `first-version/design.md` | `<scratch>/design.md` |
| `first-version/SPEC.md` | `<scratch>/SPEC.md` |
| `first-version/UI-SPEC.md` | `<scratch>/UI-SPEC.md` |
| `places/design/ENGINE-MAP.md` | `<scratch>/places/engine-map/ENGINE-MAP.md` |
| `places/design/LAB.md` | `<scratch>/places/engine-map/LAB.md` |
| `places/design/PROPOSAL-seat.md` | `<scratch>/places/propose-seat/PROPOSAL.md` |
| `places/design/PROPOSAL-theorist.md` | `<scratch>/places/propose-theorist/PROPOSAL.md` |
| `places/design/PROPOSAL-prover.md` | `<scratch>/places/propose-prover/PROPOSAL.md` |
| `places/design/REVIEW-breaker.md` | `<scratch>/places/judge-breaker/REVIEW.md` |
| `places/design/REVIEW-engineer.md` | `<scratch>/places/judge-engineer/REVIEW.md` |
| `places/design/REVIEW-first-timer.md` | `<scratch>/places/judge-first-timer/REVIEW.md` |
| `places/design/E1-REPORT.md` | `<scratch>/places/e1/E1-REPORT.md` |
| `places/banks/TUNE.md` | `<scratch>/places/tune-banks/TUNE.md` |
| `places/banks/BREAK.md` | `<scratch>/places/break-banks/BREAK.md` |
| `places/banks/FIX.md` | `<scratch>/places/fix-banks/FIX.md` |
| `places/banks/CONFIRM.md` | `<scratch>/places/confirm-banks/CONFIRM.md` |
| `places/banks/PRESET.md` | engine.js, lines 552 to 569 |
| `places/watch/TUNE.md` | `<scratch>/places/tune-watch/TUNE.md` |
| `places/watch/BREAK.md` | `<scratch>/places/break-watch/BREAK.md` |
| `places/watch/FIX.md` | `<scratch>/places/fix-watch/FIX.md` |
| `places/watch/CONFIRM.md` | `<scratch>/places/confirm-watch/CONFIRM.md` |
| `places/watch/PRESET.md` | engine.js, lines 570 to 584 |
| `places/bridges/TUNE.md` | `<scratch>/places/tune-bridges/TUNE.md` |
| `places/bridges/BREAK.md` | `<scratch>/places/break-bridges/BREAK.md` |
| `places/bridges/FIX.md` | `<scratch>/places/fix-bridges/FIX.md` |
| `places/bridges/CONFIRM.md` | `<scratch>/places/confirm-bridges/CONFIRM.md` |
| `places/bridges/PRESET.md` | engine.js, lines 585 to 601 |
| `places/saltmarket/TUNE.md` | `<scratch>/places/tune-saltmarket/TUNE.md` |
| `places/saltmarket/BREAK.md` | `<scratch>/places/break-saltmarket/BREAK.md` |
| `places/saltmarket/FIX.md` | `<scratch>/places/fix-saltmarket/FIX.md` |
| `places/saltmarket/CONFIRM.md` | `<scratch>/places/confirm-saltmarket/CONFIRM.md` |
| `places/saltmarket/PRESET.md` | engine.js, lines 602 to 614 |
| `places/page/PAGE-MAP.md` | `<scratch>/places/page-map/PAGE-MAP.md` |
| `places/page/REPORT-p1-refactor.md` | `<scratch>/places/page-p1/REPORT.md` |
| `places/page/REPORT-p2-machinery.md` | `<scratch>/places/page-p2/REPORT.md` |
| `places/page/REPORT-p3-banks.md` | `<scratch>/places/page-p3/REPORT.md` |
| `places/page/REPORT-p4-shared.md` | `<scratch>/places/page-p4/REPORT.md` |
| `places/page/REPORT-p5-watch.md` | `<scratch>/places/page-p5-watch/REPORT.md` |
| `places/page/REPORT-p5-bridges.md` | `<scratch>/places/page-p5-bridges/REPORT.md` |
| `places/page/REPORT-p5-saltmarket.md` | `<scratch>/places/page-p5-saltmarket/REPORT.md` |
| `places/page/REPORT-p6-integrate.md` | `<scratch>/places/page-p6/REPORT.md` |
| `places/REVIEW-ROUND.md` | the review workflow's result (JSON, not kept) |
| `places/LEAD-DECISIONS.md` | `<scratch>/places/final/LEAD-DECISIONS.md` |

## What was changed in the copies

Each copied note is the note as it was, except that:

- one header line was added at the top;
- absolute paths were made neutral: the scratch folder became `<scratch>` (43 places) and the game folder became `after-you` (48 places);
- 10 relative mentions of the scratch folder were written the same way (`<scratch>/...`);
- where such a `<scratch>` path stood outside code, it was put in backticks (27 places), so that it shows instead of being read as an HTML tag;
- other placeholders standing outside code, such as `<place>` and `<seed>`, were escaped as `\<place>` (14 places in 7 notes), for the same reason;
- in [first-version/SPEC.md](first-version/SPEC.md), a remark about a space in the game folder's path was dropped, since the path it described was made neutral.

Nothing else in them was changed. [places/REVIEW-ROUND.md](places/REVIEW-ROUND.md) is rendered from the review workflow's JSON result (paths made neutral the same way, and `<` escaped outside code), and each `PRESET.md` quotes `engine.js`.
