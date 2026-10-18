// Real canonical formulas and actions. Caches are derived, scoped and disposable.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');
const plain = (v) => JSON.parse(JSON.stringify(v));
const near = (a, b) => assert.ok(Math.abs(a - b) <= Math.max(1, Math.abs(b)) * 1e-12, `${a} != ${b}`);
function game(uncached = false) {
  const h = harness(), g = h.game;
  h.context.Math = Object.create(Math); h.context.Math.random = () => 0.5;
  g.loadGame(); g.items.baker.count = 100; g.donutCount = 1e9; g.timeState.randomState = 12345;
  if (uncached) {
    g.withProductionSnapshot = (calculate) => calculate();
    g.getBulkPricePreview = (key, amount = g.purchaseAmount) => g.calculateBulkPrice(g.items[key], amount);
  }
  return h;
}
function count(g, name) {
  const original = g[name]; let calls = 0;
  g[name] = function (...args) { calls++; return original.apply(this, args); };
  return () => calls;
}
function tick(h, seconds) { h.clock.now += seconds * 1000; h.game.settleTime(); }
function stock(g) { g.ingredients = Object.fromEntries(g.ingredientTypes.map((i) => [i.type, { count: 100 }])); }

test('unchanged same-time consumers reuse one canonical snapshot only inside a synchronous scope', () => {
  const { game: g } = game(), calls = count(g, 'calculateProductionBreakdown');
  g.withProductionSnapshot(() => {
    const first = g.getProductionBreakdown();
    assert.equal(g.getProductionBreakdown(), first); near(g.totalPerSecond, 100);
    near(g.getClickBreakdown().clickValue, 1);
    assert.equal(g.getQuestBalanceContext().production, first);
    assert.equal(calls(), 1);
  });
  assert.equal(g.productionSnapshotContext, null);
  g.getProductionBreakdown(); g.getProductionBreakdown(); assert.equal(calls(), 3);
});

test('building purchase invalidates after settling old elapsed and immediate clicking uses new CPS', () => {
  const h = game(), g = h.game;
  g.upgrades.nonItemUpgrades.find((u) => !u.specialEffect).purchased = true;
  g.withProductionSnapshot(() => {
    const old = g.getProductionBreakdown(), click = g.calculateClickValue();
    h.clock.now += 65; g.buyItem('baker');
    near(g.totalDonutsEarned, 6.5);
    assert.notEqual(g.getProductionBreakdown(), old); near(g.totalPerSecond, 101);
    near(g.calculateClickValue() - click, 0.01);
  });
});

test('upgrade purchase misses an earlier snapshot even at the same timestamp', () => {
  const { game: g } = game();
  g.withProductionSnapshot(() => {
    const before = g.getProductionBreakdown(); g.buyUpgrade('baker', 0);
    const after = g.getProductionBreakdown(); assert.notEqual(after, before);
    near(after.effectiveCPS, 100 * g.upgrades.baker[0].multiplier);
    assert.deepEqual(plain(after), plain(g.calculateProductionBreakdown()));
  });
});

test('recipe craft invalidates local production without changing unrelated buildings', () => {
  const { game: g } = game(); g.items.farm.count = 1; stock(g);
  g.withProductionSnapshot(() => {
    const before = g.getProductionBreakdown(); assert.equal(g.craftDonut('Classic Donut'), true);
    const after = g.getProductionBreakdown(); assert.notEqual(after, before);
    near(after.buildings.farm.effectiveCPS, before.buildings.farm.effectiveCPS * 1.1);
    near(after.buildings.baker.effectiveCPS, before.buildings.baker.effectiveCPS);
    assert.equal(g.recipes['Classic Donut'].craftCount, 1);
  });
});

test('mastery changes invalidate main CPS and premium-feed calculations within the same pass', () => {
  const { game: g } = game(); g.items.baker.count = 100000; g.items.farm.count = 60;
  g.farmState.mastery = { level: 19, xp: 0 };
  g.farmState.animals = [{ id: 'a', type: 'chicken', traits: [], productionTimer: 0, breedCooldown: 0 }];
  g.farmState.feedPlans.chicken = 'premium';
  g.withProductionSnapshot(() => {
    const before = g.getProductionBreakdown(), cost = g.getFeedCostPerSecond('chicken');
    near(g.getFeedCostPerSecond('chicken'), cost);
    g.gainMasteryXP(Math.floor(100 * 20 ** 1.8));
    const after = g.getProductionBreakdown(); assert.notEqual(after, before);
    near(after.effectiveCPS, before.effectiveCPS * 1.05);
    near(g.getFeedCostPerSecond('chicken'), cost * 1.05);
  });
});

