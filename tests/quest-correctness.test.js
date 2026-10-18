// Run with node --test tests/*.test.js. Real quest methods, fake DOM/storage/clock.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');
const json = (value) => JSON.parse(JSON.stringify(value));
function productive(h) {
  const g = h.game;
  g.items.baker.count = 100;
  g.items.farm.count = 100;
  g.donutCount = 1e8;
  g.fixBuildingCosts();
  return g;
}
function put(h, type = 'click', slotId = 'slot1') {
  const slot = h.game.dynamicSlots[slotId];
  const q = h.game.createDynamicQuest(type, slot);
  slot.currentQuest = q;
  slot.cooldownEnd = null;
  return q;
}
function satisfy(g, q) {
  switch (q.type) {
    case 'click': g.totalClicks = q.startClicks + q.target; break;
    case 'produce': case 'timedProduce': case 'multiplier':
      g.totalDonutsEarned = q.startProduction + q.target; break;
    case 'buyAny': g.items.cursor.count += q.target; break;
    case 'buySpecific': g.items[q.buildingType].count = q.startCount + q.target; break;
    case 'efficiency': g.items.capitalCrest.count = q.target; break;
    case 'combo':
      g.totalClicks = q.startClicks + q.clickTarget;
      g.totalDonutsEarned = q.startProduction + q.produceTarget; break;
    case 'spending': g.questTracking.currentRun.totalSpent = q.startSpent + q.target; break;
  }
}
function renderer(h) {
  const g = h.game;
  g.updateQuestDisplay = h.methods.updateQuestDisplay;
  h.document.getElementById('game-container').appendChild(g.questsMenu);
  const active = g.questsMenu.querySelector('.quests-container.active');
  active.className = 'quests-container active';
  const completed = g.questsMenu.querySelector('.quests-container.completed');
  completed.className = 'quests-container completed hidden';
  g.questsMenu.appendChild(active); g.questsMenu.appendChild(completed);
  g.questsMenu.classList.remove('hidden');
  return { active, completed };
}
function visibleIds(container) {
  return container.children.flatMap((section) => section.children.map((card) => card.dataset.questId));
}

for (const type of ['click','produce','buyAny','buySpecific','timedProduce','multiplier','efficiency','combo','spending']) {
  test(`generation/progress/completion: ${type}, finite reward and one completion`, () => {
    const h = harness(); const g = productive(h); const q = put(h, type, 'slot5');
    assert.ok(Number.isFinite(q.target) && q.target > 0);
    assert.ok(g.isValidQuestReward(q.reward));
    if (q.reward.type === 'donuts') assert.ok(q.reward.amount > 1, 'productive generation must not use an initialization floor');
    g.checkDynamicQuestProgress();
    assert.equal(q.completed, false);
    assert.ok(Number.isFinite(q.progress) && q.progress >= 0);
    satisfy(g, q);
    g.checkDynamicQuestProgress();
    assert.equal(q.completed, true);
    assert.ok(q.progress >= q.target);
    assert.equal(g.questTracking.currentRun.questsCompleted, 1);
    g.checkDynamicQuestProgress(); g.checkDynamicQuestProgress();
    assert.equal(g.questTracking.currentRun.questsCompleted, 1);
  });
}

test('expired zero-CPS history does not freeze a loaded productive reward at 1', () => {
  const h = harness(); const g = productive(h); g.loadGame();
  g.cpsHistory = [{ cps: 0, time: h.clock.now - 120001 }];
  const q = g.milestoneQuests.production[250];
  q.completed = true; q.frozenReward = null;
  assert.equal(g.getStableCPS(), g.calculatePerSecond());
  const expected = g.calculateMilestoneRewardEstimate('production', q, 250);
  assert.ok(expected > 1);
  assert.equal(g.saveGame({ silent: true }), true);
  const loaded = h.newGame();
  assert.equal(loaded.loadGame(), true);
  assert.equal(loaded.milestoneQuests.production[250].frozenReward, expected);
  assert.equal(loaded.donutCount, g.donutCount);
});

