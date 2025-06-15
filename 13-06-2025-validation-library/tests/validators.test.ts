import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  Validator,
  StringValidator,
  NumberValidator,
  BooleanValidator,
  DateValidator,
  ObjectValidator,
  ArrayValidator
} from '../src/validators.ts';

/**
 * Tests for the Validator classes
 * 
 * This file contains comprehensive tests for all validator classes,
 * including both valid and invalid inputs, edge cases, and optional values.
 */
describe('Validator Classes', () => {
  describe('StringValidator', () => {
    test('should validate a string', () => {
      const validator = new StringValidator();
      const result = validator.validate('hello');
      assert.equal(result.valid, true);
      assert.deepEqual(result.errors, []);
    });

    test('should fail for non-string values', () => {
      const validator = new StringValidator();
      const result = validator.validate(123 as any);
      assert.equal(result.valid, false);
      assert.deepEqual(result.errors, ['Value must be a string']);
    });

    test('should respect minLength', () => {
      const validator = new StringValidator().minLength(5);
      const validResult = validator.validate('hello');
      assert.equal(validResult.valid, true);
      
      const invalidResult = validator.validate('hi');
      assert.equal(invalidResult.valid, false);
      assert.deepEqual(invalidResult.errors, ['String must be at least 5 characters long']);
    });

    test('should respect maxLength', () => {
      const validator = new StringValidator().maxLength(5);
      const validResult = validator.validate('hello');
      assert.equal(validResult.valid, true);
      
      const invalidResult = validator.validate('helloworld');
      assert.equal(invalidResult.valid, false);
      assert.deepEqual(invalidResult.errors, ['String must be at most 5 characters long']);
    });

    test('should respect pattern', () => {
      const validator = new StringValidator().pattern(/^[a-z]+$/);
      const validResult = validator.validate('hello');
      assert.equal(validResult.valid, true);
      
      const invalidResult = validator.validate('hello123');
      assert.equal(invalidResult.valid, false);
      assert.deepEqual(invalidResult.errors, ['String does not match the required pattern']);
    });

    test('should be optional', () => {
      const validator = new StringValidator().optional();
      const result1 = validator.validate(undefined as any);
      assert.equal(result1.valid, true);
      
      const result2 = validator.validate(null as any);
      assert.equal(result2.valid, true);
    });

    test('should use custom error message', () => {
      const validator = new StringValidator().withMessage('Custom error');
      const result = validator.validate(123 as any);
      assert.equal(result.valid, false);
      assert.deepEqual(result.errors, ['Custom error']);
    });
  });

  describe('NumberValidator', () => {
    test('should validate a number', () => {
      const validator = new NumberValidator();
      const result = validator.validate(123);
      assert.equal(result.valid, true);
      assert.deepEqual(result.errors, []);
    });

    test('should fail for non-number values', () => {
      const validator = new NumberValidator();
      const result = validator.validate('123' as any);
      assert.equal(result.valid, false);
      assert.deepEqual(result.errors, ['Value must be a number']);
    });

    test('should be optional', () => {
      const validator = new NumberValidator().optional();
      const result = validator.validate(undefined as any);
      assert.equal(result.valid, true);
    });
  });

  describe('BooleanValidator', () => {
    test('should validate a boolean', () => {
      const validator = new BooleanValidator();
      const result = validator.validate(true);
      assert.equal(result.valid, true);
      assert.deepEqual(result.errors, []);
    });

    test('should fail for non-boolean values', () => {
      const validator = new BooleanValidator();
      const result = validator.validate('true' as any);
      assert.equal(result.valid, false);
      assert.deepEqual(result.errors, ['Value must be a boolean']);
    });

    test('should be optional', () => {
      const validator = new BooleanValidator().optional();
      const result = validator.validate(undefined as any);
      assert.equal(result.valid, true);
    });
  });

  describe('DateValidator', () => {
    test('should validate a Date', () => {
      const validator = new DateValidator();
      const result = validator.validate(new Date());
      assert.equal(result.valid, true);
      assert.deepEqual(result.errors, []);
    });

    test('should fail for invalid Date values', () => {
      const validator = new DateValidator();
      const invalidDate = new Date('invalid date');
      const result = validator.validate(invalidDate);
      assert.equal(result.valid, false);
      assert.deepEqual(result.errors, ['Value must be a valid Date']);
    });

    test('should fail for non-Date values', () => {
      const validator = new DateValidator();
      const result = validator.validate('2023-01-01' as any);
      assert.equal(result.valid, false);
      assert.deepEqual(result.errors, ['Value must be a valid Date']);
    });

    test('should be optional', () => {
      const validator = new DateValidator().optional();
      const result = validator.validate(undefined as any);
      assert.equal(result.valid, true);
    });
  });

  describe('ObjectValidator', () => {
    test('should validate a valid object', () => {
      const schema = {
        name: new StringValidator(),
        age: new NumberValidator()
      };
      const validator = new ObjectValidator(schema);
      const result = validator.validate({ name: 'John', age: 30 });
      assert.equal(result.valid, true);
      assert.deepEqual(result.errors, []);
    });

    test('should fail for an object with invalid properties', () => {
      const schema = {
        name: new StringValidator(),
        age: new NumberValidator()
      };
      const validator = new ObjectValidator(schema);
      const result = validator.validate({ name: 'John', age: '30' as any });
      assert.equal(result.valid, false);
      assert.deepEqual(result.errors, ['age: Value must be a number']);
    });

    test('should fail for non-object values', () => {
      const schema = {
        name: new StringValidator(),
        age: new NumberValidator()
      };
      const validator = new ObjectValidator(schema);
      const result = validator.validate('not an object' as any);
      assert.equal(result.valid, false);
      assert.deepEqual(result.errors, ['Value must be an object']);
    });

    test('should be optional', () => {
      const schema = {
        name: new StringValidator(),
        age: new NumberValidator()
      };
      const validator = new ObjectValidator(schema).optional();
      const result = validator.validate(undefined as any);
      assert.equal(result.valid, true);
    });
  });

  describe('ArrayValidator', () => {
    test('should validate an array of valid items', () => {
      const validator = new ArrayValidator(new StringValidator());
      const result = validator.validate(['a', 'b', 'c']);
      assert.equal(result.valid, true);
      assert.deepEqual(result.errors, []);
    });

    test('should fail for an array with invalid items', () => {
      const validator = new ArrayValidator(new StringValidator());
      const result = validator.validate(['a', 123 as any, 'c']);
      assert.equal(result.valid, false);
      assert.deepEqual(result.errors, ['Item at index 1: Value must be a string']);
    });

    test('should fail for non-array values', () => {
      const validator = new ArrayValidator(new StringValidator());
      const result = validator.validate('not an array' as any);
      assert.equal(result.valid, false);
      assert.deepEqual(result.errors, ['Value must be an array']);
    });

    test('should be optional', () => {
      const validator = new ArrayValidator(new StringValidator()).optional();
      const result = validator.validate(undefined as any);
      assert.equal(result.valid, true);
    });
  });
}); 