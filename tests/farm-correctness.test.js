// Real Farm methods with the existing fake DOM/storage/clock; no browser simulation.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');

function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) <= Math.max(1, Math.abs(expected)) * 1e-10,
    `expected ${expected}, got ${actual}`);
}
function animal(id, type = 'chicken', traits = [], variant = null) {
  return { id, type, name: id, traits, variant, passport: null, productionTimer: 0,
    feedPlan: 'standard', breedCooldown: 0 };
}
function farm() {
  const h = harness(), g = h.game;
  g.loadGame(); g.items.farm.count = 60; g.donutCount = 1e9;
  g.farmState.animals = [animal('a'), animal('b')];
  return h;
}
function care(h, action = 'pet') {
  Object.assign(h.game.farmState.careWindow, { active: true, expiresAt: h.clock.now + 90000 });
  assert.equal(h.game.performCareAction(action), true);
}
function finish(g, slot = 0) {
  g.farmState.breeding.slots[slot].progress = g.farmState.breeding.slots[slot].duration;
  return g.completeBreeding(slot);
}
function roundTrip(h) {
  assert.equal(h.game.saveGame({ silent: true }), true);
  const loaded = h.newGame(); assert.equal(loaded.loadGame(), true); return loaded;
}
function realUI(h) {
  // These rendering assertions exercise an open Farm panel.
  h.game.footerContainer = h.document.getElementById('footer-container');
  h.game.footerContainer.classList.add('visible');
  h.document.getElementById('farm-panel').classList.remove('hidden');
  for (const name of ['updateFarmDisplay', '_forceBarnFullRender', 'updateFarmMasteryBadge']) {
    h.game[name] = h.methods[name];
  }
}
function fixedRandom(h, value) {
  h.context.Math = Object.create(Math); h.context.Math.random = () => value;
}
function contract(h, affix, type = 'longhaul') {
  // Force one real configured affix without depending on incidental random draw order.
  h.originalAffixes ??= h.game.farmAffixDefs;
  h.game.farmAffixDefs = [{ ...h.originalAffixes.find((a) => a.id === affix), rarity: 1 }];
  fixedRandom(h, 0.8);
  h.game.generateBuffReward = () => ({ category: 'PROD', strength: 1.05, duration: 300 });
  return h.game.generateContract(type, 60, 8);
}

test('care expires per species and integrates a tick crossing expiry exactly', () => {
  const h = farm(), g = h.game;
  g.farmState.animals.push(animal('cow', 'cow'));
  care(h); g.tickFarm(90);
  near(g.farmState.storage.egg, 4.8); near(g.farmState.storage.milk, 1.25);
  near(g.getFarmCareCycles('chicken'), 0); near(g.getFarmCareCycles('cow'), 0.75);
  near(g.getProductionModifier('chicken'), 1); near(g.getProductionModifier('cow'), 1.25);
  g.tickFarm(54); near(g.farmState.storage.milk, 2);
  assert.equal(g.farmState.careBonus.cyclesRemaining, 0);
});

test('Treat consumes three cycles; full storage pauses cycles and herd size does not shorten them', () => {
  const h = farm(), g = h.game, before = g.donutCount;
  care(h, 'treat'); near(g.donutCount, before * 0.999);
  g.farmState.storage.egg = g.getEffectiveStorageCap('egg');
  g.tickFarm(500); near(g.getFarmCareCycles('chicken'), 3);
  g.farmState.storage.egg = 0;
  g.tickFarm(45 * 3 / 1.4 + 45);
  near(g.farmState.storage.egg, 8); near(g.getFarmCareCycles('chicken'), 0);
});

test('care rejects invalid/repeated actions and applies Calm only once to an eligible action', () => {
  const h = farm(), g = h.game; g.farmState.animals[0].traits = ['calm'];
  const before = JSON.stringify(g.farmState.careBonus);
  assert.equal(g.performCareAction('pet'), false); assert.equal(JSON.stringify(g.farmState.careBonus), before);
  care(h); near(g.farmState.careBonus.modifier, 1.375);
  assert.equal(g.performCareAction('pet'), false); near(g.farmState.careBonus.modifier, 1.375);
  assert.equal(g.performCareAction('invalid'), false);
  Object.assign(g.farmState.careWindow, { active: false, lateUntil: h.clock.now + 1000 });
  assert.equal(g.performCareAction('pet'), true); near(g.farmState.careBonus.modifier, 1.21);
  assert.equal(g.performCareAction('pet'), false);
});

