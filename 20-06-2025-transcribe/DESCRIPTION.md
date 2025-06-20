 ## Short Description
 lightweight tool that transcribes audio, summarizes the content, and extracts meaningful insights—all powered by OpenAI's Whisper and GPT models

## Requirements
Console application that:
1. Accepts a spoken audio file as a path parameter.
2. Transcribes it using OpenAI's Whisper API.
3. Summarizes the transcription using gpt-4.1-mini model..
4. Extracts custom statistics from the transcript, such as:
    - Total word count
    - Speaking speed (in words per minute)
    - Frequently mentioned topics and how many times each is mentioned
5. Saves transcription result in a separate file(each new transcription should create a new separate file)
6. Returns summary and analytics to the user in console


## Example of analytics:

``` 
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


## Output:
1. Source code of a properly working console application
2. README.md with detailed instructions on how to run your application
3. Transcription for the provided audio file - transcription.md
4. Summary for the provided audio file - summary.md
5. Analysis for the provided audio file - analysis.json

## App aspects: 
1. Speech-to-Text Integration (ASR):
- Upload audio to an AI model.
- Parse structured responses from the Whisper API.
- Handle edge cases like unclear speech or non-English content.

2. Text Summarization:
- Convert long transcripts into concise summaries.
- Focus on preserving core intent and main takeaways.
- Write effective prompts that guide the summarizer.

3. Analytical Prompt Engineering:
- Calculate custom metrics (e.g., word count, speaking speed).
- Extract structured entities (like frequently mentioned topics).
- Format results as valid JSON objects.



