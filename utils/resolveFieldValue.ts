import { getFieldValue } from './getFieldValue';
import { parseDefaultValue } from './parseDefaultValue';
import type { ValidationCondition } from './types';

/**
 * Reads a field from data. When the path is missing (undefined),
 * applies defaultValue if configured.
 */
export function resolveFieldValue(
	data: Record<string, unknown>,
	condition: ValidationCondition,
): unknown {
	const received = getFieldValue(data, condition.field);

	if (received !== undefined) {
		return received;
	}

	const defaultRaw = condition.defaultValue?.trim();
	if (!defaultRaw) {
		return undefined;
	}

	return parseDefaultValue(defaultRaw, condition.operation);
}
