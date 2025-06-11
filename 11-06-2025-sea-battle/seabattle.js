var readline = require('readline');

// Game Configuration Constants
const GameConfig = {
  BOARD_SIZE: 10,
  NUM_SHIPS: 3,
  SHIP_LENGTH: 3
};

var playerShips = [];
var cpuShips = [];
var playerNumShips = GameConfig.NUM_SHIPS;
var cpuNumShips = GameConfig.NUM_SHIPS;

var guesses = [];
var cpuGuesses = [];
var cpuMode = 'hunt';
var cpuTargetQueue = [];

var board = [];
var playerBoard = [];

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// STATEFUL FUNCTION
function createBoard() {
  for (var i = 0; i < GameConfig.BOARD_SIZE; i++) {
    board[i] = [];
    playerBoard[i] = [];
    for (var j = 0; j < GameConfig.BOARD_SIZE; j++) {
      board[i][j] = '~';
      playerBoard[i][j] = '~';
    }
  }
  console.log('Boards created.');
}

// STATEFUL FUNCTION
function placeShipsRandomly(targetBoard, shipsArray, numberOfShips) {
  var placedShips = 0;
  while (placedShips < numberOfShips) {
    var orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    var startRow, startCol;
    var shipLocations = [];
    var collision = false;

    if (orientation === 'horizontal') {
      startRow = Math.floor(Math.random() * GameConfig.BOARD_SIZE);
      startCol = Math.floor(Math.random() * (GameConfig.BOARD_SIZE - GameConfig.SHIP_LENGTH + 1));
    } else {
      startRow = Math.floor(Math.random() * (GameConfig.BOARD_SIZE - GameConfig.SHIP_LENGTH + 1));
      startCol = Math.floor(Math.random() * GameConfig.BOARD_SIZE);
    }

    var tempLocations = [];
    for (var i = 0; i < GameConfig.SHIP_LENGTH; i++) {
      var checkRow = startRow;
      var checkCol = startCol;
      if (orientation === 'horizontal') {
        checkCol += i;
      } else {
        checkRow += i;
      }
      var locationStr = String(checkRow) + String(checkCol);
      tempLocations.push(locationStr);

      if (checkRow >= GameConfig.BOARD_SIZE || checkCol >= GameConfig.BOARD_SIZE) {
        collision = true;
        break;
      }

      if (targetBoard[checkRow][checkCol] !== '~') {
        collision = true;
        break;
      }
    }

    if (!collision) {
      var newShip = { locations: [], hits: [] };
      for (var i = 0; i < GameConfig.SHIP_LENGTH; i++) {
        var placeRow = startRow;
        var placeCol = startCol;
        if (orientation === 'horizontal') {
          placeCol += i;
        } else {
          placeRow += i;
        }
        var locationStr = String(placeRow) + String(placeCol);
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

// STATEFUL FUNCTION
function printBoard() {
  console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
  var header = '  ';
  for (var h = 0; h < GameConfig.BOARD_SIZE; h++) header += h + ' ';
  console.log(header + '     ' + header);

  for (var i = 0; i < GameConfig.BOARD_SIZE; i++) {
    var rowStr = i + ' ';

    for (var j = 0; j < GameConfig.BOARD_SIZE; j++) {
      rowStr += board[i][j] + ' ';
    }
    rowStr += '    ' + i + ' ';

    for (var j = 0; j < GameConfig.BOARD_SIZE; j++) {
      rowStr += playerBoard[i][j] + ' ';
    }
    console.log(rowStr);
  }
  console.log('\n');
}

// STATEFUL FUNCTION
function processPlayerGuess(guess) {
  if (guess === null || guess.length !== 2) {
    console.log('Oops, input must be exactly two digits (e.g., 00, 34, 98).');
    return false;
  }

  var row = parseInt(guess[0]);
  var col = parseInt(guess[1]);

  if (
    isNaN(row) ||
    isNaN(col) ||
    row < 0 ||
    row >= GameConfig.BOARD_SIZE ||
    col < 0 ||
    col >= GameConfig.BOARD_SIZE
  ) {
    console.log(
      'Oops, please enter valid row and column numbers between 0 and ' +
        (GameConfig.BOARD_SIZE - 1) +
        '.',
    );
    return false;
  }

  var formattedGuess = guess;

  if (guesses.indexOf(formattedGuess) !== -1) {
    console.log('You already guessed that location!');
    return false;
  }
  guesses.push(formattedGuess);

  var hit = false;

  for (var i = 0; i < cpuShips.length; i++) {
    var ship = cpuShips[i];
    var index = ship.locations.indexOf(formattedGuess);

    if (index >= 0 && ship.hits[index] !== 'hit') {
      ship.hits[index] = 'hit';
      board[row][col] = 'X';
      console.log('PLAYER HIT!');
      hit = true;

      if (isSunk(ship)) {
        console.log('You sunk an enemy battleship!');
        cpuNumShips--;
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

  return true;
}

// PURE FUNCTION
function isValidAndNewGuess(row, col, guessList) {
  if (row < 0 || row >= GameConfig.BOARD_SIZE || col < 0 || col >= GameConfig.BOARD_SIZE) {
    return false;
  }
  var guessStr = String(row) + String(col);
  return guessList.indexOf(guessStr) === -1;
}

// STATEFUL FUNCTION
function cpuTurn() {
  console.log("\n--- CPU's Turn ---");
  var guessRow, guessCol, guessStr;
  var madeValidGuess = false;

  while (!madeValidGuess) {
    if (cpuMode === 'target' && cpuTargetQueue.length > 0) {
      guessStr = cpuTargetQueue.shift();
      guessRow = parseInt(guessStr[0]);
      guessCol = parseInt(guessStr[1]);
      console.log('CPU targets: ' + guessStr);

      if (cpuGuesses.indexOf(guessStr) !== -1) {
        if (cpuTargetQueue.length === 0) cpuMode = 'hunt';
        continue;
      }
    } else {
      cpuMode = 'hunt';
      guessRow = Math.floor(Math.random() * GameConfig.BOARD_SIZE);
      guessCol = Math.floor(Math.random() * GameConfig.BOARD_SIZE);
      guessStr = String(guessRow) + String(guessCol);

      if (!isValidAndNewGuess(guessRow, guessCol, cpuGuesses)) {
        continue;
      }
    }

    madeValidGuess = true;
    cpuGuesses.push(guessStr);

    var hit = false;
    for (var i = 0; i < playerShips.length; i++) {
      var ship = playerShips[i];
      var index = ship.locations.indexOf(guessStr);

      if (index >= 0) {
        ship.hits[index] = 'hit';
        playerBoard[guessRow][guessCol] = 'X';
        console.log('CPU HIT at ' + guessStr + '!');
        hit = true;

        if (isSunk(ship)) {
          console.log('CPU sunk your battleship!');
          playerNumShips--;

          cpuMode = 'hunt';
          cpuTargetQueue = [];
        } else {
          cpuMode = 'target';
          var adjacent = [
            { r: guessRow - 1, c: guessCol },
            { r: guessRow + 1, c: guessCol },
            { r: guessRow, c: guessCol - 1 },
            { r: guessRow, c: guessCol + 1 },
          ];
          for (var adj of adjacent) {
            if (isValidAndNewGuess(adj.r, adj.c, cpuGuesses)) {
              var adjStr = String(adj.r) + String(adj.c);

              if (cpuTargetQueue.indexOf(adjStr) === -1) {
                cpuTargetQueue.push(adjStr);
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

      if (cpuMode === 'target' && cpuTargetQueue.length === 0) {
        cpuMode = 'hunt';
      }
    }
  }
}

// PURE FUNCTION
function isSunk(ship) {
  for (var i = 0; i < GameConfig.SHIP_LENGTH; i++) {
    if (ship.hits[i] !== 'hit') {
      return false;
    }
  }
  return true;
}

// STATEFUL FUNCTION
function gameLoop() {
  if (cpuNumShips === 0) {
    console.log('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
    printBoard();
    rl.close();
    return;
  }
  if (playerNumShips === 0) {
    console.log('\n*** GAME OVER! The CPU sunk all your battleships! ***');
    printBoard();
    rl.close();
    return;
  }

  printBoard();
  rl.question('Enter your guess (e.g., 00): ', function (answer) {
    var playerGuessed = processPlayerGuess(answer);

    if (playerGuessed) {
      if (cpuNumShips === 0) {
        gameLoop();
        return;
      }

      cpuTurn();

      if (playerNumShips === 0) {
        gameLoop();
        return;
      }
    }

    gameLoop();
  });
}

createBoard();

placeShipsRandomly(playerBoard, playerShips, GameConfig.NUM_SHIPS);
placeShipsRandomly(board, cpuShips, GameConfig.NUM_SHIPS);

console.log("\nLet's play Sea Battle!");
console.log('Try to sink the ' + GameConfig.NUM_SHIPS + ' enemy ships.');
gameLoop();
