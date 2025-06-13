import { test } from 'node:test';
import assert from 'node:assert/strict';
import readline from 'node:readline';

import {
  GameConfig,
  GameState,
  GameLogic,
  Ship,
  Player,
  AIPlayer,
  createBoard,
  SeaBattleGame
} from '../seabattle.js';
import { Board } from '../src/board.js';
import { GameDisplay } from '../src/game-display.js';
import { InputHandler } from '../src/input-handler.js';

// Mock console.log to prevent output during tests
console.log = () => {};

// Mock readline for tests
const mockReadline = {
  createInterface: () => ({
    question: (query, callback) => callback('00'),
    close: () => {}
  })
};
readline.createInterface = mockReadline.createInterface;

test('GameConfig Constants', async (t) => {
  await t.test('should have correct configuration values', () => {
    assert.equal(GameConfig.BOARD_SIZE, 10);
    assert.equal(GameConfig.NUM_SHIPS, 3);
    assert.equal(GameConfig.SHIP_LENGTH, 3);
  });
});

test('Board Class', async (t) => {
  let board;

  t.beforeEach(() => {
    board = new Board(10);
  });

  await t.test('should initialize with correct size and water cells', () => {
    assert.equal(board.getSize(), 10);
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        assert.equal(board.getCell(i, j), '~');
      }
    }
  });

  await t.test('should validate coordinates correctly', () => {
    assert.equal(board.isValidCoordinate(0, 0), true);
    assert.equal(board.isValidCoordinate(9, 9), true);
    assert.equal(board.isValidCoordinate(-1, 0), false);
    assert.equal(board.isValidCoordinate(10, 0), false);
  });

  await t.test('should get and set cell values correctly', () => {
    board.setCell(5, 5, 'X');
    assert.equal(board.getCell(5, 5), 'X');
  });

  await t.test('should throw error for invalid coordinates', () => {
    assert.throws(() => board.getCell(-1, 0), { message: 'Invalid coordinate: -1,0. Must be between 0-9.' });
    assert.throws(() => board.setCell(10, 0, 'X'), { message: 'Invalid coordinate: 10,0. Must be between 0-9.' });
  });
});

test('Ship Class', async (t) => {
  let ship;

  t.beforeEach(() => {
    ship = new Ship(['00', '01', '02']);
  });

  await t.test('should initialize with correct locations and length', () => {
    assert.deepEqual(ship.getLocations(), ['00', '01', '02']);
    assert.equal(ship.getLength(), 3);
    assert.equal(ship.getHitCount(), 0);
    assert.equal(ship.isSunk(), false);
  });

  await t.test('should handle hits correctly', () => {
    assert.equal(ship.hit('00'), true);
    assert.equal(ship.getHitCount(), 1);
    assert.equal(ship.getHitStatus('00'), 'hit');
    assert.equal(ship.isSunk(), false);

    // Hit same location again
    assert.equal(ship.hit('00'), false);
    assert.equal(ship.getHitCount(), 1);

    // Hit invalid location
    assert.equal(ship.hit('99'), false);
    assert.equal(ship.getHitCount(), 1);
  });

  await t.test('should detect when ship is sunk', () => {
    ship.hit('00');
    ship.hit('01');
    ship.hit('02');
    assert.equal(ship.isSunk(), true);
  });
});

test('GameLogic Class', async (t) => {
  let gameLogic;
  let board;
  let ships;
  let display;
  let playerBoard;

  t.beforeEach(() => {
    gameLogic = new GameLogic();
    board = new Board(10);
    playerBoard = new Board(10);
    ships = [];
    display = new GameDisplay();
  });

  await t.test('should place ships without collision', () => {
    gameLogic.placeShips(board, ships, 3, 10, 3, playerBoard);
    assert.equal(ships.length, 3);
    ships.forEach(ship => {
      assert.equal(ship.getLength(), 3);
      assert.equal(ship.getLocations().length, 3);
    });
  });

  await t.test('should process hits correctly', () => {
    const ship = new Ship(['00', '01', '02']);
    ships.push(ship);
    
    const result = gameLogic.processHit('00', 10, [], ships, board, 3, 'generic', display);
    assert.equal(result.success, true);
    assert.equal(result.hit, true);
    assert.equal(board.getCell(0, 0), 'X');
  });

  await t.test('should handle misses', () => {
    const result = gameLogic.processHit('99', 10, [], [], board, 3, 'generic', display);
    assert.equal(result.success, true);
    assert.equal(result.hit, false);
    assert.equal(board.getCell(9, 9), 'O');
  });
});

test('GameState Class', async (t) => {
  let gameState;

  t.beforeEach(() => {
    gameState = new GameState();
  });

  await t.test('should initialize with correct defaults', () => {
    assert.ok(gameState.getPlayer() instanceof Player);
    assert.ok(gameState.getCpu() instanceof AIPlayer);
    assert.equal(gameState.getBoardSize(), 10);
  });

  await t.test('should track game end conditions', () => {
    assert.equal(gameState.isGameOver(), false);
    
    gameState.getCpu().setNumShips(0);
    assert.equal(gameState.hasPlayerWon(), true);
    assert.equal(gameState.isGameOver(), true);
    
    gameState.getCpu().setNumShips(3);
    gameState.getPlayer().setNumShips(0);
    assert.equal(gameState.hasCpuWon(), true);
  });
}); 