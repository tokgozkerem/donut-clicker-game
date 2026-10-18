const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');
const { analyze, milestoneGoals } = require('../scripts/analyze-upgrade-economy');

const prices = {
  baker: [1000,5250,52500,5250000,525000000,5250000000,525000000000],
  farm: [10000,50000,500000,50000000,5000000000],
  mine: [160000,800000,8000000,800000000,80000000000],
  factory: [1800000,9000000,90000000,9000000000,900000000000],
  logisticCenter: [19000000,95000000,950000000,95000000000,9500000000000],
  powerPlant: [210000000,1050000000,10500000000,1050000000000,105000000000000],
  nature: [2300000000,11500000000,115000000000,11500000000000,1150000000000000],
  neuralNetworkBakery: [25000000000,125000000000,1250000000000,125000000000000,12500000000000000],
  portal: [280000000000,1400000000000,14000000000000,1400000000000000,140000000000000000],
  capitalCrest: [3000000000000,15000000000000,150000000000000,15000000000000000,1500000000000000000],
};
const late = ['neuralNetworkBakery', 'portal', 'capitalCrest'];
const plain = x => JSON.parse(JSON.stringify(x));
function snapshot(h) {
  h.game.loadGame();
  assert.equal(h.game.saveGame({ silent: true }), true);
  return h.game.decodeSave(h.values.get('gameState'));
}

test('all ordinary fixed prices and ownership gates match the historical long-form model', () => {
  const { game: g } = harness();
  for (const [key, expected] of Object.entries(prices)) {
    const ns = key === 'baker' ? [1,15,30,50,100,150,200] : [1,15,30,50,100];
    assert.deepEqual(plain(g.upgrades[key].map(u => u.cost)), expected, key);
    assert.deepEqual(plain(g.upgrades[key].map(u => u.requirement)), ns, key);
    const anchor = expected[1]/5;
    const factors = key === 'baker' ? [1,5,50,5000,500000,5000000,500000000] : [1,5,50,5000,500000];
    g.upgrades[key].forEach((u, i) => {
      // Historical Baker entry discount stays exact; all other tiers use fixed factors.
      assert.equal(u.cost, key === 'baker' && i === 0 ? 1000 : anchor*factors[i]);
      assert.ok(Number.isFinite(u.cost) && Number.isInteger(u.cost));
      assert.equal(u.multiplier, 2);
      assert.equal(u.purchased, false);
    });
  }
});

test('exactly 15 thematic late upgrades append after every legacy category with requested image names', () => {
  const { game: g } = harness();
  assert.deepEqual(Object.keys(g.upgrades).slice(-3), late);
  const prefixes = ['neural-network-bakery', 'portal', 'capital-crest'];
  const names = new Set();
  late.forEach((key, k) => {
    assert.equal(g.upgrades[key].length, 5);
    g.upgrades[key].forEach((u, i) => {
      names.add(u.name); assert.ok(u.description.length > 10);
      assert.equal(u.img, `${prefixes[k]}${i+1}.webp`);
      assert.equal(u.specialEffect, undefined);
    });
  });
  assert.equal(names.size, 15);
});

test('direct purchases enforce ownership before charging and apply local ×2 exactly once', () => {
  for (const [key, i] of [['baker',2],['baker',5],['baker',6],['farm',2],...late.map(k => [k,2])]) {
    const { game: g } = harness(), u = g.upgrades[key][i];
    g.donutCount = 2*u.cost;
    g.items[key].count = u.requirement-1;
    g.buyUpgrade(key, i);
    assert.equal(u.purchased, false); assert.equal(g.donutCount, 2*u.cost);
    g.items[key].count++;
    const before = g.getProductionBreakdown().buildings[key].effectiveCPS;
    g.buyUpgrade(key, i); // Previous upgrades are not an added prerequisite.
    assert.equal(u.purchased, true); assert.equal(g.donutCount, u.cost);
    assert.equal(g.getProductionBreakdown().buildings[key].effectiveCPS, before*2);
    g.buyUpgrade(key, i);
    assert.equal(g.donutCount, u.cost);
    assert.equal(g.getProductionBreakdown().buildings[key].effectiveCPS, before*2);
  }
});

