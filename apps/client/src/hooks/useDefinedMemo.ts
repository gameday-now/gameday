import { DependencyList, useEffect, useState } from "react"

const useDefinedMemo = <T>(
	factory: () => T | undefined,
	deps: DependencyList,
	initialValue: T,
) => {
	const [state, setState] = useState<T>(initialValue)

	useEffect(() => {
		const newState = factory()
		if (newState !== undefined) {
			setState(newState)
		}
	}, deps)

	return state
}

export default useDefinedMemo
