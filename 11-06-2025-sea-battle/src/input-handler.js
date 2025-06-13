/**
 * Input handler with comprehensive validation and graceful degradation
 */
import readline from 'node:readline';
import { validateInputFormat, validateRequired } from './validation.js';
import { InputFormatError } from './game-errors.js';
import { ErrorHandler } from './error-handler.js';

class InputHandler {
  /**
   * Creates a new InputHandler instance
   * @param {Object} display - Display instance for showing messages
   */
  constructor(display) {
    validateRequired(display, 'display');
    
    this.display = display;
    this.errorHandler = new ErrorHandler(display);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.maxRetries = 3;
  }

  /**
   * Gets a validated player guess
   * @returns {Promise<string>} - Validated coordinate string (e.g., '23')
   */
  async getPlayerGuess() {
    return this._getInputWithRetries(
      'Enter your guess (e.g., 00): ',
      this._validateGuessInput.bind(this),
      'Two digits (row, column)',
      'Default coordinates (0,0) will be used'
    );
  }

  /**
   * Gets input with retry mechanism and graceful degradation
   * @param {string} prompt - Prompt to display
   * @param {Function} validationFn - Validation function
   * @param {string} formatDescription - Description of expected format
   * @param {string} fallbackMessage - Message to display when using fallback
   * @param {*} fallbackValue - Value to use as fallback
   * @returns {Promise<*>} - Validated input or fallback value
   * @private
   */
  async _getInputWithRetries(prompt, validationFn, formatDescription, fallbackMessage, fallbackValue = '00') {
    let retries = 0;
    
    while (retries < this.maxRetries) {
      try {
        const input = await this._promptUser(prompt);
        return validationFn(input);
      } catch (error) {
        retries++;
        this.errorHandler.handleError(error, 'InputHandler');
        
        if (retries < this.maxRetries) {
          this.display.showMessage(`Please try again. ${this.maxRetries - retries} attempts remaining.`);
        }
      }
    }
    
    // Graceful degradation - use fallback value
    this.display.showMessage(`Maximum retry attempts reached. ${fallbackMessage}.`);
    return fallbackValue;
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
    validateInputFormat(
      cleanInput, 
      /^\d{2}$/, 
      'Two digits (row, column)'
    );

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