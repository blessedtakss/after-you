> **Record of its time.** Written 2026-11-22 17:55 (local time, UTC+10) for v0.1.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../checks/). The game has changed since; the code is the authority on what it does now.

# After You — the page: specification (revision 2)

The model is in `engine.js` (written and verified; do NOT modify it). Its header comment (the first 353 lines) is the authority on the API: read all of it, including the blocks "CHANGED SINCE THE FIRST BUILD" and "FOR THE PAGE". Where this brief and that header disagree about a field or a rule, the header wins; where they disagree about wording, use this brief. The game rules are in SPEC.md next to this file (read its "Revision 3" note first).

## 0. What the page is for

A person plays twelve days of harvest by hand, then watches what the valley does without them. Two results come back that pull against each other: whether their own house has enough for winter, and whether the valley is better or worse off for the ways they left behind. The page's job is to make each daily choice feel like a real choice, to let the reader see their own conduct quoted back at them by the house that copies them, and to report the two results as counted facts with no sermon.

## 1. Files

In your own folder (given in your task):
- `index.html`: markup and one `<style>` block. Page CONTENT only: no `<!DOCTYPE>`, `<html>`, `<head>` or `<body>` tags (the host wraps it). The file starts with `<title>After You</title>` and `<meta name="claude:viewport-fit-sides" content="cover">`, then one optional Google Fonts `<link>`, then `<style>`, then the markup, and ends with `<script src="engine.js"></script><script src="words.js"></script><script src="app.js"></script>`.
- `words.js`: every sentence the page can show, as pure functions. No DOM, no `window` beyond attaching one global: it must load both in a browser and in the jsc shell (`globalThis.AYWords = {...}`; no `require`, no `module`, no `document`). Each function takes engine data (and plain values) and returns a string or an array of strings. `app.js` gets all its copy from here, so that the copy can be tested without a browser.
- `app.js`: all page logic and drawing. Plain JavaScript, no frameworks, no build step, no modules.
- `engine.js`: a copy of the engine (copy it in; never edit it; check its md5 matches the one in your task).
- `page-smoke.js`: a jsc script (see 7).

## 2. Hooks for testing (required, identical in every build)

- The five view containers carry `data-view="opening"`, `"day"`, `"leaving"`, `"afterwards"`, `"chronicle"`; exactly one is not `hidden`.
- Buttons by id: `begin`, `close-day`, `next-day`, `leave`, `skip`, `to-chronicle` (if the Afterwards has a continue button), `again` (new valley), `again-same` (same valley).
- Each neighbour card is `[data-house="<id>"]` and its two choices are `input[type=radio][name="choice-<id>"]` with values `send` and `stay` (visually styled however you like; the inputs must stay keyboard-operable).
- Each Why? control is `button[data-why="<id>"]`.
- `window.AYApp = { state }` exposes the live state object (read-only use).
- A valley can be fixed for testing with the hash `#valley-<number>` (letters, digits and hyphens only): if present at load, "Begin" uses that seed.

## 3. Flow

One page, five views, one visible at a time (toggle with the `hidden` property).

### 3.1 Opening
Complete at rest, no scrolling needed on a laptop. Shows the name, the premise and the stakes, and one button.
- "After You"
- "Twelve days of harvest in a valley of eight houses. Then you leave, and the valley goes on without you."
- "Each day, each of your four neighbours has a crop that will not wait. You can send a hand or stay home. So can they."
- "A hand sent costs you 1 measure of your own grain. A hand that arrives is worth 3 to the house it reaches."
- "What you do, others see. Some will take it up as their own way."
- Button: "Begin". If earlier lives are stored, list them beneath (see 3.5).
A new Life gets a fresh random seed (the page may use `crypto.getRandomValues`; the engine may not).

