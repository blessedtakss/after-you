/*
 * Part 15: the motion (motion.js, window.AYMotion) and the sound (sound.js, window.AYSound) held to their
 * contract: the payloads app.js hands them (the whitelist), the timings (TIMING and the reveal's slots), the
 * luck-or-choice rule (a missing act looks and sounds the same whatever its cause), the calendar, and a page
 * that is exactly the same with them as without them. Run on the working tree only, from the game folder:
 *   jsc -e "var CHECKS_DIR='<checks folder>'" <checks folder>/page/motion-sound.js            (about a minute)
 *   jsc -e "var CHECKS_DIR='<checks folder>'" <checks folder>/page/motion-sound.js -- strict  (a check that
 *       waits for modules that boot fails instead; run-all.sh runs it so unless AY_FX_STUB=1)
 * (From the repository root CHECKS_DIR may be left out.) Seven sections:
 *   1 loading     each module loads twice in the bare shell, in domshim and in dom-harness, touching no timer,
 *                 media query, listener or clock, adding only its own global; TIMING is the spec's (2.2) in both;
 *                 the sources pass the page's scans (theory words, ASCII, addresses, timers, clocks, ES5)
 *   2 disabled    in domshim and dom-harness the modules decline to boot; with them loaded (and declining) a
 *                 whole Life reads the clock exactly as often as without them, with the same page at every step
 *   3 stubbed     the browser's animation, timeline, audio, Audio, fetch, XHR and listeners stood in for; each
 *                 module in the game folder boots there; two Lives a place at 400x800 and 1280x800, each against
 *                 the same Life with no module: the payloads (6.3), the clock reads and timers, the page and maps
 *                 minus .fx at every step, the windows of 2.2 and 2.4, one AudioContext only after the Sound button,
 *                 no Audio, fetch or XHR with no track (and one relative Audio with a test track); reduced motion
 *                 (no animation, the reveal's sounds as ever); a quiet restore into a day, Leaving and the Afterwards;
 *                 turned in the middle of a Life: reduced motion turned on (all that runs stops, sound.js unmoved), the
 *                 first reveal's finish late with the page hidden (the loops kept) or in front (turned off), a second
 *                 Life's light (from the Afterwards' rest), a one-shot sounding as a reveal comes (released), a track
 *                 refused for want of a tap (held, played at the next click), a pending play() cut short by the page's
 *                 own pause() (not ended), the page hidden, shown and hidden again (one suspend, after the last fade),
 *                 the memory option switched on in a copy (a first press on the button leaves sound on)
 *   4 twins       this check alone sorts each missing act of a neighbour into luck or choice (the engine's own
 *                 draws, engine.js:980-987); two Lives whose reveal shows exactly the same, one with the act a
 *                 choice and one luck, must give byte-identical motion and sound logs
 *   5 calendar    the drawn light and weather (.fx) depend on the calendar only, never the seed; .fx-wx lies at
 *                 y <= 0.36 H and clear of the holdings; lightFor gives 2.5's table, the Border's the same daily
 *   6 geometry    AYSheet.lanes and lane give the d of every drawn hand, lost hand, Stay and plan; the card glyph of
 *                 a hand turned back ends as .key-lost rests
 *   7 planted     faults planted in copies (a payload carrying why, a module timer, an address, a twin
 *                 mismatch, a byte above 0x7F, "soft" in a module, a sound.js that mutes every cue under
 *                 reduced motion, an app.js whose restore is not quiet, and each fix of the review undone) must
 *                 each make its check fail
 * A module in the game folder that declines to boot where the browser is stood in for fails (section 3). The
 * checks that need a module booted WAIT while it does not boot (named in the log; with neither booting, a
 * stand-in listener still checks app.js's side), and with "strict" a WAIT fails. Prints a line per check, then "MOTION-SOUND: PASS" or
 * "MOTION-SOUND: FAIL" with an fnv1a32 of the log (its times left out).
 */
var CK = typeof CHECKS_DIR === 'string' ? CHECKS_DIR : 'checks', PAGE = CK + '/page/';
var ARGV = typeof arguments !== 'undefined' ? Array.prototype.slice.call(arguments).map(String) : [];
var STRICT = ARGV.indexOf('strict') >= 0;
var T_START = preciseTime();

// ---- the log ---------------------------------------------------------------------------------------------
var LOG = [], SECTION = null, RESULTS = [], NCHECKS = 0;
function fnv(s, h) {
  h = h === undefined ? 0x811c9dc5 >>> 0 : h;
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
}
function hex(h) { return ('00000000' + h.toString(16)).slice(-8); }
function say(s) { LOG.push(s); print(s); }
function note(s) { say('  ' + s); }
function begin(n, name) { SECTION = { n: n, name: name, fail: [], wait: [], pass: 0 }; RESULTS.push(SECTION); say(n + '. ' + name); }
function pass(what) { NCHECKS++; SECTION.pass++; say('  PASS  ' + what); }
function fail(what, why) { what += why ? ': ' + why : ''; NCHECKS++; SECTION.fail.push(what); say('  FAIL  ' + what); }
function wait(what) { SECTION.wait.push(what); say('  WAIT  ' + what); }
function check(cond, what, why) { if (cond) pass(what); else fail(what, why); return !!cond; }
function short(s, n) { s = String(s); n = n || 160; return s.length > n ? s.slice(0, n) + '...' : s; }
function stable(o) {                                 // JSON with sorted keys (a log line that does not depend on key order)
  if (o === undefined) return 'undefined';
  if (o === null || typeof o !== 'object') return typeof o === 'number' && !isFinite(o) ? String(o) : JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(stable).join(',') + ']';
  if (o.nodeType) return '<node>';
  return '{' + Object.keys(o).sort().map(function (k) { return JSON.stringify(k) + ':' + stable(o[k]); }).join(',') + '}';
}

// ---- the contract ----------------------------------------------------------------------------------------
var TIMING_SPEC = { LINE: 280, HEAD: 90, STAGGER: 30, IN_AT: 70, GATE: 180, X: 110, IMAGE_AT: 200, IMAGE: 450, KIN_AT: 220,
                    GAUGE_AT: 300, GAUGE: 260, BEAT_AT: 600, BEAT: 360, VIEW: 160, LIGHT: 1200 };
var ORDER = [1, 2, 6, 7], K_OF = { 7: 0, 6: 1, 2: 2, 1: 3 }, PAN_OF = { 7: -0.5, 6: -0.2, 2: 0.2, 1: 0.5 };
var MOD_FILES = { motion: 'motion.js', sound: 'sound.js' }, MOD_GLOBAL = { motion: 'AYMotion', sound: 'AYSound' };
var API = { motion: { fns: ['boot', 'cue'], test: ['revealPlan', 'planPlan', 'seasonPlan', 'afterPlan', 'lightFor', 'weatherFor'] },
            sound: { fns: ['boot', 'cue', 'tracks'], test: ['score', 'bedFor', 'trackOk'] } };
// 6.3: each cue's keys (besides quiet)
var KEYS = { place: ['place'], map: ['id', 'mode', 'kind', 'crop', 'day', 'phase'], view: ['view'], opening: ['changed'], day: ['day'],
  plan: ['id', 'send'], reveal: ['day', 'lanes', 'kin', 'kinWith', 'bank', 'town', 'map', 'cards'],
  seasonEnd: ['day', 'kin', 'followBefore', 'followAfter', 'keepsBefore', 'keepsAfter', 'kinCount', 'map'], leaving: [],
  afterStart: ['jump'], season: ['to', 'byClock', 'yours', 'isNew', 'strip', 'told', 'lines'], afterEnd: ['finalYours'],
  count: [], chronicle: [], flip: ['on'], still: [] };
var BANNED_KEY = /^(why|seen|seenSince|seenFar|custom|habits|trace|events|model|verdict|state|life|intended|source|seal|purse|need|payoff|name|names|houses)$/;
// the windows of each cue's transients, in ms from the cue (2.2 to 2.4, 3): an animation that runs once ends by then;
// the light (TIMING.LIGHT) may run on where the light moves; the Afterwards' arc is one 19.8 s animation. Where the
// spec gives no total (a plan's tip) or says "about" (the season's end, about 800 ms) the window leaves room.
var WINDOW = { reveal: 1050, opening: 760, day: 160, plan: 400, seasonEnd: 1000, leaving: 800, view: 160, season: 660,
               afterEnd: 1200, afterStart: 19800, map: 0, place: 0, count: 0, chronicle: 0, flip: 0, still: 0 };
var LIGHT_CUES = { day: 1, reveal: 1, seasonEnd: 1, leaving: 1, afterStart: 1, afterEnd: 1 };
// the reveal's slots on the map's own marks and the cards' glyphs (2.4): start (+30k) and latest end
var SLOT = { yours: [0, 280], yoursHead: [250, 340], lost: [0, 260], lostX: [240, 350], stay: [40, 220],
             theirs: [70, 350], theirsHead: [320, 410] };

