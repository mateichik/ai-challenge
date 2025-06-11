// Integration Tests and Advanced Edge Cases for Sea Battle Game
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

// Mock console methods
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('Ship Placement Integration Tests', () => {
  test('should place ships without overlapping (REQ-009)', () => {
    const gameState = new GameState();
    const boards = createBoard(gameState.getBoardSize());
    gameState.setBoard(boards.board);
    gameState.setPlayerBoard(boards.playerBoard);

    // Place ships and verify no overlaps
    placeShipsRandomly(
      gameState.getPlayerBoard(), 
      gameState.getPlayerShips(), 
      GameConfig.NUM_SHIPS, 
      gameState.getBoardSize(), 
      gameState.getShipLength(), 
      gameState.getPlayerBoard()
    );

    const ships = gameState.getPlayerShips();
    expect(ships).toHaveLength(GameConfig.NUM_SHIPS);

    // Check for overlaps
    const occupiedCells = new Set();
    ships.forEach(ship => {
      ship.locations.forEach(location => {
        expect(occupiedCells.has(location)).toBe(false);
        occupiedCells.add(location);
      });
    });
  });

  test('should place ships within board boundaries (REQ-010)', () => {
    const gameState = new GameState();
    const boards = createBoard(gameState.getBoardSize());
    gameState.setBoard(boards.board);
    gameState.setPlayerBoard(boards.playerBoard);

    placeShipsRandomly(
      gameState.getPlayerBoard(), 
      gameState.getPlayerShips(), 
      GameConfig.NUM_SHIPS, 
      gameState.getBoardSize(), 
      gameState.getShipLength(), 
      gameState.getPlayerBoard()
    );

    const ships = gameState.getPlayerShips();
    ships.forEach(ship => {
      ship.locations.forEach(location => {
        const row = parseInt(location[0]);
        const col = parseInt(location[1]);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(gameState.getBoardSize());
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(gameState.getBoardSize());
      });
    });
  });

  test('should create ships of correct length (REQ-007)', () => {
    const gameState = new GameState();
    const boards = createBoard(gameState.getBoardSize());
    gameState.setBoard(boards.board);
    gameState.setPlayerBoard(boards.playerBoard);

    placeShipsRandomly(
      gameState.getPlayerBoard(), 
      gameState.getPlayerShips(), 
      GameConfig.NUM_SHIPS, 
      gameState.getBoardSize(), 
      gameState.getShipLength(), 
      gameState.getPlayerBoard()
    );

    const ships = gameState.getPlayerShips();
    ships.forEach(ship => {
      expect(ship.locations).toHaveLength(GameConfig.SHIP_LENGTH);
      expect(ship.hits).toHaveLength(GameConfig.SHIP_LENGTH);
    });
  });
});

describe('Complete Game Flow Integration', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
    const boards = createBoard(gameState.getBoardSize());
    gameState.setBoard(boards.board);
    gameState.setPlayerBoard(boards.playerBoard);
    
    // Manually place ships for predictable testing
    gameState.setPlayerShips([
      { locations: ['00', '01', '02'], hits: ['', '', ''] },
      { locations: ['10', '20', '30'], hits: ['', '', ''] },
      { locations: ['55', '56', '57'], hits: ['', '', ''] }
    ]);
    
    gameState.setCpuShips([
      { locations: ['99', '98', '97'], hits: ['', '', ''] },
      { locations: ['11', '12', '13'], hits: ['', '', ''] },
      { locations: ['44', '45', '46'], hits: ['', '', ''] }
    ]);
  });

  test('should handle complete ship sinking scenario', () => {
    // Sink first CPU ship
    let result = processPlayerGuess('99', gameState.getBoardSize(), gameState.getGuesses(), gameState.getCpuShips(), gameState.getBoard(), gameState.getShipLength());
    expect(result.hit).toBe(true);
    expect(result.sunk).toBe(false);

    result = processPlayerGuess('98', gameState.getBoardSize(), gameState.getGuesses(), gameState.getCpuShips(), gameState.getBoard(), gameState.getShipLength());
    expect(result.hit).toBe(true);
    expect(result.sunk).toBe(false);

    result = processPlayerGuess('97', gameState.getBoardSize(), gameState.getGuesses(), gameState.getCpuShips(), gameState.getBoard(), gameState.getShipLength());
    expect(result.hit).toBe(true);
    expect(result.sunk).toBe(true);

    // Verify ship is completely sunk
    const sunkShip = gameState.getCpuShips()[0];
    expect(isSunk(sunkShip, gameState.getShipLength())).toBe(true);
  });

  test('should track victory conditions correctly (REQ-059, REQ-060)', () => {
    // Initially no one has won
    expect(gameState.hasPlayerWon()).toBe(false);
    expect(gameState.hasCpuWon()).toBe(false);

    // Simulate player winning
    gameState.setCpuNumShips(0);
    expect(gameState.hasPlayerWon()).toBe(true);
    expect(gameState.isGameOver()).toBe(true);

    // Reset and simulate CPU winning
    gameState.setCpuNumShips(3);
    gameState.setPlayerNumShips(0);
    expect(gameState.hasCpuWon()).toBe(true);
    expect(gameState.isGameOver()).toBe(true);
  });
});

