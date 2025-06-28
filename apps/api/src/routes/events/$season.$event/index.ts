import actionSocket from "@/lib/actionSocket"
import authorization from "./!authorization"
import primaryDataCallback from "./!primary"
import { initialCallback } from "./!routeConfig"
import watcher from "./!watcher"

export default actionSocket({
	authorization,
	initialCallback,
	watcher,
	primaryDataCallback,
	actions: {},
	callbacks: {},
})
