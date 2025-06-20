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
            content: `You are a product search assistant that helps parse natural language queries into structured filters.
            Pay special attention to requests for finding the cheapest/lowest price, most expensive/highest price, 
            lowest rated, or highest rated products. These should be identified as finding minimum or maximum values.`
          },
          { 
            role: "user", 
            content: `Parse the following product search query into structured filter parameters: "${userInput}"` 
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "filter_products",
              description: "Filter products based on user criteria",
              parameters: {
                type: "object",
                properties: {
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Keywords related to product features or names"
                  },
                  minPrice: {
                    type: "number",
                    description: "Minimum price of product"
                  },
                  maxPrice: {
                    type: "number",
                    description: "Maximum price of product"
                  },
                  minRating: {
                    type: "number",
                    description: "Minimum rating of product (1-5)"
                  },
                  maxRating: {
                    type: "number",
                    description: "Maximum rating of product (1-5)"
                  },
                  categories: {
                    type: "array",
                    items: { type: "string" },
                    description: "Product categories to include (Electronics, Fitness, Kitchen, Books, Clothing)"
                  },
                  inStock: {
                    type: "boolean",
                    description: "Whether the product must be in stock"
                  },
                  findMinPrice: {
                    type: "boolean",
                    description: "Whether to find the product(s) with the lowest price (cheapest)"
                  },
                  findMaxPrice: {
                    type: "boolean",
                    description: "Whether to find the product(s) with the highest price (most expensive)"
                  },
                  findMinRating: {
                    type: "boolean",
                    description: "Whether to find the product(s) with the lowest rating"
                  },
                  findMaxRating: {
                    type: "boolean",
                    description: "Whether to find the product(s) with the highest rating (best rated)"
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