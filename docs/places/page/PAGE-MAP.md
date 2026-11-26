> **Record of its time.** Written 2026-11-23 01:03 (local time, UTC+10) for v0.2.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../../checks/). Where it disagrees with [LEAD-DECISIONS.md](../LEAD-DECISIONS.md) or with the code, those win.

# PAGE-MAP: where the valley is written into the page, and what a Place must supply

Scope: `index.html` (855 lines), `words.js` (623), `app.js` (1,771), `page-smoke.js` (654) of the
published game, read in full, with `UI-SPEC.md`, `SPEC.md`, `design.md`, `atlas.md` and the header
of `engine.js`. Nothing in the game folder was changed (md5 before and after: engine
`6090c8f6…`, words `3ead6e87…`, app `7cc2c80f…`, index `ee06a31a…`, page-smoke `fc99d279…`).

All references are `file:line`. "Reach" means: the number of public `AYWords` functions whose
output can contain the word, directly or through a helper they call.

## 0. What was measured and what is only argued

Measured (scripts are in this folder; each is read-only and runs in jsc from the game folder):

| What | How | Result |
|---|---|---|
| The page check as published | `golden-words.js` (runs `page-smoke.js` with one hook) | PASS in 24.4 s; 114 Lives; 104 of 104 word functions; 362,279 sentences |
| Fingerprint of every sentence the check sees | same run, FNV-1a over function name + sentence, in order | `20bddf72` (10,913,441 characters); same on a second run |
| Fingerprint of the page itself | `golden-page.js`: `app.js` in the stand-in DOM (`../../domshim.js`), one whole Life at 400x800, 1280x800, 1280x1100, 168 steps | page `72a7c55d`, the four maps' SVG `7a78d3e9`; same on a second run; 2.7 s |
| Vocabulary census | `vocab.js`, `vocab2.js` (output in `vocab.out.txt`) | section 1 |
| What the page check catches when a rule moves | `probe-overrides.js` with `{"FOG":0.10}`, `{"B":5,"C":2}`, `{"HOLD_LINE":0.6}` | all three PASS while the page still prints "costs you 1 … worth 3" and "at least half" |
| Room on screen | the local preview (`preview.html` = a wrapper plus `index.html` byte for byte), in a browser: valley 48213 at 1280x800, a random valley at 400x800 | section 4.1 and 3.2(d) |
| Who supplies copy | grep | `app.js` has 119 calls to 100 of the 104 word functions; its only own text on screen is `'1'`, `'10'`, `'20'` (app.js:1299-1301) |

Argued, not run: everything about dials the engine does not have yet (other kinds of luck, a
stock, a stranger, an inverted Mark, s and h). No engine with those dials existed when this was
written, so sections 3.2, 4.4 and 5 describe what the code would do by reading it. Every size
estimate in section 5 is a guess from the measured sizes of today's files.

The stand-in DOM has no CSS: `golden-page.js` proves markup and SVG, not layout.

## 1. Vocabulary

### 1.1 Where the words live

- `words.js`: 104 public functions, 17 helpers, 3 constant lists. 372 copy literals, 329 distinct,
  1,703 words (measured, `vocab2.js`).
- `app.js`: no vocabulary of its own. What it does own is drawn vocabulary (the sheet, the keys,
  the result glyph, the seal: section 2) and fixed counts (section 3).
- `index.html`: 43 text nodes at rest (lines 642-846). All 43 are written again from `words.js`
  before they are seen: `fillStatic` (app.js:727-752) at the start, `drawDay` (831) and
  `drawActions` (896-902) when a Life begins.
  So a change of place is `use the lexicon; fillStatic(); drawOpening()`, and the markup at rest
  can stay the valley's. The check compares 14 of them with `words.js` (page-smoke.js:566-568,
  601-602). Valley nouns also name ids, classes and colour tokens (`#ford-note`, `.m-river-bank`,
  `.m-furrow`, `--river`, `--field`, `--madder`): never on screen, leave them.
