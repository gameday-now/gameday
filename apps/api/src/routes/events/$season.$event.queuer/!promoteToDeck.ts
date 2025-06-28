import { ActionDeclaration } from "@/lib/actionSocket/types"
import { getAllMatches } from "@/lib/matches"
import { arrayToRecord } from "@/lib/objectUtils"
import { Break, Match } from "@gameday/models"
import { QueuerRouteConfig } from "./!routeConfig"

const isBreakNext = (
	currentMatch: Match,
	allMatches: Match[],
	breaksById: Record<string, Break>,
): boolean => {
	const breakToInsert =
		currentMatch.rematchAnchorPoint &&
		currentMatch.rematchAnchorPoint.type === "before_break"
			? breaksById[currentMatch.rematchAnchorPoint.breakId]
			: breaksById[currentMatch.description]
	if (!breakToInsert) return false

	const currentIndex = allMatches.findIndex(
		(m) => m.description === currentMatch.description,
	)
	if (currentIndex === -1) return false

	const futureAnchored = allMatches
		.slice(currentIndex + 1)
		.some(
			(m) =>
				m.rematchAnchorPoint?.type === "before_break" &&
				m.rematchAnchorPoint.breakId === breakToInsert._id,
		)

	return !futureAnchored
}

export default {
	fn: async ({
		initialData: { matchesCollection, breaksCollection },
		request: { matchId },
	}) => {
		const match = await matchesCollection.findOne({ description: matchId })
		if (!match) {
			return {
				type: "error",
				message: "Match not found",
			}
		}
		if (match.gameday?.status !== "now_queuing") {
			return {
				type: "error",
				message: `Match is not in queuing state. Current state: ${match.gameday?.status}`,
			}
		}

		const currentMatchResult = await matchesCollection.updateOne(
			{ description: matchId, "gameday.status": "now_queuing" },
			{ $set: { "gameday.status": "on_deck" } },
		)

		if (currentMatchResult.matchedCount === 0) {
			return {
				type: "error",
				message: "Match or team not found",
			}
		}

		matchesCollection.updateMany(
			{ status: "now_queuing" },
			{
				$set: {
					"gameday.status": "on_deck",
					status: "on_deck",
				},
			},
		)

		const breaksRecord = arrayToRecord(
			await breaksCollection.find().toArray(),
			"_id",
		)

		const matches = await getAllMatches(matchesCollection)
		const currentMatchIndex = matches.findIndex(
			({ description }) => description === match.description,
		)
		const nextMatch = matches[currentMatchIndex + 1]
		if (nextMatch && nextMatch.tournamentLevel === match.tournamentLevel) {
			if (!isBreakNext(match, matches, breaksRecord)) {
				const nextMatchResult = await matchesCollection.updateOne(
					{
						description: nextMatch.description,
					},
					{
						$set: {
							"gameday.status": "now_queuing",
							status: "now_queuing",
						},
					},
				)
				if (nextMatchResult.matchedCount > 0) {
					return {
						type: "response",
						message: "Ok",
					}
				}
			}
		}
		return {
			type: "response",
			message: "Ok. Next match not found",
		}
	},
} satisfies ActionDeclaration<QueuerRouteConfig, "promoteToDeck">
