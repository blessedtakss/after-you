/*
 * After You: every sentence the page can show, as pure functions of engine data.
 * No DOM. Loads in a browser (window.AYWords) and in the jsc shell (globalThis.AYWords).
 * Each function returns a string, an array of strings, or a plain object whose string
 * fields are sentences. Nothing here returns null or an empty string.
 *
 * Places. The words that belong to a place (its acts, its luck, its actors, its sheet, what it
 * counts as better off) are in that place's file, places/<id>.js, which registers itself with
 * AYPlaces.add (the register is kept here). AYWords.use(id) puts a place's words in force; every
 * function below then reads them, and a key the place does not give throws: no word is ever taken
 * from another place. The strings left in this file are the shared base, the same in every place.
 * AYWords.title(s) gives the place's name for situation s (the engine's own titles are not shown).
 * A place whose rules have a stock (p.STOCK: the Banks) also gives the stock's words (lexicon.stock),
 * read by bankNow, bankDay, banksAtEnd, legendGauge and the bank clauses of mapAltDay; they throw in a
 * place without one. A place whose charter is inverted (p.CHARTER 'breaks': the Saltmarket, better off
 * when the ring of its ties breaks) gives the words of the town that pays for the ring (lexicon.town),
 * read by dayTown; it throws in a place without them. A place whose rules replay the last season
 * (p.REPLAY 'season': the Watch and the Saltmarket) gives one line for a seal that replay withheld
 * where the seal would otherwise have been earned (lexicon.lastSeason), read by seasonRests.
 * The valley's words are frozen as published (FROZEN below): where a shared function words a number
 * more exactly than the valley did (the strip's late figure), the valley keeps its own wording.
 *
 * Stakes. One tie on one day is worth B x level for their act that arrives, costs C for yours, adds S
 * when both arrive and takes H when neither does. stakes(p) gives the four outcomes (both, mine,
 * theirs, neither); the Opening's templates, and the reveal and yesterday templates where a place asks
 * for them, take them as slots ({both}, {mineAbs}, {neitherGoods}, {storeStart} ...: see stakeSlots), so
 * every card number can be accounted for in the place's words. A store can run below zero; the need
 * is always above it (the engine's).
 *
 * Rules on screen. Every number that states a rule is computed from the Life (p = life.params,
 * today(), playDay() results, the verdict), never typed in: the stakes on the Opening (stakes(p)
 * fills the place's templates), the line a future must reach (HOLD_LINE, worded by the flow
 * kind), the count of plain ways (verdict().range.of). A place's templates hold no digits.
 */
