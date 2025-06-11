// Unit Tests for Sea Battle Game
// Covers utility functions, pure functions, and edge cases from requirements.md

const {
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
} = require('./seabattle.js');

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
    const ship = { hits: ['', '', ''] };
    expect(isSunk(ship, 3)).toBe(false);
  });

  test('should return false for ship with partial hits', () => {
    const ship = { hits: ['hit', '', ''] };
    expect(isSunk(ship, 3)).toBe(false);
  });

  test('should return true for ship with all hits', () => {
    const ship = { hits: ['hit', 'hit', 'hit'] };
    expect(isSunk(ship, 3)).toBe(true);
  });
});

describe('createBoard Function', () => {
  test('should create correct board dimensions', () => {
    const result = createBoard(10);
    expect(result.board).toHaveLength(10);
    expect(result.playerBoard).toHaveLength(10);
    expect(result.board[0]).toHaveLength(10);
  });

  test('should initialize cells as water', () => {
    const result = createBoard(3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(result.board[i][j]).toBe('~');
        expect(result.playerBoard[i][j]).toBe('~');
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
    expect(gameState.getPlayerNumShips()).toBe(3);
    expect(gameState.getCpuNumShips()).toBe(3);
    expect(gameState.getBoardSize()).toBe(10);
    expect(gameState.getShipLength()).toBe(3);
    expect(gameState.getCpuMode()).toBe('hunt');
  });

  test('should handle ship count changes', () => {
    gameState.decrementPlayerShips();
    expect(gameState.getPlayerNumShips()).toBe(2);
    
    gameState.decrementCpuShips();
    expect(gameState.getCpuNumShips()).toBe(2);
  });

  test('should track game end conditions', () => {
    expect(gameState.isGameOver()).toBe(false);
    
    gameState.setCpuNumShips(0);
    expect(gameState.hasPlayerWon()).toBe(true);
    expect(gameState.isGameOver()).toBe(true);
    
    gameState.setCpuNumShips(3);
    gameState.setPlayerNumShips(0);
    expect(gameState.hasCpuWon()).toBe(true);
  });
});

describe('GameLogic Class', () => {
  let gameLogic;

  beforeEach(() => {
    gameLogic = new GameLogic();
  });

  test('should initialize as stateless class', () => {
    expect(gameLogic).toBeInstanceOf(GameLogic);
  });

  test('should place ships without collision', () => {
    const board = Array(10).fill().map(() => Array(10).fill('~'));
    const ships = [];
    
    gameLogic.placeShips(board, ships, 3, 10, 3, board);
    
    expect(ships).toHaveLength(3);
    ships.forEach(ship => {
      expect(ship.locations).toHaveLength(3);
      expect(ship.hits).toHaveLength(3);
    });
  });

  test('should process hits correctly', () => {
    const board = Array(10).fill().map(() => Array(10).fill('~'));
    const guesses = [];
    const ships = [{ locations: ['00', '01', '02'], hits: ['', '', ''] }];
    
    const result = gameLogic.processHit('00', 10, guesses, ships, board, 3);
    
    expect(result.success).toBe(true);
    expect(result.hit).toBe(true);
    expect(result.sunk).toBe(false);
    expect(board[0][0]).toBe('X');
  });

  test('should check game end conditions', () => {
    const gameState = new GameState();
    
    // Game not over initially
    let result = gameLogic.checkGameEnd(gameState);
    expect(result.gameOver).toBe(false);
    
    // Player wins
    gameState.setCpuNumShips(0);
    result = gameLogic.checkGameEnd(gameState);
    expect(result.gameOver).toBe(true);
    expect(result.winner).toBe('Player');
    
    // CPU wins
    gameState.setCpuNumShips(3);
    gameState.setPlayerNumShips(0);
    result = gameLogic.checkGameEnd(gameState);
    expect(result.gameOver).toBe(true);
    expect(result.winner).toBe('CPU');
  });
});

describe('processPlayerGuess Function', () => {
  let mockBoard, mockGuesses, mockCpuShips;

  beforeEach(() => {
    mockBoard = Array(10).fill().map(() => Array(10).fill('~'));
    mockGuesses = [];
    mockCpuShips = [
      { locations: ['00', '01', '02'], hits: ['', '', ''] }
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
    expect(mockBoard[0][0]).toBe('X');
  });

  test('should handle misses', () => {
    const result = processPlayerGuess('99', 10, mockGuesses, mockCpuShips, mockBoard, 3);
    expect(result.success).toBe(true);
    expect(result.hit).toBe(false);
    expect(mockBoard[9][9]).toBe('O');
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
      expect(result.board).toHaveLength(size);
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