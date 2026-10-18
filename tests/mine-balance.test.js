// Small deterministic paths and real economic fixtures, not random simulation.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');
const { definitions, fixture } = require('./helpers/quest-balance-fixtures');

function near(a, b) { assert.ok(Math.abs(a - b) <= Math.max(1, Math.abs(b)) * 1e-11, `${a} != ${b}`); }
function plain(value) { return JSON.parse(JSON.stringify(value)); }
function mine() {
  const h = harness(), g = h.game;
  g.loadGame(); g.items.mine.count = 1; g.reconcileMineWorkers();
  g.refreshOreMarketReference(); g.donutCount = 10000;
  h.context.Math = Object.create(Math); h.context.Math.random = () => 0.5;
  return h;
}
function save(h) {
  assert.equal(h.game.saveGame({ silent: true }), true);
  return h.game.decodeSave(h.values.get('gameState'));
}

test('zero-noise prices revert in log space while momentum retains its existing memory', () => {
  const { game: g } = mine();
  for (const ore of g.oreTypes) {
    ore.price = g.getOreReferencePrice(ore) * 1.1; ore.trend = 0.4;
  }
  g.updateMarketPrices();
  for (const ore of g.oreTypes) {
    near(ore.trend, 0.34);
    near(ore.price / g.getOreReferencePrice(ore), Math.exp(0.85 * Math.log(1.1) + ore.volatility * 0.7 * 0.34));
  }
  for (const ore of g.oreTypes) { ore.price = g.getOreReferencePrice(ore) * 0.9; ore.trend = 0; }
  g.updateMarketPrices();
  for (const ore of g.oreTypes) near(ore.price / g.getOreReferencePrice(ore), 0.9 ** 0.85);
});

test('fixed extreme paths remain bounded, preserve volatility identity and never reach a guaranteed-return floor', () => {
  for (const draw of [0, 1]) {
    const h = mine(), g = h.game; h.context.Math.random = () => draw;
    // Two 60-cycle edge paths, no statistical sampling.
    for (let i = 0; i < 60; i++) g.updateMarketPrices();
    let previousDisplacement = 0;
    for (const ore of g.oreTypes) {
      const ratio = ore.price / g.getOreReferencePrice(ore);
      assert.ok(ratio > 0.5 && ratio < 2.5);
      assert.ok(Math.abs(Math.log(ratio)) > previousDisplacement);
      previousDisplacement = Math.abs(Math.log(ratio));
      assert.equal(g.isOreTransitionQuote(ore), false);
      assert.ok(previousDisplacement < 1.2 * ore.volatility / 0.15);
      assert.equal(ore.priceHistory.length, 20);
    }
    if (draw === 0) {
      const before = g.oreTypes.map((o) => o.price);
      g.updateMarketPrices();
      assert.ok(g.oreTypes.every((o, i) => o.price < before[i])); // Low can still go lower.
    }
  }
});

test('reference economics stay supplementary in first-Mine, early-mid, mid, late and prestige fixtures', () => {
  const states = [{ name: 'First Mine', counts: { mine: 1 }, balance: 0 },
    ...definitions.filter((d) => d.counts.mine)];
  // The appended late-building ladders raise this fixture's permanent CPS band
  // to 2^27 under V2.1 gates; the unchanged late-stage share is .03 per minute.
  const expected = [384, 768, 32768, 2**27 * .03 * 60, 393216];
  states.forEach((definition, i) => {
    const { game: g } = fixture(definition); g.refreshOreMarketReference(); g.reconcileMineWorkers();
    assert.equal(g.workers.length, g.items.mine.count);
    const income = 5 * g.workers.length * g.oreTypes.reduce((s, o) => s + g.getOreReferencePrice(o) * o.rarity, 0) / 0.99;
    near(income, expected[i]);
    const share = income / (g.calculatePerSecond() * 60);
    const band = definition.name === 'Late' ? [0.01, 0.05] : definition.name === 'Mid' ? [0.03, 0.10] : [0.10, 0.25];
    assert.ok(share >= band[0] && share <= band[1], `${definition.name}: ${share}`);
  });
});

