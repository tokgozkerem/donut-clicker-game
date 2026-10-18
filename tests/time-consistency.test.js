// Real settlement with controlled wall/monotonic clocks; no browser dependencies.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');
const near = (a, b) => assert.ok(Math.abs(a - b) <= Math.max(1, Math.abs(b)) * 1e-9, `${a} != ${b}`);
const plain = (v) => JSON.parse(JSON.stringify(v));
function game() {
  const h = harness(), g = h.game; g.loadGame();
  g.items.baker.count = 100; // Exactly 100 authoritative CPS.
  g.timeState.randomState = 12345;
  return h;
}
function advance(h, seconds) { h.clock.now += seconds * 1000; h.game.settleTime(); }
function hidden(h) { h.document.visibilityState = 'hidden'; h.game.setTimeVisibility(true); }
function visible(h) { h.document.visibilityState = 'visible'; h.game.setTimeVisibility(false); }
function save(h) { assert.equal(h.game.saveGame({ silent: true }), true); return h.game.decodeSave(h.values.get('gameState')); }
function animal(id) { return { id, type: 'chicken', name: id, traits: [], variant: null, passport: null,
  productionTimer: 0, feedPlan: 'standard', breedCooldown: 0 }; }
function farm(h, count = 1) { const g = h.game; g.items.baker.count = 0; g.items.farm.count = count;
  g.farmState.animals = [animal('a'), animal('b')]; return g; }
function economic(g) { return plain({ balance: g.donutCount, earned: g.totalDonutsEarned, ores: g.ores,
  ingredients: g.ingredients, prices: g.oreTypes, farm: { ...g.farmState, careBonus: { ...g.farmState.careBonus, cyclesByType: g.farmState.careBonus.cyclesByType || {} } }, allowance: g.orePurchaseLimit,
  mine: g.timeState.mineProgress, baker: g.timeState.bakerProgress, rng: g.timeState.randomState }); }

test('100 CPS: ten active seconds credit 1000; repeated settlement is idempotent', () => {
  const h = game(); advance(h, 10); near(h.game.donutCount, 1000);
  h.game.settleTime(); h.game.updateProduction(); near(h.game.donutCount, 1000);
  near(Object.values(h.game.items).reduce((s, b) => s + b.totalProduced, 0), 1000);
});

test('100 CPS: 10s, 60s and ten minutes inactive credit 250, 1500 and 15000 without a minimum gap', () => {
  for (const [seconds, expected] of [[10, 250], [60, 1500], [600, 15000]]) {
    const h = game(); hidden(h); advance(h, seconds); near(h.game.donutCount, expected);
  }
});

test('hidden frequent updates, suspension and closed restoration produce identical resources and quotes', () => {
  const h = game(), g = h.game; g.items.mine.count = 1; g.refreshOreMarketReference(); hidden(h); save(h);
  const raw = h.values.get('gameState');
  for (let i = 0; i < 10; i++) advance(h, 60);
  const expected = economic(g);
  const suspended = harness({ gameState: raw }); suspended.clock.now += 600000;
  assert.equal(suspended.game.loadGame(), true); assert.deepEqual(economic(suspended.game), expected);
  const closed = harness({ gameState: raw }); assert.equal(closed.game.loadGame(), true);
  closed.game.setTimeVisibility(true); advance(closed, 600);
  assert.deepEqual(economic(closed.game), expected);
});

test('5min active, 10min hidden, 5min active follows the explicit segmented policy', () => {
  const h = game(); advance(h, 300); hidden(h); advance(h, 600); visible(h); advance(h, 300);
  near(h.game.donutCount, 75000);
});

test('13h continuous inactivity credits only 12h, including repeated hidden saves and a hidden reload', () => {
  const h = game(); hidden(h);
  for (let i = 0; i < 13; i++) { advance(h, 3600); save(h); }
  near(h.game.donutCount, 1080000); assert.equal(h.game.timeState.inactiveElapsed, 43200000);
  h.clock.now += 3600000; const loaded = h.newGame(); assert.equal(loaded.loadGame(), true);
  near(loaded.donutCount, 1080000); assert.equal(loaded.timeState.inactiveElapsed, 43200000);
});

