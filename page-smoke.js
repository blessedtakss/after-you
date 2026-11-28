/*
 * After You: page smoke test (jsc).
 *   cd <this folder> && "$JSC" page-smoke.js                every place index.html loads, the valley first
 *   cd <this folder> && "$JSC" page-smoke.js -- <place>     that place alone (jsc page-smoke.js -- valley)
 * Loads engine.js, words.js, the place files index.html loads (places/<id>.js) and sheet.js.
 * First it checks each place's own data: its words have every key the valley's have, each is a
 * sentence by the page's rules, a key that is missing throws, and its sheet keeps the sheet's
 * rules and draws in every mode. Then, place by place, for many seeds and several ways of playing
 * it performs the same sequence of engine calls that app.js performs for a complete Life (every
 * day, every reveal, every Why?, every season's end, Leaving, the watched future, the verdict by
 * verdictJob), calls every function of AYWords with the real engine data at each point, and
 * throws if a sentence is malformed or an engine field the page draws from is undefined.
 * Rules are checked against the copy: the rules each place's words were written for are the
 * Life's (writtenFor); the Opening's numbers and its sheet's are the Life's stakes, from slots;
 * the strip's rule names the engine's HOLD_LINE; the custom's gloss is the place's; the plain
 * ways are counted as the engine counts them. No sentence of a place may carry a word that belongs
 * to another place (SKINS) and is not its own.
 * Each place also plays its own ways of playing (PLACE_POLICIES: the Banks' peacemaker, which can earn
 * the seal there, and its selfish act). A place with a stock (the Banks) gives the stock's words
 * (lexicon.stock, the same keys in every such place) and its Lives are checked tie by tie: the level a
 * day was played on, its move by the Life's rule, the card's number at that level, the gauge's words
 * at both ends (worked out here from the templates), the sister's banks, the sixteen banks of every
 * future season. A place's own colours (three token blocks) keep every pair the page draws with at
 * least as far apart as the valley's.
 * Shared stakes (S when both acts arrive, H when neither does: the Watch, the Bridges, the Saltmarket):
 * every card's number is the Life's stakes for its outcome, worked out here, and the Opening states the
 * number of every outcome that has one, so each card is accounted for in words. A starting store
 * (STORE_START: the Bridges) is stated on the Opening and stands in the store on day 1; a store below
 * zero is told with its sign. An inverted charter (CHARTER 'breaks': the Saltmarket) gives the town's
 * words, and each closed day's town line is checked against the day's results (2 x S on each tie where
 * both acts arrived). Every place plays its own custom as "the old way", and its honest way of playing,
 * which earns its seal on seeds played at the page's own counts (PLACE_SEAL_SEEDS).
 * A place whose rules replay the last season (REPLAY 'season': the Watch and the Saltmarket) gives one line
 * for a seal that replay withheld (lexicon.lastSeason), told exactly where the seal would otherwise have been
 * earned (the house kept, the mark clear, no last-day clause) and refused for every other verdict; a few of
 * its Lives at the page's own counts must show it, or refuse it (PLACE_SEASON_LIVES).
 * Luck is told only where the page tells your own act miscarrying or names the futures' luck (LUCK): never
 * in a sentence about a neighbour's or the sister's act. The back of a Why? card (its plain and "Even so"
 * lines) keeps the same rule as the front: a missing act of theirs is never told as their choice.
 */
load('engine.js');
load('words.js');
// the places, in the order index.html loads them: each file registers itself (AYPlaces.add)
var PLACE_FILES = (function () {
  var html = readFile('index.html'), re = /<script src="(places\/[a-z]+\.js)"><\/script>/g, m, out = [];
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
})();
PLACE_FILES.forEach(function (file) { load(file); });
load('sheet.js');

var A = AfterYou, W = AYWords, PL = AYPlaces;
var T0 = preciseTime();

// ---- sentence checks ------------------------------------------------------------------------

// The theory words in any of their forms (co-operating, defectors, strategic, pay-off, tit-for-tat,
// game-theoretic ...); the six founder kinds as whole words.
var FORBIDDEN_RE = /(^|[^a-z])(co-?operat[a-z]*|defect[a-z]*|prisoners?|dilemmas?|strateg[a-z]*|pay-?offs?|tit[- ]for[- ]tat|game[- ]theor[a-z]*|players?|firm|soft|takers?|wary|steady|poachers?)([^a-z]|$)/i;
var BAD_BITS = ['undefined', 'NaN', 'null', '[object', '  '];

// The words that belong to each place's world (its acts, its luck, its goods, its ground), for the
// five places of the engine's play order, whether or not this page has their files yet. A place's
// sentences may not carry a word of another place's list that is not on its own (its leak list):
// that is how a sentence still written whole in another place's words is found.
var SKINS = {
  valley: ['hand', 'hands', 'send a hand', 'sends a hand', 'sent a hand', 'stay home', 'stays home', 'stayed home', 'staying home',
           'ford', 'river', 'ridge', 'harvest', 'harvests', 'grain', 'crop', 'crops', 'measure', 'measures', 'holding', 'holdings',
           'valley', 'barn', 'barns', 'house', 'houses'],
  banks: ['bank', 'banks', 'net', 'nets', 'boat', 'boats', 'fish', 'fishes', 'fished', 'fishing', 'fish across', 'fished across',
          'tide', 'tides', 'cove', 'basket', 'baskets', 'water', 'waters', 'catch', 'mooring', 'moorings', 'headland', 'grounds', 'shore',
          'race', 'dial', 'chart', 'keep off', 'kept off'],
  watch: ['tower', 'towers', 'watchman', 'watchmen', 'fire', 'fires', 'border', 'stand down', 'stands down', 'stood down',
          'standing down', 'keep watch', 'keeps watch', 'kept watch', 'keeping watch', 'shadow', 'alarm', 'alarms', 'beacon',
          'sack', 'sacks', 'peace', 'hills'],
  bridges: ['bridge', 'bridges', 'cart', 'carts', 'carter', 'carters', 'mule', 'mules', 'wheel', 'wheels', 'give way', 'gives way',
            'gave way', 'giving way', 'drive on', 'drives on', 'drove on', 'driving on', 'yard', 'yards', 'load', 'loads', 'road', 'roads',
            'stream', 'downs', 'jammed', 'lane'],
  saltmarket: ['salt', 'stall', 'stalls', 'price', 'prices', 'guild', 'coin', 'coins', 'town', 'seller', 'sellers', 'buyer',
               'buyers', 'square', 'boy', 'market', 'arcade', 'takings', 'ring broke', 'ring held', 'lane']
};
// Each place's luck: the words that tell an act of yours miscarrying (the tide, the shadow, the mule, the
// stall boy; the valley's ford turning a hand back). They may stand only in the sentences that tell your
// own luck (the luck note, the lost reveals and yesterdays, the map key's lost mark) or the futures' luck in
// general (oneFuture, rowsCaption, rowsExplain, mattered.none), and in a place's own extra keys (the
// Banks' tide race on its map). Anywhere else, above all in a sentence about a neighbour's or the
// sister's act, they would tell which of the other side's missing acts were luck.
var LUCK_KEYS = ['luckNote', 'reveal.lostTheirs', 'reveal.lostNone', 'yesterday.lostTheirs', 'yesterday.lostNone', 'legendDay.lost',
                 'oneFuture', 'rowsCaption', 'rowsExplain', 'mattered.none'];
var LUCK = {
  valley: { words: /(^|[^a-z])(turned back)([^a-z]|$)/i, also: [] },
  banks: { words: /(^|[^a-z])(tides?)([^a-z]|$)/i, also: ['mapAlt.sheet', 'mapAlt.day'] },
  watch: { words: /(^|[^a-z])(shadows?|watchman)([^a-z]|$)/i, also: [] },
  bridges: { words: /(^|[^a-z])(mules?)([^a-z]|$)/i, also: [] },
  saltmarket: { words: /(^|[^a-z])(boys?|sold below)([^a-z]|$)/i, also: [] }
};
function noLuck(s, fn) {
  var m = LUCK[PLACE].words.exec(s);
  if (m) throw new Error('the luck of the ' + PLACE + ' ("' + m[2] + '") told outside your own luck by AYWords.' + fn + ': "' + s + '" at ' + where);
}
function leakListOf(id) {
  if (!SKINS[id]) throw new Error('page-smoke.js has no list of the words of the place "' + id + '" (SKINS)');
  var out = [], k;
  for (k in SKINS) {
    if (k === id) continue;
    SKINS[k].forEach(function (word) { if (SKINS[id].indexOf(word) < 0 && out.indexOf(word) < 0) out.push(word); });
  }
  return out;
}
function leakRe(id) { return new RegExp('(^|[^a-z])(' + leakListOf(id).join('|') + ')([^a-z]|$)', 'i'); }
var LEAK_RE = null, LEAK_OF = '';    // the leak list of the place being checked

var sentences = 0, where = '', depth = 0, called = {};

// What is wrong with a sentence by the page's rules, or null.
function sentenceFault(s) {
  if (typeof s !== 'string') return 'not a string: ' + String(s);
  if (!s.length || !s.replace(/\s/g, '').length) return 'empty sentence';
  for (var i = 0; i < BAD_BITS.length; i++) {
    if (s.indexOf(BAD_BITS[i]) >= 0) return '"' + BAD_BITS[i] + '" in: "' + s + '"';
  }
  var m = FORBIDDEN_RE.exec(s);
  if (m) return 'forbidden word "' + m[2] + '" in: "' + s + '"';
  if (/[!—]/.test(s)) return 'exclamation mark or em-dash in: "' + s + '"';
  if (s !== s.trim()) return 'leading or trailing space in: "' + s + '"';
  if (LEAK_RE) { m = LEAK_RE.exec(s); if (m) return 'a word of another place, "' + m[2] + '", in the ' + LEAK_OF + ': "' + s + '"'; }
  return null;
}
function checkString(s, fn) {
  var at = ' (AYWords.' + fn + ' at ' + where + ')';
  var fault = sentenceFault(s);
  if (fault) throw new Error(fault + at);
  sentences++;
}
function checkValue(v, fn) {
  if (typeof v === 'string') return checkString(v, fn);
  if (typeof v === 'number') { if (!isFinite(v)) throw new Error('non-finite number from AYWords.' + fn + ' at ' + where); return; }
  if (typeof v === 'boolean') return;
  if (v === null || v === undefined) throw new Error(String(v) + ' returned by AYWords.' + fn + ' at ' + where);
  if (Array.isArray(v)) { for (var i = 0; i < v.length; i++) checkValue(v[i], fn); return; }
  if (typeof v === 'object') { for (var k in v) checkValue(v[k], fn + '.' + k); return; }
  throw new Error('unexpected ' + typeof v + ' from AYWords.' + fn + ' at ' + where);
}

// ---- the places' own data, before any Life is played ------------------------------------------
// Nothing here goes through the wrapped functions below, so the sentences of the Lives are
// checked (and counted) as they always were.

var VALLEY = 'valley';
var lexiconStrings = 0, sheetsDrawn = 0;
// Every word of a place as path -> shape ('text', or 'list of n'): its lexicon and its charter.
function shapeOf(place) {
  var out = {};
  (function walk(v, path) {
    var k;
    if (typeof v === 'string') { out[path] = 'text'; return; }
    if (Array.isArray(v)) {
      out[path] = 'list of ' + v.length;
      for (k = 0; k < v.length; k++) if (typeof v[k] !== 'string') throw new Error('the words at ' + path + '.' + k + ' of ' + place.id + ' are not a string');
      return;
    }
    if (v === null || typeof v !== 'object') throw new Error('the words at ' + path + ' of ' + place.id + ' are not a string, a list or a group');
    for (k in v) walk(v[k], path + '.' + k);
  })({ lexicon: place.lexicon, charter: place.charter }, place.id);
  var rel = {}, key;
  for (key in out) rel[key.slice(place.id.length + 1)] = out[key];
  return rel;
}
function stringsOf(place) {
  var out = [];
  (function walk(v, path) {
    var k;
    if (typeof v === 'string') { out.push({ path: path, s: v }); return; }
    for (k in v) walk(v[k], path + '.' + k);
  })({ lexicon: place.lexicon, charter: place.charter }, place.id);
  if (typeof place.afterword === 'string') out.push({ path: place.id + '.afterword', s: place.afterword });
  return out;
}
// ---- rules against the copy (a place's words, before any Life is played) -----------------------

