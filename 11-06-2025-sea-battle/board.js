class Board {
  #boardArray;
  #size;

  constructor(size) {
    this.#size = size;
    this.#boardArray = this.#initializeBoard();
  }

  // Private method to initialize the board array
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

  // Get the value of a specific cell
  getCell(row, col) {
    if (!this.isValidCoordinate(row, col)) {
      throw new Error(`Invalid coordinates: ${row}, ${col}`);
    }
    return this.#boardArray[row][col];
  }

  // Set the value of a specific cell
  setCell(row, col, value) {
    if (!this.isValidCoordinate(row, col)) {
      throw new Error(`Invalid coordinates: ${row}, ${col}`);
    }
    this.#boardArray[row][col] = value;
  }

  // Check if coordinates are valid for this board
  isValidCoordinate(row, col) {
    return row >= 0 && row < this.#size && col >= 0 && col < this.#size;
  }

  // Get the board size
  getSize() {
    return this.#size;
  }

  // Get a copy of the entire board array (for backward compatibility)
  getBoardArray() {
    return this.#boardArray.map(row => [...row]);
  }

  // Get direct reference to board array (for performance - use carefully)
  _getDirectBoardReference() {
    return this.#boardArray;
  }

  // Clear the board (reset all cells to water)
  clear() {
    for (let i = 0; i < this.#size; i++) {
      for (let j = 0; j < this.#size; j++) {
        this.#boardArray[i][j] = '~';
      }
    }
  }

  // Render method for board display logic
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

  // Render two boards side by side (for game display)
  static renderSideBySide(opponentBoard, playerBoard) {
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

  static isValidAndNewGuess(row, col, guessList, boardSize) {
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
      return false;
    }
    const guessStr = `${row}${col}`;
    return !guessList.includes(guessStr);
  }
}

export { Board }; 