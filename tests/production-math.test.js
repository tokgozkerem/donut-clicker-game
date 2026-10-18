// Run with: node --test tests/*.test.js (no packages/browser required).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');

function near(actual, expected, label = '') {
  assert.ok(Number.isFinite(actual), `${label}: non-finite ${actual}`);
  assert.ok(Math.abs(actual - expected) <= Math.max(1, Math.abs(expected)) * 1e-12,
    `${label}: expected ${expected}, got ${actual}`);
}
function own(game, key, ...indices) {
  for (const i of indices) game.upgrades[key][i].purchased = true;
}
function isolateLoop(h) {
  const g = h.game;
  g.lastHeavyUpdateTime = h.clock.now;
  g.lastFarmUiUpdateTime = h.clock.now;
  g.lastTimerUiUpdateTime = h.clock.now;
  g.tickFarm = () => {}; // Separate economy, not part of building CPS.
}
function combined(h) {
  const g = h.game;
  g.items.cursor.count = 10;
  g.items.baker.count = 20;
  g.items.farm.count = 3;
  g.items.mine.count = 2;
  own(g, 'cursor', 0, 1, 4);
  own(g, 'baker', 0, 1);
  own(g, 'farm', 0);
  own(g, 'donutUpgrades', 0, 1);
  own(g, 'nonItemUpgrades', 0, 1, 6);
  g.recipes['Classic Donut'].craftCount = 2;
  g.recipes['White Magic Donut'].craftCount = 3;
  g.prestigeCount = 2;
  g.farmState.mastery.level = 20;
  g.startQuestMultiplier(2, 60000);
  // Local: cursor 4 + baker 80 + farm 50.4 + mine 130 = 264.4.
  // Globals: 1.03^2 * 1.05; prestige 4; quest 2; flat Cursor 25.
  return { g, boosted: 264.4 * 1.03 ** 2 * 1.05 * 4 * 2, flat: 25 };
}

test('baseline: zero, one, repeated and mixed buildings use configured rates', () => {
  const { game: g } = harness();
  near(g.calculatePerSecond(), 0);
  const bases = { cursor: 0.1, baker: 1, farm: 7, mine: 50, factory: 255,
    logisticCenter: 1225, powerPlant: 8000, nature: 46000,
    neuralNetworkBakery: 270500, portal: 1800000, capitalCrest: 10980000 };
  let sum = 0;
  for (const [key, base] of Object.entries(bases)) {
    g.items[key].count = 1;
    sum += base;
    near(g.calculatePerSecond(), sum, key);
    g.items[key].count = 4;
    sum += 3 * base;
    near(g.calculatePerSecond(), sum, `${key} repeated`);
  }
});

// Exercise EVERY real dedicated upgrade definition, not just a sample building.
for (const key of Object.keys(harness().game.items)) {
  test(`building upgrades: ${key}, ownership/stacking/local isolation`, () => {
    const { game: g } = harness();
    for (const item of Object.values(g.items)) item.count = 2;
    let factor = 1;
    const base = g.baseItemProductions[key];
    near(g.getProductionBreakdown().buildings[key].boostedRate, base);
    for (const upgrade of g.upgrades[key] || []) {
      if (upgrade.specialEffect) continue;
      const otherBefore = g.getProductionBreakdown().buildings[key === 'farm' ? 'baker' : 'farm'].boostedRate;
      upgrade.purchased = true;
      factor *= upgrade.multiplier;
      const b = g.getProductionBreakdown();
      near(b.buildings[key].upgradeMultiplier, factor);
      near(b.buildings[key].boostedRate, base * factor);
      near(b.buildings[key === 'farm' ? 'baker' : 'farm'].boostedRate, otherBefore);
    }
  });
}

test('global upgrades: every purchased factor stacks once across every building', () => {
  const { game: g } = harness();
  for (const item of Object.values(g.items)) item.count = 1;
  const base = g.calculatePerSecond();
  let factor = 1;
  for (const upgrade of g.upgrades.donutUpgrades) {
    upgrade.purchased = true;
    factor *= 1.03;
    near(g.calculatePerSecond(), base * factor);
    for (const [key, b] of Object.entries(g.getProductionBreakdown().buildings)) {
      near(b.perUnit, g.baseItemProductions[key] * factor, key);
    }
  }
});

