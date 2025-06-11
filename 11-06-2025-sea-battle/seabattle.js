const readline = require('readline');

// Game Configuration Constants
const GameConfig = {
  BOARD_SIZE: 10,
  NUM_SHIPS: 3,
  SHIP_LENGTH: 3
};

// Game State Management Class
class GameState {
  constructor() {
    // Ship arrays
    this.playerShips = [];
    this.cpuShips = [];
    
    // Ship counts
    this.playerNumShips = GameConfig.NUM_SHIPS;
    this.cpuNumShips = GameConfig.NUM_SHIPS;
    
    // Guess history
    this.guesses = [];
    this.cpuGuesses = [];
    
    // AI state
    this.cpuMode = 'hunt';
    this.cpuTargetQueue = [];
    
    // Board arrays
    this.board = [];
    this.playerBoard = [];
    
    // Configuration references
    this.boardSize = GameConfig.BOARD_SIZE;
    this.shipLength = GameConfig.SHIP_LENGTH;
  }
  
  // Getter methods
  getPlayerShips() { return this.playerShips; }
  getCpuShips() { return this.cpuShips; }
  getPlayerNumShips() { return this.playerNumShips; }
  getCpuNumShips() { return this.cpuNumShips; }
  getGuesses() { return this.guesses; }
  getCpuGuesses() { return this.cpuGuesses; }
  getCpuMode() { return this.cpuMode; }
  getCpuTargetQueue() { return this.cpuTargetQueue; }
  getBoard() { return this.board; }
  getPlayerBoard() { return this.playerBoard; }
  getBoardSize() { return this.boardSize; }
  getShipLength() { return this.shipLength; }
  
  // Setter methods
  setPlayerShips(ships) { this.playerShips = ships; }
  setCpuShips(ships) { this.cpuShips = ships; }
  setPlayerNumShips(count) { this.playerNumShips = count; }
  setCpuNumShips(count) { this.cpuNumShips = count; }
  setGuesses(guesses) { this.guesses = guesses; }
  setCpuGuesses(guesses) { this.cpuGuesses = guesses; }
  setCpuMode(mode) { this.cpuMode = mode; }
  setCpuTargetQueue(queue) { this.cpuTargetQueue = queue; }
  setBoard(board) { this.board = board; }
  setPlayerBoard(board) { this.playerBoard = board; }
  
  // Utility methods
  decrementPlayerShips() { this.playerNumShips--; }
  decrementCpuShips() { this.cpuNumShips--; }
  addGuess(guess) { this.guesses.push(guess); }
  addCpuGuess(guess) { this.cpuGuesses.push(guess); }
  addPlayerShip(ship) { this.playerShips.push(ship); }
  addCpuShip(ship) { this.cpuShips.push(ship); }
  
  // Game state inquiry methods
  isGameOver() {
    return this.playerNumShips === 0 || this.cpuNumShips === 0;
  }
  
  hasPlayerWon() {
    return this.cpuNumShips === 0;
  }
  
  hasCpuWon() {
    return this.playerNumShips === 0;
  }
}

// Game Logic Management Class
class GameLogic {
  constructor() {
    // GameLogic is stateless - all methods accept state as parameters
  }

  // Move ship placement logic from placeShipsRandomly function
  placeShips(targetBoard, shipsArray, numberOfShips, boardSize, shipLength, playerBoard) {
    let placedShips = 0;
    while (placedShips < numberOfShips) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      let startRow, startCol;
      let collision = false;

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

        if (targetBoard[checkRow][checkCol] !== '~') {
          collision = true;
          break;
        }
      }