### 3.2 The day (twelve times)
Visible together on a laptop: the day track, the winter store, the four neighbours, and your ways.
- **Day track:** twelve marks in three groups of four; today is marked; past days are visibly spent. Text: "Day 5 of 12". On day 12 add: "The last day."
- **Winter store:** "31 of 64 measures" with a meter (clamp the drawing at zero if the store is below zero; print the true number). Beneath it, small: "The old way, which is to send a hand to someone new and then do as they did yesterday, would bring in {today().oldWayPurse} this harvest." Show both numbers; never derive the need from the old way in words (it is not "the old way plus six").
- **Four neighbour cards**, in the engine's order. Each shows:
  - the family name ("The Maren house"); kin reads "Your sister's house" with "The Wren house" beneath;
  - what happened yesterday on your tie, in one sentence:
    - no dealings yet: "You have not dealt with them yet."
    - both helped: "Yesterday hands went both ways."
    - you helped, they did not: "Yesterday you sent a hand. None came from them."
    - they helped, you did not: "Yesterday they sent a hand. None came from you."
    - neither: "Yesterday both houses stayed home."
    - if your own hand was lost yesterday (`yesterday.lost`), say so first: "Yesterday your hand was turned back at the ford. They saw only that none came." then whether theirs arrived ("Theirs reached you." / "None came from them.").
  - the two choices with radio semantics: **Send a hand** / **Stay home**;
  - **"What you know of them"**: the five situations from THEIR side with tallies of how they actually behaved, from `today().neighbours[i].seen` ("after being left short: sent a hand 1 of 3"). Rows with n = 0 read "not yet seen". Their side's row names: "meeting someone new", "after hands went both ways", "after being left short", "after leaving the other short", "after both stayed home". Under the rows, small: "Counted from their dealings with you and with others." If `changedDay` is not null, show `seenSince` instead of `seen` and say above the rows: "They changed a way at the end of day {changedDay}. Counted since then." On a phone this section is collapsed behind a toggle.
- **Close the day** is enabled once all four choices are made. Before that it says how many are left ("Choose for 2 more houses").
- **Reveal.** After closing, each card shows the result and the change to your store:
  - "Hands went both ways. +2"
  - "Your hand reached them. None came back. -1"
  - "Their hand reached you. You sent none. +3"
  - "Both houses stayed home. 0"
  - when your hand was lost (`lost`): "Your hand was turned back at the ford. They saw only that none came." followed by the number (+3 or 0) and whether theirs reached you.
  - Above the cards, the day's total: "Today: +4. Winter store: 35 of 64 measures."
  The page must never say whether a neighbour's missing hand was an accident or a choice.
- **Why?** After the reveal each card has a "Why?" button. It turns the card over to show the neighbour's reason, built from `results[i].why`:
  - where they stood, from their side (`why.situation`): "Meeting you for the first time" / "After hands went both ways" / "After you left them short" / "After they left you short" / "After both houses stayed home";
  - where that habit came from (`why.source.type`):
    - `own`: "This is the Maren way. They did not learn it from you." then what you knew, from `why.seen`: "Before today you knew them to send a hand here 3 of 4 times." or, with n = 0, "You had not seen them here before."
    - `you`: "They learned this from you." then the count from `why.source.digest`: "Here you sent a hand 6 of 8 times. They do the same." then up to three dated deeds, each as "Day 3: you stayed home against the Maren house, after they left you short." / "Day 2: you sent a hand to the Pell house, after hands went both ways." Choose the deeds as: `digest.dissent` first (they are the ones that go against your majority), then `digest.latest` if not already listed; if `digest.n` is larger than the number listed, end with "and {k} more". The deed's situation phrase comes from `why.situation` (the same situation the habit is for), in your own terms: "on first meeting", "after hands went both ways", "after they left you short", "after you left them short", "after both houses stayed home". If `why.againstHabit` is true, end with: "Even so, no hand came today."
    - `blank`: "They have never seen what you do here, so they kept their own way."
    - `house`: "They took this up from the Pell house." or, when `why.source.far` is true, "They took this up from a house beyond your neighbours."
  The first time in a Life that a why-record's source is `you`, draw attention to that card's Why? button (a quiet mark or pulse, once).