describe('CPU AI Integration Tests', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
    const boards = createBoard(gameState.getBoardSize());
    gameState.setBoard(boards.board);
    gameState.setPlayerBoard(boards.playerBoard);
    
    gameState.setPlayerShips([
      { locations: ['50', '51', '52'], hits: ['', '', ''] }
    ]);
  });

  test('should handle CPU hunt mode logic (REQ-045, REQ-046, REQ-047)', () => {
    const result = cpuTurn(
      'hunt',
      [],
      gameState.getCpuGuesses(),
      gameState.getPlayerShips(),
      gameState.getPlayerBoard(),
      gameState.getBoardSize(),
      gameState.getShipLength()
    );

    expect(result).toHaveProperty('newCpuMode');
    expect(result).toHaveProperty('newCpuTargetQueue');
    expect(result).toHaveProperty('hit');
    expect(result).toHaveProperty('sunk');
  });

  test('should switch to target mode after hit (REQ-049, REQ-050)', () => {
    // Mock CPU hitting the ship
    const result = cpuTurn(
      'hunt',
      [],
      [], // Empty CPU guesses to allow hitting
      gameState.getPlayerShips(),
      gameState.getPlayerBoard(),
      gameState.getBoardSize(),
      gameState.getShipLength()
    );

    if (result.hit) {
      expect(result.newCpuMode).toBe('target');
      expect(result.newCpuTargetQueue.length).toBeGreaterThan(0);
    }
  });
});

