// Real economic/HUD methods; controlled RAF delivery, clocks and storage.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');
const plain = (v) => JSON.parse(JSON.stringify(v));
const near = (a, b) => assert.ok(Math.abs(a - b) <= 1e-7 + Math.abs(b) * 1e-12, `${a} != ${b}`);
function equivalent(a, b, path = "state") {
  if (typeof b === 'number') { try { return near(a, b); } catch (e) { e.message = path + ': ' + e.message; throw e; } }
  if (!b || typeof b !== 'object') return assert.equal(a, b);
  assert.deepEqual(Object.keys(a), Object.keys(b));
  for (const k of Object.keys(b)) equivalent(a[k], b[k], path + "." + k);
}
function setup({ mobile = false, legacy = false, empty = false } = {}) {
  const h = harness();
  if (mobile) { h.window.innerWidth = 390; h.game = h.newGame(); }
  const g = h.game; g.loadGame(); g.items.baker.count = empty ? 0 : 100;
  g.timeState.randomState = 12345;
  h.context.Math = Object.create(Math); h.context.Math.random = () => 0.5;
  for (const slot of Object.values(g.dynamicSlots)) slot.cooldownEnd = h.clock.now + 1e9;
  g.updateDisplay = h.methods.updateDisplay; g.cacheElements();
  let id = 0; const rafs = new Map(), base = h.clock.now, metrics = { ticks: [], hud: [], auto: [] };
  h.context.requestAnimationFrame = (fn) => { rafs.set(++id, fn); return id; };
  h.context.cancelAnimationFrame = (key) => rafs.delete(key);
  for (const [name, key] of [['updateProduction', 'ticks'], ['_actualUpdateDisplay', 'hud'], ['checkAutoBuyer', 'auto']]) {
    const fn = g[name]; g[name] = function (...args) { metrics[key].push(h.clock.now - base); return fn.apply(this, args); };
  }
  if (legacy) {
    // Frozen V1 scheduling reference only. All simulation/mutation math stays real.
    g.startGameLoop = function () {
      const loop = (timestamp) => {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        this.accumulatedTime += timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        if (this.accumulatedTime >= this.frameThrottle) {
          this.accumulatedTime %= this.frameThrottle;
          this.updateProduction(h.clock.now);
        }
        this.gameLoopHandle = h.context.requestAnimationFrame(loop);
      };
      this.gameLoopHandle = h.context.requestAnimationFrame(loop);
    };
  }
  let frameIndex = 1;
  const frame = (at) => {
    h.runTimers(base + at - h.clock.now);
    const batch = [...rafs]; rafs.clear();
    for (const [, fn] of batch) fn(at);
  };
  return Object.assign(h, { metrics, base, frame,
    start: () => g.startGameLoop(),
    to(at) {
      while (frameIndex * (1000 / 60) <= at + 1e-8) frame(frameIndex++ * (1000 / 60));
      h.runTimers(Math.max(0, base + at - h.clock.now));
    },
    finish: () => g.settleTime(),
  });
}
function economic(g) {
  return plain({ balance: g.donutCount, earned: g.totalDonutsEarned, items: g.items,
    farm: g.farmState, ores: g.ores, ingredients: g.ingredients, market: g.oreTypes,
    allowance: g.orePurchaseLimit, mine: g.timeState.mineProgress, baker: g.timeState.bakerProgress,
    rng: g.timeState.randomState });
}
function pair(options, run) {
  const old = setup({ ...options, legacy: true }), current = setup(options);
  run(old); run(current); return { old, current };
}

test('ten seconds of passive income agrees with the frame-paced contract on desktop and mobile', () => {
  for (const mobile of [false, true]) {
    const { old, current } = pair({ mobile }, (h) => { h.start(); h.to(10000); h.finish(); });
    near(current.game.donutCount, 1000); equivalent(economic(current.game), economic(old.game));
    assert.ok(current.metrics.ticks.length < old.metrics.ticks.length / 4);
    assert.equal(current.game.heavyUpdateInterval, mobile ? 180 : 120);
  }
});

