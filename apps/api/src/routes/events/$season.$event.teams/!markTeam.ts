import { SocketError } from "@/lib/actionSocket/error"
import { ActionDeclaration } from "@/lib/actionSocket/types"
import { MARK_TEAM_PERMISSION } from "@gameday/models"
import { TeamsRouteConfig } from "./!routeConfig"

export default {
	permission: MARK_TEAM_PERMISSION,
	fn: async ({
		initialData: { teamsCollection, teamListsCollection },
		request,
	}) => {
		const { teamNumber, checked, listId } = request
		const foundTeam = await teamsCollection.findOne({
			teamNumber,
		})

		if (!foundTeam) {
			throw new SocketError({
				message: "Team not found",
			})
		}

		await teamListsCollection.updateOne(
			{ _id: listId },
			{ $set: { [`listChecks.${teamNumber}`]: checked } },
		)

		return {
			type: "response",
			message: "Ok",
		}
	},
} satisfies ActionDeclaration<TeamsRouteConfig, "markTeam">
