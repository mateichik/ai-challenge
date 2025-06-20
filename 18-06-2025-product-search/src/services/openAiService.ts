import { OpenAI } from 'openai';
import { ProductQuery } from '../models/query';
import { Logger } from '../utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

export class OpenAIService {
  private openai: OpenAI;
  
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async parseUserQuery(userInput: string): Promise<ProductQuery> {
    try {
      Logger.info(`Parsing user query: "${userInput}"`);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini", // Using gpt-4.1-mini model
        temperature: 0,
        messages: [
          { 
            role: "system", 
            content: `You are a precise product search query parser that converts natural language into structured search parameters.

AVAILABLE PRODUCT CATEGORIES:
- Electronics (headphones, laptops, watches, speakers, monitors, smartphones, mice, hard drives, chargers)
- Fitness (yoga mats, treadmills, dumbbells, exercise bikes, resistance bands, kettlebells, foam rollers, pull-up bars, jump ropes)
- Kitchen (blenders, air fryers, microwaves, coffee makers, toasters, kettles, rice cookers, pressure cookers, dishwashers, refrigerators)
- Books (novels, guides, cookbooks, history, self-help, fantasy, biography, mystery, children's books, science fiction)
- Clothing (t-shirts, dresses, jeans, jackets, shoes, sandals, hoodies, scarves, socks, hats)

PARSING RULES:
1. Extract specific keywords that appear in product names or closely relate to product features.
2. Identify price constraints (under $X, less than $X, maximum $X → maxPrice; over $X, more than $X, minimum $X → minPrice).
3. Detect rating requirements (highly rated, top rated, 4+ stars → minRating: 4; poor ratings, low rated → maxRating).
4. Recognize category mentions and map to available categories.
5. Note availability requirements (in stock, available → inStock: true).
6. Identify superlative requests:
   - Cheapest, lowest price, most affordable → findMinPrice: true
   - Most expensive, highest price, premium → findMaxPrice: true
   - Lowest rated, worst rated → findMinRating: true
   - Best rated, highest rated, top rated → findMaxRating: true

IMPORTANT:
- Only include parameters that are explicitly or strongly implied in the query.
- For ambiguous queries about books/reading, default to the Books category.
- For queries about clothing without gender specification, don't limit by gender.
- Set numeric values (prices, ratings) as numbers without currency symbols or units.
- If the query is nonsensical or contains no recognizable product terms, only extract keywords.`
          },
          { 
            role: "user", 
            content: `PARSING TASK:
1. Analyze this product search query: "${userInput}"
2. Extract ALL relevant search parameters based on the query
3. Map them to the structured filter format
4. Include ONLY parameters that are explicitly mentioned or strongly implied

Return the structured filter parameters that best represent this search intent.` 
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "filter_products",
              description: "Extract structured filter parameters from a natural language product search query",
              parameters: {
                type: "object",
                properties: {
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific keywords that appear in product names or closely relate to product features"
                  },
                  minPrice: {
                    type: "number",
                    description: "Minimum price threshold (when user specifies 'over X', 'more than X', 'at least X')"
                  },
                  maxPrice: {
                    type: "number",
                    description: "Maximum price threshold (when user specifies 'under X', 'less than X', 'at most X')"
                  },
                  minRating: {
                    type: "number",
                    description: "Minimum rating threshold (1-5) for product quality (when user mentions 'highly rated', 'good ratings', etc.)"
                  },
                  maxRating: {
                    type: "number",
                    description: "Maximum rating threshold (1-5) for product quality (when user wants lower rated products)"
                  },
                  categories: {
                    type: "array",
                    items: { type: "string" },
                    description: "Product categories to include from: Electronics, Fitness, Kitchen, Books, Clothing"
                  },
                  inStock: {
                    type: "boolean",
                    description: "Whether the product must be in stock (true when user mentions 'available', 'in stock')"
                  },
                  findMinPrice: {
                    type: "boolean",
                    description: "Find the cheapest product(s) (true when user asks for 'cheapest', 'lowest price', 'most affordable')"
                  },
                  findMaxPrice: {
                    type: "boolean",
                    description: "Find the most expensive product(s) (true when user asks for 'most expensive', 'highest price', 'premium')"
                  },
                  findMinRating: {
                    type: "boolean",
                    description: "Find the lowest rated product(s) (true when user asks for 'lowest rated', 'worst rated')"
                  },
                  findMaxRating: {
                    type: "boolean",
                    description: "Find the highest rated product(s) (true when user asks for 'best rated', 'highest rated', 'top rated')"
                  }
                },
                required: []
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "filter_products" } }
      });

      const toolCall = response.choices[0].message.tool_calls?.[0];
      if (toolCall && toolCall.function.name === "filter_products" && toolCall.function.arguments) {
        const parsedQuery = JSON.parse(toolCall.function.arguments) as ProductQuery;
        Logger.debug(`Parsed query: ${JSON.stringify(parsedQuery)}`);
        return parsedQuery;
      }
      
      throw new Error("Failed to parse query through OpenAI");
    } catch (error) {
      Logger.error("Error calling OpenAI API to parse query", error);
      throw error;
    }
  }
} 