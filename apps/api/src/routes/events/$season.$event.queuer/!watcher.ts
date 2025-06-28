import { Watcher } from "@/lib/actionSocket/types"
import { QueuerRouteConfig } from "./!routeConfig"

export default (({
	initialData: { matchesCollection, breaksCollection, eventConfigCollection },
	sendPrimaryData,
}) => [
	matchesCollection.watch().on("change", sendPrimaryData),
	breaksCollection.watch().on("change", sendPrimaryData),
	eventConfigCollection.watch().on("change", sendPrimaryData),
]) satisfies Watcher<QueuerRouteConfig>
