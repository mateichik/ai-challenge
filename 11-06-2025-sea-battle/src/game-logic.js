import { Ship } from './ship.js';
import { validateNumberRange, validateRequired, validateArray, validateCoordinate } from './validation.js';
import { InvalidCoordinateError, DuplicateGuessError, InvalidShipPlacementError } from './game-errors.js';
import { performanceMonitor } from './performance-monitor.js';

/**
 * Handles core game mechanics such as ship placement, processing hits, and checking game end conditions.
 * This class is designed to be stateless, with all methods accepting the current game state as parameters.
 */
class GameLogic {
  /**
   * Initializes the GameLogic component.
   * Pre-allocates reusable objects to minimize garbage collection during the game loop.
   */
  constructor() {
    // GameLogic is stateless - all methods accept state as parameters
    // Pre-allocate reusable objects to minimize GC pressure
    this._shipPlacementResult = { success: false, attempts: 0 };
    this._hitResult = { success: false, hit: false, sunk: false };
    this._gameEndResult = { gameOver: false, winner: null, message: null };
    
    // Pre-defined messages for common scenarios
    this._messages = {
      playerHit: 'PLAYER HIT!',
      hit: 'HIT!',
      playerMiss: 'PLAYER MISS.',
      miss: 'MISS.',
      sunkEnemy: 'You sunk an enemy battleship!',
      sunkGeneric: 'You sunk a battleship!',
      alreadyHit: 'You already hit that spot!'
    };
    
    // Wrap performance-critical methods with monitoring
    if (process.env.ENABLE_PERFORMANCE_MONITORING === 'true') {
      this.placeShips = performanceMonitor.monitor(this.placeShips.bind(this), 'GameLogic.placeShips');
      this.processHit = performanceMonitor.monitor(this.processHit.bind(this), 'GameLogic.processHit');
      this.checkGameEnd = performanceMonitor.monitor(this.checkGameEnd.bind(this), 'GameLogic.checkGameEnd');
    }
  }

  /**
   * Generates a potential ship placement with a random orientation and starting position.
   * @private
   * @param {number} boardSize - The size of the game board.
   * @param {number} shipLength - The length of the ship.
   * @returns {{orientation: string, startRow: number, startCol: number}} An object containing the ship's orientation and coordinates.
   */
  _generateRandomShip(boardSize, shipLength) {
    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    let startRow, startCol;

    if (orientation === 'horizontal') {
      startRow = Math.floor(Math.random() * boardSize);
      startCol = Math.floor(Math.random() * (boardSize - shipLength + 1));
    } else {
      startRow = Math.floor(Math.random() * (boardSize - shipLength + 1));
      startCol = Math.floor(Math.random() * boardSize);
    }
    return { orientation, startRow, startCol };
  }

  /**
   * Checks if a potential ship placement conflicts with existing ships or board boundaries.
   * @private
   * @param {{orientation: string, startRow: number, startCol: number}} shipData - The generated ship's data.
   * @param {number} shipLength - The length of the ship.
   * @param {number} boardSize - The size of the game board.
   * @param {Board} targetBoard - The board to check for collisions.
   * @returns {boolean} True if a collision is detected, false otherwise.
   */
  _hasCollision({ orientation, startRow, startCol }, shipLength, boardSize, targetBoard) {
    for (let i = 0; i < shipLength; i++) {
      const checkRow = orientation === 'vertical' ? startRow + i : startRow;
      const checkCol = orientation === 'horizontal' ? startCol + i : startCol;

      // This check is slightly redundant due to how startRow/startCol are generated, but it's a good safeguard.
      if (checkRow >= boardSize || checkCol >= boardSize) {
        return true;
      }
      
      // Check if the cell is already occupied on our placement grid or on the actual board.
      // The _occupiedCells grid is crucial for preventing overlaps within this placement transaction.
      if (this._occupiedCells[checkRow][checkCol] || targetBoard.getCell(checkRow, checkCol) !== '~') {
        return true;
      }
    }
    return false;
  }

