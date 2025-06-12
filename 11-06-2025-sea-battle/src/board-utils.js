import { Board } from './board.js';

// TESTABLE FUNCTION - accepts size parameter and returns boards
function createBoard(size) {
  const opponentBoard = new Board(size);
  const playerBoard = new Board(size);
  
  // Return both Board objects and raw arrays for backward compatibility
  return { 
    board: opponentBoard._getDirectBoardReference(),
    playerBoard: playerBoard._getDirectBoardReference(),
    opponentBoardObject: opponentBoard,
    playerBoardObject: playerBoard
  };
}

export { createBoard }; 