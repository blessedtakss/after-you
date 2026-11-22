/*
 * After You: the page. Plain JavaScript on top of engine.js (AfterYou) and words.js (AYWords).
 * Every sentence shown comes from AYWords; every number comes from the engine.
 *
 * One plain state object. A Life is its seed and the list of choices made so far: rebuild()
 * replays them and gets the same Life back.
 */
(function () {
  'use strict';

  var A = window.AfterYou, W = window.AYWords, doc = document;
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var LIVES_KEY = 'after-you.lives.v1';
  var AFTER_MS = 20000;            // the thirty seasons play in about twenty seconds
  var SEASONS = 30;

  var state = {
    view: 'opening',
    seed: null,          // valley number of the Life in progress
    choices: [],         // one { neighbourId: true | false } per closed day
    picks: {},           // today's choices so far
    phase: 'choose',     // within the day view: 'choose' | 'revealed' | 'season'
    life: null,          // the engine's Life (rebuilt from seed + choices)
    today: null,         // today() as it stood before the day was closed
    result: null,        // what playDay() returned for the day on screen
    titles: [],          // the five situation titles, in the reader's words
    flipped: {},         // which cards show their Why? side
    elseOpen: {},        // which "Elsewhere today" reasons are open
    knowOpen: {},        // phone only: which "What you know of them" sections are open
    firstYou: null,      // { day, key }: the first Why? in this Life that leads back to the reader
    firstYouSeen: false,
    future: null,        // the watched future, runFuture(life, 0)
    shownSeason: 0,
    afterDone: false,    // the Afterwards has played to its end, or was skipped
    job: null,           // the verdict job
    verdict: null,       // its result
    thenChronicle: false,
    recorded: false,     // this Life is already in the list of past lives
    lives: [],           // past lives, newest first
    hashSeed: null       // a valley fixed by #valley-<number>
  };
  window.AYApp = { state: state };

  // ---- small tools ------------------------------------------------------------------------------

  function $(id) { return doc.getElementById(id); }
  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function svg(tag, attrs, text) {
    var n = doc.createElementNS(SVG_NS, tag), k;
    for (k in attrs) n.setAttribute(k, attrs[k]);
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function add(parent) {
    for (var i = 1; i < arguments.length; i++) if (arguments[i]) parent.appendChild(arguments[i]);
    return parent;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }
  function setText(id, text) { $(id).textContent = text; }
  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function media(q) { return !!(window.matchMedia && window.matchMedia(q).matches); }
  function reducedMotion() { return media('(prefers-reduced-motion: reduce)'); }
  function narrow() { return media('(max-width: 620px)'); }
  function focusQuiet(n) {
    if (!n) return;
    try { n.focus({ preventScroll: true }); } catch (e) { try { n.focus(); } catch (e2) { /* nothing to focus */ } }
  }
  function toTop() { try { window.scrollTo(0, 0); } catch (e) { /* no scrolling here */ } }
  function bringIntoView(n) {
    var r = n.getBoundingClientRect(), vh = window.innerHeight || doc.documentElement.clientHeight || 0;
    if (r.top >= 0 && r.top <= vh * 0.55) return;
    try { n.scrollIntoView({ block: 'start' }); } catch (e) { n.scrollIntoView(true); }
  }
  function fordMark() {
    var s = svg('svg', { 'class': 'ford-mark', viewBox: '0 0 22 10', 'aria-hidden': 'true', focusable: 'false' });
    s.appendChild(svg('use', { href: '#g-ford' }));
    return s;
  }
  function mirror(s) { return s === 2 ? 3 : s === 3 ? 2 : s; }   // the same tie, seen from the other house

  // A double click lands its second click on whatever replaced the first button: the next step,
  // a choice on a card, a Why?. That second click (detail 2 or more, within half a second of the
  // step it followed) is let pass: bind() stops it on the way down, before it reaches anything.
  var lastStep = -1000;
  function stepped() { lastStep = now(); }
  function doubled(e) { return !!(e && e.detail > 1 && now() - lastStep < 500); }

  // Timers. Everything pending is cancelled when the view changes or a new Life starts.
  var timers = [];
  function later(fn, ms) {
    var t = { id: 0, every: false };
    t.id = setTimeout(function () { var i = timers.indexOf(t); if (i >= 0) timers.splice(i, 1); fn(); }, ms);
    timers.push(t);
    return t;
  }
  function every(fn, ms) {
    var t = { id: setInterval(fn, ms), every: true };
    timers.push(t);
    return t;
  }
  function cancel(t) {
    if (!t) return;
    if (t.every) clearInterval(t.id); else clearTimeout(t.id);
    var i = timers.indexOf(t);
    if (i >= 0) timers.splice(i, 1);
  }
  function cancelTimers() { while (timers.length) cancel(timers[0]); }

  // ---- views ------------------------------------------------------------------------------------

  function show(view, focusId, quiet) {
    cancelTimers();
    var views = doc.querySelectorAll('[data-view]'), i;
    for (i = 0; i < views.length; i++) views[i].hidden = views[i].getAttribute('data-view') !== view;
    state.view = view;
    if (quiet) return;                     // first paint: leave focus and scroll where the host put them
    toTop();
    focusQuiet($(focusId));
  }

  // ---- past lives (localStorage, and the page works without it) ------------------------------------

  function validLife(r) {
    return r && typeof r === 'object' && isFinite(r.seed) && isFinite(r.purse) && isFinite(r.need) && isFinite(r.mark);
  }
  function loadLives() {
    try {
      var raw = window.localStorage.getItem(LIVES_KEY), list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter(validLife).slice(0, 20) : [];
    } catch (e) { return []; }
  }
  function saveLives() {
    try { window.localStorage.setItem(LIVES_KEY, JSON.stringify(state.lives)); } catch (e) { /* kept in memory only */ }
  }
  function renderLives(wrapId, headId, listId) {
    var wrap = $(wrapId), list = clear($(listId)), i, r, li;
    wrap.hidden = state.lives.length === 0;
    setText(headId, W.pastHeading());
    for (i = 0; i < state.lives.length; i++) {
      r = state.lives[i];
      li = el('li', r.seal ? 'sealed' : null, W.pastLife({ seed: r.seed, kept: !!r.kept, purse: r.purse, need: r.need, mark: r.mark, seal: !!r.seal }));
      list.appendChild(li);
    }
  }

  // ---- the Life ---------------------------------------------------------------------------------

  function freshSeed() {
    var n;
    try { var a = new Uint32Array(1); window.crypto.getRandomValues(a); n = a[0]; }
    catch (e) { n = Math.floor(Math.random() * 4294967296); }
    return 10000 + (n % 90000);
  }
  function resetLife() {
    cancelTimers();
    state.choices = []; state.picks = {}; state.phase = 'choose'; state.result = null; state.today = null;
    state.flipped = {}; state.elseOpen = {}; state.firstYou = null; state.firstYouSeen = false;
    state.future = null; state.shownSeason = 0; state.afterDone = false; state.job = null; state.verdict = null;
    state.thenChronicle = false; state.recorded = false;
  }
  function beginLife(seed) {
    resetLife();
    stepped();
    state.life = A.createLife(seed);
    state.seed = state.life.seed;
    state.titles = A.ways(state.life).map(function (w) { return w.title; });
    openDay();
    show('day', 'day-h');
  }
  function noteFirstYou(res) {
    if (state.firstYou) return;
    var i;
    for (i = 0; i < res.results.length; i++) {
      if (res.results[i].why.source.type === 'you') { state.firstYou = { day: res.day, key: 'card-' + res.results[i].id }; return; }
    }
    for (i = 0; i < res.kinWith.length; i++) {
      if (res.kinWith[i].why.source.type === 'you') { state.firstYou = { day: res.day, key: 'kin-' + res.kinWith[i].id }; return; }
    }
  }
  // The same Life again from its seed and its choices. keepLast: leave the last closed day on
  // screen (its reveal or its season's end) instead of opening the day after it.
  function rebuild(seed, choices, keepLast) {
    var life = A.createLife(seed), before = null, res = null, i;
    state.firstYou = null;
    for (i = 0; i < choices.length; i++) {
      before = A.today(life);
      res = A.playDay(life, choices[i]);
      noteFirstYou(res);
    }
    state.life = life; state.seed = life.seed; state.choices = choices.slice();
    state.titles = A.ways(life).map(function (w) { return w.title; });
    if (keepLast && res) { state.today = before; state.result = res; }
    else { state.today = A.today(life); state.result = null; state.phase = 'choose'; }
  }

  // ---- the day ----------------------------------------------------------------------------------

  function openDay() {
    state.today = A.today(state.life);
    state.picks = {}; state.phase = 'choose'; state.result = null;
    state.flipped = {}; state.elseOpen = {};
    renderDay();
  }

  function renderTrack(node, day) {
    clear(node);
    for (var g = 0; g < 3; g++) {
      var group = el('span', 'stick-group');
      for (var k = 1; k <= 4; k++) {
        var d = g * 4 + k;
        group.appendChild(el('i', 'notch' + (d < day ? ' spent' : d === day ? ' today' : '')));
      }
      node.appendChild(group);
    }
  }

  // The measuring rod: grain filled in from the left, graduations every four measures, the need cut into it.
  function renderRod(node, purse, need) {
    var top = Math.ceil(Math.max(need + 12, purse + 4) / 4) * 4;
    var fill = el('div', 'rod-fill'), ticks = el('div', 'rod-ticks'), mark = el('div', 'rod-need');
    fill.style.width = (Math.max(0, Math.min(purse, top)) / top * 100) + '%';   // drawn from zero; the number printed is the true one
    ticks.style.setProperty('--steps', String(top / 4));
    mark.style.left = (need / top * 100) + '%';
    mark.appendChild(el('span', null, W.storeNeed(need)));
    add(clear(node), fill, ticks, mark);
  }
  function renderStore(purse, need, oldWayPurse) {
    var text = W.store(purse, need), cutAt = text.indexOf(' '), p = clear($('store-num'));
    setText('store-h', W.storeHeading());
    add(p, el('b', null, text.slice(0, cutAt)), doc.createTextNode(text.slice(cutAt)));
    renderRod($('store-rod'), purse, need);
    setText('store-old', W.oldWay(oldWayPurse));
  }

  function cutsRow(marks, theirs) {
    // marks: [{ helped, fresh, pending, gap }]
    var row = el('div', 'cuts' + (theirs ? ' theirs' : '') + (marks.length ? '' : ' empty'));
    row.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < marks.length; i++) {
      var m = marks[i];
      row.appendChild(el('i', m.gap ? 'cut gap' : 'cut ' + (m.helped ? 'full' : 'shallow') + (m.fresh ? ' fresh' : '') + (m.pending ? ' pending' : '')));
    }
    return row;
  }
  function deedMarks(deeds, freshDay) {
    var out = [], i;
    for (i = 0; i < deeds.length; i++) {
      if (i && deeds[i].day !== deeds[i - 1].day) out.push({ gap: true });
      out.push({ helped: deeds[i].helped, fresh: deeds[i].day === freshDay });
    }
    return out;
  }
  function renderWays() {
    var wy = A.ways(state.life), t = state.today, box = clear($('ways-rows')), choosing = state.phase === 'choose';
    var freshDay = state.choices.length, anyPending = false, s, i;
    setText('ways-h', W.waysHeading());
    for (s = 0; s < 5; s++) {
      var marks = deedMarks(wy[s].deeds, freshDay);
      if (choosing) {
        var first = true;
        for (i = 0; i < t.neighbours.length; i++) {
          var n = t.neighbours[i], pick = state.picks[n.id];
          if (n.situation !== s || typeof pick !== 'boolean') continue;
          if (first && marks.length) marks.push({ gap: true });
          first = false; anyPending = true;
          marks.push({ helped: pick, pending: true });
        }
      }
      var row = el('div', 'way' + (wy[s].n === 0 ? ' untested' : '')), head = el('div', 'way-head');
      add(head, el('span', 'way-title', wy[s].title), el('span', 'way-count', W.wayCount(wy[s])));
      add(row, head, cutsRow(marks, false));
      box.appendChild(row);
    }
    var key = clear($('ways-key'));
    key.appendChild(doc.createTextNode(W.waysKey()));
    if (anyPending) key.appendChild(doc.createTextNode(' ' + W.waysPending()));
  }

  // The day a neighbour took up the reader's own ways, as a season's end already reported it.
  function tookDay(id, beforeDay) {
    var rounds = state.life.rounds, r, i, e;
    for (r = rounds.length - 1; r >= 0; r--) {
      if (rounds[r].season * 4 >= beforeDay) continue;
      for (i = 0; i < rounds[r].reconsidered.length; i++) {
        e = rounds[r].reconsidered[i];
        if (e.house === id && e.adopted && e.took > 0) return e.model === 0 ? rounds[r].season * 4 : 0;
      }
    }
    return 0;
  }

  // The reason a house acted as it did, as a block of lines (the back of a card, or under "Elsewhere today").
  function buildWhy(why, ctx) {
    var body = el('div', 'why-body'), src = W.whySource(why, ctx), deeds = W.whyDeeds(why, ctx), close = W.whyClose(why, ctx), i;
    var fromYou = why.source.type === 'you';
    body.appendChild(el('p', 'why-stood', W.whyStood(why, ctx)));
    body.appendChild(el('p', 'why-claim' + (fromYou ? ' yours' : ''), src[0]));
    if (src.length > 1) body.appendChild(el('p', 'why-count', src[1]));
    if (fromYou) {
      body.appendChild(cutsRow(deedMarks(why.source.deeds, -1), false));      // your own cuts, quoted back
    } else if (why.source.type === 'own' && why.seen.n > 0) {
      var marks = [];
      for (i = 0; i < why.seen.n; i++) marks.push({ helped: i < why.seen.h });
      body.appendChild(cutsRow(marks, true));                                 // what you had counted of them
    }
    if (deeds.length) {
      var list = el('ul', 'why-deeds');
      for (i = 0; i < deeds.length; i++) list.appendChild(el('li', deeds[i].indexOf('Day ') === 0 ? null : 'more', deeds[i]));
      body.appendChild(list);
    }
    for (i = 0; i < close.length; i++) body.appendChild(el('p', 'why-close', close[i]));
    return body;
  }

  function buildCard(n, i) {
    var revealed = state.phase !== 'choose', r = revealed ? state.result.results[i] : null;
    var card = el('article', 'card' + (n.kin ? ' kin' : '') + (state.flipped[n.id] ? ' flipped' : ''));
    var inner = el('div', 'card-inner'), front = el('div', 'face front'), back = el('div', 'face back');
    card.setAttribute('data-house', String(n.id));
    card.setAttribute('aria-labelledby', 'house-' + n.id);

    // names
    var head = el('div', 'card-head'), names = el('div', 'card-names'), title = el('h2', 'card-title');
    title.id = 'house-' + n.id;
    if (n.kin) { var km = el('span', 'kin-mark'); km.setAttribute('aria-hidden', 'true'); title.appendChild(km); }
    title.appendChild(doc.createTextNode(W.cardTitle(n)));
    var took = n.kin ? 0 : tookDay(n.id, state.today.day);
    var sub = el('p', 'card-sub' + (took ? ' yours' : ''), n.kin ? W.cardSub(n) : took ? W.tookYourWays(took) : '');
    add(names, title, sub);
    head.appendChild(names);
    if (revealed) {
      var whyBtn = el('button', 'btn btn-small why-btn', W.why());
      whyBtn.type = 'button';
      whyBtn.setAttribute('data-why', String(n.id));
      if (state.firstYou && !state.firstYouSeen && state.firstYou.day === state.result.day && state.firstYou.key === 'card-' + n.id) {
        whyBtn.className += ' led';
        whyBtn.appendChild(el('span', 'sr', ' ' + W.whyFromYou()));
      }
      head.appendChild(whyBtn);
    }

    // what happened: yesterday, or today once the day is closed
    var line = el('p', 'card-line'), txt = el('span', 'txt');
    if (!revealed) {
      if (n.yesterday && n.yesterday.intended && n.yesterday.lost) txt.appendChild(fordMark());
      txt.appendChild(doc.createTextNode(W.yesterday(n.yesterday)));
      line.appendChild(txt);
    } else {
      if (r.intended && r.lost) txt.appendChild(fordMark());
      txt.appendChild(doc.createTextNode(W.reveal(r)));
      add(line, txt, el('span', 'delta ' + (r.payoff > 0 ? 'gain' : r.payoff < 0 ? 'loss' : 'none'), W.delta(r.payoff)));
    }

    // the choice
    var field = el('fieldset', 'choice'), legend = el('legend', 'sr', W.choiceFor(n)), row = el('div', 'choice-row');
    var chosen = revealed ? r.intended : state.picks[n.id];
    [['send', true, W.send(), 'full'], ['stay', false, W.stay(), 'shallow']].forEach(function (o) {
      var input = el('input'), label = el('label', 'opt opt-' + o[0]), glyph = el('i', 'cut ' + o[3]);
      input.type = 'radio'; input.name = 'choice-' + n.id; input.value = o[0]; input.id = 'choice-' + n.id + '-' + o[0];
      input.checked = chosen === o[1];
      input.disabled = revealed;
      label.htmlFor = input.id;
      glyph.setAttribute('aria-hidden', 'true');
      add(label, glyph, el('span', null, o[2]));
      add(row, input, label);
    });
    add(field, legend, row);

    // what you know of them
    var rows = n.changedDay !== null ? n.seenSince : n.seen, theirs = mirror(n.situation), s;
    var nowLine = el('p', 'know-now');
    add(nowLine, el('span', 'small', W.standsToday()), el('b', null, W.seenRow(theirs, rows[theirs])));
    var know = el('details', 'know'), summary = el('summary', 'label', W.knowHeading()), dl = el('dl', 'know-rows');
    know.appendChild(summary);
    if (n.changedDay !== null) know.appendChild(el('p', 'know-changed', W.seenChanged(n.changedDay)));
    for (s = 0; s < 5; s++) {
      var dt = el('dt', s === theirs ? 'now' : null, W.seenLabel(s));
      if (s === theirs) dt.appendChild(el('span', 'tag', W.todayTag()));
      add(dl, dt, el('dd', (rows[s].n === 0 ? 'unseen' : '') + (s === theirs ? ' now' : ''), W.seenCount(rows[s])));
    }
    add(know, dl, el('p', 'small', W.seenNote()));
    know.open = !narrow() || !!state.knowOpen[n.id];
    if (!narrow()) summary.tabIndex = -1;
    know.addEventListener('toggle', function () { if (narrow()) state.knowOpen[n.id] = know.open; });

    add(front, head, line, field, nowLine, know);

    if (revealed) {
      var backBtn = el('button', 'btn btn-small', W.back());
      backBtn.type = 'button';
      backBtn.setAttribute('data-back', String(n.id));
      add(back,
        el('p', 'back-title' + (n.kin ? ' kin' : ''), W.cardTitle(n)),
        buildWhy(r.why, { name: r.name, kin: r.kin, kinId: state.life.kin, arrived: r.they, third: null, changedDay: n.changedDay }),
        backBtn);
    }
    add(inner, front, back);
    card.appendChild(inner);
    return card;
  }
  function renderCards() {
    var box = clear($('cards')), t = state.today, i;
    box.hidden = state.phase === 'season';
    if (state.phase === 'season') return;
    for (i = 0; i < t.neighbours.length; i++) box.appendChild(buildCard(t.neighbours[i], i));
  }
  function syncKnow() {
    var all = doc.querySelectorAll('#cards details.know'), i, id;
    for (i = 0; i < all.length; i++) {
      id = all[i].parentNode.parentNode.parentNode.getAttribute('data-house');
      all[i].open = !narrow() || !!state.knowOpen[id];
      all[i].firstChild.tabIndex = narrow() ? 0 : -1;
    }
  }

  function renderElsewhere() {
    var box = clear($('elsewhere')), res = state.result;
    box.hidden = state.phase !== 'revealed';
    if (state.phase !== 'revealed') return;
    var kinName = state.life.houses[state.life.kin].name;
    box.appendChild(el('h2', 'label', W.elsewhereHeading()));
    res.kinWith.forEach(function (e) {
      var line = el('div', 'else-line');
      line.appendChild(el('span', null, W.elsewhere(e)));
      box.appendChild(line);
      if (e.why.source.type !== 'you') return;
      var btn = el('button', 'btn btn-small why-btn', W.why()), panel = el('div', 'else-why');
      btn.type = 'button';
      btn.setAttribute('data-why-kin', String(e.id));
      btn.setAttribute('aria-expanded', state.elseOpen[e.id] ? 'true' : 'false');
      panel.id = 'else-why-' + e.id;
      btn.setAttribute('aria-controls', panel.id);
      if (state.firstYou && !state.firstYouSeen && state.firstYou.day === res.day && state.firstYou.key === 'kin-' + e.id) {
        btn.className += ' led';
        btn.appendChild(el('span', 'sr', ' ' + W.whyFromYou()));
      }
      panel.hidden = !state.elseOpen[e.id];
      panel.appendChild(buildWhy(e.why, { name: kinName, kin: true, kinId: state.life.kin, arrived: e.kinSent, third: { name: e.name }, changedDay: null }));
      btn.addEventListener('click', function (click) {
        if (doubled(click)) return;
        state.elseOpen[e.id] = !state.elseOpen[e.id];
        panel.hidden = !state.elseOpen[e.id];
        btn.setAttribute('aria-expanded', state.elseOpen[e.id] ? 'true' : 'false');
        if (btn.classList.contains('led')) { state.firstYouSeen = true; btn.classList.remove('led'); }
      });
      line.appendChild(btn);
      box.appendChild(panel);
    });
  }

  function renderSeason() {
    var box = $('season-end'), on = state.phase === 'season';
    box.hidden = !on;
    if (!on) return;
    var round = state.result.lookingRound, kin = clear($('season-kin')), others = clear($('season-others'));
    setText('season-h', W.seasonHeading());
    setText('season-intro', W.seasonIntro());
    W.seasonKin(round, state.titles).forEach(function (text, i) {
      var li = el('li');
      if (i === 0) { var km = el('span', 'kin-mark'); km.setAttribute('aria-hidden', 'true'); li.appendChild(km); }
      li.appendChild(doc.createTextNode(text));
      kin.appendChild(li);
    });
    // Lines in the order of the visible entries; one that took up the reader's own ways is marked as theirs.
    var lines = W.seasonOthers(round), visible = round.reconsidered.filter(function (e) { return e.visible; });
    lines.forEach(function (text, i) {
      var e = visible[i], yours = !!(e && e.adopted && e.took > 0 && e.model === 0);
      others.appendChild(el('li', yours ? 'yours' : null, text));
    });
  }

  function countPicks() {
    var t = state.today, c = 0, i;
    for (i = 0; i < t.neighbours.length; i++) if (typeof state.picks[t.neighbours[i].id] === 'boolean') c++;
    return c;
  }
  function renderActions() {
    var close = $('close-day'), next = $('next-day'), out = clear($('day-result')), res = state.result;
    setText('day-echo', '');
    if (state.phase === 'choose') {
      var left = state.today.neighbours.length - countPicks();
      close.hidden = false; next.hidden = true;
      close.disabled = left > 0;
      close.textContent = W.closeDay(left);
      return;
    }
    close.hidden = true; next.hidden = false;
    next.textContent = state.phase === 'revealed'
      ? (res.lookingRound ? W.toSeasonEnd() : state.life.over ? W.toLeaving() : W.nextDay())
      : (state.life.over ? W.toLeaving() : W.nextDay());
    out.appendChild(doc.createTextNode(W.dayTotal(res)));
    setText('day-echo', W.dayTotal(res));           // narrow screens: the total again, beside the button
    if (state.phase === 'revealed') {
      var heard = state.today.neighbours.map(function (n, i) { return W.cardTitle(n) + ': ' + W.revealLine(res.results[i]); });
      out.appendChild(el('span', 'sr', ' ' + heard.join(' ')));
    }
  }

  function renderDay() {
    var t = state.today, res = state.result, revealed = state.phase !== 'choose';
    setText('day-title', W.dayOf(t.day));
    $('day-last').hidden = t.day !== 12;
    setText('day-last', W.lastDayNote());
    renderTrack($('track'), t.day);
    $('track').setAttribute('aria-label', W.dayOf(t.day));
    renderStore(revealed ? res.purse : t.purse, t.need, t.oldWayPurse);
    renderCards();
    renderElsewhere();
    renderSeason();
    renderWays();
    renderActions();
    var note = clear($('ford-note'));
    add(note, fordMark(), doc.createTextNode(W.fordNote()));
  }

  function onPick(id, send) {
    if (state.view !== 'day' || state.phase !== 'choose') return;
    state.picks[id] = send;
    renderActions();
    renderWays();
  }

  function closeDay() {
    if (state.view !== 'day' || state.phase !== 'choose') return;       // once closed, the day's controls are inert
    var t = state.today, picks = {}, i, id;
    for (i = 0; i < t.neighbours.length; i++) {
      id = t.neighbours[i].id;
      if (typeof state.picks[id] !== 'boolean') return;
      picks[id] = state.picks[id];
    }
    state.phase = 'revealed';
    stepped();
    var res = A.playDay(state.life, picks);
    state.choices.push(picks);
    state.result = res;
    noteFirstYou(res);
    renderDay();
    focusQuiet($('next-day'));
    bringIntoView($('cards'));
  }

  function nextDay() {
    if (state.view !== 'day' || state.phase === 'choose') return;
    stepped();
    if (state.phase === 'revealed' && state.result.lookingRound) {
      state.phase = 'season';
      renderDay();
      bringIntoView($('season-end'));
      focusQuiet($('season-h'));
      return;
    }
    if (state.life.over) { openLeaving(); return; }
    openDay();
    toTop();
    focusQuiet($('day-h'));
  }

  function flip(id, on) {
    var card = doc.querySelector('#cards [data-house="' + id + '"]');
    if (!card || state.phase !== 'revealed') return;
    state.flipped[id] = on;
    card.classList.toggle('flipped', on);
    var whyBtn = card.querySelector('.why-btn');
    if (on && whyBtn && whyBtn.classList.contains('led')) { state.firstYouSeen = true; whyBtn.classList.remove('led'); }
    // The face turning toward the reader is visible (and focusable) at once; focus goes with it.
    focusQuiet(on ? card.querySelector('[data-back]') : card.querySelector('.why-btn'));
  }

  // ---- leaving ----------------------------------------------------------------------------------

  function openLeaving() {
    var life = state.life, lg = A.legacy(life), wy = A.ways(life), rows = clear($('leave-rows')), s;
    stepped();
    setText('leaving-h', W.leavingHeading());
    setText('leaving-store', W.leavingStore(life.purse, life.need));
    renderRod($('leaving-rod'), life.purse, life.need);
    setText('leave-h', W.leaveHeading());
    for (s = 0; s < 5; s++) {
      var text = W.leaveRow(s, lg, state.titles), cutAt = state.titles[s].length;
      var row = el('div', 'leave-row' + (lg.hollow[s] ? ' untested' : '')), p = el('p');
      add(p, el('span', 'way-title', text.slice(0, cutAt)), doc.createTextNode(text.slice(cutAt)));
      add(row, p, cutsRow(deedMarks(wy[s].deeds, -1), false));
      rows.appendChild(row);
    }
    setText('leave-kin', W.leaveKin(lg));
    setText('leave', W.leave());
    show('leaving', 'leaving-h');
  }

  // ---- the Afterwards ---------------------------------------------------------------------------

  var RING = { cx: 220, cy: 290, rx: 152, ry: 225 };
  var ring = null;            // the drawn ring: per house, the nodes that change each season
  var playTimer = null, verdictTimer = null;

  // House 0 at the foot of the ring, its neighbours to either side, the far houses across the top.
  function ringPoint(i) {
    var a = Math.PI / 2 - i * Math.PI / 4;
    return { x: RING.cx + RING.rx * Math.cos(a), y: RING.cy + RING.ry * Math.sin(a) };
  }
  function handX(p, k) { return p.x - 60 + k * 4.6 + Math.floor(k / 4) * 4 + 1; }

  function buildRing() {
    var root = clear($('ring')), i, d, k, a, b;
    ring = { houses: [], num: null };
    for (i = 0; i < 8; i++) for (d = 1; d <= 2; d++) {       // every house is tied to the two on either side of it
      a = ringPoint(i); b = ringPoint((i + d) % 8);
      root.appendChild(svg('line', { 'class': 'tie', x1: a.x, y1: a.y, x2: b.x, y2: b.y }));
    }
    root.appendChild(svg('text', { 'class': 'season-word', x: RING.cx, y: RING.cy - 30 }, W.seasonWord()));
    ring.num = svg('text', { 'class': 'season-num', x: RING.cx, y: RING.cy + 34 }, '');
    root.appendChild(ring.num);
    for (i = 0; i < 8; i++) {
      var p = ringPoint(i), g = svg('g', { 'class': 'house' }), hands = [];
      g.appendChild(svg('rect', { 'class': 'plate', x: p.x - 64, y: p.y - 10, width: 128, height: 56 }));
      g.appendChild(svg('rect', { 'class': 'glyph-outer', x: p.x - 9, y: p.y - 9, width: 18, height: 18 }));
      g.appendChild(svg('rect', { 'class': 'glyph', x: p.x - 5.5, y: p.y - 5.5, width: 11, height: 11 }));
      var name = svg('text', { 'class': 'hname', x: p.x, y: p.y + 24 }, '');
      g.appendChild(name);
      for (k = 0; k < 16; k++) {
        var h = svg('line', { 'class': 'hand' });
        hands.push(h); g.appendChild(h);
      }
      var inc = svg('text', { 'class': 'inc', x: p.x + 62, y: p.y + 42 }, '');
      g.appendChild(inc);
      root.appendChild(g);
      ring.houses.push({ g: g, name: name, hands: hands, inc: inc, p: p });
    }
  }
  // The reader's ways: the label the heir carries, and the one kin learned from the reader.
  function yoursWay(w) { return w === 0 || w === state.life.kin; }
  // Is kin's family still on its holding in this season of the watched future?
  function kinHolds(season) {
    var a = state.future.arrival;
    return !(a && a.house === state.life.kin && season >= a.season);
  }
  // Does this event get a line in the ticker?
  function tickerShows(ev) {
    if (ev.type === 'arrival') return true;
    if (ev.type !== 'adopt' || !ev.changed) return false;
    return !(yoursWay(ev.way) && yoursWay(ev.from));     // keeping your ways through another house is no change
  }
  // The way a house was running as a season opened, before any newcomers took its holding: what it
  // ran the season before, or what it took up at that season's Looking-Round.
  function wayBefore(id, season) {
    if (season < 2) return state.life.houses[id].way;
    var prev = state.future.seasons[season - 2], w = prev.houses[id].way, j;
    for (j = 0; j < prev.events.length; j++) {
      if (prev.events[j].type === 'adopt' && prev.events[j].adopter === id) w = prev.events[j].way;
    }
    return w;
  }
  // Does this line belong under "In the future you watched"? Your heir, your sister's house, a house
  // taking up or giving up your ways, and newcomers taking a holding that was running them: with
  // the opening line of that list, these are every change to the closing count.
  function aboutYou(ev, season) {
    var kin = state.life.kin;
    if (ev.type === 'arrival') return ev.house === kin || yoursWay(wayBefore(ev.house, season));
    if (ev.adopter === 0) return true;
    if (ev.adopter === kin && kinHolds(season)) return true;
    return yoursWay(ev.way) || yoursWay(ev.from);
  }

  function drawHouse(j, h, ctx) {
    var node = ring.houses[j], p = node.p, sent = Math.round(h.helpRate * 16), base = p.y + 42, k, x;
    var yours = yoursWay(h.way);                          // marked by shape (filled, doubled) as well as colour
    node.g.setAttribute('class', 'house' + (yours ? ' yours' : ''));
    node.name.textContent = W.ringName(h, ctx);
    for (k = 0; k < 16; k++) {
      x = handX(p, k);
      if (k < sent) {         // a standing stroke: a hand that got through
        node.hands[k].setAttribute('class', 'hand up');
        node.hands[k].setAttribute('x1', x); node.hands[k].setAttribute('x2', x);
        node.hands[k].setAttribute('y1', base); node.hands[k].setAttribute('y2', base - 12);
      } else {                // a fallen one: no hand
        node.hands[k].setAttribute('class', 'hand');
        node.hands[k].setAttribute('x1', x - 1.7); node.hands[k].setAttribute('x2', x + 1.7);
        node.hands[k].setAttribute('y1', base - 1); node.hands[k].setAttribute('y2', base - 1);
      }
    }
    node.inc.textContent = W.delta(h.income);
  }
  function tickerLines(season) {
    var f = state.future, S = f.seasons[season - 1], ctx = { kinId: state.life.kin, kinHolds: kinHolds(season) }, out = [], j;
    for (j = 0; j < S.events.length; j++) {
      if (!tickerShows(S.events[j])) continue;
      out.push({ text: W.tickerLine(S.events[j], season, ctx), yours: aboutYou(S.events[j], season) });
    }
    return out;
  }
  // After the last Looking-Round. A season's record carries the ways run during it, so season 30
  // alone would leave the marks one round behind the closing count: the marks are set again from
  // finalWay. Season 30's strokes, income and names stay as they are.
  function markEndState() {
    var f = state.future, j;
    for (j = 0; j < 8; j++) ring.houses[j].g.setAttribute('class', 'house' + (yoursWay(f.finalWay[j]) ? ' yours' : ''));
  }
  function applySeason(k) {
    var f = state.future, S = f.seasons[k - 1], ctx = { kinId: state.life.kin, kinHolds: kinHolds(k) }, j;
    for (j = 0; j < 8; j++) drawHouse(j, S.houses[j], ctx);
    ring.num.textContent = String(S.season);
    var bar = $('flow').children[k - 1];
    if (bar) bar.style.height = (Math.max(0, Math.min(1, S.flow)) * 100) + '%';
    var lines = tickerLines(k), tk = $('ticker');
    if (lines.length) {
      var empty = tk.querySelector('.empty');
      if (empty) tk.removeChild(empty);
      for (j = 0; j < lines.length; j++) tk.appendChild(el('li', lines[j].yours ? 'yours' : null, lines[j].text));
      tk.scrollTop = tk.scrollHeight;
      setText('after-latest', lines[lines.length - 1].text);       // on a narrow screen, the newest line sits under the ring
    }
    state.shownSeason = k;
  }

  function buildAfterwards() {
    var i;
    setText('after-h', W.afterHeading());
    setText('after-one', W.oneFuture(state.job.futures));
    buildRing();
    $('ring').setAttribute('aria-label', W.afterHeading());
    var flow = clear($('flow'));
    for (i = 1; i <= SEASONS; i++) flow.appendChild(el('i', i > SEASONS - 10 ? 'late' : null));
    setText('flow-last', W.flowLastTen());
    setText('flow-caption', W.flowCaption());

    var legend = clear($('after-legend')), s1 = svg('svg', { viewBox: '0 0 30 16', 'aria-hidden': 'true', focusable: 'false' });
    [3, 8, 13].forEach(function (x) { s1.appendChild(svg('line', { 'class': 'l-up', x1: x, x2: x, y1: 14, y2: 2 })); });
    [18, 23].forEach(function (x) { s1.appendChild(svg('line', { 'class': 'l-down', x1: x - 1.7, x2: x + 1.7, y1: 13, y2: 13 })); });
    var s2 = svg('svg', { viewBox: '0 0 30 16', 'aria-hidden': 'true', focusable: 'false' });
    s2.appendChild(svg('text', { 'class': 'l-inc', x: 2, y: 13 }, W.delta(23)));
    var s3 = svg('svg', { viewBox: '0 0 30 16', 'aria-hidden': 'true', focusable: 'false' });
    s3.appendChild(svg('rect', { 'class': 'l-outer', x: 1, y: 1, width: 14, height: 14 }));
    s3.appendChild(svg('rect', { 'class': 'l-glyph', x: 4, y: 4, width: 8, height: 8 }));
    [[s1, W.legendHands()], [s2, W.legendIncome()], [s3, W.legendYours()]].forEach(function (it) {
      legend.appendChild(add(el('li'), it[0], el('span', null, it[1])));
    });

    setText('ticker-h', W.tickerHeading());
    clear($('ticker')).appendChild(el('li', 'empty', W.tickerEmpty()));
    setText('after-latest', '');
    $('after-end').hidden = true;
    $('after-counting').hidden = true;
    setText('skip', W.skip());
    setText('to-chronicle', W.seeCount());
    $('skip').hidden = false;
    $('to-chronicle').hidden = true;
  }

  function openAfterwards(alreadySeen) {
    var life = state.life;
    if (!life || !life.over) return;
    stepped();
    state.future = A.runFuture(life, 0);
    state.job = A.verdictJob(life);
    state.verdict = null; state.afterDone = false; state.shownSeason = 0;
    show('afterwards', 'after-h');
    buildAfterwards();
    playTimer = null; verdictTimer = null;
    if (alreadySeen || reducedMotion()) {
      finishAfterwards();                  // no animation: the final state and the whole list of events
      return;
    }
    verdictTimer = later(pump, 60);
    var t0 = now();
    applySeason(1);
    // Driven by the clock, not by frames: a tab that is not in front still gets to season 30 on time.
    playTimer = every(function () {
      var elapsed = now() - t0, s = Math.min(SEASONS, 1 + Math.floor(elapsed / (AFTER_MS / SEASONS)));
      while (state.shownSeason < s) applySeason(state.shownSeason + 1);
      if (elapsed >= AFTER_MS) finishAfterwards();
    }, 100);
  }

  function finishAfterwards() {
    if (state.view !== 'afterwards' || state.afterDone) return;
    state.afterDone = true;
    stepped();
    cancel(playTimer); playTimer = null;
    while (state.shownSeason < SEASONS) applySeason(state.shownSeason + 1);
    markEndState();
    var f = state.future;
    setText('after-held', W.futureEnd(f));
    setText('after-yours', W.yourWaysEnd(f));
    $('after-end').hidden = false;
    $('ring').setAttribute('aria-label', W.seasonOf(SEASONS) + '. ' + W.futureEnd(f) + ' ' + W.yourWaysEnd(f));
    var hadFocus = doc.activeElement === $('skip');
    $('skip').hidden = true;
    if (state.verdict) { verdictReady(hadFocus); return; }
    // What is left of the count now runs in a few large slices.
    setText('after-counting', W.counting(state.job));
    $('after-counting').hidden = false;
    if (hadFocus) focusQuiet($('after-h'));
    cancel(verdictTimer);
    verdictTimer = later(pump, 0);
  }

  // The verdict, in slices by time budget, so the page stays responsive while the ring plays.
  function pump() {
    verdictTimer = null;
    var job = state.job;
    if (!job || state.view !== 'afterwards' || state.verdict) return;
    var budget = state.afterDone ? 220 : 25, start = now(), done = false;
    do { done = A.verdictStep(job, 200); } while (!done && now() - start < budget);
    if (done) { state.verdict = job.result; verdictReady(false); return; }
    if (state.afterDone) setText('after-counting', W.counting(job));
    verdictTimer = later(pump, state.afterDone ? 0 : 30);
  }
  function verdictReady(focusIt) {
    if (!state.afterDone) return;            // the button appears when the future has been watched
    $('after-counting').hidden = true;
    var btn = $('to-chronicle');
    btn.hidden = false;
    if (state.thenChronicle) { state.thenChronicle = false; openChronicle(); return; }
    if (focusIt || doc.activeElement === doc.body || doc.activeElement === $('after-h')) focusQuiet(btn);
  }

  // ---- the Chronicle ----------------------------------------------------------------------------

  function section(parent, heading) {
    var s = el('section', 'chron-sec');
    if (heading) s.appendChild(el('h2', null, heading));
    parent.appendChild(s);
    return s;
  }
  function strokeField(label, held, mine) {
    var block = el('div', 'field-block'), head = el('div', 'field-head'), field = el('div', 'field' + (mine ? ' with' : '')), i;
    var n = Math.min(200, held.length), count = W.fieldCount(held);
    add(head, el('b', null, label), el('span', 'small', count));
    field.setAttribute('role', 'img');
    field.setAttribute('aria-label', label + ': ' + count);
    for (i = 0; i < n; i++) field.appendChild(el('i', held[i] ? 'held' : 'fell'));     // standing for held, fallen for fell
    return add(block, head, field);
  }
  function scaleMark(cls, at, text, anchor) {
    var m = el('div', 'scale-mark ' + cls + (anchor ? ' ' + anchor : ''));
    m.style.left = at + '%';
    add(m, el('span', 'pin'), el('span', 'lab', text));
    return m;
  }
  function buildScale(v) {
    var lo = v.range.scaleLow, hi = v.range.scaleHigh, span = hi - lo;
    function at(x) { return span > 0 ? Math.max(0, Math.min(100, (x - lo) / span * 100)) : 50; }
    function edge(p) { return p < 22 ? 'at-left' : p > 78 ? 'at-right' : ''; }
    var box = el('div', 'scale'), band = el('div', 'scale-span');
    var w = at(v.range.worstPct), b = at(v.range.bestPct), you = at(v.holdsPct), old = at(v.baselinePct);
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', W.scaleUnit() + '. ' + [W.scaleYouAt(v), W.scaleOldAt(v), W.scaleWorst(v), W.scaleBest(v)].join('. ') + '.');
    band.style.left = w + '%';
    band.style.width = Math.max(0, b - w) + '%';
    add(box, el('div', 'scale-rod'), band,
      scaleMark('end', w, W.scaleWorst(v), w < 50 ? 'at-left' : 'at-right'),
      scaleMark('end', b, W.scaleBest(v), b > 50 ? 'at-right' : 'at-left'),
      scaleMark('old', old, W.scaleOld(), edge(old)),
      scaleMark('you', you, W.scaleYou(), edge(you)));
    return box;
  }
  // The seal is a split tally: two halves of one stick whose notches fit.
  function sealFigure() {
    var s = svg('svg', { viewBox: '0 0 54 60', 'aria-hidden': 'true', focusable: 'false' });
    s.appendChild(svg('path', { 'class': 's-house', d: 'M4 2 H23 L27 10 L23 18 L27 26 L23 34 L27 42 L23 50 V58 H4 Z' }));
    s.appendChild(svg('path', { 'class': 's-valley', d: 'M31 2 H50 V58 H31 V50 L35 42 L31 34 L35 26 L31 18 L35 10 Z' }));
    return s;
  }
  function watchedLines() {
    var out = [], s, lines, j;
    for (s = 1; s <= SEASONS; s++) {
      lines = tickerLines(s);
      for (j = 0; j < lines.length; j++) if (lines[j].yours) out.push(lines[j].text);
    }
    return out;
  }

  function renderChronicle() {
    var v = state.verdict, life = state.life, f = state.future, main = clear($('chron-main')), side = clear($('chron-side')), s, p, i;
    setText('chron-h', W.chronHeading());

    s = section(main, W.houseHeading());
    s.appendChild(el('p', 'chron-big', W.chronHouse(v)));

    s = section(main, W.valleyHeading());
    s.appendChild(el('p', 'chron-lead', W.chronValley(v)));
    var markText = W.chronMark(v), value = W.markValue(v), cutAt = markText.lastIndexOf(value);
    p = el('p', 'chron-big mark-line');
    add(p, doc.createTextNode(markText.slice(0, cutAt)), el('span', 'mark-num', value), doc.createTextNode(markText.slice(cutAt + value.length)));
    s.appendChild(p);
    s.appendChild(el('p', 'small', W.chronNoise(v)));
    s.appendChild(strokeField(W.rowWith(), v.held, true));
    s.appendChild(strokeField(W.rowOld(), v.baseline.held, false));
    var notes = el('div', 'field-notes');
    add(notes, el('p', 'small', W.fieldCaption(v) + ' ' + W.fieldKey()));
    W.explain(v).forEach(function (line) { notes.appendChild(el('p', 'small', line)); });
    s.appendChild(notes);

    s = section(main, W.rangeHeading());
    s.appendChild(el('p', null, W.rangeLine(v)));
    s.appendChild(buildScale(v));

    if (v.seal && v.seal.earned === true) {            // decided by the engine; nothing is said when it is absent
      s = section(side, null);
      s.appendChild(add(el('div', 'seal'), sealFigure(), el('p', null, W.seal())));
    }
    if (v.lastDay !== null) {
      s = section(side, W.lastDayHeading());
      s.appendChild(el('p', null, W.lastDay(v, life.kin)));
    }
    s = section(side, W.matteredHeading());
    s.appendChild(el('p', null, W.mattered(v, state.titles)));

    s = section(side, W.watchedHeading());
    var list = el('ol', 'watched'), lines = watchedLines();
    list.appendChild(el('li', null, W.watchedStart(life.houses, life.kin)));
    for (i = 0; i < lines.length; i++) list.appendChild(el('li', null, lines[i]));
    add(list, el('li', 'end', W.futureEnd(f)), el('li', 'end', W.yourWaysEnd(f)));
    s.appendChild(list);

    setText('chron-valley', W.valleyNo(life.seed));
    setText('again', W.again());
    setText('again-same', W.againSame());
  }

  function openChronicle() {
    var v = state.verdict;
    if (!v || !state.future) return;
    if (!state.recorded) {
      state.recorded = true;
      state.lives.unshift({ seed: state.life.seed, kept: !!v.houseKept, purse: v.purse, need: v.need, mark: Math.round(v.mark), seal: !!(v.seal && v.seal.earned === true) });
      state.lives = state.lives.slice(0, 20);
      saveLives();
    }
    stepped();
    renderChronicle();
    renderLives('chron-past', 'chron-past-h', 'chron-past-list');
    show('chronicle', 'chron-h');
  }

  // ---- opening ----------------------------------------------------------------------------------

  function renderOpening() {
    setText('opening-h', W.title());
    renderTrack($('op-stick'), 0);                     // twelve days, none of them cut yet
    var box = clear($('op-premise'));
    W.premise().forEach(function (line) { box.appendChild(el('p', null, line)); });
    setText('stake-cost', W.stakeCost());
    setText('stake-worth', W.stakeWorth());
    setText('begin', W.begin());
    renderLives('op-past', 'op-past-h', 'op-past-list');
  }

  // ---- start ------------------------------------------------------------------------------------

  function bind() {
    // On the way down (capture), before any control hears it: the second click of a double click
    // makes no choice, turns no card and takes no step. Stopping its default keeps a radio, or the
    // label over it, from being taken.
    $('ay').addEventListener('click', function (e) {
      if (doubled(e)) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    $('begin').addEventListener('click', function (e) { if (!doubled(e)) beginLife(state.hashSeed !== null ? state.hashSeed : freshSeed()); });
    $('close-day').addEventListener('click', function (e) { if (!doubled(e)) closeDay(); });
    $('next-day').addEventListener('click', function (e) { if (!doubled(e)) nextDay(); });
    $('leave').addEventListener('click', function (e) { if (!doubled(e) && state.view === 'leaving') openAfterwards(false); });
    $('skip').addEventListener('click', function (e) { if (!doubled(e)) finishAfterwards(); });
    $('to-chronicle').addEventListener('click', function (e) { if (!doubled(e)) openChronicle(); });
    $('again').addEventListener('click', function (e) { if (!doubled(e)) beginLife(freshSeed()); });
    $('again-same').addEventListener('click', function (e) { if (!doubled(e) && state.seed !== null) beginLife(state.seed); });

    $('cards').addEventListener('change', function (e) {
      var t = e.target;
      if (!t || t.type !== 'radio' || t.name.indexOf('choice-') !== 0 || !t.checked) return;
      onPick(Number(t.name.slice(7)), t.value === 'send');
    });
    $('cards').addEventListener('click', function (e) {
      var t = e.target, btn = t && t.closest ? t.closest('button') : null;
      if (!btn || doubled(e)) return;
      if (btn.hasAttribute('data-why')) flip(Number(btn.getAttribute('data-why')), true);
      else if (btn.hasAttribute('data-back')) flip(Number(btn.getAttribute('data-back')), false);
    });
    // A held key must not walk through several days.
    doc.addEventListener('keydown', function (e) {
      if (e.repeat && (e.key === 'Enter' || e.key === ' ') && e.target && e.target.tagName === 'BUTTON') e.preventDefault();
    });
    if (window.matchMedia) {
      var mq = window.matchMedia('(max-width: 620px)');
      if (mq.addEventListener) mq.addEventListener('change', syncKnow);
      else if (mq.addListener) mq.addListener(syncKnow);
    }
  }

  function validChoices(list) {
    if (!Array.isArray(list) || list.length > 12) return null;
    var ids = [1, 2, 6, 7], out = [], i, j, c;
    for (i = 0; i < list.length; i++) {
      c = {};
      for (j = 0; j < ids.length; j++) {
        if (!list[i] || typeof list[i][ids[j]] !== 'boolean') return null;
        c[ids[j]] = list[i][ids[j]];
      }
      out.push(c);
    }
    return out;
  }
  // A reload keeps the Life in progress: the same seed and the same choices give the same Life.
  function restore(data) {
    var choices = validChoices(data.choices), view = data.view, phase = data.phase, id;
    if (data.seed === null || data.seed === undefined || !choices) return false;
    if (view !== 'day' && view !== 'leaving' && view !== 'afterwards' && view !== 'chronicle') return false;
    resetLife();
    state.recorded = data.recorded === true;
    var keepLast = view === 'day' && (phase === 'revealed' || phase === 'season') && choices.length > 0;
    rebuild(data.seed, choices, keepLast);
    if (view === 'day' && !state.life.over || keepLast) {
      state.phase = keepLast ? (phase === 'season' && state.result.lookingRound ? 'season' : 'revealed') : 'choose';
      if (!keepLast && data.picks) {
        for (id in data.picks) if (typeof data.picks[id] === 'boolean' && state.life.neighbours.indexOf(Number(id)) >= 0) state.picks[id] = data.picks[id];
      }
      renderDay();
      show('day', 'day-h', true);
      return true;
    }
    if (!state.life.over) return false;
    if (view === 'afterwards' || view === 'chronicle') {
      state.thenChronicle = view === 'chronicle';
      openAfterwards(true);
      return true;
    }
    openLeaving();
    return true;
  }

  var started = false;
  function start(data) {
    if (started) return;
    started = true;
    var hot = window.claude && window.claude.hot;
    if (!data && hot && hot.data) data = hot.data;
    var m = /^#valley-([A-Za-z0-9-]+)$/.exec(window.location.hash || '');
    state.hashSeed = m ? m[1] : null;
    state.lives = loadLives();
    bind();
    renderOpening();
    var resumed = false;
    if (data && typeof data === 'object') {
      try { resumed = restore(data); } catch (e) { resumed = false; }
    }
    if (!resumed) { resetLife(); state.life = null; state.seed = null; show('opening', 'opening-h', true); }
  }
  function boot() {
    var hot = window.claude && window.claude.hot;
    if (hot && typeof hot.snapshot === 'function') {
      hot.snapshot(function () {
        return { seed: state.seed, choices: state.choices, picks: state.picks, phase: state.phase, view: state.view, recorded: state.recorded };
      });
    }
    if (hot && typeof hot.ready === 'function') hot.ready(start);
    else start((hot && hot.data) || {});
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
