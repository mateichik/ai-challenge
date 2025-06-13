/**
 * Custom error classes for Sea Battle game
 */

/**
 * Base class for all game-related errors
 */
export class GameError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for invalid coordinates
 */
export class InvalidCoordinateError extends GameError {
  constructor(coordinate, boardSize) {
    super(`Invalid coordinate: ${coordinate}. Must be between 0-${boardSize - 1}.`);
    this.coordinate = coordinate;
    this.boardSize = boardSize;
  }
}

/**
 * Error for duplicate guesses
 */
export class DuplicateGuessError extends GameError {
  constructor(coordinate) {
    super(`Coordinate ${coordinate} has already been guessed.`);
    this.coordinate = coordinate;
  }
}

/**
 * Error for invalid ship placement
 */
export class InvalidShipPlacementError extends GameError {
  constructor(message) {
    super(message || 'Invalid ship placement.');
  }
}

/**
 * Error for invalid input format
 */
export class InputFormatError extends GameError {
  constructor(input, expectedFormat) {
    super(`Invalid input format: ${input}. Expected format: ${expectedFormat}`);
    this.input = input;
    this.expectedFormat = expectedFormat;
  }
} 