// Unit Tests for Sea Battle Game
// Covers utility functions, pure functions, and edge cases from requirements.md

const {
  GameConfig,
  GameState,
  GameLogic,
  Ship,
  Player,
  AIPlayer,
  isValidAndNewGuess,
  isSunk,
  createBoard,
  placeShipsRandomly,
  processPlayerGuess,
  gameLoop,
  main,
  SeaBattleGame
} = require('./seabattle.js');
const { Board } = require('./board.js');

beforeAll(() => {
  // Mock console.log to prevent output during tests
  global.console.log = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GameConfig Constants', () => {
  test('should have correct configuration values', () => {
    expect(GameConfig.BOARD_SIZE).toBe(10);
    expect(GameConfig.NUM_SHIPS).toBe(3);
    expect(GameConfig.SHIP_LENGTH).toBe(3);
  });
});

describe('isValidAndNewGuess Function', () => {
  test('should accept valid coordinates', () => {
    expect(isValidAndNewGuess(0, 0, [], 10)).toBe(true);
    expect(isValidAndNewGuess(5, 5, [], 10)).toBe(true);
    expect(isValidAndNewGuess(9, 9, [], 10)).toBe(true);
  });

  test('should reject out of bounds coordinates', () => {
    expect(isValidAndNewGuess(-1, 5, [], 10)).toBe(false);
    expect(isValidAndNewGuess(10, 5, [], 10)).toBe(false);
    expect(isValidAndNewGuess(5, -1, [], 10)).toBe(false);
    expect(isValidAndNewGuess(5, 10, [], 10)).toBe(false);
  });

  test('should detect duplicate guesses', () => {
    const guesses = ['00', '55'];
    expect(isValidAndNewGuess(0, 0, guesses, 10)).toBe(false);
    expect(isValidAndNewGuess(5, 5, guesses, 10)).toBe(false);
    expect(isValidAndNewGuess(1, 1, guesses, 10)).toBe(true);
  });
});

describe('isSunk Function', () => {
  test('should return false for ship with no hits', () => {
    const ship = new Ship(['00', '01', '02']);
    expect(isSunk(ship)).toBe(false);
  });

  test('should return false for ship with partial hits', () => {
    const ship = new Ship(['00', '01', '02']);
    ship.hit('00'); // Hit one location
    expect(isSunk(ship)).toBe(false);
  });

  test('should return true for ship with all hits', () => {
    const ship = new Ship(['00', '01', '02']);
    ship.hit('00');
    ship.hit('01');
    ship.hit('02');
    expect(isSunk(ship)).toBe(true);
  });
});

describe('createBoard Function', () => {
  test('should create correct board dimensions', () => {
    const result = createBoard(10);
    expect(result.opponentBoardObject.getSize()).toBe(10);
    expect(result.playerBoardObject.getSize()).toBe(10);
  });

  test('should initialize cells as water', () => {
    const result = createBoard(3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(result.opponentBoardObject.getCell(i, j)).toBe('~');
        expect(result.playerBoardObject.getCell(i, j)).toBe('~');
      }
    }
  });

  test('should provide Board objects for new API', () => {
    const result = createBoard(5);
    
    // Should provide Board objects
    expect(result.opponentBoardObject).toBeInstanceOf(Board);
    expect(result.playerBoardObject).toBeInstanceOf(Board);
    
    // Board objects should have correct size
    expect(result.opponentBoardObject.getSize()).toBe(5);
    expect(result.playerBoardObject.getSize()).toBe(5);
    
    // Should work with Board methods
    expect(result.opponentBoardObject.getCell(0, 0)).toBe('~');
    result.playerBoardObject.setCell(2, 2, 'S');
    expect(result.playerBoardObject.getCell(2, 2)).toBe('S');
  });
});

describe('GameState Class', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  test('should initialize with correct defaults', () => {
    expect(gameState.getPlayer()).toBeInstanceOf(Player);
    expect(gameState.getCpu()).toBeInstanceOf(AIPlayer);
    expect(gameState.getCpu().getMode()).toBe('hunt');
    expect(gameState.getBoardSize()).toBe(10);
  });

  test('should handle ship count changes', () => {
    gameState.getPlayer().decrementNumShips();
    expect(gameState.getPlayer().getNumShips()).toBe(2);
    
    gameState.getCpu().decrementNumShips();
    expect(gameState.getCpu().getNumShips()).toBe(2);
  });

  test('should track game end conditions', () => {
    expect(gameState.isGameOver()).toBe(false);
    
    gameState.getCpu().setNumShips(0);
    expect(gameState.hasPlayerWon()).toBe(true);
    expect(gameState.isGameOver()).toBe(true);
    
    gameState.getCpu().setNumShips(3);
    gameState.getPlayer().setNumShips(0);
    expect(gameState.hasCpuWon()).toBe(true);
  });
});

