import { Player } from './player.js';
import { AIPlayer } from './ai-player.js';
import { GameConfig } from './game-config.js';

// Game State Management Class
class GameState {
  constructor() {
    this.player = new Player(GameConfig.BOARD_SIZE, GameConfig.NUM_SHIPS, GameConfig.SHIP_LENGTH);
    this.cpu = new AIPlayer(GameConfig.BOARD_SIZE, GameConfig.NUM_SHIPS, GameConfig.SHIP_LENGTH);
    this.boardSize = GameConfig.BOARD_SIZE;
    this.shipLength = GameConfig.SHIP_LENGTH;
  }

  getPlayer() { return this.player; }
  getCpu() { return this.cpu; }
  getBoardSize() { return this.boardSize; }
  getShipLength() { return this.shipLength; }
  getCpuMode() { return this.cpu.getMode(); }

  isGameOver() {
    return this.player.getNumShips() === 0 || this.cpu.getNumShips() === 0;
  }
  hasPlayerWon() { return this.cpu.getNumShips() === 0; }
  hasCpuWon() { return this.player.getNumShips() === 0; }
}

export { GameState }; 