      if (!collision) {
        const newShip = { locations: [], hits: [] };
        for (let i = 0; i < shipLength; i++) {
          let placeRow = startRow;
          let placeCol = startCol;
          if (orientation === 'horizontal') {
            placeCol += i;
          } else {
            placeRow += i;
          }
          const locationStr = String(placeRow) + String(placeCol);
          newShip.locations.push(locationStr);
          newShip.hits.push('');

          if (targetBoard === playerBoard) {
            targetBoard[placeRow][placeCol] = 'S';
          }
        }
        shipsArray.push(newShip);
        placedShips++;
      }
    }
    console.log(
      numberOfShips +
        ' ships placed randomly for ' +
        (targetBoard === playerBoard ? 'Player.' : 'CPU.'),
    );
  }

  // Move hit detection logic from processPlayerGuess function
  processHit(guess, boardSize, guesses, ships, board, shipLength, playerType = 'generic') {
    // Input validation
    if (guess === null || guess === undefined || typeof guess !== 'string' || guess.length !== 2) {
      console.log('Oops, input must be exactly two digits (e.g., 00, 34, 98).');
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
      console.log(
        'Oops, please enter valid row and column numbers between 0 and ' +
          (boardSize - 1) +
          '.',
      );
      return { success: false, hit: false, sunk: false };
    }

    const formattedGuess = guess;

    if (guesses.indexOf(formattedGuess) !== -1) {
      console.log('You already guessed that location!');
      return { success: false, hit: false, sunk: false };
    }
    guesses.push(formattedGuess);

    let hit = false;
    let sunk = false;

    for (let i = 0; i < ships.length; i++) {
      const ship = ships[i];
      const index = ship.locations.indexOf(formattedGuess);

      if (index >= 0 && ship.hits[index] !== 'hit') {
        ship.hits[index] = 'hit';
        board[row][col] = 'X';
        
        // Player-specific messages
        if (playerType === 'player') {
          console.log('PLAYER HIT!');
        } else {
          console.log('HIT!');
        }
        hit = true;

        if (isSunk(ship, shipLength)) {
          if (playerType === 'player') {
            console.log('You sunk an enemy battleship!');
          } else {
            console.log('You sunk a battleship!');
          }
          sunk = true;
        }
        break;
      } else if (index >= 0 && ship.hits[index] === 'hit') {
        console.log('You already hit that spot!');
        hit = true;
        break;
      }
    }

    if (!hit) {
      board[row][col] = 'O';
      if (playerType === 'player') {
        console.log('PLAYER MISS.');
      } else {
        console.log('MISS.');
      }
    }

    return { success: true, hit: hit, sunk: sunk };
  }

  // Move victory condition checking logic
  checkGameEnd(gameState) {
    if (gameState.getPlayerNumShips() === 0) {
      return { gameOver: true, winner: 'CPU', message: '*** GAME OVER! The CPU sunk all your battleships! ***' };
    }
    
    if (gameState.getCpuNumShips() === 0) {
      return { gameOver: true, winner: 'Player', message: '*** CONGRATULATIONS! You sunk all enemy battleships! ***' };
    }
    
    return { gameOver: false, winner: null, message: null };
  }
}

// Board Management Class
class Board {
  #boardArray;
  #size;

  constructor(size) {
    this.#size = size;
    this.#boardArray = this.#initializeBoard();
  }

