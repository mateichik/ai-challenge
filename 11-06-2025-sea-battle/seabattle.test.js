// Unit Tests for Sea Battle Game
// Covers utility functions, pure functions, and edge cases from requirements.md

const {
  GameConfig,
  GameState,
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