  /**
   * Places the specified number of ships randomly on the game board, ensuring they do not overlap.
   * @param {Board} targetBoard - The board on which to place the ships.
   * @param {Array<Ship>} shipsArray - The array to store the created Ship objects.
   * @param {number} numberOfShips - The total number of ships to place.
   * @param {number} boardSize - The size of the game board (e.g., 10 for a 10x10 grid).
   * @param {number} shipLength - The length of each ship.
   * @param {Board} [playerBoard] - The player's board, used to mark ship locations with 'S' if provided.
   * @returns {object} An object indicating the success of the placement and the number of attempts.
   * @throws {InvalidShipPlacementError} If ships cannot be placed after the maximum number of attempts.
   */
  placeShips(targetBoard, shipsArray, numberOfShips, boardSize, shipLength, playerBoard) {
    // Validate parameters
    validateRequired(targetBoard, 'targetBoard');
    validateRequired(shipsArray, 'shipsArray');
    validateArray(shipsArray, 'shipsArray');
    validateNumberRange(numberOfShips, 1, 10, 'numberOfShips');
    validateNumberRange(boardSize, 5, 20, 'boardSize');
    validateNumberRange(shipLength, 1, boardSize, 'shipLength');
    
    // Clear existing ships array
    shipsArray.length = 0;
    
    let placedShips = 0;
    let attempts = 0;
    const maxAttempts = boardSize * boardSize * 10; // Safeguard against infinite loops

    // This tracking grid is used to check for collisions between ships placed in this
    // *same* transaction, before they are officially added to the board state.
    // It's reset for each call to placeShips.
    if (!this._occupiedCells || this._occupiedCells.length !== boardSize) {
      this._occupiedCells = Array(boardSize).fill().map(() => Array(boardSize).fill(false));
    } else {
      // Reset existing array
      for (let i = 0; i < boardSize; i++) {
        this._occupiedCells[i].fill(false);
      }
    }

    while (placedShips < numberOfShips && attempts < maxAttempts) {
      attempts++;
      const potentialShip = this._generateRandomShip(boardSize, shipLength);
      const hasCollision = this._hasCollision(potentialShip, shipLength, boardSize, targetBoard);

      if (!hasCollision) {
        const { orientation, startRow, startCol } = potentialShip;
        const shipLocations = [];
        
        for (let i = 0; i < shipLength; i++) {
          const placeRow = orientation === 'vertical' ? startRow + i : startRow;
          const placeCol = orientation === 'horizontal' ? startCol + i : startCol;
          
          shipLocations.push(String(placeRow) + String(placeCol));

          // Mark as occupied in our temporary placement grid
          this._occupiedCells[placeRow][placeCol] = true;

          // If this is the player's primary board, mark the ship as visible.
          if (targetBoard === playerBoard) {
            targetBoard.setCell(placeRow, placeCol, 'S');
          }
        }
        
        // Create a new Ship object with a copy of the locations to avoid reference issues.
        const newShip = new Ship([...shipLocations]);
        shipsArray.push(newShip);
        placedShips++;
      }
    }
    
    // Check if we placed all ships
    if (placedShips < numberOfShips) {
      throw new InvalidShipPlacementError(`Failed to place all ships after ${maxAttempts} attempts`);
    }
    
    // Update result object for reuse
    this._shipPlacementResult.success = true;
    this._shipPlacementResult.attempts = attempts;
    
    return this._shipPlacementResult;
  }

  /**
   * Validates a guess and parses it into row and column numbers.
   * @private
   * @param {string} guess - The user's guess string.
   * @param {number} boardSize - The size of the board.
   * @param {Array<string>} previousGuesses - The list of previous guesses.
   * @returns {{row: number, col: number}} The parsed coordinates.
   */
  _validateAndParseGuess(guess, boardSize, previousGuesses) {
    if (typeof guess !== 'string' || guess.length !== 2) {
      throw new InvalidCoordinateError(guess, boardSize);
    }
    
    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);

    if (isNaN(row) || isNaN(col) || row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
      throw new InvalidCoordinateError(guess, boardSize);
    }
    
    if (previousGuesses.includes(guess)) {
      throw new DuplicateGuessError(guess);
    }

