/*
 * After You: engine (the whole model, no dependencies, no DOM).
 *
 * Loads as  <script src="engine.js">  (sets window.AfterYou), as  load('engine.js')  in the
 * jsc shell (sets globalThis.AfterYou), and sets module.exports when `module` exists.
 * Every state object is plain data (JSON-safe). Nothing here uses Math.random or Date:
 * every draw is a pure function of (seed, purpose, day or season, house a, house b, future).
 *
 * VOCABULARY
 *   house ids 0..7 on a ring; house 0 is the player. Player's neighbours: [1, 2, 6, 7].
 *   Houses 3, 4, 5 are far houses: the player never deals with them or sees them in the Life.
 *   situation s (index into every 5-long array below), always from the acting side's view:
 *     0 NEW "Meeting someone new"             1 BOTH "After you both helped"
 *     2 SHORTED "After they left you short"   3 OWING "After you left them short"
 *     4 NEITHER "After you both stayed home"
 *   custom  = [p0..p4], chance of sending a hand in each situation.
 *   the old way = [1, 1, 0, 1, 0]: send a hand to someone new, then do as they did yesterday.
 *   source  = where one habit of one house came from:
 *             { type: 'own' | 'you' | 'house' | 'blank', from: houseId | null,
 *               deeds: [{ day, to, helped }] }      (deeds only when type is 'you')
 *       'own'   the house's founding habit (or its own later drift)
 *       'you'   copied from the player's ways; deeds are the player's own dated choices in that
 *               same situation: on `day` the player chose helped (true = sent a hand) toward house `to`
 *       'house' copied from another house as witnessed; from = that house id
 *       'blank' kin only: the player had never been in that situation, kin kept its old habit
 *   The page must never show `archetype`, `custom` numbers of other houses, or the reference ways.
 *   The page must never say whether a neighbour's missing hand was an accident or a choice.
 *
 * CHANGED SINCE THE FIRST BUILD (a page written against the earlier header must follow these)
 *   - why.habit is null unless the habit came from the player; why.seen, why.againstHabit,
 *     source.far and source.digest are new; playDay() also returns kinWith.
 *   - playDay() throws on a missing choice; createLife() throws on a missing seed; life.seed is
 *     0..4294967295 and '42' means 42.
 *   - A way the player never tested is no longer a guess: the heir keeps the old way there
 *     (legacy().heir). Do not say "your heir will have to guess".
 *   - verdict(): 2000 futures behind the headline (held has 2000 entries), markSE, whatIfFutures,
 *     paired delta / se / clear on every what-if, lastDay, mattered may be null or of kind
 *     'lastDay', range is measured in the valley the player left against thirteen ways and
 *     carries yourPct, oldWayPct, rank, of, inside, baselineInside.
 *   - runFuture(): 'adopt' events carry names, from and changed; 'displaced' is always emitted
 *     and has cause; level, yourWaysLastSeason and yourWaysAtEnd are new.
 *   - today(): changedDay and seenSince per neighbour. verdictJob: futures and futuresDone.
 *  Second round:
 *   - The winter need is no longer the old way's purse + 6. It follows the old way's purse at
 *     half weight (see createLife). today().oldWayPurse is still the old way's purse; never
 *     print the need as "the old way plus 6".
 *   - today().seen now also counts each neighbour's dealings with the far houses it is tied to
 *     (counts only; the far houses stay unseen). seenFar is that part alone.
 *   - verdict(): whatIfBaseHolds / whatIfBasePct (what every what-if and the last-day replay
 *     are compared with), seal, range.scaleLow / scaleHigh; the last-day replay runs unless
 *     options.lastDay is false, whether or not the what-ifs run.
 *
 * FOR THE PAGE: wording that follows from the model (where an earlier page brief disagrees, this wins)
 *   - Counts of futures: say "held in {holds} of {futures}" from the verdict's own fields (2000
 *     by default), never a fixed "of 200". Draw the two rows of marks from the first 200 entries
 *     of held and baseline.held and say that they are the first 200 of {futures}.
 *     While counting: "Counting futures: {job.futuresDone} of {job.futures}".
 *   - A way never tested: "Never tested. Your heir keeps the old way here." (legacy().heir).
 *   - Where that sits: "Of thirteen plain ways a house might have left here, the best holds in
 *     {range.bestPct}% of futures and the worst in {range.worstPct}%." Draw the scale from
 *     range.scaleLow to range.scaleHigh with the two markers at the headline numbers, "You" at
 *     holdsPct and "The old way" at baselinePct (their distance is the mark). Either marker can
 *     lie outside worst..best.
 *   - The combined seal "House kept, valley better off" is shown when verdict().seal.earned,
 *     and only then (it is not "house kept and mark of +5"). Do not rebuild the rule on the page.
 *   - The way that mattered most: verdict().mattered may be null ("No single way of yours stands
 *     out from the luck of the ford.") or of kind 'lastDay'. For kind 'habit' in situation s:
 *     "{title}: you sent a hand {h} of {n} times. One more hand there: held in
 *     {whatIfs[2s].holds} of {whatIfFutures}. One fewer: {whatIfs[2s+1].holds} of
 *     {whatIfFutures}. As you left it: {whatIfBaseHolds} of {whatIfFutures}." For kind 'lastDay':
 *     "On the last day you stayed home against {changed names}, who each sent a hand. With a
 *     hand sent to them: held in {lastDay.holds} of {lastDay.futures}, against
 *     {whatIfBaseHolds} as you left it. Your store would have been {lastDay.purse} of {need}."
 *     These rows are counted on the first whatIfFutures futures, so compare them with
 *     whatIfBaseHolds, never with the headline `holds`.
 *   - Why? cards: a founder's habit number is never available (why.habit is null); say what was
 *     witnessed instead (why.seen). The kin mirror also needs playDay().kinWith: kin acting
 *     "from you" toward the player's other neighbours.
 *   - Season's end: skip reconsidered entries with visible false; say a house took up a way
 *     only when adopted && took > 0. In the Afterwards skip 'adopt' events with changed false.
 *   - "What you have seen of them" now includes what is known of their dealings beyond the
 *     player's sight (seenFar). A label that stays true: "What you know of them".
 *   - The need: "Winter store: 31 of 64 measures." with, beneath it, "The old way, which is to
 *     send a hand to someone new and then do as they did yesterday, would bring in
 *     {oldWayPurse} this harvest." Do not derive one number from the other in words.
 *
 * PUBLIC API  (AfterYou.*)
 *
 *   createLife(seed, overrides?) -> life
 *       seed: an integer, a string of digits ('42' is the same valley as 42), or any other
 *       non-empty string (hashed). A missing, empty or non-finite seed throws.
 *       life.seed is the valley number to store and show: an integer 0..4294967295, and
 *       createLife(life.seed) gives the same valley again (numbers outside that range wrap).
 *       overrides: optional { PARAM: value } on top of AfterYou.params.
 *       life = {
 *         seed, day (1..12, 13 when over), over (bool), kin (house id), neighbours [1,2,6,7],
 *         purse, need, params,
 *         houses: [8 x { id, name, role: 'you'|'kin'|'neighbour'|'far',
 *                        archetype (INTERNAL, never show), custom [5] (null for house 0),
 *                        source [5 x source] (null for house 0), tally {h[5], n[5]}, purse, season,
 *                        way (id of the house whose way it runs; changes when it adopts) }],
 *         ways:  [5 x { h, n, deeds: [{ day, to, helped }] }],       the player's own tallies
 *         seen:  { neighbourId: { h[5], n[5] } },                    what the player knows of each neighbour
 *         seenSince: { neighbourId: { h[5], n[5] } },   the same, restarted when that house changed a habit
 *         seenFar: { neighbourId: { h[5], n[5] } },     the part of `seen` that came from far-house ties
 *         changedDay: { neighbourId: null | 4 | 8 | 12 },            day of its latest such change
 *         last:  [16 x null | [aArrived, bArrived]],                 yesterday on each tie
 *         yesterday: { neighbourId: { intended, lost, arrived, they, payoff } } | null,
 *         rounds: [lookingRound reports so far],
 *         seasonPay: [up to 3 x [8]]   each house's income in each finished season (internal)
 *         lastDay: null | { before, sent }   the Life as it stood before day 12 and the choices
 *                                            made on it (internal, used by the verdict's replay)
 *         old: { purse, end }       the old-way reference Life: its purse, and its end state (internal)
 *       }
 *       need: fixed for the Life, set from life.old.purse (what the old way earns on this same
 *       tape):   need = NEED_PIVOT + NEED_WEIGHT x (old.purse - NEED_PIVOT) + MARGIN, rounded,
 *       and never less than old.purse + 1 (the old way itself always falls short). With the
 *       defaults (59, 0.5, 6) that is halfway between the old way's purse and 71 measures (a
 *       full harvest for the old way), rounded up. NEED_WEIGHT 1 gives the specification's
 *       old.purse + MARGIN.
 *       playDay mutates the life in place; cloneLife(life) branches.
 *
 *   today(life) -> {
 *       day, season (1..3), dayOfSeason (1..4), purse, need, oldWayPurse, over,
 *       neighbours: [ {                      always in the order [1, 2, 6, 7]
 *         id, name, kin (bool),
 *         situation (0..4, the player's situation on this tie), situationKey, situationTitle,
 *         yesterday: null | { intended, lost, arrived, they, payoff },
 *              intended: the player chose to send; lost: it was turned back at the ford;
 *              arrived: intended && !lost; they: the neighbour's hand arrived
 *         seen: [5 x { h, n }]   the neighbour's actual behaviour over the whole Life, by THEIR
 *                                situation ("sent h of n"): toward the player, toward the player's
 *                                other neighbours, and toward the far houses it is tied to. The
 *                                far houses themselves stay unseen: counts only, no names.
 *         seenFar: [5 x { h, n }]  the part of `seen` that came from far-house ties (seen minus
 *                                seenFar is what the player watched with their own eyes)
 *         changedDay: null, or the day (4, 8) at whose season end this house last changed a habit
 *                     (took up another way, drifted, or, for kin, relearned from the player)
 *         seenSince: [5 x { h, n }]   the tallies of `seen` counted only since changedDay (equal
 *                                     to `seen` while changedDay is null). After a change, `seen`
 *                                     mixes the old habits with the new; this one does not.
 *       } ] }
 *
 *   playDay(life, choices) -> {
 *       choices: { neighbourId: bool } or [bool x 4] in the order [1, 2, 6, 7]; true = Send a hand.
 *       Every neighbour needs a choice: a missing one throws.
 *       day, gained (the player's payoff today), purse, need, over,
 *       results: [ {                         order [1, 2, 6, 7]
 *         id, name, kin, situation (the player's, before today), intended, lost, arrived,
 *         they (their hand arrived), payoff (-1, 0, 2 or 3 with the default stakes),
 *         why: {
 *           situation   the neighbour's own situation today, 0..4
 *           source      { type, from, fromName, far, deeds: [{ day, to, toName, helped }], digest }
 *                       far: true when `from` is a far house the player has never seen: say
 *                            "a house beyond your neighbours", do not use fromName
 *                       digest (type 'you' only, else null): { n, sent, stayed, latest (the newest
 *                            deed), dissent: [up to 3 deeds that go against the majority, newest first] }
 *           habit       type 'you': the chance it acted from, which is the player's own tally
 *                       h/n for that situation (digest.sent / digest.n). Every other type: null.
 *                       A founder's number is never handed to the page.
 *           seen        { h, n }: what the player knew of this house in this situation up to
 *                       yesterday, as today().seen counts it ("they had sent h of n times here")
 *           againstHabit  type 'you' only (else null): true when every quoted deed says one thing
 *                       and today's visible act was the other (all "sent", yet no hand came).
 *                       Word it as fact only ("Even so, no hand came today"); never give a cause.
 *         }
 *       } ],
 *       kinWith: [ { id, name, kinSent, theySent, why } ]   kin's dealings today with those of the
 *              player's other neighbours it is tied to (one or two houses), as the player sees
 *              them: kinSent / theySent = whose hand arrived; why = kin's why-record, same shape
 *              as above. This is where kin most often acts "from you" outside "after both helped".
 *       lookingRound: null, or on days 4, 8, 12: {
 *         season,
 *         kin: { id, name, changed (bool: some habit moved),
 *                habits: [5 x { situation, before, after, source ('you'|'blank'), h, n }] },
 *              kin takes h/n from the player's ways wherever n >= 1 ('you'), else keeps its habit ('blank')
 *         reconsidered: [ { house, name, model, modelName, chance (0..1 of following the model),
 *                           adopted (bool), took (habits it could copy as witnessed, 0..5),
 *                           visible, modelVisible, changed (bool: some habit of it moved),
 *                           changes: [{ situation, before, after }],
 *                           mutation: null | { situation, before, after } } ]
 *              one entry per house that looked at a neighbour this season. Skip entries with
 *              visible false. It took up the model's way when adopted && took > 0 (model 0: the
 *              player's ways). When modelVisible is false the model is a far house: show the
 *              change without naming it ("took up the way of a house beyond your neighbours").
 *              adopted with took 0: it had witnessed nothing of the model (kin, in a season when
 *              kin itself just changed) and copied nothing; show "no change" unless `changed` is
 *              true, which then means one habit drifted on its own (see mutation).
 *       } }
 *
 *   ways(life)   -> [5 x { situation, key, title, h, n, deeds: [{ day, to, toName, helped }] }]
 *       "sent a hand h of n"; counts what the player chose, not what the ford let through.
 *   legacy(life) -> { custom: [5 x number | null], hollow: [5 x bool], heir: [5], h[5], n[5],
 *                     kin: { id, name, custom [5], fromYou: [5 x bool] } }
 *       custom[s] is null where hollow[s]: the player was never in that situation. heir[s] is
 *       what the heir will run: custom[s], or the old way's habit where hollow (the heir keeps
 *       the old family way wherever the player left no precedent, as kin does).
 *
 *   runFuture(life, index, options?) -> one future in detail (needs life.over)
 *       index i is the same future the verdict counts at held[i].
 *       options: {}                   the valley as the player left it (the default)
 *                { history: 'old' }   the old-way baseline world instead
 *                { custom: [5] }      heir and kin both carry exactly this custom
 *                { whatIf: { situation, toward: 'help' | 'hold' } }
 *       returns {
 *         index, holds (bool), lateFlow (help flow, final 10 seasons), meanFlow (all 30),
 *         level: 'holds' | 'frays' | 'fails'   lateFlow at least HOLD_LINE + 0.05, within 0.05 of
 *              HOLD_LINE, or below HOLD_LINE - 0.05. `holds` (lateFlow >= HOLD_LINE) is what the
 *              verdict counts; `level` lets the page show a near miss as a near miss.
 *         worstStretch (lowest 5-season help flow), heir: [5] (the custom house 0 starts with),
 *         arrival: { season, house, replaced (old name), name (newcomer's name) },
 *         yourWaysLastSeason: the last season (1..30) during which any house ran the player's
 *              ways, yourWaysAtEnd: how many houses run them after the last Looking-Round,
 *         seasons: [30 x {
 *           season (1..30),
 *           flow   help flow that season = hands that arrived / (hands that could be sent x (1 - FOG)),
 *                  a share of the hands EXPECTED to arrive: a season in which every hand is sent
 *                  and the ford turns back fewer than usual reads above 1 (at most 1 / (1 - FOG)).
 *           houses: [8 x { id, name, helpRate (hands it got through / 16), income (this season),
 *                          purse (running total in the Afterwards), way }],
 *              way = whose way the house ran during this season: a founding house id 0..7
 *              (0 = the player's ways, carried by the heir; life.kin = what kin learned from the
 *              player) or 8 = the newcomer's. A house is "running your ways" when way is 0 or
 *              life.kin.
 *           events: [
 *             { type: 'arrival', house, replaced, name }
 *                  newcomers take over that holding. If house === life.kin, kin's line ends here.
 *             { type: 'adopt', adopter, adopterName, model, modelName, way, wayName, from, changed }
 *                  adopter takes up model's way. way = the label it now runs, wayName = the
 *                  family that way began with (the founding house's name, or the newcomer's
 *                  for 8; for way 0 or life.kin say "your ways"). from = the label it ran before.
 *                  changed = (way !== from): when false the house only refreshed a way it already
 *                  runs, so do not announce it as taking up a new way.
 *             { type: 'displaced', house (0 or life.kin), by, byName, cause: 'adopt' | 'arrival' }
 *                  house 0 or kin stops running the player's ways: it took up `by`'s way
 *                  (cause 'adopt'), or kin's holding went to the newcomers (cause 'arrival',
 *                  by null). Emitted every time that happens, whichever of the two labels it ran.
 *             { type: 'mutation', house, situation, to } ]
 *         } ],
 *         finalWay: [8]   whose way each house runs after the last Looking-Round
 *       }
 *       Events listed under season s happen at its Looking-Round (end of s) and show in `way`
 *       from season s + 1, except 'arrival' and its 'displaced', which happen before the first
 *       day of s. Names: use seasons[i].houses[j].name for a house (the newcomer renames one)
 *       and the names carried on the events themselves.
 *
 *   verdict(life, options?) -> result (needs life.over)
 *       options: { futures (default params.FUTURES = 2000: the two headline rows),
 *                  whatIfFutures (default min(futures, params.WHATIF_FUTURES = 1000): every
 *                  other row), whatIfs (default true), range (default true), lastDay (default
 *                  true: the last-day replay, which the seal needs), onProgress(done, total) }
 *       result = {
 *         futures, holds (count), holdsPct, held: [futures x bool]      the valley with the player
 *         baselinePct, mark (= holdsPct - baselinePct, in points),
 *         markSE   standard error of the mark in points, from the paired futures (about 1 at
 *                  2000 futures, about 3 at 200). A mark within 2 x markSE of a threshold has
 *                  not cleared it. Any prefix of `held` is a fair sample (use the first 200 to draw).
 *         meanFlow, lateFlow, worstStretch (median over futures of the worst 5-season flow),
 *         baseline: { holds, holdsPct, held: [futures x bool], meanFlow, lateFlow, worstStretch },
 *              the same seed and futures, house 0 having lived and left the old way
 *         purse, need, houseKept (purse >= need),
 *         whatIfFutures   m: how many futures every row below was counted on (the first m of the
 *                         headline's, so each difference is paired)
 *         whatIfBaseHolds, whatIfBasePct   the player's own result on those first m futures:
 *                         what every what-if and the last-day replay are compared with
 *                         (delta = their holdsPct - whatIfBasePct). Not the headline holdsPct,
 *                         which is counted on all `futures`.
 *         range: null when options.range is false, else {
 *              bestPct, worstPct   best and worst holdsPct among thirteen reference ways (the
 *                  nine of the specification and four more from the strongest region), each
 *                  carried by both heir and kin IN THE VALLEY THE PLAYER LEFT, on the first m futures
 *              yourPct     the player's own holdsPct on those same m futures
 *              oldWayPct   the old way carried by heir and kin in that same valley (not the
 *                  baseline: the baseline also lives the Life the old way)
 *              rank, of    rank 1 = no reference way holds more often than the player;
 *                  of + 1 = every one does (of = 13)
 *              inside      worstPct <= yourPct <= bestPct
 *              baselineInside   worstPct <= baselinePct <= bestPct
 *              scaleLow, scaleHigh   the ends of a scale that holds everything the page draws
 *                  on it: worstPct, bestPct and the two headline numbers holdsPct and baselinePct }
 *              The thirteen are plain fixed ways; the player's result can still fall outside
 *              them, so draw the scale from scaleLow to scaleHigh and say "thirteen plain ways",
 *              not "the best possible".
 *         whatIfs: [10 x { kind: 'habit', situation, toward: 'help'|'hold', hollow, h, n,
 *                          habit (the heir's habit: h/n, or the old way's where hollow), newHabit,
 *                          step (|newHabit - habit|), holds, holdsPct, futures (m),
 *                          delta (points against the player's holdsPct on the same m futures),
 *                          se (standard error of delta),
 *                          clear (|delta| >= 3 x se: ten are compared, so two is not enough) }],
 *              order: situation 0 help, 0 hold, 1 help, ... 4 hold. One more precedent toward
 *              help is (h+1)/(n+1), toward hold h/(n+1); for a hollow habit a first precedent
 *              makes it 1 or 0. Steps differ: one precedent moves a thin tally far and a thick
 *              one little (see step). [] when options.whatIfs is false.
 *         lastDay: null, or when the player stayed home on day 12 against at least one neighbour
 *              after both had helped: { kind: 'lastDay', changed: [{ id, name }] (those
 *              neighbours), purse, houseKept (as they would have been), holds, holdsPct,
 *              futures (m), delta, se, clear (|delta| >= 2 x se) }: day 12 replayed with a hand
 *              sent to each of them, everything else as it was, and the same futures run from
 *              there. delta is what those hands would have been worth to the valley, in points;
 *              purse is what they would have left in the store. It does not depend on
 *              options.whatIfs; it is null as well when options.lastDay is false.
 *         seal: null when options.lastDay is false, else
 *              { earned, houseKept, markClear, boughtOnLastDay, lastDayCost }
 *              earned: "House kept, valley better off" may be shown. It is
 *                houseKept && markClear && !boughtOnLastDay && !lastDayCost, where
 *                houseKept        purse >= need
 *                markClear        mark - 2 x markSE >= 5: better off than the old way by five
 *                                 points, beyond the noise of the count
 *                boughtOnLastDay  the house is kept, there is a lastDay entry and its houseKept
 *                                 is false: with a hand sent on day 12 to every neighbour who
 *                                 trusted the player, the store would have been short. The house
 *                                 was kept by what was taken that day. (A count of grain: no
 *                                 noise in it.)
 *                lastDayCost      there is a lastDay entry, clear, with delta > 0: those hands
 *                                 would have been worth something to the valley
 *              Withholding the seal is silent: the page shows the two results and the lastDay
 *              line as facts and passes no remark.
 *         mattered: the entry with the largest |delta| among the lastDay entry and the whatIfs
 *              of habits the player actually wrote (hollow: false) that are `clear`, or null
 *              when none stands out from the noise (say so; do not name one). Check
 *              mattered.kind. A hollow habit's what-if is still listed in whatIfs: it says what
 *              one first precedent there would have done, about a situation that never came up.
 *              With options.whatIfs false only a clear lastDay entry can be named.
 *       }
 *   verdictJob(life, options?) -> job    the same work, resumable, for a responsive page
 *   verdictStep(job, count?)   -> bool   runs up to `count` (default 100) futures; true when done
 *       job.progress (0..1), job.futures and job.futuresDone (progress scaled to 0..futures, for
 *       a line such as "Counting futures: 1200 of 2000"), job.did and job.total (simulations run
 *       and to run over all rows; these are several times `futures`, do not show them),
 *       job.done, job.headline (set as soon as the two headline rows are in: the result object
 *       with range null, whatIfs [], lastDay null, mattered null, seal null and whatIfBaseHolds
 *       null until done; do not show the seal from the headline), job.result.
 *       Typical use:  var job = AfterYou.verdictJob(life);
 *                     (function tick() { if (!AfterYou.verdictStep(job, 400)) setTimeout(tick, 0); else show(job.result); })();
 *
 *   project(life, options?) -> { futures, holds, holdsPct, held, meanFlow, lateFlow, worstStretch }
 *       one scenario only; options as runFuture plus { futures }, { from } (index of the first
 *       future, default 0: held[i] is future from + i; a `from` at or past the verdict's count
 *       gives futures the verdict never used) and { lastDay: true } (the replayed day 12; null
 *       when it does not apply). history 'old' works on an unfinished Life too.
 *       { lateFlows: true } adds lateFlows: [per-future late help flow].
 *
 *   cloneLife(life) -> deep copy
 *   draw(seed, purpose, t, a, b, future) -> number in [0, 1)   the keyed draw itself
 *   PURPOSES     { ACT, FORD, PICK, MODEL, ADOPT, MUT }: purpose codes of the main draws (testing)
 *   params       the tunables (defaults used by createLife): FOG, K, MUT, MARGIN, NEED_WEIGHT,
 *                NEED_PIVOT, R_LIFE, R_AFTER, HOLD_LINE, ARRIVE_FROM, ARRIVE_TO, FUTURES, WHATIF_FUTURES
 *   SITUATIONS   [5 x { key, title }]
 *   REFERENCE_WAYS  the nine customs of the specification (testing; never shown)
 *   RANGE_WAYS      the thirteen customs behind `range` (testing; never shown)
 *   trace        null, or function(purpose, t, a, b, future, value) called for every draw consumed
 *                (set only for testing; slows the futures)
 */