- **Elsewhere today** (after the reveal, on the kin card or directly beneath the cards): one line per entry of `playDay().kinWith`: "Your sister's house and the Pell house: hands went both ways." / "Your sister's house sent a hand to the Pell house. None came back." / "The Pell house sent a hand to your sister's house. None went back." / "Your sister's house and the Pell house both stayed home." When that entry's `why.source.type` is `you`, add its own Why? control showing the same card content as above, worded for a third party: "Your sister's house learned this from you." and the same deeds.
- **Your ways:** five rows, one per situation, in your words ("Meeting someone new", "After you both helped", "After they left you short", "After you left them short", "After you both stayed home"; these are `ways()[s].title`). Each row shows one mark per precedent in order (filled for a hand sent, open for stayed home, from `ways()[s].deeds`) and the count "sent a hand 3 of 5". An untested row reads "not yet tested" and looks visibly empty. After each day the marks added that day are distinguishable until the next day closes.
- **Next day** advances. On days 4, 8 and 12 a **season's end** panel appears first (from `playDay().lookingRound`): "At each season's end, houses look at who is doing well and may take up their ways." then:
  - kin: "Your sister's house follows your ways in {count of habits with source 'you'} of 5 situations." If `kin.changed`, list each habit whose `after` differs from `before`: "{your title for the situation}: they now send a hand {h} of {n} times, as you did." (if h = 0: "they now stay home, as you did {n} of {n} times.").
  - each `reconsidered` entry with `visible` true:
    - `adopted && took > 0`, model 0: "The Maren house took up your ways."
    - `adopted && took > 0`, `modelVisible` false: "The Maren house took up the way of a house beyond your neighbours."
    - `adopted && took > 0`, otherwise: "The Maren house took up the Pell way."
    - not adopted (or took 0) and `changed` true: "The Maren house changed one of its ways on its own."
    - otherwise: "The Maren house looked to the Pell house and kept its own way." (model 0: "looked to your house"; `modelVisible` false: "looked to a house beyond your neighbours").
    - Use "Your sister's house" when the entry's house is kin.
  - if there is no visible entry and kin did not change: "No house you can see changed its way."
- Under the cards, one fixed line of small print: "A hand can be turned back at the ford. You only ever see whether one arrived."

### 3.3 Leaving (after day 12 and its season's end)
- "Winter store: 66 of 64 measures. Your house is kept." or "Winter store: 58 of 64 measures. Your house is 6 measures short."
- "What you leave": your five ways as counts ("After they left you short: sent a hand 2 of 6"). A way never tested (`legacy().hollow[s]`) reads: "Never tested. Your heir keeps the old way here and sends a hand." or "...and stays home." (the old way sends a hand in "Meeting someone new", "After you both helped" and "After you left them short", and stays home in the other two).
- "Your sister's house follows your ways in {count of legacy().kin.fromYou} of 5 situations."
- Button: "Leave the valley".

### 3.4 The Afterwards
"Thirty seasons without you." One future (`runFuture(life, 0)`) plays in about 20 seconds: the ring of all eight houses appears for the first time (your house now held by your heir, your four neighbours, and the three far houses you never saw; ties join each house to the two on either side of it). Each season shows, per house, how freely it is helping (`helpRate`) and how it is faring (`income` or `purse`), and marks houses that are running your ways (`way === 0 || way === life.kin`) by shape or pattern as well as colour. A season counter runs 1 to 30. Say once, plainly: "This is one future of {futures}."
A short ticker shows events as they happen, one sentence each:
- arrival: "Season 4: newcomers, the Garrow house, take over the Odile holding." If the holding was kin's: "...take over your sister's holding. Her line ends there."
- adopt with `changed` true: "Season 10: the Maren house takes up your ways." (`way` is 0 or `life.kin`) / "Season 6: the Yarrow house takes up the Pell way." (use `wayName`). When the adopter is house 0: "Season 19: your heir gives up your ways for the Pell way." When the adopter is kin: "Season 23: your sister's house gives up your ways for the Pell way." (if the house was not running your ways at that point, say "takes up" instead of "gives up your ways for"). Skip adopt events with `changed` false. Do not print a separate line for a `displaced` event that the adopt or arrival line already covers.
- mutation events may be left out.
A "Skip" button jumps to the end. With `prefers-reduced-motion`, show the final state and the event list without animating.
At the end say how this one future went, from `holds` and `level`: "In this future the valley held." / "In this future the valley held, barely." (`holds` true, level 'frays') / "In this future the valley fell, barely." (`holds` false, level 'frays') / "In this future the valley fell." And, from `yourWaysAtEnd` and `yourWaysLastSeason`: "At the end, 3 houses keep your ways." / "No house keeps your ways after season 23." / "No house ever kept your ways." (when `yourWaysLastSeason` is 0 or missing).
While this plays, compute the verdict in slices with `verdictJob` / `verdictStep` so the page stays responsive. If the verdict is not ready when the animation ends or is skipped, show "Counting futures: {job.futuresDone} of {job.futures}". Then a button "See the count" (id `to-chronicle`) opens the Chronicle.

