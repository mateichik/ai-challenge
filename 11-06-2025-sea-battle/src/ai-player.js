import { Player } from './player.js';
import { Board } from './board.js';
import { GameLogic } from './game-logic.js';

// AI Player Class - extends Player with AI-specific functionality
class AIPlayer extends Player {
  #mode;
  #targetQueue;
  #gameLogic;

  constructor(boardSize, numShips, shipLength) {
    super(boardSize, numShips, shipLength);
    this.#mode = 'hunt';
    this.#targetQueue = [];
    this.#gameLogic = new GameLogic();
  }

  // Getters and setters for AI state
  getMode() { return this.#mode; }
  setMode(mode) { this.#mode = mode; }
  
  getTargetQueue() { return [...this.#targetQueue]; } // Return copy to prevent external modification
  setTargetQueue(queue) { this.#targetQueue = [...queue]; } // Store copy to prevent external modification
  
  // Main method to calculate next move
  calculateNextMove(playerShips, playerBoard, boardSize, display) {
    let guessRow, guessCol, guessStr;
    let madeValidGuess = false;
    let hit = false;
    let sunk = false;

    while (!madeValidGuess) {
      if (this.#mode === 'target' && this.#targetQueue.length > 0) {
        guessStr = this.#targetQueue.shift();
        guessRow = parseInt(guessStr[0]);
        guessCol = parseInt(guessStr[1]);
        display?.showMessage(`CPU targets: ${guessStr}`);

        if (this.guesses.includes(guessStr)) {
          if (this.#targetQueue.length === 0) this.#mode = 'hunt';
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

  // Helper method to add adjacent coordinates to target queue
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