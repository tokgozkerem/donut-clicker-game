# Project History

Chronological engineering memory for substantial completed work: previous behavior, reasoning, compatibility decisions, verification, and remaining limitations. Current contracts live in [AGENTS.md](../AGENTS.md); entries here preserve why those contracts exist. Append dated entries for substantial changes, not trivial edits.

## 2026-10-17

### Save Integrity V1

Completed on 2026-10-17 (Europe/Warsaw session date). This entry was verified against the current implementation, its test suite, and pre-V1 source snapshots available during the work; no commit identifier is recorded. Temporary comparison snapshots are not repository dependencies.

#### Goal and why this mattered

Harden local browser persistence without redesigning gameplay or introducing services, accounts, infrastructure, or dependencies. Preserve old saves, recover primary corruption, persist missing settings/checkpoints, reduce recent-action loss, survive storage errors, and block obvious stale-tab writes.

Donut Clicker is an incremental game: long-lived progression is core infrastructure. Lost purchases, upgrades, breeding actions, settings, timer positions, or prestige actions can invalidate much more player effort than a temporary visual defect. Corruption recovery was insufficient without overwrite protection: starting fresh in memory must not let the next autosave destroy the original stored progress.

#### Before Save Integrity V1

The pre-V1 source comparison confirmed:

- Only `gameState` existed as a game snapshot slot; there was no durable backup recovery.
- `saveGame()` directly wrote Base64/checksummed data to localStorage. Encoding/checksum helpers existed, but there was no structural validation gate before replacing the primary.
- `loadGame()` directly parsed legacy JSON, so malformed JSON could abort initialization. Encoded-save decoding returned null on corruption; loading silently returned, with no flag protecting the failed save from later fresh-state autosave.
- Auto-buyer settings and sound volume were absent from the writer. Changes to auto-buyer controls called Save, but their configuration was not serialized.
- Loading expected `lastMineProduction` and `lastBakerProduction`, but saving did not write them. Reload generally restarted those cycles. `orePurchaseLimit` was also omitted.
- The three-minute autosave existed, plus a few direct saves such as manual Save, DonutCoin claims, and offline-modal closure. Building/upgrades and most other durable transactions did not schedule checkpoints; prestige was not saved immediately.
- There were no hidden-page/pagehide checkpoints or stale-tab guard. Several raw localStorage reads/writes/removals could throw through startup or actions.
- Reset removed primary and bakery name; no backup existed to clear.

These are source-backed pre-change observations, not a claim that every possible older release had identical behavior.

#### Implementation overview

LocalStorage and the existing `Game` class remain authoritative. No backend connection, new architecture, or economic migration was introduced.

Important added helpers/state in `script.js`:

- `readStorage()`, `writeStorage()`, `removeStorage()` catch storage exceptions.
- `warnAboutStorage()` and `_storageWarnings` deduplicate warning categories.
- `decodeSave()` combines format recognition and validation; `isValidSaveData()` checks structures consumed by restoration/simulation.
- `requestSave(delay = 1000)`, `_saveTimer`, and `_saveDeadline` batch action checkpoints.
- `setupSaveLifecycle()` and `_lastSaveTime` handle best-effort final checkpoints without duplicate nearby writes.
- `restoreProductionCheckpoint()` restores saved Mine/Baker cycle positions.
- `_saveReady` prevents persistence during hydration. `saveWritesBlocked` protects failed recovery or stale-tab state. `_loadedPrimarySave` tracks the exact observed/stored primary string.

Existing `saveGame()` / `loadGame()` coordinate these helpers. The dormant `applyUpdates()` helper no longer directly writes unguarded JSON; it requests a checkpoint of the current instance. It is not the active migration/load entry point.

#### Save version and compatibility

New snapshots contain `saveVersion: 1`, separate from the existing `gameVersion` and encoding envelope `v: 2`.

- Version 1 snapshots must include the defined top-level fields and pass structural checks.
- Saves without `saveVersion`, or with explicit `0`, use the legacy compatibility path and defaults for missing optional fields. Other explicit versions are not accepted by the validator.
- Legacy plain JSON remains supported. After trimming, text starting with `{` is parsed as plain save JSON; other text is decoded through the existing Base64 envelope path.
- Existing envelope saves remain supported. `generateChecksum()`, `encryptSave()`, and `decryptSave()` retained their algorithms; the function names do not imply actual encryption.
- Upgrade loading still accepts boolean flags and older `{ purchased: ... }` objects. Recipe loading accepts compact scaling and older nested scaling. Existing legacy quest migration remains.
- No destructive migration, formula migration, or economic rebalance occurred. In-memory state is saved in the current schema only through a later successful save.

#### Validation

The envelope path decodes Base64/UTF-8, parses JSON, checks envelope version and checksum, then validates save structure. Plain JSON skips the envelope/checksum stage but undergoes the same structural validator.

The validator rejects missing core state, non-finite/invalid values, wrong selected collection/nested shapes, invalid settings, unsafe object keys, and missing required version-1 top-level fields. It validates persisted structures, not every semantic game invariant. The unchanged non-cryptographic checksum detects some accidental corruption; it cannot authenticate data or prevent deliberate save editing, and Base64 provides no secrecy.

#### Primary + backup model

The slots are exactly `gameState` and `gameStateBackup`.

Successful save ordering:

1. Cancel a pending action timer; require completed initialization and no write protection.
2. Reread primary and compare it with `_loadedPrimarySave` before writing anything.
3. Collect durable state, encode/checksum it, and round-trip it through `decodeSave()` for structural validation.
4. Skip writes if encoded data is identical to primary.
5. Validate the previous primary. Only if it is valid, preserve that exact string as backup before replacing primary. Skip a redundant backup write when it already matches.
6. Write new primary, then update the tab's observed primary and last-save time.

Known-good primary → preserve as backup → write new primary. An invalid primary is never rotated into backup. This protects the last valid recovery point rather than merely maintaining a second copy of whatever happened to be stored. One slot limits write/storage overhead; it is not version history, off-device backup, or transactional storage.

#### Recovery and failure behavior

| Condition | Actual result |
| --- | --- |
| Valid primary | Load it; backup is not needed/read during selection. |
| Invalid/missing primary + valid backup | Load backup and notify the player. Neither stored slot is rewritten just because loading occurred. A later valid save can replace the bad primary without rotating it into backup. |
| Failed recovery with stored data | Use constructor state in memory; set `saveWritesBlocked`. Keep both stored values untouched. |
| Both keys absent and readable | Fresh game can save normally. |
| Storage unavailable at startup | Continue in memory and warn once per category. Unknown stored contents are protected, not treated as an empty store. |
| Primary unreadable + readable valid backup | Backup can load; subsequent writes cannot replace unknown primary contents. Reload once access is restored. |
| Candidate serialization/validation fails | Keep both stored slots; refuse the candidate. |
| Required backup read/write fails | Stop before writing primary. Previous primary and existing backup remain intact. |
| Primary write fails after securing backup | Previous primary remains; secured backup remains. Memory continues, and writes can be retried. |
| Exception during state hydration | Catch it and pause writes. There is no second backup attempt or rollback of already hydrated memory in this branch. |

Recovery does not immediately rewrite storage because loading should not consume or contaminate recovery evidence. `_saveReady = false` also suppresses nested action checkpoints while restoring farm/offline state.

#### Why manual Save is blocked after unrecovered corruption

The game has not proved that fresh in-memory progress is an appropriate replacement for the corrupted stored progress. Letting manual Save bypass `saveWritesBlocked` would silently destroy the same evidence that autosave is forbidden to overwrite. V1 deliberately separates an accidental overwrite from an intentional reset.

The existing Reset Game confirmation is the explicit destructive action. `resetGame()` cancels pending saving and blocks the old instance, removes backup first and primary second, attempts removal of `bakeryName`, then reloads. Either slot-removal failure aborts reload. Constructor defaults and absent slots let the new instance save normally. Both slots must be removed or deleted progress could reappear through recovery. `feedbackClosed` remains a separate preference.

#### Newly persisted state and defaults

| Field | Restored meaning / missing-field default |
| --- | --- |
| `saveVersion` | New writes `1`; absent/`0` treated as legacy. |
| `autoBuyer.enabled` | Global toggle; default false. |
| `autoBuyer.settings[building].enabled` | Per-building toggle; default false. |
| `autoBuyer.settings[building].threshold` | Cost multiple; default 1.5. Known building settings merge defaults; UI rejects non-finite values or values below 1. |
| `soundVolume` | Applied to click audio and settings slider; default 0.1, including preservation of saved zero/mute. |
| `lastMineProduction` | Mine cycle checkpoint; missing defaults to current time. |
| `lastBakerProduction` | Ingredient cycle checkpoint; missing defaults to current time. |
| `orePurchaseLimit` | Remaining allowance; default 10. |

Buildings/upgrades, quests, recipes, balances/clicks/prestige, ores/workers/ingredients, market price/history/trend data, `farmState`, `farmNextAnimalId`, `donutCoin`, bakery name, and `lastActiveTime` were already persisted and remain so. Ores merge defaults during restoration; absent queued multiplier state also receives null defaults.

#### Timer semantics

For version 1, `restoreProductionCheckpoint()` computes elapsed cycle time at the save timestamp (`lastActiveTime - checkpoint`), clamps it between zero and one cycle, and rebases the checkpoint relative to the current time. Mine/Baker timers resume their saved cycle position rather than arbitrarily restarting after reload.

**Saving checkpoints did not introduce offline ore/ingredient production or catch-up batches.** Unversioned/`0` saves retain the previous timestamp fallback; missing timestamps use current time. Main offline donut earnings and farm handling were not redesigned. Offline/background time consistency is a separate future correctness task.

#### Durable-action and lifecycle saving

The existing 180,000 ms autosave remains. Its 60,000 ms throttle is not a one-minute autosave interval.

`requestSave()` schedules most actions at approximately one second. Requests coalesce at the earliest pending deadline rather than restarting the delay indefinitely. Auto-building purchases use `buyItem(key, true)` and approximately 15 seconds; a manual action can expedite an automatic checkpoint. Scheduled saves are silent.

Checkpoint categories: successful building/upgrade purchases; crafting; milestone/dynamic/legacy quest claims; ore buys/sells/Sell All; volume, auto-buyer, and bakery-name changes; animal purchases/sales/renaming; care and feed configuration; breeding starts/completions; contract acceptance/cancellation/completion/rerolls; and crate opening. Prestige saves immediately after its unchanged reset. Manual Save, successful DonutCoin claims, and offline-modal collection/backdrop close continue to save directly.

`setupSaveLifecycle()` adds hidden `visibilitychange` and `pagehide` checkpoints. With no pending action timer, a checkpoint less than one second after `_lastSaveTime` is skipped. A save cancels pending action timers, and identical candidates avoid storage writes. Pending actions can still flush even near a previous checkpoint.

Ordinary clicks, animation frames, and continuous production are not saved on every mutation. This trades a short possible loss window for fewer synchronous localStorage writes. Lifecycle events cannot guarantee saving through browser crashes or process termination.

#### Storage-error handling

Storage access and quota/restriction failures are caught locally in the three wrappers so a persistence problem does not break the game loop or initialization. `_storageWarnings` suppresses repeated warnings with the same category per `Game` instance. There can be separate storage/protection/invalid-state warnings; this is not a guarantee of only one message of any kind.

Write failures alone do not permanently disable retrying. Unreadable startup or failed recovery does pause saving because existing data may be present. Safe wrappers also cover bakery/feedback preference access.

#### Multi-tab decision

Before writing, compare the exact primary string against `_loadedPrimarySave`, captured on loading and updated after successful writes. A changed or deleted primary pauses this tab's persistence before backup rotation, including changes made by old writers or reset. There is no numeric revision field, timestamp arbitration, automatic merge, or remote-state adoption.

The guard blocks obvious sequential stale writes while keeping V1 small and compatible. It is optimistic, not transactional: effectively simultaneous reads/writes may race, and pre-V1 tabs cannot honor it. Full synchronization was deliberately excluded from a local-save integrity task.

#### Verification

Rechecked from repository root when recording this entry:

```sh
node --check script.js
node --check tests/save-integrity.test.js
node --test tests/save-integrity.test.js
```

Result: syntax passed; **20 tests passed, zero failed**. The tests exercise real persistence methods inside a VM with fake storage, DOM, and time. Coverage includes A–H, malformed JSON/Base64/envelopes/checksums/structures, backup rotation, both-slot preservation, storage read/getter/write/remove failures, legacy defaults, settings and cycle checkpoints, transactions, prestige, reset, lifecycle batching, stale tabs, and existing quest/farm save shapes. They are not rendered-browser tests.

Static literal asset references, unique HTML IDs, and JSON-LD parsing also passed across all four HTML pages. This read-only check is reproducible without installing packages:

```sh
python3 -B <<'PY'
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import json, re

class Check(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.refs = Counter(), []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids[a["id"]] += 1
        ref = a.get("src") if tag in ("img", "script") else a.get("href") if tag == "link" else None
        if ref and not ref.startswith(("http:", "https:", "data:", "#")):
            self.refs.append(ref.split("?")[0].lstrip("/"))

for page in Path(".").glob("*.html"):
    text = page.read_text()
    check = Check()
    check.feed(text)
    assert all(n == 1 for n in check.ids.values()), page
    assert all(Path(ref).is_file() for ref in check.refs), page
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
        json.loads(block)
    print("PASS", page)
PY
```

This does not validate generated asset paths, network services, schema/content agreement, CSS layout, or browser interaction. Pre/post source comparison verified the checksum/encoding and production/economic formula methods unchanged; other gameplay action changes were persistence calls and the automatic-purchase save flag. There is no committed pre-V1 fixture or comparison command requiring temporary files.

**Browser behavior was not tested. No deployment was launched or modified.**

#### Files changed by Save Integrity V1

- `script.js`: guarded serialization/load/recovery, validation, missing fields/defaults, safe storage, scheduling/lifecycle, reset and stale-tab protection, durable-action save calls.
- `index.html`: only the script cache query changed from `script.js?v=1.5.4` to `script.js?v=1.5.5`.
- `tests/save-integrity.test.js`: new dependency-free regression suite using Node's built-in test runner.

#### Gameplay impact and remaining limitations

V1 did **not** change production formulas, balance, economy, quest mechanics, or prestige reset rules. It changed durability and restoration of requested settings/checkpoints, not game design. Production Math V1 is upcoming and was not implemented here.

Deliberate V1 limits: optimistic tab protection rather than atomic cross-tab transactions; crash loss within action/automatic/periodic checkpoint windows; same-origin storage clearing can remove both slots; no cloud synchronization, accounts, export/recovery UI, or full transactional storage model. UI state, active combo sessions/catch queues, animations/caches, purchase quantity, and buy/sell mode remain transient. Upgrade flags remain position-indexed.

Additional observed edge case for future work: hydration exceptions pause persistence but do not retry backup or restore pristine in-memory state. Main production/multiplier, quest, farm, mobile, and offline/background correctness issues remain separate work, summarized in the current guide. None were fixed by this entry or by Save Integrity V1.

### Production Math V1 — Economic Core Stabilization

Completed on 2026-10-17 (Europe/Warsaw session date), after Save Integrity V1. This entry describes inspected code and executed checks; temporary pre-change snapshots supported comparisons but are not runtime/test dependencies.

#### Goal

Give every production consumer one deterministic mathematical authority, activate already-configured quest production rewards, avoid prestige/temporary double application, and preserve configured balance and supported saves. Retain the static frontend, existing Game class, local saves, and separate farm/time/quest policies. No dependencies, backend integration or deployment changes.

#### Previous behavior and confirmed problems

- `updateTotalPerSecond()` combined mutable `originalProduction`, special Cursor calculation, additive recipe bonuses, legacy timed factors, global donut upgrades and mastery. Load/prestige rebuilt rates; dedicated non-Cursor purchases cumulatively multiplied them. `craftDonut()` also directly replaced building rates.
- `calculatePerSecond()` independently summed count × `item.production`, omitting donut upgrades/mastery from quest/reference CPS and CPS-derived click bonuses. Main production credited a cached, periodically refreshed `totalPerSecond`.
- `multiplierState` quest rewards updated `multiplierSources.questBuff`, but normal production consumed `productionMultiplier` only while `activeMultipliers` was nonempty. An ordinary claimed 2× reward therefore did not increase passive income.
- Prestige was baked into reconstructed rates as `2^prestigeCount` and represented again in `multiplierSources.prestige`. The legacy updater combined this source with legacy factors, allowing double prestige. Old `activateMultiplier()` wrote a reward to both quest and legacy representations, allowing duplicate factors. Expired legacy entries were pruned during HUD rendering rather than by one economic owner.
- `calculateClickValue()` counted every purchased nonItemUpgrade, accidentally giving Auto Catcher an extra 1% CPS. Its legacy multiplier wrapped a CPS-derived component that could already contain that multiplier.
- Per-building `totalProduced` omitted global donut/mastery bonuses credited to the balance, so attribution could not reconcile with actual passive income.
- Loading calculated missing completed-milestone frozen rewards before restoring recipes/prestige/farm and the full economic state.

Progression depends on these values: inconsistent production affected actual income, quest/reference CPS, click income, attribution and potentially prestige accounting. Fixing a displayed value alone would leave the economic disagreement intact.

#### Authoritative model and order of operations

`getProductionBreakdown(now)` derives a pure in-memory snapshot from configured base rates, building counts, purchased flags, recipe craft counts, prestige count, farm mastery and live timed rewards. It exposes per-building components and total components for audit/tests.

For each building:

```
localRate = configuredBaseRate
          × product(purchased non-special building upgrade factors)
          × (1 + sum(applicable recipe craftCount × productionBonus))
boostedRate = localRate × globalDonutUpgradeProduct × mastery
              × 2^prestigeCount × temporary
flatRate = Cursor only: 0.1 × owned non-Cursor building count, if Donut Cursor owned
buildingCPS = count × (boostedRate + flatRate)
effectiveCPS = sum(buildingCPS)
```

Two +25% applicable recipe bonuses produce +50%, not 1.25². Independent configured factors multiply: donut upgrades retain 1.03 each; mastery retains 1.05 at level 20; prestige retains 2 per level. The Donut Cursor flat rate remains outside **all** these boosts, per explicit pre-change code. Buying a non-Cursor can therefore raise that building's output and owned Cursors' flat output.

`temporary = live quest amount × product(independent live legacy amounts)`. Quest rewards retain one active/one queued slot. A queued reward does not simultaneously multiply production. Expired factors are ignored by pure reads; `updateQuestMultipliers()` owns pruning/activation. New `activateMultiplier()` is a queue adapter, not a second writer. Unpersisted `multiplierSources` and dormant farm/event placeholders were removed: farm/event had no gameplay writers, and quest/prestige already have canonical owners. Farm PROD continues to affect animal production only; no advertised but disconnected Farm buffs were activated.

`calculatePerSecond()` and read-only `totalPerSecond` return the snapshot's effective CPS. `updateTotalPerSecond()` and `rebuildItemProductionsFromSaveState()` only refresh compatibility/display mirrors. `item.production`, `originalProduction` and saved `productionMultiplier` do not determine economic output. `getFinalProductionMultiplier()` and `updateProductionMultiplier()` remain compatibility adapters; the former reports prestige × temporary, not another multiplier to apply to effective CPS.

All existing CPS consumers now reach the authority: passive credit, main HUD, statistics, building details/contribution, current-CPS quests and milestones, quest history, farm CPS-priced actions/rewards, and offline main-donut earnings. No DOM scan participates in calculation.

#### Clicks and catches

```
click = purchased normal Cursor-upgrade product × temporary
      + boostedCPS × (0.01 × purchased normal clicking-upgrade count)
      + Donut Cursor flat bonus per click
```

The additive CPS fraction comes from each purchased normal clicking definition's `multiplier - 1` (all six currently 1.01 → 1% each). The percentage-of-CPS term already contains global/prestige/temporary production effects and is not multiplied again. Direct manual base does not acquire prestige/global building bonuses. Flat Donut Cursor click bonus is not boosted. Auto Catcher is excluded by its `specialEffect: automation`; its configured 20% chance/automation logic is unchanged. Manual and automated catches call the same `calculateClickValue()`, with the existing ×1.1 successful-combo bonus once.

Crafting retains the existing flat `recipe.production × temporary` payout structure; its permanent building effect is derived from craft counts. Global building upgrades/prestige do not independently boost that flat payout.

#### Quest snapshot boundary

Current-CPS requests now use effective CPS. Existing 120-second rolling-median policy, target/reward coefficients, caps/minima and frozen values remain unchanged. The misleading `getClickValue()` quest helper was renamed `getQuestClickEffortEstimate()`: its existing `1 + stableCPS × 0.005` is a balancing estimate, not playable click power. Changing that coefficient/formula to actual click value would be quest balance work and was deliberately avoided.

Missing completed-milestone reward snapshots are now frozen after full economic hydration. Saved frozen rewards remain intact. Persisted historical CPS samples are retained rather than guessed/recalculated from current ownership; samples from the previous engine can transiently reflect its old definition until normal history turnover. Newly recorded samples use authoritative CPS.

#### Income and progression counters

`creditDonuts(amount, countsAsEarned = true)` is the common income gate, used by every donut income path. It rejects non-finite/negative amounts and overflowing additions without modifying balances, warning once per instance for invalid credit attempts. Production input handling rejects string coercion and substitutes safe numeric defaults. Finite representable late-game output is not capped; an unrepresentable snapshot exposes zero CPS with `valid: false` and is not credited. JavaScript Number precision/range remains a limitation.

The loop credits one snapshot × nonnegative elapsed seconds to balance and `totalDonutsEarned`. Per-building `totalProduced` receives that same effective attribution, including global bonuses. Historical under-attribution is not retroactively rewritten.

Existing classifications were preserved rather than rebalanced:

| Income | Balance | `totalDonutsEarned` |
| --- | --- | --- |
| Manual, passive, manual/automatic catches | Yes | Yes |
| Crafting, offline main-donut earnings | Yes | Yes |
| Farm goods, animal sales, contracts, crates, Sell All farm goods | Yes | Yes |
| Dynamic/legacy/milestone quest donut payouts | Yes | No |
| Ore sales / Sell All ores | Yes | No |
| Blocked Farm buff consolation | Yes | No |

