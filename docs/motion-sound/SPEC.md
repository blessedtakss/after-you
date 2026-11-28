> **The design as built.** Written 2026-11-27 00:13 (local time, UTC+10) for the motion and sound pass, before `motion.js` and `sound.js` were written, and copied here on 2026-11-27 as the record of that pass, amended where the build or its review changed the design. Each amendment is marked **As built** where it stands: the `still` cue (5, 6.2 and 6.3); part 15 strict by default, with checks for the review's fixes (6.6); the motion's choices (no weather or mist on the Afterwards map, Leaving drawn with day 12's evening calendar, the Border's Afterwards light from .08 to .06: 2.6 and 3); the sound's levels (a cue's dB is its peak before the master, each bed -40 dBFS RMS, a gain after the compressor taking off its make-up gain, a decay as the time to fall 60 dB, beds of 10 nodes or fewer, the oldest voice released in 15 ms past 12: 4.1 to 4.3) and a one-shot released when a cue comes (4.2); the self-downgrade not judged across a hidden page (5); the memory's alternative armed on a click or key (4.5); and music held, not ended, when the browser refuses to play it or when the page's own pause cuts a pending play short (4.7). Its file:line references are to the files at 5b3f8fb (v0.2.1 and the Pages commit), before the pass. A, B and C are the three designs it was settled from, and "the judges" the two reviews that compared them; none of them is kept here. Where it disagrees with the code, the code wins. Section 6 of [LEAD-DECISIONS.md](../places/LEAD-DECISIONS.md) records the older rules it supersedes, and part 15 of the checks in [`checks/`](../../checks/) (`checks/page/motion-sound.js`) holds the two modules to it.

# After You: the motion and sound pass. Final design spec

**What this is built from**
- **Base:** spec C (engineering), chosen by both judges.
- **Grafts:** ideas from A (clarity) and B (atmosphere).
- **Rule violations** the judges found are removed.

**How it was checked**
- Every file:line was read at HEAD 5b3f8fb (v0.2.1 plus the Pages commit). Nothing in the repository was changed.
- "Reader" means the person playing.
- This file is ASCII, so any snippet can be pasted into a page script.

## Decisions (contested points, and how they were settled)

| # | Point | Settled as | Why / where |
|---|---|---|---|
| 1 | Base spec | C | both judges |
| 2 | Reveal length | A's timings: record by 650 ms, images by 810, beats by 1050 (not C's 1.9 s) | Next day opens at 350 ms (app.js:33); a click cuts to rest |
| 3 | When their hands set off | IN_AT 70 ms (B) | out first, and crossing hands pass near the crossing |
| 4 | A neighbour's missing act | Valley nothing; elsewhere only the visible result, entering in place; Banks net *settles* (not C's drift); never any sound (A) | 1.2 L2 |
| 5 | The shut gate | your own Stay only | 1.2 L3 |
| 6 | Your own luck | your lane only: a lead-in, then the same image as your refusal | 1.2 L4 |
| 7 | Travellers | walker, fish, runner, doffed cap with carts (B), coin | 2.4 |
| 8 | Afterwards data | no engine events, no `ev.model` (used by all three); ties inked when both ends are yours (C); B's light arc, no worse-side haze | 3 |
| 9 | Light | washes with one new token `--dusk` (not A's sepia, which browned dark; not C's `--paper-sunk`, nearly invisible); Border never deepens | 2.5 |
| 10 | Weather | B's marginal notes at y <= 0.36 H (B's 0.55 H reached holdings 2 and 6); calendar only; no rain, no tide change, nothing changing at the Border | 2.6 |
| 11 | Levels and arrivals | A's (bed -40 dBFS); one note and pan per house | 4 |
| 12 | Sound start | only from the Sound button, every visit; memory never arms by default | 4.5, Q4 |
| 13 | Button | made by sound.js, moved into each view's row (A); Chronicle: action row, so `.chron-head` (index.html:735) never reflows | 4.5 |
| 14 | Label | `W.soundWord = 'Sound'`, a string, so `NOT_WORDS` and part 7 stay (page-smoke.js:445) | 6.4 |
| 15 | iOS audio session | `navigator.audioSession.type = 'ambient'` (A, not C) | 4.1 |
| 16 | Hooks | C's lazy dispatcher, synchronous, after the last draw; no microtask flush (the `map` hook re-dresses every draw) | 6.2 |
| 17 | Loops | WAAPI, phase from `document.timeline` (B), finite iterations; no module timers | 2.6 |
| 18 | Small cues | Afterwards "ways" note the same both ways (C); season's end bell plus N chimes for the printed "N of 5" | 4.3 |
| 19 | Tilt | none in this pass | 2.7 |
| 20 | Corrections | `typeof globalThis` footer (sheet.js:752); index.html:280 made ASCII (mandatory); the future's model draw is engine.js:1404 (moot) | 6.1 |

## 1. Principles

**What motion and sound are for**

1. **Join cause to effect.** Your hands go out along the ties and theirs come back.
2. **Make time felt.** Light and a calendar of small life change over twelve days, and the Afterwards is a time-lapse.
3. **Give each place a presence.** Each place has its own traveller, far-band life and sound bed.
4. **Stay out of the way.**
   - Never add a fact the page does not show.
   - Never hold a control, move focus or change layout.
   - Always end on the static drawing.

Nothing judges the reader (UI-SPEC.md:106). There are no fanfares.

This pass supersedes two older rules: "Motion in two places only" (UI-SPEC.md:151) and sound's place on the cut list (design.md:105). The integration package records this in LEAD-DECISIONS.md.

**The luck-or-choice rule, made mechanical**

- **L1. Only shown fields go in.** app.js builds every payload from the whitelist in 6.3.
  - A neighbour's act arrives only as `they` (engine.js:218), and the sister's dealings as `kinSent`/`theySent` (engine.js:258).
  - Modules never read `AfterYou`, `AYApp`, `life`, `state`, `why`, `seen`, habits, `custom`, `trace`, engine events or the verdict.
- **L2. A missing act gets one fixed image per place.**
  - The image is keyed only on `they === false`. It depends on nothing but (place, sheet kind, crop, day, lane), and it is silent.
  - The image is what the words say for both causes:

    | Place | Image | Words |
    |---|---|---|
    | Valley | nothing | valley.js:122-123 |
    | Banks | a net in your water | banks.js:124, 126, 128 |
    | Border | a fire on their tower | watch.js:142, 144, 146 |
    | Bridges | their cart comes on | bridges.js:138, 140, 142 |
    | Saltmarket | a slash on their price | saltmarket.js:139, 141, 143 |

  - It always enters the same way: a fade with a 0.9-to-1 scale. It never travels, drifts, is cast, balks or stutters, because each of those would show a cause.
- **L3. The gate is your own Stay.** It is the `m-stay` bar, which is drawn only for your act (sheet.js:583, 589).
- **L4. Luck shows only on your own lane, keyed on your own `lost`.** The page already says it (words.js:343-351). After its lead-in your luck ends on the same image as your refusal: the image is what the other side sees, and the lead-in is what only you know (LEAD-DECISIONS.md:52-56).
- **L5. Timing is fixed.**
  - Every lane has the same slot whatever happened on it.
  - Cue variation is a pure function of (day, lane).
  - Bed one-shots are held off from 300 ms before any cue window to 300 ms after it.
- **L6. Weather and light follow the calendar.**
  - `lightFor` and `weatherFor` never read the seed or the results.
  - Nothing evokes a place's luck agent:
    - no fog at a ford;
    - no tide change at the race;
    - no deepening night or shadows at the Border;
    - no rain anywhere.
  - FOG is a constant for each place (engine.js:475, 558, 578, 590).