test('recipes: every configured recipe stacks additively and affects only its target', () => {
  const { game: g } = harness();
  for (const item of Object.values(g.items)) item.count = 1;
  for (const recipe of Object.values(g.recipes)) {
    const [target, effect] = Object.entries(recipe.effects)[0];
    const before = g.getProductionBreakdown();
    recipe.craftCount = 3;
    const after = g.getProductionBreakdown();
    near(after.buildings[target].perUnit, before.buildings[target].perUnit * (1 + 3 * effect.productionBonus));
    for (const key of Object.keys(g.items).filter((k) => k !== target)) {
      near(after.buildings[key].perUnit, before.buildings[key].perUnit, key);
    }
  }
  // Multiple applicable recipes use sum(percent * crafts), not product(1+percent).
  g.recipes.extra = { craftCount: 2, effects: { farm: { productionBonus: 0.25 } } };
  near(g.getProductionBreakdown().buildings.farm.recipeBonus, 0.3 + 0.5);
  near(g.getProductionBreakdown().buildings.farm.perUnit, 7 * 1.8);
});

for (const level of [0, 1, 4]) {
  test(`prestige ${level}: exactly once alone and with local/global/recipe/quest effects`, () => {
    const { game: g } = harness();
    g.items.farm.count = 2;
    g.prestigeCount = level;
    near(g.calculatePerSecond(), 14 * 2 ** level);
    own(g, 'farm', 0);
    near(g.calculatePerSecond(), 28 * 2 ** level);
    own(g, 'donutUpgrades', 0);
    near(g.calculatePerSecond(), 28 * 1.03 * 2 ** level);
    g.recipes['Classic Donut'].craftCount = 2;
    near(g.calculatePerSecond(), 28 * 1.2 * 1.03 * 2 ** level);
    g.startQuestMultiplier(2, 5000);
    near(g.calculatePerSecond(), 28 * 1.2 * 1.03 * 2 ** level * 2);
    // Stale legacy caches cannot apply prestige or any modifier again.
    g.multiplierSources = { prestige: 2 ** level, questBuff: 2 };
    g.productionMultiplier = 2 ** level * 2;
    g.items.farm.originalProduction = 999999;
    g.items.farm.production = 999999;
    near(g.calculatePerSecond(), 28 * 1.2 * 1.03 * 2 ** level * 2);
  });
}

test('quest regression: claiming 2x doubles real credited production and earned totals', () => {
  const h = harness(); const g = h.game;
  isolateLoop(h);
  g.items.baker.count = 10;
  g.updateProduction(h.clock.now, 1.25);
  near(g.donutCount, 12.5);
  const quest = { completed: true, claimed: false, reward: { type: 'multiplier', amount: 2, duration: 5000 } };
  g.dynamicSlots.slot5.currentQuest = quest;
  g.claimDynamicReward('slot5');
  near(g.totalPerSecond, 20);
  const before = g.donutCount;
  g.updateProduction(h.clock.now, 1.25);
  near(g.donutCount - before, 25);
  near(g.totalDonutsEarned, g.donutCount);
  near(g.items.baker.totalProduced, g.donutCount);
});

test('temporary expiry/removal and queue activation use one active quest factor', () => {
  const h = harness(); const g = h.game;
  g.items.baker.count = 1;
  g.startQuestMultiplier(2, 1000);
  assert.equal(g.applyMultiplierReward(3, 2000), true);
  assert.equal(g.applyMultiplierReward(4, 2000), false);
  near(g.calculatePerSecond(), 2);
  h.clock.now += 1000;
  near(g.calculatePerSecond(), 1); // Pure reads ignore expired buff; never activate queued state.
  g.updateQuestMultipliers();
  near(g.calculatePerSecond(), 3);
  assert.equal(g.multiplierState.queued, null);
  h.clock.now += 2000;
  near(g.calculatePerSecond(), 1);
  g.updateQuestMultipliers();
  assert.equal(g.multiplierState.active, null);
});

