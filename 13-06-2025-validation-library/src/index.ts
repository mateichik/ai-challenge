import { Schema } from './schema.ts';

/**
 * Example usage of the validation library
 * 
 * This file demonstrates how to use the Schema builder to create
 * complex validation schemas and validate data against them.
 */

// Define an address schema for nested validation
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
  country: Schema.string()
});

// Define a comprehensive user schema with various validation rules
const userSchema = Schema.object({
  // Basic field validations
  id: Schema.string().withMessage('ID must be a string'),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  
  // Optional fields
  age: Schema.number().optional(),
  
  // Boolean validation
  isActive: Schema.boolean(),
  
  // Array validation
  tags: Schema.array(Schema.string()),
  
  // Nested object validation (optional)
  address: addressSchema.optional(),
  
  // Empty object validation (optional)
  metadata: Schema.object({}).optional()
});

// Sample data to validate
const userData = {
  id: "12345",
  name: "John Doe",
  email: "john@example.com",
  isActive: true,
  tags: ["developer", "designer"],
  address: {
    street: "123 Main St",
    city: "Anytown",
    postalCode: "12345",
    country: "USA"
  }
};

// Perform validation
const result = userSchema.validate(userData);
console.log('Validation Result:', result); 