### 3.5 The Chronicle
Events, counts and quotes only. No sentence that judges the reader or states a lesson. All numbers from `verdict()`'s own fields.
- **House:** "Kept: 66 of 64 measures." or "Not kept: 58 of 64 measures."
- **Valley:** "With you, the valley held in {holds} of {futures} futures. Had your house kept the old way: {baseline.holds} of {futures}." then "Your mark: +7." (the mark rounded to a whole number, with a true minus sign for negatives; "0" when it rounds to zero). Small, beneath: "A different {futures} futures would move the mark by about {ceil(2 x markSE)} points either way."
  Draw two rows of 200 small marks from the first 200 entries of `held` and `baseline.held` (held / fell, distinguishable without colour), labelled "With you" and "The old way", captioned "The first 200 of {futures} futures." Two lines of explanation: "The same valley played forward {futures} times, with different luck at the ford and different chances taken." and "A future counts as held if, in its last ten seasons, at least half the hands that could arrive still do."
- **Where that sits:** one horizontal scale from `range.scaleLow` to `range.scaleHigh` (percent of futures held) with ticks at `range.worstPct` and `range.bestPct` and two markers, "You" at `holdsPct` and "The old way" at `baselinePct`. Sentence: "Of thirteen plain ways a house might have left here, the best holds in {bestPct}% of futures and the worst in {worstPct}%." Never name or describe the thirteen ways. Print percentages as whole numbers.
- **The last day** (shown whenever `verdict().lastDay` is not null, whatever `mattered` is): "On the last day you stayed home against the Maren house and the Pell house, after hands had gone both ways with each. With a hand sent to them, the valley holds in {lastDay.holds} of {lastDay.futures} futures, against {whatIfBaseHolds} as you left it. Your store would have been {lastDay.purse} of {need} measures." (one house: "against the Maren house, after hands had gone both ways"). Facts only.
- **The seal:** when `verdict().seal.earned` is true, and only then, show a distinct combined seal: "House kept, valley better off." Do not rebuild the rule on the page and do not remark on its absence.
- **The way that mattered most** (from `verdict().mattered`):
  - null: "No single way of yours stands out from the luck of the ford."
  - kind `habit`, situation s: "{title}: you sent a hand {h} of {n} times. One more hand there: held in {whatIfs[2s].holds} of {whatIfFutures}. One fewer: {whatIfs[2s+1].holds} of {whatIfFutures}. As you left it: {whatIfBaseHolds} of {whatIfFutures}."
  - kind `lastDay`: "Nothing counted here weighed more than the last day." (the last-day line above carries the numbers).
- **What became of your ways:** from the watched future (index 0): the lines of 3.4 that involve your heir, your sister's house, or another house taking up your ways, then the closing "At the end..." line. Head it "In the future you watched".
- **Valley no. 48213** in small print (`life.seed`).
- Buttons: "Live another life" (id `again`, new seed) and, quieter, "Live this valley again" (id `again-same`, same seed: the same houses and the same luck at the ford, so two lives in one valley can be compared).
- **Past lives** are kept in `localStorage` (key `after-you.lives.v1`, newest first, at most 20; each: valley number, house kept or not with the two numbers, mark, whether the seal was earned), inside try/catch, and listed here and on the opening view as rows such as "Valley 48213: kept, 66 of 64. Mark +7. Seal." The page must work with storage unavailable.

## 4. Words

- Never use: cooperate, defect, prisoner, dilemma, strategy, payoff, tit for tat, game theory, player (address the reader as "you"), or any archetype name from the engine (firm, soft, taker, wary, steady).
- Short, plain sentences. No exclamation marks, no emoji, no moral commentary, no em-dash asides.
- House names always as "the Maren house" ("The Maren house" at the start of a sentence); kin always as "your sister's house"; house 0 in the Afterwards as "your heir".

## 5. Technical rules (the host enforces these)