test('reference uses lasting canonical production, ignoring quest and legacy temporary multipliers', () => {
  const { game: g, clock } = mine();
  g.items.baker.count = 14; g.refreshOreMarketReference(); // Exactly 64 CPS, a band boundary.
  const reference = plain(g.oreMarket);
  g.activeMultipliers = [{ amount: 100.3, endTime: clock.now + 60000, duration: 60000 }];
  g.multiplierState.active = { amount: 7.1, endTime: clock.now + 60000 };
  assert.ok(g.calculatePerSecond() > 50);
  g.refreshOreMarketReference(); assert.deepEqual(plain(g.oreMarket), reference);
  g.prestigeCount = 3; g.refreshOreMarketReference();
  near(g.oreMarket.referenceScale, reference.referenceScale * 8);
});

test('held inventory freezes quotes/reference across upgrades, new Mines and production, blocking upgrade resale arbitrage', () => {
  const h = mine(), g = h.game, initial = plain(g.oreMarket);
  const quote = g.oreTypes[0].price;
  g.isBuying = true; g.handleMarketTransaction('Copper');
  g.upgrades.mine[0].purchased = true;
  g.donutCount = 1e7; g.purchaseAmount = 3; g.buyItem('mine');
  g.produceMineResources();
  assert.deepEqual(plain(g.oreMarket), initial); assert.equal(g.oreTypes[0].price, quote);
  g.isBuying = false; g.isSelling = true; const balance = g.donutCount;
  g.handleMarketTransaction('Copper'); near(g.donutCount - balance, quote);
});

test('empty-stock production rebases in discrete permanent bands and resets chart history', () => {
  const h = mine(), g = h.game, previous = g.oreMarket.referenceScale;
  g.oreTypes.forEach((o) => { o.price *= 1.02; o.priceHistory = [o.price / 2, o.price]; });
  g.upgrades.mine[0].purchased = true;
  g.produceMineResources();
  near(g.oreMarket.referenceScale, previous * 2);
  g.oreTypes.forEach((o) => {
    near(o.price, g.getOreReferencePrice(o) * 1.02);
    assert.deepEqual(plain(o.priceHistory), [o.price]);
  });
  assert.equal(Object.values(g.ores).reduce((s, o) => s + o.count, 0), 5);
});

test('same-quote buying then selling cannot profit; speculative buys stay limited to ten one-unit actions', () => {
  const h = mine(), g = h.game;
  const initial = g.donutCount;
  g.isBuying = true; g.handleMarketTransaction('Diamond');
  g.isBuying = false; g.isSelling = true; g.handleMarketTransaction('Diamond');
  near(g.donutCount, initial); assert.equal(g.orePurchaseLimit, 8);
  g.updateMarketPrices(); g.isBuying = true; g.isSelling = false;
  assert.equal(g.transactOres({ Copper: 11 }, true), false);
  assert.equal(g.transactOres({ Copper: 1, Iron: 1 }, true), false);
  for (let i = 0; i < 11; i++) g.handleMarketTransaction('Copper');
  assert.equal(g.ores.Copper.count, 10); assert.equal(g.orePurchaseLimit, 0);
});

test('large mixed mined inventory sells in one atomic action, preserving non-earned accounting and failure safety', () => {
  const { game: g } = mine(); g.orePurchaseLimit = 1;
  g.oreTypes.forEach((o) => { g.ores[o.type].count = 10000; });
  const before = plain(g.ores), balance = g.donutCount, credit = g.creditDonuts;
  const value = g.oreTypes.reduce((sum, o) => sum + o.price * 10000, 0);
  g.creditDonuts = () => false;
  assert.equal(g.sellAllOres(), false); assert.deepEqual(plain(g.ores), before); assert.equal(g.orePurchaseLimit, 1);
  g.creditDonuts = credit; const earned = g.totalDonutsEarned, tracking = JSON.stringify(g.questTracking);
  assert.equal(g.sellAllOres(), true); near(g.donutCount, balance + value);
  assert.equal(g.orePurchaseLimit, 0); assert.ok(Object.values(g.ores).every((o) => o.count === 0));
  assert.equal(g.totalDonutsEarned, earned); assert.equal(JSON.stringify(g.questTracking), tracking);
  g.ores.Gold.count = 100; const after = g.donutCount;
  assert.equal(g.sellAllOres(), false); assert.equal(g.donutCount, after); assert.equal(g.ores.Gold.count, 100);
});

