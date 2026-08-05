# ⭐ Star Catcher — React + Phaser 2D Demo

A small 2D arcade game built with **React 18**, **Phaser 3**, and **Vite**.
Move the paddle to catch falling stars for points and dodge the bombs.

## Gameplay

- **Catch a star** → +10 points
- **Hit a bomb** → lose a life (screen shakes)
- **3 hits** → Game Over
- Difficulty ramps up over time (faster spawns, faster falls)
- Your best score is saved in `localStorage`

## Controls

| Action | Keys |
| ------ | ---- |
| Move   | `←` `→` or `A` `D` |
| Move (alt) | Mouse / touch |

## Run it

```bash
npm install
npm run dev      # start dev server at http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

## How it's wired

- **React** owns the page shell + HUD (score, lives, best, Game Over card).
- **Phaser** owns the canvas and all gameplay ([src/game/scenes/GameScene.js](src/game/scenes/GameScene.js)).
- The two talk through a tiny [EventBus](src/game/EventBus.js): Phaser emits
  `state-changed` / `game-over`; React emits `restart-game`.
- All sprites are drawn procedurally in [BootScene](src/game/scenes/BootScene.js),
  so there are **no image assets to load** — it just runs.

## Project structure

```
src/
├─ main.jsx              # React entry
├─ App.jsx / App.css     # Page shell + HUD + Game Over overlay
├─ index.css             # Global styles
└─ game/
   ├─ EventBus.js        # React <-> Phaser bridge
   ├─ PhaserGame.jsx     # Mounts/destroys the Phaser instance
   ├─ config.js          # Phaser game config
   └─ scenes/
      ├─ BootScene.js    # Generates textures at runtime
      └─ GameScene.js    # Gameplay
```
