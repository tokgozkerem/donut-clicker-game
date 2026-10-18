# Upgrade Economy V2.1 — Long-Form Progression Validation

Implemented 2026-10-18. This supersedes V2's marginal-cost/crossover model. Runtime prices are fixed literals; analysis is development-only.

## Design authority

Ownership, progression spacing and future accumulation goals determine prices. Short payback and equality with another-copy ROI are not acceptance criteria. Waiting and prestige-assisted access are intentional. Production Math, building costs/growth, time policy, side systems, currencies and upgrade mechanics are unchanged.

## Historical reconstruction

A is the historical second-tier price divided by5. Historical factors below are actual price/A ratios; Baker's first entry retains its small discount.

| Building | Original cost B | Anchor A | A/B | Historical five price factors |
|---|---:|---:|---:|---|
| Baker | 115 | 1,050 | 9.1304 | 0.952381 / 5 / 50 / 5000 / 500000 |
| Farm | 1,400 | 10,000 | 7.1429 | 1 / 5 / 50 / 5000 / 500000 |
| Mine | 16,000 | 160,000 | 10.0000 | 1 / 5 / 50 / 5000 / 500000 |
| Factory | 176,000 | 1,800,000 | 10.2273 | 1 / 5 / 50 / 5000 / 500000 |
| Logistic Center | 1,927,200 | 19,000,000 | 9.8589 | 1 / 5 / 50 / 500 / 500000 |
| Power Plant | 21,090,250 | 210,000,000 | 9.9572 | 1 / 5 / 50 / 500 / 500000 |
| Nature | 230,800,850 | 2,300,000,000 | 9.9653 | 1 / 5 / 50 / 500 / 50000 |

The first three tiers follow entry/×5/×50, except Baker's historical1,000 entry versus its1,050 nominal anchor. Baker/Farm entry discounts and other rounded historical anchors are retained rather than normalized for neatness. Four ladders continue to×5,000/×500,000. Logistic Center and Power Plant instead have×500 fourth tiers followed by×500,000 fifth tiers (a×1,000 jump); Nature has×500/×50,000. The repeated cheaper family may have been deliberate compression; source values alone cannot prove accidents. This normalization deliberately selects the majority long-form family, consistent with the requested significant tier4/5 goals. Only four pre-V2 prices change.

## Final authoritative rule

- Core owned milestones: **1 / 15 / 30 / 50 / 100**.
- Core fixed price: **A × [1, 5, 50, 5,000, 500,000]**. Tier-to-tier ratios are×5,×10,×100,×100.
- Existing anchors: Baker1,050; Farm10,000; Mine160,000; Factory1,800,000; Logistic19,000,000; Power210,000,000; Nature2,300,000,000. Existing matching prices are restored exactly. Baker's discounted first price remains1,000.
- New-building anchor: round **10 × original cost B** to the nearest two significant digits, once at design time: x=10B; u=10^max(0,floor(log10(x))−1); A=round(x/u)*u. This gives Neural25B, Portal280B, Capital3T. No subsequent tier rounding or live-state pricing.
- Baker extras remain **150 / 200 owned**, priced **A × 5,000,000 / 500,000,000** =5.25B/525B, exactly historical.
- Every ordinary upgrade remains local×2; five=×32 and Baker seven=×128. Cursor, global and click/utility definitions are unchanged. No previous-upgrade prerequisite is added.

## Existing prices: pre-V2 → V2 → final

Values follow preserved array indices. All historical gates, including Baker extras, are restored.

