import { detect } from "detect-browser"
import { useMemo } from "react"

const useIOSPadding = () => {
	const appMode = useMemo(() => {
		if (document.referrer.startsWith("android-app://")) return "twa"
		if (window.matchMedia("(display-mode: browser)").matches)
			return "browser"
		if (window.matchMedia("(display-mode: standalone)").matches)
			return "standalone"
		if (window.matchMedia("(display-mode: minimal-ui)").matches)
			return "minimal-ui"
		if (window.matchMedia("(display-mode: fullscreen)").matches)
			return "fullscreen"
		if (
			window.matchMedia("(display-mode: window-controls-overlay)").matches
		)
			return "window-controls-overlay"

		return "unknown"
	}, [])
	const detected = detect()

	const addPadding =
		(appMode === "fullscreen" || appMode === "standalone") &&
		detected?.os === "iOS"

	return { addPadding }
}

export default useIOSPadding
