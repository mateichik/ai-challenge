/**
 * Error boundary for UI operations
 * Provides a way to catch errors in UI components and display fallback UI
 */
import { GameError } from './game-errors.js';

export class ErrorBoundary {
  /**
   * Creates a new ErrorBoundary instance
   * @param {Object} display - Display instance for showing error messages
   * @param {Function} fallbackFn - Function to call when an error occurs
   */
  constructor(display, fallbackFn = null) {
    this.display = display;
    this.fallbackFn = fallbackFn || this._defaultFallback;
    this.hasError = false;
    this.error = null;
  }

  /**
   * Wraps a UI operation with error handling
   * @param {Function} uiOperation - UI operation function to wrap
   * @param {Array} args - Arguments to pass to the UI operation
   * @returns {*} - Result of UI operation or fallback UI
   */
  renderSafely(uiOperation, ...args) {
    try {
      this.hasError = false;
      this.error = null;
      return uiOperation(...args);
    } catch (error) {
      this.hasError = true;
      this.error = error;
      this._logError(error);
      return this.fallbackFn(error);
    }
  }

  /**
   * Wraps an async UI operation with error handling
   * @param {Function} asyncUiOperation - Async UI operation function to wrap
   * @param {Array} args - Arguments to pass to the UI operation
   * @returns {Promise<*>} - Result of UI operation or fallback UI
   */
  async renderSafelyAsync(asyncUiOperation, ...args) {
    try {
      this.hasError = false;
      this.error = null;
      return await asyncUiOperation(...args);
    } catch (error) {
      this.hasError = true;
      this.error = error;
      this._logError(error);
      return this.fallbackFn(error);
    }
  }

  /**
   * Logs error to console and display
   * @param {Error} error - Error to log
   * @private
   */
  _logError(error) {
    console.error('UI Error:', error);
    
    if (this.display) {
      if (error instanceof GameError) {
        this.display.showError(`Game error: ${error.message}`);
      } else {
        this.display.showError('An error occurred in the UI. Please try again.');
      }
    }
  }

  /**
   * Default fallback function
   * @param {Error} error - Error that occurred
   * @returns {string} - Fallback message
   * @private
   */
  _defaultFallback(error) {
    return '[Error rendering UI component]';
  }

  /**
   * Resets error state
   */
  reset() {
    this.hasError = false;
    this.error = null;
  }
} 