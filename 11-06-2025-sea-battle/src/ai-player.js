import { Player } from './player.js';
import { Board } from './board.js';
import { GameLogic } from './game-logic.js';

/**
 * AI Player Class - extends Player with AI-specific functionality
 * Implements hunt/target strategy for CPU opponent
 */
class AIPlayer extends Player {
  #mode;
  #targetQueue;
  #gameLogic;

  /**
   * Creates a new AI player
   * @param {number} boardSize - Size of the game board
   * @param {number} numShips - Number of ships
   * @param {number} shipLength - Length of each ship
   */
  constructor(boardSize, numShips, shipLength) {
    super(boardSize, numShips, shipLength);
    this.#mode = 'hunt';
    this.#targetQueue = [];
    this.#gameLogic = new GameLogic();
  }

  /**
   * Gets the current AI mode
   * @returns {string} Current mode ('hunt' or 'target')
   */
  getMode() { return this.#mode; }
  
  /**
   * Sets the AI mode
   * @param {string} mode - Mode to set ('hunt' or 'target')
   */
  setMode(mode) { this.#mode = mode; }
  
  /**
   * Gets a copy of the target queue
   * @returns {Array} Copy of the target queue
   */
  getTargetQueue() { return [...this.#targetQueue]; } // Return copy to prevent external modification
  
  /**
   * Sets the target queue
   * @param {Array} queue - New target queue
   */
  setTargetQueue(queue) { this.#targetQueue = [...queue]; } // Store copy to prevent external modification
  
  /**
   * Calculates the next move for the AI player
   * @param {Array} playerShips - Player's ships to target
   * @param {Board} playerBoard - Player's board to update
   * @param {number} boardSize - Size of the game board
   * @param {GameDisplay} display - Display object for showing messages
   * @returns {Object} Result object with hit and sunk properties
   */
  calculateNextMove(playerShips, playerBoard, boardSize, display) {
    let guessRow, guessCol, guessStr;
    let madeValidGuess = false;
    let hit = false;
    let sunk = false;

    // Check if we need to switch to hunt mode at the beginning
    if (this.#mode === 'target' && this.#targetQueue.length === 0) {
      this.#mode = 'hunt';
    }

    while (!madeValidGuess) {
      if (this.#mode === 'target' && this.#targetQueue.length > 0) {
        guessStr = this.#targetQueue.shift();
        guessRow = parseInt(guessStr[0]);
        guessCol = parseInt(guessStr[1]);
        display?.showMessage(`CPU targets: ${guessStr}`);

        if (this.guesses.includes(guessStr)) {
          // If the queue is empty after removing this invalid guess, switch to hunt mode
          if (this.#targetQueue.length === 0) {
            this.#mode = 'hunt';
          }
          continue;
        }
      } else {
        this.#mode = 'hunt';
        guessRow = Math.floor(Math.random() * boardSize);
        guessCol = Math.floor(Math.random() * boardSize);
        guessStr = String(guessRow) + String(guessCol);

        if (!Board.isValidAndNewGuess(guessRow, guessCol, this.guesses, boardSize)) {
          continue;
        }
      }

      madeValidGuess = true;
      this.addGuess(guessStr);

      for (let i = 0; i < playerShips.length; i++) {
        const ship = playerShips[i];
        
        if (ship.hasLocation(guessStr)) {
          const hitResult = ship.hit(guessStr);
          
          if (hitResult) {
            // New hit
            playerBoard.setCell(guessRow, guessCol, 'X');
            display?.showMessage(`CPU HIT at ${guessStr}!`);
            hit = true;

            if (ship.isSunk()) {
              display?.showMessage('CPU sunk your battleship!');
              sunk = true;

              this.#mode = 'hunt';
              this.#targetQueue = [];
            } else {
              this.#mode = 'target';
              this.#addAdjacentTargets(guessRow, guessCol, boardSize);
            }
          }
          break;
        }
      }

      if (!hit) {
        playerBoard.setCell(guessRow, guessCol, 'O');
        display?.showMessage(`CPU MISS at ${guessStr}.`);

        // Check again if we need to switch to hunt mode
        if (this.#mode === 'target' && this.#targetQueue.length === 0) {
          this.#mode = 'hunt';
        }
      }
    }

    return {
      hit: hit,
      sunk: sunk
    };
  }

  /**
   * Adds adjacent coordinates to the target queue
   * @param {number} row - Row of the hit
   * @param {number} col - Column of the hit
   * @param {number} boardSize - Size of the game board
   * @private
   */
  #addAdjacentTargets(row, col, boardSize) {
    const adjacent = [
      { r: row - 1, c: col },
      { r: row + 1, c: col },
      { r: row, c: col - 1 },
      { r: row, c: col + 1 },
    ];

    for (const adj of adjacent) {
      if (Board.isValidAndNewGuess(adj.r, adj.c, this.guesses, boardSize)) {
        const adjStr = `${adj.r}${adj.c}`;
        if (!this.#targetQueue.includes(adjStr)) {
          this.#targetQueue.push(adjStr);
        }
      }
    }
  }
}

export { AIPlayer }; 