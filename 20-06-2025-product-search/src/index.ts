import * as readline from 'readline-sync';
import * as dotenv from 'dotenv';
import { OpenAIService } from './services/openAiService';
import { ProductService } from './services/productService';
import { Logger } from './utils/logger';

// Load environment variables
dotenv.config();

async function main() {
  try {
    const openAIService = new OpenAIService();
    const productService = new ProductService();
    
    console.log("\n===================================");
    console.log("Welcome to Product Search");
    console.log("===================================");
    console.log("Enter your search query in natural language.");
    console.log("Example: 'I need a smartphone under $800 with good ratings'");
    console.log("Type 'exit' to quit the application.");
    console.log("===================================\n");
    
    while (true) {
      const userInput = readline.question("\nSearch (or 'exit' to quit): ");
      
      if (userInput.toLowerCase() === 'exit') {
        console.log("\nThank you for using Product Search. Goodbye!");
        break;
      }
      
      if (!userInput.trim()) {
        console.log("Please enter a valid search query.");
        continue;
      }
      
      try {
        console.log("\nProcessing your query...");
        
        // Step 1: Parse user query using OpenAI function calling
        const parsedQuery = await openAIService.parseUserQuery(userInput);
        console.log("Understood your query as:", JSON.stringify(parsedQuery, null, 2));
        
        // Step 2: Use OpenAI to filter products based on parsed query
        const result = await productService.searchProducts(parsedQuery);
        
        if (result.products.length === 0) {
          console.log("\nNo products found matching your criteria.");
        } else {
          console.log(`\nFound ${result.products.length} matching products:`);
          result.products.forEach((product, index) => {
            console.log(`\n${index + 1}. ${product.name}`);
            console.log(`   Category: ${product.category}`);
            console.log(`   Price: $${product.price}`);
            console.log(`   Rating: ${product.rating}/5`);
            console.log(`   In Stock: ${product.in_stock ? 'Yes' : 'No'}`);
          });
          
          if (result.explanation) {
            console.log(`\nMatching explanation: ${result.explanation}`);
          }
        }
      } catch (error) {
        Logger.error("Error processing search", error);
        console.log("\nError processing your search. Please try again with a different query.");
      }
    }
  } catch (error) {
    Logger.error("Application error", error);
    console.error("An error occurred while starting the application:", error);
  }
}

// Run the application
main().catch(error => {
  Logger.error("Unhandled application error", error);
  console.error("An unexpected error occurred:", error);
  process.exit(1);
}); 