import { test } from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { SeaBattleGame } from '../src/sea-battle-game.js';

test('Game Flow Integration Test', async (t) => {
  let mockDisplay, mockInputHandler, game;

  t.beforeEach(() => {
    // Create and inject mock dependencies
    mockDisplay = {
      showWelcome: sinon.stub(),
      showMessage: sinon.stub(),
      renderBoards: sinon.stub(),
      showGameEnd: sinon.stub(),
      showError: sinon.stub(),
    };
    mockInputHandler = {
      getPlayerGuess: sinon.stub().resolves('00'),
      close: sinon.stub(),
    };
    game = new SeaBattleGame(mockDisplay, mockInputHandler);
    
    // Stub console.log to prevent test noise
    sinon.stub(console, 'log');
  });

  t.afterEach(() => {
    sinon.restore();
  });

  await t.test('playGame should run the full game flow correctly', async () => {
    // We can "win" the game by making the CPU run out of ships
    sinon.stub(game.gameState.getCpu(), 'getNumShips').returns(0);

    // Act
    await game.playGame();

    // Assert
    // Check if the main methods were called
    assert.ok(mockDisplay.showWelcome.calledOnce, 'showWelcome should be called');
    assert.ok(game.inputHandler.close.calledOnce, 'inputHandler.close should be called');
    assert.ok(mockDisplay.showGameEnd.calledOnce, 'showGameEnd should be called');
  });
  
  await t.test('playGame should call gameLoop', async () => {
    // To test the loop, we'll have it run once and then end the game
    const gameLoopStub = sinon.stub(game, 'gameLoop').callsFake(async () => {
      // Fake the game ending after one loop
      sinon.stub(game.gameState, 'isGameOver').returns(true);
    });

    // Act
    await game.playGame();

    // Assert
    assert.ok(gameLoopStub.calledOnce, 'gameLoop should be called at least once');
  });
}); 