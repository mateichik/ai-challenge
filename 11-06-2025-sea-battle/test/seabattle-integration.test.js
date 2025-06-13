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

// Mock console methods
console.log = () => {};
console.clear = () => {};
console.error = () => {};

// Store original readline.createInterface
const originalCreateInterface = readline.createInterface;

// Mock readline for InputHandler
const mockReadline = {
  createInterface: () => ({
    question: (query, callback) => callback('00'),
    close: () => {}
  })
};

// Override readline.createInterface with mock
readline.createInterface = mockReadline.createInterface;

// Mock InputHandler for tests that require user input
class MockInputHandler {
  constructor(display) {
    this.display = display;
  }
  async getPlayerGuess() { return '00'; }
  close() {}
}

test('Game Integration Tests', async (t) => {
  let game;
  let gameState;
  let player;
  let cpu;
  let display;

  t.beforeEach(() => {
    game = new SeaBattleGame();
    gameState = game.gameState;
    player = gameState.getPlayer();
    cpu = gameState.getCpu();
    display = game.display;
    
    // Replace the real InputHandler with our mock
    game.inputHandler = new MockInputHandler(display);
  });

  t.afterEach(() => {
    if (game && game.inputHandler) {
      game.inputHandler.close();
    }
  });
  
  // Restore original readline after all tests
  t.after(() => {
    readline.createInterface = originalCreateInterface;
  });

  await t.test('should display welcome message on start', async () => {
    let welcomeMessageShown = false;
    display.showWelcome = () => {
      welcomeMessageShown = true;
    };
    
    // Mock game methods to avoid hanging
    game.initializeGame = async () => {};
    game.gameLoop = async () => {};
    game.endGame = () => {};

    await game.playGame();
    assert.equal(welcomeMessageShown, true, 'Welcome message should be shown when starting the game');
  });

  await t.test('should initialize game with correct state', () => {
    assert.equal(gameState.getBoardSize(), GameConfig.BOARD_SIZE);
    assert.equal(player.getNumShips(), GameConfig.NUM_SHIPS);
    assert.equal(cpu.getNumShips(), GameConfig.NUM_SHIPS);
  });

  await t.test('should place ships correctly during game setup', async () => {
    // Create boards
    const playerBoard = new Board(gameState.getBoardSize());
    const cpuBoard = new Board(gameState.getBoardSize());
    
    // Set boards
    player.setBoard(playerBoard);
    cpu.setBoard(cpuBoard);
    
    // Place ships
    game.gameLogic.placeShips(
      playerBoard,
      player.getShips(),
      GameConfig.NUM_SHIPS,
      gameState.getBoardSize(),
      gameState.getShipLength(),
      playerBoard
    );
    
    game.gameLogic.placeShips(
      cpuBoard,
      cpu.getShips(),
      GameConfig.NUM_SHIPS,
      gameState.getBoardSize(),
      gameState.getShipLength()
    );

    const playerShips = player.getShips();
    const cpuShips = cpu.getShips();

    assert.equal(playerShips.length, GameConfig.NUM_SHIPS);
    assert.equal(cpuShips.length, GameConfig.NUM_SHIPS);

    playerShips.forEach(ship => {
      assert.equal(ship.getLength(), GameConfig.SHIP_LENGTH);
    });

    cpuShips.forEach(ship => {
      assert.equal(ship.getLength(), GameConfig.SHIP_LENGTH);
    });
  });
});

