/**
 * Board Class - Represents a game board
 * Manages the 2D grid and provides methods for cell manipulation
 */
import { validateNumberRange, validateCoordinate } from './validation.js';
import { InvalidCoordinateError } from './game-errors.js';

class Board {
  #boardArray;
  #size;
  #renderCache;
  #lastRenderKey;

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
    this.#renderCache = new Map();
    this.#lastRenderKey = '';
  }

  /**
   * Initializes the board with water cells
   * @returns {Array} 2D array representing the board
   * @private
   */
  #initializeBoard() {
    // Optimize array creation for large boards
    const board = Array(this.#size);
    for (let i = 0; i < this.#size; i++) {
      board[i] = Array(this.#size).fill('~');
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
    // Fast path for common case - avoid validation overhead when possible
    if (row >= 0 && row < this.#size && col >= 0 && col < this.#size) {
      return this.#boardArray[row][col];
    }
    throw new InvalidCoordinateError(`${row},${col}`, this.#size);
  }

  /**
   * Sets the value of a specific cell
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {string} value - New cell value
   * @throws {InvalidCoordinateError} If coordinates are invalid
   */
  setCell(row, col, value) {
    if (row >= 0 && row < this.#size && col >= 0 && col < this.#size) {
      this.#boardArray[row][col] = value;
      // Invalidate render cache when board changes
      this.#renderCache.clear();
      return;
    }
    throw new InvalidCoordinateError(`${row},${col}`, this.#size);
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
    // Invalidate render cache when board changes
    this.#renderCache.clear();
  }

  /**
   * Renders the board as a string
   * @param {string} title - Title to display above the board
   * @param {boolean} showShips - Whether to show ships or hide them
   * @returns {string} String representation of the board
   */
  render(title = 'BOARD', showShips = false) {
    // Create cache key
    const cacheKey = `${title}-${showShips}-${this.#boardArrayHash()}`;
    
    // Return cached render if available
    if (this.#renderCache.has(cacheKey)) {
      this.#lastRenderKey = cacheKey;
      return this.#renderCache.get(cacheKey);
    }
    
    // For large boards, use string concatenation instead of template literals
    // for better performance
    let output = '\n   --- ' + title + ' ---\n';
    
    // Pre-allocate header
    let header = '  ';
    for (let h = 0; h < this.#size; h++) {
      header += h + ' ';
    }
    output += header + '\n';

    // Board rows - use string builder approach for large boards
    const boardArray = this.#boardArray;
    for (let i = 0; i < this.#size; i++) {
      let rowStr = i + ' ';
      for (let j = 0; j < this.#size; j++) {
        let cellValue = boardArray[i][j];
        // Hide ships if showShips is false
        if (!showShips && cellValue === 'S') {
          cellValue = '~';
        }
        rowStr += cellValue + ' ';
      }
      output += rowStr + '\n';
    }
    
    // Cache the rendered output
    if (this.#renderCache.size > 10) {
      // Limit cache size to prevent memory leaks
      if (this.#lastRenderKey) {
        this.#renderCache.delete(this.#lastRenderKey);
      }
    }
    this.#renderCache.set(cacheKey, output);
    this.#lastRenderKey = cacheKey;
    
    return output;
  }

  /**
   * Creates a simple hash of the board array for cache invalidation
   * @returns {string} Simple hash of the board state
   * @private
   */
  #boardArrayHash() {
    // Simple hash function - count occurrences of each cell type
    const counts = { '~': 0, 'S': 0, 'X': 0, 'O': 0 };
    
    for (let i = 0; i < this.#size; i++) {
      for (let j = 0; j < this.#size; j++) {
        const cell = this.#boardArray[i][j];
        counts[cell] = (counts[cell] || 0) + 1;
      }
    }
    
    return `${counts['~']}-${counts['S']}-${counts['X']}-${counts['O']}`;
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
    
    // Create cache key based on both boards' state
    const cacheKey = `sideBySide-${opponentBoard.#boardArrayHash()}-${playerBoard.#boardArrayHash()}`;
    
    // Check if we have a cached version (static cache)
    if (Board.renderCache && Board.renderCache.has(cacheKey)) {
      return Board.renderCache.get(cacheKey);
    }
    
    const size = opponentBoard.getSize();
    let output = '\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---\n';
    
    // Pre-allocate header
    let header = '  ';
    for (let h = 0; h < size; h++) header += h + ' ';
    output += header + '     ' + header + '\n';

    // Get direct board references for performance
    const opponentBoardArray = opponentBoard._getDirectBoardReference();
    const playerBoardArray = playerBoard._getDirectBoardReference();

    // Board rows - use string builder approach
    const rows = [];
    for (let i = 0; i < size; i++) {
      let rowStr = i + ' ';

      // Opponent board (hide ships)
      for (let j = 0; j < size; j++) {
        let cellValue = opponentBoardArray[i][j];
        if (cellValue === 'S') cellValue = '~'; // Hide opponent ships
        rowStr += cellValue + ' ';
      }
      
      rowStr += '    ' + i + ' ';

      // Player board (show ships)
      for (let j = 0; j < size; j++) {
        rowStr += playerBoardArray[i][j] + ' ';
      }
      
      rows.push(rowStr);
    }
    
    output += rows.join('\n') + '\n';
    
    // Initialize static cache if needed
    if (!Board.renderCache) {
      Board.renderCache = new Map();
    }
    
    // Limit cache size
    if (Board.renderCache.size > 20) {
      // Clear cache if it gets too big
      Board.renderCache.clear();
    }
    
    // Cache the result
    Board.renderCache.set(cacheKey, output);
    
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
      // Fast path for common case
      if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
        if (Array.isArray(guessList)) {
          const guessStr = `${row}${col}`;
          return !guessList.includes(guessStr);
        }
        throw new TypeError('guessList must be an array');
      }
      
      validateCoordinate(row, col, boardSize);
      return false; // This line won't be reached if validation passes
    } catch (error) {
      if (error instanceof InvalidCoordinateError) {
        return false;
      }
      throw error;
    }
  }
}

// Static cache for rendered boards
Board.renderCache = new Map();

export { Board }; 