The earned counter resets on prestige and drives production/prestige goals; it is not literal lifetime income. Strong evidence for changing the excluded classifications was absent. `questTracking.currentRun.totalProduced` remains an unused stored field; no new semantics were assigned. Click counters, spending counters, quest targets and prestige thresholds/reset rules were not redefined.

#### Save compatibility and legacy reward decision

`saveVersion: 1`, primary/backup keys, validation, encoding, checksum, protection flags, write order, action batching, lifecycle and stale-tab safeguards remain. Legacy JSON, pre-schema envelopes and V1 snapshots still load. No destructive migration or new save schema was introduced. Upgrade flags remain position-indexed; base definitions, owned upgrades, recipes, prestige and structured timed rewards reconstruct output. Old rate/scalar caches cannot reapply bonuses. `productionMultiplier` remains serialized as a derived temporary-factor compatibility field.

Old dual-written rewards lack a common identity. The adapter ignores at most one live legacy record matching the active quest's amount and end time within **100 ms**, accommodating consecutive old `Date.now()` calls. Independent legacy records still stack and are not removed merely by calculating or loading. New activations do not dual-write. Independent same-amount rewards with effectively identical expiry cannot be distinguished perfectly from old mirrors; the heuristic is deliberately narrow and explicitly covered by tests. Sub-millisecond/edge-of-expiry timing is not historical interval integration.

Forward transition is derivation from compatible ownership/timed state, not storage replacement on load. Rolling back code leaves readable old-format snapshots; the old engine would also restore its old math bugs. Do not roll back save integrity protections to roll back production work.

#### Timing scope

Offline donut efficiency remains 25%, minimum absence one minute, cap 12 hours. Offline consumes current authoritative CPS instead of reconstructing modifiers. It does not integrate historical buff durations or purchase timing. Live production samples current state for the existing elapsed interval; intervals crossing expiry/purchases are not split. Background policy, resource timer checkpoints and separate farm offline rules were not redesigned. Mine/Baker offline production was not introduced. These remain Offline/Time Consistency work.

#### Files/functions changed

- `script.js`: added numeric/upgrade/modifier/breakdown/income helpers and read-only CPS accessor; centralized click math; adapted legacy APIs; removed source duplication/cumulative rate writes; wired loop attribution, building/HUD/stat/reference consumers, crafting and income paths; moved missing reward freezing after hydration. No full Game-class split.
- `index.html`: script cache query only, `v=1.5.5` → `v=1.5.6`.
- `tests/helpers/game-harness.js`: extracted existing VM harness for both suites, with fake DOM queries/geometry and access to original methods for DOM-value checks.
- `tests/save-integrity.test.js`: imports shared harness; its 20 test cases remain.
- `tests/production-math.test.js`: 43 new regression tests.
- `AGENTS.md`, `docs/PROJECT_HISTORY.md`: current production contract and engineering history.

#### Verification

Executed from repository root:

```sh
node --check script.js
node --check tests/helpers/game-harness.js
node --check tests/save-integrity.test.js
node --check tests/production-math.test.js
node --test tests/*.test.js
```

**63 passed, zero failed: 20 save-integrity + 43 production tests.** Production coverage includes all configured buildings/dedicated upgrades/global upgrades/recipes; additive recipe stacking/isolation; prestige 0/1/4 plus combinations and real consecutive resets; claimed 2× actual credit; expiry/queues; independent/dual-written legacy rewards and round trips; click components/utility exclusion/high CPS/manual+automatic combos; controlled elapsed credit and attribution; purchases/crafting; stable/current/frozen quest inputs; order independence; DOM-value/read-only rendering; offline policy consumption; retained earned classifications; malformed/overflow safety. DOM tests run actual rendering methods against fake elements; they are not browser playtests.

Pre/post comparison used secured source snapshots: configured upgrades/items/recipes, farm definitions, production/click milestone arrays, prestige strength/threshold constants and offline policy matched. **200 deterministic mixed-building/upgrade/recipe/prestige/mastery fixtures matched pre-change passive production** without temporary buffs, within 1e-12 relative tolerance. Temporary/click bugs were checked against manually derived expectations rather than the broken old results. An informational Node VM run calculated 10,000 production snapshots in about 121 ms; this is not a browser benchmark or acceptance threshold.

The static HTML procedure recorded in the Save Integrity entry passed again: four pages' literal local asset references exist, IDs are unique, and JSON-LD parses. Source searches/diff review found no active secondary CPS calculation, no cumulative economic rate multiplication, and no direct donut-income additions bypassing `creditDonuts()`; remaining mutable rates/scalars are output-only compatibility mirrors. Save encoding/checksum/validation and economic definition blocks matched the pre-change source.

**Browser behavior was not tested. No deployment was launched or modified.**

#### Balance impact and remaining work

No configured numeric balance values changed: base rates/prices/escalation, upgrade costs/factors, recipe costs/bonuses/scaling, prestige strength/requirements/reset retention, quest target/reward formulas and coefficients, crate probabilities, farm balance, and offline efficiency/cap remain. Actual income intentionally changes where existing advertised buffs were disconnected, stale/duplicated modifiers were applied, global CPS consumers omitted bonuses, or utility ownership incorrectly granted click power. Already-frozen rewards are preserved; new reward estimates can reflect corrected CPS.

Remaining limits/ambiguities: same-signature legacy mirror inference; historical stable/frozen quest policy and income classifications; current-state rather than interval-integrated time; Number precision/range; no browser playtest. Quest correctness/scaling, disconnected Farm mechanics, mobile layout/navigation and nontransactional hydration remain separate tasks. Save V1's optimistic multi-tab races, crash batching window and browser storage clearing are unchanged. Production Math V1 is complete; future balance changes must extend this model rather than add an alternative engine.

### Quest Correctness V1

Completed on 2026-10-17 (Europe/Warsaw session date), after Production Math V1. This pass fixes quest mechanics without changing production formulas, redesigning quests or broadly tuning their rewards/difficulty.

#### Before and reproduced failures

The full trace covered seven milestone tracks (building, production, clicks, CPS, total buildings, upgrades, quest completions), all nine recurring types, five slots, snapshots/counters, claim paths including legacy adapters, timed failures, full/live rendering, and save hydration.

Direct pre-change reproduction found:

- With actual CPS 800 and an expired zero-CPS history sample, `getStableCPS()` returned 0 and a completed production milestone estimate returned 1. The selector sorted every stored sample without enforcing the documented 120-second window. Normal ticks pruned history later, but load-time reward freezing happened first.
- Missing completed-milestone rewards froze before the existing final `fixBuildingCosts()` call. Full production hydration from Production Math V1 was already fixed; stale saved price caches could still distort the reward cap.
- Rejecting `creditDonuts()` still let a dynamic claim discard the quest/start cooldown; milestone claims also marked rewards claimed after failed credit. Legacy claims duplicated lifecycle ownership and could leave claimed slots occupied.
- After a timed quest's deadline, calling `checkDynamicQuestProgress()` directly could complete it. Expiry existed only in `updateDynamicSlots()`, while click checks called the progress path directly.
- Lists followed slot/definition order and exposed only one unclaimed tier per milestone track. Full rendering and live updates had no shared ready-first order; live slot replacement did not verify quest identity.
- Milestone progress could fall after completion (notably expired CPS buffs) even though its reward remained claimable.
- Spending quests tracked raw price sums while purchases deducted the rounded bulk charge: two Cursors cost 33, but previously recorded 32.25 spent.
- 75/100-upgrade goals could not be reached: the actual definition inventory contains 58 purchasable upgrades.
- Supported partial quest records could omit counter baselines. Their next progress check subtracted zero and counted an entire run, potentially falsely completing them.

#### Reward correctness and the 1-donut distinction

The existing early reward floors explicitly include 1. Fractional rewards are floored and capped against the existing purchase/CPS policy; an early 1 is not intrinsically a bug. Dynamic targets/rewards intentionally snapshot at generation, and milestone rewards freeze at completion. These policies, coefficients, floors and caps were preserved.

`getStableCPS()` now reads only finite, nonnegative samples within the past 120 seconds, using `calculatePerSecond()` when no valid sample remains. It does not reconstruct production or discard legitimate recent zero samples. Median averaging also avoids overflowing merely by adding two large finite samples first. No new CPS engine was introduced.

Load restores canonical prices before freezing missing milestone rewards. `_questStateLoading` prevents generation/freezing during partial hydration. New reward creation/freezing requires a valid authoritative production snapshot and finite reward arithmetic; invalid results are refused, not converted to 1. Existing finite frozen rewards—including old 1s—are never guessed or inflated. Their original completion-state evidence is unavailable.

Incomplete milestone cards remain explicitly estimated (`~`); completed cards display the exact stored reward without that estimate marker. Dynamic cards and claims consume the same stored `quest.reward`. A saved reward is not recalculated because current ownership/CPS changed.

#### Final lifecycle and ownership

Dynamic quests:

```
generate once → active → progress → completed/claimable
→ successful claim → persisted cooldown → one replacement
```

`generateQuestForSlot()` refuses active slots/cooldown bypasses. `getDynamicQuestProgress()` owns all recurring progress sources; the existing economic earned-counter classification remains. `expireTimedQuest()` handles failure once on both update paths. Completion at the exact deadline is allowed; an already-completed timed quest stays claimable afterward. Combo progress is the smaller capped percentage of both required objectives. Invalid/negative progress cannot produce invalid bar widths.

Milestones:

```
definition → progress → valid frozen reward + latched completion
→ successful claim → claimed history
```

`completeMilestoneQuest()` freezes from valid state before marking complete; repeated checks do not repeat completion. Completed milestones retain attained progress even if live CPS falls.

`deliverQuestReward()` delegates to the shared income gate with the existing balance-only quest classification, or to the existing multiplier queue. Failed credit/queue refusal does not mark claimed, clear a slot or start cooldown. Successful claims latch before rendering; repeated/rapid claims cannot pay again. `claimQuestReward()` is a compatibility adapter for live slots, not an independent claim engine. Slot buttons carry quest identity to reject stale replacement claims.

Counter semantics deliberately remain: the dynamic run counter increments once at completion; the meta total combines it with claimed non-meta milestones. Claim/render/load do not increment dynamic completion again; meta milestones do not count themselves. Unifying or renaming that historical product policy would affect progression and remains future work.

Spending objectives now receive the exact rounded building charge once from `buyItem()`. Per-building tier-spend/refund calculations retain their existing raw-price basis; historical spending counters cannot be reconstructed retroactively and were not inflated.

#### Rendering and ordering

`getActiveQuestEntries()` and `getQuestListSignature()` are shared by full/live rendering. All completed unclaimed cards appear first in a `Ready to Claim` group using existing card/section styles. Every completed unclaimed tier is visible; one next unfinished tier per track remains visible. Existing slot/track/tier order stays stable within each status group.

Smart updates rebuild structural order only on lifecycle/identity changes, including during hover; progress/timers and unfinished milestone estimates update in place. Reward credit, generation and freezing never happen in rendering or tab switching. No CSS or visual redesign was introduced.

#### Persistence and compatibility

Save version 1, both old formats, primary/backup keys, validation/encoding/checksum, corruption guards and stale-tab protection remain unchanged. Valid active/completed quests, progress, reward snapshots, timestamps, cooldowns, completion counters, active/queued multipliers round-trip without regeneration or payout.

Small compatibility handling applies only to incomplete/inconsistent legacy state:

- Missing baselines use loaded counters minus saved progress; explicit zero is preserved. Combo percentage establishes a conservative lower bound for both components rather than inventing which component was ahead.
- Completed flags remain latched and completed progress is normalized to at least the target. Loading does not newly count those completions.
- An old claimed slot becomes an empty cooldown receipt without granting anything; preserve its existing cooldown or derive one from the snapshot time.
- Missing tracking fields merge constructor defaults.

`requestQuestCheckpoint()` schedules generation/completion/expiry state without writing every progress update. It respects pending action checkpoints and automatic-purchase 15-second batching. Explicit claims/manual actions still expedite to approximately one second. Periodic/lifecycle saves and save-failure protections remain.

#### Impossible goals and balance impact

Removed the unearned 75/100-upgrade milestones; 58 upgrades exist, and all remaining upgrade targets are at most 50. No replacement reward/goal was added. Previously completed/claimed 75/100 records are restored as retired history/entitlements, preserving any frozen reward and preventing repeat claims.

**These are the only configured quest target removals. No reward amounts, coefficients, floors/caps, cooldowns, difficulty multipliers or other target formulas were retuned.** Correcting stale-state inputs and actual spending tracking can change newly computed rewards/progress; existing reward entitlements remain intact. Production/click formulas, prestige, buildings, upgrades, recipes, Farm, ads/analytics and offline policy were not changed.

#### Files changed

- `script.js`: quest history selection, load boundary/defaults, lifecycle/progress/expiry, delivery guards, spending source, ready-first/full/live rendering and compatibility handling.
- `index.html`: script cache query only, `1.5.6` → `1.5.7`.
- `tests/quest-correctness.test.js`: 38 focused quest regressions.
- `tests/helpers/game-harness.js`: fake fragment/attribute/class/tree support for exercising actual quest rendering.
- `tests/production-math.test.js`: the existing missing-reward fixture now calls `fixBuildingCosts()` before calculating its expected cap. That fixture changes counts directly; canonical prices are necessary to represent the same valid state restored by loading. Assertions/coverage were retained, not weakened.
- `AGENTS.md`, `docs/PROJECT_HISTORY.md`: current quest contract and this entry.

#### Verification

Executed syntax checks for `script.js`, shared harness and all three test files, then:

```sh
node --test tests/*.test.js
```

**101 passed, zero failed: 38 quest + 43 production + 20 save-integrity tests.** Quest tests cover every generated type and progress source, stale-history/load-price roots, legitimate early 1s, preview/payout equality, fixed rewards, failed/rapid/duplicate/legacy claims, one-time counters and replacement, timed boundaries, rounded spending, canonical CPS, ready-first/full/live rendering during hover, UI nonmutation, active/completed/cooldown saves, multiplier queues, incomplete legacy baselines, impossible/retired goals and checkpoint batching.

Pre/post source comparison confirmed unchanged production/click/credit helpers, game-loop production, prestige, save validation/checksum/encoding, building/upgrade/recipe definitions, and reward calculation formulas. Source searches verified reward assignments remain in generation/freezing, not rendering, and transition ownership is explicit. Static HTML checks again passed for all four pages: literal local assets, unique IDs and JSON-LD parsing.

**Browser behavior was not tested. No deployment was launched or modified.** VM DOM tests check emitted state/order/content, not browser layout or real event timing.

#### Remaining Quest Balance / time work

CPS-scaled click/combo targets, early minimum/cap behavior, reward purchasing-power relevance, cooldown pacing and mixed historical meta-counter semantics still need Quest Balance V1 review. Large untimed click goals are slow, not proven impossible, so were not tuned. Existing frozen/dynamic rewards can remain small because their original snapshot was small; no retrospective rebalancing was attempted.

Timed checks still observe the existing wall-clock/earned-counter policy; offline or frame intervals crossing a deadline are not integrated retrospectively. That belongs to Offline/Time Consistency. Dynamic claimed history remains represented by its existing counter/cooldown rather than a newly invented archive. Save Integrity's optimistic tab races and nontransactional hydration remain unchanged.

### Quest Balance V1

Completed on 2026-10-17 (Europe/Warsaw session date), after Quest Correctness V1. This changes recurring quest balance and generation eligibility, not milestone rewards or quest lifecycle architecture.

#### Audit and confirmed balance problems

All nine recurring types, five slot pools, reward calculations, economic caps, timers and generation choices were traced before editing. Previous difficulty multipliers were easy/medium/hard/special = 1/2/3/5; the slots retain their existing 10/12/25/50/90-minute cooldowns and pools.

| Type | Previous target / dependency | Previous reward basis before floors/caps | Problem |
| --- | --- | --- | --- |
| Click | `max(10, ceil((30 + stableCPS × .05) × difficulty))` | clicks × `(1 + stableCPS × .005)` × rate | Physical input scaled without bound with production/prestige. |
| Produce | `max(50, ceil(stableCPS × 60 × difficulty))` | target × rate when CPS positive | Hard was only 180s; zero/tiny CPS used an arbitrary flat target. |
| Buy any | `ceil(2 × difficulty)` | average relevant building cost × count × rate × .5 | Ignored escalating prices and cheapest completion route. |
| Buy specific | `ceil(1.5 × difficulty)` for a random owned/near-affordable building | cumulative cost × rate × .5 | Owned did not mean affordable; no duration budget. |
| Timed produce | `max(50, ceil(stableCPS × 45))`, 60s deadline | target × rate ×1.2 | Short challenge retained, but startup/temporary planning was inconsistent. |
| Multiplier | `max(50, ceil(stableCPS ×45×difficulty))` | Existing timed multiplier, no donut payout | Work timing differed from ordinary production; temporary snapshots could strand work. |
| Efficiency | `max(stableCPS+.1, ceil((stableCPS+.5)×(1+.1×difficulty)))` | CPS gain ×20×rate×2 | Stable history could put target below current CPS; rounding and gains ignored purchasable increments. |
| Combo | clicks `(20+.02×CPS)×difficulty`, production `20×CPS×difficulty` | click estimate + production effort, each ×rate | Unbounded clicks and short production component. |
| Spending | `max(50, ceil(next meaningful price ×difficulty×.3))` | target ×rate×.3 | Purchase benchmark could imply trivial or impractical spending. |

Old rates were 5/8/12/15%. Cash caps selected the smaller of 2/4/6/10% of a purchase benchmark and 15/30/60/90 seconds of stable CPS, subject to existing stage/difficulty minimums. Cheap old buildings could collapse late rewards. Floors could also exceed a cheap transaction's intended rebate.

A pre-change state with 54,900,010 CPS produced easy/medium/hard/special click targets of 2,745,031 / 5,490,061 / 8,235,092 / 13,725,153. At two clicks/sec even the easy assignment meant roughly 381 hours. Its hard production payout represented only 1.10 seconds of production. These are source/fixture observations, not browser playtesting.

#### Difficulty and planning decision

Recurring assignments are near-term goals. Intended ordinary production work is 60/180/360/480 seconds (easy/medium/hard/special). Physical clicks assume two deliberate clicks/sec: ordinary easy goals take roughly 40–54s, medium 120–162s, hard 300–400s, special 360–450s across existing stages. Timed quests remain intentionally shorter exceptions, with 45 seconds of planned work inside the unchanged 60-second deadline. Purchases/progression may complete quickly from banked cash; no artificial waiting was added.

`getQuestBalanceContext()` consumes Production Math's canonical breakdown. Reference CPS is:

```
C = min(effectiveCPS, boostedCPS / temporaryMultiplier + flatCPS)
R = max(2, C)
```

This is a conservative planning projection of already-calculated components, not an alternative production formula. Permanent prestige/recipe/upgrade/mastery effects remain; flat Cursor output is not divided by a boost it never received. Expiring buffs cannot inflate a new long objective. The 2-donut/s startup work proxy represents two base clicks/sec while passive output is tiny/absent. Credited CPS and every production formula remain unchanged. Targets/rewards freeze at generation, as before.

#### Numeric balance inventory

`dynamicQuestBalance` is the current recurring configuration:

| Difficulty | Work seconds (old ordinary production) | Base / maximum clicks | Purchase-count maximum | Reward rate (old) | Cap baseline / maximum seconds (old max) | Purchase-cap fraction (old) |
| --- | --- | --- | --- | --- | --- | --- |
| Easy | 60 (60) | 80 / 120 | 3 | 10% (5%) | 3 / 15 (15) | 10% (2%) |
| Medium | 180 (120) | 240 / 360 | 5 | 12% (8%) | 9 / 45 (30) | 15% (4%) |
| Hard | 360 (180) | 600 / 800 | 8 | 15% (12%) | 18 / 90 (60) | 20% (6%) |
| Special | 480 (300) | 720 / 900 | 10 | 15% (15%) | 24 / 120 (90) | 25% (10%) |

Other changed coefficients/rules:

- Click target: `ceil(min(maxClicks, baseClicks × (1 + .05 × (stage-1))))`; replaces direct CPS growth. Stage is still the existing 1–8 policy, so growth is at most 35% before hard caps. No new progression stages.
- Combo: half that bounded click target (rounded up), plus `ceil(R × work seconds)` production. Replaces `.02×CPS` clicking and `20×CPS×difficulty` production. Combo reward uses ×1.2 for combined attention and the larger overlapping effort component, rather than adding the same earned work twice.
- Produce/multiplier work: `ceil(R × seconds)`; replaces the universal 50 floor and multiplier challenge's `45×difficulty` seconds. Multiplier amounts 1.15/1.25/1.5/2 and durations 20/30/45/60 seconds are unchanged.
- Timed work: `ceil(R×45)`; same 60-second deadline and existing ×1.2 reward factor. Fresh-run target is 90, achievable with normal manual clicking; no new timer behavior.
- Purchase budget: `R×seconds + .25×min(balance,R×seconds)`. Geometric costs determine quantity, capped at 3/5/8/10 (old any counts 2/4/6/10; old specific counts 2/3/5/8). Generation requires a basket within budget and worth at least `.75×R×seconds`, otherwise that type is skipped. This avoids replacing an unrealistic requirement with a meaningless cheap action.
- Any-building cost/rebate uses a cheapest mixed basket, not an average expensive route. Specific baskets choose uniformly among meaningful affordable options; otherwise they are not normally generated.
- Spending target: `ceil(max(R×seconds,2×cheapest next price))`; replaces `.3×difficulty×purchase benchmark` and its flat 50 floor. Generation requires two cheapest purchases to fit the same budget.
- Efficiency: live CPS + `min(max(.1,.05×liveCPS),best affordable canonical per-unit rate)`. Replaces stable-CPS offsets/ceiling and difficulty-based percentage. One budgeted building suffices; extra Cursor synergy helps. No efficiency assignment is generated during a temporary production factor or without a strictly positive affordable gain.
- Purchase reward remains cost ×rate×.5 (effective rebates now 5/6/7.5/7.5%, previously 2.5/4/6/7.5%). Spending remains target ×rate×.3 (now 3/3.6/4.5/4.5%, previously 1.5/2.4/3.6/4.5%). Both additionally cap at their own whole-donut rebate, with a contextual one-donut rounding allowance. Existing stage floors can no longer override that ceiling. Configured building prices start at 15, so this does not create a costless transaction reward.
- Click reward effort is the larger of actual canonical click income and `C × target / 2`, replacing the old `.005×stableCPS` estimate. This preserves active-work relevance when physical targets stop growing with CPS. The legacy estimate helper remains unchanged for compatibility, with no active recurring reward callers.
- Production reward effort is the target; timed effort is target ×1.2; efficiency effort is `C×work seconds`; combo effort is `1.2×max(production target, clicks×actual click value)`. Multiply effort by difficulty rate, apply existing minimums and new caps, then floor to whole donuts.
- Recurring cash cap: `max(existing floor, min(C×maxCapSeconds, max(next meaningful price×purchaseCap,C×minCapSeconds)))`. The baseline is a floor on the cap, not a guaranteed reward. It prevents cheap purchase benchmarks erasing late-game value while keeping rewards bounded in production time.
- Generation retains original pools and uniform random choice among eligible candidates. It first prefers unused exact types, then the least-represented activity family (production / clicking / purchasing / efficiency). No fixed weights were added. If every candidate is unsuitable, fall back to existing production rather than leave an unusable slot. Occupied-slot/cooldown guards remain.

