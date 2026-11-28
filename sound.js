/*
 * After You: the sound of the page (window.AYSound). Sound is off until the reader presses the Sound
 * button: no AudioContext exists before that click, on every visit, and a stored choice never starts
 * sound by itself (ARM_FROM_MEMORY). Once on, each place has a quiet bed of air and water, and the
 * page's moments are told in small cues: a hand going out, a latch for a stay, a thump for your own
 * hand turned back, one note for each hand that arrives (its pitch and pan name the neighbour). A
 * neighbour's missing act makes no sound, whatever its cause, and nor do the sister's dealings, the
 * gauges, the town paying, the seal or the count's outcome: the ear learns only what the page shows,
 * and every cue is a pure function of the cue's payload (app.js cue), the place and the day.
 * Nothing touches the DOM, a timer, a listener or the clock when the file loads: it loads in the bare
 * jsc shell as in a browser. Every wait runs on the audio clock (a silent source's onended): no
 * timer of the window, no frame callback, and no clock but AudioContext.currentTime.
 *   AYSound.boot(ctx) -> bool   true where Web Audio exists, and then the Sound button is made
 *                               ctx: { doc, still(), hidden(), sheet(), place(), label } (app.js bootFx)
 *   AYSound.cue(name, data)     one of the page's moments, with what the page shows of it (app.js cue)
 *   AYSound.TIMING              the reveal's timings in ms, the same as AYMotion.TIMING
 *   AYSound.tracks()            the music registered in TRACKS, copied ({ place: entry })
 *   AYSound._test               score(name, data, st), bedFor(place, view, day, phase, opened),
 *                               trackOk(entry): pure planners; record(on), state(), meter(): for checks
 */