test('multiplier activation and legacy multiplier cleanup invalidate scoped production', () => {
  const h = game(), g = h.game;
  g.activeMultipliers = [{ amount: 3, endTime: h.clock.now + 1000 }];
  g.withProductionSnapshot(() => {
    near(g.totalPerSecond, 300); g.startQuestMultiplier(2, 10000); near(g.totalPerSecond, 600);
    tick(h, 2); g.updateQuestMultipliers(); near(g.totalPerSecond, 200);
    assert.deepEqual(plain(g.getProductionBreakdown()), plain(g.calculateProductionBreakdown()));
  });
});

test('expiry and queued activation across settlement segments equal uncached income and receipts', () => {
  const states = [];
  for (const uncached of [false, true]) {
    const h = game(uncached), g = h.game; g.donutCount = 0;
    g.startQuestMultiplier(2, 5000); g.applyMultiplierReward(3, 3000); tick(h, 10);
    near(g.donutCount, 2100);
    states.push(plain({ donuts: g.donutCount, earned: g.totalDonutsEarned, items: g.items,
      time: g.timeState, multipliers: g.multiplierState, milestones: g.milestoneQuests }));
  }
  assert.deepEqual(states[0], states[1]);
});

test('different explicit timestamps never share incompatible snapshots and scopes clean up on errors', () => {
  const h = game(), g = h.game; g.startQuestMultiplier(2, 5000);
  const calls = count(g, 'calculateProductionBreakdown');
  assert.throws(() => g.withProductionSnapshot(() => {
    const early = g.getProductionBreakdown(h.clock.now + 4999);
    const late = g.getProductionBreakdown(h.clock.now + 5000);
    near(early.effectiveCPS, 200); near(late.effectiveCPS, 100); assert.notEqual(early, late);
    assert.equal(g.getProductionBreakdown(h.clock.now + 5000), late); assert.equal(calls(), 2);
    near(g.getProductionBreakdown(h.clock.now + 4999).effectiveCPS, 200); assert.equal(calls(), 3);
    throw Error('probe');
  }), /probe/);
  assert.equal(g.productionSnapshotContext, null);
  const renderTime = h.clock.now;
  g.withProductionSnapshot(() => {
    near(g.totalPerSecond, 200); h.clock.now += 5000;
    near(g.totalPerSecond, 200); // One read-only view evaluated at renderTime.
    near(g.getProductionBreakdown(h.clock.now).effectiveCPS, 100); // Explicit times remain distinct.
    g.startQuestMultiplier(3, 1000); // Mutation releases the read-only view's time.
    near(g.totalPerSecond, 300);
  }, renderTime);
});

test('cached/uncached Farm, Mine permanent reference, recipe, upgrade, prestige and saves are identical', () => {
  const states = [];
  for (const uncached of [false, true]) {
    const h = game(uncached), g = h.game;
    g.items.mine.count = 2; g.items.farm.count = 60; stock(g);
    g.farmState.animals = [{ id: 'a', name: 'a', type: 'chicken', traits: [], variant: null,
      passport: null, productionTimer: 0, feedPlan: 'standard', breedCooldown: 0 }];
    g.farmState.feedPlans.chicken = 'premium';
    g.withProductionSnapshot(() => {
      g.refreshOreMarketReference(); const band = g.oreMarket.productionBand;
      g.startQuestMultiplier(2, 5005); g.refreshOreMarketReference(); assert.equal(g.oreMarket.productionBand, band);
      tick(h, 1); g.buyUpgrade('baker', 0); g.craftDonut('Classic Donut'); tick(h, 300);
    });
    assert.equal(g.saveGame({ silent: true }), true);
    const before = g.decodeSave(h.values.get('gameState')); states.push(plain(before));
    const loaded = h.newGame(); assert.equal(loaded.loadGame(), true);
    near(loaded.totalPerSecond, g.totalPerSecond); near(loaded.calculateClickValue(), g.calculateClickValue());
    assert.equal(loaded.timeState.randomState, g.timeState.randomState);
    g.nextPrestigeThreshold = 1;
    g.withProductionSnapshot(() => { g.getProductionBreakdown(); g.performPrestige(); near(g.totalPerSecond, 0); });
    g.donutCount = 1e6; g.buyItem('baker'); near(g.totalPerSecond, 2);
    assert.equal(g.bulkPriceCache.size <= Object.keys(g.items).length, true);
  }
  assert.deepEqual(states[0], states[1]);
  assert.equal('productionStateVersion' in states[0], false); assert.equal('bulkPriceCache' in states[0], false);
});

