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
   * Determines the AI's next move, either by using the target queue or by 'hunting' randomly.
   * @private
   * @param {number} boardSize - The size of the game board.
   * @param {GameDisplay} display - The display object for showing messages.
   * @returns {{guessStr: string, guessRow: number, guessCol: number}} The coordinates of the guess.
   */
  _makeGuess(boardSize, display) {
    // If we are in 'target' mode but the queue is empty, switch to 'hunt' mode.
    if (this.#mode === 'target' && this.#targetQueue.length === 0) {
      this.#mode = 'hunt';
      display?.showMessage("CPU's target queue is empty, returning to hunt mode.");
    }

    if (this.#mode === 'target') {
      // Pull the next guess from the front of the queue.
      const guessStr = this.#targetQueue.shift();
      display?.showMessage(`CPU targets: ${guessStr}`);
      return {
        guessStr,
        guessRow: parseInt(guessStr[0]),
        guessCol: parseInt(guessStr[1]),
      };
    } else {
      // 'hunt' mode: generate random coordinates until we find a valid, new spot.
      let guessRow, guessCol, guessStr;
      let isValid = false;
      while (!isValid) {
        guessRow = Math.floor(Math.random() * boardSize);
        guessCol = Math.floor(Math.random() * boardSize);
        guessStr = String(guessRow) + String(guessCol);
        if (Board.isValidAndNewGuess(guessRow, guessCol, this.guesses, boardSize)) {
          isValid = true;
        }
      }
      display?.showMessage(`CPU is hunting... fires at ${guessStr}.`);
      return { guessStr, guessRow, guessCol };
    }
  }

  /**
   * Processes the result of a guess, updating state and switching modes if necessary.
   * @private
   * @param {{guessStr: string, guessRow: number, guessCol: number}} guess - The guess that was made.
   * @param {Array<Ship>} playerShips - The player's ships to check against.
   * @param {Board} playerBoard - The player's board to update.
   * @param {GameDisplay} display - The display object for showing messages.
   * @returns {{hit: boolean, sunk: boolean}} The result of the guess.
   */
  _processGuessResult({ guessStr, guessRow, guessCol }, playerShips, playerBoard, display) {
    for (const ship of playerShips) {
      if (ship.hasLocation(guessStr)) {
        // --- It's a HIT ---
        ship.hit(guessStr);
        playerBoard.setCell(guessRow, guessCol, 'X');
        display?.showMessage(`CPU HIT at ${guessStr}!`);

        if (ship.isSunk()) {
          display?.showMessage('CPU sunk your battleship!');
          // A ship was sunk, clear the targeting queue and return to hunting.
          this.#mode = 'hunt';
          this.#targetQueue = [];
          return { hit: true, sunk: true };
        } else {
          // A ship was hit but not sunk, switch to target mode and find adjacent targets.
          this.#mode = 'target';
          this.#addAdjacentTargets(guessRow, guessCol, playerBoard.getSize());
          return { hit: true, sunk: false };
        }
      }
    }

    // --- It's a MISS ---
    playerBoard.setCell(guessRow, guessCol, 'O');
    display?.showMessage(`CPU MISS at ${guessStr}.`);
    return { hit: false, sunk: false };
  }

  /**
   * Calculates the next move for the AI player by generating a guess and processing the result.
   * @param {Array<Ship>} playerShips - Player's ships to target.
   * @param {Board} playerBoard - Player's board to update
   * @param {number} boardSize - Size of the game board
   * @param {GameDisplay} display - Display object for showing messages
   * @returns {Object} Result object with hit and sunk properties
   */
  calculateNextMove(playerShips, playerBoard, boardSize, display) {
    const guess = this._makeGuess(boardSize, display);
    
    // If the guess from the target queue has already been made (e.g., by a previous overlapping target search),
    // we simply get a new guess without processing the invalid one.
    if (this.guesses.includes(guess.guessStr)) {
      return this.calculateNextMove(playerShips, playerBoard, boardSize, display);
    }
    
    this.addGuess(guess.guessStr);
    return this._processGuessResult(guess, playerShips, playerBoard, display);
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