test('Alert extends a window once by its configured five seconds and countdown refreshes', () => {
  const h = farm(), g = h.game;
  for (const a of g.farmState.animals) a.traits = ['alert'];
  g.farmState.careWindow.nextTrigger = h.clock.now;
  g.tickCareWindow(h.clock.now); assert.equal(g.farmState.careWindow.expiresAt, h.clock.now + 95000);
  g.tickCareWindow(h.clock.now + 1000);
  assert.equal(h.document.getElementById('farm-care-timer').textContent, '94s remaining');
});

test('legacy care loads conservatively and partial cycles survive subsequent saves', () => {
  const h = farm(), g = h.game;
  g.farmState.careBonus = { modifier: 1.25, cyclesRemaining: 2 };
  delete g.farmState.collectCounts;
  const loaded = roundTrip(h);
  assert.equal(loaded.getFarmCareCycles('chicken'), 2);
  assert.deepEqual(JSON.parse(JSON.stringify(loaded.farmState.collectCounts)), {});
  loaded.tickFarm(18); near(loaded.getFarmCareCycles('chicken'), 1.5);
  h.game = loaded; const again = roundTrip(h); near(again.getFarmCareCycles('chicken'), 1.5);
  assert.equal(again.farmState.careBonus.cyclesRemaining, 2);
});

test('breeding mutation path rejects invalid slots, parents, locks, capacity, cooldowns and funds', () => {
  const cases = [
    (g) => [2, 'a', 'b', 'quick'],
    (g) => [0, 'a', 'a', 'quick'],
    (g) => [0, 'missing', 'b', 'quick'],
    (g) => [0, 'a', 'b', 'unknown'],
    (g) => { g.items.farm.count = 14; return [0, 'a', 'b', 'quick']; },
    (g) => { g.items.farm.count = 59; return [1, 'a', 'b', 'quick']; },
    (g) => { g.items.farm.count = 24; return [0, 'a', 'b', 'long']; },
    (g) => { g.farmState.animals[1].type = 'cow'; return [0, 'a', 'b', 'quick']; },
    (g) => { g.farmState.animals[0].breedCooldown = 1; return [0, 'a', 'b', 'quick']; },
    (g) => { g.donutCount = 0; return [0, 'a', 'b', 'quick']; },
    (g) => { for (let i = 2; i < 20; i++) g.farmState.animals.push(animal('x' + i)); return [0, 'a', 'b', 'quick']; },
  ];
  for (const setup of cases) {
    const { game: g } = farm(), args = setup(g), before = g.donutCount;
    assert.equal(g.startBreeding(...args), false); assert.equal(g.donutCount, before);
    assert.ok(g.farmState.breeding.slots.every((s) => !s.active));
  }
});

test('active parents cannot be reused; premature and repeated completion do not grant offspring', () => {
  const { game: g } = farm();
  assert.equal(g.startBreeding(0, 'a', 'b', 'standard'), true);
  assert.equal(g.startBreeding(1, 'a', 'b', 'quick'), false);
  assert.equal(g.completeBreeding(0), false); assert.equal(g.farmState.animals.length, 2);
  assert.equal(finish(g), true); const xp = g.farmState.mastery.xp;
  assert.equal(g.completeBreeding(0), false); assert.equal(g.farmState.animals.length, 3);
  assert.equal(g.farmState.mastery.xp, xp); assert.equal(g.farmState.stats.totalBred, 1);
});

