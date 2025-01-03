class Game {
  constructor() {
    this.currentVersion = "1.3.0";
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
    this.upgrades = {
      cursor: [
        {
          name: "First Upgrade!",
          cost: 100,
          multiplier: 2,
          purchased: false,
          requirement: 1,
          img: "cursorUpgrade.webp",
          description:
            "A rudimentary extension that powers your donut factory into overdrive.",
        },
        {
          name: "Tidal Surge",
          cost: 500,
          multiplier: 2,
          purchased: false,
          requirement: 1,
          img: "cursorUpgrade-2.webp",
          description:
            "Unleash a wave of efficiency, drowning inefficiency in a sea of productivity.",
        },
        {
          name: "Blazing Touch",
          cost: 5000,
          multiplier: 2,
          purchased: false,
          requirement: 15,
          img: "cursorUpgrade-3.webp",
          description:
            "Ignite the donut cosmos with a touch that burns through production limits.",
        },
        {
          name: "Abyssal Grasp",
          cost: 50000,
          multiplier: 2,
          purchased: false,
          requirement: 30,
          img: "cursorUpgrade-4.webp",
          description:
            "Reach deep into the void, pulling forth untapped donut-making power.",
        },
        {
          name: "Donut Cursor",
          cost: 500000,
          multiplier: 2,
          purchased: false,
          requirement: 50,
          img: "cursorUpgrade-5.webp",
          description:
            "A gilded tool of infinite precision, sculpting perfect donuts with every click.",
        },
        {
          name: "Ruby Cursor",
          cost: 100000000,
          multiplier: 2,
          purchased: false,
          requirement: 100,
          img: "cursorUpgrade-6.webp",
          description: "Careful though: you might fall in love…with a cursor",
        },
      ],
      baker: [
        {
          name: "Crustaire",
          cost: 1000,
          multiplier: 2,
          purchased: false,
          requirement: 1,
          img: "bakerUpgrade-1.webp",
          description:
            "A master baker whose mere presence doubles the doughy yield of your donuts.",
        },
        {
          name: "Doughmire",
          cost: 5250,
          multiplier: 2,
          purchased: false,
          requirement: 15,
          img: "bakerUpgrade-2.webp",
          description:
            "Harness the power of ancient dough magic to knead perfection into every donut.",
        },
        {
          name: "Flourist",
          cost: 52500,
          multiplier: 2,
          purchased: false,
          requirement: 30,
          img: "bakerUpgrade-3.webp",
          description:
            "A flour conjurer whose delicate touch transforms ingredients into donut gold.",
        },
        {
          name: "Batteron",
          cost: 5250000,
          multiplier: 2,
          purchased: false,
          requirement: 50,
          img: "bakerUpgrade-4.webp",
          description:
            "An elemental baker, crafting cosmic donuts from primordial batter.",
        },
        {
          name: "Crèmeor",
          cost: 525000000,
          multiplier: 2,
          purchased: false,
          requirement: 100,
          img: "bakerUpgrade-5.webp",
          description:
            "A mythical baker whose crème-filled creations are the stuff of legends.",
        },
      ],
      farm: [
        {
          name: "Harvest Plains",
          cost: 10000,
          multiplier: 2,
          purchased: false,
          requirement: 1,
          img: "farmUpgrade-1.webp",
          description:
            "Lush fields bursting with crops, nurturing the perfect ingredients for your donuts.",
        },
        {
          name: "Golden Acre",
          cost: 50000,
          multiplier: 2,
          purchased: false,
          requirement: 15,
          img: "farmUpgrade-2.webp",
          description:
            "A golden field where each stalk of grain yields a bounty of donut flour.",
        },
        {
          name: "Elder Grove",
          cost: 500000,
          multiplier: 2,
          purchased: false,
          requirement: 30,
          img: "farmUpgrade-3.webp",
          description:
            "An ancient grove, where the oldest trees bear the finest donut fruits.",
        },
        {
          name: "Ironroot Fields",
          cost: 50000000,
          multiplier: 2,
          purchased: false,
          requirement: 50,
          img: "farmUpgrade-4.webp",
          description:
            "Fields with roots of iron, pulling forth the strongest crops for donut production.",
        },
        {
          name: "Magicland",
          cost: 5000000000,
          multiplier: 2,
          purchased: false,
          requirement: 100,
          img: "farmUpgrade-5.webp",
          description:
            "A mystical realm where the land itself grows donut-making magic.",
        },
      ],
      mine: [
        {
          name: "Ironclad Plains",
          cost: 160000,
          multiplier: 2,
          purchased: false,
          requirement: 1,
          img: "mineUpgrade-1.webp",
          description:
            "Sturdy plains rich in minerals, fueling your donut factory with raw power.",
        },
        {
          name: "Golden Veil",
          cost: 800000,
          multiplier: 2,
          purchased: false,
          requirement: 15,
          img: "mineUpgrade-2.webp",
          description:
            "A mine where every vein glistens with pure golden resources for your donuts.",
        },
        {
          name: "Diamondspire",
          cost: 8000000,
          multiplier: 2,
          purchased: false,
          requirement: 30,
          img: "mineUpgrade-3.webp",
          description:
            "Towering spires of diamonds, feeding your production with unrivaled hardness and beauty.",
        },
        {
          name: "Emerald Hollow",
          cost: 800000000,
          multiplier: 2,
          purchased: false,
          requirement: 50,
          img: "mineUpgrade-4.webp",
          description:
            "A deep cavern of shimmering emeralds, infusing your donuts with rare energy.",
        },
        {
          name: "Ruby Ascendant",
          cost: 80000000000,
          multiplier: 2,
          purchased: false,
          requirement: 100,
          img: "mineUpgrade-5.webp",
          description:
            "A mine that ascends to the heavens, where rubies pulse with the heart of donut production.",
        },
      ],
      factory: [
        {
          name: "Ironclad Nexus",
          cost: 1800000,
          multiplier: 2,
          purchased: false,
          requirement: 1,
          img: "factoryUpgrade-1.webp",
          description:
            "A mighty nexus of steel and steam, churning out donuts at blinding speeds.",
        },
        {
          name: "Aureum Heart",
          cost: 9000000,
          multiplier: 2,
          purchased: false,
          requirement: 15,
          img: "factoryUpgrade-2.webp",
          description:
            "At the core of your factory, the golden heart beats with unstoppable donut-making power.",
        },
        {
          name: "Diamondflare Core",
          cost: 90000000,
          multiplier: 2,
          purchased: false,
          requirement: 30,
          img: "factoryUpgrade-3.webp",
          description:
            "A blazing core of diamond-powered energy, driving your factory to new heights.",
        },
        {
          name: "Emerald Vein",
          cost: 9000000000,
          multiplier: 2,
          purchased: false,
          requirement: 50,
          img: "factoryUpgrade-4.webp",
          description:
            "Hidden deep in your factory lies an emerald vein, enhancing production with every pulse.",
        },
        {
          name: "Rubyflare Engine",
          cost: 900000000000,
          multiplier: 2,
          purchased: false,
          requirement: 100,
          img: "factoryUpgrade-5.webp",
          description:
            "An engine of pure rubyfire, propelling your donut output beyond the stars.",
        },
      ],
      logisticCenter: [
        {
          name: "Warehouse Whisperer",
          cost: 19000000,
          multiplier: 2,
          purchased: false,
          requirement: 1,
          img: "logisticCenterUpgrade-1.webp",
          description:
            "With a subtle glow, this upgrade whispers directions to your donuts, ensuring none get lost on their way out.",
        },
        {
          name: "Goldie Locks",
          cost: 95000000,
          multiplier: 2,
          purchased: false,
          requirement: 15,
          img: "logisticCenterUpgrade-2.webp",
          description:
            "Now with a golden touch, your logistics flow is so smooth that even the donuts look surprised as they roll out!",
        },
        {
          name: "Diamond Dispatch",
          cost: 950000000,
          multiplier: 2,
          purchased: false,
          requirement: 30,
          img: "logisticCenterUpgrade-3.webp",
          description:
            "Powered by a sparkly diamond core, this dispatch unit runs so efficiently it thinks it's the CEO of donut deliveries.",
        },
        {
          name: "Emerald Express",
          cost: 9500000000,
          multiplier: 2,
          purchased: false,
          requirement: 50,
          img: "logisticCenterUpgrade-4.webp",
          description:
            "This upgrade finds shortcuts, backroads, and donut-sized tunnels—who knew green could be so quick?",
        },
        {
          name: "Ruby Roadrunner",
          cost: 9500000000000,
          multiplier: 2,
          purchased: false,
          requirement: 100,
          img: "logisticCenterUpgrade-5.webp",
          description:
            "Fueled by the fastest ruby energy, this upgrade makes your donuts so quick that they deliver themselves.",
        },
      ],
      nonItemUpgrades: [
        {
          name: "Chocolate Dream",
          cost: 5000,
          multiplier: 1.01, // %1 increase in clickValue
          purchased: false,
          requirement: 500,
          img: "clickUpgrade1.webp",
          description:
            "Clicking efficiency increases with each second, gaining 1% of the per-second production.",
        },
        {
          name: "Dough Delight",
          cost: 500000,
          multiplier: 1.01, // %1 increase in clickValue
          purchased: false,
          requirement: 1000,
          img: "clickUpgrade2.webp",
          description:
            "Clicking efficiency increases with each second, gaining 1% of the per-second production.",
        },
        {
          name: "Rainbow Sprinkle Surprise",
          cost: 5000000,
          multiplier: 1.01, // %1 increase in clickValue
          purchased: false,
          requirement: 2000,
          img: "clickUpgrade3.webp",
          description:
            "Clicking efficiency increases with each second, gaining 1% of the per-second production.",
        },
        {
          name: "Strawberry Bliss",
          cost: 50000000,
          multiplier: 1.01, // %1 increase in clickValue
          purchased: false,
          requirement: 4000,
          img: "clickUpgrade4.webp",
          description:
            "Clicking efficiency increases with each second, gaining 1% of the per-second production.",
        },
        {
          name: "Creamy Classic",
          cost: 50000000,
          multiplier: 1.01, // %1 increase in clickValue
          purchased: false,
          requirement: 8000,
          img: "clickUpgrade5.webp",
          description:
            "Clicking efficiency increases with each second, gaining 1% of the per-second production.",
        },
        {
          name: "Choco-Chip White Magic",
          cost: 500000000,
          multiplier: 1.01, // %1 increase in clickValue
          purchased: false,
          requirement: 16000,
          img: "clickUpgrade6.webp",
          description:
            "Clicking efficiency increases with each second, gaining 1% of the per-second production.",
        },
      ],
    };
    this.items = {
      cursor: {
        name: "Cursor",
        count: 0,
        baseCost: 15,
        originalBaseCost: 15,
        costMultiplier: 1.155,
        production: 0.1,
        originalProduction: 0.1,
        totalProduced: 0,
      },
      baker: {
        name: "Baker",
        count: 0,
        baseCost: 115,
        originalBaseCost: 115,
        costMultiplier: 1.15,
        production: 1,
        originalProduction: 1,
        totalProduced: 0,
      },
      farm: {
        name: "Farm",
        count: 0,
        baseCost: 1400,
        originalBaseCost: 1400,
        costMultiplier: 1.1447,
        production: 7,
        originalProduction: 7,
        totalProduced: 0,
      },
      mine: {
        name: "Mine",
        count: 0,
        baseCost: 16000,
        originalBaseCost: 16000,
        costMultiplier: 1.15,
        production: 50,
        originalProduction: 50,
        totalProduced: 0,
      },
      factory: {
        name: "Factory",
        count: 0,
        baseCost: 176000,
        originalBaseCost: 176000,
        costMultiplier: 1.1557,
        production: 255,
        originalProduction: 255,
        totalProduced: 0,
      },
      logisticCenter: {
        name: "Logistic Center",
        count: 0,
        baseCost: 1927200,
        originalBaseCost: 1927200,
        costMultiplier: 1.16,
        production: 1225,
        originalProduction: 1225,
        totalProduced: 0,
      },
      powerPlant: {
        name: "Power Plant",
        count: 0,
        baseCost: 21090250,
        originalBaseCost: 21090250,
        costMultiplier: 1.2167,
        production: 6000,
        originalProduction: 6000,
        totalProduced: 0,
      },
      nature: {
        name: "Nature",
        count: 0,
        baseCost: 230800850,
        originalBaseCost: 230800850,
        costMultiplier: 1.4777,
        production: 28000,
        originalProduction: 28000,
        totalProduced: 0,
      },
      neuralNetworkBakery: {
        name: "Neural Network Bakery",
        count: 0,
        baseCost: 2525256900,
        originalBaseCost: 2525256900,
        costMultiplier: 1.5177,
        production: 135500,
        originalProduction: 135500,
        totalProduced: 0,
      },
      portal: {
        name: "Portal",
        count: 0,
        baseCost: 27650200500,
        originalBaseCost: 27650200500,
        costMultiplier: 1.5377,
        production: 650250,
        originalProduction: 650250,
        totalProduced: 0,
      },
    };
    this.donutCount = 0;
    this.hasDonutClicked = false;
    this.accumulator = 0;
    this.totalDonutsEarned = 0;
    this.totalClicks = 0;
    this.purchaseAmount = 1;
    this.lastUpdateTime = Date.now();
    this.snowContainer = null;
    this.isSnowing = true;
    this.initSnowEffect();
    this.initControls();
    this.productionMultiplier = 1;
    this.christmasBoxes = [
      {
        type: "small",
        image: "small-box.webp",
        rewardMultiplier: 1,
        duration: 5000, // 5 saniye görünür
      },
      {
        type: "medium",
        image: "medium-box.webp",
        rewardMultiplier: 3,
        duration: 7000, // 7 saniye görünür
      },
      {
        type: "large",
        image: "large-box.webp",
        rewardMultiplier: 5,
        duration: 10000, // 10 saniye görünür
      },
    ];
    this.activeBox = null;
    this.boxSpawnInterval = null;
    this.ingredientTypes = [
      { type: "Dough", rarity: 0.5, price: this.items.baker.baseCost * 0.015 },
      { type: "Sugar", rarity: 0.35, price: this.items.baker.baseCost * 0.03 },
      {
        type: "Chocolate",
        rarity: 0.15,
        price: this.items.baker.baseCost * 0.06,
      },
    ];
    this.bakers = [];
    this.ingredients = {};
    this.bakerProductionInterval = 180000;
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
      },
      "Chocolate Donut": {
        ingredients: {
          Dough: 2,
          Sugar: 1,
          Chocolate: 2,
        },
        production: 2,
        baseProduction: 2,
        image: "chocolate-donut.webp",
      },
    };
    this.selectedRecipe = null;
    this.ores = {
      Copper: { count: 0 },
      Iron: { count: 0 },
      Gold: { count: 0 },
      Diamond: { count: 0 },
    };
    this.oreTypes = [
      { type: "Copper", rarity: 0.7, price: this.items.mine.baseCost * 0.01 },
      { type: "Iron", rarity: 0.2, price: this.items.mine.baseCost * 0.025 },
      { type: "Gold", rarity: 0.075, price: this.items.mine.baseCost * 0.05 },
      { type: "Diamond", rarity: 0.015, price: this.items.mine.baseCost * 0.1 },
    ];

    this.workerProductionInterval = 60000; // 60 saniyelik genel üretim döngüsü
    this.workerCycleRemainingTime = this.workerProductionInterval; // Döngü süresi takibi için
    this.orePurchaseLimit = 10;
    this.workers = []; // İşçi listesi
    this.isBuying = false; // Şu an alım mı yapılıyor
    this.isSelling = false; // Şu an satım mı yapılıyor
    this.setupMarketButtons();
    this.updateInterval = 550;
    this.donut = document.getElementById("donut");
    this.counter = document.getElementById("donut-count");
    this.perSecondDisplay = document.getElementById("per-second");
    this.setupModal();
    this.setupStoreHover();
    this.setupVisibilityChange();
    this.totalPerSecond = 0;
    this.updateTotalPerSecond(); // Başlangıçta hesapla
    this.currentBakeryName = "";
    this.BUILDING_COST_MULTIPLIER = 1.15;
    this.PRESTIGE_BUILDING_COST_MULTIPLIER_INCREMENT = 1.35;
    this.UPGRADE_COST_MULTIPLIER = 1.1;
    this.prestigeCount = 0;
    this.nextPrestigeThreshold = 30000000;
    this.prestigeMultiplier = 2;
    this.setupPrestigeModal();

    setInterval(() => this.updatePrestigeBar(), this.updateInterval);

    this.updateDisplay();
    this.clickSounds.forEach((sound) => {
      sound.volume = 0.1;
    });

    // Quest sistemi için yeni özellikler
    this.quests = {
      beginnerClicker: {
        id: "beginnerClicker",
        title: "Beginner Clicker",
        description: "Click 50 times",
        target: 50,
        progress: 0,
        completed: false,
        claimed: false,
        type: "clicks",
        reward: {
          type: "donuts",
          amount: 250,
        },
      },
      firstProduction: {
        id: "firstProduction",
        title: "First Steps",
        description: "Produce 500 donuts",
        target: 500,
        progress: 0,
        completed: false,
        claimed: false,
        type: "production",
        reward: {
          type: "multiplier",
          amount: 1.25,
          duration: 20000,
        },
      },

      cursorNovice: {
        id: "cursorNovice",
        title: "Cursor Novice",
        description: "Own 5 Cursors",
        target: 5,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "cursor",
        reward: {
          type: "donuts",
          amount: 35, // calculateBuildingReward(15, 1.155, 5)
        },
      },
      cursorAdept: {
        id: "cursorAdept",
        title: "Cursor Adept",
        description: "Own 25 Cursors",
        target: 25,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "cursor",
        reward: {
          type: "multiplier",
          amount: 1.3,
          duration: 30000,
        },
      },

      bakerApprentice: {
        id: "bakerApprentice",
        title: "Baker Apprentice",
        description: "Own 3 Bakers",
        target: 3,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "baker",
        reward: {
          type: "donuts",
          amount: 75,
        },
      },
      bakerJourneyman: {
        id: "bakerJourneyman",
        title: "Baker Journeyman",
        description: "Own 10 Bakers",
        target: 10,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "baker",
        reward: {
          type: "multiplier",
          amount: 1.3,
          duration: 30000,
        },
      },

      farmStarter: {
        id: "farmStarter",
        title: "Farm Starter",
        description: "Own 2 Farms",
        target: 2,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "farm",
        reward: {
          type: "donuts",
          amount: 500,
        },
      },
      farmManager: {
        id: "farmManager",
        title: "Farm Manager",
        description: "Own 8 Farms",
        target: 8,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "farm",
        reward: {
          type: "multiplier",
          amount: 1.5,
          duration: 35000,
        },
      },

      factoryWorker: {
        id: "factoryWorker",
        title: "Factory Worker",
        description: "Own 1 Factory",
        target: 1,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "factory",
        reward: {
          type: "donuts",
          amount: 35000,
        },
      },
      factorySupervisor: {
        id: "factorySupervisor",
        title: "Factory Supervisor",
        description: "Own 5 Factories",
        target: 5,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "factory",
        reward: {
          type: "multiplier",
          amount: 1.3,
          duration: 25000,
        },
      },

      logisticsIntern: {
        id: "logisticsIntern",
        title: "Logistics Intern",
        description: "Own 1 Logistics Center",
        target: 1,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "logisticCenter",
        reward: {
          type: "donuts",
          amount: 100000,
        },
      },
      logisticsManager: {
        id: "logisticsManager",
        title: "Logistics Manager",
        description: "Own 3 Logistics Centers",
        target: 3,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "logisticCenter",
        reward: {
          type: "multiplier",
          amount: 2.5,
          duration: 60000,
        },
      },

      mineExplorer: {
        id: "mineExplorer",
        title: "Mine Explorer",
        description: "Own 1 Mine",
        target: 1,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "mine",
        reward: {
          type: "donuts",
          amount: 1000,
        },
      },
      mineOperator: {
        id: "mineOperator",
        title: "Mine Operator",
        description: "Own 3 Mines",
        target: 3,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "mine",
        reward: {
          type: "multiplier",
          amount: 1.8,
          duration: 30000,
        },
      },

      smallBusiness: {
        id: "smallBusiness",
        title: "Small Business",
        description: "Produce 10,000 donuts",
        target: 10000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "production",
        reward: {
          type: "donuts",
          amount: 3500,
        },
      },
      growingBusiness: {
        id: "growingBusiness",
        title: "Growing Business",
        description: "Produce 100,000 donuts",
        target: 100000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "production",
        reward: {
          type: "multiplier",
          amount: 2.0,
          duration: 30000,
        },
      },
      clickEnthusiast: {
        id: "clickEnthusiast",
        title: "Click Enthusiast",
        description: "Click 500 times",
        target: 500,
        progress: 0,
        completed: false,
        claimed: false,
        type: "clicks",
        reward: {
          type: "donuts",
          amount: 10000,
        },
      },
      clickMaster: {
        id: "clickMaster",
        title: "Click Master",
        description: "Click 2,000 times",
        target: 2000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "clicks",
        reward: {
          type: "multiplier",
          amount: 2,
          duration: 60000,
        },
      },
      cursorMaster: {
        id: "cursorMaster",
        title: "Cursor Master",
        description: "Own 50 Cursors",
        target: 50,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "cursor",
        reward: {
          type: "multiplier",
          amount: 2,
          duration: 60000,
        },
      },
      cursorLegend: {
        id: "cursorLegend",
        title: "Cursor Legend",
        description: "Own 100 Cursors",
        target: 100,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "cursor",
        reward: {
          type: "donuts",
          amount: 10000000,
        },
      },
      cursorGod: {
        id: "cursorGod",
        title: "Cursor God",
        description: "Own 200 Cursors",
        target: 200,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "cursor",
        reward: {
          type: "multiplier",
          amount: 1.5,
          duration: 120000,
        },
      },
      bakerMaster: {
        id: "bakerMaster",
        title: "Baker Master",
        description: "Own 25 Bakers",
        target: 25,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "baker",
        reward: {
          type: "donuts",
          amount: 3000,
        },
      },
      bakerLegend: {
        id: "bakerLegend",
        title: "Baker Legend",
        description: "Own 50 Bakers",
        target: 50,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "baker",
        reward: {
          type: "multiplier",
          amount: 4,
          duration: 10000,
        },
      },
      bakerGod: {
        id: "bakerGod",
        title: "Baker God",
        description: "Own 100 Bakers",
        target: 100,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "baker",
        reward: {
          type: "donuts",
          amount: 45000000,
        },
      },
      farmMaster: {
        id: "farmMaster",
        title: "Farm Master",
        description: "Own 20 Farms",
        target: 20,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "farm",
        reward: {
          type: "multiplier",
          amount: 2.0,
          duration: 30000,
        },
      },
      farmLegend: {
        id: "farmLegend",
        title: "Farm Legend",
        description: "Own 35 Farms",
        target: 35,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "farm",
        reward: {
          type: "donuts",
          amount: 50000,
        },
      },
      farmGod: {
        id: "farmGod",
        title: "Farm God",
        description: "Own 50 Farms",
        target: 50,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "farm",
        reward: {
          type: "multiplier",
          amount: 2,
          duration: 200000,
        },
      },
      factoryMaster: {
        id: "factoryMaster",
        title: "Factory Master",
        description: "Own 15 Factories",
        target: 15,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "factory",
        reward: {
          type: "donuts",
          amount: 2500000,
        },
      },
      factoryLegend: {
        id: "factoryLegend",
        title: "Factory Legend",
        description: "Own 25 Factories",
        target: 25,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "factory",
        reward: {
          type: "multiplier",
          amount: 1.5,
          duration: 250000,
        },
      },
      factoryGod: {
        id: "factoryGod",
        title: "Factory God",
        description: "Own 40 Factories",
        target: 40,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "factory",
        reward: {
          type: "donuts",
          amount: 20000000,
        },
      },
      logisticsMaster: {
        id: "logisticsMaster",
        title: "Logistics Master",
        description: "Own 10 Logistics Centers",
        target: 10,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "logisticCenter",
        reward: {
          type: "multiplier",
          amount: 1.75,
          duration: 300000,
        },
      },
      logisticsLegend: {
        id: "logisticsLegend",
        title: "Logistics Legend",
        description: "Own 15 Logistics Centers",
        target: 15,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "logisticCenter",
        reward: {
          type: "donuts",
          amount: 50000000,
        },
      },
      logisticsGod: {
        id: "logisticsGod",
        title: "Logistics God",
        description: "Own 25 Logistics Centers",
        target: 25,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "logisticCenter",
        reward: {
          type: "multiplier",
          amount: 2.0,
          duration: 350000,
        },
      },
      mineMaster: {
        id: "mineMaster",
        title: "Mine Master",
        description: "Own 10 Mines",
        target: 10,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "mine",
        reward: {
          type: "donuts",
          amount: 50000,
        },
      },
      mineLegend: {
        id: "mineLegend",
        title: "Mine Legend",
        description: "Own 15 Mines",
        target: 15,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "mine",
        reward: {
          type: "multiplier",
          amount: 1.6,
          duration: 400000,
        },
      },
      mineGod: {
        id: "mineGod",
        title: "Mine God",
        description: "Own 20 Mines",
        target: 20,
        progress: 0,
        completed: false,
        claimed: false,
        type: "building",
        buildingType: "mine",
        reward: {
          type: "donuts",
          amount: 200000,
        },
      },
      donutEntrepreneur: {
        id: "donutEntrepreneur",
        title: "Donut Entrepreneur",
        description: "Produce 1,000,000 donuts",
        target: 1000000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "production",
        reward: {
          type: "multiplier",
          amount: 1.75,
          duration: 120000,
        },
      },
      donutCorporation: {
        id: "donutCorporation",
        title: "Donut Corporation",
        description: "Produce 10,000,000 donuts",
        target: 10000000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "production",
        reward: {
          type: "donuts",
          amount: 500000,
        },
      },
      donutEmpire: {
        id: "donutEmpire",
        title: "Donut Empire",
        description: "Produce 100,000,000 donuts",
        target: 100000000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "production",
        reward: {
          type: "multiplier",
          amount: 3.0,
          duration: 60000,
        },
      },
      donutGalaxy: {
        id: "donutGalaxy",
        title: "Donut Galaxy",
        description: "Produce 1,000,000,000 donuts",
        target: 1000000000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "production",
        reward: {
          type: "donuts",
          amount: 100000000,
        },
      },

      clickProfessional: {
        id: "clickProfessional",
        title: "Click Professional",
        description: "Click 5,000 times",
        target: 5000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "clicks",
        reward: {
          type: "multiplier",
          amount: 3.0,
          duration: 60000,
        },
      },
      clickExpert: {
        id: "clickExpert",
        title: "Click Expert",
        description: "Click 10,000 times",
        target: 10000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "clicks",
        reward: {
          type: "donuts",
          amount: 200000000,
        },
      },
      clickLegend: {
        id: "clickLegend",
        title: "Click Legend",
        description: "Click 25,000 times",
        target: 25000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "clicks",
        reward: {
          type: "multiplier",
          amount: 3.0,
          duration: 60000,
        },
      },
      clickGod: {
        id: "clickGod",
        title: "Click God",
        description: "Click 50,000 times",
        target: 50000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "clicks",
        reward: {
          type: "donuts",
          amount: 5000000000,
        },
      },
      smallEmpire: {
        id: "smallEmpire",
        title: "Small Empire",
        description: "Own 10 of each building",
        target: 10,
        progress: 0,
        completed: false,
        claimed: false,
        type: "combined",
        reward: {
          type: "multiplier",
          amount: 3.0,
          duration: 180000,
        },
      },
      mediumEmpire: {
        id: "mediumEmpire",
        title: "Medium Empire",
        description: "Own 25 of each building",
        target: 25,
        progress: 0,
        completed: false,
        claimed: false,
        type: "combined",
        reward: {
          type: "donuts",
          amount: 10000000000,
        },
      },

      donutUniverse: {
        id: "donutUniverse",
        title: "Donut Universe",
        description: "Produce 1 trillion donuts",
        target: 1000000000000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "production",
        reward: {
          type: "multiplier",
          amount: 50.0,
          duration: 60000,
        },
      },
      clickingDiety: {
        id: "clickingDiety",
        title: "Clicking Deity",
        description: "Click 1 million times",
        target: 1000000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "clicks",
        reward: {
          type: "donuts",
          amount: 500000000000,
        },
      },
      legendaryClicker: {
        id: "legendaryClicker",
        title: "Legendary Clicker",
        description: "Click 5 million times",
        target: 5000000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "clicks",
        reward: {
          type: "multiplier",
          amount: 3.0, // Maximum multiplier
          duration: 300000, // Maximum süre
        },
      },
      legendaryProducer: {
        id: "legendaryProducer",
        title: "Legendary Producer",
        description: "Produce 1 quadrillion donuts",
        target: 1000000000000000,
        progress: 0,
        completed: false,
        claimed: false,
        type: "production",
        reward: {
          type: "donuts",
          amount: 100000000000,
        },
      },
    };
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
  }
  init() {
    this.loadGame();
    this.updateBakeryName();
    this.initSnowEffect();
    this.startChristmasBoxes();
    // Zamanlayıcılar
    setInterval(this.saveGame.bind(this), 180000); // 3 dakika
    setInterval(this.updateTitleWithDonuts.bind(this), 1000); // Başlığı her 1 saniyede bir güncelle
    setInterval(() => this.updateStatsDisplay(), 5000);
    setInterval(this.updateProduction.bind(this), 125);
    this.startProductionCycle();

    // Donut'a tıklama olayını bağla
    this.handleDonutClickBound = this.handleDonutClick.bind(this);
    this.donut.addEventListener("click", this.handleDonutClickBound);

    // Store item hover olayını bağla
    document.querySelectorAll(".store-item").forEach((storeItem) => {
      const itemKey = storeItem.getAttribute("data-item");
      const itemImg = storeItem.querySelector(".item-img img");

      storeItem.addEventListener("mouseenter", (event) => {
        this.showItemInfo(itemKey);
      });

      // Tıklama olayı ile item satın almayı bağla
      storeItem.addEventListener("click", (event) => {
        // Eğer tıklanan şey resim ve active-mine-effect veya active-baker-effect class'ına sahipse satın alma işlemi yapma
        if (
          event.target.closest(".item-img img.active-mine-effect") ||
          event.target.closest(".item-img img.active-baker-effect")
        ) {
          return;
        }
        this.buyItem(itemKey);
      });
    });
    document.querySelectorAll(".purchase-options button").forEach((button) => {
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
        this.openChangeNameModal.bind(this)
      );
    }
    document
      .getElementById("confirmButton")
      .addEventListener("click", this.changeBakeryName.bind(this));
    document
      .getElementById("cancelButton")
      .addEventListener("click", this.closeChangeNameModal.bind(this));

    // Other setups
    this.setupInfoMenu();
    this.setupStatsMenu();
    this.setupSettingsMenu();
  }
  updateDisplay() {
    if (!this.counter || !this.perSecondDisplay) {
      return; // Elementler yoksa güncelleme yapma
    }

    // Donut sayısını formatla
    this.counter.textContent = `${this.formatNumber(
      this.donutCount,
      "count"
    )} donuts`;

    // Saniyedeki üretimi formatla
    const formattedPerSecond = this.formatNumber(
      this.totalPerSecond,
      "perSecond"
    );

    if (this.productionMultiplier > 1 && this.activeMultipliers?.length > 0) {
      // Süresi geçmiş multiplier'ları temizle
      this.activeMultipliers = this.activeMultipliers.filter(
        (m) => m.endTime > Date.now()
      );

      if (this.activeMultipliers.length === 0) {
        this.productionMultiplier = 1;
        this.perSecondDisplay.textContent = `per second: ${formattedPerSecond}`;
        this.perSecondDisplay.classList.remove("boosted");
        return;
      }

      const nearestEndTime = Math.min(
        ...this.activeMultipliers.map((m) => m.endTime)
      );
      const remainingTime = Math.max(
        0,
        Math.ceil((nearestEndTime - Date.now()) / 1000)
      );

      // Progress hesaplama
      const currentMultiplier = this.activeMultipliers[0];
      const progress =
        (remainingTime / (currentMultiplier.duration / 1000)) * 100;

      this.perSecondDisplay.innerHTML = `
          <div class="boosted-per-second">
              <div class="per-second-text">per second: ${formattedPerSecond}</div>
              <div class="boost-container">
                  <div class="boost-info">
                      <span class="boost-multiplier">${this.productionMultiplier.toFixed(
                        2
                      )}x</span>
                      <span class="boost-timer">${remainingTime}s</span>
                  </div>
                  <div class="boost-progress-bar">
                      <div class="boost-progress" style="width: ${progress}%"></div>
                  </div>
              </div>
          </div>
      `;
      this.perSecondDisplay.classList.add("boosted");
    } else {
      this.perSecondDisplay.textContent = `per second: ${formattedPerSecond}`;
      this.perSecondDisplay.classList.remove("boosted");
    }

    for (let key in this.items) {
      const costElem = document.getElementById(`${key}Cost`);
      const storeItem = document.querySelector(
        `.store-item[data-item="${key}"]`
      );

      if (costElem) {
        const bulkCost = this.calculateBulkPrice(
          this.items[key],
          this.purchaseAmount
        );
        costElem.textContent = this.formatNumber(bulkCost, "cost");

        // Fiyat rengini ayarla
        if (this.donutCount >= bulkCost) {
          costElem.style.color = "#6f6"; // Yeşil
          if (storeItem) {
            storeItem.classList.remove("insufficient-funds");
          }
        } else {
          costElem.style.color = "red"; // Kırmızı
          if (storeItem) {
            storeItem.classList.add("insufficient-funds");
          }
        }

        // Alım miktarı göstergesi
        const amountDisplay = storeItem.querySelector(".purchase-amount");
        if (this.purchaseAmount > 1) {
          if (!amountDisplay) {
            const span = document.createElement("span");
            span.className = "purchase-amount";
            span.textContent = `x${this.purchaseAmount}`;
            storeItem.querySelector(".item-img").appendChild(span);
          } else {
            amountDisplay.textContent = `x${this.purchaseAmount}`;
          }
        } else if (amountDisplay) {
          amountDisplay.remove();
        }
      }

      // Toplam sayıyı formatla
      const totalElem = document.getElementById(
        `total${this.capitalize(key)}s`
      );
      if (totalElem) {
        totalElem.textContent = this.formatNumber(
          this.items[key].count,
          "count"
        );
      } else {
        console.error(`Missing total${this.capitalize(key)}s element`);
      }
    }
    const mineImage = document.querySelector(
      '.store-item[data-item="mine"] .item-img img'
    );
    if (this.items.mine.count >= 1) {
      mineImage.classList.add("active-mine-effect");
    } else {
      mineImage.classList.remove("active-mine-effect");
    }

    // Baker image kontrolü
    const bakerImage = document.querySelector(
      '.store-item[data-item="baker"] .item-img img'
    );
    if (this.items.baker.count >= 1) {
      bakerImage.classList.add("active-baker-effect");
    } else {
      bakerImage.classList.remove("active-baker-effect");
    }

    // Upgrade'lerin durumunu dinamik olarak güncelle
    this.showUpgrades();

    // Aktif multiplier göstergesini güncelle
    this.updateActiveMultiplierDisplay();
  }
  updateTotalPerSecond() {
    let basePerSecond = 0;
    for (let key in this.items) {
      basePerSecond += this.items[key].count * this.items[key].production;
    }
    this.totalPerSecond = basePerSecond * this.productionMultiplier; // Çarpan uygula
  }
  updateProduction() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Saniye olarak geçen süre
    this.lastUpdateTime = currentTime;

    // Depolanmış totalPerSecond kullanarak hesaplama
    const donutsProduced = this.totalPerSecond * deltaTime;
    this.donutCount += donutsProduced;
    this.totalDonutsEarned += donutsProduced;

    // Her item'in toplam üretimini de artır
    for (let key in this.items) {
      if (this.items[key].count > 0) {
        this.items[key].totalProduced +=
          this.items[key].count * this.items[key].production * deltaTime;
      }
    }

    this.updatePrestigeBar();
    this.updateTotalPerSecond();
    this.checkQuestProgress();
    this.updateDisplay();
  }
  calculateClickValue() {
    let clickValue = 1; // Base click value

    this.upgrades.cursor.forEach((upgrade) => {
      if (upgrade.purchased) {
        clickValue *= upgrade.multiplier;
      }
    });

    const perSecond = this.calculatePerSecond();
    const purchasedNonItemUpgrades = this.upgrades.nonItemUpgrades.filter(
      (upgrade) => upgrade.purchased
    ).length;

    // Her satın alınan upgrade için %1 ekle
    if (purchasedNonItemUpgrades > 0) {
      const perSecondBoost = perSecond * (0.01 * purchasedNonItemUpgrades);
      clickValue += perSecondBoost;
    }

    return clickValue;
  }
  calculatePerSecond() {
    let totalPerSecond = 0;
    for (let key in this.items) {
      totalPerSecond += this.items[key].count * this.items[key].production;
    }
    return totalPerSecond;
  }
  handleDonutClick(event) {
    this.hasDonutClicked = true; // İlk tıklamada true olur
    this.totalClicks++;

    const clickValue = this.calculateClickValue(); // Click value'yi hesapla

    this.donutCount += clickValue;
    this.totalDonutsEarned += clickValue;
    this.lastClickValue = clickValue;

    // Görsel ve ses efektlerini çalıştır
    const plusOne = document.createElement("div");
    plusOne.className = "plus-one";
    plusOne.textContent = `+${this.formatNumber(clickValue, "count")}`;
    plusOne.style.left = `${event.clientX}px`;
    plusOne.style.top = `${event.clientY}px`;

    document.body.appendChild(plusOne);
    setTimeout(() => document.body.removeChild(plusOne), 1000);
    this.createFallingDonut(event.clientX, event.clientY);
    this.playRandomClickSound();
    this.checkQuestProgress(); // Her tıklamadan sonra görevleri kontrol et
    this.updateDisplay();

    this.updateTitleWithDonuts(); // Her tıklamadan sonra başlık güncellenir
  }
  showUpgrades() {
    const upgradeList = document.getElementById("upgrade-list");
    const existingUpgrades = Array.from(upgradeList.children);

    let allUpgrades = [];

    for (let key in this.upgrades) {
      if (key === "nonItemUpgrades") continue;
      const itemUpgrades = this.upgrades[key];

      itemUpgrades.forEach((upgrade, index) => {
        if (upgrade.purchased) return;
        if (this.items[key].count < upgrade.requirement) return;
        allUpgrades.push({ key, index, upgrade });
      });
    }
    // Handle non-item upgrades separately
    this.upgrades.nonItemUpgrades.forEach((upgrade, index) => {
      if (upgrade.purchased) return;
      if (this.totalClicks < upgrade.requirement) return; // totalClicks gereksinim kontrolü

      allUpgrades.push({ key: "nonItemUpgrades", index, upgrade });
    });
    allUpgrades.sort((a, b) => a.upgrade.cost - b.upgrade.cost);

    allUpgrades.forEach(({ key, index, upgrade }, position) => {
      let existingUpgrade = existingUpgrades.find(
        (div) => div.dataset.key === key && div.dataset.index === String(index)
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
          upgradeList.insertBefore(upgradeDiv, upgradeList.children[position]);
        }
      } else {
        if (this.donutCount >= upgrade.cost) {
          existingUpgrade.classList.remove("insufficient-funds");
        } else {
          existingUpgrade.classList.add("insufficient-funds");
        }

        const upgradeCostElem = existingUpgrade.querySelector(".upgrade-cost");
        if (upgradeCostElem) {
          upgradeCostElem.textContent = this.formatNumber(upgrade.cost, "cost");
        }

        const currentPos = existingUpgrades.indexOf(existingUpgrade);
        if (currentPos !== position) {
          upgradeList.insertBefore(
            existingUpgrade,
            upgradeList.children[position]
          );
        }
      }
    });
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
  buyItem(itemKey) {
    const item = this.items[itemKey];
    const bulkCost = this.calculateBulkPrice(item, this.purchaseAmount);

    if (this.donutCount >= bulkCost) {
      this.donutCount -= bulkCost;

      const isFirstMine = itemKey === "mine" && item.count === 0;
      const isFirstBaker = itemKey === "baker" && item.count === 0;

      // Tek bir for döngüsü kullan
      for (let i = 0; i < this.purchaseAmount; i++) {
        item.count++;
        item.baseCost *= item.costMultiplier;

        if (itemKey === "mine") {
          this.addWorker();
        } else if (itemKey === "baker") {
          this.addBakerWorker();
        }
      }

      // Mine için panel kontrolü
      if (isFirstMine) {
        const mineImage = document.querySelector(
          '.store-item[data-item="mine"] .item-img img'
        );
        mineImage.classList.add("active-mine-effect");
        mineImage.classList.add("pulse-effect", "new-feature");

        const newLabel = document.createElement("div");
        newLabel.className = "new-feature-label";
        newLabel.textContent = "Click!";
        mineImage.parentElement.appendChild(newLabel);

        mineImage.setAttribute(
          "title",
          "Click to manage your mine and workers!"
        );

        mineImage.addEventListener(
          "click",
          () => {
            mineImage.classList.remove("pulse-effect", "new-feature");
            const label =
              mineImage.parentElement.querySelector(".new-feature-label");
            if (label) label.remove();
          },
          { once: true }
        );
      }

      // Baker için panel kontrolü
      if (isFirstBaker) {
        const bakerImage = document.querySelector(
          '.store-item[data-item="baker"] .item-img img'
        );
        bakerImage.classList.add("active-baker-effect");
        bakerImage.classList.add("pulse-effect", "new-feature");

        const newLabel = document.createElement("div");
        newLabel.className = "new-feature-label";
        newLabel.textContent = "Click!";
        bakerImage.parentElement.appendChild(newLabel);

        bakerImage.setAttribute(
          "title",
          "Click to manage your bakery and workers!"
        );

        bakerImage.addEventListener(
          "click",
          () => {
            bakerImage.classList.remove("pulse-effect", "new-feature");
            const label =
              bakerImage.parentElement.querySelector(".new-feature-label");
            if (label) label.remove();
          },
          { once: true }
        );
      }

      this.updateTotalPerSecond();
      this.checkQuestProgress();
      this.updateDisplay();
      this.showUpgrades();
    }
  }
  buyUpgrade(itemKey, upgradeIndex) {
    let upgrade;
    if (itemKey === "nonItemUpgrades") {
      upgrade = this.upgrades.nonItemUpgrades[upgradeIndex];
    } else {
      upgrade = this.upgrades[itemKey][upgradeIndex];
    }

    if (this.donutCount >= upgrade.cost && !upgrade.purchased) {
      this.donutCount -= upgrade.cost;
      upgrade.purchased = true;

      if (itemKey === "nonItemUpgrades") {
        this.clickValue *= upgrade.multiplier; // Or any effect specific to click upgrades
      } else {
        const item = this.items[itemKey];
        item.production *= upgrade.multiplier;
      }

      const upgradeList = document.getElementById("upgrade-list");
      const upgradeDiv = upgradeList.querySelector(
        `div[data-key="${itemKey}"][data-index="${upgradeIndex}"]`
      );
      if (upgradeDiv) {
        upgradeList.removeChild(upgradeDiv);
      }
      this.hideInfoPanel();
      this.updateDisplay();
      this.showUpgrades();
    }
  }
  setupRecipeBook() {
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

  updateRecipeBook() {
    document.querySelectorAll(".recipe-row").forEach((row) => {
      const recipeName = row.querySelector("h3").textContent;
      const makeBtn = row.querySelector(".make-btn");
      const recipe = this.recipes[recipeName];

      // Malzemelerin yeterliliğini kontrol et
      let canMake = true;
      for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
        if (
          !this.ingredients[ingredient] ||
          this.ingredients[ingredient].count < amount
        ) {
          canMake = false;
          break;
        }
      }

      // Make butonunu güncelle
      makeBtn.disabled = !canMake;
      makeBtn.title = canMake ? "Make this donut!" : "Not enough ingredients";

      // Malzeme durumlarını görsel olarak güncelle
      row.querySelectorAll(".ingredient").forEach((ing) => {
        const [amount, ingredient] = ing.textContent.split("x ");
        const hasEnough =
          this.ingredients[ingredient]?.count >= parseInt(amount);
        ing.classList.toggle("available", hasEnough);
        ing.classList.toggle("unavailable", !hasEnough);
      });
    });
  }

  selectRecipe(recipeName) {
    this.selectedRecipe = this.recipes[recipeName];
    const selectedRecipeElem = document.getElementById("selected-recipe-name");
    if (selectedRecipeElem) {
      selectedRecipeElem.textContent = recipeName;
      this.updateCraftButton();
    }
  }

  updateCraftButton() {
    const craftBtn = document.getElementById("craft-btn");
    if (!craftBtn) return;

    if (!this.selectedRecipe) {
      craftBtn.disabled = true;
      return;
    }

    let canCraft = true;
    for (const [ingredient, amount] of Object.entries(
      this.selectedRecipe.ingredients
    )) {
      if (
        !this.ingredients[ingredient] ||
        this.ingredients[ingredient].count < amount
      ) {
        canCraft = false;
        break;
      }
    }

    craftBtn.disabled = !canCraft;
    craftBtn.title = canCraft ? "Craft Donut" : "Not enough ingredients";
  }

  craftDonut() {
    if (!this.selectedRecipe) return;

    // Malzemeleri kullan
    for (const [ingredient, amount] of Object.entries(
      this.selectedRecipe.ingredients
    )) {
      this.ingredients[ingredient].count -= amount;
    }

    // Üretim miktarını hesapla (baker sayısı ve diğer bonusları ekleyebilirsiniz)
    const productionAmount =
      this.selectedRecipe.production * this.productionMultiplier;

    // Donut üret
    this.donutCount += productionAmount;
    this.totalDonutsEarned += productionAmount;

    // Bildirimi göster
    this.showNotification(
      `Crafted ${productionAmount} ${this.selectedRecipe.name}!`
    );

    // UI'ı güncelle
    this.updateDisplay();
    this.updateIngredientList();
    this.updateCraftButton();
    this.updateRecipeBook();
  }

  addBakerWorker() {
    if (this.items.baker.count <= 0) return;
    this.bakers.push({
      productionRate: 3, // Her çalışan 3 malzeme üretir
    });

    const workerCountElem = document.getElementById("bakerWorkerCount");
    if (workerCountElem) {
      workerCountElem.textContent = this.bakers.length;
    }
  }
  updateTotalIngredientCount() {
    const totalIngredientCount = Object.values(this.ingredients).reduce(
      (sum, ingredient) => sum + ingredient.count,
      0
    );

    const ingredientCountElem = document.getElementById("ingredientCount");
    if (ingredientCountElem) {
      ingredientCountElem.textContent = totalIngredientCount;
    }
  }
  generateIngredient() {
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

    this.updateTotalIngredientCount();
    this.updateIngredientList();
    this.updateBakerMarketPrices();
  }
  updateIngredientList() {
    if (this.items.baker.count <= 0) return;
    const ingredientList = document.getElementById("ingredientList");
    ingredientList.innerHTML = "";

    this.ingredientTypes.forEach((ingredient) => {
      const ingredientData = this.ingredients[ingredient.type] || { count: 0 };
      const listItem = document.createElement("li");

      listItem.style.opacity = ingredientData.count > 0 ? "1" : "0.5";
      listItem.innerHTML = `<img src="img/${ingredient.type.toLowerCase()}.webp" alt="${
        ingredient.type
      }"> x${ingredientData.count}`;

      ingredientList.appendChild(listItem);
    });
  }
  addWorker() {
    if (this.items.mine.count <= 0) return;
    this.workers.push({
      productionRate: 3,
    });

    const workerCountElem = document.getElementById("workerCount");
    if (workerCountElem) {
      workerCountElem.textContent = this.workers.length;
    }
  }
  generateOre() {
    if (this.items.mine.count <= 0) return;

    // Each worker generates ore based on their production rate
    this.workers.forEach((worker) => {
      for (let i = 0; i < worker.productionRate; i++) {
        const randomNum = Math.random();
        let cumulativeChance = 0;

        for (let ore of this.oreTypes) {
          cumulativeChance += ore.rarity;
          if (randomNum < cumulativeChance) {
            if (!this.ores[ore.type]) {
              this.ores[ore.type] = { count: 0 };
            }
            this.ores[ore.type].count++;
            break;
          }
        }
      }
    });

    this.updateTotalOreCount();
    this.updateOreList();
  }
  updateOreList() {
    if (this.items.mine.count <= 0) return;
    const oreList = document.getElementById("oreList");
    oreList.innerHTML = "";

    this.oreTypes.forEach((ore) => {
      const oreData = this.ores[ore.type] || { count: 0 }; // Default to 0 if ore not generated yet
      const listItem = document.createElement("li");

      listItem.style.opacity = oreData.count > 0 ? "1" : "0.5";
      listItem.innerHTML = `<img src="img/${ore.type.toLowerCase()}.webp" alt="${
        ore.type
      }"> x${oreData.count}`;

      oreList.appendChild(listItem);
    });

    this.updateTotalOreCount();
  }
  updateTotalOreCount() {
    const totalOreCount = Object.values(this.ores).reduce(
      (sum, ore) => sum + ore.count,
      0
    );
    const oreCountElem = document.getElementById("oreCount");
    if (oreCountElem) {
      oreCountElem.textContent = totalOreCount;
    }
  }
  updateMarketDisplay() {
    if (this.items.mine.count <= 0) return;
    const marketList = document.getElementById("marketList");
    marketList.innerHTML = "";

    this.oreTypes.forEach((ore) => {
      const listItem = document.createElement("li");

      const oreName = document.createElement("span");
      oreName.classList.add("ore-name");
      oreName.innerHTML = `<img src="img/${ore.type.toLowerCase()}.webp" alt="${
        ore.type
      }" class="ore-image">`;
      listItem.dataset.oreType = ore.type;
      const orePrice = document.createElement("span");
      orePrice.innerHTML = `<img src="img/donutMoney.webp" alt="Donut Money" class="donut-money-icon">
                            ${this.formatNumber(ore.price)}`;

      listItem.appendChild(oreName);
      listItem.appendChild(orePrice);
      marketList.appendChild(listItem);

      setTimeout(
        () => orePrice.classList.remove("green-text", "red-text"),
        500
      );
    });
  }
  updateMarketPrices() {
    if (this.items.mine.count <= 0) return;
    this.oreTypes.forEach((ore) => {
      const isPriceIncrease = Math.random() < 0.5;
      const changeFactor = isPriceIncrease ? 0.13 : -0.04;

      ore.price = Math.max(0, ore.price * (1 + changeFactor));
    });

    this.updateMarketDisplay();
  }
  startProductionCycle() {
    setInterval(() => {
      // Mine üretim kontrolü
      if (this.items.mine.count > 0) {
        if (this.workerCycleRemainingTime > 0) {
          this.workerCycleRemainingTime -= 1000;
        } else {
          this.generateOre();
          this.updateMarketPrices();
          this.workerCycleRemainingTime = this.workerProductionInterval;
          this.orePurchaseLimit = 10;
        }

        const remainingChancesElem =
          document.getElementById("remainingChances");
        if (remainingChancesElem) {
          remainingChancesElem.textContent = `You can get a maximum of 10 ores every 1 minute. Remaining: ${this.orePurchaseLimit}`;
        }

        const oreInfoElem = document.querySelector(".ore-generation-info");
        if (oreInfoElem) {
          oreInfoElem.textContent = `${
            this.workers.length
          } workers generating 3 ores per minute. Next in: ${Math.ceil(
            this.workerCycleRemainingTime / 1000
          )}s`;
        }
      }

      // Baker üretim kontrolü
      if (this.items.baker.count > 0) {
        if (this.bakerCycleRemainingTime > 0) {
          this.bakerCycleRemainingTime -= 1000;
        } else {
          this.generateIngredient(); // Üretimi yap
          this.bakerCycleRemainingTime = this.bakerProductionInterval; // Süreyi sıfırla
          this.ingredientPurchaseLimit = 10; // Limiti sıfırla
        }

        // UI güncellemeleri
        const bakerRemainingChancesElem = document.getElementById(
          "bakerRemainingChances"
        );
        if (bakerRemainingChancesElem) {
          bakerRemainingChancesElem.textContent = `You can get a maximum of 10 ingredients every 3 minutes. Remaining: ${this.ingredientPurchaseLimit}`;
        }

        const ingredientInfoElem = document.querySelector(
          ".ingredient-generation-info"
        );
        if (ingredientInfoElem) {
          ingredientInfoElem.textContent = `${
            this.bakers.length
          } bakers generating 3 ingredients per 3 minutes. Next in: ${Math.ceil(
            this.bakerCycleRemainingTime / 1000
          )}s`;
        }
      }
    }, 1000);
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
    document.getElementById("marketList").addEventListener("click", (event) => {
      const listItem = event.target.closest("li");
      if (listItem) {
        const oreType = listItem.getAttribute("data-ore-type");
        this.handleMarketTransaction(oreType);
      }
    });
  }
  updateMarketButtonStyles() {
    const buyBtn = document.getElementById("buyBtn");
    const sellBtn = document.getElementById("sellBtn");

    // Buton renklerini güncelle
    buyBtn.classList.toggle("selected", this.isBuying);
    sellBtn.classList.toggle("selected", this.isSelling);

    // List itemlar için hover rengini güncelle
    document.querySelectorAll("#marketList li").forEach((li) => {
      li.classList.toggle("buy-hover", this.isBuying);
      li.classList.toggle("sell-hover", this.isSelling);
    });
  }
  handleMarketTransaction(oreType) {
    const ore = this.oreTypes.find((o) => o.type === oreType);
    if (!ore) return;

    const orePrice = ore.price;

    if (this.isBuying) {
      if (this.donutCount >= orePrice && this.orePurchaseLimit > 0) {
        this.donutCount -= orePrice;
        this.ores[oreType].count++;
        this.orePurchaseLimit--;
        this.updateDisplay();
        this.updateOreList();
      } else if (this.orePurchaseLimit <= 0) {
        this.showTransactionError("Purchase limit reached!");
      } else {
        this.showTransactionError("Not enough donuts!");
      }
    } else if (this.isSelling) {
      if (this.ores[oreType].count > 0) {
        this.donutCount += orePrice;
        this.ores[oreType].count--;
        this.updateDisplay();
        this.updateOreList();
      } else {
        // Liste öğesine geçici bir efekt ekle
        const listItem = document.querySelector(
          `#marketList li[data-ore-type="${oreType}"]`
        );
        if (listItem) {
          listItem.classList.add("shake-error");
          setTimeout(() => listItem.classList.remove("shake-error"), 500);
        }
      }
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
      '.store-item[data-item="mine"] .item-img img'
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
      '.store-item[data-item="baker"] .item-img img'
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
        this.updateOreList();
        this.updateMarketPrices();
      } else if (type === "baker") {
        this.updateIngredientList();
        this.setupRecipeBook(); // Yeni eklenen
        this.updateCraftButton(); // Yeni eklenen
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
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    const costColor = this.donutCount >= upgrade.cost ? "#6f6" : "red";
    const formattedCost = this.formatNumber(upgrade.cost, "cost");

    // Eğer upgrade 'nonItemUpgrades' grubundaysa özel mesajı göster, değilse standart mesajı göster
    const efficiencyText =
      itemName === "nonItemUpgrades"
        ? "Clicking gains +1% of your DpS"
        : `${formattedItemName}s are <strong>twice</strong> as efficient`;

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
    if (window.innerWidth <= 764) {
      return; // Mobilde panel açılmayacak
    }
    const item = this.items[itemKey];
    const itemInfoPanel = document.getElementById("item-info-panel");

    const updateItemInfo = () => {
      // Item ismi ve resmi güncelle
      document.getElementById(
        "item-info-name"
      ).innerHTML = `<strong>${item.name}</strong>`;
      document.getElementById("item-info-image").src = `img/${itemKey}.webp`;

      // Owned güncelle
      document.getElementById(
        "item-info-owned"
      ).innerHTML = `Owned: ${item.count}`;

      // Cost'u güncelle ve donutMoney resmini kullan
      const costColor = this.donutCount >= item.baseCost ? "#6f6" : "red";
      document.getElementById("item-info-cost").innerHTML = `
        <img src="img/donutMoney.webp" alt="donut icon" class="icon" />
        <span style="color: ${costColor};">${this.formatNumber(
        item.baseCost,
        "cost"
      )}</span>
      `;

      let percentageOfTotal = 0;
      const itemProduction = item.count * item.production;
      const totalProduction = this.calculatePerSecond(); // Toplam üretim

      if (totalProduction > 0) {
        percentageOfTotal = (itemProduction / totalProduction) * 100;
      }

      // Item özelliklerini güncelle
      document.getElementById("item-info-feature").innerHTML = `
      Each <strong>${item.name}</strong> produces <strong>${
        itemKey === "cursor"
          ? this.formatNumber(item.production, "perSecond")
          : this.formatNumber(item.production, "count")
      } donuts</strong> per second<br>
      ${this.formatNumber(item.count, "count")} <strong>${
        item.name + "(s)"
      }</strong> producing <strong>${this.formatNumber(
        itemProduction,
        "count"
      )} donuts</strong> per second<br>
      Total produced: ${this.formatNumber(item.totalProduced, "count")}<br>
      <span style="color: #FFD700;">Contributing ${percentageOfTotal.toFixed(
        1
      )}% of total production</span>
    `;

      // Satın alınan upgrade'leri göster
      if (this.upgrades[itemKey]) {
        const purchasedUpgrades = this.upgrades[itemKey]
          .filter((upgrade) => upgrade.purchased)
          .map(
            (upgrade) => `
          <img src="img/${upgrade.img}" alt="${upgrade.name}" class="upgrade-icon" />
        `
          )
          .join("");

        const upgradesInfo = purchasedUpgrades
          ? `Purchased upgrades: <div class="upgrades-container">${purchasedUpgrades}</div>`
          : "No upgrades purchased yet.";

        document.getElementById("item-info-feature").innerHTML += `
        <br>${upgradesInfo}
      `;
      }
    };
    // Bilgileri hemen güncelle
    updateItemInfo();

    // Önceki interval varsa temizle
    if (this.activeIntervalId) {
      clearInterval(this.activeIntervalId);
    }

    // Yeni interval başlat ve 125ms'e ayarla
    this.activeIntervalId = setInterval(updateItemInfo, this.updateInterval);

    // Paneli göster
    itemInfoPanel.style.display = "block";

    // Panelin pozisyonunu store item'a göre ayarla
    const storeItem = document.querySelector(
      `.store-item[data-item="${itemKey}"]`
    );
    const rect = storeItem.getBoundingClientRect();

    itemInfoPanel.style.left = `${
      rect.left - itemInfoPanel.offsetWidth - 10
    }px`;
    itemInfoPanel.style.top = `${rect.top}px`;

    // Hover dışına çıkıldığında interval'i temizle ve paneli gizle
    storeItem.addEventListener("mouseleave", () => {
      itemInfoPanel.style.display = "none";
      clearInterval(this.activeIntervalId);
      this.activeIntervalId = null;
    });
  }
  setupStoreHover() {
    for (let key in this.items) {
      const storeItem = document.querySelector(
        `.store-item[data-item="${key}"]`
      );
      if (storeItem) {
        storeItem.addEventListener("mouseenter", () => this.showItemInfo(key));
      } else {
        console.error(`Store item with key ${key} not found.`);
      }
    }
  }
  setupVisibilityChange() {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        const now = Date.now();
        const elapsed = now - this.lastUpdateTime;
        const additionalDonuts = (elapsed / 1000) * this.calculatePerSecond();
        this.donutCount += Math.floor(additionalDonuts);
        this.accumulator += additionalDonuts % 1; // Add fraction to accumulator
        this.lastUpdateTime = now;
        this.updateDisplay();
      } else {
        this.lastUpdateTime = Date.now();
      }
    });
  }

  updatePrestigeBar() {
    const prestigeBarFill = document.getElementById("prestigeBarFill");
    const prestigePoints = document.getElementById("prestigePoints");
    const nextPrestigeText = document.getElementById("nextPrestigeThreshold");

    const progress = Math.min(
      this.totalDonutsEarned / this.nextPrestigeThreshold,
      1
    );
    prestigeBarFill.style.width = `${progress * 100}%`;

    if (progress === 1) {
      prestigeBarFill.classList.add("full");
    } else {
      prestigeBarFill.classList.remove("full");
    }

    prestigePoints.textContent = `Prestige Points: ${this.prestigeCount}`;
    nextPrestigeText.textContent = `Next Prestige at: ${this.formatNumber(
      this.nextPrestigeThreshold
    )} donuts`;
  }
  performPrestige() {
    if (this.totalDonutsEarned >= this.nextPrestigeThreshold) {
      this.prestigeCount++;

      for (let key in this.items) {
        this.items[key].originalProduction *= this.prestigeMultiplier;
        this.items[key].production = this.items[key].originalProduction;
        this.items[key].count = 0; // Önce tüm sayıları sıfırla

        const dynamicBuildingCostMultiplier =
          this.BUILDING_COST_MULTIPLIER *
          Math.pow(
            this.PRESTIGE_BUILDING_COST_MULTIPLIER_INCREMENT,
            this.prestigeCount - 1
          );

        this.items[key].baseCost =
          this.items[key].originalBaseCost * dynamicBuildingCostMultiplier;
      }

      this.items.cursor.count = 5;

      for (let key in this.upgrades) {
        this.upgrades[key].forEach((upgrade) => {
          upgrade.cost *= this.UPGRADE_COST_MULTIPLIER;
          upgrade.purchased = false;
        });
      }

      this.donutCount = 0;
      this.totalDonutsEarned = 0;
      this.totalPerSecond = 0;
      this.totalClicks = 0;
      this.nextPrestigeThreshold *= 2;

      this.clearUpgradeList();
      this.updatePrestigeBar();
      this.updateDisplay();
      this.updateTotalPerSecond(); // Cursor'ların üretimini hesaplamak için
    }
  }
  setupPrestigeModal() {
    const prestigeModal = document.getElementById("prestigeModal");
    const closeModal = document.getElementById("closeModal");
    const prestigeYes = document.getElementById("prestigeYes");
    const prestigeNo = document.getElementById("prestigeNo");

    document.getElementById("prestige").addEventListener("click", () => {
      if (this.totalDonutsEarned >= this.nextPrestigeThreshold) {
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
  playRandomClickSound() {
    const randomIndex = Math.floor(Math.random() * this.clickSounds.length);
    this.clickSounds[randomIndex].play();
  }
  createFallingDonut(x, y) {
    const fallingDonut = document.createElement("img");

    // Rastgele bir görsel seç
    const images = [
      "donutNew.webp",
      "christmasGift.webp",
      "christmasCookie.webp",
      "christmasRed.webp",
    ];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    fallingDonut.src = `img/${randomImage}`;

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
      `${horizontalDistance}px`
    );

    fallingDonut.style.animationTimingFunction = "ease-in-out";
    fallingDonut.style.animationRotation = `${Math.random() * 360}deg`;

    document.body.appendChild(fallingDonut);

    setTimeout(() => {
      document.body.removeChild(fallingDonut);
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
  formatNumber(number, type = "count") {
    if (type === "perSecond") {
      // Her zaman ondalık gösterim kullan
      if (number < 1000) {
        return number.toFixed(1).replace(".", ","); // 1.0'ı 1,0'a çevir
      } else if (number < 1000000) {
        return number
          .toFixed(1)
          .replace(".", ",")
          .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Binlik ayraç olarak nokta, ondalık ayraç olarak virgül kullan
      } else if (number < 1000000000) {
        return (
          (number / 1000000)
            .toFixed(3)
            .replace(".", ",")
            .replace(/\.?0+$/, "") + " million"
        );
      } else if (number < 1000000000000) {
        return (
          (number / 1000000000)
            .toFixed(3)
            .replace(".", ",")
            .replace(/\.?0+$/, "") + " billion"
        );
      } else if (number < 1000000000000000) {
        return (
          (number / 1000000000000)
            .toFixed(3)
            .replace(".", ",")
            .replace(/\.?0+$/, "") + " trillion"
        );
      } else if (number < 1000000000000000000) {
        return (
          (number / 1000000000000000)
            .toFixed(3)
            .replace(".", ",")
            .replace(/\.?0+$/, "") + " quadrillion"
        );
      } else {
        return (
          (number / 1000000000000000000)
            .toFixed(3)
            .replace(".", ",")
            .replace(/\.?0+$/, "") + " quintillion"
        );
      }
    }

    // Diğer tipler için mevcut davranışı koru
    if (number < 1000) {
      return Math.floor(number).toString();
    } else if (number < 1000000) {
      return Math.floor(number)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Nokta ile binlik ayırıcı
    } else if (number < 1000000000) {
      return (number / 1000000).toFixed(3).replace(/\.?0+$/, "") + " million";
    } else if (number < 1000000000000) {
      return (
        (number / 1000000000).toFixed(3).replace(/\.?0+$/, "") + " billion"
      );
    } else if (number < 1000000000000000) {
      return (
        (number / 1000000000000).toFixed(3).replace(/\.?0+$/, "") + " trillion"
      );
    } else if (number < 1000000000000000000) {
      return (
        (number / 1000000000000000).toFixed(3).replace(/\.?0+$/, "") +
        " quadrillion"
      );
    } else {
      return (
        (number / 1000000000000000000).toFixed(3).replace(/\.?0+$/, "") +
        " quintillion"
      );
    }
  }
  updateTitleWithDonuts() {
    if (!this.hasDonutClicked) return;

    const donutCountElement = document.getElementById("donut-count");
    let donutCountText = donutCountElement?.textContent.trim();
    if (donutCountText) {
      document.title = `${donutCountText} - Donut Clicker`;
    }
  }
  getRandomBakeryName() {
    const randomIndex = Math.floor(Math.random() * this.bakeryNames.length);
    return this.bakeryNames[randomIndex];
  }
  updateBakeryName() {
    const bakeryNameElement = document.getElementById("bakery-name");
    if (bakeryNameElement) {
      if (!this.currentBakeryName) {
        this.currentBakeryName = this.getRandomBakeryName() + "'s Bakery";
        this.saveGame();
      }
      bakeryNameElement.textContent = this.currentBakeryName;
    }
  }
  showGameSaved() {
    const gameSavedElement = document.getElementById("game-saved");
    gameSavedElement.classList.add("show");

    setTimeout(() => {
      gameSavedElement.classList.remove("show");
    }, 2000);
  }
  updateStatsDisplay() {
    // Toplam donut sayısı
    document.getElementById("total-donuts").textContent = this.formatNumber(
      this.donutCount
    );

    // Oyun boyunca üretilen toplam donut sayısı
    document.getElementById("donuts-produced").textContent = this.formatNumber(
      this.totalDonutsEarned
    );

    // Toplam item sayısı (Tüm binaların sayısı)
    const totalItems = Object.values(this.items).reduce(
      (acc, item) => acc + item.count,
      0
    );
    document.getElementById("total-items").textContent =
      this.formatNumber(totalItems);

    // Saniyede üretilen donut sayısı
    document.getElementById("donuts-per-second").textContent =
      this.formatNumber(this.totalPerSecond);

    // Click başına donut kazancı
    this.lastClickValue = this.calculateClickValue(); // Her zaman güncel clickValue'yi hesapla
    document.getElementById("click-value").textContent = this.formatNumber(
      this.lastClickValue
    );

    // Toplam tıklama sayısı
    document.getElementById("total-clicks").textContent = this.formatNumber(
      this.totalClicks
    );
  }
  closeAllMenus(except = null) {
    // Sadece masaüstü menüleri için
    if (!this.isMobile) {
      const menus = ["stats-menu", "information-menu", "settings-menu"];
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
    const closeSettingsButton = document.getElementById("close-settings-menu");
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
      volumeSlider.addEventListener("input", (event) => {
        const volume = event.target.value;
        this.clickSounds.forEach((sound) => {
          sound.volume = volume;
        });
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

  // Ekran boyutu değiştiğinde kontrol et
  setupResizeListener() {
    window.addEventListener("resize", () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;

      if (wasMobile !== this.isMobile) {
        // Tüm menüleri kapat ve yeni moda göre ayarla
        const menus = ["stats-menu", "information-menu", "settings-menu"];
        menus.forEach((menu) => {
          const menuElement = document.getElementById(menu);
          if (this.isMobile) {
            menuElement.classList.remove("hidden");
            menuElement.classList.remove("mobile-active");
          } else {
            menuElement.classList.remove("mobile-active");
            menuElement.classList.add("hidden");
          }
        });
      }
    });
  }
  getRandomBakeryName() {
    const randomIndex = Math.floor(Math.random() * this.bakeryNames.length);
    return this.bakeryNames[randomIndex];
  }
  updateBakeryName() {
    const bakeryNameElement = document.getElementById("bakery-name");

    // Eğer localStorage'da isim varsa onu kullan, yoksa rastgele bir isim ata (kaydetme)
    let savedName = localStorage.getItem("bakeryName");
    if (savedName) {
      this.currentBakeryName = savedName;
    } else {
      this.currentBakeryName = this.getRandomBakeryName() + "'s Bakery";
    }

    if (bakeryNameElement) {
      bakeryNameElement.textContent = this.currentBakeryName;
    }
  }
  openChangeNameModal() {
    const modal = document.getElementById("changeNameModal");
    modal.style.display = "block";
  }
  closeChangeNameModal() {
    const modal = document.getElementById("changeNameModal");
    modal.style.display = "none";
  }
  changeBakeryName() {
    const newBakeryName = document.getElementById("newBakeryName").value.trim();
    if (newBakeryName) {
      this.currentBakeryName = newBakeryName + "'s Bakery";
      document.getElementById("bakery-name").textContent =
        this.currentBakeryName;

      // Kullanıcı isim değiştirdiğinde yeni ismi kaydet
      localStorage.setItem("bakeryName", this.currentBakeryName);
      this.closeChangeNameModal();
    }
  }
  initSnowEffect() {
    // Eğer önceki kar efekti varsa temizle
    if (this.snowContainer) {
      this.snowContainer.remove();
    }

    // Yeni kar container'ı oluştur
    this.snowContainer = document.createElement("div");
    this.snowContainer.id = "snow-container";
    document.body.appendChild(this.snowContainer);

    // Style tanımlamaları
    const style = document.createElement("style");
    style.textContent = `
        #snow-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 9999;
        }

        .snowflake {
            position: absolute;
            background: white;
            border-radius: 50%;
            opacity: 0;
            animation: fall-and-sway var(--fall-duration) linear forwards;
            width: var(--size);
            height: var(--size);
            box-shadow: 0 0 3px rgba(255, 255, 255, 0.9);
        }

        @keyframes fall-and-sway {
            0% { transform: translate(0, -10px) rotate(0deg); opacity: 0; }
            2% { opacity: 0.8; }
            45% { transform: translate(var(--sway-distance), 45vh) rotate(var(--rotation)); opacity: 0.9; }
            100% { transform: translate(calc(var(--sway-distance) * 2), calc(100vh + 20px)) rotate(calc(var(--rotation) * 2)); opacity: 0; }
        }
    `;

    // Style elementini ekle
    if (!document.getElementById("snow-style")) {
      style.id = "snow-style";
      document.head.appendChild(style);
    }

    // Temel değişkenleri ayarla
    this.isSnowing = true;
    this.snowflakePool = new Set();
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.snowflakeTemplate = document.createElement("div");
    this.snowflakeTemplate.className = "snowflake";

    // Kar yağışını başlat
    this.boundSnowingLoop = this.snowingLoop.bind(this);
    requestAnimationFrame(this.boundSnowingLoop);
  }

  snowingLoop(timestamp) {
    if (!this.isSnowing) return;

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.frameCount++;

    // Her frame'de kar tanesi ekle
    const maxSnowflakes = Math.min(500, window.innerWidth / 2);
    const currentSnowflakes = this.snowflakePool.size;

    if (currentSnowflakes < maxSnowflakes) {
      const batchSize = Math.min(3, maxSnowflakes - currentSnowflakes);

      for (let i = 0; i < batchSize; i++) {
        const snowflake = this.createSnowflake();
        this.snowContainer.appendChild(snowflake);
      }
    }

    requestAnimationFrame(this.boundSnowingLoop);
  }

  createSnowflake() {
    const snowflake = this.snowflakeTemplate.cloneNode(true);

    // Kar tanesi özellikleri
    const size =
      Math.random() < 0.7 ? 2 + Math.random() * 2 : 4 + Math.random() * 3;
    const fallDuration = 3 + Math.random() * 2;
    const swayDistance = Math.random() * 30 - 15;

    snowflake.style.cssText = `
        --size: ${size}px;
        --fall-duration: ${fallDuration}s;
        --sway-distance: ${swayDistance}vw;
        --rotation: ${Math.random() * 360}deg;
        left: ${Math.random() * 100}vw;
    `;

    this.snowflakePool.add(snowflake);

    // Cleanup
    setTimeout(() => {
      if (snowflake.parentNode === this.snowContainer) {
        snowflake.remove();
        this.snowflakePool.delete(snowflake);
      }
    }, fallDuration * 1000);

    return snowflake;
  }

  stopSnowEffect() {
    this.isSnowing = false;
    if (this.snowContainer) {
      this.snowflakePool.forEach((snowflake) => snowflake.remove());
      this.snowflakePool.clear();
    }
  }

  startSnowEffect() {
    if (!this.isSnowing) {
      this.initSnowEffect();
    }
  }
  initControls() {
    const toggleButton = document.getElementById("toggle-snow-button");
    if (toggleButton) {
      toggleButton.addEventListener("click", () => {
        if (this.isSnowing) {
          this.stopSnowEffect();
          toggleButton.textContent = "Start Snow";
        } else {
          this.startSnowEffect();
          toggleButton.textContent = "Stop Snow";
        }
      });
    }
  }
  spawnChristmasBox() {
    if (this.activeBox) return; // Zaten aktif kutu varsa, başka bir kutu oluşturma

    const randomBox =
      this.christmasBoxes[
        Math.floor(Math.random() * this.christmasBoxes.length)
      ];

    const boxElement = document.createElement("img");
    boxElement.src = `img/${randomBox.image}`;
    boxElement.classList.add("christmas-box", randomBox.type);
    boxElement.style.position = "absolute";
    boxElement.style.left = `${Math.random() * 80 + 10}%`; // Between 10% and 90%
    boxElement.style.top = `${Math.random() * 70 + 10}%`; // Between 10% and 80%

    document.body.appendChild(boxElement);
    this.activeBox = { element: boxElement, data: randomBox };

    setTimeout(() => {
      if (this.activeBox?.element === boxElement) {
        this.removeActiveBox();
      }
    }, 15000); // 15 saniye

    // Kutunun tıklama olayını ayarla
    boxElement.addEventListener("click", () => this.handleBoxClick(randomBox));
  }
  removeActiveBox() {
    if (this.activeBox) {
      if (this.activeBox.element.parentNode) {
        document.body.removeChild(this.activeBox.element);
      }
      this.activeBox = null;
    }
  }
  handleBoxClick(boxData) {
    if (!this.activeBox || this.activeBox.data !== boxData) return;

    const randomBonus = Math.random();
    let rewardText = "";
    let duration = 0;

    if (randomBonus < 0.5) {
      // %50 şansla donut ödülü
      const donutsAdded = Math.floor(this.donutCount * (0.5 + Math.random()));
      this.donutCount += donutsAdded;
      this.totalDonutsEarned += donutsAdded;
      rewardText = `+${donutsAdded} donuts!`;
      duration = 8000;
    } else if (randomBonus < 0.8) {
      // %30 şansla üretim çarpanı
      const multiplier = 1 + boxData.rewardMultiplier;
      duration = 30000;
      this.applyProductionMultiplier(multiplier, duration);
      rewardText = `Production boosted by ${multiplier}x for ${
        duration / 1000
      } seconds!`;
    } else {
      // %20 şansla şanslı ödül
      const luckyReward = Math.max(
        Math.floor(Math.random() * (this.donutCount * 0.1)),
        500 // Minimum 500 donut
      );
      this.donutCount += luckyReward;
      this.totalDonutsEarned += luckyReward;
      rewardText = `+${luckyReward} bonus donuts!`;
      duration = 8000;
    }

    // Ödül ve mesajları göster
    const rewardElement = document.createElement("div");
    rewardElement.className = "reward-display";
    rewardElement.innerHTML = `
        <img src="img/${boxData.image}" alt="Reward" class="reward-image" />
        <div class="reward-timer-bar">
            <div class="timer-fill"></div>
        </div>
    `;
    rewardElement.style.setProperty("--duration", `${duration}ms`);
    document.body.appendChild(rewardElement);

    const rewardMessage = document.createElement("div");
    rewardMessage.className = "reward-message";
    rewardMessage.textContent = rewardText;

    const boxRect = this.activeBox.element.getBoundingClientRect();
    rewardMessage.style.left = `${boxRect.left + boxRect.width / 2}px`;
    rewardMessage.style.top = `${boxRect.top}px`;

    document.body.appendChild(rewardMessage);
    setTimeout(() => document.body.removeChild(rewardMessage), 5000);

    rewardElement.addEventListener("mouseenter", () =>
      this.showRewardInfo(rewardElement, rewardText)
    );
    rewardElement.addEventListener("mouseleave", () => this.hideRewardInfo());
    setTimeout(() => {
      document.body.removeChild(rewardElement);
    }, duration);

    // Aktif kutuyu kaldır
    this.removeActiveBox();
  }
  showRewardInfo(element, rewardText) {
    const infoPanel = document.createElement("div");
    infoPanel.className = "reward-info-panel";
    infoPanel.innerHTML = `
        <p>${rewardText}</p>
    `;
    element.appendChild(infoPanel);
  }
  hideRewardInfo() {
    clearInterval(this.infoInterval);
    const panel = document.querySelector(".reward-info-panel");
    if (panel) panel.remove();
  }
  applyProductionMultiplier(multiplier, duration) {
    this.productionMultiplier *= multiplier; // Çarpanı uygula
    this.updateTotalPerSecond();
    this.updateDisplay();

    setTimeout(() => {
      this.productionMultiplier /= multiplier; // Çarpanı sıfırla
      this.updateTotalPerSecond();
      this.updateDisplay();
    }, duration);
  }
  startChristmasBoxes() {
    const spawnRandomBox = () => {
      this.spawnChristmasBox();

      const nextSpawnTime =
        Math.random() * (15 - 10) * 60 * 1000 + 10 * 60 * 1000;
      this.boxSpawnTimeout = setTimeout(spawnRandomBox, nextSpawnTime);
    };

    // İlk kutuyu hemen üretmek yerine 10-15 dakika sonra üret
    const initialDelay = Math.random() * (15 - 10) * 60 * 1000 + 10 * 60 * 1000;
    this.boxSpawnTimeout = setTimeout(spawnRandomBox, initialDelay);
  }
  saveGame() {
    const gameState = {
      items: this.items,
      upgrades: this.upgrades,
      donutCount: this.donutCount,
      accumulator: this.accumulator,
      currentBakeryName: this.currentBakeryName,
      totalDonutsEarned: this.totalDonutsEarned,
      prestigeCount: this.prestigeCount,
      nextPrestigeThreshold: this.nextPrestigeThreshold,
      ores: this.ores,
      workers: this.workers,
      oreTypes: this.oreTypes.map((ore) => ({
        type: ore.type,
        price: ore.price,
      })),
      quests: this.quests,
      activeMultipliers: this.activeMultipliers,
      gameVersion: this.currentVersion,
      totalClicks: this.totalClicks,
      hasDonutClicked: this.hasDonutClicked,
      productionMultiplier: this.productionMultiplier,
      totalPerSecond: this.totalPerSecond,
      lastUpdateTime: this.lastUpdateTime,
    };
    localStorage.setItem("bakeryName", this.currentBakeryName);
    localStorage.setItem("gameState", JSON.stringify(gameState));
    this.showGameSaved();
  }
  loadGame() {
    const savedGame = localStorage.getItem("gameState");
    if (savedGame) {
      const gameState = JSON.parse(savedGame);
      if (
        !gameState.gameVersion ||
        parseFloat(gameState.gameVersion) < parseFloat(this.currentVersion)
      ) {
        this.applyUpdates(gameState);
      }

      // Güncellenmiş `gameState` verilerini yüklüyoruz
      this.items = gameState.items || this.items;
      this.upgrades = gameState.upgrades || this.upgrades;
      this.donutCount = gameState.donutCount || 0;
      this.accumulator = gameState.accumulator || 0;
      this.totalDonutsEarned = gameState.totalDonutsEarned || 0;
      this.prestigeCount = gameState.prestigeCount || 0;
      this.nextPrestigeThreshold = gameState.nextPrestigeThreshold || 10000000;
      this.ores = gameState.ores || {};
      this.workers = gameState.workers || [];
      this.totalClicks = gameState.totalClicks || 0;
      this.hasDonutClicked = gameState.hasDonutClicked || false;
      this.productionMultiplier = gameState.productionMultiplier || 1;
      this.totalPerSecond = gameState.totalPerSecond || 0;
      this.lastUpdateTime = gameState.lastUpdateTime || Date.now();
      this.currentBakeryName =
        gameState.currentBakeryName ||
        localStorage.getItem("bakeryName") ||
        this.getRandomBakeryName() + "'s Bakery";
      if (gameState.quests) {
        Object.keys(this.quests).forEach((questId) => {
          if (gameState.quests[questId]) {
            this.quests[questId].progress =
              gameState.quests[questId].progress || 0;
            this.quests[questId].completed =
              gameState.quests[questId].completed || false;
            this.quests[questId].claimed =
              gameState.quests[questId].claimed || false;
          }
        });
      }
      // Aktif multiplier'ları yükle
      if (gameState.activeMultipliers) {
        this.activeMultipliers = gameState.activeMultipliers.filter(
          (m) => m.endTime > Date.now()
        );
        this.updateProductionMultiplier();
      }

      // Ekranı güncelle
      document.getElementById("bakery-name").textContent =
        this.currentBakeryName;
      this.updateTotalOreCount();
      this.updateOreList();
      this.updateMarketDisplay();
      this.updateQuestDisplay();
      this.updateDisplay();
      this.showUpgrades();
      this.updatePrestigeBar();
      this.updateTotalPerSecond();
      this.updateProductionMultiplier();
    }
  }
  applyUpdates(gameState) {
    const upgradeCategories = [
      "cursor",
      "baker",
      "farm",
      "mine",
      "factory",
      "logisticCenter",
      "nonItemUpgrades",
    ];

    // Upgrade kategorilerini güncelle
    upgradeCategories.forEach((category) => {
      if (!gameState.upgrades[category]) {
        gameState.upgrades[category] = this.upgrades[category];
      } else {
        this.upgrades[category].forEach((upgrade, index) => {
          if (
            !gameState.upgrades[category][index] ||
            gameState.upgrades[category][index].cost !== upgrade.cost
          ) {
            gameState.upgrades[category][index] = upgrade;
          }
          // Resim dosyasının yolunu güncelle
          gameState.upgrades[category][index].img =
            gameState.upgrades[category][index].img +
            "?v=" +
            this.currentVersion;
        });
      }
    });

    // Item verilerini güncelle
    Object.keys(this.items).forEach((itemKey) => {
      if (!gameState.items[itemKey]) {
        gameState.items[itemKey] = this.items[itemKey];
      } else {
        const gameStateItem = gameState.items[itemKey];
        const currentItem = this.items[itemKey];
        gameStateItem.baseCost = currentItem.baseCost || gameStateItem.baseCost;
        gameStateItem.production =
          currentItem.production || gameStateItem.production;
      }
    });

    // Ores verilerini güncelle
    if (!gameState.ores) {
      gameState.ores = this.ores;
    } else {
      Object.keys(this.ores).forEach((oreType) => {
        if (!gameState.ores[oreType]) {
          gameState.ores[oreType] = this.ores[oreType];
        }
      });
    }

    // Workers verilerini güncelle
    if (!gameState.workers) {
      gameState.workers = this.workers;
    } else {
      gameState.workers.forEach((worker, index) => {
        if (!this.workers[index]) {
          this.workers.push(worker);
        }
      });
    }
    if (!gameState.quests) {
      gameState.quests = this.quests;
    } else {
      // Yeni questleri ekle ve mevcut quest verilerini koru
      Object.keys(this.quests).forEach((questId) => {
        if (!gameState.quests[questId]) {
          gameState.quests[questId] = this.quests[questId];
        } else {
          // Mevcut ilerlemeyi ve durumu koru
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
    // Multiplier sistemini güncelle
    if (!gameState.activeMultipliers) {
      gameState.activeMultipliers = [];
    }
    gameState.gameVersion = this.currentVersion;
    localStorage.setItem("gameState", JSON.stringify(gameState));
  }
  resetGame() {
    const confirmation = confirm(
      "Are you sure you want to reset the game? All your progress will be deleted."
    );
    if (confirmation) {
      localStorage.removeItem("gameState");
      localStorage.removeItem("bakeryName");
      location.reload();
    }
  }
  setupQuestSystem() {
    // Quest menüsü elementlerini seç
    this.questsMenu = document.getElementById("quests-menu");
    this.questsButton = document.getElementById("quests");
    this.closeQuestsMenu = document.getElementById("close-quests-menu");

    // Event listener'ları ekle
    this.questsButton.addEventListener("click", () => this.toggleQuestMenu());
    this.closeQuestsMenu.addEventListener("click", () =>
      this.toggleQuestMenu()
    );
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach((button) => {
      button.addEventListener("click", () =>
        this.switchQuestTab(button.dataset.tab)
      );
    });
    // İlk quest durumunu güncelle
    this.updateQuestDisplay();
  }
  toggleQuestMenu() {
    // Gizlilik kontrolü için classList toggle özelliği
    if (this.questsMenu.classList.contains("hidden")) {
      this.questsMenu.classList.remove("hidden");
      this.questsMenu.classList.add("visible");
      this.updateQuestDisplay(); // Mevcut görevlerin görüntülenmesi
    } else {
      this.questsMenu.classList.add("hidden");
      this.questsMenu.classList.remove("visible");
    }
  }
  switchQuestTab(tabName) {
    // Tab butonlarını güncelle
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tabName);
    });

    // Quest container'larını güncelle
    const containers = document.querySelectorAll(".quests-container");
    containers.forEach((container) => {
      container.classList.toggle(
        "hidden",
        !container.classList.contains(tabName)
      );
    });
  }
  calculateQuestDifficulty(quest) {
    // Temel zorluk puanı
    let difficultyScore = 0;

    switch (quest.type) {
      case "clicks":
        // Tıklama görevleri için hedef sayısına göre zorluk
        difficultyScore = quest.target * 0.01;
        break;

      case "production":
        // Üretim görevleri için hedef/1000 ile zorluk
        difficultyScore = quest.target / 1000;
        break;

      case "building":
        // Bina görevleri için bina maliyeti ve hedef sayısına göre zorluk
        const buildingCost = this.items[quest.buildingType].baseCost;
        difficultyScore = (buildingCost * quest.target) / 100;
        break;

      case "combined":
        // Kombine görevler için en pahalı binanın maliyeti * hedef
        const maxBuildingCost = Math.max(
          ...Object.values(this.items).map((item) => item.baseCost)
        );
        difficultyScore = (maxBuildingCost * quest.target) / 50;
        break;
    }

    // Ödül miktarına göre ek zorluk puanı
    if (quest.reward.type === "donuts") {
      difficultyScore += quest.reward.amount / 1000;
    } else if (quest.reward.type === "multiplier") {
      difficultyScore += quest.reward.amount * 1000;
    }

    return difficultyScore;
  }

  // updateQuestDisplay metodunu güncelle
  updateQuestDisplay() {
    const activeContainer = document.querySelector(".quests-container.active");
    const completedContainer = document.querySelector(
      ".quests-container.completed"
    );

    // Container'ları temizle
    activeContainer.innerHTML = "";
    completedContainer.innerHTML = "";

    // Görevleri zorluk derecesine göre sırala
    const activeQuests = Object.values(this.quests)
      .filter((quest) => !quest.claimed)
      .sort((a, b) => {
        // Önce tamamlanmış görevleri en üste al
        if (a.completed && !b.completed) return -1;
        if (!a.completed && b.completed) return 1;

        // Sonra zorluk derecesine göre sırala
        const difficultyA = this.calculateQuestDifficulty(a);
        const difficultyB = this.calculateQuestDifficulty(b);
        return difficultyA - difficultyB;
      });

    const completedQuests = Object.values(this.quests)
      .filter((quest) => quest.claimed)
      .sort((a, b) => b.completionTime - a.completionTime);

    // Aktif görevleri ekle
    activeQuests.forEach((quest) => {
      const questElement = this.createQuestElement(quest);
      activeContainer.appendChild(questElement);
    });

    // Tamamlanmış görevleri ekle
    completedQuests.forEach((quest) => {
      const questElement = this.createQuestElement(quest);
      completedContainer.appendChild(questElement);
    });
  }

  updateQuestElement(element, quest) {
    const progressBar = element.querySelector(".progress-bar");
    const progressText = element.querySelector(".progress-text");
    const claimButton = element.querySelector(".claim-reward");

    const progress = (quest.progress / quest.target) * 100;

    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${this.formatNumber(
      quest.progress
    )}/${this.formatNumber(quest.target)}`;

    if (quest.completed && !quest.claimed) {
      claimButton.disabled = false;
      claimButton.textContent = "Claim Reward";
    } else if (quest.claimed) {
      claimButton.disabled = true;
      claimButton.textContent = "Completed";
    }
  }
  // createQuestElement metodunu güncelle
  createQuestElement(quest) {
    const questDiv = document.createElement("div");
    questDiv.className = "quest-item";
    questDiv.setAttribute("data-quest-id", quest.id); // Quest ID'sini ekle

    const progress = (quest.progress / quest.target) * 100;
    const rewardText =
      quest.reward.type === "donuts"
        ? `${this.formatNumber(quest.reward.amount)} donut`
        : `${quest.reward.amount.toFixed(2)}x production multiplier (${
            quest.reward.duration / 1000
          }s)`;

    questDiv.innerHTML = `
        <div class="quest-info">
            <h4>${quest.title}</h4>
            <p>${quest.description}</p>
            <div class="quest-progress">
                <div class="progress-bar" style="width: ${progress}%"></div>
                <span class="progress-text">${this.formatNumber(
                  quest.progress
                )}/${this.formatNumber(quest.target)}</span>
            </div>
            <p class="reward-text">Reward: ${rewardText}</p>
        </div>
        <button class="claim-reward" ${
          quest.completed && !quest.claimed ? "" : "disabled"
        }>
            ${
              quest.claimed
                ? "Completed"
                : quest.completed
                ? "Claim Reward"
                : "In Progress"
            }
        </button>
    `;

    const claimButton = questDiv.querySelector(".claim-reward");
    claimButton.addEventListener("click", () => {
      if (quest.completed && !quest.claimed) {
        this.claimQuestReward(quest);
      }
    });

    return questDiv;
  }
  claimQuestReward(quest) {
    if (quest.completed && !quest.claimed) {
      if (quest.reward.type === "donuts") {
        this.donutCount += quest.reward.amount;
        this.showNotification(
          `+${this.formatNumber(quest.reward.amount)} donuts earned!`
        );
      } else if (quest.reward.type === "multiplier") {
        this.activateMultiplier(quest.reward.amount, quest.reward.duration);
        this.showNotification(
          `${quest.reward.amount}x production multiplier active for ${
            quest.reward.duration / 1000
          } seconds!`
        );
      }
      quest.claimed = true;

      // Sadece ilgili quest elementini güncelle
      const questElement = document.querySelector(
        `[data-quest-id="${quest.id}"]`
      );
      if (questElement) {
        // Elementi doğru tab'a taşı
        const completedContainer = document.querySelector(
          ".quests-container.completed"
        );
        completedContainer.appendChild(questElement);

        // Buton durumunu güncelle
        const claimButton = questElement.querySelector(".claim-reward");
        claimButton.disabled = true;
        claimButton.textContent = "Completed";
      }

      this.updateDisplay();
    }
  }
  createMultiplierTimer(multiplier) {
    const timerDiv = document.createElement("div");
    timerDiv.className = "multiplier-timer";
    timerDiv.setAttribute("data-multiplier-id", multiplier.id);

    const remainingTime = Math.ceil((multiplier.endTime - Date.now()) / 1000);

    timerDiv.innerHTML = `
      <div class="multiplier-info">
        <span class="multiplier-amount">${multiplier.amount.toFixed(2)}x</span>
        <span class="multiplier-time">${remainingTime}s</span>
      </div>
      <div class="multiplier-progress">
        <div class="timer-bar"></div>
      </div>
    `;

    // Timer bar animasyonu için style ekle
    const timerBar = timerDiv.querySelector(".timer-bar");
    timerBar.style.animation = `timer-countdown ${remainingTime}s linear`;

    return timerDiv;
  }

  // activateMultiplier metodunu güncelleyelim
  activateMultiplier(amount, duration) {
    const multiplier = {
      id: Date.now(),
      amount: amount,
      endTime: Date.now() + duration,
      duration: duration,
    };

    this.activeMultipliers = this.activeMultipliers.filter(
      (m) => m.endTime > Date.now()
    );
    this.activeMultipliers.push(multiplier);

    // Her item'in production değerini güncelle
    for (let key in this.items) {
      this.items[key].production =
        this.items[key].originalProduction * this.productionMultiplier;
    }

    this.updateProductionMultiplier();

    setTimeout(() => {
      this.activeMultipliers = this.activeMultipliers.filter(
        (m) => m.id !== multiplier.id
      );
      // Multiplier bitince production değerlerini sıfırla
      for (let key in this.items) {
        this.items[key].production = this.items[key].originalProduction;
      }
      this.updateProductionMultiplier();
      this.updateDisplay();
    }, duration);
  }

  // Timer container oluşturma metodu
  createTimerContainer() {
    const container = document.createElement("div");
    container.id = "multiplier-timers";
    container.className = "multiplier-timers-container";
    document.body.appendChild(container);
    return container;
  }
  updateProductionMultiplier() {
    this.productionMultiplier = 1;

    // Aktif multiplier'ları uygula
    this.activeMultipliers.forEach((multiplier) => {
      this.productionMultiplier *= multiplier.amount;
    });

    // Üretimi güncelle
    this.updateTotalPerSecond();
    this.updateDisplay();
  }
  checkQuestProgress() {
    let questsToUpdate = new Set();

    Object.values(this.quests).forEach((quest) => {
      if (quest.completed || quest.claimed) return;

      const oldProgress = quest.progress;
      let newProgress = quest.progress;

      switch (quest.type) {
        case "production":
          newProgress = Math.floor(this.totalDonutsEarned);
          break;
        case "building":
          newProgress = this.items[quest.buildingType].count;
          break;
        case "clicks":
          newProgress = this.totalClicks;
          break;
        case "combined":
          // Tüm binaların minimum sayısını bul
          newProgress = Math.min(
            ...Object.values(this.items).map((item) => item.count)
          );
          break;
      }

      // Sadece progress değişmişse güncelle
      if (newProgress !== oldProgress) {
        quest.progress = newProgress;
        questsToUpdate.add(quest.id);

        // Eğer quest tamamlandıysa
        if (!quest.completed && quest.progress >= quest.target) {
          quest.completed = true;
          this.showNotification(`Quest completed: ${quest.title}!`);

          // Quests div'ini ve img container'ını seç
          const questsDiv = document.querySelector(".page-item#quests");
          const questsImgContainer = questsDiv.querySelector(".page-img");

          // Eğer zaten bir completed etiketi yoksa ekle
          const existingLabel = questsImgContainer.querySelector(
            ".completed-feature-label"
          );
          if (!existingLabel) {
            // Completed etiketi oluştur
            const completedLabel = document.createElement("div");
            completedLabel.className = "completed-feature-label";
            completedLabel.textContent = "Completed!";
            questsImgContainer.appendChild(completedLabel);

            // Quests div'ine tıklandığında etiketi kaldır
            const removeCompletedLabel = (e) => {
              // Eğer tıklanan element questsDiv ise
              if (e.currentTarget === questsDiv) {
                // Etiketi kaldır
                const label = questsImgContainer.querySelector(
                  ".completed-feature-label"
                );
                if (label) {
                  label.remove();
                }
                // Event listener'ı kaldır
                questsDiv.removeEventListener("click", removeCompletedLabel);
              }
            };

            // Click event listener'ı ekle
            questsDiv.addEventListener("click", removeCompletedLabel);
          }

          // Click event listener'ı ekle
          questsDiv.addEventListener("click", removeCompletedLabel);
        }
      }
    });

    if (
      questsToUpdate.size > 0 &&
      !this.questsMenu.classList.contains("hidden")
    ) {
      this.updateSpecificQuests(questsToUpdate);
    }
  }
  updateSpecificQuests(questIds) {
    questIds.forEach((questId) => {
      const quest = this.quests[questId];
      const questElement = document.querySelector(
        `[data-quest-id="${questId}"]`
      );

      if (questElement) {
        // Sadece progress ve buton durumunu güncelle
        const progressBar = questElement.querySelector(".progress-bar");
        const progressText = questElement.querySelector(".progress-text");
        const claimButton = questElement.querySelector(".claim-reward");

        const progress = (quest.progress / quest.target) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${this.formatNumber(
          quest.progress
        )}/${this.formatNumber(quest.target)}`;

        if (quest.completed && !quest.claimed) {
          claimButton.disabled = false;
          claimButton.textContent = "Claim Reward";
        }
      }
    });
  }
  // Constructor dışına eklenecek yeni metod
  showNotification(message) {
    if (message.includes("production multiplier")) {
      message = message.replace(/(\d+\.?\d*)x/, (match) => {
        const number = parseFloat(match);
        return number.toFixed(2) + "x";
      });
    }
    // Varsa eski bildirimi kaldır
    const oldNotification = document.querySelector(".quest-notification");
    if (oldNotification) {
      oldNotification.remove();
    }

    // Yeni bildirimi oluştur
    const notification = document.createElement("div");
    notification.className = "quest-notification";
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);

    // 3 saniye sonra bildirimi kaldır
    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Aktif multiplier göstergesini güncelle
  updateActiveMultiplierDisplay() {
    const activeMultiplierDisplay = document.getElementById(
      "active-multiplier-display"
    );
    if (activeMultiplierDisplay) {
      activeMultiplierDisplay.textContent = `Active Multiplier: ${this.productionMultiplier.toFixed(
        2
      )}x`;
    }
  }

  // Yeni metod: Tüm ore'ları sat
  sellAllOres() {
    let totalEarnings = 0;
    let totalOresSold = 0;

    // Tüm ore tiplerini kontrol et
    this.oreTypes.forEach((ore) => {
      const oreCount = this.ores[ore.type]?.count || 0;
      if (oreCount > 0) {
        const earnings = ore.price * oreCount;
        totalEarnings += earnings;
        totalOresSold += oreCount;
        this.ores[ore.type].count = 0;
      }
    });

    if (totalOresSold > 0) {
      this.donutCount += totalEarnings;
      this.showNotification(
        `Sold ${this.formatNumber(totalOresSold)} ores for ${this.formatNumber(
          totalEarnings
        )} donuts!`
      );
      this.updateDisplay();
      this.updateOreList();
    } else {
      this.showNotification("No ores to sell!");
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
    document.querySelector(".donut-container").addEventListener("click", () => {
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
}

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game(); // Game sınıfından bir örnek oluştur
  game.init(); // Game sınıfındaki init fonksiyonunu çağırarak oyunu başlat
  const resetButton = document.getElementById("reset-button");

  resetButton.addEventListener("click", () => {
    game.resetGame();
  });
});
document.querySelectorAll(".mobile-menu-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    // Aktif buton sınıfını güncelle
    document
      .querySelectorAll(".mobile-menu-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // İlgili paneli göster/gizle
    const target = btn.querySelector("span").textContent.toLowerCase();

    if (target === "market") {
      document.querySelector("#section-right").classList.add("mobile-active");
      document.querySelector("#quests-menu").classList.remove("mobile-active");
    } else if (target === "quests") {
      document.querySelector("#quests-menu").classList.add("mobile-active");
      document
        .querySelector("#section-right")
        .classList.remove("mobile-active");
    } else {
      // Donut seçildiğinde tüm panelleri kapat
      document
        .querySelector("#section-right")
        .classList.remove("mobile-active");
      document.querySelector("#quests-menu").classList.remove("mobile-active");
    }
  });
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