test('expired/invalid history falls back to authoritative CPS; valid median policy remains', () => {
  const h = harness(); const g = productive(h);
  g.cpsHistory = [{ cps: 0, time: h.clock.now - 120001 }, { cps: NaN, time: h.clock.now }];
  assert.equal(g.getStableCPS(), g.calculatePerSecond());
  const q = put(h, 'produce'); assert.ok(q.reward.amount > 1);
  g.cpsHistory = [{ cps: 0, time: h.clock.now - 1000 }, { cps: 10, time: h.clock.now }];
  assert.equal(g.getStableCPS(), 5); // Legitimate within-window history is not overridden.
  g.cpsHistory = [{ cps: Number.MAX_VALUE, time: h.clock.now }, { cps: Number.MAX_VALUE, time: h.clock.now }];
  assert.equal(g.getStableCPS(), Number.MAX_VALUE);
});

test('legitimate 1-donut early rewards remain; no reward floors/coefficients were raised', () => {
  const h = harness(); const q = put(h);
  assert.equal(q.reward.amount, 1);
  const m = h.game.milestoneQuests.building.cursor[1];
  assert.equal(h.game.calculateMilestoneRewardByType('building', m, 'cursor', 1), 1);
});

test('hydration prevents quest generation/freezing before authoritative state is ready', () => {
  const h = harness(); const g = productive(h); g.loadGame();
  const q = put(h, 'produce');
  assert.equal(g.saveGame({ silent: true }), true);
  const loaded = h.newGame();
  const hydrate = loaded.hydrateMilestoneQuestState;
  loaded.hydrateMilestoneQuestState = function (...args) {
    assert.equal(this._questStateLoading, true);
    assert.equal(this.generateQuestForSlot('slot2'), false);
    assert.equal(this.createDynamicQuest('produce', this.dynamicSlots.slot2), null);
    assert.equal(this.freezeMilestoneReward('production', this.milestoneQuests.production[250], 250), null);
    return hydrate.apply(this, args);
  };
  assert.equal(loaded.loadGame(), true);
  assert.deepEqual(json(loaded.dynamicSlots.slot1.currentQuest), json(q));
  assert.equal(loaded.dynamicSlots.slot2.currentQuest, null);
});

test('missing frozen reward uses restored CPS, prices, recipes and prestige exactly once', () => {
  const h = harness(); const g = productive(h); g.loadGame();
  g.prestigeCount = 2; g.recipes['Classic Donut'].craftCount = 3;
  g.startQuestMultiplier(2, 10000);
  const q = g.milestoneQuests.production[250]; q.completed = true;
  const expected = g.calculateMilestoneRewardEstimate('production', q, 250);
  const cps = g.calculatePerSecond();
  g.items.baker.baseCost = 1; g.items.farm.baseCost = 1; // Valid old cache fields, not economic authority.
  assert.equal(g.saveGame({ silent: true }), true);
  const loaded = h.newGame();
  const estimate = loaded.calculateMilestoneRewardEstimate;
  let seen = 0;
  loaded.calculateMilestoneRewardEstimate = function (...args) {
    assert.equal(this.calculatePerSecond(), cps);
    assert.equal(this.items.baker.baseCost, this.items.baker.originalBaseCost * this.items.baker.costMultiplier ** 100);
    seen++;
    return estimate.apply(this, args);
  };
  assert.equal(loaded.loadGame(), true);
  assert.equal(loaded.milestoneQuests.production[250].frozenReward, expected);
  assert.equal(seen, 1);
});

test('dynamic preview equals payout and rapid/duplicate/legacy claims pay once', () => {
  const h = harness(); const g = productive(h); const q = put(h);
  const before = g.donutCount, earned = g.totalDonutsEarned;
  assert.equal(g.claimDynamicReward('slot1'), false);
  satisfy(g, q); g.checkDynamicQuestProgress();
  const preview = q.reward.amount;
  assert.ok(g.renderDynamicSlot(g.dynamicSlots.slot1).innerHTML.includes(`Reward: ${g.formatNumber(preview)}`));
  assert.equal(g.claimQuestReward(q), true); // Legacy entry point delegates to the live slot.
  assert.equal(g.claimQuestReward(q), false);
  assert.equal(g.claimDynamicReward('slot1'), false);
  assert.equal(g.donutCount - before, preview);
  assert.equal(g.totalDonutsEarned, earned);
  assert.equal(g.questTracking.currentRun.questsCompleted, 1);
  assert.equal(g.getTotalCompletedQuests(), 1);
});