- **L7. Nothing judges.**
  - No motion or sound depends on the verdict, the seal, the side of the strip, the store or the day's gains.
  - The seal is neither animated nor sounded ("do not remark on its absence", UI-SPEC.md:112).
  - The count-ready cue is one sound for every result.
  - The town paying and the wheels locking are drawn but not sounded. At the Saltmarket the town paying is the worse side (CHARTER 'breaks').
- **Enforcement:** the whitelist, a twins test sorted by cause, and a source scan (6.6).

**Theory words**
- "Sound" is the only new visible word.
- `FORBIDDEN_RE` (page-smoke.js:59) is case-insensitive and catches whole words such as "soft", "steady" and "firm". It is run over both module sources, comments included.
  - Write "quiet", "gentle" or "even" instead.
  - Tokens like `--ink-soft` stay in index.html CSS. Modules use class names only.
- No track metadata is ever shown.

**The other hard rules**
- engine.js is never edited. Modules show no numbers.
- All page scripts are ASCII.
- Nothing is installed and there is no build step.

## 2. Motion, event by event

### 2.1 Building blocks

**Layers.** After every `drawMap` (app.js:291-297), motion inserts two groups into the map's `<svg>`. Both have `aria-hidden="true"` and `pointer-events: none`.

| Group | Inserted | Holds |
|---|---|---|
| `fx-air` | before the first `.m-hold` | light washes, mist, weather, water shimmer, Afterwards tie inking |
| `fx-go` | before the first `<text>` | travellers, place images, ghosts |

- Holdings, hands, gauges and lettering, with its halo (index.html:228), stay above the washes.
- Base nodes are animated only with WAAPI (opacity, transform, stroke-dash) and no forward fill. No attribute is ever written.
- Everything is clipped by the map's own `clip-<mode>`.

**Building and finding nodes**
- New nodes are made from markup parsed in a holder: `div.innerHTML = '<svg>' + markup + '</svg>'`. This works in browsers and in domshim.
  - No `createElementNS`.
  - No namespace URL, because page-smoke.js:1449 bans addresses.
- Map marks are found by `d` equality with a new export, `AYSheet.lanes(sheet, kind)`. It is built from the same expressions as sheet.js:566-597, and `map()` is untouched, so part 10 holds. For ids 1, 2, 6 and 7 it returns:

  | Field | What it is |
  |---|---|
  | `out` and `outD` | your lane, and the `d` of your `.m-hand` |
  | `back` and `backD` | their lane |
  | `broken` and `brokenD` | your lost hand (`.m-lost`) |
  | `stub` and `stubD` | your plan (`.m-plan`) |
  | `gate {p, q, half}` | your Stay bar |
  | `cross`, `dir` | the crossing |

  `AYSheet.lane(sheet, kind, from, to)` gives the same for the sister's lanes. Geometry ignores lettering (sheet.js:79-86) and the crop, which only shifts the viewBox.
- A head is the next sibling after its line (sheet.js:410-418).
- Bound segments are found by `stroke-dashoffset` (sheet.js:475).
- Card glyphs (`.result-glyph`, app.js:846; sheet.js:678-687):
  - your line: `d="M17 7H37"`;
  - their line: `d="M42 17H22"`;
  - your lost hand: `.key-lost` plus the next `.key-ink`;
  - your Stay: `.key-ink` with `d="M17.5 3.2v7.6"`.
- Selectors are compound only, as domshim requires (domshim.js:99-113).

**Drawing**
- **Draw-on:** the path length is parsed from the M/L `d` string (sheet.js:159-163), never from `getTotalLength`. Then `strokeDasharray` and `strokeDashoffset` run from the length to 0, with `fill: 'backwards'`.
- **Easing:**

  | Name | Value | Used for |
  |---|---|---|
  | ink | `cubic-bezier(0.25, 0.6, 0.3, 1)` | lines |
  | stamp | `cubic-bezier(0.3, 1.5, 0.6, 1)` | gate, crosses, diamonds, tents |
  | ease-in-out | | light |
  | `steps(n)` | | loops, which "boil" like a hand-drawn flip-book |

- **Travellers:**
  - Ink drawings about 9 units tall, times 0.857 on the compact sheet.
  - Moved by WAAPI `translate()` keyframes at every fourth lane point, with offsets by arc length.
  - Fade in over 40 ms and out over 60 ms; the ink draws behind them.
  - Lanes are about 145 units long on the wide sheet and 79 on the compact one (jsc probe).

### 2.2 Timing constants

These are `AYMotion.TIMING`, and `AYSound.TIMING` is identical (part 15 checks this). The sweep index k runs west to east: houses 7, 6, 2, 1 are k = 0, 1, 2, 3 (sheet.js:58).

| Constant | ms | Constant | ms | Constant | ms |
|---|---|---|---|---|---|
| LINE | 280 | HEAD | 90 | STAGGER | 30 |
| IN_AT | 70 | GATE | 180 | X (cross) | 110 |
| IMAGE_AT | 200 | IMAGE | 450 | KIN_AT | 220 |
| GAUGE_AT | 300 | GAUGE | 260 | BEAT_AT | 600 |
| BEAT | 360 | VIEW | 160 | LIGHT | 1200 |

### 2.3 The moments of a Life

**Opening** (`opening`: first paint, `choosePlace`, `goOpening`). Reads the drawn nodes.
1. If the place changed, the map box fades from 0.5 to 1 over 200 ms.
2. At 120 ms the cost number (the first `.m-num`, sheet.js:637) fades in, and the demo hand (sheet.js:566-568) inks over 440 ms with the place's traveller.
3. At 560 ms the head lands and the worth number (the second `.m-num`) fades in.

It is done by 760 ms. It teaches what a hand costs here and is worth there.

**A day opens** (`day`: Begin, Next day). Reads `day`.
- `.track-day.is-today` (app.js:622-633) fades from 0.3 to 1 over 160 ms.
- The light moves from the last light shown to this morning's, 1200 ms.

**Choosing** (`plan`). Reads `id` and `send`. Only the changed lane moves:
- a send: the stub inks over 160 ms and its tip pops at 120 ms;
- a stay: the gate swings shut over 160 ms.

**Closing the day** (`reveal`). See 2.4. The light moves to evening over 1200 ms.

**Next day.** The redraw ends the reveal at rest, then "A day opens" plays.

**Season's end** (`seasonEnd`, days 4, 8 and 12). Reads `followBefore/After` and `keepsBefore/After`. Done by about 800 ms.
- The light moves to dusk over 1200 ms.
- Four to seven "+" stars appear in the far band, 120 ms apart. None at the Border.
- New `.m-bound` segments ink on: dasharray from "0 100" to "15 85", 320 ms, starting at 100 + 60k.
- Lost segments fade as ghosts over 260 ms. Each ghost is rebuilt from attributes kept at the last dressing.
- New diamonds stamp at 380 + 60k (scale 0.4 to 1, 200 ms). Lost diamonds leave a fading ghost.
- `#season-end` fades from 0.5 to 1 over 200 ms.

**Leaving** (`leaving`).
- The light moves to the Leaving dusk over 1200 ms.
- Your five `.m-bound` segments glint once: opacity 1 to 0.35 to 1, 400 ms, 80 ms apart.

**Afterwards.** See section 3.

**Chronicle.** Nothing moves: no seal stamp and no row sweep.

**Any view change** (`view`). Unless the change is quiet or reduced motion is on, the section shown fades from 0.5 to 1 over 160 ms, and the other maps' transients are cancelled.

**Why?** The existing 0.5 s card turn (index.html:483) is unchanged.

**What never moves.** Cards, status, the ways rows and the meter. The only HTML effects are opacity fades.

**Card glyphs.** Each card's glyph plays its lane's timeline: your line from left to right, theirs from right to left. On a phone in one column, where the map is often above the window, the glyphs carry the reveal.

### 2.4 The reveal (T0 = `drawDay()` returns in `closeDay`, app.js:1024)

**Timing.** The record settles by 650 ms. Every slot runs whatever happened on its lane.

