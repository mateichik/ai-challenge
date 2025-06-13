import { test } from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { SeaBattleGame } from '../src/sea-battle-game.js';
import { GameConfig } from '../src/game-config.js';

test('Game Startup Test', async (t) => {
  let mockDisplay, mockInputHandler, game;

  t.beforeEach(() => {
    // Create mocks for our dependencies. These are "fake" objects that we control.
    mockDisplay = {
      showWelcome: sinon.stub(),
      showMessage: sinon.stub(),
      renderBoards: sinon.stub(),
      showError: sinon.stub(),
    };
    mockInputHandler = {
      getPlayerGuess: sinon.stub().resolves('00'),
      close: sinon.stub(),
    };

    // Inject the mocks into the game instance.
    game = new SeaBattleGame(mockDisplay, mockInputHandler);
    
    // Stub methods we don't want to run
    sinon.stub(console, 'log');
  });

  t.afterEach(() => {
    // Restore all stubs and mocks
    sinon.restore();
  });

  await t.test('should display startup messages in the correct order', async () => {
    // Act
    await game.initializeGame();

    // Assert
    const showMessage = mockDisplay.showMessage;
    assert.strictEqual(console.log.callCount, 1, '"Boards created." should be logged');
    assert.ok(console.log.calledWith('Boards created.'), '"Boards created." message is incorrect');

    assert.strictEqual(showMessage.callCount, 2, 'Should show two ship placement messages');
    assert.ok(showMessage.calledWith('3 ships placed randomly for Player.'), 'Player ship message missing');
    assert.ok(showMessage.calledWith('3 ships placed randomly for CPU.'), 'CPU ship message missing');
    
    assert.ok(mockDisplay.showWelcome.calledOnce, 'showWelcome should be called');
    assert.ok(mockDisplay.showWelcome.calledWith(GameConfig.NUM_SHIPS), 'showWelcome called with wrong ship count');
    
    assert.ok(mockDisplay.renderBoards.calledOnce, 'Boards should be rendered');
    
    // Verify the order
    sinon.assert.callOrder(
      console.log, // "Boards created"
      mockDisplay.showMessage.withArgs('3 ships placed randomly for Player.'),
      mockDisplay.showMessage.withArgs('3 ships placed randomly for CPU.'),
      mockDisplay.showWelcome,
      mockDisplay.renderBoards
    );
  });
}); 