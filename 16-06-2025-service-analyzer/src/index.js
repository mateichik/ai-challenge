// Thin CLI wrapper
const { createReadlineInterface, askQuestion } = require('./utils/input.js');
const { runServiceAnalyzer } = require('./app.js');

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
            content: `You are a classifier.  Reply with ONLY valid JSON of the shape {"isService": boolean, "reason": string}.  No markdown.

Set isService = true when the input:
• Names a business/brand that offers a paid product or subscription (e.g. Netflix, Spotify).
• Describes an actionable task or process that can be hired out for payment (verb-phrase such as "food delivery", "ride sharing", "squeezing lemon juice").

If uncertain, default to isService = true and explain why in reason.`
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