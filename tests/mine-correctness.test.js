// Focused real-method regressions; fake DOM/storage/time, no browser or dependencies.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');

function mine() {
  const h = harness(), g = h.game;
  g.loadGame(); g.items.mine.count = 1; g.reconcileMineWorkers(); g.donutCount = 10000;
  h.context.Math = Object.create(Math); h.context.Math.random = () => 0.5;
  return h;
}
function snapshot(h) {
  assert.equal(h.game.saveGame({ silent: true }), true);
  return h.game.decodeSave(h.values.get('gameState'));
}
function plain(value) { return JSON.parse(JSON.stringify(value)); }
function economicState(g) {
  return plain({ balance: g.donutCount, earned: g.totalDonutsEarned,
    ores: g.ores, allowance: g.orePurchaseLimit });
}
function near(a, b) { assert.ok(Math.abs(a - b) <= Math.max(1, Math.abs(b)) * 1e-12, `${a} != ${b}`); }

test('load reconciles missing/excess old/current workers to Mine count, preserving retained entries and stock', () => {
  for (const legacy of [true, false]) {
    for (const workers of [undefined, [], [{ productionRate: 7, oldName: 'retained' }, {}, {}, {}]]) {
      const h = mine(), data = snapshot(h); data.items.mine.count = 2;
      data.ores.Gold.count = 9;
      if (legacy) delete data.saveVersion;
      // Version1 still requires the workers field; absence belongs to the legacy path.
      if (workers === undefined) { if (!legacy) continue; delete data.workers; }
      else data.workers = workers;
      h.values.set('gameState', legacy ? JSON.stringify(data) : h.game.encryptSave(data));
      h.operations.length = 0;
      const g = h.newGame(); assert.equal(g.loadGame(), true);
      assert.equal(g.workers.length, 2); assert.equal(g.ores.Gold.count, 9);
      assert.equal(h.document.getElementById('workerCount').textContent, '2');
      assert.equal(h.operations.length, 0);
      if (workers?.length) { assert.equal(g.workers[0].productionRate, 7); assert.equal(g.workers[0].oldName, 'retained'); }
      else assert.ok(g.workers.every((w) => w.productionRate === 3));
    }
  }
});

test('bulk Mine purchases preserve one worker per Mine; production remains five with retry-normalized rarities', () => {
  const h = mine(), g = h.game; g.items.mine.count = 0; g.workers = [];
  g.donutCount = 1e9; g.purchaseAmount = 5; g.buyItem('mine');
  assert.equal(g.items.mine.count, 5); assert.equal(g.workers.length, 5);
  g.workers.forEach((w) => { w.productionRate = 0; });
  g.workers.push({ productionRate: 999 });
  let draws = 0; h.context.Math.random = () => ++draws === 1 ? 0.995 : 0.1;
  g.produceMineResources(); assert.equal(g.workers.length, 5);
  assert.equal(g.ores.Copper.count, 25); assert.equal(draws, 26);
});

test('individual buy/sell commits one unit and one trade without earned/prestige/quest accounting', () => {
  const h = mine(), g = h.game; g.totalDonutsEarned = 123;
  const tracking = JSON.stringify(g.questTracking), threshold = g.nextPrestigeThreshold;
  g.isBuying = true; g.handleMarketTransaction('Copper');
  assert.equal(g.donutCount, 9840); assert.equal(g.ores.Copper.count, 1); assert.equal(g.orePurchaseLimit, 9);
  g.isBuying = false; g.isSelling = true; g.handleMarketTransaction('Copper');
  assert.equal(g.donutCount, 10000); assert.equal(g.ores.Copper.count, 0); assert.equal(g.orePurchaseLimit, 8);
  assert.equal(g.totalDonutsEarned, 123); assert.equal(g.nextPrestigeThreshold, threshold);
  assert.equal(JSON.stringify(g.questTracking), tracking);
});

