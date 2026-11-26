/*
 * After You: the Banks, as a place. Fishing boats moored round a cove; between each pair of
 * neighbours lies a fishing bank. The kind act ("a hand") is keeping to your own water; the other is
 * fishing across theirs. The bank's level is what a day's water yields while the other boat keeps
 * off; keeping off fills it, both fishing across empties it (the numbers are always the Life's:
 * params.STOCK, B, C). The luck: the tide can carry your nets into their water; you know it, they
 * see only nets in their water. Pure data, as places/valley.js: lexicon, charter, sheet, afterword,
 * writtenFor. Loads after places/valley.js; the engine's rules are AfterYou.PLACES.banks.
 *
 * Every key the valley's words have is here, in the Banks' own words (page-smoke.js checks the key
 * sets). A place with a stock also gives the stock's words (lexicon.stock: the gauge on each card,
 * the day's result on it, the banks at the end), read by AYWords.bankNow, bankDay, banksAtEnd,
 * legendGauge and the bank clauses of mapAltDay. No template holds a digit.
 */
(function (root) {
  'use strict';

  root.AYPlaces.add({
    id: 'banks',

    lexicon: {
      name: 'The banks',                               // placeName
      label: 'Banks',                                  // placeLabel (one short word: the five places stand in one row)

      // ---- the actors ----------------------------------------------------------------------
      house: 'the {name} boat',
      House: 'The {name} boat',
      way: 'the {name} way',
      kin: "your sister's boat",
      Kin: "Your sister's boat",
      heir: 'your heir',
      Heir: 'Your heir',
      toward: 'toward',
      actor: {
        one: 'boat',
        many: 'boats',
        yours: 'your boat',
        far: 'a boat beyond your neighbours'
      },
      newcomers: 'newcomers',
      goods: { one: 'basket', many: 'baskets' },
      act: {
        send: 'Keep to your water',                    // the button
        stay: 'Fish across',                           // the button
        sends: 'keeps out of their water',             // the sister's changes, the heir's note (no pronoun of its own)
        stays: 'fishes across'
      },
      custom: {
        Name: 'The old rule of the cove',
        gloss: 'The old rule of the cove, to keep off with a new boat and then do as they did yesterday, would bring in {purse} {goods} by winter.'
      },

      // ---- the five situations ---------------------------------------------------------------------
      // (short enough for one line in Your ways on a laptop; a crossing of nets is told as seen, never as luck or choice)
      titles: ['Meeting a new boat', 'After you both kept off', 'After their nets crossed', 'After your nets crossed', 'After both nets crossed'],
      knowRows: ['meeting a new boat', 'after both kept off', "after the other's nets crossed", 'after their own nets crossed', 'after both nets crossed'],
      whereThey: ['Meeting you for the first time', 'After both kept off', 'After your nets crossed into their water',
                  'After their nets crossed into yours', 'After both nets crossed'],
      deedSit: ['on first meeting', 'after both kept off', 'after their nets crossed into yours',
                'after your nets crossed into theirs', 'after both nets crossed'],
      whereThird: ['Meeting {other} for the first time', 'After both kept off', 'After the nets of {other} crossed into theirs',
                   'After their nets crossed into the water of {other}', 'After both nets crossed'],

      // ---- the Opening -------------------------------------------------------------------------
      opening: {
        premise: 'Twelve days of fishing in a cove of eight boats. Then you leave, and the cove goes on without you.',
        lines: [
          'You share a fishing bank with each of your four neighbours. Each day you can keep to your water or fish across. So can they.',
          'Keeping to your water costs you {cost} {costGoods}. While they keep to theirs, yours yields what the bank holds, {worth} at first. It fills by {fillOne} if either keeps off and falls by {fall} if both fish across, but stays between {min} and {max}.',
          'What you do, others see. Some will take it up as their own way, at the end of every fourth day.',
          'At the end two things are counted: whether your catch is enough for winter, and whether you left the grounds better or worse off.'
        ]
      },
      pastName: 'Banks {seed}',
      placeNo: 'Banks no. {seed}',

      // ---- the sheet's words (a chart of the cove) ---------------------------------------------------
      map: {
        crossing: 'the banks',
        farLine: 'the headland',
        beyond: 'beyond the headland',
        seat: 'Your mooring',
        heir: 'Your heir',
        kin: 'your sister'
      },
      mapAlt: {
        sheet: 'Chart of the cove: your mooring at the foot, four neighbours across the tide race, the bank you share with each drawn as a dial, three boats beyond the headland.',
        day: 'Chart of the cove: your mooring at the foot, your four neighbours across the tide race with the bank you share with each, and three boats beyond the headland that you cannot see.',
        after: 'Chart of the cove: eight moorings on a ring, and the sixteen banks between them, each drawn as a dial filled as far as it holds.'
      },
      mapAltDay: {
        head: 'Chart of the cove, {when}.',
        plan: 'Keeping to your water beside {who}.',
        stay: 'Fishing across into the water of {who}.'
      },
      bearingSay: 'To the {bearing} of your mooring.',
      legendDay: {
        arrived: 'kept to its water',
        lost: 'nets carried by the tide',
        planned: 'you mean to keep off',
        stay: 'you fish across'
      },
      legendAfter: {
        help: 'filled by how often the boat keeps to its water',
        income: 'baskets gained or lost this season'      // a season's number can be below zero
      },
      legendWays: { sent: 'kept off', stayed: 'fished across' },
      mapHint: 'Choose on the cards, or on a mooring on the chart.',

      // ---- the day -------------------------------------------------------------------------------
      storeHead: 'Winter catch',
      chooseLine: 'For each boat, keep to your water or fish across.',
      knowValue: 'kept off {h} of {n}',
      yesterday: {
        lostTheirs: 'Yesterday the tide carried your nets into their water. They saw only nets there. They kept to theirs.',
        lostNone: 'Yesterday the tide carried your nets into their water. They saw only nets there. Their nets were in yours.',
        both: 'Yesterday both boats kept to their water.',
        mine: 'Yesterday you kept off. Their nets came across.',
        theirs: 'Yesterday they kept off. You fished across.',
        neither: 'Yesterday nets crossed both ways.'
      },
      reveal: {
        lostTheirs: 'The tide carried your nets into their water. They saw only nets there. They kept to theirs.',
        lostNone: 'The tide carried your nets into their water. They saw only nets there. Their nets were in yours.',
        both: 'Both boats kept to their water.',
        mine: 'You kept to your water. Their nets were in yours.',
        theirs: 'They kept to their water. You fished across.',
        neither: 'You fished across. Their nets were in yours.'
      },
      luckNote: 'The tide can carry your nets into their water: keeping off then costs, brings and fills nothing. They see only the nets.',

      // ---- Why? ------------------------------------------------------------------------------------
      whyMarked: 'Marked: the first time a boat does as it learned from you.',
      knew: {
        sinceOnceSent: 'Between then and today you had seen them here once, and they kept to their water.',
        sinceOnceNone: 'Between then and today you had seen them here once, and their nets went across.',
        sinceMany: 'Between then and today you knew them to keep to their water here {h} of {n} times.',
        onceSent: 'Before today you had seen them here once, and they kept to their water.',
        onceNone: 'Before today you had seen them here once, and their nets went across.',
        many: 'Before today you knew them to keep to their water here {h} of {n} times.'
      },
      hereYou: {
        onceSent: 'When they learned it, this had come up once, and you kept to your water.',
        onceStayed: 'When they learned it, this had come up once, and you fished across.',
        many: 'When they learned it, you had kept to your water here {h} of {n} times.'
      },
      deed: {
        sent: 'Day {day}: you kept to your water beside {who}, {sit}.',
        stayed: 'Day {day}: you fished across into the water of {who}, {sit}.'
      },
      even: {
        own: 'Even so, their nets were in your water today.',
        third: "Even so, your sister's nets went across today."
      },
      elsewhere: {
        both: '{Kin} and {other}: both kept to their water.',
        kinSent: '{Kin} kept to its water beside {other}, whose nets went across.',
        theySent: '{Other} kept to its water beside {kin}, whose nets went across.',
        none: '{Kin} and {other}: nets went across both ways.'
      },

      // ---- Your ways, the season's end -----------------------------------------------------------
      wayCount: 'kept off {h} of {n}',
      waysNote: 'A boat that takes up your ways does as these counts say.',
      reconsidered: {
        far: '{who} took up the way of a boat beyond your neighbours.',
        farSecond: '{who} took up the way of a boat beyond your neighbours, which that boat had from you.',
        kin: "{who} took up your sister's way.",
        kinSecond: "{who} took up your sister's way, which she had from you.",
        house: '{who} took up the {name} way.',
        houseSecond: '{who} took up the {name} way, which the {name} boat had from you.',
        changed: '{who} changed one of its ways on its own.',
        kept: '{who} looked to {model} and kept its own way.'
      },
      seasonHeads: ['The end of the first season', 'The end of the second season', 'The end of the fishing'],
      seasonIntro: "At each season's end, boats look at who is doing well and may take up their ways.",
      seasonNone: 'No boat you can see changed its way.',

      // ---- Leaving -------------------------------------------------------------------------------
      leaving: {
        head: 'The boats are in',
        kept: 'Your boat is kept.',
        short: 'Your boat is {short} {goods} short.',
        sub: 'Your heir takes the boat and does in each situation as you did.',
        button: 'Leave the cove'
      },
      leaveNote: {
        never: 'Never tested. Your heir follows the old rule of the cove here and {does}.',
        tested: 'kept off {h} of {n}'
      },

      // ---- the Afterwards ------------------------------------------------------------------------
      oneFuture: 'This is one future of {futures}. Each has its own tides and its own chances taken.',
      houseAtEnd: '{who}: {income} {goods} in the last season, kept off {hands} of 16 times',
      arrival: {
        kin: "newcomers, {house}, take over your sister's mooring. Her line ends there.",
        house: 'newcomers, {house}, take over the {replaced} mooring.'
      },
      adopt: {
        backFromYours: '{who} gives up your ways and goes back to its own.',
        back: '{who} goes back to its own way.'
      },
      waysEnd: {
        never: 'No boat ever kept your ways.',
        one: 'At the end, {n} boat keeps your ways.',
        many: 'At the end, {n} boats keep your ways.',
        gone: 'No boat keeps your ways after season {season}.'
      },

      // ---- the Chronicle -------------------------------------------------------------------------
      heads: { house: 'Boat', place: 'Grounds' },
      rowsCaption: 'The first {first} of {futures} futures, one mark for each. Marks in the same place in the two rows had the same tides.',
      rowsExplain: 'The same cove played forward {futures} times, with different tides and different chances taken.',
      rangeNote: "Each of the {of} starts from the cove as your twelve days left it. The old rule's marker is for a boat that also lived those twelve days by the old rule of the cove.",
      lastAct: {
        sent: 'kept to your water beside {houses}',
        stayed: 'fished across into the water of {houses}',
        hadSent: 'kept to your water beside {houses}',
        hadStayed: 'fished across into the water of {houses}'
      },
      mattered: {
        none: 'No single way of yours stands out from the luck of the tides.',
        count: '{title}: you kept off {h} of {n} {times}.'
      },
      againSame: 'Fish these banks again',

      // ---- the stock: the bank between two boats (a place with a stock gives these) ---------------
      stock: {
        you: 'The bank between you',                   // bankNow, bankDay (a card: your tie)
        them: 'The bank between them',                 // bankDay (the sister's tie with another boat)
        holds: { say: '{bank} holds {level}; it can hold {max}.', text: 'holds {level}' },        // bankNow
        full: { say: '{bank} is full at {level}.', text: 'full at {level}' },
        spent: { say: '{bank} is spent at {level}.', text: 'spent at {level}' },
        fills: { say: '{bank} fills to {level}.', text: 'fills to {level}' },                     // bankDay
        fillsFull: { say: '{bank} fills to {level} and is full.', text: 'fills to {level}' },
        falls: { say: '{bank} falls to {level}.', text: 'falls to {level}' },
        fallsSpent: { say: '{bank} falls to {level} and is spent.', text: 'falls to {level}' },
        staysFull: { say: '{bank} stays full: it cannot fill further.', text: 'stays full' },
        staysSpent: { say: '{bank} is spent: it cannot fall further.', text: 'is spent' },
        stays: { say: '{bank} stays at {level}.', text: 'stays at {level}' },
        with: '{level} with {who}',                    // mapAltDay (one bank, while choosing)
        mapLevels: 'The banks between you and them: {levels}.',            // mapAltDay
        atEnd: 'The {ties} banks at the end: full {full}, spent {spent}, in between {between}.',   // banksAtEnd
        legend: 'a bank'                                                   // legendGauge (a dial: filled as far as it holds)
      }
    },

    charter: {
      legendMarks: { held: 'held', fell: 'failed' },
      flow: {
        head: 'The banks between boats, season by season',
        half: '{line}',
        rule: 'The grounds hold if, over the last ten seasons, the banks between boats average at least {line}; they began at {start}.'
      },
      flowAlt: 'The banks between boats, season by season, on average. Season 1: {first}. Lowest: {low}, in season {lowSeason}. Last ten seasons: {late}. The grounds hold at {line} or more.',
      futureEnd: {
        held: 'In this future the grounds held.',
        heldBarely: 'In this future the grounds held, barely.',
        fell: 'In this future the grounds failed.',
        fellBarely: 'In this future the grounds failed, barely.'
      },
      placeLine: 'With you, the grounds held in {holds} of {futures} futures. Had your boat kept the old rule of the cove: {base} of {futures}.',
      markMeans: 'The mark is the gap between the two counts: {gap} {more} {futures} held with you, {size} in every hundred.',
      rowAlt: '{label}: {held} of the first {n} held.',
      rowRule: 'A future counts as held if, in its last ten seasons, the banks between boats average at least {line}; they began at {start}.',
      rangeLine: 'Of {of} plain ways a boat might have left here, the best holds in {best}% of the first {futures} futures and the worst in {worst}%.',
      rangeYours: 'Counted on those same futures, yours holds in {pct}%.',
      rangeAxis: 'Share of futures in which the grounds held. Each block of the bar is ten points.',
      lastDay: {
        one: 'On the last day you fished across into the water of {houses}, after both boats had kept to their water. Had you kept to yours, the grounds held in {holds} of the first {futures} futures, against {base} of those as you left it. Your catch would have been {store}.',
        many: 'On the last day you fished across into the water of {houses}, after both boats had kept to their water with each. Had you kept to yours with each of them, the grounds held in {holds} of the first {futures} futures, against {base} of those as you left it. Your catch would have been {store}.'
      },
      lastDayHabit: 'On the last day you {lived}. Had you {replayed}, the grounds held in {holds} of the first {futures} futures, against {base} of those as you left it. Your catch would have been {store}.',
      seal: 'Boat kept, grounds better off.',
      mattered: {
        more: 'Had you kept to your water there once more: held in {holds} of the first {futures} futures.',
        lessShort: 'Had you fished across there once more: {holds}.',
        lessLong: 'Had you fished across there once more: held in {holds} of the first {futures} futures.'
      }
    },

    // A chart of the cove: your mooring at the foot behind the tide race, four neighbours across it,
    // three boats beyond the headland. Your four ties meet the race where their banks are drawn.
    sheet: {
      // (its east reach rises toward the edge, as the Bridges' stream does, so that it passes above the north
      // mark in the sheet's foot at every drawn size: measured in a browser, 2.7 px clear at a 320px phone's
      // enlarged lettering, where it ran through the N before)
      barrier: { draw: 'race', smooth: 10,
                 points: [[-0.03, 0.875], [0.10, 0.85], [0.25, 0.805], [0.355, 0.70], [0.50, 0.66], [0.645, 0.70], [0.75, 0.805], [0.88, 0.815], [1.03, 0.80]] },
      farLine: { draw: 'shore', smooth: 8,
                 points: [[-0.02, 0.30], [0.10, 0.315], [0.22, 0.33], [0.34, 0.31], [0.44, 0.275], [0.50, 0.262], [0.58, 0.275], [0.68, 0.305], [0.80, 0.325], [0.91, 0.32], [1.02, 0.305]] },
      crossing: 'gauge',
      // the gauges of three ties moved along them, clear of the lettering of holdings 2 and 6 and of the headland
      gauges: { '1-3': 0.3, '5-7': 0.7, '3-5': 0.25 },
      body: 'boat',
      notes: [
        { label: 'beyond', at: 'house', house: 4, dy: -6, unseenOnly: true },
        { label: 'ridge', at: 'farLine', x: 0.5, dy: -3 },          // the shore peaks at its middle: lower than the others' so that it clears the frame on a phone
        // "the banks", lettered under the race's west reach, where it runs flattest, as the Watch letters its
        // border: clear of every tie, hand and gauge (between the two middle ties, where the valley names its
        // ford, it lay over the hands to the north-east and north-west on the compact chart)
        { label: 'ford', at: 'sheet', x: 0.16, y: 0.9, water: true }
      ],
      glyph: {
        barrier: '<path class="key-river" d="M29 1q-2 2.75 0 5.5t0 5.5t0 5.5t0 5.5"/>',
        keyBarrier: '<path class="key-river" d="M25.5 0.5q-1.6 1.6 0 3.25t0 3.25t0 3.25t0 3.25"/>',
        seal: '<path class="seal-mast" d="M27 51V24"/><path class="seal-sail" d="M25.5 26.5V47H16Z"/><path class="seal-hull" d="M17 51H59L54 57.5H22Z"/>' +
              '<path class="seal-water" d="M24 60q2.5 -1.6 5 0t5 0t5 0t5 0t5 0t5 0"/>'
      }
    },

    afterword: 'On many coasts, fishing families keep unwritten lines between their grounds, and a ground fished hard from both sides can take years to fill again. Shared grazing and woodlots work the same way. What a quarrel takes is lost to both neighbours for seasons after, until one of them stops first.',

    // The rules these words were written for (page-smoke.js checks them against life.params). Beyond
    // the valley's keys: B 1, because the words say that a day's water yields what the bank holds;
    // STOCK_MOVES 'either-fills', because they say the bank fills when either boat keeps off (by the
    // same amount whether one or both do) and falls when both fish across.
    // SIGNS: the sign each outcome's words take for granted (keeping to your water "costs", their water "yields").
    writtenFor: { CUSTOM: [1, 1, 0, 1, 0], CHARTER: 'holds', FLOW_KIND: 'stock', STOCK: true, S: false, H: false, B: 1, STOCK_MOVES: 'either-fills',
                  SIGNS: { mine: '-', theirs: '+' } }
  });
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
