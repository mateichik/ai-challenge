/**
 * Represents the result of a validation operation
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** List of error messages if validation failed */
  errors: string[];
}

/**
 * Base validator class that all specific validators extend
 * @template T - The type of value being validated
 */
export class Validator<T> {
  /** Custom error message to use instead of default messages */
  protected message: string | null = null;
  
  /** Whether the value is optional (can be undefined or null) */
  protected optionalFlag: boolean = false;

  /**
   * Validates a value against the validator's rules
   * @param value - The value to validate
   * @returns Validation result with valid flag and any error messages
   */
  validate(value: T): ValidationResult {
    return { valid: true, errors: [] };
  }

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
    this.minLen = len;
    return this;
  }

  /**
   * Sets maximum length requirement for the string
   * @param len - Maximum length
   * @returns The validator instance for method chaining
   */
  maxLength(len: number): this {
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
   * @param value - The string to validate
   * @returns Validation result with valid flag and any error messages
   */
  validate(value: string): ValidationResult {
    const errors: string[] = [];
    
    // Handle optional values
    if (this.optionalFlag && (value === undefined || value === null)) {
      return { valid: true, errors };
    }
    
    // Validate type
    if (typeof value !== 'string') {
      errors.push(this.message || 'Value must be a string');
      return { valid: false, errors };
    }
    
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
    
    return { valid: errors.length === 0, errors };
  }
}

/**
 * Validator for number values
 */
export class NumberValidator extends Validator<number> {
  /**
   * Validates a number value
   * @param value - The number to validate
   * @returns Validation result with valid flag and any error messages
   */
  validate(value: number): ValidationResult {
    // Handle optional values
    if (this.optionalFlag && (value === undefined || value === null)) {
      return { valid: true, errors: [] };
    }
    
    // Validate type
    if (typeof value !== 'number') {
      return { valid: false, errors: [this.message || 'Value must be a number'] };
    }
    
    return { valid: true, errors: [] };
  }
}

/**
 * Validator for boolean values
 */
export class BooleanValidator extends Validator<boolean> {
  /**
   * Validates a boolean value
   * @param value - The boolean to validate
   * @returns Validation result with valid flag and any error messages
   */
  validate(value: boolean): ValidationResult {
    // Handle optional values
    if (this.optionalFlag && (value === undefined || value === null)) {
      return { valid: true, errors: [] };
    }
    
    // Validate type
    if (typeof value !== 'boolean') {
      return { valid: false, errors: [this.message || 'Value must be a boolean'] };
    }
    
    return { valid: true, errors: [] };
  }
}

/**
 * Validator for Date objects
 */
export class DateValidator extends Validator<Date> {
  /**
   * Validates a Date object
   * @param value - The Date to validate
   * @returns Validation result with valid flag and any error messages
   */
  validate(value: Date): ValidationResult {
    // Handle optional values
    if (this.optionalFlag && (value === undefined || value === null)) {
      return { valid: true, errors: [] };
    }
    
    // Validate type and date validity
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      return { valid: false, errors: [this.message || 'Value must be a valid Date'] };
    }
    
    return { valid: true, errors: [] };
  }
}

/**
 * Validator for objects with a specified schema
 * @template T - The type of object being validated
 */
export class ObjectValidator<T> extends Validator<T> {
  private schema: Record<string, Validator<any>>;

  /**
   * Creates a new object validator with the given schema
   * @param schema - Object describing the validation rules for each property
   */
  constructor(schema: Record<string, Validator<any>>) {
    super();
    this.schema = schema;
  }

  /**
   * Validates an object against the schema
   * @param value - The object to validate
   * @returns Validation result with valid flag and any error messages
   */
  validate(value: T): ValidationResult {
    const errors: string[] = [];
    
    // Handle optional values
    if (this.optionalFlag && (value === undefined || value === null)) {
      return { valid: true, errors };
    }
    
    // Validate type
    if (typeof value !== 'object' || value === null) {
      return { valid: false, errors: [this.message || 'Value must be an object'] };
    }
    
    // Validate each property against its validator
    for (const [key, validator] of Object.entries(this.schema)) {
      const result = validator.validate((value as any)[key]);
      if (!result.valid) {
        errors.push(...result.errors.map(err => `${key}: ${err}`));
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
}

/**
 * Validator for arrays where each item must pass validation
 * @template T - The type of items in the array
 */
export class ArrayValidator<T> extends Validator<T[]> {
  private itemValidator: Validator<T>;

  /**
   * Creates a new array validator
   * @param itemValidator - Validator to apply to each item in the array
   */
  constructor(itemValidator: Validator<T>) {
    super();
    this.itemValidator = itemValidator;
  }

  /**
   * Validates an array and all its items
   * @param value - The array to validate
   * @returns Validation result with valid flag and any error messages
   */
  validate(value: T[]): ValidationResult {
    const errors: string[] = [];
    
    // Handle optional values
    if (this.optionalFlag && (value === undefined || value === null)) {
      return { valid: true, errors };
    }
    
    // Validate type
    if (!Array.isArray(value)) {
      return { valid: false, errors: [this.message || 'Value must be an array'] };
    }
    
    // Validate each item in the array
    value.forEach((item, index) => {
      const result = this.itemValidator.validate(item);
      if (!result.valid) {
        errors.push(...result.errors.map(err => `Item at index ${index}: ${err}`));
      }
    });
    
    return { valid: errors.length === 0, errors };
  }
} 