test('buy/sell reject bad prices, fractional/insufficient stock, invalid deductions and unrepresentable unit changes', () => {
  const h = mine(), g = h.game; g.isBuying = true;
  for (const price of [0, -1, NaN, Infinity]) {
    g.oreTypes[0].price = price; const before = economicState(g);
    g.handleMarketTransaction('Copper'); assert.deepEqual(economicState(g), before);
  }
  g.oreTypes[0].price = 160;
  for (const balance of [0, 1e20]) {
    g.donutCount = balance; const before = economicState(g);
    g.handleMarketTransaction('Copper'); assert.deepEqual(economicState(g), before);
  }
  g.donutCount = 10000; g.ores.Copper.count = 2 ** 53;
  const before = economicState(g); g.handleMarketTransaction('Copper'); assert.deepEqual(economicState(g), before);
  g.isBuying = false; g.isSelling = true;
  for (const count of [0, 0.5, -1]) {
    g.ores.Copper.count = count; const before = economicState(g);
    g.handleMarketTransaction('Copper'); assert.deepEqual(economicState(g), before);
  }
});

test('failed credit or non-finite batch total leaves all inventory and allowance intact', () => {
  const h = mine(), g = h.game; g.ores.Copper.count = 2; g.ores.Iron.count = 2;
  const credit = g.creditDonuts; g.creditDonuts = () => false; g.isSelling = true;
  const before = economicState(g);
  g.handleMarketTransaction('Copper'); assert.deepEqual(economicState(g), before);
  assert.equal(g.sellAllOres(), false); assert.deepEqual(economicState(g), before);
  g.creditDonuts = credit; g.oreTypes[1].price = Infinity;
  assert.equal(g.sellAllOres(), false); assert.deepEqual(economicState(g), before);
  g.oreTypes[0].price = g.oreTypes[1].price = 1e308;
  assert.equal(g.sellAllOres(), false); assert.deepEqual(economicState(g), before);
  g.ores.Copper.count = 1; g.donutCount = 1e308;
  const overflow = economicState(g); g.handleMarketTransaction('Copper'); assert.deepEqual(economicState(g), overflow);
});

test('Sell All at zero allowance sells nothing and schedules no checkpoint', () => {
  const h = mine(), g = h.game; g.ores.Copper.count = 100; g.orePurchaseLimit = 0;
  const before = economicState(g); assert.equal(g.sellAllOres(), false);
  assert.deepEqual(economicState(g), before); assert.equal(g._saveTimer, null);
});

test('Sell All liquidates full stock for one action even with one remaining, without duplicate payment', () => {
  const h = mine(), g = h.game;
  g.ores.Copper.count = 2; g.ores.Iron.count = 3; g.ores.Gold.count = 1; g.orePurchaseLimit = 1;
  assert.equal(g.sellAllOres(), true);
  assert.equal(g.donutCount, 12320); assert.equal(g.orePurchaseLimit, 0);
  assert.ok(Object.values(g.ores).every((o) => o.count === 0));
  assert.equal(g.totalDonutsEarned, 0); assert.ok(g._saveTimer !== null);
  assert.ok(h.notifications.some((n) => n.includes('Used 1 market action')));
  const before = economicState(g); assert.equal(g.sellAllOres(), false); assert.deepEqual(economicState(g), before);
});

test('complete Sell All charges one action, refreshes allowance display and cannot duplicate payment', () => {
  const h = mine(), g = h.game;
  g.updatePurchaseLimitBadge = h.methods.updatePurchaseLimitBadge;
  g.ores.Copper.count = 2; g.ores.Diamond.count = 1;
  assert.equal(g.sellAllOres(), true); assert.equal(g.donutCount, 11920); assert.equal(g.orePurchaseLimit, 9);
  assert.equal(h.document.getElementById('remainingChances').textContent, '9 / 10');
  const before = economicState(g); assert.equal(g.sellAllOres(), false); assert.deepEqual(economicState(g), before);
});

