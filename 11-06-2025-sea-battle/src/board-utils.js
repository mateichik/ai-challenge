import { Board } from './board.js';

/**
 * Creates game boards for player and opponent
 * @param {number} size - The size of the board
 * @returns {Object} Board objects and references
 */
function createBoard(size) {
  const opponentBoard = new Board(size);
  const playerBoard = new Board(size);
  
  // Return both Board objects and raw arrays for backward compatibility
  return { 
    board: opponentBoard.getBoardArray(),
    playerBoard: playerBoard.getBoardArray(),
    opponentBoardObject: opponentBoard,
    playerBoardObject: playerBoard
  };
}

export { createBoard }; 