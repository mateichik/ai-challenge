require('dotenv').config();

module.exports = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  outputDirectory: './outputs',
  models: {
    transcription: 'whisper-1',
    summarization: 'gpt-4.1-mini'
  }
}; 