/**
 * Represents the result of a validation operation
 */
export interface ValidationResult {
  /** Whether the validation passed */
  readonly valid: boolean;
  /** List of error messages if validation failed */
  readonly errors: readonly string[];
}

/**
 * Type for values that can be optional (undefined or null)
 */
export type Optional<T> = T | undefined | null;

/**
 * Base validator class that all specific validators extend
 * @template T - The type of value being validated
 */
export abstract class Validator<T> {
  /** Custom error message to use instead of default messages */
  protected message: string | null = null;
  
  /** Whether the value is optional (can be undefined or null) */
  protected optionalFlag = false;

  /**
   * Validates a value against the validator's rules
   * @param value - The value to validate
   * @returns Validation result with valid flag and any error messages
   */
  abstract validate(value: unknown): ValidationResult;

  /**
   * Makes the field optional (allows undefined or null)
   * @returns The validator instance for method chaining
   */
  optional(): this {
    this.optionalFlag = true;
    return this;
  }

  /**
   * Sets a custom error message to use instead of default messages
   * @param message - The custom error message
   * @returns The validator instance for method chaining
   */
  withMessage(message: string): this {
    this.message = message;
    return this;
  }

  /**
   * Helper method to create a successful validation result
   * @returns A successful validation result
   */
  protected createSuccess(): ValidationResult {
    return Object.freeze({ valid: true, errors: Object.freeze([]) });
  }

  /**
   * Helper method to create a failed validation result
   * @param errors - The error messages
   * @returns A failed validation result
   */
  protected createError(errors: string[]): ValidationResult {
    return Object.freeze({ valid: false, errors: Object.freeze([...errors]) });
  }

  /**
   * Helper method to handle optional values
   * @param value - The value to check
   * @returns True if the value is optional and undefined/null
   */
  protected isOptionalAndEmpty(value: unknown): boolean {
    return this.optionalFlag && (value === undefined || value === null);
  }
}

/**
 * Validator for string values with options for length and pattern validation
 */
export class StringValidator extends Validator<string> {
  private minLen: number | null = null;
  private maxLen: number | null = null;
  private patternRegex: RegExp | null = null;

  /**
   * Sets minimum length requirement for the string
   * @param len - Minimum length
   * @returns The validator instance for method chaining
   */
  minLength(len: number): this {
    if (len < 0) {
      throw new Error('Minimum length cannot be negative');
    }
    this.minLen = len;
    return this;
  }

  /**
   * Sets maximum length requirement for the string
   * @param len - Maximum length
   * @returns The validator instance for method chaining
   */
  maxLength(len: number): this {
    if (len < 0) {
      throw new Error('Maximum length cannot be negative');
    }
    if (this.minLen !== null && len < this.minLen) {
      throw new Error('Maximum length cannot be less than minimum length');
    }
    this.maxLen = len;
    return this;
  }

  /**
   * Sets a regex pattern that the string must match
   * @param regex - Regular expression pattern
   * @returns The validator instance for method chaining
   */
  pattern(regex: RegExp): this {
    this.patternRegex = regex;
    return this;
  }

  /**
   * Validates a string value against all configured rules
   * @param value - The value to validate
   * @returns Validation result with valid flag and any error messages
   */
  validate(value: unknown): ValidationResult {
    // Handle optional values
    if (this.isOptionalAndEmpty(value)) {
      return this.createSuccess();
    }
    
    // Validate type
    if (typeof value !== 'string') {
      return this.createError([this.message || 'Value must be a string']);
    }
    
    const errors: string[] = [];
    
    // Validate minimum length
    if (this.minLen !== null && value.length < this.minLen) {
      errors.push(this.message || `String must be at least ${this.minLen} characters long`);
    }
    
    // Validate maximum length
    if (this.maxLen !== null && value.length > this.maxLen) {
      errors.push(this.message || `String must be at most ${this.maxLen} characters long`);
    }
    
    // Validate pattern
    if (this.patternRegex !== null && !this.patternRegex.test(value)) {
      errors.push(this.message || 'String does not match the required pattern');
    }
    
    return errors.length === 0 ? this.createSuccess() : this.createError(errors);
  }
}

