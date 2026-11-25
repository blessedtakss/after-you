/*
 * After You: the page. Plain JavaScript, no frameworks, no build step.
 * Rules come from engine.js (AfterYou), every sentence from words.js (AYWords), the place's
 * own data from places/<id>.js (AYPlaces), and every map and small drawing from sheet.js
 * (AYSheet) as inline SVG; its colours come from the CSS tokens through classes, so a change of
 * theme needs no redraw.
 *
 * A Life is rebuildable from state.place, state.seed and state.choices (see restore()).
 *
 * Places. The Opening offers the places this page has the words for (AYPlaces), in the engine's
 * play order (AfterYou.PLACE_ORDER), as one radio group; it is shown only when there are two or
 * more. Choosing one puts it in hand: its words in force (AYWords.use), the copy at rest written
 * again (fillStatic), the Opening drawn again. Every number that states a rule is read from a Life
 * of the place in hand (life.params, today(), playDay(), the verdict), never typed in here. The place in
 * hand is marked on the root (data-place) for its colours. Where its rules have a stock (the Banks)
 * every tie carries a level: drawn as a gauge on each card's head (with words for a listener), on the
 * sheets' crossings and, in the Afterwards, on all sixteen ties (bankNode, levelsOf, drawBanks30).
 * Where the stakes have a share when both acts arrive and a loss when neither does (S, H), the day's
 * sentences are asked with the Life's rules, which fill the stakes into the place's words. A store can
 * run below zero (a starting store, STORE_START, can stand in it from day 1): the meter then draws the
 * part below zero hatched, to the left of a zero mark (meterInto). Where the charter is inverted
 * (CHARTER 'breaks': the town is better off when the ring of ties breaks) the day's total is followed by
 * what the town paid for the ring today (townOf, AYWords.dayTown), and the strip's good side is under
 * its line (flowSide).
 */
