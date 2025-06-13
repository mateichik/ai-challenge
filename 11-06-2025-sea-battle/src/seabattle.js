import { GameConfig } from './game-config.js';
import { GameState } from './game-state.js';
import { GameLogic } from './game-logic.js';
import { Ship } from './ship.js';
import { Player } from './player.js';
import { AIPlayer } from './ai-player.js';
import { createBoard } from './board-utils.js';
import { SeaBattleGame } from './sea-battle-game.js';

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
