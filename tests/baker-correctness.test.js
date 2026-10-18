// Real Baker methods with deterministic clocks, storage and DOM; no browser dependencies.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');
const plain = (v) => JSON.parse(JSON.stringify(v));
const near = (a, b) => assert.ok(Math.abs(a - b) <= Math.max(1, Math.abs(b)) * 1e-12, `${a} != ${b}`);
function baker(ui = false) {
  const h = harness(); h.game.loadGame();
  if (ui) {
    h.game.updateIngredientList = h.methods.updateIngredientList;
    h.game.updateRecipeBook = h.methods.updateRecipeBook;
  }
  return h;
}
function snapshot(h) {
  assert.equal(h.game.saveGame({ silent: true }), true);
  return h.game.decodeSave(h.values.get('gameState'));
}
function stock(g, count = 100) {
  g.ingredients = Object.fromEntries(g.ingredientTypes.map((i) => [i.type, { count }]));
}
function craftState(g) {
  return plain({ inventory: g.ingredients, recipes: g.recipes, balance: g.donutCount, earned: g.totalDonutsEarned });
}
function openBook(h) {
  h.document.querySelector('.book-modal').classList.add('show'); h.game.updateRecipeBook();
}

test('single and bulk purchases reconcile one Baker representation per owned building without activating worker rates', () => {
  const h = baker(), g = h.game; g.donutCount = 1e9;
  g.buyItem('baker'); assert.equal(g.bakers.length, 1);
  g.bakers[0].productionRate = 999; g.bakers[0].legacyName = 'retained';
  g.purchaseAmount = 4; g.buyItem('baker');
  assert.equal(g.items.baker.count, 5); assert.equal(g.bakers.length, 5);
  assert.equal(g.bakers[0].legacyName, 'retained');
  g.bakers.push({ productionRate: 999 }); g.produceBakerResources(() => 0.1);
  assert.equal(g.bakers.length, 5); assert.equal(g.ingredients.Dough.count, 10);
  assert.equal(h.document.getElementById('bakerWorkerCount').textContent, '5');
});

test('legacy/current load repairs missing/excess Baker workers, retains prefix entries and never writes on load', () => {
  for (const legacy of [true, false]) for (const workers of [[], [{ productionRate: 7, name: 'old' }, {}, {}, {}], undefined]) {
    if (!legacy && workers === undefined) continue;
    const h = baker(), data = snapshot(h); data.items.baker.count = 2;
    data.ingredients = { Chocolate: { count: 8 } };
    if (legacy) delete data.saveVersion;
    if (workers === undefined) delete data.bakers; else data.bakers = workers;
    h.values.set('gameState', legacy ? JSON.stringify(data) : h.game.encryptSave(data));
    h.operations.length = 0; const g = h.newGame(); assert.equal(g.loadGame(), true);
    assert.equal(g.bakers.length, 2); assert.equal(g.ingredients.Chocolate.count, 8);
    assert.equal(h.document.getElementById('bakerWorkerCount').textContent, '2');
    assert.equal(h.operations.length, 0);
    if (workers?.length) { assert.equal(g.bakers[0].productionRate, 7); assert.equal(g.bakers[0].name, 'old'); }
    else assert.ok(g.bakers.every((b) => b.productionRate === 2));
  }
});

test('ingredient load recovery floors positive fractions and zeros only malformed entries; strict saves remain strict', () => {
  for (const bad of [-1, null, '20', {}, [], Infinity, NaN]) {
    const h = baker(), data = snapshot(h);
    data.ingredients = { Dough: { count: 7.9 }, Sugar: { count: bad }, Chocolate: { count: 11 }, Obsolete: null };
    const raw = h.game.encryptSave(data);
    assert.equal(h.game.decodeSave(raw), null);
    h.values.set('gameState', raw); h.operations.length = 0;
    const g = h.newGame(); assert.equal(g.loadGame(), true);
    assert.deepEqual(plain(g.ingredients), { Dough: { count: 7 }, Sugar: { count: 0 }, Chocolate: { count: 11 }, Obsolete: { count: 0 } });
    assert.equal(h.operations.length, 0);
  }
});

