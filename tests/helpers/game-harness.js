// Shared VM harness: real Game methods, fake browser/storage/time.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const contentSource = fs.readFileSync(path.join(__dirname, "../../game-content.js"), "utf8");
const source = fs.readFileSync(path.join(__dirname, "../../script.js"), "utf8");
const classSource = source.slice(0, source.indexOf('\n  document.addEventListener("DOMContentLoaded"')) +
  "\n globalThis.Game = Game;})();";

function harness(initial = {}) {
  const clock = { now: 1800000000000 };
  const values = new Map(Object.entries(initial));
  const operations = [];
  const failures = { reads: new Set(), writes: new Set(), removes: new Set() };
  const storage = {
    getItem(key) {
      if (failures.reads.has(key)) throw new Error("Storage read denied");
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      if (failures.writes.has(key)) throw new Error("Quota exceeded");
      operations.push(["write", key]);
      values.set(key, value);
    },
    removeItem(key) {
      if (failures.removes.has(key)) throw new Error("Storage removal denied");
      operations.push(["remove", key]);
      values.delete(key);
    },
  };
  const timers = new Map();
  let timerId = 0;
  function element(tag = "div") {
    const classes = new Set();
    const queries = new Map();
    let markup = "";
    const node = {
      tag, value: "", textContent: "", dataset: {}, style: {}, children: [], listeners: {},
      get className() { return [...classes].join(" "); },
      set className(value) { classes.clear(); String(value).split(/\s+/).filter(Boolean).forEach((v) => classes.add(v)); },
      get innerHTML() { return markup; },
      set innerHTML(value) { markup = value; this.children = []; queries.clear(); },
      parentElement: { appendChild() {}, querySelector() { return null; } },
      classList: {
        add: (...names) => names.forEach((n) => classes.add(n)),
        remove: (...names) => names.forEach((n) => classes.delete(n)),
        contains: (n) => classes.has(n),
        toggle(n, force = !classes.has(n)) { if (force) classes.add(n); else classes.delete(n); return force; },
      },
      addEventListener(name, callback) { this.listeners[name] = callback; },
      removeEventListener(name, callback) { if (this.listeners[name] === callback) delete this.listeners[name]; },
      appendChild(child) {
        if (child.tag === "#fragment") { for (const entry of [...child.children]) this.appendChild(entry); return child; }
        if (child.parentElement?.children) child.parentElement.removeChild(child);
        this.children.push(child); child.parentElement = this; return child;
      },
      removeChild(child) { this.children = this.children.filter((entry) => entry !== child); },
      replaceWith(other) {
        if (!this.parentElement?.children) return;
        const parent = this.parentElement, index = parent.children.indexOf(this);
        parent.children[index] = other; other.parentElement = parent;
      },
      querySelector(key) {
        const match = this.querySelectorAll(key)[0];
        if (match) return match;
        if (!queries.has(key)) queries.set(key, element());
        return queries.get(key);
      }, querySelectorAll(selector) {
        const matches = (entry) => {
          const css = [...selector.matchAll(/\.([\w-]+)/g)].every((m) => entry.classList.contains(m[1]));
          const attrs = [...selector.matchAll(/\[data-([\w-]+)="([^"]*)"\]/g)].every((m) =>
            entry.dataset[m[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase())] === m[2]);
          return css && attrs;
        };
        const all = [];
        const visit = (entry) => { for (const child of entry.children) { if (matches(child)) all.push(child); visit(child); } };
        visit(this); return all;
      },
      getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 100 }; },
      setAttribute(key, value) {
        if (key.startsWith("data-")) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
      },
      remove() { this.parentElement?.removeChild?.(this); },
    };
    return node;
  }
  const elements = new Map();
  const document = {
    visibilityState: "visible", listeners: {}, body: element(),
    getElementById(key) {
      if (!elements.has(key)) elements.set(key, element());
      return elements.get(key);
    },
    querySelector: (key) => document.getElementById(key),
    querySelectorAll: () => [], createElement: element, createDocumentFragment: () => element("#fragment"),
    addEventListener(name, callback) { this.listeners[name] = callback; },
  };
  const window = {
    innerWidth: 1280, listeners: {},
    addEventListener(name, callback) { this.listeners[name] = callback; },
  };
  class Audio {
    set volume(v) { this._volume = Number(v); }
    get volume() { return this._volume; }
    play() { return Promise.resolve(); }
  }
  const context = vm.createContext({
    document, window, localStorage: storage, Audio, IntersectionObserver: class {},
    Date: class extends Date { static now() { return clock.now; } },
    console, btoa, atob, Image: class {}, performance: { now: () => clock.now },
    location: { reload() { context.reloaded = true; } },
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, at: clock.now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); }, setInterval() {},
    requestAnimationFrame() {}, cancelAnimationFrame() {},
  });
  vm.runInContext(contentSource, context);
  vm.runInContext(classSource, context);
  const methods = Object.fromEntries(Object.entries(Object.getOwnPropertyDescriptors(context.Game.prototype))
    .filter(([, d]) => typeof d.value === "function").map(([key, d]) => [key, d.value]));
  const notifications = [];
  for (const name of ["setupMarketButtons", "setupModal", "setupPrestigeModal", "setupQuestSystem",
    "setupMobileMenus", "updateDisplay", "updateQuestDisplay", "updateOreList", "updateIngredientList",
    "updateMarketDisplay", "showUpgrades", "updatePrestigeBar", "showOfflineModal", "updateFarmDisplay",
    "_forceBarnFullRender", "closePanel", "clearUpgradeList", "updateFarmMasteryBadge", "hideInfoPanel",
    "updateRecipeBook", "updatePurchaseLimitBadge"]) {
    context.Game.prototype[name] = function () {};
  }
  context.Game.prototype.showNotification = function (message) { notifications.push(message); };
  context.Game.prototype.showFarmNotification = function (message) { notifications.push(message); };
  context.Game.prototype.showGameSaved = function () { notifications.push("saved"); };
  const game = new context.Game();
  const runTimers = (milliseconds) => {
    const target = clock.now + milliseconds;
    while (true) {
      const next = [...timers].filter(([, t]) => t.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      clock.now = next[1].at;
      timers.delete(next[0]);
      next[1].callback();
    }
    clock.now = target;
  };
  return { game, values, operations, failures, clock, timers, runTimers, storage, context,
    notifications, document, window, elements, methods, newGame: () => new context.Game() };
}

module.exports = { harness };
