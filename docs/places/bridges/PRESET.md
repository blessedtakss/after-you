# The Bridges: the final preset

> **Quoted from the code.** This is `AfterYou.PLACES.bridges` with the comment above it, lines 585 to 601 of `engine.js` as it stands at tag v0.2.0 (quoted on 2026-11-26). `engine.js` is the authority: if it changes, this copy is out of date. The keys are explained in the PLACES part of the header comment of `engine.js`.

```js
    // Carters at narrow bridges. A hand is giving way. Both waiting: nobody crosses (S -2 cancels
    // the crossing); both driving on: wheels lock (H 2). What holds is the road: tie-days on which
    // exactly one gave way. Two takers among the three near carters. Word travels slowly (K 0.25)
    // and carters look round four times a season (R_AFTER 4) (fix-bridges).
    bridges: {
      B: 3, C: 1, S: -2, H: 2, FOG: 0.06, K: 0.25, R_AFTER: 4,
      FLOW_KIND: 'one', HOLD_LINE: 0.5,
      FOUNDERS: { near: ['taker', 'taker', ['firm', 'wary', 'steady']], far: ['firm', 'firm', 'firm', 'soft', 'wary', 'steady'] },
      // With two takers near, the custom earns a median of -38 in the twelve days (pivot); the
      // starting store of 50 and margin 21 keep every need above zero.
      STORE_START: 50,
      NEED_PIVOT: -38, NEED_WEIGHT: 0.5, MARGIN: 21,
      REPLAY: 'habit',
      RANGE_WAYS: [[1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 1, 0, 1, 0], [1, 1, 0, 1, 1], [1, 0, 0, 1, 1], [1, 0.5, 0, 1, 1],
                   [0.5, 0.5, 0, 1, 0.5], [1, 0.5, 0, 1, 0.5], [0, 0, 1, 0, 1], [0, 0, 1, 0, 0.5], [1, 1, 0, 0, 1],
                   [0.5, 0.5, 0.5, 0.5, 0.5], [1, 0.5, 0.5, 1, 0.5]]
    },
```

Compared key by key with the fixer's `preset.json` (the preset that [FIX.md](FIX.md) settles and [CONFIRM.md](CONFIRM.md) attacked): the same 16 keys and values.