test('purchase authority rejects insufficient balance, invalid identities and existing special unlock bypasses', () => {
  const { game: g } = harness();
  g.items.capitalCrest.count = 100;
  const u = g.upgrades.capitalCrest[4]; g.donutCount = u.cost-1024; // A representable shortfall even at quintillion scale.
  const insufficient = g.donutCount;
  assert.ok(insufficient < u.cost);
  g.buyUpgrade('capitalCrest', 4);
  assert.equal(u.purchased, false); assert.equal(g.donutCount, insufficient);
  for (const [key, index] of [['missing',0],['__proto__',0],['baker',-1],['baker',99],['baker',1.5],['baker','0']])
    assert.doesNotThrow(() => g.buyUpgrade(key, index));
  g.donutCount = 2*u.cost;
  g.buyUpgrade('capitalCrest', 4);
  assert.equal(u.purchased, true);
  assert.equal(g.donutCount, u.cost); // Real full-price deduction at the final tier.
  g.buyUpgrade('capitalCrest', 4);
  assert.equal(g.donutCount, u.cost);
  const balance = g.donutCount;
  g.buyUpgrade('nonItemUpgrades', 0); // No clicks.
  g.buyUpgrade('nonItemUpgrades', 6); // No active combo.
  g.buyUpgrade('donutUpgrades', 0); // No earned donuts.
  assert.equal(g.donutCount, balance);
  assert.equal(g.upgrades.nonItemUpgrades[0].purchased, false);
  assert.equal(g.upgrades.nonItemUpgrades[6].purchased, false);
  assert.equal(g.upgrades.donutUpgrades[0].purchased, false);
});

test('upgrade UI shares the ownership gate, live affordability, formatted price and ×2 description', () => {
  const h = harness(), g = h.game, key = 'neuralNetworkBakery', i = 2, u = g.upgrades[key][i];
  for (const list of Object.values(g.upgrades)) for (const upgrade of list) upgrade.purchased = true;
  u.purchased = false;
  const list = h.document.getElementById('upgrade-list');
  list.prepend = child => { list.children.unshift(child); child.parentElement = list; };
  g.items[key].count = u.requirement-1;
  h.methods.showUpgrades.call(g);
  assert.equal(list.children.length, 0);
  g.items[key].count = u.requirement; g.donutCount = u.cost-1;
  h.methods.showUpgrades.call(g);
  assert.equal(list.children.length, 1);
  assert.equal(list.children[0].dataset.key, key);
  assert.ok(list.children[0].classList.contains('insufficient-funds'));
  g.donutCount++;
  h.methods.showUpgrades.call(g);
  assert.equal(list.children[0].classList.contains('insufficient-funds'), false);
  g.showInfoPanel(u, key);
  const info = h.document.getElementById('info-panel').innerHTML;
  assert.ok(info.includes(g.formatNumber(u.cost, 'cost')));
  assert.ok(info.includes('production doubles!'));
  assert.ok(info.includes(u.img));
});

test('pre-expansion saves preserve every old flag/index without recharging and default all new flags unowned', () => {
  for (const encoded of [false, true]) {
    const h = harness(), state = snapshot(h);
    for (const key of late) delete state.upgrades[key];
    const expected = {};
    for (const [key, upgrades] of Object.entries(state.upgrades)) {
      expected[key] = upgrades.map((_, i) => i%2 === 0);
      state.upgrades[key] = expected[key].map((owned, i) => i%2 ? owned : { purchased: owned, cost: 1 });
    }
    state.donutCount = 123456;
    state.nextPrestigeThreshold = 550000000000;
    h.values.set('gameState', encoded ? h.game.encryptSave(state) : JSON.stringify(state));
    h.operations.length = 0;
    const g = h.newGame();
    assert.equal(g.loadGame(), true);
    assert.equal(g.saveWritesBlocked, false);
    assert.equal(g.donutCount, 123456);
    for (const [key, flags] of Object.entries(expected))
      assert.deepEqual(plain(g.upgrades[key].map(u => u.purchased)), plain(flags));
    for (const key of late) assert.ok(g.upgrades[key].every(u => !u.purchased));
    assert.equal(g.items.baker.count, 0); // Old entitlements survive below new gates.
    assert.equal(g.upgrades.baker[0].cost, prices.baker[0]); // Saved metadata is not price authority.
    assert.equal(h.operations.length, 0);
  }
});

test('V2 purchased flags below restored gates round-trip with saveVersion 1 and canonical ×32 production', () => {
  const h = harness(); h.game.loadGame();
  h.game.items.baker.count = 80;
  h.game.upgrades.baker.forEach(u => { u.purchased = true; });
  for (const key of late) {
    h.game.items[key].count = 40;
    for (const u of h.game.upgrades[key]) u.purchased = true;
  }
  const before = h.game.calculatePerSecond();
  assert.equal(h.game.saveGame({ silent: true }), true);
  const state = h.game.decodeSave(h.values.get('gameState'));
  assert.equal(state.saveVersion, 1);
  const g = h.newGame(); assert.equal(g.loadGame(), true);
  assert.equal(g.calculatePerSecond(), before);
  assert.equal(g.items.baker.count, 80);
  assert.equal(g.upgrades.baker[6].purchased, true);
  assert.equal(g.getProductionBreakdown().buildings.baker.upgradeMultiplier, 128);
  for (const key of late) {
    assert.ok(g.upgrades[key].every(u => u.purchased));
    assert.equal(g.getProductionBreakdown().buildings[key].upgradeMultiplier, 32);
  }
});

