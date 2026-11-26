# After You

After You is a small browser game built on the iterated prisoner's dilemma, though it never says so on screen. You are one house of eight in a valley. For twelve days of harvest you decide, neighbour by neighbour, whether to send a hand or stay home; then you leave, and the valley runs on for thirty seasons without you. At the end the game counts two things: whether your store is enough for winter, and whether the valley is better or worse off for the ways you left.

The Opening offers five places, played the same way with their own rules and words: the valley, the Banks (boats sharing fishing banks that fill and fall), the Border (watchtowers that can stand down or keep watch), the Bridges (carters at bridges one cart wide) and the Saltmarket (stalls holding or cutting a guild price, where the town is better off when the ring breaks). The choice of places shows only when the page has more than one.

## Play it

Play it in a browser at **https://blessedtakss.github.io/after-you/**. That address serves the version last put on it, normally the newest tag (see [Versions](#versions)), and the address option described below works there too, for example https://blessedtakss.github.io/after-you/#bridges-4. Finished lives are kept in that browser only.

To run it from your own copy instead: the game is plain files with no build step. The commands below use Python 3 only as a local web server; any static web server and any port will do.

```bash
git clone https://github.com/blessedtakss/after-you
```

```bash
cd after-you
```

```bash
python3 -m http.server 8796 --bind 127.0.0.1
```

Then open http://127.0.0.1:8796/preview.html in a browser. Press Ctrl-C in the terminal to stop the server.

Open `preview.html`, not `index.html`. `index.html` is the same page without a document wrapper of its own (no doctype, character set or viewport declaration). It is the content-only page used by the hosting service that publishes the game, which supplies the wrapper itself. The bare address http://127.0.0.1:8796/ serves `index.html`, so keep `preview.html` in the address.

