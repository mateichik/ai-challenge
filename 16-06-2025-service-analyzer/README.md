# Service Analyzer

A lightweight console application that analyzes services and generates insights from multiple perspectives using OpenAI API.

## Features

- Accept service names (e.g., "Spotify", "Notion") or raw service descriptions
- Analyze services from business, technical, and user-focused perspectives
- Output analysis to a Markdown file with a well-organized structure

## Output Format

The generated Markdown file includes the following sections:

1. Brief History: Founding year, milestones, etc.
2. Target Audience: Primary user segments
3. Core Features: Top 2–4 key functionalities
4. Unique Selling Points: Key differentiators
5. Business Model: How the service makes money
6. Tech Stack Insights: Any hints about technologies used
7. Perceived Strengths: Mentioned positives or standout features
8. Perceived Weaknesses: Cited drawbacks or limitations

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your-api-key-here
   ```

## Usage

Run the application with:

```
npm start
```

The application will:
1. Prompt you to enter a service name or description
2. Analyze the service using OpenAI API (gpt-4.1-mini model)
3. Generate a Markdown file with the analysis in the `output` directory

## Example Input

You can use:

- A service name: `Spotify`
- A service description: `Our platform helps creators monetize content through subscriptions and digital products`

## Technical Details

This application uses Node.js native typestripping to run TypeScript code directly without compilation. It requires:

- Node.js v23.6.0 or higher (which has typestripping enabled by default)
- OpenAI API Key 