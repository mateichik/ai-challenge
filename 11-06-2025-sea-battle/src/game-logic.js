import { Ship } from './ship.js';
import { validateNumberRange, validateRequired, validateArray, validateCoordinate } from './validation.js';
import { InvalidCoordinateError, DuplicateGuessError, InvalidShipPlacementError } from './game-errors.js';
import { performanceMonitor } from './performance-monitor.js';

/**
 * Game Logic Management Class
 * Handles core game mechanics like ship placement and hit detection
 */
class GameLogic {
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
   * Places ships randomly on the game board
   * @param {Board} targetBoard - The board to place ships on
   * @param {Array} shipsArray - Array to store created ships
   * @param {number} numberOfShips - Number of ships to place
   * @param {number} boardSize - Size of the game board
   * @param {number} shipLength - Length of each ship
   * @param {Board} playerBoard - Player's board (for visibility)
   * @throws {TypeError} If required parameters are missing or invalid
   * @throws {InvalidShipPlacementError} If ships cannot be placed after maximum attempts
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

    // Create a tracking grid to check for collisions more reliably
    // Reuse existing array if possible to reduce memory allocation
    if (!this._occupiedCells || this._occupiedCells.length !== boardSize) {
      this._occupiedCells = Array(boardSize).fill().map(() => Array(boardSize).fill(false));
    } else {
      // Reset existing array
      for (let i = 0; i < boardSize; i++) {
        this._occupiedCells[i].fill(false);
      }
    }

    // Reuse ship locations array to reduce allocations in the loop
    const shipLocations = [];
    
    while (placedShips < numberOfShips && attempts < maxAttempts) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      let startRow, startCol;
      let collision = false;
      attempts++;

      if (orientation === 'horizontal') {
        startRow = Math.floor(Math.random() * boardSize);
        startCol = Math.floor(Math.random() * (boardSize - shipLength + 1));
      } else {
        startRow = Math.floor(Math.random() * (boardSize - shipLength + 1));
        startCol = Math.floor(Math.random() * boardSize);
      }

      // Check for collisions
      for (let i = 0; i < shipLength; i++) {
        let checkRow = startRow;
        let checkCol = startCol;
        if (orientation === 'horizontal') {
          checkCol += i;
        } else {
          checkRow += i;
        }

        if (checkRow >= boardSize || checkCol >= boardSize) {
          collision = true;
          break;
        }

        // Check both the board state and our tracking grid
        if (targetBoard.getCell(checkRow, checkCol) !== '~' || this._occupiedCells[checkRow][checkCol]) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        // Clear previous locations
        shipLocations.length = 0;
        
        for (let i = 0; i < shipLength; i++) {
          let placeRow = startRow;
          let placeCol = startCol;
          if (orientation === 'horizontal') {
            placeCol += i;
          } else {
            placeRow += i;
          }
          const locationStr = String(placeRow) + String(placeCol);
          shipLocations.push(locationStr);

          // Mark as occupied in our tracking grid
          this._occupiedCells[placeRow][placeCol] = true;

          if (targetBoard === playerBoard) {
            targetBoard.setCell(placeRow, placeCol, 'S');
          }
        }
        
        // Create Ship object instead of plain object
        // Clone the locations array to avoid reference issues
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
   * Processes a player's guess and determines hit/miss result
   * @param {string} guess - The coordinate guess (e.g., "00")
   * @param {number} boardSize - Size of the game board
   * @param {Array} guesses - Array of previous guesses
   * @param {Array} ships - Array of ships to check for hits
   * @param {Board} board - Game board to update
   * @param {number} shipLength - Length of ships
   * @param {string} playerType - Type of player ('player', 'cpu', or 'generic')
   * @param {GameDisplay} display - Display object for showing messages
   * @returns {Object} Result object with success, hit, and sunk properties
   * @throws {InvalidCoordinateError} If coordinates are invalid
   * @throws {DuplicateGuessError} If location has already been guessed
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
    
    if (typeof guess !== 'string' || guess.length !== 2) {
      throw new InvalidCoordinateError(guess, boardSize);
    }

    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);

    // Validate coordinates
    if (isNaN(row) || isNaN(col) || row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
      throw new InvalidCoordinateError(guess, boardSize);
    }

    const formattedGuess = guess;

    // Check for duplicate guess
    if (guesses.includes(formattedGuess)) {
      throw new DuplicateGuessError(formattedGuess);
    }
    
    guesses.push(formattedGuess);

    // Reset result object
    this._hitResult.hit = false;
    this._hitResult.sunk = false;
    this._hitResult.success = true;

    // Cache ship count for performance
    const shipCount = ships.length;
    for (let i = 0; i < shipCount; i++) {
      const ship = ships[i];
      
      if (ship.hasLocation(formattedGuess)) {
        const hitResult = ship.hit(formattedGuess);
        
        if (hitResult) {
          // New hit
          board.setCell(row, col, 'X');
          
          // Player-specific messages - use cached messages
          if (playerType === 'player') {
            display?.showMessage(this._messages.playerHit);
          } else {
            display?.showMessage(this._messages.hit);
          }
          this._hitResult.hit = true;

          if (ship.isSunk()) {
            if (playerType === 'player') {
              display?.showMessage(this._messages.sunkEnemy);
            } else {
              display?.showMessage(this._messages.sunkGeneric);
            }
            this._hitResult.sunk = true;
          }
        } else {
          // Already hit this location
          display?.showMessage(this._messages.alreadyHit);
          this._hitResult.hit = true;
        }
        return this._hitResult;
      }
    }

    board.setCell(row, col, 'O');
    if (playerType === 'player') {
      display?.showMessage(this._messages.playerMiss);
    } else {
      display?.showMessage(this._messages.miss);
    }

    return this._hitResult;
  }

  /**
   * Checks if the game has ended
   * @param {GameState} gameState - Current game state
   * @returns {Object} Game end status with gameOver, winner, and message properties
   * @throws {TypeError} If gameState is invalid
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