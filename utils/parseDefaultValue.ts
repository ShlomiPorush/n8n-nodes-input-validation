import type { ValidationOperation } from './types';

const BOOLEAN_OPERATIONS: ValidationOperation[] = ['isTrue', 'isFalse', 'isBoolean'];

export function parseDefaultValue(raw: string, operation: ValidationOperation): unknown {
	const trimmed = raw.trim();

	if (BOOLEAN_OPERATIONS.includes(operation)) {
		const lower = trimmed.toLowerCase();
		if (lower === 'true' || lower === '1') return true;
		if (lower === 'false' || lower === '0') return false;
		return trimmed;
	}

	if (operation === 'greaterThan' || operation === 'lessThan') {
		const num = Number(trimmed);
		return Number.isNaN(num) ? trimmed : num;
	}

	return trimmed;
}
