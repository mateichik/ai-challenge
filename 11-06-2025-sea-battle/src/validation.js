/**
 * Validation utilities for Sea Battle game
 */
import { InvalidCoordinateError, InputFormatError } from './game-errors.js';

/**
 * Validates that a value is a number and within specified range
 * @param {number} value - The value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} paramName - Name of parameter for error message
 * @throws {TypeError} If value is not a number
 * @throws {RangeError} If value is outside allowed range
 */
export function validateNumberRange(value, min, max, paramName) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new TypeError(`${paramName} must be a number, got ${typeof value}`);
  }
  if (value < min || value > max) {
    throw new RangeError(`${paramName} must be between ${min} and ${max}, got ${value}`);
  }
}

/**
 * Validates that a value is defined and not null
 * @param {*} value - The value to validate
 * @param {string} paramName - Name of parameter for error message
 * @throws {TypeError} If value is undefined or null
 */
export function validateRequired(value, paramName) {
  if (value === undefined || value === null) {
    throw new TypeError(`${paramName} is required, got ${value}`);
  }
}

/**
 * Validates that a value is an array
 * @param {*} value - The value to validate
 * @param {string} paramName - Name of parameter for error message
 * @throws {TypeError} If value is not an array
 */
export function validateArray(value, paramName) {
  if (!Array.isArray(value)) {
    throw new TypeError(`${paramName} must be an array, got ${typeof value}`);
  }
}

/**
 * Validates a board coordinate
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @param {number} boardSize - Size of the board
 * @throws {InvalidCoordinateError} If coordinate is invalid
 */
export function validateCoordinate(row, col, boardSize) {
  if (typeof row !== 'number' || typeof col !== 'number' ||
      isNaN(row) || isNaN(col) ||
      row < 0 || row >= boardSize || 
      col < 0 || col >= boardSize) {
    throw new InvalidCoordinateError(`${row},${col}`, boardSize);
  }
}

/**
 * Validates user input format
 * @param {string} input - User input to validate
 * @param {RegExp} format - Regular expression to validate against
 * @param {string} expectedFormatDescription - Description of expected format
 * @throws {InputFormatError} If input format is invalid
 */
export function validateInputFormat(input, format, expectedFormatDescription) {
  if (!format.test(input)) {
    throw new InputFormatError(input, expectedFormatDescription);
  }
} 