test('breeding start/completion refresh cards and offspring rosters without a tab switch', () => {
  const h = farm(), g = h.game; realUI(h); g.farmActiveTab = 'breeding';
  g.updateFarmDisplay(); const cards = h.document.getElementById('farm-breeding-slots');
  assert.ok(cards.innerHTML.includes('Ready'));
  g.startBreeding(0, 'a', 'b', 'quick'); assert.ok(cards.innerHTML.includes('breed-slot-card active'));
  finish(g); assert.ok(!cards.innerHTML.includes('breed-slot-card active'));
  g.farmActiveTab = 'barn'; g._expandedAnimalTypes = { chicken: true }; g.updateFarmDisplay();
  const grid = h.document.getElementById('farm-animal-grid');
  assert.ok(grid.innerHTML.includes('chicken_1')); assert.ok(grid.innerHTML.includes('releaseAnimal'));
  assert.ok(grid.innerHTML.includes('farm-trait-badge'));
});

test('cooldown expiry invalidates ready picker and removes stale roster cooldown labels', () => {
  const h = farm(), g = h.game; realUI(h);
  g.farmState.animals[0].breedCooldown = 1; g._expandedAnimalTypes = { chicken: true };
  g.farmActiveTab = 'barn'; g.updateFarmDisplay();
  const grid = h.document.getElementById('farm-animal-grid'); assert.ok(grid.innerHTML.includes('farm-cooldown-tag'));
  g.farmActiveTab = 'breeding'; g.updateFarmDisplay();
  const signature = h.document.getElementById('farm-breeding-slots').dataset.signature;
  g.tickBreeding(1); g.updateFarmDisplay();
  assert.notEqual(h.document.getElementById('farm-breeding-slots').dataset.signature, signature);
  g.farmActiveTab = 'barn'; g.updateFarmDisplay(); assert.ok(!grid.innerHTML.includes('farm-cooldown-tag'));
});

test('mastery bar uses within-level XP and load/reset refresh the saved level', () => {
  const h = farm(), g = h.game; realUI(h);
  g.gainMasteryXP(100); assert.equal(g.farmState.mastery.level, 1); assert.equal(g.farmState.mastery.xp, 0);
  const badge = h.document.getElementById('farm-mastery-badge'); assert.ok(badge.innerHTML.includes('width:0%'));
  const required = Math.floor(100 * 2 ** 1.8); g.gainMasteryXP(required / 2);
  assert.ok(badge.innerHTML.includes('width:50%'));
  // The harness normally stubs rendering; restore the prototype for the new instance.
  h.context.Game.prototype.updateFarmMasteryBadge = h.methods.updateFarmMasteryBadge;
  const loaded = roundTrip(h); assert.ok(badge.innerHTML.includes('Lv. 1'));
  loaded.resetRunStateForPrestige(); assert.ok(badge.innerHTML.includes('width:50%'));
});

test('prestige preserves mastery XP/level while clearing run-specific Farm state', () => {
  const h = farm(), g = h.game;
  g.farmState.mastery = { level: 13, xp: 123 }; care(h);
  g.farmState.crates.push({ id: 'gold', tier: 'gold' }); g.farmState.storage.egg = 10;
  g.farmState.collectCounts.egg = 9; g.startBreeding(0, 'a', 'b', 'quick');
  const xp = g.farmState.mastery.xp;
  g.totalDonutsEarned = g.nextPrestigeThreshold; g.performPrestige();
  assert.equal(g.farmState.mastery.level, 13); assert.equal(g.farmState.mastery.xp, xp);
  assert.equal(g.farmState.animals.length, 0); assert.equal(g.farmState.storage.egg, 0);
  assert.equal(g.farmState.crates.length, 0); assert.ok(g.farmState.breeding.slots.every((s) => !s.active));
  assert.equal(g.farmState.careBonus.cyclesRemaining, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(g.farmState.collectCounts)), {});
  const loaded = h.newGame(); assert.equal(loaded.loadGame(), true); assert.equal(loaded.farmState.mastery.xp, xp);
});

test('permanent level20 production benefit is applied exactly once across repeated prestiges/load', () => {
  const h = farm(), g = h.game; g.farmState.mastery = { level: 20, xp: 77 };
  for (let prestige = 1; prestige <= 2; prestige++) {
    g.totalDonutsEarned = g.nextPrestigeThreshold; g.performPrestige(); g.items.baker.count = 1;
    near(g.calculatePerSecond(), 1 * 2 ** prestige * 1.05);
    near(g.getProductionBreakdown().masteryMultiplier, 1.05);
  }
  const loaded = roundTrip(h); near(loaded.calculatePerSecond(), 4 * 1.05);
  assert.equal(loaded.farmState.mastery.xp, 77);
});

