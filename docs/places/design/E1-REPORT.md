> **Record of its time.** Written 2026-11-25 10:11 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# E1: the place dials ported into the engine, and the gate lab

Folder: `<scratch>/places/e1/` (called `e1/` below). Nothing in the game folder was edited; the shipped `engine.js` and `harness.js` were only read.

Labels: **[measured: file]** = run in `e1/`, the output file is named; **[argued]** = reasoned from the code. Line numbers are those of `e1/engine-places.js` (1626 lines; md5 `69c48ff7df21bdca45c44369b62240ad`) unless a line says "shipped".

## 0. Status

| What | Result |
|---|---|
| Engine port | `engine-places.js`: the shipped `engine.js` (md5 `6090c8f6…`) with every dial added by hand. 386 lines added (211 of them code, the rest header and comments), 55 changed. No new draw purpose, key or ordering. |
| Valley identity | **0 differences** in 19,856 JSON comparisons over 472 Lives: the engine-map's 337-Life set, plus every new default spelled out (60 Lives), the valley's seats and range written out explicitly (30), the valley chosen by key (30), and key plus a valley tunable (15) [measured: `identity-places-out.txt`]. |
| Valley harness | `harness.js` run on `engine-places.js`: all 213 output lines identical to the shipped run `<scratch>/harness-mine.txt` except the two timing values; all 12 gate lines (G1–G10, X1, X2) identical [measured: `harness-places-out.txt`]. |
| Determinism, dials on | Check 7 form and the harness's G5 form pass for all five presets [measured: `determinism-places-out.txt`]. |
| Dial checks | 9 of 9 PASS (stakes and stock in the Life and in the futures rebuilt independently, custom = reference, STORE_START, charter mirror, R2 replay, founders, range, bad parameters) [measured: `checks-places-out.txt`]. |
| Speed | A valley verdict is no slower (0.840 s against 0.870 s for the shipped engine, same 10 Lives alternating). A full verdict in any preset takes 0.75–0.88 s on average, at most 0.97 s [measured: `speed-places-out.txt`]. |
| Gate lab | `placelab.js`, with `gates()` for PG1–PG14. Smoke run on all five [measured: `gates-smoke-out.txt`, 94.7 s]. Full-count run on all five [measured: `gates-full-<place>-out.txt`, 248–290 s each]. With placeholder honest policies, the Bridges passes 14 of 14, Banks and Saltmarket 12, Watch 10, valley 11 (section 9). |

## 1. Files

| File | What it is |
|---|---|
| `engine-places.js` | The engine with the place dials. The candidate to replace `engine.js`. |
| `engine-places.diff` | `diff -u` of the shipped engine against it. |
| `engine-shipped.js` | Byte copy of the shipped engine (md5 `6090c8f63791b1ea6ef39a197db9bc7e`), for the diff only. The identity proof loads the game folder's file itself. |
| `identity-places.js` → `-out.txt` | Valley identity (section 4). |
| `harness-places.js` → `-out.txt` | The shipped harness with one line changed (it loads `engine-places.js`). |
| `determinism-places.js` → `-out.txt` | Check 7 form and G5 form per preset (section 5). |
| `checks-places.js` → `-out.txt` | What each dial does (section 6). |
| `speed-places.js` → `-out.txt` | Shipped against places engine, and a full verdict per preset (section 7). |
| `placelab.js` | The tuners' gate lab (section 8). |
| `valley-seal-grid.js` → `-out.txt`, `valley-best.js` | The valley's best fixed way by seal, for PG12a (243 lived ways × 24 seeds at 2000/1000). `placelab.js` loads `valley-best.js`. |
| `placelab-example.js` → `-out.txt` | A tuner's session (section 8.6). |
| `gates-smoke.js` → `gates-smoke-out.txt` | `gates()` on the five at smoke counts. |
| `gates-full-<place>.js` → `-out.txt` | `gates()` on each at full counts. |
| `valley-pulls.js` → `-out.txt`, `valley-pulls-data.js` | The valley's reference pulls for PG12c (careful, 200 seeds, 200 futures). |
| `t-bridges-need*.js` → `-out.txt`, `t-trace-speed.js` → `-out.txt` | Probes cited in sections 3.3 and 7. |

## 2. The port, dial by dial

Rules kept throughout: a place is an overrides object carried in `life.params`; new state exists only when its dial is on; default arithmetic adds exact zeros; no randomness is added or reordered (ENGINE-MAP section 6).

