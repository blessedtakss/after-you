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
 *  Third round (places): nothing above changes for the valley. createLife(seed) and
 *     createLife(seed, 'valley') are the valley, output for output.
 *
 * PLACES: other places where the dilemma works differently (all of this is new in the third round)
 *   A place is a set of parameters (below) that createLife carries in life.params into every day,
 *   clone, replay and future. AfterYou.PLACES holds the presets, in play order PLACE_ORDER:
 *     valley      the valley (no parameter moved)
 *     banks       fishing grounds: a stock on each tie that keeping off fills and fishing across empties
 *     watch       border towers: standing down together pays most, standing down alone costs
 *     bridges     carters at narrow bridges: someone must give way, and not always the same one
 *     saltmarket  a guild price: holding together pays the sellers and costs the town (charter 'breaks')
 *   The page chooses a place by key: createLife(seed, 'banks'). life.place records the key (absent
 *   when createLife was given no key: then the Life is the valley moved by any overrides given).
 *   The page never names the parameters, the custom's numbers or the reference ways.
 *
 *   Place parameters (in params; every default is the valley's behaviour):
 *     S, H         the stakes. One house's gain on one tie on one day is
 *                    B x level x [their hand arrived] - C x [my hand arrived]
 *                    + S x [both arrived] - H x [neither arrived]
 *                  (level is 1 without STOCK). B, C, S, H and STORE_START are whole numbers.
 *     CUSTOM       the place's custom, five 0s or 1s (default [1, 1, 0, 1, 0], the old way). It is
 *                  kin's founding way, the reference Life (need and baseline), the heir's way where
 *                  the player left no precedent, and the habit a never-met situation defaults to in
 *                  the 'habit' replay. A middling chance throws (the custom's own Life must have a
 *                  mark of exactly 0).
 *     STORE_START  measures in house 0's store before day 1 (also in the reference Life's). The need
 *                  moves up by the same amount, so whether the house is kept is unchanged by it.
 *     STOCK        null, or { start, min, max, delta: [d0, d1, d2] } (whole numbers): a level on each of
 *                  the sixteen ties. A hand that arrives is worth B x the level before today's change;
 *                  then the level moves by delta[number of hands that arrived on that tie today] and
 *                  stays within min..max. The level belongs to the ground: a newcomer in the Afterwards
 *                  takes over its holding's ties at their levels.
 *     FLOW_KIND    what "help flow" counts each season, and so what "holds" means:
 *                    'hands' hands that arrived / hands expected to arrive (the valley)
 *                    'one'   share of tie-days on which exactly one hand arrived
 *                    'both'  share of tie-days on which both hands arrived
 *                    'stock' the season's mean tie level (each day's level after its change) / STOCK.start
 *                  It stays a fraction near 0..1, so HOLD_LINE and the 'frays' band keep their meaning.
 *     CHARTER      'holds' (valley) | 'breaks'. Under 'breaks' the place is better off when the flow
 *                  falls: held[i], runFuture().holds, holdsPct, baselinePct and level all count the
 *                  CHARTER's good outcome (late flow below HOLD_LINE), so the mark, rank, best and worst,
 *                  the what-ifs, the last-day delta and the seal need no code of their own.
 *     REPLAY       'valley' | 'habit' | 'season': which day-12 acts the last-day replay reverses (see
 *                  verdict()). 'season' is 'habit' plus the season replay: days REPLAY_FROM..12
 *                  played again with the house's habit as it stood before REPLAY_FROM (never met:
 *                  the custom), the neighbours' draws as lived; the seal is also withheld when the
 *                  mark is clear but would not be with that replay's delta (seal.wonOnSeason).
 *     REPLAY_FROM  read only under REPLAY 'season': the first day of the season replay, a whole
 *                  number 2..12 (default 9, the first day of the last season).
 *     SEAL_MARK    optional (default 5, the valley's): how far the mark must clear the custom's,
 *                  beyond two standard errors, for the seal (markClear) and in the won clauses. A place
 *                  whose marks run large (one habit moving a fifth of the futures) sets it higher.
 *     RANGE_WAYS   null (the valley's thirteen) or the place's own list of plain ways behind
 *                  verdict().range. An explicit list must contain CUSTOM (it throws otherwise); with
 *                  null and a custom outside the thirteen, the custom is appended. Read range.of.
 *     FOUNDERS     null (the valley's seats) or { near: [three entries], far: [three or more kinds] }:
 *                  the founder kinds of the three non-kin neighbours and the pool the three far houses
 *                  are drawn from. A near entry is a kind or a list of kinds (one is drawn by seed).
 *                  Kinds: 'firm', 'soft', 'taker', 'wary', 'steady', 'poacher' (fishes across a
 *                  stranger and anyone who lets it, never lets a slip go, takes peace after a
 *                  quarrel: [0, 1, 0, 0..0.15, 0.6..0.9]; never seated in the valley). The valley is
 *                  { near: ['taker', 'soft', ['firm', 'wary', 'steady']], far: FAR_POOL }.
 *
 *   What the page reads differently in a place (none of it applies in the valley):
 *     - today().neighbours[i].stock: the level on that tie today (a hand arriving today is worth
 *       B x stock). playDay().results[i].stock (the level the day was played on) and .stockAfter
 *       (after today's change); kinWith[i].stock and .stockAfter the same for kin's ties.
 *       runFuture().seasons[k].ties: the sixteen tie levels at the season's end (tie order: tieList).
 *       Present only when STOCK is set.
 *     - payoff and gained follow the place's stakes (with STOCK, payoffs differ day by day).
 *     - Under CHARTER 'breaks': holds, holdsPct, held, baselinePct, level and every row of the range
 *       count futures in which the town is better off (the ring broke). lateFlow, meanFlow,
 *       worstStretch and seasons[k].flow stay the flow itself, which is now the bad side: the
 *       Afterwards strip must take its good side from life.params.CHARTER.
 *     - verdict().range.of can differ from 13 (read it; never print "thirteen").
 *     - Under REPLAY 'habit' the lastDay entry has rule 'habit', ties [4 x { id, name, situation,
 *       lived, replayed, against }] and changed lists only the reversed ties, each with lived and
 *       replayed (true = sent a hand); seal has wonOnLastDay. A valley entry has neither field.
 *       REPLAY 'season' does the same and adds verdict().season and seal.wonOnSeason (see verdict());
 *       the Life then carries life.season (the Life before REPLAY_FROM and the choices since).
 *     - The need sentence must not lean on "the old way": oldWayPurse is the custom's purse there.
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
 *   createLife(seed, place?, overrides?) -> life
 *       seed: an integer, a string of digits ('42' is the same valley as 42), or any other
 *       non-empty string (hashed). A missing, empty or non-finite seed throws.
 *       life.seed is the valley number to store and show: an integer 0..4294967295, and
 *       createLife(life.seed) gives the same valley again (numbers outside that range wrap).
 *       place: optional, a key of AfterYou.PLACES ('valley', 'banks', ...; an unknown key throws)
 *       or an overrides object { PARAM: value } on top of AfterYou.params (the earlier form).
 *       overrides: optional { PARAM: value } on top of the place (for tuning). A Life is the same
 *       place again from (life.seed, life.place) when no overrides were given.
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
 *         place: the PLACES key, when createLife was given one
 *         stock: [16 x level]       only when params.STOCK is set: the level on each tie (tie order:
 *                                   tieList; the page reads today().neighbours[i].stock instead)
 *       }
 *       In a place, "the old way" in this header means the place's custom (params.CUSTOM).
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
 *              Under params.REPLAY 'habit' (places) the replay reverses instead every day-12 act
 *              that went against the house's own habit in that tie's situation as it stood before
 *              day 12 (sent h of n with h/n >= 0.5 means its habit was to send; a situation never
 *              met means the custom's habit), keeps the neighbours' acts as lived and runs the same
 *              futures. It is null when no act went against habit. The entry then also carries
 *              rule: 'habit', ties: [4 x { id, name, situation, lived, replayed, against }] in the
 *              order [1, 2, 6, 7] (lived / replayed: true = sent a hand), and changed lists the
 *              reversed ties as { id, name, situation, lived, replayed, h, n } (h of n: the habit
 *              the act went against; n 0 = never met, the custom's habit).
 *         seal: null when options.lastDay is false, else
 *              { earned, houseKept, markClear, boughtOnLastDay, lastDayCost }
 *              (+ wonOnLastDay under REPLAY 'habit': there is a lastDay entry, markClear, and
 *              mark + lastDay.delta - 2 x markSE < 5, so the mark was clear only by what the house
 *              did against its habit on day 12; earned then also needs !wonOnLastDay)
 *              (+ wonOnSeason under REPLAY 'season': there is a season entry, markClear, and
 *              mark + season.delta - 2 x markSE < 5, so the mark was clear only by what the house
 *              did in the last season apart from the habit it had before it; earned then also needs
 *              !wonOnSeason. A withheld seal passes silently, as for the other clauses.)
 *         season: REPLAY 'season' only, present when the season replay changed an act:
 *              { kind: 'season', from, changed: [{ day, id, name, situation, lived, replayed }],
 *              purse, houseKept, holds, holdsPct, futures (m), delta, se }. Never `mattered`.
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
 *                NEED_PIVOT, R_LIFE, R_AFTER, HOLD_LINE, ARRIVE_FROM, ARRIVE_TO, FUTURES, WHATIF_FUTURES,
 *                and the place parameters B, C, S, H, CUSTOM, STORE_START, STOCK, FLOW_KIND, CHARTER,
 *                REPLAY, RANGE_WAYS, FOUNDERS (see PLACES above)
 *   PLACES       { valley: {}, banks: {...}, watch: {...}, bridges: {...}, saltmarket: {...} }: the
 *                parameters each place moves (never shown); PLACE_ORDER the keys in play order
 *   SITUATIONS   [5 x { key, title }]
 *   REFERENCE_WAYS  the nine customs of the specification (testing; never shown)
 *   RANGE_WAYS      the thirteen customs behind `range` in the valley (testing; never shown)
 *   rangeWays(life) the plain ways behind a Life's `range` (testing; never shown)
 *   tieList      [16 x [a, b]]: the houses of each tie, in the order of life.stock and seasons[k].ties
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
    WHATIF_FUTURES: 1000, // futures behind each what-if, the last-day replay and each reference way

    // The place parameters (see PLACES in the header). Each default is the valley's behaviour,
    // and with all of them at their defaults every number the engine produces is the valley's.
    S: 0,                 // added to each side's gain on a tie-day when both hands arrived
    H: 0,                 // taken from each side's gain on a tie-day when neither hand arrived
    CUSTOM: [1, 1, 0, 1, 0],  // the place's custom (0s and 1s only): the old way in the valley
    STORE_START: 0,       // measures in house 0's store (and the reference Life's) before day 1
    STOCK: null,          // null, or { start, min, max, delta: [d0, d1, d2] }: a level on each tie
    FLOW_KIND: 'hands',   // what help flow counts: 'hands' | 'one' | 'both' | 'stock'
    CHARTER: 'holds',     // 'holds': the place is better off when the flow holds; 'breaks': when it fails
    REPLAY: 'valley',     // the last-day replay: 'valley' (stayed home after both helped) | 'habit'
    RANGE_WAYS: null,     // null (the valley's thirteen) or the place's own plain ways behind `range`
    FOUNDERS: null        // null (the valley's seats) or { near: [3 entries], far: [pool] }
  };

  // Founder bands [low, high]: each founding habit is low + (high - low) * a keyed draw.
  var BANDS = {
    firm:  { short: [0.05, 0.2], truce: [0.3, 0.5] },   // [1, 1, short, 1, truce]
    soft:  { short: [0.7, 1.0] },                       // [1, 1, short, 1, short]
    taker: { back: [0, 0.15] },                         // [0, back, 0, back, 0]
    wary:  { short: [0, 0.15], truce: [0.3, 0.5] },     // [0, 1, short, 1, truce]
    steady: { jitter: 0.1 },                            // [1, 1, 0, 0, 1], each up to 0.1 inward
    poacher: { back: [0, 0.15], truce: [0.6, 0.9] }     // [0, 1, 0, back, truce] (fix-banks: not in the valley)
  };
  var FAR_POOL = ['firm', 'firm', 'firm', 'soft', 'wary', 'steady'];   // three drawn, no taker
  // The valley's three non-kin neighbours: a taker, a soft house and one of three (drawn by seed).
  // A list entry draws one kind; FOUNDERS.near takes the same form (see seatKinds).
  var VALLEY_NEAR = ['taker', 'soft', ['firm', 'wary', 'steady']];

  var DAYS = 12, SEASON = 4, AFTER_SEASONS = 30, FINAL_SEASONS = 10, STRETCH = 5;
  var N = 8, NT = 16, YOU = 0, NEWCOMER = 8;
  // The old way [1, 1, 0, 1, 0] is PARAMS.CUSTOM's default: every use reads params.CUSTOM.
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

  // ---- places -------------------------------------------------------------------------------

  // What each place moves away from the valley's parameters (the tuners set these numbers; the
  // keys and their meaning are in the header). Never shown to the player.
  var PLACES = {
    valley: {},
    // Fishing grounds (also shared pasture). A hand is keeping off the other's water; the bank on a
    // tie fills by one when both keep off or one alone does, and empties by four when both fish
    // across. What holds is the ground itself: the late mean level against HOLD_LINE (7/6 of the
    // start). A poacher sits in the near taker's seat: it fishes across strangers but takes peace
    // after a quarrel, so ending a quarrel can be seen to work (fix-banks).
    banks: {
      B: 1, C: 2, K: 1, FOG: 0.04, R_AFTER: 2.5,
      STOCK: { start: 6, min: 1, max: 9, delta: [-4, 1, 1] },
      FLOW_KIND: 'stock', HOLD_LINE: 7 / 6,
      CUSTOM: [1, 1, 0, 1, 0],
      FOUNDERS: { near: ['poacher', 'soft', ['firm', 'wary', 'steady']], far: ['firm', 'firm', 'firm', 'soft', 'wary', 'steady'] },
      NEED_PIVOT: 181, NEED_WEIGHT: 0.5, MARGIN: 53,
      REPLAY: 'habit',
      // The valley's thirteen with [1,1,0.67,1,0] replaced by [1,1,0.5,1,1] (ends a quarrel).
      RANGE_WAYS: [[1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 1, 0, 1, 0], [1, 1, 0.33, 1, 0.33], [1, 1, 0.5, 1, 0.5],
                   [1, 1, 0.67, 1, 0.67], [1, 1, 0, 0, 1], [1, 1, 0, 0, 0], [1, 1, 0.33, 1, 0],
                   [1, 1, 0.5, 1, 0], [1, 1, 0.5, 1, 1], [1, 1, 1, 1, 0], [0, 1, 1, 1, 0]]
    },
    // Border towers. A hand is standing down. Both stand down +7, you alone -5, they alone +6,
    // both keep watch -3: together pays most, alone costs, there is nothing to take. One night in
    // ten a fire is misread (FOG). A taker and a fearful (wary) tower are always next door. The
    // custom never goes first: it answers a tower that stands down, lets a single fire pass, and
    // waits when both keep watch (fix-watch). It is among the valley's thirteen, so the range is
    // the valley's. The season replay (confirm-watch): a tower that reopens standoffs against its
    // own habit on days 9-11 and plays day 12 by the habit that made is not sealed for it.
    watch: {
      B: 6, C: 5, S: 6, H: 3, K: 1.5, FOG: 0.1,
      CUSTOM: [0, 1, 1, 1, 0],
      FLOW_KIND: 'both', HOLD_LINE: 0.3,
      FOUNDERS: { near: ['taker', 'soft', 'wary'], far: ['firm', 'firm', 'firm', 'soft', 'wary', 'steady'] },
      NEED_PIVOT: 22, NEED_WEIGHT: 0.5, MARGIN: 112,
      REPLAY: 'season'
    },
    // Carters at narrow bridges. A hand is giving way. Both waiting: nobody crosses (S -2 cancels
    // the crossing); both driving on: wheels lock (H 2). What holds is the road: tie-days on which
    // exactly one gave way. Two takers among the three near carters. Word travels slowly (K 0.25)
    // and carters look round four times a season (R_AFTER 4) (fix-bridges).
    bridges: {
      B: 3, C: 1, S: -2, H: 2, FOG: 0.06, K: 0.25, R_AFTER: 4,
      FLOW_KIND: 'one', HOLD_LINE: 0.5,
      FOUNDERS: { near: ['taker', 'taker', ['firm', 'wary', 'steady']], far: ['firm', 'firm', 'firm', 'soft', 'wary', 'steady'] },
      // With two takers near, the custom earns a median of -38 in the twelve days (pivot); the
      // starting store of 50 and margin 21 keep every need above zero.
      STORE_START: 50,
      NEED_PIVOT: -38, NEED_WEIGHT: 0.5, MARGIN: 21,
      REPLAY: 'habit',
      RANGE_WAYS: [[1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 1, 0, 1, 0], [1, 1, 0, 1, 1], [1, 0, 0, 1, 1], [1, 0.5, 0, 1, 1],
                   [0.5, 0.5, 0, 1, 0.5], [1, 0.5, 0, 1, 0.5], [0, 0, 1, 0, 1], [0, 0, 1, 0, 0.5], [1, 1, 0, 0, 1],
                   [0.5, 0.5, 0.5, 0.5, 0.5], [1, 0.5, 0.5, 1, 0.5]]
    },
    // A guild of salt sellers. A hand is holding the guild price. Holding together pays the
    // sellers; what counts is the town, which is better off in the futures where the ring breaks
    // (tie-days on which both held fall below HOLD_LINE). The custom is the guild's rule
    // [1,1,0,1,0] (the valley's old way, already among the thirteen, so the range is the valley's).
    // fix-saltmarket: the season replay (REPLAY 'season') and a seal mark of 20 (one habit here
    // moves a fifth of the futures, so "clearly better" is set at that); the need margin 14.
    saltmarket: {
      B: 3, C: 1, S: 2, H: 0,
      CUSTOM: [1, 1, 0, 1, 0],
      CHARTER: 'breaks', FLOW_KIND: 'both', HOLD_LINE: 0.5,
      NEED_PIVOT: 104, NEED_WEIGHT: 0.5, MARGIN: 14,
      REPLAY: 'season', SEAL_MARK: 20
    }
  };
  var PLACE_ORDER = ['valley', 'banks', 'watch', 'bridges', 'saltmarket'];
  var FLOW_CODE = { hands: 0, one: 1, both: 2, stock: 3 };
  var KINDS = ['firm', 'soft', 'taker', 'wary', 'steady', 'poacher'];

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

  // ---- place helpers ---------------------------------------------------------------------------

  function isWhole(x) { return typeof x === 'number' && isFinite(x) && Math.floor(x) === x; }
  function isWay(w) {
    if (!Array.isArray(w) || w.length !== 5) return false;
    for (var s = 0; s < 5; s++) if (typeof w[s] !== 'number' || !(w[s] >= 0 && w[s] <= 1)) return false;
    return true;
  }
  // The place parameters must make sense before a Life is built on them. Whole-number stakes,
  // store and levels keep every store a whole number (a store shown as 64 is never 63.6).
  function checkPlace(P) {
    need(isWhole(P.B) && isWhole(P.C) && isWhole(P.S) && isWhole(P.H), 'B, C, S and H must be whole numbers');
    need(isWhole(P.STORE_START), 'STORE_START must be a whole number');
    need(isWay(P.CUSTOM), 'CUSTOM needs five chances');
    for (var s = 0; s < 5; s++) need(P.CUSTOM[s] === 0 || P.CUSTOM[s] === 1, 'CUSTOM must be 0s and 1s');
    var ST = P.STOCK;
    if (ST !== null) {
      need(ST && typeof ST === 'object' && Array.isArray(ST.delta) && ST.delta.length === 3, 'STOCK needs { start, min, max, delta: [d0, d1, d2] }');
      need(isWhole(ST.start) && isWhole(ST.min) && isWhole(ST.max) && isWhole(ST.delta[0]) && isWhole(ST.delta[1]) && isWhole(ST.delta[2]),
           'STOCK levels and steps must be whole numbers');
      need(ST.min >= 0 && ST.min <= ST.start && ST.start <= ST.max && ST.start > 0, 'STOCK needs 0 <= min <= start <= max and start > 0');
    }
    need(typeof P.FLOW_KIND === 'string' && FLOW_CODE.hasOwnProperty(P.FLOW_KIND), "FLOW_KIND must be 'hands', 'one', 'both' or 'stock'");
    need(P.FLOW_KIND !== 'stock' || ST !== null, "FLOW_KIND 'stock' needs STOCK");
    need(P.CHARTER === 'holds' || P.CHARTER === 'breaks', "CHARTER must be 'holds' or 'breaks'");
    need(P.REPLAY === 'valley' || P.REPLAY === 'habit' || P.REPLAY === 'season', "REPLAY must be 'valley', 'habit' or 'season'");
    if (P.REPLAY === 'season' && P.REPLAY_FROM !== undefined) need(isWhole(P.REPLAY_FROM) && P.REPLAY_FROM >= 2 && P.REPLAY_FROM <= DAYS, 'REPLAY_FROM must be a whole number 2..12');
    if (P.SEAL_MARK !== undefined) need(typeof P.SEAL_MARK === 'number' && isFinite(P.SEAL_MARK) && P.SEAL_MARK >= 0 && P.SEAL_MARK < 100, 'SEAL_MARK must be a number 0..100');
    if (P.RANGE_WAYS !== null) {
      need(Array.isArray(P.RANGE_WAYS) && P.RANGE_WAYS.length > 0 && P.RANGE_WAYS.every(isWay), 'RANGE_WAYS must be a list of five-chance ways');
      need(P.RANGE_WAYS.some(function (w) { return sameCustom(w, P.CUSTOM); }), 'RANGE_WAYS must contain CUSTOM');
    }
    var F = P.FOUNDERS;
    if (F !== null) {
      need(F && Array.isArray(F.near) && F.near.length === 3, 'FOUNDERS needs near: [three entries]');
      F.near.forEach(function (e) {
        var list = Array.isArray(e) ? e : [e];
        need(list.length > 0 && list.every(function (k) { return KINDS.indexOf(k) >= 0; }), 'FOUNDERS.near: unknown kind ' + JSON.stringify(e));
      });
      need(F.far === undefined || (Array.isArray(F.far) && F.far.length >= 3 && F.far.every(function (k) { return KINDS.indexOf(k) >= 0; })),
           'FOUNDERS.far needs three or more known kinds');
    }
  }
  // The plain ways behind verdict().range: the place's own list, or the valley's thirteen with the
  // custom appended when it is not among them (so range.oldWayPct always has the custom's row).
  function rangeWaysOf(P) {
    if (P.RANGE_WAYS) return P.RANGE_WAYS;
    for (var k = 0; k < RANGE_WAYS.length; k++) if (sameCustom(RANGE_WAYS[k], P.CUSTOM)) return RANGE_WAYS;
    return RANGE_WAYS.concat([P.CUSTOM.slice()]);
  }
  // Whether a future's late flow is the charter's good outcome: the flow holds ('holds') or the
  // ring has broken ('breaks'). Every count of futures in the verdict goes through this.
  function heldBy(late, P) { return P.CHARTER === 'breaks' ? late < P.HOLD_LINE : late >= P.HOLD_LINE; }
  // A tie's level after a day on which `hands` hands (0, 1 or 2) arrived on it.
  function stockStep(level, hands, ST) {
    var v = level + ST.delta[hands];
    return v < ST.min ? ST.min : v > ST.max ? ST.max : v;
  }
  // The kinds of the three non-kin neighbours, seat by seat before the seats are shuffled. A list
  // entry draws one kind with P_THIRD, sub-key = its place among the list entries (so the valley's
  // single list, the third seat, draws exactly what it always drew).
  function seatKinds(entries, seed) {
    var out = [], lists = 0;
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      out.push(Array.isArray(e) ? e[Math.floor(draw(seed, P_THIRD, 0, lists++, 0, 0) * e.length)] : e);
    }
    return out;
  }
  // How many houses reconsider this season. A fractional rate (1.5) means one house, and a
  // second one in half the seasons, by keyed draw.
  function roundCount(rate, seed, season, f) {
    var whole = Math.floor(rate);
    if (rate > whole && draw(seed, P_EXTRA, season, 0, 0, f) < rate - whole) whole++;
    return Math.min(whole, N);
  }

  function founder(archetype, seed, id, custom) {
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
      case 'poacher': return [0, 1, 0, band(B.back, 0), band(B.truce, 1)];
      default: return custom.slice();   // kin: the family way of the place (the old way), exactly
    }
  }

  // ---- the Life -----------------------------------------------------------------------------

  // A parameter value of its own for each Life (CUSTOM, STOCK and the lists are objects; a Life
  // must never share one with AfterYou.params, PLACES or the caller's overrides).
  function ownCopy(v) { return v !== null && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v; }

  function newLife(seedIn, overrides) {
    var P = {}, k, i;
    for (k in PARAMS) P[k] = ownCopy(PARAMS[k]);
    if (overrides) for (k in overrides) P[k] = ownCopy(overrides[k]);
    checkPlace(P);
    var seed = seedInt(seedIn), nb = NBR[YOU];
    var kin = nb[Math.floor(draw(seed, P_KIN, 0, 0, 0, 0) * nb.length)];

    var arch = new Array(N), F = P.FOUNDERS;
    arch[YOU] = 'you'; arch[kin] = 'kin';
    var near = seatKinds(F ? F.near : VALLEY_NEAR, seed), seat = keyedOrder(seed, P_SEATS, 3), j = 0;
    for (i = 0; i < nb.length; i++) if (nb[i] !== kin) arch[nb[i]] = near[seat[j++]];
    var pool = F && F.far ? F.far : FAR_POOL, far = keyedOrder(seed, P_FAR, pool.length);
    for (i = 0, j = 0; i < N; i++) if (!arch[i]) arch[i] = pool[far[j++]];

    var nameAt = keyedOrder(seed, P_NAME, NAMES.length), houses = [], seen = {}, since = {}, seenFar = {}, changedDay = {};
    for (i = 0; i < N; i++) {
      houses.push({
        id: i, name: NAMES[nameAt[i]],
        role: i === YOU ? 'you' : i === kin ? 'kin' : VISIBLE[i] ? 'neighbour' : 'far',
        archetype: arch[i],
        custom: i === YOU ? null : founder(arch[i], seed, i, P.CUSTOM),
        source: i === YOU ? null : [ownSource(), ownSource(), ownSource(), ownSource(), ownSource()],
        tally: emptyTally(), purse: i === YOU ? P.STORE_START : 0, season: 0, way: i
      });
    }
    for (i = 0; i < nb.length; i++) { seen[nb[i]] = emptyTally(); since[nb[i]] = emptyTally(); seenFar[nb[i]] = emptyTally(); changedDay[nb[i]] = null; }
    var ways = [], last = [];
    for (i = 0; i < 5; i++) ways.push({ h: 0, n: 0, deeds: [] });
    for (i = 0; i < NT; i++) last.push(null);
    var life = {
      seed: seed, day: 1, over: false, kin: kin, neighbours: nb.slice(), purse: P.STORE_START, need: null,
      params: P, houses: houses, ways: ways, seen: seen, seenSince: since, seenFar: seenFar, changedDay: changedDay,
      last: last, yesterday: null, rounds: [], seasonPay: [], lastDay: null, old: null
    };
    // A place with a stock: every tie starts at the same level. (No field at all without one, so
    // a valley Life is the same object as before, field for field.)
    if (P.STOCK) {
      life.stock = [];
      for (i = 0; i < NT; i++) life.stock.push(P.STOCK.start);
    }
    return life;
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
  // In a place the old way is the place's custom. A starting store (STORE_START) sits in both
  // purses, so the pivot moves with it: the need rises by exactly STORE_START and the house is
  // kept on exactly the same Lives as without it. NEED_PIVOT stays a purse earned in the twelve days.
  function winterNeed(oldPurse, P) {
    var pivot = P.NEED_PIVOT + P.STORE_START;
    var pegged = Math.round(pivot + P.NEED_WEIGHT * (oldPurse - pivot) + P.MARGIN);
    return Math.max(oldPurse + 1, pegged);
  }

  // A place key, an overrides object or nothing, and optional overrides on top: one overrides
  // object for newLife, and the key to record.
  function placeOf(place, more) {
    var key = null, base = null, out = {}, k;
    if (typeof place === 'string') {
      need(PLACES.hasOwnProperty(place), 'unknown place "' + place + '"');
      key = place; base = PLACES[place];
    } else if (place !== undefined && place !== null) {
      need(typeof place === 'object', 'createLife: a place is a key of AfterYou.PLACES or an overrides object');
      base = place;
    }
    if (!more) return { key: key, overrides: base };
    if (base) for (k in base) out[k] = base[k];
    for (k in more) out[k] = more[k];
    return { key: key, overrides: out };
  }

  function createLife(seed, place, more) {
    var pl = placeOf(place, more);
    var life = newLife(seed, pl.overrides), ref = newLife(seed, pl.overrides), custom = life.params.CUSTOM;
    // The old-way reference: house 0 lives the same tape as a plain reciprocator (in a place: as
    // the place's custom). It fixes the winter need and is the world the verdict compares
    // against. Draws are keyed, so running it cannot disturb the real Life.
    while (!ref.over) {
      var ch = {};
      for (var i = 0; i < ref.neighbours.length; i++) {
        var L = ref.last[TIE[YOU][ref.neighbours[i]]];
        ch[ref.neighbours[i]] = custom[L ? sitOf(L[0], L[1]) : 0] === 1;
      }
      playDay(ref, ch);
    }
    life.need = winterNeed(ref.purse, life.params);
    life.old = { purse: ref.purse, end: endState(ref) };
    if (pl.key !== null) life.place = pl.key;
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
      if (life.stock) out[i].stock = life.stock[TIE[YOU][id]];   // a hand arriving today is worth B x this
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
    // REPLAY 'season': the verdict also replays the last season (days REPLAY_FROM..12). Only the
    // real Life keeps what that needs: the Life as it stood before REPLAY_FROM and each day's choices.
    if (P.REPLAY === 'season' && life.old) {
      if (D === seasonFrom(P)) {
        var keepOld = life.old;
        life.old = null;
        life.season = { from: D, before: cloneLife(life), sent: [] };
        life.old = keepOld;
      }
      if (life.season) life.season.sent.push(send);
    }
    // The verdict can replay the last day. Only the real Life keeps what that needs.
    if (D === DAYS && life.old) {
      var keep = life.old, keepSeason = life.season;
      life.old = null;
      if (keepSeason) life.season = null;
      life.lastDay = { before: cloneLife(life), sent: send };
      life.old = keep;
      if (keepSeason) life.season = keepSeason;
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
    var stock = life.stock || null;
    for (t = 0; t < NT; t++) {
      var a = TIE_A[t], b = TIE_B[t], L = life.last[t];
      var sa = L ? sitOf(L[0], L[1]) : 0, sb = L ? sitOf(L[1], L[0]) : 0;
      var ma = move(a, b, sa), mb = move(b, a, sb);
      var ha = ma.arrived ? 1 : 0, hb = mb.arrived ? 1 : 0;
      last[t] = [ha, hb];
      // The stakes (the futures repeat them in simulate): a hand that arrives is worth bt to the
      // house it reaches (B, or B x the tie's level before today's change) and costs its sender C;
      // shared is S on a tie-day when both arrived and -H when neither did (0 in the valley).
      var level = stock ? stock[t] : 1, bt = stock ? P.B * level : P.B;
      var shared = P.S * (ha & hb) - P.H * (1 - (ha | hb));
      gain[a] += bt * hb - P.C * ha + shared;
      gain[b] += bt * ha - P.C * hb + shared;
      if (stock) stock[t] = stockStep(level, ha + hb, P.STOCK);
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
        var pay = bt * hb - P.C * ha + shared;
        results.push({
          id: b, name: H[b].name, kin: b === life.kin, situation: sa,
          intended: ma.intended, lost: ma.lost, arrived: ma.arrived, they: mb.arrived, payoff: pay, why: why
        });
        if (stock) { results[results.length - 1].stock = level; results[results.length - 1].stockAfter = stock[t]; }
        yesterday[b] = { intended: ma.intended, lost: ma.lost, arrived: ma.arrived, they: mb.arrived, payoff: pay };
      } else if (open && a === life.kin) {
        kinWith.push({ id: b, name: H[b].name, kinSent: ma.arrived, theySent: mb.arrived, why: why });
        if (stock) { kinWith[kinWith.length - 1].stock = level; kinWith[kinWith.length - 1].stockAfter = stock[t]; }
      } else if (open && b === life.kin) {
        kinWith.push({ id: a, name: H[a].name, kinSent: mb.arrived, theySent: ma.arrived, why: why });
        if (stock) { kinWith[kinWith.length - 1].stock = level; kinWith[kinWith.length - 1].stockAfter = stock[t]; }
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
      // No precedent, no change: the heir keeps the old family way there (the place's custom),
      // exactly as kin does.
      heir.push(w.n ? w.h / w.n : life.params.CUSTOM[s]);
      fromYou.push(kin.source[s].type === 'you');
    }
    return { custom: custom, hollow: hollow, heir: heir, h: h, n: n,
             kin: { id: kin.id, name: kin.name, custom: kin.custom.slice(), fromYou: fromYou } };
  }

  // What a finished Life hands to the Afterwards (house 0's custom is filled in per scenario).
  function endState(life) {
    var end = {
      names: life.houses.map(function (x) { return x.name; }),
      custom: life.houses.map(function (x) { return x.custom ? x.custom.slice() : null; }),
      tallyH: life.houses.map(function (x) { return x.tally.h.slice(); }),
      tallyN: life.houses.map(function (x) { return x.tally.n.slice(); }),
      last: life.last.map(function (L) { return L ? L.slice() : null; }),
      way: life.houses.map(function (x) { return x.way; }),
      seasonPay: life.seasonPay.map(function (p) { return p.slice(); })
    };
    if (life.stock) end.stock = life.stock.slice();   // the ground as the Life leaves it
    return end;
  }

  // Day 12 again with some of the player's acts reversed; everything else as it was. Draws are
  // keyed, so nothing unrelated moves: the neighbours act on day 12 exactly as they did.
  //   REPLAY 'valley': a hand sent to every neighbour the player stayed home against after both
  //     had helped.
  //   REPLAY 'habit' (places): every act that went against the house's own habit in that tie's
  //     situation as it stood before day 12 is reversed. Its habit there was to send when it had
  //     sent h of n times with h / n >= 0.5; in a situation never met, the custom's habit. Each of
  //     the four ties is reported (ties), and the reversed ones again in changed.
  // Returns null when no act is reversed.
  function replayLastDay(life) {
    var ld = life.lastDay, P = life.params, habit = P.REPLAY === 'habit' || P.REPLAY === 'season', i;
    if (!ld) return null;
    var alt = cloneLife(ld.before), ch = {}, changed = [], ties = [];
    for (i = 0; i < alt.neighbours.length; i++) {
      var id = alt.neighbours[i], L = alt.last[TIE[YOU][id]], name = alt.houses[id].name;
      ch[id] = ld.sent[id];
      if (habit) {
        var s = L ? sitOf(L[0], L[1]) : 0, w = alt.ways[s];
        var favoured = w.n ? 2 * w.h >= w.n : P.CUSTOM[s] === 1, against = ch[id] !== favoured;
        ties.push({ id: id, name: name, situation: s, lived: ch[id], replayed: favoured, against: against });
        if (against) { changed.push({ id: id, name: name, situation: s, lived: ch[id], replayed: favoured, h: w.h, n: w.n }); ch[id] = favoured; }
      } else if (!ch[id] && L && sitOf(L[0], L[1]) === 1) { ch[id] = true; changed.push({ id: id, name: name }); }
    }
    if (!changed.length) return null;
    alt.old = life.old;
    alt.need = life.need;
    playDay(alt, ch);
    return habit ? { life: alt, changed: changed, rule: 'habit', ties: ties } : { life: alt, changed: changed };
  }

  // REPLAY 'season' only. The first day of the season replay.
  function seasonFrom(P) { return P.REPLAY_FROM !== undefined ? P.REPLAY_FROM : DAYS - SEASON + 1; }
  // The last season again (days `from`..12), the house playing on every tie its habit as it stood
  // before `from` (sent h of n there with h / n >= 0.5 means send; a situation never met means the
  // custom's habit), in the situation the replay is in. Days 1..from-1 are as lived; draws are keyed,
  // so the neighbours act as they would have. A precedent written in the last season, after the
  // sister last learned from the house in a season she could act on it, is thus never tested in the
  // Life; this replay is what the seal compares it with. changed lists every act that differs from
  // what was lived on that day. Returns null when none does (the replay is the Life itself).
  function replaySeason(life) {
    var se = life.season, P = life.params, s, i;
    if (!se) return null;
    var alt = cloneLife(se.before), hb = [];
    for (s = 0; s < 5; s++) { var w = alt.ways[s]; hb.push(w.n ? 2 * w.h >= w.n : P.CUSTOM[s] === 1); }
    var changed = [];
    while (!alt.over) {
      var D = alt.day, lived = se.sent[D - se.from], ch = {};
      for (i = 0; i < alt.neighbours.length; i++) {
        var id = alt.neighbours[i], L = alt.last[TIE[YOU][id]], sit = L ? sitOf(L[0], L[1]) : 0;
        ch[id] = hb[sit];
        if (ch[id] !== lived[id]) changed.push({ day: D, id: id, name: alt.houses[id].name, situation: sit, lived: lived[id], replayed: ch[id] });
      }
      playDay(alt, ch);
    }
    if (!changed.length) return null;
    alt.old = life.old;
    alt.need = life.need;
    return { life: alt, changed: changed, from: se.from, habit: hb };
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
    if (end.stock) sc.stock = Float64Array.from(end.stock);   // the tie levels the futures start from
    // "Payoff over the last 3 seasons" reaches back into the Life until the Afterwards has
    // three seasons of its own: slot k holds Life season k + 1 and is overwritten in turn.
    for (t = 0; t < end.seasonPay.length && t < 3; t++) for (i = 0; i < N; i++) sc.hist[t * N + i] = end.seasonPay[t][i];
    // The heir is a new head of house 0: what the valley has witnessed of it starts empty
    // (th, tn stay 0 for house 0), so nobody can copy it before it has been seen to act.
    if (spec.custom) {
      for (s = 0; s < 5; s++) { sc.cust[s] = spec.custom[s]; sc.cust[kin * 5 + s] = spec.custom[s]; sc.th[kin * 5 + s] = 0; sc.tn[kin * 5 + s] = 0; }
    } else if (old) {
      for (s = 0; s < 5; s++) sc.cust[s] = life.params.CUSTOM[s];
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
      from: new Int32Array(N), wayNext: new Int32Array(N), stock: new Float64Array(NT)
    };
  }

  // Runs future f of scenario sc into W.flow (help flow per season). With rec, also records
  // the season-by-season detail. This is the hot loop: flat arrays, no allocation without rec.
  function simulate(sc, f, P, W, rec) {
    var cust = W.cust, th = W.th, tn = W.tn, la = W.la, lb = W.lb, pay = W.pay, hist = W.hist,
        flow = W.flow, way = W.way, pick = W.pick, tmp = W.tmp, who = W.who, from = W.from,
        wayNext = W.wayNext, stk = W.stock;
    var seed = sc.seed, FOG = P.FOG, B = P.B, C = P.C, K = P.K, MUT = P.MUT;
    // The place's stakes and flow (read once). SH: whether S or H is in play at all; FK: what the
    // flow counts (FLOW_CODE); ST: the stock, or null.
    var S = P.S, H = P.H, SH = S !== 0 || H !== 0, ST = P.STOCK, FK = FLOW_CODE[P.FLOW_KIND];
    var R, tr = api.trace;
    var i, s, d, t, r, q, a, b, x, y, sa, sb, ia, ib, pa, pb, ka, kb, ha, hb, u, v, m, bt, shared, lv, counted;
    cust.set(sc.cust); th.set(sc.th); tn.set(sc.tn); la.set(sc.la); lb.set(sc.lb); hist.set(sc.hist);
    if (ST) stk.set(sc.stock);
    for (i = 0; i < N; i++) way[i] = sc.way[i];
    if (rec) rec.heir = Array.prototype.slice.call(cust, 0, 5);

    var pAct = prefix(seed, P_ACT, f), pFord = prefix(seed, P_FORD, f), pPick = prefix(seed, P_PICK, f),
        pModel = prefix(seed, P_MODEL, f), pAdopt = prefix(seed, P_ADOPT, f), pMut = prefix(seed, P_MUT, f);
    var arriveAt = P.ARRIVE_FROM + Math.floor(draw(seed, P_ARRIVE, 0, 0, 0, f) * (P.ARRIVE_TO - P.ARRIVE_FROM + 1));
    var denom = NT * 2 * SEASON * (1 - FOG);              // 'hands': hands expected to arrive in a season
    var tieDays = NT * SEASON * (FK === FLOW_CODE.stock ? ST.start : 1);   // the other kinds: per tie-day
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
        // Its four ties start afresh ("meeting someone new"); their levels stay as they are (the
        // level belongs to the ground, not to the family that left).
        for (i = 0; i < 4; i++) { t = TIE[poorest][NBR[poorest][i]]; la[t] = -1; lb[t] = -1; }
        way[poorest] = NEWCOMER;
      }

      for (i = 0; i < N; i++) pay[i] = 0;
      counted = 0;               // what this place's flow counts, summed over the season
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
          // The stakes, as in playDay. In the valley bt = B and shared = 0, exactly.
          bt = ST ? B * stk[t] : B;
          shared = SH ? S * (ha & hb) - H * (1 - (ha | hb)) : 0;
          pay[a] += bt * hb - C * ha + shared; pay[b] += bt * ha - C * hb + shared;
          // Each flow kind counts only what it needs.
          if (FK === 0) counted += ha + hb; else if (FK === 1) counted += ha ^ hb; else if (FK === 2) counted += ha & hb;
          if (ST) {
            lv = stk[t] + ST.delta[ha + hb];
            stk[t] = lv < ST.min ? ST.min : lv > ST.max ? ST.max : lv;
            if (FK === 3) counted += stk[t];
          }
          la[t] = ha; lb[t] = hb;
          if (rec) { sent[a] += ha; sent[b] += hb; }
        }
      }
      flow[s - 1] = FK === 0 ? counted / denom : counted / tieDays;
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
        if (ST) rec.seasons[s - 1].ties = Array.prototype.slice.call(stk);   // levels at the season's end
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
      var held = heldBy(late, P);    // the charter's good outcome (in the valley: late >= HOLD_LINE)
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

  // 'holds' / 'frays' / 'fails', facing the charter: under 'breaks' a late flow well below the
  // line is the town's good outcome ('holds') and one well above it is 'fails'.
  function levelOf(late, P) {
    if (P.CHARTER === 'breaks') return late < P.HOLD_LINE - NEAR_LINE ? 'holds' : late >= P.HOLD_LINE + NEAR_LINE ? 'fails' : 'frays';
    return late >= P.HOLD_LINE + NEAR_LINE ? 'holds' : late < P.HOLD_LINE - NEAR_LINE ? 'fails' : 'frays';
  }

  function runFuture(life, index, options) {
    options = options || {};
    var sc = scenario(life, options), W = scratch();
    var rec = { seasons: [], arrival: null, heir: null, yourWaysLastSeason: 0, yourWaysAtEnd: 0 };
    simulate(sc, index + 1, life.params, W, rec);
    var late = lateFlowOf(W.flow);
    return {
      index: index, holds: heldBy(late, life.params), lateFlow: late, meanFlow: meanFlowOf(W.flow),
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
    if (options.season) {           // REPLAY 'season' only: the replayed last season
      var rs = replaySeason(life);
      if (!rs) return null;
      from = rs.life;
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
      at: 0, did: 0, total: 0, rangeWays: rangeWaysOf(P),
      futures: n, futuresDone: 0, done: false, progress: 0, headline: null, result: null
    };
    job.runs.push(newRun(scenario(life, {}), n));
    job.runs.push(newRun(scenario(life, { history: 'old' }), n));
    if (options.range !== false) {
      for (k = 0; k < job.rangeWays.length; k++) {
        job.refs.push(job.runs.length);
        job.runs.push(newRun(scenario(life, { custom: job.rangeWays[k] }), m));
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
        if (re.rule) { job.lastDay.rule = re.rule; job.lastDay.ties = re.ties; }
        job.runs.push(newRun(scenario(re.life, {}), m));
      }
      if (P.REPLAY === 'season') {
        var rs = replaySeason(life);
        if (rs) {
          job.season = { run: job.runs.length, from: rs.from, changed: rs.changed, purse: rs.life.purse, houseKept: rs.life.purse >= life.need };
          job.runs.push(newRun(scenario(rs.life, {}), m));
        }
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
          if (sameCustom(job.rangeWays[k], P.CUSTOM)) oldHere = p;
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
        if (job.lastDay.rule) { res.lastDay.rule = job.lastDay.rule; res.lastDay.ties = job.lastDay.ties; }
        consider(res.lastDay, CLEAR_Z_ONE);
      }
      if (job.season) {
        var ps = paired(job.runs[job.season.run].held, you, m);
        res.season = { kind: 'season', from: job.season.from, changed: job.season.changed, purse: job.season.purse, houseKept: job.season.houseKept,
                       holds: ps.aHolds, holdsPct: ps.aPct, futures: m, delta: ps.delta, se: ps.se };
      }
      res.mattered = best;
      if (job.replayed) {
        // "House kept, valley better off": both results, the second beyond the noise of the
        // count, and the house not kept by what was taken on the last day.
        var bought = !!(res.houseKept && res.lastDay && !res.lastDay.houseKept);
        var cost = !!(res.lastDay && res.lastDay.clear && res.lastDay.delta > 0);
        var sealMark = P.SEAL_MARK !== undefined ? P.SEAL_MARK : SEAL_MARK;
        var markClear = res.mark - SEAL_Z * res.markSE >= sealMark;
        res.seal = { earned: res.houseKept && markClear && !bought && !cost, houseKept: res.houseKept, markClear: markClear,
                     boughtOnLastDay: bought, lastDayCost: cost };
        if (P.REPLAY === 'habit' || P.REPLAY === 'season') {
          // Places: nor may the mark be clear only by what the house did against its own habit on
          // the last day (delta is what reversing those acts is worth to the charter).
          var won = !!(res.lastDay && markClear && res.mark + res.lastDay.delta - SEAL_Z * res.markSE < sealMark);
          res.seal.earned = res.seal.earned && !won;
          res.seal.wonOnLastDay = won;
        }
        if (P.REPLAY === 'season') {
          // Nor only by a precedent written in the last season: with days REPLAY_FROM..12 played by
          // the habit the house had before them, the mark must still clear. (The season replay is
          // a check on the seal only; it is never what mattered.)
          var wonS = !!(res.season && markClear && res.mark + res.season.delta - SEAL_Z * res.markSE < sealMark);
          res.seal.earned = res.seal.earned && !wonS;
          res.seal.wonOnSeason = wonS;
        }
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
    PLACES: PLACES, PLACE_ORDER: PLACE_ORDER,
    tieList: TIE_A.map(function (a, t) { return [a, TIE_B[t]]; }),
    rangeWays: function (life) { return rangeWaysOf(life.params || life).map(function (w) { return w.slice(); }); },
    createLife: createLife, cloneLife: cloneLife, today: today, playDay: playDay, ways: ways,
    legacy: legacy, runFuture: runFuture, project: project, verdict: verdict, replaySeason: replaySeason,
    verdictJob: verdictJob, verdictStep: verdictStep, draw: draw
  };
  root.AfterYou = api;
  if (typeof module !== 'undefined' && module && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