test('a genuine visible interval ends the capped inactive episode and permits a later new one', () => {
  const h = game(); hidden(h); advance(h, 46800); visible(h); advance(h, 10); hidden(h); advance(h, 10);
  near(h.game.donutCount, 1081250);
});

test('saving an unsettled active gap credits it once before establishing the snapshot', () => {
  const h = game(); h.clock.now += 10000; const state = save(h);
  near(state.donutCount, 1000); assert.equal(state.lastActiveTime, state.timeState.settledAt);
  const loaded = h.newGame(); assert.equal(loaded.loadGame(), true); near(loaded.donutCount, 1000);
  loaded.saveGame({ silent: true }); near(loaded.donutCount, 1000);
});

test('visibilitychange, pagehide and pageshow settle boundaries without double credit or resetting a hidden cap', () => {
  const h = game(), g = h.game; g.setupSaveLifecycle();
  h.clock.now += 10000; h.document.visibilityState = 'hidden'; h.document.listeners.visibilitychange();
  near(g.donutCount, 1000);
  h.clock.now += 10000; h.window.listeners.pagehide(); near(g.donutCount, 1250);
  assert.equal(g.timeState.inactiveElapsed, 10000);
  h.document.visibilityState = 'visible'; h.document.listeners.visibilitychange(); h.window.listeners.pageshow();
  near(g.donutCount, 1250); advance(h, 10); near(g.donutCount, 2250);
});

test('temporary 2x for five of ten seconds produces 1500 active or 375 inactive', () => {
  for (const inactive of [false, true]) {
    const h = game(); h.game.startQuestMultiplier(2, 5000); if (inactive) hidden(h);
    advance(h, 10); near(h.game.donutCount, inactive ? 375 : 1500);
  }
});

test('queued multiplier starts at the preceding expiry, including across save/load', () => {
  const h = game(), g = h.game; g.startQuestMultiplier(2, 5000); g.applyMultiplierReward(3, 3000); hidden(h); save(h);
  h.clock.now += 10000; const loaded = h.newGame(); assert.equal(loaded.loadGame(), true);
  near(loaded.donutCount, (5 * 200 + 3 * 300 + 2 * 100) * 0.25);
  assert.equal(loaded.multiplierState.active, null); assert.equal(loaded.multiplierState.queued, null);
});

test('Baker preserves the half-cycle after 10min hidden and grants one whole batch after 20min', () => {
  const h = game(), g = h.game; g.items.baker.count = 1; hidden(h); advance(h, 600);
  assert.equal(Object.keys(g.ingredients).length, 0); near(g.timeState.bakerProgress, 150000);
  save(h); const loaded = h.newGame(); assert.equal(loaded.loadGame(), true); h.game = loaded;
  advance(h, 600); assert.equal(Object.values(loaded.ingredients).reduce((s, i) => s + i.count, 0), 2);
  near(loaded.timeState.bakerProgress, 0);
});

test('Mine processes two economic cycles plus 30sec remainder in ten hidden minutes, with market/action resets', () => {
  const h = game(), g = h.game; g.items.mine.count = 1; g.refreshOreMarketReference(); g.orePurchaseLimit = 0;
  hidden(h); advance(h, 600);
  assert.equal(g.workers.length, 1); assert.equal(Object.values(g.ores).reduce((s, o) => s + o.count, 0), 10);
  near(g.timeState.mineProgress, 30000); assert.equal(g.orePurchaseLimit, 10);
  assert.equal(g.oreTypes[0].priceHistory.length, 3); // Initial reference plus two updates.
  save(h); const loaded = h.newGame(); assert.equal(loaded.loadGame(), true);
  assert.deepEqual(plain(loaded.ores), plain(g.ores)); assert.equal(loaded.timeState.randomState, g.timeState.randomState);
});

