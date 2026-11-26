# The Watch (shown as "Border"): the final preset

> **Quoted from the code.** This is `AfterYou.PLACES.watch` with the comment above it, lines 570 to 584 of `engine.js` as it stands at tag v0.2.0 (quoted on 2026-11-26). `engine.js` is the authority: if it changes, this copy is out of date. The keys are explained in the PLACES part of the header comment of `engine.js`.

```js
    // Border towers. A hand is standing down. Both stand down +7, you alone -5, they alone +6,
    // both keep watch -3: together pays most, alone costs, there is nothing to take. One night in
    // ten a fire is misread (FOG). A taker and a fearful (wary) tower are always next door. The
    // custom never goes first: it answers a tower that stands down, lets a single fire pass, and
    // waits when both keep watch (fix-watch). It is among the valley's thirteen, so the range is
    // the valley's. The season replay (confirm-watch): a tower that reopens standoffs against its
    // own habit on days 9-11 and plays day 12 by the habit that made is not sealed for it.
    watch: {
      B: 6, C: 5, S: 6, H: 3, K: 1.5, FOG: 0.1,
      CUSTOM: [0, 1, 1, 1, 0],
      FLOW_KIND: 'both', HOLD_LINE: 0.3,
      FOUNDERS: { near: ['taker', 'soft', 'wary'], far: ['firm', 'firm', 'firm', 'soft', 'wary', 'steady'] },
      NEED_PIVOT: 22, NEED_WEIGHT: 0.5, MARGIN: 112,
      REPLAY: 'season'
    },
```

Compared key by key with the fixer's `preset.json` (the preset that [FIX.md](FIX.md) settles and [CONFIRM.md](CONFIRM.md) attacked): 14 keys, all the same except `REPLAY` "habit" in the fixer's preset, "season" in engine.js. The change was decided after the confirmation round: the Watch takes the season replay ([LEAD-DECISIONS.md](../LEAD-DECISIONS.md), section 4, decision 1).
