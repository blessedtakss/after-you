/*
 * After You: every sentence the page can show, as pure functions of engine data.
 * Loads in a browser and in the jsc shell. No DOM. Attaches one global: AYWords.
 * Each function returns a string or an array of strings, except the few marked "data",
 * which return plain values the page needs alongside the words (which deeds to quote,
 * which events to tell, the record kept of a finished Life).
 */
(function (root) {
  'use strict';

  var W = {};
  var MINUS = '−';
  var DAYS = 12, SEASONS = 30;

  // ---- names and numbers ------------------------------------------------------------------

  function house(name, cap) { return (cap ? 'The ' : 'the ') + name + ' house'; }
  function sister(cap) { return (cap ? 'Your' : 'your') + " sister's house"; }
  function who(name, kin, cap) { return kin ? sister(cap) : house(name, cap); }
  function signed(n) { return n > 0 ? '+' + n : n < 0 ? '-' + (-n) : '0'; }
  function times(n) { return n === 1 ? 'time' : 'times'; }      // "1 of 1 time", "0 of 1 time", "2 of 3 times"
  function listOf(parts) {
    if (parts.length <= 1) return parts.join('');
    return parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
  }
  function yoursWay(way, kinId) { return way === 0 || way === kinId; }
  function markText(mark) {
    var r = Math.round(mark);
    return r > 0 ? '+' + r : r < 0 ? MINUS + (-r) : '0';
  }

  /** "the Maren house" / "your sister's house"; cap for the start of a sentence. */
  W.who = function (name, kin, cap) { return who(name, !!kin, !!cap); };
  /** "+2", "-1", "0": a change to the store. */
  W.signed = function (n) { return signed(n); };

  // ---- 3.1 opening ------------------------------------------------------------------------

  W.title = function () { return 'After You'; };
  W.opening = function () {
    return [
      'Twelve days of harvest in a valley of eight houses. Then you leave, and the valley goes on without you.',
      'Each day, each of your four neighbours has a crop that will not wait. You can send a hand or stay home. So can they.',
      'A hand sent costs you 1 measure of your own grain. A hand that arrives is worth 3 to the house it reaches.',
      'What you do, others see. Some will take it up as their own way.'
    ];
  };
  W.begin = function () { return 'Begin'; };
  W.fordLabel = function () { return 'the ford'; };
  W.stakeNear = function () { return 'costs you 1'; };
  W.stakeFar = function () { return 'worth 3 to them'; };
  W.livesHeading = function () { return 'Earlier lives'; };
  /** data: the record kept of a finished Life. */
  W.record = function (v, seed) {
    return { seed: seed, kept: !!v.houseKept, purse: v.purse, need: v.need,
             mark: Math.round(v.mark) || 0, seal: !!(v.seal && v.seal.earned) };
  };
  /** "Valley 48213: kept, 66 of 64. Mark +7. Seal." */
  W.lifeRow = function (rec) {
    return 'Valley ' + rec.seed + ': ' + (rec.kept ? 'kept' : 'not kept') + ', ' + rec.purse + ' of ' + rec.need +
           '. Mark ' + markText(rec.mark) + '.' + (rec.seal ? ' Seal.' : '');
  };

  // ---- 3.2 the day ------------------------------------------------------------------------

  W.dayTitle = function (day) { return 'Day ' + day + ' of ' + DAYS; };
  W.lastDayNote = function () { return 'The last day.'; };
  W.storeLabel = function () { return 'Winter store'; };
  W.store = function (purse, need) { return purse + ' of ' + need + ' measures'; };
  W.oldWay = function (oldWayPurse) {
    return 'The old way, which is to send a hand to someone new and then do as they did yesterday, would bring in ' +
           oldWayPurse + ' this harvest.';
  };

  W.houseTitle = function (nb) { return who(nb.name, nb.kin, true); };
  /** The family name under "Your sister's house". */
  W.houseSub = function (nb) { return house(nb.name, true); };

  W.yesterday = function (y) {
    if (!y) return 'You have not dealt with them yet.';
    if (y.lost) {
      return 'Yesterday your hand was turned back at the ford. They saw only that none came. ' +
             (y.they ? 'Theirs reached you.' : 'None came from them.');
    }
    if (y.arrived && y.they) return 'Yesterday hands went both ways.';
    if (y.arrived) return 'Yesterday you sent a hand. None came from them.';
    if (y.they) return 'Yesterday they sent a hand. None came from you.';
    return 'Yesterday both houses stayed home.';
  };

  W.send = function () { return 'Send a hand'; };
  W.stay = function () { return 'Stay home'; };
  /** The accessible name of one house's pair of choices. */
  W.choiceFor = function (nb) { return 'Your hand and ' + who(nb.name, nb.kin, false); };

  var KNOW = ['meeting someone new', 'after hands went both ways', 'after being left short',
              'after leaving the other short', 'after both stayed home'];
  W.knowHeading = function () { return 'What you know of them'; };
  W.knowColumn = function () { return 'sent a hand'; };
  W.knowLabel = function (s) { return KNOW[s]; };
  /** "1 of 3", or "not yet seen". */
  W.knowCount = function (c) { return c.n > 0 ? c.h + ' of ' + c.n : 'not yet seen'; };
  /** "after being left short: sent a hand 1 of 3" */
  W.knowRow = function (s, c) {
    return KNOW[s] + ': ' + (c.n > 0 ? 'sent a hand ' + c.h + ' of ' + c.n : 'not yet seen');
  };
  W.knowNote = function () { return 'Counted from their dealings with you and with others.'; };
  W.knowChanged = function (changedDay) {
    return 'They changed a way at the end of day ' + changedDay + '. Counted since then.';
  };

  W.closeLabel = function (left) {
    if (left <= 0) return 'Close the day';
    return 'Choose for ' + left + ' more ' + (left === 1 ? 'house' : 'houses');
  };
  W.closedLabel = function () { return 'The day is closed'; };

  W.revealText = function (r) {
    if (r.lost) {
      return 'Your hand was turned back at the ford. They saw only that none came. ' +
             (r.they ? 'Theirs reached you.' : 'None came from them.');
    }
    if (r.arrived && r.they) return 'Hands went both ways.';
    if (r.arrived) return 'Your hand reached them. None came back.';
    if (r.they) return 'Their hand reached you. You sent none.';
    return 'Both houses stayed home.';
  };
  /** "Hands went both ways. +2" */
  W.reveal = function (r) { return W.revealText(r) + ' ' + signed(r.payoff); };
  /** Labels on the drawing of the crossing: where your hand ended, and whether theirs came. */
  W.markYours = function (r) { return r.lost ? 'turned back' : r.arrived ? 'your hand' : 'you stayed'; };
  W.markTheirs = function (r) { return r.they ? 'their hand' : 'none came'; };
  W.dayTotal = function (res) {
    return 'Today: ' + signed(res.gained) + '. Winter store: ' + W.store(res.purse, res.need) + '.';
  };

  // ---- Why? -------------------------------------------------------------------------------

  var DEED_WHEN = ['on first meeting', 'after hands went both ways', 'after they left you short',
                   'after you left them short', 'after both houses stayed home'];

  W.whyLabel = function () { return 'Why?'; };
  W.whyBack = function () { return 'Turn back'; };
  /** The accessible name of a Why? control. */
  W.whyFor = function (actor) { return 'Why? ' + who(actor.name, actor.kin, true); };

  /** Where the acting house stood, from its side. other: null when it faced you, else { name, kin }. */
  W.whySituation = function (why, other) {
    var o = other ? who(other.name, other.kin, false) : null;
    switch (why.situation) {
      case 0: return o ? 'Meeting ' + o + ' for the first time' : 'Meeting you for the first time';
      case 1: return 'After hands went both ways';
      case 2: return o ? 'After ' + o + ' left them short' : 'After you left them short';
      case 3: return o ? 'After they left ' + o + ' short' : 'After they left you short';
      default: return 'After both houses stayed home';
    }
  };

  // The two situations that are not the same from both banks. The heading says where the house
  // stood; the count and the deeds under it are yours, from the days you stood on that side.
  var YOU_WHEN = { 2: 'When a house had left you short, you', 3: 'When you had left a house short, you' };

  /** The count the front of a card shows once a house has changed a way. since: { day, h, n }. */
  W.whySince = function (since) {
    return 'Counted since they changed a way at the end of day ' + since.day + ': ' + W.knowCount(since) + '.';
  };

  /** Where that habit came from. actor: { name, kin }; third: true when it faced another house;
   *  since: null, or { day, h, n }: what the front of the card counts for this situation, when the
   *  house has changed a way and the front counts only from that day on. */
  W.whyLead = function (why, actor, kinId, third, since) {
    var src = why.source, they = third ? who(actor.name, actor.kin, true) : 'They', out;
    if (src.type === 'you') {
      return [they + ' learned this from you.',
              (YOU_WHEN[why.situation] || 'Here you') + ' sent a hand ' + src.digest.sent + ' of ' + src.digest.n +
              ' ' + times(src.digest.n) + '. They do the same.'];
    }
    if (src.type === 'blank') {
      return [third ? they + ' has never seen what you do here, so it kept its own way.'
                    : 'They have never seen what you do here, so they kept their own way.'];
    }
    if (src.type === 'house') {
      return [they + ' took this up from ' +
              (src.far ? 'a house beyond your neighbours' : who(src.fromName, src.from === kinId, false)) + '.'];
    }
    out = ['This is the ' + actor.name + ' way. They did not learn it from you.'];
    if (why.seen.n > 0) {
      out.push('Before today you knew them to send a hand here ' + why.seen.h + ' of ' + why.seen.n + ' ' + times(why.seen.n) + '.');
      // the front counts less than that: say its number too, so the two sides of the card agree
      if (since && since.n !== why.seen.n) out.push(W.whySince(since));
    } else {
      out.push('You had not seen them here before.');
    }
    return out;
  };

  /** data: which of your deeds to quote, at most three: those against your majority first, then the newest. */
  W.pickDeeds = function (digest) {
    if (!digest) return [];
    var out = (digest.dissent || []).slice(0, 3), d = digest.latest, i, listed = false;
    if (d) {
      for (i = 0; i < out.length; i++) if (out[i].day === d.day && out[i].to === d.to) listed = true;
      if (!listed && out.length < 3) out.push(d);
    }
    return out;
  };
  /** "Day 3: you stayed home against the Maren house, after they left you short." */
  W.whyDeed = function (deed, situation, kinId) {
    var to = who(deed.toName, deed.to === kinId, false);
    return 'Day ' + deed.day + ': you ' + (deed.helped ? 'sent a hand to ' + to : 'stayed home against ' + to) +
           ', ' + DEED_WHEN[situation] + '.';
  };
  W.whyMore = function (k) { return 'and ' + k + ' more'; };
  /** Stated as fact only: what was quoted says one thing, today showed the other. */
  W.whyEven = function (why) {
    var d = why.source.digest;
    return d && d.sent === 0 ? 'Even so, a hand came today.' : 'Even so, no hand came today.';
  };
  /** The whole card, in order. since: as for whyLead. */
  W.whyCard = function (why, actor, kinId, other, since) {
    var out = [W.whySituation(why, other)].concat(W.whyLead(why, actor, kinId, !!other, since || null));
    if (why.source.type === 'you') {
      var deeds = W.pickDeeds(why.source.digest), i;
      for (i = 0; i < deeds.length; i++) out.push(W.whyDeed(deeds[i], why.situation, kinId));
      if (why.source.digest.n > deeds.length) out.push(W.whyMore(why.source.digest.n - deeds.length));
      if (why.againstHabit) out.push(W.whyEven(why));
    }
    return out;
  };

  // ---- elsewhere today, your ways, next ---------------------------------------------------

  W.elsewhereHeading = function () { return 'Elsewhere today'; };
  W.elsewhere = function (e, kinId) {
    var them = who(e.name, e.id === kinId, false), Them = who(e.name, e.id === kinId, true);
    if (e.kinSent && e.theySent) return sister(true) + ' and ' + them + ': hands went both ways.';
    if (e.kinSent) return sister(true) + ' sent a hand to ' + them + '. None came back.';
    if (e.theySent) return Them + ' sent a hand to ' + sister(false) + '. None went back.';
    return sister(true) + ' and ' + them + ' both stayed home.';
  };

  W.waysHeading = function () { return 'Your ways'; };
  W.wayTitle = function (way) { return way.title; };
  W.wayCount = function (way) { return way.n > 0 ? 'sent a hand ' + way.h + ' of ' + way.n : 'not yet tested'; };

  W.nextLabel = function (day, seasonShown) {
    if (day % 4 !== 0) return 'Next day';
    if (!seasonShown) return "Season's end";
    return day >= DAYS ? 'See the winter store' : 'Next day';
  };
  W.smallPrint = function () {
    return 'A hand can be turned back at the ford. You only ever see whether one arrived.';
  };

  // ---- season's end -----------------------------------------------------------------------

  W.seasonHeading = function () { return "Season's end"; };
  W.seasonIntro = function () {
    return "At each season's end, houses look at who is doing well and may take up their ways.";
  };
  function followed(flags) { var c = 0, i; for (i = 0; i < flags.length; i++) if (flags[i]) c++; return c; }
  function kinFollows(count) { return sister(true) + ' follows your ways in ' + count + ' of 5 situations.'; }
  W.seasonKin = function (round) {
    return kinFollows(followed(round.kin.habits.map(function (h) { return h.source === 'you'; })));
  };
  /** One line per habit of your sister's house that moved. titles: your five situation titles. */
  W.seasonKinChanges = function (round, titles) {
    var out = [];
    if (!round.kin.changed) return out;
    round.kin.habits.forEach(function (h) {
      if (h.after === h.before) return;
      var t = titles[h.situation];
      out.push(h.h === 0
        ? t + ': they now stay home, as you did ' + h.n + ' of ' + h.n + ' ' + times(h.n) + '.'
        : t + ': they now send a hand ' + h.h + ' of ' + h.n + ' ' + times(h.n) + ', as you did.');
    });
    return out;
  };
  W.seasonHouse = function (e, kinId) {
    var it = who(e.name, e.house === kinId, true);
    if (e.adopted && e.took > 0) {
      if (e.model === 0) return it + ' took up your ways.';
      if (!e.modelVisible) return it + ' took up the way of a house beyond your neighbours.';
      if (e.model === kinId) return it + ' took up the way of ' + sister(false) + '.';
      return it + ' took up the ' + e.modelName + ' way.';
    }
    if (e.changed) return it + ' changed one of its ways on its own.';
    var to = e.model === 0 ? 'your house'
           : !e.modelVisible ? 'a house beyond your neighbours'
           : who(e.modelName, e.model === kinId, false);
    return it + ' looked to ' + to + ' and kept its own way.';
  };
  W.seasonNone = function () { return 'No house you can see changed its way.'; };
  /** The lines about the other houses, or the one line that says there are none. */
  W.seasonHouses = function (round, kinId) {
    var out = [];
    round.reconsidered.forEach(function (e) { if (e.visible) out.push(W.seasonHouse(e, kinId)); });
    if (!out.length && !round.kin.changed) out.push(W.seasonNone());
    return out;
  };
  /** The whole panel, in order. */
  W.seasonLines = function (round, titles, kinId) {
    return [W.seasonIntro(), W.seasonKin(round)]
      .concat(W.seasonKinChanges(round, titles), W.seasonHouses(round, kinId));
  };

  // ---- 3.3 leaving ------------------------------------------------------------------------

  W.leavingTitle = function () { return 'The harvest is in.'; };
  W.leavingStore = function (purse, need) {
    var short = need - purse;
    return 'Winter store: ' + W.store(purse, need) + '. ' +
           (short <= 0 ? 'Your house is kept.'
                       : 'Your house is ' + short + (short === 1 ? ' measure' : ' measures') + ' short.');
  };
  W.leaveHeading = function () { return 'What you leave'; };
  /** "sent a hand 2 of 6", or what the heir does where you were never tested. */
  W.leaveValue = function (legacy, s) {
    if (!legacy.hollow[s]) return 'sent a hand ' + legacy.h[s] + ' of ' + legacy.n[s];
    return 'Never tested. Your heir keeps the old way here and ' +
           (legacy.heir[s] >= 0.5 ? 'sends a hand.' : 'stays home.');
  };
  W.leaveWay = function (title, legacy, s) { return title + ': ' + W.leaveValue(legacy, s); };
  W.leaveKin = function (legacy) { return kinFollows(followed(legacy.kin.fromYou)); };
  W.leaveLabel = function () { return 'Leave the valley'; };

  // ---- 3.4 the Afterwards -----------------------------------------------------------------

  W.afterTitle = function () { return 'Thirty seasons without you.'; };
  W.oneFuture = function (futures) { return 'This is one future of ' + futures + '.'; };
  W.seasonCount = function (season) { return 'Season ' + season + ' of ' + SEASONS; };
  /** The name under a holding on the ring. kinGone: newcomers hold your sister's house. */
  W.ringLabel = function (h, kinId, kinGone) {
    if (h.id === 0) return 'Your heir';
    if (h.id === kinId && !kinGone) return sister(true);
    return house(h.name, true);
  };
  W.legendFill = function () { return 'The fill of a house is the share of its hands that got through that season.'; };
  W.legendNumber = function () { return 'The number is the measures it brought in.'; };
  W.legendYours = function () { return 'A second ring marks a house that keeps your ways.'; };
  W.flowCaption = function () {
    return 'Hands arriving each season, as a share of those that could. The line is half.';
  };
  W.lastTen = function () { return 'the last ten seasons'; };
  W.tickerHeading = function () { return 'What happened'; };

  /** data: is this event told on the ticker? */
  W.eventShown = function (ev, kinId) {
    if (ev.type === 'arrival') return true;
    if (ev.type === 'adopt') return !!ev.changed && !(yoursWay(ev.from, kinId) && yoursWay(ev.way, kinId));
    return false;
  };
  /** One ticker line. kinGone: newcomers already hold your sister's house in this season.
   *  keptYours (arrivals only): the house that gives way was keeping your ways until now. */
  W.eventLine = function (ev, season, kinId, kinGone, keptYours) {
    var head = 'Season ' + season + ': ';
    if (ev.type === 'arrival') {
      if (ev.house === kinId) {
        return head + 'newcomers, ' + house(ev.name, false) + ", take over your sister's holding. Her line ends there.";
      }
      return head + 'newcomers, ' + house(ev.name, false) + ', take over the ' + ev.replaced + ' holding.' +
             (keptYours ? ' ' + house(ev.replaced, true) + ' kept your ways until then.' : '');
    }
    var isHeir = ev.adopter === 0, isKin = ev.adopter === kinId && !kinGone;
    var actor = isHeir ? 'your heir' : isKin ? sister(false) : house(ev.adopterName, false);
    if (yoursWay(ev.way, kinId)) return head + actor + ' takes up your ways.';
    var own = ev.wayName === ev.adopterName;      // the way this house's own family began: it is not taken up, it is gone back to
    if (yoursWay(ev.from, kinId)) {               // whoever the house is, it was keeping your ways until now
      return head + actor + (own ? ' gives up your ways and goes back to its own way.'
                                 : ' gives up your ways for the ' + ev.wayName + ' way.');
    }
    return head + actor + (own ? ' goes back to its own way.' : ' takes up the ' + ev.wayName + ' way.');
  };
  /** data: the told events of one future, in order: [{ season, text, yours, house }].
   *  yours: the line involves your heir or your sister's house, or it is a house taking up your
   *  ways or leaving them (for another way, or because newcomers took its holding), so that every
   *  house told as taking your ways up is also told when it stops keeping them.
   *  house: the holding the line is about. */
  W.futureEvents = function (future, kinId) {
    var out = [], arrival = future.arrival;
    var runs = future.seasons[0].houses.map(function (h) { return h.way; });   // whose way each house runs, kept in step
    future.seasons.forEach(function (s) {
      var kinGone = !!arrival && arrival.house === kinId && s.season >= arrival.season;
      s.events.forEach(function (ev) {
        var yours, at, kept = false;
        if (ev.type === 'arrival') {
          at = ev.house;
          kept = yoursWay(runs[at], kinId);         // the house that gives way was keeping your ways
          yours = at === kinId || kept;
          runs[at] = -1;                            // the newcomers bring their own way
        } else if (ev.type === 'adopt') {
          at = ev.adopter;
          yours = at === 0 || (at === kinId && !kinGone) || yoursWay(ev.way, kinId) || yoursWay(ev.from, kinId);
          runs[at] = ev.way;
        }
        if (!W.eventShown(ev, kinId)) return;
        out.push({ season: s.season, text: W.eventLine(ev, s.season, kinId, kinGone, kept), yours: yours, house: at });
      });
    });
    return out;
  };
  W.futureLines = function (future, kinId) {
    return W.futureEvents(future, kinId).map(function (e) { return e.text; });
  };

  W.futureEnd = function (future) {
    var barely = future.level === 'frays';
    if (future.holds) return barely ? 'In this future the valley held, barely.' : 'In this future the valley held.';
    return barely ? 'In this future the valley fell, barely.' : 'In this future the valley fell.';
  };
  W.yoursEnd = function (future) {
    var n = future.yourWaysAtEnd, last = future.yourWaysLastSeason;
    if (n > 0) return 'At the end, ' + n + (n === 1 ? ' house keeps' : ' houses keep') + ' your ways.';
    if (last > 0) return 'No house keeps your ways after season ' + last + '.';
    return 'No house ever kept your ways.';
  };
  W.counting = function (job) { return 'Counting futures: ' + job.futuresDone + ' of ' + job.futures; };
  W.skip = function () { return 'Skip'; };
  W.toChronicle = function () { return 'See the count'; };

  // ---- 3.5 the Chronicle ------------------------------------------------------------------

  W.chronicleTitle = function () { return 'The count'; };
  W.headHouse = function () { return 'House'; };
  W.headValley = function () { return 'Valley'; };
  W.headSits = function () { return 'Where that sits'; };
  W.headLastDay = function () { return 'The last day'; };
  W.headMattered = function () { return 'The way that mattered most'; };
  W.headBecame = function () { return 'In the future you watched'; };

  W.houseLine = function (v) {
    return (v.houseKept ? 'Kept: ' : 'Not kept: ') + W.store(v.purse, v.need) + '.';
  };
  W.valleyLine = function (v) {
    return 'With you, the valley held in ' + v.holds + ' of ' + v.futures + ' futures. ' +
           'Had your house kept the old way: ' + v.baseline.holds + ' of ' + v.futures + '.';
  };
  /** "+7", with a true minus sign, "0" when it rounds to zero. */
  W.markNumber = function (v) { return markText(v.mark); };
  W.markLine = function (v) { return 'Your mark: ' + markText(v.mark) + '.'; };
  W.markNote = function (v) {
    var k = Math.ceil(2 * v.markSE);
    return 'A different ' + v.futures + ' futures would move the mark by about ' + k +
           (k === 1 ? ' point' : ' points') + ' either way.';
  };
  W.rowYou = function () { return 'With you'; };
  W.rowOld = function () { return 'The old way'; };
  W.rowsLegend = function () { return 'A filled mark is a future that held. An open mark is one that fell.'; };
  W.rowsCaption = function (v) { return 'The first ' + Math.min(200, v.futures) + ' of ' + v.futures + ' futures.'; };
  W.explain = function (v) {
    return [
      'The same valley played forward ' + v.futures + ' times, with different luck at the ford and different chances taken.',
      'A future counts as held if, in its last ten seasons, at least half the hands that could arrive still do.'
    ];
  };
  W.pct = function (x) { return Math.round(x) + '%'; };
  W.rangeLine = function (v) {
    return 'Of thirteen plain ways a house might have left here, the best holds in ' + Math.round(v.range.bestPct) +
           '% of futures and the worst in ' + Math.round(v.range.worstPct) + '%.';
  };
  W.markerYou = function () { return 'You'; };
  W.markerOld = function () { return 'The old way'; };
  W.tickBest = function (v) { return 'best ' + W.pct(v.range.bestPct); };
  W.tickWorst = function (v) { return 'worst ' + W.pct(v.range.worstPct); };

  W.lastDayLine = function (v, kinId) {
    var d = v.lastDay, names = d.changed.map(function (c) { return who(c.name, c.id === kinId, false); });
    return 'On the last day you stayed home against ' + listOf(names) +
           (names.length > 1 ? ', after hands had gone both ways with each. ' : ', after hands had gone both ways. ') +
           'With a hand sent to them, the valley holds in ' + d.holds + ' of ' + d.futures + ' futures, against ' +
           v.whatIfBaseHolds + ' as you left it. Your store would have been ' + W.store(d.purse, v.need) + '.';
  };
  W.seal = function () { return 'House kept, valley better off.'; };
  /** titles: your five situation titles. */
  W.mattered = function (v, titles) {
    var m = v.mattered;
    if (!m) return 'No single way of yours stands out from the luck of the ford.';
    if (m.kind === 'lastDay') return 'Nothing counted here weighed more than the last day.';
    var s = m.situation, f = v.whatIfFutures;
    return titles[s] + ': you sent a hand ' + m.h + ' of ' + m.n + ' ' + times(m.n) + '. One more hand there: held in ' +
           v.whatIfs[2 * s].holds + ' of ' + f + '. One fewer: ' + v.whatIfs[2 * s + 1].holds + ' of ' + f +
           '. As you left it: ' + v.whatIfBaseHolds + ' of ' + f + '.';
  };
  /** What became of your ways in the watched future, then how it closed. */
  W.became = function (future, kinId) {
    var out = [];
    W.futureEvents(future, kinId).forEach(function (e) { if (e.yours) out.push(e.text); });
    out.push(W.yoursEnd(future));
    return out;
  };
  W.valleyNo = function (seed) { return 'Valley no. ' + seed; };
  W.again = function () { return 'Live another life'; };
  W.againSame = function () { return 'Live this valley again'; };

  /** The whole Chronicle as plain lines, in the order the page shows them. */
  W.chronicle = function (v, future, kinId, titles, seed) {
    var out = [W.chronicleTitle(),
               W.headHouse(), W.houseLine(v),
               W.headValley(), W.valleyLine(v), W.markLine(v), W.markNote(v)];
    if (v.seal && v.seal.earned) out.push(W.seal());
    out = out.concat([W.rowYou(), W.rowOld(), W.rowsCaption(v) + ' ' + W.rowsLegend()], W.explain(v));
    if (v.range) {
      out.push(W.headSits(), W.tickWorst(v), W.tickBest(v), W.markerOld() + ' ' + W.pct(v.baselinePct),
               W.markerYou() + ' ' + W.pct(v.holdsPct), W.rangeLine(v));
    }
    if (v.lastDay) out.push(W.headLastDay(), W.lastDayLine(v, kinId));
    out.push(W.headMattered(), W.mattered(v, titles));
    out.push(W.headBecame());
    out = out.concat(W.became(future, kinId));
    out.push(W.valleyNo(seed), W.again(), W.againSame());
    return out;
  };

  root.AYWords = W;
})(typeof globalThis !== 'undefined' ? globalThis : this);