Unchanged minimums: stage `[1,1,2,3,5,10,20,50]` × difficulty `[1,2,3,5]`. A new global reward minimum was not introduced. All slot cooldowns, milestone targets/reward formulas, and all non-quest economic constants remain unchanged.

#### Economics and equivalent production time

Ordinary production rewards generally represent 3–15s / 9–45s / 18–90s of reference production when meaningful, with actual effort often below those maximum caps. Rates start at 10/12/15%; cap baselines prevent late collapse. Timed rewards typically represent 8.1s for 45s work at hard/special difficulty. Transactions remain rebates rather than income substitutes. One-donut fresh rewards can still occur when passive production is zero.

With unchanged slot cooldowns, the sum of all five maximum cash-cap allowances divided by the shortest relevant work+cooldown is under 13% of steady production. This is a deliberately loose static bound, not a forecast; typical fixture rewards are lower, and multiplier challenges retain the original bounded timed reward. No large random simulation or full progression simulator was added.

#### Representative deterministic results

Six fixtures live in `tests/helpers/quest-balance-fixtures.js`. Their canonical CPS values are Early 1.5; Early-mid 120; Mid 11,431.981; Late 106,252,713.56; Prestiged low 34 (prestige 2); Prestiged higher 40,960 (prestige 8). Counts/upgrades/recipes are defined there; no CPS is independently reconstructed.

| State | Type / difficulty | Target | Estimated work | Donut reward | Reward / current CPS | Achievable? |
| --- | --- | --- | --- | --- | --- | --- |
| Early | click / easy | 84 | 42.0 s | 5 | 3.33 s | Yes* |
| Early | buySpecific / medium | 2 Baker | 190.8 s | 13 | 8.67 s | Yes* |
| Early | produce / hard | 720 | 480.0 s | 27 | 18.00 s | Yes* |
| Early-mid | click / easy | 96 | 48.0 s | 576 | 4.80 s | Yes* |
| Early-mid | buySpecific / medium | 5 Farm | 158.2 s | 1,113 | 9.28 s | Yes* |
| Early-mid | produce / hard | 43,200 | 360.0 s | 2,160 | 18.00 s | Yes* |
| Mid | click / easy | 104 | 52.0 s | 59,446 | 5.20 s | Yes* |
| Mid | buySpecific / medium | 3 Cursor | 162.5 s | 111,486 | 9.75 s | Yes* |
| Mid | produce / hard | ≈4.116 million | 360.0 s | 207,459 | 18.15 s | Yes* |
| Late | click / easy | 108 | 54.0 s | 573,764,653 | 5.40 s | Yes* |
| Late | buySpecific / medium | 5 Mine | 148.5 s | 946,930,147 | 8.91 s | Yes* |
| Late | produce / hard | ≈38.251 billion | 360.0 s | 5,737,646,532 | 54.00 s | Yes* |
| Prestiged low | click / easy | 84 | 42.0 s | 102 | 3.00 s | Yes* |
| Prestiged low | buySpecific / medium | 3 Farm | 164.4 s | 306 | 9.00 s | Yes* |
| Prestiged low | produce / hard | 12,240 | 360.0 s | 612 | 18.00 s | Yes* |
| Prestiged higher | click / easy | 96 | 48.0 s | 122,880 | 3.00 s | Yes* |
| Prestiged higher | buySpecific / medium | 3 Logistic Center | 164.9 s | 368,640 | 9.00 s | Yes* |
| Prestiged higher | produce / hard | 14,745,600 | 360.0 s | 737,280 | 18.00 s | Yes* |

*Estimates assume two deliberate clicks/sec for physical work, target/current CPS for passive production, and basket cost/current CPS for purchase-saving work. Banked cash can make purchases immediate; reinvestment/manual income can shorten estimates. They are not guarantees or browser playtest measurements. Tiny purchase rounding differences do not change the duration bands. All nine types were inspected in these six states; the table shows three per state rather than dumping every row. Deterministic five-slot generation yielded click, produce, buySpecific, timedProduce, combo: two clicking, two production and one purchase objective, instead of three production objectives. Random choices remain possible in play.

#### Compatibility exception and preserved contracts

New targets/rewards apply at generation. Existing rewards, completed entitlements, production/purchase goals, multiplier state and deadlines are not repriced or rerolled. Save schema/version/encoding, backup guards and storage failure behavior are unchanged.

One small load-time adjustment is required to prevent old saves retaining absurd physical workloads: unfinished click targets above the difficulty hard cap are clamped to that cap; unfinished combo click components above half the cap are clamped similarly. Keep IDs, raw baselines/counters, production requirement and stored reward. Refresh descriptions; shared progress logic updates the combo percentage. Loading does not complete, count, claim or pay the quest. Completed goals are untouched. The operation is idempotent and writes neither storage slot merely by loading; normal quest checks still own completion. It extends existing `restoreQuestLifecycle()` compatibility handling without a new migration framework/version.

No changes to claim-once, queue delivery, cooldown transitions, completed-first ordering, progress-source classification, prestige reset rules or milestone correctness. The 101 prior regression cases remain unchanged and pass.

#### Files and verification

- `script.js`: recurring balance table/context, effort/cap calculations, budgeted purchase/efficiency plans, generation eligibility/variety, target formulas and the narrowly required legacy input cap.
- `index.html`: script cache query only, `1.5.7` → `1.5.8`.
- `tests/quest-balance.test.js`: 18 focused balance regressions.
- `tests/helpers/quest-balance-fixtures.js`: six deterministic snapshots reused for tests/reporting.
- `AGENTS.md`, `docs/PROJECT_HISTORY.md`: current balance contract and this entry.

Syntax checks passed for runtime/test/helper JavaScript. `node --test tests/*.test.js`: **119 passed, zero failed — 18 balance + all existing 101 tests**. Coverage includes click bounds, prestige and immediate post-prestige startup, duration bands, temporary/flat projections, frozen assignments, spending and escalating purchase budgets, transaction caps, affordable current-CPS progression, timed startup, representative rewards, cheap-benchmark resistance, activity variety, aggregate cash-cap bound and idempotent legacy input normalization.

Pre/post source comparisons confirmed unchanged main production/click/income formulas, game-loop credit, prestige, Farm/offline behavior, save writer/loader/validation/encoding, quest progress/claim/delivery/expiry/cooldown/rendering methods and milestone calculations. Only balance eligibility/target selection changed in generation, and only the stated target-cap compatibility block changed in quest restoration. Building/upgrade/recipe definitions, all old test files and the shared VM harness are unchanged. Four-page static HTML asset/ID/JSON-LD checks passed.

**Browser playtesting was not performed. No deployment was launched or modified.**

#### Remaining design limits

Difficulty bands describe ordinary work, not forced waiting. Rich players may instantly satisfy purchases/progression, efficient clicking/investment may accelerate production objectives, and timed quests remain short bursts. Purchase fallback intentionally favors a viable existing objective over an unhelpful basket; variety is best effort when only two activities are feasible. Old assigned non-click objectives/rewards remain grandfathered rather than globally rerolled. Cooldown pacing, banked-cash opportunities, meta-counter wording and optional abandon/reroll UX can be considered later; no such systems were added. Historical interval accounting and browser/mobile playtesting remain separate tasks.

### Farm Reconstruction

Investigated on 2026-10-17 (Europe/Warsaw session date). Analysis only: **Farm Correctness V1 is not implemented**. Only this entry and an AGENTS pointer changed; no gameplay, UI, balance, formulas, saves, tests or deployment changed.

#### Evidence and reconstructed intent

Read current contracts/history, Farm definitions and all Farm methods in `script.js` (animal definitions near line 797; simulation/UI from `createDefaultFarmState()` through `setupFarmTabs()`), `index.html` Farm guide/controls, relevant CSS, README and plans, save validation/hydration, offline processing and prestige. README/plans supply no detailed Farm specification; the HTML feedback notice explicitly calls Farm early access. Definitions plus player-facing tooltips are the strongest evidence, not a complete historical design document.

The visible design is a side economy/animal-collection loop: buy main-game Farm buildings to unlock animals/features → buy animals → accumulate capped goods → choose free/paid feed and care → sell or commit goods to contracts → earn donuts, XP, crates/buffs → breed improved trait/variant lines → mastery/storage/automation and eventually +5% main production. Main Farm-building CPS and animal goods are separate: building upgrades/Classic Donut affect the building, not animal output. Farm cash rewards use shared `creditDonuts()`; CPS-priced feed/crates consume the Production Math authority.

#### Confirmed defects and unfinished promises

- `tickFarm()` has an empty care-cycle decrement block: advertised two/three-cycle bonuses never exhaust. `performCareAction()` can apply Calm even without an eligible action. The overlay's `farm-care-timer` text is static; KPI timing is separate.
- `updateFarmBreedingTabSmart()` changes only timers/bars for active slots. Start/completion do not invalidate `dataset.rendered`, so structural cards/available animals can remain stale until a full render/tab reopen. Barn partial updates likewise miss new offspring roster/traits and expired cooldown badges. `startBreeding()` also relies on UI-only checks for distinct parents/capacity/Long's FC25 unlock.
- `gainMasteryXP()` spends XP per level, but `updateFarmMasteryBadge()` subtracts a cumulative previous-level threshold again, allowing negative bar width. Badge refresh occurs only through XP gain, leaving loaded/reset mastery labels stale until then.
- Only PROD buffs have a gameplay consumer. COST/OFFLINE/QOL/EVENT are awarded, displayed and timed but do not implement advertised building discounts/offline efficiency/automation/click effects. Do not blindly wire COST: generic strength scaling and higher-score replacement conflict with a discount factor where lower is better.
- Alert, Sturdy, Keen Eye, Generous, Diplomat and Contract Star effects have no consumers; Ration never accelerates cooldown. Focused's single-good/buff-duration, VIP's buff-strength and Legendary's two-good requirement are unused. Volatile text promises 0.5–3×; code rolls 0.5–2×.
- Trait-slot variants are displayed but not used by trait rolling. Gold's passport chance only announces a name; Epic only announces a guarantee. There is no inventory, assignment or inheritance path. Merchant/Pioneer/Golden have partial readers if a passport is already present in saved state; other passport effects are dormant.

#### Decisions required before correctness work

- Mastery level20 gives a real 1.05 main-production factor and is called “permanent” in guide/notification, but `resetRunStateForPrestige()` recreates **all** Farm state and IDs. Decide cross-prestige permanence versus run-local permanence; preserve the current reset until authorized.
- Capacity is 20 **per species**. UI blocks breeding at capacity; completion explicitly discards offspring if purchases/another slot filled it meanwhile. There is no animal sale/release/removal action (older generic income-inventory prose is not evidence of one). Decide whether to retain loss, reserve capacity, or provide deliberate roster replacement; no hidden removal intent was found.
- Manual `sellGoods()` grants one crate roll and 3 XP per successful action, not per unit. Splitting future production into small sales gives more rolls/XP. Contract/breeding completion also roll; auto-collection deliberately does neither. Tier probabilities are 5% wooden / 1.5% silver / 0.3% gold / 0.05% epic; payouts at opening equal 60/300/900/1800 seconds of current CPS. Expected donut payout alone is 11.1 CPS-seconds per eligible roll. Decide event versus goods/effort-based rewards before changing this economic incentive.
- Production trait bonuses are averaged across a species, but sell-price traits/variants/passports multiply species-wide once per animal. Decide whether this asymmetry is intentional. Goods prices scale with Farm count/mastery, not total CPS; feed can scale with CPS, while crates do. Late-game goods relevance/paid-feed losses are balance questions, not proof of a broken formula.
- Contracts consume all goods at acceptance and auto-pay on elapsed completion, despite READY/Deliver UI. `expiresAt` is generated but unused. Choose automatic versus manual delivery, expiry semantics, and resolve Volatile range, care Mastery2 gating (guide only), and undefined QOL/EVENT/passport scopes before implementing promises.
- Offline handling is explicitly separate: minimum one-minute absence, 12-hour cap; base goods and contracts advance at 25%, breeding at 100%. Goods omit live modifiers/feed charges; cooldowns/buff remaining do not advance, care uses wall-clock deadlines, and no offline auto-sale occurs. Keep policy decisions with Offline/Time Consistency. Define “care cycle” across mixed species before implementing expiry. `productionTimer`, per-animal `feedPlan`, both `lastFarmTick` fields and `rumors` are inert placeholders, not authoritative timers.

#### Persistence, verification and next scope

`saveGame()` serializes `farmState` and `farmNextAnimalId`; `loadGame()` merges nested defaults then processes offline time. Animals/traits/variants/passports, fractional goods, species feed, contract board/active progress/rerolls, breeding parents/program/progress, mastery, buffs, care state, crates and stats persist. All reset on prestige. UI selections/expanded rosters/render flags are transient. No Farm schema migration was introduced.

Small ad hoc Node probes used existing VM methods/fake DOM/storage/time, with no new test files: demonstrated non-expiring care, unmodified Ration+Sturdy cooldown, full-barn offspring loss, missing Epic passport grant, one batch versus ten single-sale rolls, populated Farm deep-equal immediate save/load, complete prestige reset, offline breeding with unchanged cooldown/buff, stale breeding structure, and negative mastery bar. Four existing economic fixtures illustrated standard-feed gross goods income (one traitless animal per unlocked species, continuous selling, no storage loss): early-mid 7.30/s vs 120 CPS; mid 101.67/s vs 11,431.98 CPS; late 797.72/s vs 106,252,713.56 CPS; prestige8 7.30/s vs 40,960 CPS. These illustrate differing scaling, not a proposed rebalance or normal full-roster returns.

No browser testing, new suite, large simulation or deployment. Source/test hashes were checked to confirm documentation-only edits. Recommended next scope: agree the above policies; then fix care/breeding/mastery state-to-UI defects and implement only explicitly agreed advertised effects, with small persistence/lifecycle regressions. Do not silently add animal removal, permanent mastery, new offline policy or crate rebalance under correctness work.

### Farm Correctness V1

Completed on 2026-10-17 (Europe/Warsaw session date). Implemented the approved correctness scope after Farm Reconstruction, without replacing the Farm architecture or changing Production Math, Quest contracts or Save Integrity protections.

#### Approved decisions and previous failures

The user explicitly approved permanent mastery, confirmed reward-free animal release, expiring care, defined missing effects and variant capacity. Follow-up decisions supplied Ration's previously unspecified **0.75 cooldown multiplier**, multiplicative with Sturdy, and directed **all breeding cooldowns to begin after completion**, rather than at start. Ration's 0.7 production and existing charges remain unchanged.

Previously, care cycle decrementing was empty; breeding start/completion and cooldown readiness left stale cards/rosters; mastery UI mixed within-level XP with cumulative thresholds; prestige erased the advertised permanent mastery; mutation functions depended on UI-only breeding checks. Traits/affixes/slot variants had unused definitions, while crates announced passports that were never granted. These are the problems fixed here; Farm economics and offline policy were not broadly retuned.

#### Final behavior and ownership

- `resetRunStateForPrestige()` preserves only mastery level/XP from Farm state. Animals, goods, active/board contracts, breeding, temporary buffs, crates, care, collection counts and IDs reset. Display caches/selections reset and mastery refreshes. Production Math's existing conditional 1.05 factor remains the sole main-CPS implementation; nothing accumulates another multiplier. All mastery-derived benefits survive as level-dependent effects subject to normal Farm unlocks.
- `getFarmCareCycles()` / `restoreFarmCareCycles()` and `tickFarm()` consume fractional cycles separately for species owned at the care action. One cycle is one average animal's existing modified production interval; herd size does not burn the benefit faster. Pet/Treat keep their configured two/three cycles and 1.25/1.4 factors. Only goods fitting storage consume cycles; full storage pauses them. A tick crossing expiry credits the boosted part then normal output. Invalid/repeated care actions cannot compound Calm; late actions remain reduced. Overlay countdown updates; Alert applies at window creation. FC10 gating is unchanged; misleading guide-only Mastery2 wording was corrected.
- `startBreeding()` validates slot/program/species unlocks, distinct same-species parents, trait/cooldown state, active-parent exclusivity, capacity and funds. Long requires FC25 in the mutation path. `completeBreeding()` requires an active, ready slot, preventing early/duplicate offspring. Parents receive their cooldown at completion: 3600 seconds × Ration 0.75 if selected × that parent's Sturdy 0.85 if present. Completion reads current feed/traits. Program durations/costs remain. The cap is still 20 per species; full-barn completion still explicitly reports lost offspring, with no over-cap roster or pending-space reservation.
- `releaseAnimal()` confirms removal, gives no rewards, clears matching selections/inactive parent references, refreshes UI and requests the existing one-second save checkpoint. Active parents cannot be released until breeding finishes; there is no cancellation/refund mechanic. This is release, not an animal market.
- `getFarmRosterSignature()` / `getBreedingRenderSignature()` invalidate structure for changed animals, traits/variants, names, active slots, feeds and cooldown readiness. Normal timers update without full rebuilds; start/completion and roster changes no longer require tab reopening. Mastery bar now uses within-level XP / next requirement and refreshes after gain/load/prestige.

#### Traits, affixes and variants connected

