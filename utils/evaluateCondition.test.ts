import { describe, expect, it } from 'vitest';

import { evaluateCondition, isEmptyValue } from './evaluateCondition';
import type { ValidationCondition } from './types';

const options = { ignoreCase: true };

function condition(
	overrides: Partial<ValidationCondition> & Pick<ValidationCondition, 'field' | 'operation'>,
): ValidationCondition {
	return {
		value: '',
		...overrides,
	};
}

describe('isEmptyValue', () => {
	it('detects empty values', () => {
		expect(isEmptyValue(null)).toBe(true);
		expect(isEmptyValue(undefined)).toBe(true);
		expect(isEmptyValue('')).toBe(true);
		expect(isEmptyValue([])).toBe(true);
		expect(isEmptyValue('x')).toBe(false);
		expect(isEmptyValue(0)).toBe(false);
	});
});

describe('evaluateCondition', () => {
	const data = {
		body: { email: 'Test@Example.com', age: '21', note: '' },
		query: { type: 'premium' },
	};

	it('isEmpty / isNotEmpty', () => {
		expect(
			evaluateCondition(condition({ field: 'body.note', operation: 'isEmpty' }), data, options)
				.pass,
		).toBe(true);
		expect(
			evaluateCondition(condition({ field: 'body.email', operation: 'isNotEmpty' }), data, options)
				.pass,
		).toBe(true);
	});

	it('contains / notContains with ignoreCase', () => {
		expect(
			evaluateCondition(
				condition({ field: 'body.email', operation: 'contains', value: 'example' }),
				data,
				options,
			).pass,
		).toBe(true);
		expect(
			evaluateCondition(
				condition({ field: 'body.email', operation: 'notContains', value: 'missing' }),
				data,
				options,
			).pass,
		).toBe(true);
	});

	it('equals / notEquals', () => {
		expect(
			evaluateCondition(
				condition({ field: 'query.type', operation: 'equals', value: 'premium' }),
				data,
				options,
			).pass,
		).toBe(true);
		expect(
			evaluateCondition(
				condition({ field: 'query.type', operation: 'notEquals', value: 'basic' }),
				data,
				options,
			).pass,
		).toBe(true);
	});

	it('greaterThan / lessThan', () => {
		expect(
			evaluateCondition(
				condition({ field: 'body.age', operation: 'greaterThan', value: '18' }),
				data,
				options,
			).pass,
		).toBe(true);
		expect(
			evaluateCondition(
				condition({ field: 'body.age', operation: 'lessThan', value: '30' }),
				data,
				options,
			).pass,
		).toBe(true);
	});

	it('fails numeric comparison with clear message', () => {
		const result = evaluateCondition(
			condition({ field: 'body.email', operation: 'greaterThan', value: '10' }),
			data,
			options,
		);
		expect(result.pass).toBe(false);
		expect(result.error?.message).toContain('numeric comparison');
	});

	it('isTrue / isFalse / isBoolean', () => {
		const boolData = { body: { active: true, deleted: false, flag: 'true' } };

		expect(
			evaluateCondition(condition({ field: 'body.active', operation: 'isTrue' }), boolData, options)
				.pass,
		).toBe(true);
		expect(
			evaluateCondition(
				condition({ field: 'body.deleted', operation: 'isFalse' }),
				boolData,
				options,
			).pass,
		).toBe(true);
		expect(
			evaluateCondition(condition({ field: 'body.flag', operation: 'isBoolean' }), boolData, options)
				.pass,
		).toBe(true);
	});

	it('applies default value when field is missing', () => {
		const missing = { body: {} };

		expect(
			evaluateCondition(
				condition({
					field: 'body.accepted',
					operation: 'isTrue',
					defaultValue: 'false',
				}),
				missing,
				options,
			).pass,
		).toBe(false);

		expect(
			evaluateCondition(
				condition({
					field: 'body.accepted',
					operation: 'isTrue',
					defaultValue: 'true',
				}),
				missing,
				options,
			).pass,
		).toBe(true);
	});
});