/**
 * Validator for number values
 */
export class NumberValidator extends Validator<number> {
  private minValue: number | null = null;
  private maxValue: number | null = null;
  private integerOnly = false;

  /**
   * Sets minimum value requirement
   * @param min - Minimum value
   * @returns The validator instance for method chaining
   */
  min(min: number): this {
    this.minValue = min;
    return this;
  }

  /**
   * Sets maximum value requirement
   * @param max - Maximum value
   * @returns The validator instance for method chaining
   */
  max(max: number): this {
    if (this.minValue !== null && max < this.minValue) {
      throw new Error('Maximum value cannot be less than minimum value');
    }
    this.maxValue = max;
    return this;
  }

  /**
   * Requires the number to be an integer
   * @returns The validator instance for method chaining
   */
  integer(): this {
    this.integerOnly = true;
    return this;
  }

  /**
   * Validates a number value
   * @param value - The value to validate
   * @returns Validation result with valid flag and any error messages
   */
  validate(value: unknown): ValidationResult {
    // Handle optional values
    if (this.isOptionalAndEmpty(value)) {
      return this.createSuccess();
    }
    
    // Validate type
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return this.createError([this.message || 'Value must be a number']);
    }

    const errors: string[] = [];
    
    // Validate integer requirement
    if (this.integerOnly && !Number.isInteger(value)) {
      errors.push(this.message || 'Value must be an integer');
    }
    
    // Validate minimum value
    if (this.minValue !== null && value < this.minValue) {
      errors.push(this.message || `Value must be at least ${this.minValue}`);
    }
    
    // Validate maximum value
    if (this.maxValue !== null && value > this.maxValue) {
      errors.push(this.message || `Value must be at most ${this.maxValue}`);
    }
    
    return errors.length === 0 ? this.createSuccess() : this.createError(errors);
  }
}

/**
 * Validator for boolean values
 */
export class BooleanValidator extends Validator<boolean> {
  /**
   * Validates a boolean value
   * @param value - The value to validate
   * @returns Validation result with valid flag and any error messages
   */
  validate(value: unknown): ValidationResult {
    // Handle optional values
    if (this.isOptionalAndEmpty(value)) {
      return this.createSuccess();
    }
    
    // Validate type
    if (typeof value !== 'boolean') {
      return this.createError([this.message || 'Value must be a boolean']);
    }
    
    return this.createSuccess();
  }
}

/**
 * Validator for Date objects
 */
export class DateValidator extends Validator<Date> {
  private minDate: Date | null = null;
  private maxDate: Date | null = null;

  /**
   * Sets minimum date requirement
   * @param date - Minimum date
   * @returns The validator instance for method chaining
   */
  after(date: Date): this {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Invalid date provided for after()');
    }
    this.minDate = new Date(date);
    return this;
  }

  /**
   * Sets maximum date requirement
   * @param date - Maximum date
   * @returns The validator instance for method chaining
   */
  before(date: Date): this {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Invalid date provided for before()');
    }
    this.maxDate = new Date(date);
    return this;
  }

  /**
   * Validates a Date object
   * @param value - The value to validate
   * @returns Validation result with valid flag and any error messages
   */
  validate(value: unknown): ValidationResult {
    // Handle optional values
    if (this.isOptionalAndEmpty(value)) {
      return this.createSuccess();
    }
    
    // Validate type and date validity
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      return this.createError([this.message || 'Value must be a valid Date']);
    }

    const errors: string[] = [];
    
    // Validate minimum date
    if (this.minDate !== null && value < this.minDate) {
      errors.push(this.message || `Date must be after ${this.minDate.toISOString()}`);
    }
    
    // Validate maximum date
    if (this.maxDate !== null && value > this.maxDate) {
      errors.push(this.message || `Date must be before ${this.maxDate.toISOString()}`);
    }
    
    return errors.length === 0 ? this.createSuccess() : this.createError(errors);
  }
}

/**
 * Validator for objects with a specified schema
 * @template T - The type of object being validated
 */
export class ObjectValidator<T extends Record<string, unknown>> extends Validator<T> {
  private readonly schema: Record<string, Validator<unknown>>;
  private strictMode = true;

