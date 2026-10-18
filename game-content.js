// Compatibility-sensitive content: preserve category and array order.
// Each factory creates fresh mutable content objects for one Game instance.
(function () {
  // Long-form ordinary ×2 ladders: 1/15/30/50/100 (Baker extras 150/200).
  // Fixed tier prices = entry anchor × [1, 5, 50, 5000, 500000].
  // Preserve historical anchors/Baker entry and extras; new anchors round 10B
  // to two significant digits. See scripts/analyze-upgrade-economy.js.
  // Cursor and utility/global upgrades are deliberately excluded.
  function createUpgradeDefinitions() {
    return {
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
            "Your non-cursor buildings now boost both cursor output and click power.",
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
          cost: 95000000000,
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
          cost: 1050000000000,
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
          cost: 11500000000000,
          multiplier: 2,
          purchased: false,
          requirement: 50,
          img: "natureUpgrade-4.webp",
          description:
            "A symbol of eternal growth, spruce trees inspire endless donut production.",
        },
        {
          name: "Eternal Eucalyptus",
          cost: 1150000000000000,
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
          requirement: 2500000,
          img: "donutUpgrade-6.webp",
          description: "So sweet it bends time. Maybe.",
          type: "totalProduced",
        },
        {
          name: "Berry Burst",
          cost: 250000,
          multiplier: 1.03,
          purchased: false,
          requirement: 5000,
          img: "donutUpgrade-5.webp",
          description: "Explodes in flavor, not in your hand.",
          type: "perSecond",
        },
        {
          name: "Caramel Crown",
          cost: 1000000,
          multiplier: 1.03,
          purchased: false,
          requirement: 25000000,
          img: "donutUpgrade-4.webp",
          description: "Wear it like a king. Eat it like a fool.",
          type: "totalProduced",
        },
        {
          name: "Berry Bliss",
          cost: 1000000,
          multiplier: 1.03,
          purchased: false,
          requirement: 25000,
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
          requirement: 250000000,
          img: "donutUpgrade-2.webp",
          description: "So zen, it might start meditating on its own.",
          type: "totalProduced",
        },
        {
          name: "Banana Bounce",
          cost: 5000000,
          multiplier: 1.03,
          purchased: false,
          requirement: 100000,
          img: "donutUpgrade-1.webp",
          description: "Bounces back with more potassium.",
          type: "perSecond",
        },
      ],

      // Append new categories: existing category order and upgrade indices are save identities.
      neuralNetworkBakery: [
        {
          name: "Smart Dough",
          cost: 25000000000,
          multiplier: 2,
          purchased: false,
          requirement: 1,
          img: "neural-network-bakery1.webp",
          description: "The dough learns a new trick: making twice as many donuts.",
        },
        {
          name: "Glaze Training",
          cost: 125000000000,
          multiplier: 2,
          purchased: false,
          requirement: 15,
          img: "neural-network-bakery2.webp",
          description: "Practice makes perfect glaze. Double the output, skip the homework.",
        },
        {
          name: "Baker’s Memory",
          cost: 1250000000000,
          multiplier: 2,
          purchased: false,
          requirement: 30,
          img: "neural-network-bakery3.webp",
          description: "Every great batch remembered, every new batch twice as big.",
        },
        {
          name: "Dream Kitchen",
          cost: 125000000000000,
          multiplier: 2,
          purchased: false,
          requirement: 50,
          img: "neural-network-bakery4.webp",
          description: "Even while dreaming of donuts, the bakery doubles its production.",
        },
        {
          name: "The Perfect Batch",
          cost: 12500000000000000,
          multiplier: 2,
          purchased: false,
          requirement: 100,
          img: "neural-network-bakery5.webp",
          description: "The recipe for perfection turns out to be twice the donuts.",
        },
      ],
      portal: [
        {
          name: "Fresh Gateway",
          cost: 280000000000,
          multiplier: 2,
          purchased: false,
          requirement: 1,
          img: "portal1.webp",
          description: "Open a wider gateway for twice the fresh donuts.",
        },
        {
          name: "Dough Passage",
          cost: 1400000000000,
          multiplier: 2,
          purchased: false,
          requirement: 15,
          img: "portal2.webp",
          description: "A shortcut through space brings twice the dough.",
        },
        {
          name: "Glaze Dimension",
          cost: 14000000000000,
          multiplier: 2,
          purchased: false,
          requirement: 30,
          img: "portal3.webp",
          description: "A whole dimension of glaze doubles Portal production.",
        },
        {
          name: "Infinite Delivery",
          cost: 1400000000000000,
          multiplier: 2,
          purchased: false,
          requirement: 50,
          img: "portal4.webp",
          description: "Across every doorway, twice the donuts arrive.",
        },
        {
          name: "Donut Multiverse",
          cost: 140000000000000000,
          multiplier: 2,
          purchased: false,
          requirement: 100,
          img: "portal5.webp",
          description: "Every universe agrees: more donuts. Double Portal production.",
        },
      ],
      capitalCrest: [
        {
          name: "Crown Oven",
          cost: 3000000000000,
          multiplier: 2,
          purchased: false,
          requirement: 1,
          img: "capital-crest1.webp",
          description: "A royal oven worthy of twice the donuts.",
        },
        {
          name: "Golden Treasury",
          cost: 15000000000000,
          multiplier: 2,
          purchased: false,
          requirement: 15,
          img: "capital-crest2.webp",
          description: "Invest the royal reserves in twice the baking power.",
        },
        {
          name: "Royal Kitchens",
          cost: 150000000000000,
          multiplier: 2,
          purchased: false,
          requirement: 30,
          img: "capital-crest3.webp",
          description: "The royal kitchens double their donut production.",
        },
        {
          name: "Grand Banquet",
          cost: 15000000000000000,
          multiplier: 2,
          purchased: false,
          requirement: 50,
          img: "capital-crest4.webp",
          description: "Prepare a feast with twice the Capital Crest output.",
        },
        {
          name: "Eternal Crown",
          cost: 1500000000000000000,
          multiplier: 2,
          purchased: false,
          requirement: 100,
          img: "capital-crest5.webp",
          description: "A crowning achievement: double Capital Crest production once more.",
        },
      ],
    };
  }

  function createBuildingDefinitions() {
    return {
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
  }

  window.DonutClickerContent = { createUpgradeDefinitions, createBuildingDefinitions };
})();
