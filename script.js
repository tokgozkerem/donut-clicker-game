let bakeryNames = [
  "Sweet Crust",
  "Golden Dough",
  "Crumble & Whisk",
  "Hearthside Delights",
  "Flour & Frost",
  "The Cookie Cradle",
  "Velvet Slice",
  "Whisk & Roll",
  "Dreamy Dough",
  "Sugar Leaf",
  "Buttercream Bliss",
  "Sunrise Sweets",
  "Poppyseed Pastries",
  "Honeycomb Bakehouse",
  "Frost & Glaze",
  "Toasted Almond",
  "The Rolling Pin",
  "Heavenly Crumbs",
  "Cinnamon Cloud",
  "Sugar Kneads",
  "Whisked Wonders",
  "Golden Grain",
  "Frosted Hearth",
  "Moonlight Muffins",
  "Brioche & Bliss",
  "Nutmeg Nest",
  "The Dough Whisperer",
  "Caramel Swirl",
  "Vanilla Bean Delights",
  "Ovenly Treats",
  "Sprinkled Joy",
  "Cozy Loaf",
  "Puff & Crust",
  "Butter & Spice",
  "The Floury Tale",
  "Dreamy Crust",
  "Velvet Whisk",
  "Almond Blossom",
  "Cloud Pastries",
  "Sweet Oven",
  "Croissant Corner",
  "Flour & Feather",
  "The Sugar Tapestry",
  "Petit Patisserie Delights",
  "Golden Oven Sweets",
  "Maple Crust",
  "Twisted Treats",
  "Whisk & Crumb",
  "Cinnamon Whirl",
  "Buttercup Bakes",
];
const clickSounds = [
  new Audio("sounds/click1.mp3"),
  new Audio("sounds/click2.mp3"),
  new Audio("sounds/click3.mp3"),
  new Audio("sounds/click4.mp3"),
];

