import { describe, expect, it } from 'vitest';

import { formatValidationError } from './formatValidationError';
import type { ValidationError } from './types';

describe('formatValidationError', () => {
	it('joins error messages with semicolons', () => {
		const errors: ValidationError[] = [
			{
				field: 'body.email',
				operation: 'isNotEmpty',
				message: 'body.email must not be empty',
				received: null,
			},
			{
				field: 'body.age',
				operation: 'greaterThan',
				message: 'body.age must be greater than 18',
				received: '10',
			},
		];

		expect(formatValidationError(errors)).toBe(
			'body.email must not be empty; body.age must be greater than 18',
		);
	});

	it('returns empty string when there are no errors', () => {
		expect(formatValidationError([])).toBe('');
	});
});
