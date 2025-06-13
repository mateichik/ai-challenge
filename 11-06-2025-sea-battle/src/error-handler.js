/**
 * Centralized error handling for Sea Battle game
 */
import { GameError } from './game-errors.js';

/**
 * Handles game errors and provides appropriate responses
 */
export class ErrorHandler {
  /**
   * Creates a new ErrorHandler instance
   * @param {Object} display - Display instance for showing error messages
   */
  constructor(display) {
    this.display = display;
  }

  /**
   * Handles an error by logging it and displaying appropriate message
   * @param {Error} error - The error to handle
   * @param {string} context - Context where the error occurred
   * @returns {Object} - Result object with success: false and error message
   */
  handleError(error, context = '') {
    const contextPrefix = context ? `[${context}] ` : '';
    
    // Handle different error types
    if (error instanceof GameError) {
      // Game-specific errors
      console.error(`${contextPrefix}Game Error: ${error.message}`);
      if (this.display) {
        this.display.showError(error.message);
      }
    } else if (error instanceof TypeError || error instanceof RangeError) {
      // Standard JS errors for type/range validation
      console.error(`${contextPrefix}Validation Error: ${error.message}`);
      if (this.display) {
        this.display.showError(`Invalid input: ${error.message}`);
      }
    } else {
      // Unexpected errors
      console.error(`${contextPrefix}Unexpected Error: ${error.message}`);
      console.error(error.stack);
      if (this.display) {
        this.display.showError('An unexpected error occurred. Please try again.');
      }
    }

    // Return standardized error result
    return {
      success: false,
      error: error.message
    };
  }

  /**
   * Wraps a function with error handling
   * @param {Function} fn - Function to wrap
   * @param {string} context - Context for error messages
   * @returns {Function} - Wrapped function with error handling
   */
  wrapWithErrorHandling(fn, context) {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        return this.handleError(error, context);
      }
    };
  }

  /**
   * Creates an async function wrapper with error handling
   * @param {Function} asyncFn - Async function to wrap
   * @param {string} context - Context for error messages
   * @returns {Function} - Wrapped async function with error handling
   */
  wrapAsyncWithErrorHandling(asyncFn, context) {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        return this.handleError(error, context);
      }
    };
  }
} 