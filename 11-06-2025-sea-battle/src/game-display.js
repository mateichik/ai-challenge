import { Board } from './board.js';

class GameDisplay {
  renderBoards(opponentBoard, playerBoard) {
    console.log(Board.renderSideBySide(opponentBoard, playerBoard));
  }

  showMessage(message) {
    console.log(message);
  }

  showError(message) {
    console.error(message);
  }

  showWelcome(numShips) {
    this.showMessage("\nLet's play Sea Battle!");
    this.showMessage('Try to sink the ' + numShips + ' enemy ships.');
  }

  showGameEnd(message) {
    this.showMessage(message);
  }
}

export { GameDisplay }; 