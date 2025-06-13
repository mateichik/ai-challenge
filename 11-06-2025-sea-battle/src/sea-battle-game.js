import { GameState } from './game-state.js';
import { GameLogic } from './game-logic.js';
import { GameDisplay } from './game-display.js';
import { InputHandler } from './input-handler.js';
import { ErrorHandler } from './error-handler.js';
import { ErrorBoundary } from './error-boundary.js';
import { createBoard } from './board-utils.js';
import { performanceMonitor } from './performance-monitor.js';

/**
 * The main class that orchestrates the Sea Battle game.
 * It initializes all game components, manages the game loop, and handles turns.
 */
class SeaBattleGame {
  /**
   * Initializes all game components, including state, logic, display, and handlers.
   * Also caches frequently accessed properties for performance.
   * @param {GameDisplay} display - The display handler for rendering output.
   * @param {InputHandler} inputHandler - The handler for user input.
   */
  constructor(display, inputHandler) {
    // Initialize components
    this.gameState = new GameState();
    this.gameLogic = new GameLogic();
    this.display = display || new GameDisplay();
    this.inputHandler = inputHandler || new InputHandler(this.display);
    this.errorHandler = new ErrorHandler(this.display);
    this.errorBoundary = new ErrorBoundary(this.display);
    
    // Cache frequently accessed properties
    this._boardSize = this.gameState.getBoardSize();
    this._shipLength = this.gameState.getShipLength();
    this._player = this.gameState.getPlayer();
    this._cpu = this.gameState.getCpu();
    
    // Apply performance monitoring to critical methods
    if (process.env.ENABLE_PERFORMANCE_MONITORING === 'true') {
      this.playGame = performanceMonitor.monitor(this.playGame.bind(this), 'SeaBattleGame.playGame');
      this.gameLoop = performanceMonitor.monitor(this.gameLoop.bind(this), 'SeaBattleGame.gameLoop');
      this.playerTurn = performanceMonitor.monitor(this.playerTurn.bind(this), 'SeaBattleGame.playerTurn');
      this.cpuTurn = performanceMonitor.monitor(this.cpuTurn.bind(this), 'SeaBattleGame.cpuTurn');
    }
  }

  /**
   * Starts and manages the entire game from start to finish.
   * It handles initialization, the main game loop, and the end game sequence.
   * @async
   */
  async playGame() {
    const endTimer = performanceMonitor.startTimer('gameSession');
    try {
      await this.initializeGame();
      await this.gameLoop();
      this.endGame();
    } catch (error) {
      this.errorHandler.handleError(error, 'GameMain');
    } finally {
      this.inputHandler.close();
      endTimer();
      
      // Print performance metrics at the end if enabled
      if (process.env.ENABLE_PERFORMANCE_MONITORING === 'true') {
        performanceMonitor.printMetrics();
      }
    }
  }

  /**
   * Sets up the initial state of the game.
   * This includes creating the boards and placing ships for both the player and the CPU.
   * @async
   */
  async initializeGame() {
    const endTimer = performanceMonitor.startTimer('gameInitialization');
    
    console.log('Boards created.');
    // Create boards
    const boards = createBoard(this._boardSize);
    this._player.setBoard(boards.playerBoardObject);
    this._cpu.setBoard(boards.opponentBoardObject);
    
    // Place ships - cache local references to avoid property lookups
    const playerBoard = this._player.getBoard();
    const playerShips = this._player.getShips();
    const cpuBoard = this._cpu.getBoard();
    const cpuShips = this._cpu.getShips();
    
    this.gameLogic.placeShips(playerBoard, playerShips, 3, this._boardSize, this._shipLength, playerBoard);
    this.display.showMessage('3 ships placed randomly for Player.');
    this.gameLogic.placeShips(cpuBoard, cpuShips, 3, this._boardSize, this._shipLength);
    this.display.showMessage('3 ships placed randomly for CPU.');

    this.display.showWelcome(this.gameState.getCpu().getNumShips());
    
    // Use error boundary for UI rendering
    this.errorBoundary.renderSafely(() => {
      this.display.renderBoards(cpuBoard, playerBoard);
    });
    
    endTimer();
  }

  /**
   * The main loop of the game that continues until a winner is determined.
   * It alternates between the player's turn and the CPU's turn.
   * @async
   */
  async gameLoop() {
    // Avoid accessing this.gameState.isGameOver() in the loop condition
    // as it causes property lookups on every iteration
    let gameOver = false;
    
    while (!gameOver) {
      try {
        await this.playerTurn();
        gameOver = this.gameState.isGameOver();
        if (gameOver) break;
        
        await this.cpuTurn();
        gameOver = this.gameState.isGameOver();
      } catch (error) {
        this.errorHandler.handleError(error, 'GameLoop');
      }
    }
  }

  /**
   * Manages the player's turn, including getting input and processing the guess.
   * @async
   */
  async playerTurn() {
    const endTimer = performanceMonitor.startTimer('playerTurn');
    try {
      // Get player guess
      let guess = await this.inputHandler.getPlayerGuess();

      // Cache local references to avoid repeated property lookups
      const player = this._player;
      const cpu = this._cpu;
      const playerGuesses = player.getGuesses();
      const cpuShips = cpu.getShips();
      const cpuBoard = cpu.getBoard();

      // Process the hit
      const result = this.gameLogic.processHit(
          guess,
          this._boardSize,
          playerGuesses,
          cpuShips,
          cpuBoard,
          this._shipLength,
          'player',
          this.display
      );
      
      if (result.sunk) {
          cpu.decrementNumShips();
      }
      
      // Use error boundary for UI rendering
      this.errorBoundary.renderSafely(() => {
        this.display.renderBoards(cpuBoard, player.getBoard());
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'PlayerTurn');
    } finally {
      endTimer();
    }
  }

  /**
   * Manages the CPU's turn, including calculating its move and processing the result.
   * @async
   */
  async cpuTurn() {
    const endTimer = performanceMonitor.startTimer('cpuTurn');
    try {
      this.display.showMessage("\n--- CPU's Turn ---");
      
      // Cache local references
      const player = this._player;
      const cpu = this._cpu;
      
      // Simulate CPU "thinking" time with a small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Calculate CPU's next move
      const result = cpu.calculateNextMove(
          player.getShips(),
          player.getBoard(),
          this._boardSize,
          this.display
      );

      if (result.sunk) {
          player.decrementNumShips();
      }
      
      // Use error boundary for UI rendering
      this.errorBoundary.renderSafely(() => {
        this.display.renderBoards(cpu.getBoard(), player.getBoard());
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'CpuTurn');
    } finally {
      endTimer();
    }
  }
  
  /**
   * Handles the end of the game, determining the winner and displaying the final message.
   */
  endGame() {
    try {
      const endState = this.gameLogic.checkGameEnd(this.gameState);
      if (endState.gameOver) {
        this.display.showGameEnd(endState.message);
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'EndGame');
    }
  }
}

export { SeaBattleGame }; 