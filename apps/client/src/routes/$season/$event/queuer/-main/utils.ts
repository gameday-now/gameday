import { Break, Match } from "@gameday/models"

export const shouldInsertBreak = (
	currentMatch: Match,
	allMatches: Match[],
	breaksById: Record<string, Break>,
): Break | null => {
	const breakToInsert =
		currentMatch.rematchAnchorPoint &&
		currentMatch.rematchAnchorPoint.type === "before_break"
			? breaksById[currentMatch.rematchAnchorPoint.breakId]
			: breaksById[currentMatch.description]
	if (!breakToInsert) return null

	const currentIndex = allMatches.findIndex(
		(m) => m.description === currentMatch.description,
	)
	if (currentIndex === -1) return null

	const futureAnchored = allMatches
		.slice(currentIndex + 1)
		.some(
			(m) =>
				m.rematchAnchorPoint?.type === "before_break" &&
				m.rematchAnchorPoint.breakId === breakToInsert._id,
		)

	return futureAnchored ? null : breakToInsert
}
