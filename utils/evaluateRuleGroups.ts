import { evaluateCondition } from './evaluateCondition';
import type {
	Combinator,
	FieldDefault,
	RuleGroup,
	ValidationError,
	ValidationOptions,
	ValidationResult,
} from './types';

function dedupeDefaults(defaults: FieldDefault[]): FieldDefault[] {
	const byField = new Map<string, FieldDefault>();
	for (const entry of defaults) {
		byField.set(entry.field, entry);
	}
	return [...byField.values()];
}

function evaluateGroup(
	group: RuleGroup,
	data: Record<string, unknown>,
	options: ValidationOptions,
): { failures: ValidationError[]; defaults: FieldDefault[] } {
	if (group.conditions.length === 0) {
		return { failures: [], defaults: [] };
	}

	const results = group.conditions.map((condition) =>
		evaluateCondition(condition, data, options),
	);

	const failures = results.filter((result) => !result.pass).map((result) => result.error!);
	const defaults = results
		.filter((result) => result.skipped && result.defaultToApply)
		.map((result) => result.defaultToApply!);

	if (group.groupCombinator === 'and') {
		return { failures, defaults };
	}

	// OR within group: fail only when every condition failed
	if (failures.length === group.conditions.length) {
		return { failures, defaults: [] };
	}

	return { failures: [], defaults };
}

/**
 * Evaluates rule groups. Returns errors when validation fails,
 * and defaults to inject into Valid output when fields were missing.
 */
export function evaluateRuleGroups(
	groups: RuleGroup[],
	groupsCombinator: Combinator,
	data: Record<string, unknown>,
	options: ValidationOptions,
): ValidationResult {
	if (groups.length === 0) {
		return { errors: [], defaults: [] };
	}

	const groupResults = groups.map((group) => evaluateGroup(group, data, options));
	const groupPassed = groupResults.map((result) => result.failures.length === 0);

	let errors: ValidationError[] = [];
	let defaults: FieldDefault[] = [];

	if (groupsCombinator === 'and') {
		if (groupPassed.every(Boolean)) {
			defaults = dedupeDefaults(groupResults.flatMap((r) => r.defaults));
			return { errors: [], defaults };
		}
		errors = groupResults.flatMap((r) => r.failures);
		return { errors, defaults: [] };
	}

	// OR between groups
	if (groupPassed.some(Boolean)) {
		const passedGroups = groupResults.filter((_, i) => groupPassed[i]);
		defaults = dedupeDefaults(passedGroups.flatMap((r) => r.defaults));
		return { errors: [], defaults };
	}

	errors = groupResults.flatMap((r) => r.failures);
	return { errors, defaults: [] };
}
