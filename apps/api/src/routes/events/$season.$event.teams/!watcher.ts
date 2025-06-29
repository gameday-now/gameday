import { Watcher } from "@/lib/actionSocket/types"
import { TeamsRouteConfig } from "./!routeConfig"

export default (({
	initialData: { teamsCollection, teamListsCollection },
	sendPrimaryData,
}) => [
	teamsCollection.watch().on("change", sendPrimaryData),
	teamListsCollection.watch().on("change", sendPrimaryData),
]) satisfies Watcher<TeamsRouteConfig>
