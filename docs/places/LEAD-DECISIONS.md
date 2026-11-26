> **Record of its time, and binding for v0.2.0.** Written 2026-11-25 17:39, last changed 2026-11-26 02:33 (local time, UTC+10), copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../checks/). Where a report in these notes disagrees with this file, this file wins.

# Places: the design lead's decisions after the settle round (2026-11-25)

Folder: `<scratch>/places/final/`. Everything below is binding on the page build and on the
confirmation round. Where a report disagrees with this file, this file wins.

## 1. The engine

- **`final/engine.js` is the one engine.** It is `e1/engine-places.js` plus the Banks fixer's
  `poacher` founder kind (`fix-banks/engine-banks.diff`) plus the Saltmarket fixer's
  `REPLAY 'season'`, `REPLAY_FROM` and the optional place key `SEAL_MARK`
  (`fix-saltmarket/engine-saltmarket-fix.diff`), with `PLACES` set to the four fixers'
  `preset.json` files exactly (`final/presets-check.js` proves it). The valley's identity with the
  shipped engine and each place's identity with its fixer's engine are proved by
  `final/identity-final.js`, `final/harness-final.js` and `final/repro-places.js`
  (outputs `*-out.txt` beside them).
- The page always calls `createLife(seed, placeKey)`, `'valley'` included.
- Every new field is absent in the valley; the page tests for presence.
- `REPLAY 'season'` is read as `'habit'` wherever the page tests `params.REPLAY`
  (`lastDay.rule` is still `'habit'`). The season entry (`verdict().season`) and
  `seal.wonOnSeason` are **not shown**: a withheld seal passes silently, as in the valley.

## 2. Settled design calls

1. **Seal integrity.** R2 stays the rule for every new place. Whether the Banks, the Watch and
   the Bridges also take `REPLAY 'season'` is decided by the confirmation round on measurements
   (adopt it in a place only if every gate still passes there and it closes a late-act hole that
   is real there). It is a data change only; the page treats both alike.
2. **The Saltmarket's seal bar is 20** (`SEAL_MARK 20`). The seal there reads
   **"Stall kept, town clearly better off."** The page never prints the number 20 or explains
   the bar. In the other places the seal is "\<seat> kept, \<place> better off" in the place's
   words.
3. **The Banks' poacher** is accepted. It is never named or described as a kind. `poacher` joins
   `firm`, `soft`, `taker`, `wary`, `steady` as a forbidden whole word on screen, in every place.
4. **The Watch's PG12(b)** (Spearman 0.92) is accepted under the Watch's exemption ((a) and (c)
   pass).
5. **The Bridges' R_AFTER 4** is accepted: the Afterwards may show four looking-round entries a
   season.
6. **How the gates are read from now on.** PG10's ratio part and PG11's seal floor and ceiling are
   read on at least 200 pooled fresh seeds. The ratio is judged only for policies with at least
   20 kept Lives in that pool (others are reported with their counts). 40-seed bands are noise
   and are not a failure. PG14 is timed on a quiet machine (or by CPU time per verdict).

## 3. The page: binding principles

1. **The valley does not move.** Before any new place is added, the refactored page must
   reproduce the published valley exactly. The proof is the page-map's fingerprints, re-measured
   on the published files first: `golden-words.js` (`20bddf72`, 362,279 sentences) and
   `golden-page.js` (`page 72a7c55d, maps 7a78d3e9`). `page-smoke.js`, `harness.js` and the DOM
   harness (`<scratch>/dom-run.js`) still pass.
2. **Plain words, as before.** No theory words on screen in any place (cooperate, defect,
   prisoner, dilemma, strategy, payoff, tit for tat, game theory, player, and the six founder
   kinds). The page never says whether a missing act was luck or a choice. Each place's luck is
   its own and is said its own way, but always as the valley does: the actor knows when its own
   act miscarried; the other side only sees the result.
   - Banks: the tide carried your nets into their water.
   - Watch: your watchman lit a fire at a shadow.
   - Bridges: your mule would not stand, and your cart came on.
   - Saltmarket: your boy sold below the price; they saw only a cut price.
3. **Every number on screen comes from the Life.** The Opening's stakes, the card numbers, the
   need sentence, the strip's line and anything else that states a rule are computed from
   `life.params` (and `today()` / `results`), never typed in. A preset can still change in the
   confirmation round, and the page must stay true without edits.
4. **Architecture** as in `page-map/PAGE-MAP.md` §5: place data (lexicon, sheet decoration,
   charter words, afterword) in per-place files; the sheet geometry in a file jsc can load; the
   word functions keep their logic and read the lexicon in force; a missing lexicon key throws in
   the check and never falls back to the valley's word.
5. **Chooser.** A radio group of the five places on the Opening, valley first, then the Banks,
   the Watch, the Bridges, the Saltmarket (the play order). Nothing is locked. Choosing one puts
   its words in force and redraws the Opening (its premise, four lines and sheet are the
   preview). It must fit the measured room (PAGE-MAP §4.1); show two earlier lives, not three, if
   that is what it takes. At the end, "Live another life" stays in the same place, and one quiet
   control returns to the Opening to choose another place.
6. **Hash** `#<place>-<seed>`: the text before the first hyphen is the place if it is a known
   key, else the whole thing is a valley seed as today (`#valley-48213` keeps its meaning).
7. **Stored lives.** Same key. Entries gain `place`; no `place` means the valley; an unknown place
   is skipped. Keep up to 60 entries; the Opening and the Chronicle list only the place in hand.
