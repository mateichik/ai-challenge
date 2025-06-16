// Thin CLI wrapper
const { createReadlineInterface, askQuestion } = require('./utils/input.js');
const { safeFetch } = require('./utils/safeFetch.js');
const { runServiceAnalyzer, validateInputIsService } = require('./app.js');

/**
 * Main application flow
 */
async function main() {
  const rl = createReadlineInterface();
  try {
    console.log('Service Analyzer');
    console.log('===============');
    console.log('This tool analyzes services and generates insights from multiple perspectives.');
    console.log('Enter a service name (e.g., "Spotify") or a service description.');
    console.log();
    
    const input = await askQuestion(rl, 'Enter service name or description: ');
    if (!input.trim()) {
      console.log('Error: Input cannot be empty.');
      rl.close();
      return;
    }
    
    // Validate input as a service using AI
    console.log('\nValidating input as a service...');
    let validation;
    try {
      validation = await validateInputIsService(input, safeFetch);
    } catch (error) {
      console.error('Validation error:', error.message);
      rl.close();
      return;
    }
    if (!validation.isService) {
      console.error('Error: Input is not a valid service name or description.');
      console.error(`Reason: ${validation.reason || '-'}`);
      rl.close();
      return;
    }
    console.log('Validated as a service.');
    
    // Analyze service using OpenAI
    console.log('\nAnalyzing service...');
    const filePath = await runServiceAnalyzer(input);
    
    console.log(`\nAnalysis complete! Saved to: ${filePath}`);
    
    rl.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the application
main(); 