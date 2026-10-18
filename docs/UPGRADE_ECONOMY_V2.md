# Upgrade Economy V2 — Mathematical Validation

Historical V2 report, superseded by [Upgrade Economy V2.1](UPGRADE_ECONOMY_V2_1.md). The analysis tool now implements V2.1; the commands and pricing below describe the former V2 state.

Implemented 2026-10-18. Reproduce with:

```sh
node scripts/analyze-upgrade-economy.js
node scripts/analyze-upgrade-economy.js --frontier
```

The first command emits [the full 52-row analysis](UPGRADE_ECONOMY_V2.csv), using actual fixed content, canonical Production Math, and the authoritative bulk-price calculation. Every row includes ownership, price, fleet CPS before purchase, marginal CPS, upgrade/next-copy/fresh-next-building payback, acquisition cost, price ratios, and crossover ownership. Missing next-building alternatives for Capital Crest are empty, not zero. Payback means cost divided by incremental CPS, **not elapsed playtime**. Figures omit clicks, recipes, global/temporary upgrades, mastery, side income and prestige unless stated.

## Model and derivation

For original cost B, growth r, base CPS s, unlock ownership N, and previously bought local factor M:

- C(N) = ceil(sum of B*r^j for j=0…N−1), one authoritative bulk acquisition from zero. Sequential single purchases can cost slightly more because each transaction rounds.
- Next raw copy q(N) = B*r^N. Actual transactions retain the existing iterative growth and ceil rounding.
- Upgrade P(N) = roundUp3(max(10B, 1.5*N*q(N))).
- roundUp3(x): u = 10^max(0, floor(log10(x))−2); result = ceil(x/u)*u.
- Fixed content prices are baked at design time. No live balance, cached state, prestige count, or save metadata changes them.
- Core N = 1,10,20,30,40. Baker extras N = 60,80, preserving their indices. All ordinary effects remain local ×2. Cursor is excluded.

At an unlock, fleet gain is N*s*M and next-copy gain is s*M. Outside the entry floor, upgrade payback / next-copy payback is approximately 1.5. Thus s and existing multipliers cancel from the within-building comparison; they still matter when comparing neighboring buildings. At n>N, that ratio becomes approximately 1.5*(N/n)*r^(N−n), so the upgrade becomes better naturally after additional copies. The floor defers the first upgrade until about five owned. No prerequisite chain is imposed; ownership is the only ordinary unlock gate.

## Candidate comparison

For the common r=1.16, ratios of upgrade payback to next-copy payback at unlock:

| Candidate | N=10 | N=20 | N=30 | N=40 |
|---|---:|---:|---:|---:|
| C(N) | .483 | .296 | .206 | .156 |
| 1.5 C(N) | .725 | .445 | .309 | .234 |
| 2 C(N) | .967 | .593 | .412 | .312 |
| 2.5 C(N) | 1.208 | .741 | .515 | .390 |
| 3 C(N) | 1.450 | .889 | .618 | .468 |
| **1.5 N q(N)** | **1.5** | **1.5** | **1.5** | **1.5** |

A single C(N) coefficient cannot produce a comparable decision window at all four tiers. The selected rule is also P(N)=k(N)*C(N), ignoring rounding, with k(N)=1.5*N*(r−1)*r^N/(r^N−1). It deliberately rises with ownership rather than leaving high tiers as automatic buys. A marginal coefficient of 1 gives an almost immediate crossover; 1.25 gives 1–2 additional copies; 1.5 gives 2–3; 2 gives 3–5. The selected 1.5 keeps the window short without making unlocks automatic. Rounded actual crossovers across every building are 1→5, 10→12, 20→23, 30→33, 40→43. Baker extras are 60→63 and 80→83.

## Existing prices: old → new

Names, descriptions, image references, array indices and purchased flags are unchanged.

