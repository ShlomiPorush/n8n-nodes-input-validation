export type Combinator = 'and' | 'or';

export type ValidationOperation =
	| 'isEmpty'
	| 'isNotEmpty'
	| 'contains'
	| 'notContains'
	| 'equals'
	| 'notEquals'
	| 'greaterThan'
	| 'lessThan'
	| 'isTrue'
	| 'isFalse'
	| 'isBoolean';

export interface ValidationCondition {
	field: string;
	operation: ValidationOperation;
	value?: string;
	defaultValue?: string;
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

export interface FieldDefault {
	field: string;
	value: unknown;
}

export interface ConditionResult {
	pass: boolean;
	error?: ValidationError;
	/** Condition skipped because the field was missing and a default is configured */
	skipped?: boolean;
	defaultToApply?: FieldDefault;
}

export interface ValidationResult {
	errors: ValidationError[];
	defaults: FieldDefault[];
}