// Upgrade'ler her item için dizi şeklinde yapılandırılmış veri
const upgrades = {
  cursor: [
    {
      name: "First Upgrade!",
      cost: 100,
      multiplier: 2,
      purchased: false,
      requirement: 1,
      img: "cursorUpgrade.png",
      description:
        "A rudimentary extension that powers your donut factory into overdrive.",
    },
    {
      name: "Tidal Surge",
      cost: 500,
      multiplier: 2,
      purchased: false,
      requirement: 1,
      img: "cursorUpgrade-2.png",
      description:
        "Unleash a wave of efficiency, drowning inefficiency in a sea of productivity.",
    },
    {
      name: "Blazing Touch",
      cost: 5000,
      multiplier: 2,
      purchased: false,
      requirement: 15,
      img: "cursorUpgrade-3.png",
      description:
        "Ignite the donut cosmos with a touch that burns through production limits.",
    },
    {
      name: "Abyssal Grasp",
      cost: 50000,
      multiplier: 2,
      purchased: false,
      requirement: 25,
      img: "cursorUpgrade-4.png",
      description:
        "Reach deep into the void, pulling forth untapped donut-making power.",
    },
    {
      name: "Efficient Clicks",
      cost: 500000,
      multiplier: 1.01, // %1 oranında clickValue artışı
      purchased: false,
      requirement: 35,
      img: "cursorUpgrade-5.png",
      description:
        "Clicking efficiency increases with each second, gaining 1% of the per-second production.",
    },
    {
      name: "Golden Cursor",
      cost: 5000000,
      multiplier: 2,
      purchased: false,
      requirement: 50,
      img: "cursorUpgrade-6.png",
      description:
        "A gilded tool of infinite precision, sculpting perfect donuts with every click.",
    },
  ],
  baker: [
    {
      name: "Crustaire",
      cost: 1000,
      multiplier: 2,
      purchased: false,
      requirement: 1,
      img: "bakerUpgrade-1.png",
      description:
        "A master baker whose mere presence doubles the doughy yield of your donuts.",
    },
    {
      name: "Doughmire",
      cost: 5250,
      multiplier: 2,
      purchased: false,
      requirement: 5,
      img: "bakerUpgrade-2.png",
      description:
        "Harness the power of ancient dough magic to knead perfection into every donut.",
    },
    {
      name: "Flourist",
      cost: 52500,
      multiplier: 2,
      purchased: false,
      requirement: 15,
      img: "bakerUpgrade-3.png",
      description:
        "A flour conjurer whose delicate touch transforms ingredients into donut gold.",
    },
    {
      name: "Batteron",
      cost: 525000,
      multiplier: 2,
      purchased: false,
      requirement: 25,
      img: "bakerUpgrade-4.png",
      description:
        "An elemental baker, crafting cosmic donuts from primordial batter.",
    },
    {
      name: "Crèmeor",
      cost: 5250000,
      multiplier: 2,
      purchased: false,
      requirement: 45,
      img: "bakerUpgrade-5.png",
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
      img: "farmUpgrade-1.png",
      description:
        "Lush fields bursting with crops, nurturing the perfect ingredients for your donuts.",
    },
    {
      name: "Golden Acre",
      cost: 50000,
      multiplier: 2,
      purchased: false,
      requirement: 5,
      img: "farmUpgrade-2.png",
      description:
        "A golden field where each stalk of grain yields a bounty of donut flour.",
    },
    {
      name: "Elder Grove",
      cost: 500000,
      multiplier: 2,
      purchased: false,
      requirement: 20,
      img: "farmUpgrade-3.png",
      description:
        "An ancient grove, where the oldest trees bear the finest donut fruits.",
    },
    {
      name: "Ironroot Fields",
      cost: 5000000,
      multiplier: 2,
      purchased: false,
      requirement: 50,
      img: "farmUpgrade-4.png",
      description:
        "Fields with roots of iron, pulling forth the strongest crops for donut production.",
    },
    {
      name: "Magicland",
      cost: 50000000,
      multiplier: 2,
      purchased: false,
      requirement: 100,
      img: "farmUpgrade-5.png",
      description:
        "A mystical realm where the land itself grows donut-making magic.",
    },
  ],
  mine: [
    {
      name: "Ironclad Plains",
      cost: 25000,
      multiplier: 2,
      purchased: false,
      requirement: 1,
      img: "mineUpgrade-1.png",
      description:
        "Sturdy plains rich in minerals, fueling your donut factory with raw power.",
    },
    {
      name: "Golden Veil",
      cost: 125000,
      multiplier: 2,
      purchased: false,
      requirement: 5,
      img: "mineUpgrade-2.png",
      description:
        "A mine where every vein glistens with pure golden resources for your donuts.",
    },
    {
      name: "Diamondspire",
      cost: 1250000,
      multiplier: 2,
      purchased: false,
      requirement: 20,
      img: "mineUpgrade-3.png",
      description:
        "Towering spires of diamonds, feeding your production with unrivaled hardness and beauty.",
    },
    {
      name: "Emerald Hollow",
      cost: 12500000,
      multiplier: 2,
      purchased: false,
      requirement: 50,
      img: "mineUpgrade-4.png",
      description:
        "A deep cavern of shimmering emeralds, infusing your donuts with rare energy.",
    },
    {
      name: "Ruby Ascendant",
      cost: 125000000,
      multiplier: 2,
      purchased: false,
      requirement: 100,
      img: "mineUpgrade-5.png",
      description:
        "A mine that ascends to the heavens, where rubies pulse with the heart of donut production.",
    },
  ],
  factory: [
    {
      name: "Ironclad Nexus",
      cost: 825000,
      multiplier: 2,
      purchased: false,
      requirement: 1,
      img: "factoryUpgrade-1.png",
      description:
        "A mighty nexus of steel and steam, churning out donuts at blinding speeds.",
    },
    {
      name: "Aureum Heart",
      cost: 4125000,
      multiplier: 2,
      purchased: false,
      requirement: 5,
      img: "factoryUpgrade-2.png",
      description:
        "At the core of your factory, the golden heart beats with unstoppable donut-making power.",
    },
    {
      name: "Diamondflare Core",
      cost: 41250000,
      multiplier: 2,
      purchased: false,
      requirement: 15,
      img: "factoryUpgrade-3.png",
      description:
        "A blazing core of diamond-powered energy, driving your factory to new heights.",
    },
    {
      name: "Emerald Vein",
      cost: 412500000,
      multiplier: 2,
      purchased: false,
      requirement: 35,
      img: "factoryUpgrade-4.png",
      description:
        "Hidden deep in your factory lies an emerald vein, enhancing production with every pulse.",
    },
    {
      name: "Rubyflare Engine",
      cost: 4125000000,
      multiplier: 2,
      purchased: false,
      requirement: 50,
      img: "factoryUpgrade-5.png",
      description:
        "An engine of pure rubyfire, propelling your donut output beyond the stars.",
    },
  ],
};
// Donut ve üretim item'ları için yapılandırılmış veri
const items = {
  cursor: {
    name: "Cursor",
    count: 0,
    baseCost: 15,
    originalBaseCost: 15, // Orijinal fiyatı sakla
    costMultiplier: 1.155,
    production: 0.1,
    originalProduction: 0.1,
    totalProduced: 0,
  },
  baker: {
    name: "Baker",
    count: 0,
    baseCost: 115,
    originalBaseCost: 115, // Orijinal fiyatı sakla
    costMultiplier: 1.15,
    production: 1,
    originalProduction: 1,
    totalProduced: 0,
  },
  farm: {
    name: "Farm",
    count: 0,
    baseCost: 1400,
    originalBaseCost: 1400, // Orijinal fiyatı sakla
    costMultiplier: 1.1447,
    production: 7,
    originalProduction: 7,
    totalProduced: 0,
  },
  mine: {
    name: "Mine",
    count: 0,
    baseCost: 16000,
    originalBaseCost: 16000, // Orijinal fiyatı sakla
    costMultiplier: 1.15,
    production: 50,
    originalProduction: 50,
    totalProduced: 0,
  },
  factory: {
    name: "Factory",
    count: 0,
    baseCost: 176000,
    originalBaseCost: 176000, // Orijinal fiyatı sakla
    costMultiplier: 1.1557,
    production: 255,
    originalProduction: 255,
    totalProduced: 0,
  },
  portal: {
    name: "Portal",
    count: 0,
    baseCost: 1927200,
    originalBaseCost: 1927200, // Orijinal fiyatı sakla
    costMultiplier: 1.16,
    production: 1225,
    originalProduction: 1225,
    totalProduced: 0,
  },
  powerPlant: {
    name: "Power Plant",
    count: 0,
    baseCost: 20910000,
    originalBaseCost: 20910000, // Orijinal fiyatı sakla
    costMultiplier: 1.2167,
    production: 8250,
    originalProduction: 8250,
    totalProduced: 0,
  },
  neuralNetworkBakery: {
    name: "Neural Network Bakery",
    count: 0,
    baseCost: 225828000,
    originalBaseCost: 225828000, // Orijinal fiyatı sakla
    costMultiplier: 1.4777,
    production: 36750,
    originalProduction: 36750,
    totalProduced: 0,
  },
};

