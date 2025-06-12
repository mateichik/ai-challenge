import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameConfig, GameLogic, Ship } from '../seabattle.js';
import { Board } from '../src/board.js';

test('Board Configuration Tests', async (t) => {
  let board;
  
  t.beforeEach(() => {
    board = new Board(GameConfig.BOARD_SIZE);
  });
  
  // REQ-001: Game uses a 10x10 grid board
  await t.test('should use a 10x10 grid board', () => {
    assert.equal(GameConfig.BOARD_SIZE, 10);
    assert.equal(board.getSize(), 10);
  });
  
  // REQ-002, REQ-003: Rows and columns are numbered 0-9
  await t.test('should have rows and columns numbered 0-9', () => {
    // Check all valid coordinates
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        assert.equal(board.isValidCoordinate(row, col), true);
      }
    }
    
    // Check invalid coordinates
    assert.equal(board.isValidCoordinate(-1, 0), false);
    assert.equal(board.isValidCoordinate(0, -1), false);
    assert.equal(board.isValidCoordinate(10, 0), false);
    assert.equal(board.isValidCoordinate(0, 10), false);
  });
  
  // REQ-004: Each cell is initialized as water
  await t.test('should initialize all cells as water', () => {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        assert.equal(board.getCell(row, col), '~');
      }
    }
  });
  
  // REQ-005: System maintains two separate boards
  await t.test('should maintain separate boards for player and CPU', () => {
    const playerBoard = new Board(10);
    const cpuBoard = new Board(10);
    
    // Modify player board
    playerBoard.setCell(0, 0, 'X');
    
    // CPU board should remain unchanged
    assert.equal(cpuBoard.getCell(0, 0), '~');
    
    // Modify CPU board
    cpuBoard.setCell(1, 1, 'O');
    
    // Player board should not be affected by CPU board changes
    assert.equal(playerBoard.getCell(1, 1), '~');
  });
});

test('Ship Configuration Tests', async (t) => {
  let gameLogic;
  let board;
  let ships;
  let playerBoard;
  
  t.beforeEach(() => {
    gameLogic = new GameLogic();
    board = new Board(10);
    playerBoard = new Board(10);
    ships = [];
  });
  
  // REQ-006: Each player has exactly 3 ships
  await t.test('should place exactly 3 ships', () => {
    gameLogic.placeShips(board, ships, GameConfig.NUM_SHIPS, GameConfig.BOARD_SIZE, GameConfig.SHIP_LENGTH, playerBoard);
    assert.equal(ships.length, 3);
  });
  
  // REQ-007: Each ship is exactly 3 cells in length
  await t.test('should create ships with exactly 3 cells length', () => {
    gameLogic.placeShips(board, ships, GameConfig.NUM_SHIPS, GameConfig.BOARD_SIZE, GameConfig.SHIP_LENGTH, playerBoard);
    
    ships.forEach(ship => {
      assert.equal(ship.getLength(), 3);
      assert.equal(ship.getLocations().length, 3);
    });
  });
  
  // REQ-008: Ships are placed horizontally or vertically
  await t.test('should place ships horizontally or vertically', () => {
    gameLogic.placeShips(board, ships, GameConfig.NUM_SHIPS, GameConfig.BOARD_SIZE, GameConfig.SHIP_LENGTH, playerBoard);
    
    ships.forEach(ship => {
      const locations = ship.getLocations();
      
      // Extract rows and columns
      const rows = locations.map(loc => parseInt(loc[0]));
      const cols = locations.map(loc => parseInt(loc[1]));
      
      // Check if ship is placed horizontally (same row, sequential columns)
      const isHorizontal = rows.every(row => row === rows[0]) && 
        (cols[1] === cols[0] + 1) && (cols[2] === cols[1] + 1);
      
      // Check if ship is placed vertically (same column, sequential rows)
      const isVertical = cols.every(col => col === cols[0]) && 
        (rows[1] === rows[0] + 1) && (rows[2] === rows[1] + 1);
      
      assert.ok(isHorizontal || isVertical, 'Ship should be placed horizontally or vertically');
    });
  });
  
  // REQ-009: Ships do not overlap
  await t.test('should place ships without overlap', () => {
    gameLogic.placeShips(board, ships, GameConfig.NUM_SHIPS, GameConfig.BOARD_SIZE, GameConfig.SHIP_LENGTH, playerBoard);
    
    // Collect all ship locations
    const allLocations = ships.flatMap(ship => ship.getLocations());
    const uniqueLocations = new Set(allLocations);
    
    // If there are no overlaps, the count of unique locations should match total locations
    assert.equal(allLocations.length, uniqueLocations.size, 'Ships should not overlap');
  });
  
  // REQ-010: Ships do not extend beyond board boundaries
  await t.test('should place ships within board boundaries', () => {
    gameLogic.placeShips(board, ships, GameConfig.NUM_SHIPS, GameConfig.BOARD_SIZE, GameConfig.SHIP_LENGTH, playerBoard);
    
    ships.forEach(ship => {
      ship.getLocations().forEach(location => {
        const row = parseInt(location[0]);
        const col = parseInt(location[1]);
        
        assert.ok(row >= 0 && row < 10, `Row ${row} should be within board boundaries`);
        assert.ok(col >= 0 && col < 10, `Column ${col} should be within board boundaries`);
      });
    });
  });
  
  // REQ-016: Player ships are visible on player's board
  await t.test('should mark player ships as visible on player board', () => {
    gameLogic.placeShips(board, ships, GameConfig.NUM_SHIPS, GameConfig.BOARD_SIZE, GameConfig.SHIP_LENGTH, board);
    
    // Check that ship locations are marked with 'S'
    ships.forEach(ship => {
      ship.getLocations().forEach(location => {
        const row = parseInt(location[0]);
        const col = parseInt(location[1]);
        assert.equal(board.getCell(row, col), 'S', 'Player ships should be marked with S');
      });
    });
  });
  
  // EDGE-011: Ship placement at board edges
  await t.test('should handle ship placement at board edges', () => {
    // Force placement of ships at edges by mocking random generator
    let mockIndex = 0;
    const edgeCoordinates = [
      [0, 0], // Top-left corner
      [0, 7], // Top edge
      [7, 0], // Left edge
      [9, 7], // Bottom edge
      [7, 9]  // Right edge
    ];
    
    // Mock the random number generator to return edge coordinates
    const originalRandom = Math.random;
    Math.random = () => {
      const result = mockIndex / 10;
      mockIndex = (mockIndex + 1) % 10;
      return result;
    };
    
    try {
      // Place ships
      gameLogic.placeShips(board, ships, GameConfig.NUM_SHIPS, GameConfig.BOARD_SIZE, GameConfig.SHIP_LENGTH, playerBoard);
      
      // Verify all ships are within boundaries
      ships.forEach(ship => {
        ship.getLocations().forEach(location => {
          const row = parseInt(location[0]);
          const col = parseInt(location[1]);
          
          assert.ok(row >= 0 && row < 10, `Row ${row} should be within board boundaries`);
          assert.ok(col >= 0 && col < 10, `Column ${col} should be within board boundaries`);
        });
      });
    } finally {
      // Restore original random function
      Math.random = originalRandom;
    }
  });
});

// Run the tests 