test('targeted inventory recovery floors fractions and zeros negative/non-finite/malformed entries without losing other progress', () => {
  const h = mine(), data = snapshot(h); delete data.saveVersion; data.items.baker.count = 7;
  data.ores = { Copper: { count: 4.75 }, Iron: { count: -3 }, Gold: { count: 'OVERFLOW' }, Diamond: null };
  const raw = JSON.stringify(data).replace('"OVERFLOW"', '1e400'); h.values.set('gameState', raw);
  h.operations.length = 0;
  const g = h.newGame(); assert.equal(g.loadGame(), true);
  assert.deepEqual(plain(g.ores), { Copper: { count: 4 }, Iron: { count: 0 }, Gold: { count: 0 }, Diamond: { count: 0 } });
  assert.equal(g.items.baker.count, 7); assert.equal(g.donutCount, 10000); assert.equal(h.operations.length, 0);
  assert.equal(h.values.get('gameState'), raw); assert.equal(g.saveGame({ silent: true }), true);
});

test('plain and checksum saves recover invalid quotes/trends/history and keep only the last twenty valid samples', () => {
  for (const encoded of [false, true]) {
    const h = mine(), data = snapshot(h);
    data.oreTypePrices[0] = { type: 'Copper', price: -1, trend: 8,
      priceHistory: [0, -1, null, ...Array.from({ length: 25 }, (_, i) => i + 1), 'invalid'] };
    data.oreTypePrices[1] = { type: 'Iron', price: null, trend: null, priceHistory: null };
    data.oreTypePrices[2] = { type: 'Gold', price: 123, trend: -8, priceHistory: [120, 123] };
    data.oreTypePrices[3] = { type: 'Diamond', price: 1700, trend: 0.2, priceHistory: [1600, 1700] };
    h.values.set('gameState', encoded ? h.game.encryptSave(data) : JSON.stringify(data));
    h.operations.length = 0; const g = h.newGame(); assert.equal(g.loadGame(), true);
    assert.equal(g.oreTypes[0].price, 160); assert.equal(g.oreTypes[0].trend, 1);
    assert.deepEqual(plain(g.oreTypes[0].priceHistory), Array.from({ length: 20 }, (_, i) => i + 6));
    assert.equal(g.oreTypes[1].price, 400); assert.equal(g.oreTypes[1].trend, 0);
    assert.deepEqual(plain(g.oreTypes[1].priceHistory), []);
    assert.equal(g.oreTypes[2].price, 123); assert.equal(g.oreTypes[2].trend, -1);
    assert.equal(g.oreTypes[3].price, 1700); assert.equal(h.operations.length, 0);
  }
});

test('a valid market step preserves the configured log formula, history bound and ten-action reset', () => {
  const h = mine(), g = h.game; let draws = 0; h.context.Math.random = () => ++draws % 2 ? 0.75 : 0.25;
  g.oreTypes.forEach((o) => { o.trend = 0.4; o.priceHistory = Array(20).fill(o.price); });
  g.orePurchaseLimit = 0; g.updateMarketPrices();
  for (const o of g.oreTypes) {
    near(o.trend, 0.44); near(o.price, o.basePrice * Math.exp(o.volatility * (0.7 * 0.44 - 0.25)));
    assert.equal(o.priceHistory.length, 20); assert.equal(o.priceHistory.at(-1), o.price);
  }
  assert.equal(g.orePurchaseLimit, 10);
  h.context.Math.random = () => 0; g.oreTypes.forEach((o) => { o.price = o.basePrice * 0.2; o.trend = -1; });
  g.updateMarketPrices(); assert.ok(g.oreTypes.every((o) => o.price === o.basePrice * 0.2 * 1.05));
});

test('legacy extreme quotes stay finite and run off gently; malformed runtime state still recovers', () => {
  const h = mine(), g = h.game, diamond = g.oreTypes[3];
  diamond.price = 1.7e308; diamond.trend = 1; h.context.Math.random = () => 0.999;
  g.updateMarketPrices(); near(diamond.price, 1.7e308 * 0.95); assert.ok(Number.isFinite(diamond.priceHistory.at(-1)));
  assert.equal(g.saveGame({ silent: true }), true);
  g.oreTypes[0].price = Infinity; g.oreTypes[0].trend = NaN; g.oreTypes[0].priceHistory = [0, Infinity, 160];
  h.context.Math.random = () => 0.5; g.updateMarketPrices();
  near(g.oreTypes[0].price, 160); assert.equal(g.oreTypes[0].trend, 0);
  assert.equal(g.oreTypes[0].priceHistory[0], 160); near(g.oreTypes[0].priceHistory[1], 160);
});

