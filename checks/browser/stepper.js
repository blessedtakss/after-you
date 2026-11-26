// Plays a Life in the real page to a given day and state (the same ways of playing as autoplayer.js), then reports
// where the day's blocks end, so that the tallest column and what fills it can be read. Paste the whole file into the
// console of the page (preview.html), then:
//   await __step('watch', 45, 'tft', 6, true)    // place, seed, way of playing, day, closed (true) or open (false)
// It returns a list of [block, top, bottom, height] in page pixels (hidden blocks as [block, 'hidden']), each card's,
// and the page's scrollHeight; __layout() reports the same for the page as it stands.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
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
  }
  window.__layout = function () {
    var ids = ['day-track', 'store', 'day-map-figure', 'map-bar', 'ways', 'day-status', 'day-actions', 'cards', 'season-end', 'elsewhere', 'ford-note'];
    var out = ids.map(function (id) { var n = $(id); if (!n || n.hidden) return [id, 'hidden']; var r = n.getBoundingClientRect(); return [id, Math.round(r.top + scrollY), Math.round(r.bottom + scrollY), Math.round(r.height)]; });
    document.querySelectorAll('#cards .card').forEach(function (c) { var r = c.getBoundingClientRect(); out.push(['card ' + c.getAttribute('data-bearing'), Math.round(r.top + scrollY), Math.round(r.bottom + scrollY), Math.round(r.height)]); });
    out.push(['scrollHeight', document.scrollingElement.scrollHeight]);
    return out;
  };
  window.__step = async function (place, seed, pol, day, closed) {
    var S = AYApp.state;
    if (S.view === 'chronicle') { await sleep(420); $('other-place').click(); await sleep(120); }
    location.hash = '#' + place + '-' + seed; await sleep(200);
    $('begin').click(); await sleep(150);
    for (var d = 1; d <= day; d++) {
      await sleep(60);
      if (d === day && !closed) return window.__layout();
      S.today.neighbours.forEach(function (n, i) { $('choice-' + n.id + (stayFor(pol, d, i, n) ? '-stay' : '-send')).click(); });
      $('close-day').click(); await sleep(460);
      if (d === day) return window.__layout();
      $('next-day').click(); await sleep(120);
      if (S.view === 'day' && S.phase === 'season') { await sleep(420); $('next-day').click(); await sleep(120); }
    }
  };
})();
