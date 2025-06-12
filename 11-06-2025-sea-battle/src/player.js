import { Board } from './board.js';

// Player Management Class
class Player {
  constructor(boardSize, numShips, shipLength) {
    this.ships = [];
    this.board = new Board(boardSize);
    this.guesses = [];
    this.numShips = numShips;
    this.shipLength = shipLength;
  }

  getShips() { return this.ships; }
  setShips(ships) { this.ships = ships; }
  addShip(ship) { this.ships.push(ship); }

  getBoard() { return this.board; }
  setBoard(board) { this.board = board; }

  getGuesses() { return this.guesses; }
  setGuesses(guesses) { this.guesses = guesses; }
  addGuess(guess) { this.guesses.push(guess); }

  getNumShips() { return this.numShips; }
  setNumShips(count) { this.numShips = count; }
  decrementNumShips() { this.numShips--; }

  getShipLength() { return this.shipLength; }
  setShipLength(length) { this.shipLength = length; }
}

export { Player }; 