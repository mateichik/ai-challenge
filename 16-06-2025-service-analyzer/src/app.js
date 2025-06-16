const { analyzeService } = require('./services/openai.js');
const { generateMarkdown, saveMarkdown } = require('./utils/markdown.js');

/**
 * Validate whether input is a service via OpenAI.
 * @param {string} input
 * @param {function} fetchImpl optional custom fetch for testing
 */
async function validateInputIsService(input, fetchImpl = fetch) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing');

  const res = await fetchImpl('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `You are a classifier. Reply ONLY with {"isService":boolean,"reason":string}. Treat actionable tasks or known brands as services. If unsure default to true.`
        },
        { role: 'user', content: input }
      ],
      temperature: 0
    })
  });

  if (!res.ok) {
    throw new Error(`Validation request failed: ${res.status}`);
  }
  const data = await res.json();
  const raw = (data.choices?.[0]?.message?.content || '').replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(raw);
  return parsed;
}

/**
 * Run full analysis pipeline and return path to generated report
 * @param {string} input
 */
async function runServiceAnalyzer(input) {
  const validation = await validateInputIsService(input);
  if (!validation.isService) {
    throw new Error(`Input rejected: ${validation.reason}`);
  }
  const analysis = await analyzeService(input, 'SERVICE_DESCRIPTION');
  const markdown = generateMarkdown(analysis, input);
  const filePath = saveMarkdown(markdown, analysis.serviceName);
  return filePath;
}

module.exports = { runServiceAnalyzer }; 