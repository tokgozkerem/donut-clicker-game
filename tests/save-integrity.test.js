// Run with: node --test tests/save-integrity.test.js
// Real Game persistence methods, isolated from browser storage and rendering.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { harness } = require("./helpers/game-harness");

function snapshot(h, donuts = 100) {
  const game = h.newGame();
  game._saveReady = true;
  game._loadedPrimarySave = null;
  game.donutCount = donuts;
  assert.equal(game.saveGame({ silent: true }), true);
  const raw = h.values.get("gameState");
  h.values.clear();
  h.operations.length = 0;
  return raw;
}

function legacyState(h) {
  const data = h.game.decodeSave(snapshot(h));
  for (const key of ["saveVersion", "autoBuyer", "soundVolume", "lastMineProduction",
    "lastBakerProduction", "orePurchaseLimit"]) delete data[key];
  return data;
}

test("A: a new game saves normally and adds an explicit schema version", () => {
  const h = harness();
  assert.equal(h.game.loadGame(), false);
  assert.equal(h.game.saveWritesBlocked, false);
  assert.equal(h.game.saveGame(), true);
  assert.equal(h.game.decodeSave(h.values.get("gameState")).saveVersion, 1);
  assert.equal(h.values.has("gameStateBackup"), false);
});

test("B/D: a valid encoded primary takes precedence without rewriting either slot", () => {
  const h = harness();
  const primary = snapshot(h, 1234);
  const backup = snapshot(h, 12);
  h.values.set("gameState", primary);
  h.values.set("gameStateBackup", backup);
  assert.equal(h.game.loadGame(), true);
  assert.equal(h.game.donutCount, 1234);
  assert.equal(h.operations.length, 0);
});

test("C/G: legacy plain JSON and pre-schema encoded saves retain progress and defaults", () => {
  for (const encoded of [false, true]) {
    const h = harness();
    const data = legacyState(h);
    data.items.baker.count = 3;
    data.upgrades.baker[0] = { purchased: true, multiplier: 2 };
    data.recipes["Classic Donut"] = { craftCount: 2, scaling: { ingredients: { current: 4 } } };
    delete data.questSystem;
    data.quests = { beginnerClicker: { progress: 50, completed: true, claimed: true } };
    h.values.set("gameState", encoded ? h.game.encryptSave(data) : "\n " + JSON.stringify(data));
    assert.equal(h.game.loadGame(), true);
    assert.equal(h.game.donutCount, 100);
    assert.equal(h.game.items.baker.count, 3);
    assert.equal(h.game.upgrades.baker[0].purchased, true);
    assert.equal(h.game.recipes["Classic Donut"].scaling.ingredients.current, 4);
    assert.equal(h.game.autoBuyer.enabled, false);
    assert.equal(h.game.autoBuyer.settings.baker.threshold, 1.5);
    assert.equal(h.game.clickSounds[0].volume, 0.1);
    assert.equal(h.game.orePurchaseLimit, 10);
    assert.equal(h.game.lastMineProduction, h.clock.now);
  }
});

test("E: each corruption type recovers a valid backup without promoting the bad primary", () => {
  const h = harness();
  const backup = snapshot(h, 4321);
  const data = h.game.decodeSave(backup);
  const mismatch = JSON.parse(Buffer.from(backup, "base64").toString());
  mismatch.data.donutCount++;
  const invalid = { ...data, farmState: { ...data.farmState, animals: "broken" } };
  const corruptions = ["{", "%%bad base64%%", btoa("not json"),
    btoa(JSON.stringify(mismatch)), JSON.stringify({}), h.game.encryptSave(invalid),
    h.game.encryptSave({ ...data, upgrades: { cursor: {} } }),
    h.game.encryptSave({ ...data, donutCount: null }), ""];
  for (const raw of corruptions) {
    const g = h.newGame();
    h.values.set("gameState", raw);
    h.values.set("gameStateBackup", backup);
    h.operations.length = 0;
    assert.equal(g.loadGame(), true, raw.slice(0, 25));
    assert.equal(g.donutCount, 4321);
    assert.equal(h.operations.length, 0);
    assert.equal(g.saveGame({ silent: true }), true);
    assert.equal(h.values.get("gameStateBackup"), backup);
    assert.ok(h.operations.every(([, key]) => key !== "gameStateBackup"));
  }
});