test('irregular/delayed frames settle actual elapsed time, including the pending tail', () => {
  const { old, current } = pair({}, (h) => {
    h.start(); for (const at of [17, 43, 179, 203, 997, 1777, 5103, 10000]) h.frame(at);
    h.finish();
  });
  near(current.game.donutCount, 1000); equivalent(economic(current.game), economic(old.game));
  // Wall rollback must not stall visible monotonic production/HUD scheduling.
  const h = setup(); h.start(); h.to(1000);
  h.context.Date.now = () => h.clock.now - 3600000;
  const ticks = h.metrics.ticks.length; h.to(2000);
  assert.ok(h.metrics.ticks.length > ticks);
  assert.ok(h.game.donutCount > 180); // Pending tail is bounded by one cadence.
  h.finish(); near(h.game.donutCount, 200);
});

test('purchase between passive ticks settles the old rate and requests next-frame HUD feedback', () => {
  const h = setup(), g = h.game; g.donutCount = 1e6;
  h.start(); h.to(60); const beforeHud = h.metrics.hud.length;
  h.to(65); g.buyItem('baker');
  near(g.totalDonutsEarned, 6.5); assert.equal(g.items.baker.count, 101);
  assert.equal(g._hudImmediate, true);
  h.to(84); assert.ok(h.metrics.hud.length > beforeHud);
  assert.equal(g.lastUpdateValues.buildingCounts.baker, 101);
  h.to(1000); h.finish(); near(g.totalDonutsEarned, 100 * 0.065 + 101 * 0.935);
});

test('multiplier expiry between orchestration ticks retains exact chronology', () => {
  const { old, current } = pair({}, (h) => {
    h.game.startQuestMultiplier(2, 5005); h.start(); h.to(10000); h.finish();
  });
  near(current.game.donutCount, 1500.5); equivalent(economic(current.game), economic(old.game));
});

test('auto-buyer keeps identical opportunity timestamps, purchase order, costs and ownership', () => {
  for (const mobile of [false, true]) {
    const { old, current } = pair({ mobile }, (h) => {
      const g = h.game; g.autoBuyer.enabled = true;
      for (const key of ['cursor', 'baker']) g.autoBuyer.settings[key] = { enabled: true, threshold: 1.5 };
      h.buys = []; const buy = g.buyItem;
      g.buyItem = function (key, automatic) { h.buys.push([h.clock.now - h.base, key, this.items[key].baseCost]); return buy.call(this, key, automatic); };
      h.start(); h.to(10000); h.finish();
    });
    assert.ok(current.buys.length > 0);
    assert.deepEqual(current.metrics.auto, old.metrics.auto); assert.deepEqual(current.buys, old.buys);
    equivalent(economic(current.game), economic(old.game));
  }
});

test('passive quest progress/completion receipts and timed expiry agree across cadences', () => {
  const { old, current } = pair({}, (h) => {
    for (const [slotId, type, target] of [['slot1', 'produce', 600], ['slot4', 'timedProduce', 2000]]) {
      const slot = h.game.dynamicSlots[slotId], q = h.game.createDynamicQuest(type, slot);
      Object.assign(q, { target, startProduction: 0, timedStartTime: h.clock.now, timeLimit: 5005 });
      slot.currentQuest = q;
    }
    h.start(); h.to(10000); h.finish();
  });
  assert.equal(current.game.dynamicSlots.slot1.currentQuest.completed, true);
  equivalent(plain(current.game.dynamicSlots), plain(old.game.dynamicSlots));
  equivalent(plain(current.game.milestoneQuests), plain(old.game.milestoneQuests));
});

test('passive HUD follows its own budget and unchanged zero-production HUD stays clean', () => {
  for (const mobile of [false, true]) {
    const h = setup({ mobile }); h.start(); h.to(10000);
    const budget = mobile ? 250 : 200;
    assert.equal(h.game.hudUpdateInterval, budget);
    assert.ok(h.metrics.hud.length > 20 && h.metrics.hud.length <= 10000 / budget + 1);
    for (let i = 1; i < h.metrics.hud.length; i++) assert.ok(h.metrics.hud[i] - h.metrics.hud[i - 1] >= budget - 0.001);
    assert.ok(h.metrics.hud.length < h.metrics.ticks.length);
  }
  const h = setup({ empty: true }); h.start(); h.to(10000);
  assert.ok(h.metrics.hud.length <= 2);
});

