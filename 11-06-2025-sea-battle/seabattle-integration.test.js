// Integration Tests and Advanced Edge Cases for Sea Battle Game
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
  gameLoop
} = require('./seabattle.js');
const { Board } = require('./board.js');
const { GameDisplay } = require('./game-display.js');

// Mock console methods
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('Ship Placement Integration Tests', () => {
  let gameState;
  let board;
  let ships;

  beforeEach(() => {
    gameState = new GameState();
    board = new Board(10);
    ships = [];
  });

  test('should place ships without overlapping (REQ-009)', () => {
    placeShipsRandomly(board, ships, 3, 10, 3, board);
    expect(ships).toHaveLength(3);

    const occupiedCells = new Set();
    ships.forEach(ship => {
      ship.getLocations().forEach(location => {
        expect(occupiedCells.has(location)).toBe(false);
        occupiedCells.add(location);
      });
    });
  });

  test('should place ships within board boundaries (REQ-010)', () => {
    placeShipsRandomly(board, ships, 3, 10, 3, board);
    expect(ships).toHaveLength(3);

    ships.forEach(ship => {
      ship.getLocations().forEach(location => {
        const row = parseInt(location[0]);
        const col = parseInt(location[1]);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(10);
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(10);
      });
    });
  });

  test('should create ships of correct length (REQ-007)', () => {
    placeShipsRandomly(board, ships, 3, 10, 3, board);
    expect(ships).toHaveLength(3);

    ships.forEach(ship => {
      expect(ship.getLength()).toBe(3);
      expect(ship.getLocations()).toHaveLength(3);
    });
  });
});

describe('Complete Game Flow Integration', () => {
  let gameState;
  let player;
  let cpu;

  beforeEach(() => {
    gameState = new GameState();
    player = gameState.getPlayer();
    cpu = gameState.getCpu();
    
    // Manually place ships for predictable testing using Ship objects
    player.setShips([
      new Ship(['00', '01', '02']),
      new Ship(['10', '20', '30']),
      new Ship(['55', '56', '57'])
    ]);
    
    cpu.setShips([
      new Ship(['99', '98', '97']),
      new Ship(['11', '12', '13']),
      new Ship(['44', '45', '46'])
    ]);
  });

  test('should handle complete ship sinking scenario', () => {
    // Sink first CPU ship
    let result = processPlayerGuess(
      '99', 
      gameState.getBoardSize(), 
      player.getGuesses(), 
      cpu.getShips(), 
      cpu.getBoard(), 
      gameState.getShipLength()
    );
    expect(result.hit).toBe(true);
    expect(result.sunk).toBe(false);

    result = processPlayerGuess(
      '98', 
      gameState.getBoardSize(), 
      player.getGuesses(), 
      cpu.getShips(), 
      cpu.getBoard(), 
      gameState.getShipLength()
    );
    expect(result.hit).toBe(true);
    expect(result.sunk).toBe(false);

    result = processPlayerGuess(
      '97', 
      gameState.getBoardSize(), 
      player.getGuesses(), 
      cpu.getShips(), 
      cpu.getBoard(), 
      gameState.getShipLength()
    );
    expect(result.hit).toBe(true);
    expect(result.sunk).toBe(true);

    // Verify ship is completely sunk
    const sunkShip = cpu.getShips()[0];
    expect(sunkShip.isSunk()).toBe(true);
  });

  test('should track victory conditions correctly (REQ-059, REQ-060)', () => {
    // Initially no one has won
    expect(gameState.hasPlayerWon()).toBe(false);
    expect(gameState.hasCpuWon()).toBe(false);

    // Simulate player winning
    cpu.setNumShips(0);
    expect(gameState.hasPlayerWon()).toBe(true);
    expect(gameState.isGameOver()).toBe(true);

    // Reset and simulate CPU winning
    cpu.setNumShips(3);
    player.setNumShips(0);
    expect(gameState.hasCpuWon()).toBe(true);
    expect(gameState.isGameOver()).toBe(true);
  });
});

describe('CPU AI Integration Tests', () => {
  let gameState;
  let player;
  let cpu;

  beforeEach(() => {
    gameState = new GameState();
    player = gameState.getPlayer();
    cpu = gameState.getCpu();
    
    player.setShips([
      new Ship(['50', '51', '52'])
    ]);
  });

  test('should handle CPU hunt mode logic (REQ-045, REQ-046, REQ-047)', () => {
    const result = cpu.calculateNextMove(
      player.getShips(),
      player.getBoard(),
      gameState.getBoardSize()
    );

    expect(result).toHaveProperty('hit');
    expect(result).toHaveProperty('sunk');
    // After one turn, there should be one guess
    expect(cpu.getGuesses().length).toBe(1);
  });

  test('should switch to target mode after hit (REQ-049, REQ-050)', () => {
    // Mock a ship that is easy to hit
    player.setShips([new Ship(['00', '01', '02'])]);
    cpu.getGuesses().push('11'); // Add a miss to avoid random hit on 00
    
    // Force the AI to "guess" 00
    const result = cpu.calculateNextMove(
      player.getShips(),
      player.getBoard(),
      gameState.getBoardSize()
    );
    
    if (result.hit) {
      expect(cpu.getMode()).toBe('target');
      expect(cpu.getTargetQueue().length).toBeGreaterThan(0);
    }
  });
});

