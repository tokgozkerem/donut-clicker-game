// Presentation visibility must never become an economic policy boundary.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');
const plain = (value) => JSON.parse(JSON.stringify(value));

function farm(open = false) {
  const h = harness(), g = h.game;
  g.loadGame(); g.items.farm.count = 60; g.donutCount = 1e6;
  g.updateFarmDisplay = h.methods.updateFarmDisplay;
  g.closePanel = h.methods.closePanel;
  g._forceBarnFullRender = h.methods._forceBarnFullRender;
  g.footerContainer = h.document.getElementById('footer-container');
  const panels = ['farm', 'mine', 'baker'].map((name) => h.document.getElementById(name + '-panel'));
  panels.forEach((panel) => panel.classList.add('hidden'));
  const queryAll = h.document.querySelectorAll;
  h.document.querySelectorAll = (selector) => selector === '.footer-panel' ? panels : queryAll(selector);
  g.footerContainer.classList.add('hidden');
  if (open) g.openPanel('farm');
  return h;
}
function spy(g, method) { let count = 0; g[method] = () => count++; return () => count; }
function displayTicks(h) { for (let i = 0; i < 100; i++) h.game.updateFarmDisplay(); }

test('closed Contracts receives zero recurring renders, including initial offscreen footer', () => {
  const h = farm(), g = h.game; g.farmActiveTab = 'contracts';
  const count = spy(g, 'updateFarmContractsTab');
  displayTicks(h); assert.equal(count(), 0);
  // A panel class alone is insufficient: the containing footer must be open too.
  h.document.getElementById('farm-panel').classList.remove('hidden');
  displayTicks(h); assert.equal(count(), 0);
});

test('closed Collection, Barn and Breeding bodies receive zero recurring renders', () => {
  const h = farm(), g = h.game;
  for (const [tab, renderer] of [['collection', 'updateFarmCollectionTab'],
    ['barn', 'updateFarmBarnTab'], ['breeding', 'updateFarmBreedingTabSmart']]) {
    g.farmActiveTab = tab; const count = spy(g, renderer);
    displayTicks(h); assert.equal(count(), 0, tab);
  }
  const barn = spy(g, 'updateFarmBarnTab');
  const grid = h.document.getElementById('farm-animal-grid');
  grid.innerHTML = 'last visible roster'; grid.dataset.rosterSignature = 'old';
  g._forceBarnFullRender(); assert.equal(barn(), 0, 'direct Barn invalidation while closed');
  assert.equal(grid.innerHTML, 'last visible roster');
  assert.equal(grid.dataset.rosterSignature, undefined);
  g.farmActiveTab = 'barn'; g.openPanel('farm'); assert.equal(barn(), 1);
});

test('visible Contracts retains desktop/mobile refresh cadence', () => {
  for (const interval of [120, 180]) {
    const h = farm(true), g = h.game; g.farmActiveTab = 'contracts';
    g.activeFarmUiUpdateInterval = interval;
    const count = spy(g, 'updateFarmContractsTab');
    g.lastFarmUiUpdateTime = h.clock.now;
    for (let i = 1; i <= 10; i++) {
      h.clock.now += interval - 1; g.updateProduction(); assert.equal(count(), i - 1);
      h.clock.now++; g.updateProduction(); assert.equal(count(), i);
    }
  }
});

test('opening Farm refreshes the selected tab and KPIs synchronously once, even before next cadence', () => {
  const h = farm(), g = h.game; g.farmActiveTab = 'collection';
  const count = spy(g, 'updateFarmCollectionTab'), kpis = spy(g, 'updateFarmKPIs');
  g.lastFarmUiUpdateTime = h.clock.now;
  g.openPanel('farm'); assert.equal(count(), 1); assert.equal(kpis(), 1);
  g.closePanel(); g.openPanel('farm'); assert.equal(count(), 2);
});

