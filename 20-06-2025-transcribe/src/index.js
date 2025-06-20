#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { transcribeAudio } = require('./services/transcription');
const { summarizeTranscription } = require('./services/summarization');
const { generateAnalytics } = require('./services/analytics');
const { saveTranscription, saveSummary, saveAnalytics, validateAudioFile } = require('./utils/fileHandler');
const logger = require('./utils/logger');

// Process a single audio file
const processAudioFile = async (audioFilePath) => {
  try {
    // Resolve absolute path
    const resolvedPath = path.resolve(audioFilePath);
    
    // Validate audio file
    validateAudioFile(resolvedPath);
    
    console.log(`\nProcessing audio file: ${resolvedPath}`);
    
    // Step 1: Transcribe audio
    console.log('Transcribing audio...');
    const transcription = await transcribeAudio(resolvedPath);
    console.log('✅ Transcription complete');
    
    // Save transcription to file
    const transcriptionFile = saveTranscription(transcription, resolvedPath);
    console.log(`Transcription saved to: ${transcriptionFile}`);
    
    // Step 2: Generate summary
    console.log('Generating summary...');
    const summary = await summarizeTranscription(transcription);
    console.log('✅ Summary generated');
    
    // Save summary to file
    const summaryFile = saveSummary(summary, resolvedPath);
    console.log(`Summary saved to: ${summaryFile}`);
    
    // Step 3: Generate analytics
    console.log('Analyzing transcript...');
    const analytics = await generateAnalytics(transcription, resolvedPath);
    console.log('✅ Analysis complete');
    
    // Save analytics to file
    const analyticsFile = saveAnalytics(analytics, resolvedPath);
    console.log(`Analytics saved to: ${analyticsFile}`);
    
    // Step 4: Display results in console
    console.log('\n=== SUMMARY ===');
    console.log(summary);
    
    console.log('\n=== ANALYTICS ===');
    console.log(JSON.stringify(analytics, null, 2));
    
    return { success: true, file: path.basename(resolvedPath) };
  } catch (error) {
    logger.error(`Error processing file ${audioFilePath}: ${error.message}`);
    console.error(`❌ Error processing ${path.basename(audioFilePath)}: ${error.message}`);
    return { success: false, file: path.basename(audioFilePath), error: error.message };
  }
};

// Check if a path is a directory
const isDirectory = (pathStr) => {
  try {
    return fs.statSync(pathStr).isDirectory();
  } catch (err) {
    return false;
  }
};

// Get all audio files in a directory
const getAudioFiles = (directoryPath) => {
  const validExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
  
  try {
    return fs.readdirSync(directoryPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return validExtensions.includes(ext);
      })
      .map(file => path.join(directoryPath, file));
  } catch (error) {
    logger.error(`Failed to read directory: ${error.message}`);
    throw new Error(`Failed to read directory: ${error.message}`);
  }
};

// Configure CLI
program
  .version('1.0.0')
  .description('A tool that transcribes audio, summarizes the content, and extracts insights')
  .argument('<path>', 'Path to an audio file or folder containing audio files')
  .action(async (inputPath) => {
    try {
      const resolvedPath = path.resolve(inputPath);
      
      if (isDirectory(resolvedPath)) {
        console.log(`Processing all audio files in: ${resolvedPath}`);
        const audioFiles = getAudioFiles(resolvedPath);
        
        if (audioFiles.length === 0) {
          console.error(`❌ No supported audio files found in ${resolvedPath}`);
          process.exit(1);
        }
        
        console.log(`Found ${audioFiles.length} audio file(s) to process`);
        
        const results = [];
        for (let i = 0; i < audioFiles.length; i++) {
          console.log(`\n[${i + 1}/${audioFiles.length}] Processing file: ${path.basename(audioFiles[i])}`);
          const result = await processAudioFile(audioFiles[i]);
          results.push(result);
        }
        
        // Print summary of results
        console.log('\n=== PROCESSING SUMMARY ===');
        console.log(`Total files processed: ${results.length}`);
        const successful = results.filter(r => r.success).length;
        console.log(`Successfully processed: ${successful}`);
        console.log(`Failed: ${results.length - successful}`);
        
        if (results.length - successful > 0) {
          console.log('\nFailed files:');
          results.filter(r => !r.success).forEach(r => {
            console.log(`- ${r.file}: ${r.error}`);
          });
        }
      } else {
        // Process single file
        await processAudioFile(resolvedPath);
      }
    } catch (error) {
      logger.error(`Application error: ${error.message}`);
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv); 