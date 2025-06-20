# Audio Transcription Tool

A lightweight command-line tool that transcribes audio, summarizes the content, and extracts meaningful insights—all powered by OpenAI's Whisper and GPT models.

## Features

- Transcribe spoken audio using OpenAI's Whisper API
- Generate summaries of transcriptions using GPT-4.1-mini
- Extract useful analytics:
  - Total word count
  - Speaking speed (words per minute)
  - Frequently mentioned topics with mention counts
- Save all outputs to separate files
- Simple command-line interface

## Requirements

- Node.js (v14 or newer)
- OpenAI API key with access to Whisper and GPT-4.1-mini

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/audio-transcription-tool.git
   cd audio-transcription-tool
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your OpenAI API key:
   - Rename `.env.example` to `.env` (or create a new `.env` file)
   - Add your OpenAI API key: `OPENAI_API_KEY=your-api-key-here`

## Usage

```
node src/index.js <path-to-audio-file>
```

Or, if you've installed the package globally:

```
transcribe <path-to-audio-file>
```

### Example:

```
node src/index.js audio/sample.mp3
```

## Output Files

The tool generates three output files for each transcription, stored in the `outputs` directory:

1. `transcription-[timestamp].md`: The raw transcription text
2. `summary-[timestamp].md`: A concise summary of the content
3. `analysis-[timestamp].json`: Analytics data in JSON format

### Analytics Data Format

```json
{
  "word_count": 1280,
  "speaking_speed_wpm": 132,
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 },
    { "topic": "Q4 Roadmap", "mentions": 4 },
    { "topic": "AI Integration", "mentions": 3 }
  ]
}
```

## Development

- Running tests: `npm test`
- Linting: `npm run lint`

## Limitations

- The tool currently works best with clear audio in English
- Maximum file size is limited by the OpenAI API restrictions
- Audio duration calculation is approximated

## License

This project is licensed under the ISC License. 