describe('GameLogic Class', () => {
  let gameLogic;
  let board;
  let ships;
  let playerBoard;

  beforeEach(() => {
    gameLogic = new GameLogic();
    board = new Board(10);
    ships = [];
    playerBoard = new Board(10);
  });

  test('should place ships without collision', () => {
    gameLogic.placeShips(board, ships, 3, 10, 3, playerBoard);
    expect(ships).toHaveLength(3);
    ships.forEach(ship => {
      expect(ship.getLength()).toBe(3);
      expect(ship.getLocations()).toHaveLength(3);
    });
  });

  test('should process hits correctly', () => {
    const ship = new Ship(['00', '01', '02']);
    ships.push(ship);
    
    const result = gameLogic.processHit('00', 10, [], ships, board, 3);
    expect(result.success).toBe(true);
    expect(result.hit).toBe(true);
    expect(board.getCell(0, 0)).toBe('X');
  });

  test('should check game end conditions', () => {
    const gameState = new GameState();
    
    // Game not over initially
    let result = gameLogic.checkGameEnd(gameState);
    expect(result.gameOver).toBe(false);
    
    // Player wins
    gameState.getCpu().setNumShips(0);
    result = gameLogic.checkGameEnd(gameState);
    expect(result.gameOver).toBe(true);
    expect(result.winner).toBe('Player');
    
    // CPU wins
    gameState.getCpu().setNumShips(3);
    gameState.getPlayer().setNumShips(0);
    result = gameLogic.checkGameEnd(gameState);
    expect(result.gameOver).toBe(true);
    expect(result.winner).toBe('CPU');
  });
});

describe('processPlayerGuess Function', () => {
  let mockBoard, mockGuesses, mockCpuShips;

  beforeEach(() => {
    mockBoard = new Board(10);
    mockGuesses = [];
    mockCpuShips = [
      new Ship(['00', '01', '02'])
    ];
  });

  test('should reject invalid input formats', () => {
    const inputs = [null, '', '1', '123', 'ab', '!@'];
    inputs.forEach(input => {
      const result = processPlayerGuess(input, 10, mockGuesses, mockCpuShips, mockBoard, 3);
      expect(result.success).toBe(false);
    });
  });

  test('should handle valid hits', () => {
    const result = processPlayerGuess('00', 10, mockGuesses, mockCpuShips, mockBoard, 3);
    expect(result.success).toBe(true);
    expect(result.hit).toBe(true);
    expect(mockBoard.getCell(0, 0)).toBe('X');
  });

  test('should handle misses', () => {
    const result = processPlayerGuess('99', 10, mockGuesses, mockCpuShips, mockBoard, 3);
    expect(result.success).toBe(true);
    expect(result.hit).toBe(false);
    expect(mockBoard.getCell(9, 9)).toBe('O');
  });

  test('should prevent duplicate guesses', () => {
    mockGuesses.push('00');
    const result = processPlayerGuess('00', 10, mockGuesses, mockCpuShips, mockBoard, 3);
    expect(result.success).toBe(false);
  });
});

describe('Edge Cases from Requirements', () => {
  test('should handle boundary coordinates correctly', () => {
    // Test corner cases
    expect(isValidAndNewGuess(0, 0, [], 10)).toBe(true);
    expect(isValidAndNewGuess(0, 9, [], 10)).toBe(true);
    expect(isValidAndNewGuess(9, 0, [], 10)).toBe(true);
    expect(isValidAndNewGuess(9, 9, [], 10)).toBe(true);
  });

  test('should handle different board sizes', () => {
    [1, 5, 8, 15].forEach(size => {
      const result = createBoard(size);
      expect(result.opponentBoardObject.getSize()).toBe(size);
      expect(result.playerBoardObject.getSize()).toBe(size);
      expect(isValidAndNewGuess(size-1, size-1, [], size)).toBe(true);
      expect(isValidAndNewGuess(size, 0, [], size)).toBe(false);
    });
  });

  test('should handle large guess histories efficiently', () => {
    const largeGuessList = [];
    for (let i = 0; i < 100; i++) {
      largeGuessList.push(`${i % 10}${Math.floor(i / 10) % 10}`);
    }
    
    const start = Date.now();
    const result = isValidAndNewGuess(5, 5, largeGuessList, 10);
    const end = Date.now();
    
    expect(end - start).toBeLessThan(50);
  });

  test('should handle different board sizes', () => {
    [1, 5, 8, 15].forEach(size => {
      const result = createBoard(size);
      expect(result.opponentBoardObject.getSize()).toBe(size);
      expect(result.playerBoardObject.getSize()).toBe(size);
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          expect(result.opponentBoardObject.getCell(i, j)).toBe('~');
          expect(result.playerBoardObject.getCell(i, j)).toBe('~');
        }
      }
    });
  });
});

