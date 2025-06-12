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
    this.display.showWelcome();
    const boards = createBoard(this.gameState.getBoardSize());
    this.gameState.getPlayer().setBoard(boards.playerBoardObject);
    this.gameState.getCpu().setBoard(boards.opponentBoardObject);
    
    this.gameLogic.placeShips(this.gameState.getPlayer().getBoard(), this.gameState.getPlayer().getShips(), 3, this.gameState.getBoardSize(), this.gameState.getShipLength(), this.gameState.getPlayer().getBoard());
    this.display.showMessage('Player ships placed.');
    this.gameLogic.placeShips(this.gameState.getCpu().getBoard(), this.gameState.getCpu().getShips(), 3, this.gameState.getBoardSize(), this.gameState.getShipLength());
    this.display.showMessage('CPU ships placed.');
    
    this.display.renderBoards(this.gameState.getCpu().getBoard(), this.gameState.getPlayer().getBoard());

    while (!this.gameState.isGameOver()) {
      await this.playerTurn();
      if (this.gameState.isGameOver()) break;
      this.cpuTurn();
    }
    
    this.endGame();
    this.inputHandler.close();
  }

  async playerTurn() {
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
  }

  cpuTurn() {
    this.display.showMessage("\n--- CPU's Turn ---");
    const {
        player,
        cpu,
        boardSize
    } = this.gameState;
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
  }
  
  endGame() {
    const endState = this.gameLogic.checkGameEnd(this.gameState);
    if (endState.gameOver) {
      this.display.showGameEnd(endState.message);
    }
  }
}

export { SeaBattleGame }; 