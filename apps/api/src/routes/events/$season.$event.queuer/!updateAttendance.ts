import { ActionDeclaration } from "@/lib/actionSocket/types"
import { QueuerRouteConfig } from "./!routeConfig"

export default {
	fn: async ({
		initialData: { matchesCollection },
		request: { attendance, matchId, teamNumber },
	}) => {
		const result = await matchesCollection.updateOne(
			{
				description: matchId,
				"teams.teamNumber": teamNumber,
				actualStartTime: null,
				$or: [
					{ "gameday.status": "on_deck" },
					{ "gameday.status": "now_queuing" },
				],
			},
			{
				$set: {
					[`gameday.teams.${teamNumber}.attendance`]: attendance,
				},
			},
		)
		if (result.matchedCount === 0) {
			return {
				type: "error",
				message: "Match or team not found",
			}
		}
		return {
			type: "response",
			message: "Ok",
		}
	},
} satisfies ActionDeclaration<QueuerRouteConfig, "updateAttendance">
