import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/game-state.js';
import { Player } from '../src/player.js';
import { AIPlayer } from '../src/ai-player.js';
import { Ship } from '../src/ship.js';
import { Board } from '../src/board.js';
import { MockDisplay } from './input-validation.test.js';

test('Game End Condition Tests', async (t) => {
  let gameState;
  let player;
  let cpu;
  let display;
  
  t.beforeEach(() => {
    gameState = new GameState();
    player = gameState.getPlayer();
    cpu = gameState.getCpu();
    display = new MockDisplay();
    
    // Setup boards
    const playerBoard = new Board(10);
    const cpuBoard = new Board(10);
    player.setBoard(playerBoard);
    cpu.setBoard(cpuBoard);
    
    // Setup ships
    player.setShips([
      new Ship(['00', '01', '02']),
      new Ship(['20', '21', '22']),
      new Ship(['40', '41', '42'])
    ]);
    
    cpu.setShips([
      new Ship(['00', '01', '02']),
      new Ship(['20', '21', '22']),
      new Ship(['40', '41', '42'])
    ]);
  });
  
  // REQ-059: Player wins when all CPU ships are sunk
  await t.test('should detect player victory when all CPU ships are sunk', () => {
    // Initially game should not be over
    assert.equal(gameState.isGameOver(), false);
    assert.equal(gameState.hasPlayerWon(), false);
    
    // Sink all CPU ships
    cpu.setNumShips(0);
    
    // Verify player victory is detected
    assert.equal(gameState.hasPlayerWon(), true);
    assert.equal(gameState.isGameOver(), true);
  });
  
  // REQ-060: CPU wins when all player ships are sunk
  await t.test('should detect CPU victory when all player ships are sunk', () => {
    // Initially game should not be over
    assert.equal(gameState.isGameOver(), false);
    assert.equal(gameState.hasCpuWon(), false);
    
    // Sink all player ships
    player.setNumShips(0);
    
    // Verify CPU victory is detected
    assert.equal(gameState.hasCpuWon(), true);
    assert.equal(gameState.isGameOver(), true);
  });
  
  // REQ-061: Game ends immediately when victory condition is met
  await t.test('should end game immediately when victory condition is met', () => {
    // Sink all CPU ships
    cpu.setNumShips(0);
    
    // Verify game is over
    assert.equal(gameState.isGameOver(), true);
    
    // Sink all player ships
    player.setNumShips(0);
    
    // Verify game is still over (first victory condition should have ended game)
    assert.equal(gameState.isGameOver(), true);
  });
  
  // REQ-041: A ship is considered sunk when all segments are hit
  await t.test('should detect when a ship is completely sunk', () => {
    const ship = new Ship(['00', '01', '02']);
    
    // Initially ship should not be sunk
    assert.equal(ship.isSunk(), false);
    
    // Hit first segment
    ship.hit('00');
    assert.equal(ship.isSunk(), false);
    
    // Hit second segment
    ship.hit('01');
    assert.equal(ship.isSunk(), false);
    
    // Hit third segment
    ship.hit('02');
    
    // Verify ship is now sunk
    assert.equal(ship.isSunk(), true);
  });
  
  // REQ-044: System tracks remaining ship count for both players
  await t.test('should track remaining ship count for both players', () => {
    // Initially both players have 3 ships
    assert.equal(player.getNumShips(), 3);
    assert.equal(cpu.getNumShips(), 3);
    
    // Sink one player ship
    player.decrementNumShips();
    assert.equal(player.getNumShips(), 2);
    
    // Sink one CPU ship
    cpu.decrementNumShips();
    assert.equal(cpu.getNumShips(), 2);
    
    // Sink all remaining player ships
    player.decrementNumShips();
    player.decrementNumShips();
    assert.equal(player.getNumShips(), 0);
    
    // Verify CPU victory
    assert.equal(gameState.hasCpuWon(), true);
  });
  
  // EDGE-021: Game end detection failure
  await t.test('should always correctly detect game end', () => {
    // Test various ship counts
    for (let playerShips = 0; playerShips <= 3; playerShips++) {
      for (let cpuShips = 0; cpuShips <= 3; cpuShips++) {
        player.setNumShips(playerShips);
        cpu.setNumShips(cpuShips);
        
        if (playerShips === 0 || cpuShips === 0) {
          assert.equal(gameState.isGameOver(), true, 
            `Game should be over when player has ${playerShips} ships and CPU has ${cpuShips} ships`);
        } else {
          assert.equal(gameState.isGameOver(), false, 
            `Game should not be over when player has ${playerShips} ships and CPU has ${cpuShips} ships`);
        }
      }
    }
  });
});

// Run the tests 