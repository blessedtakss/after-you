/*
 * After You: the Bridges, as a place. Eight carters, each with a yard; between you and each of your
 * four neighbours a road with a bridge one cart wide over the stream. The kind act ("a hand") is giving
 * way; the other is driving on. The stakes are shared (params S and H): when both wait nobody crosses,
 * and when both drive on the wheels lock and each loses (every number is the Life's: params B, C, S, H,
 * filled in from AYWords.stakes). The yard starts with a store of loads (params.STORE_START) that stands
 * in it from day 1, and it can run below zero. The luck: your mule would not stand, and your cart came
 * on; you know it, the other carter sees only a cart coming on. Pure data, as places/valley.js: lexicon,
 * charter, sheet, afterword, writtenFor. The engine's rules are AfterYou.PLACES.bridges.
 *
 * Every key the valley's words have is here, in the Bridges' words (page-smoke.js checks the key sets).
 * No template holds a digit. The custom is the old rule of the road (params.CUSTOM [1, 1, 0, 1, 0]): let
 * a new carter cross first, then do as they did the day before. What a carter is seen to do is give way
 * or come on; that the other came on by choice is never said (a mule may not have stood).
 *
 * The stakes are said outcome by outcome, as the cards show them (Opening line 2): waiting while they
 * cross ({mine}), crossing while they wait ({theirs}), both waiting ({both}, said with its sign even
 * when it is nothing), both driving on ({neither}). The luck is said as the valley says it: "luck at
 * the bridges" in the Afterwards and the Chronicle.
 *
 * Sections, in order: the actors and acts; the five situations; the Opening; the sheet's words; the
 * day; Why?; Your ways and the season's end; Leaving; the Afterwards; the Chronicle; the charter; the
 * sheet's decoration; the afterword; the rules the words were written for.
 */
