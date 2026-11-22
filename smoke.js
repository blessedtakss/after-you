load('engine.js');
var AY = AfterYou;
var life = AY.createLife(1);
print(JSON.stringify(life.houses.map(h => [h.id, h.name, h.role, h.archetype, h.custom && h.custom.map(x => +x.toFixed(2))])));
print('need', life.need, 'old purse', life.old.purse);
while (!life.over) { var r = AY.playDay(life, [true, true, true, true]); if (r.lookingRound) print(JSON.stringify(r.lookingRound)); }
print('purse', life.purse, JSON.stringify(AY.legacy(life)));
var t = preciseTime();
var v = AY.verdict(life);
print('verdict s', (preciseTime() - t).toFixed(3));
print(JSON.stringify(v));
var f = AY.runFuture(life, 0);
print(JSON.stringify(f.seasons[0]));
print(JSON.stringify(f.arrival), f.holds, f.lateFlow.toFixed(3));
print(f.seasons.map(s => s.flow.toFixed(2)).join(' '));
