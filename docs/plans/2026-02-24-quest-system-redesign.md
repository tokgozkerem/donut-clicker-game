# Quest System Redesign

**Date:** 2026-02-24
**Status:** Approved
**Approach:** Clean Slate + Hybrid (Milestone + Dynamic)

---

## Overview

Complete redesign of the quest system to fix broken reward scaling, inconsistent multipliers, and lack of dynamic content. Replaces all 50 existing static quests with a new hybrid system.

## Architecture

### 1. Two Quest Categories

| Category | Description | Persistence |
|----------|-------------|-------------|
| **Milestone** | One-time achievements (building tiers, production goals) | Run-based (reset on prestige) |
| **Dynamic** | Slot-based rotating quests with cooldowns | Slot state persists across sessions |

### 2. Dynamic Quest Slots

```javascript
dynamicSlots = {
  slot1: { difficulty: "easy",    cooldown: 15min,  rewardMinutes: 5  },
  slot2: { difficulty: "medium",  cooldown: 30min,  rewardMinutes: 15 },
  slot3: { difficulty: "hard",    cooldown: 60min,  rewardMinutes: 45 },
  slot4: { difficulty: "special", cooldown: 120min, rewardMinutes: 90 }
}
```

### 3. Quest Types (5)

- `click` - Click X times
- `produce` - Produce X donuts
- `buyAny` - Buy X buildings (any type)
- `buySpecific` - Buy X of specific building
- `timedProduce` - Produce X donuts within Y seconds

---

## Reward System

### Milestone Rewards (Building)

```javascript
function calculateBuildingQuestReward(buildingType, targetTier) {
  // Use tier-specific tracked spending
  const spent = this.items[buildingType].spentAtTier[targetTier] || 0;

  // Tier-based refund rate (decreasing)
  const refundRates = { 1: 0.25, 10: 0.20, 25: 0.15, 50: 0.12, 100: 0.10 };
  const rate = refundRates[targetTier] || 0.10;

  let reward = Math.floor(spent * rate);

  // Cap: 30% of next tier building cost
  const nextCost = this.getNextTierBuildingCost(buildingType);
  const cap = Math.floor(nextCost * 0.30);

  return Math.min(reward, cap);
}
```

**Tracking:** `spentAtTier[tier]` snapshots cumulative spending at each milestone tier.

### Dynamic Rewards (CPS-based)

```javascript
function calculateDynamicReward(slot) {
  const cps = this.getStableCPS();  // 120s rolling median
  const minutes = slot.rewardMultiplier;

  let reward = cps * 60 * minutes;

  // Floor: minimum for current game stage
  reward = Math.max(reward, this.getMinRewardForStage());

  // Cap: min(nextPurchase * 25%, CPS * 120min)
  const nextPurchaseCap = this.getNextMeaningfulPurchaseCost() * 0.25;
  const timeCap = cps * 60 * 120;

  return Math.min(reward, Math.min(nextPurchaseCap, timeCap));
}
```

**Exploit Prevention:** Uses 120-second rolling median CPS, not instantaneous.

---

## Multiplier System

### Constraints

- **Max multiplier:** 3x
- **Max duration:** 90 seconds
- **Queue capacity:** 1 (active + 1 queued)

### Queue-based System

```javascript
multiplierState = {
  active: { amount: 1.5, endTime: 1708123456789 },  // null if none
  queued: { amount: 2.0, duration: 60000 }          // null if none
};
```

**Rules:**
- If no active: start immediately
- If active but no queued: add to queue
- If queue full: multiplier quests not offered

### Multiplier Sources (Multiplicative)

```javascript
multiplierSources = {
  prestige: 1,    // From prestige system
  questBuff: 1,   // From quest rewards
  farmBuff: 1,    // From farm events
  eventBuff: 1    // From special events
};

getFinalProductionMultiplier() {
  return prestige * questBuff * farmBuff * eventBuff;
}
```

### Tick-based Update (No setTimeout)

```javascript
updateMultipliers() {
  const now = Date.now();

  if (this.multiplierState.active && now >= this.multiplierState.active.endTime) {
    this.multiplierState.active = null;

    if (this.multiplierState.queued) {
      const queued = this.multiplierState.queued;
      this.multiplierState.queued = null;
      this.startMultiplier(queued.amount, queued.duration);
    }
  }

  this.multiplierSources.questBuff = this.multiplierState.active?.amount || 1;
}
```

---

## Tracking & Persistence

### Run-based vs Lifetime

```javascript
questTracking = {
  currentRun: {
    spentAtTier: {},      // Reset on prestige
    totalProduced: 0      // Reset on prestige
  },
  lifetime: {
    totalClicks: 0,       // Never resets
    totalPrestige: 0      // Never resets
  }
}
```

### CPS Stabilization

```javascript
cpsHistory = [];  // Last 120 seconds of CPS readings

updateCPSHistory() {
  this.cpsHistory.push({ cps: this.calculatePerSecond(), time: Date.now() });
  this.cpsHistory = this.cpsHistory.filter(h => h.time > Date.now() - 120000);
}

getStableCPS() {
  const sorted = [...this.cpsHistory].sort((a, b) => a.cps - b.cps);
  const mid = Math.floor(sorted.length / 2);
  return sorted[mid]?.cps || this.calculatePerSecond();
}
```

---

## Architecture: Render/Logic Separation

```javascript
// Game loop
gameLoop() {
  // Phase 1: Logic/Update
  this.updateMultipliers();
  this.updateDynamicSlots();    // Quest generation here
  this.updateCPSHistory();
  this.checkMilestoneProgress();

  // Phase 2: Render (pure draw, no state changes)
  this.renderUI();
}
```

**Rule:** `renderDynamicSlot()` never calls `generateQuestForSlot()`.

---

## Migration

```javascript
migrateQuestSystem(oldSave) {
  const newState = {
    milestones: this.initializeMilestones(),
    dynamicSlots: this.initializeDynamicSlots(),
    tracking: { currentRun: {}, lifetime: { totalClicks: oldSave.totalClicks } }
  };

  // Map old claimed quests to new milestones
  for (const [id, quest] of Object.entries(oldSave.quests || {})) {
    if (quest.claimed) {
      const mapped = this.mapOldQuestToMilestone(id);
      if (mapped) newState.milestones[mapped.category][mapped.id].claimed = true;
    }
  }

  return newState;
}
```

---

## UI

### Slot Colors
- **Easy:** Green border
- **Medium:** Yellow border
- **Hard:** Orange border
- **Special:** Purple border + sparkle

### Cooldown Display
Shows remaining time when slot is on cooldown.

---

## Summary of Fixes

| Problem | Solution |
|---------|----------|
| Static rewards don't scale | CPS-based dynamic rewards |
| Rewards too high/low | Tier-based % + meaningful caps |
| 50x multiplier breaks game | Max 3x/90s, queue system |
| Multiplier farming | Queue limit, no stacking |
| CPS exploit | 120s rolling median |
| setTimeout unreliable | endTime + tick-based check |
| Buff overwrite | Multiplicative sources |
| Render side effects | Logic/render separation |
| Prestige confusion | Run-based vs lifetime tracking |
