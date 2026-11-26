# The Banks: the final preset

> **Quoted from the code.** This is `AfterYou.PLACES.banks` with the comment above it, lines 552 to 569 of `engine.js` as it stands at tag v0.2.0 (quoted on 2026-11-26). `engine.js` is the authority: if it changes, this copy is out of date. The keys are explained in the PLACES part of the header comment of `engine.js`.

```js
    // Fishing grounds (also shared pasture). A hand is keeping off the other's water; the bank on a
    // tie fills by one when both keep off or one alone does, and empties by four when both fish
    // across. What holds is the ground itself: the late mean level against HOLD_LINE (7/6 of the
    // start). A poacher sits in the near taker's seat: it fishes across strangers but takes peace
    // after a quarrel, so ending a quarrel can be seen to work (fix-banks).
    banks: {
      B: 1, C: 2, K: 1, FOG: 0.04, R_AFTER: 2.5,
      STOCK: { start: 6, min: 1, max: 9, delta: [-4, 1, 1] },
      FLOW_KIND: 'stock', HOLD_LINE: 7 / 6,
      CUSTOM: [1, 1, 0, 1, 0],
      FOUNDERS: { near: ['poacher', 'soft', ['firm', 'wary', 'steady']], far: ['firm', 'firm', 'firm', 'soft', 'wary', 'steady'] },
      NEED_PIVOT: 181, NEED_WEIGHT: 0.5, MARGIN: 53,
      REPLAY: 'habit',
      // The valley's thirteen with [1,1,0.67,1,0] replaced by [1,1,0.5,1,1] (ends a quarrel).
      RANGE_WAYS: [[1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 1, 0, 1, 0], [1, 1, 0.33, 1, 0.33], [1, 1, 0.5, 1, 0.5],
                   [1, 1, 0.67, 1, 0.67], [1, 1, 0, 0, 1], [1, 1, 0, 0, 0], [1, 1, 0.33, 1, 0],
                   [1, 1, 0.5, 1, 0], [1, 1, 0.5, 1, 1], [1, 1, 1, 1, 0], [0, 1, 1, 1, 0]]
    },
```

Compared key by key with the fixer's `preset.json` (the preset that [FIX.md](FIX.md) settles and [CONFIRM.md](CONFIRM.md) attacked): the same 15 keys and values.
