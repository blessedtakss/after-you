/*
 * After You: the sheet (the map of a place) and every other drawing that is a pure string: the
 * keys' small drawings, the day's dealing in miniature, the seal. No DOM: each function returns
 * SVG markup. Loads in a browser (window.AYSheet) and in the jsc shell (globalThis.AYSheet), after
 * words.js, whose words in force letter the sheet.
 *
 * Every drawing takes a sheet definition: the decoration of one place (places/<id>.js, `sheet`):
 *   barrier   { points, smooth, draw }  the line your four ties cross (draw: a key of BARRIERS)
 *   farLine   { points, smooth, draw }  the line the three far holdings lie beyond (FAR_LINES)
 *   crossing  where each of your ties meets the barrier (CROSSINGS)
 *   body      what stands inside a holding's box (BODIES)
 *   notes     [{ label, at, ... }]      lettered notes; label: a key of AYWords.mapLabels()
 *   glyph     { barrier, keyBarrier, seal }  SVG pieces for the result glyph, the key, the seal
 *   gauges    (a 'gauge' crossing only) { tie: how far along it } for a tie's gauge moved off its middle
 * The draw kinds: barriers 'stream' (a river: the valley's, the Bridges'), 'race' (the Banks' tide race),
 * 'border' (the Watch's border line) and 'lane' (the Saltmarket's market lane); far lines 'scarp' (a
 * ridge, hachured), 'shore' (a headland, stippled), 'downs' (rolling hills) and 'arcade' (the arches at
 * the edge of a square); crossings 'ring' (a ford), 'gauge' (the stock on the tie, a dial filled as far
 * as its level: see gaugeSVG), 'post' (a border post), 'bridge' (a bridge across the barrier, laid
 * along the tie) and 'cross' (a market cross); bodies 'field', 'boat', 'tower', 'cart' and 'stall'.
 * Every body keeps the house square in its box's corner (the diamond and the tent are drawn over it).
 * A place with a stock
 * draws its gauges from the Life's levels (o.gauge), over the hands, and in the Afterwards on all
 * sixteen ties, each with an id app.js fills season by season (AYSheet.gaugeD).
 * Points are fractions of the sheet. What every place shares is here: the two sheet sizes, the
 * eight positions, the sixteen ties, the holding's box with its ring and diamond, the hands'
 * lanes, the frame, the grid and the north mark. Colours come from the CSS tokens by class.
 */
