// Remove dotenv; Node.js --env-file flag loads environment variables from .env
const { createReadlineInterface, askQuestion } = require('./utils/input.js');
const { analyzeService } = require('./services/openai.js');
const { generateMarkdown, saveMarkdown } = require('./utils/markdown.js');

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
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Error: OPENAI_API_KEY is missing.');
      rl.close();
      return;
    }
    const validationRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert JSON validator that determines whether a given input refers to a digital or online service (e.g., streaming platform, SaaS, web app). Always respond with exactly valid JSON in this schema: {"isService": boolean, "reason": string}. Do not include any markdown or extra text, only the JSON object.
Examples:
  "Spotify" => {"isService": true, "reason": "Spotify is a well-known music streaming service."}
  "Netflix" => {"isService": true, "reason": "Netflix is a well-known video streaming service."}
  "Gmail" => {"isService": true, "reason": "Gmail is a widely used email service."}
  "Toothbrush" => {"isService": false, "reason": "A toothbrush is a physical product, not a service."}`
          },
          { role: 'user', content: `${input}` }
        ],
        temperature: 0
      })
    });
    if (!validationRes.ok) {
      const err = await validationRes.text();
      console.error(`Validation error: ${validationRes.status} ${err}`);
      rl.close();
      return;
    }
    // Get the full response data and log it for debugging
    const validationData = await validationRes.json();

    // Extract content from the response
    const content = validationData.choices?.[0]?.message?.content;
    let cleanContent = content ? content.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim() : '{}';
    
    let v;
    try {
      v = JSON.parse(cleanContent);
    } catch (e) {
      console.error('Error parsing validation response:', e.message);
      console.error('Content that failed parsing:', cleanContent);
      rl.close();
      return;
    }
    
    // Special case for known services
    const knownServices = ['netflix', 'spotify', 'youtube', 'gmail', 'amazon'];
    const inputLower = input.toLowerCase().trim();
    
    if (knownServices.includes(inputLower) || v.isService) {
      console.log('Validated as a service.');
      if (knownServices.includes(inputLower)) {
        console.log('(Recognized as a known service)');
      }
    } else {
      console.error('Error: Input is not a valid service name or description.');
      console.error(`Reason: ${v.reason || '-'}`);
      rl.close();
      return;
    }
    
    // Analyze service using OpenAI
    console.log('\nAnalyzing service...');
    const analysis = await analyzeService(input, 'SERVICE_DESCRIPTION');
    
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