test('milestone preview is exact when completed, frozen and claimable once', () => {
  const h = harness(); const g = productive(h);
  const q = g.milestoneQuests.building.baker[1];
  assert.equal(q.completed, false);
  const before = g.donutCount;
  g.claimMilestoneReward('building', 'baker', 1);
  assert.equal(g.donutCount, before);
  g.checkMilestoneProgress();
  const reward = q.frozenReward;
  const html = g.createMilestoneElement(q, 'building', 'baker', 1).innerHTML;
  assert.ok(html.includes(`Reward: ${g.formatNumber(reward)} donuts`));
  assert.ok(!html.includes('Reward: ~'));
  g.cpsHistory = []; g.items.baker.count += 500; g.fixBuildingCosts();
  assert.equal(g.calculateMilestoneRewardByType('building', q, 'baker', 1), reward);
  assert.equal(g.claimMilestoneReward('building', 'baker', 1), true);
  g.claimMilestoneReward('building', 'baker', 1);
  assert.equal(g.donutCount - before, reward);
  assert.equal(g.getTotalCompletedQuests(), 1);
});

test('failed donut or multiplier delivery does not consume a claim or start cooldown', () => {
  const h = harness(); const g = h.game;
  const q = put(h); satisfy(g, q); g.checkDynamicQuestProgress();
  const credit = g.creditDonuts; g.creditDonuts = () => false;
  assert.equal(g.claimDynamicReward('slot1'), false);
  assert.equal(q.claimed, false); assert.equal(g.dynamicSlots.slot1.currentQuest, q);
  assert.equal(g.dynamicSlots.slot1.cooldownEnd, null);
  const m = g.milestoneQuests.clicks[25]; g.checkMilestoneProgress();
  assert.equal(m.completed, true);
  assert.equal(g.claimMilestoneReward('clicks', 25), false); assert.equal(m.claimed, false);
  g.creditDonuts = credit;
  assert.equal(g.claimDynamicReward('slot1'), true);
  const buff = put(h, 'multiplier', 'slot5'); satisfy(g, buff); g.checkDynamicQuestProgress();
  g.startQuestMultiplier(2, 10000); g.applyMultiplierReward(3, 10000);
  assert.equal(g.claimDynamicReward('slot5'), false); assert.equal(buff.claimed, false);
  h.clock.now += 10000;
  assert.equal(g.claimDynamicReward('slot5'), true);
  assert.equal(g.multiplierState.queued.amount, buff.reward.amount);
});

test('replacement generation happens once after cooldown and cannot overwrite active quests', () => {
  const h = harness(); const g = h.game; const q = put(h);
  assert.equal(g.generateQuestForSlot('slot1'), false);
  satisfy(g, q); g.checkDynamicQuestProgress(); g.claimDynamicReward('slot1');
  const deadline = g.dynamicSlots.slot1.cooldownEnd;
  assert.equal(g.generateQuestForSlot('slot1'), false);
  h.clock.now = deadline - 1; g.updateDynamicSlots();
  assert.equal(g.dynamicSlots.slot1.currentQuest, null);
  h.clock.now = deadline; g.updateDynamicSlots();
  const replacement = g.dynamicSlots.slot1.currentQuest;
  assert.ok(replacement); assert.notEqual(replacement.id, q.id);
  g.updateDynamicSlots(); g.updateDynamicSlots();
  assert.equal(g.dynamicSlots.slot1.currentQuest, replacement);
  replacement.completed = true;
  assert.equal(g.claimDynamicReward('slot1', q.id), false); // Detached button identity.
  assert.equal(replacement.claimed, false);
});

