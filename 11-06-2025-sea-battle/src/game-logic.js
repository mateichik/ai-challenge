import { Ship } from './ship.js';
import { validateNumberRange, validateRequired, validateArray, validateCoordinate } from './validation.js';
import { InvalidCoordinateError, DuplicateGuessError, InvalidShipPlacementError } from './game-errors.js';

/**
 * Game Logic Management Class
 * Handles core game mechanics like ship placement and hit detection
 */
class GameLogic {
  constructor() {
    // GameLogic is stateless - all methods accept state as parameters
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
    const occupiedCells = Array(boardSize).fill().map(() => Array(boardSize).fill(false));

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
        if (targetBoard.getCell(checkRow, checkCol) !== '~' || occupiedCells[checkRow][checkCol]) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        const shipLocations = [];
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
          occupiedCells[placeRow][placeCol] = true;

          if (targetBoard === playerBoard) {
            targetBoard.setCell(placeRow, placeCol, 'S');
          }
        }
        
        // Create Ship object instead of plain object
        const newShip = new Ship(shipLocations);
        shipsArray.push(newShip);
        placedShips++;
      }
    }
    
    // Check if we placed all ships
    if (placedShips < numberOfShips) {
      throw new InvalidShipPlacementError(`Failed to place all ships after ${maxAttempts} attempts`);
    }
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

    let hit = false;
    let sunk = false;

    for (let i = 0; i < ships.length; i++) {
      const ship = ships[i];
      
      if (ship.hasLocation(formattedGuess)) {
        const hitResult = ship.hit(formattedGuess);
        
        if (hitResult) {
          // New hit
          board.setCell(row, col, 'X');
          
          // Player-specific messages
          if (playerType === 'player') {
            display?.showMessage('PLAYER HIT!');
          } else {
            display?.showMessage('HIT!');
          }
          hit = true;

          if (ship.isSunk()) {
            if (playerType === 'player') {
              display?.showMessage('You sunk an enemy battleship!');
            } else {
              display?.showMessage('You sunk a battleship!');
            }
            sunk = true;
          }
        } else {
          // Already hit this location
          display?.showMessage('You already hit that spot!');
          hit = true;
        }
        break;
      }
    }

    if (!hit) {
      board.setCell(row, col, 'O');
      if (playerType === 'player') {
        display?.showMessage('PLAYER MISS.');
      } else {
        display?.showMessage('MISS.');
      }
    }

    return { success: true, hit: hit, sunk: sunk };
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
    
    if (player.getNumShips() === 0) {
      return { gameOver: true, winner: 'CPU', message: '*** GAME OVER! The CPU sunk all your battleships! ***' };
    }
    
    if (cpu.getNumShips() === 0) {
      return { gameOver: true, winner: 'Player', message: '*** CONGRATULATIONS! You sunk all enemy battleships! ***' };
    }
    
    return { gameOver: false, winner: null, message: null };
  }
}

export { GameLogic }; 