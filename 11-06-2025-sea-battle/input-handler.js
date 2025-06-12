const readline = require('readline');

class InputHandler {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async getPlayerGuess() {
    return new Promise(resolve => {
      this.rl.question("Enter your guess (e.g., '00', '34', '98'): ", resolve);
    });
  }

  close() {
    this.rl.close();
  }
}

module.exports = { InputHandler }; 