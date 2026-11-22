/*
 * After You: the page. Plain JavaScript, no build step.
 * The rules come from AfterYou (engine.js), every sentence from AYWords (words.js).
 * One plain state object; a Life is rebuilt exactly from its seed and the choices made so far.
 */
(function () {
  'use strict';

  var A = window.AfterYou, W = window.AYWords;
  var ORDER = [1, 2, 6, 7];                 // the engine's order of neighbours
  var STORE_KEY = 'after-you.lives.v1';
  var PLAY_MS = 20000, SEASONS = 30;        // the Afterwards: thirty seasons in about twenty seconds
  var SVG_NS = 'http://www.w3.org/2000/svg';

  var state = {
    seed: null,          // the valley number, once a Life has begun
    choices: [],         // one [bool x 4] per closed day, in the order 1, 2, 6, 7 (true = a hand sent)
    view: 'opening',     // opening | day | leaving | afterwards | chronicle
    phase: 'choose',     // within the day: choose | reveal | season
    pending: {},         // today's choices so far: { houseId: bool }
    today: null,         // today() as the day on screen opened
    result: null,        // playDay() of the day on screen, once closed
    turned: {},          // cards turned over to their Why? side
    quoted: null,        // { day, key, opened }: the first habit in this Life that was learned from you
    knowOpen: null,      // the reader's own choice for "What you know of them" (null: by width)
    life: null,          // the engine's Life (plain data)
    future: null,        // runFuture(life, 0): the one future watched
    events: [],          // its told events
    shown: 0,            // seasons of it shown so far
    ended: false,        // it has played out, or was skipped
    job: null,           // the verdict job
    verdict: null,       // its result
    saved: false,        // this Life is already in the list of lives
    lives: []            // finished lives, newest first
  };
  window.AYApp = { state: state };

  // ---- small tools --------------------------------------------------------------------------

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function svg(tag, attrs) {
    var e = document.createElementNS(SVG_NS, tag), k;
    for (k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, String(attrs[k]));
    return e;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function setText(id, text) { $(id).textContent = text; }
  function fillList(id, lines, cls) {
    var host = $(id);
    clear(host);
    lines.forEach(function (line) { host.appendChild(el('li', cls || null, line)); });
    host.hidden = !lines.length;
  }
  function up(node, test) {          // the nearest ancestor (or the node itself) that passes the test
    while (node && node.nodeType === 1) { if (test(node)) return node; node = node.parentNode; }
    return null;
  }
  function now() { return window.performance && performance.now ? performance.now() : Date.now(); }
  function media(query) { try { return !!(window.matchMedia && window.matchMedia(query).matches); } catch (e) { return false; } }
  function reduced() { return media('(prefers-reduced-motion: reduce)'); }
  function focusOn(node) { if (!node) return; try { node.focus({ preventScroll: true }); } catch (e) { try { node.focus(); } catch (e2) {} } }
  function toTop() {
    try { window.scrollTo(0, 0); } catch (e) {}
    try { document.documentElement.scrollTop = 0; document.body.scrollTop = 0; } catch (e2) {}
  }
  function titles() { return A.ways(state.life).map(function (w) { return W.wayTitle(w); }); }

  // Every pending timer is kept, so that a change of view or a new Life can cancel them all.
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
    timeouts.forEach(function (id) { clearTimeout(id); });
    intervals.forEach(function (id) { clearInterval(id); });
    timeouts = []; intervals = [];
  }

  // ---- views --------------------------------------------------------------------------------

  var HEADING = { opening: 'opening-title', day: 'day-title', leaving: 'leaving-title',
                  afterwards: 'after-title', chronicle: 'chronicle-title' };
  function show(view) {
    cancelTimers();
    state.view = view;
    var nodes = document.querySelectorAll('[data-view]'), i;
    for (i = 0; i < nodes.length; i++) nodes[i].hidden = nodes[i].getAttribute('data-view') !== view;
    toTop();
    focusOn($(HEADING[view]));
  }

  // ---- finished lives (storage may be missing: the page works without it) -------------------

  function validLife(r) {
    return !!r && typeof r === 'object' && isFinite(r.seed) && isFinite(r.purse) && isFinite(r.need) && isFinite(r.mark);
  }
  function loadLives() {
    try {
      var list = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]');
      return Array.isArray(list) ? list.filter(validLife).slice(0, 20) : [];
    } catch (e) { return []; }
  }
  function saveLife(rec) {
    state.lives = [rec].concat(state.lives).slice(0, 20);
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state.lives)); } catch (e) {}
  }
  function drawLives(sectionId, listId, lives) {
    $(sectionId).hidden = !lives.length;
    fillList(listId, lives.map(function (r) { return W.lifeRow(r); }));
  }

  // ---- seeds --------------------------------------------------------------------------------

  function hashSeed() {
    var m = /^#valley-([A-Za-z0-9-]+)$/.exec(String(window.location.hash || ''));
    return m ? m[1] : null;
  }
  function freshSeed() {
    var n;
    try { var a = new Uint32Array(1); window.crypto.getRandomValues(a); n = a[0]; }
    catch (e) { n = Math.floor(Math.random() * 4294967296); }
    return 10000 + (n % 90000);
  }

  // ---- a Life -------------------------------------------------------------------------------

  function resetLife(life) {
    state.life = life; state.seed = life.seed;
    state.choices = []; state.pending = {}; state.phase = 'choose'; state.today = null; state.result = null;
    state.turned = {}; state.quoted = null;
    state.future = null; state.events = []; state.shown = 0; state.ended = false;
    state.job = null; state.verdict = null; state.saved = false;
  }
  function beginLife(life) {
    resetLife(life);
    show('day');
    openDay();
  }
  function startLife(seed) { beginLife(A.createLife(seed)); }
  // The first habit, in the engine's order, that a house learned from you (its key), or null.
  function quotedIn(res) {
    var i;
    for (i = 0; i < res.results.length; i++) if (res.results[i].why.source.type === 'you') return String(res.results[i].id);
    for (i = 0; i < res.kinWith.length; i++) if (res.kinWith[i].why.source.type === 'you') return 'elsewhere-' + res.kinWith[i].id;
    return null;
  }
  function noteQuoted(res) {
    if (state.quoted) return;
    var key = quotedIn(res);
    if (key) state.quoted = { day: res.day, key: key, opened: false };
  }
  function picksOf(list) { var p = {}; ORDER.forEach(function (id, i) { p[id] = !!list[i]; }); return p; }

  // ---- the day ------------------------------------------------------------------------------

  var cardRefs = {}, elseRefs = {};

  function openDay() {
    state.phase = 'choose'; state.result = null; state.pending = {}; state.turned = {};
    state.today = A.today(state.life);
    drawDay();
  }

  function drawDay() {
    var t = state.today, res = state.result, season = state.phase === 'season';
    setText('day-title', W.dayTitle(t.day));
    $('day-last').hidden = t.day !== 12;
    drawTrack(t.day);
    setText('day-total', res ? W.dayTotal(res) : '');
    $('season').hidden = !season;
    $('bank').hidden = season;
    if (season) drawSeasonEnd(res.lookingRound);
    drawCards();
    drawElsewhere();
    drawWays('ways-list', false);
    drawStore(res ? res.purse : t.purse, t.need, t.oldWayPurse);
    drawActions();
  }

  function drawTrack(day) {
    var host = $('day-track'), d, group;
    clear(host);
    for (d = 1; d <= 12; d++) {
      if ((d - 1) % 4 === 0) { group = el('li'); host.appendChild(group); }
      group.appendChild(el('i', d < day ? 'spent' : d === day ? 'today' : null));
    }
  }

  // "What you know of them" starts open where the whole day still fits on the screen with it open:
  // not on a phone, and not on a short laptop screen. The reader's own choice then stands.
  function knowIsOpen() { return state.knowOpen === null ? media('(min-width: 761px) and (min-height: 720px)') : state.knowOpen; }
  // Once a house has changed a way its card counts only from that day on. For one situation: null, or { day, h, n }.
  function countedSince(nb, s) {
    if (nb.changedDay === null || nb.changedDay === undefined) return null;
    return { day: nb.changedDay, h: nb.seenSince[s].h, n: nb.seenSince[s].n };
  }

  function drawCards() {
    var host = $('cards'), t = state.today, res = state.result, open = knowIsOpen();
    clear(host); cardRefs = {};
    t.neighbours.forEach(function (nb, i) { host.appendChild(buildCard(nb, res ? res.results[i] : null, i === 0, open)); });
  }

  function fordBand(named) {
    var f = el('div', 'ford');
    f.setAttribute('aria-hidden', 'true');
    if (named) f.appendChild(el('span', 'ford-name', W.fordLabel()));
    return f;
  }

  function buildOption(id, value, text) {
    var label = el('label', 'opt opt-' + value), input = el('input'), body = el('span', 'opt-body');
    input.type = 'radio'; input.name = 'choice-' + id; input.value = value; input.id = 'choice-' + id + '-' + value;
    body.appendChild(el('span', 'pip'));
    body.appendChild(el('span', null, text));
    label.appendChild(input); label.appendChild(body);
    return { label: label, input: input };
  }

  function buildKnow(nb, open) {
    var d = el('details', 'know'), s = el('summary', null, W.knowHeading());
    var since = nb.changedDay !== null && nb.changedDay !== undefined;
    var counts = since ? nb.seenSince : nb.seen, table = el('table'), head = el('thead'), body = el('tbody'), row, th, td, i;
    d.open = open;
    s.addEventListener('click', function () {            // one toggle opens or closes all four
      state.knowOpen = !d.open;
      var all = $('cards').querySelectorAll('details'), k;
      for (k = 0; k < all.length; k++) if (all[k] !== d) all[k].open = state.knowOpen;
    });
    d.appendChild(s);
    if (since) d.appendChild(el('p', 'know-changed', W.knowChanged(nb.changedDay)));
    row = el('tr'); row.appendChild(el('td'));
    th = el('th', null, W.knowColumn()); th.setAttribute('scope', 'col'); row.appendChild(th);
    head.appendChild(row); table.appendChild(head);
    for (i = 0; i < 5; i++) {
      row = el('tr');
      th = el('th', null, W.knowLabel(i)); th.setAttribute('scope', 'row');
      td = el('td', counts[i].n > 0 ? null : 'unseen', W.knowCount(counts[i]));
      row.title = W.knowRow(i, counts[i]);
      row.appendChild(th); row.appendChild(td); body.appendChild(row);
    }
    table.appendChild(body); d.appendChild(table);
    d.appendChild(el('p', 'know-note', W.knowNote()));
    return d;
  }

  // The drawing of one crossing after the day is closed: where your hand ended, and whether theirs came.
  function buildCrossed(r) {
    var c = el('div', 'crossed ' + (r.lost ? 'you-lost' : r.arrived ? 'you-arrived' : 'you-stayed') +
                      (r.they ? ' they-arrived' : ' they-none'));
    c.setAttribute('role', 'img');
    c.setAttribute('aria-label', W.reveal(r));
    c.appendChild(fordBand(false));
    c.appendChild(el('i', 'stem stem-you'));
    c.appendChild(el('i', 'stem stem-they'));
    c.appendChild(el('i', 'mk mk-you'));
    c.appendChild(el('i', 'mk mk-they'));
    c.appendChild(el('span', 'lb lb-you', W.markYours(r)));
    c.appendChild(el('span', 'lb lb-they', W.markTheirs(r)));
    return c;
  }

  // The reason on the back of a card. other: null when the house faced you, else the house it faced.
  // since: what the front of the card counts for this situation when it counts only since a change (else null).
  function fillWhy(host, why, actor, other, since) {
    var kinId = state.life.kin, head, body = el('div', 'why-body'), lead, deeds, list, i, li;
    host.appendChild(el('p', 'back-who', W.who(actor.name, actor.kin, true)));
    head = el('h4', 'back-situation', W.whySituation(why, other));
    head.setAttribute('tabindex', '-1');
    host.appendChild(head);
    lead = W.whyLead(why, actor, kinId, !!other, since || null);
    lead.forEach(function (line, k) { body.appendChild(el('p', k === 0 && why.source.type === 'you' ? 'from-you' : null, line)); });
    if (why.source.type === 'you') {
      deeds = W.pickDeeds(why.source.digest);
      list = el('ul', 'deeds');
      for (i = 0; i < deeds.length; i++) {
        li = el('li', deeds[i].helped ? 'sent' : 'stayed', W.whyDeed(deeds[i], why.situation, kinId));
        list.appendChild(li);
      }
      body.appendChild(list);
      if (why.source.digest.n > deeds.length) body.appendChild(el('p', 'why-more', W.whyMore(why.source.digest.n - deeds.length)));
      if (why.againstHabit) body.appendChild(el('p', 'why-even', W.whyEven(why)));
    }
    host.appendChild(body);
    return head;
  }

  function isQuoted(key) {
    var q = state.quoted;
    return !!q && !q.opened && !!state.result && q.day === state.result.day && q.key === key;
  }

  function buildCard(nb, r, first, open) {
    var id = nb.id, key = String(id);
    var card = el('article', 'card' + (r ? ' revealed' : '')), turn = el('div', 'turn');
    var front = el('div', 'face front'), back = el('div', 'face back');
    var head = el('div', 'card-head'), names = el('div', 'card-names'), name = el('h3', 'card-name', W.houseTitle(nb));
    var why = el('button', 'why' + (isQuoted(key) ? ' quoted' : ''), W.whyLabel());
    var line = el('p', 'card-line'), cross = el('fieldset', 'crossing');
    var send = buildOption(id, 'send', W.send()), stay = buildOption(id, 'stay', W.stay());
    var picked = state.pending[id], unturn, backHead = null;

    card.setAttribute('data-house', key);
    if (nb.kin) card.setAttribute('data-kin', 'true');
    card.setAttribute('aria-labelledby', 'house-' + id);
    name.id = 'house-' + id;
    names.appendChild(name);
    if (nb.kin) names.appendChild(el('p', 'card-sub', W.houseSub(nb)));
    why.type = 'button';
    why.setAttribute('data-why', key);
    why.setAttribute('aria-label', W.whyFor(nb));
    why.hidden = !r;
    head.appendChild(names); head.appendChild(why);

    line.appendChild(el('span', 'said', r ? W.revealText(r) : W.yesterday(nb.yesterday)));
    if (r) line.appendChild(el('span', 'delta', W.signed(r.payoff)));

    cross.appendChild(el('legend', 'vh', W.choiceFor(nb)));
    cross.appendChild(send.label); cross.appendChild(fordBand(first)); cross.appendChild(stay.label);
    if (picked === true) send.input.checked = true;
    if (picked === false) stay.input.checked = true;
    if (r) { send.input.disabled = true; stay.input.disabled = true; cross.hidden = true; }

    front.appendChild(head); front.appendChild(line); front.appendChild(buildKnow(nb, open)); front.appendChild(cross);
    if (r) {
      front.appendChild(buildCrossed(r));
      backHead = fillWhy(back, r.why, nb, null, countedSince(nb, r.why.situation));
      unturn = el('button', 'unturn', W.whyBack());
      unturn.type = 'button';
      unturn.setAttribute('data-unturn', key);
      back.appendChild(unturn);
    }
    front.hidden = !!(r && state.turned[key]);
    back.hidden = !front.hidden;
    turn.appendChild(front); turn.appendChild(back); card.appendChild(turn);
    cardRefs[key] = { card: card, front: front, back: back, why: why, backHead: backHead, send: send.input, stay: stay.input, busy: false };
    return card;
  }

  // Turning a card over: one of the two places the page moves.
  function turnCard(key, toBack) {
    var ref = cardRefs[key];
    if (!ref || ref.busy || state.phase !== 'reveal' || !ref.backHead) return;
    state.turned[key] = toBack;
    if (toBack && state.quoted && state.quoted.key === key && state.quoted.day === state.result.day) {
      state.quoted.opened = true;
      ref.why.classList.remove('quoted');
    }
    function swap() {
      ref.front.hidden = toBack;
      ref.back.hidden = !toBack;
      focusOn(toBack ? ref.backHead : ref.why);
    }
    if (reduced()) { swap(); return; }
    ref.busy = true;
    ref.card.style.minHeight = ref.card.offsetHeight + 'px';   // the card keeps its height while it turns
    ref.card.classList.add('turn-out');
    later(function () {
      ref.card.classList.remove('turn-out');
      swap();
      ref.card.classList.add('turn-in');
      later(function () { ref.card.classList.remove('turn-in'); ref.busy = false; }, 260);
    }, 190);
  }

  function drawElsewhere() {
    var res = state.result, host = $('elsewhere-list'), kinId = state.life.kin, kin = state.life.houses[kinId];
    clear(host); elseRefs = {};
    if (!res || !res.kinWith.length) { $('elsewhere').hidden = true; return; }
    $('elsewhere').hidden = false;
    res.kinWith.forEach(function (e) {
      var key = 'elsewhere-' + e.id, item = el('li', 'else-item'), row = el('div', 'else-row'), btn, panel;
      row.appendChild(el('span', null, W.elsewhere(e, kinId)));
      item.appendChild(row);
      if (e.why.source.type === 'you') {
        btn = el('button', 'why' + (isQuoted(key) ? ' quoted' : ''), W.whyLabel());
        btn.type = 'button';
        btn.setAttribute('data-why', key);
        btn.setAttribute('aria-expanded', state.turned[key] ? 'true' : 'false');
        panel = el('div', 'else-why');
        panel.id = 'why-' + key;
        btn.setAttribute('aria-controls', panel.id);
        fillWhy(panel, e.why, { name: kin.name, kin: true }, { name: e.name, kin: false }, null);
        panel.hidden = !state.turned[key];
        row.appendChild(btn); item.appendChild(panel);
        elseRefs[key] = { btn: btn, panel: panel };
      }
      host.appendChild(item);
    });
  }
  function toggleElsewhere(key) {
    var ref = elseRefs[key];
    if (!ref) return;
    var open = !state.turned[key];
    state.turned[key] = open;
    ref.panel.hidden = !open;
    ref.btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && state.quoted && state.quoted.key === key) { state.quoted.opened = true; ref.btn.classList.remove('quoted'); }
  }

  function drawWays(listId, leaving) {
    var host = $(listId), ways = A.ways(state.life), fresh = state.choices.length, legacy = leaving ? A.legacy(state.life) : null;
    clear(host);
    ways.forEach(function (w, s) {
      var row = el('li', 'way' + (w.n ? '' : ' empty')), marks = el('span', 'way-marks');
      row.appendChild(el('span', 'way-title', W.wayTitle(w)));
      w.deeds.forEach(function (d) {
        marks.appendChild(el('i', 'm ' + (d.helped ? 'sent' : 'stayed') + (!leaving && d.day === fresh ? ' new' : '')));
      });
      marks.setAttribute('aria-hidden', 'true');
      row.appendChild(marks);
      row.appendChild(el('span', 'way-count', leaving ? W.leaveValue(legacy, s) : W.wayCount(w)));
      host.appendChild(row);
    });
  }

  // The store as counted measures: one cell per measure, a tall line at the need, a dotted one at the old way.
  function drawMeter(id, purse, need, oldWay) {
    var m = $(id), scale = Math.max(need, purse, 1);
    function pct(x) { return (Math.max(0, Math.min(scale, x)) / scale * 100).toFixed(2) + '%'; }
    m.style.setProperty('--n', String(scale));
    m.style.setProperty('--fill', pct(purse));
    m.style.setProperty('--need-at', pct(need));
    if (oldWay !== null) m.style.setProperty('--old-at', pct(oldWay));
  }
  function drawStore(purse, need, oldWay) {
    setText('store-count', W.store(purse, need));
    setText('store-old', W.oldWay(oldWay));
    drawMeter('store-meter', purse, need, oldWay);
  }

  function chosenCount() { var n = 0; ORDER.forEach(function (id) { if (typeof state.pending[id] === 'boolean') n++; }); return n; }
  function drawActions() {
    var close = $('close-day'), next = $('next-day'), choosing = state.phase === 'choose', left = 4 - chosenCount();
    close.textContent = choosing ? W.closeLabel(left) : W.closedLabel();
    close.disabled = !(choosing && left === 0);
    next.hidden = choosing;
    next.textContent = W.nextLabel(state.today.day, state.phase === 'season');
  }

  // What is chosen is read from the controls themselves, so a choice set by any means counts.
  function readChoices() {
    var picks = {};
    ORDER.forEach(function (id) {
      var ref = cardRefs[String(id)];
      if (!ref) return;
      if (ref.send.checked) picks[id] = true; else if (ref.stay.checked) picks[id] = false;
    });
    return picks;
  }
  function onChoice() {
    if (state.view !== 'day' || state.phase !== 'choose') return;
    state.pending = readChoices();
    drawActions();
  }

  function closeDay() {
    if (state.view !== 'day' || state.phase !== 'choose') return;     // a closed day stays closed
    state.pending = readChoices();
    if (chosenCount() < 4) { drawActions(); return; }
    var list = ORDER.map(function (id) { return state.pending[id]; });
    var res = A.playDay(state.life, list);
    state.choices.push(list);
    state.result = res; state.phase = 'reveal'; state.turned = {};
    noteQuoted(res);
    drawDay();
    focusOn($('next-day'));
    try { $('day-total').scrollIntoView({ block: 'nearest' }); } catch (e) {}
  }

  function drawSeasonEnd(round) {
    var kinId = state.life.kin;
    setText('season-title', W.seasonHeading());
    setText('season-intro', W.seasonIntro());
    setText('season-kin', W.seasonKin(round));
    fillList('season-changes', W.seasonKinChanges(round, titles()));
    fillList('season-houses', W.seasonHouses(round, kinId));
  }

  // The same button first brings up the season's end and then leaves it. A second press that lands
  // straight after the first (a double click, a double tap) must not carry the reader past the panel unread.
  var SEASON_HOLD_MS = 400, seasonAt = null;
  function nextDay() {
    if (state.view !== 'day' || state.phase === 'choose') return;
    if (state.phase === 'reveal' && state.result.lookingRound) {
      state.phase = 'season';
      seasonAt = now();
      drawDay();
      toTop();
      focusOn($('season-title'));
      return;
    }
    if (state.phase === 'season' && seasonAt !== null && now() - seasonAt < SEASON_HOLD_MS) return;
    seasonAt = null;
    if (state.life.over) { openLeaving(); return; }
    openDay();
    toTop();
    focusOn($('day-title'));
  }

  // ---- leaving ------------------------------------------------------------------------------

  function openLeaving() {
    var life = state.life;
    show('leaving');
    setText('leaving-title', W.leavingTitle());
    setText('leaving-store', W.leavingStore(life.purse, life.need));
    drawMeter('leaving-meter', life.purse, life.need, null);
    setText('leave-title', W.leaveHeading());
    drawWays('leaving-ways', true);
    setText('leaving-kin', W.leaveKin(A.legacy(life)));
  }

  // ---- the Afterwards -----------------------------------------------------------------------

  var ringRefs = [], playStart = 0, pumpTimer = null;
  var RING = { cx: 200, cy: 222, rx: 122, ry: 150, r: 17 };
  function ringAt(k) {
    var a = (90 + 45 * k) * Math.PI / 180;      // your own holding at the foot, its neighbours to either side
    return { x: RING.cx + RING.rx * Math.cos(a), y: RING.cy + RING.ry * Math.sin(a) };
  }
  function buildRing() {
    var host = $('ring'), defs = svg('defs'), clip = svg('clipPath', { id: 'ring-clip' }), ties = svg('g', {}), k, d, p, q;
    clear(host); ringRefs = [];
    clip.appendChild(svg('circle', { r: RING.r - 1 }));
    defs.appendChild(clip); host.appendChild(defs);
    for (k = 0; k < 8; k++) {
      for (d = 1; d <= 2; d++) {                 // each house is tied to the two on either side of it
        p = ringAt(k); q = ringAt((k + d) % 8);
        ties.appendChild(svg('line', { 'class': 'tie', x1: p.x.toFixed(1), y1: p.y.toFixed(1), x2: q.x.toFixed(1), y2: q.y.toFixed(1) }));
      }
    }
    host.appendChild(ties);
    for (k = 0; k < 8; k++) {
      p = ringAt(k);
      var g = svg('g', { 'class': 'house', transform: 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')' });
      var inner = svg('g', { 'clip-path': 'url(#ring-clip)' });
      var fill = svg('rect', { 'class': 'h-fill', x: -RING.r, y: RING.r, width: 2 * RING.r, height: 0 });
      var above = k >= 3 && k <= 5, dx = k === 1 ? -6 : k === 7 ? 6 : 0;
      var name = svg('text', { 'class': 'h-name', x: dx, y: above ? -41 : 39 });
      var num = svg('text', { 'class': 'h-num', x: dx, y: above ? -27 : 53 });
      g.appendChild(svg('circle', { 'class': 'h-yours', r: RING.r + 5.5 }));
      g.appendChild(svg('circle', { 'class': 'h-base', r: RING.r }));
      inner.appendChild(fill); g.appendChild(inner);
      g.appendChild(svg('circle', { 'class': 'h-rim', r: RING.r }));
      g.appendChild(name); g.appendChild(num);
      host.appendChild(g);
      ringRefs.push({ g: g, fill: fill, name: name, num: num });
    }
  }
  function drawRing(season) {
    var f = state.future, kinId = state.life.kin, se = f.seasons[season - 1];
    var kinGone = !!f.arrival && f.arrival.house === kinId && se.season >= f.arrival.season;
    se.houses.forEach(function (h, k) {
      var ref = ringRefs[k], share = Math.max(0, Math.min(1, h.helpRate)), yours = h.way === 0 || h.way === kinId;
      ref.fill.setAttribute('y', (RING.r - 2 * RING.r * share).toFixed(2));
      ref.fill.setAttribute('height', (2 * RING.r * share).toFixed(2));
      ref.g.setAttribute('class', 'house' + (yours ? ' yours' : ''));
      ref.name.textContent = W.ringLabel(h, kinId, kinGone);
      ref.num.textContent = String(h.income);
    });
  }
  function buildFlow() {
    var host = $('flow-bars'), P = state.life.params, top = 1 / (1 - P.FOG), i;
    clear(host);
    for (i = 1; i <= SEASONS; i++) host.appendChild(el('i', i > SEASONS - 10 ? 'late' : null));
    $('flow-line').style.bottom = (P.HOLD_LINE / top * 100).toFixed(2) + '%';
  }

  // Show the watched future up to a season: its bars, its events, the ring as it then stood.
  function showSeasons(upTo) {
    var f = state.future, bars = $('flow-bars').childNodes, ticker = $('ticker');
    var top = 1 / (1 - state.life.params.FOG), s;
    for (s = state.shown + 1; s <= upTo; s++) {
      bars[s - 1].style.height = (Math.max(0, Math.min(1, f.seasons[s - 1].flow / top)) * 100).toFixed(2) + '%';
      state.events.forEach(function (e) { if (e.season === s) ticker.appendChild(el('li', e.yours ? 'yours' : null, e.text)); });
    }
    if (upTo > state.shown) {
      state.shown = upTo;
      drawRing(upTo);
      setText('season-count', W.seasonCount(upTo));
      try { ticker.scrollTop = ticker.scrollHeight; } catch (e) {}
    }
  }

  function drawCounting() {
    var job = state.job, line = $('after-counting'), waiting = state.ended && !!job && !job.done;
    line.hidden = !waiting;
    if (waiting) line.textContent = W.counting(job);
  }
  // The verdict, counted in slices by time: short ones while the future plays, long ones once it has ended.
  function pump() {
    var job = state.job, start = now(), budget = state.ended ? 200 : 25;
    pumpTimer = null;
    if (!job) return;
    while (!job.done && now() - start < budget) A.verdictStep(job, 200);
    if (job.done) state.verdict = job.result;
    drawCounting();
    if (!job.done) pumpTimer = later(pump, 0);
  }

  function endAfterwards() {
    if (state.ended || state.view !== 'afterwards') return;
    var hadFocus = document.activeElement === $('skip');
    state.ended = true;
    intervals.forEach(function (id) { clearInterval(id); });
    intervals = [];
    showSeasons(SEASONS);
    state.future.finalWay.forEach(function (way, k) {      // the ring as the last season's end left it
      ringRefs[k].g.setAttribute('class', 'house' + (way === 0 || way === state.life.kin ? ' yours' : ''));
    });
    $('ticker').className = 'ticker done';
    setText('after-held', W.futureEnd(state.future));
    setText('after-yours', W.yoursEnd(state.future));
    $('after-end').hidden = false;
    $('skip').hidden = true;
    $('to-chronicle').hidden = false;
    if (hadFocus) focusOn($('to-chronicle'));
    if (pumpTimer !== null) { clearTimeout(pumpTimer); pumpTimer = null; }
    pump();                                     // finish what is left in a few large slices
  }

  function openAfterwards(atEnd) {
    var life = state.life;
    show('afterwards');
    state.future = A.runFuture(life, 0);
    state.events = W.futureEvents(state.future, life.kin);
    if (!state.job) state.job = A.verdictJob(life);
    state.shown = 0; state.ended = false;
    setText('after-title', W.afterTitle());
    setText('after-one', W.oneFuture(state.job.futures));
    setText('ring-legend', [W.legendFill(), W.legendNumber(), W.legendYours()].join(' '));
    setText('flow-caption', W.flowCaption());
    setText('flow-ten', W.lastTen());
    setText('ticker-title', W.tickerHeading());
    clear($('ticker'));
    $('ticker').className = 'ticker';
    $('after-end').hidden = true;
    $('after-counting').hidden = true;
    $('skip').hidden = false;
    $('to-chronicle').hidden = true;
    buildRing(); buildFlow();
    showSeasons(1);
    if (atEnd || reduced()) {
      endAfterwards();
      return;
    }
    playStart = now();
    every(function () {                          // driven by the clock, so it ends on time in a tab that is not in front
      var elapsed = now() - playStart;
      showSeasons(Math.min(SEASONS, Math.floor(elapsed / (PLAY_MS / SEASONS)) + 1));
      if (elapsed >= PLAY_MS) endAfterwards();
    }, 100);
    pumpTimer = later(pump, 0);
  }

  function toChronicle() {
    if (state.view !== 'afterwards' || !state.job) return;
    while (!state.job.done) A.verdictStep(state.job, 400);
    state.verdict = state.job.result;
    openChronicle();
  }

  // ---- the Chronicle ------------------------------------------------------------------------

  function fillMarks(id, held) {
    var host = $(id), frag = document.createDocumentFragment(), n = Math.min(200, held.length), i;
    clear(host);
    for (i = 0; i < n; i++) frag.appendChild(el('i', held[i] ? 'held' : 'fell'));
    host.appendChild(frag);
  }
  function drawScale(v) {
    var host = $('c-scale'), r = v.range;
    clear(host);
    $('c-sits').hidden = !r;
    if (!r) return;
    var lo = r.scaleLow, span = r.scaleHigh - r.scaleLow;
    function place(cls, x, text, extra) {
      var at = span > 0 ? Math.max(0, Math.min(100, (x - lo) / span * 100)) : 50;
      var mark = el('span', cls), label = el('span', 'sc-label' + (at < 14 ? ' at-start' : at > 86 ? ' at-end' : ''), text);
      if (extra) label.appendChild(document.createTextNode(' ' + extra));
      mark.style.left = at.toFixed(2) + '%';
      mark.appendChild(label);
      host.appendChild(mark);
    }
    host.appendChild(el('span', 'sc-axis'));
    place('sc-tick', r.worstPct, W.tickWorst(v));
    if (r.bestPct !== r.worstPct) place('sc-tick', r.bestPct, W.tickBest(v));
    place('sc-mark sc-old', v.baselinePct, W.markerOld(), W.pct(v.baselinePct));
    place('sc-mark sc-you', v.holdsPct, W.markerYou(), W.pct(v.holdsPct));
    setText('c-range', W.rangeLine(v));
  }

  function openChronicle() {
    var v = state.verdict, life = state.life, kinId = life.kin, f = state.future, lines, host;
    show('chronicle');
    setText('chronicle-title', W.chronicleTitle());
    setText('c-house-title', W.headHouse());
    setText('c-house', W.houseLine(v));
    setText('c-valley-title', W.headValley());
    setText('c-valley', W.valleyLine(v));
    setText('c-mark', W.markLine(v));
    setText('c-mark-note', W.markNote(v));
    $('c-seal').hidden = !(v.seal && v.seal.earned);           // the engine decides; the page does not rebuild the rule
    setText('c-seal-line', W.seal());
    setText('c-row-you', W.rowYou());
    setText('c-row-old', W.rowOld());
    fillMarks('c-held', v.held);
    fillMarks('c-base', v.baseline.held);
    setText('c-rows-caption', W.rowsCaption(v) + ' ' + W.rowsLegend());
    lines = W.explain(v);
    setText('c-explain-1', lines[0]);
    setText('c-explain-2', lines[1]);
    setText('c-sits-title', W.headSits());
    drawScale(v);
    $('c-last-section').hidden = !v.lastDay;
    setText('c-last-title', W.headLastDay());
    if (v.lastDay) setText('c-last', W.lastDayLine(v, kinId));
    setText('c-mattered-title', W.headMattered());
    setText('c-mattered', W.mattered(v, titles()));
    setText('c-became-title', W.headBecame());
    lines = W.became(f, kinId);
    fillList('c-became', lines);
    host = $('c-became');
    if (host.lastChild) host.lastChild.className = 'closing';
    setText('c-valley-no', W.valleyNo(life.seed));
    if (!state.saved) { state.saved = true; saveLife(W.record(v, life.seed)); }
    drawLives('c-lives', 'c-lives-list', state.lives.slice(1));   // the lives before this one
  }

  // ---- fixed copy, wiring, start ------------------------------------------------------------

  function drawOpening() {
    var lines = W.opening();
    setText('opening-title', W.title());
    setText('op-lede', lines[0]);
    fillList('op-lines', lines.slice(1));
    setText('op-far', W.stakeFar());
    setText('op-near', W.stakeNear());
    setText('op-ford-name', W.fordLabel());
    setText('begin', W.begin());
    setText('op-lives-title', W.livesHeading());
    drawLives('op-lives', 'op-lives-list', state.lives);
  }
  function drawFixed() {
    setText('day-last', W.lastDayNote());
    setText('elsewhere-title', W.elsewhereHeading());
    setText('small-print', W.smallPrint());
    setText('ways-title', W.waysHeading());
    setText('store-title', W.storeLabel());
    setText('leave', W.leaveLabel());
    setText('skip', W.skip());
    setText('to-chronicle', W.toChronicle());
    setText('again', W.again());
    setText('again-same', W.againSame());
    setText('c-lives-title', W.livesHeading());
  }

  function wire() {
    function onClick(id, fn) {
      var b = $(id);
      b.addEventListener('click', fn);
      b.addEventListener('keydown', function (e) { if (e.repeat && (e.key === 'Enter' || e.key === ' ')) e.preventDefault(); });
    }
    onClick('begin', function () {
      var seed = hashSeed(), life = null;
      if (seed !== null) { try { life = A.createLife(seed); } catch (e) { life = null; } }   // a hash the engine cannot read as a valley
      beginLife(life || A.createLife(freshSeed()));
    });
    onClick('close-day', closeDay);
    onClick('next-day', nextDay);
    onClick('leave', function () { if (state.view === 'leaving') openAfterwards(false); });
    onClick('skip', endAfterwards);
    onClick('to-chronicle', toChronicle);
    onClick('again', function () { startLife(freshSeed()); });
    onClick('again-same', function () { startLife(state.seed); });

    $('cards').addEventListener('change', onChoice);
    $('cards').addEventListener('input', onChoice);
    $('cards').addEventListener('click', function (e) {
      var b = up(e.target, function (n) { return n.nodeName === 'BUTTON'; });
      if (!b) { onChoice(); return; }
      if (b.hasAttribute('data-why')) turnCard(b.getAttribute('data-why'), true);
      else if (b.hasAttribute('data-unturn')) turnCard(b.getAttribute('data-unturn'), false);
    });
    $('elsewhere-list').addEventListener('click', function (e) {
      var b = up(e.target, function (n) { return n.nodeName === 'BUTTON'; });
      if (b && b.hasAttribute('data-why')) toggleElsewhere(b.getAttribute('data-why'));
    });
  }

  // What a reload needs to bring the Life back: its seed, its choices, and where the reader was.
  function snapshot() {
    return { seed: state.seed, choices: state.choices, pending: state.pending, view: state.view, phase: state.phase,
             knowOpen: state.knowOpen, ended: state.ended, saved: state.saved,
             quotedOpened: !!(state.quoted && state.quoted.opened) };
  }
  function restore(data) {
    if (!data || data.seed === null || data.seed === undefined || !Array.isArray(data.choices)) return false;
    if (['day', 'leaving', 'afterwards', 'chronicle'].indexOf(data.view) < 0) return false;
    var life = A.createLife(data.seed), res = null, before = null;
    resetLife(life);
    data.choices.slice(0, 12).forEach(function (list) {
      before = A.today(life);
      res = A.playDay(life, list);
      state.choices.push(list.map(function (x) { return !!x; }));
      noteQuoted(res);
    });
    if (state.quoted && data.quotedOpened) state.quoted.opened = true;
    state.knowOpen = typeof data.knowOpen === 'boolean' ? data.knowOpen : null;
    state.saved = !!data.saved;
    if (data.view === 'day') {
      show('day');
      if (data.phase === 'choose' || !res) {
        if (life.over) { openLeaving(); return true; }
        openDay();
        ORDER.forEach(function (id) { if (data.pending && typeof data.pending[id] === 'boolean') state.pending[id] = data.pending[id]; });
        drawDay();
      } else {
        state.today = before; state.result = res; state.pending = picksOf(state.choices[state.choices.length - 1]);
        state.phase = data.phase === 'season' && res.lookingRound ? 'season' : 'reveal';
        drawDay();
      }
      return true;
    }
    if (!life.over) return false;
    if (data.view === 'leaving') { openLeaving(); return true; }
    openAfterwards(data.view === 'chronicle' || !!data.ended);
    if (data.view === 'chronicle') toChronicle();
    return true;
  }

  var started = false;
  function start(data) {
    if (started) return;
    started = true;
    state.lives = loadLives();
    wire();
    drawFixed();
    drawOpening();
    var back = false;
    try { back = restore(data); } catch (e) { back = false; }
    if (!back) {                                  // nothing to bring back: the opening, as the page stands at rest
      cancelTimers();
      state.life = null; state.seed = null; state.choices = []; state.pending = {}; state.phase = 'choose';
      state.today = null; state.result = null; state.turned = {}; state.quoted = null;
      state.future = null; state.events = []; state.shown = 0; state.ended = false;
      state.job = null; state.verdict = null; state.saved = false;
      state.view = 'opening';
      var nodes = document.querySelectorAll('[data-view]'), i;
      for (i = 0; i < nodes.length; i++) nodes[i].hidden = nodes[i].getAttribute('data-view') !== 'opening';
    }
  }

  var hot = window.claude && window.claude.hot;
  if (hot && typeof hot.snapshot === 'function') { try { hot.snapshot(snapshot); } catch (e) {} }
  function boot() {
    if (hot && typeof hot.ready === 'function') hot.ready(function (data) { start(data || hot.data || {}); });
    else start((hot && hot.data) || {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