test('legacy timed buffs stack independently, expire, and ignore only one old quest mirror', () => {
  const h = harness(); const g = h.game;
  g.items.baker.count = 1;
  g.prestigeCount = 2;
  g.activeMultipliers = [
    { amount: 2, endTime: h.clock.now + 1000, duration: 1000 },
    { amount: 3, endTime: h.clock.now + 2000, duration: 2000 },
  ];
  near(g.calculatePerSecond(), 4 * 2 * 3);
  g.startQuestMultiplier(2, 1000);
  near(g.calculatePerSecond(), 4 * 2 * 3); // First legacy entry mirrors quest reward.
  g.activeMultipliers.push({ ...g.activeMultipliers[0] });
  near(g.calculatePerSecond(), 4 * 2 * 2 * 3); // Only ONE mirror removed.
  h.clock.now += 1000;
  near(g.calculatePerSecond(), 4 * 3);
  h.clock.now += 1000;
  near(g.calculatePerSecond(), 4);
});

test('legacy activateMultiplier adapter creates one reward owner, not two engines', () => {
  const h = harness(); const g = h.game;
  g.items.baker.count = 5;
  assert.equal(g.activateMultiplier(2, 1000), true);
  near(g.calculatePerSecond(), 10);
  assert.equal(g.activeMultipliers.length, 0);
  g.updateProductionMultiplier();
  near(g.calculatePerSecond(), 10);
});

test('legacy mirror tolerance handles consecutive clock reads; distinct buffs still stack', () => {
  const h = harness(); const g = h.game;
  g.items.baker.count = 1;
  g.startQuestMultiplier(2, 1000);
  g.activeMultipliers = [{ amount: 2, endTime: h.clock.now + 1002 }];
  near(g.calculatePerSecond(), 2);
  g.activeMultipliers[0].endTime = h.clock.now + 2000;
  near(g.calculatePerSecond(), 4);
});

test('Donut Cursor flat exception survives every boost without being amplified', () => {
  const h = harness(); const { g, boosted, flat } = combined(h);
  const b = g.getProductionBreakdown();
  near(b.baseCPS, 1 + 20 + 21 + 100);
  near(b.localCPS, 264.4);
  near(b.boostedCPS, boosted);
  near(b.flatCPS, flat);
  near(b.effectiveCPS, boosted + flat);
  near(b.buildings.cursor.flatRate, 2.5);
  near(b.buildings.farm.perUnit, 7 * 2 * 1.2 * 1.03 ** 2 * 1.05 * 4 * 2);
});

test('clicks: manual base, all Cursor factors, CPS upgrade sum and utility exclusion', () => {
  const h = harness(); const g = h.game;
  near(g.calculateClickValue(), 1);
  g.items.baker.count = 100;
  for (const u of g.upgrades.cursor.filter((u) => !u.specialEffect)) {
    u.purchased = true;
  }
  const cursor = 2 * 2 * 2 * 3 * 10 * 10 * 10;
  near(g.calculateClickValue(), cursor);
  own(g, 'nonItemUpgrades', 0);
  near(g.calculateClickValue(), cursor + 1);
  own(g, 'nonItemUpgrades', 1, 2, 3, 4, 5);
  near(g.calculateClickValue(), cursor + 6);
  const beforeUtility = g.calculateClickValue();
  own(g, 'nonItemUpgrades', 6);
  near(g.calculateClickValue(), beforeUtility);
  assert.equal(g.getClickBreakdown().clickUpgradeCount, 6);
});

test('clicks: prestige/global/quest affect CPS term once; flat/base exceptions preserved', () => {
  const h = harness(); const { g, boosted } = combined(h);
  const c = g.getClickBreakdown();
  near(c.baseClick, 4 * 2); // Cursor factors and temporary buff, no direct prestige/global.
  near(c.cpsClick, boosted * 0.02); // NOT multiplied by temporary buff again.
  near(c.flatClick, 2.5);
  near(c.clickValue, 8 + boosted * 0.02 + 2.5);
  g.prestigeCount = 3;
  near(g.getClickBreakdown().baseClick, 8);
  near(g.getClickBreakdown().cpsClick, boosted * 2 * 0.02);
});