test('ingredient recovery preserves checksum, unsafe-key and last-good-backup protections', () => {
  const h = baker(), good = snapshot(h), backup = h.values.get('gameState');
  good.ingredients = { Dough: { count: -5 } }; const broken = h.game.encryptSave(good);
  h.values.set('gameState', broken); h.values.set('gameStateBackup', backup);
  const g = h.newGame(); assert.equal(g.loadGame(), true); assert.equal(g.saveGame({ silent: true }), true);
  assert.equal(h.values.get('gameStateBackup'), backup);
  const envelope = JSON.parse(Buffer.from(broken, 'base64').toString()); envelope.sig = 'wrong';
  assert.equal(g.decodeSave(Buffer.from(JSON.stringify(envelope)).toString('base64'), { recoverBakerState: true }), null);
  const unsafe = JSON.stringify(good).replace('"ingredients":{', '"ingredients":{"__proto__":{},');
  assert.equal(g.decodeSave(unsafe, { recoverBakerState: true }), null);
});

test('production immediately enables open recipe cards and refreshes ingredients without replacing cards', () => {
  const h = baker(true), g = h.game; g.items.baker.count = 1; g.items.farm.count = 1;
  g.ingredients = { Dough: { count: 1 } }; openBook(h);
  const card = g._recipeCards.get('Classic Donut'); assert.equal(card.button.disabled, true);
  const nodes = [...h.document.querySelector('.recipes-list').children];
  const draws = [0.1, 0.7]; g.produceBakerResources(() => draws.shift());
  assert.equal(card.button.disabled, false); assert.equal(card.button.title, 'Make!');
  assert.ok(card.ingredients.innerHTML.includes('available'));
  assert.equal(h.document.getElementById('ingredientCount').textContent, 3);
  assert.deepEqual(h.document.querySelector('.recipes-list').children, nodes);
});

test('inventory refresh owns total display on production, crafting, load and prestige even at zero Bakers', () => {
  const h = baker(true), g = h.game; g.items.baker.count = 1; g.items.farm.count = 1;
  stock(g, 4); g.updateIngredientList(); assert.equal(h.document.getElementById('ingredientCount').textContent, 12);
  assert.equal(g.craftDonut('Classic Donut'), true); assert.equal(h.document.getElementById('ingredientCount').textContent, 9);
  g.produceBakerResources(() => 0.99); assert.equal(h.document.getElementById('ingredientCount').textContent, 11);
  snapshot(h); const loaded = h.newGame(); loaded.updateIngredientList = h.methods.updateIngredientList;
  assert.equal(loaded.loadGame(), true); assert.equal(h.document.getElementById('ingredientCount').textContent, 11);
  loaded.totalDonutsEarned = loaded.nextPrestigeThreshold; loaded.performPrestige();
  assert.equal(h.document.getElementById('ingredientCount').textContent, 0);
  assert.equal(h.document.getElementById('bakerWorkerCount').textContent, '0');
});

test('repeated Baker open/close and book refresh bind modal/card listeners exactly once and craft once', () => {
  const h = baker(true), g = h.game; g.items.farm.count = 1; stock(g);
  const button = h.document.getElementById('recipe-book-btn');
  const modal = h.document.querySelector('.book-modal'), close = modal.querySelector('.close-btn');
  g.footerContainer = h.document.getElementById('footer-container');
  g.closePanel = h.methods.closePanel;
  const bindings = [];
  for (const node of [button, modal, close, h.document]) {
    const original = node.addEventListener.bind(node);
    node.addEventListener = (event, callback) => { bindings.push([node, event]); original(event, callback); };
  }
  for (let i = 0; i < 5; i++) { g.openPanel('baker'); button.listeners.click(); close.listeners.click(); g.closePanel(); }
  assert.equal(bindings.length, 4); assert.equal(h.document.querySelector('.recipes-list').children.length, 6);
  const make = g._recipeCards.get('Classic Donut').button;
  let count = 0; const original = make.addEventListener.bind(make);
  make.addEventListener = (...args) => { count++; original(...args); };
  for (let i = 0; i < 5; i++) g.updateRecipeBook();
  assert.equal(count, 0); make.listeners.click(); assert.equal(g.recipes['Classic Donut'].craftCount, 1);
});