test('saved reference, quotes, inventory and allowance round-trip at the same economic checkpoint', () => {
  const h = mine(), g = h.game; g.ores.Gold.count = 20; g.orePurchaseLimit = 4;
  g.oreTypes[0].trend = 0.3; g.oreTypes[0].priceHistory = [g.oreTypes[0].price];
  const state = save(h); h.operations.length = 0;
  const loaded = h.newGame(); assert.equal(loaded.loadGame(), true);
  assert.deepEqual(plain(loaded.oreMarket), plain(state.oreMarket));
  assert.deepEqual(plain(loaded.oreTypes.map(({ type, price, trend, priceHistory }) => ({ type, price, trend, priceHistory }))), plain(state.oreTypePrices));
  assert.equal(loaded.ores.Gold.count, 20); assert.equal(loaded.orePurchaseLimit, 4);
  assert.equal(h.operations.length, 0);
});

test('legacy outliers retain saved wealth, cannot be bought, and converge by at most five percent per processed cycle', () => {
  const h = mine(), state = save(h); delete state.oreMarket;
  state.items.mine.count = 2; state.ores.Copper.count = 3;
  state.oreTypePrices[0].price = 1e9; state.oreTypePrices[0].priceHistory = [1e8, 1e9];
  state.oreTypePrices[1].price = 0.001;
  const raw = h.game.encryptSave(state); h.values.set('gameState', raw); h.operations.length = 0;
  const g = h.newGame(); assert.equal(g.loadGame(), true);
  assert.equal(g.oreMarket.workforce, 2); assert.equal(g.oreTypes[0].price, 1e9);
  assert.deepEqual(plain(g.oreTypes[0].priceHistory), [1e8, 1e9]); assert.equal(h.operations.length, 0);
  assert.equal(g.transactOres({ Iron: 1 }, true), false); assert.equal(g.orePurchaseLimit, 10);
  const balance = g.donutCount; assert.ok(g.transactOres({ Copper: 1 })); near(g.donutCount, balance + 1e9);
  g.updateMarketPrices(); near(g.oreTypes[0].price, 0.95e9); near(g.oreTypes[1].price, 0.00105);
  assert.equal(g.transactOres({ Copper: 1 }, true), false);
  assert.equal(g.saveGame({ silent: true }), true);
  const again = h.newGame(); assert.equal(again.loadGame(), true); near(again.oreTypes[0].price, 0.95e9);
});

test('missing/malformed optional references recover after full economic hydration without changing legacy stock or quotes', () => {
  const h = mine(), state = save(h); state.prestigeCount = 3; state.ores.Diamond.count = 4;
  for (const reference of [undefined, null, { referenceScale: -1 }, { referenceScale: 1e308 }]) {
    const data = { ...state, oreMarket: reference };
    if (reference === undefined) delete data.oreMarket;
    h.values.set('gameState', h.game.encryptSave(data));
    const g = h.newGame(); assert.equal(g.loadGame(), true);
    near(g.oreMarket.referenceScale, h.game.oreMarket.referenceScale * 8);
    assert.equal(g.ores.Diamond.count, 4); assert.equal(g.oreTypes[0].price, state.oreTypePrices[0].price);
  }
  const invalid = { ...state, oreMarket: { referenceScale: -1 } };
  assert.equal(h.game.decodeSave(h.game.encryptSave(invalid)), null); // Strict backup/candidate validation stays strict.
});

test('prestige clears reference and all run market state, then first bulk Mine purchase snapshots the new run', () => {
  const h = mine(), g = h.game; g.ores.Copper.count = 500; save(h);
  g.totalDonutsEarned = g.nextPrestigeThreshold; g.performPrestige();
  assert.equal(g.oreMarket, null); assert.equal(g.items.mine.count, 0); assert.equal(g.workers.length, 0);
  assert.ok(g.oreTypes.every((o) => o.price === o.basePrice && o.trend === 0 && !o.priceHistory.length));
  assert.ok(Object.values(g.ores).every((o) => o.count === 0)); assert.equal(g.orePurchaseLimit, 10);
  g.donutCount = 1e8; g.purchaseAmount = 5; g.buyItem('mine');
  assert.equal(g.oreMarket.workforce, 5); assert.equal(g.workers.length, 5);
  assert.equal(g.oreMarket.productionBand, 256); // 5 * 50 CPS * prestige 2, rounded down to power of two.
});
