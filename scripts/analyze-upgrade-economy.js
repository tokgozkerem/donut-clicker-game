// Read-only long-form design probe. Runtime prices remain fixed content literals.
// Production/transaction math comes from the real Game through the existing harness.
const { harness } = require('../tests/helpers/game-harness');

const CORE_OWNERSHIP = [1, 15, 30, 50, 100];
const TIER_MULTIPLIERS = [1, 5, 50, 5000, 500000];
// Historical tier-2 price / 5. Preserve established entry scales, not V2 ROI prices.
const HISTORICAL_ANCHORS = {
  baker: 1050, farm: 10000, mine: 160000, factory: 1800000,
  logisticCenter: 19000000, powerPlant: 210000000, nature: 2300000000,
};
function anchorForBuilding(key, building) {
  if (Object.hasOwn(HISTORICAL_ANCHORS, key)) return HISTORICAL_ANCHORS[key];
  const raw = 10 * building.originalBaseCost;
  const unit = 10 ** Math.max(0, Math.floor(Math.log10(raw)) - 1);
  return Math.round(raw / unit) * unit; // Two significant digits, once at design time.
}
function ownershipForBuilding(key) {
  return key === 'baker' ? [...CORE_OWNERSHIP, 150, 200] : [...CORE_OWNERSHIP];
}
function priceForTier(key, building, index) {
  if (key === 'baker' && index === 0) return 1000; // Preserve the historical entry discount.
  const factors = key === 'baker' ? [...TIER_MULTIPLIERS, 5000000, 500000000] : TIER_MULTIPLIERS;
  return anchorForBuilding(key, building) * factors[index];
}
function applyCandidate(g) {
  for (const key of Object.keys(g.items).filter(k => k !== 'cursor')) {
    g.upgrades[key].forEach((u, i) => {
      u.cost = priceForTier(key, g.items[key], i);
      u.requirement = ownershipForBuilding(key)[i];
    });
  }
}

function analyze({ candidate = false } = {}) {
  const { game: g } = harness();
  if (candidate) applyCandidate(g);
  const keys = Object.keys(g.items).filter(key => key !== 'cursor'), rows = [];
  for (const [ki, key] of keys.entries()) {
    const b = g.items[key], next = g.items[keys[ki + 1]];
    let upgradeInvestment = 0;
    for (const [i, u] of g.upgrades[key].entries()) {
      const n = u.requirement;
      b.count = n;
      g.upgrades[key].forEach((other, j) => { other.purchased = j < i; });
      const before = g.getProductionBreakdown().buildings[key].effectiveCPS;
      u.purchased = true;
      const after = g.getProductionBreakdown().buildings[key].effectiveCPS;
      u.purchased = false;
      b.baseCost = b.originalBaseCost;
      for (let j = 0; j < n; j++) b.baseCost *= b.costMultiplier;
      const copy = g.calculateBulkPrice(b, 1);
      const copyGain = g.getProductionBreakdown().buildings[key].perUnit;
      const acquisition = g.calculateBulkPrice({ ...b, baseCost: b.originalBaseCost }, n);
      upgradeInvestment += u.cost;
      rows.push({ building: key, tier: i + 1, ownership: n,
        anchor: anchorForBuilding(key, b), price: u.cost, priceToBaseCost: u.cost / b.originalBaseCost,
        fleetCPS: before, marginalCPS: after - before, afterUpgradeCPS: after,
        acquisitionCost: acquisition, cumulativeUpgradeCost: upgradeInvestment,
        accumulatedMilestoneCost: acquisition + upgradeInvestment,
        priceToAcquisition: u.cost / acquisition,
        nextBuilding: next?.name || '', nextBuildingPrice: next?.originalBaseCost || '',
        priceToNextBuilding: next ? u.cost / next.originalBaseCost : '',
        upgradePaybackSeconds: u.cost / (after - before),
        nextCopyPrice: copy, nextCopyPaybackSeconds: copy / copyGain,
        nextBuildingPaybackSeconds: next ? next.originalBaseCost / next.originalProduction : '',
        modelPrice: priceForTier(key, b, i),
        matchesModel: u.cost === priceForTier(key, b, i) && n === ownershipForBuilding(key)[i] });
    }
    b.count = 0;
    g.upgrades[key].forEach(u => { u.purchased = false; });
  }
  return rows;
}

// Deliberately goal-directed, NOT ROI-ranked: start with one already-funded copy,
// buy each upgrade at its ownership milestone, then accumulate for further copies.
// Every charge is funded from zero at that state's canonical CPS. No clicks, other
// buildings, recipes, globals, temporary boosts or side income. These are idealized
// visible economic seconds, not a real-world playtime forecast or an auto-buyer policy.
function milestoneGoals({ candidate = false } = {}) {
  const rows = [];
  for (const key of Object.keys(harness().game.items).filter(k => k !== 'cursor')) {
    const { game: g } = harness();
    if (candidate) applyCandidate(g);
    const b = g.items[key];
    b.count = 1;
    b.baseCost *= b.costMultiplier;
    let spent = b.originalBaseCost, seconds = 0;
    for (const [i, u] of g.upgrades[key].entries()) {
      while (b.count < u.requirement) {
        const cost = g.calculateBulkPrice(b, 1);
        seconds += cost / g.calculatePerSecond();
        spent += cost;
        b.count++;
        b.baseCost *= b.costMultiplier;
      }
      seconds += u.cost / g.calculatePerSecond();
      spent += u.cost;
      u.purchased = true;
      const cps = g.calculatePerSecond();
      const row = { building: key, tier: i + 1, ownership: b.count, accumulatedCost: spent,
        afterUpgradeCPS: cps, goalEconomicSecondsP0: seconds };
      for (const p of [8, 12, 16]) {
        g.prestigeCount = p;
        row[`goalEconomicSecondsP${p}`] = seconds * cps / g.calculatePerSecond();
      }
      g.prestigeCount = 0;
      rows.push(row);
    }
  }
  return rows;
}
function csv(rows) {
  const fields = Object.keys(rows[0]);
  return [fields.join(','), ...rows.map(row => fields.map(f => row[f]).join(','))].join('\n') + '\n';
}
if (require.main === module) {
  const options = { candidate: process.argv.includes('--candidate') };
  const rows = process.argv.includes('--goals') ? milestoneGoals(options) : analyze(options);
  process.stdout.write(csv(rows));
  if (rows.some(row => row.matchesModel === false)) process.exitCode = 1;
}
module.exports = { priceForTier, ownershipForBuilding, analyze, milestoneGoals };
