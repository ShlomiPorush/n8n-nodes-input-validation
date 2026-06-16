/**
 * Coerces common API representations to boolean.
 * Returns null if the value is not a recognizable boolean.
 */
export function toBoolean(value: unknown): boolean | null {
	if (typeof value === 'boolean') {
		return value;
	}

	if (typeof value === 'number') {
		if (value === 1) return true;
		if (value === 0) return false;
		return null;
	}

	if (typeof value === 'string') {
		const lower = value.trim().toLowerCase();
		if (lower === 'true' || lower === '1') return true;
		if (lower === 'false' || lower === '0') return false;
	}

	return null;
}

export function isBooleanValue(value: unknown): boolean {
	return toBoolean(value) !== null;
}
