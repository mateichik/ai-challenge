const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const config = require('../config/config');

// Ensure output directory exists
const ensureOutputDir = () => {
  if (!fs.existsSync(config.outputDirectory)) {
    fs.mkdirSync(config.outputDirectory, { recursive: true });
  }
};

// Generate unique filename with timestamp
const generateFilename = (prefix) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}-${timestamp}`;
};

// Save transcription to file
const saveTranscription = (transcription) => {
  ensureOutputDir();
  const filename = path.join(config.outputDirectory, `${generateFilename('transcription')}.md`);
  fs.writeFileSync(filename, transcription);
  logger.info(`Transcription saved to ${filename}`);
  return filename;
};

// Save summary to file
const saveSummary = (summary) => {
  ensureOutputDir();
  const filename = path.join(config.outputDirectory, `${generateFilename('summary')}.md`);
  fs.writeFileSync(filename, summary);
  logger.info(`Summary saved to ${filename}`);
  return filename;
};

// Save analytics to JSON file
const saveAnalytics = (analytics) => {
  ensureOutputDir();
  const filename = path.join(config.outputDirectory, `${generateFilename('analysis')}.json`);
  fs.writeFileSync(filename, JSON.stringify(analytics, null, 2));
  logger.info(`Analytics saved to ${filename}`);
  return filename;
};

// Validate file exists and is an audio file
const validateAudioFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const validExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
  
  if (!validExtensions.includes(ext)) {
    throw new Error(`Unsupported file format: ${ext}. Supported formats: ${validExtensions.join(', ')}`);
  }
  
  return true;
};

module.exports = {
  saveTranscription,
  saveSummary,
  saveAnalytics,
  validateAudioFile
}; 