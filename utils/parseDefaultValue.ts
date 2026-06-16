import type { ValidationOperation } from './types';

const BOOLEAN_OPERATIONS: ValidationOperation[] = ['isTrue', 'isFalse', 'isBoolean'];

function tryParseBoolean(raw: string): boolean | null {
	const lower = raw.trim().toLowerCase();
	if (lower === 'true' || lower === '1') return true;
	if (lower === 'false' || lower === '0') return false;
	return null;
}

export function parseDefaultValue(raw: string, operation: ValidationOperation): unknown {
	const trimmed = raw.trim();
	const asBool = tryParseBoolean(trimmed);

	if (asBool !== null && (BOOLEAN_OPERATIONS.includes(operation) || operation === 'isEmpty' || operation === 'isNotEmpty')) {
		return asBool;
	}

	if (BOOLEAN_OPERATIONS.includes(operation)) {
		return trimmed;
	}

	if (operation === 'greaterThan' || operation === 'lessThan') {
		const num = Number(trimmed);
		return Number.isNaN(num) ? trimmed : num;
	}

	return trimmed;
}
