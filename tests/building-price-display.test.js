const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');

function fixture() {
  const h = harness(), g = h.game;
  g.loadGame(); g.cacheElements();
  return { ...h, g };
}
function display(h, key) {
  h.methods._actualUpdateDisplay.call(h.g);
  h.g.showItemInfo(key);
  const markup = h.document.getElementById('item-info-cost').innerHTML;
  const span = markup.match(/<span style="color: ([^;]+);">([^<]+)<\/span>/);
  assert.ok(span, 'item price exists');
  return {
    store: h.document.getElementById(`${key}Cost`).textContent,
    panel: span[2], color: span[1], affordable: h.g.lastUpdateValues.affordability[key],
  };
}

test('fractional next prices and affordability agree across store and info panel for all 11 buildings', () => {
  const h = fixture(), g = h.g;
  assert.equal(Object.keys(g.items).length, 11);
  for (const item of Object.values(g.items)) item.baseCost = 8613.2;
  for (const key of Object.keys(g.items)) {
    g.donutCount = 8613.5;
    const ui = display(h, key);
    assert.equal(ui.store, g.formatNumber(8614, 'cost'), key);
    assert.equal(ui.panel, ui.store, key);
    assert.equal(ui.affordable, false, key); assert.equal(ui.color, 'red', key);
    g.buyItem(key); assert.equal(g.items[key].count, 0, key); assert.equal(g.donutCount, 8613.5, key);
  }
});

test('displayed next price equals actual charge, including floating growth just above an integer', () => {
  for (const key of Object.keys(fixture().g.items)) {
    const h = fixture(), g = h.g, item = g.items[key];
    item.baseCost = 8613.000000000002; g.donutCount = 8614;
    const growth = item.costMultiplier, ui = display(h, key);
    assert.equal(ui.panel, g.formatNumber(8614, 'cost'), key); assert.equal(ui.panel, ui.store, key);
    assert.equal(ui.color, '#6f6', key); assert.equal(ui.affordable, true, key);
    g.buyItem(key);
    assert.equal(g.donutCount, 0, key); assert.equal(item.count, 1, key);
    assert.equal(item.baseCost, 8613.000000000002 * growth, key);
    assert.equal(g.questTracking.currentRun.totalSpent, 8614, key);
  }
});

test('exact-integer next costs remain unchanged for every building', () => {
  const h = fixture(), g = h.g;
  for (const item of Object.values(g.items)) item.baseCost = 8614;
  for (const key of Object.keys(g.items)) {
    g.donutCount = 8614;
    const ui = display(h, key);
    assert.equal(ui.store, g.formatNumber(8614, 'cost'), key); assert.equal(ui.panel, ui.store, key);
    assert.equal(g.calculateBulkPrice(g.items[key], 1), 8614, key);
  }
});

test('selected bulk amounts 1, 10 and 100 display and charge the same canonical total for all buildings', () => {
  for (const key of Object.keys(fixture().g.items)) {
    const h = fixture(), g = h.g; g.items[key].baseCost = 15.25;
    for (const amount of [1, 10, 100]) {
      g.setPurchaseAmount(amount);
      const item = g.items[key], count = item.count, rawCost = item.baseCost;
      let unrounded = 0, next = rawCost;
      for (let i = 0; i < amount; i++) { unrounded += next; next *= item.costMultiplier; }
      const charged = Math.ceil(unrounded); // Existing sum-then-ceil contract, never per-unit rounding.
      g.donutCount = charged + 100;
      const ui = display(h, key);
      assert.equal(ui.store, g.formatNumber(charged, 'cost'), `${key} x${amount}`);
      assert.equal(ui.panel, ui.store, `${key} x${amount}`);
      g.buyItem(key);
      assert.equal(g.donutCount, 100, `${key} x${amount}`);
      assert.equal(item.count, count + amount); assert.equal(item.baseCost, next);
    }
  }
});

test('store and tooltip share the existing bounded preview cache while affordability remains live', () => {
  const h = fixture(), g = h.g; g.items.farm.baseCost = 8613.2;
  let calls = 0; const calculate = g.calculateBulkPrice;
  g.calculateBulkPrice = function (...args) { calls++; return calculate.apply(this, args); };
  g.donutCount = 8613.5; display(h, 'farm'); const warmed = calls;
  g.donutCount = 8614;
  const ui = display(h, 'farm');
  assert.equal(calls, warmed); assert.equal(ui.affordable, true); assert.equal(ui.color, '#6f6');
  assert.equal(g.bulkPriceCache.size, 11);
  g.items.farm.baseCost = 8614.2;
  const changed = display(h, 'farm');
  assert.equal(calls, warmed + 1); assert.equal(changed.panel, g.formatNumber(8615, 'cost'));
  assert.equal(changed.affordable, false); assert.equal(changed.color, 'red');
});
