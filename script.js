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
    costMultiplier: 1.13,
    production: 7,
  },
  mine: {
    name: "Mine",
    count: 0,
    baseCost: 15000,
    costMultiplier: 1.12,
    production: 50,
  },
  factory: {
    name: "Factory",
    count: 0,
    baseCost: 65000,
    costMultiplier: 1.1,
    production: 215,
  },
};

// Upgrade'ler her item için dizi şeklinde yapılandırılmış veri
const upgrades = {
  cursor: [
    {
      name: "Cursor Upgrade 1",
      cost: 100,
      multiplier: 2,
      purchased: false,
      requirement: 1,
      img: "cursorUpgrade.png",
    },
    {
      name: "Cursor Upgrade 2",
      cost: 500,
      multiplier: 2,
      purchased: false,
      requirement: 10,
      img: "cursorUpgrade-2.png",
    },
  ],
  baker: [
    {
      name: "Baker Upgrade 1",
      cost: 1000,
      multiplier: 2,
      purchased: false,
      requirement: 5,
      img: "bakerUpgrade-1.png",
    },
    {
      name: "Baker Upgrade 2",
      cost: 50000,
      multiplier: 3,
      purchased: false,
      requirement: 20,
      img: "bakerUpgrade-2.png",
    },
  ],
};

let donutCount = 0;
let accumulator = 0;
const updateInterval = 100;
const donut = document.getElementById("donut");
const counter = document.getElementById("donut-count");
const perSecondDisplay = document.getElementById("per-second");

function showUpgrades() {
  const upgradeList = document.getElementById("upgrade-list");
  const existingUpgrades = Array.from(upgradeList.children); // Mevcut upgrade'leri saklayın

  for (let key in upgrades) {
    const itemUpgrades = upgrades[key]; // Bu item için upgrade'ler

    itemUpgrades.forEach((upgrade, index) => {
      // Eğer upgrade satın alınmışsa onu listeye eklemeyin
      if (upgrade.purchased) return;

      // Şartlar sağlandığında upgrade'leri göster
      if (items[key].count >= upgrade.requirement) {
        const existingUpgrade = existingUpgrades.find(
          (div) =>
            div.dataset.key === key && div.dataset.index === String(index)
        );

        if (!existingUpgrade) {
          const upgradeDiv = document.createElement("div");
          upgradeDiv.classList.add("upgrade");
          upgradeDiv.dataset.key = key; // upgrade'in anahtarı
          upgradeDiv.dataset.index = String(index); // upgrade'in sırası

          // Görsel tıklanabilir hale getirilir
          upgradeDiv.addEventListener("click", () => {
            buyUpgrade(key, index);
          });

          upgradeDiv.innerHTML = `<img src="img/${upgrade.img}" alt="${upgrade.name}" />`;
          upgradeList.appendChild(upgradeDiv);
        }

        // Paranın yetip yetmediğini kontrol et ve stil ekle/kaldır
        if (donutCount >= upgrade.cost) {
          existingUpgrade?.classList.remove("insufficient-funds");
        } else {
          existingUpgrade?.classList.add("insufficient-funds");
        }
      }
    });
  }
}

function buyItem(itemKey) {
  const item = items[itemKey];
  if (donutCount >= Math.ceil(item.baseCost)) {
    donutCount -= item.baseCost;
    item.count++;
    item.baseCost = Math.ceil(item.baseCost * item.costMultiplier);
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

function updateDisplay() {
  const counter = document.getElementById("donut-count");
  const perSecondDisplay = document.getElementById("per-second");

  if (!counter || !perSecondDisplay) return; // Elementler yoksa güncelleme yapma

  counter.textContent = `${donutCount} donuts`;
  perSecondDisplay.textContent = `per second: ${calculatePerSecond().toFixed(
    1
  )}`;

  for (let key in items) {
    const costElem = document.getElementById(`${key}Cost`);
    const storeItem = document.querySelector(`.store-item[data-item="${key}"]`);

    if (costElem) {
      costElem.textContent = items[key].baseCost.toFixed(0);

      // Donut sayısına bağlı olarak fiyatın rengini ve kararma efektini ayarla
      if (donutCount < items[key].baseCost) {
        costElem.classList.remove("affordable");
        costElem.classList.add("insufficient-funds"); // Kırmızı yap ve karart
        if (storeItem) {
          storeItem.classList.add("insufficient-funds"); // Store item'ı da karart
        }
      } else {
        costElem.classList.remove("insufficient-funds");
        costElem.classList.add("affordable");
        if (storeItem) {
          storeItem.classList.remove("insufficient-funds"); // Kararma efektini kaldır
        }
      }
    }

    const totalElem = document.getElementById(`total${capitalize(key)}s`);
    if (totalElem) {
      totalElem.textContent = items[key].count;
    }
  }

  // Upgrade'lerin durumunu dinamik olarak güncelle
  showUpgrades();
}

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
  plusOne.textContent = `+${clickValue}`;
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
  fallingDonut.src = "img/DonutPixelArt.png";
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
  const donut = document.getElementById("donut");
  const counter = document.getElementById("donut-count");
  const perSecondDisplay = document.getElementById("per-second");

  function updateDisplay() {
    if (!counter || !perSecondDisplay) return; // Elementler yoksa güncelleme yapma

    counter.textContent = `${donutCount} donuts`;
    perSecondDisplay.textContent = `per second: ${calculatePerSecond().toFixed(
      1
    )}`;

    for (let key in items) {
      const costElem = document.getElementById(`${key}Cost`);

      // Doğru ID'yi bulup güncelleyelim
      let totalElemId = "";
      if (key === "cursor") totalElemId = "totalCursors";
      else if (key === "baker") totalElemId = "totalBakers";
      else if (key === "farm") totalElemId = "totalFarms";
      else if (key === "mine") totalElemId = "totalMines";
      else if (key === "factory") totalElemId = "totalFactories";

      const totalElem = document.getElementById(totalElemId);

      if (costElem) {
        costElem.textContent = items[key].baseCost.toFixed(0);
      }
      if (totalElem) {
        totalElem.textContent = items[key].count;
      }
    }
  }

  // Diğer fonksiyonlar ve setInterval işlemlerini burada başlat

  setInterval(() => {
    const totalPerSecond = calculatePerSecond();
    accumulator += totalPerSecond / 10;

    while (accumulator >= 1) {
      donutCount++;
      accumulator--;
    }

    updateDisplay();
  }, updateInterval);

  for (let key in items) {
    const item = items[key];
    const storeItem = document.querySelector(
      `.store-item[onclick="buy${capitalize(key)}()"]`
    );

    if (storeItem) {
      storeItem.addEventListener("click", () => buyItem(key));
    }
  }
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