test('delayed active frames preserve all Baker/Mine batches and their remainder', () => {
  const h = game(), g = h.game; g.items.baker.count = 1; g.items.mine.count = 1;
  advance(h, 1200.5);
  assert.equal(Object.values(g.ingredients).reduce((s, i) => s + i.count, 0), 8);
  assert.equal(Object.values(g.ores).reduce((s, i) => s + i.count, 0), 100);
  near(g.timeState.bakerProgress, 500); near(g.timeState.mineProgress, 500);
});

test('backward wall-clock changes cannot regress checkpoints or duplicate elapsed economic production', () => {
  const h = game(), g = h.game; let mono = 0; h.context.performance.now = () => mono; g._timeMonotonic = 0;
  const start = g.timeState.settledAt;
  h.clock.now -= 10000; g.settleTime(); assert.equal(g.timeState.settledAt, start); near(g.donutCount, 0);
  h.clock.now += 10000; g.settleTime(); near(g.donutCount, 0);
  mono += 10000; g.settleTime(); near(g.donutCount, 1000); assert.ok(g.timeState.settledAt >= start);
  hidden(h); h.clock.now -= 10000; g.settleTime(); h.clock.now = start + 10000; g.settleTime(); near(g.donutCount, 1000);
  const c = game(); c.context.performance.now = () => 0; c.game._timeMonotonic = 0;
  c.game.farmState.buffs.PROD = { strength: 2, remaining: 5, duration: 5 };
  c.clock.now += 10000; c.game.settleTime();
  near(c.game.donutCount, 0); assert.equal(c.game.farmState.buffs.PROD, null); // Wall timers still age on a wall-clock jump.
});

test('purchases, recipe crafts and mastery changes settle old production before changing rates', () => {
  const h = game(), g = h.game; g.donutCount = 1e9; const initial = g.donutCount;
  h.clock.now += 10000; const price = g.calculateBulkPrice(g.items.baker, 1); g.buyItem('baker');
  near(g.donutCount, initial + 1000 - price); advance(h, 10); near(g.donutCount, initial + 2010 - price);
  g.items.farm.count = 1; g.ingredients = { Dough: { count: 2 }, Sugar: { count: 1 } };
  const before = g.donutCount, old = g.calculatePerSecond(); h.clock.now += 10000; g.craftDonut('Classic Donut');
  near(g.donutCount - before, old * 10 + 1);
  g.farmState.mastery = { level: 19, xp: 0 }; const rate = g.calculatePerSecond();
  const cash = g.donutCount; h.clock.now += 10000; g.gainMasteryXP(1e6); near(g.donutCount - cash, rate * 10);
  near(g.calculatePerSecond(), rate * 1.05);
});

test('prestige settles only pre-prestige production and resets new-run resource phases at the boundary', () => {
  const h = game(), g = h.game; g.totalDonutsEarned = g.nextPrestigeThreshold;
  h.clock.now += 10000; g.performPrestige(); near(g.donutCount, 0); near(g.totalDonutsEarned, 0);
  assert.equal(g.items.baker.count, 0); assert.equal(g.timeState.mineProgress, 0); assert.equal(g.timeState.bakerProgress, 0);
  g.donutCount = 10000; g.buyItem('baker'); const before = g.donutCount; advance(h, 10); near(g.donutCount - before, 20);
});

test('Farm uses the same goods/modifiers/feed policy hidden or closed, while temporary buffs expire in real time', () => {
  const h = game(), g = farm(h); g.farmState.buffs.PROD = { strength: 2, duration: 300, remaining: 300 };
  hidden(h); save(h); const raw = h.values.get('gameState'); advance(h, 600);
  near(g.farmState.storage.egg, 10); assert.equal(g.farmState.buffs.PROD, null);
  const closed = harness({ gameState: raw }); closed.clock.now += 600000; assert.equal(closed.game.loadGame(), true);
  assert.deepEqual(economic(closed.game), economic(g));
});

