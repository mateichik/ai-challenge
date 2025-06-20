const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const config = require('../config/config');

// Get subfolder name from audio file path (without extension)
const getSubfolderName = (audioFilePath) => {
  return path.basename(audioFilePath, path.extname(audioFilePath));
};

// Ensure output directory exists with audio-specific subfolder
const ensureOutputDir = (audioFilePath) => {
  const subfolder = getSubfolderName(audioFilePath);
  const outputDir = path.join(config.outputDirectory, subfolder);
  
  if (!fs.existsSync(config.outputDirectory)) {
    fs.mkdirSync(config.outputDirectory, { recursive: true });
  }
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  return outputDir;
};

// Generate filename with timestamp
const generateFilename = (prefix) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}-${timestamp}`;
};

// Save transcription to file
const saveTranscription = (transcription, audioFilePath) => {
  const outputDir = ensureOutputDir(audioFilePath);
  const filename = path.join(outputDir, `transcription.md`);
  fs.writeFileSync(filename, transcription);
  logger.info(`Transcription saved to ${filename}`);
  return filename;
};

// Save summary to file
const saveSummary = (summary, audioFilePath) => {
  const outputDir = ensureOutputDir(audioFilePath);
  const filename = path.join(outputDir, `summary.md`);
  fs.writeFileSync(filename, summary);
  logger.info(`Summary saved to ${filename}`);
  return filename;
};

// Save analytics to JSON file
const saveAnalytics = (analytics, audioFilePath) => {
  const outputDir = ensureOutputDir(audioFilePath);
  const filename = path.join(outputDir, `analysis.json`);
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