export const arrayToRecord = <T, K extends keyof T>(
	array: T[],
	key: K,
): Record<string, T> =>
	array.reduce<Record<string, T>>((acc, item) => {
		const recordKey = String(item[key])
		acc[recordKey] = item
		return acc
	}, {})

export const deepDiff = (
	original: any,
	newObj: any,
	_path: string = "",
): Record<string, any> => {
	const path = _path.length === 0 ? "" : `${_path}.`
	// If either is not an object, return newObj directly
	if (typeof original !== "object" || original === null) return newObj
	if (typeof newObj !== "object" || newObj === null) return newObj

	// Handle arrays of team objects
	if (Array.isArray(original) && Array.isArray(newObj)) {
		return newObj.reduce<Record<string, any>>((result, item, index) => {
			if (!!original[index]) {
				return {
					...result,
					...deepDiff(original[index], item, `${path}${index}`),
				}
			} else {
				return { ...result, [`${path}${index}`]: item }
			}
		}, {})
	}

	let result: Record<string, any> = {}

	// Iterate over all the keys, check for changes
	for (const key of new Set([
		...Object.keys(original),
		...Object.keys(newObj),
	])) {
		const origValue = key in original ? original[key] : null
		const newValue = key in newObj ? newObj[key] : null

		if (
			typeof origValue === "object" &&
			typeof newValue === "object" &&
			origValue !== null &&
			newValue !== null
		) {
			// Nested object/array, merge the new object recursively
			const mergedValue = deepDiff(origValue, newValue, `${path}${key}`)
			if (mergedValue !== null) {
				result = { ...result, ...mergedValue }
			}

			// ---
			// The key is primitive, check if exist in the new object
		} else if (key in newObj) {
			// Set the new value only if should return the entire object or the value has changed
			if (origValue !== newValue) {
				result[`${path}${key}`] = newValue
			}
		} else {
			// The key has been removed, skip
		}
	}

	return result
}

export const pickKeys = <T extends object, K extends keyof T>(
	obj: T,
	...keys: K[]
): Partial<Pick<T, Extract<keyof T, K>>> =>
	keys.reduce(
		(acc, key) => {
			if (key in obj) {
				return { ...acc, [key]: obj[key] }
			}
			return acc
		},
		{} as Partial<Pick<T, Extract<keyof T, K>>>,
	)
