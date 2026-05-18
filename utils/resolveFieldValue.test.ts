import { describe, expect, it } from 'vitest';

import { resolveFieldValue } from './resolveFieldValue';

describe('resolveFieldValue', () => {
	it('returns field value when present', () => {
		expect(
			resolveFieldValue(
				{ body: { x: 'hello' } },
				{ field: 'body.x', operation: 'isNotEmpty' },
			),
		).toBe('hello');
	});

	it('uses default when path is missing', () => {
		expect(
			resolveFieldValue(
				{ body: {} },
				{
					field: 'body.missing',
					operation: 'isTrue',
					defaultValue: 'true',
				},
			),
		).toBe(true);
	});
});
