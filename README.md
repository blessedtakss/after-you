# After You

After You is a small browser game built on the iterated prisoner's dilemma, though it never says so on screen. You are one house of eight in a valley. For twelve days of harvest you decide, neighbour by neighbour, whether to send a hand or stay home; then you leave, and the valley runs on for thirty seasons without you. At the end the game counts two things: whether your store is enough for winter, and whether the valley is better or worse off for the ways you left.

## Play it

The game is plain files with no build step. The commands below use Python 3 only as a local web server; any static web server and any port will do.

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

There is one URL option. Adding `#valley-` and a number, for example `preview.html#valley-7`, fixes which valley is played when a life is begun from the opening screen. A name made of letters, digits or dashes also works and is turned into a number. Without the option, the valley is picked at random from 1 to 99999. At the end of a life, "Live this valley again" replays the same valley and "Live another life" picks a new one at random. There are no query-string options.

The three alternative looks open the same way, at `variants/a/preview.html`, `variants/b/preview.html` and `variants/c/preview.html`, and accept the same option. Without it, looks A and C pick the valley at random from 10000 to 99999.

## What is in the folder

| Path | Role |
| --- | --- |
| `preview.html` | The file to open. It is `index.html` wrapped in a complete HTML document. |
| `index.html` | The page itself (styles, markup and three script tags) as content only, for the hosting service. |
| `engine.js` | The whole game model. No dependencies and no contact with the page. |
| `words.js` | Every sentence and button label the page shows. |
| `app.js` | The page logic: the screens, the map drawing, the list of earlier lives, and reading the valley from the address. |
| `page-smoke.js` | Check script. Plays 114 complete lives the way the page would, calls every function in `words.js` and checks every sentence. |
| `harness.js` | Check script. Plays many valleys with scripted ways of playing and prints measured numbers with one PASS or FAIL line for each of twelve checks (ten gates, G1 to G10, and two added later, X1 and X2). |
| `smoke.js` | An early 15-line script that plays valley 1 and prints raw engine data. It asserts nothing. |
| `variants/a/` | Alternative look A, "Tally stick": the harvest as a notched stick, with four house cards. |
| `variants/b/` | Alternative look B, a surveyor's sheet with a map of the valley. The main page grew from this one and is a later, larger revision of it. |
| `variants/c/` | Alternative look C, two banks and one ford: the neighbours on the far bank, your house on the near one. |

The variants are three alternative looks built for the same engine. Each folder holds its own `index.html`, `preview.html`, `app.js`, `words.js` and `page-smoke.js`, plus a copy of `engine.js` that is identical to the top-level one. There are therefore four copies of the engine, and a change to one has to be copied to the other three by hand.

## Check it

The checks run in `jsc`, the JavaScript shell that ships with macOS. It is not on the PATH, so the commands give its full path. Node is not needed, and the scripts are not written for it. Run them from the repository folder, because they load their sibling files by relative path.

```bash
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc page-smoke.js
```

This takes about 26 seconds. It prints a long transcript and ends with the line `PAGE SMOKE: PASS`. On a failure it stops with an error instead.

```bash
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc harness.js
```

This takes about two and a half minutes. Its last line reports the time against a stated limit of 180 seconds, which it prints but does not enforce. Among about 200 lines of measurements, the twelve check lines are the ones that begin with `PASS` or `FAIL` (G1 to G10, X1 and X2); one further line near the end times a full final count and carries its own PASS or FAIL. The script does not set its exit code from these lines, so read them rather than relying on it.

`smoke.js` still runs against this engine, in about a second, but it only prints raw engine data and checks nothing, so it is a demonstration and not a test. Its output contains spoilers, and so does the output of `harness.js`. Each variant has its own `page-smoke.js`, run the same way from inside that variant's folder; these took 24 to 35 seconds each and end with `PASS` (a and b) or `OK` (c). All of these checks passed on the v0.1.0 files.

## How it works, briefly

Underneath, the game is an iterated prisoner's dilemma among eight houses; the full model is set out in the header comment of `engine.js`, which contains spoilers. There are no dependencies and no build step: the page loads three plain scripts, with the model in `engine.js`, the wording in `words.js` and the page logic in `app.js`.

The engine is deterministic. It never uses `Math.random` or the clock, and every draw is a pure function of the valley's seed and of where the draw sits (its purpose, the day or season, the houses and the future), so a valley number always replays the same way for the same choices.

The only thing the page loads from the network is a Google Fonts stylesheet (Barlow and Old Standard TT on the main page) and the font files it names; system fonts are declared as fallbacks, and the page code sends nothing anywhere. In the browser it keeps one `localStorage` entry, `after-you.lives.v1`, holding the results of at most 20 finished games (valley number, whether the house was kept, grain stored and needed, the mark, and whether the seal was earned), with no names, dates or choices; the main page and the variants share that list when served from the same address. When the page runs inside the hosting service it also gives that service's reload hook a snapshot of the game in progress so that a reload can resume it; on an ordinary web server the hook is absent and nothing is called.

## Versions

v0.1.0 is the first playable slice, published 22 November 2026.

## Licence

No licence has been chosen yet, so all rights are reserved for now.