(function (root) {
  'use strict';

  root.AYPlaces.add({
    id: 'bridges',

    lexicon: {
      name: 'The bridges',                             // placeName (said for a listener in the choice of places)
      label: 'Bridges',                                // placeLabel (one short word: the five places stand in one row)

      // ---- the actors and acts ---------------------------------------------------------------
      // (the actors are the carters; your sister is a carter too, and named as one)
      house: 'the {name} carter',
      House: 'The {name} carter',
      way: 'the {name} way',
      kin: 'your sister',
      Kin: 'Your sister',
      heir: 'your heir',
      Heir: 'Your heir',
      toward: 'toward',
      actor: {
        one: 'carter',
        many: 'carters',
        yours: 'you',
        far: 'a carter beyond your neighbours'
      },
      newcomers: 'newcomers',
      goods: { one: 'load', many: 'loads' },
      act: {
        send: 'Give way',                              // the button
        stay: 'Drive on',                              // the button
        sends: 'gives way',                            // the sister's changes, the heir's note
        stays: 'drives on'
      },
      custom: {
        Name: 'The old rule of the road',
        gloss: 'The old rule of the road, to let a new carter cross first and then do as they did the day before, would leave the yard at {purse} {goods}.'
      },

      // ---- the five situations ---------------------------------------------------------------------
      // (a cart that came on is what is seen; whether its carter meant it is never said)
      titles: ['Meeting a new carter', 'After you both waited', 'After their cart crossed', 'After your cart crossed', 'After the wheels locked'],
      knowRows: ['meeting a new carter', 'after both waited', 'after the other cart crossed', 'after their own cart crossed', 'after the wheels locked'],
      whereThey: ['Meeting you for the first time', 'After both waited', 'After your cart crossed',
                  'After their cart crossed', 'After the wheels locked'],
      deedSit: ['on first meeting', 'after both waited', 'after their cart crossed',
                'after your cart crossed', 'after the wheels locked'],
      whereThird: ['Meeting {other} for the first time', 'After both waited', "After {other}'s cart crossed",
                   'After their cart crossed, with {other} waiting', 'After the wheels locked'],

      // ---- the Opening -------------------------------------------------------------------------
      // (each line wraps to no more lines than the stage-4 line it replaces, at any column from 12 to 40
      // ems: the Opening is exactly a laptop's height with earlier lives listed)
      opening: {
        premise: 'Twelve days of carting on a road of eight carters. Then you leave, and the road goes on without you.',
        lines: [
          'Between you and each of your four neighbours is a bridge one cart wide. Each day you can give way or drive on. So can they.',
          'Waiting while they cross costs you {mineAbs} {mineGoods}; crossing while they wait gains {theirs}. If both wait, nobody crosses: {bothSigned}. If both drive on, the wheels lock and each loses {neitherAbs}.',
          'What you do, others see. Some will take it up as their own way, at the end of every fourth day.',
          'Your yard starts with {storeStart} {storeStartGoods}. At the end two things are counted: whether it lasts the winter, and how well the road moves.'
        ]
      },
      pastName: 'Bridges {seed}',
      placeNo: 'Bridges no. {seed}',

      // ---- the sheet's words (a map of the roads) ----------------------------------------------------
      map: {
        crossing: 'the stream',                        // lettered under the stream's west reach (sheet.notes); the bridges are drawn, not lettered
        farLine: 'the downs',
        beyond: 'beyond the downs',
        seat: 'Your yard',
        heir: 'Your heir',
        kin: 'your sister'
      },
      mapAlt: {
        sheet: 'Map of the roads: your yard at the foot, four neighbours across the stream and its bridges, three yards beyond the downs.',
        day: 'Map of the roads: your yard at the foot, your four neighbours across the stream and its bridges, and three yards beyond the downs that you cannot see.',
        after: 'Map of the roads: eight yards on a ring, joined by sixteen roads.'
      },
      mapAltDay: {
        head: 'Map of the roads, {when}.',
        plan: 'Giving way to {who}.',
        stay: 'Driving on toward {who}.'
      },
      bearingSay: 'To the {bearing} of your yard.',
      legendDay: {
        arrived: 'a carter giving way',
        lost: 'your mule would not stand',
        planned: 'you mean to give way',
        stay: 'you drive on'
      },
      legendAfter: {
        help: 'filled by how often the carter gives way',
        income: 'loads gained or lost this season'      // a season's number can be below zero
      },
      legendWays: { sent: 'gave way', stayed: 'drove on' },
      mapHint: 'Choose on the cards, or on a yard on the map.',

      // ---- the day -------------------------------------------------------------------------------
      // (each sentence names its outcome, so that the number beside it is the Opening's for that outcome)
      storeHead: 'Yard',
      chooseLine: 'At each bridge, give way or drive on.',
      knowValue: 'gave way {h} of {n}',
      yesterday: {
        lostTheirs: 'Yesterday your mule would not stand. They saw only a cart coming on. They gave way.',
        lostNone: 'Yesterday your mule would not stand. They saw only a cart coming on. Theirs came on too.',
        both: 'Yesterday you both gave way.',
        mine: 'Yesterday you gave way. Their cart came on.',
        theirs: 'Yesterday they gave way. You crossed.',
        neither: 'Yesterday you drove on. Their cart came on too.'
      },
      reveal: {
        lostTheirs: 'Your mule would not stand. They saw only a cart coming on. They gave way, and you crossed.',
        lostNone: 'Your mule would not stand. They saw only a cart coming on. Theirs came on too: the wheels locked.',
        both: 'You both gave way. Nobody crossed.',
        mine: 'You gave way. Their cart came on and crossed.',
        theirs: 'They gave way. You crossed.',
        neither: 'You drove on. Theirs came on too: the wheels locked.'
      },
      luckNote: 'A mule can refuse to stand: your cart then comes on as if you drove on. The other carter sees only a cart coming on.',

      // ---- Why? ------------------------------------------------------------------------------------
      whyMarked: 'Marked: the first time a carter does as they learned from you.',
      knew: {
        sinceOnceSent: 'Between then and today you had seen them here once, and they gave way.',
        sinceOnceNone: 'Between then and today you had seen them here once, and their cart came on.',
        sinceMany: 'Between then and today you knew them to give way here {h} of {n} times.',
        onceSent: 'Before today you had seen them here once, and they gave way.',
        onceNone: 'Before today you had seen them here once, and their cart came on.',
        many: 'Before today you knew them to give way here {h} of {n} times.'
      },
      hereYou: {
        onceSent: 'When they learned it, this had come up once, and you gave way.',
        onceStayed: 'When they learned it, this had come up once, and you drove on.',
        many: 'When they learned it, you had given way here {h} of {n} times.'
      },
      deed: {
        sent: 'Day {day}: you gave way to {who}, {sit}.',
        stayed: 'Day {day}: you drove on toward {who}, {sit}.'
      },
      even: {
        own: 'Even so, their cart came on today.',
        third: "Even so, your sister's cart came on today."
      },
      elsewhere: {
        both: '{Kin} and {other}: both gave way.',
        kinSent: '{Kin} gave way to {other}, whose cart came on.',
        theySent: '{Other} gave way to {kin}, whose cart came on.',
        none: '{Kin} and {other}: both carts came on.'
      },

      // ---- Your ways, the season's end -----------------------------------------------------------
      wayCount: 'gave way {h} of {n}',
      waysNote: 'A carter who takes up your ways does as these counts say.',
      reconsidered: {
        far: '{who} took up the way of a carter beyond your neighbours.',
        farSecond: '{who} took up the way of a carter beyond your neighbours, which that carter had from you.',
        kin: "{who} took up your sister's way.",
        kinSecond: "{who} took up your sister's way, which she had from you.",
        house: '{who} took up the {name} way.',
        houseSecond: '{who} took up the {name} way, which the {name} carter had from you.',
        changed: '{who} changed one of their ways on their own.',
        kept: '{who} looked to {model} and kept to their own way.'
      },
      seasonHeads: ['The end of the first season', 'The end of the second season', 'The end of the carting'],
      seasonIntro: "At each season's end, carters look at who is doing well and may take up their ways.",
      seasonNone: 'No carter you can see changed their way.',

      // ---- Leaving -------------------------------------------------------------------------------
      leaving: {
        head: 'The carting is done',
        kept: 'Your yard is kept.',
        short: 'Your yard is {short} {goods} short.',
        sub: 'Your heir takes the yard and does in each situation as you did.',
        button: 'Leave the road'
      },
      leaveNote: {
        never: 'Never tested. Your heir keeps the old rule of the road here and {does}.',
        tested: 'gave way {h} of {n}'
      },

      // ---- the Afterwards ------------------------------------------------------------------------
      oneFuture: 'This is one future of {futures}. Each has its own luck at the bridges and its own chances taken.',
      houseAtEnd: '{who}: {income} {goods} in the last season, gave way {hands} of 16 times',
      arrival: {
        kin: "newcomers, {house}, take over your sister's yard. Her line ends there.",
        house: 'newcomers, {house}, take over the {replaced} yard.'
      },
      adopt: {
        backFromYours: '{who} gives up your ways and goes back to their own.',
        back: '{who} goes back to their own way.'
      },
      waysEnd: {
        never: 'No carter ever kept your ways.',
        one: 'At the end, {n} carter keeps your ways.',
        many: 'At the end, {n} carters keep your ways.',
        gone: 'No carter keeps your ways after season {season}.'
      },

      // ---- the Chronicle -------------------------------------------------------------------------
      heads: { house: 'Yard', place: 'Road' },
      rowsCaption: 'The first {first} of {futures} futures, one mark for each. Marks in the same place in the two rows had the same luck at the bridges.',
      rowsExplain: 'The same road played forward {futures} times, with different luck at the bridges and different chances taken.',
      rangeNote: "Each of the {of} starts from the road as your twelve days left it. The old rule's marker is for a carter who also lived those twelve days by the old rule of the road.",
      lastAct: {
        sent: 'gave way to {houses}',
        stayed: 'drove on toward {houses}',
        hadSent: 'given way to {houses}',              // after "Had you"
        hadStayed: 'driven on toward {houses}'
      },
      mattered: {
        none: 'No single way of yours stands out from the luck at the bridges.',
        count: '{title}: you gave way {h} of {n} {times}.'
      },
      againSame: 'Drive this road again'
    },

    // ---- the charter: the road moving (CHARTER 'holds'; FLOW_KIND 'one': the share of days at a bridge
    // on which exactly one cart crossed while the other waited, against HOLD_LINE) -------------------
    charter: {
      legendMarks: { held: 'moved', fell: 'jammed' },
      flow: {
        head: 'Days one cart crossed while the other waited, season by season',
        half: '{line}',
        rule: 'The road moves if, over the last ten seasons, one cart crossed while the other waited on at least {line} of the days at the bridges.'
      },
      flowAlt: 'Days on which one cart crossed while the other waited, season by season. Season 1: {first} in 100. Lowest: {low} in 100, in season {lowSeason}. Last ten seasons: {late} in 100 on average. The line for a moving road is {line}.',
      futureEnd: {
        held: 'In this future the road kept moving.',
        heldBarely: 'In this future the road kept moving, barely.',
        fell: 'In this future the road jammed.',
        fellBarely: 'In this future the road jammed, barely.'
      },
      placeLine: 'With you, the road kept moving in {holds} of {futures} futures. Had you kept the old rule of the road: {base} of {futures}.',
      markMeans: 'The mark is the gap between the two counts: {gap} {more} {futures} with the road moving, {size} in every hundred.',
      rowAlt: '{label}: the road moved in {held} of the first {n}.',
      rowRule: 'A future counts as moving if, in its last ten seasons, one cart crossed while the other waited on at least {line} of the days at the bridges.',
      rangeLine: 'Of {of} plain ways a carter might have left here, the best keeps the road moving in {best}% of the first {futures} futures and the worst in {worst}%.',
      rangeYours: 'Counted on those same futures, yours keeps it moving in {pct}%.',
      rangeAxis: 'Share of futures in which the road kept moving. Each block of the bar is ten points.',
      // (the valley's last-day replay; this place replays by habit, REPLAY 'habit', and says lastDayHabit)
      lastDay: {
        one: 'On the last day you drove on toward {houses}, after you had both waited. Had you given way, the road kept moving in {holds} of the first {futures} futures, against {base} of those as you left it. Your yard would have been {store}.',
        many: 'On the last day you drove on toward {houses}, after you had both waited with each. Had you given way to each of them, the road kept moving in {holds} of the first {futures} futures, against {base} of those as you left it. Your yard would have been {store}.'
      },
      lastDayHabit: 'On the last day you {lived}. Had you {replayed}, the road kept moving in {holds} of the first {futures} futures, against {base} of those as you left it. Your yard would have been {store}.',
      seal: 'Yard kept, road better off.',
      mattered: {
        more: 'Had you given way there once more: the road moved in {holds} of the first {futures} futures.',
        lessShort: 'Had you driven on there once more: {holds}.',
        lessLong: 'Had you driven on there once more: the road moved in {holds} of the first {futures} futures.'
      }
    },

    // ---- the sheet's decoration: a map of the roads. Your yard at the foot inside a bend of the stream,
    // four neighbours across it, three yards beyond the downs. A bridge, laid along the road, where each of
    // your four roads crosses the stream. -------------------------------------------------------------
    sheet: {
      // (its east reach runs high enough to pass over the north mark, and low enough to pass under the east
      // neighbour's name, on the compact sheet enlarged for a 320px phone too)
      barrier: { draw: 'stream', smooth: 10,
                 points: [[-0.03, 0.84], [0.12, 0.855], [0.26, 0.805], [0.365, 0.70], [0.50, 0.66], [0.635, 0.695], [0.75, 0.805], [0.88, 0.815], [1.03, 0.80]] },
      farLine: { draw: 'downs', smooth: 8,
                 points: [[-0.02, 0.31], [0.11, 0.295], [0.25, 0.305], [0.38, 0.29], [0.50, 0.30], [0.63, 0.29], [0.76, 0.305], [0.89, 0.295], [1.02, 0.31]] },
      crossing: 'bridge',
      body: 'cart',
      notes: [
        { label: 'beyond', at: 'house', house: 4, dy: -6, unseenOnly: true },
        { label: 'ridge', at: 'farLine', x: 0.5, dy: -9 },          // above the crests of the downs
        // the stream, named under its west reach, left of your yard's name, where no road, hand or name runs
        // at any size the page draws (the compact sheet enlarged for a 320px phone included). A note between
        // the two middle bridges, where the valley names its ford, would cross the roads to the north-east
        // and north-west on the compact sheet.
        { label: 'ford', at: 'sheet', x: 0.235, y: 0.92, water: true }
      ],
      glyph: {
        // the day's result in miniature (58 x 24): the stream, and a bridge's two parapets across it, the
        // carts' lanes between them
        barrier: '<path class="key-river" d="M29 1q-2.6 5.5 0 11t0 11"/><path class="key-bridge" d="M24.5 2.6H33.5M24.5 21.4H33.5"/>',
        keyBarrier: '<path class="key-river" d="M25.5 0.5q-2.2 3.2 0 6.5t0 6.5"/>',
        // the seal's device (76 x 76): a humped stone bridge, its arch over the water, its parapet along the top
        seal: '<path class="seal-parcel" d="M18 46Q38 33 58 46V56H52Q38 33 24 56H18Z"/><path class="seal-deck" d="M16.5 43.6Q38 30.4 59.5 43.6"/>' +
              '<path class="seal-water" d="M26 60q2 -1.4 4 0t4 0t4 0t4 0t4 0t4 0"/>'
      }
    },

    // ---- the afterword --------------------------------------------------------------------------
    afterword: 'At a one-lane bridge, a crossroads with no lights or a merge where two lanes become one, people get through by taking turns, and it works only while everyone knows whose turn it is. When two arrive together, waving each other on for ever stops everyone as surely as both pushing ahead; what moves the road is one going now and the other going next.',

    // ---- the rules these words were written for (page-smoke.js checks them against life.params): the old
    // rule of the road [1, 1, 0, 1, 0]; a share when both give way (nobody crosses) and a loss when both
    // drive on (S, H); a yard that starts with a store (STORE_START); the flow counts days on which
    // exactly one cart crossed.
    // SIGNS: the sign each outcome's words take for granted (waiting "costs", crossing "gains", locked wheels
    // "lose"; both waiting is said with its sign, whatever it is).
    writtenFor: { CUSTOM: [1, 1, 0, 1, 0], CHARTER: 'holds', FLOW_KIND: 'one', STOCK: false, S: true, H: true, STORE_START: true,
                  SIGNS: { mine: '-', theirs: '+', neither: '-' } }
  });
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
