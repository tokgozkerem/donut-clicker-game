// Small structural guard for the literal-only extraction; no gameplay fixtures.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { harness } = require('./helpers/game-harness');

test('upgrades preserve legacy identities/order and the approved Economy V2.1 content', () => {
  const h = harness();
  const definitions = h.window.DonutClickerContent.createUpgradeDefinitions();
  const counts = Object.fromEntries(Object.entries(definitions).map(([category, upgrades]) => [category, upgrades.length]));
  assert.deepEqual(counts, { cursor: 8, baker: 7, farm: 5, mine: 5, factory: 5,
    logisticCenter: 5, powerPlant: 5, nature: 5, nonItemUpgrades: 7, donutUpgrades: 6,
    neuralNetworkBakery: 5, portal: 5, capitalCrest: 5 });
  // Pre-V2 fingerprint projected to exclude ONLY authorized ordinary cost/gate changes.
  // Cursor, utility and global definitions remain protected in full, including prices.
  const oldKeys = ['cursor', 'baker', 'farm', 'mine', 'factory', 'logisticCenter',
    'powerPlant', 'nature', 'nonItemUpgrades', 'donutUpgrades'];
  assert.deepEqual(Object.keys(definitions).slice(0, oldKeys.length), oldKeys);
  const legacy = Object.fromEntries(oldKeys.map(key => [key, definitions[key].map(u =>
    Object.fromEntries(Object.entries(u).filter(([field]) =>
      ['cursor', 'nonItemUpgrades', 'donutUpgrades'].includes(key) || !['cost', 'requirement'].includes(field))))]));
  assert.equal(createHash('sha256').update(JSON.stringify(legacy)).digest('hex'),
    '25012ae3a109705a873bcc129b499cc63f4ff2e3cffa47cbd70a0616773ac015');
  // Preserve every V2 identity/category/index; the 15 late icon extensions are now WEBP.
  const v2Identities = Object.fromEntries(Object.entries(definitions).map(([key, list]) =>
    [key, list.map(u => Object.fromEntries(Object.entries(u).filter(([field]) =>
      ['cursor', 'nonItemUpgrades', 'donutUpgrades'].includes(key) || !['cost', 'requirement'].includes(field))))]));
  assert.equal(createHash('sha256').update(JSON.stringify(v2Identities)).digest('hex'),
    '40b3b97f20b336dae418cf3d47f6e4957428b659c94ddd0a941bce8f62f49839');
  // Full V2.1 ordered content is also pinned; no unreviewed balance/text changes.
  const fingerprint = createHash('sha256').update(JSON.stringify(definitions)).digest('hex');
  assert.equal(fingerprint, '47eb541ee6aa7b871fb308c2a85995e0b9778ccbdb6750f52171219792adaa34');
  assert.equal(JSON.stringify(h.game.upgrades), JSON.stringify(definitions));
});

test('factory calls and Game instances never share mutable upgrade objects or purchase flags', () => {
  const h = harness(), first = h.game, second = h.newGame();
  const standalone = h.window.DonutClickerContent.createUpgradeDefinitions();
  function distinctTree(a, b) {
    if (!a || typeof a !== 'object') return;
    assert.notStrictEqual(a, b);
    for (const key of Object.keys(a)) distinctTree(a[key], b[key]);
  }
  distinctTree(first.upgrades, second.upgrades);
  distinctTree(first.upgrades, standalone);
  first.items.cursor.count = 1;
  first.donutCount = 100;
  first.buyUpgrade('cursor', 0);
  assert.equal(first.upgrades.cursor[0].purchased, true);
  assert.equal(second.upgrades.cursor[0].purchased, false);
  assert.equal(standalone.cursor[0].purchased, false);
  assert.equal(second.donutCount, 0);
});

test('extracted buildings preserve every ordered property of the pre-V2 literal', () => {
  const h = harness();
  const definitions = h.window.DonutClickerContent.createBuildingDefinitions();
  assert.deepEqual(Object.keys(definitions), ['cursor', 'baker', 'farm', 'mine', 'factory',
    'logisticCenter', 'powerPlant', 'nature', 'neuralNetworkBakery', 'portal', 'capitalCrest']);
  // Ordered JSON fingerprint captured before extraction: every key/value and property order.
  const fingerprint = createHash('sha256').update(JSON.stringify(definitions)).digest('hex');
  assert.equal(fingerprint, 'c54f7b1ee8d376834cf3e53563bf1fae97856bd7c66e5f34d60252894bdc9d08');
  assert.equal(JSON.stringify(h.game.items), JSON.stringify(definitions));
});

test('building factories and Game instances isolate counts, costs and production mirrors', () => {
  const h = harness(), first = h.game, second = h.newGame();
  const factory = h.window.DonutClickerContent.createBuildingDefinitions;
  const a = factory(), b = factory();
  function distinctTree(left, right) {
    if (!left || typeof left !== 'object') return;
    assert.notStrictEqual(left, right);
    for (const key of Object.keys(left)) distinctTree(left[key], right[key]);
  }
  distinctTree(a, b);
  distinctTree(first.items, second.items);
  distinctTree(first.items, a);
  const untouched = JSON.stringify(b);
  a.cursor.count++;
  a.mine.baseCost = 1;
  first.items.cursor.count++;
  first.items.mine.baseCost = 2;
  first.items.mine.production = 3;
  first.items.mine.originalProduction = 4;
  assert.equal(JSON.stringify(b), untouched);
  assert.equal(JSON.stringify(second.items), untouched);
  assert.equal(a.mine.production, b.mine.production);
  assert.equal(a.mine.originalProduction, b.mine.originalProduction);
});
