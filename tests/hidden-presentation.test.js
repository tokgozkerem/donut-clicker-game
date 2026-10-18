const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');
const plain = (v) => JSON.parse(JSON.stringify(v));
const near = (a, b) => assert.ok(Math.abs(a - b) <= Math.max(1, Math.abs(b)) * 1e-12, `${a} != ${b}`);

function fixture() {
  const h = harness(), g = h.game, raf = new Map(), intervals = new Map(); let id = 0; const callbacks = { autosaves: 0 };
  h.context.requestAnimationFrame = (fn) => { const key = ++id; raf.set(key, fn); return key; };
  h.context.cancelAnimationFrame = (key) => raf.delete(key);
  h.context.setInterval = (fn, ms) => { const key = ++id; intervals.set(key, { fn: () => { if (ms === 180000) callbacks.autosaves++; fn(); }, ms, at: h.clock.now + ms }); return key; };
  h.context.clearInterval = (key) => intervals.delete(key);
  const query = h.document.querySelector;
  h.document.querySelector = (s) => /^#[\w-]+$/.test(s) ? h.document.getElementById(s.slice(1)) : query(s);
  for (const name of ['updateDisplay', 'updateFarmDisplay', 'updateIngredientList', 'updateOreList',
    'updateMarketDisplay', 'updateQuestDisplay', 'updateFarmMasteryBadge', 'updatePurchaseLimitBadge']) g[name] = h.methods[name];
  g.footerContainer = h.document.getElementById('footer-container');
  g.footerContainer.classList.add('hidden');
  for (const key of ['mine', 'baker', 'farm']) h.document.getElementById(`${key}-panel`).classList.add('hidden');
  g.questsMenu = h.document.getElementById('quests-menu'); g.questsMenu.classList.add('hidden');
  h.document.getElementById('stats-menu').classList.add('hidden');
  g.drawSparkline = () => {}; // Canvas rasterization is outside this lifecycle harness.
  g.init(); g.items.baker.count = 100; g.donutCount = g.totalDonutsEarned = 0;
  g.timeState.randomState = 12345;
  const frame = () => { const batch = [...raf.values()]; raf.clear(); batch.forEach((fn) => fn(h.clock.now)); };
  frame();
  const visibility = (hidden) => { h.document.visibilityState = hidden ? 'hidden' : 'visible'; h.document.listeners.visibilitychange(); };
  const advance = (ms) => {
    const end = h.clock.now + ms;
    while (true) {
      const work = [...intervals].map(([key, t]) => ({ key, t, interval: true }))
        .concat([...h.timers].map(([key, t]) => ({ key, t: { ...t, at: t.at, fn: t.callback }, interval: false })))
        .filter((e) => e.t.at <= end).sort((a, b) => a.t.at - b.t.at)[0];
      if (!work) break;
      h.clock.now = work.t.at;
      if (work.interval) work.t.at += work.t.ms; else h.timers.delete(work.key);
      work.t.fn();
    }
    h.clock.now = end;
  };
  return { ...h, g, raf, intervals, callbacks, frame, visibility, advance };
}
function counter(object, name) {
  const original = object[name]; let n = 0;
  object[name] = function (...args) { n++; return original.apply(this, args); };
  return () => n;
}
function stats(f, open = true) { f.document.getElementById('stats-menu').classList.toggle('hidden', !open); }

test('hidden direct HUD, Farm, quest and resource presentation calls do no rendering', () => {
  const f = fixture(), { g } = f; f.visibility(true);
  const before = g.renderFrameCount;
  const nodes = ['donut-count', 'marketList', 'ingredientList', 'mine-timer', 'baker-timer'];
  const values = () => nodes.map((key) => { const n = f.document.getElementById(key); return [n.textContent, n.innerHTML]; });
  const saved = values();
  for (let i = 0; i < 10; i++) {
    g.updateDisplay(); g.flushDisplay(); g._actualUpdateDisplay(); g.updateFarmDisplay();
    g.updateQuestDisplay(); g.updateIngredientList(); g.updateOreList(); g.updateMarketDisplay();
    g.updateProductionDisplays(f.clock.now + 1000 * i);
  }
  assert.equal(g.renderFrameCount, before); assert.deepEqual(values(), saved); assert.equal(f.raf.size, 0);
});

test('Stats renders current open-view values synchronously without any pending RAF and skips closed views', () => {
  const f = fixture(); f.raf.clear(); stats(f);
  for (let i = 0; i < 20; i++) f.g.updateStatsDisplay();
  assert.equal(f.raf.size, 0);
  f.g.donutCount = 12345; f.g.updateStatsDisplay();
  assert.equal(f.document.getElementById('total-donuts').textContent, f.g.formatNumber(12345, 'count'));
  f.raf.clear(); stats(f, false); f.g.updateStatsDisplay(); assert.equal(f.raf.size, 0);
  stats(f); f.g.updateStatsDisplay(); stats(f, false); f.frame();
  assert.equal(f.raf.size, 0);
});

