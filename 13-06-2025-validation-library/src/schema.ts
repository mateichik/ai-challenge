import { 
  Validator, 
  StringValidator, 
  NumberValidator, 
  BooleanValidator, 
  DateValidator, 
  ObjectValidator, 
  ArrayValidator 
} from './validators.ts';

/**
 * Schema builder class for creating validators with a fluent API
 * 
 * This class provides static factory methods to create various validators
 * in a readable and chainable way.
 */
export class Schema {
  /**
   * Creates a string validator
   * @returns A new string validator instance
   */
  static string(): StringValidator {
    return new StringValidator();
  }
  
  /**
   * Creates a number validator
   * @returns A new number validator instance
   */
  static number(): NumberValidator {
    return new NumberValidator();
  }
  
  /**
   * Creates a boolean validator
   * @returns A new boolean validator instance
   */
  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }
  
  /**
   * Creates a date validator
   * @returns A new date validator instance
   */
  static date(): DateValidator {
    return new DateValidator();
  }
  
  /**
   * Creates an object validator with the specified schema
   * @template T - The type of object being validated
   * @param schema - Object describing the validation rules for each property
   * @returns A new object validator instance
   */
  static object<T>(schema: Record<string, Validator<any>>): ObjectValidator<T> {
    return new ObjectValidator<T>(schema);
  }
  
  /**
   * Creates an array validator where each item must pass the specified validator
   * @template T - The type of items in the array
   * @param itemValidator - Validator to apply to each item in the array
   * @returns A new array validator instance
   */
  static array<T>(itemValidator: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(itemValidator);
  }
} 