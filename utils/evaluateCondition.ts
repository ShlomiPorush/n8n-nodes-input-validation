import { isBooleanValue, toBoolean } from './boolean';
import { resolveFieldValue } from './resolveFieldValue';
import type {
	ConditionResult,
	ValidationCondition,
	ValidationError,
	ValidationOperation,
	ValidationOptions,
} from './types';

export function isEmptyValue(value: unknown): boolean {
	if (value === null || value === undefined) {
		return true;
	}

	if (typeof value === 'string' && value === '') {
		return true;
	}

	if (Array.isArray(value) && value.length === 0) {
		return true;
	}

	return false;
}

function toComparableString(value: unknown, ignoreCase: boolean): string {
	const str = value === null || value === undefined ? '' : String(value);
	return ignoreCase ? str.toLowerCase() : str;
}

function toNumber(value: unknown): number | null {
	if (typeof value === 'number' && !Number.isNaN(value)) {
		return value;
	}

	if (typeof value === 'string' && value.trim() !== '') {
		const parsed = Number(value);
		if (!Number.isNaN(parsed)) {
			return parsed;
		}
	}

	return null;
}

function defaultMessage(
	field: string,
	operation: ValidationOperation,
	expected?: string,
): string {
	const messages: Record<ValidationOperation, string> = {
		isEmpty: `${field} must be empty`,
		isNotEmpty: `${field} must not be empty`,
		contains: `${field} must contain "${expected ?? ''}"`,
		notContains: `${field} must not contain "${expected ?? ''}"`,
		equals: `${field} must equal "${expected ?? ''}"`,
		notEquals: `${field} must not equal "${expected ?? ''}"`,
		greaterThan: `${field} must be greater than ${expected ?? ''}`,
		lessThan: `${field} must be less than ${expected ?? ''}`,
		isTrue: `${field} must be true`,
		isFalse: `${field} must be false`,
		isBoolean: `${field} must be true or false`,
	};

	return messages[operation];
}

function buildError(
	condition: ValidationCondition,
	received: unknown,
	message: string,
): ValidationError {
	return {
		field: condition.field,
		operation: condition.operation,
		message,
		received,
	};
}

export function evaluateCondition(
	condition: ValidationCondition,
	data: Record<string, unknown>,
	options: ValidationOptions,
): ConditionResult {
	const received = resolveFieldValue(data, condition);
	const expected = condition.value ?? '';
	const message =
		condition.errorMessage?.trim() ||
		defaultMessage(condition.field, condition.operation, expected);

	let pass = false;

	switch (condition.operation) {
		case 'isEmpty':
			pass = isEmptyValue(received);
			break;
		case 'isNotEmpty':
			pass = !isEmptyValue(received);
			break;
		case 'contains':
			pass = toComparableString(received, options.ignoreCase).includes(
				toComparableString(expected, options.ignoreCase),
			);
			break;
		case 'notContains':
			pass = !toComparableString(received, options.ignoreCase).includes(
				toComparableString(expected, options.ignoreCase),
			);
			break;
		case 'equals':
			pass =
				toComparableString(received, options.ignoreCase) ===
				toComparableString(expected, options.ignoreCase);
			break;
		case 'notEquals':
			pass =
				toComparableString(received, options.ignoreCase) !==
				toComparableString(expected, options.ignoreCase);
			break;
		case 'greaterThan': {
			const left = toNumber(received);
			const right = toNumber(expected);
			if (left === null || right === null) {
				return {
					pass: false,
					error: buildError(
						condition,
						received,
						`${message} (numeric comparison required)`,
					),
				};
			}
			pass = left > right;
			break;
		}
		case 'lessThan': {
			const left = toNumber(received);
			const right = toNumber(expected);
			if (left === null || right === null) {
				return {
					pass: false,
					error: buildError(
						condition,
						received,
						`${message} (numeric comparison required)`,
					),
				};
			}
			pass = left < right;
			break;
		}
		case 'isTrue': {
			const bool = toBoolean(received);
			if (bool === null) {
				return {
					pass: false,
					error: buildError(
						condition,
						received,
						`${message} (boolean true/false required)`,
					),
				};
			}
			pass = bool === true;
			break;
		}
		case 'isFalse': {
			const bool = toBoolean(received);
			if (bool === null) {
				return {
					pass: false,
					error: buildError(
						condition,
						received,
						`${message} (boolean true/false required)`,
					),
				};
			}
			pass = bool === false;
			break;
		}
		case 'isBoolean':
			pass = isBooleanValue(received);
			break;
		default:
			pass = false;
	}

	if (pass) {
		return { pass: true };
	}

	return {
		pass: false,
		error: buildError(condition, received, message),
	};
}
