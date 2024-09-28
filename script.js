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

// Donut ve üretim item'ları için yapılandırılmış veri
const items = {
  cursor: {
    name: "Cursor",
    count: 0,
    baseCost: 15,
    costMultiplier: 1.155,
    production: 0.1,
  },
  baker: {
    name: "Baker",
    count: 0,
    baseCost: 100,
    costMultiplier: 1.15,
    production: 1,
  },
  farm: {
    name: "Farm",
    count: 0,
    baseCost: 1000,
    costMultiplier: 1.1447,
    production: 7,
  },
  mine: {
    name: "Mine",
    count: 0,
    baseCost: 14500,
    costMultiplier: 1.15,
    production: 50,
  },
  factory: {
    name: "Factory",
    count: 0,
    baseCost: 76500,
    costMultiplier: 1.1557,
    production: 255,
  },
  portal: {
    name: "Portal",
    count: 0,
    baseCost: 367500,
    costMultiplier: 1.16,
    production: 1225,
  },
  powerPlant: {
    name: "Power Plant",
    count: 0,
    baseCost: 2475000,
    costMultiplier: 1.2167,
    production: 8250,
  },
  neuralNetworkBakery: {
    name: "Neural Network Bakery",
    count: 0,
    baseCost: 225000000,
    costMultiplier: 1.4777,
    production: 36750,
  },
};

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
    },
    {
      name: "Tidal Surge",
      cost: 500,
      multiplier: 2,
      purchased: false,
      requirement: 5,
      img: "cursorUpgrade-2.png",
    },
    {
      name: "Blazing Touch",
      cost: 2500,
      multiplier: 2,
      purchased: false,
      requirement: 15,
      img: "cursorUpgrade-3.png",
    },
    {
      name: "Abyssal Grasp",
      cost: 10000,
      multiplier: 2,
      purchased: false,
      requirement: 25,
      img: "cursorUpgrade-4.png",
    },
    {
      name: "Golden Cursor",
      cost: 50000,
      multiplier: 2,
      purchased: false,
      requirement: 35,
      img: "cursorUpgrade-5.png",
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
    },
    {
      name: "Doughmire",
      cost: 50000,
      multiplier: 2,
      purchased: false,
      requirement: 5,
      img: "bakerUpgrade-2.png",
    },
    {
      name: "Flourist",
      cost: 250000,
      multiplier: 2,
      purchased: false,
      requirement: 15,
      img: "bakerUpgrade-3.png",
    },
    {
      name: "Batteron",
      cost: 1000000,
      multiplier: 2,
      purchased: false,
      requirement: 25,
      img: "bakerUpgrade-4.png",
    },
    {
      name: "Crèmeor",
      cost: 5000000,
      multiplier: 2,
      purchased: false,
      requirement: 45,
      img: "bakerUpgrade-5.png",
    },
  ],
  farm: [
    {
      name: "Harvest Plains",
      cost: 5000,
      multiplier: 2,
      purchased: false,
      requirement: 1,
      img: "farmUpgrade-1.png",
    },
    {
      name: "Golden Acre",
      cost: 250000,
      multiplier: 2,
      purchased: false,
      requirement: 5,
      img: "farmUpgrade-2.png",
    },
    {
      name: "Elder Grove",
      cost: 1250000,
      multiplier: 2,
      purchased: false,
      requirement: 20,
      img: "farmUpgrade-3.png",
    },
    {
      name: "Ironroot Fields",
      cost: 5000000,
      multiplier: 2,
      purchased: false,
      requirement: 30,
      img: "farmUpgrade-4.png",
    },
    {
      name: "Magicland",
      cost: 25000000,
      multiplier: 2,
      purchased: false,
      requirement: 50,
      img: "farmUpgrade-5.png",
    },
  ],
  mine: [
    {
      name: "Harvest Plains",
      cost: 20000,
      multiplier: 2,
      purchased: false,
      requirement: 1,
      img: "mineUpgrade-1.png",
    },
    {
      name: "Golden Acre",
      cost: 1000000,
      multiplier: 3,
      purchased: false,
      requirement: 5,
      img: "mineUpgrade-2.png",
    },
    {
      name: "Elder Grove",
      cost: 5000000,
      multiplier: 4,
      purchased: false,
      requirement: 50,
      img: "mineUpgrade-3.png",
    },
    {
      name: "Ironroot Fields",
      cost: 20000000,
      multiplier: 5,
      purchased: false,
      requirement: 100,
      img: "mineUpgrade-4.png",
    },
    {
      name: "Skybound Farms",
      cost: 100000000,
      multiplier: 6,
      purchased: false,
      requirement: 500,
      img: "mineUpgrade-5.png",
    },
  ],
  factory: [
    {
      name: "FlameFactory",
      cost: 50000,
      multiplier: 2,
      purchased: false,
      requirement: 1,
      img: "factoryUpgrade-1.png",
    },
    {
      name: "ShadowFactory",
      cost: 2500000,
      multiplier: 3,
      purchased: false,
      requirement: 5,
      img: "factoryUpgrade-2.png",
    },
    {
      name: "TitanFactory",
      cost: 12500000,
      multiplier: 4,
      purchased: false,
      requirement: 50,
      img: "factoryUpgrade-3.png",
    },
    {
      name: "NebulaFactory",
      cost: 50000000,
      multiplier: 5,
      purchased: false,
      requirement: 100,
      img: "factoryUpgrade-4.png",
    },
    {
      name: "GalacticFactory",
      cost: 250000000,
      multiplier: 6,
      purchased: false,
      requirement: 500,
      img: "factoryUpgrade-5.png",
    },
  ],
};

