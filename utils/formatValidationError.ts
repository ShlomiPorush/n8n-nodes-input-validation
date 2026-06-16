import type { ValidationError } from './types';

/**
 * Builds a single plain-text error string from validation failures.
 * Example: "body.email must not be empty; body.age must be greater than 18"
 */
export function formatValidationError(errors: ValidationError[]): string {
	return errors.map((e) => e.message).join('; ');
}