| Mark | Starts | Lasts |
|---|---|---|
| Your arrived hand | 30k | 280, head at +250 for 90 |
| Your lost hand (dashes slide to the crossing) | 30k | 260, cross at +240 for 110 |
| Your Stay (gate swings 80 deg to 0) | 30k + 40 | 180 |
| Your image (refusal, or luck after its lead-in) | 30k + 200 | 450 |
| Their arrived hand | 70 + 30k | 280 + 90 |
| Their missing act (image only) | 270 + 30k | 450 |
| Sister's arrows (ink, no traveller) | 220 | 280 + 90 |
| Banks gauge step | 300 + 30k | 260 |
| Resolution beat | 600 + 30k | 360 |

**By place**

| Place | Arrived (out or in) | Your Stay: gate plus image | Your lost hand: lead-in, then image | Their missing act | Resolution beat |
|---|---|---|---|---|---|
| Valley | walker | gate only | walker to the ford ring, one ripple (r 2 to 9), walker fades | nothing | none |
| Banks | fish swims the lane; the sender's boat (`.m-hull`, `.m-mast`, `.m-sail`, `.m-wave`) bobs, 360 ms | net cast, settles on their side | net drifts along the race, settles on their side | their net settles on your side | gauge step |
| Border | runner with a pale pennant | fire on your tower | runner sets off, a fire flares on your tower, the runner halts at the post | fire on their tower | none |
| Bridges | doffed cap glides; the giver's cart draws aside 2 units | your cart comes on toward the bridge | your cart balks twice (60 ms), then comes on | their cart comes on | see below |
| Saltmarket | coin rolls, turning edge-on twice | slash on your price tag | coin slips and rolls aside, then the slash | slash on their tag | see below |

**Bridges resolution** (bridges.js:137-142). "Came on" is `!arrived` for you and `!they` for them.
- One cart came on: it crosses the deck.
- Both came on: the carts meet mid-deck and shake +/-1.2 units three times in 300 ms.
- Neither came on: nothing.

**Saltmarket resolution.** When `arrived && they`, a coin drops at the market cross (saltmarket.js:140).

Images fade out by the end of their slot.

### 2.5 Light over the twelve days

**Washes.** Two clipped rects sit in `fx-air`:
- **Cool:** `fill: var(--river-wash)`.
- **Dusk:** `fill: var(--dusk)` with `opacity: calc(var(--dusk-k) * v)`.

| New token | Light | Dark (both blocks) |
|---|---|---|
| `--dusk` | #1C2A3A | #05080D |
| `--dusk-k` | 1 | 1.5 |

**Values.** `_test.lightFor(place, view, day, phase)` returns `{cool, dusk, mist}`. s is the season and d the day within it.

| View, phase | cool | dusk | mist |
|---|---|---|---|
| Opening | .04 | 0 | .25 |
| Day morning (choosing), d = 1/2/3/4 | .10/.06/.03/.02 | 0 | .45/.20/.15/.25 |
| Day evening (revealed), s = 1/2/3 | .02 | .04/.05/.06 | half the morning's |
| Season's end, s = 1/2/3 | 0 | .08/.10/.12 | .30 |
| Leaving | .03 | .14 | .35 |
| Border (all views) | as above | same in every season: evening .04, season's end .08, Leaving .08 | .20 always |

**Mist** is three `--paper-raised` strokes along `geo().farLine`, 28, 18 and 10 units wide, at .12 each, times the mist value. It hazes the ridge drawing ("what you cannot see") and never a lane.

**When the light changes**
- The `map` dressing always draws the light statically.
- Only transient cues (`day`, `reveal`, `seasonEnd`, `leaving`, `afterStart`) animate it, from the light last shown.
- `quiet` and reduced motion set it directly.

**Contrast.** At the strongest dusk, `--field` measures about 3.9:1 against the darkened paper. contrast.py checks that it, `--river` and `--ink-soft` all stay at 3:1 or more.

### 2.6 Weather and the calendar of life

**Rules**
- Drawn as marginal notes: stipple, small "v" birds, "+" stars, hatched scraps, tiny stooks.
- Every element lies at y <= 0.36 H, clear of every holding box plus its bound plus 4 units.
- Positions come from a fixed table per place.
- At most 3 loops per map.
- **As built:** the Afterwards map carries no weather and no mist: its `fx-air` holds the light and the inked ties only. Leaving's map carries the calendar of day 12's evening.

| Place | Every day | By the calendar (the same in every Life) |
|---|---|---|
| Valley | stream shimmer | swallows days 1-4; leaves days 9-12 |
| Banks | race shimmer (constant); gulls | sea fret over the far shore, mornings of days 2 and 6 |
| Border | none | crows days 1-4; snow lying on the scarp from day 9 (.25/.45/.65/.80) |
| Bridges | stream shimmer | skylarks days 1-6; one hay stook on the downs per day from day 5 (8 by day 12); mist in the dips, mornings of days 9-12 |
| Saltmarket | none | pigeons days 1-4; heat shimmer over the arcade days 5-8; scraps days 9-12; arcade lamps every evening and at Leaving |
| All but the Border | | stars at season's end |

**Loops**

| Loop | Drawn as | Timing |
|---|---|---|
| Shimmer | a `--paper-raised` dash along `geo().barrier` | `steps(8)` over 2400 ms |
| Mist | drifts +/-6 units | `steps(40)` over 20 s |

- **Phase:** `anim.currentTime = document.timeline.currentTime % duration`, so the redraw on every `choose` (app.js:990) does not restart a loop.
- **Length:** a loop runs `ceil(90000 / duration)` iterations. Any cue restarts it.
- **Off:** while the page is hidden, the map is folded or off-screen (`IntersectionObserver` on the four persistent map boxes), under reduced motion, and after a self-downgrade (5).

### 2.7 Depth and tilt

There is no tilt.
- Perspective rasterises the SVG and blurs the 0.5-unit grid lines and the lettering.
- It can move `scrollWidth`, which the autoplayer measures (autoplayer.js:13).

Depth comes from layering instead: weather under the holdings, travellers under the lettering, two-speed mist, and a tiny shadow under each traveller.

## 3. The Afterwards time-lapse

**The clock is unchanged**
- SEASON_MS is 660, `every(tickAfter, 100)` (app.js:1085) drives it, and it ends at 19.8 s (app.js:1223-1229).
- dom-run's limits are untouched: finished by 21 s, under way at 700 ms, and Skip ends it at once (dom-run.js:343-356).

**Data: only what the page already draws**
- **Sources:** `state.future = A.runFuture(life, 0)` (app.js:1078) and the ticker lines `W.futureLines` (app.js:1081). No second future is run.
- **Per season, app.js passes the expressions it already uses:**
  - `yours[8]` (app.js:1145);
  - `isNew[8]` (app.js:1142);
  - `strip = clamp(flow, 0, top) / top` (app.js:1208);
  - `told: [{yours}]` and the `<li>` nodes appended (app.js:1210-1214);
  - `byClock` (app.js:1202).
- **At the end:** `finalYours` from `finalWay` (app.js:1171-1177).
- **Never passed:** engine events and their `model` (engine.js:1404).
- **Banks:** the 16 gauges stay exactly as `drawBanks30` sets them (app.js:1160-1168).

**Ties brighten and fade by your ways**
- `fx-air` in `#map-after` copies each `.m-tie[data-tie]` path, stroked with `var(--yours)` at width 2.4.
- A tie shows at opacity .85 exactly when both of its ends run your ways, the same fact as its two diamonds. This is exact.
- The page does not invent per-tie light from `helpRate`. The engine records no per-tie flow outside the Banks (engine.js:1421-1430).

**Per season, by the clock**

