// The Saltmarket: the honest policy, its selfish act on the last days, and the search family.
// For placelab.js: load after engine-places.js and placelab.js; sets globalThis.SaltPolicies.
//
// In the Saltmarket a hand is HOLDING THE GUILD PRICE with that stall; staying home is CUTTING IT.
// Both hold: +4 each (3 of trade kept, -1 for the trade you let go, +2 the town pays). You hold, they
// cut: -1. You cut, they hold: +3. Both cut: 0. Every policy here sees only what the page shows:
// view = today(life) + { ways, seed, params, place, memo } (memo lasts the whole Life).
(function () {
  var L = globalThis.PlaceLab;
  var NEW = 0, BOTH = 1, SHORTED = 2, OWING = 3, NEITHER = 4;
  var THEIRS = [0, 1, 3, 2, 4];

  // Whether a stall's price is expected to hold today: it mostly held in the situation it is in now
  // (as seen), or, where nothing is known of that, the two are on good terms (placelab's expected).
  function expected(nb) {
    var theirs = nb.seen[THEIRS[nb.situation]];
    return theirs.n ? theirs.h * 2 >= theirs.n : nb.situation === BOTH;
  }

  // careful's five rules (the valley harness's careful, unchanged) for one stall, with its memory in st.
  function carefulRule(nb, view, st) {
    var id = nb.id, s = nb.situation;
    if (nb.yesterday) {
      st.missed[id] = nb.yesterday.they ? 0 : (st.missed[id] || 0) + 1;
      if (nb.yesterday.they) st.ever[id] = true;
    }
    var owing = nb.seen[OWING], patient = (st.missed[id] || 0) < 3;
    if (view.day === 1) return true;
    if (!st.ever[id]) return (nb.kin || nb.seen[NEW].h >= 1) && patient;
    if (!nb.kin && owing.n >= 1 && owing.h / owing.n < 0.5) return s !== SHORTED;
    return patient;
  }

  // ---- THE HONEST POLICY: the seller who never puts the price back --------------------------------------
  // "Hold the price with every stall that holds it and be patient when one slips, but never be the one
  //  to put the price back: once your own price has slipped while theirs held, keep yours down until
  //  they cut too."
  //
  // Toward each stall:
  //   1. After you cut, or your boy sold below the price, and their price held: cut (the only
  //      town-minded rule; it holds for the whole break, so the price comes back only when both cut).
  //   Otherwise careful's rules, unchanged:
  //   2. Day 1: hold.
  //   3. A stall never yet seen to hold the price with you: hold if it is your sister's, or it has been
  //      seen holding with a stall new to it, while it has failed you fewer than three days running.
  //   4. A stall (not your sister's) seen not to go back to the price after cutting: cut back once when
  //      it cuts on you, otherwise hold.
  //   5. Otherwise hold while it has failed you fewer than three days running.
  function honestPolicy(view) {
    var m = view.memo;
    if (!m.seller) m.seller = { missed: {}, ever: {} };
    var st = m.seller;
    return view.neighbours.map(function (nb) {
      var base = carefulRule(nb, view, st);      // always called, so careful's memory stays current
      return nb.situation === OWING ? false : base;
    });
  }

  // The alternative measured beside it (not the honest policy): the patient seller, who cuts only the
  // first day of each break after their own price slipped ("one more day of cheap salt for the town").
  function patientSeller(view) {
    var m = view.memo;
    if (!m.patient) m.patient = { missed: {}, ever: {}, owed: {} };
    var st = m.patient;
    return view.neighbours.map(function (nb) {
      var id = nb.id;
      if (nb.situation === BOTH) st.owed[id] = false;
      var base = carefulRule(nb, view, st);
      if (nb.situation === OWING && !st.owed[id]) { st.owed[id] = true; return false; }
      return base;
    });
  }

  // ---- THE SELFISH ACT ---------------------------------------------------------------------------------
  // What serves the store against the town on the last days: hold the price where the honest seller
  // would cut it, with a stall whose price is expected to hold (4 instead of 3 for you; the town pays 4
  // more at that pair). For the honest policy this means: in the last days, put the price back with a
  // stall that is still holding it after your own price slipped.
  // act(nb, view, honestChoice) -> true (hold) | null (keep the honest choice).
  function selfishAct(nb, view, honestChoice) {
    if (honestChoice) return null;
    return expected(nb) ? true : null;
  }
  // The honest policy with the selfish act on the last n days (n = 1, 2, 3), as one policy(view).
  // (placelab's 'honest+selfish1/2/3' builds the same thing from honestPolicy and selfishAct.)
  function honestSelfish(n, base) {
    base = base || honestPolicy;
    return function (view) {
      var c = base(view);
      if (view.day <= 12 - n) return c;
      return view.neighbours.map(function (nb, i) { var a = selfishAct(nb, view, c[i]); return a === true || a === false ? a : c[i]; });
    };
  }

  // ---- the search family --------------------------------------------------------------------------------
  // careful's logic with patience `pat`, and a town-minded answer in three situations: sh (after they
  // cut on you), ow (after you, or your boy, left them short), ne (after both cut): 'careful' (careful's
  // answer), 'once' (cut the first time in each break, then careful's answer), 'cut' (always cut there).
  // seller(3, 'careful', 'cut', 'careful') is the honest policy above written as a decide-maker, and
  // seller(3, 'careful', 'once', 'careful') the patient seller.
  function seller(pat, sh, ow, ne, name) {
    function maker() {
      var missed = {}, ever = {}, shOnce = {}, owOnce = {};
      return function (nb, T) {
        var id = nb.id, s = nb.situation;
        if (nb.yesterday) { missed[id] = nb.yesterday.they ? 0 : (missed[id] || 0) + 1; if (nb.yesterday.they) ever[id] = true; }
        if (s === BOTH) { shOnce[id] = false; owOnce[id] = false; }
        var owing = nb.seen[OWING], patient = (missed[id] || 0) < pat, base;
        if (T.day === 1) base = true;
        else if (!ever[id]) base = (nb.kin || nb.seen[NEW].h >= 1) && patient;
        else if (!nb.kin && owing.n >= 1 && owing.h / owing.n < 0.5) base = s !== SHORTED;
        else base = patient;
        if (s === SHORTED && sh === 'cut') return false;
        if (s === SHORTED && sh === 'once' && !shOnce[id]) { shOnce[id] = true; return false; }
        if (s === OWING && ow === 'cut') return false;
        if (s === OWING && ow === 'once' && !owOnce[id]) { owOnce[id] = true; return false; }
        if (s === NEITHER && ne === 'cut') return false;
        return base;
      };
    }
    return { name: name || ('seller p' + pat + ' ' + sh + '/' + ow + '/' + ne), maker: maker };
  }

  // Store then town (tried and set aside): careful until the store covers the need, then cut with all.
  function storeThenTown(view) {
    var m = view.memo;
    if (!m.careful) m.careful = L.makers.careful(false)();
    var c = view.neighbours.map(function (nb) { return !!m.careful(nb, view); });
    return view.purse >= view.need ? c.map(function () { return false; }) : c;
  }

  globalThis.SaltPolicies = {
    expected: expected,
    honestPolicy: honestPolicy,
    selfishAct: selfishAct,
    honestSelfish: honestSelfish,
    honest: { name: 'never puts the price back', policy: honestPolicy },
    patientSeller: { name: 'patient seller', policy: patientSeller },
    holdOn: { name: 'hold on (keep the price where honest would cut it)', act: selfishAct },
    selfish1: { name: 'honest, putting the price back on the last day', policy: honestSelfish(1) },
    selfish2: { name: 'honest, putting the price back on the last 2 days', policy: honestSelfish(2) },
    selfish3: { name: 'honest, putting the price back on the last 3 days', policy: honestSelfish(3) },
    seller: seller,
    storeThenTown: { name: 'store-then-town', policy: storeThenTown },
    // The fallback Salt Ring (valley stakes): what serves the store on the last days is the valley's grab, a cut.
    cutAct: { name: 'cut (the valley grab)', act: function () { return false; } }
  };
})();
