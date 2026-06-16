/**
 * Sets a value on an object using dot-notation path (e.g. "body.user.email").
 */
export function setFieldValue(
	data: Record<string, unknown>,
	fieldPath: string,
	value: unknown,
): void {
	const trimmed = fieldPath.trim();
	if (!trimmed) {
		return;
	}

	const segments = trimmed.split('.');
	let current: Record<string, unknown> = data;

	for (let i = 0; i < segments.length - 1; i++) {
		const segment = segments[i];
		const next = current[segment];

		if (typeof next !== 'object' || next === null || Array.isArray(next)) {
			current[segment] = {};
		}

		current = current[segment] as Record<string, unknown>;
	}

	current[segments[segments.length - 1]] = value;
}