| At (ms) | Effect |
|---|---|
| 0 | new ticker `<li>` fade from .2 to 1 (200 ms); tents pop where `isNew` turned on (280 ms); a diamond that turned off leaves a ghost (260 ms) |
| 120 | a diamond that turned on stamps (200 ms) |
| 300 | ties that changed ease to their new opacity (360 ms); the final value is written to the fx node |

- Fills and the strip keep their own transitions (index.html:222, 702).
- A way's line shows in season s and its diamond in s + 1 (engine.js:330-333): cause, then effect.

**The light arc** (from B)
- One 19,800 ms animation with `steps(60)`: three repaints a second, which leaves room for `pump` (app.js:1287).

  | At (ms) | cool | dusk |
  |---|---|---|
  | 0 | .03 | .14 (Border .08) |
  | 2500 (dawn) | .10 | 0 |
  | 9900 | .02 | 0 |
  | 19800 | 0 | .10 (Border .06) |

  **As built:** the Border's arc starts at its own Leaving dusk, .08, and ends at .06, so nothing there deepens; the arc has no mist.

- At `afterEnd` the light settles into one neutral morning (cool .04, dusk 0), whatever the outcome: over 1200 ms after a natural end, 300 ms after Skip.

**Jumps.** Motion sets the final state with no transitions when:
- several seasons arrive at once (`byClock` false);
- the reader presses Skip (app.js:1527);
- the view is restored;
- reduced motion is on (app.js:1084).

A natural end is the module having received season 30 by the clock. A redraw (`drawAfterMap`, app.js:324-329) is re-dressed from the module's state.

**Budget per season:** at most 16 opacity tweens, at most 8 stamps or ghosts, and at most 2 ms of script.

## 4. Sound

### 4.1 Graph, master, levels

**Starting the context.** Only inside the Sound button's click:
1. Set `navigator.audioSession.type = 'ambient'` where it exists.
2. `new (AudioContext || webkitAudioContext)({ latencyHint: 'balanced' })`.
3. `resume()`, then play a one-sample silent buffer for iOS.

