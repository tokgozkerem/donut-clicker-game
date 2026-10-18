// Focused deterministic balance checks; no randomized economy simulation.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers/game-harness');
const { definitions, fixture, representativeStates } = require('./helpers/quest-balance-fixtures');
const sample = (name) => fixture(definitions.find((d) => d.name === name));
const slot = (g, difficulty) => Object.values(g.dynamicSlots).find((s) => s.difficulty === difficulty);
const near = (a,b) => assert.ok(Math.abs(a-b) <= Math.max(1,Math.abs(b))*1e-12, `${a} != ${b}`);

test('click objectives stay within human bounds at every representative stage', () => {
  for (const h of representativeStates()) {
    const g=h.game;
    for (const difficulty of ['easy','medium','hard','special']) {
      const p=g.getDynamicQuestBalance(difficulty);
      const count=g.getQuestClickTarget(p,g.getGameStage());
      assert.ok(count>=p.baseClicks && count<=p.maxClicks);
      assert.ok(count<=900);
    }
  }
});

test('CPS and prestige cannot inflate physical click requirements beyond stage bounds', () => {
  const {game:g}=sample('Late');
  const before=g.createDynamicQuest('click',g.dynamicSlots.slot3).target;
  g.prestigeCount=50;
  assert.equal(g.createDynamicQuest('click',g.dynamicSlots.slot3).target,before);
  g.items.capitalCrest.count=1e200;
  assert.equal(g.createDynamicQuest('click',g.dynamicSlots.slot3).target,before);
  g.totalDonutsEarned=g.nextPrestigeThreshold;
  g.performPrestige();
  assert.equal(g.calculatePerSecond(),0);
  assert.equal(g.createDynamicQuest('click',g.dynamicSlots.slot1).target,80);
  assert.equal(g.createDynamicQuest('produce',g.dynamicSlots.slot1).target,120);
});

test('production goals follow easy/medium/hard completion bands and snapshot CPS', () => {
  for (const name of ['Early','Mid','Late']) {
    const {game:g}=sample(name), C=g.calculatePerSecond();
    for (const [difficulty,min,max] of [['easy',30,120],['medium',120,300],['hard',300,600]]) {
      const q=g.createDynamicQuest('produce',slot(g,difficulty));
      const seconds=q.target/C;
      assert.ok(seconds>=min && seconds<=max+1/C,`${name}/${difficulty}: ${seconds}`);
      near(q.target,Math.ceil(Math.max(2,C)*g.getDynamicQuestBalance(difficulty).seconds));
    }
  }
});

test('brief production buffs do not inflate planning, rewards or the flat Cursor exception', () => {
  const {game:g}=sample('Mid');
  const before=g.getQuestBalanceContext(), q=g.createDynamicQuest('produce',g.dynamicSlots.slot4);
  assert.ok(before.production.flatCPS>0);
  g.startQuestMultiplier(2,60000);
  const after=g.getQuestBalanceContext(), next=g.createDynamicQuest('produce',g.dynamicSlots.slot4);
  near(after.cps,before.cps);
  near(after.currentCPS,2*before.production.boostedCPS+before.production.flatCPS);
  assert.equal(next.target,q.target);assert.equal(next.reward.amount,q.reward.amount);
});

test('generated goals/rewards remain frozen after production growth', () => {
  const {game:g}=sample('Early-mid');
  const q=g.createDynamicQuest('produce',g.dynamicSlots.slot3);
  g.dynamicSlots.slot3.currentQuest=q;
  const target=q.target,reward=q.reward.amount;
  g.items.baker.count+=50;g.checkDynamicQuestProgress();
  assert.equal(q.target,target);assert.equal(q.reward.amount,reward);
});

test('spending goals fit the income budget and cannot rebate more than the sacrifice', () => {
  const {game:g}=sample('Mid'), s=g.dynamicSlots.slot4;
  const q=g.createDynamicQuest('spending',s),ctx=g.getQuestBalanceContext(),p=g.getDynamicQuestBalance(s.difficulty);
  assert.ok(q.target>=2*g.estimateBuyQuestCost(1,'buyAny'));
  assert.ok(q.target<=g.getQuestPurchaseBudget(ctx,p)+1);
  assert.ok(q.reward.amount<=q.target*p.bonusRate*0.3);
  near(q.target,Math.ceil(ctx.rate*p.seconds));
});