test('high finite CPS keeps useful precision in click and passive values without caps', () => {
  const { game: g } = harness();
  g.items.capitalCrest.count = 1e290;
  own(g, 'nonItemUpgrades', 0);
  near(g.calculatePerSecond(), 10980000 * 1e290);
  near(g.calculateClickValue(), 1 + 10980000 * 1e290 * 0.01);
});

test('manual click and both catch paths credit canonical clicks with one combo bonus', () => {
  const h = harness(); const { g } = combined(h);
  g.MAX_ANIMATION_ELEMENTS = 0;
  g.playRandomClickSound = () => {};
  g.updateTitleWithDonuts = () => {};
  g.showComboClickEffect = () => {};
  const click = g.calculateClickValue();
  g.handleDonutClick({ clientX: 10, clientY: 10 });
  near(g.donutCount, click);
  const makeDonut = () => ({ parentElement: {}, style: {}, classList: { add() {} },
    getBoundingClientRect: () => ({ left: 10, top: 10, width: 30, height: 30 }), remove() {} });
  const event = { stopPropagation() {}, clientX: 10, clientY: 10 };
  g.lastClickSuccess = false;
  g.handleComboDonutClick(event, makeDonut());
  near(g.donutCount, click * 2);
  g.catchFallingDonut(makeDonut());
  near(g.donutCount, click * (2 + 1.1));
  g.handleComboDonutClick(event, makeDonut());
  near(g.donutCount, click * (2 + 1.1 + 1.1));
  near(g.totalDonutsEarned, g.donutCount);
});

test('combined production credits exact elapsed income and reconciles building attribution', () => {
  const h = harness(); const { g, boosted, flat } = combined(h);
  isolateLoop(h);
  for (const dt of [0, 0.016, 0.25, 1.25, 10]) {
    const before = g.donutCount;
    g.updateProduction(h.clock.now, dt);
    near(g.donutCount - before, (boosted + flat) * dt);
  }
  near(g.totalDonutsEarned, g.donutCount);
  near(Object.values(g.items).reduce((sum, b) => sum + b.totalProduced, 0), g.donutCount);
});

test('buyItem and buyUpgrade use state immediately without stale/cumulative rates', () => {
  const h = harness(); const { g } = combined(h);
  // One building purchase reaches the restored 30-owned tier-3 authority gate.
  g.items.baker.count = 29;
  g.donutCount = 1e12;
  const rate = g.getProductionBreakdown().buildings.baker.perUnit;
  // Buying a non-Cursor also increases the explicit flat contribution of owned Cursors.
  const before = g.calculatePerSecond();
  g.buyItem('baker');
  near(g.calculatePerSecond() - before, rate + g.items.cursor.count * 0.1);
  g.buyUpgrade('baker', 2);
  near(g.getProductionBreakdown().buildings.baker.upgradeMultiplier, 8);
  const once = g.calculatePerSecond();
  g.buyUpgrade('baker', 2);
  g.rebuildItemProductionsFromSaveState();
  g.updateTotalPerSecond();
  near(g.calculatePerSecond(), once);
});

test('craft -> owned recipe -> canonical building/UI/loop, no manual rate mutation', () => {
  const h = harness(); const g = h.game;
  isolateLoop(h);
  g.items.farm.count = 1;
  g.items.mine.count = 1;
  own(g, 'farm', 0);
  own(g, 'donutUpgrades', 0);
  g.prestigeCount = 1;
  g.startQuestMultiplier(2, 10000);
  g.ingredients = { Dough: { count: 100 }, Sugar: { count: 100 } };
  const mine = g.getProductionBreakdown().buildings.mine.perUnit;
  g.craftDonut('Classic Donut');
  near(g.donutCount, 2); // Craft's flat reward uses temporary factor, not building prestige/global.
  near(g.getProductionBreakdown().buildings.farm.perUnit, 7 * 2 * 1.1 * 1.03 * 2 * 2);
  near(g.getProductionBreakdown().buildings.mine.perUnit, mine);
  const before = g.donutCount;
  g.updateProduction(h.clock.now, 1);
  near(g.donutCount - before, g.calculatePerSecond());
});