test("F: failed recovery preserves both invalid slots despite scheduled/manual/lifecycle saves", () => {
  const h = harness({ gameState: "{bad", gameStateBackup: "bad backup" });
  assert.equal(h.game.loadGame(), false);
  h.game.donutCount = 999;
  h.game.requestSave();
  h.runTimers(200000);
  assert.equal(h.game.saveGame(), false);
  h.game.setupSaveLifecycle();
  h.document.visibilityState = "hidden";
  h.document.listeners.visibilitychange();
  h.window.listeners.pagehide();
  assert.equal(h.values.get("gameState"), "{bad");
  assert.equal(h.values.get("gameStateBackup"), "bad backup");
  assert.equal(h.operations.length, 0);
});

test("backup rotation preserves exactly the previous validated primary", () => {
  const h = harness();
  const first = snapshot(h, 100);
  const older = snapshot(h, 10);
  h.values.set("gameState", first);
  h.values.set("gameStateBackup", older);
  h.game.loadGame();
  h.game.donutCount = 200;
  assert.equal(h.game.saveGame({ silent: true }), true);
  assert.equal(h.values.get("gameStateBackup"), first);
  const second = h.values.get("gameState");
  h.game.donutCount = 300;
  h.game.saveGame({ silent: true });
  assert.equal(h.values.get("gameStateBackup"), second);
});

test("H: quota failures never replace the primary when its backup cannot be written", () => {
  const h = harness();
  const primary = snapshot(h);
  h.values.set("gameState", primary);
  h.game.loadGame();
  h.game.donutCount = 200;
  h.failures.writes.add("gameStateBackup");
  assert.equal(h.game.saveGame(), false);
  assert.equal(h.values.get("gameState"), primary);
  h.failures.writes.clear();
  h.failures.writes.add("gameState");
  assert.equal(h.game.saveGame(), false);
  assert.equal(h.values.get("gameState"), primary);
  assert.equal(h.values.get("gameStateBackup"), primary);
  assert.equal(h.game.donutCount, 200);
  assert.equal(h.notifications.filter((s) => s.includes("unavailable")).length, 1);
  h.failures.writes.clear();
  assert.equal(h.game.saveGame(), true);
});

test("storage read/getter failures do not escape startup or secondary-key handling", () => {
  const h = harness();
  Object.defineProperty(h.context, "localStorage", { get() { throw new Error("Denied"); } });
  assert.doesNotThrow(() => h.game.init());
  assert.equal(h.game.saveGame(), false);
  assert.equal(h.game.saveWritesBlocked, true);
  assert.equal(h.notifications.filter((s) => s.includes("unavailable")).length, 1);
});

test("an unreadable primary can recover backup but cannot overwrite unknown primary contents", () => {
  const h = harness();
  h.values.set("gameStateBackup", snapshot(h, 987));
  h.failures.reads.add("gameState");
  assert.equal(h.game.loadGame(), true);
  assert.equal(h.game.donutCount, 987);
  h.failures.reads.clear();
  assert.equal(h.game.saveGame(), false);
  assert.equal(h.operations.length, 0);
});

test("new configuration, timers, trade allowance, farm and coin state round-trip", () => {
  const h = harness();
  h.game.loadGame();
  h.game.autoBuyer.enabled = true;
  h.game.autoBuyer.settings.baker = { enabled: true, threshold: 2.75 };
  h.game.clickSounds.forEach((s) => { s.volume = 0; });
  h.game.timeState.mineProgress = 12345;
  h.game.timeState.bakerProgress = 67890;
  h.game.orePurchaseLimit = 3;
  h.game.farmState.mastery = { xp: 55, level: 2 };
  h.game.donutCoin.count = 7;
  h.game.saveGame({ silent: true });
  h.clock.now += 3600000;
  const loaded = h.newGame();
  assert.equal(loaded.loadGame(), true);
  assert.equal(loaded.autoBuyer.enabled, true);
  assert.equal(loaded.autoBuyer.settings.baker.threshold, 2.75);
  assert.equal(loaded.autoBuyer.settings.baker.enabled, true);
  assert.equal(loaded.autoBuyer.settings.farm.threshold, 1.5);
  assert.equal(loaded.clickSounds[0].volume, 0);
  assert.equal(loaded.lastMineProduction, h.clock.now - 12345);
  assert.equal(loaded.lastBakerProduction, h.clock.now - 67890);
  assert.equal(loaded.orePurchaseLimit, 3);
  assert.equal(loaded.farmState.mastery.xp, 55);
  assert.equal(loaded.donutCoin.count, 7);
  loaded.setupSettingsMenu();
  assert.equal(h.elements.get("volume-slider").value, 0);
});