test('hidden presentation timers stop and pending RAF work cannot accumulate over 60 seconds', () => {
  const f = fixture(); stats(f); f.g.updateStatsDisplay(); f.g.updateDisplay();
  const title = counter(f.g, 'updateTitleWithDonuts'), coin = counter(f.g, 'updateDonutCoinDisplay');
  const requests = counter(f.g, 'updateStatsDisplay');
  f.visibility(true); f.advance(60000);
  assert.equal(title(), 0); assert.equal(coin(), 0); assert.equal(requests(), 0);
  assert.equal(f.raf.size, 0); assert.equal(f.intervals.size, 1); // Autosave remains.
  for (let i = 0; i < 20; i++) f.g.updateStatsDisplay();
  assert.equal(f.raf.size, 0);
});

test('visibility return refreshes open Stats once without stale captured values or a pageshow burst', () => {
  const f = fixture(); stats(f); f.g.updateStatsDisplay(); f.visibility(true); f.advance(60000);
  f.g.donutCount = 4321;
  const render = counter(f.g, 'updateStatsDisplay');
  f.visibility(false); const current = f.g.donutCount;
  assert.equal(render(), 1);
  assert.equal(f.document.getElementById('total-donuts').textContent, f.g.formatNumber(current, 'count'));
  f.window.listeners.pageshow(); f.frame(); assert.equal(render(), 1);
  assert.equal(f.raf.size, 1); // Only the running main scheduler.
});

test('DonutCoin readiness and title refresh on return without hidden polling or automatic claims', () => {
  const f = fixture(), { g } = f; g.hasDonutClicked = true;
  g.donutCoin.lastClaimTime = f.clock.now - g.donutCoin.claimInterval + 30000;
  g.updateDonutCoinDisplay(); g.updateTitleWithDonuts();
  const oldTitle = f.document.title, oldCoin = f.document.querySelector('.time-remaining').textContent;
  f.visibility(true); f.advance(60000);
  assert.equal(f.document.title, oldTitle); assert.equal(f.document.querySelector('.time-remaining').textContent, oldCoin);
  assert.equal(g.donutCoin.count, 0);
  f.visibility(false);
  assert.equal(f.document.querySelector('.time-remaining').textContent, 'Ready!');
  assert.equal(f.document.title, `${g.formatNumber(g.donutCount)} donuts - Donut Clicker`);
  assert.equal(g.donutCoin.count, 0);
});

test('hidden Mine/Baker phases and inventory advance while countdown DOM sleeps and refreshes on return', () => {
  const f = fixture(), { g } = f; g.items.mine.count = 1; g.openPanel('mine');
  g.timeState.mineProgress = g.timeState.bakerProgress = 0;
  g.updateProductionDisplays(f.clock.now);
  const before = ['mine-timer', 'baker-timer'].map((k) => f.document.getElementById(k).textContent);
  f.visibility(true); f.advance(600000);
  assert.deepEqual(['mine-timer', 'baker-timer'].map((k) => f.document.getElementById(k).textContent), before);
  f.visibility(false);
  near(g.timeState.mineProgress, 30000); near(g.timeState.bakerProgress, 150000);
  assert.equal(Object.values(g.ores).reduce((n, o) => n + o.count, 0), 10);
  assert.equal(String(f.document.getElementById('mine-timer').textContent), '30');
  assert.equal(String(f.document.getElementById('baker-timer').textContent), '150');
});

test('ten hidden minutes with retained autosaves credit exactly 25 percent and survive return', () => {
  const f = fixture(); f.visibility(true); f.advance(600000);
  assert.equal(f.callbacks.autosaves, 3); f.visibility(false); near(f.g.totalDonutsEarned, 15000);
  const saved = f.g.decodeSave(f.values.get('gameState')); assert.equal(saved.saveVersion, 1);
  assert.equal('_presentationSuspended' in saved, false); assert.equal('_presentationTimers' in saved, false);
  assert.equal(f.g.saveWritesBlocked, false);
});

test('repeated hidden saves preserve the continuous twelve-hour inactive cap', () => {
  const f = fixture(); f.visibility(true);
  for (const hours of [6, 5, 3]) { f.clock.now += hours * 3600000; assert.equal(f.g.saveGame({ silent: true }), true); }
  near(f.g.totalDonutsEarned, 100 * 12 * 3600 * .25);
  assert.equal(f.g.timeState.inactiveElapsed, 12 * 3600000);
  f.visibility(false); near(f.g.totalDonutsEarned, 1080000);
});

