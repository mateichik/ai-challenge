import { Ship } from './ship.js';

// Game Logic Management Class
class GameLogic {
  constructor() {
    // GameLogic is stateless - all methods accept state as parameters
  }

  // Move ship placement logic from placeShipsRandomly function
  placeShips(targetBoard, shipsArray, numberOfShips, boardSize, shipLength, playerBoard) {
    let placedShips = 0;
    let attempts = 0;
    const maxAttempts = boardSize * boardSize * 10; // Safeguard against infinite loops

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

        if (targetBoard.getCell(checkRow, checkCol) !== '~') {
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
  }

  // Move hit detection logic from processPlayerGuess function
  processHit(guess, boardSize, guesses, ships, board, shipLength, playerType = 'generic', display) {
    // Input validation
    if (guess === null || guess === undefined || typeof guess !== 'string' || guess.length !== 2) {
      if (display) display.showMessage('Oops, input must be exactly two digits (e.g., 00, 34, 98).');
      return { success: false, hit: false, sunk: false };
    }

    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);

    if (
      isNaN(row) ||
      isNaN(col) ||
      row < 0 ||
      row >= boardSize ||
      col < 0 ||
      col >= boardSize
    ) {
      display?.showMessage(
        `Oops, please enter valid row and column numbers between 0 and ${boardSize - 1}.`,
      );
      return { success: false, hit: false, sunk: false };
    }

    const formattedGuess = guess;

    if (guesses.includes(formattedGuess)) {
      display?.showMessage('You already guessed that location!');
      return { success: false, hit: false, sunk: false };
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

  // Move victory condition checking logic
  checkGameEnd(gameState) {
    if (gameState.getPlayer().getNumShips() === 0) {
      return { gameOver: true, winner: 'CPU', message: '*** GAME OVER! The CPU sunk all your battleships! ***' };
    }
    
    if (gameState.getCpu().getNumShips() === 0) {
      return { gameOver: true, winner: 'Player', message: '*** CONGRATULATIONS! You sunk all enemy battleships! ***' };
    }
    
    return { gameOver: false, winner: null, message: null };
  }
}

export { GameLogic }; 