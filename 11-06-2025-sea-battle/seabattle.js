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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
  const newBoard = [];
  const newPlayerBoard = [];
  
  for (let i = 0; i < size; i++) {
    newBoard[i] = [];
    newPlayerBoard[i] = [];
    for (let j = 0; j < size; j++) {
      newBoard[i][j] = '~';
      newPlayerBoard[i][j] = '~';
    }
  }
  
  return { board: newBoard, playerBoard: newPlayerBoard };
}

// TESTABLE FUNCTION - accepts all configuration parameters
function placeShipsRandomly(targetBoard, shipsArray, numberOfShips, boardSize, shipLength, playerBoard) {
  let placedShips = 0;
  while (placedShips < numberOfShips) {
    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    let startRow, startCol;
    let shipLocations = [];
    let collision = false;

    if (orientation === 'horizontal') {
      startRow = Math.floor(Math.random() * boardSize);
      startCol = Math.floor(Math.random() * (boardSize - shipLength + 1));
    } else {
      startRow = Math.floor(Math.random() * (boardSize - shipLength + 1));
      startCol = Math.floor(Math.random() * boardSize);
    }

    let tempLocations = [];
    for (let i = 0; i < shipLength; i++) {
      let checkRow = startRow;
      let checkCol = startCol;
      if (orientation === 'horizontal') {
        checkCol += i;
      } else {
        checkRow += i;
      }
      const locationStr = String(checkRow) + String(checkCol);
      tempLocations.push(locationStr);

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

// TESTABLE FUNCTION - accepts board arrays as parameters
function printBoard(opponentBoard, playerBoard, boardSize) {
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

// TESTABLE FUNCTION - accepts dependencies as parameters
function processPlayerGuess(guess, boardSize, guesses, cpuShips, board, shipLength) {
  if (guess === null || guess.length !== 2) {
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

  for (let i = 0; i < cpuShips.length; i++) {
    const ship = cpuShips[i];
    const index = ship.locations.indexOf(formattedGuess);

    if (index >= 0 && ship.hits[index] !== 'hit') {
      ship.hits[index] = 'hit';
      board[row][col] = 'X';
      console.log('PLAYER HIT!');
      hit = true;

      if (isSunk(ship, shipLength)) {
        console.log('You sunk an enemy battleship!');
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
    console.log('PLAYER MISS.');
  }

  return { success: true, hit: hit, sunk: sunk };
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
  if (gameState.hasPlayerWon()) {
    console.log('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
    printBoard(gameState.getBoard(), gameState.getPlayerBoard(), gameState.getBoardSize());
    rl.close();
    return;
  }
  if (gameState.hasCpuWon()) {
    console.log('\n*** GAME OVER! The CPU sunk all your battleships! ***');
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
      
      if (gameState.hasPlayerWon()) {
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

      if (gameState.hasCpuWon()) {
        gameLoop(gameState, rl);
        return;
      }
    }

    gameLoop(gameState, rl);
  });
}

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
