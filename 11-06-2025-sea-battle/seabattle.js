import { GameConfig } from './src/game-config.js';
import { GameState } from './src/game-state.js';
import { GameLogic } from './src/game-logic.js';
import { Ship } from './src/ship.js';
import { Player } from './src/player.js';
import { AIPlayer } from './src/ai-player.js';
import { createBoard } from './src/board-utils.js';
import { SeaBattleGame } from './src/sea-battle-game.js';

/**
 * Main entry point for the Sea Battle game
 */
async function main() {
  const game = new SeaBattleGame();
  await game.playGame();
}

// Use ES module pattern for checking if file is run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main();
}

// Re-export all necessary classes and functions
export {
  GameConfig,
  GameState,
  GameLogic,
  Ship,
  Player,
  AIPlayer,
  createBoard,
  SeaBattleGame
};
