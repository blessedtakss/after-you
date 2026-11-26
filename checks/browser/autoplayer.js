// An auto-player for the real browser. Paste the whole file into the console of the page (preview.html, served as the
// main README says) and run, for example:
//   __queue([['valley', 48213, 'tft'], ['banks', 12, 'send'], ['watch', 3, 'never']]);
// It plays whole Lives through the page's own controls and records document.scrollingElement.scrollHeight in every
// state of the day (open, chosen, closed, the season's end), at Leaving, at the Afterwards' end and at the Chronicle,
// the widest scrollWidth of the closed days, whether the seal was earned and the Chronicle's season line, as the browser
// review did. Ways of playing: tft, mix, stft, alt, late, send, never. window.__queue(list) runs [place, seed, policy]
// in turn; results in window.__res, progress in window.__state ('running', 'done n of m', 'finished'); __fmt() prints
// one line per Life. Each Life takes about 15 seconds (the page's own pauses are waited out).
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var H = function () { return document.scrollingElement.scrollHeight; };
  function stayFor(pol, d, i, n) {
    var y = n.yesterday;
    switch (pol) {
      case 'tft': return y ? !y.they : false;
      case 'stft': return y ? !y.they : true;
      case 'mix': return (d * 7 + i * 3) % 5 < 2;
      case 'alt': return (d + i) % 2 === 1;
      case 'late': return d >= 10 ? true : (y ? !y.they : false);
      case 'send': return false;
      case 'never': return true;
    }
    throw new Error('no policy ' + pol);
  }
  async function toOpening() {
    var S = AYApp.state;
    if (S.view === 'chronicle') { await sleep(420); $('other-place').click(); await sleep(120); }
    if (S.view !== 'opening') { location.reload(); throw new Error('not at the Opening: ' + S.view); }
  }
  async function one(place, seed, pol) {
    var S = AYApp.state, rec = { place: place, seed: seed, pol: pol, open: [], chosen: [], closed: [], season: [], leaving: 0, after: 0, chron: 0, sw: 0, seal: null, line: null };
    await toOpening();
    location.hash = '#' + place + '-' + seed; await sleep(200);
    if (S.place !== place || String(S.fixedSeed) !== String(seed)) throw new Error('the hash did not put ' + place + ' ' + seed + ' in hand');
    $('begin').click(); await sleep(150);
    for (var d = 1; d <= 12; d++) {
      await sleep(80);
      rec.open.push(H());
      S.today.neighbours.forEach(function (n, i) { $('choice-' + n.id + (stayFor(pol, d, i, n) ? '-stay' : '-send')).click(); });
      await sleep(80);
      rec.chosen.push(H());
      $('close-day').click(); await sleep(460);
      rec.closed.push(H());
      rec.sw = Math.max(rec.sw, document.scrollingElement.scrollWidth);
      $('next-day').click(); await sleep(120);
      if (S.view === 'day' && S.phase === 'season') { rec.season.push(H()); await sleep(420); $('next-day').click(); await sleep(120); }
    }
    await sleep(200); rec.leaving = H(); await sleep(250);
    $('leave').click(); await sleep(800);
    $('skip').click();
    var g = 0; while (!S.verdict) { await sleep(100); if (++g > 600) throw new Error('the count never finished'); }
    await sleep(400); rec.after = H();
    $('to-chronicle').click(); await sleep(300);
    rec.chron = H();
    rec.seal = !!(S.verdict.seal && S.verdict.seal.earned);
    rec.line = $('chron-season') ? $('chron-season').textContent : null;
    return rec;
  }
  window.__res = window.__res || [];
  window.__queue = async function (list) {
    window.__state = 'running';
    for (var k = 0; k < list.length; k++) {
      try { window.__res.push(await one(list[k][0], list[k][1], list[k][2])); }
      catch (e) { window.__res.push({ place: list[k][0], seed: list[k][1], pol: list[k][2], error: String(e) }); }
      window.__state = 'done ' + (k + 1) + ' of ' + list.length;
    }
    window.__state = 'finished';
  };
  window.__fmt = function () {
    return window.__res.map(function (r) {
      if (r.error) return r.place + ' ' + r.seed + ' ' + r.pol + ' ERROR ' + r.error;
      var mx = function (a) { return a.length ? Math.max.apply(null, a) : 0; };
      return r.place + ' ' + r.seed + ' ' + r.pol + ' | open ' + mx(r.open) + ' chosen ' + mx(r.chosen) + ' closed ' + mx(r.closed) + ' season ' + mx(r.season) +
             ' | leaving ' + r.leaving + ' after ' + r.after + ' chron ' + r.chron + ' | sw ' + r.sw + (r.seal ? ' SEAL' : '') + (r.line ? ' LINE' : '') +
             ' | closed by day ' + r.closed.join(',');
    }).join('\n');
  };
})();