test("stale tabs, including a tab open during reset, cannot replace a changed primary", () => {
  const h = harness();
  const raw = snapshot(h, 10);
  h.values.set("gameState", raw);
  const a = h.game;
  const b = h.newGame();
  a.loadGame(); b.loadGame();
  a.donutCount = 100;
  a.saveGame({ silent: true });
  const current = h.values.get("gameState");
  b.donutCount = 20;
  assert.equal(b.saveGame(), false);
  assert.equal(h.values.get("gameState"), current);
  h.values.delete("gameState");
  assert.equal(a.saveGame(), false);
  assert.equal(h.values.has("gameState"), false);
});

test("durable saves coalesce and lifecycle events flush once without notifications", () => {
  const h = harness();
  h.game.loadGame();
  for (let i = 0; i < 100; i++) h.game.requestSave();
  assert.equal(h.timers.size, 1);
  h.game.setupSaveLifecycle();
  h.document.visibilityState = "hidden";
  h.document.listeners.visibilitychange();
  h.window.listeners.pagehide();
  h.runTimers(1000);
  assert.equal(h.operations.filter(([, k]) => k === "gameState").length, 1);
  assert.equal(h.notifications.includes("saved"), false);
});

test("auto-purchases batch at 15 seconds; a manual purchase expedites the checkpoint", () => {
  const h = harness();
  h.game.loadGame();
  h.game.donutCount = 1000000;
  h.game.buyItem("cursor", true);
  h.runTimers(1000);
  assert.equal(h.values.has("gameState"), false);
  h.game.buyItem("baker");
  h.runTimers(1000);
  assert.equal(h.game.decodeSave(h.values.get("gameState")).items.baker.count, 1);
});

test("prestige checkpoints the unchanged reset result immediately", () => {
  const h = harness();
  h.game.loadGame();
  h.game.totalDonutsEarned = h.game.nextPrestigeThreshold;
  h.game.items.baker.count = 3;
  h.game.performPrestige();
  const saved = h.game.decodeSave(h.values.get("gameState"));
  assert.equal(saved.prestigeCount, 1);
  assert.equal(saved.items.baker.count, 0);
  assert.equal(saved.donutCount, 0);
  assert.equal(saved.nextPrestigeThreshold, 1100000000000);
});

test("invalid live state cannot poison a primary or a valid backup", () => {
  const h = harness();
  const primary = snapshot(h);
  h.values.set("gameState", primary);
  h.values.set("gameStateBackup", primary);
  h.game.loadGame();
  h.game.donutCount = Infinity;
  assert.equal(h.game.saveGame(), false);
  assert.equal(h.values.get("gameState"), primary);
  assert.equal(h.values.get("gameStateBackup"), primary);
});

test("partial legacy settings merge defaults; invalid settings and incomplete snapshots recover backup", () => {
  const h = harness();
  const backup = snapshot(h, 50);
  const old = legacyState(h);
  old.autoBuyer = { enabled: true, settings: { baker: { enabled: true } } };
  old.questSystem.multiplierState = { active: null };
  h.values.set("gameState", JSON.stringify(old));
  assert.equal(h.game.loadGame(), true);
  assert.equal(h.game.autoBuyer.settings.baker.threshold, 1.5);
  assert.equal(h.game.multiplierState.queued, null);
  const data = h.game.decodeSave(backup);
  const incomplete = { ...data };
  delete incomplete.farmState;
  for (const invalid of [incomplete, { ...data, autoBuyer: { settings: { baker: { threshold: null } } } },
    { ...data, soundVolume: 2 }, { ...data, orePurchaseLimit: 11 },
    { ...data, questSystem: { questTracking: { currentRun: {} } } }]) {
    h.values.set("gameState", h.game.encryptSave(invalid));
    h.values.set("gameStateBackup", backup);
    const g = h.newGame();
    assert.equal(g.loadGame(), true);
    assert.equal(g.donutCount, 50);
  }
});