| Dial | Lines | What changed |
|---|---|---|
| Header | 52–122, 157–164, 185–189, 377–392, 432–443 | A PLACES section: every parameter, every page-visible addition and what the page reads differently (section 3). `createLife(seed, place?, overrides?)`. `lastDay` under 'habit', `seal.wonOnLastDay`. New exports. |
| Parameters | 466–481 | `S 0`, `H 0`, `CUSTOM [1,1,0,1,0]`, `STORE_START 0`, `STOCK null`, `FLOW_KIND 'hands'`, `CHARTER 'holds'`, `REPLAY 'valley'`, `RANGE_WAYS null`, `FOUNDERS null`. Shipped line 390 `OLD_WAY` is gone (line 499 says where it went): every use reads `params.CUSTOM`. |
| Valley seats as data | 493–495 | `VALLEY_NEAR = ['taker', 'soft', ['firm','wary','steady']]`. |
| PLACES | 524–585 | The presets (section 3), `PLACE_ORDER`, `FLOW_CODE`, `KINDS`. |
| Validation | 687–723 | `checkPlace`: B, C, S, H, STORE_START whole numbers; CUSTOM five 0s/1s; STOCK whole, `0 <= min <= start <= max`, `start > 0`; known FLOW_KIND, CHARTER, REPLAY; 'stock' needs STOCK; an explicit RANGE_WAYS must contain CUSTOM; FOUNDERS kinds known, far ≥ 3. Bad settings throw (check 9). |
| Helpers | 724–749 | `rangeWaysOf` (place list; or the valley's 13, with the custom appended if outside), `heldBy` (the charter's good outcome), `stockStep`, `seatKinds`. |
| CUSTOM: kin | 760, 772 | `founder(..., custom)`: kin's founding way is the place's custom. |
| Params per Life | 778–787 | `ownCopy`: each Life gets its own copy of CUSTOM, STOCK and the lists (never shares PLACES or the caller's object); `checkPlace(P)`. |
| FOUNDERS | 790–795 | `seatKinds(F ? F.near : VALLEY_NEAR)`: a list entry draws with `P_THIRD`, sub-key = its place among list entries. So the valley's one list draws exactly what it always drew (identity group 5 checks this). Far pool `F.far` or `FAR_POOL`. |
| STORE_START, STOCK state | 805, 813, 816–823 | House 0's purse and `life.purse` start at STORE_START; `life.stock` (16 × start) exists only with STOCK. |
| Need | 838–846 | `winterNeed`: pivot = `NEED_PIVOT + STORE_START`. The need rises by exactly STORE_START, so kept is unchanged (check 4: 2000 Lives, 0 differ). |
| Place keys | 847–862, 864–882 | `placeOf`, `createLife(seed, place, more)`: a key (unknown throws) or an overrides object, plus optional overrides on top. The reference Life plays `custom[...] === 1` (874). `life.place` only when a key was given (880). |
| `today()` | 903 | `neighbours[i].stock` (the level a hand arriving today is worth B × of). |
| Stakes, Life | 946–960 | `bt = B × level` (or B), `shared = S·[both] − H·[neither]`; `gain += bt·theirs − C·mine + shared`; then the level steps. |
| Player payoff | 982 | Same formula as the gains. |
| Levels to the page | 987, 991, 994 | `results[i].stock` / `.stockAfter`; `kinWith[i].stock` / `.stockAfter`. |
| CUSTOM: heir | 1104–1106 | Untested ways default to the custom. |
| STOCK to the futures | 1111–1125 | `endState().stock`. |
| REPLAY | 1126–1156 | `replayLastDay`: 'valley' unchanged; 'habit' = R2 (section 3.4). Returns `rule`, `ties` under 'habit' only. |
| CUSTOM: baseline heir; stock in scenario/scratch | 1186, 1195, 1215 | `sc.stock` from the end state; baseline heir carries the custom; `W.stock`. |
| Futures loop | 1219–1306, 1350 | Dials read once (1228); stakes as in the Life (1292–1294, `shared` only computed when S or H is non-zero); each flow kind counts only its own quantity (1296); stock steps (1297–1301); flow = hands / expected (valley) or count / tie-days, with 'stock' divided by `STOCK.start` (1240, 1306); arrivals keep tie levels (1266–1270); `seasons[k].ties` when STOCK (1350). |
| CHARTER | 1408, 1435–1442, 1450 | `stepRun` `held = heldBy(...)`, `levelOf` charter-facing, `runFuture().holds`. Nothing else: mark, rank, best/worst, what-ifs, last-day delta and seal follow (check 5). |
| Range | 1481, 1487, 1540 | `job.rangeWays = rangeWaysOf(P)`; the custom's row found by `P.CUSTOM`. |
| lastDay entry, seal | 1508, 1564, 1576–1583 | `rule`/`ties` carried into the verdict's entry; under 'habit' `seal.wonOnLastDay` and `earned &&= !won`. |
| Exports | 1617–1619 | `PLACES`, `PLACE_ORDER`, `tieList`, `rangeWays(life)`. |

Checked against the engineer's section 4: the charter is three sites and faces the charter as claimed. On 8 Saltmarket Lives read both ways, held is complemented, the mark is negated with the same standard error, best and worst swap, and every what-if and last-day delta is negated; the level is mirrored [measured: `checks-places-out.txt` line 5]. Two things the engineer listed differently: `REPLAY 'habit'` replaces `REPLAY_SITS`/`REPLAY_FLIP` (the design lead's R2), and `FOUNDERS` is in (the Bridges needs two takers); `FLOW_KIND 'both'` is in (the Saltmarket preset uses it).

## 3. For the page: API additions and what reads differently

### 3.1 New API

- `AfterYou.createLife(seed, place?, overrides?)`. `place` = a key of `AfterYou.PLACES`, or an overrides object (the old form). `life.place` = the key. It is absent when no key was given; the page should always pass one, `'valley'` included.
- `AfterYou.PLACES` (presets), `AfterYou.PLACE_ORDER` (`['valley','banks','watch','bridges','saltmarket']`), `AfterYou.tieList` (16 × [a, b]), `AfterYou.rangeWays(life)` (testing).
- `today().neighbours[i].stock`: the level on that tie today; a hand arriving today is worth `B × stock`.
- `playDay().results[i].stock` (the level the day was played on) and `.stockAfter`. `playDay().kinWith[i].stock` and `.stockAfter` likewise.
- `runFuture().seasons[k].ties`: the 16 levels at the season's end, in `tieList` order.
- `life.stock` (internal; read `today()`).
- Under REPLAY 'habit', `verdict().lastDay` gains:
  - `rule: 'habit'`;
  - `ties: [4 × { id, name, situation, lived, replayed, against }]` (true = sent a hand);
  - `changed`, which lists the reversed ties as `{ id, name, situation, lived, replayed, h, n }` (the habit as h of n; n 0 = never met, so the custom).
  - `verdict().seal` gains `wonOnLastDay`.
  - `kind` stays `'lastDay'`, so `mattered.kind` keeps working. "The kind of replay" is carried in `rule`, and the page can also read `life.params.REPLAY`.
- All of these are absent in the valley. The valley's JSON is byte-identical, so the page must test for presence.

### 3.2 What the page reads differently in a place