test('timed quests cannot complete after deadline via click/progress-only checks', () => {
  const h = harness(); const g = h.game; const q = put(h, 'timedProduce', 'slot4');
  h.clock.now += q.timeLimit + 1;
  g.settleTime(); // Real late income actions settle/expire the preceding interval first.
  g.totalDonutsEarned = q.target;
  g.checkDynamicQuestProgress();
  assert.equal(q.completed, false);
  assert.equal(g.dynamicSlots.slot4.currentQuest, null);
  const deadline = g.dynamicSlots.slot4.cooldownEnd;
  g.updateDynamicSlots(); g.checkDynamicQuestProgress();
  assert.equal(g.dynamicSlots.slot4.cooldownEnd, deadline);
  assert.equal(h.notifications.filter((s) => s.includes('Timed quest expired')).length, 1);
  assert.equal(g.questTracking.currentRun.questsCompleted, 0);
});

test('timed completion at the deadline latches and stays claimable after time expires', () => {
  const h = harness(); const g = h.game; const q = put(h, 'timedProduce', 'slot4');
  h.clock.now += q.timeLimit; g.totalDonutsEarned = q.target;
  g.checkDynamicQuestProgress(); assert.equal(q.completed, true);
  h.clock.now += 60000; g.updateDynamicSlots();
  assert.equal(g.dynamicSlots.slot4.currentQuest, q);
  assert.equal(g.claimDynamicReward('slot4'), true);
});

test('production progress uses existing earned-counter classification and canonical CPS', () => {
  const h = harness(); const g = productive(h);
  g.startQuestMultiplier(2, 60000);
  const q = put(h, 'produce'); const e = put(h, 'efficiency', 'slot2');
  const cps = g.calculatePerSecond();
  g.lastHeavyUpdateTime = h.clock.now; g.tickFarm = () => {};
  g.updateProduction(h.clock.now, 1);
  g.checkDynamicQuestProgress();
  assert.equal(q.progress, cps);
  assert.equal(e.progress, cps);
  g.checkMilestoneProgress();
  assert.equal(g.milestoneQuests.production[250].progress, 250); // Latched at its chronological completion boundary.
  assert.equal(g.milestoneQuests.cps[1].progress, cps);
});

test('spending quests use rounded actual building charges, including bulk purchases', () => {
  const h = harness(); const g = h.game; g.donutCount = 100000;
  const q = put(h, 'spending', 'slot4');
  const before = g.donutCount;
  g.buyItem('cursor'); g.buyItem('cursor');
  assert.equal(before - g.donutCount, 33); // 15 + ceil(17.25).
  assert.equal(g.questTracking.currentRun.totalSpent, 33);
  g.purchaseAmount = 10; g.buyItem('cursor');
  g.checkDynamicQuestProgress();
  assert.equal(g.questTracking.currentRun.totalSpent, before - g.donutCount);
  assert.equal(q.progress, before - g.donutCount);
});

test('progress is finite/nonnegative, combo requires BOTH objectives, completion stays latched', () => {
  const h = harness(); const g = h.game; const q = put(h, 'combo', 'slot3');
  g.totalClicks = q.clickTarget; g.checkDynamicQuestProgress();
  assert.equal(q.progress, 0); assert.equal(q.completed, false);
  g.totalDonutsEarned = q.produceTarget / 2; g.checkDynamicQuestProgress();
  assert.equal(q.progress, 50);
  g.totalDonutsEarned = q.produceTarget; g.checkDynamicQuestProgress();
  assert.equal(q.completed, true); assert.equal(q.progress, 100);
  g.totalClicks = 0; g.totalDonutsEarned = 0; g.checkDynamicQuestProgress();
  assert.equal(q.progress, 100);
  const buy = put(h, 'buySpecific', 'slot1');
  buy.startCount = 100; g.items[buy.buildingType].count = 0; g.checkDynamicQuestProgress();
  assert.equal(buy.progress, 0);
  buy.buildingType = 'missing'; g.checkDynamicQuestProgress(); assert.equal(buy.progress, 0);
  for (const [progress, target] of [[NaN,10],[-1,10],[10,0],[Infinity,10],[1e308,1e-300]]) {
    const percent = g.questProgressPercent(progress,target);
    assert.ok(Number.isFinite(percent) && percent >= 0 && percent <= 100);
  }
});

