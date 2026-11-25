/*
 * After You: the valley, as a place. Pure data: the words the page says here (lexicon and
 * charter), how its sheet is decorated (sheet), the Chronicle's closing paragraph (afterword), and
 * the rules the words were written for (writtenFor). Loads after words.js, which keeps the register
 * (AYPlaces); the engine's rules for the place are AfterYou.PLACES.valley, chosen by the same key.
 *
 * Templates: a {slot} is filled by words.js (AYWords) from engine data; every other character is
 * printed as it stands. Each key is read by the AYWords function named beside it. A place must
 * give every key the valley gives (page-smoke.js checks it): a key that is missing throws, and is
 * never taken from another place. No template holds a digit: every number that states a rule is
 * a slot filled from the Life (the stakes on the Opening, {line}, {of}).
 */
(function (root) {
  'use strict';

  root.AYPlaces.add({
    id: 'valley',

    lexicon: {
      name: 'The valley',                              // placeName (the place's name, said for a listener in the choice of places)
      label: 'Valley',                                 // placeLabel (the choice of places, for the eye: one short word, five to a row)

      // ---- the actors ----------------------------------------------------------------------
      house: 'the {name} house',                       // house, who, whyThird, elsewhere, futureLines
      House: 'The {name} house',                       // House, who, cardName, elsewhere
      way: 'the {name} way',                           // why (a house's own way), futureLines
      kin: "your sister's house",                      // kin, who, elsewhere, futureLines
      Kin: "Your sister's house",                      // kin, who, cardName, whyThird, elsewhere, kinFollows
      heir: 'your heir',                               // heir, futureLines
      Heir: 'Your heir',                               // heir (the resting map in words)
      toward: 'toward',                       // choiceLegend and the sister's Why? title: "Today, toward ..."
      actor: {
        one: 'house',                                  // closeDay
        many: 'houses',                                // closeDay
        yours: 'your house',                           // seasonEnd (looked to your house)
        far: 'a house beyond your neighbours'          // why (taken up from), seasonEnd
      },
      newcomers: 'newcomers',                          // legendAfter, houseAtEnd
      goods: { one: 'measure', many: 'measures' },     // store, oldWay, leavingStore, houseAtEnd
      act: {
        send: 'Send a hand',                           // send (the button)
        stay: 'Stay home',                             // stay (the button)
        sends: 'sends a hand',                         // seasonEnd (the sister's changes), leaveNote
        stays: 'stays home'                            // seasonEnd, leaveNote
      },
      custom: {
        Name: 'The old way',                           // rowLabels, rangeLabels
        gloss: 'The old way, which is to send a hand to someone new and then do as they did yesterday, would bring in {purse} {goods} this harvest.'   // oldWay
      },

      // ---- the five situations, as each part of the page names them ---------------------------
      titles: ['Meeting someone new', 'After you both helped', 'After they left you short',
               'After you left them short', 'After you both stayed home'],          // title (Your ways, the cards, season's end, mattered)
      knowRows: ['meeting someone new', 'after hands went both ways', 'after being left short',
                 'after leaving the other short', 'after both stayed home'],         // knowLabel
      whereThey: ['Meeting you for the first time', 'After hands went both ways', 'After you left them short',
                  'After they left you short', 'After both houses stayed home'],     // why
      deedSit: ['on first meeting', 'after hands went both ways', 'after they left you short',
                'after you left them short', 'after both houses stayed home'],      // deed
      whereThird: ['Meeting {other} for the first time', 'After hands went both ways', 'After {other} left them short',
                   'After they left {other} short', 'After both houses stayed home'],   // whyThird

      // ---- the Opening -------------------------------------------------------------------------
      opening: {                                                                    // opening
        premise: 'Twelve days of harvest in a valley of eight houses. Then you leave, and the valley goes on without you.',
        lines: [
          'Each day, each of your four neighbours has a crop that will not wait. You can send a hand or stay home. So can they.',
          'A hand sent costs you {cost} {costGoods} of your own grain. A hand that arrives is worth {worth} to the house it reaches.',
          'What you do, others see. Some will take it up as their own way, at the end of every fourth day.',
          'At the end two things are counted: whether your store is enough for winter, and whether the valley is better or worse off for the ways you left.'
        ]
      },
      pastName: 'Valley {seed}',                       // pastLife
      placeNo: 'Valley no. {seed}',                    // valleyNo

      // ---- the sheet's words -------------------------------------------------------------------
      map: {                                           // mapLabels
        crossing: 'the ford',
        farLine: 'the ridge',
        beyond: 'beyond the ridge',
        seat: 'Your holding',
        heir: 'Your heir',
        kin: 'your sister'
      },
      mapAlt: {                                        // mapAlt
        sheet: 'Map of the valley: your holding at the foot, four neighbours across the ford, three holdings beyond the ridge.',
        day: 'Map of the valley: your holding at the foot, your four neighbours across the ford, and three holdings beyond the ridge that you cannot see.',
        after: 'Map of the valley: eight holdings on a ring, joined by sixteen ties.'
      },
      mapAltDay: {                                     // mapAltDay
        head: 'Map of the valley, {when}.',
        plan: 'A hand planned to {who}.',
        stay: 'Staying home against {who}.'
      },
      bearingSay: 'To the {bearing} of your holding.', // bearingSay
      legendDay: {                                     // legendDay
        arrived: 'a hand that arrived',
        lost: 'your hand, turned back at the ford',
        planned: 'a hand you mean to send',
        stay: 'you stay home'
      },
      legendAfter: {                                   // legendAfter
        help: 'field filled by how freely the house sends hands',
        income: 'measures brought in this season'
      },
      legendWays: { sent: 'sent a hand', stayed: 'stayed home' },                   // legendWays
      mapHint: 'Choose on the cards, or on a holding on the map.',                 // mapHint

      // ---- the day -------------------------------------------------------------------------------
      storeHead: 'Winter store',                       // storeHead (and dayTotal, leavingStore)
      chooseLine: 'For each house, send a hand or stay home.',                     // chooseLine
      knowValue: 'sent a hand {h} of {n}',             // knowValue
      yesterday: {                                     // yesterday
        lostTheirs: 'Yesterday your hand was turned back at the ford. They saw only that none came. Theirs reached you.',
        lostNone: 'Yesterday your hand was turned back at the ford. They saw only that none came. None came from them.',
        both: 'Yesterday hands went both ways.',
        mine: 'Yesterday you sent a hand. None came from them.',
        theirs: 'Yesterday they sent a hand. None came from you.',
        neither: 'Yesterday you stayed home. None came from them.'
      },
      reveal: {                                        // reveal (and mapAltDay)
        lostTheirs: 'Your hand was turned back at the ford. They saw only that none came. Theirs reached you.',
        lostNone: 'Your hand was turned back at the ford. They saw only that none came. None came from them.',
        both: 'Hands went both ways.',
        mine: 'Your hand reached them. None came back.',
        theirs: 'Their hand reached you. You sent none.',
        neither: 'You stayed home. None came from them.'
      },
      luckNote: 'A hand can be turned back at the ford. It then costs nothing and brings nothing. You only ever see whether one arrived.',   // fordNote

      // ---- Why? ------------------------------------------------------------------------------------
      whyMarked: 'Marked: the first time a house does as it learned from you.',    // whyMarked
      knew: {                                          // why (what was known of them before today)
        sinceOnceSent: 'Between then and today you had seen them here once, and they sent a hand.',
        sinceOnceNone: 'Between then and today you had seen them here once, and no hand came.',
        sinceMany: 'Between then and today you knew them to send a hand here {h} of {n} times.',
        onceSent: 'Before today you had seen them here once, and they sent a hand.',
        onceNone: 'Before today you had seen them here once, and no hand came.',
        many: 'Before today you knew them to send a hand here {h} of {n} times.'
      },
      hereYou: {                                       // why, whyThird (your deeds when they learned)
        onceSent: 'When they learned it, this had come up once, and you sent a hand.',
        onceStayed: 'When they learned it, this had come up once, and you stayed home.',
        many: 'When they learned it, you had sent a hand here {h} of {n} times.'
      },
      deed: {                                          // deed (and why, whyThird)
        sent: 'Day {day}: you sent a hand to {who}, {sit}.',
        stayed: 'Day {day}: you stayed home against {who}, {sit}.'
      },
      even: {                                          // why, whyThird (a habit from you, and no act today)
        own: 'Even so, no hand came today.',
        third: 'Even so, no hand of theirs arrived today.'
      },
      elsewhere: {                                     // elsewhere
        both: '{Kin} and {other}: hands went both ways.',
        kinSent: '{Kin} sent a hand to {other}. None came back.',
        theySent: '{Other} sent a hand to {kin}. None went back.',
        none: '{Kin} and {other}: no hand went either way.'
      },

      // ---- Your ways, the season's end -----------------------------------------------------------
      wayCount: 'sent a hand {h} of {n}',              // wayCount
      waysNote: 'A house that takes up your ways does as these counts say.',       // waysNote
      reconsidered: {                                  // seasonEnd
        far: '{who} took up the way of a house beyond your neighbours.',
        farSecond: '{who} took up the way of a house beyond your neighbours, which that house had from you.',
        kin: "{who} took up your sister's way.",
        kinSecond: "{who} took up your sister's way, which she had from you.",
        house: '{who} took up the {name} way.',
        houseSecond: '{who} took up the {name} way, which the {name} house had from you.',
        changed: '{who} changed one of its ways on its own.',
        kept: '{who} looked to {model} and kept its own way.'
      },
      seasonHeads: ['The end of the first season', 'The end of the second season', 'The end of the harvest'],   // seasonEnd
      seasonIntro: "At each season's end, houses look at who is doing well and may take up their ways.",   // seasonEnd
      seasonNone: 'No house you can see changed its way.',                        // seasonEnd

      // ---- Leaving -------------------------------------------------------------------------------
      leaving: {
        head: 'The harvest is in',                     // leavingHead
        kept: 'Your house is kept.',                   // leavingStore
        short: 'Your house is {short} {goods} short.', // leavingStore
        sub: 'Your heir takes the holding and does in each situation as you did.',   // leaveSub
        button: 'Leave the valley'                     // leaveButton
      },
      leaveNote: {                                     // leaveNote
        never: 'Never tested. Your heir keeps the old way here and {does}.',
        tested: 'sent a hand {h} of {n}'
      },

      // ---- the Afterwards ------------------------------------------------------------------------
      oneFuture: 'This is one future of {futures}. Each has its own luck at the ford and its own chances taken.',   // oneFuture
      houseAtEnd: '{who}: {income} {goods} in the last season, {hands} of 16 hands got through',   // houseAtEnd (its tags and full stop follow)
      arrival: {                                       // futureLines
        kin: "newcomers, {house}, take over your sister's holding. Her line ends there.",
        house: 'newcomers, {house}, take over the {replaced} holding.'
      },
      adopt: {                                         // futureLines
        backFromYours: '{who} gives up your ways and goes back to its own.',
        back: '{who} goes back to its own way.'
      },
      waysEnd: {                                       // waysEnd, became
        never: 'No house ever kept your ways.',
        one: 'At the end, {n} house keeps your ways.',
        many: 'At the end, {n} houses keep your ways.',
        gone: 'No house keeps your ways after season {season}.'
      },

      // ---- the Chronicle -------------------------------------------------------------------------
      heads: { house: 'House', place: 'Valley' },      // heads
      rowsCaption: 'The first {first} of {futures} futures, one mark for each. Marks in the same place in the two rows had the same luck at the ford.',   // rowsCaption
      rowsExplain: 'The same valley played forward {futures} times, with different luck at the ford and different chances taken.',   // rowsExplain (first line)
      rangeNote: "Each of the {of} starts from the valley as your twelve days left it. The old way's marker is for a house that also lived those twelve days the old way.",   // rangeNote
      lastAct: {                                       // lastDayLine (under REPLAY 'habit': each reversed tie's act)
        sent: 'sent a hand to {houses}',
        stayed: 'stayed home against {houses}',
        hadSent: 'sent a hand to {houses}',            // the same acts after "Had you"
        hadStayed: 'stayed home against {houses}'
      },
      mattered: {                                      // mattered
        none: 'No single way of yours stands out from the luck of the ford.',
        count: '{title}: you sent a hand {h} of {n} {times}.'
      },
      againSame: 'Live this valley again'              // againSame
    },

    // What the place counts as better off, in words: the strip of the Afterwards and the
    // Chronicle. (Which side of the line is the good one, and where the line is, are the engine's:
    // life.params.CHARTER and HOLD_LINE.)
    charter: {
      legendMarks: { held: 'held', fell: 'fell' },     // legendMarks
      flow: {                                          // flowLabels
        head: 'Hands arriving across the valley, season by season',
        half: '{line}',
        rule: 'The valley holds if, over the last ten seasons, at least {line} the hands that could arrive still do.'
      },
      flowAlt: 'Hands arriving, season by season. Season 1: {first} in 100. Lowest: {low} in 100, in season {lowSeason}. Last ten seasons: {late} in 100 on average. The line for holding is {line}.',   // flowAlt
      futureEnd: {                                     // futureEnd
        held: 'In this future the valley held.',
        heldBarely: 'In this future the valley held, barely.',
        fell: 'In this future the valley fell.',
        fellBarely: 'In this future the valley fell, barely.'
      },
      placeLine: 'With you, the valley held in {holds} of {futures} futures. Had your house kept the old way: {base} of {futures}.',   // valleyLine
      markMeans: 'The mark is the gap between the two counts: {gap} {more} {futures} held with you, {size} in every hundred.',   // markMeans
      rowAlt: '{label}: {held} of the first {n} held.',                                // rowAlt
      rowRule: 'A future counts as held if, in its last ten seasons, at least {line} the hands that could arrive still do.',   // rowsExplain (second line)
      rangeLine: 'Of {of} plain ways a house might have left here, the best holds in {best}% of the first {futures} futures and the worst in {worst}%.',   // rangeLine
      rangeYours: 'Counted on those same futures, yours holds in {pct}%.',            // rangeNote
      rangeAxis: 'Share of futures in which the valley held. Each block of the bar is ten points.',   // rangeLabels
      lastDay: {                                       // lastDayLine
        one: 'On the last day you stayed home against {houses}, after hands had gone both ways. With a hand sent to them, the valley held in {holds} of the first {futures} futures, against {base} of those as you left it. Your store would have been {store}.',
        many: 'On the last day you stayed home against {houses}, after hands had gone both ways with each. With a hand sent to each of them, the valley held in {holds} of the first {futures} futures, against {base} of those as you left it. Your store would have been {store}.'
      },
      // the same line where the replay turns every day-12 act that went against the house's habit
      // (REPLAY 'habit' or 'season'; never in the valley itself): {lived} and {replayed} are made of lastAct
      lastDayHabit: 'On the last day you {lived}. Had you {replayed}, the valley held in {holds} of the first {futures} futures, against {base} of those as you left it. Your store would have been {store}.',
      seal: 'House kept, valley better off.',          // seal
      mattered: {                                      // mattered
        more: 'Had you sent a hand there once more: held in {holds} of the first {futures} futures.',
        lessShort: 'Had you stayed home there once more: {holds}.',
        lessLong: 'Had you stayed home there once more: held in {holds} of the first {futures} futures.'
      }
    },

    // How the sheet is decorated (sheet.js draws it; points are fractions of the sheet).
    sheet: {
      // the barrier your four ties cross: the river, in the bend of which your holding lies
      barrier: { draw: 'stream', smooth: 10,
                 points: [[-0.03, 0.87], [0.10, 0.845], [0.255, 0.80], [0.36, 0.695], [0.50, 0.655], [0.64, 0.695], [0.745, 0.80], [0.90, 0.83], [1.03, 0.80]] },
      // the line the three far holdings lie beyond: the ridge, hachured on its near side
      farLine: { draw: 'scarp', smooth: 8,
                 points: [[-0.02, 0.315], [0.12, 0.30], [0.27, 0.31], [0.40, 0.295], [0.50, 0.285], [0.62, 0.30], [0.76, 0.29], [0.90, 0.305], [1.02, 0.295]] },
      crossing: 'ring',                                // where each of your ties meets the barrier: the ford
      body: 'field',                                   // inside a holding's box: furrows and the house
      // lettered notes, in this order; label: a key of AYWords.mapLabels()
      notes: [
        { label: 'beyond', at: 'house', house: 4, dy: -6, unseenOnly: true },   // over the middle far holding, where the far three are drawn unseen
        { label: 'ridge', at: 'farLine', x: 0.5, dy: -5 },                      // above the far line, at its middle
        { label: 'ford', at: 'sheet', x: 0.5, y: 0.745, water: true }           // on the water
      ],
      glyph: {
        barrier: '<path class="key-river" d="M29 1q-2.6 5.5 0 11t0 11"/>',                     // the day's result in miniature (58 x 24)
        keyBarrier: '<path class="key-river" d="M25.5 0.5q-2.2 3.2 0 6.5t0 6.5"/>',            // the key's lost act (30 x 14)
        seal: '<rect class="seal-parcel" x="22" y="27" width="32" height="22"/><rect class="seal-house" x="25" y="30" width="8" height="8"/>'   // the seal's device (76 x 76)
      }
    },

    // One short paragraph for the Chronicle, in plain words: the same give and take in the world.
    afterword: "Farming neighbours have long brought in each other's harvests and raised each other's barns in a single day, with no written count of who owes what. The help goes round because each house remembers who came last time, and a house that never comes soon finds that nobody comes to it.",

    // The rules these words were written for. page-smoke.js checks them against the Life's own
    // (life.params): if a preset moves one, the words above must be read again. CUSTOM, CHARTER and
    // FLOW_KIND as the engine has them; STOCK, S and H: whether the place has a stock, a gain when
    // both arrive, a loss when neither does (the numbers themselves are always the Life's).
    writtenFor: { CUSTOM: [1, 1, 0, 1, 0], CHARTER: 'holds', FLOW_KIND: 'hands', STOCK: false, S: false, H: false }
  });
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