describe('Board Class', () => {
  let board;

  beforeEach(() => {
    board = new Board(10);
  });

  test('should initialize with correct size and water cells', () => {
    expect(board.getSize()).toBe(10);
    expect(board.getCell(0, 0)).toBe('~');
    expect(board.getCell(5, 5)).toBe('~');
    expect(board.getCell(9, 9)).toBe('~');
  });

  test('should validate coordinates correctly', () => {
    expect(board.isValidCoordinate(0, 0)).toBe(true);
    expect(board.isValidCoordinate(5, 5)).toBe(true);
    expect(board.isValidCoordinate(9, 9)).toBe(true);
    expect(board.isValidCoordinate(-1, 0)).toBe(false);
    expect(board.isValidCoordinate(0, -1)).toBe(false);
    expect(board.isValidCoordinate(10, 0)).toBe(false);
    expect(board.isValidCoordinate(0, 10)).toBe(false);
  });

  test('should get and set cell values correctly', () => {
    board.setCell(5, 5, 'X');
    expect(board.getCell(5, 5)).toBe('X');
    
    board.setCell(0, 0, 'S');
    expect(board.getCell(0, 0)).toBe('S');
  });

  test('should throw error for invalid coordinates', () => {
    expect(() => board.getCell(-1, 0)).toThrow('Invalid coordinates: -1, 0');
    expect(() => board.setCell(10, 0, 'X')).toThrow('Invalid coordinates: 10, 0');
  });

  test('should clear board correctly', () => {
    board.setCell(5, 5, 'X');
    board.setCell(0, 0, 'S');
    board.clear();
    expect(board.getCell(5, 5)).toBe('~');
    expect(board.getCell(0, 0)).toBe('~');
  });

  test('should return board array copy', () => {
    board.setCell(1, 1, 'X');
    const boardArray = board.getBoardArray();
    expect(boardArray[1][1]).toBe('X');
    
    // Modify the copy - should not affect original
    boardArray[2][2] = 'O';
    expect(board.getCell(2, 2)).toBe('~');
  });

  test('should render board with title', () => {
    board.setCell(0, 0, 'X');
    board.setCell(1, 1, 'S');
    const output = board.render('TEST BOARD', true);
    
    expect(output).toContain('--- TEST BOARD ---');
    expect(output).toContain('X');
    expect(output).toContain('S');
  });

  test('should hide ships when showShips is false', () => {
    board.setCell(1, 1, 'S');
    const outputHidden = board.render('TEST', false);
    const outputVisible = board.render('TEST', true);
    
    // The hidden output should not show 'S' at the ship position  
    // but the visible output should show 'S'
    expect(outputVisible).toContain('S');
    
    // Check that in hidden output, position (1,1) shows '~' instead of 'S'
    const hiddenLines = outputHidden.split('\n');
    const row1Line = hiddenLines.find(line => line.startsWith('1 '));
    expect(row1Line).toContain('~ ~'); // Should show water where ship is
  });

  test('should render two boards side by side', () => {
    const opponentBoard = new Board(3);
    const playerBoard = new Board(3);
    
    opponentBoard.setCell(0, 0, 'X');
    playerBoard.setCell(1, 1, 'S');
    
    const output = Board.renderSideBySide(opponentBoard, playerBoard);
    
    expect(output).toContain('--- OPPONENT BOARD ---');
    expect(output).toContain('--- YOUR BOARD ---');
    expect(output).toContain('X');
    expect(output).toContain('S');
  });

  test('should work with different board sizes', () => {
    const smallBoard = new Board(3);
    const largeBoard = new Board(15);
    
    expect(smallBoard.getSize()).toBe(3);
    expect(largeBoard.getSize()).toBe(15);
    
    expect(smallBoard.isValidCoordinate(2, 2)).toBe(true);
    expect(smallBoard.isValidCoordinate(3, 0)).toBe(false);
    
    expect(largeBoard.isValidCoordinate(14, 14)).toBe(true);
    expect(largeBoard.isValidCoordinate(15, 0)).toBe(false);
  });
});

