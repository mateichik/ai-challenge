import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameLogic, Ship } from '../seabattle.js';
import { GameDisplay } from '../src/game-display.js';
import { Board } from '../src/board.js';

// Mock GameDisplay to capture messages
class MockDisplay {
  constructor() {
    this.messages = [];
  }
  
  showMessage(message) {
    this.messages.push(message);
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
    let result = gameLogic.processHit('', 10, guesses, ships, board, 3, 'player', display);
    assert.equal(result.success, false);
    assert.ok(display.getLastMessage().includes('exactly two digits'));
    
    // Test single character input
    display.clearMessages();
    result = gameLogic.processHit('1', 10, guesses, ships, board, 3, 'player', display);
    assert.equal(result.success, false);
    assert.ok(display.getLastMessage().includes('exactly two digits'));
    
    // Test too long input
    display.clearMessages();
    result = gameLogic.processHit('123', 10, guesses, ships, board, 3, 'player', display);
    assert.equal(result.success, false);
    assert.ok(display.getLastMessage().includes('exactly two digits'));
  });
  
  // REQ-067, REQ-069: Both characters must be numeric digits
  await t.test('should reject non-numeric input', () => {
    // Test non-numeric characters
    let result = gameLogic.processHit('ab', 10, guesses, ships, board, 3, 'player', display);
    assert.equal(result.success, false);
    assert.ok(display.getLastMessage().includes('valid row and column numbers'));
    
    // Test mixed characters
    display.clearMessages();
    result = gameLogic.processHit('a1', 10, guesses, ships, board, 3, 'player', display);
    assert.equal(result.success, false);
    assert.ok(display.getLastMessage().includes('valid row and column numbers'));
    
    // Test special characters
    display.clearMessages();
    result = gameLogic.processHit('!@', 10, guesses, ships, board, 3, 'player', display);
    assert.equal(result.success, false);
    assert.ok(display.getLastMessage().includes('valid row and column numbers'));
  });
  
  // REQ-071, REQ-072, REQ-073: Coordinates must be within valid range
  await t.test('should reject coordinates outside valid range', () => {
    // Test out of bounds row
    let result = gameLogic.processHit('A0', 10, guesses, ships, board, 3, 'player', display);
    assert.equal(result.success, false);
    
    // Test out of bounds column
    display.clearMessages();
    result = gameLogic.processHit('0A', 10, guesses, ships, board, 3, 'player', display);
    assert.equal(result.success, false);
    
    // Test both out of bounds
    display.clearMessages();
    result = gameLogic.processHit('AA', 10, guesses, ships, board, 3, 'player', display);
    assert.equal(result.success, false);
  });
  
  // REQ-074, REQ-075: System should maintain history and prevent duplicate guesses
  await t.test('should prevent duplicate guesses', () => {
    // First guess should succeed
    guesses.push('00');
    let result = gameLogic.processHit('00', 10, guesses, ships, board, 3, 'player', display);
    assert.equal(result.success, false);
    assert.ok(display.getLastMessage().includes('already guessed'));
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
    const result = gameLogic.processHit('00', 10, guesses, ships, board, 3, 'player', display);
    assert.equal(result.success, false);
    assert.ok(display.getLastMessage().includes('already guessed'));
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