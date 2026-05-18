export type Combinator = 'and' | 'or';

export type ValidationOperation =
	| 'isEmpty'
	| 'isNotEmpty'
	| 'contains'
	| 'notContains'
	| 'equals'
	| 'notEquals'
	| 'greaterThan'
	| 'lessThan';

export interface ValidationCondition {
	field: string;
	operation: ValidationOperation;
	value?: string;
	errorMessage?: string;
}

export interface RuleGroup {
	groupCombinator: Combinator;
	conditions: ValidationCondition[];
}

export interface ValidationOptions {
	ignoreCase: boolean;
}

export interface ValidationError {
	field: string;
	operation: ValidationOperation;
	message: string;
	received: unknown;
}

export interface ConditionResult {
	pass: boolean;
	error?: ValidationError;
}