  /**
   * Creates a new object validator with the given schema
   * @param schema - Object describing the validation rules for each property
   */
  constructor(schema: Record<string, Validator<unknown>>) {
    super();
    this.schema = { ...schema };
  }

  /**
   * Allows additional properties not defined in the schema
   * @returns The validator instance for method chaining
   */
  allowAdditionalProperties(): this {
    this.strictMode = false;
    return this;
  }

  /**
   * Validates an object against the schema
   * @param value - The value to validate
   * @returns Validation result with valid flag and any error messages
   */
  validate(value: unknown): ValidationResult {
    // Handle optional values
    if (this.isOptionalAndEmpty(value)) {
      return this.createSuccess();
    }
    
    // Validate type
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return this.createError([this.message || 'Value must be an object']);
    }
    
    const errors: string[] = [];
    const objectValue = value as Record<string, unknown>;
    
    // Check for required properties and validate each property
    for (const [key, validator] of Object.entries(this.schema)) {
      const result = validator.validate(objectValue[key]);
      if (!result.valid) {
        errors.push(...result.errors.map(err => `${key}: ${err}`));
      }
    }
    
    // In strict mode, check for additional properties
    if (this.strictMode) {
      const schemaKeys = new Set(Object.keys(this.schema));
      for (const key of Object.keys(objectValue)) {
        if (!schemaKeys.has(key)) {
          errors.push(`Unknown property: ${key}`);
        }
      }
    }
    
    return errors.length === 0 ? this.createSuccess() : this.createError(errors);
  }
}

/**
 * Validator for arrays where each item must pass validation
 * @template T - The type of items in the array
 */
export class ArrayValidator<T> extends Validator<T[]> {
  private readonly itemValidator: Validator<T>;
  private minItems: number | null = null;
  private maxItems: number | null = null;
  private uniqueItems = false;

  /**
   * Creates a new array validator
   * @param itemValidator - Validator to apply to each item in the array
   */
  constructor(itemValidator: Validator<T>) {
    super();
    this.itemValidator = itemValidator;
  }

  /**
   * Sets minimum length requirement for the array
   * @param min - Minimum number of items
   * @returns The validator instance for method chaining
   */
  minLength(min: number): this {
    if (min < 0) {
      throw new Error('Minimum length cannot be negative');
    }
    this.minItems = min;
    return this;
  }

  /**
   * Sets maximum length requirement for the array
   * @param max - Maximum number of items
   * @returns The validator instance for method chaining
   */
  maxLength(max: number): this {
    if (max < 0) {
      throw new Error('Maximum length cannot be negative');
    }
    if (this.minItems !== null && max < this.minItems) {
      throw new Error('Maximum length cannot be less than minimum length');
    }
    this.maxItems = max;
    return this;
  }

  /**
   * Requires all items in the array to be unique
   * @returns The validator instance for method chaining
   */
  unique(): this {
    this.uniqueItems = true;
    return this;
  }

  /**
   * Validates an array and all its items
   * @param value - The value to validate
   * @returns Validation result with valid flag and any error messages
   */
  validate(value: unknown): ValidationResult {
    // Handle optional values
    if (this.isOptionalAndEmpty(value)) {
      return this.createSuccess();
    }
    
    // Validate type
    if (!Array.isArray(value)) {
      return this.createError([this.message || 'Value must be an array']);
    }
    
    const errors: string[] = [];
    
    // Validate array length
    if (this.minItems !== null && value.length < this.minItems) {
      errors.push(this.message || `Array must contain at least ${this.minItems} items`);
    }
    
    if (this.maxItems !== null && value.length > this.maxItems) {
      errors.push(this.message || `Array must contain at most ${this.maxItems} items`);
    }
    
    // Validate uniqueness
    if (this.uniqueItems && new Set(value).size !== value.length) {
      errors.push(this.message || 'Array must contain unique items');
    }
    
    // Validate each item in the array
    value.forEach((item, index) => {
      const result = this.itemValidator.validate(item);
      if (!result.valid) {
        errors.push(...result.errors.map(err => `Item at index ${index}: ${err}`));
      }
    });
    
    return errors.length === 0 ? this.createSuccess() : this.createError(errors);
  }
} 