/*
 * After You: the Saltmarket, as a place. Eight salt stalls round a square, under a guild that sets a
 * price; you sell the same salt as each of your four neighbours. The kind act ("a hand") is holding the
 * guild price; the other is cutting it. Holding together pays the sellers, and the town pays for it: both
 * prices holding adds a share to each stall (params S), which the town pays (every number is the Life's:
 * params B, C, S, H, filled in from AYWords.stakes). The charter is inverted (params.CHARTER 'breaks'):
 * the town is better off in the futures where the ring of held prices breaks, so every count of the
 * Chronicle and the Afterwards is a count of futures in which the ring broke, the strip's good side is
 * under its line, and the town's extra cost beside you is said with each day's total (lexicon.town, read
 * by AYWords.dayTown). The luck: your boy sold below the price; you know it, the other stall sees only a
 * cut price. Pure data, as places/valley.js: lexicon, charter, sheet, afterword, writtenFor. The engine's
 * rules are AfterYou.PLACES.saltmarket.
 *
 * Every key the valley's words have is here, in the Saltmarket's words (page-smoke.js checks the key
 * sets), and the town's words besides. No template holds a digit except the valley's own "16" in
 * houseAtEnd. The custom is the guild's rule (params.CUSTOM [1, 1, 0, 1, 0]): hold the price beside a new
 * stall, then do as each stall did yesterday. What a stall is seen to do is a price that held or one that
 * was cut: a stall's own counts (Your ways, Leaving, the heir) are what you chose ("held the price"), and
 * everything seen of a stall is its price ("their price held", "price held 3 of 4"), so that it is never
 * said whether a cut was the stall's or its boy's. You cut your own price by choice ("You cut the price");
 * your boy's sale below it is told as such, with what the other stall saw. The seal is the place's own,
 * with the place's own bar (params.SEAL_MARK); the page never prints the bar.
 *
 * Sections, in order: the actors and acts; the five situations; the Opening; the sheet's words; the
 * day; the town; Why?; Your ways and the season's end; Leaving; the Afterwards; the Chronicle; the
 * charter; the sheet's decoration; the afterword; the rules the words were written for.
 */