test('completed CPS milestones do not visually regress when a temporary buff expires', () => {
  const h = harness(); const g = h.game; g.items.baker.count = 1;
  g.startQuestMultiplier(10, 1000); g.checkMilestoneProgress();
  const q = g.milestoneQuests.cps[10], reward = q.frozenReward;
  assert.equal(q.completed, true);
  h.clock.now += 1001; g.checkMilestoneProgress();
  assert.equal(q.completed, true); assert.equal(q.progress, 10);
  assert.equal(q.frozenReward, reward);
});

for (const state of ['active','completed','cooldown']) {
  test(`save/load preserves ${state} quest lifecycle, timers, rewards and counters`, () => {
    const h = harness(); const g = productive(h); g.loadGame();
    const q = put(h, 'timedProduce', 'slot4');
    g.totalDonutsEarned = 10; g.checkDynamicQuestProgress();
    if (state !== 'active') { satisfy(g,q); g.checkDynamicQuestProgress(); }
    if (state === 'cooldown') g.claimDynamicReward('slot4');
    g.startQuestMultiplier(2, 10000); g.applyMultiplierReward(3, 20000);
    const before = json({ slot:g.dynamicSlots.slot4, counter:g.questTracking.currentRun.questsCompleted,
      multipliers:g.multiplierState, balance:g.donutCount });
    assert.equal(g.saveGame({silent:true}),true);
    const loaded = h.newGame(); assert.equal(loaded.loadGame(),true);
    assert.deepEqual(json({slot:loaded.dynamicSlots.slot4,counter:loaded.questTracking.currentRun.questsCompleted,
      multipliers:loaded.multiplierState,balance:loaded.donutCount}), before);
    loaded.checkDynamicQuestProgress();
    assert.equal(loaded.questTracking.currentRun.questsCompleted,before.counter);
  });
}

test('loading a frozen reward never recalculates it, grants it, or silently replaces value 1', () => {
  const h = harness(); const g = productive(h); g.loadGame();
  const q = g.milestoneQuests.production[250];
  q.completed=true; q.claimed=false; q.frozenReward=1; q.completionTime=h.clock.now;
  assert.equal(g.saveGame({silent:true}),true);
  const loaded = h.newGame();
  loaded.calculateMilestoneRewardEstimate = () => { throw new Error('Frozen entitlement recalculated'); };
  assert.equal(loaded.loadGame(),true);
  assert.equal(loaded.milestoneQuests.production[250].frozenReward,1);
  assert.equal(loaded.milestoneQuests.production[250].claimed,false);
  assert.equal(loaded.donutCount,g.donutCount);
});

test('old claimed slot normalizes to cooldown without a payout or replay', () => {
  const h=harness();const g=h.game;g.loadGame();const q=put(h);
  q.completed=true;q.claimed=true;g.questTracking.currentRun.questsCompleted=1;
  assert.equal(g.saveGame({silent:true}),true);
  const loaded=h.newGame();assert.equal(loaded.loadGame(),true);
  assert.equal(loaded.dynamicSlots.slot1.currentQuest,null);
  assert.equal(loaded.dynamicSlots.slot1.cooldownEnd,h.clock.now+loaded.dynamicSlots.slot1.cooldown);
  assert.equal(loaded.questTracking.currentRun.questsCompleted,1);
  assert.equal(loaded.donutCount,g.donutCount);
});