Existing numeric definitions are unchanged. New global presence effects apply once, not per duplicate trait-holder: Alert +5 seconds per new window; Keen Eye +5% **relative** crate chance, preserving base thresholds/tier ratios; Diplomat −10% new requirements, rounded up, preserving pre-discount payout; Contract Star +20% live contract progress (additive with mastery11's existing +5%) and +15% buff duration frozen at generation. Sturdy applies only to the parent holding it. Generous gives one stored unit every tenth successful manual collection of its species when present, tracked by persisted `collectCounts[good]`; automatic collection receives none of these collection-event rewards.

Focused now enforces one goods type and ×1.2 buff duration; VIP applies ×1.3 buff strength; Legendary enforces two goods types and retains its existing ×3 requirements/×1.8 payout. New Focused/Legendary co-occurrence is excluded because their goods promises conflict. Existing assignments and frozen rewards are not regenerated/repriced. Urgent, Generous, Demanding, Chain and Volatile payout behavior remain. Volatile's 0.5–2× implementation versus 0.5–3× text is explicitly unresolved.

`getBreedingTraitCapacity()` serves allocation and preview. Normal program + Mentor still caps at four, then the actual offspring's slot variant adds its configured one slot: Long + Mentor + qualifying variant can reach five; normal animals cannot. Roll the variant before allocating traits. Existing saved animals are never truncated, padded or rerolled. Preview includes capacity ranges and both possibilities for different parent variants.

#### Deferred systems and preserved boundaries

No Passport inventory/assignment or COST/OFFLINE/QOL/EVENT effect was invented. New unsupported buff applications are declined with an unavailable notice, without a dummy buff or consolation payout; existing saved dormant buffs remain readable and follow their existing expiry timer. Contract/collection labels identify unavailable categories. Gold/Epic crates explicitly identify Passport rewards as unavailable rather than announcing a nonexistent grant. Cash, goods and XP remain; no substitute reward or PROD reroll was added.

Base crate thresholds, one manual-sale roll regardless of quantity, contract/breeding rolls, payout CPS coefficients and auto-collector's reduced reward behavior remain. Keen Eye conditionally activates its already-configured relative bonus; this is the only trait-conditioned probability effect added. Sale-event farming incentives, goods-versus-CPS scaling, cost economics, contract automatic payout/unused expiry/Deliver presentation and undefined passport scopes remain design work.

`calculateOfflineEarnings()` is unchanged: base goods/contracts at 25%, breeding at 100%, minimum one minute/cap twelve hours; no new feed charges/modifiers/auto-sales/care-cycle advancement or historical cooldown/buff simulation. Offline completion assigns the newly approved post-completion cooldown, without deducting hypothetical later offline cooldown time. Offline / Time Consistency V1 owns that integration.

#### Compatibility and rollback

Existing `farmState`/`farmNextAnimalId` readers/writers remain authoritative. Add optional `collectCounts` (default empty) and `careBonus.cyclesByType` (old global cycle count expands to currently owned species); validate finite nonnegative counts without requiring either new field in old saves. Keep the integer `cyclesRemaining` compatibility summary. Legacy active jobs, animals, traits, variants, mastery, contracts and rewards remain readable. No save-version bump, destructive collection conversion, storage-key change or migration framework. New durable actions use existing batching/protection flags; load itself does not rewrite either recovery slot.

Old clients can read the additive shapes but retain old bugs/reset rules and cannot honor permanent mastery. Existing stale-tab protection remains optimistic. Code rollback requires no data contraction: retain new fields and never reconstruct released animals. Mastery already erased by an older prestige cannot be recovered from absent state. No destructive migration/rollback was performed.

#### Numeric changes, files and verification

Only newly specified balance value: Ration cooldown ×0.75 (25% reduction), explicitly provided by the user. Cooldown start timing is also explicitly changed by user direction. Existing trait/affix/variant values are activated, not retuned. No animal/building prices, base output, feed charges, prestige strength/thresholds, main production/click formulas, quest economics, crate base probabilities/payout coefficients, mastery XP requirements or offline coefficients changed. Extra capacity is conditional on the configured +1-slot variant; the global normal capacity is unchanged.

Files: `script.js` (Farm simulation/rendering, release, prestige preservation, additive load/validation), `index.html` (accurate guide text and cache query 1.5.8 → 1.5.9), `tests/farm-correctness.test.js` (24 focused cases), `AGENTS.md` and this history. No dependencies or test-harness changes.

Verification: `node --check` for runtime and every test/helper JavaScript; `node --test tests/farm-correctness.test.js`; then one final `node --test tests/*.test.js`. **143 passed, zero failed: 24 Farm + all 119 existing save/production/quest/balance regressions.** Coverage includes care expiry/boundaries/full storage, live UI structural changes, mutation guards/capacity, mastery display/permanence/exact-once CPS, confirmed release without payout, Ration/Sturdy, all six connected traits, affixes/variants, deferred rewards and legacy/additive save round trips.

Pre/post source comparisons confirmed unchanged constructor/content definitions, canonical production/click/credit/game-loop methods, all Quest methods, prestige caller, offline-policy method, feed-cost/sell-price/auto-collector methods, save writer and encoding/checksum. Static local asset references, unique HTML IDs and JSON-LD checks passed on all four HTML pages. **Browser testing was not performed. No deployment was launched or modified.**

### Mine & Ore Reconstruction

Audited on 2026-10-17 (session date). Investigation only; **Mine/Ore Correctness V1 and Mine/Ore Balance V1 are not implemented**. Only this entry and a small AGENTS pointer changed. Source tracing covered definitions, purchase/worker creation, production, market/chart/UI/help, transactions, income consumers, save validation/hydration, prestige, loop/lifecycle timing, README/plans and relevant prior history.

#### Reconstructed system

Mine buildings provide ordinary authoritative donut CPS and independently add one worker per purchased Mine, including bulk/automatic purchases. `produceMineResources()` grants five ores per worker per processed global minute, ignoring saved `worker.productionRate: 3`. Rarities total 0.99; unmatched draws retry without consuming an ore. Actual accepted probabilities are Copper 70/99, Iron 20/99, Gold 7.5/99, Diamond 1.5/99 percent-equivalents (70.7071%, 20.2020%, 7.5758%, 1.5152%). Five ores are guaranteed; the missing 1% does not mean lost ore. Whether to normalize intentionally or correct a definition is unresolved. The old v1.2.7 changelog says three ores; live help and current production say five. No active ore use in upgrades/crafting exists despite README's upgrade-use claim.

`updateMarketPrices()` shares the production clock. For each ore, with independent uniform U,V: `T' = clamp(0.85T + 0.4(U-0.5), -1, 1)`; `P' = max(0.2B, P[1 + v(0.7T' + V-0.5)])`. Base prices B are 160/400/800/1600; v is .02/.035/.05/.08. Trend memory halves in about 4.27 processed cycles. Trend tends toward zero; price has **no base-price reversion or upper bound**. Ignoring floor/clipping, symmetric percentage returns have negative expected log growth, not guaranteed upward growth; persistent trends still permit large excursions. The floor creates a no-price-loss entry at exactly 20% of base, with waiting/opportunity cost. Market orders do not influence prices; there is no spread/fee or immediate buy/sell profit. History normally holds twenty processed samples, with no timestamps. Opening an empty-history panel seeds its first sample.

This is a secondary-income/speculation minigame, not a progression-required resource system. At base prices expected value is 278.79 donuts/ore, or 1,393.94 per worker/minute. Assuming one worker/Mine and full liquidation, representative canonical-CPS fixtures give:

| State | Mines | Main CPS | Ore/min | Ore value/min | Share of passive income |
| --- | ---: | ---: | ---: | ---: | ---: |
| First Mine alone | 1 | 50 | 5 | 1,393.94 | 46.4646% |
| Early-mid | 1 | 120 | 5 | 1,393.94 | 19.3603% |
| Mid | 15 | 11,431.98 | 75 | 20,909.09 | 3.0483% |
| Late | 80 | 106,252,713.56 | 400 | 111,515.15 | 0.001749% |
| Prestige8 fixture | 1 | 40,960 | 5 | 1,393.94 | 0.05672% |

These are analytical base-price estimates, not playtesting or forecasts. Ore quantity/prices lack building upgrade/recipe/prestige scaling while main CPS gains those effects and higher buildings. This explains declining relevance; unchecked upward price paths can also make returns disproportionately large. Restoring relevance requires a balance/design decision, not a correctness coefficient change.

#### Bugs, risks and classifications

- **High / Confirmed bug:** `sellAllOres()` bypasses allowance checks/decrements entirely, even at zero trades, contradicting the guide's ten buy-or-sell trades per cycle. Single-card transactions spend one allowance/unit. Whether a batch should cost one trade, one per type or one per unit is not established; decide before implementing.
- **High / Confirmed elapsed-time defect:** `updateProduction()` processes one batch/market step when overdue and resets the checkpoint to now, dropping extra cycles and remainder. A 300.5-second delayed frame grants one batch, loses four full intervals and 0.5 seconds. Hidden/suspended behavior depends on actual RAF delivery. Fix policy/integration with Offline / Time Consistency rather than automatically granting all hidden time at 100%.
- **Medium / Confirmed bug:** both sale methods ignore `creditDonuts()` failure. Single Sell removes ore/allowance even when payment is refused; Sell All clears inventory before attempting credit. Finite extreme prices/balances can reproduce unpaid loss. Require successful credit before committing inventory changes.
- **Medium / Confirmed validation/transaction mismatch:** fractional inventory is accepted by saves; selling 0.5 ore credits one full price and leaves -0.5, causing later snapshot validation failure. Zero/below-floor saved prices and zero history are also accepted; zero history produces non-finite change percentages. Guard logical invariants without destroying recoverable saves.
- **Medium / Confirmed numeric risk:** a finite accepted price of 1.7e308 can overflow to Infinity on one market step; no price arithmetic guard exists and subsequent snapshots fail validation. Number precision also allows a 160-donut buy at balance 1e20 to round to no deduction. This is not proof an ordinary session reaches these extremes.
- **Low / Confirmed UI bug:** worker header refreshes only through `addWorker()`, not load, so saved workers render as HTML's zero until another Mine purchase. The timer also uses pre-reset elapsed time on its production frame.
- **Low / Confirmed compatibility bug:** an oversized saved history remains oversized because updating shifts only one element after pushing one. Normal new histories stay within twenty.
- **Likely bug / consistency risk:** loading accepts Mine/worker disagreement or missing legacy workers without reconciliation. Production follows worker-array length as long as at least one Mine exists, allowing missing or excessive output. Normal purchases preserve 1:1 and prestige clears both; no ordinary purchase drift was found. Evidence does not settle how to preserve exceptional old worker entitlements.
- **Dead / legacy:** worker productionRate, workerCycleRemainingTime and the uncalled `updateGameVersion()` worker-repair branch do not drive live production. The 0.99 rarity total is a likely definition issue; five versus three is a historical contradiction, not permission to rebalance.

#### Persistence, accounting and time boundary

Snapshots retain ore inventory, workers, price/history/trend, allowance and Mine checkpoint. Version1 rebases saved cycle phase onto load time; closed sessions grant no ore/market catch-up. Unversioned saved timestamps remain absolute and can trigger one overdue step after reopening. Allowance survives reload; it resets only on a processed market cycle, not merely because real time passed. Prestige clears Mines/workers/ores and resets market price/history/trend, allowance and checkpoint. Ordinary reload is not a proven reroll exploit because lifecycle saves normally flush; replaying unsaved market state requires an uncommitted/failed checkpoint.

Both sale paths explicitly use `creditDonuts(..., false)`: balance increases, earned-total/prestige/production-quest counters do not. Ore purchases likewise do not count toward building-only spending quests. Passive/click/Farm goods/contracts/crates count as earned; quest payouts do not. Avoiding bought-and-resold principal inflating progress is a plausible explanation, not documented intent. Mined-sale classification remains ambiguous. Ore proceeds still indirectly buy buildings/upgrades and advance progression.

Recommended correctness scope: decide batch-trade units and worker authority; make sales atomic, validate integral inventory/positive finite market arithmetic with recovery-safe handling, hydrate UI, enforce history bounds, and align live worker production with its documented authority without changing five to three arbitrarily. Keep price reversion/caps, late-game rewards, purchase budgets and speculative economics in a separate Balance V1. Offline / Time Consistency must unify visible/hidden/closed policy, delayed-cycle/remainder integration, market/trade-clock behavior, acquisition-at-boundary rules and legacy checkpoint compatibility.

Verification used small deterministic existing-VM probes: correct bulk workers, retry sampling/ignored worker rate, zero-allowance Sell All and duplicate-sale no-op, delayed-frame loss, failed-credit inventory loss, fractional/zero/overflow states, save phase/allowance/trend/worker mismatches, prestige reset and oversized history. Three fixed 60-step market paths illustrated memory, floor and potential growth; sustained positive-edge draws produced Diamond ~210× base, **not an expected outcome**. No randomized fuzzing, new test files, full-suite rerun, browser test or deployment. Source hashes verified documentation-only changes.

### Mine/Ore Correctness V1

Implemented on 2026-10-17 (session date), following Mine & Ore Reconstruction and explicit user decisions. Goal: reliable worker ownership, atomic quota-respecting trades and conservative save recovery, without changing market balance or elapsed-time policy.

#### Previous failures and approved decisions

Normal purchases maintained one worker/Mine but loading trusted independent worker arrays, allowing missing/excess production and a stale worker label. Sales consumed inventory even when the shared credit gate refused payment. Sell All bypassed the advertised allowance, fractional stock could become negative, market overflow could commit Infinity, malformed history could exceed twenty points or display non-finite percentages, and strict whole-save rejection prevented recovery of otherwise useful progress with isolated bad ore values.

The user selected Mine count as authoritative; excess legacy workers are removed without ore compensation. Production remains five ores/worker per processed minute with the existing retry-normalized 99% weights. All ore-sale proceeds stay non-earned to prevent purchased/resold principal farming prestige. Sell All consumes **one trade per ore unit**, within the existing shared ten-unit limit. Existing market coefficients, floor and absence of an economic upper cap remain.

#### Final implementation

- `reconcileMineWorkers()` runs after economic Mine ownership loads, through purchases and before production. Retain compatible existing worker entries/fields up to Mine count, fill missing entries with canonical legacy-shaped workers, and trim excess. `updateWorkerCount()` refreshes after load/purchase/production/prestige. `worker.productionRate: 3` remains serialized dead state; it does not change the live five-ore rate. The uncalled `updateGameVersion()` branch remains legacy, not a second reconciliation owner.
- `transactOres()` is the common atomic commit for card purchases/sales and batch sales. Validate known ores, positive finite prices, nonnegative whole stock, exact representable unit changes, aggregate value, funds and allowance first. Buying requires a finite nonnegative deduction that actually decreases balance. Sales perform one successful `creditDonuts(value, false)` before changing inventory/allowance. Reject failed/overflowing/rounded-away operations without consuming stock or trades; successful UI paths then refresh and request the existing one-second checkpoint.
- Sell All plans up to the remaining allowance in existing Copper/Iron/Gold/Diamond order. Every sold unit consumes a trade, excess stock remains, and partial liquidation explicitly reports the limit. A failure in a selected leg aborts the whole planned batch; zero allowance sells nothing. No trade-limit increase or selective value-maximizing sale policy was added.
- `normalizeOreCount()` preserves finite nonnegative integers, floors positive fractions and recovers invalid/negative/non-finite counts to zero. `getSafeOreMarketState()` preserves valid positive quotes, recovers invalid quotes to configured base, defaults/clamps trends, filters invalid history and retains the last twenty valid samples. No ore compensation or unrelated collection migration.
- Market updates retain their original trend/noise/volatility/floor calculation; candidate overflow keeps the prior valid quote rather than adding an ordinary price cap. Updates trim history correctly. Display filters chart input and omits a percentage when its calculation is non-finite, without changing economic state; invalid runtime quotes show Unavailable.

#### Save compatibility and trust boundary

Readers/writers remain `ores`, `oreTypePrices`, `workers`, `orePurchaseLimit`, `lastMineProduction`, and existing Mine ownership. No schema/version/key/envelope/checksum change or external dependency. `loadGame()` alone opts into `decodeSave(raw, { recoverMineState: true })`: recognize/verify format and checksum, reject unsafe keys, copy/repair the specified Mine fields, then run full structural validation. Unrelated invalid core/Farm/Quest structures still fail safely. Legacy missing workers use the reconciliation path; version1 completeness requirements remain.

Default `decodeSave()` and live candidate validation remain strict: integral inventory, positive finite quotes/history, clamped trend and history ≤20. Invalid live state cannot be silently repaired merely to pass saving. Backup rotation uses strict raw validation, so a primary requiring recovery never replaces a valid backup. Loading/repairing writes neither stored slot; later ordinary saves persist normalized in-memory state under existing protection/rotation rules. Bad checksums cannot be repaired into valid progress. Unsafe-key checking is shared with validation so targeted recovery cannot erase evidence of forbidden object keys before checking.

Valid inventory/prices/trends/history/allowance/checkpoint round-trip; version1 phase rebasing and the legacy timestamp fallback remain. Prestige still clears Mines/workers/stock, resets quotes/history/trend, allowance to ten and Mine checkpoint, while retaining approved permanent Farm mastery. No stale-tab, storage-error, lifecycle, backup/write-blocking or reset protection was removed. Old clients can read normalized shapes but retain their old bugs; code rollback needs no data contraction and must not resurrect trimmed workers or previously sold ore.

#### Preserved economics and deferred work

No configured economic numbers changed: Mine prices/CPS, worker cycle, five ores, rarity weights, base prices, volatility, .85/.4/.7 trend/noise coefficients, .2 floor, ten-unit allowance, prestige requirements or main production formulas. Sell All's formerly free/unlimited liquidation is intentionally replaced by the approved one-unit/one-trade contract. Proceeds still affect balance only, not earned totals/direct prestige/production quests; ore purchases do not enter building-only spending counters. Whole-unit and numeric repairs are correctness behavior, not compensatory rewards.

The production scheduler and `calculateOfflineEarnings()` are untouched. Multi-minute delayed frames still grant one batch/market step and lose extra cycles/remainder; no catch-up, offline ores, market evolution, elapsed trade resets or acquisition proration was introduced. Offline / Time Consistency V1 owns these. Mine/Ore Balance V1 owns late-game relevance, ten-unit throughput, speculation/floor/unbounded-price policy and any new ore uses. JavaScript Number precision/range remains a limitation; transactions reject operations that would overflow, fail to change a balance, or fail to represent the requested stock delta.

Files: `script.js` (Mine/market helpers, atomic trading, recovery/validation and worker UI), `index.html` (guide explains unit-based Sell All; cache query 1.5.9 → 1.5.10), `tests/mine-correctness.test.js` (15 focused cases), `AGENTS.md` and this history. Existing test files/harness and unrelated systems remain unchanged.

#### Verification

`node --test tests/mine-correctness.test.js`: **15 passed**. One final `node --test tests/*.test.js`: **158 passed, zero failed**, including all existing 143 Save Integrity/Production/Quest/Farm regressions. New coverage includes missing/excess legacy/current workers and header refresh, bulk/retry production, atomic single/batch trades and credit failures, zero/partial/full Sell All, non-earned accounting, integer recovery, invalid prices/trends/history, overflow, read-only safe display, round trips/checkpoints/prestige, checksum/unsafe-key rejection, strict candidate validation and protection of the last valid backup after targeted recovery.

Syntax checks passed for all nine runtime/test/helper JavaScript files. Local asset references, unique IDs and JSON-LD checks passed across all four HTML pages. Pre/post source comparisons confirmed unchanged constructor definitions/economic values, canonical production/click/credit methods, main scheduler, all Farm/Quest methods, prestige caller, offline calculation/checkpoint restoration and save writer/encoding/checksum. Hash comparison limited changes to the five listed files; existing tests/harness are unchanged. **Browser testing was not performed. No deployment was launched or modified.**

### Mine/Ore Balance V1

Implemented on 2026-10-18 (session date). Read the current contracts, Reconstruction/Correctness entries and actual production, purchase, market, transaction, persistence, prestige and UI paths first. This pass changes ore balance and market-action semantics only; Mine's normal CPS identity and all offline timing policies remain intact.

#### Why the old balance failed

The old momentum/random-percentage walk had no price mean reversion or upper economic bound, allowing extreme long-session prices; the 20%-of-static-base floor also offered no further quote loss at its boundary. Static 160/400/800/1600 prices yielded ~1,393.94 per worker/minute regardless of progression, falling to 0.001749% of passive income in the late fixture. Correctness V1's explicitly temporary one-unit/one-trade interpretation limited practical liquidation to ten ores/minute despite output of five per Mine. These are superseded balance decisions, not reopened correctness defects.

#### Final price and progression formulas

Keep existing trend memory: for independent uniform U,V each processed market step, `T' = clamp(.85T + .4(U−.5), −1,1)`. With current quote P, reference R, volatility v, set `x = ln(P)−ln(R)`, `x' = .85x + v(.7T' + V−.5)`, and `P' = exp(ln(R)+x')`, bounded to **.5R–2.5R** for ordinary quotes. Non-finite candidates retain the prior valid quote. This introduces **15% log-displacement reversion per step**, retaining ore-specific volatility `.02/.035/.05/.08`, trend coefficients `.85/.4/.7`, cadence and history20. Trend memory still halves in ~4.27 cycles; prices follow short trends rather than permanently wandering.

For a new empty-stock snapshot consume the authoritative production breakdown, removing only temporary factors: `C = boostedCPS / temporaryMultiplier + flatCPS`. Permanent building/global upgrades, recipes, prestige and mastery enter through that model; no new CPS formula or main-production change. Let `B = 2^floor(log2(C))`, with 1e-12 log-space roundoff tolerance at exact power-of-two boundaries, W = Mines, d = number of building tiers beyond Mine represented by the highest owned building, and `s = max(.03, .20/(1+d))`. Retry-normalized base expected value `E = Σ(basePrice × rarity)/Σrarity = 278.7878788`. Then `referenceScale = (B/W) × (60s/(5E))` and `R_ore = configuredBasePrice × referenceScale`. This quantized permanent-capacity anchor yields a share `s × B/C` at reference prices, approximately half to all of the stage's 20%→10%→6.67%→…→3% planning share.

**Holding protection:** never change the reference while any ore remains, including purchased ore. Refresh only after an empty-stock Mine purchase (after the entire bulk operation) or before an empty-stock production batch. Buying ore→buying upgrades/Mines therefore cannot raise that held position's reference. Liquidate the full inventory to qualify for the next reference refresh; keeping a token ore intentionally retains the old snapshot and can delay relevance after progression. Reference changes preserve each quote/reference ratio, clamped to safety bounds, and reset chart history to the rebased quote. There are no holdings during rebasing, and its scale change is not falsely displayed as a trading return. New-run initialization starts quotes at reference. Neither UI rendering nor temporary buffs reprice the market.

#### Speculation, rarity and legacy wealth

No spread/fee added. Identical buy/sell quotes have no economic profit. With initialized ordinary quotes, bounded driving noise implies `|x| ≤ 1.2v/.15`. Copper's limiting extreme-path range is ~.852–1.174R; Iron .756–1.323R; Gold .670–1.492R; Diamond .527–1.896R. Consequently ordinary paths never hit the .5/2.5 hard boundaries, avoiding a reachable guaranteed-return floor. Two deterministic 60-cycle negative/positive edge paths confirmed this ordering and bounds; even an extreme low quote can still fall on the next negative step. This is a worst-path check, not a randomized market forecast. Timing remains useful, with more per-unit upside/risk for Diamond and limited speculative purchase throughput.

Rarity weights and relative base values are unchanged. Expected reference-value contributions remain Copper 40.58%, Iron 28.99%, Gold 21.74%, Diamond 8.70%: common stable Copper contributes most aggregate mining income, while rare Diamond has the highest unit value/volatility. No ore dominates both supply and unit value; no crafting dependency was added.

Existing valid quotes/history/inventory are preserved exactly on load, even outside the new range. Missing legacy references initialize only after full economic hydration, without repricing holdings. Quotes outside the natural envelope above become **sell-only transition quotes**, with tooltip/help explanation; each processed update moves them monotonically toward ordinary range by at most **5%** of the prior quote. High outliers cannot grow further; low outliers cannot be purchased for forced recovery profit. Players can immediately sell old holdings at their saved quote. Empty-stock rebasing may clamp old outliers before new goods are generated, without destroying held wealth. This grandfathered transition is the explicit exception to ordinary hard bounds; no save-time haircut or ore compensation.

#### Actions, accounting and compatibility

Ten **market actions** per processed cycle: Buy one costs one; Sell one costs one; **Sell All liquidates full current inventory for one action**. Zero actions blocks every trade. `transactOres()` keeps one atomic prepare/credit/commit operation, rejects batched purchases, invalid/nonrepresentable stock/funds/sums and failed credit without consuming anything. Sell All is a convenience, including purchased stock, without provenance tracking. Sales still call `creditDonuts(value, false)`: balance increases; earned totals, direct prestige eligibility and earned-production quest progress do not. Purchases do not enter building-only spending quests. No income or quest-accounting changes.

Optional persisted `oreMarket: { referenceScale, productionBand, workforce, stage }` defaults to null. Valid snapshots round-trip unchanged; missing/malformed optional references recover after economic hydration while preserving stock/quotes/history. This extends the existing load-only Mine repair boundary: format/checksum/unsafe-key checks precede repair, strict live candidate and backup validation do not repair bad references, loading writes neither slot. Save version1, primary/backup keys, encoding/checksum, stale-tab/write protection and batching are unchanged. Older clients ignore the optional field and can load the ordinary existing shapes, but retain their old market/transaction rules; rollback requires no data contraction and must not recreate sold ore.

Prestige clears reference, workers/Mines, inventory, history/trend, allowance/checkpoint and restores configured base quotes until new-run initialization; permanent Farm mastery remains. One Mine still equals one worker, five ores per worker per processed 60 seconds, with existing retry-normalized .99 rarity weights. Legacy worker.productionRate remains unused. No new currency, resource sink or bulk-buy selector.

#### Representative results

Real canonical-CPS fixtures, references freshly captured, all expected mined ore valued at reference quotes and liquidated; analytical estimates, not browser playtesting. Ordinary prices vary around these values. The prestige8 fixture is an early-run building mix, so it appropriately retains an early share.

| State | Mines/workers | Authoritative CPS | Expected ore/min | Reference ore value/min | Share of passive |
| --- | ---: | ---: | ---: | ---: | ---: |
| First Mine alone | 1 | 50 | 5 | 384 | 12.80% |
| Early-mid | 1 | 120 | 5 | 768 | 10.67% |
| Mid | 15 | 11,431.981 | 75 | 32,768 | 4.78% |
| Late | 80 | 106,252,713.56 | 400 | 120,795,955.2 | 1.89% |
| Prestige8 early run | 1 | 40,960 | 5 | 393,216 | 16.00% |

Important numeric changes: multiplicative quote walk becomes exponential/log mean reversion with .85 displacement retention; static .2B floor becomes .5R minimum/2.5R maximum for ordinary quotes; new power-of-two production bands, stage share .20/(1+d) with .03 minimum and workforce-normalized reference formula; transition runoff max .05/step and buy exclusion outside `1.2v/.15` natural envelope; Sell All unit charge becomes **one action for any full batch**, keeping allowance10. No other economic values changed. The 1e-12 boundary/envelope tolerance is a floating-point safeguard, not an additional reward factor. Base prices, rarity weights, volatility, production quantity/cycle, Mine cost/CPS/upgrades, prestige factors, Farm, Quests and main production numbers are unchanged. Script cache query 1.5.10→1.5.11 is non-economic.

#### Verification and boundaries

Added **12** deterministic cases in `tests/mine-balance.test.js`; adapted only intentionally superseded Sell All/formula/transition expectations in the existing 15-case Mine correctness suite. Focused `node --test tests/mine-balance.test.js tests/mine-correctness.test.js`: **27 passed**. One final `node --test tests/*.test.js`: **170 passed, zero failed**, including the existing Save Integrity, Production Math, Quest correctness/balance and Farm suites. Coverage includes log reversion/momentum, fixed edge paths/volatility/safety, five economic fixtures, temporary factors at an exact band boundary, held-position protection, empty-stock rebasing/chart reset, identical-quote round trip, ten speculative buys/no batched-buy bypass, large/failed/zero-action atomic liquidation, non-earned accounting, legacy wealth/buy restriction/gradual runoff, loaded-reference hydration/recovery, long closed-time save round trips and prestige reset.

Syntax checks passed for runtime/test/helper JavaScript. The documented four-page static asset/unique-ID/JSON-LD check passed. Pre/post method comparison confirmed unchanged canonical production/click/credit, all Farm/Quest methods, scheduler, offline calculation and checkpoint restoration, prestige caller, checksum/encoding and economic definitions. Source/hash review limited changes to `script.js`, `index.html`, the adapted Mine correctness test, new Mine balance test, `AGENTS.md` and this history. **Browser testing was not performed. No deployment was performed.**

Offline / Time Consistency V1 still owns delayed/suspended-cycle loss, closed-session ore/market evolution, action resets over offline time, partial-cycle catch-up/remainder policy and acquisition immediately before the boundary. No scheduler/catch-up changes here: a market advance is one deterministic step given its random inputs, ready for later time integration. Future Mine/Ore Expansion may add resource crafting/upgrades; no such system is implied as implemented. Later playtesting can assess stage transitions, holding an old reference and speculative pacing without undoing the established atomic/save/accounting contracts.

### Offline / Time Consistency V1

Implemented on 2026-10-18 (session date). Integrated the completed Save Integrity, Production Math, Quest, Farm and Mine/Ore contracts without changing their configured economy. Read the engineering guide, relevant history and current loop/save/load/mutation/timer paths first. Used the migration workflow for compatible optional timing state; no dependency or framework added.

#### Before and why it changed

RAF delivery previously defined the effective economy: an open hidden page credited the entire wall gap at 100% using endpoint CPS, while reopening credited only 25%, required at least one minute and used a different simplified Farm path. Mine/Baker granted one overdue batch and dropped additional cycles/remainders. Saves could stamp a fresh lastActiveTime without first crediting a pending gap. Buff expiry/queue activation were sampled at processing time, so an interval crossing expiry could underpay or retroactively apply a queued bonus to the entire gap. Closed Farm sessions froze cooldowns/buffs and ignored live feed/modifier/collection rules.

#### One authoritative settlement owner

`settleTime()` now advances the last settled checkpoint to the requested present under the current visibility policy. Visible economic time runs at **100%**; hidden/background/closed at **25%**, with only the first **12 real hours of one continuous inactive episode** eligible for economic progress. No economic minimum absence remains. The existing one-minute threshold controls only whether a return modal appears. Page Visibility, not OS/window focus, is the boundary.

Same-page active economic elapsed comes from performance.now(). Wall-clock timestamps support persistence and real deadlines; negative elapsed is ignored and the economic checkpoint never moves backward. If wall time advances beyond monotonic elapsed, real timers age but no additional active economic income is manufactured; economic time is mapped over that real interval for chronological effects. Clock rollback/restoration cannot replay elapsed production. This is robustness, not client-side anti-cheat. OS/browser failures to deliver lifecycle checkpoints still cannot recover unsaved actions after a crash.

The settler splits only at meaningful events: inactive cap; main/legacy multiplier expiry and queued activation; Mine/Baker cycle completion; Farm buffs, contracts, breeding, storage/auto-collection, care-production cycles and feed exhaustion; and earned-production quest/milestone boundaries. Every main-income segment consumes authoritative `getProductionBreakdown(eventTime)` and credits/attributes the same economic income through `creditDonuts()`. Main production/click/modifier formulas are unchanged; their default event clock can now represent a historical settlement boundary. The optional forced-seconds updateProduction argument remains only a test/debug interval adapter.

Mutation entry points call guarded `settleBeforeMutation()` before purchases/upgrades/crafting, prestige, multiplier activation, mastery XP and Farm economic actions, income transactions/catches and quest claims. Old state therefore applies before the action, new state afterward. Nested settlement is inert under `_settlingTime`. Prestige settles first, then resets resource phases at that exact checkpoint while retaining the established permanent recipe/mastery contracts.

#### Visibility, saves and restoration

Hide: settle visible time, start inactive episode, remove interaction donuts/queues and checkpoint. Show: settle inactive time, end the episode, reset RAF timing and resume future visible interaction. Pagehide/pageshow cover lifecycle/BFCache transitions; duplicate visibility/pagehide calls cannot restart an already inactive episode or re-credit its interval. Auto-buyer executes only visibly, with unchanged affordability thresholds. Hidden/closed combos neither spawn nor catch up rewards; existing unrelated chain/catch-once bugs remain deferred.

All save paths settle before a new economic timestamp is serialized, fixing lost-gap snapshots. `_savingTimeSettlement` suppresses nested checkpoint requests during saving; normal simulation-triggered requests remain coalesced. Candidate/backup validation, checksum/encoding, primary/backup order, stale-tab guards, recovery and write blocking remain. Load fully hydrates state and freezes missing old completed milestone rewards before advancing elapsed time. Loading itself writes neither storage slot.

Optional `timeState = { settledAt, inactive, inactiveElapsed, mineProgress, bakerProgress, randomState }` persists the minimum simulation checkpoint/cap/phase/RNG state. inactiveElapsed saturates at 43,200,000 ms; hidden autosaves and hidden reloads preserve usage instead of opening new 12-hour windows. A real return to visible ends the continuous episode. `lastActiveTime` mirrors settledAt; old Mine/Baker timestamps are compatibility mirrors of checkpoint minus economic remainder. No new storage keys, envelope version or saveVersion change.

Old snapshots lacking timeState derive the start from lastActiveTime (now if absent), conservative bounded resource phases from existing checkpoints, a fresh inactive allowance, and a deterministic RNG seed from the snapshot checksum. Historical hidden cap usage cannot be reconstructed from old metadata, so migration begins one bounded inactive allowance. Existing collections/rewards/ownership are preserved; no storage rewrite on successful load. Present timing objects must have complete finite/bounded fields; malformed new state uses normal Save Integrity fallback/protection rather than weakening validation. Older clients ignore the field but retain old time bugs; a code rollback must not strip/recreate consumed state or be represented as preserving the new time policy.

#### Resource clocks, market and randomness

Mine accumulates 60,000 economic ms; Baker 300,000. Consume every complete cycle, preserve the fractional remainder across frames/visibility/saves/reopening. At 25%: ten hidden minutes give two Mine cycles plus 30 economic seconds, and half a Baker cycle; twenty hidden minutes give one Baker cycle. Quantities/probabilities stay five ores/Mine and two ingredients/Baker with existing weights/retry normalization. Current global ownership semantics remain: settle the old interval before purchase, then new ownership participates in the next global boundary. Worker acquisition proration is deferred.

Every completed Mine economic cycle advances the existing market formula once and resets allowance to ten actions, never banking unused allowances. Reference snapshots, holding protection, price bounds/recovery and ore income accounting are unchanged. Market movement now happens identically while hidden/closed at 25% speed.

A persisted xorshift32 stream isolates time-generated randomness from rendering/player-facing decorative RNG. Consuming the same cycles and economic events preserves ore/ingredient outcomes, market history and reward RNG across granular hidden updates versus suspended/closed replay. Unseen contract boards use deadline-keyed separate seeds so skipped presentation refreshes do not perturb resource/reward RNG. Existing ordinary per-unit draws/retry behavior remains for batches up to 1,000 units. Larger batches use sequential multinomial draws: exact small binomial tails and a normal approximation for large populations, conserving whole-unit totals and configured proportions/large-population mean/variance without millions of draws. This bounded-cost approximation is explicit; it is not a rarity rebalance. The stress fixture produced 500,000 ores and 200,000 ingredients in fewer than thirty RNG draws. Numerical tolerances handle floating boundary roundoff without adding reward factors.

#### Farm and wall-clock exceptions

Removed the independent simplified offline Farm calculation. Reuse live Farm modifiers, care-cycle consumption, storage, feed, contracts, breeding, XP/crates and existing automatic collection. Goods and contract work use economic seconds, with the shared inactive cap. Paid feed covers only actual producing economic time; storage-full time is not charged. Exhaustion is an event boundary and falls back to Standard instead of giving a whole unpaid premium interval. Automatic collection retains existing payout and no manual collection XP/crate roll.

Breeding programs and cooldowns are explicit **100% real elapsed** exceptions, including beyond the economic cap. Completion starts the approved post-program cooldown at the actual completion boundary, then remaining away time reduces it. Farm buffs expire in real elapsed time; only their overlap boosts reduced economic production. Expire old buffs before granting new completion buffs. Main queued multipliers similarly start at the preceding expiry, not return time. Care windows and contract-board opportunities advance from their actual deadlines; missed windows do not auto-care. Quest deadlines/cooldowns and DonutCoin remain real timestamps; no missed daily coin accumulation. Existing quests are progressed chronologically, and progress/expiry callbacks first settle pending income. Timed-failure cooldown anchors to the actual deadline rather than the delayed callback, preserving its configured duration without browser-dependent postponement. No historical replacement assignments or auto-buyer purchases are invented.

#### Deterministic evidence and verification

At 100 canonical CPS: 10 active seconds = **1,000**; 10 hidden seconds = **250**; 60 hidden seconds = **1,500**; ten hidden or closed minutes = **15,000**. Five active minutes → ten hidden → five active = **75,000**. Thirteen inactive hours, including repeated hidden saves and hidden reload, credit **1,080,000**, only twelve hours ×25%.

A 2× multiplier for five of ten real seconds now pays **1,500 active / 375 inactive**, rather than endpoint sampling. A five-second 2× followed by three-second queued 3× then two seconds base pays **525 inactive**. Baker/Mine preserve complete batches/remainders and do not reroll completed saved batches. Backward/restored clocks do not add duplicate credit. A mixed Farm/Mine/Baker fixture with premium feed, care, temporary buff, contract, breeding and auto-collection agrees across sixty hidden updates and one closed replay: exact seeded resource/market outcomes and equivalent income/storage/cooldowns within floating-point tolerance.

Added **25 focused tests** in `tests/time-consistency.test.js`. Existing save/production/quest/Farm/Mine tests retain their correctness assertions; only expectations intentionally superseded by the new time policy were adapted (new authoritative phase fields, settled save income/goods, chronological milestone latching, advancing buffs/market and removal of arbitrary backdated offline API replay). Same-checkpoint round trips remain exact; elapsed restoration is tested separately. Focused suites passed. One final `node --test tests/*.test.js`: **195 passed, zero failed**. JavaScript syntax and the documented four-page local asset/unique-ID/JSON-LD checks passed.

Source comparison confirmed unchanged constructor/content economic definitions, canonical production/click arithmetic, building/upgrade/recipe values, Farm modifier/sale/feed-rate formulas, Quest balance formulas, Mine market coefficients, prestige strength and checksum/encoding. Files: script.js; README/index wording/cache query (1.5.11→1.5.12); AGENTS.md/history; new time test; and narrowly adapted existing production/save/quest-correctness/Farm/Mine tests. No dependency added. **No browser test or deployment was performed**; lifecycle tests use the existing fake DOM/clock/storage harness.

#### Balance boundary and deferred work

No configured gameplay balance constants changed: prices, base CPS, prestige, upgrades, recipe ingredient/scaling/bonus values, animal/feed/trait/affix/crate values, quests, ore values/rarities/volatility and production quantities/periods remain. The approved time-policy changes intentionally alter credited results: hidden economic rate25%, no minimum discarded gap, complete cycle/remainder processing, continuous cap, real buff expiry, real breeding cooldowns and feed/production alignment. The new RNG stream/large-batch sampling and floating tolerances are simulation mechanics, not new multipliers/rewards.

Deferred: Baker Correctness V1 (summaries/worker representation/recipe availability/listeners/legacy cost scale); Click / Combo Correctness V1 (catch-once, chain timeout and non-time reset semantics); Baker Balance V1 (exponential costs/later recipe targets); Click Balance V1 (post-prestige relevance); global-cycle acquisition proration. Vague Farm reward systems and ore crafting remain their existing separate design/expansion work. JavaScript Number rounding and best-effort persistence limitations remain; no claim of secure clock/anti-cheat behavior.


### Baker Correctness V1

Implemented on 2026-10-18 after Offline / Time Consistency V1. Read AGENTS/current contracts, Save Integrity/Production Math/Time history and actual Baker definitions, mutation/render, timer and save paths. No gameplay balance or time policy redesign.

#### Confirmed defects and ownership

Baker ingredient output already used owned building count, but old saves could retain missing/excess worker representations. Total Ingredients was updated only by an uncalled legacy generator; live production/crafting could leave it stale. Production did not update an open recipe book, leaving newly affordable Make buttons disabled. Each Baker panel opening rebound modal open/close/backdrop/Escape handlers. Crafting spent ingredients before checking credit success and trusted a duplicated scale cache that could disagree with permanent craft count.

`items.baker.count` now owns output and `bakers.length`. Reconciliation retains compatible prefix objects/fields, fills missing `{ productionRate: 2 }`, trims excess without compensation, and refreshes the header after load/purchase/production/prestige. Worker rates remain irrelevant to ingredient output. Bulk ownership semantics are unchanged.

#### Inventory, UI and transactions

Added narrow load-only Baker inventory recovery alongside the existing Mine recovery: verify checksum and unsafe keys first; floor positive finite fractional counts, recover negative/non-finite/malformed entry counts to0; validate the full recovered snapshot. Other ingredients/progress survive. Strict candidate/backup validation requires whole nonnegative counts and never repairs invalid stored candidates. Loading writes neither slot; the last valid backup cannot be overwritten by an invalid primary needing ingredient repair. Save version/keys/encoding/checksum/stale-tab/write blocking stay unchanged.

`updateIngredientList()` is the shared inventory UI refresh path: individual counts, one total calculation, visible recipe affordability and dormant standalone button compatibility. It runs after production/craft/load/prestige, including zero ownership. Target-building purchases also refresh unlock status. Recipe cards persist; requirements/availability/Make state update in place, and displayed details refresh earned count/bonus. Modal listeners bind once; each retained card owns one hover/craft handler. No panel reopen is required and no repeated-opening listener growth remains.

Crafting settles time first, then validates recipe/target, derived rounded requirements, finite whole sufficient stock, representable subtraction, next craft count/scale/bonus and payout. Successful donut credit precedes the remaining prevalidated synchronous assignments. A refused credit aborts the whole craft: no ingredient loss, permanent reward, success notification or action save. Payout remains configured flat recipe.production × current temporary factor and uses its existing earned accounting. No payout/ingredient/scaling/bonus constants changed; Number precision limits remain.

#### Historical recipe scaling and permanent effects

Inspected both accepted save layouts: compact `{ craftCount, currentScaling }` and older nested `{ craftCount, scaling: { ingredients: { current } } }`. Existing implementation starts scale1, multiplies it by the configured multiplier per craft without rounding scale, and rounds each final ingredient requirement up. Craft count already owns permanent additive bonuses in Production Math. It now owns costs too: repeat the original multiplication order from scale1, then `ceil(base × scale)`. This intentionally avoids exponentiation ULP differences at ceil boundaries. Missing/contradictory scale mirrors reconstruct in memory from earned count rather than granting cheap repeat crafts. Saving writes the derived compatibility mirror. No storage rewrite occurs on repair alone. If exponential costs overflow, preserve count/bonuses, disable further unrepresentable crafts and serialize a finite MAX_VALUE mirror; never serialize Infinity or use that mirror as authority. Supported schema fields remain readable by older clients, but a rollback restores their correctness bugs.

All six targets/values remain: Classic→Farm10%, White Magic→Mine10%, Chocolate Bliss→Factory8%, Golden Ring→Logistic Center7%, Neon Surge→Power Plant6%, Enchanted Forest→Nature5% per craft, additive locally and applied once by the unchanged canonical production model. No animal-goods or ore-output effects. Prestige clears Baker ownership/workers/ingredients and the shared run-cycle phase; earned recipe counts/derived costs/bonuses survive and return with target ownership. Explicit full Reset retains its deliberate whole-save deletion behavior.

#### Shared time and legacy boundary

No shared settler, RNG or cycle formula changed: five economic minutes, two ingredients/Baker, Dough50%/Sugar35%/Chocolate15%, visible100%/hidden-closed25%, cap/remainders and global-cycle ownership unchanged. Reconciliation occurs before restored elapsed production. No second timestamp-based generator is activated.

`generateIngredient()` has no caller and uses obsolete worker-rate/countdown logic; `bakerCycleRemainingTime` has no active advancement. Worker productionRate survives only as compatibility data in normal play. Ingredient prices have no market consumer; ingredientPurchaseLimit is assigned only in that dead generator. Recipe baseProduction has no consumer. selectedRecipe/selectRecipe/updateCraftButton remain dormant compatibility paths without selected-recipe/craft-btn HTML controls. Modal details still require hover: touch/mobile detail discovery is deferred UX, not repaired by a broad layout redesign.

#### Verification and deferred work

Added **15 focused deterministic tests** in tests/baker-correctness.test.js: single/bulk ownership, missing/excess legacy/current workers, malformed/fractional inventory and strict backup boundaries, live open-card refresh and total display, repeated opening/listeners, exact costs/atomic rejection/failed credit, legacy scale mismatch, all six local exact-once bonuses with actual credited CPS, save/prestige/repurchase and shared hidden/closed remainder/RNG conservation. Focused suite:15 passed. One final `node --test tests/*.test.js`: **210 passed, zero failed** (all195 existing regressions unchanged plus15 new). Syntax checks passed for runtime/tests/helpers; the documented asset-reference/unique-ID/JSON-LD checks passed on all four HTML pages. Pre/post source-method comparison verified unchanged constructor/content economic definitions, canonical Production Math, shared time settlement/RNG, Farm/Mine/Quest methods, prestige caller, income gate and checksum/encoding. Only Baker paths plus their purchase/load/save/reset integration and ingredient validation changed.

No Baker economic constants changed: building prices/CPS/upgrades,300000ms cycle,two units,rarities,all ingredient requirements/payouts/multipliers/bonuses are unchanged. Files: script.js,index.html(cache1.5.12→1.5.13),AGENTS.md,this history,new Baker test. No dependency added. No browser testing or deployment performed.

Deferred to Baker Balance V1: exponential costs/diminishing returns, ingredient relevance/production scaling across prestige and late-game economy. Future Baker Expansion: post-Nature recipes (Neural Network Bakery/Portal/Capital Crest), new ingredients, mastery, ingredient markets. Touch details and global-cycle worker acquisition proration remain separate UX/design questions. Click/Combo correctness/balance and other previously deferred work remain outside this task.


### Surgical Refactor V1

Implemented on 2026-10-18. Read AGENTS.md, project history, the Architecture / Refactor Audit V1 in the preceding conversation, current runtime/HTML and the existing harness/tests. Structural-only scope; no subsystem extraction or gameplay contract changes. Baseline: 11,693 runtime lines and 210 passing regressions recorded by Baker Correctness V1.

#### Literal content extraction

Moved only the 605-line constructor upgrade assignment to game-content.js. The literal is unchanged except indentation; createUpgradeDefinitions() returns fresh category arrays and upgrade objects on every call through window.DonutClickerContent. Game calls it at the original assignment position. All 10 categories / 58 upgrades preserve array/property ordering, names, costs, multipliers, requirements, images, descriptions, purchased flags and special/type fields. No sorting, conversion or normalization. The ordered pre-change JSON fingerprint is SHA-256 `23a64ab86a3eb40c12ade753441983aced8b58bebf2d98d53f2d19dbde3b6457`.

index.html loads game-content.js immediately before script.js using ordered defer classic scripts, both cache version 1.5.14 (runtime previously 1.5.13). No module/build tooling or dependency introduced. Existing DOMContentLoaded bootstrap, window._game setup and generated handlers remain unchanged. The VM harness reads/evaluates the real content file before the real class; no replacement definitions or weakened assertions. Optional additional extraction was deliberately skipped.

#### Re-verified dead code removal

Rechecked all repository JS/HTML including tests, direct calls, callbacks, timers, generated inline handlers/window._game references and computed dispatch before deleting exactly seven unreachable methods:

- updateBreedPreview: live breeding renderer uses getBreedingPreview directly.
- getAverageBuildingCost: no reader/caller.
- createQuestElement: no active renderer uses this old element builder; claimQuestReward compatibility remains.
- createMultiplierTimer and createTimerContainer: no code constructs the obsolete timer widgets.
- getTotalBuildingCount: no caller; canonical production computes its own authoritative building inputs.
- _debounce: no callback/reference uses it; live _throttle remains unchanged.

Removed only cachedBuildingCount and lastBuildingUpdate, whose sole consumer was getTotalBuildingCount. They had no serialized/restored, HTML/CSS, test or dynamic-handler use. Removed comments specific to the deleted methods. Other dead-state candidates were left alone. Preserved generateIngredient, Baker compatibility state, selected-recipe path, old migration cluster, calculation/multiplier/offline adapters, legacy quest/save readers, nested recipe compatibility, worker fields and deferred Passport/Farm definitions.

#### Behavior-preservation proof

Captured pre-change source and content snapshots outside the repository. Full ordered extracted content matches the original literal; two focused content tests verify its fingerprint and independent mutable trees, including an actual upgrade purchase in one Game leaving another unpurchased. A standalone factory check confirms no clock/RNG/DOM/storage use. Source comparison confirms 319 retained nonconstructor class members are byte-identical, including all production/click, time/RNG, save/load/validation/checksum, prestige, Quest/Farm/Mine/Baker methods. Constructor differs only by the factory call and two removed cache initializers; file-level browser bootstrap is byte-identical. Runtime is now 10,958 lines; game-content.js is 613 lines. Size is informational, not an acceptance goal.

Focused `node --test tests/content-definitions.test.js`: **2 passed**. One final `node --test tests/*.test.js`: **212 passed, zero failed**, all 210 existing assertions unchanged plus 2 structural tests. JavaScript syntax passed for content/runtime/tests/helpers. The four-page asset-reference/unique-ID/JSON-LD checks passed, including explicit ordered-defer verification of the two game scripts. Hash/file-scope review confirmed exactly five existing files changed and two added; existing gameplay tests and CSS are unchanged. No browser testing or deployment performed.

#### Compatibility and scope boundary

No gameplay/numeric changes. saveVersion remains 1; snapshot shape, supported legacy formats, upgrade indices, backup/write blocking, hydration order and time policy are unchanged. Rollback is a code/HTML/harness rollback only; no stored-data migration, reset or rewrite is required. Deploy/cache the paired content/runtime assets together.

Files: `game-content.js`, `script.js`, `index.html`, `tests/helpers/game-harness.js`, `tests/content-definitions.test.js`, `AGENTS.md`, this history. No existing gameplay test assertions changed. Deferred UI/view, resource/domain, persistence/time and browser-lifecycle extraction, plus Click/Combo correctness/refactor. A possible Surgical Refactor V2 is moving fresh building templates using this same literal factory pattern, after a separate equivalence/isolation review; it is not implemented here.


### Surgical Refactor V2

Implemented on 2026-10-18 after Surgical Refactor V1. Read the current guide/history, content factory, constructor/HTML, real content-loading harness, content tests and relevant production/save regressions. Baseline: 10,958 runtime lines and 212 passing tests recorded by V1. Scope is building templates only; no cleanup or subsystem work.

Moved the 112-line `this.items` literal to `game-content.js` as `createBuildingDefinitions()`, exported beside the unchanged upgrade factory through `window.DonutClickerContent`. The constructor invokes it at the original assignment position, immediately after upgrade initialization and before `baseItemProductions`. The literal is preserved except indentation: all 11 keys in insertion order and every existing property/value remain identical. No description/image/unlock fields were invented, and no values were normalized. The ordered original JSON fingerprint is SHA-256 `c54f7b1ee8d376834cf3e53563bf1fae97856bd7c66e5f34d60252894bdc9d08`.

Each call returns independent mutable objects. The factory reads no Game state, clocks, RNG, DOM, storage or timers. Existing dependent initialization remains in Game: base production snapshots from originalProduction, Baker ingredient price fields, Mine initial quotes/base prices, and per-building auto-buyer settings. Purchase, cost growth, visibility/unlocks, production, workers, recipe targeting, load reconstruction and prestige paths are untouched.

The existing ordered deferred classic-script loader and VM harness are reused without loader/harness restructuring. Only HTML cache versions change from 1.5.14 to 1.5.15 for both content and runtime, pairing the new factory export with its caller. No new files, dependencies or module tooling. `window._game` and browser bootstrap remain unchanged.

Added only two content tests, leaving all earlier assertions unchanged: complete ordered building fingerprint/Game shape, and recursive mutable-object isolation across two factory calls and two Games, including count/cost/production-mirror mutations. Focused content suite: **4 passed**. Pre/post source comparison proves restoring the old literal in place makes script.js byte-identical to its pre-V2 snapshot; all nonconstructor methods and the rest of the constructor remain unchanged. The existing upgrade factory also remains byte-identical. A standalone factory probe with throwing clock/RNG/browser/timer dependencies passed. One final `node --test tests/*.test.js`: **214 passed, zero failed**, all 212 existing regressions unchanged plus two building-content tests. Syntax checks passed for runtime/content/tests/helpers. All four pages passed asset-reference/unique-ID/JSON-LD checks; paired deferred script order and cache versions were verified statically. File-scope hashes confirmed exactly six existing files changed, none added; the harness, earlier gameplay tests and CSS remain unchanged.

Runtime line count: 10,958 → 10,847; content file: 613 → 728. These counts are informational. Files: script.js, game-content.js, index.html (cache versions only), tests/content-definitions.test.js, AGENTS.md (small factory/verification clarification), this history. No existing gameplay tests, harness or CSS changed. No browser testing or deployment performed.

Gameplay/numeric changes: **None**. saveVersion remains 1; saved shape, supported legacy formats, load/hydration, checksum/backup/write guards, time/RNG and reset behavior are unchanged. No save migration or load-time rewrite introduced; rollback needs only the paired code/cache changes, not player-data changes.

Deferred: recipes, Farm/Quest content or domains, Mine/Baker subsystems, persistence, TimeSystem, UI/views and dead-code cleanup. A possible V3 is a separate literal-preserving recipe-template factory with count/scale isolation verification; it has not been implemented.

### Performance Fix V1 — Closed Farm Rendering

Implemented on 2026-10-18 after Performance / Battery Audit V1. The audit measured approximately 68 closed Contracts renders versus 75 visible renders per ten seconds. `updateFarmDisplay()` checked Farm ownership and selected tab but never checked panel visibility. Desktop and mobile both enter through `openPanel()` / `closePanel()`; existing footer `visible`/`hidden` and panel `hidden` classes own that state. Initial CSS can leave panel elements laid out inside an offscreen footer, so a panel-only check would be insufficient.

Added cheap `isFarmPanelOpen()` class checks; no computed style, geometry, clock, storage or RNG access. Closed `updateFarmDisplay()` returns before tab-body selectors/renderers and panel KPIs. Existing opening and tab-selection handlers already refresh synchronously after setting visibility; those handlers remain unchanged. Visible Farm cadence remains 250/350 ms for Barn/Collection and 120/180 ms for Contracts/Breeding. Direct `_forceBarnFullRender()` (including feed fallback) invalidates the roster signature while closed and defers HTML work until opening. No new recurring callbacks/listeners. Independent mastery refresh and care presentation remain unchanged, including care timer DOM writes during settlement.

Farm simulation never consults this visibility gate. Goods, storage, feed, contracts/deadlines/rewards, breeding/cooldowns, buffs, care, mastery, auto-collection, crates, quests and checkpoint/RNG/time ownership are unchanged. Pre/post runtime diff is limited to the new helper and two presentation methods; production, settlement, save/load, prestige, economic constants and other systems are byte-identical. Save version1, payload and legacy loading remain unchanged. `index.html` bumps only the runtime cache query from1.5.15 to1.5.16; content/CSS are unchanged.

Verification: eight focused tests in `tests/farm-rendering.test.js` cover all closed tab bodies, direct Barn invalidation, visible desktop/mobile cadence, synchronous opening/KPIs, pending-refresh closure and panel switching, real tab-selection listeners, and exact open/closed state/RNG equivalence under both active and inactive settlement with contracts, paid feed and breeding completion/cooldowns. Existing Farm rendering fixtures now explicitly mark the Farm panel open; their assertions/economic expectations are unchanged. Before the patch, new tests reproduced closed rendering and post-close callback failures. Focused Farm suites:32 passed. One final `node --test tests/*.test.js`: **222 passed, zero failed** (214 existing +8 new). All runtime/content/test/helper syntax and four-page local asset/unique-ID/JSON-LD checks passed.

Ten-second deterministic real-method/fake-clock probes using the pre-change source and current source (temporary instrumentation outside the repository):

| Setting | Closed Contracts before → after | Visible before → after | Production queries before → after | Settlements before → after |
| --- | --- | --- | --- | --- |
| Desktop | 75 → **0** | 75 → 75 | 2924 → 2924 | 1168 → 1168 |
| Mobile cadence settings | 50 → **0** | 50 → 50 | 2172 → 2172 | 826 → 826 |

Real-browser follow-up: isolated localhost/private Brave window, desktop runtime, viewport1095px/DPR2, DevTools open, combo off, ten Farms/one Standard-fed chicken/Contracts selected. Temporary method counters and MutationObserver only; no production-site save touched. Over10.001s closed: **0 tab-body renders**,2823 production breakdowns,1158 settlements. Opening immediately rendered Contracts exactly once; over10.003s visible:75 Contracts renders,2717 breakdowns,1170 settlements. A separate tab-body-only observation measured0 added/removed nodes while closed (10.001s), versus1050/1050 while visible (10.002s,75 renders). These node counts are MutationObserver entries, not recursive subtree sizes; historical audit whole-document3758/3758 counts have a different scope/fixture and are not a direct delta. Preserved non-tab Farm care text still generated1670/1670 closed node entries in that second sample. No claim of zero total Farm/browser work, measured CPU/GPU/power/temperature improvement, or physical-phone testing. Temporary wrappers were restored and the private test window/local server closed afterward.

Files: `script.js`, `index.html` (runtime cache only), `tests/farm-rendering.test.js` (new), `tests/farm-correctness.test.js` (open rendering fixture), `AGENTS.md`, this history. Gameplay/numeric changes: **None**. No dependency or other optimization introduced. Deferred: frame-paced simulation/repeated production queries, snapshot reuse/bulk pricing, HUD/store polling, hidden UI/Stats scheduling, care display, CSS/GPU/mobile effects, combo/Auto Catcher/click effects and image work. Recommended next task: independently gate the closed Stats view and coalesce its queued RAF refresh, retaining immediate refresh on opening; not implemented here.

### Performance Fix V2 — Decoupled Orchestration / Dirty HUD

Implemented on 2026-10-18 after V1's222 passing tests. Traced the complete loop and action/render/save paths first. Previously every eligible RAF (desktop60Hz/mobile45Hz thresholds) called `updateProduction()` → settlement → HUD request, even between heavy-work opportunities. HUD queued a second RAF almost every production update. Heavy work already ran only when120ms desktop/180ms mobile elapsed: production mirrors, Quest orchestration (with its own250ms guard), auto-buyer and prestige bar. Farm and countdown refreshes had separate guards inside that same method.

The existing RAF/eligible-frame sampler remains. Only due heavy-work opportunities invoke full economic/orchestration updates. Actual elapsed is always settled; there is no CPS/tick-rate arithmetic or catch-up purchase loop. Keeping the original eligibility and last-heavy timestamp preserves auto-buyer opportunity timestamps/order, rather than replacing its effective cadence with a new interval. At controlled60Hz, existing frame rounding yields75 desktop/50 mobile opportunities per10sec (approximately133/200ms), despite configured120/180ms thresholds. A monotonic fallback keeps active settlement progressing if the wall clock moves backward; it does not bypass the original heavy-work guard or invent automation opportunities. Farm/resource presentation checks remain independently guarded on eligible frames, preserving V1's visible/closed behavior and timer cadence. No new interval timers.

Passive HUD presentation now has its own200ms desktop/250ms mobile minimum spacing. Balance/earned scalars and active/just-expired boosts mark it dirty; unchanged zero-production state stays clean. `updateDisplay(false)` only invalidates. Default `updateDisplay()` requests coalesced next-frame action feedback, bypassing the passive budget. `flushDisplay()` lets the scheduler and an already queued action callback consume one dirty request without duplicate rendering. Clicks, purchases, upgrades, recipes, market actions, prestige and load retain their existing action refreshes. Farm cash/feed/breeding/care/mastery actions, quest claims and multiplier activation/queueing now explicitly request the HUD feedback formerly supplied by frame-paced polling; simulation-originated events mark passive work instead. Click/combo effects and their timers are unchanged. Transient HUD fields are not serialized; no production snapshots or bulk prices are cached.

A focused equivalence test stopped on an actual floating boundary discrepancy: changing settlement partitions could leave a reached goal at599.9999999999999/600, moving its completion receipt to the next segment. Large epoch timestamp quantization could similarly delay a production milestone. The narrow required correction passes the already calculated segment rate/speed's timestamp-rounding envelope into production-goal comparisons, together with a few Number ULPs of arithmetic tolerance. It normalizes only near-target quest progress; it never changes credited donuts, production math, goals, reward calculations, deadlines or existing completed receipts. Genuine shortfalls still expire. `settleTime()`'s economic integration, boundary ordering, cap, reentrancy guards and replay RNG remain unchanged; its only edit supplies this comparison tolerance. No guard was skipped or economic expectation weakened.

Added12 focused tests in `tests/performance-scheduler.test.js`, using the real class plus a frozen V1 eligible-frame scheduling reference (no duplicated economy). Coverage: desktop/mobile10sec income, irregular/delayed frames and wall rollback, between-tick purchase and immediate HUD, non-tick-aligned multiplier expiry, identical auto-buyer opportunities/purchase order/costs, passive/timed quests and frozen milestone receipts, paced/clean HUD, immediate click credit/coalesced presentation, mixed Farm/feed/contracts/breeding/Mine/Baker state and exact RNG, prestige boundary/idempotence, unchanged Farm/timer check cadence, and exact-deadline success versus real shortfall. Representative settled results:100CPS×10sec=1000;2× for5.005sec of10sec=1500.5; purchase at65ms credits100×.065+101×.935=100.935 earned over1sec; mixed300.5sec fixture conserves50 ores and200 ingredients with matching Farm/market/RNG state. Comparisons settle the final pending tail at the endpoint, just as a mutation/save/lifecycle boundary does; raw presentation may lag the latest time between passive ticks.

Controlled real-method/fake-clock10sec probes, same pre/post fixture and600 delivered main frames:

| Fixture | Production updates before → after | Settlement entries before → after | Breakdown calls before → after | HUD renders before → after |
| --- | --- | --- | --- | --- |
| Desktop idle,1 Baker | 597 →75 | 1167 →645 | 2884 →707 | 596 →50 |
| Mobile settings,1 Baker | 449 →50 | 825 →426 | 2132 →505 | 448 →38 |
| Desktop premium-feed Farm | 597 →75 | 1169 →647 | 4760 →1032 | 596 →50 |
| Desktop zero production | 597 →75 | 1167 →645 | 2875 →453 | 596 →1 |

Settlement counts include guarded/reentrant entries; they are not counts of independently credited intervals. Total probe RAF callbacks fell1265→652 desktop because passive HUD no longer queues another callback each update; the600 main delivered frames were unchanged. No benchmark count is hardcoded as a correctness assertion.

Real browser: private Brave localhost before/after pages served from temporary files, using the captured V1 runtime and current runtime with the same actual content/CSS. Desktop1095px viewport/DPR2, DevTools docked, combo off, one Baker/no Farm/no auto-buyer, ten-second samples after initial view warmup. Method wrappers plus MutationObserver and an independent RAF counter; no production-origin save touched. Before10.002s→after10.002s: delivered frame callbacks600→600; production updates600→74; settlement entries1170→630; breakdowns2669→1032; HUD renders600→48; whole-document added nodes992→798 and removals993→799. Both samples ended with815 elements from818, including expiry of a notification. DOM figures count observer node entries, not recursively expanded subtrees. Different startup/quest histories can affect absolute counts; controlled harness comparisons provide the fixed-fixture proof. These are call/churn measurements, not CPU utilization, paint FPS, power or temperature measurements. No physical-phone measurement. Temporary wrappers restored; private window/server closed after verification.

Source-method comparison confirms all other runtime methods byte-identical, including canonical production/click math, income credit, buy/upgrade/craft/market transactions, resource RNG/cycles, Farm simulation, auto-buyer, prestige, save/load/validation/encoding and visibility lifecycle. Farm method edits are presentation requests only. Save version1, shape/legacy formats, hydration, stale-tab/backup/write protections and time policies remain unchanged. Forward/rollback require only runtime/cache updates, with no storage migration or rewrite; mixed old/new clients use the existing stale-tab guard.

Files: `script.js`, `index.html` (runtime cache1.5.16→1.5.17), new `tests/performance-scheduler.test.js`, `AGENTS.md`, this history. Existing test assertions/harness, content and CSS are unchanged. Focused scheduler tests12 passed; nearest affected production/time/Quest/Farm-rendering gate126 passed. All JavaScript syntax checks and four-page asset/unique-ID/JSON-LD checks passed. One final `node --test tests/*.test.js`: **234 passed, zero failed** (all222 existing regressions unchanged plus12 new).

Gameplay/balance constants and economic formulas: **None changed**. Machine-precision quest-target normalization above is required boundary correctness, not a goal/reward rebalance. Deferred V3: within-task canonical snapshot reuse and bulk-price caching. Deferred V4: hidden presentation/Stats/title/DonutCoin polling. Deferred V5: CSS/GPU/mobile visual policy. Combo/click effects, image work and framework/canvas changes remain outside scope.


### Performance Fix V3 — Production Snapshot / Bulk-Price Reuse

Implemented on 2026-10-18 after V2's234 passing tests. Scope: disposable canonical Production Math snapshots and HUD bulk-price previews only. Repeated getters/feed queries/render values previously recalculated the complete building breakdown even within one unchanged synchronous pass; every HUD render also iterated every selected purchase amount for all11 buildings. V2 scheduling, hidden-page presentation, CSS, combo/click effects and formulas are unchanged.

#### Consumer trace and ownership

| Consumer | Classification / reuse boundary |
| --- | --- |
| `settleTime(cursor)` | Explicit simulation-time query (C); exact timestamp/version must match. Farm boundary/feed reads can reuse that same segment's canonical CPS (B/C). No feed affordability, inventory or animal state is cached. |
| CPS getters, clicks, production mirrors | Fresh outside scopes (A); same-time consumers within an unchanged pass reuse (B). Mutations retain old-time settlement before changing inputs. |
| HUD/store upgrade checks, Stats, Farm display | UI-only reads (D/B) evaluated at one explicit view timestamp. Balance, affordability and Farm state remain live. |
| Quest balance/stable CPS/history/reward/progress | Fresh or same-pass canonical queries (A/B/C); existing permanent-rate planning, history and frozen receipts remain unchanged. Query-shaped mutation guards conservatively invalidate. |
| Mine reference | Canonical full snapshot, retaining existing removal of temporary multiplier for permanent capacity (B/C); never substitutes boosted CPS as the permanent reference. |
| Tooltips | Existing fresh single-query snapshots (D); no persistent tooltip cache. |
| Baker/crafting/save multiplier reads | Existing modifier query and formulas retained. No alternate formula introduced. |
| Prestige preview | Earned-total bar does not query CPS; reset/reconstruction invalidates derived production. |

`getProductionBreakdown()` remains the public authority; `calculateProductionBreakdown()` contains its byte-identical original formula body. `withProductionSnapshot()` retains at most one snapshot for a synchronous settlement/orchestration/render/quest-balance pass. Nested scopes share context. Key: exact effective timestamp plus per-instance `productionStateVersion`. Different timestamps always miss, including within a view pass. Read-only views capture one evaluation timestamp; simulation always prefers `_simulationNow`/explicit cursor. No TTL, timestamp map, cross-frame production cache or balance cache. `finally` discards the scope on success or exception. Outside a scope every query calculates afresh.

Invalidation: existing `settleBeforeMutation()` first settles old elapsed, then advances the derived version and discards any scoped snapshot/captured view time, including guarded/reentrant calls. This covers building/upgrade purchases, recipe crafts, mastery gains, Farm modifier actions, quest multiplier start/expiry/queue/legacy cleanup and their compatibility adapters. Load clears all derived caches; item reconstruction/run reset invalidate explicitly; prestige also invalidates after its final raw modifier resets. New raw rate writers inside a scope must use this boundary. Raw state writes between scopes naturally cannot encounter an old production snapshot. Mastery20 affects main CPS; Farm animal/feed/timed PROD buffs remain live Farm inputs, not new main-CPS formulas. `invalidateDerivedCaches()` is a development/test helper, with no UI or save representation.

Chronology is unchanged: old state settles before mutation; each new exact cursor/version gets a separate snapshot. Multiplier expiry/queued activation and mastery changes retain their existing guards; no snapshot skips a segment or changes time/RNG ownership. Conservative invalidation intentionally leaves some duplicate calculations rather than risking stale state.

`getBulkPricePreview()` owns one current entry per building (maximum11 for existing building keys). Inputs/key: building key, object identity, count, mutable `baseCost`, `costMultiplier`, selected amount. These are the actual canonical price inputs plus conservative identity/count guards. A change naturally misses and replaces that entry, including purchase/load/prestige/reconstruction or amount changes. Unrelated balance changes do not invalidate prices. Affordability always compares live donuts with the preview. Real purchases and auto-buyer retain unchanged uncached `calculateBulkPrice()` calls, so even a corrupted disposable preview cannot set a transaction price. No geometric-series rewrite, changed iteration/rounding, cached purchase entitlement or persisted cache.

#### Measurements

Temporary wrappers/instrumentation outside the repository,10 simulated seconds, same pre-V3/current source fixtures and600 main frames:

| Fixture | Canonical executions before → after | Snapshot reuses | Bulk computations before → after | Price hits | Orchestration / settlement entries / HUD (unchanged) |
| --- | --- | --- | --- | --- | --- |
| Desktop,1 Baker | 707 →473 | 234 | 550 →11 | 539 | 75 /645 /50 |
| Mobile settings,1 Baker | 505 →319 | 186 | 418 →11 | 407 | 50 /426 /38 |
| Desktop premium-feed Farm | 1032 →488 | 544 | 550 →11 | 539 | 75 /647 /50 |
| Desktop purchase amount100 | 707 →473 | 234 | 550 →11 | 539 | 75 /645 /50 |
| Desktop zero production | 453 →424 | 29 | 11 →11 | 0 | 75 /645 /1 |

These cold-cache harness samples distinguish query count from canonical executions: queries stay707/505/1032/707/453. At amount100, canonical bulk iterations fall55000→1100 without changing prices. All instrumented DOM/query/style/text attempts and RAF counts remain equal pre/post; this patch does not reduce rendering frequency or DOM churn. Premium-feed canonical work falls approximately53%, desktop33%, mobile37%.

Real-browser proof: private localhost Brave test window, desktop1095px/DPR2, DevTools open, combo off/one Baker/no auto-buyer, purchase amount100, quest slots on cooldown. Temporary wrappers, MutationObserver and independent RAF probe, approximately10 seconds/sample. Final matching control used the same V3 runtime with disposable scopes/preview caching bypassed versus enabled; authoritative inputs were reset between samples (upgrade/recipe/prestige/boost/mastery/animal inputs, counts/balance/resource phases). Bypass→enabled: RAF600→600; orchestration75→75; settlement entries631→631; Production Math queries1036→1103 but **actual canonical executions1036→907**, with196 reuses; HUD47→48; bulk computations517→0, with528 warm-cache hits. Whole-document observer additions/removals1303/1303→1326/1327; element count1074→1074 in control,1077→1074 enabled. Startup notification/quest history and wall-time sampling affect these small samples; DOM churn reduction is not claimed. Warm-cache browser price counts differ intentionally from cold-cache harness counts.

An earlier captured pre-V3 source sample measured934 canonical executions/73 orchestration/627 settlements/47HUD versus850/75/631/48 in the first V3 sample; differing histories/node counts make this a less controlled comparison. The same-page bypass comparison above and fixed harness are the primary evidence. All are actual call/churn counts, not CPU/GPU utilization, power, temperature or physical-phone measurements. No claim that all remaining duplication is removed. Wrappers restored; isolated test window and temporary server closed. No production-origin saves touched or deployment performed.

#### Correctness and compatibility

Added13 focused tests in `tests/production-reuse.test.js`: same-pass/fresh-outside reuse, building/upgrade/recipe/mastery invalidation, immediate click, premium feed, legacy/active/queued multiplier chronology, distinct explicit timestamps/read-only view-time release, exception cleanup, mixed cached/uncached resource/RNG/save equivalence, permanent Mine reference, prestige, live affordability, all price key inputs/boundedness, authoritative purchase despite corrupt preview, instance isolation, load/reconstruction/debug invalidation. Existing assertions and harness remain unchanged. Focused13 passed; nearest affected production/time/scheduler/reuse gate93 passed. Final syntax checks passed for17 JavaScript files; all four HTML pages passed local asset-reference/unique-ID/JSON-LD checks.

Source review confirms canonical formula body unchanged; settlement body identical after scope unwrapping, with no changed integration/boundaries. V2 RAF/HUD/Farm/timer scheduling, buy/upgrade/craft/auto-buyer/click methods, Mine reference, Farm simulation, save serializer/checksum/validation and visibility lifecycle are byte-identical. The existing HUD template literal is preserved byte-for-byte. Other changes are scope wrappers/query-time defaults/invalidation and HUD price-preview substitution. Runtime cache query1.5.17→1.5.18 only; content/CSS unchanged.

One final `node --test tests/*.test.js`: **247 passed, zero failed** (all234 existing regressions unchanged plus13 new). No existing expectations were weakened.

Gameplay/numeric changes: **None**. saveVersion1, shape, legacy support, hydration sequence, backup/stale-tab/write protection and exact Time Consistency/RNG semantics remain unchanged. No migration or stored-data rewrite required; caches are disposable per-instance state. Files: `script.js`, `index.html` (runtime cache query), new `tests/production-reuse.test.js`, `AGENTS.md`, this history. Deferred/recommended V4: hidden-page presentation/polling suspension with pending RAF coalescing; not implemented. CSS/GPU/mobile effects, combo/click workload and further measured duplicate calculations remain separate tasks.


### Performance Fix V4 — Hidden Presentation Suspension

Implemented on 2026-10-18 after V3's 247 passing tests. Scope is hidden presentation and pending render ownership; no browser was launched or automated, per the task's verification constraint. Source tracing and the existing real-method fake-clock/lifecycle harness supply the proof.

#### Recurring-source trace

| Source | Classification | Decision |
| --- | --- | --- |
| Three-minute autosave, existing 60s throttle reset | Required lifecycle/economic | Retained unchanged, including settlement, backup/checksum and stale-tab protection. |
| Coalesced action-save timeout / lifecycle checkpoint | Required lifecycle/economic | Retained unchanged; do not suppress hidden durable checkpoints. |
| Main RAF | Mixed economic/presentation | Preserve visible body/cadences; cancel on suspension, guard a late delivered callback, restart on return. No hidden economic polling replacement. |
| Title every 1s | Presentation | Stop interval hidden; refresh current balance once on return. Existing first-click title policy retained. |
| DonutCoin every 1s | Presentation | Stop interval hidden; current wall-clock readiness refreshes once on return. Claim/readiness mechanics unchanged. |
| Stats every 5s, previously even closed | Presentation | Stop interval hidden; skip closed views. Visible/open requests now write the same six current statistics synchronously, eliminating the Stats RAF/captured-value queue entirely. |
| HUD/store/upgrades/multiplier, Farm view, resource countdowns | Presentation | Guard entry points; no hidden DOM polling or new render requests. Multiplier text is written in the existing HUD pass rather than scheduling another RAF. |
| Mine/Baker resource cycles and reconciliation; Farm care/mastery; quest progress | Mixed | Preserve all state work. Gate only presentation entry points and extracted care/Baker-header DOM tails, including during hidden saves and return settlement. |
| Item hover RAF, throttled to 220/320ms | Presentation | One active tooltip owner, canceled on replacement/hide/leave; no background RAF chain or stale tooltip replay. |
| Notification RAF/queue and finite removal timers | Presentation | Cancel pending show RAF/queued ordinary messages on hide; hidden requests do not append DOM or grow the queue. Retain one critical storage-warning message for return. Existing finite displayed-effect cleanup remains. |
| Combo spawn 500ms, Auto Catcher 50ms and combo timeout | Mixed/visible interaction | Existing `setTimeVisibility()` stop/resume and catch guards unchanged; no hidden catch-up. |
| Accepted-click delayed quest check and effect/removal timers | Mixed or finite presentation cleanup | Retained; accepted-input state/checks and finite cleanup are not recurring idle polling. Hidden view entry points still refuse DOM work. |
| Preload idle callback/1500ms fallback; feedback startup timeout; modal focus RAF | Finite startup/presentation | Startup/image/effect work not redesigned. Focus callback checks visibility before focusing; no repeating hidden loop. |
| Quest IntersectionObserver | Presentation | Constructed but no active `observe()` caller found; no recurring source to optimize. |

Previously, hidden title/coin timers continued querying/writing DOM, and Stats calculated values before scheduling a fresh RAF on every poll. With RAF delivery suspended, those captured renders accumulated. Occasional delivered RAFs could also drive ordinary orchestration/HUD/countdown work while hidden. V1 closed Farm gating did not itself gate document visibility.

#### Final ownership and return behavior

`canPresent()` checks document visibility plus a transient lifecycle-suspension flag, with no layout/computed-style inspection. A single owner starts/stops the existing three presentation intervals. Visible rates remain 1s/5s/1s; redundant title/Stats timer throttles are unnecessary with these native intervals. Autosave's interval/throttle are untouched. Stats uses existing `hidden` desktop / `mobile-active` mobile state. Both opening paths refresh synchronously; no Stats RAF exists, so pending count is always zero.

Lifecycle wrappers suspend presentation before calling unchanged `setTimeVisibility()`. Hide/pagehide still settle and checkpoint under existing rules. Return settles the full inactive interval while DOM writes remain suspended, then performs one synchronous current-state refresh: HUD/store/upgrades/multipliers, selected open Farm view, countdowns, global care/mastery, open Mine/Baker content, recipe availability, open quests/Stats, DonutCoin and title. The existing main RAF and visible polling then resume. Duplicate pageshow/visibility events do not repeat the coherent refresh. No old captured Stats values or missed polling callbacks replay.

Baker worker reconciliation always runs; its header writes move to a guarded display helper. Care-window state work is byte-identical before its guarded DOM helper. Ordinary hidden notifications are omitted; `warnAboutStorage()` tags critical notices so the latest message can survive suspension without queuing RAFs. Storage failures still block writes exactly as before. Existing finite cleanup/startup timeouts may finish; the page is not claimed to be universally timer-free.

#### Deterministic before/after measurements

Temporary instrumentation outside the repository loaded captured pre-V4/current sources through the same harness and actual `init()` timers. Desktop/open Stats, combo off, warm startup, fake wall/monotonic clock, no real browser. Measurements count callback entries, Stats text-write batches, countdown writes, pending RAFs and native intervals; they do not estimate CPU, GPU, battery or temperature.

**60 hidden seconds with RAF delivery suspended:**

| Metric | Before → After |
| --- | --- |
| Stats requests / Stats RAF requests | 12 / 12 → 0 / 0 |
| Actual Stats renders while hidden | 0 → 0 (old work was queued) |
| Title updates | 60 → 0 |
| DonutCoin updates | 60 → 0 |
| HUD / Farm tab renders | 0 / 0 → 0 / 0 |
| Countdown DOM writes | 0 → 0 |
| Pending RAFs at endpoint | 13 → 0 (old main RAF plus 12 Stats) |
| Interval callbacks | 132 → 0 |
| Timeout callbacks during steady-state window | 72 → 0 (old title/Stats throttle resets) |
| Active interval owners | 4 → 1 (autosave retained) |
| Autosave callbacks / settlement entries in this 60s window | 0 / 0 → 0 / 0 |

On return/first delivered frame, old Stats replayed **12 stale render batches**; V4 synchronously rendered current Stats **once**, plus one HUD, coin/title refresh and two countdown text writes. Only the main scheduler RAF remained pending afterward.

**600 hidden seconds, RAF suspended:** Stats requests/queued RAFs 120→0; title/coin updates 600 each→0; pending RAFs 121→0. Interval callbacks 1323→3, timeout callbacks 723→3. Both versions retained **3 autosaves and 3 required settlement entries**; remaining V4 one-shot callbacks are the unchanged autosave throttle resets. With the same 150-CPS mixed Baker/Mine fixture, credited income was **22500 in both**, and resource remainders matched (including the warmup phase). No claim that lifecycle saving stops.

**60 hidden seconds, artificial 1Hz RAF-delivery stress policy:** old delivered callbacks drove 59 orchestration/HUD updates, 12 actual Stats renders and 118 countdown writes. V4 canceled the chain: all those counts were zero. This deliberately controlled policy is not a claim about any browser's hidden throttling. Equal endpoint income was 2250 in both fixtures. A separate focused 100-CPS test credited exactly **15000 over ten hidden minutes** with all three autosaves retained.

#### Verification and compatibility

Added 12 focused cases in `tests/hidden-presentation.test.js`: hidden entry-point dormancy, zero Stats RAF ownership/current values, stopped timers, single return refresh and duplicate pageshow, wall-clock coin/title, sleeping Mine/Baker countdowns with exact phases/inventory, 25% ten-minute income with autosaves, continuous 12h cap across saves, duplicate lifecycle credit safety, quest deadline/breeding/cooldown/RNG equivalence, notification/tooltip ownership and retained storage warnings, immediate desktop/mobile Stats opening, and a late delivered hidden scheduler callback. Tests restore real presentation methods and use fake DOM/clocks only; the harness adds the browser's `removeEventListener()` API for real tooltip cleanup. No existing assertion was weakened.

Focused: **12 passed**. Nearest affected hidden/time/save/scheduler/reuse/production gate: **125 passed**. Final syntax checks passed for all 18 JavaScript files; all four HTML pages passed asset-reference, unique-ID and JSON-LD checks. One final `node --test tests/*.test.js`: **259 passed, zero failures** (all 247 existing tests plus 12 new), with no skipped tests or weakened existing assertions.

Source-method comparison confirms unchanged `settleTime()`, `setTimeVisibility()`, Production Math/V3 cache helpers and keys, `updateProduction()` and visible cadence constants, purchases/upgrades/crafts, clicks/combos/auto-buyer, Farm simulation/mastery/breeding/buffs, Mine/Baker cycles/market formulas, quest progression/multipliers, prestige, save/load/request coalescing/validation/checksum and claim mechanics. Only presentation boundaries/owners change. No inactive cap, chronological boundary, RNG ordering or save shape changes. `saveVersion` remains 1, with unchanged legacy/backup/stale-tab/write protection. New flags/handles are transient. Runtime cache query is 1.5.18→1.5.19; content and CSS remain unchanged.

Files: `script.js`, `index.html`, new `tests/hidden-presentation.test.js`, `tests/helpers/game-harness.js` (event removal API), `AGENTS.md`, this history. **Gameplay/numeric changes: None.** No dependencies, browser automation or deployment. Recommended V5: one separate mobile/reduced-motion visual scaling and GPU/compositing cleanup task; not implemented. Combo/click workload, finite required hidden callbacks and remaining Production Math duplication remain deferred.


### Building Price Display Consistency

Implemented on 2026-10-18 after V4's 259 passing tests. Traced store/HUD → `getBulkPricePreview()` → `calculateBulkPrice()`, tooltip `showItemInfo()`, actual `buyItem()`, formatter and rounding sites before editing. Authoritative price is the unchanged iterative sum of the selected number of geometrically growing raw costs, rounded **once** with `Math.ceil(totalCost)`. Individual costs and stored growth remain floating point; no epsilon adjustment or per-unit rounding is introduced.

The store already formatted this canonical integer preview and compared live balance against it. The tooltip instead formatted raw `item.baseCost` and used that raw value for affordability. `formatNumber(..., "cost")` floors ordinary values below one million (and retains existing suffix formatting above that threshold), so 8613.2 or 8613.000000000002 displayed as 8613 in the tooltip while the store and real charge were 8614. `Math.round()` is not involved in this path. Tooltip single-item prices also disagreed with the store when a bulk amount was selected.

Changed only the tooltip's price input and color comparison to use `getBulkPricePreview(itemKey, this.purchaseAmount)`. Store and tooltip now format the same authoritative selected-purchase value and compare live affordability against the real charged total. Actual purchases/auto-buyer remain uncached and authoritative. V3 cache keys, boundedness and natural invalidation are unchanged; tooltip reads reuse the same entry rather than creating another cache. `formatNumber()`, price iterations/rounding, cost multipliers/growth, economic state, saves and all other runtime methods are unchanged. Existing suffix/grouping presentation is retained. Runtime cache query1.5.19→1.5.20 only.

Added five focused tests in `tests/building-price-display.test.js`. All 11 buildings are checked for fractional/exact-integer prices, affordable/unaffordable boundaries, actual charged value and unchanged raw growth. Selected amounts1/10/100 agree across both displays and real transactions; a separate test verifies repeated store/tooltip queries reuse the existing cache while balance remains live and cost changes miss. Before the fix, four regression cases failed and the exact-integer case passed. Focused price/cache gate: **18 passed**. One final `node --test tests/*.test.js`: **264 passed, zero failures** (259 existing plus5 new); no existing expectations were weakened. Syntax checks passed for19 JavaScript files, and all four HTML pages passed local asset/unique-ID/JSON-LD checks. Existing test assertions and harness remain unchanged.

Files: `script.js` (tooltip only), `index.html` (runtime cache version), new `tests/building-price-display.test.js`, `AGENTS.md`, this history. Gameplay/numeric changes: **None**; this corrects presentation only. Save version1, data shape/loading and time/RNG are unchanged. No browser automation or deployment performed.

### Upgrade Economy V2 — Full Building Upgrade Rebalance / Late-Game Expansion

Implemented on 2026-10-18 after the264-test baseline. This is an explicitly authorized progression/balance change, not a correctness-only patch. Read the current contracts, content, runtime purchase/UI/load/reset paths, Production Math/save/prestige tests and previous economy evidence before selecting prices. Captured pre-change content/runtime outside the repository; no image assets, new currency/mechanic, recipes, side system or performance changes.

#### Previous economy and mathematical decision

Ordinary ownership gates were1/15/30/50/100, with Baker extras150/200. Price ladders mixed ×5/×10/×100/×1000 jumps and late100-copy investment walls. Neural Network Bakery, Portal and Capital Crest had no dedicated upgrades. A direct `buyUpgrade()` call could bypass every displayed unlock gate.

Deterministic pre-implementation probes rejected a single `2*C(N)` acquisition-cost coefficient: with common r1.16, its upgrade/next-copy payback ratios at10/20/30/40 owned were.967/.593/.412/.312, progressively making upgrades immediate preferred purchases. Coefficients1/1.5/2.5/3 likewise cannot keep a comparable crossover at every tier. Selected marginal coefficient1.5 after comparing1/1.25/1.5/2: it creates2–3 additional-copy windows, while the entry floor crosses at five owned. Tested the candidate curve and a return-ranked investment frontier before content edits, then repeated them against the actual final literals. Candidate/final outputs matched (subsequent analysis uses authoritative iterative purchase rounding as well).

Authoritative design: for original cost B, growth r and unlock N, `P(N)=roundUp3(max(10*B,1.5*N*B*r^N))`; `roundUp3(x)` uses `u=10^max(0,floor(log10(x))-2)` then `ceil(x/u)*u`. Prices are fixed literals, independent of live balance/prestige/production mirrors. Core N1/10/20/30/40 for all ten ordinary buildings. Baker preserves first-five identities/indices and its two extra identities at60/80. All effects remain local×2; five=×32, all seven Baker=×128. Cursor, click/utility and global definitions remain byte-equivalent as ordered JSON. No prerequisite-upgrade chain is added.

The within-building payback ratio cancels base CPS and already purchased modifiers, starting near1.5 at tiers2+ and decreasing as fleet size/next-copy price increase. Actual crossover ownership for all ten buildings is1→5,10→12,20→23,30→33,40→43; Baker extras60→63,80→83. Neighboring-building CPS enters the investment comparisons and frontier, not an arbitrary per-building price exception. [Full design/old→new prices](UPGRADE_ECONOMY_V2.md) and [all52 tier metrics](UPGRADE_ECONOMY_V2.csv) record ownership, price, fleet/marginal CPS, paybacks, C(N), price ratios, and next-tier alternatives. `scripts/analyze-upgrade-economy.js` reproduces both reports using actual content and canonical Production Math through the existing VM harness. It emits CSV by default and a budget frontier with `--frontier`; optional `--candidate` probes the model. No second production implementation or runtime auto-buyer policy.

#### Content, authority and prestige

Added exactly15 new ×2 upgrades in three appended categories, after all ten legacy categories. All58 old identities/order/text/images/flags survive; only authorized37 ordinary prices/gates change. New first/middle/final prices: Neural25.3B/1.48T/57.4T; Portal277B/16.2T/629T; Capital3.03T/177T/6.89Q. User-supplied PNG destinations are `img/neural-network-bakery1…5.png`, `img/portal1…5.png`, `img/capital-crest1…5.png`; none were created. New icons will remain unavailable until those files are supplied.

`isUpgradeUnlocked()` shares the existing ordinary/click/utility/global eligibility rules between `showUpgrades()` and authoritative `buyUpgrade()`. Reject invalid category/index and already-owned requests; settle old time, then recheck unlock/funds before charge/flag mutation. Ordinary unlocks require ownership only. Existing direct owned-flag load/test helpers remain supported; loading does not revoke an entitlement below new ownership gates. The purchase still applies its existing production/UI/save updates, preserving V3 invalidation, exact-once effects and live affordability.

Fresh first prestige550B→10T; threshold remains a simple `10T*2^completedPrestiges`, production remains `2^completedPrestiges`. Load grandfathers an exact existing-run threshold `550B*2^p`, whether eligible yet or not, until the next prestige; no persisted migration flag. Other undersized saved thresholds still repair to the new floor, and higher thresholds retain the old max policy. This avoids stripping old eligibility while letting new/restarted runs reach Capital Crest before first prestige.

Representative return-ranked budget frontier (copies/upgrades, no recipes/global/temporary/mastery/side income): old550B gives Nature21/2, Neural14/2, Portal4/0, Capital0/0; fresh10T gives31/3,22/2,18/2,5/0. Five Capital Crests plus first upgrade cost approximately5.113T before other buildings, so an earlier Capital upgrade remains a feasible alternative. By160T: Capital23/2;2.56Q:39/4. At10.24Q (prestige10 eligibility), the frontier holds43/4 and plans its last6.89Q upgrade at about10.619Q cumulative spend; continuing, prioritizing Capital or reaching prestige11's20.48Q can fund it. These are budget illustrations, not playtime forecasts or prestige requirements.

Core40-copy/five-upgrade all-in costs: Nature6.839T, Neural74.795T, Portal819.582T, Capital8.985Q. Capital tier5 unboosted payback272.35h at40 (another copy181.40h), crossing by43; existing prestige8/10 reduce its isolated payback ratio to1.064h/.266h. Deep tiers are intentional multi-prestige investments. At Neural23/two upgrades, tier3 payback16.52h beats its next copy19.69h and a Portal20/two-upgrade copy20.76h; Portal23/two upgrades similarly27.17h versus32.40h and Capital20/two-upgrade copy37.28h. Expansion wins at the unlock; later fleet doubling can beat both mature alternatives.

#### Compatibility, validation and boundaries

SaveVersion1, envelope/checksum/backup/stale-tab protection, flag serialization/hydration, and all existing array identities remain unchanged. New categories default unowned in old snapshots; both boolean and object flags restore. Purchased old upgrades remain owned without refunds/retroactive charges. Saved cost/requirement metadata never overrides content. New flags round-trip; prestige clears every run flag while preserving permanent Farm mastery and the existing production effect. Sequential use of old clients can discard unrecognized new categories and reapply old balance; existing stale-tab protection is not a content downgrade migration.

Added12 focused `tests/upgrade-economy.test.js` cases: all52 fixed model prices/gates, exact fifteen additions/assets, eligibility/funds/idempotence, invalid requests and special gates, shared UI/formatting/×2 text, legacy plain/encoded saves/all old flags, new flags/×32 round trip, old/new prestige eligibility/floors/reset, settled-old→new-rate chronology and actual crossovers. Content tests retain the original building fingerprint, add a pre-V2 identity-only projection excluding just authorized ordinary cost/gate fields (SHA25625012ae3a109705a873bcc129b499cc63f4ff2e3cffa47cbd70a0616773ac015), and pin full approved V2 content (4d77f738f4e1988e209560d4d59ef90326faec7645d955d3b80acadd6abe134f). Existing economic/content expectations adapt: saved prestige1 threshold now20T; the all-available late Mine fixture's permanent CPS band rises2^26→2^27 (unchanged .03 reference share), with canonical CPS268,280,350.398442; and the exact available-upgrade count rises58→73. No assertion was weakened.

Focused/new content16 tests and affected Production Math/save/reuse/quest/Mine gate122 tests passed. Final syntax checks passed for all21 JavaScript files and all four HTML pages passed local asset/unique-ID/JSON-LD checks. The full regression suite was run exactly once: **275 passed, one failed** because a quest test still asserted58 total upgrade definitions instead of73. Corrected only that authorized content-count expectation; the complete affected quest suite then passed **38/38**, including milestone reachability and historical entitlements. No full-suite rerun was made, honoring the single-run request; no unresolved failure remains in the affected rerun.

Files: `game-content.js`, `script.js`, paired cache queries in `index.html` (both1.5.21), new analysis script/Markdown/CSV, new focused tests, adapted content/save/Mine/quest expectations, `AGENTS.md` and this history. Gameplay/numeric changes: **intentional upgrade prices/unlocks, fifteen local×2 opportunities and fresh prestige threshold**. Building costs/growth/base CPS, Production Math formulas, Cursor/global/click definitions, recipes, Farm/Mine/Baker coefficients, quest lifecycle/coefficients, time/visibility scheduling, save format, RNG and automation algorithms are unchanged. Their production-derived values naturally reflect new owned upgrades. Remaining work: supply15 PNG icons and separately playtest pacing; late recipes/Prestige V2/new systems/CSS/performance are not implemented.

### Upgrade Economy V2.1 — Restore Long-Form Incremental Pacing

Implemented on 2026-10-18. This supersedes V2's balance philosophy, not its correctness work. The user rejected short payback crossovers as the primary design authority and explicitly restored long-form accumulation, ownership milestones and prestige-assisted goals. Traced current content/runtime/load/save ownership, V2 contracts and tests, plus the captured pre-V2 definitions. Captured V2 content/runtime outside the repository before editing. Read the migration skill and mapped readers/writers and forward/rollback behavior before changing the curve.

#### Historical evidence and final pricing

Historical second-tier price divided by5 yields entry anchors: Baker1,050; Farm10,000; Mine160,000; Factory1,800,000; Logistic19,000,000; Power210,000,000; Nature2,300,000,000. Relative prices are normally1/5/50 for the first three tiers, with Baker's preserved discounted first price1,000. Baker/Farm/Mine/Factory continue to5,000/500,000. Logistic/Power use500/500,000, while Nature uses500/50,000. These are actual multiple price families; source values do not establish that their differences were bugs. The chosen normalization explicitly follows the majority long-form family to give tier4/5 substantial future-goal spacing.

Authoritative core rule: **A × [1,5,50,5000,500000]** at **1/15/30/50/100 owned**, every effect local×2. Keep historical anchors/rounded prices and Baker's entry discount. New-building anchor A rounds10×original building cost to nearest two significant digits once at design time: x=10B, u=10^max(0,floor(log10(x))−1), A=round(x/u)*u. Neural/Portal/Capital anchors are25B/280B/3T. Prices are baked literals; no live balance, ROI, growth-based marginal price or current prestige input.

**33 of37 pre-V2 ordinary prices restore exactly.** Only four normalize: Logistic4 9.5B→95B; Power4 105B→1.05T; Nature4 1.15T→11.5T; Nature5 115T→1.15Q. Baker's seven historical prices all restore, with extras at150/200 owned and5.25B/525B (anchor×5,000,000/500,000,000). Cursor/global/click definitions are unchanged. All15 late upgrade names/descriptions/category positions/images remain exactly V2 identities. New ladders: Neural25B/125B/1.25T/125T/12.5Q; Portal280B/1.4T/14T/1.4Q/140Q; Capital3T/15T/150T/15Q/1.5 quintillion. Core five purchased remain×32, Baker seven×128. No prerequisite chain, recipe or new mechanic.

#### Long-term validation

Reworked the existing read-only analysis tool around ownership milestones, accumulated costs and neighboring tiers. It emits [all52 actual tier metrics](UPGRADE_ECONOMY_V2_1.csv), with `--goals` emitting [goal-directed accumulation paths](UPGRADE_ECONOMY_V2_1_GOALS.csv). The latter deliberately buys upgrades at milestones and then further copies, without an ROI ranking. All purchase costs and income use the existing canonical methods. Candidate outputs were generated before content edits and matched actual final outputs afterward. [Full report](UPGRADE_ECONOMY_V2_1.md) records historical→V2→final values, rule/rounding, economic scope, compatibility and limitations. Old V2 reports remain historical and are marked superseded.

For new late buildings, third-tier prices are about.93–.96×30-copy stock cost. Fourth tiers are about4.7–4.9×50-copy stock: an intentionally visible savings goal. Fifth prices are100×fourth, but100-copy stock costs even more than that upgrade. Neural/Portal entry upgrades cost about.90/.92×the next building's initial cost, leaving expansion meaningful. At equal100-copy/five-upgrade ownership, output progresses865.6M→5.76B→35.136B CPS across the final three. Prices are not reduced to make immediate payback attractive.

Complete100-copy/core portfolios cost approximately56.680Q Neural,623.782Q Portal,6.79978 quintillion Capital. A deliberately isolated, one-funded-copy, milestone-first Capital path takes115,622.367 unboosted visible-economic model hours; prestige8/12/16 reduce this to451.650/28.228/1.764. These are mathematical visible-production accumulation intervals, not playtime forecasts. No clicks, other buildings, recipes, globals, boosts or side income are included; hidden25% time and the continuous12h cap are not simulated or changed. Baker's200-copy extra is a later diversified-bakery target: its approximately2.437Q stock/all-upgrades cost is supplementary once high-tier output exists (about16.93 constant-production model seconds at100 fully upgraded Capitals/prestige12). It is not evaluated as a sensible Baker-only strategy.

#### Prestige restoration and compatibility

Restored **550B × 2^completedPrestiges** thresholds and retained **2^completedPrestiges** production. First prestige is again allowed before completing the late building ladder; eligibility is not a forced reset or spending cap. Load converts an exact V2 **10T × 2^p** threshold to the restored minimum; pre-V2 thresholds remain unchanged. Other undersized/higher thresholds follow the pre-V2 max(saved, minimum) policy. Conversion is idempotent and load writes no storage. Earned counters, balance, prestige count and purchased entitlements are not charged, refunded or removed.

Content factories own fixed prices/gates; existing `isUpgradeUnlocked()`/`buyUpgrade()` still own authoritative eligibility/funds. The save writer/loader still preserve category/index purchased flags, including boolean/object legacy shapes. V2 upgrades owned below restored gates (including Baker80 extras and late40-copy final tiers) remain purchased and contribute their exact local factor. No saveVersion change, new migration field or destructive contraction. Checksum/backup/stale-tab protection, coalescing and all other save behavior remain unchanged.

Forward path is paired runtime/content1.5.22; restore in memory, then save through established checkpoints. Mixed open tabs retain their loaded economy and the existing optimistic stale-tab write guard; no automatic merge or atomic deployment guarantee is added. Rollback to paired V2 runtime/content retains all expansion categories/indices and accepts restored550B current thresholds via V2's existing grandfather path. A read-only probe of the actual captured V2 loader verified preserved funds/new flags/current eligibility without writes. Rolling back reintroduces its balance on future actions, not a destructive migration. Pre-expansion clients cannot preserve unknown new flags and are not an expansion-save rollback target. No deployment performed.

#### Verification and boundaries

Updated the existing12 focused cases for all52 long-form prices/gates, Baker extras, all15 retained additions/assets, direct ownership/funds enforcement, representable shortfalls and actual charges at quintillion scale, exact-once effects, UI, legacy/V2 flag round trips, both prestige curves' restoration/idempotence/no-load-write behavior, prestige reset/mastery and old→new-rate chronology. Content guards preserve pre-V2 and V2 identity projections and pin full V2.1 content (SHA2561da626620670ec84f68dc3e77af756f83b337160be92ec2de6014a63fc908a48). The existing production transaction fixture now reaches the real30-copy gate; its economic assertions are unchanged. Save reset threshold expectation returns to1.1T. The late Mine fixture remains in band2^27 under the retained new ladders (current CPS212,912,778.25610942), with no Mine formula/expected band changes. No assertions were weakened.

Focused/affected Production Math, content, save, Mine and economy gate: **91 passed, zero failures**. Complete final-state regression `node --test tests/*.test.js`: **276 passed, zero failures, zero skips**. Syntax passed for all21 JavaScript files; all four HTML pages passed local asset-reference, unique-ID and JSON-LD checks. Both52-row CSVs matched the actual final content.

Runtime diff is limited to prestige base and the targeted load threshold conversion. Shared purchase enforcement, Production Math/caching, elapsed time/RNG, V2 scheduling/hidden presentation, building costs/growth, recipes, Farm/Mine/Baker/quest logic, Cursor, combos/clicks and automation algorithms are unchanged. Only intended prices/requirements and restored prestige policy change. Existing Number precision/range remains; fixed late prices are finite and representable, while large accumulated balances retain existing floating-point granularity. No image, CSS, audio, dependency, browser automation or new subsystem work.

Files: `game-content.js`, `script.js`, paired cache queries in `index.html`, revised analysis tool, new V2.1 Markdown/two CSVs, historical-report supersession note, focused/content/production/save tests plus current Mine fixture comment, `AGENTS.md` and this history. Required15 `img/neural-network-bakery1…5.png`, `img/portal1…5.png`, `img/capital-crest1…5.png` references remain unchanged; no images created. Remaining work is player pacing feedback and separately scoped future content, not further ROI equalization.

### SEO Expansion V1 — Free Browser Game Discovery

Implemented on 2026-10-18. Audited all four public HTML pages, their titles/descriptions/headings, static versus JavaScript-owned copy, canonical/social/JSON-LD metadata, image alt text, internal links, robots/sitemap and favicon/manifest inventory before editing. The game-first fixed-viewport layout and current Info controls on desktop/mobile were traced before choosing content placement. No new public page, manifest, image, dependency, font, analytics or gameplay change.

The homepage previously described the idle/clicker/incremental categories but lacked a compact static explanation of actual play outside gameplay panels and historical news. Its logo alt made an unsupported “Best Idle Game” claim. All three genre guides had FAQPage schema whose four questions/answers differed from their three visible FAQs. Canonicals, crawl permissions, four-page sitemap coverage and distinct guide titles/descriptions were already correct. Existing favicon and social artwork were retained; no legal/privacy page or installable-app claims were invented.

Homepage title: `Donut Clicker – Free Browser Idle Clicker & Incremental Game` → `Donut Clicker – Free Idle & Incremental Browser Game`. Description: `Play Donut Clicker, a free browser idle clicker (incremental) game. Click to earn donuts, buy upgrades, prestige for permanent boosts, and grow your idle production.` → `Play Donut Clicker free in your browser. Build a donut empire, automate production, complete quests and prestige for stronger runs. No download required.` Search and social titles/descriptions now agree; the existing image has descriptive social alt metadata. The single logo H1 remains dimensionally unchanged with accurate brand/category alt text.

Added a compact static overview/how-to at the top of the existing player-facing Info panel, accessed through the existing Info controls on desktop/mobile. This deliberately reuses game help rather than adding a below-game section unreachable in the current overflow-hidden layout, changing page scrolling or putting an article above play. The panel is initially closed, like other game panels; the text is ordinary player help, not crawler-only content. It explains clicking/tapping, buildings, upgrades, quests, Baker recipes, Mine ore trading, Farm animals/goods/contracts, prestige, browser-local saving and the 25%/12-hour continuous-absence production limits. It also links descriptively to the existing guides, making them available from mobile Info. Guide closing sections now explain how their subject applies to the actual free browser game and retain direct play links. No anchors target a closed panel that would need new JavaScript to open.

Retained the accurate VideoGame entity, browser platform and zero-price offer. Expanded its description/genre with supported incremental-game facts; author credits now match the on-page ktz/doa credits, without assuming a sole publisher role. Removed all three mismatched FAQPage blocks instead of manufacturing replacement FAQs; existing visible FAQ content and Article schema remain. Kept all canonical URLs and robots rules unchanged. Sitemap lastmod dates for the four actually modified pages are now 2026-10-18. No doorway pages, keyword stuffing, ratings/reviews, rich-result promises or ranking/traffic claims.

Validation: all four HTML files passed local structure/nesting, single title/description/canonical/H1, unique-ID, image-alt-presence, local-asset/internal-link/fragment, ARIA-reference and JSON-LD parsing checks. Verified homepage social/search consistency, VideoGame URL/free-offer/image coherence, exact canonical sitemap coverage/no duplicates, lastmod values and robots sitemap discovery. These are local static checks, not a hosted HTML/schema service or browser layout assessment. JavaScript syntax checks passed for all21 files. The complete regression suite was run once on the final public-file state: `node --test tests/*.test.js` → **276 passed, zero failures, zero skips**. No tests or existing assertions were changed.

Compared pre-edit snapshots: runtime/content (`script.js`, `game-content.js`), all three stylesheets and robots are byte-identical. Script/image/stylesheet/ad request attributes and existing inline executable scripts are unchanged; no network request or render-blocking resource was added. Homepage HTML61,089→63,272 bytes (+2,183); local deterministic gzip11,712→12,288 (+576). Clicker guide9,350→7,805; idle guide10,799→9,271; incremental guide10,100→8,609 bytes. Aggregate HTML decreases2,381 raw bytes (244 gzip bytes). Gzip figures are a local size comparison, not observed hosting compression or Core Web Vitals. Ads and game controls remain in their original positions; no CSS, game balance, saves, Production Math, time policy or performance scheduler changes. No browser automation or deployment performed.

Files: `index.html`, all three existing genre guides, `sitemap.xml`, `AGENTS.md` and this history. Recommended next step: after deployment, use Google Search Console to verify the four canonical pages and sitemap, then measure actual query impressions/CTR by search theme before further SEO work. No traffic or ranking improvement is established by these source changes.

### Owner Debug Tools V1 — Console-Only Development Controls

**Superseded by Owner Debug Tools V3 below. The V1 APIs, credentials and persistence are no longer implemented.**

Implemented on 2026-10-18. Traced current manual versus combo clicks, canonical income/earned counters, quest/prestige updates, game initialization and explicit save serialization before editing. This adds deliberately hidden client-side owner tooling, not authentication. `script.js` contains a private owner closure with an intentionally unusable `EXPECTED_OWNER_SHA256` placeholder; the owner must supply their own64-character SHA-256 hex digest. No passphrase or usable secret is shipped.

Exposed only `window.unlockOwnerTools(passphrase)` (Web Crypto SHA-256, silent false on invalid input/mismatch/configuration/storage failure), `window.openOwnerTools()` and `window.lockOwnerTools()`. Successful unlock stores a separate `donutClickerOwnerEnabled` localStorage flag. Reload restores enabled mode, with a fresh×1 multiplier. Lock disables immediately, resets the modifier, removes the flag and closes/removes the panel; removal also disables other open tabs via their storage event. A pending asynchronous unlock cannot override a later lock. Storage errors are contained and never break normal initialization.

An unlocked open call builds a native dialog dynamically. It contains separate balance-only and earned grant groups, each with+1K/+1M/+1B and custom amounts;×1/10/100/1000 manual-click controls; current balance/earned/CPS/canonical click/debug multiplier/debug click/prestige count/requirement/visibility; manual Refresh, Reset modifiers, Close and Lock. Refreshes occur only when opened or after owner actions, without a timer/RAF. No normal UI hint, initial debug HTML, menu/Settings addition, bakery-name/key/URL trigger or console message.

Grants validate positive finite representable changes, settle through existing authority, then call `creditDonuts(amount, false)` or `creditDonuts(amount, true)`. Earned grants additionally check existing production quest/milestone progress; both refresh existing game UI and request the established coalesced save. Balance-only grants do not themselves increase earned/prestige/production-quest counters; elapsed ordinary income can still settle normally. Granted donuts are ordinary persisted game progress, not temporary currency that lock would remove.

The only existing gameplay method change wraps the final canonical value in `handleDonutClick()` with the owner multiplier. Canonical click math, CPS, combo/Auto Catcher rewards, upgrades, recipes and prestige effects remain untouched. The multiplier is private memory state, never part of Game/save fields; non-finite scaled values fall back to×1. SaveVersion1, snapshot keys, checksum/backups/stale-tab guard/rotation, time/RNG and existing scheduling remain unchanged. Runtime cache query advances to1.5.23; content remains1.5.22. No CSS or asset changes/new network dependencies.

Verification was intentionally lightweight per the user's instruction: JavaScript syntax passed; an ad hoc existing-VM smoke exercised real constructor/load, locked placeholder/no panel, ordinary×1 manual income and normal save serialization. A separately configured in-memory copy using a disposable random verification input exercised real Web Crypto unlock, lazy dialog opening,×10 manual income with unchanged canonical click/CPS, the two grant semantics and earned prestige eligibility, unchanged save keys/version, and lock/flag removal/×1 restoration. No verification passphrase/digest was written to repository code. No tests or test infrastructure were added, no full regression suite or browser automation was run. Source comparison confirms every previous Game method is unchanged except the single manual-click integration line; original save serialization is byte-identical.

Files: `script.js`, `index.html` (runtime cache query only), `AGENTS.md` and this history. Owner setup remains intentionally pending: generate SHA-256 locally with browser Web Crypto, paste only the digest into the marked constant, deploy/reload, unlock through the console and open explicitly. Normal players receive no visible entry point.


### Owner Debug Tools V3 — Simple Console-Only Panel

Implemented on 2026-10-18 as a complete replacement of the rejected V1 tooling. Removed the expected digest, unlock/lock APIs, enabled flag, crypto logic, owner localStorage reads/writes and storage-event listener. No V1 compatibility path or setup requirement remains. This is intentionally source-discoverable console convenience, not authentication.

The existing DOMContentLoaded bootstrap now attaches the private debug controller to the actual Game instance immediately after `game.init()`. It exposes `window.openDonutDebug()`, `window.closeDonutDebug()` and `window.resetDonutDebug()`. Opening immediately creates one native dialog; closing removes it but keeps the in-memory click multiplier; reset removes it and restores×1. A fresh page runtime starts at×1. No initial debug markup, visible entry point, trigger, advertisement, polling, RAF or dependency was added.

The new panel has separate Balance Only/Add As Earned sections with+1K/+1M/+1B/+1T and custom numeric amounts, manual-only×1/10/100/1000/10000, current balance/earned/CPS/normal click/debug multiplier/debug click/prestige count/current requirement/visibility, manual Refresh and Close/Reset. Grants retain canonical `creditDonuts(amount, false/true)` semantics and normal economic settlement/progression/checkpoints; positive finite/representable changes are required. Debug state never enters Game or the save payload. Granted currency is normal progress and is not undone by debug reset.

The previous final-manual-click integration now calls the replacement controller; canonical click formulas, combos/Auto Catcher rewards, production, prices/upgrades, recipes, quests, Farm/Mine/Baker, prestige balance, time/RNG, offline policy and scheduling are unchanged. Save serialization, saveVersion1, checksum/backup/migration/stale-tab logic remain byte-identical. Runtime cache query advances1.5.23→1.5.24; content/CSS and the page outside the panel remain unchanged.

Lightweight verification used the existing VM/browser stubs with the full current script and actual DOMContentLoaded→new Game→real `init()` path (existing rendering stubs retained). Explicitly confirmed `typeof window.openDonutDebug === "function"` after initialization and absence of the old globals; open creates the dialog; +1K Balance Only leaves earned/prestige unchanged; earned income increases both counters and prestige eligibility;×100 scales only manual reward with unchanged canonical click/CPS; close retains it; reset removes the panel/restores×1; a fresh runtime reloading saved progress returns normal×1 clicks; saveVersion remains1 with no recursive owner/debug fields. Verified the new+1T and×10000 controls are present. JavaScript syntax passed. No tests/test infrastructure were added, no full regression suite or real-browser automation was run.

Files: `script.js`, `index.html` (cache query only), `AGENTS.md` and this history. No deployment performed.
