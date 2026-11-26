# The review round (2026-11-26)

> **Record of its time.** Rendered on 2026-11-26 from the review round's workflow result (written 2026-11-26 02:30, local time, UTC+10) for v0.2.0, with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `review-banks/` or `page-p6/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../checks/). Where it disagrees with [LEAD-DECISIONS.md](LEAD-DECISIONS.md) or with the code, those win.

The task: Review the five-place After You page from seven angles, fix what holds up, and verify the fixes independently. 11 agents ran it in three phases (review, fix, verify). Its log reads: "findings: 77 {"blocker":9,"major":24,"minor":32,"polish":12}"; "verification 1 found 2 blocking problems; one more round".

After the second verification, the lead ruled on what was still open: see [LEAD-DECISIONS.md](LEAD-DECISIONS.md), section 5.

Each finding below gives its id, lens, severity, kind, place and where, the page's text at the time ("current"), the reviewer's proposal and reason, and the first fix round's outcome and note. The reviewer's evidence is folded under each finding. The two blocking items of the first verification carry the second fix round's outcome. No field was shortened (the longest, the verification 2 summary, has 2911 characters). The L1 to L6 cited in the fix and verification notes are lead rulings given to the fix rounds (fix round 1 lists them as "Lead decisions applied"); their text is not in the workflow result, so it is not reproduced here. LEAD 2.6, LEAD 3.2 and the like are sections of LEAD-DECISIONS.md.

## Counts

| Severity | Findings |
|---|---|
| blocker | 9 |
| major | 24 |
| minor | 32 |
| polish | 12 |
| **all** | **77** |

| Lens | Findings | blocker | major | minor | polish |
|---|---|---|---|---|---|
| read:banks | 12 | 1 | 2 | 4 | 5 |
| read:watch | 5 | 1 | 1 | 2 | 1 |
| read:bridges | 5 | 0 | 1 | 4 | 0 |
| read:saltmarket | 9 | 2 | 3 | 2 | 2 |
| rules-leaks | 16 | 2 | 8 | 5 | 1 |
| browser | 19 | 3 | 8 | 8 | 0 |
| code | 11 | 0 | 1 | 7 | 3 |

