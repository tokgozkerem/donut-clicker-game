# Quest System v3.0 - Perfect Effort-Based Economics

**Date:** 2026-02-24
**Status:** Implemented
**Version:** 3.0 (Final)

---

## Core Philosophy

**Quests are BONUSES, not primary income.**

When you click 10 times, you earn 10 donuts. The quest reward is a small thank-you bonus on top of that - not a replacement for your earnings.

---

## Game Economics Baseline

Understanding these numbers is critical for balanced quest design:

| Building | Cost    | Production | ROI Time |
| -------- | ------- | ---------- | -------- |
| Cursor   | 15      | 0.1/s      | 150 sec  |
| Baker    | 115     | 1/s        | 115 sec  |
| Farm     | 1,400   | 7/s        | 200 sec  |
| Mine     | 16,000  | 50/s       | 320 sec  |
| Factory  | 176,000 | 255/s      | 690 sec  |

**Click Value:** 1 donut (base) + 0.5% of CPS

---

## Reward Formula

```
Reward = (Natural Effort Value) × (Bonus Rate)
```

### Bonus Rates by Difficulty

| Difficulty | Bonus Rate | Philosophy                   |
| ---------- | ---------- | ---------------------------- |
| Easy       | 5%         | Quick task, tiny bonus       |
| Medium     | 8%         | More effort, slightly better |
| Hard       | 12%        | Significant investment       |
| Special    | 15%        | Maximum effort               |

### Example Calculations

#### Early Game (0 CPS, 0 buildings)

| Quest        | Target    | Natural Earnings | Bonus Rate | Reward            |
| ------------ | --------- | ---------------- | ---------- | ----------------- |
| Easy Click   | 10 clicks | 10 donuts        | 5%         | **1 donut**       |
| Easy Produce | 50 donuts | 50 donuts        | 5%         | **1 donut** (min) |
| Medium Click | 20 clicks | 20 donuts        | 8%         | **1 donut**       |
| Hard Click   | 40 clicks | 40 donuts        | 12%        | **2 donuts**      |

#### Early-Mid Game (5 CPS, 10 buildings)

| Quest          | Target     | Time/Effort       | Bonus Rate | Reward         |
| -------------- | ---------- | ----------------- | ---------- | -------------- |
| Easy Click     | 30 clicks  | 30 donuts clicked | 5%         | **1-2 donuts** |
| Easy Produce   | 300 donuts | 60 sec effort     | 5%         | **15 donuts**  |
| Medium Produce | 600 donuts | 120 sec effort    | 8%         | **48 donuts**  |
| Hard Buy (2)   | ~250 spent | 250 donut cost    | 12%        | **15 donuts**  |

#### Mid Game (100 CPS, 30 buildings)

| Quest          | Target            | Time/Effort | Bonus Rate | Reward          |
| -------------- | ----------------- | ----------- | ---------- | --------------- |
| Easy Produce   | 6,000             | 60 sec      | 5%         | **300 donuts**  |
| Medium Produce | 12,000            | 120 sec     | 8%         | **960 donuts**  |
| Hard Timed     | 4,500             | 45 sec      | 12%        | **648 donuts**  |
| Special Combo  | 50 clicks + 3,000 | Combined    | 15%        | **~700 donuts** |

---

## Reward System by Quest Type

### Click Quests

```javascript
naturalEarnings = clicks × clickValue;  // clickValue ≈ 1
reward = naturalEarnings × bonusRate;

// 10 clicks at start = 10 × 1 × 0.05 = 0.5 → rounds to 1 donut
```

### Produce Quests

```javascript
timeSpent = target / CPS;  // seconds of effort
reward = CPS × timeSpent × bonusRate;

// 100 donuts at 1 CPS = 100 sec × 1 × 0.05 = 5 donuts
```

### Buy Quests

```javascript
estimatedCost = count × avgBuildingCost;
reward = estimatedCost × bonusRate × 0.5;  // 50% penalty

// Buy 1 building (15 cost) = 15 × 0.05 × 0.5 = 0.375 → 1 donut
```

### Timed Quests

```javascript
reward = normalProduceReward × 1.2;  // 20% time pressure bonus
```

### Spending Quests

```javascript
reward = amountSpent × bonusRate × 0.3;  // Tiny cashback

// Spend 100 donuts = 100 × 0.05 × 0.3 = 1.5 → 1 donut
```

---

## Cap System

Rewards are capped to prevent breaking progression:

### Two-Cap System

```javascript
cap = MIN(buildingCap, cpsCap); // Use the SMALLER one
```

| Difficulty | Building % | CPS Seconds |
| ---------- | ---------- | ----------- |
| Easy       | 2%         | 15 sec      |
| Medium     | 4%         | 30 sec      |
| Hard       | 6%         | 60 sec      |
| Special    | 10%        | 90 sec      |

### Example

```
Next building costs 1,000 donuts, CPS is 10/sec

Easy quest max:
- Building cap: 1000 × 0.02 = 20 donuts
- CPS cap: 10 × 15 = 150 donuts
- Final cap: MIN(20, 150) = 20 donuts
```

---

## Stage System

Game progression is divided into 8 stages:

