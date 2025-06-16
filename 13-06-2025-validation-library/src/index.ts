import { Schema } from './schema.ts';

/**
 * Comprehensive examples of validation library usage
 * 
 * This file demonstrates the full range of capabilities offered by the validation library,
 * including all validator types and features.
 */

console.log('============= Basic Validation Examples =============');

// 1. String Validation
const stringSchema = Schema.string()
  .minLength(5)
  .maxLength(20)
  .pattern(/^[a-z0-9]+$/i);

console.log('\n--- String Validation ---');
console.log('Valid string:', stringSchema.validate('validString123'));
console.log('Too short:', stringSchema.validate('abc'));
console.log('Invalid pattern:', stringSchema.validate('invalid_string!'));

// 2. Number Validation
const numberSchema = Schema.number()
  .min(1)
  .max(100)
  .integer();

console.log('\n--- Number Validation ---');
console.log('Valid number:', numberSchema.validate(50));
console.log('Decimal (invalid):', numberSchema.validate(50.5));
console.log('Out of range:', numberSchema.validate(101));
console.log('Not a number:', numberSchema.validate('50'));

// 3. Boolean Validation
const booleanSchema = Schema.boolean();

console.log('\n--- Boolean Validation ---');
console.log('Valid boolean:', booleanSchema.validate(true));
console.log('Invalid type:', booleanSchema.validate('true'));

// 4. Date Validation
const dateSchema = Schema.date()
  .after(new Date('2023-01-01'))
  .before(new Date('2023-12-31'));

console.log('\n--- Date Validation ---');
console.log('Valid date:', dateSchema.validate(new Date('2023-06-15')));
console.log('Before min date:', dateSchema.validate(new Date('2022-12-31')));
console.log('After max date:', dateSchema.validate(new Date('2024-01-01')));
console.log('Invalid type:', dateSchema.validate('2023-06-15'));

// 5. Array Validation
const arraySchema = Schema.array(Schema.string())
  .minLength(2)
  .maxLength(5)
  .unique();

console.log('\n--- Array Validation ---');
console.log('Valid array:', arraySchema.validate(['a', 'b', 'c']));
console.log('Duplicate items:', arraySchema.validate(['a', 'a', 'b']));
console.log('Too few items:', arraySchema.validate(['a']));
console.log('Too many items:', arraySchema.validate(['a', 'b', 'c', 'd', 'e', 'f']));
console.log('Invalid item type:', arraySchema.validate(['a', 1, 'c']));

console.log('\n============= Advanced Validation Examples =============');

// 6. Object with Nested Validation
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
  country: Schema.string()
});

const nestedUserSchema = Schema.object({
  name: Schema.string().minLength(2),
  primaryAddress: addressSchema,
  additionalAddresses: Schema.array(addressSchema).optional()
});

console.log('\n--- Nested Object Validation ---');

const validNestedUser = {
  name: 'John Doe',
  primaryAddress: {
    street: '123 Main St',
    city: 'Anytown',
    postalCode: '12345',
    country: 'USA'
  },
  additionalAddresses: [
    {
      street: '456 Second St',
      city: 'Othertown',
      postalCode: '67890',
      country: 'USA'
    }
  ]
};

const invalidNestedUser = {
  name: 'J', // too short
  primaryAddress: {
    street: '123 Main St',
    city: 'Anytown',
    postalCode: 'ABC12', // invalid format
    country: 'USA'
  }
};

console.log('Valid nested user:', nestedUserSchema.validate(validNestedUser));
console.log('Invalid nested user:', nestedUserSchema.validate(invalidNestedUser));

// 7. Optional Fields
const profileSchema = Schema.object({
  username: Schema.string(),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  bio: Schema.string().maxLength(200).optional(),
  website: Schema.string().pattern(/^https?:\/\/\S+$/).optional()
});

console.log('\n--- Optional Fields ---');

const profileWithOptional = {
  username: 'johndoe',
  email: 'john@example.com',
  bio: 'Hello, world!',
  website: 'https://example.com'
};

const profileWithoutOptional = {
  username: 'johndoe',
  email: 'john@example.com'
  // bio and website are omitted
};

console.log('With optional fields:', profileSchema.validate(profileWithOptional));
console.log('Without optional fields:', profileSchema.validate(profileWithoutOptional));