let donutCount = 0;
let accumulator = 0;
const updateInterval = 100;
const donut = document.getElementById("donut");
const counter = document.getElementById("donut-count");
const perSecondDisplay = document.getElementById("per-second");

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
  const counter = document.getElementById("donut-count");
  const perSecondDisplay = document.getElementById("per-second");

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
  }

  // Upgrade'lerin durumunu dinamik olarak güncelle
  showUpgrades();
}
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
    <p class="description">"What's a life to a gigaton of donuts?"</p>
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

    updateDisplay();
    showUpgrades();
  }
}
// Upgrade hover
document.querySelectorAll(".upgrade").forEach((upgradeDiv) => {
  upgradeDiv.addEventListener("mouseover", (event) => {
    const key = upgradeDiv.dataset.key;
    const index = upgradeDiv.dataset.index;
    showInfoPanel(upgrades[key][index], event);
  });

  upgradeDiv.addEventListener("mouseout", hideInfoPanel);
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

// Donut üretimini hesapla
function calculatePerSecond() {
  let totalPerSecond = 0;
  for (let key in items) {
    totalPerSecond += items[key].count * items[key].production;
  }
  return totalPerSecond;
}

// Donut click event
donut.addEventListener("click", (event) => {
  let clickValue = 1;

  // Tüm cursor upgrade'lerinin çarpanlarını kontrol et
  upgrades.cursor.forEach((upgrade) => {
    if (upgrade.purchased) {
      clickValue *= upgrade.multiplier; // Her satın alınan upgrade ile çarpanı güncelle
    }
  });

  donutCount += clickValue;

  const plusOne = document.createElement("div");
  plusOne.className = "plus-one";
  // Click değerini formatla ('count' türünde)
  plusOne.textContent = `+${formatNumber(clickValue, "count")}`;
  plusOne.style.left = `${event.clientX}px`;
  plusOne.style.top = `${event.clientY}px`;

  document.body.appendChild(plusOne);
  setTimeout(() => document.body.removeChild(plusOne), 1000);
  createFallingDonut(event.clientX, event.clientY);
  updateDisplay();
});

function createFallingDonut(x, y) {
  // Yeni bir donut oluştur
  const fallingDonut = document.createElement("img");
  fallingDonut.src = "img/donutPixelArt.png";
  fallingDonut.classList.add("falling-donut");

  // Donut'un başlangıç pozisyonunu tıklanan yere göre ayarla
  fallingDonut.style.left = `${x}px`;
  fallingDonut.style.top = `${y}px`;

  // Rastgele bir animasyon seç (sola, sağa veya yukarı)
  const randomAnimation = getRandomAnimation();
  fallingDonut.style.animationName = randomAnimation;

  // Donut'u sayfaya ekle
  document.body.appendChild(fallingDonut);

  // Animasyonun bitiminde donut'u sayfadan kaldır
  setTimeout(() => {
    document.body.removeChild(fallingDonut);
  }, 2000); // Animasyon süresi kadar bekle (2 saniye)
}

// Random animation
function getRandomAnimation() {
  const animations = ["bounceLeft", "bounceRight", "bounceUp"];
  const randomIndex = Math.floor(Math.random() * animations.length);
  return animations[randomIndex];
}

// Donut-count
setInterval(() => {
  const totalPerSecond = calculatePerSecond();
  accumulator += totalPerSecond / 10;

  while (accumulator >= 1) {
    donutCount++;
    accumulator--;
  }

  updateDisplay();
}, updateInterval);

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
// Donut sayısını güncelleyip title'a yazdırma
function updateTitleWithDonuts() {
  // Toplam donut sayısını almak için
  const donutCountElement = document.getElementById("donut-count");
  const donutCountText = donutCountElement.textContent; // "X donuts" şeklinde gelir
  const totalDonuts = donutCountText.split(" ")[0]; // İlk kısmı yani sayıyı alıyoruz

  // Sayfa başlığını güncelleme
  document.title = `${totalDonuts} donuts - Donut Clicker`;
}

// Her 3 saniyede bir başlığı güncelle
setInterval(updateTitleWithDonuts, 3000);
