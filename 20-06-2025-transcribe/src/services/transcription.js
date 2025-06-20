const { OpenAI } = require('openai');
const fs = require('fs');
const config = require('../config/config');
const logger = require('../utils/logger');

// Create OpenAI instance
const openai = new OpenAI({
  apiKey: config.openaiApiKey
});

// Transcribe audio file using Whisper API
const transcribeAudio = async (audioFilePath) => {
  try {
    logger.info(`Transcribing audio file: ${audioFilePath}`);
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: config.models.transcription,
      response_format: 'text'
    });
    
    logger.info('Transcription completed successfully');
    return transcription;
  } catch (error) {
    logger.error(`Transcription error: ${error.message}`);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
};

module.exports = { transcribeAudio }; 