// 8. Custom Error Messages
const userWithCustomMessages = Schema.object({
  username: Schema.string().minLength(3).withMessage('Username must have at least 3 characters'),
  password: Schema.string()
    .minLength(8)
    .pattern(/[A-Z]/)
    .pattern(/[0-9]/)
    .withMessage('Password must be at least 8 characters with at least one uppercase letter and one number')
});

console.log('\n--- Custom Error Messages ---');

const invalidUser = {
  username: 'ab',
  password: 'password'
};

console.log('Invalid user with custom messages:', userWithCustomMessages.validate(invalidUser));

// 9. Non-strict Object Validation
const strictSchema = Schema.object({
  name: Schema.string(),
  email: Schema.string()
});

const nonStrictSchema = Schema.object({
  name: Schema.string(),
  email: Schema.string()
}).allowAdditionalProperties();

const userWithExtraProps = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30, // extra property
  role: 'admin' // extra property
};

console.log('\n--- Strict vs Non-strict Object Validation ---');
console.log('Strict schema (rejects extra properties):', strictSchema.validate(userWithExtraProps));
console.log('Non-strict schema (allows extra properties):', nonStrictSchema.validate(userWithExtraProps));

// 10. Complex, Real-world Example
console.log('\n============= Complex Real-world Example =============');

// Define schemas for a blog post system
const tagSchema = Schema.string().minLength(2).maxLength(20);

const commentSchema = Schema.object({
  id: Schema.string(),
  author: Schema.object({
    name: Schema.string(),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).optional()
  }),
  content: Schema.string().minLength(1).maxLength(1000),
  createdAt: Schema.date(),
  likes: Schema.number().min(0).integer()
});

const postSchema = Schema.object({
  id: Schema.string(),
  title: Schema.string().minLength(5).maxLength(100),
  content: Schema.string().minLength(10),
  author: Schema.object({
    id: Schema.string(),
    name: Schema.string(),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    bio: Schema.string().optional()
  }),
  tags: Schema.array(tagSchema).minLength(1).unique(),
  published: Schema.boolean(),
  createdAt: Schema.date(),
  updatedAt: Schema.date().optional(),
  comments: Schema.array(commentSchema).optional(),
  metadata: Schema.object({}).allowAdditionalProperties()
});

// Valid blog post
const validPost = {
  id: '12345',
  title: 'Understanding JavaScript Validation',
  content: 'This is a comprehensive guide to validation in JavaScript...',
  author: {
    id: 'author-1',
    name: 'John Smith',
    email: 'john@example.com',
    bio: 'Software engineer and blogger'
  },
  tags: ['javascript', 'validation', 'tutorial'],
  published: true,
  createdAt: new Date(),
  comments: [
    {
      id: 'comment-1',
      author: { name: 'Alice' },
      content: 'Great article!',
      createdAt: new Date(),
      likes: 5
    },
    {
      id: 'comment-2',
      author: { name: 'Bob', email: 'bob@example.com' },
      content: 'Thanks for sharing.',
      createdAt: new Date(),
      likes: 3
    }
  ],
  metadata: {
    views: 1250,
    avgTimeOnPage: '2:30',
    categories: ['programming', 'web development']
  }
};

// Invalid blog post with multiple errors
const invalidPost = {
  id: '12345',
  title: 'JS', // too short
  content: 'Too short', // too short
  author: {
    id: 'author-1',
    name: 'John Smith',
    email: 'invalid-email' // invalid email format
    // missing bio is ok, it's optional
  },
  tags: ['javascript', 'javascript'], // duplicate tag
  published: 'yes', // not a boolean
  createdAt: new Date(),
  comments: [
    {
      id: 'comment-1',
      author: { name: 'Alice' },
      content: 'Great article!',
      createdAt: 'yesterday', // not a Date
      likes: -5 // negative number
    }
  ]
  // Missing metadata is not an error since it's an empty object anyway
};

console.log('\n--- Blog Post Validation ---');
console.log('Valid post:', postSchema.validate(validPost));
console.log('Invalid post:', postSchema.validate(invalidPost));

// Display overall validation library capabilities summary
console.log('\n============= Validation Library Capabilities =============');
console.log(`
This validation library provides:

1. Type validation: strings, numbers, booleans, dates, objects, arrays
2. String validation: minLength, maxLength, pattern (regex)
3. Number validation: min, max, integer
4. Date validation: before, after
5. Array validation: item type, minLength, maxLength, unique items
6. Object validation: schema-based, strict/non-strict mode
7. Optional fields
8. Custom error messages
9. Nested validation for complex objects
10. Detailed error reporting
`); 