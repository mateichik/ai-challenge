import readline from 'node:readline';

class InputHandler {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async getPlayerGuess() {
    try {
      const guess = await this.promptForInput("Enter your guess (e.g., '00', '34', '98'): ");
      
      // Basic input validation here - more detailed validation happens in GameLogic
      if (!guess || typeof guess !== 'string') {
        console.error('Invalid input received');
        // Retry if input is completely invalid
        return this.getPlayerGuess();
      }
      
      return guess;
    } catch (error) {
      console.error('Error getting player input:', error);
      throw error;
    }
  }

  async promptForInput(prompt) {
    return new Promise((resolve, reject) => {
      try {
        this.rl.question(prompt, (answer) => {
          resolve(answer);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  close() {
    try {
      this.rl.close();
    } catch (error) {
      console.error('Error closing readline interface:', error);
    }
  }
}

export { InputHandler }; 