test('current quest CPS, history and stable/frozen reward inputs use canonical production', () => {
  const h = harness(); const { g, boosted, flat } = combined(h);
  const cps = boosted + flat;
  near(g.getStableCPS(), cps);
  near(g.getQuestClickEffortEstimate(), 1 + cps * 0.005); // Unchanged balancing policy.
  g.updateCPSHistory();
  near(g.cpsHistory[0].cps, cps);
  const rewardBefore = g.calculateDynamicReward(g.dynamicSlots.slot1, 'produce', { target: 100 });
  g.items.baker.count *= 2;
  near(g.getStableCPS(), cps); // Existing stable snapshot intentionally remains frozen.
  near(g.calculateDynamicReward(g.dynamicSlots.slot1, 'produce', { target: 100 }), rewardBefore);
  g.checkMilestoneProgress();
  for (const quest of Object.values(g.milestoneQuests.cps)) near(quest.progress, g.calculatePerSecond());
  const q = g.createDynamicQuest('efficiency', g.dynamicSlots.slot2);
  g.dynamicSlots.slot2.currentQuest = q;
  g.checkDynamicQuestProgress();
  near(q.progress, g.calculatePerSecond());
});

for (const format of ['v1', 'unversioned-envelope', 'legacy-json']) {
  test(`round trip ${format}: CPS/click/local/quest/legacy state survive reload`, () => {
    const h = harness(); h.game.loadGame();
    const { g } = combined(h);
    g.activeMultipliers = [{ amount: 1.5, endTime: h.clock.now + 30000, duration: 30000 }];
    const cps = g.calculatePerSecond();
    const click = g.calculateClickValue();
    assert.equal(g.saveGame({ silent: true }), true);
    if (format !== 'v1') {
      const data = g.decodeSave(h.values.get('gameState'));
      delete data.saveVersion;
      // Full old-format rate fields/scalar are stale caches, not production authority.
      data.items.baker.production = 1234567;
      data.items.baker.originalProduction = 1234567;
      data.productionMultiplier = 999;
      h.values.set('gameState', format === 'legacy-json' ? JSON.stringify(data) : g.encryptSave(data));
    }
    const loaded = h.newGame();
    assert.equal(loaded.loadGame(), true);
    near(loaded.calculatePerSecond(), cps);
    near(loaded.calculateClickValue(), click);
    assert.equal(loaded.multiplierState.active.amount, 2);
    assert.equal(loaded.activeMultipliers.length, 1);
    near(loaded.recipes['Classic Donut'].craftCount, 2);
  });
}

test('real prestige reset clears run modifiers and rebuilds exactly 2x per level', () => {
  const h = harness(); const g = h.game;
  g.loadGame();
  for (const level of [1, 2, 3]) {
    g.items.baker.count = 5;
    own(g, 'baker', 0);
    g.totalDonutsEarned = g.nextPrestigeThreshold;
    g.startQuestMultiplier(2, 10000);
    g.performPrestige();
    assert.equal(g.prestigeCount, level);
    near(g.calculatePerSecond(), 0);
    assert.equal(g.multiplierState.active, null);
    assert.equal(g.upgrades.baker[0].purchased, false);
    g.items.baker.count = 1;
    near(g.calculatePerSecond(), 2 ** level);
  }
});

test('identical final state is order independent; repeated rebuild/display cannot compound', () => {
  const h = harness(); const { g } = combined(h);
  const expected = g.calculatePerSecond();
  const a = h.newGame();
  a.startQuestMultiplier(2, 60000);
  a.prestigeCount = 2;
  a.rebuildItemProductionsFromSaveState();
  for (const key of Object.keys(g.items).reverse()) {
    a.items[key].count = g.items[key].count;
  }
  for (const key of Object.keys(g.upgrades).reverse()) {
    for (let i = g.upgrades[key].length - 1; i >= 0; i--) {
      a.upgrades[key][i].purchased = g.upgrades[key][i].purchased;
      a.updateTotalPerSecond();
    }
  }
  for (const key of Object.keys(g.recipes)) a.recipes[key].craftCount = g.recipes[key].craftCount;
  a.farmState.mastery.level = 20;
  for (let i = 0; i < 20; i++) {
    a.rebuildItemProductionsFromSaveState();
    a.updateProductionMultiplier();
    near(a.calculatePerSecond(), expected);
  }
  near(a.calculateClickValue(), g.calculateClickValue());
});