test('release requires confirmation, gives no rewards, clears selections and stays removed after load', () => {
  const h = farm(), g = h.game; let prompts = 0;
  realUI(h); g._expandedAnimalTypes = { chicken: true }; g.updateFarmDisplay();
  h.context.confirm = () => { prompts++; return false; };
  assert.equal(g.releaseAnimal('a'), false); assert.equal(g.farmState.animals.length, 2);
  h.context.confirm = () => { prompts++; return true; };
  g._breedSelection = { 0: { a: 'a', b: 'b' }, 1: { a: 'a', b: null } };
  const before = [g.donutCount, g.totalDonutsEarned, g.farmState.mastery.xp, g.farmState.crates.length];
  assert.equal(g.releaseAnimal('a'), true); assert.equal(g.releaseAnimal('a'), false); assert.equal(prompts, 2);
  assert.deepEqual([g.donutCount, g.totalDonutsEarned, g.farmState.mastery.xp, g.farmState.crates.length], before);
  assert.ok(Object.values(g._breedSelection).every((s) => s.a !== 'a' && s.b !== 'a'));
  const roster = h.document.getElementById('farm-animal-grid').innerHTML;
  assert.ok(!roster.includes('data-animal-id="a"')); assert.ok(roster.includes('data-animal-id="b"'));
  assert.equal(roundTrip(h).farmState.animals.some((a) => a.id === 'a'), false);
});

test('active parents cannot be released and full-barn completion never exceeds capacity', () => {
  const h = farm(), g = h.game; h.context.confirm = () => { throw new Error('must not prompt'); };
  g.startBreeding(0, 'a', 'b', 'quick'); assert.equal(g.releaseAnimal('a'), false);
  for (let i = 2; i < 20; i++) g.farmState.animals.push(animal('x' + i));
  finish(g); assert.equal(g.farmState.animals.length, 20); assert.equal(g.farmState.breeding.slots[0].active, false);
  assert.ok(h.notifications.some((s) => s.includes('Offspring lost')));
});

test('Ration and Sturdy multiply post-completion cooldowns without changing program duration or feed economics', () => {
  const h = farm(), g = h.game; g.farmState.animals[0].traits = ['sturdy'];
  g.farmState.feedPlans.chicken = 'ration'; near(g.getProductionModifier('chicken'), 0.7);
  near(g.getFeedCostPerSecond('chicken'), Math.max(1500 * 0.005 * 2 / 45, g.calculatePerSecond() * 0.0008));
  g.startBreeding(0, 'a', 'b', 'quick'); assert.equal(g.farmState.breeding.slots[0].duration, 1800);
  assert.equal(g.farmState.animals[0].breedCooldown, 0);
  g.tickBreeding(1800); near(g.farmState.animals[0].breedCooldown, 3600 * 0.75 * 0.85);
  near(g.farmState.animals[1].breedCooldown, 3600 * 0.75);
  g.tickBreeding(100); near(g.farmState.animals[0].breedCooldown, 2295 - 100);
});

test('Standard and Premium retain program lengths, production and configured mutation bonus', () => {
  const h = farm(), g = h.game; near(g.getProductionModifier('chicken'), 1);
  g.farmState.feedPlans.chicken = 'premium'; near(g.getProductionModifier('chicken'), 1.4);
  let bonus; g.rollNewTrait = (value, excluded) => { bonus = value; return g.farmTraitDefs.find((t) => !excluded.includes(t.id)).id; };
  fixedRandom(h, 0.9); g.rollBreedingTraits(g.farmState.animals[0], g.farmState.animals[1], g.farmBreedPrograms.standard);
  near(bonus, 0.1); g.startBreeding(0, 'a', 'b', 'standard');
  assert.equal(g.farmState.breeding.slots[0].duration, 7200); finish(g);
  assert.equal(g.farmState.animals[0].breedCooldown, 3600);
});