test('duplicate hide/pagehide and show/pageshow events neither duplicate credit nor restart inactive accounting', () => {
  const f = fixture(); f.clock.now += 1000; f.visibility(true); near(f.g.totalDonutsEarned, 100);
  f.advance(10000); f.window.listeners.pagehide(); assert.equal(f.g.timeState.inactiveElapsed, 10000);
  f.advance(10000); f.visibility(false); near(f.g.totalDonutsEarned, 600);
  const before = plain(f.g.timeState); f.window.listeners.pageshow(); f.visibility(false);
  near(f.g.totalDonutsEarned, 600); assert.deepEqual(plain(f.g.timeState), before);
});

test('hidden settlement keeps quest deadlines, breeding wall time and replay RNG equal to direct Time Consistency', () => {
  const results = [];
  for (const lifecycle of [false, true]) {
    const f = fixture(), { g } = f; g.items.farm.count = 30;
    g.farmState.animals = [{ id: 'a', type: 'chicken', name: 'a', traits: [], variant: null, productionTimer: 0, breedCooldown: 0 }];
    g.dynamicSlots.slot1.currentQuest = { id: 'timed', type: 'timedProduce', target: 1e12, startProduction: 0,
      timedStartTime: f.clock.now, timeLimit: 30000, completed: false, claimed: false };
    g.farmState.animals.push({ ...g.farmState.animals[0], id: 'b', name: 'b' });
    g.donutCount = 1e9; assert.equal(g.startBreeding(0, 'a', 'b', 'quick'), true);
    g.farmState.breeding.slots[0].duration = 90;
    f.document.visibilityState = 'hidden';
    if (lifecycle) f.document.listeners.visibilitychange(); else g.setTimeVisibility(true);
    f.clock.now += 120000;
    if (lifecycle) { f.document.visibilityState = 'visible'; f.document.listeners.visibilitychange(); }
    else { g.setTimeVisibility(false); }
    assert.equal(g.dynamicSlots.slot1.currentQuest, null); assert.equal(g.farmState.breeding.slots[0].active, false);
    near(g.farmState.animals.find((a) => a.id === 'a').breedCooldown, 3570);
    assert.equal(g.dynamicSlots.slot1.cooldownEnd, f.clock.now - 90000 + g.dynamicSlots.slot1.cooldown);
    results.push(plain({ earned: g.totalDonutsEarned, farm: g.farmState, time: g.timeState, ingredients: g.ingredients }));
  }
  assert.deepEqual(results[0], results[1]);
});

test('hidden notifications/multiplier refreshes and repeated tooltips cannot build presentation RAF queues', () => {
  const f = fixture(); f.raf.clear();
  const store = f.document.querySelector('.store-item[data-item="baker"]'); store.removeEventListener = () => {};
  f.g.showItemInfo('baker'); f.g.showItemInfo('baker'); assert.equal(f.raf.size, 1);
  f.visibility(true);
  for (let i = 0; i < 20; i++) { f.g._showNotification('hidden'); f.g.updateActiveMultiplierDisplay(); f.g.showItemInfo('baker'); }
  assert.equal(f.raf.size, 0);
  f.g._showNotification('Storage warning retained', 6000, { storageWarning: true });
  assert.equal(f.g._pendingStorageWarning, 'Storage warning retained');
  f.visibility(false); assert.equal(f.g._pendingStorageWarning, null);
  assert.equal(f.notifications.includes('Storage warning retained'), true);
});

test('desktop/mobile Stats open immediately and a late delivered hidden scheduler callback does no orchestration', () => {
  const f = fixture(), g = f.g; stats(f, false); g.setupStatsMenu();
  f.document.getElementById('stats-button').listeners.click();
  assert.equal(f.document.getElementById('donuts-per-second').textContent, g.formatNumber(100, 'perSecond'));
  const loop = [...f.raf.values()][0], ticks = counter(g, 'updateProduction');
  f.visibility(true); loop(f.clock.now + 1000); assert.equal(ticks(), 0); assert.equal(f.raf.size, 0);
  f.visibility(false); g.isMobile = true; stats(f, false);
  const button = f.document.getElementById('stats-btn'); button.id = 'stats-btn';
  f.document.querySelectorAll = (s) => s === '.header-menu-btn' ? [button] : [];
  f.methods.setupMobileMenus.call(g); button.listeners.click({ preventDefault() {} });
  assert.equal(f.document.getElementById('stats-menu').classList.contains('mobile-active'), true);
  assert.equal(f.document.getElementById('donuts-per-second').textContent, g.formatNumber(g.totalPerSecond, 'perSecond'));
});
