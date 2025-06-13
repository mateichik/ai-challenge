import { Player } from './player.js';
import { AIPlayer } from './ai-player.js';
import { GameConfig } from './game-config.js';

/**
 * Manages the overall state of the game.
 * This includes references to the player and CPU, as well as game configuration values.
 */
class GameState {
  /**
   * Initializes the game state, creating new instances of the Player and AIPlayer.
   */
  constructor() {
    this.player = new Player(GameConfig.BOARD_SIZE, GameConfig.NUM_SHIPS, GameConfig.SHIP_LENGTH);
    this.cpu = new AIPlayer(GameConfig.BOARD_SIZE, GameConfig.NUM_SHIPS, GameConfig.SHIP_LENGTH);
    this.boardSize = GameConfig.BOARD_SIZE;
    this.shipLength = GameConfig.SHIP_LENGTH;
  }

  /** @returns {Player} The player object. */
  getPlayer() { return this.player; }

  /** @returns {AIPlayer} The CPU player object. */
  getCpu() { return this.cpu; }

  /** @returns {number} The size of the game board. */
  getBoardSize() { return this.boardSize; }

  /** @returns {number} The length of the ships. */
  getShipLength() { return this.shipLength; }

  /** @returns {string} The current mode of the CPU ('hunt' or 'target'). */
  getCpuMode() { return this.cpu.getMode(); }

  /**
   * Checks if the game is over.
   * @returns {boolean} True if the game is over, false otherwise.
   */
  isGameOver() {
    return this.player.getNumShips() === 0 || this.cpu.getNumShips() === 0;
  }

  /**
   * Checks if the player has won.
   * @returns {boolean} True if the player has won, false otherwise.
   */
  hasPlayerWon() { return this.cpu.getNumShips() === 0; }

  /**
   * Checks if the CPU has won.
   * @returns {boolean} True if the CPU has won, false otherwise.
   */
  hasCpuWon() { return this.player.getNumShips() === 0; }
}

export { GameState }; 