test('Generous grants one goods unit on the tenth species collection and persists its counter', () => {
  const h = farm(), g = h.game; g.farmState.animals[0].traits = ['generous'];
  let rolls = 0; g.rollFarmCrate = () => rolls++;
  for (let i = 0; i < 9; i++) { g.farmState.storage.egg = 1; g.sellGoods('egg'); }
  assert.equal(g.farmState.storage.egg, 0); assert.equal(rolls, 9);
  const loaded = roundTrip(h); loaded.farmState.storage.egg = 1;
  loaded.sellGoods('egg'); assert.equal(loaded.farmState.storage.egg, 1);
  assert.equal(loaded.farmState.collectCounts.egg, 10); assert.equal(loaded.farmState.collectCounts.milk, undefined);
});

test('Keen Eye applies one relative 5% bonus while baseline probabilities and manual roll counts stay intact', () => {
  const h = farm(), g = h.game; fixedRandom(h, 0.07);
  g.rollFarmCrate(); assert.equal(g.farmState.crates.length, 0);
  for (const a of g.farmState.animals) a.traits = ['keen_eye'];
  g.rollFarmCrate(); assert.equal(g.farmState.crates.length, 1); assert.equal(g.farmState.crates[0].tier, 'wooden');
  fixedRandom(h, 0.072); g.rollFarmCrate(); assert.equal(g.farmState.crates.length, 1);
  let rolls = 0; g.rollFarmCrate = () => rolls++; g.farmState.storage.egg = 10; g.sellGoods('egg');
  assert.equal(rolls, 1); g.farmState.mastery.level = 13;
  g.farmState.storage.egg = g.getEffectiveStorageCap('egg'); const xp = g.farmState.mastery.xp;
  g.tickAutoCollect(); assert.equal(rolls, 1); assert.equal(g.farmState.mastery.xp, xp);
});

test('Diplomat reduces new requirements once without reducing the frozen donut payout', () => {
  const h = farm(), g = h.game;
  g.farmAnimalDefs = { chicken: g.farmAnimalDefs.chicken };
  const before = contract(h, 'demanding');
  for (const a of g.farmState.animals) a.traits = ['diplomat'];
  const after = contract(h, 'demanding');
  assert.equal(after.reward.donuts, before.reward.donuts);
  for (const good of Object.keys(before.requirements)) {
    assert.equal(after.requirements[good], Math.ceil(before.requirements[good] * 0.9));
  }
  assert.notDeepEqual(after.requirements, before.requirements);
});

test('Contract Star boosts live contract speed once and snapshots configured buff duration', () => {
  const h = farm(), g = h.game;
  for (const a of g.farmState.animals) a.traits = ['contract_star'];
  const c = contract(h, 'generous'); near(c.reward.buff.duration, 300 * 1.15);
  g.farmState.contracts.active = [c]; g.farmState.mastery.level = 11;
  g.tickActiveContracts(10); near(c.elapsed, 12.5);
  g.farmState.animals = []; g.tickActiveContracts(10); near(c.elapsed, 23);
});

test('Focused/VIP/Legendary enforce configured goods/buff effects and exclude conflicting goods promises', () => {
  const h = farm(), g = h.game;
  const focused = contract(h, 'focused'); assert.equal(Object.keys(focused.requirements).length, 1);
  near(focused.reward.buff.duration, 360);
  const vip = contract(h, 'vip'); near(vip.reward.buff.strength, 1.05 * 1.3);
  const legendary = contract(h, 'legendary'); assert.equal(Object.keys(legendary.requirements).length, 2);
  assert.ok(Object.values(legendary.requirements).every((n) => n === 21));
  // Force Focused then Legendary using the real definitions and generation algorithm.
  g.farmAffixDefs = [
    { ...h.newGame().farmAffixDefs.find((a) => a.id === 'focused'), rarity: 0.5 },
    { ...h.newGame().farmAffixDefs.find((a) => a.id === 'legendary'), rarity: 0.5 },
  ];
  const sequence = [0.8, 0.1, 0.8, 0.9]; let index = 0;
  // Sorting/base generation consume randomness too; force the affix loop via a one-good pool.
  g.farmAnimalDefs = { chicken: g.farmAnimalDefs.chicken };
  let calls = 0; h.context.Math.random = () => { calls++; return calls <= 3 ? 0.8 : (sequence[index++] ?? 0.8); };
  const mixed = g.generateContract('longhaul', 60, 8);
  assert.ok(mixed.affixes.includes('focused')); assert.ok(!mixed.affixes.includes('legendary'));
});

