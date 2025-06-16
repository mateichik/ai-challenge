const readline = require('readline');

/**
 * Create a readline interface
 * @returns {Object} Readline interface
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask a question to the user
 * @param {Object} rl Readline interface
 * @param {string} question Question to ask
 * @returns {Promise<string>} Promise with user's answer
 */
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Determine input type based on user's answer
 * @param {string} input User input
 * @returns {'SERVICE_NAME' | 'SERVICE_DESCRIPTION'} InputType
 */
function determineInputType(input) {
  // Check if the input is longer than 50 characters or contains multiple sentences
  if (input.length > 50 || input.match(/[.!?]+\s/g)) {
    return 'SERVICE_DESCRIPTION';
  }
  
  return 'SERVICE_NAME';
}

module.exports = {
  createReadlineInterface,
  askQuestion,
  determineInputType
}; 