(function () {
  const donutDebug = (() => {
    // Console-only development convenience. Discoverable in source; not authentication.
    let game = null;
    let panel = null;
    let clickMultiplier = 1;
    const multipliers = [1, 10, 100, 1000, 10000];
    const amounts = [[1000, "+1K"], [1000000, "+1M"], [1000000000, "+1B"], [1000000000000, "+1T"]];

    function manualClickValue(canonical) {
      const value = canonical * clickMultiplier;
      if (Number.isFinite(value)) return value;
      clickMultiplier = 1;
      return canonical;
    }

    function close() {
      if (!panel) return;
      const dialog = panel;
      panel = null;
      dialog.close();
      dialog.remove();
    }

    function reset() {
      clickMultiplier = 1;
      close();
    }

    function refresh() {
      if (!panel) return;
      const canonical = game.calculateClickValue();
      const debug = manualClickValue(canonical);
      const values = {
        balance: game.donutCount,
        earned: game.totalDonutsEarned,
        cps: game.calculatePerSecond(),
        canonical,
        multiplier: `×${clickMultiplier}`,
        debug,
        prestige: game.prestigeCount,
        requirement: game.nextPrestigeThreshold,
        visibility: document.visibilityState,
      };
      panel.querySelectorAll("[data-debug-stat]").forEach(node => {
        const value = values[node.dataset.debugStat];
        node.textContent = typeof value === "number"
          ? value.toLocaleString("en-US", { maximumSignificantDigits: 17 }) : value;
      });
    }

    function grant(amount, asEarned) {
      if (!Number.isFinite(amount) || amount <= 0) return false;
      game.settleBeforeMutation();
      const balance = game.donutCount + amount;
      const earned = game.totalDonutsEarned + amount;
      if (!Number.isFinite(balance) || balance <= game.donutCount ||
          (asEarned && (!Number.isFinite(earned) || earned <= game.totalDonutsEarned))) return false;
      if (!game.creditDonuts(amount, asEarned)) return false;
      if (asEarned) {
        game.checkDynamicQuestProgress();
        game.checkMilestoneProgress();
        game.updateQuestDisplay();
      }
      game.updateDisplay(true);
      game.showUpgrades();
      game.updatePrestigeBar();
      game.updateTitleWithDonuts();
      game.requestSave();
      return true;
    }

    function open() {
      if (panel) { refresh(); return true; }
      const dialog = document.createElement("dialog");
      dialog.id = "donut-debug-panel";
      dialog.setAttribute("aria-labelledby", "donut-debug-heading");
      Object.assign(dialog.style, {
        width: "min(90vw, 620px)", maxHeight: "85vh", overflow: "auto",
        boxSizing: "border-box", padding: "20px", border: "2px solid #b8860b",
        borderRadius: "12px", background: "#2c2c2c", color: "#fff",
        font: "14px/1.5 system-ui, sans-serif",
      });
      const grants = [
        ["balance", "Balance Only", "Spendable donuts only. Does not count toward total earned, prestige or production quests."],
        ["earned", "Add As Earned", "Counts as earned income toward prestige and production progression."],
      ].map(([mode, label, explanation]) => `
        <fieldset style="margin:12px 0">
          <legend>${label}</legend><p>${explanation}</p>
          ${amounts.map(([amount, text]) => `<button type="button" data-debug-mode="${mode}" data-debug-amount="${amount}">${text}</button>`).join(" ")}
          <p><label>Custom amount (donuts)
            <input type="number" min="0" step="any" data-debug-input="${mode}" style="max-width:100%">
          </label>
          <button type="button" data-debug-mode="${mode}">${label}</button></p>
        </fieldset>`).join("");
      const stats = [
        ["balance", "Donuts"], ["earned", "Total earned"], ["cps", "Effective CPS"],
        ["canonical", "Normal click value"], ["multiplier", "Click multiplier"],
        ["debug", "Debug click value"], ["prestige", "Prestige count"],
        ["requirement", "Current prestige requirement"], ["visibility", "Visibility state"],
      ].map(([key, label]) => `<div>${label}: <output data-debug-stat="${key}" style="overflow-wrap:anywhere"></output></div>`).join("");
      dialog.innerHTML = `
        <h2 id="donut-debug-heading">Donut Debug</h2>
        <button type="button" data-debug-action="close">Close</button>
        <h3>Donuts</h3>${grants}
        <h3>Click Multiplier</h3>
        ${multipliers.map(value => `<button type="button" data-debug-multiplier="${value}">×${value}</button>`).join(" ")}
        <p>Manual clicks only. Closing keeps the multiplier; reset or reload restores ×1.</p>
        <h3>Current State</h3>${stats}
        <p><button type="button" data-debug-action="refresh">Refresh</button>
        <button type="button" data-debug-action="reset">Reset debug</button></p>
        <p role="status" data-debug-status></p>`;
      dialog.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;
        const status = dialog.querySelector("[data-debug-status]");
        if (button.dataset.debugAction === "close") { close(); return; }
        if (button.dataset.debugAction === "reset") { reset(); return; }
        if (button.dataset.debugMultiplier) {
          const value = Number(button.dataset.debugMultiplier);
          if (!multipliers.includes(value)) return;
          if (!Number.isFinite(game.calculateClickValue() * value)) {
            status.textContent = "Multiplier exceeds the numeric range.";
          } else {
            clickMultiplier = value;
            status.textContent = "Manual click multiplier updated.";
          }
        }
        const mode = button.dataset.debugMode;
        if (mode === "balance" || mode === "earned") {
          const raw = button.dataset.debugAmount ?? dialog.querySelector(`[data-debug-input="${mode}"]`).value;
          status.textContent = grant(Number(raw), mode === "earned")
            ? (mode === "earned" ? "Added as earned income." : "Added to balance only.")
            : "Enter a positive, finite amount that changes the balance without overflow.";
        }
        refresh();
      });
      dialog.addEventListener("close", () => {
        dialog.remove();
        if (panel === dialog) panel = null;
      });
      document.body.appendChild(dialog);
      panel = dialog;
      dialog.showModal();
      refresh();
      return true;
    }

    function attach(liveGame) {
      game = liveGame;
      window.openDonutDebug = open;
      window.closeDonutDebug = close;
      window.resetDonutDebug = reset;
    }

    return { attach, manualClickValue };
  })();

  class Game {
    constructor() {
      this.currentVersion = "1.5.4";
      this.saveVersion = 1;
      this.productionStateVersion = 0;
      this.productionSnapshotContext = null;
      this.bulkPriceCache = new Map();
      this._presentationSuspended = false;
      this._presentationTimers = null;
      this._displayUpdateHandle = null;
      this._notificationFrame = null;
      this.saveWritesBlocked = false;
      this._saveReady = false;
      this._loadedPrimarySave = undefined;
      this._saveTimer = null;
      this._saveDeadline = 0;
      this._lastSaveTime = 0;
      this._storageWarnings = new Set();
      this.bakeryNames = [
        "Snowfall Crust",
        "Frosted Pines",
        "Holly Crust",
        "Cinnamon Chalet",
        "Sugarplum Haven",
        "Ginger Whisk",
        "Yule Hearth",
        "Peppermint Twist",
        "Nutcracker Sweets",
        "Frost & Spice",
        "Winter Whisk",
        "Candy Cane Crust",
        "Mistletoe Crumbs",
        "Northern Crust",
        "Icicle Bakes",
        "Golden Fir",
        "Twinkling Treats",
        "Aurora Crust",
        "Snowglobe Delights",
        "Evergreen Sweets",
        "Winter's Crust",
        "Snowdrift Confections",
        "Jolly Crumbs",
        "Cranberry Twist",
        "Frostfire Treats",
        "Silver Sprinkles",
        "Starlight Sweets",
        "Cozy Crust",
        "Pinecone Pastries",
        "Twinkle Tarts",
        "Ginger Glaze",
        "Velvet Snow",
        "Holiday Crust",
        "Sugar Sleigh",
        "Noel Delights",
        "Frosty Whisk",
        "Candlelight Crust",
        "Winterberry Sweets",
        "Bells & Butter",
        "Mulled Spice Crust",
      ];
      this.clickSounds = [
        new Audio("sounds/click1.mp3"),
        new Audio("sounds/click2.mp3"),
        new Audio("sounds/click3.mp3"),
        new Audio("sounds/click4.mp3"),
      ];
      this.upgrades = window.DonutClickerContent.createUpgradeDefinitions();
      this.items = window.DonutClickerContent.createBuildingDefinitions();
      this.baseItemProductions = Object.fromEntries(
        Object.entries(this.items).map(([key, item]) => [
          key,
          item.originalProduction,
        ]),
      );
      this.donutCount = 0;
      this.hasDonutClicked = false;
      this.accumulator = 0;
      this.totalDonutsEarned = 0;
      this.totalClicks = 0;
      this.purchaseAmount = 1;
      this.lastUpdateTime = Date.now();
      this.lastBakerProduction = Date.now(); // Baker üretimi için son üretim zamanı
      this.lastMineProduction = Date.now(); // Mine üretimi için son üretim zaman
      this.lastFarmTick = Date.now();
      this.productionMultiplier = 1;

      // ---- Farm Panel State ----
      this.farmAnimalDefs = {
        chicken: {
          name: "Chicken",
          good: "egg",
          prodInterval: 45,
          baseCost: 1500,
          costMult: 1.22,
          baseSellPrice: 60,
          storageCap: 30,
          unlockFC: 1,
        },
        cow: {
          name: "Cow",
          good: "milk",
          prodInterval: 90,
          baseCost: 15000,
          costMult: 1.25,
          baseSellPrice: 350,
          storageCap: 18,
          unlockFC: 5,
        },
        sheep: {
          name: "Sheep",
          good: "wool",
          prodInterval: 150,
          baseCost: 75000,
          costMult: 1.28,
          baseSellPrice: 1800,
          storageCap: 12,
          unlockFC: 10,
        },
        bees: {
          name: "Bees",
          good: "honey",
          prodInterval: 30,
          baseCost: 600000,
          costMult: 1.3,
          baseSellPrice: 500,
          storageCap: 10,
          unlockFC: 25,
        },
        pigs: {
          name: "Pigs",
          good: "truffle",
          prodInterval: 300,
          baseCost: 6000000,
          costMult: 1.35,
          baseSellPrice: 5000,
          storageCap: 8,
          unlockFC: 40,
        },
      };
      this.farmTraitDefs = [
        // Common traits (10)
        {
          id: "well_fed",
          name: "Well-Fed",
          rarity: "common",
          effect: { type: "prodSpeed", value: 0.08 },
        },
        {
          id: "hardy",
          name: "Hardy",
          rarity: "common",
          effect: { type: "feedCost", value: -0.1 },
        },
        {
          id: "early_riser",
          name: "Early Riser",
          rarity: "common",
          effect: { type: "prodSpeed", value: 0.05 },
        },
        {
          id: "thick_coat",
          name: "Thick Coat",
          rarity: "common",
          effect: { type: "sellPrice", value: 0.06 },
        },
        {
          id: "calm",
          name: "Calm",
          rarity: "common",
          effect: { type: "careBonus", value: 0.1 },
        },
        {
          id: "social",
          name: "Social",
          rarity: "common",
          effect: { type: "socialProd", value: 0.03, max: 0.15 },
        },
        {
          id: "alert",
          name: "Alert",
          rarity: "common",
          effect: { type: "careWindowDuration", value: 5 },
        },
        {
          id: "sturdy",
          name: "Sturdy",
          rarity: "common",
          effect: { type: "breedCooldown", value: -0.15 },
        },
        {
          id: "keen_eye",
          name: "Keen Eye",
          rarity: "common",
          effect: { type: "crateChance", value: 0.05 },
        },
        {
          id: "generous",
          name: "Generous",
          rarity: "common",
          effect: { type: "bonusGood", value: 10 },
        },
        // Rare traits (6)
        {
          id: "golden_touch",
          name: "Golden Touch",
          rarity: "rare",
          effect: { type: "sellPrice", value: 0.15 },
        },
        {
          id: "prolific",
          name: "Prolific",
          rarity: "rare",
          effect: { type: "prodSpeed", value: 0.12 },
        },
        {
          id: "efficient",
          name: "Efficient",
          rarity: "rare",
          effect: { type: "feedCost", value: -0.25 },
        },
        {
          id: "mentor",
          name: "Mentor",
          rarity: "rare",
          effect: { type: "mentorTrait", value: 1 },
        },
        {
          id: "tireless",
          name: "Tireless",
          rarity: "rare",
          effect: { type: "storageCap", value: 0.2 },
        },
        {
          id: "diplomat",
          name: "Diplomat",
          rarity: "rare",
          effect: { type: "contractReq", value: -0.1 },
        },
        // Epic traits (2)
        {
          id: "legendary_producer",
          name: "Legendary Producer",
          rarity: "epic",
          effect: { type: "legendaryProd", prodSpeed: 0.25, sellPrice: 0.1 },
        },
        {
          id: "contract_star",
          name: "Contract Star",
          rarity: "epic",
          effect: {
            type: "contractStar",
            contractSpeed: 0.2,
            buffDuration: 0.15,
          },
        },
      ];
      this.farmBreedPrograms = {
        quick: {
          name: "Quick",
          duration: 1800,
          costMult: 3,
          traitSlots: 2,
          rareBonus: 0,
        },
        standard: {
          name: "Standard",
          duration: 7200,
          costMult: 5,
          traitSlots: 2,
          rareBonus: 0.05,
        },
        long: {
          name: "Long",
          duration: 14400,
          costMult: 8,
          traitSlots: 3,
          rareBonus: 0.1,
        },
      };
      this.farmContractNames = {
        rush: [
          "Quick Delivery",
          "Express Order",
          "Urgent Supply",
          "Speed Run",
          "Flash Sale",
        ],
        standard: [
          "Bakery Supply Run",
          "Breakfast Feast",
          "Market Day",
          "Village Order",
          "Festival Prep",
          "Kitchen Restock",
        ],
        longhaul: [
          "Grand Feast",
          "Royal Banquet",
          "Harvest Festival",
          "Winter Stockpile",
          "Merchant Caravan",
          "Export Contract",
        ],
      };
      this.farmAffixDefs = [
        {
          id: "urgent",
          name: "Urgent",
          rarity: 0.25,
          effect: { durationMult: 0.7, rewardMult: 0.8 },
        },
        {
          id: "generous",
          name: "Generous",
          rarity: 0.15,
          effect: { rewardMult: 1.4 },
        },
        {
          id: "demanding",
          name: "Demanding",
          rarity: 0.15,
          effect: { reqMult: 1.5, rewardMult: 1.6 },
        },
        {
          id: "focused",
          name: "Focused",
          rarity: 0.2,
          effect: { singleGood: true, buffDurationMult: 1.2 },
        },
        {
          id: "volatile",
          name: "Volatile",
          rarity: 0.08,
          effect: { volatileReward: true },
        },
        {
          id: "vip",
          name: "VIP",
          rarity: 0.07,
          effect: { buffStrengthMult: 1.3 },
          masteryReq: 8,
        },
        {
          id: "chain",
          name: "Chain",
          rarity: 0.06,
          effect: { chain: true, chainRewardMult: 1.5 },
        },
        {
          id: "legendary",
          name: "Legendary",
          rarity: 0.04,
          effect: { rewardMult: 1.8, reqMult: 3, reqGoods: 2 },
        },
      ];
      this.farmBuffCategories = {
        PROD: { baseStrength: 1.05, baseDuration: 300 },
        COST: { baseStrength: 0.92, baseDuration: 300 },
        OFFLINE: { baseStrength: 1.5, baseDuration: 600 },
        QOL: { baseStrength: 1, baseDuration: 600 },
        EVENT: { baseStrength: 1, baseDuration: 180 },
      };
      this.farmVariants = {
        chicken: [
          { name: "Silkie", effect: { prodSpeed: 0.1 } },
          { name: "Golden", effect: { sellPrice: 0.2 } },
          { name: "Phoenix", effect: { traitSlot: 1 } },
        ],
        cow: [
          { name: "Highland", effect: { prodSpeed: 0.15 } },
          { name: "Jersey", effect: { sellPrice: 0.25 } },
          { name: "Stardust", effect: { traitSlot: 1 } },
        ],
        sheep: [
          { name: "Merino", effect: { prodSpeed: 0.15 } },
          { name: "Cashmere", effect: { sellPrice: 0.25 } },
          { name: "Mystic", effect: { traitSlot: 1 } },
        ],
        bees: [
          { name: "Bumblebee", effect: { prodSpeed: 0.2 } },
          { name: "Royal", effect: { sellPrice: 0.3 } },
          { name: "Crystal", effect: { traitSlot: 1 } },
        ],
        pigs: [
          { name: "Iberian", effect: { prodSpeed: 0.2 } },
          { name: "Truffle King", effect: { sellPrice: 0.3 } },
          { name: "Shadow", effect: { traitSlot: 1 } },
        ],
      };
      this.farmPassports = [
        { id: "nomad", name: "Nomad", effect: { breedCooldown: -0.5 } },
        { id: "artisan", name: "Artisan", effect: { contractContrib: 0.2 } },
        { id: "merchant", name: "Merchant", effect: { sellPrice: 0.3 } },
        { id: "pioneer", name: "Pioneer", effect: { prodSpeed: 0.2 } },
        { id: "scholar", name: "Scholar", effect: { inheritBest: true } },
        { id: "golden", name: "Golden", effect: { allEffects: 0.1 } },
      ];
      this.farmState = this.createDefaultFarmState();
      this.farmActiveTab = "barn";
      this.farmNextAnimalId = 1;
      this.ingredientTypes = [
        {
          type: "Dough",
          rarity: 0.5,
          price: this.items.baker.baseCost * 0.015,
        },
        {
          type: "Sugar",
          rarity: 0.35,
          price: this.items.baker.baseCost * 0.03,
        },
        {
          type: "Chocolate",
          rarity: 0.15,
          price: this.items.baker.baseCost * 0.06,
        },
      ];
      this.bakers = [];
      this.ingredients = {};
      this.bakerProductionInterval = 5 * 60 * 1000;
      this.bakerIngredientsPerCycle = 2;
      this.bakerCycleRemainingTime = this.bakerProductionInterval;
      this.recipes = {
        "Classic Donut": {
          ingredients: {
            Dough: 2,
            Sugar: 1,
          },
          production: 1,
          baseProduction: 1,
          image: "classic-donut.webp",
          description:
            "A timeless favorite! Farm workers love this classic treat - increases farm production by 10%.",
          effects: {
            farm: {
              productionBonus: 0.1,
            },
          },
          scaling: {
            ingredients: {
              multiplier: 2, // Her üretimde malzeme ihtiyacı 2 katına çıkar
              current: 1, // Mevcut ölçekleme faktörü
            },
          },
          craftCount: 0, // Başlangıç değeri olarak 0 ekle
        },
        "White Magic Donut": {
          ingredients: {
            Dough: 2,
            Sugar: 1,
            Chocolate: 2,
          },
          production: 1,
          baseProduction: 1,
          image: "donut.webp",
          description:
            "A timeless favorite! Mine workers love this white magic treat - increases mine production by 10%.",
          effects: {
            mine: {
              productionBonus: 0.1,
            },
          },
          scaling: {
            ingredients: {
              multiplier: 2,
              current: 1,
            },
          },
          craftCount: 0,
        },
        "Chocolate Bliss Donut": {
          ingredients: {
            Dough: 3,
            Sugar: 2,
            Chocolate: 3,
          },
          production: 5,
          baseProduction: 5,
          image: "chocoDonut.webp",
          description:
            "Rich chocolate layers fuel the machines! Increases factory production by 8%.",
          effects: {
            factory: {
              productionBonus: 0.08,
            },
          },
          scaling: {
            ingredients: {
              multiplier: 1.8,
              current: 1,
            },
          },
          craftCount: 0,
        },
        "Golden Ring Donut": {
          ingredients: {
            Dough: 4,
            Sugar: 3,
            Chocolate: 2,
          },
          production: 25,
          baseProduction: 25,
          image: "donut9.webp",
          description:
            "A perfectly glazed ring of gold! Speeds up logistics - increases Logistic Center production by 7%.",
          effects: {
            logisticCenter: {
              productionBonus: 0.07,
            },
          },
          scaling: {
            ingredients: {
              multiplier: 1.7,
              current: 1,
            },
          },
          craftCount: 0,
        },
        "Neon Surge Donut": {
          ingredients: {
            Dough: 5,
            Sugar: 4,
            Chocolate: 4,
          },
          production: 120,
          baseProduction: 120,
          image: "donut6.webp",
          description:
            "Electrifying flavor that supercharges generators! Increases Power Plant production by 6%.",
          effects: {
            powerPlant: {
              productionBonus: 0.06,
            },
          },
          scaling: {
            ingredients: {
              multiplier: 1.6,
              current: 1,
            },
          },
          craftCount: 0,
        },
        "Enchanted Forest Donut": {
          ingredients: {
            Dough: 6,
            Sugar: 5,
            Chocolate: 5,
          },
          production: 600,
          baseProduction: 600,
          image: "donut8.webp",
          description:
            "Infused with nature's essence! The forest grows stronger - increases Nature production by 5%.",
          effects: {
            nature: {
              productionBonus: 0.05,
            },
          },
          scaling: {
            ingredients: {
              multiplier: 1.5,
              current: 1,
            },
          },
          craftCount: 0,
        },
      };
      this.selectedRecipe = null;
      this.selectedRecipeName = null;
      this.ores = {
        Copper: { count: 0 },
        Iron: { count: 0 },
        Gold: { count: 0 },
        Diamond: { count: 0 },
      };
      this.oreTypes = [
        {
          type: "Copper",
          rarity: 0.7,
          price: this.items.mine.baseCost * 0.01,
          basePrice: this.items.mine.baseCost * 0.01,
          priceHistory: [],
          trend: 0,
          volatility: 0.02,
        },
        {
          type: "Iron",
          rarity: 0.2,
          price: this.items.mine.baseCost * 0.025,
          basePrice: this.items.mine.baseCost * 0.025,
          priceHistory: [],
          trend: 0,
          volatility: 0.035,
        },
        {
          type: "Gold",
          rarity: 0.075,
          price: this.items.mine.baseCost * 0.05,
          basePrice: this.items.mine.baseCost * 0.05,
          priceHistory: [],
          trend: 0,
          volatility: 0.05,
        },
        {
          type: "Diamond",
          rarity: 0.015,
          price: this.items.mine.baseCost * 0.1,
          basePrice: this.items.mine.baseCost * 0.1,
          priceHistory: [],
          trend: 0,
          volatility: 0.08,
        },
      ];
      this.workerProductionInterval = 60000; // 60 saniyelik genel üretim döngüsü
      this.workerCycleRemainingTime = this.workerProductionInterval; // Döngü süresi takibi için
      this.orePurchaseLimit = 10;
      this.oreMarket = null; // Frozen reference snapshot; optional in older saves.
      this.workers = []; // İşçi listesi
      this.isBuying = false; // Şu an alım mı yapılıyor
      this.isSelling = false; // Şu an satım mı yapılıyor
      this.setupMarketButtons();
      this.updateInterval = 250;
      this.donut = document.getElementById("donut");
      this.counter = document.getElementById("donut-count");
      this.perSecondDisplay = document.getElementById("per-second");
      this.setupModal();
      this.updateTotalPerSecond(); // Başlangıçta hesapla
      this.currentBakeryName = "";
      this.PRESTIGE_BASE_THRESHOLD = 550000000000;
      this.PRESTIGE_THRESHOLD_GROWTH = 2;
      this.prestigeCount = 0;
      this.nextPrestigeThreshold = this.calculatePrestigeThreshold(
        this.prestigeCount,
      );
      this.prestigeMultiplier = 2;
      this.setupPrestigeModal();

      this.updateDisplay();
      this.clickSounds.forEach((sound) => {
        sound.volume = 0.1;
      });
      this.questPagination = {
        itemsPerPage: 5,
        currentPage: 1,
        totalPages: 1,
      };

      // ========== YENİ QUEST SİSTEMİ ==========

      // Milestone tiers for each building (expanded)
      this.milestoneTiers = {
        cursor: [1, 10, 25, 50, 75, 100, 150, 200, 300, 400, 500],
        baker: [1, 10, 25, 50, 75, 100, 150, 200, 300],
        farm: [1, 5, 15, 35, 50, 75, 100, 150, 200],
        mine: [1, 3, 10, 25, 50, 75, 100, 150],
        factory: [1, 5, 15, 25, 50, 75, 100, 150],
        logisticCenter: [1, 3, 10, 25, 50, 75, 100],
        powerPlant: [1, 3, 10, 25, 50, 75, 100],
        nature: [1, 3, 10, 25, 50, 75, 100],
        neuralNetworkBakery: [1, 3, 10, 25, 50, 75],
        portal: [1, 3, 10, 25, 50, 75],
        capitalCrest: [1, 3, 10, 25, 50],
      };

      // Production milestones (less dense early-game pacing)
      this.productionMilestones = [
        250, 1000, 2500, 10000, 25000, 100000, 250000, 1000000, 5000000,
        10000000, 50000000, 100000000, 500000000, 1000000000, 10000000000,
        100000000000, 1000000000000, 10000000000000, 100000000000000,
        1000000000000000,
      ];

      // Click milestones (reduced early trivial steps)
      this.clickMilestones = [
        25, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000,
        250000, 500000, 1000000, 2500000, 5000000,
      ];

      // CPS milestones (less dense early progression)
      this.cpsMilestones = [
        1, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000,
        100000, 250000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000,
      ];

      // Total buildings milestones (new!)
      this.totalBuildingsMilestones = [
        5, 10, 25, 50, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000,
        3000, 5000,
      ];

      // Upgrade milestones (new!)
      this.upgradeMilestones = [1, 3, 5, 10, 15, 20, 30, 40, 50];

      // Quest completion milestones (meta-milestone, new!)
      this.questCompletionMilestones = [5, 10, 25, 50, 100, 200, 500, 1000];

      // Building milestone bonus rates by tier index.
      // These apply to INCREMENTAL spending between milestone tiers.
      this.tierRefundRates = [
        0.08, 0.075, 0.07, 0.065, 0.06, 0.055, 0.05, 0.045, 0.04, 0.035, 0.03,
      ];

      // Initialize milestone quests state
      this.milestoneQuests = this.initializeMilestoneQuests();

      // Dynamic quest slots (5 slots with varied difficulties)
      this.dynamicSlots = {
        slot1: {
          id: "slot1",
          difficulty: "easy",
          cooldown: 10 * 60 * 1000, // 10 minutes
          rewardMinutes: 5,
          questPool: ["click", "produce", "buyAny"],
          currentQuest: null,
          cooldownEnd: null,
        },
        slot2: {
          id: "slot2",
          difficulty: "easy",
          cooldown: 12 * 60 * 1000, // 12 minutes
          rewardMinutes: 6,
          questPool: ["produce", "click", "efficiency"],
          currentQuest: null,
          cooldownEnd: null,
        },
        slot3: {
          id: "slot3",
          difficulty: "medium",
          cooldown: 25 * 60 * 1000, // 25 minutes
          rewardMinutes: 15,
          questPool: ["produce", "buySpecific", "click", "combo"],
          currentQuest: null,
          cooldownEnd: null,
        },
        slot4: {
          id: "slot4",
          difficulty: "hard",
          cooldown: 50 * 60 * 1000, // 50 minutes
          rewardMinutes: 40,
          questPool: ["timedProduce", "buySpecific", "produce", "spending"],
          currentQuest: null,
          cooldownEnd: null,
        },
        slot5: {
          id: "slot5",
          difficulty: "special",
          cooldown: 90 * 60 * 1000, // 90 minutes
          rewardMinutes: 75,
          questPool: ["multiplier", "timedProduce", "combo", "spending"],
          currentQuest: null,
          cooldownEnd: null,
        },
      };

      // Recurring quest balance only; seconds describe work, not slot cooldowns.
      this.dynamicQuestBalance = {
        easy: {
          seconds: 60,
          baseClicks: 80,
          maxClicks: 120,
          maxPurchases: 3,
          bonusRate: 0.1,
          minCapSeconds: 3,
          maxCapSeconds: 15,
          purchaseCap: 0.1,
        },
        medium: {
          seconds: 180,
          baseClicks: 240,
          maxClicks: 360,
          maxPurchases: 5,
          bonusRate: 0.12,
          minCapSeconds: 9,
          maxCapSeconds: 45,
          purchaseCap: 0.15,
        },
        hard: {
          seconds: 360,
          baseClicks: 600,
          maxClicks: 800,
          maxPurchases: 8,
          bonusRate: 0.15,
          minCapSeconds: 18,
          maxCapSeconds: 90,
          purchaseCap: 0.2,
        },
        special: {
          seconds: 480,
          baseClicks: 720,
          maxClicks: 900,
          maxPurchases: 10,
          bonusRate: 0.15,
          minCapSeconds: 24,
          maxCapSeconds: 120,
          purchaseCap: 0.25,
        },
      };

      // Multiplier state (queue-based)
      this.multiplierState = {
        active: null, // { amount, endTime }
        queued: null, // { amount, duration }
      };

      // CPS history for stabilization (120s rolling)
      this.cpsHistory = [];

      // Quest tracking (run-based vs lifetime)
      this.questTracking = {
        currentRun: {
          spentAtTier: {}, // { buildingType: { tier: cumulativeSpent } }
          totalProduced: 0,
          totalSpent: 0, // Total donuts spent on buildings
          questsCompleted: 0, // Dynamic quests completed this run
        },
        lifetime: {
          totalClicks: 0,
        },
      };
      this.questUIRefreshInterval = 1000;
      this._lastQuestUIRefresh = 0;
      this.questUILiveUpdateInterval = 200;
      this._lastQuestUILiveUpdate = 0;
      this.isHoveringQuestMenu = false;

      // Legacy quests object for backward compatibility during migration
      this.quests = {};
      this.isMobile = window.innerWidth <= 768;
      // Quest sistemini başlat
      this.setupQuestSystem();
      this.setupMobileMenus();
      // Quest menüsünün başlangıç durumu
      this.questsMenu = document.getElementById("quests-menu");
      this.questsMenu.classList.add("hidden");

      // Multiplier sistemi için gerekli özellikler
      this.activeMultipliers = []; // Array'i burada tanımla
      this.productionMultiplier = 1;

      this.autoBuyer = {
        enabled: false,
        settings: {},
      };

      // Her item için auto-buyer ayarlarını oluştur
      for (let key in this.items) {
        this.autoBuyer.settings[key] = {
          enabled: false,
          threshold: 1.5,
        };
      }

      this.lastFrameTime = 0;
      this.frameThrottle = this.isMobile ? 1000 / 45 : 1000 / 60;
      this.accumulatedTime = 0;
      this.heavyUpdateInterval = this.isMobile ? 180 : 120;
      this.hudUpdateInterval = this.isMobile ? 250 : 200;
      this.lastHudUpdateTime = 0;
      this.lastOrchestrationTime = 0;
      this.slowUiUpdateInterval = this.isMobile ? 220 : 150;
      this.farmUiUpdateInterval = this.isMobile ? 350 : 250;
      this.activeFarmUiUpdateInterval = this.isMobile ? 180 : 120;
      this.timerUiUpdateInterval = 100;
      this.lastHeavyUpdateTime = 0;
      this.lastSlowUiUpdateTime = 0;
      this.lastFarmUiUpdateTime = 0;
      this.lastTimerUiUpdateTime = 0;
      this.lastCounterUiUpdateTime = 0;
      this.preciseCounterUpdateInterval = this.isMobile ? 180 : 120;
      this.gameLoopHandle = null;

      // Quest menüsü için cache
      this._questCache = {
        lastUpdate: 0,
        updateInterval: 250, // 250ms'de bir güncelle
        elements: new Map(),
        pendingUpdates: new Set(),
      };

      // Quest menüsü için Intersection Observer
      this.questObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.style.visibility = "visible";
            } else {
              entry.target.style.visibility = "hidden";
            }
          });
        },
        {
          root: document.querySelector(".quests-container"),
          rootMargin: "20px",
          threshold: 0.1,
        },
      );

      // Basit quest cache
      this.questCache = {
        lastUpdate: 0,
        updateInterval: 250,
      };

      // Constructor içine eklenecek
      this.lastMineProduction = Date.now();
      this.lastBakerProduction = Date.now();
      this.mineTimer = document.getElementById("mine-timer");
      this.bakerTimer = document.getElementById("baker-timer");

      // Resim önbellekleme için yeni özellik
      this.imageCache = new Map();
      this.preloadedImages = new Set();

      this.comboActive = false;
      this.comboMultiplier = 1.1; // %10 bonus
      this.comboTimeout = null;
      this.comboDonutImages = [
        "donut.webp",
        "donut6.webp",
        "donut7.webp",
        "donut8.webp",
        "donut5.webp",
      ];
      this.fallingDonutInterval = null;
      this.lastClickSuccess = false;

      this.autoCatcherConfig = {
        enabled: false,
        chance: 0.2,
        minCatchDelay: 100,
        maxCatchDelay: 500,
        catchQueue: new Set(), // Yakalanacak donutları takip et
        processingInterval: null,
      };

      // DonutCoin sistemi için yeni özellikler
      this.donutCoin = {
        count: 0,
        lastClaimTime: 0,
        claimInterval: 24 * 60 * 60 * 1000, // 24 saat
      };

      // Offline Production Settings
      this.lastActiveTime = Date.now();
      this.OFFLINE_EFFICIENCY = 0.25; // %25 verimlilik
      this.MAX_OFFLINE_TIME = 12 * 60 * 60 * 1000; // 12 saat limit

      // Performance Optimization Variables
      this.domCache = new Map();
      this.lastUpdateValues = {
        donutCount: -1,
        totalPerSecond: -1,
        purchaseAmount: -1,
        affordability: {},
        buildingCounts: {},
        multiplierCount: -1,
      };
      this.renderFrameCount = 0;
      this.activeAnimationElements = 0;
      this.MAX_ANIMATION_ELEMENTS = 40; // Don't allow more than 40 animation nodes at once
      this.timeState = this.createTimeState(Date.now());
      this._timeMonotonic = performance.now();
      this._settlingTime = false;
    }

    // Resim önbellekleme sistemi
    preloadImages() {
      const imagesToPreload = [
        // Donut görselleri
        "donutNew.webp",
        "donutPixelArt.webp",
        "donutMoney.webp",
        "donutCoin.webp",

        // Upgrade görselleri
        ...this.upgrades.cursor.map((u) => u.img),
        ...this.upgrades.baker.map((u) => u.img),
        ...this.upgrades.farm.map((u) => u.img),
        ...this.upgrades.mine.map((u) => u.img),
        ...this.upgrades.factory.map((u) => u.img),
        ...this.upgrades.logisticCenter.map((u) => u.img),
        ...this.upgrades.powerPlant.map((u) => u.img),
        ...this.upgrades.nature.map((u) => u.img),
        ...this.upgrades.nonItemUpgrades.map((u) => u.img),
        ...this.upgrades.donutUpgrades.map((u) => u.img),

        // Bina görselleri
        "cursor.webp",
        "baker.webp",
        "farm.webp",
        "mine.webp",
        "factory.webp",
        "logisticCenter.webp",
        "powerPlant.webp",
        "nature.webp",

        // Malzeme görselleri
        "dough.webp",
        "sugar.webp",
        "chocolate.webp",

        // Maden görselleri
        "copper.webp",
        "iron.webp",
        "gold.webp",
        "diamond.webp",
      ];

      // Her resmi önbelleğe al
      imagesToPreload.forEach((imagePath) => {
        if (!this.preloadedImages.has(imagePath)) {
          const img = new Image();
          img.src = `img/${imagePath}`;
          this.imageCache.set(imagePath, img);
          this.preloadedImages.add(imagePath);
        }
      });
    }

    scheduleDeferredImagePreload() {
      const queuePreload = () => {
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(() => this.preloadImages(), {
            timeout: 2000,
          });
          return;
        }

        setTimeout(() => this.preloadImages(), 1500);
      };

      if (document.readyState === "complete") {
        queuePreload();
        return;
      }

      window.addEventListener("load", queuePreload, { once: true });
    }

    init() {
      // DOM Elemanlarını önbelleğe al
      this.cacheElements();

      // Kritik ekran ilk boyansın, toplu görsel preload'u sonra başlat.
      this.scheduleDeferredImagePreload();
      this.initializeComboSystem();
      this.loadGame();
      this.updateBakeryName();
      this.setupDonutCoin();
      this.setupSaveLifecycle();

      // Zamanlayıcıları optimize et
      setInterval(this._throttle(this.saveGame.bind(this), 60000), 180000);
      this.startPresentationPolling();
      this.startGameLoop();

      // Event listener'ları optimize et
      this.handleDonutClickBound = this._throttle(
        this.handleDonutClick.bind(this),
        50,
      );
      this.donut.addEventListener("click", this.handleDonutClickBound);

      // Store item hover olayını optimize et
      document.querySelectorAll(".store-item").forEach((storeItem) => {
        const itemKey = storeItem.getAttribute("data-item");
        const showItemInfoThrottled = this._throttle(
          () => this.showItemInfo(itemKey),
          100,
        );

        storeItem.addEventListener("mouseenter", showItemInfoThrottled);

        storeItem.addEventListener(
          "click",
          this._throttle((event) => {
            if (
              event.target.closest(".item-img img.active-mine-effect") ||
              event.target.closest(".item-img img.active-baker-effect") ||
              event.target.closest(".item-img img.active-farm-effect")
            ) {
              return;
            }
            this.buyItem(itemKey);
          }, 100),
        );
      });
      document
        .querySelectorAll(".purchase-options button")
        .forEach((button) => {
          button.addEventListener("click", () => {
            const amount = parseInt(button.getAttribute("data-amount"));
            this.setPurchaseAmount(amount);
          });
        });
      // Bakery name element click and modal button events
      const bakeryNameElement = document.getElementById("bakery-name");
      if (bakeryNameElement) {
        bakeryNameElement.addEventListener(
          "click",
          this.openChangeNameModal.bind(this),
        );
      }
      const confirmButton = document.getElementById("confirmButton");
      const cancelButton = document.getElementById("cancelButton");
      const closeChangeNameButton = document.getElementById("changeNameClose");
      const changeNameModal = document.getElementById("changeNameModal");
      const newBakeryNameInput = document.getElementById("newBakeryName");

      if (confirmButton) {
        confirmButton.addEventListener(
          "click",
          this.changeBakeryName.bind(this),
        );
      }
      if (cancelButton) {
        cancelButton.addEventListener(
          "click",
          this.closeChangeNameModal.bind(this),
        );
      }
      if (closeChangeNameButton) {
        closeChangeNameButton.addEventListener(
          "click",
          this.closeChangeNameModal.bind(this),
        );
      }
      if (changeNameModal) {
        changeNameModal.addEventListener("click", (event) => {
          if (event.target === changeNameModal) {
            this.closeChangeNameModal();
          }
        });
      }
      if (newBakeryNameInput) {
        newBakeryNameInput.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            this.changeBakeryName();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            this.closeChangeNameModal();
          }
        });
      }

      // Other setups
      this.setupInfoMenu();
      this.setupStatsMenu();
      this.setupSettingsMenu();
      this.setupGuidesMenu();
      this.setupFeedbackPopup();

      this.setupAutoBuyer();

      // Store görünürlüğünü hemen ayarla (RAF beklemeden)
      this.updateStoreVisibility();
    }

    startGameLoop() {
      if (this.gameLoopHandle || !this.canPresent()) return;

      const loop = (timestamp) => {
        if (!this.canPresent()) {
          this.gameLoopHandle = null;
          return;
        }
        if (!this.lastFrameTime) {
          this.lastFrameTime = timestamp;
        }

        const frameDelta = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        this.accumulatedTime += frameDelta;

        if (this.accumulatedTime >= this.frameThrottle) {
          this.accumulatedTime %= this.frameThrottle;
          const now = Date.now();
          // Keep the existing heavy-work/auto-buyer opportunities on eligible
          // frames. Intervening frames do not need an economic settlement.
          if (
            now - this.lastHeavyUpdateTime >= this.heavyUpdateInterval ||
            (now < this.lastHeavyUpdateTime &&
              timestamp - this.lastOrchestrationTime >=
                this.heavyUpdateInterval)
          ) {
            this.lastOrchestrationTime = timestamp;
            this.updateProduction(now);
          } else {
            this.updateProductionDisplays(now);
          }
          this.flushDisplay();
        }

        this.gameLoopHandle = requestAnimationFrame(loop);
      };

      this.gameLoopHandle = requestAnimationFrame(loop);
    }

    cacheElements() {
      this.domCache.set("counter", document.getElementById("donut-count"));
      this.domCache.set(
        "perSecondDisplay",
        document.getElementById("per-second"),
      );
      this.domCache.set("mineTimer", document.getElementById("mine-timer"));
      this.domCache.set("bakerTimer", document.getElementById("baker-timer"));
      this.domCache.set("upgradeList", document.getElementById("upgrade-list"));

      // Cache building elements
      for (let key in this.items) {
        const storeItem = document.querySelector(
          `.store-item[data-item="${key}"]`,
        );
        if (storeItem) {
          this.domCache.set(`${key}StoreItem`, storeItem);
          this.domCache.set(
            `${key}Cost`,
            document.getElementById(`${key}Cost`),
          );
          this.domCache.set(
            `${key}Total`,
            document.getElementById(`total${this.capitalize(key)}s`),
          );
          this.domCache.set(
            `${key}Image`,
            storeItem.querySelector(".item-img img"),
          );
          this.domCache.set(
            `${key}ItemImgContainer`,
            storeItem.querySelector(".item-img"),
          );
        }
      }
    }

    updateStoreVisibility() {
      if (!this.canPresent()) return;
      const buildingOrder = [
        "cursor",
        "baker",
        "farm",
        "mine",
        "factory",
        "logisticCenter",
        "powerPlant",
        "nature",
        "neuralNetworkBakery",
        "portal",
        "capitalCrest",
      ];

      let mysterySlots = 0;
      const maxMysterySlots = 2;

      buildingOrder.forEach((key, index) => {
        const storeItem = this.domCache.get(`${key}StoreItem`);
        if (!storeItem) return;

        // 1. Kural: İlk 1 bina (Cursor) her zaman açıktır.
        if (index < 1) {
          if (
            storeItem.classList.contains("is-hidden") ||
            storeItem.classList.contains("is-mystery")
          ) {
            storeItem.classList.remove("is-hidden", "is-mystery");
          }
          return;
        }

        const itemData = this.items[key];
        // Unlock koşulu: Binadan en az 1 tane varsa VEYA Toplam Kazanılan Donut >= Şimdiki Fiyatın %75'i
        const isUnlocked =
          itemData.count > 0 ||
          this.totalDonutsEarned >= itemData.baseCost * 0.75;

        if (isUnlocked) {
          // Durum: Açık (Revealed)
          if (
            storeItem.classList.contains("is-hidden") ||
            storeItem.classList.contains("is-mystery")
          ) {
            storeItem.classList.remove("is-hidden", "is-mystery");
          }

          // Panel efekti ekle (Mine, Baker, Farm)
          if (itemData.count > 0) {
            const img = storeItem.querySelector(".item-img img");
            if (img) {
              if (key === "mine") img.classList.add("active-mine-effect");
              if (key === "baker") img.classList.add("active-baker-effect");
              if (key === "farm") img.classList.add("active-farm-effect");
            }
          }
        } else {
          // Durum: Kapalı, peki Gizemli mi Gizli mi?
          if (mysterySlots < maxMysterySlots) {
            // Durum: Gizemli (Mystery - ???)
            if (
              storeItem.classList.contains("is-hidden") ||
              !storeItem.classList.contains("is-mystery")
            ) {
              storeItem.classList.remove("is-hidden");
              storeItem.classList.add("is-mystery");
            }
            mysterySlots++;
          } else {
            // Durum: Tamamen Gizli (Hidden)
            if (
              !storeItem.classList.contains("is-hidden") ||
              storeItem.classList.contains("is-mystery")
            ) {
              storeItem.classList.remove("is-mystery");
              storeItem.classList.add("is-hidden");
            }
          }
        }
      });
    }

    updateDisplay(immediate = true) {
      this._hudDirty = true;
      if (!this.canPresent() || !immediate) return;
      this._hudImmediate = true;
      // Actions retain next-frame feedback, independent of the passive budget.
      if (!this._displayUpdateScheduled) {
        this._displayUpdateScheduled = true;
        this._displayUpdateHandle = requestAnimationFrame(() => {
          this._displayUpdateHandle = null;
          this._displayUpdateScheduled = false;
          this.flushDisplay();
        });
      }
    }

    flushDisplay() {
      if (!this.canPresent() || !this._hudDirty) return;
      const now = performance.now();
      if (
        !this._hudImmediate &&
        now - this.lastHudUpdateTime < this.hudUpdateInterval
      )
        return;
      this._hudDirty = false;
      this._hudImmediate = false;
      this.lastHudUpdateTime = now;
      this._actualUpdateDisplay();
    }
    _actualUpdateDisplay() {
      if (!this.canPresent()) return;
      return this.withProductionSnapshot(() => {
        this.renderFrameCount++;
        const now = performance.now();
        const isSlowFrame =
          now - this.lastSlowUiUpdateTime >= this.slowUiUpdateInterval;

        if (isSlowFrame) {
          this.lastSlowUiUpdateTime = now;
        }

        if (isSlowFrame) {
          this.updateStoreVisibility();
        }

        const counter = this.domCache.get("counter");
        const perSecondDisplay = this.domCache.get("perSecondDisplay");
        if (!counter || !perSecondDisplay) return;

        // Donut sayısı güncelleme (sadece değiştiyse)
        const currentDonutCount = Math.floor(this.donutCount);
        const shouldUpdateCounter =
          this.lastUpdateValues.donutCount !== currentDonutCount;

        if (shouldUpdateCounter) {
          const formattedDonuts = this.formatNumber(currentDonutCount, "count");
          counter.textContent = `${formattedDonuts} donuts`;
          this.lastUpdateValues.donutCount = currentDonutCount;
          this.lastCounterUiUpdateTime = now;
        }

        // Per second güncelleme
        const currentPerSecond = Math.floor(this.totalPerSecond * 10) / 10;
        const economicTime = Date.now();
        const legacyBuffs = this.activeMultipliers.filter(
          (m) => m.endTime > economicTime,
        );
        const multiplierCount = legacyBuffs.length;
        const hasQuestMultiplier =
          this.multiplierState?.active?.endTime > economicTime;

        if (
          this.lastUpdateValues.totalPerSecond !== currentPerSecond ||
          this.lastUpdateValues.multiplierCount !== multiplierCount ||
          this.lastUpdateValues.hasQuestMultiplier !== hasQuestMultiplier ||
          isSlowFrame
        ) {
          const formattedPerSecond = this.formatNumber(
            this.totalPerSecond,
            "perSecond",
          );

          // Check both legacy activeMultipliers AND new quest multiplier system
          const hasActiveMultiplier = multiplierCount > 0 || hasQuestMultiplier;
          const effectiveMultiplier =
            this.getProductionModifiers().temporaryMultiplier;

          if (effectiveMultiplier > 1 && hasActiveMultiplier) {
            // Determine which multiplier to show (prefer quest multiplier)
            let displayEndTime, displayAmount, displayDuration;

            if (hasQuestMultiplier && this.multiplierState.active) {
              displayEndTime = this.multiplierState.active.endTime;
              displayAmount = this.multiplierState.active.amount;
              // Calculate duration from start (estimate ~90s max)
              displayDuration = 90000;
            } else if (legacyBuffs.length > 0) {
              displayEndTime = Math.min(...legacyBuffs.map((m) => m.endTime));
              displayAmount = legacyBuffs[0].amount;
              displayDuration = legacyBuffs[0].duration;
            }

            if (displayEndTime && displayEndTime > Date.now()) {
              const remainingTime = Math.max(
                0,
                Math.ceil((displayEndTime - Date.now()) / 1000),
              );
              const progress = (remainingTime / (displayDuration / 1000)) * 100;

              // Show queued indicator if there's a queued multiplier
              const queuedIndicator = this.multiplierState?.queued
                ? `<span class="boost-queued">+1 queued</span>`
                : "";

              perSecondDisplay.innerHTML = `
            <div class="boosted-per-second">
                <div class="per-second-text">per second: ${formattedPerSecond}</div>
                <div class="boost-container">
                    <div class="boost-info">
                        <span class="boost-multiplier">${effectiveMultiplier.toFixed(2)}x</span>
                        <span class="boost-timer">${remainingTime}s</span>
                        ${queuedIndicator}
                    </div>
                    <div class="boost-progress-bar">
                        <div class="boost-progress" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>
          `;
              perSecondDisplay.classList.add("boosted");
            } else {
              // Multiplier expired
              perSecondDisplay.textContent = `per second: ${formattedPerSecond}`;
              perSecondDisplay.classList.remove("boosted");
            }
          } else {
            perSecondDisplay.textContent = `per second: ${formattedPerSecond}`;
            perSecondDisplay.classList.remove("boosted");
          }

          this.lastUpdateValues.totalPerSecond = currentPerSecond;
          this.lastUpdateValues.multiplierCount = multiplierCount;
          this.lastUpdateValues.hasQuestMultiplier = hasQuestMultiplier;
        }

        // Building güncellemeleri
        for (let key in this.items) {
          const item = this.items[key];
          const bulkCost = this.getBulkPricePreview(key, this.purchaseAmount);
          const isAffordable = this.donutCount >= bulkCost;

          // Affordability veya purchase amount değiştiyse güncelle
          if (
            this.lastUpdateValues.affordability[key] !== isAffordable ||
            this.lastUpdateValues.purchaseAmount !== this.purchaseAmount ||
            isSlowFrame
          ) {
            const costElem = this.domCache.get(`${key}Cost`);
            const storeItem = this.domCache.get(`${key}StoreItem`);
            const imgContainer = this.domCache.get(`${key}ItemImgContainer`);

            if (costElem) {
              costElem.textContent = this.formatNumber(bulkCost, "cost");
              costElem.style.color = isAffordable ? "#6f6" : "red";

              if (storeItem) {
                storeItem.classList.toggle("insufficient-funds", !isAffordable);
              }

              // Alım miktarı göstergesi
              if (imgContainer) {
                let amountDisplay =
                  imgContainer.querySelector(".purchase-amount");
                if (this.purchaseAmount > 1) {
                  if (!amountDisplay) {
                    amountDisplay = document.createElement("span");
                    amountDisplay.className = "purchase-amount";
                    imgContainer.appendChild(amountDisplay);
                  }
                  amountDisplay.textContent = `x${this.purchaseAmount}`;
                } else if (amountDisplay) {
                  amountDisplay.remove();
                }
              }
            }
            this.lastUpdateValues.affordability[key] = isAffordable;
          }

          // Bina sayısı güncelleme (sadece değiştiyse)
          if (this.lastUpdateValues.buildingCounts[key] !== item.count) {
            const totalElem = this.domCache.get(`${key}Total`);
            if (totalElem) {
              totalElem.textContent = this.formatNumber(item.count, "count");
            }

            // Mine/Baker efektleri
            if (key === "mine" || key === "baker") {
              const img = this.domCache.get(`${key}Image`);
              if (img) {
                img.classList.toggle(`active-${key}-effect`, item.count >= 1);
              }
            }
            this.lastUpdateValues.buildingCounts[key] = item.count;
          }
        }

        if (isSlowFrame) {
          this.showUpgrades();
          this.updateActiveMultiplierDisplay();
        }

        this.lastUpdateValues.purchaseAmount = this.purchaseAmount;
        this.lastUpdateValues.balance = this.donutCount;
        this.lastUpdateValues.earned = this.totalDonutsEarned;
      }, this.getGameTime());
    }
    // Derived snapshots, never accumulated multiplications. No DOM or timer mutations.
    economicNumber(value, fallback = 0) {
      return typeof value === "number" && Number.isFinite(value) && value >= 0
        ? value
        : fallback;
    }

    economicFactor(value) {
      const factor = this.economicNumber(value, 1);
      return factor > 0 ? factor : 1;
    }

    getBuildingUpgradeMultiplier(key) {
      return (this.upgrades[key] || []).reduce(
        (factor, upgrade) =>
          upgrade?.purchased && !upgrade.specialEffect
            ? factor * this.economicFactor(upgrade.multiplier)
            : factor,
        1,
      );
    }

    getProductionModifiers(now = this.getProductionQueryTime()) {
      const active = this.multiplierState?.active;
      const questMultiplier =
        active && Number.isFinite(active.endTime) && active.endTime > now
          ? this.economicFactor(active.amount)
          : 1;
      let legacyMultiplier = 1;
      let skippedMirror = false;
      for (const buff of this.activeMultipliers || []) {
        if (!buff || !Number.isFinite(buff.endTime) || buff.endTime <= now)
          continue;
        // Old activateMultiplier wrote the same reward to both representations.
        // Its consecutive Date.now() calls could differ slightly. Ignore ONE mirror,
        // retaining independent legacy buffs (including additional identical ones).
        const mirror =
          !skippedMirror &&
          active &&
          active.endTime > now &&
          buff.amount === active.amount &&
          Math.abs(buff.endTime - active.endTime) <= 100;
        if (mirror) {
          skippedMirror = true;
          continue;
        }
        legacyMultiplier *= this.economicFactor(buff.amount);
      }
      const prestigeMultiplier = Math.pow(
        this.economicFactor(this.prestigeMultiplier),
        this.economicNumber(this.prestigeCount),
      );
      const globalUpgradeMultiplier =
        this.getDonutUpgradeProductionMultiplier();
      const masteryMultiplier = this.farmState?.mastery?.level >= 20 ? 1.05 : 1;
      const temporaryMultiplier = questMultiplier * legacyMultiplier;
      return {
        prestigeMultiplier,
        globalUpgradeMultiplier,
        masteryMultiplier,
        questMultiplier,
        legacyMultiplier,
        temporaryMultiplier,
      };
    }

    // Scopes are synchronous and disposable; no snapshot survives a pass.
    withProductionSnapshot(calculate, queryTime = null) {
      if (this.productionSnapshotContext) return calculate();
      this.productionSnapshotContext = {
        queryTime,
        now: undefined,
        version: -1,
        snapshot: null,
      };
      try {
        return calculate();
      } finally {
        this.productionSnapshotContext = null;
      }
    }

    invalidateProductionSnapshot() {
      this.productionStateVersion++;
      if (this.productionSnapshotContext) {
        this.productionSnapshotContext.snapshot = null;
        this.productionSnapshotContext.queryTime = null;
      }
    }

    // Also useful for development probes; this never changes gameplay truth.
    invalidateDerivedCaches() {
      this.invalidateProductionSnapshot();
      this.bulkPriceCache.clear();
    }

    getProductionQueryTime() {
      // Read-only render passes evaluate at one explicit instant. Mutation guards
      // release that instant; economic simulation always supplies its own time.
      return (
        this._simulationNow ??
        this.productionSnapshotContext?.queryTime ??
        this.getGameTime()
      );
    }

    getProductionBreakdown(now = this.getProductionQueryTime()) {
      const context = this.productionSnapshotContext;
      if (
        context?.snapshot &&
        context.now === now &&
        context.version === this.productionStateVersion
      ) {
        return context.snapshot;
      }
      const snapshot = this.calculateProductionBreakdown(now);
      if (context) {
        context.now = now;
        context.version = this.productionStateVersion;
        context.snapshot = snapshot;
      }
      return snapshot;
    }

    calculateProductionBreakdown(now = this.getProductionQueryTime()) {
      const modifiers = this.getProductionModifiers(now);
      const globalMultiplier =
        modifiers.globalUpgradeMultiplier * modifiers.masteryMultiplier;
      const boostedMultiplier =
        globalMultiplier *
        modifiers.prestigeMultiplier *
        modifiers.temporaryMultiplier;
      const buildings = {};
      let baseCPS = 0;
      let localCPS = 0;
      let boostedCPS = 0;
      let flatCPS = 0;
      let nonCursorCount = 0;
      for (const [key, item] of Object.entries(this.items)) {
        if (key !== "cursor") nonCursorCount += this.economicNumber(item.count);
      }
      const dynamicClickBonus = this.upgrades.cursor.some(
        (u) => u?.purchased && u.specialEffect === "dynamicBoost",
      )
        ? nonCursorCount * 0.1
        : 0;
      for (const [key, item] of Object.entries(this.items)) {
        const count = this.economicNumber(item.count);
        const baseRate = this.economicNumber(this.baseItemProductions[key]);
        const upgradeMultiplier = this.getBuildingUpgradeMultiplier(key);
        // Recipe percentages add locally, then multiply the upgraded building rate.
        const recipeBonus = this.getRecipeProductionBonusForBuilding(key);
        const localRate = baseRate * upgradeMultiplier * (1 + recipeBonus);
        const boostedRate = localRate === 0 ? 0 : localRate * boostedMultiplier;
        // Donut Cursor's explicit flat exception is never boosted, even by prestige.
        const flatRate = key === "cursor" ? dynamicClickBonus : 0;
        const perUnit = boostedRate + flatRate;
        const effectiveCPS = count === 0 ? 0 : count * perUnit;
        buildings[key] = {
          count,
          baseRate,
          upgradeMultiplier,
          recipeBonus,
          localRate,
          boostedRate,
          flatRate,
          perUnit,
          effectiveCPS,
        };
        baseCPS += count * baseRate;
        localCPS += count * localRate;
        boostedCPS += count === 0 ? 0 : count * boostedRate;
        flatCPS += count * flatRate;
      }
      const effectiveCPS = boostedCPS + flatCPS;
      const valid = Number.isFinite(effectiveCPS) && effectiveCPS >= 0;
      // No late-game cap. Unrepresentable arithmetic must not poison balances/saves.
      return {
        ...modifiers,
        globalMultiplier,
        buildings,
        baseCPS,
        localCPS,
        boostedCPS,
        flatCPS,
        dynamicClickBonus,
        valid,
        effectiveCPS: valid ? effectiveCPS : 0,
      };
    }

    get totalPerSecond() {
      return this.calculatePerSecond();
    }

    updateTotalPerSecond() {
      const breakdown = this.getProductionBreakdown();
      const outputs = {};
      // Compatibility/display mirrors only; economic calculations never read these.
      for (const [key, building] of Object.entries(breakdown.buildings)) {
        this.items[key].originalProduction =
          building.baseRate *
          building.upgradeMultiplier *
          breakdown.prestigeMultiplier;
        this.items[key].production = building.perUnit;
        outputs[key] = building.effectiveCPS;
      }
      this.productionMultiplier = breakdown.temporaryMultiplier;
      return outputs;
    }

    creditDonuts(amount, countsAsEarned = true) {
      const balance = this.donutCount + amount;
      const earned = this.totalDonutsEarned + (countsAsEarned ? amount : 0);
      if (
        !Number.isFinite(amount) ||
        amount < 0 ||
        !Number.isFinite(balance) ||
        !Number.isFinite(earned)
      ) {
        if (!this._numericWarningShown) {
          this._numericWarningShown = true;
          this.showNotification(
            "Income could not be calculated safely. Your existing balance has been kept.",
          );
        }
        return false;
      }
      this.donutCount = balance;
      this.totalDonutsEarned = earned;
      return true;
    }
    createTimeState(now) {
      return {
        settledAt: now,
        inactive: document.visibilityState === "hidden",
        inactiveElapsed: 0,
        mineProgress: 0,
        bakerProgress: 0,
        randomState: Math.floor(Math.random() * 0xffffffff) >>> 0 || 1,
      };
    }

    getGameTime() {
      return (
        this._simulationNow ??
        Math.max(Date.now(), this.timeState?.settledAt || 0)
      );
    }

    settleBeforeMutation() {
      if (!this._settlingTime && !this._questStateLoading) this.settleTime();
      // Old elapsed is settled first. Query guards also invalidate conservatively.
      this.invalidateProductionSnapshot();
    }

    timeRandom() {
      if (!this._settlingTime && this._boardRandomState === undefined)
        return Math.random();
      let state = this._boardRandomState ?? this.timeState.randomState;
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      if (this._boardRandomState !== undefined) this._boardRandomState = state;
      else this.timeState.randomState = state;
      return state / 0x100000000;
    }

    // The sole elapsed-time owner. Active elapsed uses a monotonic clock;
    // persisted/inactive elapsed uses a non-regressing wall checkpoint.
    settleTime(wallNow = Date.now(), forcedSeconds = null) {
      return this.withProductionSnapshot(() => {
        if (this._settlingTime || this._questStateLoading || !this.timeState)
          return 0;
        const state = this.timeState;
        const monotonic = performance.now();
        const activeElapsed = Math.max(0, monotonic - this._timeMonotonic);
        const wallElapsed = Math.max(0, wallNow - state.settledAt);
        const elapsed =
          forcedSeconds !== null
            ? this.economicNumber(forcedSeconds) * 1000
            : state.inactive
              ? wallElapsed
              : Math.max(activeElapsed, wallElapsed);
        const activeSpeed =
          forcedSeconds !== null || elapsed === 0 ? 1 : activeElapsed / elapsed;
        this._timeMonotonic = monotonic;
        const start = state.settledAt;
        const end = start + elapsed;
        if (!Number.isFinite(end)) return 0;
        const before = this.donutCount;
        this._settlingTime = true;
        try {
          let cursor = start;
          this._simulationNow = cursor;
          this.updateQuestMultipliers(cursor);
          if (elapsed > 0) this.tickFarm(0, 0, cursor);
          while (cursor < end) {
            this._simulationNow = cursor;
            const eligible = state.inactive
              ? Math.max(0, this.MAX_OFFLINE_TIME - state.inactiveElapsed)
              : Infinity;
            const speed = !state.inactive
              ? activeSpeed
              : eligible > 0
                ? this.OFFLINE_EFFICIENCY
                : 0;
            const production = this.getProductionBreakdown(cursor);
            let next = Math.min(
              end,
              eligible > 0 ? cursor + eligible : Infinity,
            );
            const boundary = (at) => {
              if (Number.isFinite(at) && at > cursor) next = Math.min(next, at);
            };
            for (const buff of [
              this.multiplierState.active,
              ...this.activeMultipliers,
            ])
              if (buff) boundary(buff.endTime);
            for (const buff of Object.values(this.farmState.buffs))
              if (buff?.remaining > 0) boundary(cursor + buff.remaining * 1000);
            if (
              this.getFarmCount() >= 5 &&
              (speed > 0 ||
                this.farmState.breeding.slots.some((slot) => slot.active) ||
                Object.values(this.farmState.buffs).some(
                  (buff) => buff?.remaining > 0,
                ))
            )
              boundary(this.farmState.contracts.lastRefresh + 600000);
            if (speed > 0) {
              boundary(
                cursor +
                  (this.workerProductionInterval - state.mineProgress) / speed,
              );
              boundary(
                cursor +
                  (this.bakerProductionInterval - state.bakerProgress) / speed,
              );
              this.addFarmTimeBoundaries(
                cursor,
                speed,
                production.effectiveCPS,
                boundary,
              );
              for (const slot of Object.values(this.dynamicSlots)) {
                const q = slot.currentQuest;
                if (!q || q.completed) continue;
                if (q.type === "timedProduce")
                  boundary(q.timedStartTime + q.timeLimit);
                const target = [
                  "produce",
                  "timedProduce",
                  "multiplier",
                ].includes(q.type)
                  ? q.target
                  : q.type === "combo"
                    ? q.produceTarget
                    : null;
                const left =
                  target === null
                    ? 0
                    : target -
                      Math.max(0, this.totalDonutsEarned - q.startProduction);
                if (left > 0 && production.effectiveCPS > 0)
                  boundary(
                    cursor + (left / (production.effectiveCPS * speed)) * 1000,
                  );
              }
              for (const q of Object.values(this.milestoneQuests.production)) {
                if (
                  !q.completed &&
                  q.target > this.totalDonutsEarned &&
                  production.effectiveCPS > 0
                )
                  boundary(
                    cursor +
                      ((q.target - this.totalDonutsEarned) /
                        (production.effectiveCPS * speed)) *
                        1000,
                  );
              }
            }
            for (const slot of this.farmState.breeding.slots)
              if (slot.active)
                boundary(
                  cursor + Math.max(0, slot.duration - slot.progress) * 1000,
                );
            const seconds = (next - cursor) / 1000;
            const economicSeconds = seconds * speed;
            if (
              production.valid &&
              this.creditDonuts(production.effectiveCPS * economicSeconds)
            ) {
              for (const [key, building] of Object.entries(
                production.buildings,
              )) {
                const total =
                  this.economicNumber(this.items[key].totalProduced) +
                  building.effectiveCPS * economicSeconds;
                if (Number.isFinite(total))
                  this.items[key].totalProduced = total;
              }
            }
            this.tickFarm(economicSeconds, seconds, next);
            state.mineProgress += economicSeconds * 1000;
            state.bakerProgress += economicSeconds * 1000;
            this._simulationNow = next;
            if (state.mineProgress >= this.workerProductionInterval - 0.001) {
              state.mineProgress = Math.max(
                0,
                state.mineProgress - this.workerProductionInterval,
              );
              this.produceMineResources(() => this.timeRandom());
              this.updateMarketPrices(() => this.timeRandom());
            }
            if (state.bakerProgress >= this.bakerProductionInterval - 0.001) {
              state.bakerProgress = Math.max(
                0,
                state.bakerProgress - this.bakerProductionInterval,
              );
              this.produceBakerResources(() => this.timeRandom());
            }
            if (state.inactive)
              state.inactiveElapsed = Math.min(
                this.MAX_OFFLINE_TIME,
                state.inactiveElapsed + next - cursor,
              );
            cursor = next;
            state.settledAt = cursor;
            // Epoch timestamps have coarser precision than small elapsed deltas.
            // Pass only that rounding envelope to production-goal comparisons.
            const productionTolerance =
              (production.effectiveCPS *
                speed *
                Number.EPSILON *
                Math.max(1, next)) /
              1000;
            this.checkDynamicQuestProgress(productionTolerance);
            this.checkMilestoneProgress(productionTolerance);
            this.updateQuestMultipliers(cursor);
          }
          // Forward clock adjustments do not manufacture active income. Backward
          // adjustments cannot move this checkpoint back or replay an interval.
          state.settledAt = Math.max(state.settledAt, wallNow);
          this.lastUpdateTime = state.settledAt;
          this.lastActiveTime = state.settledAt;
          this.lastMineProduction = state.settledAt - state.mineProgress;
          this.lastBakerProduction = state.settledAt - state.bakerProgress;
        } finally {
          this._simulationNow = undefined;
          this._settlingTime = false;
        }
        return this.donutCount - before;
      });
    }

    addFarmTimeBoundaries(now, speed, cps, boundary) {
      if (this.getFarmCount() < 1) return;
      const fs = this.farmState;
      let feed = 0;
      for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
        const count = fs.animals.filter((a) => a.type === type).length;
        const stock = fs.storage[def.good],
          cap = this.getEffectiveStorageCap(def.good);
        if (!count || stock >= cap) continue;
        const normalRate =
          this.getProductionModifier(type, false) / def.prodInterval;
        const cycles = this.getFarmCareCycles(type);
        const rate = normalRate * (cycles > 0 ? fs.careBonus.modifier : 1);
        const threshold =
          this.getFarmCount() >= 60 && fs.mastery.level >= 13 ? cap * 0.8 : cap;
        if (rate > 0) {
          boundary(
            now +
              (Math.max(0, threshold - stock) / (count * rate * speed)) * 1000,
          );
          if (cycles > 0) boundary(now + (cycles / (rate * speed)) * 1000);
        }
        const cost = this.getFeedCostPerSecond(type);
        if (cost > 0 && this.donutCount <= 1e-9 && feed + cost > cps) {
          fs.feedPlans[type] = "standard";
        } else feed += cost;
      }
      if (feed > cps && this.donutCount > 0)
        boundary(now + (this.donutCount / ((feed - cps) * speed)) * 1000);
      const star = this.getActiveFarmTraitEffect("contract_star");
      const contractSpeed =
        1 + (fs.mastery.level >= 11 ? 0.05 : 0) + (star?.contractSpeed || 0);
      for (const contract of fs.contracts.active)
        boundary(
          now +
            (Math.max(0, contract.duration - contract.elapsed) /
              (contractSpeed * speed)) *
              1000,
        );
    }

    setTimeVisibility(hidden) {
      this.settleTime();
      if (hidden === this.timeState.inactive) return;
      this.timeState.inactive = hidden;
      this.timeState.inactiveElapsed = 0;
      this._timeMonotonic = performance.now();
      this.lastFrameTime = 0;
      this.accumulatedTime = 0;
      if (hidden) {
        this.stopFallingDonuts();
        this.stopAutoCatcher();
        clearTimeout(this.comboTimeout);
        this.lastClickSuccess = false;
      } else if (this.comboActive) {
        this.startFallingDonuts();
        this.startAutoCatcher();
      }
    }

    updateProduction(currentTime = Date.now(), forcedDeltaTime = null) {
      return this.withProductionSnapshot(() => {
        this.settleTime(currentTime, forcedDeltaTime);

        // Pahalı hesaplamaları zaman tabanlı throttle et
        if (
          currentTime - this.lastHeavyUpdateTime >=
          this.heavyUpdateInterval
        ) {
          this.updateTotalPerSecond();
          if (!this.timeState.inactive) this.checkQuestProgress();
          if (!this.timeState.inactive) this.checkAutoBuyer();
          this.updatePrestigeBar();
          this.lastHeavyUpdateTime = currentTime;
        }

        // Scalar HUD invalidation is independent of production snapshot reuse.
        // Active/just-expired boosts also need paced countdown/expiry presentation.
        if (
          this.lastUpdateValues.balance !== this.donutCount ||
          this.lastUpdateValues.earned !== this.totalDonutsEarned ||
          this.multiplierState.active ||
          this.activeMultipliers.length ||
          this.lastUpdateValues.hasQuestMultiplier ||
          this.lastUpdateValues.multiplierCount
        ) {
          this.updateDisplay(false);
        }

        this.updateProductionDisplays(currentTime);
      });
    }

    updateProductionDisplays(currentTime) {
      if (!this.canPresent()) return;
      // Farm display update (time-based — faster for contracts/breeding)
      const farmUpdateInterval =
        this.farmActiveTab === "contracts" || this.farmActiveTab === "breeding"
          ? this.activeFarmUiUpdateInterval
          : this.farmUiUpdateInterval;
      if (currentTime - this.lastFarmUiUpdateTime >= farmUpdateInterval) {
        this.updateFarmDisplay();
        this.lastFarmUiUpdateTime = currentTime;
      }

      // Mine ve Baker üretimi zamanlayıcıları
      const mineElapsedTime = this.timeState.mineProgress;
      const bakerElapsedTime = this.timeState.bakerProgress;

      // Timer DOM güncellemeleri: saniye hissini koruyup gereksiz DOM yazımını azalt
      if (
        currentTime - this.lastTimerUiUpdateTime >=
        this.timerUiUpdateInterval
      ) {
        const mineTimer = this.domCache.get("mineTimer");
        if (mineTimer) {
          const mineRemainingTime = Math.ceil((60000 - mineElapsedTime) / 1000);
          if (
            mineTimer.textContent !== String(Math.max(0, mineRemainingTime))
          ) {
            mineTimer.textContent = Math.max(0, mineRemainingTime);
            mineTimer.classList.toggle("almost-ready", mineRemainingTime <= 10);
          }
        }

        const bakerTimer = this.domCache.get("bakerTimer");
        if (bakerTimer) {
          const bakerRemainingTime = Math.ceil(
            (this.bakerProductionInterval - bakerElapsedTime) / 1000,
          );
          if (
            bakerTimer.textContent !== String(Math.max(0, bakerRemainingTime))
          ) {
            bakerTimer.textContent = Math.max(0, bakerRemainingTime);
            bakerTimer.classList.toggle(
              "almost-ready",
              bakerRemainingTime <= 10,
            );
          }
        }

        this.lastTimerUiUpdateTime = currentTime;
      }
    }

    // Üretim metodları
    produceMineResources(random = Math.random) {
      if (this.items.mine.count <= 0) return;

      this.refreshOreMarketReference();
      this.reconcileMineWorkers();
      const workerCount = this.workers.length;
      const orePerWorker = 5; // Her işçi için 5 ore

      if (workerCount * orePerWorker > 1000) {
        this.produceLargeResourceBatch(
          this.oreTypes,
          this.ores,
          workerCount * orePerWorker,
          random,
        );
        this.updateOreList();
        return;
      }

      for (let i = 0; i < workerCount; i++) {
        let remainingOres = orePerWorker;

        while (remainingOres > 0) {
          const randomNum = random();
          let cumulativeChance = 0;

          for (const ore of this.oreTypes) {
            cumulativeChance += ore.rarity;
            if (randomNum <= cumulativeChance) {
              // Her seferinde 1 ore üret
              this.ores[ore.type].count++;
              remainingOres--;
              break;
            }
          }
        }
      }

      this.updateOreList();
    }

    produceBakerResources(random = Math.random) {
      this.reconcileBakerWorkers();
      if (this.items.baker.count <= 0) return;

      const bakerCount = this.items.baker.count;

      if (bakerCount * this.bakerIngredientsPerCycle > 1000) {
        this.produceLargeResourceBatch(
          this.ingredientTypes,
          this.ingredients,
          bakerCount * this.bakerIngredientsPerCycle,
          random,
        );
        this.updateIngredientList();
        return;
      }

      for (let i = 0; i < bakerCount; i++) {
        for (let j = 0; j < this.bakerIngredientsPerCycle; j++) {
          const randomNum = random();
          let cumulativeChance = 0;

          for (const ingredient of this.ingredientTypes) {
            cumulativeChance += ingredient.rarity;
            if (randomNum <= cumulativeChance) {
              if (!this.ingredients[ingredient.type]) {
                this.ingredients[ingredient.type] = { count: 0 };
              }
              this.ingredients[ingredient.type].count++;
              break;
            }
          }
        }
      }

      this.updateIngredientList();
    }

    produceLargeResourceBatch(definitions, inventory, count, random) {
      if (!Number.isSafeInteger(count)) return;
      // Sequential multinomial sampling: exact binomial inversion for small
      // tails, normal approximation for large populations. Preserve total units,
      // normalized weights, means and variance without one draw per worker unit.
      let remaining = count;
      let weight = definitions.reduce((sum, entry) => sum + entry.rarity, 0);
      for (let i = 0; i < definitions.length; i++) {
        const entry = definitions[i],
          p = Math.min(1, entry.rarity / weight);
        let quantity = remaining;
        if (i < definitions.length - 1 && remaining > 0) {
          const flipped = p > 0.5,
            q = flipped ? 1 - p : p;
          let sample;
          if (remaining * q < 30) {
            let probability = Math.pow(1 - q, remaining),
              cumulative = probability;
            const draw = random();
            sample = 0;
            while (draw > cumulative && sample < remaining) {
              sample++;
              probability *=
                (((remaining - sample + 1) / sample) * q) / (1 - q);
              cumulative += probability;
            }
          } else {
            const normal =
              Math.sqrt(-2 * Math.log(Math.max(Number.MIN_VALUE, random()))) *
              Math.cos(2 * Math.PI * random());
            sample = Math.round(
              remaining * q + Math.sqrt(remaining * q * (1 - q)) * normal,
            );
            sample = Math.max(0, Math.min(remaining, sample));
          }
          quantity = flipped ? remaining - sample : sample;
        }
        if (!inventory[entry.type]) inventory[entry.type] = { count: 0 };
        inventory[entry.type].count += quantity;
        remaining -= quantity;
        weight -= entry.rarity;
      }
    }

    // ============================================
    // FARM PANEL — Full System
    // ============================================

    createDefaultFarmState() {
      return {
        farmVersion: 1,
        animals: [],
        storage: { egg: 0, milk: 0, wool: 0, honey: 0, truffle: 0 },
        feedPlans: {
          chicken: "standard",
          cow: "standard",
          sheep: "standard",
          bees: "standard",
          pigs: "standard",
        },
        contracts: { board: [], active: [], lastRefresh: 0, rerollsUsed: 0 },
        breeding: {
          slots: [
            {
              active: false,
              parentA: null,
              parentB: null,
              program: "quick",
              progress: 0,
              duration: 0,
            },
            {
              active: false,
              parentA: null,
              parentB: null,
              program: "quick",
              progress: 0,
              duration: 0,
            },
          ],
        },
        mastery: { xp: 0, level: 0 },
        buffs: {
          PROD: null,
          COST: null,
          OFFLINE: null,
          QOL: null,
          EVENT: null,
        },
        careWindow: {
          nextTrigger: this.getGameTime() + 720000,
          active: false,
          expiresAt: 0,
          lateUntil: 0,
        },
        careBonus: { modifier: 1, cyclesRemaining: 0 },
        collectCounts: {},
        crates: [],
        rumors: { active: null },
        stats: { totalGoodsSold: 0, totalContractsCompleted: 0, totalBred: 0 },
        lastFarmTick: this.getGameTime(),
      };
    }

    getFarmCount() {
      return this.items.farm.count;
    }

    getActiveFarmTraitEffect(id, animals = this.farmState.animals) {
      return animals.some((animal) => animal.traits?.includes(id))
        ? this.farmTraitDefs.find((trait) => trait.id === id)?.effect
        : null;
    }

    isAnimalBreeding(id) {
      return this.farmState.breeding.slots.some(
        (slot) => slot.active && (slot.parentA === id || slot.parentB === id),
      );
    }

    getFarmRosterSignature() {
      return JSON.stringify([
        this.getFarmCount(),
        this.farmState.feedPlans,
        this.farmState.animals.map((a) => [
          a.id,
          a.name,
          a.traits,
          a.variant,
          a.passport,
          a.breedCooldown > 0,
          this.isAnimalBreeding(a.id),
        ]),
      ]);
    }

    getBreedingRenderSignature() {
      return JSON.stringify([
        this.getFarmRosterSignature(),
        this._breedSelection,
        this._breedProgram,
        this.farmState.breeding.slots.map((s) => [
          s.active,
          s.parentA,
          s.parentB,
          s.program,
        ]),
      ]);
    }

    getFarmCareCycles(type) {
      const bonus = this.farmState.careBonus;
      return bonus.cyclesByType
        ? bonus.cyclesByType[type] || 0
        : bonus.cyclesRemaining;
    }

    restoreFarmCareCycles() {
      const bonus = this.farmState.careBonus;
      // Old saves have only a global count. Preserve it for each currently owned species.
      if (!bonus.cyclesByType)
        bonus.cyclesByType = Object.fromEntries(
          [...new Set(this.farmState.animals.map((a) => a.type))].map(
            (type) => [type, bonus.cyclesRemaining],
          ),
        );
      bonus.cyclesRemaining = Math.ceil(
        Math.max(0, ...Object.values(bonus.cyclesByType)),
      );
    }

    getEffectiveStorageCap(good) {
      const animalType = Object.keys(this.farmAnimalDefs).find(
        (k) => this.farmAnimalDefs[k].good === good,
      );
      if (!animalType) return 30;
      const baseCap = this.farmAnimalDefs[animalType].storageCap;
      const masteryBonus = this.farmState.mastery.level * 5;
      let cap = baseCap + masteryBonus;
      // Tireless trait bonus per animal
      const animals = this.farmState.animals.filter(
        (a) => a.type === animalType,
      );
      for (const animal of animals) {
        if (animal.traits.includes("tireless")) {
          cap = Math.ceil(cap * 1.2);
          break; // only once per good
        }
      }
      return cap;
    }

    getAnimalCost(type) {
      const def = this.farmAnimalDefs[type];
      const owned = this.farmState.animals.filter(
        (a) => a.type === type,
      ).length;
      return Math.floor(def.baseCost * Math.pow(def.costMult, owned));
    }

    getSellPrice(good) {
      const animalType = Object.keys(this.farmAnimalDefs).find(
        (k) => this.farmAnimalDefs[k].good === good,
      );
      if (!animalType) return 0;
      const def = this.farmAnimalDefs[animalType];
      let price = def.baseSellPrice * (1 + 0.08 * this.getFarmCount());
      // Mastery sell bonuses
      const ml = this.farmState.mastery.level;
      if (ml >= 3) price *= 1.05;
      if (ml >= 10) price *= 1.1;
      if (ml >= 19) price *= 1.2;
      // Trait sell bonuses from animals of this type
      const animals = this.farmState.animals.filter(
        (a) => a.type === animalType,
      );
      for (const animal of animals) {
        for (const traitId of animal.traits) {
          const tdef = this.farmTraitDefs.find((t) => t.id === traitId);
          if (tdef && tdef.effect.type === "sellPrice")
            price *= 1 + tdef.effect.value;
          if (tdef && tdef.effect.type === "legendaryProd")
            price *= 1 + tdef.effect.sellPrice;
        }
        // Variant sell bonus
        if (animal.variant) {
          const vdefs = this.farmVariants[animalType];
          const vdef = vdefs
            ? vdefs.find((v) => v.name === animal.variant)
            : null;
          if (vdef && vdef.effect.sellPrice) price *= 1 + vdef.effect.sellPrice;
        }
        // Passport sell bonus
        if (animal.passport === "merchant") price *= 1.3;
        if (animal.passport === "golden") price *= 1.1;
      }
      // PROD buff sell boost doesn't apply to sell prices per spec, only prod buff
      return Math.floor(price);
    }

    getProductionModifier(animalType, includeCare = true) {
      let mod = 1;
      const feedPlan = this.farmState.feedPlans[animalType] || "standard";
      if (feedPlan === "ration") mod *= 0.7;
      else if (feedPlan === "premium") mod *= 1.4;
      // Mastery production bonuses
      const ml = this.farmState.mastery.level;
      if (ml >= 5) mod *= 1.1;
      if (ml >= 14) mod *= 1.15;
      // Care bonus
      if (includeCare && this.getFarmCareCycles(animalType) > 0) {
        mod *= this.farmState.careBonus.modifier;
      }
      // PROD buff
      const prodBuff = this.farmState.buffs.PROD;
      if (prodBuff && prodBuff.remaining > 0) {
        mod *= prodBuff.strength;
      }
      // Trait bonuses
      const animals = this.farmState.animals.filter(
        (a) => a.type === animalType,
      );
      let traitProdBonus = 0;
      for (const animal of animals) {
        for (const traitId of animal.traits) {
          const tdef = this.farmTraitDefs.find((t) => t.id === traitId);
          if (!tdef) continue;
          if (tdef.effect.type === "prodSpeed")
            traitProdBonus += tdef.effect.value;
          if (tdef.effect.type === "legendaryProd")
            traitProdBonus += tdef.effect.prodSpeed;
          if (tdef.effect.type === "socialProd") {
            const sameCount = animals.length;
            traitProdBonus += Math.min(
              tdef.effect.value * (sameCount - 1),
              tdef.effect.max,
            );
          }
        }
        // Variant production bonus
        if (animal.variant) {
          const vdefs = this.farmVariants[animalType];
          const vdef = vdefs
            ? vdefs.find((v) => v.name === animal.variant)
            : null;
          if (vdef && vdef.effect.prodSpeed)
            traitProdBonus += vdef.effect.prodSpeed;
        }
        // Passport production bonus
        if (animal.passport === "pioneer") traitProdBonus += 0.2;
        if (animal.passport === "golden") traitProdBonus += 0.1;
      }
      // Average the trait bonuses across all animals of this type
      if (animals.length > 0) {
        mod *= 1 + traitProdBonus / animals.length;
      }
      return mod;
    }

    // --- Core production tick ---
    tickFarm(
      deltaSeconds,
      wallSeconds = deltaSeconds,
      now = this.getGameTime(),
    ) {
      const fc = this.getFarmCount();
      if (fc < 1) {
        this.tickBuffExpiry(wallSeconds);
        this.tickBreeding(wallSeconds);
        return;
      }

      const fs = this.farmState;
      this.restoreFarmCareCycles();
      const producingSeconds = {};

      // 1. Produce goods per animal type
      try {
        for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
          const animals = fs.animals.filter((a) => a.type === type);
          if (animals.length === 0) continue;
          const good = def.good;
          const cap = this.getEffectiveStorageCap(good);
          if (fs.storage[good] >= cap) continue;

          const baseRate = 1 / def.prodInterval;
          const normalRate = baseRate * this.getProductionModifier(type, false);
          const cycles = this.getFarmCareCycles(type);
          const careRate = normalRate * fs.careBonus.modifier;
          if (!Number.isFinite(normalRate) || !Number.isFinite(careRate))
            continue;
          // A cycle is one animal's output interval, not one unit from the whole herd.
          // Integrate the boundary so a long tick cannot extend the bonus past expiry.
          const careSeconds =
            cycles > 0 ? Math.min(deltaSeconds, cycles / careRate) : 0;
          const careGoods = Math.min(
            animals.length * careRate * careSeconds,
            cap - fs.storage[good],
          );
          if (cycles > 0)
            fs.careBonus.cyclesByType[type] = Math.max(
              0,
              cycles - careGoods / animals.length,
            );
          const normalGoods = Math.min(
            animals.length * normalRate * (deltaSeconds - careSeconds),
            cap - fs.storage[good] - careGoods,
          );
          producingSeconds[type] =
            (careRate > 0 ? careGoods / (animals.length * careRate) : 0) +
            (normalRate > 0 ? normalGoods / (animals.length * normalRate) : 0);
          fs.storage[good] += careGoods + normalGoods;
        }
      } catch (e) {
        console.error("[Farm] production error:", e);
      }

      // 2. Feed costs
      try {
        this.applyFarmFeedCosts(deltaSeconds, producingSeconds);
      } catch (e) {
        console.error("[Farm] feed cost error:", e);
      }

      // Effects earned at the end of this segment start at that boundary, not
      // its beginning. Expire old buffs before contract completion grants new ones.
      if (this._settlingTime) this._simulationNow = now;
      this.tickBuffExpiry(wallSeconds);

      // 3. Care window
      try {
        this.tickCareWindow(now);
      } catch (e) {
        console.error("[Farm] care window error:", e);
      }

      // 4. Contract refresh
      try {
        this.tickContractRefresh(now);
      } catch (e) {
        console.error("[Farm] contract refresh error:", e);
      }

      // 5. Progress active contracts
      try {
        this.tickActiveContracts(deltaSeconds);
      } catch (e) {
        console.error("[Farm] active contracts error:", e);
      }

      // 6. Breeding
      try {
        this.tickBreeding(wallSeconds);
      } catch (e) {
        console.error("[Farm] breeding error:", e);
      }

      // 8. Auto-collect (FC 60 + Mastery 13)
      try {
        this.tickAutoCollect();
      } catch (e) {
        console.error("[Farm] auto-collect error:", e);
      }

      fs.careBonus.cyclesRemaining = Math.ceil(
        Math.max(0, ...Object.values(fs.careBonus.cyclesByType)),
      );
    }

    getFeedCostPerSecond(type) {
      const def = this.farmAnimalDefs[type];
      const fs = this.farmState;
      const plan = fs.feedPlans[type] || "standard";
      if (plan === "standard") return 0;
      const animals = fs.animals.filter((a) => a.type === type);
      if (animals.length === 0) return 0;

      // Base cost: flat rate from animal price (meaningful early game)
      const costPercent = plan === "ration" ? 0.005 : 0.02;
      const baseCost =
        (def.baseCost * costPercent * animals.length) / def.prodInterval;

      // CpS-scaled cost: % of total income (meaningful late game)
      // Ration: 0.08% CpS per type (5 types all ration = 0.4% total)
      // Premium: 0.35% CpS per type (5 types all premium = 1.75% total)
      const cpsPercent = plan === "ration" ? 0.0008 : 0.0035;
      const scaledCost = (this.totalPerSecond || 0) * cpsPercent;

      // Efficient trait reduces feed cost
      let feedDiscount = 0;
      for (const animal of animals) {
        for (const traitId of animal.traits) {
          const tdef = this.farmTraitDefs.find((t) => t.id === traitId);
          if (tdef && tdef.effect.type === "feedCost")
            feedDiscount += tdef.effect.value;
        }
      }
      // feedDiscount is negative (e.g. -0.10, -0.25), cap at -50%
      feedDiscount = Math.max(feedDiscount, -0.5);

      return Math.max(baseCost, scaledCost) * (1 + feedDiscount);
    }

    applyFarmFeedCosts(deltaSeconds, producingSeconds = null) {
      const fs = this.farmState;
      for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
        const plan = fs.feedPlans[type];
        if (plan === "standard") continue;
        const costPerSecond = this.getFeedCostPerSecond(type);
        if (costPerSecond <= 0) continue;
        const totalCost =
          costPerSecond *
          (producingSeconds ? producingSeconds[type] || 0 : deltaSeconds);
        if (this.donutCount + 1e-8 >= totalCost) {
          this.donutCount = Math.max(0, this.donutCount - totalCost);
        } else {
          fs.feedPlans[type] = "standard";
          this._forceBarnFullRender();
          this.showFarmNotification(
            "Not enough donuts for " + plan + " feed. Switched to Standard.",
          );
        }
      }
    }

    tickCareWindow(now) {
      const fs = this.farmState;
      if (this.getFarmCount() < 10) return;
      const window = fs.careWindow;
      const alert = this.getActiveFarmTraitEffect("alert");
      const duration = 90000 + (alert?.value || 0) * 1000;
      if (window.active && now >= window.expiresAt) {
        window.active = false;
        window.nextTrigger = window.expiresAt + 720000;
        window.lateUntil = window.expiresAt + 180000;
      }
      if (!window.active && now >= window.nextTrigger) {
        const cycle = 720000 + duration;
        const trigger =
          window.nextTrigger +
          Math.floor((now - window.nextTrigger) / cycle) * cycle;
        window.expiresAt = trigger + duration;
        window.active = now < window.expiresAt;
        window.nextTrigger = window.expiresAt + 720000;
        window.lateUntil = window.active ? 0 : window.expiresAt + 180000;
      }
      this.updateFarmCareDisplay(now);
    }

    updateFarmCareDisplay(now = this.getGameTime()) {
      if (!this.canPresent() || this.getFarmCount() < 10) return;
      const window = this.farmState.careWindow;
      const overlay = document.getElementById("farm-care-overlay");
      if (overlay) overlay.classList.toggle("hidden", !window.active);
      const timer = document.getElementById("farm-care-timer");
      if (timer)
        timer.textContent =
          Math.max(0, Math.ceil((window.expiresAt - now) / 1000)) +
          "s remaining";
    }

    performCareAction(action) {
      this.settleBeforeMutation();
      const fs = this.farmState;
      if (!["pet", "treat"].includes(action) || this.getFarmCount() < 10)
        return false;
      this.tickCareWindow(this.getGameTime());
      const late =
        !fs.careWindow.active && this.getGameTime() <= fs.careWindow.lateUntil;
      if (!fs.careWindow.active && !late) return false;
      if (late) {
        // Late actions
        if (action === "pet") {
          fs.careBonus = { modifier: 1.1, cyclesRemaining: 1 };
        } else {
          const cost = this.donutCount * 0.0005;
          if (this.donutCount >= cost) {
            this.donutCount -= cost;
            fs.careBonus = { modifier: 1.15, cyclesRemaining: 1 };
          }
        }
      } else if (fs.careWindow.active) {
        if (action === "pet") {
          fs.careBonus = { modifier: 1.25, cyclesRemaining: 2 };
        } else {
          const cost = this.donutCount * 0.001;
          if (this.donutCount >= cost) {
            this.donutCount -= cost;
            fs.careBonus = { modifier: 1.4, cyclesRemaining: 3 };
          }
        }
        this.gainMasteryXP(15);
      }
      // Calm trait bonus
      const hasCalm = fs.animals.some((a) => a.traits.includes("calm"));
      if (hasCalm) {
        fs.careBonus.modifier *= 1.1;
      }
      this.restoreFarmCareCycles();
      const overlay = document.getElementById("farm-care-overlay");
      if (overlay) overlay.classList.add("hidden");
      fs.careWindow.active = false;
      fs.careWindow.lateUntil = 0;
      fs.careWindow.nextTrigger = this.getGameTime() + 720000;
      this.updateDisplay(!this._settlingTime);
      this.requestSave();
      return true;
    }

    tickContractRefresh(now) {
      const fs = this.farmState;
      if (this.getFarmCount() < 5) return;
      if (
        now - fs.contracts.lastRefresh >= 600000 ||
        fs.contracts.board.length === 0
      ) {
        const previous = fs.contracts.lastRefresh;
        const at =
          previous > 0
            ? previous +
              Math.floor(Math.max(0, now - previous) / 600000) * 600000
            : now;
        // Only the current board matters. Its own deterministic seed prevents
        // skipped presentation-only refreshes from changing resource RNG.
        this._boardRandomState =
          ((Math.floor(at) >>> 0) ^ 0x9e3779b9) >>> 0 || 1;
        const eventTime = this._simulationNow;
        this._simulationNow = at;
        try {
          this.generateContractBoard();
        } finally {
          this._boardRandomState = undefined;
          this._simulationNow = eventTime;
        }
        fs.contracts.lastRefresh = at;
        fs.contracts.rerollsUsed = 0;
      }
    }

    generateContractBoard() {
      const fc = this.getFarmCount();
      const ml = this.farmState.mastery.level;
      const board = [];
      // Rush contracts (2 slots, unlock at FC 5)
      if (fc >= 5) {
        for (let i = 0; i < 2; i++)
          board.push(this.generateContract("rush", fc, ml));
      }
      // Standard contracts (3 slots, unlock at FC 10)
      if (fc >= 10) {
        for (let i = 0; i < 3; i++)
          board.push(this.generateContract("standard", fc, ml));
      }
      // Long haul (2 slots, unlock at FC 25)
      if (fc >= 25) {
        for (let i = 0; i < 2; i++)
          board.push(this.generateContract("longhaul", fc, ml));
      }
      this.farmState.contracts.board = board;
    }

    generateContract(type, fc, ml) {
      const availableGoods = Object.entries(this.farmAnimalDefs)
        .filter(([, def]) => fc >= def.unlockFC)
        .map(([, def]) => def.good);
      if (availableGoods.length === 0) return null;

      let duration, reqCount, goodCount;
      if (type === "rush") {
        duration = 180 + Math.floor(this.timeRandom() * 120); // 3-5min
        reqCount = 2 + Math.floor(this.timeRandom() * 4); // low qty
        goodCount = 1;
      } else if (type === "standard") {
        duration = 480 + Math.floor(this.timeRandom() * 420); // 8-15min
        reqCount = 4 + Math.floor(this.timeRandom() * 6);
        goodCount = Math.min(
          1 + Math.floor(this.timeRandom() * 2),
          availableGoods.length,
        );
      } else {
        duration = 2700 + Math.floor(this.timeRandom() * 2700); // 45-90min
        reqCount = 8 + Math.floor(this.timeRandom() * 8);
        goodCount = Math.min(
          2 + Math.floor(this.timeRandom() * 2),
          availableGoods.length,
        );
      }

      // Pick random goods
      const shuffled = [...availableGoods].sort(() => this.timeRandom() - 0.5);

      // Roll affixes
      const maxAffixes = fc >= 100 ? 3 : 2;
      const affixes = [];
      for (let i = 0; i < maxAffixes; i++) {
        if (this.timeRandom() < 0.3 + i * 0.15) continue; // decreasing chance for more affixes
        const roll = this.timeRandom();
        let cumulative = 0;
        for (const affix of this.farmAffixDefs) {
          cumulative += affix.rarity;
          if (roll <= cumulative) {
            if (affix.masteryReq && ml < affix.masteryReq) continue;
            // Single-good and two-good promises cannot coexist on one contract.
            if (
              (affix.id === "focused" && affixes.includes("legendary")) ||
              (affix.id === "legendary" && affixes.includes("focused"))
            )
              break;
            if (!affixes.includes(affix.id)) {
              affixes.push(affix.id);
            }
            break;
          }
        }
      }

      if (affixes.includes("focused")) goodCount = 1;
      const legendary = this.farmAffixDefs.find((a) => a.id === "legendary");
      if (affixes.includes("legendary"))
        goodCount = Math.min(legendary.effect.reqGoods, availableGoods.length);
      const requirements = Object.fromEntries(
        shuffled
          .slice(0, goodCount)
          .map((good) => [good, Math.max(1, Math.floor(reqCount / goodCount))]),
      );

      // Apply affix modifiers
      let rewardMult = 1;
      let durationMult = 1;
      for (const affixId of affixes) {
        const affix = this.farmAffixDefs.find((a) => a.id === affixId);
        if (affix.effect.rewardMult) rewardMult *= affix.effect.rewardMult;
        if (affix.effect.durationMult)
          durationMult *= affix.effect.durationMult;
        if (affix.effect.reqMult) {
          for (const good in requirements)
            requirements[good] = Math.ceil(
              requirements[good] * affix.effect.reqMult,
            );
        }
      }
      duration = Math.floor(duration * durationMult);

      // Calculate donut reward
      let baseReward = 0;
      for (const [good, qty] of Object.entries(requirements)) {
        baseReward += qty * this.getSellPrice(good) * 1.5;
      }
      const donutReward = Math.floor(baseReward * rewardMult);
      // Presence bonuses apply once, not once per animal. Existing assignments stay frozen.
      const diplomat = this.getActiveFarmTraitEffect("diplomat");
      if (diplomat)
        for (const good of Object.keys(requirements)) {
          requirements[good] = Math.max(
            1,
            Math.ceil(requirements[good] * (1 + diplomat.value)),
          );
        }

      // Buff reward (standard and longhaul may have buffs)
      let buffReward = null;
      if (type === "standard" && this.timeRandom() < 0.4) {
        buffReward = this.generateBuffReward(ml);
      } else if (type === "longhaul") {
        buffReward = this.generateBuffReward(ml);
      }
      if (buffReward) {
        for (const id of affixes) {
          const effect = this.farmAffixDefs.find((a) => a.id === id).effect;
          buffReward.duration *= effect.buffDurationMult || 1;
          buffReward.strength *= effect.buffStrengthMult || 1;
        }
        const star = this.getActiveFarmTraitEffect("contract_star");
        buffReward.duration *= 1 + (star?.buffDuration || 0);
      }

      const names = this.farmContractNames[type];
      const id =
        "contract_" +
        this.getGameTime() +
        "_" +
        Math.floor(this.timeRandom() * 1000);

      return {
        id,
        type,
        title: names[Math.floor(this.timeRandom() * names.length)],
        requirements,
        progress: Object.fromEntries(
          Object.keys(requirements).map((g) => [g, 0]),
        ),
        duration,
        elapsed: 0,
        reward: { donuts: donutReward, buff: buffReward },
        affixes,
        expiresAt: this.getGameTime() + duration * 1000 + 600000,
      };
    }

    generateBuffReward(ml) {
      const cats = Object.keys(this.farmBuffCategories);
      const cat = cats[Math.floor(this.timeRandom() * cats.length)];
      const base = this.farmBuffCategories[cat];
      return {
        category: cat,
        strength: base.baseStrength * (1 + 0.02 * ml),
        duration: base.baseDuration,
      };
    }

    acceptContract(contractId) {
      this.settleBeforeMutation();
      const fs = this.farmState;
      if (fs.contracts.active.length >= 2) {
        this.showFarmNotification("Max 2 active contracts!");
        return;
      }
      const idx = fs.contracts.board.findIndex((c) => c && c.id === contractId);
      if (idx === -1) return;
      const contract = fs.contracts.board.splice(idx, 1)[0];
      // Check if we have the goods
      let canFulfill = true;
      for (const [good, qty] of Object.entries(contract.requirements)) {
        if ((fs.storage[good] || 0) < qty) {
          canFulfill = false;
          break;
        }
      }
      if (!canFulfill) {
        this.showFarmNotification("Not enough goods!");
        fs.contracts.board.splice(idx, 0, contract);
        return;
      }
      // Deduct goods
      for (const [good, qty] of Object.entries(contract.requirements)) {
        fs.storage[good] -= qty;
        contract.progress[good] = qty;
      }
      fs.contracts.active.push(contract);
      this.updateFarmDisplay();
      this.requestSave();
    }

    tickActiveContracts(deltaSeconds) {
      const fs = this.farmState;
      if (!fs.contracts || !Array.isArray(fs.contracts.active)) return;
      const toComplete = [];
      for (const contract of fs.contracts.active) {
        if (
          !contract ||
          typeof contract.elapsed !== "number" ||
          typeof contract.duration !== "number"
        )
          continue;
        contract.elapsed += deltaSeconds;
        // Contract speed bonus from mastery
        if (fs.mastery.level >= 11) contract.elapsed += deltaSeconds * 0.05;
        const star = this.getActiveFarmTraitEffect("contract_star");
        if (star) contract.elapsed += deltaSeconds * star.contractSpeed;
        if (contract.elapsed >= contract.duration - 1e-7) {
          contract.elapsed = Math.max(contract.elapsed, contract.duration);
          toComplete.push(contract);
        }
      }
      for (const contract of toComplete) {
        try {
          this.completeContract(contract);
        } catch (e) {
          console.error("[Farm] completeContract error:", e);
          // Force-remove broken contract
          fs.contracts.active = fs.contracts.active.filter(
            (c) => c.id !== contract.id,
          );
        }
      }
    }

    completeContract(contract) {
      const fs = this.farmState;
      // Remove from active
      fs.contracts.active = fs.contracts.active.filter(
        (c) => c.id !== contract.id,
      );

      // Award donuts
      let donuts = contract.reward.donuts;
      // Volatile affix
      if (contract.affixes.includes("volatile")) {
        donuts = Math.floor(donuts * (0.5 + this.timeRandom() * 1.5));
      }
      // Mastery contract reward bonus
      if (fs.mastery.level >= 16) donuts = Math.floor(donuts * 1.1);

      this.creditDonuts(donuts);
      this.showFarmNotification(
        "Contract complete! +" + this.formatNumber(donuts) + " donuts",
      );

      // Award buff
      if (contract.reward.buff) {
        this.applyFarmBuff(contract.reward.buff);
      }

      // Mastery XP
      const xpMap = { rush: 25, standard: 50, longhaul: 120 };
      this.gainMasteryXP(xpMap[contract.type] || 25);

      fs.stats.totalContractsCompleted++;

      // Chain affix
      if (contract.affixes.includes("chain")) {
        const chainContract = this.generateContract(
          contract.type,
          this.getFarmCount(),
          fs.mastery.level,
        );
        if (chainContract) {
          chainContract.reward.donuts = Math.floor(
            chainContract.reward.donuts * 1.5,
          );
          chainContract.title = "Chain: " + chainContract.title;
          fs.contracts.board.push(chainContract);
        }
      }

      // Crate drop
      this.rollFarmCrate();
      this.updateFarmDisplay();
      this.requestSave();
    }

    deliverContract(contractId) {
      this.settleBeforeMutation();
      const fs = this.farmState;
      const contract = fs.contracts.active.find((c) => c.id === contractId);
      if (!contract) return;
      if (contract.elapsed < contract.duration) {
        this.showFarmNotification("Contract not ready yet!");
        return;
      }
      this.completeContract(contract);
    }

    applyFarmBuff(buffData) {
      this.settleBeforeMutation();
      const fs = this.farmState;
      const cat = buffData.category;
      if (cat !== "PROD") {
        this.showFarmNotification(
          cat + " buffs are not available yet; no buff applied.",
        );
        return false;
      }
      const current = fs.buffs[cat];
      const newBuff = {
        strength: buffData.strength,
        duration: buffData.duration,
        remaining: buffData.duration,
        source: "contract",
      };
      if (!current || current.remaining <= 0) {
        fs.buffs[cat] = newBuff;
        return;
      }
      // Replace check: new must be >10% stronger
      const newScore = newBuff.strength * newBuff.remaining;
      const curScore = current.strength * current.remaining;
      if (newScore > curScore * 1.1) {
        fs.buffs[cat] = newBuff;
      } else {
        const consolation = Math.floor(this.donutCount * 0.001);
        this.creditDonuts(consolation, false);
        this.showFarmNotification(
          "Buff blocked. +" +
            this.formatNumber(consolation) +
            " donuts instead.",
        );
      }
    }

    tickBuffExpiry(deltaSeconds) {
      const fs = this.farmState;
      for (const cat of Object.keys(fs.buffs)) {
        if (fs.buffs[cat] && fs.buffs[cat].remaining > 0) {
          fs.buffs[cat].remaining -= deltaSeconds;
          if (fs.buffs[cat].remaining <= 1e-7) {
            fs.buffs[cat] = null;
          }
        }
      }
    }

    // --- Animal Purchase ---
    buyAnimal(type) {
      this.settleBeforeMutation();
      const def = this.farmAnimalDefs[type];
      if (!def) return;
      if (this.getFarmCount() < def.unlockFC) return;
      const owned = this.farmState.animals.filter((a) => a.type === type);
      if (owned.length >= 20) {
        this.showFarmNotification("Max 20 " + def.name + " reached!");
        return;
      }
      const cost = this.getAnimalCost(type);
      if (this.donutCount < cost) return;
      this.donutCount -= cost;

      // Roll random traits (1-2 for purchased animals)
      const traits = [];
      const traitCount = 1 + (this.timeRandom() < 0.3 ? 1 : 0);
      for (let i = 0; i < traitCount; i++) {
        const trait = this.rollNewTrait(0);
        if (trait && !traits.includes(trait)) traits.push(trait);
      }

      const animal = {
        id: type + "_" + this.farmNextAnimalId++,
        type,
        name: def.name + " #" + (owned.length + 1),
        traits,
        variant: null,
        passport: null,
        productionTimer: 0,
        feedPlan: "standard",
        breedCooldown: 0,
      };
      this.farmState.animals.push(animal);
      this._forceBarnFullRender();
      this.updateDisplay(!this._settlingTime);
      this.requestSave();
    }

    releaseAnimal(animalId) {
      this.settleBeforeMutation();
      const fs = this.farmState;
      const animal = fs.animals.find((a) => a.id === animalId);
      if (!animal) return false;
      if (this.isAnimalBreeding(animalId)) {
        this.showFarmNotification(
          "This animal is breeding. Wait for breeding to finish before releasing it.",
        );
        return false;
      }
      if (
        !confirm(
          "Release " +
            (animal.name || animal.type) +
            " permanently? No rewards will be given.",
        )
      )
        return false;
      fs.animals = fs.animals.filter((a) => a.id !== animalId);
      for (const selection of Object.values(this._breedSelection || {})) {
        if (selection.a === animalId) selection.a = null;
        if (selection.b === animalId) selection.b = null;
      }
      for (const slot of fs.breeding.slots) {
        if (!slot.active && slot.parentA === animalId) slot.parentA = null;
        if (!slot.active && slot.parentB === animalId) slot.parentB = null;
      }
      if (
        !fs.animals.some((a) => a.type === animal.type) &&
        fs.careBonus.cyclesByType
      ) {
        delete fs.careBonus.cyclesByType[animal.type];
        this.restoreFarmCareCycles();
      }
      this._forceBarnFullRender();
      this.updateFarmDisplay();
      this.updateDisplay(!this._settlingTime);
      this.requestSave();
      return true;
    }

    rollNewTrait(rareBonus, excludeIds) {
      const ex = excludeIds || [];
      const roll = this.timeRandom();
      let pool;
      if (roll < 0.005) {
        // Epic (0.5% — rareBonus does NOT affect epic chance)
        pool = this.farmTraitDefs.filter(
          (t) => t.rarity === "epic" && !ex.includes(t.id),
        );
        if (pool.length > 0)
          return pool[Math.floor(this.timeRandom() * pool.length)].id;
      }
      if (roll < 0.015 + rareBonus) {
        // Rare (1.5% base + rareBonus from program/feed)
        pool = this.farmTraitDefs.filter(
          (t) => t.rarity === "rare" && !ex.includes(t.id),
        );
        if (pool.length > 0)
          return pool[Math.floor(this.timeRandom() * pool.length)].id;
      }
      // Common
      pool = this.farmTraitDefs.filter(
        (t) => t.rarity === "common" && !ex.includes(t.id),
      );
      if (pool.length > 0)
        return pool[Math.floor(this.timeRandom() * pool.length)].id;
      // Fallback: any trait not already owned
      pool = this.farmTraitDefs.filter((t) => !ex.includes(t.id));
      return pool.length > 0
        ? pool[Math.floor(this.timeRandom() * pool.length)].id
        : null;
    }

    // --- Selling Goods ---
    sellGoods(good) {
      this.settleBeforeMutation();
      const fs = this.farmState;
      const amount = Math.floor(fs.storage[good] || 0);
      if (amount <= 0) return;
      const price = this.getSellPrice(good);
      const total = amount * price;
      fs.storage[good] -= amount;
      this.creditDonuts(total);
      fs.stats.totalGoodsSold += amount;
      fs.collectCounts[good] = (fs.collectCounts[good] || 0) + 1;
      const producers = fs.animals.filter(
        (a) => this.farmAnimalDefs[a.type].good === good,
      );
      const generous = this.getActiveFarmTraitEffect("generous", producers);
      if (generous && fs.collectCounts[good] % generous.value === 0) {
        fs.storage[good] = Math.min(
          fs.storage[good] + 1,
          this.getEffectiveStorageCap(good),
        );
      }
      this.gainMasteryXP(3);
      this.showFarmNotification(
        "Sold " +
          amount +
          " " +
          good +
          " for " +
          this.formatNumber(total) +
          " donuts!",
      );
      // Crate drop chance on collect/sell
      this.rollFarmCrate();
      this.updateFarmDisplay();
      this.updateDisplay(!this._settlingTime);
      this.requestSave();
    }

    // --- Breeding ---
    startBreeding(slotIndex, parentAId, parentBId, program) {
      this.settleBeforeMutation();
      const fs = this.farmState;
      const fc = this.getFarmCount();
      if (![0, 1].includes(slotIndex) || (slotIndex === 0 ? fc < 15 : fc < 60))
        return false;
      const slot = fs.breeding.slots[slotIndex];
      if (!slot || slot.active || parentAId === parentBId) return false;
      if (
        !Object.hasOwn(this.farmBreedPrograms, program) ||
        (program === "long" && fc < 25)
      )
        return false;

      const parentA = fs.animals.find((a) => a.id === parentAId);
      const parentB = fs.animals.find((a) => a.id === parentBId);
      if (
        !parentA ||
        !parentB ||
        !Object.hasOwn(this.farmAnimalDefs, parentA.type) ||
        !Array.isArray(parentA.traits) ||
        !Array.isArray(parentB.traits) ||
        this.isAnimalBreeding(parentAId) ||
        this.isAnimalBreeding(parentBId)
      )
        return false;
      if (parentA.type !== parentB.type) {
        this.showFarmNotification("Parents must be the same type!");
        return false;
      }
      const def = this.farmAnimalDefs[parentA.type];
      if (
        fc < def.unlockFC ||
        fs.animals.filter((a) => a.type === parentA.type).length >= 20
      )
        return false;
      if (
        ![parentA, parentB].every(
          (a) =>
            Number.isFinite(a.breedCooldown ?? 0) &&
            (a.breedCooldown ?? 0) === 0,
        )
      ) {
        this.showFarmNotification("Parent(s) still on cooldown!");
        return false;
      }
      const prog = this.farmBreedPrograms[program];
      if (!prog) return;
      const cost = this.farmAnimalDefs[parentA.type].baseCost * prog.costMult;
      if (!Number.isFinite(this.donutCount) || this.donutCount < cost)
        return false;
      this.donutCount -= cost;

      slot.active = true;
      slot.parentA = parentAId;
      slot.parentB = parentBId;
      slot.program = program;
      slot.progress = 0;
      slot.duration = prog.duration;

      if (this._breedSelection?.[slotIndex])
        this._breedSelection[slotIndex] = { a: null, b: null };
      this.updateFarmDisplay();
      this.updateDisplay(!this._settlingTime);
      this.requestSave();
      return true;
    }

    startBreedingFromUI(slotIndex) {
      if (!this._breedSelection || !this._breedSelection[slotIndex]) {
        this.showFarmNotification("Select both parents first!");
        return;
      }
      const sel = this._breedSelection[slotIndex];
      if (!sel.a || !sel.b) {
        this.showFarmNotification("Select both parents first!");
        return;
      }
      if (sel.a === sel.b) {
        this.showFarmNotification("Parents must be different animals!");
        return;
      }
      const parentA = this.farmState.animals.find((a) => a.id === sel.a);
      if (parentA) {
        const owned = this.farmState.animals.filter(
          (a) => a.type === parentA.type,
        ).length;
        if (owned >= 20) {
          this.showFarmNotification(
            "Max 20 " +
              (this.farmAnimalDefs[parentA.type]?.name || parentA.type) +
              "! Free up space first.",
          );
          return;
        }
        if (owned >= 18) {
          this.showFarmNotification(
            "Warning: " +
              owned +
              "/20 slots used. Offspring may be lost if full!",
          );
        }
      }
      const program = this._breedProgram || "quick";
      return this.startBreeding(slotIndex, sel.a, sel.b, program);
    }

    // Build breeding preview showing possible trait outcomes
    getBreedingPreview(parentAId, parentBId, programKey) {
      const fs = this.farmState;
      const parentA = fs.animals.find((a) => a.id === parentAId);
      const parentB = fs.animals.find((a) => a.id === parentBId);
      if (!parentA || !parentB) return "";
      if (parentA.type !== parentB.type)
        return '<div class="breed-preview-warn">Parents must be same type!</div>';

      const prog =
        this.farmBreedPrograms[programKey] || this.farmBreedPrograms.quick;
      const def = this.farmAnimalDefs[parentA.type];
      const owned = fs.animals.filter((a) => a.type === parentA.type).length;
      const cost = Math.floor(def.baseCost * prog.costMult);
      const hasMentor =
        parentA.traits.includes("mentor") || parentB.traits.includes("mentor");
      const isPremium = fs.feedPlans[parentA.type] === "premium";
      const possibleVariants =
        parentA.variant && parentB.variant
          ? [parentA.variant, parentB.variant]
          : parentA.variant || parentB.variant
            ? [null, parentA.variant || parentB.variant]
            : [null, ...this.farmVariants[parentA.type].map((v) => v.name)];
      const capacities = possibleVariants.map((variant) =>
        this.getBreedingTraitCapacity(parentA, parentB, prog, variant),
      );
      const traitSlots = Math.min(...capacities),
        maxTraitSlots = Math.max(...capacities);
      const rareBonus = prog.rareBonus + (isPremium ? 0.05 : 0);
      const variantChance = programKey === "long" ? 0.15 : 0.08;

      const inheritPool = [...new Set([...parentA.traits, ...parentB.traits])];
      const inheritDefs = inheritPool
        .map((t) => this.farmTraitDefs.find((x) => x.id === t))
        .filter(Boolean);
      const rarityColors = {
        common: "#81c784",
        rare: "#64b5f6",
        epic: "#ce93d8",
      };

      // Variant info
      let variantInfo = "";
      if (
        parentA.variant &&
        parentB.variant &&
        parentA.variant === parentB.variant
      ) {
        variantInfo = `<span style="color:#fccb72;">Guaranteed: ${parentA.variant}</span>`;
      } else if (parentA.variant && parentB.variant) {
        variantInfo = `<span style="color:rgba(255,234,182,0.6);">50% each: ${parentA.variant} / ${parentB.variant}</span>`;
      } else if (parentA.variant || parentB.variant) {
        variantInfo = `<span style="color:rgba(255,234,182,0.6);">50%: ${parentA.variant || parentB.variant}</span>`;
      } else {
        variantInfo = `<span style="color:rgba(255,234,182,0.3);">${variantChance * 100}% random</span>`;
      }

      // Program-specific mechanic description
      const mechanicHtml = {
        quick: `<div class="breed-preview-mechanic">
          <span class="breed-mech-tag" style="background:rgba(129,199,132,0.15);color:#81c784;">80% Inherit</span>
          <span class="breed-mech-desc">High chance to pass parent traits. No mutation — offspring only gets what parents have or common traits.</span>
        </div>`,
        standard: `<div class="breed-preview-mechanic">
          <span class="breed-mech-tag" style="background:rgba(100,181,246,0.15);color:#64b5f6;">60/40 Balanced</span>
          <span class="breed-mech-desc">60% inherit from parents (rarity-weighted), 40% mutation chance. Can discover new rare/epic traits.</span>
        </div>`,
        long: `<div class="breed-preview-mechanic">
          <span class="breed-mech-tag" style="background:rgba(206,147,216,0.15);color:#ce93d8;">Guaranteed Best</span>
          <span class="breed-mech-desc">Best trait from each parent is guaranteed. Extra slot is a pure mutation with boosted rare/epic rates. 15% variant chance.</span>
        </div>`,
      };

      // Trait slot breakdown per program
      let slotBreakdown = "";
      if (programKey === "long") {
        const bestA = this._getBestTrait(parentA.traits);
        const bestB = this._getBestTrait(
          parentB.traits.filter((t) => t !== bestA),
        );
        const bestADef = bestA
          ? this.farmTraitDefs.find((t) => t.id === bestA)
          : null;
        const bestBDef = bestB
          ? this.farmTraitDefs.find((t) => t.id === bestB)
          : null;
        slotBreakdown = `<div class="breed-preview-slots">
          <div class="breed-slot-plan"><span class="breed-slot-num">1</span> ${bestADef ? `<span style="color:${rarityColors[bestADef.rarity]}">${bestADef.name}</span> <span class="breed-slot-guaranteed">guaranteed</span>` : "Random (no parent A traits)"}</div>
          <div class="breed-slot-plan"><span class="breed-slot-num">2</span> ${bestBDef ? `<span style="color:${rarityColors[bestBDef.rarity]}">${bestBDef.name}</span> <span class="breed-slot-guaranteed">guaranteed</span>` : "Random (no parent B traits)"}</div>
          <div class="breed-slot-plan"><span class="breed-slot-num">3</span> Mutation <span style="color:#64b5f6;">(${((rareBonus + 0.02 + 0.015) * 100).toFixed(1)}% rare+)</span></div>
          ${hasMentor ? `<div class="breed-slot-plan"><span class="breed-slot-num">4</span> Mentor bonus — Mutation</div>` : ""}
          ${traitSlots > Math.min(prog.traitSlots + (hasMentor ? 1 : 0), 4) ? `<div class="breed-slot-plan"><span class="breed-slot-num">${traitSlots}</span> Variant bonus — Mutation</div>` : ""}
        </div>`;
      } else if (programKey === "quick") {
        slotBreakdown = `<div class="breed-preview-slots">`;
        for (let s = 0; s < traitSlots; s++) {
          slotBreakdown += `<div class="breed-slot-plan"><span class="breed-slot-num">${s + 1}</span> 80% from parents (weighted by rarity) / 20% random common</div>`;
        }
        slotBreakdown += `</div>`;
      } else {
        slotBreakdown = `<div class="breed-preview-slots">`;
        for (let s = 0; s < traitSlots; s++) {
          slotBreakdown += `<div class="breed-slot-plan"><span class="breed-slot-num">${s + 1}</span> 60% inherit / 40% mutation <span style="color:#64b5f6;">(${((rareBonus + 0.015) * 100).toFixed(1)}% rare+)</span></div>`;
        }
        slotBreakdown += `</div>`;
      }

      let html = `<div class="breed-preview">
        <div class="breed-preview-header">Outcome Preview</div>

        ${mechanicHtml[programKey] || ""}

        <div class="breed-preview-grid">
          <div class="breed-preview-cell">
            <span class="breed-preview-label">Cost</span>
            <span class="breed-preview-value">${this.formatNumber(cost)}</span>
          </div>
          <div class="breed-preview-cell">
            <span class="breed-preview-label">Slots</span>
            <span class="breed-preview-value">${traitSlots}${maxTraitSlots > traitSlots ? "–" + maxTraitSlots : ""}${hasMentor ? " <small>(includes Mentor)</small>" : ""}</span>
          </div>
          <div class="breed-preview-cell">
            <span class="breed-preview-label">Capacity</span>
            <span class="breed-preview-value" style="color:${owned >= 19 ? "#fd9193" : owned >= 17 ? "#fccb72" : "#81c784"}">${owned}/20</span>
          </div>
          <div class="breed-preview-cell">
            <span class="breed-preview-label">Variant</span>
            <span class="breed-preview-value">${variantInfo}</span>
          </div>
        </div>

        <div class="breed-preview-section">
          <div class="breed-preview-subtitle">Slot Breakdown</div>
          ${slotBreakdown}
        </div>

        ${
          inheritDefs.length > 0
            ? `<div class="breed-preview-section">
          <div class="breed-preview-subtitle">Parent Traits in Pool</div>
          ${inheritDefs
            .map((td) => {
              const fromA = parentA.traits.includes(td.id);
              const fromB = parentB.traits.includes(td.id);
              return `<div class="breed-preview-trait">
              <span class="breed-preview-trait-dot" style="background:${rarityColors[td.rarity]}"></span>
              <span class="breed-preview-trait-name" style="color:${rarityColors[td.rarity]}">${td.name}</span>
              <span class="breed-preview-trait-rarity">${td.rarity}</span>
              <span class="breed-preview-trait-from">${fromA && fromB ? "A+B" : fromA ? "A" : "B"}</span>
              <span class="breed-preview-trait-desc">${this.getTraitDescription(td)}</span>
            </div>`;
            })
            .join("")}
        </div>`
            : '<div class="breed-preview-empty">No parent traits. All slots will be random.</div>'
        }

        ${isPremium ? `<div class="breed-preview-bonus">Premium Feed: +5% rare chance on mutations</div>` : ""}
        <div class="breed-preview-mechanic">Offspring with a trait-slot variant receive +1 slot, including beyond the normal 4-slot limit.</div>
      </div>`;

      return html;
    }

    tickBreeding(deltaSeconds) {
      const fs = this.farmState;
      // Reduce breed cooldowns
      for (const animal of fs.animals) {
        if (animal.breedCooldown > 0 && !this.isAnimalBreeding(animal.id)) {
          animal.breedCooldown = Math.max(
            0,
            animal.breedCooldown - deltaSeconds,
          );
        }
      }
      for (let i = 0; i < fs.breeding.slots.length; i++) {
        const slot = fs.breeding.slots[i];
        if (!slot.active) continue;
        slot.progress += deltaSeconds;
        if (slot.progress >= slot.duration - 1e-7) {
          slot.progress = Math.max(slot.progress, slot.duration);
          this.completeBreeding(i);
        }
      }
    }

    completeBreeding(slotIndex) {
      this.settleBeforeMutation();
      const fs = this.farmState;
      const slot = fs.breeding.slots[slotIndex];
      if (!slot?.active || slot.progress < slot.duration) return false;
      const parentA = fs.animals.find((a) => a.id === slot.parentA);
      const parentB = fs.animals.find((a) => a.id === slot.parentB);
      if (
        !parentA ||
        !parentB ||
        parentA.id === parentB.id ||
        parentA.type !== parentB.type ||
        !Object.hasOwn(this.farmBreedPrograms, slot.program)
      ) {
        slot.active = false;
        this.updateFarmDisplay();
        this.requestSave();
        return false;
      }

      const prog = this.farmBreedPrograms[slot.program];
      const type = parentA.type;
      const def = this.farmAnimalDefs[type];
      const owned = fs.animals.filter((a) => a.type === type);
      // Cooldowns begin after the program finishes, including a full-barn outcome.
      for (const parent of [parentA, parentB]) {
        const sturdy = this.getActiveFarmTraitEffect("sturdy", [parent]);
        parent.breedCooldown =
          3600 *
          (1 + (sturdy?.value || 0)) *
          (fs.feedPlans[parent.type] === "ration" ? 0.75 : 1);
      }
      if (owned.length >= 20) {
        this.showFarmNotification("Max 20 " + def.name + "! Offspring lost.");
        slot.active = false;
        this.updateFarmDisplay();
        this.requestSave();
        return;
      }

      // Roll variant (Long program gets 15% chance instead of 8%)
      const variantChance = slot.program === "long" ? 0.15 : 0.08;
      const variant = this.rollVariant(parentA, parentB, type, variantChance);
      const traits = this.rollBreedingTraits(parentA, parentB, prog, variant);

      const offspring = {
        id: type + "_" + this.farmNextAnimalId++,
        type,
        name: def.name + " #" + (owned.length + 1),
        traits,
        variant,
        passport: null,
        productionTimer: 0,
        feedPlan: "standard",
        breedCooldown: 0,
      };
      fs.animals.push(offspring);
      slot.active = false;
      slot.progress = 0;
      this.gainMasteryXP(40);
      fs.stats.totalBred++;

      // Check for rare/epic traits for extra XP
      for (const traitId of traits) {
        const tdef = this.farmTraitDefs.find((t) => t.id === traitId);
        if (tdef && tdef.rarity === "rare") this.gainMasteryXP(30);
        if (tdef && tdef.rarity === "epic") this.gainMasteryXP(100);
      }

      this.rollFarmCrate();
      this.showFarmNotification("New " + def.name + " bred: " + offspring.name);
      this.updateFarmDisplay();
      this.requestSave();
      return true;
    }

    _getTraitRarityWeight(traitId) {
      const td = this.farmTraitDefs.find((t) => t.id === traitId);
      if (!td) return 1;
      if (td.rarity === "epic") return 6;
      if (td.rarity === "rare") return 3;
      return 1;
    }

    _pickWeightedTrait(traitList) {
      // Pick from a list of trait IDs, weighted by rarity (higher rarity = more likely to be inherited)
      if (!traitList || traitList.length === 0) return null;
      const weights = traitList.map((t) => this._getTraitRarityWeight(t));
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let roll = this.timeRandom() * totalWeight;
      for (let i = 0; i < traitList.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return traitList[i];
      }
      return traitList[traitList.length - 1];
    }

    _getBestTrait(traitList) {
      // Return the highest-rarity trait from a list
      if (!traitList || traitList.length === 0) return null;
      const order = { epic: 3, rare: 2, common: 1 };
      let best = traitList[0];
      let bestRank = 0;
      for (const t of traitList) {
        const td = this.farmTraitDefs.find((d) => d.id === t);
        const rank = td ? order[td.rarity] || 0 : 0;
        if (rank > bestRank) {
          best = t;
          bestRank = rank;
        }
      }
      return best;
    }

    getBreedingTraitCapacity(parentA, parentB, program, variant = null) {
      const hasMentor =
        parentA.traits.includes("mentor") || parentB.traits.includes("mentor");
      const effect = this.farmVariants[parentA.type]?.find(
        (v) => v.name === variant,
      )?.effect;
      return (
        Math.min(program.traitSlots + (hasMentor ? 1 : 0), 4) +
        (effect?.traitSlot || 0)
      );
    }

    rollBreedingTraits(parentA, parentB, program, variant = null) {
      const slots = this.getBreedingTraitCapacity(
        parentA,
        parentB,
        program,
        variant,
      );
      const traits = [];
      const isPremium = this.farmState.feedPlans[parentA.type] === "premium";
      const rareBonus = program.rareBonus + (isPremium ? 0.05 : 0);
      const programKey =
        program === this.farmBreedPrograms.quick
          ? "quick"
          : program === this.farmBreedPrograms.long
            ? "long"
            : "standard";

      const allParentTraits = [
        ...new Set([...parentA.traits, ...parentB.traits]),
      ];

      if (programKey === "quick") {
        // QUICK: High inherit (80%), NO mutation — predictable trait transfer
        for (let i = 0; i < slots; i++) {
          let candidate = null;
          if (allParentTraits.length > 0 && this.timeRandom() < 0.8) {
            // Weighted pick from parent pool (rarer traits more likely to be picked)
            const pool = allParentTraits.filter((t) => !traits.includes(t));
            candidate = pool.length > 0 ? this._pickWeightedTrait(pool) : null;
          }
          if (!candidate) {
            // Random common only (no mutation to rare/epic in Quick)
            const commons = this.farmTraitDefs.filter(
              (t) => t.rarity === "common" && !traits.includes(t.id),
            );
            candidate =
              commons.length > 0
                ? commons[Math.floor(this.timeRandom() * commons.length)].id
                : null;
          }
          if (candidate && !traits.includes(candidate)) traits.push(candidate);
        }
      } else if (programKey === "long") {
        // LONG: Guaranteed best from each parent + mutation slots
        // Slot 1: Best trait from Parent A (guaranteed)
        const bestA = this._getBestTrait(parentA.traits);
        if (bestA) traits.push(bestA);

        // Slot 2: Best trait from Parent B (not already taken)
        const bestB = this._getBestTrait(
          parentB.traits.filter((t) => !traits.includes(t)),
        );
        if (bestB) traits.push(bestB);
        else if (parentB.traits.length > 0) {
          // If bestB was duplicate, pick next best
          const remaining = parentB.traits.filter((t) => !traits.includes(t));
          if (remaining.length > 0)
            traits.push(this._pickWeightedTrait(remaining));
        }

        // Remaining slots: pure mutation with boosted rates
        const longMutationBonus = rareBonus + 0.02; // extra +2% rare for Long
        while (traits.length < slots) {
          const mutation = this.rollNewTrait(longMutationBonus, traits);
          if (mutation) traits.push(mutation);
          else break;
        }
      } else {
        // STANDARD: Balanced — inherit with rarity weighting + mutation chance
        for (let i = 0; i < slots; i++) {
          let candidate = null;
          if (allParentTraits.length > 0 && this.timeRandom() < 0.6) {
            // 60% inherit from parents, weighted by rarity
            const pool = allParentTraits.filter((t) => !traits.includes(t));
            candidate = pool.length > 0 ? this._pickWeightedTrait(pool) : null;
          }
          if (!candidate) {
            // 40% mutation — full rarity roll
            candidate = this.rollNewTrait(rareBonus, traits);
          }
          if (candidate && !traits.includes(candidate)) traits.push(candidate);
        }
      }

      return traits.slice(0, slots);
    }

    rollVariant(parentA, parentB, type, variantChance) {
      const baseChance = variantChance || 0.08;
      // Both parents same variant → guaranteed
      if (
        parentA.variant &&
        parentB.variant &&
        parentA.variant === parentB.variant
      ) {
        return parentA.variant;
      }
      // Both parents have different variants → 50% either
      if (parentA.variant && parentB.variant) {
        return this.timeRandom() < 0.5 ? parentA.variant : parentB.variant;
      }
      // One parent has variant → 50% inherit
      if (parentA.variant || parentB.variant) {
        if (this.timeRandom() < 0.5) return parentA.variant || parentB.variant;
        return null;
      }
      // Neither parent → random chance
      if (this.timeRandom() < baseChance) {
        const variants = this.farmVariants[type];
        if (variants && variants.length > 0) {
          return variants[Math.floor(this.timeRandom() * variants.length)].name;
        }
      }
      return null;
    }

    // --- Mastery XP ---
    gainMasteryXP(amount) {
      this.settleBeforeMutation();
      const fs = this.farmState;
      fs.mastery.xp += amount;
      while (fs.mastery.level < 20) {
        const required = Math.floor(100 * Math.pow(fs.mastery.level + 1, 1.8));
        if (fs.mastery.xp >= required) {
          fs.mastery.xp -= required;
          fs.mastery.level++;
          this.showFarmNotification(
            "Farm Mastery Level " + fs.mastery.level + "!",
          );
          // Level 20 bonus: +5% CpS permanently
          if (fs.mastery.level === 20) {
            this.showFarmNotification("Master Farmer! +5% CpS permanently!");
          }
        } else {
          break;
        }
      }
      this.updateFarmMasteryBadge();
      this.updateDisplay(!this._settlingTime);
    }

    updateFarmMasteryBadge() {
      if (!this.canPresent()) return;
      const badge = document.getElementById("farm-mastery-badge");
      if (!badge) return;
      const fs = this.farmState;
      const level = fs.mastery.level;
      const xp = fs.mastery.xp;
      const nextXp =
        level >= 20 ? 0 : Math.floor(100 * Math.pow(level + 1, 1.8));
      const pct =
        level >= 20 ? 100 : Math.max(0, Math.min(100, (xp / nextXp) * 100));
      badge.innerHTML = `<span title="${this.getFarmTooltip("mastery")}">Lv. ${level}</span>
        <div class="farm-mastery-xp-bar"><div class="farm-mastery-xp-fill" style="width:${pct}%"></div></div>
        <span class="farm-mastery-xp-text" style="font-size:0.52rem;color:rgba(255,234,182,0.4);">${level >= 20 ? "MAX" : this.formatNumber(xp) + "/" + this.formatNumber(nextXp)}</span>`;
    }

    // --- Crate System ---
    rollFarmCrate() {
      // Keep base tier probabilities; Keen Eye is a relative, once-per-Farm bonus.
      const keenEye = this.getActiveFarmTraitEffect("keen_eye");
      const roll = this.timeRandom() / (1 + (keenEye?.value || 0));
      let tier = null;
      if (roll < 0.0005) tier = "epic";
      else if (roll < 0.0035) tier = "gold";
      else if (roll < 0.0185) tier = "silver";
      else if (roll < 0.0685) tier = "wooden";
      if (!tier) return;
      this.farmState.crates.push({ tier, id: "crate_" + this.getGameTime() });
      this.showFarmNotification("Found a " + tier + " crate!");
    }

    openFarmCrate(crateId) {
      this.settleBeforeMutation();
      const fs = this.farmState;
      const idx = fs.crates.findIndex((c) => c.id === crateId);
      if (idx === -1) return;
      const crate = fs.crates.splice(idx, 1)[0];

      let donutReward = 0;
      const cps = this.totalPerSecond;
      if (crate.tier === "wooden") {
        donutReward = Math.floor(cps * 60);
        this.addRandomGoods(1, 3);
        this.gainMasteryXP(10);
      } else if (crate.tier === "silver") {
        donutReward = Math.floor(cps * 300);
        this.addRandomGoods(3, 6);
        if (this.timeRandom() < 0.2)
          this.applyFarmBuff(this.generateBuffReward(fs.mastery.level));
        this.gainMasteryXP(25);
      } else if (crate.tier === "gold") {
        donutReward = Math.floor(cps * 900);
        this.addRandomGoods(5, 10);
        if (this.timeRandom() < 0.5) {
          this.showFarmNotification("Passport rewards are not available yet.");
        }
        this.gainMasteryXP(60);
      } else if (crate.tier === "epic") {
        donutReward = Math.floor(cps * 1800);
        this.addRandomGoods(5, 10);
        this.gainMasteryXP(150);
        this.showFarmNotification(
          "Epic crate! Passport rewards are not available yet.",
        );
      }
      this.creditDonuts(donutReward);
      this.showFarmNotification(
        "Crate opened! +" + this.formatNumber(donutReward) + " donuts",
      );
      this.updateFarmDisplay();
      this.updateDisplay(!this._settlingTime);
      this.requestSave();
    }

    addRandomGoods(min, max) {
      const fs = this.farmState;
      const goods = Object.keys(fs.storage);
      const count = min + Math.floor(this.timeRandom() * (max - min + 1));
      for (let i = 0; i < count; i++) {
        const good = goods[Math.floor(this.timeRandom() * goods.length)];
        const cap = this.getEffectiveStorageCap(good);
        fs.storage[good] = Math.min(fs.storage[good] + 1, cap);
      }
    }

    // --- Contract Reroll ---
    rerollContracts() {
      this.settleBeforeMutation();
      const fs = this.farmState;
      if (fs.contracts.rerollsUsed >= 3) {
        this.showFarmNotification("Max rerolls reached this cycle!");
        return;
      }
      if (fs.contracts.rerollsUsed > 0) {
        const cost = Math.floor(this.donutCount * 0.01);
        if (this.donutCount < cost) return;
        this.donutCount -= cost;
      }
      fs.contracts.rerollsUsed++;
      this.generateContractBoard();
      this.updateFarmDisplay();
      this.updateDisplay(!this._settlingTime);
      this.requestSave();
    }

    // --- Auto-collect (FC 60 + Mastery 13) ---
    tickAutoCollect() {
      const fs = this.farmState;
      if (this.getFarmCount() < 60 || fs.mastery.level < 13) return;
      for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
        const good = def.good;
        const cap = this.getEffectiveStorageCap(good);
        if (fs.storage[good] >= cap * 0.8 - 1e-8 && fs.storage[good] > 0) {
          // Auto-sell when storage >= 80% (no crate drop for auto)
          const amount = Math.floor(fs.storage[good]);
          if (amount <= 0) continue;
          const price = this.getSellPrice(good);
          const total = amount * price;
          fs.storage[good] -= amount;
          this.creditDonuts(total);
          fs.stats.totalGoodsSold += amount;
        }
      }
    }

    // --- Contract Cancel ---
    cancelContract(contractId) {
      this.settleBeforeMutation();
      const fs = this.farmState;
      const idx = fs.contracts.active.findIndex((c) => c.id === contractId);
      if (idx === -1) return;
      const contract = fs.contracts.active.splice(idx, 1)[0];
      // Return 80% of submitted goods
      for (const [good, qty] of Object.entries(contract.requirements)) {
        const returned = Math.floor(qty * 0.8);
        const cap = this.getEffectiveStorageCap(good);
        fs.storage[good] = Math.min(fs.storage[good] + returned, cap);
      }
      this.showFarmNotification("Contract cancelled. 80% goods returned.");
      this.updateFarmDisplay();
      this.requestSave();
    }

    // --- Tooltip descriptions ---
    getFarmTooltip(key) {
      const tips = {
        // Feed plans
        feedStandard: "Standard Feed: Free. Normal production speed (1x).",
        feedRation:
          "Ration Feed: 0.7x production, 25% shorter post-breeding cooldown (stacks multiplicatively with Sturdy). Cost scales with your income (~0.08% CpS per type). Efficient trait reduces cost.",
        feedPremium:
          "Premium Feed: 1.4x production + 5% rare breed chance. Cost scales with your income (~0.35% CpS per type). Efficient trait reduces cost.",
        // Buffs
        PROD: "Production Buff: Increases all farm animal production speed.",
        COST: "Cost Buff: Reduces building purchase costs.",
        OFFLINE: "Offline Buff: Boosts offline donut production efficiency.",
        QOL: "Quality of Life Buff: Auto-collect, instant breed queue.",
        EVENT: "Event Buff: Special effects like 2x click value.",
        // Care
        care: "Care Window: Every 12 min, a 90s window opens. Pet or feed your animals for production boosts!",
        carePet: "Pet & Groom: +25% production for 2 production cycles. Free!",
        careTreat:
          "Feed Treat: +40% production for 3 cycles. Costs 0.1% of your donuts.",
        // Mastery
        mastery:
          "Farm Mastery: Earn XP by selling goods, completing contracts, and breeding. Each level gives +5 storage and unlocks new features!",
        // Contracts
        contractRush: "Rush: 3-5 min, small reward. Quick and easy.",
        contractStandard: "Standard: 8-15 min, medium reward + possible buff.",
        contractLonghaul: "Long Haul: 45-90 min, big reward + guaranteed buff.",
        // Breeding
        breeding:
          "Breeding: Select 2 animals of the same type to breed. Offspring inherit traits from parents!",
        breedQuick:
          "Quick: 30min, 3x cost, 2 slots. 80% inherit from parents, no mutation. Predictable trait transfer.",
        breedStandard:
          "Standard: 2h, 5x cost, 2 slots. 60% inherit, 40% mutation with rare/epic chance. Balanced.",
        breedLong:
          "Long: 4h, 8x cost, 3 slots. Guaranteed best trait from each parent + mutation slot. 15% variant chance.",
        // Animals
        chicken:
          "Chicken: Produces 1 egg every 45s. Fast & cheap, bread-and-butter income.",
        cow: "Cow: Produces 1 milk every 90s. Balanced; milk used in most contracts.",
        sheep:
          "Sheep: Produces 1 wool every 150s. Slow but high-value for premium contracts.",
        bees: "Bees: Produces 1 honey every 30s. Fastest producer but tiny storage!",
        pigs: "Pigs: Produces 1 truffle every 300s. Slowest but premium value.",
        // Buff tooltips (with buff_ prefix for contract/collection display)
        buff_PROD:
          "Production Buff: Increases all farm animal production speed.",
        buff_COST: "Cost Buff: Reduces building purchase costs.",
        buff_OFFLINE:
          "Offline Buff: Boosts offline donut production efficiency.",
        buff_QOL:
          "Quality of Life Buff: Auto-collect, instant breed queue, etc.",
        buff_EVENT: "Event Buff: Special effects like 2x click value.",
      };
      const unavailable = ["COST", "OFFLINE", "QOL", "EVENT"].some(
        (cat) => key === cat || key === "buff_" + cat,
      );
      return unavailable
        ? "Unavailable: this buff's effect is not implemented yet."
        : tips[key] || "";
    }

    // --- Display Updates ---
    isFarmPanelOpen() {
      if (!this.canPresent()) return false;
      const panel = document.getElementById("farm-panel");
      return !!(
        this.footerContainer?.classList.contains("visible") &&
        !this.footerContainer.classList.contains("hidden") &&
        panel &&
        !panel.classList.contains("hidden")
      );
    }

    updateFarmDisplay() {
      if (!this.canPresent()) return;
      return this.withProductionSnapshot(() => {
        // Presentation sleeps while closed; settlement owns Farm simulation.
        if (!this.isFarmPanelOpen()) return;
        const fc = this.getFarmCount();
        if (fc < 1) return;
        // Only update the active tab for performance
        if (this.farmActiveTab === "barn") this.updateFarmBarnTab();
        else if (this.farmActiveTab === "contracts")
          this.updateFarmContractsTab();
        else if (this.farmActiveTab === "breeding")
          this.updateFarmBreedingTabSmart();
        else if (this.farmActiveTab === "collection")
          this.updateFarmCollectionTab();
        this.updateFarmKPIs();
      }, this.getGameTime());
    }

    updateFarmBarnTab() {
      const grid = document.getElementById("farm-animal-grid");
      const storageSection = document.getElementById("farm-storage-section");
      if (!grid || !storageSection) return;

      // If DOM already has content, try partial update (preserves scroll, inputs, focus)
      const signature = this.getFarmRosterSignature();
      if (
        grid.children.length > 0 &&
        grid.dataset.rosterSignature === signature &&
        grid.querySelector(".farm-type-block")
      ) {
        this._partialUpdateBarnTab(grid, storageSection);
        return;
      }

      // Full render (first time or after structural change)
      this._fullRenderBarnTab(grid, storageSection);
      grid.dataset.rosterSignature = signature;
    }

    _fullRenderBarnTab(grid, storageSection) {
      const fc = this.getFarmCount();
      const fs = this.farmState;
      if (!this._expandedAnimalTypes) this._expandedAnimalTypes = {};

      let animalHtml = "";
      for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
        const owned = fs.animals.filter((a) => a.type === type);
        const unlocked = fc >= def.unlockFC;
        const cost = this.getAnimalCost(type);
        const canAfford = this.donutCount >= cost;
        const isExpanded = this._expandedAnimalTypes[type] && owned.length > 0;

        const uniqueTraits = [];
        for (const animal of owned) {
          for (const traitId of animal.traits) {
            if (!uniqueTraits.includes(traitId)) uniqueTraits.push(traitId);
          }
        }

        const good = def.good;
        const cap = this.getEffectiveStorageCap(good);
        const storagePct =
          cap > 0 ? Math.min(100, (fs.storage[good] / cap) * 100) : 0;
        const prodPerMin =
          owned.length > 0
            ? (
                (owned.length / def.prodInterval) *
                this.getProductionModifier(type) *
                60
              ).toFixed(1)
            : "0";

        const plan = fs.feedPlans[type] || "standard";
        let feedCostStr = "";
        if (plan !== "standard" && owned.length > 0) {
          const costPerSec = this.getFeedCostPerSecond(type);
          const cpsPct =
            this.totalPerSecond > 0
              ? ((costPerSec / this.totalPerSecond) * 100).toFixed(2)
              : "0";
          feedCostStr = `<span class="farm-feed-cost" data-feed-cost="${type}">-${this.formatNumber(Math.ceil(costPerSec))}/s <span class="farm-feed-pct">(${cpsPct}%)</span></span>`;
        }

        animalHtml += `
          <div class="farm-type-block" data-type="${type}">
            <div class="farm-animal-card ${!unlocked ? "locked" : ""}" data-animal="${type}" title="${this.getFarmTooltip(type)}">
              <img src="img/farm${type.charAt(0).toUpperCase() + type.slice(1)}.webp" alt="${def.name}" class="farm-animal-icon" />
              <div class="farm-animal-info">
                <div class="farm-animal-header-row">
                  <span class="farm-animal-name">${def.name}${!unlocked ? " (Need " + def.unlockFC + " farms)" : ""}</span>
                  ${owned.length > 0 ? `<span class="farm-roster-toggle" onclick="event.stopPropagation();window._game.toggleAnimalRoster('${type}')" title="View individual animals">${isExpanded ? "▾" : "▸"} ${owned.length}</span>` : ""}
                </div>
                <span class="farm-animal-count" data-count="${type}">${owned.length > 0 ? `<strong>${owned.length}</strong>/20 | ${prodPerMin} ${def.good}/min` : "Owned: 0"}</span>
                ${
                  uniqueTraits.length > 0
                    ? `<div class="farm-animal-traits">
                  ${uniqueTraits
                    .slice(0, 5)
                    .map((t) => {
                      const tdef = this.farmTraitDefs.find((td) => td.id === t);
                      return tdef
                        ? `<span class="farm-trait-badge ${tdef.rarity}" title="${tdef.name}: ${this.getTraitDescription(tdef)}">${tdef.name}</span>`
                        : "";
                    })
                    .join(
                      "",
                    )}${uniqueTraits.length > 5 ? `<span class="farm-trait-badge more">+${uniqueTraits.length - 5}</span>` : ""}
                </div>`
                    : ""
                }
                <div class="farm-progress"><div class="farm-progress-bar" data-bar="${type}" style="width:${storagePct}%"></div></div>
              </div>
              <div class="farm-animal-actions">
                <button class="farm-btn farm-btn-buy" data-buy="${type}" onclick="window._game.buyAnimal('${type}')" ${!unlocked || !canAfford || owned.length >= 20 ? "disabled" : ""}>
                  <img src="img/donutMoney.webp" class="donut-money-icon" /> ${this.formatNumber(cost)}
                </button>
                ${
                  unlocked && owned.length > 0
                    ? `
                  <div class="farm-feed-select">
                    <button class="farm-feed-btn ${plan === "standard" ? "active" : ""}" onclick="window._game.setFeedPlan('${type}','standard')" title="Free. Normal 1x production.">Std</button>
                    ${fc >= 15 ? `<button class="farm-feed-btn ${plan === "ration" ? "active" : ""}" onclick="window._game.setFeedPlan('${type}','ration')" title="${this.getFarmTooltip("feedRation")}">Ration</button>` : ""}
                    ${fc >= 40 ? `<button class="farm-feed-btn ${plan === "premium" ? "active" : ""}" onclick="window._game.setFeedPlan('${type}','premium')" title="2% cost, 1.4x prod, +5% rare breed">Prem</button>` : ""}
                  </div>
                  ${feedCostStr}
                `
                    : ""
                }
              </div>
            </div>
            ${isExpanded ? this.renderAnimalRoster(type, owned) : ""}
          </div>
        `;
      }
      grid.innerHTML = animalHtml;
      this._renderStorageBars(storageSection);
    }

    _partialUpdateBarnTab(grid, storageSection) {
      const fc = this.getFarmCount();
      const fs = this.farmState;

      for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
        const owned = fs.animals.filter((a) => a.type === type);
        const good = def.good;
        const cap = this.getEffectiveStorageCap(good);
        const storagePct =
          cap > 0 ? Math.min(100, (fs.storage[good] / cap) * 100) : 0;
        const prodPerMin =
          owned.length > 0
            ? (
                (owned.length / def.prodInterval) *
                this.getProductionModifier(type) *
                60
              ).toFixed(1)
            : "0";

        // Update progress bar
        const bar = grid.querySelector(`[data-bar="${type}"]`);
        if (bar) bar.style.width = storagePct + "%";

        // Update count & prod/min
        const countEl = grid.querySelector(`[data-count="${type}"]`);
        if (countEl)
          countEl.innerHTML =
            owned.length > 0
              ? `<strong>${owned.length}</strong>/20 | ${prodPerMin} ${def.good}/min`
              : "Owned: 0";

        // Update buy button cost & affordability
        const buyBtn = grid.querySelector(`[data-buy="${type}"]`);
        if (buyBtn) {
          const cost = this.getAnimalCost(type);
          const canAfford = this.donutCount >= cost;
          const unlocked = fc >= def.unlockFC;
          buyBtn.disabled = !unlocked || !canAfford || owned.length >= 20;
          const textNode = buyBtn.lastChild;
          if (textNode) textNode.textContent = " " + this.formatNumber(cost);
        }

        // Update feed cost (scales with CpS so must refresh every tick)
        const plan = fs.feedPlans[type] || "standard";
        const feedCostEl = grid.querySelector(`[data-feed-cost="${type}"]`);
        if (feedCostEl && plan !== "standard" && owned.length > 0) {
          const costPerSec = this.getFeedCostPerSecond(type);
          const cpsPct =
            this.totalPerSecond > 0
              ? ((costPerSec / this.totalPerSecond) * 100).toFixed(2)
              : "0";
          feedCostEl.innerHTML = `-${this.formatNumber(Math.ceil(costPerSec))}/s <span class="farm-feed-pct">(${cpsPct}%)</span>`;
        }

        // Update cooldown tags in roster (lightweight, no re-render)
        const roster = grid.querySelector(
          `.farm-type-block[data-type="${type}"] .farm-roster`,
        );
        if (roster) {
          for (const animal of owned) {
            if (animal.breedCooldown > 0) {
              const row = roster.querySelector(
                `[data-animal-id="${animal.id}"] .farm-cooldown-tag`,
              );
              if (row)
                row.textContent = this.formatDuration(
                  Math.ceil(animal.breedCooldown),
                );
            }
          }
        }
      }

      // Storage section — always safe to update
      this._renderStorageBars(storageSection);
    }

    _renderStorageBars(storageSection) {
      const fs = this.farmState;
      let storageHtml = "<h4>Storage</h4>";
      for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
        const good = def.good;
        const cap = this.getEffectiveStorageCap(good);
        const current = Math.floor(fs.storage[good] || 0);
        const pct = cap > 0 ? Math.min(100, (current / cap) * 100) : 0;
        const isFull = current >= cap;

        storageHtml += `
          <div class="farm-storage-row">
            <span class="farm-storage-label">${good}</span>
            <div class="farm-storage-bar-wrap">
              <div class="farm-storage-bar-fill ${isFull ? "full" : ""}" style="width:${pct}%"></div>
            </div>
            <span class="farm-storage-text">${current} / ${cap}</span>
          </div>
        `;
      }
      storageSection.innerHTML = storageHtml;
    }

    _forceBarnFullRender() {
      const grid = document.getElementById("farm-animal-grid");
      // Preserve invalidation for the next open without rebuilding hidden markup.
      if (grid) delete grid.dataset.rosterSignature;
      if (!this.isFarmPanelOpen()) return;
      if (grid) grid.innerHTML = "";
      this.updateFarmBarnTab();
    }

    toggleAnimalRoster(type) {
      if (!this._expandedAnimalTypes) this._expandedAnimalTypes = {};
      this._expandedAnimalTypes[type] = !this._expandedAnimalTypes[type];
      this._forceBarnFullRender();
    }

    renderAnimalRoster(type, animals) {
      if (!animals || animals.length === 0) return "";
      let html = '<div class="farm-roster">';
      for (const animal of animals) {
        const tdef = this.farmAnimalDefs[type];
        const cooldownLeft =
          animal.breedCooldown > 0 ? Math.ceil(animal.breedCooldown) : 0;
        const variantDef = animal.variant
          ? this.farmVariants && this.farmVariants[type]
            ? this.farmVariants[type].find((v) => v.name === animal.variant)
            : null
          : null;

        html += `
          <div class="farm-roster-row" data-animal-id="${animal.id}">
            <div class="farm-roster-name-wrap">
              <span class="farm-roster-name" onclick="window._game.startRenameAnimal('${animal.id}')" title="Click to rename">${animal.name || tdef.name + " #" + animal.id.split("_").pop()}</span>
              ${animal.variant ? `<span class="farm-variant-tag" title="${variantDef ? variantDef.name + ": " + this.getVariantDescription(variantDef) : animal.variant}">${animal.variant}</span>` : ""}
              ${animal.passport ? `<span class="farm-passport-tag" title="${animal.passport}">${animal.passport}</span>` : ""}
              ${cooldownLeft > 0 ? `<span class="farm-cooldown-tag">${this.formatDuration(cooldownLeft)}</span>` : ""}
              ${this.isAnimalBreeding(animal.id) ? '<span class="farm-cooldown-tag">Breeding</span>' : ""}
            </div>
            <div class="farm-roster-traits">
              ${
                animal.traits.length > 0
                  ? animal.traits
                      .map((t) => {
                        const td = this.farmTraitDefs.find((d) => d.id === t);
                        return td
                          ? `<span class="farm-trait-badge ${td.rarity}" title="${td.name}: ${this.getTraitDescription(td)}">${td.name}</span>`
                          : "";
                      })
                      .join("")
                  : '<span class="farm-roster-no-traits">No traits</span>'
              }
            </div>
            <button class="farm-btn farm-btn-small" onclick="window._game.releaseAnimal('${animal.id}')" ${this.isAnimalBreeding(animal.id) ? "disabled" : ""}>Release</button>
          </div>
        `;
      }
      html += "</div>";
      return html;
    }

    startRenameAnimal(animalId) {
      const animal = this.farmState.animals.find((a) => a.id === animalId);
      if (!animal) return;
      const row = document.querySelector(
        `.farm-roster-row[data-animal-id="${animalId}"]`,
      );
      if (!row) return;
      const nameEl = row.querySelector(".farm-roster-name");
      if (!nameEl) return;
      const currentName = animal.name || animal.id;
      nameEl.outerHTML = `<input class="farm-rename-input" type="text" value="${currentName}" maxlength="20" onblur="window._game.finishRenameAnimal('${animalId}',this.value)" onkeydown="if(event.key==='Enter')this.blur()" />`;
      const input = row.querySelector(".farm-rename-input");
      if (input) {
        input.focus();
        input.select();
      }
    }

    finishRenameAnimal(animalId, newName) {
      const animal = this.farmState.animals.find((a) => a.id === animalId);
      if (!animal) return;
      const trimmed = newName.trim().slice(0, 20);
      if (trimmed.length > 0) animal.name = trimmed;
      this._forceBarnFullRender();
      this.requestSave();
    }

    getVariantDescription(vdef) {
      if (!vdef || !vdef.effect) return "";
      const e = vdef.effect;
      if (e.prodSpeed) return "+" + e.prodSpeed * 100 + "% prod speed";
      if (e.sellPrice) return "+" + e.sellPrice * 100 + "% sell price";
      if (e.traitSlot) return "+1 trait slot";
      return "";
    }

    formatDuration(seconds) {
      if (seconds <= 0) return "";
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      if (m > 60) return Math.floor(m / 60) + "h " + (m % 60) + "m";
      return m > 0 ? m + "m " + s + "s" : s + "s";
    }

    updateFarmContractsTab() {
      const board = document.getElementById("contract-board");
      const activeList = document.getElementById("contract-active-list");
      const activeCount = document.getElementById("contract-active-count");
      const refreshTimer = document.getElementById("contract-refresh-timer");
      if (!board) return;
      const fs = this.farmState;

      // Refresh timer
      if (refreshTimer) {
        const remaining = Math.max(
          0,
          600000 - (this.getGameTime() - fs.contracts.lastRefresh),
        );
        refreshTimer.textContent =
          "Refresh: " + Math.ceil(remaining / 1000) + "s";
      }

      // Board
      let boardHtml = "";
      for (const contract of fs.contracts.board) {
        if (!contract) continue;
        boardHtml += `
          <div class="contract-card ${contract.type}" title="${this.getFarmTooltip("contract" + contract.type.charAt(0).toUpperCase() + contract.type.slice(1))}">
            <div class="contract-header">
              <span class="contract-type-label">${contract.type === "rush" ? "Rush" : contract.type === "standard" ? "Standard" : "Long Haul"}</span>
              <span class="contract-title">${contract.title}</span>
              ${contract.affixes
                .map((a) => {
                  const affix = this.farmAffixDefs.find((ad) => ad.id === a);
                  if (!affix) return "";
                  const affixTips = {
                    urgent: "Urgent: 30% less time, 20% less reward",
                    generous: "Generous: +40% reward",
                    demanding: "Demanding: +50% required goods, +60% reward",
                    focused: "Focused: Single good type, +20% buff duration",
                    volatile: "Volatile: Random reward multiplier (0.5x-3x)",
                    vip: "VIP: +30% buff strength (req. Mastery 8)",
                    chain: "Chain: Follow-up contract with 1.5x reward",
                    legendary:
                      "Legendary: +80% reward, 3x requirements, 2 good types",
                  };
                  return `<span class="contract-affix ${a}" title="${affixTips[a] || ""}">${affix.name}</span>`;
                })
                .join("")}
            </div>
            <div class="contract-requirements">
              ${Object.entries(contract.requirements)
                .map(([good, qty]) => `<span>${good}: ${qty}</span>`)
                .join("")}
            </div>
            <div class="contract-reward">
              <img src="img/donutMoney.webp" class="donut-money-icon" /> ${this.formatNumber(contract.reward.donuts)}
              ${contract.reward.buff ? `<span class="farm-buff-preview" title="${this.getFarmTooltip("buff_" + contract.reward.buff.category)}">${contract.reward.buff.category === "PROD" ? "+PROD" : contract.reward.buff.category + " (unavailable)"}</span>` : ""}
            </div>
            <div class="contract-actions">
              <button class="farm-btn farm-btn-buy" onclick="window._game.acceptContract('${contract.id}')">Accept</button>
            </div>
          </div>
        `;
      }
      board.innerHTML =
        boardHtml ||
        '<div style="color:rgba(255,234,182,0.3);font-size:0.72rem;text-align:center;padding:20px;">No contracts available yet</div>';

      // Active contracts
      if (activeList) {
        let activeHtml = "";
        for (const contract of fs.contracts.active) {
          const pct = Math.min(
            100,
            (contract.elapsed / contract.duration) * 100,
          );
          const isReady = contract.elapsed >= contract.duration;
          const remaining = Math.max(0, contract.duration - contract.elapsed);
          const mins = Math.floor(remaining / 60);
          const secs = Math.ceil(remaining % 60);
          activeHtml += `
            <div class="contract-active-card ${isReady ? "contract-ready" : ""}">
              <div class="contract-header">
                <span class="contract-title">${contract.title}</span>
                <span style="margin-left:auto;font-size:0.62rem;color:${isReady ? "#81c784" : "rgba(255,234,182,0.45)"}">${isReady ? "READY!" : mins + "m " + secs + "s"}</span>
              </div>
              <div class="contract-reward" style="font-size:0.62rem;">
                <img src="img/donutMoney.webp" class="donut-money-icon" style="width:12px;height:12px;" /> ${this.formatNumber(contract.reward.donuts)}
                ${contract.reward.buff ? `<span class="farm-buff-preview" title="${this.getFarmTooltip("buff_" + contract.reward.buff.category)}">${contract.reward.buff.category === "PROD" ? "+PROD" : contract.reward.buff.category + " (unavailable)"}</span>` : ""}
              </div>
              <div class="contract-active-progress">
                <div class="farm-progress"><div class="farm-progress-bar ${isReady ? "bar-ready" : ""}" style="width:${pct}%"></div></div>
              </div>
              <div class="contract-active-actions">
                ${
                  isReady
                    ? `<button class="farm-btn farm-btn-buy farm-btn-deliver" onclick="window._game.deliverContract('${contract.id}')">Deliver!</button>`
                    : `<button class="farm-btn farm-btn-small farm-btn-cancel" onclick="window._game.cancelContract('${contract.id}')" title="Cancel (80% goods returned)">Cancel</button>`
                }
              </div>
            </div>
          `;
        }
        activeList.innerHTML =
          activeHtml ||
          '<div style="color:rgba(255,234,182,0.3);font-size:0.68rem;text-align:center;">No active contracts</div>';
      }
      if (activeCount)
        activeCount.textContent = fs.contracts.active.length + " / 2";
    }

    getTraitDescription(tdef) {
      if (!tdef) return "";
      const e = tdef.effect;
      const descs = {
        prodSpeed: "+" + e.value * 100 + "% production speed",
        feedCost: e.value * 100 + "% feed cost",
        sellPrice: "+" + e.value * 100 + "% sell price",
        careBonus: "+" + e.value * 100 + "% care window bonus",
        socialProd:
          "+" +
          e.value * 100 +
          "% prod per same-type animal (max " +
          e.max * 100 +
          "%)",
        careWindowDuration: "+" + e.value + "s care window",
        breedCooldown: e.value * 100 + "% breed cooldown",
        crateChance: "+" + e.value * 100 + "% crate drop chance",
        bonusGood: "+1 extra good every " + e.value + "th collect",
        mentorTrait: "Offspring inherit +" + e.value + " extra trait",
        storageCap: "+" + e.value * 100 + "% storage cap for this good",
        contractReq: e.value * 100 + "% contract requirements",
        legendaryProd:
          "+" + e.prodSpeed * 100 + "% prod, +" + e.sellPrice * 100 + "% sell",
        contractStar:
          "+" +
          e.contractSpeed * 100 +
          "% contract speed, +" +
          e.buffDuration * 100 +
          "% buff duration",
      };
      return descs[e.type] || "";
    }

    updateFarmBreedingTabSmart() {
      const fs = this.farmState;
      const container = document.getElementById("farm-breeding-slots");
      if (!container) return;
      if (
        !container.dataset.rendered ||
        container.dataset.signature !== this.getBreedingRenderSignature()
      ) {
        this.updateFarmBreedingTab();
        return;
      }
      // Partial update: only progress bars/timers for active slots
      for (let i = 0; i < fs.breeding.slots.length; i++) {
        const slot = fs.breeding.slots[i];
        if (!slot.active) continue;
        const card = container.querySelector(`[data-breed-slot="${i}"]`);
        if (!card) continue;
        const statusEl = card.querySelector(".breed-slot-status");
        const barEl = card.querySelector(".farm-progress-bar");
        if (statusEl) {
          const remaining = Math.ceil(
            Math.max(0, slot.duration - slot.progress),
          );
          statusEl.textContent = this.formatDuration(remaining) + " remaining";
        }
        if (barEl)
          barEl.style.width =
            Math.min(100, (slot.progress / slot.duration) * 100) + "%";
      }
    }

    _breedRenderAnimalCard(animal, slotIndex, parentSlot) {
      const sel = this._breedSelection;
      const slotSel = sel && sel[slotIndex];
      const isSelectedA = slotSel && slotSel.a === animal.id;
      const isSelectedB = slotSel && slotSel.b === animal.id;
      const isSelected = isSelectedA || isSelectedB;
      const otherSlotUsed =
        sel &&
        Object.values(sel).some(
          (s, idx) =>
            idx !== slotIndex && s && (s.a === animal.id || s.b === animal.id),
        );
      const onCooldown =
        animal.breedCooldown > 0 || this.isAnimalBreeding(animal.id);
      const disabled = otherSlotUsed || onCooldown;

      const rarityColors = {
        common: "#81c784",
        rare: "#64b5f6",
        epic: "#ce93d8",
      };
      const traitDots = animal.traits
        .map((t) => {
          const td = this.farmTraitDefs.find((d) => d.id === t);
          return td
            ? `<span class="breed-card-dot" style="background:${rarityColors[td.rarity]}" title="${td.name} (${td.rarity}): ${this.getTraitDescription(td)}"></span>`
            : "";
        })
        .join("");

      return `<div class="breed-animal-card ${isSelected ? "selected" : ""} ${disabled ? "disabled" : ""}"
        onclick="${disabled ? "" : `window._game.selectBreedParent(${slotIndex},'${animal.id}')`}"
        title="${animal.name}${animal.variant ? " (" + animal.variant + ")" : ""}${onCooldown ? " — Cooldown: " + this.formatDuration(Math.ceil(animal.breedCooldown)) : ""}">
        <div class="breed-card-name">${animal.name}${isSelectedA ? " [A]" : ""}${isSelectedB ? " [B]" : ""}</div>
        <div class="breed-card-meta">
          ${traitDots}
          ${animal.variant ? `<span class="breed-card-variant">${animal.variant}</span>` : ""}
          ${onCooldown ? `<span class="breed-card-cd">${this.formatDuration(Math.ceil(animal.breedCooldown))}</span>` : ""}
        </div>
      </div>`;
    }

    selectBreedParent(slotIndex, animalId) {
      if (!this._breedSelection) this._breedSelection = {};
      if (!this._breedSelection[slotIndex])
        this._breedSelection[slotIndex] = { a: null, b: null };
      const sel = this._breedSelection[slotIndex];

      // If already selected as A → deselect
      if (sel.a === animalId) {
        sel.a = null;
        this.updateFarmBreedingTab();
        return;
      }
      // If already selected as B → deselect
      if (sel.b === animalId) {
        sel.b = null;
        this.updateFarmBreedingTab();
        return;
      }

      // Same animal can't be both parents
      const animal = this.farmState.animals.find((a) => a.id === animalId);
      if (!animal) return;

      // Fill A first, then B (must be same type as A)
      if (!sel.a) {
        sel.a = animalId;
      } else if (!sel.b) {
        const parentA = this.farmState.animals.find((a) => a.id === sel.a);
        if (parentA && parentA.type !== animal.type) {
          this.showFarmNotification("Both parents must be the same type!");
          return;
        }
        sel.b = animalId;
      } else {
        // Both filled → replace B
        const parentA = this.farmState.animals.find((a) => a.id === sel.a);
        if (parentA && parentA.type !== animal.type) {
          // Different type: reset both and start fresh
          sel.a = animalId;
          sel.b = null;
        } else {
          sel.b = animalId;
        }
      }
      this.updateFarmBreedingTab();
    }

    updateFarmBreedingTab() {
      const fc = this.getFarmCount();
      const fs = this.farmState;
      const container = document.getElementById("farm-breeding-slots");
      if (!container) return;
      if (!this._breedSelection) this._breedSelection = {};
      if (!this._breedProgram) this._breedProgram = "quick";

      let html = "";

      for (let i = 0; i < 2; i++) {
        const slot = fs.breeding.slots[i];
        const unlocked = (i === 0 && fc >= 15) || (i === 1 && fc >= 60);
        const reqFC = i === 0 ? 15 : 60;

        if (!unlocked) {
          html += `<div class="breed-slot-card locked" data-breed-slot="${i}">
            <div class="breed-slot-header">
              <span class="breed-slot-title">Slot ${i + 1}</span>
              <span class="breed-slot-status">Need ${reqFC} farms</span>
            </div>
          </div>`;
          continue;
        }

        // Active breeding — show progress
        if (slot.active) {
          const pct = Math.min(100, (slot.progress / slot.duration) * 100);
          const remaining = Math.ceil(
            Math.max(0, slot.duration - slot.progress),
          );
          const parentA = fs.animals.find((a) => a.id === slot.parentA);
          const parentB = fs.animals.find((a) => a.id === slot.parentB);
          const progDef = this.farmBreedPrograms[slot.program];
          html += `<div class="breed-slot-card active" data-breed-slot="${i}">
            <div class="breed-slot-header">
              <span class="breed-slot-title">Slot ${i + 1} — ${progDef ? progDef.name : slot.program}</span>
              <span class="breed-slot-status">${this.formatDuration(remaining)} remaining</span>
            </div>
            <div class="breed-slot-body">
              <div class="breed-active-parents">
                <span class="breed-active-name">${parentA ? parentA.name : "?"}</span>
                <span class="breed-active-x">×</span>
                <span class="breed-active-name">${parentB ? parentB.name : "?"}</span>
              </div>
              <div class="farm-progress"><div class="farm-progress-bar" style="width:${pct}%"></div></div>
            </div>
          </div>`;
          continue;
        }

        // Ready slot — parent selection + program + preview
        if (!this._breedSelection[i])
          this._breedSelection[i] = { a: null, b: null };
        const sel = this._breedSelection[i];
        const parentA = sel.a ? fs.animals.find((a) => a.id === sel.a) : null;
        const parentB = sel.b ? fs.animals.find((a) => a.id === sel.b) : null;

        // Collect available animals (not on cooldown, not used in other slot)
        const otherSel = this._breedSelection[1 - i];
        const otherUsed = otherSel
          ? [otherSel.a, otherSel.b].filter(Boolean)
          : [];
        const available = {};
        for (const animal of fs.animals) {
          if (animal.breedCooldown > 0 || this.isAnimalBreeding(animal.id))
            continue;
          if (!available[animal.type]) available[animal.type] = [];
          available[animal.type].push(animal);
        }

        // Filter: if parent A is selected, only show same type for roster
        const filterType = parentA ? parentA.type : null;

        html += `<div class="breed-slot-card" data-breed-slot="${i}">
          <div class="breed-slot-header">
            <span class="breed-slot-title">Slot ${i + 1}</span>
            <span class="breed-slot-status" style="color:#81c784">Ready</span>
          </div>
          <div class="breed-slot-body">
            <!-- Parent slots -->
            <div class="breed-parent-slots">
              <div class="breed-parent-slot ${sel.a ? "filled" : "empty"}" onclick="${sel.a ? `window._game.selectBreedParent(${i},'${sel.a}')` : ""}">
                <div class="breed-parent-label">Parent A</div>
                ${parentA ? this._renderParentCard(parentA) : '<div class="breed-parent-placeholder">Click an animal below</div>'}
              </div>
              <div class="breed-parent-x">×</div>
              <div class="breed-parent-slot ${sel.b ? "filled" : "empty"}" onclick="${sel.b ? `window._game.selectBreedParent(${i},'${sel.b}')` : ""}">
                <div class="breed-parent-label">Parent B</div>
                ${parentB ? this._renderParentCard(parentB) : '<div class="breed-parent-placeholder">${!sel.a ? "Select A first" : "Click same type"}</div>'}
              </div>
            </div>

            <!-- Program selection -->
            <div class="breed-programs">
              ${this._renderProgramCard("quick", i, fc)}
              ${this._renderProgramCard("standard", i, fc)}
              ${this._renderProgramCard("long", i, fc)}
            </div>

            <!-- Preview (only when both parents selected) -->
            <div id="breed-preview-${i}" class="breed-preview-container">
              ${parentA && parentB ? this.getBreedingPreview(sel.a, sel.b, this._breedProgram) : ""}
            </div>

            <!-- Start button -->
            ${
              parentA && parentB
                ? `
              <button class="farm-btn breed-start-btn" onclick="window._game.startBreedingFromUI(${i})">
                Start Breeding
              </button>
            `
                : ""
            }

            <!-- Animal picker -->
            <div class="breed-picker-label">Available Animals ${filterType ? `(${this.farmAnimalDefs[filterType].name})` : ""}</div>
            <div class="breed-animal-picker">
              ${Object.entries(available)
                .filter(([type]) => !filterType || type === filterType)
                .map(([type, animals]) => {
                  if (animals.length < 2 && !filterType) return "";
                  return `<div class="breed-picker-group">
                  <div class="breed-picker-type">${this.farmAnimalDefs[type].name}</div>
                  <div class="breed-picker-cards">
                    ${animals.map((a) => this._breedRenderAnimalCard(a, i, null)).join("")}
                  </div>
                </div>`;
                })
                .join("")}
            </div>
          </div>
        </div>`;
      }

      container.innerHTML = html;
      container.dataset.rendered = "1";
      container.dataset.signature = this.getBreedingRenderSignature();
    }

    _renderParentCard(animal) {
      const rarityColors = {
        common: "#81c784",
        rare: "#64b5f6",
        epic: "#ce93d8",
      };
      const traits = animal.traits
        .map((t) => {
          const td = this.farmTraitDefs.find((d) => d.id === t);
          if (!td) return "";
          return `<span class="breed-parent-trait" style="color:${rarityColors[td.rarity]};border-color:${rarityColors[td.rarity]}">${td.name}</span>`;
        })
        .join("");
      return `<div class="breed-parent-info">
        <div class="breed-parent-name">${animal.name}</div>
        ${animal.variant ? `<span class="farm-variant-tag">${animal.variant}</span>` : ""}
        <div class="breed-parent-traits">${traits || '<span style="color:rgba(255,234,182,0.25);font-size:0.55rem;">No traits</span>'}</div>
      </div>`;
    }

    _renderProgramCard(key, slotIndex, fc) {
      const prog = this.farmBreedPrograms[key];
      if (!prog) return "";
      if (key === "long" && fc < 25) {
        return `<div class="breed-prog-card locked" title="Unlocks at 25 farms">
          <div class="breed-prog-name">${prog.name}</div>
          <div class="breed-prog-lock">FC 25</div>
        </div>`;
      }
      const isActive = this._breedProgram === key;
      const mechanics = {
        quick: "80% inherit, no mutation. Predictable.",
        standard: "60% inherit, 40% mutation. Balanced.",
        long: "Best trait from each parent + mutation slot. 15% variant.",
      };
      const sel = this._breedSelection[slotIndex];
      const parentA =
        sel && sel.a
          ? this.farmState.animals.find((a) => a.id === sel.a)
          : null;
      const costStr = parentA
        ? this.formatNumber(
            Math.floor(
              this.farmAnimalDefs[parentA.type].baseCost * prog.costMult,
            ),
          )
        : "—";
      const durMin = Math.floor(prog.duration / 60);
      const durStr =
        durMin >= 60 ? Math.floor(durMin / 60) + "h" : durMin + "m";

      return `<div class="breed-prog-card ${isActive ? "active" : ""}" onclick="window._game._breedProgram='${key}';window._game.updateFarmBreedingTab();">
        <div class="breed-prog-name">${prog.name}</div>
        <div class="breed-prog-stats">${durStr} · ${prog.traitSlots} slots · ${costStr}</div>
        <div class="breed-prog-mechanic">${mechanics[key]}</div>
      </div>`;
    }

    updateFarmCollectionTab() {
      const sellGrid = document.getElementById("farm-sell-grid");
      const buffSlots = document.getElementById("farm-buff-slots");
      const crateList = document.getElementById("farm-crate-list");
      if (!sellGrid) return;
      const fs = this.farmState;

      // Sell cards
      let sellHtml = "";
      for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
        const good = def.good;
        const count = Math.floor(fs.storage[good] || 0);
        const price = this.getSellPrice(good);
        sellHtml += `
          <div class="farm-sell-card">
            <div class="farm-sell-info">
              <span class="farm-sell-name">${good}</span>
              <span class="farm-sell-count">${count} in storage</span>
              <span class="farm-sell-price">${this.formatNumber(price)} each</span>
            </div>
            <button class="farm-btn farm-btn-sell" onclick="window._game.sellGoods('${good}')" ${count <= 0 ? "disabled" : ""}>
              Sell All
            </button>
          </div>
        `;
      }
      sellGrid.innerHTML = sellHtml;

      // Buff slots
      if (buffSlots) {
        let buffHtml = "";
        for (const cat of Object.keys(this.farmBuffCategories)) {
          if (cat !== "PROD") {
            buffHtml += `<div class="farm-buff-slot" title="${this.getFarmTooltip("buff_" + cat)}">${cat}: unavailable</div>`;
            continue;
          }
          const buff = fs.buffs[cat];
          if (buff && buff.remaining > 0) {
            const mins = Math.floor(buff.remaining / 60);
            const secs = Math.ceil(buff.remaining % 60);
            buffHtml += `<div class="farm-buff-slot active" title="${this.getFarmTooltip("buff_" + cat)}">${cat}: x${buff.strength.toFixed(2)} <span class="farm-buff-timer">${mins}m ${secs}s</span></div>`;
          } else {
            buffHtml += `<div class="farm-buff-slot" title="${this.getFarmTooltip("buff_" + cat)}">${cat}: --</div>`;
          }
        }
        buffSlots.innerHTML = buffHtml;
      }

      // Crates
      if (crateList) {
        let crateHtml = "";
        for (const crate of fs.crates) {
          crateHtml += `<div class="farm-crate-item ${crate.tier}" onclick="window._game.openFarmCrate('${crate.id}')">${crate.tier}</div>`;
        }
        crateList.innerHTML =
          crateHtml ||
          '<span style="font-size:0.62rem;color:rgba(255,234,182,0.3);">No crates</span>';
      }
    }

    updateFarmKPIs() {
      const fs = this.farmState;
      const outputEl = document.getElementById("farm-kpi-output");
      const storageEl = document.getElementById("farm-kpi-storage");
      const careEl = document.getElementById("farm-kpi-care");

      if (outputEl) {
        let totalPerMin = 0;
        for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
          const animals = fs.animals.filter((a) => a.type === type);
          if (animals.length === 0) continue;
          const rate =
            (animals.length / def.prodInterval) *
            this.getProductionModifier(type) *
            60;
          totalPerMin += rate;
        }
        outputEl.textContent = totalPerMin.toFixed(1) + "/min";
      }

      if (storageEl) {
        let totalPct = 0;
        let count = 0;
        for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
          const good = def.good;
          const cap = this.getEffectiveStorageCap(good);
          if (cap > 0) {
            totalPct += (fs.storage[good] / cap) * 100;
            count++;
          }
        }
        storageEl.textContent =
          "Storage: " + (count > 0 ? Math.floor(totalPct / count) : 0) + "%";
      }

      if (careEl) {
        const fc = this.getFarmCount();
        if (fc < 10) {
          careEl.textContent = "Care: " + (10 - fc) + " farms needed";
          careEl.title =
            "Care Windows unlock when you have 10 farms. You have " + fc + ".";
        } else if (fs.careWindow.active) {
          const remaining = Math.max(
            0,
            Math.ceil((fs.careWindow.expiresAt - this.getGameTime()) / 1000),
          );
          careEl.textContent = "Care: " + remaining + "s ✦";
          careEl.title =
            "Care window ACTIVE! Click to open farm panel and use it.";
        } else {
          const next = Math.max(
            0,
            Math.ceil((fs.careWindow.nextTrigger - this.getGameTime()) / 1000),
          );
          const mins = Math.floor(next / 60);
          const secs = next % 60;
          careEl.textContent = "Care: " + mins + "m " + secs + "s";
          careEl.title = this.getFarmTooltip("care");
        }
      }
    }

    setFeedPlan(animalType, plan) {
      this.settleBeforeMutation();
      this.farmState.feedPlans[animalType] = plan;
      this._forceBarnFullRender();
      this.updateDisplay(!this._settlingTime);
      this.requestSave();
    }

    showFarmNotification(text) {
      if (!this.canPresent()) return;
      const existing = document.querySelector(".farm-notification");
      if (existing) existing.remove();
      const notif = document.createElement("div");
      notif.className = "farm-notification";
      notif.innerHTML = `<span class="farm-notif-text">${text}</span>`;
      document.getElementById("game-container").appendChild(notif);
      setTimeout(() => notif.remove(), 3000);
    }

    // --- Farm Panel Tab switching ---
    setupFarmTabs() {
      const tabs = document.querySelectorAll(".farm-tab");
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          tabs.forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          const tabName = tab.dataset.tab;
          this.farmActiveTab = tabName;
          document.querySelectorAll(".farm-tab-content").forEach((tc) => {
            tc.classList.toggle("hidden", tc.dataset.tab !== tabName);
          });
          // Reset breeding rendered flag so it does a fresh render when tab opens
          if (tabName === "breeding") {
            const breedContainer = document.getElementById(
              "farm-breeding-slots",
            );
            if (breedContainer) delete breedContainer.dataset.rendered;
          }
          // Immediately update the newly visible tab
          this.updateFarmDisplay();
        });
      });
    }

    getClickBreakdown(now = this.getProductionQueryTime()) {
      const production = this.getProductionBreakdown(now);
      const cursorMultiplier = this.getBuildingUpgradeMultiplier("cursor");
      let clickUpgradeCount = 0;
      let cpsClickFraction = 0;
      for (const upgrade of this.upgrades.nonItemUpgrades || []) {
        if (!upgrade?.purchased || upgrade.specialEffect) continue;
        clickUpgradeCount++;
        // Each configured 1.01 contributes an additive 1% of boosted CPS.
        cpsClickFraction += Math.max(
          0,
          this.economicFactor(upgrade.multiplier) - 1,
        );
      }
      // Cursor upgrades multiply the manual base, not the CPS-derived component.
      // The CPS component already includes prestige/globals/temporary effects once.
      const baseClick = cursorMultiplier * production.temporaryMultiplier;
      const cpsClick = production.boostedCPS * cpsClickFraction;
      const clickValue = baseClick + cpsClick + production.dynamicClickBonus;
      return {
        cursorMultiplier,
        clickUpgradeCount,
        cpsClickFraction,
        baseClick,
        cpsClick,
        flatClick: production.dynamicClickBonus,
        clickValue:
          production.valid && Number.isFinite(clickValue) ? clickValue : 0,
      };
    }

    calculateClickValue() {
      return this.getClickBreakdown().clickValue;
    }

    calculatePerSecond() {
      return this.getProductionBreakdown().effectiveCPS;
    }
    handleDonutClick(event) {
      this.settleBeforeMutation();
      this.hasDonutClicked = true; // İlk tıklamada true olur
      this.totalClicks++;

      const clickValue = donutDebug.manualClickValue(
        this.calculateClickValue(),
      );

      this.creditDonuts(clickValue);
      this.lastClickValue = clickValue;

      // Görsel ve ses efektlerini çalıştır
      if (this.activeAnimationElements < this.MAX_ANIMATION_ELEMENTS) {
        this.activeAnimationElements++;
        const plusOne = document.createElement("div");
        plusOne.className = "plus-one";
        plusOne.textContent = `+${this.formatNumber(clickValue, "count")}`;
        plusOne.style.left = `${event.clientX}px`;
        plusOne.style.top = `${event.clientY}px`;

        document.body.appendChild(plusOne);
        setTimeout(() => {
          document.body.removeChild(plusOne);
          this.activeAnimationElements--;
        }, 1000);

        this.createFallingDonut(event.clientX, event.clientY);
      }

      this.playRandomClickSound();

      // checkQuestProgress'i throttle et ve sadece clicks tipindeki görevler için çağır
      if (!this._clickQuestTimeout) {
        this._clickQuestTimeout = setTimeout(() => {
          this._clickQuestTimeout = null;
          // Sadece tıklama ile ilgili görevleri kontrol et
          this.checkClickQuests();
        }, 250);
      }

      this.updateDisplay();

      this.updateTitleWithDonuts(); // Her tıklamadan sonra başlık güncellenir
    }

    // Check click-related quests (optimized for click events)
    checkClickQuests() {
      // Check dynamic quests that are click-based
      this.checkDynamicQuestProgress();
      // Click milestones are checked in the main checkMilestoneProgress
    }
    showUpgrades() {
      if (!this.canPresent()) return;
      const upgradeList = document.getElementById("upgrade-list");
      if (!upgradeList) return;

      const existingUpgrades = Array.from(upgradeList.children);
      let allUpgrades = [];
      if (this.upgrades.donutUpgrades) {
        this.upgrades.donutUpgrades.forEach((upgrade, index) => {
          if (upgrade.purchased) {
            return;
          }

          if (this.isUpgradeUnlocked("donutUpgrades", upgrade)) {
            allUpgrades.push({ key: "donutUpgrades", index, upgrade });
          }
        });
      }
      // Normal item upgrade'leri ekle
      for (let key in this.upgrades) {
        if (key === "nonItemUpgrades" || key === "donutUpgrades") continue;

        if (!this.upgrades[key]) continue;

        this.upgrades[key].forEach((upgrade, index) => {
          if (upgrade.purchased) return;
          if (!this.isUpgradeUnlocked(key, upgrade)) return;
          allUpgrades.push({ key, index, upgrade });
        });
      }

      // nonItemUpgrades kontrolü
      if (this.upgrades.nonItemUpgrades) {
        this.upgrades.nonItemUpgrades.forEach((upgrade, index) => {
          if (upgrade.purchased) return;

          if (!this.isUpgradeUnlocked("nonItemUpgrades", upgrade)) return;

          allUpgrades.push({ key: "nonItemUpgrades", index, upgrade });
        });
      }

      allUpgrades.sort((a, b) => a.upgrade.cost - b.upgrade.cost);

      allUpgrades.forEach(({ key, index, upgrade }, position) => {
        let existingUpgrade = existingUpgrades.find(
          (div) =>
            div.dataset.key === key && div.dataset.index === String(index),
        );

        if (!existingUpgrade) {
          const upgradeDiv = document.createElement("div");
          upgradeDiv.classList.add("upgrade");
          upgradeDiv.dataset.key = key;
          upgradeDiv.dataset.index = String(index);

          upgradeDiv.addEventListener("mouseenter", () => {
            this.showInfoPanel(upgrade, key);
          });

          upgradeDiv.addEventListener("mouseleave", this.hideInfoPanel);

          upgradeDiv.addEventListener("click", () => {
            this.buyUpgrade(key, index);
            this.hideInfoPanel();
          });

          const formattedCost = this.formatNumber(upgrade.cost, "cost");

          upgradeDiv.innerHTML = `
          <img src="img/${upgrade.img}" alt="${upgrade.name}" />
        `;

          if (this.donutCount >= upgrade.cost) {
            upgradeDiv.classList.remove("insufficient-funds");
          } else {
            upgradeDiv.classList.add("insufficient-funds");
          }

          if (position === 0) {
            upgradeList.prepend(upgradeDiv);
          } else {
            upgradeList.insertBefore(
              upgradeDiv,
              upgradeList.children[position],
            );
          }
        } else {
          if (this.donutCount >= upgrade.cost) {
            existingUpgrade.classList.remove("insufficient-funds");
          } else {
            existingUpgrade.classList.add("insufficient-funds");
          }

          const upgradeCostElem =
            existingUpgrade.querySelector(".upgrade-cost");
          if (upgradeCostElem) {
            upgradeCostElem.textContent = this.formatNumber(
              upgrade.cost,
              "cost",
            );
          }

          const currentPos = existingUpgrades.indexOf(existingUpgrade);
          if (currentPos !== position) {
            upgradeList.insertBefore(
              existingUpgrade,
              upgradeList.children[position],
            );
          }
        }
      });
    }
    getBulkPricePreview(key, amount = this.purchaseAmount) {
      const item = this.items[key];
      const cached = this.bulkPriceCache.get(key);
      if (
        cached &&
        cached.item === item &&
        cached.count === item.count &&
        cached.baseCost === item.baseCost &&
        cached.costMultiplier === item.costMultiplier &&
        cached.amount === amount
      ) {
        return cached.price;
      }
      const price = this.calculateBulkPrice(item, amount);
      // One current entry per building; balance/affordability are never cached.
      this.bulkPriceCache.set(key, {
        item,
        count: item.count,
        baseCost: item.baseCost,
        costMultiplier: item.costMultiplier,
        amount,
        price,
      });
      return price;
    }

    calculateBulkPrice(item, amount) {
      let totalCost = 0;
      let currentCost = item.baseCost;

      for (let i = 0; i < amount; i++) {
        totalCost += currentCost;
        currentCost *= item.costMultiplier;
      }

      return Math.ceil(totalCost);
    }

    setPurchaseAmount(amount) {
      this.purchaseAmount = amount;
      this.updateDisplay();

      // Tüm butonların seçili durumunu kaldır
      document.querySelectorAll(".purchase-options button").forEach((btn) => {
        btn.classList.remove("selected");
      });

      // Seçili butonu işaretle
      document
        .querySelector(`.purchase-options button[data-amount="${amount}"]`)
        .classList.add("selected");
    }
    buyItem(itemKey, isAutomatic = false) {
      this.settleBeforeMutation();
      const item = this.items[itemKey];
      const bulkCost = this.calculateBulkPrice(item, this.purchaseAmount);

      if (this.donutCount >= bulkCost) {
        this.donutCount -= bulkCost;

        const isFirstMine = itemKey === "mine" && item.count === 0;
        const isFirstBaker = itemKey === "baker" && item.count === 0;
        const isFirstFarm = itemKey === "farm" && item.count === 0;

        // Track spending for quest rewards
        let currentCost = item.baseCost;

        // Tek bir for döngüsü kullan
        for (let i = 0; i < this.purchaseAmount; i++) {
          // Track this purchase before incrementing count
          this.trackBuildingPurchase(itemKey, currentCost);

          item.count++;
          item.baseCost *= item.costMultiplier;
          currentCost = item.baseCost;

          if (itemKey === "mine") {
            this.addWorker();
          } else if (itemKey === "baker") {
            this.addBakerWorker();
          }
        }

        this.questTracking.currentRun.totalSpent =
          this.economicNumber(this.questTracking.currentRun.totalSpent) +
          bulkCost;

        if (itemKey === "mine") this.refreshOreMarketReference();
        this.refreshRecipeAvailability();

        // Farm için panel kontrolü
        if (isFirstFarm) {
          const farmImage = document.querySelector(
            '.store-item[data-item="farm"] .item-img img',
          );
          farmImage.classList.add("active-farm-effect");
          farmImage.classList.add("pulse-effect", "new-feature");

          const newLabel = document.createElement("div");
          newLabel.className = "new-feature-label";
          newLabel.textContent = "Click!";
          farmImage.parentElement.appendChild(newLabel);

          farmImage.setAttribute(
            "title",
            "Click to manage your farm and animals!",
          );

          farmImage.addEventListener(
            "click",
            () => {
              farmImage.classList.remove("pulse-effect", "new-feature");
              const label =
                farmImage.parentElement.querySelector(".new-feature-label");
              if (label) label.remove();
            },
            { once: true },
          );
        }

        // Mine için panel kontrolü
        if (isFirstMine) {
          const mineImage = document.querySelector(
            '.store-item[data-item="mine"] .item-img img',
          );
          mineImage.classList.add("active-mine-effect");
          mineImage.classList.add("pulse-effect", "new-feature");

          const newLabel = document.createElement("div");
          newLabel.className = "new-feature-label";
          newLabel.textContent = "Click!";
          mineImage.parentElement.appendChild(newLabel);

          mineImage.setAttribute(
            "title",
            "Click to manage your mine and workers!",
          );

          mineImage.addEventListener(
            "click",
            () => {
              mineImage.classList.remove("pulse-effect", "new-feature");
              const label =
                mineImage.parentElement.querySelector(".new-feature-label");
              if (label) label.remove();
            },
            { once: true },
          );
        }

        // Baker için panel kontrolü
        if (isFirstBaker) {
          const bakerImage = document.querySelector(
            '.store-item[data-item="baker"] .item-img img',
          );
          bakerImage.classList.add("active-baker-effect");
          bakerImage.classList.add("pulse-effect", "new-feature");

          const newLabel = document.createElement("div");
          newLabel.className = "new-feature-label";
          newLabel.textContent = "Click!";
          bakerImage.parentElement.appendChild(newLabel);

          bakerImage.setAttribute(
            "title",
            "Click to manage your bakery and workers!",
          );

          bakerImage.addEventListener(
            "click",
            () => {
              bakerImage.classList.remove("pulse-effect", "new-feature");
              const label =
                bakerImage.parentElement.querySelector(".new-feature-label");
              if (label) label.remove();
            },
            { once: true },
          );
        }

        this.updateTotalPerSecond();
        const previousQuestSaveDelay = this._questSaveDelay;
        this._questSaveDelay = isAutomatic ? 15000 : 1000;
        try {
          this.checkQuestProgress();
        } finally {
          this._questSaveDelay = previousQuestSaveDelay;
        }
        this.updateDisplay();
        this.showUpgrades();
        this.requestSave(isAutomatic ? 15000 : 1000);
      }
    }
    isUpgradeUnlocked(itemKey, upgrade) {
      if (!upgrade) return false;
      if (itemKey === "donutUpgrades")
        return this.isDonutUpgradeUnlocked(upgrade);
      if (itemKey === "nonItemUpgrades") {
        return upgrade.specialEffect === "automation"
          ? this.comboActive
          : this.totalClicks >= upgrade.requirement;
      }
      return (
        !!this.items[itemKey] &&
        this.items[itemKey].count >= upgrade.requirement
      );
    }

    buyUpgrade(itemKey, upgradeIndex) {
      if (
        !Object.hasOwn(this.upgrades, itemKey) ||
        !Number.isInteger(upgradeIndex) ||
        upgradeIndex < 0
      )
        return;
      const upgrade = this.upgrades[itemKey][upgradeIndex];
      if (!upgrade || upgrade.purchased) return;
      this.settleBeforeMutation();
      // Validate after settlement, at the same authority that charges the price.
      if (!this.isUpgradeUnlocked(itemKey, upgrade)) return;

      if (this.donutCount >= upgrade.cost && !upgrade.purchased) {
        this.donutCount -= upgrade.cost;
        upgrade.purchased = true;

        if (itemKey === "nonItemUpgrades") {
          if (upgrade.specialEffect === "automation") {
            this.autoCatcherEnabled = true;
          }
        }

        // Her upgrade sonrası click value'yu yeniden hesapla
        this.clickValue = this.calculateClickValue();

        // UI güncellemeleri
        const upgradeList = document.getElementById("upgrade-list");
        const upgradeDiv = upgradeList.querySelector(
          `div[data-key="${itemKey}"][data-index="${upgradeIndex}"]`,
        );
        if (upgradeDiv) {
          upgradeList.removeChild(upgradeDiv);
        }

        // Diğer güncellemeler
        this.hideInfoPanel();
        this.updateTotalPerSecond();
        this.updateDisplay();
        this.showUpgrades();
        this.requestSave();
      }
    }
    setupRecipeBook() {
      if (this._recipeBookBound) return;
      this._recipeBookBound = true;
      const recipeBookBtn = document.getElementById("recipe-book-btn");
      const modal = document.querySelector(".book-modal");
      const closeBtn = modal.querySelector(".close-btn");

      // Modal'ı aç
      recipeBookBtn.addEventListener("click", () => {
        modal.classList.add("show");
        this.updateRecipeBook();
      });

      // Modal'ı kapat
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("show");
      });

      // Modal dışına tıklandığında kapat
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("show");
        }
      });

      // ESC tuşu ile kapatma
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("show")) {
          modal.classList.remove("show");
        }
      });
    }

    getRecipeTargetBuildingKey(recipeName) {
      const recipe = this.recipes[recipeName];
      if (!recipe?.effects) return null;

      const effectKeys = Object.keys(recipe.effects);
      return effectKeys.length > 0 ? effectKeys[0] : null;
    }

    isRecipeUnlocked(recipeName) {
      const targetBuildingKey = this.getRecipeTargetBuildingKey(recipeName);
      if (!targetBuildingKey) return true;

      return (this.items[targetBuildingKey]?.count || 0) > 0;
    }

    getRecipeLockReason(recipeName) {
      if (this.isRecipeUnlocked(recipeName)) return "";

      const targetBuildingKey = this.getRecipeTargetBuildingKey(recipeName);
      const targetBuildingName =
        this.items[targetBuildingKey]?.name || "the required building";
      return `Requires at least 1 ${targetBuildingName}.`;
    }

    getRecipeProductionBonusForBuilding(buildingKey) {
      let totalBonus = 0;

      Object.values(this.recipes).forEach((recipe) => {
        const effect = recipe.effects?.[buildingKey];
        if (!effect || !recipe.craftCount) return;

        totalBonus +=
          this.economicNumber(effect.productionBonus) *
          this.economicNumber(recipe.craftCount);
      });

      return totalBonus;
    }

    getRecipeBonusDetailsForBuilding(buildingKey) {
      const bonuses = [];

      Object.entries(this.recipes).forEach(([recipeName, recipe]) => {
        const effect = recipe.effects?.[buildingKey];
        if (!effect || !recipe.craftCount) return;

        const totalBonusPercent =
          effect.productionBonus * recipe.craftCount * 100;
        bonuses.push({ recipeName, totalBonusPercent });
      });

      return bonuses;
    }

    updateRecipeBook() {
      if (!this.canPresent()) return;
      const recipesList = document.querySelector(".recipes-list");
      if (!this._recipeCards) this._recipeCards = new Map();

      Object.entries(this.recipes).forEach(([recipeName, recipe]) => {
        let card = this._recipeCards.get(recipeName);
        if (!card) {
          const recipeItem = document.createElement("div");
          recipeItem.className = "recipe-item";
          recipeItem.innerHTML = `
          <div class="recipe-header">
            <img src="img/${recipe.image}" alt="${recipeName}" />
            <span class="recipe-name">${recipeName}</span>
          </div>
          <div class="recipe-ingredients"></div>
          <button class="make-btn" data-recipe="${recipeName}">Make!</button>
        `;

          recipesList.appendChild(recipeItem);

          // Hover ile sağ sayfada detay göster
          recipeItem.addEventListener("mouseenter", () => {
            this.showRecipeDetail(recipeName);
          });

          // Make butonu
          const makeBtn = recipeItem.querySelector(".make-btn");
          makeBtn.addEventListener("click", () => {
            this.craftDonut(recipeName);
          });
          card = {
            ingredients: recipeItem.querySelector(".recipe-ingredients"),
            button: makeBtn,
          };
          this._recipeCards.set(recipeName, card);
        }
        const requirements = this.getRecipeRequirements(recipeName);
        card.ingredients.innerHTML = Object.keys(recipe.ingredients)
          .map((ingredient) => {
            const amount = requirements?.[ingredient];
            const enough =
              amount !== undefined &&
              this.hasEnoughIngredients(ingredient, amount);
            return `<span class="ingredient ${enough ? "available" : "unavailable"}"><img src="img/${ingredient.toLowerCase()}.webp" alt="${ingredient}" />${amount === undefined ? "Unavailable" : `${amount}x`}</span>`;
          })
          .join("");
        card.button.disabled = !this.canMakeRecipe(recipeName);
        card.button.title = !card.button.disabled
          ? "Make!"
          : this.getRecipeLockReason(recipeName) ||
            (requirements
              ? "Not enough ingredients"
              : "Recipe cost cannot be represented safely");
      });
      if (this._detailRecipeName) this.showRecipeDetail(this._detailRecipeName);
    }

    refreshRecipeAvailability() {
      if (!this.canPresent()) return;
      if (document.querySelector(".book-modal")?.classList.contains("show"))
        this.updateRecipeBook();
      this.updateCraftButton();
    }

    showRecipeDetail(recipeName) {
      const recipe = this.recipes[recipeName];
      if (!recipe) return;
      this._detailRecipeName = recipeName;

      const panel = document.getElementById("recipe-detail-panel");
      if (!panel) return;

      const effectEntry = recipe.effects
        ? Object.entries(recipe.effects)[0]
        : null;
      const targetBuilding = effectEntry
        ? this.items[effectEntry[0]]?.name || effectEntry[0]
        : "-";
      const bonusPercent = effectEntry
        ? effectEntry[1].productionBonus * 100
        : 0;
      const totalBonus = effectEntry
        ? (recipe.craftCount || 0) * bonusPercent
        : 0;

      panel.innerHTML = `
      <div class="recipe-detail">
        <div class="recipe-detail-header">
          <img src="img/${recipe.image}" alt="${recipeName}" />
          <h3>${recipeName}</h3>
        </div>
        <p class="recipe-detail-desc">${recipe.description || ""}</p>
        <div class="recipe-detail-stats">
          <div class="recipe-detail-stat">
            <span>Crafted</span>
            <span class="stat-value">${recipe.craftCount || 0}x</span>
          </div>
          <div class="recipe-detail-stat">
            <span>Boosts</span>
            <span class="stat-value">${targetBuilding}</span>
          </div>
          <div class="recipe-detail-stat">
            <span>Per Craft</span>
            <span class="stat-value">+${bonusPercent}%</span>
          </div>
          <div class="recipe-detail-stat">
            <span>Total Bonus</span>
            <span class="stat-value">+${totalBonus.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    `;
    }

    selectRecipe(recipeName) {
      this.selectedRecipeName = recipeName;
      this.selectedRecipe = this.recipes[recipeName];
      const selectedRecipeElem = document.getElementById(
        "selected-recipe-name",
      );
      if (selectedRecipeElem) {
        selectedRecipeElem.textContent = recipeName;
        this.updateCraftButton();
      }
    }

    updateCraftButton() {
      if (!this.canPresent()) return;
      const craftBtn = document.getElementById("craft-btn");
      if (!craftBtn) return;

      if (!this.selectedRecipe) {
        craftBtn.disabled = true;
        return;
      }

      const canCraft = this.selectedRecipeName
        ? this.canMakeRecipe(this.selectedRecipeName)
        : false;

      craftBtn.disabled = !canCraft;
      craftBtn.title = canCraft
        ? "Craft Donut"
        : this.selectedRecipeName
          ? this.getRecipeLockReason(this.selectedRecipeName) ||
            "Not enough ingredients"
          : "Not enough ingredients";
    }

    getRecipeScale(recipe, count = recipe?.craftCount ?? 0) {
      const multiplier = recipe?.scaling?.ingredients?.multiplier;
      if (
        !Number.isInteger(count) ||
        count < 0 ||
        !Number.isFinite(multiplier) ||
        multiplier <= 1
      )
        return null;
      // Match historical repeated multiplication, including its ceil-boundary rounding.
      // Overflow ends this loop after at most ~1751 crafts for configured recipes.
      let scale = 1;
      for (let i = 0; i < count; i++) {
        scale *= multiplier;
        if (!Number.isFinite(scale)) return null;
      }
      return scale;
    }

    getRecipeRequirements(recipeName) {
      const recipe = this.recipes[recipeName];
      const scale = this.getRecipeScale(recipe);
      if (scale === null || !recipe?.ingredients) return null;
      const requirements = {};
      for (const [ingredient, base] of Object.entries(recipe.ingredients)) {
        const amount = Math.ceil(base * scale);
        if (
          !this.ingredientTypes.some((i) => i.type === ingredient) ||
          !Number.isInteger(base) ||
          base <= 0 ||
          !Number.isFinite(amount) ||
          !Number.isInteger(amount) ||
          amount <= 0
        )
          return null;
        requirements[ingredient] = amount;
      }
      return Object.keys(requirements).length ? requirements : null;
    }

    getRecipeCraftPlan(recipeName) {
      const recipe = this.recipes[recipeName];
      if (
        !recipe ||
        !this.getRecipeTargetBuildingKey(recipeName) ||
        !this.isRecipeUnlocked(recipeName)
      )
        return null;
      const requirements = this.getRecipeRequirements(recipeName);
      const count = recipe.craftCount ?? 0;
      const nextCount = count + 1;
      const nextScale = this.getRecipeScale(recipe, nextCount);
      if (
        !requirements ||
        !Number.isInteger(nextCount) ||
        nextCount - count !== 1 ||
        nextScale === null
      )
        return null;
      if (
        !recipe.effects ||
        !Object.entries(recipe.effects).every(
          ([key, effect]) =>
            this.items[key] &&
            Number.isFinite(effect.productionBonus) &&
            effect.productionBonus >= 0 &&
            Number.isFinite(1 + nextCount * effect.productionBonus),
        )
      )
        return null;
      const inventory = {};
      for (const [ingredient, amount] of Object.entries(requirements)) {
        if (!this.hasEnoughIngredients(ingredient, amount)) return null;
        const current = this.ingredients[ingredient].count;
        const remaining = current - amount;
        if (
          !Number.isInteger(remaining) ||
          remaining < 0 ||
          current - remaining !== amount
        )
          return null;
        inventory[ingredient] = remaining;
      }
      const payout =
        recipe.production * this.getProductionModifiers().temporaryMultiplier;
      if (!Number.isFinite(payout) || payout < 0) return null;
      return { inventory, nextCount, nextScale, payout };
    }

    craftDonut(recipeName) {
      this.settleBeforeMutation();
      const plan = this.getRecipeCraftPlan(recipeName);
      if (!plan) return false;
      // Credit is the only fallible economic operation. Refusal aborts the whole
      // craft; all remaining commits are prevalidated synchronous assignments.
      if (!this.creditDonuts(plan.payout)) return false;
      const recipe = this.recipes[recipeName];
      for (const [ingredient, count] of Object.entries(plan.inventory))
        this.ingredients[ingredient].count = count;
      recipe.craftCount = plan.nextCount;
      recipe.scaling.ingredients.current = plan.nextScale; // Compatibility mirror only.
      this.showNotification(
        `Crafted ${recipeName}! +${this.formatNumber(plan.payout)} donuts.`,
      );
      this.updateTotalPerSecond();
      this.updateDisplay();
      this.updateIngredientList();
      this.requestSave();
      return true;
    }

    canMakeRecipe(recipeName) {
      return this.getRecipeCraftPlan(recipeName) !== null;
    }

    hasEnoughIngredients(ingredient, amount) {
      const count = this.ingredients[ingredient]?.count;
      return (
        Number.isFinite(count) &&
        Number.isInteger(count) &&
        count >= 0 &&
        count >= amount
      );
    }

    addBakerWorker() {
      this.reconcileBakerWorkers();
    }

    reconcileBakerWorkers() {
      // Owned buildings determine output. productionRate is legacy save data.
      this.bakers = (this.bakers || []).slice(0, this.items.baker.count);
      while (this.bakers.length < this.items.baker.count)
        this.bakers.push({ productionRate: this.bakerIngredientsPerCycle });
      this.updateBakerWorkerCount();
    }
    updateBakerWorkerCount() {
      if (!this.canPresent()) return;
      const workerCountElem = document.getElementById("bakerWorkerCount");
      if (workerCountElem)
        workerCountElem.textContent = String(this.bakers.length);
    }
    updateTotalIngredientCount() {
      if (!this.canPresent()) return;
      const totalIngredientCount = Object.values(this.ingredients).reduce(
        (sum, ingredient) => sum + ingredient.count,
        0,
      );

      const ingredientCountElem = document.getElementById("ingredientCount");
      if (ingredientCountElem) {
        ingredientCountElem.textContent = totalIngredientCount;
      }
    }
    generateIngredient() {
      // Uncalled legacy path. Shared settlement uses produceBakerResources();
      // never wire this timestamp/worker-rate implementation back into gameplay.
      if (this.items.baker.count <= 0) return;

      // Süre kontrolü
      if (this.bakerCycleRemainingTime > 0) {
        return; // Süre dolmadıysa üretim yapma
      }

      // Her çalışan üretim hızına göre malzeme üretir
      this.bakers.forEach((baker) => {
        for (let i = 0; i < baker.productionRate; i++) {
          const randomNum = Math.random();
          let cumulativeChance = 0;

          for (let ingredient of this.ingredientTypes) {
            cumulativeChance += ingredient.rarity;
            if (randomNum < cumulativeChance) {
              if (!this.ingredients[ingredient.type]) {
                this.ingredients[ingredient.type] = { count: 0 };
              }
              this.ingredients[ingredient.type].count++;
              break;
            }
          }
        }
      });

      // Üretim tamamlandıktan sonra süreyi sıfırla
      this.bakerCycleRemainingTime = this.bakerProductionInterval;
      this.ingredientPurchaseLimit = 10;

      this.updateIngredientList();
    }
    updateIngredientList() {
      if (!this.canPresent()) return;
      this.updateTotalIngredientCount();
      this.refreshRecipeAvailability();
      const ingredientList = document.getElementById("ingredientList");
      ingredientList.innerHTML = "";

      this.ingredientTypes.forEach((ingredient) => {
        const ingredientData = this.ingredients[ingredient.type] || {
          count: 0,
        };
        const listItem = document.createElement("li");

        listItem.style.opacity = ingredientData.count > 0 ? "1" : "0.5";
        listItem.innerHTML = `<img src="img/${ingredient.type.toLowerCase()}.webp" alt="${
          ingredient.type
        }"> x${ingredientData.count}`;

        ingredientList.appendChild(listItem);
      });
    }
    addWorker() {
      this.reconcileMineWorkers();
    }

    reconcileMineWorkers() {
      // Mine ownership is authoritative; retained worker fields are legacy data.
      this.workers = (this.workers || []).slice(0, this.items.mine.count);
      while (this.workers.length < this.items.mine.count)
        this.workers.push({ productionRate: 3 });
      this.updateWorkerCount();
    }

    updateWorkerCount() {
      if (!this.canPresent()) return;
      const workerCountElem = document.getElementById("workerCount");
      if (workerCountElem) {
        workerCountElem.textContent = String(this.workers.length);
      }
    }

    normalizeOreCount(value) {
      return typeof value === "number" && Number.isFinite(value) && value >= 0
        ? Math.floor(value)
        : 0;
    }

    isValidOreMarketReference(state) {
      return (
        state !== null &&
        typeof state === "object" &&
        !Array.isArray(state) &&
        Number.isFinite(state.referenceScale) &&
        state.referenceScale > 0 &&
        Number.isFinite(state.productionBand) &&
        state.productionBand > 0 &&
        Number.isInteger(state.workforce) &&
        state.workforce > 0 &&
        Number.isInteger(state.stage) &&
        state.stage >= 0 &&
        state.stage < Object.keys(this.items).length &&
        this.oreTypes.every(
          (ore) =>
            Number.isFinite(ore.basePrice * state.referenceScale) &&
            ore.basePrice * state.referenceScale > 0,
        )
      );
    }

    refreshOreMarketReference(preserveQuotes = false) {
      // Never reprice held ore on a building/upgrade purchase. Refresh only at an
      // empty-stock production/purchase checkpoint, using permanent canonical CPS.
      if (
        this.items.mine.count <= 0 ||
        (!preserveQuotes &&
          this.oreTypes.some((ore) => this.ores[ore.type]?.count > 0))
      )
        return;
      const production = this.getProductionBreakdown();
      const capacity =
        production.boostedCPS / production.temporaryMultiplier +
        production.flatCPS;
      if (!production.valid || !Number.isFinite(capacity) || capacity <= 0)
        return;
      const keys = Object.keys(this.items);
      const stage = keys.reduce(
        (highest, key, i) => (this.items[key].count > 0 ? i : highest),
        0,
      );
      const share = Math.max(
        0.03,
        0.2 / (1 + Math.max(0, stage - keys.indexOf("mine"))),
      );
      // Absorb roundoff from removing temporary factors at an exact band boundary.
      const productionBand = Math.pow(
        2,
        Math.floor(Math.log2(capacity) + 1e-12),
      );
      const workforce = this.items.mine.count;
      const expectedValue =
        this.oreTypes.reduce(
          (sum, ore) => sum + ore.basePrice * ore.rarity,
          0,
        ) / this.oreTypes.reduce((sum, ore) => sum + ore.rarity, 0);
      const referenceScale =
        (productionBand / workforce) * ((60 * share) / (5 * expectedValue));
      const next = { referenceScale, productionBand, workforce, stage };
      if (!this.isValidOreMarketReference(next)) return;
      const previousScale = this.oreMarket?.referenceScale;
      if (!preserveQuotes && previousScale !== referenceScale) {
        const quotes = this.oreTypes.map((ore) => {
          const ratio = previousScale
            ? ore.price / (ore.basePrice * previousScale)
            : 1;
          return (
            ore.basePrice * referenceScale * Math.max(0.5, Math.min(2.5, ratio))
          );
        });
        if (quotes.some((quote) => !Number.isFinite(quote) || quote <= 0))
          return;
        this.oreTypes.forEach((ore, i) => {
          ore.price = quotes[i];
          ore.priceHistory = [ore.price]; // A reference change is not a trading return.
        });
      }
      this.oreMarket = next;
    }

    getOreReferencePrice(ore) {
      return ore.basePrice * (this.oreMarket?.referenceScale || 1);
    }

    isOreTransitionQuote(ore) {
      // Ordinary initialized paths cannot reach the safety bounds: the maximum
      // log displacement is 1.2 * volatility / 0.15. Old outliers are sell-only.
      const displacement =
        Math.log(ore.price) - Math.log(this.getOreReferencePrice(ore));
      return Math.abs(displacement) > (1.2 * ore.volatility) / 0.15 + 1e-12;
    }

    getSafeOreMarketState(state, basePrice) {
      const positive = (value) =>
        typeof value === "number" && Number.isFinite(value) && value > 0;
      return {
        price: positive(state?.price) ? state.price : basePrice,
        trend: Number.isFinite(state?.trend)
          ? Math.max(-1, Math.min(1, state.trend))
          : 0,
        priceHistory: Array.isArray(state?.priceHistory)
          ? state.priceHistory.filter(positive).slice(-20)
          : [],
      };
    }
    updateOreList() {
      if (!this.canPresent()) return;
      if (this.items.mine.count <= 0) return;

      const oreList = document.getElementById("oreList");
      oreList.innerHTML = "";

      // Ore listesini güncelle
      this.oreTypes.forEach((ore) => {
        const oreData = this.ores[ore.type] || { count: 0 };
        const listItem = document.createElement("li");

        listItem.style.opacity = oreData.count > 0 ? "1" : "0.5";
        listItem.innerHTML = `<img src="img/${ore.type.toLowerCase()}.webp" alt="${
          ore.type
        }"> x${oreData.count}`;

        oreList.appendChild(listItem);
      });

      // Toplam ore sayısını güncelle (updateTotalOreCount fonksiyonunu buraya taşıdık)
      const totalOreCount = Object.values(this.ores).reduce(
        (sum, ore) => sum + ore.count,
        0,
      );
      const oreCountElem = document.getElementById("oreCount");
      if (oreCountElem) {
        oreCountElem.textContent = totalOreCount;
      }
    }
    updateMarketDisplay() {
      if (!this.canPresent()) return;
      if (this.items.mine.count <= 0) return;
      const marketList = document.getElementById("marketList");
      marketList.innerHTML = "";

      this.oreTypes.forEach((ore) => {
        const card = document.createElement("div");
        card.className = "market-ore-card";
        card.dataset.oreType = ore.type;

        // Fiyat değişim yüzdesini hesapla
        const history = this.getSafeOreMarketState(
          ore,
          ore.basePrice,
        ).priceHistory;
        let changePercent = null;
        let isUp = true;
        if (history.length >= 2) {
          const prev = history[history.length - 2];
          const curr = history[history.length - 1];
          const percent = ((curr - prev) / prev) * 100;
          if (Number.isFinite(percent)) changePercent = percent;
          isUp = curr >= prev;
        }

        // Ore icon
        const iconImg = document.createElement("img");
        iconImg.src = `img/${ore.type.toLowerCase()}.webp`;
        iconImg.alt = ore.type;
        iconImg.className = "market-ore-icon";

        // Info section (name + sparkline chart)
        const infoDiv = document.createElement("div");
        infoDiv.className = "market-ore-info";

        const nameSpan = document.createElement("span");
        nameSpan.className = "market-ore-name";
        nameSpan.textContent = ore.type;
        card.title =
          `Reference: ${this.formatNumber(this.getOreReferencePrice(ore))} donuts. ` +
          (this.isOreTransitionQuote(ore)
            ? "Transition quote: sell only while returning to the normal range."
            : "Prices fluctuate around this reference; Copper is most stable, Diamond most volatile.");

        // Sparkline canvas
        const canvas = document.createElement("canvas");
        canvas.className = "market-ore-chart";
        canvas.width = 120;
        canvas.height = 24;

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(canvas);

        // Price section
        const priceDiv = document.createElement("div");
        priceDiv.className = "market-ore-price";

        const donutIcon = document.createElement("img");
        donutIcon.src = "img/donutMoney.webp";
        donutIcon.alt = "Donut";
        donutIcon.className = "donut-money-icon";

        const priceText = document.createElement("span");
        priceText.textContent =
          Number.isFinite(ore.price) && ore.price > 0
            ? this.formatNumber(ore.price)
            : "Unavailable";
        priceText.className = isUp ? "price-up" : "price-down";

        priceDiv.appendChild(donutIcon);
        priceDiv.appendChild(priceText);

        // Fiyat değişimi badge
        if (changePercent !== null) {
          const changeSpan = document.createElement("span");
          changeSpan.className = `price-change ${isUp ? "price-change-up" : "price-change-down"}`;
          changeSpan.textContent = `${isUp ? "+" : ""}${changePercent.toFixed(1)}%`;
          priceDiv.appendChild(changeSpan);
        }

        card.appendChild(iconImg);
        card.appendChild(infoDiv);
        card.appendChild(priceDiv);
        marketList.appendChild(card);

        // Buy/sell hover class'larını uygula
        if (this.isBuying) card.classList.add("buy-hover");
        if (this.isSelling) card.classList.add("sell-hover");

        // Sparkline çiz
        this.drawSparkline(canvas, history);
      });
    }

    drawSparkline(canvas, data) {
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (data.length < 2) {
        // Yeterli veri yoksa düz çizgi
        ctx.strokeStyle = "rgba(255, 234, 182, 0.15)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        return;
      }

      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;
      const padding = 2;

      // Trend rengi belirle (oyun paleti: yeşil = #81c784, kırmızı/salmon = #fd9193)
      const isUp = data[data.length - 1] >= data[0];
      const color = isUp ? "#81c784" : "#fd9193";

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(
        0,
        isUp ? "rgba(129, 199, 132, 0.3)" : "rgba(253, 145, 147, 0.3)",
      );
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      // Çizgiyi çiz
      ctx.beginPath();
      data.forEach((val, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - padding - ((val - min) / range) * (h - padding * 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = "round";
      ctx.stroke();

      // Fill area
      const lastX = w;
      const firstX = 0;
      ctx.lineTo(lastX, h);
      ctx.lineTo(firstX, h);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    updateMarketPrices(random = Math.random) {
      if (this.items.mine.count <= 0) return;

      this.oreTypes.forEach((ore) => {
        Object.assign(ore, this.getSafeOreMarketState(ore, ore.basePrice));
        // Retain trend memory, with 15% mean reversion in log-price space.
        const trendDrift = (random() - 0.5) * 0.4;
        ore.trend = Math.max(-1, Math.min(1, ore.trend * 0.85 + trendDrift));

        // Fiyat değişimi = trend yönü + rastgele gürültü (ore'a özel volatilite)
        const noise = (random() - 0.5) * ore.volatility;
        const trendEffect = ore.trend * ore.volatility * 0.7;
        const changeFactor = trendEffect + noise;

        const reference = this.getOreReferencePrice(ore);
        const logReference = Math.log(reference);
        const candidate = Math.exp(
          logReference +
            0.85 * (Math.log(ore.price) - logReference) +
            changeFactor,
        );
        if (Number.isFinite(candidate) && candidate > 0) {
          if (this.isOreTransitionQuote(ore)) {
            // Grandfather legacy holdings: no load-time haircut or growing old
            // outliers. Run off toward the ordinary band by at most 5%/cycle.
            ore.price =
              ore.price > reference
                ? Math.max(ore.price * 0.95, Math.min(ore.price, candidate))
                : Math.min(ore.price * 1.05, Math.max(ore.price, candidate));
          } else {
            const bounded = Math.max(
              reference * 0.5,
              Math.min(reference * 2.5, candidate),
            );
            if (Number.isFinite(bounded) && bounded > 0) ore.price = bounded;
          }
        }

        // Fiyat geçmişini kaydet (max 20 nokta)
        ore.priceHistory.push(ore.price);
        ore.priceHistory = ore.priceHistory.slice(-20);
      });

      // Trade limitini her döngüde sıfırla
      this.orePurchaseLimit = 10;
      this.updatePurchaseLimitBadge();
      this.updateMarketDisplay();
    }
    setupMarketButtons() {
      const buyBtn = document.getElementById("buyBtn");
      const sellBtn = document.getElementById("sellBtn");
      const sellAllBtn = document.createElement("button"); // Yeni buton oluştur

      // Sell All butonunu yapılandır
      sellAllBtn.id = "sellAllBtn";
      sellAllBtn.textContent = "Sell All";
      sellAllBtn.className = "market-btn"; // Diğer butonlarla aynı stili kullan

      // Butonu ekle (buyBtn ve sellBtn'nin yanına)
      sellBtn.parentNode.appendChild(sellAllBtn);

      // Mevcut buton dinleyicileri
      buyBtn.addEventListener("click", () => {
        this.isBuying = true;
        this.isSelling = false;
        this.updateMarketButtonStyles();
      });

      sellBtn.addEventListener("click", () => {
        this.isBuying = false;
        this.isSelling = true;
        this.updateMarketButtonStyles();
      });

      // Sell All butonu için dinleyici
      sellAllBtn.addEventListener("click", () => {
        this.sellAllOres();
      });

      // Market listesi dinleyicisi
      document
        .getElementById("marketList")
        .addEventListener("click", (event) => {
          const card = event.target.closest(".market-ore-card");
          if (card) {
            const oreType = card.getAttribute("data-ore-type");
            this.handleMarketTransaction(oreType);
          }
        });
    }
    updateMarketButtonStyles() {
      const buyBtn = document.getElementById("buyBtn");
      const sellBtn = document.getElementById("sellBtn");

      buyBtn.classList.toggle("selected", this.isBuying);
      sellBtn.classList.toggle("selected", this.isSelling);

      document.querySelectorAll(".market-ore-card").forEach((card) => {
        card.classList.toggle("buy-hover", this.isBuying);
        card.classList.toggle("sell-hover", this.isSelling);
      });
    }
    transactOres(quantities, buying = false) {
      this.settleBeforeMutation();
      // One call is one market action. Only sales may batch multiple units.
      const allowance = this.orePurchaseLimit;
      if (
        !Number.isInteger(allowance) ||
        allowance < 1 ||
        allowance > 10 ||
        !quantities ||
        Array.isArray(quantities)
      )
        return false;
      const changes = [];
      let units = 0,
        value = 0;
      for (const [type, quantity] of Object.entries(quantities)) {
        const ore = this.oreTypes.find((o) => o.type === type);
        const stock = this.ores[type]?.count;
        if (
          !ore ||
          !Number.isInteger(quantity) ||
          quantity <= 0 ||
          !Number.isInteger(stock) ||
          stock < 0 ||
          !Number.isFinite(ore.price) ||
          ore.price <= 0
        )
          return false;
        if (buying && (quantity !== 1 || this.isOreTransitionQuote(ore)))
          return false;
        const nextStock = stock + (buying ? quantity : -quantity);
        if (
          !Number.isInteger(nextStock) ||
          nextStock < 0 ||
          Math.abs(nextStock - stock) !== quantity
        )
          return false;
        units += quantity;
        value += ore.price * quantity;
        changes.push({ type, count: nextStock });
      }
      const balance = this.donutCount;
      const nextBalance = balance + (buying ? -value : value);
      if (
        !units ||
        !Number.isFinite(units) ||
        (buying && units !== 1) ||
        !Number.isFinite(value) ||
        value <= 0 ||
        !Number.isFinite(balance) ||
        balance < 0 ||
        !Number.isFinite(nextBalance) ||
        nextBalance < 0 ||
        (buying ? nextBalance >= balance : nextBalance <= balance)
      )
        return false;
      if (buying) this.donutCount = nextBalance;
      else if (!this.creditDonuts(value, false)) return false;
      for (const change of changes) this.ores[change.type].count = change.count;
      this.orePurchaseLimit--;
      return { units, value };
    }

    handleMarketTransaction(oreType) {
      const ore = this.oreTypes.find((o) => o.type === oreType);
      if (!ore) return;

      if (this.orePurchaseLimit <= 0) {
        this.showTransactionError(
          "No market actions left! Wait for next cycle.",
        );
        return;
      }

      if (!this.isBuying && !this.isSelling) return;
      if (this.isBuying && this.isOreTransitionQuote(ore)) {
        this.showTransactionError(
          "This legacy quote is sell only while returning to the normal market range.",
        );
        return;
      }
      if (!this.transactOres({ [oreType]: 1 }, this.isBuying)) {
        this.showTransactionError(
          "Trade could not be completed. Check funds, stock and market price.",
        );
        return;
      }
      this.updatePurchaseLimitBadge();
      this.updateDisplay();
      this.updateOreList();
      this.requestSave();
    }

    updatePurchaseLimitBadge() {
      if (!this.canPresent()) return;
      const badge = document.getElementById("remainingChances");
      if (badge) {
        badge.textContent = `${this.orePurchaseLimit} / 10`;
        badge.title =
          "Market actions remaining. Buy one, Sell one or Sell All each costs one action.";
      }
    }

    // Yeni metod: İşlem hatası gösterimi
    showTransactionError(message) {
      const errorNotification = document.createElement("div");
      errorNotification.className = "transaction-error";
      errorNotification.textContent = message;

      // Mevcut hata bildirimini kaldır
      const existingError = document.querySelector(".transaction-error");
      if (existingError) {
        existingError.remove();
      }

      document.body.appendChild(errorNotification);

      // Animasyon için setTimeout
      setTimeout(() => {
        errorNotification.classList.add("fade-out");
        setTimeout(() => errorNotification.remove(), 300);
      }, 2000);
    }
    setupModal() {
      this.footerContainer = document.getElementById("footer-container");

      // Mine panel kontrolü
      const mineImage = document.querySelector(
        '.store-item[data-item="mine"] .item-img img',
      );
      if (mineImage) {
        mineImage.addEventListener("click", (e) => {
          e.stopPropagation(); // Event'in parent elementlere gitmesini engelle
          if (this.items.mine.count > 0) {
            this.openPanel("mine");
          }
        });
      }

      // Baker panel kontrolü
      const bakerImage = document.querySelector(
        '.store-item[data-item="baker"] .item-img img',
      );
      if (bakerImage) {
        bakerImage.addEventListener("click", (e) => {
          e.stopPropagation(); // Event'in parent elementlere gitmesini engelle
          if (this.items.baker.count > 0) {
            this.openPanel("baker");
          }
        });
      }

      // Kapatma düğmeleri
      const closeMineButton = document.getElementById("close-mine-panel");
      const closeBakerButton = document.getElementById("close-baker-panel");

      if (closeMineButton) {
        closeMineButton.addEventListener("click", () => this.closePanel());
      }

      if (closeBakerButton) {
        closeBakerButton.addEventListener("click", () => this.closePanel());
      }

      // Farm panel kontrolü
      const farmImage = document.querySelector(
        '.store-item[data-item="farm"] .item-img img',
      );
      if (farmImage) {
        farmImage.addEventListener("click", (e) => {
          e.stopPropagation();
          if (this.items.farm.count > 0) {
            this.openPanel("farm");
          }
        });
      }

      const closeFarmButton = document.getElementById("close-farm-panel");
      if (closeFarmButton) {
        closeFarmButton.addEventListener("click", () => this.closePanel());
      }

      // Care window buttons
      const carePetBtn = document.getElementById("care-pet-btn");
      const careTreatBtn = document.getElementById("care-treat-btn");
      if (carePetBtn)
        carePetBtn.addEventListener("click", () =>
          this.performCareAction("pet"),
        );
      if (careTreatBtn)
        careTreatBtn.addEventListener("click", () =>
          this.performCareAction("treat"),
        );

      // Contract reroll
      const rerollBtn = document.getElementById("contract-reroll-btn");
      if (rerollBtn)
        rerollBtn.addEventListener("click", () => this.rerollContracts());

      // Farm tabs
      this.setupFarmTabs();

      // Farm guide button
      const farmGuideBtn = document.getElementById("farm-guide-btn");
      const farmGuideOverlay = document.getElementById("farm-guide-overlay");
      const farmGuideClose = document.getElementById("farm-guide-close");
      if (farmGuideBtn && farmGuideOverlay) {
        farmGuideBtn.addEventListener("click", () =>
          farmGuideOverlay.classList.toggle("hidden"),
        );
      }
      if (farmGuideClose && farmGuideOverlay) {
        farmGuideClose.addEventListener("click", () =>
          farmGuideOverlay.classList.add("hidden"),
        );
      }

      // Expose game instance for inline onclick handlers
      window._game = this;

      // Market Guide butonları
      const guideBtn = document.getElementById("marketGuideBtn");
      const guidePanel = document.getElementById("marketGuidePanel");
      const closeGuide = document.getElementById("closeMarketGuide");

      if (guideBtn && guidePanel) {
        guideBtn.addEventListener("click", () => {
          guidePanel.classList.toggle("hidden");
        });
      }
      if (closeGuide && guidePanel) {
        closeGuide.addEventListener("click", () => {
          guidePanel.classList.add("hidden");
        });
      }
    }

    openPanel(type) {
      // Önce tüm panelleri gizle
      document.querySelectorAll(".footer-panel").forEach((panel) => {
        panel.style.display = "none";
        panel.classList.add("hidden");
      });

      const panel = document.getElementById(`${type}-panel`);
      if (panel) {
        // Footer container'ı göster
        this.footerContainer.style.display = "block";
        this.footerContainer.classList.remove("hidden");
        this.footerContainer.classList.add("visible");

        // İlgili paneli göster
        panel.style.display = "flex"; // Her iki panel için de flex kullan
        panel.classList.remove("hidden");

        // Panel içeriğini güncelle
        if (type === "mine") {
          // Eğer priceHistory boşsa başlangıç fiyatını ekle
          this.oreTypes.forEach((ore) => {
            if (ore.priceHistory.length === 0) {
              ore.priceHistory.push(ore.price);
            }
          });
          this.updateOreList();
          this.updateMarketDisplay();
          this.updatePurchaseLimitBadge();
        } else if (type === "baker") {
          this.updateIngredientList();
          this.setupRecipeBook();
        } else if (type === "farm") {
          this.updateFarmDisplay();
        }
      }
    }

    closePanel() {
      // Tüm panelleri gizle
      document.querySelectorAll(".footer-panel").forEach((panel) => {
        panel.classList.add("hidden");
      });

      // Footer container'ı gizle
      this.footerContainer.classList.remove("visible");
      this.footerContainer.classList.add("hidden");

      setTimeout(() => {
        this.footerContainer.style.display = "none";
      }, 500);
    }
    showInfoPanel(upgrade, itemName) {
      const infoPanel = document.getElementById("info-panel");

      const formattedItemName = itemName
        .replace(/([A-Z])/g, " $1")
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");

      const costColor = this.donutCount >= upgrade.cost ? "#6f6" : "red";
      const formattedCost = this.formatNumber(upgrade.cost, "cost");

      // Multiplier değerine göre metin oluştur
      const getEfficiencyText = (multiplier) => {
        if (multiplier === 2) return "doubles";
        if (multiplier === 3) return "triples";
        if (multiplier === 4) return "quadruples";
        if (multiplier === 5) return "quintuples";
        return `multiplies production by ${multiplier}x`; // Diğer değerler için
      };

      let efficiencyText;
      if (itemName === "donutUpgrades") {
        efficiencyText = "Total donuts/sec is increased by 3%";
      } else if (itemName === "nonItemUpgrades") {
        if (upgrade.specialEffect === "automation") {
          efficiencyText =
            "I'll help you catch those delicious falling donuts!";
        } else {
          efficiencyText = "Clicking gains +1% of your DpS";
        }
      } else if (upgrade.specialEffect === "dynamicBoost") {
        efficiencyText =
          "Your non-cursor buildings boost both cursor output and click power.";
      } else {
        const multiplierText = getEfficiencyText(upgrade.multiplier);
        efficiencyText = `<strong>${formattedItemName}</strong> production ${multiplierText}!`;
      }

      infoPanel.innerHTML = `
      <div class="header">
        <img src="img/${upgrade.img}" alt="${upgrade.name}">
        <h4>${upgrade.name}</h4>
        <span class="cost" style="color: ${costColor}; display: inline-flex; align-items: center;">
          <img src="img/donutMoney.webp" alt="Donut Money" style="height: 12px; width: 12px; margin-right: 5px;">
          ${formattedCost}
        </span>
      </div>
      <p class='efficiency-text'>${efficiencyText}</p>
      <p class="description">"${upgrade.description}"</p>
    `;

      infoPanel.style.display = "block";

      const upgradeList = document.getElementById("upgrade-list");
      const rect = upgradeList.getBoundingClientRect();
      infoPanel.style.left = `${rect.left - infoPanel.offsetWidth - 10}px`;
      infoPanel.style.top = `${rect.top}px`;
    }
    hideInfoPanel() {
      const infoPanel = document.getElementById("info-panel");
      infoPanel.style.display = "none";
    }
    showItemInfo(itemKey) {
      if (!this.canPresent() || window.innerWidth <= 764) return;
      this._hideItemInfo?.();

      const item = this.items[itemKey];
      const itemInfoPanel = document.getElementById("item-info-panel");

      // DOM elementlerini bir kere seç
      const elements = {
        name: document.getElementById("item-info-name"),
        image: document.getElementById("item-info-image"),
        owned: document.getElementById("item-info-owned"),
        cost: document.getElementById("item-info-cost"),
        feature: document.getElementById("item-info-feature"),
      };

      const imagePath = `${itemKey}.webp`;
      if (!this.imageCache.has(imagePath)) {
        const img = new Image();
        img.src = `img/${imagePath}`;
        this.imageCache.set(imagePath, img);
      }

      elements.image.src = this.imageCache.get(imagePath).src;
      elements.name.innerHTML = `<strong>${item.name}</strong>`;
      elements.feature.innerHTML = `
        <div class="item-info-line" data-role="per-unit"></div>
        <div class="item-info-line" data-role="total-output"></div>
        <div class="item-info-line" data-role="total-produced"></div>
        <div class="item-info-line" data-role="contribution" style="color: #FFD700;"></div>
        <div class="item-info-line" data-role="upgrades"></div>
        <div class="item-info-line" data-role="bonus"></div>
      `;

      const featureNodes = {
        perUnit: elements.feature.querySelector('[data-role="per-unit"]'),
        totalOutput: elements.feature.querySelector(
          '[data-role="total-output"]',
        ),
        totalProduced: elements.feature.querySelector(
          '[data-role="total-produced"]',
        ),
        contribution: elements.feature.querySelector(
          '[data-role="contribution"]',
        ),
        upgrades: elements.feature.querySelector('[data-role="upgrades"]'),
        bonus: elements.feature.querySelector('[data-role="bonus"]'),
      };
      const featureCache = {
        cost: "",
        costColor: "",
        owned: "",
        perUnit: "",
        totalOutput: "",
        totalProduced: "",
        contribution: "",
        upgrades: "",
        bonus: "",
      };

      const updateItemInfo = () => {
        const production = this.getProductionBreakdown();
        const currentProduction = production.buildings[itemKey].perUnit;

        const ownedText = `Owned: ${item.count}`;
        if (featureCache.owned !== ownedText) {
          elements.owned.textContent = ownedText;
          featureCache.owned = ownedText;
        }

        const purchaseCost = this.getBulkPricePreview(
          itemKey,
          this.purchaseAmount,
        );
        const costColor = this.donutCount >= purchaseCost ? "#6f6" : "red";
        const formattedCost = this.formatNumber(purchaseCost, "cost");
        if (
          featureCache.cost !== formattedCost ||
          featureCache.costColor !== costColor
        ) {
          elements.cost.innerHTML = `
        <img src="img/donutMoney.webp" alt="donut icon" class="icon" />
        <span style="color: ${costColor};">${formattedCost}</span>
      `;
          featureCache.cost = formattedCost;
          featureCache.costColor = costColor;
        }

        const itemProduction = production.buildings[itemKey].effectiveCPS;
        const formattedCurrentProduction = this.formatNumber(
          currentProduction,
          "perSecond",
        );
        const formattedItemProduction =
          itemProduction < 1000
            ? this.formatNumber(itemProduction, "perSecond")
            : this.formatNumber(itemProduction, "count");
        const totalProduction = production.effectiveCPS;

        // Contributing yüzdesini hesapla
        let percentageOfTotal = 0;
        if (totalProduction > 0) {
          percentageOfTotal = (itemProduction / totalProduction) * 100;
        }

        const perUnitText = `Each <strong>${item.name}</strong> produces <strong>${formattedCurrentProduction} donuts</strong> per second`;
        const buildingLabel = item.count === 1 ? item.name : `${item.name}s`;
        const totalOutputText = `${this.formatNumber(item.count, "count")} <strong>${buildingLabel}</strong> producing <strong>${formattedItemProduction} donuts</strong> per second`;
        const totalProducedText = `Total produced: ${this.formatNumber(item.totalProduced, "count")}`;
        const contributionText = `Contributing ${percentageOfTotal.toFixed(1)}% of total production`;

        // Upgrade bilgilerini ekle
        let upgradesMarkup = "";
        if (this.upgrades[itemKey]) {
          const purchasedUpgrades = this.upgrades[itemKey]
            .filter((upgrade) => upgrade.purchased)
            .map(
              (upgrade) =>
                `<img src="img/${upgrade.img}" alt="${upgrade.name}" class="upgrade-icon" />`,
            )
            .join("");

          if (purchasedUpgrades) {
            upgradesMarkup = `Purchased upgrades: <div class="upgrades-container">${purchasedUpgrades}</div>`;
          } else {
            upgradesMarkup = "No upgrades purchased yet.";
          }
        }

        // Recipe bonus bilgilerini ekle
        let bonusMarkup = "";
        const recipeBonuses = this.getRecipeBonusDetailsForBuilding(itemKey);
        if (recipeBonuses.length > 0) {
          bonusMarkup = recipeBonuses
            .map(({ recipeName, totalBonusPercent }) => {
              const formattedBonus = Number.isInteger(totalBonusPercent)
                ? totalBonusPercent.toString()
                : totalBonusPercent.toFixed(1);
              return `<span style="color: #98FB98;">${recipeName} Bonus: +${formattedBonus}% production</span>`;
            })
            .join("<br>");
        }

        if (featureCache.perUnit !== perUnitText) {
          featureNodes.perUnit.innerHTML = perUnitText;
          featureCache.perUnit = perUnitText;
        }
        if (featureCache.totalOutput !== totalOutputText) {
          featureNodes.totalOutput.innerHTML = totalOutputText;
          featureCache.totalOutput = totalOutputText;
        }
        if (featureCache.totalProduced !== totalProducedText) {
          featureNodes.totalProduced.textContent = totalProducedText;
          featureCache.totalProduced = totalProducedText;
        }
        if (featureCache.contribution !== contributionText) {
          featureNodes.contribution.textContent = contributionText;
          featureCache.contribution = contributionText;
        }
        if (featureCache.upgrades !== upgradesMarkup) {
          featureNodes.upgrades.innerHTML = upgradesMarkup;
          featureCache.upgrades = upgradesMarkup;
        }
        if (featureCache.bonus !== bonusMarkup) {
          featureNodes.bonus.innerHTML = bonusMarkup;
          featureCache.bonus = bonusMarkup;
        }
      };

      let frameRequest;
      let lastUpdate = 0;
      const UPDATE_INTERVAL = this.isMobile ? 320 : 220;

      const tick = (timestamp) => {
        if (!this.canPresent()) {
          hidePanel();
          return;
        }
        if (timestamp - lastUpdate >= UPDATE_INTERVAL) {
          updateItemInfo();
          lastUpdate = timestamp;
        }
        frameRequest = requestAnimationFrame(tick);
      };

      // İlk güncellemeyi hemen yap
      updateItemInfo();
      frameRequest = requestAnimationFrame(tick);

      // Panel pozisyonunu ayarla
      itemInfoPanel.style.display = "block";
      const storeItem = document.querySelector(
        `.store-item[data-item="${itemKey}"]`,
      );
      const rect = storeItem.getBoundingClientRect();
      const panelRect = itemInfoPanel.getBoundingClientRect();

      // Ekran sınırlarına göre pozisyonla
      let leftPosition = rect.left - panelRect.width - 10;
      if (leftPosition < 0) leftPosition = rect.right + 10;

      let topPosition = rect.top;
      if (topPosition + panelRect.height > window.innerHeight) {
        topPosition = window.innerHeight - panelRect.height - 10;
      }

      itemInfoPanel.style.left = `${leftPosition}px`;
      itemInfoPanel.style.top = `${topPosition}px`;

      // Temizleme işlemi
      const hidePanel = () => {
        cancelAnimationFrame(frameRequest);
        itemInfoPanel.style.display = "none";
        storeItem.removeEventListener("mouseleave", hidePanel);
        if (this._hideItemInfo === hidePanel) this._hideItemInfo = null;
      };

      this._hideItemInfo = hidePanel;
      storeItem.addEventListener("mouseleave", hidePanel);
    }
    calculatePrestigeThreshold(prestigeCount = 0) {
      const safePrestigeCount = Math.max(0, Number(prestigeCount) || 0);
      return Math.ceil(
        this.PRESTIGE_BASE_THRESHOLD *
          Math.pow(this.PRESTIGE_THRESHOLD_GROWTH, safePrestigeCount),
      );
    }
    canPrestige() {
      return this.totalDonutsEarned >= this.nextPrestigeThreshold;
    }
    resetRunStateForPrestige() {
      this.invalidateProductionSnapshot();
      this.timeState.mineProgress = 0;
      this.timeState.bakerProgress = 0;
      this.lastUpdateTime = this.timeState.settledAt;
      this.oreMarket = null;
      this.workers = [];
      this.updateWorkerCount();
      this.bakers = [];
      this.ingredients = {};
      this.reconcileBakerWorkers();
      this.updateIngredientList();
      this.ores = this.oreTypes.reduce((acc, ore) => {
        acc[ore.type] = { count: 0 };
        return acc;
      }, {});
      this.oreTypes.forEach((ore) => {
        ore.price = ore.basePrice;
        ore.priceHistory = [];
        ore.trend = 0;
      });
      this.orePurchaseLimit = 10;
      const mastery = { ...this.farmState.mastery };
      this.farmState = this.createDefaultFarmState();
      this.farmState.mastery = mastery;
      this.farmNextAnimalId = 1;
      this._breedSelection = {};
      this._breedProgram = "quick";
      this._expandedAnimalTypes = {};
      const barn = document.getElementById("farm-animal-grid");
      if (barn) barn.innerHTML = "";
      const breeding = document.getElementById("farm-breeding-slots");
      if (breeding) delete breeding.dataset.rendered;
      this.updateFarmMasteryBadge();
      this.lastBakerProduction = this.timeState.settledAt;
      this.lastMineProduction = this.timeState.settledAt;
      this.closePanel();
    }
    updatePrestigeBar() {
      if (!this.canPresent()) return;
      const prestigeBarFill = document.getElementById("prestigeBarFill");
      const prestigePoints = document.getElementById("prestigePoints");
      const nextPrestigeText = document.getElementById("nextPrestigeThreshold");

      const progress = Math.min(
        this.totalDonutsEarned / this.nextPrestigeThreshold,
        1,
      );
      prestigeBarFill.style.width = `${progress * 100}%`;

      if (progress === 1) {
        prestigeBarFill.classList.add("full");
      } else {
        prestigeBarFill.classList.remove("full");
      }

      prestigePoints.textContent = `Prestige Points: ${this.prestigeCount}`;
      nextPrestigeText.textContent = `Next Prestige at: ${this.formatNumber(
        this.nextPrestigeThreshold,
      )} donuts`;
    }
    performPrestige() {
      this.settleBeforeMutation();
      if (!this.canPrestige()) return;

      this.prestigeCount++;

      for (let key in this.items) {
        this.items[key].count = 0;
        this.items[key].baseCost = this.items[key].originalBaseCost;
        this.items[key].totalProduced = 0;
      }

      for (let key in this.upgrades) {
        this.upgrades[key].forEach((upgrade) => {
          upgrade.purchased = false;
        });
      }

      this.rebuildItemProductionsFromSaveState();
      this.resetRunStateForPrestige();

      this.donutCount = 0;
      this.totalDonutsEarned = 0;
      this.totalClicks = 0;
      this.nextPrestigeThreshold = this.calculatePrestigeThreshold(
        this.prestigeCount,
      );

      // Reset run-based quest tracking
      this.questTracking.currentRun = {
        spentAtTier: {},
        totalProduced: 0,
        totalSpent: 0,
        questsCompleted: 0,
      };

      // Reset multiplier state
      this.multiplierState = { active: null, queued: null };
      this.activeMultipliers = [];

      // Reset milestone quests (run-based)
      this.milestoneQuests = this.initializeMilestoneQuests();

      // Clear dynamic quest slots
      for (const slotId of Object.keys(this.dynamicSlots)) {
        this.dynamicSlots[slotId].currentQuest = null;
        this.dynamicSlots[slotId].cooldownEnd = null;
      }

      // Reset CPS history
      this.cpsHistory = [];

      this.clearUpgradeList();
      this.updatePrestigeBar();
      this.updateDisplay();
      this.invalidateProductionSnapshot();
      this.updateTotalPerSecond();
      this.saveGame({ silent: true });
    }
    setupPrestigeModal() {
      const prestigeModal = document.getElementById("prestigeModal");
      const closeModal = document.getElementById("closeModal");
      const prestigeYes = document.getElementById("prestigeYes");
      const prestigeNo = document.getElementById("prestigeNo");

      document.getElementById("prestige").addEventListener("click", () => {
        if (this.canPrestige()) {
          prestigeModal.style.display = "block";
        }
      });

      prestigeYes.addEventListener("click", () => {
        this.performPrestige();
        prestigeModal.style.display = "none";
      });

      prestigeNo.addEventListener("click", () => {
        prestigeModal.style.display = "none";
      });

      closeModal.addEventListener("click", () => {
        prestigeModal.style.display = "none";
      });

      window.addEventListener("click", (event) => {
        if (event.target === prestigeModal) {
          prestigeModal.style.display = "none";
        }
      });
    }
    clearUpgradeList() {
      const upgradeListDiv = document.getElementById("upgrade-list");
      while (upgradeListDiv.firstChild) {
        upgradeListDiv.removeChild(upgradeListDiv.firstChild);
      }
    }
    capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    getDonutUpgradeProductionMultiplier() {
      if (!this.upgrades.donutUpgrades) return 1;

      return this.upgrades.donutUpgrades.reduce((multiplier, upgrade) => {
        if (!upgrade.purchased) return multiplier;
        return multiplier * this.economicFactor(upgrade.multiplier);
      }, 1);
    }

    isDonutUpgradeUnlocked(upgrade) {
      if (!upgrade) return false;

      if (upgrade.type === "totalProduced") {
        return this.totalDonutsEarned >= upgrade.requirement;
      }

      if (upgrade.type === "perSecond") {
        return this.totalPerSecond >= upgrade.requirement;
      }

      return false;
    }

    playRandomClickSound() {
      const randomIndex = Math.floor(Math.random() * this.clickSounds.length);
      this.clickSounds[randomIndex].play();
    }
    createFallingDonut(x, y) {
      const images = ["donutNew.webp", "donut5.webp", "chocoDonut.webp"];
      const randomImage = images[Math.floor(Math.random() * images.length)];

      // Önbellekten resmi al veya yeni oluştur
      let fallingDonut;
      if (this.imageCache.has(randomImage)) {
        fallingDonut = this.imageCache.get(randomImage).cloneNode();
      } else {
        fallingDonut = new Image();
        fallingDonut.src = `img/${randomImage}`;
        this.imageCache.set(randomImage, fallingDonut.cloneNode());
      }

      fallingDonut.classList.add("falling-donut");

      fallingDonut.style.left = `${x}px`;
      fallingDonut.style.top = `${y}px`;

      const randomAnimation = this.getRandomAnimation();
      const horizontalDistance = this.getRandomDistance();
      const animationDuration = Math.random() * 0.5 + 0.5;

      fallingDonut.style.animationName = randomAnimation;
      fallingDonut.style.animationDuration = `${animationDuration}s`;
      fallingDonut.style.setProperty(
        "--horizontalDistance",
        `${horizontalDistance}px`,
      );

      fallingDonut.style.animationTimingFunction = "ease-in-out";
      fallingDonut.style.animationRotation = `${Math.random() * 360}deg`;

      this.activeAnimationElements++; // Increment for the donut itself
      document.body.appendChild(fallingDonut);

      setTimeout(() => {
        document.body.removeChild(fallingDonut);
        this.activeAnimationElements--;
      }, animationDuration * 1000);
    }
    getRandomAnimation() {
      const animations = ["bounceLeft", "bounceRight", "bounceUp"];
      const randomIndex = Math.floor(Math.random() * animations.length);
      return animations[randomIndex];
    }
    getRandomDistance() {
      return Math.floor(Math.random() * 20) + 10;
    }
    restoreTimeState(saved) {
      const now = Date.now();
      if (saved.timeState) this.timeState = { ...saved.timeState };
      else {
        const at = saved.lastActiveTime ?? now;
        this.timeState = this.createTimeState(at);
        this.timeState.randomState =
          parseInt(this.generateChecksum(saved), 36) >>> 0 || 1;
        this.timeState.mineProgress =
          saved.lastMineProduction === undefined
            ? 0
            : Math.max(
                0,
                Math.min(
                  this.workerProductionInterval - 0.001,
                  at - saved.lastMineProduction,
                ),
              );
        this.timeState.bakerProgress =
          saved.lastBakerProduction === undefined
            ? 0
            : Math.max(
                0,
                Math.min(
                  this.bakerProductionInterval - 0.001,
                  at - saved.lastBakerProduction,
                ),
              );
      }
      if (!this.timeState.inactive) this.timeState.inactiveElapsed = 0;
      this.timeState.inactive = true;
      const gap = Math.max(0, now - this.timeState.settledAt);
      this._timeMonotonic = performance.now();
      const earnings = this.settleTime(now);
      this.timeState.inactive = document.visibilityState === "hidden";
      if (!this.timeState.inactive) this.timeState.inactiveElapsed = 0;
      this._timeMonotonic = performance.now();
      // Notification threshold is presentation only; even short gaps are credited.
      if (gap >= 60000 && earnings > 0)
        this.showOfflineModal(Math.min(gap, this.MAX_OFFLINE_TIME), earnings);
    }

    calculateOfflineEarnings() {
      // Compatibility adapter: never backdate or independently replay a checkpoint.
      return this.settleTime();
    }

    showOfflineModal(offlineTime, earnings) {
      const modal = document.getElementById("offlineModal");
      const timeText = document.getElementById("offlineTimeText");
      const earningsText = document.getElementById("offlineEarningsText");
      const closeBtn = document.getElementById("closeOfflineModal");

      if (!modal || !timeText || !earningsText || !closeBtn) return;

      // Süreyi formatla (Saat:Dakika:Saniye)
      const hours = Math.floor(offlineTime / 3600000);
      const minutes = Math.floor((offlineTime % 3600000) / 60000);
      const seconds = Math.floor((offlineTime % 60000) / 1000);

      let timeString = "";
      if (hours > 0) timeString += `${hours}h `;
      if (minutes > 0) timeString += `${minutes}m `;
      if (seconds > 0 || timeString === "") timeString += `${seconds}s`;

      timeText.textContent = `You were away for ${timeString.trim()}`;
      earningsText.textContent = `+${this.formatNumber(earnings)} donuts`;

      modal.style.display = "flex";

      closeBtn.onclick = () => {
        modal.style.display = "none";
        this.lastActiveTime = Date.now();
        this.saveGame();
        this.updateDisplay();
      };

      // Click outside to close
      modal.onclick = (e) => {
        if (e.target === modal) {
          modal.style.display = "none";
          this.lastActiveTime = Date.now();
          this.saveGame();
          this.updateDisplay();
        }
      };
    }

    formatNumber(number, type = "count") {
      // Cache sistemini sınıf seviyesinde tanımla
      if (!this._numberCache) {
        this._numberCache = new Map();
        this._cacheDuration = 1000; // 1 saniye cache süresi
        this._lastCacheClear = Date.now();
      }

      // Cache'i belirli aralıklarla temizle
      const now = Date.now();
      if (now - this._lastCacheClear > this._cacheDuration) {
        this._numberCache.clear();
        this._lastCacheClear = now;
      }

      const cacheKey = `${number}-${type}`;
      const cachedResult = this._numberCache.get(cacheKey);
      if (cachedResult) return cachedResult;

      // Sabit değerleri bir kere tanımla
      const numberSuffixes = new Map([
        [1e48, "quindecillion"],
        [1e45, "quattuordecillion"],
        [1e42, "tredecillion"],
        [1e39, "duodecillion"],
        [1e36, "undecillion"],
        [1e33, "decillion"],
        [1e30, "nonillion"],
        [1e27, "octillion"],
        [1e24, "septillion"],
        [1e21, "sextillion"],
        [1e18, "quintillion"],
        [1e15, "quadrillion"],
        [1e12, "trillion"],
        [1e9, "billion"],
        [1e6, "million"],
      ]);

      let result;
      if (type === "suffix") {
        // Sadece suffix için
        for (const [value, suffix] of numberSuffixes) {
          if (number >= value) {
            result = `${(number / value).toFixed(3)} ${suffix}`;
            break;
          }
        }
      } else if (type === "perSecond") {
        if (number < 1000) {
          result = number.toFixed(1).replace(".", ",");
        } else if (number < 1e6) {
          result = number
            .toFixed(1)
            .replace(".", ",")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        } else {
          for (const [value, suffix] of numberSuffixes) {
            if (number >= value) {
              result = `${(number / value)
                .toFixed(3)
                .replace(".", ",")
                .replace(/\.?0+$/, "")} ${suffix}`;
              break;
            }
          }
        }
      } else {
        if (number < 1000) {
          result = Math.floor(number).toString();
        } else if (number < 1e6) {
          result = Math.floor(number)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        } else {
          for (const [value, suffix] of numberSuffixes) {
            if (number >= value) {
              result = `${(number / value)
                .toFixed(3)
                .replace(/\.?0+$/, "")} ${suffix}`;
              break;
            }
          }
        }
      }

      // Sonucu cache'e kaydet
      this._numberCache.set(cacheKey, result);
      return result || number.toString();
    }
    updateTitleWithDonuts() {
      if (!this.canPresent()) return;
      if (!this.hasDonutClicked) return;
      document.title = `${this.formatNumber(
        this.donutCount,
      )} donuts - Donut Clicker`;
    }

    updateStatsDisplay() {
      if (!this.canPresent() || !this.isStatsPanelOpen()) return;
      return this.withProductionSnapshot(() => {
        // DOM elementlerini bir kere seç
        const elements = {
          totalDonuts: document.getElementById("total-donuts"),
          donutsProduced: document.getElementById("donuts-produced"),
          totalItems: document.getElementById("total-items"),
          donutsPerSecond: document.getElementById("donuts-per-second"),
          clickValue: document.getElementById("click-value"),
          totalClicks: document.getElementById("total-clicks"),
        };

        // Değerleri hesapla
        const totalItems = Object.values(this.items).reduce(
          (acc, item) => acc + item.count,
          0,
        );
        this.lastClickValue = this.calculateClickValue();

        // Tek seferde DOM güncellemelerini yap
        const updates = {
          totalDonuts: this.donutCount,
          donutsProduced: this.totalDonutsEarned,
          totalItems: totalItems,
          donutsPerSecond: this.totalPerSecond,
          clickValue: this.lastClickValue,
          totalClicks: this.totalClicks,
        };
        const formatTypes = {
          totalDonuts:
            this.donutCount < 1000 && this.totalPerSecond < 10
              ? "perSecond"
              : "count",
          donutsProduced: this.totalDonutsEarned < 1000 ? "perSecond" : "count",
          totalItems: "count",
          donutsPerSecond: "perSecond",
          clickValue: "perSecond",
          totalClicks: "count",
        };

        // Already a paced/open-view request; write current values without a RAF queue.
        for (const [key, value] of Object.entries(updates)) {
          if (elements[key]) {
            elements[key].textContent = this.formatNumber(
              value,
              formatTypes[key] || "count",
            );
          }
        }
      }, this.getGameTime());
    }

    // Notification yönetimi için yeni bir sınıf özelliği
    _showNotification(message, duration = 3000, options = {}) {
      if (!this.canPresent()) {
        if (options.storageWarning) this._pendingStorageWarning = message;
        return;
      }
      if (!this._notificationQueue) {
        this._notificationQueue = [];
      }
      if (typeof this._notificationActive !== "boolean") {
        this._notificationActive = false;
      }
      if (typeof this._notificationQueueLimit !== "number") {
        this._notificationQueueLimit = 5;
      }
      if (typeof this._notificationOverflowCount !== "number") {
        this._notificationOverflowCount = 0;
      }

      // Multiplier mesajlarını formatla
      if (message.includes("production multiplier")) {
        message = message.replace(/(\d+\.?\d*)x/, (match) => {
          const number = parseFloat(match);
          return number.toFixed(2) + "x";
        });
      }

      // Animasyon ve kaldırma işlemlerini yönet
      const showNotification = () => {
        const notification = document.createElement("div");
        notification.className = "quest-notification";
        notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
      </div>
    `;

        this._notificationActive = true;

        const closeNotification = () => {
          if (!notification.isConnected && !this._notificationActive) return;

          notification.remove();
          this._notificationActive = false;

          if (this._notificationQueue.length > 0) {
            const nextNotification = this._notificationQueue.shift();
            nextNotification();
          } else if (this._notificationOverflowCount > 0) {
            const overflowCount = this._notificationOverflowCount;
            this._notificationOverflowCount = 0;
            this._showNotification(
              `+${overflowCount} more quest update${overflowCount === 1 ? "" : "s"}`,
              2200,
              { bypassQuestCap: true },
            );
          }
        };

        this._notificationFrame = requestAnimationFrame(() => {
          this._notificationFrame = null;
          if (!this.canPresent()) {
            this._notificationActive = false;
            return;
          }
          document.body.appendChild(notification);
          notification.style.opacity = "1";
          notification.style.transform = "translateY(0)";

          setTimeout(() => {
            notification.style.opacity = "0";
            notification.style.transform = "translateY(-20px)";
            notification.addEventListener("transitionend", closeNotification, {
              once: true,
            });

            // transitionend tetiklenmezse kuyruğun kilitlenmesini engelle
            setTimeout(closeNotification, 400);
          }, duration);
        });
      };

      const stackDepth =
        this._notificationQueue.length +
        (this._notificationActive ||
        document.querySelector(".quest-notification")
          ? 1
          : 0);

      if (
        options.questProgress &&
        !options.bypassQuestCap &&
        stackDepth >= this._notificationQueueLimit
      ) {
        this._notificationOverflowCount++;
        return;
      }

      // Eğer aktif bildirim yoksa hemen göster, varsa kuyruğa ekle
      if (
        this._notificationActive ||
        document.querySelector(".quest-notification")
      ) {
        this._notificationQueue.push(showNotification);
      } else {
        showNotification();
      }
    }

    // Eski showNotification fonksiyonlarını kaldır ve yeni fonksiyonu kullan
    showNotification(message, duration = 3000, options = {}) {
      this._showNotification(message, duration, options);
    }

    showGameSaved() {
      this._showNotification("Game saved!", 2000);
    }

    updateActiveMultiplierDisplay() {
      if (!this.canPresent()) return;
      const display = document.getElementById("active-multiplier-display");
      if (display) {
        display.textContent = `Active Multiplier: ${this.getProductionModifiers().temporaryMultiplier.toFixed(
          2,
        )}x`;
      }
    }

    sellAllOres() {
      this.settleBeforeMutation();
      if (this.orePurchaseLimit <= 0) {
        this.showTransactionError(
          "No market actions left! Wait for next cycle.",
        );
        return false;
      }
      const quantities = {};
      // Full liquidation in visible ore order, prepared/credited as one action.
      for (const ore of this.oreTypes) {
        const count = this.ores[ore.type]?.count;
        if (!Number.isInteger(count) || count < 0) {
          this.showTransactionError(
            "Ore inventory is invalid. No ores were sold.",
          );
          return false;
        }
        if (count > 0) quantities[ore.type] = count;
      }
      if (!Object.keys(quantities).length) {
        this.showNotification("No ores to sell!");
        return false;
      }
      const sale = this.transactOres(quantities);
      if (!sale) {
        this.showTransactionError(
          "Sale could not be completed safely. Your ores and trades have been kept.",
        );
        return false;
      }
      this.showNotification(
        `Sold ${this.formatNumber(sale.units)} ores for ${this.formatNumber(sale.value)} donuts! Used 1 market action.`,
      );
      this.updatePurchaseLimitBadge();
      this.updateDisplay();
      this.updateOreList();
      this.requestSave();
      return true;
    }
    getRandomBakeryName() {
      const randomIndex = Math.floor(Math.random() * this.bakeryNames.length);
      return this.bakeryNames[randomIndex];
    }
    updateBakeryName() {
      const bakeryNameElement = document.getElementById("bakery-name");
      if (bakeryNameElement) {
        // Eğer localStorage'da isim varsa onu kullan, yoksa rastgele bir isim ata VE kaydet
        let savedName =
          this.readStorage("bakeryName").value || this.currentBakeryName;
        if (!savedName) {
          savedName = this.getRandomBakeryName() + "'s Bakery";
          this.writeStorage("bakeryName", savedName);
        }
        this.currentBakeryName = savedName;
        bakeryNameElement.textContent = this.currentBakeryName;
      }
    }
    closeAllMenus(except = null) {
      // Sadece masaüstü menüleri için
      if (!this.isMobile) {
        const menus = [
          "stats-menu",
          "information-menu",
          "settings-menu",
          "guides-menu",
        ];
        menus.forEach((menu) => {
          if (menu !== except) {
            document.getElementById(menu).classList.add("hidden");
          }
        });
      }
    }

    setupStatsMenu() {
      const statsButton = document.getElementById("stats-button");
      const statsMenu = document.getElementById("stats-menu");
      const closeStatsButton = document.getElementById("close-stats-menu");

      if (!this.isMobile && statsButton) {
        statsButton.addEventListener("click", () => {
          if (!statsMenu.classList.contains("hidden")) {
            statsMenu.classList.add("hidden");
          } else {
            this.closeAllMenus("stats-menu");
            statsMenu.classList.remove("hidden");
            this.updateStatsDisplay();
          }
        });

        closeStatsButton.addEventListener("click", () => {
          statsMenu.classList.add("hidden");
        });
      }
    }

    setupInfoMenu() {
      const infoButton = document.getElementById("info-button");
      const informationMenu = document.getElementById("information-menu");
      const closeButton = document.getElementById("close-menu");

      if (!this.isMobile && infoButton) {
        infoButton.addEventListener("click", () => {
          if (!informationMenu.classList.contains("hidden")) {
            informationMenu.classList.add("hidden");
          } else {
            this.closeAllMenus("information-menu");
            informationMenu.classList.remove("hidden");
          }
        });

        closeButton.addEventListener("click", () => {
          informationMenu.classList.add("hidden");
        });
      }
    }

    setupSettingsMenu() {
      const settingsButton = document.getElementById("settings-button");
      const settingsMenu = document.getElementById("settings-menu");
      const closeSettingsButton = document.getElementById(
        "close-settings-menu",
      );
      const saveButton = document.getElementById("save-button");
      const volumeSlider = document.getElementById("volume-slider");

      if (!this.isMobile && settingsButton) {
        settingsButton.addEventListener("click", () => {
          if (!settingsMenu.classList.contains("hidden")) {
            settingsMenu.classList.add("hidden");
          } else {
            this.closeAllMenus("settings-menu");
            settingsMenu.classList.remove("hidden");
          }
        });

        closeSettingsButton.addEventListener("click", () => {
          settingsMenu.classList.add("hidden");
        });
      }

      // Bu event listener'lar her iki modda da çalışmalı
      if (volumeSlider) {
        volumeSlider.value = this.clickSounds[0].volume;
        volumeSlider.addEventListener("input", (event) => {
          const volume = event.target.value;
          this.clickSounds.forEach((sound) => {
            sound.volume = volume;
          });
          this.requestSave();
        });
      }

      if (saveButton) {
        saveButton.addEventListener("click", () => {
          this.saveGame();
          if (!this.isMobile) {
            settingsMenu.classList.add("hidden");
          }
        });
      }
    }

    setupGuidesMenu() {
      const guidesButton = document.getElementById("guides-button");
      const guidesMenu = document.getElementById("guides-menu");

      if (!this.isMobile && guidesButton && guidesMenu) {
        guidesButton.addEventListener("click", (event) => {
          event.stopPropagation();
          if (!guidesMenu.classList.contains("hidden")) {
            guidesMenu.classList.add("hidden");
          } else {
            this.closeAllMenus("guides-menu");
            guidesMenu.classList.remove("hidden");
          }
        });

        guidesMenu.addEventListener("click", (event) => {
          event.stopPropagation();
        });

        document.addEventListener("click", (event) => {
          if (
            !event.target.closest("#guides-button") &&
            !event.target.closest("#guides-menu")
          ) {
            guidesMenu.classList.add("hidden");
          }
        });

        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
            guidesMenu.classList.add("hidden");
          }
        });
      }
    }

    setupFeedbackPopup() {
      const popup = document.getElementById("feedback-popup");
      const closeBtn = document.getElementById("close-feedback");

      if (!popup || !closeBtn) return;

      // Check if user already closed it
      if (this.readStorage("feedbackClosed").value === "true") {
        popup.classList.add("hidden");
        return;
      }

      // Show after a short delay
      setTimeout(() => {
        popup.classList.remove("hidden");
      }, 5000);

      closeBtn.addEventListener("click", () => {
        popup.classList.add("hidden");
        this.writeStorage("feedbackClosed", "true");
      });
    }

    openChangeNameModal() {
      const modal = document.getElementById("changeNameModal");
      const nameInput = document.getElementById("newBakeryName");
      if (!modal) return;

      modal.style.display = "flex";

      if (nameInput) {
        const currentName = (this.currentBakeryName || "")
          .replace(/(?:'s|s')?\s*bakery$/i, "")
          .trim();
        nameInput.value = currentName;
        requestAnimationFrame(() => {
          if (!this.canPresent()) return;
          nameInput.focus();
          nameInput.select();
        });
      }
    }
    closeChangeNameModal() {
      const modal = document.getElementById("changeNameModal");
      if (!modal) return;
      modal.style.display = "none";
    }
    changeBakeryName() {
      const nameInput = document.getElementById("newBakeryName");
      if (!nameInput) return;

      const rawName = nameInput.value.trim();
      if (rawName) {
        const compactName = rawName.replace(/\s+/g, " ");
        const normalizedName = compactName
          .replace(/(?:'s|s')?\s*bakery$/i, "")
          .trim();
        const finalBaseName = normalizedName || compactName;

        this.currentBakeryName = `${finalBaseName}'s Bakery`;
        const bakeryNameElement = document.getElementById("bakery-name");
        if (bakeryNameElement) {
          bakeryNameElement.textContent = this.currentBakeryName;
        }

        // Kullanıcı isim değiştirdiğinde yeni ismi kaydet
        this.writeStorage("bakeryName", this.currentBakeryName);
        this.requestSave();
        this.closeChangeNameModal();
      }
    }
    warnAboutStorage(key, message) {
      if (this._storageWarnings.has(key)) return;
      this._storageWarnings.add(key);
      this.showNotification(message, 6000, { storageWarning: true });
    }

    readStorage(key) {
      try {
        return { ok: true, value: localStorage.getItem(key) };
      } catch (error) {
        this.warnAboutStorage(
          "storage",
          "Browser storage is unavailable. You can keep playing, but progress may not be saved.",
        );
        return { ok: false, value: null };
      }
    }

    writeStorage(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        this.warnAboutStorage(
          "storage",
          "Browser storage is unavailable. You can keep playing, but progress may not be saved.",
        );
        return false;
      }
    }

    removeStorage(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        this.warnAboutStorage(
          "storage",
          "Browser storage is unavailable. You can keep playing, but progress may not be saved.",
        );
        return false;
      }
    }

    requestSave(delay = 1000) {
      if (
        !this._saveReady ||
        this.saveWritesBlocked ||
        this._savingTimeSettlement
      )
        return;
      const deadline = Date.now() + delay;
      if (this._saveTimer !== null && this._saveDeadline <= deadline) return;
      clearTimeout(this._saveTimer);
      this._saveDeadline = deadline;
      this._saveTimer = setTimeout(
        () => this.saveGame({ silent: true }),
        delay,
      );
    }

    canPresent() {
      return (
        !this._presentationSuspended && document.visibilityState !== "hidden"
      );
    }

    isStatsPanelOpen() {
      const menu = document.getElementById("stats-menu");
      return (
        !!menu &&
        (this.isMobile
          ? menu.classList.contains("mobile-active")
          : !menu.classList.contains("hidden"))
      );
    }

    startPresentationPolling() {
      if (!this.canPresent() || this._presentationTimers) return;
      this._presentationTimers = [
        setInterval(() => this.updateTitleWithDonuts(), 1000),
        setInterval(() => this.updateStatsDisplay(), 5000),
        setInterval(() => this.updateDonutCoinDisplay(), 1000),
      ];
    }

    suspendPresentation() {
      this._presentationSuspended = true;
      for (const timer of this._presentationTimers || []) clearInterval(timer);
      this._presentationTimers = null;
      cancelAnimationFrame(this.gameLoopHandle);
      this.gameLoopHandle = null;
      cancelAnimationFrame(this._displayUpdateHandle);
      this._displayUpdateHandle = null;
      this._displayUpdateScheduled = false;
      this._hideItemInfo?.();
      if (this._notificationFrame != null) {
        cancelAnimationFrame(this._notificationFrame);
        this._notificationFrame = null;
        this._notificationActive = false;
      }
      if (this._notificationQueue) this._notificationQueue.length = 0;
      this._notificationOverflowCount = 0;
    }

    resumePresentation() {
      if (!this._presentationSuspended || document.visibilityState === "hidden")
        return;
      this._presentationSuspended = false;
      // Settlement has finished. Read only current state; no missed callbacks replay.
      this.lastSlowUiUpdateTime =
        this.lastFarmUiUpdateTime =
        this.lastTimerUiUpdateTime =
          -Infinity;
      this._hudDirty = this._hudImmediate = true;
      this.flushDisplay();
      this.updateProductionDisplays(Date.now());
      this.updateFarmCareDisplay();
      this.updateFarmMasteryBadge();
      const footerOpen =
        this.footerContainer?.classList.contains("visible") &&
        !this.footerContainer.classList.contains("hidden");
      if (
        footerOpen &&
        !document.getElementById("mine-panel")?.classList.contains("hidden")
      ) {
        this.updateWorkerCount();
        this.updateOreList();
        this.updateMarketDisplay();
        this.updatePurchaseLimitBadge();
      }
      if (
        footerOpen &&
        !document.getElementById("baker-panel")?.classList.contains("hidden")
      ) {
        this.updateBakerWorkerCount();
        this.updateIngredientList();
      }
      this.refreshRecipeAvailability();
      if (this.questsMenu && !this.questsMenu.classList.contains("hidden"))
        this.updateQuestDisplay();
      this.updateStatsDisplay();
      this.updateDonutCoinDisplay();
      this.updateTitleWithDonuts();
      if (this._pendingStorageWarning) {
        const warning = this._pendingStorageWarning;
        this._pendingStorageWarning = null;
        this.showNotification(warning, 6000, { storageWarning: true });
      }
      this.startPresentationPolling();
      this.startGameLoop();
    }

    setupSaveLifecycle() {
      const checkpoint = () => {
        // visibilitychange and pagehide commonly arrive together.
        if (this._saveTimer === null && Date.now() - this._lastSaveTime < 1000)
          return;
        this.saveGame({ silent: true });
      };
      const transition = (hidden) => {
        // Suppress simulation-originated DOM writes on both sides of settlement.
        this.suspendPresentation();
        this.setTimeVisibility(hidden);
        if (!hidden) this.resumePresentation();
      };
      const show = () => {
        if (document.visibilityState === "hidden") transition(true);
        else if (this._presentationSuspended) transition(false);
        else this.setTimeVisibility(false);
      };
      if (document.visibilityState === "hidden") this.suspendPresentation();
      document.addEventListener("visibilitychange", () => {
        const hidden = document.visibilityState === "hidden";
        if (hidden) transition(true);
        else show();
        if (hidden) checkpoint();
      });
      window.addEventListener("pagehide", () => {
        transition(true);
        checkpoint();
      });
      window.addEventListener("pageshow", show);
    }

    saveGame({ silent = false } = {}) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
      this._saveDeadline = 0;
      if (!this._saveReady) return false;
      this._savingTimeSettlement = true;
      try {
        this.settleBeforeMutation();
      } finally {
        this._savingTimeSettlement = false;
      }
      if (this.saveWritesBlocked) {
        this.warnAboutStorage(
          "protected",
          "Saving is paused to protect stored progress. Reload after restoring your save, or use Reset Game to start over.",
        );
        return false;
      }

      const primary = this.readStorage("gameState");
      if (!primary.ok) return false;
      // Optimistic guard: never replace a snapshot changed by another tab.
      // It also notices legacy writers and resets, without requiring metadata.
      if (primary.value !== this._loadedPrimarySave) {
        this.saveWritesBlocked = true;
        this.warnAboutStorage(
          "protected",
          "Stored progress changed in another tab. Saving in this tab is paused; reload to use the stored save.",
        );
        return false;
      }

      try {
        // Sadece dinamik verileri seçerek kaydet (Save boyutu %90 küçülür)
        const itemData = {};
        for (let key in this.items) {
          itemData[key] = {
            count: this.items[key].count,
            totalProduced: this.items[key].totalProduced,
            baseCost: this.items[key].baseCost, // Fiyatı da saklayalım (opsiyonel ama güvenli)
          };
        }

        const upgradeData = {};
        for (let key in this.upgrades) {
          upgradeData[key] = this.upgrades[key].map((u) => u.purchased);
        }

        // New quest system save data
        const questSystemData = {
          milestoneQuests: this.milestoneQuests,
          dynamicSlots: {},
          multiplierState: this.multiplierState,
          questTracking: this.questTracking,
          cpsHistory: this.cpsHistory.slice(-20), // Keep last 20 entries
        };

        // Save dynamic slots (serialize currentQuest and cooldownEnd)
        for (const slotId of Object.keys(this.dynamicSlots)) {
          const slot = this.dynamicSlots[slotId];
          questSystemData.dynamicSlots[slotId] = {
            currentQuest: slot.currentQuest,
            cooldownEnd: slot.cooldownEnd,
          };
        }

        // Legacy quest data for backward compatibility
        const questData = {};
        for (let key in this.quests) {
          questData[key] = {
            progress: this.quests[key].progress,
            completed: this.quests[key].completed,
            claimed: this.quests[key].claimed,
          };
        }

        const recipeData = {};
        for (let key in this.recipes) {
          recipeData[key] = {
            craftCount: this.recipes[key].craftCount || 0,
            currentScaling:
              this.getRecipeScale(this.recipes[key]) ?? Number.MAX_VALUE,
          };
        }

        const gameState = {
          saveVersion: this.saveVersion,
          gameVersion: this.currentVersion,
          items: itemData,
          upgrades: upgradeData,
          quests: questData,
          questSystem: questSystemData, // New quest system
          recipes: recipeData,
          donutCount: this.donutCount,
          totalDonutsEarned: this.totalDonutsEarned,
          totalClicks: this.totalClicks,
          prestigeCount: this.prestigeCount,
          nextPrestigeThreshold: this.nextPrestigeThreshold,
          ores: this.ores,
          oreMarket: this.oreMarket,
          oreTypePrices: this.oreTypes.map((o) => ({
            type: o.type,
            price: o.price,
            priceHistory: o.priceHistory,
            trend: o.trend,
          })),
          workers: this.workers,
          bakers: this.bakers,
          ingredients: this.ingredients,
          hasDonutClicked: this.hasDonutClicked,
          productionMultiplier:
            this.getProductionModifiers().temporaryMultiplier,
          activeMultipliers: this.activeMultipliers,
          currentBakeryName: this.currentBakeryName,
          donutCoin: this.donutCoin,
          farmState: this.farmState,
          farmNextAnimalId: this.farmNextAnimalId,
          autoBuyer: this.autoBuyer,
          soundVolume: this.clickSounds[0].volume,
          lastMineProduction: this.lastMineProduction,
          lastBakerProduction: this.lastBakerProduction,
          orePurchaseLimit: this.orePurchaseLimit,
          lastActiveTime: this.timeState.settledAt,
          timeState: { ...this.timeState },
        };

        const secureData = this.encryptSave(gameState);
        if (!this.decodeSave(secureData)) {
          this.warnAboutStorage(
            "invalid-state",
            "The current game could not be saved safely. Your previous saves have been kept.",
          );
          return false;
        }
        if (secureData === primary.value) {
          this._lastSaveTime = Date.now();
          if (!silent) this.showGameSaved();
          return true;
        }

        if (this.decodeSave(primary.value)) {
          const backup = this.readStorage("gameStateBackup");
          if (!backup.ok) return false;
          if (
            backup.value !== primary.value &&
            !this.writeStorage("gameStateBackup", primary.value)
          ) {
            return false; // Keep the primary if its backup cannot be secured.
          }
        }
        if (!this.writeStorage("gameState", secureData)) return false;
        this._loadedPrimarySave = secureData;
        this._lastSaveTime = Date.now();
        if (!silent) this.showGameSaved();
        return true;
      } catch (error) {
        this.warnAboutStorage(
          "invalid-state",
          "The current game could not be saved safely. Your previous saves have been kept.",
        );
        return false;
      }
    }
    loadGame() {
      this.invalidateDerivedCaches();
      this._saveReady = false;
      const primary = this.readStorage("gameState");
      this._loadedPrimarySave = primary.ok ? primary.value : undefined;
      let gameState = primary.ok
        ? this.decodeSave(primary.value, {
            recoverMineState: true,
            recoverBakerState: true,
          })
        : null;
      let recovered = false;
      if (!gameState) {
        const backup = this.readStorage("gameStateBackup");
        gameState = backup.ok
          ? this.decodeSave(backup.value, {
              recoverMineState: true,
              recoverBakerState: true,
            })
          : null;
        recovered = Boolean(gameState);
        if (!gameState) {
          this.saveWritesBlocked =
            !primary.ok ||
            !backup.ok ||
            primary.value !== null ||
            backup.value !== null;
          this._saveReady = true;
          if (this.saveWritesBlocked) {
            this.warnAboutStorage(
              "protected",
              "Stored progress could not be loaded. Saving is paused to protect it; you can keep playing in memory.",
            );
          }
          return false;
        }
      }

      this.saveWritesBlocked = false;
      this._questStateLoading = true;
      try {
        // --- Verileri Giydirme (Merging) ---

        // Items yükle
        if (gameState.items) {
          for (let key in gameState.items) {
            if (this.items[key]) {
              this.items[key].count = gameState.items[key].count || 0;
              this.items[key].totalProduced =
                gameState.items[key].totalProduced || 0;
              if (gameState.items[key].baseCost)
                this.items[key].baseCost = gameState.items[key].baseCost;
            }
          }
        }

        // Upgrades yükle (Purchased status)
        if (gameState.upgrades) {
          for (let key in gameState.upgrades) {
            if (this.upgrades[key]) {
              gameState.upgrades[key].forEach((savedUpgrade, index) => {
                if (this.upgrades[key][index]) {
                  const isPurchased =
                    typeof savedUpgrade === "boolean"
                      ? savedUpgrade
                      : !!savedUpgrade?.purchased;
                  this.upgrades[key][index].purchased = isPurchased;
                }
              });
            }
          }
        }

        // New quest system load
        if (gameState.questSystem) {
          const qs = gameState.questSystem;

          // Load milestone quests
          if (qs.milestoneQuests) {
            // Building milestones
            if (qs.milestoneQuests.building) {
              for (const [buildingType, tiers] of Object.entries(
                qs.milestoneQuests.building,
              )) {
                if (this.milestoneQuests.building[buildingType]) {
                  for (const [tier, quest] of Object.entries(tiers)) {
                    if (this.milestoneQuests.building[buildingType][tier]) {
                      this.hydrateMilestoneQuestState(
                        this.milestoneQuests.building[buildingType][tier],
                        quest,
                      );
                    }
                  }
                }
              }
            }
            // Production milestones
            if (qs.milestoneQuests.production) {
              this.hydrateThresholdMilestoneCollection(
                this.milestoneQuests.production,
                qs.milestoneQuests.production,
                this.productionMilestones,
                { remapRemovedTargets: true },
              );
            }
            // Click milestones
            if (qs.milestoneQuests.clicks) {
              this.hydrateThresholdMilestoneCollection(
                this.milestoneQuests.clicks,
                qs.milestoneQuests.clicks,
                this.clickMilestones,
                { remapRemovedTargets: true },
              );
            }

            // CPS milestones (new)
            if (qs.milestoneQuests.cps && this.milestoneQuests.cps) {
              this.hydrateThresholdMilestoneCollection(
                this.milestoneQuests.cps,
                qs.milestoneQuests.cps,
                this.cpsMilestones,
                { remapRemovedTargets: true },
              );
            }

            // Total buildings milestones (new)
            if (
              qs.milestoneQuests.totalBuildings &&
              this.milestoneQuests.totalBuildings
            ) {
              for (const [target, quest] of Object.entries(
                qs.milestoneQuests.totalBuildings,
              )) {
                if (this.milestoneQuests.totalBuildings[target]) {
                  this.hydrateMilestoneQuestState(
                    this.milestoneQuests.totalBuildings[target],
                    quest,
                  );
                }
              }
            }

            // Upgrade milestones (new)
            if (qs.milestoneQuests.upgrades && this.milestoneQuests.upgrades) {
              for (const [target, quest] of Object.entries(
                qs.milestoneQuests.upgrades,
              )) {
                if (
                  !this.milestoneQuests.upgrades[target] &&
                  [75, 100].includes(Number(target)) &&
                  (quest.completed || quest.claimed)
                ) {
                  this.milestoneQuests.upgrades[target] = {
                    id: `upgrades_${target}`,
                    type: "upgrades",
                    target: Number(target),
                    tierIndex: target === "75" ? 9 : 10,
                    retired: true,
                  };
                }
                if (this.milestoneQuests.upgrades[target]) {
                  this.hydrateMilestoneQuestState(
                    this.milestoneQuests.upgrades[target],
                    quest,
                  );
                }
              }
            }

            // Quest completion milestones (new)
            if (
              qs.milestoneQuests.questsCompleted &&
              this.milestoneQuests.questsCompleted
            ) {
              for (const [target, quest] of Object.entries(
                qs.milestoneQuests.questsCompleted,
              )) {
                if (this.milestoneQuests.questsCompleted[target]) {
                  this.hydrateMilestoneQuestState(
                    this.milestoneQuests.questsCompleted[target],
                    quest,
                  );
                }
              }
            }
          }

          // Load dynamic slots
          if (qs.dynamicSlots) {
            for (const [slotId, slotData] of Object.entries(qs.dynamicSlots)) {
              if (this.dynamicSlots[slotId]) {
                this.dynamicSlots[slotId].currentQuest =
                  slotData.currentQuest || null;
                this.dynamicSlots[slotId].cooldownEnd =
                  slotData.cooldownEnd || null;
              }
            }
          }

          // Load multiplier state
          if (qs.multiplierState) {
            this.multiplierState = {
              active: null,
              queued: null,
              ...qs.multiplierState,
            };
          }

          // Load quest tracking
          if (qs.questTracking) {
            this.questTracking = {
              currentRun: {
                ...this.questTracking.currentRun,
                ...qs.questTracking.currentRun,
              },
              lifetime: {
                ...this.questTracking.lifetime,
                ...qs.questTracking.lifetime,
              },
            };
          }

          // Load CPS history
          if (qs.cpsHistory) {
            this.cpsHistory = qs.cpsHistory;
          }
        }
        // Legacy quest migration (for old saves without questSystem)
        else if (gameState.quests) {
          this.migrateOldQuests(gameState.quests);
        }

        // Recipes yükle
        if (gameState.recipes) {
          for (let key in gameState.recipes) {
            if (this.recipes[key]) {
              const savedRecipe = gameState.recipes[key];
              this.recipes[key].craftCount = savedRecipe.craftCount || 0;
              if (this.recipes[key].scaling?.ingredients) {
                this.recipes[key].scaling.ingredients.current =
                  this.getRecipeScale(this.recipes[key]) ?? Number.MAX_VALUE;
              }
            }
          }
        }

        // Diğer basit veriler
        this.donutCount = gameState.donutCount || 0;
        this.totalDonutsEarned = gameState.totalDonutsEarned || 0;
        this.totalClicks = gameState.totalClicks || 0;
        this.prestigeCount = Math.max(0, Number(gameState.prestigeCount) || 0);
        const savedPrestigeThreshold =
          Number(gameState.nextPrestigeThreshold) || 0;
        const minimumPrestigeThreshold = this.calculatePrestigeThreshold(
          this.prestigeCount,
        );
        // Undo V2's exact 10T curve on load, without changing earned progress or
        // purchase flags. Other saved thresholds retain the pre-V2 max policy.
        const v2PrestigeThreshold = Math.ceil(
          10000000000000 * Math.pow(2, this.prestigeCount),
        );
        this.nextPrestigeThreshold =
          savedPrestigeThreshold === v2PrestigeThreshold
            ? minimumPrestigeThreshold
            : Math.max(savedPrestigeThreshold, minimumPrestigeThreshold);
        this.currentBakeryName =
          gameState.currentBakeryName || "My Awesome Bakery";
        this.hasDonutClicked = gameState.hasDonutClicked || false;
        this.productionMultiplier = gameState.productionMultiplier || 1;
        this.activeMultipliers = gameState.activeMultipliers || [];
        this.ores = { ...this.ores, ...gameState.ores };

        // Ore fiyatları ve geçmişini yükle
        if (gameState.oreTypePrices) {
          gameState.oreTypePrices.forEach((saved) => {
            const ore = this.oreTypes.find((o) => o.type === saved.type);
            if (ore) {
              ore.price = saved.price;
              ore.priceHistory = saved.priceHistory || [];
              ore.trend = saved.trend || 0;
            }
          });
        }

        this.workers = gameState.workers || [];
        this.reconcileMineWorkers();
        this.bakers = gameState.bakers || [];
        this.reconcileBakerWorkers();
        this.ingredients = gameState.ingredients || {};
        this.lastBakerProduction = this.restoreProductionCheckpoint(
          gameState,
          "lastBakerProduction",
          this.bakerProductionInterval,
        );
        this.lastMineProduction = this.restoreProductionCheckpoint(
          gameState,
          "lastMineProduction",
          this.workerProductionInterval,
        );
        this.orePurchaseLimit = gameState.orePurchaseLimit ?? 10;
        if (gameState.autoBuyer) {
          this.autoBuyer.enabled = gameState.autoBuyer.enabled ?? false;
          for (const key of Object.keys(this.autoBuyer.settings)) {
            const saved = gameState.autoBuyer.settings?.[key];
            if (saved)
              this.autoBuyer.settings[key] = {
                ...this.autoBuyer.settings[key],
                ...saved,
              };
          }
        }
        const soundVolume = gameState.soundVolume ?? 0.1;
        this.clickSounds.forEach((sound) => {
          sound.volume = soundVolume;
        });
        this.lastUpdateTime = Date.now(); // Bu satırda kalmalı.

        // Farm state yükle
        if (gameState.farmState) {
          const defaults = this.createDefaultFarmState();
          this.farmState = { ...defaults, ...gameState.farmState };
          // Ensure nested objects have defaults
          this.farmState.storage = {
            ...defaults.storage,
            ...gameState.farmState.storage,
          };
          this.farmState.feedPlans = {
            ...defaults.feedPlans,
            ...gameState.farmState.feedPlans,
          };
          this.farmState.contracts = {
            ...defaults.contracts,
            ...gameState.farmState.contracts,
          };
          this.farmState.breeding =
            gameState.farmState.breeding || defaults.breeding;
          this.farmState.mastery = {
            ...defaults.mastery,
            ...gameState.farmState.mastery,
          };
          this.farmState.buffs = {
            ...defaults.buffs,
            ...gameState.farmState.buffs,
          };
          this.farmState.careWindow = {
            ...defaults.careWindow,
            ...gameState.farmState.careWindow,
          };
          this.farmState.careBonus =
            gameState.farmState.careBonus || defaults.careBonus;
          this.farmState.collectCounts = {
            ...defaults.collectCounts,
            ...gameState.farmState.collectCounts,
          };
          this.farmState.crates = gameState.farmState.crates || [];
          this.farmState.rumors = gameState.farmState.rumors || defaults.rumors;
          this.farmState.stats = {
            ...defaults.stats,
            ...gameState.farmState.stats,
          };
        }
        if (gameState.farmNextAnimalId) {
          this.farmNextAnimalId = gameState.farmNextAnimalId;
        }
        this.restoreFarmCareCycles();
        this.updateFarmMasteryBadge();

        // DonutCoin verilerini yükle
        this.donutCoin = gameState.donutCoin || {
          count: 0,
          lastClaimTime: 0,
          claimInterval: 24 * 60 * 60 * 1000,
        };

        this.rebuildItemProductionsFromSaveState();

        // totalPerSecond'ın doğru hesaplandığından emin ol
        this.updateTotalPerSecond();

        this.fixBuildingCosts();
        // Reference restoration waits for upgrades, recipes, prestige and mastery.
        // Legacy quotes/history/holdings are preserved, including old outliers.
        this.oreMarket = gameState.oreMarket || null;
        if (!this.oreMarket) this.refreshOreMarketReference(true);
        this._questStateLoading = false;
        this.restoreQuestLifecycle(gameState.lastActiveTime);

        // Freeze missing legacy rewards only after ALL economic state is hydrated.
        // Existing frozen rewards remain unchanged; their policy is still stable CPS.
        if (gameState.questSystem) this.freezeCompletedMilestoneRewards();

        // Çevrimdışı kazanç hesapla
        this.restoreTimeState(gameState);

        // UI ve Display güncellemeleri
        document.getElementById("bakery-name").textContent =
          this.currentBakeryName;
        this.updateOreList();
        this.updateIngredientList();
        this.updateMarketDisplay();
        this.updateQuestDisplay();
        this.updateDisplay();
        this.showUpgrades();
        this.updatePrestigeBar();
        this.updateTotalPerSecond();
      } catch (error) {
        this._questStateLoading = false;
        this.saveWritesBlocked = true;
        this.warnAboutStorage(
          "protected",
          "Stored progress could not be fully loaded. Saving is paused to protect your saves.",
        );
        this._saveReady = true;
        return false;
      }
      this._saveReady = true;
      if (recovered)
        this.showNotification(
          "Your backup save was loaded. The backup has been kept.",
          6000,
        );
      return true;
    }

    restoreProductionCheckpoint(gameState, key, interval) {
      const checkpoint = gameState[key];
      if (checkpoint === undefined) return Date.now();
      if (!gameState.saveVersion) return checkpoint || Date.now();
      // Preserve the saved cycle position. Closed sessions still do not produce
      // ore/ingredients; their existing offline rules are unchanged.
      const elapsed = Math.max(
        0,
        Math.min(interval, gameState.lastActiveTime - checkpoint),
      );
      return Date.now() - elapsed;
    }

    fixBuildingCosts() {
      for (const key in this.items) {
        const item = this.items[key];
        if (item.count > 0) {
          item.baseCost =
            item.originalBaseCost * Math.pow(item.costMultiplier, item.count);
        } else {
          item.baseCost = item.originalBaseCost;
        }
      }
    }

    rebuildItemProductionsFromSaveState() {
      this.invalidateProductionSnapshot();
      // Old saves stored mutated rates; current definitions + ownership are canonical.
      this.updateTotalPerSecond();
    }
    hasSafeSaveKeys(value) {
      if (value === null || typeof value !== "object") return true;
      return Object.entries(value).every(
        ([key, entry]) =>
          !["__proto__", "constructor", "prototype"].includes(key) &&
          this.hasSafeSaveKeys(entry),
      );
    }

    recoverMineSaveData(data) {
      if (!data || typeof data !== "object" || Array.isArray(data)) return data;
      const recovered = { ...data };
      if (
        data.oreMarket !== undefined &&
        data.oreMarket !== null &&
        !this.isValidOreMarketReference(data.oreMarket)
      ) {
        recovered.oreMarket = null;
      }
      if (
        data.ores &&
        typeof data.ores === "object" &&
        !Array.isArray(data.ores)
      ) {
        recovered.ores = Object.fromEntries(
          Object.entries(data.ores).map(([type, entry]) => [
            type,
            {
              ...(entry && typeof entry === "object" && !Array.isArray(entry)
                ? entry
                : {}),
              count: this.normalizeOreCount(entry?.count),
            },
          ]),
        );
      }
      if (Array.isArray(data.oreTypePrices)) {
        recovered.oreTypePrices = data.oreTypePrices.map((entry) => {
          const definition = this.oreTypes.find(
            (ore) => ore.type === entry?.type,
          );
          return definition
            ? {
                ...entry,
                ...this.getSafeOreMarketState(entry, definition.basePrice),
              }
            : entry;
        });
      }
      return recovered;
    }

    recoverBakerSaveData(data) {
      if (!data || typeof data !== "object" || Array.isArray(data)) return data;
      const recovered = { ...data };
      if (
        data.ingredients &&
        typeof data.ingredients === "object" &&
        !Array.isArray(data.ingredients)
      ) {
        recovered.ingredients = Object.fromEntries(
          Object.entries(data.ingredients).map(([type, entry]) => [
            type,
            {
              ...(entry && typeof entry === "object" && !Array.isArray(entry)
                ? entry
                : {}),
              count:
                typeof entry?.count === "number" &&
                Number.isFinite(entry.count) &&
                entry.count >= 0
                  ? Math.floor(entry.count)
                  : 0,
            },
          ]),
        );
      }
      return recovered;
    }

    decodeSave(
      raw,
      { recoverMineState = false, recoverBakerState = false } = {},
    ) {
      if (typeof raw !== "string" || !raw.trim()) return null;
      try {
        const text = raw.trim();
        // Keep both historical plain JSON and the existing v2 checksum envelope.
        let data = text.startsWith("{")
          ? JSON.parse(text)
          : this.decryptSave(text);
        // Verify the historical checksum BEFORE targeted load-only repairs.
        // Strict candidate/backup validation never repairs an invalid stored slot.
        if (!this.hasSafeSaveKeys(data)) return null;
        if (recoverMineState) data = this.recoverMineSaveData(data);
        if (recoverBakerState) data = this.recoverBakerSaveData(data);
        return this.isValidSaveData(data) ? data : null;
      } catch (error) {
        return null;
      }
    }

    isValidSaveData(data) {
      // Validate data consumed by the loader/simulation, not static content or
      // game balance. Missing legacy fields retain their existing defaults.
      const object = (v) =>
        v !== null && typeof v === "object" && !Array.isArray(v);
      const number = (v) => typeof v === "number" && Number.isFinite(v);
      const count = (v) => number(v) && v >= 0;
      const integer = (v) => count(v) && Number.isInteger(v);
      const positive = (v) => number(v) && v > 0;
      const string = (v) => typeof v === "string";
      const boolean = (v) => typeof v === "boolean";
      const nullable = (check) => (v) => v === null || check(v);
      const array = (check) => (v) => Array.isArray(v) && v.every(check);
      const record = (check) => (v) =>
        object(v) && Object.values(v).every(check);
      const fields = (v, rules) =>
        object(v) &&
        Object.entries(rules).every(
          ([key, check]) => v[key] === undefined || check(v[key]),
        );
      const safeJSON = (v) => {
        if (typeof v === "number") return number(v);
        if (v === null || typeof v !== "object") return true;
        return Object.values(v).every(safeJSON);
      };
      if (
        !object(data) ||
        !this.hasSafeSaveKeys(data) ||
        !safeJSON(data) ||
        !count(data.donutCount) ||
        !object(data.items)
      )
        return false;
      if (
        !Object.keys(data.items).some((key) => Object.hasOwn(this.items, key))
      )
        return false;
      if (
        !record(
          (item) =>
            object(item) &&
            integer(item.count) &&
            fields(item, {
              totalProduced: count,
              baseCost: count,
            }),
        )(data.items)
      )
        return false;
      if (
        data.saveVersion !== undefined &&
        ![0, this.saveVersion].includes(data.saveVersion)
      )
        return false;

      const milestone = (v) =>
        fields(v, {
          progress: count,
          completed: boolean,
          claimed: boolean,
          frozenReward: nullable(count),
          completionTime: nullable(count),
        });
      const timedMultiplier = (v) =>
        object(v) && positive(v.amount) && count(v.endTime);
      const queuedMultiplier = (v) =>
        object(v) && positive(v.amount) && positive(v.duration);
      const reward = (v) =>
        object(v) &&
        ["donuts", "multiplier"].includes(v.type) &&
        count(v.amount) &&
        (v.type !== "multiplier" || positive(v.duration));
      const dynamicQuest = (v) => {
        if (
          !object(v) ||
          !string(v.id) ||
          !string(v.title) ||
          !string(v.description) ||
          !positive(v.target) ||
          !reward(v.reward)
        )
          return false;
        if (
          ![
            "click",
            "produce",
            "buyAny",
            "buySpecific",
            "timedProduce",
            "multiplier",
            "efficiency",
            "combo",
            "spending",
          ].includes(v.type)
        )
          return false;
        if (
          v.type === "buySpecific" &&
          !Object.hasOwn(this.items, v.buildingType)
        )
          return false;
        if (
          v.type === "combo" &&
          (!positive(v.clickTarget) || !positive(v.produceTarget))
        )
          return false;
        if (
          v.type === "timedProduce" &&
          (!positive(v.timeLimit) || !count(v.timedStartTime))
        )
          return false;
        return fields(v, {
          progress: count,
          completed: boolean,
          claimed: boolean,
          startTime: count,
          startClicks: count,
          startProduction: count,
          startBuildings: count,
          startCount: count,
          startCPS: count,
          startSpent: count,
        });
      };
      const questTracking = (v) =>
        object(v) &&
        object(v.currentRun) &&
        record(record(count))(v.currentRun.spentAtTier) &&
        fields(v.currentRun, {
          totalProduced: count,
          totalSpent: count,
          questsCompleted: integer,
        }) &&
        fields(v, { lifetime: (l) => fields(l, { totalClicks: integer }) });
      const questSystem = (v) =>
        fields(v, {
          milestoneQuests: (m) =>
            fields(m, {
              building: record(record(milestone)),
              production: record(milestone),
              clicks: record(milestone),
              cps: record(milestone),
              totalBuildings: record(milestone),
              upgrades: record(milestone),
              questsCompleted: record(milestone),
            }),
          dynamicSlots: record((s) =>
            fields(s, {
              currentQuest: nullable(dynamicQuest),
              cooldownEnd: nullable(count),
            }),
          ),
          multiplierState: (m) =>
            fields(m, {
              active: nullable(timedMultiplier),
              queued: nullable(queuedMultiplier),
            }),
          questTracking,
          cpsHistory: array((h) => object(h) && count(h.cps) && count(h.time)),
        });
      const farmBuff = (v) =>
        object(v) &&
        Object.hasOwn(this.farmBuffCategories, v.category) &&
        positive(v.strength) &&
        positive(v.duration);
      const contract = (v) =>
        object(v) &&
        string(v.id) &&
        string(v.title) &&
        record(count)(v.requirements) &&
        record(count)(v.progress) &&
        positive(v.duration) &&
        count(v.elapsed) &&
        array(string)(v.affixes) &&
        object(v.reward) &&
        count(v.reward.donuts) &&
        fields(v.reward, { buff: nullable(farmBuff) });
      const animal = (v) =>
        object(v) &&
        string(v.id) &&
        Object.hasOwn(this.farmAnimalDefs, v.type) &&
        array(string)(v.traits) &&
        fields(v, {
          name: string,
          variant: nullable(string),
          passport: nullable(string),
          breedCooldown: count,
          productionTimer: count,
        });
      const breedingSlot = (v) =>
        object(v) &&
        boolean(v.active) &&
        (!v.active ||
          (Object.hasOwn(this.farmBreedPrograms, v.program) &&
            string(v.parentA) &&
            string(v.parentB) &&
            positive(v.duration) &&
            count(v.progress)));
      const farmState = (v) =>
        fields(v, {
          animals: array(animal),
          storage: record(count),
          feedPlans: record((p) =>
            ["standard", "ration", "premium"].includes(p),
          ),
          contracts: (c) =>
            fields(c, {
              board: array(nullable(contract)),
              active: array(contract),
              lastRefresh: count,
              rerollsUsed: integer,
            }),
          breeding: (b) =>
            object(b) &&
            Array.isArray(b.slots) &&
            b.slots.length === 2 &&
            b.slots.every(breedingSlot),
          mastery: (m) => fields(m, { xp: count, level: integer }),
          buffs: record(
            nullable(
              (b) =>
                object(b) &&
                positive(b.strength) &&
                positive(b.duration) &&
                number(b.remaining),
            ),
          ),
          careWindow: (c) =>
            fields(c, {
              active: boolean,
              nextTrigger: count,
              expiresAt: count,
              lateUntil: count,
            }),
          careBonus: (c) =>
            object(c) &&
            positive(c.modifier) &&
            integer(c.cyclesRemaining) &&
            fields(c, { cyclesByType: record(count) }),
          collectCounts: record(integer),
          crates: array(
            (c) =>
              object(c) &&
              string(c.id) &&
              ["wooden", "silver", "gold", "epic"].includes(c.tier),
          ),
          stats: (s) =>
            fields(s, {
              totalGoodsSold: count,
              totalContractsCompleted: integer,
              totalBred: integer,
            }),
        });
      if (
        !fields(data, {
          gameVersion: string,
          totalDonutsEarned: count,
          totalClicks: integer,
          prestigeCount: integer,
          nextPrestigeThreshold: count,
          hasDonutClicked: boolean,
          productionMultiplier: count,
          currentBakeryName: string,
          lastActiveTime: count,
          lastMineProduction: count,
          lastBakerProduction: count,
          farmNextAnimalId: integer,
          upgrades: record(
            array((u) => boolean(u) || fields(u, { purchased: boolean })),
          ),
          quests: record(milestone),
          questSystem,
          recipes: record((r) =>
            fields(r, {
              craftCount: integer,
              currentScaling: positive,
              scaling: (s) =>
                fields(s, {
                  ingredients: (i) => fields(i, { current: positive }),
                }),
            }),
          ),
          ores: record((o) => object(o) && integer(o.count)),
          oreMarket: nullable((state) => this.isValidOreMarketReference(state)),
          ingredients: record((i) => object(i) && integer(i.count)),
          oreTypePrices: array(
            (o) =>
              object(o) &&
              string(o.type) &&
              positive(o.price) &&
              fields(o, {
                priceHistory: (h) => array(positive)(h) && h.length <= 20,
                trend: (t) => number(t) && t >= -1 && t <= 1,
              }),
          ),
          workers: array((w) => fields(w, { productionRate: count })),
          bakers: array((b) => fields(b, { productionRate: count })),
          activeMultipliers: array(
            (m) => timedMultiplier(m) && fields(m, { duration: positive }),
          ),
          donutCoin: (c) =>
            object(c) &&
            integer(c.count) &&
            count(c.lastClaimTime) &&
            positive(c.claimInterval),
          farmState,
          autoBuyer: (a) =>
            fields(a, {
              enabled: boolean,
              settings: record((s) =>
                fields(s, {
                  enabled: boolean,
                  threshold: (t) => number(t) && t >= 1,
                }),
              ),
            }),
          soundVolume: (v) => number(v) && v >= 0 && v <= 1,
          orePurchaseLimit: (v) => integer(v) && v <= 10,
          timeState: (t) =>
            object(t) &&
            count(t.settledAt) &&
            boolean(t.inactive) &&
            count(t.inactiveElapsed) &&
            t.inactiveElapsed <= this.MAX_OFFLINE_TIME &&
            count(t.mineProgress) &&
            t.mineProgress < this.workerProductionInterval &&
            count(t.bakerProgress) &&
            t.bakerProgress < this.bakerProductionInterval &&
            integer(t.randomState) &&
            t.randomState > 0 &&
            t.randomState <= 0xffffffff,
        })
      )
        return false;
      if (data.saveVersion === this.saveVersion) {
        // A new-format snapshot must be complete before it can replace a backup.
        const required = [
          "gameVersion",
          "upgrades",
          "quests",
          "questSystem",
          "recipes",
          "totalDonutsEarned",
          "totalClicks",
          "prestigeCount",
          "nextPrestigeThreshold",
          "ores",
          "oreTypePrices",
          "workers",
          "bakers",
          "ingredients",
          "hasDonutClicked",
          "productionMultiplier",
          "activeMultipliers",
          "currentBakeryName",
          "donutCoin",
          "farmState",
          "farmNextAnimalId",
          "autoBuyer",
          "soundVolume",
          "lastMineProduction",
          "lastBakerProduction",
          "orePurchaseLimit",
          "lastActiveTime",
        ];
        if (!required.every((key) => Object.hasOwn(data, key))) return false;
      }
      return true;
    }

    // Existing checksum envelope retained for backward compatibility.
    generateChecksum(data) {
      const str = JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return hash.toString(36);
    }

    encryptSave(data) {
      const payload = {
        v: 2,
        data: data,
        sig: this.generateChecksum(data),
      };
      return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    }

    decryptSave(encodedData) {
      try {
        const decoded = decodeURIComponent(escape(atob(encodedData)));
        const payload = JSON.parse(decoded);
        if (
          payload.v === 2 &&
          payload.sig === this.generateChecksum(payload.data)
        ) {
          return payload.data;
        }
        return null;
      } catch (e) {
        return null;
      }
    }

    async updateGameVersion(gameState) {
      const backupSave = JSON.stringify(gameState); // Mevcut save'i yedekle

      // Yeni özellikleri ekleyerek save'i güncelle
      const updatedState = {
        ...gameState,
        gameVersion: this.currentVersion,
        items: this.mergeItems(gameState.items),
        upgrades: this.mergeUpgrades(gameState.upgrades),
        quests: this.mergeQuests(gameState.quests),
      };

      return updatedState;
    }

    mergeItems(oldItems) {
      const mergedItems = {}; // Yeni güncellenmiş item listesi

      for (const itemKey in oldItems) {
        if (this.items[itemKey]) {
          // Eğer bina yeni listede varsa, onu koru ve güncelle
          mergedItems[itemKey] = {
            ...this.items[itemKey],
            count: oldItems[itemKey]?.count || 0,
            totalProduced: oldItems[itemKey]?.totalProduced || 0,
            ...Object.fromEntries(
              Object.entries(oldItems[itemKey] || {}).filter(
                ([key]) =>
                  ![
                    "name",
                    "baseCost",
                    "originalBaseCost",
                    "costMultiplier",
                    "production",
                    "originalProduction",
                  ].includes(key),
              ),
            ),
          };
        } else {
        }
      }

      // Yeni eklenen binaları dahil et
      for (const itemKey in this.items) {
        if (!mergedItems[itemKey]) {
          mergedItems[itemKey] = {
            ...this.items[itemKey],
            count: 0,
            totalProduced: 0,
          };
        }
      }

      return mergedItems;
    }

    mergeUpgrades(oldUpgrades) {
      const mergedUpgrades = {};

      // Tüm upgrade kategorilerini kontrol et
      for (const category in this.upgrades) {
        mergedUpgrades[category] = this.upgrades[category].map(
          (newUpgrade, index) => ({
            ...newUpgrade,
            purchased: oldUpgrades?.[category]?.[index]?.purchased || false,
            // Diğer kaydedilmiş özellikleri koru
            ...Object.fromEntries(
              Object.entries(oldUpgrades?.[category]?.[index] || {}).filter(
                ([key]) =>
                  ![
                    "name",
                    "cost",
                    "multiplier",
                    "requirement",
                    "img",
                    "description",
                  ].includes(key),
              ),
            ),
          }),
        );
      }

      return mergedUpgrades;
    }

    mergeQuests(oldQuests) {
      const mergedQuests = {};

      // Tüm questleri kontrol et
      for (const questId in this.quests) {
        mergedQuests[questId] = {
          ...this.quests[questId],
          progress: oldQuests?.[questId]?.progress || 0,
          completed: oldQuests?.[questId]?.completed || false,
          claimed: oldQuests?.[questId]?.claimed || false,
        };
      }

      return mergedQuests;
    }
    applyUpdates(gameState) {
      const upgradeCategories = [
        "cursor",
        "baker",
        "farm",
        "mine",
        "factory",
        "logisticCenter",
        "powerPlant",
        "nature",
        "portal",
        "capitalCrest",
        "nonItemUpgrades",
        "donutUpgrades",
      ];

      upgradeCategories.forEach((category) => {
        if (!gameState.upgrades[category]) {
          gameState.upgrades[category] = this.upgrades[category];
        } else {
          this.upgrades[category]?.forEach((upgrade, index) => {
            if (
              !gameState.upgrades[category][index] ||
              gameState.upgrades[category][index].cost !== upgrade.cost
            ) {
              gameState.upgrades[category][index] = upgrade;
            }
            gameState.upgrades[category][index].img =
              gameState.upgrades[category][index].img +
              "?v=" +
              this.currentVersion;
          });
        }
      });

      // Yeni bina güncellemeleri
      if (!gameState.items) {
        gameState.items = {};
      }

      Object.keys(this.items).forEach((itemKey) => {
        if (!gameState.items[itemKey]) {
          gameState.items[itemKey] = {
            ...this.items[itemKey],
            count: 0,
            totalProduced: 0,
          };
        } else {
          const savedData = gameState.items[itemKey];

          gameState.items[itemKey] = {
            ...this.items[itemKey], // Güncellenmiş bina özellikleri
            count: savedData.count, // Kullanıcının sahip olduğu miktar
            totalProduced: savedData.totalProduced, // Üretilen miktar
            baseCost:
              this.items[itemKey].originalBaseCost *
              Math.pow(this.items[itemKey].costMultiplier, savedData.count),
          };
        }
      });

      // Cevherler (Ores) güncelleme
      if (!gameState.ores) {
        gameState.ores = this.ores;
      } else {
        Object.keys(this.ores).forEach((oreType) => {
          if (!gameState.ores[oreType]) {
            gameState.ores[oreType] = this.ores[oreType];
          }
        });
      }

      // İşçiler (Workers) güncelleme
      if (!gameState.workers) {
        gameState.workers = this.workers;
      } else {
        gameState.workers.forEach((worker, index) => {
          if (!this.workers[index]) {
            this.workers.push(worker);
          }
        });
      }

      // Görevler (Quests) güncelleme
      if (!gameState.quests) {
        gameState.quests = this.quests;
      } else {
        Object.keys(this.quests).forEach((questId) => {
          if (!gameState.quests[questId]) {
            gameState.quests[questId] = this.quests[questId];
          } else {
            const savedQuest = gameState.quests[questId];
            gameState.quests[questId] = {
              ...this.quests[questId],
              progress: savedQuest.progress || 0,
              completed: savedQuest.completed || false,
              claimed: savedQuest.claimed || false,
            };
          }
        });
      }

      // Aktif çarpanlar (Multipliers) güncelleme
      if (!gameState.activeMultipliers) {
        gameState.activeMultipliers = [];
      }

      // Oyun versiyonunu güncelle
      gameState.gameVersion = this.currentVersion;
      // This legacy helper must not bypass validation, backups, or write guards.
      this.requestSave();
    }
    showResetConfirmModal() {
      const modal = document.getElementById("reset-confirm-modal");
      const confirmBtn = document.getElementById("reset-confirm-yes");
      const cancelBtn = document.getElementById("reset-confirm-cancel");
      const closeBtn = document.getElementById("reset-confirm-close");

      if (!modal || !confirmBtn || !cancelBtn || !closeBtn) {
        return Promise.resolve(
          confirm(
            "Are you sure you want to reset the game? All your progress will be deleted.",
          ),
        );
      }

      return new Promise((resolve) => {
        const cleanup = () => {
          modal.classList.remove("open");
          document.removeEventListener("keydown", onKeyDown);
          modal.removeEventListener("click", onBackdropClick);
          confirmBtn.removeEventListener("click", onConfirm);
          cancelBtn.removeEventListener("click", onCancel);
          closeBtn.removeEventListener("click", onCancel);
        };

        const onConfirm = (event) => {
          event.preventDefault();
          cleanup();
          resolve(true);
        };

        const onCancel = (event) => {
          if (event) event.preventDefault();
          cleanup();
          resolve(false);
        };

        const onBackdropClick = (event) => {
          if (event.target === modal) onCancel(event);
        };

        const onKeyDown = (event) => {
          if (event.key === "Escape") onCancel(event);
        };

        confirmBtn.addEventListener("click", onConfirm);
        cancelBtn.addEventListener("click", onCancel);
        closeBtn.addEventListener("click", onCancel);
        modal.addEventListener("click", onBackdropClick);
        document.addEventListener("keydown", onKeyDown);
        modal.classList.add("open");
      });
    }

    async resetGame() {
      const confirmation = await this.showResetConfirmModal();
      if (!confirmation) return;

      clearTimeout(this._saveTimer);
      this._saveTimer = null;
      this.saveWritesBlocked = true;
      // A confirmed reset must clear the backup too, or loading would revive it.
      if (!this.removeStorage("gameStateBackup")) return;
      if (!this.removeStorage("gameState")) return;
      this.removeStorage("bakeryName");
      location.reload();
    }

    // ========== YENİ QUEST SİSTEMİ METODLARI ==========

    initializeMilestoneQuests() {
      const quests = {
        building: {},
        production: {},
        clicks: {},
        cps: {},
        totalBuildings: {},
        upgrades: {},
        questsCompleted: {},
      };

      // Building milestones
      for (const [buildingType, tiers] of Object.entries(this.milestoneTiers)) {
        quests.building[buildingType] = {};
        tiers.forEach((tier, index) => {
          const questId = `${buildingType}_${tier}`;
          quests.building[buildingType][tier] = {
            id: questId,
            type: "building",
            buildingType: buildingType,
            target: tier,
            tierIndex: index,
            progress: 0,
            completed: false,
            claimed: false,
            frozenReward: null,
            completionTime: null,
          };
        });
      }

      // Production milestones
      this.productionMilestones.forEach((target, index) => {
        quests.production[target] = {
          id: `production_${target}`,
          type: "production",
          target: target,
          tierIndex: index,
          progress: 0,
          completed: false,
          claimed: false,
          frozenReward: null,
          completionTime: null,
        };
      });

      // Click milestones
      this.clickMilestones.forEach((target, index) => {
        quests.clicks[target] = {
          id: `clicks_${target}`,
          type: "clicks",
          target: target,
          tierIndex: index,
          progress: 0,
          completed: false,
          claimed: false,
          frozenReward: null,
          completionTime: null,
        };
      });

      // CPS milestones (new)
      this.cpsMilestones.forEach((target, index) => {
        quests.cps[target] = {
          id: `cps_${target}`,
          type: "cps",
          target: target,
          tierIndex: index,
          progress: 0,
          completed: false,
          claimed: false,
          frozenReward: null,
          completionTime: null,
        };
      });

      // Total buildings milestones (new)
      this.totalBuildingsMilestones.forEach((target, index) => {
        quests.totalBuildings[target] = {
          id: `totalBuildings_${target}`,
          type: "totalBuildings",
          target: target,
          tierIndex: index,
          progress: 0,
          completed: false,
          claimed: false,
          frozenReward: null,
          completionTime: null,
        };
      });

      // Upgrade milestones (new)
      this.upgradeMilestones.forEach((target, index) => {
        quests.upgrades[target] = {
          id: `upgrades_${target}`,
          type: "upgrades",
          target: target,
          tierIndex: index,
          progress: 0,
          completed: false,
          claimed: false,
          frozenReward: null,
          completionTime: null,
        };
      });

      // Quest completion milestones (meta-milestone, new)
      this.questCompletionMilestones.forEach((target, index) => {
        quests.questsCompleted[target] = {
          id: `questsCompleted_${target}`,
          type: "questsCompleted",
          target: target,
          tierIndex: index,
          progress: 0,
          completed: false,
          claimed: false,
          frozenReward: null,
          completionTime: null,
        };
      });

      return quests;
    }

    hydrateMilestoneQuestState(targetQuest, savedQuest) {
      if (!targetQuest || !savedQuest) return;

      targetQuest.progress = this.economicNumber(savedQuest.progress);
      targetQuest.completed = Boolean(
        savedQuest.completed || savedQuest.claimed,
      );
      if (targetQuest.completed)
        targetQuest.progress = Math.max(
          targetQuest.progress,
          targetQuest.target,
        );
      targetQuest.claimed = savedQuest.claimed || false;
      targetQuest.frozenReward = Number.isFinite(savedQuest.frozenReward)
        ? savedQuest.frozenReward
        : null;
      targetQuest.completionTime = savedQuest.completionTime || null;
    }

    hydrateThresholdMilestoneCollection(
      targetCollection,
      savedCollection,
      thresholds,
      options = {},
    ) {
      if (!targetCollection || !savedCollection) return;

      const normalizedTargets = [...thresholds]
        .map((target) => Number(target))
        .filter((target) => Number.isFinite(target))
        .sort((a, b) => a - b);

      for (const [savedTargetKey, savedQuest] of Object.entries(
        savedCollection,
      )) {
        if (targetCollection[savedTargetKey]) {
          this.hydrateMilestoneQuestState(
            targetCollection[savedTargetKey],
            savedQuest,
          );
          continue;
        }

        if (!options.remapRemovedTargets) continue;

        const savedTarget = Number(savedTargetKey);
        const savedProgress = Number(savedQuest?.progress) || 0;
        const remapTarget = normalizedTargets.find(
          (target) => target >= savedTarget,
        );
        if (!Number.isFinite(remapTarget)) continue;

        const remappedQuest = targetCollection[remapTarget];
        if (!remappedQuest) continue;

        remappedQuest.progress = Math.max(
          remappedQuest.progress || 0,
          savedProgress,
        );

        if (savedProgress >= remappedQuest.target) {
          remappedQuest.completed = true;
          remappedQuest.completionTime =
            remappedQuest.completionTime ||
            savedQuest?.completionTime ||
            Date.now();
        }
      }
    }

    // Get incremental spend between the current building tier and previous tier
    getBuildingTierSpendDelta(buildingType, targetTier) {
      const tiers = this.milestoneTiers[buildingType] || [];
      const tracking =
        this.questTracking.currentRun.spentAtTier[buildingType] || {};
      const targetIndex = tiers.indexOf(targetTier);

      const targetCumulative =
        tracking[targetTier] ?? this.estimateTierCost(buildingType, targetTier);

      if (targetIndex <= 0) {
        return Math.max(0, targetCumulative);
      }

      const prevTier = tiers[targetIndex - 1];
      const prevCumulative =
        tracking[prevTier] ?? this.estimateTierCost(buildingType, prevTier);

      return Math.max(0, targetCumulative - prevCumulative);
    }

    // Building-tier cap tied to the same building's next purchase cost
    getBuildingTierCap(buildingType, tierIndex = 0) {
      const building = this.items[buildingType];
      const nextBuildingCost =
        building?.baseCost || this.getNextMeaningfulPurchaseCost();
      const capFactor = Math.min(0.75, 0.45 + tierIndex * 0.03);

      return Math.max(
        this.getMinRewardForStage(),
        nextBuildingCost * capFactor,
      );
    }

    // Building milestone reward based on incremental tier effort
    calculateBuildingMilestoneReward(
      buildingType,
      targetTier,
      tierIndex = null,
    ) {
      const tiers = this.milestoneTiers[buildingType] || [];
      const resolvedTierIndex =
        tierIndex !== null && tierIndex !== undefined
          ? tierIndex
          : Math.max(0, tiers.indexOf(targetTier));
      const spentDelta = this.getBuildingTierSpendDelta(
        buildingType,
        targetTier,
      );
      const fallbackRate =
        this.tierRefundRates[this.tierRefundRates.length - 1] || 0.03;
      const rate = this.tierRefundRates[resolvedTierIndex] || fallbackRate;

      let reward = spentDelta * rate;
      const cap = this.getBuildingTierCap(buildingType, resolvedTierIndex);
      reward = Math.min(reward, cap);

      return Math.max(Math.floor(reward), this.getMinRewardForStage());
    }

    // Backward-compatible alias
    calculateBuildingQuestReward(buildingType, targetTier) {
      return this.calculateBuildingMilestoneReward(buildingType, targetTier);
    }

    // Estimate cost to reach tier (fallback when no tracking data)
    estimateTierCost(buildingType, targetCount) {
      const item = this.items[buildingType];
      if (!item) return 0;

      let totalCost = 0;
      for (let i = 0; i < targetCount; i++) {
        totalCost += item.originalBaseCost * Math.pow(item.costMultiplier, i);
      }
      return totalCost;
    }

    // Get stage-aware purchase benchmark cost for capping
    getNextMeaningfulPurchaseCost() {
      const entries = Object.entries(this.items);
      if (entries.length === 0) return 1000;

      const relevant = entries.filter(
        ([, item]) => item.count > 0 || this.donutCount >= item.baseCost * 0.2,
      );
      const pool = relevant.length > 0 ? relevant : entries;
      const sortedCosts = pool
        .map(([, item]) => item.baseCost)
        .sort((a, b) => a - b);

      const stage = this.getGameStage();
      const stagePosition = (stage - 1) / 7;
      const stageIndex = Math.max(
        0,
        Math.min(
          sortedCosts.length - 1,
          Math.floor(stagePosition * (sortedCosts.length - 1)),
        ),
      );
      const stageCost = sortedCosts[stageIndex];

      const nextProgressionCost =
        sortedCosts.find((cost) => cost > this.donutCount) ||
        sortedCosts[sortedCosts.length - 1];

      return Math.max(stageCost, nextProgressionCost * 0.4);
    }

    // ============================================================
    // QUEST REWARD SYSTEM v3.2 - EFFORT-COHERENT ECONOMICS
    // ============================================================
    //
    // CORE PHILOSOPHY:
    // Quests are BONUSES on top of natural earnings, NOT primary income.
    // You should never earn more from a quest than you would just playing.
    //
    // GAME ECONOMICS BASELINE:
    // - Cursor: 15 donuts, 0.1/s production (ROI: 150 sec)
    // - Baker: 115 donuts, 1/s production (ROI: 115 sec)
    // - Click value: 1 donut base
    //
    // REWARD PRINCIPLE:
    // Reward = (Effort Value) × (Small Bonus Rate)
    // Recurring goals/rewards use bounded human work and canonical production
    // snapshots; milestone rewards retain their existing stabilized-CPS policy.
    //
    // ============================================================

    getDynamicQuestBalance(difficulty) {
      return (
        this.dynamicQuestBalance[difficulty] || this.dynamicQuestBalance.easy
      );
    }

    getQuestBalanceContext() {
      return this.withProductionSnapshot(() => {
        const production = this.getProductionBreakdown();
        // Planning policy, not a production engine: project the canonical snapshot
        // without short-lived boosts so their expiry cannot strand a new objective.
        const unboostedCPS =
          production.boostedCPS / production.temporaryMultiplier +
          production.flatCPS;
        const cps = Math.min(production.effectiveCPS, unboostedCPS);
        return {
          production,
          cps,
          currentCPS: production.effectiveCPS,
          rate: Math.max(2, cps),
          stage: this.getGameStage(),
        };
      }, this.getGameTime());
    }

    getQuestClickTarget(policy, stage) {
      // Human input does not scale with CPS. Plan at two deliberate clicks/sec.
      return Math.ceil(
        Math.min(
          policy.maxClicks,
          policy.baseClicks * (1 + 0.05 * (stage - 1)),
        ),
      );
    }

    getQuestPurchaseBudget(context, policy) {
      const income = context.rate * policy.seconds;
      return (
        income + Math.min(this.economicNumber(this.donutCount), income) * 0.25
      );
    }

    getQuestPurchasePlan(type, context, policy, chooseRandom = false) {
      const budget = this.getQuestPurchaseBudget(context, policy);
      const meaningfulCost = context.rate * policy.seconds * 0.75;
      if (type === "buyAny") {
        let count = 1;
        for (let n = 2; n <= policy.maxPurchases; n++) {
          if (this.estimateBuyQuestCost(n, "buyAny") > budget) break;
          count = n;
        }
        const cost = this.estimateBuyQuestCost(count, "buyAny");
        return {
          count,
          cost,
          feasible: cost <= budget,
          meaningful: cost >= meaningfulCost,
        };
      }
      const options = [];
      for (const [key, item] of Object.entries(this.items)) {
        if (!Number.isFinite(item.baseCost) || item.baseCost > budget) continue;
        let count = 1;
        for (let n = 2; n <= policy.maxPurchases; n++) {
          if (this.estimateBuildingPurchaseCost(key, n) > budget) break;
          count = n;
        }
        options.push({
          key,
          count,
          cost: this.estimateBuildingPurchaseCost(key, count),
        });
      }
      const meaningful = options.filter(
        (option) => option.cost >= meaningfulCost,
      );
      const choices = meaningful.length ? meaningful : options;
      const chosen =
        choices[chooseRandom ? Math.floor(Math.random() * choices.length) : 0];
      if (chosen)
        return {
          ...chosen,
          feasible: true,
          meaningful: chosen.cost >= meaningfulCost,
        };
      const key = Object.keys(this.items).reduce(
        (best, key) =>
          this.items[key].baseCost < this.items[best].baseCost ? key : best,
        "cursor",
      );
      return {
        key,
        count: 1,
        cost: this.items[key].baseCost,
        feasible: false,
        meaningful: false,
      };
    }

    getQuestEfficiencyTarget(context, policy) {
      const budget = this.getQuestPurchaseBudget(context, policy);
      let affordableGain = 0;
      for (const [key, item] of Object.entries(this.items)) {
        if (item.baseCost <= budget)
          affordableGain = Math.max(
            affordableGain,
            context.production.buildings[key].perUnit,
          );
      }
      // One affordable building can satisfy the goal; extra Cursor synergy only helps.
      const gain = Math.min(
        Math.max(0.1, context.currentCPS * 0.05),
        affordableGain,
      );
      return context.currentCPS + gain;
    }

    isQuestTypeSuitable(type, context, policy) {
      if (type === "buyAny" || type === "buySpecific") {
        const plan = this.getQuestPurchasePlan(type, context, policy);
        return plan.feasible && plan.meaningful;
      }
      if (type === "spending")
        return (
          this.estimateBuyQuestCost(1, "buyAny") * 2 <=
          this.getQuestPurchaseBudget(context, policy)
        );
      if (type === "efficiency")
        return (
          context.production.temporaryMultiplier === 1 &&
          this.getQuestEfficiencyTarget(context, policy) > context.currentCPS
        );
      return true;
    }

    calculateDynamicReward(slot, questType = "produce", questData = null) {
      if (questType === "multiplier") return 0; // The existing timed multiplier IS the reward.
      const context = this.getQuestBalanceContext();
      const policy = this.getDynamicQuestBalance(slot.difficulty);
      const data = questData || {};
      const clicks =
        data.target ?? this.getQuestClickTarget(policy, context.stage);
      let effort;
      let transactionCap = Infinity;
      switch (questType) {
        case "click":
          effort = Math.max(
            clicks * this.calculateClickValue(),
            context.cps * (clicks / 2),
          );
          break;
        case "buyAny":
        case "buySpecific": {
          const cost = this.estimateBuyQuestCost(
            data.target || 1,
            questType,
            data,
          );
          effort = cost * 0.5;
          transactionCap = Math.max(1, Math.floor(effort * policy.bonusRate));
          break;
        }
        case "spending":
          effort = (data.target || context.rate * policy.seconds) * 0.3;
          transactionCap = Math.max(1, Math.floor(effort * policy.bonusRate));
          break;
        case "timedProduce":
          effort = (data.target || context.rate * 45) * 1.2;
          break;
        case "combo":
          // Clicking and production overlap; do not count the same earned donuts twice.
          effort =
            Math.max(
              data.produceTarget || context.rate * policy.seconds,
              (data.clickTarget || clicks / 2) * this.calculateClickValue(),
            ) * 1.2;
          break;
        case "efficiency":
          effort = context.cps * policy.seconds;
          break;
        default:
          effort = data.target || context.rate * policy.seconds;
      }
      const minimum = this.getDynamicRewardMinimum(
        context.stage,
        slot.difficulty,
      );
      const cap = this.getEconomicCap(context.stage, slot.difficulty);
      return Math.floor(
        Math.min(
          Math.max(effort * policy.bonusRate, minimum),
          cap,
          transactionCap,
        ),
      );
    }

    // Get current game stage for scaling
    getGameStage() {
      const buildings = Object.values(this.items).reduce(
        (s, i) => s + i.count,
        0,
      );
      const cps = this.getStableCPS();

      if (buildings < 3 || cps < 0.5) return 1;
      if (buildings < 8 || cps < 3) return 2;
      if (buildings < 15 || cps < 15) return 3;
      if (buildings < 30 || cps < 100) return 4;
      if (buildings < 60 || cps < 1000) return 5;
      if (buildings < 120 || cps < 10000) return 6;
      if (buildings < 250 || cps < 100000) return 7;
      return 8;
    }

    // Minimum rewards - INTENTIONALLY TINY
    // Just prevents 0, doesn't give free stuff
    getStageMinimum(stage) {
      const mins = { 1: 1, 2: 1, 3: 2, 4: 3, 5: 5, 6: 10, 7: 20, 8: 50 };
      return mins[stage] || 1;
    }

    // Difficulty-aware floor so early-game difficulties don't collapse into identical rewards
    getDynamicRewardMinimum(stage, difficulty) {
      const baseMin = this.getStageMinimum(stage);
      const diffFloor = {
        easy: 1,
        medium: 2,
        hard: 3,
        special: 5,
      };
      return baseMin * (diffFloor[difficulty] || 1);
    }

    // Recurring rewards stay bounded in production time without a cheap-building collapse.
    getEconomicCap(stage, difficulty) {
      const context = this.getQuestBalanceContext();
      const policy = this.getDynamicQuestBalance(difficulty);
      const purchaseCap =
        this.getNextMeaningfulPurchaseCost() * policy.purchaseCap;
      // Cheap old buildings must not collapse a late-game objective to tiny rewards.
      // This is a floor on the CAP, not a guaranteed reward or an income multiplier.
      const cap = Math.min(
        context.cps * policy.maxCapSeconds,
        Math.max(purchaseCap, context.cps * policy.minCapSeconds),
      );
      return Math.max(this.getDynamicRewardMinimum(stage, difficulty), cap);
    }

    // Legacy quest effort estimate retained for compatibility. New recurring rewards
    // use canonical click value and bounded human work; this is not playable click power.
    getQuestClickEffortEstimate() {
      return 1 + this.getStableCPS() * 0.005;
    }

    // Estimate buy quest cost
    estimateBuyQuestCost(count, questType, questData = null) {
      if (questType === "buySpecific") {
        const targetBuilding = questData?.buildingType;
        if (targetBuilding && this.items[targetBuilding]) {
          return this.estimateBuildingPurchaseCost(targetBuilding, count);
        }
        const cheapest = this.getCheapestBuilding();
        return this.estimateBuildingPurchaseCost(
          cheapest.key || "cursor",
          count,
        );
      }
      const prices = Object.values(this.items).map((item) => ({
        cost: item.baseCost,
        factor: item.costMultiplier,
      }));
      let total = 0;
      for (let n = 0; n < count; n++) {
        const cheapest = prices.reduce((best, price) =>
          price.cost < best.cost ? price : best,
        );
        total += cheapest.cost;
        cheapest.cost *= cheapest.factor;
      }
      return total;
    }

    // Estimate the real cumulative cost for buying N copies of a building
    estimateBuildingPurchaseCost(buildingType, count) {
      const item = this.items[buildingType];
      if (!item || count <= 0) return 0;

      let total = 0;
      let nextCost = item.baseCost;
      for (let i = 0; i < count; i++) {
        total += nextCost;
        nextCost *= item.costMultiplier;
      }
      return total;
    }

    // Get cheapest building
    getCheapestBuilding() {
      const buildingEntries = Object.entries(this.items);
      const affordable = buildingEntries.filter(
        ([, b]) => this.donutCount >= b.baseCost * 0.2,
      );
      if (affordable.length === 0)
        return { ...this.items.cursor, key: "cursor" };
      const [key, building] = affordable.reduce((minEntry, currentEntry) =>
        currentEntry[1].baseCost < minEntry[1].baseCost
          ? currentEntry
          : minEntry,
      );
      return { ...building, key };
    }

    // Stabilized CPS (120s rolling median)
    getStableCPS() {
      const now = this.getGameTime();
      const sorted = this.cpsHistory
        .filter(
          (sample) =>
            Number.isFinite(sample.cps) &&
            sample.cps >= 0 &&
            Number.isFinite(sample.time) &&
            sample.time > now - 120000 &&
            sample.time <= now,
        )
        .sort((a, b) => a.cps - b.cps);
      if (sorted.length === 0) return this.calculatePerSecond();
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? sorted[mid - 1].cps / 2 + sorted[mid].cps / 2
        : sorted[mid].cps;
    }

    // Get minimum reward based on game stage
    getMinRewardForStage() {
      return this.getStageMinimum(this.getGameStage());
    }

    // Type-specific rate for non-building milestones
    getMilestoneBonusRate(questType) {
      const rates = {
        production: 0.1,
        clicks: 0.1,
        cps: 0.12,
        totalBuildings: 0.11,
        upgrades: 0.14,
        questsCompleted: 0.16,
      };
      return rates[questType] || 0.1;
    }

    // Conservative cap for milestone rewards
    getMilestoneEconomicCap(questType, tierIndex = 0) {
      const stableCPS = this.getStableCPS();
      const nextBuilding = this.getNextMeaningfulPurchaseCost();
      const growthFactor = Math.min(1.8, 1 + tierIndex * 0.03);

      const buildingPercent = {
        building: 0.3,
        production: 0.1,
        clicks: 0.1,
        cps: 0.14,
        totalBuildings: 0.16,
        upgrades: 0.2,
        questsCompleted: 0.24,
      };

      const cpsSeconds = {
        building: 120,
        production: 45,
        clicks: 45,
        cps: 60,
        totalBuildings: 75,
        upgrades: 90,
        questsCompleted: 120,
      };

      const basePercent = buildingPercent[questType] || 0.1;
      const baseSeconds = cpsSeconds[questType] || 45;

      const buildingCap = nextBuilding * basePercent * growthFactor;
      const cpsCap = stableCPS * baseSeconds * growthFactor;

      return Math.max(
        this.getMinRewardForStage(),
        Math.min(buildingCap, cpsCap),
      );
    }

    calculateNonBuildingMilestoneReward(
      questType,
      tierIndex = 0,
      targetValue = 0,
    ) {
      const stableCPS = this.getStableCPS();
      const bonusRate = this.getMilestoneBonusRate(questType);
      const minutesByType = {
        production: 3 + tierIndex * 2,
        clicks: 3 + tierIndex * 2,
        cps: 3 + tierIndex * 3,
        totalBuildings: 4 + tierIndex * 3,
        upgrades: 5 + tierIndex * 4,
        questsCompleted: 6 + tierIndex * 5,
      };

      const minutes = minutesByType[questType] || 3 + tierIndex * 2;
      let reward = stableCPS * 60 * minutes * bonusRate;

      // CPS milestones should still reflect the achieved target modestly.
      if (questType === "cps" && targetValue > 0) {
        reward = Math.max(reward, targetValue * 8 * bonusRate);
      }

      const cap = this.getMilestoneEconomicCap(questType, tierIndex);
      reward = Math.min(reward, cap);

      return Math.max(Math.floor(reward), this.getMinRewardForStage());
    }

    getFrozenMilestoneReward(quest) {
      return Number.isFinite(quest?.frozenReward) ? quest.frozenReward : null;
    }

    calculateMilestoneRewardEstimate(
      questType,
      quest,
      questKey,
      tierKey = null,
    ) {
      const tierIndex = quest?.tierIndex || 0;
      if (questType === "building") {
        const targetTier = Number(tierKey);
        return this.calculateBuildingMilestoneReward(
          questKey,
          targetTier,
          tierIndex,
        );
      }

      return this.calculateNonBuildingMilestoneReward(
        questType,
        tierIndex,
        quest?.target || 0,
      );
    }

    freezeMilestoneReward(questType, quest, questKey, tierKey = null) {
      if (!quest || this._questStateLoading) return null;

      const frozenReward = this.getFrozenMilestoneReward(quest);
      if (frozenReward !== null) {
        quest.completionTime = quest.completionTime || this.getGameTime();
        return frozenReward;
      }

      if (!this.getProductionBreakdown().valid) return null;
      const reward = this.calculateMilestoneRewardEstimate(
        questType,
        quest,
        questKey,
        tierKey,
      );
      if (!Number.isFinite(reward) || reward < 0) return null;
      quest.frozenReward = reward;
      quest.completionTime = quest.completionTime || this.getGameTime();
      return reward;
    }

    freezeCompletedMilestoneRewards() {
      for (const [buildingType, tiers] of Object.entries(
        this.milestoneQuests.building,
      )) {
        for (const [tier, quest] of Object.entries(tiers)) {
          if (quest.completed) {
            this.freezeMilestoneReward("building", quest, buildingType, tier);
          }
        }
      }

      [
        "production",
        "clicks",
        "cps",
        "totalBuildings",
        "upgrades",
        "questsCompleted",
      ].forEach((category) => {
        for (const [target, quest] of Object.entries(
          this.milestoneQuests[category] || {},
        )) {
          if (quest.completed) {
            this.freezeMilestoneReward(category, quest, target);
          }
        }
      });
    }

    // Update CPS history (called in game loop)
    updateCPSHistory() {
      const currentCPS = this.calculatePerSecond();
      const now = this.getGameTime();

      this.cpsHistory.push({ cps: currentCPS, time: now });

      // Keep only last 120 seconds
      const cutoff = now - 120000;
      this.cpsHistory = this.cpsHistory.filter((h) => h.time > cutoff);
    }

    // Get final production multiplier (multiplicative)
    getFinalProductionMultiplier() {
      // Compatibility API: never multiply this into an already effective CPS.
      const modifiers = this.getProductionModifiers();
      return modifiers.prestigeMultiplier * modifiers.temporaryMultiplier;
    }

    // Update multipliers (tick-based, no setTimeout)
    updateQuestMultipliers(now = this.getGameTime()) {
      this.settleBeforeMutation();
      this.activeMultipliers = this.activeMultipliers.filter(
        (m) => m && Number.isFinite(m.endTime) && m.endTime > now,
      );

      if (
        this.multiplierState.active &&
        now >= this.multiplierState.active.endTime
      ) {
        const expiredAt = this.multiplierState.active.endTime;
        this.multiplierState.active = null;

        // Activate queued multiplier
        if (this.multiplierState.queued) {
          const queued = this.multiplierState.queued;
          this.multiplierState.queued = null;
          this.startQuestMultiplier(queued.amount, queued.duration, expiredAt);
          this.showNotification(
            `Queued ${queued.amount.toFixed(2)}x multiplier activated!`,
          );
          if (this.multiplierState.active.endTime <= now)
            this.multiplierState.active = null;
        }
      }
    }

    // Start a quest multiplier
    startQuestMultiplier(amount, duration, startedAt = this.getGameTime()) {
      this.settleBeforeMutation();
      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !Number.isFinite(duration) ||
        duration <= 0
      )
        return false;
      this.multiplierState.active = {
        amount: amount,
        endTime: startedAt + duration,
      };
      this.updateTotalPerSecond();
      this.updateDisplay(!this._settlingTime);
      return true;
    }

    // Apply multiplier reward with queue system
    applyMultiplierReward(amount, duration) {
      this.settleBeforeMutation();
      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !Number.isFinite(duration) ||
        duration <= 0
      )
        return false;
      this.updateQuestMultipliers();
      if (!this.multiplierState.active) {
        this.startQuestMultiplier(amount, duration);
        this.showNotification(
          `${amount.toFixed(2)}x multiplier active for ${duration / 1000}s!`,
        );
        return true;
      } else if (!this.multiplierState.queued) {
        this.multiplierState.queued = { amount, duration };
        this.updateDisplay(!this._settlingTime);
        this.showNotification(`${amount.toFixed(2)}x multiplier queued!`);
        return true;
      } else {
        this.showNotification("Multiplier queue full!");
        return false;
      }
    }

    // Generate dynamic quest for a slot
    generateQuestForSlot(slotId) {
      const slot = this.dynamicSlots[slotId];
      if (
        !slot ||
        this._questStateLoading ||
        slot.currentQuest ||
        (slot.cooldownEnd && this.getGameTime() < slot.cooldownEnd)
      )
        return false;

      // Filter pool if queue is full (no multiplier quests)
      let pool = [...slot.questPool];
      if (this.multiplierState.queued !== null) {
        pool = pool.filter((t) => t !== "multiplier");
      }
      const context = this.getQuestBalanceContext();
      const policy = this.getDynamicQuestBalance(slot.difficulty);
      pool = pool.filter((type) =>
        this.isQuestTypeSuitable(type, context, policy),
      );
      const activeTypes = Object.values(this.dynamicSlots)
        .filter(
          (other) =>
            other !== slot && other.currentQuest && !other.currentQuest.claimed,
        )
        .map((other) => other.currentQuest.type);
      const family = (type) =>
        ["produce", "timedProduce", "multiplier"].includes(type)
          ? "production"
          : ["click", "combo"].includes(type)
            ? "clicking"
            : ["buyAny", "buySpecific", "spending"].includes(type)
              ? "purchasing"
              : type;
      const distinctTypes = pool.filter((type) => !activeTypes.includes(type));
      if (distinctTypes.length) pool = distinctTypes;
      const familyLoad = (type) =>
        activeTypes.filter((active) => family(active) === family(type)).length;
      const leastLoad = Math.min(...pool.map(familyLoad));
      pool = pool.filter((type) => familyLoad(type) === leastLoad);
      if (pool.length === 0) pool = ["produce"]; // Always offer an achievable existing type.

      const questType = pool[Math.floor(Math.random() * pool.length)];
      const quest = this.createDynamicQuest(questType, slot);

      if (
        !quest ||
        !Number.isFinite(quest.target) ||
        quest.target <= 0 ||
        !this.isValidQuestReward(quest.reward)
      )
        return false;
      slot.currentQuest = quest;
      slot.cooldownEnd = null;
      this.requestQuestCheckpoint();
      return true;
    }

    // Create a dynamic quest based on type
    createDynamicQuest(type, slot) {
      if (this._questStateLoading || !this.getProductionBreakdown().valid)
        return null;
      const context = this.getQuestBalanceContext();
      const difficulty = slot.difficulty;
      const policy = this.getDynamicQuestBalance(difficulty);
      const baseId = `dynamic_${slot.id}_${this.getGameTime()}`;

      let quest = {
        id: baseId,
        slotId: slot.id,
        type: type,
        progress: 0,
        completed: false,
        claimed: false,
        startTime: this.getGameTime(),
      };

      switch (type) {
        case "click":
          quest.target = this.getQuestClickTarget(policy, context.stage);
          quest.title = `Click ${this.formatNumber(quest.target)} times`;
          quest.description = `Click the donut ${this.formatNumber(quest.target)} times`;
          quest.reward = {
            type: "donuts",
            amount: this.calculateDynamicReward(slot, "click", {
              target: quest.target,
            }),
          };
          quest.startClicks = this.totalClicks;
          break;

        case "produce":
          quest.target = Math.ceil(context.rate * policy.seconds);
          quest.title = `Produce ${this.formatNumber(quest.target)} donuts`;
          quest.description = `Produce ${this.formatNumber(quest.target)} donuts`;
          quest.reward = {
            type: "donuts",
            amount: this.calculateDynamicReward(slot, "produce", {
              target: quest.target,
            }),
          };
          quest.startProduction = this.totalDonutsEarned;
          break;

        case "buyAny":
          quest.target = this.getQuestPurchasePlan(
            "buyAny",
            context,
            policy,
          ).count;
          quest.title = `Buy ${quest.target} building${quest.target > 1 ? "s" : ""}`;
          quest.description = `Purchase any ${quest.target} building${quest.target > 1 ? "s" : ""}`;
          quest.reward = {
            type: "donuts",
            amount: this.calculateDynamicReward(slot, "buyAny", {
              target: quest.target,
            }),
          };
          quest.startBuildings = Object.values(this.items).reduce(
            (s, i) => s + i.count,
            0,
          );
          break;

        case "buySpecific":
          const purchasePlan = this.getQuestPurchasePlan(
            "buySpecific",
            context,
            policy,
            true,
          );
          const targetBuilding = purchasePlan.key;
          quest.target = purchasePlan.count;
          quest.buildingType = targetBuilding;
          quest.title = `Buy ${quest.target} ${this.items[targetBuilding].name}${quest.target > 1 ? "s" : ""}`;
          quest.description = `Purchase ${quest.target} ${this.items[targetBuilding].name}${quest.target > 1 ? "s" : ""}`;
          quest.reward = {
            type: "donuts",
            amount: this.calculateDynamicReward(slot, "buySpecific", {
              target: quest.target,
              buildingType: targetBuilding,
            }),
          };
          quest.startCount = this.items[targetBuilding].count;
          break;

        case "timedProduce":
          quest.target = Math.ceil(context.rate * 45);
          quest.timeLimit = 60000; // 60 seconds
          quest.title = `Quick Production`;
          quest.description = `Produce ${this.formatNumber(quest.target)} donuts in 60 seconds`;
          quest.reward = {
            type: "donuts",
            amount: this.calculateDynamicReward(slot, "timedProduce", {
              target: quest.target,
            }),
          };
          quest.startProduction = this.totalDonutsEarned;
          quest.timedStartTime = this.getGameTime();
          break;

        case "multiplier":
          const multiplierAmounts = {
            easy: 1.15,
            medium: 1.25,
            hard: 1.5,
            special: 2.0,
          };
          const multiplierDurations = {
            easy: 20000,
            medium: 30000,
            hard: 45000,
            special: 60000,
          };
          quest.target = Math.ceil(context.rate * policy.seconds);
          quest.title = `Multiplier Challenge`;
          quest.description = `Produce ${this.formatNumber(quest.target)} donuts for ${multiplierAmounts[difficulty]}x boost`;
          quest.reward = {
            type: "multiplier",
            amount: multiplierAmounts[difficulty],
            duration: multiplierDurations[difficulty],
          };
          quest.startProduction = this.totalDonutsEarned;
          break;

        case "efficiency":
          quest.target = this.getQuestEfficiencyTarget(context, policy);
          quest.title = `Efficiency Challenge`;
          quest.description = `Reach ${this.formatNumber(quest.target)} donuts/sec`;
          quest.reward = {
            type: "donuts",
            amount: this.calculateDynamicReward(slot, "efficiency", {
              target: quest.target,
            }),
          };
          quest.startCPS = context.currentCPS;
          break;

        case "combo":
          quest.clickTarget = Math.ceil(
            this.getQuestClickTarget(policy, context.stage) * 0.5,
          );
          quest.produceTarget = Math.ceil(context.rate * policy.seconds);
          quest.target = 100; // Percentage
          quest.title = `Combo Challenge`;
          quest.description = `Click ${this.formatNumber(quest.clickTarget)}x AND produce ${this.formatNumber(quest.produceTarget)} donuts`;
          quest.reward = {
            type: "donuts",
            amount: this.calculateDynamicReward(slot, "combo", {
              clickTarget: quest.clickTarget,
              produceTarget: quest.produceTarget,
            }),
          };
          quest.startClicks = this.totalClicks;
          quest.startProduction = this.totalDonutsEarned;
          break;

        case "spending":
          // Spend donuts on buildings - gives small rebate
          quest.target = Math.ceil(
            Math.max(
              context.rate * policy.seconds,
              this.estimateBuyQuestCost(1, "buyAny") * 2,
            ),
          );
          quest.title = `Spending Spree`;
          quest.description = `Spend ${this.formatNumber(quest.target)} donuts on buildings`;
          quest.reward = {
            type: "donuts",
            amount: this.calculateDynamicReward(slot, "spending", {
              target: quest.target,
            }),
          };
          quest.startSpent = this.questTracking?.currentRun?.totalSpent || 0;
          break;
      }

      return Number.isFinite(quest.target) &&
        quest.target > 0 &&
        this.isValidQuestReward(quest.reward)
        ? quest
        : null;
    }

    requestQuestCheckpoint() {
      const delay =
        this._questSaveDelay ??
        (this._saveTimer !== null
          ? Math.max(0, this._saveDeadline - this.getGameTime())
          : 1000);
      this.requestSave(delay);
    }

    isValidQuestReward(reward) {
      return (
        reward &&
        Number.isFinite(reward.amount) &&
        reward.amount >= 0 &&
        (reward.type === "donuts" ||
          (reward.type === "multiplier" &&
            reward.amount > 0 &&
            Number.isFinite(reward.duration) &&
            reward.duration > 0))
      );
    }

    restoreQuestLifecycle(savedAt) {
      for (const slot of Object.values(this.dynamicSlots)) {
        const quest = slot.currentQuest;
        // A legacy claimed slot is a receipt, never an active reward to grant again.
        if (quest?.claimed) {
          slot.currentQuest = null;
          slot.cooldownEnd =
            slot.cooldownEnd ?? (savedAt ?? this.getGameTime()) + slot.cooldown;
          continue;
        }
        if (!quest) continue;
        quest.progress = this.economicNumber(quest.progress);
        if (quest.completed)
          quest.progress = Math.max(quest.progress, quest.target);
        // Missing legacy baselines must not count an entire run as new progress.
        // Reconstruct only absent fields from the saved progress; explicit zero is valid.
        const restoreStart = (key, current, progress = quest.progress) => {
          if (quest[key] === undefined)
            quest[key] = Math.max(0, this.economicNumber(current) - progress);
        };
        switch (quest.type) {
          case "click":
            restoreStart("startClicks", this.totalClicks);
            break;
          case "produce":
          case "timedProduce":
          case "multiplier":
            restoreStart("startProduction", this.totalDonutsEarned);
            break;
          case "buyAny":
            restoreStart(
              "startBuildings",
              Object.values(this.items).reduce(
                (sum, item) => sum + item.count,
                0,
              ),
            );
            break;
          case "buySpecific":
            restoreStart("startCount", this.items[quest.buildingType]?.count);
            break;
          case "spending":
            restoreStart(
              "startSpent",
              this.questTracking.currentRun.totalSpent,
            );
            break;
          case "combo": {
            // Overall combo progress proves at least this fraction of BOTH objectives.
            const fraction = Math.min(1, quest.progress / 100);
            restoreStart(
              "startClicks",
              this.totalClicks,
              fraction * quest.clickTarget,
            );
            restoreStart(
              "startProduction",
              this.totalDonutsEarned,
              fraction * quest.produceTarget,
            );
            break;
          }
        }
        // One-time balance compatibility: an old million-click assignment must
        // not survive the new human-input limit. Keep identity, baselines/reward;
        // normal progress checks still own completion and its counter.
        const policy = this.getDynamicQuestBalance(slot.difficulty);
        if (
          !quest.completed &&
          quest.type === "click" &&
          quest.target > policy.maxClicks
        ) {
          quest.target = policy.maxClicks;
          quest.title = `Click ${this.formatNumber(quest.target)} times`;
          quest.description = `Click the donut ${this.formatNumber(quest.target)} times`;
        }
        if (
          !quest.completed &&
          quest.type === "combo" &&
          quest.clickTarget > policy.maxClicks * 0.5
        ) {
          quest.clickTarget = Math.ceil(policy.maxClicks * 0.5);
          quest.description = `Click ${this.formatNumber(quest.clickTarget)}x AND produce ${this.formatNumber(quest.produceTarget)} donuts`;
          quest.progress = this.economicNumber(
            this.getDynamicQuestProgress(quest),
          );
        }
      }
    }

    expireTimedQuest(slot, now = this.getGameTime()) {
      this.settleBeforeMutation();
      const quest = slot.currentQuest;
      if (
        !quest ||
        quest.type !== "timedProduce" ||
        quest.completed ||
        quest.claimed ||
        now <= quest.timedStartTime + quest.timeLimit
      )
        return false;
      slot.currentQuest = null;
      slot.cooldownEnd = quest.timedStartTime + quest.timeLimit + slot.cooldown;
      this.requestQuestCheckpoint();
      this.showNotification("Timed quest expired!");
      return true;
    }

    updateDynamicSlots() {
      this.settleBeforeMutation();
      if (this._questStateLoading) return;
      for (const slot of Object.values(this.dynamicSlots)) {
        if (this.expireTimedQuest(slot)) continue;
        if (this._settlingTime || this.timeState.inactive) continue;
        if (
          !slot.currentQuest &&
          (!slot.cooldownEnd || this.getGameTime() >= slot.cooldownEnd)
        ) {
          this.generateQuestForSlot(slot.id);
        }
      }
    }

    getDynamicQuestProgress(quest) {
      const difference = (value, start) =>
        Math.max(0, this.economicNumber(value) - this.economicNumber(start));
      switch (quest.type) {
        case "click":
          return difference(this.totalClicks, quest.startClicks);
        case "produce":
        case "timedProduce":
        case "multiplier":
          return difference(this.totalDonutsEarned, quest.startProduction);
        case "buyAny":
          return difference(
            Object.values(this.items).reduce(
              (sum, item) => sum + this.economicNumber(item.count),
              0,
            ),
            quest.startBuildings,
          );
        case "buySpecific":
          return difference(
            this.items[quest.buildingType]?.count,
            quest.startCount,
          );
        case "efficiency":
          return this.calculatePerSecond();
        case "combo":
          return Math.min(
            this.questProgressPercent(
              difference(this.totalClicks, quest.startClicks),
              quest.clickTarget,
            ),
            this.questProgressPercent(
              difference(this.totalDonutsEarned, quest.startProduction),
              quest.produceTarget,
            ),
          );
        case "spending":
          return difference(
            this.questTracking.currentRun.totalSpent,
            quest.startSpent,
          );
        default:
          return 0;
      }
    }

    questProgressPercent(progress, target) {
      if (!Number.isFinite(target) || target <= 0) return 0;
      return Math.min(100, (this.economicNumber(progress) / target) * 100);
    }

    normalizeQuestTargetProgress(progress, target, productionTolerance = 0) {
      // A different settlement partition can land a few Number ULPs below a
      // reached boundary (e.g. 599.9999999999999 / 600). Do not defer its receipt.
      if (!Number.isFinite(progress) || !Number.isFinite(target))
        return progress;
      const tolerance = Number.isFinite(productionTolerance)
        ? Math.max(0, productionTolerance)
        : 0;
      return progress < target &&
        target - progress <=
          Math.max(tolerance, Number.EPSILON * Math.max(1, target) * 8)
        ? target
        : progress;
    }

    checkDynamicQuestProgress(productionTolerance = 0) {
      this.settleBeforeMutation();
      if (this._questStateLoading) return;
      for (const slot of Object.values(this.dynamicSlots)) {
        if (this.expireTimedQuest(slot)) continue;
        const quest = slot.currentQuest;
        if (!quest || quest.completed || quest.claimed) continue;
        quest.progress = this.normalizeQuestTargetProgress(
          this.economicNumber(this.getDynamicQuestProgress(quest)),
          quest.target,
          ["produce", "timedProduce", "multiplier"].includes(quest.type)
            ? productionTolerance
            : 0,
        );
        if (quest.progress >= quest.target) {
          quest.completed = true;
          quest.completionTime = this.getGameTime();
          this.questTracking.currentRun.questsCompleted =
            this.economicNumber(this.questTracking.currentRun.questsCompleted) +
            1;
          this.requestQuestCheckpoint();
          this.showNotification(`Quest completed: ${quest.title}!`, 3000, {
            questProgress: true,
          });
        }
      }
    }

    // Check milestone quest progress
    checkMilestoneProgress(productionTolerance = 0) {
      if (this._questStateLoading) return;
      // Building milestones
      for (const [buildingType, tiers] of Object.entries(
        this.milestoneQuests.building,
      )) {
        for (const [tier, quest] of Object.entries(tiers)) {
          if (quest.claimed || quest.completed) continue;
          quest.progress = this.economicNumber(this.items[buildingType]?.count);
          if (quest.progress >= quest.target && !quest.completed) {
            this.completeMilestoneQuest(
              quest,
              "building",
              buildingType,
              `Milestone: Own ${tier} ${this.items[buildingType]?.name || buildingType}(s)!`,
              tier,
            );
          }
        }
      }

      // Production milestones
      for (const [target, quest] of Object.entries(
        this.milestoneQuests.production,
      )) {
        if (quest.claimed || quest.completed) continue;
        quest.progress = this.normalizeQuestTargetProgress(
          this.economicNumber(this.totalDonutsEarned),
          quest.target,
          productionTolerance,
        );
        if (quest.progress >= quest.target && !quest.completed) {
          this.completeMilestoneQuest(
            quest,
            "production",
            target,
            `Milestone: Produced ${this.formatNumber(quest.target)} donuts!`,
          );
        }
      }

      // Click milestones
      for (const [, quest] of Object.entries(this.milestoneQuests.clicks)) {
        if (quest.claimed || quest.completed) continue;
        quest.progress = this.economicNumber(this.totalClicks);
        if (quest.progress >= quest.target && !quest.completed) {
          this.completeMilestoneQuest(
            quest,
            "clicks",
            quest.target,
            `Milestone: ${this.formatNumber(quest.target)} clicks!`,
          );
        }
      }

      // CPS milestones (new)
      if (this.milestoneQuests.cps) {
        const currentCPS = this.calculatePerSecond();
        for (const [, quest] of Object.entries(this.milestoneQuests.cps)) {
          if (quest.claimed || quest.completed) continue;
          quest.progress = currentCPS;
          if (quest.progress >= quest.target && !quest.completed) {
            this.completeMilestoneQuest(
              quest,
              "cps",
              quest.target,
              `Milestone: ${this.formatNumber(quest.target)} donuts/sec!`,
            );
          }
        }
      }

      // Total buildings milestones (new)
      if (this.milestoneQuests.totalBuildings) {
        const totalBuildings = Object.values(this.items).reduce(
          (sum, item) => sum + this.economicNumber(item.count),
          0,
        );
        for (const [, quest] of Object.entries(
          this.milestoneQuests.totalBuildings,
        )) {
          if (quest.claimed || quest.completed) continue;
          quest.progress = totalBuildings;
          if (quest.progress >= quest.target && !quest.completed) {
            this.completeMilestoneQuest(
              quest,
              "totalBuildings",
              quest.target,
              `Milestone: Own ${this.formatNumber(quest.target)} total buildings!`,
            );
          }
        }
      }

      // Upgrade milestones (new)
      if (this.milestoneQuests.upgrades) {
        const totalUpgrades = this.getTotalPurchasedUpgrades();
        for (const [, quest] of Object.entries(this.milestoneQuests.upgrades)) {
          if (quest.claimed || quest.completed) continue;
          quest.progress = totalUpgrades;
          if (quest.progress >= quest.target && !quest.completed) {
            this.completeMilestoneQuest(
              quest,
              "upgrades",
              quest.target,
              `Milestone: Purchase ${quest.target} upgrades!`,
            );
          }
        }
      }

      // Quest completion milestones (meta-milestone, new)
      if (this.milestoneQuests.questsCompleted) {
        const totalCompleted = this.getTotalCompletedQuests();
        for (const [, quest] of Object.entries(
          this.milestoneQuests.questsCompleted,
        )) {
          if (quest.claimed || quest.completed) continue;
          quest.progress = totalCompleted;
          if (quest.progress >= quest.target && !quest.completed) {
            this.completeMilestoneQuest(
              quest,
              "questsCompleted",
              quest.target,
              `Meta-Milestone: Complete ${quest.target} quests!`,
            );
          }
        }
      }
    }

    // Helper: Count total purchased upgrades
    getTotalPurchasedUpgrades() {
      let total = 0;
      for (const key of Object.keys(this.upgrades)) {
        if (Array.isArray(this.upgrades[key])) {
          total += this.upgrades[key].filter((u) => u.purchased).length;
        }
      }
      return total;
    }

    // Helper: Count total completed (claimed) quests
    getTotalCompletedQuests() {
      let total = 0;

      // Building quests
      for (const tiers of Object.values(this.milestoneQuests.building)) {
        for (const quest of Object.values(tiers)) {
          if (quest.claimed) total++;
        }
      }

      // Production quests
      for (const quest of Object.values(this.milestoneQuests.production)) {
        if (quest.claimed) total++;
      }

      // Click quests
      for (const quest of Object.values(this.milestoneQuests.clicks)) {
        if (quest.claimed) total++;
      }

      // CPS quests
      if (this.milestoneQuests.cps) {
        for (const quest of Object.values(this.milestoneQuests.cps)) {
          if (quest.claimed) total++;
        }
      }

      // Total buildings quests
      if (this.milestoneQuests.totalBuildings) {
        for (const quest of Object.values(
          this.milestoneQuests.totalBuildings,
        )) {
          if (quest.claimed) total++;
        }
      }

      // Upgrade quests
      if (this.milestoneQuests.upgrades) {
        for (const quest of Object.values(this.milestoneQuests.upgrades)) {
          if (quest.claimed) total++;
        }
      }

      // Dynamic quest tracking
      total += this.questTracking?.currentRun?.questsCompleted || 0;

      return total;
    }

    // Unified reward calculator for milestone claim + UI preview
    calculateMilestoneRewardByType(questType, quest, questKey, tierKey = null) {
      const frozenReward = this.getFrozenMilestoneReward(quest);
      if (frozenReward !== null) {
        return frozenReward;
      }

      return this.calculateMilestoneRewardEstimate(
        questType,
        quest,
        questKey,
        tierKey,
      );
    }

    completeMilestoneQuest(
      quest,
      questType,
      questKey,
      message,
      tierKey = null,
    ) {
      if (!quest || quest.completed) return;

      if (
        this.freezeMilestoneReward(questType, quest, questKey, tierKey) === null
      )
        return;
      quest.completed = true;
      this.requestQuestCheckpoint();
      this.showNotification(message, 3000, { questProgress: true });
    }

    // Claim milestone quest reward
    claimMilestoneReward(questType, questKey, tierKey) {
      this.settleBeforeMutation();
      let quest;
      if (questType === "building") {
        quest = this.milestoneQuests.building[questKey]?.[tierKey];
      } else if (questType === "production") {
        quest = this.milestoneQuests.production[questKey];
      } else if (questType === "clicks") {
        quest = this.milestoneQuests.clicks[questKey];
      } else if (questType === "cps") {
        quest = this.milestoneQuests.cps?.[questKey];
      } else if (questType === "totalBuildings") {
        quest = this.milestoneQuests.totalBuildings?.[questKey];
      } else if (questType === "upgrades") {
        quest = this.milestoneQuests.upgrades?.[questKey];
      } else if (questType === "questsCompleted") {
        quest = this.milestoneQuests.questsCompleted?.[questKey];
      }

      if (!quest || !quest.completed || quest.claimed) return;

      const reward = this.freezeMilestoneReward(
        questType,
        quest,
        questKey,
        tierKey,
      );

      if (
        !Number.isFinite(reward) ||
        reward < 0 ||
        !this.creditDonuts(reward, false)
      )
        return false;
      quest.claimed = true;
      this.showNotification(`+${this.formatNumber(reward)} donuts earned!`);
      this.updateQuestDisplay();
      this.updateDisplay();
      this.requestSave();
      return true;
    }

    // Claim dynamic quest reward
    claimDynamicReward(slotId, expectedQuestId = null) {
      this.settleBeforeMutation();
      const slot = this.dynamicSlots[slotId];
      const quest = slot?.currentQuest;

      if (
        !quest ||
        !quest.completed ||
        quest.claimed ||
        (expectedQuestId !== null && quest.id !== expectedQuestId)
      )
        return false;

      if (!this.deliverQuestReward(quest.reward)) return false;

      quest.claimed = true;

      // Start cooldown
      slot.currentQuest = null;
      slot.cooldownEnd = this.getGameTime() + slot.cooldown;

      this.updateQuestDisplay();
      this.updateDisplay();
      this.requestSave();
      return true;
    }

    deliverQuestReward(reward) {
      if (!this.isValidQuestReward(reward)) return false;
      if (reward.type === "multiplier")
        return this.applyMultiplierReward(reward.amount, reward.duration);
      if (!this.creditDonuts(reward.amount, false)) return false;
      this.showNotification(
        `+${this.formatNumber(reward.amount)} donuts earned!`,
      );
      return true;
    }

    // Track spending at tier (called when buying)
    trackBuildingPurchase(buildingType, cost) {
      if (!this.questTracking.currentRun.spentAtTier[buildingType]) {
        this.questTracking.currentRun.spentAtTier[buildingType] = {
          cumulative: 0,
        };
      }

      const tracking = this.questTracking.currentRun.spentAtTier[buildingType];
      tracking.cumulative = (tracking.cumulative || 0) + cost;

      // totalSpent is recorded once by buyItem from the actual rounded charge.
      // Snapshot at tier
      const newCount = this.items[buildingType].count + 1;
      const tiers = this.milestoneTiers[buildingType] || [];
      if (tiers.includes(newCount)) {
        tracking[newCount] = tracking.cumulative;
      }
    }

    // Migrate old quests to new system
    migrateOldQuests(oldQuests) {
      // Map old quest IDs to new milestone structure
      const buildingMap = {
        cursorNovice: { type: "cursor", tier: 5 },
        cursorAdept: { type: "cursor", tier: 25 },
        cursorMaster: { type: "cursor", tier: 50 },
        cursorLegend: { type: "cursor", tier: 100 },
        cursorGod: { type: "cursor", tier: 200 },
        bakerApprentice: { type: "baker", tier: 3 },
        bakerJourneyman: { type: "baker", tier: 10 },
        bakerMaster: { type: "baker", tier: 25 },
        bakerLegend: { type: "baker", tier: 50 },
        bakerGod: { type: "baker", tier: 100 },
        farmStarter: { type: "farm", tier: 2 },
        farmManager: { type: "farm", tier: 8 },
        farmMaster: { type: "farm", tier: 20 },
        farmLegend: { type: "farm", tier: 35 },
        farmGod: { type: "farm", tier: 50 },
        mineExplorer: { type: "mine", tier: 1 },
        mineOperator: { type: "mine", tier: 3 },
        mineMaster: { type: "mine", tier: 10 },
        mineLegend: { type: "mine", tier: 15 },
        mineGod: { type: "mine", tier: 20 },
        factoryWorker: { type: "factory", tier: 1 },
        factorySupervisor: { type: "factory", tier: 5 },
        factoryMaster: { type: "factory", tier: 15 },
        factoryLegend: { type: "factory", tier: 25 },
        factoryGod: { type: "factory", tier: 40 },
        logisticsIntern: { type: "logisticCenter", tier: 1 },
        logisticsManager: { type: "logisticCenter", tier: 3 },
        logisticsMaster: { type: "logisticCenter", tier: 10 },
        logisticsLegend: { type: "logisticCenter", tier: 15 },
        logisticsGod: { type: "logisticCenter", tier: 25 },
      };

      const productionMap = {
        firstProduction: 500,
        smallBusiness: 10000,
        growingBusiness: 100000,
        donutEntrepreneur: 1000000,
        donutCorporation: 10000000,
        donutEmpire: 100000000,
        donutGalaxy: 1000000000,
        donutUniverse: 1000000000000,
        legendaryProducer: 1000000000000000,
      };

      const clickMap = {
        beginnerClicker: 50,
        clickEnthusiast: 500,
        clickMaster: 2000,
        clickProfessional: 5000,
        clickExpert: 10000,
        clickLegend: 25000,
        clickGod: 50000,
        clickingDiety: 1000000,
      };

      // Migrate claimed status
      for (const [questId, quest] of Object.entries(oldQuests)) {
        if (!quest.claimed) continue;

        // Building quests
        if (buildingMap[questId]) {
          const { type, tier } = buildingMap[questId];
          // Find closest matching tier in new system
          const tiers = this.milestoneTiers[type] || [];
          const closestTier =
            tiers.find((t) => t >= tier) || tiers[tiers.length - 1];
          if (this.milestoneQuests.building[type]?.[closestTier]) {
            this.milestoneQuests.building[type][closestTier].claimed = true;
            this.milestoneQuests.building[type][closestTier].completed = true;
          }
        }

        // Production quests
        if (productionMap[questId]) {
          const target = productionMap[questId];
          // Find closest matching target in new system
          const closestTarget =
            this.productionMilestones.find((t) => t >= target) ||
            this.productionMilestones[this.productionMilestones.length - 1];
          if (this.milestoneQuests.production[closestTarget]) {
            this.milestoneQuests.production[closestTarget].claimed = true;
            this.milestoneQuests.production[closestTarget].completed = true;
          }
        }

        // Click quests
        if (clickMap[questId]) {
          const target = clickMap[questId];
          const closestTarget =
            this.clickMilestones.find((t) => t >= target) ||
            this.clickMilestones[this.clickMilestones.length - 1];
          if (this.milestoneQuests.clicks[closestTarget]) {
            this.milestoneQuests.clicks[closestTarget].claimed = true;
            this.milestoneQuests.clicks[closestTarget].completed = true;
          }
        }
      }
    }

    setupQuestSystem() {
      // Quest menüsü elementlerini seç
      this.questsMenu = document.getElementById("quests-menu");
      this.questsButton = document.getElementById("quests");
      this.closeQuestsButton = document.getElementById("close-quests-menu");

      // While user is interacting with quest menu, avoid frequent full rerenders.
      this.questsMenu.addEventListener("mouseenter", () => {
        this.isHoveringQuestMenu = true;
      });
      this.questsMenu.addEventListener("mouseleave", () => {
        this.isHoveringQuestMenu = false;
        const now = this.getGameTime();
        this._lastQuestUIRefresh = now;
        this._lastQuestUILiveUpdate = now;
        this.updateQuestDisplay();
      });

      // Event listener'ları ekle
      this.questsButton.addEventListener("click", () => this.toggleQuestMenu());
      this.closeQuestsButton.addEventListener("click", () =>
        this.closeQuestMenu(),
      );

      // Tab sistemi (yeni class: .quest-tab)
      document.querySelectorAll(".quest-tab").forEach((button) => {
        button.addEventListener("click", () =>
          this.switchQuestTab(button.dataset.tab),
        );
      });

      // ESC tuşu ile kapatma
      document.addEventListener("keydown", (e) => {
        if (
          e.key === "Escape" &&
          !this.questsMenu.classList.contains("hidden")
        ) {
          this.closeQuestMenu();
        }
      });

      // Update KPI counts
      this.updateQuestKPIs();
    }

    updateQuestKPIs() {
      if (!this.canPresent()) return;
      const activeCount = document.getElementById("quest-active-count");
      const completedCount = document.getElementById("quest-completed-count");

      if (!activeCount || !completedCount) return;

      // Count active dynamic quests
      let active = 0;
      let readyToClaim = 0;

      for (const slotId of Object.keys(this.dynamicSlots)) {
        const quest = this.dynamicSlots[slotId].currentQuest;
        if (quest && !quest.claimed) {
          active++;
          if (quest.completed) readyToClaim++;
        }
      }

      // Count unclaimed milestones
      let milestoneReady = 0;
      for (const tiers of Object.values(this.milestoneQuests.building)) {
        for (const quest of Object.values(tiers)) {
          if (quest.completed && !quest.claimed) milestoneReady++;
        }
      }
      for (const quest of Object.values(this.milestoneQuests.production)) {
        if (quest.completed && !quest.claimed) milestoneReady++;
      }
      for (const quest of Object.values(this.milestoneQuests.clicks)) {
        if (quest.completed && !quest.claimed) milestoneReady++;
      }
      // New milestone types
      if (this.milestoneQuests.cps) {
        for (const quest of Object.values(this.milestoneQuests.cps)) {
          if (quest.completed && !quest.claimed) milestoneReady++;
        }
      }
      if (this.milestoneQuests.totalBuildings) {
        for (const quest of Object.values(
          this.milestoneQuests.totalBuildings,
        )) {
          if (quest.completed && !quest.claimed) milestoneReady++;
        }
      }
      if (this.milestoneQuests.upgrades) {
        for (const quest of Object.values(this.milestoneQuests.upgrades)) {
          if (quest.completed && !quest.claimed) milestoneReady++;
        }
      }
      if (this.milestoneQuests.questsCompleted) {
        for (const quest of Object.values(
          this.milestoneQuests.questsCompleted,
        )) {
          if (quest.completed && !quest.claimed) milestoneReady++;
        }
      }

      activeCount.textContent = `${active} Active`;
      completedCount.textContent = `${readyToClaim + milestoneReady} Ready`;
    }

    toggleQuestMenu() {
      if (this.questsMenu.classList.contains("hidden")) {
        this.openQuestMenu();
      } else {
        this.closeQuestMenu();
      }
    }

    openQuestMenu() {
      this.questsMenu.classList.remove("hidden");
      const now = this.getGameTime();
      this._lastQuestUIRefresh = now;
      this._lastQuestUILiveUpdate = now;
      this.updateQuestDisplay();
    }

    closeQuestMenu() {
      this.questsMenu.classList.add("hidden");
    }

    updateQuestDisplay() {
      if (!this.canPresent()) return;
      const activeContainer = this.questsMenu.querySelector(
        ".quests-container.active",
      );
      const completedContainer = this.questsMenu.querySelector(
        ".quests-container.completed",
      );

      if (activeContainer && !activeContainer.classList.contains("hidden")) {
        this.renderActiveQuests(activeContainer);
      }
      if (
        completedContainer &&
        !completedContainer.classList.contains("hidden")
      ) {
        this.renderCompletedQuests(completedContainer);
      }

      // Update KPI badges
      this.updateQuestKPIs();
    }

    getActiveQuestEntries() {
      const entries = Object.values(this.dynamicSlots).map((slot) => ({
        kind: "dynamic",
        id: slot.id,
        slot,
        quest: slot.currentQuest,
      }));
      const addTrack = (track, category, key = null) => {
        let shownActive = false;
        for (const [target, quest] of Object.entries(track || {})) {
          if (quest.claimed) continue;
          if (!quest.completed) {
            if (shownActive || quest.retired) continue;
            shownActive = true;
          }
          entries.push({
            kind: "milestone",
            id: quest.id,
            quest,
            category,
            key: key ?? target,
            tier: key === null ? null : target,
          });
        }
      };
      for (const [key, track] of Object.entries(
        this.milestoneQuests.building,
      )) {
        addTrack(track, "building", key);
      }
      for (const category of [
        "production",
        "clicks",
        "cps",
        "totalBuildings",
        "upgrades",
        "questsCompleted",
      ]) {
        addTrack(this.milestoneQuests[category], category);
      }
      // Stable partition: preserve slot/track/tier order inside each state category.
      const rank = (entry) =>
        entry.quest?.completed && !entry.quest.claimed
          ? 0
          : entry.quest
            ? 1
            : 2;
      return entries.sort((a, b) => rank(a) - rank(b));
    }

    getQuestListSignature(entries = this.getActiveQuestEntries()) {
      return JSON.stringify(
        entries.map((entry) => [
          entry.id,
          entry.quest?.id,
          Boolean(entry.quest?.completed),
          Boolean(entry.quest?.claimed),
          entry.slot?.cooldownEnd,
        ]),
      );
    }

    renderActiveQuests(container) {
      container.innerHTML = "";
      const entries = this.getActiveQuestEntries();
      const ready = (entry) => entry.quest?.completed && !entry.quest.claimed;
      const groups = [
        {
          title: "Ready to Claim",
          className: "ready-quests",
          entries: entries.filter(ready),
        },
        {
          title: "Active Quests",
          className: "dynamic-quests",
          entries: entries.filter((e) => !ready(e) && e.kind === "dynamic"),
        },
        {
          title: "Milestones",
          className: "milestone-quests",
          entries: entries.filter((e) => !ready(e) && e.kind === "milestone"),
        },
      ];
      const fragment = document.createDocumentFragment();
      for (const group of groups) {
        if (group.entries.length === 0) continue;
        const section = document.createElement("div");
        section.className = `quest-section ${group.className}`;
        section.innerHTML = `<h3>${group.title}</h3>`;
        for (const entry of group.entries) {
          section.appendChild(
            entry.kind === "dynamic"
              ? this.renderDynamicSlot(entry.slot)
              : this.createMilestoneElement(
                  entry.quest,
                  entry.category,
                  entry.key,
                  entry.tier,
                ),
          );
        }
        fragment.appendChild(section);
      }
      container.appendChild(fragment);
      this._questListSignature = this.getQuestListSignature(entries);
    }

    renderCompletedQuests(container) {
      container.innerHTML = "";
      const fragment = document.createDocumentFragment();

      // Claimed milestones
      const claimedQuests = [];

      for (const [buildingType, tiers] of Object.entries(
        this.milestoneQuests.building,
      )) {
        for (const [tier, quest] of Object.entries(tiers)) {
          if (quest.claimed) {
            claimedQuests.push({
              ...quest,
              category: "building",
              buildingType,
              tier,
            });
          }
        }
      }

      for (const [target, quest] of Object.entries(
        this.milestoneQuests.production,
      )) {
        if (quest.claimed) {
          claimedQuests.push({ ...quest, category: "production", target });
        }
      }

      for (const [target, quest] of Object.entries(
        this.milestoneQuests.clicks,
      )) {
        if (quest.claimed) {
          claimedQuests.push({ ...quest, category: "clicks", target });
        }
      }

      // CPS milestones
      if (this.milestoneQuests.cps) {
        for (const [target, quest] of Object.entries(
          this.milestoneQuests.cps,
        )) {
          if (quest.claimed) {
            claimedQuests.push({ ...quest, category: "cps", target });
          }
        }
      }

      // Total buildings milestones
      if (this.milestoneQuests.totalBuildings) {
        for (const [target, quest] of Object.entries(
          this.milestoneQuests.totalBuildings,
        )) {
          if (quest.claimed) {
            claimedQuests.push({
              ...quest,
              category: "totalBuildings",
              target,
            });
          }
        }
      }

      // Upgrade milestones
      if (this.milestoneQuests.upgrades) {
        for (const [target, quest] of Object.entries(
          this.milestoneQuests.upgrades,
        )) {
          if (quest.claimed) {
            claimedQuests.push({ ...quest, category: "upgrades", target });
          }
        }
      }

      // Quest completion milestones
      if (this.milestoneQuests.questsCompleted) {
        for (const [target, quest] of Object.entries(
          this.milestoneQuests.questsCompleted,
        )) {
          if (quest.claimed) {
            claimedQuests.push({
              ...quest,
              category: "questsCompleted",
              target,
            });
          }
        }
      }

      if (claimedQuests.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.textContent = "No completed quests yet.";
        emptyMsg.className = "empty-message";
        fragment.appendChild(emptyMsg);
      } else {
        claimedQuests.forEach((quest) => {
          const element = document.createElement("div");
          element.className = "quest-item completed";
          element.innerHTML = `
            <div class="quest-info">
              <h4>${this.getMilestoneTitle(quest)}</h4>
              <p class="reward-text">Completed!</p>
            </div>
          `;
          fragment.appendChild(element);
        });
      }

      container.appendChild(fragment);
    }

    renderDynamicSlot(slot) {
      const slotDiv = document.createElement("div");
      slotDiv.className = `quest-slot ${slot.difficulty}`;
      slotDiv.setAttribute("data-slot-id", slot.id);
      slotDiv.setAttribute("data-quest-id", slot.currentQuest?.id || "");
      slotDiv.classList.toggle(
        "completed",
        Boolean(slot.currentQuest?.completed),
      );

      const quest = slot.currentQuest;
      const now = this.getGameTime();

      if (quest) {
        const progress = this.questProgressPercent(
          quest.progress,
          quest.target,
        );
        const rewardText =
          quest.reward.type === "donuts"
            ? `${this.formatNumber(quest.reward.amount)} donut`
            : `${quest.reward.amount.toFixed(2)}x multiplier (${quest.reward.duration / 1000}s)`;

        let timeInfo = "";
        if (quest.type === "timedProduce" && quest.timedStartTime) {
          const remaining = Math.max(
            0,
            (quest.timedStartTime + quest.timeLimit - now) / 1000,
          );
          timeInfo = `<span class="time-remaining">${Math.ceil(remaining)}s left</span>`;
        }

        slotDiv.innerHTML = `
          <div class="slot-header ${slot.difficulty}">${slot.difficulty.toUpperCase()}</div>
          <div class="quest-info">
            <h4>${quest.title}</h4>
            <p>${quest.description}</p>
            ${timeInfo}
            <div class="quest-progress">
              <div class="progress-bar" style="width: ${progress}%"></div>
              <span class="progress-text">${this.formatNumber(quest.progress)}/${this.formatNumber(quest.target)}</span>
            </div>
            <p class="reward-text">Reward: ${rewardText}</p>
          </div>
          <button class="claim-reward" ${quest.completed && !quest.claimed ? "" : "disabled"}>
            ${quest.claimed ? "Completed" : quest.completed ? "Claim Reward" : "In Progress"}
          </button>
        `;

        const claimButton = slotDiv.querySelector(".claim-reward");
        claimButton.addEventListener("click", () => {
          if (quest.completed && !quest.claimed) {
            this.claimDynamicReward(slot.id, quest.id);
          }
        });
      } else if (slot.cooldownEnd && slot.cooldownEnd > now) {
        const remaining = Math.ceil((slot.cooldownEnd - now) / 1000);
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        slotDiv.innerHTML = `
          <div class="slot-header ${slot.difficulty}">${slot.difficulty.toUpperCase()}</div>
          <div class="cooldown-info">
            <span class="cooldown-timer">${minutes}:${seconds.toString().padStart(2, "0")}</span>
            <p>New quest in...</p>
          </div>
        `;
      } else {
        slotDiv.innerHTML = `
          <div class="slot-header ${slot.difficulty}">${slot.difficulty.toUpperCase()}</div>
          <div class="loading-info">
            <p>Generating quest...</p>
          </div>
        `;
      }

      return slotDiv;
    }

    // Lightweight in-place quest slot updates to keep timers smooth without full rerender flicker
    updateQuestLiveElements(now = this.getGameTime()) {
      if (!this.canPresent()) return;
      if (!this.questsMenu || this.questsMenu.classList.contains("hidden")) {
        return;
      }

      const activeContainer = this.questsMenu.querySelector(
        ".quests-container.active",
      );
      if (
        activeContainer &&
        !activeContainer.classList.contains("hidden") &&
        this._questListSignature !== this.getQuestListSignature()
      ) {
        this.renderActiveQuests(activeContainer);
      }
      for (const slotId of Object.keys(this.dynamicSlots)) {
        const slot = this.dynamicSlots[slotId];
        let slotElement = this.questsMenu.querySelector(
          `.quest-slot[data-slot-id="${slotId}"]`,
        );
        if (!slotElement) continue;

        const quest = slot.currentQuest;
        const inCooldown = !quest && slot.cooldownEnd && slot.cooldownEnd > now;

        const hasQuestInfo = Boolean(slotElement.querySelector(".quest-info"));
        const hasCooldownInfo = Boolean(
          slotElement.querySelector(".cooldown-info"),
        );
        const hasLoadingInfo = Boolean(
          slotElement.querySelector(".loading-info"),
        );

        const structureMismatch =
          (quest && slotElement.dataset.questId !== quest.id) ||
          (quest && !hasQuestInfo) ||
          (inCooldown && !hasCooldownInfo) ||
          (!quest && !inCooldown && !hasLoadingInfo);

        // Re-render only when structure changes (quest->cooldown->loading), not every tick.
        if (structureMismatch) {
          const replacement = this.renderDynamicSlot(slot);
          slotElement.replaceWith(replacement);
          slotElement = replacement;
        }

        if (quest) {
          const progress = this.questProgressPercent(
            quest.progress,
            quest.target,
          );
          slotElement.classList.toggle("completed", Boolean(quest.completed));
          const progressBar = slotElement.querySelector(".progress-bar");
          const progressText = slotElement.querySelector(".progress-text");
          if (progressBar) progressBar.style.width = `${progress}%`;
          if (progressText) {
            progressText.textContent = `${this.formatNumber(quest.progress)}/${this.formatNumber(quest.target)}`;
          }

          const claimButton = slotElement.querySelector(".claim-reward");
          if (claimButton) {
            const enabled = quest.completed && !quest.claimed;
            claimButton.disabled = !enabled;
            claimButton.textContent = quest.claimed
              ? "Completed"
              : quest.completed
                ? "Claim Reward"
                : "In Progress";
          }

          if (quest.type === "timedProduce" && quest.timedStartTime) {
            const remaining = Math.max(
              0,
              Math.ceil((quest.timedStartTime + quest.timeLimit - now) / 1000),
            );
            const timeLabel = slotElement.querySelector(".time-remaining");
            if (timeLabel) timeLabel.textContent = `${remaining}s left`;
          }
        } else if (inCooldown) {
          const remaining = Math.ceil((slot.cooldownEnd - now) / 1000);
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          const timer = slotElement.querySelector(".cooldown-timer");
          if (timer) {
            timer.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
          }
        }
      }

      for (const entry of this.getActiveQuestEntries()) {
        if (entry.kind !== "milestone") continue;
        const element = this.questsMenu.querySelector(
          `.milestone[data-quest-id="${entry.id}"]`,
        );
        if (!element) continue;
        const quest = entry.quest;
        const bar = element.querySelector(".progress-bar");
        const text = element.querySelector(".progress-text");
        const reward = element.querySelector(".reward-text");
        if (bar)
          bar.style.width = `${this.questProgressPercent(quest.progress, quest.target)}%`;
        if (text)
          text.textContent = `${this.formatNumber(quest.progress)}/${this.formatNumber(quest.target)}`;
        if (reward)
          reward.textContent = `Reward: ${quest.completed ? "" : "~"}${this.formatNumber(
            this.calculateMilestoneRewardByType(
              entry.category,
              quest,
              entry.key,
              entry.tier,
            ),
          )} donuts`;
      }
      // Readiness changes need a KPI refresh even without a slot structure change.
      this.updateQuestKPIs();
    }

    createMilestoneElement(quest, category, key, tierKey = null) {
      const questDiv = document.createElement("div");
      questDiv.className = "quest-item milestone";
      questDiv.setAttribute("data-quest-id", quest.id);
      questDiv.classList.toggle("completed", Boolean(quest.completed));

      const progress = this.questProgressPercent(quest.progress, quest.target);
      const title = this.getMilestoneTitle({
        ...quest,
        category,
        buildingType: key,
        target: key,
        tier: tierKey,
      });

      const reward = this.calculateMilestoneRewardByType(
        category,
        quest,
        key,
        tierKey,
      );
      const rewardText = `${quest.completed ? "" : "~"}${this.formatNumber(reward)} donuts`;

      questDiv.innerHTML = `
        <div class="quest-info">
          <h4>${title}</h4>
          <div class="quest-progress">
            <div class="progress-bar" style="width: ${progress}%"></div>
            <span class="progress-text">${this.formatNumber(quest.progress)}/${this.formatNumber(quest.target)}</span>
          </div>
          <p class="reward-text">Reward: ${rewardText}</p>
        </div>
        <button class="claim-reward" ${quest.completed && !quest.claimed ? "" : "disabled"}>
          ${quest.claimed ? "Completed" : quest.completed ? "Claim Reward" : "In Progress"}
        </button>
      `;

      const claimButton = questDiv.querySelector(".claim-reward");
      claimButton.addEventListener("click", () => {
        if (quest.completed && !quest.claimed) {
          this.claimMilestoneReward(category, key, tierKey);
        }
      });

      return questDiv;
    }

    getMilestoneTitle(quest) {
      if (quest.category === "building") {
        const buildingName =
          this.items[quest.buildingType]?.name || quest.buildingType;
        return `Own ${quest.tier || quest.target} ${buildingName}(s)`;
      } else if (quest.category === "production") {
        return `Produce ${this.formatNumber(quest.target)} donuts`;
      } else if (quest.category === "clicks") {
        return `Click ${this.formatNumber(quest.target)} times`;
      } else if (quest.category === "cps") {
        return `Reach ${this.formatNumber(quest.target)} donuts/sec`;
      } else if (quest.category === "totalBuildings") {
        return `Own ${this.formatNumber(quest.target)} total buildings`;
      } else if (quest.category === "upgrades") {
        return `Purchase ${quest.target} upgrades`;
      } else if (quest.category === "questsCompleted") {
        return `Complete ${quest.target} quests`;
      }
      return "Unknown Quest";
    }

    switchQuestTab(tabName) {
      document.querySelectorAll(".quest-tab").forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === tabName);
      });

      document.querySelectorAll(".quests-container").forEach((container) => {
        container.classList.toggle(
          "hidden",
          !container.classList.contains(tabName),
        );
      });

      this._lastQuestUIRefresh = this.getGameTime();
      this.updateQuestDisplay();
    }

    claimQuestReward(quest) {
      this.settleBeforeMutation();
      // Compatibility entry point must use the live slot lifecycle, not a detached card.
      const slot = Object.values(this.dynamicSlots).find(
        (slot) => slot.currentQuest === quest,
      );
      if (slot) return this.claimDynamicReward(slot.id, quest.id);
      if (
        !quest ||
        !Object.values(this.quests).includes(quest) ||
        !quest.completed ||
        quest.claimed ||
        !this.deliverQuestReward(quest.reward)
      )
        return false;
      quest.claimed = true;
      quest.completionTime = this.getGameTime();
      this.requestSave();
      this.updateQuestDisplay();
      this.updateDisplay();
      return true;
    }

    // activateMultiplier - routes to new queue-based system
    activateMultiplier(amount, duration) {
      // Compatibility entry point; new rewards have only ONE durable owner.
      const applied = this.applyMultiplierReward(amount, duration);
      if (applied) this.requestSave();
      return applied;
    }

    updateProductionMultiplier() {
      // Compatibility adapter for older callers; no independent multiplier engine.
      this.updateQuestMultipliers();
      this.updateTotalPerSecond();
      this.updateDisplay();
    }
    checkQuestProgress() {
      this.settleBeforeMutation();
      if (this.timeState.inactive) return;
      // Throttle kontrolü - 250ms
      const now = this.getGameTime();
      if (now - (this._lastQuestCheck || 0) < 250) {
        return;
      }
      this._lastQuestCheck = now;

      // Update CPS history
      this.updateCPSHistory();

      // Update quest multipliers (tick-based)
      this.updateQuestMultipliers();

      // Update dynamic slots (generate new quests if needed)
      this.updateDynamicSlots();

      // Check dynamic quest progress
      this.checkDynamicQuestProgress();

      // Check milestone progress
      this.checkMilestoneProgress();

      // Quest menu UI refresh: throttled and paused while hovering to prevent flicker.
      if (this.questsMenu && !this.questsMenu.classList.contains("hidden")) {
        if (
          now - (this._lastQuestUILiveUpdate || 0) >=
          this.questUILiveUpdateInterval
        ) {
          this._lastQuestUILiveUpdate = now;
          this.updateQuestLiveElements(now);
        }

        const canRefresh = !this.isHoveringQuestMenu;
        if (
          canRefresh &&
          now - (this._lastQuestUIRefresh || 0) >= this.questUIRefreshInterval
        ) {
          this._lastQuestUIRefresh = now;
          this.updateQuestDisplay();
        }
      }
    }

    setupMobileMenus() {
      // Header menü butonları için event listener'lar
      document.querySelectorAll(".header-menu-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();

          // Eğer buton zaten aktifse, menüyü kapat
          if (btn.classList.contains("active")) {
            this.closeAllMobileMenus();
            return;
          }

          // Aktif buton sınıfını güncelle
          document
            .querySelectorAll(".header-menu-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");

          const target = btn.id;
          const statsMenu = document.querySelector("#stats-menu");
          const settingsMenu = document.querySelector("#settings-menu");
          const infoMenu = document.querySelector("#information-menu");
          const donutContainer = document.querySelector(".donut-container");

          // Önce tüm menüleri kapat
          [statsMenu, settingsMenu, infoMenu].forEach((menu) => {
            menu.classList.remove("mobile-active");
          });

          // Seçilen menüyü aç
          switch (target) {
            case "stats-btn":
              statsMenu.classList.add("mobile-active");
              this.updateStatsDisplay();
              break;
            case "settings-btn":
              settingsMenu.classList.add("mobile-active");
              break;
            case "info-btn":
              infoMenu.classList.add("mobile-active");
              break;
          }

          donutContainer.style.opacity = "0.3";
        });
      });

      // Kapatma butonları için event listener
      document.querySelectorAll(".close-menu-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.closeAllMobileMenus();
        });
      });

      // Donut'a tıklayınca menüleri kapat
      document
        .querySelector(".donut-container")
        .addEventListener("click", () => {
          this.closeAllMobileMenus();
        });

      // Ekrana dışına tıklayınca menüleri kapat
      document.addEventListener("click", (e) => {
        if (
          !e.target.closest(".header-menu") &&
          !e.target.closest("#stats-menu") &&
          !e.target.closest("#settings-menu") &&
          !e.target.closest("#information-menu")
        ) {
          this.closeAllMobileMenus();
        }
      });

      // ESC tuşuna basınca menüleri kapat
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeAllMobileMenus();
        }
      });
    }

    closeAllMobileMenus() {
      // Tüm menüleri kapat
      const menus = ["#stats-menu", "#settings-menu", "#information-menu"];
      menus.forEach((menuId) => {
        document.querySelector(menuId).classList.remove("mobile-active");
      });

      // Donut container'ı normal opaklığa getir
      document.querySelector(".donut-container").style.opacity = "1";

      // Tüm header menü butonlarından active sınıfını kaldır
      document.querySelectorAll(".header-menu-btn").forEach((btn) => {
        btn.classList.remove("active");
      });
    }

    setupAutoBuyer() {
      const container = document.querySelector(".auto-buyer-items");
      const toggle = document.getElementById("auto-buyer-toggle");

      // Ana toggle event listener
      toggle.checked = this.autoBuyer.enabled;
      toggle.addEventListener("change", (e) => {
        this.autoBuyer.enabled = e.target.checked;
        this.requestSave();
      });

      // Her item için kontrol elemanlarını oluştur
      for (let key in this.items) {
        const item = this.items[key];
        const itemDiv = document.createElement("div");
        itemDiv.className = "auto-buyer-item";

        itemDiv.innerHTML = `
        <div class="auto-buyer-item-header">
          <img src="img/${key}.webp" alt="${item.name}">
          <span>${item.name}</span>
        </div>
        <div class="auto-buyer-controls">
          <label class="switch">
            <input type="checkbox" data-item="${key}" ${
              this.autoBuyer.settings[key].enabled ? "checked" : ""
            }>
            <span class="slider round"></span>
          </label>
          <input type="number" 
            class="threshold-input" 
            value="${this.autoBuyer.settings[key].threshold}"
            min="1" 
            step="0.1"
            data-item="${key}">
          <span>x cost</span>
        </div>
      `;

        container.appendChild(itemDiv);
      }

      // Event listener'ları ekle
      container.addEventListener("change", (e) => {
        const itemKey = e.target.dataset.item;
        if (!itemKey) return;

        if (e.target.type === "checkbox") {
          this.autoBuyer.settings[itemKey].enabled = e.target.checked;
        } else if (e.target.type === "number") {
          const threshold = parseFloat(e.target.value);
          if (!Number.isFinite(threshold) || threshold < 1) {
            e.target.value = this.autoBuyer.settings[itemKey].threshold;
            return;
          }
          this.autoBuyer.settings[itemKey].threshold = threshold;
        }
        this.requestSave();
      });
    }

    checkAutoBuyer() {
      if (document.visibilityState === "hidden" || this.timeState.inactive)
        return;
      if (!this.autoBuyer.enabled) return;

      for (let key in this.items) {
        const settings = this.autoBuyer.settings[key];
        if (!settings.enabled) continue;

        const item = this.items[key];
        const bulkCost = this.calculateBulkPrice(item, this.purchaseAmount);

        if (this.donutCount >= bulkCost * settings.threshold) {
          this.buyItem(key, true);
        }
      }
    }

    // Utility fonksiyonları

    _throttle(func, limit) {
      let inThrottle;
      return (...args) => {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    }

    initializeComboSystem() {
      const combosElement = document.getElementById("combos");
      if (combosElement) {
        combosElement.addEventListener("click", () => {
          this.toggleComboMode();
        });
      }
    }

    toggleComboMode() {
      this.comboActive = !this.comboActive;

      if (this.comboActive) {
        this.startFallingDonuts();
        this.startAutoCatcher(); // Auto catcher'ı başlat
        document.getElementById("combos").classList.add("active-combo");
        this.showUpgrades();
      } else {
        this.stopFallingDonuts();
        this.stopAutoCatcher(); // Auto catcher'ı durdur
        document.getElementById("combos").classList.remove("active-combo");
      }
    }

    startFallingDonuts() {
      if (this.fallingDonutInterval) return;

      // Daha sık donut oluştur (500ms yerine)
      this.fallingDonutInterval = setInterval(() => {
        this.createComboDonut();
      }, 500);
    }

    stopFallingDonuts() {
      if (this.fallingDonutInterval) {
        clearInterval(this.fallingDonutInterval);
        this.fallingDonutInterval = null;
      }
      // Tüm mevcut falling donutları temizle
      document.querySelectorAll(".combo-donut").forEach((donut) => {
        donut.remove();
      });
    }

    createComboDonut() {
      if (document.visibilityState === "hidden" || this.timeState.inactive)
        return;
      const donut = document.createElement("div");
      donut.className = "combo-donut";

      const randomImage =
        this.comboDonutImages[
          Math.floor(Math.random() * this.comboDonutImages.length)
        ];
      const container = document.querySelector(".donut-container");
      const containerRect = container.getBoundingClientRect();

      // Rastgele başlangıç rotasyonu
      const randomRotation = Math.random() * 360;
      const randomX = Math.random() * (containerRect.width - 40);

      donut.style.cssText = `
        background-image: url(img/${randomImage});
        left: ${randomX}px;
        top: -50px; /* Ekranın üstünden başlasın */
        transform: rotate(${randomRotation}deg);
    `;

      container.appendChild(donut);

      // Auto Catcher kontrolü
      const autoCatcherUpgrade = this.upgrades.nonItemUpgrades.find(
        (upgrade) =>
          upgrade.specialEffect === "automation" && upgrade.purchased,
      );

      if (autoCatcherUpgrade) {
        const randomChance = Math.random();
        if (randomChance <= autoCatcherUpgrade.multiplier) {
          this.autoCatcherConfig.catchQueue.add(donut);
        }
      }

      donut.addEventListener("click", (e) => {
        if (!this.autoCatcherConfig.catchQueue.has(donut)) {
          this.handleComboDonutClick(e, donut);
        }
      });

      // Yakalanmayan donutları temizle
      setTimeout(() => {
        if (donut && donut.parentElement) {
          this.autoCatcherConfig.catchQueue.delete(donut);
          donut.remove();
          this.lastClickSuccess = false;
        }
      }, 3000);
    }

    startAutoCatcher() {
      if (this.autoCatcherConfig.processingInterval) return;

      this.autoCatcherConfig.processingInterval = setInterval(() => {
        this.processAutoCatchQueue();
      }, 50); // Her 50ms'de bir kuyruğu kontrol et
    }

    stopAutoCatcher() {
      if (this.autoCatcherConfig.processingInterval) {
        clearInterval(this.autoCatcherConfig.processingInterval);
        this.autoCatcherConfig.processingInterval = null;
      }
      this.autoCatcherConfig.catchQueue.clear();
    }

    processAutoCatchQueue() {
      if (document.visibilityState === "hidden" || this.timeState.inactive)
        return;
      if (this.autoCatcherConfig.catchQueue.size === 0) return;

      const now = performance.now();

      for (const donut of this.autoCatcherConfig.catchQueue) {
        // Donut hala DOM'da mı kontrol et
        if (!donut.parentElement) {
          this.autoCatcherConfig.catchQueue.delete(donut);
          continue;
        }

        const rect = donut.getBoundingClientRect();
        // Ekranın ortasına yakın donutları yakala
        if (
          rect.top > window.innerHeight * 0.3 &&
          rect.top < window.innerHeight * 0.7
        ) {
          this.autoCatcherConfig.catchQueue.delete(donut);
          requestAnimationFrame(() => {
            this.catchFallingDonut(donut);
          });
        }
      }
    }

    catchFallingDonut(donut) {
      if (document.visibilityState === "hidden" || this.timeState.inactive)
        return;
      this.settleBeforeMutation();
      if (!donut || !donut.parentElement) return;

      let clickValue = this.calculateClickValue();
      if (this.lastClickSuccess) {
        clickValue *= this.comboMultiplier;
      }

      const rect = donut.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Yakalama animasyonu
      donut.style.transition = "all 0.3s ease-out";
      donut.classList.add("caught");

      // Yakalama efekti
      const catchEffect = document.createElement("div");
      catchEffect.className = "catch-effect";
      catchEffect.style.cssText = `
        position: fixed;
        left: ${centerX - 20}px;
        top: ${centerY - 20}px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid #ffeb3b;
        animation: catchRipple 0.5s ease-out;
        pointer-events: none;
    `;
      document.body.appendChild(catchEffect);

      // Değer gösterimi
      this.showComboClickEffect(centerX, centerY, clickValue);

      // Skor güncelleme
      this.creditDonuts(clickValue);

      // Temizlik
      setTimeout(() => {
        donut.remove();
        catchEffect.remove();
      }, 300);

      this.lastClickSuccess = true;
      this.updateDisplay();
    }

    handleComboDonutClick(event, donutElement) {
      if (document.visibilityState === "hidden" || this.timeState.inactive)
        return;
      this.settleBeforeMutation();
      event.stopPropagation();

      // Normal click value hesapla
      let clickValue = this.calculateClickValue();

      // Eğer son tıklama başarılıysa combo bonusu uygula
      if (this.lastClickSuccess) {
        clickValue *= this.comboMultiplier;
      }

      this.creditDonuts(clickValue);

      // Görsel feedback
      this.showComboClickEffect(event.clientX, event.clientY, clickValue);

      // Combo durumunu güncelle
      this.lastClickSuccess = true;

      // Donutu kaldır
      donutElement.remove();

      // Combo timeout'u yenile
      if (this.comboTimeout) {
        clearTimeout(this.comboTimeout);
      }

      this.comboTimeout = setTimeout(() => {
        this.lastClickSuccess = false;
      }, 1000); // 1 saniye içinde tıklanmazsa combo resetlenir

      this.updateDisplay();
    }

    showComboClickEffect(x, y, value) {
      const effect = document.createElement("div");
      effect.className = "combo-click-effect";
      effect.textContent = `+${this.formatNumber(value)}`;
      effect.style.left = `${x}px`;
      effect.style.top = `${y}px`;

      document.body.appendChild(effect);

      setTimeout(() => {
        effect.remove();
      }, 1000);
    }

    setupDonutCoin() {
      const donutCoinElement = document.getElementById("donut-coin");
      const donutCoinCount = document.getElementById("donut-coin-count");

      // Info panel oluştur
      const infoPanel = document.createElement("div");
      infoPanel.className = "donut-coin-info";
      infoPanel.innerHTML = `
      <p>Remaining Time: <span class="time-remaining">24:00:00</span></p>
      <p>Total DonutCoin: <span class="total-coins">0</span></p>
      <p class="message">You can buy unique items with this coin!</p>
    `;
      donutCoinElement.appendChild(infoPanel);

      // Tıklama olayı
      donutCoinElement.addEventListener("click", () => {
        this.claimDonutCoin();
      });
    }

    updateDonutCoinDisplay() {
      if (!this.canPresent()) return;
      const donutCoinCount = document.getElementById("donut-coin-count");
      const timeRemaining = document.querySelector(".time-remaining");
      const totalCoins = document.querySelector(".total-coins");
      const donutCoinElement = document.getElementById("donut-coin");

      if (donutCoinCount && timeRemaining && totalCoins) {
        donutCoinCount.textContent = this.donutCoin.count;
        totalCoins.textContent = this.donutCoin.count;

        const now = Date.now();
        const timeLeft =
          this.donutCoin.lastClaimTime + this.donutCoin.claimInterval - now;

        if (timeLeft > 0) {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor(
            (timeLeft % (1000 * 60 * 60)) / (1000 * 60),
          );
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          timeRemaining.textContent = `${hours
            .toString()
            .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
          timeRemaining.style.color = "";
          donutCoinElement.classList.remove("ready");
        } else {
          timeRemaining.textContent = "Ready!";
          timeRemaining.style.color = "#00ff00";
          donutCoinElement.classList.add("ready");
        }
      }
    }

    claimDonutCoin() {
      const now = Date.now();
      const donutCoinElement = document.getElementById("donut-coin");
      if (now - this.donutCoin.lastClaimTime >= this.donutCoin.claimInterval) {
        this.donutCoin.count++;
        this.donutCoin.lastClaimTime = now;
        donutCoinElement.classList.remove("ready");
        this.updateDonutCoinDisplay();
        this.showNotification("DonutCoin kazandın!");
        this.saveGame();
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const game = new Game(); // Game sınıfından bir örnek oluştur
    game.init(); // Game sınıfındaki init fonksiyonunu çağırarak oyunu başlat
    donutDebug.attach(game);
    const resetButton = document.getElementById("reset-button");

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        game.resetGame();
      });
    }
  });

  document.querySelectorAll(".mobile-menu-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      // Aktif buton sınıfını güncelle
      document
        .querySelectorAll(".mobile-menu-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.querySelector("span").textContent.toLowerCase();
      const questsMenu = document.querySelector("#quests-menu");
      const marketSection = document.querySelector("#section-right");
      const donutContainer = document.querySelector(".donut-container");

      switch (target) {
        case "market":
          marketSection.classList.add("mobile-active");
          questsMenu.classList.remove("mobile-active");
          donutContainer.style.opacity = "0.3";
          break;
        case "quests":
          questsMenu.classList.add("mobile-active");
          marketSection.classList.remove("mobile-active");
          donutContainer.style.opacity = "0.3";
          break;
        case "donut":
          marketSection.classList.remove("mobile-active");
          questsMenu.classList.remove("mobile-active");
          donutContainer.style.opacity = "1";
          break;
      }
    });
  });

  document.querySelectorAll("img").forEach((img) => {
    if (!img.classList.contains("headerImg") && img.id !== "donut") {
      if (!img.hasAttribute("loading")) {
        img.loading = "lazy";
      }

      if (!img.hasAttribute("decoding")) {
        img.decoding = "async";
      }

      if (img.dataset.width && img.dataset.height) {
        img.width = img.dataset.width;
        img.height = img.dataset.height;
      }
    }
  });
})();