**Graph**
```
bed -> bedDuck -> bedIdle -> master;   cues -> master;   music -> trackGain -> musicDuck -> master
master (-3 dB) -> DynamicsCompressor (threshold -18, knee 10, ratio 3, attack 5 ms, release 250 ms) -> trim (-5.28 dB) -> destination
```
- **As built:** the trim after the compressor takes off the make-up gain the compressor adds below its threshold (5.28 dB at these settings, by Web Audio's curve), so that the compressor only ever holds peaks.
- **Noise:** one 2 s pink buffer (Kellet), looped. Each layer plays it at its own `playbackRate` (0.97-1.03).
- **LFOs:** sine oscillators through depth gains, with co-prime periods.

**Levels**

| Signal | Level |
|---|---|
| Bed | about -40 dBFS RMS |
| Cue peaks | -20 to -36 dBFS |
| Music | about -32 LUFS |

**As built:** a cue's dB, in this table and in 4.3, is its peak before the master, so it reaches the output 3 dB lower. Each place's bed is normalised to -40 dBFS RMS at the output (at 0 dB of view): the layer levels in 4.2 set the balance of its layers, and the bed's RMS is reckoned from each filter's response to the noise.

**Ducking** on each cue: the bed by 3 dB (30 ms down, 500 ms back), the music by 6 dB (40 ms down, 700 ms back).

**Idle.** Each input reschedules `bedIdle` on the audio clock: 120 s after the last input it drops 6 dB (`setTargetAtTime`), and it returns over 2 s at the next one. An input is a cue, or a `pointerdown` or `keydown` on `document`.

**Scheduling.** Cues play at `currentTime + offset - (outputLatency || 0)`.

### 4.2 Beds (A's recipes)

One-shots chain by `onended` and use `Math.random` (never the game's seed) for gaps, pan (+/-0.7) and pitch (+/-8%). Each is held off for 300 ms on either side of a cue window. **As built**, a cue cannot be foreseen, so a one-shot already sounding when a cue comes (or set to start in the 50 ms after it) is released in 15 ms.

| Place | Layers | One-shots |
|---|---|---|
| Valley | wind: pink, BP 420 Hz Q .7, -36 dB, LFOs .071 Hz (+/-6 dB) and .029 Hz (+/-140 Hz); stream: white, HP 1600, LP 4200, -46 dB | birds every 18-45 s: 3200 to 4100 Hz in 60 ms, 2-4 chirps, -42 dB |
| Banks | swell: pink, LP 520 Hz, -34 dB, LFOs .11 and .047 Hz; race hiss: white, BP 1300 Hz, -48 dB, constant | gulls every 25-60 s: triangle 1450 to 980 Hz in 280 ms, vibrato 9 Hz, -42 dB |
| Border | wind: pink, BP 850 Hz Q 1.4, -40 dB, LFOs .06 and .023 Hz; whistle: BP 1700 Hz Q 9, -52 dB | wooden creak every 30-70 s: sawtooth 70 Hz, resonant LP 250 to 520 Hz, -44 dB. No fire, horn or bell |
| Bridges | stream: BP 900 Hz (-40) plus BP 2600 Hz (-46), LFOs .9 and 1.7 Hz; low wind: LP 300 Hz, -44 dB | two-note whistle every 20-50 s (1900 then 1500 Hz), -44 dB. No wheels or hooves |
| Saltmarket | murmur: pink through BP 480 Hz (Q 2.2) and BP 1350 Hz (Q 2.8), centres wandering +/-18%, -40 dB; room: LP 220 Hz, -46 dB | footsteps every 15-35 s, -46 dB. No coins |

**As built:** a layer's high-pass and low-pass pair is one band-pass between them (the Valley's stream: 2592 Hz, Q 1), and layers may share one noise source, so that each bed is 10 nodes or fewer (5).

**Calendar.** One-shot rate times 1.4 on days 1-4, 1.0 on days 5-8 and 0.6 on days 9-12. In the evening, cut-offs times 0.9. At season's end the birds stop.

**Views**

| View | Bed |
|---|---|
| Opening, Day | 0 dB |
| Leaving | cut-offs x 0.8, -3 dB, no one-shots |
| Afterwards | through LP 1200 Hz, -4 dB |
| Chronicle | -6 dB |

View changes take 1.5 s. A place change crossfades over 1.5 s.

### 4.3 Cues

**Notes (Hz)**

| Place | Notes 1-5 | Arrival timbre |
|---|---|---|
| Valley | 293.7 329.6 370.0 440 493.9 | wood: sine plus 3.98x at -14 dB |
| Banks | 220 261.6 293.7 329.6 392 | buoy bell: f plus 2.4f at -10 dB, 1.0 s |
| Border | 329.6 392 440 493.9 587.3 | wood block: triangle into LP 1800 Hz, 0.35 s |
| Bridges | 261.6 293.7 329.6 392 440 | pluck: sawtooth into LP 4000 to 600 Hz |
| Saltmarket | 392 440 493.9 587.3 659.3 | small bell: f, 2.76f, 5.4f |

**Variation.** v = (day + k) mod 3 sets detune [-25, 0, +25] cents and level [-1, 0, -0.5] dB. Identical cues closer than 90 ms apart are merged.

| Cue | When | Reads | Recipe | Peak dBFS |
|---|---|---|---|---|
| on | button on | | note 3 | -30 |
| plan | `plan` | `send` | per place, send / stay: Valley wood tap 660 Hz / knock 220 Hz; Banks oar knock 330 Hz / net swish (BP 1500 to 600 Hz); Border pennant flap / flint tick; Bridges light swish / rein jingle (2.3, 3.1, 4.2 kHz); Saltmarket coin set down / chalk stroke (BP 3.5 kHz) | -32 |
| send-off | reveal T0, any lane `arrived` or `lost` | own lanes | white, BP 700 to 2200 Hz in 240 ms | -30 |
| latch | T0 + 160, any Stay | own lanes | two knocks 28 ms apart (210 Hz) | -28 |
| turned back | 30k + 240, for each lost lane | own `lost` | muffled thump (110 to 70 Hz) coloured by place: low splash, slow swish, whoosh, hoof scrape, coin ping; panned to the lane | -26 |
| arrival | 320 + 30k, as the head lands | `they` | place timbre; note by house: 7 is note 1, 6 note 2, 2 note 3, 1 note 5; pan -0.5, -0.2, +0.2, +0.5 | -22 |
| day | a day opens | | paper: BP 2800 to 1200 Hz in 180 ms | -36 |
| season | season's end | `kinCount` | bell (note 1, an octave down, 2 s), then `kinCount` chimes (note 5, an octave up) 140 ms apart from 380 ms, at the sister's pan | -26 / -30 |
| leaving | Leaving | | low chord, notes 1 and 5, 2.5 s | -30 |
| flip | Why? | | paper flick (BP 3 kHz, 60 ms) | -36 |
| count | `a.said = true` (app.js:1268) | | notes 1 and 5, 90 ms apart, 1.4 s decay; the same for every result | -24 |
| chronicle | Chronicle opens | | page turn | -32 |

**Silent on purpose**
- every missing act, in all places;
- the sister's dealings;
- gauges;
- the town paying, and the wheels locking;
- the seal and the verdict;
- held or fell;
- ticker lines that are not about your ways.

**What the ear learns**
- How many arrival notes play is how many hands came to you.
- Each note's pitch and pan name the neighbour.
- A thump means your own hand was turned back.

At most 11 cue voices play in one reveal, and each node is disconnected when it ends.

**As built:** a voice rises over its attack and falls 60 dB over its decay (the decay times given here), then fades out in 20 ms. At most 12 voices sound at once: when a moment needs room, the oldest are released in 15 ms, and the newest moment is always whole.

### 4.4 The Afterwards score

- **At `afterStart`:** the bed moves under its low-pass.
- **Each season, by the clock:** one pluck (triangle, 0.5 s, -32 dBFS), pitched as `round(strip x 9)` over two octaves of the place's notes. This is the strip's height, not good or bad.
- **Each `told` line about your ways:** one bell note (note 3, -30 dBFS), the same in either direction.
- **A tent:** a wood knock at 180 Hz, -32 dBFS.
- **At `afterEnd`:** the low-pass opens over 3 s and a neutral chord plays (notes 1, 5 and the octave; -28 dBFS), the same for every outcome.

Jumps play only that chord.

### 4.5 The sound button

**Markup.** sound.js builds the button only where Web Audio exists:

`<button type="button" class="btn btn-quiet sound-btn" aria-pressed="false">` + speaker glyph SVG + `<span class="sound-word">` + label + `</span></button>`

- The label is `W.soundWord`, passed as ctx.label.
- **Glyph:** "on" adds two ink waves, so the state is shown by shape, not by colour.
- **Compact form:** in the day and Afterwards rows, and below 40rem everywhere, the word is visually hidden (`.vh`, index.html:176). The box is then 1.75rem, with a 44 px hit area made by `::after`.

**Where it sits.** On every `view` cue, sound.js moves the button by id. app.js never names it, so page-smoke's id check (page-smoke.js:1537-1543) holds.

| View | Placed |
|---|---|
| opening | after `#begin` (index.html:835) |
| day | after `#day-valley`, as a sibling (inside it, `setText` would wipe it; index.html:857) |
| leaving | after `#leave` (index.html:920) |
| afterwards | before `#skip` (index.html:936) |
| chronicle | last in `#again`'s action row (index.html:1019-1023) |

**States**
- **Off** (the default): no AudioContext exists.
- **On:** the master ramps up over 1.2 s, the bed starts, and the `on` cue plays. If `resume()` fails, the button goes back to off.
- **Turned off:** the master ramps down over 0.4 s, then `suspend()` runs, timed by a silent ConstantSource's `onended`. The music pauses.

**Memory.** `localStorage['after-you.sound.v1']` holds `'on'` or `'off'`, read and written in try/catch and named in README.md:82. By default a stored value never starts sound. `ARM_FROM_MEMORY = false` keeps the owner's alternative (8, Q4) one line away. **As built**, that alternative arms on a capturing `click` or `keydown` (a gesture on touch devices too), and a first press on the Sound button itself is left to the button.

### 4.6 A hidden tab

- **On hide:** `visibilitychange` (guarded by `typeof document.addEventListener === 'function'`) and `pagehide`. The master fades to 0 over 250 ms, then `suspend()` runs and the music pauses.
- **On return:** resume, fade up over 800 ms. Music resumes only if a track was mid-play.
- All waits run on the audio clock. Seasons that arrive while the tab is hidden stay silent.

### 4.7 The music slot

```js
var TRACKS = {        // one instrumental per place, or null; src relative, under music/
  valley: null, banks: null, watch: null, bridges: null, saltmarket: null
  // valley: { src: 'music/valley.mp3', gainDb: -16, waitS: [20, 40], fadeInS: 6, fadeOutS: 8, maxS: 150, gapS: [45, 120] }
};
```

**Validation and when a track may play**
- `src` must match `^music/[a-z0-9-]+\.(mp3|m4a)$`.
- With no valid entry there is no element, no request and no listener.
- A track plays only when sound is on, in the opening, day, leaving or chronicle views. At `afterStart` it fades out over 3 s.

**Steps**
1. **Wait** a random `waitS`, timed by a ConstantSource stopped at that time (its `onended` fires).
2. **Load lazily:** `new Audio()`, with `preload = 'none'` and `src` set, then `createMediaElementSource` into `trackGain`. Gain nodes carry the level, because iOS ignores `audio.volume`. The track streams; it is never decoded.
3. **Fade in** over `fadeInS`. **Fade out** at `min(duration, maxS) - fadeOutS`, once `loadedmetadata` gives the duration.
4. **Gap:** at the end, a random `gapS` of silence, then replay. Never a hard loop.
5. **Changes:**
   - a new place: fade out over 2.5 s, release, wait again;
   - sound off: fade out over 0.4 s and pause;
   - an error or a stall: music stays off for the session;
   - **as built**, a `play()` the browser refuses with `NotAllowedError` (it wants a gesture for the media element, as Safari may): the music is held, silent and not ended, no cue or wait plays it again, and it plays inside the reader's next click or key in a view with music (a press of the Sound button itself is left to the button; turning sound on plays it inside that press). Any other media error still ends music for the session.
   - **as built**, a `play()` still pending when the page's own `pause()` comes (sound off, a hidden page, the Afterwards, on a slow stream) is rejected with `AbortError`: not an error, so the music is not ended and plays again as it would after the pause.
6. **Ducking** as in 4.1.

**Hosting**
- **Pages:** tools/pages.sh copies only what preview.html names (pages.sh:52-67). It gains a rule to copy each registered `music/` src and to abort if one is missing.
- **Artifact:** music goes into the publish `files` map as `audio/mpeg`. This is untested (Q9).

**Brief for the owner's Suno tracks**
- Instrumental, 90-150 s, with a quiet start and a natural ending.
- No driving percussion and nothing alarm-like.
- MP3 at 192 kbps, near -16 LUFS.
- Moods: pastoral strings (Valley), low strings with sea air (Banks), sparse low winds (Border), walking-pace folk guitar (Bridges), hammered dulcimer (Saltmarket).
- Keep the generation records, and check Suno's current terms for this use.
- The owner makes the tracks in their own account. Nobody else needs that login, and nothing is requested until a track is registered.

## 5. Reduced motion, phones, performance, themes, access

**Reduced motion**
- `still()` returns `mqStill.matches` (app.js:121). The modules never call `matchMedia`, because domshim throws on unknown queries (domshim.js:166-172).
- When it is on:
  - no transients, loops, fades or light transitions;
  - light and weather are drawn statically;
  - the Afterwards jumps to its end, as today.
- index.html:805-807 gains `.fx, .fx * { animation: none !important; transition: none !important; }`.
  - **As built:** that line guards only CSS animations and transitions; motion uses the Web Animations API, which it does not touch. When reduced motion is turned on mid-session, app.js sends the `still` cue (6.3): motion stops every animation and loop it has running and settles the light, and sound ignores it.
- Sound is unaffected.

**Phones**
- Travellers are scaled by 0.857.
- The cropped day map still shows the band from 0.22 to 0.36 H.
- When the map is folded (`state.mapFolded`) or off-screen, map transients are skipped and the card glyphs carry the reveal.
- No hover effects. Transforms happen only inside clipped SVG, and HTML gets opacity only, so `scrollWidth` and `scrollHeight` cannot move.

**Budget** (a mid-range phone, or a laptop at 4x CPU throttle)

| Item | Limit |
|---|---|
| A reveal | at most 60 short WAAPI animations and 8 travellers |
| Script per cue | 3 ms |
| Loops | at most 3, stepped, about 6 frames a second or fewer |
| Long tasks | none over 50 ms in a whole Life |
| Visual effects | no SVG filters, no blur, no `requestAnimationFrame` (page-smoke.js:1583) |
| Audio | a bed of at most 10 nodes, at most 12 cue voices |
| Network | none unless a track is registered and sound is on |

**Self-downgrade.** If the first reveal finishes more than 1.5 times later than planned, loops stay off for the session. **As built**, a reveal during which the page was hidden or shown again is not judged (a hidden tab holds back the finish, not a slow device), and a later reveal measures instead; while the page is hidden its loops stop, and they start again when it is shown.

**Themes**
- Colours are set only through classes and tokens:
  - `--field` (travellers);
  - `--ink` and `--paper-raised`;
  - `--river-wash` and `--dusk`;
  - `--madder` (fire; the Border already uses it as beacon red, index.html:75);
  - `--yours` and `--yours-fill`, only for your ways.
- New tokens go only in the three valley blocks (index.html:5-52), so `placeColours` (page-smoke.js:1404-1427) and contrast.py's equality checks hold.
- No literal colours (page-smoke.js:1589). Avoid hex-like id selectors.
- Under `forced-colors: active`, `.fx` is `display: none`.

**Keyboard and screen readers**
- fx groups are `aria-hidden`, hold nothing focusable, and sit inside `role="img"` SVGs.
- Focus never moves. No control is hidden or made inert, and no live region is added: there are still exactly two (page-smoke.js:1534).
- The button is a native toggle with `aria-pressed`, named "Sound".
- No shortcut keys. No information lives only in motion or sound.

## 6. Architecture

### 6.1 Files and interfaces

**New files:** `motion.js` (`window.AYMotion`) and `sound.js` (`window.AYSound`). Each is an ES5 IIFE closed by `})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);` (as sheet.js:752).

**Rules for both files**
- No top-level `let`, `const` or `class` (dom-places reloads every script, dom-places.js:52-65).
- Nothing touches the DOM, timers, listeners or the clock at load. They must load in bare jsc (sheet-probe.js:20).
- Time comes only from `document.timeline.currentTime` (motion) and `AudioContext.currentTime` (sound), never `performance.now()`.

```js
AYMotion = { boot(ctx) -> bool /* typeof ctx.doc.documentElement.animate === 'function' */, cue(name, data), TIMING,
             _test: { revealPlan, planPlan, seasonPlan, afterPlan, lightFor, weatherFor } };     // pure planners
AYSound  = { boot(ctx) -> bool /* AudioContext or webkitAudioContext exists; mounts the button */, cue(name, data),
             TIMING, tracks(), _test: { score, bedFor, trackOk } };
// ctx: { doc: document, still(), hidden: pageHidden, sheet: sheetDef, place(), label: W.soundWord }
```

Planners return plain data such as `{target: 'map:m-hand:0-6', kf, delay, dur, ease}` or `{voice: 'arrival', at, note, pan, db}`. Unknown cue names are ignored.

### 6.2 The dispatcher (app.js, after `cancelTimers`, app.js:136-141)

```js
var FX = [], fxQuiet = false;
function cue(name, data) {
  if (!FX.length) return;                       // nothing listening: nothing built, no clock read
  var d, i;
  try { d = typeof data === 'function' ? data() : (data || {}); } catch (e) { return; }
  d.quiet = !!(d.quiet || fxQuiet);
  for (i = 0; i < FX.length; i++) { try { FX[i].cue(name, d); } catch (e) { /* the page never needs them */ } }
}
function bootFx() {
  var mods = [window.AYMotion, window.AYSound], i, ctx = { doc: document, hidden: pageHidden, sheet: sheetDef, label: W.soundWord,
    still: function () { return mqStill.matches; }, place: function () { return state.place; } };
  FX = [];
  for (i = 0; i < mods.length; i++) { try { if (mods[i] && mods[i].boot && mods[i].boot(ctx)) FX.push(mods[i]); } catch (e) { /* off */ } }
}
```

**As built:** `wire()` also listens to `mqStill` (with `onMedia`) and, when reduced motion turns on, calls `cue('still', {})`, which the dispatcher sends like any other cue (with `quiet`).

**Hooks never call `now()`.** domshim advances its clock 0.5 ms per call (domshim.js:215) and dom-harness 10 ms (dom-harness.js:24).

### 6.3 Hooks and payload whitelist (lines checked)

| Cue | Where in app.js | Keys (plus `quiet`) |
|---|---|---|
| boot | `start`: `bootFx();` after `wire();` (1625); `fxQuiet = true/false;` around `restore` (1628) | |
| `place` | end of `markPlace` (258-260) | `place` |
| `map` | `drawMap` after line 296 | `id, mode, kind, crop, day, phase` |
| `view` | end of `showView` (166-175) | `view` |
| `opening` | after `drawOpening(true);` (530); after `showView('opening');` (1434); after `showView('opening', true);` (1632) | `changed` |
| `day` | after `showView('day');` (574); after `startDay();` in `nextDay` (1050) | `day` |
| `plan` | after `drawActions(); drawWays(); drawDayMap();` (990) | `id, send` |
| `reveal` | `closeDay` after `drawDay();` (1024) | `day, lanes[{id, arrived, lost, they}], kin, kinWith[{id, kinSent, theySent}], bank{top, levels{id: [stock, stockAfter]}}/null, town, map, cards` |
| `seasonEnd` | `fb = state.follow, kb = state.keeps` before 1042; cue after `drawDay();` (1043) | `day, kin, followBefore, followAfter, keepsBefore, keepsAfter, kinCount, map` |
| `leaving` | after `showView('leaving', quiet);` (1070) | |
| `afterStart` | after `buildAfter();` (1083) | `jump` |
| `season` | end of `showSeasons` (after 1221) | `to, byClock, yours, isNew, strip, told, lines` |
| `afterEnd` | after `drawFinalWays();` (1235) | `finalYours` |
| `count` | after `a.said = true;` (1268) | |
| `chronicle` | after `showView('chronicle');` (1416) | |
| `flip` | after the toggle (927) | `on` |
| `still` (**as built**) | `wire()`: `onMedia(mqStill, ...)`, when reduced motion turns on mid-session | none: `{}` plus `quiet`. Motion stops every animation and settles the light; sound ignores it |

**Where some values come from**
- `kinCount` counts `lookingRound.kin.habits` whose `source === 'you'`, exactly as words.js:550 does.
- `town` is `townOf(params)` (app.js:265).
- `lanes` is built from `r.results` (app.js:720-721).

**Strings page-smoke matches.** No hook splits any string page-smoke matches with `has()`. For example, `'writeHash(id);\n    drawOpening(true);'` (page-smoke.js:1478) and the budget line (1574) are left whole.

### 6.4 index.html, words.js, sheet.js

**index.html**
- **Script tail (1038):** `...sheet.js"></script><script src="motion.js"></script><script src="sound.js"></script><script src="app.js"></script>`.
- **Two marked CSS blocks** before the reduced-motion block:
  - `/* ---- motion (motion.js) ---- */`, including `transform-box: fill-box; transform-origin: center` on `.m-diamond`, `.m-tent`, `.m-hand-head`, `.m-plan-tip` and `.m-lost-x`;
  - `/* ---- sound (sound.js) ---- */`.
- **Tokens:** `--dusk` and `--dusk-k`.
- **Other lines:** the reduced-motion and forced-colours lines; line 280 becomes ASCII.
- **No body markup changes.**

**words.js:** `W.soundWord = 'Sound';`

**sheet.js:** `lanes` and `lane` are added to the exports (742-751). No drawing changes.

### 6.5 Absent modules, snapshot and restore, timers

**Absent, disabled or failing modules**
- **Absent:** `FX` is empty and every hook returns at once. golden-page loads neither module (golden-page.js:14), so part 5 proves the page unchanged.
- **Disabled:** `boot` returns false in domshim and in dom-harness.
- **Throwing:** errors are caught, the drawn map is left as it is, and a failed sound is silence.

**Snapshot and restore**
- The snapshot is unchanged (app.js:1441-1443).
- During `restore`, `fxQuiet` sets states directly, with no transients and no sound.
- After a reload, audio needs a new tap.

**Timers**
- Neither module uses `setTimeout`, `setInterval` or `requestAnimationFrame`. Motion runs on WAAPI and the document timeline; sound runs on the audio clock, `onended` and ConstantSource waits.
- `later`, `every` and `cancelTimers` (app.js:125-141) are untouched.
- Motion cancels its own Animations on every `map` cue for that id, and on every `view` cue.

### 6.6 Checks

**page-smoke.js** (in the same commit as the new script tail; otherwise parts 1, 4 and 7 fail together)
- `scripts` (1433) gains both modules, so the address, `alert` and `requestAnimationFrame` bans cover them.
- The tail regex (1444) admits motion.js and sound.js after sheet.js.
- The script count (1447) becomes `6 + PLACE_FILES.length`.
- New checks:
  - `FORBIDDEN_RE` over both module sources;
  - every byte below 0x80 in index.html, app.js, words.js, sheet.js, the places and the modules (`readFile(f, 'binary')`);
  - `has(app, 'if (!FX.length) return;')` and `has(app, 'fxQuiet = true;')`;
  - every registered `src` lies under `music/`;
  - **as built**, `W.soundWord` held to the sentence rules (`sentenceFault`), since a string is not among the word functions page-smoke calls.

**run-all.sh**
- `GAME` (24) gains both modules.
- A new **part 15** runs `checks/page/motion-sound.js` on the working tree only. It prints PASS or FAIL and an fnv of its log.
- **As built**, part 15 runs strict: a check that waits for a module that boots fails, unless `AY_FX_STUB=1` is set. A module in the game folder that declines to boot fails, strict or not.
- Run with `AY_REF=v0.2.1`; the default is still v0.2.0 (run-all.sh:20).

**Part 15** (jsc):
1. **Loading.** Each module loads twice in bare jsc, domshim and dom-harness without throwing, timers, `shim.media` entries, listeners or extra globals.
2. **Disabled.** With the modules present but disabled, a whole Life reads `performance.now()` exactly as often as without them, and gives equal hashes.
3. **Stubbed.** Stub `EP.animate`, `document.timeline`, `AudioContext`, `Audio`, `fetch`, `XMLHttpRequest` and `document.addEventListener`. Count timer and clock calls made by the modules. Run two Lives per place at 400x800 and 1280x800, and check:
   - payload keys stay within 6.3;
   - no AudioContext exists before the button is clicked, and exactly one after;
   - with `TRACKS` empty there are zero `Audio`, `fetch` and XHR calls; with a test registry, one relative `Audio` appears after the wait;
   - the modules make zero timer or `performance.now()` calls;
   - reduced motion gives zero `animate` calls, and `quiet` gives zero transients;
   - once stubs finish, every map's innerHTML minus `.fx` equals the no-module run's;
   - windows match 2.2 and 2.4, and lane slots are the same for every outcome;
   - the Afterwards ends by 21 s with the same count slices;
   - **as built:** each module in the game folder boots there; under reduced motion every reveal sounds as ever (the reveal's own voices counted, not the bed's) with the count-ready sound of the moving Lives; a restore into a day, Leaving and the Afterwards sends every cue after the Opening's map quiet, with no transient and no sound. Turned in the middle of a Life: reduced motion turned on sends a `still` cue, after which nothing runs (the Afterwards' light set at its rest) and `sound.js` moves nothing; the first reveal's finish held back by a hidden page keeps the loops, held back as long with the page in front turns them off; a second Life's day 1 light moves from the Afterwards' rest; a bed one-shot sounding as a reveal comes is released within 15 to 20 ms; a track whose `play()` is refused with `NotAllowedError` is held and plays at the next click; a pending `play()` cut short by the page's own `pause()` (`AbortError`) does not end the music; the page hidden, shown and hidden again suspends the audio once, after the last fade; with the memory option switched on in a copy, a first press on the Sound button leaves sound on, and a first press elsewhere starts sound in its click, not its pointerdown.