let donutCount = 16045305460;
let accumulator = 0;
let totalDonutsEarned = 0;
let lastUpdateTime = Date.now();

const updateInterval = 125;
const donut = document.getElementById("donut");
const counter = document.getElementById("donut-count");
const perSecondDisplay = document.getElementById("per-second");

const BUILDING_COST_MULTIPLIER = 1.15; // Bina fiyatları %15 artar
const PRESTIGE_BUILDING_COST_MULTIPLIER_INCREMENT = 1.35;
const UPGRADE_COST_MULTIPLIER = 1.1; // Upgrade fiyatları %10 artar

// Variables for Prestige system
let prestigeCount = 0;
let nextPrestigeThreshold = 10000000; // 10 million donuts
let prestigeMultiplier = 2;

function updatePrestigeBar() {
  const prestigeBarFill = document.getElementById("prestigeBarFill");
  const prestigePoints = document.getElementById("prestigePoints");
  const nextPrestigeText = document.getElementById("nextPrestigeThreshold");

  // Prestij ilerlemesini totalDonutsEarned'a göre hesapla
  const progress = Math.min(totalDonutsEarned / nextPrestigeThreshold, 1);
  prestigeBarFill.style.width = `${progress * 100}%`; // Prestij barını genişlet

  // Eğer bar doluysa 'full' sınıfını ekle, değilse çıkar
  if (progress === 1) {
    prestigeBarFill.classList.add("full");
  } else {
    prestigeBarFill.classList.remove("full");
  }

  // Prestij puanlarını ve sıradaki prestij eşiklerini güncelle
  prestigePoints.textContent = `Prestige Points: ${prestigeCount}`;
  nextPrestigeText.textContent = `Next Prestige at: ${nextPrestigeThreshold} donuts`;
}

function clearUpgradeList() {
  const upgradeListDiv = document.getElementById("upgrade-list");
  while (upgradeListDiv.firstChild) {
    upgradeListDiv.removeChild(upgradeListDiv.firstChild);
  }
}

function performPrestige() {
  if (totalDonutsEarned >= nextPrestigeThreshold) {
    prestigeCount++;

    // Üretimi ve maliyeti sıfırla
    for (let key in items) {
      // Itemlerin originalProduction değerini prestij çarpanı ile çarp
      items[key].originalProduction *= prestigeMultiplier;

      // Yeni production değeri olarak originalProduction'u kullan
      items[key].production = items[key].originalProduction;

      // Itemlerin sayısını sıfırla
      items[key].count = 0;

      // Her prestijde bina fiyatlarının artması için prestij sayısına göre bina fiyat çarpanını artır
      const dynamicBuildingCostMultiplier =
        BUILDING_COST_MULTIPLIER *
        Math.pow(
          PRESTIGE_BUILDING_COST_MULTIPLIER_INCREMENT,
          prestigeCount - 1
        );

      // Fiyatları yeni dinamik çarpana göre ayarla
      items[key].baseCost =
        items[key].originalBaseCost * dynamicBuildingCostMultiplier;
    }

    // Upgrade maliyetlerini sıfırla ve satın alımları temizle
    for (let key in upgrades) {
      upgrades[key].forEach((upgrade) => {
        upgrade.cost *= UPGRADE_COST_MULTIPLIER;
        upgrade.purchased = false;
      });
    }

    // Donut ve prestij verilerini sıfırla
    donutCount = 0;
    totalDonutsEarned = 0;
    nextPrestigeThreshold *= 2;

    // Upgrade listesi sıfırla
    clearUpgradeList();

    // UI güncellemesi
    updatePrestigeBar();
    updateDisplay();
  }
}

