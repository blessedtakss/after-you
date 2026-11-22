/*
 * After You: every sentence the page can show, as pure functions of engine data.
 * No DOM. Loads in a browser (window.AYWords) and in the jsc shell (globalThis.AYWords).
 * Each function returns a string, an array of strings, or a plain object whose string
 * fields are sentences. Nothing here returns null or an empty string.
 */
(function (root) {
  'use strict';

  var MINUS = '−';
  var W = {};

  // ---- numbers ------------------------------------------------------------------------------

  function num(n) { return n < 0 ? MINUS + String(-n) : String(n); }
  function signed(n) { return n > 0 ? '+' + n : n < 0 ? MINUS + String(-n) : '0'; }
  function whole(x) { var r = Math.round(x); return r === 0 ? 0 : r; }   // no minus zero
  function times(n) { return n === 1 ? 'time' : 'times'; }
  function measures(n) { return n === 1 ? 'measure' : 'measures'; }
  function lowerFirst(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

  W.num = function (n) { return num(n); };
  W.signed = function (n) { return signed(n); };

  // ---- names --------------------------------------------------------------------------------

  W.house = function (name) { return 'the ' + name + ' house'; };
  W.House = function (name) { return 'The ' + name + ' house'; };
  W.kin = function (cap) { return cap ? "Your sister's house" : "your sister's house"; };
  W.who = function (name, isKin, cap) { return isKin ? W.kin(cap) : cap ? W.House(name) : W.house(name); };
  W.heir = function (cap) { return cap ? 'Your heir' : 'your heir'; };

  // ---- 3.1 opening --------------------------------------------------------------------------

  W.opening = function () {
    return {
      title: 'After You',
      premise: 'Twelve days of harvest in a valley of eight houses. Then you leave, and the valley goes on without you.',
      lines: [
        'Each day, each of your four neighbours has a crop that will not wait. You can send a hand or stay home. So can they.',
        'A hand sent costs you 1 measure of your own grain. A hand that arrives is worth 3 to the house it reaches.',
        'What you do, others see. Some will take it up as their own way, at the end of every fourth day.',
        'At the end two things are counted: whether your store is enough for winter, and whether the valley is better or worse off for the ways you left.'
      ],
      begin: 'Begin'
    };
  };
  W.pastHead = function () { return 'Earlier lives'; };
  W.pastLife = function (e) {
    var s = 'Valley ' + e.seed + ': ' + (e.kept ? 'kept' : 'not kept') + ', ' + num(e.purse) + ' of ' + e.need +
            '. Mark ' + signed(whole(e.mark)) + '.';
    return e.seal ? s + ' Seal.' : s;
  };
  // The Opening lists the latest few lives; this names the control that holds the rest.
  W.pastMore = function (n) { return n + (n === 1 ? ' older life' : ' older lives'); };
  W.valleyNo = function (seed) { return 'Valley no. ' + seed; };

  // ---- the map ------------------------------------------------------------------------------

  W.mapLabels = function () {
    return {
      ford: 'the ford',
      ridge: 'the ridge',
      beyond: 'beyond the ridge',
      yours: 'Your holding',
      heir: 'Your heir',
      sister: 'your sister',
      north: 'N'
    };
  };
  W.mapAlt = function (mode) {
    if (mode === 'after') return 'Map of the valley: eight holdings on a ring, joined by sixteen ties.';
    if (mode === 'sheet') return 'Map of the valley: your holding at the foot, four neighbours across the ford, three holdings beyond the ridge.';
    return 'Map of the valley: your holding at the foot, your four neighbours across the ford, and three holdings beyond the ridge that you cannot see.';
  };
  // What the day's map shows, in words. items: one per neighbour, in the engine's order:
  // { name, kin, plan (true | false | anything else while unchosen), result (an entry of
  // playDay().results once the day is closed, else null), arcs (how many of its five habits it
  // learned from you), keeps (it runs your ways as a whole) }.
  // phase: 'choose' | 'revealed' | 'season'.
  W.mapAltDay = function (day, phase, items) {
    var out = ['Map of the valley, ' + (phase === 'season' ? 'at the end of day ' + day : 'day ' + day) + '.'];
    var open = [], i, it, who;
    for (i = 0; i < items.length; i++) {
      it = items[i]; who = W.who(it.name, it.kin, false);
      if (phase === 'revealed' && it.result) {
        out.push(W.who(it.name, it.kin, true) + ': ' + lowerFirst(W.reveal(it.result).text));
      } else if (phase === 'choose') {
        if (it.plan === true) out.push('A hand planned to ' + who + '.');
        else if (it.plan === false) out.push('Staying home against ' + who + '.');
        else open.push(who);
      }
    }
    if (open.length) out.push('Not yet chosen: ' + open.join(', ') + '.');
    for (i = 0; i < items.length; i++) {
      it = items[i];
      if (it.arcs > 0) {
        out.push(W.who(it.name, it.kin, true) + ' has learned from you in ' + it.arcs + ' of 5 situations.');
      }
      if (it.keeps) out.push(W.who(it.name, it.kin, true) + ' keeps your ways.');
    }
    return out.join(' ');
  };
  W.bearing = function (i) { return ['east', 'north-east', 'north-west', 'west'][i]; };
  W.bearingShort = function (i) { return ['E', 'NE', 'NW', 'W'][i]; };
  W.bearingSay = function (i) { return 'To the ' + W.bearing(i) + ' of your holding.'; };
  W.legendHead = function () { return 'Map key'; };
  W.legendDay = function () {
    return {
      arrived: 'a hand that arrived',
      turned: 'your hand, turned back at the ford',
      planned: 'a hand you mean to send',
      home: 'you stay home',
      yours: 'learned from you: one arc for each situation',
      keeps: 'keeps your ways as a whole'
    };
  };
  W.legendAfter = function () {
    return {
      help: 'field filled by how freely the house sends hands',
      income: 'measures brought in this season',
      yours: 'keeps your ways',
      newcomer: 'newcomers'
    };
  };
  W.legendMarks = function () { return { held: 'held', fell: 'fell' }; };
  // The underlined marks are the newest closed day's: yesterday's while today is being chosen,
  // today's once the day is closed. The dashed marks are today's choices before the day closes.
  W.legendWays = function () {
    return { sent: 'sent a hand', stayed: 'stayed home', yesterday: 'yesterday', today: 'today', planned: 'planned' };
  };
  W.mapHint = function () { return 'Choose on the cards, or on a holding on the map.'; };
  // On a phone the day's map can be folded away; the button says what a press will do.
  W.mapFold = function (folded) { return folded ? 'Show the map' : 'Fold the map away'; };

  // ---- 3.2 the day --------------------------------------------------------------------------

  W.dayOf = function (day) { return 'Day ' + day + ' of 12'; };
  W.lastDayNote = function () { return 'The last day.'; };
  W.dayTrackAlt = function (day) { return 'Twelve days in three seasons of four. ' + W.dayOf(day) + '.'; };
  W.storeHead = function () { return 'Winter store'; };
  W.store = function (purse, need) { return num(purse) + ' of ' + need + ' ' + measures(need); };
  W.storeNeedTick = function (need) { return 'need ' + need; };
  W.oldWay = function (oldWayPurse) {
    return 'The old way, which is to send a hand to someone new and then do as they did yesterday, would bring in ' +
           num(oldWayPurse) + ' ' + measures(oldWayPurse) + ' this harvest.';
  };

  W.cardName = function (n) {
    return n.kin ? [W.kin(true), W.House(n.name)] : [W.House(n.name)];
  };
  W.yesterday = function (y) {
    if (!y) return 'You have not dealt with them yet.';
    if (y.lost) {
      return 'Yesterday your hand was turned back at the ford. They saw only that none came. ' +
             (y.they ? 'Theirs reached you.' : 'None came from them.');
    }
    if (y.arrived && y.they) return 'Yesterday hands went both ways.';
    if (y.arrived) return 'Yesterday you sent a hand. None came from them.';
    if (y.they) return 'Yesterday they sent a hand. None came from you.';
    return 'Yesterday you stayed home. None came from them.';
  };
  W.send = function () { return 'Send a hand'; };
  W.stay = function () { return 'Stay home'; };
  W.choiceLegend = function (n) { return 'Today, toward ' + W.who(n.name, n.kin, false); };
  W.chooseLine = function () { return 'For each house, send a hand or stay home.'; };
  // The day again, in front of that line where the day's header has scrolled out of sight.
  W.statusDay = function (day) { return W.dayOf(day) + '.'; };

  var KNOW_ROWS = ['meeting someone new', 'after hands went both ways', 'after being left short',
                   'after leaving the other short', 'after both stayed home'];
  W.knowHead = function () { return 'What you know of them'; };
  W.knowLabel = function (s) { return KNOW_ROWS[s]; };
  W.knowValue = function (h, n) { return n > 0 ? 'sent a hand ' + h + ' of ' + n : 'not yet seen'; };
  W.knowFoot = function () {
    return 'Counted from their dealings with you and with others. The marked row is where they stand with you today.';
  };
  W.knowChanged = function (changedDay) {
    return 'They changed a way at the end of day ' + changedDay + '. Counted since then.';
  };

  W.closeDay = function (left) {
    if (left <= 0) return 'Close the day';
    if (left >= 4) return 'Choose for all 4 houses';
    return 'Choose for ' + left + ' more ' + (left === 1 ? 'house' : 'houses');
  };
  W.nextDay = function (kind) {
    if (kind === 'season') return "Season's end";
    if (kind === 'leave') return 'Go on';
    return 'Next day';
  };

  W.reveal = function (r) {
    var text;
    if (r.lost) {
      text = 'Your hand was turned back at the ford. They saw only that none came. ' +
             (r.they ? 'Theirs reached you.' : 'None came from them.');
    } else if (r.arrived && r.they) text = 'Hands went both ways.';
    else if (r.arrived) text = 'Your hand reached them. None came back.';
    else if (r.they) text = 'Their hand reached you. You sent none.';
    else text = 'You stayed home. None came from them.';
    var number = signed(r.payoff);
    return { text: text, number: number, full: text + ' ' + number };
  };
  W.dayTotal = function (gained, purse, need) {
    return 'Today: ' + signed(gained) + '. ' + W.storeHead() + ': ' + W.store(purse, need) + '.';
  };

  // Why? ---------------------------------------------------------------------------------------

  var WHERE_THEY = ['Meeting you for the first time', 'After hands went both ways', 'After you left them short',
                    'After they left you short', 'After both houses stayed home'];
  var DEED_SIT = ['on first meeting', 'after hands went both ways', 'after they left you short',
                  'after you left them short', 'after both houses stayed home'];

  W.whyLabel = function () { return 'Why?'; };
  W.whyBack = function () { return 'Turn the card back'; };
  W.whyHeads = function () { return { where: 'Where they stood', source: 'Where this way came from' }; };
  // Said (not shown) with the one Why? button that carries the mark.
  W.whyMarked = function () { return 'Marked: the first time a house does as it learned from you.'; };

  // What was known of them here before today's dealing. For a house that has changed a way the
  // count restarts at that change, as it does on the front of the card (since = { changedDay,
  // seen }). Once the day is closed the front counts today as well, so each wording says that
  // it stops short of today.
  function knewLine(seen, since) {
    if (since) {
      var lead = 'They changed a way at the end of day ' + since.changedDay + '. ', k = since.seen;
      if (!k || !k.n) return lead + 'Before today you had not seen them here since.';
      if (k.n === 1) {
        return lead + (k.h ? 'Between then and today you had seen them here once, and they sent a hand.'
                           : 'Between then and today you had seen them here once, and no hand came.');
      }
      return lead + 'Between then and today you knew them to send a hand here ' + k.h + ' of ' + k.n + ' times.';
    }
    if (!seen || !seen.n) return 'You had not seen them here before.';
    if (seen.n === 1) {
      return seen.h ? 'Before today you had seen them here once, and they sent a hand.'
                    : 'Before today you had seen them here once, and no hand came.';
    }
    return 'Before today you knew them to send a hand here ' + seen.h + ' of ' + seen.n + ' times.';
  }
  // The engine hands over your deeds as they stood when the house learned from them (the end of
  // a season), so the count is dated: the panel of your ways beside it has usually moved on.
  function hereYou(sent, n) {
    if (n === 1) {
      return sent ? 'When they learned it, this had come up once, and you sent a hand.'
                  : 'When they learned it, this had come up once, and you stayed home.';
    }
    return 'When they learned it, you had sent a hand here ' + sent + ' of ' + n + ' times.';
  }
  function sameDeed(a, b) { return a.day === b.day && a.to === b.to; }
  function pickDeeds(digest) {
    var list = [], i, d = digest.dissent || [];
    for (i = 0; i < d.length && list.length < 3; i++) list.push(d[i]);
    if (digest.latest && list.length < 3) {
      var seen = false;
      for (i = 0; i < list.length; i++) if (sameDeed(list[i], digest.latest)) seen = true;
      if (!seen) list.push(digest.latest);
    }
    list.sort(function (a, b) { return a.day - b.day; });      // quoted in the order they happened
    return list;
  }
  W.deed = function (d, situation, kinId) {
    return 'Day ' + d.day + ': you ' + (d.helped ? 'sent a hand to ' : 'stayed home against ') +
           W.who(d.toName, d.to === kinId, false) + ', ' + DEED_SIT[situation] + '.';
  };
  // Each line is { text, kind } with kind one of 'lead', 'count', 'deed', 'more', 'even', 'plain';
  // a deed line also says whether a hand was sent (sent: true) so the page can draw its mark.
  function line(text, kind) { return { text: text, kind: kind }; }
  function youLines(why, kinId, third) {
    var dg = why.source.digest, lines = [], list = pickDeeds(dg), i;
    lines.push(line(third ? W.kin(true) + ' learned this from you.' : 'They learned this from you.', 'lead'));
    lines.push(line(hereYou(dg.sent, dg.n) + ' They do the same.', 'count'));
    for (i = 0; i < list.length; i++) {
      lines.push({ text: W.deed(list[i], why.situation, kinId), kind: 'deed', sent: !!list[i].helped });
    }
    if (dg.n > list.length) lines.push(line('and ' + (dg.n - list.length) + ' more', 'more'));
    if (why.againstHabit) {
      lines.push(line(third ? 'Even so, no hand of theirs arrived today.' : 'Even so, no hand came today.', 'even'));
    }
    return lines;
  }
  function sourceLines(why, name, kinId, third, since) {
    var src = why.source;
    if (src.type === 'you') return youLines(why, kinId, third);
    if (src.type === 'blank') return [line('They have never seen what you do here, so they kept their own way.', 'plain')];
    if (src.type === 'house') {
      if (src.far) return [line('They took this up from a house beyond your neighbours.', 'plain')];
      return [line('They took this up from ' + W.who(src.fromName, src.from === kinId, false) + '.', 'plain')];
    }
    return [line('This is the ' + name + ' way. They did not learn it from you.', 'plain'), line(knewLine(why.seen, since), 'plain')];
  }

  // The reason on the back of a neighbour's card. r = one entry of playDay().results.
  // since: null, or for a house whose today().changedDay is set, { changedDay, seen } with
  // seen = today().seenSince[r.why.situation]: the tally the front of the card shows.
  W.why = function (r, kinId, since) {
    return {
      title: W.who(r.name, r.kin, true),
      where: WHERE_THEY[r.why.situation],
      lines: sourceLines(r.why, r.name, kinId, false, since || null)
    };
  };
  // The same for kin's dealings with another neighbour. e = one entry of playDay().kinWith.
  W.whyThird = function (e, kinName, kinId) {
    var other = W.house(e.name);
    var where = ['Meeting ' + other + ' for the first time', 'After hands went both ways',
                 'After ' + other + ' left them short', 'After they left ' + other + ' short',
                 'After both houses stayed home'][e.why.situation];
    return {
      title: W.kin(true) + ', toward ' + other,
      where: where,
      lines: sourceLines(e.why, kinName, kinId, true, null)
    };
  };

  W.elsewhereHead = function () { return 'Elsewhere today'; };
  W.elsewhere = function (e) {
    var other = W.house(e.name), Other = W.House(e.name);
    if (e.kinSent && e.theySent) return W.kin(true) + ' and ' + other + ': hands went both ways.';
    if (e.kinSent) return W.kin(true) + ' sent a hand to ' + other + '. None came back.';
    if (e.theySent) return Other + ' sent a hand to ' + W.kin(false) + '. None went back.';
    return W.kin(true) + ' and ' + other + ': no hand went either way.';
  };

  // Your ways ---------------------------------------------------------------------------------

  W.waysHead = function () { return 'Your ways'; };
  W.wayCount = function (h, n) { return n > 0 ? 'sent a hand ' + h + ' of ' + n : 'not yet tested'; };
  W.wayHere = function (title) { return 'Counts in your ways under: ' + title; };
  W.waysNote = function () { return 'A house that takes up your ways does as these counts say.'; };

  // Season's end ------------------------------------------------------------------------------

  W.kinFollows = function (count) {
    return W.kin(true) + ' follows your ways in ' + count + ' of 5 situations.';
  };
  // Entries under the sister's line, so no pronoun: the title names a situation of yours.
  function kinChange(title, h, n) {
    if (n === 1) {
      return title + ': now ' + (h ? 'sends a hand' : 'stays home') + ', as you did the one time it came up.';
    }
    if (h === 0) return title + ': now stays home, as you did ' + n + ' of ' + n + ' times.';
    if (h === n) return title + ': now sends a hand, as you did ' + n + ' of ' + n + ' times.';
    return title + ': now sends a hand ' + h + ' of ' + n + ' times, as you did.';
  }
  // keeps: { houseId: bool }, the houses the map now marks as keeping your ways. A house that
  // took them up at second hand is told so, or "gives up your ways" later comes from nowhere.
  function reconsidered(e, kinId, keeps) {
    var who = W.who(e.name, e.house === kinId, true), second = !!(keeps && keeps[e.house]);
    if (e.adopted && e.took > 0) {
      if (e.model === 0) return who + ' took up your ways.';
      if (!e.modelVisible) {
        return who + ' took up the way of a house beyond your neighbours' + (second ? ', which that house had from you.' : '.');
      }
      if (e.model === kinId) return who + " took up your sister's way" + (second ? ', which she had from you.' : '.');
      return who + ' took up the ' + e.modelName + ' way' + (second ? ', which the ' + e.modelName + ' house had from you.' : '.');
    }
    if (e.changed) return who + ' changed one of its ways on its own.';
    var model = e.model === 0 ? 'your house'
              : !e.modelVisible ? 'a house beyond your neighbours'
              : W.who(e.modelName, e.model === kinId, false);
    return who + ' looked to ' + model + ' and kept its own way.';
  }
  // lr = playDay().lookingRound; titles = the five situation titles (ways()[s].title);
  // keeps = { houseId: bool } as the map marks the neighbours after this season's end (optional).
  W.seasonEnd = function (lr, kinId, titles, keeps) {
    var out = {
      head: ['The end of the first season', 'The end of the second season', 'The end of the harvest'][lr.season - 1],
      intro: "At each season's end, houses look at who is doing well and may take up their ways.",
      kin: '', changes: [], houses: []
    };
    var count = 0, i, h, e;
    for (i = 0; i < lr.kin.habits.length; i++) if (lr.kin.habits[i].source === 'you') count++;
    out.kin = W.kinFollows(count);
    if (lr.kin.changed) {
      for (i = 0; i < lr.kin.habits.length; i++) {
        h = lr.kin.habits[i];
        if (h.after !== h.before) out.changes.push(kinChange(titles[h.situation], h.h, h.n));
      }
    }
    for (i = 0; i < lr.reconsidered.length; i++) {
      e = lr.reconsidered[i];
      if (e.visible) out.houses.push(reconsidered(e, kinId, keeps || null));
    }
    if (!out.houses.length && !lr.kin.changed) out.houses.push('No house you can see changed its way.');
    return out;
  };

  W.fordNote = function () {
    return 'A hand can be turned back at the ford. It then costs nothing and brings nothing. You only ever see whether one arrived.';
  };

  // ---- 3.3 leaving --------------------------------------------------------------------------

  W.leavingHead = function () { return 'The harvest is in'; };
  W.leavingStore = function (purse, need) {
    var s = W.storeHead() + ': ' + W.store(purse, need) + '. ';
    if (purse >= need) return s + 'Your house is kept.';
    var short = need - purse;
    return s + 'Your house is ' + short + ' ' + measures(short) + ' short.';
  };
  W.leaveHead = function () { return 'What you leave'; };
  W.leaveSub = function () { return 'Your heir takes the holding and does in each situation as you did.'; };
  // What follows the way's title in "What you leave". heirHabit = legacy().heir[s]: what the
  // heir runs where the way was never tested.
  W.leaveNote = function (h, n, hollow, heirHabit) {
    if (hollow || !n) {
      return 'Never tested. Your heir keeps the old way here and ' + (heirHabit >= 0.5 ? 'sends a hand.' : 'stays home.');
    }
    return 'sent a hand ' + h + ' of ' + n;
  };
  W.leaveButton = function () { return 'Leave the valley'; };

  // ---- 3.4 the Afterwards -------------------------------------------------------------------

  W.afterHead = function () { return 'Thirty seasons without you.'; };
  W.oneFuture = function (futures) {
    return 'This is one future of ' + futures + '. Each has its own luck at the ford and its own chances taken.';
  };
  W.seasonCount = function (s) { return 'Season ' + s + ' of 30'; };
  W.tickerHead = function () { return 'As it happens'; };
  W.flowLabels = function () {
    return {
      head: 'Hands arriving across the valley, season by season',
      half: 'half',
      late: 'last ten seasons',
      rule: 'The valley holds if, over the last ten seasons, at least half the hands that could arrive still do.'
    };
  };
  // The strip in words, for a reader who cannot see it.
  W.flowAlt = function (future) {
    var s = future.seasons, low = 0, i;
    function share(x) { return Math.min(100, Math.max(0, Math.round(x * 100))); }
    for (i = 1; i < s.length; i++) if (s[i].flow < s[low].flow) low = i;
    return 'Hands arriving, season by season. Season 1: ' + share(s[0].flow) + ' in 100. Lowest: ' + share(s[low].flow) +
           ' in 100, in season ' + s[low].season + '. Last ten seasons: ' + share(future.lateFlow) +
           ' in 100 on average. The line for holding is half.';
  };
  // One holding as the resting map shows it. who: the house, named for the start of a sentence;
  // hands: how many of its 16 hands got through in the last season.
  W.houseAtEnd = function (who, income, hands, keepsYours, isNew) {
    return who + ': ' + num(income) + ' ' + measures(income) + ' in the last season, ' + hands + ' of 16 hands got through' +
           (keepsYours ? ', keeps your ways' : '') + (isNew ? ', newcomers' : '') + '.';
  };
  W.skip = function () { return 'Skip'; };
  W.seeCount = function () { return 'See the count'; };
  W.counting = function (done, total) { return 'Counting futures: ' + done + ' of ' + total; };

  function isYours(way, kinId) { return way === 0 || way === kinId; }

  // One line per event worth telling, in order. Each: { season, text, yours } where `yours`
  // is true when the line involves the heir, the sister's house or the reader's ways.
  W.futureLines = function (future, kinId) {
    var out = [], i, j, k, s, ev, text, yours;
    var arr = future.arrival || null;
    for (i = 0; i < future.seasons.length; i++) {
      s = future.seasons[i];
      var kinGone = !!(arr && arr.house === kinId && arr.season <= s.season);
      for (j = 0; j < s.events.length; j++) {
        ev = s.events[j]; text = ''; yours = false;
        if (ev.type === 'arrival') {
          text = 'newcomers, ' + W.house(ev.name) + ', take over ';
          if (ev.house === kinId) { text += "your sister's holding. Her line ends there."; yours = true; }
          else text += 'the ' + ev.replaced + ' holding.';
        } else if (ev.type === 'adopt') {
          if (!ev.changed) continue;
          var fromYours = isYours(ev.from, kinId), toYours = isYours(ev.way, kinId);
          if (fromYours && toYours) continue;
          var isHeir = ev.adopter === 0, isKin = ev.adopter === kinId && !kinGone;
          var who = isHeir ? W.heir(false) : isKin ? W.kin(false) : W.house(ev.adopterName);
          var target = toYours ? 'your ways' : 'the ' + ev.wayName + ' way';
          // a house that returns to the way it began with: from yours it "goes back to its own"
          // (not "gives up your ways for the Yarrow way again"), from another's it "goes back to its own way"
          var back = !toYours && !isHeir && !isKin && ev.wayName === ev.adopterName;
          if (back && fromYours) text = who + ' gives up your ways and goes back to its own.';
          else if (back) text = who + ' goes back to its own way.';
          else text = who + (fromYours ? ' gives up your ways for ' : ' takes up ') + target + '.';
          yours = isHeir || isKin || fromYours || toYours;
        } else if (ev.type === 'displaced') {
          var covered = false;
          for (k = 0; k < s.events.length; k++) {
            var o = s.events[k];
            if (o.type === 'adopt' && o.adopter === ev.house && o.changed) covered = true;
            if (o.type === 'arrival' && o.house === ev.house) covered = true;
          }
          if (covered) continue;
          text = (ev.house === 0 ? W.heir(false) : W.kin(false)) + ' gives up your ways.';
          yours = true;
        } else continue;
        out.push({ season: s.season, text: 'Season ' + s.season + ': ' + text, yours: yours });
      }
    }
    return out;
  };
  W.futureEnd = function (future) {
    var near = future.level === 'frays';
    if (future.holds) return near ? 'In this future the valley held, barely.' : 'In this future the valley held.';
    return near ? 'In this future the valley fell, barely.' : 'In this future the valley fell.';
  };
  W.waysEnd = function (future) {
    if (!future.yourWaysLastSeason) return 'No house ever kept your ways.';
    var n = future.yourWaysAtEnd;
    if (n > 0) return 'At the end, ' + n + (n === 1 ? ' house keeps' : ' houses keep') + ' your ways.';
    return 'No house keeps your ways after season ' + future.yourWaysLastSeason + '.';
  };

  // ---- 3.5 the Chronicle --------------------------------------------------------------------

  W.chronicleHead = function () { return 'The Chronicle'; };
  W.heads = function () {
    return {
      house: 'House',
      valley: 'Valley',
      range: 'Where that sits',
      lastDay: 'The last day',
      mattered: 'The way that mattered most',
      became: 'What became of your ways',
      becameSub: 'In the future you watched'
    };
  };
  W.houseLine = function (v) {
    return (v.houseKept ? 'Kept: ' : 'Not kept: ') + W.store(v.purse, v.need) + '.';
  };
  W.valleyLine = function (v) {
    return 'With you, the valley held in ' + v.holds + ' of ' + v.futures + ' futures. Had your house kept the old way: ' +
           v.baseline.holds + ' of ' + v.futures + '.';
  };
  W.markNumber = function (v) { return signed(whole(v.mark)); };
  W.markLine = function (v) { return 'Your mark: ' + W.markNumber(v) + '.'; };
  // What the mark is: the gap between the two counts just given, and its size in every hundred.
  W.markMeans = function (v) {
    var d = v.holds - v.baseline.holds, a = Math.abs(d), m = Math.abs(whole(v.mark));
    if (d === 0) return 'The two counts are the same.';
    return 'The mark is the gap between the two counts: ' + a + (d > 0 ? ' more ' : ' fewer ') + (a === 1 ? 'future' : 'futures') +
           ' held with you, ' + (m === 0 ? 'less than 1' : 'about ' + m) + ' in every hundred.';
  };
  W.markNoise = function (v) {
    if (v.markSE === 0 && whole(v.mark) === 0) return 'The two rows are the same in every future counted.';
    var k = Math.max(1, Math.ceil(2 * v.markSE));
    return 'A different ' + v.futures + ' futures would move the mark by about ' + k + ' ' +
           (k === 1 ? 'point' : 'points') + ' either way.';
  };
  W.rowLabels = function () { return { you: 'With you', old: 'The old way' }; };
  W.rowsCaption = function (v) {
    return 'The first ' + Math.min(200, v.held.length) + ' of ' + v.futures + ' futures, one mark for each. ' +
           'Marks in the same place in the two rows had the same luck at the ford.';
  };
  // One row of marks in words. held: how many of its first n marks are held.
  W.rowAlt = function (label, held, n) { return label + ': ' + held + ' of the first ' + n + ' held.'; };
  W.rowsExplain = function (v) {
    return [
      'The same valley played forward ' + v.futures + ' times, with different luck at the ford and different chances taken.',
      'A future counts as held if, in its last ten seasons, at least half the hands that could arrive still do.'
    ];
  };
  W.rangeLine = function (v) {
    return 'Of thirteen plain ways a house might have left here, the best holds in ' + whole(v.range.bestPct) +
           '% of the first ' + v.whatIfFutures + ' futures and the worst in ' + whole(v.range.worstPct) + '%.';
  };
  // Why a marker can lie outside the thirteen: they are counted on fewer futures, and the old
  // way's marker is a house that also lived the twelve days the old way.
  W.rangeNote = function (v) {
    var rg = v.range, s = 'Each of the thirteen starts from the valley as your twelve days left it. ' +
                          "The old way's marker is for a house that also lived those twelve days the old way.";
    if (rg.inside && (v.holdsPct < rg.worstPct || v.holdsPct > rg.bestPct)) {
      s += ' Counted on those same futures, yours holds in ' + whole(rg.yourPct) + '%.';
    }
    return s;
  };
  W.rangeLabels = function (v) {
    return {
      you: 'You ' + whole(v.holdsPct) + '%',
      old: 'The old way ' + whole(v.baselinePct) + '%',
      worst: 'worst ' + whole(v.range.worstPct) + '%',
      best: 'best ' + whole(v.range.bestPct) + '%',
      axis: 'Share of futures in which the valley held. Each block of the bar is ten points.'
    };
  };
  function listHouses(changed, kinId) {
    var names = [], i;
    for (i = 0; i < changed.length; i++) names.push(W.who(changed[i].name, changed[i].id === kinId, false));
    if (names.length === 1) return names[0];
    return names.slice(0, names.length - 1).join(', ') + ' and ' + names[names.length - 1];
  }
  W.lastDayLine = function (v, kinId) {
    var ld = v.lastDay, many = ld.changed.length > 1;
    return 'On the last day you stayed home against ' + listHouses(ld.changed, kinId) + ', after hands had gone both ways' +
           (many ? ' with each' : '') + '. With a hand sent to ' + (many ? 'each of them' : 'them') + ', the valley held in ' +
           ld.holds + ' of the first ' + ld.futures + ' futures, against ' + v.whatIfBaseHolds +
           ' of those as you left it. Your store would have been ' + W.store(ld.purse, v.need) + '.';
  };
  W.seal = function () { return 'House kept, valley better off.'; };
  // titles = the five situation titles (ways()[s].title).
  W.mattered = function (v, titles) {
    var m = v.mattered;
    if (!m) return 'No single way of yours stands out from the luck of the ford.';
    if (m.kind === 'lastDay') return 'Of your five ways and the last day, the last day weighed most.';
    // The engine's two what-ifs are one more precedent each way: h+1 of n+1, and h of n+1. Where
    // you always did the one thing, one more of it changes nothing and is left out.
    var s = m.situation, f = v.whatIfFutures, more = m.h < m.n, less = m.h > 0;
    var out = titles[s] + ': you sent a hand ' + m.h + ' of ' + m.n + ' ' + times(m.n) + '.';
    if (more) out += ' Had you sent a hand there once more: held in ' + v.whatIfs[2 * s].holds + ' of the first ' + f + ' futures.';
    if (less) {
      out += ' Had you stayed home there once more: ' + (more ? '' : 'held in ') + v.whatIfs[2 * s + 1].holds +
             (more ? '.' : ' of the first ' + f + ' futures.');
    }
    return out + ' As you left it: ' + v.whatIfBaseHolds + '.';
  };
  // The watched future's lines that involve the heir, the sister's house or the reader's ways,
  // then the closing line.
  W.became = function (future, kinId) {
    var all = W.futureLines(future, kinId), out = [], i;
    for (i = 0; i < all.length; i++) if (all[i].yours) out.push(all[i].text);
    out.push(W.waysEnd(future));
    return out;
  };
  W.again = function () { return 'Live another life'; };
  W.againSame = function () { return 'Live this valley again'; };

  root.AYWords = W;
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