(function (root) {
  'use strict';

  var W = root.AYWords;
  if (!W) throw new Error('sheet.js: load words.js first');
  var ORDER = [1, 2, 6, 7];                 // the engine's order of the four neighbours

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;';
    });
  }
  function f(n) { return String(Math.round(n * 10) / 10); }

  // ---- geometry of the sheet ----------------------------------------------------------------
  // One layout for every place and every view: your holding at the foot, inside the bend of the
  // barrier, four neighbours on an arc across it, three holdings beyond the far line.
  // Positions are fractions of the sheet; two sheet sizes keep lettering legible on a phone.
  // The lettering is sized so that no word falls under 11px where its sheet is drawn smallest:
  // the wide sheet in a box of 34rem (scale 0.91), the compact one across a 400px phone (0.97).
  // In a narrower box (a phone under 400px) the compact sheet's lettering is enlarged by what
  // the box lacks, so that the same holds there (letterUp, lettered).
  // crop: where a phone's day map is cut, just above the far line (see map).
  // river, water: the widths of the 'stream' barrier; cross: the radius of the crossing mark.

  var LAYOUT = {
    wide:    { W: 600, H: 450, pw: 44, ph: 30, hb: 10, bound: 6, name: 12.5, sub: 12.25, num: 13, note: 12.25, pad: 6, grid: 49, river: 9, water: 6.2, cross: 5.5, lane: 4.2, head: 4.6, crop: 99 },
    compact: { W: 380, H: 300, pw: 36, ph: 25, hb: 8, bound: 5, name: 12, sub: 11.5, num: 11.5, note: 11.5, pad: 5, grid: 37, river: 7, water: 4.6, cross: 4.6, lane: 3.6, head: 4.2, crop: 59 }
  };
  var POS = [[0.50, 0.845], [0.83, 0.665], [0.67, 0.42], [0.81, 0.165], [0.50, 0.13], [0.19, 0.165], [0.33, 0.42], [0.17, 0.665]];
  var BEND = { '0-1': 0.07, '0-7': -0.07, '0-2': 0.05, '0-6': -0.05, '1-2': 0.08, '6-7': 0.08, '1-7': 0.18,
               '1-3': 0.10, '5-7': 0.10, '2-4': 0.10, '4-6': 0.10, '3-5': -0.16 };
  var TIES = (function () {                 // sixteen ties: each house with the two on either side
    var out = [], a, b, d;
    for (a = 0; a < 8; a++) for (b = a + 1; b < 8; b++) {
      d = Math.min(b - a, 8 - (b - a));
      if (d <= 2) out.push({ a: a, b: b, key: a + '-' + b });
    }
    return out;
  })();
  function isFar(id) { return id >= 3 && id <= 5; }
  var LETTER_PX = 11;                       // no lettering on a map is drawn smaller than this
  // By how much a sheet's lettering must grow for its smallest word to reach LETTER_PX in a box
  // of this width: 1 wherever the sheet is drawn at the sizes it was laid out for.
  function letterUp(kind, boxWidth) {
    var L = LAYOUT[kind];
    if (!(boxWidth > 0)) return 1;
    var least = Math.min(L.name, L.sub, L.num, L.note) * boxWidth / L.W;
    return least < LETTER_PX ? Math.ceil(LETTER_PX / least * 100) / 100 : 1;
  }
  function lettered(L, up) {                // the same sheet with its lettering enlarged
    if (!(up > 1)) return L;
    var out = {}, k;
    for (k in L) out[k] = L[k];
    out.name = Math.ceil(L.name * up * 10) / 10; out.sub = Math.ceil(L.sub * up * 10) / 10;
    out.num = Math.ceil(L.num * up * 10) / 10; out.note = Math.ceil(L.note * up * 10) / 10;
    return out;
  }

  function dist(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
  function catmull(pts, per) {
    var out = [], i, j, p0, p1, p2, p3, t, t2, t3, k;
    for (i = 0; i < pts.length - 1; i++) {
      p0 = pts[Math.max(0, i - 1)]; p1 = pts[i]; p2 = pts[i + 1]; p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (j = 0; j < per; j++) {
        t = j / per; t2 = t * t; t3 = t2 * t;
        var q = [0, 0];
        for (k = 0; k < 2; k++) {
          q[k] = 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
                 (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t3);
        }
        out.push(q);
      }
    }
    out.push(pts[pts.length - 1].slice());
    return out;
  }
  function quadLine(a, b, k, n) {            // a gently bent path from a to b; k bends it to one side
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
    var cx = mx - dy * k, cy = my + dx * k, out = [], i, t, u;
    for (i = 0; i <= n; i++) {
      t = i / n; u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * cx + t * t * b[0], u * u * a[1] + 2 * u * t * cy + t * t * b[1]]);
    }
    return out;
  }
  function segHit(a, b, c, d) {
    var r0 = b[0] - a[0], r1 = b[1] - a[1], s0 = d[0] - c[0], s1 = d[1] - c[1];
    var den = r0 * s1 - r1 * s0;
    if (Math.abs(den) < 1e-9) return null;
    var t = ((c[0] - a[0]) * s1 - (c[1] - a[1]) * s0) / den, u = ((c[0] - a[0]) * r1 - (c[1] - a[1]) * r0) / den;
    if (t < 0 || t > 1 || u < 0 || u > 1) return null;
    return [a[0] + t * r0, a[1] + t * r1];
  }
  // Where a tie meets the barrier: the first meeting along the tie (hit), or, where they never
  // meet, a point 40% along the tie (hit false: check() reports it).
  function crossing(line, other) {
    var i, j, p;
    for (i = 0; i < line.length - 1; i++) for (j = 0; j < other.length - 1; j++) {
      p = segHit(line[i], line[i + 1], other[j], other[j + 1]);
      if (p) return { i: i, p: p, hit: true };
    }
    i = Math.floor(line.length * 0.4);
    return { i: i, p: line[i + 1], hit: false };
  }
  function meetings(line, other) {           // how many times two lines meet
    var n = 0, i, j;
    for (i = 0; i < line.length - 1; i++) for (j = 0; j < other.length - 1; j++) if (segHit(line[i], line[i + 1], other[j], other[j + 1])) n++;
    return n;
  }
  function trimStart(line, r) {              // drop the part of the line within r of its first point
    var c = line[0], i = 1, k, lo = 0, hi = 1, m, a, b;
    while (i < line.length && dist(line[i], c) < r) i++;
    if (i >= line.length) return line.slice(line.length - 2);
    a = line[i - 1]; b = line[i];
    for (k = 0; k < 7; k++) {
      m = (lo + hi) / 2;
      if (dist([a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m], c) < r) lo = m; else hi = m;
    }
    return [[a[0] + (b[0] - a[0]) * hi, a[1] + (b[1] - a[1]) * hi]].concat(line.slice(i));
  }
  function trimEnd(line, r) { return trimStart(line.slice().reverse(), r).reverse(); }
  function offsetLine(line, d) {             // shift to the right of the direction of travel
    var out = [], i, a, b, dx, dy, len;
    for (i = 0; i < line.length; i++) {
      a = line[Math.max(0, i - 1)]; b = line[Math.min(line.length - 1, i + 1)];
      dx = b[0] - a[0]; dy = b[1] - a[1]; len = Math.sqrt(dx * dx + dy * dy) || 1;
      out.push([line[i][0] - dy / len * d, line[i][1] + dx / len * d]);
    }
    return out;
  }
  function pathD(line) {
    var s = 'M' + f(line[0][0]) + ' ' + f(line[0][1]), i;
    for (i = 1; i < line.length; i++) s += 'L' + f(line[i][0]) + ' ' + f(line[i][1]);
    return s;
  }

  // The geometry of one sheet definition at one size, made once.
  var geoCache = [];                         // [{ sheet, byKind: { kind: g } }]
  function geo(sheet, kind) {
    var c = null, i;
    for (i = 0; i < geoCache.length; i++) if (geoCache[i].sheet === sheet) c = geoCache[i];
    if (!c) { c = { sheet: sheet, byKind: {} }; geoCache.push(c); }
    if (c.byKind[kind]) return c.byKind[kind];
    var L = LAYOUT[kind], g = { L: L, pos: [], ties: {}, crossings: {} };
    function scaled(list) { return list.map(function (p) { return [p[0] * L.W, p[1] * L.H]; }); }
    g.pos = scaled(POS);
    g.barrier = sheet.barrier ? catmull(scaled(sheet.barrier.points), sheet.barrier.smooth) : [];
    g.farLine = catmull(scaled(sheet.farLine.points), sheet.farLine.smooth);
    for (i = 0; i < TIES.length; i++) {
      g.ties[TIES[i].key] = quadLine(g.pos[TIES[i].a], g.pos[TIES[i].b], BEND[TIES[i].key] || 0, 40);
    }
    for (i = 0; i < ORDER.length; i++) {
      g.crossings[ORDER[i]] = crossing(g.ties['0-' + ORDER[i]], g.barrier);
      g.crossings[ORDER[i]].dir = dirAt(g.ties['0-' + ORDER[i]], g.crossings[ORDER[i]].i);   // the tie's way at the crossing
    }
    c.byKind[kind] = g;
    return g;
  }
  function dirAt(line, i) {                  // the unit direction of a line at its segment i
    var a = line[Math.max(0, Math.min(line.length - 2, i))], b = line[Math.max(1, Math.min(line.length - 1, i + 1))];
    var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
    return [dx / l, dy / l];
  }
  function tieLine(g, from, to) {            // the tie's path, walked from one house to the other
    var line = g.ties[from < to ? from + '-' + to : to + '-' + from];
    return from < to ? line : line.slice().reverse();
  }

  // ---- draw kinds: how a place's decoration is drawn (its sheet definition names them) -------

  // A line walked with a wave laid along it: each point moved square to the line by
  // amp x sin(2 pi x (distance along the line) / len + phase).
  function resample(line, step) {            // the same line with a point every `step` along it
    var out = [line[0]], i, d, k, n;
    for (i = 1; i < line.length; i++) {
      d = dist(line[i - 1], line[i]); n = Math.max(1, Math.ceil(d / step));
      for (k = 1; k <= n; k++) out.push([line[i - 1][0] + (line[i][0] - line[i - 1][0]) * k / n, line[i - 1][1] + (line[i][1] - line[i - 1][1]) * k / n]);
    }
    return out;
  }
  function waved(line, amp, len, phase) {
    line = resample(line, len / 10);
    var out = [], i, s = 0, a, b, dx, dy, l;
    for (i = 0; i < line.length; i++) {
      if (i > 0) s += dist(line[i - 1], line[i]);
      a = line[Math.max(0, i - 1)]; b = line[Math.min(line.length - 1, i + 1)];
      dx = b[0] - a[0]; dy = b[1] - a[1]; l = Math.sqrt(dx * dx + dy * dy) || 1;
      var k = amp * Math.sin(2 * Math.PI * s / len + phase);
      out.push([line[i][0] - dy / l * k, line[i][1] + dx / l * k]);
    }
    return out;
  }
  var BARRIERS = {
    stream: function (line, L) {             // a river: its bank, and the water inside it
      return '<path class="m-river-bank" stroke-width="' + L.river + '" d="' + pathD(line) + '"/>' +
             '<path class="m-river-water" stroke-width="' + L.water + '" d="' + pathD(line) + '"/>';
    },
    race: function (line, L) {               // a tide race: a band of water with two broken waves across it
      var amp = L.water * 0.32, len = L.water * 3.2;
      return '<path class="m-river-water" stroke-width="' + L.river + '" d="' + pathD(line) + '"/>' +
             '<path class="m-race" d="' + pathD(waved(offsetLine(line, L.water * 0.42), amp, len, 0)) + '"/>' +
             '<path class="m-race is-far" d="' + pathD(waved(offsetLine(line, -L.water * 0.42), amp, len, Math.PI)) + '"/>';
    },
    border: function (line, L) {             // a border: a pale band, and the boundary's dash and dot along it
      return '<path class="m-border-wash" stroke-width="' + L.river + '" d="' + pathD(line) + '"/>' +
             '<path class="m-border" d="' + pathD(line) + '"/>';
    },
    lane: function (line, L) {               // a market lane: its paving, and an edge on either side
      var w = L.river + 3;
      return '<path class="m-lane" stroke-width="' + w + '" d="' + pathD(line) + '"/>' +
             '<path class="m-lane-edge" d="' + pathD(offsetLine(line, w / 2)) + '"/>' +
             '<path class="m-lane-edge" d="' + pathD(offsetLine(line, -w / 2)) + '"/>';
    }
  };
  var FAR_LINES = {
    scarp: function (line, L) {              // a ridge, with hachures on its near side
      var s = '<path class="m-ridge" d="' + pathD(line) + '"/>', i;
      for (i = 1; i < line.length - 1; i += 2) {
        var ra = line[i - 1], rb = line[i + 1], rdx = rb[0] - ra[0], rdy = rb[1] - ra[1], rl = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
        var hl = (i % 4 === 1 ? 5 : 3.2) * (L.W / 600 * 0.5 + 0.5);
        s += '<path class="m-hachure" d="M' + f(line[i][0]) + ' ' + f(line[i][1] + 1) + 'l' + f(-rdy / rl * hl) + ' ' + f(rdx / rl * hl) + '"/>';
      }
      return s;
    },
    shore: function (line, L) {              // a headland's shore, stippled on its far side (the land)
      var s = '<path class="m-shore" d="' + pathD(line) + '"/>', i, d = '', r = L.W / 600 * 0.35 + 0.55;
      for (i = 1; i < line.length - 1; i += 2) {
        var ra = line[i - 1], rb = line[i + 1], rdx = rb[0] - ra[0], rdy = rb[1] - ra[1], rl = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
        var off = (i % 4 === 1 ? 3 : 5.5) * (L.W / 600 * 0.5 + 0.5), x = line[i][0] + rdy / rl * off, y = line[i][1] - rdx / rl * off;
        d += 'M' + f(x - r) + ' ' + f(y) + 'a' + f(r) + ' ' + f(r) + ' 0 1 0 ' + f(2 * r) + ' 0a' + f(r) + ' ' + f(r) + ' 0 1 0 ' + f(-2 * r) + ' 0';
      }
      return s + '<path class="m-stipple" d="' + d + '"/>';
    },
    downs: function (line, L) {              // rolling hills: the line, and a low rounded crest above it at every fourth point
      var s = '<path class="m-ridge" d="' + pathD(line) + '"/>', d = '', i, u = L.W / 600 * 0.5 + 0.5;
      for (i = 2; i < line.length - 2; i += 4) {
        var ra = line[i - 1], rb = line[i + 1], rdx = rb[0] - ra[0], rdy = rb[1] - ra[1], rl = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
        var nx = rdy / rl, ny = -rdx / rl, w = 5 * u, h = 3.2 * u, x = line[i][0] + nx * 2.5 * u, y = line[i][1] + ny * 2.5 * u;
        d += 'M' + f(x - rdx / rl * w) + ' ' + f(y - rdy / rl * w) + 'Q' + f(x + nx * h * 2) + ' ' + f(y + ny * h * 2) + ' ' + f(x + rdx / rl * w) + ' ' + f(y + rdy / rl * w);
      }
      return s + '<path class="m-crest" d="' + d + '"/>';
    },
    arcade: function (line, L) {             // the edge of a square: a line with arches hung on its near side
      var s = '<path class="m-ridge" d="' + pathD(line) + '"/>', d = '', i, r = L.W / 600 * 2.2 + 1.6;
      for (i = 1; i < line.length - 1; i += 2) {
        var ra = line[i - 1], rb = line[i + 1], rdx = rb[0] - ra[0], rdy = rb[1] - ra[1], rl = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
        var ux = rdx / rl, uy = rdy / rl, x = line[i][0], y = line[i][1];
        d += 'M' + f(x - ux * r) + ' ' + f(y - uy * r) + 'A' + f(r) + ' ' + f(r) + ' 0 0 0 ' + f(x + ux * r) + ' ' + f(y + uy * r);
      }
      return s + '<path class="m-arch" d="' + d + '"/>';
    }
  };
  var CROSSINGS = {
    ring: function (p, L) {                  // a ford: a ring where the tie meets the water
      return '<circle class="m-ford" cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + L.cross + '"/>';
    },
    // the bank on the tie, drawn as its gauge where the tie meets the barrier (see gaugeSVG);
    // v: { level, top } or null (an empty gauge), id: the id its fill carries, if any
    gauge: function (p, L, v, id) { return gaugeSVG(p[0], p[1], L.cross + 1, v, id); },
    post: function (p, L) {                  // a border post: a small square stone where the road crosses the border
      var h = L.cross * 0.82;
      return '<rect class="m-post" x="' + f(p[0] - h) + '" y="' + f(p[1] - h) + '" width="' + f(2 * h) + '" height="' + f(2 * h) + '"/>';
    },
    // a bridge: its deck laid along the tie (dir: the tie's way at the crossing), a parapet on either side,
    // wide enough that both lanes of hands (L.lane either side of the tie, a stroke of about 2.6) run on
    // the deck between the parapets
    bridge: function (p, L, v, id, dir) {
      var d = dir || [1, 0], ux = d[0], uy = d[1], nx = -uy, ny = ux, a = L.cross * 1.45, b = L.lane + 2.4;
      function pt(s, t) { return f(p[0] + ux * s + nx * t) + ' ' + f(p[1] + uy * s + ny * t); }
      return '<path class="m-bridge" d="M' + pt(-a, -b) + 'L' + pt(a, -b) + 'L' + pt(a, b) + 'L' + pt(-a, b) + 'Z"/>' +
             '<path class="m-parapet" d="M' + pt(-a, -b) + 'L' + pt(a, -b) + 'M' + pt(-a, b) + 'L' + pt(a, b) + '"/>';
    },
    cross: function (p, L) {                 // a market cross: a ring with its cross inside
      var r = L.cross, k = r * 0.55;
      return '<circle class="m-mcross" cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(r) + '"/>' +
             '<path class="m-mcross-bar" d="M' + f(p[0] - k) + ' ' + f(p[1]) + 'H' + f(p[0] + k) + 'M' + f(p[0]) + ' ' + f(p[1] - k) + 'V' + f(p[1] + k) + '"/>';
    }
  };
  var BODIES = {
    field: function (x, y, L) {              // three furrows and the house in the parcel's corner
      var s = '', k;
      for (k = 1; k <= 3; k++) {
        s += '<path class="m-furrow" d="M' + f(x + 2) + ' ' + f(y + L.ph * k / 4) + 'H' + f(x + L.pw - 2) + '"/>';
      }
      var hx = x + 3, hy = y + 3;
      s += '<rect class="m-house" x="' + f(hx) + '" y="' + f(hy) + '" width="' + L.hb + '" height="' + L.hb + '"/>';
      return s;
    },
    boat: function (x, y, L) {               // a boat at its mooring: the water, the hull, mast and sail, the house's mark in the corner
      var w = L.pw, h = L.ph, s = '', k, wy = y + h * 0.88, wx;
      s += '<path class="m-wave" d="M' + f(x + 2) + ' ' + f(wy);
      for (k = 0, wx = x + 2; wx < x + w - 2.5; k++, wx += 4) s += 'q1 ' + (k % 2 ? 1.2 : -1.2) + ' 2 0t2 0';
      s += '"/>';
      s += '<path class="m-hull" d="M' + f(x + w * 0.33) + ' ' + f(y + h * 0.58) + 'H' + f(x + w * 0.95) + 'L' + f(x + w * 0.86) + ' ' + f(y + h * 0.77) +
           'H' + f(x + w * 0.42) + 'Z"/>';
      s += '<path class="m-mast" d="M' + f(x + w * 0.62) + ' ' + f(y + h * 0.58) + 'V' + f(y + h * 0.13) + '"/>';
      s += '<path class="m-sail" d="M' + f(x + w * 0.65) + ' ' + f(y + h * 0.17) + 'V' + f(y + h * 0.5) + 'H' + f(x + w * 0.86) + 'Z"/>';
      s += '<rect class="m-house" x="' + f(x + 3) + '" y="' + f(y + 3) + '" width="' + L.hb + '" height="' + L.hb + '"/>';
      return s;
    },
    tower: function (x, y, L) {              // a watchtower on its ground: the tower, its battlements, the house's mark in the corner
      var w = L.pw, h = L.ph, s = '', l = x + w * 0.5, r = x + w * 0.74, t = y + h * 0.3, g = y + h * 0.9, m = (r - l) / 5;
      s += '<path class="m-ground" d="M' + f(x + w * 0.36) + ' ' + f(g) + 'H' + f(x + w - 2) + '"/>';
      s += '<path class="m-tower" d="M' + f(l) + ' ' + f(g) + 'V' + f(t) + 'h' + f(m) + 'v' + f(-h * 0.1) + 'h' + f(m) + 'v' + f(h * 0.1) + 'h' + f(m) +
           'v' + f(-h * 0.1) + 'h' + f(m) + 'v' + f(h * 0.1) + 'h' + f(m) + 'V' + f(g) + 'Z"/>';
      s += '<path class="m-slit" d="M' + f((l + r) / 2) + ' ' + f(t + h * 0.16) + 'V' + f(t + h * 0.32) + '"/>';
      s += '<rect class="m-house" x="' + f(x + 3) + '" y="' + f(y + 3) + '" width="' + L.hb + '" height="' + L.hb + '"/>';
      return s;
    },
    cart: function (x, y, L) {               // a carter's cart in the yard: its bed, two wheels, the shafts, the house's mark in the corner
      var w = L.pw, h = L.ph, s = '', g = y + h * 0.9, wr = h * 0.13, by = y + h * 0.42, bh = h * 0.2;
      s += '<path class="m-ground" d="M' + f(x + w * 0.36) + ' ' + f(g) + 'H' + f(x + w - 2) + '"/>';
      s += '<path class="m-shaft" d="M' + f(x + w * 0.42) + ' ' + f(by + bh * 0.6) + 'L' + f(x + w * 0.33) + ' ' + f(by + bh * 1.6) + '"/>';
      s += '<rect class="m-cart" x="' + f(x + w * 0.42) + '" y="' + f(by) + '" width="' + f(w * 0.48) + '" height="' + f(bh) + '"/>';
      s += '<circle class="m-wheel" cx="' + f(x + w * 0.54) + '" cy="' + f(g - wr) + '" r="' + f(wr) + '"/>';
      s += '<circle class="m-wheel" cx="' + f(x + w * 0.79) + '" cy="' + f(g - wr) + '" r="' + f(wr) + '"/>';
      s += '<rect class="m-house" x="' + f(x + 3) + '" y="' + f(y + 3) + '" width="' + L.hb + '" height="' + L.hb + '"/>';
      return s;
    },
    stall: function (x, y, L) {              // a salt stall: its striped awning on two poles, the counter and a heap of salt, the house's mark in the corner
      var w = L.pw, h = L.ph, s = '', l = x + w * 0.4, r = x + w * 0.92, at = y + h * 0.16, ab = y + h * 0.36, cy = y + h * 0.62, g = y + h * 0.9;
      s += '<path class="m-pole" d="M' + f(l + 1.5) + ' ' + f(ab) + 'V' + f(g) + 'M' + f(r - 1.5) + ' ' + f(ab) + 'V' + f(g) + '"/>';
      s += '<path class="m-awning" d="M' + f(l) + ' ' + f(ab) + 'L' + f(l + (r - l) * 0.12) + ' ' + f(at) + 'H' + f(r - (r - l) * 0.12) + 'L' + f(r) + ' ' + f(ab) + 'Z"/>';
      s += '<path class="m-stripe" d="M' + f(l + (r - l) * 0.37) + ' ' + f(at) + 'V' + f(ab) + 'M' + f(l + (r - l) * 0.63) + ' ' + f(at) + 'V' + f(ab) + '"/>';
      s += '<rect class="m-counter" x="' + f(l) + '" y="' + f(cy) + '" width="' + f(r - l) + '" height="' + f(g - cy) + '"/>';
      s += '<path class="m-salt" d="M' + f(l + (r - l) * 0.3) + ' ' + f(cy) + 'Q' + f(l + (r - l) * 0.5) + ' ' + f(cy - h * 0.2) + ' ' + f(l + (r - l) * 0.7) + ' ' + f(cy) + 'Z"/>';
      s += '<rect class="m-house" x="' + f(x + 3) + '" y="' + f(y + 3) + '" width="' + L.hb + '" height="' + L.hb + '"/>';
      return s;
    }
  };
  // ---- the gauge: a stock on a tie (a place with a stock: the Banks' bank between two boats) ---
  // A dial read by form, not by colour: a disc cut into `top` wedges by spokes, the wedges filled
  // from twelve o'clock, clockwise, as far as the level (one filled wedge for each unit). The
  // numbers are the Life's (level: today().neighbours[i].stock, results[i].stockAfter,
  // kinWith[i].stockAfter, runFuture().seasons[k].ties; top: params.STOCK.max).
  function gaugeD(cx, cy, r, v) {            // the filled part, as a path ('M x y' alone: nothing filled)
    var frac = v && v.top > 0 ? Math.max(0, Math.min(1, v.level / v.top)) : 0;
    if (frac <= 0) return 'M' + f(cx) + ' ' + f(cy);
    if (frac >= 1) return 'M' + f(cx) + ' ' + f(cy - r) + 'A' + f(r) + ' ' + f(r) + ' 0 1 1 ' + f(cx) + ' ' + f(cy + r) +
                          'A' + f(r) + ' ' + f(r) + ' 0 1 1 ' + f(cx) + ' ' + f(cy - r) + 'Z';
    var a = 2 * Math.PI * frac - Math.PI / 2;
    return 'M' + f(cx) + ' ' + f(cy) + 'L' + f(cx) + ' ' + f(cy - r) + 'A' + f(r) + ' ' + f(r) + ' 0 ' + (frac > 0.5 ? 1 : 0) + ' 1 ' +
           f(cx + r * Math.cos(a)) + ' ' + f(cy + r * Math.sin(a)) + 'Z';
  }
  function gaugeSVG(cx, cy, r, v, id) {
    var top = v && v.top > 0 ? v.top : 0, spokes = '', k, a;
    for (k = 0; k < top; k++) {
      a = 2 * Math.PI * k / top - Math.PI / 2;
      spokes += 'M' + f(cx) + ' ' + f(cy) + 'L' + f(cx + r * Math.cos(a)) + ' ' + f(cy + r * Math.sin(a));
    }
    return '<g class="m-gauge"><circle class="m-gauge-disc" cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '"/>' +
           '<path class="m-gauge-fill"' + (id ? ' id="' + id + '"' : '') + ' d="' + gaugeD(cx, cy, r, v) + '"/>' +
           (spokes ? '<path class="m-gauge-spoke" d="' + spokes + '"/>' : '') + '</g>';
  }
  // Where the gauge of a tie stands on a sheet: your four ties' where they meet the barrier (with
  // the crossing's mark), every other tie's at its middle, or where the sheet's definition puts it
  // (sheet.gauges: { tie: how far along it, from its lower-numbered house }), clear of lettering.
  function gaugeSpot(g, key, sheet) {
    var ends = key.split('-'), line = g.ties[key], at = sheet && sheet.gauges && sheet.gauges[key];
    if (ends[0] === '0' && g.crossings[ends[1]]) return { p: g.crossings[ends[1]].p, r: g.L.cross + 1 };
    return { p: line[Math.round((typeof at === 'number' ? at : 0.5) * (line.length - 1))], r: g.L.cross + 1 };
  }
  // The card's own gauge (a small drawing beside the bearing): v { level, top }.
  function cardGauge(v) {
    return '<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" focusable="false">' + gaugeSVG(11, 11, 9.6, v) + '</svg>';
  }

  function kindOf(list, name, what) {
    if (!Object.prototype.hasOwnProperty.call(list, name)) throw new Error('sheet: no ' + what + ' is drawn as "' + name + '"');
    return list[name];
  }

  // ---- drawing the map ----------------------------------------------------------------------

  function roundRect(x, y, w, h, r) {
    var a = 'A' + r + ' ' + r + ' 0 0 1 ';
    return 'M' + f(x + r) + ' ' + f(y) + 'H' + f(x + w - r) + a + f(x + w) + ' ' + f(y + r) + 'V' + f(y + h - r) +
           a + f(x + w - r) + ' ' + f(y + h) + 'H' + f(x + r) + a + f(x) + ' ' + f(y + h - r) + 'V' + f(y + r) +
           a + f(x + r) + ' ' + f(y) + 'Z';
  }
  function arrowSVG(pts, L) {                // a hand that arrived: a solid stroke with a head
    var n = pts.length, tip = pts[n - 1], back = pts[Math.max(0, n - 4)];
    var dx = tip[0] - back[0], dy = tip[1] - back[1], len = Math.sqrt(dx * dx + dy * dy) || 1, h = L.head;
    dx /= len; dy /= len;
    var bx = tip[0] - dx * h * 2, by = tip[1] - dy * h * 2;
    return '<path class="m-hand" d="' + pathD(trimEnd(pts, h * 1.6)) + '"/>' +
           '<path class="m-hand-head" d="M' + f(tip[0]) + ' ' + f(tip[1]) + 'L' + f(bx - dy * h) + ' ' + f(by + dx * h) +
           'L' + f(bx + dy * h) + ' ' + f(by - dx * h) + 'Z"/>';
  }
  function barSVG(p, q, half, cls) {         // a short bar through p, square to the direction p -> q
    var dx = q[0] - p[0], dy = q[1] - p[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= len; dy /= len;
    return '<path class="' + cls + '" d="M' + f(p[0] - dy * half) + ' ' + f(p[1] + dx * half) + 'L' + f(p[0] + dy * half) + ' ' + f(p[1] - dx * half) + '"/>';
  }
  function crossSVG(p, q, half, cls) {       // a cross at p, its arms at 45 degrees to the direction p -> q
    var dx = q[0] - p[0], dy = q[1] - p[1], len = Math.sqrt(dx * dx + dy * dy) || 1, k = half * 0.7071;
    dx /= len; dy /= len;
    var ax = (dx - dy) * k, ay = (dy + dx) * k, bx = (dx + dy) * k, by = (dy - dx) * k;
    return '<path class="' + cls + '" d="M' + f(p[0] - ax) + ' ' + f(p[1] - ay) + 'L' + f(p[0] + ax) + ' ' + f(p[1] + ay) +
           'M' + f(p[0] - bx) + ' ' + f(p[1] - by) + 'L' + f(p[0] + bx) + ' ' + f(p[1] + by) + '"/>';
  }
  function labelAt(g, L, id, withSub) {      // where a holding's name is lettered (L: the sheet with the lettering in use)
    var c = g.pos[id], gap = L.pw / 2 + L.bound + 4;
    if (id === 2 || id === 6) {
      var x = id === 2 ? c[0] + gap : c[0] - gap, y = withSub ? c[1] - 2 : c[1] + L.name * 0.35;
      return { x: x, y: y, subY: c[1] + L.sub + 1, anchor: id === 2 ? 'start' : 'end' };
    }
    if (isFar(id)) {
      var top = c[1] - L.ph / 2 - L.bound - 4;
      return { x: c[0], y: withSub ? top - L.sub - 1 : top, subY: top, anchor: 'middle' };
    }
    var base = c[1] + L.ph / 2 + L.bound + L.name + 1;
    // the east and west holdings stand just above the barrier: a second line under the name would
    // be lettered across it, so it goes above the holding instead
    return { x: c[0], y: base, subY: c[1] - L.ph / 2 - L.bound - 5, anchor: 'middle' };
  }
  // fit: where given, the text is set to exactly that length (see nameRoom)
  function textSVG(cls, x, y, size, anchor, text, id, fit) {
    return '<text class="' + cls + '"' + (id ? ' id="' + id + '"' : '') + ' x="' + f(x) + '" y="' + f(y) + '" font-size="' + size + '"' +
           (fit ? ' textLength="' + f(fit) + '" lengthAdjust="spacingAndGlyphs"' : '') +
           (anchor && anchor !== 'middle' ? ' style="text-anchor:' + anchor + '"' : '') + '>' + esc(text) + '</text>';
  }
  // A name lettered beside its holding (the north-east and north-west ones) runs toward the edge
  // of the sheet. Where the lettering is enlarged for a narrow phone, a long name could cross
  // the frame there: it is then set to the room there is. Returns that room, or 0 where the
  // name fits as it is (by a generous estimate of spaced capitals: at the sizes a sheet was laid
  // out for, every name fits).
  function nameRoom(L, lab, text) {
    if (lab.anchor === 'middle') return 0;
    var room = lab.anchor === 'start' ? L.W - L.pad - 4 - lab.x : lab.x - L.pad - 4;
    return String(text).length * L.name * 0.92 > room ? Math.max(room, 10) : 0;
  }

  // One holding: the place's body in its box. o: { unseen, plain, yours, segs, slot, click, hot, after }
  function holdSVG(sheet, g, id, o) {
    var L = g.L, c = g.pos[id], x = c[0] - L.pw / 2, y = c[1] - L.ph / 2, s, k;
    var cls = 'm-hold' + (o.yours ? ' is-yours' : '') + (o.click ? ' is-click' : '') + (o.hot ? ' is-hot' : '');
    s = '<g class="' + cls + '" data-map-house="' + id + '"' + (o.after ? ' id="af-hold-' + id + '"' : '') + '>';
    if (o.unseen) {
      return s + '<rect class="m-parcel is-unseen" x="' + f(x) + '" y="' + f(y) + '" width="' + L.pw + '" height="' + L.ph + '"/></g>';
    }
    var bd = roundRect(x - L.bound, y - L.bound, L.pw + 2 * L.bound, L.ph + 2 * L.bound, 4);
    if (o.slot) s += '<path class="m-bound-slot" d="' + bd + '"/>';
    if (o.segs) {
      for (k = 0; k < 5; k++) {
        if (o.segs[k]) s += '<path class="m-bound" pathLength="100" stroke-dasharray="15 85" stroke-dashoffset="' + (-(k * 20 + 2.5)) + '" d="' + bd + '"/>';
      }
    }
    if (o.after) s += '<path class="m-bound m-bound-full" d="' + bd + '"/>';
    s += '<rect class="m-parcel' + (o.plain || o.after ? ' is-plain' : '') + '" x="' + f(x) + '" y="' + f(y) + '" width="' + L.pw + '" height="' + L.ph + '"/>';
    if (o.after) {
      s += '<rect class="m-fill" id="af-fill-' + id + '" x="' + f(x + 0.6) + '" y="' + f(y + 0.6) + '" width="' + f(L.pw - 1.2) + '" height="' + f(L.ph - 1.2) + '" style="transform:scaleY(0)"/>';
    }
    s += kindOf(BODIES, sheet.body, 'body')(x, y, L);
    var hx = x + 3, hy = y + 3, hc = L.hb / 2, hr = L.hb * 0.72;
    s += '<path class="m-diamond" d="M' + f(hx + hc) + ' ' + f(hy + hc - hr) + 'L' + f(hx + hc + hr) + ' ' + f(hy + hc) + 'L' + f(hx + hc) + ' ' + f(hy + hc + hr) + 'L' + f(hx + hc - hr) + ' ' + f(hy + hc) + 'Z"/>';
    if (o.after) s += '<path class="m-tent" d="M' + f(hx + hc) + ' ' + f(hy - 1) + 'L' + f(hx + L.hb + 1.5) + ' ' + f(hy + L.hb) + 'L' + f(hx - 1.5) + ' ' + f(hy + L.hb) + 'Z"/>';
    if (o.click) {
      s += '<rect class="m-hit" x="' + f(x - L.bound - 8) + '" y="' + f(y - L.bound - 8) + '" width="' + f(L.pw + 2 * L.bound + 16) + '" height="' + f(L.ph + 2 * L.bound + L.name + 20) + '"/>';
    }
    return s + '</g>';
  }

  /*
   * sheet: a place's sheet definition; kind: 'wide' | 'compact'
   * mode 'sheet'   the opening: the place, unnamed, with one hand to show the stakes
   *                o: { demo: [mine, theirs] } what that hand is worth at each end, from the Life's
   *                rules (AYWords.stakes(life.params): mine at your end, theirs at the end it reaches)
   *      'day'     o: { names, kin, follow, keeps, hands, kinWith, hot, click, crop, alt }
   *                crop: the sheet is cut just above the far line (a phone's day map: the three
   *                holdings you cannot see are left off, so that the first card is on the first
   *                screen); alt: what the map shows today, in words
   *      'leaving' o: { names, kin, follow, keeps }
   *      'after'   o: { kin }; all eight holdings and sixteen ties, filled season by season (app.js drawSeason30)
   * In every mode o.up enlarges the lettering (see letterUp); the geometry stays the sheet's.
   */
  function map(sheet, kind, mode, o) {
    o = o || {};
    var g = geo(sheet, kind), L = lettered(g.L, o.up), labels = W.mapLabels(), s = [], i, id, t, cls, lab, c;
    var after = mode === 'after', clip = 'clip-' + mode;
    var r = L.pw / 2 + L.bound + 3;
    var top = o.crop && mode === 'day' ? L.crop : 0, fy = top + L.pad, fh = L.H - top - 2 * L.pad;     // the frame's top edge and height
    s.push('<svg viewBox="0 ' + top + ' ' + L.W + ' ' + (L.H - top) + '" role="img" aria-label="' + esc(o.alt || W.mapAlt(mode === 'leaving' ? 'day' : mode)) + '" focusable="false">');
    s.push('<defs><clipPath id="' + clip + '"><rect x="' + L.pad + '" y="' + fy + '" width="' + (L.W - 2 * L.pad) + '" height="' + fh + '"/></clipPath></defs>');
    s.push('<rect class="m-frame" x="' + L.pad + '" y="' + fy + '" width="' + (L.W - 2 * L.pad) + '" height="' + fh + '"/>');
    s.push('<rect class="m-frame-outer" x="' + (L.pad - 3.5) + '" y="' + (fy - 3.5) + '" width="' + (L.W - 2 * L.pad + 7) + '" height="' + (fh + 7) + '"/>');
    s.push('<g clip-path="url(#' + clip + ')">');
    for (t = L.pad + L.grid; t < L.W - L.pad - 2; t += L.grid) s.push('<path class="m-gridline" d="M' + f(t) + ' ' + fy + 'V' + (L.H - L.pad) + '"/>');
    for (t = L.pad + L.grid; t < L.H - L.pad - 2; t += L.grid) s.push('<path class="m-gridline" d="M' + L.pad + ' ' + f(t) + 'H' + (L.W - L.pad) + '"/>');
    // the far line, then the barrier
    s.push(kindOf(FAR_LINES, sheet.farLine.draw, 'far line')(g.farLine, L));
    if (sheet.barrier) s.push(kindOf(BARRIERS, sheet.barrier.draw, 'barrier')(g.barrier, L));
    // ties
    for (i = 0; i < TIES.length; i++) {
      t = TIES[i];
      var farEnds = (isFar(t.a) ? 1 : 0) + (isFar(t.b) ? 1 : 0);
      if (!after && farEnds === 2) continue;                       // ties you never saw
      cls = 'm-tie';
      if (!after && t.a === 0) cls += ' is-mine' + (o.hot === t.b ? ' is-hot' : '');
      if (!after && farEnds === 1) cls += ' is-far';
      s.push('<path class="' + cls + '" data-tie="' + t.key + '" d="' + pathD(g.ties[t.key]) + '"/>');
    }
    s.push('</g>');
    // the crossing: where each of your ties meets the barrier (a gauge: the level on each of your
    // ties, o.gauge.levels by house; in the Afterwards each carries an id that app.js fills). A mark
    // is drawn here, under the holdings and the hands; a gauge is read, so it is drawn over the hands.
    var drawCross = kindOf(CROSSINGS, sheet.crossing, 'crossing'), gv = o.gauge || null, marks = [];
    function levelOf(lv) { return gv ? { level: typeof lv === 'number' ? lv : 0, top: gv.top } : null; }
    for (i = 0; i < ORDER.length; i++) {
      id = ORDER[i];
      marks.push(drawCross(g.crossings[id].p, L, levelOf(gv && gv.levels ? gv.levels[id] : null), after ? 'af-gauge-0-' + id : null, g.crossings[id].dir));
    }
    if (sheet.crossing === 'gauge') {
      var spot;
      // the Afterwards: the gauge of every other tie, at its middle, filled season by season
      for (i = 0; after && i < TIES.length; i++) {
        if (TIES[i].a === 0) continue;
        spot = gaugeSpot(g, TIES[i].key, sheet);
        marks.push(gaugeSVG(spot.p[0], spot.p[1], spot.r, levelOf(null), 'af-gauge-' + TIES[i].key));
      }
      // the day closed: the banks of the sister's dealings with your other neighbours, as they now stand
      for (i = 0; mode === 'day' && o.kinWith && i < o.kinWith.length; i++) {
        if (typeof o.kinWith[i].stockAfter !== 'number') continue;
        spot = gaugeSpot(g, Math.min(o.kin, o.kinWith[i].id) + '-' + Math.max(o.kin, o.kinWith[i].id), sheet);
        marks.push(gaugeSVG(spot.p[0], spot.p[1], spot.r, levelOf(o.kinWith[i].stockAfter)));
      }
    } else { s.push(marks.join('')); marks = []; }
    // holdings
    for (id = 0; id < 8; id++) {
      if (after) s.push(holdSVG(sheet, g, id, { after: true }));
      else if (isFar(id)) { if (!top) s.push(holdSVG(sheet, g, id, { unseen: true })); }
      else if (id === 0) s.push(holdSVG(sheet, g, id, { yours: true, segs: [true, true, true, true, true] }));
      else if (mode === 'sheet') s.push(holdSVG(sheet, g, id, {}));
      else s.push(holdSVG(sheet, g, id, { yours: !!(o.keeps && o.keeps[id]), segs: o.follow ? o.follow[id] : null, slot: id === o.kin, click: !!o.click, hot: o.hot === id }));
    }
    // hands
    if (mode === 'sheet') {
      s.push(arrowSVG(offsetLine(trimEnd(trimStart(tieLine(g, 0, 1), r), r), L.lane), L));
    }
    if (mode === 'day' && o.hands) {
      for (i = 0; i < ORDER.length; i++) {
        id = ORDER[i];
        var h = o.hands[id], out = tieLine(g, 0, id), cross = g.crossings[id];
        if (!h) continue;
        var toCross = out.slice(0, cross.i + 1).concat([cross.p]);
        var gate = trimStart(out, r + 3);
        if (h.revealed) {
          if (h.arrived) s.push(arrowSVG(offsetLine(trimEnd(trimStart(out, r), r), L.lane), L));
          else if (h.lost) {
            var broken = offsetLine(trimEnd(trimStart(toCross, r), L.cross + 1.5), L.lane);
            // a hand like any other (the lane, its green), but broken, with no head, and crossed out at the crossing
            s.push('<path class="m-lost" d="' + pathD(broken) + '"/>');
            s.push(crossSVG(broken[broken.length - 1], broken[broken.length - 2], L.lane + 1.2, 'm-lost-x'));
          } else s.push(barSVG(gate[0], gate[1], L.lane + 2.5, 'm-stay'));
          if (h.they) s.push(arrowSVG(offsetLine(trimEnd(trimStart(tieLine(g, id, 0), r), r), L.lane), L));
        } else if (h.plan === true) {
          var stub = offsetLine(trimEnd(trimStart(toCross, r), L.cross + 7), L.lane), tip = stub[stub.length - 1];
          s.push('<path class="m-plan" d="' + pathD(stub) + '"/>');
          s.push('<circle class="m-plan-tip" cx="' + f(tip[0]) + '" cy="' + f(tip[1]) + '" r="' + f(L.lane * 0.85) + '"/>');
        } else if (h.plan === false) s.push(barSVG(gate[0], gate[1], L.lane + 2.5, 'm-stay'));
      }
      if (o.kinWith) {
        for (i = 0; i < o.kinWith.length; i++) {
          var kw = o.kinWith[i];
          if (kw.kinSent) s.push(arrowSVG(offsetLine(trimEnd(trimStart(tieLine(g, o.kin, kw.id), r), r), L.lane), L));
          if (kw.theySent) s.push(arrowSVG(offsetLine(trimEnd(trimStart(tieLine(g, kw.id, o.kin), r), r), L.lane), L));
        }
      }
    }
    s.push(marks.join(''));                          // the gauges, over the hands (nothing where the crossing is a mark)
    // lettering, last so that it stays legible: the place's notes, then the names
    var notes = sheet.notes || [], n, nx, ny;
    for (i = 0; i < notes.length; i++) {
      n = notes[i];
      if (n.unseenOnly && (after || top)) continue;               // only where the far three stand unseen
      if (n.at === 'house') { c = g.pos[n.house]; nx = c[0]; ny = c[1] - L.ph / 2 + n.dy; }
      else if (n.at === 'farLine') { nx = L.W * n.x; ny = g.farLine[Math.floor(g.farLine.length / 2)][1] + n.dy; }
      else if (n.at === 'sheet') { nx = L.W * n.x; ny = L.H * n.y; }
      else throw new Error('sheet: a note is lettered at "' + n.at + '"');
      if (typeof labels[n.label] !== 'string') throw new Error('sheet: no map label "' + n.label + '"');
      s.push(textSVG('m-note' + (n.water ? ' is-water' : ''), nx, ny, L.note, 'middle', labels[n.label]));
    }
    for (id = 0; id < 8; id++) {
      if (after) {
        lab = labelAt(g, L, id, id === o.kin);       // the sister's holding keeps room for its second line
        s.push(textSVG('m-name', lab.x, lab.y, L.name, lab.anchor, '', 'af-name-' + id));
        s.push(textSVG('m-sub', lab.x, lab.subY, L.sub, lab.anchor, '', 'af-sub-' + id));
        c = g.pos[id];
        s.push(textSVG('m-num', c[0] + L.hb / 2 + 1.5, c[1] + L.num * 0.36, L.num, 'middle', '', 'af-num-' + id));
        continue;
      }
      if (isFar(id)) continue;
      if (id === 0) {
        lab = labelAt(g, L, 0, false);
        s.push(textSVG('m-name', lab.x, lab.y, L.name, lab.anchor, labels.yours.toUpperCase()));
        continue;
      }
      if (mode === 'sheet') continue;
      var isKin = id === o.kin;
      lab = labelAt(g, L, id, isKin);
      var lettering = String(o.names[id]).toUpperCase();
      s.push(textSVG('m-name', lab.x, lab.y, L.name, lab.anchor, lettering, null, nameRoom(L, lab, lettering)));
      if (isKin) s.push(textSVG('m-sub', lab.x, lab.subY, L.sub, lab.anchor, labels.sister));
    }
    if (mode === 'sheet') {                      // the stakes, on the sheet itself: the Life's, never typed in
      if (!o.demo || typeof o.demo[0] !== 'number' || typeof o.demo[1] !== 'number') throw new Error('sheet: the opening sheet needs the stakes of its hand (o.demo)');
      var demo = tieLine(g, 0, 1);
      var p1 = offsetLine(demo, L.lane + L.num)[Math.floor(demo.length * 0.27)];        // below the path, at your end
      var p2 = offsetLine(demo, -(L.lane + L.num * 0.9))[Math.floor(demo.length * 0.82)];   // above it, at theirs
      s.push(textSVG('m-num', p1[0], p1[1] + L.num * 0.36, L.num, 'middle', W.signed(o.demo[0])));
      s.push(textSVG('m-num', p2[0], p2[1] + L.num * 0.36, L.num, 'middle', W.signed(o.demo[1])));
    }
    // the north mark, in the foot of the sheet: the letters on the cards are bearings from your holding
    var nox = L.W - L.pad - 14, noy = L.H - L.pad - 7, u = L.sub;
    s.push('<path class="m-north" d="M' + f(nox) + ' ' + f(noy) + 'V' + f(noy - u * 1.15) + '"/>');
    s.push('<path class="m-north-head" d="M' + f(nox) + ' ' + f(noy - u * 1.6) + 'l' + f(-u * 0.28) + ' ' + f(u * 0.55) + 'h' + f(u * 0.56) + 'z"/>');
    s.push(textSVG('m-note is-north', nox, noy - u * 1.85, L.sub, 'middle', labels.north));
    s.push('</svg>');
    return s.join('');
  }

  // ---- drawn keys, the day's dealing in miniature, the seal ---------------------------------

  // o: for 'gauge', { level, top } (a bank as it begins, from the Life's rules)
  function keySVG(sheet, kind, o) {
    var w = 30, h = 14, b = '';
    if (kind === 'gauge') b = gaugeSVG(15, 7, 6.2, o || null);
    else if (kind === 'arrived') b = '<path class="key-line" d="M2 7H19"/><path class="key-head" d="M27 7l-7.5 -3.8v7.6z"/>';
    else if (kind === 'turned') b = '<path class="key-lost" d="M2 7H13.5"/><path class="key-ink" d="M15 4.5l5 5M20 4.5l-5 5"/>' + sheet.glyph.keyBarrier;
    else if (kind === 'planned') b = '<path class="key-ink" d="M2 7H16"/><circle class="key-open" cx="20.5" cy="7" r="3.3"/>';
    else if (kind === 'home') b = '<path class="key-tie" d="M2 7H28"/><path class="key-ink" d="M11 2.5v9"/>';
    else if (kind === 'follows') b = '<path class="key-yours" pathLength="100" stroke-dasharray="15 5" stroke-dashoffset="-2.5" d="' + roundRect(3, 2, 24, 10, 3) + '"/>';
    else if (kind === 'help') b = '<rect class="key-parcel" x="4" y="1.5" width="22" height="11"/><rect class="key-fill" x="4.6" y="6.5" width="20.8" height="5.4"/>';
    else if (kind === 'income') b = '<text class="key-text" x="15" y="11" font-size="11" text-anchor="middle">' + esc(W.num(21)) + '</text>';
    else if (kind === 'keeps') b = '<path class="key-yours" d="' + roundRect(3, 1.5, 24, 11, 3) + '"/><path class="key-diamond" d="M15 3.2l3.8 3.8l-3.8 3.8l-3.8 -3.8z"/>';
    else if (kind === 'newcomer') { b = '<path class="key-square" d="M15 2l5.5 10h-11z"/>'; }
    else {
      w = 14;
      if (kind === 'held') b = '<rect class="key-held" x="3" y="3" width="8" height="8"/>';
      else if (kind === 'fell') b = '<rect class="key-fell" x="3" y="3" width="8" height="8"/>';
      else if (kind === 'sent') b = '<circle class="key-sent" cx="7" cy="7" r="3.6"/>';
      else if (kind === 'stayed') b = '<circle class="key-stayed" cx="7" cy="7" r="3.6"/>';
      else if (kind === 'fresh') b = '<circle class="key-stayed" cx="7" cy="5.5" r="3.4"/><path class="key-ink" d="M2.8 12.6h8.4"/>';
      else if (kind === 'ghost') b = '<circle class="key-ghost" cx="7" cy="7" r="3.6"/>';
      else if (kind === 'diamond') b = '<path class="key-diamond" d="M7 2.2l4.8 4.8l-4.8 4.8l-4.8 -4.8z"/>';
    }
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true" focusable="false">' + b + '</svg>';
  }
  function exchangeGlyph(sheet, r) {             // the day's dealing in miniature: you, the barrier, them
    var b = sheet.glyph.barrier +
            '<path class="key-diamond" d="M8 7.5l4.5 4.5l-4.5 4.5l-4.5 -4.5z"/>' +
            '<rect class="key-square" x="46.5" y="8" width="8" height="8"/>';
    if (r.arrived) b += '<path class="key-line" d="M17 7H37"/><path class="key-head" d="M44 7l-7.5 -3.8v7.6z"/>';
    else if (r.lost) b += '<path class="key-lost" d="M16.5 7H22.5"/><path class="key-ink" d="M23.8 4.8l4.4 4.4M28.2 4.8l-4.4 4.4"/>';
    else b += '<path class="key-ink" d="M17.5 3.2v7.6"/>';
    if (r.they) b += '<path class="key-line" d="M42 17H22"/><path class="key-head" d="M15 17l7.5 -3.8v7.6z"/>';
    return '<svg width="58" height="24" viewBox="0 0 58 24" aria-hidden="true" focusable="false">' + b + '</svg>';
  }
  function sealSVG(sheet) {
    var s = '<svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true" focusable="false">', i, a;
    s += '<circle class="seal-ring" cx="38" cy="38" r="35"/><circle class="seal-ring-thin" cx="38" cy="38" r="28.5"/>';
    for (i = 0; i < 24; i++) {
      a = i / 24 * Math.PI * 2;
      s += '<path class="seal-tick" d="M' + f(38 + Math.cos(a) * 30) + ' ' + f(38 + Math.sin(a) * 30) + 'L' + f(38 + Math.cos(a) * 33.5) + ' ' + f(38 + Math.sin(a) * 33.5) + '"/>';
    }
    s += sheet.glyph.seal;
    s += '<path class="seal-check" d="M35 41l5 5l10 -12"/>';
    return s + '</svg>';
  }

  // ---- a sheet definition's own rules (checked by page-smoke.js for every place) -------------
  // On both sizes: the barrier meets each of your four ties exactly once; the far line lies
  // between the far three and the four neighbours all the way across (0.20 to 0.38 of the
  // sheet's height) and below the phone's crop, so that a cropped day map still draws it; every
  // draw kind is known. Returns the problems found (none: an empty list).
  function check(sheet) {
    var out = [], kinds = ['wide', 'compact'], k, i, g, L, n, y;
    if (sheet.barrier) kindOf(BARRIERS, sheet.barrier.draw, 'barrier');
    kindOf(FAR_LINES, sheet.farLine.draw, 'far line'); kindOf(CROSSINGS, sheet.crossing, 'crossing'); kindOf(BODIES, sheet.body, 'body');
    for (k = 0; k < kinds.length; k++) {
      g = geo(sheet, kinds[k]); L = g.L;
      for (i = 0; i < ORDER.length; i++) {
        n = meetings(g.ties['0-' + ORDER[i]], g.barrier);
        if (n !== 1 || !g.crossings[ORDER[i]].hit) out.push(kinds[k] + ': the barrier meets the tie 0-' + ORDER[i] + ' ' + n + ' times');
      }
      for (i = 0; i < g.farLine.length; i++) {
        y = g.farLine[i][1] / L.H;
        if (g.farLine[i][0] < L.pad || g.farLine[i][0] > L.W - L.pad) continue;     // outside the frame: clipped
        if (!(y > 0.20 && y < 0.38)) { out.push(kinds[k] + ': the far line leaves its band at x ' + f(g.farLine[i][0]) + ' (y ' + y.toFixed(3) + ')'); break; }
        if (!(g.farLine[i][1] > L.crop + L.pad)) { out.push(kinds[k] + ': the far line is cut off with the phone\'s crop at x ' + f(g.farLine[i][0])); break; }
      }
      // a gauge on every tie stands inside the frame, clear of every holding's box and its ring,
      // and of every other gauge
      if (sheet.crossing === 'gauge') {
        var spots = TIES.map(function (t) { return { key: t.key, s: gaugeSpot(g, t.key, sheet) }; }), j, h, c, gx, gy, gr;
        for (i = 0; i < spots.length; i++) {
          gx = spots[i].s.p[0]; gy = spots[i].s.p[1]; gr = spots[i].s.r;
          if (gx - gr < L.pad || gx + gr > L.W - L.pad || gy - gr < L.pad || gy + gr > L.H - L.pad) out.push(kinds[k] + ': the gauge of the tie ' + spots[i].key + ' leaves the frame');
          for (h = 0; h < 8; h++) {
            c = g.pos[h];
            var hx = Math.max(Math.abs(gx - c[0]) - (L.pw / 2 + L.bound), 0), hy = Math.max(Math.abs(gy - c[1]) - (L.ph / 2 + L.bound), 0);
            if (Math.sqrt(hx * hx + hy * hy) < gr + 1) out.push(kinds[k] + ': the gauge of the tie ' + spots[i].key + ' sits on holding ' + h);
          }
          for (j = i + 1; j < spots.length; j++) {
            if (dist(spots[i].s.p, spots[j].s.p) < gr + spots[j].s.r + 1) out.push(kinds[k] + ': the gauges of the ties ' + spots[i].key + ' and ' + spots[j].key + ' touch');
          }
        }
      }
    }
    return out;
  }

  // ---- the hands' lanes (for motion.js) -----------------------------------------------------
  // Where the day map draws each hand, worked out by the same expressions as map() (mode 'day', and
  // the Opening's one hand), as points and as the d of each drawn path, so that a mark on a drawn map
  // can be found by its d. map() itself does not use these: what it draws is unchanged. The geometry
  // is the sheet's own: the lettering (o.up) and a phone's crop never move a hand.
  //   lanes(sheet, kind) -> for each of your neighbours (1, 2, 6, 7):
  //     { out, outD, back, backD, broken, brokenD, stub, stubD, gate: { p, q, half }, gateD, cross, dir }
  //     out: your hand that arrived, walked to the tip of its head; outD: the d of its .m-hand
  //     back, backD: theirs, walked to your holding, and the d of its .m-hand
  //     broken, brokenD: your hand turned back, to the crossing (.m-lost)
  //     stub, stubD: your hand planned (.m-plan)
  //     gate: your Stay, a bar through p square to the way p -> q, half its length; gateD: its d (.m-stay)
  //     cross, dir: where the tie meets the barrier, and the tie's way there
  //   lane(sheet, kind, from, to) -> { out, outD }: a hand from one holding to another, as drawn
  //     (the sister's dealings: lane(sheet, kind, kin, id) and lane(sheet, kind, id, kin)); null where
  //     the two holdings have no tie
  function laneOf(g, from, to) {
    var L = g.L, r = L.pw / 2 + L.bound + 3, pts = offsetLine(trimEnd(trimStart(tieLine(g, from, to), r), r), L.lane);
    return { out: pts, outD: pathD(trimEnd(pts, L.head * 1.6)) };
  }
  function barD(p, q, half) {                // the d of barSVG's bar
    var dx = q[0] - p[0], dy = q[1] - p[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= len; dy /= len;
    return 'M' + f(p[0] - dy * half) + ' ' + f(p[1] + dx * half) + 'L' + f(p[0] + dy * half) + ' ' + f(p[1] - dx * half);
  }
  function lanes(sheet, kind) {
    var g = geo(sheet, kind), L = g.L, r = L.pw / 2 + L.bound + 3, res = {}, i, id, out, cross, toCross, gate, mine, theirs, broken, stub;
    for (i = 0; i < ORDER.length; i++) {
      id = ORDER[i]; out = tieLine(g, 0, id); cross = g.crossings[id];
      toCross = out.slice(0, cross.i + 1).concat([cross.p]);
      gate = trimStart(out, r + 3);
      mine = laneOf(g, 0, id); theirs = laneOf(g, id, 0);
      broken = offsetLine(trimEnd(trimStart(toCross, r), L.cross + 1.5), L.lane);
      stub = offsetLine(trimEnd(trimStart(toCross, r), L.cross + 7), L.lane);
      res[id] = {
        out: mine.out, outD: mine.outD, back: theirs.out, backD: theirs.outD,
        broken: broken, brokenD: pathD(broken), stub: stub, stubD: pathD(stub),
        gate: { p: gate[0].slice(), q: gate[1].slice(), half: L.lane + 2.5 }, gateD: barD(gate[0], gate[1], L.lane + 2.5),
        cross: cross.p.slice(), dir: cross.dir.slice()
      };
    }
    return res;
  }

  root.AYSheet = {
    LAYOUT: LAYOUT, ORDER: ORDER, TIES: TIES, f: f,
    letterUp: letterUp, lettered: lettered, geo: geo, labelAt: labelAt, nameRoom: nameRoom,
    map: map, key: keySVG, glyph: exchangeGlyph, seal: sealSVG, check: check,
    // a place with a stock: the card's gauge (v { level, top }), and the filled part of a tie's
    // gauge on a drawn sheet (the Afterwards sets it season by season by the id af-gauge-<tie>)
    gauge: cardGauge,
    gaugeD: function (sheet, kind, key, v) { var sp = gaugeSpot(geo(sheet, kind), key, sheet); return gaugeD(sp.p[0], sp.p[1], sp.r, v); },
    gaugeSpot: function (sheet, kind, key) { return gaugeSpot(geo(sheet, kind), key, sheet); },
    // the hands' lanes on the day map (see lanes)
    lanes: lanes,
    lane: function (sheet, kind, from, to) {
      var g = geo(sheet, kind);
      return g.ties[from < to ? from + '-' + to : to + '-' + from] ? laneOf(g, from, to) : null;
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
