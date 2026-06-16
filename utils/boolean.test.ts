import { describe, expect, it } from 'vitest';

import { isBooleanValue, toBoolean } from './boolean';

describe('toBoolean', () => {
	it('accepts boolean and common string/number forms', () => {
		expect(toBoolean(true)).toBe(true);
		expect(toBoolean(false)).toBe(false);
		expect(toBoolean('true')).toBe(true);
		expect(toBoolean('FALSE')).toBe(false);
		expect(toBoolean('1')).toBe(true);
		expect(toBoolean(0)).toBe(false);
	});

	it('returns null for invalid values', () => {
		expect(toBoolean('yes')).toBeNull();
		expect(toBoolean(2)).toBeNull();
		expect(toBoolean(null)).toBeNull();
	});
});

describe('isBooleanValue', () => {
	it('detects valid booleans', () => {
		expect(isBooleanValue(true)).toBe(true);
		expect(isBooleanValue('false')).toBe(true);
		expect(isBooleanValue('maybe')).toBe(false);
	});
});
