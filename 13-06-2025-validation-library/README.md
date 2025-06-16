# Validation Library

A comprehensive validation library for JavaScript/TypeScript objects with a fluent API.

## Features

- String validation (minLength, maxLength, pattern)
- Number validation (min, max, integer)
- Boolean validation
- Date validation (before, after)
- Object validation with schema
- Array validation (minLength, maxLength, unique items)
- Optional fields
- Custom error messages
- Nested validation for complex objects
- Strict/non-strict object validation

## Project Structure

```
validation-library/
├── src/                  # Source code
│   ├── validators.ts     # Core validator classes
│   ├── schema.ts         # Schema builder
│   └── index.ts          # Example usage
├── tests/                # Test files
│   ├── validators.test.ts # Tests for validators
│   ├── schema.test.ts     # Tests for schema builder
│   └── integration.test.ts # Integration tests
├── package.json
├── tsconfig.json
└── README.md
```

## Usage Examples

### Basic Validation

```typescript
import { Schema } from './src/schema.js';

// Define a simple schema
const userSchema = Schema.object({
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().min(18).optional(),
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

### String Validation

```typescript
const stringSchema = Schema.string()
  .minLength(5)
  .maxLength(20)
  .pattern(/^[a-z0-9]+$/i)
  .withMessage('Invalid string format');

// Valid
console.log(stringSchema.validate('validString123').valid); // true

// Invalid - too short
console.log(stringSchema.validate('abc').errors); 
// ['String must be at least 5 characters long']

// Invalid - wrong pattern
console.log(stringSchema.validate('invalid_string!').errors);
// ['Invalid string format']
```

### Number Validation

```typescript
const numberSchema = Schema.number()
  .min(1)
  .max(100)
  .integer();

// Valid
console.log(numberSchema.validate(50).valid); // true

// Invalid - decimal
console.log(numberSchema.validate(50.5).errors); 
// ['Value must be an integer']

// Invalid - out of range
console.log(numberSchema.validate(101).errors);
// ['Value must be at most 100']
```

### Date Validation

```typescript
const dateSchema = Schema.date()
  .after(new Date('2023-01-01'))
  .before(new Date('2023-12-31'));

// Valid
console.log(dateSchema.validate(new Date('2023-06-15')).valid); // true

// Invalid - before minimum date
console.log(dateSchema.validate(new Date('2022-12-31')).errors);
// ['Date must be after 2023-01-01T00:00:00.000Z']
```

### Array Validation

```typescript
const arraySchema = Schema.array(Schema.string())
  .minLength(2)
  .maxLength(5)
  .unique();

// Valid
console.log(arraySchema.validate(['a', 'b', 'c']).valid); // true

// Invalid - duplicate items
console.log(arraySchema.validate(['a', 'a', 'b']).errors);
// ['Array must contain unique items']

// Invalid - too few items
console.log(arraySchema.validate(['a']).errors);
// ['Array must contain at least 2 items']
```

### Nested Object Validation

```typescript
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  zip: Schema.string().pattern(/^\d{5}$/)
});

const userSchema = Schema.object({
  name: Schema.string(),
  addresses: Schema.array(addressSchema)
});

// Valid
const validUser = {
  name: "John",
  addresses: [
    { street: "123 Main St", city: "Anytown", zip: "12345" }
  ]
};

console.log(userSchema.validate(validUser).valid); // true

// Invalid - wrong zip format
const invalidUser = {
  name: "John",
  addresses: [
    { street: "123 Main St", city: "Anytown", zip: "ABC12" }
  ]
};

console.log(userSchema.validate(invalidUser).errors);
// ['addresses: Item at index 0: zip: String does not match the required pattern']
```

### Optional Fields and Custom Messages

```typescript
const profileSchema = Schema.object({
  username: Schema.string().withMessage('Username is required'),
  bio: Schema.string().maxLength(200).optional(),
  website: Schema.string()
    .pattern(/^https?:\/\/\S+$/)
    .optional()
    .withMessage('Website must be a valid URL')
});

// Valid with optional fields
const validProfile = {
  username: "johndoe",
  bio: "Hello, world!"
  // website is omitted
};

console.log(profileSchema.validate(validProfile).valid); // true

// Invalid with custom message
const invalidProfile = {
  username: "", // empty string
  website: "invalid-url"
};

console.log(profileSchema.validate(invalidProfile).errors);
// ['Username is required', 'Website must be a valid URL']
```

### Non-strict Object Validation

```typescript
// By default, object validation is strict and doesn't allow extra fields
const strictSchema = Schema.object({
  name: Schema.string()
});

console.log(strictSchema.validate({ name: "John", extra: "field" }).errors);
// ['Unknown property: extra']

// Allow additional properties
const flexibleSchema = Schema.object({
  name: Schema.string()
}).allowAdditionalProperties();

console.log(flexibleSchema.validate({ name: "John", extra: "field" }).valid); // true
```

## Running the Project

This project uses Node.js native TypeScript type stripping and test runner without external dependencies.

### Starting the Application

```bash
npm start
```

### Building the Project

```bash
npm run build
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

Run tests with coverage reporting:

```bash
npm run test:coverage
```

## Test Coverage

The test suite includes:

- Unit tests for all validator classes
- Tests for the Schema builder
- Integration tests for complex validation scenarios
- Tests for both valid and invalid inputs
- Edge case handling

All tests are written in TypeScript and run directly using Node.js native test runner with type stripping.

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