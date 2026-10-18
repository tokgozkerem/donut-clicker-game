# Donut Clicker

A browser-based incremental / idle game built with vanilla JavaScript.

Donut Clicker is a long-running personal game project focused on progression, automation, offline earnings, save reliability, and keeping a relatively large game loop responsive without using a frontend framework.

**Live:** https://donutclicker.net

## Features

- 11 production buildings with upgrade progression
- Prestige and long-term progression
- Quest system with rewards and temporary boosts
- Baker crafting with ingredients and persistent recipe bonuses
- Mine resource generation and market mechanics
- Farm system with animals, goods, contracts, traits, mastery and crates
- Auto-buyer and combo / auto-catch systems
- Offline progression with capped background earnings
- Local save system with validation and backup recovery
- Responsive desktop and mobile interface

## Engineering

The game runs entirely in the browser and is built without a frontend framework.

Some of the main technical work in the project includes:

- Centralized production and click calculations
- Versioned `localStorage` saves
- Save validation and backup recovery
- Legacy save compatibility
- Active, background and offline time settlement
- Reduced rendering work while the page is hidden
- Cached production and building-price calculations
- Data-driven building and upgrade definitions
- Long-session performance optimizations
- Responsive UI behavior across desktop and mobile

## Tech Stack

- JavaScript
- HTML
- CSS
- LocalStorage
- GitHub Pages
- Cloudflare

## Run Locally

No build step is required.

Clone the repository:

    git clone https://github.com/tokgozkerem/donut-clicker-game.git
    cd donut-clicker-game

Start any static HTTP server, for example:

    python3 -m http.server 8000

Then open:

    http://localhost:8000

## Live Version

https://donutclicker.net

## Authors

Built and maintained by **ktz**.
