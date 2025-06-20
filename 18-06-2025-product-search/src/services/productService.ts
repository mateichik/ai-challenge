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
            content: "You are a product filtering assistant. Filter products based on the provided criteria." 
          },
          { 
            role: "user", 
            content: `Filter the following products based on these criteria: ${JSON.stringify(query)}. 
                      Products data: ${JSON.stringify(products)}` 
          }
        ],
        functions: [
          {
            name: "return_filtered_products",
            description: "Return products that match the filtering criteria",
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
                  description: "Array of products that match the criteria"
                },
                explanation: {
                  type: "string",
                  description: "Explanation of why these products match the criteria"
                }
              },
              required: ["products"]
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