test('DOM CPS/statistics/building panel agree and rendering cannot mutate economic state', () => {
  const h = harness(); const { g } = combined(h);
  g.cacheElements();
  h.context.performance.now = () => 42; // Monotonic UI clock is NOT the epoch buff clock.
  // Capture actual RAF rendering; VM stubs only layout/browser dependencies.
  h.context.requestAnimationFrame = (callback) => { callback(0); return 1; };
  const before = JSON.stringify({ items: g.items, buffs: g.activeMultipliers, quest: g.multiplierState,
    balance: g.donutCount, earned: g.totalDonutsEarned, prestige: g.prestigeCount });
  const cps = g.calculatePerSecond();
  g._actualUpdateDisplay();
  const perSecond = h.elements.get('per-second').innerHTML;
  assert.ok(perSecond.includes(g.formatNumber(cps, 'perSecond')));
  g.updateStatsDisplay();
  assert.equal(h.elements.get('donuts-per-second').textContent, g.formatNumber(cps, 'perSecond'));
  assert.equal(h.elements.get('click-value').textContent, g.formatNumber(g.calculateClickValue(), 'perSecond'));
  h.context.requestAnimationFrame = () => 1; // showItemInfo installs a repeating render callback.
  g.showItemInfo('farm');
  const panel = h.elements.get('item-info-feature');
  assert.ok(panel.querySelector('[data-role="per-unit"]').innerHTML.includes(
    g.formatNumber(g.getProductionBreakdown().buildings.farm.perUnit, 'perSecond')));
  h.methods.hideInfoPanel.call(g);
  g.formatNumber(cps, 'perSecond');
  assert.equal(JSON.stringify({ items: g.items, buffs: g.activeMultipliers, quest: g.multiplierState,
    balance: g.donutCount, earned: g.totalDonutsEarned, prestige: g.prestigeCount }), before);
  near(g.calculatePerSecond(), cps);
});

test('inactive consumer keeps 25% and 12-hour cap with chronological canonical CPS', () => {
  const h = harness(); const { g, boosted, flat } = combined(h);
  g.getFarmCount = () => 0;
  g.setTimeVisibility(true);
  h.clock.now += 86400000;
  g.calculateOfflineEarnings();
  // The 2x expires after its first real minute, including inside the inactive cap.
  near(g.donutCount, (boosted / 2) * (43200 + 60) * 0.25 + flat * 43200 * 0.25);
  near(g.totalDonutsEarned, g.donutCount);
});

test('income attribution preserves existing earned vs balance-only reward classifications', () => {
  const h = harness(); const g = h.game;
  g.creditDonuts(10);
  near(g.donutCount, 10); near(g.totalDonutsEarned, 10);
  g.creditDonuts(5, false);
  near(g.donutCount, 15); near(g.totalDonutsEarned, 10);
  const quest = { completed: true, reward: { type: 'donuts', amount: 7 } };
  g.dynamicSlots.slot1.currentQuest = quest;
  g.claimDynamicReward('slot1');
  near(g.donutCount, 22); near(g.totalDonutsEarned, 10);
  g.ores.Copper.count = 1;
  const price = g.oreTypes.find((o) => o.type === 'Copper').price;
  g.sellAllOres();
  near(g.donutCount, 22 + price); near(g.totalDonutsEarned, 10);
});