test('trait-slot offspring variants add capacity beyond normal Mentor/program limits and round-trip intact', () => {
  const h = farm(), g = h.game, [a, b] = g.farmState.animals;
  assert.equal(g.getBreedingTraitCapacity(a, b, g.farmBreedPrograms.quick), 2);
  assert.equal(g.getBreedingTraitCapacity(a, b, g.farmBreedPrograms.quick, 'Golden'), 2);
  assert.equal(g.getBreedingTraitCapacity(a, b, g.farmBreedPrograms.quick, 'Phoenix'), 3);
  a.traits = ['mentor', 'well_fed']; b.traits = ['hardy'];
  assert.equal(g.getBreedingTraitCapacity(a, b, g.farmBreedPrograms.quick), 3);
  assert.equal(g.getBreedingTraitCapacity(a, b, g.farmBreedPrograms.long), 4);
  assert.equal(g.getBreedingTraitCapacity(a, b, g.farmBreedPrograms.long, 'Phoenix'), 5);
  a.variant = b.variant = 'Phoenix';
  assert.ok(g.getBreedingPreview('a', 'b', 'long').includes('Variant bonus'));
  g.startBreeding(0, 'a', 'b', 'long'); finish(g);
  const offspring = g.farmState.animals[2]; assert.equal(offspring.variant, 'Phoenix'); assert.equal(offspring.traits.length, 5);
  const loaded = roundTrip(h); assert.equal(loaded.farmState.animals[2].traits.length, 5);
  assert.deepEqual(JSON.parse(JSON.stringify(loaded.farmState.animals[0].traits)), ['mentor', 'well_fed']);
});

test('unsupported rewards never announce a granted passport or apply dormant buffs; crate payouts remain canonical', () => {
  const h = farm(), g = h.game; fixedRandom(h, 0.1);
  for (const category of ['COST', 'OFFLINE', 'QOL', 'EVENT']) {
    assert.equal(g.applyFarmBuff({ category, strength: 1.5, duration: 300 }), false);
    assert.equal(g.farmState.buffs[category], null);
  }
  const before = g.donutCount, cps = g.calculatePerSecond();
  g.farmState.crates = [{ id: 'gold', tier: 'gold' }, { id: 'epic', tier: 'epic' }];
  g.openFarmCrate('gold'); g.openFarmCrate('epic'); near(g.donutCount - before, Math.floor(cps * 900) + Math.floor(cps * 1800));
  assert.ok(!h.notifications.some((n) => /Found passport|Guaranteed passport/i.test(n)));
  assert.ok(h.notifications.some((n) => n.includes('not available yet')));
  assert.ok(g.farmState.animals.every((a) => a.passport === null));
});

test('old active breeding saves remain valid; shared inactive time advances programs and expires buffs', () => {
  const h = farm(), g = h.game; g.farmState.animals[0].variant = 'Phoenix';
  g.startBreeding(0, 'a', 'b', 'long'); g.tickBreeding(60);
  delete g.farmState.collectCounts; delete g.farmState.careBonus.cyclesByType;
  g.farmState.animals[0].breedCooldown = 120; // Valid pre-V1 active parent.
  g.farmState.buffs.PROD = { strength: 2, duration: 300, remaining: 300 };
  const loaded = roundTrip(h); assert.equal(loaded.farmState.breeding.slots[0].progress, 60);
  assert.equal(loaded.farmState.animals[0].variant, 'Phoenix');
  loaded.setTimeVisibility(true);
  h.clock.now += 3600000;
  loaded.calculateOfflineEarnings();
  assert.equal(loaded.farmState.breeding.slots[0].progress, 3660);
  assert.equal(loaded.farmState.animals[0].breedCooldown, 120);
  assert.equal(loaded.farmState.buffs.PROD, null); assert.equal(loaded.farmState.storage.egg, 30);
});