There is one URL option. Adding a place, a dash and a number, for example `preview.html#valley-7` or `preview.html#bridges-4`, chooses that place and fixes which of its lives is played when a life is begun from the opening screen. The place is the text before the first dash (`valley`, `banks`, `watch`, `bridges` or `saltmarket`, or the word the page letters it with, so `#border-3` is the Watch's life 3); anything else there leaves the whole option unread, and `#valley-` keeps its old meaning. The place alone, for example `preview.html#banks`, chooses that place with no life fixed. A seed made of letters, digits or dashes also works and is turned into a number. Without the option, the life is picked at random from 1 to 99999. Choosing a place on the opening screen writes that place alone into the address (`#banks`), in place of what was there and without a new history entry, so a reload opens the place in hand. At the end of a life, "Live this valley again" (each place words it its own way) replays the same life, "Live another life" picks a new one in the same place, and "Choose another place" returns to the Opening. There are no query-string options.

The three alternative looks open the same way, at `variants/a/preview.html`, `variants/b/preview.html` and `variants/c/preview.html`, and accept `#valley-<number>` only. Without it, looks A and C pick the valley at random from 10000 to 99999.

## What is in the folder

| Path | Role |
| --- | --- |
| `preview.html` | The file to open. It is `index.html` wrapped in a complete HTML document. |
| `index.html` | The page itself (styles, markup and its script tags) as content only, for the hosting service. |
| `engine.js` | The whole game model, every place's rules included (`AfterYou.PLACES`). No dependencies and no contact with the page. |
| `words.js` | The sentence functions the page shows, and the register of places; each function reads the words of the place in force. |
| `places/` | One file for each place (`valley.js`, `banks.js`, `watch.js`, `bridges.js`, `saltmarket.js`), loaded in play order: its words, its charter, its map decoration and its afterword. |
| `sheet.js` | The map drawing: the eight holdings, the sixteen ties and each place's barrier, far line, crossings and holdings, as SVG strings. |
| `app.js` | The page logic: the screens, the choice of places, the list of earlier lives, and reading the place and seed from the address. |
| `page-smoke.js` | Check script. Plays 120 to 155 complete lives in each place the way the page would, calls every function in `words.js`, checks every sentence and each place's words against its rules. |
| `harness.js` | Check script. Plays many valleys with scripted ways of playing and prints measured numbers with one PASS or FAIL line for each of twelve checks (ten gates, G1 to G10, and two added later, X1 and X2). |
| `smoke.js` | An early 15-line script that plays valley 1 and prints raw engine data. It asserts nothing. |
| `variants/a/` | Alternative look A, "Tally stick": the harvest as a notched stick, with four house cards. |
| `variants/b/` | Alternative look B, a surveyor's sheet with a map of the valley. The main page grew from this one and is a later, larger revision of it. |
| `variants/c/` | Alternative look C, two banks and one ford: the neighbours on the far bank, your house on the near one. |
| `tools/pages.sh` | Puts a tagged version on the web address above, through the `gh-pages` branch: its `preview.html` as the front page and the files that page loads, nothing else. |

The variants are three alternative looks built for the valley alone. Each folder holds its own `index.html`, `preview.html`, `app.js`, `words.js` and `page-smoke.js`, plus a copy of the v0.1.0 `engine.js`. The top-level engine has since gained the four new places; it plays the valley exactly as the v0.1.0 engine does, so the variants are unchanged, but their engine copies are no longer the same file.

## Check it

The checks run in `jsc`, the JavaScript shell that ships with macOS. It is not on the PATH, so the commands give its full path. Node is not needed, and the scripts are not written for it. Run them from the repository folder, because they load their sibling files by relative path.

```bash
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc page-smoke.js
```

This takes about three and a half minutes for the five places (its limit is 60 seconds a place). It prints a long transcript and ends with the line `PAGE SMOKE: PASS`. On a failure it stops with an error instead. `page-smoke.js -- banks` (or any place) checks one place alone, in under a minute.

```bash
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc harness.js
```

This takes about two and a half minutes. Its last line reports the time against a stated limit of 180 seconds, which it prints but does not enforce. Among about 200 lines of measurements, the twelve check lines are the ones that begin with `PASS` or `FAIL` (G1 to G10, X1 and X2); one further line near the end times a full final count and carries its own PASS or FAIL. The script does not set its exit code from these lines, so read them rather than relying on it.

`smoke.js` still runs against this engine, in about a second, but it only prints raw engine data and checks nothing, so it is a demonstration and not a test. Its output contains spoilers, and so does the output of `harness.js`. Each variant has its own `page-smoke.js`, run the same way from inside that variant's folder; these took 24 to 35 seconds each and end with `PASS` (a and b) or `OK` (c). All of these checks passed on the v0.1.0 files.

## Checks

The `checks/` folder keeps the further checks that version 2 was built with, so that later changes can be held to them. `checks/run-all.sh` runs every page check on the working tree and compares the valley's sentences, its page and maps, the words of every place, every drawing of every place's map and a whole Life's page and maps in every place line for line against a tagged version (v0.2.0 unless another is named), and checks that `preview.html` is `index.html` as the host wraps it (`python3 checks/page/preview.py --write` rebuilds it after a page change); it takes about eight minutes and ends with `RUN-ALL: PASS`. `checks/engine/` holds the proof that the engine still plays the valley exactly as v0.1.0 did and each place's design gates, and `checks/browser/` two tools to paste into the page in a browser. What each check proves, how to run it, how long it takes, what passing looks like and which to run after which kind of change are in [checks/README.md](checks/README.md); the design notes behind the places are in [docs/README.md](docs/README.md). The checks write their outputs to `checks/out/`, which git ignores.

## How it works, briefly

Underneath, the game is an iterated prisoner's dilemma among eight houses; the full model is set out in the header comment of `engine.js`, which contains spoilers. There are no dependencies and no build step: the page loads plain scripts in order, the model in `engine.js`, the sentence functions in `words.js`, one file of words for each place in `places/`, the map drawing in `sheet.js` and the page logic in `app.js`.

The engine is deterministic. It never uses `Math.random` or the clock, and every draw is a pure function of the valley's seed and of where the draw sits (its purpose, the day or season, the houses and the future), so a valley number always replays the same way for the same choices.

The only thing the page loads from the network is a Google Fonts stylesheet (Barlow and Old Standard TT on the main page) and the font files it names; system fonts are declared as fallbacks, and the page code sends nothing anywhere. In the browser it keeps one `localStorage` entry, `after-you.lives.v1`, holding the results of at most 60 finished games across the places (the place, its number, whether the house was kept, the store and the need, the mark, and whether the seal was earned), with no names, dates or choices; the Opening and the Chronicle list only the lives of the place in hand. The variants keep the v0.1.0 code: served from the same address as the main page they read the same entry and list every stored life as a valley, and when they store one they keep only the newest 20; look B also drops each entry's place, so the main page then lists those lives as the valley's. The Chronicle lists the newest 20 lives of the place in hand, as v0.1.0 did. When the page runs inside the hosting service it also gives that service's reload hook a snapshot of the game in progress so that a reload can resume it; on an ordinary web server the hook is absent and nothing is called.

## Versions

v0.1.0 is the first playable slice, the valley alone, published 22 November 2026. v0.2.0 adds the four new places (the Banks, the Border, the Bridges and the Saltmarket) and was published on 26 November 2026. v0.2.1, the same day, writes the minus sign as a plain-text escape so negative numbers show correctly when the page is served without a declared encoding; nothing the page shows changes, and it is the link's third published version. It also keeps the checks (`checks/`) and the design notes (`docs/`). Each tag holds the game exactly as it was published.

The web address serves the `gh-pages` branch, which holds only the built site. After a new version's tag is pushed, `tools/pages.sh --push` builds the site from the newest `vX.Y.Z` tag and pushes it to that branch; without `--push` it only shows what it would put up and whether that differs from what is there. Naming a tag, as in `tools/pages.sh v0.2.0 --push`, puts that version up instead, for example to go back to it. Work on `main` that is not tagged never goes live, and the site's `version.txt` names the tag and commit it is serving. The alternative looks are not on the site: served from the same address they would share, and shorten, the main page's list of earlier lives.

## Licence

No licence has been chosen yet, so all rights are reserved for now.