test("volume and auto-buyer changes persist through their existing UI handlers", () => {
  const h = harness();
  h.game.loadGame();
  h.game.setupSettingsMenu();
  h.game.setupAutoBuyer();
  h.elements.get("volume-slider").listeners.input({ target: { value: "0.35" } });
  h.elements.get("auto-buyer-toggle").listeners.change({ target: { checked: true } });
  const onChange = h.elements.get(".auto-buyer-items").listeners.change;
  onChange({ target: { dataset: { item: "baker" }, type: "checkbox", checked: true } });
  onChange({ target: { dataset: { item: "baker" }, type: "number", value: "2.3" } });
  const invalid = { dataset: { item: "baker" }, type: "number", value: "" };
  onChange({ target: invalid });
  assert.equal(invalid.value, 2.3);
  h.runTimers(1000);
  const loaded = h.newGame();
  assert.equal(loaded.loadGame(), true);
  assert.equal(loaded.clickSounds[0].volume, 0.35);
  assert.equal(loaded.autoBuyer.enabled, true);
  assert.equal(loaded.autoBuyer.settings.baker.enabled, true);
  assert.equal(loaded.autoBuyer.settings.baker.threshold, 2.3);
});

test("purchases, crafting, reward claims and farm transactions survive the batched checkpoint", () => {
  const h = harness();
  h.game.loadGame();
  h.game.donutCount = 1000000;
  h.game.items.cursor.count = 1;
  h.game.items.farm.count = 15;
  h.game.buyUpgrade("cursor", 0);
  h.game.ingredients = { Dough: { count: 20 }, Sugar: { count: 20 } };
  h.game.craftDonut("Classic Donut");
  const milestone = h.game.milestoneQuests.building.cursor[1];
  milestone.completed = true;
  milestone.frozenReward = 10;
  h.game.claimMilestoneReward("building", "cursor", 1);
  h.game.buyAnimal("chicken");
  h.game.buyAnimal("chicken");
  h.game.startBreeding(0, "chicken_1", "chicken_2", "quick");
  h.game.farmState.storage.egg = 5;
  h.game.sellGoods("egg");
  h.runTimers(1000);
  const loaded = h.newGame();
  assert.equal(loaded.loadGame(), true);
  assert.equal(loaded.upgrades.cursor[0].purchased, true);
  assert.equal(loaded.recipes["Classic Donut"].craftCount, 1);
  assert.equal(loaded.milestoneQuests.building.cursor[1].claimed, true);
  assert.equal(loaded.farmState.animals.length, 2);
  assert.equal(loaded.farmState.breeding.slots[0].active, true);
  assert.equal(loaded.farmState.storage.egg, h.game.farmState.storage.egg);
  assert.ok(loaded.farmState.storage.egg > 0 && loaded.farmState.storage.egg < 1);
  assert.equal(loaded.donutCount, h.game.donutCount);
});

test("existing dynamic quest types and populated farm rewards remain valid save data", () => {
  const h = harness();
  h.game.loadGame();
  h.game.items.farm.count = 60;
  h.game.farmState.mastery.level = 8;
  h.game.generateContractBoard();
  const contract = h.game.farmState.contracts.board[0];
  for (const [good, amount] of Object.entries(contract.requirements)) {
    h.game.farmState.storage[good] = amount;
  }
  h.game.acceptContract(contract.id);
  h.game.applyFarmBuff(h.game.generateBuffReward(8));
  h.game.farmState.crates.push({ id: "test-crate", tier: "epic" });
  for (const type of ["click", "produce", "buyAny", "buySpecific", "timedProduce",
    "multiplier", "efficiency", "combo", "spending"]) {
    h.game.dynamicSlots.slot5.currentQuest = h.game.createDynamicQuest(type, h.game.dynamicSlots.slot5);
    assert.equal(h.game.saveGame({ silent: true }), true, type);
  }
  const loaded = h.newGame();
  assert.equal(loaded.loadGame(), true);
  assert.equal(loaded.farmState.contracts.active.length, 1);
  assert.equal(loaded.farmState.crates[0].tier, "epic");
  assert.equal(loaded.dynamicSlots.slot5.currentQuest.type, "spending");
});

test("confirmed reset clears both slots; a failed removal does not reload", async () => {
  const h = harness({ gameState: "bad", gameStateBackup: "bad backup", bakeryName: "Name" });
  h.game.loadGame();
  h.game.showResetConfirmModal = async () => true;
  h.failures.removes.add("gameStateBackup");
  await h.game.resetGame();
  assert.equal(h.context.reloaded, undefined);
  assert.equal(h.values.get("gameState"), "bad");
  h.failures.removes.clear();
  await h.game.resetGame();
  assert.equal(h.context.reloaded, true);
  assert.equal(h.values.size, 0);
});
