import { describe, expect, it } from 'vitest';

import { evaluateRuleGroups } from './evaluateRuleGroups';
import type { RuleGroup } from './types';

const options = { ignoreCase: true };

const data = {
	body: { email: 'a@b.com', age: '25' },
	query: { type: 'premium' },
};

describe('evaluateRuleGroups', () => {
	it('AND within group requires all conditions', () => {
		const groups: RuleGroup[] = [
			{
				groupCombinator: 'and',
				conditions: [
					{ field: 'body.email', operation: 'isNotEmpty' },
					{ field: 'body.age', operation: 'greaterThan', value: '18' },
				],
			},
		];

		expect(evaluateRuleGroups(groups, 'and', data, options)).toEqual([]);
	});

	it('OR within group passes when any condition passes', () => {
		const groups: RuleGroup[] = [
			{
				groupCombinator: 'or',
				conditions: [
					{ field: 'query.type', operation: 'equals', value: 'enterprise' },
					{ field: 'query.type', operation: 'equals', value: 'premium' },
				],
			},
		];

		expect(evaluateRuleGroups(groups, 'and', data, options)).toEqual([]);
	});

	it('OR between groups: (email AND age) OR (premium OR enterprise)', () => {
		const groups: RuleGroup[] = [
			{
				groupCombinator: 'and',
				conditions: [
					{ field: 'body.email', operation: 'isNotEmpty' },
					{ field: 'body.age', operation: 'greaterThan', value: '18' },
				],
			},
			{
				groupCombinator: 'or',
				conditions: [
					{ field: 'query.type', operation: 'equals', value: 'premium' },
					{ field: 'query.type', operation: 'equals', value: 'enterprise' },
				],
			},
		];

		expect(evaluateRuleGroups(groups, 'or', data, options)).toEqual([]);
	});

	it('returns errors when validation fails', () => {
		const groups: RuleGroup[] = [
			{
				groupCombinator: 'and',
				conditions: [{ field: 'body.missing', operation: 'isNotEmpty' }],
			},
		];

		const errors = evaluateRuleGroups(groups, 'and', data, options);
		expect(errors.length).toBe(1);
		expect(errors[0].field).toBe('body.missing');
	});
});
