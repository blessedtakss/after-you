/*
 * After You: the motion of the page (window.AYMotion). app.js tells it each of the page's moments (cue),
 * synchronously, after the page has drawn that moment, with only what the page shows of it. The page never
 * needs it: with this file absent, declined or failing, the page is exactly as it is without it.
 *
 * What moves:
 *   - Two layers on every map, made after each drawing (the map cue): fx-air, under the holdings (the light's
 *     washes, the mist along the far line, the calendar's marginal notes, the water's shimmer, the Afterwards'
 *     inked ties), and fx-go, under the lettering (travellers, the places' images, ghosts). Both are
 *     aria-hidden, clipped by the map's own clip, and hold nothing a pointer or a key can reach.
 *   - The drawn marks themselves, by the Web Animations API alone (opacity, transform, stroke dashes), with no
 *     forward fill, so that every moment ends on the drawing at rest. No attribute of a drawn mark is written.
 *   - HTML by opacity alone.
 * A neighbour's missing act (they false) gets one fixed image per place, entering in place (a fade with a
 * 0.9 to 1 scale), keyed on nothing but the place, the sheet, the day and the lane: the same whatever its
 * cause. Every lane runs the same slot whatever happened on it. Light and weather follow the calendar alone.
 *
 * Time comes only from document.timeline. No timers and no frame callbacks; reduced motion is ctx.still(), and
 * the still cue (reduced motion turned on) stops whatever runs.
 * Nothing touches the page when the file loads: it loads in the bare jsc shell as in a browser.
 *   AYMotion.boot(ctx) -> bool   ctx: { doc, still(), hidden(), sheet(), place(), label } (app.js bootFx);
 *                                true only where the page's elements can be animated
 *   AYMotion.cue(name, data)     one of the page's moments (app.js cue); unknown names are ignored
 *   AYMotion.TIMING              the reveal's timings in ms, the same as AYSound.TIMING
 *   AYMotion._test               the pure planners: revealPlan, planPlan, seasonPlan, afterPlan, lightFor,
 *                                weatherFor (plain data in, plain data out; no page is read)
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
  var T = TIMING;
  var EASE = { ink: 'cubic-bezier(0.25, 0.6, 0.3, 1)', stamp: 'cubic-bezier(0.3, 1.5, 0.6, 1)', io: 'ease-in-out', lin: 'linear', out: 'ease-out' };
  var ORDER = [1, 2, 6, 7];                       // the engine's order of your four neighbours
  var SWEEP = { 7: 0, 6: 1, 2: 2, 1: 3 };         // k: the reveal sweeps west to east
  var MAP_OF = { opening: 'map-opening', day: 'map-day', leaving: 'map-leaving', afterwards: 'map-after' };
  var VIEW_OF = { 'map-opening': 'opening', 'map-day': 'day', 'map-leaving': 'leaving', 'map-after': 'afterwards' };
  var MAP_IDS = ['map-opening', 'map-day', 'map-leaving', 'map-after'];
  var SLOT = T.BEAT_AT + T.BEAT;                  // every lane's slot: from 30k, this long, whatever happened on it
  var CAP = 60;                                   // short animations in one reveal, travellers aside
  var LOOP_SPAN = 90000;                          // a loop runs this long at most before a cue starts it again
  var DUSK_TOP = 0.14;                            // .fx-dusk is filled at calc(var(--dusk-k) * 0.14): its opacity is v / 0.14
  var COMPACT = 0.857;                            // travellers and images on the compact sheet
  var KNOWN = { valley: 1, banks: 1, watch: 1, bridges: 1, saltmarket: 1 };

  // ---- small pure helpers -------------------------------------------------------------------

  function r1(n) { var v = Math.round(n * 10) / 10; return String(v === 0 ? 0 : v); }
  function r3(n) { return String(Math.round(n * 1000) / 1000); }
  function dist(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
  function copyPts(pts) { var out = [], i; for (i = 0; i < pts.length; i++) out.push([pts[i][0], pts[i][1]]); return out; }
  function cumLen(pts) { var out = [0], i; for (i = 1; i < pts.length; i++) out.push(out[i - 1] + dist(pts[i - 1], pts[i])); return out; }
  function totalLen(pts) { var c = cumLen(pts); return c[c.length - 1]; }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  // the point at a fraction of a line's length, and the line's way there in degrees
  function pointAt(pts, frac) {
    var c = cumLen(pts), L = c[c.length - 1], want = Math.max(0, Math.min(1, frac)) * L, i, t, a, b;
    for (i = 1; i < pts.length; i++) {
      if (c[i] >= want || i === pts.length - 1) {
        a = pts[i - 1]; b = pts[i]; t = c[i] > c[i - 1] ? (want - c[i - 1]) / (c[i] - c[i - 1]) : 0;
        return { p: lerp(a, b, Math.max(0, Math.min(1, t))), a: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI };
      }
    }
    return { p: [pts[0][0], pts[0][1]], a: 0 };
  }
  function nearestFrac(pts, q) {                 // the fraction along a line of its point nearest q
    var c = cumLen(pts), best = 0, bd = Infinity, i, d;
    for (i = 0; i < pts.length; i++) { d = dist(pts[i], q); if (d < bd) { bd = d; best = i; } }
    return c[c.length - 1] > 0 ? c[best] / c[c.length - 1] : 0;
  }
  function dLen(d) {                             // the length of a path drawn with M and L only
    var re = /([MLml])\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/g, m, s = 0, last = null, p;
    while ((m = re.exec(String(d)))) {
      p = [Number(m[2]), Number(m[3])];
      if (m[1] === 'l' && last) p = [last[0] + p[0], last[1] + p[1]];
      if ((m[1] === 'L' || m[1] === 'l') && last) s += dist(last, p);
      last = p;
    }
    return s;
  }
  function firstPoint(d) { var m = /M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/.exec(String(d)); return m ? [Number(m[1]), Number(m[2])] : [0, 0]; }
  function pathD(pts) {
    var s = 'M' + r1(pts[0][0]) + ' ' + r1(pts[0][1]), i;
    for (i = 1; i < pts.length; i++) s += 'L' + r1(pts[i][0]) + ' ' + r1(pts[i][1]);
    return s;
  }
  function tf(x, y, a, sx, sy) {                 // one transform list, the same functions in every keyframe
    return 'translate(' + r1(x) + 'px, ' + r1(y) + 'px) rotate(' + r1(a || 0) + 'deg) scale(' + r3(sx) + ', ' + r3(sy === undefined ? sx : sy) + ')';
  }
  function about(x, y, a) {                      // a turn of a drawn mark about the point (x, y) of the sheet
    return 'translate(' + r1(x) + 'px, ' + r1(y) + 'px) rotate(' + r1(a) + 'deg) translate(' + r1(-x) + 'px, ' + r1(-y) + 'px)';
  }
  function shift(dx, dy) { return 'translate(' + r1(dx) + 'px, ' + r1(dy) + 'px)'; }
  function placeKey(p) { return hasOwn(KNOWN, p) ? p : 'valley'; }
  function dayOf(day) { var d = Math.round(Number(day)); return d >= 1 && d <= 12 ? d : 1; }
  function seasonOf(day) { return Math.floor((dayOf(day) - 1) / 4); }       // 0, 1, 2

  // ---- the sheet's geometry, read from sheet.js ---------------------------------------------

  var laneCache = [];
  function lanesOf(sheet, kind) {               // AYSheet.lanes, once for each sheet definition and size
    var i, c;
    for (i = 0; i < laneCache.length; i++) if (laneCache[i].sheet === sheet && laneCache[i].kind === kind) return laneCache[i].lanes;
    c = { sheet: sheet, kind: kind, lanes: root.AYSheet.lanes(sheet, kind), kin: {} };
    laneCache.push(c);
    if (laneCache.length > 12) laneCache.shift();
    return c.lanes;
  }
  function kinLane(sheet, kind, from, to) { return root.AYSheet.lane(sheet, kind, from, to); }
  function geoOf(sheet, kind) {                 // copies of what the page's sheet is drawn from (read only)
    var g = root.AYSheet.geo(sheet, kind);
    return { L: g.L, pos: copyPts(g.pos), barrier: copyPts(g.barrier), farLine: copyPts(g.farLine) };
  }
  function farAt(far, x) {                       // the far line's height at x
    var i, a, b, t;
    for (i = 1; i < far.length; i++) {
      a = far[i - 1]; b = far[i];
      if ((a[0] - x) * (b[0] - x) <= 0) { t = b[0] === a[0] ? 0 : (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * t; }
    }
    return far.length ? far[far.length - 1][1] : 0;
  }
  function farPart(far, x0, x1, dy) {            // the far line between two widths, moved dy
    var out = [[x0, farAt(far, x0) + dy]], i;
    for (i = 0; i < far.length; i++) if (far[i][0] > x0 && far[i][0] < x1) out.push([far[i][0], far[i][1] + dy]);
    out.push([x1, farAt(far, x1) + dy]);
    return out;
  }

  // ---- the light over the twelve days (calendar alone) ---------------------------------------

  var MORNING_COOL = [0.10, 0.06, 0.03, 0.02], MORNING_MIST = [0.45, 0.20, 0.15, 0.25];
  var EVENING_DUSK = [0.04, 0.05, 0.06], SEASON_DUSK = [0.08, 0.10, 0.12];
  var ARC_MS = 19800;
  function arcPoints(place) {                    // the Afterwards' light: [at ms, cool, dusk]
    var border = place === 'watch';
    return [[0, 0.03, border ? 0.08 : 0.14], [2500, 0.10, 0], [9900, 0.02, 0], [ARC_MS, 0, border ? 0.06 : 0.10]];
  }
  function arcAt(place, ms) {
    var pts = arcPoints(place), i, t;
    if (!(ms > 0)) return { cool: pts[0][1], dusk: pts[0][2], mist: 0 };
    for (i = 1; i < pts.length; i++) {
      if (ms <= pts[i][0]) {
        t = (ms - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
        return { cool: pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t, dusk: pts[i - 1][2] + (pts[i][2] - pts[i - 1][2]) * t, mist: 0 };
      }
    }
    return { cool: pts[pts.length - 1][1], dusk: pts[pts.length - 1][2], mist: 0 };
  }
  // place, view ('opening' | 'day' | 'leaving' | 'afterwards'), day (1..12), phase ('choose' | 'revealed' |
  // 'season'; in the Afterwards 'start' or 'rest') -> { cool, dusk, mist }. Never the seed, never a result.
  // The Border's dusk is the same in every season and its mist the same always: nothing deepens there.
  function lightFor(place, view, day, phase) {
    var border = place === 'watch', d, s, mist;
    if (view === 'opening') return { cool: 0.04, dusk: 0, mist: border ? 0.20 : 0.25 };
    if (view === 'leaving') return { cool: 0.03, dusk: border ? 0.08 : 0.14, mist: border ? 0.20 : 0.35 };
    if (view === 'afterwards') return phase === 'start' ? arcAt(place, 0) : { cool: 0.04, dusk: 0, mist: 0 };
    if (view === 'day') {
      d = (dayOf(day) - 1) % 4; s = seasonOf(day); mist = border ? 0.20 : MORNING_MIST[d];
      if (phase === 'revealed') return { cool: 0.02, dusk: border ? 0.04 : EVENING_DUSK[s], mist: border ? 0.20 : mist / 2 };
      if (phase === 'season') return { cool: 0, dusk: border ? 0.08 : SEASON_DUSK[s], mist: border ? 0.20 : 0.30 };
      return { cool: MORNING_COOL[d], dusk: 0, mist: mist };
    }
    return { cool: 0, dusk: 0, mist: 0 };
  }
  function sameLight(a, b) { return !!a && !!b && Math.abs(a.cool - b.cool) < 1e-6 && Math.abs(a.dusk - b.dusk) < 1e-6 && Math.abs(a.mist - b.mist) < 1e-6; }

  // ---- weather and the calendar (marginal notes in the far band) -----------------------------
  // Every note lies at or above 0.36 of the sheet's height, clear of every holding's box with its bound and
  // 4 units more, at fixed places (fractions of the sheet) on both sheets. At most 3 loops on a map.
  var BIRDS = {
    valley: [[0.31, 0.20], [0.35, 0.17], [0.63, 0.21]],     // swallows, days 1-4
    banks: [[0.63, 0.18], [0.67, 0.215], [0.355, 0.205]],   // gulls, every day
    watch: [[0.32, 0.19], [0.36, 0.225], [0.665, 0.18]],    // crows, days 1-4
    bridges: [[0.34, 0.12], [0.645, 0.11]],                 // skylarks, days 1-6
    saltmarket: [[0.32, 0.24], [0.365, 0.23], [0.68, 0.245]] // pigeons, days 1-4
  };
  var BIRD_W = { valley: 2.6, banks: 3.4, watch: 2.9, bridges: 2.0, saltmarket: 2.4 };
  var STARS = [[0.33, 0.08], [0.66, 0.10], [0.06, 0.09], [0.95, 0.13], [0.39, 0.15], [0.61, 0.14], [0.09, 0.26]];
  var STAR_COUNT = [4, 6, 7];
  var LEAVES = [[0.27, 0.33], [0.44, 0.335], [0.72, 0.33]];
  var STOOKS = [0.30, 0.66, 0.12, 0.82, 0.36, 0.60, 0.22, 0.74];
  var SNOW = [0.25, 0.45, 0.65, 0.80];
  var SCRAPS = [[0.33, 0.255], [0.64, 0.26], [0.08, 0.27]];
  var LAMPS = [0.10, 0.20, 0.30, 0.70, 0.80, 0.90];

  // place, view, day, phase -> { notes: [kinds], loops: [kinds] }: what the calendar shows, by name
  function calendarOf(place, view, day, phase) {
    var notes = [], loops = [], d = dayOf(day), morning = phase === 'choose', evening = phase === 'revealed' || phase === 'season';
    if (place === 'valley' || place === 'banks' || place === 'bridges') loops.push('shimmer');
    if (view === 'opening' || view === 'afterwards') return { notes: notes, loops: view === 'opening' ? loops : [] };
    if (view === 'leaving') { d = 12; morning = false; evening = true; }
    if (place === 'valley') { if (d <= 4) notes.push('birds'); if (d >= 9) notes.push('leaves'); }
    if (place === 'banks') { notes.push('birds'); if (morning && (d === 2 || d === 6)) notes.push('fret'); }
    if (place === 'watch') { if (d <= 4) notes.push('birds'); if (d >= 9) notes.push('snow'); }
    if (place === 'bridges') { if (d <= 6) notes.push('birds'); if (d >= 5) notes.push('stooks'); if (morning && d >= 9) notes.push('dips'); }
    if (place === 'saltmarket') {
      if (d <= 4) notes.push('birds');
      if (d >= 5 && d <= 8 && view === 'day') loops.push('heat');
      if (d >= 9) notes.push('scraps');
      if (evening || view === 'leaving') notes.push('lamps');
    }
    if (view === 'day' && phase === 'season' && place !== 'watch') notes.push('stars');
    return { notes: notes, loops: loops };
  }
  function box(x0, y0, x1, y1) { return [Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1)]; }
  function P(x, y) { return r1(x) + ' ' + r1(y); }
  function birdMark(x, y, w) {
    return { d: 'M' + P(x - w, y - w * 0.45) + 'Q' + P(x - w * 0.45, y - w * 0.1) + ' ' + P(x, y + w * 0.3) + 'Q' + P(x + w * 0.45, y - w * 0.1) + ' ' + P(x + w, y - w * 0.45),
             box: box(x - w, y - w * 0.45, x + w, y + w * 0.3) };
  }
  // the notes as marks on one sheet: [{ kind, cls, d | circle, box }] and the loops' marks
  function weatherFor(place, view, day, phase, sheet, kind) {
    place = placeKey(place);
    kind = kind === 'compact' ? 'compact' : 'wide';
    sheet = sheet || sheetFor(place);
    var cal = calendarOf(place, view, day, phase), out = { notes: [], loops: [], calendar: cal }, g, L, W, H, u, i, k, x, y, m, n, s, v;
    if (!sheet || !root.AYSheet) return out;
    g = geoOf(sheet, kind); L = g.L; W = L.W; H = L.H; u = kind === 'compact' ? COMPACT : 1;
    function note(kindName, cls, d, bx, extra) {
      var o = { kind: kindName, cls: cls, d: d, box: bx }, key;
      for (key in (extra || {})) o[key] = extra[key];
      out.notes.push(o);
    }
    for (k = 0; k < cal.notes.length; k++) {
      n = cal.notes[k];
      if (n === 'birds') {
        for (i = 0; i < BIRDS[place].length; i++) { m = birdMark(BIRDS[place][i][0] * W, BIRDS[place][i][1] * H, BIRD_W[place] * u); note('birds', 'fx-wx-ink', m.d, m.box); }
      } else if (n === 'stars') {
        s = STAR_COUNT[seasonOf(day)];
        for (i = 0; i < s; i++) {
          x = STARS[i][0] * W; y = STARS[i][1] * H; v = 1.9 * u;
          note('stars', 'fx-wx-ink fx-star', 'M' + P(x - v, y) + 'L' + P(x + v, y) + 'M' + P(x, y - v) + 'L' + P(x, y + v), box(x - v, y - v, x + v, y + v), { order: i });
        }
      } else if (n === 'leaves') {
        for (i = 0; i < LEAVES.length; i++) {
          x = LEAVES[i][0] * W; y = LEAVES[i][1] * H; v = 1.6 * u;
          note('leaves', 'fx-wx-ink fx-leaf', 'M' + P(x - v, y) + 'Q' + P(x, y - v * 1.1) + ' ' + P(x + v, y) + 'Q' + P(x, y + v * 0.6) + ' ' + P(x - v, y) + 'Z', box(x - v, y - v * 1.1, x + v, y + v * 0.6));
        }
      } else if (n === 'snow') {
        v = SNOW[Math.max(0, Math.min(3, dayOf(day) - 9))];
        m = farPart(g.farLine, 0.03 * W, 0.97 * W, -0.6);
        note('snow', 'fx-wx-pale fx-snow', pathD(m), boxOf(m, 1.6), { level: v });
      } else if (n === 'stooks') {
        s = Math.min(8, dayOf(day) - 4);
        for (i = 0; i < s; i++) {
          x = STOOKS[i] * W; y = farAt(g.farLine, x) - 1; v = 1.8 * u;
          note('stooks', 'fx-wx-ink', 'M' + P(x - v, y) + 'L' + P(x, y - 2 * v) + 'L' + P(x + v, y) + 'M' + P(x - v * 0.35, y - v * 0.7) + 'L' + P(x - v * 0.6, y) +
               'M' + P(x + v * 0.35, y - v * 0.7) + 'L' + P(x + v * 0.6, y), box(x - v, y - 2 * v, x + v, y));
        }
      } else if (n === 'fret') {
        for (i = 0; i < 2; i++) {
          m = farPart(g.farLine, (i ? 0.60 : 0.24) * W, (i ? 0.76 : 0.40) * W, -4 * u);
          note('fret', 'fx-wx-dots', pathD(m), boxOf(m, 1));
          m = farPart(g.farLine, (i ? 0.62 : 0.26) * W, (i ? 0.74 : 0.38) * W, -7 * u);
          note('fret', 'fx-wx-dots', pathD(m), boxOf(m, 1));
        }
      } else if (n === 'dips') {
        for (i = 0; i < 2; i++) {
          m = farPart(g.farLine, (i ? 0.64 : 0.20) * W, (i ? 0.78 : 0.34) * W, -2 * u);
          note('dips', 'fx-wx-pale fx-dip', pathD(m), boxOf(m, 2.6 * u));
        }
      } else if (n === 'scraps') {
        for (i = 0; i < SCRAPS.length; i++) {
          x = SCRAPS[i][0] * W; y = SCRAPS[i][1] * H; v = 2 * u;
          note('scraps', 'fx-wx-ink', 'M' + P(x - v, y - v * 0.6) + 'L' + P(x + v * 1.1, y - v * 0.8) + 'L' + P(x + v * 0.9, y + v * 0.6) + 'L' + P(x - v * 0.9, y + v * 0.7) + 'Z' +
               'M' + P(x - v * 0.5, y - v * 0.6) + 'L' + P(x - v * 0.2, y + v * 0.65) + 'M' + P(x + v * 0.3, y - v * 0.7) + 'L' + P(x + v * 0.5, y + v * 0.6),
               box(x - v, y - v * 0.8, x + v * 1.1, y + v * 0.7));
        }
      } else if (n === 'lamps') {
        for (i = 0; i < LAMPS.length; i++) {
          x = LAMPS[i] * W; y = farAt(g.farLine, x) + 2.1 * u; v = 0.9 * u;
          note('lamps', 'fx-wx-lamp', null, box(x - v, y - v, x + v, y + v), { cx: x, cy: y, r: v });
        }
      }
    }
    for (k = 0; k < cal.loops.length; k++) {
      if (cal.loops[k] === 'shimmer' && g.barrier.length > 1) out.loops.push({ kind: 'shimmer', d: pathD(g.barrier) });
      if (cal.loops[k] === 'heat') {
        var dd = '', b = null, j, q;
        for (j = 0; j < 2; j++) {
          for (q = 0; q < 2; q++) {
            x = (j ? 0.60 : 0.30) * W; y = farAt(g.farLine, x + 0.05 * W) - (6 + q * 3.2) * u;
            var seg = 'M' + P(x, y), step = 0.1 * W / 6, z;
            for (z = 0; z < 6; z++) seg += 'Q' + P(x + step * (z + 0.5), y + (z % 2 ? 0.9 : -0.9) * u) + ' ' + P(x + step * (z + 1), y);
            dd += seg;
            b = b ? box(Math.min(b[0], x), Math.min(b[1], y - u), Math.max(b[2], x + 0.1 * W), Math.max(b[3], y + u)) : box(x, y - u, x + 0.1 * W, y + u);
          }
        }
        out.loops.push({ kind: 'heat', d: dd, box: b });
      }
    }
    return out;
  }
  function boxOf(pts, pad) {
    var b = [Infinity, Infinity, -Infinity, -Infinity], i;
    for (i = 0; i < pts.length; i++) { b[0] = Math.min(b[0], pts[i][0]); b[1] = Math.min(b[1], pts[i][1]); b[2] = Math.max(b[2], pts[i][0]); b[3] = Math.max(b[3], pts[i][1]); }
    return [b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad];
  }

  // ---- the drawings motion makes (ink, about 9 units tall; centred on 0 0) -------------------

  var FIG = {
    walker: '<ellipse class="fx-shadow" cx="0" cy="1.2" rx="2.6" ry="0.8"/><circle class="fx-solid" cx="0" cy="-7.3" r="1.3"/>' +
            '<path d="M0 -5.9L0 -2.3M0 -2.3L-1.6 1M0 -2.3L1.6 1M-1.8 -4.5L1.8 -4.3"/>',
    runner: '<ellipse class="fx-shadow" cx="0" cy="1.2" rx="2.6" ry="0.8"/><circle class="fx-solid" cx="1" cy="-7.2" r="1.3"/>' +
            '<path d="M0.6 -5.8L-0.4 -2.3M-0.4 -2.3L-2.3 0.9M-0.4 -2.3L1.8 0.6M-1.7 -4.7L2.1 -4.1M2.1 -4.1L2.1 -10.4"/>' +
            '<path class="fx-pale" d="M2.1 -10.4L5.7 -9.4L2.1 -8.4Z"/>',
    fish: '<path class="fx-solid" d="M-3.6 0Q-0.4 -2.3 3 0Q-0.4 2.3 -3.6 0Z"/><path class="fx-solid" d="M-3.3 0L-5.6 -1.7L-5.6 1.7Z"/>',
    cap: '<ellipse class="fx-shadow" cx="0" cy="1.2" rx="2.4" ry="0.7"/><path class="fx-solid" d="M-2.6 -4.2Q-2.6 -7.2 0 -7.2Q2.6 -7.2 2.6 -4.2Z"/><path d="M-4.2 -4.1L4.2 -4.1"/>',
    coin: '<ellipse class="fx-shadow" cx="0" cy="1" rx="2.2" ry="0.6"/><circle class="fx-pale" cx="0" cy="-2.6" r="2.4"/><path d="M-1 -2.6L1 -2.6"/>',
    net: '<path class="fx-net" d="M-4.6 0.6Q0 -5.2 4.6 0.6Z"/><path class="fx-net" d="M-2.8 -1.8L1.4 0.6M0 -2.9L3.3 0.4M-4 -0.3L-0.9 0.6M2.8 -1.8L-1.4 0.6M0 -2.9L-3.3 0.4M4 -0.3L0.9 0.6"/>' +
         '<circle class="fx-pale" cx="-4.6" cy="0.6" r="0.8"/><circle class="fx-pale" cx="4.6" cy="0.6" r="0.8"/>',
    fire: '<path class="fx-fire" d="M0 1C-2.6 0.6 -2.8 -2.2 -1.2 -4C-1 -2.6 -0.2 -2.2 0 -3.6C0.4 -5.2 1.6 -6 1.6 -7.4C3 -5.6 3.2 -3.6 2.6 -1.6C2.2 0.2 1.2 0.9 0 1Z"/>',
    cart: '<path class="fx-pale" d="M-3.6 -2L2 -2L2 2L-3.6 2Z"/><path d="M-2.5 -2.9L-2.5 2.9M0.8 -2.9L0.8 2.9M2 -1.2L5 -0.6M2 1.2L5 0.6"/>',
    tag: '<path class="fx-pale" d="M-4.2 -2.3L2.4 -2.3L4.3 0L2.4 2.3L-4.2 2.3Z"/><circle class="fx-solid" cx="2.2" cy="0" r="0.6"/><path class="fx-slash" d="M-3.4 2.9L1.6 -2.9"/>',
    ripple: '<circle class="fx-ripple" cx="0" cy="0" r="9" vector-effect="non-scaling-stroke"/>'
  };
  var TRAVELLER = { valley: 'walker', banks: 'fish', watch: 'runner', bridges: 'cap', saltmarket: 'coin' };
  var IMAGE = { valley: null, banks: 'net', watch: 'fire', bridges: 'cart', saltmarket: 'tag' };

  // ---- planners: plain data in, plain data out -----------------------------------------------
  // An item: { target, kf, delay, dur, ease, lane?, group, part, make?, traveller? }. A target names what it moves:
  //   map:m-hand:<from>-<to>, map:m-hand-head:<from>-<to>, map:m-lost:0-<id>, map:m-lost-x:0-<id>, map:m-stay:0-<id>,
  //   map:m-plan:0-<id>, map:m-plan-tip:0-<id>, map:hold:<house>:<class>, map:bound:<house>:<segment>, map:num:<n>,
  //   map:diamond:<house>, map:tent:<house>, card:<id>:<part>, fx:<name> (made from item.make), light:<part>, page:<part>.

  function scaleOf(kind) { return kind === 'compact' ? COMPACT : 1; }
  function drawOnKf(len) {
    var L = r1(Math.ceil(len) + 1);
    return [{ strokeDasharray: L + ' ' + L, strokeDashoffset: L }, { strokeDasharray: L + ' ' + L, strokeDashoffset: '0' }];
  }
  function popKf(from) { return [{ opacity: 0, transform: 'scale(' + from + ')' }, { opacity: 1, transform: 'scale(1)' }]; }
  function fadeInKf() { return [{ opacity: 0 }, { opacity: 1 }]; }
  // a figure moved along a line: positions at every fourth point of it (and its last), offsets by length;
  // fading in over fin ms and out over fout ms. o: { orient, tilt, s, sx: [[offset, scaleX]...] }
  function travelKf(pts, dur, fin, fout, o) {
    var c = cumLen(pts), L = c[c.length - 1] || 1, offs = [], i, kf = [], at, op;
    for (i = 0; i < pts.length; i += 4) offs.push(c[i] / L);
    offs.push(1);
    if (fin > 0) offs.push(Math.min(0.5, fin / dur));
    if (fout > 0) offs.push(Math.max(0.5, 1 - fout / dur));
    if (o.sx) for (i = 0; i < o.sx.length; i++) offs.push(o.sx[i][0]);
    offs.sort(function (a, b) { return a - b; });
    for (i = 0; i < offs.length; i++) {
      if (i > 0 && offs[i] - offs[i - 1] < 1e-4) continue;
      at = pointAt(pts, offs[i]);
      op = Math.min(1, fin > 0 ? offs[i] * dur / fin : 1, fout > 0 ? (1 - offs[i]) * dur / fout : 1);
      kf.push({ offset: Math.round(offs[i] * 10000) / 10000, opacity: r3(Math.max(0, op)),
                transform: tf(at.p[0], at.p[1], o.orient ? at.a : (o.tilt || 0), o.s * sxAt(o.sx, offs[i]), o.s) });
    }
    kf[0].offset = 0; kf[kf.length - 1].offset = 1;
    return kf;
  }
  function sxAt(list, off) {                     // a scale across the figure, by offset (the coin turning edge-on)
    if (!list) return 1;
    var prev = [0, 1], i;
    for (i = 0; i < list.length; i++) {
      if (off <= list[i][0]) return prev[1] + (list[i][1] - prev[1]) * ((off - prev[0]) / ((list[i][0] - prev[0]) || 1));
      prev = list[i];
    }
    return prev[1];
  }
  // an image entering in place: a fade with a 0.9 to 1 scale, held, then gone by the end of its slot
  function imageKf(x, y, a, s) {
    return [{ offset: 0, opacity: 0, transform: tf(x, y, a, 0.9 * s) }, { offset: 0.2, opacity: 1, transform: tf(x, y, a, s) },
            { offset: 0.78, opacity: 1, transform: tf(x, y, a, s) }, { offset: 1, opacity: 0, transform: tf(x, y, a, s) }];
  }
  function heldKf(x, y, a, s, pts) {             // a figure that stands at given offsets: pts [[offset, dx, dy, opacity]]
    var kf = [], i;
    for (i = 0; i < pts.length; i++) kf.push({ offset: pts[i][0], opacity: pts[i][3], transform: tf(x + pts[i][1], y + pts[i][2], a, s) });
    return kf;
  }

  // where the places' images stand on a lane: by the crossing, on your side or past it, and by your holding
  function spotsOf(ln, L) {
    var out = ln.out, back = ln.back, lo = totalLen(out) || 1, lb = totalLen(back) || 1;
    var co = nearestFrac(out, ln.cross), cb = nearestFrac(back, ln.cross), gap = L.cross * 1.45 + 4.5, wet = L.river * 0.95;
    return {
      cross: ln.cross, dir: ln.dir,
      mineNear: pointAt(out, co - gap / lo), theirNear: pointAt(back, cb - gap / lb),        // before the crossing (a cart waiting at the bridge)
      mineWet: pointAt(out, co + wet / lo), theirWet: pointAt(back, cb + wet / lb),          // past it (a net in the other's water)
      mineTag: pointAt(out, 0.14), theirTag: pointAt(back, 0.14),                           // by the holding (a price tag)
      outCross: co, backCross: cb
    };
  }
  function towerTop(g, house) {                  // the top of a holding's tower (the Border's fire)
    var c = g.pos[house], L = g.L, x = c[0] - L.pw / 2, y = c[1] - L.ph / 2;
    return [x + L.pw * 0.62, y + L.ph * 0.2];
  }
  function imageAt(place, side, sp, g, house) {  // where one side's image stands: { p, a }
    if (place === 'banks') return side === 'mine' ? sp.mineWet : sp.theirWet;
    if (place === 'watch') return { p: towerTop(g, house), a: 0 };
    if (place === 'bridges') return side === 'mine' ? sp.mineNear : sp.theirNear;
    if (place === 'saltmarket') {
      var t = side === 'mine' ? sp.mineTag : sp.theirTag, rad = t.a * Math.PI / 180;
      return { p: [t.p[0] - Math.sin(rad) * 6, t.p[1] + Math.cos(rad) * 6], a: 0 };
    }
    return null;
  }

  // The reveal, lane by lane. data: the reveal cue's payload (day, lanes, kin, kinWith, bank); sheet: the place's
  // sheet definition. -> { items, slots: { id: slot }, end }. Each lane's items depend on that lane alone (its
  // id, your act, theirs) with the place, the sheet and the day; its slot is the same whatever happened on it.
  function revealPlan(place, kind, data, sheet) {
    place = placeKey(place); kind = kind === 'compact' ? 'compact' : 'wide';
    sheet = sheet || sheetFor(place);
    var lanes = lanesOf(sheet, kind), g = geoOf(sheet, kind), L = g.L, s = scaleOf(kind), items = [], slots = {}, i, lane;
    var mineMoved = false;
    for (i = 0; i < ORDER.length; i++) slots[ORDER[i]] = slotOf(ORDER[i]);
    for (i = 0; data && data.lanes && i < data.lanes.length; i++) {
      lane = data.lanes[i];
      if (!hasOwn(SWEEP, lane.id)) continue;
      laneItems(items, place, kind, sheet, lanes, g, L, s, lane, data, slots[lane.id]);
    }
    // shared: your own holding answers once, at the first of your hands that arrived (the boat bobs, the cart draws aside)
    for (i = 0; data && data.lanes && i < ORDER.length; i++) {
      lane = laneById(data.lanes, [7, 6, 2, 1][i]);
      if (lane && lane.arrived && !mineMoved) { holdItems(items, place, 0, slots[lane.id].out, lanes[lane.id], 'shared', null); mineMoved = true; }
    }
    // the sister's dealings: ink alone, no traveller, and nothing at all where an act is missing
    for (i = 0; data && data.kinWith && i < data.kinWith.length; i++) {
      var kw = data.kinWith[i], a, b;
      if (kw.kinSent && (a = kinLane(sheet, kind, data.kin, kw.id))) {
        items.push({ target: 'map:m-hand:' + data.kin + '-' + kw.id, kf: drawOnKf(dLen(a.outD)), delay: T.KIN_AT, dur: T.LINE, ease: EASE.ink, group: 'kin', part: 'kin' });
        items.push({ target: 'map:m-hand-head:' + data.kin + '-' + kw.id, kf: popKf(0.6), delay: T.KIN_AT + 250, dur: T.HEAD, ease: EASE.stamp, group: 'kin', part: 'kin-head' });
      }
      if (kw.theySent && (b = kinLane(sheet, kind, kw.id, data.kin))) {
        items.push({ target: 'map:m-hand:' + kw.id + '-' + data.kin, kf: drawOnKf(dLen(b.outD)), delay: T.KIN_AT, dur: T.LINE, ease: EASE.ink, group: 'kin', part: 'kin' });
        items.push({ target: 'map:m-hand-head:' + kw.id + '-' + data.kin, kf: popKf(0.6), delay: T.KIN_AT + 250, dur: T.HEAD, ease: EASE.stamp, group: 'kin', part: 'kin-head' });
      }
    }
    var end = 0;
    for (i = 0; i < items.length; i++) end = Math.max(end, items[i].delay + items[i].dur);
    return { items: items, slots: slots, end: end };
  }
  function laneById(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function slotOf(id) {
    var k = SWEEP[id], at = T.STAGGER * k;
    return { id: id, k: k, at: at, end: at + SLOT, out: at, gate: at + 40, image: at + T.IMAGE_AT, inAt: at + T.IN_AT,
             theirImage: at + T.IN_AT + T.IMAGE_AT, gauge: at + T.GAUGE_AT, beat: at + T.BEAT_AT };
  }
  function laneItems(items, place, kind, sheet, lanes, g, L, s, lane, data, sl) {
    var id = lane.id, ln = lanes[id], sp = spotsOf(ln, L), fig = TRAVELLER[place], img = IMAGE[place], tag = '0-' + id, back = id + '-0';
    var mine = lane.arrived ? 'arrived' : lane.lost ? 'lost' : 'stay', at, p, base;
    function add(it) { it.lane = id; it.group = 'lane'; items.push(it); }
    // your side
    if (mine === 'arrived') {
      add({ target: 'map:m-hand:' + tag, kf: drawOnKf(dLen(ln.outD)), delay: sl.out, dur: T.LINE, ease: EASE.ink, part: 'out' });
      add({ target: 'map:m-hand-head:' + tag, kf: popKf(0.6), delay: sl.out + 250, dur: T.HEAD, ease: EASE.stamp, part: 'out-head' });
      add({ target: 'fx:trav:' + tag, make: { fig: fig, cls: 'fx-trav' }, traveller: true, delay: sl.out, dur: T.LINE, ease: EASE.ink, part: 'out-trav',
            kf: travelKf(ln.out, T.LINE, 40, 60, travelOpts(place, s)) });
    } else if (mine === 'lost') {
      var per = 8.2, n = Math.ceil(dLen(ln.brokenD) / per) * per;
      add({ target: 'map:m-lost:' + tag, kf: [{ offset: 0, strokeDashoffset: r1(n), opacity: 0 }, { offset: 0.15, opacity: 1 }, { offset: 1, strokeDashoffset: '0', opacity: 1 }],
            delay: sl.out, dur: 260, ease: EASE.ink, part: 'lost' });
      add({ target: 'map:m-lost-x:' + tag, kf: popKf(1.4), delay: sl.out + 240, dur: T.X, ease: EASE.stamp, part: 'lost-x' });
      leadIn(add, place, id, ln, sp, g, s, sl, fig);
    } else {
      var hinge = firstPoint(ln.gateD);
      add({ target: 'map:m-stay:' + tag, kf: [{ transform: about(hinge[0], hinge[1], 80) }, { transform: about(hinge[0], hinge[1], 0) }],
            delay: sl.gate, dur: T.GATE, ease: EASE.stamp, part: 'gate' });
      if (place === 'banks') {                     // your net, cast from your side before it settles
        p = imageAt(place, 'mine', sp, g, 0);
        add({ target: 'fx:cast:' + tag, make: { fig: 'net', cls: 'fx-img' }, traveller: true, delay: sl.gate, dur: T.IMAGE_AT - 40, ease: EASE.out, part: 'cast',
              kf: travelKf([pointAt(ln.out, 0.12).p, pointAt(ln.out, (sp.outCross + 0.12) / 2).p, p.p], T.IMAGE_AT - 40, 40, 30, { s: s }) });
      }
    }
    if (mine !== 'arrived' && img) {
      at = imageAt(place, 'mine', sp, g, 0);
      add({ target: 'fx:image:' + tag, make: { fig: img, cls: 'fx-img' }, kf: imageKf(at.p[0], at.p[1], place === 'bridges' ? at.a : 0, s), delay: sl.image, dur: T.IMAGE, ease: EASE.out, part: 'image' });
    }
    // their side
    if (lane.they) {
      add({ target: 'map:m-hand:' + back, kf: drawOnKf(dLen(ln.backD)), delay: sl.inAt, dur: T.LINE, ease: EASE.ink, part: 'in' });
      add({ target: 'map:m-hand-head:' + back, kf: popKf(0.6), delay: sl.inAt + 250, dur: T.HEAD, ease: EASE.stamp, part: 'in-head' });
      add({ target: 'fx:trav:' + back, make: { fig: fig, cls: 'fx-trav' }, traveller: true, delay: sl.inAt, dur: T.LINE, ease: EASE.ink, part: 'in-trav',
            kf: travelKf(ln.back, T.LINE, 40, 60, travelOpts(place, s)) });
      holdItems(items, place, id, sl.inAt, ln, 'lane', id);
    } else if (img) {                              // their missing act: the one image of the place, entering in place
      at = imageAt(place, 'theirs', sp, g, id);
      add({ target: 'fx:image:' + back, make: { fig: img, cls: 'fx-img' }, kf: imageKf(at.p[0], at.p[1], place === 'bridges' ? at.a : 0, s), delay: sl.theirImage, dur: T.IMAGE, ease: EASE.out, part: 'their-image' });
    }
    // the bank on the tie steps from this morning's level to the day's: this morning's gauge, drawn over the day's
    // (made at run time from the payload's levels), fades out; the plan itself carries no level, so that a lane's
    // plan is the same for any bank
    if (place === 'banks' && data.bank) {
      add({ target: 'fx:gauge:' + tag, part: 'gauge', make: { gauge: id },
            kf: [{ offset: 0, opacity: 1 }, { offset: Math.round(T.GAUGE_AT / (T.GAUGE_AT + T.GAUGE) * 1000) / 1000, opacity: 1 }, { offset: 1, opacity: 0 }],
            delay: sl.at, dur: T.GAUGE_AT + T.GAUGE, ease: EASE.lin });
    }
    // the resolution beat
    if (place === 'bridges') bridgeBeat(add, lane, ln, sp, s, sl, id);
    if (place === 'saltmarket' && lane.arrived && lane.they) {
      base = sp.cross;
      add({ target: 'fx:beat:' + tag, make: { fig: 'coin', cls: 'fx-trav' }, part: 'beat', delay: sl.beat, dur: T.BEAT, ease: EASE.out,
            kf: heldKf(base[0], base[1] + 2.6 * s, 0, s, [[0, 0, -7, 0], [0.12, 0, -6, 1], [0.4, 0, 0, 1], [0.8, 0, 0, 1], [1, 0, 0, 0]]) });
    }
    // the card's glyph plays the same lane
    if (mine === 'arrived') {
      add({ target: 'card:' + id + ':mine', kf: drawOnKf(20), delay: sl.out, dur: T.LINE, ease: EASE.ink, part: 'card' });
      add({ target: 'card:' + id + ':mine-head', kf: fadeInKf(), delay: sl.out + 250, dur: T.HEAD, ease: EASE.out, part: 'card' });
    } else if (mine === 'lost') {
      // its dashes (index.html .key-lost, 3.5 2.6) slid one whole period, as the map's .m-lost: it ends as it rests
      add({ target: 'card:' + id + ':lost', kf: [{ offset: 0, strokeDashoffset: '6.1', opacity: 0 }, { offset: 0.15, opacity: 1 }, { offset: 1, strokeDashoffset: '0', opacity: 1 }],
            delay: sl.out, dur: 260, ease: EASE.ink, part: 'card' });
      add({ target: 'card:' + id + ':lost-x', kf: fadeInKf(), delay: sl.out + 240, dur: T.X, ease: EASE.out, part: 'card' });
    } else add({ target: 'card:' + id + ':stay', kf: fadeInKf(), delay: sl.gate, dur: T.GATE, ease: EASE.out, part: 'card' });
    if (lane.they) {
      add({ target: 'card:' + id + ':theirs', kf: drawOnKf(20), delay: sl.inAt, dur: T.LINE, ease: EASE.ink, part: 'card' });
      add({ target: 'card:' + id + ':theirs-head', kf: fadeInKf(), delay: sl.inAt + 250, dur: T.HEAD, ease: EASE.out, part: 'card' });
    }
  }
  function travelOpts(place, s) {
    if (place === 'banks') return { s: s, orient: true };
    if (place === 'bridges') return { s: s, tilt: -18 };
    if (place === 'saltmarket') return { s: s, sx: [[0.25, 0.15], [0.5, 1], [0.75, 0.15], [1, 1]] };
    return { s: s };
  }
  // your hand turned back: what only you know, before it ends on the image of your refusal (at 30k + 200)
  function leadIn(add, place, id, ln, sp, g, s, sl, fig) {
    var tag = '0-' + id, end, at, rad, nx, ny;
    if (place === 'valley') {
      add({ target: 'fx:lead:' + tag, make: { fig: fig, cls: 'fx-trav' }, traveller: true, part: 'lead', delay: sl.out, dur: 260, ease: EASE.ink,
            kf: travelKf(ln.broken, 260, 40, 60, { s: s }) });
      add({ target: 'fx:ripple:' + tag, make: { fig: 'ripple', cls: 'fx-img' }, part: 'lead', delay: sl.out + 180, dur: 320, ease: EASE.out,
            kf: [{ opacity: 0.9, transform: tf(sp.cross[0], sp.cross[1], 0, 2 / 9) }, { opacity: 0, transform: tf(sp.cross[0], sp.cross[1], 0, 1) }] });
    } else if (place === 'banks') {              // the net drifts along the race, then settles on their side
      at = imageAt(place, 'mine', sp, g, 0); nx = -sp.dir[1]; ny = sp.dir[0];
      var a0 = pointAt(ln.out, sp.outCross - 0.04).p;
      add({ target: 'fx:lead:' + tag, make: { fig: 'net', cls: 'fx-img' }, traveller: true, part: 'lead', delay: sl.out, dur: T.IMAGE_AT, ease: EASE.io,
            kf: travelKf([a0, [a0[0] + nx * 4, a0[1] + ny * 4], [at.p[0] + nx * 5, at.p[1] + ny * 5], at.p], T.IMAGE_AT, 40, 40, { s: s }) });
    } else if (place === 'watch') {              // the runner sets off and halts at the post
      end = ln.broken[ln.broken.length - 1];
      var pts = ln.broken, kf = travelKf(pts, 260, 40, 0, { s: s });
      add({ target: 'fx:lead:' + tag, make: { fig: fig, cls: 'fx-trav' }, traveller: true, part: 'lead', delay: sl.out, dur: 480, ease: EASE.lin,
            kf: stretchKf(kf, 260 / 480).concat([{ offset: 0.85, opacity: 1, transform: tf(end[0], end[1], 0, s, s) }, { offset: 1, opacity: 0, transform: tf(end[0], end[1], 0, s, s) }]) });
    } else if (place === 'bridges') {            // your cart balks twice, then comes on
      at = sp.mineNear; rad = at.a * Math.PI / 180; nx = -Math.cos(rad) * 1.5; ny = -Math.sin(rad) * 1.5;
      add({ target: 'fx:lead:' + tag, make: { fig: 'cart', cls: 'fx-img' }, traveller: true, part: 'lead', delay: sl.out, dur: T.IMAGE_AT + 40, ease: EASE.lin,
            kf: [{ offset: 0, opacity: 0, transform: tf(at.p[0], at.p[1], at.a, s) }, { offset: 0.17, opacity: 1, transform: tf(at.p[0], at.p[1], at.a, s) },
                 { offset: 0.29, opacity: 1, transform: tf(at.p[0] + nx, at.p[1] + ny, at.a, s) }, { offset: 0.42, opacity: 1, transform: tf(at.p[0], at.p[1], at.a, s) },
                 { offset: 0.54, opacity: 1, transform: tf(at.p[0] + nx, at.p[1] + ny, at.a, s) }, { offset: 0.67, opacity: 1, transform: tf(at.p[0], at.p[1], at.a, s) },
                 { offset: 0.83, opacity: 1, transform: tf(at.p[0], at.p[1], at.a, s) }, { offset: 1, opacity: 0, transform: tf(at.p[0], at.p[1], at.a, s) }] });
    } else if (place === 'saltmarket') {         // the coin slips and rolls aside
      var mid = pointAt(ln.broken, 0.6); rad = mid.a * Math.PI / 180; nx = Math.sin(rad) * 5; ny = -Math.cos(rad) * 5;
      var pts2 = [ln.broken[0], pointAt(ln.broken, 0.3).p, mid.p, [mid.p[0] + nx * 0.5, mid.p[1] + ny * 0.5], [mid.p[0] + nx, mid.p[1] + ny]];
      add({ target: 'fx:lead:' + tag, make: { fig: fig, cls: 'fx-trav' }, traveller: true, part: 'lead', delay: sl.out, dur: T.IMAGE_AT, ease: EASE.lin,
            kf: travelKf(pts2, T.IMAGE_AT, 40, 50, { s: s, sx: [[0.3, 0.15], [0.6, 1], [0.85, 0.15], [1, 1]] }) });
    }
  }
  function stretchKf(kf, k) {                    // the same keyframes, played within the first k of a longer run
    var out = [], i, o;
    for (i = 0; i < kf.length; i++) { o = {}; for (var key in kf[i]) o[key] = kf[i][key]; o.offset = Math.round(kf[i].offset * k * 10000) / 10000; out.push(o); }
    return out;
  }
  // the sender's holding answers its hand: the Banks' boat bobs, the Bridges' cart draws aside 2 units
  function holdItems(items, place, house, delay, ln, group, laneId) {
    var parts, kf, i, nx = -ln.dir[1] * 2, ny = ln.dir[0] * 2;
    if (place === 'banks') {
      parts = ['m-hull', 'm-mast', 'm-sail'];
      kf = [{ offset: 0, transform: shift(0, 0) }, { offset: 0.3, transform: shift(0, -1.2) }, { offset: 0.6, transform: shift(0, 0.3) }, { offset: 0.8, transform: shift(0, -0.5) }, { offset: 1, transform: shift(0, 0) }];
      for (i = 0; i < parts.length; i++) items.push({ target: 'map:hold:' + house + ':' + parts[i], kf: kf, delay: delay, dur: 360, ease: EASE.io, group: group, lane: laneId === null ? undefined : laneId, part: 'bob' });
    } else if (place === 'bridges') {
      parts = ['m-cart', 'm-wheel', 'm-wheel:1', 'm-shaft'];
      kf = [{ offset: 0, transform: shift(0, 0) }, { offset: 0.35, transform: shift(nx, ny) }, { offset: 0.7, transform: shift(nx, ny) }, { offset: 1, transform: shift(0, 0) }];
      for (i = 0; i < parts.length; i++) items.push({ target: 'map:hold:' + house + ':' + parts[i], kf: kf, delay: delay, dur: T.LINE, ease: EASE.io, group: group, lane: laneId === null ? undefined : laneId, part: 'aside' });
    }
  }
  // the Bridges: a cart that came on crosses the deck; two meet mid-deck and shake; none, nothing
  function bridgeBeat(add, lane, ln, sp, s, sl, id) {
    var mineOn = !lane.arrived, theirsOn = !lane.they, c = sp.cross, d = sp.dir, nx = -d[1], ny = d[0], k, kf, i, a, meet, sg;
    var line, from, cf, to;
    if (mineOn && theirsOn) {
      for (k = 0; k < 2; k++) {
        a = k ? sp.theirNear : sp.mineNear;
        sg = k ? 2.2 * s : -2.2 * s;                // your cart stops on your side of the middle, theirs on theirs
        meet = [c[0] + d[0] * sg, c[1] + d[1] * sg];
        kf = [{ offset: 0, opacity: 0, transform: tf(a.p[0], a.p[1], a.a, s) }, { offset: 0.17, opacity: 1, transform: tf(meet[0], meet[1], a.a, s) }];
        for (i = 0; i < 5; i++) {
          kf.push({ offset: Math.round((0.17 + 0.135 * (i + 1)) * 1000) / 1000, opacity: 1,
                    transform: tf(meet[0] + nx * (i % 2 ? -1.2 : 1.2) * (i === 4 ? 0 : 1), meet[1] + ny * (i % 2 ? -1.2 : 1.2) * (i === 4 ? 0 : 1), a.a, s) });
        }
        kf.push({ offset: 1, opacity: 0, transform: tf(meet[0], meet[1], a.a, s) });
        add({ target: 'fx:beat:' + (k ? id + '-0' : '0-' + id), make: { fig: 'cart', cls: 'fx-img' }, part: 'beat', delay: sl.beat, dur: T.BEAT, ease: EASE.lin, kf: kf });
      }
    } else if (mineOn || theirsOn) {
      line = mineOn ? ln.out : ln.back; from = mineOn ? sp.mineNear : sp.theirNear; cf = mineOn ? sp.outCross : sp.backCross;
      to = pointAt(line, cf + (cf - nearestFrac(line, from.p)));
      add({ target: 'fx:beat:' + (mineOn ? '0-' + id : id + '-0'), make: { fig: 'cart', cls: 'fx-img' }, part: 'beat', delay: sl.beat, dur: T.BEAT, ease: EASE.io,
            kf: travelKf([from.p, pointAt(line, cf).p, to.p], T.BEAT, 40, 60, { s: s, orient: true }) });
    }
  }

  // A choice made: only that lane moves. data: { id, send }
  function planPlan(place, kind, data, sheet) {
    place = placeKey(place); kind = kind === 'compact' ? 'compact' : 'wide';
    sheet = sheet || sheetFor(place);
    var ln = lanesOf(sheet, kind)[data.id], items = [], hinge;
    if (!ln) return { items: items };
    if (data.send) {
      items.push({ target: 'map:m-plan:0-' + data.id, kf: drawOnKf(dLen(ln.stubD)), delay: 0, dur: 160, ease: EASE.ink, lane: data.id, group: 'lane', part: 'stub' });
      items.push({ target: 'map:m-plan-tip:0-' + data.id, kf: popKf(0.4), delay: 120, dur: 120, ease: EASE.stamp, lane: data.id, group: 'lane', part: 'tip' });
    } else {
      hinge = firstPoint(ln.gateD);
      items.push({ target: 'map:m-stay:0-' + data.id, kf: [{ transform: about(hinge[0], hinge[1], 80) }, { transform: about(hinge[0], hinge[1], 0) }],
                   delay: 0, dur: 160, ease: EASE.stamp, lane: data.id, group: 'lane', part: 'gate' });
    }
    return { items: items };
  }

  // The season's end. data: its payload; kept: what the day's map drew before it ({ bounds: { id: d },
  // diamonds: { id: d } }), from which the ghosts are made.
  function seasonPlan(place, kind, data, sheet, kept) {
    place = placeKey(place); kind = kind === 'compact' ? 'compact' : 'wide';
    sheet = sheet || sheetFor(place);
    var items = [], ids = ORDER, i, q, id, k, fb, fa, kb, ka, wx, st0;
    kept = kept || { bounds: {}, diamonds: {} };
    for (i = 0; i < ids.length; i++) {
      id = ids[i]; k = SWEEP[id];
      fb = (data.followBefore && data.followBefore[id]) || []; fa = (data.followAfter && data.followAfter[id]) || [];
      for (q = 0; q < 5; q++) {
        if (fa[q] && !fb[q]) items.push({ target: 'map:bound:' + id + ':' + q, kf: [{ strokeDasharray: '0 100' }, { strokeDasharray: '15 85' }], delay: 100 + 60 * k, dur: 320, ease: EASE.ink, group: 'season', part: 'bound' });
        else if (fb[q] && !fa[q] && kept.bounds[id]) {
          items.push({ target: 'fx:ghost-bound:' + id + ':' + q, part: 'ghost', group: 'season', delay: 100 + 60 * k, dur: 260, ease: EASE.out, kf: [{ opacity: 1 }, { opacity: 0 }],
                       make: { markup: '<path class="fx-ghost-bound" opacity="0" pathLength="100" stroke-dasharray="15 85" stroke-dashoffset="' + (-(q * 20 + 2.5)) + '" d="' + kept.bounds[id] + '"/>' } });
        }
      }
      kb = !!(data.keepsBefore && data.keepsBefore[id]); ka = !!(data.keepsAfter && data.keepsAfter[id]);
      if (ka && !kb) items.push({ target: 'map:diamond:' + id, kf: popKf(0.4), delay: 380 + 60 * k, dur: 200, ease: EASE.stamp, group: 'season', part: 'diamond' });
      else if (kb && !ka && kept.diamonds[id]) {
        items.push({ target: 'fx:ghost-diamond:' + id, part: 'ghost', group: 'season', delay: 380 + 60 * k, dur: 260, ease: EASE.out, kf: [{ opacity: 1 }, { opacity: 0 }],
                     make: { markup: '<path class="fx-ghost-diamond" opacity="0" d="' + kept.diamonds[id] + '"/>' } });
      }
    }
    wx = calendarOf(place, 'day', data.day, 'season');
    if (wx.notes.indexOf('stars') >= 0) {
      st0 = STAR_COUNT[seasonOf(data.day)];
      for (i = 0; i < st0; i++) items.push({ target: 'map:star:' + i, kf: fadeInKf(), delay: 120 * i, dur: 200, ease: EASE.out, group: 'season', part: 'star' });
    }
    items.push({ target: 'page:season-end', kf: [{ opacity: 0.5 }, { opacity: 1 }], delay: 0, dur: 200, ease: EASE.out, group: 'season', part: 'html' });
    return { items: items };
  }

  // One season of the Afterwards. prev: { yours: [8], isNew: [8], tieOn: { key: bool } }; data: the season
  // payload; diamonds: { house: d } as drawn. -> { items, tieOn, ties: [{ key, from, to }] }. Within the budget:
  // at most 16 opacity tweens and 8 stamps or ghosts.
  function afterPlan(prev, data, diamonds) {
    var items = [], j, ties = [], tieOn = {}, t, key, on, was, tweens = 0, stamps = 0, list = tieKeys();
    prev = prev || {};
    var py = prev.yours || [], pn = prev.isNew || [], pt = prev.tieOn || {};
    diamonds = diamonds || {};
    for (j = 0; data.lines && j < data.lines.length && tweens < 16; j++, tweens++) items.push({ target: 'line:' + j, kf: [{ opacity: 0.2 }, { opacity: 1 }], delay: 0, dur: 200, ease: EASE.out, group: 'after', part: 'line' });
    for (j = 0; j < 8; j++) {
      if (data.isNew && data.isNew[j] && !pn[j] && stamps < 8) { stamps++; items.push({ target: 'map:tent:' + j, kf: popKf(0.4), delay: 0, dur: 280, ease: EASE.stamp, group: 'after', part: 'tent' }); }
      if (data.yours && py[j] && !data.yours[j] && diamonds[j] && stamps < 8) {
        stamps++;
        items.push({ target: 'fx:ghost-diamond:' + j, part: 'ghost', group: 'after', delay: 0, dur: 260, ease: EASE.out, kf: [{ opacity: 1 }, { opacity: 0 }],
                     make: { markup: '<path class="fx-ghost-diamond" opacity="0" d="' + diamonds[j] + '"/>' } });
      }
      if (data.yours && data.yours[j] && !py[j] && stamps < 8) { stamps++; items.push({ target: 'map:diamond:' + j, kf: popKf(0.4), delay: 120, dur: 200, ease: EASE.stamp, group: 'after', part: 'diamond' }); }
    }
    for (t = 0; t < list.length; t++) {
      key = list[t]; on = tieBoth(data.yours, key); was = !!pt[key]; tieOn[key] = on;
      if (on !== was) {
        ties.push({ key: key, from: was ? 0.85 : 0, to: on ? 0.85 : 0 });
        if (tweens < 16) { tweens++; items.push({ target: 'tie:' + key, kf: [{ opacity: was ? 0.85 : 0 }, { opacity: on ? 0.85 : 0 }], delay: 300, dur: 360, ease: EASE.io, group: 'after', part: 'tie' }); }
      }
    }
    return { items: items, tieOn: tieOn, ties: ties };
  }
  function tieKeys() {
    var out = [], i, T16 = root.AYSheet ? root.AYSheet.TIES : [];
    for (i = 0; i < T16.length; i++) out.push(T16[i].key);
    return out;
  }
  function tieBoth(yours, key) { var e = String(key).split('-'); return !!(yours && yours[Number(e[0])] && yours[Number(e[1])]); }
  function sheetFor(place) {                     // the place's sheet definition, for a planner called without one
    var P = root.AYPlaces;
    if (P && P.byId && P.byId[place]) return P.byId[place].sheet;
    if (ctx && ctx.sheet) return ctx.sheet();
    return null;
  }

  // ---- the page: what motion reads and makes -------------------------------------------------

  var ctx = null, doc = null;
  var st = null;
  function fresh() {
    return {
      dressed: {},              // map id -> what its last drawing was (mode, kind, crop, day, phase, place, sheet)
      anims: {},                // map id or 'page' -> transients
      loops: {},                // map id -> loops
      light: { shown: null, prev: null },
      kept: null,               // the day map's last drawing before a season's end: { day, bounds, diamonds }
      aft: { phase: 'idle', yours: [], isNew: [], tieOn: {}, arcAt: null, natural: false, place: 'valley' },
      onScreen: { 'map-opening': true, 'map-day': true, 'map-leaving': true, 'map-after': true },
      view: 'opening', downgraded: false, measured: false, io: null,
      hid: 0                    // how often the page was hidden or shown again (visibilitychange)
    };
  }
  function clockMs() {
    var t = null;
    try { t = doc && doc.timeline ? doc.timeline.currentTime : null; } catch (e) { t = null; }
    return typeof t === 'number' && isFinite(t) ? t : 0;
  }
  function still() { try { return !!ctx.still(); } catch (e) { return false; } }
  function away() { try { return !!(ctx.hidden && ctx.hidden()); } catch (e) { return false; } }
  function calm(d) { return !!(d && d.quiet) || away() || still(); }
  function place() { var p = 'valley'; try { p = ctx.place(); } catch (e) { p = 'valley'; } return placeKey(p); }
  function sheetNow() { try { return ctx.sheet(); } catch (e) { return null; } }
  function byId(id) { try { return doc.getElementById(id); } catch (e) { return null; } }
  function cls(n) { return n && n.getAttribute ? (n.getAttribute('class') || '') : ''; }
  function hasCls(n, c) { return (' ' + cls(n) + ' ').indexOf(' ' + c + ' ') >= 0; }
  function tagOf(n) { return String(n && (n.localName || n.tagName) || '').toLowerCase(); }
  function kids(n) { var out = [], c = n ? n.childNodes : [], i; for (i = 0; c && i < c.length; i++) if (c[i].nodeType === 1) out.push(c[i]); return out; }
  function nextEl(n) { var s = n ? n.nextSibling : null; while (s && s.nodeType !== 1) s = s.nextSibling; return s; }
  function all(n, sel) { var out = [], l, i; if (!n) return out; try { l = n.querySelectorAll(sel); } catch (e) { return out; } for (i = 0; i < l.length; i++) out.push(l[i]); return out; }
  function shown(n) { while (n && n.nodeType === 1) { if (n.hidden === true) return false; n = n.parentNode; } return true; }
  function svgOf(id) { var box = byId(id), k = kids(box), i; for (i = 0; i < k.length; i++) if (tagOf(k[i]) === 'svg') return k[i]; return null; }
  function nodesOf(markup) {                     // markup parsed as SVG (a holder's innerHTML): no namespace is named
    var holder = doc.createElement('div'), svg;
    holder.innerHTML = '<svg>' + markup + '</svg>';
    svg = kids(holder)[0];
    return kids(svg);
  }
  function layer(svg, which) { var k = kids(svg), i; for (i = 0; i < k.length; i++) if (hasCls(k[i], which)) return k[i]; return null; }
  function addTo(group, markup) { var n = nodesOf(markup), i; for (i = 0; i < n.length; i++) group.appendChild(n[i]); return n[0] || null; }

  function play(node, kf, o, list) {
    var a = null;
    if (!node || typeof node.animate !== 'function') return null;
    try {
      a = node.animate(kf, { delay: o.delay || 0, duration: o.dur, easing: o.ease || EASE.lin, fill: o.fill || 'backwards', iterations: o.iter || 1 });
    } catch (e) { a = null; }
    if (a && list) list.push(a);
    return a;
  }
  function cancelList(list) { var i; for (i = 0; list && i < list.length; i++) { try { list[i].cancel(); } catch (e) { /* gone */ } } }
  function cancelAnims(key) { cancelList(st.anims[key]); st.anims[key] = []; }
  function cancelLoops(id) { cancelList(st.loops[id]); st.loops[id] = []; }
  function animsOf(key) { if (!st.anims[key]) st.anims[key] = []; return st.anims[key]; }

  // ---- the layers on a map --------------------------------------------------------------------

  function lightMarkup(light, L) {
    return '<rect class="fx-cool" x="0" y="0" width="' + L.W + '" height="' + L.H + '" opacity="' + r3(light.cool) + '"/>' +
           '<rect class="fx-dusk" x="0" y="0" width="' + L.W + '" height="' + L.H + '" opacity="' + r3(light.dusk / DUSK_TOP) + '"/>';
  }
  function mistMarkup(light, g) {
    var d = pathD(g.farLine);
    return '<g class="fx-mist fx-loop" data-loop="mist" opacity="' + r3(light.mist) + '"><path stroke-width="28" d="' + d + '"/><path stroke-width="18" d="' + d + '"/><path stroke-width="10" d="' + d + '"/></g>';
  }
  function weatherMarkup(wx) {
    var s = '', i, n, level = null;
    for (i = 0; i < wx.notes.length; i++) {
      n = wx.notes[i];
      if (n.kind === 'snow') level = n.level;
      if (n.kind === 'lamps') s += '<circle class="' + n.cls + '" cx="' + r1(n.cx) + '" cy="' + r1(n.cy) + '" r="' + r1(n.r) + '"/>';
      else s += '<path class="' + n.cls + '"' + (n.kind === 'stars' ? ' data-star="' + n.order + '"' : '') + ' d="' + n.d + '"/>';
    }
    s = s ? '<g class="fx-wx"' + (level !== null ? ' opacity="' + r3(level) + '"' : '') + '>' + s + '</g>' : '';
    for (i = 0; i < wx.loops.length; i++) {
      if (wx.loops[i].kind === 'shimmer') s += '<path class="fx-shimmer fx-loop" data-loop="shimmer" d="' + wx.loops[i].d + '"/>';
      if (wx.loops[i].kind === 'heat') s += '<path class="fx-wx fx-wx-ink fx-heat fx-loop" data-loop="heat" d="' + wx.loops[i].d + '"/>';
    }
    return s;
  }
  function tiesMarkup(svg) {                     // the Afterwards: each tie inked over, lit where both its ends run your ways
    var ties = all(svg, '.m-tie'), s = '', i, key;
    for (i = 0; i < ties.length; i++) {
      key = ties[i].getAttribute('data-tie');
      if (!key) continue;
      s += '<path class="fx-tie" data-fx-tie="' + key + '" opacity="' + (st.aft.tieOn[key] ? '0.85' : '0') + '" d="' + ties[i].getAttribute('d') + '"/>';
    }
    return s;
  }
  // The map cue: the map was drawn again. Its old motion is cancelled and its layers made again, at rest.
  function onMap(d) {
    var id = d.id, svg, sheet, g, view, light, inner, air, go, first, k, i, pl = place();
    if (!hasOwn(VIEW_OF, id)) return;
    cancelAnims(id); cancelLoops(id);
    svg = svgOf(id); sheet = sheetNow();
    if (!svg || !sheet || !root.AYSheet) return;
    g = geoOf(sheet, d.kind === 'compact' ? 'compact' : 'wide');
    view = VIEW_OF[id];
    st.dressed[id] = { mode: d.mode, kind: d.kind === 'compact' ? 'compact' : 'wide', crop: !!d.crop, day: d.day, phase: d.phase, place: pl, sheet: sheet };
    if (view === 'afterwards') light = afterLightNow(pl);
    else light = lightFor(pl, view, view === 'leaving' ? 12 : d.day, d.phase);
    if (view !== 'afterwards' && !sameLight(st.light.shown, light)) { st.light.prev = st.light.shown; st.light.shown = light; }
    inner = lightMarkup(light, g.L) + mistMarkup(light, g);
    if (view !== 'afterwards') inner += weatherMarkup(weatherFor(pl, view, view === 'leaving' ? 12 : d.day, d.phase, sheet, st.dressed[id].kind));
    else inner += tiesMarkup(svg);
    k = kids(svg); first = null;
    for (i = 0; i < k.length; i++) if (hasCls(k[i], 'm-hold')) { first = k[i]; break; }
    air = nodesOf('<g class="fx fx-air" aria-hidden="true" clip-path="url(#clip-' + d.mode + ')">' + inner + '</g>')[0];
    if (air) svg.insertBefore(air, first);
    first = null; k = kids(svg);
    for (i = 0; i < k.length; i++) if (tagOf(k[i]) === 'text') { first = k[i]; break; }
    go = nodesOf('<g class="fx fx-go" aria-hidden="true" clip-path="url(#clip-' + d.mode + ')"></g>')[0];
    if (go) svg.insertBefore(go, first);
    if (id === 'map-day' && d.phase !== 'season') keepDay(svg, d.day);
    if (view === 'afterwards' && st.aft.phase === 'arc' && !still()) playArc(svg, pl, clockMs() - st.aft.arcAt);
    startLoops(id);
  }
  function keepDay(svg, day) {                   // what the ghosts of a season's end are made from
    var kept = { day: day, bounds: {}, diamonds: {} }, holds = all(svg, '.m-hold'), i, h, b, dm;
    for (i = 0; i < holds.length; i++) {
      h = holds[i].getAttribute('data-map-house');
      b = all(holds[i], '.m-bound')[0] || all(holds[i], '.m-bound-slot')[0];
      dm = all(holds[i], '.m-diamond')[0];
      if (b) kept.bounds[h] = b.getAttribute('d');
      if (dm) kept.diamonds[h] = dm.getAttribute('d');
    }
    st.kept = kept;
  }
  function lightNodes(svg) {
    var air = layer(svg, 'fx-air');
    return { cool: all(air, '.fx-cool')[0] || null, dusk: all(air, '.fx-dusk')[0] || null, mist: all(air, '.fx-mist')[0] || null };
  }
  function setLight(svg, light) {                // the light at rest, written to motion's own nodes
    var n = lightNodes(svg);
    if (n.cool) n.cool.setAttribute('opacity', r3(light.cool));
    if (n.dusk) n.dusk.setAttribute('opacity', r3(light.dusk / DUSK_TOP));
    if (n.mist) n.mist.setAttribute('opacity', r3(light.mist));
  }
  // the light moves from the last light shown to the one the map was just drawn in
  function lightMove(id, d) {
    var L = st.light, from = L.prev, to = L.shown, svg, n, list;
    L.prev = L.shown;
    if (!from || !to || sameLight(from, to) || calm(d)) return 0;
    svg = svgOf(id); if (!svg) return 0;
    n = lightNodes(svg); list = animsOf(id);
    play(n.cool, [{ opacity: r3(from.cool) }, { opacity: r3(to.cool) }], { dur: T.LIGHT, ease: EASE.io }, list);
    play(n.dusk, [{ opacity: r3(from.dusk / DUSK_TOP) }, { opacity: r3(to.dusk / DUSK_TOP) }], { dur: T.LIGHT, ease: EASE.io }, list);
    if (Math.abs(from.mist - to.mist) > 1e-6) play(n.mist, [{ opacity: r3(from.mist) }, { opacity: r3(to.mist) }], { dur: T.LIGHT, ease: EASE.io }, list);
    return 3;
  }

  // ---- loops: stepped, phased from the document's timeline, finite -----------------------------

  function loopsOk(id) {
    var box = byId(id);
    return !still() && !st.downgraded && !away() && st.onScreen[id] !== false && VIEW_OF[id] === st.view && !!box && shown(box);
  }
  function startLoops(id) {
    var svg, air, nodes, i, n, kind, dur, kf, ease, a, list;
    cancelLoops(id);
    if (!loopsOk(id)) return;
    svg = svgOf(id); air = layer(svg, 'fx-air');
    nodes = all(air, '.fx-loop'); list = [];
    for (i = 0; i < nodes.length && list.length < 3; i++) {
      n = nodes[i]; kind = n.getAttribute('data-loop');
      if (kind === 'mist') {
        if (!(Number(n.getAttribute('opacity')) > 0)) continue;
        dur = 20000; ease = 'steps(40)'; kf = [{ transform: shift(-6, 0) }, { transform: shift(6, 0) }, { transform: shift(-6, 0) }];
      } else if (kind === 'shimmer') {
        dur = 2400; ease = 'steps(8)'; kf = [{ strokeDashoffset: '0' }, { strokeDashoffset: '-40' }];
      } else if (kind === 'heat') {
        dur = 2400; ease = 'steps(8)'; kf = [{ transform: shift(0, 0) }, { transform: shift(0, -1.2) }, { transform: shift(0, 0) }];
      } else continue;
      a = play(n, kf, { dur: dur, ease: ease, fill: 'none', iter: Math.ceil(LOOP_SPAN / dur) }, list);
      if (a) { try { a.currentTime = clockMs() % dur; } catch (e) { /* begins where it is */ } }
    }
    st.loops[id] = list;
  }
  function restartLoops() { var id = MAP_OF[st.view]; if (id) startLoops(id); }
  // the page hidden or shown again: its loops stop while it is hidden and start again when it is shown
  function onShown() {
    var i;
    if (!st) return;
    st.hid++;
    if (away()) { for (i = 0; i < MAP_IDS.length; i++) cancelLoops(MAP_IDS[i]); }
    else restartLoops();
  }

  // ---- running a plan ---------------------------------------------------------------------------

  function laneNode(svg, env, kindName, a, b) {   // a drawn mark of a hand, found by its d
    var d = null, ln, list, i;
    if (a === 0 && env.lanes[b]) {
      ln = env.lanes[b];
      d = kindName === 'm-hand' ? ln.outD : kindName === 'm-lost' ? ln.brokenD : kindName === 'm-stay' ? ln.gateD : kindName === 'm-plan' ? ln.stubD : null;
    } else if (b === 0 && env.lanes[a]) d = kindName === 'm-hand' ? env.lanes[a].backD : null;
    else if (kindName === 'm-hand') { ln = kinLane(env.sheet, env.kind, a, b); d = ln ? ln.outD : null; }
    if (d === null) return null;
    list = all(svg, '.' + kindName);
    for (i = 0; i < list.length; i++) if (list[i].getAttribute('d') === d) return list[i];
    return null;
  }
  function holdOf(svg, house) {
    var h = all(svg, '.m-hold'), i;
    for (i = 0; i < h.length; i++) if (h[i].getAttribute('data-map-house') === String(house)) return h[i];
    return null;
  }
  function cardPart(id, part) {
    var box = byId('cards'), card, glyph, paths, i, want, n;
    card = all(box, '.card').filter(function (c) { return c.getAttribute('data-house') === String(id); })[0];
    glyph = card ? all(card, '.result-glyph')[0] : null;
    if (!glyph) return null;
    paths = all(glyph, 'path');
    want = { mine: ['key-line', 'M17 7H37'], theirs: ['key-line', 'M42 17H22'], stay: ['key-ink', 'M17.5 3.2v7.6'], lost: ['key-lost', null] };
    var base = part.replace(/-(head|x)$/, ''), w = want[base];
    if (!w) return null;
    for (i = 0; i < paths.length; i++) {
      n = paths[i];
      if (hasCls(n, w[0]) && (w[1] === null || n.getAttribute('d') === w[1])) return /-(head|x)$/.test(part) ? nextEl(n) : n;
    }
    return null;
  }
  // resolve an item's target to the node it moves (making it, for fx); null when it is not there
  function resolve(it, env) {
    var t = it.target.split(':'), svg = env.svg, ends, h, list, i, go, q;
    if (t[0] === 'map' && svg) {
      if (t[1] === 'm-hand-head' || t[1] === 'm-lost-x' || t[1] === 'm-plan-tip') {
        ends = t[2].split('-');
        h = laneNode(svg, env, t[1] === 'm-hand-head' ? 'm-hand' : t[1] === 'm-lost-x' ? 'm-lost' : 'm-plan', Number(ends[0]), Number(ends[1]));
        return h ? nextEl(h) : null;
      }
      if (t[1] === 'm-hand' || t[1] === 'm-lost' || t[1] === 'm-stay' || t[1] === 'm-plan') { ends = t[2].split('-'); return laneNode(svg, env, t[1], Number(ends[0]), Number(ends[1])); }
      if (t[1] === 'hold') { h = holdOf(svg, t[2]); list = all(h, '.' + t[3]); return list[Number(t[4] || 0)] || null; }
      if (t[1] === 'bound') {
        h = holdOf(svg, t[2]); list = all(h, '.m-bound'); q = String(-(Number(t[3]) * 20 + 2.5));
        for (i = 0; i < list.length; i++) if (list[i].getAttribute('stroke-dashoffset') === q) return list[i];
        return null;
      }
      if (t[1] === 'diamond') return all(holdOf(svg, t[2]), '.m-diamond')[0] || null;
      if (t[1] === 'tent') return all(holdOf(svg, t[2]), '.m-tent')[0] || null;
      if (t[1] === 'num') return all(svg, '.m-num')[Number(t[2])] || null;
      if (t[1] === 'star') { list = all(layer(svg, 'fx-air'), '.fx-star'); return list[Number(t[2])] || null; }
    }
    if (t[0] === 'fx' && svg && it.make) {
      go = layer(svg, 'fx-go');
      if (!go) return null;
      if (it.make.markup) return addTo(go, it.make.markup);
      if (it.make.gauge) return env.bank ? addTo(go, gaugeGhost(env, it.make.gauge)) : null;
      return addTo(go, '<g class="' + it.make.cls + '" opacity="0">' + FIG[it.make.fig] + '</g>');
    }
    if (t[0] === 'card') return env.cards ? cardPart(t[1], t.slice(2).join(':')) : null;
    if (t[0] === 'page') return env.page ? env.page[t[1]] || null : null;
    if (t[0] === 'tie' && svg) { list = all(layer(svg, 'fx-air'), '.fx-tie'); for (i = 0; i < list.length; i++) if (list[i].getAttribute('data-fx-tie') === t[1]) return list[i]; return null; }
    if (t[0] === 'line') return env.lines ? env.lines[Number(t[1])] || null : null;
    return null;
  }
  function gaugeGhost(env, id) {                // this morning's gauge on your tie with house id, as sheet.js draws it
    var lv = env.bank.levels && env.bank.levels[id], top = env.bank.top, sp, spokes = '', q, ang;
    if (!lv || !(top > 0)) return '';
    sp = root.AYSheet.gaugeSpot(env.sheet, env.kind, '0-' + id);
    for (q = 0; q < top; q++) { ang = 2 * Math.PI * q / top - Math.PI / 2; spokes += 'M' + P(sp.p[0], sp.p[1]) + 'L' + P(sp.p[0] + sp.r * Math.cos(ang), sp.p[1] + sp.r * Math.sin(ang)); }
    return '<g class="fx-gauge" opacity="0"><circle class="fx-g-disc" cx="' + r1(sp.p[0]) + '" cy="' + r1(sp.p[1]) + '" r="' + r1(sp.r) + '"/>' +
           '<path class="fx-g-fill" d="' + root.AYSheet.gaugeD(env.sheet, env.kind, '0-' + id, { level: lv[0], top: top }) + '"/>' +
           (spokes ? '<path class="fx-g-spoke" d="' + spokes + '"/>' : '') + '</g>';
  }
  function runItems(items, env, list, limit) {
    var n = 0, i, node, a, end;
    for (i = 0; i < items.length; i++) {
      if (limit !== undefined && n >= limit) break;
      if (env.skipMap && (items[i].target.indexOf('map:') === 0 || items[i].target.indexOf('fx:') === 0)) continue;
      node = resolve(items[i], env);
      a = node ? play(node, items[i].kf, items[i], list) : null;
      if (!a) continue;
      n++;
      end = (items[i].delay || 0) + items[i].dur;
      if (!env.last || end > env.lastEnd) { env.last = a; env.lastEnd = end; }
    }
    return n;
  }
  function envFor(id) {
    var dr = st.dressed[id], sheet = dr ? dr.sheet : sheetNow(), kind = dr ? dr.kind : 'wide';
    return { svg: svgOf(id), sheet: sheet, kind: kind, lanes: sheet ? lanesOf(sheet, kind) : {}, cards: false, page: null };
  }

  // ---- the cues ---------------------------------------------------------------------------------

  function onView(d) {
    var id, i, sec;
    st.view = d.view;
    for (i = 0; i < MAP_IDS.length; i++) { cancelAnims(MAP_IDS[i]); if (VIEW_OF[MAP_IDS[i]] !== d.view) cancelLoops(MAP_IDS[i]); }
    cancelAnims('page');
    if (d.view === 'afterwards') { st.aft = { phase: 'pending', yours: [], isNew: [], tieOn: {}, arcAt: null, natural: false, place: place() }; }
    if (!calm(d)) {
      sec = all(doc.documentElement, '[data-view="' + d.view + '"]')[0];
      play(sec, [{ opacity: 0.5 }, { opacity: 1 }], { dur: T.VIEW, ease: EASE.out }, animsOf('page'));
    }
    id = MAP_OF[d.view];
    if (id) startLoops(id);
  }
  function onOpening(d) {
    var id = 'map-opening', env, svg, ln, dr = st.dressed[id], list, hand, s;
    if (calm(d) || !dr) return;
    env = envFor(id); svg = env.svg; list = animsOf(id);
    if (!svg) return;
    if (d.changed) play(byId(id), [{ opacity: 0.5 }, { opacity: 1 }], { dur: 200, ease: EASE.out }, animsOf('page'));
    ln = kinLane(env.sheet, env.kind, 0, 1);
    hand = all(svg, '.m-hand')[0]; s = scaleOf(env.kind);
    play(all(svg, '.m-num')[0], fadeInKf(), { delay: 120, dur: 200, ease: EASE.out }, list);
    if (hand) {
      play(hand, drawOnKf(dLen(hand.getAttribute('d'))), { delay: 120, dur: 440, ease: EASE.ink }, list);
      play(nextEl(hand), popKf(0.6), { delay: 560, dur: T.HEAD, ease: EASE.stamp }, list);
    }
    if (ln) {
      var trav = resolve({ target: 'fx:trav', make: { fig: TRAVELLER[place()], cls: 'fx-trav' } }, env);
      play(trav, travelKf(ln.out, 440, 40, 60, travelOpts(place(), s)), { delay: 120, dur: 440, ease: EASE.ink }, list);
    }
    play(all(svg, '.m-num')[1], fadeInKf(), { delay: 560, dur: 200, ease: EASE.out }, list);
  }
  function onDay(d) {
    var today;
    if (calm(d)) { st.light.prev = st.light.shown; return; }
    today = all(byId('day-track'), '.is-today')[0];
    play(today, [{ opacity: 0.3 }, { opacity: 1 }], { dur: T.VIEW, ease: EASE.out }, animsOf('page'));
    lightMove('map-day', d);
  }
  function onPlan(d) {
    var id = 'map-day', env, plan;
    if (calm(d) || !st.dressed[id]) return;
    env = envFor(id);
    plan = planPlan(place(), env.kind, d, env.sheet);
    runItems(plan.items, env, animsOf(id));
  }
  function onReveal(d) {
    var id = 'map-day', env, plan, list, lanesN = 0, rest, others = [], i, a, t0, hid0, end, last;
    if (calm(d) || !st.dressed[id]) { st.light.prev = st.light.shown; return; }
    env = envFor(id);
    env.cards = !!d.cards; env.bank = d.bank || null;
    env.skipMap = !d.map || st.onScreen[id] === false || !shown(byId(id));
    plan = revealPlan(place(), env.kind, d, env.sheet);
    list = animsOf(id);
    t0 = clockMs(); hid0 = st.hid;
    for (i = 0; i < plan.items.length; i++) {
      if (plan.items[i].group === 'lane') { a = runItems([plan.items[i]], env, list); if (!plan.items[i].traveller) lanesN += a; }
      else others.push(plan.items[i]);
    }
    rest = CAP - lanesN - (env.skipMap ? 0 : lightMove(id, d));
    if (env.skipMap) st.light.prev = st.light.shown;
    runItems(others, env, list, Math.max(0, rest));
    // the first reveal measures the page: one that ends half as late again as planned turns the loops off
    // (one begun calm is not run, and one the page was hidden or shown during is not judged: a later one is)
    if (!st.measured && !env.skipMap && env.last) {
      last = env.last; end = env.lastEnd;
      try {
        last.onfinish = function () {
          if (st.hid !== hid0) return;
          st.measured = true;
          if (clockMs() - t0 > 1.5 * end) { st.downgraded = true; for (var j = 0; j < MAP_IDS.length; j++) cancelLoops(MAP_IDS[j]); }
        };
      } catch (e) { /* not measured */ }
    }
  }
  function onSeasonEnd(d) {
    var id = 'map-day', env, plan, kept;
    if (calm(d) || !st.dressed[id]) { st.light.prev = st.light.shown; return; }
    env = envFor(id);
    env.skipMap = !d.map || st.onScreen[id] === false;
    env.page = { 'season-end': byId('season-end') };
    kept = st.kept && st.kept.day === d.day ? st.kept : null;
    plan = seasonPlan(place(), env.kind, d, env.sheet, kept);
    if (!env.skipMap) lightMove(id, d); else st.light.prev = st.light.shown;
    runItems(plan.items, env, animsOf(id));
  }
  function onLeaving(d) {
    var id = 'map-leaving', svg, h, segs, i, list;
    if (calm(d)) { st.light.prev = st.light.shown; return; }
    lightMove(id, d);
    svg = svgOf(id); h = holdOf(svg, 0); segs = all(h, '.m-bound'); list = animsOf(id);
    for (i = 0; i < segs.length && i < 5; i++) play(segs[i], [{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }], { delay: 80 * i, dur: 400, ease: EASE.io }, list);
  }

  // the Afterwards
  function afterLightNow(pl) {
    var a = st.aft;
    if (a.phase === 'rest' || a.phase === 'jump') return lightFor(pl, 'afterwards', null, 'rest');
    if (a.phase === 'arc') return arcAt(pl, ARC_MS);
    return lightFor(pl, 'afterwards', null, 'start');
  }
  function playArc(svg, pl, elapsed) {
    var n = lightNodes(svg), pts = arcPoints(pl), kc = [], kd = [], i, a, list = animsOf('map-after');
    for (i = 0; i < pts.length; i++) {
      kc.push({ offset: Math.round(pts[i][0] / ARC_MS * 10000) / 10000, opacity: r3(pts[i][1]) });
      kd.push({ offset: Math.round(pts[i][0] / ARC_MS * 10000) / 10000, opacity: r3(pts[i][2] / DUSK_TOP) });
    }
    a = play(n.cool, kc, { dur: ARC_MS, ease: 'steps(60)', fill: 'both' }, list);
    if (a && elapsed > 0) { try { a.currentTime = Math.min(elapsed, ARC_MS); } catch (e) { /* from its start */ } }
    a = play(n.dusk, kd, { dur: ARC_MS, ease: 'steps(60)', fill: 'both' }, list);
    if (a && elapsed > 0) { try { a.currentTime = Math.min(elapsed, ARC_MS); } catch (e) { /* from its start */ } }
  }
  function onAfterStart(d) {
    var a = st.aft, svg = svgOf('map-after'), pl = place();
    a.place = pl; a.natural = false;
    if (d.jump || calm(d)) { a.phase = 'jump'; if (svg) setLight(svg, lightFor(pl, 'afterwards', null, 'rest')); return; }
    a.phase = 'arc'; a.arcAt = clockMs();
    if (svg) { setLight(svg, arcAt(pl, ARC_MS)); playArc(svg, pl, 0); }
  }
  function writeTies(svg, tieOn) {
    var list = all(layer(svg, 'fx-air'), '.fx-tie'), i, key;
    for (i = 0; i < list.length; i++) { key = list[i].getAttribute('data-fx-tie'); list[i].setAttribute('opacity', tieOn[key] ? '0.85' : '0'); }
  }
  function diamondsOf(svg) {
    var out = {}, j, dm;
    for (j = 0; j < 8; j++) { dm = all(holdOf(svg, j), '.m-diamond')[0]; if (dm) out[j] = dm.getAttribute('d'); }
    return out;
  }
  function onSeason(d) {
    var a = st.aft, svg = svgOf('map-after'), plan, env;
    plan = afterPlan(a, d, svg ? diamondsOf(svg) : {});
    a.yours = (d.yours || []).slice(); a.isNew = (d.isNew || []).slice(); a.tieOn = plan.tieOn;
    if (d.to === 30 && d.byClock) a.natural = true;
    if (svg) writeTies(svg, a.tieOn);
    if (!d.byClock || calm(d) || a.phase !== 'arc' || !svg) return;
    env = envFor('map-after'); env.lines = d.lines || [];
    runItems(plan.items, env, animsOf('map-after'));
  }
  function onAfterEnd(d) {
    var a = st.aft, svg = svgOf('map-after'), pl = a.place || place(), natural = a.natural && a.phase === 'arc', from, to, tieOn = {}, keys = tieKeys(), i, list, ch = [];
    for (i = 0; i < keys.length; i++) { tieOn[keys[i]] = tieBoth(d.finalYours, keys[i]); if (tieOn[keys[i]] !== !!a.tieOn[keys[i]]) ch.push(keys[i]); }
    from = a.phase === 'arc' ? arcAt(pl, clockMs() - a.arcAt) : null;
    to = lightFor(pl, 'afterwards', null, 'rest');
    st.light.shown = to; st.light.prev = to;     // the last light shown: the next day map's moves from it
    var was = a.tieOn;
    a.tieOn = tieOn; a.yours = (d.finalYours || []).slice();
    if (!svg) { a.phase = 'rest'; return; }
    cancelAnims('map-after');
    writeTies(svg, tieOn); setLight(svg, to);
    if (calm(d) || a.phase !== 'arc') { a.phase = 'rest'; return; }
    a.phase = 'rest';
    list = animsOf('map-after');
    var n = lightNodes(svg), dur = natural ? T.LIGHT : 300;
    play(n.cool, [{ opacity: r3(from.cool) }, { opacity: r3(to.cool) }], { dur: dur, ease: EASE.io }, list);
    play(n.dusk, [{ opacity: r3(from.dusk / DUSK_TOP) }, { opacity: r3(to.dusk / DUSK_TOP) }], { dur: dur, ease: EASE.io }, list);
    if (natural) {
      var env = envFor('map-after');
      for (i = 0; i < ch.length && i < 16; i++) play(resolve({ target: 'tie:' + ch[i] }, env), [{ opacity: was[ch[i]] ? 0.85 : 0 }, { opacity: tieOn[ch[i]] ? 0.85 : 0 }], { dur: 360, ease: EASE.io }, list);
    }
  }

  // reduced motion turned on: everything running stops now, and the Afterwards' light is set at rest as if it
  // had jumped (its later season and afterEnd cues then move nothing); turned off, loops start at the next cue
  function onStill() {
    var k, svg;
    if (!still()) return;
    for (k in st.anims) if (hasOwn(st.anims, k)) cancelAnims(k);
    for (k in st.loops) if (hasOwn(st.loops, k)) cancelLoops(k);
    if (st.aft.phase === 'arc') {
      st.aft.phase = 'jump';
      svg = svgOf('map-after');
      if (svg) setLight(svg, lightFor(st.aft.place, 'afterwards', null, 'rest'));
    }
  }

  var CUES = {
    map: onMap, view: onView, opening: onOpening, day: onDay, plan: onPlan, reveal: onReveal, seasonEnd: onSeasonEnd,
    leaving: onLeaving, afterStart: onAfterStart, season: onSeason, afterEnd: onAfterEnd, still: onStill
  };

  function boot(c) {
    var i, n;
    if (!c || !c.doc || !c.doc.documentElement || typeof c.doc.documentElement.animate !== 'function') return false;
    if (typeof c.doc.createElement !== 'function' || typeof c.doc.getElementById !== 'function') return false;
    if (!root.AYSheet || typeof root.AYSheet.lanes !== 'function') return false;
    ctx = c; doc = c.doc; st = fresh();
    if (typeof doc.addEventListener === 'function') {
      try { doc.addEventListener('visibilitychange', onShown); } catch (e) { /* not heard */ }
    }
    if (typeof root.IntersectionObserver === 'function') {
      try {
        st.io = new root.IntersectionObserver(function (entries) {
          var j, id;
          for (j = 0; j < entries.length; j++) {
            id = entries[j].target && entries[j].target.id;
            if (!hasOwn(VIEW_OF, id)) continue;
            st.onScreen[id] = !!entries[j].isIntersecting;
            if (st.onScreen[id]) startLoops(id); else cancelLoops(id);
          }
        }, { threshold: 0 });
        for (i = 0; i < MAP_IDS.length; i++) { n = byId(MAP_IDS[i]); if (n) st.io.observe(n); }
      } catch (e) { st.io = null; }
    }
    return true;
  }
  function cue(name, data) {
    if (!ctx || !st || !hasOwn(CUES, name)) return;
    CUES[name](data || {});
    if (name !== 'map' && name !== 'view') restartLoops();
  }

  root.AYMotion = {
    boot: boot,
    cue: cue,
    TIMING: TIMING,
    _test: { revealPlan: revealPlan, planPlan: planPlan, seasonPlan: seasonPlan, afterPlan: afterPlan, lightFor: lightFor, weatherFor: weatherFor }
  };
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