test('accepted clicks credit immediately and bypass passive HUD pacing without duplicate renders', () => {
  const h = setup(), g = h.game; h.start(); h.to(60);
  g.activeAnimationElements = g.MAX_ANIMATION_ELEMENTS;
  const reward = g.calculateClickValue(), renders = h.metrics.hud.length;
  g.handleDonutClick({ clientX: 1, clientY: 1 });
  near(g.donutCount, 100 * 0.06 + reward);
  assert.equal(g.totalClicks, 1); assert.equal(g._hudImmediate, true);
  g.updateDisplay(); g.updateDisplay(); // Coalesce same-task action requests.
  h.to(84); assert.equal(h.metrics.hud.length, renders + 1);
  assert.equal(g.lastUpdateValues.balance, g.donutCount);
});

test('Farm feed/contracts/breeding and Mine/Baker cycles preserve equal-elapsed state and RNG', () => {
  const { old, current } = pair({}, (h) => {
    const g = h.game; g.items.farm.count = 60; g.items.mine.count = 2; g.donutCount = 1e9;
    g.farmState.mastery = { level: 13, xp: 0 };
    g.farmState.animals = ['a', 'b'].map((id) => ({ id, type: 'chicken', name: id, traits: [],
      variant: null, passport: null, productionTimer: 0, breedCooldown: 0, feedPlan: 'standard' }));
    g.farmState.feedPlans.chicken = 'premium';
    g.startBreeding(0, 'a', 'b', 'quick');
    g.farmState.breeding.slots[0].progress = g.farmState.breeding.slots[0].duration - 150;
    g.farmState.contracts.active = [{ id: 'contract', title: 'contract', type: 'rush', duration: 200,
      elapsed: 0, requirements: {}, progress: {}, affixes: [], reward: { donuts: 10, buff: null } }];
    g.refreshOreMarketReference();
    h.start(); for (let at = 17; at < 300500; at += 173) h.frame(at);
    h.frame(300500); h.finish();
  });
  equivalent(economic(current.game), economic(old.game));
  assert.equal(current.game.timeState.randomState, old.game.timeState.randomState);
  assert.equal(current.game.farmState.stats.totalBred, 1);
  assert.equal(Object.values(current.game.ingredients).reduce((s, v) => s + v.count, 0), 200);
  assert.equal(Object.values(current.game.ores).reduce((s, v) => s + v.count, 0), 50);
});

test('prestige between passive ticks settles the old run once and preserves the new run', () => {
  const { old, current } = pair({}, (h) => {
    const g = h.game; g.totalDonutsEarned = 1; g.nextPrestigeThreshold = 1;
    const reset = g.resetRunStateForPrestige;
    g.resetRunStateForPrestige = function () { h.prePrestigeEarned = this.totalDonutsEarned; return reset.call(this); };
    h.start(); h.to(65); g.performPrestige();
    g.donutCount = 1000; g.buyItem('baker'); h.to(1000); h.finish();
    const balance = g.donutCount; h.finish(); assert.equal(g.donutCount, balance);
  });
  near(current.prePrestigeEarned, 7.5); near(current.game.totalDonutsEarned, 2 * 0.935);
  equivalent(economic(current.game), economic(old.game));
});

test('Farm/resource presentation checks retain their independent cadence on eligible frames', () => {
  const { old, current } = pair({}, (h) => {
    h.farmRenders = []; h.game.farmActiveTab = 'contracts';
    h.game.updateFarmDisplay = () => h.farmRenders.push(h.clock.now - h.base);
    h.start(); h.to(10000);
  });
  assert.deepEqual(current.farmRenders, old.farmRenders);
  assert.equal(current.game.lastTimerUiUpdateTime, old.game.lastTimerUiUpdateTime);
});

test('a production goal reached exactly at its deadline survives rounding; a real shortfall still expires', () => {
  for (const target of [600, 601]) {
    const { old, current } = pair({}, (h) => {
      const slot = h.game.dynamicSlots.slot4, q = h.game.createDynamicQuest('timedProduce', slot);
      Object.assign(q, { target, startProduction: 0, timedStartTime: h.clock.now, timeLimit: 6000 });
      slot.currentQuest = q; h.quest = q;
      h.start(); h.to(6400); h.finish();
    });
    assert.equal(current.quest.completed, target === 600);
    assert.equal(Boolean(current.game.dynamicSlots.slot4.currentQuest), target === 600);
    assert.equal(current.quest.completed, old.quest.completed);
    if (target === 600) near(current.quest.completionTime - current.base, 6000);
  }
});
