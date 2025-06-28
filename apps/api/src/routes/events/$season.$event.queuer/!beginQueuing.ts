import { ActionDeclaration } from "@/lib/actionSocket/types"
import { QueuerRouteConfig } from "./!routeConfig"

export default {
	fn: async ({
		initialData: { matchesCollection },
		request: { matchId },
	}) => {
		const match = await matchesCollection.findOne({ description: matchId })
		if (!match) {
			return {
				type: "error",
				message: "Match not found",
			}
		}
		if (
			match.gameday?.status === "now_queuing" ||
			match.gameday?.status === "on_deck"
		) {
			return {
				type: "error",
				message: `Match is already in queuing state. Current state: ${match.gameday?.status}`,
			}
		}

		await matchesCollection.updateMany(
			{ status: "now_queuing" },
			{
				$set: {
					"gameday.status": "on_deck",
					status: "on_deck",
				},
			},
		)

		const currentMatchResult = await matchesCollection.updateOne(
			{ description: matchId },
			{
				$set: {
					"gameday.status": "now_queuing",
					status: "now_queuing",
				},
			},
		)

		if (currentMatchResult.matchedCount === 0) {
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
} satisfies ActionDeclaration<QueuerRouteConfig, "beginQueuing">
