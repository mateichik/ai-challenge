/**
 * Board Class - Represents a game board
 * Manages the 2D grid and provides methods for cell manipulation
 */
import { validateNumberRange, validateCoordinate } from './validation.js';
import { InvalidCoordinateError } from './game-errors.js';

class Board {
  #boardArray;
  #size;

  /**
   * Creates a new game board
   * @param {number} size - Size of the board (creates a size x size grid)
   * @throws {TypeError} If size is not a number
   * @throws {RangeError} If size is out of valid range
   */
  constructor(size) {
    validateNumberRange(size, 5, 20, 'board size');
    this.#size = size;
    this.#boardArray = this.#initializeBoard();
  }

  /**
   * Initializes the board with water cells
   * @returns {Array} 2D array representing the board
   * @private
   */
  #initializeBoard() {
    const board = [];
    for (let i = 0; i < this.#size; i++) {
      board[i] = [];
      for (let j = 0; j < this.#size; j++) {
        board[i][j] = '~';
      }
    }
    return board;
  }

  /**
   * Gets the value of a specific cell
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {string} Cell value
   * @throws {InvalidCoordinateError} If coordinates are invalid
   */
  getCell(row, col) {
    if (!this.isValidCoordinate(row, col)) {
      throw new InvalidCoordinateError(`${row},${col}`, this.#size);
    }
    return this.#boardArray[row][col];
  }

  /**
   * Sets the value of a specific cell
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {string} value - New cell value
   * @throws {InvalidCoordinateError} If coordinates are invalid
   */
  setCell(row, col, value) {
    if (!this.isValidCoordinate(row, col)) {
      throw new InvalidCoordinateError(`${row},${col}`, this.#size);
    }
    this.#boardArray[row][col] = value;
  }

  /**
   * Checks if coordinates are valid for this board
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {boolean} True if coordinates are valid
   */
  isValidCoordinate(row, col) {
    return row >= 0 && row < this.#size && col >= 0 && col < this.#size;
  }

  /**
   * Gets the board size
   * @returns {number} Board size
   */
  getSize() {
    return this.#size;
  }

  /**
   * Gets a copy of the entire board array
   * @returns {Array} Copy of the board array
   */
  getBoardArray() {
    return this.#boardArray.map(row => [...row]);
  }

  /**
   * Gets direct reference to board array (for performance - use carefully)
   * @returns {Array} Direct reference to board array
   * @deprecated Use getBoardArray() instead
   */
  _getDirectBoardReference() {
    return this.#boardArray;
  }

  /**
   * Clears the board (resets all cells to water)
   */
  clear() {
    for (let i = 0; i < this.#size; i++) {
      for (let j = 0; j < this.#size; j++) {
        this.#boardArray[i][j] = '~';
      }
    }
  }

  /**
   * Renders the board as a string
   * @param {string} title - Title to display above the board
   * @param {boolean} showShips - Whether to show ships or hide them
   * @returns {string} String representation of the board
   */
  render(title = 'BOARD', showShips = false) {
    let output = `\n   --- ${title} ---\n`;
    
    // Header with column numbers
    let header = '  ';
    for (let h = 0; h < this.#size; h++) {
      header += `${h} `;
    }
    output += `${header}\n`;

    // Board rows
    for (let i = 0; i < this.#size; i++) {
      let rowStr = `${i} `;
      for (let j = 0; j < this.#size; j++) {
        let cellValue = this.#boardArray[i][j];
        // Hide ships if showShips is false
        if (!showShips && cellValue === 'S') {
          cellValue = '~';
        }
        rowStr += `${cellValue} `;
      }
      output += `${rowStr}\n`;
    }
    
    return output;
  }

  /**
   * Renders two boards side by side
   * @param {Board} opponentBoard - Opponent's board
   * @param {Board} playerBoard - Player's board
   * @returns {string} String representation of both boards
   * @throws {TypeError} If boards are invalid
   * @static
   */
  static renderSideBySide(opponentBoard, playerBoard) {
    if (!opponentBoard || !playerBoard) {
      throw new TypeError('Both boards must be provided');
    }
    
    const size = opponentBoard.getSize();
    let output = '\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---\n';
    
    // Header
    let header = '  ';
    for (let h = 0; h < size; h++) header += `${h} `;
    output += `${header}     ${header}\n`;

    // Board rows
    for (let i = 0; i < size; i++) {
      let rowStr = `${i} `;

      // Opponent board (hide ships)
      for (let j = 0; j < size; j++) {
        let cellValue = opponentBoard.getCell(i, j);
        if (cellValue === 'S') cellValue = '~'; // Hide opponent ships
        rowStr += `${cellValue} `;
      }
      
      rowStr += `    ${i} `;

      // Player board (show ships)
      for (let j = 0; j < size; j++) {
        rowStr += `${playerBoard.getCell(i, j)} `;
      }
      
      output += `${rowStr}\n`;
    }
    
    return output;
  }

  /**
   * Checks if a guess is valid and new
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {Array} guessList - List of previous guesses
   * @param {number} boardSize - Size of the board
   * @returns {boolean} True if the guess is valid and new
   * @throws {InvalidCoordinateError} If coordinates are invalid
   * @throws {TypeError} If guessList is not an array
   * @static
   */
  static isValidAndNewGuess(row, col, guessList, boardSize) {
    try {
      validateCoordinate(row, col, boardSize);
      
      if (!Array.isArray(guessList)) {
        throw new TypeError('guessList must be an array');
      }
      
      const guessStr = `${row}${col}`;
      return !guessList.includes(guessStr);
    } catch (error) {
      if (error instanceof InvalidCoordinateError) {
        return false;
      }
      throw error;
    }
  }
}

export { Board }; 