// Six deterministic economic snapshots. All CPS comes from the real Game model.
const { harness } = require('./game-harness');
const definitions = [
  { name: 'Early', counts: { cursor: 5, baker: 1 }, balance: 50 },
  { name: 'Early-mid', counts: { cursor: 25, baker: 15, farm: 5, mine: 1 }, balance: 5000,
    upgrades: { cursor: [0], baker: [0] } },
  { name: 'Mid', counts: { cursor: 75, baker: 50, farm: 25, mine: 15, factory: 5, logisticCenter: 2 },
    balance: 1e6, upgrades: { cursor: [0,1,2,3,4], baker: [0,1,2], farm: [0,1], mine: [0,1], factory: [0], donutUpgrades: [0,1], nonItemUpgrades: [0,1] },
    recipes: { 'Classic Donut': 3, 'White Magic Donut': 2 } },
  { name: 'Late', counts: { cursor: 200, baker: 150, farm: 100, mine: 80, factory: 60,
    logisticCenter: 45, powerPlant: 30, nature: 25, neuralNetworkBakery: 15, portal: 10, capitalCrest: 5 },
    balance: 1e11, allAvailable: true, mastery: 20 },
  { name: 'Prestiged low', counts: { cursor: 5, baker: 1, farm: 1 }, balance: 1000, prestige: 2 },
  { name: 'Prestiged higher', counts: { cursor: 25, baker: 10, farm: 5, mine: 1 },
    balance: 1e6, prestige: 8, upgrades: { cursor: [0,1,2], baker: [0], farm: [0] } },
];
function fixture(definition) {
  const h = harness(); const g = h.game;
  for (const [key, count] of Object.entries(definition.counts)) g.items[key].count = count;
  for (const [key, indices] of Object.entries(definition.upgrades || {})) {
    for (const i of indices) g.upgrades[key][i].purchased = true;
  }
  if (definition.allAvailable) {
    for (const [key, list] of Object.entries(g.upgrades)) {
      for (const upgrade of list) upgrade.purchased = g.items[key]
        ? g.items[key].count >= upgrade.requirement : true;
    }
  }
  for (const [name, count] of Object.entries(definition.recipes || {})) g.recipes[name].craftCount = count;
  g.prestigeCount = definition.prestige || 0;
  g.donutCount = definition.balance;
  g.farmState.mastery.level = definition.mastery || 0;
  g.fixBuildingCosts();
  g.rebuildItemProductionsFromSaveState();
  // Deterministic type/building selection; no random sampling simulation.
  h.context.Math = Object.create(Math);
  h.context.Math.random = () => 0;
  return { ...h, name: definition.name };
}
module.exports = { definitions, fixture, representativeStates: () => definitions.map(fixture) };