describe('Ship Class', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(['00', '01', '02']);
  });

  test('should initialize with correct locations and length', () => {
    expect(ship.getLocations()).toEqual(['00', '01', '02']);
    expect(ship.getLength()).toBe(3);
    expect(ship.getHitCount()).toBe(0);
    expect(ship.getRemainingHealth()).toBe(3);
    expect(ship.isSunk()).toBe(false);
  });

  test('should throw error for invalid constructor arguments', () => {
    expect(() => new Ship()).toThrow('Ship locations must be a non-empty array');
    expect(() => new Ship([])).toThrow('Ship locations must be a non-empty array');
    expect(() => new Ship(null)).toThrow('Ship locations must be a non-empty array');
    expect(() => new Ship('invalid')).toThrow('Ship locations must be a non-empty array');
  });

  test('should handle hits correctly', () => {
    // Hit valid location
    expect(ship.hit('00')).toBe(true);
    expect(ship.getHitCount()).toBe(1);
    expect(ship.getRemainingHealth()).toBe(2);
    expect(ship.getHitStatus('00')).toBe('hit');
    expect(ship.isSunk()).toBe(false);

    // Hit same location again
    expect(ship.hit('00')).toBe(false);
    expect(ship.getHitCount()).toBe(1);

    // Hit invalid location
    expect(ship.hit('99')).toBe(false);
    expect(ship.getHitCount()).toBe(1);
  });

  test('should detect when ship is sunk', () => {
    expect(ship.isSunk()).toBe(false);
    
    ship.hit('00');
    expect(ship.isSunk()).toBe(false);
    
    ship.hit('01');
    expect(ship.isSunk()).toBe(false);
    
    ship.hit('02');
    expect(ship.isSunk()).toBe(true);
    expect(ship.getRemainingHealth()).toBe(0);
  });

  test('should check location membership correctly', () => {
    expect(ship.hasLocation('00')).toBe(true);
    expect(ship.hasLocation('01')).toBe(true);
    expect(ship.hasLocation('02')).toBe(true);
    expect(ship.hasLocation('03')).toBe(false);
    expect(ship.hasLocation('99')).toBe(false);
  });

  test('should return hit status correctly', () => {
    expect(ship.getHitStatus('00')).toBe('');
    expect(ship.getHitStatus('99')).toBe(null);
    
    ship.hit('00');
    expect(ship.getHitStatus('00')).toBe('hit');
    expect(ship.getHitStatus('01')).toBe('');
  });

  test('should protect internal state', () => {
    const locations = ship.getLocations();
    locations.push('99'); // Try to modify returned array
    
    expect(ship.getLocations()).toEqual(['00', '01', '02']); // Should be unchanged
    expect(ship.hasLocation('99')).toBe(false);
  });

  test('should work with different ship sizes', () => {
    const singleShip = new Ship(['55']);
    const largeShip = new Ship(['10', '20', '30', '40', '50']);
    
    expect(singleShip.getLength()).toBe(1);
    expect(largeShip.getLength()).toBe(5);
    
    singleShip.hit('55');
    expect(singleShip.isSunk()).toBe(true);
    
    largeShip.hit('10');
    largeShip.hit('20');
    expect(largeShip.isSunk()).toBe(false);
    expect(largeShip.getRemainingHealth()).toBe(3);
  });

  test('should support legacy format conversion', () => {
    const legacyShip = { locations: ['11', '12', '13'], hits: ['hit', '', 'hit'] };
    const convertedShip = Ship.fromLegacyFormat(legacyShip);
    
    expect(convertedShip.getLocations()).toEqual(['11', '12', '13']);
    expect(convertedShip.getHitStatus('11')).toBe('hit');
    expect(convertedShip.getHitStatus('12')).toBe('');
    expect(convertedShip.getHitStatus('13')).toBe('hit');
    expect(convertedShip.getHitCount()).toBe(2);
    expect(convertedShip.isSunk()).toBe(false);
  });
});

describe('isSunk Function', () => {
  test('should work with Ship objects', () => {
    const ship = new Ship(['00', '01', '02']);
    
    expect(isSunk(ship)).toBe(false);
    
    ship.hit('00');
    ship.hit('01');
    expect(isSunk(ship)).toBe(false);
    
    ship.hit('02');
    expect(isSunk(ship)).toBe(true);
  });

  test('should throw error for non-Ship objects', () => {
    const invalidShip = { locations: ['00'], hits: [''] };
    expect(() => isSunk(invalidShip)).toThrow('Expected Ship object, got: object');
    
    expect(() => isSunk(null)).toThrow('Expected Ship object, got: object');
    expect(() => isSunk('invalid')).toThrow('Expected Ship object, got: string');
  });
}); 