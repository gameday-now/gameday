import actionSocket from "@/lib/actionSocket"
import addList from "./!addList"
import authorization from "./!authorization"
import deleteList from "./!deleteList"
import markTeam from "./!markTeam"
import primaryDataCallback from "./!primary"
import { actions, initialCallback } from "./!routeConfig"
import watcher from "./!watcher"

export default actionSocket({
	authorization,
	initialCallback,
	watcher,
	primaryDataCallback,
	actions,
	callbacks: {
		markTeam,
		addList,
		deleteList,
	},
})