test('numeric safety: missing/invalid fields, negative elapsed, overflow and no string coercion', () => {
  const h = harness(); const g = h.game;
  isolateLoop(h);
  g.items.baker.count = -5;
  g.items.farm.count = NaN;
  g.items.mine.count = '5';
  near(g.calculatePerSecond(), 0);
  g.items.baker.count = 2;
  g.upgrades.baker[0].purchased = true;
  g.upgrades.baker[0].multiplier = undefined;
  g.recipes['Classic Donut'].craftCount = Infinity;
  near(g.calculatePerSecond(), 2);
  g.updateProduction(h.clock.now, -2);
  near(g.donutCount, 0);
  for (const amount of [NaN, Infinity, -1, '2']) assert.equal(g.creditDonuts(amount), false);
  near(g.donutCount, 0);
  assert.equal(h.notifications.filter((s) => s.includes('calculated safely')).length, 1);
  g.items.capitalCrest.count = 1e308;
  assert.equal(g.getProductionBreakdown().valid, false);
  g.updateProduction(h.clock.now, 1);
  near(g.donutCount, 0);
  assert.equal(g.creditDonuts(Number.MAX_VALUE), true);
  assert.equal(g.creditDonuts(Number.MAX_VALUE), false);
  assert.equal(g.donutCount, Number.MAX_VALUE);
});


test('missing frozen rewards snapshot fully hydrated CPS; saved frozen rewards stay unchanged', () => {
  const h = harness(); h.game.loadGame();
  const { g } = combined(h);
  const key = Object.keys(g.milestoneQuests.production)[0];
  const q = g.milestoneQuests.production[key];
  q.completed = true;
  q.frozenReward = null;
  // Fixture changes counts directly; use the same canonical costs as real purchases/load.
  g.fixBuildingCosts();
  const expected = g.calculateMilestoneRewardEstimate('production', q, key);
  const expectedCPS = g.calculatePerSecond();
  assert.equal(g.saveGame({ silent: true }), true);
  const loaded = h.newGame();
  const freeze = loaded.freezeCompletedMilestoneRewards;
  loaded.freezeCompletedMilestoneRewards = function () {
    near(this.calculatePerSecond(), expectedCPS, 'CPS at the reward-freezing boundary');
    return freeze.call(this);
  };
  assert.equal(loaded.loadGame(), true);
  near(loaded.milestoneQuests.production[key].frozenReward, expected);
  const saved = g.decodeSave(h.values.get('gameState'));
  saved.questSystem.milestoneQuests.production[key].frozenReward = 123;
  h.values.set('gameState', g.encryptSave(saved));
  const frozen = h.newGame();
  assert.equal(frozen.loadGame(), true);
  assert.equal(frozen.milestoneQuests.production[key].frozenReward, 123);
});

test('legacy-only and dual-written rewards retain effective CPS through save/load', () => {
  for (const mirrored of [false, true]) {
    const h = harness(); const g = h.game;
    g.loadGame(); g.items.baker.count = 10; g.prestigeCount = 2;
    if (mirrored) g.startQuestMultiplier(2, 1000);
    g.activeMultipliers = [
      { amount: 2, endTime: h.clock.now + 1000, duration: 1000 },
      { amount: 3, endTime: h.clock.now + 3000, duration: 3000 },
    ];
    near(g.calculatePerSecond(), 10 * 4 * 2 * 3);
    assert.equal(g.saveGame({ silent: true }), true);
    const loaded = h.newGame();
    assert.equal(loaded.loadGame(), true);
    near(loaded.calculatePerSecond(), 10 * 4 * 2 * 3);
    assert.equal(loaded.activeMultipliers.length, 2); // Compatibility reading does not erase stored rewards.
    h.clock.now += 1000;
    near(loaded.calculatePerSecond(), 10 * 4 * 3);
  }
});

test('rendering expired buffs is read-only; timer cleanup belongs to economic ticks', () => {
  const h = harness(); const g = h.game;
  g.items.baker.count = 1; g.cacheElements();
  g.activeMultipliers = [{ amount: 2, endTime: h.clock.now - 1, duration: 1000 }];
  g.startQuestMultiplier(3, 2000);
  const before = JSON.stringify(g.activeMultipliers);
  g._actualUpdateDisplay();
  assert.equal(JSON.stringify(g.activeMultipliers), before);
  near(g.calculatePerSecond(), 3);
  g.updateQuestMultipliers();
  assert.equal(g.activeMultipliers.length, 0);
});