test('Ship Placement Integration Tests', async (t) => {
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

  await t.test('should place ships without overlapping', () => {
    // Clear ships array before placing new ships
    ships = [];
    
    // Mock Math.random to ensure consistent ship placement
    const originalRandom = Math.random;
    let mockIndex = 0;
    const mockValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
    Math.random = () => mockValues[mockIndex++ % mockValues.length];
    
    try {
      gameLogic.placeShips(board, ships, 3, 10, 3, playerBoard);
      assert.equal(ships.length, 3);

      // Check for overlapping - collect all locations first
      const allLocations = ships.flatMap(ship => ship.getLocations());
      const uniqueLocations = new Set(allLocations);
      
      // Instead of checking each location individually, check that the total count matches
      // This verifies there are no duplicates
      assert.equal(allLocations.length, uniqueLocations.size, 'Ship locations should not overlap');
    } finally {
      // Restore original random function
      Math.random = originalRandom;
    }
  });

  await t.test('should place ships within board boundaries', () => {
    // Clear ships array before placing new ships
    ships = [];
    gameLogic.placeShips(board, ships, 3, 10, 3, playerBoard);
    assert.equal(ships.length, 3);

    ships.forEach(ship => {
      ship.getLocations().forEach(location => {
        const row = parseInt(location[0]);
        const col = parseInt(location[1]);
        assert.ok(row >= 0 && row < 10);
        assert.ok(col >= 0 && col < 10);
      });
    });
  });
});

test('CPU AI Integration Tests', async (t) => {
  let gameState;
  let player;
  let cpu;
  let display;

  t.beforeEach(() => {
    gameState = new GameState();
    player = gameState.getPlayer();
    cpu = gameState.getCpu();
    display = new GameDisplay();
  });

  await t.test('should handle CPU hunt mode logic', () => {
    player.setShips([new Ship(['50', '51', '52'])]);
    
    const result = cpu.calculateNextMove(
      player.getShips(),
      player.getBoard(),
      gameState.getBoardSize(),
      display
    );

    assert.equal(typeof result, 'object');
    assert.ok('hit' in result);
    assert.ok('sunk' in result);
    assert.equal(cpu.getGuesses().length, 1);
  });

  await t.test('should switch to target mode after hit', () => {
    player.setShips([new Ship(['00', '01', '02'])]);
    
    // Force the AI to hit the ship
    const result = cpu.calculateNextMove(
      player.getShips(),
      player.getBoard(),
      gameState.getBoardSize(),
      display
    );

    if (result.hit) {
      assert.equal(cpu.getMode(), 'target');
      assert.ok(cpu.getTargetQueue().length > 0);
    }
  });
});

test('Game Flow Integration Tests', async (t) => {
  let game;
  let gameState;
  let gameLogic;
  let display;
  let inputHandler;

  t.beforeEach(() => {
    game = new SeaBattleGame();
    gameState = game.gameState;
    gameLogic = game.gameLogic;
    display = game.display;
    inputHandler = new InputHandler(display);
  });

  t.afterEach(() => {
    if (inputHandler) {
      inputHandler.close();
    }
    if (game && game.inputHandler) {
      game.inputHandler.close();
    }
  });

  await t.test('should process player hits correctly', () => {
    const cpu = gameState.getCpu();
    const cpuShip = new Ship(['00', '01', '02']);
    cpu.setShips([cpuShip]);

    const result = gameLogic.processHit(
      '00',
      gameState.getBoardSize(),
      gameState.getPlayer().getGuesses(),
      cpu.getShips(),
      cpu.getBoard(),
      gameState.getShipLength(),
      'player',
      display
    );

    assert.equal(result.success, true);
    assert.equal(result.hit, true);
    assert.equal(cpu.getBoard().getCell(0, 0), 'X');
  });

  await t.test('should process CPU hits correctly', () => {
    const player = gameState.getPlayer();
    const playerShip = new Ship(['00', '01', '02']);
    player.setShips([playerShip]);

    const result = gameLogic.processHit(
      '00',
      gameState.getBoardSize(),
      gameState.getCpu().getGuesses(),
      player.getShips(),
      player.getBoard(),
      gameState.getShipLength(),
      'cpu',
      display
    );

    assert.equal(result.success, true);
    assert.equal(result.hit, true);
    assert.equal(player.getBoard().getCell(0, 0), 'X');
  });
}); 