test('pre-V2 and V2 saves restore the 550B ×2^p prestige curve without lost eligibility or load writes', () => {
  const h = harness(); assert.equal(h.game.nextPrestigeThreshold, 550e9);
  for (const p of [0, 2, 8]) for (const savedBase of [550e9, 10e12]) {
    assert.equal(h.game.calculatePrestigeThreshold(p), 550e9*2**p);
    const state = snapshot(h);
    state.prestigeCount = p; state.nextPrestigeThreshold = savedBase*2**p;
    state.totalDonutsEarned = 550e9*2**p;
    const raw = h.game.encryptSave(state);
    h.values.set('gameState', raw); h.operations.length = 0;
    const g = h.newGame(); assert.equal(g.loadGame(), true);
    assert.equal(g.canPrestige(), true);
    assert.equal(g.totalDonutsEarned, state.totalDonutsEarned);
    assert.equal(g.nextPrestigeThreshold, 550e9*2**p);
    assert.equal(h.values.get('gameState'), raw);
    assert.equal(h.operations.length, 0);
    assert.equal(g.saveGame({ silent: true }), true);
    const again = h.newGame(); assert.equal(again.loadGame(), true);
    assert.equal(again.nextPrestigeThreshold, g.nextPrestigeThreshold); // Idempotent after checkpoint.
    again.performPrestige();
    assert.equal(again.prestigeCount, p+1);
    assert.equal(again.nextPrestigeThreshold, 550e9*2**(p+1));
  }
});

test('load still repairs arbitrary undersized prestige thresholds and preserves higher valid thresholds', () => {
  const h = harness(), state = snapshot(h);
  for (const threshold of [1, 30e12]) {
    state.nextPrestigeThreshold = threshold;
    h.values.set('gameState', h.game.encryptSave(state));
    const g = h.newGame(); assert.equal(g.loadGame(), true);
    assert.equal(g.nextPrestigeThreshold, Math.max(550e9, threshold));
  }
});

test('prestige resets old and new run upgrades, retains mastery and applies existing 2x prestige once', () => {
  const h = harness(), g = h.game; g.loadGame();
  for (const [key, list] of Object.entries(g.upgrades)) {
    if (g.items[key]) g.items[key].count = 40;
    for (const u of list) u.purchased = true;
  }
  g.farmState.mastery.level = 20;
  g.totalDonutsEarned = g.nextPrestigeThreshold; g.performPrestige();
  for (const list of Object.values(g.upgrades)) assert.ok(list.every(u => !u.purchased));
  for (const b of Object.values(g.items)) { assert.equal(b.count, 0); assert.equal(b.baseCost, b.originalBaseCost); }
  assert.equal(g.farmState.mastery.level, 20);
  g.items.capitalCrest.count = 1;
  assert.equal(g.calculatePerSecond(), g.baseItemProductions.capitalCrest*2*1.05);
  assert.equal(g.decodeSave(h.values.get('gameState')).nextPrestigeThreshold, 1100e9);
});

test('upgrade mutation settles old elapsed production before applying the new local factor', () => {
  const h = harness(), g = h.game;
  g.items.farm.count = 10; g.donutCount = 1e9;
  h.clock.now += 1000; g.buyUpgrade('farm', 0);
  assert.equal(g.totalDonutsEarned, 70);
  h.clock.now += 1000; g.settleTime();
  assert.equal(g.totalDonutsEarned, 210);
  assert.equal(g.getProductionBreakdown().buildings.farm.upgradeMultiplier, 2);
});

test('actual fixed content preserves long-form milestone spacing and finite prestige-assisted goals', () => {
  const rows = analyze(), goals = milestoneGoals();
  assert.equal(rows.length, 52); assert.equal(goals.length, 52);
  for (const row of rows) {
    assert.equal(row.matchesModel, true, row.building);
    assert.ok(row.marginalCPS > 0 && Number.isFinite(row.upgradePaybackSeconds));
    assert.ok(row.accumulatedMilestoneCost > row.price);
    if (row.tier === 4 || row.tier === 5) {
      const previous = rows.find(r => r.building === row.building && r.tier === row.tier-1);
      assert.equal(row.price / previous.price, 100);
      assert.ok(row.accumulatedMilestoneCost > previous.accumulatedMilestoneCost);
    }
  }
  for (const row of goals) {
    assert.ok(Number.isFinite(row.goalEconomicSecondsP0) && row.goalEconomicSecondsP0 > 0);
    assert.ok(Math.abs(row.goalEconomicSecondsP12*4096 / row.goalEconomicSecondsP0 - 1) < 1e-12);
  }
  const capital = goals.find(r => r.building === 'capitalCrest' && r.tier === 5);
  assert.ok(capital.goalEconomicSecondsP12/3600 > 24 && capital.goalEconomicSecondsP12/3600 < 36);
});