(function (root) {
  'use strict';

  var MINUS = '−';
  var W = {};

  // ---- places, and the words in force --------------------------------------------------------

  function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function isObject(x) { return x !== null && typeof x === 'object' && !Array.isArray(x); }

  // The register of places, in the order their files load (the play order).
  var PLACES = { order: [], byId: {} };
  PLACES.add = function (p) {
    if (!isObject(p) || typeof p.id !== 'string' || !/^[a-z]+$/.test(p.id)) throw new Error('AYPlaces.add: a place needs an id of lower-case letters');
    if (hasOwn(PLACES.byId, p.id)) throw new Error('AYPlaces.add: "' + p.id + '" is registered twice');
    if (!isObject(p.lexicon) || !isObject(p.charter) || !isObject(p.sheet)) throw new Error('AYPlaces.add: "' + p.id + '" needs a lexicon, a charter and a sheet');
    if (typeof p.afterword !== 'string' || !p.afterword) throw new Error('AYPlaces.add: "' + p.id + '" needs its afterword, one short paragraph');
    if (!isObject(p.writtenFor)) throw new Error('AYPlaces.add: "' + p.id + '" needs writtenFor, the rules its words were written for');
    if (!!p.writtenFor.STOCK !== hasOwn(p.lexicon, 'stock')) throw new Error('AYPlaces.add: "' + p.id + '" gives the words of a stock exactly when its rules have one (lexicon.stock, writtenFor.STOCK)');
    if ((p.writtenFor.CHARTER === 'breaks') !== hasOwn(p.lexicon, 'town')) throw new Error('AYPlaces.add: "' + p.id + '" gives the words of the town exactly when its charter breaks (lexicon.town, writtenFor.CHARTER)');
    PLACES.byId[p.id] = p;
    PLACES.order.push(p.id);
  };
  root.AYPlaces = PLACES;

  var IN_FORCE = null;                       // the place whose words are in force
  W.use = function (id) {
    if (typeof id !== 'string' || !hasOwn(PLACES.byId, id)) throw new Error('AYWords.use: no place "' + id + '" is registered');
    IN_FORCE = PLACES.byId[id];
  };
  // A string or a list of strings of the place in force (or of the registered place given):
  // 'reveal.both' in its lexicon, 'charter.seal' in its charter.
  function L(path, place) {
    place = place || IN_FORCE;
    if (!place) throw new Error('AYWords: no place is in force (AYWords.use)');
    var parts = path.split('.'), cur = place.lexicon, i = 0;
    if (parts[0] === 'charter') { cur = place.charter; i = 1; }
    for (; i < parts.length; i++) {
      if (cur === null || typeof cur !== 'object' || !hasOwn(cur, parts[i])) throw new Error('AYWords: the ' + place.id + ' words have no "' + path + '"');
      cur = cur[parts[i]];
    }
    if (typeof cur !== 'string' && !Array.isArray(cur)) throw new Error('AYWords: "' + path + '" of the ' + place.id + ' words is not a string or a list');
    return cur;
  }
  // A template's {slots} filled from o; what: where the template is from (for the error).
  function fillIn(t, o, what) {
    var out = t.replace(/\{([A-Za-z]+)\}/g, function (m, k) {
      if (!o || !hasOwn(o, k)) throw new Error('AYWords: nothing fills {' + k + '} in ' + what);
      return String(o[k]);
    });
    // a slot whose name is not a plain word ({cost_n}, {the level}) is not filled above: never shown raw
    if (/[{}]/.test(out)) throw new Error('AYWords: a slot left unfilled in ' + what + ': ' + out);
    return out;
  }
  // A template of the place in force (or of the registered place given) with its {slots} filled from o.
  function fill(path, o, place) {
    place = place || IN_FORCE;
    var t = L(path, place);
    if (typeof t !== 'string') throw new Error('AYWords: "' + path + '" of the ' + place.id + ' words is not a string');
    return fillIn(t, o, '"' + path + '" of the ' + place.id + ' words');
  }
  function placeOf(id) {
    if (typeof id !== 'string' || !hasOwn(PLACES.byId, id)) throw new Error('AYWords: no place "' + id + '" is registered');
    return PLACES.byId[id];
  }
  W.title = function (s) {
    var t = L('titles')[s];
    if (typeof t !== 'string') throw new Error('AYWords.title: no situation ' + s + ' in the ' + IN_FORCE.id + ' words');
    return t;
  };

  // ---- numbers ------------------------------------------------------------------------------

  function num(n) { return n < 0 ? MINUS + String(-n) : String(n); }
  function signed(n) { return n > 0 ? '+' + n : n < 0 ? MINUS + String(-n) : '0'; }
  function whole(x) { var r = Math.round(x); return r === 0 ? 0 : r; }   // no minus zero
  function times(n) { return n === 1 ? 'time' : 'times'; }
  function measures(n) { return n === 1 ? L('goods.one') : L('goods.many'); }
  function lowerFirst(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  var COUNT_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
                     'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  function countWord(n) { return n >= 1 && n <= 20 && n === Math.floor(n) ? COUNT_WORDS[n] : String(n); }
  function listWords(list) {               // "a", "a and b", "a, b and c"
    return list.length < 2 ? list.join('') : list.slice(0, list.length - 1).join(', ') + ' and ' + list[list.length - 1];
  }

  W.num = function (n) { return num(n); };
  W.signed = function (n) { return signed(n); };

  // ---- the rules in force, from the Life --------------------------------------------------------

  // The numbers every sentence about the stakes is made from, out of the Life's rules
  // (p = life.params): one tie on one day is worth B x level for their hand that arrives, costs C
  // for yours, and adds S when both arrive and takes H when neither does (engine header, PLACES).
  // level is the stock's starting level where the place has one, else 1. The four outcomes are
  // what one house gets: both arrived, only mine, only theirs, neither.
  // storeStart: what the store holds before day 1 (p.STORE_START; 0 in most places).
  W.stakes = function (p) {
    var lv = p.STOCK ? p.STOCK.start : 1, o = {
      B: p.B, C: p.C, S: p.S, H: p.H, level: lv, cost: p.C, worth: p.B * lv,
      both: p.B * lv - p.C + p.S, mine: -p.C, theirs: p.B * lv, neither: -p.H,
      storeStart: p.STORE_START || 0
    };
    if (p.STOCK) {
      o.start = p.STOCK.start; o.min = p.STOCK.min; o.max = p.STOCK.max;
      o.fall = -p.STOCK.delta[0]; o.fillOne = p.STOCK.delta[1]; o.fillBoth = p.STOCK.delta[2];
    }
    return o;
  };
  // The same as template slots: each number as the page prints it, and the goods named by the
  // cost and the worth ({cost} {costGoods}: "1 measure"). Each of the four outcomes also as a signed
  // number ({bothSigned}: "+7"), without its sign ({mineAbs}: "5") and with its goods named by that
  // ({neitherGoods}: "sacks"); the starting store with its goods ({storeStart} {storeStartGoods}).
  var OUTCOMES = ['both', 'mine', 'theirs', 'neither'];
  function stakeSlots(p) {
    var st = W.stakes(p), o = {}, k, i;
    for (k in st) o[k] = num(st[k]);
    o.costGoods = measures(st.cost); o.worthGoods = measures(st.worth);
    for (i = 0; i < OUTCOMES.length; i++) {
      k = OUTCOMES[i];
      o[k + 'Signed'] = signed(st[k]); o[k + 'Abs'] = String(Math.abs(st[k])); o[k + 'Goods'] = measures(Math.abs(st[k]));
    }
    o.storeStartGoods = measures(st.storeStart);
    return o;
  }
  // The slots of a sentence about one closed day on a tie: the stakes, and the day's own number.
  function daySlots(r, p) { var o = stakeSlots(p); o.number = signed(r.payoff); return o; }
  // The line a future must reach to count (p.HOLD_LINE), in words, by what the flow counts: a
  // level of the stock where the flow is the stock's mean level against its start, else a share
  // ("half", "3 in 10", "45 in 100").
  function lineWords(p) {
    var x = p.HOLD_LINE, t = x * 10;
    if (p.FLOW_KIND === 'stock') return String(Math.round(x * p.STOCK.start * 10) / 10);
    if (Math.abs(x - 0.5) < 1e-9) return 'half';
    if (Math.abs(t - Math.round(t)) < 1e-9) return Math.round(t) + ' in 10';
    return Math.round(x * 100) + ' in 100';
  }
  // One season's flow as the strip in words says it: a level of the stock, or a share in 100.
  function flowAmount(x, p) {
    if (p.FLOW_KIND === 'stock') return String(Math.round(x * p.STOCK.start * 10) / 10);
    return String(Math.min(100, Math.max(0, Math.round(x * 100))));
  }
  // The valley's words are frozen as published: where a function below words a number more exactly
  // than the valley's page did, the valley keeps its own wording.
  var FROZEN = { valley: true };
  // The last ten seasons' figure as the strip in words says it (future = runFuture()): as flowAmount
  // rounds it, unless that would put it on the other side of the line from the future's own count
  // (future.holds, against HOLD_LINE by the charter); then with as many more decimals as it takes, so
  // that a late mean of 6.977 against a line of 7 is said "6.98", never "7".
  function lateAmount(future, p) {
    var said = flowAmount(future.lateFlow, p), stock = p.FLOW_KIND === 'stock';
    if (FROZEN[IN_FORCE.id]) return said;
    var scale = stock ? p.STOCK.start : 100, line = Math.round(p.HOLD_LINE * scale * 1e9) / 1e9, x = future.lateFlow * scale, d, f, v;
    for (d = stock ? 1 : 0; d <= 4; d++) {
      f = Math.pow(10, d); v = Math.round(x * f) / f;
      if ((p.CHARTER === 'breaks' ? v < line : v >= line) === !!future.holds) return d === (stock ? 1 : 0) ? said : String(v);
    }
    return said;
  }
  // The slots of a sentence that names the line: {line}, and where the place has a stock, the level
  // its ties begin at ({start}).
  function lineSlots(p) {
    var o = { line: lineWords(p) };
    if (p.STOCK) o.start = num(p.STOCK.start);
    return o;
  }

  // ---- names --------------------------------------------------------------------------------

  W.house = function (name) { return fill('house', { name: name }); };
  W.House = function (name) { return fill('House', { name: name }); };
  W.kin = function (cap) { return cap ? L('Kin') : L('kin'); };
  W.who = function (name, isKin, cap) { return isKin ? W.kin(cap) : cap ? W.House(name) : W.house(name); };
  W.heir = function (cap) { return cap ? L('Heir') : L('heir'); };

  // ---- 3.1 opening --------------------------------------------------------------------------

  // p = life.params of a Life in the place in force: the stakes in the lines are the Life's.
  W.opening = function (p) {
    var slots = stakeSlots(p), lines = L('opening.lines'), out = [], i;
    for (i = 0; i < lines.length; i++) out.push(fillIn(lines[i], slots, 'line ' + (i + 1) + ' of the ' + IN_FORCE.id + ' opening'));
    return {
      title: 'After You',
      premise: L('opening.premise'),
      lines: out,
      begin: 'Begin'
    };
  };
  // The places, as the Opening offers them: a registered place's own name for itself (whichever
  // place's words are in force), and the group's name for a listener.
  W.placeName = function (id) { return L('name', placeOf(id)); };
  // The same place as its option is lettered for the eye: one short word, so that the five places
  // stand in one row of the Opening on a laptop (a lookup in the place's words, as title is).
  W.placeLabel = function (id) { return L('label', placeOf(id)); };
  W.placesHead = function () { return 'Where you live'; };
  W.otherPlace = function () { return 'Choose another place'; };
  W.pastHead = function () { return 'Earlier lives'; };
  // e: a stored life; its place (absent: the valley) names it, whichever place is in force.
  W.pastLife = function (e) {
    var s = fill('pastName', { seed: e.seed }, placeOf(e.place || 'valley')) + ': ' + (e.kept ? 'kept' : 'not kept') + ', ' + num(e.purse) + ' of ' + e.need +
            '. Mark ' + signed(whole(e.mark)) + '.';
    return e.seal ? s + ' Seal.' : s;
  };
  // The Opening lists the latest few lives; this names the control that holds the rest.
  W.pastMore = function (n) { return n + (n === 1 ? ' older life' : ' older lives'); };
  W.valleyNo = function (seed) { return fill('placeNo', { seed: seed }); };

  // ---- the map ------------------------------------------------------------------------------

  W.mapLabels = function () {
    return {
      ford: L('map.crossing'),
      ridge: L('map.farLine'),
      beyond: L('map.beyond'),
      yours: L('map.seat'),
      heir: L('map.heir'),
      sister: L('map.kin'),
      north: 'N'
    };
  };
  W.mapAlt = function (mode) {
    if (mode === 'after') return L('mapAlt.after');
    if (mode === 'sheet') return L('mapAlt.sheet');
    return L('mapAlt.day');
  };
  // What the day's map shows, in words. items: one per neighbour, in the engine's order:
  // { name, kin, plan (true | false | anything else while unchosen), result (an entry of
  // playDay().results once the day is closed, else null), arcs (how many of its five habits it
  // learned from you), keeps (it runs your ways as a whole) }.
  // phase: 'choose' | 'revealed' | 'season'.
  // p (life.params) where the place has a stock: each item then also carries bank, the level on
  // its tie ({ level } while choosing and at the season's end, { before, after } once revealed),
  // and the map's words say what its gauges show.
  W.mapAltDay = function (day, phase, items, p) {
    var out = [fill('mapAltDay.head', { when: phase === 'season' ? 'at the end of day ' + day : 'day ' + day })];
    var open = [], i, it, who, stock = !!(p && p.STOCK), levels = [];
    for (i = 0; i < items.length; i++) {
      it = items[i]; who = W.who(it.name, it.kin, false);
      if (phase === 'revealed' && it.result) {
        out.push(W.who(it.name, it.kin, true) + ': ' + lowerFirst(W.reveal(it.result, p).text) +
                 (stock && it.bank ? ' ' + W.bankDay(it.bank.before, it.bank.after, p, false).say : ''));
      } else if (phase === 'choose') {
        if (it.plan === true) out.push(fill('mapAltDay.plan', { who: who }));
        else if (it.plan === false) out.push(fill('mapAltDay.stay', { who: who }));
        else open.push(who);
      }
      if (stock && phase !== 'revealed' && it.bank) levels.push(fill('stock.with', { level: num(it.bank.level), who: who }));
    }
    if (open.length) out.push('Not yet chosen: ' + open.join(', ') + '.');
    if (levels.length) out.push(fill('stock.mapLevels', { levels: listWords(levels) }));
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
  W.bearingSay = function (i) { return fill('bearingSay', { bearing: W.bearing(i) }); };
  W.legendHead = function () { return 'Map key'; };
  W.legendDay = function () {
    return {
      arrived: L('legendDay.arrived'),
      turned: L('legendDay.lost'),
      planned: L('legendDay.planned'),
      home: L('legendDay.stay'),
      yours: 'learned from you: one arc for each situation',
      keeps: 'keeps your ways as a whole'
    };
  };
  W.legendAfter = function () {
    return {
      help: L('legendAfter.help'),
      income: L('legendAfter.income'),
      yours: 'keeps your ways',
      newcomer: L('newcomers')
    };
  };
  W.legendMarks = function () { return { held: L('charter.legendMarks.held'), fell: L('charter.legendMarks.fell') }; };
  // The underlined marks are the newest closed day's: yesterday's while today is being chosen,
  // today's once the day is closed. The dashed marks are today's choices before the day closes.
  W.legendWays = function () {
    return { sent: L('legendWays.sent'), stayed: L('legendWays.stayed'), yesterday: 'yesterday', today: 'today', planned: 'planned' };
  };
  W.mapHint = function () { return L('mapHint'); };
  // On a phone the day's map can be folded away; the button says what a press will do.
  W.mapFold = function (folded) { return folded ? 'Show the map' : 'Fold the map away'; };

  // ---- 3.2 the day --------------------------------------------------------------------------

  W.dayOf = function (day) { return 'Day ' + day + ' of 12'; };
  W.lastDayNote = function () { return 'The last day.'; };
  W.dayTrackAlt = function (day) { return 'Twelve days in three seasons of four. ' + W.dayOf(day) + '.'; };
  W.storeHead = function () { return L('storeHead'); };
  W.store = function (purse, need) { return num(purse) + ' of ' + num(need) + ' ' + measures(need); };
  W.storeNeedTick = function (need) { return 'need ' + need; };
  W.oldWay = function (oldWayPurse) {
    return fill('custom.gloss', { purse: num(oldWayPurse), goods: measures(oldWayPurse) });
  };

  W.cardName = function (n) {
    return n.kin ? [W.kin(true), W.House(n.name)] : [W.House(n.name)];
  };
  // p (life.params), where given, fills the stakes into the place's template ({theirsSigned} and the
  // like, and {number}: the day's own); a template with no slot reads the same either way.
  function dayKey(r) {
    if (r.lost) return r.they ? 'lostTheirs' : 'lostNone';
    return r.arrived && r.they ? 'both' : r.arrived ? 'mine' : r.they ? 'theirs' : 'neither';
  }
  W.yesterday = function (y, p) {
    if (!y) return 'You have not dealt with them yet.';
    return p ? fill('yesterday.' + dayKey(y), daySlots(y, p)) : L('yesterday.' + dayKey(y));
  };
  W.send = function () { return L('act.send'); };
  W.stay = function () { return L('act.stay'); };
  W.choiceLegend = function (n) { return 'Today, ' + L('toward') + ' ' + W.who(n.name, n.kin, false); };
  W.chooseLine = function () { return L('chooseLine'); };
  // The day again, in front of that line where the day's header has scrolled out of sight.
  W.statusDay = function (day) { return W.dayOf(day) + '.'; };

  W.knowHead = function () { return 'What you know of them'; };
  W.knowLabel = function (s) { return L('knowRows')[s]; };
  W.knowValue = function (h, n) { return n > 0 ? fill('knowValue', { h: h, n: n }) : 'not yet seen'; };
  W.knowFoot = function () {
    return 'Counted from their dealings with you and with others. The marked row is where they stand with you today.';
  };
  W.knowChanged = function (changedDay) {
    return 'They changed a way at the end of day ' + changedDay + '. Counted since then.';
  };

  W.closeDay = function (left) {
    if (left <= 0) return 'Close the day';
    if (left >= 4) return 'Choose for all 4 ' + L('actor.many');
    return 'Choose for ' + left + ' more ' + (left === 1 ? L('actor.one') : L('actor.many'));
  };
  W.nextDay = function (kind) {
    if (kind === 'season') return "Season's end";
    if (kind === 'leave') return 'Go on';
    return 'Next day';
  };

  // Each of the six sentences names one outcome (lostTheirs: theirs; lostNone: neither), so that the
  // number beside it is accounted for by the stakes the Opening states for that outcome.
  W.reveal = function (r, p) {
    var text = p ? fill('reveal.' + dayKey(r), daySlots(r, p)) : L('reveal.' + dayKey(r));
    var number = signed(r.payoff);
    return { text: text, number: number, full: text + ' ' + number };
  };
  W.dayTotal = function (gained, purse, need) {
    return 'Today: ' + signed(gained) + '. ' + W.storeHead() + ': ' + W.store(purse, need) + '.';
  };
  // The town (a place whose charter is inverted, p.CHARTER 'breaks': the Saltmarket). Where both acts
  // arrived on a tie (both prices held) each of the two gains S more, and the town pays it: 2 x S on
  // each such tie today. results = playDay().results. The words are the place's (lexicon.town): some
  // ({extra} {goods}, {pairs}: on how many ties) or none.
  W.dayTown = function (results, p) {
    if (!p || p.CHARTER !== 'breaks') throw new Error('AYWords.dayTown: the place in force has no town that pays (CHARTER breaks)');
    var pairs = 0, i;
    for (i = 0; i < results.length; i++) if (results[i].arrived && results[i].they) pairs++;
    var extra = 2 * p.S * pairs;
    if (extra <= 0) return L('town.none');
    return fill('town.some', { extra: num(extra), goods: measures(extra), pairs: countWord(pairs) });
  };

  // Why? ---------------------------------------------------------------------------------------

  W.whyLabel = function () { return 'Why?'; };
  W.whyBack = function () { return 'Turn the card back'; };
  W.whyHeads = function () { return { where: 'Where they stood', source: 'Where this way came from' }; };
  // Said (not shown) with the one Why? button that carries the mark.
  W.whyMarked = function () { return L('whyMarked'); };

  // What was known of them here before today's dealing. For a house that has changed a way the
  // count restarts at that change, as it does on the front of the card (since = { changedDay,
  // seen }). Once the day is closed the front counts today as well, so each wording says that
  // it stops short of today.
  function knewLine(seen, since) {
    if (since) {
      var lead = 'They changed a way at the end of day ' + since.changedDay + '. ', k = since.seen;
      if (!k || !k.n) return lead + 'Before today you had not seen them here since.';
      if (k.n === 1) return lead + (k.h ? L('knew.sinceOnceSent') : L('knew.sinceOnceNone'));
      return lead + fill('knew.sinceMany', { h: k.h, n: k.n });
    }
    if (!seen || !seen.n) return 'You had not seen them here before.';
    if (seen.n === 1) return seen.h ? L('knew.onceSent') : L('knew.onceNone');
    return fill('knew.many', { h: seen.h, n: seen.n });
  }
  // The engine hands over your deeds as they stood when the house learned from them (the end of
  // a season), so the count is dated: the panel of your ways beside it has usually moved on.
  function hereYou(sent, n) {
    if (n === 1) return sent ? L('hereYou.onceSent') : L('hereYou.onceStayed');
    return fill('hereYou.many', { h: sent, n: n });
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
    return fill(d.helped ? 'deed.sent' : 'deed.stayed', { day: d.day, who: W.who(d.toName, d.to === kinId, false), sit: L('deedSit')[situation] });
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
      lines.push(line(third ? L('even.third') : L('even.own'), 'even'));
    }
    return lines;
  }
  function sourceLines(why, name, kinId, third, since) {
    var src = why.source;
    if (src.type === 'you') return youLines(why, kinId, third);
    if (src.type === 'blank') return [line('They have never seen what you do here, so they kept their own way.', 'plain')];
    if (src.type === 'house') {
      if (src.far) return [line('They took this up from ' + L('actor.far') + '.', 'plain')];
      return [line('They took this up from ' + W.who(src.fromName, src.from === kinId, false) + '.', 'plain')];
    }
    return [line('This is ' + fill('way', { name: name }) + '. They did not learn it from you.', 'plain'), line(knewLine(why.seen, since), 'plain')];
  }

  // The reason on the back of a neighbour's card. r = one entry of playDay().results.
  // since: null, or for a house whose today().changedDay is set, { changedDay, seen } with
  // seen = today().seenSince[r.why.situation]: the tally the front of the card shows.
  W.why = function (r, kinId, since) {
    return {
      title: W.who(r.name, r.kin, true),
      where: L('whereThey')[r.why.situation],
      lines: sourceLines(r.why, r.name, kinId, false, since || null)
    };
  };
  // The same for kin's dealings with another neighbour. e = one entry of playDay().kinWith.
  W.whyThird = function (e, kinName, kinId) {
    var other = W.house(e.name);
    var where = fill('whereThird.' + e.why.situation, { other: other });
    return {
      title: W.kin(true) + ', ' + L('toward') + ' ' + other,
      where: where,
      lines: sourceLines(e.why, kinName, kinId, true, null)
    };
  };

  W.elsewhereHead = function () { return 'Elsewhere today'; };
  W.elsewhere = function (e) {
    var other = W.house(e.name), Other = W.House(e.name);
    if (e.kinSent && e.theySent) return fill('elsewhere.both', { Kin: W.kin(true), other: other });
    if (e.kinSent) return fill('elsewhere.kinSent', { Kin: W.kin(true), other: other });
    if (e.theySent) return fill('elsewhere.theySent', { Other: Other, kin: W.kin(false) });
    return fill('elsewhere.none', { Kin: W.kin(true), other: other });
  };

  // Your ways ---------------------------------------------------------------------------------

  W.waysHead = function () { return 'Your ways'; };
  W.wayCount = function (h, n) { return n > 0 ? fill('wayCount', { h: h, n: n }) : 'not yet tested'; };
  W.wayHere = function (title) { return 'Counts in your ways under: ' + title; };
  W.waysNote = function () { return L('waysNote'); };

  // Season's end ------------------------------------------------------------------------------

  W.kinFollows = function (count) {
    return W.kin(true) + ' follows your ways in ' + count + ' of 5 situations.';
  };
  // Entries under the sister's line, so no pronoun: the title names a situation of yours.
  function kinChange(title, h, n) {
    if (n === 1) {
      return title + ': now ' + (h ? L('act.sends') : L('act.stays')) + ', as you did the one time it came up.';
    }
    if (h === 0) return title + ': now ' + L('act.stays') + ', as you did ' + n + ' of ' + n + ' times.';
    if (h === n) return title + ': now ' + L('act.sends') + ', as you did ' + n + ' of ' + n + ' times.';
    return title + ': now ' + L('act.sends') + ' ' + h + ' of ' + n + ' times, as you did.';
  }
  // keeps: { houseId: bool }, the houses the map now marks as keeping your ways. A house that
  // took them up at second hand is told so, or "gives up your ways" later comes from nowhere.
  function reconsidered(e, kinId, keeps) {
    var who = W.who(e.name, e.house === kinId, true), second = !!(keeps && keeps[e.house]);
    if (e.adopted && e.took > 0) {
      if (e.model === 0) return who + ' took up your ways.';
      if (!e.modelVisible) return fill(second ? 'reconsidered.farSecond' : 'reconsidered.far', { who: who });
      if (e.model === kinId) return fill(second ? 'reconsidered.kinSecond' : 'reconsidered.kin', { who: who });
      return fill(second ? 'reconsidered.houseSecond' : 'reconsidered.house', { who: who, name: e.modelName });
    }
    if (e.changed) return fill('reconsidered.changed', { who: who });
    var model = e.model === 0 ? L('actor.yours')
              : !e.modelVisible ? L('actor.far')
              : W.who(e.modelName, e.model === kinId, false);
    return fill('reconsidered.kept', { who: who, model: model });
  }
  // lr = playDay().lookingRound; titles = the five situation titles (AYWords.title);
  // keeps = { houseId: bool } as the map marks the neighbours after this season's end (optional).
  W.seasonEnd = function (lr, kinId, titles, keeps) {
    var out = {
      head: L('seasonHeads')[lr.season - 1],
      intro: L('seasonIntro'),
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
    if (!out.houses.length && !lr.kin.changed) out.houses.push(L('seasonNone'));
    return out;
  };

  W.fordNote = function () { return L('luckNote'); };

  // The stock (a place whose rules have one, p.STOCK: the Banks' bank between two boats). Every
  // level is the Life's: today().neighbours[i].stock, results[i].stock and stockAfter, kinWith's,
  // runFuture().seasons[k].ties; its ends are p.STOCK.min and max, so each word is true at both
  // ends. Each returns { text, say }: text is the short caption beside the card's gauge, say the
  // sentence for a listener.
  function needStock(p, fn) { if (!p || !p.STOCK) throw new Error('AYWords.' + fn + ': the place in force has no stock'); }
  function bankWords(key, bank, level, p) {
    var o = { bank: bank, level: num(level), max: num(p.STOCK.max) };
    return { text: fill('stock.' + key + '.text', o), say: fill('stock.' + key + '.say', o) };
  }
  // The bank on one of your ties as it stands this morning.
  W.bankNow = function (level, p) {
    needStock(p, 'bankNow');
    var key = level >= p.STOCK.max ? 'full' : level <= p.STOCK.min ? 'spent' : 'holds';
    return bankWords(key, L('stock.you'), level, p);
  };
  // What the day did to a bank: before = the level the day was played on, after = after its change.
  // them: the bank between the sister's boat and another (kinWith), else yours.
  W.bankDay = function (before, after, p, them) {
    needStock(p, 'bankDay');
    var mx = p.STOCK.max, mn = p.STOCK.min, key;
    if (after > before) key = after >= mx ? 'fillsFull' : 'fills';
    else if (after < before) key = after <= mn ? 'fallsSpent' : 'falls';
    else key = after >= mx ? 'staysFull' : after <= mn ? 'staysSpent' : 'stays';
    return bankWords(key, L(them ? 'stock.them' : 'stock.you'), after, p);
  };
  // The sixteen banks as the watched future ends (seasons[29].ties), for a listener.
  W.banksAtEnd = function (levels, p) {
    needStock(p, 'banksAtEnd');
    var full = 0, spent = 0, i;
    for (i = 0; i < levels.length; i++) { if (levels[i] >= p.STOCK.max) full++; else if (levels[i] <= p.STOCK.min) spent++; }
    return fill('stock.atEnd', { ties: countWord(levels.length), full: full, spent: spent, between: levels.length - full - spent });
  };
  // The gauge in the map keys.
  W.legendGauge = function (p) { needStock(p, 'legendGauge'); return L('stock.legend'); };

  // ---- 3.3 leaving --------------------------------------------------------------------------

  W.leavingHead = function () { return L('leaving.head'); };
  W.leavingStore = function (purse, need) {
    var s = W.storeHead() + ': ' + W.store(purse, need) + '. ';
    if (purse >= need) return s + L('leaving.kept');
    var short = need - purse;
    return s + fill('leaving.short', { short: short, goods: measures(short) });
  };
  W.leaveHead = function () { return 'What you leave'; };
  W.leaveSub = function () { return L('leaving.sub'); };
  // What follows the way's title in "What you leave". heirHabit = legacy().heir[s]: what the
  // heir runs where the way was never tested.
  W.leaveNote = function (h, n, hollow, heirHabit) {
    if (hollow || !n) return fill('leaveNote.never', { does: heirHabit >= 0.5 ? L('act.sends') : L('act.stays') });
    return fill('leaveNote.tested', { h: h, n: n });
  };
  W.leaveButton = function () { return L('leaving.button'); };

  // ---- 3.4 the Afterwards -------------------------------------------------------------------

  W.afterHead = function () { return 'Thirty seasons without you.'; };
  W.oneFuture = function (futures) { return fill('oneFuture', { futures: futures }); };
  W.seasonCount = function (s) { return 'Season ' + s + ' of 30'; };
  W.tickerHead = function () { return 'As it happens'; };
  // p = life.params: the line on the strip and in its rule is the Life's HOLD_LINE ({line}).
  W.flowLabels = function (p) {
    var line = lineSlots(p);
    return {
      head: L('charter.flow.head'),
      half: fill('charter.flow.half', line),
      late: 'last ten seasons',
      rule: fill('charter.flow.rule', line)
    };
  };
  // The strip in words, for a reader who cannot see it. Its lowest season is the lowest flow,
  // whichever side of the line is the place's good one (life.params.CHARTER): under 'breaks' the
  // lowest season is the town's best, and the place's template says so. Slots: {first}, {low} in
  // season {lowSeason}, {high} in season {highSeason}, {late} (the last ten seasons), {stretch} (the
  // lowest five seasons running, runFuture().worstStretch: the worst stretch where the place holds,
  // the best one where it is better off when the flow fails), {line}.
  W.flowAlt = function (future, p) {
    var s = future.seasons, low = 0, high = 0, i;
    for (i = 1; i < s.length; i++) { if (s[i].flow < s[low].flow) low = i; if (s[i].flow > s[high].flow) high = i; }
    var o = lineSlots(p);
    o.first = flowAmount(s[0].flow, p); o.low = flowAmount(s[low].flow, p); o.lowSeason = s[low].season; o.late = lateAmount(future, p);
    o.high = flowAmount(s[high].flow, p); o.highSeason = s[high].season;
    o.stretch = flowAmount(typeof future.worstStretch === 'number' ? future.worstStretch : s[low].flow, p);
    return fill('charter.flowAlt', o);
  };
  // One holding as the resting map shows it. who: the house, named for the start of a sentence;
  // hands: how many of its 16 hands got through in the last season.
  W.houseAtEnd = function (who, income, hands, keepsYours, isNew) {
    return fill('houseAtEnd', { who: who, income: num(income), goods: measures(income), hands: hands }) +
           (keepsYours ? ', keeps your ways' : '') + (isNew ? ', ' + L('newcomers') : '') + '.';
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
          if (ev.house === kinId) { text = fill('arrival.kin', { house: W.house(ev.name) }); yours = true; }
          else text = fill('arrival.house', { house: W.house(ev.name), replaced: ev.replaced });
        } else if (ev.type === 'adopt') {
          if (!ev.changed) continue;
          var fromYours = isYours(ev.from, kinId), toYours = isYours(ev.way, kinId);
          if (fromYours && toYours) continue;
          var isHeir = ev.adopter === 0, isKin = ev.adopter === kinId && !kinGone;
          var who = isHeir ? W.heir(false) : isKin ? W.kin(false) : W.house(ev.adopterName);
          var target = toYours ? 'your ways' : fill('way', { name: ev.wayName });
          // a house that returns to the way it began with: from yours it "goes back to its own"
          // (not "gives up your ways for the Yarrow way again"), from another's it "goes back to its own way"
          var back = !toYours && !isHeir && !isKin && ev.wayName === ev.adopterName;
          if (back && fromYours) text = fill('adopt.backFromYours', { who: who });
          else if (back) text = fill('adopt.back', { who: who });
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
    if (future.holds) return near ? L('charter.futureEnd.heldBarely') : L('charter.futureEnd.held');
    return near ? L('charter.futureEnd.fellBarely') : L('charter.futureEnd.fell');
  };
  W.waysEnd = function (future) {
    if (!future.yourWaysLastSeason) return L('waysEnd.never');
    var n = future.yourWaysAtEnd;
    if (n > 0) return fill(n === 1 ? 'waysEnd.one' : 'waysEnd.many', { n: n });
    return fill('waysEnd.gone', { season: future.yourWaysLastSeason });
  };

  // ---- 3.5 the Chronicle --------------------------------------------------------------------

  W.chronicleHead = function () { return 'The Chronicle'; };
  W.heads = function () {
    return {
      house: L('heads.house'),
      valley: L('heads.place'),
      range: 'Where that sits',
      lastDay: 'The last day',
      mattered: 'The way that mattered most',
      became: 'What became of your ways',
      becameSub: 'In the future you watched',
      afterword: 'Afterword'
    };
  };
  W.houseLine = function (v) {
    return (v.houseKept ? 'Kept: ' : 'Not kept: ') + W.store(v.purse, v.need) + '.';
  };
  W.valleyLine = function (v) {
    return fill('charter.placeLine', { holds: v.holds, futures: v.futures, base: v.baseline.holds });
  };
  W.markNumber = function (v) { return signed(whole(v.mark)); };
  W.markLine = function (v) { return 'Your mark: ' + W.markNumber(v) + '.'; };
  // What the mark is: the gap between the two counts just given, and its size in every hundred.
  W.markMeans = function (v) {
    var d = v.holds - v.baseline.holds, a = Math.abs(d), m = Math.abs(whole(v.mark));
    if (d === 0) return 'The two counts are the same.';
    return fill('charter.markMeans', { gap: a, more: d > 0 ? 'more' : 'fewer', futures: a === 1 ? 'future' : 'futures',
                                       size: m === 0 ? 'less than 1' : 'about ' + m });
  };
  W.markNoise = function (v) {
    if (v.markSE === 0 && whole(v.mark) === 0) return 'The two rows are the same in every future counted.';
    var k = Math.max(1, Math.ceil(2 * v.markSE));
    return 'A different ' + v.futures + ' futures would move the mark by about ' + k + ' ' +
           (k === 1 ? 'point' : 'points') + ' either way.';
  };
  W.rowLabels = function () { return { you: 'With you', old: L('custom.Name') }; };
  W.rowsCaption = function (v) {
    return fill('rowsCaption', { first: Math.min(200, v.held.length), futures: v.futures });
  };
  // One row of marks in words. held: how many of its first n marks are held.
  W.rowAlt = function (label, held, n) { return fill('charter.rowAlt', { label: label, held: held, n: n }); };
  // p = life.params: the rule names the Life's HOLD_LINE.
  W.rowsExplain = function (v, p) {
    return [
      fill('rowsExplain', { futures: v.futures }),
      fill('charter.rowRule', lineSlots(p))
    ];
  };
  // The plain ways are counted as the engine counts them (range.of), never as a fixed thirteen.
  W.rangeLine = function (v) {
    return fill('charter.rangeLine', { of: countWord(v.range.of), best: whole(v.range.bestPct), futures: v.whatIfFutures, worst: whole(v.range.worstPct) });
  };
  // Why a marker can lie outside the plain ways: they are counted on fewer futures, and the old
  // way's marker is a house that also lived the twelve days the old way.
  W.rangeNote = function (v) {
    var rg = v.range, s = fill('rangeNote', { of: countWord(rg.of) });
    if (rg.inside && (v.holdsPct < rg.worstPct || v.holdsPct > rg.bestPct)) {
      s += ' ' + fill('charter.rangeYours', { pct: whole(rg.yourPct) });
    }
    return s;
  };
  W.rangeLabels = function (v) {
    return {
      you: 'You ' + whole(v.holdsPct) + '%',
      old: L('custom.Name') + ' ' + whole(v.baselinePct) + '%',
      worst: 'worst ' + whole(v.range.worstPct) + '%',
      best: 'best ' + whole(v.range.bestPct) + '%',
      axis: L('charter.rangeAxis')
    };
  };
  function listHouses(changed, kinId) {
    var names = [], i;
    for (i = 0; i < changed.length; i++) names.push(W.who(changed[i].name, changed[i].id === kinId, false));
    if (names.length === 1) return names[0];
    return names.slice(0, names.length - 1).join(', ') + ' and ' + names[names.length - 1];
  }
  // The acts on the reversed ties, as lived (which: 'lived') or as replayed ('replayed'): each tie
  // is told by its own act (true = sent), the houses of one act together, in the engine's order. The
  // replayed acts follow "Had you": the place gives that form of each act (lastAct.hadSent, hadStayed),
  // which is the same words where its verbs' past and participle are one ("stayed home", "held").
  function lastActs(changed, which, kinId) {
    var groups = [], byAct = {}, i, k, out = [], many = false;
    for (i = 0; i < changed.length; i++) {
      k = changed[i][which] ? 'sent' : 'stayed';
      if (which === 'replayed') k = k === 'sent' ? 'hadSent' : 'hadStayed';
      if (!byAct[k]) { byAct[k] = []; groups.push(k); }
      byAct[k].push(changed[i]);
    }
    for (i = 0; i < groups.length; i++) {
      out.push(fill('lastAct.' + groups[i], { houses: listHouses(byAct[groups[i]], kinId) }));
      if (byAct[groups[i]].length > 1) many = true;
    }
    return out.join(many ? ', and ' : ' and ');
  }
  // v.lastDay.rule 'habit' (REPLAY 'habit', and 'season', whose last-day entry is the same): the
  // replay turned every day-12 act that went against the house's habit, in either direction, so
  // the sentence takes each tie's act from lived and replayed. Otherwise the valley's replay: a
  // hand sent to each neighbour you stayed home against after hands had gone both ways.
  W.lastDayLine = function (v, kinId) {
    var ld = v.lastDay, many = ld.changed.length > 1;
    var slots = { holds: ld.holds, futures: ld.futures, base: v.whatIfBaseHolds, store: W.store(ld.purse, v.need) };
    if (ld.rule === 'habit') {
      slots.lived = lastActs(ld.changed, 'lived', kinId);
      slots.replayed = lastActs(ld.changed, 'replayed', kinId);
      return fill('charter.lastDayHabit', slots);
    }
    slots.houses = listHouses(ld.changed, kinId);
    return fill(many ? 'charter.lastDay.many' : 'charter.lastDay.one', slots);
  };
  W.seal = function () { return L('charter.seal'); };
  // A seal withheld by the season replay (REPLAY 'season': v.seal.wonOnSeason, the mark clear only by
  // what the house did in the last season apart from the ways it had before it): one plain line in the
  // place's words (lexicon.lastSeason) that there is no seal and why, asked for only where the seal
  // would otherwise have been earned (the house kept, the mark clear, no last-day clause withholding it).
  // The season entry's own numbers are never shown. It throws for any other verdict, and in a place
  // without these words.
  function sealOnlyBySeason(s) {
    return !!(s && s.wonOnSeason && s.houseKept && s.markClear && !s.boughtOnLastDay && !s.lastDayCost && !s.wonOnLastDay);
  }
  W.seasonRests = function (v) {
    if (!v || !sealOnlyBySeason(v.seal)) throw new Error('AYWords.seasonRests: the seal was not withheld by the season replay alone');
    return L('lastSeason.rests');
  };
  // titles = the five situation titles (AYWords.title).
  W.mattered = function (v, titles) {
    var m = v.mattered;
    if (!m) return L('mattered.none');
    if (m.kind === 'lastDay') return 'Of your five ways and the last day, the last day weighed most.';
    // The engine's two what-ifs are one more precedent each way: h+1 of n+1, and h of n+1. Where
    // you always did the one thing, one more of it changes nothing and is left out.
    var s = m.situation, f = v.whatIfFutures, more = m.h < m.n, less = m.h > 0;
    var out = fill('mattered.count', { title: titles[s], h: m.h, n: m.n, times: times(m.n) });
    if (more) out += ' ' + fill('charter.mattered.more', { holds: v.whatIfs[2 * s].holds, futures: f });
    if (less) out += ' ' + fill(more ? 'charter.mattered.lessShort' : 'charter.mattered.lessLong', { holds: v.whatIfs[2 * s + 1].holds, futures: f });
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
  W.againSame = function () { return L('againSame'); };
  // The Chronicle's last block: one short paragraph of the place in force, a parallel in the world.
  W.afterword = function () {
    if (!IN_FORCE) throw new Error('AYWords: no place is in force (AYWords.use)');
    return IN_FORCE.afterword;
  };

  root.AYWords = W;
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
