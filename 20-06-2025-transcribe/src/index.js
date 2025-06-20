#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const { transcribeAudio } = require('./services/transcription');
const { summarizeTranscription } = require('./services/summarization');
const { generateAnalytics } = require('./services/analytics');
const { saveTranscription, saveSummary, saveAnalytics, validateAudioFile } = require('./utils/fileHandler');
const logger = require('./utils/logger');

// Configure CLI
program
  .version('1.0.0')
  .description('A tool that transcribes audio, summarizes the content, and extracts insights')
  .argument('<audioFilePath>', 'Path to the audio file to process')
  .action(async (audioFilePath) => {
    try {
      // Resolve absolute path
      const resolvedPath = path.resolve(audioFilePath);
      
      // Validate audio file
      validateAudioFile(resolvedPath);
      
      console.log(`Processing audio file: ${resolvedPath}`);
      
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
      
    } catch (error) {
      logger.error(`Application error: ${error.message}`);
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv); 