| Building | Prices, in original array order | Ownership old → new |
|---|---|---|
| Baker | 1,000 → 1,150; 5,250 → 7,290; 52,500 → 61,600; 5,250,000 → 391,000; 525,000,000 → 2,200,000; 5,250,000,000 → 58,900,000; 525,000,000,000 → 1,410,000,000 | 1/15/30/50/100/150/200 → 1/10/20/30/40/60/80 |
| Farm | 10,000 → 14,000; 50,000 → 85,000; 500,000 → 688,000; 50,000,000 → 4,180,000; 5,000,000,000 → 22,600,000 | 1/15/30/50/100 → 1/10/20/30/40 |
| Mine | 160,000 → 160,000; 800,000 → 1,060,000; 8,000,000 → 9,350,000; 800,000,000 → 61,900,000; 80,000,000,000 → 364,000,000 | 1/15/30/50/100 → 1/10/20/30/40 |
| Factory | 1,800,000 → 1,760,000; 9,000,000 → 11,700,000; 90,000,000 → 103,000,000; 9,000,000,000 → 680,000,000; 900,000,000,000 → 4,000,000,000 | 1/15/30/50/100 → 1/10/20/30/40 |
| Logistic Center | 19,000,000 → 19,300,000; 95,000,000 → 128,000,000; 950,000,000 → 1,130,000,000; 9,500,000,000 → 7,450,000,000; 9,500,000,000,000 → 43,800,000,000 | 1/15/30/50/100 → 1/10/20/30/40 |
| Power Plant | 210,000,000 → 211,000,000; 1,050,000,000 → 1,400,000,000; 10,500,000,000 → 12,400,000,000; 105,000,000,000 → 81,500,000,000; 105,000,000,000,000 → 480,000,000,000 | 1/15/30/50/100 → 1/10/20/30/40 |
| Nature | 2,300,000,000 → 2,310,000,000; 11,500,000,000 → 15,300,000,000; 115,000,000,000 → 135,000,000,000; 1,150,000,000,000 → 892,000,000,000; 115,000,000,000,000 → 5,250,000,000,000 | 1/15/30/50/100 → 1/10/20/30/40 |

## New late ladders

Each row is ×2 local production, initially unpurchased.

| Building | Upgrade | Owned | Price |
|---|---|---:|---:|
| Neural Network Bakery | Smart Dough | 1 | 25,300,000,000 |
| Neural Network Bakery | Glaze Training | 10 | 168,000,000,000 |
| Neural Network Bakery | Baker’s Memory | 20 | 1,480,000,000,000 |
| Neural Network Bakery | Dream Kitchen | 30 | 9,760,000,000,000 |
| Neural Network Bakery | The Perfect Batch | 40 | 57,400,000,000,000 |
| Portal | Fresh Gateway | 1 | 277,000,000,000 |
| Portal | Dough Passage | 10 | 1,830,000,000,000 |
| Portal | Glaze Dimension | 20 | 16,200,000,000,000 |
| Portal | Infinite Delivery | 30 | 107,000,000,000,000 |
| Portal | Donut Multiverse | 40 | 629,000,000,000,000 |
| Capital Crest | Crown Oven | 1 | 3,030,000,000,000 |
| Capital Crest | Golden Treasury | 10 | 20,100,000,000,000 |
| Capital Crest | Royal Kitchens | 20 | 177,000,000,000,000 |
| Capital Crest | Grand Banquet | 30 | 1,180,000,000,000,000 |
| Capital Crest | Eternal Crown | 40 | 6,890,000,000,000,000 |

## Late investment comparisons at unlock

Prior upgrades in the same ladder are bought; no prestige. Hours below are payback ratios only. The fresh next-building option is a one-time comparison: repeated copies grow in cost and that building has its own upgrade decisions.