| Building | Pre-V2 prices | V2 prices | Final prices |
|---|---|---|---|
| Baker | 1,000; 5,250; 52,500; 5,250,000; 525,000,000; 5,250,000,000; 525,000,000,000 | 1,150; 7,290; 61,600; 391,000; 2,200,000; 58,900,000; 1,410,000,000 | 1,000; 5,250; 52,500; 5,250,000; 525,000,000; 5,250,000,000; 525,000,000,000 |
| Farm | 10,000; 50,000; 500,000; 50,000,000; 5,000,000,000 | 14,000; 85,000; 688,000; 4,180,000; 22,600,000 | 10,000; 50,000; 500,000; 50,000,000; 5,000,000,000 |
| Mine | 160,000; 800,000; 8,000,000; 800,000,000; 80,000,000,000 | 160,000; 1,060,000; 9,350,000; 61,900,000; 364,000,000 | 160,000; 800,000; 8,000,000; 800,000,000; 80,000,000,000 |
| Factory | 1,800,000; 9,000,000; 90,000,000; 9,000,000,000; 900,000,000,000 | 1,760,000; 11,700,000; 103,000,000; 680,000,000; 4,000,000,000 | 1,800,000; 9,000,000; 90,000,000; 9,000,000,000; 900,000,000,000 |
| Logistic Center | 19,000,000; 95,000,000; 950,000,000; 9,500,000,000; 9,500,000,000,000 | 19,300,000; 128,000,000; 1,130,000,000; 7,450,000,000; 43,800,000,000 | 19,000,000; 95,000,000; 950,000,000; 95,000,000,000; 9,500,000,000,000 |
| Power Plant | 210,000,000; 1,050,000,000; 10,500,000,000; 105,000,000,000; 105,000,000,000,000 | 211,000,000; 1,400,000,000; 12,400,000,000; 81,500,000,000; 480,000,000,000 | 210,000,000; 1,050,000,000; 10,500,000,000; 1,050,000,000,000; 105,000,000,000,000 |
| Nature | 2,300,000,000; 11,500,000,000; 115,000,000,000; 1,150,000,000,000; 115,000,000,000,000 | 2,310,000,000; 15,300,000,000; 135,000,000,000; 892,000,000,000; 5,250,000,000,000 | 2,300,000,000; 11,500,000,000; 115,000,000,000; 11,500,000,000,000; 1,150,000,000,000,000 |

**33 of37 historical prices restore exactly.** Four normalized differences: Logistic tier4:9.5B→95B; Power tier4:105B→1.05T; Nature tier4:1.15T→11.5T; Nature tier5:115T→1.15Q. These are intentional balance choices, not proven bug corrections.

## Retained late-game additions

All names, descriptions, positions and image references are unchanged from V2. Each row is×2 local production.

| Building | Upgrade | Owned | Price |
|---|---|---:|---:|
| Neural Network Bakery | Smart Dough | 1 | 25,000,000,000 |
| Neural Network Bakery | Glaze Training | 15 | 125,000,000,000 |
| Neural Network Bakery | Baker’s Memory | 30 | 1,250,000,000,000 |
| Neural Network Bakery | Dream Kitchen | 50 | 125,000,000,000,000 |
| Neural Network Bakery | The Perfect Batch | 100 | 12,500,000,000,000,000 |
| Portal | Fresh Gateway | 1 | 280,000,000,000 |
| Portal | Dough Passage | 15 | 1,400,000,000,000 |
| Portal | Glaze Dimension | 30 | 14,000,000,000,000 |
| Portal | Infinite Delivery | 50 | 1,400,000,000,000,000 |
| Portal | Donut Multiverse | 100 | 140,000,000,000,000,000 |
| Capital Crest | Crown Oven | 1 | 3,000,000,000,000 |
| Capital Crest | Golden Treasury | 15 | 15,000,000,000,000 |
| Capital Crest | Royal Kitchens | 30 | 150,000,000,000,000 |
| Capital Crest | Grand Banquet | 50 | 15,000,000,000,000,000 |
| Capital Crest | Eternal Crown | 100 | 1,500,000,000,000,000,000 |

## Accumulation and neighboring-building validation

[All52 actual tiers](UPGRADE_ECONOMY_V2_1.csv) include original-cost ratios, fleet/marginal CPS, stock cost C(N), cumulative upgrade/milestone costs and neighboring alternatives; payback is included only as supporting information. C(N) is the unchanged authoritative bulk purchase from zero (one ceil); sequential single purchases cost slightly more. Large accumulated figures use the runtime's existing JavaScript Number precision. Fixed new prices are finite, integral and representable; some exceed the safe-integer range, as existing deep building costs already do. No numeric representation or arithmetic change is introduced.