test('any-building rewards use a cheapest mixed basket and remain a rebate', () => {
  const {game:g}=sample('Early');
  const q=g.createDynamicQuest('buyAny',g.dynamicSlots.slot1);
  const estimate=g.estimateBuyQuestCost(q.target,'buyAny');
  const before=g.donutCount=10000;
  for(let i=0;i<q.target;i++) {
    const key=Object.keys(g.items).reduce((best,k)=>g.items[k].baseCost<g.items[best].baseCost?k:best,'cursor');
    g.buyItem(key);
  }
  const spent=before-g.donutCount;
  assert.ok(estimate<=spent);
  assert.ok(q.reward.amount<spent*0.1);
  assert.ok(q.target<=3);
});

test('specific-building plans account for escalation and meaningful attainable baskets', () => {
  for(const h of representativeStates()) {
    const g=h.game,p=g.getDynamicQuestBalance('medium'),ctx=g.getQuestBalanceContext();
    const q=g.createDynamicQuest('buySpecific',g.dynamicSlots.slot3);
    const cost=g.estimateBuildingPurchaseCost(q.buildingType,q.target);
    assert.ok(q.target>=1 && q.target<=5);
    assert.ok(cost<=g.getQuestPurchaseBudget(ctx,p));
    assert.ok(cost>=ctx.rate*p.seconds*0.75);
    assert.ok(cost/g.calculatePerSecond()>=120 && cost/g.calculatePerSecond()<=300);
    assert.ok(q.reward.amount<=cost*p.bonusRate*0.5);
  }
});

test('unaffordable or economically trivial purchase choices fall back to existing production', () => {
  const {game:g}=sample('Late');
  for(const item of Object.values(g.items))item.baseCost=1e100;
  const s=g.dynamicSlots.slot3;s.questPool=['buySpecific'];
  assert.equal(g.generateQuestForSlot(s.id),true);assert.equal(s.currentQuest.type,'produce');
  const fresh=sample('Prestiged higher').game;
  const ctx=fresh.getQuestBalanceContext(),p=fresh.getDynamicQuestBalance('easy');
  assert.equal(fresh.isQuestTypeSuitable('buyAny',ctx,p),false);
});

test('efficiency targets start above LIVE CPS and can be met by an affordable building', () => {
  const {game:g,clock}=sample('Mid');
  g.cpsHistory=[{cps:1,time:clock.now}]; // Current production is much higher than history.
  const ctx=g.getQuestBalanceContext(),p=g.getDynamicQuestBalance('easy');
  const q=g.createDynamicQuest('efficiency',g.dynamicSlots.slot2);
  assert.ok(q.target>ctx.currentCPS);
  assert.ok(q.target<=ctx.currentCPS+Math.max(0.1,ctx.currentCPS*0.05));
  const candidates=Object.keys(g.items).filter((k)=>g.items[k].baseCost<=g.getQuestPurchaseBudget(ctx,p));
  const key=candidates.reduce((best,k)=>ctx.production.buildings[k].perUnit>ctx.production.buildings[best].perUnit?k:best);
  g.donutCount=Math.ceil(g.items[key].baseCost)+1;g.buyItem(key);
  assert.ok(g.calculatePerSecond()>=q.target);
});

test('efficiency generation avoids a baseline that will disappear with an active buff', () => {
  const {game:g}=sample('Mid');g.startQuestMultiplier(2,10000);
  g.dynamicSlots.slot2.questPool=['efficiency'];
  assert.equal(g.generateQuestForSlot('slot2'),true);
  assert.equal(g.dynamicSlots.slot2.currentQuest.type,'produce');
});

test('timed production remains achievable from startup through late game within 60 seconds', () => {
  for(const g of [harness().game,sample('Early').game,sample('Late').game]) {
    const q=g.createDynamicQuest('timedProduce',g.dynamicSlots.slot4);
    assert.equal(q.timeLimit,60000);
    const attainableRate=g.calculatePerSecond()+2*g.calculateClickValue();
    assert.ok(q.target/attainableRate<=45.01);
    assert.ok(q.target/g.getQuestBalanceContext().rate<=45.5);
  }
});

test('representative reward value increases by difficulty without replacing production', () => {
  for(const h of representativeStates()) {
    const g=h.game,C=g.calculatePerSecond();let previous=0;
    for(const difficulty of ['easy','medium','hard']) {
      const q=g.createDynamicQuest('produce',slot(g,difficulty));
      const seconds=q.reward.amount/C;
      assert.ok(seconds>previous,`${h.name}: ${difficulty}`);
      assert.ok(seconds<=g.getDynamicQuestBalance(difficulty).maxCapSeconds);
      assert.ok(q.reward.amount<q.target*0.2);
      previous=seconds;
    }
  }
});