test('repeated HUD preview calculations reuse prices while balance/affordability stay live', () => {
  const h = game(), g = h.game; g.cacheElements();
  const calls = count(g, 'calculateBulkPrice');
  g.donutCount = 0; h.methods._actualUpdateDisplay.call(g); const initial = calls();
  assert.equal(initial, Object.keys(g.items).length);
  for (let i = 0; i < 5; i++) h.methods._actualUpdateDisplay.call(g);
  assert.equal(calls(), initial); assert.equal(g.lastUpdateValues.affordability.cursor, false);
  g.donutCount = 1e9; h.methods._actualUpdateDisplay.call(g);
  assert.equal(calls(), initial); assert.equal(g.lastUpdateValues.affordability.cursor, true);
});

test('price previews miss on amount, count, cost, growth or template identity and stay bounded', () => {
  const { game: g } = game(), calls = count(g, 'calculateBulkPrice');
  const preview = () => g.getBulkPricePreview('cursor');
  const check = () => near(preview(), g.calculateBulkPrice(g.items.cursor, g.purchaseAmount));
  preview(); preview(); assert.equal(calls(), 1);
  for (const change of [() => g.setPurchaseAmount(100), () => g.items.cursor.count++,
    () => g.items.cursor.baseCost *= 1.15, () => g.items.cursor.costMultiplier = 1.2,
    () => g.items.cursor = { ...g.items.cursor }]) {
    const before = calls(); change(); preview(); assert.equal(calls(), before + 1); check();
  }
  for (let i = 1; i <= 30; i++) g.getBulkPricePreview('cursor', i);
  assert.equal(g.bulkPriceCache.size, 1);
});

test('purchase cost remains authoritative even if a disposable preview is corrupted', () => {
  const { game: g } = game(); g.donutCount = 15;
  assert.equal(g.getBulkPricePreview('cursor'), 15);
  g.bulkPriceCache.get('cursor').price = 1; g.buyItem('cursor');
  assert.equal(g.donutCount, 0); assert.equal(g.items.cursor.count, 1);
  assert.equal(g.getBulkPricePreview('cursor'), g.calculateBulkPrice(g.items.cursor, 1));
});

test('instances never share caches; hydration/reconstruction and explicit invalidation discard derived state', () => {
  const h = game(), a = h.game, b = h.newGame();
  a.getBulkPricePreview('cursor'); assert.notEqual(a.bulkPriceCache, b.bulkPriceCache); assert.equal(b.bulkPriceCache.size, 0);
  a.withProductionSnapshot(() => {
    const snapshot = a.getProductionBreakdown();
    b.withProductionSnapshot(() => assert.notEqual(b.getProductionBreakdown(), snapshot));
    a.invalidateDerivedCaches(); assert.equal(a.bulkPriceCache.size, 0);
    assert.notEqual(a.getProductionBreakdown(), snapshot);
    const beforeRebuild = a.getProductionBreakdown();
    a.rebuildItemProductionsFromSaveState(); assert.notEqual(a.getProductionBreakdown(), beforeRebuild);
  });
  assert.equal(a.productionSnapshotContext, null); assert.equal(b.productionSnapshotContext, null);
  a.getBulkPricePreview('cursor'); assert.equal(a.saveGame({ silent: true }), true);
  a.withProductionSnapshot(() => {
    const old = a.getProductionBreakdown(); assert.equal(a.loadGame(), true);
    assert.notEqual(a.getProductionBreakdown(), old);
  });
  assert.equal(a.bulkPriceCache.size, 0);
});
