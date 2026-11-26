// page-p4: the three places' honest ways of playing and selfish acts in page-smoke.js's form
// (n = today().neighbours[i], day, seed; memory per Life and neighbour, started afresh on day 1), from
// fix-watch/policies-fw.js, fix-bridges/policies.js (tune-bridges/policies.js turnsAfterJams and
// crossWhileYouCan) and tune-saltmarket/policies.js. The same text goes into page-smoke.js.
var MEMO = {};
function memoOf(tag, n, day, seed) { var key = tag + ':' + seed + ':' + n.id; if (day === 1 || !MEMO[key]) MEMO[key] = { miss: 0, ever: false }; return MEMO[key]; }
var THEIRS = [0, 1, 3, 2, 4];
// the Watch: "first to stand down, with second chances", reading a tower's record as the page shows it
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
// the Bridges: "take turns, at the jams too" (the jams counted per carter)
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
// the Saltmarket: "the seller who never puts the price back" (the valley's careful, and a cut after your own price slipped while theirs held)
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
var PLACE_POLICIES_P4 = {
  watch: {
    'first to stand down, with second chances': function (n, day, seed) { return watchHonest(n, day, seed, 'watch'); },
    // its selfish act on the last day: stand down only where a stand-down is expected back
    'first to stand down, keeping watch unless answered on the last day': function (n, day, seed) {
      var c = watchHonest(n, day, seed, 'watchSelfish');
      return day === 12 && c ? watchExpected(n) : c;
    }
  },
  bridges: {
    'take turns, at the jams too': function (n, day, seed) { return bridgesHonest(n, day, seed, 'bridges'); },
    // its selfish act on the last three days: drive on wherever the other looks likely to give way, give way wherever not
    'take turns, crossing while you can on the last three days': function (n, day, seed) {
      var c = bridgesHonest(n, day, seed, 'bridgesSelfish');
      return day >= 10 ? !bridgesLikely(n) : c;
    }
  },
  saltmarket: {
    'never put the price back': function (n, day, seed) { return saltHonest(n, day, seed, 'salt'); },
    // its selfish act on the last day: hold the price where the honest seller would cut it, beside a stall expected to hold
    'never put the price back, but hold it again on the last day': function (n, day, seed) {
      var c = saltHonest(n, day, seed, 'saltSelfish');
      return day === 12 && !c && saltExpected(n) ? true : c;
    }
  }
};