- External resources: fonts only from Google Fonts via one `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...&display=swap">`, with real fallback stacks. No other external requests. No images from the network; draw with inline SVG or canvas.
- Theme: every colour is a CSS custom property first defined on bare `:root` (light values). Redefine the same tokens under `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ...; color-scheme: dark } }` and again under `:root[data-theme="dark"] { ...; color-scheme: dark }`. `body` sets `background` and `color` from tokens, `margin: 0`, and an explicit font size. No component rule uses a literal colour; canvas drawing reads its colours from the computed tokens and redraws when the theme changes.
- Side gutter on one outer wrapper: `padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px));` with vertical padding via `padding-block`. Do not remove the host's `:root` padding.
- Must work at 400px wide with no horizontal page scroll: cards stack or go two by two, rows wrap, text containers have `min-width: 0`, nothing has a `min-width` wider than the screen.
- Toggle views with `el.hidden = true/false`, not `style.display`. Do not set `display` on an element in CSS in a way that defeats `hidden` (the host adds `[hidden]{display:none!important}`; do not rely on it locally: add the same rule to your `<style>`).
- No `alert`, `confirm`, `prompt`, no `window.print`, no downloads, no forms that submit.
- Real `<button>` elements, visible keyboard focus, `aria-live="polite"` on the result area, radio semantics on the choice control, `prefers-reduced-motion` respected, stable `id`s on controls.
- Guard against double activation: once a day is closed its controls are inert until the next day.
- Move focus sensibly when the view changes (to the new view's heading), and scroll to its top.
- Timing: drive the Afterwards from elapsed time (`performance.now()` with `setTimeout` or `setInterval`), never from `requestAnimationFrame` alone, so it still finishes in a tab that is not in front. Run the verdict in slices by time budget (keep calling `verdictStep(job, 200)` until about 25 ms have passed, then yield with `setTimeout`). The whole verdict takes about one second of work; once the animation has ended or Skip was pressed, finish whatever is left in a few large slices instead of waiting on throttled timers. Cancel every pending timer when the view changes or a new Life starts.
- Escape every engine string you put into `innerHTML`, or build nodes with `textContent`.
- Welcome but optional: `window.claude?.hot?.snapshot(() => state)` and boot through `window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {})` so a reload keeps the Life in progress. A Life can be rebuilt exactly from its seed and the list of choices made so far.

## 6. Look

Follow the visual direction given in your task. In every direction:
- Write a short design plan into the file itself as the `:root` block: a one-line layout concept as a comment, 4 to 6 named colour tokens with tinted neutrals designed for both themes, and font tokens for two roles.
- "A hand sent" and "stayed home" must differ in form, not colour alone (filled versus open marks). The same for held / fell and for houses running your ways.
- Two typefaces with distinct roles and a fixed type scale; `font-variant-numeric: tabular-nums` where digits align; `text-wrap: balance` on headings; running text near 65 characters wide.
- Avoid these looks: warm cream with a serif display and terracotta accent; near-black with one acid-green or vermilion accent; broadsheet hairline rules with dense columns; purple-to-blue gradients; emoji as markers; everything centred; the same rounded corners and shadow on every block; a coloured accent bar on rounded cards.
- Card styling only where an element is a separate object the reader acts on (the four neighbours). Use layout and type for the rest.
- Motion in two places only: the card turning over for "Why?", and the Afterwards. Keep everything else still.
- Include at least one detail that belongs only to this subject (measures of grain, tally marks, the ford, the ring of holdings) as working content, not ornament.

## 7. Self-check without a browser

No browser is available to you. Do these before you finish (JSC path is in your task):
1. Syntax: `"$JSC" -e "new Function(readFile('app.js')); new Function(readFile('words.js'))"` must not throw.
2. `page-smoke.js`: a jsc script that loads `engine.js` and `words.js`, then for at least 20 seeds and three ways of playing (always send; send unless left short yesterday; that and stay home against everyone on day 12) performs the same sequence of engine calls that `app.js` performs for a complete Life (every day, every reveal, every Why?, every season's end, Leaving, the watched future, the verdict by `verdictJob`), calls every function of `AYWords` with the real engine data at each point, and throws a clear error if any returned sentence is not a non-empty string, or contains `undefined`, `NaN`, `null`, `[object`, a double space, or any word forbidden in section 4 (whole words, any case). It must also read every engine field that `app.js` reads for drawing and throw if one is undefined. Print a count of sentences checked and five sample Chronicles in full. Running time under 60 seconds.
3. Check every id and data attribute of section 2 is present in `index.html` or created by `app.js`.
4. Read your `index.html` once more against section 5 line by line.
