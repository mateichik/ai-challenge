# Validation Library

A comprehensive validation library for JavaScript/TypeScript objects with a fluent API.

## Features

- String validation (minLength, maxLength, pattern)
- Number validation
- Boolean validation
- Date validation
- Object validation with schema
- Array validation
- Optional fields
- Custom error messages
- Nested validation for complex objects

## Usage

```javascript
import { Schema } from './schema.js';

// Define a schema
const userSchema = Schema.object({
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().optional(),
  isActive: Schema.boolean()
});

// Validate data
const userData = {
  name: "John Doe",
  email: "john@example.com",
  isActive: true
};

const result = userSchema.validate(userData);
console.log(result.valid); // true
console.log(result.errors); // []
```

## Running the Project

This project uses Node.js native TypeScript type stripping and test runner without external dependencies.

### Starting the Application

```bash
npm start
```

### Running Tests

Run all tests:

```bash
npm test
```

Run specific test suites:

```bash
npm run test:validators  # Test validator classes
npm run test:schema      # Test schema builder
npm run test:integration # Test integration scenarios
```

## Test Coverage

The test suite includes:

- Unit tests for all validator classes
- Tests for the Schema builder
- Integration tests for complex validation scenarios
- Tests for both valid and invalid inputs
- Edge case handling

## Implementation Details

The library is built with a class hierarchy:

- `Validator<T>`: Base class with common functionality
  - `StringValidator`: For string validation
  - `NumberValidator`: For number validation
  - `BooleanValidator`: For boolean validation
  - `DateValidator`: For Date validation
  - `ObjectValidator<T>`: For object validation with schema
  - `ArrayValidator<T>`: For array validation

The `Schema` class provides a convenient builder API to create validators. 