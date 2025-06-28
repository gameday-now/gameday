import actionSocket from "@/lib/actionSocket"
import addBreak from "./!addBreak"
import authorization from "./!authorization"
import beginQueuing from "./!beginQueuing"
import primaryDataCallback from "./!primary"
import promoteToDeck from "./!promoteToDeck"
import reviewSchedule from "./!reviewSchedule"
import { actions, initialCallback } from "./!routeConfig"
import scheduleRematch from "./!scheduleRematch"
import updateAttendance from "./!updateAttendance"
import watcher from "./!watcher"

export default actionSocket({
	authorization,
	initialCallback,
	watcher,
	primaryDataCallback,
	actions,
	callbacks: {
		reviewSchedule,
		updateAttendance,
		promoteToDeck,
		beginQueuing,
		addBreak,
		scheduleRematch,
	},
})
