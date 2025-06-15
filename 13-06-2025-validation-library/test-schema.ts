import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { Schema } from './schema.ts';
import {
  StringValidator,
  NumberValidator,
  BooleanValidator,
  DateValidator,
  ObjectValidator,
  ArrayValidator
} from './validators.ts';

describe('Schema Builder', () => {
  test('Schema.string() should return a StringValidator', () => {
    const validator = Schema.string();
    assert.ok(validator instanceof StringValidator);
  });

  test('Schema.number() should return a NumberValidator', () => {
    const validator = Schema.number();
    assert.ok(validator instanceof NumberValidator);
  });

  test('Schema.boolean() should return a BooleanValidator', () => {
    const validator = Schema.boolean();
    assert.ok(validator instanceof BooleanValidator);
  });

  test('Schema.date() should return a DateValidator', () => {
    const validator = Schema.date();
    assert.ok(validator instanceof DateValidator);
  });

  test('Schema.object() should return an ObjectValidator', () => {
    const schema = {
      name: Schema.string(),
      age: Schema.number()
    };
    const validator = Schema.object(schema);
    assert.ok(validator instanceof ObjectValidator);
  });

  test('Schema.array() should return an ArrayValidator', () => {
    const itemValidator = Schema.string();
    const validator = Schema.array(itemValidator);
    assert.ok(validator instanceof ArrayValidator);
  });

  test('Schema should validate complex objects', () => {
    // Create a schema for a user object
    const addressSchema = Schema.object({
      street: Schema.string(),
      city: Schema.string(),
      postalCode: Schema.string().pattern(/^\d{5}$/)
    });

    const userSchema = Schema.object({
      name: Schema.string().minLength(2).maxLength(50),
      email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      age: Schema.number().optional(),
      isActive: Schema.boolean(),
      address: addressSchema
    });

    // Valid user data
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      isActive: true,
      address: {
        street: '123 Main St',
        city: 'Anytown',
        postalCode: '12345'
      }
    };

    const validResult = userSchema.validate(validUser);
    assert.equal(validResult.valid, true);
    assert.deepEqual(validResult.errors, []);

    // Invalid user data
    const invalidUser = {
      name: 'J', // Too short
      email: 'not-an-email',
      age: '30' as any, // Should be a number
      isActive: 'yes' as any, // Should be a boolean
      address: {
        street: '123 Main St',
        city: 'Anytown',
        postalCode: 'ABC12' // Doesn't match pattern
      }
    };

    const invalidResult = userSchema.validate(invalidUser);
    assert.equal(invalidResult.valid, false);
    assert.ok(invalidResult.errors.length > 0);
    assert.ok(invalidResult.errors.includes('name: String must be at least 2 characters long'));
    assert.ok(invalidResult.errors.includes('email: String does not match the required pattern'));
    assert.ok(invalidResult.errors.includes('isActive: Value must be a boolean'));
    assert.ok(invalidResult.errors.includes('address: postalCode: String does not match the required pattern'));
  });

  test('Schema should handle nested arrays', () => {
    // Create a schema for an array of arrays of strings
    const stringArrayValidator = Schema.array(Schema.string());
    const arrayOfArraysValidator = Schema.array(stringArrayValidator);

    // Valid data
    const validData = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f']
    ];

    const validResult = arrayOfArraysValidator.validate(validData);
    assert.equal(validResult.valid, true);
    assert.deepEqual(validResult.errors, []);

    // Invalid data
    const invalidData = [
      ['a', 'b', 123 as any], // Contains a non-string
      ['d', 'e', 'f']
    ];

    const invalidResult = arrayOfArraysValidator.validate(invalidData);
    assert.equal(invalidResult.valid, false);
    assert.ok(invalidResult.errors.length > 0);
  });

  test('Schema should handle optional fields', () => {
    const schema = Schema.object({
      required: Schema.string(),
      optional: Schema.number().optional()
    });

    // With optional field
    const withOptional = {
      required: 'value',
      optional: 42
    };
    const result1 = schema.validate(withOptional);
    assert.equal(result1.valid, true);

    // Without optional field
    const withoutOptional = {
      required: 'value'
    };
    const result2 = schema.validate(withoutOptional);
    assert.equal(result2.valid, true);
  });
}); 