  // Private method to initialize the board array
  #initializeBoard() {
    const board = [];
    for (let i = 0; i < this.#size; i++) {
      board[i] = [];
      for (let j = 0; j < this.#size; j++) {
        board[i][j] = '~';
      }
    }
    return board;
  }

  // Get the value of a specific cell
  getCell(row, col) {
    if (!this.isValidCoordinate(row, col)) {
      throw new Error(`Invalid coordinates: ${row}, ${col}`);
    }
    return this.#boardArray[row][col];
  }

  // Set the value of a specific cell
  setCell(row, col, value) {
    if (!this.isValidCoordinate(row, col)) {
      throw new Error(`Invalid coordinates: ${row}, ${col}`);
    }
    this.#boardArray[row][col] = value;
  }

  // Check if coordinates are valid for this board
  isValidCoordinate(row, col) {
    return row >= 0 && row < this.#size && col >= 0 && col < this.#size;
  }

  // Get the board size
  getSize() {
    return this.#size;
  }

  // Get a copy of the entire board array (for backward compatibility)
  getBoardArray() {
    return this.#boardArray.map(row => [...row]);
  }

  // Get direct reference to board array (for performance - use carefully)
  _getDirectBoardReference() {
    return this.#boardArray;
  }

  // Clear the board (reset all cells to water)
  clear() {
    for (let i = 0; i < this.#size; i++) {
      for (let j = 0; j < this.#size; j++) {
        this.#boardArray[i][j] = '~';
      }
    }
  }

  // Render method for board display logic
  render(title = 'BOARD', showShips = false) {
    let output = `\n   --- ${title} ---\n`;
    
    // Header with column numbers
    let header = '  ';
    for (let h = 0; h < this.#size; h++) {
      header += h + ' ';
    }
    output += header + '\n';

    // Board rows
    for (let i = 0; i < this.#size; i++) {
      let rowStr = i + ' ';
      for (let j = 0; j < this.#size; j++) {
        let cellValue = this.#boardArray[i][j];
        // Hide ships if showShips is false
        if (!showShips && cellValue === 'S') {
          cellValue = '~';
        }
        rowStr += cellValue + ' ';
      }
      output += rowStr + '\n';
    }
    
    return output;
  }

  // Render two boards side by side (for game display)
  static renderSideBySide(opponentBoard, playerBoard) {
    const size = opponentBoard.getSize();
    let output = '\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---\n';
    
    // Header
    let header = '  ';
    for (let h = 0; h < size; h++) header += h + ' ';
    output += header + '     ' + header + '\n';

    // Board rows
    for (let i = 0; i < size; i++) {
      let rowStr = i + ' ';

      // Opponent board (hide ships)
      for (let j = 0; j < size; j++) {
        let cellValue = opponentBoard.getCell(i, j);
        if (cellValue === 'S') cellValue = '~'; // Hide opponent ships
        rowStr += cellValue + ' ';
      }
      
      rowStr += '    ' + i + ' ';

      // Player board (show ships)
      for (let j = 0; j < size; j++) {
        rowStr += playerBoard.getCell(i, j) + ' ';
      }
      
      output += rowStr + '\n';
    }
    
    return output;
  }
}

// === UTILITY FUNCTIONS ===

// TESTABLE FUNCTION - accepts boardSize parameter
function isValidAndNewGuess(row, col, guessList, boardSize) {
  if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
    return false;
  }
  const guessStr = String(row) + String(col);
  return guessList.indexOf(guessStr) === -1;
}

// TESTABLE FUNCTION - accepts shipLength parameter
function isSunk(ship, shipLength) {
  for (let i = 0; i < shipLength; i++) {
    if (ship.hits[i] !== 'hit') {
      return false;
    }
  }
  return true;
}

// TESTABLE FUNCTION - accepts size parameter and returns boards
function createBoard(size) {
  const opponentBoard = new Board(size);
  const playerBoard = new Board(size);
  
  // Return both Board objects and raw arrays for backward compatibility
  return { 
    board: opponentBoard._getDirectBoardReference(),
    playerBoard: playerBoard._getDirectBoardReference(),
    opponentBoardObject: opponentBoard,
    playerBoardObject: playerBoard
  };
}

// TESTABLE FUNCTION - accepts all configuration parameters
function placeShipsRandomly(targetBoard, shipsArray, numberOfShips, boardSize, shipLength, playerBoard) {
  const gameLogic = new GameLogic();
  return gameLogic.placeShips(targetBoard, shipsArray, numberOfShips, boardSize, shipLength, playerBoard);
}

