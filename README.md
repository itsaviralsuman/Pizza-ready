# 🍕 Pizza Ready! - 3D Arcade Idle Tycoon

An authentic, high-definition 3D arcade idle pizzeria tycoon game inspired by Supercent's *Pizza Ready!*. Built with pure HTML5, Vanilla JavaScript, CSS, and Three.js with zero external CDN runtime dependencies — 100% playable offline on any device or deployable directly to GitHub Pages & Vercel.

---

## ✨ Features (v3.3 Update)

- 🍕 **Automated Brick Pizza Oven & Conveyor Belt**: Continuous pizza baking, packaging, and pickup tray.
- 🥐 **Step-by-Step Dough Preparation Station**: Roll dough bases and apply fresh toppings before sliding into the oven.
- ♨️ **Front Counter Heated Shelf (Hot Case)**: Stock fresh pizza boxes at the register for immediate customer pick up.
- 👨‍🍳 **Specialized Staff & Helpers**:
  - **Kitchen Chef**: Continuous dough rolling and oven loading.
  - **Counter Runner**: Transports finished pizza boxes from the oven to the front heated shelf.
  - **Dine-In Waiter**: Serves tables and cleans dirty dishes with anti-stuck navigation.
  - **Front Cashier**: Automated register checkout using stocked heated shelf pizzas (no free money glitch!).
- 🚌 **Franchise Transit Bus & Multi-Branch Empire**: Board the outdoor transit express to manage 3 branches (Downtown, Seaside Boardwalk, and Metro Mall) and collect passive royalties.
- ⚖️ **Realistic 20-30 Min Game Economy**: Balanced starting cash ($10), base pizza prices ($3 + $1 every 10 levels), and progressive upgrade tiers.
- 📦 **Realistic Pizza Carrying Physics**: Pizza boxes stack realistically in chef hands with walking tilt animation.
- 🪑 **Sequential Milestone Unlock Pipeline**: One milestone pad on the floor at a time (`Table 1` ➡️ `Oven Lv 2` ➡️ `Table 2` ➡️ `Waiter Helper` ➡️ `Drive-Thru` ➡️ `Front Cashier` ➡️ `Supply Farm & Factory`).
- 🚗 **Drive-Thru Lane**: Outdoor vehicle service window with drive-up cars and high-value orders.
- 🌾 **Supply Farm & Factory Expansion**: Harvest wheat crops, grind flour at the mill, and stamp dough disks at the press.
- 🥤 **Soda Dispenser Station**: Serve cold drinks with pizza for 2x combo profit!
- 🗑️ **Recycling Dumpster**: Clean dining tables and earn eco-tips.
- 💾 **Local & Email Cloud Save**: Autosaves progress in localStorage and syncs across devices via email cloud profiles.
- 📱 **Mobile & Desktop Controls**: Virtual on-screen touch joystick + keyboard `WASD` / arrow keys.
- ⚡ **100% Offline Ready**: Includes local `three.min.js` and Web Audio API synthesized sound effects.

---

## 🕹️ Controls

- **Desktop**: Use `W`, `A`, `S`, `D` or Arrow Keys to move your chef.
- **Mobile / Tablet**: Drag the on-screen virtual joystick.
- **Interactions**: Walk over stations, pickup trays, cash piles, or milestone unlock pads to interact automatically!

---

## 🚀 How to Run Locally

You can run the game using Python's built-in HTTP server:

```bash
python -m http.server 8080
```

Or run the included helper:

```bash
python serve.py
```

Then open your browser at:
```
http://localhost:8080
```

---

## 🌐 Deploy to GitHub Pages / Vercel

Since all files (`index.html`, `game.js`, `style.css`, `audio.js`, `three.min.js`) are located at the root of the repository:

- **GitHub Pages**: Go to **Settings** ➡️ **Pages** ➡️ Select `main` branch ➡️ **Save**.
- **Vercel**: Import the repository and click **Deploy** (no build command needed).