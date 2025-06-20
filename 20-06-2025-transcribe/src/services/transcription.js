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
      response_format: 'text',
      prompt: "Transcribe the actual spoken or sung content in this audio, ignoring any metadata or subtitle information."
    });
    
    // Handle empty or very short transcriptions that might be metadata
    if (transcription.trim().length < 50 && transcription.includes("http")) {
      logger.warn("Received very short transcription with URL, which might be metadata instead of actual content");
      
      // Retry with specific instructions
      logger.info("Retrying transcription with specific instructions");
      const retryTranscription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: config.models.transcription,
        response_format: 'text',
        prompt: "Ignore any metadata or subtitle information. Focus only on transcribing the actual spoken or sung words in this audio content."
      });
      
      // If retry still returns very short content, add a warning
      if (retryTranscription.trim().length < 50) {
        logger.warn("Retry still produced short content. Audio may not contain transcribable speech");
        return retryTranscription + "\n\n[Note: The transcription appears incomplete or contains only metadata. The audio file may not contain speech or may have technical issues.]";
      }
      
      return retryTranscription;
    }
    
    logger.info('Transcription completed successfully');
    return transcription;
  } catch (error) {
    logger.error(`Transcription error: ${error.message}`);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
};

module.exports = { transcribeAudio }; 