test('completed cards sort above all unfinished cards, with stable full/live rendering', () => {
  const h=harness();const g=h.game;const {active}=renderer(h);
  const incomplete=put(h,'click','slot1');const ready=put(h,'click','slot5');
  ready.completed=true;ready.progress=ready.target;
  g.items.baker.count=1;g.checkMilestoneProgress();
  g.updateQuestDisplay();
  const entries=g.getActiveQuestEntries();
  assert.equal(entries[0].id,'slot5');
  const visible=visibleIds(active);
  assert.equal(visible[0],ready.id);
  const readyCount=entries.filter((e)=>e.quest?.completed&&!e.quest.claimed).length;
  assert.ok(entries.slice(0,readyCount).every((e)=>e.quest.completed));
  assert.ok(visible.includes('baker_1'));
  assert.ok(visible.indexOf('baker_1') < visible.indexOf(incomplete.id));
  const state=json(g.dynamicSlots);
  g.isHoveringQuestMenu=true;
  for(let i=0;i<3;i++){g.updateQuestLiveElements();g.updateQuestDisplay();}
  assert.deepEqual(visibleIds(active),visible);
  assert.deepEqual(json(g.dynamicSlots),state);
  const card=active.querySelector(`[data-quest-id="${ready.id}"]`);
  assert.equal(card.classList.contains('completed'),true);
});

test('live completion reorders during hover; replacement shows new identity/reward', () => {
  const h=harness();const g=h.game;const {active}=renderer(h);
  put(h,'produce','slot1');const q=put(h,'click','slot5');g.updateQuestDisplay();
  satisfy(g,q);g.checkDynamicQuestProgress();g.isHoveringQuestMenu=true;
  g.updateQuestLiveElements();
  assert.equal(visibleIds(active)[0],q.id);
  const old=g.renderDynamicSlot(g.dynamicSlots.slot5);
  g.claimDynamicReward('slot5');h.clock.now=g.dynamicSlots.slot5.cooldownEnd;
  g.generateQuestForSlot('slot5');const next=g.dynamicSlots.slot5.currentQuest;
  next.completed=true;
  old.querySelector('.claim-reward').listeners.click();
  assert.equal(next.claimed,false);
  g.updateQuestLiveElements();
  assert.ok(visibleIds(active).includes(next.id));
  const card=active.querySelector(`[data-quest-id="${next.id}"]`);
  assert.ok(card.innerHTML.includes(g.formatNumber(next.reward.amount)));
});

test('all completed milestones are visible ahead of the next in-progress tier', () => {
  const h=harness();const g=h.game;const {active}=renderer(h);
  g.items.cursor.count=50;g.checkMilestoneProgress();g.updateQuestDisplay();
  const ids=visibleIds(active);
  for(const tier of [1,10,25,50]) assert.ok(ids.includes(`cursor_${tier}`));
  assert.ok(ids.indexOf('cursor_50')<ids.indexOf('cursor_75'));
});

test('rendering, timers and tab switches never generate, freeze, credit or change quests', () => {
  const h=harness();const g=productive(h);renderer(h);put(h,'produce');g.checkMilestoneProgress();
  const before=json({slots:g.dynamicSlots,milestones:g.milestoneQuests,tracking:g.questTracking,balance:g.donutCount});
  g.creditDonuts=()=>{throw new Error('UI credited reward');};
  g.generateQuestForSlot=()=>{throw new Error('UI generated quest');};
  g.freezeMilestoneReward=()=>{throw new Error('UI froze reward');};
  g.updateQuestDisplay();g.updateQuestLiveElements();g.switchQuestTab('completed');g.switchQuestTab('active');
  assert.deepEqual(json({slots:g.dynamicSlots,milestones:g.milestoneQuests,tracking:g.questTracking,balance:g.donutCount}),before);
});