test('close and switching to another panel stop the next scheduled refresh immediately', () => {
  const h = farm(true), g = h.game; g.farmActiveTab = 'contracts';
  const count = spy(g, 'updateFarmContractsTab');
  g.updateFarmDisplay(); assert.equal(count(), 1);
  h.context.setTimeout(() => g.updateFarmDisplay(), 1);
  g.closePanel(); h.runTimers(1); displayTicks(h); assert.equal(count(), 1);
  g.openPanel('farm'); assert.equal(count(), 2);
  g.openPanel('baker'); displayTicks(h); assert.equal(count(), 2);
});

test('real tab listeners immediately render each newly selected tab while open', () => {
  const h = farm(true), g = h.game;
  const tabs = ['barn', 'contracts', 'collection', 'breeding'].map((name) => {
    const tab = h.document.createElement('button'); tab.dataset.tab = name; return tab;
  });
  const contents = tabs.map((tab) => { const node = h.document.createElement('div'); node.dataset.tab = tab.dataset.tab; return node; });
  const queryAll = h.document.querySelectorAll;
  h.document.querySelectorAll = (selector) => selector === '.farm-tab' ? tabs :
    selector === '.farm-tab-content' ? contents : queryAll(selector);
  const counts = ['updateFarmBarnTab', 'updateFarmContractsTab', 'updateFarmCollectionTab',
    'updateFarmBreedingTabSmart'].map((method) => spy(g, method));
  g.setupFarmTabs();
  tabs.forEach((tab, i) => {
    tab.listeners.click(); assert.equal(g.farmActiveTab, tab.dataset.tab);
    assert.equal(counts[i](), 1);
    assert.equal(contents[i].classList.contains('hidden'), false);
  });
});

function simulate(open, inactive = false) {
  const h = farm(open), g = h.game;
  g.timeState.randomState = 12345;
  g.farmState.animals = ['a', 'b'].map((id) => ({ id, type: 'chicken', name: id,
    traits: [], variant: null, passport: null, productionTimer: 0, feedPlan: 'standard', breedCooldown: 0 }));
  g.farmState.feedPlans.chicken = 'premium';
  g.farmState.mastery.level = 13;
  g.farmState.contracts.active = [{ id: 'progress', title: 'progress', type: 'rush', duration: 300,
    elapsed: 0, requirements: {}, progress: {}, affixes: [], reward: { donuts: 10, buff: null } }];
  assert.equal(g.startBreeding(0, 'a', 'b', 'quick'), true);
  // Near completion tests real completion, offspring RNG and post-program cooldowns.
  g.farmState.breeding.slots[0].progress = g.farmState.breeding.slots[0].duration - 20;
  g.farmActiveTab = 'contracts';
  if (inactive) { h.document.visibilityState = 'hidden'; g.setTimeVisibility(true); }
  for (let i = 0; i < 60; i++) { h.clock.now += 1000; g.updateProduction(); }
  return { state: plain({ farm: g.farmState, donuts: g.donutCount, earned: g.totalDonutsEarned,
    time: g.timeState, quests: g.quests, nextAnimalId: g.farmNextAnimalId }), g };
}

test('equal settlement produces identical Farm goods, feed, contracts, mastery, RNG and income open/closed', () => {
  for (const inactive of [false, true]) {
    const open = simulate(true, inactive), closed = simulate(false, inactive);
    assert.deepEqual(closed.state, open.state);
    // Mastery 11's existing +5% contract speed also applies at level 13.
    assert.ok(Math.abs(closed.state.farm.contracts.active[0].elapsed - (inactive ? 15.75 : 63)) < 1e-9);
    assert.ok(closed.state.farm.storage.egg > 0);
  }
});

test('breeding completes and cooldowns advance identically while Farm presentation sleeps', () => {
  const open = simulate(true), closed = simulate(false);
  assert.equal(closed.state.farm.stats.totalBred, 1);
  assert.equal(closed.state.farm.animals.length, 3);
  assert.ok(closed.state.farm.animals[0].breedCooldown > 0);
  assert.deepEqual(closed.state.farm.breeding, open.state.farm.breeding);
  assert.deepEqual(closed.state.farm.animals, open.state.farm.animals);
});