| Building | Tier / owned | Marginal CPS | Upgrade h | Next copy h | Fresh next building h | P / C(N) | P / next copy |
|---|---:|---:|---:|---:|---:|---:|---:|
| Neural Network Bakery | 1 / 1 | 270,500 | 25.98 | 3.01 | 4.27 | 10.019 | 8.637 |
| Neural Network Bakery | 3 / 20 | 21,640,000 | 19.00 | 12.62 | 4.27 | 5.080 | 30.116 |
| Neural Network Bakery | 5 / 40 | 173,120,000 | 92.10 | 61.38 | 4.27 | 9.628 | 60.019 |
| Portal | 1 / 1 | 1,800,000 | 42.75 | 4.95 | 7.66 | 10.018 | 8.636 |
| Portal | 3 / 20 | 144,000,000 | 31.25 | 20.76 | 7.66 | 5.078 | 30.106 |
| Portal | 5 / 40 | 1,152,000,000 | 151.67 | 101.00 | 7.66 | 9.636 | 60.067 |
| Capital Crest | 1 / 1 | 10,980,000 | 76.65 | 8.89 | — | 10.003 | 8.623 |
| Capital Crest | 3 / 20 | 878,400,000 | 55.97 | 37.28 | — | 5.064 | 30.025 |
| Capital Crest | 5 / 40 | 7,027,200,000 | 272.35 | 181.40 | — | 9.635 | 60.057 |

The unlock is not a purchase recommendation. At Neural Network Bakery23 with two prior upgrades, tier3 payback is 16.52h versus its next copy at 19.69h and a Portal copy at 20 owned/two upgrades at 20.76h. Portal23 tier3 is 27.17h versus its next copy at 32.40h and a Capital Crest copy at 20/two upgrades at 37.28h. These states show upgrades beating both mature alternatives, whereas expansion wins at the initial ownership gate.

## Completion budgets

Core means 40 copies and five upgrades, not the crossover ownership of 43. Stock is one bulk acquisition from zero. Base CPS is authoritative with only that local ladder purchased.

| Building | Five upgrades | 40-copy stock | Combined | Core-complete CPS |
|---|---:|---:|---:|---:|
| Baker | 2,661,040 | 235,657 | 2,896,697 | 1,280 |
| Farm | 27,567,000 | 2,490,727 | 30,057,727 | 8,960 |
| Mine | 436,470,000 | 37,772,116 | 474,242,116 | 64,000 |
| Factory | 4,796,460,000 | 415,493,275 | 5,211,953,275 | 326,400 |
| Logistic Center | 52,527,300,000 | 4,549,651,355 | 57,076,951,355 | 1,568,000 |
| Power Plant | 575,511,000,000 | 49,788,960,394 | 625,299,960,394 | 10,240,000 |
| Nature | 6,294,610,000,000 | 544,864,777,770 | 6,839,474,777,770 | 58,880,000 |
| Neural Network Bakery | 68,833,300,000,000 | 5,961,518,511,005 | 74,794,818,511,005 | 346,240,000 |
| Portal | 754,307,000,000,000 | 65,275,411,033,915 | 819,582,411,033,915 | 2,304,000,000 |
| Capital Crest | 8,270,130,000,000,000 | 715,130,498,497,460 | 8,985,260,498,497,460 | 14,054,400,000 |

## Investment frontier and prestige

A deterministic return-ranked frontier selects the currently eligible purchase with minimum price / canonical incremental CPS and saves for it. It does not execute the runtime auto-buyer, forecast playtime, optimize a finite run, or simulate side systems. Whole-run spending budgets are supplied exogenously; retained cash is the unused budget. Counts/upgrades below include the cost of all ordinary buildings preceding them.