function sameValue(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function numbersIn(text) { return (text.match(/[\u2212-]?\d+(\.\d+)?/g) || []).map(function (t) { return Number(t.replace('\u2212', '-')); }); }
// The stakes the page may state, worked out here from the rules (not by AYWords.stakes): one tie on
// one day is worth B x level for their hand, costs C for yours, adds S when both arrive, takes H
// when neither does; level is the stock's start where there is one.
function stakeSet(p) {
  var lv = p.STOCK ? p.STOCK.start : 1, out = [p.B, p.C, p.S, p.H, lv, p.B * lv, p.B * lv - p.C + p.S, -p.C, -p.H];
  if (p.STOCK) out = out.concat([p.STOCK.start, p.STOCK.min, p.STOCK.max].concat(p.STOCK.delta).concat(p.STOCK.delta.map(function (d) { return -d; })));
  if (p.STORE_START) out.push(p.STORE_START);        // the store before day 1
  return out.concat(out.map(function (x) { return Math.abs(x); }));
}
// The line a future must reach, in the words the strip and its rule must use, worked out here
// from HOLD_LINE and the flow kind: a level of the stock, or a share ("half", "3 in 10", "45 in 100").
function lineSaid(p) {
  var x = p.HOLD_LINE;
  if (p.FLOW_KIND === 'stock') return String(Math.round(x * p.STOCK.start * 10) / 10);
  if (Math.abs(x - 0.5) < 1e-9) return 'half';
  if (Math.abs(x * 10 - Math.round(x * 10)) < 1e-9) return Math.round(x * 10) + ' in 10';
  return Math.round(x * 100) + ' in 100';
}
// The strip's top (app.js flowTop): every season's flow must be drawn inside it.
function flowTop(p) {
  if (p.FLOW_KIND === 'stock') return p.STOCK.max / p.STOCK.start;
  if (p.FLOW_KIND === 'hands') return Math.max(1.05, 1 / (1 - p.FOG));
  return 1.05;
}
var COUNTS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
              'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
// What comes before a template's first slot: the fixed lead every sentence made from it starts with.
function leadOf(t) { var i = t.indexOf('{'); return i < 0 ? t : t.slice(0, i); }
function tailOf(t) { var i = t.lastIndexOf('}'); return i < 0 ? t : t.slice(i + 1); }
// The same rules with every stake and the line moved to numbers no place uses: what the page then
// says must move with them.
function moved(p) {
  var q = JSON.parse(JSON.stringify(p));
  q.B = 211; q.C = 223; q.S = 227; q.H = 229;
  if (q.STOCK) q.STOCK = { start: 233, min: 239, max: 241, delta: [-251, 257, 263] };
  if (q.STORE_START) q.STORE_START = 269;
  q.HOLD_LINE = q.FLOW_KIND === 'stock' ? 241 / 233 : (p.HOLD_LINE === 0.3 ? 0.7 : 0.3);
  return q;
}
var rulesChecked = 0;
function rulesAgainstCopy(id) {
  var place = PL.byId[id], p = A.createLife(1, id).params, lex = place.lexicon, ch = place.charter, k, i;
  where = 'the rules behind the words of ' + id;
  // the rules the words were written for are the Life's: a preset that moves sends its words back to be read
  var wf = place.writtenFor;
  ['CUSTOM', 'CHARTER', 'FLOW_KIND'].forEach(function (key) {
    if (!sameValue(wf[key], p[key])) throw new Error('the ' + id + ' words were written for ' + key + ' ' + JSON.stringify(wf[key]) + ', the Life has ' + JSON.stringify(p[key]));
  });
  if (wf.STOCK !== !!p.STOCK) throw new Error('the ' + id + ' words were written ' + (wf.STOCK ? 'with' : 'without') + ' a stock, the Life has ' + (p.STOCK ? 'one' : 'none'));
  if (wf.S !== (p.S !== 0) || wf.H !== (p.H !== 0)) throw new Error('the ' + id + ' words were written for S ' + wf.S + ' and H ' + wf.H + ', the Life has S ' + p.S + ' and H ' + p.H);
  // a place's own: B where its words name what a unit of the stock yields; STOCK_MOVES 'either-fills' where
  // they say the stock falls when neither act arrives and fills, by the same amount, when one or both do
  if (Object.prototype.hasOwnProperty.call(wf, 'B') && wf.B !== p.B) throw new Error('the ' + id + ' words were written for B ' + wf.B + ', the Life has ' + p.B);
  if (Object.prototype.hasOwnProperty.call(wf, 'STOCK_MOVES')) {
    var dl = p.STOCK && p.STOCK.delta;
    if (wf.STOCK_MOVES !== 'either-fills' || !dl || !(dl[0] < 0 && dl[1] > 0 && dl[1] === dl[2])) throw new Error('the ' + id + ' words were written for a stock that moves "' + wf.STOCK_MOVES + '", the Life\'s moves ' + JSON.stringify(dl));
  }
  // STORE_START: whether the words were written for a store that starts above zero (absent: they were not)
  if ((Object.prototype.hasOwnProperty.call(wf, 'STORE_START') ? wf.STORE_START : false) !== (p.STORE_START !== 0)) throw new Error('the ' + id + ' words were written ' + (wf.STORE_START ? 'with' : 'without') + ' a starting store, the Life starts with ' + p.STORE_START);
  // SIGNS: the sign each outcome's words take for granted ('gains', 'loses', 'pays' are rules said in words),
  // worked out here from the rules: both arrived, mine alone, theirs alone, neither; and S itself
  if (Object.prototype.hasOwnProperty.call(wf, 'SIGNS')) {
    var lv0 = p.STOCK ? p.STOCK.start : 1, out0 = { both: p.B * lv0 - p.C + p.S, mine: -p.C, theirs: p.B * lv0, neither: -p.H, S: p.S, H: p.H };
    Object.keys(wf.SIGNS).forEach(function (o) {
      var want = wf.SIGNS[o], v = out0[o];
      if (v === undefined || ['+', '-'].indexOf(want) < 0) throw new Error('the ' + id + ' words name a sign this check does not know: ' + o + ' ' + want);
      if ((want === '+' ? !(v > 0) : !(v < 0))) throw new Error('the ' + id + ' words were written for "' + o + '" ' + (want === '+' ? 'above' : 'below') + ' zero, the Life has ' + v);
    });
  }
  Object.keys(wf).forEach(function (key) {
    if (['CUSTOM', 'CHARTER', 'FLOW_KIND', 'STOCK', 'S', 'H', 'B', 'STOCK_MOVES', 'STORE_START', 'SIGNS'].indexOf(key) < 0) throw new Error('the ' + id + ' words name a rule this check does not know: ' + key);
  });
  // the line is said exactly (lineSaid): a level of the stock to one decimal, a share in whole hundredths
  var exact = p.FLOW_KIND === 'stock' ? p.HOLD_LINE * p.STOCK.start * 10 : p.HOLD_LINE * 100;
  if (Math.abs(exact - Math.round(exact)) > 1e-9) throw new Error('the ' + id + ' line (HOLD_LINE ' + p.HOLD_LINE + ') cannot be said exactly in the words of its flow: ' + lineSaid(p));
  // every need above zero: the meter and every "of {need}" rest on it (createLife alone, no day played)
  for (var sd = 1; sd <= 5000; sd++) {
    var nd = A.createLife(sd, id).need;
    if (!(nd > 0)) throw new Error('the ' + id + ' need is ' + nd + ' on seed ' + sd + ': the page draws and says a need above zero');
  }
  rulesChecked++;
  // the Opening: no number typed into its templates; every number it shows is one of the Life's
  // stakes; it states what a hand costs you and what one is worth where it arrives
  [lex.opening.premise].concat(lex.opening.lines).forEach(function (t) {
    if (/\d/.test(t)) throw new Error('a number typed into the ' + id + ' Opening: ' + t);
  });
  var op = W.opening(p), said = numbersIn(op.lines.join(' ')), allowed = stakeSet(p);
  said.forEach(function (n) { if (allowed.indexOf(n) < 0) throw new Error('the ' + id + ' Opening says ' + n + ', which is none of the Life\'s stakes: ' + op.lines.join(' ')); });
  var lv = p.STOCK ? p.STOCK.start : 1;
  if (said.indexOf(p.C) < 0 && said.indexOf(-p.C) < 0) throw new Error('the ' + id + ' Opening does not say what a hand costs (' + p.C + '): ' + op.lines.join(' '));
  if (said.indexOf(p.B * lv) < 0) throw new Error('the ' + id + ' Opening does not say what a hand that arrives is worth (' + (p.B * lv) + '): ' + op.lines.join(' '));
  // where the stakes are shared (S or H), each card's number is accounted for by the Opening: it states the
  // number of every outcome that has one (both, yours alone, theirs alone, neither)
  if (p.S !== 0 || p.H !== 0) {
    var sto = W.stakes(p);
    ['both', 'mine', 'theirs', 'neither'].forEach(function (o) {
      if (sto[o] !== 0 && said.indexOf(sto[o]) < 0 && said.indexOf(Math.abs(sto[o])) < 0) throw new Error('the ' + id + ' Opening does not say what "' + o + '" brings (' + sto[o] + '): ' + op.lines.join(' '));
    });
  }
  // a store that starts above zero is stated on the Opening
  if (p.STORE_START && said.indexOf(p.STORE_START) < 0) throw new Error('the ' + id + ' Opening does not say what the store starts with (' + p.STORE_START + '): ' + op.lines.join(' '));
  // the day's sentences carry no typed number: a number in them is a slot filled from the Life
  ['yesterday', 'reveal'].forEach(function (grp) { Object.keys(lex[grp]).forEach(function (k) { if (/\d/.test(lex[grp][k])) throw new Error('a number typed into ' + grp + '.' + k + ' of the ' + id + ' words'); }); });
  var q = moved(p), opq = W.opening(q), saidq = numbersIn(opq.lines.join(' ')), allowedq = stakeSet(q);
  if (saidq.length !== said.length) throw new Error('the ' + id + ' Opening does not move with the stakes: ' + opq.lines.join(' '));
  saidq.forEach(function (n) { if (allowedq.indexOf(n) < 0) throw new Error('the ' + id + ' Opening keeps ' + n + ' when the stakes move: ' + opq.lines.join(' ')); });
  // the Opening's sheet: its one hand costs you C and is worth B x level where it arrives
  ['wide', 'compact'].forEach(function (kind) {
    var st = W.stakes(p), svg = AYSheet.map(place.sheet, kind, 'sheet', { demo: [st.mine, st.theirs] });
    var nums = (svg.match(/<text class="m-num"[^>]*>[^<]*<\/text>/g) || []).map(function (t) { return t.replace(/<[^>]*>/g, ''); });
    if (!sameValue(nums, [W.signed(-p.C), W.signed(p.B * lv)])) throw new Error('the ' + kind + ' Opening sheet of ' + id + ' shows ' + nums.join(', ') + ', not the Life\'s stakes');
  });
  // the strip's line and the rule of a future: the engine's HOLD_LINE, by its flow kind
  [['charter.flow.half', ch.flow.half], ['charter.flow.rule', ch.flow.rule], ['charter.flowAlt', ch.flowAlt], ['charter.rowRule', ch.rowRule]].forEach(function (t) {
    if (t[1].indexOf('{line}') < 0) throw new Error('"' + t[0] + '" of the ' + id + ' words does not name the line ({line})');
  });
  [ch.flow.half, ch.flow.rule, ch.rowRule].forEach(function (t) { if (/\d/.test(t)) throw new Error('a number typed into a rule of the ' + id + ' words: ' + t); });
  var line = lineSaid(p), lineq = lineSaid(q);
  var fl = W.flowLabels(p), rr = W.rowsExplain({ futures: 2000 }, p)[1];
  [fl.half, fl.rule, rr].forEach(function (t) { if (t.indexOf(line) < 0) throw new Error('the ' + id + ' strip or rule does not name the line the engine uses (' + line + '): ' + t); });
  var flq = W.flowLabels(q), rrq = W.rowsExplain({ futures: 2000 }, q)[1];
  [flq.rule, rrq].forEach(function (t) {
    if (t.indexOf(lineq) < 0 || (line !== lineq && t.indexOf(line) >= 0)) throw new Error('the ' + id + ' rule does not move with HOLD_LINE (' + line + ' to ' + lineq + '): ' + t);
  });
  // the plain ways are counted as the engine counts them (range.of)
  ['charter.rangeLine', 'rangeNote'].forEach(function (key) {
    var t = key === 'rangeNote' ? lex.rangeNote : ch.rangeLine;
    if (t.indexOf('{of}') < 0 || /thirteen|\b13\b/i.test(t)) throw new Error('"' + key + '" of the ' + id + ' words does not count the plain ways from the engine ({of}): ' + t);
  });
  [7, 13].forEach(function (of) {
    var fake = { range: { of: of, bestPct: 60, worstPct: 20, yourPct: 40, inside: true }, whatIfFutures: 1000, holdsPct: 40 };
    [W.rangeLine(fake), W.rangeNote(fake)].forEach(function (t) {
      if (t.indexOf(COUNTS[of]) < 0 || (of !== 13 && /thirteen/.test(t))) throw new Error('the ' + id + ' plain ways are not counted as range.of (' + of + '): ' + t);
    });
  });
  // the custom's gloss is the place's: it names the place's own custom, with the purse given
  var gloss = W.oldWay(37);
  if (gloss.indexOf(lex.custom.Name) !== 0 || numbersIn(gloss).join() !== '37') throw new Error('the ' + id + ' custom is not glossed in its own name with its purse: ' + gloss);
  // the afterword: one short paragraph of two or three sentences
  var aw = place.afterword, fault = sentenceFault(aw), count = (aw.match(/[.?](\s|$)/g) || []).length;
  if (fault) throw new Error(fault + ' (the afterword of ' + id + ')');
  if (/\n/.test(aw) || count < 2 || count > 3 || aw.length > 600) throw new Error('the afterword of ' + id + ' is not one short paragraph of two or three sentences');
}

// A group of words that only some places give: lexicon.stock, exactly where the place's rules have a
// stock (writtenFor.STOCK). It is left out of the comparison with the valley's keys, and every place
// that gives it gives the same keys in it (the first such place's).
// lexicon.town (the town that pays for the ring), exactly where the charter breaks (CHARTER 'breaks').
// lexicon.lastSeason (the line of a seal withheld by the season replay), exactly where the rules replay the
// last season (REPLAY 'season': the Watch and the Saltmarket).
var FEATURE_GROUPS = { stock: function (p) { return !!p.STOCK; }, town: function (p) { return p.CHARTER === 'breaks'; },
                       lastSeason: function (p) { return p.REPLAY === 'season'; } };
function givesGroup(id, grp) { return Object.prototype.hasOwnProperty.call(PL.byId[id].lexicon, grp); }
function featureOf(key) { var g = key.split('.'); return g[0] === 'lexicon' && FEATURE_GROUPS[g[1]] ? g[1] : null; }
(function () {
  where = 'the places';
  var order = PL.order, k = -1, valleyShape, i, s, groupShape = {};
  if (order[0] !== VALLEY) throw new Error('the valley is not the first place: ' + order.join(', '));
  if (order.join(',') !== PLACE_FILES.map(function (file) { return file.slice('places/'.length, -'.js'.length); }).join(',')) {
    throw new Error('each place file registers the place it is named for, in the order index.html loads them: ' + order.join(', '));
  }
  order.forEach(function (id) {
    if (!Object.prototype.hasOwnProperty.call(A.PLACES, id)) throw new Error('the engine has no place "' + id + '"');
    var at = A.PLACE_ORDER.indexOf(id);
    if (at <= k) throw new Error('the places are not in the play order (AfterYou.PLACE_ORDER): ' + order.join(', '));
    k = at;
  });
  valleyShape = shapeOf(PL.byId[VALLEY]);
  var engineTitles = A.ways(A.createLife(1, VALLEY)).map(function (w) { return w.title; });
  order.forEach(function (id) {
    var p = PL.byId[id], mine = shapeOf(p), key, grp;
    where = 'the words of ' + id;
    // the same keys as the valley's, each of the same shape: a word a place forgot is caught here
    for (key in valleyShape) {
      if (featureOf(key)) throw new Error('the valley gives the words of a ' + featureOf(key) + ' it does not have');
      if (!Object.prototype.hasOwnProperty.call(mine, key)) throw new Error('the ' + id + ' words have no "' + key + '"');
      if (mine[key] !== valleyShape[key]) throw new Error('"' + key + '" of the ' + id + ' words is a ' + mine[key] + ', the valley\'s a ' + valleyShape[key]);
    }
    var groups = {};
    for (key in mine) {
      grp = featureOf(key);
      if (grp) { (groups[grp] = groups[grp] || {})[key] = mine[key]; continue; }
      if (!Object.prototype.hasOwnProperty.call(valleyShape, key)) throw new Error('the ' + id + ' words have "' + key + '", which the valley\'s do not');
    }
    // the words of a stock exactly where the rules have one, with the keys every such place gives
    for (grp in FEATURE_GROUPS) {
      if (!!groups[grp] !== FEATURE_GROUPS[grp](A.createLife(1, id).params)) throw new Error('the ' + id + ' words ' + (groups[grp] ? 'give' : 'lack') + ' the words of a ' + grp + ', and its rules ' + (groups[grp] ? 'have none' : 'have one'));
      if (!groups[grp]) continue;
      if (!groupShape[grp]) groupShape[grp] = { from: id, shape: groups[grp] };
      else if (JSON.stringify(groupShape[grp].shape) !== JSON.stringify(groups[grp])) throw new Error('the ' + grp + ' words of ' + id + ' are not shaped as those of ' + groupShape[grp].from);
    }
    // each one a sentence (or a template of one) by the page's rules, with no word of another place
    // (a template's slot names, {hands} and the like, are words.js's and never on screen: they are
    // read as a blank here; every sentence made from the template is checked whole in the Lives)
    LEAK_RE = leakRe(id); LEAK_OF = 'words of ' + id;
    if (!LUCK[id]) throw new Error('page-smoke.js has no luck words for the place "' + id + '" (LUCK)');
    stringsOf(p).forEach(function (w) {
      var fault = sentenceFault(w.s.replace(/\{[A-Za-z]+\}/g, '{}'));
      if (fault) throw new Error(fault + ' (' + w.path + ')');
      // its luck only where your own luck or the futures' luck is told
      var rel = w.path.slice(id.length + 1).replace(/^lexicon\./, '');
      var lm = LUCK[id].words.exec(w.s);
      if (lm && LUCK_KEYS.concat(LUCK[id].also).indexOf(rel) < 0) throw new Error('the luck of ' + id + ' ("' + lm[2] + '") in "' + rel + '", which is not one of the sentences that tell your own luck: "' + w.s + '"');
      lexiconStrings++;
    });
    if (typeof p.afterword !== 'string') throw new Error('the afterword of ' + id + ' is not a paragraph');
    // its short label in the choice of places: one word, short enough for five to a row
    var lab = W.placeLabel(id);
    if (!/^[A-Z][a-z]+$/.test(lab) || lab.length > 10) throw new Error('the label of ' + id + ' is not one short word: "' + lab + '"');
    // its five situations, as the page names them (AYWords.title, never the engine's titles)
    W.use(id);
    rulesAgainstCopy(id);
    where = 'the words of ' + id;
    for (s = 0; s < 5; s++) {
      var t = W.title(s), fault = sentenceFault(t);
      if (fault) throw new Error(fault + ' (title ' + s + ' of ' + id + ')');
      if (id === VALLEY && t !== engineTitles[s]) throw new Error('the valley\'s situation ' + s + ' is "' + t + '", the engine\'s "' + engineTitles[s] + '"');
    }
    LEAK_RE = null;
    // its sheet: the sheet's rules, and every mode on both sizes
    where = 'the sheet of ' + id;
    var problems = AYSheet.check(p.sheet);
    if (problems.length) throw new Error('the sheet of ' + id + ': ' + problems.join('; '));
    var names = ['Ash', 'Brae', 'Cole', 'Dunmore', 'Eld', 'Fenwick', 'Gale', 'Holt'];
    var hands = { 1: { revealed: true, arrived: true, they: true }, 2: { revealed: true, lost: true, they: false }, 6: { plan: true }, 7: { plan: false } };
    ['wide', 'compact'].forEach(function (kind) {
      [['sheet', { demo: [-1, 3] }], ['day', { names: names, kin: 1, hands: hands, kinWith: [{ id: 2, kinSent: true, theySent: true }], click: true, alt: 'a map' }],
       ['day', { names: names, kin: 7, hands: {}, crop: true, alt: 'a map' }], ['leaving', { names: names, kin: 2 }], ['after', { kin: 6 }]].forEach(function (m) {
        var svg = AYSheet.map(p.sheet, kind, m[0], m[1]);
        if (!/^<svg viewBox="[^"]+" role="img" aria-label="[^"]+" focusable="false">[\s\S]*<\/svg>$/.test(svg) || /undefined|NaN/.test(svg)) throw new Error('the ' + kind + ' ' + m[0] + ' sheet of ' + id + ' is not drawn whole');
        sheetsDrawn++;
      });
    });
    [AYSheet.key(p.sheet, 'turned'), AYSheet.glyph(p.sheet, { lost: true, they: true }), AYSheet.seal(p.sheet)].forEach(function (svg) {
      if (!/^<svg [\s\S]*<\/svg>$/.test(svg) || /undefined|NaN/.test(svg)) throw new Error('a small drawing of ' + id + ' is not drawn whole');
    });
  });
  // a word that is missing throws: it is never taken from another place
  where = 'a missing word';
  var V = PL.byId[VALLEY], whole = V.lexicon, bare = {}, threw = null, key2;
  for (key2 in whole) if (key2 !== 'luckNote') bare[key2] = whole[key2];
  V.lexicon = bare;
  W.use(VALLEY);
  try { W.fordNote(); } catch (e) { threw = String(e && e.message); }
  V.lexicon = whole;
  if (!threw || threw.indexOf('"luckNote"') < 0) throw new Error('a place without its luck note did not throw: ' + threw);
  threw = null;
  try { W.use('nowhere'); } catch (e2) { threw = String(e2 && e2.message); }
  if (!threw) throw new Error('an unknown place was put in force');
  W.use(VALLEY);
})();

// Wrap every function of AYWords: count the call, check what it returns (top-level calls only).
// AYWords.use (which puts a place's words in force) and AYWords.title (which looks up one of the
// place's five situation titles) are the lexicon's switch and lookup, not sentences made from
// engine data: they are left out here, and every string they can give was checked above.
// AYWords.placeLabel (a place's short label in the choice of places) is a lookup in the same way.
var NOT_WORDS = ['use', 'title', 'placeLabel'];
// The words of a stock (a gauge on each tie): asked for only where the place has one.
var STOCK_WORDS = ['bankNow', 'bankDay', 'banksAtEnd', 'legendGauge'];
// The words of each feature group: asked for only where the place has the feature (FEATURE_GROUPS).
var FEATURE_WORDS = { stock: STOCK_WORDS, town: ['dayTown'], lastSeason: ['seasonRests'] };
var NAMES = Object.keys(W).filter(function (k) { return typeof W[k] === 'function' && NOT_WORDS.indexOf(k) < 0; });
NAMES.forEach(function (name) {
  var fn = W[name];
  called[name] = 0;
  W[name] = function () {
    depth++;
    var out;
    try { out = fn.apply(W, arguments); } finally { depth--; }
    if (depth === 0) { called[name]++; checkValue(out, name); }
    return out;
  };
});

// ---- engine field checks --------------------------------------------------------------------

var fieldsRead = 0;
function need(obj, path, label) {
  var parts = path.split('.'), cur = obj;
  for (var i = 0; i < parts.length; i++) {
    if (cur === null || cur === undefined) throw new Error('engine field missing: ' + label + '.' + path + ' at ' + where);
    cur = cur[parts[i]];
  }
  if (cur === undefined) throw new Error('engine field undefined: ' + label + '.' + path + ' at ' + where);
  fieldsRead++;
  return cur;
}
function needAll(obj, paths, label) { for (var i = 0; i < paths.length; i++) need(obj, paths[i], label); }
function isNum(x, label) { if (typeof x !== 'number' || !isFinite(x)) throw new Error('not a finite number: ' + label + ' = ' + x + ' at ' + where); }

// ---- ways of playing ------------------------------------------------------------------------

var POLICIES = {
  'always send': function (n, day) { return true; },
  'send unless left short': function (n, day) { return n.situation !== 2; },
  'send unless left short, stay home on day 12': function (n, day) { return day === 12 ? false : n.situation !== 2; },
  // three more, for the corners of the copy: untested ways, a store below the need, mixed
  // tallies, and a careful Life that can earn the seal
  'never send': function (n, day) { return false; },
  // the old way itself, which is the place's custom (life.params.CUSTOM: in the valley, send a hand to
  // someone new and then do as they did yesterday): the two rows of the Chronicle are then the same in every future
  'the old way': function (n, day) { return CUR_CUSTOM[n.situation] === 1; },
  'mixed': function (n, day, seed) { return A.draw(seed, 99, day, n.id, 0, 0) < 0.6; },
  'send, except to a house never seen to send': function (n, day) {
    var h = 0, c = 0, s;
    for (s = 0; s < 5; s++) { h += n.seen[s].h; c += n.seen[s].n; }
    return !(day > 2 && c >= 3 && h === 0);
  }
};
var REQUIRED = ['always send', 'send unless left short', 'send unless left short, stay home on day 12'];
var CUR_CUSTOM = [1, 1, 0, 1, 0];                    // the custom of the Life being played (liveOne sets it)
// A place's own ways of playing, after the valley's (which every place plays, in their order): the
// one its tuners found honest, which can earn its seal, and its selfish act. Each Life starts its
// memory afresh on day 1 (the policy sees only what the page shows: today()'s neighbour).
var MEMO = {};
function memoOf(tag, n, day, seed) { var key = tag + ':' + seed + ':' + n.id; if (day === 1 || !MEMO[key]) MEMO[key] = { miss: 0, ever: false }; return MEMO[key]; }
// The Banks' peacemaker (fix-banks/policies.js; a "hand" is keeping to your water): keep to your water
// with a boat you have not fished beside and with any boat that kept to its water yesterday; when
// their nets were in yours and yours not in theirs, let a first slip go from a boat that has kept to
// its water before, otherwise fish across; when nets crossed both ways, keep to your water: peace.
function peacemaker(n, day, seed, tag) {
  var m = memoOf(tag, n, day, seed), y = n.yesterday;
  if (!y) return true;
  if (y.they) { m.miss = 0; m.ever = true; return true; }
  m.miss++;
  if (n.situation === 4) return true;
  return m.ever && m.miss < 2;
}
var PLACE_POLICIES = {
  banks: {
    'the peacemaker': function (n, day, seed) { return peacemaker(n, day, seed, 'peace'); },
    // its selfish act, "fish across where it pays": on day 12 across everyone; on day 11 across a boat
    // that will not answer in time (not the sister, seen to keep to its water after being fished
    // across at least 60% of the times seen, on a day after both kept to their water)
    'the peacemaker, fishing across where it pays on the last two days': function (n, day, seed) {
      var c = peacemaker(n, day, seed, 'selfish'), sh = n.seen[2];
      if (day === 12) return false;
      if (day === 11 && !n.kin && sh.n >= 1 && sh.h / sh.n >= 0.6 && n.situation === 1) return false;
      return c;
    }
  }
};
// The Watch (fix-watch/policies-fw.js): "first to stand down, with second chances": stand down to every
// tower on first meeting, with a tower that stood down with you, and toward one that stood down to you;
// after a fire on their tower or on both, stand down again unless the tower is known not to answer, and
// even then once after a fire and once after fires on both, the second chances starting afresh when the
// page starts the tower's record afresh (seenSince). Its selfish act on the last day: stand down only
// where a stand-down is expected back.
var THEIRS = [0, 1, 3, 2, 4];
function watchAnswers(n) { var r = (n.changedDay !== null ? n.seenSince : n.seen)[3]; return r.n < 2 || 2 * r.h >= r.n; }
function watchHonest(n, day, seed, tag) {
  var m = memoOf(tag, n, day, seed), s = n.situation;
  if (m.era !== n.changedDay) { m.era = n.changedDay; m.fire = false; m.standoff = false; }
  if (s === 0 || s === 1 || s === 3) return true;
  if (watchAnswers(n)) return true;
  if (s === 2 && !m.fire) { m.fire = true; return true; }
  if (s === 4 && !m.standoff) { m.standoff = true; return true; }
  return false;
}
function watchExpected(n) { var t = (n.changedDay !== null ? n.seenSince : n.seen)[THEIRS[n.situation]]; return t.n ? 2 * t.h >= t.n : n.situation === 1; }
// The Bridges (fix-bridges/policies.js, the tuner's turnsAfterJams): "take turns, at the jams too": let a
// new carter go first; after one of you crossed, the other goes next; after both waited, go; after the
// wheels locked, give way the first time and hold the next, by turns with each carter. Its selfish act on
// the last three days, "cross while you can": drive on wherever the other looks likely to give way (a
// quarter of the times seen, in the spot it is in), give way wherever not.
function bridgesHonest(n, day, seed, tag) {
  var m = memoOf(tag, n, day, seed);
  switch (n.situation) {
    case 0: return true;
    case 2: return false;
    case 3: return true;
    case 4: m.jams = (m.jams || 0) + 1; return m.jams % 2 === 1;
    default: return false;
  }
}
function bridgesLikely(n) {
  var t = n.seen[THEIRS[n.situation]], h = 0, c = 0, s;
  if (t.n) return 4 * t.h >= t.n;
  for (s = 0; s < 5; s++) { h += n.seen[s].h; c += n.seen[s].n; }
  return c ? 4 * h >= c : true;
}
// The Saltmarket (tune-saltmarket/policies.js): "the seller who never puts the price back": the valley's
// careful (hold on day 1; with a stall never seen to hold, hold if it is your sister's or held beside a
// stall new to it, while it has failed you fewer than three days running; cut back once at a stall seen
// not to go back to the price; otherwise hold while patient), and always cut after your own price was cut
// while theirs held. Its selfish act on the last day: hold the price where it would cut it, beside a stall
// whose price is expected to hold.
function saltHonest(n, day, seed, tag) {
  var m = memoOf(tag, n, day, seed), s = n.situation, base;
  if (n.yesterday) { m.miss = n.yesterday.they ? 0 : m.miss + 1; if (n.yesterday.they) m.ever = true; }
  var owing = n.seen[3], patient = m.miss < 3;
  if (day === 1) base = true;
  else if (!m.ever) base = (n.kin || n.seen[0].h >= 1) && patient;
  else if (!n.kin && owing.n >= 1 && owing.h / owing.n < 0.5) base = s !== 2;
  else base = patient;
  return s === 3 ? false : base;
}
function saltExpected(n) { var t = n.seen[THEIRS[n.situation]]; return t.n ? 2 * t.h >= t.n : n.situation === 1; }
PLACE_POLICIES.watch = {
  'first to stand down, with second chances': function (n, day, seed) { return watchHonest(n, day, seed, 'watch'); },
  'first to stand down, keeping watch unless answered on the last day': function (n, day, seed) {
    var c = watchHonest(n, day, seed, 'watchSelfish');
    return day === 12 && c ? watchExpected(n) : c;
  }
};
PLACE_POLICIES.bridges = {
  'take turns, at the jams too': function (n, day, seed) { return bridgesHonest(n, day, seed, 'bridges'); },
  'take turns, crossing while you can on the last three days': function (n, day, seed) {
    var c = bridgesHonest(n, day, seed, 'bridgesSelfish');
    return day >= 10 ? !bridgesLikely(n) : c;
  }
};
PLACE_POLICIES.saltmarket = {
  'never put the price back': function (n, day, seed) { return saltHonest(n, day, seed, 'salt'); },
  'never put the price back, but hold it again on the last day': function (n, day, seed) {
    var c = saltHonest(n, day, seed, 'saltSelfish');
    return day === 12 && !c && saltExpected(n) ? true : c;
  }
};
var PLACE_REQUIRED = { banks: ['the peacemaker'], watch: ['first to stand down, with second chances'],
                       bridges: ['take turns, at the jams too'], saltmarket: ['never put the price back'] };       // played on every seed, so that the seal is shown earned
// Seeds on which a place's honest way of playing earns the seal at the page's own counts (found by
// page-p4/check/seal-seeds.js), played with it at full counts after the seeds above, so that "a Life
// earned the seal" does not rest on the luck of the smaller counts.
var PLACE_SEAL_SEEDS = { banks: [19], watch: [4], bridges: [4], saltmarket: [10, 15] };
// A few more Lives of a place, [seed, way of playing], where its own seeds above leave a wording unreached
// (found by page-p4/check/find-ownsince.js): the Watch's own-way card on a tower that changed a way and
// was seen once since, and the Saltmarket's.
var PLACE_COVER_LIVES = { watch: [[39, 'first to stand down, with second chances']], saltmarket: [[40, 'never put the price back']] };
// Lives of a place whose rules replay the last season, [seed, way of playing, the line shown], played at the
// page's own counts: its honest way where the seal would have been earned but for the season replay (the
// line must show), and where the replay withholds a seal that was out of reach anyway (a short house, a seal
// bought on the last day: the line must be refused). Found by review-fix1/check/season-l1.js. A fourth entry,
// true, marks a Life whose replayed mark (mark + season.delta) still stands above the noise the page states
// (markNoise), so that a line which says only that the place would not have been better off is read where
// it is false (found by review-fix2/check/season-above.js).
var PLACE_SEASON_LIVES = {
  watch: [[115, 'first to stand down, with second chances', true], [13, 'first to stand down, with second chances', false],
          [45, 'first to stand down, with second chances', true, true]],
  saltmarket: [[35, 'never put the price back', true], [94, 'never put the price back', false], [113, 'never put the price back', false]]
};
function policiesOf(id) {
  if (!PLACE_POLICIES[id]) return POLICIES;
  var out = {}, k;
  for (k in POLICIES) out[k] = POLICIES[k];
  for (k in PLACE_POLICIES[id]) out[k] = PLACE_POLICIES[id][k];
  return out;
}
function requiredOf(id) { return REQUIRED.concat(PLACE_REQUIRED[id] || []); }

// ---- one complete Life, as app.js runs it ---------------------------------------------------

function freshStats() {
  return { lives: 0, whyYou: 0, whyOwn: 0, whyHouse: 0, whyBlank: 0, third: 0, lost: 0, seasonEnds: 0,
              sealed: 0, kept: 0, lastDay: 0, matteredHabit: 0, matteredLast: 0, matteredNone: 0, held: 0,
              ownSince: [0, 0, 0],   // own-way cards on a house that changed a way: not seen since, seen once, seen more
              keepsNoArc: 0,         // neighbours the map marks as keeping your ways with no habit learned from you directly
              lastFrameMoved: 0,     // watched futures whose resting map differs from season 30's frame
              secondHand: 0,         // season's-end lines for a house that took up your ways from another house
              noHand: 0,             // reveals in which no hand went either way
              markSame: 0, rangeSaid: 0,   // Chronicles with two equal counts; with "yours holds in N%" under the scale
              matteredOneSided: 0,   // "mattered" lines for a way the reader always kept one way
              wentBack: 0,           // watched futures' lines for a house that gives up your ways and goes back to its own
              lastDayHabit: 0,       // last-day lines of the habit replay (REPLAY 'habit' or 'season')
              bank: {}, bankThem: 0,     // a place with a stock: the gauges' words by kind; the sister's banks told
              cardsCounted: 0,           // cards whose number was checked against the stakes of their outcome
              negStore: 0,               // stores told below zero
              townSome: 0, townNone: 0,     // an inverted charter: town lines with an extra cost, and with none
              seasonRests: 0, seasonRefused: 0,     // seals withheld by the season replay alone, told; its line refused elsewhere
              seasonRefusedWon: 0,                  // refused where the replay withheld a seal that was out of reach anyway
              seasonRestsClear: 0,                  // told where the replayed mark still stood above the noise the page states
              lateExact: 0 };                        // strips in words whose late figure took a decimal more, so as to stay on its side of the line
}
var stats = freshStats();
var MIRROR = [0, 1, 3, 2, 4];        // my situation on a tie -> theirs (as in app.js)

// app.js: which habits of each neighbour came from the reader, and which neighbours run the
// reader's ways as a whole (followNow and keepsNow there)
function followOf(life) {
  var out = {}, i, s, src;
  for (i = 0; i < life.neighbours.length; i++) {
    src = life.houses[life.neighbours[i]].source; out[life.neighbours[i]] = [];
    for (s = 0; s < 5; s++) out[life.neighbours[i]].push(!!(src && src[s] && src[s].type === 'you'));
  }
  return out;
}
function keepsOf(life) {
  var out = {}, follow = followOf(life), i, id, way;
  for (i = 0; i < life.neighbours.length; i++) {
    id = life.neighbours[i]; way = life.houses[id].way;
    out[id] = (way === 0 || way === life.kin) && (id !== life.kin || follow[id].indexOf(true) >= 0);
  }
  return out;
}
// The day's map in words, as app.js builds it (drawDayMap): plans while choosing, results once closed.
// app.js drawDayMap: where the place has a stock, each item also carries its bank (this morning's
// level while choosing, as the closed day left it at the season's end, before and after once
// revealed) and the map's words are asked with the Life's rules.
function mapAlt(t, phase, items, results, p) {
  if (!p.STOCK) return W.mapAltDay(t.day, phase, items, p);
  items.forEach(function (it, k) {
    it.bank = phase === 'revealed' ? { before: results[k].stock, after: results[k].stockAfter } : { level: results ? results[k].stockAfter : t.neighbours[k].stock };
  });
  var said = W.mapAltDay(t.day, phase, items, p);
  items.forEach(function (it, k) {
    var bit = phase === 'revealed' ? W.bankDay(it.bank.before, it.bank.after, p, false).say : (it.bank.level + ' with ');
    if (said.indexOf(bit) < 0) throw new Error('the map in words does not say the bank of ' + it.name + ' (' + bit + '): ' + said);
  });
  return said;
}
function mapItems(t, follow, keeps, pending, results) {
  return t.neighbours.map(function (nb, k) {
    var arcs = 0, q;
    for (q = 0; q < 5; q++) if (follow[nb.id][q]) arcs++;
    return { name: nb.name, kin: nb.kin, plan: pending[nb.id], result: results ? results[k] : null, arcs: arcs, keeps: !!keeps[nb.id] };
  });
}
// No sentence about a day's dealings may say that the other house stayed home: the page only
// knows that no hand arrived (engine header: never say whether a missing hand was a choice).
// Each place says it in its own words, so each place has its own pattern; a place without one
// is not checked at all (runPlace throws).
var PLACE_RULES = {
  valley: { neutral: /both (houses )?stayed home|they stayed home/i },
  // the Banks: nets in your water are seen; that they fished across is never said of the other boat
  banks: { neutral: /they fished across|both (boats )?fished across|you both fished|fished across (into )?(yours|your water)/i },
  // the Watch: a fire on their tower is seen; that they kept watch is never said of the other tower
  watch: { neutral: /they kept watch|they keep watch|both (towers )?kept watch|you both kept watch|lit a fire on purpose/i },
  // the Bridges: a cart coming on is seen; that they drove on is never said of the other carter
  bridges: { neutral: /they drove on|they drive on|both (carts |carters )?drove on|you both drove on/i },
  // the Saltmarket: a cut price is seen; that they cut it is never said of the other stall
  saltmarket: { neutral: /they cut|both (stalls |sellers )?cut|you both cut|cut by them/i }
};
// The time the check may take: the valley's coverage (114 Lives) took 24 s on a quiet machine;
// each place is checked at that coverage, so 60 s for each place checked.
var SECONDS_A_PLACE = 60;
var PLACE = null;                    // the place being checked
function neutral(s, fn) {
  if (PLACE_RULES[PLACE].neutral.test(s)) throw new Error('a missing hand told as a choice by AYWords.' + fn + ': "' + s + '" at ' + where);
}
// The back of a Why? card: its plain lines (what was known of them) and its "Even so" line (their act today)
// are about the other side's acts, so they keep both rules. The lead, count and deed lines name the
// reader's own acts and the situation's title, and are left to the deed's own words.
function whyBack(card, fn) {
  card.lines.forEach(function (ln) {
    if (ln.kind === 'even' || ln.kind === 'plain') neutral(ln.text, fn);
    noLuck(ln.text, fn);
  });
}

// ---- a place with a stock (the Banks): its gauges and their words ----------------------------------
function stockStep(level, hands, st) { var v = level + st.delta[hands]; return v < st.min ? st.min : v > st.max ? st.max : v; }
function levelOk(lv, st, what) {
  if (typeof lv !== 'number' || lv !== Math.round(lv) || lv < st.min || lv > st.max) throw new Error(what + ' is not a whole level within ' + st.min + '..' + st.max + ': ' + lv + ' at ' + where);
}
// The words a gauge must carry, worked out here from the template of the kind its levels call for
// (not by AYWords): exactly that text and that sentence, so that each is true at both ends.
function expectBank(key, bank, level, p, lex) {
  function put(t) { return t.replace('{bank}', bank).replace('{level}', String(level)).replace('{max}', String(p.STOCK.max)); }
  return { text: put(lex.stock[key].text), say: put(lex.stock[key].say) };
}
function bankWordsCheck(got, before, after, p, lex, them) {
  var st = p.STOCK, key;
  if (after > before) key = after >= st.max ? 'fillsFull' : 'fills';
  else if (after < before) key = after <= st.min ? 'fallsSpent' : 'falls';
  else key = after >= st.max ? 'staysFull' : after <= st.min ? 'staysSpent' : 'stays';
  var want = expectBank(key, them ? lex.stock.them : lex.stock.you, after, p, lex);
  if (got.text !== want.text || got.say !== want.say) throw new Error('the bank from ' + before + ' to ' + after + ' is told as "' + got.text + '" / "' + got.say + '", not "' + want.text + '" / "' + want.say + '" at ' + where);
  if (!them) stats.bank[key] = (stats.bank[key] || 0) + 1;
}
function bankMorning(n, p, lex) {
  levelOk(need(n, 'stock', 'today.neighbours'), p.STOCK, 'the bank on a card');
  var key = n.stock >= p.STOCK.max ? 'full' : n.stock <= p.STOCK.min ? 'spent' : 'holds', got = W.bankNow(n.stock, p), want = expectBank(key, lex.stock.you, n.stock, p, lex);
  if (got.text !== want.text || got.say !== want.say) throw new Error('the bank at ' + n.stock + ' is told as "' + got.text + '" / "' + got.say + '" at ' + where);
  stats.bank[key] = (stats.bank[key] || 0) + 1;
}
// A closed day on a tie: the level it was played on is this morning's, it moved by the Life's rule
// (delta by how many acts arrived, within min..max), the next morning starts from it, the card's
// number is the stakes at that level, and the card's words say what the day did.
function bankClosed(x, nb, nbAfter, p, lex) {
  needAll(x, ['stock', 'stockAfter'], 'results');
  levelOk(x.stock, p.STOCK, 'the level a day was played on'); levelOk(x.stockAfter, p.STOCK, 'the level after a day');
  if (x.stock !== nb.stock) throw new Error('the day was played on a bank of ' + x.stock + ', the card showed ' + nb.stock);
  var hands = (x.arrived ? 1 : 0) + (x.they ? 1 : 0);
  if (x.stockAfter !== stockStep(x.stock, hands, p.STOCK)) throw new Error('the bank moved by no rule: ' + x.stock + ' to ' + x.stockAfter + ' with ' + hands + ' kept off');
  if (nbAfter.stock !== x.stockAfter) throw new Error('the next morning\'s bank is not the day\'s: ' + nbAfter.stock + ' against ' + x.stockAfter);
  var pay = p.B * x.stock * (x.they ? 1 : 0) - p.C * (x.arrived ? 1 : 0) + p.S * (x.arrived && x.they ? 1 : 0) - p.H * (!x.arrived && !x.they ? 1 : 0);
  if (x.payoff !== pay) throw new Error('the card\'s number ' + x.payoff + ' is not the stakes at a bank of ' + x.stock + ' (' + pay + ')');
  bankWordsCheck(W.bankDay(x.stock, x.stockAfter, p, false), x.stock, x.stockAfter, p, lex, false);
}

// overrides: rules moved for this Life only (the habit replay checked with words whose place has
// the valley's replay); app.js never passes any.
function liveOne(seedIn, policyName, verdictOptions, overrides) {
  var policy = policiesOf(PLACE)[policyName];
  where = PLACE + ' ' + seedIn + ', "' + policyName + '", start';
  var out = [];                                     // the Chronicle, for printing
  var life = overrides ? A.createLife(seedIn, PLACE, overrides) : A.createLife(seedIn, PLACE);
  var lex = PL.byId[PLACE].lexicon, ch = PL.byId[PLACE].charter, isValley = PLACE === VALLEY;
  var prm = life.params, stk = prm.STOCK || null;
  CUR_CUSTOM = prm.CUSTOM;                          // "the old way" plays the place's custom
  needAll(life, ['seed', 'kin', 'neighbours', 'houses', 'need', 'purse', 'over'], 'life');
  if (!(life.need > 0)) throw new Error('a need at or below zero: ' + life.need);
  if (life.purse !== (prm.STORE_START || 0)) throw new Error('the store does not start at the Life\'s starting store: ' + life.purse);
  var seed = life.seed, kinId = life.kin, i, s, d;
  if (life.neighbours.join(',') !== '1,2,6,7') throw new Error('neighbours are not [1,2,6,7]');

  // opening (its copy from the Life's rules, the list of earlier lives is checked at the end)
  var op = W.opening(life.params);
  if (op.lines.length !== 4) throw new Error('the opening has four lines: the choice, the cost, the copying, and what is counted at the end');
  if (isValley && !/two things are counted/.test(op.lines[3])) throw new Error('the opening does not say what is counted at the end');
  // the seasons are in words before day 4: ways are taken up at the end of every fourth day
  if (isValley && !/^What you do, others see\. Some will take it up as their own way, at the end of every fourth day\.$/.test(op.lines[2])) throw new Error('the opening does not say when ways are taken up: ' + op.lines[2]);
  if (!/every fourth day/.test(op.lines[2])) throw new Error('the opening does not say when ways are taken up: ' + op.lines[2]);
  if (op.lines[2].length > 95) throw new Error('the third line of the opening has grown past two lines on a phone: ' + op.lines[2].length + ' characters');
  // the choice of places names each place in its own words; the Chronicle's afterword is the place's
  W.placesHead(); W.otherPlace(); W.placeName(PLACE);
  if (W.afterword() !== PL.byId[PLACE].afterword) throw new Error('the afterword is not the place\'s own');
  // the Opening lists the latest lives and names the control that holds the rest
  if (W.pastMore(1) !== '1 older life' || W.pastMore(17) !== '17 older lives') throw new Error('the count of older lives is worded wrongly');
  W.pastHead(); W.valleyNo(seed); needAll(W.mapLabels(), ['ford', 'ridge', 'beyond', 'yours', 'heir', 'sister', 'north'], 'mapLabels');
  W.mapAlt('sheet'); W.mapAlt('day'); W.mapAlt('after');
  var st = W.stakes(life.params);                // the stakes on the opening sheet (app.js drawOpeningMap), the sample number in the key
  if (st.mine !== -life.params.C || st.theirs !== life.params.B * (life.params.STOCK ? life.params.STOCK.start : 1)) throw new Error('the stakes are not the Life\'s: ' + JSON.stringify(st));
  W.signed(st.mine); W.signed(st.theirs); W.num(21);
  W.legendHead(); W.legendDay(); W.legendAfter(); W.legendMarks(); W.legendWays(); W.mapHint();
  W.heir(true); W.heir(false); W.kin(true); W.kin(false);
  for (i = 0; i < 4; i++) { W.bearing(i); W.bearingShort(i); W.bearingSay(i); }
  W.send(); W.stay(); W.chooseLine(); W.knowHead(); W.knowFoot(); W.whyLabel(); W.whyBack(); W.whyHeads(); W.whyMarked();
  W.elsewhereHead(); W.waysHead(); W.waysNote(); W.fordNote(); W.storeHead(); W.mapFold(true); W.mapFold(false);
  if (stk) W.legendGauge(prm);                      // the gauge in the map keys

  var titles = [], youSeen = false;
  for (d = 1; d <= 12; d++) {
    where = PLACE + ' ' + seed + ', "' + policyName + '", day ' + d;
    var t = A.today(life), w = A.ways(life);
    needAll(t, ['day', 'season', 'dayOfSeason', 'purse', 'need', 'oldWayPurse', 'over', 'neighbours'], 'today');
    if (t.day !== d) throw new Error('today().day is ' + t.day + ', expected ' + d);
    if (t.neighbours.length !== 4) throw new Error('today().neighbours is not four long');
    W.dayOf(t.day); W.dayTrackAlt(t.day); if (t.day === 12) W.lastDayNote();
    W.statusDay(t.day);                               // the status line names the day where the header is out of sight
    var lw = W.legendWays();                          // the key of Your ways, by the point of the day
    needAll(lw, ['sent', 'stayed', 'yesterday', 'today', 'planned'], 'legendWays');
    needAll(W.legendDay(), ['arrived', 'turned', 'planned', 'home', 'yours', 'keeps'], 'legendDay');
    var storeSaid = W.store(t.purse, t.need); W.storeNeedTick(t.need); W.oldWay(t.oldWayPurse);
    isNum(t.purse, 'purse'); isNum(t.need, 'need'); isNum(t.oldWayPurse, 'oldWayPurse');
    if (d === 1 && t.purse !== (prm.STORE_START || 0)) throw new Error('day 1 does not show the starting store: ' + t.purse);
    if (t.purse < 0) {                                // a store below zero is told with its sign
      if (storeSaid.indexOf('\u2212' + (-t.purse) + ' of ') !== 0) throw new Error('a store below zero is told as ' + storeSaid);
      stats.negStore++;
    }

    // your ways panel
    if (w.length !== 5) throw new Error('ways() is not five long');
    for (s = 0; s < 5; s++) {
      needAll(w[s], ['situation', 'title', 'h', 'n', 'deeds'], 'ways[' + s + ']');
      titles[s] = W.title(s);                         // the place's own words for the situation, as app.js shows them
      W.wayCount(w[s].h, w[s].n);
      if (w[s].deeds.length !== w[s].n) throw new Error('ways deeds do not match n');
      for (i = 0; i < w[s].deeds.length; i++) {
        needAll(w[s].deeds[i], ['day', 'to', 'toName', 'helped'], 'ways.deeds');
        W.deed(w[s].deeds[i], s, kinId);              // each mark carries its deed as a title
      }
    }

    // the four cards, and the map's holdings
    var choices = {}, left = 4;
    var followNow = followOf(life), keepsNow = keepsOf(life);
    var closeFirst = W.closeDay(left);
    if (/more/.test(closeFirst) || (isValley && closeFirst !== 'Choose for all 4 houses')) throw new Error('before any choice the button must not say "more"');
    mapAlt(t, 'choose', mapItems(t, followNow, keepsNow, {}, null), null, prm);      // nothing chosen yet
    for (i = 0; i < 4; i++) {
      var n = t.neighbours[i];
      needAll(n, ['id', 'name', 'kin', 'situation', 'situationTitle', 'yesterday', 'seen', 'seenSince', 'changedDay'], 'today.neighbours');
      if (n.yesterday) needAll(n.yesterday, ['intended', 'lost', 'arrived', 'they', 'payoff'], 'today.neighbours.yesterday');
      W.cardName(n); neutral(W.yesterday(n.yesterday, prm), 'yesterday'); W.choiceLegend(n); W.wayHere(W.title(n.situation));
      if (stk) bankMorning(n, prm, lex);              // the gauge on the card's head, this morning
      else if (n.stock !== undefined) throw new Error('a stock on a tie of a place without one');
      W.who(n.name, n.kin, true); W.who(n.name, n.kin, false); W.house(n.name); W.House(n.name);
      var tallies = n.changedDay !== null ? n.seenSince : n.seen;
      if (n.changedDay !== null) W.knowChanged(n.changedDay);
      if (tallies.length !== 5) throw new Error('seen is not five long');
      for (s = 0; s < 5; s++) {
        needAll(tallies[s], ['h', 'n'], 'seen[' + s + ']');
        W.knowLabel(s); noLuck(W.knowValue(tallies[s].h, tallies[s].n), 'knowValue');
      }
      // the ring on the map: how many of this house's habits came from the reader
      var src = need(life.houses[n.id], 'source', 'life.houses'), arcs = 0;
      for (s = 0; s < 5; s++) if (need(src[s], 'type', 'life.houses.source') === 'you') arcs++;
      need(life.houses[n.id], 'name', 'life.houses');
      // and the diamond: the house runs your ways as a whole (the label the Afterwards opens with)
      var wayNow = need(life.houses[n.id], 'way', 'life.houses');
      isNum(wayNow, 'life.houses.way');
      if ((wayNow === 0 || wayNow === kinId) && (n.id !== kinId || arcs > 0) && arcs === 0) stats.keepsNoArc++;
      choices[n.id] = !!policy(n, d, seed);
      left--; W.closeDay(left);
      mapAlt(t, 'choose', mapItems(t, followNow, keepsNow, choices, null), null, prm);   // the map as each choice is made
    }

    // close the day
    var r = A.playDay(life, choices);
    var tAfter = A.today(life);                       // app.js: what was seen today goes into the cards' tallies at the reveal
    if (tAfter.neighbours.length !== 4) throw new Error('today() after the day closed is not four long');
    mapAlt(t, 'revealed', mapItems(t, followNow, keepsNow, {}, r.results), r.results, prm);
    w = A.ways(life);
    needAll(r, ['day', 'gained', 'purse', 'need', 'over', 'results', 'kinWith', 'lookingRound'], 'playDay');
    if (r.results.length !== 4) throw new Error('playDay().results is not four long');
    W.dayTotal(r.gained, r.purse, r.need); W.signed(r.gained); W.num(r.purse);
    if (prm.CHARTER === 'breaks') {                   // what the town paid for the ring today, with the day's total
      var pairs = 0, k2;
      for (k2 = 0; k2 < r.results.length; k2++) if (r.results[k2].arrived && r.results[k2].they) pairs++;
      var extra = 2 * prm.S * pairs, townSaid = W.dayTown(r.results, prm);
      if (extra > 0) { if (numbersIn(townSaid).indexOf(extra) < 0) throw new Error('the town line does not say the ' + extra + ' paid at ' + pairs + ' pairs: ' + townSaid); stats.townSome++; }
      else { if (townSaid !== lex.town.none) throw new Error('the town line says an extra cost on a day with none: ' + townSaid); stats.townNone++; }
    }
    for (i = 0; i < 4; i++) {
      var x = r.results[i];
      needAll(x, ['id', 'name', 'kin', 'situation', 'intended', 'lost', 'arrived', 'they', 'payoff',
                  'why.situation', 'why.source.type', 'why.source.from', 'why.source.fromName', 'why.source.far',
                  'why.source.deeds', 'why.source.digest', 'why.seen', 'why.againstHabit'], 'results');
      if (x.id !== t.neighbours[i].id) throw new Error('results are not in the order of the cards');
      if (stk) bankClosed(x, t.neighbours[i], tAfter.neighbours[i], prm, lex);      // what the day did to the bank, on the card
      else {                                          // the card's number is the stakes of its outcome (the Opening states each)
        var payX = prm.B * (x.they ? 1 : 0) - prm.C * (x.arrived ? 1 : 0) + prm.S * (x.arrived && x.they ? 1 : 0) - prm.H * (!x.arrived && !x.they ? 1 : 0);
        if (x.payoff !== payX) throw new Error('the card\'s number ' + x.payoff + ' is not the stakes of its outcome (' + payX + ')');
        if (x.arrived !== (x.intended && !x.lost)) throw new Error('an act arrived that was not sent, or was lost');
        stats.cardsCounted++;
      }
      var rv = W.reveal(x, prm);
      neutral(rv.text, 'reveal');
      if (!x.arrived && !x.they && !x.lost) stats.noHand++;
      // "What you know of them" once the day is closed: the morning's tallies plus what the
      // whole-Life tally gained today (app.js knowNodes). A count, never negative, never h above n;
      // for a house that has not changed a way it is today()'s own tally.
      var nbA = tAfter.neighbours[i], nbB = t.neighbours[i], baseT = nbB.changedDay !== null ? nbB.seenSince : nbB.seen, gained = 0;
      if (nbA.id !== nbB.id) throw new Error('today() after the day lists the neighbours in another order');
      for (s = 0; s < 5; s++) {
        needAll(nbA.seen[s], ['h', 'n'], 'today(after).seen[' + s + ']');
        var th = baseT[s].h + nbA.seen[s].h - nbB.seen[s].h, tn = baseT[s].n + nbA.seen[s].n - nbB.seen[s].n;
        if (!(th >= 0 && tn >= th && tn >= baseT[s].n)) throw new Error('tallies after the reveal are not counts: ' + th + ' of ' + tn);
        if (nbB.changedDay === null && (th !== nbA.seen[s].h || tn !== nbA.seen[s].n)) throw new Error('tallies after the reveal differ from today()');
        gained += tn - baseT[s].n;
        W.knowValue(th, tn);
      }
      if (gained < 1) throw new Error('a day was closed and nothing new is known of the ' + nbB.name + ' house');
      // every Why? is turned over. For a house that changed a way the back counts since that
      // change, from the same tally as the row the front marks for today.
      var nb = t.neighbours[i], since = null;
      if (MIRROR[nb.situation] !== x.why.situation) throw new Error('the row marked for today is not the situation on the back of the card');
      if (nb.changedDay !== null) {
        since = { changedDay: nb.changedDay, seen: need(nb.seenSince, String(x.why.situation), 'today.neighbours.seenSince') };
        needAll(since.seen, ['h', 'n'], 'seenSince[why.situation]');
      }
      var card = W.why(x, kinId, since);
      whyBack(card, 'why');
      if (since && x.why.source.type === 'own') {
        stats.ownSince[Math.min(2, since.seen.n)]++;
        var front = W.knowValue(since.seen.h, since.seen.n), tail = card.lines[card.lines.length - 1].text;
        if (tail.indexOf('at the end of day ' + nb.changedDay + '.') < 0) throw new Error('a changed house\'s card does not say since when it counts: ' + tail);
        if (since.seen.n > 1 && (isValley ? tail.indexOf(since.seen.h + ' of ' + since.seen.n + ' times') < 0
                                          : numbersIn(tail).slice(1).join() !== [since.seen.h, since.seen.n].join())) throw new Error('front "' + front + '" and back "' + tail + '" count differently');
      }
      if (!card.lines.length) throw new Error('empty Why? card');
      card.lines.forEach(function (ln) {
        if (['lead', 'count', 'deed', 'more', 'even', 'plain'].indexOf(ln.kind) < 0) throw new Error('unknown Why? line kind: ' + ln.kind);
        if (ln.kind === 'deed' && typeof ln.sent !== 'boolean') throw new Error('a deed line without its mark');
      });
      stats['why' + x.why.source.type.charAt(0).toUpperCase() + x.why.source.type.slice(1)]++;
      if (x.lost) stats.lost++;
      if (x.why.source.type === 'you') {
        needAll(x.why.source.digest, ['n', 'sent', 'stayed', 'latest', 'dissent'], 'why.source.digest');
        youSeen = true;
      } else if (x.why.source.type === 'own') needAll(x.why.seen, ['h', 'n'], 'why.seen');
    }
    for (i = 0; i < r.kinWith.length; i++) {
      var e = r.kinWith[i];
      needAll(e, ['id', 'name', 'kinSent', 'theySent', 'why.situation', 'why.source.type'], 'kinWith');
      if (stk) {                                      // the bank of the sister's dealing, drawn on the day's map
        needAll(e, ['stock', 'stockAfter'], 'kinWith');
        if (e.stockAfter !== stockStep(e.stock, (e.kinSent ? 1 : 0) + (e.theySent ? 1 : 0), stk)) throw new Error('the sister\'s bank with the ' + e.name + ' boat moved by no rule: ' + e.stock + ' to ' + e.stockAfter);
        bankWordsCheck(W.bankDay(e.stock, e.stockAfter, prm, true), e.stock, e.stockAfter, prm, lex, true);
        stats.bankThem++;
      }
      var elseSaid = W.elsewhere(e);
      neutral(elseSaid, 'elsewhere'); noLuck(elseSaid, 'elsewhere');
      if (e.why.source.type === 'you') { whyBack(W.whyThird(e, life.houses[kinId].name, kinId), 'whyThird'); stats.third++; youSeen = true; }
    }
    for (s = 0; s < 5; s++) W.wayCount(w[s].h, w[s].n);
    var lr = r.lookingRound;
    if ((d % 4 === 0) !== !!lr) throw new Error('lookingRound present on the wrong day');
    W.nextDay(lr ? 'season' : 'day');
    if (lr) {
      needAll(lr, ['season', 'kin.id', 'kin.name', 'kin.changed', 'kin.habits', 'reconsidered'], 'lookingRound');
      for (i = 0; i < lr.kin.habits.length; i++) needAll(lr.kin.habits[i], ['situation', 'before', 'after', 'source', 'h', 'n'], 'lookingRound.kin.habits');
      for (i = 0; i < lr.reconsidered.length; i++) {
        needAll(lr.reconsidered[i], ['house', 'name', 'model', 'modelName', 'adopted', 'took', 'visible', 'modelVisible', 'changed'], 'lookingRound.reconsidered');
      }
      // the map now shows what was taken up: a house that keeps your ways at second hand is told so
      var keepsAfter = keepsOf(life), followAfter = followOf(life);
      var se = W.seasonEnd(lr, kinId, titles, keepsAfter);
      if (!se.kin) throw new Error("season's end without the kin line");
      [se.head, se.intro, se.kin].concat(se.changes, se.houses).forEach(function (line) { noLuck(line, 'seasonEnd'); });
      se.changes.forEach(function (line) { if (/: they /.test(line)) throw new Error('a pronoun that reads two ways: ' + line); });
      var secondTails = [lex.reconsidered.farSecond, lex.reconsidered.kinSecond, lex.reconsidered.houseSecond].map(tailOf);
      lr.reconsidered.forEach(function (e2) {
        if (!e2.visible || !(e2.adopted && e2.took > 0) || e2.model === 0 || !keepsAfter[e2.house]) return;
        stats.secondHand++;
        if (!se.houses.some(function (line) { return secondTails.some(function (t) { return line.slice(-t.length) === t; }); })) throw new Error('a house took up your ways at second hand and was not told so');
      });
      mapAlt(t, 'season', mapItems(t, followAfter, keepsAfter, {}, null), r.results, prm);
      W.kinFollows(0);
      stats.seasonEnds++;
      W.nextDay(d === 12 ? 'leave' : 'day');
    }
    if (r.over !== (d === 12)) throw new Error('playDay().over is wrong on day ' + d);
  }

  // leaving
  where = PLACE + ' ' + seed + ', "' + policyName + '", leaving';
  var lg = A.legacy(life), wf = A.ways(life), tf = A.today(life);
  needAll(lg, ['hollow', 'heir', 'h', 'n', 'kin.fromYou', 'kin.name'], 'legacy');
  W.leavingHead(); var leftSaid = W.leavingStore(tf.purse, tf.need); W.leaveHead(); W.leaveSub(); W.leaveButton();
  if (tf.purse < 0 && leftSaid.indexOf(': \u2212' + (-tf.purse) + ' of ') < 0) throw new Error('a store left below zero is told as ' + leftSaid);
  if (tf.purse < tf.need && numbersIn(leftSaid).indexOf(tf.need - tf.purse) < 0) throw new Error('the store short of the need is not told by how much: ' + leftSaid);
  if (stk) tf.neighbours.forEach(function (n) { levelOk(n.stock, stk, 'the bank on the Leaving map'); });
  var fromYou = 0;
  for (s = 0; s < 5; s++) {
    need(lg.hollow, String(s), 'legacy.hollow'); need(lg.heir, String(s), 'legacy.heir'); need(lg.kin.fromYou, String(s), 'legacy.kin.fromYou');
    isNum(lg.heir[s], 'legacy.heir');
    W.leaveNote(wf[s].h, wf[s].n, lg.hollow[s], lg.heir[s]);
    if (lg.kin.fromYou[s]) fromYou++;
  }
  W.kinFollows(fromYou);

  // the Afterwards: one watched future, and the verdict in slices
  where = PLACE + ' ' + seed + ', "' + policyName + '", afterwards';
  var f = A.runFuture(life, 0);
  var job = A.verdictJob(life, verdictOptions);
  needAll(job, ['futures', 'futuresDone', 'done', 'progress'], 'job');
  needAll(f, ['holds', 'level', 'arrival', 'yourWaysLastSeason', 'yourWaysAtEnd', 'seasons', 'finalWay', 'lateFlow'], 'future');
  isNum(f.lateFlow, 'lateFlow');
  if (f.arrival) needAll(f.arrival, ['season', 'house', 'replaced', 'name'], 'future.arrival');
  if (f.seasons.length !== 30) throw new Error('the future is not thirty seasons long');
  W.afterHead(); W.oneFuture(job.futures); W.tickerHead(); var fl = W.flowLabels(life.params); needAll(fl, ['head', 'half', 'late', 'rule'], 'flowLabels'); W.skip(); W.seeCount();
  var lineNow = lineSaid(life.params), top = flowTop(life.params);
  if (fl.rule.indexOf(lineNow) < 0 || fl.half.indexOf(lineNow) < 0) throw new Error('the strip does not name the line the engine uses (' + lineNow + '): ' + fl.half + ' / ' + fl.rule);
  var flowSaid = W.flowAlt(f, life.params);           // the strip in words, set when the future has played
  if (isValley && !/Season 1: \d+ in 100\. Lowest: \d+ in 100, in season \d+\. Last ten seasons: \d+ in 100/.test(flowSaid)) throw new Error('the strip in words lost a number: ' + flowSaid);
  if (flowSaid.indexOf(lineNow) < 0) throw new Error('the strip in words does not name the line the engine uses (' + lineNow + '): ' + flowSaid);
  // the last ten seasons' figure, read against the line as the words state it, falls on the future's own side
  // (the valley's words are frozen as published and keep their rounding)
  if (PL.byId[PLACE].charter.flowAlt.indexOf('Last ten seasons: {late}') < 0) throw new Error('the strip in words does not say the last ten seasons as "Last ten seasons: {late}"');
  var lateM = /Last ten seasons: (\d+(?:\.\d+)?)/.exec(flowSaid), scaleF = life.params.FLOW_KIND === 'stock' ? life.params.STOCK.start : 100;
  if (!lateM) throw new Error('the strip in words lost its late figure: ' + flowSaid);
  var lateV = Number(lateM[1]), lineV = Math.round(life.params.HOLD_LINE * scaleF * 1e9) / 1e9;
  if (Math.abs(lateV - f.lateFlow * scaleF) > (life.params.FLOW_KIND === 'stock' ? 0.05 : 0.5) + 1e-9) throw new Error('the late figure ' + lateV + ' is not the future\'s (' + (f.lateFlow * scaleF) + '): ' + flowSaid);
  if (!isValley && ((life.params.CHARTER === 'breaks' ? lateV < lineV : lateV >= lineV) !== !!f.holds)) throw new Error('the late figure ' + lateV + ' falls on the other side of the line ' + lineV + ' from the future (holds ' + f.holds + '): ' + flowSaid);
  if (!isValley && lateM[1] !== String(Math.round(f.lateFlow * scaleF * (life.params.FLOW_KIND === 'stock' ? 10 : 1)) / (life.params.FLOW_KIND === 'stock' ? 10 : 1))) stats.lateExact++;
  var all = W.futureLines(f, kinId), backTail = tailOf(lex.adopt.backFromYours);
  // a house that returns from your ways to the way it began with "goes back to its own"
  all.forEach(function (l) {
    if (/gives up your ways for the \w+ way again/.test(l.text)) throw new Error('a house going back to its own way is told as taking it "again": ' + l.text);
    if (l.text.slice(-backTail.length) === backTail) {
      stats.wentBack++;
      if (!l.yours) throw new Error('a line about your ways is not marked as yours: ' + l.text);
    }
  });
  for (i = 0; i < 30; i++) {
    var S = f.seasons[i];
    needAll(S, ['season', 'flow', 'houses', 'events'], 'future.seasons');
    isNum(S.flow, 'flow');
    if (S.flow < 0 || S.flow > top) throw new Error('flow outside the strip: ' + S.flow + ' (its top ' + top + ')');
    if ((life.params.FLOW_KIND === 'one' || life.params.FLOW_KIND === 'both') && S.flow > 1) throw new Error('a share of tie-days above one: ' + S.flow);
    if (S.houses.length !== 8) throw new Error('a season does not list eight houses');
    for (s = 0; s < 8; s++) {
      needAll(S.houses[s], ['id', 'name', 'helpRate', 'income', 'purse', 'way'], 'future.seasons.houses');
      isNum(S.houses[s].helpRate, 'helpRate'); isNum(S.houses[s].income, 'income');
      if (S.houses[s].helpRate < 0 || S.houses[s].helpRate > 1) throw new Error('helpRate outside 0..1: the field would overfill');
      W.house(S.houses[s].name); W.num(S.houses[s].income);        // the number lettered on each holding
    }
    for (s = 0; s < S.events.length; s++) need(S.events[s], 'type', 'future.seasons.events');
    if (stk) {                                        // the sixteen gauges of the Afterwards, season by season
      if (!S.ties || S.ties.length !== A.tieList.length || A.tieList.length !== 16) throw new Error('a season of the future does not give the sixteen banks');
      S.ties.forEach(function (lv) { levelOk(lv, stk, 'a bank in season ' + S.season); });
    } else if (S.ties !== undefined) throw new Error('banks in a future of a place without a stock');
    W.seasonCount(S.season);
  }
  // the resting map marks houses by finalWay; the closing line counts yourWaysAtEnd: they must agree
  var atEnd = 0, atThirty = 0;
  for (i = 0; i < 8; i++) {
    if (need(f.finalWay, String(i), 'future.finalWay') === 0 || f.finalWay[i] === kinId) atEnd++;
    if (f.seasons[29].houses[i].way === 0 || f.seasons[29].houses[i].way === kinId) atThirty++;
  }
  if (atEnd !== f.yourWaysAtEnd) throw new Error('the resting map would mark ' + atEnd + ' houses, the closing line counts ' + f.yourWaysAtEnd);
  // the resting map in words (app.js drawHousesAtEnd): eight lines, and as many "keeps your ways" as the closing line counts
  var saidKeep = 0;
  for (i = 0; i < 8; i++) {
    var hEnd = f.seasons[29].houses[i], newEnd = !!(f.arrival && f.arrival.house === i), handsEnd = Math.round(hEnd.helpRate * 16);
    if (Math.abs(handsEnd - hEnd.helpRate * 16) > 1e-6) throw new Error('helpRate is not a count of sixteen hands: ' + hEnd.helpRate);
    var whoEnd = i === 0 ? W.heir(true) : i === kinId && !newEnd ? W.kin(true) : W.House(hEnd.name);
    var lineEnd = W.houseAtEnd(whoEnd, hEnd.income, handsEnd, f.finalWay[i] === 0 || f.finalWay[i] === kinId, newEnd);
    if (/keeps your ways/.test(lineEnd)) saidKeep++;
  }
  if (saidKeep !== f.yourWaysAtEnd) throw new Error('the map in words and the closing line count your ways differently');
  if (atEnd !== atThirty) stats.lastFrameMoved++;
  // the Leaving sheet's diamonds are the houses the Afterwards opens as keeping your ways
  for (i = 0; i < 4; i++) {
    var hid = life.neighbours[i], hh = life.houses[hid], w1 = f.seasons[0].houses[hid].way;
    var fromYouNow = hh.source.some(function (q) { return q.type === 'you'; });
    var keeps = (hh.way === 0 || hh.way === kinId) && (hid !== kinId || fromYouNow);
    if (keeps !== (w1 === 0 || w1 === kinId)) throw new Error('the Leaving sheet and season 1 mark the ' + hh.name + ' holding differently');
  }
  var endLine = W.futureEnd(f), waysLine = W.waysEnd(f);
  if (stk) {                                          // the banks at the end, for a listener (app.js drawHousesAtEnd)
    var atEndLine = W.banksAtEnd(f.seasons[29].ties, prm), cnt = numbersIn(atEndLine), fl0 = 0, sp0 = 0;
    f.seasons[29].ties.forEach(function (lv) { if (lv >= stk.max) fl0++; else if (lv <= stk.min) sp0++; });
    if (cnt.join() !== [fl0, sp0, 16 - fl0 - sp0].join() || atEndLine.indexOf('sixteen') < 0) throw new Error('the banks at the end are counted wrongly: ' + atEndLine);
  }
  if (f.holds) stats.held++;

  var guard = 0, sawHeadline = false;
  W.counting(job.futuresDone, job.futures);
  while (!A.verdictStep(job, 200)) {
    if (++guard > 100000) throw new Error('verdict job does not finish');
    if (guard % 25 === 0) W.counting(job.futuresDone, job.futures);
    if (job.headline) sawHeadline = true;
  }
  if (!job.done || !job.result) throw new Error('verdict job finished without a result');
  var v = job.result;

  // the Chronicle
  where = PLACE + ' ' + seed + ', "' + policyName + '", chronicle';
  needAll(v, ['futures', 'holds', 'holdsPct', 'held', 'baselinePct', 'mark', 'markSE', 'baseline.holds', 'baseline.held',
              'purse', 'need', 'houseKept', 'whatIfFutures', 'whatIfBaseHolds', 'range.bestPct', 'range.worstPct',
              'range.scaleLow', 'range.scaleHigh', 'range.yourPct', 'range.inside', 'whatIfs', 'lastDay', 'seal.earned', 'mattered'], 'verdict');
  if (v.held.length < 200 || v.baseline.held.length < 200) throw new Error('fewer than 200 futures to draw');
  for (i = 0; i < 200; i++) if (typeof v.held[i] !== 'boolean' || typeof v.baseline.held[i] !== 'boolean') throw new Error('held[] is not boolean');
  if (!(v.range.scaleLow <= Math.min(v.holdsPct, v.baselinePct, v.range.worstPct) &&
        v.range.scaleHigh >= Math.max(v.holdsPct, v.baselinePct, v.range.bestPct))) throw new Error('the scale does not hold its markers');
  if (v.whatIfs.length !== 10) throw new Error('whatIfs is not ten long');
  // the scale's bracket: the best of the plain ways faces the charter (under 'breaks' the most futures in
  // which the ring broke), so it is never below the worst
  if (!(v.range.bestPct >= v.range.worstPct)) throw new Error('the best plain way is below the worst: ' + v.range.bestPct + ' against ' + v.range.worstPct);
  var H = W.heads(), rl = W.rowLabels();
  out.push(W.chronicleHead() + ' (' + PLACE + ' ' + seed + ', ' + policyName + ')');
  var houseSaid = W.houseLine(v);
  out.push('  ' + H.house + ': ' + houseSaid);
  out.push('  ' + H.valley + ': ' + W.valleyLine(v));
  var ex = W.rowsExplain(v, life.params);
  if (ex[1].indexOf(lineNow) < 0) throw new Error('the rule of a future does not name the line the engine uses (' + lineNow + '): ' + ex[1]);
  ex.forEach(function (line) { out.push('    ' + line); });      // what a future and "held" are, before the mark that rests on them
  out.push('    ' + W.markLine(v) + '  [' + W.markNumber(v) + ']');
  // the mark is explained from the two counts just given: the gap it names is their difference
  var means = W.markMeans(v), gap = v.holds - v.baseline.holds;
  if (gap === 0) { stats.markSame++; if (means !== 'The two counts are the same.') throw new Error('equal counts, and the mark is explained otherwise: ' + means); }
  else if (means.indexOf((isValley ? ': ' : ' ') + Math.abs(gap) + (gap > 0 ? ' more ' : ' fewer ')) < 0) throw new Error('the mark is not explained by the gap of ' + gap + ': ' + means);
  out.push('    ' + means);
  var noise = W.markNoise(v);
  if (v.markSE === 0 && Math.round(v.mark) === 0 && /would move/.test(noise)) throw new Error('a margin given where every future is the same: ' + noise);
  out.push('    ' + noise);
  // each row of marks in words: its name and how many of the first 200 held
  var heldYou = 0, heldOld = 0;
  for (i = 0; i < 200; i++) { if (v.held[i]) heldYou++; if (v.baseline.held[i]) heldOld++; }
  out.push('    ' + W.rowAlt(rl.you, heldYou, 200) + ' ' + W.rowAlt(rl.old, heldOld, 200) + ' ' + W.rowsCaption(v));
  var rng = W.rangeLabels(v);
  var rline = W.rangeLine(v), rnote = W.rangeNote(v), yoursLead = leadOf(ch.rangeYours);
  need(v.range, 'of', 'verdict.range');
  if (rline.indexOf('of the first ' + v.whatIfFutures + ' futures') < 0) throw new Error('the plain ways are not said to be counted on the first ' + v.whatIfFutures);
  if (rline.indexOf(COUNTS[v.range.of] || String(v.range.of)) < 0) throw new Error('the plain ways are not counted as the engine counts them (' + v.range.of + '): ' + rline);
  if (rnote.indexOf(yoursLead) >= 0) stats.rangeSaid++;
  if (v.range.inside && (v.holdsPct < v.range.worstPct || v.holdsPct > v.range.bestPct) && rnote.indexOf(yoursLead) < 0) throw new Error('"You" is drawn outside the plain ways with no word that it lies inside on their futures');
  out.push('  ' + H.range + ': ' + rline);
  out.push('    ' + rnote);
  out.push('    [' + rng.you + '] [' + rng.old + '] [' + rng.worst + '] [' + rng.best + '] ' + rng.axis);
  if (v.lastDay) {
    needAll(v.lastDay, ['changed', 'holds', 'futures', 'purse'], 'verdict.lastDay');
    var ld = v.lastDay, ldLine = W.lastDayLine(v, kinId);
    if (isValley && ldLine.indexOf(ld.holds + ' of the first ' + ld.futures + ' futures, against ' + v.whatIfBaseHolds + ' of those') < 0) throw new Error('the last day is not counted against the same futures in words: ' + ldLine);
    var ldNums = numbersIn(ldLine), ldAt = ldNums.indexOf(ld.holds);
    if (ldAt < 0 || ldNums[ldAt + 1] !== ld.futures || ldNums[ldAt + 2] !== v.whatIfBaseHolds) throw new Error('the last day is not counted against the same futures in words: ' + ldLine);
    // REPLAY 'habit' and 'season' give the rule 'habit': each reversed tie is told by its own act,
    // as lived and as replayed, whichever way it went
    if (ld.rule === 'habit') {
      needAll(ld, ['ties', 'changed'], 'verdict.lastDay');
      ld.changed.forEach(function (c) {
        needAll(c, ['id', 'name', 'lived', 'replayed', 'h', 'n'], 'verdict.lastDay.changed');
        if (c.lived === c.replayed) throw new Error('a reversed tie that was not reversed');
        var who = W.who(c.name, c.id === kinId, false), lived = leadOf(lex.lastAct[c.lived ? 'sent' : 'stayed']), again = leadOf(lex.lastAct[c.replayed ? 'hadSent' : 'hadStayed']);
        if (ldLine.split(who).length < 3 || ldLine.indexOf(lived) < 0 || ldLine.indexOf(again) < 0) throw new Error('the last day does not tell the ' + c.name + ' tie by what was done and what the replay did: ' + ldLine);
      });
      stats.lastDayHabit++;
    } else if (ld.rule !== undefined) throw new Error('a last-day replay of an unknown rule: ' + ld.rule);
    out.push('  ' + H.lastDay + ': ' + ldLine);
    stats.lastDay++;
  }
  if (v.seal.earned) { out.push('  SEAL: ' + W.seal()); stats.sealed++; } else W.seal();
  // a seal withheld by the season replay: one plain line in the place's words that there is no seal and
  // why, shown exactly where the seal would otherwise have been earned (app.js seasonLine): the replay
  // withheld it, the house was kept, the mark was clear and no last-day clause withheld it. It says "the
  // last season", so the replay began on the last season's first day (day 9 of 12, seasons of four days);
  // it shows none of the season entry's numbers. For every other verdict the words refuse to say it.
  var sl = v.seal, seasonDue = !!(sl.wonOnSeason && sl.houseKept && sl.markClear && !sl.boughtOnLastDay && !sl.lastDayCost && !sl.wonOnLastDay);
  if (seasonDue) {
    if (v.seal.earned) throw new Error('a seal shown earned and withheld by the season replay');
    if (need(v, 'season.from', 'verdict') !== 9) throw new Error('the season replay did not begin on the last season\'s first day: ' + v.season.from);
    var restsLine = W.seasonRests(v);
    if (/\d/.test(restsLine)) throw new Error('the line of a seal withheld by the season replay shows a number: ' + restsLine);
    if (restsLine.indexOf('No seal this time: ') !== 0) throw new Error('the line of a seal withheld by the season replay does not say plainly that there is no seal: ' + restsLine);
    // why: the replayed mark falls short of the seal's bar (mark + season.delta - 2 SE < SEAL_MARK), which
    // is true of every such Life; the place's gain alone is not. The replayed mark can stay well clear of the
    // noise the page states just above (markNoise), so the line must say what it fell short of: the seal.
    if (!/ by enough for a seal\.$/.test(restsLine)) throw new Error('the line of a seal withheld by the season replay does not say the replay fell short of the seal (it must end "by enough for a seal."): ' + restsLine);
    if (v.mark + v.season.delta > Math.max(1, Math.ceil(2 * v.markSE))) stats.seasonRestsClear++;
    out.push('  ' + restsLine);
    stats.seasonRests++;
  } else if (givesGroup(PLACE, 'lastSeason')) {
    var refusedLine = null;
    try { refusedLine = W.seasonRests(v); } catch (e) { refusedLine = null; }
    if (refusedLine !== null) throw new Error('the line of a seal withheld by the season replay is said of a verdict where the replay alone did not withhold it (' + JSON.stringify(v.seal) + '): ' + refusedLine);
    stats.seasonRefused++;
    if (sl.wonOnSeason) stats.seasonRefusedWon++;
  }
  if (v.mattered && v.mattered.kind === 'habit') {
    needAll(v.mattered, ['situation', 'h', 'n'], 'verdict.mattered');
    need(v.whatIfs[2 * v.mattered.situation], 'holds', 'whatIfs'); need(v.whatIfs[2 * v.mattered.situation + 1], 'holds', 'whatIfs');
    stats.matteredHabit++;
  } else if (v.mattered) stats.matteredLast++; else stats.matteredNone++;
  var mLine = W.mattered(v, titles);
  if (/One fewer|One more hand/.test(mLine)) throw new Error('the what-ifs are one more precedent each way, not one fewer: ' + mLine);
  if (v.mattered && v.mattered.kind === 'habit') {
    var mh = v.mattered.h, mn = v.mattered.n, moreLead = leadOf(ch.mattered.more), lessLead = leadOf(ch.mattered.lessShort);
    if (mLine.indexOf('of the first ' + v.whatIfFutures + ' futures') < 0) throw new Error('"mattered" does not say which futures it counts: ' + mLine);
    if ((mh === 0) === (mLine.indexOf(lessLead) >= 0)) throw new Error('"once more" the other way must be left out exactly where the reader never acted: ' + mLine);
    if ((mh === mn) === (mLine.indexOf(moreLead) >= 0)) throw new Error('"once more" must be left out exactly where the reader always acted: ' + mLine);
    if (mh === 0 || mh === mn) stats.matteredOneSided++;
  }
  out.push('  ' + H.mattered + ': ' + mLine);
  out.push('  ' + H.became + ' (' + H.becameSub + '):');
  W.became(f, kinId).forEach(function (line) { out.push('    ' + line); });
  out.push('    ' + endLine);
  out.push('  ' + W.valleyNo(seed) + '   [' + W.again() + '] [' + W.againSame() + ']');
  var entry = { place: PLACE, seed: seed, kept: v.houseKept, purse: v.purse, need: v.need, mark: v.mark, seal: !!v.seal.earned };
  out.push('  ' + W.pastHead() + ': ' + W.pastLife(entry));
  if (v.houseKept) stats.kept++;
  if (v.purse < 0) {                                  // the Chronicle tells a store below zero with its sign
    if (houseSaid.indexOf('\u2212' + (-v.purse) + ' of ') < 0) throw new Error('a store below zero in the Chronicle is told as ' + houseSaid);
    stats.negStore++;
  }
  stats.lives++;

  // a Life must be rebuildable from its seed and its choices: app.js relies on it after a reload
  return { chronicle: out, ticker: all.map(function (l) { return l.text; }), end: [endLine, waysLine], sawHeadline: sawHeadline, life: life, verdict: v, seasonShown: seasonDue };
}

// ---- run ------------------------------------------------------------------------------------

var SEEDS = [];
for (var q = 1; q <= 22; q++) SEEDS.push(q);
SEEDS.push(48213); SEEDS.push('valley-7'); SEEDS.push(4294967295);
SEEDS.push(167);                                             // where a house was seen to go back to its own way from yours
var samples = [], livesByPolicy = {};

// jsc page-smoke.js -- <place> checks that place alone; with no argument, every place, the valley first.
var ONLY = typeof arguments !== 'undefined' && arguments.length ? String(arguments[0]) : null;
if (ONLY !== null && !Object.prototype.hasOwnProperty.call(PL.byId, ONLY)) throw new Error('page-smoke.js: no place "' + ONLY + '" is registered (' + PL.order.join(', ') + ')');
var RUN = ONLY !== null ? [ONLY] : PL.order.slice();

function runPlace(id) {
  if (!PLACE_RULES[id]) throw new Error('page-smoke.js has no rules for the place "' + id + '" (PLACE_RULES)');
  PLACE = id;
  W.use(id);
  LEAK_RE = leakRe(id); LEAK_OF = 'sentences of ' + id;
  NAMES.forEach(function (name) { called[name] = 0; });
  stats = freshStats(); samples = []; livesByPolicy = {};

  SEEDS.forEach(function (seed, si) {
    Object.keys(policiesOf(id)).forEach(function (name, pi) {
      var extra = requiredOf(id).indexOf(name) < 0;
      if (extra && si % 3 !== 0) return;                       // the extra ways on every third valley
      var full = si < 3 && !extra;                             // the page's own counts (2000 futures) on nine Lives
      var res = liveOne(seed, name, full ? undefined : { futures: 400, whatIfFutures: 200 });
      livesByPolicy[name] = (livesByPolicy[name] || 0) + 1;
      if (full && !res.sawHeadline) throw new Error('job.headline never appeared during a full count');
      if ((si === 0 && pi < 3) || (si === 3 && pi === 3) || (si === 6 && pi === 6)) samples.push(res);
    });
  });

  // a place's honest way of playing on the seeds where it earns the seal, at the page's own counts
  (PLACE_SEAL_SEEDS[id] || []).forEach(function (seed) {
    var name = PLACE_REQUIRED[id][0];
    liveOne(seed, name, undefined);
    livesByPolicy[name] = (livesByPolicy[name] || 0) + 1;
  });

  (PLACE_COVER_LIVES[id] || []).forEach(function (c) {
    liveOne(c[0], c[1], { futures: 400, whatIfFutures: 200 });
    livesByPolicy[c[1]] = (livesByPolicy[c[1]] || 0) + 1;
  });

  // the line of a seal withheld by the season replay, at the page's own counts: shown where the seal would
  // have been earned but for the replay, refused where the replay withheld a seal that was out of reach anyway
  if (PLACE_SEASON_LIVES[id] && !givesGroup(id, 'lastSeason')) throw new Error('Lives listed for the season replay\'s line in ' + id + ', which has none (PLACE_SEASON_LIVES)');
  (PLACE_SEASON_LIVES[id] || []).forEach(function (c) {
    var res = liveOne(c[0], c[1], undefined);
    livesByPolicy[c[1]] = (livesByPolicy[c[1]] || 0) + 1;
    if (!res.verdict.seal.wonOnSeason) throw new Error('the ' + id + ' Life ' + c[0] + ' ("' + c[1] + '") no longer has its seal withheld by the season replay: a preset moved it (search again, review-fix1/check/season-l1.js)');
    if (res.seasonShown !== c[2]) throw new Error('the ' + id + ' Life ' + c[0] + ' ("' + c[1] + '") ' + (c[2] ? 'does not show' : 'shows') + ' the line of a seal withheld by the season replay');
    var rv = res.verdict;
    if (c[3] && !(rv.mark + rv.season.delta > Math.max(1, Math.ceil(2 * rv.markSE)))) throw new Error('the ' + id + ' Life ' + c[0] + ' ("' + c[1] + '") no longer has its replayed mark above the noise the page states: a preset moved it (search again, review-fix2/check/season-above.js)');
  });

  // rebuilding a Life from its seed and its list of choices gives the same Life (what a reload does)
  (function () {
    where = id + ' rebuild check';
    var a = A.createLife(48213, id), list = [], d, i;
    for (d = 1; d <= 12; d++) {
      var t = A.today(a), c = [];
      for (i = 0; i < 4; i++) c.push(POLICIES.mixed(t.neighbours[i], d, 48213));
      list.push(c); A.playDay(a, c);
    }
    var b = A.createLife(a.seed, id), last = null;
    for (d = 0; d < list.length; d++) last = A.playDay(b, list[d]);
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('a Life rebuilt from seed and choices differs');
    if (!last.over) throw new Error('the rebuilt Life is not over');
  })();

  // The last-day line of the habit replay, in this place's words. A place whose own replay is the
  // valley's never reaches it in play, so a few of its Lives are played again here with the habit
  // replay (REPLAY 'habit'; 'season' gives the same entry), checked last so that the Lives above
  // run as before.
  if (A.createLife(1, id).params.REPLAY === 'valley') {
    [1, 7, 13].forEach(function (seed) {
      ['send unless left short, stay home on day 12', 'mixed'].forEach(function (name) {
        liveOne(seed, name, { futures: 400, whatIfFutures: 200 }, { REPLAY: 'habit' });
      });
    });
  }

  // every function of AYWords was called with real data, in this place
  // (the words of a stock only where the place has one: elsewhere they are never asked for)
  var rules = A.createLife(1, id).params, hasStock = !!rules.STOCK, absent = [];
  // (a group is absent where the place's words do not give it: for a stock and a town that is exactly where
  // its rules have none, checked above, and for the line of the season replay where they do not replay the season)
  Object.keys(FEATURE_WORDS).forEach(function (grp) { if (!givesGroup(id, grp)) absent = absent.concat(FEATURE_WORDS[grp]); });
  var missed = NAMES.filter(function (n) { return !called[n] && absent.indexOf(n) < 0; });
  if (missed.length) throw new Error('AYWords functions never called in ' + id + ': ' + missed.join(', ') + (missed.indexOf('seasonRests') >= 0 ? ' (no Life had its seal withheld by the season replay alone: a preset change may have moved the seeds; search again with review-fix1/check/season-l1.js and list one in PLACE_SEASON_LIVES)' : ''));
  absent.forEach(function (n) { if (called[n]) throw new Error('AYWords.' + n + ' was asked for in ' + id + ', which has not the feature it tells'); });
  if (rules.CHARTER === 'breaks' && (!stats.townSome || !stats.townNone)) throw new Error('a branch of the town line was never shown in ' + id + ': some ' + stats.townSome + ', none ' + stats.townNone);
  if (givesGroup(id, 'lastSeason') && (!stats.seasonRests || !stats.seasonRefused || !stats.seasonRefusedWon)) throw new Error('the line of a seal withheld by the season replay was never shown in ' + id + ', never refused, or never refused where the replay withheld a seal out of reach anyway: shown ' + stats.seasonRests + ', refused ' + stats.seasonRefused + ' (of them withheld by the replay ' + stats.seasonRefusedWon + '). A preset change may have moved the seeds: search again (review-fix1/check/season-l1.js) and list them in PLACE_SEASON_LIVES');
  if (!hasStock && !stats.cardsCounted) throw new Error('no card number was checked against the stakes in ' + id);
  if (rules.H !== 0 && !stats.negStore) throw new Error('no store below zero was told in ' + id + ', where the stakes can take a store below zero');
  if (hasStock) {
    ['holds', 'full', 'spent', 'fills', 'fillsFull', 'falls', 'fallsSpent', 'staysFull', 'staysSpent'].forEach(function (k) {
      if (!stats.bank[k]) throw new Error('a word of the gauge was never shown on a card in ' + id + ': ' + k);
    });
    if (!stats.bankThem) throw new Error('the sister\'s bank with another boat was never told in ' + id);
  }
  requiredOf(id).forEach(function (name) {
    if ((livesByPolicy[name] || 0) < 20) throw new Error('fewer than 20 valleys for "' + name + '"');
  });
  if (!stats.whyYou && !stats.third) throw new Error('no Why? card ever quoted the reader');
  if (!stats.ownSince[0] || !stats.ownSince[1] || !stats.ownSince[2]) throw new Error('a wording of "what you knew since they changed a way" was never reached: ' + stats.ownSince.join(', '));
  if (!stats.sealed) throw new Error('no Life earned the seal: its line was never shown as earned (a preset change may have moved the seeds: search again with page-p4/check/seal-seeds.js and list them in PLACE_SEAL_SEEDS)');
  if (!stats.lastDay || !stats.matteredHabit || !stats.matteredLast || !stats.matteredNone) throw new Error('a branch of the Chronicle was never reached');
  if (!stats.noHand) throw new Error('no reveal in which no hand went either way: its wording was never checked');
  if (!stats.markSame) throw new Error('no Chronicle with two equal counts: "The two counts are the same." was never shown');
  if (!stats.secondHand) throw new Error("no house took up your ways at second hand: that season's-end line was never shown");
  if (!stats.matteredOneSided || !stats.rangeSaid) throw new Error('a wording of the Chronicle was never reached (one-sided "mattered", or "yours holds in")');
  if (!stats.wentBack) throw new Error('no watched future had a house give up your ways and go back to its own: that line was never shown');
  if (!stats.lastDayHabit) throw new Error('no last-day line of the habit replay: its wording was never checked');

  print('Sample Chronicles (' + id + ')');
  print('=================');
  samples.slice(0, 5).forEach(function (res) {
    print('');
    res.chronicle.forEach(function (line) { print(line); });
    print('  -- the watched future, as the ticker told it --');
    res.ticker.forEach(function (line) { print('    ' + line); });
    res.end.forEach(function (line) { print('    ' + line); });
  });
  print('');
  print('Place: ' + id);
  print('Lives played: ' + stats.lives + ' (' + Object.keys(livesByPolicy).map(function (k) { return livesByPolicy[k] + ' x ' + k; }).join('; ') + ')');
  print('Why? cards turned: from you ' + stats.whyYou + ', own ' + stats.whyOwn + ', another house ' + stats.whyHouse +
        ', never seen ' + stats.whyBlank + '; sister toward others, from you ' + stats.third + '; hands turned back ' + stats.lost);
  print("Season's ends: " + stats.seasonEnds + '; houses kept ' + stats.kept + '; seals ' + stats.sealed + '; last-day lines ' + stats.lastDay +
        '; mattered: habit ' + stats.matteredHabit + ', last day ' + stats.matteredLast + ', none ' + stats.matteredNone +
        '; watched futures held ' + stats.held);
  print('Own-way cards on a house that had changed a way: not seen since ' + stats.ownSince[0] + ', seen once ' + stats.ownSince[1] +
        ', seen more ' + stats.ownSince[2] + '; neighbour-days marked as keeping your ways with no arc ' + stats.keepsNoArc +
        '; resting maps that differ from season 30 ' + stats.lastFrameMoved);
  print('Reveals with no hand either way: ' + stats.noHand + "; season's-end lines for your ways taken at second hand: " + stats.secondHand +
        '; Chronicles with equal counts ' + stats.markSame + ', with "yours holds in" under the scale ' + stats.rangeSaid +
        ', with a one-sided "mattered" line ' + stats.matteredOneSided +
        '; lines for a house that goes back to its own way from yours ' + stats.wentBack + '; last-day lines of the habit replay ' + stats.lastDayHabit);
  if (hasStock) print('Gauges told on the cards: ' + Object.keys(stats.bank).sort().map(function (k) { return k + ' ' + stats.bank[k]; }).join(', ') + '; the sister\'s banks ' + stats.bankThem);
  if (!hasStock) print('Card numbers checked against the stakes of their outcome: ' + stats.cardsCounted + '; stores told below zero: ' + stats.negStore);
  if (rules.CHARTER === 'breaks') print('Town lines: with an extra cost ' + stats.townSome + ', with none ' + stats.townNone);
  if (givesGroup(id, 'lastSeason')) print('Seals withheld by the season replay alone, told in a line: ' + stats.seasonRests + ' (' + stats.seasonRestsClear + ' where the replayed mark still stood above the noise the page states); the line refused for ' + stats.seasonRefused + ' other verdicts, ' + stats.seasonRefusedWon + ' of them withheld by the replay with the seal out of reach anyway');
  if (id !== VALLEY) print('Strips in words whose late figure took a decimal more to stay on its side of the line: ' + stats.lateExact);
  var used = NAMES.filter(function (n) { return called[n]; }).length;
  print('AYWords functions exercised in ' + id + ': ' + used + ' of ' + NAMES.length + (used < NAMES.length ? ' (the words of a feature this place has not are not asked for here: ' + absent.join(', ') + ')' : ''));
  print('');
}
RUN.forEach(runPlace);
LEAK_RE = null;

// the hooks of the brief (section 2) and the shape of index.html (sections 1 and 5)
var hooks = 0, coloursChecked = [];
// WCAG contrast of the colour pairs the page draws with (foreground, background), from the token
// blocks of index.html: every place with blocks of its own must keep each pair at least as far apart
// as the valley does, in light and in dark.
var COLOUR_PAIRS = [['field', 'paper-raised'], ['field', 'paper'], ['paper', 'field'], ['field-wash', 'field'], ['river', 'paper-raised'], ['river', 'paper'],
                    ['river-wash', 'paper-raised'], ['madder', 'paper'], ['madder', 'paper-raised'], ['ink', 'field-wash'], ['paper-raised', 'river']];
function lumOf(hex) {
  var h = hex.replace('#', ''), c = [0, 2, 4].map(function (i) { var v = parseInt(h.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrastOf(a, b) { var x = lumOf(a), y = lumOf(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function tokensIn(block) { var out = {}, m, re = /--([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g; while ((m = re.exec(block))) out[m[1]] = m[2]; return out; }
function merged(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
function placeColours(html) {
  var css = html.slice(html.indexOf('<style>'), html.indexOf('*, *::before'));
  var light = tokensIn(/:root \{([\s\S]*?)\n\}/.exec(css)[1]);
  var dark = merged(light, tokensIn(/@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme="light"\]\) \{([\s\S]*?)\}/.exec(css)[1]));
  PL.order.forEach(function (id) {
    var sel = '\\[data-place="' + id + '"\\]';
    var bl = new RegExp('\\n:root' + sel + ' \\{([\\s\\S]*?)\\}').exec(css);
    var bm = new RegExp('@media \\(prefers-color-scheme: dark\\) \\{\\s*:root' + sel + ':not\\(\\[data-theme="light"\\]\\) \\{([\\s\\S]*?)\\}').exec(css);
    var ba = new RegExp('\\n:root' + sel + '\\[data-theme="dark"\\] \\{([\\s\\S]*?)\\}').exec(css);
    if (!bl && !bm && !ba) return;                   // the valley's colours
    if (id === VALLEY || !bl || !bm || !ba) throw new Error('the colours of ' + id + ' need three token blocks: light, dark by media, dark by attribute');
    var tl = tokensIn(bl[1]), tm = tokensIn(bm[1]), ta = tokensIn(ba[1]);
    if (Object.keys(tl).sort().join() !== Object.keys(tm).sort().join() || JSON.stringify(tm) !== JSON.stringify(ta)) throw new Error('the three token blocks of ' + id + ' do not set the same colours');
    var pl = merged(light, tl), pd = merged(dark, tm);
    COLOUR_PAIRS.forEach(function (pr) {
      [[light, pl, 'light'], [dark, pd, 'dark']].forEach(function (c) {
        var v = contrastOf(c[0][pr[0]], c[0][pr[1]]), q = contrastOf(c[1][pr[0]], c[1][pr[1]]);
        if (q + 1e-9 < v) throw new Error('the ' + id + ' colours ' + pr[0] + ' on ' + pr[1] + ' in ' + c[2] + ' are ' + q.toFixed(2) + ' apart, the valley\'s ' + v.toFixed(2));
        hooks++;
      });
    });
    coloursChecked.push(id);
  });
}
(function () {
  where = 'index.html and app.js';
  W.use(VALLEY);                                    // the copy at rest in index.html is the valley's
  var html = readFile('index.html'), app = readFile('app.js');
  // every script the page loads besides app.js: words.js, the places, sheet.js, motion.js and sound.js
  var scripts = [readFile('words.js'), readFile('sheet.js'), readFile('motion.js'), readFile('sound.js')].concat(PLACE_FILES.map(function (file) { return readFile(file); })).join('\n');
  function has(text, bit, what) { if (text.indexOf(bit) < 0) throw new Error('missing ' + what + ': ' + bit); hooks++; }
  // the motion and the sound (motion.js, sound.js): no theory word in either source, its comments included; the Sound
  // button's label (W.soundWord) held to the sentence rules; every page script plain ASCII, byte for byte (the host may
  // serve them as windows-1252); app.js builds nothing while no module listens and sets a rebuilt Life down quietly;
  // every track registered lies under music/, where tools/pages.sh finds it
  ['motion.js', 'sound.js'].forEach(function (file) {
    var fm = FORBIDDEN_RE.exec(readFile(file));
    if (fm) throw new Error('a theory word in ' + file + ' (its comments count): "' + fm[2] + '"');
    hooks++;
  });
  var sw = sentenceFault(W.soundWord);               // the Sound button's label: a string, so not among NAMES
  if (sw) throw new Error('AYWords.soundWord: ' + sw);
  hooks++;
  ['index.html', 'app.js', 'words.js', 'sheet.js', 'motion.js', 'sound.js'].concat(PLACE_FILES).forEach(function (file) {
    var bytes = readFile(file, 'binary'), i;
    for (i = 0; i < bytes.length; i++) if (bytes[i] > 0x7F) throw new Error(file + ' is not plain ASCII: byte ' + bytes[i] + ' at offset ' + i + ' (write the character as a \\u escape)');
    hooks++;
  });
  has(app, 'if (!FX.length) return;', 'the cue that builds nothing while no module listens');
  has(app, 'fxQuiet = true;', 'a rebuilt Life set down with no transient and no sound');
  (function () {
    var soundSrc = readFile('sound.js'), srcs = [], m, re = /\bsrc\s*:\s*['"]([^'"]*)['"]/g, realm = runString('this'), listed = null;
    while ((m = re.exec(soundSrc))) srcs.push(m[1]);                   // every src written in sound.js, an example in a comment included
    try { realm.load('sound.js'); if (realm.AYSound && typeof realm.AYSound.tracks === 'function') listed = realm.AYSound.tracks(); } catch (e) { listed = null; }
    (function collect(x) {                                              // and every src AYSound.tracks() lists
      if (!x) return;
      if (typeof x === 'string') srcs.push(x);
      else if (Array.isArray(x)) x.forEach(collect);
      else if (typeof x === 'object') { if (typeof x.src === 'string') srcs.push(x.src); else Object.keys(x).forEach(function (k) { collect(x[k]); }); }
    })(listed);
    srcs.forEach(function (src) {
      if (!/^music\/[a-z0-9-]+\.(mp3|m4a)$/.test(src)) throw new Error('a track that is not a file under music/ (sound.js, 4.7): ' + src);
      hooks++;
    });
  })();
  if (html.indexOf('<title>After You</title>') !== 0) throw new Error('index.html does not start with its title');
  // the page's own text at rest (its markup without the style sheet, the scripts and the tags) carries no theory word
  var pageText = html.replace(/<style>[\s\S]*?<\/style>/g, ' ').replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]*>/g, ' ');
  var fw = FORBIDDEN_RE.exec(pageText);
  if (fw) throw new Error('a theory word in the text of index.html: "' + fw[2] + '"');
  hooks++;
  has(html, '<meta name="claude:viewport-fit-sides" content="cover">', 'viewport promise');
  if (/<!DOCTYPE|<html[\s>]|<head[\s>]|<body[\s>]/i.test(html)) throw new Error('index.html carries document tags the host adds itself');
  // the scripts, in the order they need each other: the engine, the words, each place (the valley first), the sheet,
  // the motion and the sound (each told of the page's moments by app.js, which never needs them), the page
  var tags = /<script src="engine\.js"><\/script><script src="words\.js"><\/script>((?:<script src="places\/[a-z]+\.js"><\/script>)+)<script src="sheet\.js"><\/script><script src="motion\.js"><\/script><script src="sound\.js"><\/script><script src="app\.js"><\/script>\s*$/.exec(html);
  if (!tags) throw new Error('index.html does not end with its scripts: engine.js, words.js, places/<id>.js for each place, sheet.js, motion.js, sound.js, app.js');
  if (tags[1].indexOf('<script src="places/valley.js"></script>') !== 0) throw new Error('the valley is not the first place index.html loads');
  if ((html.match(/<script /g) || []).length !== 6 + PLACE_FILES.length) throw new Error('a script outside the list at the end of index.html');
  if ((html.match(/<link /g) || []).length !== 1 || html.indexOf('https://fonts.googleapis.com/css2?') < 0 || html.indexOf('&display=swap') < 0) throw new Error('fonts: one Google Fonts link expected');
  if (/https?:\/\/(?!fonts\.googleapis\.com)/.test(html + app + scripts)) throw new Error('an address other than the font host (a namespace name counts)');
  ['opening', 'day', 'leaving', 'afterwards', 'chronicle'].forEach(function (v) { has(html, 'data-view="' + v + '"', 'view'); });
  if ((html.match(/data-view="[a-z]+"[^>]* hidden>/g) || []).length !== 4) throw new Error('exactly one view must start visible');
  ['begin', 'close-day', 'next-day', 'leave', 'skip', 'to-chronicle', 'again', 'again-same', 'other-place'].forEach(function (id) {
    if (!new RegExp('<button[^>]* id="' + id + '"').test(html)) throw new Error('missing button #' + id);
    hooks++;
  });
  has(app, "'data-house': String(id)", 'card hook');
  has(app, "name: 'choice-' + n.id", 'radio group name');
  has(app, "value === 'send'", 'radio values'); has(app, "optionNode(n, 'stay'", 'radio values');
  has(app, "'data-why': String(id)", 'Why? hook');
  has(app, "'data-why-kin': String(e.id)", 'the hook of the Why? under Elsewhere today (its own, so that data-why names a card)');
  if (/'data-why': *key/.test(app)) throw new Error('a data-why value that is not a house id');
  has(html, '<details class="key" id="map-day-key"', 'the folding map key');
  has(app, 'now() - state.phaseAt < SETTLE_MS', 'the pause before Next day takes a click');
  has(app, 'now() - state.viewAt < SETTLE_MS', 'the pause before a new view takes a click');
  // one line decides both: below it the style sheet keeps the day compact, above it app.js opens "What you know of them"
  has(html, '@media (min-width: 62rem) and (max-height: 65.99rem)', 'the compact day of a laptop of ordinary height');
  has(app, "media('(min-width: 40rem) and (min-height: 66rem)')", 'the same line in app.js');
  has(app, 'window.AYApp = { state: state }', 'state hook');
  // the hash #<place>-<seed>: the text before the first hyphen names a place this page has; #valley-<seed> as ever
  has(app, 'var HASH_RE = /^#([a-z]+)(?:-([A-Za-z0-9-]+))?$/;', 'the hash of a place, with or without a seed');
  has(app, "state.hash = key ? { place: key, seed: m[2] === undefined || m[2] === '' ? null : m[2] } : null;", 'the hash read only for a place this page has');
  // choosing a place writes it into the address alone, with no new entry in the history
  has(app, "try { window.history.replaceState(window.history.state, '', '#' + id); }", 'the address rewritten to the place in hand');
  has(app, 'writeHash(id);\n    drawOpening(true);', 'the address rewritten when a place is chosen, and the Opening drawn with nothing above the choice moving');
  has(html, '.sheet-no.is-held { visibility: hidden; }', 'the number line keeping its room when a place is chosen');
  if (/#valley-\(/.test(app)) throw new Error('app.js still reads the hash as the valley\'s alone');
  // the choice of places: one radio group in the cards' option style, in the engine's play order, shown for two or more
  has(html, '<fieldset class="places" id="opening-places" hidden>', 'the choice of places on the Opening, hidden at rest');
  has(html, '<legend class="vh" id="opening-places-head">', 'the name of the choice of places, for a listener');
  has(app, "el('input', { type: 'radio', name: 'place', id: 'place-' + id, value: id })", 'a place\'s option');
  has(app, "el('label', { class: 'opt is-place' }", 'the places in the cards\' option style');
  has(app, "el('span', { 'aria-hidden': 'true', text: W.placeLabel(id) }),", 'a place\'s short label for the eye');
  has(app, "el('span', { class: 'vh', text: W.placeName(id) })", 'and its name for a listener');
  has(app, 'A.PLACE_ORDER', 'the places in the engine\'s play order');
  has(app, 'box.hidden = ids.length < 2;', 'the choice shown only for two places or more');
  has(app, "$('other-place').hidden = !choosing();", 'the way back to the choice shown only for two places or more');
  // stored lives: the same key, a place on each, up to 60, the place in hand listed only
  has(app, 'var KEEP_LIVES = 60;', 'stored lives kept');
  has(app, "out.push({ place: e.place === undefined ? 'valley' : e.place,", 'a stored life without a place is the valley');
  has(app, 'function livesHere() { return state.lives.filter(function (e) { return e.place === state.place; }); }', 'the lives of the place in hand');
  has(app, "saveLife({ place: state.place,", 'a life stored with its place');
  has(app, 'return { place: state.place, seed: state.seed,', 'a snapshot carries the place');
  // the stakes on the Opening's sheet, the strip's line and top: the Life's rules
  has(app, 'o = { demo: [st.mine, st.theirs] }', 'the Opening sheet\'s stakes from the Life');
  has(app, "drawMap('map-opening', 'sheet', o);", 'the Opening sheet drawn with them');
  // a place with a stock: its gauges read the Life (today(), the day's results, the future's seasons)
  has(app, "words = r ? W.bankDay(r.stock, r.stockAfter, p, false) : W.bankNow(n.stock, p);", 'the bank on a card, from the Life');
  has(app, "bankNode(n, r),", 'the bank in the card\'s head, beside the bearing');
  has(app, "W.bankDay(e.stock, e.stockAfter, state.life.params, true).say", 'the sister\'s bank with another boat, said under Elsewhere today');
  has(app, "S.gaugeD(sheetDef(), kind, key, { level: ties[t], top: k.max })", 'the sixteen banks of the Afterwards, season by season');
  has(app, "'bottom:' + (p.HOLD_LINE / top * 100).toFixed(2) + '%'", 'the strip\'s line at the Life\'s HOLD_LINE');
  if (/0\.5 \/ 1\.05|flow < 0\.5|, 0, 1\.05\)/.test(app)) throw new Error('app.js draws the strip at a line or top of its own');
  // the strip's good side is the charter's: under the line where the place is better off when the flow fails
  has(app, "if (p.CHARTER === 'breaks') return flow >= p.HOLD_LINE ? ' is-over' : '';", 'the strip\'s worse side from the charter');
  // a store below zero is drawn hatched from a zero mark; the town's line follows the day's total where the charter breaks
  has(app, "el('span', { class: 'meter-fill is-below',", 'a store below zero drawn below the zero mark');
  has(app, "el('span', { class: 'meter-zero',", 'the zero mark of a store below zero');
  has(html, '.meter-fill.is-below {', 'the style of a store below zero');
  has(app, "W.dayTown(r.results, state.life.params)", 'the town\'s cost with the day\'s total, from the day\'s results');
  // the day's sentences are asked with the Life's rules, which fill the stakes into the place's words
  has(app, "W.reveal(r, state.life.params)", 'the reveal with the Life\'s stakes');
  has(app, "W.yesterday(n.yesterday, state.life.params)", 'yesterday with the Life\'s stakes');
  // the season replay's entry is never shown; a seal it withheld gets one plain line under the mark, made
  // only where the engine says so (seal.wonOnSeason), in the words of the place (AYWords.seasonRests)
  if (/\bv\.season\b|verdict\.season|\.season\.(from|changed|delta|se|holds|holdsPct|purse|houseKept)\b/.test(app + readFile('words.js'))) throw new Error('the season replay\'s entry is shown');
  has(app, "if (s && s.wonOnSeason && s.houseKept && s.markClear && !s.boughtOnLastDay && !s.lastDayCost && !s.wonOnLastDay) noise.parentNode.insertBefore(el('p', { id: 'chron-season', text: W.seasonRests(v) }), noise.nextSibling);", 'the line of a seal withheld by the season replay alone, under the mark, only then');
  if ((app.match(/wonOnSeason/g) || []).length !== 1 || (app.match(/W\.seasonRests\(/g) || []).length !== 1) throw new Error('app.js asks for the season replay\'s seal elsewhere than its one line');
  has(app, 'seasonLine(v);', 'the line of a seal withheld by the season replay, drawn with the Chronicle');
  // the afterword is the last block of the Chronicle's side column
  var atPast = html.indexOf('id="chron-past-list"'), atAfter = html.indexOf('<section class="chron-block afterword" aria-labelledby="h-chron-afterword">');
  if (!(atPast > 0 && atAfter > atPast && /^<section class="chron-block afterword"[^>]*>\s*<h3 class="label" id="h-chron-afterword">[^<]*<\/h3>\s*<p id="chron-afterword"><\/p>\s*<\/section>\s*<\/div>\s*<\/div>\s*<\/section>/.test(html.slice(atAfter)))) throw new Error('the afterword is not the last block of the Chronicle\'s side column');
  has(app, "setText('chron-afterword', W.afterword());", 'the afterword from the words of the place');
  hooks++;
  // a Life is always of the place in hand, the valley included, and its five situations are named in the place's words
  var calls = app.match(/A\.createLife\([^()]*\)/g) || [];
  if (!calls.length || calls.some(function (c) { return !/, state\.place\)$/.test(c); })) throw new Error('app.js calls createLife without the place in hand: ' + calls.join(' '));
  hooks++;
  if (/situationTitle|\bway\.title\b|\bw\.title\b/.test(app)) throw new Error('app.js shows the engine\'s titles of the situations, not the place\'s (AYWords.title)');
  has(app, 'W.use(state.place);', 'the words of the place in hand put in force');
  has(app, 'after-you.lives.v1', 'storage key');
  has(html, 'aria-live="polite"', 'live region');
  // the Afterwards: one quiet region that is never hidden; the list of events and the counting line are not live
  has(html, '<p class="vh" id="after-say" aria-live="polite"></p>', 'the one live line of the Afterwards');
  if ((html.match(/aria-live=/g) || []).length !== 2) throw new Error('live regions: the day\'s status and the Afterwards\' one line, no others');
  if (/role="log"/.test(html)) throw new Error('the ticker must not be a live log');
  has(html, '<main class="sheet" id="app">', 'main landmark');
  // every id app.js asks for by name is in the page, or is made by app.js itself
  var asked = {}, m2, reIds = /(?:\$|setText)\('([a-z0-9-]+)'[,)]/g;      // a whole name, not the stem of a made-up one
  while ((m2 = reIds.exec(app))) asked[m2[1]] = true;
  Object.keys(asked).forEach(function (id) {
    if (html.indexOf('id="' + id + '"') < 0 && app.indexOf("id: '" + id + "'") < 0) throw new Error('app.js asks for #' + id + ', which is nowhere in the page');
    hooks++;
  });
  // copy that stands in the page at rest is the copy in words.js, with the valley's rules
  var valleyRules = A.createLife(1, VALLEY).params;
  [W.fordNote(), W.waysNote(), W.leaveSub(), W.flowLabels(valleyRules).rule, W.mapHint(), W.mapFold(false), W.whyMarked(), W.placesHead(), W.otherPlace(), W.heads().afterword].forEach(function (line) {
    has(html, '>' + line + '<', 'copy at rest');
  });
  // an unchosen option carries no mark; the chosen one is shown by the style sheet
  if (/class: 'glyph/.test(app) || /\.glyph\b/.test(html)) throw new Error('the radio-like dot is back on the options');
  has(html, '.opt input:checked + .opt-face .opt-check { display: block; }', 'the check on the chosen option only');
  has(app, "'data-bearing': W.bearingShort(i).toLowerCase()", 'where a card lies when the four are two by two');
  // two by two the cards stand in the page row by row, as they lie: north-west, north-east, west, east
  var rowOrder = [2, 1, 3, 0].map(function (k) { return W.bearingShort(k); }).join(' ');
  if (rowOrder !== 'NW NE W E') throw new Error('the cards\' order by row no longer matches their bearings: ' + rowOrder);
  has(app, 'var CARDS_BY_ROW = [2, 1, 3, 0];', 'the order of the cards in the page when they lie two by two');
  has(app, 'orderCards();', 'the cards put in order again when the window crosses the two-by-two line');
  has(app, 'onMedia(mqTwo, function () {', 'the day\'s button placed again when the window crosses the two-column line');
  // an unturned card is as tall as its face: the back lies over it until it is asked for
  has(html, '.card-back { position: absolute; inset: 0; overflow: hidden;', 'the back of a card out of the flow until it is turned');
  has(html, '.card.is-flipped .card-back { position: static; overflow: visible;', 'the back of a turned card in the flow');
  has(html, '.card-inner { position: relative;', 'the box the back of a card is laid over');
  // the Why? under "Elsewhere today" is named by its own word and its sentence
  has(app, "id: 'why-kin-' + e.id, 'aria-labelledby': 'why-kin-' + e.id + ' else-line-' + e.id", 'the name of the Why? under Elsewhere today');
  has(app, "id: 'else-line-' + e.id", 'the sentence that names it');
  // the strip of hands arriving heads the second column of the Afterwards, above the list of events
  var atRight = html.indexOf('<div class="after-right">'), atStrip = html.indexOf('id="flow-strip"'), atTicker = html.indexOf('id="h-ticker"');
  if (!(atRight > 0 && atRight < atStrip && atStrip < atTicker)) throw new Error('the strip is not at the head of the second column of the Afterwards');
  hooks++;
  // the Opening keeps its list of earlier lives short
  has(html, '<details id="opening-past-more" hidden>', 'the older lives, behind their count');
  has(app, 'var PAST_SHOWN = 3, PAST_SHOWN_CHOOSING = 2;', 'how many earlier lives the Opening lists (two where the choice of places takes a row)');
  // once the future has ended the count is finished in a few large slices, and straight through where the page is not in front
  has(app, 'budget = over ? (away ? Infinity : 800) : (away ? 250 : 25);', 'the slices of the count');
  if (/\btitle: W\./.test(app)) throw new Error('words that only a pointer can reach (a title attribute)');
  has(html, 'padding-left: max(16px, env(safe-area-inset-left, 0px))', 'side gutter'); has(html, 'padding-right: max(16px, env(safe-area-inset-right, 0px))', 'side gutter');
  has(html, '@media (prefers-color-scheme: dark)', 'dark theme'); has(html, ':root:not([data-theme="light"])', 'dark theme guard'); has(html, ':root[data-theme="dark"]', 'dark theme toggle');
  has(html, '[hidden] { display: none !important; }', 'hidden rule'); has(html, '@media (prefers-reduced-motion: reduce)', 'reduced motion');
  // a place's own colours: three token blocks (light, dark by media, dark by attribute) chosen by the
  // place app.js marks on the root, each pair the page draws with at least as far apart as the valley's
  has(app, "document.documentElement.setAttribute('data-place', state.place)", 'the place in hand marked for the style sheet');
  placeColours(html);
  if (/\b(alert|confirm|prompt)\s*\(|window\.print|<form|requestAnimationFrame/.test(app + html + scripts)) throw new Error('a call or tag the host forbids');
  // the opening is complete at rest: its static copy is the copy in words.js
  var op = W.opening(valleyRules);
  [op.title, op.premise, op.begin].concat(op.lines).forEach(function (line) { has(html, '>' + line + '<', 'opening copy at rest'); });
  // every colour is a token: no literal colour after the token blocks
  var css = html.slice(html.indexOf('*, *::before'), html.indexOf('</style>'));
  if (/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(css)) throw new Error('a literal colour in a component rule');
})();

var secs = preciseTime() - T0;
print('Places checked: ' + RUN.join(', ') + ' (registered: ' + PL.order.join(', ') + '); words of each place ' + lexiconStrings +
      ' strings in all, sheets drawn ' + sheetsDrawn + '; places whose rules were checked against their words ' + rulesChecked);
RUN.forEach(function (id) { print('Leak list of ' + id + ': ' + leakListOf(id).length + ' words of other places'); });
print('AYWords functions exercised: ' + NAMES.length + ' of ' + NAMES.length + ' (and the lexicon\'s use and title)');
print('Engine fields read: ' + fieldsRead + '; page hooks found: ' + hooks + '; places with colours of their own, checked against the valley\'s: ' + (coloursChecked.join(', ') || 'none'));
print('Sentences checked: ' + sentences);
print('Time: ' + secs.toFixed(1) + ' s');
if (secs > SECONDS_A_PLACE * RUN.length) throw new Error('page-smoke.js took longer than ' + (SECONDS_A_PLACE * RUN.length) + ' seconds (' + SECONDS_A_PLACE + ' for each place checked)');
print('PAGE SMOKE: PASS');