(function (root) {
  'use strict';

  // ---- parameters ---------------------------------------------------------------------------

  var PARAMS = {
    B: 3,            // a hand received (fixed by the design)
    C: 1,            // a hand sent     (fixed by the design)
    FOG: 0.04,       // the ford: chance an intended hand is lost          tunable 0.03..0.08
    K: 0.5,          // softness of "copy the better-off"                  tunable
    MUT: 0.05,       // chance an adopting house drifts one habit by 0.2   tunable 0..0.15
    MARGIN: 6,       // the need's margin over the old way's purse         tunable 5..7
    NEED_WEIGHT: 0.5, // how much of the old way's luck on this tape the need follows (1 = all of it:
                      //   need = old way's purse + MARGIN, the specification's rule to the letter)
    NEED_PIVOT: 59,   // the old way's purse at which the need is exactly that purse + MARGIN
    R_LIFE: 1,       // houses reconsidering per season during the Life    tunable 1..2
    R_AFTER: 1,      // houses reconsidering per season in the Afterwards  tunable 1..2
    HOLD_LINE: 0.50, // late help flow at which a future "holds"           tunable 0.45..0.6
    ARRIVE_FROM: 4,  // the newcomer arrives in a season drawn uniformly   tunable window
    ARRIVE_TO: 12,   //   from ARRIVE_FROM..ARRIVE_TO
    FUTURES: 2000,        // futures behind the two headline rows (the mark's standard error is about 1 point)
    WHATIF_FUTURES: 1000  // futures behind each what-if, the last-day replay and each reference way
  };

  // Founder bands [low, high]: each founding habit is low + (high - low) * a keyed draw.
  var BANDS = {
    firm:  { short: [0.05, 0.2], truce: [0.3, 0.5] },   // [1, 1, short, 1, truce]
    soft:  { short: [0.7, 1.0] },                       // [1, 1, short, 1, short]
    taker: { back: [0, 0.15] },                         // [0, back, 0, back, 0]
    wary:  { short: [0, 0.15], truce: [0.3, 0.5] },     // [0, 1, short, 1, truce]
    steady: { jitter: 0.1 }                             // [1, 1, 0, 0, 1], each up to 0.1 inward
  };
  var FAR_POOL = ['firm', 'firm', 'firm', 'soft', 'wary', 'steady'];   // three drawn, no taker

  var DAYS = 12, SEASON = 4, AFTER_SEASONS = 30, FINAL_SEASONS = 10, STRETCH = 5;
  var N = 8, NT = 16, YOU = 0, NEWCOMER = 8;
  var OLD_WAY = [1, 1, 0, 1, 0];
  var NEAR_LINE = 0.05;   // a future within this of HOLD_LINE "frays" (runFuture().level)
  var CLEAR_Z = 3;        // a habit what-if stands out when |delta| >= CLEAR_Z standard errors
                          // (ten candidates are compared, so two standard errors is not enough)
  var CLEAR_Z_ONE = 2;    // the last-day replay is one comparison named in advance: two will do
  var SEAL_MARK = 5;      // "House kept, valley better off" needs a mark this far above the old way,
  var SEAL_Z = 2;         //   by this many standard errors (verdict().seal)
  // The nine reference ways of the specification (gate G3).
  var REFERENCE_WAYS = [
    [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 1, 0, 1, 0], [1, 1, 0.33, 1, 0.33], [1, 1, 0.5, 1, 0.5],
    [1, 1, 0.67, 1, 0.67], [1, 1, 0, 0, 1], [1, 1, 0, 0, 0], [1, 1, 0.33, 1, 0]
  ];
  // The verdict's range is read against those nine and four more from the region the nine
  // leave out (forgive a lapse, never reopen with a house that never sends), where careful
  // play usually ends up. None is ever named to the player.
  var RANGE_WAYS = REFERENCE_WAYS.concat([[1, 1, 0.5, 1, 0], [1, 1, 0.67, 1, 0], [1, 1, 1, 1, 0], [0, 1, 1, 1, 0]]);
  var SITUATIONS = [
    { key: 'NEW', title: 'Meeting someone new' },
    { key: 'BOTH', title: 'After you both helped' },
    { key: 'SHORTED', title: 'After they left you short' },
    { key: 'OWING', title: 'After you left them short' },
    { key: 'NEITHER', title: 'After you both stayed home' }
  ];
  var NAMES = ['Kesh', 'Maren', 'Tobin', 'Hale', 'Wren', 'Ansel', 'Brix', 'Corra',
               'Fenn', 'Garrow', 'Odile', 'Dunmore', 'Pell', 'Quill', 'Rusk', 'Yarrow'];

  // ---- the ring -----------------------------------------------------------------------------

  var NBR = [], TIE = [], TIE_A = [], TIE_B = [];
  (function () {
    var a, b, d;
    for (a = 0; a < N; a++) { NBR.push([]); TIE.push([]); }
    for (a = 0; a < N; a++) for (b = a + 1; b < N; b++) {
      d = Math.min(b - a, N - (b - a));
      if (d <= 2) {
        TIE[a][b] = TIE[b][a] = TIE_A.length;
        TIE_A.push(a); TIE_B.push(b);
        NBR[a].push(b); NBR[b].push(a);
      }
    }
    for (a = 0; a < N; a++) NBR[a].sort(function (x, y) { return x - y; });
  })();
  var VISIBLE = [];             // houses the player can watch during the Life
  (function () { for (var i = 0; i < N; i++) VISIBLE.push(i === YOU || NBR[YOU].indexOf(i) >= 0); })();

  // ---- keyed randomness ---------------------------------------------------------------------

  var P_ACT = 1, P_FORD = 2, P_PICK = 3, P_MODEL = 4, P_ADOPT = 5, P_MUT = 6, P_MUT_WHICH = 7,
      P_MUT_SIGN = 8, P_ARRIVE = 9, P_NEWCOMER = 10, /* 11 was the hollow draw, retired */ P_KIN = 12,
      P_SEATS = 13, P_THIRD = 14, P_FAR = 15, P_JITTER = 16, P_NAME = 17, P_NEWNAME = 18, P_EXTRA = 19;

  function mix(h, k) {          // one murmur3 round
    k = Math.imul(k, 0xcc9e2d51); k = (k << 15) | (k >>> 17); k = Math.imul(k, 0x1b873593);
    h ^= k; h = (h << 13) | (h >>> 19);
    return (Math.imul(h, 5) + 0xe6546b64) | 0;
  }
  function fin(h) {             // murmur3 finaliser, mapped to [0, 1)
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function prefix(seed, purpose, f) { return mix(mix(mix(0x2f6a3d19, seed), purpose), f); }
  function key(t, a, b) { return (t << 8) | (a << 4) | b; }
  function draw(seed, purpose, t, a, b, f) {
    var u = fin(mix(prefix(seed, purpose, f), key(t, a, b)));
    if (api.trace) api.trace(purpose, t, a, b, f, u);
    return u;
  }
  // The valley number: an unsigned 32-bit integer. A number or a string of digits is taken as
  // that number (so a stored seed gives the same valley back); any other string is hashed.
  function seedInt(seed) {
    if (typeof seed === 'string' && /^\s*-?\d+\s*$/.test(seed)) seed = Number(seed);
    if (typeof seed === 'number') {
      need(isFinite(seed), 'createLife needs a finite seed');
      return Math.floor(seed) >>> 0;
    }
    need(typeof seed === 'string' && seed.length > 0, 'createLife needs a seed (an integer or a non-empty string)');
    var h = 0x811c9dc5 | 0;
    for (var i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 0x01000193);
    return h >>> 0;
  }
  // indices 0..n-1 ordered by a keyed draw each (a shuffle no later draw can disturb)
  function keyedOrder(seed, purpose, n) {
    var u = [], idx = [], i;
    for (i = 0; i < n; i++) { u.push(draw(seed, purpose, 0, i, 0, 0)); idx.push(i); }
    return idx.sort(function (x, y) { return u[x] - u[y] || x - y; });
  }

  // ---- small helpers ------------------------------------------------------------------------

  function sitOf(mine, theirs) { return 4 - 2 * mine - theirs; }   // both 0 or 1, yesterday
  function emptyTally() { return { h: [0, 0, 0, 0, 0], n: [0, 0, 0, 0, 0] }; }
  function ownSource() { return { type: 'own', from: null, deeds: [] }; }
  function namedDeed(life, d) { return { day: d.day, to: d.to, toName: life.houses[d.to].name, helped: d.helped }; }
  // A source as the page wants it: names filled in, deeds copied and summed up.
  function namedSource(life, s) {
    var deeds = s.deeds.map(function (d) { return namedDeed(life, d); }), digest = null, i;
    if (s.type === 'you') {
      var sent = 0;
      for (i = 0; i < deeds.length; i++) if (deeds[i].helped) sent++;
      var minority = sent * 2 >= deeds.length ? false : true, dissent = [];   // the rarer choice
      for (i = deeds.length - 1; i >= 0 && dissent.length < 3; i--) if (deeds[i].helped === minority) dissent.push(deeds[i]);
      digest = { n: deeds.length, sent: sent, stayed: deeds.length - sent,
                 latest: deeds.length ? deeds[deeds.length - 1] : null, dissent: dissent };
    }
    return {
      type: s.type, from: s.from, fromName: s.from === null ? null : life.houses[s.from].name,
      far: s.from !== null && !VISIBLE[s.from], deeds: deeds, digest: digest
    };
  }
  // The "Why?" record of house x acting in situation s with chance p, its hand having arrived or not.
  function whyRecord(life, seenBefore, x, s, p, arrived) {
    var src = life.houses[x].source[s], you = src.type === 'you';
    return {
      situation: s, source: namedSource(life, src), habit: you ? p : null,
      seen: { h: seenBefore[x].h[s], n: seenBefore[x].n[s] },
      againstHabit: you ? (p >= 1 && !arrived) || (p <= 0 && arrived) : null
    };
  }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function sameCustom(a, b) { for (var s = 0; s < 5; s++) if (a[s] !== b[s]) return false; return true; }
  function chanceToCopy(incModel, incSelf, K) { return 1 / (1 + Math.exp(-(incModel - incSelf) / K)); }
  function need(cond, what) { if (!cond) throw new Error('AfterYou: ' + what); }
  // How many houses reconsider this season. A fractional rate (1.5) means one house, and a
  // second one in half the seasons, by keyed draw.
  function roundCount(rate, seed, season, f) {
    var whole = Math.floor(rate);
    if (rate > whole && draw(seed, P_EXTRA, season, 0, 0, f) < rate - whole) whole++;
    return Math.min(whole, N);
  }

  function founder(archetype, seed, id) {
    function u(k) { return draw(seed, P_JITTER, 0, id, k, 0); }
    function band(b, k) { return b[0] + (b[1] - b[0]) * u(k); }
    var B = BANDS[archetype], m, j;
    // Every helping founder can reopen after both sides stood down (a truce habit above 0):
    // the ford only ever turns a hand back, so without it a quarrel between two houses never ends.
    switch (archetype) {
      case 'firm': return [1, 1, band(B.short, 0), 1, band(B.truce, 1)];
      case 'soft': m = band(B.short, 0); return [1, 1, m, 1, m];
      case 'taker': m = band(B.back, 0); return [0, m, 0, m, 0];
      case 'wary': return [0, 1, band(B.short, 0), 1, band(B.truce, 1)];
      case 'steady': j = B.jitter; return [1 - j * u(0), 1 - j * u(1), j * u(2), j * u(3), 1 - j * u(4)];
      default: return OLD_WAY.slice();   // kin: the old family way, exactly
    }
  }

  // ---- the Life -----------------------------------------------------------------------------

  function newLife(seedIn, overrides) {
    var P = {}, k, i;
    for (k in PARAMS) P[k] = PARAMS[k];
    if (overrides) for (k in overrides) P[k] = overrides[k];
    var seed = seedInt(seedIn), nb = NBR[YOU];
    var kin = nb[Math.floor(draw(seed, P_KIN, 0, 0, 0, 0) * nb.length)];

    var arch = new Array(N);
    arch[YOU] = 'you'; arch[kin] = 'kin';
    var third = ['firm', 'wary', 'steady'][Math.floor(draw(seed, P_THIRD, 0, 0, 0, 0) * 3)];
    var near = ['taker', 'soft', third], seat = keyedOrder(seed, P_SEATS, 3), j = 0;
    for (i = 0; i < nb.length; i++) if (nb[i] !== kin) arch[nb[i]] = near[seat[j++]];
    var far = keyedOrder(seed, P_FAR, FAR_POOL.length);
    for (i = 0, j = 0; i < N; i++) if (!arch[i]) arch[i] = FAR_POOL[far[j++]];

    var nameAt = keyedOrder(seed, P_NAME, NAMES.length), houses = [], seen = {}, since = {}, seenFar = {}, changedDay = {};
    for (i = 0; i < N; i++) {
      houses.push({
        id: i, name: NAMES[nameAt[i]],
        role: i === YOU ? 'you' : i === kin ? 'kin' : VISIBLE[i] ? 'neighbour' : 'far',
        archetype: arch[i],
        custom: i === YOU ? null : founder(arch[i], seed, i),
        source: i === YOU ? null : [ownSource(), ownSource(), ownSource(), ownSource(), ownSource()],
        tally: emptyTally(), purse: 0, season: 0, way: i
      });
    }
    for (i = 0; i < nb.length; i++) { seen[nb[i]] = emptyTally(); since[nb[i]] = emptyTally(); seenFar[nb[i]] = emptyTally(); changedDay[nb[i]] = null; }
    var ways = [], last = [];
    for (i = 0; i < 5; i++) ways.push({ h: 0, n: 0, deeds: [] });
    for (i = 0; i < NT; i++) last.push(null);
    return {
      seed: seed, day: 1, over: false, kin: kin, neighbours: nb.slice(), purse: 0, need: null,
      params: P, houses: houses, ways: ways, seen: seen, seenSince: since, seenFar: seenFar, changedDay: changedDay,
      last: last, yesterday: null, rounds: [], seasonPay: [], lastDay: null, old: null
    };
  }

  // The winter need, from what the old way earns on this same tape.
  // The specification pegs it one for one: need = old way's purse + MARGIN. But the old way
  // echoes every accident at the ford and a careful house repairs it, so the old way's purse
  // swings about twice as far with the luck of the tape as a careful house's does. Pegged one
  // for one, the need is easy exactly when the tape was rough on the old way and out of reach
  // when it was smooth. So the need follows the old way's purse at NEED_WEIGHT (one half)
  // around NEED_PIVOT:
  //     need = NEED_PIVOT + NEED_WEIGHT x (old way's purse - NEED_PIVOT) + MARGIN
  // With the defaults (59, one half, 6) that is halfway between the old way's purse and 71
  // measures, rounded up: 71 is a full harvest for the old way (three good neighbours, two
  // measures a day, twelve days, less the one hand a taker never returns). It is never less
  // than one measure more than the old way's purse, so the old way itself always falls short.
  function winterNeed(oldPurse, P) {
    var pegged = Math.round(P.NEED_PIVOT + P.NEED_WEIGHT * (oldPurse - P.NEED_PIVOT) + P.MARGIN);
    return Math.max(oldPurse + 1, pegged);
  }

  function createLife(seed, overrides) {
    var life = newLife(seed, overrides), ref = newLife(seed, overrides);
    // The old-way reference: house 0 lives the same tape as a plain reciprocator. It fixes the
    // winter need and is the world the verdict compares against. Draws are keyed, so running
    // it cannot disturb the real Life.
    while (!ref.over) {
      var ch = {};
      for (var i = 0; i < ref.neighbours.length; i++) {
        var L = ref.last[TIE[YOU][ref.neighbours[i]]];
        ch[ref.neighbours[i]] = OLD_WAY[L ? sitOf(L[0], L[1]) : 0] === 1;
      }
      playDay(ref, ch);
    }
    life.need = winterNeed(ref.purse, life.params);
    life.old = { purse: ref.purse, end: endState(ref) };
    return life;
  }

  function cloneLife(life) { return JSON.parse(JSON.stringify(life)); }

  function today(life) {
    var out = [], i, s;
    for (i = 0; i < life.neighbours.length; i++) {
      var id = life.neighbours[i], L = life.last[TIE[YOU][id]], sit = L ? sitOf(L[0], L[1]) : 0;
      var seen = [], since = [], far = [];
      for (s = 0; s < 5; s++) {
        seen.push({ h: life.seen[id].h[s], n: life.seen[id].n[s] });
        since.push({ h: life.seenSince[id].h[s], n: life.seenSince[id].n[s] });
        far.push({ h: life.seenFar[id].h[s], n: life.seenFar[id].n[s] });
      }
      var y = life.yesterday && life.yesterday[id];
      out.push({
        id: id, name: life.houses[id].name, kin: id === life.kin,
        situation: sit, situationKey: SITUATIONS[sit].key, situationTitle: SITUATIONS[sit].title,
        yesterday: y ? { intended: y.intended, lost: y.lost, arrived: y.arrived, they: y.they, payoff: y.payoff } : null,
        seen: seen, seenFar: far, changedDay: life.changedDay[id], seenSince: since
      });
    }
    var d = Math.min(life.day, DAYS);
    return {
      day: life.day, season: Math.ceil(d / SEASON), dayOfSeason: (d - 1) % SEASON + 1,
      purse: life.purse, need: life.need, oldWayPurse: life.old ? life.old.purse : null,
      over: life.over, neighbours: out
    };
  }

  function playDay(life, choices) {
    need(!life.over, 'playDay called after the Life ended');
    var P = life.params, D = life.day, H = life.houses, nb = life.neighbours, i, t;
    var send = {}, isList = Array.isArray(choices);
    need(choices && typeof choices === 'object', 'playDay needs a choice for each of the four neighbours');
    for (i = 0; i < nb.length; i++) {
      var c = isList ? choices[i] : choices[nb[i]];
      need(c === true || c === false, 'playDay needs true or false for neighbour ' + nb[i] + ' (got ' + c + ')');
      send[nb[i]] = c;
    }
    // The verdict can replay the last day. Only the real Life keeps what that needs.
    if (D === DAYS && life.old) {
      var keep = life.old;
      life.old = null;
      life.lastDay = { before: cloneLife(life), sent: send };
      life.old = keep;
    }

    function move(x, y, s) {    // house x toward house y, x being in situation s
      var p = null, intended;
      if (x === YOU) intended = send[y];
      else {
        p = H[x].custom[s];
        intended = p >= 1 ? true : p <= 0 ? false : draw(life.seed, P_ACT, D, x, y, 0) < p;
      }
      var lost = intended && draw(life.seed, P_FORD, D, x, y, 0) < P.FOG;
      return { p: p, intended: intended, lost: lost, arrived: intended && !lost };
    }
    function bump(tally, s, helped) { tally.n[s]++; if (helped) tally.h[s]++; }

    var gain = [0, 0, 0, 0, 0, 0, 0, 0], results = [], kinWith = [], yesterday = {}, last = new Array(NT);
    var seenBefore = {};        // what the player had witnessed before today (the why-records quote it)
    for (i = 0; i < nb.length; i++) seenBefore[nb[i]] = { h: life.seen[nb[i]].h.slice(), n: life.seen[nb[i]].n.slice() };
    for (t = 0; t < NT; t++) {
      var a = TIE_A[t], b = TIE_B[t], L = life.last[t];
      var sa = L ? sitOf(L[0], L[1]) : 0, sb = L ? sitOf(L[1], L[0]) : 0;
      var ma = move(a, b, sa), mb = move(b, a, sb);
      var ha = ma.arrived ? 1 : 0, hb = mb.arrived ? 1 : 0;
      last[t] = [ha, hb];
      gain[a] += P.B * hb - P.C * ha;
      gain[b] += P.B * ha - P.C * hb;
      if (a !== YOU) bump(H[a].tally, sa, ma.arrived);
      bump(H[b].tally, sb, mb.arrived);
      var open = VISIBLE[a] && VISIBLE[b], why = null;
      if (open) {
        if (a === YOU) why = whyRecord(life, seenBefore, b, sb, mb.p, mb.arrived);
        else if (a === life.kin) why = whyRecord(life, seenBefore, a, sa, ma.p, ma.arrived);
        else if (b === life.kin) why = whyRecord(life, seenBefore, b, sb, mb.p, mb.arrived);
        if (a !== YOU) { bump(life.seen[a], sa, ma.arrived); bump(life.seenSince[a], sa, ma.arrived); }
        bump(life.seen[b], sb, mb.arrived); bump(life.seenSince[b], sb, mb.arrived);
      }
      if (!open) {
        // A neighbour's dealings with a far house: the player never sees the far house, but
        // what the neighbour did there is known, as a count and nothing more.
        if (VISIBLE[a]) { bump(life.seen[a], sa, ma.arrived); bump(life.seenSince[a], sa, ma.arrived); bump(life.seenFar[a], sa, ma.arrived); }
        if (VISIBLE[b]) { bump(life.seen[b], sb, mb.arrived); bump(life.seenSince[b], sb, mb.arrived); bump(life.seenFar[b], sb, mb.arrived); }
      }
      if (a === YOU) {
        // Your ways count what you chose, not what the ford let through.
        var w = life.ways[sa];
        w.n++; if (ma.intended) w.h++;
        w.deeds.push({ day: D, to: b, helped: ma.intended });
        var pay = P.B * hb - P.C * ha;
        results.push({
          id: b, name: H[b].name, kin: b === life.kin, situation: sa,
          intended: ma.intended, lost: ma.lost, arrived: ma.arrived, they: mb.arrived, payoff: pay, why: why
        });
        yesterday[b] = { intended: ma.intended, lost: ma.lost, arrived: ma.arrived, they: mb.arrived, payoff: pay };
      } else if (open && a === life.kin) {
        kinWith.push({ id: b, name: H[b].name, kinSent: ma.arrived, theySent: mb.arrived, why: why });
      } else if (open && b === life.kin) {
        kinWith.push({ id: a, name: H[a].name, kinSent: mb.arrived, theySent: ma.arrived, why: why });
      }
    }
    life.last = last;
    life.yesterday = yesterday;
    for (i = 0; i < N; i++) { H[i].purse += gain[i]; H[i].season += gain[i]; }
    life.purse = H[YOU].purse;

    var round = null;
    if (D % SEASON === 0) {
      round = lookingRound(life, D / SEASON);
      life.rounds.push(round);
      life.seasonPay.push(H.map(function (x) { return x.season; }));
      for (i = 0; i < N; i++) H[i].season = 0;
    }
    life.day = D + 1;
    life.over = life.day > DAYS;
    return { day: D, gained: gain[YOU], purse: life.purse, need: life.need, over: life.over,
             results: results, kinWith: kinWith, lookingRound: round };
  }

  function lookingRound(life, season) {
    var P = life.params, H = life.houses, kin = H[life.kin], seed = life.seed, s, i, r;
    var report = { season: season, kin: { id: kin.id, name: kin.name, changed: false, habits: [] }, reconsidered: [] };
    function restartSeen(id) {      // the player's "since it changed" view of a neighbour
      if (!VISIBLE[id] || id === YOU) return;
      life.seenSince[id] = emptyTally();
      life.changedDay[id] = season * SEASON;
    }

    // 1. Kin learns from the player.
    for (s = 0; s < 5; s++) {
      var w = life.ways[s], before = kin.custom[s];
      if (w.n >= 1) {
        kin.custom[s] = w.h / w.n;
        kin.source[s] = { type: 'you', from: YOU, deeds: w.deeds.slice() };
      } else {
        kin.source[s] = { type: 'blank', from: null, deeds: [] };
      }
      if (kin.custom[s] !== before) report.kin.changed = true;
      report.kin.habits.push({ situation: s, before: before, after: kin.custom[s], source: kin.source[s].type, h: w.h, n: w.n });
    }
    // What the valley has witnessed of a house counts "since it last changed custom": kin's
    // record restarts only in a season when one of its habits actually moved.
    if (report.kin.changed) { kin.tally = emptyTally(); restartSeen(kin.id); }

    // 2. Other houses reconsider (never the player, never kin, while the player lives).
    var cands = [], u = {};
    for (i = 0; i < N; i++) if (i !== YOU && i !== life.kin) { cands.push(i); u[i] = draw(seed, P_PICK, season, i, 0, 0); }
    cands.sort(function (x, y) { return u[x] - u[y] || x - y; });
    var pending = [];
    var count = roundCount(P.R_LIFE, seed, season, 0);
    for (r = 0; r < count && r < cands.length; r++) {
      var me = H[cands[r]];
      var model = H[NBR[me.id][Math.floor(draw(seed, P_MODEL, season, me.id, 0, 0) * 4)]];
      var chance = chanceToCopy(model.season / (4 * SEASON), me.season / (4 * SEASON), P.K);
      var willing = draw(seed, P_ADOPT, season, me.id, model.id, 0) < chance;
      var ev = { house: me.id, name: me.name, model: model.id, modelName: model.name, chance: chance,
                 adopted: false, took: 0, visible: VISIBLE[me.id], modelVisible: VISIBLE[model.id],
                 changed: false, changes: [], mutation: null };
      report.reconsidered.push(ev);
      if (!willing) continue;
      // 3. As witnessed: only situations the model has been seen in can be copied.
      var custom = me.custom.slice(), source = me.source.slice();
      for (s = 0; s < 5; s++) {
        var h, n, src;
        if (model.id === YOU) { h = life.ways[s].h; n = life.ways[s].n; src = { type: 'you', from: YOU, deeds: life.ways[s].deeds.slice() }; }
        else { h = model.tally.h[s]; n = model.tally.n[s]; src = { type: 'house', from: model.id, deeds: [] }; }
        if (n >= 1) {
          if (custom[s] !== h / n) ev.changes.push({ situation: s, before: custom[s], after: h / n });
          custom[s] = h / n; source[s] = src; ev.took++;
        }
      }
      // took can be 0: a model whose record restarted a moment ago (kin, in a season when it
      // changed) has been witnessed in nothing, and the adopter copies nothing.
      ev.adopted = true;
      // 4. Drift.
      if (P.MUT > 0 && draw(seed, P_MUT, season, me.id, 0, 0) < P.MUT) {
        s = Math.floor(draw(seed, P_MUT_WHICH, season, me.id, 0, 0) * 5);
        var moved = clamp01(custom[s] + (draw(seed, P_MUT_SIGN, season, me.id, 0, 0) < 0.5 ? -0.2 : 0.2));
        ev.mutation = { situation: s, before: custom[s], after: moved };
        custom[s] = moved; source[s] = ownSource();
      }
      ev.changed = !sameCustom(custom, me.custom);
      pending.push({ house: me, custom: custom, source: source, way: ev.took ? model.way : me.way, changed: ev.changed });
    }
    for (r = 0; r < pending.length; r++) {     // applied together: order cannot matter
      pending[r].house.custom = pending[r].custom;
      pending[r].house.source = pending[r].source;
      pending[r].house.way = pending[r].way;
      pending[r].house.tally = emptyTally();
      if (pending[r].changed) restartSeen(pending[r].house.id);
    }
    return report;
  }

  function ways(life) {
    return life.ways.map(function (w, s) {
      return {
        situation: s, key: SITUATIONS[s].key, title: SITUATIONS[s].title, h: w.h, n: w.n,
        deeds: w.deeds.map(function (d) { return namedDeed(life, d); })
      };
    });
  }

  function legacy(life) {
    var custom = [], hollow = [], heir = [], h = [], n = [], fromYou = [], kin = life.houses[life.kin], s;
    for (s = 0; s < 5; s++) {
      var w = life.ways[s];
      h.push(w.h); n.push(w.n); hollow.push(w.n === 0); custom.push(w.n ? w.h / w.n : null);
      // No precedent, no change: the heir keeps the old family way there, exactly as kin does.
      heir.push(w.n ? w.h / w.n : OLD_WAY[s]);
      fromYou.push(kin.source[s].type === 'you');
    }
    return { custom: custom, hollow: hollow, heir: heir, h: h, n: n,
             kin: { id: kin.id, name: kin.name, custom: kin.custom.slice(), fromYou: fromYou } };
  }

  // What a finished Life hands to the Afterwards (house 0's custom is filled in per scenario).
  function endState(life) {
    return {
      names: life.houses.map(function (x) { return x.name; }),
      custom: life.houses.map(function (x) { return x.custom ? x.custom.slice() : null; }),
      tallyH: life.houses.map(function (x) { return x.tally.h.slice(); }),
      tallyN: life.houses.map(function (x) { return x.tally.n.slice(); }),
      last: life.last.map(function (L) { return L ? L.slice() : null; }),
      way: life.houses.map(function (x) { return x.way; }),
      seasonPay: life.seasonPay.map(function (p) { return p.slice(); })
    };
  }

  // Day 12 again, with a hand sent to every neighbour the player stayed home against after both
  // had helped; everything else as it was. Draws are keyed, so nothing unrelated moves.
  // Returns null when there was no such neighbour.
  function replayLastDay(life) {
    var ld = life.lastDay, i;
    if (!ld) return null;
    var alt = cloneLife(ld.before), ch = {}, changed = [];
    for (i = 0; i < alt.neighbours.length; i++) {
      var id = alt.neighbours[i], L = alt.last[TIE[YOU][id]];
      ch[id] = ld.sent[id];
      if (!ch[id] && L && sitOf(L[0], L[1]) === 1) { ch[id] = true; changed.push({ id: id, name: alt.houses[id].name }); }
    }
    if (!changed.length) return null;
    alt.old = life.old;
    alt.need = life.need;
    playDay(alt, ch);
    return { life: alt, changed: changed };
  }

  // ---- the Afterwards -----------------------------------------------------------------------

  // One precedent more toward help or hold. For a hollow habit the first precedent is all of it.
  function movedHabit(life, s, toward) {
    var w = life.ways[s];
    return (w.h + (toward === 'help' ? 1 : 0)) / (w.n + 1);
  }

  // The starting world of a set of futures, as flat typed arrays.
  //   spec.history 'old' : the old-way reference Life, heir and kin on the old family way
  //   spec.custom  [5]   : heir and kin both carry exactly this custom
  //   spec.whatIf        : { situation, toward }
  function scenario(life, spec) {
    spec = spec || {};
    var old = spec.history === 'old', i, s, t;
    need(old || life.over, 'the Afterwards needs a finished Life');
    var end = old ? life.old.end : endState(life), kin = life.kin;
    var sc = {
      seed: life.seed, kin: kin, names: end.names.slice(), way: end.way.slice(),
      cust: new Float64Array(N * 5), th: new Float64Array(N * 5), tn: new Float64Array(N * 5),
      la: new Int8Array(NT), lb: new Int8Array(NT), hist: new Float64Array(3 * N)
    };
    for (i = 1; i < N; i++) for (s = 0; s < 5; s++) {
      sc.cust[i * 5 + s] = end.custom[i][s];
      sc.th[i * 5 + s] = end.tallyH[i][s];
      sc.tn[i * 5 + s] = end.tallyN[i][s];
    }
    for (t = 0; t < NT; t++) { sc.la[t] = end.last[t] ? end.last[t][0] : -1; sc.lb[t] = end.last[t] ? end.last[t][1] : -1; }
    // "Payoff over the last 3 seasons" reaches back into the Life until the Afterwards has
    // three seasons of its own: slot k holds Life season k + 1 and is overwritten in turn.
    for (t = 0; t < end.seasonPay.length && t < 3; t++) for (i = 0; i < N; i++) sc.hist[t * N + i] = end.seasonPay[t][i];
    // The heir is a new head of house 0: what the valley has witnessed of it starts empty
    // (th, tn stay 0 for house 0), so nobody can copy it before it has been seen to act.
    if (spec.custom) {
      for (s = 0; s < 5; s++) { sc.cust[s] = spec.custom[s]; sc.cust[kin * 5 + s] = spec.custom[s]; sc.th[kin * 5 + s] = 0; sc.tn[kin * 5 + s] = 0; }
    } else if (old) {
      for (s = 0; s < 5; s++) sc.cust[s] = OLD_WAY[s];
    } else {
      var lg = legacy(life);
      for (s = 0; s < 5; s++) sc.cust[s] = lg.heir[s];
      if (spec.whatIf) {
        s = spec.whatIf.situation;
        var v = movedHabit(life, s, spec.whatIf.toward);
        sc.cust[s] = v;
        if (lg.kin.fromYou[s]) sc.cust[kin * 5 + s] = v;
      }
    }
    return sc;
  }

  function scratch() {
    return {
      cust: new Float64Array(N * 5), th: new Float64Array(N * 5), tn: new Float64Array(N * 5),
      la: new Int8Array(NT), lb: new Int8Array(NT), pay: new Float64Array(N),
      hist: new Float64Array(3 * N), flow: new Float64Array(AFTER_SEASONS), way: new Int32Array(N),
      pick: new Float64Array(N), tmp: new Float64Array(N * 5), who: new Int32Array(N),
      from: new Int32Array(N), wayNext: new Int32Array(N)
    };
  }

  // Runs future f of scenario sc into W.flow (help flow per season). With rec, also records
  // the season-by-season detail. This is the hot loop: flat arrays, no allocation without rec.
  function simulate(sc, f, P, W, rec) {
    var cust = W.cust, th = W.th, tn = W.tn, la = W.la, lb = W.lb, pay = W.pay, hist = W.hist,
        flow = W.flow, way = W.way, pick = W.pick, tmp = W.tmp, who = W.who, from = W.from,
        wayNext = W.wayNext;
    var seed = sc.seed, FOG = P.FOG, B = P.B, C = P.C, K = P.K, MUT = P.MUT;
    var R, tr = api.trace;
    var i, s, d, t, r, q, a, b, x, y, sa, sb, ia, ib, pa, pb, ka, kb, ha, hb, u, v, m;
    cust.set(sc.cust); th.set(sc.th); tn.set(sc.tn); la.set(sc.la); lb.set(sc.lb); hist.set(sc.hist);
    for (i = 0; i < N; i++) way[i] = sc.way[i];
    if (rec) rec.heir = Array.prototype.slice.call(cust, 0, 5);

    var pAct = prefix(seed, P_ACT, f), pFord = prefix(seed, P_FORD, f), pPick = prefix(seed, P_PICK, f),
        pModel = prefix(seed, P_MODEL, f), pAdopt = prefix(seed, P_ADOPT, f), pMut = prefix(seed, P_MUT, f);
    var arriveAt = P.ARRIVE_FROM + Math.floor(draw(seed, P_ARRIVE, 0, 0, 0, f) * (P.ARRIVE_TO - P.ARRIVE_FROM + 1));
    var denom = NT * 2 * SEASON * (1 - FOG);
    var names = rec ? sc.names.slice() : null, purse = rec ? [0, 0, 0, 0, 0, 0, 0, 0] : null, events, sent, drift;
    var kinLine = true, newName = null;     // rec only: kin's family still holds its house
    function yours(w) { return w === YOU || w === sc.kin; }
    function wayName(w) { return w === NEWCOMER ? newName : sc.names[w]; }

    for (s = 1; s <= AFTER_SEASONS; s++) {
      if (rec) { events = []; sent = [0, 0, 0, 0, 0, 0, 0, 0]; drift = {}; }

      if (s === arriveAt) {
        // The poorest house other than house 0 over the last three seasons gives way to a taker.
        var poorest = 1, low = Infinity;
        for (i = 1; i < N; i++) { v = hist[i] + hist[N + i] + hist[2 * N + i]; if (v < low) { low = v; poorest = i; } }
        x = 0.15 * draw(seed, P_NEWCOMER, 0, 0, 0, f);
        q = poorest * 5;
        if (rec) {
          newName = NAMES[keyedOrder(seed, P_NAME, NAMES.length)[N + Math.floor(draw(seed, P_NEWNAME, 0, 0, 0, f) * (NAMES.length - N))]];
          rec.arrival = { season: s, house: poorest, replaced: names[poorest], name: newName };
          events.push({ type: 'arrival', house: poorest, replaced: names[poorest], name: newName });
          if (poorest === sc.kin) {
            if (yours(way[poorest])) events.push({ type: 'displaced', house: poorest, by: null, byName: null, cause: 'arrival' });
            kinLine = false;
          }
          names[poorest] = newName; purse[poorest] = 0;
        }
        cust[q] = 0; cust[q + 1] = x; cust[q + 2] = 0; cust[q + 3] = x; cust[q + 4] = 0;
        for (i = 0; i < 5; i++) { th[q + i] = 0; tn[q + i] = 0; }
        for (i = 0; i < 4; i++) { t = TIE[poorest][NBR[poorest][i]]; la[t] = -1; lb[t] = -1; }
        way[poorest] = NEWCOMER;
      }

      for (i = 0; i < N; i++) pay[i] = 0;
      var helps = 0;
      for (d = 1; d <= SEASON; d++) {
        var day = DAYS + (s - 1) * SEASON + d, kd = day << 8;
        for (t = 0; t < NT; t++) {
          a = TIE_A[t]; b = TIE_B[t]; x = la[t]; y = lb[t];
          if (x < 0) { sa = 0; sb = 0; } else { sa = 4 - 2 * x - y; sb = 4 - 2 * y - x; }
          ia = a * 5 + sa; ib = b * 5 + sb; pa = cust[ia]; pb = cust[ib];
          ka = kd | (a << 4) | b; kb = kd | (b << 4) | a;
          if (pa >= 1) ha = 1; else if (pa <= 0) ha = 0; else {
            u = fin(mix(pAct, ka)); if (tr) tr(P_ACT, day, a, b, f, u); ha = u < pa ? 1 : 0;
          }
          if (ha === 1) { u = fin(mix(pFord, ka)); if (tr) tr(P_FORD, day, a, b, f, u); if (u < FOG) ha = 0; }
          if (pb >= 1) hb = 1; else if (pb <= 0) hb = 0; else {
            u = fin(mix(pAct, kb)); if (tr) tr(P_ACT, day, b, a, f, u); hb = u < pb ? 1 : 0;
          }
          if (hb === 1) { u = fin(mix(pFord, kb)); if (tr) tr(P_FORD, day, b, a, f, u); if (u < FOG) hb = 0; }
          tn[ia]++; th[ia] += ha; tn[ib]++; th[ib] += hb;
          pay[a] += B * hb - C * ha; pay[b] += B * ha - C * hb;
          helps += ha + hb;
          la[t] = ha; lb[t] = hb;
          if (rec) { sent[a] += ha; sent[b] += hb; }
        }
      }
      flow[s - 1] = helps / denom;
      q = ((s - 1) % 3) * N;
      for (i = 0; i < N; i++) hist[q + i] = pay[i];

      // Looking-Round: R houses (lowest keyed draw) each weigh one neighbour's way.
      for (i = 0; i < N; i++) {
        pick[i] = fin(mix(pPick, key(s, i, 0))); from[i] = -1;
        if (tr) tr(P_PICK, s, i, 0, f, pick[i]);
      }
      R = roundCount(P.R_AFTER, seed, s, f);
      for (r = 0; r < R; r++) {
        m = -1;
        for (i = 0; i < N; i++) if (pick[i] < 2 && (m < 0 || pick[i] < pick[m])) m = i;
        who[r] = m; pick[m] = 2;
      }
      for (r = 0; r < R; r++) {
        i = who[r];
        u = fin(mix(pModel, key(s, i, 0)));
        if (tr) tr(P_MODEL, s, i, 0, f, u);
        m = NBR[i][Math.floor(u * 4)];
        u = fin(mix(pAdopt, key(s, i, m)));
        if (tr) tr(P_ADOPT, s, i, m, f, u);
        if (u >= 1 / (1 + Math.exp(-(pay[m] - pay[i]) / (4 * SEASON) / K))) continue;
        for (q = 0; q < 5; q++) { v = tn[m * 5 + q]; tmp[i * 5 + q] = v >= 1 ? th[m * 5 + q] / v : cust[i * 5 + q]; }
        from[i] = m; wayNext[i] = way[m];
        if (MUT > 0) {
          u = fin(mix(pMut, key(s, i, 0)));
          if (tr) tr(P_MUT, s, i, 0, f, u);
          if (u < MUT) {
            q = i * 5 + Math.floor(draw(seed, P_MUT_WHICH, s, i, 0, f) * 5);
            v = tmp[q] + (draw(seed, P_MUT_SIGN, s, i, 0, f) < 0.5 ? -0.2 : 0.2);
            tmp[q] = v < 0 ? 0 : v > 1 ? 1 : v;
            if (rec) drift[i] = { type: 'mutation', house: i, situation: q - i * 5, to: tmp[q] };
          }
        }
      }
      if (rec) {                 // the season as it was lived, before anyone changes way
        var hs = [];
        for (i = 0; i < N; i++) {
          purse[i] += pay[i];
          hs.push({ id: i, name: names[i], helpRate: sent[i] / (4 * SEASON), income: pay[i], purse: purse[i], way: way[i] });
          if (yours(way[i])) rec.yourWaysLastSeason = s;
        }
        rec.seasons.push({ season: s, flow: flow[s - 1], houses: hs, events: events });
      }
      // Adoptions take effect together, each from what stood at the season's end.
      for (r = 0; r < R; r++) {
        i = who[r];
        if (from[i] < 0) continue;
        if (rec) {
          events.push({ type: 'adopt', adopter: i, adopterName: names[i], model: from[i], modelName: names[from[i]],
                        way: wayNext[i], wayName: wayName(wayNext[i]), from: way[i], changed: wayNext[i] !== way[i] });
          // House 0, or kin while its family holds its house, gives up the player's ways:
          // whichever of the two labels it was running.
          if ((i === YOU || (i === sc.kin && kinLine)) && yours(way[i]) && !yours(wayNext[i])) {
            events.push({ type: 'displaced', house: i, by: from[i], byName: names[from[i]], cause: 'adopt' });
          }
          if (drift[i]) events.push(drift[i]);
        }
        for (q = i * 5; q < i * 5 + 5; q++) { cust[q] = tmp[q]; th[q] = 0; tn[q] = 0; }
      }
      for (r = 0; r < R; r++) if (from[who[r]] >= 0) way[who[r]] = wayNext[who[r]];
    }
    if (rec) {
      rec.finalWay = Array.prototype.slice.call(way);
      rec.yourWaysAtEnd = 0;
      for (i = 0; i < N; i++) if (yours(way[i])) rec.yourWaysAtEnd++;
    }
  }

  // Summary of one simulated future from its per-season help flow.
  function lateFlowOf(flow) {
    var x = 0; for (var s = AFTER_SEASONS - FINAL_SEASONS; s < AFTER_SEASONS; s++) x += flow[s];
    return x / FINAL_SEASONS;
  }
  function meanFlowOf(flow) {
    var x = 0; for (var s = 0; s < AFTER_SEASONS; s++) x += flow[s];
    return x / AFTER_SEASONS;
  }
  function worstStretchOf(flow) {
    var run = 0, worst = Infinity, s;
    for (s = 0; s < AFTER_SEASONS; s++) {
      run += flow[s];
      if (s >= STRETCH) run -= flow[s - STRETCH];
      if (s >= STRETCH - 1 && run < worst) worst = run;
    }
    return worst / STRETCH;
  }
  function median(a) {
    if (!a.length) return 0;
    var b = Array.prototype.slice.call(a).sort(function (x, y) { return x - y; }), k = b.length >> 1;
    return b.length % 2 ? b[k] : (b[k - 1] + b[k]) / 2;
  }

  // A row of n futures of one scenario, starting at future `from` (0 unless a caller wants fresh ones).
  function newRun(sc, n, from) { return { sc: sc, n: n, from: from || 0, next: 0, holds: 0, late: 0, mean: 0, worst: [], lates: [], held: [] }; }
  function stepRun(run, P, W, count) {      // returns how many futures it ran
    var did = 0;
    while (run.next < run.n && did < count) {
      simulate(run.sc, run.from + run.next + 1, P, W, null);   // draws of future i use index i + 1; 0 is the Life
      var late = lateFlowOf(W.flow);
      var held = late >= P.HOLD_LINE;
      if (held) run.holds++;
      run.held.push(held);
      run.late += late; run.mean += meanFlowOf(W.flow); run.worst.push(worstStretchOf(W.flow)); run.lates.push(late);
      run.next++; did++;
    }
    return did;
  }
  function runStats(run) {
    var n = run.next || 1;
    return { futures: run.next, holds: run.holds, holdsPct: 100 * run.holds / n, meanFlow: run.mean / n,
             lateFlow: run.late / n, worstStretch: median(run.worst) };
  }
  // Two rows of the same futures, a against b over the first m: the difference in holdsPct
  // (points) and its standard error. The rows share every draw they can, so the paired
  // difference is far steadier than either row.
  function paired(a, b, m) {
    var sum = 0, sq = 0, ka = 0, kb = 0, i, d;
    for (i = 0; i < m; i++) {
      d = (a[i] ? 1 : 0) - (b[i] ? 1 : 0);
      sum += d; sq += d * d;
      if (a[i]) ka++; if (b[i]) kb++;
    }
    var mean = sum / m, vr = m > 1 ? (sq - m * mean * mean) / (m - 1) : 0;
    return { aHolds: ka, bHolds: kb, aPct: 100 * ka / m, bPct: 100 * kb / m, delta: 100 * mean,
             se: 100 * Math.sqrt(Math.max(vr, 0) / m) };
  }

  function levelOf(late, P) {
    return late >= P.HOLD_LINE + NEAR_LINE ? 'holds' : late < P.HOLD_LINE - NEAR_LINE ? 'fails' : 'frays';
  }

  function runFuture(life, index, options) {
    options = options || {};
    var sc = scenario(life, options), W = scratch();
    var rec = { seasons: [], arrival: null, heir: null, yourWaysLastSeason: 0, yourWaysAtEnd: 0 };
    simulate(sc, index + 1, life.params, W, rec);
    var late = lateFlowOf(W.flow);
    return {
      index: index, holds: late >= life.params.HOLD_LINE, lateFlow: late, meanFlow: meanFlowOf(W.flow),
      level: levelOf(late, life.params),
      worstStretch: worstStretchOf(W.flow), heir: rec.heir, arrival: rec.arrival,
      yourWaysLastSeason: rec.yourWaysLastSeason, yourWaysAtEnd: rec.yourWaysAtEnd,
      seasons: rec.seasons, finalWay: rec.finalWay
    };
  }

  function project(life, options) {
    options = options || {};
    var from = life;
    if (options.lastDay) {
      var re = replayLastDay(life);
      if (!re) return null;
      from = re.life;
    }
    var run = newRun(scenario(from, options), options.futures || life.params.FUTURES, options.from);
    stepRun(run, life.params, scratch(), Infinity);
    var out = runStats(run);
    out.held = run.held;
    if (options.lateFlows) out.lateFlows = run.lates;
    return out;
  }

  function verdictJob(life, options) {
    options = options || {};
    need(life.over, 'verdict needs a finished Life');
    var P = life.params, n = options.futures || P.FUTURES;
    var m = Math.min(n, options.whatIfFutures || P.WHATIF_FUTURES), lg = legacy(life), s, k;
    var job = {
      life: life, n: n, m: m, W: scratch(), runs: [], refs: [], whatIfs: [], lastDay: null, replayed: options.lastDay !== false,
      at: 0, did: 0, total: 0,
      futures: n, futuresDone: 0, done: false, progress: 0, headline: null, result: null
    };
    job.runs.push(newRun(scenario(life, {}), n));
    job.runs.push(newRun(scenario(life, { history: 'old' }), n));
    if (options.range !== false) {
      for (k = 0; k < RANGE_WAYS.length; k++) {
        job.refs.push(job.runs.length);
        job.runs.push(newRun(scenario(life, { custom: RANGE_WAYS[k] }), m));
      }
    }
    if (options.whatIfs !== false) {
      for (s = 0; s < 5; s++) for (k = 0; k < 2; k++) {
        var toward = k === 0 ? 'help' : 'hold', v = movedHabit(life, s, toward);
        var wi = { situation: s, toward: toward, hollow: lg.hollow[s], h: lg.h[s], n: lg.n[s], habit: lg.heir[s], newHabit: v, run: -1 };
        // A move that leaves the habit where it was (helped 4 of 4, one more help) changes nothing.
        if (v !== lg.heir[s]) {
          wi.run = job.runs.length;
          job.runs.push(newRun(scenario(life, { whatIf: { situation: s, toward: toward } }), m));
        }
        job.whatIfs.push(wi);
      }
    }
    if (options.lastDay !== false) {
      var re = replayLastDay(life);
      if (re) {
        job.lastDay = { run: job.runs.length, changed: re.changed, purse: re.life.purse, houseKept: re.life.purse >= life.need };
        job.runs.push(newRun(scenario(re.life, {}), m));
      }
    }
    for (k = 0; k < job.runs.length; k++) job.total += job.runs[k].n;
    return job;
  }

  function verdictStep(job, count) {
    if (job.done) return true;
    var left = count || 100, P = job.life.params, m = job.m;
    while (left > 0 && job.at < job.runs.length) {
      var did = stepRun(job.runs[job.at], P, job.W, left);
      left -= did; job.did += did;
      if (job.runs[job.at].next >= job.runs[job.at].n) job.at++;
      if (job.at >= 2 && !job.headline) job.headline = headline(job);
    }
    job.progress = job.total ? job.did / job.total : 1;
    job.futuresDone = Math.floor(job.progress * job.n);
    if (job.at >= job.runs.length) {
      var res = job.headline, best = null, bestBefore = null, you = job.runs[0].held;
      var consider = function (out, z) {
        out.clear = out.delta !== 0 && Math.abs(out.delta) >= z * out.se;
        if (out.clear && (!best || Math.abs(out.delta) > Math.abs(best.delta))) best = out;
      };
      var mine = paired(you, you, m), yourPct = mine.aPct;
      res.whatIfFutures = m; res.whatIfBaseHolds = mine.aHolds; res.whatIfBasePct = yourPct;
      if (job.refs.length) {
        var above = 0, oldHere = null;
        var pcts = job.refs.map(function (r, k) {
          var p = runStats(job.runs[r]).holdsPct;
          if (p > yourPct) above++;
          if (sameCustom(RANGE_WAYS[k], OLD_WAY)) oldHere = p;
          return p;
        });
        var hi = Math.max.apply(null, pcts), lo = Math.min.apply(null, pcts);
        res.range = { bestPct: hi, worstPct: lo, yourPct: yourPct, oldWayPct: oldHere, rank: above + 1, of: pcts.length,
                      futures: m, inside: yourPct >= lo && yourPct <= hi,
                      baselineInside: res.baselinePct >= lo && res.baselinePct <= hi,
                      scaleLow: Math.min(lo, res.holdsPct, res.baselinePct), scaleHigh: Math.max(hi, res.holdsPct, res.baselinePct) };
      }
      res.whatIfs = job.whatIfs.map(function (wi) {
        var out = { kind: 'habit', situation: wi.situation, toward: wi.toward, hollow: wi.hollow, h: wi.h, n: wi.n,
                    habit: wi.habit, newHabit: wi.newHabit, step: Math.abs(wi.newHabit - wi.habit) };
        var pr = paired(wi.run < 0 ? you : job.runs[wi.run].held, you, m);
        out.holds = pr.aHolds; out.holdsPct = pr.aPct; out.futures = m; out.delta = pr.delta; out.se = pr.se;
        consider(out, CLEAR_Z);
        // A habit the player never wrote cannot be the habit of theirs that mattered most.
        if (out.hollow && best === out) best = bestBefore;
        bestBefore = best;
        return out;
      });
      if (job.lastDay) {
        var pl = paired(job.runs[job.lastDay.run].held, you, m);
        res.lastDay = { kind: 'lastDay', changed: job.lastDay.changed, purse: job.lastDay.purse, houseKept: job.lastDay.houseKept,
                        holds: pl.aHolds, holdsPct: pl.aPct, futures: m, delta: pl.delta, se: pl.se };
        consider(res.lastDay, CLEAR_Z_ONE);
      }
      res.mattered = best;
      if (job.replayed) {
        // "House kept, valley better off": both results, the second beyond the noise of the
        // count, and the house not kept by what was taken on the last day.
        var bought = !!(res.houseKept && res.lastDay && !res.lastDay.houseKept);
        var cost = !!(res.lastDay && res.lastDay.clear && res.lastDay.delta > 0);
        var markClear = res.mark - SEAL_Z * res.markSE >= SEAL_MARK;
        res.seal = { earned: res.houseKept && markClear && !bought && !cost, houseKept: res.houseKept, markClear: markClear,
                     boughtOnLastDay: bought, lastDayCost: cost };
      }
      job.result = res;
      job.done = true;
    }
    return job.done;
  }

  function headline(job) {
    var you = runStats(job.runs[0]), old = runStats(job.runs[1]), life = job.life;
    var pr = paired(job.runs[0].held, job.runs[1].held, job.n);
    return {
      futures: job.n, holds: you.holds, holdsPct: you.holdsPct, held: job.runs[0].held.slice(),
      baselinePct: old.holdsPct, mark: you.holdsPct - old.holdsPct, markSE: pr.se,
      meanFlow: you.meanFlow, lateFlow: you.lateFlow, worstStretch: you.worstStretch,
      baseline: { holds: old.holds, holdsPct: old.holdsPct, held: job.runs[1].held.slice(), meanFlow: old.meanFlow,
                  lateFlow: old.lateFlow, worstStretch: old.worstStretch },
      purse: life.purse, need: life.need, houseKept: life.purse >= life.need,
      whatIfFutures: job.m, whatIfBaseHolds: null, whatIfBasePct: null, range: null, whatIfs: [], lastDay: null,
      mattered: null, seal: null
    };
  }

  function verdict(life, options) {
    var job = verdictJob(life, options), report = options && options.onProgress;
    while (!verdictStep(job, 100)) if (report) report(job.did, job.total);
    if (report) report(job.did, job.total);
    return job.result;
  }

  // ---- exports ------------------------------------------------------------------------------

  var api = {
    params: PARAMS, SITUATIONS: SITUATIONS, REFERENCE_WAYS: REFERENCE_WAYS, RANGE_WAYS: RANGE_WAYS, trace: null,
    PURPOSES: { ACT: P_ACT, FORD: P_FORD, PICK: P_PICK, MODEL: P_MODEL, ADOPT: P_ADOPT, MUT: P_MUT },
    createLife: createLife, cloneLife: cloneLife, today: today, playDay: playDay, ways: ways,
    legacy: legacy, runFuture: runFuture, project: project, verdict: verdict,
    verdictJob: verdictJob, verdictStep: verdictStep, draw: draw
  };
  root.AfterYou = api;
  if (typeof module !== 'undefined' && module && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
