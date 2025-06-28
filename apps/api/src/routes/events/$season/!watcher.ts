import { Watcher } from "@/lib/actionSocket/types"
import { SeasonRouteConfig } from "./!routeConfig"

export default (({ initialData: { seasonCollection }, sendPrimaryData }) =>
	seasonCollection
		.watch()
		.on("change", sendPrimaryData)) satisfies Watcher<SeasonRouteConfig>
