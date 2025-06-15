import { Validator, StringValidator, NumberValidator, BooleanValidator, DateValidator, ObjectValidator, ArrayValidator } from './validators.ts';

// Schema Builder
export class Schema {
  static string(): StringValidator {
    return new StringValidator();
  }
  
  static number(): NumberValidator {
    return new NumberValidator();
  }
  
  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }
  
  static date(): DateValidator {
    return new DateValidator();
  }
  
  static object<T>(schema: Record<string, Validator<any>>): ObjectValidator<T> {
    return new ObjectValidator<T>(schema);
  }
  
  static array<T>(itemValidator: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(itemValidator);
  }
} 