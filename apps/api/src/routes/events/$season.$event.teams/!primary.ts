import { PrimaryDataCallback } from "@/lib/actionSocket/types"
import { getAllTeamLists, getAllTeams } from "@/lib/teams"
import { TeamsRouteConfig } from "./!routeConfig"

export default (async ({
	data,
	uid,
	initialData: { teamsCollection, teamListsCollection },
}) => {
	const { log } = data
	try {
		const teams = await getAllTeams(teamsCollection)
		const teamLists = await getAllTeamLists(teamListsCollection)

		return { teams, teamLists }
	} catch (error) {
		log.warn(error)
	}
}) satisfies PrimaryDataCallback<TeamsRouteConfig>