test('Farm feed charges only produced economic time, stops at full storage and handles exhaustion without free premium output', () => {
  const h = game(), g = farm(h, 40); g.donutCount = 10000; g.setFeedPlan('chicken', 'premium');
  g.farmState.storage.egg = g.getEffectiveStorageCap('egg'); const before = g.donutCount;
  hidden(h); advance(h, 60); near(g.donutCount - before, 40 * 7 * 15); // No feed charge at full storage.
  g.items.farm.count = 1; g.farmState.storage.egg = 0; g.donutCount = 0;
  g.items.baker.count = 0; g.baseItemProductions.farm = 0; // Isolate feed exhaustion from passive funding.
  advance(h, 60); assert.equal(g.farmState.feedPlans.chicken, 'standard');
  near(g.farmState.storage.egg, 2 * 15 / g.farmAnimalDefs.chicken.prodInterval);
});

test('breeding and post-completion cooldown advance at 100% real time even after the economic cap', () => {
  const h = game(), g = farm(h, 60); g.donutCount = 1e9;
  g.startBreeding(0, 'a', 'b', 'quick'); const duration = g.farmState.breeding.slots[0].duration;
  hidden(h); advance(h, duration + 120); assert.equal(g.farmState.breeding.slots[0].active, false);
  near(g.farmState.animals.find((a) => a.id === 'a').breedCooldown, 3480);
  advance(h, 46800); near(g.farmState.animals.find((a) => a.id === 'a').breedCooldown, 0);
});

test('economic contracts finish at 25% speed and newly granted buffs start at the actual completion boundary', () => {
  const h = game(), g = farm(h, 5); g.farmState.contracts.active = [{ id: 'timed', type: 'rush', title: 'timed',
    duration: 60, elapsed: 0, requirements: {}, progress: {}, affixes: [],
    reward: { donuts: 10, buff: { category: 'PROD', strength: 2, duration: 300 } } }];
  hidden(h); advance(h, 300); assert.equal(g.farmState.contracts.active.length, 0);
  near(g.farmState.buffs.PROD.remaining, 240);
  assert.equal(g.farmState.stats.totalContractsCompleted, 1);
});

test('quest deadlines/cooldowns, care opportunities and DonutCoin readiness remain wall-clock systems', () => {
  const h = game(), g = h.game; g.items.farm.count = 10;
  const now = h.clock.now; g.farmState.careWindow = { active: true, expiresAt: now + 90000, nextTrigger: now + 720000, lateUntil: 0 };
  const slot = g.dynamicSlots.slot1; g.generateQuestForSlot(slot.id); const q = slot.currentQuest;
  Object.assign(q, { type: 'timedProduce', target: 1e12, startProduction: 0, timedStartTime: now, timeLimit: 60000, completed: false });
  g.donutCoin.lastClaimTime = now; hidden(h); advance(h, 86400);
  assert.equal(slot.currentQuest, null); assert.equal(slot.cooldownEnd, now + 60000 + slot.cooldown);
  assert.ok(g.farmState.careWindow.nextTrigger > g.farmState.careWindow.expiresAt);
  g.claimDonutCoin(); assert.equal(g.donutCoin.count, 1); g.claimDonutCoin(); assert.equal(g.donutCoin.count, 1);
  const c = game(), cg = c.game; cg.generateQuestForSlot('slot1'); const completed = cg.dynamicSlots.slot1.currentQuest;
  Object.assign(completed, { type: 'timedProduce', target: 1000, startProduction: 0,
    timedStartTime: c.clock.now, timeLimit: 60000, completed: false });
  hidden(c); c.clock.now += 61000; cg.checkDynamicQuestProgress(); // A delayed click-check callback, before RAF.
  assert.equal(completed.completed, true); assert.equal(cg.dynamicSlots.slot1.currentQuest, completed);
});

test('inactive settlement does not buy buildings, spawn/catch combos or resurrect pending interaction rewards', () => {
  const h = game(), g = h.game; g.donutCount = 1e9;
  g.autoBuyer.enabled = true; g.autoBuyer.settings.baker.enabled = true;
  const n = h.document.createElement('div'); h.document.body.appendChild(n);
  hidden(h); const before = g.donutCount; g.catchFallingDonut(n); g.createComboDonut(); g.checkAutoBuyer();
  near(g.donutCount, before); advance(h, 10); assert.equal(g.items.baker.count, 100);
  near(g.donutCount, before + 250);
});