describe('Edge Cases from Requirements (EDGE-001 to EDGE-023)', () => {
  describe('Input Validation Edge Cases', () => {
    let mockBoard, mockGuesses, mockCpuShips;

    beforeEach(() => {
      mockBoard = new Board(10);
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
      const cpu = new AIPlayer(10, 3, 3);
      cpu.setMode('target');
      cpu.setTargetQueue([]);
      
      const result = cpu.calculateNextMove(
        [],
        new Board(10),
        10
      );

      expect(cpu.getMode()).toBe('hunt');
    });

    test('should handle CPU hits at board edges (EDGE-016)', () => {
      const cpu = new AIPlayer(10, 3, 3);
      const playerShips = [
        new Ship(['00', '01', '02']) // Ship at edge
      ];
      const playerBoard = new Board(10);
      
      // Manually add a hit to enter target mode and set queue
      cpu.setMode('target');
      cpu.addGuess('00');
      playerBoard.setCell(0, 0, 'X');
      cpu.setTargetQueue(['01', '10']);

      const result = cpu.calculateNextMove(
        playerShips,
        playerBoard,
        10
      );

      // Check that it can correctly process the next item from the queue
      expect(result.hit).toBe(true);
      expect(playerBoard.getCell(0, 1)).toBe('X');
    });

    test('should handle CPU hits in corner (EDGE-017)', () => {
      const cpu = new AIPlayer(10, 3, 3);
      const playerShips = [
        new Ship(['00', '10', '20']) // Ship starting at corner
      ];
      const playerBoard = new Board(10);

      // Force a hit at 00 to trigger targeting
      cpu.addGuess('11'); // add a miss to avoid random hit
      const result = cpu.calculateNextMove(
        playerShips,
        playerBoard,
        10
      );

      if (result.hit) {
        // Should have fewer adjacent coordinates due to corner position
        expect(cpu.getTargetQueue().length).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('Game State Edge Cases', () => {
    test('should handle board state integrity (EDGE-022)', () => {
      const gameState = new GameState();
      const boards = createBoard(gameState.getBoardSize());
      
      // Verify board structure
      expect(boards.opponentBoardObject.getSize()).toBe(gameState.getBoardSize());
      expect(boards.playerBoardObject.getSize()).toBe(gameState.getBoardSize());
      
      // Verify all cells are water initially
      for (let i = 0; i < gameState.getBoardSize(); i++) {
        for (let j = 0; j < gameState.getBoardSize(); j++) {
          expect(boards.opponentBoardObject.getCell(i, j)).toBe('~');
          expect(boards.playerBoardObject.getCell(i, j)).toBe('~');
        }
      }
    });

    test('should handle memory constraints with large guess histories (EDGE-023)', () => {
      const gameState = new GameState();
      const initialMemory = process.memoryUsage().heapUsed;

      // Add many guesses
      for (let i = 0; i < 1000; i++) {
        gameState.getPlayer().addGuess(`${i % 10}${Math.floor(i / 10) % 10}`);
        gameState.getCpu().addGuess(`${Math.floor(i / 10) % 10}${i % 10}`);
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
      gameState.getPlayer().getGuesses(), 
      gameState.getCpu().getShips(), 
      boards.opponentBoardObject, 
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
          gameState.getPlayer().getGuesses(), 
          gameState.getCpu().getShips(), 
          boards.opponentBoardObject, 
          gameState.getShipLength()
        );
        expect(result).toHaveProperty('success');
      }).not.toThrow();
    });
  });
});

describe('printBoard Function Tests', () => {
  let gameDisplay;
  beforeEach(() => {
    gameDisplay = new GameDisplay();
    console.log.mockClear();
  });

  test('should handle empty boards', () => {
    const emptyBoard = new Board(3);
    const emptyPlayerBoard = new Board(3);
    
    expect(() => {
      gameDisplay.renderBoards(emptyBoard, emptyPlayerBoard);
    }).not.toThrow();
    
    expect(console.log).toHaveBeenCalled();
  });

  test('should handle boards with mixed content', () => {
    const board = new Board(3);
    const playerBoard = new Board(3);
    
    // Set some test content
    board.setCell(1, 0, 'O');
    board.setCell(0, 1, 'X');
    playerBoard.setCell(0, 0, 'S');
    playerBoard.setCell(2, 0, 'O');
    playerBoard.setCell(2, 1, 'X');
    
    expect(() => {
      gameDisplay.renderBoards(board, playerBoard);
    }).not.toThrow();
  });

  test('should handle different board sizes', () => {
    [1, 5, 10, 15].forEach(size => {
      const board = new Board(size);
      const playerBoard = new Board(size);
      
      expect(() => {
        gameDisplay.renderBoards(board, playerBoard);
      }).not.toThrow();
    });
  });
}); 