New tier1 prices are approximately0.90× the next building's initial cost for Neural and0.92× for Portal, so buying the next building remains a meaningful competing goal. Third tiers cost approximately the accumulated30-copy stock (Neural.933×, Portal.955×, Capital.934×). Fourth tiers cost about4.7–4.9× the50-copy stock, creating a substantial visible savings target. Fifth prices are100× the fourth but stock required for100 ownership costs even more than that upgrade: the gate itself is a deep accumulation milestone. No price is reduced because its immediate payback is poor.

At equal100-copy/core-complete ownership, output rises from3,200 Baker CPS through22,400 Farm,160,000 Mine,816,000 Factory,3.92M Logistic,25.6M Power,147.2M Nature,865.6M Neural,5.76B Portal and35.136B Capital. New higher tiers retain substantial output and reset access to inexpensive initial copies compared with a mature preceding fleet; lower buildings retain their own milestones and side-system uses. No building is removed or made mechanically redundant.

| Building | Five upgrade prices summed | Stock100 + five upgrades | Completed CPS |
|---|---:|---:|---:|
| Baker | 530,308,750 | 1,874,819,644 | 3,200 |
| Farm | 5,050,560,000 | 16,010,809,540 | 22,400 |
| Mine | 80,808,960,000 | 359,933,979,938 | 160,000 |
| Factory | 909,100,800,000 | 3,979,476,019,313 | 816,000 |
| Logistic Center | 9,596,064,000,000 | 43,216,672,651,469 | 3,920,000 |
| Power Plant | 106,061,760,000,000 | 473,987,788,233,521 | 25,600,000 |
| Nature | 1,161,628,800,000,000 | 5,188,022,041,114,761 | 147,200,000 |
| Neural Network Bakery | 12,626,400,000,000,000 | 56,680,298,909,984,140 | 865,600,000 |
| Portal | 141,415,680,000,000,000 | 623,782,102,864,854,900 | 5,760,000,000 |
| Capital Crest | 1,515,168,000,000,000,000 | 6,799,775,710,283,977,000 | 35,136,000,000 |

## Long-term goal probe

[Goal-path metrics](UPGRADE_ECONOMY_V2_1_GOALS.csv) evaluate an intentionally goal-directed path: begin with one already-funded copy of the target building; save from zero for its upgrade at each ownership milestone, otherwise save for another copy. Every charge uses canonical purchase math and every income rate uses canonical Production Math. No ROI ranking. No other buildings, global upgrades, recipes, clicks, temporary boosts or side income. First-copy acquisition is included in cost but its startup funding time is excluded. Figures are idealized **visible-production economic hours**, not real-world playtime. Hidden25% production, the12h cap, real deadlines and player decisions are not simulated or modified.

The table shows cumulative economic time in this deliberately isolated path; an actual diversified bakery can fund goals differently.

| Building / tier | Owned | Accumulated cost | P0 model hours | P8 model hours | P12 model hours | P16 model hours |
|---|---:|---:|---:|---:|---:|---:|
| Neural Network Bakery / 1 | 1 | 27,525,256,900 | 25.673 | 0.100 | 0.006 | 0.000 |
| Neural Network Bakery / 3 | 30 | 2,739,173,357,067 | 63.210 | 0.247 | 0.015 | 0.001 |
| Neural Network Bakery / 4 | 50 | 152,752,694,068,813 | 458.358 | 1.790 | 0.112 | 0.007 |
| Neural Network Bakery / 5 | 100 | 56,680,298,909,984,190 | 39121.524 | 152.818 | 9.551 | 0.597 |
| Portal / 1 | 1 | 307,650,200,500 | 43.210 | 0.169 | 0.011 | 0.001 |
| Portal / 3 | 30 | 30,343,225,680,813 | 105.540 | 0.412 | 0.026 | 0.002 |
| Portal / 4 | 50 | 1,704,227,780,907,812 | 767.823 | 2.999 | 0.187 | 0.012 |
| Portal / 5 | 100 | 623,782,102,864,854,900 | 64688.597 | 252.690 | 15.793 | 0.987 |
| Capital Crest / 1 | 1 | 3,302,924,200,000 | 75.896 | 0.296 | 0.019 | 0.001 |
| Capital Crest / 3 | 30 | 328,644,256,766,796 | 186.843 | 0.730 | 0.046 | 0.003 |
| Capital Crest / 4 | 50 | 18,329,210,555,896,936 | 1354.937 | 5.293 | 0.331 | 0.021 |
| Capital Crest / 5 | 100 | 6,799,775,710,283,977,000 | 115622.367 | 451.650 | 28.228 | 1.764 |

