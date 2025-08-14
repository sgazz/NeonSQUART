# Squart

Interactive 3D game built with Three.js featuring CRT monitor style and futuristic neon elements.

## Features

- **Configurable Board**: Choose board size from 5x5 to 20x20 cells
- **CRT Monitor Style**: Retro look with green neon colors
- **3D Interaction**: Camera rotation, zoom and pan
- **Neon Effects**: Animated neon elements with pulsing light
- **Scanlines Effect**: Simulation of old CRT monitors
- **AI Opponents**: Three difficulty levels (Easy, Medium, Hard)
- **Multiple Game Modes**: PvP, PvAI, AIvP, AIvAI
- **AI Thinking Animation**: Visual feedback during AI turns

## How to Run

1. Open `index.html` in a web browser
2. Select desired board size from the dropdown
3. Click "Create Board" button
4. Use mouse to interact with the 3D scene

## Controls

- **Camera Rotation**: Left click + drag mouse
- **Zoom**: Mouse wheel
- **Camera Pan**: Right click + drag mouse
- **Create New Board**: Click "Create Board" button

## AI Game Modes

- **PvP (Player vs Player)**: Classic two-player mode
- **PvAI (Player vs AI)**: You play as Electric Violet (blue), AI plays as Shocking Pink (red)
- **AIvP (AI vs Player)**: AI plays as Electric Violet (blue), you play as Shocking Pink (red)
- **AIvAI (AI vs AI)**: Watch two AI players compete

## AI Difficulty Levels

- **Easy**: Random moves, quick thinking (200-700ms)
- **Medium**: Greedy algorithm, strategic positioning (500-1300ms)
- **Hard**: Advanced AI with transposition table, iterative deepening (5-8 moves ahead), move ordering, and sophisticated evaluation (2000-3000ms)

## Technologies

- **Three.js**: 3D graphics library
- **HTML5/CSS3**: UI and styling
- **JavaScript ES6**: Game logic

## Project Structure

```
├── index.html          # Main HTML file
├── game.js            # Three.js game logic
├── ai.js              # AI player logic and algorithms
└── README.md          # This documentation
```

## Future Features

- Different types of games on the board
- Additional neon effects and animations
- Sound effects
- Multiplayer support
- AI tournament mode
- Advanced AI strategies

## Notes

The game is optimized for modern web browsers with WebGL support. For the best experience, use Chrome, Firefox or Safari.
