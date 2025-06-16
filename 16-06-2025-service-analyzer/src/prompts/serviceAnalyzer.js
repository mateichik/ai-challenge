/**
 * Get system prompt for service analyzer based on input type.
 * @param {'SERVICE_NAME' | 'SERVICE_DESCRIPTION'} inputType
 * @returns {string}
 */
function getSystemPrompt(inputType) {
  const basePrompt = `You are a service analyzer that extracts and generates insights about services. \
Your task is to analyze the provided ${inputType === 'SERVICE_NAME' ? 'service name' : 'service description'} and generate a detailed analysis covering:\
\
1. Brief History: Founding year, milestones, etc.\
2. Target Audience: Primary user segments\
3. Core Features: Top 2–4 key functionalities\
4. Unique Selling Points: Key differentiators\
5. Business Model: How the service makes money\
6. Tech Stack Insights: Any hints about technologies used\
7. Perceived Strengths: Mentioned positives or standout features\
8. Perceived Weaknesses: Cited drawbacks or limitations\
\
Format your response as pure JSON with the following structure:\
{\
  "serviceName": "The service name",\
  "briefHistory": "Brief history content...",\
  "targetAudience": "Target audience content...",\
  "coreFeatures": "Core features content...",\
  "uniqueSellingPoints": "Unique selling points content...",\
  "businessModel": "Business model content...",\
  "techStackInsights": "Tech stack insights content...",\
  "perceivedStrengths": "Perceived strengths content...",\
  "perceivedWeaknesses": "Perceived weaknesses content..."\
}\
\
Your response must be valid JSON that can be parsed by JSON.parse().`;

  if (inputType === 'SERVICE_NAME') {
    return `${basePrompt}\
\
For well-known services, use your knowledge to provide accurate information.\
If the service isn't well-known, make educated guesses based on the name and industry patterns.`;
  } else {
    return `${basePrompt}\
\
Analyze the provided service description to extract meaningful insights.\
Apply reasoning to infer information not explicitly stated (e.g., deducing audience or monetization from context).`;
  }
}

/**
 * Get user prompt for service analyzer based on input type and input.
 * @param {string} input
 * @param {'SERVICE_NAME' | 'SERVICE_DESCRIPTION'} inputType
 * @returns {string}
 */
function getUserPrompt(input, inputType) {
  if (inputType === 'SERVICE_NAME') {
    return `Please analyze the following service: ${input}`;
  } else {
    return `Please analyze the following service description: ${input}`;
  }
}

module.exports = { getSystemPrompt, getUserPrompt }; 