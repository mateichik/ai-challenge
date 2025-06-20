import fs from 'fs/promises';
import path from 'path';
import { Product } from '../models/product';
import { ProductQuery } from '../models/query';
import { Logger } from '../utils/logger';
import { OpenAI } from 'openai';

export class ProductService {
  private productsPath: string;
  
  constructor() {
    this.productsPath = path.join(process.cwd(), 'products.json');
  }
  
  async loadProducts(): Promise<Product[]> {
    try {
      Logger.info(`Loading products from ${this.productsPath}`);
      const data = await fs.readFile(this.productsPath, 'utf8');
      const products = JSON.parse(data) as Product[];
      Logger.info(`Loaded ${products.length} products`);
      return products;
    } catch (error) {
      Logger.error('Error loading products', error);
      throw error;
    }
  }
  
  async filterProductsWithAI(products: Product[], query: ProductQuery): Promise<{products: Product[], explanation?: string}> {
    try {
      Logger.info('Filtering products using OpenAI');
      
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is not set');
      }
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      const filterResponse = await openai.chat.completions.create({
        model: "gpt-4.1-mini", // Using gpt-4.1-mini model
        temperature: 0,
        messages: [
          { 
            role: "system", 
            content: `You are a precise product filtering assistant that strictly follows filtering criteria.

TASK:
- Filter products based on the exact criteria provided in the query object.
- Return ONLY products that match ALL specified criteria.

FILTERING RULES:
- keywords: Return products where any keyword appears in the product name (case-insensitive).
- minPrice/maxPrice: Filter products within the specified price range (inclusive).
- minRating/maxRating: Filter products within the specified rating range (inclusive).
- categories: Include only products from the specified categories.
- inStock: If true, include only in-stock products.
- findMinPrice: If true, return ONLY product(s) with the lowest price among all matches.
- findMaxPrice: If true, return ONLY product(s) with the highest price among all matches.
- findMinRating: If true, return ONLY product(s) with the lowest rating among all matches.
- findMaxRating: If true, return ONLY product(s) with the highest rating among all matches.

IMPORTANT:
- Apply filters in sequence, narrowing results at each step.
- If no products match ALL criteria, return an empty array.
- Provide a clear, concise explanation of how the filtering was performed.
- For min/max queries, explain why these specific products have the minimum/maximum values.` 
          },
          { 
            role: "user", 
            content: `FILTERING TASK:
1. Filter the products based on these exact criteria: ${JSON.stringify(query)}
2. Apply all criteria as strict filters
3. For min/max price or rating queries, first apply all other filters, then find the min/max among remaining products

PRODUCTS DATA:
${JSON.stringify(products)}

Return the filtered products and a clear explanation of how you applied the filters.` 
          }
        ],
        functions: [
          {
            name: "return_filtered_products",
            description: "Return products that exactly match the filtering criteria",
            parameters: {
              type: "object",
              properties: {
                products: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      category: { type: "string" },
                      price: { type: "number" },
                      rating: { type: "number" },
                      in_stock: { type: "boolean" }
                    }
                  },
                  description: "Array of products that match ALL specified criteria"
                },
                explanation: {
                  type: "string",
                  description: "Clear explanation of how filters were applied and why these products match the criteria"
                }
              },
              required: ["products", "explanation"]
            }
          }
        ],
        function_call: { name: "return_filtered_products" }
      });
      
      const functionCall = filterResponse.choices[0].message.function_call;
      if (functionCall && functionCall.arguments) {
        const result = JSON.parse(functionCall.arguments) as {products: Product[], explanation?: string};
        Logger.info(`Found ${result.products.length} products matching the criteria`);
        return result;
      }
      
      throw new Error("Failed to get filtered products from OpenAI");
    } catch (error) {
      Logger.error("Error filtering products with AI", error);
      throw error;
    }
  }
  
  async searchProducts(query: ProductQuery): Promise<{products: Product[], explanation?: string}> {
    const products = await this.loadProducts();
    return this.filterProductsWithAI(products, query);
  }
} 