// TESTABLE FUNCTION - accepts board arrays as parameters
function printBoard(opponentBoard, playerBoard, boardSize) {
  // Check if we received Board objects or raw arrays
  if (opponentBoard instanceof Board && playerBoard instanceof Board) {
    // Use the new Board rendering method
    console.log(Board.renderSideBySide(opponentBoard, playerBoard));
  } else {
    // Fallback to original logic for raw arrays
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    let header = '  ';
    for (let h = 0; h < boardSize; h++) header += h + ' ';
    console.log(header + '     ' + header);

    for (let i = 0; i < boardSize; i++) {
      let rowStr = i + ' ';

      for (let j = 0; j < boardSize; j++) {
        rowStr += opponentBoard[i][j] + ' ';
      }
      rowStr += '    ' + i + ' ';

      for (let j = 0; j < boardSize; j++) {
        rowStr += playerBoard[i][j] + ' ';
      }
      console.log(rowStr);
    }
    console.log('\n');
  }
}

// TESTABLE FUNCTION - accepts dependencies as parameters
function processPlayerGuess(guess, boardSize, guesses, cpuShips, board, shipLength) {
  const gameLogic = new GameLogic();
  return gameLogic.processHit(guess, boardSize, guesses, cpuShips, board, shipLength, 'player');
}

// TESTABLE FUNCTION - accepts AI state as parameters
function cpuTurn(cpuMode, cpuTargetQueue, cpuGuesses, playerShips, playerBoard, boardSize, shipLength) {
  console.log("\n--- CPU's Turn ---");
  let guessRow, guessCol, guessStr;
  let madeValidGuess = false;
  let newCpuMode = cpuMode;
  let newCpuTargetQueue = [...cpuTargetQueue]; // Create a copy to avoid mutation
  let hit = false;
  let sunk = false;

  while (!madeValidGuess) {
    if (newCpuMode === 'target' && newCpuTargetQueue.length > 0) {
      guessStr = newCpuTargetQueue.shift();
      guessRow = parseInt(guessStr[0]);
      guessCol = parseInt(guessStr[1]);
      console.log('CPU targets: ' + guessStr);

      if (cpuGuesses.indexOf(guessStr) !== -1) {
        if (newCpuTargetQueue.length === 0) newCpuMode = 'hunt';
        continue;
      }
    } else {
      newCpuMode = 'hunt';
      guessRow = Math.floor(Math.random() * boardSize);
      guessCol = Math.floor(Math.random() * boardSize);
      guessStr = String(guessRow) + String(guessCol);

      if (!isValidAndNewGuess(guessRow, guessCol, cpuGuesses, boardSize)) {
        continue;
      }
    }

    madeValidGuess = true;
    cpuGuesses.push(guessStr);

    for (let i = 0; i < playerShips.length; i++) {
      const ship = playerShips[i];
      const index = ship.locations.indexOf(guessStr);

      if (index >= 0) {
        ship.hits[index] = 'hit';
        playerBoard[guessRow][guessCol] = 'X';
        console.log('CPU HIT at ' + guessStr + '!');
        hit = true;

        if (isSunk(ship, shipLength)) {
          console.log('CPU sunk your battleship!');
          sunk = true;

          newCpuMode = 'hunt';
          newCpuTargetQueue = [];
        } else {
          newCpuMode = 'target';
          const adjacent = [
            { r: guessRow - 1, c: guessCol },
            { r: guessRow + 1, c: guessCol },
            { r: guessRow, c: guessCol - 1 },
            { r: guessRow, c: guessCol + 1 },
          ];
          for (const adj of adjacent) {
            if (isValidAndNewGuess(adj.r, adj.c, cpuGuesses, boardSize)) {
              const adjStr = String(adj.r) + String(adj.c);

              if (newCpuTargetQueue.indexOf(adjStr) === -1) {
                newCpuTargetQueue.push(adjStr);
              }
            }
          }
        }
        break;
      }
    }

    if (!hit) {
      playerBoard[guessRow][guessCol] = 'O';
      console.log('CPU MISS at ' + guessStr + '.');

      if (newCpuMode === 'target' && newCpuTargetQueue.length === 0) {
        newCpuMode = 'hunt';
      }
    }
  }

  return {
    newCpuMode: newCpuMode,
    newCpuTargetQueue: newCpuTargetQueue,
    hit: hit,
    sunk: sunk
  };
}

