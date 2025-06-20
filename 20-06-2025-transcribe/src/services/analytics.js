const { OpenAI } = require('openai');
const config = require('../config/config');
const logger = require('../utils/logger');

// Create OpenAI instance
const openai = new OpenAI({
  apiKey: config.openaiApiKey
});

// Calculate word count
const calculateWordCount = (text) => {
  return text.split(/\s+/).filter(word => word.length > 0).length;
};

// Estimate speaking speed in words per minute
const calculateSpeakingSpeed = (text, audioDurationInSeconds) => {
  const wordCount = calculateWordCount(text);
  const minutesDuration = audioDurationInSeconds / 60;
  return Math.round(wordCount / minutesDuration);
};

// Extract topics using GPT-4.1-mini
const extractTopics = async (transcription) => {
  try {
    logger.info('Extracting frequently mentioned topics from transcription');
    
    const completion = await openai.chat.completions.create({
      model: config.models.summarization,
      messages: [
        {
          role: "system", 
          content: "You are an expert at analyzing text. Identify the most frequently mentioned topics in the provided transcript. Return a JSON array of objects with 'topic' and 'mentions' keys, sorted by frequency (highest first). Focus only on significant topics, not common words or phrases."
        },
        {
          role: "user",
          content: `Please analyze this transcript and return only a JSON array of the top topics:\n\n${transcription}`
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });
    
    const response = JSON.parse(completion.choices[0].message.content);
    logger.info('Topics extracted successfully');
    return response.topics || [];
  } catch (error) {
    logger.error(`Topic extraction error: ${error.message}`);
    return []; // Return empty array on error
  }
};

// Get audio duration in seconds
const getAudioDuration = async (audioFilePath) => {
  try {
    // Note: This is a placeholder for actual audio duration detection
    // In a real implementation, you would use a library like music-metadata or ffprobe
    // For this implementation plan, we'll assume a function that returns the duration
    const duration = 120; // placeholder value in seconds
    return duration;
  } catch (error) {
    logger.error(`Failed to get audio duration: ${error.message}`);
    return 60; // Default to 1 minute if duration can't be determined
  }
};

// Generate complete analytics
const generateAnalytics = async (transcription, audioFilePath) => {
  logger.info('Generating analytics for transcription');
  
  const wordCount = calculateWordCount(transcription);
  const audioDuration = await getAudioDuration(audioFilePath);
  const speakingSpeed = calculateSpeakingSpeed(transcription, audioDuration);
  const topics = await extractTopics(transcription);
  
  const analytics = {
    word_count: wordCount,
    speaking_speed_wpm: speakingSpeed,
    frequently_mentioned_topics: topics
  };
  
  logger.info('Analytics generated successfully');
  return analytics;
};

module.exports = { generateAnalytics }; 