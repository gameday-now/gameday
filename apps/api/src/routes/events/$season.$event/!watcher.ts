import { Watcher } from "@/lib/actionSocket/types"
import { EventRouteConfig } from "./!routeConfig"

export default (({ initialData: { seasonCollection }, sendPrimaryData }) =>
	seasonCollection
		.watch()
		.on("change", sendPrimaryData)) satisfies Watcher<EventRouteConfig>