| Stage | Buildings | CPS    | Min Reward |
| ----- | --------- | ------ | ---------- |
| 1     | 0-2       | < 0.5  | 1          |
| 2     | 3-7       | < 3    | 1          |
| 3     | 8-14      | < 15   | 2          |
| 4     | 15-29     | < 100  | 3          |
| 5     | 30-59     | < 1K   | 5          |
| 6     | 60-119    | < 10K  | 10         |
| 7     | 120-249   | < 100K | 20         |
| 8     | 250+      | 100K+  | 50         |

Minimum rewards are INTENTIONALLY tiny - they just prevent 0.

---

## Quest Targets

### Dynamic Quest Targets

| Type          | Formula                            |
| ------------- | ---------------------------------- |
| Click         | `(30 + CPS×0.05) × diffMult`       |
| Produce       | `CPS × 60 × diffMult`              |
| Buy Any       | `2 × diffMult`                     |
| Buy Specific  | `1.5 × diffMult`                   |
| Timed Produce | `CPS × 45`                         |
| Efficiency    | `(CPS + 0.5) × (1 + diffMult×0.1)` |
| Combo Click   | `(20 + CPS×0.02) × diffMult`       |
| Combo Produce | `CPS × 20 × diffMult`              |
| Spending      | `nextBuilding × 0.3 × diffMult`    |

### Difficulty Multipliers

| Difficulty | Multiplier |
| ---------- | ---------- |
| Easy       | 1x         |
| Medium     | 2x         |
| Hard       | 3x         |
| Special    | 5x         |

---

## Milestone Rewards

Milestone quests use the same economic principles:

### Building Milestones

```javascript
// Reward = percentage of cumulative spending at that tier
spent = trackingData.spentAtTier[tier];
reward = spent × tierRefundRate;

tierRefundRates = [0.25, 0.24, 0.22, 0.20, 0.18, 0.16, 0.14, 0.12, 0.10, 0.08, 0.06]
```

### Other Milestones

```javascript
// CPS-based with time multiplier
minutes = 3 + (tierIndex × 2);  // 3, 5, 7, 9, 11...
reward = CPS × 60 × minutes × 0.1;  // 10% of time value
```

---

## Anti-Exploit Measures

1. **Tiny Bonus Rates**: 5-15% means exploits have minimal impact
2. **Two-Cap System**: Building AND CPS caps prevent runaway rewards
3. **Conservative Cap Selection**: Always use the SMALLER cap
4. **120-Second Median CPS**: Prevents spike exploitation
5. **Stage-Based Minimums**: Can't farm stage 1 quests in late game

---

## Full Quest Type Reference

### Active Quest Slots (5)

| Slot | Difficulty | Cooldown | Quest Pool                                   |
| ---- | ---------- | -------- | -------------------------------------------- |
| 1    | Easy       | 10 min   | click, produce, buyAny                       |
| 2    | Easy       | 12 min   | produce, click, efficiency                   |
| 3    | Medium     | 25 min   | produce, buySpecific, click, combo           |
| 4    | Hard       | 50 min   | timedProduce, buySpecific, produce, spending |
| 5    | Special    | 90 min   | multiplier, timedProduce, combo, spending    |

### Quest Types (9)

| Type         | Description       | Reward Basis         |
| ------------ | ----------------- | -------------------- |
| click        | Click X times     | Click earnings bonus |
| produce      | Produce X donuts  | Time spent bonus     |
| buyAny       | Buy X buildings   | Spending cashback    |
| buySpecific  | Buy X of type     | Spending cashback    |
| timedProduce | Produce X in 60s  | Time bonus +20%      |
| multiplier   | Earn CPS boost    | No donut reward      |
| efficiency   | Reach X CPS       | CPS gain bonus       |
| combo        | Click AND produce | Combined bonus       |
| spending     | Spend X donuts    | Tiny cashback        |

---

## Multiplier System

### Nerfed Values

| Difficulty | Multiplier | Duration |
| ---------- | ---------- | -------- |
| Easy       | 1.15x      | 20 sec   |
| Medium     | 1.25x      | 30 sec   |
| Hard       | 1.50x      | 45 sec   |
| Special    | 2.00x      | 60 sec   |

### Queue System

- Max 1 active + 1 queued
- When queue full, multiplier quests not offered

---

## Milestone Categories

### Building Milestones (11 buildings × 5-11 tiers each)

### Production Milestones (21 tiers: 100 → 1Q)

### Click Milestones (17 tiers: 10 → 5M)

### CPS Milestones (22 tiers: 1 → 100M)

### Total Buildings (16 tiers: 5 → 5K)

### Upgrades (11 tiers: 1 → 100)

### Quest Completion Meta (8 tiers: 5 → 1K)

---

## Summary

| Aspect             | v2.0          | v3.0                      |
| ------------------ | ------------- | ------------------------- |
| 10 clicks (early)  | ~3 donuts     | **1 donut**               |
| 50 produce (early) | ~7 donuts     | **1 donut**               |
| Bonus philosophy   | 15-40% return | **5-15% bonus**           |
| Cap system         | Single cap    | **Dual conservative cap** |
| Min rewards        | 3-100         | **1-50 (stage-based)**    |
| Primary principle  | Effort return | **Bonus on earnings**     |

**The quest system is now economically sound - rewarding but not game-breaking.**