test('upgrade milestones are all reachable; removed historical entitlements remain claimable', () => {
  const h=harness();const g=h.game;g.loadGame();
  const max=Object.values(g.upgrades).reduce((sum,list)=>sum+list.length,0);
  assert.equal(max,73);assert.ok(g.upgradeMilestones.every((n)=>n<=max));
  for(const list of Object.values(g.upgrades)) for(const u of list)u.purchased=true;
  g.checkMilestoneProgress();
  assert.ok(Object.values(g.milestoneQuests.upgrades).every((q)=>q.completed));
  g.milestoneQuests.upgrades[75]={progress:75,completed:true,claimed:false,frozenReward:123,completionTime:h.clock.now};
  g.milestoneQuests.upgrades[100]={progress:0,completed:false,claimed:false,frozenReward:null};
  assert.equal(g.saveGame({silent:true}),true);
  const loaded=h.newGame();assert.equal(loaded.loadGame(),true);
  assert.equal(loaded.milestoneQuests.upgrades[100],undefined);
  assert.equal(loaded.milestoneQuests.upgrades[75].retired,true);
  const before=loaded.donutCount;assert.equal(loaded.claimMilestoneReward('upgrades',75),true);
  loaded.claimMilestoneReward('upgrades',75);assert.equal(loaded.donutCount-before,123);
});

test('quest transitions checkpoint without defeating 15-second automatic-purchase batching', () => {
  const h=harness();const g=h.game;g.loadGame();g.donutCount=1e6;
  g.buyItem('cursor',true);
  assert.equal(g._saveDeadline,h.clock.now+15000);
  h.runTimers(1000);assert.equal(h.values.has('gameState'),false);
  const q=put(h);satisfy(g,q);g.checkDynamicQuestProgress();
  assert.equal(g._saveDeadline,1800000000000+15000);
  g.claimDynamicReward('slot1');assert.equal(g._saveDeadline,h.clock.now+1000);
  h.runTimers(1000);assert.ok(h.values.has('gameState'));
});

test('missing legacy baselines preserve saved progress without counting the whole run', () => {
  for (const type of ['click','produce','buyAny','buySpecific','timedProduce','multiplier','combo','spending']) {
    const h=harness();const g=productive(h);g.loadGame();
    g.totalClicks=1000;g.totalDonutsEarned=100000;g.questTracking.currentRun.totalSpent=100000;
    const q=put(h,type,'slot5');q.progress=type==='combo'?25:1;
    if(type==='buySpecific') { g.items[q.buildingType].count+=5; g.fixBuildingCosts(); }
    for(const key of ['startClicks','startProduction','startBuildings','startCount','startSpent']) delete q[key];
    assert.equal(g.saveGame({silent:true}),true);
    const loaded=h.newGame();assert.equal(loaded.loadGame(),true);
    loaded.checkDynamicQuestProgress();const restored=loaded.dynamicSlots.slot5.currentQuest;
    assert.equal(restored.completed,false,type);
    assert.equal(restored.progress,q.progress,type);
    assert.equal(loaded.questTracking.currentRun.questsCompleted,0);
  }
});

test('explicit zero baselines and completed legacy receipts remain valid', () => {
  const h=harness();const g=h.game;g.loadGame();const q=put(h);
  q.startClicks=0;g.totalClicks=10;g.checkDynamicQuestProgress();
  assert.equal(g.saveGame({silent:true}),true);
  const loaded=h.newGame();assert.equal(loaded.loadGame(),true);
  assert.equal(loaded.dynamicSlots.slot1.currentQuest.startClicks,0);
  loaded.totalClicks=q.target;loaded.checkDynamicQuestProgress();
  assert.equal(loaded.dynamicSlots.slot1.currentQuest.completed,true);
});

test('invalid computed rewards never become fallback 1 or consume a slot', () => {
  const h=harness();const g=productive(h);
  g.calculateDynamicReward=()=>NaN;
  assert.equal(g.createDynamicQuest('produce',g.dynamicSlots.slot1),null);
  g.dynamicSlots.slot1.questPool=['produce'];
  assert.equal(g.generateQuestForSlot('slot1'),false);
  assert.equal(g.dynamicSlots.slot1.currentQuest,null);
  assert.equal(g.deliverQuestReward({type:'donuts',amount:NaN}),false);
  assert.equal(g.deliverQuestReward({type:'multiplier',amount:0,duration:1000}),false);
  const invalid=harness().game;invalid.items.capitalCrest.count=1e308;
  assert.equal(invalid.createDynamicQuest('produce',invalid.dynamicSlots.slot1),null);
  assert.equal(invalid.freezeMilestoneReward('production',invalid.milestoneQuests.production[250],250),null);
});
