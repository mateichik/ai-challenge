# Implementation Plan for Audio Transcription Tool

## Overview

This document outlines the step-by-step implementation plan for building a console application that transcribes audio, summarizes content, and extracts insights using OpenAI's Whisper and GPT models.

## Project Setup

1. **Initialize Project**
   - Create a new Node.js project: `npm init -y`
   - Set up project structure with appropriate folders

2. **Install Dependencies**
   ```bash
   npm install openai dotenv fs path commander winston
   npm install --save-dev jest
   ```

3. **Environment Configuration**
   - Create a `.env` file for API keys
   - Set up environment variables for OpenAI API key

## Project Structure

```
project-root/
├── src/
│   ├── index.js             # Main entry point
│   ├── services/
│   │   ├── transcription.js  # Whisper API integration
│   │   ├── summarization.js  # GPT-4.1-mini integration 
│   │   └── analytics.js      # Processing for analytics
│   ├── utils/
│   │   ├── fileHandler.js    # File I/O operations
│   │   └── logger.js         # Logging utility
│   └── config/
│       └── config.js         # Configuration settings
├── outputs/                  # Generated outputs directory
├── tests/                    # Test files
├── .env                      # Environment variables
├── README.md                 # Project documentation
└── package.json              # Project metadata and dependencies
```

## Implementation Steps

### Step 1: Set Up Configuration

1. Create `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

2. Create `src/config/config.js`:
   ```javascript
   require('dotenv').config();
   
   module.exports = {
     openaiApiKey: process.env.OPENAI_API_KEY,
     outputDirectory: './outputs',
     models: {
       transcription: 'whisper-1',
       summarization: 'gpt-4.1-mini'
     }
   };
   ```

### Step 2: Implement Utilities

1. Create `src/utils/logger.js`:
   ```javascript
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.printf(({ timestamp, level, message }) => {
         return `${timestamp} ${level}: ${message}`;
       })
     ),
     transports: [
       new winston.transports.Console(),
       new winston.transports.File({ filename: 'app.log' })
     ]
   });
   
   module.exports = logger;
   ```

2. Create `src/utils/fileHandler.js`:
   ```javascript
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
   ```

### Step 3: Implement Transcription Service

Create `src/services/transcription.js`:
```javascript
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
```

### Step 4: Implement Summarization Service

Create `src/services/summarization.js`:
```javascript
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
```

### Step 5: Implement Analytics Service

Create `src/services/analytics.js`:
```javascript
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
```

### Step 6: Implement Main Application

Create `src/index.js`:
```javascript
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
      const transcriptionFile = saveTranscription(transcription);
      console.log(`Transcription saved to: ${transcriptionFile}`);
      
      // Step 2: Generate summary
      console.log('Generating summary...');
      const summary = await summarizeTranscription(transcription);
      console.log('✅ Summary generated');
      
      // Save summary to file
      const summaryFile = saveSummary(summary);
      console.log(`Summary saved to: ${summaryFile}`);
      
      // Step 3: Generate analytics
      console.log('Analyzing transcript...');
      const analytics = await generateAnalytics(transcription, resolvedPath);
      console.log('✅ Analysis complete');
      
      // Save analytics to file
      const analyticsFile = saveAnalytics(analytics);
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
```

### Step 7: Create README File

Create a `README.md` file with detailed instructions on how to run the application.

### Step 8: Set Up Package.json

Update `package.json` to include:

```json
{
  "name": "audio-transcription-tool",
  "version": "1.0.0",
  "description": "A tool that transcribes audio, summarizes content, and extracts insights using OpenAI's Whisper and GPT models",
  "main": "src/index.js",
  "bin": {
    "transcribe": "src/index.js"
  },
  "scripts": {
    "start": "node src/index.js",
    "test": "jest",
    "lint": "eslint src/"
  },
  "keywords": [
    "transcription",
    "summarization",
    "openai",
    "whisper",
    "gpt"
  ],
  "engines": {
    "node": ">=14.0.0"
  }
}
```

## Error Handling and Edge Cases

1. **API Failures**
   - Implement retry mechanisms for API calls
   - Add appropriate timeouts for long-running processes

2. **Input Validation**
   - Validate audio file exists and is in a supported format
   - Handle files that are too large for the API

3. **Edge Cases**
   - Empty or very short audio files
   - Non-English content (check if language detection is needed)
   - Corrupted audio files
   - API rate limiting

## Best Practices Implementation

1. **Security**
   - Store API keys in environment variables, not in code
   - Validate user input to prevent security vulnerabilities

2. **Performance**
   - Use streams for large file handling
   - Implement caching where appropriate
   - Use async/await for better readability and performance

3. **Code Quality**
   - Follow eslint rules for consistent code style
   - Use meaningful variable and function names
   - Add comprehensive comments and JSDoc
   - Separate concerns with modular architecture

4. **Testing**
   - Write unit tests for each module
   - Create integration tests for the full workflow
   - Mock external services (OpenAI) for testing

5. **Logging**
   - Implement comprehensive logging
   - Include timestamp, log level, and context in logs
   - Log important events and error details

## Implementation Enhancements (Optional)

1. **Audio File Analysis**
   - Add metadata extraction from audio files
   - Implement more accurate audio duration detection

2. **Advanced Analytics**
   - Add sentiment analysis
   - Identify speakers in multi-speaker audio
   - Extract action items and decisions

3. **User Experience**
   - Add progress indicators for long-running operations
   - Implement colorful console output
   - Add interactive mode with prompts

## Final Steps

1. **Testing**
   - Run manual testing with sample audio files
   - Verify all outputs meet requirements

2. **Documentation**
   - Complete the README with setup and usage instructions
   - Document known limitations and edge cases

3. **Packaging**
   - Make the tool globally installable: `npm install -g`
   - Create a proper binary for easier execution 