test('crafting uses exact historically rounded costs and refreshes open count, bonus, scaled costs and affordability', () => {
  const h = baker(true), g = h.game, name = 'Chocolate Bliss Donut', r = g.recipes[name];
  g.items.factory.count = 1; r.craftCount = 2; r.scaling.ingredients.current = 1;
  const scale = 1.8 * 1.8, expected = { Dough: Math.ceil(3 * scale), Sugar: Math.ceil(2 * scale), Chocolate: Math.ceil(3 * scale) };
  assert.deepEqual(plain(g.getRecipeRequirements(name)), expected);
  g.ingredients = Object.fromEntries(Object.entries(expected).map(([key, count]) => [key, { count }]));
  openBook(h); g.showRecipeDetail(name); assert.equal(g.craftDonut(name), true);
  assert.ok(Object.values(g.ingredients).every((i) => i.count === 0)); assert.equal(r.craftCount, 3);
  assert.equal(r.scaling.ingredients.current, scale * 1.8); assert.equal(g.donutCount, 5);
  assert.equal(g._recipeCards.get(name).button.disabled, true);
  const detail = h.document.getElementById('recipe-detail-panel').innerHTML;
  assert.ok(detail.includes('3x')); assert.ok(detail.includes('+24%'));
  assert.equal(g.craftDonut(name), false); assert.equal(r.craftCount, 3);
});

test('direct crafting rejects locked/unknown recipes, insufficient or invalid stock and unsafe scaling/counts before mutation', () => {
  const h = baker(), g = h.game, r = g.recipes['Classic Donut']; stock(g);
  const before = craftState(g); assert.equal(g.craftDonut('Classic Donut'), false);
  assert.equal(g.craftDonut('Unknown'), false); assert.deepEqual(craftState(g), before);
  g.items.farm.count = 1;
  for (const value of [-1, 1, 2.5, Infinity, NaN, '20']) {
    stock(g); g.ingredients.Dough.count = value;
    const state = craftState(g); assert.equal(g.craftDonut('Classic Donut'), false); assert.deepEqual(craftState(g), state);
  }
  stock(g);
  for (const count of [-1, 0.5, Infinity, 2000]) {
    r.craftCount = count; const state = craftState(g);
    assert.equal(g.craftDonut('Classic Donut'), false); assert.deepEqual(craftState(g), state);
  }
  r.craftCount = 0; r.scaling.ingredients.multiplier = NaN;
  const state = craftState(g); assert.equal(g.craftDonut('Classic Donut'), false); assert.deepEqual(craftState(g), state);
});

test('refused payout aborts entire craft with no false success message or save; real overflow also preserves progress', () => {
  const h = baker(), g = h.game; g.items.farm.count = 1; stock(g);
  const before = craftState(g), credit = g.creditDonuts;
  let saves = 0; g.requestSave = () => saves++; g.creditDonuts = () => false;
  assert.equal(g.craftDonut('Classic Donut'), false); assert.deepEqual(craftState(g), before);
  assert.equal(saves, 0); assert.ok(!h.notifications.some((m) => m.startsWith('Crafted')));
  g.creditDonuts = credit; g.recipes['Classic Donut'].production = Number.MAX_VALUE;
  g.donutCount = Number.MAX_VALUE; const overflow = craftState(g);
  assert.equal(g.craftDonut('Classic Donut'), false); assert.deepEqual(craftState(g), overflow);
});

test('compact, nested and missing contradictory legacy scaling reconstructs costs from earned craft count without load writes', () => {
  for (const scaling of [{ currentScaling: 1 }, { scaling: { ingredients: { current: 1 } } }, {}, { currentScaling: 32 }]) {
    const h = baker(), data = snapshot(h); delete data.saveVersion;
    data.items.farm.count = 1; data.recipes['Classic Donut'] = { craftCount: 5, ...scaling };
    data.ingredients = { Dough: { count: 2 }, Sugar: { count: 1 } };
    h.values.set('gameState', JSON.stringify(data)); h.operations.length = 0;
    const g = h.newGame(); assert.equal(g.loadGame(), true);
    assert.equal(g.recipes['Classic Donut'].craftCount, 5); assert.equal(g.recipes['Classic Donut'].scaling.ingredients.current, 32);
    assert.deepEqual(plain(g.getRecipeRequirements('Classic Donut')), { Dough: 64, Sugar: 32 });
    assert.equal(g.canMakeRecipe('Classic Donut'), false); assert.equal(h.operations.length, 0);
  }
});