test('a cheap purchase benchmark cannot collapse a productive quest cap to a tiny payout', () => {
  const {game:g}=sample('Late');g.getNextMeaningfulPurchaseCost=()=>1;
  const C=g.calculatePerSecond();
  for(const difficulty of ['easy','medium','hard']) {
    const q=g.createDynamicQuest('produce',slot(g,difficulty));
    assert.ok(Math.abs(q.reward.amount/C-g.getDynamicQuestBalance(difficulty).minCapSeconds)<=1/C);
  }
});

test('stage floors cannot override a small transaction rebate cap; fresh rewards can stay 1', () => {
  const g=harness().game;
  assert.equal(g.createDynamicQuest('click',g.dynamicSlots.slot1).reward.amount,1);
  g.getGameStage=()=>8;
  const q=g.createDynamicQuest('buyAny',g.dynamicSlots.slot5), cost=g.estimateBuyQuestCost(q.target,'buyAny');
  assert.ok(q.reward.amount<cost*0.1);
  assert.ok(q.reward.amount<g.getDynamicRewardMinimum(8,'special'));
});

test('five slots prefer varied activities without duplicates when viable alternatives exist', () => {
  const {game:g}=sample('Mid');
  for(const id of Object.keys(g.dynamicSlots))assert.equal(g.generateQuestForSlot(id),true);
  const types=Object.values(g.dynamicSlots).map((s)=>s.currentQuest.type);
  assert.equal(new Set(types).size,5);
  const families=types.map((t)=>['produce','timedProduce','multiplier'].includes(t)?'production':
    ['click','combo'].includes(t)?'clicking':['buyAny','buySpecific','spending'].includes(t)?'purchasing':t);
  for(const family of new Set(families))assert.ok(families.filter((v)=>v===family).length<=2);
  assert.ok(new Set(families).size>=3);
});

test('max recurring cash caps across all five cooldowns remain supplementary', () => {
  const {game:g}=sample('Late');
  let fraction=0;
  for(const s of Object.values(g.dynamicSlots)) {
    const p=g.getDynamicQuestBalance(s.difficulty);
    const shortestWork=s.questPool.includes('timedProduce')?45:p.seconds;
    fraction+=p.maxCapSeconds/(shortestWork+s.cooldown/1000);
  }
  assert.ok(fraction<0.13,`${fraction} theoretical cap fraction`);
});

test('old oversized input is capped once while receipts, counters and rewards remain intact', () => {
  const h=sample('Mid'),g=h.game;g.loadGame();
  const q=g.createDynamicQuest('click',g.dynamicSlots.slot1);
  q.target=2000000;q.progress=10;q.reward.amount=1;g.totalClicks=q.startClicks+10;g.dynamicSlots.slot1.currentQuest=q;
  const combo=g.createDynamicQuest('combo',g.dynamicSlots.slot3);
  combo.clickTarget=1000000;g.dynamicSlots.slot3.currentQuest=combo;
  const completed=g.createDynamicQuest('click',g.dynamicSlots.slot5);
  completed.target=2000000;completed.progress=2000000;completed.completed=true;
  g.dynamicSlots.slot5.currentQuest=completed;
  const before=g.questTracking.currentRun.questsCompleted;
  assert.equal(g.saveGame({silent:true}),true);
  const loaded=h.newGame();assert.equal(loaded.loadGame(),true);
  const active=loaded.dynamicSlots.slot1.currentQuest;
  assert.equal(active.id,q.id);assert.equal(active.target,120);assert.equal(active.progress,10);
  assert.equal(active.startClicks,q.startClicks);assert.equal(active.reward.amount,1);
  assert.equal(active.completed,false);assert.equal(loaded.questTracking.currentRun.questsCompleted,before);
  assert.equal(loaded.dynamicSlots.slot3.currentQuest.clickTarget,180);
  assert.equal(loaded.dynamicSlots.slot3.currentQuest.produceTarget,combo.produceTarget);
  assert.equal(loaded.dynamicSlots.slot5.currentQuest.target,2000000);
  assert.equal(loaded.saveGame({silent:true}),true);
  const again=h.newGame();assert.equal(again.loadGame(),true);
  assert.deepEqual(JSON.parse(JSON.stringify(again.dynamicSlots.slot1.currentQuest)),JSON.parse(JSON.stringify(active)));
});
