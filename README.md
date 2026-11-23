# ASYLUM

ASYLUM is a browser-based first-person 3D exploration prototype set in Ravenwood Asylum. The experience uses procedural Three.js geometry, atmospheric lighting, doors, floors, and a small in-browser layout editor.

## Features

- First-person movement with keyboard and mouse look.
- Procedurally built asylum map with multiple floors and rooms.
- Toggleable flashlight and atmospheric fog.
- Door interaction when the player is within reach.
- In-game layout editor for moving and resizing rooms.
- Live map rebuilding after editor changes.
- Console export of edited room layouts.

## Controls

### Exploration

- `WASD` — move.
- `Mouse` — look around after pointer lock is enabled.
- `F` — toggle the flashlight.
- `E` — open or close a nearby door.
- `Tab` — open or close the layout editor.

### Layout editor

- `Arrow keys` or `IJKL` — move the selected room.
- `[` / `]` — decrease or increase room width.
- `-` / `=` — decrease or increase room depth.
- `Page Up` / `Page Down` — change floor.
- `,` / `.` — select the previous or next room.
- `R` — rebuild the map.
- `X` — export the edited layout to the browser console.

## Tech stack

- Vite
- JavaScript modules
- Three.js
- Yuka
- Firebase client dependency for connected features

## Getting started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The separate `asylum-editor.html` page contains the expanded layout-editor interface when served by the Vite development server.

For a production build:

```bash
npm run build
npm run preview
```

## Project structure

- `src/main.js` — scene setup, controls, flashlight, doors, editor, and animation loop.
- `src/AsylumMap.js` — room, floor, material, and map construction.
- `src/style.css` — shared styling.
- `asylum-editor.html` — expanded editor UI.
- `Scripts/` — organized gameplay/editor scripts and supporting modules.

## Notes

The prototype uses pointer lock for first-person camera control. Browser permissions and input behavior can vary, so desktop Chromium-based browsers are the best-supported development environment.