// Make the Prestige div clickable
document.getElementById("prestige").addEventListener("click", () => {
  performPrestige();
});

// Call this function to update the bar regularly
setInterval(updatePrestigeBar, updateInterval);

// Upgrade'leri gösteren fonksiyonda hover olaylarını ekleyelim
function showUpgrades() {
  const upgradeList = document.getElementById("upgrade-list");
  const existingUpgrades = Array.from(upgradeList.children);

  let allUpgrades = [];

  for (let key in upgrades) {
    const itemUpgrades = upgrades[key];

    itemUpgrades.forEach((upgrade, index) => {
      if (upgrade.purchased) return;

      if (items[key].count >= upgrade.requirement) {
        allUpgrades.push({ key, index, upgrade });
      }
    });
  }

  // Upgrade'leri fiyata göre sırala (küçükten büyüğe)
  allUpgrades.sort((a, b) => a.upgrade.cost - b.upgrade.cost);

  // DOM'daki upgrade'leri yönet
  allUpgrades.forEach(({ key, index, upgrade }, position) => {
    let existingUpgrade = existingUpgrades.find(
      (div) => div.dataset.key === key && div.dataset.index === String(index)
    );

    if (!existingUpgrade) {
      const upgradeDiv = document.createElement("div");
      upgradeDiv.classList.add("upgrade");
      upgradeDiv.dataset.key = key;
      upgradeDiv.dataset.index = String(index);

      // Hover events
      upgradeDiv.addEventListener("mouseenter", () => {
        showInfoPanel(upgrade, key);
      });

      upgradeDiv.addEventListener("mouseleave", hideInfoPanel);

      upgradeDiv.addEventListener("click", () => {
        buyUpgrade(key, index);
        hideInfoPanel();
      });

      // Maliyeti formatla ('cost' türünde)
      const formattedCost = formatNumber(upgrade.cost, "cost");

      upgradeDiv.innerHTML = `
        <img src="img/${upgrade.img}" alt="${upgrade.name}" />

      `;

      // Donut sayısına göre yeterli mi kontrol et
      if (donutCount >= upgrade.cost) {
        upgradeDiv.classList.remove("insufficient-funds");
      } else {
        upgradeDiv.classList.add("insufficient-funds");
      }

      // Sıralamaya göre upgrade'i doğru pozisyona yerleştir
      if (position === 0) {
        upgradeList.prepend(upgradeDiv); // Listenin başına ekle
      } else {
        upgradeList.insertBefore(upgradeDiv, upgradeList.children[position]);
      }
    } else {
      // Mevcut upgrade'i güncelle (sadece gerekli yerlerini)
      if (donutCount >= upgrade.cost) {
        existingUpgrade.classList.remove("insufficient-funds");
      } else {
        existingUpgrade.classList.add("insufficient-funds");
      }

      // Maliyeti tekrar formatla ve güncelle
      const upgradeCostElem = existingUpgrade.querySelector(".upgrade-cost");
      if (upgradeCostElem) {
        upgradeCostElem.textContent = formatNumber(upgrade.cost, "cost");
      }

      // Eğer yanlış sıradaysa doğru pozisyona taşı
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
function updateDisplay() {
  if (!counter || !perSecondDisplay) return; // Elementler yoksa güncelleme yapma

  // Donut sayısını formatla (count türünde)
  counter.textContent = `${formatNumber(donutCount, "count")} donuts`;

  // Saniyedeki üretimi formatla (ondalık basamaklı olarak)
  perSecondDisplay.textContent = `per second: ${formatNumber(
    calculatePerSecond(),
    "perSecond"
  )}`;

  for (let key in items) {
    const costElem = document.getElementById(`${key}Cost`);
    const storeItem = document.querySelector(`.store-item[data-item="${key}"]`);

    if (costElem) {
      // Cost'u formatla ('cost' türünde)
      costElem.textContent = formatNumber(items[key].baseCost, "cost");

      // Donut sayısına bağlı olarak fiyatın rengini ve kararma efektini ayarla
      if (donutCount < items[key].baseCost) {
        costElem.classList.remove("affordable");
        costElem.classList.add("insufficient-funds");
        if (storeItem) {
          storeItem.classList.add("insufficient-funds");
        }
      } else {
        costElem.classList.remove("insufficient-funds");
        costElem.classList.add("affordable");
        if (storeItem) {
          storeItem.classList.remove("insufficient-funds");
        }
      }
    }

    const totalElem = document.getElementById(`total${capitalize(key)}s`);
    if (totalElem) {
      // Toplam sayıyı formatla ('count' türünde)
      totalElem.textContent = formatNumber(items[key].count, "count");
    }

    const totalProducedElem = document.getElementById(
      `totalProduced${capitalize(key)}`
    );
    if (totalProducedElem) {
      // Toplam üretimi formatla
      totalProducedElem.textContent = formatNumber(
        items[key].totalProduced,
        "count"
      );
    }
  }

  // Upgrade'lerin durumunu dinamik olarak güncelle
  showUpgrades();
}
function buyItem(itemKey) {
  const item = items[itemKey];
  if (donutCount >= Math.ceil(item.baseCost)) {
    donutCount -= item.baseCost;
    item.count++;
    item.baseCost = item.baseCost * item.costMultiplier;

    updateDisplay();

    showUpgrades();

    if (itemKey === "cursor") {
      addCursor();
    }
  }
}

function buyUpgrade(itemKey, upgradeIndex) {
  const upgrade = upgrades[itemKey][upgradeIndex];
  const item = items[itemKey];

  if (
    donutCount >= upgrade.cost &&
    item.count >= upgrade.requirement &&
    !upgrade.purchased
  ) {
    donutCount -= upgrade.cost;
    upgrade.purchased = true;
    item.production *= upgrade.multiplier;

    const upgradeList = document.getElementById("upgrade-list");
    const upgradeDiv = upgradeList.querySelector(
      `div[data-key="${itemKey}"][data-index="${upgradeIndex}"]`
    );
    if (upgradeDiv) {
      upgradeList.removeChild(upgradeDiv);
    }
    hideInfoPanel();
    updateDisplay();
    showUpgrades();
  }
}
// Setup işlemini başlat
setupStoreHover();

setInterval(() => {
  if (!document.hidden) {
    updateProduction(); // Hem donutCount'u hem totalProduced'u güncelle
  }
}, updateInterval);

// Donut üretimini hesapla
function calculatePerSecond() {
  let totalPerSecond = 0;
  for (let key in items) {
    totalPerSecond += items[key].count * items[key].production;
  }
  return totalPerSecond;
}
function updateProduction() {
  let totalPerSecond = calculatePerSecond();

  // Üretim miktarını güncelle ve donutCount ve totalProduced'u aynı anda artır
  const donutsProduced = totalPerSecond * (updateInterval / 1000);
  donutCount += donutsProduced;
  totalDonutsEarned += donutsProduced;

  // Her item'in toplam üretimini de artır
  for (let key in items) {
    if (items[key].count > 0) {
      items[key].totalProduced +=
        items[key].count * items[key].production * (updateInterval / 1000);
    }
  }
  updatePrestigeBar();
  updateDisplay(); // Üretim sonrası ekranı güncelle
}

let activeIntervalId = null; // Global bir değişken tanımlıyoruz
// Donut click event
donut.addEventListener("click", (event) => {
  let clickValue = 4353491;

  // Tüm cursor upgrade'lerinin çarpanlarını kontrol et
  upgrades.cursor.forEach((upgrade) => {
    if (upgrade.purchased) {
      clickValue *= upgrade.multiplier; // Her satın alınan upgrade ile çarpanı güncelle
    }

    // Efficient Clicks upgrade'ini kontrol et
    if (upgrade.name === "Efficient Clicks" && upgrade.purchased) {
      clickValue += calculatePerSecond() * 0.01; // perSecond'un %1'ini clickValue'ye ekle
    }
  });

  donutCount += clickValue;

  // Görsel ve ses efektlerini çalıştır
  const plusOne = document.createElement("div");
  plusOne.className = "plus-one";
  plusOne.textContent = `+${formatNumber(clickValue, "count")}`;
  plusOne.style.left = `${event.clientX}px`;
  plusOne.style.top = `${event.clientY}px`;

  document.body.appendChild(plusOne);
  setTimeout(() => document.body.removeChild(plusOne), 1000);

  createFallingDonut(event.clientX, event.clientY);
  playRandomClickSound();
  updateDisplay();
});
function showInfoPanel(upgrade, itemName) {
  const infoPanel = document.getElementById("info-panel");

  const formattedItemName =
    itemName.charAt(0).toUpperCase() + itemName.slice(1);

  const costColor = donutCount >= upgrade.cost ? "#6f6" : "red";

  // Maliyeti formatla ('cost' türünde)
  const formattedCost = formatNumber(upgrade.cost, "cost");

  infoPanel.innerHTML = `
    <div class="header">
      <img src="img/${upgrade.img}" alt="${upgrade.name}">
      <h4>${upgrade.name}</h4>
      <span class="cost" style="color: ${costColor}; display: inline-flex; align-items: center;">
        <img src="img/donutMoney.png" alt="Donut Money" style="height: 12px; width: 12px; margin-right: 5px;">
        ${formattedCost}
      </span>
    </div>
    <p class='efficiency-text'>${formattedItemName}s are <strong>twice</strong> as efficient</p>
    <p class="description">"${upgrade.description}"</p>
  `;

  infoPanel.style.display = "block";

  const upgradeList = document.getElementById("upgrade-list");
  const rect = upgradeList.getBoundingClientRect();
  infoPanel.style.left = `${rect.left - infoPanel.offsetWidth - 10}px`;
  infoPanel.style.top = `${rect.top}px`;
}

function hideInfoPanel() {
  const infoPanel = document.getElementById("info-panel");
  infoPanel.style.display = "none";
}
function showItemInfo(itemKey) {
  const item = items[itemKey];
  const itemInfoPanel = document.getElementById("item-info-panel");

  function updateItemInfo() {
    // Item ismi ve resmi güncelle
    document.getElementById(
      "item-info-name"
    ).innerHTML = `<strong>${item.name}</strong>`;
    document.getElementById("item-info-image").src = `img/${itemKey}.png`;

    // Owned güncelle
    document.getElementById(
      "item-info-owned"
    ).innerHTML = `Owned: ${item.count}`;

    // Cost'u güncelle ve donutMoney resmini kullan
    const costColor = donutCount >= item.baseCost ? "#6f6" : "red";
    document.getElementById("item-info-cost").innerHTML = `
      <img src="img/donutMoney.png" alt="donut icon" class="icon" />
      <span style="color: ${costColor};">${formatNumber(
      item.baseCost,
      "cost"
    )}</span>
    `;

    // Diğer özellikleri güncelle
    document.getElementById("item-info-feature").innerHTML = `
      Each <strong>${item.name}</strong> produces <strong>${formatNumber(
      item.production,
      "perSecond"
    )} donuts</strong> per second<br>
      ${formatNumber(item.count, "count")} <strong>${
      item.name + "(s)"
    }</strong> producing <strong>${formatNumber(
      item.count * item.production,
      "perSecond"
    )} donuts</strong> per second<br>
      Total produced: ${formatNumber(item.totalProduced, "count")}
    `;
  }

  // Bilgileri hemen güncelle
  updateItemInfo();

  // Önceki interval varsa temizle
  if (activeIntervalId) {
    clearInterval(activeIntervalId);
  }

  // Yeni interval başlat ve 125ms'e ayarla
  activeIntervalId = setInterval(updateItemInfo, updateInterval);

  // Paneli göster
  itemInfoPanel.style.display = "block";

  // Panelin pozisyonunu store item'a göre ayarla
  const storeItem = document.querySelector(
    `.store-item[data-item="${itemKey}"]`
  );
  const rect = storeItem.getBoundingClientRect();

  itemInfoPanel.style.left = `${rect.left - itemInfoPanel.offsetWidth - 10}px`;
  itemInfoPanel.style.top = `${rect.top}px`;

  // Hover dışına çıkıldığında interval'i temizle ve paneli gizle
  storeItem.addEventListener("mouseleave", () => {
    itemInfoPanel.style.display = "none";
    clearInterval(activeIntervalId);
    activeIntervalId = null;
  });
}

// Hover event'leri ekle
function setupStoreHover() {
  for (let key in items) {
    const storeItem = document.querySelector(`.store-item[data-item="${key}"]`);

    if (storeItem) {
      // Hover event'ini her store item için ekle
      storeItem.addEventListener("mouseenter", () => {
        showItemInfo(key);
      });
    } else {
      console.error(`Store item with key ${key} not found.`);
    }
  }
}
// Sekme görünürlüğü değiştiğinde bu fonksiyon tetiklenecek
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    const now = Date.now();
    const elapsed = now - lastUpdateTime;

    // Oyun sekmesi arka plandayken geçen süredeki donut üretimini ekle
    const additionalDonuts = (elapsed / 1000) * calculatePerSecond();
    donutCount += Math.floor(additionalDonuts);
    accumulator += additionalDonuts % 1; // Küsuratı accumuator'a ekle

    lastUpdateTime = now;
    updateDisplay();
  } else {
    lastUpdateTime = Date.now();
  }
});

let currentCursorIndex = 0;
let cursors = []; // global cursor arr

function addCursor() {
  const cursorContainer = document.getElementById("cursor-container");
  const totalCursors = items.cursor.count;

  // Yeni cursor eklerken mevcut cursor'ları silme, sadece yeni olanları ekle
  const radius = 145; // Donut'un etrafındaki çemberin yarıçapı
  const centerX = cursorContainer.clientWidth / 2;
  const centerY = cursorContainer.clientHeight / 2;

  const initialAngle = Math.PI / 2; // İlk cursor sağda, 90 derece
  const angleStep = (2 * Math.PI) / 60; // Bir tam tur için 60 cursor'luk bir sınır

  for (let i = cursors.length; i < totalCursors; i++) {
    const angle = initialAngle - i * angleStep; // Her yeni cursor saat yönünde yerleşecek
    const x = centerX + radius * Math.cos(angle) - 15; // 15: cursor'un yarı genişliği
    const y = centerY + radius * Math.sin(angle) - 15; // 15: cursor'un yarı yüksekliği

    const cursor = document.createElement("img");
    cursor.src = "img/cursorDonut.png"; // Cursor resminin yolu
    cursor.classList.add("cursor");
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    const rotationAngle = angle * (180 / Math.PI) - 90; // Açıyı dereceye çeviriyoruz
    cursor.style.transform = `rotate(${rotationAngle}deg)`; // Cursor'u donut'a bakacak şekilde döndürüyoruz

    cursorContainer.appendChild(cursor);
    cursors.push({ element: cursor, x, y, angle }); // Yeni cursor'u listeye ekle
  }

  // Eğer animasyon zaten çalışıyorsa, yeni cursor'lar sadece eklenir, animasyon bozulmaz
}

// Cursor animation
function startCursorAnimation() {
  setInterval(() => {
    // Eğer cursor yoksa animasyonu başlatma
    if (cursors.length === 0) {
      return; // Cursor yoksa fonksiyondan çık
    }

    const { element: currentCursor, x, y, angle } = cursors[currentCursorIndex];

    if (!currentCursor) return; // Eğer currentCursor undefined ise işlemi durdur

    const centerX = currentCursor.parentElement.clientWidth / 2;
    const centerY = currentCursor.parentElement.clientHeight / 2;

    // Merkeze göre hareket ettir (x, y ile merkez arasındaki farkı alıyoruz)
    const translateX = centerX - x;
    const translateY = centerY - y;

    // Zıplama hareketini başlatıyoruz, cursor merkeze doğru hareket edecek
    currentCursor.style.transform = `translate(${translateX * 0.05}px, ${
      translateY * 0.05
    }px) rotate(${angle * (180 / Math.PI) - 90}deg)`;

    // 0.5 saniye sonra cursor'u eski pozisyonuna getiriyoruz
    setTimeout(() => {
      currentCursor.style.transform = `rotate(${
        angle * (180 / Math.PI) - 90
      }deg)`; // Sadece dönme hareketi kalıyor
    }, 1000);

    // Bir sonraki cursor'a geçiyoruz
    currentCursorIndex = (currentCursorIndex + 1) % cursors.length;
  }, 2000); // Her 0.5 saniyede bir sıradaki cursor zıplıyor
}

// First cursor animation
startCursorAnimation();

// Dinamik olarak isimlendirme
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

clickSounds.forEach((sound) => {
  sound.volume = 0.1;
});
// Click sound
function playRandomClickSound() {
  const randomIndex = Math.floor(Math.random() * clickSounds.length);
  clickSounds[randomIndex].play();
}

let currentBakeryName = "";
function getRandomBakeryName() {
  const randomIndex = Math.floor(Math.random() * bakeryNames.length);
  return bakeryNames[randomIndex];
}

function updateBakeryName() {
  const bakeryNameElement = document.getElementById("bakery-name");
  if (bakeryNameElement) {
    currentBakeryName = getRandomBakeryName() + "'s Bakery";
    bakeryNameElement.textContent = currentBakeryName;
  }
}

function createFallingDonut(x, y) {
  const fallingDonut = document.createElement("img");
  fallingDonut.src = "img/donutPixelArt.png";
  fallingDonut.classList.add("falling-donut");

  // Donut'un başlangıç pozisyonunu tıklanan yere göre ayarla
  fallingDonut.style.left = `${x}px`;
  fallingDonut.style.top = `${y}px`;

  // Rastgele bir animasyon seç (sola, sağa veya yukarı) ve animasyon mesafesini belirle
  const randomAnimation = getRandomAnimation();
  const horizontalDistance = getRandomDistance(); // Sola ve sağa gitme mesafesi için rastgele değer
  const animationDuration = Math.random() * 0.5 + 0.5; // 1.5 - 2.5 saniye arasında rastgele süre

  fallingDonut.style.animationName = randomAnimation;
  fallingDonut.style.animationDuration = `${animationDuration}s`;
  fallingDonut.style.setProperty(
    "--horizontalDistance",
    `${horizontalDistance}px`
  );

  // Donut'un dönüş açısını rastgele belirle
  fallingDonut.style.animationTimingFunction = "ease-in-out";
  fallingDonut.style.animationRotation = `${Math.random() * 360}deg`;

  document.body.appendChild(fallingDonut);

  setTimeout(() => {
    document.body.removeChild(fallingDonut);
  }, animationDuration * 1000); // Animasyon süresi kadar bekle
}

// Rastgele animasyon seçimi
function getRandomAnimation() {
  const animations = ["bounceLeft", "bounceRight", "bounceUp"];
  const randomIndex = Math.floor(Math.random() * animations.length);
  return animations[randomIndex];
}

// Rastgele bir sola/sağa gitme mesafesi
function getRandomDistance() {
  return Math.floor(Math.random() * 20) + 10; // 10px ile 30px arası rastgele mesafe
}
function formatNumber(number, type = "count") {
  if (type === "perSecond") {
    // Eğer type 'perSecond' ise, 1 ondalık basamağa kadar göster
    return number.toFixed(1).replace(/\.0$/, ""); // Eğer 0.0 gibi bir sonuç varsa, ".0" kısmını kaldır
  }

  if (number < 1000) {
    return Math.floor(number).toString();
  } else if (number < 1000000) {
    // Virgülden sonrası olmadan, binlik ayracı olarak nokta kullan
    return Math.floor(number)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  } else if (number < 1000000000) {
    // Milyon cinsinden, 3 ondalık basamak, gereksiz sıfırları kaldır
    return (number / 1000000).toFixed(2).replace(/\.?0+$/, "") + " million";
  } else {
    // Milyar cinsinden, 3 ondalık basamak
    return (number / 1000000000).toFixed(2).replace(/\.?0+$/, "") + " billion";
  }
}

// Donut sayısını güncelleyip title'a yazdırma
function updateTitleWithDonuts() {
  const donutCountElement = document.getElementById("donut-count");

  let donutCountText = donutCountElement?.textContent.trim();
  if (donutCountText) {
    document.title = `${donutCountText} - Donut Clicker`;
  }
}

// Her 3 saniyede bir başlığı güncelle
setInterval(updateTitleWithDonuts, 1000);
// reset-button
document.addEventListener("DOMContentLoaded", () => {
  const resetButton = document.getElementById("reset-button");

  resetButton.addEventListener("click", () => {
    const confirmation = confirm(
      "Are you sure you want to reset the game? All your progress will be deleted."
    );
    if (confirmation) {
      localStorage.removeItem("gameState");
      location.reload();
    }
  });
});
function saveGame() {
  const gameState = {
    items: items, //items
    upgrades: upgrades, //upgrades
    donutCount: donutCount, //donut
    accumulator: accumulator, //accumulator
    currentBakeryName: currentBakeryName,
  };
  localStorage.setItem("gameState", JSON.stringify(gameState));
}

function loadGame() {
  const savedGame = localStorage.getItem("gameState");
  if (savedGame) {
    const gameState = JSON.parse(savedGame);

    // Donut sayısı & accumulator load
    donutCount = gameState.donutCount || 0;
    accumulator = gameState.accumulator || 0;

    // Items load
    for (let key in gameState.items) {
      if (items[key]) {
        items[key] = gameState.items[key];
      }
    }

    // Upgrades load
    for (let key in gameState.upgrades) {
      if (upgrades[key]) {
        upgrades[key] = gameState.upgrades[key];
      }
    }
    currentBakeryName =
      gameState.currentBakeryName || getRandomBakeryName() + "'s Bakery";
    const bakeryNameElement = document.getElementById("bakery-name");
    if (bakeryNameElement) {
      bakeryNameElement.textContent = currentBakeryName;
    }

    updateDisplay();
    showUpgrades();
  } else {
    // Eğer oyun kaydedilmemişse, ilk kez bir bakery adı atayın
    updateBakeryName();
  }
}

setInterval(saveGame, 180000); // 3 minute

// Sayfa yüklendiğinde rastgele bir bakery ismi göster
document.addEventListener("DOMContentLoaded", () => {
  updateBakeryName();
});

document.addEventListener("DOMContentLoaded", () => {
  loadGame();
  updateDisplay();
});
