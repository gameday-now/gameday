import { sortMatchesDesc } from "@/lib/sort"
import { Match } from "@gameday/models"
import { Collection } from "mongodb"
import {
	changeByOneCycleTime,
	getField,
	MatchRescheduleAdditionalInformationCallback,
} from "./!scheduleRematch.utils"

const getLastQual = async (
	matchesCollection: Collection<Match>,
): Promise<Match | undefined> => {
	const matches = (
		await matchesCollection
			.find({
				tournamentLevel: "QUALIFICATION",
				rematchAnchorPoint: { $eq: null },
			})
			.toArray()
	).sort(sortMatchesDesc)

	return matches[0]
}

export default (async ({
	initialData: { matchesCollection },
	request: { anchorPoint },
	matchesOnSameAnchorPoint,
	config,
}) => {
	if (anchorPoint.type !== "after_last_qual") {
		throw new Error("anchorPoint.type is not after_last_qual")
	}
	const lastMatchesOnSameAnchorPoint = matchesOnSameAnchorPoint[0]
	const anchoredMatch = await getLastQual(matchesCollection)

	if (!anchoredMatch) {
		throw new Error("anchoredMatch is undefined")
	}

	const field = getField(
		lastMatchesOnSameAnchorPoint?.field ?? anchoredMatch.field,
		1,
		config,
	)

	const startTime = changeByOneCycleTime(
		lastMatchesOnSameAnchorPoint?.startTime ?? anchoredMatch.startTime,
		1,
		config,
	)

	const order = lastMatchesOnSameAnchorPoint?.rematchAnchorPoint?.order ?? 1

	return {
		field,
		order,
		startTime,
	}
}) satisfies MatchRescheduleAdditionalInformationCallback