4. **Twins.** The check alone, never the page, classifies each `they === false` lane as luck or choice. It recomputes the neighbour's intent and the ford with `AfterYou.draw`, `PURPOSES.ACT` and `PURPOSES.FORD`, `houses[x].custom` and `params.FOG` (engine.js:980-987). Equal (place, kind, crop, day, lane, your state) must give byte-identical logs.
5. **Calendar.** `.fx-wx` lies at y <= 0.36 H and clear of holdings. `lightFor` and `weatherFor` do not depend on the seed. The Border's dusk does not change with the day.
6. **Geometry.** The lane `d` strings equal the drawn `.m-hand`, `.m-lost`, `.m-stay` and `.m-plan` for every place, sheet kind and crop, under sheet-probe's PLANNED and REVEALED (sheet-probe.js:42-49). **As built**, the card glyph of a hand turned back ends as `.key-lost` rests: no dash pattern in its keyframes but the style sheet's, whole periods of it at both ends, the last frame opaque.
7. **Planted faults must fail:**
   - a payload carrying `why`;
   - a module `setTimeout`;
   - an `https` string;
   - a twin mismatch;
   - a non-ASCII byte;
   - "soft" in a module;
   - **as built:** a `sound.js` that mutes every cue under reduced motion, a restore that is not quiet (`fxQuiet = true;` written `fxQuiet = false;` in a copy of app.js), and each fix of the review undone in a copy (no `still` cue in motion.js or app.js, the first reveal judged across a hidden page, the card glyph drawn on solid, the Afterwards' rest not kept as the last light, a one-shot left to sound through a reveal, music ended when `play()` is refused or when the page's own pause cuts a pending `play()` short, a first hide's wait suspending through a later hide's fade, the memory option taking a first press on the button as its own or starting at a pointerdown, the `still` cue taken as input).