test('market rendering omits non-finite percentage changes, filters chart samples and does not mutate economic state', () => {
  const h = mine(), g = h.game;
  g.oreTypes[0].priceHistory = [0, Number.MIN_VALUE, Number.MAX_VALUE];
  g.oreTypes[1].price = NaN;
  const before = JSON.stringify(g.oreTypes);
  g.drawSparkline = (_, data) => assert.ok(data.every((n) => Number.isFinite(n) && n > 0));
  h.methods.updateMarketDisplay.call(g);
  const cards = h.document.getElementById('marketList').children;
  assert.equal(cards[0].children[2].children.length, 2); // No Infinity% badge.
  assert.equal(cards[1].children[2].children[1].textContent, 'Unavailable');
  assert.equal(JSON.stringify(g.oreTypes), before);
});

test('valid save round-trip preserves stock/market/allowance/checkpoint, then prestige resets Mine state', () => {
  const h = mine(), g = h.game; g.items.mine.count = 2; g.reconcileMineWorkers();
  g.ores.Gold.count = 12; g.orePurchaseLimit = 3; g.timeState.mineProgress = 25000;
  g.oreTypes[0].price = 200; g.oreTypes[0].trend = 0.4; g.oreTypes[0].priceHistory = [160, 180, 200];
  snapshot(h); // Same-instant round trip; elapsed progression is covered by time-consistency tests.
  const loaded = h.newGame(); assert.equal(loaded.loadGame(), true);
  assert.equal(loaded.workers.length, 2); assert.equal(loaded.ores.Gold.count, 12);
  assert.equal(loaded.orePurchaseLimit, 3); assert.equal(loaded.lastMineProduction, h.clock.now - 25000);
  assert.equal(loaded.oreTypes[0].price, 200); assert.equal(loaded.oreTypes[0].trend, 0.4);
  assert.deepEqual(plain(loaded.oreTypes[0].priceHistory), [160, 180, 200]);
  loaded.totalDonutsEarned = loaded.nextPrestigeThreshold; loaded.performPrestige();
  assert.equal(loaded.items.mine.count, 0); assert.equal(loaded.workers.length, 0);
  assert.equal(h.document.getElementById('workerCount').textContent, '0');
  assert.ok(Object.values(loaded.ores).every((o) => o.count === 0)); assert.equal(loaded.orePurchaseLimit, 10);
  assert.equal(loaded.lastMineProduction, h.clock.now);
  assert.ok(loaded.oreTypes.every((o) => o.price === o.basePrice && o.trend === 0 && o.priceHistory.length === 0));
});

test('load-only repairs preserve checksum/structural validation and cannot poison backup rotation or live candidate checks', () => {
  const h = mine(), data = snapshot(h), backup = h.values.get('gameState');
  data.ores.Copper.count = -2; data.donutCount = 12345;
  const raw = h.game.encryptSave(data); h.values.set('gameState', raw); h.values.set('gameStateBackup', backup);
  h.operations.length = 0; const loaded = h.newGame(); assert.equal(loaded.loadGame(), true);
  assert.equal(loaded.donutCount, 12345); assert.equal(loaded.ores.Copper.count, 0); assert.equal(h.operations.length, 0);
  assert.equal(loaded.saveGame({ silent: true }), true); assert.equal(h.values.get('gameStateBackup'), backup);
  const primary = h.values.get('gameState'); loaded.ores.Copper.count = -1;
  assert.equal(loaded.saveGame({ silent: true }), false); assert.equal(h.values.get('gameState'), primary);
  const envelope = JSON.parse(Buffer.from(raw, 'base64').toString()); envelope.data.ores.Copper.count = -9;
  for (const bad of [Buffer.from(JSON.stringify(envelope)).toString('base64'),
    JSON.stringify({ ...data, donutCount: null }),
    JSON.stringify({ ...data, ores: JSON.parse('{"Copper":{"count":0,"__proto__":{}}}') })]) {
    h.values.set('gameState', bad); const g = h.newGame(); assert.equal(g.loadGame(), true);
    assert.equal(g.donutCount, 10000); // Valid backup, never a repaired bad checksum/core/key.
  }
});