1. **Stakes.** Payoffs are `B·level·theirs − C·mine + S·both − H·neither`. With STOCK they change day by day, so the cards cannot hard-code −1/0/2/3.
2. **CHARTER 'breaks'** (Saltmarket).
   - `holds`, `holdsPct`, `held`, `baselinePct`, `level` and every range row count futures in which the town is better off (the ring broke).
   - `lateFlow`, `meanFlow`, `worstStretch` and `seasons[k].flow` stay the flow itself, which is now the bad side. The Afterwards strip must take its good side from `life.params.CHARTER`, and `worstStretch` is no longer "the worst" for the charter.
3. **range.of** is 13 in all four presets as set, but read it.
4. **The need sentence.** `oldWayPurse` is the custom's purse. "The old way" wording must become the place's custom wording.
5. **The last-day line under 'habit'.** Take the verb from each changed tie's `lived`/`replayed`, not "you stayed home". The act can be a send (for example, holding the price on the last day).

### 3.3 Presets as set in `PLACES` (lines 529–582)

| Key | Settings |
|---|---|
| valley | `{}` |
| banks | B 1, C 2, K 1, FOG 0.04, STOCK {start 6, min 1, max 9, delta [−3, 0, 1]}, FLOW_KIND 'stock', HOLD_LINE 1.0, CUSTOM [1,1,0,1,0], need 171 / 0.5 / 31, REPLAY 'habit'; range = the valley's 13 (the custom is among them) |
| watch | B 3, C 2, S 3, H 0, K 2, FOG 0.04, CUSTOM [0,1,0,1,0], need 51 / 0.5 / 63, REPLAY 'habit', RANGE_WAYS = the valley's 13 with [1,1,0,1,0] replaced by the custom (see open issue 1) |
| bridges | B 3, C 1, S −2, H 2, FLOW_KIND 'one', HOLD_LINE 0.5, FOUNDERS near ['taker','taker',['firm','wary','steady']], far = the valley's pool, STORE_START 40, **need −38 / 0.5 / 24** (re-centred, below), REPLAY 'habit', RANGE_WAYS = the seat's 13 |
| saltmarket | B 3, C 1, S 2, H 0, K 2, CUSTOM [1,1,1,1,1], CHARTER 'breaks', FLOW_KIND 'both', HOLD_LINE 0.45, need 122 / 0.5 / 6, REPLAY 'habit'; the custom is already among the valley's 13 (distance 0), so the range is the valley's 13 unchanged |

**Bridges need, re-centred.** With two takers near, the custom earns a median of −38 in the twelve days (min −80, max 11; 3000 seeds 900001–903000) [measured: `t-bridges-need-out.txt`]. At the old pivot 15 / margin 36 take-turns keeps 0.0% of those 3000 Lives [measured: `t-bridges-need3-out.txt`]. At pivot −38, weight 0.5 [measured: `t-bridges-need2-out.txt`, 5000 seeds 900001–905000]:
- margin 24 gives needs 5..52 and take-turns keeps 50.3% (49.7% on the 3000 seeds of `t-bridges-need3-out.txt`);
- margins below 20 give a need ≤ 0 on some of those seeds.

The prover's Narrow Bridge used the same rule, −38 / 0.5 / 24 (prover's PROPOSAL 0b) [theirs]. Smallest need on seeds 1–2000 is 7 [measured: `checks-places-out.txt` line 4]. Tuners who move the margin must keep it ≥ about 20 or watch PG13.

### 3.4 R2 as implemented (REPLAY 'habit', `replayLastDay` 1137–1156)

