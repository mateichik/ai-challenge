/**
 * Input handler with comprehensive validation and graceful degradation
 */
import readline from 'node:readline';
import { validateInputFormat, validateRequired } from './validation.js';
import { InputFormatError } from './game-errors.js';

class InputHandler {
  /**
   * Creates a new InputHandler instance
   * @param {Object} display - Display instance for showing messages
   * @param {Object} game - Reference to the game instance for rendering boards
   */
  constructor(display, game = null) {
    validateRequired(display, 'display');
    
    this.display = display;
    this.game = game;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Sets the game reference after initialization
   * @param {Object} game - Reference to the game instance
   */
  setGame(game) {
    this.game = game;
  }

  /**
   * Gets a validated player guess
   * @returns {Promise<string>} - Validated coordinate string (e.g., '23')
   * @throws {InputFormatError} - If input format is invalid
   */
  async getPlayerGuess() {
    while (true) {
      try {
        const input = await this._promptUser('Enter your guess (e.g., 00): ');
        return this._validateGuessInput(input);
      } catch (error) {
        // Use the exact error message from the original codebase
        console.log('Oops, input must be exactly two digits (e.g., 00, 34, 98).');
        
        // Re-render boards after error message but before next prompt
        if (this.game) {
          this.game.renderBoards();
        }
        
        // Continue the loop to prompt again - no retry limit
      }
    }
  }

  /**
   * Prompts the user for input
   * @param {string} prompt - The prompt to display
   * @returns {Promise<string>} - User input
   * @private
   */
  async _promptUser(prompt) {
    return new Promise((resolve, reject) => {
      try {
        this.rl.question(prompt, (answer) => {
          resolve(answer.trim());
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Validates guess input format
   * @param {string} input - User input to validate
   * @returns {string} - Validated input
   * @throws {InputFormatError} - If input format is invalid
   * @private
   */
  _validateGuessInput(input) {
    // Validate input is not empty
    if (!input) {
      throw new InputFormatError('', 'Two digits (row, column)');
    }

    // Remove any spaces or commas
    const cleanInput = input.replace(/[\s,]/g, '');
    
    // Validate input format (two digits)
    if (!/^\d{2}$/.test(cleanInput)) {
      throw new InputFormatError(cleanInput, 'Two digits (row, column)');
    }

    return cleanInput;
  }

  /**
   * Closes the readline interface
   */
  close() {
    if (this.rl) {
      this.rl.close();
    }
  }
}

export { InputHandler }; 