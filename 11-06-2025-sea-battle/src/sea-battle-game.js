import { GameState } from './game-state.js';
import { GameLogic } from './game-logic.js';
import { GameDisplay } from './game-display.js';
import { InputHandler } from './input-handler.js';
import { createBoard } from './board-utils.js';

class SeaBattleGame {
  constructor() {
    this.gameState = new GameState();
    this.gameLogic = new GameLogic();
    this.display = new GameDisplay();
    this.inputHandler = new InputHandler();
  }

  async playGame() {
    try {
      this.display.showWelcome();
      await this.initializeGame();
      await this.gameLoop();
      this.endGame();
    } catch (error) {
      this.display.showMessage(`An error occurred: ${error.message}`);
      console.error('Game error:', error);
    } finally {
      this.inputHandler.close();
    }
  }

  async initializeGame() {
    const boards = createBoard(this.gameState.getBoardSize());
    this.gameState.getPlayer().setBoard(boards.playerBoardObject);
    this.gameState.getCpu().setBoard(boards.opponentBoardObject);
    
    this.gameLogic.placeShips(this.gameState.getPlayer().getBoard(), this.gameState.getPlayer().getShips(), 3, this.gameState.getBoardSize(), this.gameState.getShipLength(), this.gameState.getPlayer().getBoard());
    this.display.showMessage('Player ships placed.');
    this.gameLogic.placeShips(this.gameState.getCpu().getBoard(), this.gameState.getCpu().getShips(), 3, this.gameState.getBoardSize(), this.gameState.getShipLength());
    this.display.showMessage('CPU ships placed.');
    
    this.display.renderBoards(this.gameState.getCpu().getBoard(), this.gameState.getPlayer().getBoard());
  }

  async gameLoop() {
    while (!this.gameState.isGameOver()) {
      try {
        await this.playerTurn();
        if (this.gameState.isGameOver()) break;
        await this.cpuTurn();
      } catch (error) {
        this.display.showMessage(`Turn error: ${error.message}`);
        console.error('Turn error:', error);
      }
    }
  }

  async playerTurn() {
    try {
      let guess = await this.inputHandler.getPlayerGuess();

      const result = this.gameLogic.processHit(
          guess,
          this.gameState.getBoardSize(),
          this.gameState.getPlayer().getGuesses(),
          this.gameState.getCpu().getShips(),
          this.gameState.getCpu().getBoard(),
          this.gameState.getShipLength(),
          'player',
          this.display
      );
      
      if (result.sunk) {
          this.gameState.getCpu().decrementNumShips();
      }
      
      this.display.renderBoards(this.gameState.getCpu().getBoard(), this.gameState.getPlayer().getBoard());
    } catch (error) {
      this.display.showMessage(`Player turn error: ${error.message}`);
      throw error; // Re-throw to be handled by game loop
    }
  }

  async cpuTurn() {
    try {
      this.display.showMessage("\n--- CPU's Turn ---");
      const {
          player,
          cpu,
          boardSize
      } = this.gameState;
      
      // Simulate CPU "thinking" time with a small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = cpu.calculateNextMove(
          player.getShips(),
          player.getBoard(),
          boardSize,
          this.display
      );

      if (result.sunk) {
          player.decrementNumShips();
      }
      
      this.display.renderBoards(cpu.getBoard(), player.getBoard());
    } catch (error) {
      this.display.showMessage(`CPU turn error: ${error.message}`);
      throw error; // Re-throw to be handled by game loop
    }
  }
  
  endGame() {
    const endState = this.gameLogic.checkGameEnd(this.gameState);
    if (endState.gameOver) {
      this.display.showGameEnd(endState.message);
    }
  }
}

export { SeaBattleGame }; 