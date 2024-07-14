export default function deepClone<T>(obj: T): T {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(deepClone) as T;
	}

	return Object.fromEntries(
		Object.entries(obj).map(([key, value]) => [key, deepClone(value)]),
	) as T;
}
