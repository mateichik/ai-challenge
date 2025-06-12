const { Board } = require('./board.js');

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

  showWelcome() {
    this.showMessage('*** Welcome to Sea Battle! ***');
  }

  showGameEnd(message) {
    this.showMessage(message);
  }
}

module.exports = { GameDisplay }; 