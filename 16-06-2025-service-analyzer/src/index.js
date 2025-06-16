// Remove dotenv; Node.js --env-file flag loads environment variables from .env
const { createReadlineInterface, askQuestion, determineInputType } = require('./utils/input.js');

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
    
    // Validate input as a service using AI with reasoning
    console.log('\nValidating input as a service...');
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Error: OPENAI_API_KEY is missing.');
      rl.close();
      return;
    }
    const validationRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'user', content: `Respond only with JSON {"isService": boolean, "reason": string}. Provide brief reasoning. If the input describes an action (e.g., a verb or phrase), decide whether this action can be offered as a service that provides value to others; set isService accordingly. Input: "${input}"` }
        ],
        temperature: 0
      })
    });
    if (!validationRes.ok) {
      const errorText = await validationRes.text();
      console.error(`Validation error: ${validationRes.status} ${errorText}`);
      rl.close();
      return;
    }
    const validationData = await validationRes.json();
    let isService = false;
    let reason = '';
    try {
      const parsed = JSON.parse(validationData.choices?.[0]?.message?.content || '{}');
      isService = parsed.isService;
      reason = parsed.reason;
    } catch {
      console.error('Error parsing validation response.');
      rl.close();
      return;
    }
    if (!isService) {
      console.log('Error: Input is not a valid service name or description.');
      console.log(`Reason: ${reason || '-'}`);
      rl.close();
      return;
    }
    
    // Lazy-load heavy modules after getting user input to speed up initial prompt
    const { analyzeService } = require('./services/openai.js');
    const { generateMarkdown, saveMarkdown } = require('./utils/markdown.js');
    console.log('\nAnalyzing service...');
    
    // Determine input type
    const inputType = determineInputType(input);
    
    // Analyze service using OpenAI
    const analysis = await analyzeService(input, inputType);
    
    // Generate markdown (including original prompt)
    const markdown = generateMarkdown(analysis, input);
    
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