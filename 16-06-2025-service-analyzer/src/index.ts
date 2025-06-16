// Remove dotenv; Node.js --env-file flag loads environment variables from .env
const { createReadlineInterface, askQuestion, determineInputType } = require('./utils/input.ts');

/**
 * Main application function
 */
async function main() {
  try {
    console.log('Service Analyzer');
    console.log('===============');
    console.log('This tool analyzes services and generates insights from multiple perspectives.');
    console.log('Enter a service name (e.g., "Spotify") or a service description.');
    console.log();
    
    const rl = createReadlineInterface();
    
    // Get input from user
    const input = await askQuestion(rl, 'Enter service name or description: ');
    
    if (!input.trim()) {
      console.log('Error: Input cannot be empty.');
      rl.close();
      return;
    }
    
    // Lazy-load heavy modules after getting user input to speed up initial prompt
    const { analyzeService } = require('./services/openai.ts');
    const { generateMarkdown, saveMarkdown } = require('./utils/markdown.ts');
    console.log('\nAnalyzing service...');
    
    // Determine input type
    const inputType = determineInputType(input);
    
    // Analyze service using OpenAI
    const analysis = await analyzeService(input, inputType);
    
    // Generate markdown
    const markdown = generateMarkdown(analysis);
    
    // Save markdown to file
    const filePath = saveMarkdown(markdown, analysis.serviceName);
    
    console.log(`\nAnalysis complete! Saved to: ${filePath}`);
    
    rl.close();
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the application
main(); 