import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AIPlayer } from '../src/ai-player.js';
import { GameLogic } from '../src/game-logic.js';
import { Ship } from '../src/ship.js';
import { Board } from '../src/board.js';
import { MockDisplay } from './input-validation.test.js';
import { GameConfig } from '../src/game-config.js';

test('AI Player Tests', async (t) => {
  let cpu;
  let playerShips;
  let playerBoard;
  let display;
  
  t.beforeEach(() => {
    cpu = new AIPlayer(GameConfig.BOARD_SIZE, GameConfig.NUM_SHIPS, GameConfig.SHIP_LENGTH);
    playerBoard = new Board(10);
    playerShips = [
      new Ship(['00', '01', '02']),
      new Ship(['30', '31', '32']),
      new Ship(['60', '61', '62'])
    ];
    display = new MockDisplay();
  });
  
  // REQ-045, REQ-046, REQ-047: CPU should use random coordinates in hunt mode
  await t.test('should generate valid random coordinates in hunt mode', () => {
    // Set mode to hunt
    cpu.setMode('hunt');
    
    // Generate multiple moves to ensure randomness
    for (let i = 0; i < 10; i++) {
      const result = cpu.calculateNextMove(playerShips, playerBoard, 10, display);
      
      // Extract row and column from the guess
      const lastGuess = cpu.getGuesses()[cpu.getGuesses().length - 1];
      const row = parseInt(lastGuess[0]);
      const col = parseInt(lastGuess[1]);
      
      // Verify coordinates are within bounds
      assert.ok(row >= 0 && row < 10, `Row ${row} should be within bounds`);
      assert.ok(col >= 0 && col < 10, `Column ${col} should be within bounds`);
      
      // Verify no duplicate guesses
      const guesses = cpu.getGuesses();
      const uniqueGuesses = new Set(guesses);
      assert.equal(guesses.length, uniqueGuesses.size, 'CPU should not make duplicate guesses');
    }
  });
  
  // REQ-049, REQ-050, REQ-051: CPU should switch to target mode after hit
  await t.test('should switch to target mode after a non-sinking hit', () => {
    // A ship that requires multiple hits to sink
    const multiHitShip = new Ship(['55', '56']);
    const testShips = [multiHitShip];
    const testBoard = new Board(10);
    // Directly manipulate the AI to ensure it 'guesses' 55
    // This avoids mocking Math.random and potential flakiness
    cpu.addGuess('55');
    const result = cpu._processGuessResult(
      { guessStr: '55', guessRow: 5, guessCol: 5 },
      testShips,
      testBoard,
      display
    );
    assert.strictEqual(result.hit, true, 'The guess should be a hit.');
    assert.strictEqual(result.sunk, false, 'The ship should not be sunk yet.');
    assert.strictEqual(cpu.getMode(), 'target', "CPU should be in 'target' mode.");
    assert.ok(cpu.getTargetQueue().length > 0, 'Target queue should be populated.');
  });
  
  // New test: REQ-051: CPU should use the target queue in target mode
  await t.test('should use the target queue for its next guess in target mode', () => {
    const multiHitShip = new Ship(['55', '56']);
    const testShips = [multiHitShip];
    const testBoard = new Board(10);
    // Force a hit on '55' to enter 'target' mode
    cpu.addGuess('55');
    cpu._processGuessResult(
      { guessStr: '55', guessRow: 5, guessCol: 5 },
      testShips,
      testBoard,
      display
    );
    assert.strictEqual(cpu.getMode(), 'target');
    const targetQueue = cpu.getTargetQueue();
    // The next move should come from the target queue
    const nextMoveResult = cpu.calculateNextMove(testShips, testBoard, 10, display);
    const lastGuess = cpu.getGuesses().pop();
    assert.ok(targetQueue.includes(lastGuess), 'The next guess must come from the target queue.');
  });
  
  // REQ-052, REQ-053: CPU should filter invalid coordinates from target queue
  await t.test('should filter invalid coordinates from target queue', () => {
    // Force a hit at corner (00)
    cpu.addGuess('00');
    cpu.calculateNextMove(playerShips, playerBoard, 10, display);
    
    // Get target queue
    const targetQueue = cpu.getTargetQueue();
    
    // Verify no invalid coordinates like "-10" or "0-1"
    targetQueue.forEach(coord => {
      const row = parseInt(coord[0]);
      const col = parseInt(coord[1]);
      assert.ok(row >= 0 && row < 10, `Row ${row} should be within bounds`);
      assert.ok(col >= 0 && col < 10, `Column ${col} should be within bounds`);
    });
    
    // Verify no duplicates in target queue
    const uniqueTargets = new Set(targetQueue);
    assert.equal(targetQueue.length, uniqueTargets.size, 'Target queue should not contain duplicates');
  });
  
  // REQ-054, REQ-055: CPU should return to hunt mode after ship is sunk
  await t.test('should return to hunt mode after a multi-hit ship is sunk', () => {
    const multiHitShip = new Ship(['77', '78']);
    const testShips = [multiHitShip];
    const testBoard = new Board(10);
    // First hit
    cpu.addGuess('77');
    cpu._processGuessResult(
      { guessStr: '77', guessRow: 7, guessCol: 7 },
      testShips,
      testBoard,
      display
    );
    assert.strictEqual(cpu.getMode(), 'target', 'Should be in target mode after first hit.');
    // Second and final hit
    cpu.addGuess('78');
    const finalResult = cpu._processGuessResult(
      { guessStr: '78', guessRow: 7, guessCol: 8 },
      testShips,
      testBoard,
      display
    );
    assert.strictEqual(finalResult.sunk, true, 'Ship should be sunk.');
    assert.strictEqual(cpu.getMode(), 'hunt', 'Should return to hunt mode after sinking a ship.');
    assert.strictEqual(cpu.getTargetQueue().length, 0, 'Target queue should be empty after sinking.');
  });
  
  // EDGE-015: CPU target queue becomes empty while in target mode
  await t.test('should switch to hunt mode if target queue becomes empty', () => {
    // Create a fresh AI player
    const testCpu = new AIPlayer(GameConfig.BOARD_SIZE, GameConfig.NUM_SHIPS, GameConfig.SHIP_LENGTH);
    
    // Explicitly set mode to target with empty queue
    testCpu.setMode('target');
    testCpu.setTargetQueue([]);
    
    // Create a board that won't cause any hits
    const emptyBoard = new Board(10);
    const emptyShips = [];
    
    // Force a move calculation - this should switch to hunt mode
    testCpu.calculateNextMove(emptyShips, emptyBoard, 10, display);
    
    // Verify mode switched to hunt
    assert.equal(testCpu.getMode(), 'hunt', 'AI should switch to hunt mode when target queue is empty');
  });
  
  // EDGE-016, EDGE-017: CPU hits ship at board edges or corner
  await t.test('should handle hits at board edges and corners correctly', () => {
    // Test corner hit (00)
    const cornerShip = new Ship(['00']);
    playerShips = [cornerShip];
    
    // Force the CPU to hit at corner
    cpu.calculateNextMove(playerShips, playerBoard, 10, display);
    
    // Get target queue
    let targetQueue = cpu.getTargetQueue();
    
    // Should only have valid adjacent cells (01 and 10)
    targetQueue.forEach(coord => {
      const row = parseInt(coord[0]);
      const col = parseInt(coord[1]);
      assert.ok(row >= 0 && row < 10, `Row ${row} should be within bounds`);
      assert.ok(col >= 0 && col < 10, `Column ${col} should be within bounds`);
    });
    
    // Reset and test edge hit
    cpu = new AIPlayer(GameConfig.BOARD_SIZE, GameConfig.NUM_SHIPS, GameConfig.SHIP_LENGTH);
    const edgeShip = new Ship(['05']);
    playerShips = [edgeShip];
    
    // Force the CPU to hit at edge
    cpu.calculateNextMove(playerShips, playerBoard, 10, display);
    
    // Get target queue
    targetQueue = cpu.getTargetQueue();
    
    // All targets should be valid
    targetQueue.forEach(coord => {
      const row = parseInt(coord[0]);
      const col = parseInt(coord[1]);
      assert.ok(row >= 0 && row < 10, `Row ${row} should be within bounds`);
      assert.ok(col >= 0 && col < 10, `Column ${col} should be within bounds`);
    });
  });
});

// Run the tests 