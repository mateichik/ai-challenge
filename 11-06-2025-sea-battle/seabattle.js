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
    this.player = new Player(GameConfig.BOARD_SIZE, GameConfig.NUM_SHIPS, GameConfig.SHIP_LENGTH);
    this.cpu = new AIPlayer(GameConfig.BOARD_SIZE, GameConfig.NUM_SHIPS, GameConfig.SHIP_LENGTH);
    this.boardSize = GameConfig.BOARD_SIZE;
    this.shipLength = GameConfig.SHIP_LENGTH;
  }

  getPlayer() { return this.player; }
  getCpu() { return this.cpu; }
  getBoardSize() { return this.boardSize; }
  getShipLength() { return this.shipLength; }
  getCpuMode() { return this.cpu.getMode(); }

  isGameOver() {
    return this.player.getNumShips() === 0 || this.cpu.getNumShips() === 0;
  }
  hasPlayerWon() { return this.cpu.getNumShips() === 0; }
  hasCpuWon() { return this.player.getNumShips() === 0; }
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
      
      if (ship.hasLocation(formattedGuess)) {
        const hitResult = ship.hit(formattedGuess);
        
        if (hitResult) {
          // New hit
          board.setCell(row, col, 'X');
          
          // Player-specific messages
          if (playerType === 'player') {
            console.log('PLAYER HIT!');
          } else {
            console.log('HIT!');
          }
          hit = true;

          if (ship.isSunk()) {
            if (playerType === 'player') {
              console.log('You sunk an enemy battleship!');
            } else {
              console.log('You sunk a battleship!');
            }
            sunk = true;
          }
        } else {
          // Already hit this location
          console.log('You already hit that spot!');
          hit = true;
        }
        break;
      }
    }

    if (!hit) {
      board.setCell(row, col, 'O');
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
    if (gameState.getPlayer().getNumShips() === 0) {
      return { gameOver: true, winner: 'CPU', message: '*** GAME OVER! The CPU sunk all your battleships! ***' };
    }
    
    if (gameState.getCpu().getNumShips() === 0) {
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

// Ship Management Class
class Ship {
  #locations;
  #hits;
  #length;

  constructor(locations) {
    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      throw new Error('Ship locations must be a non-empty array');
    }
    
    this.#locations = [...locations]; // Create copy to prevent external modification
    this.#length = locations.length;
    this.#hits = new Array(this.#length).fill('');
  }

  // Hit a specific location on the ship
  hit(location) {
    const index = this.#locations.indexOf(location);
    if (index === -1) {
      return false; // Location not part of this ship
    }
    
    if (this.#hits[index] === 'hit') {
      return false; // Already hit
    }
    
    this.#hits[index] = 'hit';
    return true; // Successful hit
  }

  // Check if the ship is completely sunk
  isSunk() {
    return this.#hits.every(hit => hit === 'hit');
  }

  // Get ship locations (copy to prevent external modification)
  getLocations() {
    return [...this.#locations];
  }

  // Get hit status for a specific location
  getHitStatus(location) {
    const index = this.#locations.indexOf(location);
    return index !== -1 ? this.#hits[index] : null;
  }

  // Check if a location belongs to this ship
  hasLocation(location) {
    return this.#locations.includes(location);
  }

  // Get the ship length
  getLength() {
    return this.#length;
  }

  // Get number of hits received
  getHitCount() {
    return this.#hits.filter(hit => hit === 'hit').length;
  }

  // Get remaining health (unhit segments)
  getRemainingHealth() {
    return this.#length - this.getHitCount();
  }

  // For backward compatibility - convert to old format (temporary for transition)
  _toLegacyFormat() {
    return {
      locations: [...this.#locations],
      hits: [...this.#hits]
    };
  }

  // Create Ship from legacy format
  static fromLegacyFormat(legacyShip) {
    const ship = new Ship(legacyShip.locations);
    // Restore hit status
    for (let i = 0; i < legacyShip.hits.length; i++) {
      if (legacyShip.hits[i] === 'hit') {
        ship.#hits[i] = 'hit';
      }
    }
    return ship;
  }
}

// Player Management Class
class Player {
  constructor(boardSize, numShips, shipLength) {
    this.ships = [];
    this.board = new Board(boardSize);
    this.guesses = [];
    this.numShips = numShips;
    this.shipLength = shipLength;
  }

  getShips() { return this.ships; }
  setShips(ships) { this.ships = ships; }
  addShip(ship) { this.ships.push(ship); }

  getBoard() { return this.board; }
  setBoard(board) { this.board = board; }

  getGuesses() { return this.guesses; }
  setGuesses(guesses) { this.guesses = guesses; }
  addGuess(guess) { this.guesses.push(guess); }

  getNumShips() { return this.numShips; }
  setNumShips(count) { this.numShips = count; }
  decrementNumShips() { this.numShips--; }

  getShipLength() { return this.shipLength; }
  setShipLength(length) { this.shipLength = length; }
}

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
  calculateNextMove(playerShips, playerBoard, boardSize) {
    let guessRow, guessCol, guessStr;
    let madeValidGuess = false;
    let hit = false;
    let sunk = false;

    while (!madeValidGuess) {
      if (this.#mode === 'target' && this.#targetQueue.length > 0) {
        guessStr = this.#targetQueue.shift();
        guessRow = parseInt(guessStr[0]);
        guessCol = parseInt(guessStr[1]);
        console.log('CPU targets: ' + guessStr);

        if (this.guesses.indexOf(guessStr) !== -1) {
          if (this.#targetQueue.length === 0) this.#mode = 'hunt';
          continue;
        }
      } else {
        this.#mode = 'hunt';
        guessRow = Math.floor(Math.random() * boardSize);
        guessCol = Math.floor(Math.random() * boardSize);
        guessStr = String(guessRow) + String(guessCol);

        if (!isValidAndNewGuess(guessRow, guessCol, this.guesses, boardSize)) {
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
            console.log('CPU HIT at ' + guessStr + '!');
            hit = true;

            if (ship.isSunk()) {
              console.log('CPU sunk your battleship!');
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
        console.log('CPU MISS at ' + guessStr + '.');

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
      if (isValidAndNewGuess(adj.r, adj.c, this.guesses, boardSize)) {
        const adjStr = String(adj.r) + String(adj.c);
        if (this.#targetQueue.indexOf(adjStr) === -1) {
          this.#targetQueue.push(adjStr);
        }
      }
    }
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

// TESTABLE FUNCTION - accepts Ship object
function isSunk(ship) {
  if (!(ship instanceof Ship)) {
    throw new Error('Expected Ship object, got: ' + typeof ship);
  }
  return ship.isSunk();
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

// TESTABLE FUNCTION - accepts Board objects as parameters
function printBoard(opponentBoard, playerBoard, boardSize) {
  // Use the Board rendering method
  console.log(Board.renderSideBySide(opponentBoard, playerBoard));
}

// TESTABLE FUNCTION - accepts dependencies as parameters
function processPlayerGuess(guess, boardSize, guesses, cpuShips, board, shipLength) {
  const gameLogic = new GameLogic();
  return gameLogic.processHit(guess, boardSize, guesses, cpuShips, board, shipLength, 'player');
}

// TESTABLE FUNCTION - accepts game state as parameters
function gameLoop(gameState, rl) {
  const gameLogic = new GameLogic();
  const player = gameState.getPlayer();
  const cpu = gameState.getCpu();
  const gameEndResult = gameLogic.checkGameEnd(gameState);
  
  if (gameEndResult.gameOver) {
    console.log('\n' + gameEndResult.message);
    printBoard(cpu.getBoard(), player.getBoard(), gameState.getBoardSize());
    rl.close();
    return;
  }

  printBoard(cpu.getBoard(), player.getBoard(), gameState.getBoardSize());
  rl.question('Enter your guess (e.g., 00): ', function (answer) {
    const playerGuessResult = processPlayerGuess(
      answer, 
      gameState.getBoardSize(), 
      player.getGuesses(), 
      cpu.getShips(), 
      cpu.getBoard(), 
      gameState.getShipLength()
    );

    if (playerGuessResult.success) {
      if (playerGuessResult.sunk) {
        cpu.decrementNumShips();
      }
      
      const playerWinCheck = gameLogic.checkGameEnd(gameState);
      if (playerWinCheck.gameOver) {
        gameLoop(gameState, rl);
        return;
      }

      console.log("\n--- CPU's Turn ---");
      const cpuTurnResult = cpu.calculateNextMove(
        player.getShips(),
        player.getBoard(),
        gameState.getBoardSize()
      );
      
      if (cpuTurnResult.sunk) {
        player.decrementNumShips();
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
  Ship,
  Player,
  AIPlayer,
  isValidAndNewGuess,
  isSunk,
  createBoard,
  placeShipsRandomly,
  processPlayerGuess,
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
  const player = gameState.getPlayer();
  const cpu = gameState.getCpu();

  // Place ships randomly
  placeShipsRandomly(
    player.getBoard(),
    player.getShips(),
    GameConfig.NUM_SHIPS,
    GameConfig.BOARD_SIZE,
    GameConfig.SHIP_LENGTH,
    player.getBoard()
  );

  placeShipsRandomly(
    cpu.getBoard(),
    cpu.getShips(),
    GameConfig.NUM_SHIPS,
    GameConfig.BOARD_SIZE,
    GameConfig.SHIP_LENGTH,
    player.getBoard()
  );

  console.log("\nLet's play Sea Battle!");
  console.log('Try to sink the ' + GameConfig.NUM_SHIPS + ' enemy ships.');
  
  gameLoop(gameState, rl);
}
