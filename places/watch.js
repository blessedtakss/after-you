/*
 * After You: the Watch, as a place. Eight watchtowers on a border; between you and each of your four
 * neighbours runs the border line. The kind act ("a hand") is standing down; the other is keeping watch,
 * which a tower shows by its fire. The stakes are shared (params S and H): both towers standing down gain
 * most, standing down alone costs, keeping watch while the other stands down gains, and both keeping
 * watch costs each its watchmen (every number is the Life's: params B, C, S, H, filled into the words
 * from AYWords.stakes). The luck: your watchman can light a fire at a shadow, and your tower has then
 * kept watch that day; you know it, the other tower sees only a fire. Pure data, as places/valley.js:
 * lexicon, charter, sheet, afterword, writtenFor. Loads after places/banks.js; the engine's rules are
 * AfterYou.PLACES.watch.
 *
 * Every key the valley's words have is here, in the Watch's words (page-smoke.js checks the key sets).
 * No template holds a digit. The custom is the border's (params.CUSTOM [0, 1, 1, 1, 0]): keep watch on a
 * new tower and after fires on both towers, stand down after any day on which either tower stood down
 * (both did; they did and yours showed a fire; yours did and theirs showed a fire). Its gloss says
 * exactly that. What a tower is seen to do is a fire on it or none: that a tower kept watch is never said
 * of the other tower (its fire may have been lit at a shadow), and whether a missing stand-down was a
 * shadow or a choice is never said. The situations are named by the fires seen.
 *
 * Numbers that can run below zero here, and words that stay true when they do: the custom's purse (it
 * never goes first and pays its watchmen through every standoff), told as what it would leave in your
 * stores; a tower's season in the Afterwards, told as sacks gained or lost. Lengths: the texts that share
 * the day's room with the cards are no longer than the valley's and the Banks', which were measured there.
 *
 * Sections, in order: the actors and acts; the five situations; the Opening; the sheet's words; the
 * day; Why?; Your ways and the season's end; Leaving; the Afterwards; the Chronicle; the charter; the
 * sheet's decoration; the afterword; the rules the words were written for.
 */
