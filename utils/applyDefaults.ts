import { setFieldValue } from './setFieldValue';
import type { FieldDefault } from './types';

export function applyDefaultsToJson(
	json: Record<string, unknown>,
	defaults: FieldDefault[],
): Record<string, unknown> {
	if (defaults.length === 0) {
		return json;
	}

	const output = JSON.parse(JSON.stringify(json)) as Record<string, unknown>;

	for (const { field, value } of defaults) {
		setFieldValue(output, field, value);
	}

	return output;
}