| Budget | Actually invested | Base CPS | Nature | Neural | Portal | Capital |
|---|---:|---:|---:|---:|---:|---:|
| 550,000,000,000 | 536,639,706,444 | 29,368,704 | 21/2 | 14/2 | 4/0 | 0/0 |
| 10,000,000,000,000 | 7,624,105,842,619 | 227,259,872 | 31/3 | 22/2 | 18/2 | 5/0 |
| 40,000,000,000,000 | 22,731,377,134,672 | 513,354,528 | 38/4 | 29/3 | 21/2 | 12/1 |
| 160,000,000,000,000 | 139,736,274,900,689 | 1,712,141,856 | 48/5 | 39/4 | 31/3 | 23/2 |
| 640,000,000,000,000 | 599,887,621,478,330 | 4,126,208,064 | 52/5 | 43/4 | 39/4 | 31/3 |
| 2,560,000,000,000,000 | 2,336,057,014,975,626 | 8,630,612,800 | 55/5 | 51/5 | 43/4 | 39/4 |
| 10,240,000,000,000,000 | 3,728,606,513,141,939 | 11,074,264,672 | 59/5 | 55/5 | 51/5 | 43/4 |

Cells are copies / purchased dedicated upgrades. The old550B threshold arrives before any Capital Crest in this probe. New fresh-run threshold is **10T × 2^completedPrestiges**; the existing production factor remains **2^completedPrestiges**. The first eligibility point supports Capital Crest ownership and optional entry investment rather than requiring its full ladder. Five Capital Crests plus its first upgrade cost about5.113T before other buildings, so buying that upgrade before prestige is a feasible alternative to the return-ranked frontier.

Capital core completion costs8.98526049849746Q. In the frontier, its fourth upgrade is held at a2.56Q budget (prestige8 threshold); at10.24Q (prestige10 threshold), its final6.89Q upgrade is the next planned investment but total planned spend would be about10.619Q, slightly beyond eligibility. Continuing that run, prioritizing Capital, or reaching the20.48Q threshold at prestige11 can fund it. No upgrade is locked behind a prestige count. These are budget landmarks, not guaranteed playthrough milestones.

Capital tier5 has the largest unboosted payback:272.35h at40 owned, versus181.40h for another copy; at43 owned the upgrade wins. Existing prestige production reduces that ratio to1.064h at prestige8 and0.266h at prestige10. This is intentionally a deep multi-prestige investment, not a first-run target or a claim about real playtime. Baker extras at60/80 retain seven total doublings (×128); the last costs1.41B with76.50h unboosted payback at80/prior six, making it a later backfill goal.

## Compatibility and risks

- Existing upgrade identity/order/text/images and all Cursor/global/click constants remain unchanged. New categories append after all old categories. SaveVersion1 and boolean/object flag hydration remain unchanged. Old purchased flags survive below new gates with no refunds or charges; new categories default unowned.
- UI and purchase authority share the established unlock rules. Ordinary upgrades require ownership only; other existing UI rules (click counts, combo activation, global earned/CPS gates) are now also checked by direct purchases. Invalid identities/indexes are rejected. Test helpers that directly set owned flags remain usable.
- Exact old run thresholds550B×2^p are grandfathered on load, including already eligible runs; next prestige adopts the new curve. Other undersized thresholds still repair to the current minimum; higher saved thresholds remain retained. No persisted migration flag. Older clients can ignore new categories and cannot enforce the new pricing/threshold rules; do not alternate client versions after purchasing expansion content. Backup/checksum/stale-tab protections are unchanged.
- Prices are fixed safe integers; large accumulated balances still use JavaScript Number precision as before. Production formulas, time policy, save shape, building growth, recipes, side-system coefficients, automation and RNG are unchanged. Extra local CPS intentionally changes production-derived Mine/quest/feed reference values where their established rules apply.
- This is mathematical validation, not browser/playtime tuning. Click/global upgrades, optional recipes, quests and side income can change pacing. Existing players with old upgrades retain a legitimate advantage. Prestige threshold growth matching production growth avoids forcing all first-run content, but remains simple stronger-next-run prestige rather than a redesigned meta system.
- Fifteen PNG upgrade icons are intentionally not created in this task; destination img/. No browser test or deployment was performed.
