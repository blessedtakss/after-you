/*
 * After You: every sentence the page can show, as pure functions of engine data.
 * No DOM. Loads in a browser and in the jsc shell; attaches one global, AYWords.
 * Every function returns a string or an array of strings, and AYWords holds nothing else.
 */
(function (root) {
  'use strict';

  var MINUS = '\u2212';

  // ---- small parts ----------------------------------------------------------------------------

  // A change to the store, as the brief prints it: +2, -1, 0.
  function signed(n) {
    n = Math.round(n);
    if (n > 0) return '+' + n;
    if (n < 0) return '-' + Math.abs(n);
    return '0';
  }
  // The mark, with a true minus sign for negatives.
  function signedMark(n) {
    n = Math.round(n);
    if (n > 0) return '+' + n;
    if (n < 0) return MINUS + Math.abs(n);
    return '0';
  }
  function whole(n) { n = Math.round(n); return n === 0 ? '0' : String(n); }
  function pct(x) { return whole(x) + '%'; }
  function times(n) { return n === 1 ? 'time' : 'times'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function house(name) { return 'the ' + name + ' house'; }
  // A house as the reader knows it: kin is always "your sister's house".
  function who(name, isKin) { return isKin ? 'your sister\'s house' : house(name); }
  function list(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }

  // Situation phrases. Index = the engine's situation 0..4, from the acting side.
  var THEIR_ROW = [            // "What you know of them": their side, said of them
    'meeting someone new',
    'after hands went both ways',
    'after being left short',
    'after leaving the other short',
    'after both stayed home'
  ];
  var STOOD = [                // Why? card: where the neighbour stood toward you
    'Meeting you for the first time',
    'After hands went both ways',
    'After you left them short',
    'After they left you short',
    'After both houses stayed home'
  ];
  var DEED_WHEN = [            // your own deed, in your own terms
    'on first meeting',
    'after hands went both ways',
    'after they left you short',
    'after you left them short',
    'after both houses stayed home'
  ];
  var OLD_WAY_SENDS = [true, true, false, true, false];

  function yoursWay(w, kinId) { return w === 0 || w === kinId; }

  // ---- 3.1 opening ----------------------------------------------------------------------------

  var W = {};

  W.title = function () { return 'After You'; };
  W.premise = function () {
    return [
      'Twelve days of harvest in a valley of eight houses. Then you leave, and the valley goes on without you.',
      'Each day, each of your four neighbours has a crop that will not wait. You can send a hand or stay home. So can they.',
      'A hand sent costs you 1 measure of your own grain. A hand that arrives is worth 3 to the house it reaches.',
      'What you do, others see. Some will take it up as their own way.'
    ];
  };
  W.begin = function () { return 'Begin'; };
  W.stakeCost = function () { return 'costs you 1'; };
  W.stakeWorth = function () { return 'worth 3 where it lands'; };
  W.pastHeading = function () { return 'Past lives'; };
  // rec: { seed, kept, purse, need, mark, seal }
  W.pastLife = function (rec) {
    return 'Valley ' + rec.seed + ': ' + (rec.kept ? 'kept' : 'not kept') + ', ' + whole(rec.purse) + ' of ' + rec.need +
      '. Mark ' + signedMark(rec.mark) + '.' + (rec.seal ? ' Seal.' : '');
  };

  // ---- 3.2 the day ----------------------------------------------------------------------------

  W.dayOf = function (day) { return 'Day ' + day + ' of 12'; };
  W.lastDayNote = function () { return 'The last day.'; };
  W.storeHeading = function () { return 'Winter store'; };
  W.store = function (purse, need) { return whole(purse) + ' of ' + need + ' measures'; };
  W.storeNeed = function (need) { return 'need ' + need; };
  W.oldWay = function (oldWayPurse) {
    return 'The old way, which is to send a hand to someone new and then do as they did yesterday, would bring in ' +
      whole(oldWayPurse) + ' this harvest.';
  };

  // n: an entry of today().neighbours or of playDay().results
  W.cardTitle = function (n) { return n.kin ? 'Your sister\'s house' : 'The ' + n.name + ' house'; };
  W.cardSub = function (n) { return 'The ' + n.name + ' house'; };
  W.tookYourWays = function (day) { return 'Took up your ways at the end of day ' + day + '.'; };
  W.choiceFor = function (n) { return 'Your choice for ' + who(n.name, n.kin); };
  W.send = function () { return 'Send a hand'; };
  W.stay = function () { return 'Stay home'; };

  // y: today().neighbours[i].yesterday (null before any dealings)
  W.yesterday = function (y) {
    if (!y) return 'You have not dealt with them yet.';
    if (y.intended && y.lost) {
      return 'Yesterday your hand was turned back at the ford. They saw only that none came. ' +
        (y.they ? 'Theirs reached you.' : 'None came from them.');
    }
    if (y.arrived && y.they) return 'Yesterday hands went both ways.';
    if (y.arrived) return 'Yesterday you sent a hand. None came from them.';
    if (y.they) return 'Yesterday they sent a hand. None came from you.';
    return 'Yesterday both houses stayed home.';
  };

  W.knowHeading = function () { return 'What you know of them'; };
  W.seenLabel = function (s) { return THEIR_ROW[s]; };
  // c: { h, n }
  W.seenCount = function (c) { return c.n > 0 ? 'sent a hand ' + c.h + ' of ' + c.n : 'not yet seen'; };
  W.seenRow = function (s, c) { return THEIR_ROW[s] + ': ' + W.seenCount(c); };
  W.seenNote = function () { return 'Counted from their dealings with you and with others.'; };
  W.seenChanged = function (changedDay) {
    return 'They changed a way at the end of day ' + changedDay + '. Counted since then.';
  };
  W.standsToday = function () { return 'Where they stand today'; };
  W.todayTag = function () { return 'today'; };

  W.closeDay = function (left) {
    if (left <= 0) return 'Close the day';
    return 'Choose for ' + left + ' more ' + (left === 1 ? 'house' : 'houses');
  };

  // r: an entry of playDay().results
  W.reveal = function (r) {
    if (r.intended && r.lost) {
      return 'Your hand was turned back at the ford. They saw only that none came. ' +
        (r.they ? 'Theirs reached you.' : 'None came from them.');
    }
    if (r.arrived && r.they) return 'Hands went both ways.';
    if (r.arrived) return 'Your hand reached them. None came back.';
    if (r.they) return 'Their hand reached you. You sent none.';
    return 'Both houses stayed home.';
  };
  W.delta = function (n) { return signed(n); };
  W.revealLine = function (r) { return W.reveal(r) + ' ' + signed(r.payoff); };
  // res: what playDay() returned
  W.dayTotal = function (res) {
    return 'Today: ' + signed(res.gained) + '. Winter store: ' + whole(res.purse) + ' of ' + res.need + ' measures.';
  };

  W.why = function () { return 'Why?'; };
  W.back = function () { return 'Back'; };
  W.whyFromYou = function () { return 'This one leads back to you.'; };

  // The Why? record. ctx = { name, kin, kinId, arrived, third, changedDay }
  //   name, kin: the house that acted;  kinId: life.kin (to name the houses in your deeds);
  //   arrived: whether that house's hand arrived today;
  //   third: null on a neighbour's own card, or { name } = the other house kin dealt with;
  //   changedDay: today().neighbours[i].changedDay for that house (null when it never changed a way).
  //     The front of such a card counts "since then"; why.seen counts the whole Life, so say so.
  W.whyStood = function (why, ctx) {
    var s = why.situation;
    if (!ctx.third) return STOOD[s];
    var them = house(ctx.third.name), actor = who(ctx.name, ctx.kin);
    if (s === 0) return 'Meeting ' + them + ' for the first time';
    if (s === 2) return 'After ' + them + ' left ' + actor + ' short';
    if (s === 3) return 'After ' + actor + ' left ' + them + ' short';
    return STOOD[s];
  };
  W.whySource = function (why, ctx) {
    var src = why.source;
    if (src.type === 'you') {
      var d = src.digest;
      return [
        ctx.third ? cap(who(ctx.name, ctx.kin)) + ' learned this from you.' : 'They learned this from you.',
        'Here you sent a hand ' + d.sent + ' of ' + d.n + ' ' + times(d.n) + '. They do the same.'
      ];
    }
    if (src.type === 'blank') return ['They have never seen what you do here, so they kept their own way.'];
    if (src.type === 'house') {
      if (src.far) return ['They took this up from a house beyond your neighbours.'];
      return ['They took this up from ' + who(src.fromName, src.from === ctx.kinId) + '.'];
    }
    var span = (ctx.changedDay !== null && ctx.changedDay !== undefined) ? ', counted over the whole harvest' : '';
    return [
      'This is the ' + ctx.name + ' way. They did not learn it from you.',
      why.seen.n > 0
        ? 'Before today you knew them to send a hand here ' + why.seen.h + ' of ' + why.seen.n + ' ' + times(why.seen.n) + span + '.'
        : 'You had not seen them here before.'
    ];
  };
  // Which of your deeds the card quotes: those against your majority first, then the newest.
  function quoted(digest) {
    var out = digest.dissent.slice(0, 3), L = digest.latest, i, has = false;
    if (L) {
      for (i = 0; i < out.length; i++) if (out[i].day === L.day && out[i].to === L.to) has = true;
      if (!has && out.length < 3) out.push(L);
    }
    return out;
  }
  W.deed = function (d, situation, kinId) {
    return 'Day ' + d.day + ': you ' +
      (d.helped ? 'sent a hand to ' : 'stayed home against ') + who(d.toName, d.to === kinId) + ', ' + DEED_WHEN[situation] + '.';
  };
  W.whyDeeds = function (why, ctx) {
    var src = why.source;
    if (src.type !== 'you' || !src.digest) return [];
    var shown = quoted(src.digest), out = [], i;
    for (i = 0; i < shown.length; i++) out.push(W.deed(shown[i], why.situation, ctx.kinId));
    if (src.digest.n > shown.length) out.push('and ' + (src.digest.n - shown.length) + ' more');
    return out;
  };
  W.whyClose = function (why, ctx) {
    if (why.source.type !== 'you' || why.againstHabit !== true) return [];
    return [ctx.arrived ? 'Even so, a hand came today.' : 'Even so, no hand came today.'];
  };

  W.elsewhereHeading = function () { return 'Elsewhere today'; };
  // e: an entry of playDay().kinWith
  W.elsewhere = function (e) {
    var kin = 'your sister\'s house', them = house(e.name);
    if (e.kinSent && e.theySent) return cap(kin) + ' and ' + them + ': hands went both ways.';
    if (e.kinSent) return cap(kin) + ' sent a hand to ' + them + '. None came back.';
    if (e.theySent) return cap(them) + ' sent a hand to ' + kin + '. None went back.';
    return cap(kin) + ' and ' + them + ' both stayed home.';
  };

  W.waysHeading = function () { return 'Your ways'; };
  // w: an entry of ways()
  W.wayCount = function (w) { return w.n > 0 ? 'sent a hand ' + w.h + ' of ' + w.n : 'not yet tested'; };
  W.waysKey = function () { return 'A full cut is a hand sent. A shallow cut is a day you stayed home.'; };
  W.waysPending = function () { return 'Dotted cuts are today\'s, not yet made.'; };

  W.nextDay = function () { return 'Next day'; };
  W.toSeasonEnd = function () { return 'Season\'s end'; };
  W.toLeaving = function () { return 'The harvest is in'; };
  W.fordNote = function () { return 'A hand can be turned back at the ford. You only ever see whether one arrived.'; };

  W.seasonHeading = function () { return 'Season\'s end'; };
  W.seasonIntro = function () {
    return 'At each season\'s end, houses look at who is doing well and may take up their ways.';
  };
  W.kinFollows = function (count) {
    return 'Your sister\'s house follows your ways in ' + count + ' of 5 situations.';
  };
  // round: playDay().lookingRound;  titles: the five situation titles (ways()[s].title)
  W.seasonKin = function (round, titles) {
    var kin = round.kin, count = 0, out = [], i, h;
    for (i = 0; i < kin.habits.length; i++) if (kin.habits[i].source === 'you') count++;
    out.push(W.kinFollows(count));
    if (kin.changed) {
      for (i = 0; i < kin.habits.length; i++) {
        h = kin.habits[i];
        if (h.after === h.before || h.source !== 'you') continue;
        out.push(titles[h.situation] + ': ' + (h.h === 0
          ? 'they now stay home, as you did ' + h.n + ' of ' + h.n + ' ' + times(h.n) + '.'
          : 'they now send a hand ' + h.h + ' of ' + h.n + ' ' + times(h.n) + ', as you did.'));
      }
    }
    return out;
  };
  W.seasonOthers = function (round) {
    var out = [], i, e, name, kinId = round.kin.id;
    for (i = 0; i < round.reconsidered.length; i++) {
      e = round.reconsidered[i];
      if (!e.visible) continue;
      name = cap(who(e.name, e.house === kinId));
      if (e.adopted && e.took > 0) {
        if (e.model === 0) out.push(name + ' took up your ways.');
        else if (!e.modelVisible) out.push(name + ' took up the way of a house beyond your neighbours.');
        else if (e.model === kinId) out.push(name + ' took up the way of your sister\'s house.');
        else out.push(name + ' took up the ' + e.modelName + ' way.');
      } else if (e.changed) {
        out.push(name + ' changed one of its ways on its own.');
      } else {
        out.push(name + ' looked to ' + (e.model === 0 ? 'your house'
          : !e.modelVisible ? 'a house beyond your neighbours'
          : who(e.modelName, e.model === kinId)) + ' and kept its own way.');
      }
    }
    if (!out.length && !round.kin.changed) out.push('No house you can see changed its way.');
    return out;
  };

  // ---- 3.3 leaving ----------------------------------------------------------------------------

  W.leavingHeading = function () { return 'The harvest is in'; };
  W.leavingStore = function (purse, need) {
    var head = 'Winter store: ' + whole(purse) + ' of ' + need + ' measures. ';
    if (purse >= need) return head + 'Your house is kept.';
    var short = need - purse;
    return head + 'Your house is ' + short + ' ' + (short === 1 ? 'measure' : 'measures') + ' short.';
  };
  W.leaveHeading = function () { return 'What you leave'; };
  // lg: legacy(life)
  W.leaveCount = function (s, lg) {
    if (lg.hollow[s]) {
      return 'Never tested. Your heir keeps the old way here and ' + (OLD_WAY_SENDS[s] ? 'sends a hand.' : 'stays home.');
    }
    return 'sent a hand ' + lg.h[s] + ' of ' + lg.n[s];
  };
  W.leaveRow = function (s, lg, titles) { return titles[s] + ': ' + W.leaveCount(s, lg); };
  W.leaveKin = function (lg) {
    var c = 0, i;
    for (i = 0; i < lg.kin.fromYou.length; i++) if (lg.kin.fromYou[i]) c++;
    return W.kinFollows(c);
  };
  W.leave = function () { return 'Leave the valley'; };

  // ---- 3.4 the Afterwards ---------------------------------------------------------------------

  W.afterHeading = function () { return 'Thirty seasons without you.'; };
  W.oneFuture = function (futures) { return 'This is one future of ' + futures + '.'; };
  W.seasonOf = function (s) { return 'Season ' + s + ' of 30'; };
  W.seasonWord = function () { return 'Season'; };
  // h: an entry of runFuture().seasons[i].houses;  ctx = { kinId, kinHolds }
  W.ringName = function (h, ctx) {
    if (h.id === 0) return 'Your heir';
    if (h.id === ctx.kinId && ctx.kinHolds) return 'Your sister\'s house';
    return 'The ' + h.name + ' house';
  };
  W.legendHands = function () { return 'A standing stroke is a hand that got through this season, of 16.'; };
  W.legendIncome = function () { return 'The number is what the house brought in this season.'; };
  W.legendYours = function () { return 'A filled, doubled mark is a house running your ways.'; };
  W.flowCaption = function () { return 'Hands arriving across the valley, season by season. The line marks half.'; };
  W.flowLastTen = function () { return 'the last ten seasons'; };
  W.tickerHeading = function () { return 'As it happens'; };
  W.tickerEmpty = function () { return 'No house has changed its way yet.'; };

  // One event of the watched future as a line.  ev: an 'arrival' or 'adopt' entry of
  // runFuture().seasons[i].events;  ctx = { kinId: life.kin, kinHolds: kin's family still has its holding }
  W.tickerLine = function (ev, season, ctx) {
    var head = 'Season ' + season + ': ';
    if (ev.type === 'arrival') {
      if (ev.house === ctx.kinId) {
        return head + 'newcomers, ' + house(ev.name) + ', take over your sister\'s holding. Her line ends there.';
      }
      return head + 'newcomers, ' + house(ev.name) + ', take over the ' + ev.replaced + ' holding.';
    }
    var actor = ev.adopter === 0 ? 'your heir'
      : (ev.adopter === ctx.kinId && ctx.kinHolds) ? 'your sister\'s house'
      : house(ev.adopterName);
    var toYours = yoursWay(ev.way, ctx.kinId), fromYours = yoursWay(ev.from, ctx.kinId);
    // The way a family began with carries its name: "takes up the Ansel way" would read as a slip.
    if (!toYours && ev.wayName === ev.adopterName) {
      return head + actor + (fromYours ? ' gives up your ways and goes back to its own way.' : ' goes back to its own way.');
    }
    var target = toYours ? 'your ways' : 'the ' + ev.wayName + ' way';
    if (fromYours && !toYours) return head + actor + ' gives up your ways for ' + target + '.';
    return head + actor + ' takes up ' + target + '.';
  };

  // f: what runFuture() returned
  W.futureEnd = function (f) {
    if (f.holds) return f.level === 'frays' ? 'In this future the valley held, barely.' : 'In this future the valley held.';
    return f.level === 'frays' ? 'In this future the valley fell, barely.' : 'In this future the valley fell.';
  };
  W.yourWaysEnd = function (f) {
    if (f.yourWaysAtEnd > 0) {
      return 'At the end, ' + f.yourWaysAtEnd + ' ' + (f.yourWaysAtEnd === 1 ? 'house keeps' : 'houses keep') + ' your ways.';
    }
    if (!f.yourWaysLastSeason) return 'No house ever kept your ways.';
    return 'No house keeps your ways after season ' + f.yourWaysLastSeason + '.';
  };
  W.counting = function (job) { return 'Counting futures: ' + job.futuresDone + ' of ' + job.futures; };
  W.skip = function () { return 'Skip'; };
  W.seeCount = function () { return 'See the count'; };

  // ---- 3.5 the Chronicle ----------------------------------------------------------------------

  W.chronHeading = function () { return 'The count'; };
  W.houseHeading = function () { return 'Your house'; };
  // v: verdict()
  W.chronHouse = function (v) {
    return (v.houseKept ? 'Kept: ' : 'Not kept: ') + whole(v.purse) + ' of ' + v.need + ' measures.';
  };
  W.valleyHeading = function () { return 'The valley'; };
  W.chronValley = function (v) {
    return 'With you, the valley held in ' + v.holds + ' of ' + v.futures + ' futures. Had your house kept the old way: ' +
      v.baseline.holds + ' of ' + v.futures + '.';
  };
  W.markValue = function (v) { return signedMark(v.mark); };
  W.chronMark = function (v) { return 'Your mark: ' + signedMark(v.mark) + '.'; };
  W.chronNoise = function (v) {
    var k = Math.ceil(2 * v.markSE);
    return 'A different ' + v.futures + ' futures would move the mark by about ' + k + ' ' + (k === 1 ? 'point' : 'points') + ' either way.';
  };
  W.rowWith = function () { return 'With you'; };
  W.rowOld = function () { return 'The old way'; };
  // held: verdict().held or verdict().baseline.held
  W.fieldCount = function (held) {
    var n = Math.min(200, held.length), c = 0, i;
    for (i = 0; i < n; i++) if (held[i]) c++;
    return c + ' of these ' + n + ' held';
  };
  W.fieldCaption = function (v) { return 'The first ' + Math.min(200, v.futures) + ' of ' + v.futures + ' futures.'; };
  W.fieldKey = function () { return 'A standing stroke is a future that held. A fallen one is a future that fell.'; };
  W.explain = function (v) {
    return [
      'The same valley played forward ' + v.futures + ' times, with different luck at the ford and different chances taken.',
      'A future counts as held if, in its last ten seasons, at least half the hands that could arrive still do.'
    ];
  };
  W.rangeHeading = function () { return 'Where that sits'; };
  W.rangeLine = function (v) {
    return 'Of thirteen plain ways a house might have left here, the best holds in ' + pct(v.range.bestPct) +
      ' of futures and the worst in ' + pct(v.range.worstPct) + '.';
  };
  W.scaleYou = function () { return 'You'; };
  W.scaleOld = function () { return 'The old way'; };
  // For the figure's spoken label only: two separately rounded numbers beside the printed mark
  // can look a point out, so they are not printed on the scale.
  W.scaleYouAt = function (v) { return 'You, ' + pct(v.holdsPct); };
  W.scaleOldAt = function (v) { return 'The old way, ' + pct(v.baselinePct); };
  W.scaleWorst = function (v) { return 'worst, ' + pct(v.range.worstPct); };
  W.scaleBest = function (v) { return 'best, ' + pct(v.range.bestPct); };
  W.scaleUnit = function () { return 'Share of futures held'; };

  W.lastDayHeading = function () { return 'The last day'; };
  W.lastDay = function (v, kinId) {
    var L = v.lastDay, names = [], i;
    for (i = 0; i < L.changed.length; i++) names.push(who(L.changed[i].name, L.changed[i].id === kinId));
    return 'On the last day you stayed home against ' + list(names) + ', after hands had gone both ways' +
      (names.length > 1 ? ' with each' : '') + '. With a hand sent to them, the valley holds in ' + L.holds + ' of ' + L.futures +
      ' futures, against ' + v.whatIfBaseHolds + ' as you left it. Your store would have been ' + whole(L.purse) + ' of ' + v.need + ' measures.';
  };
  W.seal = function () { return 'House kept, valley better off.'; };
  W.matteredHeading = function () { return 'The way that mattered most'; };
  W.mattered = function (v, titles) {
    var m = v.mattered;
    if (!m) return 'No single way of yours stands out from the luck of the ford.';
    if (m.kind === 'lastDay') return 'Nothing counted here weighed more than the last day.';
    var s = m.situation, n = v.whatIfFutures;
    return titles[s] + ': you sent a hand ' + m.h + ' of ' + m.n + ' ' + times(m.n) + '. One more hand there: held in ' +
      v.whatIfs[2 * s].holds + ' of ' + n + '. One fewer: ' + v.whatIfs[2 * s + 1].holds + ' of ' + n +
      '. As you left it: ' + v.whatIfBaseHolds + ' of ' + n + '.';
  };
  W.watchedHeading = function () { return 'In the future you watched'; };
  // The list opens with who was running your ways as the Life ended, so the closing count can be
  // followed.  houses: life.houses (id, name, way);  kinId: life.kin
  W.watchedStart = function (houses, kinId) {
    var first = [], rest = [], i, h;
    for (i = 0; i < houses.length; i++) {
      h = houses[i];
      if (!yoursWay(h.way, kinId)) continue;
      if (h.id === 0) first.unshift('your heir');
      else if (h.id === kinId) first.push('your sister\'s house');
      else rest.push(house(h.name));
    }
    var names = first.concat(rest);
    if (!names.length) return 'When you left, no house kept your ways.';
    return 'When you left, ' + list(names) + ' kept your ways.';
  };
  W.valleyNo = function (seed) { return 'Valley no. ' + seed; };
  W.again = function () { return 'Live another life'; };
  W.againSame = function () { return 'Live this valley again'; };

  root.AYWords = W;
})(typeof globalThis !== 'undefined' ? globalThis : this);
