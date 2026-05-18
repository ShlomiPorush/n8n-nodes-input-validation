import { evaluateCondition } from './evaluateCondition';
import type {
	Combinator,
	RuleGroup,
	ValidationError,
	ValidationOptions,
} from './types';

function evaluateGroup(
	group: RuleGroup,
	data: Record<string, unknown>,
	options: ValidationOptions,
): ValidationError[] {
	if (group.conditions.length === 0) {
		return [];
	}

	const failures = group.conditions
		.map((condition) => evaluateCondition(condition, data, options))
		.filter((result) => !result.pass)
		.map((result) => result.error!);

	if (group.groupCombinator === 'and') {
		return failures;
	}

	// OR within group: fail only when every condition failed
	return failures.length === group.conditions.length ? failures : [];
}

/**
 * Evaluates rule groups with a top-level combinator.
 * Returns an empty array when validation passes.
 */
export function evaluateRuleGroups(
	groups: RuleGroup[],
	groupsCombinator: Combinator,
	data: Record<string, unknown>,
	options: ValidationOptions,
): ValidationError[] {
	if (groups.length === 0) {
		return [];
	}

	const groupFailures = groups.map((group) => evaluateGroup(group, data, options));
	const groupPassed = groupFailures.map((failures) => failures.length === 0);

	if (groupsCombinator === 'and') {
		if (groupPassed.every(Boolean)) {
			return [];
		}
		return groupFailures.flat();
	}

	// OR between groups: pass if at least one group passed
	if (groupPassed.some(Boolean)) {
		return [];
	}

	return groupFailures.flat();
}
