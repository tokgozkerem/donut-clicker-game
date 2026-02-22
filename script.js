(function () {
  class Game {
    constructor() {
      this.currentVersion = "1.4.5";
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
      this.productionMultiplier = 1;
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
        { type: "Copper", rarity: 0.7, price: this.items.mine.baseCost * 0.01, basePrice: this.items.mine.baseCost * 0.01, priceHistory: [], trend: 0, volatility: 0.02 },
        { type: "Iron", rarity: 0.2, price: this.items.mine.baseCost * 0.025, basePrice: this.items.mine.baseCost * 0.025, priceHistory: [], trend: 0, volatility: 0.035 },
        { type: "Gold", rarity: 0.075, price: this.items.mine.baseCost * 0.05, basePrice: this.items.mine.baseCost * 0.05, priceHistory: [], trend: 0, volatility: 0.05 },
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
              event.target.closest(".item-img img.active-baker-effect")
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
            const scaled = amount * scaleCurrent;
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
        const scaledAmount =
          amount * (recipe.scaling?.ingredients?.current || 1);
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
          const scaledAmount =
            amount * (recipe.scaling?.ingredients?.current || 1);
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
      gradient.addColorStop(0, isUp ? "rgba(129, 199, 132, 0.3)" : "rgba(253, 145, 147, 0.3)");
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
