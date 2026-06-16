/**
 * Reads a value from an object using dot-notation path (e.g. "body.user.email").
 */
export function getFieldValue(data: Record<string, unknown>, fieldPath: string): unknown {
	const trimmed = fieldPath.trim();
	if (!trimmed) {
		return undefined;
	}

	const segments = trimmed.split('.');
	let current: unknown = data;

	for (const segment of segments) {
		if (current === null || current === undefined) {
			return undefined;
		}

		if (typeof current !== 'object') {
			return undefined;
		}

		current = (current as Record<string, unknown>)[segment];
	}

	return current;
}