(function (root) {
  'use strict';

  root.AYPlaces.add({
    id: 'saltmarket',

    lexicon: {
      name: 'The saltmarket',                          // placeName (said for a listener in the choice of places)
      label: 'Saltmarket',                             // placeLabel (one short word: the five places stand in one row)

      // ---- the actors and acts ---------------------------------------------------------------
      house: 'the {name} stall',
      House: 'The {name} stall',
      way: 'the {name} way',
      kin: "your sister's stall",
      Kin: "Your sister's stall",
      heir: 'your heir',
      Heir: 'Your heir',
      toward: 'beside',                         // stalls sell beside one another (choiceLegend, the sister's Why? title)
      actor: {
        one: 'stall',
        many: 'stalls',
        yours: 'your stall',
        far: 'a stall across the square'
      },
      newcomers: 'newcomers',
      goods: { one: 'coin', many: 'coins' },
      act: {
        send: 'Hold the price',                        // the button
        stay: 'Cut the price',                         // the button
        sends: 'holds the price',                      // the sister's changes, the heir's note
        stays: 'cuts the price'
      },
      custom: {
        Name: "The guild's rule",
        gloss: "The guild's rule, to hold the price beside a new stall and then do as each stall did yesterday, would bring in {purse} {goods} in twelve days."
      },

      // ---- the five situations ---------------------------------------------------------------------
      // (a price that was cut is what is seen; whether the stall or its boy cut it is never said)
      titles: ['Beside a new stall', 'After both prices held', 'After their price was cut', 'After your price was cut', 'After both prices were cut'],
      knowRows: ['beside a new stall', 'after both prices held', "after the other's price was cut", 'after their own price was cut', 'after both prices were cut'],
      whereThey: ['Beside you for the first time', 'After both prices held', 'After your price was cut',
                  'After their price was cut', 'After both prices were cut'],
      deedSit: ['when it was new to you', 'after both prices held', 'after their price was cut',
                'after your price was cut', 'after both prices were cut'],
      whereThird: ['Beside {other} for the first time', 'After both prices held', "After {other}'s price was cut",
                   'After their price was cut beside {other}', 'After both prices were cut'],

      // ---- the Opening -------------------------------------------------------------------------
      opening: {
        premise: 'Twelve days at a salt market of eight stalls. Then you leave, and the market goes on without you.',
        lines: [
          'Beside each of your four neighbours you sell the same salt. Each day you can hold the guild price or cut it. So can they.',
          'To hold the price costs you {mineAbs} {mineGoods} of trade; while theirs holds, you gain {theirs}. When both prices hold, each stall gains {both}, and the town pays {S} of it.',
          'What you do, others see. Some will take it up as their own way, at the end of every fourth day.',
          'At the end two things are counted: whether your takings last the winter, and whether the town is better off for your ways.'
        ]
      },
      pastName: 'Saltmarket {seed}',
      placeNo: 'Saltmarket no. {seed}',

      // ---- the sheet's words (a plan of the market) --------------------------------------------------
      map: {
        crossing: 'the lane',
        farLine: 'the arcade',
        beyond: 'across the square',
        seat: 'Your stall',
        heir: 'Your heir',
        kin: 'your sister'
      },
      mapAlt: {
        sheet: 'Plan of the market: your stall at the foot, four neighbours across the lane, three stalls across the square beyond the arcade.',
        day: 'Plan of the market: your stall at the foot, your four neighbours across the lane, and three stalls across the square that you cannot see.',
        after: 'Plan of the market: eight stalls round the square, sixteen pairs of them selling side by side.'
      },
      mapAltDay: {
        head: 'Plan of the market, {when}.',
        plan: 'You mean to hold the price beside {who}.',
        stay: 'You mean to cut the price beside {who}.'
      },
      bearingSay: 'To the {bearing} of your stall.',
      legendDay: {
        arrived: 'a price held',
        lost: 'your price, cut by your boy',
        planned: 'you mean to hold the price',
        stay: 'you cut the price'
      },
      legendAfter: {
        help: "filled by how often the stall's price held",
        income: 'coins gained or lost this season'       // a season's number can be below zero
      },
      legendWays: { sent: 'held the price', stayed: 'cut the price' },
      mapHint: 'Choose on the cards, or on a stall on the plan.',

      // ---- the day -------------------------------------------------------------------------------
      // (each sentence names its outcome, so that the number beside it is the Opening's for that outcome;
      // each begins with what you did, which you know, then says what you saw of theirs)
      storeHead: 'Takings',
      chooseLine: 'Beside each stall, hold the price or cut it.',
      knowValue: 'price held {h} of {n}',
      yesterday: {
        lostTheirs: 'Yesterday your boy sold below the price. They saw only a cut price. Theirs held.',
        lostNone: 'Yesterday your boy sold below the price. They saw only a cut price. Theirs was cut too.',
        both: 'Yesterday both prices held.',
        mine: 'Yesterday you held the price. Theirs was cut.',
        theirs: 'Yesterday you cut the price. Theirs held.',
        neither: 'Yesterday you cut the price. Theirs was cut too.'
      },
      reveal: {
        lostTheirs: 'Your boy sold below the price. They saw only a cut price. Theirs held.',
        lostNone: 'Your boy sold below the price. They saw only a cut price. Theirs was cut too.',
        both: 'Both prices held, and the town paid for it.',
        mine: 'You held the price. Theirs was cut.',
        theirs: 'You cut the price. Theirs held.',
        neither: 'You cut the price. Theirs was cut too.'
      },
      luckNote: 'A stall boy can sell below the price: yours then counts as cut, costing and bringing nothing. They see only a cut price.',

      // ---- the town: what it paid for the ring beside you on the day (AYWords.dayTown, with the day's
      // total; only your four pairs are counted, so each sentence says "beside you") ------------------
      town: {
        some: 'Where both prices held beside you, the town paid {extra} {goods} more today.',
        none: 'The town paid nothing extra beside you today.'
      },

      // ---- Why? ------------------------------------------------------------------------------------
      whyMarked: 'Marked: the first time a stall does as it learned from you.',
      knew: {
        sinceOnceSent: 'Between then and today you had seen them here once, and their price held.',
        sinceOnceNone: 'Between then and today you had seen them here once, and their price was cut.',
        sinceMany: 'Between then and today you had seen their price hold here {h} of {n} times.',
        onceSent: 'Before today you had seen them here once, and their price held.',
        onceNone: 'Before today you had seen them here once, and their price was cut.',
        many: 'Before today you had seen their price hold here {h} of {n} times.'
      },
      hereYou: {
        onceSent: 'When they learned it, this had come up once, and you held the price.',
        onceStayed: 'When they learned it, this had come up once, and you cut the price.',
        many: 'When they learned it, you had held the price here {h} of {n} times.'
      },
      deed: {
        sent: 'Day {day}: you held the price beside {who}, {sit}.',
        stayed: 'Day {day}: you cut the price beside {who}, {sit}.'
      },
      even: {
        own: 'Even so, their price was cut today.',
        third: "Even so, your sister's price was cut today."
      },
      elsewhere: {
        both: '{Kin} and {other}: both prices held.',
        kinSent: '{Kin} held the price beside {other}, whose price was cut.',
        theySent: '{Other} held the price beside {kin}, whose price was cut.',
        none: '{Kin} and {other}: both prices were cut.'
      },

      // ---- Your ways, the season's end -----------------------------------------------------------
      wayCount: 'held {h} of {n}',                  // under the key's "held the price": short, so that a full row of marks stays on one line
      waysNote: 'A stall that takes up your ways does as these counts say.',
      reconsidered: {
        far: '{who} took up the way of a stall across the square.',
        farSecond: '{who} took up the way of a stall across the square, which that stall had from you.',
        kin: "{who} took up your sister's way.",
        kinSecond: "{who} took up your sister's way, which she had from you.",
        house: '{who} took up the {name} way.',
        houseSecond: '{who} took up the {name} way, which the {name} stall had from you.',
        changed: '{who} changed one of its ways on its own.',
        kept: '{who} looked to {model} and kept its own way.'
      },
      seasonHeads: ['The end of the first season', 'The end of the second season', 'The end of the selling'],
      seasonIntro: "At each season's end, stalls look at who is doing well and may take up their ways.",
      seasonNone: 'No stall you can see changed its way.',

      // ---- Leaving -------------------------------------------------------------------------------
      leaving: {
        head: 'The salt is sold',
        kept: 'Your stall is kept.',
        short: 'Your stall is {short} {goods} short.',
        sub: 'Your heir takes the stall and does in each situation as you did.',
        button: 'Leave the market'
      },
      leaveNote: {
        never: "Never tested. Your heir keeps the guild's rule here and {does}.",
        tested: 'held the price {h} of {n}'
      },

      // ---- the Afterwards ------------------------------------------------------------------------
      oneFuture: 'This is one future of {futures}. Each has its own luck at the stalls and its own chances taken.',
      houseAtEnd: '{who}: {income} {goods} in the last season, price held {hands} of 16 times',
      arrival: {
        kin: "newcomers, {house}, take over your sister's stall. Her line ends there.",
        house: 'newcomers, {house}, take over the {replaced} stall.'
      },
      adopt: {
        backFromYours: '{who} gives up your ways and goes back to its own.',
        back: '{who} goes back to its own way.'
      },
      waysEnd: {
        never: 'No stall ever kept your ways.',
        one: 'At the end, {n} stall keeps your ways.',
        many: 'At the end, {n} stalls keep your ways.',
        gone: 'No stall keeps your ways after season {season}.'
      },

      // ---- the Chronicle -------------------------------------------------------------------------
      heads: { house: 'Stall', place: 'Town' },
      rowsCaption: 'The first {first} of {futures} futures, one mark for each. Marks in the same place in the two rows had the same luck at the stalls.',
      rowsExplain: 'The same market played forward {futures} times, with different luck at the stalls and different chances taken.',
      rangeNote: "Each of the {of} starts from the market as your twelve days left it. The guild's marker is for a stall that also lived those twelve days by the guild's rule.",
      lastAct: {
        sent: 'held the price beside {houses}',
        stayed: 'cut the price beside {houses}',
        hadSent: 'held the price beside {houses}',     // after "Had you"
        hadStayed: 'cut the price beside {houses}'
      },
      mattered: {
        none: 'No single way of yours stands out from the luck at the stalls.',
        count: '{title}: you held the price {h} of {n} {times}.'
      },
      againSame: 'Mind this stall again',

      // ---- a seal withheld by the season replay (REPLAY 'season': AYWords.seasonRests, shown under the
      // mark only where the seal would otherwise have been earned). It says the engine's rule: days 9-12
      // played again by the stall's ways as they stood before them (the guild's rule in a situation never
      // met), and the mark no longer clear of the seal's bar. It names that bar ("by enough for a seal"),
      // never the town's gain alone: the replayed mark can stay well clear of the noise the page states and
      // still fall short of the bar (+21.6 against about 3, under a bar the page never prints) ----------
      lastSeason: {
        rests: "No seal this time: had your stall kept to its earlier ways in the last season, and to the guild's rule where it had none, the town would not have been better off by enough for a seal."
      }
    },

    // ---- the charter: the town (CHARTER 'breaks': every count is of futures in which the ring broke;
    // FLOW_KIND 'both': the share of days on which both prices of a pair held, against HOLD_LINE; the
    // town's side of the strip is under the line; the ring breaks when the late share is under the line) --
    charter: {
      legendMarks: { held: 'the ring broke', fell: 'the ring held' },
      flow: {
        head: 'Both prices held across the market, season by season',
        half: '{line}',
        rule: 'The ring breaks if, over the last ten seasons, both prices held on fewer than {line} of the days two stalls sold side by side.'
      },
      flowAlt: 'Days on which both prices held, season by season. Season 1: {first} in 100. The ring was weakest, and the town best off, in season {lowSeason}: {low} in 100. The town\'s best five seasons in a row: {stretch} in 100 on average. Last ten seasons: {late} in 100 on average. The ring breaks below {line}.',
      futureEnd: {
        held: 'In this future the ring broke, and the town was better off.',
        heldBarely: 'In this future the ring broke, barely, and the town was better off.',
        fell: 'In this future the ring held, and the town paid for it.',
        fellBarely: 'In this future the ring held, barely, and the town paid for it.'
      },
      placeLine: "With you, the ring broke in {holds} of {futures} futures. Had your stall kept the guild's rule: {base} of {futures}.",
      markMeans: 'The mark is the gap between the two counts: {gap} {more} {futures} in which the ring broke with you, {size} in every hundred.',
      rowAlt: '{label}: the ring broke in {held} of the first {n}.',
      rowRule: 'The ring counts as broken in a future if, over its last ten seasons, both prices held on fewer than {line} of the days two stalls sold side by side.',
      rangeLine: 'Of {of} plain ways a stall might have left here, the best breaks the ring in {best}% of the first {futures} futures and the worst in {worst}%.',
      rangeYours: 'Counted on those same futures, yours breaks it in {pct}%.',
      rangeAxis: 'Share of futures in which the ring broke. Each block of the bar is ten points.',
      lastDay: {
        one: 'On the last day you cut the price beside {houses}, after both prices had held. Had you held it, the ring would have broken in {holds} of the first {futures} futures, against {base} of those as you left it. Your takings would have been {store}.',
        many: 'On the last day you cut the price beside {houses}, after both prices had held with each. Had you held it beside each of them, the ring would have broken in {holds} of the first {futures} futures, against {base} of those as you left it. Your takings would have been {store}.'
      },
      lastDayHabit: 'On the last day you {lived}. Had you {replayed}, the ring would have broken in {holds} of the first {futures} futures, against {base} of those as you left it. Your takings would have been {store}.',
      seal: 'Stall kept, town clearly better off.',
      mattered: {
        more: 'Had you held the price there once more: the ring would have broken in {holds} of the first {futures} futures.',
        lessShort: 'Had you cut it there once more: {holds}.',
        lessLong: 'Had you cut it there once more: the ring would have broken in {holds} of the first {futures} futures.'
      }
    },

    // ---- the sheet's decoration: a plan of the market. Your stall at the foot inside a bend of the lane,
    // four neighbours across it, three stalls across the square beyond the arcade. A market cross where
    // each of your four ways crosses the lane. The lane's shoulders run low under the names of the east
    // and west stalls, and it rises toward the east edge, clear of the north mark, at both sizes and with
    // a narrow phone's enlarged lettering; "the lane" is lettered under its west arm, where no tie, name or
    // hand runs; "the arcade" over the arcade's middle. ------------------------------------------------
    sheet: {
      barrier: { draw: 'lane', smooth: 10,
                 points: [[-0.03, 0.905], [0.12, 0.88], [0.25, 0.83], [0.355, 0.705], [0.50, 0.67], [0.645, 0.705], [0.75, 0.83], [0.88, 0.815], [1.03, 0.76]] },
      farLine: { draw: 'arcade', smooth: 8,
                 points: [[-0.02, 0.305], [0.12, 0.30], [0.25, 0.30], [0.38, 0.295], [0.50, 0.29], [0.62, 0.295], [0.75, 0.30], [0.88, 0.30], [1.02, 0.305]] },
      crossing: 'cross',
      body: 'stall',
      notes: [
        { label: 'beyond', at: 'house', house: 4, dy: -6, unseenOnly: true },
        { label: 'ridge', at: 'farLine', x: 0.5, dy: -5 },
        { label: 'ford', at: 'sheet', x: 0.16, y: 0.95, water: false }
      ],
      glyph: {
        barrier: '<path class="key-lane" d="M28 1V23M33 1V23"/>',
        keyBarrier: '<path class="key-lane" d="M23.5 0.5V13.5M27.5 0.5V13.5"/>',
        // a hanging balance (its hook and beam, a pan on cords at each end), clear above the seal's check
        seal: '<path class="seal-beam" d="M36 15.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M38 17.5V19M20 19H56M20 19L15.5 26M20 19L24.5 26M56 19L51.5 26M56 19L60.5 26"/>' +
              '<path class="seal-pan" d="M15 26H25A5 3.6 0 0 1 15 26ZM51 26H61A5 3.6 0 0 1 51 26Z"/>'
      }
    },

    // ---- the afterword --------------------------------------------------------------------------
    afterword: 'Sellers who agree not to undercut one another keep that agreement the way good neighbours keep trust: each matches the others day after day, lets a single slip pass and goes back to the price. The same habits that hold a village together hold a price ring together, and the buyers pay for it. That is why most countries forbid such agreements by law.',

    // ---- the rules these words were written for (page-smoke.js checks them against life.params): the
    // guild's rule [1, 1, 0, 1, 0]; the charter inverted (the town better off when the ring breaks); a share
    // when both hold (S), which the town pays, and nothing taken when both cut (no H); the flow counts days
    // on which both held.
    // SIGNS: the sign each outcome's words take for granted (holding "costs", theirs holding "gains", both
    // holding "gains", and the town "pays" S).
    writtenFor: { CUSTOM: [1, 1, 0, 1, 0], CHARTER: 'breaks', FLOW_KIND: 'both', STOCK: false, S: true, H: false,
                  SIGNS: { both: '+', mine: '-', theirs: '+', S: '+' } }
  });
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
