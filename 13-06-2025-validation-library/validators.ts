export class Validator<T> {
  protected message: string | null = null;
  protected optionalFlag: boolean = false;

  validate(value: T): { valid: boolean; errors: string[] } {
    return { valid: true, errors: [] };
  }

  optional(): this {
    this.optionalFlag = true;
    return this;
  }

  withMessage(message: string): this {
    this.message = message;
    return this;
  }
}

export class StringValidator extends Validator<string> {
  private minLen: number | null = null;
  private maxLen: number | null = null;
  private patternRegex: RegExp | null = null;

  minLength(len: number): this {
    this.minLen = len;
    return this;
  }

  maxLength(len: number): this {
    this.maxLen = len;
    return this;
  }

  pattern(regex: RegExp): this {
    this.patternRegex = regex;
    return this;
  }

  validate(value: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (this.optionalFlag && (value === undefined || value === null)) {
      return { valid: true, errors };
    }
    if (typeof value !== 'string') {
      errors.push(this.message || 'Value must be a string');
      return { valid: false, errors };
    }
    if (this.minLen !== null && value.length < this.minLen) {
      errors.push(this.message || `String must be at least ${this.minLen} characters long`);
    }
    if (this.maxLen !== null && value.length > this.maxLen) {
      errors.push(this.message || `String must be at most ${this.maxLen} characters long`);
    }
    if (this.patternRegex !== null && !this.patternRegex.test(value)) {
      errors.push(this.message || 'String does not match the required pattern');
    }
    return { valid: errors.length === 0, errors };
  }
}

export class NumberValidator extends Validator<number> {
  validate(value: number): { valid: boolean; errors: string[] } {
    if (this.optionalFlag && (value === undefined || value === null)) {
      return { valid: true, errors: [] };
    }
    if (typeof value !== 'number') {
      return { valid: false, errors: [this.message || 'Value must be a number'] };
    }
    return { valid: true, errors: [] };
  }
}

export class BooleanValidator extends Validator<boolean> {
  validate(value: boolean): { valid: boolean; errors: string[] } {
    if (this.optionalFlag && (value === undefined || value === null)) {
      return { valid: true, errors: [] };
    }
    if (typeof value !== 'boolean') {
      return { valid: false, errors: [this.message || 'Value must be a boolean'] };
    }
    return { valid: true, errors: [] };
  }
}

export class DateValidator extends Validator<Date> {
  validate(value: Date): { valid: boolean; errors: string[] } {
    if (this.optionalFlag && (value === undefined || value === null)) {
      return { valid: true, errors: [] };
    }
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      return { valid: false, errors: [this.message || 'Value must be a valid Date'] };
    }
    return { valid: true, errors: [] };
  }
}

export class ObjectValidator<T> extends Validator<T> {
  private schema: Record<string, Validator<any>>;

  constructor(schema: Record<string, Validator<any>>) {
    super();
    this.schema = schema;
  }

  validate(value: T): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (this.optionalFlag && (value === undefined || value === null)) {
      return { valid: true, errors };
    }
    if (typeof value !== 'object' || value === null) {
      return { valid: false, errors: [this.message || 'Value must be an object'] };
    }
    for (const [key, validator] of Object.entries(this.schema)) {
      const result = validator.validate((value as any)[key]);
      if (!result.valid) {
        errors.push(...result.errors.map(err => `${key}: ${err}`));
      }
    }
    return { valid: errors.length === 0, errors };
  }
}

export class ArrayValidator<T> extends Validator<T[]> {
  private itemValidator: Validator<T>;

  constructor(itemValidator: Validator<T>) {
    super();
    this.itemValidator = itemValidator;
  }

  validate(value: T[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (this.optionalFlag && (value === undefined || value === null)) {
      return { valid: true, errors };
    }
    if (!Array.isArray(value)) {
      return { valid: false, errors: [this.message || 'Value must be an array'] };
    }
    value.forEach((item, index) => {
      const result = this.itemValidator.validate(item);
      if (!result.valid) {
        errors.push(...result.errors.map(err => `Item at index ${index}: ${err}`));
      }
    });
    return { valid: errors.length === 0, errors };
  }
} 