(function (root) {
  'use strict';

  var TIMING = {
    LINE: 280, HEAD: 90, STAGGER: 30,
    IN_AT: 70, GATE: 180, X: 110,
    IMAGE_AT: 200, IMAGE: 450, KIN_AT: 220,
    GAUGE_AT: 300, GAUGE: 260, BEAT_AT: 600,
    BEAT: 360, VIEW: 160, LIGHT: 1200
  };

  // ---- the music slot -----------------------------------------------------------------------
  // With every entry null there is no media element, no request and no listener. tools/pages.sh copies
  // each registered src into the site and refuses to build when one is missing.
  var TRACKS = {        // one instrumental per place, or null; src relative, under music/
    valley: null, banks: null, watch: null, bridges: null, saltmarket: null
    // valley: { src: 'music/valley.mp3', gainDb: -16, waitS: [20, 40], fadeInS: 6, fadeOutS: 8, maxS: 150, gapS: [45, 120] }
  };
  var TRACK_DEFAULTS = { gainDb: -16, waitS: [20, 40], fadeInS: 6, fadeOutS: 8, maxS: 150, gapS: [45, 120] };
  var SRC_RE = /^music\/[a-z0-9-]+\.(mp3|m4a)$/;
  var MUSIC_VIEWS = { opening: true, day: true, leaving: true, chronicle: true };

  // ---- memory -------------------------------------------------------------------------------
  // 'on' or 'off', written when the reader presses the button. By default it never starts sound: the
  // Sound button does, on every visit. true here: a stored 'on' starts sound at the reader's first tap
  // or key anywhere on the page (the browser allows sound only from inside such an input).
  var STORE_KEY = 'after-you.sound.v1';
  var ARM_FROM_MEMORY = false;

  // ---- levels -------------------------------------------------------------------------------
  // A cue's level is its peak before the master (-3 dB); each place's bed is BED_DB RMS at the output,
  // its layers in the balance of their recipes. The compressor adds its own make-up gain below its
  // threshold (5.28 dB at these settings, by Web Audio's curve); a gain after it takes that off again,
  // so that the compressor only ever holds peaks.
  var MASTER_DB = -3, MAKEUP_DB = 5.28, BED_DB = -40;
  var COMP = { threshold: -18, knee: 10, ratio: 3, attack: 0.005, release: 0.25 };
  var DUCK_BED_DB = -3, DUCK_MUSIC_DB = -6, IDLE_DB = -6, IDLE_S = 120;
  var VIEW_DB = { opening: 0, day: 0, leaving: -3, afterwards: -4, chronicle: -6 };
  var AFTER_LP = 1200, OPEN_LP = 20000;
  var MERGE_MS = 90, HOLD_MS = 300, MAX_VOICES = 12, VIEW_S = 1.5, PLACE_S = 1.5, FLOOR = 0.00001, DECAY = 0.001;

  // ---- the places ---------------------------------------------------------------------------
  // Notes 1 to 5 of each place (Hz), its arrival timbre and the colour of a hand turned back. The
  // sweep index k runs west to east: houses 7, 6, 2, 1 (sheet.js); each house has its note and pan.
  var NOTES = {
    valley: [293.7, 329.6, 370.0, 440, 493.9],
    banks: [220, 261.6, 293.7, 329.6, 392],
    watch: [329.6, 392, 440, 493.9, 587.3],
    bridges: [261.6, 293.7, 329.6, 392, 440],
    saltmarket: [392, 440, 493.9, 587.3, 659.3]
  };
  var TIMBRE = { valley: 'wood', banks: 'buoy', watch: 'block', bridges: 'pluck', saltmarket: 'bell' };
  var COLOUR = { valley: 'splash', banks: 'swish', watch: 'whoosh', bridges: 'scrape', saltmarket: 'ping' };
  var LANE_K = { 7: 0, 6: 1, 2: 2, 1: 3 };
  var LANE_NOTE = { 7: 1, 6: 2, 2: 3, 1: 5 };
  var LANE_PAN = [-0.5, -0.2, 0.2, 0.5];
  var HOUSE_X = [0.50, 0.83, 0.67, 0.81, 0.50, 0.19, 0.33, 0.17];      // sheet.js, for a house off your lanes
  var VARY_CENTS = [-25, 0, 25], VARY_DB = [-1, 0, -0.5];
  // when each reveal cue sounds (ms after the day closes), on the motion's timeline (TIMING)
  var AT = { SEND: 0, LATCH: 160, BACK: 240, ARRIVE: 320, CHIMES: 380, CHIME_GAP: 140, COUNT_GAP: 90 };

  // The beds: layers of looped noise through filters (one source may feed several layers), slow LFOs,
  // and one kind of one-shot. Each place's bed is at most 10 nodes (bedFor counts them).
  var BEDS = {
    valley: {
      layers: [
        { name: 'wind', noise: 'pink', bands: [{ type: 'bandpass', f: 420, q: 0.7 }], db: -36,
          lfos: [{ hz: 0.071, to: 'gain', depth: 0.5 }, { hz: 0.029, to: 'f', band: 0, depth: 140 }] },
        // the stream's high-pass at 1600 Hz and low-pass at 4200 Hz, as one band between them
        { name: 'stream', noise: 'white', bands: [{ type: 'bandpass', f: 2592, q: 1.0 }], db: -46 }
      ],
      shot: { name: 'birds', gap: [18, 45], db: -42, bird: true }
    },
    banks: {
      layers: [
        { name: 'swell', noise: 'pink', bands: [{ type: 'lowpass', f: 520 }], db: -34,
          lfos: [{ hz: 0.11, to: 'gain', depth: 0.3 }, { hz: 0.047, to: 'gain', depth: 0.3 }] },
        { name: 'race', noise: 'white', bands: [{ type: 'bandpass', f: 1300, q: 1.0 }], db: -48 }
      ],
      shot: { name: 'gulls', gap: [25, 60], db: -42, bird: true }
    },
    watch: {
      layers: [
        { name: 'wind', noise: 'pink', bands: [{ type: 'bandpass', f: 850, q: 1.4 }], db: -40,
          lfos: [{ hz: 0.06, to: 'gain', depth: 0.5 }, { hz: 0.023, to: 'f', band: 0, depth: 160 }] },
        { name: 'whistle', share: 0, bands: [{ type: 'bandpass', f: 1700, q: 9 }], db: -52 }
      ],
      shot: { name: 'creak', gap: [30, 70], db: -44 }
    },
    bridges: {
      layers: [
        { name: 'stream', noise: 'white', bands: [{ type: 'bandpass', f: 900, q: 1.0, db: -40 }, { type: 'bandpass', f: 2600, q: 1.0, db: -46 }],
          lfos: [{ hz: 0.9, to: 'gain', band: 0, depth: 0.25 }, { hz: 1.7, to: 'gain', band: 0, depth: 0.25 }] },
        { name: 'low wind', share: 0, bands: [{ type: 'lowpass', f: 300 }], db: -44 }
      ],
      shot: { name: 'whistle', gap: [20, 50], db: -44 }
    },
    saltmarket: {
      layers: [
        { name: 'murmur', noise: 'pink', bands: [{ type: 'bandpass', f: 480, q: 2.2 }, { type: 'bandpass', f: 1350, q: 2.8 }], db: -40,
          lfos: [{ hz: 0.05, to: 'f', band: 0, depth: 86 }, { hz: 0.037, to: 'f', band: 1, depth: 243 }] },
        { name: 'room', share: 0, bands: [{ type: 'lowpass', f: 220 }], db: -46 }
      ],
      shot: { name: 'steps', gap: [15, 35], db: -46 }
    }
  };

  // ---- small helpers ------------------------------------------------------------------------
  function has(o, k) { return o !== null && o !== undefined && Object.prototype.hasOwnProperty.call(o, k); }
  function dbGain(db) { return Math.pow(10, db / 20); }
  function num(x) { return typeof x === 'number' && isFinite(x); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function placeOf(p) { return has(NOTES, p) ? p : 'valley'; }
  function laneK(id) { return has(LANE_K, id) ? LANE_K[id] : -1; }
  function vary(day, k) { var v = ((num(day) ? Math.floor(day) : 0) + k) % 3; return v < 0 ? v + 3 : v; }
  function housePan(id) {
    var k = laneK(id);
    if (k >= 0) return LANE_PAN[k];
    return num(id) && id >= 0 && id < 8 ? clamp(Math.round((HOUSE_X[id] - 0.5) * 15) / 10, -0.7, 0.7) : 0;
  }
  function ev(voice, at, o) {
    var e = { voice: voice, at: at, note: null, f: null, pan: 0, db: 0, cents: 0, lane: null, dur: 0 }, k;
    for (k in o) if (has(o, k)) e[k] = o[k];
    return e;
  }

  // ---- the score: which cue voices a moment plays (pure) ------------------------------------
  // score(name, data, st) -> [{ voice, at (ms after the cue), note, f (Hz), pan, db (peak), cents, lane, dur }]
  // st: { place, day (the day in hand, for a plan's variation), isNew (the Afterwards' tents before this
  // season) }. Only the payload's shown fields are read: a lane's they === false plays nothing.
  function score(name, d, st) {
    d = d || {}; st = st || {};
    var place = placeOf(st.place), N = NOTES[place], out = [], i, x, k, v, n;
    if (d.quiet) return out;
    if (name === 'on') {
      out.push(ev('on', 0, { note: 3, f: N[2], db: -30 }));
    } else if (name === 'plan') {
      k = laneK(d.id);
      v = vary(st.day, k < 0 ? 0 : k);
      out.push(ev('plan', 0, { send: !!d.send, lane: k < 0 ? null : d.id, pan: k < 0 ? 0 : LANE_PAN[k], db: -32 + VARY_DB[v], cents: VARY_CENTS[v] }));
    } else if (name === 'reveal') {
      var lanes = d.lanes || [], sent = false, stayed = false, lane = [];
      for (i = 0; i < lanes.length; i++) {
        x = lanes[i] || {};
        k = laneK(x.id);
        if (k < 0) continue;
        v = vary(d.day, k);
        if (x.arrived === true || x.lost === true) sent = true; else stayed = true;
        if (x.lost === true) lane.push(ev('back', AT.BACK + TIMING.STAGGER * k, { lane: x.id, pan: LANE_PAN[k], db: -26 + VARY_DB[v], cents: VARY_CENTS[v] }));
        if (x.they === true) lane.push(ev('arrival', AT.ARRIVE + TIMING.STAGGER * k, { lane: x.id, note: LANE_NOTE[x.id], f: N[LANE_NOTE[x.id] - 1], pan: LANE_PAN[k], db: -22 + VARY_DB[v], cents: VARY_CENTS[v] }));
      }
      if (sent) out.push(ev('sendoff', AT.SEND, { db: -30 }));
      if (stayed) out.push(ev('latch', AT.LATCH, { db: -28 }));
      out = out.concat(lane);
    } else if (name === 'day') {
      out.push(ev('paper', 0, { db: -36 }));
    } else if (name === 'seasonEnd') {
      out.push(ev('bell', 0, { note: 1, f: N[0] / 2, db: -26 }));
      n = num(d.kinCount) ? clamp(Math.floor(d.kinCount), 0, 5) : 0;
      for (i = 0; i < n; i++) out.push(ev('chime', AT.CHIMES + AT.CHIME_GAP * i, { note: 5, f: N[4] * 2, pan: housePan(d.kin), db: -30 }));
    } else if (name === 'leaving') {
      out.push(ev('low', 0, { note: 1, f: N[0] / 2, db: -36 }));
      out.push(ev('low', 0, { note: 5, f: N[4] / 2, db: -36 }));
    } else if (name === 'flip') {
      out.push(ev('flick', 0, { db: -36 }));
    } else if (name === 'count') {
      out.push(ev('count', 0, { note: 1, f: N[0], db: -30 }));
      out.push(ev('count', AT.COUNT_GAP, { note: 5, f: N[4], db: -30 }));
    } else if (name === 'chronicle') {
      out.push(ev('page', 0, { db: -32 }));
    } else if (name === 'season') {
      if (d.byClock !== true) return out;                 // several seasons at once: a jump plays nothing
      n = num(d.strip) ? Math.round(clamp(d.strip, 0, 1) * 9) : 0;
      out.push(ev('pluck', 0, { note: n + 1, f: N[n % 5] * (n >= 5 ? 2 : 1), db: -32 }));
      var was = st.isNew || [], now = d.isNew || [];
      for (i = 0; i < 8; i++) if (now[i] === true && was[i] !== true) { out.push(ev('tent', 40, { lane: i, db: -32 })); break; }
      var told = d.told || [], bells = 0;
      for (i = 0; i < told.length && bells < 3; i++) {
        if (told[i] && told[i].yours === true) { out.push(ev('toll', 160 + 150 * bells, { note: 3, f: N[2], db: -30 })); bells++; }
      }
    } else if (name === 'afterEnd') {
      out.push(ev('close', 0, { note: 1, f: N[0], db: -37.5 }));
      out.push(ev('close', 0, { note: 5, f: N[4], db: -37.5 }));
      out.push(ev('close', 0, { note: 6, f: N[0] * 2, db: -37.5 }));
    }
    for (i = 0; i < out.length; i++) out[i].dur = partsEnd(partsOf(out[i], place)) * 1000;      // how long it sounds
    return out;
  }

  // ---- the beds (pure) ----------------------------------------------------------------------
  // The power a filter passes of the bed's unit-RMS noise, from the biquad's response as Web Audio
  // defines it and the noise's own spectrum (white, or Kellet's pink filter exactly as noise() makes
  // it), so that a layer's level is its RMS. Bands that share a gain are summed.
  var KELLET = [[0.99886, 0.0555179], [0.99332, 0.0750759], [0.96900, 0.1538520], [0.86650, 0.3104856], [0.55000, 0.5329522], [-0.7616, -0.0168980]];
  function cdiv(ar, ai, br, bi) { var d = br * br + bi * bi; return [(ar * br + ai * bi) / d, (ai * br - ar * bi) / d]; }
  function response(b, w) {
    var w0 = 2 * Math.PI * b.f * w.inv, cw = Math.cos(w0), sw = Math.sin(w0), q = num(b.q) ? b.q : 1, al, b0, b1, b2, a0, a1, a2;
    if (b.type === 'bandpass') { al = sw / (2 * q); b0 = al; b1 = 0; b2 = -al; }
    else {
      al = sw / (2 * Math.pow(10, q / 20));         // low- and high-pass: Q in dB
      if (b.type === 'lowpass') { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; }
      else { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; }
    }
    a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al;
    return cdiv(b0 + b1 * w.c1 + b2 * w.c2, -(b1 * w.s1 + b2 * w.s2), a0 + a1 * w.c1 + a2 * w.c2, -(a1 * w.s1 + a2 * w.s2));
  }
  function pinkPower(w) {                              // |H|^2 of Kellet's filter at this frequency
    var re = 0.5362 + 0.115926 * w.c1, im = -0.115926 * w.s1, i, r;
    for (i = 0; i < KELLET.length; i++) { r = cdiv(KELLET[i][1], 0, 1 - KELLET[i][0] * w.c1, KELLET[i][0] * w.s1); re += r[0]; im += r[1]; }
    return re * re + im * im;
  }
  function bandPower(bands, noise, sr) {
    var lo = Math.log(0.05), hi = Math.log(sr / 2), steps = 400, i, f, w, s, re, im, r, j, p = 0, all = 0, x;
    for (i = 0; i < steps; i++) {
      f = Math.exp(lo + (hi - lo) * (i + 0.5) / steps);
      x = 2 * Math.PI * f / sr;
      w = { inv: 1 / sr, c1: Math.cos(x), s1: Math.sin(x), c2: Math.cos(2 * x), s2: Math.sin(2 * x) };
      s = (noise === 'pink' ? pinkPower(w) : 1) * f;  // the noise's power in this step of log frequency
      re = 0; im = 0;
      for (j = 0; j < bands.length; j++) { r = response(bands[j], w); re += r[0]; im += r[1]; }
      p += (re * re + im * im) * s; all += s;
    }
    return p / all;
  }
  function viewCut(view, phase) {
    if (view === 'leaving') return 0.8;
    if (view === 'day' && (phase === 'revealed' || phase === 'season')) return 0.9;      // evening
    return 1;
  }
  function calendar(view, day) {
    if (view !== 'day' || !num(day) || day < 1) return 1;
    return day <= 4 ? 1.4 : day <= 8 ? 1.0 : 0.6;
  }
  // bedFor(place, view, day, phase, opened, sampleRate) -> the bed as it should stand: each layer's bands
  // (frequencies after the evening's or Leaving's cut), its gains, its LFOs and its nodes; the view's level
  // and low-pass, the one-shot and how often it comes (the calendar), and the bed's node count. The
  // recipes' layer levels set the balance; the whole bed is BED_DB RMS at the output (at 0 dB of view).
  function bedFor(place, view, day, phase, opened, sr) {
    place = placeOf(place); sr = num(sr) && sr > 0 ? sr : 48000;
    var B = BEDS[place], cut = viewCut(view, phase), out = { place: place, view: view, cut: cut, gainDb: has(VIEW_DB, view) ? VIEW_DB[view] : 0,
      lp: view === 'afterwards' && !opened ? AFTER_LP : null, rate: calendar(view, day), shot: null, layers: [], nodes: 0, db: BED_DB }, i, j, L, lay, groups, total = 0, trim, o, key, lfoPow;
    for (i = 0; i < B.layers.length; i++) {           // the recipe's power, LFOs on a gain included
      L = B.layers[i];
      lfoPow = [];
      for (j = 0; j < L.bands.length; j++) lfoPow.push(1);
      for (j = 0; j < (L.lfos || []).length; j++) if (L.lfos[j].to === 'gain') lfoPow[num(L.lfos[j].band) ? L.lfos[j].band : 0] += L.lfos[j].depth * L.lfos[j].depth / 2;
      if (num(L.bands[0].db)) { for (j = 0; j < L.bands.length; j++) total += Math.pow(10, L.bands[j].db / 10) * lfoPow[j]; }
      else total += Math.pow(10, L.db / 10) * lfoPow[0];
    }
    trim = BED_DB - MASTER_DB - 10 * Math.log(total) / Math.LN10;
    for (i = 0; i < B.layers.length; i++) {
      L = B.layers[i];
      lay = { name: L.name, noise: num(L.share) ? B.layers[L.share].noise : L.noise, share: num(L.share) ? L.share : null, bands: [], gains: [], lfos: [], nodes: 0 };
      if (lay.share === null) lay.nodes++;
      for (j = 0; j < L.bands.length; j++) lay.bands.push({ type: L.bands[j].type, f: Math.round(L.bands[j].f * cut * 10) / 10, q: L.bands[j].q });
      lay.nodes += lay.bands.length;
      if (num(L.bands[0].db)) {                       // each band its own level
        for (j = 0; j < L.bands.length; j++) lay.gains.push(dbGain(L.bands[j].db + trim) / Math.sqrt(bandPower([L.bands[j]], lay.noise, sr)));
      } else lay.gains.push(dbGain(L.db + trim) / Math.sqrt(bandPower(L.bands, lay.noise, sr)));
      lay.nodes += lay.gains.length;
      groups = {};
      for (j = 0; j < (L.lfos || []).length; j++) {
        o = L.lfos[j]; key = o.to + (num(o.band) ? o.band : 0);
        lay.lfos.push({ hz: o.hz, to: o.to, band: num(o.band) ? o.band : 0, depth: o.depth, group: key });
        lay.nodes += groups[key] ? 1 : 2;             // an oscillator, and one depth gain for each target
        groups[key] = true;
      }
      out.nodes += lay.nodes;
      out.layers.push(lay);
    }
    if (B.shot && view !== 'leaving' && !(B.shot.bird && view === 'day' && phase === 'season')) {
      out.shot = { name: B.shot.name, gap: [B.shot.gap[0] / out.rate, B.shot.gap[1] / out.rate], db: B.shot.db };
    }
    return out;
  }

  // ---- the music registry (pure) ------------------------------------------------------------
  function pair(x) { return x && x.length === 2 && num(x[0]) && num(x[1]) && x[0] >= 0 && x[1] >= x[0]; }
  function trackOk(e) {
    if (!e || typeof e !== 'object' || typeof e.src !== 'string' || !SRC_RE.test(e.src)) return false;
    if (has(e, 'gainDb') && !(num(e.gainDb) && e.gainDb <= 0)) return false;
    if (has(e, 'waitS') && !pair(e.waitS)) return false;
    if (has(e, 'gapS') && !pair(e.gapS)) return false;
    if (has(e, 'fadeInS') && !(num(e.fadeInS) && e.fadeInS >= 0)) return false;
    if (has(e, 'fadeOutS') && !(num(e.fadeOutS) && e.fadeOutS >= 0)) return false;
    if (has(e, 'maxS') && !(num(e.maxS) && e.maxS > 0)) return false;
    return true;
  }
  function copyEntry(e) {
    var out = {}, k;
    for (k in e) if (has(e, k)) out[k] = e[k] && typeof e[k] === 'object' && e[k].length !== undefined ? e[k].slice() : e[k];
    return out;
  }
  function tracks() {
    var out = {}, k;
    for (k in TRACKS) if (has(TRACKS, k) && TRACKS[k] !== null && TRACKS[k] !== undefined) out[k] = copyEntry(TRACKS[k]);
    return out;
  }
  function trackFor(place) {                          // the entry to play here, with its defaults, or null
    var e = has(TRACKS, place) ? TRACKS[place] : null, out, k;
    if (!trackOk(e)) return null;
    out = copyEntry(TRACK_DEFAULTS);
    for (k in e) if (has(e, k)) out[k] = e[k];
    return out;
  }

  // ---- the voices: what each cue is made of -------------------------------------------------
  // A part is one source (an oscillator or looped noise) with an optional filter and an envelope that
  // rises over a and falls 60 dB over d (then fades out in 20 ms):
  //   { type, f, f1 (glide to), glide (s), filter: { type, f, f1, q, over }, rel (dB), at (s), a, d (s),
  //     hits: [s] (the envelope struck again), each (the glides again on each hit), vib: { hz, cents } }
  function timbre(name, f) {
    if (name === 'wood') return [{ type: 'sine', f: f, a: 0.003, d: 0.55 }, { type: 'sine', f: f * 3.98, rel: -14, a: 0.002, d: 0.12 }];
    if (name === 'buoy') return [{ type: 'sine', f: f, a: 0.004, d: 1.0 }, { type: 'sine', f: f * 2.4, rel: -10, a: 0.004, d: 0.6 }];
    if (name === 'block') return [{ type: 'triangle', f: f, filter: { type: 'lowpass', f: 1800 }, a: 0.002, d: 0.35 }];
    if (name === 'pluck') return [{ type: 'sawtooth', f: f, filter: { type: 'lowpass', f: 4000, f1: 600, over: 0.35 }, a: 0.003, d: 0.6 }];
    return [{ type: 'sine', f: f, a: 0.003, d: 0.9 }, { type: 'sine', f: f * 2.76, rel: -8, a: 0.002, d: 0.45 }, { type: 'sine', f: f * 5.4, rel: -14, a: 0.002, d: 0.25 }];
  }
  function planParts(place, send) {
    if (place === 'banks') return send ?
      [{ type: 'triangle', f: 330, a: 0.002, d: 0.1 }, { type: 'white', filter: { type: 'lowpass', f: 2000 }, rel: -10, a: 0.001, d: 0.02 }] :
      [{ type: 'pink', filter: { type: 'bandpass', f: 1500, f1: 600, q: 1.5, over: 0.26 }, a: 0.04, d: 0.22 }];
    if (place === 'watch') return send ?
      [{ type: 'pink', filter: { type: 'bandpass', f: 1100, q: 1.2 }, a: 0.008, d: 0.045, hits: [0, 0.05, 0.1, 0.15] }] :
      [{ type: 'white', filter: { type: 'highpass', f: 3500 }, a: 0.001, d: 0.015 }, { type: 'sine', f: 3800, rel: -8, a: 0.001, d: 0.04 }];
    if (place === 'bridges') return send ?
      [{ type: 'white', filter: { type: 'bandpass', f: 800, f1: 2400, q: 1.2, over: 0.17 }, a: 0.03, d: 0.14 }] :
      [{ type: 'sine', f: 2300, a: 0.001, d: 0.22, hits: [0, 0.045] }, { type: 'sine', f: 3100, rel: -3, a: 0.001, d: 0.18, hits: [0, 0.045] },
       { type: 'sine', f: 4200, rel: -6, a: 0.001, d: 0.14, hits: [0, 0.045] }];
    if (place === 'saltmarket') return send ?
      [{ type: 'sine', f: 2100, a: 0.001, d: 0.2 }, { type: 'sine', f: 3350, rel: -6, a: 0.001, d: 0.12 }, { type: 'triangle', f: 380, rel: -8, a: 0.001, d: 0.03 }] :
      [{ type: 'white', filter: { type: 'bandpass', f: 3500, q: 3 }, a: 0.02, d: 0.04, hits: [0, 0.045, 0.09] }];
    return send ?
      [{ type: 'sine', f: 660, a: 0.002, d: 0.09 }, { type: 'sine', f: 660 * 3.98, rel: -14, a: 0.001, d: 0.03 }] :
      [{ type: 'triangle', f: 220, a: 0.002, d: 0.12 }, { type: 'sine', f: 440, rel: -12, a: 0.002, d: 0.05 }];
  }
  function colourParts(name) {
    if (name === 'splash') return [{ type: 'pink', filter: { type: 'lowpass', f: 900, f1: 400, over: 0.26 }, rel: -6, a: 0.01, d: 0.25 }];
    if (name === 'swish') return [{ type: 'pink', filter: { type: 'bandpass', f: 600, f1: 300, q: 1.2, over: 0.4 }, rel: -8, a: 0.06, d: 0.34 }];
    if (name === 'whoosh') return [{ type: 'pink', filter: { type: 'bandpass', f: 400, f1: 1200, q: 1.0, over: 0.3 }, rel: -8, a: 0.08, d: 0.22 }];
    if (name === 'scrape') return [{ type: 'white', filter: { type: 'bandpass', f: 2000, q: 2 }, rel: -10, a: 0.005, d: 0.1, hits: [0, 0.06] }];
    return [{ type: 'sine', f: 2400, rel: -12, a: 0.001, d: 0.25 }];
  }
  function shotParts(name) {                          // a bed's one-shot, its pitch (+/-8%) drawn afresh
    var p = rnd(0.92, 1.08), n, i, hits = [];
    if (name === 'birds') {
      n = 2 + Math.floor(Math.random() * 3);
      for (i = 0; i < n; i++) hits.push(i * 0.11);
      return [{ type: 'sine', f: 3200 * p, f1: 4100 * p, glide: 0.06, a: 0.005, d: 0.07, hits: hits, each: true }];
    }
    if (name === 'gulls') return [{ type: 'triangle', f: 1450 * p, f1: 980 * p, glide: 0.28, a: 0.02, d: 0.28, hits: [0, 0.42], each: true, vib: { hz: 9, cents: 40 } }];
    if (name === 'creak') return [{ type: 'sawtooth', f: 70 * p, filter: { type: 'lowpass', f: 250, f1: 520, q: 12, over: 0.5 }, a: 0.06, d: 0.5 }];
    if (name === 'whistle') return [{ type: 'sine', f: 1900 * p, a: 0.02, d: 0.16 }, { type: 'sine', f: 1500 * p, at: 0.2, a: 0.02, d: 0.24 }];
    n = 3 + Math.floor(Math.random() * 4);
    for (i = 0; i < n; i++) hits.push(i * 0.47);
    return [{ type: 'pink', filter: { type: 'bandpass', f: 320 * p, q: 1.5 }, a: 0.003, d: 0.06, hits: hits },
            { type: 'white', filter: { type: 'highpass', f: 2500 }, rel: -14, a: 0.001, d: 0.012, hits: hits }];
  }
  function partsOf(e, place) {
    var bell = function (f, d) { return [{ type: 'sine', f: f, a: 0.005, d: d }, { type: 'sine', f: f * 2, rel: -10, a: 0.004, d: d * 0.6 }, { type: 'sine', f: f * 3, rel: -16, a: 0.003, d: d * 0.4 }]; };
    switch (e.voice) {
      case 'on': case 'arrival': return timbre(TIMBRE[place], e.f);
      case 'plan': return planParts(place, e.send);
      case 'sendoff': return [{ type: 'white', filter: { type: 'bandpass', f: 700, f1: 2200, q: 1.4, over: 0.24 }, a: 0.04, d: 0.2 }];
      case 'latch': return [{ type: 'triangle', f: 210, a: 0.001, d: 0.07, hits: [0, 0.028] }, { type: 'white', filter: { type: 'bandpass', f: 1400, q: 2 }, rel: -14, a: 0.001, d: 0.012, hits: [0, 0.028] }];
      case 'back': return [{ type: 'sine', f: 110, f1: 70, glide: 0.18, a: 0.005, d: 0.3 }].concat(colourParts(COLOUR[place]));
      case 'paper': return [{ type: 'white', filter: { type: 'bandpass', f: 2800, f1: 1200, q: 1.6, over: 0.18 }, a: 0.02, d: 0.16 }];
      case 'bell': return bell(e.f, 2.0);
      case 'chime': return [{ type: 'sine', f: e.f, a: 0.002, d: 0.6 }, { type: 'sine', f: e.f * 2.76, rel: -12, a: 0.002, d: 0.25 }];
      case 'low': return [{ type: 'sine', f: e.f, a: 0.25, d: 2.25 }, { type: 'triangle', f: e.f * 2, rel: -14, a: 0.3, d: 1.6 }];
      case 'flick': return [{ type: 'white', filter: { type: 'bandpass', f: 3000, q: 2 }, a: 0.005, d: 0.055 }];
      case 'count': return [{ type: 'sine', f: e.f, a: 0.004, d: 1.4 }, { type: 'sine', f: e.f * 2, rel: -14, a: 0.004, d: 0.7 }];
      case 'page': return [{ type: 'pink', filter: { type: 'bandpass', f: 1200, f1: 3200, q: 1.2, over: 0.18 }, a: 0.05, d: 0.2 },
                           { type: 'white', filter: { type: 'bandpass', f: 2600, f1: 1500, q: 1.4, over: 0.2 }, rel: -6, at: 0.17, a: 0.03, d: 0.22 }];
      case 'pluck': return [{ type: 'triangle', f: e.f, a: 0.004, d: 0.5 }];
      case 'toll': return [{ type: 'sine', f: e.f, a: 0.003, d: 0.9 }, { type: 'sine', f: e.f * 2.76, rel: -10, a: 0.002, d: 0.4 }, { type: 'sine', f: e.f * 5.4, rel: -16, a: 0.002, d: 0.2 }];
      case 'tent': return [{ type: 'sine', f: 180, a: 0.002, d: 0.12 }, { type: 'sine', f: 180 * 3.98, rel: -14, a: 0.001, d: 0.04 }];
      case 'close': return [{ type: 'sine', f: e.f, a: 0.06, d: 2.4 }, { type: 'sine', f: e.f * 2, rel: -12, a: 0.06, d: 1.2 }];
    }
    return [];
  }

  // ---- the live state -----------------------------------------------------------------------
  // S exists from boot on; S.ac (the one AudioContext) only from the Sound button's first click.
  var S = null, LOG = null, BTN_ID = 'sound-btn';
  var GLYPH = '<svg class="sound-glyph" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">' +
    '<path class="sound-cone" d="M3.5 7.6h3l4-3.3v11.4l-4-3.3h-3z"></path>' +
    '<path class="sound-wave" d="M13.1 7.4a3.6 3.6 0 0 1 0 5.2"></path>' +
    '<path class="sound-wave" d="M15.4 5a7 7 0 0 1 0 10"></path></svg>';
  // where the button stands in each view: after, before or last beside the named control
  var SPOTS = { opening: ['begin', 'after'], day: ['day-valley', 'after'], leaving: ['leave', 'after'], afterwards: ['skip', 'before'], chronicle: ['again', 'last'] };

  function audioCtor() { try { return root.AudioContext || root.webkitAudioContext || null; } catch (e) { return null; } }
  function now() { return S && S.ac ? S.ac.currentTime : 0; }
  function hiddenNow() { try { return !!(S.ctx.hidden && S.ctx.hidden()); } catch (e) { return false; } }
  function quietly(fn) { return function (a) { try { fn(a); } catch (e) { /* sound is never needed */ } }; }

  function boot(ctx) {
    var AC = audioCtor();
    if (!AC || !ctx || !ctx.doc || typeof ctx.doc.createElement !== 'function') return false;
    var place = 'valley', listening = !!(S && S.listening);
    try { place = placeOf(ctx.place && ctx.place()); } catch (e) { place = 'valley'; }
    if (S && S.ac) { try { var c = S.ac.close(); if (c && c.then) c.then(null, function () {}); } catch (e) { /* closed */ } }   // a second boot starts afresh
    S = { ctx: ctx, doc: ctx.doc, AC: AC, ac: null, n: null, btn: null, on: false, away: false, gen: 0, awayGen: 0, heard: false,
          place: place, view: 'opening', day: 0, phase: null, opened: false, isNew: [],
          bed: null, bedGen: 0, applied: null, windows: [], recent: {}, voices: [], shots: [], duckUntil: 0, idleAt: null,
          music: null, musicGen: 0, musicDead: false, buffers: null, meter: null, listening: listening };
    try { mountButton(); } catch (e) { S = null; return false; }
    if (ARM_FROM_MEMORY && recall() === 'on') armOnInput();
    return true;
  }

  // ---- the button ---------------------------------------------------------------------------
  function mountButton() {
    var doc = S.doc, old = doc.getElementById ? doc.getElementById(BTN_ID) : null, btn, word;
    if (old && old.parentNode) old.parentNode.removeChild(old);      // a second boot makes the one button afresh
    btn = doc.createElement('button');
    btn.setAttribute('type', 'button');
    btn.setAttribute('id', BTN_ID);
    btn.className = 'btn btn-quiet sound-btn';
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = GLYPH;
    word = doc.createElement('span');
    word.className = 'sound-word';
    word.textContent = String(S.ctx.label || '');
    btn.appendChild(word);
    btn.addEventListener('click', quietly(press));
    S.btn = btn;
    placeButton('opening');
  }
  function placeButton(view) {
    var spot = SPOTS[view], btn = S.btn, ref, par, kids, had;
    if (!spot || !btn) return;
    ref = S.doc.getElementById(spot[0]);
    if (!ref || !ref.parentNode) return;
    par = ref.parentNode; kids = par.childNodes;
    try { had = S.doc.activeElement === btn; } catch (e) { had = false; }
    if (spot[1] === 'after') { if (ref.nextSibling !== btn) par.insertBefore(btn, ref.nextSibling); }
    else if (spot[1] === 'before') { if (btn.nextSibling !== ref || btn.parentNode !== par) par.insertBefore(btn, ref); }
    else if (kids[kids.length - 1] !== btn) par.appendChild(btn);
    btn.classList.toggle('is-compact', view === 'day' || view === 'afterwards');
    if (had && S.doc.activeElement !== btn) {          // a node moved keeps the focus it had
      try { btn.focus({ preventScroll: true }); } catch (e) { /* the focus stays where the page left it */ }
    }
  }
  function setPressed(on) { if (S.btn) S.btn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  function recall() { try { return root.localStorage.getItem(STORE_KEY); } catch (e) { return null; } }
  function remember(v) { try { root.localStorage.setItem(STORE_KEY, v); } catch (e) { /* storage refused: the button still works */ } }
  function armOnInput() {                             // ARM_FROM_MEMORY only: the first input anywhere starts sound
    var doc = S.doc, fired = false, go = quietly(function (e) {
      if (fired) return;
      fired = true;
      if (onButton(e)) return;                         // the Sound button itself: its own click decides
      if (S && !S.on && !S.ac) turnOn();
    });
    if (typeof doc.addEventListener !== 'function') return;
    doc.addEventListener('click', go, true);           // a click or a key: what a phone takes as a gesture
    doc.addEventListener('keydown', go, true);
  }
  function onButton(e) { var n = e && e.target, b = S && S.btn; return !!(n && b && (n === b || (typeof b.contains === 'function' && b.contains(n)))); }
  function press() { if (!S) return; if (S.on) turnOff(); else turnOn(); }

  // ---- on and off ---------------------------------------------------------------------------
  function turnOn() {
    var ac = S.ac, p, gen;
    try { var nav = root.navigator; if (nav && nav.audioSession) nav.audioSession.type = 'ambient'; } catch (e) { /* not there */ }
    if (!ac) {
      try { ac = new S.AC({ latencyHint: 'balanced' }); } catch (e) { try { ac = new S.AC(); } catch (e2) { ac = null; } }
      if (!ac) return;                                 // no sound here: the button stays off
      S.ac = ac;
      try { build(); } catch (e) { S.n = null; }
      if (!S.n) return;
    }
    S.on = true; S.gen++; gen = S.gen;
    setPressed(true);
    remember('on');
    try { p = ac.resume(); } catch (e) { p = null; }
    unlock();
    if (p && typeof p.then === 'function') {
      p.then(quietly(function () { if (S && S.gen === gen && S.on && ac.state && ac.state !== 'running') fail(); }),
             quietly(function () { if (S && S.gen === gen) fail(); }));
    }
    listen();
    S.away = hiddenNow();
    level(S.away ? 0 : 1, 0.3, true);
    S.idleAt = null; input();
    applyBed(true);
    if (!S.away) play('on', score('on', {}, { place: S.place }), 300);
    music();
    musicTap(null);                                    // inside the click: a refused track may play now
  }
  function turnOff() {
    var ac = S.ac, gen;
    S.on = false; S.gen++; gen = S.gen;
    setPressed(false);
    remember('off');
    if (!ac || !S.n) return;
    level(0, 0.4);
    musicHold(0.4);
    wait(0.45, function () { if (S && S.gen === gen && !S.on) suspend(); });
  }
  function fail() {                                    // resume() refused: back to off
    S.on = false; S.gen++;
    setPressed(false);
    if (S.n) level(0, 0.05);
    musicHold(0.05);
    suspend();
  }
  function suspend() { try { var p = S.ac.suspend(); if (p && p.then) p.then(null, function () {}); } catch (e) { /* already */ } }
  function resume() { try { var p = S.ac.resume(); if (p && p.then) p.then(null, function () {}); } catch (e) { /* refused */ } }
  function unlock() {                                  // a one-sample silent buffer, played inside the tap (iOS)
    try {
      var src = S.ac.createBufferSource();
      src.buffer = S.silent;
      src.connect(S.ac.destination);
      src.onended = function () { try { src.disconnect(); } catch (e) { /* gone */ } };
      src.start(0);
    } catch (e) { /* not needed here */ }
  }
  function listen() {                                  // once, at the first start: input for the idle, a refused track, and a hidden tab
    if (S.listening) return;
    S.listening = true;
    var doc = S.doc, inp = quietly(function () { if (S.on && S.ac) input(); }), tap = quietly(function (e) { if (S && S.on) musicTap(e); });
    if (typeof doc.addEventListener === 'function') {
      doc.addEventListener('pointerdown', inp, true);
      doc.addEventListener('keydown', inp, true);
      doc.addEventListener('click', tap, true);
      doc.addEventListener('keydown', tap, true);
      doc.addEventListener('visibilitychange', quietly(function () { if (hiddenNow()) away(); else back(); }));
    }
    if (typeof root.addEventListener === 'function') {
      root.addEventListener('pagehide', quietly(away));
      root.addEventListener('pageshow', quietly(function () { if (!hiddenNow()) back(); }));
    }
  }
  function away() {                                    // each hide and show its own generation: a hide's wait outlives no show
    if (!S || S.away) return;
    S.away = true; S.awayGen++;
    if (!S.on || !S.n) return;
    var gen = S.gen, ag = S.awayGen;
    level(0, 0.25);
    musicHold(0.25, true);
    wait(0.27, function () { if (S && S.gen === gen && S.awayGen === ag && S.away) suspend(); });
  }
  function back() {
    if (!S || !S.away) return;
    S.away = false; S.awayGen++;
    if (!S.on || !S.n) return;
    resume();
    level(1, 0.8);
    music(true);
  }

  // ---- the graph ----------------------------------------------------------------------------
  //   bed layers -> bedSum -> bedLP -> bedView -> bedDuck -> bedIdle -> master
  //   cue voices -> cues -> master;   music -> track -> musicDuck -> master
  //   master (-3 dB) -> compressor -> trim (its make-up gain taken off) -> destination
  function build() {
    var ac = S.ac, n = {}, sr = ac.sampleRate || 48000;
    function gain(v) { var g = ac.createGain(); g.gain.value = v; return g; }
    n.master = gain(0);
    n.comp = ac.createDynamicsCompressor();
    n.comp.threshold.value = COMP.threshold; n.comp.knee.value = COMP.knee; n.comp.ratio.value = COMP.ratio;
    n.comp.attack.value = COMP.attack; n.comp.release.value = COMP.release;
    n.trim = gain(dbGain(-MAKEUP_DB));
    n.master.connect(n.comp); n.comp.connect(n.trim); n.trim.connect(ac.destination);
    n.bedIdle = gain(1); n.bedDuck = gain(1); n.bedView = gain(1);
    n.bedLP = ac.createBiquadFilter(); n.bedLP.type = 'lowpass'; n.bedLP.frequency.value = Math.min(OPEN_LP, sr / 2); n.bedLP.Q.value = 0;
    n.bedSum = gain(1);
    n.bedSum.connect(n.bedLP); n.bedLP.connect(n.bedView); n.bedView.connect(n.bedDuck); n.bedDuck.connect(n.bedIdle); n.bedIdle.connect(n.master);
    n.cues = gain(1); n.cues.connect(n.master);
    n.track = gain(1); n.musicDuck = gain(1);
    n.track.connect(n.musicDuck); n.musicDuck.connect(n.master);
    S.silent = ac.createBuffer(1, 1, sr);
    S.buffers = { pink: noise(ac, 'pink'), white: noise(ac, 'white') };
    S.n = n;
  }
  // Two seconds of noise at unit RMS, its end blended into its start so that the loop has no seam.
  function noise(ac, kind) {
    var sr = ac.sampleRate || 48000, len = Math.floor(sr * 2), fade = Math.floor(sr * 0.05), raw = new Float32Array(len + fade);
    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, i, w, sum = 0, buf, data, k, x;
    for (i = 0; i < raw.length; i++) {
      w = Math.random() * 2 - 1;
      if (kind === 'pink') {                           // Paul Kellet's refined filter
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856; b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
        x = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362; b6 = w * 0.115926;
      } else x = w;
      raw[i] = x;
    }
    buf = ac.createBuffer(1, len, sr); data = buf.getChannelData(0);
    for (i = 0; i < len; i++) {
      x = raw[i];
      if (i < fade) { k = i / fade; x = raw[i] * Math.sqrt(k) + raw[len + i] * Math.sqrt(1 - k); }
      data[i] = x; sum += x * x;
    }
    k = sum > 0 ? 1 / Math.sqrt(sum / len) : 1;
    for (i = 0; i < len; i++) data[i] *= k;
    return buf;
  }
  // A param set from where it stands now: whatever was scheduled after now is dropped.
  function hold(param, t) {
    var v = param.value;
    try { param.cancelScheduledValues(t); } catch (e) { /* none */ }
    param.setValueAtTime(v, t);
    return v;
  }
  function ramp(param, v, t, dur) { hold(param, t); param.linearRampToValueAtTime(v, t + Math.max(0.01, dur)); }
  function rampF(param, v, t, dur) { hold(param, t); param.exponentialRampToValueAtTime(Math.max(1, v), t + Math.max(0.01, dur)); }
  function level(to, dur, smooth) {                    // the master: 1 is its level, 0 silence
    var g = S.n.master.gain, t = now(), v = to ? dbGain(MASTER_DB) : 0;
    if (smooth && to) { hold(g, t); g.setTargetAtTime(v, t, dur); }      // up within about four times dur
    else ramp(g, v, t, dur);
  }
  // A wait on the audio clock: a silent source that stops at the time asked, and its onended. It
  // stands still while the context is suspended, as the bed and the music do.
  function wait(sec, fn) {
    var ac = S.ac, t = ac.currentTime, src;
    try {
      if (typeof ac.createConstantSource === 'function') { src = ac.createConstantSource(); src.offset.value = 0; }
      else { src = ac.createBufferSource(); src.buffer = S.silent; src.loop = true; }
      src.connect(S.n.master);                         // it adds nothing, but a source not connected may never end
      src.onended = quietly(function () { try { src.disconnect(); } catch (e) { /* gone */ } fn(); });
      src.start(t);
      src.stop(t + Math.max(0.01, sec));
    } catch (e) { src = null; }
    return src;
  }

  // ---- the idle and the ducking -------------------------------------------------------------
  function input() {                                   // a cue or a tap or key: the bed is up, and drops after IDLE_S without one
    var g = S.n.bedIdle.gain, t = now(), low = S.idleAt !== null && t >= S.idleAt + IDLE_S;
    if (S.idleAt !== null && !low && t - S.idleAt < 1) return;
    hold(g, t);
    g.linearRampToValueAtTime(1, t + (low ? 2 : 0.02));
    g.setValueAtTime(1, t + IDLE_S);
    g.setTargetAtTime(dbGain(IDLE_DB), t + IDLE_S, 1.5);
    S.idleAt = t;
  }
  function duck(t0, t1) {                              // the bed and the music give way to a cue's voices
    var t = now(), until = Math.max(t1, S.duckUntil), b = S.n.bedDuck.gain, m = S.n.musicDuck.gain;
    S.duckUntil = until;
    hold(b, t); b.setValueAtTime(b.value, Math.max(t, t0)); b.linearRampToValueAtTime(dbGain(DUCK_BED_DB), Math.max(t, t0) + 0.03);
    b.setValueAtTime(dbGain(DUCK_BED_DB), until); b.linearRampToValueAtTime(1, until + 0.5);
    hold(m, t); m.setValueAtTime(m.value, Math.max(t, t0)); m.linearRampToValueAtTime(dbGain(DUCK_MUSIC_DB), Math.max(t, t0) + 0.04);
    m.setValueAtTime(dbGain(DUCK_MUSIC_DB), until); m.linearRampToValueAtTime(1, until + 0.7);
  }

  // ---- playing a score ----------------------------------------------------------------------
  // Each voice at currentTime + its offset - the output's latency; identical voices within 90 ms are
  // one; at most 12 at once, the newest moment always whole (the oldest voices are released in 15 ms to
  // make room); the bed's one-shots are held off 300 ms either side of the cue's window, and one already
  // sounding (or about to) is released in 15 ms as the cue comes.
  function play(name, evs, lead) {
    if (!evs.length) return;
    var ac = S.ac, t = ac.currentTime, lat = num(ac.outputLatency) ? ac.outputLatency : 0, base = t + (lead || 0) / 1000 - lat;
    var first = Infinity, last = -Infinity, end = -Infinity, played = [], todo = [], keep = [], i, e, at, key, v;
    pruneVoices(t);
    for (i = 0; i < evs.length; i++) {
      e = evs[i];
      at = Math.max(t, base + e.at / 1000);
      key = e.voice + '|' + (e.f || '') + '|' + e.pan + '|' + (e.send ? 1 : 0);
      if (has(S.recent, key) && Math.abs(S.recent[key] - at) < MERGE_MS / 1000) continue;
      S.recent[key] = at;
      todo.push([e, at]);
    }
    if (todo.length > MAX_VOICES) todo = todo.slice(0, MAX_VOICES);
    while (S.voices.length && S.voices.length + todo.length > MAX_VOICES) release(S.voices.shift(), t);
    for (i = 0; i < todo.length; i++) {
      e = todo[i][0]; at = todo[i][1];
      v = voice(e, at, S.n.cues);
      if (!v) continue;
      S.voices.push(v);
      played.push(e);
      first = Math.min(first, at); last = Math.max(last, at); end = Math.max(end, v.end);
    }
    if (!played.length) return;
    for (i = 0; i < S.shots.length; i++) { if (S.shots[i].end > first - HOLD_MS / 1000) release(S.shots[i], t); else keep.push(S.shots[i]); }
    S.shots = keep;
    duck(first, last + 0.15);
    S.windows.push([first - HOLD_MS / 1000, end + HOLD_MS / 1000]);
    if (LOG) LOG.push({ cue: name, at: t, place: S.place, voices: played });
  }
  function release(v, t) {                             // a voice cut short: 15 ms down, then stopped
    var i;
    for (i = 0; i < v.gains.length; i++) ramp(v.gains[i].gain, 0, t, 0.015);
    for (i = 0; i < v.srcs.length; i++) { try { v.srcs[i].stop(t + 0.02); } catch (e) { /* ended */ } }
  }
  function pruneVoices(t) {
    var keep = [], i, k;
    for (i = 0; i < S.voices.length; i++) if (S.voices[i].end > t) keep.push(S.voices[i]);
    S.voices = keep;
    keep = [];
    for (i = 0; i < S.shots.length; i++) if (S.shots[i].end > t) keep.push(S.shots[i]);
    S.shots = keep;
    keep = [];
    for (i = 0; i < S.windows.length; i++) if (S.windows[i][1] > t) keep.push(S.windows[i]);
    S.windows = keep;
    for (k in S.recent) if (has(S.recent, k) && S.recent[k] < t - 1) delete S.recent[k];
  }
  // One voice: its parts into a panner, every node released when the last part ends.
  function voice(e, t, dest) {
    var parts = partsOf(e, S.place), out = panner(e.pan, dest), sum = 0, i;
    if (!parts.length) return null;
    for (i = 0; i < parts.length; i++) sum += dbGain(parts[i].rel || 0);
    return sound(parts, t, dbGain(e.db) / sum, e.cents || 0, out.node, out.nodes);
  }
  function panner(pan, dest) {
    var ac = S.ac, p;
    if (pan && typeof ac.createStereoPanner === 'function') {
      p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); p.connect(dest);
      return { node: p, nodes: [p] };
    }
    return { node: dest, nodes: [] };
  }
  function sound(parts, t, scale, cents, dest, nodes) {
    var ac = S.ac, lastEnd = -1, lastSrc = null, gains = [], srcs = [], i, j, p, src, flt, g, peak, hits, h, hn, cut, th, end, vib, vg;
    for (i = 0; i < parts.length; i++) {
      p = parts[i];
      hits = p.hits || [0];
      peak = scale * dbGain(p.rel || 0);
      th = t + (p.at || 0);
      if (p.type === 'white' || p.type === 'pink') {
        src = ac.createBufferSource(); src.buffer = S.buffers[p.type]; src.loop = true;
      } else {
        src = ac.createOscillator(); src.type = p.type; src.frequency.value = p.f; src.detune.value = cents;
        if (p.vib) {
          vib = ac.createOscillator(); vib.frequency.value = p.vib.hz; vg = ac.createGain(); vg.gain.value = p.vib.cents;
          vib.connect(vg); vg.connect(src.detune); nodes.push(vib, vg); srcs.push(vib);
        } else vib = null;
      }
      g = ac.createGain(); g.gain.value = 0;
      nodes.push(src, g); gains.push(g); srcs.push(src);
      if (p.filter) {
        flt = ac.createBiquadFilter(); flt.type = p.filter.type; flt.frequency.value = p.filter.f;
        if (num(p.filter.q)) flt.Q.value = p.filter.q;
        src.connect(flt); flt.connect(g); nodes.push(flt);
      } else { flt = null; src.connect(g); }
      g.connect(dest);
      g.gain.setValueAtTime(0, th);
      g.gain.setValueAtTime(FLOOR, th);
      for (j = 0; j < hits.length; j++) {
        h = th + hits[j];
        // a hit struck before the last has died away takes over from where it stands: no step, no click
        hn = j + 1 < hits.length ? th + hits[j + 1] : Infinity;
        cut = Math.min(h + p.a + p.d, hn);
        g.gain.linearRampToValueAtTime(peak, h + p.a);
        g.gain.exponentialRampToValueAtTime(Math.max(FLOOR, peak * Math.pow(DECAY, (cut - h - p.a) / p.d)), cut);
        if (j === 0 || p.each) {
          if (num(p.f1) && src.frequency) { src.frequency.setValueAtTime(p.f, h); src.frequency.exponentialRampToValueAtTime(p.f1, h + (p.glide || p.a + p.d)); }
          if (flt && num(p.filter.f1)) { flt.frequency.setValueAtTime(p.filter.f, h); flt.frequency.exponentialRampToValueAtTime(p.filter.f1, h + (p.filter.over || p.a + p.d)); }
        }
      }
      end = th + hits[hits.length - 1] + p.a + p.d;
      g.gain.linearRampToValueAtTime(0, end + 0.02);      // from -60 dB to nothing
      if (src.buffer) src.start(th, Math.random() * 1.9); else src.start(th);
      src.stop(end + 0.03);
      if (vib) { vib.start(th); vib.stop(end + 0.03); }
      if (end > lastEnd) { lastEnd = end; lastSrc = src; }
    }
    if (lastSrc) lastSrc.onended = function () { for (var k = 0; k < nodes.length; k++) { try { nodes[k].disconnect(); } catch (x) { /* gone */ } } };
    return { end: t + partsEnd(parts), gains: gains, srcs: srcs };
  }

  // ---- the bed ------------------------------------------------------------------------------
  // applyBed: the bed of the place in hand, as bedFor says it should stand. A new place crossfades
  // over PLACE_S; a view, the evening or the calendar moves the standing bed over VIEW_S (now: quiet).
  function applyBed(now_) {
    if (!S.n) return;
    var spec = bedFor(S.place, S.view, S.day, S.phase, S.opened, S.ac.sampleRate), t = now(), dur = now_ ? 0.05 : VIEW_S, n = S.n, i, j, b, L;
    if (!S.bed || S.bed.place !== spec.place) {
      if (S.bed) fadeBed(S.bed, now_ ? 0.05 : PLACE_S);
      S.bed = startBed(spec, now_ && !S.applied ? 1.2 : now_ ? 0.05 : PLACE_S);
    } else {
      for (i = 0; i < S.bed.layers.length; i++) {
        L = S.bed.layers[i];
        for (j = 0; j < L.bands.length; j++) { b = spec.layers[i].bands[j]; rampF(L.bands[j].frequency, b.f, t, dur); }
      }
    }
    ramp(n.bedView.gain, dbGain(spec.gainDb), t, dur);
    // the Afterwards' low-pass opens over 3 s at its end (afterEnd); every other move as the view's
    var opening = !spec.lp && S.applied && S.applied.lp && !now_;
    rampF(n.bedLP.frequency, spec.lp || Math.min(OPEN_LP, (S.ac.sampleRate || 48000) / 2), t, opening ? 3 : dur);
    S.applied = spec;
  }
  function startBed(spec, fade) {
    var ac = S.ac, t = now(), bed = { place: spec.place, gen: ++S.bedGen, layers: [], srcs: [], nodes: [], fades: [] }, i, j, L, lay, src, f, g, groups, o, d, osc;
    for (i = 0; i < spec.layers.length; i++) {
      L = spec.layers[i];
      lay = { bands: [], gains: [] };
      if (L.share === null) {
        src = ac.createBufferSource(); src.buffer = S.buffers[L.noise]; src.loop = true;
        src.playbackRate.value = rnd(0.97, 1.03);
        bed.srcs.push(src); bed.nodes.push(src);
      } else src = bed.layers[L.share].src;
      lay.src = src;
      for (j = 0; j < L.bands.length; j++) {
        f = ac.createBiquadFilter(); f.type = L.bands[j].type; f.frequency.value = L.bands[j].f;
        if (num(L.bands[j].q)) f.Q.value = L.bands[j].q;
        src.connect(f); lay.bands.push(f); bed.nodes.push(f);
      }
      for (j = 0; j < L.gains.length; j++) {
        g = ac.createGain(); g.gain.value = 0;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(L.gains[j], t + fade);
        g.connect(S.n.bedSum); lay.gains.push(g); bed.nodes.push(g); bed.fades.push(g.gain);
      }
      if (lay.gains.length === 1) for (j = 0; j < lay.bands.length; j++) lay.bands[j].connect(lay.gains[0]);
      else for (j = 0; j < lay.bands.length; j++) lay.bands[j].connect(lay.gains[j]);
      groups = {};
      for (j = 0; j < L.lfos.length; j++) {
        o = L.lfos[j];
        if (!groups[o.group]) {
          d = ac.createGain(); d.gain.value = 0;
          var full = o.to === 'gain' ? o.depth * L.gains[Math.min(o.band, L.gains.length - 1)] : o.depth;
          d.gain.setValueAtTime(0, t); d.gain.linearRampToValueAtTime(full, t + fade);
          d.connect(o.to === 'gain' ? lay.gains[Math.min(o.band, lay.gains.length - 1)].gain : lay.bands[o.band].frequency);
          groups[o.group] = d; bed.nodes.push(d);
          if (o.to === 'gain') bed.fades.push(d.gain);
        }
        osc = ac.createOscillator(); osc.frequency.value = o.hz;
        osc.connect(groups[o.group]); bed.srcs.push(osc); bed.nodes.push(osc);
      }
      bed.layers.push(lay);
    }
    for (i = 0; i < bed.srcs.length; i++) {
      if (bed.srcs[i].buffer) bed.srcs[i].start(t, Math.random() * 1.9); else bed.srcs[i].start(t);
    }
    bed.count = bed.nodes.length;
    shotNext(bed, null);
    return bed;
  }
  function fadeBed(bed, fade) {
    var t = now(), i, last;
    bed.gone = true;
    for (i = 0; i < bed.fades.length; i++) ramp(bed.fades[i], 0, t, fade);
    for (i = 0; i < bed.srcs.length; i++) { try { bed.srcs[i].stop(t + fade + 0.05); } catch (e) { /* stopped */ } }
    last = bed.srcs[bed.srcs.length - 1];
    if (last) last.onended = function () { for (var k = 0; k < bed.nodes.length; k++) { try { bed.nodes[k].disconnect(); } catch (x) { /* gone */ } } };
  }
  // The one-shots chain by onended: a gap drawn with Math.random (never the game's seed), shorter early
  // in the calendar; none at Leaving, the birds none at the season's end; never within 300 ms of a cue:
  // none starts in a window already known, and each is kept (S.shots) so that a cue that comes while it
  // sounds, or in the 50 ms before it starts, releases it (play).
  function shotNext(bed, after) {
    var spec = BEDS[bed.place].shot, gap;
    if (!spec) return;
    gap = after !== null ? after : rnd(spec.gap[0], spec.gap[1]) / calendar(S.view, S.day);
    wait(gap, function () {
      if (!S || S.bed !== bed || bed.gone) return;    // a new place ended this chain
      var live = bedFor(S.place, S.view, S.day, S.phase, S.opened).shot, t = now() + 0.05, parts, dur, clear;
      if (!live || !S.on || S.away) { shotNext(bed, null); return; }
      parts = shotParts(spec.name);
      dur = partsEnd(parts);
      clear = clearAt(t, dur);
      if (clear > t + 0.001) { shotNext(bed, clear - now()); return; }
      var out = panner(rnd(-0.7, 0.7), S.n.bedSum), sum = 0, i;
      for (i = 0; i < parts.length; i++) sum += dbGain(parts[i].rel || 0);
      S.shots.push(sound(parts, t, dbGain(spec.db) / sum, 0, out.node, out.nodes));
      if (LOG) LOG.push({ cue: 'bed', at: t, place: bed.place, voices: [{ voice: spec.name, dur: dur * 1000 }] });
      shotNext(bed, dur + 0.02 + rnd(spec.gap[0], spec.gap[1]) / calendar(S.view, S.day));
    });
  }
  function partsEnd(parts) {                           // how long parts sound: the last envelope, its fade, its stop
    var end = 0, i, p;
    for (i = 0; i < parts.length; i++) { p = parts[i]; end = Math.max(end, (p.at || 0) + (p.hits ? p.hits[p.hits.length - 1] : 0) + p.a + p.d); }
    return end + 0.03;
  }
  function clearAt(t, dur) {                           // the first time from t at which a one-shot is clear of every cue window
    var moved = true, i, w, guard = 0;
    pruneVoices(now());
    while (moved && guard++ < 50) {
      moved = false;
      for (i = 0; i < S.windows.length; i++) {
        w = S.windows[i];
        if (t < w[1] && t + dur > w[0]) { t = w[1]; moved = true; }
      }
    }
    return t;
  }

  // ---- the music ----------------------------------------------------------------------------
  // Only with a valid entry for the place in hand, sound on, the tab in front and a view with music:
  // a wait (waitS), then a media element streamed through Web Audio (its own gain carries the level:
  // iOS ignores the element's volume), faded in, faded out before min(duration, maxS), a gap (gapS)
  // and again: never a hard loop. A new place lets it go and waits afresh; an error or a stall ends
  // music for the session, a play() refused for want of a tap only holds it. Every wait is on the
  // audio clock.
  function musicAllowed() { return !!(S.on && !S.away && !S.musicDead && MUSIC_VIEWS[S.view]); }
  function music(resumeHeld) {
    if (!S.n) return;
    var M = S.music, entry = trackFor(S.place);
    if (M && M.place !== S.place) { musicRelease(M, 2.5); M = S.music = null; }
    if (!entry || S.musicDead) return;
    if (!musicAllowed()) { if (M && M.state === 'play') musicHold(S.view === 'afterwards' ? 3 : 0.4, false); return; }
    if (!M) { M = S.music = { place: S.place, entry: entry, gen: ++S.musicGen, state: 'wait', el: null, round: 0, outGen: 0, refused: false }; musicWait(M, rnd(entry.waitS[0], entry.waitS[1])); return; }
    if (M.refused) return;                             // a refused play() waits for the reader's next click or key
    if (M.state === 'held' && resumeHeld && M.wasPlaying) musicPlay(M, true);
    else if (M.state === 'held') { M.state = 'wait'; musicWait(M, rnd(entry.waitS[0], entry.waitS[1])); }
  }
  function live(M, gen) { return !!(S && S.music === M && M.gen === gen); }
  function musicWait(M, sec) {
    var gen = M.gen;
    wait(sec, function () {
      if (!live(M, gen) || M.state !== 'wait') return;
      if (!musicAllowed()) { M.state = 'held'; M.wasPlaying = false; return; }
      if (!M.el && !musicLoad(M)) return;
      musicPlay(M, false);
    });
  }
  function musicLoad(M) {
    var el, node, g, gen = M.gen, dead = quietly(function () { if (live(M, gen)) musicDie(M); });
    try {
      g = S.ac.createGain(); g.gain.value = 0; g.connect(S.n.track);
      M.gain = g;
      el = new root.Audio();
      el.preload = 'none';
      el.src = M.entry.src;
      M.el = el;
      node = S.ac.createMediaElementSource(el);
      node.connect(g);
      M.node = node;
    } catch (e) { musicDie(M); return false; }
    el.addEventListener('loadedmetadata', quietly(function () { if (live(M, gen) && M.state === 'play') musicOut(M); }));
    el.addEventListener('ended', quietly(function () { if (live(M, gen) && M.state === 'play') musicGap(M); }));
    el.addEventListener('error', dead);
    el.addEventListener('stalled', dead);
    return true;
  }
  function musicPlay(M, resumed) {
    var g = M.gain.gain, t = now(), e = M.entry, gen = M.gen, p, at = 0, round;
    M.state = 'play'; M.wasPlaying = true; M.refused = false; round = ++M.round;
    if (!resumed) { try { M.el.currentTime = 0; } catch (x) { /* not loaded yet */ } }
    try { at = num(M.el.currentTime) ? M.el.currentTime : 0; } catch (x) { at = 0; }
    M.startAt = t - (resumed ? at : 0);
    ramp(g, dbGain(e.gainDb), t, resumed ? 0.8 : Math.max(0.05, e.fadeInS));
    try {
      p = M.el.play();
      if (p && typeof p.then === 'function') p.then(null, quietly(function (err) {
        if (!live(M, gen)) return;
        if (err && err.name === 'AbortError') return;  // our own pause() came first (Sound off, a hidden page, the Afterwards): not an error
        if (err && err.name === 'NotAllowedError') { if (M.state === 'play' && M.round === round) musicRefused(M, resumed); }
        else musicDie(M);                              // a media error: music ends for the session
      }));
    } catch (x) { musicDie(M); return; }
    musicOut(M);
  }
  // play() refused for want of a tap (iOS, 20 s and more after the click): not an error. The track is
  // held, silent, and plays again inside the reader's next click or key while music may play (musicTap).
  function musicRefused(M, resumed) {
    M.round++;                                         // its fade-out is stale
    ramp(M.gain.gain, 0, now(), 0.05);
    M.state = 'held'; M.wasPlaying = !!resumed; M.refused = true;
  }
  function musicTap(e) {
    var M = S.music;
    if (!M || !M.refused || M.state !== 'held' || !S.n || !musicAllowed() || onButton(e)) return;   // the Sound button's own click decides
    musicPlay(M, M.wasPlaying);
  }
  function musicOut(M) {                               // fade out before min(duration, maxS), then the gap
    var e = M.entry, dur = e.maxS, len, at, og = ++M.outGen, round = M.round, gen = M.gen;
    try { if (num(M.el.duration) && M.el.duration > 0) dur = M.el.duration; } catch (x) { dur = e.maxS; }
    len = Math.min(dur, e.maxS);
    at = M.startAt + Math.max(0, len - e.fadeOutS);
    wait(Math.max(0.01, at - now()), function () {
      if (!live(M, gen) || M.outGen !== og || M.round !== round || M.state !== 'play') return;
      ramp(M.gain.gain, 0, now(), Math.max(0.05, e.fadeOutS));
      wait(Math.max(0.05, e.fadeOutS) + 0.05, function () { if (live(M, gen) && M.outGen === og && M.round === round && M.state === 'play') musicGap(M); });
    });
  }
  function musicGap(M) {
    var e = M.entry;
    M.round++;
    try { M.el.pause(); } catch (x) { /* paused */ }
    M.state = 'wait'; M.wasPlaying = false;
    musicWait(M, rnd(e.gapS[0], e.gapS[1]));
  }
  // Sound off (0.4 s), a hidden tab (0.25 s, and it resumes where it was), the Afterwards (3 s): a fade
  // and a pause. A wait under way is held instead, unless the tab is only hidden (its clock stops).
  function musicHold(fade, keep) {
    var M = S.music, gen, round;
    if (!M || !S.n) return;
    if (M.state !== 'play') { if (M.state === 'wait' && !keep) M.state = 'held'; return; }
    gen = M.gen;
    M.round++; round = M.round;
    ramp(M.gain.gain, 0, now(), fade);
    M.state = 'held'; M.wasPlaying = !!keep;
    wait(fade + 0.02, function () { if (live(M, gen) && M.state === 'held' && M.round === round) { try { M.el.pause(); } catch (x) { /* paused */ } } });
  }
  function musicRelease(M, fade) {
    M.gen = -1;                                        // every wait and listener of this track is stale from here
    if (M.gain && M.state === 'play') ramp(M.gain.gain, 0, now(), fade);
    M.state = 'gone';
    wait(fade + 0.05, function () {
      try { if (M.el) { M.el.pause(); M.el.removeAttribute('src'); M.el.load(); } } catch (x) { /* released */ }
      try { if (M.node) M.node.disconnect(); if (M.gain) M.gain.disconnect(); } catch (x) { /* gone */ }
    });
  }
  function musicDie(M) {
    S.musicDead = true;
    if (S.music === M) S.music = null;
    musicRelease(M, 0.3);
  }

  // ---- the page's moments -------------------------------------------------------------------
  function cue(name, d) {
    if (!S || name === 'still') return;                // reduced motion turned on: the sound is unaffected (SPEC 5)
    d = d || {};
    var st = { place: S.place, day: S.day, isNew: S.isNew }, sounding = S.on && !!S.n && !S.away && !hiddenNow() && !d.quiet;
    follow(name, d);
    if (S.on && S.n && !d.quiet) input();
    if (sounding) play(name, score(name, d, st), 0);
  }
  // What the page now stands at (the place, the view, the day and its phase, the Afterwards) and,
  // with sound on, the bed and the music moved to it.
  function follow(name, d) {
    var bedMoves = false, quiet = !!d.quiet, i;
    if (name === 'place' && has(NOTES, d.place) && d.place !== S.place) { S.place = d.place; bedMoves = true; }
    else if (name === 'view' && typeof d.view === 'string') {
      S.view = d.view;
      if (d.view === 'afterwards') S.opened = false;
      placeButton(d.view);
      bedMoves = true;
    } else if (name === 'day' && num(d.day)) { S.day = d.day; S.phase = 'choose'; bedMoves = true; }
    else if (name === 'map' && d.mode === 'day' && num(d.day) && (d.day !== S.day || d.phase !== S.phase)) { S.day = d.day; S.phase = d.phase; bedMoves = true; }
    else if (name === 'reveal' && num(d.day)) { if (S.phase !== 'revealed') bedMoves = true; S.day = d.day; S.phase = 'revealed'; }
    else if (name === 'seasonEnd') { if (S.phase !== 'season') bedMoves = true; S.phase = 'season'; }
    else if (name === 'afterStart') { S.isNew = []; S.opened = false; }
    else if (name === 'season' && d.isNew) { S.isNew = []; for (i = 0; i < d.isNew.length; i++) S.isNew.push(d.isNew[i] === true); }
    else if (name === 'afterEnd') { S.opened = true; bedMoves = true; }
    if (!S.on || !S.n) return;
    if (bedMoves) applyBed(quiet);
    if (name === 'place' || name === 'view') music();
  }

  // ---- for the checks -----------------------------------------------------------------------
  function record(on) { LOG = on ? [] : null; return LOG; }
  function state() {
    if (!S) return null;
    return { on: S.on, context: !!S.ac, away: S.away, place: S.place, view: S.view, day: S.day, phase: S.phase, opened: S.opened,
             bedPlace: S.bed ? S.bed.place : null, bedNodes: S.bed ? S.bed.count : 0, voices: S.voices.length,
             music: S.music ? S.music.state : null, musicDead: S.musicDead, button: S.btn };
  }
  // A debug meter: the peak at the output since the last call, in dBFS (a script node on the output,
  // made on the first call). For a reader's console, never for the page.
  function meter() {
    if (!S || !S.n || typeof S.ac.createScriptProcessor !== 'function') return null;
    if (!S.meter) {
      var m = { peak: 0, node: S.ac.createScriptProcessor(1024, 2, 2) };
      m.node.onaudioprocess = function (e) {
        var c, i, x, d;
        for (c = 0; c < e.inputBuffer.numberOfChannels; c++) {
          d = e.inputBuffer.getChannelData(c);
          for (i = 0; i < d.length; i++) { x = d[i] < 0 ? -d[i] : d[i]; if (x > m.peak) m.peak = x; }
        }
      };
      S.n.trim.connect(m.node); m.node.connect(S.ac.destination);
      S.meter = m;
    }
    var p = S.meter.peak;
    S.meter.peak = 0;
    return p > 0 ? 20 * Math.log(p) / Math.LN10 : -Infinity;
  }

  root.AYSound = {
    boot: boot,
    cue: function (name, data) { try { cue(name, data); } catch (e) { /* sound is never needed */ } },
    TIMING: TIMING,
    tracks: tracks,
    _test: { score: score, bedFor: bedFor, trackOk: trackOk, record: record, state: state, meter: meter }
  };
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