(function () {
  'use strict';

  var A = window.AfterYou, W = window.AYWords, S = window.AYSheet, P = window.AYPlaces;
  var ORDER = [1, 2, 6, 7];                 // the engine's order of the four neighbours
  var MIRROR = [0, 1, 3, 2, 4];             // my situation on a tie -> theirs
  var SEASON_MS = 660;                      // thirty seasons in about twenty seconds
  var SETTLE_MS = 350;                      // what has just appeared stands this long before its button takes a click
  var STORE_KEY = 'after-you.lives.v1';
  var KEEP_LIVES = 60;                      // stored lives, every place together, newest first

  var state = {
    view: 'opening',
    viewAt: 0,             // when the view on screen was shown by the reader's own step (see fresh)
    place: 'valley',       // the place in hand: a key of AYPlaces and of AfterYou.PLACES; its words are in force
    seed: null,            // valley number of the Life in progress
    hash: null,            // { place, seed } from #<place>-<seed> (seed null for #<place>), or null (see readHash)
    fixedSeed: null,       // the hash's seed while the hash's place is in hand
    life: null,            // the engine's Life (rebuildable from seed + choices)
    choices: [],           // closed days, each [bool x 4] in the order [1, 2, 6, 7]
    pending: {},           // today's choices so far: { houseId: bool }
    phase: 'choose',       // within the day view: 'choose' | 'revealed' | 'season'
    phaseAt: 0,            // when the day was closed or its season's end opened (see nextDay)
    today: null,           // today() as it stood before the day was closed
    todayAfter: null,      // today() once the day is closed: what was seen today is in its tallies
    mapFolded: false,      // a phone can fold the day's map away; the fold lasts the Life
    result: null,          // playDay() of the day just closed
    follow: null,          // { houseId: [bool x 5] } habits learned from you, as the map shows them
    keeps: null,           // { houseId: bool } neighbours running your ways, as the map shows them
    flipped: {},           // cards turned over
    thirdOpen: {},         // "elsewhere" reasons opened
    knowOpen: {},          // "What you know of them": sections the reader opened or closed by hand
    youMark: null,         // { day, key }: where a habit learned from you first showed
    hot: null,             // neighbour under the pointer or focus
    future: null,          // runFuture(life, 0), the watched future
    after: null,           // the Afterwards as it plays: { t0, shown, done, lines, upTo }
    job: null,             // verdictJob(life)
    verdict: null,         // its result
    scaleAt: null,         // where the Chronicle's scale puts its four marks, in percent
    saved: false,          // this Life is in the list of earlier lives
    lives: []              // earlier lives, newest first
  };
  window.AYApp = { state: state };

  // ---- small helpers ------------------------------------------------------------------------

  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, kids) {
    var node = document.createElement(tag), k, i, v;
    if (attrs) {
      for (k in attrs) {
        v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;          // only SVG strings built by sheet.js and this file
        else if (k === 'hidden') node.hidden = true;
        else if (k === 'disabled') node.disabled = true;
        else if (k === 'checked') node.checked = true;
        else node.setAttribute(k, v === true ? '' : String(v));
      }
    }
    if (kids) for (i = 0; i < kids.length; i++) if (kids[i]) node.appendChild(kids[i]);
    return node;
  }
  function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function setText(id, text) { var n = $(id); if (n) n.textContent = text; }
  // Text that stands in the display face: a plus or minus before a digit goes into a span that
  // the style sheet sets in the text face (the display face draws its minus as long as a dash).
  function signedInto(node, text) {
    var parts = String(text).split(/([+\u2212])(?=\d)/), i;
    if (!node) return;
    clear(node);
    for (i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      if (i % 2) node.appendChild(el('span', { class: 'sign', text: parts[i] }));
      else node.appendChild(document.createTextNode(parts[i]));
    }
  }
  function now() { return window.performance && performance.now ? performance.now() : Date.now(); }
  function clamp(x, lo, hi) { return x < lo ? lo : x > hi ? hi : x; }
  function media(q) {
    var m = window.matchMedia ? window.matchMedia(q) : null;
    return m || { matches: false, addEventListener: function () {} };
  }
  function onMedia(m, fn) {
    if (m.addEventListener) m.addEventListener('change', fn);
    else if (m.addListener) m.addListener(fn);
  }
  var mqCompact = media('(max-width: 36rem)');          // the map goes compact (used where its box cannot be measured)
  var mqWide = media('(min-width: 40rem)');             // cards two by two: the day map's key stays open
  var mqShort = media('(max-height: 45rem)');            // a short window: the day map's key starts folded
  var mqRoomy = media('(min-width: 40rem) and (min-height: 66rem)');   // and height to spare: "What you know" stays open
  var mqTwo = media('(min-width: 62rem)');              // the day in two columns
  var mqStill = media('(prefers-reduced-motion: reduce)');

  // ---- timers: every pending one is cancelled when the view changes or a Life starts ---------

  var timeouts = [], intervals = [];
  function later(fn, ms) {
    var id = setTimeout(function () {
      var i = timeouts.indexOf(id);
      if (i >= 0) timeouts.splice(i, 1);
      fn();
    }, ms);
    timeouts.push(id);
    return id;
  }
  function every(fn, ms) { var id = setInterval(fn, ms); intervals.push(id); return id; }
  function cancelTimers() {
    var i;
    for (i = 0; i < timeouts.length; i++) clearTimeout(timeouts[i]);
    for (i = 0; i < intervals.length; i++) clearInterval(intervals[i]);
    timeouts = []; intervals = [];
  }

  // ---- views --------------------------------------------------------------------------------

  var HEADS = { opening: 'h-opening', day: 'h-day', leaving: 'h-leaving', afterwards: 'h-after', chronicle: 'h-chronicle' };
  function focusOn(node) {
    if (!node || !node.focus) return;
    try { node.focus({ preventScroll: true }); } catch (e) { node.focus(); }
  }
  function toTop() { try { window.scrollTo(0, 0); } catch (e) { /* no window to scroll */ } }
  function bringUp(node) {                       // put a node at the top of the window
    if (!node || !node.scrollIntoView) { toTop(); return; }
    try { node.scrollIntoView({ block: 'start' }); } catch (e) { toTop(); }
  }
  function bringNear(node) {                     // scroll only as far as it takes to have the node in the window
    if (!node || !node.scrollIntoView) return;
    try { node.scrollIntoView({ block: 'nearest' }); } catch (e) { /* older engines */ }
  }
  function pageHidden() {                        // the page is not in front: its timers are held to about one a second
    try { return !!document.hidden; } catch (e) { return false; }
  }
  // True for a moment after a view opens: the second click of a double click on the button that
  // opened it must not reach a button that now lies under the pointer ("See the count" would
  // otherwise pass straight through the Chronicle into a new Life).
  function fresh() { return now() - state.viewAt < SETTLE_MS; }
  function showView(name, quiet) {
    cancelTimers();
    state.view = name;
    state.viewAt = quiet ? 0 : now();
    var nodes = document.querySelectorAll('[data-view]'), i;
    for (i = 0; i < nodes.length; i++) nodes[i].hidden = nodes[i].getAttribute('data-view') !== name;
    if ($('h-app')) $('h-app').hidden = name === 'opening';      // the opening shows the page's h1 itself
    refitMap();                                  // the view's map can now be measured
    if (!quiet) { toTop(); focusOn($(HEADS[name])); }
  }

  // ---- earlier lives (localStorage, optional) -----------------------------------------------
  // Each stored life names its place (an entry stored before there were places has none: the
  // valley). One list for every place, up to KEEP_LIVES; the Opening and the Chronicle list the
  // lives of the place in hand only. A life of a place this page has no words for stays in the
  // store and is never listed.

  function okNum(x) { return typeof x === 'number' && isFinite(x); }
  function loadLives() {
    var out = [], raw, list, i, e;
    try {
      raw = window.localStorage.getItem(STORE_KEY);
      list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      for (i = 0; i < list.length && out.length < KEEP_LIVES; i++) {
        e = list[i];
        if (!e || typeof e !== 'object' || !okNum(e.seed) || !okNum(e.purse) || !okNum(e.need) || !(e.need > 0) || !okNum(e.mark)) continue;
        if (e.place !== undefined && (typeof e.place !== 'string' || !/^[a-z]+$/.test(e.place))) continue;
        out.push({ place: e.place === undefined ? 'valley' : e.place, seed: e.seed, kept: !!e.kept, purse: e.purse, need: e.need, mark: e.mark, seal: !!e.seal });
      }
    } catch (err) { out = []; }
    return out;
  }
  function saveLife(entry) {
    state.lives.unshift(entry);
    if (state.lives.length > KEEP_LIVES) state.lives.length = KEEP_LIVES;
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state.lives)); } catch (err) { /* storage unavailable: the list lives in memory */ }
  }
  function livesHere() { return state.lives.filter(function (e) { return e.place === state.place; }); }
  // limit: how many to list, newest first (all of them where none is given). Returns that number.
  var PAST_IN_CHRONICLE = 20;                   // the Chronicle lists the newest twenty, as many as the first page ever kept
  function drawPast(boxId, listId, limit) {
    var box = $(boxId), list = $(listId), lives = livesHere(), n = lives.length, shown = limit ? Math.min(limit, n) : n, i;
    clear(list);
    for (i = 0; i < shown; i++) list.appendChild(el('li', { text: W.pastLife(lives[i]) }));
    box.hidden = !n;
    return shown;
  }
  // The Opening is complete at rest on a laptop, so it lists the latest three lives (two where
  // the choice of places takes a row of the Opening) and keeps the older ones behind their count
  // (the Chronicle lists them all). A single older life is listed outright: a control that holds
  // one line saves none.
  var PAST_SHOWN = 3, PAST_SHOWN_CHOOSING = 2;
  function drawOpeningPast() {
    var more = $('opening-past-more'), rest = $('opening-past-rest'), lives = livesHere(), n = lives.length, i;
    var most = choosing() ? PAST_SHOWN_CHOOSING : PAST_SHOWN;
    var shown = drawPast('opening-past', 'opening-past-list', n > most + 1 ? most : n);
    clear(rest);
    for (i = shown; i < n; i++) rest.appendChild(el('li', { text: W.pastLife(lives[i]) }));
    more.open = false;
    more.hidden = n <= shown;
    if (n > shown) setText('opening-past-more-head', W.pastMore(n - shown));
  }

  // ---- places -------------------------------------------------------------------------------

  // The places the Opening offers: the engine's play order, those this page has the words for.
  function placesHere() {
    var out = [], i;
    for (i = 0; i < A.PLACE_ORDER.length; i++) if (hasOwn(P.byId, A.PLACE_ORDER[i])) out.push(A.PLACE_ORDER[i]);
    return out;
  }
  function choosing() { return placesHere().length > 1; }      // the choice, and the way back to it, show only then
  // The rules of the place in hand, from a Life of it (every seed has the same rules): what the
  // Opening and the copy at rest state before any Life is begun.
  var rulesOf = {};
  function placeParams() {
    if (!rulesOf[state.place]) rulesOf[state.place] = A.createLife(1, state.place).params;
    return rulesOf[state.place];
  }
  // Put a place in hand: its words in force, the copy at rest written again in them, and the
  // hash's seed fixed if the hash names this place. A hash that names another place is written over
  // with this one's (#<place>, no seed): the address never names a place other than the one in hand.
  function setPlace(id) {
    state.place = id;
    W.use(id);
    markPlace();
    fillStatic();
    if (state.hash && state.hash.place !== id) writeHash(id);
    fixFromHash();
  }
  // The style sheet's colours follow the place in hand: its token blocks are chosen by this mark.
  function markPlace() {
    try { document.documentElement.setAttribute('data-place', state.place); } catch (e) { /* no page to mark */ }
  }
  // The stock of the place in hand (its rules' STOCK), or null: where there is one, every tie carries
  // a level, drawn as a gauge (sheet.js) and said by AYWords.bankNow and bankDay.
  function stockOf(p) { return p && p.STOCK ? p.STOCK : null; }
  // Whether the town pays for the ring of the place in hand (its charter is inverted: CHARTER 'breaks').
  function townOf(p) { return !!(p && p.CHARTER === 'breaks'); }
  function fixFromHash() { state.fixedSeed = state.hash && state.hash.place === state.place ? state.hash.seed : null; }

  // ---- the sheet ----------------------------------------------------------------------------
  // Every map is drawn by sheet.js (AYSheet) from the sheet definition of the place in hand.

  function sheetDef() { return P.byId[state.place].sheet; }

  // Which sheet a map is drawn on follows the width of its own box, not of the window: in the
  // two-column day the map has well under half the window. Where the box cannot be measured
  // (its view is hidden) the window decides, and refitMap() corrects it once the view shows.
  var MAP_OF = { opening: 'map-opening', day: 'map-day', leaving: 'map-leaving', afterwards: 'map-after' };
  var mapKinds = {};                             // map id -> the sheet it was last drawn on
  var mapUps = {};                               // map id -> how much its lettering was enlarged then
  function remPx() {
    var v = 16;
    try { v = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16; } catch (e) { v = 16; }
    return v;
  }
  function sheetFor(node) {
    var w = node && node.clientWidth ? node.clientWidth : 0;
    if (w > 0) return w < 34 * remPx() ? 'compact' : 'wide';
    return mqCompact.matches ? 'compact' : 'wide';
  }
  function boxWidth(node) { return node && node.clientWidth ? node.clientWidth : 0; }
  // Draw a map into its box, on the sheet and with the lettering that the box's width asks for.
  function drawMap(id, mode, o) {
    var node = $(id), kind = sheetFor(node);
    mapKinds[id] = kind;
    mapUps[id] = S.letterUp(kind, boxWidth(node));
    o.up = mapUps[id];
    node.innerHTML = S.map(sheetDef(), kind, mode, o);
  }
  // The Opening's one hand: what it costs you and what it is worth where it arrives, by the rules
  // of the place in hand.
  function drawOpeningMap() {
    var p = placeParams(), st = W.stakes(p), o = { demo: [st.mine, st.theirs] }, k = stockOf(p);
    if (k) o.gauge = { top: k.max, levels: { 1: k.start, 2: k.start, 6: k.start, 7: k.start } };     // every bank as it begins
    drawMap('map-opening', 'sheet', o);
  }
  // The levels on your four ties, by house, from today() (or a closed day's results: after).
  function levelsOf(neighbours, results) {
    var out = {}, i;
    for (i = 0; i < neighbours.length; i++) out[neighbours[i].id] = results ? results[i].stockAfter : neighbours[i].stock;
    return out;
  }
  function drawLeavingMap() {
    var o = { names: names(), kin: state.life.kin, follow: state.follow, keeps: state.keeps }, k = stockOf(state.life.params);
    if (k) {                                     // the banks as you leave them, drawn and said
      var nbs = A.today(state.life).neighbours;
      o.gauge = { top: k.max, levels: levelsOf(nbs, null) };
      o.alt = W.mapAltDay(state.choices.length, 'season', nbs.map(function (nb) {     // as the day's map is said, at the end of the last day closed
        var arcs = 0, q, fl = state.follow && state.follow[nb.id];
        for (q = 0; fl && q < 5; q++) if (fl[q]) arcs++;
        return { name: nb.name, kin: nb.kin, plan: null, result: null, arcs: arcs, keeps: !!(state.keeps && state.keeps[nb.id]), bank: { level: nb.stock } };
      }), state.life.params);
    }
    drawMap('map-leaving', 'leaving', o);
  }
  function drawAfterMap() {
    var a = state.after, k = stockOf(state.life.params);
    drawMap('map-after', 'after', k ? { kin: state.life.kin, gauge: { top: k.max } } : { kin: state.life.kin });
    if (a && a.shown > 0) drawSeason30(a.shown);
    if (a && a.done) drawFinalWays();
  }
  function drawViewMap() {                       // the map of the view on screen, again
    if (state.view === 'opening') { drawOpeningMap(); return; }
    if (!state.life) return;
    if (state.view === 'day') drawDayMap();
    else if (state.view === 'leaving') drawLeavingMap();
    else if (state.view === 'afterwards' && state.after) drawAfterMap();
  }
  function refitMap() {                          // after a view shows or the window changes size
    var id = MAP_OF[state.view], node = id ? $(id) : null, kind;
    if (!node || !(node.clientWidth > 0)) return;
    kind = sheetFor(node);
    if (kind === mapKinds[id] && S.letterUp(kind, boxWidth(node)) === mapUps[id]) return;
    drawViewMap();
  }

  // ---- drawn keys ---------------------------------------------------------------------------

  function legendInto(node, items, withHead) {
    clear(node);
    if (withHead) node.appendChild(el('span', { class: 'legend-head', text: W.legendHead() }));
    for (var i = 0; i < items.length; i++) {
      node.appendChild(el('span', { class: 'legend-item' + (items[i][2] ? ' ' + items[i][2] : '') }, [
        items[i][0] ? el('span', { html: S.key(sheetDef(), items[i][0], items[i][3]) }) : null,
        el('span', { text: items[i][1] })
      ]));
    }
  }

  // ---- shared pieces: the store meter, a row of your ways -----------------------------------

  // The store against the need. The scale runs from zero (or, for a store below zero, from the next
  // ten below it) to a little past the need or the store; a tick every ten. A store above zero fills
  // from zero; a store below zero is drawn hatched from the zero mark leftward (form, not colour), so
  // that the bar reads true at both ends. The need is always above zero (the engine's).
  function meterInto(node, purse, need) {
    clear(node);
    var lo = purse < 0 ? -10 * Math.ceil((3 - purse) / 10) : 0, t;
    var max = Math.max(need + Math.max(6, Math.round(need * 0.12)), purse + 3), span = max - lo;
    function at(x) { return ((x - lo) / span * 100).toFixed(2) + '%'; }
    var bar = el('div', { class: 'meter-bar' });
    if (lo < 0) {
      bar.appendChild(el('span', { class: 'meter-fill is-below', style: 'left:' + at(purse) + ';width:' + ((0 - purse) / span * 100).toFixed(2) + '%' }));
      bar.appendChild(el('span', { class: 'meter-zero', style: 'left:' + at(0) }));
    } else bar.appendChild(el('span', { class: 'meter-fill', style: 'width:' + (clamp(purse, 0, max) / max * 100).toFixed(2) + '%' }));
    for (t = lo + 10; t < max; t += 10) {
      if (t === 0) continue;                       // the zero mark stands there
      bar.appendChild(el('span', { class: 'meter-ten' + (t >= purse ? ' is-beyond' : ''), style: 'left:' + (lo < 0 ? at(t) : (t / max * 100).toFixed(2) + '%') }));
    }
    node.appendChild(bar);
    node.appendChild(el('span', { class: 'meter-need' + (purse >= need ? ' is-met' : ''), style: 'left:' + (lo < 0 ? at(need) : (need / max * 100).toFixed(2) + '%') },
      [el('span', { text: W.storeNeedTick(need) })]));
  }
  // The five situations in the place's own words (the engine's titles are not shown).
  function titles() { var out = [], s; for (s = 0; s < 5; s++) out.push(W.title(s)); return out; }
  // way: one entry of ways(); o: { newDay, ghosts, hot, note, hollow }
  function wayRow(way, o) {
    var kin = state.life.kin, marks = el('span', { class: 'way-marks', 'aria-hidden': 'true' }), i, d, cls, prev = null, said = [];
    for (i = 0; i < way.deeds.length; i++) {
      d = way.deeds[i];
      cls = 'm' + (d.helped ? ' is-sent' : '') + (d.day === o.newDay ? ' is-new' : '') + (prev !== null && d.day !== prev ? ' is-daygap' : '');
      marks.appendChild(el('i', { class: cls }));
      said.push(W.deed(d, way.situation, kin));
      prev = d.day;
    }
    for (i = 0; o.ghosts && i < o.ghosts.length; i++) {
      marks.appendChild(el('i', { class: 'm is-ghost' + (o.ghosts[i] ? ' is-sent' : '') + (i === 0 && prev !== null ? ' is-daygap' : '') }));
    }
    var empty = !way.n && !(o.ghosts && o.ghosts.length);
    return el('div', { class: 'way-row' + (empty ? ' is-empty' : '') + (o.hot ? ' is-hot' : '') + (o.hollow ? ' is-hollow' : ''), 'data-sit': String(way.situation) }, [
      el('span', { class: 'way-title', text: W.title(way.situation) }),
      marks,
      el('span', { class: 'way-count', text: o.note || W.wayCount(way.h, way.n) }),
      said.length ? el('span', { class: 'vh', text: said.join(' ') }) : null      // what the marks say, deed by deed
    ]);
  }
  function followNow() {                         // which habits of each neighbour came from you
    var out = {}, i, s, src;
    for (i = 0; i < ORDER.length; i++) {
      src = state.life.houses[ORDER[i]].source; out[ORDER[i]] = [];
      for (s = 0; s < 5; s++) out[ORDER[i]].push(!!(src && src[s] && src[s].type === 'you'));
    }
    return out;
  }
  // Which neighbours run your ways as a whole: the label the Afterwards opens with (way 0, or
  // the sister's). It also covers a house that took your ways up from another house, which has
  // no habit learned from you directly. The sister's house counts once it has learned from you.
  function keepsNow() {
    var out = {}, kin = state.life.kin, follow = followNow(), i, id, way;
    for (i = 0; i < ORDER.length; i++) {
      id = ORDER[i]; way = state.life.houses[id].way;
      out[id] = (way === 0 || way === kin) && (id !== kin || follow[id].indexOf(true) >= 0);
    }
    return out;
  }
  function names() { return state.life.houses.map(function (h) { return h.name; }); }

  // ---- opening ------------------------------------------------------------------------------

  function fillStatic() {
    var p = placeParams(), op = W.opening(p), ul = $('opening-lines'), H = W.heads(), i;
    setText('h-opening', op.title); setText('h-app', op.title); setText('opening-premise', op.premise); setText('begin', op.begin);
    clear(ul);
    for (i = 0; i < op.lines.length; i++) ul.appendChild(el('li', { text: op.lines[i] }));
    setText('opening-past-head', W.pastHead()); setText('chron-past-head', W.pastHead());
    setText('store-head', W.storeHead()); setText('h-ways', W.waysHead()); setText('ways-note', W.waysNote()); setText('h-elsewhere', W.elsewhereHead());
    setText('ford-note', W.fordNote()); setText('day-last', W.lastDayNote()); setText('why-note', W.whyMarked());
    setText('map-hint', W.mapHint()); setText('map-fold', W.mapFold(false));
    setText('h-leaving', W.leavingHead()); setText('h-leave', W.leaveHead()); setText('leave-sub', W.leaveSub()); setText('leave', W.leaveButton());
    setText('h-after', W.afterHead()); setText('skip', W.skip()); setText('h-ticker', W.tickerHead()); setText('now-head', W.tickerHead());
    setText('to-chronicle', W.seeCount());
    setText('h-chronicle', W.chronicleHead()); setText('h-chron-house', H.house); setText('h-chron-valley', H.valley);
    setText('h-chron-range', H.range); setText('h-chron-last', H.lastDay); setText('h-chron-mattered', H.mattered);
    setText('h-chron-became', H.became); setText('chron-became-sub', H.becameSub); setText('h-chron-afterword', H.afterword);
    setText('again', W.again()); setText('again-same', W.againSame()); setText('other-place', W.otherPlace());
    setText('opening-places-head', W.placesHead());
    var ld = W.legendDay(), la = W.legendAfter(), lm = W.legendMarks(), fl = W.flowLabels(p), k = stockOf(p);
    setText('map-day-key-head', W.legendHead());
    var dayKey = [['arrived', ld.arrived], ['turned', ld.turned], ['planned', ld.planned], ['home', ld.home], ['follows', ld.yours], ['diamond', ld.keeps]];
    var afterKey = [['help', la.help], ['income', la.income], ['keeps', la.yours], ['newcomer', la.newcomer]];
    if (k) {                                     // a place with a stock: its gauge, drawn as a bank begins (after the acts: the key keeps its lines)
      dayKey.splice(4, 0, ['gauge', W.legendGauge(p), null, { level: k.start, top: k.max }]);
      afterKey.push(['gauge', W.legendGauge(p), null, { level: k.start, top: k.max }]);
    }
    dayKey.push([null, W.mapHint(), 'is-hint']);
    legendInto($('map-day-legend'), dayKey, false);
    foldKey();
    drawWaysLegend(false, 1);
    legendInto($('map-after-legend'), afterKey, true);
    legendInto($('chron-rows-legend'), [['held', lm.held], ['fell', lm.fell]], false);
    setText('flow-head', fl.head); setText('flow-rule', fl.rule);
    $('flow-strip').setAttribute('aria-label', fl.head);
  }
  function foldKey() {                           // the day map's key: open where there is width for it
    var key = $('map-day-key');
    if (key) key.open = mqWide.matches && !mqShort.matches;
  }
  // On a phone the day's map can be folded away, which brings the cards to the top; the fold is
  // the reader's and lasts the Life. Where the cards sit beside or under a wider map it never applies.
  function drawFold() {
    var folded = !!state.mapFolded && !mqWide.matches, btn = $('map-fold');
    $('day-map-figure').hidden = folded;
    $('map-bar').classList.toggle('is-folded', folded);
    btn.textContent = W.mapFold(folded);
    btn.setAttribute('aria-expanded', folded ? 'false' : 'true');
    $('map-hint').hidden = folded || state.phase !== 'choose';      // the hint is about choosing on the map
  }
  // held: the Opening is drawn again for a place just chosen. A number line that was showing then keeps
  // its room, unseen, so that nothing above the choice of places moves under the pointer.
  function drawOpening(held) {
    drawChooser();
    drawOpeningMap();
    var note = $('opening-valley'), keep = !!held && !note.hidden;
    if (state.fixedSeed !== null) {
      var n = null;
      try { n = A.createLife(state.fixedSeed, state.place).seed; } catch (e) { n = null; }
      if (n === null) { state.hash = null; state.fixedSeed = null; }
      else note.textContent = W.valleyNo(n);
    }
    var holding = state.fixedSeed === null && keep;
    if (holding) {
      if (!note.classList.contains('is-held')) note.classList.add('is-held');
      note.setAttribute('aria-hidden', 'true');
    } else if (note.classList.contains('is-held')) {
      note.classList.remove('is-held');
      note.removeAttribute('aria-hidden');
    }
    note.hidden = state.fixedSeed === null && !holding;
    drawOpeningPast();
  }
  // The choice of places, in the cards' option style: a radio group named by its legend, the
  // arrow keys moving through it. It is built once for the places there are (building it again
  // would take the focus from the option the keys are on) and only set on each draw after that.
  var chooserFor = '';
  function drawChooser() {
    var box = $('opening-places'), row = $('opening-places-row'), ids = placesHere(), i, input;
    box.hidden = ids.length < 2;
    if (ids.length < 2) return;
    if (chooserFor !== ids.join(' ')) {
      clear(row);
      for (i = 0; i < ids.length; i++) row.appendChild(placeOption(ids[i]));
      chooserFor = ids.join(' ');
    }
    for (i = 0; i < ids.length; i++) { input = $('place-' + ids[i]); if (input) input.checked = ids[i] === state.place; }
  }
  function placeOption(id) {
    return el('label', { class: 'opt is-place' }, [
      el('input', { type: 'radio', name: 'place', id: 'place-' + id, value: id }),
      el('span', { class: 'opt-face' }, [
        el('span', { class: 'opt-check', 'aria-hidden': 'true', html: CHECK_SVG }),
        // its short label for the eye (five to a row), its name for a listener
        el('span', { 'aria-hidden': 'true', text: W.placeLabel(id) }),
        el('span', { class: 'vh', text: W.placeName(id) })
      ])
    ]);
  }
  // Choosing a place writes it into the address alone (#<place>, no seed), in place of what was there.
  function choosePlace(id) {
    if (state.view !== 'opening' || id === state.place || !hasOwn(P.byId, id)) return;
    setPlace(id);
    writeHash(id);
    drawOpening(true);
  }
  // #<place>-<seed>: the text before the first hyphen is a place when this page has it, and the
  // rest is a seed of that place. The valley is always there, so #valley-48213 and #valley-shoal-3
  // keep their meaning (the valley, seeds 48213 and "shoal-3"). #<place> alone puts that place in hand
  // with no seed fixed. A place may also be named by the word the page letters it with (#border-3 for
  // the Watch: placeLabel). Any other hash fixes nothing.
  var HASH_RE = /^#([a-z]+)(?:-([A-Za-z0-9-]+))?$/;
  function placeKey(word) {
    if (hasOwn(P.byId, word)) return word;
    for (var i = 0; i < P.order.length; i++) if (W.placeLabel(P.order[i]).toLowerCase() === word) return P.order[i];
    return null;
  }
  function readHash() {
    var m = HASH_RE.exec(String(window.location && window.location.hash || '')), key = m ? placeKey(m[1]) : null;
    state.hash = key ? { place: key, seed: m[2] === undefined || m[2] === '' ? null : m[2] } : null;
  }
  // The address names the place in hand alone, with no new entry in the history (and none at all where
  // the page cannot write its address).
  function writeHash(id) {
    try { window.history.replaceState(window.history.state, '', '#' + id); } catch (e) { /* the host's address stays */ }
    state.hash = { place: id, seed: null };
  }
  // The hash's place is put in hand (its option chosen) and its seed fixed.
  function applyHash() {
    if (state.hash && state.hash.place !== state.place) setPlace(state.hash.place);
    else fixFromHash();
  }
  function randomSeed() {
    var n;
    try { var a = new Uint32Array(1); window.crypto.getRandomValues(a); n = a[0]; }
    catch (e) { n = Math.floor(Math.random() * 4294967296); }
    return 1 + (n % 99999);
  }

  // ---- a Life -------------------------------------------------------------------------------

  function beginLife(seedIn) {
    cancelTimers();
    var life = A.createLife(seedIn, state.place);
    state.life = life; state.seed = life.seed;
    state.choices = []; state.result = null; state.youMark = null; state.knowOpen = {}; state.mapFolded = false;
    state.future = null; state.after = null; state.job = null; state.verdict = null; state.saved = false;
    startDay();
    showView('day');
  }
  function startDay() {
    state.phase = 'choose'; state.pending = {}; state.flipped = {}; state.thirdOpen = {}; state.result = null; state.hot = null;
    state.today = A.today(state.life); state.todayAfter = null;
    state.follow = followNow(); state.keeps = keepsNow();
    drawDay();
  }
  function noteYou(result) {                     // remember where a habit learned from you first shows
    var i;
    if (state.youMark) return;
    for (i = 0; i < result.results.length; i++) {
      if (result.results[i].why.source.type === 'you') { state.youMark = { day: result.day, key: String(result.results[i].id) }; return; }
    }
    for (i = 0; i < result.kinWith.length; i++) {
      if (result.kinWith[i].why.source.type === 'you') { state.youMark = { day: result.day, key: 'kin-' + result.kinWith[i].id }; return; }
    }
  }
  function isMarked(key) {
    return !!(state.youMark && state.result && state.youMark.day === state.result.day && state.youMark.key === key);
  }
  function chosenCount() {
    var n = 0, i;
    for (i = 0; i < ORDER.length; i++) if (typeof state.pending[ORDER[i]] === 'boolean') n++;
    return n;
  }

  // ---- the day ------------------------------------------------------------------------------

  function drawDay() {
    var t = state.today, r = state.result, revealed = state.phase !== 'choose';
    var purse = revealed ? r.purse : t.purse;
    setText('h-day', W.dayOf(t.day));
    $('day-last').hidden = t.day !== 12;
    setText('day-valley', W.valleyNo(state.seed));
    drawTrack(t.day);
    signedInto($('store-text'), W.store(purse, t.need));
    meterInto($('store-meter'), purse, t.need);
    setText('store-old', W.oldWay(t.oldWayPurse));
    drawCards();
    drawSeason();
    drawElsewhere();
    drawStatus();
    drawActions();
    drawWays();
    drawFold();                                  // before the map: a map unfolded can be measured
    drawDayMap();
  }
  function drawTrack(day) {
    var node = $('day-track'), s, k, d, box;
    clear(node);
    node.setAttribute('aria-label', W.dayTrackAlt(day));
    for (s = 0; s < 3; s++) {
      box = el('div', { class: 'track-season' });
      for (k = 1; k <= 4; k++) {
        d = s * 4 + k;
        box.appendChild(el('span', { class: 'track-day' + (d < day ? ' is-spent' : d === day ? ' is-today' : '') }));
      }
      node.appendChild(box);
    }
  }
  function drawStatus() {
    var node = $('day-status'), r = state.result;
    clear(node);
    if (state.phase === 'choose') {
      node.className = 'status';
      // the day is named here too: in one column "Next day" brings the reader to this line, below the header
      node.appendChild(el('span', { class: 'status-day', text: W.statusDay(state.today.day) + ' ' }));
      node.appendChild(el('span', { text: W.chooseLine() }));
    } else {
      node.className = 'status is-total';
      var total = el('span');
      signedInto(total, W.dayTotal(r.gained, r.purse, r.need));
      node.appendChild(total);
      // where the town pays for the ring: what it paid at your ties today, said with the total
      if (townOf(state.life.params)) node.appendChild(el('span', { class: 'status-town', text: ' ' + W.dayTown(r.results, state.life.params) }));
    }
  }
  // Where the day's button sits in the page, which is the order of reading and of the Tab key
  // (its place on screen is the style sheet's). While choosing it follows the cards: choose
  // four, then close. Once the day is closed in two columns, where it lies above the cards, it
  // comes before them, so that Tab goes on from "Next day" into the four Why? buttons.
  // It is placed again when the window crosses the two-column line (see wire), so that a day
  // closed wide and then narrowed does not keep "Next day" ahead of the cards it now lies under.
  // keepFocus: for that case, where nothing else moves the focus: a button that is moved while
  // it has the focus keeps it.
  function placeActions(keepFocus) {
    var box = $('day-actions'), cards = $('cards'), sec = $('elsewhere') || $('season-end'), had = document.activeElement;
    if (!box || !cards || !sec || !cards.parentNode) return;
    if (state.phase === 'revealed' && mqTwo.matches) {
      if (box.nextElementSibling !== cards) cards.parentNode.insertBefore(box, cards);
    } else if (sec.nextElementSibling !== box) sec.parentNode.insertBefore(box, sec.nextSibling);
    if (keepFocus && had && had !== document.activeElement && box.contains(had)) focusOn(had);
  }
  function drawActions() {
    var close = $('close-day'), next = $('next-day'), r = state.result, left;
    placeActions();
    if (state.phase === 'choose') {
      left = 4 - chosenCount();
      close.hidden = false; close.disabled = left > 0; close.textContent = W.closeDay(left);
      next.hidden = true; next.disabled = true;
    } else {
      close.hidden = true; close.disabled = true;
      next.hidden = false; next.disabled = false;
      if (state.phase === 'revealed') next.textContent = W.nextDay(r.lookingRound ? 'season' : r.over ? 'leave' : 'day');
      else next.textContent = W.nextDay(r.over ? 'leave' : 'day');
    }
  }
  function drawWays() {
    var ws = A.ways(state.life), node = $('ways-rows'), t = state.today, revealed = state.phase !== 'choose';
    var ghosts = [[], [], [], [], []], hotSit = -1, i, s, n;
    if (!revealed) {
      for (i = 0; i < t.neighbours.length; i++) {
        n = t.neighbours[i];
        if (typeof state.pending[n.id] === 'boolean') ghosts[n.situation].push(state.pending[n.id]);
        if (state.hot === n.id) hotSit = n.situation;
      }
    }
    clear(node);
    for (s = 0; s < 5; s++) node.appendChild(wayRow(ws[s], { newDay: revealed ? t.day : t.day - 1, ghosts: ghosts[s], hot: hotSit === s }));
    drawWaysLegend(revealed, t.day);
  }
  // The key says what the marks are at this point of the day: the underlined ones are
  // yesterday's until the day is closed and today's after; the dashed ones are today's, planned.
  function drawWaysLegend(revealed, day) {
    var lw = W.legendWays(), items = [['sent', lw.sent], ['stayed', lw.stayed]];
    if (revealed) items.push(['fresh', lw.today]);
    else {
      if (day > 1) items.push(['fresh', lw.yesterday]);
      items.push(['ghost', lw.planned]);
    }
    legendInto($('ways-legend'), items, false);
  }
  function drawDayMap() {
    var t = state.today, r = state.result, hands = {}, i, id, x, p = state.life.params, k = stockOf(p), closed = state.phase !== 'choose' && !!r;
    var items = t.neighbours.map(function (nb, n) {          // the same, for the map's text alternative
      var arcs = 0, q, fl = state.follow && state.follow[nb.id];
      for (q = 0; fl && q < 5; q++) if (fl[q]) arcs++;
      var item = { name: nb.name, kin: nb.kin, plan: state.pending[nb.id], result: state.phase === 'revealed' && r ? r.results[n] : null,
                   arcs: arcs, keeps: !!(state.keeps && state.keeps[nb.id]) };
      // a place with a stock: the bank on the tie, as the map's gauge shows it
      if (k) item.bank = state.phase === 'revealed' ? { before: r.results[n].stock, after: r.results[n].stockAfter } : { level: closed ? r.results[n].stockAfter : nb.stock };
      return item;
    });
    if (state.phase === 'choose') {
      for (i = 0; i < ORDER.length; i++) { id = ORDER[i]; if (typeof state.pending[id] === 'boolean') hands[id] = { plan: state.pending[id] }; }
    } else if (state.phase === 'revealed') {
      for (i = 0; i < r.results.length; i++) { x = r.results[i]; hands[x.id] = { revealed: true, arrived: x.arrived, lost: x.lost, they: x.they }; }
    }
    var o = {
      names: names(), kin: state.life.kin, follow: state.follow, keeps: state.keeps, hands: hands,
      kinWith: state.phase === 'revealed' ? r.kinWith : null,
      hot: state.hot, click: state.phase === 'choose',
      crop: !mqWide.matches,                     // a phone: cut above the ridge, so that the first card is on the first screen
      alt: W.mapAltDay(t.day, state.phase, items, p)
    };
    // the banks on your ties: this morning's while choosing, as the closed day left them after
    if (k) o.gauge = { top: k.max, levels: levelsOf(t.neighbours, closed ? r.results : null) };
    drawMap('map-day', 'day', o);
  }

  // cards -------------------------------------------------------------------------------------

  function linesNode(lines) {
    var box = el('div', { class: 'back-lines' }), i, ln, cls;
    for (i = 0; i < lines.length; i++) {
      ln = lines[i];
      cls = ln.kind === 'deed' ? 'is-deed' + (ln.sent ? ' is-sent' : '') : ln.kind === 'more' ? 'is-more' : ln.kind === 'lead' ? 'is-from-you' : null;
      box.appendChild(el('p', { class: cls, text: ln.text }));
    }
    return box;
  }
  // key: where the first habit learned from you is marked (see noteYou); attrs: the control's own
  // hook, data-why="<id>" on a card and data-why-kin="<id>" under "Elsewhere today".
  function whyButton(key, attrs) {
    attrs.type = 'button';
    attrs['class'] = 'why-btn' + (isMarked(key) ? ' is-marked' : '');
    if (isMarked(key)) attrs['aria-describedby'] = 'why-note';      // the mark, in words
    return el('button', attrs, [
      isMarked(key) ? el('span', { class: 'why-mark', 'aria-hidden': 'true' }) : null,
      el('span', { text: W.whyLabel() })
    ]);
  }
  var CHECK_SVG = '<svg width="14" height="12" viewBox="0 0 14 12" aria-hidden="true" focusable="false"><path d="M1.5 6.5l3.6 3.6L12.5 2"/></svg>';
  function optionNode(n, value, checked, disabled) {
    var send = value === 'send';
    return el('label', { class: 'opt ' + (send ? 'is-send' : 'is-stay') + (disabled ? ' is-disabled' : '') }, [
      el('input', { type: 'radio', name: 'choice-' + n.id, id: 'choice-' + n.id + '-' + value, value: value, checked: checked, disabled: disabled }),
      el('span', { class: 'opt-face' }, [
        // shown by the style sheet on the chosen option only: both stand empty until one is picked
        el('span', { class: 'opt-check', 'aria-hidden': 'true', html: CHECK_SVG }),
        el('span', { text: send ? W.send() : W.stay() })
      ])
    ]);
  }
  // "What you know of them" is open where the window has height to spare and folded elsewhere,
  // unless the reader has opened or closed this house's by hand.
  function knowIsOpen(id) {
    var v = state.knowOpen[id];
    return typeof v === 'boolean' ? v : mqRoomy.matches;
  }
  function knowRow(tag, s, t, today) {
    var row = el(tag, { class: 'know-row' + (t.n ? '' : ' is-unseen') + (today ? ' is-today' : '') }, [
      el('span', { class: 'know-label', text: W.knowLabel(s) }),
      el('span', { text: W.knowValue(t.h, t.n) })
    ]);
    if (t.n) row.style.setProperty('--share', String(Math.round(t.h / t.n * 100)));
    return row;
  }
  // Two nodes: the whole section behind its toggle, and its short form, which the style sheet
  // shows while the section is closed on cards that sit two by two: the one row for the
  // situation the neighbour is in today (with the note that the count restarted, if it did).
  // after: the same neighbour in today() once the day is closed, or null while choosing. The
  // counts then take in today's dealings: what was known this morning plus what the whole-Life
  // tally gained today. (Not today() as it then stands: on days 4, 8 and 12 that is already
  // the valley after the season's end, which the page has not yet told.) The marked row stays
  // the situation they acted in today.
  function knowNodes(n, after) {
    var changed = n.changedDay !== null, base = changed ? n.seenSince : n.seen, theirs = MIRROR[n.situation], tallies = [], s;
    for (s = 0; s < 5; s++) {
      tallies.push(after ? { h: base[s].h + after.seen[s].h - n.seen[s].h, n: base[s].n + after.seen[s].n - n.seen[s].n } : base[s]);
    }
    var det = el('details', { class: 'know', 'data-know': String(n.id) });
    det.open = knowIsOpen(n.id);
    det.appendChild(el('summary', { 'aria-describedby': 'card-title-' + n.id, text: W.knowHead() }));
    if (changed) det.appendChild(el('p', { class: 'know-changed', text: W.knowChanged(n.changedDay) }));
    var rows = el('ul', { class: 'know-rows', role: 'list' });
    for (s = 0; s < 5; s++) rows.appendChild(knowRow('li', s, tallies[s], s === theirs));
    det.appendChild(rows);
    det.appendChild(el('p', { class: 'know-foot', text: W.knowFoot() }));
    var now = el('div', { class: 'know-now' }, [
      changed ? el('p', { class: 'know-changed', text: W.knowChanged(n.changedDay) }) : null,
      knowRow('div', theirs, tallies[theirs], true)
    ]);
    return [det, now];
  }
  // The bank on a card's tie, in its head: the gauge and a short caption for the eye, a sentence for
  // a listener. Before the reveal the level this morning (today().neighbours[i].stock), after it
  // what the day did (results[i].stock to stockAfter). null where the place has no stock.
  function bankNode(n, r) {
    var p = state.life.params, k = stockOf(p), words;
    if (!k) return null;
    words = r ? W.bankDay(r.stock, r.stockAfter, p, false) : W.bankNow(n.stock, p);
    return el('span', { class: 'bank', 'data-bank': String(n.id) }, [
      el('span', { class: 'bank-gauge', 'aria-hidden': 'true', html: S.gauge({ level: r ? r.stockAfter : n.stock, top: k.max }) }),
      el('span', { class: 'bank-text', 'aria-hidden': 'true', text: words.text }),
      el('span', { class: 'vh', text: words.say })
    ]);
  }
  function cardNode(n, i, r, after) {
    var cardNames = W.cardName(n), id = n.id, revealed = !!r, choice, front, back = null, y, heads, know, since, numNode;
    front = el('div', { class: 'card-face card-front' });
    front.appendChild(el('div', { class: 'card-head' }, [
      el('div', { class: 'card-names' }, [
        el('h3', { class: 'card-title', id: 'card-title-' + id, text: cardNames[0] }),
        cardNames[1] ? el('p', { class: 'card-sub', text: cardNames[1] }) : null
      ]),
      bankNode(n, r),                                // a place with a stock: the bank between you, beside the bearing
      el('span', { class: 'bearing' }, [             // where the holding lies from yours: the letters, and the words for a listener
        el('span', { 'aria-hidden': 'true', text: W.bearingShort(i) }),
        el('span', { class: 'vh', text: W.bearingSay(i) })
      ])
    ]));
    if (!revealed) {
      front.appendChild(el('p', { class: 'card-yesterday', text: W.yesterday(n.yesterday, state.life.params) }));
      front.appendChild(el('p', { class: 'card-way', text: W.wayHere(W.title(n.situation)) }));
      choice = state.pending[id];
    } else {
      var rv = W.reveal(r, state.life.params);
      numNode = el('span', { class: 'result-num' });
      signedInto(numNode, rv.number);
      front.appendChild(el('div', { class: 'card-result' }, [
        el('span', { class: 'result-glyph', html: S.glyph(sheetDef(), r) }),
        numNode,
        // named "Why? The Maren house": its own words first, then the card's title
        whyButton(String(id), { 'data-why': String(id), id: 'why-' + id, 'aria-labelledby': 'why-' + id + ' card-title-' + id,
                                'aria-expanded': 'false', 'aria-controls': 'card-back-' + id }),
        el('p', { class: 'result-text', text: rv.text })
      ]));
      choice = r.intended;
    }
    front.appendChild(el('fieldset', { class: 'choice' }, [
      el('legend', { class: 'vh', text: W.choiceLegend(n) }),
      el('div', { class: 'choice-row' }, [
        optionNode(n, 'send', choice === true, revealed),
        optionNode(n, 'stay', choice === false, revealed)
      ])
    ]));
    know = knowNodes(n, revealed ? after || null : null);
    front.appendChild(know[0]); front.appendChild(know[1]);
    if (revealed) {
      // for a house that has changed a way the back counts as the front does: since that change
      since = n.changedDay !== null ? { changedDay: n.changedDay, seen: n.seenSince[r.why.situation] } : null;
      y = W.why(r, state.life.kin, since); heads = W.whyHeads();
      back = el('div', { class: 'card-face card-back', id: 'card-back-' + id, inert: true, 'aria-hidden': 'true' }, [
        el('h4', { class: 'back-title', id: 'back-title-' + id, tabindex: '-1', text: y.title }),
        el('p', { class: 'label', text: heads.where }),
        el('p', { class: 'back-where', text: y.where }),
        el('p', { class: 'label', text: heads.source }),
        linesNode(y.lines),
        el('span', { class: 'back-gap' }),
        el('button', { type: 'button', class: 'why-back', 'data-why-back': String(id), id: 'why-back-' + id,
                       'aria-labelledby': 'why-back-' + id + ' back-title-' + id, text: W.whyBack() })
      ]);
    }
    // data-bearing: where the style sheet puts the card when the four lie two by two (as on the map)
    return el('article', { class: 'card' + (state.hot === id ? ' is-hot' : ''), 'data-house': String(id),
                           'data-bearing': W.bearingShort(i).toLowerCase(), 'aria-labelledby': 'card-title-' + id },
      [el('div', { class: 'card-inner' }, [front, back])]);
  }
  // The order of the four cards in the page, which is the order of reading and of the Tab key.
  // Down a phone it is the engine's: [1, 2, 6, 7], east, north-east, north-west, west. Two by
  // two the style sheet lays them as the holdings lie on the map (data-bearing), and the page
  // follows it row by row: north-west, north-east, west, east.
  var CARDS_BY_ROW = [2, 1, 3, 0];
  function cardSeq() { return mqWide.matches ? CARDS_BY_ROW : [0, 1, 2, 3]; }
  function drawCards() {
    var node = $('cards'), t = state.today, seq = cardSeq(), k, i;
    clear(node);
    node.hidden = state.phase === 'season';      // at the season's end the day's cards stay in the page, out of sight
    for (k = 0; k < seq.length; k++) {
      i = seq[k];
      node.appendChild(cardNode(t.neighbours[i], i, state.phase === 'choose' ? null : state.result.results[i],
                                state.todayAfter ? state.todayAfter.neighbours[i] : null));
    }
  }
  function cardOf(id) { return $('cards').querySelector('[data-house="' + id + '"]'); }
  // The same four cards, put in the order the window's width now asks for (they keep what was
  // chosen, opened or turned over on them).
  function orderCards() {
    var node = $('cards'), t = state.today, seq = cardSeq(), list = [], had = document.activeElement, k, card, same = true;
    if (!node || !t || state.view !== 'day') return;
    for (k = 0; k < seq.length; k++) {
      card = cardOf(t.neighbours[seq[k]].id);
      if (!card) return;
      if (node.children[k] !== card) same = false;
      list.push(card);
    }
    if (same) return;
    for (k = 0; k < list.length; k++) node.appendChild(list[k]);
    if (had && had !== document.activeElement && node.contains(had)) focusOn(had);
  }
  function setInert(node, on) {
    if (!node) return;
    if (on) { node.setAttribute('inert', ''); node.setAttribute('aria-hidden', 'true'); }
    else { node.removeAttribute('inert'); node.removeAttribute('aria-hidden'); }
  }
  function flip(id, on) {                        // turn a card over, or back
    var card = cardOf(id);
    if (!card || state.phase !== 'revealed') return;
    var front = card.querySelector('.card-front'), back = card.querySelector('.card-back');
    if (!back) return;
    state.flipped[id] = on;
    card.classList.toggle('is-flipped', on);
    setInert(front, on); setInert(back, !on);
    var why = front.querySelector('.why-btn');
    if (why) why.setAttribute('aria-expanded', on ? 'true' : 'false');
    focusOn(on ? back.querySelector('.back-title') : why);
    // a reason longer than the card's face makes the card taller while it is turned over (see
    // .card-back in the style sheet): the page moves only as far as it takes to show all of it
    if (on) bringNear(card);
  }

  function drawElsewhere() {
    var sec = $('elsewhere'), body = $('elsewhere-body'), r = state.result, i, e, key, open, y, heads, row;
    clear(body);
    if (state.phase !== 'revealed' || !r || !r.kinWith.length) { sec.hidden = true; return; }
    heads = W.whyHeads();
    for (i = 0; i < r.kinWith.length; i++) {
      e = r.kinWith[i];
      row = el('div', { class: 'else-line' }, [el('p', { id: 'else-line-' + e.id, text: W.elsewhere(e) })]);
      // a place with a stock: the bank between them, drawn on the map as a gauge, said for a listener
      if (stockOf(state.life.params) && typeof e.stockAfter === 'number') row.appendChild(el('span', { class: 'vh', text: W.bankDay(e.stock, e.stockAfter, state.life.params, true).say }));
      body.appendChild(row);
      if (e.why.source.type !== 'you') continue;
      key = 'kin-' + e.id; open = !!state.thirdOpen[key];
      // named as the cards' buttons are: its own word, then the sentence it asks about
      row.appendChild(whyButton(key, { 'data-why-kin': String(e.id), id: 'why-kin-' + e.id, 'aria-labelledby': 'why-kin-' + e.id + ' else-line-' + e.id,
                                       'aria-expanded': open ? 'true' : 'false', 'aria-controls': 'else-why-' + e.id }));
      y = W.whyThird(e, state.life.houses[state.life.kin].name, state.life.kin);
      body.appendChild(el('div', { class: 'else-why', id: 'else-why-' + e.id, hidden: !open }, [
        el('p', { class: 'label', text: y.title }),
        el('p', { class: 'back-where', text: y.where }),
        linesNode(y.lines)
      ]));
    }
    sec.hidden = false;
  }
  function listNode(items, cls) {
    var ul = el('ul', { class: cls, role: 'list' }), i;
    for (i = 0; i < items.length; i++) ul.appendChild(el('li', { text: items[i] }));
    return ul;
  }
  function drawSeason() {
    var sec = $('season-end'), body = $('season-body');
    clear(body);
    if (state.phase !== 'season') { sec.hidden = true; return; }
    var se = W.seasonEnd(state.result.lookingRound, state.life.kin, titles(), state.keeps);
    setText('h-season', se.head);
    body.appendChild(el('p', { class: 'small', text: se.intro }));
    body.appendChild(el('p', { class: 'season-kin', text: se.kin }));
    if (se.changes.length) body.appendChild(listNode(se.changes, 'season-list is-yours'));
    if (se.houses.length) body.appendChild(listNode(se.houses, 'season-list'));
    sec.hidden = false;
  }

  // what the reader does in the day ------------------------------------------------------------

  function choose(id, send, fromMap) {
    if (state.view !== 'day' || state.phase !== 'choose' || ORDER.indexOf(id) < 0) return;
    state.pending[id] = !!send;
    if (fromMap) {
      var a = $('choice-' + id + '-send'), b = $('choice-' + id + '-stay');
      if (a) a.checked = !!send;
      if (b) b.checked = !send;
    }
    drawActions(); drawWays(); drawDayMap();
  }
  function setHot(id) {
    if (state.hot === id) return;
    state.hot = id;
    var cards = $('cards').querySelectorAll('.card'), i, hid;
    for (i = 0; i < cards.length; i++) {
      hid = Number(cards[i].getAttribute('data-house'));
      cards[i].classList.toggle('is-hot', hid === id);
    }
    var holds = $('map-day').querySelectorAll('.m-hold');
    for (i = 0; i < holds.length; i++) holds[i].classList.toggle('is-hot', id !== null && Number(holds[i].getAttribute('data-map-house')) === id);
    var ties = $('map-day').querySelectorAll('.m-tie');
    for (i = 0; i < ties.length; i++) ties[i].classList.toggle('is-hot', id !== null && ties[i].getAttribute('data-tie') === '0-' + id);
    if (state.phase === 'choose') {
      var sit = -1, rows = $('ways-rows').querySelectorAll('.way-row');
      for (i = 0; i < state.today.neighbours.length; i++) if (state.today.neighbours[i].id === id) sit = state.today.neighbours[i].situation;
      for (i = 0; i < rows.length; i++) rows[i].classList.toggle('is-hot', Number(rows[i].getAttribute('data-sit')) === sit);
    }
  }
  function closeDay() {
    var list = [], i;
    if (state.view !== 'day' || state.phase !== 'choose') return;      // a day closes once
    for (i = 0; i < ORDER.length; i++) {
      if (typeof state.pending[ORDER[i]] !== 'boolean') return;
      list.push(state.pending[ORDER[i]]);
    }
    state.phase = 'revealed';
    state.phaseAt = now();
    state.choices.push(list);
    state.result = A.playDay(state.life, list);
    state.todayAfter = A.today(state.life);
    state.hot = null;
    noteYou(state.result);
    drawDay();
    // In two columns "Next day" is in view above the cards and Tab goes on into them (see
    // placeActions). In one column it lies below all four: focus goes to the day's total, which
    // is on screen, and Tab walks the cards down to the button.
    var status = $('day-status');
    focusOn(mqTwo.matches ? $('next-day') : status);
    if (status.scrollIntoView) { try { status.scrollIntoView({ block: 'nearest' }); } catch (e) { /* older engines */ } }
  }
  // "Next day" appears where "Close the day" was, and carries "Season's end" and then "Next day"
  // in turn. The second click of a double click (or a key held down) must not land on it and
  // pass over the reveal or the season's end: what has just appeared stands for a moment first,
  // and a click inside that moment is refused (state.phaseAt is set where the button changes).
  function nextDay() {
    if (state.view !== 'day' || state.phase === 'choose') return;
    if (now() - state.phaseAt < SETTLE_MS) return;
    if (state.phase === 'revealed' && state.result.lookingRound) {
      state.phase = 'season';
      state.phaseAt = now();
      state.follow = followNow(); state.keeps = keepsNow();     // the map now shows what was taken up
      drawDay();
      focusOn($('h-season'));
      var sec = $('season-end');
      if (sec.scrollIntoView) { try { sec.scrollIntoView({ block: 'nearest' }); } catch (e) { /* older engines */ } }
      return;
    }
    if (state.result.over) { showLeaving(false); return; }
    startDay();
    if (mqTwo.matches) toTop();
    else bringUp($('day-status'));               // in one column the cards are far down: stay with them
    focusOn(mqTwo.matches ? $('h-day') : $('day-status'));       // and the focus goes where the page now is
  }

  // ---- leaving ------------------------------------------------------------------------------

  function showLeaving(quiet) {
    var life = state.life, t = A.today(life), lg = A.legacy(life), ws = A.ways(life), rows = $('leaving-ways'), s, count = 0;
    signedInto($('leaving-store'), W.leavingStore(t.purse, t.need));
    meterInto($('leaving-meter'), t.purse, t.need);
    clear(rows);
    for (s = 0; s < 5; s++) {
      rows.appendChild(wayRow(ws[s], { newDay: -1, hollow: !!lg.hollow[s], note: W.leaveNote(ws[s].h, ws[s].n, lg.hollow[s], lg.heir[s]) }));
      if (lg.kin.fromYou[s]) count++;
    }
    setText('leaving-kin', W.kinFollows(count));
    state.follow = followNow(); state.keeps = keepsNow();
    drawLeavingMap();
    showView('leaving', quiet);
  }

  // ---- the Afterwards -----------------------------------------------------------------------

  function startAfterwards(skipNow, quiet) {
    var life = state.life;
    if (!life || !life.over) return;
    state.future = A.runFuture(life, 0);
    state.job = A.verdictJob(life);
    state.verdict = null;
    state.after = { t0: now(), shown: 0, done: false, lines: W.futureLines(state.future, life.kin), told: 0, quiet: !!quiet, said: false };
    showView('afterwards', quiet);
    buildAfter();
    if (skipNow || mqStill.matches) finishAfter();
    else { every(tickAfter, 100); tickAfter(); pump(); }
  }
  // The strip's top: room for the largest flow the place allows (hands can beat the luck of the
  // crossing a little; a stock's mean level can rise to its top against its start).
  function flowTop(p) {
    if (p.FLOW_KIND === 'stock') return p.STOCK.max / p.STOCK.start;
    if (p.FLOW_KIND === 'hands') return Math.max(1.05, 1 / (1 - p.FOG));
    return 1.05;
  }
  // A season on the worse side of the line, for the place: under it where the place holds
  // (CHARTER 'holds'), at or over it where the place is better off when the flow fails ('breaks').
  function flowSide(p, flow) {
    if (p.CHARTER === 'breaks') return flow >= p.HOLD_LINE ? ' is-over' : '';
    return flow < p.HOLD_LINE ? ' is-under' : '';
  }
  function buildAfter() {
    var p = state.life.params, fl = W.flowLabels(p), top = flowTop(p), strip = $('flow-strip'), axis = $('flow-axis'), i, col;
    setText('after-one', W.oneFuture(state.job.futures));
    setText('after-season', W.seasonCount(1));
    drawAfterMap();
    clear(strip); clear(axis);
    for (i = 1; i <= 30; i++) {
      col = el('span', { class: 'flow-col is-waiting' + (i > 20 ? ' is-late' : ''), id: 'flow-col-' + i }, [el('i')]);
      strip.appendChild(col);
    }
    strip.appendChild(el('span', { class: 'flow-half', style: 'bottom:' + (p.HOLD_LINE / top * 100).toFixed(2) + '%' }, [el('span', { text: fl.half })]));
    axis.appendChild(el('span', { style: 'grid-column:1', text: '1' }));
    axis.appendChild(el('span', { style: 'grid-column:10', text: '10' }));
    axis.appendChild(el('span', { style: 'grid-column:20', text: '20' }));
    axis.appendChild(el('span', { class: 'flow-late', style: 'grid-column:21 / 31', text: fl.late }));
    strip.setAttribute('aria-label', fl.head);       // the strip's own numbers follow once it has played (finishAfter)
    setText('flow-head', fl.head); setText('flow-rule', fl.rule);
    var ticker = $('ticker');
    clear(ticker);
    ticker.className = 'ticker';
    ticker.setAttribute('tabindex', '0');            // a scroll box while it plays: the keyboard can scroll it
    clear($('now-lines')); $('after-now').hidden = false;
    clear($('after-houses')); setText('after-say', '');
    $('after-end').hidden = true;
    $('after-counting').hidden = true;
    $('skip').hidden = false; $('skip').disabled = false;
    $('to-chronicle').hidden = true; $('to-chronicle').disabled = true;
  }
  // A name on the Afterwards map is lettered after the sheet is drawn (newcomers rename a
  // holding): the same room is kept for it as AYSheet.map keeps on the other maps (see nameRoom).
  function fitAfterName(node, id, text) {
    var kind = mapKinds['map-after'], g, L, room;
    if (!kind || (id !== 2 && id !== 6)) return;            // only these two are lettered beside the holding
    g = S.geo(sheetDef(), kind); L = S.lettered(g.L, mapUps['map-after']);
    room = S.nameRoom(L, S.labelAt(g, L, id, id === state.life.kin), text);
    if (room) { node.setAttribute('textLength', S.f(room)); node.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
    else { node.removeAttribute('textLength'); node.removeAttribute('lengthAdjust'); }
  }
  function drawSeason30(upTo) {                  // the map as it stands in season `upTo` (1..30)
    var life = state.life, fut = state.future, S = fut.seasons[upTo - 1], labels = W.mapLabels(), j, h, hold, isNew, node;
    for (j = 0; j < 8; j++) {
      h = S.houses[j];
      isNew = !!(fut.arrival && fut.arrival.house === j && fut.arrival.season <= S.season);
      hold = $('af-hold-' + j);
      if (!hold) continue;
      hold.classList.toggle('is-yours', h.way === 0 || h.way === life.kin);
      hold.classList.toggle('is-new', isNew);
      node = $('af-fill-' + j); if (node) node.style.transform = 'scaleY(' + clamp(h.helpRate, 0, 1).toFixed(3) + ')';
      node = $('af-num-' + j); if (node) node.textContent = W.num(h.income);
      node = $('af-name-' + j);
      if (node) {
        node.textContent = j === 0 ? labels.heir.toUpperCase() : String(h.name).toUpperCase();
        fitAfterName(node, j, node.textContent);
      }
      node = $('af-sub-' + j); if (node) node.textContent = j === life.kin && !isNew ? labels.sister : '';
    }
    drawBanks30(upTo);
  }
  // A place with a stock: each of the sixteen gauges as its bank stood at the end of season `upTo`
  // (runFuture().seasons[k].ties, in the engine's order of ties, AfterYou.tieList).
  function drawBanks30(upTo) {
    var k = stockOf(state.life.params), ties = state.future.seasons[upTo - 1].ties, kind = mapKinds['map-after'], t, key, node;
    if (!k || !ties || !kind) return;
    for (t = 0; t < A.tieList.length; t++) {
      key = A.tieList[t][0] + '-' + A.tieList[t][1];
      node = $('af-gauge-' + key);
      if (node) node.setAttribute('d', S.gaugeD(sheetDef(), kind, key, { level: ties[t], top: k.max }));
    }
  }
  // The resting map: whose ways each house runs after the last Looking-Round, which is what
  // the closing line counts. (Season 30's own frame is the valley before that Looking-Round.)
  function drawFinalWays() {
    var fut = state.future, kin = state.life.kin, j, hold;
    for (j = 0; j < 8; j++) {
      hold = $('af-hold-' + j);
      if (hold) hold.classList.toggle('is-yours', fut.finalWay[j] === 0 || fut.finalWay[j] === kin);
    }
  }
  function drawNow() {                           // one column: the latest two events, newest first, under the season counter
    var a = state.after, box = $('now-lines'), i, ln;
    clear(box);
    for (i = a.told - 1; i >= 0 && i >= a.told - 2; i--) {
      ln = a.lines[i];
      box.appendChild(el('li', { class: ln.yours ? 'is-yours' : null, text: ln.text }));
    }
  }
  function drawHousesAtEnd() {                   // the resting map in words, for a reader who cannot see it (not a live region)
    var fut = state.future, kin = state.life.kin, S = fut.seasons[29], list = $('after-houses'), j, h, isNew, who;
    clear(list);
    for (j = 0; j < 8; j++) {
      h = S.houses[j];
      isNew = !!(fut.arrival && fut.arrival.house === j);
      who = j === 0 ? W.heir(true) : j === kin && !isNew ? W.kin(true) : W.House(h.name);
      list.appendChild(el('li', { text: W.houseAtEnd(who, h.income, Math.round(h.helpRate * 16), fut.finalWay[j] === 0 || fut.finalWay[j] === kin, isNew) }));
    }
    if (stockOf(state.life.params) && S.ties) list.appendChild(el('li', { text: W.banksAtEnd(S.ties, state.life.params) }));   // and the banks
  }
  function showSeasons(upTo) {                   // bring the page up to season `upTo`
    var a = state.after, fut = state.future, ticker = $('ticker'), p = state.life.params, top = flowTop(p), s, col, flow, ln;
    if (!a || upTo <= a.shown) return;
    // A listener is told only the lines about the reader's own ways, and only as the seasons
    // arrive by the clock: never the whole list at once (Skip, reduced motion, a tab left behind).
    var byClock = upTo - a.shown === 1, toldBefore = a.told, say = [];
    for (s = a.shown + 1; s <= upTo; s++) {
      flow = fut.seasons[s - 1].flow;
      col = $('flow-col-' + s);
      if (col) {
        col.className = 'flow-col' + (s > 20 ? ' is-late' : '') + flowSide(p, flow);
        col.firstChild.style.height = (clamp(flow, 0, top) / top * 100).toFixed(1) + '%';
      }
      while (a.told < a.lines.length && a.lines[a.told].season <= s) {
        ln = a.lines[a.told++];
        ticker.appendChild(el('li', { class: ln.yours ? 'is-yours' : null, text: ln.text }));
        if (byClock && ln.yours) say.push(ln.text);
      }
    }
    a.shown = upTo;
    setText('after-season', W.seasonCount(upTo));
    drawSeason30(upTo);
    ticker.scrollTop = ticker.scrollHeight;
    if (a.told !== toldBefore) drawNow();
    if (say.length) setText('after-say', say.join(' '));
  }
  function tickAfter() {
    var a = state.after;
    if (!a || a.done || state.view !== 'afterwards') return;
    var elapsed = now() - a.t0;
    showSeasons(clamp(Math.floor(elapsed / SEASON_MS) + 1, 1, 30));
    if (elapsed >= 30 * SEASON_MS) finishAfter();
  }
  function finishAfter() {
    var a = state.after, i, skip = $('skip'), ticker = $('ticker'), close = $('after-close');
    if (!a || a.done || state.view !== 'afterwards') return;
    showSeasons(30);
    a.done = true;
    drawFinalWays();
    for (i = 0; i < intervals.length; i++) clearInterval(intervals[i]);
    intervals = [];
    setText('after-held', W.futureEnd(state.future));
    setText('after-ways', W.waysEnd(state.future));
    $('after-end').hidden = false;
    // Skip is about to go, and the list stops being a scroll box: if either has the focus, the
    // closing lines take it, so that it is never left on nothing while the count finishes
    if (document.activeElement === skip || document.activeElement === ticker) focusOn($('after-end'));
    skip.hidden = true; skip.disabled = true;
    $('after-now').hidden = true;                    // at rest the whole list is there to read
    ticker.className = 'ticker is-done';             // and shows whole, from its first line
    // (where the style sheet keeps it a scroll box at rest, a place whose futures tell many changes of way,
    // it stays one that the keys can reach, at its newest lines)
    if (ticker.scrollHeight > ticker.clientHeight + 1) ticker.scrollTop = ticker.scrollHeight;
    else { ticker.removeAttribute('tabindex'); ticker.scrollTop = 0; }
    $('flow-strip').setAttribute('aria-label', W.flowAlt(state.future, state.life.params));
    drawHousesAtEnd();
    for (i = 0; i < timeouts.length; i++) clearTimeout(timeouts[i]);      // the pump restarts in large slices
    timeouts = [];
    if (!a.quiet && close.scrollIntoView) {          // on a phone the closing lines and what follows them sit below the map
      try { close.scrollIntoView({ block: 'nearest' }); } catch (e) { /* older engines */ }
    }
    drawCounting();
    later(pump, 30);                                 // the closing lines are painted first, then the large slices start
  }
  function drawCounting() {
    var a = state.after, job = state.job, ready = !!state.verdict, btn = $('to-chronicle'), line = $('after-counting');
    if (!a || !a.done) return;
    line.hidden = ready;
    if (!ready && job) line.textContent = W.counting(job.futuresDone, job.futures);
    btn.hidden = !ready; btn.disabled = !ready;
    if (!ready || a.said || state.view !== 'afterwards') return;
    a.said = true;                                   // once: the way on is ready
    focusOn(btn);
    if (!a.quiet && btn.scrollIntoView) {            // the button itself, wherever the page stands (it is focused without scrolling)
      try { btn.scrollIntoView({ block: 'nearest' }); } catch (e) { /* older engines */ }
    }
    // the closing lines are said after the button's name, which a move of focus would cut short
    later(function () { setText('after-say', W.futureEnd(state.future) + ' ' + W.waysEnd(state.future)); }, 200);
  }
  // The verdict, in slices by time budget: small ones while the future plays, so that it plays
  // smoothly, and a few large ones once it has ended or was skipped. A page that is not in
  // front has its timers held to about one a second, and nobody is watching it move: there the
  // slices are long while the future plays, and after it the count runs straight through
  // instead of crawling from one held timer to the next.
  function pump() {
    var job = state.job, a = state.after, t = now(), done = false, over = !!(a && a.done), away = pageHidden(), budget;
    if (!job || state.verdict || state.view !== 'afterwards') return;
    budget = over ? (away ? Infinity : 800) : (away ? 250 : 25);
    do { done = A.verdictStep(job, 200); } while (!done && now() - t < budget);
    if (done) { state.verdict = job.result; drawCounting(); return; }
    drawCounting();
    later(pump, over ? 16 : 12);                 // after a large slice, time for the counting line to be painted
  }

  // ---- the Chronicle ------------------------------------------------------------------------

  function marksRow(label, held) {
    var box = el('div', { class: 'row-marks', role: 'img' }), i, n = Math.min(200, held.length), count = 0;
    for (i = 0; i < n; i++) {
      if (held[i]) count++;
      box.appendChild(el('i', { class: 'k' + (held[i] ? ' is-held' : '') }));
    }
    box.setAttribute('aria-label', W.rowAlt(label, count, n));       // the row's name and its count; the label beside it is for the eye
    return el('div', { class: 'row' }, [el('span', { class: 'row-label', 'aria-hidden': 'true', text: label }), box]);
  }
  function drawScale(v) {
    var node = $('chron-scale'), rg = v.range, lab = W.rangeLabels(v), lo = rg.scaleLow, hi = rg.scaleHigh, span = (hi - lo) || 1, k, a, b;
    function at(p) { return clamp((p - lo) / span * 100, 0, 100); }
    function pos(p) { return 'left:' + at(p).toFixed(2) + '%'; }
    clear(node);
    node.setAttribute('aria-label', [lab.you, lab.old, lab.worst, lab.best].join(', '));
    var bar = el('div', { class: 'scale-bar' });
    for (k = Math.floor(lo / 10); k * 10 < hi; k++) {              // a scale bar: every other ten points filled
      if (k % 2 !== 0) continue;
      a = Math.max(lo, k * 10); b = Math.min(hi, k * 10 + 10);
      if (b > a) bar.appendChild(el('span', { class: 'scale-block', style: 'left:' + at(a).toFixed(2) + '%;width:' + (at(b) - at(a)).toFixed(2) + '%' }));
    }
    bar.appendChild(el('i', { class: 'scale-pin is-old', id: 'scale-pin-old', style: pos(v.baselinePct) }));
    bar.appendChild(el('i', { class: 'scale-pin is-you', style: pos(v.holdsPct) }));
    node.appendChild(el('span', { class: 'scale-lead is-you is-upper', id: 'scale-lead-you', style: pos(v.holdsPct) }));
    node.appendChild(el('span', { class: 'scale-lead is-old is-lower', id: 'scale-lead-old', style: pos(v.baselinePct) }));
    node.appendChild(el('span', { class: 'scale-flag is-you is-upper', id: 'scale-flag-you', style: pos(v.holdsPct), text: lab.you }));
    node.appendChild(el('span', { class: 'scale-flag is-old is-lower', id: 'scale-flag-old', style: pos(v.baselinePct), text: lab.old }));
    node.appendChild(bar);
    node.appendChild(el('span', { class: 'scale-range', style: 'left:' + at(rg.worstPct).toFixed(2) + '%;width:' + Math.max(0, at(rg.bestPct) - at(rg.worstPct)).toFixed(2) + '%' }));
    node.appendChild(el('span', { class: 'scale-end', id: 'scale-end-worst', style: pos(rg.worstPct), text: lab.worst }));
    node.appendChild(el('span', { class: 'scale-end', id: 'scale-end-best', style: pos(rg.bestPct), text: lab.best }));
    setText('chron-scale-axis', lab.axis);
    state.scaleAt = { you: at(v.holdsPct), old: at(v.baselinePct), worst: at(rg.worstPct), best: at(rg.bestPct) };
    layoutScale();
  }
  // Labels on the scale are set by measured width, so that no label leaves the sheet, no leader
  // line runs through a label, and the two range labels do not sit on each other.
  function layoutScale() {
    var node = $('chron-scale'), p = state.scaleAt;
    if (!node || !p || !$('scale-flag-you')) return;
    var Wd = node.clientWidth || 560;
    function width(id, guess) { var n = $(id); return (n && n.offsetWidth) || guess; }
    function fits(x, w, dir) { return dir > 0 ? x + w <= Wd + 2 : x - w >= -2; }
    function clear1(xL, wL, xU, dir) {         // the lower label, drawn to one side, keeps clear of the upper leader
      var a = dir > 0 ? xL : xL - wL, b = dir > 0 ? xL + wL : xL;
      return fits(xL, wL, dir) && !(xU > a + 2 && xU < b - 2);
    }
    var xy = p.you / 100 * Wd, xo = p.old / 100 * Wd, wy = width('scale-flag-you', 66), wo = width('scale-flag-old', 114);
    // Where the two pins fall within a pin's width of each other, yours (drawn last) would hide
    // the old way's: its ring is then drawn wide enough to show all round the diamond.
    var pinOld = $('scale-pin-old');
    if (pinOld) pinOld.className = 'scale-pin is-old' + (Math.abs(xy - xo) < 11 ? ' is-under' : '');
    var tries = [['old', 1], ['old', -1], ['you', 1], ['you', -1]], pick = null, i;
    for (i = 0; i < tries.length && !pick; i++) {
      if (tries[i][0] === 'old' ? clear1(xo, wo, xy, tries[i][1]) : clear1(xy, wy, xo, tries[i][1])) pick = tries[i];
    }
    if (!pick) pick = ['old', xo > Wd / 2 ? -1 : 1];
    var lower = pick[0], upper = lower === 'old' ? 'you' : 'old';
    var xu = upper === 'you' ? xy : xo, wu = upper === 'you' ? wy : wo, dirU = fits(xu, wu, 1) ? 1 : -1;
    function put(which, row, dir) {
      var flag = $('scale-flag-' + which), lead = $('scale-lead-' + which);
      flag.className = 'scale-flag is-' + which + ' is-' + row + (dir < 0 ? ' at-end' : '');
      lead.className = 'scale-lead is-' + which + ' is-' + row;
    }
    put(lower, 'lower', pick[1]); put(upper, 'upper', dirU);
    // worst and best: outward where there is room, else inward; a second line if they would collide
    var xw = p.worst / 100 * Wd, xb = p.best / 100 * Wd, ww = width('scale-end-worst', 60), wb = width('scale-end-best', 56);
    var dw = fits(xw, ww, -1) ? -1 : 1, db = fits(xb, wb, 1) ? 1 : -1;
    var w0 = dw > 0 ? xw : xw - ww, w1 = dw > 0 ? xw + ww : xw, b0 = db > 0 ? xb : xb - wb, b1 = db > 0 ? xb + wb : xb;
    var clash = w0 < b1 + 6 && b0 < w1 + 6;
    $('scale-end-worst').className = 'scale-end' + (dw < 0 ? ' at-end' : '');
    $('scale-end-best').className = 'scale-end' + (db < 0 ? ' at-end' : '') + (clash ? ' is-low' : '');
    node.className = 'scale' + (clash ? ' has-low' : '');
  }
  // A seal withheld by the season replay (a place whose rules replay the last season): one plain line
  // under the mark it qualifies, in the place's words, made only then (the page at rest is as before);
  // the season entry's own numbers are never shown.
  // Shown only where the seal would otherwise have been earned: the house kept, the mark clear and no
  // last-day clause withholding it.
  function seasonLine(v) {
    var old = $('chron-season'), noise = $('chron-noise'), s = v.seal;
    if (old) old.parentNode.removeChild(old);
    if (s && s.wonOnSeason && s.houseKept && s.markClear && !s.boughtOnLastDay && !s.lastDayCost && !s.wonOnLastDay) noise.parentNode.insertBefore(el('p', { id: 'chron-season', text: W.seasonRests(v) }), noise.nextSibling);
  }
  function showChronicle() {
    var v = state.verdict, life = state.life, i, lines, rows, list, seal, rl, ex;
    if (!v || !life || state.view !== 'afterwards') return;
    if (!state.saved) {
      state.saved = true;
      saveLife({ place: state.place, seed: life.seed, kept: !!v.houseKept, purse: v.purse, need: v.need, mark: v.mark, seal: !!(v.seal && v.seal.earned) });
    }
    setText('chron-valley', W.valleyNo(life.seed));
    signedInto($('chron-house'), W.houseLine(v));
    meterInto($('chron-meter'), v.purse, v.need);
    setText('chron-valley-line', W.valleyLine(v));
    signedInto($('chron-mark'), W.markLine(v));
    setText('chron-mark-means', W.markMeans(v));
    setText('chron-noise', W.markNoise(v));
    seasonLine(v);
    rl = W.rowLabels(); rows = $('chron-rows'); clear(rows);
    rows.appendChild(marksRow(rl.you, v.held));
    rows.appendChild(marksRow(rl.old, v.baseline.held));
    rows.appendChild(el('p', { class: 'small', text: W.rowsCaption(v) }));
    ex = W.rowsExplain(v, life.params);
    setText('chron-explain-1', ex[0]); setText('chron-explain-2', ex[1]);
    drawScale(v);
    setText('chron-range', W.rangeLine(v));
    setText('chron-range-note', W.rangeNote(v));
    $('chron-last-block').hidden = !v.lastDay;
    setText('chron-last', v.lastDay ? W.lastDayLine(v, life.kin) : '');
    seal = $('chron-seal'); clear(seal);
    if (v.seal && v.seal.earned) {
      seal.appendChild(el('span', { html: S.seal(sheetDef()) }));
      seal.appendChild(el('p', { text: W.seal() }));
      seal.hidden = false;
    } else seal.hidden = true;
    setText('chron-mattered', W.mattered(v, titles()));
    list = $('chron-became'); clear(list);
    lines = W.became(state.future, life.kin);
    for (i = 0; i < lines.length; i++) list.appendChild(el('li', { class: i === lines.length - 1 ? 'is-close' : null, text: lines[i] }));
    drawPast('chron-past', 'chron-past-list', PAST_IN_CHRONICLE);
    setText('chron-afterword', W.afterword());
    $('other-place').hidden = !choosing();
    showView('chronicle');
    layoutScale();                               // again, now that the view has a width
    // where the style sheet keeps the list of your ways' fate in a scroll box (a place whose futures tell many
    // changes of way), it is one the keys can reach, named by its heading, and it shows its closing lines
    if (list.scrollHeight > list.clientHeight + 1) {
      list.setAttribute('tabindex', '0'); list.setAttribute('aria-labelledby', 'h-chron-became');
      list.scrollTop = list.scrollHeight;
    } else if (list.getAttribute('tabindex') !== null) { list.removeAttribute('tabindex'); list.removeAttribute('aria-labelledby'); }
  }

  // From the Chronicle back to the Opening, to choose another place (the Life just lived is done
  // and stored); the focus goes to the place in hand among the choices.
  function goOpening() {
    cancelTimers();
    state.life = null; state.seed = null; state.choices = []; state.result = null;
    state.future = null; state.after = null; state.job = null; state.verdict = null;
    applyHash();                                 // a hash changed during the Life is obeyed now, as on a load
    drawOpening();
    showView('opening');
    var on = $('place-' + state.place);
    if (on && choosing()) focusOn(on);
  }

  // ---- reload: a Life is rebuilt from its place, its seed and its choices -------------------

  function snapshot() {
    return { place: state.place, seed: state.seed, choices: state.choices, pending: state.pending, view: state.view, phase: state.phase, mapFolded: state.mapFolded };
  }
  function restore(data) {
    // a snapshot of the Opening keeps the place chosen there, unless the address names one
    if (data && data.view === 'opening') {
      if (typeof data.place === 'string' && hasOwn(P.byId, data.place) && !state.hash && data.place !== state.place) setPlace(data.place);
      return false;
    }
    if (!data || data.seed === null || data.seed === undefined || !data.view) return false;
    // the snapshot's place (none: the valley, as before there were places); a place this page has
    // no words for cannot be rebuilt
    var place = data.place === undefined ? 'valley' : data.place;
    if (typeof place !== 'string' || !hasOwn(P.byId, place)) return false;
    if (place !== state.place) setPlace(place);
    var life = A.createLife(data.seed, state.place), list = Array.isArray(data.choices) ? data.choices : [], i, c, k;
    var before = null, follow = null, keeps = null, result = null;
    state.mapFolded = !!data.mapFolded;
    state.life = life; state.seed = life.seed; state.choices = []; state.youMark = null; state.result = null;
    state.future = null; state.after = null; state.job = null; state.verdict = null; state.knowOpen = {};
    state.saved = data.view === 'chronicle';     // a Life already counted is not listed twice
    for (i = 0; i < list.length && !life.over; i++) {
      c = [];
      for (k = 0; k < 4; k++) c.push(!!(list[i] && list[i][k]));
      before = A.today(life); follow = followNow(); keeps = keepsNow();
      result = A.playDay(life, c);
      state.result = result;
      noteYou(result);
      state.choices.push(c);
    }
    if (life.over && data.view !== 'day') {
      state.result = result;
      if (data.view === 'leaving') showLeaving(true);
      else startAfterwards(true, true);
      return true;
    }
    if (result && (data.phase === 'revealed' || data.phase === 'season' || life.over)) {
      state.today = before; state.todayAfter = A.today(life); state.result = result;
      state.pending = {}; state.flipped = {}; state.thirdOpen = {}; state.hot = null;
      state.phase = data.phase === 'season' && result.lookingRound ? 'season' : 'revealed';
      state.follow = state.phase === 'season' ? followNow() : follow;
      state.keeps = state.phase === 'season' ? keepsNow() : keeps;
      state.phaseAt = 0;
      drawDay();
    } else {
      startDay();
      if (data.pending) {
        for (i = 0; i < ORDER.length; i++) if (typeof data.pending[ORDER[i]] === 'boolean') state.pending[ORDER[i]] = data.pending[ORDER[i]];
        drawDay();
      }
    }
    showView('day', true);
    return true;
  }

  // ---- wiring -------------------------------------------------------------------------------

  function closest(node, sel) { return node && node.closest ? node.closest(sel) : null; }
  function wire() {
    $('begin').addEventListener('click', function () {
      if (state.view !== 'opening') return;
      beginLife(state.fixedSeed !== null ? state.fixedSeed : randomSeed());
    });
    $('map-fold').addEventListener('click', function () {
      if (state.view !== 'day' || !state.life) return;
      var bar = $('map-bar'), before = 0, after = 0;
      try { before = bar.getBoundingClientRect().top; } catch (e) { before = 0; }
      state.mapFolded = !state.mapFolded;
      drawFold();
      if (!state.mapFolded) {
        drawDayMap();                                             // back in the page, where its box can be measured
        bringNear($('day-map-figure'));                           // and in the window: it was asked for
        return;
      }
      // Folded: the map above the bar is gone and the bar has moved up by the map's height. The
      // page moves with it, so that the control just pressed stays where it was in the window
      // (a page scrolled down would otherwise leave it, and the top of the first card, above the window).
      try { after = bar.getBoundingClientRect().top; window.scrollBy(0, after - before); } catch (e) { /* no window to scroll */ }
      bringNear(bar);
    });
    $('close-day').addEventListener('click', closeDay);
    $('next-day').addEventListener('click', nextDay);
    function noRepeat(e) { if (e.repeat && e.key === 'Enter') e.preventDefault(); }   // a held key activates once
    $('close-day').addEventListener('keydown', noRepeat);
    $('next-day').addEventListener('keydown', noRepeat);
    $('leave').addEventListener('click', function () { if (state.view === 'leaving' && !fresh()) startAfterwards(false, false); });
    $('skip').addEventListener('click', function () { if (state.view === 'afterwards') finishAfter(); });
    $('to-chronicle').addEventListener('click', showChronicle);
    $('again').addEventListener('click', function () { if (state.view === 'chronicle' && !fresh()) beginLife(randomSeed()); });
    $('again-same').addEventListener('click', function () { if (state.view === 'chronicle' && !fresh() && state.seed !== null) beginLife(state.seed); });
    $('other-place').addEventListener('click', function () { if (state.view === 'chronicle' && !fresh()) goOpening(); });
    $('opening-places').addEventListener('change', function (e) {
      var t = e.target;
      if (t && t.type === 'radio' && t.name === 'place' && t.checked) choosePlace(t.value);
    });

    var cards = $('cards');
    cards.addEventListener('change', function (e) {
      var t = e.target;
      if (!t || t.type !== 'radio' || !t.checked) return;
      var m = /^choice-(\d+)$/.exec(t.name || '');
      if (m) choose(Number(m[1]), t.value === 'send', false);
    });
    cards.addEventListener('click', function (e) {
      var why = closest(e.target, '[data-why]'), back = closest(e.target, '[data-why-back]');
      if (why) flip(Number(why.getAttribute('data-why')), true);
      else if (back) flip(Number(back.getAttribute('data-why-back')), false);
    });
    cards.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var card = closest(e.target, '.card');
      if (card && card.classList.contains('is-flipped')) flip(Number(card.getAttribute('data-house')), false);
    });
    cards.addEventListener('toggle', function (e) {              // toggle does not bubble: listen in capture
      var det = e.target, id = det && det.getAttribute ? det.getAttribute('data-know') : null;
      if (id && !!det.open !== knowIsOpen(id)) state.knowOpen[id] = !!det.open;      // only what the reader did by hand
    }, true);
    function hotFrom(e) { var card = closest(e.target, '.card'); setHot(card ? Number(card.getAttribute('data-house')) : null); }
    cards.addEventListener('mouseover', hotFrom);
    cards.addEventListener('focusin', hotFrom);
    cards.addEventListener('mouseleave', function () { setHot(null); });
    cards.addEventListener('focusout', function (e) { if (!closest(e.relatedTarget, '#cards')) setHot(null); });

    var map = $('map-day');
    map.addEventListener('click', function (e) {                  // the map is an instrument: a holding takes the choice too
      var hold = closest(e.target, '[data-map-house]');
      if (!hold || state.phase !== 'choose') return;
      var id = Number(hold.getAttribute('data-map-house'));
      if (ORDER.indexOf(id) < 0) return;
      choose(id, state.pending[id] !== true, true);
    });
    map.addEventListener('mouseover', function (e) {
      var hold = closest(e.target, '[data-map-house]'), id = hold ? Number(hold.getAttribute('data-map-house')) : null;
      setHot(id !== null && ORDER.indexOf(id) >= 0 ? id : null);
    });
    map.addEventListener('mouseleave', function () { setHot(null); });

    $('elsewhere-body').addEventListener('click', function (e) {
      var btn = closest(e.target, '[data-why-kin]');
      if (!btn) return;
      var id = btn.getAttribute('data-why-kin'), key = 'kin-' + id, box = $('else-why-' + id);
      if (!box) return;
      state.thirdOpen[key] = !state.thirdOpen[key];
      box.hidden = !state.thirdOpen[key];
      btn.setAttribute('aria-expanded', state.thirdOpen[key] ? 'true' : 'false');
      if (state.thirdOpen[key]) bringNear(box);
    });

    onMedia(mqShort, foldKey);
    onMedia(mqCompact, drawViewMap);                              // where the box cannot be measured, the window decides
    onMedia(mqRoomy, function () {
      var all = $('cards').querySelectorAll('details'), i;
      for (i = 0; i < all.length; i++) all[i].open = knowIsOpen(all[i].getAttribute('data-know'));
    });
    onMedia(mqWide, function () {
      foldKey();
      orderCards();                                               // two by two the cards read row by row; down a phone, in the engine's order
      if (state.view === 'day' && state.life) { drawFold(); drawDayMap(); }      // the fold and the crop are a phone's
    });
    onMedia(mqTwo, function () {                                  // "Next day" sits before or after the cards by the layout
      if (state.view === 'day' && state.life) placeActions(true);
    });
    if (window.addEventListener) {
      window.addEventListener('hashchange', function () { readHash(); if (state.view === 'opening') { applyHash(); drawOpening(); } });
      window.addEventListener('resize', function () {
        refitMap();                                               // the sheet is redrawn at its other size when its box crosses over
        if (state.view === 'chronicle') layoutScale();
      });
    }
  }

  // ---- start --------------------------------------------------------------------------------

  var started = false;
  function start(data) {
    if (started) return;
    started = true;
    try { if (!document.documentElement.lang) document.documentElement.lang = 'en'; } catch (e) { /* the host's to set */ }
    W.use(state.place);                          // the words of the place in hand, before any is shown
    markPlace();                                 // and its colours
    fillStatic();
    state.lives = loadLives();
    readHash();
    applyHash();                                 // the hash's place in hand, its seed fixed
    wire();
    drawOpening();
    var ok = false, had = state.place;
    try { ok = restore(data); } catch (e) { ok = false; }
    if (!ok) {
      state.life = null; state.seed = null; state.choices = [];
      if (state.place !== had) drawOpening();    // a snapshot of another place that could not be rebuilt
      showView('opening', true);
    }
  }

  window.claude?.hot?.snapshot?.(function () { return snapshot(); });
  if (window.claude?.hot?.ready) window.claude.hot.ready(start);
  else start(window.claude?.hot?.data ?? {});
})();