- `engine.js` (not in the brief's list, but it puts words on screen): the five situation titles
  (engine.js:406-412: "Meeting someone new", "After you both helped", "After they left you short",
  "After you left them short", "After you both stayed home") reach the page through
  `ways()[s].title` and `today().neighbours[i].situationTitle` (app.js:682, 698, 1042), and the
  sixteen family names (engine.js:413-414). A place needs its own five titles; the page should
  take them from the lexicon by index and stop printing the engine's.

### 1.2 Census (measured)

"Direct" counts pieces of `words.js` (functions, helpers, lists) whose own strings contain the
word. Full lists with line numbers are in `vocab.out.txt`.

| Family | Direct | Reach | Chief places (words.js) |
|---|---|---|---|
| hand, hands | 30 | 26 | opening:40-41, yesterday:152, reveal:193, knowValue:174, deed:264, wayCount:330, kinChange:340, fordNote:391, flowLabels:424, houseAtEnd:443, lastDayLine:587, mattered:596 |
| send, sends, sent | 19 | 20 | send:163, chooseLine:166, knowValue:174, hereYou:245, deed:264, elsewhere:319, leaveNote:408 |
| stay home (all forms) | 18 | 16 | stay:164, mapAltDay:90, yesterday:161, reveal:201, KNOW_ROWS:170, WHERE_THEY:211, DEED_SIT:213, kinChange:342-344 |
| "against" (stay home against X) | 3 | 5 | mapAltDay:90, deed:265, lastDayLine:589 |
| arrive, arrived | 7 | 8 | opening:41, legendDay:110, fordNote:392, flowLabels:426-429, rowsExplain:555 |
| reach, reached | 3 | 4 | opening:41, yesterday:156, reveal:197-200 |
| came, come ("none came", "no hand came") | 8 | 8 | yesterday:155-161, reveal:196-201, knewLine:232, youLines:280 |
| both ways, went either way | 8 | 9 | yesterday:158, reveal:198, elsewhere:321-324, the three situation lists, lastDayLine:589 |
| left short, leaving short | 4 | 4 | KNOW_ROWS:170, WHERE_THEY:211, DEED_SIT:213, whyThird:309 (and the engine's titles) |
| ford | 10 | 11 | mapLabels:62, mapAlt:73-74, legendDay:111, yesterday:155, reveal:196, fordNote:392, oneFuture:420, rowsCaption:548, rowsExplain:554, mattered:598 |
| turned back | 4 | 5 | legendDay:111, yesterday:155, reveal:196, fordNote:392 |
| ridge | 2 | 2 | mapLabels:63-64, mapAlt:73-74 |
| measure, measures | 3 | 9 | measures():19 (store:142, oldWay:146, leavingStore:402, houseAtEnd:444), opening:41, legendAfter:121 |
| grain, crop | 1 | 1 | opening:40-41 |
| store, winter | 3, 2 | 5, 4 | storeHead:141 (dayTotal:206, leavingStore:399), opening:43, lastDayLine:592 |
| harvest | 4 | 4 | opening:38, oldWay:146, seasonEnd:370, leavingHead:397 |
| valley | 16 | 16 | opening:38,43, pastLife:50, valleyNo:56, mapAlt:72-74, mapAltDay:82, leaveButton:414, flowLabels:429, futureEnd:499-500, heads:515, valleyLine:527, rowsExplain:554, rangeNote:565, rangeLabels:578, lastDayLine:590, seal:594, againSame:620 |
| house, houses | 22 | 29 | house:27, House:28, kin:29, closeDay:184-185, sourceLines:289-292, reconsidered:355-364, seasonEnd:371,387, waysEnd:503-506, heads:514, seal:594 |
| holding | 6 | 7 | mapLabels:65, mapAlt:72-74, bearingSay:106, mapHint:132, leaveSub:405, futureLines:465-466 |
| sister, her, she | 4 | 15 | kin:29, mapLabels:67, reconsidered:357, futureLines:465 |
| heir | 4 | 6 | heir:31, mapLabels:66, leaveSub:405, leaveNote:410 |
| way, ways | 26 | 26 | waysHead:329, wayHere:331, waysNote:332, kinFollows:337, reconsidered:353-364, futureLines:473-489, waysEnd:503-506 |
| the old way | 6 | 6 | oldWay:145, leaveNote:410, valleyLine:527, rowLabels:545, rangeNote:566, rangeLabels:575 |
| season; day | 12; 14 | 13; 16 | dayOf:138, dayTrackAlt:140, nextDay:188, seasonEnd:370-371, afterHead:418, seasonCount:422 |
| future, futures | 14 | 14 | oneFuture:420, counting:449 and the Chronicle (526-609) |
| held, holds; fell | 13; 2 | 13; 2 | legendMarks:126, flowLabels:429, flowAlt:439, futureEnd:499-500, valleyLine:527, markMeans:537, rowAlt:551, rowsExplain:555, rangeLine:559, rangeNote:568, rangeLabels:578, lastDayLine:590, mattered:604-606 |
| mark; seal, better off | 5; 3 | 5; 3 | pastLife:51, markLine:531, markMeans:536, markNoise:542; opening:43, seal:594 |
| newcomers | 3 | 4 | legendAfter:123, houseAtEnd:445, futureLines:464 |
| luck | 4 | 4 | oneFuture:420, rowsCaption:548, rowsExplain:554, mattered:598 |
| fixed counts in words (twelve, 12, 4, 5, thirty, 30, ten, 16, 200, thirteen) | 16 | 18 | section 3.1 |

By what a place would have to replace (measured, 329 distinct literals):

| Group | Literals | Words |
|---|---|---|
| carry the skin (the two acts, luck, goods, the place, the sheet) | 133 | 963 |
| no skin word, but name the actor (house, heir, neighbour, newcomers) | 29 | 176 |
| neither, but carry the charter or the custom (held, fell, the old way) | 8 | 22 |
| none of these: can be shared by every place | 159 | 542 |

So a place rewrites between 133 strings (if its actors are still "houses" and its charter is the
default) and 170 strings, about 1,000 to 1,150 words, out of 329.

### 1.3 Built from parts, or written whole

- Of the 104 functions, 39 take no argument and return fixed copy (opening, mapLabels,
  legendDay, send, stay, fordNote, leaveSub, flowLabels, heads, seal …). The three counts below
  add up to the 104.
- 76 functions use only their own strings (fixed, or a template with numbers and names dropped
  in, or a branch between whole sentences: `yesterday` 6 outcomes, `reveal` 6, `futureEnd` 4,
  `closeDay` 3, `markMeans`, `leaveNote`, `pastLife`).
- 25 functions are built from other pieces: `who` from `house`/`House`/`kin`; `store`,
  `oldWay`, `leavingStore`, `houseAtEnd`, `legendAfter` from `measures()`; `dayTotal` and
  `leavingStore` from `storeHead` + `store`; `deed` from `who` + DEED_SIT; `why`, `whyThird`
  from `sourceLines` (which calls `youLines`, `knewLine`, `hereYou`, `pickDeeds`, `deed`);
  `seasonEnd` from `kinFollows`, `kinChange`, `reconsidered`; `lastDayLine` from `store` +
  `listHouses`; `futureLines` from `house`, `kin`, `heir`; `mapAltDay` from `who` + `reveal`;
  `became` from `futureLines` + `waysEnd`.
- 3 return numbers only (`num`, `signed`, `markNumber`).
- Distinct sentence shapes seen by the check (digits and family names blanked): 1,030, of which
  637 are `mapAltDay` (it joins up to nine clauses). Without it: 393 shapes. The largest:
  `why` 47, `whyThird` 32, `seasonEnd` 28, `deed` 20, `reveal` 13, `futureLines` 13,
  `houseAtEnd` 12, `lastDayLine` 10, `mattered` 9.
- Grammar that is done in code and must survive a lexicon: singular and plural (`measures()`:19,
  `times()`:18, house/houses:185, "house keeps"/"houses keep":505, future/futures:536,
  point/points:543, life/lives:55); capital at the start of a sentence (`who(…, cap)`:30,
  `kin(cap)`:29, `heir(cap)`:31); `lowerFirst` (20) applied to a reveal sentence inside
  `mapAltDay`:87; one and many in `lastDayLine`:588-590 ("with each", "each of them"); the list
  with "and" (`listHouses`:581-586); kin's pronouns ("she":357, "Her":465).

### 1.4 What a lexicon has to supply for the valley to come out byte-identical

Two layers. The valley's values are today's literals, moved, not rewritten.

Layer A, 16 atoms in about 85 forms, each form one the code uses today:

| Atom | Valley | Forms the code uses |
|---|---|---|
| actor | house | one, many; "the {N} house" / "The {N} house"; "the {N} way"; "the {N} holding"; "house keeps" / "houses keep"; heading "House"; "your house" |
| kin | your sister's house | lower and capital; sheet label "your sister"; "your sister's way"; "your sister's holding"; she / Her |
| heir | your heir | lower and capital; sheet label "Your heir" |
| seat | holding | "Your holding"; "a holding on the map"; "takes the holding"; "of your holding" |
| place | valley | "the valley"; "a valley of eight houses"; "Valley {seed}"; "Valley no. {seed}"; "Leave the valley"; "Live this valley again"; heading "Valley"; "Map of the valley" |
| goods | measure | one, many; "of your own grain" |
| store | Winter store | head; "your store" |
| span | harvest | "Twelve days of harvest"; "this harvest"; "The harvest is in"; "The end of the harvest" |
| the act | send a hand | button "Send a hand"; "send a hand"; "sends a hand"; "sent a hand"; "sent a hand to {x}"; "a hand"; "hands"; "A hand sent"; "With a hand sent to {x}"; "A hand planned to {x}."; tally "sent a hand {h} of {n}" |
| the other act | stay home | button "Stay home"; "stay home"; "stays home"; "stayed home"; "stayed home against {x}"; "Staying home against {x}."; "you stay home" |
| arrival | arrive | "arrives", "arrived", "reached", "came", "got through", "none came", "no hand came", "None came back", "None went back" |
| luck | the ford | "turned back at the ford"; "luck at the ford"; "the luck of the ford"; sheet label |
| far line | the ridge | "the ridge"; "beyond the ridge" |
| custom | the old way | lower and capital; "The old way's marker"; its gloss in plain words |
| charter | held / fell | "held", "fell", "holds", "held, barely", "fell, barely", "better off" |
| titles | (engine today) | the five situations in the reader's words |

Layer B, whole strings and templates, by screen. The count of entries is a guess: the measured
170 place-owned literals become fewer once the fragments of one sentence are joined into one
template and more once each atom is given all its forms; the 159 shared strings sit in a base
that every place inherits.

- Opening: premise, four lines, title, begin (7).
- Sheet: 7 labels, 3 text alternatives, the `mapAltDay` clauses (8), 6 + 4 + 2 + 5 key items,
  hint, bearings (4 x 3).
- Day: track and store lines (6), the custom's sentence, 6 `yesterday`, 6 `reveal`, choice line,
  5 "what you know" rows + 4 lines, 3 button states, day total.
- Why?: 5 + 5 + 5 situation phrases, 7 `knewLine`, 3 `hereYou`, 2 `deed`, 6 source lines, the
  third-party variants (7), 4 `elsewhere`.
- Season's end: 3 heads, intro, kin line, 4 `kinChange`, 7 `reconsidered`, the empty line.
- Leaving: head, 3 store lines, 2 notes, sub, button.
- Afterwards: head, one-future line, strip (4 labels + the words alternative), 6 event
  templates, 4 + 3 closing lines, `houseAtEnd`.
- Chronicle: 7 heads, house line, valley line, mark (3), rows (4), range (line, note, 5 labels),
  last day, seal, mattered (5 fragments), past life line, 2 buttons.

Mechanism that keeps the valley identical: keep every function's logic and signature, replace
each literal with a lookup in the lexicon in force, with named slots. Do not build a grammar
engine. The proof is `golden-words.js` printing `20bddf72` again, and `golden-page.js` printing
`72a7c55d` / `7a78d3e9` again, before any new place is added.

### 1.5 Sentences that swapping words cannot reach (a place writes its own)

1. The Opening's premise and four lines (words.js:38-43; index.html:650-655). Each line states a
   rule: the choice, the stakes, the copying and its clock, the two results.
2. The custom in plain words: "The old way, which is to send a hand to someone new and then do
   as they did yesterday …" (144-147). Under dial D4 this is the place's own sentence.
3. The luck note: "A hand can be turned back at the ford. It then costs nothing and brings
   nothing. You only ever see whether one arrived." (391-393; index.html:727).
4. The outcome sentences: 6 of `yesterday` (152-162), 6 of `reveal` (193-204), 4 of `elsewhere`
   (319-325). They are idioms of a hand as a traveller ("Hands went both ways", "None came
   back", "Theirs reached you", "They saw only that none came") and they carry the rule that a
   missing hand is never called a choice.
5. The five situations, five times over: the engine's titles (engine.js:406-412), KNOW_ROWS
   (170-171), WHERE_THEY (211-212), DEED_SIT (213-214) and the list inside `whyThird`
   (308-310). "Left short" has no part to swap. 25 strings.
6. The charter's sentences: `flowLabels().rule` (429), `rowsExplain` (552-557), `futureEnd`
   (497-501), `valleyLine` (526-529), `markMeans` (533-538), `rangeLine` (558-561),
   `rangeLabels().axis` (578), `seal` (594), `lastDayLine` (587-593), `mattered` (596-610), and
   the Opening's fourth line. With the default charter they survive a swap of "the valley" and
   "hands" if the place can be said to "hold" and "fall"; with an inverted charter they are
   rewritten (section 3.2 b).
7. Kin: "Her line ends there." (465), "which she had from you." (357).
8. Sheet words: `mapLabels` (60-70), `mapAlt` (71-75), the key item "your hand, turned back at
   the ford" (111), "field filled by how freely the house sends hands" (120).
9. The span's names: "The end of the harvest" (370), "The harvest is in" (397).

Reachable by a swap, given the atoms and an act of the same grammar (something one side sends
toward the other, which then arrives or does not): `knowValue`, `wayCount`, `knewLine`,
`hereYou`, `deed`, `youLines`, `kinChange`, `leaveNote`, `legendWays`, `chooseLine`, the plan
clauses of `mapAltDay`, `closeDay`, `houseAtEnd`, `flowLabels().head`, `flowAlt`, `store`,
`leavingStore`, `dayTotal`, `pastLife`, `valleyNo`, `leaveButton`, `againSame`, `oneFuture`,
`rowsCaption`, the null branch of `mattered`.

If a place's kind act is a restraint (hold a price, leave a stock alone, not build), "sent",
"arrived" and "turned back" have nothing to attach to, and group 4 and most of the swap list
turn into group-6 work. Keeping every place's kind act a thing that travels along the tie is by
far the cheapest choice for the page (argued).

## 2. The sheet

### 2.1 How it is drawn

One pure string builder, `mapSVG(kind, mode, o)` (app.js:447-571), in four modes: `sheet` (the
Opening), `day`, `leaving`, `after`. `drawMap` (590-596) picks the sheet size from the box's
own width (`sheetFor`, 583-587: under 34rem the compact sheet) and enlarges lettering for a
narrow box (`letterUp`, 237-242).

| Piece | Where | Notes |
|---|---|---|
| Two sheet sizes | LAYOUT (216-219) | wide 600x450, compact 380x300; parcel `pw` x `ph`, house `hb`, ring gap `bound`, four lettering sizes, `pad`, `grid`, river and water widths, `ford` radius, `lane`, arrow `head`, `crop` |
| Eight positions | POS (220), fractions of the sheet | 0 at the foot (0.50, 0.845); 1 east, 2 north-east, 6 north-west, 7 west; 3, 4, 5 across the top (y 0.13 to 0.165) |
| Sixteen ties | TIES (225-232), BEND (223-224) | ring distance 1 and 2; twelve are bent; each a 40-step curve (`quadLine`, 270-278; built in `geo`, 331-333) |
| River | RIVER (221), nine points, smoothed (`catmull`, 253-269; 329) | two strokes, bank and water (468-469) |
| Ridge | RIDGE (222), nine points (330) | a line and hachures on every other vertex (461-466) |
| Ford | `crossing` (287-295), `g.fords` (334) | where each of your four ties meets the river; a circle each (482-485). If no meeting is found it falls back to 40% along the tie (293-294) |
| Holding | `holdSVG` (405-435) | parcel, three furrows, house square; diamond for "keeps your ways"; five arcs on the ring, one per situation learned from you (415-417); dotted ring for kin (413); dashed outline for an unseen house (409-411); in `after` a fill by help rate, a tent for newcomers and ids `af-hold-`, `af-fill-` (408, 422, 430); a hit box (431-433) |
| Ties as drawn | 471-479 | in the Life: 4 yours (`is-mine`), 3 between neighbours, 6 with one far end (`is-far`, dotted), 3 between far houses not drawn; in `after` all 16; every tie carries `data-tie` |
| Hands | 494-527, `arrowSVG` (351-359), `barSVG` (360-364), `crossSVG` (365-371) | arrived: arrow in its own lane, to the right of travel; planned: a stub to short of the ford with an open tip (514-517); stay home: a bar at your gate (512, 518); kin's dealings with other neighbours (520-526) |
| Lost hand | 507-511 | the same lane, dashed, no head, crossed out at the ford |
| Labels | `labelAt` (372-386), `textSVG` (388-392), `nameRoom` (398-402), 529-556 | names below a holding; beside it for 2 and 6; above for the far three; kin's second line above the east and west holdings because the river runs just below them (383-385); "the ridge" (533), "the ford" at a fixed point (534), "beyond the ridge" over house 4 (529-532) |
| Opening demo | 495-497, 557-563 | one hand from you to house 1, with `W.signed(-1)` at your end and `W.signed(3)` at theirs |
| North mark | 564-568 | the cards' E, NE, NW, W are bearings from your holding |
| Phone crop | `top`, 452-456; `crop` in LAYOUT | the day map is cut above the ridge; the far three and their label are left off (489, 529) |
| Afterwards | `drawSeason30` (1325-1343), `drawFinalWays` (1346-1352), `fitAfterName` (1317-1324) | fills, numbers, names, tent and diamond are set on the drawn sheet by id, season by season |
| The key | `keySVG` (624-646), `legendInto` (647-656), set up in `fillStatic` (745-749) | day: arrived, turned, planned, home, follows, keeps, hint; after: help, income, keeps, newcomer; marks: held, fell, sent, stayed, fresh, ghost |
| Other drawings of the valley | `exchangeGlyph` (657-666), `sealSVG` (1539-1549) | the result glyph is you, the river, them; the seal is a parcel with its house |

### 2.2 Structural (keep for every place)

- The eight positions. They are tied to: the bearings in the engine's order (words.js:104-106);
  the cards' places two by two (index.html:325-328; `CARDS_BY_ROW`, app.js:1091; pinned by
  page-smoke.js:574-576); the special cases in `labelAt`; the phone crop, which needs the far
  three in the top band; `isFar` (233). Moving a position costs all of these. Recommended: no
  place moves a position.
- The sixteen ties and their bends, the four classes of tie, `data-tie` on each.
- Four neighbours near, three far behind one line that hides them in the Life.
- One crossing on each of your four ties: the lost hand, the planned stub and the ford mark are
  placed by it.
- The holding's box, its ring of five arcs, the diamond, the dashed unseen box, the fill and
  number in the Afterwards, the hit box, the ids `drawSeason30` writes to.
- Lanes, arrow, bar, cross, stub; frame, grid, clip, north mark, lettering sizes.

### 2.3 Decoration (a place can replace)

- The barrier curve and how it is stroked (river: could be a reef, a road, a wall, a tide line).
- The far line and its texture (ridge with hachures: could be a headland, a customs wall, a
  horizon).
- The crossing mark (ford circle: a gate, a buoy, a toll post).
- The body inside a holding's box (field and house: a boat, a stall, a tower).
- The three fixed notes and where they are lettered.
- The barrier inside the result glyph and the "turned back" key item; the seal's device.
- The colour tokens, by a block per place in the token section only (the check allows no literal
  colour after the token blocks: page-smoke.js:603-605), three blocks each: light, dark by
  media, dark by attribute (index.html:5-52).
- The words: `mapLabels`, `mapAlt`, the key items.

### 2.4 What a sheet definition needs

```
sheet: {
  barrier:  { points: [[x, y] x n], smooth: 10, draw: 'stream' | 'reef' | 'road' | 'wall' | … } | null,
  farLine:  { points: [[x, y] x n], smooth: 8,  draw: 'scarp' | 'shore' | 'wall' | … },
  crossing: 'ring' | 'gate' | 'buoy' | 'gauge',        // 'gauge' when a stock is shown there
  body:     'field' | 'boat' | 'stall' | 'tower',      // drawn inside the pw x ph box
  notes:    [{ key: 'barrier' | 'farLine' | 'beyond', x, y, water: bool }],
  glyph:    { barrier: '<path …>', seal: '<…>' },      // for the 58x24 result glyph and the seal
  demo:     { to: 1 }                                  // the Opening's one hand
}
```

with the lexicon giving the words. Rules a definition must pass (checkable in jsc if the
geometry is in a file jsc can load, section 5):

1. The barrier meets each of the ties 0-1, 0-2, 0-6, 0-7 exactly once, by a real intersection.
2. The far line lies between the far three and the four neighbours (0.20 < y < 0.38 of the
   sheet's height all the way across) and lower than the phone crop's cut (y above 0.22 on
   both sizes), so that it is still drawn when the top band is cut off.
3. No note and no name box falls outside the frame; no note sits on a holding's box.
4. Every draw kind uses classes whose colours are tokens.
5. The valley's own definition reproduces today's string exactly. The order inside the SVG is
   part of that: frame, outer frame, clip group (grid, far line, hachures, barrier bank, barrier
   water, ties), crossings, holdings, hands, lettering, demo numbers, north mark. `golden-page.js`
   is the test (`maps 7a78d3e9`).

## 3. Rules that show on screen

### 3.1 Where the page assumes the valley

| Rule | words.js | app.js | index.html | page-smoke.js |
|---|---|---|---|---|
| A hand costs 1, is worth 3 | 41 | 561-562 (`W.signed(-1)`, `W.signed(3)` are literals) | 653 | 165 |
| The number on a card | 202 (`r.payoff`, so it follows the engine) | 1046-1050 | | |
| A lost hand costs nothing, brings nothing; the sender knows; others see only that none came | 155-156, 196-197, 392 | 505-512 (sheet), 662 (glyph), 627 (key) | 727 | 141-143, 248 |
| Store and need | 141-143, 205-207, 398-403, 523-525 | `meterInto` 670-681 (scale from the need, 672; a tick every ten, 675; drawn from zero, 674); `loadLives` drops an entry whose need is not above zero (173) | 684-686 | 184-185 |
| The old way and its gloss | 144-147, 410 ("sends a hand" if the heir's habit is at least a half, else "stays home"), 527, 545, 565-566, 575 | 837 | | 89 (the policy `[1,1,0,1,0]` written out) |
| Twelve days, three seasons of four | 38, 138, 140, 370 | 832 (`!== 12`), 851-854 | 677 | 173, 298, 321 |
| Four neighbours, ids 1, 2, 6, 7 | 40, 104-105, 184 | 13, 895, 1091 | 325-328 | 152, 203, 574-576 |
| Ways are taken up at the end of every fourth day, from those doing well | 42, 371 | | 654 | 159-160 (line 3 pinned word for word, at most 95 characters) |
| Thirty seasons | 418, 422 | 1294, 1362 (`seasons[29]`), 1401-1402 | 542, 550 (`repeat(30, …)`) | 346 |
| "Holds" is at least half over the last ten seasons | 427-429, 438-439, 555 | 1295 and 1381 (`> 20`), 1298 (`0.5 / 1.05`), 1381 (`flow < 0.5`), 1382 (strip tops out at 1.05): none read `params.HOLD_LINE` or `FOG` | 778 | 349, 363 |
| Sixteen hands a season | 444 | 1368 | | 384-385 |
| The first 200 futures, in rows of 40 | 547 | 1466 | 584 | 417-418 |
| Thirteen plain ways | 559, 565 | 1474-1538 (the bracket assumes best is not below worst: 1493) | | 442 |
| One arrival per future | 457-460 | 1329, 1366 | | 343-345, 384 |
| "Keeps your ways" is way 0 or kin's | 451 | 719, 1332, 1350, 1368 | | 127, 377-378 |
| Yesterday is the same from both ends of a tie | | MIRROR (14), used for the row marked "today" (1009) | | 111, 266 |
| What you know of them only grows across a day's close | | 1009-1012 | | 252-262 |
| Mark and seal | 43, 526-544, 594 | 1561-1563, 1576-1580, `sealSVG` 1539-1549 | 812-814, 827 | 430-435, 455 |
| The last day | 139, 587-593, 599 | 832, 1573-1574 | 678, 828-831 | 448-453 |
| Valley number, earlier lives | 49-56 | 17, 165-183, 780, 787 | 648, 679, 798 | 550-551 |

Measured: with `FOG` 0.10, or `B` 5 and `C` 2, or `HOLD_LINE` 0.6 passed to `createLife`, the
published check still passes (cards then show −2, 0, 3, 5; needs run 65 to 109), while the
Opening prints "costs you 1 measure … worth 3" and the strip's rule prints "at least half". The
check tests that sentences are well formed, not that they state the rules in force. At `FOG`
0.10 the largest season flow in the 114 watched futures was 1.007, so the strip's ceiling of
1.05 was not reached there; the engine allows up to 1 / (1 − FOG) = 1.11 (engine.js:216-218).

### 3.2 What each change needs

Lines are a guess. "Engine must hand over" is a request to whoever extends the engine.

**(a) Other stakes (D1).**
- Engine must hand over: b, c, s, h for the Life (b and c are already in `life.params`).
- Words: the Opening's second line per place. Where s or h is not zero, the reveal sentences
  need a clause that accounts for the number ("Hands went both ways. +4" explains nothing).
- app.js:561-562: the demo numbers from the place's stakes. Nothing else: the card number, the
  day total, the meter and the Chronicle already follow the engine (measured at b 5, c 2).
- A leak to settle in the engine: if h is charged on "neither sent", then when I stay home the
  card reads −h if my neighbour chose to stay home and 0 if their hand was turned back. The
  number then says what the page is forbidden to say (engine.js:27). Charging h on "none
  arrived either way" has no such leak. s on "both arrived" is safe.
- A store that runs well below zero (large h) draws as an empty meter for most of the Life and
  a need at or below zero breaks the meter's scale (672) and the saved entry (173).
- Check: assert the Opening's numbers against the Life's stakes.
- Size: 4 strings a place; app 6 lines; check 10.

**(b) An inverted Mark (D3).**
- Engine must hand over every count already turned to face the charter: `holds`, `held`,
  `holdsPct`, `baseline.*`, `mark`, `range.bestPct` at or above `worstPct`, each what-if's
  `holds`, `lastDay.holds`, a future's `holds` and `level`. Then the Chronicle's code is
  untouched. If instead the engine keeps "held" as "the ring held" and only flips the sign of
  the mark, the scale's bracket collapses to nothing (app.js:1493 takes
  `max(0, at(best) − at(worst))`) and "best" is lettered left of "worst".
- app.js: the strip. `flow < 0.5` (1381) and the dashed line at half (1298) must come from the
  place, with which side of the line is the good one.
- Words, a place's own (about 20): Opening line 4; `legendMarks`; `flowLabels` (head, rule);
  the last clause of `flowAlt`; `futureEnd` x 4; `heads().valley`; `valleyLine`; `markMeans`
  ("held with you"); `rowAlt`; `rowsExplain`; `rangeLine`; `rangeNote`; `rangeLabels`;
  `lastDayLine`; `seal`; `mattered`; `legendAfter().help`.
- The last-day paragraph is built on one shape: "you stayed home against X, after hands had
  gone both ways. With a hand sent to them, the valley held in …" (587-593), and the engine
  makes the entry only for staying home on day 12 after both helped (header, 294-301). Where
  outsiders gain when the ring breaks, that same act fills the store and raises the Mark, so
  the seal's guard points the wrong way. Whatever the engine then replays, the sentence must
  take its verbs from the entry and stop assuming them.
- Size: 20 strings; app 15 lines; check 15.

**(c) Luck of another kind (D2).**
- Lost on the way, sender knows (the valley): a swap of the luck atom (11 functions), the
  barrier and crossing on the sheet, one key item.
- Arrived but not seen: engine must hand over a flag on the result and on `yesterday`. Words:
  one more branch in `reveal` and `yesterday`, a new note in place of `fordNote` (the hand now
  costs and pays). Sheet: the hand is drawn arriving, with the mark at their end, not at the
  crossing (about 12 lines); the key and the result glyph one branch each.
- Seen but never sent: a flag; one branch; the bar at your gate plus a hollow head at their
  end; key; note.
- Both of the last two break MIRROR (app.js:14, 1009; page-smoke.js:111, 266). The two ends of
  a tie can then disagree about yesterday, so the row marked "where they stand with you today"
  must come from the engine (`neighbours[i].theirSituation`).
- Both make the store a second witness. If a neighbour's hand can arrive unseen, or be seen
  without arriving, while the store moves by what really arrived, the day's number tells what
  the sentence withholds. The engine must choose: the reader's own receipts are always seen
  truly, or the store moves by what was seen. The page cannot repair this.
- With "seen but never sent" the neutral rule gains a mirror image: the page may no longer say
  "they sent a hand" (words.js:160, 322-323) and "sent a hand h of n" (174) becomes "was seen
  to send". The check's `neutral()` (141-143) needs the matching test.
- Size: 14 strings and 2 branches a kind; app 40 lines a kind; check 20.

**(d) A stock on each tie (D6).**
- Engine must hand over: the level and its top for each of the reader's four ties in `today()`
  and in each result (before and after); for kin's ties in `kinWith`; for all sixteen ties in
  each season of a future.
- Card. Measured at 1280x800 over days 1 to 6 (valley 48213, always sending): once a day is
  closed, the note under the cards ends between y = 715 and y = 751, and the sheet's foot is
  at 766. The tightest day leaves 15 px. A new line on every card is two lines in a two-by-two
  grid, about 36 px: it brings a scrollbar to the laptop day that the style sheet was tuned to
  avoid (index.html:294-300, 499-510). Put the stock in the card's head beside the bearing
  (index.html:360-364; app.js:1030-1039) as a small gauge with words for a listener, or inside
  the existing "Counts in your ways under" line. On a phone a line is affordable (cards are
  175 to 185 px; the first ends at y = 731 of 800).
- Sheet. Make the crossing mark the gauge on your four ties (482-485) and add a mid-tie mark
  on the others, by form (pips or segments), never by colour or width alone (UI-SPEC 6). In the
  Afterwards `drawSeason30` gains a loop over sixteen ties (about 15 lines, new ids).
- Words: the Opening cannot promise "worth 3"; a clause in each reveal; one key item in each
  key; the level in `mapAltDay`; one new function for the gauge's words.
- If the charter counts stock instead of hands arriving, the strip and its five sentences are
  the place's own, as in (b).
- Size: 10 strings; app 90 to 120 lines; style 15; check 25.

**(e) A neighbour replaced by a stranger in the Life (D5).**
- Engine must hand over: the arrival in the season's-end report (seat, old name, new name) and
  the day it happened on the neighbour. Kin must not be the one replaced: the page treats
  `life.kin` as fixed for the Life (32 lines of `app.js` and 29 of `words.js` use the kin id), and H1 keeps kin among the four.
- Three traps in today's code (read, not run):
  1. `namedDeed` (engine.js:483) takes a deed's house name from the seat as it is when asked.
     Old deeds toward the replaced house would be re-lettered with the stranger's name in "Your
     ways" (app.js:690), on Why? cards and in the Chronicle. The name must be frozen with the
     deed.
  2. `knowNodes` (app.js:1009-1012) adds today's gain as `after.seen − seen`. If the seat's
     tallies are reset at the season's end inside `playDay`, the closed card reads "sent a hand
     −2 of −3", and the check throws at 257. Reset at the next day's start, or hand over the
     day's gain.
  3. "They changed a way at the end of day N. Counted since then." (words.js:178-180, 228) is
     what a card says whenever its counts restart. For a stranger it is false: a new line.
- Page: one line in the season's-end panel (the sentence exists inside `futureLines`, 464-466;
  lift it out); the tent and the `is-new` class exist only in the Afterwards mode (app.js:430;
  index.html:171-172): allow them on the day sheet; names follow the engine already (723); the
  card's "You have not dealt with them yet." is right as it stands.
- A reload rebuilds the Life from seed and choices (1603-1611), so the arrival must be keyed by
  the seed.
- More arrivals in the Afterwards: `future.arrival` becomes a list at words.js:457-460,
  app.js:1329 and 1366, page-smoke.js:343-345 and 384.
- Size: 5 strings; app 35 lines; check 20.

**Other dials, briefly (argued).**
- D4, custom: one sentence (144-147), the name "the old way" in six functions, and
  `leaveNote`'s "sends a hand / stays home", which is only true of a custom made of noughts and
  ones. The check's "old way" policy (89) and its demand for a Chronicle with two equal counts
  (619) follow the custom.
- D5, an end not known in advance: "Day 5 of 12" (138), the twelve-box track (851-854), "The
  last day." (832) and the premise all announce the end. Hiding them is 6 strings and about 25
  lines; a Life of varying length is more (the check loops to 12 at 173 and 321).
- D7, schooling: the season's-end intro states the rule (371). "Own side" needs two sides drawn
  on the sheet.
- D8, sight: the dearest dial for the page. With totals only, the per-neighbour reveal, the
  result glyph, the hands on the sheet, "yesterday", "What you know of them" and the Why? card
  have nothing to show. A day late, the reader chooses without knowing which of the five
  situations they are in, and "Counts in your ways under …" (331) cannot be printed. Either is
  a rebuild of the day view, which H1 rules out.
- What can be felt by day 3 (H3): the reader has seen the Opening, the store line, and two or
  three reveals; the first season's end comes after day 4. So stakes, luck, stock and the
  custom's sentence can make the difference in time; schooling and a stranger cannot.

## 4. Chooser, hash, stored lives, the check

### 4.1 Where a chooser fits

The Opening's text column is: sheet number (hidden unless the hash fixes a valley), title,
premise, four lines, Begin, earlier lives (index.html:648-665); the sheet is beside it, or
under it in one column.

Measured:

| Window | State | Where things end | Spare |
|---|---|---|---|
| 1280x800 | no earlier lives | Begin at 552, sheet's foot 616 | 184 px |
| 1280x800 | six earlier lives (three listed and "3 older lives") | list at 686, sheet's foot 750 | 50 px |
| 1280x800 | either | the map column ends at 492 | 194 to 258 px under the map |
| 400x800 | no earlier lives | Begin at 491, map 507 to 797, page 845 tall | already 45 px over |

Recommended: one radio group of the places between the title and the premise (after
index.html:649), built from the same option style the cards use (index.html:370-394), with
`name="place"` and the place id as value. Choosing one sets the place, puts its lexicon in
force, runs `fillStatic()` and `drawOpening()`: the premise, the four lines, the sheet (which
is the preview: `drawOpeningMap`, 597), the sheet number and the list of earlier lives all
follow. One row of five at 2.5rem with its gap is about 56 px: 6 px too many on a laptop with
earlier lives listed. Either list two earlier lives, not three (`PAST_SHOWN`, app.js:195, pinned
by page-smoke.js:592), or set the options at 2rem. On a phone five options wrap to two or three
rows and the map drops below the first screen; Begin stays on it.

At the far end: `again` (app.js:1670) starts a new Life at once. Keep it as "another Life in
this place" (the hook keeps its meaning) and add one quiet control back to the Opening for
choosing another place. The afterword is a new block in the Chronicle (no new screen), last in
the side column; it must come from `words.js` so the check reads it.

### 4.2 The hash

Today: `/^#valley-([A-Za-z0-9-]+)$/` (app.js:780); a seed may hold letters and hyphens (the
check uses the seed `'valley-7'`, page-smoke.js:488). Recommended: `#<place>-<seed>`, the place
id in lower-case letters only, read as the text before the first hyphen. `#valley-48213` keeps
its meaning; `#valley-shoal-3` stays the valley with the seed "shoal-3"; an unknown first word
fixes nothing. The hash also selects the chooser's option; the `hashchange` handler (1740)
already redraws the Opening. The check asks for the literal `#valley-` in `app.js`
(page-smoke.js:550).

### 4.3 Stored lives

Key `after-you.lives.v1` (app.js:17; asked for by page-smoke.js:551). Entries are
`{ seed, kept, purse, need, mark, seal }`; `loadLives` (165-178) rebuilds each from exactly
those fields and keeps at most 20; `saveLife` (179-183) is called once from `showChronicle`
(1553-1556).

- Add `place` (the id). An entry without it is the valley, so today's lists stay true. An entry
  whose place this build does not know is skipped, not shown as a valley. Keep the key.
- `pastLife` prints "Valley 48213: …" (words.js:50): the place's short name from the entry's own
  place, so a mixed list reads right.
- One list capped at 20 across five places pushes a place's best Life out quickly. Recommended:
  cap 60, and list on the Opening and the Chronicle only the place in hand.
- The store shows the Mark as saved: it must already face the charter.
- `loadLives` drops a need at or below zero (173).
- `snapshot()` (1592-1594) and `restore()` (1595-1635) must carry and honour the place.
  `createLife` has three callers, all of which need the place's rules: `drawOpening` (772, to
  show the fixed valley's number), `beginLife` (794) and `restore` (1597).

### 4.4 What page-smoke.js needs per place

1. A loop over places: `createLife(seed, place.rules)` at line 149 and in the rebuild check
   (505-517); the lexicon put in force before the wrappers count calls (50-61), with "every
   function was called" (609-610) asked per place.
2. The valley first and unchanged, so that `golden-words.js` still prints `20bddf72`.
3. A leak list per place: every skin word of every other place that is not also its own.
   This is the check that finds a sentence still written whole in valley words.
4. Rules against copy (missing today, see the measurement in 3.1): the Opening's numbers equal
   the Life's stakes; the strip's rule names the line the engine uses; the custom's gloss is
   the place's.
5. `neutral()` (141-143) built from the place's own verbs, with its mirror image where a hand
   can be seen that was never sent.
6. About twenty assertions are valley sentences as regular expressions: 157, 159, 162, 203,
   275-276, 310, 314, 349, 353-354, 388, 430-431, 434, 442-444, 451, 462, 466-467. Each becomes
   lexicon-driven or valley-only.
7. The policies (81-96) are written for the valley's custom; "the old way" (89) must be the
   place's custom, and each place needs one way of playing that earns its seal (616).
8. The branches that must be reached (614-622) differ by place: no "turned back" where luck is
   of another kind; a stranger's lines only where there is one.
9. Structure that changes with the files: the three scripts at the end (528), `PAST_SHOWN = 3`
   (592), copy at rest (566-568, 601-602: with the valley's lexicon), `#valley-` (550).
10. Forbidden words (18-21) include "firm", "soft", "wary" and "steady" as whole words, because
    they are the engine's founder kinds. A trading or pricing skin will want "firm" and
    "steady". Decide once: other words in the skin, or a list per place.
11. The sheet: if the geometry moves to a file jsc can load, build every place's sheet in every
    mode and size and run the five rules of 2.4.
12. Time: the valley takes 24.4 s for 114 Lives against a limit of 60 s (653). Four more places
    at that coverage is about two minutes. Keep the valley's coverage (it carries the
    fingerprint), give each new place about a third of it, or raise the limit.
13. Fields: each new engine field the page draws from, in `needAll` (150, 176, 207, 242, 343,
    414).

## 5. Recommended architecture

### 5.1 Files

| File | Holds | Change |
|---|---|---|
| `engine.js` | the model, with the dials | others extend it; the valley bit-identical |
| `places.js` (new) | `AYPlaces = { order: […], byId: { valley: {…}, … } }`: one object per place | pure data and a few strings; loads in jsc and in the page |
| `words.js` | the 104 functions, their logic unchanged, reading a lexicon; a shared base of the 159 strings no place needs to touch; `AYWords.use(place)` | `app.js` and the check both hold `var W = AYWords` and the check wraps the functions in place, so a switch inside the module leaves both working |
| `sheet.js` (new) | the geometry and every drawing that is a pure string: app.js:206-571, 624-666, 1539-1549 moved as they are, taking a sheet definition; the draw kinds; a checker | jsc can then build and test a sheet without a browser |
| `app.js` | the five views and their logic, `state.place`, the chooser, hash, storage, reload | calls `AYSheet` for strings |
| `index.html` | chooser, afterword, stock gauge, classes for the draw kinds, token blocks per place | five script tags (the check pins three: 528) |
| `page-smoke.js` | section 4.4 | |

The valley's skin strings must not sit in the shared base. A key a new place forgot should
throw in the check, never fall back to "ford".

### 5.2 What a place supplies, what stays shared

A place supplies:

- `id`, `name`, a one-line teaser for the chooser.
- `rules`: the overrides handed to `createLife` (stakes, luck and its kind, charter, custom,
  clock, stock, schooling, founders).
- `lexicon`: the atoms and strings of 1.4, about 150 strings and 1,000 words, including its
  five situation titles.
- `sheet`: 2.4.
- `charter`: which side of the line is good, the line itself, and the words of the strip and
  the Chronicle that state it.
- `afterword`: one short paragraph, in plain words, read by the check.

Shared, untouched by a place: the loop and its five views; the cards, their turning and the
Why? machinery; "Your ways" and its marks; the track and the meter; the season's-end panel; the
Afterwards player and the count in slices; the Chronicle's layout, its two rows and its scale;
storage; focus, live regions and the keyboard; the two sheet sizes, the eight positions, the
sixteen ties, the holding's box and ring, the hands' lanes; the type scale and the tokens'
names.

### 5.3 Size (a guess, from today's measured sizes)

| File | Today | After |
|---|---|---|
| `words.js` | 623 | about 700 (logic stays, strings leave, 8 new functions) |
| `places.js` | 0 | about 1,150 to 1,300: the valley 230, each new place 200 to 260 |
| `sheet.js` | 0 | about 620: 470 moved from `app.js`, 150 new (draw kinds, gauge, luck marks, checker) |
| `app.js` | 1,771 | about 1,560: 470 out, about 260 in (chooser 40, hash, storage and reload 45, change of place 25, stock on cards 45, stranger 30, strip and charter 20, afterword 10, the rest 45) |
| `index.html` | 855 | about 980 |
| `page-smoke.js` | 654 | about 900 |

About 2,000 to 2,400 lines written or moved with care; 900 to 1,050 of them are the four new
places' own data. Copy: about 4,000 to 4,600 new words across four places.

Order of work that protects the valley: first the rewrite with one place, the valley, and no
new feature, until both fingerprints print as they do today; then one new place end to end;
then the other three.

### 5.4 The three biggest risks

1. **The valley drifts in the rewrite.** About a hundred word functions and the whole sheet
   builder are opened to make room for lexicons and sheet definitions, and H4's promise for
   the engine has no twin for the page today. The guard is in this folder: `20bddf72` for
   362,279 sentences, and `72a7c55d` / `7a78d3e9` for the page and its maps over a whole Life
   at three window sizes. Both run in under 30 s. They do not cover layout.
2. **Copy that reads well and is false, or tells too much.** Measured: three rule changes pass
   the published check while the page states the valley's numbers. Argued: h charged on
   "neither sent" and the two new kinds of luck let a number tell what the sentence withholds;
   a restraint dressed as "sending" produces sentences no swap can mend; valley nouns survive
   in a sentence written whole; "firm" and "steady" are forbidden words. The guards are a
   lexicon at the level of whole phrases, the leak list, rules checked against copy, and a
   person reading each place's sample Chronicles.
3. **Single-valley assumptions in code that fail without a sound, and no room on the sheet.**
   MIRROR for the row marked "today"; one arrival per future; "what you know" only ever
   growing; a deed's name looked up when asked; a need above zero; a best that is not below a
   worst; kin fixed for the Life; the literals 12, 4, 30, 20, 16, 200, 0.5 and 1.05. Each
   gives a wrong line on screen, not an error. And the day has 15 px to spare at 1280x800 and
   the Opening 50 px with earlier lives listed (measured), so a stock line on each card or a
   chooser row of ordinary height brings back the scrollbar the page was tuned to avoid. The
   guards are explicit fields from the engine in place of each assumption, constants read from
   the Life's parameters, the stand-in DOM run for every place, and a look in a real browser
   at 1280x800 and 400x800 for every place.

## Files in this folder

| File | Use |
|---|---|
| `PAGE-MAP.md` | this map |
| `vocab.js`, `vocab2.js`, `vocab.out.txt` | the census: `jsc vocab.js -- "<game folder>"` |
| `golden-words.js`, `golden-words.out.txt` | `cd "<game folder>" && jsc "<this folder>/golden-words.js"` prints `fnv1a32: 20bddf72` |
| `golden-page.js` | `cd "<game folder>" && jsc "<this folder>/golden-page.js"` prints `page 72a7c55d, maps 7a78d3e9` (needs `domshim.js` two folders up) |
| `probe-overrides.js` | `cd "<game folder>" && jsc "<this folder>/probe-overrides.js" -- '{"B":5,"C":2}'` |