test('all six recipes award one additive local CPS bonus only, agree with display and actual earned income', () => {
  const targets = ['farm', 'mine', 'factory', 'logisticCenter', 'powerPlant', 'nature'];
  const names = Object.keys(baker().game.recipes);
  for (let i = 0; i < names.length; i++) {
    const h = baker(), g = h.game; for (const target of targets) g.items[target].count = 1;
    stock(g); const animalModifier = g.getProductionModifier('chicken', false);
    const before = g.getProductionBreakdown(), r = g.recipes[names[i]], bonus = r.effects[targets[i]].productionBonus;
    assert.equal(g.craftDonut(names[i]), true); assert.equal(r.craftCount, 1);
    const after = g.getProductionBreakdown();
    for (const key of targets) near(after.buildings[key].effectiveCPS, before.buildings[key].effectiveCPS * (key === targets[i] ? 1 + bonus : 1));
    near(after.buildings[targets[i]].recipeBonus, bonus);
    const balance = g.donutCount; h.clock.now += 1000; g.settleTime(); near(g.donutCount - balance, after.effectiveCPS);
    const outputs = g.updateTotalPerSecond(); near(outputs[targets[i]], after.buildings[targets[i]].effectiveCPS);
    near(g.getProductionModifier('chicken', false), animalModifier);
    g.produceMineResources(() => 0.1);
    assert.equal(Object.values(g.ores).reduce((sum, ore) => sum + ore.count, 0), 5);
  }
});

test('recipe counts/requirements survive save, prestige and repurchase; run ingredients, workers and phase reset', () => {
  const h = baker(), g = h.game; g.items.baker.count = 1; g.items.farm.count = 1; stock(g);
  g.craftDonut('Classic Donut'); g.craftDonut('Classic Donut'); g.timeState.bakerProgress = 12345;
  snapshot(h); const loaded = h.newGame(); assert.equal(loaded.loadGame(), true);
  assert.equal(loaded.recipes['Classic Donut'].craftCount, 2);
  assert.deepEqual(plain(loaded.getRecipeRequirements('Classic Donut')), { Dough: 8, Sugar: 4 });
  loaded.totalDonutsEarned = loaded.nextPrestigeThreshold; loaded.performPrestige();
  assert.equal(loaded.items.baker.count, 0); assert.equal(loaded.bakers.length, 0);
  assert.deepEqual(plain(loaded.ingredients), {}); assert.equal(loaded.timeState.bakerProgress, 0);
  assert.equal(loaded.recipes['Classic Donut'].craftCount, 2); assert.equal(loaded.recipes['Classic Donut'].scaling.ingredients.current, 4);
  loaded.donutCount = 1e6; loaded.buyItem('farm'); near(loaded.getProductionBreakdown().buildings.farm.recipeBonus, 0.2);
  near(loaded.calculatePerSecond(), 7 * 1.2 * 2);
});

test('shared hidden/closed Baker clock preserves half-cycle, deterministic RNG and no reroll of completed batches', () => {
  const h = baker(), g = h.game; g.items.baker.count = 1; g.timeState.randomState = 12345;
  h.document.visibilityState = 'hidden'; g.setTimeVisibility(true); h.clock.now += 600000; g.settleTime();
  assert.equal(g.timeState.bakerProgress, 150000); assert.deepEqual(plain(g.ingredients), {});
  snapshot(h); const raw = h.values.get('gameState'); h.clock.now += 600000; g.settleTime();
  assert.equal(Object.values(g.ingredients).reduce((s, i) => s + i.count, 0), 2); assert.equal(g.timeState.bakerProgress, 0);
  const closed = harness({ gameState: raw }); closed.clock.now = h.clock.now;
  assert.equal(closed.game.loadGame(), true); assert.deepEqual(plain(closed.game.ingredients), plain(g.ingredients));
  assert.equal(closed.game.timeState.randomState, g.timeState.randomState);
  closed.game.settleTime(); assert.deepEqual(plain(closed.game.ingredients), plain(g.ingredients));
});

test('Baker ordinary and large-batch generation conserve two units per owner with unchanged probability identity', () => {
  const h = baker(), g = h.game; g.items.baker.count = 3;
  const values = [0.1, 0.49, 0.51, 0.84, 0.86, 0.99]; g.produceBakerResources(() => values.shift());
  assert.deepEqual(plain(g.ingredients), { Dough: { count: 2 }, Sugar: { count: 2 }, Chocolate: { count: 2 } });
  assert.deepEqual(plain(g.ingredientTypes.map((i) => i.rarity)), [0.5, 0.35, 0.15]);
  assert.equal(g.bakerProductionInterval, 300000);
  g.items.baker.count = 1000; g.ingredients = {}; let draws = 0;
  g.produceBakerResources(() => { draws++; return 0.5; });
  assert.equal(Object.values(g.ingredients).reduce((s, i) => s + i.count, 0), 2000); assert.ok(draws < 30);
});
