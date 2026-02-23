(function () {
  class Game {
    constructor() {
      this.currentVersion = "1.4.6";
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
            multiplier: 3,
            purchased: false,
            requirement: 30,
            img: "cursorUpgrade-4.webp",
            description:
              "Reach deep into the void, pulling forth untapped donut-making power.",
          },
          {
            name: "Donut Cursor",
            cost: 500000,
            multiplier: 1,
            purchased: false,
            requirement: 50,
            img: "cursorUpgrade-5.webp",
            specialEffect: "dynamicBoost",
            description:
              "Your cursor gains +1 production and click power for each non-cursor building owned.",
          },
          {
            name: "Ruby Cursor",
            cost: 50000000,
            multiplier: 10,
            purchased: false,
            requirement: 100,
            img: "cursorUpgrade-6.webp",
            description: "Careful though: you might fall in love…with a cursor",
          },
          {
            name: "Verdant Precision",
            cost: 500000000,
            multiplier: 10,
            purchased: false,
            requirement: 150,
            img: "cursorUpgrade-7.webp",
            description:
              "Clicks as precise as nature itself. Fresh, green, and absolutely donut-licious!",
          },
          {
            name: "Obsidian Whisper",
            cost: 50000000000,
            multiplier: 10,
            purchased: false,
            requirement: 200,
            img: "cursorUpgrade-8.webp",
            description:
              "Harness the power of darkness to craft donuts with quiet, shadowy elegance. Shh... the donuts are listening.",
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
          {
            name: "Strawknead",
            cost: 5250000000,
            multiplier: 2,
            purchased: false,
            requirement: 150,
            img: "bakerUpgrade-6.webp",
            description:
              "A master of strawberry-infused dough, bringing a burst of berry sweetness to every donut.",
          },
          {
            name: "Chocobatch",
            cost: 525000000000,
            multiplier: 2,
            purchased: false,
            requirement: 200,
            img: "bakerUpgrade-7.webp",
            description:
              "The ultimate chocolatier, infusing your donuts with rich, velvety cocoa magic.",
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
        powerPlant: [
          {
            name: "Voltage Amplifier",
            cost: 210000000,
            multiplier: 2,
            purchased: false,
            requirement: 1,
            img: "powerPlantUpgrade-1.webp",
            description:
              "Boosts the power output of your plant, electrifying donut production to new levels.",
          },
          {
            name: "Fusion Reactor",
            cost: 1050000000,
            multiplier: 2,
            purchased: false,
            requirement: 15,
            img: "powerPlantUpgrade-2.webp",
            description:
              "A state-of-the-art reactor that harnesses fusion energy to supercharge donut generation.",
          },
          {
            name: "Plasma Conductor",
            cost: 10500000000,
            multiplier: 2,
            purchased: false,
            requirement: 30,
            img: "powerPlantUpgrade-3.webp",
            description:
              "Plasma energy flows through your plant, exponentially increasing production efficiency.",
          },
          {
            name: "Quantum Dynamo",
            cost: 105000000000,
            multiplier: 2,
            purchased: false,
            requirement: 50,
            img: "powerPlantUpgrade-4.webp",
            description:
              "Taps into quantum fields, unleashing limitless energy for donut crafting.",
          },
          {
            name: "Celestial Reactor",
            cost: 105000000000000,
            multiplier: 2,
            purchased: false,
            requirement: 100,
            img: "powerPlantUpgrade-5.webp",
            description:
              "Fueled by the energy of the stars, this reactor takes your donut empire to galactic proportions.",
          },
        ],
        nature: [
          {
            name: "Mighty Oak",
            cost: 2300000000,
            multiplier: 2,
            purchased: false,
            requirement: 1,
            img: "natureUpgrade-1.webp",
            description:
              "This majestic oak tree symbolizes strength and stability, doubling your nature's donut yield.",
          },
          {
            name: "Whispering Pine",
            cost: 11500000000,
            multiplier: 2,
            purchased: false,
            requirement: 15,
            img: "natureUpgrade-2.webp",
            description:
              "The soothing presence of pine trees enhances your production with nature's whisper.",
          },
          {
            name: "Paradise Palm",
            cost: 115000000000,
            multiplier: 2,
            purchased: false,
            requirement: 30,
            img: "natureUpgrade-3.webp",
            description:
              "Bring the tropical vibes with a palm tree that boosts your donuts in a breezy way.",
          },
          {
            name: "Evergreen Spruce",
            cost: 1150000000000,
            multiplier: 2,
            purchased: false,
            requirement: 50,
            img: "natureUpgrade-4.webp",
            description:
              "A symbol of eternal growth, spruce trees inspire endless donut production.",
          },
          {
            name: "Eternal Eucalyptus",
            cost: 115000000000000,
            multiplier: 2,
            purchased: false,
            requirement: 100,
            img: "natureUpgrade-5.webp",
            description:
              "Harness the calming power of eucalyptus to take your nature-driven empire to tranquil heights.",
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
          {
            name: "Auto Catcher",
            cost: 1,
            multiplier: 0.2, // %20 yakalama şansı
            purchased: false,
            requirement: 1,
            img: "autoCatcher.webp",
            specialEffect: "automation",
            description:
              "Automatically catches falling donuts with 20% chance!",
          },
        ],
        donutUpgrades: [
          {
            name: "Sweet Loop",
            cost: 250000,
            multiplier: 1.03,
            purchased: false,
            requirement: 50000,
            img: "donutUpgrade-6.webp",
            description: "So sweet it bends time. Maybe.",
            type: "totalProduced",
          },
          {
            name: "Berry Burst",
            cost: 250000,
            multiplier: 1.03,
            purchased: false,
            requirement: 150000,
            img: "donutUpgrade-5.webp",
            description: "Explodes in flavor, not in your hand.",
            type: "perSecond",
          },
          {
            name: "Caramel Crown",
            cost: 1000000,
            multiplier: 1.03,
            purchased: false,
            requirement: 500000,
            img: "donutUpgrade-4.webp",
            description: "Wear it like a king. Eat it like a fool.",
            type: "totalProduced",
          },
          {
            name: "Berry Bliss",
            cost: 1000000,
            multiplier: 1.03,
            purchased: false,
            requirement: 100,
            img: "donutUpgrade-3.webp",
            description:
              "Packed with so much blueberry, it might start singing jazz.",
            type: "perSecond",
          },
          {
            name: "Matcha Swirl",
            cost: 5000000,
            multiplier: 1.03,
            purchased: false,
            requirement: 1000,
            img: "donutUpgrade-2.webp",
            description: "So zen, it might start meditating on its own.",
            type: "totalProduced",
          },
          {
            name: "Banana Bounce",
            cost: 5000000,
            multiplier: 1.03,
            purchased: false,
            requirement: 7500,
            img: "donutUpgrade-1.webp",
            description: "Bounces back with more potassium.",
            type: "perSecond",
          },
        ],
      };
      this.items = {
        cursor: {
          name: "Cursor",
          count: 0,
          baseCost: 15,
          originalBaseCost: 15,
          costMultiplier: 1.15,
          production: 0.1,
          originalProduction: 0.1,
          totalProduced: 0,
        },
        baker: {
          name: "Baker",
          count: 0,
          baseCost: 115,
          originalBaseCost: 115,
          costMultiplier: 1.155,
          production: 1,
          originalProduction: 1,
          totalProduced: 0,
        },
        farm: {
          name: "Farm",
          count: 0,
          baseCost: 1400,
          originalBaseCost: 1400,
          costMultiplier: 1.15,
          production: 7,
          originalProduction: 7,
          totalProduced: 0,
        },
        mine: {
          name: "Mine",
          count: 0,
          baseCost: 16000,
          originalBaseCost: 16000,
          costMultiplier: 1.16,
          production: 50,
          originalProduction: 50,
          totalProduced: 0,
        },
        factory: {
          name: "Factory",
          count: 0,
          baseCost: 176000,
          originalBaseCost: 176000,
          costMultiplier: 1.16,
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
          costMultiplier: 1.16,
          production: 8000,
          originalProduction: 8000,
          totalProduced: 0,
        },
        nature: {
          name: "Nature",
          count: 0,
          baseCost: 230800850,
          originalBaseCost: 230800850,
          costMultiplier: 1.16,
          production: 46000,
          originalProduction: 46000,
          totalProduced: 0,
        },
        neuralNetworkBakery: {
          name: "Neural Network Bakery",
          count: 0,
          baseCost: 2525256900,
          originalBaseCost: 2525256900,
          costMultiplier: 1.16,
          production: 270500,
          originalProduction: 270500,
          totalProduced: 0,
        },
        portal: {
          name: "Portal",
          count: 0,
          baseCost: 27650200500,
          originalBaseCost: 27650200500,
          costMultiplier: 1.16,
          production: 1800000,
          originalProduction: 1800000,
          totalProduced: 0,
        },
        capitalCrest: {
          name: "Capital Crest",
          count: 0,
          baseCost: 302924200000,
          originalBaseCost: 302924200000,
          costMultiplier: 1.16,
          production: 10980000,
          originalProduction: 10980000,
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
      this.lastBakerProduction = Date.now(); // Baker üretimi için son üretim zamanı
      this.lastMineProduction = Date.now(); // Mine üretimi için son üretim zaman
      this.lastFarmTick = Date.now();
      this.productionMultiplier = 1;

      // ---- Farm Panel State ----
      this.farmAnimalDefs = {
        chicken: { name: "Chicken", good: "egg", prodInterval: 45, baseCost: 1500, costMult: 1.22, baseSellPrice: 60, storageCap: 30, unlockFC: 1 },
        cow:     { name: "Cow",     good: "milk", prodInterval: 90, baseCost: 15000, costMult: 1.25, baseSellPrice: 350, storageCap: 18, unlockFC: 5 },
        sheep:   { name: "Sheep",   good: "wool", prodInterval: 150, baseCost: 75000, costMult: 1.28, baseSellPrice: 1800, storageCap: 12, unlockFC: 10 },
        bees:    { name: "Bees",    good: "honey", prodInterval: 30, baseCost: 600000, costMult: 1.30, baseSellPrice: 500, storageCap: 10, unlockFC: 25 },
        pigs:    { name: "Pigs",    good: "truffle", prodInterval: 300, baseCost: 6000000, costMult: 1.35, baseSellPrice: 5000, storageCap: 8, unlockFC: 40 },
      };
      this.farmTraitDefs = [
        // Common traits (10)
        { id: "well_fed", name: "Well-Fed", rarity: "common", effect: { type: "prodSpeed", value: 0.08 } },
        { id: "hardy", name: "Hardy", rarity: "common", effect: { type: "feedCost", value: -0.10 } },
        { id: "early_riser", name: "Early Riser", rarity: "common", effect: { type: "prodSpeed", value: 0.05 } },
        { id: "thick_coat", name: "Thick Coat", rarity: "common", effect: { type: "sellPrice", value: 0.06 } },
        { id: "calm", name: "Calm", rarity: "common", effect: { type: "careBonus", value: 0.10 } },
        { id: "social", name: "Social", rarity: "common", effect: { type: "socialProd", value: 0.03, max: 0.15 } },
        { id: "alert", name: "Alert", rarity: "common", effect: { type: "careWindowDuration", value: 5 } },
        { id: "sturdy", name: "Sturdy", rarity: "common", effect: { type: "breedCooldown", value: -0.15 } },
        { id: "keen_eye", name: "Keen Eye", rarity: "common", effect: { type: "crateChance", value: 0.05 } },
        { id: "generous", name: "Generous", rarity: "common", effect: { type: "bonusGood", value: 10 } },
        // Rare traits (6)
        { id: "golden_touch", name: "Golden Touch", rarity: "rare", effect: { type: "sellPrice", value: 0.15 } },
        { id: "prolific", name: "Prolific", rarity: "rare", effect: { type: "prodSpeed", value: 0.12 } },
        { id: "efficient", name: "Efficient", rarity: "rare", effect: { type: "feedCost", value: -0.25 } },
        { id: "mentor", name: "Mentor", rarity: "rare", effect: { type: "mentorTrait", value: 1 } },
        { id: "tireless", name: "Tireless", rarity: "rare", effect: { type: "storageCap", value: 0.20 } },
        { id: "diplomat", name: "Diplomat", rarity: "rare", effect: { type: "contractReq", value: -0.10 } },
        // Epic traits (2)
        { id: "legendary_producer", name: "Legendary Producer", rarity: "epic", effect: { type: "legendaryProd", prodSpeed: 0.25, sellPrice: 0.10 } },
        { id: "contract_star", name: "Contract Star", rarity: "epic", effect: { type: "contractStar", contractSpeed: 0.20, buffDuration: 0.15 } },
      ];
      this.farmBreedPrograms = {
        quick:    { name: "Quick",    duration: 1800, costMult: 3, traitSlots: 2, rareBonus: 0 },
        standard: { name: "Standard", duration: 7200, costMult: 5, traitSlots: 2, rareBonus: 0.05 },
        long:     { name: "Long",     duration: 14400, costMult: 8, traitSlots: 3, rareBonus: 0.10 },
      };
      this.farmContractNames = {
        rush: ["Quick Delivery", "Express Order", "Urgent Supply", "Speed Run", "Flash Sale"],
        standard: ["Bakery Supply Run", "Breakfast Feast", "Market Day", "Village Order", "Festival Prep", "Kitchen Restock"],
        longhaul: ["Grand Feast", "Royal Banquet", "Harvest Festival", "Winter Stockpile", "Merchant Caravan", "Export Contract"],
      };
      this.farmAffixDefs = [
        { id: "urgent", name: "Urgent", rarity: 0.25, effect: { durationMult: 0.7, rewardMult: 0.8 } },
        { id: "generous", name: "Generous", rarity: 0.15, effect: { rewardMult: 1.4 } },
        { id: "demanding", name: "Demanding", rarity: 0.15, effect: { reqMult: 1.5, rewardMult: 1.6 } },
        { id: "focused", name: "Focused", rarity: 0.20, effect: { singleGood: true, buffDurationMult: 1.2 } },
        { id: "volatile", name: "Volatile", rarity: 0.08, effect: { volatileReward: true } },
        { id: "vip", name: "VIP", rarity: 0.07, effect: { buffStrengthMult: 1.3 }, masteryReq: 8 },
        { id: "chain", name: "Chain", rarity: 0.06, effect: { chain: true, chainRewardMult: 1.5 } },
        { id: "legendary", name: "Legendary", rarity: 0.04, effect: { rewardMult: 1.8, reqMult: 3, reqGoods: 2 } },
      ];
      this.farmBuffCategories = {
        PROD:    { baseStrength: 1.05, baseDuration: 300 },
        COST:    { baseStrength: 0.92, baseDuration: 300 },
        OFFLINE: { baseStrength: 1.5,  baseDuration: 600 },
        QOL:     { baseStrength: 1,    baseDuration: 600 },
        EVENT:   { baseStrength: 1,    baseDuration: 180 },
      };
      this.farmVariants = {
        chicken: [
          { name: "Silkie", effect: { prodSpeed: 0.10 } },
          { name: "Golden", effect: { sellPrice: 0.20 } },
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
          { name: "Bumblebee", effect: { prodSpeed: 0.20 } },
          { name: "Royal", effect: { sellPrice: 0.30 } },
          { name: "Crystal", effect: { traitSlot: 1 } },
        ],
        pigs: [
          { name: "Iberian", effect: { prodSpeed: 0.20 } },
          { name: "Truffle King", effect: { sellPrice: 0.30 } },
          { name: "Shadow", effect: { traitSlot: 1 } },
        ],
      };
      this.farmPassports = [
        { id: "nomad", name: "Nomad", effect: { breedCooldown: -0.50 } },
        { id: "artisan", name: "Artisan", effect: { contractContrib: 0.20 } },
        { id: "merchant", name: "Merchant", effect: { sellPrice: 0.30 } },
        { id: "pioneer", name: "Pioneer", effect: { prodSpeed: 0.20 } },
        { id: "scholar", name: "Scholar", effect: { inheritBest: true } },
        { id: "golden", name: "Golden", effect: { allEffects: 0.10 } },
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
      this.bakerProductionInterval = 18000;
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
      this.workers = []; // İşçi listesi
      this.isBuying = false; // Şu an alım mı yapılıyor
      this.isSelling = false; // Şu an satım mı yapılıyor
      this.setupMarketButtons();
      this.updateInterval = 250;
      this.donut = document.getElementById("donut");
      this.counter = document.getElementById("donut-count");
      this.perSecondDisplay = document.getElementById("per-second");
      this.setupModal();
      this.setupStoreHover();
      this.totalPerSecond = 0;
      this.updateTotalPerSecond(); // Başlangıçta hesapla
      this.currentBakeryName = "";
      this.BUILDING_COST_MULTIPLIER = 1.15;
      this.PRESTIGE_BUILDING_COST_MULTIPLIER_INCREMENT = 1.45;
      this.UPGRADE_COST_MULTIPLIER = 1.45;
      this.prestigeCount = 0;
      this.nextPrestigeThreshold = 300000000;
      this.prestigeMultiplier = 2;
      this.setupPrestigeModal();

      setInterval(() => this.updatePrestigeBar(), this.updateInterval);

      this.updateDisplay();
      this.clickSounds.forEach((sound) => {
        sound.volume = 0.1;
      });
      this.questPagination = {
        itemsPerPage: 5,
        currentPage: 1,
        totalPages: 1,
      };
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
      this.cachedBuildingCount = 0;
      this.lastBuildingUpdate = 0;

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
      this.frameThrottle = 1000 / 60; // 60 FPS hedefi
      this.accumulatedTime = 0;

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
    }

    // Resim önbellekleme sistemi
    preloadImages() {
      const imagesToPreload = [
        // Donut görselleri
        "donutNew.webp",
        "donutSign1.webp",
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

    init() {
      // DOM Elemanlarını önbelleğe al
      this.cacheElements();

      // Önce resimleri yükle
      this.preloadImages();
      this.initializeComboSystem();
      this.loadGame();
      this.updateBakeryName();
      this.setupDonutCoin();

      // Zamanlayıcıları optimize et
      setInterval(this._throttle(this.saveGame.bind(this), 60000), 180000);
      setInterval(
        this._throttle(this.updateTitleWithDonuts.bind(this), 500),
        1000,
      );
      setInterval(
        this._throttle(() => this.updateStatsDisplay(), 1000),
        5000,
      );
      setInterval(this._throttle(this.updateProduction.bind(this), 100), 225);

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
      this.setupFeedbackPopup();

      this.setupAutoBuyer();

      // Store görünürlüğünü hemen ayarla (RAF beklemeden)
      this.updateStoreVisibility();
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

    updateDisplay() {
      // Performans optimizasyonu için RAF kullan
      if (!this._displayUpdateScheduled) {
        this._displayUpdateScheduled = true;
        requestAnimationFrame(() => {
          this._actualUpdateDisplay();
          this._displayUpdateScheduled = false;
        });
      }
    }
    _actualUpdateDisplay() {
      this.renderFrameCount++;
      const isSlowFrame = this.renderFrameCount % 10 === 0;

      if (isSlowFrame) {
        this.updateStoreVisibility();
      }

      const counter = this.domCache.get("counter");
      const perSecondDisplay = this.domCache.get("perSecondDisplay");
      if (!counter || !perSecondDisplay) return;

      // Donut sayısı güncelleme (sadece değiştiyse)
      const currentDonutCount = Math.floor(this.donutCount);
      if (this.lastUpdateValues.donutCount !== currentDonutCount) {
        const formattedDonuts = this.formatNumber(this.donutCount, "count");
        counter.textContent = `${formattedDonuts} donuts`;
        this.lastUpdateValues.donutCount = currentDonutCount;
      }

      // Per second güncelleme
      const currentPerSecond = Math.floor(this.totalPerSecond * 10) / 10;
      const multiplierCount = this.activeMultipliers?.length || 0;

      if (
        this.lastUpdateValues.totalPerSecond !== currentPerSecond ||
        this.lastUpdateValues.multiplierCount !== multiplierCount ||
        isSlowFrame
      ) {
        const formattedPerSecond = this.formatNumber(
          this.totalPerSecond,
          "perSecond",
        );

        if (this.productionMultiplier > 1 && multiplierCount > 0) {
          // Multiplier aktifken her frame (veya sık) güncelleme gerekebilir (timer için)
          this.activeMultipliers = this.activeMultipliers.filter(
            (m) => m.endTime > Date.now(),
          );

          if (this.activeMultipliers.length === 0) {
            this.productionMultiplier = 1;
            perSecondDisplay.textContent = `per second: ${formattedPerSecond}`;
            perSecondDisplay.classList.remove("boosted");
          } else {
            const nearestEndTime = Math.min(
              ...this.activeMultipliers.map((m) => m.endTime),
            );
            const remainingTime = Math.max(
              0,
              Math.ceil((nearestEndTime - Date.now()) / 1000),
            );
            const currentMultiplier = this.activeMultipliers[0];
            const progress =
              (remainingTime / (currentMultiplier.duration / 1000)) * 100;

            perSecondDisplay.innerHTML = `
            <div class="boosted-per-second">
                <div class="per-second-text">per second: ${formattedPerSecond}</div>
                <div class="boost-container">
                    <div class="boost-info">
                        <span class="boost-multiplier">${this.productionMultiplier.toFixed(2)}x</span>
                        <span class="boost-timer">${remainingTime}s</span>
                    </div>
                    <div class="boost-progress-bar">
                        <div class="boost-progress" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>
          `;
            perSecondDisplay.classList.add("boosted");
          }
        } else {
          perSecondDisplay.textContent = `per second: ${formattedPerSecond}`;
          perSecondDisplay.classList.remove("boosted");
        }

        this.lastUpdateValues.totalPerSecond = currentPerSecond;
        this.lastUpdateValues.multiplierCount = multiplierCount;
      }

      // Building güncellemeleri
      for (let key in this.items) {
        const item = this.items[key];
        const bulkCost = this.calculateBulkPrice(item, this.purchaseAmount);
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
    }
    updateTotalPerSecond() {
      let basePerSecond = 0;
      let itemProductions = {};

      // Tüm itemların üretimini hesapla
      for (let key in this.items) {
        let itemProduction = 0;

        if (key === "cursor") {
          // Cursor için özel hesaplama
          let cursorProduction = this.items.cursor.originalProduction;
          let normalMultiplier = 1;
          let x10Multiplier = 1;

          // Normal multiplier'ları hesapla
          this.upgrades.cursor.forEach((upgrade) => {
            if (upgrade.purchased && !upgrade.specialEffect) {
              if (
                upgrade === this.upgrades.cursor[5] || // Ruby Cursor
                upgrade === this.upgrades.cursor[6] || // Verdant Precision
                upgrade === this.upgrades.cursor[7]
              ) {
                // Obsidian Whisper
                x10Multiplier *= 10;
              } else {
                normalMultiplier *= upgrade.multiplier;
              }
            }
          });

          // Önce dinamik boost'u ekle (base production'a)
          const dynamicBoostUpgrade = this.upgrades.cursor[4];
          if (dynamicBoostUpgrade.purchased) {
            let buildingBoost = 0;
            for (let buildingKey in this.items) {
              if (buildingKey !== "cursor") {
                buildingBoost += this.items[buildingKey].count;
              }
            }
            cursorProduction += buildingBoost; // Base production'a ekle
          }

          // Sonra normal multiplier'ları uygula
          cursorProduction *= normalMultiplier;

          // En son x10 multiplier'ları uygula
          cursorProduction *= x10Multiplier;

          // Multiplier etkisini ekle
          if (this.activeMultipliers && this.activeMultipliers.length > 0) {
            cursorProduction *= this.productionMultiplier;
          }

          this.items.cursor.production = cursorProduction;
          itemProduction = this.items.cursor.count * cursorProduction;
        } else {
          // Diğer binalar için hesaplama
          let baseProduction = this.items[key].originalProduction;

          // Farm ve Mine için bonus hesaplamaları
          if (key === "farm") {
            const classicDonut = this.recipes["Classic Donut"];
            if (classicDonut?.craftCount > 0) {
              const farmBonus =
                classicDonut.effects.farm.productionBonus *
                classicDonut.craftCount;
              baseProduction = baseProduction * (1 + farmBonus);
            }
          } else if (key === "mine") {
            const whiteMagicDonut = this.recipes["White Magic Donut"];
            if (whiteMagicDonut?.craftCount > 0) {
              const mineBonus =
                whiteMagicDonut.effects.mine.productionBonus *
                whiteMagicDonut.craftCount;
              baseProduction = baseProduction * (1 + mineBonus);
            }
          }

          // Aktif multiplier varsa uygula
          if (this.activeMultipliers && this.activeMultipliers.length > 0) {
            baseProduction *= this.productionMultiplier;
          }

          this.items[key].production = baseProduction;
          itemProduction = this.items[key].count * baseProduction;
        }

        itemProductions[key] = itemProduction;
        basePerSecond += itemProduction;
      }

      // Donut upgrade'lerinden gelen toplam üretim bonusunu uygula
      if (this.upgrades.donutUpgrades) {
        this.upgrades.donutUpgrades.forEach((upgrade) => {
          if (upgrade.purchased && upgrade.type === "totalProduced") {
            basePerSecond *= upgrade.multiplier;
          }
        });
      }

      // Farm mastery level 20 bonus: +5% CpS
      if (this.farmState && this.farmState.mastery.level >= 20) {
        basePerSecond *= 1.05;
      }
      // Farm COST buff: reduce effective cost (reflected as production boost here)
      if (this.farmState && this.farmState.buffs.PROD && this.farmState.buffs.PROD.remaining > 0) {
        // PROD buff already applied per-animal in farm tick, this is for main game CpS
        // Only apply if mastery >= certain level to make it meaningful
      }

      this.totalPerSecond = basePerSecond;
      return itemProductions;
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

      // Pahalı hesaplamaları throttle et
      if (this.renderFrameCount % 5 === 0) {
        this.updateTotalPerSecond();
        this.checkQuestProgress();
        this.checkAutoBuyer();
        this.updatePrestigeBar();
      }

      this.updateDisplay();

      // Farm production tick
      this.tickFarm(deltaTime);
      // Farm display update (throttled — faster for contracts tab)
      const farmUpdateInterval = (this.farmActiveTab === "contracts" || this.farmActiveTab === "breeding") ? 4 : 15;
      if (this.renderFrameCount % farmUpdateInterval === 0) {
        this.updateFarmDisplay();
      }

      // Mine ve Baker üretimi zamanlayıcıları
      const mineElapsedTime = currentTime - this.lastMineProduction;
      const bakerElapsedTime = currentTime - this.lastBakerProduction;

      // Mine üretimi kontrolü (60 saniye)
      if (mineElapsedTime >= 60000) {
        this.produceMineResources();
        this.updateMarketPrices();
        this.lastMineProduction = currentTime;
      }

      // Baker üretimi kontrolü (180 saniye)
      if (bakerElapsedTime >= 180000) {
        this.produceBakerResources();
        this.lastBakerProduction = currentTime;
      }

      // Timer DOM güncellemeleri
      const mineTimer = this.domCache.get("mineTimer");
      if (mineTimer) {
        const mineRemainingTime = Math.ceil((60000 - mineElapsedTime) / 1000);
        if (mineTimer.textContent !== String(Math.max(0, mineRemainingTime))) {
          mineTimer.textContent = Math.max(0, mineRemainingTime);
          mineTimer.classList.toggle("almost-ready", mineRemainingTime <= 10);
        }
      }

      const bakerTimer = this.domCache.get("bakerTimer");
      if (bakerTimer) {
        const bakerRemainingTime = Math.ceil(
          (180000 - bakerElapsedTime) / 1000,
        );
        if (
          bakerTimer.textContent !== String(Math.max(0, bakerRemainingTime))
        ) {
          bakerTimer.textContent = Math.max(0, bakerRemainingTime);
          bakerTimer.classList.toggle("almost-ready", bakerRemainingTime <= 10);
        }
      }
    }

    // Üretim metodları
    produceMineResources() {
      if (this.items.mine.count <= 0) return;

      const workerCount = this.workers.length;
      const orePerWorker = 5; // Her işçi için 5 ore

      for (let i = 0; i < workerCount; i++) {
        let remainingOres = orePerWorker;

        while (remainingOres > 0) {
          const randomNum = Math.random();
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

    produceBakerResources() {
      if (this.items.baker.count <= 0) return;

      const bakerCount = this.items.baker.count;

      for (let i = 0; i < bakerCount; i++) {
        const randomNum = Math.random();
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

      this.updateIngredientList();
    }

    // ============================================
    // FARM PANEL — Full System
    // ============================================

    createDefaultFarmState() {
      return {
        farmVersion: 1,
        animals: [],
        storage: { egg: 0, milk: 0, wool: 0, honey: 0, truffle: 0 },
        feedPlans: { chicken: "standard", cow: "standard", sheep: "standard", bees: "standard", pigs: "standard" },
        contracts: { board: [], active: [], lastRefresh: 0, rerollsUsed: 0 },
        breeding: {
          slots: [
            { active: false, parentA: null, parentB: null, program: "quick", progress: 0, duration: 0 },
            { active: false, parentA: null, parentB: null, program: "quick", progress: 0, duration: 0 },
          ],
        },
        mastery: { xp: 0, level: 0 },
        buffs: { PROD: null, COST: null, OFFLINE: null, QOL: null, EVENT: null },
        careWindow: { nextTrigger: Date.now() + 720000, active: false, expiresAt: 0, lateUntil: 0 },
        careBonus: { modifier: 1, cyclesRemaining: 0 },
        crates: [],
        rumors: { active: null },
        stats: { totalGoodsSold: 0, totalContractsCompleted: 0, totalBred: 0 },
        lastFarmTick: Date.now(),
      };
    }

    getFarmCount() {
      return this.items.farm.count;
    }

    getEffectiveStorageCap(good) {
      const animalType = Object.keys(this.farmAnimalDefs).find(k => this.farmAnimalDefs[k].good === good);
      if (!animalType) return 30;
      const baseCap = this.farmAnimalDefs[animalType].storageCap;
      const masteryBonus = this.farmState.mastery.level * 5;
      let cap = baseCap + masteryBonus;
      // Tireless trait bonus per animal
      const animals = this.farmState.animals.filter(a => a.type === animalType);
      for (const animal of animals) {
        if (animal.traits.includes("tireless")) {
          cap = Math.ceil(cap * 1.20);
          break; // only once per good
        }
      }
      return cap;
    }

    getAnimalCost(type) {
      const def = this.farmAnimalDefs[type];
      const owned = this.farmState.animals.filter(a => a.type === type).length;
      return Math.floor(def.baseCost * Math.pow(def.costMult, owned));
    }

    getSellPrice(good) {
      const animalType = Object.keys(this.farmAnimalDefs).find(k => this.farmAnimalDefs[k].good === good);
      if (!animalType) return 0;
      const def = this.farmAnimalDefs[animalType];
      let price = def.baseSellPrice * (1 + 0.08 * this.getFarmCount());
      // Mastery sell bonuses
      const ml = this.farmState.mastery.level;
      if (ml >= 3) price *= 1.05;
      if (ml >= 10) price *= 1.10;
      if (ml >= 19) price *= 1.20;
      // Trait sell bonuses from animals of this type
      const animals = this.farmState.animals.filter(a => a.type === animalType);
      for (const animal of animals) {
        for (const traitId of animal.traits) {
          const tdef = this.farmTraitDefs.find(t => t.id === traitId);
          if (tdef && tdef.effect.type === "sellPrice") price *= (1 + tdef.effect.value);
          if (tdef && tdef.effect.type === "legendaryProd") price *= (1 + tdef.effect.sellPrice);
        }
        // Variant sell bonus
        if (animal.variant) {
          const vdefs = this.farmVariants[animalType];
          const vdef = vdefs ? vdefs.find(v => v.name === animal.variant) : null;
          if (vdef && vdef.effect.sellPrice) price *= (1 + vdef.effect.sellPrice);
        }
        // Passport sell bonus
        if (animal.passport === "merchant") price *= 1.30;
        if (animal.passport === "golden") price *= 1.10;
      }
      // PROD buff sell boost doesn't apply to sell prices per spec, only prod buff
      return Math.floor(price);
    }

    getProductionModifier(animalType) {
      let mod = 1;
      const feedPlan = this.farmState.feedPlans[animalType] || "standard";
      if (feedPlan === "ration") mod *= 0.7;
      else if (feedPlan === "premium") mod *= 1.4;
      // Mastery production bonuses
      const ml = this.farmState.mastery.level;
      if (ml >= 5) mod *= 1.10;
      if (ml >= 14) mod *= 1.15;
      // Care bonus
      if (this.farmState.careBonus.cyclesRemaining > 0) {
        mod *= this.farmState.careBonus.modifier;
      }
      // PROD buff
      const prodBuff = this.farmState.buffs.PROD;
      if (prodBuff && prodBuff.remaining > 0) {
        mod *= prodBuff.strength;
      }
      // Trait bonuses
      const animals = this.farmState.animals.filter(a => a.type === animalType);
      let traitProdBonus = 0;
      for (const animal of animals) {
        for (const traitId of animal.traits) {
          const tdef = this.farmTraitDefs.find(t => t.id === traitId);
          if (!tdef) continue;
          if (tdef.effect.type === "prodSpeed") traitProdBonus += tdef.effect.value;
          if (tdef.effect.type === "legendaryProd") traitProdBonus += tdef.effect.prodSpeed;
          if (tdef.effect.type === "socialProd") {
            const sameCount = animals.length;
            traitProdBonus += Math.min(tdef.effect.value * (sameCount - 1), tdef.effect.max);
          }
        }
        // Variant production bonus
        if (animal.variant) {
          const vdefs = this.farmVariants[animalType];
          const vdef = vdefs ? vdefs.find(v => v.name === animal.variant) : null;
          if (vdef && vdef.effect.prodSpeed) traitProdBonus += vdef.effect.prodSpeed;
        }
        // Passport production bonus
        if (animal.passport === "pioneer") traitProdBonus += 0.20;
        if (animal.passport === "golden") traitProdBonus += 0.10;
      }
      // Average the trait bonuses across all animals of this type
      if (animals.length > 0) {
        mod *= (1 + traitProdBonus / animals.length);
      }
      return mod;
    }

    // --- Core production tick ---
    tickFarm(deltaSeconds) {
      const fc = this.getFarmCount();
      if (fc < 1) return;

      const fs = this.farmState;

      // 1. Produce goods per animal type
      try {
        for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
          const animals = fs.animals.filter(a => a.type === type);
          if (animals.length === 0) continue;
          const good = def.good;
          const cap = this.getEffectiveStorageCap(good);
          if (fs.storage[good] >= cap) continue;

          const baseRate = 1 / def.prodInterval;
          const prodMod = this.getProductionModifier(type);
          const totalRate = animals.length * baseRate * prodMod;
          const produced = totalRate * deltaSeconds;
          fs.storage[good] = Math.min(fs.storage[good] + produced, cap);
        }
      } catch (e) { console.error("[Farm] production error:", e); }

      // 2. Feed costs
      try { this.applyFarmFeedCosts(deltaSeconds); }
      catch (e) { console.error("[Farm] feed cost error:", e); }

      // 3. Care window
      try { this.tickCareWindow(Date.now()); }
      catch (e) { console.error("[Farm] care window error:", e); }

      // 4. Contract refresh
      try { this.tickContractRefresh(Date.now()); }
      catch (e) { console.error("[Farm] contract refresh error:", e); }

      // 5. Progress active contracts
      try { this.tickActiveContracts(deltaSeconds); }
      catch (e) { console.error("[Farm] active contracts error:", e); }

      // 6. Breeding
      try { this.tickBreeding(deltaSeconds); }
      catch (e) { console.error("[Farm] breeding error:", e); }

      // 7. Buff expiry
      try { this.tickBuffExpiry(deltaSeconds); }
      catch (e) { console.error("[Farm] buff expiry error:", e); }

      // 8. Auto-collect (FC 60 + Mastery 13)
      try { this.tickAutoCollect(); }
      catch (e) { console.error("[Farm] auto-collect error:", e); }

      // 9. Care bonus cycle tracking
      if (fs.careBonus && fs.careBonus.cyclesRemaining > 0) {
        // Decrement based on total production cycles completed
      }
    }

    getFeedCostPerSecond(type) {
      const def = this.farmAnimalDefs[type];
      const fs = this.farmState;
      const plan = fs.feedPlans[type] || "standard";
      if (plan === "standard") return 0;
      const animals = fs.animals.filter(a => a.type === type);
      if (animals.length === 0) return 0;

      // Base cost: flat rate from animal price (meaningful early game)
      const costPercent = plan === "ration" ? 0.005 : 0.02;
      const baseCost = (def.baseCost * costPercent * animals.length) / def.prodInterval;

      // CpS-scaled cost: % of total income (meaningful late game)
      // Ration: 0.08% CpS per type (5 types all ration = 0.4% total)
      // Premium: 0.35% CpS per type (5 types all premium = 1.75% total)
      const cpsPercent = plan === "ration" ? 0.0008 : 0.0035;
      const scaledCost = (this.totalPerSecond || 0) * cpsPercent;

      // Efficient trait reduces feed cost
      let feedDiscount = 0;
      for (const animal of animals) {
        for (const traitId of animal.traits) {
          const tdef = this.farmTraitDefs.find(t => t.id === traitId);
          if (tdef && tdef.effect.type === "feedCost") feedDiscount += tdef.effect.value;
        }
      }
      // feedDiscount is negative (e.g. -0.10, -0.25), cap at -50%
      feedDiscount = Math.max(feedDiscount, -0.50);

      return Math.max(baseCost, scaledCost) * (1 + feedDiscount);
    }

    applyFarmFeedCosts(deltaSeconds) {
      const fs = this.farmState;
      for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
        const plan = fs.feedPlans[type];
        if (plan === "standard") continue;
        const costPerSecond = this.getFeedCostPerSecond(type);
        if (costPerSecond <= 0) continue;
        const totalCost = costPerSecond * deltaSeconds;
        if (this.donutCount >= totalCost) {
          this.donutCount -= totalCost;
        } else {
          fs.feedPlans[type] = "standard";
          this._forceBarnFullRender();
          this.showFarmNotification("Not enough donuts for " + plan + " feed. Switched to Standard.");
        }
      }
    }

    tickCareWindow(now) {
      const fs = this.farmState;
      const fc = this.getFarmCount();
      if (fc < 10) return; // Care windows unlock at FC 10
      if (fs.careWindow.active) {
        if (now > fs.careWindow.expiresAt) {
          fs.careWindow.active = false;
          fs.careWindow.nextTrigger = now + 720000;
          fs.careWindow.lateUntil = now + 180000;
          const overlay = document.getElementById("farm-care-overlay");
          if (overlay) overlay.classList.add("hidden");
        }
        return;
      }
      if (now >= fs.careWindow.nextTrigger && !fs.careWindow.active) {
        fs.careWindow.active = true;
        fs.careWindow.expiresAt = now + 90000;
        this.showFarmNotification("Care Window available!");
        const overlay = document.getElementById("farm-care-overlay");
        if (overlay) overlay.classList.remove("hidden");
      }
    }

    performCareAction(action) {
      const fs = this.farmState;
      if (!fs.careWindow.active && Date.now() <= fs.careWindow.lateUntil) {
        // Late actions
        if (action === "pet") {
          fs.careBonus = { modifier: 1.10, cyclesRemaining: 1 };
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
            fs.careBonus = { modifier: 1.40, cyclesRemaining: 3 };
          }
        }
        this.gainMasteryXP(15);
      }
      // Calm trait bonus
      const hasCalm = fs.animals.some(a => a.traits.includes("calm"));
      if (hasCalm) {
        fs.careBonus.modifier *= 1.10;
      }
      const overlay = document.getElementById("farm-care-overlay");
      if (overlay) overlay.classList.add("hidden");
      fs.careWindow.active = false;
      fs.careWindow.nextTrigger = Date.now() + 720000;
    }

    tickContractRefresh(now) {
      const fs = this.farmState;
      const fc = this.getFarmCount();
      if (fc < 5) return;
      if (now - fs.contracts.lastRefresh >= 600000 || fs.contracts.board.length === 0) {
        this.generateContractBoard();
        fs.contracts.lastRefresh = now;
        fs.contracts.rerollsUsed = 0;
      }
    }

    generateContractBoard() {
      const fc = this.getFarmCount();
      const ml = this.farmState.mastery.level;
      const board = [];
      // Rush contracts (2 slots, unlock at FC 5)
      if (fc >= 5) {
        for (let i = 0; i < 2; i++) board.push(this.generateContract("rush", fc, ml));
      }
      // Standard contracts (3 slots, unlock at FC 10)
      if (fc >= 10) {
        for (let i = 0; i < 3; i++) board.push(this.generateContract("standard", fc, ml));
      }
      // Long haul (2 slots, unlock at FC 25)
      if (fc >= 25) {
        for (let i = 0; i < 2; i++) board.push(this.generateContract("longhaul", fc, ml));
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
        duration = 180 + Math.floor(Math.random() * 120); // 3-5min
        reqCount = 2 + Math.floor(Math.random() * 4); // low qty
        goodCount = 1;
      } else if (type === "standard") {
        duration = 480 + Math.floor(Math.random() * 420); // 8-15min
        reqCount = 4 + Math.floor(Math.random() * 6);
        goodCount = Math.min(1 + Math.floor(Math.random() * 2), availableGoods.length);
      } else {
        duration = 2700 + Math.floor(Math.random() * 2700); // 45-90min
        reqCount = 8 + Math.floor(Math.random() * 8);
        goodCount = Math.min(2 + Math.floor(Math.random() * 2), availableGoods.length);
      }

      // Pick random goods
      const shuffled = [...availableGoods].sort(() => Math.random() - 0.5);
      const selectedGoods = shuffled.slice(0, goodCount);
      const requirements = {};
      for (const good of selectedGoods) {
        requirements[good] = Math.max(1, Math.floor(reqCount / goodCount));
      }

      // Roll affixes
      const maxAffixes = fc >= 100 ? 3 : 2;
      const affixes = [];
      for (let i = 0; i < maxAffixes; i++) {
        if (Math.random() < 0.3 + i * 0.15) continue; // decreasing chance for more affixes
        const roll = Math.random();
        let cumulative = 0;
        for (const affix of this.farmAffixDefs) {
          cumulative += affix.rarity;
          if (roll <= cumulative) {
            if (affix.masteryReq && ml < affix.masteryReq) continue;
            if (!affixes.includes(affix.id)) {
              affixes.push(affix.id);
            }
            break;
          }
        }
      }

      // Apply affix modifiers
      let rewardMult = 1;
      let durationMult = 1;
      for (const affixId of affixes) {
        const affix = this.farmAffixDefs.find(a => a.id === affixId);
        if (affix.effect.rewardMult) rewardMult *= affix.effect.rewardMult;
        if (affix.effect.durationMult) durationMult *= affix.effect.durationMult;
        if (affix.effect.reqMult) {
          for (const good in requirements) requirements[good] = Math.ceil(requirements[good] * affix.effect.reqMult);
        }
      }
      duration = Math.floor(duration * durationMult);

      // Calculate donut reward
      let baseReward = 0;
      for (const [good, qty] of Object.entries(requirements)) {
        baseReward += qty * this.getSellPrice(good) * 1.5;
      }
      const donutReward = Math.floor(baseReward * rewardMult);

      // Buff reward (standard and longhaul may have buffs)
      let buffReward = null;
      if (type === "standard" && Math.random() < 0.4) {
        buffReward = this.generateBuffReward(ml);
      } else if (type === "longhaul") {
        buffReward = this.generateBuffReward(ml);
      }

      const names = this.farmContractNames[type];
      const id = "contract_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

      return {
        id, type,
        title: names[Math.floor(Math.random() * names.length)],
        requirements,
        progress: Object.fromEntries(Object.keys(requirements).map(g => [g, 0])),
        duration, elapsed: 0,
        reward: { donuts: donutReward, buff: buffReward },
        affixes,
        expiresAt: Date.now() + duration * 1000 + 600000,
      };
    }

    generateBuffReward(ml) {
      const cats = Object.keys(this.farmBuffCategories);
      const cat = cats[Math.floor(Math.random() * cats.length)];
      const base = this.farmBuffCategories[cat];
      return {
        category: cat,
        strength: base.baseStrength * (1 + 0.02 * ml),
        duration: base.baseDuration,
      };
    }

    acceptContract(contractId) {
      const fs = this.farmState;
      if (fs.contracts.active.length >= 2) {
        this.showFarmNotification("Max 2 active contracts!");
        return;
      }
      const idx = fs.contracts.board.findIndex(c => c && c.id === contractId);
      if (idx === -1) return;
      const contract = fs.contracts.board.splice(idx, 1)[0];
      // Check if we have the goods
      let canFulfill = true;
      for (const [good, qty] of Object.entries(contract.requirements)) {
        if ((fs.storage[good] || 0) < qty) { canFulfill = false; break; }
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
    }

    tickActiveContracts(deltaSeconds) {
      const fs = this.farmState;
      if (!fs.contracts || !Array.isArray(fs.contracts.active)) return;
      const toComplete = [];
      for (const contract of fs.contracts.active) {
        if (!contract || typeof contract.elapsed !== 'number' || typeof contract.duration !== 'number') continue;
        contract.elapsed += deltaSeconds;
        // Contract speed bonus from mastery
        if (fs.mastery.level >= 11) contract.elapsed += deltaSeconds * 0.05;
        if (contract.elapsed >= contract.duration) {
          toComplete.push(contract);
        }
      }
      for (const contract of toComplete) {
        try {
          this.completeContract(contract);
        } catch (e) {
          console.error("[Farm] completeContract error:", e);
          // Force-remove broken contract
          fs.contracts.active = fs.contracts.active.filter(c => c.id !== contract.id);
        }
      }
    }

    completeContract(contract) {
      const fs = this.farmState;
      // Remove from active
      fs.contracts.active = fs.contracts.active.filter(c => c.id !== contract.id);

      // Award donuts
      let donuts = contract.reward.donuts;
      // Volatile affix
      if (contract.affixes.includes("volatile")) {
        donuts = Math.floor(donuts * (0.5 + Math.random() * 1.5));
      }
      // Mastery contract reward bonus
      if (fs.mastery.level >= 16) donuts = Math.floor(donuts * 1.10);

      this.donutCount += donuts;
      this.totalDonutsEarned += donuts;
      this.showFarmNotification("Contract complete! +" + this.formatNumber(donuts) + " donuts");

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
        const chainContract = this.generateContract(contract.type, this.getFarmCount(), fs.mastery.level);
        if (chainContract) {
          chainContract.reward.donuts = Math.floor(chainContract.reward.donuts * 1.5);
          chainContract.title = "Chain: " + chainContract.title;
          fs.contracts.board.push(chainContract);
        }
      }

      // Crate drop
      this.rollFarmCrate();
      this.updateFarmDisplay();
    }

    deliverContract(contractId) {
      const fs = this.farmState;
      const contract = fs.contracts.active.find(c => c.id === contractId);
      if (!contract) return;
      if (contract.elapsed < contract.duration) {
        this.showFarmNotification("Contract not ready yet!");
        return;
      }
      this.completeContract(contract);
    }

    applyFarmBuff(buffData) {
      const fs = this.farmState;
      const cat = buffData.category;
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
      if (newScore > curScore * 1.10) {
        fs.buffs[cat] = newBuff;
      } else {
        const consolation = Math.floor(this.donutCount * 0.001);
        this.donutCount += consolation;
        this.showFarmNotification("Buff blocked. +" + this.formatNumber(consolation) + " donuts instead.");
      }
    }

    tickBuffExpiry(deltaSeconds) {
      const fs = this.farmState;
      for (const cat of Object.keys(fs.buffs)) {
        if (fs.buffs[cat] && fs.buffs[cat].remaining > 0) {
          fs.buffs[cat].remaining -= deltaSeconds;
          if (fs.buffs[cat].remaining <= 0) {
            fs.buffs[cat] = null;
          }
        }
      }
    }

    // --- Animal Purchase ---
    buyAnimal(type) {
      const def = this.farmAnimalDefs[type];
      if (!def) return;
      if (this.getFarmCount() < def.unlockFC) return;
      const owned = this.farmState.animals.filter(a => a.type === type);
      if (owned.length >= 20) {
        this.showFarmNotification("Max 20 " + def.name + " reached!");
        return;
      }
      const cost = this.getAnimalCost(type);
      if (this.donutCount < cost) return;
      this.donutCount -= cost;

      // Roll random traits (1-2 for purchased animals)
      const traits = [];
      const traitCount = 1 + (Math.random() < 0.3 ? 1 : 0);
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
    }

    rollNewTrait(rareBonus, excludeIds) {
      const ex = excludeIds || [];
      const roll = Math.random();
      let pool;
      if (roll < 0.005) {
        // Epic (0.5% — rareBonus does NOT affect epic chance)
        pool = this.farmTraitDefs.filter(t => t.rarity === "epic" && !ex.includes(t.id));
        if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)].id;
      }
      if (roll < 0.015 + rareBonus) {
        // Rare (1.5% base + rareBonus from program/feed)
        pool = this.farmTraitDefs.filter(t => t.rarity === "rare" && !ex.includes(t.id));
        if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)].id;
      }
      // Common
      pool = this.farmTraitDefs.filter(t => t.rarity === "common" && !ex.includes(t.id));
      if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)].id;
      // Fallback: any trait not already owned
      pool = this.farmTraitDefs.filter(t => !ex.includes(t.id));
      return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)].id : null;
    }

    // --- Selling Goods ---
    sellGoods(good) {
      const fs = this.farmState;
      const amount = Math.floor(fs.storage[good] || 0);
      if (amount <= 0) return;
      const price = this.getSellPrice(good);
      const total = amount * price;
      fs.storage[good] -= amount;
      this.donutCount += total;
      this.totalDonutsEarned += total;
      fs.stats.totalGoodsSold += amount;
      this.gainMasteryXP(3);
      this.showFarmNotification("Sold " + amount + " " + good + " for " + this.formatNumber(total) + " donuts!");
      // Crate drop chance on collect/sell
      this.rollFarmCrate();
      this.updateFarmDisplay();
    }

    // --- Breeding ---
    startBreeding(slotIndex, parentAId, parentBId, program) {
      const fs = this.farmState;
      const fc = this.getFarmCount();
      if (slotIndex === 0 && fc < 15) return;
      if (slotIndex === 1 && fc < 60) return;
      const slot = fs.breeding.slots[slotIndex];
      if (slot.active) return;

      const parentA = fs.animals.find(a => a.id === parentAId);
      const parentB = fs.animals.find(a => a.id === parentBId);
      if (!parentA || !parentB) return;
      if (parentA.type !== parentB.type) {
        this.showFarmNotification("Parents must be the same type!");
        return;
      }
      if (parentA.breedCooldown > 0 || parentB.breedCooldown > 0) {
        this.showFarmNotification("Parent(s) still on cooldown!");
        return;
      }
      const prog = this.farmBreedPrograms[program];
      if (!prog) return;
      const cost = this.farmAnimalDefs[parentA.type].baseCost * prog.costMult;
      if (this.donutCount < cost) return;
      this.donutCount -= cost;

      slot.active = true;
      slot.parentA = parentAId;
      slot.parentB = parentBId;
      slot.program = program;
      slot.progress = 0;
      slot.duration = prog.duration;

      parentA.breedCooldown = 3600; // 1 hour
      parentB.breedCooldown = 3600;
      this.updateFarmDisplay();
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
      const parentA = this.farmState.animals.find(a => a.id === sel.a);
      if (parentA) {
        const owned = this.farmState.animals.filter(a => a.type === parentA.type).length;
        if (owned >= 20) {
          this.showFarmNotification("Max 20 " + (this.farmAnimalDefs[parentA.type]?.name || parentA.type) + "! Free up space first.");
          return;
        }
        if (owned >= 18) {
          this.showFarmNotification("Warning: " + owned + "/20 slots used. Offspring may be lost if full!");
        }
      }
      const program = this._breedProgram || "quick";
      this.startBreeding(slotIndex, sel.a, sel.b, program);
      // Clear selection after starting
      this._breedSelection[slotIndex] = { a: null, b: null };
    }

    // Build breeding preview showing possible trait outcomes
    getBreedingPreview(parentAId, parentBId, programKey) {
      const fs = this.farmState;
      const parentA = fs.animals.find(a => a.id === parentAId);
      const parentB = fs.animals.find(a => a.id === parentBId);
      if (!parentA || !parentB) return '';
      if (parentA.type !== parentB.type) return '<div class="breed-preview-warn">Parents must be same type!</div>';

      const prog = this.farmBreedPrograms[programKey] || this.farmBreedPrograms.quick;
      const def = this.farmAnimalDefs[parentA.type];
      const owned = fs.animals.filter(a => a.type === parentA.type).length;
      const cost = Math.floor(def.baseCost * prog.costMult);
      const hasMentor = parentA.traits.includes("mentor") || parentB.traits.includes("mentor");
      const isPremium = fs.feedPlans[parentA.type] === "premium";
      const traitSlots = Math.min(prog.traitSlots + (hasMentor ? 1 : 0), 4);
      const rareBonus = prog.rareBonus + (isPremium ? 0.05 : 0);
      const variantChance = programKey === "long" ? 0.15 : 0.08;

      const inheritPool = [...new Set([...parentA.traits, ...parentB.traits])];
      const inheritDefs = inheritPool.map(t => this.farmTraitDefs.find(x => x.id === t)).filter(Boolean);
      const rarityColors = { common: '#81c784', rare: '#64b5f6', epic: '#ce93d8' };

      // Variant info
      let variantInfo = '';
      if (parentA.variant && parentB.variant && parentA.variant === parentB.variant) {
        variantInfo = `<span style="color:#fccb72;">Guaranteed: ${parentA.variant}</span>`;
      } else if (parentA.variant || parentB.variant) {
        variantInfo = `<span style="color:rgba(255,234,182,0.6);">50%: ${parentA.variant || parentB.variant}</span>`;
      } else {
        variantInfo = `<span style="color:rgba(255,234,182,0.3);">${(variantChance * 100)}% random</span>`;
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
      let slotBreakdown = '';
      if (programKey === "long") {
        const bestA = this._getBestTrait(parentA.traits);
        const bestB = this._getBestTrait(parentB.traits.filter(t => t !== bestA));
        const bestADef = bestA ? this.farmTraitDefs.find(t => t.id === bestA) : null;
        const bestBDef = bestB ? this.farmTraitDefs.find(t => t.id === bestB) : null;
        slotBreakdown = `<div class="breed-preview-slots">
          <div class="breed-slot-plan"><span class="breed-slot-num">1</span> ${bestADef ? `<span style="color:${rarityColors[bestADef.rarity]}">${bestADef.name}</span> <span class="breed-slot-guaranteed">guaranteed</span>` : 'Random (no parent A traits)'}</div>
          <div class="breed-slot-plan"><span class="breed-slot-num">2</span> ${bestBDef ? `<span style="color:${rarityColors[bestBDef.rarity]}">${bestBDef.name}</span> <span class="breed-slot-guaranteed">guaranteed</span>` : 'Random (no parent B traits)'}</div>
          <div class="breed-slot-plan"><span class="breed-slot-num">3</span> Mutation <span style="color:#64b5f6;">(${((rareBonus + 0.02 + 0.015) * 100).toFixed(1)}% rare+)</span></div>
          ${hasMentor ? `<div class="breed-slot-plan"><span class="breed-slot-num">4</span> Mentor bonus — Mutation</div>` : ''}
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

        ${mechanicHtml[programKey] || ''}

        <div class="breed-preview-grid">
          <div class="breed-preview-cell">
            <span class="breed-preview-label">Cost</span>
            <span class="breed-preview-value">${this.formatNumber(cost)}</span>
          </div>
          <div class="breed-preview-cell">
            <span class="breed-preview-label">Slots</span>
            <span class="breed-preview-value">${traitSlots}${hasMentor ? ' <small>(+1 Mentor)</small>' : ''}</span>
          </div>
          <div class="breed-preview-cell">
            <span class="breed-preview-label">Capacity</span>
            <span class="breed-preview-value" style="color:${owned >= 19 ? '#fd9193' : owned >= 17 ? '#fccb72' : '#81c784'}">${owned}/20</span>
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

        ${inheritDefs.length > 0 ? `<div class="breed-preview-section">
          <div class="breed-preview-subtitle">Parent Traits in Pool</div>
          ${inheritDefs.map(td => {
            const fromA = parentA.traits.includes(td.id);
            const fromB = parentB.traits.includes(td.id);
            return `<div class="breed-preview-trait">
              <span class="breed-preview-trait-dot" style="background:${rarityColors[td.rarity]}"></span>
              <span class="breed-preview-trait-name" style="color:${rarityColors[td.rarity]}">${td.name}</span>
              <span class="breed-preview-trait-rarity">${td.rarity}</span>
              <span class="breed-preview-trait-from">${fromA && fromB ? 'A+B' : fromA ? 'A' : 'B'}</span>
              <span class="breed-preview-trait-desc">${this.getTraitDescription(td)}</span>
            </div>`;
          }).join('')}
        </div>` : '<div class="breed-preview-empty">No parent traits. All slots will be random.</div>'}

        ${isPremium ? `<div class="breed-preview-bonus">Premium Feed: +5% rare chance on mutations</div>` : ''}
      </div>`;

      return html;
    }

    updateBreedPreview(slotIndex) {
      const container = document.getElementById("breed-preview-" + slotIndex);
      if (!container) return;
      const sel = this._breedSelection && this._breedSelection[slotIndex];
      if (!sel || !sel.a || !sel.b) { container.innerHTML = ''; return; }
      container.innerHTML = this.getBreedingPreview(sel.a, sel.b, this._breedProgram || "quick");
    }

    tickBreeding(deltaSeconds) {
      const fs = this.farmState;
      // Reduce breed cooldowns
      for (const animal of fs.animals) {
        if (animal.breedCooldown > 0) {
          animal.breedCooldown = Math.max(0, animal.breedCooldown - deltaSeconds);
        }
      }
      for (let i = 0; i < fs.breeding.slots.length; i++) {
        const slot = fs.breeding.slots[i];
        if (!slot.active) continue;
        slot.progress += deltaSeconds;
        if (slot.progress >= slot.duration) {
          this.completeBreeding(i);
        }
      }
    }

    completeBreeding(slotIndex) {
      const fs = this.farmState;
      const slot = fs.breeding.slots[slotIndex];
      const parentA = fs.animals.find(a => a.id === slot.parentA);
      const parentB = fs.animals.find(a => a.id === slot.parentB);
      if (!parentA || !parentB) { slot.active = false; return; }

      const prog = this.farmBreedPrograms[slot.program];
      const type = parentA.type;
      const def = this.farmAnimalDefs[type];
      const owned = fs.animals.filter(a => a.type === type);
      if (owned.length >= 20) {
        this.showFarmNotification("Max 20 " + def.name + "! Offspring lost.");
        slot.active = false;
        return;
      }

      // Roll traits (program-specific logic)
      const traits = this.rollBreedingTraits(parentA, parentB, prog);
      // Roll variant (Long program gets 15% chance instead of 8%)
      const variantChance = slot.program === "long" ? 0.15 : 0.08;
      const variant = this.rollVariant(parentA, parentB, type, variantChance);

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
        const tdef = this.farmTraitDefs.find(t => t.id === traitId);
        if (tdef && tdef.rarity === "rare") this.gainMasteryXP(30);
        if (tdef && tdef.rarity === "epic") this.gainMasteryXP(100);
      }

      this.rollFarmCrate();
      this.showFarmNotification("New " + def.name + " bred: " + offspring.name);
      this.updateFarmDisplay();
    }

    _getTraitRarityWeight(traitId) {
      const td = this.farmTraitDefs.find(t => t.id === traitId);
      if (!td) return 1;
      if (td.rarity === "epic") return 6;
      if (td.rarity === "rare") return 3;
      return 1;
    }

    _pickWeightedTrait(traitList) {
      // Pick from a list of trait IDs, weighted by rarity (higher rarity = more likely to be inherited)
      if (!traitList || traitList.length === 0) return null;
      const weights = traitList.map(t => this._getTraitRarityWeight(t));
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let roll = Math.random() * totalWeight;
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
        const td = this.farmTraitDefs.find(d => d.id === t);
        const rank = td ? (order[td.rarity] || 0) : 0;
        if (rank > bestRank) { best = t; bestRank = rank; }
      }
      return best;
    }

    rollBreedingTraits(parentA, parentB, program) {
      const hasMentor = parentA.traits.includes("mentor") || parentB.traits.includes("mentor");
      let slots = Math.min(program.traitSlots + (hasMentor ? 1 : 0), 4);
      const traits = [];
      const isPremium = this.farmState.feedPlans[parentA.type] === "premium";
      const rareBonus = program.rareBonus + (isPremium ? 0.05 : 0);
      const programKey = program === this.farmBreedPrograms.quick ? "quick"
                       : program === this.farmBreedPrograms.long ? "long" : "standard";

      const allParentTraits = [...new Set([...parentA.traits, ...parentB.traits])];

      if (programKey === "quick") {
        // QUICK: High inherit (80%), NO mutation — predictable trait transfer
        for (let i = 0; i < slots; i++) {
          let candidate = null;
          if (allParentTraits.length > 0 && Math.random() < 0.80) {
            // Weighted pick from parent pool (rarer traits more likely to be picked)
            const pool = allParentTraits.filter(t => !traits.includes(t));
            candidate = pool.length > 0 ? this._pickWeightedTrait(pool) : null;
          }
          if (!candidate) {
            // Random common only (no mutation to rare/epic in Quick)
            const commons = this.farmTraitDefs.filter(t => t.rarity === "common" && !traits.includes(t.id));
            candidate = commons.length > 0 ? commons[Math.floor(Math.random() * commons.length)].id : null;
          }
          if (candidate && !traits.includes(candidate)) traits.push(candidate);
        }

      } else if (programKey === "long") {
        // LONG: Guaranteed best from each parent + mutation slots
        // Slot 1: Best trait from Parent A (guaranteed)
        const bestA = this._getBestTrait(parentA.traits);
        if (bestA) traits.push(bestA);

        // Slot 2: Best trait from Parent B (not already taken)
        const bestB = this._getBestTrait(parentB.traits.filter(t => !traits.includes(t)));
        if (bestB) traits.push(bestB);
        else if (parentB.traits.length > 0) {
          // If bestB was duplicate, pick next best
          const remaining = parentB.traits.filter(t => !traits.includes(t));
          if (remaining.length > 0) traits.push(this._pickWeightedTrait(remaining));
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
          if (allParentTraits.length > 0 && Math.random() < 0.60) {
            // 60% inherit from parents, weighted by rarity
            const pool = allParentTraits.filter(t => !traits.includes(t));
            candidate = pool.length > 0 ? this._pickWeightedTrait(pool) : null;
          }
          if (!candidate) {
            // 40% mutation — full rarity roll
            candidate = this.rollNewTrait(rareBonus, traits);
          }
          if (candidate && !traits.includes(candidate)) traits.push(candidate);
        }
      }

      return traits.slice(0, 4);
    }

    rollVariant(parentA, parentB, type, variantChance) {
      const baseChance = variantChance || 0.08;
      // Both parents same variant → guaranteed
      if (parentA.variant && parentB.variant && parentA.variant === parentB.variant) {
        return parentA.variant;
      }
      // Both parents have different variants → 50% either
      if (parentA.variant && parentB.variant) {
        return Math.random() < 0.5 ? parentA.variant : parentB.variant;
      }
      // One parent has variant → 50% inherit
      if (parentA.variant || parentB.variant) {
        if (Math.random() < 0.5) return parentA.variant || parentB.variant;
        return null;
      }
      // Neither parent → random chance
      if (Math.random() < baseChance) {
        const variants = this.farmVariants[type];
        if (variants && variants.length > 0) {
          return variants[Math.floor(Math.random() * variants.length)].name;
        }
      }
      return null;
    }

    // --- Mastery XP ---
    gainMasteryXP(amount) {
      const fs = this.farmState;
      fs.mastery.xp += amount;
      while (fs.mastery.level < 20) {
        const required = Math.floor(100 * Math.pow(fs.mastery.level + 1, 1.8));
        if (fs.mastery.xp >= required) {
          fs.mastery.xp -= required;
          fs.mastery.level++;
          this.showFarmNotification("Farm Mastery Level " + fs.mastery.level + "!");
          // Level 20 bonus: +5% CpS permanently
          if (fs.mastery.level === 20) {
            this.showFarmNotification("Master Farmer! +5% CpS permanently!");
          }
        } else {
          break;
        }
      }
      this.updateFarmMasteryBadge();
    }

    updateFarmMasteryBadge() {
      const badge = document.getElementById("farm-mastery-badge");
      if (!badge) return;
      const fs = this.farmState;
      const level = fs.mastery.level;
      const xp = fs.mastery.xp;
      const nextXp = level >= 20 ? 0 : Math.floor(100 * Math.pow(level + 1, 1.8));
      const prevXp = level >= 1 ? Math.floor(100 * Math.pow(level, 1.8)) : 0;
      const pct = level >= 20 ? 100 : Math.min(100, ((xp - prevXp) / (nextXp - prevXp)) * 100);
      badge.innerHTML = `<span title="${this.getFarmTooltip('mastery')}">Lv. ${level}</span>
        <div class="farm-mastery-xp-bar"><div class="farm-mastery-xp-fill" style="width:${pct}%"></div></div>
        <span class="farm-mastery-xp-text" style="font-size:0.52rem;color:rgba(255,234,182,0.4);">${level >= 20 ? 'MAX' : this.formatNumber(xp) + '/' + this.formatNumber(nextXp)}</span>`;
    }

    // --- Crate System ---
    rollFarmCrate() {
      const roll = Math.random();
      let tier = null;
      if (roll < 0.0005) tier = "epic";
      else if (roll < 0.0035) tier = "gold";
      else if (roll < 0.0185) tier = "silver";
      else if (roll < 0.0685) tier = "wooden";
      if (!tier) return;
      this.farmState.crates.push({ tier, id: "crate_" + Date.now() });
      this.showFarmNotification("Found a " + tier + " crate!");
    }

    openFarmCrate(crateId) {
      const fs = this.farmState;
      const idx = fs.crates.findIndex(c => c.id === crateId);
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
        if (Math.random() < 0.20) this.applyFarmBuff(this.generateBuffReward(fs.mastery.level));
        this.gainMasteryXP(25);
      } else if (crate.tier === "gold") {
        donutReward = Math.floor(cps * 900);
        this.addRandomGoods(5, 10);
        if (Math.random() < 0.50) {
          // Award random passport
          const passport = this.farmPassports[Math.floor(Math.random() * this.farmPassports.length)];
          this.showFarmNotification("Found passport: " + passport.name + "!");
        }
        this.gainMasteryXP(60);
      } else if (crate.tier === "epic") {
        donutReward = Math.floor(cps * 1800);
        this.addRandomGoods(5, 10);
        this.gainMasteryXP(150);
        this.showFarmNotification("Epic crate! Guaranteed passport!");
      }
      this.donutCount += donutReward;
      this.totalDonutsEarned += donutReward;
      this.showFarmNotification("Crate opened! +" + this.formatNumber(donutReward) + " donuts");
      this.updateFarmDisplay();
    }

    addRandomGoods(min, max) {
      const fs = this.farmState;
      const goods = Object.keys(fs.storage);
      const count = min + Math.floor(Math.random() * (max - min + 1));
      for (let i = 0; i < count; i++) {
        const good = goods[Math.floor(Math.random() * goods.length)];
        const cap = this.getEffectiveStorageCap(good);
        fs.storage[good] = Math.min(fs.storage[good] + 1, cap);
      }
    }

    // --- Contract Reroll ---
    rerollContracts() {
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
    }

    // --- Auto-collect (FC 60 + Mastery 13) ---
    tickAutoCollect() {
      const fs = this.farmState;
      if (this.getFarmCount() < 60 || fs.mastery.level < 13) return;
      for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
        const good = def.good;
        const cap = this.getEffectiveStorageCap(good);
        if (fs.storage[good] >= cap * 0.8 && fs.storage[good] > 0) {
          // Auto-sell when storage >= 80% (no crate drop for auto)
          const amount = Math.floor(fs.storage[good]);
          if (amount <= 0) continue;
          const price = this.getSellPrice(good);
          const total = amount * price;
          fs.storage[good] -= amount;
          this.donutCount += total;
          this.totalDonutsEarned += total;
          fs.stats.totalGoodsSold += amount;
        }
      }
    }

    // --- Contract Cancel ---
    cancelContract(contractId) {
      const fs = this.farmState;
      const idx = fs.contracts.active.findIndex(c => c.id === contractId);
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
    }

    // --- Tooltip descriptions ---
    getFarmTooltip(key) {
      const tips = {
        // Feed plans
        feedStandard: "Standard Feed: Free. Normal production speed (1x).",
        feedRation: "Ration Feed: 0.7x production. Cost scales with your income (~0.08% CpS per type). Efficient trait reduces cost.",
        feedPremium: "Premium Feed: 1.4x production + 5% rare breed chance. Cost scales with your income (~0.35% CpS per type). Efficient trait reduces cost.",
        // Buffs
        PROD: "Production Buff: Increases all farm animal production speed.",
        COST: "Cost Buff: Reduces building purchase costs.",
        OFFLINE: "Offline Buff: Boosts offline donut production efficiency.",
        QOL: "Quality of Life Buff: Auto-collect, instant breed queue.",
        EVENT: "Event Buff: Special effects like 2x click value.",
        // Care
        care: "Care Window: Every 12 min, a 90s window opens. Pet or feed your animals for production boosts!",
        carePet: "Pet & Groom: +25% production for 2 production cycles. Free!",
        careTreat: "Feed Treat: +40% production for 3 cycles. Costs 0.1% of your donuts.",
        // Mastery
        mastery: "Farm Mastery: Earn XP by selling goods, completing contracts, and breeding. Each level gives +5 storage and unlocks new features!",
        // Contracts
        contractRush: "Rush: 3-5 min, small reward. Quick and easy.",
        contractStandard: "Standard: 8-15 min, medium reward + possible buff.",
        contractLonghaul: "Long Haul: 45-90 min, big reward + guaranteed buff.",
        // Breeding
        breeding: "Breeding: Select 2 animals of the same type to breed. Offspring inherit traits from parents!",
        breedQuick: "Quick: 30min, 3x cost, 2 slots. 80% inherit from parents, no mutation. Predictable trait transfer.",
        breedStandard: "Standard: 2h, 5x cost, 2 slots. 60% inherit, 40% mutation with rare/epic chance. Balanced.",
        breedLong: "Long: 4h, 8x cost, 3 slots. Guaranteed best trait from each parent + mutation slot. 15% variant chance.",
        // Animals
        chicken: "Chicken: Produces 1 egg every 45s. Fast & cheap, bread-and-butter income.",
        cow: "Cow: Produces 1 milk every 90s. Balanced; milk used in most contracts.",
        sheep: "Sheep: Produces 1 wool every 150s. Slow but high-value for premium contracts.",
        bees: "Bees: Produces 1 honey every 30s. Fastest producer but tiny storage!",
        pigs: "Pigs: Produces 1 truffle every 300s. Slowest but premium value.",
        // Buff tooltips (with buff_ prefix for contract/collection display)
        buff_PROD: "Production Buff: Increases all farm animal production speed.",
        buff_COST: "Cost Buff: Reduces building purchase costs.",
        buff_OFFLINE: "Offline Buff: Boosts offline donut production efficiency.",
        buff_QOL: "Quality of Life Buff: Auto-collect, instant breed queue, etc.",
        buff_EVENT: "Event Buff: Special effects like 2x click value.",
      };
      return tips[key] || "";
    }

    // --- Display Updates ---
    updateFarmDisplay() {
      const fc = this.getFarmCount();
      if (fc < 1) return;
      // Only update the active tab for performance
      if (this.farmActiveTab === "barn") this.updateFarmBarnTab();
      else if (this.farmActiveTab === "contracts") this.updateFarmContractsTab();
      else if (this.farmActiveTab === "breeding") this.updateFarmBreedingTabSmart();
      else if (this.farmActiveTab === "collection") this.updateFarmCollectionTab();
      this.updateFarmKPIs();
    }

    updateFarmBarnTab() {
      const grid = document.getElementById("farm-animal-grid");
      const storageSection = document.getElementById("farm-storage-section");
      if (!grid || !storageSection) return;

      // If DOM already has content, try partial update (preserves scroll, inputs, focus)
      if (grid.children.length > 0 && grid.querySelector('.farm-type-block')) {
        this._partialUpdateBarnTab(grid, storageSection);
        return;
      }

      // Full render (first time or after structural change)
      this._fullRenderBarnTab(grid, storageSection);
    }

    _fullRenderBarnTab(grid, storageSection) {
      const fc = this.getFarmCount();
      const fs = this.farmState;
      if (!this._expandedAnimalTypes) this._expandedAnimalTypes = {};

      let animalHtml = "";
      for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
        const owned = fs.animals.filter(a => a.type === type);
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
        const storagePct = cap > 0 ? Math.min(100, (fs.storage[good] / cap) * 100) : 0;
        const prodPerMin = owned.length > 0 ? ((owned.length / def.prodInterval) * this.getProductionModifier(type) * 60).toFixed(1) : "0";

        const plan = fs.feedPlans[type] || "standard";
        let feedCostStr = "";
        if (plan !== "standard" && owned.length > 0) {
          const costPerSec = this.getFeedCostPerSecond(type);
          const cpsPct = this.totalPerSecond > 0 ? ((costPerSec / this.totalPerSecond) * 100).toFixed(2) : '0';
          feedCostStr = `<span class="farm-feed-cost" data-feed-cost="${type}">-${this.formatNumber(Math.ceil(costPerSec))}/s <span class="farm-feed-pct">(${cpsPct}%)</span></span>`;
        }

        animalHtml += `
          <div class="farm-type-block" data-type="${type}">
            <div class="farm-animal-card ${!unlocked ? 'locked' : ''}" data-animal="${type}" title="${this.getFarmTooltip(type)}">
              <img src="img/farm${type.charAt(0).toUpperCase() + type.slice(1)}.webp" alt="${def.name}" class="farm-animal-icon" />
              <div class="farm-animal-info">
                <div class="farm-animal-header-row">
                  <span class="farm-animal-name">${def.name}${!unlocked ? ' (Need ' + def.unlockFC + ' farms)' : ''}</span>
                  ${owned.length > 0 ? `<span class="farm-roster-toggle" onclick="event.stopPropagation();window._game.toggleAnimalRoster('${type}')" title="View individual animals">${isExpanded ? '▾' : '▸'} ${owned.length}</span>` : ''}
                </div>
                <span class="farm-animal-count" data-count="${type}">${owned.length > 0 ? `<strong>${owned.length}</strong>/20 | ${prodPerMin} ${def.good}/min` : 'Owned: 0'}</span>
                ${uniqueTraits.length > 0 ? `<div class="farm-animal-traits">
                  ${uniqueTraits.slice(0, 5).map(t => {
                    const tdef = this.farmTraitDefs.find(td => td.id === t);
                    return tdef ? `<span class="farm-trait-badge ${tdef.rarity}" title="${tdef.name}: ${this.getTraitDescription(tdef)}">${tdef.name}</span>` : '';
                  }).join('')}${uniqueTraits.length > 5 ? `<span class="farm-trait-badge more">+${uniqueTraits.length - 5}</span>` : ''}
                </div>` : ''}
                <div class="farm-progress"><div class="farm-progress-bar" data-bar="${type}" style="width:${storagePct}%"></div></div>
              </div>
              <div class="farm-animal-actions">
                <button class="farm-btn farm-btn-buy" data-buy="${type}" onclick="window._game.buyAnimal('${type}')" ${!unlocked || !canAfford || owned.length >= 20 ? 'disabled' : ''}>
                  <img src="img/donutMoney.webp" class="donut-money-icon" /> ${this.formatNumber(cost)}
                </button>
                ${unlocked && owned.length > 0 ? `
                  <div class="farm-feed-select">
                    <button class="farm-feed-btn ${plan === 'standard' ? 'active' : ''}" onclick="window._game.setFeedPlan('${type}','standard')" title="Free. Normal 1x production.">Std</button>
                    ${fc >= 15 ? `<button class="farm-feed-btn ${plan === 'ration' ? 'active' : ''}" onclick="window._game.setFeedPlan('${type}','ration')" title="0.5% cost, 0.7x prod">Ration</button>` : ''}
                    ${fc >= 40 ? `<button class="farm-feed-btn ${plan === 'premium' ? 'active' : ''}" onclick="window._game.setFeedPlan('${type}','premium')" title="2% cost, 1.4x prod, +5% rare breed">Prem</button>` : ''}
                  </div>
                  ${feedCostStr}
                ` : ''}
              </div>
            </div>
            ${isExpanded ? this.renderAnimalRoster(type, owned) : ''}
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
        const owned = fs.animals.filter(a => a.type === type);
        const good = def.good;
        const cap = this.getEffectiveStorageCap(good);
        const storagePct = cap > 0 ? Math.min(100, (fs.storage[good] / cap) * 100) : 0;
        const prodPerMin = owned.length > 0 ? ((owned.length / def.prodInterval) * this.getProductionModifier(type) * 60).toFixed(1) : "0";

        // Update progress bar
        const bar = grid.querySelector(`[data-bar="${type}"]`);
        if (bar) bar.style.width = storagePct + '%';

        // Update count & prod/min
        const countEl = grid.querySelector(`[data-count="${type}"]`);
        if (countEl) countEl.innerHTML = owned.length > 0 ? `<strong>${owned.length}</strong>/20 | ${prodPerMin} ${def.good}/min` : 'Owned: 0';

        // Update buy button cost & affordability
        const buyBtn = grid.querySelector(`[data-buy="${type}"]`);
        if (buyBtn) {
          const cost = this.getAnimalCost(type);
          const canAfford = this.donutCount >= cost;
          const unlocked = fc >= def.unlockFC;
          buyBtn.disabled = !unlocked || !canAfford || owned.length >= 20;
          const textNode = buyBtn.lastChild;
          if (textNode) textNode.textContent = ' ' + this.formatNumber(cost);
        }

        // Update feed cost (scales with CpS so must refresh every tick)
        const plan = fs.feedPlans[type] || "standard";
        const feedCostEl = grid.querySelector(`[data-feed-cost="${type}"]`);
        if (feedCostEl && plan !== "standard" && owned.length > 0) {
          const costPerSec = this.getFeedCostPerSecond(type);
          const cpsPct = this.totalPerSecond > 0 ? ((costPerSec / this.totalPerSecond) * 100).toFixed(2) : '0';
          feedCostEl.innerHTML = `-${this.formatNumber(Math.ceil(costPerSec))}/s <span class="farm-feed-pct">(${cpsPct}%)</span>`;
        }

        // Update cooldown tags in roster (lightweight, no re-render)
        const roster = grid.querySelector(`.farm-type-block[data-type="${type}"] .farm-roster`);
        if (roster) {
          for (const animal of owned) {
            if (animal.breedCooldown > 0) {
              const row = roster.querySelector(`[data-animal-id="${animal.id}"] .farm-cooldown-tag`);
              if (row) row.textContent = this.formatDuration(Math.ceil(animal.breedCooldown));
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
              <div class="farm-storage-bar-fill ${isFull ? 'full' : ''}" style="width:${pct}%"></div>
            </div>
            <span class="farm-storage-text">${current} / ${cap}</span>
          </div>
        `;
      }
      storageSection.innerHTML = storageHtml;
    }

    _forceBarnFullRender() {
      const grid = document.getElementById("farm-animal-grid");
      if (grid) grid.innerHTML = '';
      this.updateFarmBarnTab();
    }

    toggleAnimalRoster(type) {
      if (!this._expandedAnimalTypes) this._expandedAnimalTypes = {};
      this._expandedAnimalTypes[type] = !this._expandedAnimalTypes[type];
      this._forceBarnFullRender();
    }

    renderAnimalRoster(type, animals) {
      if (!animals || animals.length === 0) return '';
      let html = '<div class="farm-roster">';
      for (const animal of animals) {
        const tdef = this.farmAnimalDefs[type];
        const cooldownLeft = animal.breedCooldown > 0 ? Math.ceil(animal.breedCooldown) : 0;
        const variantDef = animal.variant ? (this.farmVariants && this.farmVariants[type] ? this.farmVariants[type].find(v => v.name === animal.variant) : null) : null;

        html += `
          <div class="farm-roster-row" data-animal-id="${animal.id}">
            <div class="farm-roster-name-wrap">
              <span class="farm-roster-name" onclick="window._game.startRenameAnimal('${animal.id}')" title="Click to rename">${animal.name || (tdef.name + ' #' + animal.id.split('_').pop())}</span>
              ${animal.variant ? `<span class="farm-variant-tag" title="${variantDef ? variantDef.name + ': ' + this.getVariantDescription(variantDef) : animal.variant}">${animal.variant}</span>` : ''}
              ${animal.passport ? `<span class="farm-passport-tag" title="${animal.passport}">${animal.passport}</span>` : ''}
              ${cooldownLeft > 0 ? `<span class="farm-cooldown-tag">${this.formatDuration(cooldownLeft)}</span>` : ''}
            </div>
            <div class="farm-roster-traits">
              ${animal.traits.length > 0 ? animal.traits.map(t => {
                const td = this.farmTraitDefs.find(d => d.id === t);
                return td ? `<span class="farm-trait-badge ${td.rarity}" title="${td.name}: ${this.getTraitDescription(td)}">${td.name}</span>` : '';
              }).join('') : '<span class="farm-roster-no-traits">No traits</span>'}
            </div>
          </div>
        `;
      }
      html += '</div>';
      return html;
    }

    startRenameAnimal(animalId) {
      const animal = this.farmState.animals.find(a => a.id === animalId);
      if (!animal) return;
      const row = document.querySelector(`.farm-roster-row[data-animal-id="${animalId}"]`);
      if (!row) return;
      const nameEl = row.querySelector('.farm-roster-name');
      if (!nameEl) return;
      const currentName = animal.name || animal.id;
      nameEl.outerHTML = `<input class="farm-rename-input" type="text" value="${currentName}" maxlength="20" onblur="window._game.finishRenameAnimal('${animalId}',this.value)" onkeydown="if(event.key==='Enter')this.blur()" />`;
      const input = row.querySelector('.farm-rename-input');
      if (input) { input.focus(); input.select(); }
    }

    finishRenameAnimal(animalId, newName) {
      const animal = this.farmState.animals.find(a => a.id === animalId);
      if (!animal) return;
      const trimmed = newName.trim().slice(0, 20);
      if (trimmed.length > 0) animal.name = trimmed;
      this._forceBarnFullRender();
    }

    getVariantDescription(vdef) {
      if (!vdef || !vdef.effect) return '';
      const e = vdef.effect;
      if (e.prodSpeed) return '+' + (e.prodSpeed * 100) + '% prod speed';
      if (e.sellPrice) return '+' + (e.sellPrice * 100) + '% sell price';
      if (e.traitSlot) return '+1 trait slot';
      return '';
    }

    formatDuration(seconds) {
      if (seconds <= 0) return '';
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      if (m > 60) return Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
      return m > 0 ? m + 'm ' + s + 's' : s + 's';
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
        const remaining = Math.max(0, 600000 - (Date.now() - fs.contracts.lastRefresh));
        refreshTimer.textContent = "Refresh: " + Math.ceil(remaining / 1000) + "s";
      }

      // Board
      let boardHtml = "";
      for (const contract of fs.contracts.board) {
        if (!contract) continue;
        boardHtml += `
          <div class="contract-card ${contract.type}" title="${this.getFarmTooltip('contract' + contract.type.charAt(0).toUpperCase() + contract.type.slice(1))}">
            <div class="contract-header">
              <span class="contract-type-label">${contract.type === 'rush' ? 'Rush' : contract.type === 'standard' ? 'Standard' : 'Long Haul'}</span>
              <span class="contract-title">${contract.title}</span>
              ${contract.affixes.map(a => {
                const affix = this.farmAffixDefs.find(ad => ad.id === a);
                if (!affix) return '';
                const affixTips = {
                  urgent: "Urgent: 30% less time, 20% less reward",
                  generous: "Generous: +40% reward",
                  demanding: "Demanding: +50% required goods, +60% reward",
                  focused: "Focused: Single good type, +20% buff duration",
                  volatile: "Volatile: Random reward multiplier (0.5x-3x)",
                  vip: "VIP: +30% buff strength (req. Mastery 8)",
                  chain: "Chain: Follow-up contract with 1.5x reward",
                  legendary: "Legendary: +80% reward, 3x requirements, 2 good types"
                };
                return `<span class="contract-affix ${a}" title="${affixTips[a] || ''}">${affix.name}</span>`;
              }).join('')}
            </div>
            <div class="contract-requirements">
              ${Object.entries(contract.requirements).map(([good, qty]) =>
                `<span>${good}: ${qty}</span>`
              ).join('')}
            </div>
            <div class="contract-reward">
              <img src="img/donutMoney.webp" class="donut-money-icon" /> ${this.formatNumber(contract.reward.donuts)}
              ${contract.reward.buff ? `<span class="farm-buff-preview" title="${this.getFarmTooltip('buff_' + contract.reward.buff.category)}">+${contract.reward.buff.category}</span>` : ''}
            </div>
            <div class="contract-actions">
              <button class="farm-btn farm-btn-buy" onclick="window._game.acceptContract('${contract.id}')">Accept</button>
            </div>
          </div>
        `;
      }
      board.innerHTML = boardHtml || '<div style="color:rgba(255,234,182,0.3);font-size:0.72rem;text-align:center;padding:20px;">No contracts available yet</div>';

      // Active contracts
      if (activeList) {
        let activeHtml = "";
        for (const contract of fs.contracts.active) {
          const pct = Math.min(100, (contract.elapsed / contract.duration) * 100);
          const isReady = contract.elapsed >= contract.duration;
          const remaining = Math.max(0, contract.duration - contract.elapsed);
          const mins = Math.floor(remaining / 60);
          const secs = Math.ceil(remaining % 60);
          activeHtml += `
            <div class="contract-active-card ${isReady ? 'contract-ready' : ''}">
              <div class="contract-header">
                <span class="contract-title">${contract.title}</span>
                <span style="margin-left:auto;font-size:0.62rem;color:${isReady ? '#81c784' : 'rgba(255,234,182,0.45)'}">${isReady ? 'READY!' : mins + 'm ' + secs + 's'}</span>
              </div>
              <div class="contract-reward" style="font-size:0.62rem;">
                <img src="img/donutMoney.webp" class="donut-money-icon" style="width:12px;height:12px;" /> ${this.formatNumber(contract.reward.donuts)}
                ${contract.reward.buff ? `<span class="farm-buff-preview" title="${this.getFarmTooltip('buff_' + contract.reward.buff.category)}">+${contract.reward.buff.category}</span>` : ''}
              </div>
              <div class="contract-active-progress">
                <div class="farm-progress"><div class="farm-progress-bar ${isReady ? 'bar-ready' : ''}" style="width:${pct}%"></div></div>
              </div>
              <div class="contract-active-actions">
                ${isReady
                  ? `<button class="farm-btn farm-btn-buy farm-btn-deliver" onclick="window._game.deliverContract('${contract.id}')">Deliver!</button>`
                  : `<button class="farm-btn farm-btn-small farm-btn-cancel" onclick="window._game.cancelContract('${contract.id}')" title="Cancel (80% goods returned)">Cancel</button>`
                }
              </div>
            </div>
          `;
        }
        activeList.innerHTML = activeHtml || '<div style="color:rgba(255,234,182,0.3);font-size:0.68rem;text-align:center;">No active contracts</div>';
      }
      if (activeCount) activeCount.textContent = fs.contracts.active.length + " / 2";
    }

    getTraitDescription(tdef) {
      if (!tdef) return "";
      const e = tdef.effect;
      const descs = {
        prodSpeed: "+" + (e.value * 100) + "% production speed",
        feedCost: (e.value * 100) + "% feed cost",
        sellPrice: "+" + (e.value * 100) + "% sell price",
        careBonus: "+" + (e.value * 100) + "% care window bonus",
        socialProd: "+" + (e.value * 100) + "% prod per same-type animal (max " + (e.max * 100) + "%)",
        careWindowDuration: "+" + e.value + "s care window",
        breedCooldown: (e.value * 100) + "% breed cooldown",
        crateChance: "+" + (e.value * 100) + "% crate drop chance",
        bonusGood: "+1 extra good every " + e.value + "th collect",
        mentorTrait: "Offspring inherit +" + e.value + " extra trait",
        storageCap: "+" + (e.value * 100) + "% storage cap for this good",
        contractReq: (e.value * 100) + "% contract requirements",
        legendaryProd: "+" + (e.prodSpeed * 100) + "% prod, +" + (e.sellPrice * 100) + "% sell",
        contractStar: "+" + (e.contractSpeed * 100) + "% contract speed, +" + (e.buffDuration * 100) + "% buff duration",
      };
      return descs[e.type] || "";
    }

    updateFarmBreedingTabSmart() {
      const fs = this.farmState;
      const container = document.getElementById("farm-breeding-slots");
      if (!container) return;
      if (!container.dataset.rendered) { this.updateFarmBreedingTab(); return; }
      // Partial update: only progress bars/timers for active slots
      for (let i = 0; i < fs.breeding.slots.length; i++) {
        const slot = fs.breeding.slots[i];
        if (!slot.active) continue;
        const card = container.querySelector(`[data-breed-slot="${i}"]`);
        if (!card) continue;
        const statusEl = card.querySelector(".breed-slot-status");
        const barEl = card.querySelector(".farm-progress-bar");
        if (statusEl) {
          const remaining = Math.ceil(Math.max(0, slot.duration - slot.progress));
          statusEl.textContent = this.formatDuration(remaining) + " remaining";
        }
        if (barEl) barEl.style.width = Math.min(100, (slot.progress / slot.duration) * 100) + "%";
      }
    }

    _breedRenderAnimalCard(animal, slotIndex, parentSlot) {
      const sel = this._breedSelection;
      const slotSel = sel && sel[slotIndex];
      const isSelectedA = slotSel && slotSel.a === animal.id;
      const isSelectedB = slotSel && slotSel.b === animal.id;
      const isSelected = isSelectedA || isSelectedB;
      const otherSlotUsed = sel && Object.values(sel).some((s, idx) => idx !== slotIndex && s && (s.a === animal.id || s.b === animal.id));
      const onCooldown = animal.breedCooldown > 0;
      const disabled = otherSlotUsed || onCooldown;

      const rarityColors = { common: '#81c784', rare: '#64b5f6', epic: '#ce93d8' };
      const traitDots = animal.traits.map(t => {
        const td = this.farmTraitDefs.find(d => d.id === t);
        return td ? `<span class="breed-card-dot" style="background:${rarityColors[td.rarity]}" title="${td.name} (${td.rarity}): ${this.getTraitDescription(td)}"></span>` : '';
      }).join('');

      return `<div class="breed-animal-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}"
        onclick="${disabled ? '' : `window._game.selectBreedParent(${slotIndex},'${animal.id}')`}"
        title="${animal.name}${animal.variant ? ' (' + animal.variant + ')' : ''}${onCooldown ? ' — Cooldown: ' + this.formatDuration(Math.ceil(animal.breedCooldown)) : ''}">
        <div class="breed-card-name">${animal.name}${isSelectedA ? ' [A]' : ''}${isSelectedB ? ' [B]' : ''}</div>
        <div class="breed-card-meta">
          ${traitDots}
          ${animal.variant ? `<span class="breed-card-variant">${animal.variant}</span>` : ''}
          ${onCooldown ? `<span class="breed-card-cd">${this.formatDuration(Math.ceil(animal.breedCooldown))}</span>` : ''}
        </div>
      </div>`;
    }

    selectBreedParent(slotIndex, animalId) {
      if (!this._breedSelection) this._breedSelection = {};
      if (!this._breedSelection[slotIndex]) this._breedSelection[slotIndex] = { a: null, b: null };
      const sel = this._breedSelection[slotIndex];

      // If already selected as A → deselect
      if (sel.a === animalId) { sel.a = null; this.updateFarmBreedingTab(); return; }
      // If already selected as B → deselect
      if (sel.b === animalId) { sel.b = null; this.updateFarmBreedingTab(); return; }

      // Same animal can't be both parents
      const animal = this.farmState.animals.find(a => a.id === animalId);
      if (!animal) return;

      // Fill A first, then B (must be same type as A)
      if (!sel.a) {
        sel.a = animalId;
      } else if (!sel.b) {
        const parentA = this.farmState.animals.find(a => a.id === sel.a);
        if (parentA && parentA.type !== animal.type) {
          this.showFarmNotification("Both parents must be the same type!");
          return;
        }
        sel.b = animalId;
      } else {
        // Both filled → replace B
        const parentA = this.farmState.animals.find(a => a.id === sel.a);
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

      let html = '';

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
          const remaining = Math.ceil(Math.max(0, slot.duration - slot.progress));
          const parentA = fs.animals.find(a => a.id === slot.parentA);
          const parentB = fs.animals.find(a => a.id === slot.parentB);
          const progDef = this.farmBreedPrograms[slot.program];
          html += `<div class="breed-slot-card active" data-breed-slot="${i}">
            <div class="breed-slot-header">
              <span class="breed-slot-title">Slot ${i + 1} — ${progDef ? progDef.name : slot.program}</span>
              <span class="breed-slot-status">${this.formatDuration(remaining)} remaining</span>
            </div>
            <div class="breed-slot-body">
              <div class="breed-active-parents">
                <span class="breed-active-name">${parentA ? parentA.name : '?'}</span>
                <span class="breed-active-x">×</span>
                <span class="breed-active-name">${parentB ? parentB.name : '?'}</span>
              </div>
              <div class="farm-progress"><div class="farm-progress-bar" style="width:${pct}%"></div></div>
            </div>
          </div>`;
          continue;
        }

        // Ready slot — parent selection + program + preview
        if (!this._breedSelection[i]) this._breedSelection[i] = { a: null, b: null };
        const sel = this._breedSelection[i];
        const parentA = sel.a ? fs.animals.find(a => a.id === sel.a) : null;
        const parentB = sel.b ? fs.animals.find(a => a.id === sel.b) : null;

        // Collect available animals (not on cooldown, not used in other slot)
        const otherSel = this._breedSelection[1 - i];
        const otherUsed = otherSel ? [otherSel.a, otherSel.b].filter(Boolean) : [];
        const available = {};
        for (const animal of fs.animals) {
          if (animal.breedCooldown > 0) continue;
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
              <div class="breed-parent-slot ${sel.a ? 'filled' : 'empty'}" onclick="${sel.a ? `window._game.selectBreedParent(${i},'${sel.a}')` : ''}">
                <div class="breed-parent-label">Parent A</div>
                ${parentA ? this._renderParentCard(parentA) : '<div class="breed-parent-placeholder">Click an animal below</div>'}
              </div>
              <div class="breed-parent-x">×</div>
              <div class="breed-parent-slot ${sel.b ? 'filled' : 'empty'}" onclick="${sel.b ? `window._game.selectBreedParent(${i},'${sel.b}')` : ''}">
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
              ${parentA && parentB ? this.getBreedingPreview(sel.a, sel.b, this._breedProgram) : ''}
            </div>

            <!-- Start button -->
            ${parentA && parentB ? `
              <button class="farm-btn breed-start-btn" onclick="window._game.startBreedingFromUI(${i})">
                Start Breeding
              </button>
            ` : ''}

            <!-- Animal picker -->
            <div class="breed-picker-label">Available Animals ${filterType ? `(${this.farmAnimalDefs[filterType].name})` : ''}</div>
            <div class="breed-animal-picker">
              ${Object.entries(available).filter(([type]) => !filterType || type === filterType).map(([type, animals]) => {
                if (animals.length < 2 && !filterType) return '';
                return `<div class="breed-picker-group">
                  <div class="breed-picker-type">${this.farmAnimalDefs[type].name}</div>
                  <div class="breed-picker-cards">
                    ${animals.map(a => this._breedRenderAnimalCard(a, i, null)).join('')}
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>`;
      }

      container.innerHTML = html;
      container.dataset.rendered = "1";
    }

    _renderParentCard(animal) {
      const rarityColors = { common: '#81c784', rare: '#64b5f6', epic: '#ce93d8' };
      const traits = animal.traits.map(t => {
        const td = this.farmTraitDefs.find(d => d.id === t);
        if (!td) return '';
        return `<span class="breed-parent-trait" style="color:${rarityColors[td.rarity]};border-color:${rarityColors[td.rarity]}">${td.name}</span>`;
      }).join('');
      return `<div class="breed-parent-info">
        <div class="breed-parent-name">${animal.name}</div>
        ${animal.variant ? `<span class="farm-variant-tag">${animal.variant}</span>` : ''}
        <div class="breed-parent-traits">${traits || '<span style="color:rgba(255,234,182,0.25);font-size:0.55rem;">No traits</span>'}</div>
      </div>`;
    }

    _renderProgramCard(key, slotIndex, fc) {
      const prog = this.farmBreedPrograms[key];
      if (!prog) return '';
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
      const parentA = sel && sel.a ? this.farmState.animals.find(a => a.id === sel.a) : null;
      const costStr = parentA ? this.formatNumber(Math.floor(this.farmAnimalDefs[parentA.type].baseCost * prog.costMult)) : '—';
      const durMin = Math.floor(prog.duration / 60);
      const durStr = durMin >= 60 ? Math.floor(durMin / 60) + 'h' : durMin + 'm';

      return `<div class="breed-prog-card ${isActive ? 'active' : ''}" onclick="window._game._breedProgram='${key}';window._game.updateFarmBreedingTab();">
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
            <button class="farm-btn farm-btn-sell" onclick="window._game.sellGoods('${good}')" ${count <= 0 ? 'disabled' : ''}>
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
          const buff = fs.buffs[cat];
          if (buff && buff.remaining > 0) {
            const mins = Math.floor(buff.remaining / 60);
            const secs = Math.ceil(buff.remaining % 60);
            buffHtml += `<div class="farm-buff-slot active" title="${this.getFarmTooltip('buff_' + cat)}">${cat}: x${buff.strength.toFixed(2)} <span class="farm-buff-timer">${mins}m ${secs}s</span></div>`;
          } else {
            buffHtml += `<div class="farm-buff-slot" title="${this.getFarmTooltip('buff_' + cat)}">${cat}: --</div>`;
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
        crateList.innerHTML = crateHtml || '<span style="font-size:0.62rem;color:rgba(255,234,182,0.3);">No crates</span>';
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
          const animals = fs.animals.filter(a => a.type === type);
          if (animals.length === 0) continue;
          const rate = (animals.length / def.prodInterval) * this.getProductionModifier(type) * 60;
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
        storageEl.textContent = "Storage: " + (count > 0 ? Math.floor(totalPct / count) : 0) + "%";
      }

      if (careEl) {
        const fc = this.getFarmCount();
        if (fc < 10) {
          careEl.textContent = "Care: " + (10 - fc) + " farms needed";
          careEl.title = "Care Windows unlock when you have 10 farms. You have " + fc + ".";
        } else if (fs.careWindow.active) {
          const remaining = Math.max(0, Math.ceil((fs.careWindow.expiresAt - Date.now()) / 1000));
          careEl.textContent = "Care: " + remaining + "s ✦";
          careEl.title = "Care window ACTIVE! Click to open farm panel and use it.";
        } else {
          const next = Math.max(0, Math.ceil((fs.careWindow.nextTrigger - Date.now()) / 1000));
          const mins = Math.floor(next / 60);
          const secs = next % 60;
          careEl.textContent = "Care: " + mins + "m " + secs + "s";
          careEl.title = this.getFarmTooltip('care');
        }
      }
    }

    setFeedPlan(animalType, plan) {
      this.farmState.feedPlans[animalType] = plan;
      this._forceBarnFullRender();
    }

    showFarmNotification(text) {
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
      tabs.forEach(tab => {
        tab.addEventListener("click", () => {
          tabs.forEach(t => t.classList.remove("active"));
          tab.classList.add("active");
          const tabName = tab.dataset.tab;
          this.farmActiveTab = tabName;
          document.querySelectorAll(".farm-tab-content").forEach(tc => {
            tc.classList.toggle("hidden", tc.dataset.tab !== tabName);
          });
          // Reset breeding rendered flag so it does a fresh render when tab opens
          if (tabName === "breeding") {
            const breedContainer = document.getElementById("farm-breeding-slots");
            if (breedContainer) delete breedContainer.dataset.rendered;
          }
          // Immediately update the newly visible tab
          this.updateFarmDisplay();
        });
      });
    }

    calculateClickValue() {
      let clickValue = 1; // Base click value
      let normalMultiplier = 1;
      let x10Multiplier = 1;

      // Cursor upgrade'lerinin etkisini hesapla
      this.upgrades.cursor.forEach((upgrade) => {
        if (upgrade.purchased && !upgrade.specialEffect) {
          if (
            upgrade === this.upgrades.cursor[5] || // Ruby Cursor
            upgrade === this.upgrades.cursor[6] || // Verdant Precision
            upgrade === this.upgrades.cursor[7] // Obsidian Whisper
          ) {
            x10Multiplier *= 10;
          } else {
            normalMultiplier *= upgrade.multiplier;
          }
        }
      });

      // Dynamic boost upgrade'ini kontrol et
      const dynamicBoostUpgrade = this.upgrades.cursor[4];
      if (dynamicBoostUpgrade.purchased) {
        // Tüm binaların toplamını hesapla (cursor hariç)
        for (let key in this.items) {
          if (key !== "cursor") {
            clickValue += this.items[key].count;
          }
        }
      }

      // Normal multiplier'ları uygula
      clickValue *= normalMultiplier;

      // x10 multiplier'ları uygula
      clickValue *= x10Multiplier;

      // Donut Upgrades'lerin etkisini ekle
      if (this.upgrades.donutUpgrades) {
        this.upgrades.donutUpgrades.forEach((upgrade) => {
          if (upgrade.purchased) {
            clickValue *= upgrade.multiplier;
          }
        });
      }

      // nonItemUpgrades için DPS bonus hesaplaması
      const perSecond = this.calculatePerSecond();
      const purchasedNonItemUpgrades = this.upgrades.nonItemUpgrades.filter(
        (upgrade) => upgrade.purchased,
      ).length;

      if (purchasedNonItemUpgrades > 0) {
        const perSecondBoost = perSecond * (0.01 * purchasedNonItemUpgrades);
        clickValue += perSecondBoost;
      }

      // Aktif multiplier varsa uygula
      if (this.activeMultipliers && this.activeMultipliers.length > 0) {
        clickValue *= this.productionMultiplier;
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

    // Yeni metod: Sadece tıklama görevlerini kontrol et
    checkClickQuests() {
      Object.values(this.quests)
        .filter((quest) => quest.type === "clicks" && !quest.completed)
        .forEach((quest) => {
          const oldProgress = quest.progress;
          quest.progress = this.totalClicks;

          if (quest.progress >= quest.target && !quest.completed) {
            quest.completed = true;
            this.showNotification(`Quest completed: ${quest.title}!`);
          }
        });
    }
    showUpgrades() {
      const upgradeList = document.getElementById("upgrade-list");
      if (!upgradeList) return;

      const existingUpgrades = Array.from(upgradeList.children);
      let allUpgrades = [];
      if (this.upgrades.donutUpgrades) {
        this.upgrades.donutUpgrades.forEach((upgrade, index) => {
          if (upgrade.purchased) {
            return;
          }

          let meetsRequirement = false;
          if (upgrade.type === "totalProduced") {
            meetsRequirement = this.totalDonutsEarned >= upgrade.requirement;
          } else if (upgrade.type === "perSecond") {
            meetsRequirement = this.totalPerSecond >= upgrade.requirement;
          }

          if (meetsRequirement) {
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
          if (this.items[key] && this.items[key].count < upgrade.requirement)
            return;
          allUpgrades.push({ key, index, upgrade });
        });
      }

      // nonItemUpgrades kontrolü
      if (this.upgrades.nonItemUpgrades) {
        this.upgrades.nonItemUpgrades.forEach((upgrade, index) => {
          if (upgrade.purchased) return;

          if (upgrade.specialEffect === "automation") {
            if (!this.comboActive) return;
          } else {
            if (this.totalClicks < upgrade.requirement) return;
          }

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
        const isFirstFarm = itemKey === "farm" && item.count === 0;

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
        this.checkQuestProgress();
        this.updateDisplay();
        this.showUpgrades();
      }
    }
    buyUpgrade(itemKey, upgradeIndex) {
      let upgrade;
      if (itemKey === "nonItemUpgrades") {
        upgrade = this.upgrades.nonItemUpgrades[upgradeIndex];
      } else if (itemKey === "donutUpgrades") {
        upgrade = this.upgrades.donutUpgrades[upgradeIndex];
      } else {
        upgrade = this.upgrades[itemKey][upgradeIndex];
      }

      if (this.donutCount >= upgrade.cost && !upgrade.purchased) {
        this.donutCount -= upgrade.cost;
        upgrade.purchased = true;

        if (itemKey === "nonItemUpgrades") {
          if (upgrade.specialEffect === "automation") {
            this.autoCatcherEnabled = true;
          }
        } else if (itemKey === "cursor") {
          // Cursor için özel bir işlem yapmıyoruz
          // Cursor multiplier'ları updateTotalPerSecond'da hesaplanıyor
        } else {
          // Diğer itemlar için (donutUpgrades dahil)
          const item = this.items[itemKey];
          if (item && item.originalProduction) {
            item.originalProduction *= upgrade.multiplier;
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
      const recipesList = document.querySelector(".recipes-list");
      recipesList.innerHTML = "";

      Object.entries(this.recipes).forEach(([recipeName, recipe]) => {
        const recipeItem = document.createElement("div");
        recipeItem.className = "recipe-item";

        const scaleCurrent = recipe.scaling?.ingredients?.current || 1;
        const ingredientsHTML = Object.entries(recipe.ingredients)
          .map(([ingredient, amount]) => {
            const scaled = Math.ceil(amount * scaleCurrent);
            const hasEnough = this.hasEnoughIngredients(ingredient, scaled);
            return `<span class="ingredient ${hasEnough ? "available" : "unavailable"}">
            <img src="img/${ingredient.toLowerCase()}.webp" alt="${ingredient}" />${scaled}x
          </span>`;
          })
          .join("");

        recipeItem.innerHTML = `
        <div class="recipe-header">
          <img src="img/${recipe.image}" alt="${recipeName}" />
          <span class="recipe-name">${recipeName}</span>
        </div>
        <div class="recipe-ingredients">
          ${ingredientsHTML}
        </div>
        <button class="make-btn" data-recipe="${recipeName}" ${
          this.canMakeRecipe(recipeName) ? "" : "disabled"
        }>Make!</button>
      `;

        recipesList.appendChild(recipeItem);

        // Hover ile sağ sayfada detay göster
        recipeItem.addEventListener("mouseenter", () => {
          this.showRecipeDetail(recipeName);
        });

        // Make butonu
        const makeBtn = recipeItem.querySelector(".make-btn");
        makeBtn.addEventListener("click", () => {
          if (this.canMakeRecipe(recipeName)) {
            this.craftDonut(recipeName);
          }
        });
      });
    }

    showRecipeDetail(recipeName) {
      const recipe = this.recipes[recipeName];
      if (!recipe) return;

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
      const craftBtn = document.getElementById("craft-btn");
      if (!craftBtn) return;

      if (!this.selectedRecipe) {
        craftBtn.disabled = true;
        return;
      }

      let canCraft = true;
      for (const [ingredient, amount] of Object.entries(
        this.selectedRecipe.ingredients,
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

    craftDonut(recipeName) {
      const recipe = this.recipes[recipeName];
      if (!recipe || !this.canMakeRecipe(recipeName)) return;

      // Malzemeleri kullan
      Object.entries(recipe.ingredients).forEach(([ingredient, amount]) => {
        const scaledAmount = Math.ceil(
          amount * (recipe.scaling?.ingredients?.current || 1),
        );
        this.ingredients[ingredient].count -= scaledAmount;
      });

      // Üretim miktarını hesapla
      const productionAmount = recipe.production * this.productionMultiplier;

      // Donut üret
      this.donutCount += productionAmount;
      this.totalDonutsEarned += productionAmount;

      // craftCount'u artır
      recipe.craftCount = (recipe.craftCount || 0) + 1;

      // Bina bonus efektlerini uygula
      if (recipe.effects) {
        Object.entries(recipe.effects).forEach(([buildingKey, effect]) => {
          const building = this.items[buildingKey];
          if (building) {
            const totalBonus = recipe.craftCount * effect.productionBonus;
            building.production =
              building.originalProduction * (1 + totalBonus);

            if (this.upgrades[buildingKey]) {
              this.upgrades[buildingKey].forEach((upgrade) => {
                if (upgrade.purchased && !upgrade.specialEffect) {
                  building.production *= upgrade.multiplier;
                }
              });
            }
          }
        });
      }

      // Malzeme ihtiyacını artır (eğer scaling varsa)
      if (recipe.scaling?.ingredients) {
        recipe.scaling.ingredients.current *=
          recipe.scaling.ingredients.multiplier;
      }

      // Bildirimi göster
      this.showNotification(
        `Crafted ${this.formatNumber(productionAmount)} ${recipeName}!`,
      );

      // UI'ı güncelle
      this.updateDisplay();
      this.updateIngredientList();
      this.updateRecipeBook();
      this.updateTotalPerSecond();
    }

    canMakeRecipe(recipeName) {
      const recipe = this.recipes[recipeName];
      if (!recipe) return false;

      return Object.entries(recipe.ingredients).every(
        ([ingredient, amount]) => {
          const scaledAmount = Math.ceil(
            amount * (recipe.scaling?.ingredients?.current || 1),
          );
          return this.ingredients[ingredient]?.count >= scaledAmount;
        },
      );
    }

    hasEnoughIngredients(ingredient, amount) {
      return this.ingredients[ingredient]?.count >= amount;
    }

    addBakerWorker() {
      if (this.items.baker.count <= 0) return;
      this.bakers.push({
        productionRate: 4, // Her çalışan 4 malzeme üretir
      });

      const workerCountElem = document.getElementById("bakerWorkerCount");
      if (workerCountElem) {
        workerCountElem.textContent = this.bakers.length;
      }
    }
    updateTotalIngredientCount() {
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
    }
    updateIngredientList() {
      if (this.items.baker.count <= 0) return;
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
      if (this.items.mine.count <= 0) return;
      this.workers.push({
        productionRate: 3,
      });

      const workerCountElem = document.getElementById("workerCount");
      if (workerCountElem) {
        workerCountElem.textContent = this.workers.length;
      }
    }
    updateOreList() {
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
      if (this.items.mine.count <= 0) return;
      const marketList = document.getElementById("marketList");
      marketList.innerHTML = "";

      this.oreTypes.forEach((ore) => {
        const card = document.createElement("div");
        card.className = "market-ore-card";
        card.dataset.oreType = ore.type;

        // Fiyat değişim yüzdesini hesapla
        const history = ore.priceHistory;
        let changePercent = 0;
        let isUp = true;
        if (history.length >= 2) {
          const prev = history[history.length - 2];
          const curr = history[history.length - 1];
          changePercent = ((curr - prev) / prev) * 100;
          isUp = changePercent >= 0;
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
        priceText.textContent = this.formatNumber(ore.price);
        priceText.className = isUp ? "price-up" : "price-down";

        priceDiv.appendChild(donutIcon);
        priceDiv.appendChild(priceText);

        // Fiyat değişimi badge
        if (history.length >= 2) {
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
    updateMarketPrices() {
      if (this.items.mine.count <= 0) return;

      this.oreTypes.forEach((ore) => {
        // Trend random walk: yavaşça kayar, fiyat bir yöne gidince devam eder
        const trendDrift = (Math.random() - 0.5) * 0.4;
        ore.trend = Math.max(-1, Math.min(1, ore.trend * 0.85 + trendDrift));

        // Fiyat değişimi = trend yönü + rastgele gürültü (ore'a özel volatilite)
        const noise = (Math.random() - 0.5) * ore.volatility;
        const trendEffect = ore.trend * ore.volatility * 0.7;
        const changeFactor = trendEffect + noise;

        // Minimum fiyat koruması (basePrice'ın %20'si)
        const minPrice = ore.basePrice * 0.2;
        ore.price = Math.max(minPrice, ore.price * (1 + changeFactor));

        // Fiyat geçmişini kaydet (max 20 nokta)
        ore.priceHistory.push(ore.price);
        if (ore.priceHistory.length > 20) {
          ore.priceHistory.shift();
        }
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
    handleMarketTransaction(oreType) {
      const ore = this.oreTypes.find((o) => o.type === oreType);
      if (!ore) return;

      const orePrice = ore.price;

      if (this.orePurchaseLimit <= 0) {
        this.showTransactionError("No trades left! Wait for next cycle.");
        return;
      }

      if (this.isBuying) {
        if (this.donutCount >= orePrice) {
          this.donutCount -= orePrice;
          this.ores[oreType].count++;
          this.orePurchaseLimit--;
          this.updatePurchaseLimitBadge();
          this.updateDisplay();
          this.updateOreList();
        } else {
          this.showTransactionError("Not enough donuts!");
        }
      } else if (this.isSelling) {
        if (this.ores[oreType].count > 0) {
          this.donutCount += orePrice;
          this.ores[oreType].count--;
          this.orePurchaseLimit--;
          this.updatePurchaseLimitBadge();
          this.updateDisplay();
          this.updateOreList();
        } else {
          // Liste öğesine geçici bir efekt ekle
          const listItem = document.querySelector(
            `#marketList .market-ore-card[data-ore-type="${oreType}"]`,
          );
          if (listItem) {
            listItem.classList.add("shake-error");
            setTimeout(() => listItem.classList.remove("shake-error"), 500);
          }
        }
      }
    }

    updatePurchaseLimitBadge() {
      const badge = document.getElementById("remainingChances");
      if (badge) {
        badge.textContent = `${this.orePurchaseLimit} / 10`;
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
      if (carePetBtn) carePetBtn.addEventListener("click", () => this.performCareAction("pet"));
      if (careTreatBtn) careTreatBtn.addEventListener("click", () => this.performCareAction("treat"));

      // Contract reroll
      const rerollBtn = document.getElementById("contract-reroll-btn");
      if (rerollBtn) rerollBtn.addEventListener("click", () => this.rerollContracts());

      // Farm tabs
      this.setupFarmTabs();

      // Farm guide button
      const farmGuideBtn = document.getElementById("farm-guide-btn");
      const farmGuideOverlay = document.getElementById("farm-guide-overlay");
      const farmGuideClose = document.getElementById("farm-guide-close");
      if (farmGuideBtn && farmGuideOverlay) {
        farmGuideBtn.addEventListener("click", () => farmGuideOverlay.classList.toggle("hidden"));
      }
      if (farmGuideClose && farmGuideOverlay) {
        farmGuideClose.addEventListener("click", () => farmGuideOverlay.classList.add("hidden"));
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
          this.setupRecipeBook(); // Yeni eklenen
          this.updateCraftButton(); // Yeni eklenen
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
        efficiencyText = "All production is increased by 3%";
      } else if (itemName === "nonItemUpgrades") {
        if (upgrade.specialEffect === "automation") {
          efficiencyText =
            "I'll help you catch those delicious falling donuts!";
        } else {
          efficiencyText = "Clicking gains +1% of your DpS";
        }
      } else if (upgrade.specialEffect === "dynamicBoost") {
        let totalBuildings = 0;
        for (let key in this.items) {
          if (key !== "cursor") {
            totalBuildings += this.items[key].count;
          }
        }
        efficiencyText = `Click and and cursor gain +1 donuts for each building owned (non-cursor)`;
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
      if (window.innerWidth <= 764) return;

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

      const updateItemInfo = () => {
        let currentProduction = item.production;
        let featureHTML = "";

        if (itemKey === "cursor") {
          const dynamicBoostUpgrade = this.upgrades.cursor[4];
          if (dynamicBoostUpgrade.purchased) {
            let buildingCount = 0;
            for (let key in this.items) {
              if (key !== "cursor") {
                buildingCount += this.items[key].count;
              }
            }
            currentProduction += buildingCount;
          }
        }

        // Resmi önbellekten al veya yükle
        const imagePath = `${itemKey}.webp`;
        if (!this.imageCache.has(imagePath)) {
          const img = new Image();
          img.src = `img/${imagePath}`;
          this.imageCache.set(imagePath, img);
        }
        elements.image.src = this.imageCache.get(imagePath).src;

        // Diğer bilgileri güncelle
        elements.name.innerHTML = `<strong>${item.name}</strong>`;
        elements.owned.textContent = `Owned: ${item.count}`;

        const costColor = this.donutCount >= item.baseCost ? "#6f6" : "red";
        elements.cost.innerHTML = `
        <img src="img/donutMoney.webp" alt="donut icon" class="icon" />
        <span style="color: ${costColor};">${this.formatNumber(
          item.baseCost,
          "cost",
        )}</span>
      `;

        const itemProduction = item.count * currentProduction;
        const totalProduction = this.calculatePerSecond();

        // Contributing yüzdesini hesapla
        let percentageOfTotal = 0;
        if (totalProduction > 0) {
          percentageOfTotal = (itemProduction / totalProduction) * 100;
        }

        featureHTML = `
        Each <strong>${item.name}</strong> produces <strong>${
          itemKey === "cursor"
            ? this.formatNumber(currentProduction, "perSecond")
            : currentProduction < 1000
              ? currentProduction.toFixed(1).replace(".", ",")
              : this.formatNumber(currentProduction, "perSecond")
        } donuts</strong> per second<br>
        ${this.formatNumber(item.count, "count")} <strong>${
          item.name + "(s)"
        }</strong> producing <strong>${this.formatNumber(
          itemProduction,
          "count",
        )} donuts</strong> per second<br>
        Total produced: ${this.formatNumber(item.totalProduced, "count")}<br>
        <span style="color: #FFD700;">Contributing ${percentageOfTotal.toFixed(
          1,
        )}% of total production</span>
      `;

        // Upgrade bilgilerini ekle
        if (this.upgrades[itemKey]) {
          const purchasedUpgrades = this.upgrades[itemKey]
            .filter((upgrade) => upgrade.purchased)
            .map(
              (upgrade) =>
                `<img src="img/${upgrade.img}" alt="${upgrade.name}" class="upgrade-icon" />`,
            )
            .join("");

          if (purchasedUpgrades) {
            featureHTML += `<br>Purchased upgrades: <div class="upgrades-container">${purchasedUpgrades}</div>`;
          } else {
            featureHTML += "<br>No upgrades purchased yet.";
          }
        }

        // Farm ve Mine için bonus bilgilerini ekle
        if (itemKey === "farm") {
          const classicDonut = this.recipes["Classic Donut"];
          if (classicDonut?.craftCount > 0) {
            const bonusPercentage = classicDonut.craftCount * 10;
            featureHTML += `<br><span style="color: #98FB98;">Classic Donut Bonus: +${bonusPercentage}% production</span>`;
          }
        } else if (itemKey === "mine") {
          const whiteMagicDonut = this.recipes["White Magic Donut"];
          if (whiteMagicDonut?.craftCount > 0) {
            const bonusPercentage = whiteMagicDonut.craftCount * 10;
            featureHTML += `<br><span style="color: #98FB98;">White Magic Donut Bonus: +${bonusPercentage}% production</span>`;
          }
        }

        elements.feature.innerHTML = featureHTML;
      };

      let frameRequest;
      let lastUpdate = 0;
      const UPDATE_INTERVAL = 1000; // 1 saniyede bir güncelle

      const tick = (timestamp) => {
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
      };

      storeItem.addEventListener("mouseleave", hidePanel);
    }
    setupStoreHover() {
      for (let key in this.items) {
        const storeItem = document.querySelector(
          `.store-item[data-item="${key}"]`,
        );
        if (storeItem) {
          storeItem.addEventListener("mouseenter", () =>
            this.showItemInfo(key),
          );
        } else {
        }
      }
    }

    updatePrestigeBar() {
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
              this.prestigeCount - 1,
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
    calculateOfflineEarnings(lastActiveTime) {
      const now = Date.now();
      let offlineTime = now - lastActiveTime;

      // Limit kontrolü (12 saat)
      if (offlineTime > this.MAX_OFFLINE_TIME) {
        offlineTime = this.MAX_OFFLINE_TIME;
      }

      // Minimum 1 dakika geçmiş olmalı
      if (offlineTime < 60000) return;

      const offlineSeconds = offlineTime / 1000;
      const earnings =
        offlineSeconds * this.totalPerSecond * this.OFFLINE_EFFICIENCY;

      // Offline farm production at 25% efficiency
      if (this.farmState && this.getFarmCount() >= 1) {
        const offlineFarmSeconds = offlineSeconds * this.OFFLINE_EFFICIENCY;
        for (const [type, def] of Object.entries(this.farmAnimalDefs)) {
          const animals = this.farmState.animals.filter(a => a.type === type);
          if (animals.length === 0) continue;
          const good = def.good;
          const cap = this.getEffectiveStorageCap(good);
          const baseRate = animals.length / def.prodInterval;
          const produced = baseRate * offlineFarmSeconds;
          this.farmState.storage[good] = Math.min(this.farmState.storage[good] + produced, cap);
        }
        // Offline breeding progresses at 100%
        for (const slot of this.farmState.breeding.slots) {
          if (slot.active) {
            slot.progress += offlineSeconds;
            if (slot.progress >= slot.duration) {
              this.completeBreeding(this.farmState.breeding.slots.indexOf(slot));
            }
          }
        }
        // Offline contracts at 25% speed
        const offlineContracts = [...this.farmState.contracts.active];
        for (const contract of offlineContracts) {
          contract.elapsed += offlineFarmSeconds;
          if (contract.elapsed >= contract.duration) {
            try { this.completeContract(contract); }
            catch (e) { console.error("[Farm] offline contract error:", e); }
          }
        }
      }

      if (earnings > 0) {
        this.donutCount += earnings;
        this.totalDonutsEarned += earnings;
        this.showOfflineModal(offlineTime, earnings);
      }
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

      timeText.textContent = `You were away for ${timeString}`;
      earningsText.textContent = `+${this.formatNumber(earnings)} donuts`;

      modal.style.display = "block";

      closeBtn.onclick = () => {
        modal.style.display = "none";
        this.lastActiveTime = Date.now(); // Zamanı şimdiye sıfırla
        this.saveGame(); // Yeni zamanı kaydet ki F5 yapınca tekrar çıkmasın
        this.updateDisplay();
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
      if (!this.hasDonutClicked) return;
      document.title = `${this.formatNumber(
        this.donutCount,
      )} donuts - Donut Clicker`;
    }

    updateStatsDisplay() {
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

      // RAF kullanarak DOM güncellemelerini yap
      requestAnimationFrame(() => {
        for (const [key, value] of Object.entries(updates)) {
          if (elements[key]) {
            elements[key].textContent = this.formatNumber(value);
          }
        }
      });
    }

    // Notification yönetimi için yeni bir sınıf özelliği
    _showNotification(message, duration = 3000) {
      if (!this._notificationQueue) {
        this._notificationQueue = [];
      }

      // Multiplier mesajlarını formatla
      if (message.includes("production multiplier")) {
        message = message.replace(/(\d+\.?\d*)x/, (match) => {
          const number = parseFloat(match);
          return number.toFixed(2) + "x";
        });
      }

      // Aktif bildirimi kaldır
      const oldNotification = document.querySelector(".quest-notification");
      if (oldNotification) {
        oldNotification.remove();
      }

      // Yeni bildirimi oluştur ve kuyruğa ekle
      const notification = document.createElement("div");
      notification.className = "quest-notification";
      notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
      </div>
    `;

      // Animasyon ve kaldırma işlemlerini yönet
      const showNotification = () => {
        requestAnimationFrame(() => {
          document.body.appendChild(notification);
          notification.style.opacity = "1";
          notification.style.transform = "translateY(0)";

          setTimeout(() => {
            notification.style.opacity = "0";
            notification.style.transform = "translateY(-20px)";
            notification.addEventListener(
              "transitionend",
              () => {
                notification.remove();
                // Kuyrukta bekleyen bir bildirim varsa göster
                if (this._notificationQueue.length > 0) {
                  const nextNotification = this._notificationQueue.shift();
                  nextNotification();
                }
              },
              { once: true },
            );
          }, duration);
        });
      };

      // Eğer aktif bildirim yoksa hemen göster, varsa kuyruğa ekle
      if (document.querySelector(".quest-notification")) {
        this._notificationQueue.push(showNotification);
      } else {
        showNotification();
      }
    }

    // Eski showNotification fonksiyonlarını kaldır ve yeni fonksiyonu kullan
    showNotification(message) {
      this._showNotification(message);
    }

    showGameSaved() {
      this._showNotification("Game saved!", 2000);
    }

    updateActiveMultiplierDisplay() {
      requestAnimationFrame(() => {
        const display = document.getElementById("active-multiplier-display");
        if (display) {
          display.textContent = `Active Multiplier: ${this.productionMultiplier.toFixed(
            2,
          )}x`;
        }
      });
    }

    sellAllOres() {
      const sales = this.oreTypes.reduce(
        (acc, ore) => {
          const count = this.ores[ore.type]?.count || 0;
          if (count > 0) {
            const earnings = ore.price * count;
            this.ores[ore.type].count = 0;
            return {
              earnings: acc.earnings + earnings,
              count: acc.count + count,
            };
          }
          return acc;
        },
        { earnings: 0, count: 0 },
      );

      if (sales.count > 0) {
        this.donutCount += sales.earnings;
        this.showNotification(
          `Sold ${this.formatNumber(sales.count)} ores for ${this.formatNumber(
            sales.earnings,
          )} donuts!`,
        );

        requestAnimationFrame(() => {
          this.updateDisplay();
          this.updateOreList();
        });
      } else {
        this.showNotification("No ores to sell!");
      }
    }
    getRandomBakeryName() {
      const randomIndex = Math.floor(Math.random() * this.bakeryNames.length);
      return this.bakeryNames[randomIndex];
    }
    updateBakeryName() {
      const bakeryNameElement = document.getElementById("bakery-name");
      if (bakeryNameElement) {
        // Eğer localStorage'da isim varsa onu kullan, yoksa rastgele bir isim ata VE kaydet
        let savedName = localStorage.getItem("bakeryName");
        if (!savedName) {
          savedName = this.getRandomBakeryName() + "'s Bakery";
          localStorage.setItem("bakeryName", savedName);
        }
        this.currentBakeryName = savedName;
        bakeryNameElement.textContent = this.currentBakeryName;
      }
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

    setupFeedbackPopup() {
      const popup = document.getElementById("feedback-popup");
      const closeBtn = document.getElementById("close-feedback");

      if (!popup || !closeBtn) return;

      // Check if user already closed it
      if (localStorage.getItem("feedbackClosed") === "true") {
        popup.classList.add("hidden");
        return;
      }

      // Show after a short delay
      setTimeout(() => {
        popup.classList.remove("hidden");
      }, 5000);

      closeBtn.addEventListener("click", () => {
        popup.classList.add("hidden");
        localStorage.setItem("feedbackClosed", "true");
      });
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
      const newBakeryName = document
        .getElementById("newBakeryName")
        .value.trim();
      if (newBakeryName) {
        this.currentBakeryName = newBakeryName + "'s Bakery";
        document.getElementById("bakery-name").textContent =
          this.currentBakeryName;

        // Kullanıcı isim değiştirdiğinde yeni ismi kaydet
        localStorage.setItem("bakeryName", this.currentBakeryName);
        this.closeChangeNameModal();
      }
    }
    saveGame() {
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
          currentScaling: this.recipes[key].scaling?.ingredients?.current || 1,
        };
      }

      const gameState = {
        gameVersion: this.currentVersion,
        items: itemData,
        upgrades: upgradeData,
        quests: questData,
        recipes: recipeData,
        donutCount: this.donutCount,
        totalDonutsEarned: this.totalDonutsEarned,
        totalClicks: this.totalClicks,
        prestigeCount: this.prestigeCount,
        nextPrestigeThreshold: this.nextPrestigeThreshold,
        ores: this.ores,
        oreTypePrices: this.oreTypes.map((o) => ({
          type: o.type,
          price: o.price,
          priceHistory: o.priceHistory,
          trend: o.trend,
        })),
        workers: this.workers,
        bakers: this.bakers,
        ingredients: this.ingredients,
        recipes: this.recipes,
        hasDonutClicked: this.hasDonutClicked,
        productionMultiplier: this.productionMultiplier,
        activeMultipliers: this.activeMultipliers,
        currentBakeryName: this.currentBakeryName,
        donutCoin: this.donutCoin,
        farmState: this.farmState,
        farmNextAnimalId: this.farmNextAnimalId,
        lastActiveTime: Date.now(),
      };

      const secureData = this.encryptSave(gameState);
      localStorage.setItem("gameState", secureData);
      this.showGameSaved();
    }
    loadGame() {
      const savedGame = localStorage.getItem("gameState");
      if (savedGame) {
        let gameState;

        // Geriye dönük uyumluluk: Eğer veri { ile başlıyorsa eski düz JSON'dır
        if (savedGame.startsWith("{")) {
          gameState = JSON.parse(savedGame);
        } else {
          // Yeni şifreli format
          gameState = this.decryptSave(savedGame);
        }

        if (!gameState) return;

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
              gameState.upgrades[key].forEach((isPurchased, index) => {
                if (this.upgrades[key][index]) {
                  this.upgrades[key][index].purchased = isPurchased;
                }
              });
            }
          }
        }

        // Quests yükle
        if (gameState.quests) {
          for (let key in gameState.quests) {
            if (this.quests[key]) {
              this.quests[key].progress = gameState.quests[key].progress || 0;
              this.quests[key].completed =
                gameState.quests[key].completed || false;
              this.quests[key].claimed = gameState.quests[key].claimed || false;
            }
          }
        }

        // Recipes yükle
        if (gameState.recipes) {
          for (let key in gameState.recipes) {
            if (this.recipes[key]) {
              this.recipes[key].craftCount =
                gameState.recipes[key].craftCount || 0;
              if (this.recipes[key].scaling?.ingredients) {
                this.recipes[key].scaling.ingredients.current =
                  gameState.recipes[key].currentScaling || 1;
              }
            }
          }
        }

        // Diğer basit veriler
        this.donutCount = gameState.donutCount || 0;
        this.totalDonutsEarned = gameState.totalDonutsEarned || 0;
        this.totalClicks = gameState.totalClicks || 0;
        this.prestigeCount = gameState.prestigeCount || 0;
        this.nextPrestigeThreshold =
          gameState.nextPrestigeThreshold || 300000000;
        this.currentBakeryName =
          gameState.currentBakeryName || "My Awesome Bakery";
        this.hasDonutClicked = gameState.hasDonutClicked || false;
        this.productionMultiplier = gameState.productionMultiplier || 1;
        this.activeMultipliers = gameState.activeMultipliers || [];
        this.ores = gameState.ores || this.ores;

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
        this.bakers = gameState.bakers || [];
        this.ingredients = gameState.ingredients || {};
        this.recipes = gameState.recipes || this.recipes;
        this.lastBakerProduction = gameState.lastBakerProduction || Date.now();
        this.lastMineProduction = gameState.lastMineProduction || Date.now();
        this.lastUpdateTime = Date.now(); // Bu satırda kalmalı.

        // Farm state yükle
        if (gameState.farmState) {
          const defaults = this.createDefaultFarmState();
          this.farmState = { ...defaults, ...gameState.farmState };
          // Ensure nested objects have defaults
          this.farmState.storage = { ...defaults.storage, ...gameState.farmState.storage };
          this.farmState.feedPlans = { ...defaults.feedPlans, ...gameState.farmState.feedPlans };
          this.farmState.contracts = { ...defaults.contracts, ...gameState.farmState.contracts };
          this.farmState.breeding = gameState.farmState.breeding || defaults.breeding;
          this.farmState.mastery = { ...defaults.mastery, ...gameState.farmState.mastery };
          this.farmState.buffs = { ...defaults.buffs, ...gameState.farmState.buffs };
          this.farmState.careWindow = { ...defaults.careWindow, ...gameState.farmState.careWindow };
          this.farmState.careBonus = gameState.farmState.careBonus || defaults.careBonus;
          this.farmState.crates = gameState.farmState.crates || [];
          this.farmState.rumors = gameState.farmState.rumors || defaults.rumors;
          this.farmState.stats = { ...defaults.stats, ...gameState.farmState.stats };
        }
        if (gameState.farmNextAnimalId) {
          this.farmNextAnimalId = gameState.farmNextAnimalId;
        }

        // DonutCoin verilerini yükle
        this.donutCoin = gameState.donutCoin || {
          count: 0,
          lastClaimTime: 0,
          claimInterval: 24 * 60 * 60 * 1000,
        };

        // totalPerSecond'ın doğru hesaplandığından emin ol
        this.updateTotalPerSecond();

        // Çevrimdışı kazanç hesapla
        if (gameState.lastActiveTime) {
          this.calculateOfflineEarnings(gameState.lastActiveTime);
        }

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

        // Fiyat Düzeltme Yaması (Save Bug Fix)
        this.fixBuildingCosts();
      }
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

    // --- Save Güvenlik Metotları ---
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
      localStorage.setItem("gameState", JSON.stringify(gameState));
    }
    resetGame() {
      const confirmation = confirm(
        "Are you sure you want to reset the game? All your progress will be deleted.",
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
      this.closeQuestsButton = document.getElementById("close-quests-menu");

      // Event listener'ları ekle
      this.questsButton.addEventListener("click", () => this.toggleQuestMenu());
      this.closeQuestsButton.addEventListener("click", () =>
        this.closeQuestMenu(),
      );

      // Tab sistemi
      document.querySelectorAll(".tab-button").forEach((button) => {
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
      this.updateQuestDisplay();
    }

    closeQuestMenu() {
      this.questsMenu.classList.add("hidden");
    }

    updateQuestDisplay() {
      const activeContainer = this.questsMenu.querySelector(
        ".quests-container.active",
      );
      const completedContainer = this.questsMenu.querySelector(
        ".quests-container.completed",
      );

      if (activeContainer) this.renderQuests(activeContainer, false);
      if (completedContainer) this.renderQuests(completedContainer, true);
    }

    renderQuests(container, showCompleted) {
      container.innerHTML = "";
      const fragment = document.createDocumentFragment();

      const quests = Object.values(this.quests)
        .filter((quest) => (showCompleted ? quest.claimed : !quest.claimed))
        .sort((a, b) => {
          // Tamamlanmış görevleri üste al
          if (a.completed && !b.completed) return -1;
          if (!a.completed && b.completed) return 1;
          return 0;
        });

      quests.forEach((quest) => {
        const questElement = this.createQuestElement(quest);
        if (questElement) fragment.appendChild(questElement);
      });

      container.appendChild(fragment);
    }

    switchQuestTab(tabName) {
      document.querySelectorAll(".tab-button").forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === tabName);
      });

      document.querySelectorAll(".quests-container").forEach((container) => {
        container.classList.toggle(
          "hidden",
          !container.classList.contains(tabName),
        );
      });
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
                  quest.progress,
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
      if (!quest.completed || quest.claimed) return;

      // Multiplier reward kontrolü
      if (quest.reward.type === "multiplier") {
        // Aktif multiplier var mı kontrol et
        if (this.activeMultipliers.length > 0) {
          this.showNotification(
            "You cannot claim a multiplier reward while another one is active!",
          );
          return;
        }
      }

      // Normal ödül işleme
      if (quest.reward.type === "donuts") {
        this.donutCount += quest.reward.amount;
        this.showNotification(
          `+${this.formatNumber(quest.reward.amount)} donuts earned!`,
        );
      } else if (quest.reward.type === "multiplier") {
        this.activateMultiplier(quest.reward.amount, quest.reward.duration);
        this.showNotification(
          `${quest.reward.amount.toFixed(2)}x production multiplier active for ${
            quest.reward.duration / 1000
          } seconds!`,
        );
      }

      quest.claimed = true;
      quest.completionTime = Date.now();

      // Quest elementini güncelle
      const questElement = document.querySelector(
        `[data-quest-id="${quest.id}"]`,
      );
      if (questElement) {
        const completedContainer = document.querySelector(
          ".quests-container.completed",
        );
        completedContainer.appendChild(questElement);

        const claimButton = questElement.querySelector(".claim-reward");
        claimButton.disabled = true;
        claimButton.textContent = "Completed";
      }

      this.updateDisplay();
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
        (m) => m.endTime > Date.now(),
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
          (m) => m.id !== multiplier.id,
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
      // Throttle kontrolü - 250ms
      const now = Date.now();
      if (now - (this._lastQuestCheck || 0) < 250) {
        return;
      }
      this._lastQuestCheck = now;

      let hasNewCompletedQuest = false;

      // Tamamlanmamış görevleri filtrele ve sadece onları kontrol et
      Object.values(this.quests)
        .filter((quest) => !quest.completed && !quest.claimed)
        .forEach((quest) => {
          const oldProgress = quest.progress;
          let newProgress;

          // Switch case yerine lookup table kullan
          const progressCalculators = {
            production: () => Math.floor(this.totalDonutsEarned),
            building: () => this.items[quest.buildingType].count,
            clicks: () => this.totalClicks,
            combined: () =>
              Math.min(...Object.values(this.items).map((item) => item.count)),
          };

          newProgress = progressCalculators[quest.type]?.() ?? oldProgress;

          // Progress değişmişse güncelle
          if (newProgress !== oldProgress) {
            quest.progress = newProgress;

            // Quest tamamlandıysa
            if (!quest.completed && quest.progress >= quest.target) {
              quest.completed = true;
              hasNewCompletedQuest = true;

              // Bildirim göster
              requestAnimationFrame(() => {
                this.showNotification(`Quest completed: ${quest.title}!`);
                // Quests div'ini ve img container'ını seç
                const questsDiv = document.querySelector(".page-item#quests");
                const questsImgContainer = questsDiv.querySelector(".page-img");

                // Eğer zaten bir completed etiketi yoksa ekle
                const existingLabel = questsImgContainer.querySelector(
                  ".completed-feature-label",
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
                        ".completed-feature-label",
                      );
                      if (label) {
                        label.remove();
                      }
                      // Event listener'ı kaldır
                      questsDiv.removeEventListener(
                        "click",
                        removeCompletedLabel,
                      );
                    }
                  };

                  // Click event listener'ı ekle
                  questsDiv.addEventListener("click", removeCompletedLabel);
                }
              });
            }

            // Quest menüsü açıksa güncelle
            if (!this.questsMenu.classList.contains("hidden")) {
              this.updateQuestDisplay();
            }
          }
        });
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

    // Bina sayısı hesaplaması için cache
    getTotalBuildingCount() {
      const now = Date.now();
      if (
        now - this.lastBuildingUpdate > 1000 ||
        this.cachedBuildingCount === 0
      ) {
        let total = 0;
        for (let key in this.items) {
          if (key !== "cursor") {
            total += this.items[key].count;
          }
        }
        this.cachedBuildingCount = total;
        this.lastBuildingUpdate = now;
      }
      return this.cachedBuildingCount;
    }

    setupAutoBuyer() {
      const container = document.querySelector(".auto-buyer-items");
      const toggle = document.getElementById("auto-buyer-toggle");

      // Ana toggle event listener
      toggle.checked = this.autoBuyer.enabled;
      toggle.addEventListener("change", (e) => {
        this.autoBuyer.enabled = e.target.checked;
        this.saveGame();
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
          this.autoBuyer.settings[itemKey].threshold = parseFloat(
            e.target.value,
          );
        }
        this.saveGame();
      });
    }

    checkAutoBuyer() {
      if (!this.autoBuyer.enabled) return;

      for (let key in this.items) {
        const settings = this.autoBuyer.settings[key];
        if (!settings.enabled) continue;

        const item = this.items[key];
        const bulkCost = this.calculateBulkPrice(item, this.purchaseAmount);

        if (this.donutCount >= bulkCost * settings.threshold) {
          this.buyItem(key);
        }
      }
    }

    // Utility fonksiyonları
    _debounce(func, wait) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }

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
        // Özel class ismiyle yeni etiket oluştur
        const newLabel = document.createElement("div");
        newLabel.className = "combo-feature-label";
        newLabel.textContent = "Try new feature!";

        // Label'ı doğrudan combos elementinin üzerine yerleştir
        newLabel.style.cssText = `
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff6b6b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            animation: bounce 1s infinite;
        `;

        combosElement.style.position = "relative";
        combosElement.appendChild(newLabel);

        // Combo elementine pulse efekti ekle
        combosElement.classList.add("pulse-effect", "new-feature");

        combosElement.addEventListener("click", () => {
          // Tıklandığında efektleri kaldır
          combosElement.classList.remove("pulse-effect", "new-feature");
          const label = combosElement.querySelector(".combo-feature-label");
          if (label) label.remove();

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
      this.donutCount += clickValue;
      this.totalDonutsEarned += clickValue;

      // Temizlik
      setTimeout(() => {
        donut.remove();
        catchEffect.remove();
      }, 300);

      this.lastClickSuccess = true;
      this.updateDisplay();
    }

    handleComboDonutClick(event, donutElement) {
      event.stopPropagation();

      // Normal click value hesapla
      let clickValue = this.calculateClickValue();

      // Eğer son tıklama başarılıysa combo bonusu uygula
      if (this.lastClickSuccess) {
        clickValue *= this.comboMultiplier;
      }

      this.donutCount += clickValue;
      this.totalDonutsEarned += clickValue;

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

      // Her saniye kalan süreyi güncelle
      setInterval(() => {
        this.updateDonutCoinDisplay();
      }, 1000);
    }

    updateDonutCoinDisplay() {
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
      img.loading = "lazy";
      img.decoding = "async";

      if (img.dataset.width && img.dataset.height) {
        img.width = img.dataset.width;
        img.height = img.dataset.height;
      }
    }
  });
})();