test('legacy phase migration and strict optional timing validation preserve Save Integrity', () => {
  const h = game(), state = save(h); delete state.timeState;
  state.lastMineProduction = state.lastActiveTime - 25000; state.lastBakerProduction = state.lastActiveTime - 120000;
  h.values.set('gameState', h.game.encryptSave(state)); h.clock.now += 10000; h.operations.length = 0;
  const loaded = h.newGame(); assert.equal(loaded.loadGame(), true);
  near(loaded.timeState.mineProgress, 27500); near(loaded.timeState.bakerProgress, 122500); near(loaded.donutCount, 250);
  assert.equal(h.operations.length, 0);
  const valid = plain(loaded.timeState);
  for (const bad of [{ ...valid, mineProgress: 60000 }, { ...valid, inactiveElapsed: 43200001 }, { ...valid, randomState: 0 }]) {
    state.timeState = bad; assert.equal(loaded.decodeSave(loaded.encryptSave(state)), null);
  }
});

test('large random batches preserve unit totals and distribution identity with bounded RNG work', () => {
  const h = game(), g = h.game; g.items.mine.count = 100000; g.items.baker.count = 100000;
  let draws = 0; const rng = () => { draws++; return 0.5; };
  g.produceMineResources(rng); g.produceBakerResources(rng);
  assert.equal(Object.values(g.ores).reduce((sum, o) => sum + o.count, 0), 500000);
  assert.equal(Object.values(g.ingredients).reduce((sum, o) => sum + o.count, 0), 200000);
  assert.ok(g.ores.Copper.count > g.ores.Iron.count && g.ores.Iron.count > g.ores.Gold.count && g.ores.Gold.count > g.ores.Diamond.count);
  assert.ok(draws < 30);
});

test('Farm contracts, breeding, care, feeding, auto-collection and market RNG agree across granular hidden updates and closed restore', () => {
  const h = game(), g = farm(h, 60); g.items.baker.count = 15; g.items.mine.count = 2;
  g.farmState.mastery = { level: 13, xp: 0 }; g.donutCount = 1e9;
  g.farmState.animals.forEach((a) => { a.traits = ['contract_star']; });
  g.refreshOreMarketReference(); g.startBreeding(0, 'a', 'b', 'quick'); g.setFeedPlan('chicken', 'premium');
  g.farmState.buffs.PROD = { strength: 2, duration: 300, remaining: 300 };
  g.farmState.careBonus = { modifier: 1.25, cyclesRemaining: 2 }; g.restoreFarmCareCycles();
  g.farmState.contracts.active = [{ id: 'mixed', title: 'mixed', type: 'rush', duration: 200, elapsed: 0,
    requirements: {}, progress: {}, affixes: [], reward: { donuts: 10, buff: { category: 'PROD', strength: 2, duration: 300 } } }];
  hidden(h); save(h); const raw = h.values.get('gameState');
  for (let i = 0; i < 60; i++) advance(h, 60);
  const closed = harness({ gameState: raw }); closed.clock.now += 3600000; assert.equal(closed.game.loadGame(), true);
  const l = closed.game; near(l.donutCount, g.donutCount); near(l.totalDonutsEarned, g.totalDonutsEarned);
  for (const good of Object.keys(g.farmState.storage)) near(l.farmState.storage[good], g.farmState.storage[good]);
  for (const field of ['mastery', 'stats', 'contracts', 'buffs', 'crates', 'careBonus', 'careWindow'])
    assert.deepEqual(plain(l.farmState[field]), plain(g.farmState[field]));
  assert.equal(l.farmState.animals.length, g.farmState.animals.length);
  g.farmState.animals.forEach((a, i) => {
    const b = l.farmState.animals[i]; near(b.breedCooldown, a.breedCooldown);
    assert.deepEqual(plain([b.id, b.traits, b.variant]), plain([a.id, a.traits, a.variant]));
  });
  assert.deepEqual(plain(l.ores), plain(g.ores)); assert.deepEqual(plain(l.ingredients), plain(g.ingredients));
  assert.deepEqual(plain(l.oreTypes), plain(g.oreTypes)); assert.equal(l.timeState.randomState, g.timeState.randomState);
});
