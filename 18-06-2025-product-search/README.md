# Product Search Application

A command-line application that uses OpenAI function calling to filter products based on natural language queries.

## Features

- Natural language query processing using OpenAI
- Product filtering with AI without implementing filtering logic in the application
- Supports filtering by:
  - Price range
  - Minimum rating
  - Product categories
  - Stock availability
  - Keywords and features

## Prerequisites

- Node.js (v14 or newer)
- NPM or Yarn
- OpenAI API key

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your OpenAI API key in the `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

## Usage

Start the application:
```bash
npm start
```

Enter your search query in natural language, for example:
- "I need a smartphone under $800 with good ratings"
- "Show me kitchen appliances with at least 4.5 rating that are in stock"
- "I'm looking for fitness equipment under $100"
- "Find me electronics with ratings above 4.5"

Type 'exit' to quit the application.

## Example Queries

- "I need headphones with noise cancellation"
- "Show me kitchen appliances under $50"
- "What fitness equipment is available for under $30?"
- "I need a good book about programming"
- "Show me clothing items for men"

## How It Works

1. The application takes the user's natural language query
2. Sends the query to OpenAI using function calling to parse it into structured parameters
3. Loads the product data from products.json
4. Uses another OpenAI function call to filter the products based on the parsed parameters
5. Displays the matching products to the user

## Project Structure

```
product-search-app/
├── src/
│   ├── index.ts              # Main application entry point
│   ├── services/
│   │   ├── openAiService.ts  # OpenAI API integration
│   │   └── productService.ts # Product data handling
│   ├── models/
│   │   ├── product.ts        # Product interface
│   │   └── query.ts          # Query interface
│   └── utils/
│       └── logger.ts         # Logging utility
├── products.json             # Product data
├── tsconfig.json             # TypeScript configuration
├── .env                      # Environment variables
└── package.json              # Project configuration
``` 