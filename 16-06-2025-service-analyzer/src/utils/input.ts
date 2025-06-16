import * as readline from 'readline';
import { InputType } from '../types';

/**
 * Create a readline interface
 * @returns Readline interface
 */
export function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask a question to the user
 * @param rl Readline interface
 * @param question Question to ask
 * @returns Promise with user's answer
 */
export function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Determine input type based on user's answer
 * @param input User input
 * @returns InputType (SERVICE_NAME or SERVICE_DESCRIPTION)
 */
export function determineInputType(input: string): InputType {
  // Check if the input is longer than 50 characters or contains multiple sentences
  if (input.length > 50 || input.match(/[.!?]+\s/g)) {
    return 'SERVICE_DESCRIPTION';
  }
  
  return 'SERVICE_NAME';
} 