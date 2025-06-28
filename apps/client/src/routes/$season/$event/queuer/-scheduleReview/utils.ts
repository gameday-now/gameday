import { EventConfig, Match } from "@gameday/models"
import { addMinutes, format } from "date-fns"
import { BreakBlock, MatchBlock } from "./types"

export const extractMatchBlocks = (
	matches: Match[],
	config: EventConfig,
): MatchBlock[] => {
	const breakIndices = config.potentialBreaks
		.map((breakDesc) =>
			matches.findIndex((m) => m.description === breakDesc),
		)
		.filter((i) => i !== -1)
		.sort((a, b) => a - b)

	const indices = [0, ...breakIndices.map((i) => i + 1), matches.length]

	return indices
		.slice(0, -1)
		.map((start, i) => matches.slice(start, indices[i + 1]))
		.map<MatchBlock>((matchesInBlock, i) => ({
			id: matchesInBlock[0].description,
			index: i + 1,
			firstMatch: matchesInBlock[0].description,
			lastMatch: matchesInBlock[matchesInBlock.length - 1].description,
			startTime: matchesInBlock[0].startTime,
			endTime: format(
				addMinutes(
					matchesInBlock[matchesInBlock.length - 1].startTime,
					config.cycleTime ?? 0,
				),
				"yyyy-MM-dd'T'HH:mm:ss",
			),
			totalMatches: matchesInBlock.length,
		}))
}

export const extractBreakBlocks = (matchBlocks: MatchBlock[]): BreakBlock[] =>
	matchBlocks.slice(0, -1).reduce<BreakBlock[]>((all, matchBlock, index) => {
		const nextBlock = matchBlocks[index + 1]
		return [
			...all,
			{
				id: `break-${index}`,
				index: index + 1,
				afterMatchId: matchBlock.lastMatch,
				startTime: matchBlock.endTime,
				endTime: nextBlock.startTime,
			},
		]
	}, [])