**Other checks**
- **dom-run.js / run-dom.sh:** a 28th configuration, `fxThrow`. Modules whose `boot` returns true and whose `cue` throws must pass a whole Life with the same clock reads.
- **contrast.py:** the strongest dusk over `--paper-raised` keeps `--field`, `--river` and `--ink-soft` at 3:1 or more in both themes.
- **preview.html:** `python3 checks/page/preview.py --write`.

**Expected fingerprints** (checks/BASELINE.md:9-18)
- **Identical:**

  | Part | Value |
  |---|---|
  | 3 | `8039556e...` |
  | 4 | `6d84219b` |
  | 5 | `abf3fee6` / `7a78d3e9` |
  | 6 | `c8f9bb5d` |
  | 7 | `5ac5fa25` |
  | 10 | `035800f1` |
  | 12 | `e95ec1c3` / `0e6f0738` |

- **Pass:** parts 8, 9, 11, 13 and 14.
- **New:** part 15.
- **Any change in those hashes is a bug**, not a reason to re-baseline.

## 7. Work packages

### WP-I: Integration (first and last)

**Owns:**
- app.js;
- in index.html, the script tail, line 280 and the empty marked CSS blocks;
- `W.soundWord` in words.js;
- the sheet.js `lanes` and `lane` exports;
- page-smoke's tail, count and `scripts` edits;
- `GAME` in run-all.sh;
- preview.html;
- the LEAD-DECISIONS note;
- the artifact `files` map.