8. **Per-place features the code must carry:**
   - Banks: the bank level on each card's head (a small gauge with words for a listener), the
     day's result "fills to / falls to / stays full / is spent", the crossing on the sheet drawn
     as a gauge on your four ties, and the sixteen tie levels in the Afterwards. Strip:
     `FLOW_KIND 'stock'` against `HOLD_LINE`.
   - Watch and Bridges: shared stakes (S and H). Every reveal sentence accounts for its number.
     A store that goes below zero draws and reads correctly; the need is always above zero.
     The Bridges' yard starts at `STORE_START`.
   - Saltmarket: the inverted charter (every Chronicle count is "the ring broke"; the strip's good
     side is below the line; `worstStretch` worded as the town's best stretch), and the town's
     extra cost on the day total.
   - All four: the last-day line takes its verbs from each changed tie's `lived` / `replayed`
     (either direction); the custom's own sentence and name; five situation titles from the
     lexicon (the engine's titles are not printed); the Afterwards line from `HOLD_LINE` and the
     flow kind; an afterword in the Chronicle (one short paragraph, plain, a real-world parallel).
9. **Words.** Start from each place's "Words" and "What the page must show" sections in
   `tune-<place>/TUNE.md` and `fix-<place>/FIX.md` (the fix wins where they differ; the Watch's
   custom is now [0,1,1,1,0]: never goes first, answers, lets a single fire pass, waits when both
   keep watch). Every sentence must be true for the Life on screen.
10. **Room.** Each place is checked in a real browser at 1280x800, 1366x700, 1440x960 and 400x800,
    light and dark, through a whole Life to the Chronicle, with no console errors and no new
    scrollbar on the laptop day.

## 4. The confirmation round (2026-11-25): results and facts for the page

Fresh attackers re-ran PG1-PG14 and new schemes on `final/engine.js` with seeds no earlier round
used (`confirm-<place>/CONFIRM.md`). **All four places hold; nothing was fixed.**

**Facts the page must hold** (measured on 99,999 fresh seeds per place, Lives only). Every store
and need is a whole number; the page draws from the Life's own numbers and assumes no fixed range:

| Place | Need | Store during the Life (any policy) | Notes |
|---|---|---|---|
| Banks | 156..301 | -8..318 | the need is above 300 on one seed (2050732: 301); never assume need <= 300 |
| Watch | 58..198 | -135..274 | a "never" house ends below zero in 91% of Lives |
| Bridges | 6..68 | -46..87 (argued bound -46..194) | starts at STORE_START; an honest yard can end below zero |
| Saltmarket | 78..176 | -4..181 | the store can dip below zero |

**Decisions taken on the round's findings** (they are applied after the page build; until then the
engine is unchanged):
1. **The Watch takes `REPLAY 'season'`** (all gates pass under it, and it closes a real late-act
   lift of +5 to +11 seal points that R2 cannot see). The Banks and the Bridges keep `'habit'`:
   in the Banks the hole is small (+2) and the season replay would withhold late peace offers,
   the very lesson of the place; in the Bridges it closes nothing and withholds 21% of honest seals.
2. **A seal withheld by the season replay gets one plain line in the Chronicle** (places with
   `REPLAY 'season'` only, shown only when `seal.wonOnSeason`): the town's gain rests on what the
   house did in the last season beyond the habits it had before it, which nobody had yet lived
   with. Words from the place's lexicon; no luck or choice said. This replaces the "not shown" part
   of section 1 for `seal.wonOnSeason` only; the season entry's numbers stay unshown. The valley
   and the last-day clauses are unchanged (the last-day line already accounts for them).
3. **How PG10's ratio part is read (adds to 2.6):** a policy is over the line only when its pooled
   seal/kept is above 0.8 by more than two standard errors. The Saltmarket's "stage on day 4, always
   cut after both cut" (0.796-0.801, se 0.013-0.017, sealing 7% against honest's 17%) passes.

## 5. The review round (2026-11-26): the lead's rulings on what was left open

Seven reviewers (`review-*/`), two fix rounds and two verifications (`review-fix1`, `review-fix2`,
`review-verify1`, `review-verify2`). 77 findings; every check passes after them; the valley's
sentence stream, page and maps fingerprints are unchanged.

1. **"Even so" on the back of a Why? card (rules-01, verify1-2): accepted, in all five places.**
   It comes from the original UI specification (UI-SPEC.md, the `you` source: "If why.againstHabit is
   true, end with: Even so, no hand came today.") and is in the published valley. It states only the
   visible result, never luck. The inference it allows (a habit learned N of N from you, and still no
   act) is inherent in showing a neighbour's reasons: without the line, the card's "They do the same"
   and the visible result contradict each other with nothing said, and the inference remains. LEAD
   3.2 is read as written: the page never *says* whether a missing act was luck or a choice.
2. **The valley's day at 1280x800 (fix1 open issue): fixed in every place.** The two laptop spacing
   rules the new places use (a Why? under "Elsewhere today" at its line's height; the luck note across
   the cards' width) now apply to the valley too. This is a CSS change only: the valley's words, markup
   and maps fingerprints do not move, and its published overflow (up to 820 px on a few closed days) goes.
3. **320x640 (browser-06): exempt from "Begin on the first screen".** The chooser takes two rows at
   320 px. At 400x800 and every laptop size Begin is on the first screen.
4. **Accepted as they are:** the Bridges' "50 of 27 loads" (the game's shared store form, true, and
   the meter marks the need); the Opening's 2 px at 1280x800 in the Banks and the Watch with exactly
   three earlier lives and a number line (the Opening is not under the day's hard rule; Begin stays
   on screen); a turned Why? card scrolling the day (a passing state, as published); the Chronicle
   listing the newest 20 lives with no fold.
