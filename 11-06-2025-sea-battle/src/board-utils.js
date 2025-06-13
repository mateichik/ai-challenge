import { Board } from './board.js';

/**
 * Creates game boards for player and opponent
 * @param {number} size - The size of the board
 * @returns {Object} Board objects
 */
function createBoard(size) {
  const opponentBoard = new Board(size);
  const playerBoard = new Board(size);
  
  return { 
    opponentBoardObject: opponentBoard,
    playerBoardObject: playerBoard
  };
}

export { createBoard }; 