// TESTABLE FUNCTION - accepts game state as parameters
function gameLoop(gameState, rl) {
  const gameLogic = new GameLogic();
  const gameEndResult = gameLogic.checkGameEnd(gameState);
  
  if (gameEndResult.gameOver) {
    console.log('\n' + gameEndResult.message);
    printBoard(gameState.getBoard(), gameState.getPlayerBoard(), gameState.getBoardSize());
    rl.close();
    return;
  }

  printBoard(gameState.getBoard(), gameState.getPlayerBoard(), gameState.getBoardSize());
  rl.question('Enter your guess (e.g., 00): ', function (answer) {
    const playerGuessResult = processPlayerGuess(
      answer, 
      gameState.getBoardSize(), 
      gameState.getGuesses(), 
      gameState.getCpuShips(), 
      gameState.getBoard(), 
      gameState.getShipLength()
    );

    if (playerGuessResult.success) {
      if (playerGuessResult.sunk) {
        gameState.decrementCpuShips();
      }
      
      const playerWinCheck = gameLogic.checkGameEnd(gameState);
      if (playerWinCheck.gameOver) {
        gameLoop(gameState, rl);
        return;
      }

      const cpuTurnResult = cpuTurn(
        gameState.getCpuMode(), 
        gameState.getCpuTargetQueue(), 
        gameState.getCpuGuesses(), 
        gameState.getPlayerShips(), 
        gameState.getPlayerBoard(), 
        gameState.getBoardSize(), 
        gameState.getShipLength()
      );
      
      // Update AI state based on return value
      gameState.setCpuMode(cpuTurnResult.newCpuMode);
      gameState.setCpuTargetQueue(cpuTurnResult.newCpuTargetQueue);
      
      if (cpuTurnResult.sunk) {
        gameState.decrementPlayerShips();
      }

      const cpuWinCheck = gameLogic.checkGameEnd(gameState);
      if (cpuWinCheck.gameOver) {
        gameLoop(gameState, rl);
        return;
      }
    }

    gameLoop(gameState, rl);
  });
}

// Export functions and classes for testing
module.exports = {
  GameConfig,
  GameState,
  GameLogic,
  Board,
  isValidAndNewGuess,
  isSunk,
  createBoard,
  placeShipsRandomly,
  processPlayerGuess,
  cpuTurn,
  printBoard,
  gameLoop
};

// Only run the game if this file is executed directly (not imported for testing)
if (require.main === module) {
  // Create readline interface for game interaction
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Initialize game state
  const gameState = new GameState();

  // Create boards
  const boards = createBoard(gameState.getBoardSize());
  gameState.setBoard(boards.board);
  gameState.setPlayerBoard(boards.playerBoard);
  console.log('Boards created.');

  // Place ships randomly
  placeShipsRandomly(
    gameState.getPlayerBoard(), 
    gameState.getPlayerShips(), 
    GameConfig.NUM_SHIPS, 
    gameState.getBoardSize(), 
    gameState.getShipLength(), 
    gameState.getPlayerBoard()
  );

  placeShipsRandomly(
    gameState.getBoard(), 
    gameState.getCpuShips(), 
    GameConfig.NUM_SHIPS, 
    gameState.getBoardSize(), 
    gameState.getShipLength(), 
    gameState.getPlayerBoard()
  );

  console.log("\nLet's play Sea Battle!");
  console.log('Try to sink the ' + GameConfig.NUM_SHIPS + ' enemy ships.');
  
  gameLoop(gameState, rl);
}
