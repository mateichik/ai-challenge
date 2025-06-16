// Removed unnecessary type import

const { safeFetch } = require('../utils/safeFetch.js');
const { getSystemPrompt, getUserPrompt } = require('../prompts/serviceAnalyzer.js');

/**
 * Analyze a service using OpenAI
 * @param input The service name or description
 * @param inputType Type of input (service name or description)
 * @returns ServiceAnalysis object
 */
async function analyzeService(input, inputType) {
  try {
    const systemPrompt = getSystemPrompt(inputType);
    const userPrompt = getUserPrompt(input, inputType);

    // Call OpenAI API directly using fetch to minimize memory footprint
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }
    const res = await safeFetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0
      })
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${errorText}`);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    
    return parseOpenAIResponse(content, input);
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error(`Failed to analyze service: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse OpenAI API response into ServiceAnalysis object
 */
function parseOpenAIResponse(responseContent, originalInput) {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(responseContent);
    
    // Validate required fields
    const requiredFields = [
      'serviceName', 'briefHistory', 'targetAudience', 'coreFeatures', 
      'uniqueSellingPoints', 'businessModel', 'techStackInsights', 
      'perceivedStrengths', 'perceivedWeaknesses'
    ];
    
    for (const field of requiredFields) {
      if (!parsed[field]) {
        parsed[field] = `Information about ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is not available.`;
      }
    }
    
    // If no service name is provided, use the original input
    if (!parsed.serviceName || parsed.serviceName.trim() === '') {
      parsed.serviceName = originalInput;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    
    // Fallback: return a default object with error messages
    return {
      serviceName: originalInput,
      briefHistory: 'Failed to analyze brief history.',
      targetAudience: 'Failed to analyze target audience.',
      coreFeatures: 'Failed to analyze core features.',
      uniqueSellingPoints: 'Failed to analyze unique selling points.',
      businessModel: 'Failed to analyze business model.',
      techStackInsights: 'Failed to analyze tech stack insights.',
      perceivedStrengths: 'Failed to analyze perceived strengths.',
      perceivedWeaknesses: 'Failed to analyze perceived weaknesses.',
    };
  }
}

module.exports = { analyzeService }; 