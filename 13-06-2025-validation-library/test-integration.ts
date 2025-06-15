import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { Schema } from './schema.ts';

describe('Validation Library Integration', () => {
  test('should validate a complex schema with nested objects and arrays', () => {
    // Define a complex schema similar to the one in index.ts
    const addressSchema = Schema.object({
      street: Schema.string(),
      city: Schema.string(),
      postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
      country: Schema.string()
    });

    const userSchema = Schema.object({
      id: Schema.string().withMessage('ID must be a string'),
      name: Schema.string().minLength(2).maxLength(50),
      email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      age: Schema.number().optional(),
      isActive: Schema.boolean(),
      tags: Schema.array(Schema.string()),
      address: addressSchema.optional(),
      metadata: Schema.object({}).optional()
    });

    // Valid user data
    const validUser = {
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

    const validResult = userSchema.validate(validUser);
    assert.equal(validResult.valid, true);
    assert.deepEqual(validResult.errors, []);

    // Invalid user data with multiple errors
    const invalidUser = {
      id: 12345 as any, // Should be a string
      name: "J", // Too short
      email: "not-an-email", // Invalid email
      isActive: "yes" as any, // Should be a boolean
      tags: ["developer", 123 as any], // Array with invalid item
      address: {
        street: "123 Main St",
        city: "Anytown",
        postalCode: "ABC", // Invalid postal code
        country: 123 as any // Should be a string
      }
    };

    const invalidResult = userSchema.validate(invalidUser);
    assert.equal(invalidResult.valid, false);
    assert.ok(invalidResult.errors.length > 0);
    
    // Check for specific errors
    assert.ok(invalidResult.errors.some(e => e.includes('ID must be a string')));
    assert.ok(invalidResult.errors.some(e => e.includes('name: String must be at least 2 characters long')));
    assert.ok(invalidResult.errors.some(e => e.includes('email: String does not match the required pattern')));
    assert.ok(invalidResult.errors.some(e => e.includes('isActive: Value must be a boolean')));
    assert.ok(invalidResult.errors.some(e => e.includes('tags: Item at index 1: Value must be a string')));
    assert.ok(invalidResult.errors.some(e => e.includes('address: postalCode: Postal code must be 5 digits')));
    assert.ok(invalidResult.errors.some(e => e.includes('address: country: Value must be a string')));
  });

  test('should handle optional fields correctly', () => {
    const schema = Schema.object({
      required: Schema.string(),
      optionalString: Schema.string().optional(),
      optionalNumber: Schema.number().optional(),
      optionalObject: Schema.object({
        nestedRequired: Schema.string()
      }).optional()
    });

    // With all fields
    const withAllFields = {
      required: 'value',
      optionalString: 'string',
      optionalNumber: 42,
      optionalObject: {
        nestedRequired: 'nested'
      }
    };
    const result1 = schema.validate(withAllFields);
    assert.equal(result1.valid, true);

    // Without optional fields
    const withoutOptionals = {
      required: 'value'
    };
    const result2 = schema.validate(withoutOptionals);
    assert.equal(result2.valid, true);

    // With some optional fields
    const withSomeOptionals = {
      required: 'value',
      optionalString: 'string',
      optionalObject: {
        nestedRequired: 'nested'
      }
    };
    const result3 = schema.validate(withSomeOptionals);
    assert.equal(result3.valid, true);

    // Missing required field
    const missingRequired = {
      optionalString: 'string'
    };
    const result4 = schema.validate(missingRequired);
    assert.equal(result4.valid, false);
    assert.ok(result4.errors.some(e => e.includes('required: Value must be a string')));
  });

  test('should validate arrays with complex item validators', () => {
    interface Person {
      name: string;
      age: number;
    }

    const personSchema = Schema.object<Person>({
      name: Schema.string(),
      age: Schema.number()
    });

    const peopleSchema = Schema.array(personSchema);

    // Valid array
    const validPeople = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 }
    ];
    const validResult = peopleSchema.validate(validPeople);
    assert.equal(validResult.valid, true);

    // Invalid array
    const invalidPeople = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 'twenty-five' as any }, // Age should be a number
      { name: 123 as any, age: 40 } // Name should be a string
    ];
    const invalidResult = peopleSchema.validate(invalidPeople);
    assert.equal(invalidResult.valid, false);
    assert.ok(invalidResult.errors.some(e => e.includes('Item at index 1: age: Value must be a number')));
    assert.ok(invalidResult.errors.some(e => e.includes('Item at index 2: name: Value must be a string')));
  });
}); 