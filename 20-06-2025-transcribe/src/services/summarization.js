const { OpenAI } = require('openai');
const config = require('../config/config');
const logger = require('../utils/logger');

// Create OpenAI instance
const openai = new OpenAI({
  apiKey: config.openaiApiKey
});

// Summarize transcription using GPT-4.1-mini
const summarizeTranscription = async (transcription) => {
  try {
    logger.info('Generating summary of transcription');
    
    const completion = await openai.chat.completions.create({
      model: config.models.summarization,
      messages: [
        {
          role: "system", 
          content: "You are an expert summarizer. Create a concise summary of the provided transcript that captures the key points, main topics, and important details. Focus on preserving the core intent and main takeaways."
        },
        {
          role: "user",
          content: transcription
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });
    
    logger.info('Summary generated successfully');
    return completion.choices[0].message.content;
  } catch (error) {
    logger.error(`Summarization error: ${error.message}`);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
};

module.exports = { summarizeTranscription }; 