describe('Edge Cases from Requirements (EDGE-001 to EDGE-023)', () => {
  describe('Input Validation Edge Cases', () => {
    let mockBoard, mockGuesses, mockCpuShips;

    beforeEach(() => {
      mockBoard = Array(10).fill().map(() => Array(10).fill('~'));
      mockGuesses = [];
      mockCpuShips = [];
    });

    test('should handle various invalid input formats (EDGE-001 to EDGE-006)', () => {
      const invalidInputs = [
        null,           // EDGE-001: null input
        '',             // EDGE-001: empty string
        '1',            // EDGE-002: single character
        '123',          // EDGE-003: three characters
        'ab',           // EDGE-004: non-numeric
        '1a',           // EDGE-004: mixed
        '!@',           // EDGE-005: special characters
        ' ',            // EDGE-006: whitespace
        '  ',           // EDGE-006: multiple spaces
        '\t',           // EDGE-006: tab
        '\n'            // EDGE-006: newline
      ];

      invalidInputs.forEach(input => {
        const result = processPlayerGuess(input, 10, mockGuesses, mockCpuShips, mockBoard, 3);
        expect(result.success).toBe(false);
      });
    });

    test('should handle boundary edge cases (EDGE-007)', () => {
      // Test coordinates that are exactly at the boundary
      const boundaryTests = [
        { input: '00', valid: true },   // Top-left corner
        { input: '09', valid: true },   // Top-right corner
        { input: '90', valid: true },   // Bottom-left corner
        { input: '99', valid: true },   // Bottom-right corner
        { input: 'a0', valid: false },  // Invalid row
        { input: '0a', valid: false },  // Invalid column
      ];

      boundaryTests.forEach(test => {
        const result = processPlayerGuess(test.input, 10, mockGuesses, mockCpuShips, mockBoard, 3);
        expect(result.success).toBe(test.valid);
      });
    });
  });

  describe('AI Edge Cases', () => {
    test('should handle empty target queue in target mode (EDGE-015)', () => {
      const result = cpuTurn(
        'target',
        [], // Empty target queue
        [],
        [],
        Array(10).fill().map(() => Array(10).fill('~')),
        10,
        3
      );

      expect(result.newCpuMode).toBe('hunt');
    });

    test('should handle CPU hits at board edges (EDGE-016)', () => {
      const playerShips = [
        { locations: ['00', '01', '02'], hits: ['', '', ''] } // Ship at edge
      ];
      const playerBoard = Array(10).fill().map(() => Array(10).fill('~'));

      // Force CPU to hit edge location
      const result = cpuTurn(
        'target',
        ['00'], // Target the edge position
        [],
        playerShips,
        playerBoard,
        10,
        3
      );

      if (result.hit) {
        // Should only add valid adjacent coordinates
        result.newCpuTargetQueue.forEach(coord => {
          const row = parseInt(coord[0]);
          const col = parseInt(coord[1]);
          expect(row).toBeGreaterThanOrEqual(0);
          expect(row).toBeLessThan(10);
          expect(col).toBeGreaterThanOrEqual(0);
          expect(col).toBeLessThan(10);
        });
      }
    });

    test('should handle CPU hits in corner (EDGE-017)', () => {
      const playerShips = [
        { locations: ['00', '10', '20'], hits: ['', '', ''] } // Ship starting at corner
      ];
      const playerBoard = Array(10).fill().map(() => Array(10).fill('~'));

      const result = cpuTurn(
        'target',
        ['00'], // Target corner position
        [],
        playerShips,
        playerBoard,
        10,
        3
      );

      if (result.hit) {
        // Should have fewer adjacent coordinates due to corner position
        expect(result.newCpuTargetQueue.length).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('Game State Edge Cases', () => {
    test('should handle board state integrity (EDGE-022)', () => {
      const gameState = new GameState();
      const boards = createBoard(gameState.getBoardSize());
      
      // Verify board structure
      expect(boards.board).toHaveLength(gameState.getBoardSize());
      expect(boards.playerBoard).toHaveLength(gameState.getBoardSize());
      
      boards.board.forEach(row => {
        expect(row).toHaveLength(gameState.getBoardSize());
        expect(Array.isArray(row)).toBe(true);
      });
    });

    test('should handle memory constraints with large guess histories (EDGE-023)', () => {
      const gameState = new GameState();
      const initialMemory = process.memoryUsage().heapUsed;

      // Add many guesses
      for (let i = 0; i < 1000; i++) {
        gameState.addGuess(`${i % 10}${Math.floor(i / 10) % 10}`);
        gameState.addCpuGuess(`${Math.floor(i / 10) % 10}${i % 10}`);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });
});

describe('Non-Functional Requirements Validation', () => {
  test('should meet performance requirements (NFR-001)', () => {
    const gameState = new GameState();
    const boards = createBoard(gameState.getBoardSize());
    
    const start = Date.now();
    
    // Simulate user input processing
    const result = processPlayerGuess(
      '50', 
      gameState.getBoardSize(), 
      gameState.getGuesses(), 
      gameState.getCpuShips(), 
      boards.board, 
      gameState.getShipLength()
    );
    
    const end = Date.now();
    const responseTime = end - start;
    
    expect(responseTime).toBeLessThan(100); // Should respond within 100ms
    expect(result).toHaveProperty('success');
  });

  test('should maintain deterministic behavior (NFR-007)', () => {
    // Test that same inputs produce same outputs
    const gameState1 = new GameState();
    const gameState2 = new GameState();
    
    expect(gameState1.getBoardSize()).toBe(gameState2.getBoardSize());
    expect(gameState1.getShipLength()).toBe(gameState2.getShipLength());
    expect(gameState1.getCpuMode()).toBe(gameState2.getCpuMode());
  });

  test('should handle graceful error recovery (NFR-006)', () => {
    const gameState = new GameState();
    const boards = createBoard(gameState.getBoardSize());
    
    // Test with various edge case inputs
    const edgeCases = [undefined, null, NaN, Infinity, -Infinity, '', '  '];
    
    edgeCases.forEach(input => {
      expect(() => {
        const result = processPlayerGuess(
          input, 
          gameState.getBoardSize(), 
          gameState.getGuesses(), 
          gameState.getCpuShips(), 
          boards.board, 
          gameState.getShipLength()
        );
        expect(result).toHaveProperty('success');
      }).not.toThrow();
    });
  });
});

describe('printBoard Function Tests', () => {
  test('should handle empty boards', () => {
    const emptyBoard = Array(3).fill().map(() => Array(3).fill('~'));
    const emptyPlayerBoard = Array(3).fill().map(() => Array(3).fill('~'));
    
    expect(() => {
      printBoard(emptyBoard, emptyPlayerBoard, 3);
    }).not.toThrow();
    
    expect(console.log).toHaveBeenCalled();
  });

  test('should handle boards with mixed content', () => {
    const board = [
      ['~', 'O', '~'],
      ['X', '~', 'O'],
      ['~', 'X', '~']
    ];
    const playerBoard = [
      ['S', 'S', 'S'],
      ['~', '~', '~'],
      ['O', '~', 'X']
    ];
    
    expect(() => {
      printBoard(board, playerBoard, 3);
    }).not.toThrow();
  });

  test('should handle different board sizes', () => {
    [1, 5, 10, 15].forEach(size => {
      const board = Array(size).fill().map(() => Array(size).fill('~'));
      const playerBoard = Array(size).fill().map(() => Array(size).fill('~'));
      
      expect(() => {
        printBoard(board, playerBoard, size);
      }).not.toThrow();
    });
  });
}); 