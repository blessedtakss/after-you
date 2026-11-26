# The Saltmarket: the final preset

> **Quoted from the code.** This is `AfterYou.PLACES.saltmarket` with the comment above it, lines 602 to 614 of `engine.js` as it stands at tag v0.2.0 (quoted on 2026-11-26). `engine.js` is the authority: if it changes, this copy is out of date. The keys are explained in the PLACES part of the header comment of `engine.js`.

```js
    // A guild of salt sellers. A hand is holding the guild price. Holding together pays the
    // sellers; what counts is the town, which is better off in the futures where the ring breaks
    // (tie-days on which both held fall below HOLD_LINE). The custom is the guild's rule
    // [1,1,0,1,0] (the valley's old way, already among the thirteen, so the range is the valley's).
    // fix-saltmarket: the season replay (REPLAY 'season') and a seal mark of 20 (one habit here
    // moves a fifth of the futures, so "clearly better" is set at that); the need margin 14.
    saltmarket: {
      B: 3, C: 1, S: 2, H: 0,
      CUSTOM: [1, 1, 0, 1, 0],
      CHARTER: 'breaks', FLOW_KIND: 'both', HOLD_LINE: 0.5,
      NEED_PIVOT: 104, NEED_WEIGHT: 0.5, MARGIN: 14,
      REPLAY: 'season', SEAL_MARK: 20
    }
```

Compared key by key with the fixer's `preset.json` (the preset that [FIX.md](FIX.md) settles and [CONFIRM.md](CONFIRM.md) attacked): the same 13 keys and values.