First fix round outcomes, counted from its per-finding outcomes: fixed 53, duplicate 13, rejected 9, partial 2. (The fixer's own summary, below, gives slightly different totals.)

| Round | Verdict | Blocking items |
|---|---|---|
| Verification 1 | fix-needed | 2 |
| Second fix round | verify1-1 fixed, verify1-2 rejected | |
| Verification 2 | fix-needed | 1 |

## Findings

### Lens: read:banks

#### banks-01 (blocker, false-sentence)

- **Lens:** read:banks. **Place:** banks.
- **Where:** places/banks.js:68 (lexicon.opening.lines[1]); Opening, line 2 of the four

**Current:**

> Keeping to your water costs you {cost} {costGoods}. While they keep to theirs, yours yields what the bank holds, {worth} at first. It fills by {fillOne} if either of you keeps off, and falls by {fall} if you both fish across.

**Proposed:**

> Keeping to your water costs you {cost} {costGoods}. While they keep to theirs, yours yields what the bank holds, {worth} at first. It fills by {fillOne} if either keeps off, and falls by {fall} if both fish across, between {min} and {max}.  ({min} and {max} are already slots in stakeSlots, words.js 135. With this Life's numbers it is 203 characters against 197. ARGUED: it stays at three lines in the 34rem stakes column, about 75 characters a line. Re-measure the 1280x800 Opening with two lives, which is exactly 800.)

**Why:** As written, the rule is false on most days once the banks reach their ends, and the page's own gauges then contradict it. A first-time player who believes 'fills by 1' cannot tell why a full bank 'stays full', or why a bank at 3 'falls to 1'. LEAD 3.9: every sentence must be true.

**Outcome (fix round 1): fixed.** places/banks.js opening.lines[1] now ends: 'It fills by {fillOne} if either keeps off and falls by {fall} if both fish across, but stays between {min} and {max}.' (212 characters with this Life's numbers; min and max come from stakeSlots). MEASURED in the browser: the line wraps to 4 lines (90 px), and the Banks' Opening is now exactly as tall as the Watch's. At 1280x800 with lives listed it is 800 (no scroll); at 1366x700 it is 700 with no lives and 774 with lives (the Watch's is also 774); Begin's bottom edge is at 597 (out/sweep3-1366x700-light-and-browser-notes.txt). dom-places 'choose' checks the line, ends included, against the Life's STOCK. Merged with rules-15.

<details><summary>Evidence</summary>

MEASURED: jsc review-banks/clamp-count.js (seeds 1-300, five ways of playing, your four ties each day) -> review-banks/clamp-count-out.txt. 'Fills by 1 if either keeps off' holds on 40.3% of those tie-days for the peacemaker (21.5% from day 5), 28.3% for always keeping off (4.6% from day 5) and 43.4% for the old rule. 'Falls by 4 if you both fish across' holds on 16.1% for never keeping off (5.4% from day 5) and 44.8% for the old rule. page-smoke's own counts agree: jsc page-smoke.js -- banks -> review-banks/page-smoke-banks.txt line 268 has 'staysFull 3850' against 'fills 2116, fillsFull 561'. The cards then say 'stays full' / 'is spent: it cannot fall further' (dump-19-peace.txt from day 4 on), which contradicts the Opening's unconditional rule. TUNE-banks section 7 asked for the floor ('never below 1'); judge-first-timer REVIEW item 4 says 'Scales have ends'. p3 dropped the ends for room.

</details>

#### banks-02 (major, confusing)

- **Lens:** read:banks. **Place:** banks.
- **Where:** places/banks.js:49 (lexicon.custom.gloss); day header under the store, every day

**Current:**

> ... would bring in {purse} {goods} this season.

**Proposed:**

> ... would bring in {purse} {goods} by winter.  (2 characters shorter.)

**Why:** 'Season' already names each block of four days. A reader can take 113 as one block's catch (339 over the twelve days, well over the need of 200) and conclude the old rule keeps the boat. It never does here: the need is the custom's purse plus a margin of 53 (FIX-banks section 3).

**Outcome (fix round 1): fixed.** custom.gloss now says '... would bring in {purse} {goods} by winter.' Merged with rules-06 and browser-11. This is the Watch's wording, and it matches the Opening's 'enough for winter'.

<details><summary>Evidence</summary>

MEASURED (stand-in DOM, real app.js): review-banks/dump-19-peace.txt, Day 1 shows 'Winter catch 0 of 200 baskets' and 'The old rule of the cove, ... would bring in 113 baskets this season.' On the same screen the track is labelled 'Twelve days in three seasons of four.', day 4 opens 'The end of the first season', and the button reads "Season's end". The 113 is the custom's whole twelve-day purse: dump-19-old.txt, playing the old rule, ends 'Not kept: 113 of 200 baskets.' The valley's gloss says 'this harvest' (valley.js 47).

</details>

#### banks-03 (major, layout)

- **Lens:** read:banks. **Place:** banks.
- **Where:** places/banks.js:112 (knowValue), 116-119 (yesterday.mine, theirs, neither); day view while choosing, 1366x700

**Current:**

> knowValue 'kept to their water {h} of {n}'; yesterday.mine 'Yesterday you kept to your water. Their nets were in yours.'; theirs 'Yesterday they kept to their water. You fished across.'; neither 'Yesterday you fished across. Their nets were in yours.'

**Proposed:**

> knowValue 'kept off {h} of {n}' (17 characters with two-digit counts, against 28). yesterday.mine 'Yesterday you kept off. Their nets came across.' (47). theirs 'Yesterday they kept off. You fished across.' (43). neither 'Yesterday nets crossed both ways.' (33). Each is no longer than the valley's 47 and still neutral: page-smoke's banks pattern does not match any of them. Then re-measure the morning states at 1366x700 and 1280x800 in a browser.

**Why:** L4: a new place should not scroll at 1366x700 where the valley does not, if it can be fixed without moving the valley. These are Banks-only strings.

**Outcome (fix round 1): fixed.** The counts now read: knowValue 'kept off {h} of {n}'; wayCount, leaveNote.tested and mattered.count likewise 'kept off ...'; legendWays.sent 'kept off'. Three yesterday lines are shorter: mine 'Yesterday you kept off. Their nets came across.', theirs 'Yesterday they kept off. You fished across.', neither 'Yesterday nets crossed both ways.'. The neutral rule still passes. MEASURED at 1366x700 light (Banks 300 tft, 311 mix, 322 stft, 333 send): every open and chosen state is 700, against 703-714 before (sweep3).

<details><summary>Evidence</summary>

MEASURED by p6 in a browser (page-p6/REPORT.md, Checks 'the day at 1366x700' and Open issues): 'Banks (706-720) and Saltmarket (706) also scroll in some open or chosen states, which the valley did not.' L4 asks for this to be fixed where the valley does not move. ARGUED cause, from index.html 148-149, 414-424, 466, 506 and 555-571 and the string lengths: at 1280-1366 px the sheet is 78rem, so each card in the two-by-two grid is about 320 px inside. The Banks' morning know-now row 'after the other's nets crossed' + 'kept to their water 18 of 20' (58 characters, 12 px semibold) overflows one line and wraps (flex-wrap). So does 'after their own nets crossed' + its value. The valley's longest, 'after leaving the other short' + 'sent a hand 18 of 20' (49), fits. The Banks' yesterday lines are 54-59 characters at 13 px against the valley's 47. Each wrap adds about 18 px to a row of cards. Both happen only in morning states, which is where p6 saw the Banks scroll.

</details>

#### banks-04 (minor, check-gap)

- **Lens:** read:banks. **Place:** banks.
- **Where:** page-smoke.js:564 (PLACE_SEAL_SEEDS has no banks entry); page-p6/check/run-dom.sh (the four Banks configurations)

**Current:**

> var PLACE_SEAL_SEEDS = { watch: [4], bridges: [4], saltmarket: [10, 15] };

**Proposed:**

> var PLACE_SEAL_SEEDS = { banks: [19], watch: [4], bridges: [4], saltmarket: [10, 15] };  Add "{place:'banks',screen:'laptop',seed:19,policy:'peace'}" to run-dom.sh, and look once at a sealed Banks Chronicle in a browser (see banks-08).

**Why:** Without these, a preset or words change could drop the Banks' only seal without any check failing, or trip the 'no Life earned the seal' check by luck (p3 open issue).

**Outcome (fix round 1): fixed.** page-smoke.js now has PLACE_SEAL_SEEDS banks: [19]; the Banks now show 2 seals in page-smoke, against 1. run-dom.sh gains {place:'banks',screen:'laptop',seed:19,policy:'peace'}, and the stand-in DOM reports 'seal earned' for it. The Banks seal was drawn in the browser (see banks-08).

<details><summary>Evidence</summary>

MEASURED: jsc page-smoke.js -- banks -> review-banks/page-smoke-banks.txt:265 'seals 1' in 149 Lives. The peacemaker plays at full counts only on seeds 1-3, and none of those seals (review-banks/seal-scan-peace-1-30.txt), so the one seal comes from a 400-future Life. None of the four Banks DOM configurations earns the seal (seal-scan: 12 peace kept, mark 4.3, not clear; 48213 short and 2024 send not kept; 31 is the custom, mark 0). p6's browser Banks Lives were 12 and 31. So the DOM check 'the seal, in the place's words, exactly when earned' passes vacuously for the Banks, and the Banks seal drawing has never been on screen in a check. The peacemaker seals at the page's own counts on seeds 19 and 29 (seal-scan-peace-1-30.txt). Seed 19 in the stand-in DOM shows 'Boat kept, grounds better off.' (dump-19-peace.txt).

</details>

#### banks-05 (minor, other)

- **Lens:** read:banks. **Place:** banks.
- **Where:** places/banks.js:70 (opening.lines[3])

**Current:**

> At the end two things are counted: whether your catch is enough for winter, and whether you left the banks better or worse off.

**Proposed:**

> At the end two things are counted: whether your catch is enough for winter, and whether you left the grounds better or worse off.  (+1 character.)

**Why:** The Opening promises a count of 'the banks', and the Chronicle reports 'the grounds'. A first-time player should meet on the Opening the word the mark and the seal will use.

**Outcome (fix round 1): fixed.** opening.lines[3] now says '... whether you left the grounds better or worse off.'

<details><summary>Evidence</summary>

MEASURED: dump-19-peace.txt. The Opening ends '...whether you left the banks better or worse off.' Everything that counts it afterwards says 'grounds': the strip rule 'The grounds hold if ... the banks between boats average at least 7', the Chronicle head 'Grounds', 'With you, the grounds held in 1155 of 2000 futures', 'In this future the grounds failed', and the seal 'Boat kept, grounds better off.'

</details>

#### banks-06 (minor, drawing)

- **Lens:** read:banks. **Place:** banks.
- **Where:** places/banks.js:96-101 (legendDay); sheet.js map() hands and keySVG ('arrived', 'turned', 'home')

**Current:**

> legendDay.arrived 'kept to its water'; legendDay.lost 'nets carried by the tide'

**Proposed:**

> Keep the drawing, and say in the key what the arrow carries: arrived 'kept off: the other's catch' (+10 characters), lost 'kept off, nets taken by tide' (+4). Room: the day key is at three lines on the 1280x800 day, and p3 measured 802 px with a longer key text, so re-measure there before taking these.

**Why:** The chart is the place's instrument. Read without the key, it tells the opposite of the cards.

**Outcome (fix round 1): rejected.** The arrow is the shared mark for a kind act, kept in every place on purpose (judge-first-timer REVIEW 5.2), and the Opening sheet teaches it (−2 at your end, +6 at theirs). The proposed key texts are 4-10 characters longer, and the day key sits in the left column of the 1280x800 day, which is the hard no-scroll size. Not worth the room. The Bridges has the same grammar (bridges-05).

<details><summary>Evidence</summary>

MEASURED render: jsc review-banks/banks-svgs.js and page-p5-bridges/check/render-sheets.py -> review-banks/render/wide-day-revealed-light.svg.png and keys-light.svg.png. Keeping to your water is drawn as an arrow from your mooring into the neighbour's. Fishing across is a bar at your own mooring. 'Nets carried by the tide' is a broken arrow stopped with an X before the race. ARGUED: on a fishing chart, an arrow toward a boat reads as nets going into its water, the opposite of the key's 'kept to its water'. The luck mark shows nets stopped at the race, while the words say they were carried across. The marks are the valley's hand marks relabelled. They read correctly only as 'what keeping off is worth to the other', which the Opening sheet's −2/+6 arrow teaches.

</details>

#### banks-07 (minor, a11y)

- **Lens:** read:banks. **Place:** banks.
- **Where:** app.js:308-312 (drawLeavingMap passes no alt; sheet.js map() then uses mapAlt('day'))

**Current:**

> Leaving map alt: mapAlt.day, with no bank levels

**Proposed:**

> Where the place has a stock, give the Leaving map o.alt = W.mapAlt('day') + ' ' + the stock.mapLevels sentence built from today().neighbours[i].stock (the words exist: stock.with, stock.mapLevels). This is inert in the valley.

**Why:** On the Leaving view the eye sees the four banks you hand on, and a listener is never told them.

**Outcome (fix round 1): fixed.** In app.js drawLeavingMap, a place with a stock now gives the map o.alt = W.mapAltDay(state.choices.length, 'season', items), with each item carrying its bank level. This is the same wording as the day map: 'Chart of the cove, at the end of day 12. The banks between you and them: 9 with ...'. The valley is unchanged. MEASURED: out/leaving-alt-banks19.txt (stand-in DOM). dom-run-p6.js gains a check that the Leaving map says each level.

<details><summary>Evidence</summary>

MEASURED: dump-19-peace.txt, Leaving. The map's label is 'Chart of the cove: your mooring at the foot, your four neighbours across the tide race with the bank you share with each, and three boats beyond the headland that you cannot see.', with no levels. The same map draws four gauges at the levels you leave (dom-run-p6 checks 4 gauges on map-leaving). On the day map a listener hears 'The banks between you and them: 9 with ...' (stock.mapLevels).

</details>

#### banks-08 (polish, drawing)

- **Lens:** read:banks. **Place:** banks.
- **Where:** places/banks.js:304 (sheet.glyph.seal, the seal-water path)

**Current:**

> \<path class="seal-water" d="M15 61.5q2.5 -1.6 5 0t5 0t5 0t5 0t5 0t5 0t5 0t5 0t5 0"/>

**Proposed:**

> \<path class="seal-water" d="M24 60q2.5 -1.6 5 0t5 0t5 0t5 0t5 0t5 0"/>  (x 24 to 54, inside the inner ring, and 1.7 below the hull's foot.)

**Why:** The water should not cut through the seal's ring and ticks.

**Outcome (fix round 1): fixed.** The seal-water path is now 'M24 60q2.5 -1.6 5 0t5 0t5 0t5 0t5 0t5 0'. MEASURED: AYSheet.seal of the Banks sheet was drawn at 228 px in the browser, and the water now runs inside the inner ring, under the hull.

<details><summary>Evidence</summary>

MEASURED render: jsc review-banks/seal-svg.js and render-sheets.py -> review-banks/render-seal/seal-dark.svg.png, against sealvalley-dark.svg.png. Geometry: the wave runs x 15 to 60 at y 61.5. The inner ring (r 28.5 about 38,38) spans x 21.9 to 54.1 at that height, so each end runs about 6-7 px past the ring into the tick band. The valley's seal stays inside its ring. No check or browser run has shown this drawing (banks-04).

</details>

#### banks-09 (polish, clumsy)

- **Lens:** read:banks. **Place:** banks.
- **Where:** places/banks.js:104 (legendAfter.income); Afterwards map key

**Current:**

> baskets landed this season

**Proposed:**

> net baskets this season  (23 characters against 25)

**Why:** A boat cannot land −5 baskets. The number is the season's gain after the cost of keeping off.

**Outcome (fix round 1): duplicate.** Same as rules-05. legendAfter.income is now 'baskets gained or lost this season', the Watch's and the Bridges' form.

<details><summary>Evidence</summary>

MEASURED: jsc review-banks/neg-income.js -> neg-income-out.txt. 47 of 100 watched futures (seeds 1-100) letter at least one negative season income on the map. dump-19-peace.txt, Afterwards at rest: your sister's mooring shows '−5' under the key 'baskets landed this season'.

</details>

#### banks-10 (polish, other)

- **Lens:** read:banks. **Place:** banks.
- **Where:** places/banks.js:193 (houseAtEnd; the resting map in words, for a listener)

**Current:**

> {who}: {income} {goods} in the last season, nets kept home {hands} of 16 times

**Proposed:**

> {who}: {income} {goods} in the last season, kept off {hands} of 16 times

**Why:** This is the one place the act gets a third name. 'Kept off' is shorter and needs no pronoun for the heir.

**Outcome (fix round 1): fixed.** houseAtEnd now reads '{who}: {income} {goods} in the last season, kept off {hands} of 16 times'.

<details><summary>Evidence</summary>

MEASURED: dump-19-peace.txt, Afterwards at rest: 'Your heir: 5 baskets in the last season, nets kept home 6 of 16 times, keeps your ways.' Everywhere else the Banks call this act 'kept to its water' or 'keeps off'. 'Kept home' is the valley's wording ('stayed home').

</details>

#### banks-11 (polish, drawing)

- **Lens:** read:banks. **Place:** banks.
- **Where:** places/banks.js:298 (sheet.notes, the 'ford' note lettered 'the banks' at x 0.5, y 0.745)

**Current:**

> { label: 'ford', at: 'sheet', x: 0.5, y: 0.745, water: true }

**Proposed:**

> Letter it on the race's west reach, clear of every tie and hand, as the Watch did (for example near x 0.16, below the race). Then re-run AYSheet.check and the browser getBBox rule 3 at both sizes and on a 320 px phone.

**Why:** It is legible thanks to its halo, but it crowds the marks the player reads every day.

**Outcome (fix round 1): fixed.** The 'ford' note ('the banks') moves to x 0.16, y 0.9, under the race's west reach, as the Watch letters its border. AYSheet.check returns [] for every sheet (fix1-sheet-probe). MEASURED in the browser on Banks 117 mix, day 7 closed, by getBBox and isPointInStroke/isPointInFill sampling: on the wide map at 1280x800 and the compact map at 400x800 the note touches no tie, hand, gauge, name or holding. At 320x640, with its enlarged lettering, it touches only the race's own band and water.

<details><summary>Evidence</summary>

MEASURED render: review-banks/render/crop-compact-banks-note2.png (compact day chart, revealed). 'the banks' is lettered over the arrowhead from the north-west and the broken luck arrow to the north-east, just above your mooring. The valley's 'the ford' sits in the same spot (render-valley/compact-day-revealed-light.svg.png). The Watch and the Bridges moved theirs for this reason (watch.js 307-309, bridges.js 293-295). The note is the Banks' own, so moving it does not move the valley.

</details>

#### banks-12 (polish, clumsy)

- **Lens:** read:banks. **Place:** banks.
- **Where:** places/banks.js:231-232 (stock.full.say, stock.spent.say; listener only)

**Current:**

> {bank} is full, at {level}. / {bank} is spent, at {level}.

**Proposed:**

> {bank} is full at {level}. / {bank} is spent at {level}.

**Why:** The comma makes a stilted pause for a listener. The captions already read 'full at 9' and 'spent at 1'.

**Outcome (fix round 1): fixed.** stock.full.say and stock.spent.say are now '{bank} is full at {level}.' and '{bank} is spent at {level}.'. page-smoke builds its expected text from the same templates, and it passes.

<details><summary>Evidence</summary>

MEASURED: dump-19-peace.txt, the vh line under a full card: 'The bank between you is full, at 9.' and 'The bank between you is spent, at 1.'

</details>

### Lens: read:watch

#### watch-01 (blocker, false-sentence)

- **Lens:** read:watch. **Place:** watch.
- **Where:** places/watch.js:248-250 lexicon.lastSeason.rests, shown in the Chronicle as p#chron-season (app.js:1335, words.js:814)

**Current:**

> The border's gain rests on what your tower did in the last season beyond the ways it had before, and no tower had yet lived with that.

**Proposed:**

> No seal this time: had your tower played the last season by its earlier ways (the border custom where it had none), the border would not be clearly better off.  (161 characters, against 134 now. L1's own sample takes the same room: 158. The line sits under the noise line in the Chronicle's main column, which already scrolls. No digits, no names, nothing about luck or choice.)

**Why:** [argued] The proposed sentence is true in every Life where L1 shows the line, because it says the engine's rule and nothing more. The season replay plays days 9-12 by the habit as it stood before day 9, using the custom where a situation was never met. wonOnSeason means that the mark plus that replay's delta, less two standard errors, is under the seal mark: 'not clearly better off'. It makes no claim that the player did something new, so it stays true at a 2-of-4 count, for a hawk kept watch on consistently, and for an always-stand-down tower. It also tells the always-stand-down player what changed: the custom stood in where they had no way. The current words read as an accusation of a late change in the Lives where an honest player sees it most: 5 of the 6 honest-way cases in 300 seeds.

**Outcome (fix round 1): fixed.** lexicon.lastSeason.rests now reads: 'No seal this time: had your tower kept to its earlier ways in the last season, and to the border custom where it had none, the border would not have been clearly better off.' ARGUED: it states the engine's own rule, so it is true in every Life where L1 shows it. That rule is wonOnSeason: days 9-12 replayed by the habit as it stood before day 9 (the custom where a situation was never met), and then mark + delta − 2SE falls short of the seal's bar. It also covers the 2-of-4 and always-stand-down cases. It has no digits and says nothing of luck or choice. The Saltmarket has the same form (salt-01). MEASURED in the browser on Watch 20 always send: kept 167 of 144, mark +19, no seal, and the line stands under the noise line. Merged with rules-14 and browser-14.

<details><summary>Evidence</summary>

MEASURED. Stand-in DOM, seed 35, page-smoke's honest way ('first to stand down, with second chances'), laptop, full counts (check/dump-life.js -> out/dump-season-35.txt). The house is kept (148 of 141 sacks), the mark is +14 and the seal is withheld only by the season replay (L1's condition holds). The Chronicle prints the line. The engine's season entry reverses four acts toward the Garrow tower on days 9-12; on each of them the player kept watch. After day 8 the page's own count reads 'After fires on both towers: stood down 2 of 4', and the deeds under it are: days 2 and 5 stood down toward Garrow, days 7 and 8 kept watch on Garrow. Days 9-12 repeat what the player had done toward that same tower on days 7-8. So 'beyond the ways it had before' and 'no tower had yet lived with that' are both untrue for this Life as the page records it: Garrow had lived with exactly that on days 7 and 8. check/season-honest.js, seeds 1-300, honest way, full counts (out/season-honest-*.txt): 59 seals earned and 6 withheld only by the season replay (seeds 35, 45, 115, 154, 209, 223). In 5 of the 6, the first reversed act repeats an act the player had already made toward the same tower in the same situation before day 9; the counts were 2/4, 1/2, 1/3, 2/4 and 2/3. Seed 20 'always send' is page-smoke's own Life where L1 holds, at both 400/200 and full counts (out/season-detail-20-always-*.txt, out/dump-season-20-always.txt). There the player stood down to every tower on every day, and every row of 'Your ways' reads 'stood down N of N'. The replay reverses day 11-12 stand-downs in 'after fires on both towers', a situation first met in the last season, which the engine fills with the custom's keep-watch. That player is told the gain 'rests on what your tower did in the last season beyond the ways it had before'. The line also never says that there is no seal, which L1 requires.

</details>

#### watch-02 (major, code-bug)

- **Lens:** read:watch. **Place:** watch.
- **Where:** app.js:1335 (the season line is drawn whenever v.seal.wonOnSeason); words.js:814-817 W.seasonRests; page-smoke.js:1107

**Current:**

> if (v.seal && v.seal.wonOnSeason) ... W.seasonRests(v)  (the line shows for any withheld-by-season verdict, the house kept or not)

**Proposed:**

> Gate the line, in W.seasonRests (which should throw otherwise) and in app.js's one call, on L1's condition: wonOnSeason && houseKept && markClear && !boughtOnLastDay && !lastDayCost && !wonOnLastDay. page-smoke should then require the line exactly then and the refusal for every other verdict. No room change.

**Why:** L1 is binding. Now that the Watch's engine replays the season, it is the Watch whose players meet this today: a short house is told why it has no seal it could never have had.

**Outcome (fix round 1): fixed.** L1 is now applied in both files. In words.js, W.seasonRests throws unless wonOnSeason && houseKept && markClear && !boughtOnLastDay && !lastDayCost && !wonOnLastDay. app.js seasonLine draws the line only on that same condition. MEASURED: in page-smoke the Watch line shows twice and is refused for 151 other verdicts, 4 of which had wonOnSeason with the seal out of reach. In the stand-in DOM, Watch 13 on the phone refuses it in both Chronicles. Mutations words-season-any, app-season-any, app-season-any-hook and app-season-never are all caught. Merged with rules-02, browser-09 and salt-03.

<details><summary>Evidence</summary>

MEASURED. Stand-in DOM, seed 13, honest way, laptop, full counts (out/dump-season-13.txt). The Chronicle reads 'Not kept: 131 of 147 sacks.' and then prints the season line, although the seal was out of reach whatever the replay did. check/smoke-watch-season.js replays page-smoke's own 151 Watch Lives (out/smoke-watch-season-*.txt). Four have wonOnSeason, matching page-smoke's 'Seals withheld by the season replay, told in a line: 4' in lead1-page-smoke.txt. Three of the four are short houses (seed 13: 'always send', the selfish honest way and the honest way, at 400/200). Only seed 20 'always send' meets L1. So today the Watch shows the line mostly where L1 forbids it, and page-smoke passes.

</details>

#### watch-03 (minor, check-gap)

- **Lens:** read:watch. **Place:** watch.
- **Where:** page-smoke.js:289-294 (FEATURE_AHEAD), 569-572 (PLACE_AHEAD_LIVES.watch [13]), 1196-1204

**Current:**

> FEATURE_AHEAD = { lastSeason: { REPLAY: 'season' } }; PLACE_AHEAD_LIVES = { watch: [[13, 'first to stand down, with second chances']] }  (inert now)

**Proposed:**

> Remove both entries (L2). Add one Life of the place's own way where L1 holds, played at full counts as PLACE_SEAL_SEEDS are: seed 115 'first to stand down, with second chances', a first stand-down after fires on both towers in the last season (or seed 35, a hawk kept watch on). Keep seed 13 in normal play as the short-house refusal.

**Why:** Without it, the Watch's line would be read by the check only through an always-stand-down Life, and the place's own honest way, which meets the line in about 1 in 10 of its kept, mark-clear Lives (6 of 65 on seeds 1-300), would go unread.

**Outcome (fix round 1): fixed.** Applied L2: FEATURE_AHEAD, PLACE_AHEAD_LIVES and the 'ahead' loop are removed, so lastSeason is now required exactly where REPLAY is 'season'. New PLACE_SEASON_LIVES Lives are played at full counts and must show the line or refuse it: watch [115, honest, shown], [13, honest, refused]; saltmarket [35, shown], [94, refused], [113, refused]. Each must still have wonOnSeason, or page-smoke fails with the name of the search script to rerun (review-fix1/check/season-l1.js). In normal play, Watch 20 'always send' shows the line, and seed 13 stays the short-house refusal. A new coverage gate requires at least one refusal where wonOnSeason held. Mutation engine-watch-habit (back to 'habit') is caught.

<details><summary>Evidence</summary>

MEASURED. Under engine REPLAY 'season', FEATURE_GROUPS.lastSeason is true for the Watch, so the ahead block returns early and the seed-13 ahead Life is never played. lead1-page-smoke.txt lists 28 honest Lives (26 seeds, plus the seal seed and the cover seed) and no '(lastSeason ahead)' entry. After L1, normal play leaves exactly one Watch Life with the line: seed 20 'always send' at 400/200 (out/smoke-watch-season-3.txt). That is a tower that never kept watch, where the line is hardest to read. Seeds 35 and 115 of the honest way meet L1 at both full and 400/200 counts (out/season-detail-35-honest-*.txt, out/season-detail-115-honest-*.txt). page-smoke checks only that the line has no digit, starts at day 9 and is not shown with a seal. It cannot see that the current words are untrue for seed 35 (watch-01).

</details>

#### watch-04 (minor, confusing)

- **Lens:** read:watch. **Place:** watch.
- **Where:** places/watch.js:170 lexicon.even.third (the reason under Elsewhere today)

**Current:**

> Even so, a fire burned on their tower today.

**Proposed:**

> Even so, a fire burned on your sister's tower today.  (52 characters against 44. The reason opens under its line only on demand, and the Saltmarket already says "Even so, your sister's price was cut today.")

**Why:** [argued] The sentence exists to say whose act failed to show today. Naming the sister removes the only ambiguous reference in the Watch's Why? texts. The card's own form (even.own) stays 'their tower', where the card names one tower.

**Outcome (fix round 1): fixed.** even.third now reads "Even so, a fire burned on your sister's tower today."

<details><summary>Evidence</summary>

MEASURED. Seed 4, honest way, day 6 (out/dump-seal-4.txt). The Elsewhere line reads 'Your sister's tower and the Wren tower: fires burned on both.' Its reason reads, in order: 'Your sister's tower, toward the Wren tower' / 'After a fire on the Wren tower' / 'Your sister's tower learned this from you.' / '... They do the same.' / 'Even so, a fire burned on their tower today.' On day 6 both towers had fires and the Wren tower is the last one named, so 'their tower' can be read as the Wren tower. Day 10 has the same sentence under 'The Wren tower stood down toward your sister's tower, where a fire burned.'

</details>

#### watch-05 (polish, other)

- **Lens:** read:watch. **Place:** watch.
- **Where:** places/watch.js:245-247 (comment above lastSeason)

**Current:**

> // ---- a seal withheld by the season replay (AYWords.seasonRests). The Watch's rules replay the habit today; the lead has decided it takes the season replay (REPLAY 'season'), so its words are here ahead of its rules, and page-smoke.js plays some of its Lives with that replay --

**Proposed:**

> // ---- a seal withheld by the season replay (AYWords.seasonRests; the Watch's rules replay the last season, REPLAY 'season'), told only when the seal would otherwise have been earned (L1) --

**Why:** Stale notes in a place file mislead the next editor about which rules the words were written for.

**Outcome (fix round 1): fixed.** Rewrote the comment above lastSeason in watch.js: REPLAY 'season', told only where the seal would otherwise have been earned, and what the line says. Merged with code-10.

<details><summary>Evidence</summary>

MEASURED by reading. The comment says the Watch's rules 'replay the habit today' and that its words are 'here ahead of its rules, and page-smoke.js plays some of its Lives with that replay'. engine.js:583 now has watch REPLAY 'season', and page-smoke no longer plays the ahead Life (watch-03). Not on screen.

</details>

### Lens: read:bridges

#### bridges-01 (major, check-gap)

- **Lens:** read:bridges. **Place:** bridges.
- **Where:** places/bridges.js:128-129 and 136-137 (yesterday.lostTheirs, yesterday.lostNone, reveal.lostTheirs, reveal.lostNone); the laptop day at 1280x800 (and 1366x700)

**Current:**

> reveal.lostTheirs 'Your mule would not stand, and your cart came on. They saw only a cart coming on. They gave way, and you crossed.' (113); reveal.lostNone '... Theirs came on too: the wheels locked.' (120); yesterday.lostTheirs 'Yesterday your mule would not stand, and your cart came on. They saw only a cart coming on. They gave way.' (106); yesterday.lostNone '... Theirs came on too.' (111)

**Proposed:**

> Bring all four under the valley's lengths, keeping the three parts (your luck, what they saw, the outcome that accounts for the number): reveal.lostTheirs 'Your mule would not stand; they saw only your cart. They gave way, and you crossed.' (83); reveal.lostNone 'Your mule would not stand; they saw only your cart. Theirs came on too: the wheels locked.' (90); yesterday.lostTheirs 'Yesterday your mule would not stand; they saw only your cart. They gave way.' (76); yesterday.lostNone 'Yesterday your mule would not stand; they saw only your cart. Theirs came on too.' (81). (Or keep LEAD 3.2's exact phrase and drop the middle sentence, since the luck note under the cards already says it: 'Your mule would not stand, and your cart came on. They gave way, and you crossed.' (80), and so on.) Then measure #bridges-127 day 1 closed and day 2 open at 1280x800 and 1366x700 in the browser.

**Why:** L4: at 1280x800 nothing may scroll on the day. The one walk that 'passed' never showed the place's longest card, which most Lives show at least once. If the browser confirms the scroll, this is a blocker under L4, because the check passed while the page is wrong. Shortening the four lines is a Bridges-only fix that leaves the valley where it is.

**Outcome (fix round 1): duplicate.** Same as browser-01 (fixed there): the four mule lines and the luck note are shorter. MEASURED at 1280x800: Bridges 117 mix 859→800, 151 alt 842→800, 168 late 842→800, 100 tft 823→800, and 50377 stft, 74739 mix and 401 tft are all 800 in every day state (sweep2).

<details><summary>Evidence</summary>

Measured. card-lengths.js gives card-lengths-out.txt: the Bridges' mule sentences are the longest card sentences of any place. The reveals are 120 and 113 characters and the yesterday lines 111 and 106. The valley's longest are 89/88 (reveal) and 99/98 (yesterday). mule-days.js gives mule-days-out.txt: 294 of 400 honest Lives (73.5%) show at least one mule card, on 501 of 4800 days. verify-numbers-out.txt: the only Bridges Life walked at 1280x800 (seed 4, honest, the seal seed) has 0 mule cards. tall-day-out.txt: its sister is house 6, so it has one Elsewhere line, while seeds with the sister at house 1 or 7 have two on every closed day. So L4's hard rule has never been measured on the Bridges' tallest day states. Argued: in screen 05 the line 'You drove on. Their cart came on too: the wheels' fits and 'locked.' wraps, so a card holds about 48-55 characters a line. A mule reveal then takes 3 lines where the usual results take 2, adding 18.2 px (--t-s 0.8125rem x 1.4). The integration measured the Bridges' closed day at 788 px at 1366x700. The sheet is capped at 78rem, so the cards are as wide at 1280, which leaves at most about 12 px at 800. To reproduce: open #bridges-127, choose Give way on all four on day 1 and close it. That gives three mule cards across both rows and two Elsewhere lines. #bridges-193 and #bridges-211 day 1 do the same, and day 2 open shows the long yesterday lines.

</details>

#### bridges-02 (minor, confusing)

- **Lens:** read:bridges. **Place:** bridges.
- **Where:** places/bridges.js:269 charter.lastDayHabit (Chronicle, 'The last day')

**Current:**

> 'On the last day you {lived}. Had you {replayed}, the road kept moving in {holds} of the first {futures} futures, against {base} of those as you left it. Your yard would have been {store}.'

**Proposed:**

> 'On the last day, against your habit there, you {lived}. Had you {replayed}, the road kept moving in {holds} of the first {futures} futures, against {base} of those as you left it. Your yard would have been {store}.' (+28 characters, in the Chronicle's side column, which already scrolls). For a situation never met before day 12 the engine takes the old rule as the habit, which is what Leaving already tells the player the heir keeps there.

**Why:** A first-time player who took turns at a jam on day 12 sees the Chronicle single that act out as if it were a slip. In about a third of those Lives the numbers suggest giving way would have moved the road more, which cuts against the afterword. Naming the yardstick (your own habit) explains why the line is there without saying anything about luck or choice.

**Outcome (fix round 1): rejected.** 'against your habit there' would be false for a situation first met on day 12. Then n is 0 and the replay takes the custom as the habit (engine replay: 'never met: the custom'). Saying it only for n > 0 needs a second lastDayHabit key in every place, the valley included. The sentence is true as it stands.

<details><summary>Evidence</summary>

Measured: lastday-honest.js gives lastday-honest-out.txt (honest 'take turns, at the jams too', seeds 1-200, 300 futures). 55 of 200 honest Lives (27.5%) show the last-day line. Every act it names (62 of 62) is 'drove on' after the wheels locked, which is the lesson's own move of taking your turn at a jam. The replay was better for the road in 18 of those Lives and worse in 36. Example, seed 5: 'On the last day you drove on toward the Yarrow carter. Had you given way to the Yarrow carter, the road kept moving in 196 of the first 300 futures, against 184 of those as you left it. Your yard would have been 35 of 24 loads.' The sentence is true. Argued: it never says why these acts are singled out.

</details>

#### bridges-03 (minor, layout)

- **Lens:** read:bridges. **Place:** bridges.
- **Where:** Afterwards 'As it happens' at rest (app.js finishAfter, .ticker.is-done) and the Chronicle's 'What became of your ways' (W.became); caused by the place's R_AFTER 4

**Current:**

> At rest the whole Afterwards list shows, and the Chronicle repeats every event that involves your ways.

**Proposed:**

> Make it place-only (params.R_AFTER > 1, so the valley cannot move). At rest keep the ticker's scroll box (max-height 21rem) instead of .is-done showing the whole list. In the Chronicle list only the heir's and the sister's lines plus the closing line, or the last eight lines with one line 'and N earlier changes of way' (N counted from the list).

**Why:** The list is repetitive and buries 'See the count', 'Live another life' and the afterword under 20-30 near-identical lines, at 2-2.7x the valley's length. LEAD 2.5 accepted four looking-round entries a season in the Afterwards. It did not consider their weight in the resting views.

**Outcome (fix round 1): fixed.** Both lists are bounded by place-only rules; the valley is as published. (1) Afterwards: at rest the ticker stays a 21rem scroll box (16rem on short windows), shows its newest lines, and keeps its tab stop while it overflows (app.js finishAfter; the old path is kept where it does not overflow). MEASURED: the Afterwards end at 1280x800 is now 800-873 px in the new places; Bridges 844, against 1036-1542 before. (2) Chronicle: 'What became of your ways' is now a 14rem box scrolled to its closing lines, with tabindex 0 and aria-labelledby h-chron-became when it overflows. MEASURED on Bridges 168 late: 15 lines in 224 px, the buttons' bottom edge at 692 of 800, and the Chronicle 1041 px tall, the same as the valley's. I did not trim the words (W.became is the valley's frozen function).

<details><summary>Evidence</summary>

Measured: ticker-length-out.txt and became-length-out.txt, 120 seeds per way of playing. Afterwards list: Bridges honest median 24, 90th percentile 34, max 51 (custom max 45). The valley: median 11, max 19. Chronicle list: Bridges honest median 16, 90th 26, max 31 (custom max 42). The valley: median 6, max 15. The seal Life itself (#bridges-4, PLACE_SEAL_SEEDS) shows 32 and 31 lines (dump-1-seal-seed4-honest.txt). Many are the heir or sister flipping back and forth: 'Season 9: your heir takes up your ways.' / 'Season 10: your heir gives up your ways for the Corra way.' / 'Season 12: your heir takes up the Brix way.' Argued from screens: in screen 09 the Watch's 11 lines put 'See the count' at about 747 of 800 px at 1280x800, at about 28 px a line. A median Bridges Afterwards therefore puts it about 360 px lower, and finishAfter scrolls it into view, taking the strip out of sight. Screen 07 (Bridges 4 Chronicle) runs the list past the fold, while the valley's buttons sit on the first screen (screen 14).

</details>

#### bridges-04 (minor, confusing)

- **Lens:** read:bridges. **Place:** bridges.
- **Where:** places/bridges.js:166 even.third (Elsewhere today, the sister's Why?)

**Current:**

> 'Even so, their cart came on today.'

**Proposed:**

> 'Even so, your sister's cart came on today.' (42 characters, a line of its own in the opened reason, so there is room). The Saltmarket already does this: 'Even so, your sister's price was cut today.'

**Why:** Read the likely way, the line points at a third carter who is not in this dealing, or at the Rusk carter. Either reading loses the point that the sister's own act went against what she learned.

**Outcome (fix round 1): fixed.** even.third now reads "Even so, your sister's cart came on today." The Banks have the same ambiguity, so its even.third now reads "Even so, your sister's nets went across today."

<details><summary>Evidence</summary>

Measured: dump-3-always-seed11.txt line 2356 (day 7 closed, Elsewhere Why? opened). The reason reads in order: 'Your sister, toward the Rusk carter' / 'After the Rusk carter's cart crossed' / 'Your sister learned this from you.' / 'When they learned it, you had given way here 6 of 6 times. They do the same.' / 'Day 4: you gave way to the Ansel carter, after their cart crossed.' / 'and 5 more' / 'Even so, their cart came on today.' The nearest 'their cart' is the Ansel carter's, in the line just above, and the Rusk carter's is named in the heading. The cart meant is the sister's.

</details>

#### bridges-05 (minor, drawing)

- **Lens:** read:bridges. **Place:** bridges.
- **Where:** places/bridges.js:110 legendDay.arrived (map key); the day map's arrows (sheet.js, shared grammar)

**Current:**

> legendDay.arrived 'a carter giving way'

**Proposed:**

> Keep the drawing (shared grammar) and say which way the arrow points: legendDay.arrived 'a carter giving way (waving the other on)' (41 characters, shorter than the key's longest item 'learned from you: one arc for each situation', 44). This matches the afterword's 'waving each other on'.

**Why:** A first-time player who looks at the map after closing a day sees the two symmetric outcomes drawn the wrong way round for the story: nobody crossed shows as two crossings, and the jam shows as nothing on the bridge. The cards are right, but the map invites the opposite reading.

**Outcome (fix round 1): rejected.** The arrow is the shared kind-act mark (judge-first-timer REVIEW 5.2). The key's longer text sits in the left column of the 1280x800 day, where the room is a hard rule. The cards say each outcome correctly. Same reasoning as banks-06.

<details><summary>Evidence</summary>

Rendered with page-p5-bridges/check/sheet-svgs.js and render-sheets.py into review-bridges/pics/wide-day-revealed-light.svg.png and pics-dark/. 'You both gave way. Nobody crossed.' is drawn as two arrows crossing the bridge both ways. 'The wheels locked' is drawn as two bars with nothing on the bridge. 'You gave way. Their cart came on and crossed.' is an arrow from your yard toward theirs, the opposite way to their cart. The arrow is the shared 'kind act' mark, kept on purpose (judge-first-timer REVIEW §5.2), and the key calls it 'a carter giving way'. Argued: on a road of carts, an arrow over a bridge reads as a cart crossing.

</details>

### Lens: read:saltmarket

#### salt-01 (blocker, false-sentence)

- **Lens:** read:saltmarket. **Place:** saltmarket.
- **Where:** places/saltmarket.js:252 (lexicon.lastSeason.rests), shown by app.js:1332-1336 seasonLine / words.js:814 W.seasonRests; also the wording of LEAD L1's example

**Current:**

> The town's gain rests on what your stall did in the last season beyond the ways it had kept before, and no stall had yet sold beside that.

**Proposed:**

> No seal this time: without what your stall did differently in the last season, the town's gain would fall short of the seal. (124 characters, shorter than L1's 158-character example. No digits. True for every verdict with wonOnSeason.)

**Why:** On seed 187 the town would still be about 21.6 points better off without the last season, so saying its gain 'rests on' that season is false. The proposed line says exactly what the engine measures: without those acts the gain does not reach the seal. It also says plainly that there is no seal, as L1 asks. L1's example keeps 'the town's gain rests on', so building L1 as written would ship this false claim. The Watch's line ('The border's gain rests on ...') makes the same claim (argued, not measured).

**Outcome (fix round 1): fixed.** lexicon.lastSeason.rests now reads: "No seal this time: had your stall kept to its earlier ways in the last season, and to the guild's rule where it had none, the town would not have been clearly better off." It states what wonOnSeason means ('clearly better off' is the Saltmarket seal's own phrase), so it is true on seeds 187, 175 and 127 as well (ARGUED). The 'rests on' claim and 'sold beside that' are gone. Merged with rules-14 and browser-14.

<details><summary>Evidence</summary>

MEASURED. The engine sets seal.wonOnSeason when mark + season.delta - 2*markSE \< SEAL_MARK (engine.js:1680-1686). That means the mark is clear of the seal's bar only because of the last-season acts. It does not mean the gain itself rests on them. Lives where little of the gain rests on the last season still show the line:
(1) Seed 187, played as the honest seller who cuts once on day 11 beside a stall after both prices held (policy cut11). Kept, 123 of 116; mark +23.00 (se 1.19); every other seal clause false, so L1's condition HOLDS. The season replay's delta is only -1.4 (757 -> 743 of the first 1000). The page shows the line. Command: jsc -e "var CONFIG={place:'saltmarket',seed:187,policy:'cut11'}" review-saltmarket/dump-life.js -> review-saltmarket/life-season-187-cut11.txt.
(2) Seed 175, cut11. Kept, 126 of 124; mark +28.00; delta -8.2; L1 holds; line shown (life-season-175-cut11.txt).
(3) Seed 127, the place's own honest policy ('never put the price back' = 'salt'). Not kept; mark +23.05; delta -2.8; line shown on today's page (life-season-127-salt.txt).
Search outputs: season-partial.js -> season-partial-day11-1-210.txt; season-gain.js -> season-gain-out.txt. For comparison, seed 4 has delta -33.4 against a mark of +32.4, which is the only kind of Life the words fit.

</details>

#### salt-02 (blocker, check-gap)

- **Lens:** read:saltmarket. **Place:** saltmarket.
- **Where:** page-smoke.js:1107-1113; page-p6/check/dom-run-p6.js checkSeasonLine

**Current:**

> page-smoke accepts the line on every verdict with wonOnSeason, whatever share of the mark the last season carries, and whether or not the stall was kept.

**Proposed:**

> Word the line as in salt-01. It then states the meaning of wonOnSeason itself and needs no numeric check. If any 'gain rests on' wording is kept, page-smoke must also play a Life where season.delta is small next to the mark (seed 187 with salt-01's cut11 policy) and fail on it. Add L1's condition in both checks: show exactly when wonOnSeason && houseKept && markClear && !boughtOnLastDay && !lastDayCost && !wonOnLastDay (seeds in salt-03).

**Why:** The check passes while the page says something false.

**Outcome (fix round 1): fixed.** The words now state the meaning of wonOnSeason itself. page-smoke and dom-run-p6 now require the line exactly under L1's condition, and that it begins 'No seal this time: '. W.seasonRests must refuse every other verdict, where before it tried only the first. MEASURED: Saltmarket in page-smoke shows the line 3 times and refuses it for 152 other verdicts (3 with wonOnSeason). PLACE_SEASON_LIVES Saltmarket 35 shows it, and 94 and 113 refuse it, at full counts.

<details><summary>Evidence</summary>

MEASURED. 'jsc page-smoke.js -- saltmarket' prints PAGE SMOKE: PASS with 3 season lines (review-saltmarket/page-smoke-saltmarket.txt). The stand-in DOM run for seed 4 is OK with 1039 checks (review-saltmarket/dom-salt-4.txt). Yet the line is false on seeds 127, 175 and 187 (salt-01). page-smoke checks only three things: the seal is not earned, season.from is 9, and the line has no digit. dom-run checks that the text equals the lexicon string exactly when wonOnSeason is set. Neither check looks at what the sentence claims.

</details>

#### salt-03 (major, confusing)

- **Lens:** read:saltmarket. **Place:** saltmarket.
- **Where:** app.js:1335 (shows on v.seal.wonOnSeason alone); Chronicle, Town block under #chron-noise

**Current:**

> Shown whenever wonOnSeason is set. It never says there is no seal, so a reader with a mark of +32 and no seal is not told that this line is the reason.

**Proposed:**

> Build L1: show the line only under L1's condition, beginning 'No seal this time:' (wording in salt-01). For page-smoke's checks: show on seed 4 (and 35 or 71 at full counts); refuse on seed 23 at small counts and on 94, 127 and 217 at full counts (stall short), 55 (cost) and 113 (bought).

**Why:** A first-time player is given a reason for a missing seal that is not the reason, for example when the stall was simply short. The seeds give page-smoke Lives where L1 must show the line and where it must refuse it.

**Outcome (fix round 1): duplicate.** This is L1, applied as described in watch-02. The Saltmarket Lives where the line must show or be refused are in PLACE_SEASON_LIVES.

<details><summary>Evidence</summary>

MEASURED. Honest seller at the page's own counts, seeds 1..240 (season-search.js -> review-saltmarket/season-search-salt-1-240.txt). Today the line shows where L1 says it must not: stall short on seeds 94, 127 and 217; lastDayCost on 55 and 101; wonOnLastDay with the stall short on 108; boughtOnLastDay on 113 and 225. L1's condition holds on 4, 35, 71, 89, 96, 114, 155, 174, 185, 203 and 232. Seed 127 shows 'Not kept: 97 of 107 coins.' together with the line (life-season-127-salt.txt). At small counts, page-smoke's own seed 23 is a short Life with wonOnSeason (page-p6/out/season-seeds-salt-1-26.txt), so it would now have to be refused. On the page the line sits in the left column under the noise line (screens 04 and 18). Nothing in it names the seal, and the empty seal slot is in the other column.

</details>

#### salt-04 (major, confusing)

- **Lens:** read:saltmarket. **Place:** saltmarket.
- **Where:** places/saltmarket.js:267-272 (charter.futureEnd); first use of 'the ring' at charter.flow.rule (line 264)

**Current:**

> In this future the ring broke. / In this future the ring broke, barely. / In this future the ring held. / In this future the ring held, barely.

**Proposed:**

> In this future the ring broke, and the town was better off. / In this future the ring broke, barely, and the town was better off. / In this future the ring held, and the town paid for it. / In this future the ring held, barely, and the town paid for it. ('paid for it' repeats the cards' 'Both prices held, and the town paid for it.') Room: one more display line in the Afterwards' right column; screen 03 at 1280x800 shows about 140 px free under 'See the count'. The day view is not touched.

**Why:** The inverted charter is the place's lesson ('the mark counts the town'). At the moment of the result, a first-time player can read 'the ring held' as good news.

**Outcome (fix round 1): fixed.** charter.futureEnd now reads: 'In this future the ring broke(, barely), and the town was better off.' and 'In this future the ring held(, barely), and the town paid for it.' MEASURED in the browser on Saltmarket 117 mix: the Afterwards end line is at 765 of 800.

<details><summary>Evidence</summary>

MEASURED and ARGUED. In every dump, the first visible use of 'ring' is the Afterwards strip rule ('The ring breaks if ...', life-seal-10-salt.txt:3486). The Opening, the days and Leaving never say 'ring'. Before the Chronicle, no visible sentence says that the ring breaking is good for the town. Only the listener's strip text says it ('The ring was weakest, and the town best off', aria-label). The Afterwards then ends in display type with 'In this future the ring held.' In this game 'held' is the kind act ('Hold the price') and the valley's good outcome ('the valley held').

</details>

#### salt-05 (major, confusing)

- **Lens:** read:saltmarket. **Place:** saltmarket.
- **Where:** places/saltmarket.js:252, the clause 'and no stall had yet sold beside that' (kept in L1's example)

**Current:**

> ... and no stall had yet sold beside that.

**Proposed:**

> Drop the clause (salt-01's wording does). If a reason is wanted: '..., too late in the selling for any stall to sell by it.'

**Why:** A stall sells beside a stall, not beside 'that'. A first-time player cannot tell what the clause refers to. Read literally ('no stall had sold beside what your stall did'), it is untrue in the very Life the integration screens show.

**Outcome (fix round 1): fixed.** The clause 'and no stall had yet sold beside that' is dropped by the new wording (salt-01).

<details><summary>Evidence</summary>

MEASURED. Seed 4, honest seller. season-detail.js -- 4 shows season.changed = day 10 beside Pell (lived cut, replayed hold) and day 11 beside Pell. Pell then sold beside the stall on days 11 and 12: day 11 'Pell sit4 hold they held', day 12 'Pell sit1 hold they held'. That is the Life of screens 04 and 18.

</details>

#### salt-06 (minor, a11y)

- **Lens:** read:saltmarket. **Place:** saltmarket.
- **Where:** places/saltmarket.js:101 (mapAlt.after)

**Current:**

> Plan of the market: eight stalls on a ring, sixteen pairs of them selling side by side.

**Proposed:**

> Plan of the market: eight stalls round the square, sixteen pairs of them selling side by side. (Listener only, so no visible room is involved.)

**Why:** In this place 'the ring' is the price ring that every count is about. Using the same word for the layout misleads a listener.

**Outcome (fix round 1): fixed.** mapAlt.after now reads 'Plan of the market: eight stalls round the square, sixteen pairs of them selling side by side.'

<details><summary>Evidence</summary>

MEASURED: life-seal-10-salt.txt:3454 and 3486. A listener's first 'ring' is the map's layout ('eight stalls on a ring'). The strip's rule follows immediately: 'The ring breaks if ...'.

</details>

#### salt-07 (minor, other)

- **Lens:** read:saltmarket. **Place:** saltmarket.
- **Where:** words.js:332 (choiceLegend: 'Today, toward ...') and words.js:467 (whyThird title: '..., toward ...')

**Current:**

> Your sister's stall, toward the Maren stall / Today, toward the Pell stall

**Proposed:**

> Your sister's stall, beside the Maren stall / Today, beside the Pell stall. Implementation: a lexicon key, for example toward, set to 'toward' in valley.js so the valley's sentences stay identical (L5), and 'beside' here.

**Why:** 'toward' is the valley's word for a hand travelling to a house. It reaches the market through a shared base string, which the leak check cannot see.

**Outcome (fix round 1): fixed.** Added a lexicon key 'toward' in every place: 'toward' in the valley, Banks, Watch and Bridges, and 'beside' in the Saltmarket. words.js choiceLegend and the whyThird title read it. The valley's output is unchanged (sentence stream identical).

<details><summary>Evidence</summary>

MEASURED: kin-why.js output. The visible label 'Your sister's stall, toward the Maren stall' appears on the Elsewhere today reason, and each card's radio legend says 'Today, toward the Pell stall' (listener). Everywhere else the Saltmarket says 'beside': 'Beside each stall, hold the price or cut it', 'held the price beside the Pell stall'.

</details>

#### salt-08 (polish, clumsy)

- **Lens:** read:saltmarket. **Place:** saltmarket.
- **Where:** places/saltmarket.js:106 (mapAltDay.stay)

**Current:**

> Cutting the price beside {who}.

**Proposed:**

> You mean to cut the price beside {who}.

**Why:** Its partner sentence and the map key ('you mean to hold the price') are full statements; the gerund fragment is the odd one out.

**Outcome (fix round 1): fixed.** mapAltDay.stay now reads 'You mean to cut the price beside {who}.'

<details><summary>Evidence</summary>

MEASURED: listener map text while choosing reads, for example, 'You mean to hold the price beside the Corra stall. Cutting the price beside the Pell stall.' (life-*.txt, map-day aria).

</details>

#### salt-09 (polish, clumsy)

- **Lens:** read:saltmarket. **Place:** saltmarket.
- **Where:** places/saltmarket.js:243 (mattered.none)

**Current:**

> No single way of yours stands out from the luck of the stall boys.

**Proposed:**

> No single way of yours stands out from the luck at the stalls.

**Why:** The noise behind the count is the futures' luck, which the page names 'luck at the stalls' everywhere else. 'The stall boys' names only part of it.

**Outcome (fix round 1): fixed.** mattered.none now reads 'No single way of yours stands out from the luck at the stalls.'

<details><summary>Evidence</summary>

MEASURED: custom and never Lives (life-custom-10-old.txt, life-never-10-never.txt). The futures' luck is 'luck at the stalls and its own chances taken' in oneFuture, rowsExplain and rowsCaption.

</details>

### Lens: rules-leaks

#### rules-01 (blocker, leak)

- **Lens:** rules-leaks. **Place:** banks, watch, bridges, saltmarket (and the valley, where the sentence is frozen by L5).
- **Where:** words.js youLines (the 'even' line after 'They do the same.'); lexicon even.own / even.third in places/banks.js, watch.js, bridges.js, saltmarket.js

**Current:**

> 'Even so, a fire burned on their tower today.' / 'Even so, their nets were in your water today.' / 'Even so, their cart came on today.' / 'Even so, their price was cut today.' / "Even so, your sister's price was cut today."

**Proposed:**

> In the four new places, add no 'Even so' line: youLines pushes L('even.*') only when the place in force is the valley. This is shorter, so it fits the same room. The front of the card already says what was seen. To close the inference fully, the new places could also say the learned count without 'They do the same.', through a place key such as lexicon.youSame. The valley keeps its frozen words.

**Why:** 'Even so' appears only, and always, when a neighbour's or the sister's act was lost to the tide, a shadow, the mule or the stall boy. So the page tells the player which of the other side's missing acts were luck. LEAD 3.2 says the other side only ever sees the result.

**Outcome (fix round 1): rejected.** LEAD 3.2 says each place's luck is said 'always as the valley does', and the valley's frozen words (L5) carry the same 'Even so' line. Dropping it in the new places would leave the front of the card ('a fire burned on their tower') and the back ('They do the same') contradicting each other, with nothing to bridge them. The implication is real for an attentive reader: againstHabit only fires at h = n (reviewer's measurement). That makes it a lead-level question for all five places; see the open issues.

<details><summary>Evidence</summary>

Measured. Command: jsc review-rules/check/evenso.js from the game folder, seeds 1-150 with 3 ways of playing per place; output review-rules/out/evenso.txt. Every Why? card with why.againstHabit (the 'Even so' line) was a neighbour act with a learned habit of exactly 1 that did not arrive. A habit of 1 always intends the act, so the missing act was always the place's luck. Neighbour cards: Watch 175/175, Bridges 156/156, Banks 122/122, Saltmarket 120/120. Sister cards (whyThird): 302/302, 129/129, 136/136, 104/104. A scan of the five-place sentence stream (review-rules/out/stream-all.txt) agrees: all 529 'Even so' lines come right after a count that says always ('N of N times. They do the same.'). Watch example: 'When they learned it, you had stood down here 6 of 6 times. They do the same.' then 'Even so, a fire burned on their tower today.' Argued: the engine sets againstHabit only when every quoted deed agrees, and with a learned habit h/n that means h = n.

</details>

#### rules-02 (blocker, false-sentence)

- **Lens:** rules-leaks. **Place:** watch, saltmarket (REPLAY 'season').
- **Where:** app.js:1335 seasonLine; words.js W.seasonRests; lexicon.lastSeason.rests in places/watch.js and places/saltmarket.js

**Current:**

> if (v.seal && v.seal.wonOnSeason) ... W.seasonRests(v); words: "The border's gain rests on what your tower did in the last season beyond the ways it had before, and no tower had yet lived with that." (no word that there is no seal)

**Proposed:**

> Show the line only when v.seal.wonOnSeason && houseKept && markClear && !boughtOnLastDay && !lastDayCost && !wonOnLastDay, and make W.seasonRests throw for every other verdict. Words as L1: "No seal this time: the town's gain rests on what your stall did in the last season, beyond the ways it had kept before, and no stall had yet sold beside that." For the Watch: "No seal this time: the border's gain rests on what your tower did in the last season, beyond the ways it had before, and no tower had yet lived with that." The Chronicle paragraph has room.

**Why:** Today the line stands under 'Not kept: 131 of 147' as if the season replay were why the seal was withheld, when the house was short anyway. This is L1, binding for this round.

**Outcome (fix round 1): duplicate.** Same as L1 (watch-02 and salt-03): fixed, with the wording from watch-01 and salt-01.

<details><summary>Evidence</summary>

Measured. Command: jsc review-rules/check/season-l1.js -- \<place> \<from> \<to> small, seeds 1-120 x page-smoke's 9 ways of playing, 400/200 counts; outputs review-rules/out/season-watch-*.txt and season-salt-*.txt. Watch: 25 Lives had wonOnSeason, and in 14 of them the seal was out of reach anyway (13 short, 1 wonOnLastDay). Saltmarket: 36 Lives, 24 out of reach (22 short, 10 wonOnLastDay, 2 boughtOnLastDay, 1 lastDayCost; a Life can have more than one). At the page's own counts (review-rules/check/season-confirm.js, out/season-confirm.txt): Watch 13 'first to stand down, with second chances' gives 'Not kept: 131 of 147 sacks.' and the line. Saltmarket 94 'never put the price back' gives 'Not kept: 124 of 126 coins.' and the line. Saltmarket 113, same way, is kept but bought on the last day and wonOnLastDay, and shows the line beside the last-day line. The stand-in DOM shows the same: dom-dump-run.js for watch/phone/13/'watch' and saltmarket/tablet/94/'salt' (out/dumps2/watch-p.txt, saltmarket-q.txt) prints the line in #chron-season under 'Not kept: ...'. Seeds that meet L1 at both counts (the line should show): Watch 35 and 115 with 'first to stand down, with second chances'. At full counts also Watch 3 ('send, except to a house never seen to send') and Watch 20 ('always send'). Saltmarket 4 'never put the price back'. earned was never true together with wonOnSeason, and markClear was never false together with it (0 of 61).

</details>

#### rules-03 (major, check-gap)

- **Lens:** rules-leaks. **Place:** watch, saltmarket (page-smoke.js).
- **Where:** page-smoke.js:294 FEATURE_AHEAD, :572 PLACE_AHEAD_LIVES, :1107-1118 (season-line checks), :1114 (refusal tried once)

**Current:**

> FEATURE_AHEAD = { lastSeason: { REPLAY: 'season' } }; PLACE_AHEAD_LIVES = { watch: [[13, ...]] }; the line is checked only for: not earned, season.from 9, no digit

**Proposed:**

> Per L1 and L2: remove FEATURE_AHEAD and PLACE_AHEAD_LIVES. In liveOne, require that the line is shown exactly when the L1 condition holds, and that W.seasonRests throws for every other verdict (try each one, not only the first). Add Lives at full counts: watch [35, 'first to stand down, with second chances'] and [115, same], which must show it, and watch 13 and saltmarket 94 and 113 'never put the price back', which must refuse it.

**Why:** The checks named for the season line pass while the page breaks L1, and they let the Watch drop back to 'habit' unnoticed.

**Outcome (fix round 1): fixed.** FEATURE_AHEAD and PLACE_AHEAD_LIVES are gone. The line must show exactly under L1; W.seasonRests is tried on every other verdict; and full-count Lives must show it or refuse it (PLACE_SEASON_LIVES; details in watch-03). The mutation of the Watch back to 'habit' is caught.

<details><summary>Evidence</summary>

Measured. page-smoke passes (run tag lead1, and my stream run out/stream-all.txt 'PAGE SMOKE: PASS', 'Seals withheld by the season replay, told in a line: 4' for the Watch) on a page that shows the line for short houses (rules-02). Shadow mutation 'watch habit' (REPLAY 'season' set back to 'habit'; review-rules/check/mutate.py, out/mutate-table.txt): page-smoke PASS and DOM OK, because FEATURE_AHEAD still treats the Watch's words as given ahead, and PLACE_AHEAD_LIVES plays seed 13, a short house. Argued from code: the refusal check at :1114 runs only while !stats.seasonRefused, so after the first refused verdict in a place no other verdict is tried. The words-season-lax mutation (any unearned verdict accepted) was caught only because the first non-won verdict tried was then accepted.

</details>

#### rules-04 (major, false-sentence)

- **Lens:** rules-leaks. **Place:** banks, watch, bridges, saltmarket (the valley too, frozen).
- **Where:** words.js flowAmount / W.flowAlt (the strip's aria-label, app.js finishAfter) against W.futureEnd

**Current:**

> Last ten seasons: 7. The grounds hold at 7 or more. / Last ten seasons: 50 in 100 on average. The line for a moving road is half.

**Proposed:**

> In the new places only (the valley's words are frozen), never round the late average onto the other side of the line: when the rounded figure equals the line but the future is on the other side, add one decimal ('49.7 in 100', '6.98'). This is a few characters longer, in an aria-label, so there is no visual room limit. Add a page-smoke check that the late figure, read against the line, agrees with future.holds.

**Why:** A listener hears the grounds or road averaged exactly the line, then hears that they failed. The words contradict each other in about 1% of Afterwards.

**Outcome (fix round 1): fixed.** words.js lateAmount: in the new places the 'Last ten seasons' figure gets as many more decimals as it takes to stay on the future's own side of the line ('6.98', not '7'). The valley keeps its rounding (FROZEN). page-smoke now reads the figure from the strip in words and checks it against holds and the line, and that it is within rounding of lateFlow. MEASURED: the extra decimal was needed on 1 Banks, 4 Watch, 3 Bridges and 2 Saltmarket strips. Mutation words-late-rounded is caught.

<details><summary>Evidence</summary>

Measured. Command: jsc review-rules/check/probe-current.js with ARGS {place, n:400, from:1000}, 5 ways x 400 seeds, watched future 0 for the custom and random ways; outputs out/probe-current-\<place>.txt. In some watched futures the strip's words put the late average on the good side of the line while futureEnd says the place failed, or the reverse: Banks 7/800, Watch 7/800, Bridges 4/800, Saltmarket 11/800 (valley 8/800). Banks seed 1349 playing the custom: 'Last ten seasons: 7. The grounds hold at 7 or more.' with 'In this future the grounds failed, barely.' (late 6.977). Watch 1231: 'Last ten seasons: 30 in 100 on average. The line for peace is 3 in 10.' with 'not at peace, barely' (0.2984). Saltmarket 1012: '50 in 100 ... The ring breaks below half.' with 'the ring broke, barely' (0.4953). Bridges 14: '50 in 100 ... half' with 'the road jammed, barely'. No check compares these words with the future's own numbers: the shadow mutation words-flow-floor (out/gaps-results.jsonl) passes page-smoke and the DOM.

</details>

#### rules-05 (major, false-sentence)

- **Lens:** rules-leaks. **Place:** banks, saltmarket (the valley too, frozen).
- **Where:** places/banks.js legendAfter.income 'baskets landed this season'; places/saltmarket.js legendAfter.income 'coins taken this season'; app.js:1112 af-num (W.num(h.income))

**Current:**

> baskets landed this season / coins taken this season

**Proposed:**

> 'baskets gained or lost this season' / 'coins gained or lost this season'. These are the Watch's and the Bridges' form, 32-34 characters, which already fit the same map key. As polish: measures(n) names −1 in the plural ('−1 coins').

**Why:** The key names an amount that cannot be below zero next to numbers like −11. A first-time reader cannot square them.

**Outcome (fix round 1): fixed.** legendAfter.income is now 'baskets gained or lost this season' (Banks) and 'coins gained or lost this season' (Saltmarket). MEASURED: the Afterwards keys fit in the browser walks. The polish item ('−1 coins' in the plural) was not taken: measures() is shared with the frozen valley.

<details><summary>Evidence</summary>

Measured (out/probe-current-\<place>.txt, 800 watched futures per place). Some holding shows a season income below zero at some point of the Afterwards in Banks 461/800 futures and Saltmarket 163/800. On the resting map (season 30): Banks 109/800 and Saltmarket 22/800 futures. Example, Banks seed 1000: 'X: −11 baskets in the last season, nets kept home 10 of 16 times.' Saltmarket seed 1011: '−1 coins in the last season'. The Watch and the Bridges already say 'gained or lost'. The valley's 'measures brought in this season' has the same fault (126/800 resting), but its words are frozen.

</details>

#### rules-06 (major, confusing)

- **Lens:** rules-leaks. **Place:** banks.
- **Where:** places/banks.js custom.gloss (shown under the store every day: app.js:576 #store-old)

**Current:**

> would bring in {purse} {goods} this season.

**Proposed:**

> would bring in {purse} {goods} in twelve days. (3 characters longer: one more word on a line that already wraps.)

**Why:** During the first season a player reads 149 baskets as what the custom earns in days 1-4, when it is the whole twelve days, set against a need of about 190.

**Outcome (fix round 1): duplicate.** Same as banks-02, fixed with 'by winter' rather than 'in twelve days'.

<details><summary>Evidence</summary>

Measured: the DOM dumps (out/dumps/banks-*.txt, @store-old, day/choose) show 'The old rule of the cove, ..., would bring in 149 baskets this season.' from day 1. Argued: everywhere else in the Banks a season is four days ('The end of the first season' at day 4; 'Thirty seasons'). The gloss's purse is the custom's purse over all twelve days. The valley says 'this harvest' and the Saltmarket 'in twelve days'.

</details>

#### rules-07 (major, check-gap)

- **Lens:** rules-leaks. **Place:** all places (page-smoke.js, dom-run-p6.js).
- **Where:** page-smoke.js sentenceFault/SKINS; no luck rule anywhere

**Current:**

> No check looks at what a sentence about a neighbour or the sister says about luck.

**Proposed:**

> Give each place a list of luck words (banks: tide; watch: shadow, watchman; bridges: mule; saltmarket: boy, sold below), allowed only in luckNote, reveal/yesterday lostTheirs and lostNone, legendDay.lost and the general luck phrases (oneFuture, rowsCaption, rowsExplain, mattered.none). page-smoke should throw if any other key or any sentence from W.why, whyThird, elsewhere, knowValue, seasonEnd or houseAtEnd carries one. Also flag the 'even' line (rules-01).

**Why:** The page's most important promise has no check. A leak worded outright passes every check.

**Outcome (fix round 1): fixed.** page-smoke gains LUCK words per place (valley 'turned back'; banks tide(s); watch shadow(s), watchman; bridges mule(s); saltmarket boy(s), sold below). They may stand only in luckNote, the lost reveal and yesterday lines, legendDay.lost, oneFuture, rowsCaption, rowsExplain and mattered.none (plus the Banks' mapAlt, for the tide race). This is a static check on every lexicon and charter string. A dynamic noLuck check also runs on every Why? and whyThird line, elsewhere, knowValue and seasonEnd. Mutations watch-even-shadow, watch-mine-shadow and bridges-knew-mule are caught.

<details><summary>Evidence</summary>

Measured, in shadow copies (review-rules/check/gaps.py, out/gaps-results.jsonl). The Watch's even.own set to 'Even so, their watchman lit a fire at a shadow today.' gives page-smoke PASS and DOM OK. Reveal.mine set to 'You stood down alone. Their watchman lit a fire at a shadow.' gives PASS and OK. The Bridges' knew.onceNone set to '... and their mule would not stand.' gives PASS and OK.

</details>

#### rules-08 (major, check-gap)

- **Lens:** rules-leaks. **Place:** all places (page-smoke.js SKINS).
- **Where:** page-smoke.js:65-76 SKINS

**Current:**

> valley list lacks house/houses; watch lacks sack/sacks/peace/hills; bridges lacks stream/downs/jammed/yards/roads; saltmarket lacks arcade/takings/'ring broke'/'ring held'; banks lacks race/dial/chart/'keep off'/'kept off'

**Proposed:**

> Add those words to SKINS. Skip 'ring', 'lane', 'cross' and 'across' on their own: 'on a ring' is every place's mapAlt and 'one-lane' is the Bridges' afterword.

**Why:** A whole sentence still written in another place's words, even the valley's actor name on every card, passes.

**Outcome (fix round 1): fixed.** SKINS gain: valley house(s); banks race, dial, chart, keep off, kept off; watch sack(s), peace, hills; bridges yards, roads, stream, downs, jammed, lane; saltmarket arcade, takings, ring broke, ring held, lane. Merged with code-04. Mutations banks-house-word, bridges-sacks, bridges-peace, bridges-ring-held and valley-hills are caught. Every place's own strings still pass.

<details><summary>Evidence</summary>

Measured, in shadow copies (out/gaps-results.jsonl), all page-smoke PASS and DOM OK. The Banks' house/House set to 'the {name} house' (the valley's actor word, which would appear in every Banks sentence). The Bridges' legendAfter.income set to 'sacks gained or lost this season' (the Watch's goods). Bridges futureEnd.held set to 'In this future the road was at peace.' Bridges futureEnd.fell set to 'In this future the ring held.' My expanded scans of the stream (out/scan-stream.txt) and of 45 DOM dumps (out/scan-dumps.txt) show that none of the words below occurs in another place today.

</details>

#### rules-09 (major, check-gap)

- **Lens:** rules-leaks. **Place:** watch, bridges, saltmarket.
- **Where:** page-smoke.js:206 (wf.S !== (p.S !== 0) || wf.H !== (p.H !== 0)); opening.lines[1] and reveal.neither / reveal.both verbs

**Current:**

> writtenFor S/H record only whether each stake is non-zero

**Proposed:**

> writtenFor gives the sign each outcome's words assume (Watch {both:'+', mine:'-', theirs:'+', neither:'-'}; Bridges {mine:'-', theirs:'+', neither:'-'}; Saltmarket {mine:'-', theirs:'+', both:'+', S:'+'}), and rulesAgainstCopy checks W.stakes(p) against them.

**Why:** 'Gains', 'loses' and 'pays' are rules stated in words. A preset whose sign moves turns them false while every check passes.

**Outcome (fix round 1): fixed.** writtenFor.SIGNS is added in the four new places (watch {both:+, mine:−, theirs:+, neither:−}; bridges {mine:−, theirs:+, neither:−}; saltmarket {both:+, mine:−, theirs:+, S:+}; banks {mine:−, theirs:+}). rulesAgainstCopy checks them against signs it works out from B, C, S, H and the stock start. Mutations of Watch H→−1 and S→−6, Bridges H→−1 and Saltmarket S→−1 are caught.

<details><summary>Evidence</summary>

Measured, in shadow copies (review-rules/check/mutate.py; out/mutate-table.txt; probe output in review-rules/shadow/\<place>-\<name>.probe.txt). Watch H 3 to -1: page-smoke PASS and DOM OK, while the Opening says 'If both keep watch, each pays its watchmen 1.' and the reveal says '... both paid their watchmen. +1'. Bridges H 2 to -1 says 'each loses 1' and shows '+1'; Saltmarket S 2 to -1 says 'the town pays −1 of it'; Watch S 6 to -6 says 'each gains −5 sacks'. These three fail page-smoke only through coverage counters ('no store below zero was told', 'seasonRests never called'), not through any rule check.

</details>

#### rules-10 (major, check-gap)

- **Lens:** rules-leaks. **Place:** bridges.
- **Where:** page-smoke.js need check (only on its 26 seeds); app.js meterInto ('the need is always above zero'); words.js W.store prints need without num()

**Current:**

> need > 0 checked only on the Lives page-smoke plays; W.store: num(purse) + ' of ' + need

**Proposed:**

> In rulesAgainstCopy, scan createLife over seeds 1..5000 for every place (cheap, with no days played) and throw if any need is 0 or less. W.store should print num(need) (polish).

**Why:** The meter and every 'of {need}' depend on a need above zero. A one-unit change to the Bridges' wheel-lock cost breaks that on 1% of seeds unnoticed.

**Outcome (fix round 1): fixed.** rulesAgainstCopy scans createLife over seeds 1..5000 for every place and throws on a need of 0 or less. MEASURED: about 0.3 s per place (60 µs per createLife). W.store now prints num(need). The Bridges H 2→3 mutation is caught.

<details><summary>Evidence</summary>

Measured. With Bridges H 2 to 3 in a shadow copy, page-smoke PASS and DOM OK (out/mutate-table.txt), yet 20 of 2000 seeds have a need at or below zero, lowest −6 (out/bridges-H3-need.txt): seed 158 gives 'Yard: 50 of -3 loads. Your yard is kept.', and 43, 262, 275 give a need of 0. The lowest need over page-smoke's own seeds (1-22, 48213, 'valley-7', 4294967295, 167) is 1. Current presets are safe (LEAD 4: need 6..68).

</details>

#### rules-11 (minor, check-gap)

- **Lens:** rules-leaks. **Place:** banks, watch (any place).
- **Where:** words.js lineWords (rounds the line to one decimal for a stock, to whole hundredths for a share)

**Current:**

> The grounds hold if, over the last ten seasons, the banks between boats average at least 5.8; they began at 5.

**Proposed:**

> rulesAgainstCopy throws unless HOLD_LINE x STOCK.start x 10 (stock) or HOLD_LINE x 100 (shares) is a whole number. Otherwise the line must be said exactly.

**Why:** The rule sentence and the rows' rule would be false at the boundary after an innocent preset change, with no check failing.

**Outcome (fix round 1): fixed.** rulesAgainstCopy throws unless HOLD_LINE × start × 10 (stock) or HOLD_LINE × 100 (shares) is whole. Mutations of the Banks start 6→5 and the Watch HOLD_LINE→1/3 are caught.

<details><summary>Evidence</summary>

Measured, in shadow copies (out/mutate-table.txt; shadow/banks-start5.probe.txt etc.), all with page-smoke PASS and DOM OK. Banks STOCK.start 6 to 5 gives 'average at least 5.8' for a true line of 5.833. Start 6 to 7 gives 'at least 8.2' for 8.167 (a future averaging 8.17 holds). Watch HOLD_LINE 0.3 to 1/3 gives 'at least 33 in 100' for 0.3333. The current presets say the line exactly.

</details>

#### rules-12 (minor, check-gap)

- **Lens:** rules-leaks. **Place:** all places (page-smoke.js FORBIDDEN).
- **Where:** page-smoke.js:54-56

**Current:**

> cooperate|cooperates|cooperated|cooperation|defect...|tit for tat|game theory ... (exact forms only)

**Proposed:**

> Add cooperating, cooperative, co-operate, defecting, defector, defectors, strategic, tit-for-tat, game-theory and pay-off. Also scan index.html's text, which page-smoke does not read for words.

**Why:** The plain-words rule is meant for the theory vocabulary, not five spellings of it.

**Outcome (fix round 1): duplicate.** Same as code-03, fixed there. page-smoke also now scans the text of index.html (style, scripts and tags stripped). Mutations watch-strategic, banks-cooperating and index-defectors are caught.

<details><summary>Evidence</summary>

Measured, in shadow copies (out/gaps-results.jsonl). The Watch's afterword given 'made a strategic choice to stand down first' gives page-smoke PASS and DOM OK. The Banks' afterword ending 'until one of them starts cooperating.' gives PASS and OK. My scans with the wider list find none of these words on screen today.

</details>

#### rules-13 (minor, check-gap)

- **Lens:** rules-leaks. **Place:** all places (dom-run-p6.js).
- **Where:** dom-run-p6.js checkDay / checkStrip; app.js drawStatus (day total) and store-text

**Current:**

> store-text checked only on day 1; #day-status total never checked

**Proposed:**

> In checkDay, require the total text to be W.dayTotal(sum of the four results' payoffs, purse, need), and store-text to be W.store(engine purse, need), on every day. For the Banks, work out the card number from B x stock - C x arrived as page-smoke does.

**Why:** The day's total and the store are the numbers a player watches most, and no check reads them from the page after day 1.

**Outcome (fix round 1): fixed.** dom-run-p6.js checkDay now requires, on every day open and closed, store-text = W.store(engine purse, need). Once the day is closed it requires the total = W.dayTotal(sum of the four cards' numbers worked out from the stakes; the Banks' at x.stock) and r.purse = t.purse + sum. The vacuous Banks card-number check now uses the level. Mutations app-total-plus1 and app-store-plus1 are caught.

<details><summary>Evidence</summary>

Measured, in shadow copies (out/gaps-results.jsonl). app.js showing the day total as r.gained + 1 (Saltmarket) gives page-smoke PASS and DOM OK. app.js showing the store text +1 from day 2 (Bridges) gives PASS and OK. Argued from code: checkDay's card-number check is vacuous for a place with a stock (pay = p.STOCK ? x.payoff : ...; then x.payoff === pay). checkStrip compares the aria-label with W.flowAlt itself, and the town line with W.dayTown itself, so they check wiring, not truth. page-smoke does catch the town's arithmetic (words-town-half caught).

</details>

#### rules-14 (minor, confusing)

- **Lens:** rules-leaks. **Place:** watch, saltmarket.
- **Where:** lexicon.lastSeason.rests (and L1's example wording)

**Current:**

> The border's gain rests on what your tower did in the last season beyond the ways it had before, ...

**Proposed:**

> No seal this time: too much of the border's gain rests on what your tower did in the last season, beyond the ways it had before, and no tower had yet lived with that.

**Why:** 'Rests on' says the whole gain depends on the last season. In some sealed-but-for-the-replay Lives that is only part of it.

**Outcome (fix round 1): duplicate.** Resolved by the new wording (watch-01, salt-01): the line no longer says 'rests on'; it gives the replay's counterfactual.

<details><summary>Evidence</summary>

Measured at full counts (review-rules/check/season-confirm2.js): Watch 3 'send, except to a house never seen to send', an L1 case, has mark +13 and season.delta −7.6. Most of the border's gain stands without the last season; only the part beyond the seal's bar rests on it. Watch 35 (+14 / −29.9) and Saltmarket 4 (+32 / −33.4) are cases where 'rests on' is fair.

</details>

#### rules-15 (minor, false-sentence)

- **Lens:** rules-leaks. **Place:** banks.
- **Where:** places/banks.js opening.lines[1] ('It fills by {fillOne} if either of you keeps off, and falls by {fall} if you both fish across.')

**Current:**

> It fills by 1 if either of you keeps off, and falls by 4 if you both fish across.

**Proposed:**

> It fills by {fillOne} if either keeps off and falls by {fall} if both fish across, within {min} to {max}. (84 characters against 81, in the same line.)

**Why:** The rule as stated is false on about half the days it applies to. The cards then say 'stays full' and 'is spent' with no rule behind them.

**Outcome (fix round 1): duplicate.** Same as banks-01 (fixed).

<details><summary>Evidence</summary>

Measured over 300 seeds x 3 ways (inline jsc run, figures quoted here): on 2,357 of 5,208 days when both fished across (45.3%) the bank fell by less than 4, because it does not go below 1. On 20,394 of 37,992 days when one or both kept off (53.7%) it did not fill, because it was full at 9. The bounds 1 and 9 are never stated on the Opening (TUNE.md §7's suggested line had 'never below 1').

</details>

#### rules-16 (polish, check-gap)

- **Lens:** rules-leaks. **Place:** bridges, saltmarket (page-smoke.js coverage gates).
- **Where:** page-smoke.js 'no Life earned the seal', 'AYWords functions never called' gates on fixed seeds

**Current:**

> Coverage gates hang on fixed seeds (PLACE_SEAL_SEEDS, the season seeds).

**Proposed:**

> When a coverage gate fails, name the gate and the seed-search script to rerun (page-p4/check/seal-seeds.js, page-p6/check/season-seeds.js). Or search a bounded seed range for a covering Life before failing.

**Why:** A true preset change reads as a page failure and sends the builder hunting seeds.

**Outcome (fix round 1): fixed.** The coverage-gate errors now name the cause and the search to rerun: 'no Life earned the seal' points to page-p4/check/seal-seeds.js and PLACE_SEAL_SEEDS; the seasonRests and line gates point to review-fix1/check/season-l1.js and PLACE_SEASON_LIVES.

<details><summary>Evidence</summary>

Measured, in shadow copies (out/mutate-table.txt). Saltmarket FOG 0.04 to 0.08: every sentence true (probe ALL TRUE), but page-smoke FAILS with 'AYWords functions never called in saltmarket: seasonRests'. Bridges C 1 to 2 and Saltmarket C 1 to 2 fail with 'no Life earned the seal'.

</details>

### Lens: browser

#### browser-01 (blocker, layout)

- **Lens:** browser. **Place:** bridges.
- **Where:** places/bridges.js reveal.lostTheirs, reveal.lostNone, reveal.neither, yesterday.lostTheirs, yesterday.lostNone, luckNote; the closed day at 1280x800

**Current:**

> reveal.lostTheirs 'Your mule would not stand, and your cart came on. They saw only a cart coming on. They gave way, and you crossed.' | reveal.lostNone '... Theirs came on too: the wheels locked.' | reveal.neither 'You drove on. Their cart came on too: the wheels locked.' | yesterday.lostNone 'Yesterday your mule would not stand, and your cart came on. They saw only a cart coming on. Theirs came on too.' | luckNote 'A mule can refuse to stand, and then your cart comes on though you meant to give way. It costs and brings what driving on does. The other carter sees only a cart coming on.'

**Proposed:**

> reveal.lostTheirs 'Your mule would not stand. They saw only a cart coming on. They gave way, and you crossed.' (513 px, 2 lines) | reveal.lostNone 'Your mule would not stand. They saw only a cart coming on. Theirs came on too: the wheels locked.' (551 px) | reveal.neither 'You drove on. Theirs came on too: the wheels locked.' (295 px, 1 line) | yesterday.lostNone 'Yesterday your mule would not stand. They saw only a cart coming on. Theirs came on too.' (500 px) | yesterday.lostTheirs 'Yesterday your mule would not stand. They saw only a cart coming on. They gave way.' (473 px) | luckNote 'A mule can refuse to stand: your cart then comes on as if you drove on. The other carter sees only a cart coming on.' (641 px, 2 lines). Every one is shorter than the string it replaces. The other side still only sees the cart.

**Why:** L4 makes 1280x800 a hard no-scroll rule. The Bridges breaks it in most Lives, and the line that explains the mule's luck is the part pushed off the screen.

**Outcome (fix round 1): fixed.** Bridges wording is now: reveal.lostTheirs 'Your mule would not stand. They saw only a cart coming on. They gave way, and you crossed.'; lostNone '... Theirs came on too: the wheels locked.'; neither 'You drove on. Theirs came on too: the wheels locked.'; the yesterday mule lines likewise; luckNote 'A mule can refuse to stand: your cart then comes on as if you drove on. The other carter sees only a cart coming on.'. MEASURED at 1280x800 dark (sweep2): all 6 Bridges Lives are 800 in every state.

<details><summary>Evidence</summary>

MEASURED, auto-player, 1280x800 dark. Bridges 117 mix: closed days 802,800,802,800,822,840,859,822,820,822,838,820. 151 alt: 842. 168 late: 842. 100 tft: 823. So 4 of 6 Lives go over 800; the valley went over in 1 of 16 Lives, by 2 px. Breakdown at 117 day 7: cards 250+248, Elsewhere 88, luck note 55 px (3 lines), so the luck note lies wholly below the fold (screen 21). Canvas widths against the 311 px card text box: reveal.lostTheirs 642 and lostNone 680 (3 lines; the valley's are 2); reveal.neither 315 (2 lines; the valley's 1); yesterday.lostNone 630 (3 lines). The luck note is 958 px in a 477 px box (3 lines; the valley's 657 px, 2 lines). With the proposed words in page memory only: 117 mix 859->804, 151 alt 842->804, 100 tft 823->800. Output: review-browser/notes-sweep-1280x800-dark.txt

</details>

#### browser-02 (blocker, layout)

- **Lens:** browser. **Place:** watch.
- **Where:** places/watch.js reveal.neither, yesterday.neither; the closed day at 1280x800 (and the open day at 1366x700)

**Current:**

> reveal.neither 'You kept watch. A fire burned on their tower too, and both paid their watchmen.' | yesterday.neither 'Yesterday you kept watch. A fire burned on their tower too.'

**Proposed:**

> reveal.neither 'You kept watch. A fire burned on theirs too: both paid.' (300 px, 1 line) | yesterday.neither 'Yesterday you kept watch. A fire burned on theirs too.' (298 px, 1 line). Both are shorter. The −3 is still accounted for ('both paid'). It also matches lostNone's 'A fire burned on theirs too.'

**Why:** This breaks the same hard rule in most Border Lives. The day's commonest outcome costs a second line in every card that has it.

**Outcome (fix round 1): fixed.** Watch reveal.neither is now 'You kept watch. A fire burned on theirs too: both paid.' and yesterday.neither 'Yesterday you kept watch. A fire burned on theirs too.'. MEASURED: Watch 117, 151, 168, 50377, 74739 and 401 are 800 in every day state at 1280x800 (sweep2).

<details><summary>Evidence</summary>

MEASURED, 1280x800 dark: Border 117 mix 822, 134 stft 802, 151 alt 825, 168 late 822 (4 of 6 Lives); 74739 tft and mix 822. By hand at 1280x800 light, 74739: days 5-11 at 804, day 12 at 822, and the luck note cut off (screens 08, 22). Canvas widths: reveal.neither 441 px (2 lines in a 311 px box; the valley's neither is 229 px, 1 line); yesterday.neither 326 px (2 lines). The 'both keep watch' outcome is common, so two cards often carry it. With the proposals in page memory: 151 alt 825->804; 117 mix 822->820 (the residual is covered in browser-04).

</details>

#### browser-03 (major, layout)

- **Lens:** browser. **Place:** saltmarket.
- **Where:** index.html .status-town; places/saltmarket.js town.some; the day status at 1280x800

**Current:**

> .status-town { font: 400 var(--t-m)/1.3 ...} runs inline after the day's total: 'Where both prices held beside you, the town paid 4 coins more today.'

**Proposed:**

> Keep the words. In a Saltmarket-only rule, set .status-town on its own line at the cards' small size: display:block; font-size 13px; line-height 16px. The sentence is about 385 px at 13px, so it fits the 465 px box on one line. The status is then 26+16 = 42 px, the height of the Next day button's row, so the cards start at 185 as in the valley. (ARGUED from the measured widths and heights; not tried in the page.)

**Why:** Of the four new places, only the Saltmarket adds a line above the cards, and that line alone pushes its day past 800.

**Outcome (fix round 1): fixed.** Added a Saltmarket-only rule in index.html: .status-town {display:block; font-size: var(--t-s); line-height: 1rem}. MEASURED on Saltmarket 117 mix day 5: the status runs 135-177, the cards start at 185 as in the valley, and every day state is 800 at 1280x800.

<details><summary>Evidence</summary>

MEASURED: Saltmarket 117 mix is at 810 on days 5-12 at 1280x800 dark. Breakdown at day 5: the status is 49 px tall where it is 26 elsewhere, and the cards start at y=193 where they start at 185 elsewhere. The status box is 465 px wide. Its first part ('Today: +9. Takings: 34 of 96 coins.') takes 280 px, and the town sentence (15px/19.5px) is 444 px, so it wraps onto a second line. Screen 18.

</details>

#### browser-04 (major, check-gap)

- **Lens:** browser. **Place:** all.
- **Where:** the day at 1280x800: Elsewhere entries with Why?, the 'They changed a way' line, two-line luck reveals; the check list in page-p6/check/run-final.sh

**Current:**

> No real-layout check. The page meets the hard rule only on the seeds that were walked.

**Proposed:**

> Fix the words first (browser-01, -02, -03). The lead then decides on one shared spacing change that removes about 20 px in the worst valid state: for example, the Elsewhere Why? buttons set inline at the line's own height, or a tighter gap above the luck note. Until then, add a real-browser sweep to the review gate (the auto-player in notes-sweep-1280x800-dark.txt runs a Life in about 15 s).

**Why:** Words alone cannot guarantee 800. The rule needs a layout decision and a check that measures it.

**Outcome (fix round 1): fixed.** Two rules for the new places only, inside the compact-laptop media query: an Elsewhere Why? stands at its line's height (min-height 0, padding-block 0.12rem), and the luck note has max-width none, running one line across the cards' 689 px. To fit that line, the Watch, Banks and Saltmarket luck notes were shortened with their meaning kept (636/643/646 px, measured by canvas). MEASURED in sweep2 (24 new-place Lives, 1280x800): every open, chosen, closed and season state is 800. In the worst state measured (Bridges 117 mix day 7 closed) Elsewhere is 88→66 px, the luck note 36→18 px, and the day ends 27 px above the fold. The valley is untouched and itself reaches 820 there (open issue). The review-gate browser sweep script is review-fix1/check/autoplayer.js.

<details><summary>Evidence</summary>

MEASURED: the valley itself reached 802 in 1 of 16 Lives (117 mix). With the browser-01/02 words in memory, Border 117 mix day 8 is still at 820. That day has the luck reveal 'Your watchman lit a fire at a shadow. They saw only a fire. A fire burned on theirs too.' on 2 lines (as the valley's luck reveals are), a changed-way line in two cards, and two Elsewhere entries, each with its Why? button (88 px in all). The Banks' 802 (50377 by hand and 117 mix) equals the valley's worst. Nothing in run-final.sh measures real text wrapping. The integration report's 'at most 800 in every state' rested on one Life per place.

</details>

#### browser-05 (major, layout)

- **Lens:** browser. **Place:** banks, watch, bridges.
- **Where:** 1366x700, the open day (before choosing); places/banks.js legendWays.sent and its ways count; watch and bridges yesterday strings

**Current:**

> Banks ways count 'kept to your water 28 of 28' (the valley's: 'sent a hand 24 of 25') | Border yesterday.neither 326 px | Bridges yesterday.lostNone 630 px

**Proposed:**

> Border and Bridges: the strings in browser-01/02. Banks: legendWays.sent 'kept off' (the count becomes 'kept off 28 of 28'; ARGUED that this lets the dots keep the valley's room). It also brings the Banks down to one name for the act (browser-12).

**Why:** L4 says a new place should not scroll at 1366x700 in a state where the valley does not, where words can fix it. These three can be fixed without moving the valley.

**Outcome (fix round 1): fixed.** The Banks counts were shortened (banks-03) and the Watch and Bridges strings shortened (browser-01, browser-02); in addition, the Saltmarket wayCount is now 'held {h} of {n}', because '28 of 28' wrapped its marks. MEASURED at 1366x700 light, seeds 300, 311, 322 and 333: every open and chosen state in the Banks, Watch, Bridges and Saltmarket is 700. Before: Banks 703-714, Watch 705-708, Bridges 707-723, Saltmarket 706/714. The valley's chosen states reach 706.

<details><summary>Evidence</summary>

MEASURED, 1366x700 light, the same seeds and ways of playing in every place (300 tft, 311 mix, 322 stft, 333 send). The valley's open day was 700 in all 48 days. Banks: 703-714 (333 send day 12: the left column ends at 706 while the right ends at 696; the Ways rows wrap their dots, screen 24). Border: 705-708 (322 stft day 5: three cards have the 2-line yesterday.neither). Bridges: 707-723 (322 stft day 9: a 3-line yesterday.lostNone plus the 3-line luck note, screen 23). The Saltmarket's open day stays at 700. Its chosen states reach 706-714, as does the valley's (706). Output: notes-sweep-1366x700-light.txt

</details>

#### browser-06 (major, layout)

- **Lens:** browser. **Place:** all (valley included).
- **Where:** Opening at 320x640: #opening-places (two rows) above #begin

**Current:**

> The five options wrap to two rows on a 320 px phone, and Begin falls below the first screen in every place.

**Proposed:**

> This needs the lead's call. Either exempt 320 px from L4's Begin rule, or give the chooser one row below 360 px: a native select of the five places, 40 px tall, saves about 46 px; together with about 6 px less gap above the chooser, the valley's Begin comes to about 639. The option widths (395 px of text plus gaps) cannot fit one row of 288 px without shrinking the type below 11 px.

**Why:** L4 says Begin is on the first screen at every size. The chooser that this version adds breaks that on the smallest phone, the valley included.

**Outcome (fix round 1): rejected.** Needs the lead's call, and was not changed. MEASURED at 320x640: Begin's bottom edge is at 691 in the valley, 714 in the Bridges and Saltmarket, and 759 in the Banks and Watch; the chooser takes two rows (86 px). A one-row select saves about 46 px, which still leaves the valley at about 645, so it would not meet the rule alone (ARGUED). At the listed 400x800 size Begin is at 592-637, on the first screen.

<details><summary>Evidence</summary>

MEASURED at 320x640: Begin's bottom edge is at 691 (valley), 736 (Banks), 759 (Border), 714 (Bridges; 746 under #bridges-4) and 714 (Saltmarket), all below the 640 fold. The chooser takes two rows (86 px) (screen 28). At 400x800 Begin is at 592-648, on the first screen. ARGUED: without the chooser (v0.1.0), the valley's Begin would sit near 600.

</details>

#### browser-07 (major, confusing)

- **Lens:** browser. **Place:** bridges.
- **Where:** words.js W.store (shared), used by #store-text, the Chronicle house line and the last-day line

**Current:**

> '{purse} of {need} {goods}': '50 of 27 loads'

**Proposed:**

> A lexicon template for a store that can start above its need, given by the Bridges only, so the valley's function and words are unchanged: '{purse} {goods}, need {need}', giving '50 loads, need 27'. It is 3 characters longer; the store heading has about 350 px free at 1280 (screen 12). ARGUED.

**Why:** '50 of 27' reads as a mistake. In every other place, 'X of Y' means progress toward a total.

**Outcome (fix round 1): rejected.** 'X of Y' is the game's shared store form. Every kept house ends with X > Y (for example 'Kept: 154 of 153 coins'), and the meter beside it marks the need. A Bridges-only form would touch W.store, dayTotal, leavingStore, houseLine, pastLife and the last-day line, plus their checks, for a reading issue. Left for the lead (open issues).

<details><summary>Evidence</summary>

MEASURED: day 1 reads 'YARD 50 of 27 loads' (screen 12), and Bridges 117 day 7 reads 'Yard: 34 of 31 loads'. The yard starts above the need in every Bridges Life (STORE_START), so the first thing a newcomer reads is a count larger than its total. The same form shows up in the Saltmarket Chronicle: 'Your takings would have been 100 of 96 coins.'

</details>

#### browser-08 (major, drawing)

- **Lens:** browser. **Place:** bridges.
- **Where:** sheet.js, the Bridges' holding (cart drawing) under #af-num-* in the Afterwards map

**Current:**

> A negative season number drawn over the cart's load lines, with only a stroke halo

**Proposed:**

> Draw the number on a solid paper plate (a rect behind the text) in the Bridges' holding, or set the cart lower and to the right so that the number's row is clear. Then check the Saltmarket's awning stripes the same way. The text is unchanged.

**Why:** A loss reads as a gain: a newcomer sees '32' on every cart of a jammed road.

**Outcome (fix round 1): fixed.** Added a Bridges-only CSS rule: #map-after .m-num gets stroke-width 6px (the halo was 3.5px). sheet.js is unchanged, so the valley's maps fingerprint stays 7a78d3e9. MEASURED on Bridges 51955, always giving way, at the Afterwards end, magnified about 7x: '−32' reads with a single minus. With 3.5px set back inline on the same number it reads '=32'.

<details><summary>Evidence</summary>

MEASURED: Bridges 51955, always giving way, Afterwards end. Every number on the map is '−32' (SVG text read), but at real size it reads '32'. At 2.2x and 6x zoom, the minus sign lies between the cart's horizontal load lines, and the 3.5 px halo does not separate them: '=32' (screens 15, 16). The key reads '21 loads gained or lost this season'. The Border's '−2' over its upright tower reads correctly (screen 09).

</details>

#### browser-09 (blocker, check-gap)

- **Lens:** browser. **Place:** saltmarket, watch.
- **Where:** app.js seasonLine (it shows the line whenever v.seal.wonOnSeason); words.js W.seasonRests; page-smoke.js (the lastSeason group requires the line exactly when wonOnSeason)

**Current:**

> The line shows on any wonOnSeason, and its words do not say there is no seal. page-smoke passes because it enforces exactly that rule.

**Proposed:**

> Apply L1: show the line only when wonOnSeason && houseKept && markClear && !boughtOnLastDay && !lastDayCost && !wonOnLastDay, with words that begin 'No seal this time: ...'. page-smoke should require the line exactly then and refuse it on Saltmarket 4 'custom-then-stay'. For L2, read the Border's line in normal play on Border 20 'always send', after confirming it at page-smoke's own counts.

**Why:** Under L1 the page is wrong today, and its check passes while it is wrong. A newcomer meets an unexplained sentence about a seal they never saw, sometimes on a Life that was simply short.

**Outcome (fix round 1): duplicate.** This is L1 (watch-02 and salt-03): fixed, with the new 'No seal this time:' wording. The Border 20 'always send' line was read in the browser.

<details><summary>Evidence</summary>

MEASURED in the browser, files as they stand. Saltmarket 4, played by the custom and then cutting from day 9: the Chronicle reads 'Not kept: 125 of 153 coins.' and still shows 'The town's gain rests on what your stall did in the last season...' (screen 29). Saltmarket 4 'never put the price back': kept 154 of 153, mark +32, the same line, no seal. Border 20 'always send': kept 167 of 144, mark +19, the Border's line, no seal. Neither line says that there is no seal. jsc season-find.js over seeds 1-40: 18 Saltmarket and 22 Border Lives with a late change have wonOnSeason while the house is short, and every one would show the line today. For L2, season-find-smoke.js found Lives where L1's condition holds at full counts: Border 20 'always send', Border 20 and 3 'send, except to a house never seen to send', Saltmarket 4 'never put the price back' and its selfish variant (check/season-smoke-*.txt). These were not checked at page-smoke's smaller counts.

</details>

#### browser-10 (major, interaction)

- **Lens:** browser. **Place:** all.
- **Where:** app.js choosePlace/setPlace/drawOpening; #opening-valley above #h-opening; the hash

**Current:**

> As L3 describes, plus the two reload effects

**Proposed:**

> As L3 says: keep the line's room whether or not it shows (for example, visibility:hidden in place of hidden), so nothing above the chooser moves. On choosing, history.replaceState to '#\<place>'. Read the bare '#\<place>' form. Keep the seed only while the hash still carries it. This also fixes both reload cases.

**Why:** The page moves under the pointer, and the address names a place the player is not in, so a reload lands in another place.

**Outcome (fix round 1): fixed.** L3 in app.js: choosePlace now calls writeHash(id) (history.replaceState to '#\<place>'). setPlace rewrites a hash that names another place, which covers the restore paths. The bare '#\<place>' form is read, and drawOpening(true) keeps a number line that was showing in its room (class is-held: visibility hidden, aria-hidden). MEASURED at 1280x800 from #bridges-4, with a real click on Banks: h1 69→69, chooser row 153→153, premise 209→209, hash #banks, history.length 50→50. Arrow keys to Bridges gave #bridges with no seed. A reload mid-Life opens the Saltmarket's Opening. dom-places 'hash', 'choose' and 'restore' were updated and pass; mutations app-no-hash-write and app-note-hides are caught.

<details><summary>Evidence</summary>

MEASURED at 1280x800, preview.html#bridges-4, a real click on Banks. Before: 'Bridges no. 4' at y=36, h1 at 69, chooser row at 153, Begin at 566. After: the line is hidden, h1 is at 36, the row at 120, Begin at 533. The chooser moved 33 px up under the pointer. Arrow keys back to Bridges bring the line back and move the row down 33 px (screens 30-32). The hash stays '#bridges-4' and history.length is unchanged. Begin then plays 'Banks no. 82070' under #bridges-4, and a reload opens 'Bridges no. 4'. A place chosen without a hash and then reloaded mid-Life opens the valley's Opening. '#banks' (bare) opens the valley (not yet read).

</details>

#### browser-11 (major, confusing)

- **Lens:** browser. **Place:** banks.
- **Where:** places/banks.js custom.gloss (#store-old on every day)

**Current:**

> '...would bring in {purse} {goods} this season.'

**Proposed:**

> '...would bring in {purse} {goods} by winter.' (2 characters shorter)

**Why:** On this page 'season' means four days, so the figure misleads by a factor of three.

**Outcome (fix round 1): duplicate.** Same as banks-02 (fixed with 'by winter').

<details><summary>Evidence</summary>

MEASURED: every Banks day reads 'The old rule of the cove, to keep off with a new boat and then do as they did yesterday, would bring in 144 baskets this season.' (screens 01-03). The same page calls days 1-4 'the first season' ('The end of the first season') and the Afterwards counts thirty seasons. The valley says 'this harvest', the Saltmarket 'in twelve days' and the Border 'by winter'. As a first-time player, I read 144 as a four-day figure against a need of 216.

</details>

#### browser-12 (minor, clumsy)

- **Lens:** browser. **Place:** banks.
- **Where:** places/banks.js: act.send 'Keep to your water', legendWays/knowValue 'kept to your/their water' against opening line 2 'keeps off', custom.gloss 'keep off', titles 'After you both kept off', legendDay.planned 'you mean to keep off'

**Current:**

> Mixed 'keep to your water' and 'keep off'

**Proposed:**

> Use 'kept off' in the Ways count and legend ('kept off 28 of 28'; shorter, see browser-05). Keep the button 'Keep to your water' and, in Opening line 2, say once '...keeps to their water (keeps off)'. Or use 'keep to your water' everywhere except the titles, which have no room.

**Why:** A newcomer has to work out that the two phrases name the same act.

**Outcome (fix round 1): partial.** Every count, the Ways legend, the Leaving note, 'mattered' and the resting-map words now say 'kept off', which matches the titles and 'you mean to keep off'. The button keeps 'Keep to your water', and the full sentences (reveals, Why?) keep 'kept to ... water'. Adding a parenthetical to the Opening would add a line to an Opening that is already the tallest (measured for the Watch case in browser-13).

<details><summary>Evidence</summary>

MEASURED by reading the day and Opening text: the same act appears under two names on one screen, for example the button 'Keep to your water', the Ways row 'After you both kept off' and the map key 'you mean to keep off' (screen 01).

</details>

#### browser-13 (minor, confusing)

- **Lens:** browser. **Place:** watch.
- **Where:** places/watch.js titles ('After a fire on their tower' ...) and legendDay.stay

**Current:**

> legendDay.stay 'you keep watch'

**Proposed:**

> legendDay.stay 'you keep watch: a fire lit' (the map key row has room at 1280 and at 400). ARGUED.

**Why:** The five situation names rest on a link the page never states.

**Outcome (fix round 1): rejected.** MEASURED: every addition tried on the Watch's Opening line 1 ('..., your fire lit', '... with a fire lit', '... a fire lit on your tower') takes it from 2 lines to 3 (45→68 px), and the Watch's Opening is already the tallest. The link between keeping watch and a fire is carried by 'You kept watch. A fire burned on theirs too' and by the luck note ('your tower then keeps watch that day. The other tower sees only a fire.').

<details><summary>Evidence</summary>

MEASURED by reading day 1: the Ways rows and the card's 'Counts in your ways under' speak of 'a fire on their tower' before anything plainly says that keeping watch means a fire is lit. Only the luck note implies it ('your tower then keeps watch that day') (screen 06/07).

</details>

#### browser-14 (minor, confusing)

- **Lens:** browser. **Place:** watch, saltmarket.
- **Where:** lexicon lastSeason.rests (the L1 wording)

**Current:**

> '...rests on what your tower did in the last season beyond the ways it had before...' (and L1's example 'beyond the ways it had kept before')

**Proposed:**

> 'No seal this time: the border's gain rests on what your tower did in the last season, beyond its earlier ways or where it had none, and no tower had yet lived with that.' (The Saltmarket uses the same shape with 'stall' and 'sold beside'.)

**Why:** The replay also reaches situations met for the first time in days 9-12, and the line should stay true in that case.

**Outcome (fix round 1): duplicate.** Resolved by the new wording (watch-01): 'and to the border custom where it had none' covers situations first met in days 9-12.

<details><summary>Evidence</summary>

MEASURED (jsc check/watch20.js -> watch20-out.txt): Border 20, played 'always stand down', has its seal withheld because the tower first met 'after fires on both towers' on days 11-12, stood down there, and the replay used the custom, which keeps watch (delta −21.2). The line 'what your tower did in the last season beyond the ways it had before' then reads as false to a player who did the same thing every day.

</details>

#### browser-15 (minor, layout)

- **Lens:** browser. **Place:** banks, bridges.
- **Where:** Afterwards end: #ticker expands fully

**Current:**

> The list expands fully at the end.

**Proposed:**

> In places with more looked-round entries, keep the list in its scroll box at the end, with the newest entries visible, so that the end line and See the count sit under the strip as in the valley (a place-only rule).

**Why:** The strip and the map that explain the verdict leave the screen at the moment the verdict appears.

**Outcome (fix round 1): duplicate.** Same as bridges-03 (fixed): the ticker stays a scroll box at rest in the new places. Afterwards end now 800-873 px.

<details><summary>Evidence</summary>

MEASURED at 1280x800: the Afterwards end page is 1130-1209 px tall in the Banks and 1036-1542 in the Bridges, against 800-952 in the valley. Bridges 168 late: 37 entries (1034 px), and the page scrolls 714 px, so the map, the strip and the rule are off screen and the left half is empty (screen 36).

</details>

#### browser-16 (minor, layout)

- **Lens:** browser. **Place:** all.
- **Where:** app.js drawPast('chron-past', ...) with no limit; KEEP_LIVES 60

**Current:**

> Every stored life of the place is listed.

**Proposed:**

> Show the newest 3 and fold the rest, as the Opening does ('N older lives').

**Why:** The new afterword would be buried under a long list for returning players.

**Outcome (fix round 1): partial.** The Chronicle now lists the newest 20 lives of the place (PAST_IN_CHRONICLE 20), as v0.1.0 kept and listed 20. There is no fold: adding one would change the valley's Chronicle markup. dom-run-p6 and dom-places 'store' now expect min(20, ...).

<details><summary>Evidence</summary>

MEASURED: the Border Chronicle lists all 13 stored Border lives (303 px) with no fold, while the Opening shows 2 plus '13 OLDER LIVES'. ARGUED: at about 22 px a line, one place with 60 stored lives would list about 1,300 px above the afterword. v0.1.0 kept 20.

</details>

#### browser-17 (minor, clumsy)

- **Lens:** browser. **Place:** saltmarket, watch.
- **Where:** places/saltmarket.js placeNo 'Market no. {seed}', pastName 'Market {seed}'; the hash key 'watch' for 'Border'

**Current:**

> 'Market no. {seed}' / 'Market {seed}'

**Proposed:**

> 'Saltmarket no. {seed}' / 'Saltmarket {seed}' (4 characters longer; the day bar and the lists have room). Also accept '#border-\<seed>' as an alias of '#watch-\<seed>'.

**Why:** One place should have one name across the chooser, the page and the address.

**Outcome (fix round 1): fixed.** Saltmarket placeNo is now 'Saltmarket no. {seed}' and pastName 'Saltmarket {seed}'. The hash also accepts each place's label ('#border-3' is the Watch's no. 3), measured in the browser. Merged with code-11.

<details><summary>Evidence</summary>

MEASURED: the chooser says 'Saltmarket', the day bar 'Market no. 77261', the earlier lives 'Market 4' and the address '#saltmarket-4'. The chooser says 'Border', but the address must be '#watch-3'.

</details>

#### browser-18 (minor, confusing)

- **Lens:** browser. **Place:** all (valley sentence, frozen).
- **Where:** words.js W.closeDay (the disabled Close-the-day button)

**Current:**

> 'Choose for all 4 houses'

**Proposed:**

> Report only (L5 freezes the valley's words). If the words are ever reopened: 'Choose for each of the 4 houses'.

**Why:** It reads as a bulk action.

**Outcome (fix round 1): rejected.** Report only: the valley's sentence is frozen (L5), and W.closeDay is shared.

<details><summary>Evidence</summary>

MEASURED: as a first-time player, I clicked 'Choose for all 4 houses' (and 'for all 4 boats' and so on) on day 1 expecting it to choose for all four at once. It is the disabled Close button, and nothing happened.

</details>

#### browser-19 (minor, confusing)

- **Lens:** browser. **Place:** bridges (valley sentence).
- **Where:** the Chronicle's 'The way that mattered most' when the verdict's mattered is null

**Current:**

> 'No single way of yours stands out from the luck at the bridges.'

**Proposed:**

> Report only (the shape is the valley's). If places may word it: when every way was the same act, say 'You gave way in every situation, so no one way stands out from the others.'

**Why:** A newcomer with −31 is told that nothing they did stands out.

**Outcome (fix round 1): rejected.** Report only, as the reviewer proposed. The sentence is true by the engine: with every habit at 1, neither what-if moves the count. The shape is the valley's shared W.mattered.

<details><summary>Evidence</summary>

MEASURED: Bridges 51955, always giving way: mark −31, and the section says 'No single way of yours stands out from the luck at the bridges.' (Chronicle text read). In the Bridges, always giving way is exactly what jams the road.

</details>

### Lens: code

#### code-01 (major, check-gap)

- **Lens:** code. **Place:** all (found with the Banks).
- **Where:** page-smoke.js:650-667 (PLACE_RULES / neutral) with its only calls at 794 (yesterday), 848 (reveal), 901 (elsewhere); W.why at 872 and W.whyThird at 902 are never checked

**Current:**

> var card = W.why(x, kinId, since);   ...   if (e.why.source.type === 'you') { W.whyThird(e, life.houses[kinId].name, kinId); ... }   (no neutral() on either)

**Proposed:**

> After line 872: `card.lines.forEach(function (ln) { if (ln.kind === 'even' || ln.kind === 'plain') neutral(ln.text, 'why'); });`. At 902: `W.whyThird(e, life.houses[kinId].name, kinId).lines.forEach(function (ln) { if (ln.kind === 'even' || ln.kind === 'plain') neutral(ln.text, 'whyThird'); });`. The deed, count and lead lines stay out: they name the reader's own acts and the situation titles, and in the valley the title 'after both houses stayed home' would trip the valley pattern by design.

**Why:** The page's top rule is that it never says whether a missing act was luck or a choice. The back of the Why? card is where the other side's missing act is told ('Even so...', 'and no hand came'). The check named for this rule never reads those lines, so a leak there would ship with every check green.

**Outcome (fix round 1): fixed.** page-smoke whyBack() applies neutral() to the 'even' and 'plain' lines of W.why and W.whyThird, and noLuck() to every line. Mutations banks-even-choice and banks-knew-choice are caught. The real words pass in all five places.

<details><summary>Evidence</summary>

MEASURED. I made a shadow copy (review-code/shadow-neutral) where the Banks even.own reads 'Even so, they fished across into your water today.' and knew.onceNone reads 'Before today you had seen them here once, and they fished across.' Both say the other boat chose to fish across. neutral-reach.js shows the two lines told 15 and 17 times on Why? cards in 40 Banks Lives. `jsc page-smoke.js -- banks` in the shadow still ends 'PAGE SMOKE: PASS' (review-code/out-shadow-neutral-banks.txt). The proposed check (neutral-why.js) flags 0 of 29,624 'even'/'plain' Why? lines across the five places on the real words (out-neutral-why.txt) and 68 on the shadow (out-neutral-why-shadow.txt).

</details>

#### code-02 (minor, check-gap)

- **Lens:** code. **Place:** all.
- **Where:** words.js:79-84 (fillIn); page-smoke.js:57 (BAD_BITS) and 340 (static check)

**Current:**

> return t.replace(/\{([A-Za-z]+)\}/g, function (m, k) { ... });

**Proposed:**

> var out = t.replace(/\{([A-Za-z]+)\}/g, function (m, k) { ... }); if (/[{}]/.test(out)) throw new Error('AYWords: a slot left unfilled in ' + what + ': ' + out); return out;   (No sentence carries a brace today, so the valley stream should not move; argued.)

**Why:** A typo in a slot name (an underscore, a digit, a space) would put raw braces on screen, and both words.js and page-smoke would pass it.

**Outcome (fix round 1): fixed.** words.js fillIn now throws 'a slot left unfilled' if a brace survives the fill. The valley stream is unchanged (6d84219b). Mutation banks-brace ('{the_level}') is caught.

<details><summary>Evidence</summary>

MEASURED. fillIn fills only /\{[A-Za-z]+\}/, so any other slot is printed as it stands. Shadow copy review-code/shadow-brace: the Banks stock.holds.text set to 'holds {the_level}'. `jsc page-smoke.js -- banks` ends 'PAGE SMOKE: PASS' (out-shadow-brace-banks.txt), even though every Banks card on its morning would read 'holds {the_level}'. bankMorning builds its expected text from the same template, so the two agree. brace-gap.js: sentenceFault('...costs you {cost_n} baskets...') returns null (out-brace-gap.txt). By contrast '{lvl}' is caught ('nothing fills {lvl}').

</details>

#### code-03 (minor, check-gap)

- **Lens:** code. **Place:** all.
- **Where:** page-smoke.js:53-56 (FORBIDDEN, FORBIDDEN_RE)

**Current:**

> var FORBIDDEN = ['cooperate', 'cooperates', 'cooperated', 'cooperation', 'defect', ... 'tit for tat', 'game theory', 'player', 'players', 'firm', ...];

**Proposed:**

> var FORBIDDEN_RE = /(^|[^a-z])(co-?operat[a-z]*|defect[a-z]*|prisoners?|dilemmas?|strateg[a-z]*|payoffs?|tit[- ]for[- ]tat|game[- ]theor[a-z]*|players?|firm|soft|takers?|wary|steady|poachers?)([^a-z]|$)/i;   (the six founder kinds stay whole words)

**Why:** The plain-words rule covers theory words in any form, but the check only knows a few spellings.

**Outcome (fix round 1): fixed.** FORBIDDEN_RE now matches every form: co-?operat*, defect*, prisoners?, dilemmas?, strateg*, pay-?offs?, tit[- ]for[- ]tat, game[- ]theor*, players?, with the six founder kinds as whole words. The text of index.html is scanned too. Merged with rules-12.

<details><summary>Evidence</summary>

MEASURED. forbidden-gap.js evaluates page-smoke's own lines 53-56. These pass as clean: 'defecting', 'cooperating', 'cooperative', 'tit-for-tat', 'dilemmas', 'strategic', 'Game-theory', 'defectors' and 'Co-operate' (out-forbidden-gap.txt). No page text contains any of them today (grep over words.js, places/*.js, index.html, app.js, sheet.js).

</details>

#### code-04 (minor, check-gap)

- **Lens:** code. **Place:** watch, bridges, saltmarket.
- **Where:** page-smoke.js:63-75 (SKINS)

**Current:**

> watch: [... 'shadow', 'alarm', 'alarms', 'beacon'], bridges: [... 'yard', 'load', 'loads', 'road'], saltmarket: [... 'boy', 'market']

**Proposed:**

> Add 'hills' to watch; 'stream', 'downs', 'lane' to bridges; 'arcade', 'lane' to saltmarket.

**Why:** The leak list is how page-smoke finds words left over from another place. The map labels are single words, so a copied map block is the likeliest such slip, and today it would pass.

**Outcome (fix round 1): duplicate.** Merged into rules-08 (hills, stream, downs and lane added). Fixed.

<details><summary>Evidence</summary>

MEASURED. skins-gap.js copies each place's map labels into every other place. With SKINS as they stand, 28 copies are not caught, for example 'the hills' or 'beyond the hills' in the valley and 'the stream' or 'the downs' in the Banks. With the additions proposed below only 1 is missed ('the lane', a word the Bridges' afterword uses too), and 0 lexicon strings of any place are flagged (out-skins-gap.txt).

</details>

#### code-05 (minor, drawing)

- **Lens:** code. **Place:** banks.
- **Where:** places/banks.js:297 (notes: ridge dy -6); sheet.js:606 (a far-line note's y is the line's middle point, whatever n.x is); sheet.js:715-720 (check() tests the far line against the crop, not its note)

**Current:**

> { label: 'ridge', at: 'farLine', x: 0.5, dy: -6 },

**Proposed:**

> { label: 'ridge', at: 'farLine', x: 0.5, dy: -3 },  This clears the frame by 1.0-3.3 px at all four sizes and keeps the baseline 3 px above the shore ('the headland' has no descenders). Moving x would not help without a code change, because the y ignores x. Optional: a check() rule that a far-line note's top, at the narrowest box's letterUp, stays below crop + pad.

**Why:** The Banks' shore peaks at its middle (0.262), so the note sits 8 px higher than in any other place. On phones its lettering and halo cut into the frame. This is Banks-only data and does not move the valley.

**Outcome (fix round 1): fixed.** The Banks' ridge note now has dy −3. MEASURED with the reviewer's notes-dy.js: it clears the frame by 1.0-3.3 at 288-368 px compact and by 1.1 wide, with the baseline 3 above the shore. In the browser at 400 and 320 px its em box stays inside the frame.

<details><summary>Evidence</summary>

COMPUTED from sheet.js output (notes-crop.js, notes-wide.js, notes-dy.js; out-notes-dy.txt), taking ascenders as 0.72 em (argued). This is 'the headland' on a phone's cropped day map, top of its letters against the frame's top edge: +0.3 px in a 368 px box (400 px phone), -0.6 px at 328, -2.0 px at 288 (320 px phone), and -1.9 px on the wide sheet in 576-639 px windows, which are still cropped. The other four places clear by 5.9-12.2 px. The p6 screen 27-banks-400x800 shows the lettering on the frame line.

</details>

#### code-06 (minor, interaction)

- **Lens:** code. **Place:** all.
- **Where:** app.js:1386 (goOpening calls fixFromHash, not applyHash); app.js:1553 (a hashchange outside the Opening is only recorded); app.js:1404 (restore puts the snapshot's place in hand under any hash)

**Current:**

> function goOpening() { ... fixFromHash(); drawOpening(); showView('opening'); ... }

**Proposed:**

> In goOpening, replace `fixFromHash();` with `applyHash();` (it puts the hash's place in hand and fixes its seed, as a load does). When L3's replaceState lands, put the rewrite in setPlace so that restore paths also leave an address naming the place in hand, and update the dom-places 'restore' expectations.

**Why:** L3(b): the address must not name a place other than the one in hand. Choosing is not the only path that breaks this. A hash changed mid-Life is silently ignored at the return to the Opening, while the same hash is obeyed everywhere else.

**Outcome (fix round 1): fixed.** goOpening now calls applyHash(), so a hash changed during a Life is obeyed on the way back, as on a load. Restore paths rewrite a hash that names another place (setPlace). dom-places 'hash' and 'restore' check both; mutation app-goopening-fix is caught.

<details><summary>Evidence</summary>

MEASURED (dom-review.js scenario 'hashlife', out-hashlife.txt). Load #valley-7 and Begin. On day 3 the address changes to #watch-3. Play to the Chronicle and press 'Choose another place': the valley's Opening appears with the valley option checked, the address still #watch-3 and no number line. Begin then plays valley no. 79667 under #watch-3. The same address on a fresh load, or changed on the Opening, puts the Watch in hand with seed 3. dom-places-p4.js 'restore' asserts the same kind of mismatch as wanted (lines 283 and 311-314).

</details>

#### code-07 (minor, layout)

- **Lens:** code. **Place:** all (most visible on a place link).
- **Where:** index.html:798-811 (the Opening's valley copy at rest; \<fieldset id="opening-places" hidden>); app.js:1564-1587 (start(), which may wait for claude.hot.ready)

**Current:**

> (no rule hides the Opening before app.js has put a place in hand)

**Proposed:**

> One rule after the token blocks: `:root:not([data-place]) .opening { visibility: hidden; }`. start() marks the root (markPlace), writes the copy and shows the chooser in one task, so the first Opening anyone sees is the right place with its chooser already in its row. Re-run the valley-only page fingerprint after.

**Why:** A first-time visitor following a link to the Bridges briefly sees the valley, and the Opening jumps when the chooser arrives. This works against L3's aim that nothing around the chooser moves.

**Outcome (fix round 1): fixed.** Added ':root:not([data-place]) .opening { visibility: hidden; }'. start() marks the root before anything is shown. MEASURED: the page renders in every browser walk; the valley-only page and five-place walk fingerprints are unchanged (the stand-in DOM does not read CSS). ARGUED, not measured: that this removes the flash on the host, whose hot.ready timing cannot be reproduced locally.

<details><summary>Evidence</summary>

ARGUED, not measured: this lens may not use the browser. The copy at rest must be the valley's (page-smoke 'opening copy at rest' hooks). The scripts are separate files at the end of the content, and on the host start() runs only when hot.ready calls it. Until then a #bridges-4 link paints the valley's premise, lines and colours, then swaps to the Bridges. Every load also paints the Opening without the chooser, which then appears above the premise (one row, 40 px per p6) and pushes the premise, the lines and Begin down.

</details>

#### code-08 (minor, false-sentence)

- **Lens:** code. **Place:** README.md.
- **Where:** README.md:29 and the 'variants keep the v0.1.0 code' sentence in 'How it works, briefly'

**Current:**

> "...and when they store one they keep 20 entries without their places, which the main page then reads as the valley's." and "...and accept the same option."

**Proposed:**

> "...and when they store one they keep only the newest 20; look B also drops each entry's place, so the main page then lists those lives as the valley's." and "...and accept `#valley-<number>` only." (When L3 lands, the URL paragraph should also say that `#<place>` alone chooses a place.)

**Why:** The README describes the folder for whoever runs it next. The storage sentence was argued from look B alone (p6 report) and is wrong for A and C.

**Outcome (fix round 1): fixed.** README now says: the variants accept '#valley-\<number>' only and keep the newest 20, and look B drops places (as the reviewer's variants-store output shows). It also gains the '#\<place>' form, the label alias, the address rewritten on choosing, the Chronicle's 20, and 120-155 Lives.

<details><summary>Evidence</summary>

MEASURED. variants-store.js runs each variant's own loadLives/saveLife on a list holding Banks, Watch and valley lives (out-variants-store.txt). Looks A and C write every older entry back with its place; only B drops places. All three keep 20. Each variant reads only /^#valley-.../ (variants/a/app.js:1041, b:661, c:128), so '#bridges-4' fixes nothing there.

</details>

#### code-09 (polish, code-bug)

- **Lens:** code. **Place:** all.
- **Where:** app.js:1398-1399 (restore returns false at once for view 'opening')

**Current:**

> if (!data || data.seed === null || data.seed === undefined || !data.view || data.view === 'opening') return false;

**Proposed:**

> if (data && data.view === 'opening') { if (typeof data.place === 'string' && hasOwn(P.byId, data.place) && !state.hash) setPlace(data.place); return false; }  (then the existing guard). start() already redraws the Opening when the place moved.

**Why:** The snapshot already carries the place in hand, and a host reload should not undo the reader's choice.

**Outcome (fix round 1): fixed.** restore() with view 'opening' now puts the snapshot's place in hand unless the address names one, then returns false; start() redraws the Opening. dom-places 'restore' checks both cases.

<details><summary>Evidence</summary>

MEASURED (dom-review.js 'snapopen', out-snapopen.txt). Choose the Banks on the Opening; the host's snapshot is {place:'banks', view:'opening', ...}. After a host reload with that snapshot, the Opening shows the valley.

</details>

#### code-10 (polish, other)

- **Lens:** code. **Place:** watch.
- **Where:** places/watch.js:245-247; words.js:17-19; page-smoke.js:33-35 and 288-291 (comments)

**Current:**

> watch.js: "The Watch's rules replay the habit today; the lead has decided it takes the season replay (REPLAY 'season'), so its words are here ahead of its rules..."; words.js: "(p.REPLAY 'season': the Saltmarket) ... a place may give it ahead of its rules (the Watch)."

**Proposed:**

> watch.js: "The Watch's rules replay the last season (REPLAY 'season'): its words for a seal that replay withheld." words.js: "(p.REPLAY 'season': the Watch and the Saltmarket) gives one line for a seal that replay withheld (lexicon.lastSeason), read by seasonRests." Drop the 'ahead' sentences from page-smoke together with FEATURE_AHEAD / PLACE_AHEAD_LIVES (L2).

**Why:** These comments now describe a state that no longer exists and would mislead the next editor.

**Outcome (fix round 1): fixed.** Updated the comments in watch.js, the words.js header (REPLAY 'season': the Watch and the Saltmarket) and page-smoke (header and FEATURE_GROUPS); the 'ahead' code is removed. Merged with watch-05.

<details><summary>Evidence</summary>

MEASURED. engine.js:583 now gives the Watch REPLAY 'season'. The lead1 page-smoke run reports 'Seals withheld by the season replay, told in a line: 4' for the Watch with no override note (page-p6/out/lead1-page-smoke.txt:655).

</details>

#### code-11 (polish, confusing)

- **Lens:** code. **Place:** watch, saltmarket.
- **Where:** app.js:512-516 (readHash reads engine keys only); places/watch.js:89-90 and places/saltmarket.js:86-87 ('Border no. {seed}', 'Market no. {seed}')

**Current:**

> state.hash = m && hasOwn(P.byId, m[1]) ? { place: m[1], seed: m[2] } : null;

**Proposed:**

> Accept each place's own word as well: build `var ALIAS = {}` once from AYPlaces (W.placeLabel(id).toLowerCase() and the word of pastName before '{seed}', lower-cased) and read `var key = hasOwn(P.byId, m[1]) ? m[1] : ALIAS[m[1]];`. The written form stays the engine key.

**Why:** After L3 the address bar will show '#watch' beside a chooser that says 'Border'. A reader sharing 'Border no. 3' cannot reach it from what the page says.

**Outcome (fix round 1): fixed.** readHash now accepts '#\<label>-\<seed>' and '#\<label>' through placeKey() (built from W.placeLabel). The written form stays the engine key. Measured: '#border-3' gives 'Border no. 3' in the browser and in dom-places 'hash'.

<details><summary>Evidence</summary>

MEASURED (hash-names.js, out-hash-names.txt). '#watch-3' shows 'Border no. 3' and '#saltmarket-77' shows 'Market no. 77'. But '#border-3' and '#market-77', the addresses a reader would build from those names, open the valley with no number and no word of why.

</details>

## Fix round 1

Fixer round 1 is done, and every check passes on the final files. Of the 77 findings: 50 fixed, 2 partial, 14 duplicates merged and 11 rejected with reasons. engine.js, harness.js and sheet.js are untouched. The valley's sentence stream (6d84219b) and its valley-only page and maps fingerprints (abf3fee6 / 7a78d3e9) are unchanged, and so is the five-place valley walk (c8f9bb5d). The only change in valley.js is a lexicon key whose output is the same text.

Lead decisions applied:
- **L1:** the season line shows only under L1's condition, enforced in words.js, app.js, page-smoke and the stand-in DOM. Its new wording is true in every such Life because it states the engine's own replay rule. For the Watch: "No seal this time: had your tower kept to its earlier ways in the last season, and to the border custom where it had none, the border would not have been clearly better off." The Saltmarket has the same form with "the guild's rule" and "the town".
- **L2:** the Watch's 'ahead' machinery is removed. Full-count Lives now must show the line (Watch 115, Saltmarket 35) or refuse it (Watch 13, Saltmarket 94 and 113).
- **L3:** choosing a place writes '#\<place>' with replaceState. The bare and label-alias forms are read. A number line that was showing keeps its room, so nothing above or around the chooser moves (measured in the browser). goOpening and restore now respect the address.
- **L4:** new-place words were shortened, and two place-only spacing rules were added for the laptop day. In the browser, every new-place day state is 800 at 1280x800 over 24 Lives, and every new-place open or chosen state is 700 at 1366x700.
- **L6:** neither item was built.

Checks added and mutation-tested: luck-word placement, the neutral rule on the back of Why? cards, broader skins and theory words (including index.html's text), stake signs, a scan for needs above zero, an exactness check on the line, the late figure on the future's side of the line, the daily total and store in the DOM, and the L3 address behaviour. All 33 mutations are caught, each made in a shadow copy.

The valley itself still reaches 820 at 1280x800 in one Life. That is its published layout, and changing it is the lead's call (open issues). Paths in the notes are relative to `<scratch>/places/`.

Open issues it left:

- The valley as published breaks the 1280x800 hard rule: valley 117 mix reaches 820 on day 7 closed and 802 on days 5-12 (measured, sweep2). The two place-only rules (Elsewhere Why? at line height; the luck note one line across the cards, the valley's being 657 px against 689) would fix it, but they would visibly change the valley, which L5 forbids beyond the chooser and afterword. The lead must choose between L4 and L5 for the valley.
- browser-06: at 320x640 Begin is below the fold in every place (valley 691, Bridges and Saltmarket 714, Banks and Watch 759; measured). A one-row select alone would not bring the valley above 640 (argued). The lead should exempt 320 px or choose a layout.
- rules-01: in all five places the 'Even so' line follows 'They do the same' only when the learned count is N of N, so an attentive reader can infer that the other side's missing act was luck. The valley has the same pattern and its words are frozen. This is the lead's call for all five places.
- browser-07: the Bridges' yard reads '50 of 27 loads' from day 1. I kept the shared 'X of Y' form; the lead may want a Bridges-only form, which touches every store sentence and its checks.
- browser-16: the Chronicle lists the newest 20 lives of the place with no fold. The Opening's fold still holds all of them.
- code-07: whether hiding the Opening until a place is marked removes the flash on the host cannot be measured locally, because hot.ready timing is not reproducible here.
- Polish not taken: a season number of −1 is said '−1 coins' or '−1 baskets'. measures() is shared with the frozen valley.
- Not walked this round: whole Lives at 1440x960, and the 320 px day in places other than the Banks.
- The stand-in DOM has no history object. dom-places installs a replaceState shim, so its history.length check is trivially true there; the real check (history.length 50→50) was made in the browser.
- The Banks' Opening line 2 now wraps to 4 lines. The Opening is still no taller than the Watch's, but it has no spare room in the 1366x700 or 1280x800 Openings with lives listed (measured: 774 / 800).

Files it changed:

- after-you/index.html
- after-you/words.js
- after-you/app.js
- after-you/page-smoke.js
- after-you/places/valley.js
- after-you/places/banks.js
- after-you/places/watch.js
- after-you/places/bridges.js
- after-you/places/saltmarket.js
- after-you/README.md
- after-you/preview.html
- `<scratch>/places/page-p6/check/dom-run-p6.js`
- `<scratch>/places/page-p6/check/run-dom.sh`
- `<scratch>/places/page-p4/check/dom-places-p4.js`
- `<scratch>/places/review-fix1/` (check/: mutate.py, season-l1.js, autoplayer.js, stepper.js, leaving-alt.js, params.js; out/; orig/ holds the pre-edit copies of the three check scripts)

It reported 19 checks (not reproduced here).

## Verification 1: fix-needed

Verifier round 1 verdict: fix-needed, for two blockers. Every check reproduces: page-smoke PASS, harness gates identical, all 26 DOM configurations OK, dom-places 6/6, sheet and contrast checks clean. The valley's fingerprints match the lead's exactly (stream 6d84219b with 382,559 sentences identical; abf3fee6/7a78d3e9; the walk at c8f9bb5d with 0 changes), and engine.js, harness.js and sheet.js are untouched.

Most fixes hold, measured in a real browser. L3 works: nothing above the chooser moves, and the address is rewritten with no new history entry. The new places now stay inside 1280x800 on every day state over 16 whole Lives, and inside 1366x700 for open and chosen states. 400x800 and 1440x960 are clean, and there were no console errors.

Blocker 1, the season line. Its new wording ('...would not have been clearly better off') is still false in plain words wherever the replayed mark stays well above zero but under the seal's bar. MEASURED in the stand-in DOM: the Watch's own honest way on seed 45 shows mark +9 with noise of about 2, yet the replay would leave +6.45. In the Watch search (seeds 1-45, the page's own counts), 4 of 8 Lives where the line shows are like this. Saltmarket 187 and 175 (cut11) would leave +21.6 and +19.8. Fix: tie the clause to the seal ('...would not have been better off by enough for a seal').

Blocker 2, rules-01. The 'Even so' line tells the reader exactly when the other side's missing act was luck. The fixer rejected the finding and escalated it to the lead, which is reasonable, but it is an unresolved leak and needs the lead's ruling.

Also for the lead (non-blocking): Begin at 320x640 is still below the fold in every place (browser-06). Opened from a seed link with stored lives, the Banks and Watch Openings scroll by 2-7 px. My outputs are in `<scratch>/places/review-verify1/`.

### Blocking (2)

#### 1. The new season line is still false in plain words in many L1 Lives (watch-01, salt-01, rules-14 and browser-14 are marked fixed or duplicate but are not fixed)

**Evidence:** MEASURED. The fixer replaced 'rests on' with '...the border/town would not have been clearly better off.' wonOnSeason only means that mark + season.delta - 2SE falls below the seal's bar (5 for the Watch, 20 for the Saltmarket). The page never states that bar. The line sits directly under the noise line ('about 2/3 points either way'), so a reader takes 'clearly' to mean 'beyond that noise'. Run in the stand-in DOM with the real app.js: `jsc -e "var CONFIG={seed:45,policy:'first to stand down, with second chances',screen:'laptop'}" review-watch/check/dump-life.js review-verify1/check/print-verdict.js` -> review-verify1/out-watch-45-honest.txt. This is the Watch's own honest way at the page's own counts. The Chronicle shows 'Kept: 131 of 90 sacks', 'Your mark: +9', 'A different 2000 futures would move the mark by about 2 points either way.' and then the line. The verdict has mark 9.25, se 0.96 and season.delta -2.80, so the replayed mark is +6.45 (+4.52 after 2SE). That is clearly better off by the page's own noise statement. Watch 39 'always send' gives replay +6.2 with noise 3 (out-watch-39-always.txt). `jsc review-fix1/check/season-l1.js -- watch 1 45 full` -> review-verify1/season-l1-watch-1-45-full.txt: of 8 Watch Lives where L1 holds, 4 have a replayed mark of +5.0 to +6.5 (seeds 3, 39, and 45 under two ways). Saltmarket 187 and 175 'cut11' (review-saltmarket/dump-life.js plus print-verdict.js -> review-verify1/out-salt-verdicts.txt): mark +23 and +28 with noise 3 show the line, though the replayed mark is +21.6 and +19.8. The fixer's argument that the line 'states the engine's own rule' does not hold: the Saltmarket's seal phrase 'clearly better off' never appears in a Life that shows this line, and the Watch's seal says only 'border better off'.

**Proposed:** Tie the clause to the seal's bar, which makes it true in every L1 Life by definition and keeps it free of digits. Watch: 'No seal this time: had your tower kept to its earlier ways in the last season, and to the border custom where it had none, the border would not have been better off by enough for a seal.' Saltmarket: '...the town would not have been better off by enough for a seal.' (Or salt-01's 'the town's gain would have fallen short of the seal'.) Add Watch 45 'first to stand down, with second chances' (shown) to PLACE_SEASON_LIVES, so a Life whose replay stays above zero is always read. Re-run run-final.sh.

**Outcome (fix round 2, verify1-1): fixed.** Reproduced (MEASURED). Watch seed 45, played the honest way, at the page's own counts in the stand-in DOM with the real app.js: mark 9.25, se 0.96, season.delta -2.80, so the replayed mark is +6.45. The page says the noise is 'about 2 points', yet the line said the border 'would not have been clearly better off' (review-fix2/out/before-watch-45-honest.txt). FIX: places/watch.js and places/saltmarket.js lastSeason.rests now end '...the border/town would not have been better off by enough for a seal.' This is true of every L1 Life by the engine's own rule (mark + season.delta - 2 SE \< SEAL_MARK). It has no digits and never prints the bar. The comments above both lines say why. page-smoke.js changes: (1) every shown season line must end ' by enough for a seal.'; (2) a new counter, stats.seasonRestsClear, counts shown lines whose replayed mark stays above the noise the page states (ceil(2 SE)), and is printed; (3) PLACE_SEASON_LIVES.watch gains [45, 'first to stand down, with second chances', true, true], whose fourth entry fails page-smoke if that Life's replayed mark ever drops below the stated noise; (4) a stray comment in freshStats is tidied. page-p6/check/run-dom.sh gains the DOM configuration {place:'watch',screen:'laptop',seed:45,policy:'watch'}. Saltmarket (MEASURED, review-fix2/check/season-above.js -> out/season-above-salt-46-400.txt plus review-verify1/season-l1-salt-1-45-full.txt): under page-smoke's own ways of playing, 29 Lives in seeds 1-400 meet L1, and in none does the replayed mark rise above the stated noise (highest +2.85 against 'about 3'). Only the review-only way 'cut11' (seeds 175, 187) gets there, so no Saltmarket Life was added; the wording check still covers its 3 shown lines. Mutations: 5 of 5 caught. After the fix, real browser: Watch 45 at 1280x800 and Saltmarket 35 at 400x800 dark both show the new line directly under the noise line.

#### 2. rules-01, a luck leak through 'Even so', is rejected and unresolved in all four new places: a lead ruling is needed before ship

**Evidence:** MEASURED by reading the code. engine.js:710 sets againstHabit = (p >= 1 && !arrived) || (p \<= 0 && arrived). Luck only ever takes a kind act away, so the second arm never fires. words.js youLines (450-461) pushes even.own or even.third only when againstHabit is set, right after 'N of N times. They do the same.' On the back of a Why? card, 'Even so, ...' therefore appears exactly when the other side's missing act was the place's luck (the tide, the shadow, the mule, the boy). The reviewer measured the same, 100% in every place (review-rules/out/evenso.txt). The fixer's rejection is a fair escalation: LEAD 3.2 says luck is said 'always as the valley does', the valley's frozen words carry the same line, and dropping only the 'Even so' line would leave the card contradicting itself without closing the inference. But the task's rule ('never says or implies') is broken in the four new places as they would ship.

**Proposed:** The lead rules. Either (a) accept the published valley's practice for all five places and record it as an exception to the plain-words rule, or (b) in the four new places only, through place keys, drop both 'They do the same.' and the 'Even so' line from the you-sourced Why? back. The valley stays frozen under L5. Until the lead rules, do not ship.

**Outcome (fix round 2, verify1-2): rejected.** Confirmed but not changed: this needs a lead ruling. Reproduced (MEASURED: jsc review-rules/check/evenso.js -> review-fix2/out/evenso-repro.txt, identical to review-rules/out/evenso.txt). In every place, against = youHabit1NoHand and againstOther = 0. engine.js move() sets intended = true when p >= 1, and only FOG loses a hand, so 'Even so' appears exactly when the other side's missing act was luck. Why it is left as it is: LEAD 3.2 binds each place to tell luck 'always as the valley does'. The published valley (git show v0.1.0:words.js, lines 274-280) carries the same 'They do the same.' / 'Even so' lines, and L5 freezes them. Choosing between (a), recording an exception, and (b), dropping both lines in the four new places, is the lead's call; the finding itself asks for that. ARGUED notes for the lead: (b) narrows the inference but does not close it, because the back still says 'They learned this from you' and 'N of N times'. Building (b) also needs a new lexicon key in all five places, with the valley's text unchanged, because page-smoke's shape check requires the valley's key set. Until the lead rules, this stays a ship blocker.

### Not blocking (10)

- browser-06 (rejected, lead's call): at 320x640, Begin is still below the fold in every place. MEASURED in my browser tab: valley 691, Bridges and Saltmarket 714, Banks and Watch 759. The Banks were 736 when the browser reviewer measured, so banks-01's four-line Opening line made them 23 px worse. The rejection is fair because the finding itself asked the lead to decide, but L4 ('at every size Begin is on the first screen') still needs that decision.
- Opening at 1280x800 opened from a seed link with 3 or more stored lives: Banks 802 and Watch 807. At 1366x700 both are 807. Begin stays on the first screen at 630 in both. MEASURED in the browser. This is the Opening, not the day, so it is not under the hard rule, but the fixer's claim that every Opening is 800 at 1280x800 with lives does not hold when the number line shows. The Banks case is new: its Opening line 2 now wraps to four lines (banks-01).
- browser-07 (rejected): the Bridges' yard reads '50 of 27 loads' from day 1. The reason holds (it is the shared 'X of Y' form, true, and the alternative is costly). This is a reading issue for the lead, not a false sentence.
- Rejections judged sound: bridges-02 ('against your habit' would be false for a situation first met on day 12, where n is 0); banks-06 and bridges-05 (the shared arrow grammar, and no room in the key at 1280x800); browser-13 (MEASURED: it adds a line to the tallest Opening); browser-18 and browser-19 (valley sentences frozen under L5, report only).
- Partial fixes are acceptable: browser-12 (the counts say 'kept off', the button and the full sentences keep 'kept to your water') and browser-16 (the Chronicle lists the newest 20 lives, with no fold).
- The 'What became of your ways' box in the new places opens scrolled to its closing lines. With overlay scrollbars nothing shows that earlier lines sit above. MEASURED on Bridges 51955 always-give-way: 12 items, a 224 px box, scrollTop 133, so the first visible line is 'Season 5: ...'. Consider a cue that earlier lines exist (a fade, or one line such as 'and N earlier changes').
- The valley's own day still passes 800 at 1280x800: valley 211 played tit-for-tat reaches 804 on days 9-12 (MEASURED), and the fixer saw 820 on 117 mix. This is the published layout, and the L4-versus-L5 call for the valley is the lead's (fixer's open issue).
- The new season line drops LEAD 4.2's reason ('which nobody had yet lived with'). L1's 'for example' allows other words, but the lead should confirm the content.
- Polish: in index.html, the comment about the held number line ('a place just chosen: the number line keeps its room...') trails the `:root:not([data-place]) .opening` rule instead of sitting beside `.sheet-no.is-held`.
- code-07 (the Opening hidden until a place is in hand) can only be argued: the host's hot.ready timing cannot be reproduced locally. If start() never ran on the host, the Opening would stay invisible rather than showing the valley's copy without working controls.

## Fix round 2

verify1-1 is fixed. The season line was false in many L1 Lives: on Watch 45 the replayed mark stays +6.45 against a stated noise of about 2, yet the line said the border would not have been clearly better off. The Watch's and the Saltmarket's lines now end 'would not have been better off by enough for a seal.' This is true by the engine's own rule in every L1 Life and has no digits. page-smoke now requires that ending on every shown line, reads Watch 45 (a Life whose replay stays above the noise) with a drift guard, and the stand-in DOM gains that Life; 5 of 5 mutations were caught. verify1-2 was reproduced but rejected for a lead ruling: 'Even so' appears exactly on the other side's luck, in the valley as published too, and LEAD 3.2 and L5 bind the places to the valley's practice; it stays a ship blocker. L1 to L6 were re-checked: L3 in the real browser at 1280x800, 400x800 and 1366x700, the new line in the real browser at 1280x800 and 400x800. run-final.sh fix2 passes everything: page-smoke 220.5 s, harness gates identical, the valley stream 6d84219b identical line for line, page abf3fee6 and maps 7a78d3e9, the five-place walk unchanged, DOM 27 of 27 OK. engine.js and harness.js are untouched. preview.html was regenerated and is byte-identical. Open: the Even so ruling, and Begin below the first screen at 320x640 in every place including the valley.

Open issues it left:

- SHIP BLOCKER (verify1-2): the 'Even so' Why? line appears exactly when the other side's missing act was luck, in all five places (MEASURED). The lead must choose: (a) record it as an exception to the plain-words rule, keeping the valley's practice everywhere; or (b) drop 'They do the same.' and 'Even so' in the four new places only (ARGUED: narrows but does not close the inference; needs a new lexicon key in all five places, valley text unchanged). Not changed in this round.
- L4 at 320x640 (MEASURED, browser-06, left open by fix1): Begin is below the first screen in every place, the valley included. Valley: chooser 70-155 px (two rows, 86 px), Begin 649-691; Banks and Watch reach 759. The five options need about 417 px of a 288 px row, so the chooser cannot go to one row without shrinking text. A fix would change the valley's Opening layout at 320 px. The lead should say whether 320x640 counts in 'every size'. At 1280x800, 1366x700 and 400x800, Begin is on the first screen (MEASURED).
- Saltmarket: none of page-smoke's own ways of playing gives an L1 Life whose replayed mark stays above the stated noise (seeds 1-400, MEASURED). Only the review-only way 'cut11' does (seeds 175, 187). The new wording check applies to every shown line, but only the Watch has such a Life listed (seed 45).
- From earlier rounds, not re-measured here: the valley's own day scrolls slightly at 1280x800 in a few closed days, as published (browser review: valley 117 mix 802; fix1: up to 820). The valley is frozen under L5; fix1 measured every new place at 800.
- 1366x700 with earlier lives listed: the Opening scrolls (736 px measured with one Saltmarket life). This is accepted under L4: Begin stays on the first screen at 608.
- page-map/golden-page.js and page-smoke.js -- nowhere exit 3, as expected (unchanged since the integration).

Files it changed:

- after-you/places/watch.js
- after-you/places/saltmarket.js
- after-you/page-smoke.js
- after-you/preview.html (regenerated, byte-identical)
- `<scratch>/places/page-p6/check/run-dom.sh` (one configuration added: Watch 45 laptop, so app.js shows the line where only the seal's bar makes it true; original kept in review-fix2/orig/page-p6-check/)
- `<scratch>/places/review-fix2/check/season-above.js` (new)
- `<scratch>/places/review-fix2/check/mutate.py` (new)
- `<scratch>/places/review-fix2/check/fixedplayer.js` (new)
- `<scratch>/places/review-fix2/out/fix2-places.diff` (the word changes as a diff)

It reported 21 checks (not reproduced here).

## Verification 2: fix-needed

The fixer's verify1-1 fix is correct and broke nothing. Shipping is still blocked by verify1-2, the 'Even so' luck leak, which only the lead can settle.

The Watch and Saltmarket season line now says that, had the stall or tower kept its earlier ways (and the custom where it had none) in the last season, the place 'would not have been better off by enough for a seal'. That is true by the engine's rule (mark + season.delta - 2 SE \< SEAL_MARK) in every Life where L1 holds, and it carries no digits.

Reproduced cases:
- Watch 45, played the honest way (replayed mark +6.45 against stated noise of about 2): the new line shows, in the stand-in DOM and in the real browser at 1280x800 dark.
- Saltmarket 175 and 187 (cut11), and 4 and 35 (salt): the line shows.
- Saltmarket 94 and 127 (house not kept): the line is refused, as L1 requires.

My run of run-final.sh verify2 passes everything:
- page-smoke: 221.0 s, 2,381,819 sentences.
- harness: 12 gates identical to the reference.
- Valley sentence stream 6d84219b, 382,559 sentences, identical line for line.
- Valley-only page abf3fee6, maps 7a78d3e9; five-place walk c8f9bb5d with 0 changes; page-map words 5ac5fa25.
- DOM 27 of 27 OK; dom-places 6 of 6; sheets [] and contrast 0 lower.
- engine.js and harness.js unchanged; preview.html equals index.html in the host wrapper.

Across the whole round, only places/watch.js, places/saltmarket.js and page-smoke.js changed since verify1.

In the real browser:
- All five places through a whole Life at 1280x800 dark and 400x800 light: no forbidden words or raw tokens, no page console messages, every day state at exactly 800 at 1280x800, no sideways scroll.
- L3 holds at 1280x800 and 400x800 (nothing above or around the chooser moves; the address becomes #\<place> with no history entry), and the address forms and mid-Life reload behave as specified.

verify1-2 was rejected for a lead ruling. That reasoning is sound: LEAD 3.2 ('as the valley does') and the L5-frozen valley conflict with the 'never says or implies' rule. But the leak is still there, measured in all five places and identical to the fixer's own measurement, so it remains a blocker until the lead chooses (a) or (b).

Non-blocking:
- page-smoke's new wording check is shape-only: a negated line passes it.
- At 1280x800 the Banks and Watch Openings scroll by 2 px when exactly three earlier lives and a number line are shown. Begin stays on screen.
- One turned Why? card makes the day scroll at 1280x800, as in the published valley.
- A misplaced CSS comment in index.html.

Key outputs:
- `<scratch>/places/page-p6/out/verify2-`*.txt
- `<scratch>/places/review-verify2/out/` (Life dumps, evenso-v2.txt, mutate2-run.txt, diffs)

### Blocking (1)

#### 1. verify1-2 is still open: on a Why? card, 'Even so' appears exactly when the other side's missing act was luck. This holds in all five places, on your neighbours' cards and on your sister's.

**Evidence:** MEASURED with `jsc review-rules/check/evenso.js`, run from the game folder. Output: `<scratch>/places/review-verify2/out/evenso-v2.txt`, byte-identical to review-fix2/out/evenso-repro.txt. In every place, against equals againstHabit1 and againstOther is 0: valley 119, banks 122, watch 175, bridges 156, saltmarket 120. youHabit1NoHand equals against, so every card with a habit of 1 whose hand never arrived carries the line. The sister's cards behave the same: kinAgainst equals kinAgainstHabit1 (103, 136, 302, 129, 104). Read in the code: engine.js:710 sets againstHabit = (p >= 1 && !arrived) || (p \<= 0 && arrived), and words.js youLines (lines 450-461) pushes even.own or even.third only then. The fixer's own edits this round made the sister's line say her name ('Even so, your sister's nets went across today.'), which makes the hint plainer to the player. ARGUED: the fixer was right to reject it and pass it up. LEAD 3.2 ('always as the valley does') and L5 (the valley's frozen words, which carry the same 'They do the same.' / 'Even so' lines in v0.1.0) conflict with the task's rule ('never says or implies'). Only the lead can settle that. The rejection is not wrong, but this is still a leak-class blocker and nothing has changed.

**Proposed:** The lead rules before ship. ARGUED: option (a) is the only one that keeps all five places consistent with LEAD 3.2 and L5: record the published valley's Why? practice as an exception to the plain-words rule for every place. Option (b) narrows the hint but does not close it: dropping 'They do the same.' and 'Even so' in the four new places still leaves 'They learned this from you' and 'N of N times', and a habit of N of N never misses by choice. Option (b) would also need a new lexicon key in all five places, with the valley's text left as it is.

### Not blocking (7)

- The verify1-1 fix holds (MEASURED and argued). The new lines are 'No seal this time: had your tower kept to its earlier ways in the last season, and to the border custom where it had none, the border would not have been better off by enough for a seal.' and the Saltmarket's equivalent. Each is true in every Life where L1 holds, by the engine's own rule: wonOnSeason means mark + season.delta - 2 SE \< SEAL_MARK (engine.js 1680-1686), and the replay plays days 9-12 on the habit from before day 9, using the custom wherever a situation had not yet been met (replaySeason, engine.js 1215-1235). The lines carry no digits, do not print the bar, and use each place's own words. Reproduced cases: Watch 45 played the honest way (mark 9.25, se 0.96, delta -2.80) gives the new line directly under the noise line ('about 2 points'). In the stand-in DOM: review-verify2/out/out-watch-45-honest.txt. In the real browser at 1280x800 dark: verdict identical, the line right after #chron-noise. Saltmarket 187 and 175 cut11, 4 and 35 salt show the line. Saltmarket 127 and 94 (house not kept) refuse it, as L1 requires (review-verify2/out/out-salt-*.txt). Watch 115 and Saltmarket 35, each played its own honest way, show it at 400x800 light.
- A weakness in the new guard (MEASURED with `python3 review-verify2/check/mutate2.py` -> review-verify2/out/mutate2-run.txt). page-smoke checks only the shape of the season line: it must start 'No seal this time: ', have no digits and end ' by enough for a seal.'. A negated line, '...the border would have been better off by enough for a seal.', passes page-smoke -- watch (out/mut2-watch-line-negated.txt: PAGE SMOKE: PASS). Today's words are right, so this is a check gap and not a page fault. The other two new mutations were caught: app.js showing the line on any season-withheld seal (Watch 13 in the DOM), and words.js giving the line for any wonOnSeason (page-smoke).
- The Opening scrolls by 2 px at 1280x800 in the Banks and the Watch (MEASURED in the real browser). This happens when the place has exactly three earlier lives listed and the number line is showing or held: scrollHeight 802 for #banks-3 and #watch-3. The valley, Bridges and Saltmarket stay at 800 in the same state. Begin is at 630, on the first screen. With the held line (L3) the same state now also follows from choosing a place after following a numbered link. drawOpeningPast lists all three lives when n = 3 (n > most + 1 is false), although LEAD 3.5 says to show two 'if that is what it takes'. This is not the day, so L4's hard rule is not broken. Not measured with four or more lives.
- Turning a single Why? card makes the day scroll at 1280x800 in the published valley too (MEASURED in the real browser, one card at a time, flipped back after each). Valley 48213: 14 of 51 cards turned went past 800, maximum 940. Banks 12: 10 of 50, maximum 911. Every place stayed at exactly 800 in all untouched day states. This is published behaviour, not a regression.
- index.html: the CSS comment '/* a place just chosen: the number line keeps its room, so nothing above the choice moves */' trails the ':root:not([data-place]) .opening' rule instead of '.sheet-no.is-held'. Cosmetic only.
- Not re-measured here: the 1366x700 day comparison between the valley and the new places. My run stalled once the Browser pane was hidden, because the page's timers stopped firing. At 1366x700 I did measure the Opening: the valley also scrolls with three lives listed (780), and Begin is at 575-630 in every place. Still left to the lead from the fixer's list: 320x640, where Begin sits below the first screen in every place, the valley included.
- The address alias #border-3 opens the Watch's life 3 (MEASURED). The address keeps reading '#border-3', which names the place in hand under its own label, so it is consistent with L3(b).