    return { row, col };
  }

  /**
   * Handles the logic for when a guess results in a successful hit on a ship.
   * @private
   * @param {{row: number, col: number}} coords - The coordinates of the hit.
   * @param {Ship} ship - The ship that was hit.
   * @param {string} playerType - The type of player ('player' or 'cpu').
   * @param {Board} board - The board to update.
   * @param {GameDisplay} display - The display for showing messages.
   */
  _handleHit({ row, col }, ship, playerType, board, display) {
    const wasAlreadyHit = !ship.hit(String(row) + String(col));
    
    if (wasAlreadyHit) {
      display?.showMessage(this._messages.alreadyHit);
      this._hitResult.hit = true; // It's still a "hit" on the location.
      return;
    }

    // It's a new hit.
    board.setCell(row, col, 'X');
    display?.showMessage(playerType === 'player' ? this._messages.playerHit : this._messages.hit);
    this._hitResult.hit = true;

    if (ship.isSunk()) {
      display?.showMessage(playerType === 'player' ? this._messages.sunkEnemy : this._messages.sunkGeneric);
      this._hitResult.sunk = true;
    }
  }

  /**
   * Processes a player's or CPU's guess, updates the board, and determines the result.
   * @param {string} guess - The coordinate of the guess (e.g., "00").
   * @param {number} boardSize - The size of the game board.
   * @param {Array<string>} guesses - An array of previous guesses to check for duplicates.
   * @param {Array<Ship>} ships - The array of ships to check for hits.
   * @param {Board} board - The game board to update with the result ('X' for hit, 'O' for miss).
   * @param {number} shipLength - The length of the ships.
   * @param {string} [playerType='generic'] - The type of player making the guess ('player' or 'cpu').
   * @param {GameDisplay} [display] - The display object for showing messages.
   * @returns {object} An object containing the result of the hit (success, hit, sunk).
   * @throws {InvalidCoordinateError} If the guess coordinate is invalid.
   * @throws {DuplicateGuessError} If the location has already been guessed.
   */
  processHit(guess, boardSize, guesses, ships, board, shipLength, playerType = 'generic', display) {
    // Input validation
    validateRequired(guess, 'guess');
    validateRequired(guesses, 'guesses');
    validateRequired(ships, 'ships');
    validateRequired(board, 'board');
    validateNumberRange(boardSize, 5, 20, 'boardSize');
    validateArray(guesses, 'guesses');
    validateArray(ships, 'ships');
    
    const { row, col } = this._validateAndParseGuess(guess, boardSize, guesses);
    guesses.push(guess);

    // Reset result object for this turn
    this._hitResult.hit = false;
    this._hitResult.sunk = false;
    this._hitResult.success = true;

    for (const ship of ships) {
      if (ship.hasLocation(guess)) {
        this._handleHit({ row, col }, ship, playerType, board, display);
        return this._hitResult;
      }
    }

    // If the loop completes, it was a miss.
    board.setCell(row, col, 'O');
    display?.showMessage(playerType === 'player' ? this._messages.playerMiss : this._messages.miss);

    return this._hitResult;
  }

  /**
   * Checks if the game has ended by determining if either player has lost all their ships.
   * @param {GameState} gameState - The current state of the game.
   * @returns {object} An object indicating if the game is over, who the winner is, and a result message.
   */
  checkGameEnd(gameState) {
    validateRequired(gameState, 'gameState');
    
    if (typeof gameState.getPlayer !== 'function' || typeof gameState.getCpu !== 'function') {
      throw new TypeError('Invalid gameState object');
    }
    
    const player = gameState.getPlayer();
    const cpu = gameState.getCpu();
    
    validateRequired(player, 'player');
    validateRequired(cpu, 'cpu');
    
    // Reset result object
    this._gameEndResult.gameOver = false;
    this._gameEndResult.winner = null;
    this._gameEndResult.message = null;
    
    if (player.getNumShips() === 0) {
      this._gameEndResult.gameOver = true;
      this._gameEndResult.winner = 'CPU';
      this._gameEndResult.message = '*** GAME OVER! The CPU sunk all your battleships! ***';
      return this._gameEndResult;
    }
    
    if (cpu.getNumShips() === 0) {
      this._gameEndResult.gameOver = true;
      this._gameEndResult.winner = 'Player';
      this._gameEndResult.message = '*** CONGRATULATIONS! You sunk all enemy battleships! ***';
      return this._gameEndResult;
    }
    
    return this._gameEndResult;
  }
}

export { GameLogic }; 