Early Baker/Farm tier1 cost1,000/10,000; their isolated first-upgrade accumulation is1,000/1,429 economic seconds from one funded copy before any click/other-building income. Their complete tier3 milestone paths are0.707/1.048 model hours. Tier4/5 goals are deliberately much farther apart. Capital tier5 is not a first-run expectation: its full isolated milestone path is28.228 model hours at prestige12 and1.764 at prestige16; at prestige8 it remains451.650 model hours. Prestige changes the attainable scale without forcing price equalization.

Baker's200-copy extra is a **diversified late-bakery** goal, not an isolated Baker-only path. From zero,200 Bakers plus all seven upgrades cost approximately2.437 quadrillion. A100-Capital/core-complete bakery at prestige12 produces143.917T CPS before other income, covering that backfill in about16.93 constant-production model seconds. The isolated Baker-only path is intentionally not a sensible strategy; unchanged recipes/other buildings can fund its retained long-form goal.

## Prestige and compatibility map

- Restored threshold: **550B × 2^completedPrestiges**. Production remains **2^completedPrestiges**. Threshold is eligibility, never a cap/forced reset; distant late upgrades are not compressed into first prestige.
- Content factory supplies fresh fixed prices/gates; purchase owns eligibility/funds and the purchased flag. Existing shared isUpgradeUnlocked transaction enforcement is unchanged. Canonical production reads purchased flags exactly once. Save writer persists flags by category/index; load hydrates only owned flags, never saved prices or ownership eligibility.
- Load converts only an exact V2 **10T × 2^p** threshold to the restored minimum. Pre-V2 thresholds stay unchanged; arbitrary undersized values still floor and other higher thresholds retain pre-V2 max behavior. Currency, earned counters and eligibility are not removed. Conversion is idempotent, with no load-time storage rewrite.
- SaveVersion1, flags/identities/order, all15 appended upgrades, checksum/backup/stale-tab protection and save coalescing remain. Both legacy boolean/object flags and purchased V2 upgrades below restored gates remain owned. No refunds, charges, schema flags or destructive contraction.
- Forward path: deploy paired runtime/content cache versions1.5.22; load existing snapshots in memory, persist normally on the established safe checkpoint path. A backup retains the previous valid snapshot. Existing open tabs still use their loaded rules; stale-tab protection detects conflicting snapshot writes, but does not merge tabs or make rollout atomic.
- Rollback path: paired V2 runtime/content can still read all categories/flags and recognizes restored550B thresholds through its grandfather branch. A read-only probe of the actual captured V2 loader verified funds, new flags and current eligibility without writes. A rollback reintroduces V2 balance on subsequent actions; it does not require deleting data. Pre-expansion clients do not know the15 appended flags and must not be used for preserving expansion saves. No deployment was performed.

## Verification

The12 focused tests are updated for exact fixed prices/gates,150/200 Baker extras, all15 retained identities/assets, real charges at large magnitudes, direct ownership enforcement, UI formatting/effect text, legacy and V2 flag preservation, pre-V2/V2 prestige restoration/idempotence, exact-once local effects and chronological mutation. The full content fingerprint plus pre-V2 and V2 identity projections protect unchanged fields. Production tests arrange real30-copy authority eligibility rather than bypassing it. No assertions are weakened.

Focused/affected gate: **91 passed**. Complete final repository regression: **276 passed, zero failed, zero skipped** using `node --test tests/*.test.js`. Syntax checks passed for all21 JavaScript files; all four HTML pages passed local asset-reference, unique-ID and JSON-LD checks. Both52-row CSVs were regenerated in memory and matched the committed final-content metrics.

No browser automation or image generation. Required image paths remain unchanged under img/. Long-form pacing still merits player feedback; this mathematical validation does not claim measured completion times.
