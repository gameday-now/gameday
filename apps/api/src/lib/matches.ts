import {
	FTCMatch,
	Match,
	MatchStatus,
	matchZod,
	partialMatchZod,
} from "@gameday/models"
import { differenceInMinutes } from "date-fns"
import { AnyBulkWriteOperation, Collection } from "mongodb"
import { deepDiff, pickKeys } from "./objectUtils"
import { sortMatchesAsc, sortMatchesWithAnchored } from "./sort"

type MatchStatusParam = Pick<
	Match,
	"postResultTime" | "actualStartTime" | "gameday"
>

export const getMatchStatus = (match: MatchStatusParam): MatchStatus => {
	if (match.postResultTime) {
		return "completed"
	}
	if (match.actualStartTime) {
		return "in_match"
	}
	return match.gameday?.status ?? "scheduled"
}

const getMatchDelta = (index: number, current: Match, matches: Match[]) => {
	const next = matches[index + 1]
	if (next) {
		const deltaMin = differenceInMinutes(next.startTime, current.startTime)
		return Math.round(deltaMin)
	}
}

export const getAllMatches = async (
	matchesCollection: Collection<Match>,
): Promise<Match[]> =>
	sortMatchesWithAnchored(
		matchZod.array().parse(await matchesCollection.find().toArray()),
	)

export const getAllMatchesWithoutRematch = async (
	matchesCollection: Collection<Match>,
): Promise<Match[]> =>
	sortMatchesWithAnchored(
		matchZod.array().parse(await matchesCollection.find().toArray()),
	)

const mostCommonNumber = (arr: number[]): number => {
	if (arr.length === 0) return 0

	const frequencyMap = arr.reduce<Record<number, number>>((acc, num) => {
		return { ...acc, [num]: (acc[num] ?? 0) + 1 }
	}, {})

	return Number(
		Object.entries(frequencyMap).reduce(
			(maxEntry, currentEntry) =>
				currentEntry[1] > maxEntry[1] ? currentEntry : maxEntry,
			["", -Infinity] as [string, number],
		)[0],
	)
}

export const analyzeCycleTime = (matches: Match[]) => {
	const fallback = { cycleTime: 0, potentialBreaks: [], fields: 0 }

	const sorted = matches
		.filter(
			({ rematchAnchorPoint, tournamentLevel }) =>
				!rematchAnchorPoint && tournamentLevel === "QUALIFICATION",
		)
		.sort(sortMatchesAsc)

	if (sorted.length < 2) {
		return fallback
	}

	const deltas = sorted
		.map((current, index) => getMatchDelta(index, current, sorted))
		.filter((value) => typeof value === "number")

	const cycleTime = mostCommonNumber(deltas)

	const potentialBreaks = sorted.reduce<Match["description"][]>(
		(all, current, index) => {
			const delta = getMatchDelta(index, current, sorted)
			if (delta && delta > cycleTime * 1.5) {
				return [...all, current.description]
			}
			return all
		},
		[],
	)

	const fields = sorted.reduce<number>(
		(max, current) => Math.max(max, Number(current.field)),
		0,
	)

	return {
		cycleTime,
		potentialBreaks,
		fields,
	}
}

export const mergeMatches = (
	receivedMatches: FTCMatch[],
	storedMatches: Match[],
) => {
	const bulkOps: AnyBulkWriteOperation<Match>[] = []
	// Keep track "touched" matches. At the end of the process, all "untouched" matches will be deleted
	const touchedMatches: Record<string, boolean> = {}

	for (const receivedMatch of receivedMatches) {
		// Find all matches that originates from the received match, including rematches.
		const currentMatches = storedMatches
			.filter(
				({ originalMatchDescription }) =>
					receivedMatch.description === originalMatchDescription,
			)
			.sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime))

		if (currentMatches.length === 0) {
			// This match does not exists, need to create it
			bulkOps.push({
				insertOne: {
					document: {
						...receivedMatch,
						status: getMatchStatus(receivedMatch),
						title:
							receivedMatch.tournamentLevel === "PLAYOFF"
								? `Playoff ${/(\d+)$/.exec(receivedMatch.description)?.[0] ?? ""}`
								: receivedMatch.description,
						originalMatchDescription: receivedMatch.description,
					},
				},
			})
			continue
		}
		touchedMatches[receivedMatch.description] = true
		if (currentMatches.length === 1) {
			const currentMatch = currentMatches[0]
			if (!currentMatch) {
				continue
			}
			// This is the only match (no rematches registered)
			const diff = deepDiff(
				currentMatch,
				partialMatchZod.parse(receivedMatch),
			)
			bulkOps.push({
				updateOne: {
					filter: { description: currentMatch.description },
					update: {
						$set: {
							...diff,
							status: getMatchStatus({
								actualStartTime: receivedMatch.actualStartTime,
								postResultTime: receivedMatch.postResultTime,
								gameday: currentMatch.gameday,
							}),
						},
					},
				},
			})
			continue
		}

		if (currentMatches.length > 1) {
			// There is a rematch registered
			const latestRematch = currentMatches[0]
			const previousMatch = currentMatches[1]
			if (!latestRematch || !previousMatch) {
				continue
			}

			// Identify if the rematch occurred, check if the postResultTime is the same as the previous match
			if (
				receivedMatch.actualStartTime === previousMatch.actualStartTime
			) {
				// The rematch has not started yet.
				const diff = deepDiff(
					previousMatch,
					partialMatchZod.parse(receivedMatch),
				)
				bulkOps.push({
					updateOne: {
						filter: { description: previousMatch.description },
						update: {
							$set: {
								...diff,
								status: getMatchStatus({
									actualStartTime:
										receivedMatch.actualStartTime,
									postResultTime:
										receivedMatch.postResultTime,
									gameday: previousMatch.gameday,
								}),
							},
						},
					},
				})
			} else {
				// The rematch has finished.
				const diff = pickKeys(
					deepDiff(
						latestRematch,
						partialMatchZod.parse(receivedMatch),
					),
					"actualStartTime",
					"postResultTime",
				)
				bulkOps.push({
					updateOne: {
						filter: { description: latestRematch.description },
						update: {
							$set: {
								...diff,
								status: getMatchStatus({
									actualStartTime:
										receivedMatch.actualStartTime,
									postResultTime:
										receivedMatch.postResultTime,
									gameday: latestRematch.gameday,
								}),
							},
						},
					},
				})
			}
		}
	}

	const matchesToRemove = storedMatches
		.filter(
			({ originalMatchDescription }) =>
				!(originalMatchDescription in touchedMatches),
		)
		.map<AnyBulkWriteOperation<Match>>(({ description }) => ({
			deleteOne: {
				filter: { description },
			},
		}))

	return [...bulkOps, ...matchesToRemove]
}