// the theory words: page-smoke.js's own pattern, so that the two never part
var FORBIDDEN_RE = (function () {
  var m = /\nvar FORBIDDEN_RE = (\/.*\/i);\n/.exec(readFile('page-smoke.js'));
  if (!m) throw new Error('motion-sound.js: FORBIDDEN_RE not found in page-smoke.js');
  return eval(m[1]);
})();
var SCRIPTS = (function () {
  var html = readFile('index.html'), re = /<script src="([^"]+)"><\/script>/g, m, out = [];
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
})();
var PLACES = (function () {                          // the registered places, in the play order (a bare realm reads them)
  var g = runString('this');
  SCRIPTS.forEach(function (s) { if (s === 'engine.js' || s === 'words.js' || /^places\//.test(s)) g.load(s); });
  var only = g.AYPlaces.order.filter(function (p) { return ARGV.indexOf(p) >= 0; });
  return only.length ? only : g.AYPlaces.order.slice();
})();
function srcOf(f) { try { return readFile(f); } catch (e) { return null; } }
var MOD_SRC = { motion: srcOf('motion.js'), sound: srcOf('sound.js') };

// ---- a source read like a parser: comments and strings set apart -------------------------------------------
function codeOnly(src, keepStrings) {                // the source with its comments (and strings) blanked
  var out = '', i = 0, n = src.length, c, q, prev = '';
  while (i < n) {
    c = src[i];
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; out += ' '; continue; }
    if (c === '"' || c === "'" || c === '`') {
      q = c; var s = c; i++;
      while (i < n && src[i] !== q) { if (src[i] === '\\') { s += src[i]; i++; } s += src[i]; i++; }
      s += q; i++;
      out += keepStrings ? s : q + q; prev = q; continue;
    }
    if (c === '/' && /[(,=:[!&|?{};+\-*%<>~^]$|^$|return$|typeof$/.test(prev)) {        // a regular expression literal
      var r = '/'; i++;
      var inClass = false;
      while (i < n && (src[i] !== '/' || inClass)) { if (src[i] === '\\') { r += src[i]; i++; } else if (src[i] === '[') inClass = true; else if (src[i] === ']') inClass = false; r += src[i]; i++; }
      r += '/'; i++;
      while (i < n && /[a-z]/.test(src[i])) { r += src[i]; i++; }
      out += keepStrings ? r : '//'; prev = '/'; continue;
    }
    out += c;
    if (!/\s/.test(c)) prev = /[A-Za-z0-9_$]/.test(c) ? (/[A-Za-z0-9_$]$/.test(prev) ? prev + c : c) : c;
    i++;
  }
  return out;
}
// the page's scans over a module source: each [what, test(src, bytes) -> the offending bit or null]
var SCANS = [
  ['a theory word or founder name, comments included (FORBIDDEN_RE)', function (s) { var m = FORBIDDEN_RE.exec(s); return m && m[2]; }],
  ['a byte above 0x7F (page scripts are ASCII)', function (s, b) { for (var i = 0; i < b.length; i++) if (b[i] > 0x7F) return 'byte ' + b[i] + ' at ' + i; return null; }],
  ['an address (a namespace name counts)', function (s) { var m = /https?:\/\/[^\s'"]*/.exec(s); return m && m[0]; }],
  ['a timer (motion runs on the document timeline, sound on the audio clock)', function (s) { var m = /\b(setTimeout|setInterval|setImmediate|requestAnimationFrame|requestIdleCallback)\b/.exec(codeOnly(s)); return m && m[1]; }],
  ['a clock other than document.timeline and the audio clock', function (s) { var m = /performance\s*\.\s*now|Date\s*\.\s*now|new\s+Date\b/.exec(codeOnly(s)); return m && m[0]; }],
  ['matchMedia (reduced motion comes from ctx.still())', function (s) { var m = /\bmatchMedia\b/.exec(codeOnly(s)); return m && m[0]; }],
  ['a call or tag the host forbids', function (s) { var m = /\b(alert|confirm|prompt)\s*\(|window\.print|<form/.exec(codeOnly(s, true)); return m && m[0]; }],
  ['createElementNS or a namespace', function (s) { var m = /createElementNS|xmlns/.exec(codeOnly(s, true)); return m && m[0]; }],
  ['a read of the engine or the page state (AfterYou, AYApp)', function (s) { var m = /\b(AfterYou|AYApp)\b/.exec(codeOnly(s, true)); return m && m[0]; }],
  ['getTotalLength (lengths come from the d string)', function (s) { var m = /getTotalLength/.exec(codeOnly(s)); return m && m[0]; }],
  ['an SVG filter or a blur', function (s) { var m = /<filter|feGaussianBlur|blur\(/.exec(codeOnly(s, true)); return m && m[0]; }],
  ['a literal colour (colours are tokens and classes)', function (s) { var m = /rgba?\(|hsla?\(|['"]#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?['"]|(?:fill|stroke)="#/.exec(codeOnly(s, true)); return m && m[0]; }],
  ['commitStyles (it writes a style attribute)', function (s) { var m = /commitStyles/.exec(codeOnly(s)); return m && m[0]; }],
  ['ES2015 syntax (let, const, class, an arrow, a template string)', function (s) {
    var c = codeOnly(s), m = /(^|[^.\w$])(let|const|class)\s+[A-Za-z_$]|=>|`/.exec(c); return m && m[0].trim(); }]
];
function bytesOf(src) { var b = [], i; for (i = 0; i < src.length; i++) { var c = src.charCodeAt(i); if (c < 0x80) b.push(c); else if (c < 0x800) b.push(0xC0 | c >> 6, 0x80 | c & 63); else b.push(0xE0 | c >> 12, 0x80 | c >> 6 & 63, 0x80 | c & 63); } return b; }
function scanSource(src, bytes) {                    // the scans a source fails: [[what, bit], ...]
  var out = [];
  SCANS.forEach(function (sc) { var bit = sc[1](src, bytes || bytesOf(src)); if (bit) out.push([sc[0], bit]); });
  return out;
}

// ---- the payloads (6.3) -------------------------------------------------------------------------------------
function payloadFaults(name, d) {                    // what is wrong with a cue's payload, by the whitelist
  var bad = [];
  function b(s) { if (bad.length < 12) bad.push(name + ': ' + s); }
  function isBool(x) { return x === true || x === false; }
  function exact(o, want, what) {
    if (!o || typeof o !== 'object') { b(what + ' is not an object'); return; }
    var k = Object.keys(o).sort().join(','), w = want.slice().sort().join(',');
    if (k !== w) b(what + ' carries ' + (k || 'nothing') + ' (the whitelist: ' + (w || 'nothing') + ')');
  }
  if (!Object.prototype.hasOwnProperty.call(KEYS, name)) { b('a cue the contract does not name'); return bad; }
  exact(d, KEYS[name].concat(['quiet']), 'the payload');
  if (!d || typeof d !== 'object') return bad;
  if (!isBool(d.quiet)) b('quiet is not a boolean');
  if (name === 'map') {
    if (['map-opening', 'map-day', 'map-leaving', 'map-after'].indexOf(d.id) < 0) b('id ' + d.id);
    if (['sheet', 'day', 'leaving', 'after'].indexOf(d.mode) < 0) b('mode ' + d.mode);
    if (['wide', 'compact'].indexOf(d.kind) < 0) b('kind ' + d.kind);
    if (!isBool(d.crop)) b('crop is not a boolean');
    if (d.mode === 'day') { if (!(d.day >= 1 && d.day <= 12) || ['choose', 'revealed', 'season'].indexOf(d.phase) < 0) b('day ' + d.day + ', phase ' + d.phase); }
    else if (d.day !== null || d.phase !== null || d.crop) b('a day, phase or crop on the ' + d.mode + ' map');
  } else if (name === 'reveal') {
    if (!Array.isArray(d.lanes) || d.lanes.length !== 4) b('lanes: not four');
    else {
      d.lanes.forEach(function (l) { exact(l, ['id', 'arrived', 'lost', 'they'], 'a lane'); if (!isBool(l.arrived) || !isBool(l.lost) || !isBool(l.they)) b('a lane that is not booleans'); if (l.arrived && l.lost) b('a lane arrived and lost'); });
      if (d.lanes.map(function (l) { return l.id; }).join() !== ORDER.join()) b('lanes not in the engine order 1, 2, 6, 7');
    }
    if (!Array.isArray(d.kinWith)) b('kinWith is not a list'); else d.kinWith.forEach(function (e) { exact(e, ['id', 'kinSent', 'theySent'], 'a dealing of the sister'); });
    if (d.bank !== null) { exact(d.bank, ['top', 'levels'], 'bank'); if (d.bank && d.bank.levels) exact(d.bank.levels, ['1', '2', '6', '7'], 'bank.levels'); }
    if (!isBool(d.town) || !isBool(d.map) || !isBool(d.cards)) b('town, map or cards not a boolean');
    if (!(d.day >= 1 && d.day <= 12)) b('day ' + d.day);
  } else if (name === 'seasonEnd') {
    if ([4, 8, 12].indexOf(d.day) < 0) b('day ' + d.day);
    if (!(d.kinCount >= 0 && d.kinCount <= 5)) b('kinCount ' + d.kinCount);
    ['followBefore', 'followAfter', 'keepsBefore', 'keepsAfter'].forEach(function (k) { if (d[k] !== null) exact(d[k], ['1', '2', '6', '7'], k); });
  } else if (name === 'season') {
    if (!Array.isArray(d.yours) || d.yours.length !== 8 || !Array.isArray(d.isNew) || d.isNew.length !== 8) b('yours or isNew not eight');
    if (!(d.strip >= 0 && d.strip <= 1)) b('strip ' + d.strip);
    if (!Array.isArray(d.told) || !Array.isArray(d.lines) || d.told.length !== d.lines.length) b('told and lines differ');
    else {
      d.told.forEach(function (t) { exact(t, ['yours'], 'a told line'); });
      d.lines.forEach(function (li, i) { if (!li || li.nodeType !== 1 || li.tagName !== 'LI') b('a line that is not an <li>'); else if (/(^|\s)is-yours(\s|$)/.test(li.className || '') !== d.told[i].yours) b('told[' + i + '].yours differs from its line'); });
    }
  } else if (name === 'afterEnd') { if (!Array.isArray(d.finalYours) || d.finalYours.length !== 8) b('finalYours not eight'); }
  else if (name === 'opening') { if (!isBool(d.changed)) b('changed is not a boolean'); }
  else if (name === 'afterStart') { if (!isBool(d.jump)) b('jump is not a boolean'); }
  else if (name === 'flip') { if (!isBool(d.on)) b('on is not a boolean'); }
  (function scan(o, path, depth) {                   // nothing anywhere in a payload is named for what the page never shows
    if (!o || typeof o !== 'object' || o.nodeType || depth > 6) return;
    Object.keys(o).forEach(function (k) { if (BANNED_KEY.test(k)) b('carries ' + path + k); scan(o[k], path + k + '.', depth + 1); });
  })(d, '', 0);
  return bad;
}

// ---- a page in its own realm: domshim, the stand-ins, the counts --------------------------------------------
// rec: everything one page did. depth > 0 while module code runs (boot, cue, and every callback a module gave).
function newRec() {
  return { now: 0, timers: 0, fxNow: 0, fxTimers: 0, raf: 0, depth: 0, cue: null, cueAt: 0, steps: [], raw: null, cmp: null, firstDiff: null,
           anims: [], animCalls: 0, stillAnims: 0, ctxs: 0, ctxBeforeClick: null, ctxAfterClick: null, audioEls: [], audioSrcs: [], fetch: 0, xhr: 0,
           docListeners: [], docFns: [], hidden: false, paramMoves: 0, nodeSeq: 0, voices: [], audioEvents: [], ioPending: [], payloadBad: [], cues: [], errors: [], violations: [],
           booted: {}, cap: null, capT0: 0, revealLog: null, revealPayload: null, mapFx: [], cueLog: {}, btn: [], session: null,
           afterDoneAt: null, afterFutures: null, verdictSteps: 0, ctx: null, wxBad: [], nwx: 0, groupsBad: [], lastMod: 'motion', seenSet: new WeakSet() };
}
function isFxNode(n) { var c = n.attrs && n.attrs['class']; return !!c && /(^|\s)fx(-[\w-]+)?(\s|$)/.test(c); }
function isBtnNode(n) { var c = n.attrs && n.attrs['class']; return !!c && /(^|\s)sound-btn(\s|$)/.test(c); }
function ser(n, skip) {                              // a node's markup with its own style properties, leaving out .fx (and the button)
  if (n.nodeType === 3) return n.data;
  if (skip && (isFxNode(n) || isBtnNode(n))) return '';
  var s = '<' + n.localName, k, st = n.style || {};
  Object.keys(n.attrs).forEach(function (a) { s += ' ' + a + '="' + n.attrs[a] + '"'; });
  var props = Object.keys(st).filter(function (p) { return p !== 'setProperty'; }).sort();
  if (props.length) s += ' {' + props.map(function (p) { return p + ':' + st[p]; }).join(';') + '}';
  s += '>';
  for (k = 0; k < n.childNodes.length; k++) s += ser(n.childNodes[k], skip);
  return s + '</' + n.localName + '>';
}
function fxOf(node) {                                // the .fx groups under a node, as markup
  var out = [];
  (function w(n) { n.childNodes.forEach(function (c) { if (c.nodeType !== 1) return; if (isFxNode(c) && /(^|\s)fx(\s|$)|fx-air|fx-go/.test(c.attrs['class'])) out.push(ser(c, false)); else w(c); }); })(node);
  return out.join('\n');
}
function describe(el) {                              // an animation's target, for the log
  if (!el || el.nodeType !== 1) return String(el);
  var inFx = false, n = el, at = '';
  for (; n && n.nodeType === 1; n = n.parentNode) { if (isFxNode(n)) inFx = true; if (!at && n.attrs.id && n !== el) at = n.attrs.id; }
  if (inFx) return 'fx@' + at + ' ' + ser(el, false);
  return 'base@' + at + ' <' + el.localName + ' ' + stable(el.attrs) + '>';
}

function fxWrap(rec, fn) {
  if (typeof fn !== 'function' || fn.__fx) return fn;
  var w = function () { rec.depth++; try { return fn.apply(this, arguments); } finally { rec.depth--; } };
  w.__fx = true; return w;
}
function fxCall(rec, fn, self, args) { if (typeof fn !== 'function') return; rec.depth++; try { fn.apply(self, args || []); } catch (e) { rec.errors.push('a callback threw: ' + e); } finally { rec.depth--; } }

function countClock(g, rec) {                        // every clock read and timer, and those made while module code runs
  var now = g.performance.now, st = g.setTimeout, si = g.setInterval;
  g.performance.now = function () { rec.now++; if (rec.depth) rec.fxNow++; return now.call(this); };
  g.setTimeout = g.window.setTimeout = function (fn, ms) { rec.timers++; if (rec.depth) rec.fxTimers++; return st(fn, ms); };
  g.setInterval = g.window.setInterval = function (fn, ms) { rec.timers++; if (rec.depth) rec.fxTimers++; return si(fn, ms); };
}
function installStubs(g, rec) {                      // the browser's animation, timeline, audio, Audio, fetch, XHR and listeners
  var EP = g.EP, doc = g.document, T0 = g.shim.clock;
  function ms() { return g.shim.clock; }
  function capture(line) { if (rec.cap) rec.cap.push(line); }
  function nid(n) { if (!rec.cap) return n.id; if (!rec.capIds || rec.capOf !== rec.cap) { rec.capIds = {}; rec.capOf = rec.cap; } if (!(n.id in rec.capIds)) rec.capIds[n.id] = Object.keys(rec.capIds).length + 1; return rec.capIds[n.id]; }
  // WAAPI: an animation runs from its creation by the shim's clock, and finishes when its time is up
  EP.animate = function (kf, opts) {
    rec.animCalls++;
    if (g.shim.view.still) rec.stillAnims++;
    var o = typeof opts === 'number' ? { duration: opts } : (opts || {}), el = this, settled = null;
    var dur = Number(o.duration) || 0, it = o.iterations === undefined ? 1 : Number(o.iterations), delay = Number(o.delay) || 0, endDelay = Number(o.endDelay) || 0;
    var a = { id: o.id || '', playState: 'running', playbackRate: 1, pending: false, startTime: ms() - T0, currentTime: 0, onfinish: null, oncancel: null, _l: { finish: [], cancel: [] } };
    a.effect = { target: el, getTiming: function () { return o; }, getComputedTiming: function () { return { activeDuration: dur * it, endTime: delay + dur * it + endDelay }; }, updateTiming: function (t) { for (var k in t) o[k] = t[k]; } };
    a.finished = new Promise(function (res) { settled = res; });
    a.ready = Promise.resolve(a);
    a.cancel = function () { if (a.playState === 'idle') return; a.playState = 'idle'; fxCall(rec, a.oncancel, a, [{}]); a._l.cancel.forEach(function (f) { fxCall(rec, f, a, [{}]); }); };
    a.finish = function () { if (a.playState === 'running' || a.playState === 'paused') done(); };
    a.pause = function () { if (a.playState === 'running') a.playState = 'paused'; };
    a.play = function () { if (a.playState !== 'finished') a.playState = 'running'; };
    a.reverse = a.persist = a.updatePlaybackRate = function () {};
    a.commitStyles = function () { rec.violations.push('commitStyles on ' + short(describe(el), 80)); };
    a.addEventListener = function (t, f) { if (a._l[t]) a._l[t].push(f); };
    a.removeEventListener = function (t, f) { if (a._l[t]) a._l[t] = a._l[t].filter(function (x) { return x !== f; }); };
    function done() { a.playState = 'finished'; fxCall(rec, a.onfinish, a, [{}]); a._l.finish.forEach(function (f) { fxCall(rec, f, a, [{}]); }); settled(a); }
    a._end = isFinite(it) ? ms() + delay + dur * it + endDelay : Infinity; a._done = done;
    var r = { el: el, kf: kf, o: o, at: ms(), cue: rec.cue, cueAt: rec.cueAt, inCue: rec.depth > 0 && !!rec.cue, delay: delay, dur: dur, it: it, endDelay: endDelay, anim: a, fx: false };
    for (var n = el; n && n.nodeType === 1; n = n.parentNode) if (isFxNode(n)) r.fx = true;
    rec.anims.push(r);
    capture('A ' + describe(el) + ' kf=' + stable(kf) + ' opt=' + stable(o));
    return a;
  };
  EP.getAnimations = function () { var el = this; return rec.anims.filter(function (r) { return r.el === el && (r.anim.playState === 'running' || r.anim.playState === 'paused'); }).map(function (r) { return r.anim; }); };
  doc.getAnimations = function () { return rec.anims.filter(function (r) { return r.anim.playState === 'running' || r.anim.playState === 'paused'; }).map(function (r) { return r.anim; }); };
  doc.timeline = {}; Object.defineProperty(doc.timeline, 'currentTime', { get: function () { return ms() - T0; } });
  // listeners: a module's are its code; the document's are recorded (and told only when a check fires them), and
  // document.hidden is the check's to set
  var add = EP.addEventListener;
  EP.addEventListener = function (t, fn) { return add.call(this, t, rec.depth ? fxWrap(rec, fn) : fn); };
  EP.removeEventListener = function () {};
  doc.addEventListener = function (t, fn) { rec.docListeners.push(t); if (typeof fn === 'function') rec.docFns.push({ t: t, fn: rec.depth ? fxWrap(rec, fn) : fn }); };
  Object.defineProperty(doc, 'hidden', { configurable: true, get: function () { return rec.hidden; } });
  doc.removeEventListener = function () {};
  var wadd = g.window.addEventListener;
  g.window.addEventListener = function (t, fn) { return wadd.call(this, t, rec.depth ? fxWrap(rec, fn) : fn); };
  g.window.removeEventListener = function () {};
  var mk = doc.createElement;
  doc.createElement = function (tag) { if (/^(audio|video)$/i.test(tag)) rec.audioEls.push({ tag: tag }); return mk.call(this, tag); };
  g.requestAnimationFrame = function () { rec.raf++; return 0; };
  g.cancelAnimationFrame = function () {};
  g.IntersectionObserver = function (cb) { var self = this; self.observe = function (el) { rec.ioPending.push({ cb: rec.depth ? fxWrap(rec, cb) : cb, el: el, obs: self }); }; self.unobserve = self.disconnect = self.takeRecords = function () { return []; }; };
  g.navigator = { audioSession: { type: 'auto' }, userAgent: 'stand-in', maxTouchPoints: 0 };
  g.fetch = function () { rec.fetch++; return new Promise(function () {}); };
  g.XMLHttpRequest = function () { rec.xhr++; this.open = this.send = this.setRequestHeader = this.abort = function () {}; };
  g.Audio = function (src) {
    var el = { preload: 'auto', paused: true, currentTime: 0, duration: NaN, volume: 1, muted: false, crossOrigin: null, _l: {} };
    Object.defineProperty(el, 'src', { get: function () { return el._src || ''; }, set: function (v) { el._src = String(v); rec.audioSrcs.push(String(v)); } });
    if (src !== undefined) el.src = src;
    el.play = function () { el.paused = false; return Promise.resolve(); };
    el.pause = function () { el.paused = true; }; el.load = function () {};
    el.addEventListener = function (t, f) { (el._l[t] = el._l[t] || []).push(f); }; el.removeEventListener = function () {};
    rec.audioEls.push(el);
    return el;
  };
  // Web Audio: nodes record their connections, parameter moves and starts; the clock is the shim's
  function Param(node, name, v) {
    var p = this; p.value = v; p.defaultValue = v; p.minValue = -3.4e38; p.maxValue = 3.4e38; p._node = node; p._name = name; p._ev = [];
    ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime', 'cancelScheduledValues', 'cancelAndHoldAtTime', 'setValueCurveAtTime'].forEach(function (m) {
      p[m] = function (a, t, c) {
        var curve = m === 'setValueCurveAtTime', when = curve ? t : m.indexOf('cancel') === 0 ? a : t;
        p._ev.push([m, curve ? null : a, when]); rec.paramMoves++;
        capture('P ' + node.type + '#' + nid(node) + '.' + name + ' ' + m + ' ' + (curve ? 'curve' : m.indexOf('cancel') === 0 ? '' : r6(a)) + ' @' + rel(when) + (c !== undefined && !curve ? ' ' + r6(c) : ''));
        return p;
      };
    });
  }
  function r6(x) { return typeof x === 'number' ? String(Math.round(x * 1e6) / 1e6) : String(x); }
  function rel(t) { return typeof t === 'number' ? r6(t - rec.capT0) : String(t); }
  function Ctx(opts) {
    var c = this, base = 0, since = null;
    rec.ctxs++; rec.ctx = c;
    c.sampleRate = 48000; c.state = 'suspended'; c.outputLatency = 0; c.baseLatency = 0; c.listener = {}; c.onstatechange = null;
    Object.defineProperty(c, 'currentTime', { get: function () { return c.state === 'running' ? base + (ms() - since) / 1000 : base; } });
    c.resume = function () { if (c.state !== 'running') { c.state = 'running'; since = ms(); } return Promise.resolve(); };
    c.suspend = function () { if (c.state === 'running') { base = c.currentTime; c.state = 'suspended'; } return Promise.resolve(); };
    c.close = function () { base = c.currentTime; c.state = 'closed'; return Promise.resolve(); };
    c.addEventListener = c.removeEventListener = function () {};
    c.destination = node(c, 'destination', {});
    var P = { gain: { gain: 1 }, oscillator: { frequency: 440, detune: 0 }, buffersource: { playbackRate: 1, detune: 0 }, biquad: { frequency: 350, Q: 1, gain: 0, detune: 0 },
              compressor: { threshold: -24, knee: 30, ratio: 12, attack: 0.003, release: 0.25 }, panner: { pan: 0 }, constant: { offset: 1 }, delay: { delayTime: 0 },
              analyser: {}, shaper: {}, media: {}, merger: {}, splitter: {}, convolver: {} };
    var M = { createGain: 'gain', createOscillator: 'oscillator', createBufferSource: 'buffersource', createBiquadFilter: 'biquad', createDynamicsCompressor: 'compressor',
              createStereoPanner: 'panner', createConstantSource: 'constant', createDelay: 'delay', createAnalyser: 'analyser', createWaveShaper: 'shaper',
              createMediaElementSource: 'media', createChannelMerger: 'merger', createChannelSplitter: 'splitter', createConvolver: 'convolver' };
    Object.keys(M).forEach(function (f) { c[f] = function () { return node(c, M[f], P[M[f]]); }; });
    c.createBuffer = function (ch, len, rate) { var chans = [], i; for (i = 0; i < ch; i++) chans.push(new Float32Array(len)); return { numberOfChannels: ch, length: len, sampleRate: rate, duration: len / rate, getChannelData: function (i) { return chans[i]; }, copyToChannel: function () {} }; };
    c.createPeriodicWave = function () { return {}; };
    c.decodeAudioData = function () { rec.fetch++; return new Promise(function () {}); };
  }
  function node(ctx, type, params) {
    var n = { type: type, id: ++rec.nodeSeq, context: ctx, _out: [], channelCount: 2, numberOfInputs: 1, numberOfOutputs: 1, onended: null, _l: [] }, k;
    for (k in params) n[k] = new Param(n, k, params[k]);
    if (type === 'oscillator') n.type_ = 'sine';
    if (type === 'biquad') n.filterType = 'lowpass';
    n.connect = function (dest) { n._out.push(dest); capture('C ' + n.type + '#' + nid(n) + '>' + (dest && dest._name ? dest._node.type + '#' + nid(dest._node) + '.' + dest._name : dest && dest.id ? dest.type + '#' + nid(dest) : '?')); return dest; };
    n.disconnect = function () { n._out = []; };
    n.addEventListener = function (t, f) { if (t === 'ended') n._l.push(rec.depth ? fxWrap(rec, f) : f); };
    n.removeEventListener = function () {};
    if (/^(oscillator|buffersource|constant)$/.test(type)) {
      n.buffer = null; n.loop = false; n.loopStart = 0; n.loopEnd = 0; n._stop = null;
      n.start = function (when) {
        when = typeof when === 'number' ? when : ctx.currentTime;
        rec.voices.push({ node: n, at: when, ctxNow: ctx.currentTime, cap: rec.cap, cue: rec.cue, inCue: rec.depth > 0 && !!rec.cue, quiet: rec.quietCue, pan: panOf(n), freq: n.frequency ? pval(n.frequency) : null, kind: n.type_ || type });
        capture('S ' + n.type + '#' + nid(n) + ' start @' + rel(when) + (n.frequency ? ' f=' + r6(n.frequency.value) : '') + (n.type_ && type === 'oscillator' ? ' ' + n.type_ : ''));
        if (type === 'buffersource' && n.buffer && !n.loop) end(when + n.buffer.duration);
      };
      n.stop = function (when) { when = typeof when === 'number' ? when : ctx.currentTime; n._stop = when; capture('S ' + n.type + '#' + nid(n) + ' stop @' + rel(when)); end(when); };
      var end = function (t) { rec.audioEvents.push({ ctx: ctx, at: t, fn: function () { fxCall(rec, n.onended, n, [{}]); n._l.forEach(function (f) { fxCall(rec, f, n, [{}]); }); } }); };
    }
    // an oscillator's type and a filter's type are both "type": keep the node kind apart from them
    Object.defineProperty(n, 'type', { get: function () { return type; }, set: function (v) { if (type === 'oscillator') n.type_ = v; else n.filterType = v; } });
    if (type === 'oscillator') n.setPeriodicWave = function () {};
    if (type === 'analyser') { n.fftSize = 2048; n.getFloatTimeDomainData = n.getByteTimeDomainData = n.getFloatFrequencyData = n.getByteFrequencyData = function () {}; }
    return n;
  }
  g.AudioContext = Ctx;
}
function processDue(g, rec) {                        // what falls due by the shim's clock: animations ending, audio ends, observers
  var t = g.shim.clock, i, list;
  if (rec.ioPending.length) { list = rec.ioPending; rec.ioPending = []; list.forEach(function (p) { fxCall(rec, p.cb, p.obs, [[{ target: p.el, isIntersecting: true, intersectionRatio: 1 }], p.obs]); }); }
  for (i = 0; i < rec.anims.length; i++) { var a = rec.anims[i].anim; if (a.playState === 'running' && a._end <= t) a._done(); }
  if (rec.audioEvents.length) {
    list = rec.audioEvents.filter(function (e) { return e.ctx.state === 'running' && e.ctx.currentTime >= e.at; });
    if (list.length) { rec.audioEvents = rec.audioEvents.filter(function (e) { return list.indexOf(e) < 0; }); list.sort(function (a, b) { return a.at - b.at; }).forEach(function (e) { e.fn(); }); }
  }
  drainMicrotasks();
}

// a module wrapped: its boot result, its errors, every cue's payload checked, the reveal of the twin day captured
function wrapModule(g, rec, name, opts) {
  var m = g[MOD_GLOBAL[name]];
  if (!m || typeof m !== 'object') return;
  var boot = m.boot, cue = m.cue;
  if (typeof boot === 'function') m.boot = function (ctx) {
    var r; rec.depth++;
    try { r = boot.call(m, ctx); } catch (e) { rec.errors.push(name + '.boot threw: ' + e); throw e; } finally { rec.depth--; }
    rec.booted[name] = !!r; if (name === 'sound') rec.soundCtx = ctx; return r;
  };
  if (typeof cue === 'function') m.cue = function (cname, data) {
    seen(g, rec, cname, data, opts);
    var top = !rec.cue; if (top) { rec.cue = cname; rec.cueAt = g.shim.clock; rec.quietCue = !!(data && data.quiet); }
    rec.depth++;
    try { return cue.call(m, cname, data); } catch (e) { rec.errors.push(name + '.cue(' + cname + ') threw: ' + e); throw e; } finally { rec.depth--; if (top) after(g, rec, cname, data, opts, name); }
  };
}
function seen(g, rec, cname, data, opts) {           // a payload, the first time any module is handed it
  if (data && typeof data === 'object') { if (rec.seenSet.has(data)) return; rec.seenSet.add(data); }
  rec.cues.push(cname + (data && data.quiet ? '~' : ''));
  if (cname === 'place' && data && typeof data.place === 'string') rec.place = data.place;      // the place in hand from now on
  payloadFaults(cname, data).forEach(function (f) { if (rec.payloadBad.length < 12 && rec.payloadBad.indexOf(f) < 0) rec.payloadBad.push(f); });
  if (cname === 'reveal' && opts.twinDay && data.day === opts.twinDay) { rec.cap = []; rec.capT0 = rec.ctx ? rec.ctx.currentTime : 0; rec.capSeq0 = rec.nodeSeq; rec.revealPayload = stable(data); }
  if (cname === 'seasonEnd' || cname === 'reveal' || cname === 'count') {
    var entry = { data: data, at: g.shim.clock, ctxT: rec.ctx ? rec.ctx.currentTime : 0, v0: rec.voices.length, a0: rec.anims.length, glyphs: {} };
    if (cname === 'reveal' && data && Array.isArray(data.lanes)) data.lanes.forEach(function (l) {     // each card's glyph, as the reveal finds it
      var card = g.document.querySelector('[data-house="' + l.id + '"]'), gl = card ? card.querySelector('.result-glyph') : null;
      if (gl) entry.glyphs[l.id] = gl;
    });
    (rec.cueLog[cname] = rec.cueLog[cname] || []).push(entry);
  }
}
function after(g, rec, cname, data, opts, last) {    // a cue done by one module (the last to be told closes it)
  rec.cue = null;
  if (last !== rec.lastMod) return;
  if (cname === 'map' && data && data.id) {
    var box = g.document.getElementById(data.id);
    if (box) { rec.mapFx.push({ key: [rec.place, data.id, data.mode, data.kind, data.crop, data.day, data.phase].join(' '), fx: fxOf(box), id: data.id, kind: data.kind }); dressing(g, rec, box, data); }
  }
  if (rec.cap && cname === 'reveal') {
    // the twin log: every animation the reveal started, every voice that starts in its window (a bed's one-shot is held
    // off past it, 4.2) with its own envelope and pan, and the map's fx as the reveal leaves them
    var cap = rec.cap, out = cap.filter(function (l) { return l.slice(0, 2) === 'A '; });
    rec.voices.forEach(function (v) { if (v.cap === cap && v.at - rec.capT0 <= 1.2) out.push(voiceLine(v, rec.capT0, rec.capSeq0)); });
    out.push('FX ' + fxOf(g.document.getElementById('map-day')));
    rec.revealLog = out.join('\n'); rec.cap = null;
  }
}
function dressing(g, rec, box, data) {               // a map just dressed: its fx groups where 2.1 puts them, its weather where 2.6 puts it
  var svg = box.querySelector('svg'), place = rec.place;
  if (!svg || !place) return;
  var geo = g.AYSheet.geo(g.AYPlaces.byId[place].sheet, data.kind), L = geo.L, kids = svg.children, at = data.id + ' ' + data.mode + ' ' + (data.day || '') + ' ' + (data.phase || '');
  var groups = kids.filter(function (c) { return isFxNode(c); });
  function gb(s) { if (rec.groupsBad.length < 6) rec.groupsBad.push(s); }
  groups.forEach(function (gr) {
    if (gr.getAttribute('aria-hidden') !== 'true' || gr.querySelectorAll('[tabindex]').length || gr.querySelectorAll('a').length || gr.querySelectorAll('button').length) gb(at + ': an fx group not aria-hidden, or holding something focusable');
    if (!gr.classList.contains('fx')) gb(at + ': an fx group without the class fx (index.html hides .fx under forced colours, and stops any CSS animation in it under reduced motion)');
  });
  var air = groups.filter(function (c) { return /(^|\s)fx-air(\s|$)/.test(c.attrs['class']); })[0], go = groups.filter(function (c) { return /(^|\s)fx-go(\s|$)/.test(c.attrs['class']); })[0];
  var firstHold = kids.filter(function (c) { return /(^|\s)m-hold(\s|$)/.test(c.attrs['class'] || ''); })[0], firstText = kids.filter(function (c) { return c.localName === 'text'; })[0];
  if (air && firstHold && kids.indexOf(air) > kids.indexOf(firstHold)) gb(at + ': fx-air is not under the first holding');
  if (go && firstText && kids.indexOf(go) > kids.indexOf(firstText)) gb(at + ': fx-go is not under the first lettering');
  if (groups.length && (!air || !go)) gb(at + ': fx groups other than fx-air and fx-go (' + groups.map(function (c) { return c.attrs['class']; }).join(', ') + ')');
  function wb(s) { if (rec.wxBad.length < 6) rec.wxBad.push(s); }
  svg.querySelectorAll('.fx-wx').forEach(function (el) {
    rec.nwx++;
    leafBoxes(el, 0, 0).forEach(function (bx) {      // each mark of the weather on its own (a group's box would span them all)
      var pts = bx.pts;
      if (!pts.length) return;
      var ys = pts.map(function (p) { return p[1]; }), xs = pts.map(function (p) { return p[0]; });
      var y1 = Math.max.apply(null, ys) + bx.sw, y0 = Math.min.apply(null, ys) - bx.sw, x0 = Math.min.apply(null, xs) - bx.sw, x1 = Math.max.apply(null, xs) + bx.sw;
      if (y1 > 0.36 * L.H + 0.05) wb(at + ': .fx-wx reaches y ' + y1.toFixed(1) + ' (0.36 H is ' + (0.36 * L.H).toFixed(1) + '): ' + short(ser(bx.el, false), 80));
      geo.pos.forEach(function (c, h) {
        var hw = L.pw / 2 + L.bound + 4, hh = L.ph / 2 + L.bound + 4;
        if (x1 > c[0] - hw && x0 < c[0] + hw && y1 > c[1] - hh && y0 < c[1] + hh) wb(at + ': .fx-wx inside holding ' + h + '\'s box, bound and 4 units: ' + short(ser(bx.el, false), 80));
      });
    });
  });
}

// ---- a Life through the page ---------------------------------------------------------------------------------
var POLICIES = { send: function () { return true; }, never: function () { return false; }, short: function (n) { return n.situation !== 2; } };
var LISTENER_SRC = '(function (root) { root.AYMotion = { boot: function () { return true; }, cue: function () {}, TIMING: {} }; })(this);';
// spec: { place, seed, policy, w, h, still, watch, mods: 'none' | 'files' | 'listener' | { motion: src, sound: src },
//         stubs, sound (click the button), twinDay, hot (a snapshot to restore), days (stop after), app (app.js text),
//         drive (a function of the run that plays it instead of walk), store (localStorage before app.js loads) }
function lifeRun(spec) {
  var g = runString('this'), rec = newRec(), mods = spec.mods || 'none';
  rec.place = spec.place; if (spec.raw) rec.raw = {}; if (spec.cmp) rec.cmp = spec.cmp;
  g.load(PAGE + 'domshim.js');
  g.shim.setView(spec.w || 1280, spec.h || 800, !!spec.still);
  countClock(g, rec);
  if (spec.stubs) installStubs(g, rec);
  SCRIPTS.forEach(function (s) { if (s !== 'app.js' && s !== 'motion.js' && s !== 'sound.js') g.load(s); });
  var wrapOpts = { twinDay: spec.twinDay };
  // a module that reads the engine or the page's state, at load, at boot or later, breaks L1 (it is told only what the
  // page shows): both globals answer through a trap from before the modules load (the page's own reads are not counted)
  if (spec.stubs) trap(g, rec, 'AfterYou');
  rec.depth++;                                       // loading a module runs module code
  try {
    if (mods === 'files') { if (MOD_SRC.motion !== null) g.load('motion.js'); if (MOD_SRC.sound !== null) g.load('sound.js'); }
    else if (mods === 'listener') g.loadString(LISTENER_SRC);
    else if (typeof mods === 'object') { if (mods.motion) g.loadString(mods.motion); if (mods.sound) g.loadString(mods.sound); }
  } finally { rec.depth--; }
  if (spec.stubs) trap(g, rec, 'AYApp');
  rec.lastMod = g.AYSound && typeof g.AYSound.cue === 'function' ? 'sound' : 'motion';
  if (mods !== 'none') { wrapModule(g, rec, 'motion', wrapOpts); wrapModule(g, rec, 'sound', wrapOpts); }
  g.shim.loadPage('.'); g.shim.store = spec.store ? extend({}, spec.store) : {}; g.window.location.hash = '#' + spec.place + (spec.seed !== undefined ? '-' + spec.seed : '');
  g.window.claude = spec.hot ? { hot: { data: spec.hot } } : undefined;
  rec.loading = true;
  if (spec.app) g.loadString(spec.app); else g.load('app.js');
  rec.loading = false;
  rec.lastMod = rec.booted.sound ? 'sound' : 'motion';
  var run = { g: g, rec: rec, spec: spec, S: g.AYApp.state };
  if (spec.drive) spec.drive(run); else if (!spec.hot) walk(run); else processDue(g, rec);
  return run;
}
function trap(g, rec, k) {                          // a global whose every read while module code runs is a violation
  var real = g[k];
  Object.defineProperty(g, k, { configurable: true, get: function () { if (rec.depth && rec.violations.length < 12) rec.violations.push('a module read ' + k + ' (L1)'); return real; }, set: function (v) { real = v; } });
}
function step(run, ms) {                             // the clock moved on by ms, in small steps, with what falls due
  var g = run.g, i;
  for (i = 0; i < ms; i += 10) { g.shim.advance(Math.min(10, ms - i)); processDue(g, run.rec); }
}
function mark(run, label) {                          // the page and the four maps at a step, minus .fx and the button
  var g = run.g, rec = run.rec, doc = g.document, body = ser(doc.body, true);
  var maps = ['map-opening', 'map-day', 'map-leaving', 'map-after'].map(function (id) { var n = doc.getElementById(id); return n.childNodes.map(function (c) { return ser(c, true); }).join(''); }).join('\u0001');
  var line = label + ' page ' + hex(fnv(body)) + ' ' + body.length + ' maps ' + hex(fnv(maps)) + ' ' + maps.length;
  rec.steps.push(line);
  if (rec.raw) rec.raw[label] = body + '\u0002' + maps;
  if (rec.cmp && !rec.firstDiff) {
    var want = rec.cmp[label], got = body + '\u0002' + maps;
    if (want !== undefined && want !== got) { var j = 0; while (j < want.length && want[j] === got[j]) j++; rec.firstDiff = label + ': at character ' + j + ', without the modules "' + short(want.slice(Math.max(0, j - 60), j + 80), 150) + '", with them "' + short(got.slice(Math.max(0, j - 60), j + 80), 150) + '"'; }
  }
}
function clickSound(run, where) {
  var g = run.g, rec = run.rec, btns = g.document.querySelectorAll('.sound-btn');
  rec.btn.push(where + ':' + btns.length);
  if (btns.length !== 1) return false;
  rec.ctxBeforeClick = rec.ctxs;
  btns[0].click(); processDue(g, rec);
  rec.ctxAfterClick = rec.ctxs; rec.pressed = btns[0].getAttribute('aria-pressed'); rec.session = g.navigator && g.navigator.audioSession ? g.navigator.audioSession.type : null;
  return true;
}
function btnPlace(run, view) {                       // where the button stands in a view (4.5)
  var g = run.g, d = g.document, b = d.querySelectorAll('.sound-btn'), $ = function (id) { return d.getElementById(id); };
  if (b.length !== 1) return 'buttons: ' + b.length;
  b = b[0];
  var ok = view === 'opening' ? $('begin').nextElementSibling === b : view === 'day' ? $('day-valley').nextElementSibling === b :
           view === 'leaving' ? $('leave').nextElementSibling === b : view === 'afterwards' ? b.nextElementSibling === $('skip') :
           view === 'chronicle' ? b.parentNode === $('again').parentNode && b.parentNode.children[b.parentNode.children.length - 1] === b : false;
  return ok && g.shim.displayed(b) ? 'ok' : view + ': the button is not where 4.5 puts it';
}
function walk(run) {
  var g = run.g, rec = run.rec, spec = run.spec, S = run.S, doc = g.document, pol = POLICIES[spec.policy], d, i;
  function $(id) { return doc.getElementById(id); }
  function click(id) { $(id).click(); processDue(g, rec); }
  var place = function (v) { if (rec.booted.sound) rec.btnPlaces = (rec.btnPlaces || []).concat([btnPlace(run, v)]); };
  processDue(g, rec);
  mark(run, 'opening'); place('opening');
  if (spec.sound && rec.booted.sound) clickSound(run, 'opening');
  click('begin');
  for (d = 1; d <= 12; d++) {
    if (S.view !== 'day' || S.today.day !== d) throw new Error('lifeRun: not on day ' + d + ' (' + S.view + ')');
    step(run, 300); mark(run, 'day ' + d + ' open'); if (d === 1) place('day');
    S.today.neighbours.forEach(function (n) {
      var a = $('choice-' + n.id + (pol(n) ? '-send' : '-stay'));
      a.checked = true; a.dispatch('change'); processDue(g, rec); step(run, 150);
    });
    mark(run, 'day ' + d + ' chosen'); step(run, 300);
    click('close-day');
    mark(run, 'day ' + d + ' closed'); step(run, 1200); mark(run, 'day ' + d + ' rest');
    var nb = S.today.neighbours[(d - 1) % 4].id, why = $('why-' + nb);           // a card turned over and back (the flip cue)
    if (why) { why.click(); processDue(g, rec); step(run, 600); mark(run, 'day ' + d + ' why'); $('why-back-' + nb).click(); processDue(g, rec); step(run, 600); }
    if (spec.days && d >= spec.days) return;
    click('next-day');
    if (S.view === 'day' && S.phase === 'season') { mark(run, 'day ' + d + ' season'); step(run, 1200); click('next-day'); }
  }
  if (S.view !== 'leaving') throw new Error('lifeRun: not at Leaving after day 12 (' + S.view + ')');
  mark(run, 'leaving'); place('leaving'); step(run, 1200);
  click('leave'); mark(run, 'afterwards start'); place('afterwards');
  if (spec.watch) {
    for (i = 0; i < 210 && !S.after.done; i++) step(run, 100);
    rec.afterDoneAt = S.after.done ? i * 100 : null; rec.afterFutures = S.job ? S.job.futuresDone : null;
  } else { step(run, 700); if (!S.after.done) click('skip'); }
  var guard = 0;
  while (!S.verdict) { step(run, 50); rec.verdictSteps++; if (++guard > 4000) throw new Error('lifeRun: the count never finished'); }
  step(run, 400); mark(run, 'afterwards end');
  click('to-chronicle'); mark(run, 'chronicle'); place('chronicle'); step(run, 1200);
  // the way back to the Opening, and another place chosen there (the opening cue with the place changed), then back
  if (!$('other-place').hidden) {
    click('other-place'); step(run, 600); mark(run, 'the Opening again'); place('opening');
    var other = spec.place === 'valley' ? 'banks' : 'valley', pick = $('place-' + other);
    pick.checked = true; pick.dispatch('change'); processDue(g, rec); step(run, 1000); mark(run, 'another place chosen');
    pick = $('place-' + spec.place); pick.checked = true; pick.dispatch('change'); processDue(g, rec); step(run, 1000); mark(run, 'the place chosen back');
  }
}

// ---- the twins: the engine alone, sorting each missing act into luck or choice ---------------------------------
var ENG = (function () { var g = runString('this'); g.load('engine.js'); return g.AfterYou; })();
function causesNow(life) {                           // before the day is played: each neighbour's intent toward you, and the ford
  var A = ENG, TL = A.tieList, out = {}, D = life.day, P = life.params;
  life.neighbours.forEach(function (x) {
    var t = -1, i; for (i = 0; i < TL.length; i++) if ((TL[i][0] === 0 && TL[i][1] === x) || (TL[i][1] === 0 && TL[i][0] === x)) t = i;
    var L = life.last[t], me = TL[t][0] === 0 ? 0 : 1, sb = L ? 4 - 2 * L[1 - me] - L[me] : 0;
    var p = life.houses[x].custom[sb], intended = p >= 1 ? true : p <= 0 ? false : A.draw(life.seed, A.PURPOSES.ACT, D, x, 0, 0) < p;
    var lost = intended && A.draw(life.seed, A.PURPOSES.FORD, D, x, 0, 0) < P.FOG;
    out[x] = { intended: intended, arrived: intended && !lost };
  });
  return out;
}
function revealKey(life, r, d) {                     // what the reveal shows, as app.js hands it over (fxReveal)
  var lanes = r.results.map(function (x) { return { id: x.id, arrived: !!x.arrived, lost: !!x.lost, they: !!x.they }; });
  var kw = r.kinWith.map(function (e) { return { id: e.id, kinSent: !!e.kinSent, theySent: !!e.theySent }; });
  var bank = life.params.STOCK ? r.results.map(function (x) { return [x.stock, x.stockAfter]; }) : null;
  return JSON.stringify([d, lanes, life.kin, kw, bank, life.params.CHARTER === 'breaks']);
}
var SORTED = { lanes: 0, wrong: 0, luck: 0, choice: 0 };
function findTwins(place) {                          // two Lives whose reveal on one day shows the same, a missing act luck in one and a choice in the other
  var keys = {}, best = null, pn, seed, d, NP = ['send', 'short', 'never'];          // (the first pair found, in this fixed order)
  for (seed = 1; seed <= 120 && !best; seed++) for (var pi = 0; pi < NP.length && !best; pi++) {
    pn = NP[pi];
    var life = ENG.createLife(seed, place), pol = POLICIES[pn];
    for (d = 1; d <= 12 && !best; d++) {
      var t = ENG.today(life), ch = t.neighbours.map(function (n) { return !!pol(n); }), cz = causesNow(life), r = ENG.playDay(life, ch);
      r.results.forEach(function (x) {                // the sorting agrees with the engine on whether their hand came
        SORTED.lanes++; if (x.they !== cz[x.id].arrived) SORTED.wrong++;
        if (!x.they) { if (cz[x.id].intended) SORTED.luck++; else SORTED.choice++; }
      });
      var cause = r.results.map(function (x) { return x.they ? '-' : cz[x.id].intended ? 'L' : 'C'; }).join('');
      if (!/[LC]/.test(cause)) continue;
      var key = revealKey(life, r, d), k = keys[key] || (keys[key] = []), j;
      for (j = 0; j < k.length && !best; j++) if (k[j].cause !== cause && k[j].seed !== seed) best = { day: d, key: key, a: k[j], b: { policy: pn, seed: seed, cause: cause } };
      k.push({ policy: pn, seed: seed, cause: cause });
    }
  }
  return best;
}
function laneWords(tw) {                             // which lanes differ, and how, for the log
  var out = [], i;
  for (i = 0; i < 4; i++) if (tw.a.cause[i] !== tw.b.cause[i]) out.push('house ' + ORDER[i] + ' ' + (tw.a.cause[i] === 'L' ? 'luck' : 'choice') + ' / ' + (tw.b.cause[i] === 'L' ? 'luck' : 'choice'));
  return out.join(', ');
}

// ---- the windows and slots of the observed motion and sound ---------------------------------------------------
function animFaults(run) {                           // windows (2.2-2.4), finite loops, no forward fill on the page's own nodes
  var rec = run.rec, bad = [], T = TIMING_SPEC;
  function b(s) { if (bad.length < 10) bad.push(s); }
  rec.anims.forEach(function (r) {
    var what = (r.cue || 'a callback') + ' ' + short(describe(r.el), 90);
    if (!(r.dur >= 0) || !isFinite(r.dur)) b(what + ': duration ' + r.dur);
    if (r.delay < 0) b(what + ': a negative delay');
    if (!isFinite(r.it)) b(what + ': iterations ' + r.it + ' (loops run a finite number of times)');
    if (r.it > 1 && r.dur > 0 && r.it > Math.ceil(90000 / r.dur)) b(what + ': ' + r.it + ' iterations of ' + r.dur + ' ms (at most ceil(90000 / duration))');
    if (!r.fx && /forwards|both/.test(String(r.o.fill || ''))) b(what + ': a forward fill on the page\'s own node');
    if (r.it <= 1 && r.cue && WINDOW[r.cue] !== undefined) {
      var end = (r.at - r.cueAt) + r.delay + r.dur * r.it + r.endDelay, light = LIGHT_CUES[r.cue] && r.dur === T.LIGHT;
      var lim = light ? T.LIGHT + (r.at - r.cueAt) + r.delay : r.cue === 'afterEnd' ? WINDOW.afterEnd : WINDOW[r.cue];
      if (end > lim + 1) b(what + ': ends at ' + end + ' ms, after the ' + r.cue + ' window (' + lim + ' ms)');
    }
  });
  return bad;
}
function slotFaults(run) {                           // the reveal's slots on the map's own marks and on the cards' glyphs (2.4)
  var rec = run.rec, g = run.g, bad = [], counted = 0, revs = (rec.cueLog.reveal || []);
  function b(s) { if (bad.length < 10) bad.push(s); }
  revs.forEach(function (rv, ri) {
    var next = ri + 1 < revs.length ? revs[ri + 1].a0 : rec.anims.length, mine = rec.anims.slice(rv.a0, next).filter(function (r) { return r.cue === 'reveal'; });
    if (rv.data.quiet || run.spec.still) return;
    var sh = g.AYPlaces.byId[run.spec.place].sheet, kind = null;
    rec.mapFx.forEach(function (m) { if (m.id === 'map-day') kind = m.kind; });
    if (!kind) return;
    var L = g.AYSheet.lanes(sh, kind), want = [];          // [d, class, slot, k]
    rv.data.lanes.forEach(function (l) {
      var k = K_OF[l.id], ln = L[l.id];
      if (l.arrived) want.push([ln.outD, 'm-hand', SLOT.yours, k, 'your hand to ' + l.id]);
      else if (l.lost) want.push([ln.brokenD, 'm-lost', SLOT.lost, k, 'your hand turned back toward ' + l.id]);
      else want.push([ln.gateD, 'm-stay', SLOT.stay, k, 'your Stay with ' + l.id]);
      if (l.they) want.push([ln.backD, 'm-hand', SLOT.theirs, k, 'the hand of ' + l.id]);
    });
    if (rv.data.map) want.forEach(function (w) {
      var hits = mine.filter(function (r) { return !r.fx && r.el.attrs && r.el.attrs.d === w[0] && (r.el.attrs['class'] || '').split(/\s+/).indexOf(w[1]) >= 0; });
      if (!hits.length) { b('day ' + rv.data.day + ': ' + w[4] + ' is not drawn on'); return; }
      var start = Math.min.apply(null, hits.map(function (r) { return r.at - r.cueAt + r.delay; })), end = Math.max.apply(null, hits.map(function (r) { return r.at - r.cueAt + r.delay + r.dur * r.it + r.endDelay; }));
      var s0 = w[2][0] + 30 * w[3], e0 = w[2][1] + 30 * w[3];
      if (Math.abs(start - s0) > 1 || end > e0 + 1) b('day ' + rv.data.day + ': ' + w[4] + ' runs ' + start + '-' + end + ' ms (its slot: ' + s0 + '-' + e0 + ')');
      counted++;
    });
    if (rv.data.cards) rv.data.lanes.forEach(function (l) {            // each card's glyph plays its lane's timeline
      var glyph = rv.glyphs[l.id], k = K_OF[l.id];
      if (!glyph) { b('day ' + rv.data.day + ': no glyph on the card of ' + l.id); return; }
      var hits = mine.filter(function (r) { return glyph.contains(r.el); });
      var yours = hits.filter(function (r) { return r.el.attrs.d === 'M17 7H37' || r.el.attrs['class'] === 'key-lost' || r.el.attrs.d === 'M17.5 3.2v7.6'; });
      var theirs = hits.filter(function (r) { return r.el.attrs.d === 'M42 17H22'; });
      [[yours, l.arrived ? SLOT.yours : l.lost ? SLOT.lost : SLOT.stay, 'your line on the card of ' + l.id], [theirs, SLOT.theirs, 'their line on the card of ' + l.id]].forEach(function (x) {
        if (x[1] === SLOT.theirs && !l.they) return;
        if (!x[0].length) { b('day ' + rv.data.day + ': ' + x[2] + ' does not play'); return; }
        var s = Math.min.apply(null, x[0].map(function (r) { return r.at - r.cueAt + r.delay; }));
        if (Math.abs(s - (x[1][0] + 30 * k)) > 1) b('day ' + rv.data.day + ': ' + x[2] + ' starts at ' + s + ' ms (its slot: ' + (x[1][0] + 30 * k) + ')');
        counted++;
      });
    });
  });
  return { bad: bad, counted: counted };
}
function pval(p) {                                  // a parameter's value as set: its last set or ramp, else its value
  var ev = (p._ev || []).filter(function (e) { return e[1] !== null && /^(setValueAtTime|linearRamp|exponentialRamp|setTarget)/.test(e[0]); });
  return ev.length ? ev[ev.length - 1][1] : p.value;
}
function voiceLine(v, t0, seq0) {                    // a voice for the twin log: when, what, where, and its own nodes' moves
  function r(x) { return String(Math.round(x * 1e5) / 1e5); }
  var parts = [], seen = [], local = {};
  (function walk(n) {
    if (!n || seen.indexOf(n) >= 0 || !(n.id > seq0)) return;
    seen.push(n); local[n.id] = 'n' + seen.length;
    Object.keys(n).forEach(function (k) { var p = n[k]; if (p && p._ev) parts.push(local[n.id] + '.' + k + '=' + r(p.value) + p._ev.map(function (e) { return ' ' + e[0] + ' ' + (e[1] === null ? '' : r(e[1])) + '@' + r(e[2] - t0); }).join('')); });
    (n._out || []).forEach(function (o) { if (o && !o._name) walk(o); });
  })(v.node);
  return 'V ' + v.kind + ' @' + r(v.at - t0) + ' f=' + (v.freq === null ? '-' : r(v.freq)) + ' pan=' + v.pan + ' | ' + parts.join('; ');
}
function panOf(n, seen) {                            // the stereo pan a source reaches the master through (0 where none)
  seen = seen || [];
  if (!n || seen.indexOf(n) >= 0) return null;
  seen.push(n);
  if (n.type === 'panner' && n.pan) return pval(n.pan);
  for (var i = 0; i < (n._out || []).length; i++) { var o = n._out[i]; if (o && !o._name) { var p = panOf(o, seen); if (p !== null) return p; } }
  return null;
}
function soundFaults(run) {                          // the reveal's sounds (4.3): an arrival for each hand that came, a thump for each of yours turned back, a missing act silent
  var rec = run.rec, bad = [], counted = 0, revs = rec.cueLog.reveal || [];
  function b(s) { if (bad.length < 10) bad.push(s); }
  revs.forEach(function (rv, ri) {
    var next = ri + 1 < revs.length ? revs[ri + 1].v0 : rec.voices.length, vs = rec.voices.slice(rv.v0, next).filter(function (v) { return v.cue === 'reveal'; });
    if (rv.data.quiet || !rec.ctx) return;
    function at(t0, t1, pan) { return vs.filter(function (v) { var t = v.at - rv.ctxT; return t >= t0 - 0.006 && t <= t1 + 0.006 && (pan === null || (v.pan !== null && Math.abs(v.pan - pan) < 0.001)); }); }
    rv.data.lanes.forEach(function (l) {
      var k = K_OF[l.id], p = PAN_OF[l.id], arr = at(0.320 + 0.03 * k, 0.320 + 0.03 * k, p);
      if (l.they && !arr.length) b('day ' + rv.data.day + ': no arrival for the hand of ' + l.id + ' at ' + (320 + 30 * k) + ' ms, pan ' + p);
      if (!l.they && at(0.270 + 0.03 * k, 0.720 + 0.03 * k, p).length) b('day ' + rv.data.day + ': a sound in the slot of the missing act of ' + l.id + ' (missing acts are silent)');
      var th = at(0.240 + 0.03 * k, 0.240 + 0.03 * k, p);
      if (l.lost && !th.length) b('day ' + rv.data.day + ': no thump for your hand turned back toward ' + l.id);
      if (!l.lost && th.length) b('day ' + rv.data.day + ': a thump on the lane of ' + l.id + ', where your hand was not turned back');
      counted++;
    });
  });
  (rec.cueLog.seasonEnd || []).forEach(function (se) {               // the bell, then one chime for each of the sister's habits from you
    if (se.data.quiet || !rec.ctx) return;
    var vs = rec.voices.filter(function (v) { return v.cue === 'seasonEnd' && v.at >= se.ctxT - 0.001 && v.at < se.ctxT + 3; }), n = 0, i;
    for (i = 0; i <= 5; i++) if (vs.some(function (v) { return Math.abs(v.at - se.ctxT - (0.38 + 0.14 * i)) < 0.006; })) n = i + 1; else break;
    if (n !== se.data.kinCount) b('day ' + se.data.day + ': ' + n + ' chimes at the season\'s end for the page\'s ' + se.data.kinCount + ' of 5');
    counted++;
  });
  return { bad: bad, counted: counted };
}
function countLog(run) {                             // the count-ready sound: one for every result (L7)
  var rec = run.rec, c = (rec.cueLog.count || [])[0];
  if (!c || !rec.ctx) return null;
  return rec.voices.filter(function (v) { return v.cue === 'count'; }).map(function (v) { return v.kind + ' ' + Math.round((v.at - c.ctxT) * 1e4) / 1e4 + ' ' + (v.freq !== null ? Math.round(v.freq * 100) / 100 : '') + ' ' + v.pan; }).join(';');
}

// ---- bounding boxes of drawn SVG, for the weather ---------------------------------------------------------------
function numbersIn(s) { return (String(s).match(/-?\d*\.?\d+(?:e-?\d+)?/gi) || []).map(Number); }
function pathPoints(d) {                             // the points a path's d passes through (control points count: a box that is never too small)
  var re = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g, m, x = 0, y = 0, sx = 0, sy = 0, pts = [], i, a, c;
  while ((m = re.exec(d))) {
    c = m[1]; a = numbersIn(m[2]);
    var rel = c === c.toLowerCase(), C = c.toUpperCase();
    if (C === 'Z') { x = sx; y = sy; continue; }
    if (C === 'H') { for (i = 0; i < a.length; i++) { x = rel ? x + a[i] : a[i]; pts.push([x, y]); } continue; }
    if (C === 'V') { for (i = 0; i < a.length; i++) { y = rel ? y + a[i] : a[i]; pts.push([x, y]); } continue; }
    var n = C === 'A' ? 7 : C === 'C' ? 6 : C === 'S' || C === 'Q' ? 4 : 2;
    for (i = 0; i + n <= a.length; i += n) {
      var bx = x, by = y, j;
      if (C === 'A') { x = rel ? bx + a[i + 5] : a[i + 5]; y = rel ? by + a[i + 6] : a[i + 6]; pts.push([x - a[i], y - a[i + 1]], [x + a[i], y + a[i + 1]], [x, y]); }
      else { for (j = 0; j < n; j += 2) pts.push([rel ? bx + a[i + j] : a[i + j], rel ? by + a[i + j + 1] : a[i + j + 1]]); x = pts[pts.length - 1][0]; y = pts[pts.length - 1][1]; }
      if (C === 'M' && i === 0) { sx = x; sy = y; }
    }
  }
  return pts;
}
function leafBoxes(el, tx, ty) {                   // the box of each leaf mark under an element (translate() followed)
  var t = /translate\(\s*(-?[\d.]+)[\s,]*(-?[\d.]+)?\s*\)/.exec((el.attrs || {}).transform || ''), kids = (el.childNodes || []).filter(function (c) { return c.nodeType === 1; }), out = [];
  if (t) { tx += Number(t[1]); ty += Number(t[2] || 0); }
  if (!kids.length || el.localName === 'text') { var b = boxOf(el, tx - (t ? Number(t[1]) : 0), ty - (t ? Number(t[2] || 0) : 0)); b.el = el; return [b]; }
  kids.forEach(function (c) { out = out.concat(leafBoxes(c, tx, ty)); });
  return out;
}
function boxOf(el, tx, ty) {                         // an element's box in sheet units (translate() transforms followed)
  var a = el.attrs || {}, pts = [], t = /translate\(\s*(-?[\d.]+)[\s,]*(-?[\d.]+)?\s*\)/.exec(a.transform || ''), k;
  if (t) { tx += Number(t[1]); ty += Number(t[2] || 0); }
  var tag = el.localName;
  if (tag === 'rect' || tag === 'use' || tag === 'image') { var x = Number(a.x || 0), y = Number(a.y || 0); pts.push([x, y], [x + Number(a.width || 0), y + Number(a.height || 0)]); }
  else if (tag === 'circle' || tag === 'ellipse') { var cx = Number(a.cx || 0), cy = Number(a.cy || 0), rx = Number(a.r || a.rx || 0), ry = Number(a.r || a.ry || 0); pts.push([cx - rx, cy - ry], [cx + rx, cy + ry]); }
  else if (tag === 'line') pts.push([Number(a.x1 || 0), Number(a.y1 || 0)], [Number(a.x2 || 0), Number(a.y2 || 0)]);
  else if (tag === 'polyline' || tag === 'polygon') { var ns = numbersIn(a.points || ''); for (k = 0; k + 1 < ns.length; k += 2) pts.push([ns[k], ns[k + 1]]); }
  else if (tag === 'path') pts = pathPoints(a.d || '');
  else if (tag === 'text') pts.push([Number(a.x || 0), Number(a.y || 0)]);
  var sw = Number(a['stroke-width'] || 0) / 2;
  pts = pts.map(function (p) { return [p[0] + tx, p[1] + ty]; });
  (el.childNodes || []).forEach(function (c) { if (c.nodeType === 1) pts = pts.concat(boxOf(c, tx, ty).pts); });
  return { pts: pts, sw: sw };
}

// ---- the sections ------------------------------------------------------------------------------------------------
var STATUS = { motion: 'absent', sound: 'absent' };   // boots | declines | absent (in the stood-in browser)

// 1. loading
function sectionLoading() {
  begin(1, 'loading: each module twice in the bare shell, domshim and dom-harness; TIMING; the source scans');
  ['motion', 'sound'].forEach(function (name) {
    var file = MOD_FILES[name], glob = MOD_GLOBAL[name];
    if (MOD_SRC[name] === null) { fail(file + ': not in the game folder'); return; }
    [['the bare shell', null], ['domshim', PAGE + 'domshim.js'], ['dom-harness', PAGE + 'dom-harness.js']].forEach(function (env) {
      var g = runString('this'), err = null, state0, state1, names0, added;
      if (env[1]) g.load(env[1]);
      function state() {
        if (env[0] === 'domshim') return [g.shim.timers.length, g.shim.media.length, Object.keys(g.window.listeners).join(','), g.shim.clock, g.document.activeElement === g.document.body].join(' | ');
        if (env[0] === 'dom-harness') return [g.timers.length, Object.keys(g.MEDIA).join(','), g.WIN.listeners.length, g.NOW].join(' | ');
        return '';
      }
      if (env[0] !== 'the bare shell') {              // listeners on any node, and clock reads, counted
        var EP = env[0] === 'domshim' ? g.EP : g.El.prototype, add = EP.addEventListener, n = 0, pn = g.performance.now;
        EP.addEventListener = function () { n++; return add.apply(this, arguments); };
        g.performance.now = function () { n++; return pn.call(this); };
      }
      state0 = state(); names0 = Object.getOwnPropertyNames(g).sort();
      try { g.load(file); g.load(file); } catch (e) { err = String(e); }
      state1 = state(); added = Object.getOwnPropertyNames(g).filter(function (k) { return names0.indexOf(k) < 0; }).sort();
      check(!err && state0 === state1 && added.join() === glob && !(n > 0), file + ' loads twice in ' + env[0] + ', adding only ' + glob + ' and touching nothing',
            err ? 'threw: ' + err : added.join() !== glob ? 'globals added: ' + (added.join(', ') || 'none') : n > 0 ? n + ' listener or clock calls' : 'timers, media queries, listeners or clock moved: ' + state0 + ' -> ' + state1);
    });
  });
  var g = runString('this');
  try { g.load('motion.js'); g.load('sound.js'); } catch (e) { /* reported above */ }
  var M = g.AYMotion, S = g.AYSound;
  check(M && stable(M.TIMING) === stable(TIMING_SPEC), 'AYMotion.TIMING is the table of 2.2', M ? stable(M.TIMING) : 'no AYMotion');
  check(M && S && stable(S.TIMING) === stable(M.TIMING), 'AYSound.TIMING equals AYMotion.TIMING', S ? stable(S.TIMING) : 'no AYSound');
  ['motion', 'sound'].forEach(function (name) {
    var m = g[MOD_GLOBAL[name]];
    check(m && API[name].fns.slice(0, 2).every(function (f) { return typeof m[f] === 'function'; }), MOD_GLOBAL[name] + ' has boot and cue');
    var missing = m ? API[name].fns.slice(2).filter(function (f) { return typeof m[f] !== 'function'; }).concat(API[name].test.filter(function (f) { return !m._test || typeof m._test[f] !== 'function'; }).map(function (f) { return '_test.' + f; })) : ['everything'];
    if (!missing.length) pass(MOD_GLOBAL[name] + ' has the rest of 6.1: ' + API[name].fns.slice(2).concat(API[name].test.map(function (f) { return '_test.' + f; })).join(', '));
    else if (STATUS[name] === 'boots') fail(MOD_GLOBAL[name] + ' lacks ' + missing.join(', ') + ' (6.1)');
    else wait(MOD_GLOBAL[name] + ' lacks ' + missing.join(', ') + ' (6.1); it does not boot yet (a stub)');
  });
  ['motion', 'sound'].forEach(function (name) {
    if (MOD_SRC[name] === null) return;
    var faults = scanSource(MOD_SRC[name], readFile(MOD_FILES[name], 'binary'));
    check(!faults.length, MOD_FILES[name] + ' passes the ' + SCANS.length + ' source scans', faults.map(function (f) { return f[0] + ' (' + short(f[1], 60) + ')'; }).join('; '));
  });
}

// the stood-in browser's first look: does each module boot there?
function probeStatus() {
  var run = lifeRun({ place: 'valley', seed: 1, policy: 'send', mods: 'files', stubs: true, days: 1 });
  ['motion', 'sound'].forEach(function (name) {
    STATUS[name] = MOD_SRC[name] === null ? 'absent' : run.rec.booted[name] ? 'boots' : 'declines';
  });
  run.rec.errors.slice(0, 3).forEach(function (e) { say('  (the first look: ' + e + ')'); });
  return run;
}

// ---- the paired runs: each Life without the modules (its page kept for the comparison), then with them ----------
var SIZES = [[400, 800], [1280, 800]], PAIRS = [];
function prepare() {
  var booting = STATUS.motion === 'boots' || STATUS.sound === 'boots';
  PLACES.forEach(function (pl) {
    var tw = TWINS[pl];
    SIZES.forEach(function (sz) {
      [tw.a, tw.b].forEach(function (who, wi) {
        var spec = { place: pl, seed: who.seed, policy: who.policy, w: sz[0], h: sz[1], watch: wi === 0, twinDay: tw.day };
        var b = lifeRun(extend(spec, { mods: 'none', raw: true }));
        var cmp = b.rec.raw; b.rec.raw = null;
        var r = lifeRun(extend(spec, { mods: booting ? 'files' : 'listener', stubs: true, sound: true, cmp: cmp }));
        r.rec.cmp = null;
        PAIRS.push(analyse(r, b));
      });
    });
  });
}
function analyse(run, base) {                        // what the sections read of a pair, kept small (the realms are let go)
  var r = run.rec, b = base.rec, s = run.spec, out = {
    key: s.place + ' ' + s.w + 'x' + s.h + ' ' + s.policy + ' ' + s.seed, spec: s,
    base: { steps: b.steps, now: b.now, timers: b.timers, afterDoneAt: b.afterDoneAt, afterFutures: b.afterFutures, verdictSteps: b.verdictSteps },
    steps: r.steps, firstDiff: r.firstDiff, now: r.now, timers: r.timers, fxNow: r.fxNow, fxTimers: r.fxTimers, raf: r.raf,
    payloadBad: r.payloadBad, cues: r.cues.length, errors: r.errors, violations: r.violations, booted: r.booted,
    afterDoneAt: r.afterDoneAt, afterFutures: r.afterFutures, verdictSteps: r.verdictSteps,
    ctxBeforeClick: r.ctxBeforeClick, ctxAfterClick: r.ctxAfterClick, ctxs: r.ctxs, audioEls: r.audioEls.length, fetch: r.fetch, xhr: r.xhr,
    pressed: r.pressed, session: r.session, btnPlaces: r.btnPlaces || [], btn: r.btn,
    revealLog: r.revealLog, revealPayload: r.revealPayload, mapFx: r.mapFx, wxBad: r.wxBad, nwx: r.nwx, groupsBad: r.groupsBad,
    anims: r.animCalls, voices: r.voices.filter(function (v) { return v.inCue; }).length      // the cues' voices only: the bed's one-shots use Math.random, so their count is not the same twice
  };
  if (STATUS.sound === 'boots') { out.sf = soundFaults(run); out.countLog = countLog(run); }
  if (STATUS.motion === 'boots') { out.anim = animFaults(run); out.sl = slotFaults(run); }
  return out;
}

// 2. disabled
function sectionDisabled() {
  begin(2, 'disabled: the modules decline in domshim and dom-harness, and a whole Life is as without them');
  // dom-harness: the page started, each module asked to boot
  var g = runString('this'), booted = {};
  g.load(PAGE + 'dom-harness.js');
  SCRIPTS.forEach(function (s) {
    if (s === 'app.js') ['AYMotion', 'AYSound'].forEach(function (k) { var m = g[k]; if (m && typeof m.boot === 'function') { var bt = m.boot; m.boot = function (c) { var r = bt.call(m, c); booted[k] = r; return r; }; } });
    g.load(s);
  });
  check(booted.AYMotion === false && booted.AYSound === false, 'in dom-harness both modules are asked to boot and decline', stable(booted));
  PLACES.forEach(function (pl) {
    var p = PAIRS.filter(function (x) { return x.spec.place === pl && x.spec.w === 1280 && x.spec.watch; })[0], b = p.base, s = p.spec;
    var run = lifeRun({ place: pl, seed: s.seed, policy: s.policy, w: 1280, h: 800, watch: true, mods: 'files' }), r = run.rec, same = r.steps.join('\n') === b.steps.join('\n');
    check(r.booted.motion === false && r.booted.sound === false && r.now === b.now && r.timers === b.timers && same && !r.errors.length,
          pl + ' ' + s.policy + ' ' + s.seed + ' at 1280x800 in domshim: both decline; ' + r.now + ' clock reads and ' + r.timers + ' timers as without them, all ' + r.steps.length + ' steps the same',
          'booted ' + stable(r.booted) + ', clock ' + r.now + ' / ' + b.now + ', timers ' + r.timers + ' / ' + b.timers + (same ? '' : ', a step differs: ' + firstStep(b.steps, r.steps)) + (r.errors.length ? ', ' + r.errors[0] : ''));
  });
}
function firstStep(a, b) { for (var i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) return (a[i] || 'none') + ' / ' + (b[i] || 'none'); return 'none'; }

// 3. stubbed
function sectionStubbed() {
  begin(3, 'stubbed: two Lives a place at 400x800 and 1280x800 in a stood-in browser, each against the same Life without the modules');
  var booting = STATUS.motion === 'boots' || STATUS.sound === 'boots';
  note('motion.js ' + STATUS.motion + ', sound.js ' + STATUS.sound + (booting ? '' : ': a listener that boots stands in for them, so that app.js\'s side is checked'));
  // a module in the game folder must boot here, strict or not: one that declines would leave its checks waiting
  // while the run passed (only a module that is not there waits)
  var declining = ['motion', 'sound'].filter(function (name) { return MOD_SRC[name] !== null && STATUS[name] !== 'boots'; });
  check(!declining.length, 'each module in the game folder boots in the stood-in browser', declining.map(function (name) { return MOD_FILES[name] + (STATUS[name] === 'declines' ? ' declines' : ' was not seen to boot (the first look stopped)'); }).join(', ') + ' (a module that is there and does not boot fails, strict or not)');
  var bad = { payload: [], clock: [], page: [], errors: [], viol: [], audio: [], btn: [], anim: [], slot: [], snd: [], after: [] }, slots = 0, sounds = 0, counts = {}, cues = 0, anims = 0, voices = 0;
  PAIRS.forEach(function (p) {
    var b = p.base, k = p.key;
    cues += p.cues; anims += p.anims; voices += p.voices;
    if (p.payloadBad.length) bad.payload.push(k + ': ' + p.payloadBad.join('; '));
    if (p.now !== b.now || p.timers !== b.timers || p.fxNow || p.fxTimers || p.raf) bad.clock.push(k + ': clock ' + p.now + ' / ' + b.now + ', timers ' + p.timers + ' / ' + b.timers + ', by the modules: clock ' + p.fxNow + ', timers ' + p.fxTimers + ', animation frames ' + p.raf);
    if (p.steps.join('\n') !== b.steps.join('\n')) bad.page.push(k + ': ' + (p.firstDiff || firstStep(b.steps, p.steps)));
    if (p.errors.length) bad.errors.push(k + ': ' + p.errors.slice(0, 3).join('; '));
    if (p.violations.length) bad.viol.push(k + ': ' + p.violations.slice(0, 3).join('; '));
    if (p.afterDoneAt !== b.afterDoneAt || p.afterFutures !== b.afterFutures || p.verdictSteps !== b.verdictSteps) bad.after.push(k + ': the Afterwards at rest after ' + p.afterDoneAt + ' ms with ' + p.afterFutures + ' futures counted, the count in ' + p.verdictSteps + ' slices (without the modules: ' + b.afterDoneAt + ', ' + b.afterFutures + ', ' + b.verdictSteps + ')');
    if (p.spec.watch && !(p.afterDoneAt !== null && p.afterDoneAt <= 21000)) bad.after.push(k + ': the Afterwards not at rest by 21 s');
    if (STATUS.sound === 'boots') {
      if (p.ctxBeforeClick !== 0 || p.ctxAfterClick !== 1 || p.ctxs !== 1) bad.audio.push(k + ': AudioContexts ' + p.ctxBeforeClick + ' before the button, ' + p.ctxAfterClick + ' after it, ' + p.ctxs + ' at the end (buttons seen: ' + p.btn.join(' ') + ')');
      if (p.audioEls || p.fetch || p.xhr) bad.audio.push(k + ': with no track, ' + p.audioEls + ' Audio, ' + p.fetch + ' fetch, ' + p.xhr + ' XHR');
      if (p.pressed !== 'true' || p.session !== 'ambient') bad.btn.push(k + ': after the click aria-pressed is ' + p.pressed + ', the audio session ' + p.session);
      p.btnPlaces.forEach(function (x) { if (x !== 'ok') bad.btn.push(k + ': ' + x); });
      sounds += p.sf.counted; p.sf.bad.forEach(function (x) { bad.snd.push(k + ': ' + x); });
      if (p.countLog !== null) (counts[p.spec.place] = counts[p.spec.place] || []).push(p.countLog);
    }
    if (STATUS.motion === 'boots') {
      p.anim.forEach(function (x) { bad.anim.push(k + ': ' + x); });
      slots += p.sl.counted; p.sl.bad.forEach(function (x) { bad.slot.push(k + ': ' + x); });
    }
  });
  function report(list, what) { check(!list.length, what, list.slice(0, 3).join(' | ') + (list.length > 3 ? ' (and ' + (list.length - 3) + ' more)' : '')); }
  report(bad.payload, 'every cue\'s payload is within 6.3 (' + PAIRS.length + ' Lives, ' + cues + ' cues)');
  report(bad.clock, 'the same clock reads and timers as without the modules, none made by them, no animation frame');
  report(bad.page, 'the page and the four maps, minus .fx and the Sound button, as without the modules at every step');
  report(bad.after, 'the Afterwards at rest by 21 s (watched to its end in one Life a size), the count in the same slices');
  report(bad.errors, 'no module throws');
  report(bad.viol, 'no module reads AfterYou or AYApp, nor commits a style');
  if (STATUS.sound === 'boots') {
    report(bad.audio, 'no AudioContext before the Sound button, exactly one after it; with no track no Audio, fetch or XHR');
    report(bad.btn, 'the button: aria-pressed after the click, the audio session ambient, where 4.5 puts it in each view');
    report(bad.snd, 'the reveal sounds an arrival for each hand that came, a thump for each of yours turned back, nothing for a missing act; the season\'s end chimes the page\'s N of 5 (' + sounds + ' read, ' + voices + ' cue voices)');
    var cbad = Object.keys(counts).filter(function (pl) { return counts[pl].some(function (c) { return c !== counts[pl][0]; }); });
    check(!cbad.length && Object.keys(counts).length > 0, 'the count-ready sound is the same for every result (L7)', cbad.length ? cbad.join(', ') : 'no count-ready sound heard');
    try { sectionRegistry(); } catch (e) { fail('the test track run stopped: ' + e); }
  } else wait('sound.js does not boot in the stood-in browser: the AudioContext, the button, the reveal\'s sounds, the count sound and the track registry are not checked');
  if (STATUS.motion === 'boots') {
    report(bad.anim, 'every animation within its cue\'s window (2.2-2.4), finite, no forward fill on the page\'s own nodes (' + anims + ' animations)');
    report(bad.slot, 'the reveal\'s marks on the map and the cards\' glyphs run in their slots (2.4), the same for every outcome (' + slots + ' read)');
  } else wait('motion.js does not boot in the stood-in browser: the windows and the slots of 2.2-2.4 are not checked');
  if (booting) { try { sectionWide(); } catch (e) { fail('the tablet run stopped: ' + e); } }
  if (booting) { try { sectionStillAndQuiet(); } catch (e) { fail('the reduced motion and restore runs stopped: ' + e); } }
  else wait('reduced motion and the quiet restore wait for a module that boots');
  if (booting) { try { sectionMidway(); } catch (e) { fail('the runs turned in the middle of a Life stopped: ' + e); } }
  else wait('what is turned in the middle of a Life waits for a module that boots');
}
function extend(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
function sectionRegistry() {                         // a test track: one relative Audio, after the wait, only with sound on
  var src = MOD_SRC.sound, m = /var TRACKS = \{([\s\S]*?)\n\s*\};/.exec(src || '');
  if (!m || !/valley: null/.test(m[1])) { fail('a test track could not be registered: sound.js has no "valley: null" in "var TRACKS = {" (4.7)'); return; }
  var entry = "valley: { src: 'music/test-track.m4a', gainDb: -16, waitS: [1, 1], fadeInS: 1, fadeOutS: 1, maxS: 4, gapS: [1, 1] }";
  var test = src.slice(0, m.index) + m[0].replace('valley: null', entry) + src.slice(m.index + m[0].length);
  var spec = { place: 'valley', seed: 7, policy: 'send', mods: { motion: MOD_SRC.motion, sound: test }, stubs: true, days: 2 };
  var run = lifeRun(extend(spec, { sound: false }));
  var r = run.rec, before = r.audioEls.length + r.fetch + r.xhr;
  var run2 = lifeRun(extend(spec, { sound: true })), r2 = run2.rec;
  var srcs = r2.audioSrcs.slice();
  check(before === 0 && r2.audioEls.length === 1 && srcs.length >= 1 && srcs.every(function (s) { return /^music\/[a-z0-9-]+\.(mp3|m4a)$/.test(s); }) && !r2.fetch && !r2.xhr,
        'a test track: nothing requested with sound off; with sound on, one Audio with a relative src under music/ after the wait',
        'sound off: ' + before + ' requests; sound on: ' + r2.audioEls.length + ' Audio, srcs ' + JSON.stringify(srcs) + ', fetch ' + r2.fetch + ', XHR ' + r2.xhr);
}
function sectionWide() {                             // in domshim the day map is the compact sheet at 400 and 1280 wide: a tablet's is wide
  var pl = PLACES.indexOf('banks') >= 0 ? 'banks' : PLACES[0], tw = TWINS[pl], run = lifeRun({ place: pl, seed: tw.a.seed, policy: tw.a.policy, w: 800, h: 800, mods: 'files', stubs: true, sound: true });
  var r = run.rec, kinds = r.mapFx.filter(function (m) { return m.id === 'map-day'; }).map(function (m) { return m.kind; }), bad = r.payloadBad.concat(r.errors, r.violations);
  if (STATUS.motion === 'boots') bad = bad.concat(animFaults(run), slotFaults(run).bad);
  if (STATUS.sound === 'boots') bad = bad.concat(soundFaults(run).bad);
  check(kinds.length > 0 && kinds.every(function (k) { return k === 'wide'; }) && !bad.length, pl + ' at 800x800, the day map on the wide sheet: the payloads, the windows, the slots and the sounds as above',
        kinds.length && kinds[0] !== 'wide' ? 'the day map was drawn on the ' + kinds[0] + ' sheet' : bad.slice(0, 3).join(' | '));
}
function stillFaults(mods) {                         // a whole Life under reduced motion: no animate call, and the sound as ever
  var run = lifeRun({ place: 'banks', seed: 12, policy: 'short', w: 1280, h: 800, still: true, mods: mods, stubs: true, sound: true }), r = run.rec, out = { anims: [], sound: [], voices: 0, count: false };
  if (r.animCalls || r.errors.length) out.anims.push(r.animCalls + ' animate calls' + (r.errors.length ? '; ' + r.errors[0] : ''));
  if (STATUS.sound !== 'boots') return out;
  // the reveal's own voices (the bed, its one-shots and the waits start with the button whatever the cues do), each
  // reveal heard as 4.3 has it, and the count-ready sound as in the moving Lives of the same place
  var sf = soundFaults(run).bad, cl = countLog(run), moving = PAIRS.filter(function (p) { return p.spec.place === 'banks' && p.countLog !== null; })[0];
  out.voices = r.voices.filter(function (v) { return v.inCue && v.cue === 'reveal'; }).length;
  if (r.ctxs !== 1) out.sound.push(r.ctxs + ' AudioContexts');
  if (!out.voices) out.sound.push('no voice in any reveal');
  sf.forEach(function (x) { out.sound.push(x); });
  out.count = !!moving;
  if (moving && cl !== moving.countLog) out.sound.push('the count-ready sound differs from the moving Lives\' (' + short(cl, 60) + ' / ' + short(moving.countLog, 60) + ')');
  return out;
}
// the restores: a Life rebuilt from a snapshot into a day, Leaving and the Afterwards (the Opening's map, cue 0, is drawn
// before restore(); a hot run processes what is due once, so the later count is not among the cues)
var HOT_DAYS = [[true, true, true, true], [true, false, true, true], [false, true, true, true], [true, true, true, true], [true, true, false, true]];
var HOT_LIFE = HOT_DAYS.concat(HOT_DAYS, HOT_DAYS.slice(0, 2));                         // twelve days of choices
var RESTORES = [['day 6 of a Life', 'day', 6, { place: 'watch', seed: 3, choices: HOT_DAYS, pending: { 1: true }, view: 'day', phase: 'choose', mapFolded: false }],
                ['Leaving', 'leaving', null, { place: 'watch', seed: 3, choices: HOT_LIFE, view: 'leaving', phase: 'revealed', mapFolded: false }],
                ['the Afterwards', 'afterwards', null, { place: 'banks', seed: 12, choices: HOT_LIFE, view: 'afterwards', phase: 'revealed', mapFolded: false }]];
function restoreFaults(app) {                        // each restore: [what, its faults ('' when it is set straight down)]
  return RESTORES.map(function (rs) {
    var hot = rs[3], q = lifeRun({ place: hot.place, seed: hot.seed, mods: 'files', stubs: true, hot: hot, w: 1280, h: 800, app: app }), r = q.rec, bad = [];
    var noisy = r.cues.slice(1).filter(function (c) { return !/~$/.test(c); }), trans = r.anims.filter(function (a) { return a.it <= 1; });
    if (q.S.view !== rs[1] || (rs[2] !== null && !(q.S.today && q.S.today.day === rs[2]))) bad.push('view ' + q.S.view + (q.S.today ? ', day ' + q.S.today.day : ''));
    if (!/^map~?$/.test(r.cues[0] || '')) bad.push(r.cues.length ? 'the first cue is ' + r.cues[0] + ', not the Opening\'s map' : 'no cue at all');
    if (noisy.length) bad.push('not quiet: ' + noisy.join(' ') + ' (of ' + r.cues.join(' ') + ')');
    if (trans.length) bad.push(trans.length + ' transients');
    if (r.voices.length) bad.push(r.voices.length + ' voices');
    if (r.errors.length) bad.push(r.errors[0]);
    return [rs[0], bad.join(', ')];
  });
}
function sectionStillAndQuiet() {
  var sf = stillFaults('files');
  check(!sf.anims.length, 'reduced motion: a whole Life with no animate call', sf.anims.join('; '));
  if (STATUS.sound === 'boots') check(!sf.sound.length, 'reduced motion leaves the sound alone: one AudioContext, every reveal heard as 4.3 has it (' + sf.voices + ' reveal voices)' + (sf.count ? ', the count-ready sound as in the moving Lives' : ''),
                                      sf.sound.slice(0, 3).join(' | '));
  restoreFaults().forEach(function (x) { check(!x[1], 'a restore into ' + x[0] + ' is set straight down: every cue after the Opening\'s map quiet, no transient, no sound', x[1]); });
}

// ---- turned in the middle of a Life: reduced motion, a hidden page, a second Life, a reveal over a one-shot, a
// track refused ------------------------------------------------------------------------------------------------
function tap(run, id) { run.g.document.getElementById(id).click(); processDue(run.g, run.rec); }
function sendAll(run) {
  var doc = run.g.document;
  run.S.today.neighbours.forEach(function (n) { var a = doc.getElementById('choice-' + n.id + '-send'); a.checked = true; a.dispatch('change'); processDue(run.g, run.rec); step(run, 150); });
}
function running(rec, loops) { return rec.anims.filter(function (r) { return r.anim.playState === 'running' && (!loops || r.it > 1); }).length; }
function fireDoc(run, type, target) {                // the document's listeners told of an event, as a browser tells them
  var ev = { type: type, target: target || run.g.document.body };
  run.rec.docFns.forEach(function (l) { if (l.t === type) { try { l.fn.call(run.g.document, ev); } catch (e) { run.rec.errors.push('a document listener threw: ' + e); } } });
}
function setHidden(run, v) { run.rec.hidden = !!v; fireDoc(run, 'visibilitychange', run.g.document); }
function seeded(g, s) {                              // the realm's Math.random a fixed sequence (the one-shots and a new Life's seed draw from it)
  g.Math.random = function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
function playLife(run, at) {                         // a Life sending every hand, the Afterwards skipped, to the Chronicle; at.<moment>(day) tries something there
  var S = run.S, d, guard = 0;
  processDue(run.g, run.rec); if (at.opening) at.opening(); tap(run, 'begin');
  for (d = 1; d <= 12; d++) {
    step(run, 300); sendAll(run); step(run, 300); tap(run, 'close-day');
    if (at.closed) at.closed(d);
    step(run, 1200);
    if (at.rest) at.rest(d);
    tap(run, 'next-day');
    if (at.next) at.next(d);
    if (S.view === 'day' && S.phase === 'season') { step(run, 1200); tap(run, 'next-day'); }
  }
  step(run, 1200); tap(run, 'leave');
  if (at.after) at.after();
  step(run, 700); if (!S.after.done) tap(run, 'skip');
  while (!S.verdict) { step(run, 50); if (++guard > 4000) throw new Error('playLife: the count never finished'); }
  step(run, 400); tap(run, 'to-chronicle'); step(run, 1200);
  if (at.chronicle) at.chronicle();
}
// reduced motion turned on in a Life (the stand-in's media change) 100 ms into day 2's reveal, on day 3 at rest with
// its loops, and 2 s into the Afterwards' light arc, each time turned off again; with sound on, what sound.js does
// with the still cue
function midStill(mods, app) {
  var out = { cues: 0, reveal: [], rest: [], back: null, arc: [], light: [], made: 0, heard: 0, moved: [], bad: [] };
  var run = lifeRun({ place: 'valley', seed: 5, w: 1280, h: 800, mods: mods, stubs: true, app: app, drive: function (run) {
    var g = run.g, rec = run.rec, S = run.S, snd = g.AYSound;
    seeded(g, 5);
    function still(on) { g.shim.setView(1280, 800, on); processDue(g, rec); }
    function snap() { var s = snd._test.state(); if (s) delete s.button; return [stable(s), rec.voices.length, rec.paramMoves, rec.nodeSeq]; }
    function moved(a, b) { return ['its state', ' voices', ' parameter moves', ' nodes'].map(function (w, i) { return a[i] === b[i] ? '' : i ? (b[i] - a[i]) + w : w; }).filter(String).join(', '); }
    function light() { var m = g.document.getElementById('map-after'), c = m.querySelector('.fx-cool'), k = m.querySelector('.fx-dusk'); return 'cool ' + (c ? c.getAttribute('opacity') : '-') + ', dusk ' + (k ? k.getAttribute('opacity') : '-'); }
    if (snd && typeof snd.cue === 'function' && snd._test && typeof snd._test.state === 'function') {
      var sc = snd.cue;                              // the still cue as sound.js hears it: nothing may move
      snd.cue = function (n) { if (n !== 'still') return sc.apply(this, arguments); var a = snap(), r = sc.apply(this, arguments), m = moved(a, snap()); out.heard++; if (m && out.moved.length < 3) out.moved.push('the still cue on day ' + S.today.day + ' moved ' + m); return r; };
    }
    playLife(run, {
      opening: function () { clickSound(run, 'opening'); },
      closed: function (d) { if (d !== 2) return; step(run, 100); out.reveal.push(running(rec)); still(true); out.reveal.push(running(rec)); still(false); },
      rest: function (d) {
        if (d !== 3) return;
        step(run, 1500); out.rest.push(running(rec, true));
        var a0 = rec.animCalls; still(true); out.rest.push(running(rec)); step(run, 2000); out.rest.push(running(rec)); out.made += rec.animCalls - a0; still(false);
      },
      next: function (d) { if (d === 3) out.back = running(rec, true); },
      after: function () {
        step(run, 2000); out.arc.push(rec.anims.filter(function (r) { return r.dur === 19800 && r.anim.playState === 'running'; }).length);
        var a0 = rec.animCalls, i; still(true); out.arc.push(running(rec)); out.light.push(light());
        for (i = 0; i < 220 && !S.after.done; i++) step(run, 100);
        out.light.push(light()); out.made += rec.animCalls - a0; still(false);
      }
    });
  } }), rec = run.rec;
  out.cues = rec.cues.filter(function (c) { return /^still/.test(c); }).length;
  if (out.cues !== 3) out.bad.push(out.cues + ' still cues for 3 turns');
  if (!(out.reveal[0] > 0) || out.reveal[1] !== 0) out.bad.push('100 ms into day 2\'s reveal ' + out.reveal[0] + ' running, ' + out.reveal[1] + ' once reduced motion is on');
  if (!(out.rest[0] > 0) || out.rest[1] !== 0 || out.rest[2] !== 0) out.bad.push('day 3 at rest ' + out.rest[0] + ' loops, ' + out.rest[1] + ' running once reduced motion is on, ' + out.rest[2] + ' 2 s later');
  if (!(out.back > 0)) out.bad.push('turned off again: ' + out.back + ' loops at the next cue');
  if (!(out.arc[0] > 0) || out.arc[1] !== 0) out.bad.push('the Afterwards ' + out.arc[0] + ' arc animations, ' + out.arc[1] + ' running once reduced motion is on');
  if (out.light[0] !== out.light[1]) out.bad.push('the Afterwards\' light ' + out.light[0] + ' once reduced motion is on, ' + out.light[1] + ' at its rest');
  if (out.made) out.bad.push(out.made + ' animate calls while reduced motion held');
  rec.payloadBad.concat(rec.errors).slice(0, 2).forEach(function (x) { out.bad.push(x); });
  return out;
}
// the first reveal's finish held back 2 s (no frame meanwhile): by a hidden page, which is not judged, or by a page
// in front, which is
function hiddenDowngrade(mods, hide) {
  var out = {};
  lifeRun({ place: 'valley', seed: 7, w: 1280, h: 800, mods: mods, stubs: true, drive: function (run) {
    var g = run.g, rec = run.rec;
    processDue(g, rec); step(run, 500); tap(run, 'begin'); step(run, 400); sendAll(run); step(run, 300);
    tap(run, 'close-day'); step(run, 100);
    if (hide) setHidden(run, true);
    out.away = running(rec, true);
    g.shim.advance(2000);
    if (hide) setHidden(run, false);
    processDue(g, rec); step(run, 1500); tap(run, 'next-day'); step(run, 500);
    out.day2 = running(rec, true); out.errors = rec.errors.slice(0, 2);
  } });
  return out;
}
// after the Afterwards, a second Life ('again'): its day 1 light moves from the light the Afterwards rests on
function againLight(mods) {
  var out = { rest: null, moves: [], view: null };
  lifeRun({ place: 'valley', seed: 5, w: 1280, h: 800, mods: mods, stubs: true, drive: function (run) {
    var g = run.g, rec = run.rec;
    seeded(g, 11);
    playLife(run, { chronicle: function () {
      var m = g.document.getElementById('map-after'), at = {}, a0 = rec.anims.length;
      ['fx-cool', 'fx-dusk'].forEach(function (c) { var n = m.querySelector('.' + c); at[c] = n ? Number(n.getAttribute('opacity')) : null; });
      out.rest = at;
      tap(run, 'again');
      rec.anims.slice(a0).forEach(function (r) {
        var k = /(^|\s)(fx-cool|fx-dusk)(\s|$)/.exec((r.el.attrs && r.el.attrs['class']) || '');
        if (r.cue === 'day' && k) out.moves.push({ c: k[2], from: Number(r.kf[0].opacity), rest: at[k[2]] });
      });
      out.view = run.S.view + ' ' + (run.S.today ? run.S.today.day : '');
    } });
  } });
  out.bad = out.moves.filter(function (x) { return !(Math.abs(x.from - x.rest) < 1e-9); }).map(function (x) { return '.' + x.c + ' from ' + x.from + ' (the Afterwards rests at ' + x.rest + ')'; });
  if (out.view !== 'day 1') out.bad.push('not on day 1 (' + out.view + ')');
  if (!out.moves.length) out.bad.push('no light moved on day 1');
  return out;
}
// a bed one-shot (the Saltmarket's steps) sounding when a reveal comes: released within the reveal's hold-off
function shotFaults(mods) {
  var out = { bad: [], srcs: 0 };
  lifeRun({ place: 'saltmarket', seed: 4, w: 1280, h: 800, mods: mods, stubs: true, drive: function (run) {
    var g = run.g, rec = run.rec, LOG, guard = 0, v0, shot = null, c0, srcs, gains = [];
    function isBed(e) { return e.cue === 'bed'; }
    seeded(g, 7);
    processDue(g, rec); clickSound(run, 'opening');
    LOG = g.AYSound._test.record(true);
    tap(run, 'begin'); step(run, 300); sendAll(run);
    while (!shot && guard++ < 6000) { v0 = rec.voices.length; step(run, 10); shot = LOG.filter(isBed)[0] || null; }
    if (!shot) { out.bad.push('no one-shot in 60 s'); return; }
    srcs = rec.voices.slice(v0).filter(function (v) { return v.kind !== 'constant' && v.at >= shot.at - 1e-9; }).map(function (v) { return v.node; });
    srcs.forEach(function (s) { (function walk(n) { (n._out || []).forEach(function (o) { if (!o || o._name) return; if (o.type === 'gain') { if (gains.indexOf(o) < 0) gains.push(o); } else if (o.type === 'biquad') walk(o); }); })(s); });
    step(run, 150); tap(run, 'close-day');
    c0 = (rec.cueLog.reveal || [{ ctxT: rec.ctx.currentTime }])[0].ctxT;        // the reveal's moment on the audio clock
    out.srcs = srcs.length;
    if (!srcs.length || !gains.length) { out.bad.push('the one-shot\'s sources or gains not found'); return; }
    var late = srcs.filter(function (s) { return !(s._stop <= c0 + 0.02 + 1e-6); }), loud = gains.filter(function (gn) { var e = gn.gain._ev[gn.gain._ev.length - 1]; return !(e && /^linearRamp/.test(e[0]) && e[1] === 0 && e[2] <= c0 + 0.015 + 1e-6); });
    if (late.length) out.bad.push(late.length + ' of its ' + srcs.length + ' sources stop ' + Math.round((Math.max.apply(null, late.map(function (s) { return s._stop; })) - c0) * 1000) + ' ms after the reveal (20 ms at most)');
    if (loud.length) out.bad.push(loud.length + ' of its ' + gains.length + ' gains not at 0 by 15 ms after the reveal');
    rec.errors.slice(0, 1).forEach(function (x) { out.bad.push(x); });
  } });
  return out;
}
// a track (a test entry, as sectionRegistry's) whose first play() is refused for want of a tap (NotAllowedError)
function refusedFaults(soundSrc) {
  var m = /var TRACKS = \{([\s\S]*?)\n\s*\};/.exec(soundSrc || ''), out = { bad: [] };
  if (!m || !/valley: null/.test(m[1])) { out.bad.push('no "valley: null" in sound.js\'s "var TRACKS = {" to register a test track'); return out; }
  var entry = "valley: { src: 'music/test-track.m4a', gainDb: -16, waitS: [1, 1], fadeInS: 1, fadeOutS: 1, maxS: 4, gapS: [1, 1] }";
  var test = soundSrc.slice(0, m.index) + m[0].replace('valley: null', entry) + soundSrc.slice(m.index + m[0].length);
  lifeRun({ place: 'valley', seed: 7, w: 1280, h: 800, mods: { motion: MOD_SRC.motion, sound: test }, stubs: true, drive: function (run) {
    var g = run.g, rec = run.rec, A0 = g.Audio, refuse = 1, el = null, X = g.AYSound._test, s;
    seeded(g, 3);
    g.Audio = function (src) {
      var e = A0(src), play = e.play;
      e.plays = 0; el = e;
      e.play = function () { e.plays++; if (refuse > 0) { refuse--; var x = new Error('the stand-in refuses play() without a tap'); x.name = 'NotAllowedError'; return Promise.reject(x); } return play.call(e); };
      return e;
    };
    function at(what, plays, music) {
      s = X.state();
      if (!el || el.plays !== plays || s.music !== music || s.musicDead) out.bad.push(what + ': ' + (el ? el.plays : 0) + ' plays, music ' + s.music + (s.musicDead ? ', ended for the session' : ''));
    }
    processDue(g, rec); clickSound(run, 'opening'); step(run, 3000);
    at('refused', 1, 'held');
    tap(run, 'begin'); step(run, 3000);
    at('no tap since', 1, 'held');
    fireDoc(run, 'click', g.document.body); processDue(g, rec);
    at('the next click', 2, 'play');
    if (el && el.paused) out.bad.push('the next click: the element still paused');
    rec.errors.slice(0, 1).forEach(function (x) { out.bad.push(x); });
  } });
  return out;
}
// with sound on, the page hidden, shown and hidden again 100 ms apart: the first hide's wait suspends nothing, so
// the second hide's fade runs its whole 0.25 s before the one suspend
function hideShowHide(soundSrc) {
  var out = { bad: [], suspends: [] };
  lifeRun({ place: 'valley', seed: 5, w: 1280, h: 800, mods: { motion: MOD_SRC.motion, sound: soundSrc }, stubs: true, drive: function (run) {
    var g = run.g, rec = run.rec, c, sus, t2, early;
    seeded(g, 5);
    processDue(g, rec); clickSound(run, 'opening'); step(run, 1000);
    c = rec.ctx;
    if (!c) { out.bad.push('no AudioContext after the button'); return; }
    sus = c.suspend; c.suspend = function () { out.suspends.push(g.shim.clock); return sus.apply(this, arguments); };
    setHidden(run, true); processDue(g, rec); step(run, 100);
    setHidden(run, false); processDue(g, rec); step(run, 100);
    t2 = g.shim.clock; setHidden(run, true); processDue(g, rec); step(run, 1000);
    early = out.suspends.filter(function (t) { return t < t2 + 250; });
    if (early.length) out.bad.push('suspended ' + Math.round(early[0] - t2) + ' ms after the second hide, before its 0.25 s fade ends');
    if (out.suspends.length !== 1) out.bad.push(out.suspends.length + ' suspends for the last hide (1 wanted)');
    setHidden(run, false); processDue(g, rec);
    rec.errors.slice(0, 1).forEach(function (x) { out.bad.push(x); });
  } });
  return out;
}
// the memory option switched on in a copy (ARM_FROM_MEMORY) with 'on' kept: a first press on the Sound button (its
// pointerdown and click seen by the document first, then the button's own click) ends with sound on and 'on' kept;
// a first press elsewhere starts sound in its click, not its pointerdown (on a touch screen only the click counts as a
// gesture)
function armFaults(soundSrc) {
  var out = { bad: [] }, from = 'var ARM_FROM_MEMORY = false;', armed = soundSrc && soundSrc.indexOf(from) >= 0 ? soundSrc.replace(from, 'var ARM_FROM_MEMORY = true;') : null;
  if (armed === null) { out.bad.push('no "' + from + '" in sound.js to switch on'); return out; }
  ['on the Sound button', 'elsewhere'].forEach(function (where) {
    lifeRun({ place: 'valley', seed: 5, w: 1280, h: 800, mods: { motion: MOD_SRC.motion, sound: armed }, stubs: true, store: { 'after-you.sound.v1': 'on' }, drive: function (run) {
      var g = run.g, rec = run.rec, doc = g.document, btn = doc.querySelector('.sound-btn'), target = where === 'elsewhere' ? doc.body : btn, s, kept;
      processDue(g, rec);
      if (!btn) { out.bad.push(where + ': no Sound button'); return; }
      fireDoc(run, 'pointerdown', target); processDue(g, rec);
      if (where === 'elsewhere' && rec.ctxs) out.bad.push('a first press elsewhere: sound started at its pointerdown, not its click');
      fireDoc(run, 'click', target); processDue(g, rec);
      if (where !== 'elsewhere') { btn.click(); processDue(g, rec); }
      s = g.AYSound._test.state(); kept = g.shim.store['after-you.sound.v1'];
      if (!s || !s.on || btn.getAttribute('aria-pressed') !== 'true' || kept !== 'on' || rec.ctxs !== 1)
        out.bad.push('a first press ' + where + ': sound ' + (s && s.on ? 'on' : 'off') + ', ' + rec.ctxs + ' AudioContexts, "' + kept + '" kept');
      rec.errors.slice(0, 1).forEach(function (x) { out.bad.push(x); });
    } });
  });
  return out;
}
// a track (a test entry) whose play() is still pending when the page's own pause() comes (here a hidden page; Sound
// off and the Afterwards pause it too) is rejected with AbortError: not a media error, so the music is not ended and
// plays again when the page is shown
function abortFaults(soundSrc) {
  var m = /var TRACKS = \{([\s\S]*?)\n\s*\};/.exec(soundSrc || ''), out = { bad: [] };
  if (!m || !/valley: null/.test(m[1])) { out.bad.push('no "valley: null" in sound.js\'s "var TRACKS = {" to register a test track'); return out; }
  var entry = "valley: { src: 'music/test-track.m4a', gainDb: -16, waitS: [1, 1], fadeInS: 1, fadeOutS: 1, maxS: 4, gapS: [1, 1] }";
  var test = soundSrc.slice(0, m.index) + m[0].replace('valley: null', entry) + soundSrc.slice(m.index + m[0].length);
  lifeRun({ place: 'valley', seed: 7, w: 1280, h: 800, mods: { motion: MOD_SRC.motion, sound: test }, stubs: true, drive: function (run) {
    var g = run.g, rec = run.rec, A0 = g.Audio, el = null, aborted = 0, X = g.AYSound._test, s;
    seeded(g, 3);
    g.Audio = function (src) {
      var e = A0(src), play = e.play, pause = e.pause, pend = null;
      e.plays = 0; el = e;
      e.play = function () { e.plays++; var p = play.call(e); if (e.plays > 1) return p; return new Promise(function (res, rej) { pend = rej; }); };
      e.pause = function () { pause.call(e); if (pend) { var f = pend, x = new Error('the stand-in: play() interrupted by pause()'); pend = null; x.name = 'AbortError'; aborted++; f(x); } };
      return e;
    };
    processDue(g, rec); clickSound(run, 'opening'); step(run, 2000);
    if (!el || el.plays !== 1) { out.bad.push('the track not started (' + (el ? el.plays : 0) + ' plays)'); return; }
    setHidden(run, true); processDue(g, rec); step(run, 600);
    s = X.state();
    if (!aborted) out.bad.push('the hidden page did not pause the pending play()');
    if (s.musicDead) out.bad.push('play() interrupted by the page\'s own pause(): music ended for the session');
    setHidden(run, false); processDue(g, rec); step(run, 300);
    s = X.state();
    if (el.plays !== 2 || s.music !== 'play' || s.musicDead) out.bad.push('shown again: ' + el.plays + ' plays, music ' + s.music + (s.musicDead ? ', ended for the session' : ''));
    rec.errors.slice(0, 1).forEach(function (x) { out.bad.push(x); });
  } });
  return out;
}
function sectionMidway() {
  if (STATUS.motion === 'boots') {
    var ms = midStill('files');
    check(!ms.bad.length, 'reduced motion turned on mid-Life (the media change): a still cue each time; nothing runs from then on, 100 ms into a reveal, the loops at rest, the Afterwards\' light arc (set at the light it rests on); the loops back at the next cue once it is off', ms.bad.slice(0, 3).join(' | '));
    if (STATUS.sound === 'boots') check(ms.heard === 3 && !ms.moved.length, 'the still cue moves nothing in sound.js, sound on: no voice, node or parameter, the same state (' + ms.heard + ' heard)', ms.heard !== 3 ? ms.heard + ' still cues heard for 3 turns' : ms.moved[0]);
    var hd = hiddenDowngrade('files', true), sl = hiddenDowngrade('files', false);
    check(hd.away === 0 && hd.day2 > 0 && sl.day2 === 0 && !hd.errors.length && !sl.errors.length,
          'the first reveal\'s finish 2 s late: with the page hidden meanwhile no loop runs while hidden and the loops still run on day 2 (' + hd.day2 + '); with the page in front they are turned off',
          'hidden: ' + hd.away + ' loops while hidden, ' + hd.day2 + ' on day 2; in front: ' + sl.day2 + ' on day 2' + (hd.errors.concat(sl.errors).length ? '; ' + hd.errors.concat(sl.errors)[0] : ''));
    var al = againLight('files');
    check(!al.bad.length, 'after the Afterwards, a second Life\'s day 1 light moves from the light the Afterwards rests on (' + al.moves.length + ' moves)', al.bad.slice(0, 3).join(' | '));
  } else wait('motion.js does not boot in the stood-in browser: reduced motion turned on mid-Life, the hidden page and the second Life\'s light are not checked');
  if (STATUS.sound === 'boots') {
    var sh = shotFaults('files');
    check(!sh.bad.length, 'a bed one-shot sounding when a reveal comes is released: its sources stopped by 20 ms, its gains at 0 by 15 ms (the Saltmarket\'s steps, day 1)', sh.bad.slice(0, 3).join(' | '));
    var rf = refusedFaults(MOD_SRC.sound);
    check(!rf.bad.length, 'a track whose play() is refused for want of a tap (NotAllowedError) is held, not ended: no play again until the next click, which plays it', rf.bad.slice(0, 3).join(' | '));
    var ab = abortFaults(MOD_SRC.sound);
    check(!ab.bad.length, 'a track whose pending play() is cut short by the page\'s own pause() (AbortError, a hidden page) is not ended: it plays again when the page is shown', ab.bad.slice(0, 3).join(' | '));
    var hs = hideShowHide(MOD_SRC.sound);
    check(!hs.bad.length, 'the page hidden, shown and hidden again 100 ms apart, sound on: one suspend, after the last hide\'s 0.25 s fade', hs.bad.slice(0, 3).join(' | '));
    var ar = armFaults(MOD_SRC.sound);
    check(!ar.bad.length, 'the memory option switched on in a copy, "on" kept: a first press on the Sound button leaves sound on and "on" kept; a first press elsewhere starts sound in its click, not its pointerdown', ar.bad.slice(0, 3).join(' | '));
  } else wait('sound.js does not boot in the stood-in browser: the one-shot cut by a reveal, the refused and the interrupted track, the hidden page\'s fade and the memory option are not checked');
}

// 4. twins
function sectionTwins() {
  begin(4, 'twins: a missing act sorted into luck or choice by this check alone, and the two Lives\' logs compared');
  PLACES.forEach(function (pl) {
    var tw = TWINS[pl];
    note(pl + ': day ' + tw.day + ', ' + tw.a.policy + ' ' + tw.a.seed + ' (' + tw.a.cause + ') and ' + tw.b.policy + ' ' + tw.b.seed + ' (' + tw.b.cause + '): ' + laneWords(tw) + ' (L luck, C choice, - a hand came)');
  });
  check(SORTED.wrong === 0 && SORTED.luck > 0 && SORTED.choice > 0, 'this check\'s sorting agrees with the engine on every lane it sorted (' + SORTED.lanes + ' lanes: ' + SORTED.luck + ' missing acts luck, ' + SORTED.choice + ' a choice)',
        SORTED.wrong + ' lanes where the engine\'s hand and the sorting part (engine.js:980-987 has moved?)');
  var booting = STATUS.motion === 'boots' || STATUS.sound === 'boots', same = 0, lines = 0, payloadsOk = true;
  PLACES.forEach(function (pl) {
    SIZES.forEach(function (sz) {
      var pair = PAIRS.filter(function (p) { return p.spec.place === pl && p.spec.w === sz[0]; }), tag = pl + ' ' + sz.join('x') + ' day ' + TWINS[pl].day;
      if (pair.length !== 2) { fail(tag + ': the twin Lives did not both run'); payloadsOk = false; return; }
      var a = pair[0], b = pair[1];
      if (a.revealPayload === null || a.revealPayload !== b.revealPayload) { fail(tag + ': the two reveals were not handed the same payload', short(a.revealPayload) + ' / ' + short(b.revealPayload)); payloadsOk = false; return; }
      if (!booting) return;
      var la = a.revealLog || '', lb = b.revealLog || '', j = 0;
      if (la !== lb) { while (j < la.length && la[j] === lb[j]) j++; fail(tag + ': ' + laneWords(TWINS[pl]) + ': the motion and sound logs part at character ' + j, '"' + short(la.slice(j, j + 140), 140) + '" / "' + short(lb.slice(j, j + 140), 140) + '"'); return; }
      same++; lines += la.split('\n').length;
      pass(tag + ': ' + laneWords(TWINS[pl]) + ': the motion and sound logs are byte-identical (' + la.split('\n').length + ' lines, ' + la.length + ' characters)');
    });
  });
  if (payloadsOk) pass('the twin Lives were handed the same reveal payload in every place and size' + (booting ? '' : ' (a listener stood in)'));
  if (!booting) wait('no module boots in the stood-in browser: the twins\' motion and sound logs are empty, nothing to compare');
  else if (lines <= same * 2) wait('the twins\' logs hold almost nothing (' + lines + ' lines in ' + same + ' pairs): the modules drew and sounded next to nothing in those reveals');
}

// 5. calendar
function sectionCalendar() {
  begin(5, 'calendar: the drawn light and weather follow the calendar alone; .fx-wx in the far band; lightFor');
  if (STATUS.motion !== 'boots') { wait('motion.js does not boot in the stood-in browser: the drawn light and weather, .fx-wx and lightFor are not checked'); return; }
  var byKey = {}, clash = [], wxBad = [], nwx = 0, groupsBad = [];
  PAIRS.forEach(function (p) {
    p.mapFx.forEach(function (m) {
      if (m.id === 'map-after') return;               // the Afterwards inks the ties by your ways: not the calendar
      var k = m.key;
      if (byKey[k] === undefined) byKey[k] = { fx: m.fx, who: p.key };
      else if (byKey[k].fx !== m.fx && byKey[k].who.split(' ').slice(2).join(' ') !== p.key.split(' ').slice(2).join(' ') && clash.length < 4) clash.push(k + ' (' + byKey[k].who + ' / ' + p.key + ')');
    });
    p.wxBad.forEach(function (x) { if (wxBad.length < 6) wxBad.push(p.key + ' ' + x); });
    p.groupsBad.forEach(function (x) { if (groupsBad.length < 6) groupsBad.push(p.key + ' ' + x); });
    nwx += p.nwx;
  });
  check(!clash.length, 'each map\'s drawn light and weather are the same for every seed at the same place, map, sheet, crop, day and phase (' + Object.keys(byKey).length + ' dressings)', clash.join(' | '));
  check(!groupsBad.length, 'the fx groups: fx-air and fx-go, of the class fx, aria-hidden, nothing focusable, fx-air under the holdings, fx-go under the lettering', groupsBad.slice(0, 3).join(' | '));
  check(!wxBad.length && nwx > 0, 'every .fx-wx lies at y <= 0.36 H and clear of every holding, its bound and 4 units (' + nwx + ' read)', nwx ? wxBad.slice(0, 3).join(' | ') : 'no .fx-wx drawn at all');
  // lightFor (2.5), the module's own planner
  var g = runString('this'); g.load('motion.js');
  var lf = g.AYMotion && g.AYMotion._test && g.AYMotion._test.lightFor;
  if (typeof lf !== 'function') { fail('AYMotion._test.lightFor is missing (6.1)'); return; }
  var bad = [], rows = 0;
  function near(a, b) { return typeof a === 'number' && Math.abs(a - b) < 1e-9; }
  function want(pl, view, day, phase, cool, dusk, mist) {
    var v; rows++;
    try { v = lf(pl, view, day, phase); } catch (e) { if (bad.length < 4) bad.push(pl + ' ' + view + ' ' + day + ' ' + phase + ': threw ' + e); return; }
    if (!v || !near(v.cool, cool) || !near(v.dusk, dusk) || !near(v.mist, mist)) { if (bad.length < 4) bad.push('lightFor(' + [pl, view, day, phase].join(', ') + ') = ' + stable(v) + ' (2.5: cool ' + cool + ', dusk ' + dusk + ', mist ' + mist + ')'); }
  }
  var MORN = { cool: [0.10, 0.06, 0.03, 0.02], mist: [0.45, 0.20, 0.15, 0.25] };
  PLACES.forEach(function (pl) {
    var border = pl === 'watch', d;
    want(pl, 'opening', null, null, 0.04, 0, border ? 0.20 : 0.25);
    for (d = 1; d <= 12; d++) {
      var s = Math.ceil(d / 4), dd = (d - 1) % 4;
      want(pl, 'day', d, 'choose', MORN.cool[dd], 0, border ? 0.20 : MORN.mist[dd]);
      want(pl, 'day', d, 'revealed', 0.02, border ? 0.04 : [0.04, 0.05, 0.06][s - 1], border ? 0.20 : MORN.mist[dd] / 2);
      if (dd === 3) want(pl, 'day', d, 'season', 0, border ? 0.08 : [0.08, 0.10, 0.12][s - 1], border ? 0.20 : 0.30);
    }
    want(pl, 'leaving', null, null, 0.03, border ? 0.08 : 0.14, border ? 0.20 : 0.35);
  });
  check(!bad.length, 'lightFor(place, view, day, phase) gives the table of 2.5 for every place (' + rows + ' rows): the Border\'s dusk and mist the same every day', bad.join(' | '));
  // and nothing the page holds moves it: the same answers inside a page in the middle of a Life
  var g1 = runString('this');                         // the page's scripts but no page and no Life
  SCRIPTS.forEach(function (s) { if (s !== 'app.js') g1.load(s); });
  lf = g1.AYMotion._test.lightFor;
  var wf = g1.AYMotion._test.weatherFor, run = lifeRun({ place: 'bridges', seed: 31, policy: 'send', mods: 'files', stubs: true, days: 6 }), pg = run.g.AYMotion && run.g.AYMotion._test;
  var diff = [];
  PLACES.forEach(function (pl) {
    [['day', 3, 'choose'], ['day', 9, 'revealed'], ['day', 12, 'season'], ['leaving', null, null]].forEach(function (a) {
      var x, y, u, v;
      try { x = stable(lf(pl, a[0], a[1], a[2])); y = stable(pg.lightFor(pl, a[0], a[1], a[2])); } catch (e) { x = 'threw ' + e; y = ''; }
      if (x !== y && diff.length < 3) diff.push('lightFor ' + pl + ' ' + a.join(' ') + ': ' + x + ' / ' + y);
      if (typeof wf === 'function') {
        try { u = stable(wf(pl, a[0], a[1], a[2])); v = stable(pg.weatherFor(pl, a[0], a[1], a[2])); } catch (e) { u = 'threw ' + e; v = ''; }
        if (u !== v && diff.length < 3) diff.push('weatherFor ' + pl + ' ' + a.join(' ') + ': ' + short(u, 60) + ' / ' + short(v, 60));
      }
    });
  });
  check(!diff.length, 'lightFor and weatherFor answer the same with the page\'s scripts and no Life as inside a page in the middle of a Life (they read no seed, no result)', diff.join(' | '));
}

// 6. geometry
function sectionGeometry() {
  begin(6, 'geometry: AYSheet.lanes and lane against every drawn hand, lost hand, Stay and plan');
  var g = runString('this');
  SCRIPTS.forEach(function (s) { if (s !== 'app.js' && s !== 'motion.js' && s !== 'sound.js') g.load(s); });
  var S = g.AYSheet, P = g.AYPlaces, NAMES = ['Ada', 'Bramwell', 'Coe', 'Dunstan', 'Ede', 'Fenn', 'Fairweather-Lyle', 'Hob'], bad = [], n = 0;
  if (typeof S.lanes !== 'function' || typeof S.lane !== 'function') { fail('AYSheet.lanes or AYSheet.lane is missing (6.4)'); return; }
  function paths(svg, cls) { var re = new RegExp('<path class="' + cls + '" d="([^"]*)"', 'g'), m, out = []; while ((m = re.exec(svg))) out.push(m[1]); return out; }
  function heads(svg) { var re = /<path class="m-hand-head" d="M([-0-9.]+) ([-0-9.]+)L/g, m, out = []; while ((m = re.exec(svg))) out.push(m[1] + ' ' + m[2]); return out; }
  function same(a, b, what) { n++; var x = a.slice().sort().join('|'), y = b.slice().sort().join('|'); if (x !== y && bad.length < 6) bad.push(what + ': drawn ' + short(x, 70) + ', lanes ' + short(y, 70)); }
  function tip(pts) { return S.f(pts[pts.length - 1][0]) + ' ' + S.f(pts[pts.length - 1][1]); }
  // sheet-probe's own made-up Life (PLANNED, REVEALED), then every kind of hand on every tie
  var PLANNED = { 1: { plan: true }, 2: { plan: false } };
  var REVEALED = { 1: { revealed: true, arrived: true, lost: false, they: true }, 2: { revealed: true, arrived: false, lost: true, they: false },
                   6: { revealed: true, arrived: false, lost: false, they: true }, 7: { revealed: true, arrived: true, lost: false, they: false } };
  var KINDS = ['arrived', 'lost', 'stay', 'arrived'];
  P.order.forEach(function (pl) {
    g.AYWords.use(pl);
    var sh = P.byId[pl].sheet, stock = g.AfterYou.createLife(1, pl).params.STOCK || null;
    ['wide', 'compact'].forEach(function (kind) {
      var ln = S.lanes(sh, kind);
      var op = S.map(sh, kind, 'sheet', { demo: [-1, 3] }), demo = S.lane(sh, kind, 0, 1);
      same(paths(op, 'm-hand'), [demo.outD], pl + ' ' + kind + ' the Opening\'s hand');
      [false, true].forEach(function (crop) {
        [1, 1.13].forEach(function (up) {
          var gauge = stock ? { top: stock.max, levels: { 1: stock.min, 2: stock.max, 6: stock.start, 7: stock.start } } : undefined;
          // PLANNED: a send planned on 1 (the stub), a stay on 2 (the gate)
          var svgP = S.map(sh, kind, 'day', { names: NAMES, kin: 2, hands: PLANNED, crop: crop, up: up, gauge: gauge });
          same(paths(svgP, 'm-plan'), [ln[1].stubD], pl + ' ' + kind + ' crop ' + crop + ' up ' + up + ' PLANNED .m-plan');
          same(paths(svgP, 'm-stay'), [ln[2].gateD], pl + ' ' + kind + ' crop ' + crop + ' up ' + up + ' PLANNED .m-stay');
          // REVEALED, with the sister's dealings with 1 and 3
          var kw = [{ id: 1, kinSent: true, theySent: false }, { id: 3, kinSent: false, theySent: true }];
          if (stock) { kw[0].stock = stock.start; kw[0].stockAfter = stock.max; kw[1].stock = stock.start; kw[1].stockAfter = stock.min; }
          var svgR = S.map(sh, kind, 'day', { names: NAMES, kin: 2, hands: REVEALED, kinWith: kw, crop: crop, up: up, gauge: gauge });
          var wantHand = [ln[1].outD, ln[1].backD, ln[6].backD, ln[7].outD, S.lane(sh, kind, 2, 1).outD, S.lane(sh, kind, 3, 2).outD];
          same(paths(svgR, 'm-hand'), wantHand, pl + ' ' + kind + ' crop ' + crop + ' up ' + up + ' REVEALED .m-hand');
          same(paths(svgR, 'm-lost'), [ln[2].brokenD], pl + ' ' + kind + ' crop ' + crop + ' up ' + up + ' REVEALED .m-lost');
          same(paths(svgR, 'm-stay'), [ln[6].gateD], pl + ' ' + kind + ' crop ' + crop + ' up ' + up + ' REVEALED .m-stay');
          same(heads(svgR), [tip(ln[1].out), tip(ln[1].back), tip(ln[6].back), tip(ln[7].out), tip(S.lane(sh, kind, 2, 1).out), tip(S.lane(sh, kind, 3, 2).out)], pl + ' ' + kind + ' crop ' + crop + ' up ' + up + ' REVEALED heads');
          // every kind of hand on every tie, answered and not
          for (var rot = 0; rot < 4; rot++) {
            var hands = {}, want = { 'm-hand': [], 'm-lost': [], 'm-stay': [] }, i;
            for (i = 0; i < 4; i++) {
              var id = ORDER[i], k = KINDS[(i + rot) % 4], they = (i + rot) % 2 === 0;
              hands[id] = { revealed: true, arrived: k === 'arrived', lost: k === 'lost', they: they };
              if (k === 'arrived') want['m-hand'].push(ln[id].outD); else if (k === 'lost') want['m-lost'].push(ln[id].brokenD); else want['m-stay'].push(ln[id].gateD);
              if (they) want['m-hand'].push(ln[id].backD);
            }
            var svg = S.map(sh, kind, 'day', { names: NAMES, kin: 7, hands: hands, kinWith: [], crop: crop, up: up, gauge: gauge });
            ['m-hand', 'm-lost', 'm-stay'].forEach(function (c) { same(paths(svg, c), want[c], pl + ' ' + kind + ' crop ' + crop + ' up ' + up + ' turn ' + rot + ' .' + c); });
          }
        });
      });
      // the lanes are copies: changing them leaves the sheet's geometry alone
      var gg = S.geo(sh, kind), before = JSON.stringify(gg.crossings) + JSON.stringify(gg.ties);
      var l2 = S.lanes(sh, kind); l2[1].cross[0] = -99; l2[2].gate.p[0] = -99; l2[6].out[0][0] = -99; l2[7].broken[0][0] = -99;
      var l3 = S.lane(sh, kind, 2, 1); l3.out[0][0] = -99;
      n++; if (JSON.stringify(gg.crossings) + JSON.stringify(gg.ties) !== before) bad.push(pl + ' ' + kind + ': lanes() hands out the sheet\'s own geometry');
      n++; if (S.lane(sh, kind, 2, 6) !== null || S.lane(sh, kind, 1, 6) !== null) bad.push(pl + ' ' + kind + ': lane() between holdings with no tie is not null');
    });
  });
  check(!bad.length, 'every lane d is the drawn mark\'s: 5 places, both sheets, crop on and off, lettering 1 and 1.13, PLANNED, REVEALED and every kind of hand (' + n + ' comparisons)', bad.join(' | '));
  // the cards' glyphs carry the marks the motion finds them by (2.1)
  var gl = S.glyph(P.byId.valley.sheet, { arrived: true, they: true }) + S.glyph(P.byId.valley.sheet, { lost: true }) + S.glyph(P.byId.valley.sheet, {});
  check(gl.indexOf('d="M17 7H37"') >= 0 && gl.indexOf('d="M42 17H22"') >= 0 && /<path class="key-lost"[^>]*\/><path class="key-ink"/.test(gl) && gl.indexOf('<path class="key-ink" d="M17.5 3.2v7.6"/>') >= 0,
        'the cards\' glyphs: your line M17 7H37, theirs M42 17H22, your lost hand .key-lost then .key-ink, your Stay .key-ink M17.5 3.2v7.6');
  if (MOD_SRC.motion === null) return;
  var ce = cardEndFaults(MOD_SRC.motion);
  check(!ce.bad.length && ce.n > 0, 'the card glyph of your hand turned back ends as it rests: no dash pattern in its keyframes but index.html\'s .key-lost (' + ce.rest + '), its first and last offsets whole periods, its last frame opaque (' + ce.n + ' plans)', ce.n ? ce.bad.slice(0, 3).join(' | ') : 'no card:<id>:lost item planned');
}
function cardEndFaults(src) {                        // the card glyph of a hand turned back, as revealPlan plans it, against .key-lost at rest
  var css = /\.key-lost \{[^}]*stroke-dasharray: ([\d.]+) ([\d.]+);/.exec(readFile('index.html')), out = { bad: [], n: 0, rest: null };
  if (!css) { out.bad.push('index.html has no .key-lost stroke-dasharray'); return out; }
  var rest = css[1] + ' ' + css[2], period = Number(css[1]) + Number(css[2]), g = runString('this');
  out.rest = rest;
  SCRIPTS.forEach(function (s) { if (s !== 'app.js' && s !== 'motion.js' && s !== 'sound.js') g.load(s); });
  try { g.loadString(src); } catch (e) { out.bad.push('motion.js threw at load: ' + e); return out; }
  var rp = g.AYMotion && g.AYMotion._test && g.AYMotion._test.revealPlan, P = g.AYPlaces;
  if (typeof rp !== 'function') { out.bad.push('AYMotion._test.revealPlan is missing (6.1)'); return out; }
  function phase(k) { var o = k.strokeDashoffset === undefined ? 0 : Number(k.strokeDashoffset), m = ((o % period) + period) % period; return Math.min(m, period - m); }
  var lanes = [{ id: 1, arrived: false, lost: true, they: false }, { id: 2, arrived: true, lost: false, they: true }, { id: 6, arrived: false, lost: false, they: true }, { id: 7, arrived: false, lost: true, they: true }];
  P.order.forEach(function (pl) {
    ['wide', 'compact'].forEach(function (kind) {
      var plan = rp(pl, kind, { day: 3, lanes: lanes, kin: 3, kinWith: [], bank: null, town: false, map: true, cards: true }, P.byId[pl].sheet);
      (plan.items || []).filter(function (it) { return /^card:\d+:lost$/.test(it.target); }).forEach(function (it) {
        var kf = it.kf, f = kf[0], l = kf[kf.length - 1], at = pl + ' ' + kind + ' ' + it.target;
        var dash = kf.filter(function (k) { return k.strokeDasharray !== undefined && String(k.strokeDasharray).replace(/,/g, ' ').replace(/\s+/g, ' ').trim() !== rest; });
        out.n++;
        if (dash.length) out.bad.push(at + ': the dash pattern ' + dash[0].strokeDasharray + ' in its keyframes (at rest ' + rest + ')');
        else if (phase(f) > 1e-6 || phase(l) > 1e-6) out.bad.push(at + ': offsets ' + f.strokeDashoffset + ' to ' + l.strokeDashoffset + ' (whole periods of ' + period + ')');
        else if (l.opacity !== undefined && Number(l.opacity) !== 1) out.bad.push(at + ': its last frame at opacity ' + l.opacity);
      });
    });
  });
  return out;
}

// 7. planted faults
function sectionPlanted() {
  begin(7, 'planted faults: each must make its check fail');
  var app = readFile('app.js'), caught = 0, total = 0;
  function planted(what, isCaught, how) { total++; if (check(isCaught, 'planted ' + what + ': caught' + (how ? ' (' + how + ')' : ''), 'NOT caught' + (how ? ' (' + how + ')' : ''))) caught++; }
  // a payload carrying why: the dispatcher of a copy of app.js adds it to every cue, and the whitelist must see it
  var line = 'd.quiet = !!(d.quiet || fxQuiet);', p1 = app.indexOf(line) >= 0 ? app.replace(line, line + ' d.why = { situation: 0 };') : null;
  if (p1 === null) { total++; fail('planted a payload carrying why: could not be planted (the dispatcher line "' + line + '" is not in app.js)'); }
  else {
    var r1 = lifeRun({ place: 'valley', seed: 5, policy: 'short', mods: 'listener', stubs: true, app: p1, days: 2 }).rec;
    planted('a payload carrying why', r1.payloadBad.some(function (f) { return /carries (.*\.)?why$/.test(f); }), short(r1.payloadBad[0] || 'nothing reported', 80));
  }
  // a module timer: counted where the module runs, and seen in its source
  var timerSrc = '(function (root) { root.AYMotion = { boot: function () { return true; }, cue: function (n) { if (n === "view") setTimeout(function () {}, 0); }, TIMING: {} }; })(this);';
  var r2 = lifeRun({ place: 'valley', seed: 5, policy: 'short', mods: { motion: timerSrc }, stubs: true, days: 1 }).rec;
  planted('a module setTimeout', r2.fxTimers > 0 && scanSource(timerSrc).some(function (f) { return /a timer/.test(f[0]); }), r2.fxTimers + ' timers made by the module; the source scan');
  // an address, a byte above 0x7F, a theory word: the source scans, on copies of motion.js
  var base = MOD_SRC.motion || '(function (root) {})(this);', bytes = Array.prototype.slice.call(readFile('motion.js', 'binary'));
  planted('an https string in a module', scanSource(base + "\nvar u = 'https://example.org/x';").some(function (f) { return /an address/.test(f[0]); }));
  planted('a byte above 0x7F in a module', scanSource(base, bytes.concat([0x2F, 0x2A, 0xC3, 0xA9, 0x2A, 0x2F])).some(function (f) { return /0x7F/.test(f[0]); }));
  planted('"soft" in a module', scanSource(base + '\n/* a soft landing */').some(function (f) { return /theory word/.test(f[0]); }));
  // a twin mismatch: a module whose reveal reads what the page does not show (the engine's hidden records)
  var leak = '(function (root) { var doc = null; root.AYMotion = { boot: function (c) { doc = c.doc; return true; }, TIMING: {}, cue: function (n, d) {' +
             ' if (n !== "reveal") return; var st = root.AYApp.state, hidden = JSON.stringify(st.result.results).length % 7 + st.life.seed / 100000;' +
             ' doc.getElementById("day-status").animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 100, delay: hidden }); } }; })(this);';
  var pl = PLACES[0], tw = TWINS[pl];
  var la = lifeRun({ place: pl, seed: tw.a.seed, policy: tw.a.policy, mods: { motion: leak }, stubs: true, twinDay: tw.day, days: tw.day }).rec;
  var lb = lifeRun({ place: pl, seed: tw.b.seed, policy: tw.b.policy, mods: { motion: leak }, stubs: true, twinDay: tw.day, days: tw.day }).rec;
  planted('a twin mismatch (a module that reads the engine\'s hidden records)', la.revealPayload !== null && la.revealPayload === lb.revealPayload && la.revealLog !== null && la.revealLog !== lb.revealLog, pl + ' day ' + tw.day + ', the same payload, the logs parted');
  // a sound.js that mutes every cue under reduced motion: a copy whose cues are all made quiet while ctx.still() holds
  if (STATUS.sound !== 'boots') wait('planted a sound.js that mutes every cue under reduced motion: sound.js does not boot in the stood-in browser');
  else {
    var mute = MOD_SRC.sound + '\n(function (root) { var m = root.AYSound, boot = m.boot, cue = m.cue, still = null;' +
               ' m.boot = function (c) { still = c.still; return boot.call(m, c); };' +
               ' m.cue = function (n, d) { var o = {}, k; if (!still || !still()) return cue.call(m, n, d); for (k in d) o[k] = d[k]; o.quiet = true; return cue.call(m, n, o); }; })(this);';
    var sm = stillFaults({ motion: MOD_SRC.motion, sound: mute });
    planted('a sound.js that mutes every cue under reduced motion', sm.sound.length > 0, short(sm.sound[0] || 'nothing reported', 80));
  }
  // a restore not set down quietly: a copy of app.js whose restore leaves fxQuiet false
  var p3 = app.indexOf('fxQuiet = true;') >= 0 ? app.replace('fxQuiet = true;', 'fxQuiet = false;') : null;
  if (p3 === null) { total++; fail('planted a restore not set quiet: could not be planted ("fxQuiet = true;" is not in app.js)'); }
  else if (!(STATUS.motion === 'boots' || STATUS.sound === 'boots')) wait('planted a restore not set quiet: no module boots in the stood-in browser');
  else {
    var rq = restoreFaults(p3).filter(function (x) { return x[1]; });
    planted('a restore not set quiet ("fxQuiet = true;" written "fxQuiet = false;" in a copy of app.js)', rq.length > 0, rq.length ? short(rq[0][0] + ': ' + rq[0][1], 80) : 'every restore passed');
  }
  // the review's fixes, each undone in a copy, must fail their checks (the runs turned in the middle of a Life, and
  // the card glyph's end)
  function undone(what, src, from, to, run) {
    var s = src === null ? null : typeof from === 'string' ? (src.indexOf(from) >= 0 ? src.replace(from, to) : null) : (from.test(src) ? src.replace(from, to) : null);
    if (s === null) { total++; fail('planted ' + what + ': could not be planted (' + short(String(from), 60) + ' is not in the source)'); return; }
    var r = run(s); planted(what, r[0], r[1]);
  }
  function first(list, none) { return short(list[0] || none, 80); }
  var M = MOD_SRC.motion, SD = MOD_SRC.sound;
  if (STATUS.motion !== 'boots') wait('planted the review\'s motion fixes undone: motion.js does not boot in the stood-in browser');
  else {
    undone('a motion.js with no still cue (reduced motion turned on mid-Life leaves what runs running)', M, ', still: onStill', '',
           function (s) { var r = midStill({ motion: s, sound: SD }); return [r.bad.length > 0, first(r.bad, 'nothing reported')]; });
    undone('an app.js that does not tell the modules reduced motion was turned on', app, /\n[^\n]*onMedia\(mqStill,[^\n]*/, '',
           function (s) { var r = midStill('files', s); return [r.bad.length > 0, first(r.bad, 'nothing reported')]; });
    undone('a motion.js that judges the first reveal across a hidden page', M, 'if (st.hid !== hid0) return;', '',
           function (s) { var r = hiddenDowngrade({ motion: s, sound: SD }, true); return [r.day2 === 0, r.day2 + ' loops on day 2']; });
    undone('a motion.js whose card glyph of a hand turned back draws on solid, then snaps to its dashes', M, /kf: \[\{ offset: 0, strokeDashoffset: '6\.1'[^\]]*\]/, 'kf: drawOnKf(6)',
           function (s) { var r = cardEndFaults(s); return [r.bad.length > 0, first(r.bad, 'nothing reported')]; });
    undone('a motion.js that does not keep the Afterwards\' rest as the last light shown', M, 'st.light.shown = to; st.light.prev = to;', '',
           function (s) { var r = againLight({ motion: s, sound: SD }); return [r.bad.length > 0, first(r.bad, 'nothing reported')]; });
  }
  if (STATUS.sound !== 'boots') wait('planted the review\'s sound fixes undone: sound.js does not boot in the stood-in browser');
  else {
    undone('a sound.js that lets a one-shot sound on through a reveal', SD, 'if (S.shots[i].end > first - HOLD_MS / 1000) release(S.shots[i], t); else keep.push(S.shots[i]);', 'keep.push(S.shots[i]);',
           function (s) { var r = shotFaults({ motion: M, sound: s }); return [r.bad.length > 0, first(r.bad, 'nothing reported')]; });
    undone('a sound.js that ends the music for the session when play() is refused for want of a tap', SD, "err && err.name === 'NotAllowedError'", 'false',
           function (s) { var r = refusedFaults(s); return [r.bad.length > 0, first(r.bad, 'nothing reported')]; });
    undone('a sound.js that ends the music for the session when its own pause() cuts a pending play() short (AbortError)', SD, "if (err && err.name === 'AbortError') return;", '',
           function (s) { var r = abortFaults(s); return [r.bad.length > 0, first(r.bad, 'nothing reported')]; });
    undone('a sound.js whose first hide\'s wait suspends the audio through a later hide\'s fade', SD, ' && S.awayGen === ag', '',
           function (s) { var r = hideShowHide(s); return [r.bad.length > 0, first(r.bad, 'nothing reported')]; });
    undone('a sound.js whose memory option takes a first press on the Sound button as its own (and the button then turns sound off)', SD, 'if (onButton(e)) return;', '',
           function (s) { var r = armFaults(s); return [r.bad.length > 0, first(r.bad, 'nothing reported')]; });
    undone('a sound.js whose memory option starts sound at a pointerdown', SD, "doc.addEventListener('click', go, true);", "doc.addEventListener('pointerdown', go, true);",
           function (s) { var r = armFaults(s); return [r.bad.length > 0, first(r.bad, 'nothing reported')]; });
    undone('a sound.js that takes the still cue as input', SD, " || name === 'still'", '',
           function (s) { var r = midStill({ motion: M, sound: s }); return [r.moved.length > 0, r.moved.length ? 'the state moved' : 'nothing moved']; });
  }
  note(caught + ' of ' + total + ' planted faults caught');
}

// ---- the run -----------------------------------------------------------------------------------------------------
var TWINS = {}, STEPS = [['1', sectionLoading], ['2', sectionDisabled], ['3', sectionStubbed], ['4', sectionTwins], ['5', sectionCalendar], ['6', sectionGeometry], ['7', sectionPlanted]];
say('MOTION-SOUND: part 15 on the working tree; places ' + PLACES.join(', ') + (STRICT ? '; strict (a WAIT fails)' : ''));
try { probeStatus(); } catch (e) { say('the first look at the modules stopped: ' + e); }
say('in the stood-in browser motion.js ' + STATUS.motion + ', sound.js ' + STATUS.sound);
PLACES.forEach(function (pl) { TWINS[pl] = findTwins(pl); if (!TWINS[pl]) throw new Error('motion-sound.js: no twin Lives found for ' + pl); });
var PREPARED = null;
STEPS.forEach(function (st) {
  if (st[0] === '2' && PREPARED === null) {
    var t0 = preciseTime();
    try { prepare(); PREPARED = true; } catch (e) { PREPARED = String(e && e.stack ? e + ' | ' + String(e.stack).split('\n')[0] : e); }
    print('  (the paired Lives: ' + PAIRS.length + ' pairs in ' + (preciseTime() - t0).toFixed(1) + ' s)');
  }
  if (PREPARED !== null && PREPARED !== true && /^[234]|^5/.test(st[0])) { begin(Number(st[0]), ['', '', 'disabled', 'stubbed', 'twins', 'calendar'][Number(st[0])]); fail('the paired Lives did not run: ' + PREPARED); return; }
  var t1 = preciseTime();
  try { st[1](); } catch (e) { if (!SECTION || String(SECTION.n) !== st[0]) begin(Number(st[0]), 'section ' + st[0]); fail('the section stopped: ' + e + (e && e.stack ? ' | ' + String(e.stack).split('\n').slice(0, 2).join(' / ') : '')); }
  print('  (section ' + st[0] + ': ' + (preciseTime() - t1).toFixed(1) + ' s)');
});
var NF = 0, NW = 0;
say('');
RESULTS.forEach(function (r) {
  NF += r.fail.length; NW += r.wait.length;
  say(r.n + '. ' + r.name.split(':')[0] + ': ' + (r.fail.length ? 'FAIL' : r.wait.length ? 'WAIT' : 'PASS') + ' (' + r.pass + ' pass' + (r.fail.length ? ', ' + r.fail.length + ' fail' : '') + (r.wait.length ? ', ' + r.wait.length + ' waiting for modules that boot' : '') + ')');
});
var OK = NF === 0 && (!STRICT || NW === 0);
var WAITING = RESULTS.filter(function (r) { return r.wait.length && !r.fail.length; }).map(function (r) { return r.name.split(':')[0]; });
var SUMMARY = RESULTS.length + ' sections, ' + NCHECKS + ' checks, ' + NF + ' failed' + (NW ? '; ' + NW + ' wait for modules that boot (' + WAITING.join(', ') + ')' : '') + '; motion.js ' + STATUS.motion + ', sound.js ' + STATUS.sound;
var HASH = hex(fnv(LOG.join('\n')));
print('time: ' + (preciseTime() - T_START).toFixed(1) + ' s');
print('MOTION-SOUND: ' + (OK ? 'PASS' : 'FAIL') + ' (' + SUMMARY + ') fnv1a32 ' + HASH);
if (!OK) throw new Error('part 15 failed: ' + NF + ' checks' + (STRICT && NW ? ', and ' + NW + ' waiting (strict)' : ''));
