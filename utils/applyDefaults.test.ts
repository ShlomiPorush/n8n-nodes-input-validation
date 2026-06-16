import { describe, expect, it } from 'vitest';

import { applyDefaultsToJson } from './applyDefaults';

describe('applyDefaultsToJson', () => {
	it('adds missing fields to output', () => {
		const result = applyDefaultsToJson(
			{ ClientName: 'Moses', ClientCode: '3135' },
			[{ field: 'Test', value: false }],
		);

		expect(result).toEqual({
			ClientName: 'Moses',
			ClientCode: '3135',
			Test: false,
		});
	});

	it('does not mutate the original object', () => {
		const input = { a: 1 };
		applyDefaultsToJson(input, [{ field: 'b', value: 2 }]);
		expect(input).toEqual({ a: 1 });
	});
});
