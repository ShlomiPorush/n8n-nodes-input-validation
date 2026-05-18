import type { Combinator, RuleGroup, ValidationCondition, ValidationOperation } from './types';

interface RawCondition {
	field?: string;
	operation?: ValidationOperation;
	value?: string;
	errorMessage?: string;
}

interface RawGroup {
	groupCombinator?: Combinator;
	conditions?: {
		condition?: RawCondition[];
	};
}

interface RawRuleGroups {
	group?: RawGroup[];
}

export function parseRuleGroups(raw: RawRuleGroups | undefined): RuleGroup[] {
	if (!raw?.group?.length) {
		return [];
	}

	return raw.group.map((group) => ({
		groupCombinator: group.groupCombinator ?? 'and',
		conditions: (group.conditions?.condition ?? [])
			.filter((c): c is RawCondition & { field: string; operation: ValidationOperation } =>
				Boolean(c?.field?.trim() && c?.operation),
			)
			.map(
				(c): ValidationCondition => ({
					field: c.field.trim(),
					operation: c.operation,
					value: c.value,
					errorMessage: c.errorMessage,
				}),
			),
	}));
}