**Stage a (scaffold, half a day)**
- The dispatcher and every hook in 6.3.
- Stub modules whose `boot` returns false.
- A private beep-test artifact, to prove audio starts inside the claude.ai frame.

**Stage a is accepted when:**
- `run-all.sh v0.2.1` passes all 14 parts with the 6.6 hashes identical;
- `fxThrow` passes.

**Stage b (merge)**
- The full suite, including part 15.
- The browser matrix:
  - 1280x800, 1366x700, 1440x960 and 400x800;
  - light and dark;
  - five places;
  - reduced motion on and off;
  - sound on and off;
  - a hidden tab in the Afterwards;
  - a hot-reload restore;
  - both modules deleted.
- Autoplayer and stepper heights and boxes equal to the pre-pass runs.
- Real iOS Safari and Android Chrome.
- Tag v0.3.0 and publish.

### WP-M: Motion

**Owns:** motion.js, the motion CSS block, and `--dusk` / `--dusk-k` in the valley token blocks.

**Contract:** 6.3 payloads, `TIMING` (2.2), `AYSheet.lanes`, and the `_test` planners.

**Accepted when:**
- part 15 sections 1-6 pass for motion;
- each row of 2.3-2.6 matches in the browser matrix;
- reduced motion gives zero animations;
- 1 s after a transient, only the named loops remain (3 or fewer), and the markup minus fx equals a fresh draw;
- Next day at 350 ms lands at rest;
- a phone trace shows 3 ms or less per cue and no long task.

### WP-S: Sound and music

**Owns:** sound.js, the sound CSS block, the music rule in tools/pages.sh, and the README storage and music paragraphs.

**Contract:** 4.1-4.7, the 6.3 cues, and `TIMING`.

**Accepted when:**
- part 15's sound checks pass;
- the button appears only with Web Audio, toggles `aria-pressed`, and survives storage failures;
- a hidden tab suspends sound;
- peaks stay at or below -18 dBFS through a reveal, measured with a debug AnalyserNode;
- two Lives per place are heard without fatigue;
- pages.sh builds the v0.2.1 site unchanged;
- a scratch registry with a 1 s silent `.m4a` (made with the built-in `afconvert`) loads only after sound is on and the wait has passed.

### WP-C: Checks

**Owns:**
- checks/page/motion-sound.js;
- part 15 in run-all.sh;
- page-smoke's checks beyond stage a;
- dom-run.js and run-dom.sh;
- contrast.py;
- checks/README.md;
- BASELINE.md (with WP-I at the tag).

**Contract:** the whitelist (6.3), the planner shapes (6.1), and the windows (2.2-2.4).

**Accepted when:**
- every planted fault fails;
- part 15 passes against contract stubs, then against the real modules.

### How the packages split the files

After stage a, WP-M, WP-S and WP-C own disjoint files. In index.html:
- WP-I has the tail and line 280;
- WP-M has the motion block and the tokens;
- WP-S has the sound block.

## 8. Risks and open questions (with my recommendation)

**Owner decisions**
1. **Q1. A gate for a neighbour's missing act?**
   - Recommendation: no. On their side, a gate asserts a choice that may have been luck.
2. **Q2. A boat and a cart travelling?**
   - At the Banks, a boat crossing means fishing across.
   - At the Bridges, the cart that crosses is the one that drove on.
   - Recommendation: a fish, and a cap with carts that draw aside or come on.
3. **Q3. Weather?**
   - Recommendation: calendar only, in the far band. No tide change, no rain, and nothing deepening at the Border, so nothing teaches that luck varies by day.
4. **Q4. Start sound from memory?**
   - Recommendation: keep the strict promise. `ARM_FROM_MEMORY` is the one-line alternative.
5. **Q5. Show which house a way came from?**
   - The ticker never names that house.
   - Recommendation: no, unless the ticker names it first.

**Risks for the build**
6. **Reveal speed.** A figure crosses about 90 px in 280 ms. If it reads as a streak, raise LINE, at most to 400 ms.
7. **Safari and WAAPI on SVG.** Test stroke-dash and transform-box first. Fallbacks: opacity-only lines and a translated gate.
8. **Audio in the claude.ai frame is untested.** Stage a runs the beep test. If the context stays suspended, show no button there.
9. **`audio/mpeg` through the artifact `files` map is untested.** Test with a 1 s silent file. If it is refused, music plays on Pages only and fails quietly elsewhere.
10. **Afterwards jank under `pump`.** Stepped light and 16 tweens or fewer should be fine. Leave the budget line (page-smoke.js:1574) alone unless a phone trace shows jank.
11. **Fatigue.** The owner hears two whole Lives before tuning levels.
12. **Laptop room.** If the autoplayer shows any height change on the 1280x800 day, move the day anchor into `#map-bar`.
13. **Tilt.** Trial it later, and only if there is no lettering blur and no `scrollWidth` change.
14. **The stand-in DOMs never run real animation or audio.** The whitelist, the twins and the stubs, plus the browser matrix, carry the rules.
15. **Suno.** The owner exports the tracks and registers them in `TRACKS`. Nobody else needs the owner's login.

## Checklist for verification

- [ ] **Theory words.** "Sound" is the only new visible word. `FORBIDDEN_RE` passes over both modules and over `W.soundWord`.
- [ ] **Luck or choice**
  - [ ] Missing acts are keyed only on `they`, `kinSent` and `theySent`.
  - [ ] Each place has one neutral image: nothing in the Valley, and the Banks net settles.
  - [ ] Missing acts make no sound.
  - [ ] The twins test passes, and a planted `why` fails it.
- [ ] **Engine.** engine.js is unchanged. Every number comes from the engine, and the modules show none.
- [ ] **ASCII and no build.** Every page file is ASCII, including index.html:280. Nothing is installed and there is no build step.
- [ ] **Places.** Valley, Banks, Border, Bridges and Saltmarket each match 2.4, 2.6 and 4.2 in the browser.
- [ ] **Calendar.** Weather lies at y <= 0.36 H and depends on the calendar only. At the Border, dusk and mist are the same every day.
- [ ] **Reduced motion.** Zero animations and static light. The Afterwards jumps, and sound is unaffected.
- [ ] **Sound off by default.** No AudioContext exists until the Sound button is tapped, on every visit. A hidden tab suspends sound.
- [ ] **Music slot inert.** With `TRACKS` all null: zero `Audio`, `fetch`, XHR and listeners, and the same Pages site.
- [ ] **Phones.** At 400x800 there is no new scroll, travellers are scaled, and the card glyphs carry the reveal.
- [ ] **Light and dark.** The matrix passes in both themes, contrast.py's wash check passes, and `.fx` is hidden under forced colours.
- [ ] **Stand-in DOM checks.** Parts 5, 6, 8, 9 and 12 pass with identical hashes. `fxThrow` passes.
- [ ] **Autoplayer.** Whole Lives at the four sizes with motion and sound on. `scrollHeight` and `scrollWidth` equal the pre-pass runs.
- [ ] **Snapshot and restore.** The snapshot is unchanged. A restore lands at rest, with no transients and no sound.
- [ ] **Run-all.** All 14 parts pass against v0.2.1 with the 6.6 hashes, and part 15 passes.
