import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameLogic } from '../src/game-logic.js';
import { Ship } from '../src/ship.js';
import { GameDisplay } from '../src/game-display.js';
import { Board } from '../src/board.js';
import { InvalidCoordinateError, DuplicateGuessError } from '../src/game-errors.js';

// Mock GameDisplay to capture messages
class MockDisplay {
  constructor() {
    this.messages = [];
  }
  
  showMessage(message) {
    this.messages.push(message);
  }
  
  showError(message) {
    this.messages.push(`ERROR: ${message}`);
  }
  
  getLastMessage() {
    return this.messages[this.messages.length - 1];
  }
  
  clearMessages() {
    this.messages = [];
  }
}

test('Input Validation Tests', async (t) => {
  let gameLogic;
  let board;
  let ships;
  let guesses;
  let display;
  
  t.beforeEach(() => {
    gameLogic = new GameLogic();
    board = new Board(10);
    ships = [];
    guesses = [];
    display = new MockDisplay();
  });
  
  // REQ-066, REQ-070: Input must be exactly 2 characters long
  await t.test('should reject input that is not exactly 2 characters long', () => {
    // Test empty input
    try {
      gameLogic.processHit('', 10, guesses, ships, board, 3, 'player', display);
      assert.fail('Should have thrown InvalidCoordinateError');
    } catch (error) {
      assert.ok(error instanceof InvalidCoordinateError);
    }
    
    // Test single character input
    try {
      gameLogic.processHit('1', 10, guesses, ships, board, 3, 'player', display);
      assert.fail('Should have thrown InvalidCoordinateError');
    } catch (error) {
      assert.ok(error instanceof InvalidCoordinateError);
    }
    
    // Test too long input
    try {
      gameLogic.processHit('123', 10, guesses, ships, board, 3, 'player', display);
      assert.fail('Should have thrown InvalidCoordinateError');
    } catch (error) {
      assert.ok(error instanceof InvalidCoordinateError);
    }
  });
  
  // REQ-067, REQ-069: Both characters must be numeric digits
  await t.test('should reject non-numeric input', () => {
    // Test non-numeric characters
    try {
      gameLogic.processHit('ab', 10, guesses, ships, board, 3, 'player', display);
      assert.fail('Should have thrown InvalidCoordinateError');
    } catch (error) {
      assert.ok(error instanceof InvalidCoordinateError);
    }
    
    // Test mixed characters
    try {
      gameLogic.processHit('a1', 10, guesses, ships, board, 3, 'player', display);
      assert.fail('Should have thrown InvalidCoordinateError');
    } catch (error) {
      assert.ok(error instanceof InvalidCoordinateError);
    }
    
    // Test special characters
    try {
      gameLogic.processHit('!@', 10, guesses, ships, board, 3, 'player', display);
      assert.fail('Should have thrown InvalidCoordinateError');
    } catch (error) {
      assert.ok(error instanceof InvalidCoordinateError);
    }
  });
  
  // REQ-071, REQ-072, REQ-073: Coordinates must be within valid range
  await t.test('should reject coordinates outside valid range', () => {
    // Test out of bounds row
    try {
      gameLogic.processHit('A0', 10, guesses, ships, board, 3, 'player', display);
      assert.fail('Should have thrown InvalidCoordinateError');
    } catch (error) {
      assert.ok(error instanceof InvalidCoordinateError);
    }
    
    // Test out of bounds column
    try {
      gameLogic.processHit('0A', 10, guesses, ships, board, 3, 'player', display);
      assert.fail('Should have thrown InvalidCoordinateError');
    } catch (error) {
      assert.ok(error instanceof InvalidCoordinateError);
    }
    
    // Test both out of bounds
    try {
      gameLogic.processHit('AA', 10, guesses, ships, board, 3, 'player', display);
      assert.fail('Should have thrown InvalidCoordinateError');
    } catch (error) {
      assert.ok(error instanceof InvalidCoordinateError);
    }
  });
  
  // REQ-074, REQ-075: System should maintain history and prevent duplicate guesses
  await t.test('should prevent duplicate guesses', () => {
    // First guess should succeed
    guesses.push('00');
    try {
      gameLogic.processHit('00', 10, guesses, ships, board, 3, 'player', display);
      assert.fail('Should have thrown DuplicateGuessError');
    } catch (error) {
      assert.ok(error instanceof DuplicateGuessError);
    }
  });
});

test('Edge Case Tests', async (t) => {
  let gameLogic;
  let board;
  let ships;
  let guesses;
  let display;
  
  t.beforeEach(() => {
    gameLogic = new GameLogic();
    board = new Board(10);
    ships = [];
    guesses = [];
    display = new MockDisplay();
  });
  
  // EDGE-008: Player repeats previous guess
  await t.test('should handle repeated guesses gracefully', () => {
    guesses.push('00');
    try {
      gameLogic.processHit('00', 10, guesses, ships, board, 3, 'player', display);
      assert.fail('Should have thrown DuplicateGuessError');
    } catch (error) {
      assert.ok(error instanceof DuplicateGuessError);
    }
  });
  
  // EDGE-009: Player hits same ship segment twice
  await t.test('should handle hitting same ship segment twice', () => {
    const ship = new Ship(['00', '01', '02']);
    ships.push(ship);
    
    // First hit should succeed
    let result = gameLogic.processHit('00', 10, guesses, ships, board, 3, 'player', display);
    assert.equal(result.success, true);
    assert.equal(result.hit, true);
    
    // Remove the guess to simulate trying again
    guesses.pop();
    
    // Second hit on same location should indicate already hit
    display.clearMessages();
    result = gameLogic.processHit('00', 10, guesses, ships, board, 3, 'player', display);
    assert.equal(result.success, true);
    assert.equal(result.hit, true);
    assert.ok(display.getLastMessage().includes('already hit'));
  });
});

// Run the tests
export { MockDisplay }; 