For each neighbour, the situation s on day 12 comes from `lastDay.before.last`, and w is `before.ways[s]` (the house's own tallies before day 12, by intention). The habit favours sending when `w.n ? 2·w.h >= w.n : CUSTOM[s] === 1`. The act is against habit when `sent[id] !== favoured`, and only those acts are reversed. Day 12 is replayed from the clone with keyed draws, so every neighbour acts exactly as lived; check 6 verifies this on 110 replays. The same futures are then run.

The seal is withheld when an entry exists and any of these holds:
- **bought:** kept as lived, not kept in the replay;
- **cost:** the entry is clear and better for the charter (`delta > 0`, `|delta| >= 2·se`);
- **won:** markClear, and `mark + delta − 2·markSE < 5`.

With REPLAY 'valley' the valley rule is untouched. Check 6 recomputed every clause on 144 Lives (4 places × 6 policies × 6 seeds), with 0 wrong. bought, cost and won were each seen at least 3 times [measured].

## 4. Valley identity and the valley harness

**Identity** [measured: `identity-places.js` → `identity-places-out.txt`, 240.8 s, run alongside the harness]. The shipped `engine.js` is loaded from the game folder and compared with `engine-places.js`. The ways played are always, never, forgiving, careful+last1, and coin. The JSON compared covers:
- `today()` before and after every day, `playDay()`, `ways()`, `legacy()`;
- the whole life state (less `params`, and `place`);
- `verdict()`, `runFuture()` (three futures, old, what-if), and `project()` (custom, lastDay, old from 300).

| Group | Lives | What it covers |
|---|---|---|
| 1–3 | 337 | The engine-map set: 60 seeds × 5 ways at 300 futures, 3 × 5 at the default 2000/1000, 22 with string seeds or valley tunables moved (178.5 s). |
| 4 spelled | 60 | Every new parameter at its default as an override: B 3, C 1, S 0, H 0, CUSTOM [1,1,0,1,0], STORE_START 0, STOCK null, FLOW_KIND 'hands', CHARTER 'holds', REPLAY 'valley', RANGE_WAYS null, FOUNDERS null. |
| 5 explicit | 30 | FOUNDERS `{near: ['taker','soft',['firm','wary','steady']], far: FAR_POOL}` and RANGE_WAYS = the 13 written out. |
| 6 key | 30 | `createLife(seed, 'valley')`. |
| 7 key + override | 15 | `createLife(seed, 'valley', {FOG: 0.08})` against shipped `createLife(seed, {FOG: 0.08})`. |
| **Total** | **472** | 19,856 comparisons, 61.5 MB of JSON, **0 differ**; `life.place` only for a key and no `stock` field in the valley: true. **PASS.** |

**Harness** [measured: `harness-places.js` → `harness-places-out.txt`; compared with `<scratch>/harness-mine.txt`]. The copy differs from `harness.js` (md5 `cae4bd3f…`) in its `load` line only. Output:
- 213 lines against 213;
- 0 lines differ once the two timing values are masked;
- the 12 gate lines (G1–G10, X1, X2) are identical character for character;
- the standard error of the mark is 1.0..1.3 in both.

Timing lines, from a run alongside the identity run:

| | Mean verdict | Slowest | Harness |
|---|---|---|---|
| This run | 1.045 s | 1.097 s | 140.7 s |
| Shipped run (`harness-mine.txt`) | 1.012 s | 1.066 s | 136.3 s |

The clean comparison is in section 7.

## 5. Determinism with the dials on

[measured: `determinism-places.js` → `determinism-places-out.txt`]

**Check 7 form**, per preset:
- 2 reruns of careful+grab: identical JSON (life, days, verdict at 60, runFuture 1);
- forgiving and the honest placeholder, each with 16 single flips (days 3 and 12 × 4 neighbours × 2 seeds);
- result: 0 shared draws differ, 0 keys drawn twice with two values, need and custom's purse unchanged.

Shared draws per preset:

| Preset | forgiving | honest |
|---|---|---|
| valley | 743,697 | 816,869 |
| banks | 821,783 | 921,609 |
| watch | 811,448 | 819,783 |
| bridges | 677,012 | 764,515 |
| saltmarket | 907,859 | 906,935 |

**The harness's own G5 form** with each preset's parameters (2 seeds, flips on days 3, 7, 12; 24 flips each) passes all parts for all five. That covers:
- identical reruns;
- 0 ford and 0 other shared draws differ;
- need, kin and reconsiderers unchanged;
- arrivals unchanged;
- other ties on the flipped day unchanged;
- the ford agrees.

## 6. What each dial does

[measured: `checks-places.js` → `checks-places-out.txt`, 11.3 s]

| Check | Result |
|---|---|
| Stakes and stock in the Life | 2880 payoffs recomputed (5 places × 12 Lives), 0 wrong. Store = STORE_START + payoffs in every Life. 576 player-tie and 192 kin-tie level steps, 0 wrong. `today().stock` = the level the day is played on. |
| Stakes, flow, stock in the futures | 900 seasons (5 places × 2 seeds × 3 futures) rebuilt from the FORD draws alone (a hand arrived exactly where a FORD draw was taken and was ≥ FOG). Flow by each kind, house incomes and tie levels: 0 wrong. `holds`/`lateFlow` agree. No `ties` without STOCK. |
| The custom is the reference | 50 Lives by the custom: store = reference, need never met, mark exactly 0, no last-day entry. |
| STORE_START | 2000 Bridges Lives at 40 against 0: kept differs in 0, need +40 and store +40 in every Life. |
| CHARTER 'breaks' | 8 Saltmarket Lives against the same read 'holds': verdicts and levels mirrored (section 2). |
| REPLAY 'habit' | Section 3.4. |
| FOUNDERS | 300 Bridges valleys: two takers and one of firm 102 / wary 95 / steady 103 near; no taker far. |
| Range | `range.of` 13 in all five; the custom's row equals a direct count. |
| Bad parameters | 10 of 10 bad settings throw; an unknown key throws. |

## 7. Speed

[measured: `speed-places.js` → `speed-places-out.txt`, run alone]

- **Valley.** careful+last1 on seeds 1–5, twice, alternating engines, full verdict at the shipped counts:
  - shipped 0.870 s mean (0.923 s slowest);
  - places engine 0.840 s mean (0.891 s slowest).
  - That is −3.5%, which is noise, not a speed-up [argued]. The 10 verdicts were identical.
- **Presets.** Full verdict with the honest placeholder, seeds 190001–190005, all within PG14's 1.5 s:

| Preset | Mean | Slowest |
|---|---|---|
| valley | 0.745 s | 0.817 s |
| banks | 0.845 s | 0.918 s |
| watch | 0.884 s | 0.965 s |
| bridges | 0.856 s | 0.921 s |
| saltmarket | 0.844 s | 0.941 s |

- **Caution** [measured: `t-trace-speed-out.txt`]. After `AfterYou.trace` has been set (determinism checks), the futures loop runs about 20% slower for the rest of the process: full verdict 0.84–0.85 s before, 1.01 s after. `gates()` therefore times PG14 first and runs PG5 last.

## 8. placelab.js: how to use it

```
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc
load('<e1>/engine-places.js'); load('<e1>/placelab.js');      // sets PlaceLab
PlaceLab.gates('banks', { honest: myHonest, selfish: mySelfish });               // full counts
PlaceLab.gates(PlaceLab.place('banks', { MARGIN: 28 }), { scale: 'smoke' });   // a moved preset, small counts
```

### 8.1 Places and policies

- A place is a key, or `PlaceLab.place(key, overrides)` (a preset with parameters moved on top).
- A policy is any of:
  - five chances `[p0..p4]` (keyed coin, purpose 20 as in lab.js);
  - a battery name;
  - a function `policy(view) -> choices` (`[4 × bool]` in order [1,2,6,7], or `{id: bool}`), where `view` = `today(life)` + `{ ways: ways(life), seed, params, place, memo }`, and `memo` is kept for the whole Life;
  - `{ name, policy }`;
  - `{ name, maker }` for lab.js/harness-style `maker(ctx) -> decide(nb, view)`;
  - `{ name, way }`.
- Policies see only what the page shows (no founder kinds).
- **honest hook:** `opts.honest` = any policy form.
- **selfish hook:** `opts.selfish` = `act(nb, view, honestChoice) -> true | false | null` (null keeps the honest choice), or `{ name, act }`.
- `'honest+selfish1'`, `'+selfish2'` and `'+selfish3'` apply the act on the last 1/2/3 days. The suffixes `+grab1..3` (stay home), `+give1..3` (send) and `+grab-if-decides` (lab.js's, with place stakes) work on any named policy.

### 8.2 Functions

| Call | Returns |
|---|---|
| `playLife(place, policy, seed, script?, opts?)` | `{ life, choices, days, name, mirrors }` (`mirrors` = the harness's G8 flags) |
| `measureKept(place, policy, seeds, opts?)` | store side only: `keptPct`, `purse`, `need`, `needMin`/`needMax`, `whole` (all stores, payoffs, levels whole) |
| `measureFull(place, policy, seeds, futures \| {futures, whatIfFutures}, opts?)` | engine verdicts (default 2000/1000): `keptPct`, `mark` ± sem, `sealPct`, and the clause shares `markClearPct`, `lastDayPct`, `boughtPct`, `costPct`, `wonPct`, `sealOverKept`, plus per-seed `rows` |
| `grid243(place, seeds, futures)` | the 243 ways carried by heir and kin (harness G4 form, charter-facing, ties broken by late flow toward the charter). Per seed: best and whether trivial; means of holdsPct and carried mark |
| `sealGrid(place, seeds, counts)` | the 243 ways lived as fixed ways and judged by the verdict, ranked by seal, then kept, then mark |
| `gates(place, opts)` | PG1–PG14, printed table + battery table; returns everything |
| `battery(place)` | the battery names for a place |
| `determinism(place, policy, seeds)` | check 7 form |
| `habitMatters(life, futures)` | the harness's G6 statistic |
| `pullBySituation(place, policy, seeds, futures)` | PG12c pulls (8.4) |
| `tuneNeed(place, policy, seeds, target%, {also, pivot, weight, from, to})` | lab.js's need search with STORE_START handled, `needMin` reported |
| `timing(place)` | seconds per 1000 futures, per 1000 Lives, per full verdict |

Also exported: `makers` (five, bully, forgiving, careful, oneStrike, mender, takeTurns, pushPolite, milker, lastDays, grabIfDecides, bestReply, policyAsMaker), `acts.storeBest` and `acts.expected`, `HONEST`/`SELFISH`/`SCHEMES` (editable defaults), `SEED_BANDS`, `SCALES`.

### 8.3 The battery

Policies, in this order:
- `always`, `never`, `bully` (lab.js);
- `milker` (the harness's milker with place stakes: best reply in grain uses B·level, C, S, H; day 12 against the rest is the store's best reply), `milker-kin` (kin only), `milker-early` (from day 5);
- `one-strike` (the grudge: the seat's hardRing);
- `cold`, `careful`, `forgiving` (the harness's);
- `careful+grab` (the valley's day-12 grab), `careful+grab-if-decides`;
- `honest`, `honest+selfish1`, `+selfish2`, `+selfish3`;
- the place's schemes:

| Place | Schemes |
|---|---|
| banks | careful (honest there is mender), [1,1,0.5,1,1] |
| watch | wait-for-them [0,1,1,1,0], mirror [1,1,0,1,0], careful+give |
| bridges | push-the-polite, [1,0,0,1,1], take-turns+drive-on-day-12 |
| saltmarket | [1,1,0,0,0], careful+cut-day-12, mirror [1,1,0,1,0] |

**Placeholders the tuners must replace:**
- **honest:** valley careful, banks mender, watch careful, bridges take-turns, saltmarket careful.
- **selfish act ('store-best'):** send when, with the neighbour's hand expected as the harness's grabIfDecides expects it, today's gain from sending is higher. That is S − C if their hand comes and H − C if not. A level does not enter (it pays whatever this house does). In the valley it is "stay home", the valley's grab.

### 8.4 The gates as implemented

Seeds come from fixed bands above 100000 (`SEED_BANDS`: lives 100001, seal 110001, grid 120001, spread 130001, g6 140001, mirror 150001, pull 160001, sealGrid 170001, det 180001, speed 190001). **Tune below 100000.**

`scale: 'full'` (the default) means:
- kept over 2000 Lives;
- seal, mark and clauses over 40 seeds at 2000/1000;
- grid 12 seeds × 200 futures;
- PG3/PG7 over 120 seeds × 200;
- PG6 over 120 seeds at 1000;
- PG8/PG9 over 120 Lives;
- PG12c over 40 seeds × 200;
- PG12a seal grid 12 seeds at 200/200;
- PG5 2 seeds; PG14 3 Lives.

`scale: 'smoke'` is roughly 1/10 of that. `counts: {...}` overrides any entry; `seeds: {...}` replaces a band; `only: ['PG1', ...]` runs a subset.

| Gate | As implemented |
|---|---|
| PG1 | honest kept% over the lives band, in 35..65 |
| PG2 | seal% of honest+selfish1/2/3 ≤ honest (1 day) and ≤ honest + 3 (2, 3 days), seal band at 2000/1000 |
| PG3 | `AfterYou.rangeWays(life)` carried (`project(history 'old', custom c)`), max − min ≥ 25 in ≥ 80% of seeds |
| PG4 | grid243 best neither all-ones nor all-zeros in ≥ 80% of ≥ 12 seeds |
| PG5 | check 7 form with the honest policy, run last |
| PG6 | the harness's habitMatters on honest Lives, fresh move ≥ 5 in ≥ 60% |
| PG7 | baseline (`history 'old'`) in 15..85 in ≥ 60% |
| PG8 | the harness's mirror flag for three policies (the custom in place of the harness's "plain", forgiving, honest in place of "reader"), all three in ≥ 85% of seeds |
| PG9 | honest: median situations with n ≥ 2 by day 12 ≥ 4 (forgiving printed beside) |
| PG10 | every battery policy's seal ≤ max(1.5 × honest, honest + 10), and seal/kept ≤ 0.8 (both on the seal band's Lives) |
| PG11 | a battery policy with kept (lives band) ≥ honest − 3 and mean mark (seal band) ≤ honest − 10; honest seal 10..40 |
| PG12 | (a) the valley's best fixed way by seal (`valley-best.js`: 243 ways × 24 seeds at 2000/1000) ranks below 10 on the place's sealGrid; (b) Spearman of the 243 carried marks (place against valley, same seeds) < 0.8; the Watch may miss (b) only with (a) and (c), and the gap is printed; (c) by situation on days 1–3 (one act turned, the policy playing on), the store pull or the mark pull of the honest policy has the opposite sign to the valley's careful, both clear (\|mean\| ≥ 2 sem, n ≥ 5) |
| PG13 | over every battery policy's Lives: need > 0 and ≤ 300; stores, payoffs, needs and levels whole (and `seasons[k].ties` whole in 3 futures × 5 Lives with STOCK) |
| PG14 | full default verdict of honest Lives ≤ 1.5 s (timed before anything traces) |

### 8.5 Cost of a run

[measured: `gates-smoke-out.txt`, `gates-full-*-out.txt`; the per-gate seconds are printed on every gate line]

- Smoke: 15–25 s per place, 97 s for all five.
- Full: 248–290 s per place, five run in parallel on 12 cores. The battery (16–19 policies × 40 seeds × 2000/1000 verdicts, plus 2000 Lives each) takes 95–124 s, PG12 70–84 s and PG6 43–48 s.

Rates from the lab's own timing [measured: `placelab-example-out.txt`, `t-trace-speed-out.txt`]: 0.04–0.08 s per 1000 futures of one row (depending on the JIT's state) and 0.13–0.2 s per 1000 Lives without futures. measureFull costs about 5000 futures per seed at the shipped counts (two rows of 2000 and the 1000-future replay); grid243 costs 244 × seeds × futures.

### 8.6 Real output

[measured: `placelab-example.js` → `placelab-example-out.txt`]

```
--- 1. the store side only (no futures): thousands of Lives are cheap
[placelab] measureKept watch / honest: kept 51.8% of 2000 Lives, purse 115.2, need 115.4 (91..141)  (0.3 s)
[placelab] measureKept watch / careful+grab: kept 44.5% of 2000 Lives, purse 113.0, need 115.4 (91..141)  (0.2 s)
--- 2. kept, mark and the seal with its clauses (here 10 seeds at 500/300 futures; gates use 40 at 2000/1000)
[placelab] measureFull watch / honest: 10 seeds at 500/300: kept 50.0%, mark +14.9 +-2.7, seal 30.0% (clear 70.0, last-day entry 10.0, bought 0.0, cost 0.0, won 0.0)  (0.4 s)
--- 3. a policy written as policy(view) -> choices, with its own memory in view.memo
banks seed 7: store 222 of 199; levels on the four ties at the end [6,9,9,9]; day 3 results: [{"id":1,"sent":true,"they":true,"payoff":6,"stock":8,"stockAfter":9},{"id":2,"sent":true,"they":true,"payoff":5,"stock":7,"stockAfter":8},{"id":6,"sent":true,"they":true,"payoff":5,"stock":7,"stockAfter":8},{"id":7,"sent":false,"they":false,"payoff":0,"stock":6,"stockAfter":3}]
[placelab] measureKept banks / patient fisher: kept 23.4% of 2000 Lives, purse 187.5, need 201.9 (138..247)  (0.2 s)
--- 4. a place with parameters moved on top of the preset, and the need re-centred for it
[placelab] tuneNeed bridges {"H":3}: custom earns median -60.0 -> NEED_PIVOT -60, NEED_WEIGHT 0.5, MARGIN 35; need -12..59; honest 50.0%, always 53.4%, careful 0.3%  (0.7 s)
[placelab] measureKept bridges {"H":3,"NEED_PIVOT":-60,"NEED_WEIGHT":0.5,"MARGIN":35} / honest: kept 48.9% of 2000 Lives, purse 15.0, need 15.2 (-11..42)  (0.2 s)
--- 5. the 243 ways carried (G4 form) and a few gates at chosen counts
[placelab] grid243 saltmarket: 3 seeds x 243 carried ways x 60 futures; best is neither all ones nor all zeros in 100.0%; best on average [0,0,0,0,0.5] 81.7%  (1.8 s)

==== gates: saltmarket   scale full   honest careful   selfish store-best
counts: {"lives":1000,"seal":40,"sealFutures":2000,"sealWhatIf":1000,"grid":12,"gridFutures":200,"spread":20,"spreadFutures":200,"g6":120,"g6Futures":1000,"mirror":40,"pull":40,"pullFutures":200,"sealGrid":12,"sealGridFutures":200,"det":2,"speed":3}
PASS  PG1  Honest play keeps the house     honest (careful) kept 42.5% of 1000 Lives   [needs 35..65]  (0.1 s)
PASS  PG3  Spread of the reference ways    the 13 ways (custom among them: true) carried are >= 25 points apart in 100.0% of 20 seeds (median 40.8)   [needs >= 80%]  (2.1 s)
PASS  PG7  Not a lottery                   custom's baseline inside 15..85 in 100.0% of seeds (median 49.3, 26.5..67.5)   [needs >= 60%]  (0.0 s)
PASS  PG9  The situations come up          honest: median situations with n >= 2 by day 12 = 5 (min 3); forgiving 5   [needs median >= 4]  (0.0 s)
ALL GATES PASS (4 of 14 gates run)  for saltmarket  (4.3 s)
--- 6. what a full gates() run costs, per place, on this machine
[placelab] timing banks: 1000 futures of one row 0.080 s; 1000 Lives 0.14 s; one full verdict 0.88 s
```

## 9. Smoke and full-count gate runs (placeholder honest policies)

These numbers measure the presets as set, with placelab's placeholder honest policies and selfish acts. They are where the tuners start, not verdicts on the places.

### 9.1 Full counts

[measured: `gates-full-<place>-out.txt`; the five ran in parallel, 248–290 s each]

Counts:
- kept over 2000 Lives (seeds 100001–102000);
- seal, mark and clauses over 40 seeds (110001–110040) at 2000/1000;
- the rest as in 8.4.

The places use placelab's placeholder honest policies: careful / mender / careful / take-turns / careful.

| Gate | valley | banks | watch | bridges | saltmarket |
|---|---|---|---|---|---|
| PG1 honest kept (35..65) | 38.3 ✓ | 44.8 ✓ | 54.2 ✓ | 51.5 ✓ | 43.3 ✓ |
| PG2 seal: honest / selfish 1, 2, 3 days | 17.5 / 0 / 2.5 / 0 ✓ | 22.5 / 0 / 0 / 0 ✓ | 42.5 / 40.0 / 37.5 / 32.5 ✓ | 32.5 / 2.5 / 5.0 / 10.0 ✓ | 27.5 / 27.5 / 25.0 / 25.0 ✓ |
| PG3 range ways ≥ 25 apart | 97.5 ✓ | 97.5 ✓ | 99.2 ✓ | 99.2 ✓ | 98.3 ✓ |
| PG4 best carried not flat | 100 ✓ | 100 ✓ | 91.7 ✓ | 100 ✓ | 100 ✓ |
| PG5 determinism | ✓ | ✓ | ✓ | ✓ | ✓ |
| PG6 a habit matters | 80.0 ✓ | 90.0 ✓ | 76.7 ✓ | 96.7 ✓ | 85.0 ✓ |
| PG7 baseline in 15..85 | 96.7 ✓ | 90.0 ✓ | 98.3 ✓ | 73.3 ✓ | 100 ✓ |
| PG8 mirror | 100 ✓ | 100 ✓ | 100 ✓ | 100 ✓ | 100 ✓ |
| PG9 situations (median) | 5 ✓ | 4 ✓ | 5 ✓ | 5 ✓ | 5 ✓ |
| PG10 no recipe | ✗ cold 35.0 > cap 27.5; s/k cold 0.88, forgiving 0.89 | ✗ s/k always 0.89, cold 1.00 | ✗ s/k 0.83–0.94 for 11 of 19 policies, honest 0.89 | ✓ | ✗ s/k one-strike 0.89, [1,1,0,0,0] 0.88, mirror 0.88 |
| PG11 a trade; honest seal 10..40 | ✓ milkers, selfish2/3; 17.5 | ✓ honest+selfish2 49.3% / −12.5; 22.5 | ✗ no trade; 42.5 | ✓ honest+selfish3 65.7% / −0.9; 32.5 | ✗ no trade (honest mark +5.9); 27.5 |
| PG12 (a) valley best's rank by seal | #3 ✗ | #11 ✓ | #1 ✗ | #130 ✓ | #12 ✓ |
| PG12 (b) Spearman | 1.00 ✗ | 0.92 ✗ | 0.88 ✗ | 0.11 ✓ | −0.96 ✓ |
| PG12 (c) opposite clear pull | none ✗ | none ✗ | none ✗ (2 near misses) | NEW mark, BOTH store, SHORTED mark ✓ | NEW, BOTH, SHORTED, OWING mark ✓ |
| PG13 need range, whole | 48..87 ✓ | 145..241 ✓ | 92..143 ✓ | 7..55 ✓ | 86..176 ✓ |
| PG14 verdict s (≤ 1.5) | ≤ 0.87 ✓ | ≤ 0.95 ✓ | ≤ 1.00 ✓ | ≤ 0.88 ✓ | ≤ 1.01 ✓ |
| **All 14** | 11/14 (PG12 is meaningless for the valley) | 12/14 | 10/14 | **14/14** | 12/14 |

Facts in these runs the tuners will want [all measured, same files]:

- **Valley.** PG10 as written fails the valley itself with careful as honest: cold earns the seal in 35.0% against careful's 17.5%. The shipped harness's X2 (20 seeds) also had cold-opener 40% against careful 25%.
- **Banks.** The valley's best fixed way [1,1,0.5,1,0] is #11 by seal (barely outside the top 10). The pulls by day 3 differ from the valley's in size, not in sign: sending in BOTH is +12.8 to the store against +3.3, and in NEW +6.9 against +0.4 (valley from 200 seeds). Hence (b) 0.92 and (c) none.
- **Watch.**
  - The valley's best fixed way is #1 by seal here.
  - The last-day act barely moves the seal (42.5 → 40.0 / 37.5 / 32.5).
  - careful+grab keeps less than careful (45.8% against 54.2%): there is nothing to take.
  - With S > C a kept house nearly always has a clear mark, so seal/kept is 0.83–0.94.
  - (c) has two near misses that the valley cannot confirm: SHORTED store +2.8 against the valley's −0.2 ± 0.2, and NEITHER mark +4.2 against −0.1 ± 0.4.
- **Bridges.**
  - The honest take-turns passes all 14.
  - The valley's careful and cold keep 0.1% and 0.0%.
  - [1,0,0,1,1] keeps 52.4% with mark +8.5 and seal 22.5%.
  - The day-12 drive-on is caught by R2 (cost 87.5% of its Lives, seal 2.5%).
- **Saltmarket.**
  - careful's mark is only +5.9.
  - The honest sacrifice careful+cut-day-12 earns the seal in 25.0%, and R2's **won** clause fires in 32.5% of those Lives (section 10, issue 8).
  - never has a mark of +39.0 (the town's best), but it keeps 0%.

### 9.2 Smoke counts

[measured: `gates-smoke-out.txt`, 94.7 s for all five]

Counts: lives 300; seal 10 seeds at 300/200; grid 3 × 60; spread 12 × 100; G6 6 × 300; mirror 30; pull 6 × 100; seal grid 3 × 100/100. PG4 fails everywhere at these counts because it needs ≥ 12 seeds. The other results point the same way as 9.1, with wider noise.

## 10. Open issues

1. **Watch range tie.** The design lead's rule ("the custom in place of the nearest of the thirteen") has a tie: [1,1,0,1,0] and [0,1,1,1,0] are both one step from [0,1,0,1,0]. The first in list order was replaced, so [0,1,1,1,0] stays. This is a one-line change in `PLACES.watch.RANGE_WAYS` if the other is preferred.
2. **Saltmarket range.** The custom [1,1,1,1,1] is already among the valley's thirteen (nearest at distance 0), so "added in place of the nearest" leaves the valley's list unchanged.
3. **Bridges need.**
   - Re-centred to −38 / 0.5 / 24 (section 3.3).
   - Needs stay above zero only with MARGIN ≥ about 20 at this pivot (5000 seeds).
   - PG13 will catch a tuner who goes lower.
   - The minimum need seen in the gates' 2000 Lives is 7.
4. **New fields are absent in the valley.** The valley's JSON must stay byte-identical, so they are added only when their dial is on: `life.place` (key only), `life.stock`, `today().neighbours[i].stock`, `results[i].stock/stockAfter`, `kinWith[i].stock/stockAfter`, `seasons[k].ties`, `lastDay.rule/ties` and `seal.wonOnLastDay`. The page must test for presence. A valley entry has no `rule`, and that means 'valley'.
5. **"kind" of the replay.** The brief asked the entry to carry its kind. `kind` already exists and is `'lastDay'` (`mattered.kind` depends on it), so the replay rule is carried in `rule: 'habit'` instead.
6. **Not charter-facing.** Under 'breaks', `lateFlow`, `meanFlow`, `worstStretch` and `seasons[k].flow` stay the flow, which is now the bad side. The page's Afterwards strip and any "worst stretch" wording must read `params.CHARTER`. Only `holds`, `held`, `holdsPct`, `baselinePct`, `level` and the range face the charter.
7. **R2 sees day 12 only.**
   - A 2–3-day selfish run can move day 12's situation and habit so that nothing on day 12 is "against habit". In the Banks, honest+selfish3 has a last-day entry in 10% of Lives, against 100% for selfish1 and selfish2 [measured: `gates-full-banks-out.txt`].
   - In these presets such runs are held down by their own marks (PG2 passes everywhere).
   - A place where a multi-day grab keeps a clear mark would need a longer replay, which is not built.
8. **R2's "won" catches honest late acts too.** In the Saltmarket, careful+cut-day-12 (cutting the price on the last day, against its holding habit) has `wonOnLastDay` in 32.5% of Lives. That is R2 as decided (no last-day act against habit can make the seal), but the Chronicle must word a withheld seal for a town-serving act.
9. **PG10's ratio part.**
   - seal/kept ≤ 0.8 fails in four of five presets, the valley included (9.1).
   - It is computed on the 40 seal seeds, so the denominators are small: Banks cold is 2 kept of 40, both sealed.
   - In the Watch it reflects S > C: a kept house almost always has a clear mark.
   - The cap part fails only in the valley (cold).
   - A floor on kept, or more seeds for the ratio, is a design call; the lab takes `counts.seal`.
10. **PG12c reading.**
    - Pulls are counted by situation, one act turned on days 1–3 with the policy playing on.
    - Both the place's and the valley's pull must be clear (|mean| ≥ 2 sem, n ≥ 5) with opposite signs.
    - The valley's reference is careful on 200 seeds (`valley-pulls-data.js`).
    - Near misses (place clear, valley not clear of zero) are printed but not counted.
    - A looser reading would pass the Watch on SHORTED store and NEITHER mark.
11. **PG12a's "best".**
    - The valley's best fixed way by seal is not sharply identified. On 24 seeds at 2000/1000, [1,1,0.5,1,0] and [0.5,1,0.5,1,0] tie at 25.0% (kept breaks the tie), and two more ways are at 20.8%.
    - The breaker's grid (16 seeds × 100 futures) had [0,1,1,1,0].
    - All four ranks are printed.
    - The places' seal grids (12 seeds × 200/200) have many ties, ranked by seal, then kept, then mark.
    - `opts.valleyBest` overrides.
12. **PG8 and PG9 readings.**
    - PG8's "three parts" are taken as the harness's three policies, with the custom for "plain" and the place's honest policy for "reader" (which reads founder kinds, so it is not usable).
    - PG9 gates on the honest policy (forgiving is printed beside). The harness used forgiving.
13. **Placeholders.**
    - honest = careful, mender, careful, take-turns, careful.
    - The selfish act is the myopic store-best reply, which ignores the level on days 10–11.
    - The milker's best reply treats a tie's level as fixed.
    - The tuners must supply their own honest policy and selfish act per place.
14. **Timing after tracing.** After `AfterYou.trace` is set, the futures loop is about 20% slower for the rest of the process: verdict 0.84–0.85 s before, 1.01 s after [measured: `t-trace-speed-out.txt`]. `gates()` runs PG14 first and PG5 last. The full runs' PG14 times were taken with five gate processes running in parallel.
15. **FOUNDERS scope.** Only the five built-in kinds, with no custom bands. The Afterwards newcomer is always the valley's taker. A list entry draws with `P_THIRD` keyed by its place among list entries, so the valley spelled out is identical.
16. **Validation is strict.** `checkPlace` throws on fractional stakes, store or levels and on middling customs (R3). A tuner who wants to try fractional values must change the engine, not the preset.
17. **`AfterYou.PLACES` is exported mutable,** like `params`. The page must not write to it, since each Life copies what it uses.
18. **'stock' flow.** It is the daily mean of each day's level after its change, divided by `STOCK.start`; the engineer's unified form. Banks `HOLD_LINE 1.0` means "the late mean level at least the starting level".
19. **Seeds.** The gates draw from 100001 up and the valley references from 165001 and 170001. **Tune below 100000.**
