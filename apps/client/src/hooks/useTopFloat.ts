import { useEffect, useState } from "react"

const useTopFloat = () => {
	const [showComponent, setShowComponent] = useState<boolean>(false)

	const scrollHandler = () => {
		if (window.scrollY > 100 && !showComponent) {
			setShowComponent(true)
		}
		if (window.scrollY <= 100 && showComponent) {
			setShowComponent(false)
		}
	}

	useEffect(() => {
		window.addEventListener("scroll", scrollHandler)
		return () => {
			window.removeEventListener("scroll", scrollHandler)
		}
	}, [showComponent])

	return showComponent
}
export default useTopFloat
