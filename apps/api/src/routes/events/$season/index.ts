import actionSocket from "@/lib/actionSocket"
import primaryDataCallback from "./!primary"
import { initialCallback } from "./!routeConfig"
import watcher from "./!watcher"

export default actionSocket({
	initialCallback,
	watcher,
	primaryDataCallback,
	actions: {},
	callbacks: {},
})
