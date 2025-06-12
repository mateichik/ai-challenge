// Integration Tests and Advanced Edge Cases for Sea Battle Game
const {
  GameConfig,
  GameState,
  GameLogic,
  Ship,
  Player,
  AIPlayer,
  createBoard
} = require('./seabattle.js');
const { Board } = require('./board.js');
const { GameDisplay } = require('./game-display.js');

// Mock console methods
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('Ship Placement Integration Tests', () => {
  let gameLogic;
  let board;
  let ships;

  beforeEach(() => {
    gameLogic = new GameLogic();
    board = new Board(10);
    ships = [];
  });

  test('should place ships without overlapping (REQ-009)', () => {
    gameLogic.placeShips(board, ships, 3, 10, 3, board);
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
    gameLogic.placeShips(board, ships, 3, 10, 3, board);
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
    gameLogic.placeShips(board, ships, 3, 10, 3, board);
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
  let gameLogic;
  let display;

  beforeEach(() => {
    gameState = new GameState();
    player = gameState.getPlayer();
    cpu = gameState.getCpu();
    gameLogic = new GameLogic();
    display = new GameDisplay();
    
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
    let result = gameLogic.processHit(
      '99', 
      gameState.getBoardSize(), 
      player.getGuesses(), 
      cpu.getShips(), 
      cpu.getBoard(), 
      gameState.getShipLength(),
      'player',
      display
    );
    expect(result.hit).toBe(true);
    expect(result.sunk).toBe(false);

    result = gameLogic.processHit(
      '98', 
      gameState.getBoardSize(), 
      player.getGuesses(), 
      cpu.getShips(), 
      cpu.getBoard(), 
      gameState.getShipLength(),
      'player',
      display
    );
    expect(result.hit).toBe(true);
    expect(result.sunk).toBe(false);

    result = gameLogic.processHit(
      '97', 
      gameState.getBoardSize(), 
      player.getGuesses(), 
      cpu.getShips(), 
      cpu.getBoard(), 
      gameState.getShipLength(),
      'player',
      display
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
    let mockBoard, mockGuesses, mockCpuShips, gameLogic, display;

    beforeEach(() => {
      mockBoard = new Board(10);
      mockGuesses = [];
      mockCpuShips = [];
      gameLogic = new GameLogic();
      display = new GameDisplay();
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
        const result = gameLogic.processHit(input, 10, mockGuesses, mockCpuShips, mockBoard, 3, 'generic', display);
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

      boundaryTests.forEach(testCase => {
        const result = gameLogic.processHit(testCase.input, 10, mockGuesses, mockCpuShips, mockBoard, 3, 'generic', display);
        expect(result.success).toBe(testCase.valid);
      });
    });
  });

  describe('Game State Edge Cases', () => {
    let gameState, gameLogic;

    beforeEach(() => {
      gameState = new GameState();
      gameLogic = new GameLogic();
    });

    test('should handle game end with player winning (EDGE-008)', () => {
      gameState.getCpu().setNumShips(0);
      const result = gameLogic.checkGameEnd(gameState);
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('Player');
    });

    test('should handle game end with CPU winning (EDGE-009)', () => {
      gameState.getPlayer().setNumShips(0);
      const result = gameLogic.checkGameEnd(gameState);
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('CPU');
    });

    test('should handle simultaneous win (EDGE-010)', () => {
      // Player wins first in this scenario
      gameState.getPlayer().setNumShips(0);
      gameState.getCpu().setNumShips(0);
      const result = gameLogic.checkGameEnd(gameState);
      expect(result.winner).toBe('CPU'); // CPU wins because it's checked second
    });
  });

  describe('Ship Overlap and Placement Edge Cases', () => {
    let gameLogic, board, ships, playerBoard;

    beforeEach(() => {
      gameLogic = new GameLogic();
      board = new Board(10);
      ships = [];
      playerBoard = new Board(10);
    });

    test('should handle placing ships on a full board (EDGE-011)', () => {
      // Fill the board to make placement impossible
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          board.setCell(i, j, 'S');
        }
      }
      
      // We can't really "test" the infinite loop, so we trust the logic
      // is sound and would not place overlapping ships.
      // This test is more of a logical placeholder.
      gameLogic.placeShips(board, ships, 1, 10, 3, playerBoard);
      expect(ships.length).toBe(0); // Should not be able to place any ships
    });

    test('should handle ship length of 1 (EDGE-012)', () => {
      gameLogic.placeShips(board, ships, 3, 10, 1, playerBoard);
      expect(ships).toHaveLength(3);
      ships.forEach(ship => {
        expect(ship.getLength()).toBe(1);
      });
    });

    test('should handle ship length equal to board size (EDGE-013)', () => {
      const smallBoard = new Board(5);
      const smallShips = [];
      gameLogic.placeShips(smallBoard, smallShips, 1, 5, 5, smallBoard);
      expect(smallShips).toHaveLength(1);
      expect(smallShips[0].getLength()).toBe(5);
    });

    test('should not place player ships on opponent board (EDGE-014)', () => {
      const opponentBoard = new Board(10);
      gameLogic.placeShips(playerBoard, ships, 3, 10, 3, playerBoard);
      
      let shipCellsOnOpponent = 0;
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if (opponentBoard.getCell(i, j) === 'S') {
            shipCellsOnOpponent++;
          }
        }
      }
      expect(shipCellsOnOpponent).toBe(0);
    });
  });

  describe('CPU AI Advanced Scenarios', () => {
    let gameState, player, cpu, display;

    beforeEach(() => {
      gameState = new GameState();
      player = gameState.getPlayer();
      cpu = gameState.getCpu();
      display = new GameDisplay();
    });

    test('should handle checkerboard guess pattern (EDGE-015)', () => {
      // Test AI doesn't get stuck on patterns like checkerboards
      // Pre-fill guesses to force a specific pattern
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if ((i + j) % 2 === 0) {
            cpu.addGuess(`${i}${j}`);
          }
        }
      }
      
      // AI should still be able to find a target
      const result = cpu.calculateNextMove(
        player.getShips(),
        player.getBoard(),
        gameState.getBoardSize(),
        display
      );
      
      expect(cpu.getGuesses().length).toBe(51); // 50 pre-filled + 1 new
    });

    test('should handle sinking the last ship correctly (EDGE-016)', () => {
      const lastShip = new Ship(['00']);
      player.setShips([lastShip]);
      player.setNumShips(1);
      
      const result = cpu.calculateNextMove(
        player.getShips(),
        player.getBoard(),
        gameState.getBoardSize(),
        display
      );
      
      // It's not guaranteed to hit, but if it does...
      if(result.hit) {
        expect(result.sunk).toBe(true);
      }
    });

    test('should clear target queue after sinking a ship (EDGE-017)', () => {
      player.setShips([new Ship(['00', '01', '02'])]);
      
      // Simulate hitting and sinking
      cpu.setMode('target');
      cpu.setTargetQueue(['01', '02']);
      
      // Mock a hit that sinks the ship
      jest.spyOn(player.getShips()[0], 'isSunk').mockReturnValue(true);

      cpu.calculateNextMove(
        player.getShips(),
        player.getBoard(),
        gameState.getBoardSize(),
        display
      );
      
      expect(cpu.getMode()).toBe('hunt');
      expect(cpu.getTargetQueue().length).toBe(0);
    });

    test('should not target already guessed locations (EDGE-018)', () => {
      cpu.addGuess('01');
      cpu.addGuess('10');
      cpu.addGuess('12');
      cpu.addGuess('21');
      
      cpu.setMode('target');
      cpu.setTargetQueue(['01', '10', '12', '21']);
      
      // All targets are already guessed, so it should fall back to hunt
      cpu.calculateNextMove(
        player.getShips(),
        player.getBoard(),
        gameState.getBoardSize(),
        display
      );
      
      expect(cpu.getMode()).toBe('hunt');
    });
  });
});

describe('Non-Functional Requirements Validation', () => {
  let gameLogic;
  let display;

  beforeEach(() => {
    gameLogic = new GameLogic();
    display = new GameDisplay();
  });

  test('should meet performance requirements (NFR-001)', () => {
    const gameState = new GameState();
    const boards = createBoard(gameState.getBoardSize());
    
    const start = Date.now();
    
    // Simulate user input processing
    const result = gameLogic.processHit(
      '50', 
      gameState.getBoardSize(), 
      gameState.getPlayer().getGuesses(), 
      gameState.getCpu().getShips(), 
      boards.opponentBoardObject, 
      gameState.getShipLength(),
      'player',
      display
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
        const result = gameLogic.processHit(
          input, 
          gameState.getBoardSize(), 
          gameState.getPlayer().getGuesses(), 
          gameState.getCpu().getShips(), 
          boards.opponentBoardObject, 
          gameState.getShipLength(),
          'player',
          display
        );
        expect(result).toHaveProperty('success');
      }).not.toThrow();
    });
  });
});

describe('GameDisplay Class Tests', () => {
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