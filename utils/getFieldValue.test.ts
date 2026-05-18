import { describe, expect, it } from 'vitest';

import { getFieldValue } from './getFieldValue';

describe('getFieldValue', () => {
	it('reads nested paths', () => {
		const data = {
			body: { user: { email: 'a@b.com' } },
			query: { page: '2' },
		};

		expect(getFieldValue(data, 'body.user.email')).toBe('a@b.com');
		expect(getFieldValue(data, 'query.page')).toBe('2');
	});

	it('returns undefined for missing paths', () => {
		const data = { body: {} };
		expect(getFieldValue(data, 'body.email')).toBeUndefined();
		expect(getFieldValue(data, 'headers.authorization')).toBeUndefined();
	});

	it('returns undefined for empty path', () => {
		expect(getFieldValue({ a: 1 }, '')).toBeUndefined();
		expect(getFieldValue({ a: 1 }, '   ')).toBeUndefined();
	});
});