(function (root) {
  'use strict';

  root.AYPlaces.add({
    id: 'watch',

    lexicon: {
      name: 'The border',                              // placeName (said for a listener in the choice of places)
      label: 'Border',                                 // placeLabel (one short word: the five places stand in one row)

      // ---- the actors and acts ---------------------------------------------------------------
      house: 'the {name} tower',
      House: 'The {name} tower',
      way: 'the {name} way',
      kin: "your sister's tower",
      Kin: "Your sister's tower",
      heir: 'your heir',
      Heir: 'Your heir',
      toward: 'toward',
      actor: {
        one: 'tower',
        many: 'towers',
        yours: 'your tower',
        far: 'a tower beyond your neighbours'
      },
      newcomers: 'newcomers',
      goods: { one: 'sack', many: 'sacks' },
      act: {
        send: 'Stand down',                            // the button
        stay: 'Keep watch',                            // the button
        sends: 'stands down',                          // the sister's changes, the heir's note
        stays: 'keeps watch'
      },
      custom: {
        Name: 'The border custom',
        // [0, 1, 1, 1, 0] exactly: no day before (a new tower) or fires on both the day before: keep watch
        gloss: 'The border custom, to keep watch unless either tower stood down the day before, would leave your stores at {purse} {goods} by winter.'
      },

      // ---- the five situations ---------------------------------------------------------------------
      // (named by the fires seen: a fire on a tower is what is seen, never whether it was lit by choice or at a shadow)
      titles: ['Meeting a new tower', 'After you both stood down', 'After a fire on their tower', 'After a fire on yours', 'After fires on both towers'],
      knowRows: ['meeting a new tower', 'after both stood down', 'after a fire on the other tower', 'after a fire on their own', 'after fires on both towers'],
      whereThey: ['Meeting you for the first time', 'After both stood down', 'After a fire on your tower',
                  'After a fire on theirs', 'After fires on both towers'],
      deedSit: ['on first meeting', 'after both stood down', 'after a fire on their tower',
                'after a fire on yours', 'after fires on both towers'],
      // the sister's situation toward {other} (the card is titled "Your sister's tower, toward ...")
      whereThird: ['Meeting {other} for the first time', 'After both stood down', 'After a fire on {other}',
                   'After a fire on her own tower', 'After fires on both towers'],

      // ---- the Opening -------------------------------------------------------------------------
      opening: {
        premise: 'Twelve days on a border of eight watchtowers. Then you leave, and the border goes on without you.',
        lines: [
          'Between you and each of your four neighbours runs the border. Each day you can stand down or keep watch. So can they.',
          'If both towers stand down, each gains {both} {bothGoods}. Standing down alone loses you {mineAbs}; keeping watch while they stand down gains {theirs}. If both keep watch, each pays its watchmen {neitherAbs}.',
          'What you do, others see. Some will take it up as their own way, at the end of every fourth day.',
          'At the end two things are counted: whether your stores last the winter, and whether the border is more at peace or less for the ways you left.'
        ]
      },
      pastName: 'Border {seed}',
      placeNo: 'Border no. {seed}',

      // ---- the sheet's words (a map of the border) ---------------------------------------------------
      map: {
        crossing: 'the border',
        farLine: 'the hills',
        beyond: 'beyond the hills',
        seat: 'Your tower',
        heir: 'Your heir',
        kin: 'your sister'
      },
      mapAlt: {
        sheet: 'Map of the border: your tower at the foot, four neighbours across the border line, three towers beyond the hills.',
        day: 'Map of the border: your tower at the foot, your four neighbours across the border line, and three towers beyond the hills that you cannot see.',
        after: 'Map of the border: eight towers on a ring, each in sight of the next two on either side.'
      },
      mapAltDay: {
        head: 'Map of the border, {when}.',
        plan: 'Standing down toward {who}.',
        stay: 'Keeping watch on {who}.'
      },
      bearingSay: 'To the {bearing} of your tower.',
      legendDay: {
        arrived: 'a tower that stood down',
        lost: 'your fire lit at a shadow',
        planned: 'you mean to stand down',
        stay: 'you keep watch'
      },
      legendAfter: {
        help: 'filled by how often the tower stands down',
        income: 'sacks gained or lost this season'          // a tower that keeps watch all season pays out more than it gains
      },
      legendWays: { sent: 'stood down', stayed: 'kept watch' },
      mapHint: 'Choose on the cards, or on a tower on the map.',

      // ---- the day -------------------------------------------------------------------------------
      // (each sentence names its outcome by the fires seen, so that the number beside it is the Opening's
      // for that outcome; a fire lit at a shadow leaves your tower keeping watch, as the luck note says)
      storeHead: 'Winter stores',
      chooseLine: 'For each tower, stand down or keep watch.',
      knowValue: 'stood down {h} of {n}',
      yesterday: {
        lostTheirs: 'Yesterday your watchman lit a fire at a shadow. They saw only a fire. They stood down.',
        lostNone: 'Yesterday your watchman lit a fire at a shadow. They saw only a fire. A fire burned on theirs too.',
        both: 'Yesterday both towers stood down.',
        mine: 'Yesterday you stood down. A fire burned on their tower.',
        theirs: 'Yesterday they stood down. You kept watch.',
        neither: 'Yesterday you kept watch. A fire burned on theirs too.'
      },
      reveal: {
        lostTheirs: 'Your watchman lit a fire at a shadow. They saw only a fire. They stood down.',
        lostNone: 'Your watchman lit a fire at a shadow. They saw only a fire. A fire burned on theirs too.',
        both: 'Both towers stood down.',
        mine: 'You stood down alone. A fire burned on their tower.',
        theirs: 'They stood down. You kept watch.',
        neither: 'You kept watch. A fire burned on theirs too: both paid.'
      },
      luckNote: 'Your watchman can light a fire at a shadow: your tower then keeps watch that day. The other tower sees only a fire.',

      // ---- Why? ------------------------------------------------------------------------------------
      whyMarked: 'Marked: the first time a tower does as it learned from you.',
      knew: {
        sinceOnceSent: 'Between then and today you had seen them here once, and they stood down.',
        sinceOnceNone: 'Between then and today you had seen them here once, and a fire burned on their tower.',
        sinceMany: 'Between then and today you knew them to stand down here {h} of {n} times.',
        onceSent: 'Before today you had seen them here once, and they stood down.',
        onceNone: 'Before today you had seen them here once, and a fire burned on their tower.',
        many: 'Before today you knew them to stand down here {h} of {n} times.'
      },
      hereYou: {
        onceSent: 'When they learned it, this had come up once, and you stood down.',
        onceStayed: 'When they learned it, this had come up once, and you kept watch.',
        many: 'When they learned it, you had stood down here {h} of {n} times.'
      },
      deed: {
        sent: 'Day {day}: you stood down toward {who}, {sit}.',
        stayed: 'Day {day}: you kept watch on {who}, {sit}.'
      },
      even: {                                          // a habit learned from you, and a fire on that tower today
        own: 'Even so, a fire burned on their tower today.',
        third: "Even so, a fire burned on your sister's tower today."
      },
      elsewhere: {
        both: '{Kin} and {other}: both stood down.',
        kinSent: '{Kin} stood down toward {other}, where a fire burned.',
        theySent: '{Other} stood down toward {kin}, where a fire burned.',
        none: '{Kin} and {other}: fires burned on both.'
      },

      // ---- Your ways, the season's end -----------------------------------------------------------
      wayCount: 'stood down {h} of {n}',
      waysNote: 'A tower that takes up your ways does as these counts say.',
      reconsidered: {
        far: '{who} took up the way of a tower beyond your neighbours.',
        farSecond: '{who} took up the way of a tower beyond your neighbours, which that tower had from you.',
        kin: "{who} took up your sister's way.",
        kinSecond: "{who} took up your sister's way, which she had from you.",
        house: '{who} took up the {name} way.',
        houseSecond: '{who} took up the {name} way, which the {name} tower had from you.',
        changed: '{who} changed one of its ways on its own.',
        kept: '{who} looked to {model} and kept its own way.'
      },
      seasonHeads: ['The end of the first season', 'The end of the second season', 'The end of your watch'],
      seasonIntro: "At each season's end, towers look at who is doing well and may take up their ways.",
      seasonNone: 'No tower you can see changed its way.',

      // ---- Leaving -------------------------------------------------------------------------------
      leaving: {
        head: 'Your watch is over',
        kept: 'Your tower is kept.',
        short: 'Your tower is {short} {goods} short.',
        sub: 'Your heir takes the tower and does in each situation as you did.',
        button: 'Leave the border'
      },
      leaveNote: {
        never: 'Never tested. Your heir follows the border custom here and {does}.',
        tested: 'stood down {h} of {n}'
      },

      // ---- the Afterwards ------------------------------------------------------------------------
      oneFuture: 'This is one future of {futures}. Each has its own shadows and its own chances taken.',
      houseAtEnd: '{who}: {income} {goods} in the last season, stood down {hands} of 16 times',
      arrival: {
        kin: "newcomers, {house}, take over your sister's tower. Her line ends there.",
        house: 'newcomers, {house}, take over the {replaced} tower.'
      },
      adopt: {
        backFromYours: '{who} gives up your ways and goes back to its own.',
        back: '{who} goes back to its own way.'
      },
      waysEnd: {
        never: 'No tower ever kept your ways.',
        one: 'At the end, {n} tower keeps your ways.',
        many: 'At the end, {n} towers keep your ways.',
        gone: 'No tower keeps your ways after season {season}.'
      },

      // ---- the Chronicle -------------------------------------------------------------------------
      heads: { house: 'Tower', place: 'Border' },
      // (the same shadows: the two rows' futures draw the same chances of a false fire, whether or not a fire is then lit)
      rowsCaption: 'The first {first} of {futures} futures, one mark for each. Marks in the same place in the two rows had the same shadows.',
      rowsExplain: 'The same border played forward {futures} times, with different shadows and different chances taken.',
      rangeNote: "Each of the {of} starts from the border as your twelve days left it. The custom's marker is for a tower that also lived those twelve days by the border custom.",
      lastAct: {
        sent: 'stood down toward {houses}',
        stayed: 'kept watch on {houses}',
        hadSent: 'stood down toward {houses}',         // after "Had you"
        hadStayed: 'kept watch on {houses}'
      },
      mattered: {
        none: 'No single way of yours stands out from the luck of the shadows.',
        count: '{title}: you stood down {h} of {n} {times}.'
      },
      againSame: 'Live this border again',

      // ---- a seal withheld by the season replay (AYWords.seasonRests; the Watch's rules replay the last
      // season, REPLAY 'season'), told only where the seal would otherwise have been earned. It says the
      // engine's rule: days 9-12 played again by the tower's ways as they stood before them (the border
      // custom in a situation never met), and the mark no longer clear of the seal's bar. It names that
      // bar ("by enough for a seal"), never the border's gain alone: the replayed mark can stay well clear
      // of the noise the page states and still fall short of the bar (seed 45, +6 against about 2) ------
      lastSeason: {
        rests: 'No seal this time: had your tower kept to its earlier ways in the last season, and to the border custom where it had none, the border would not have been better off by enough for a seal.'
      }
    },

    // ---- the charter: the peace on the border (CHARTER 'holds'; FLOW_KIND 'both': the share of days on
    // which both towers of a tie stood down, against HOLD_LINE) --------------------------------------
    charter: {
      legendMarks: { held: 'at peace', fell: 'not at peace' },
      flow: {
        head: 'Towers standing down together, season by season',
        half: '{line}',
        rule: 'The border is at peace if, over the last ten seasons, neighbouring towers stood down together on at least {line} of the days.'
      },
      flowAlt: 'Days on which neighbouring towers stood down together, season by season. Season 1: {first} in 100. Lowest: {low} in 100, in season {lowSeason}. Last ten seasons: {late} in 100 on average. The line for peace is {line}.',
      futureEnd: {
        held: 'In this future the border was at peace.',
        heldBarely: 'In this future the border was at peace, barely.',
        fell: 'In this future the border was not at peace.',
        fellBarely: 'In this future the border was not at peace, barely.'
      },
      placeLine: 'With you, the border was at peace in {holds} of {futures} futures. Had your tower kept the border custom: {base} of {futures}.',
      markMeans: 'The mark is the gap between the two counts: {gap} {more} {futures} at peace with you, {size} in every hundred.',
      rowAlt: '{label}: at peace in {held} of the first {n}.',
      rowRule: 'A future counts as at peace if, in its last ten seasons, neighbouring towers stood down together on at least {line} of the days.',
      rangeLine: 'Of {of} plain ways a tower might have left here, the best keeps the peace in {best}% of the first {futures} futures and the worst in {worst}%.',
      rangeYours: 'Counted on those same futures, yours keeps it in {pct}%.',
      rangeAxis: 'Share of futures in which the border was at peace. Each block of the bar is ten points.',
      // (the valley's replay only; this place replays by habit, below)
      lastDay: {
        one: 'On the last day you kept watch on {houses}, after both towers had stood down. Had you stood down, the border was at peace in {holds} of the first {futures} futures, against {base} of those as you left it. Your stores would have been {store}.',
        many: 'On the last day you kept watch on {houses}, after both towers had stood down with each. Had you stood down toward each of them, the border was at peace in {holds} of the first {futures} futures, against {base} of those as you left it. Your stores would have been {store}.'
      },
      lastDayHabit: 'On the last day you {lived}. Had you {replayed}, the border was at peace in {holds} of the first {futures} futures, against {base} of those as you left it. Your stores would have been {store}.',
      seal: 'Tower kept, border better off.',
      mattered: {
        more: 'Had you stood down there once more: at peace in {holds} of the first {futures} futures.',
        lessShort: 'Had you kept watch there once more: {holds}.',
        lessLong: 'Had you kept watch there once more: at peace in {holds} of the first {futures} futures.'
      }
    },

    // ---- the sheet's decoration: a map of the border. Your tower at the foot inside a bend of the border
    // line, four neighbours across it, three towers beyond the hills. A border post where each of your
    // four roads crosses the line. -----------------------------------------------------------------
    sheet: {
      // (its inner wings lie as low as the valley's river there: the names of the east and west towers, lettered
      // below them, stay clear of the band on the compact sheet; its east reach rises toward the edge, as the
      // Bridges' stream does, so that it passes above the north mark at every drawn size: measured in a browser,
      // 2.6 px clear at a 320px phone's enlarged lettering, where it ran through the N before)
      barrier: { draw: 'border', smooth: 10,
                 points: [[-0.03, 0.86], [0.11, 0.835], [0.255, 0.80], [0.36, 0.70], [0.50, 0.66], [0.64, 0.70], [0.745, 0.80], [0.88, 0.815], [1.03, 0.80]] },
      farLine: { draw: 'scarp', smooth: 8,
                 points: [[-0.02, 0.30], [0.13, 0.315], [0.26, 0.30], [0.39, 0.31], [0.50, 0.29], [0.61, 0.31], [0.74, 0.30], [0.87, 0.315], [1.02, 0.30]] },
      crossing: 'post',
      body: 'tower',
      notes: [
        { label: 'beyond', at: 'house', house: 4, dy: -6, unseenOnly: true },
        { label: 'ridge', at: 'farLine', x: 0.5, dy: -6 },
        // under the border's west wing, where it runs flattest: clear of every tie, post, holding and name
        // in every mode on both sizes (between the ties to your sister's side, the middle was crowded)
        { label: 'ford', at: 'sheet', x: 0.16, y: 0.89, water: true }
      ],
      glyph: {
        barrier: '<path class="key-border" d="M29 1V23"/>',
        keyBarrier: '<path class="key-border" d="M25.5 0.5V13.5"/>',
        // a tower with three merlons, a slit and its door, on its ground, standing left of the seal's check
        seal: '<path class="seal-tower" d="M17 54V22.5h2.4v3.5h2.4v-3.5h2.4v3.5h2.4v-3.5h2.4V54Z"/>' +
              '<path class="seal-mast" d="M23 30.5v6M21 54v-5a2 2 0 0 1 4 0v5"/><path class="seal-deck" d="M16.5 54.5H59"/>'
      }
    },

    // ---- the afterword --------------------------------------------------------------------------
    afterword: 'Neighbouring countries that arm because each fears the other can stay armed long after both want peace, and one false alarm can undo years of quiet. Such standoffs have ended when one side stood down first, in steps the other could see, and kept on after an alarm instead of answering it.',

    // ---- the rules these words were written for (page-smoke.js checks them against life.params): the
    // border custom [0, 1, 1, 1, 0]; a share when both stand down and a cost when both keep watch (S, H);
    // the flow counts days on which both stood down.
    // SIGNS: the sign each outcome's words take for granted (both "gain", standing down alone "loses", keeping
    // watch while they stand down "gains", both keeping watch "pays").
    writtenFor: { CUSTOM: [0, 1, 1, 1, 0], CHARTER: 'holds', FLOW_KIND: 'both', STOCK: false, S: true, H: true,
                  SIGNS: { both: '+', mine: '-', theirs: '+', neither: '-' } }
  });
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
