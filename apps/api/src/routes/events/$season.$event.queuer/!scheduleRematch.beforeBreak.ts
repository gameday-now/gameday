import {
	changeByOneCycleTime,
	getField,
	MatchRescheduleAdditionalInformationCallback,
} from "./!scheduleRematch.utils"

export default (async ({
	initialData: { breaksCollection, matchesCollection },
	request: { anchorPoint },
	matchesOnSameAnchorPoint,
	config,
}) => {
	if (anchorPoint.type !== "before_break") {
		throw new Error("anchorPoint.type is not before_break")
	}
	const lastMatchesOnSameAnchorPoint = matchesOnSameAnchorPoint[0]
	const anchoredBreak = await breaksCollection.findOne({
		_id: anchorPoint.breakId,
	})
	const anchoredMatch = await matchesCollection.findOne({
		description: anchoredBreak?.afterMatchId,
	})

	if (!anchoredBreak || !anchoredMatch) {
		throw new Error("anchoredBreak or anchoredMatch are undefined")
	}

	const field = getField(
		lastMatchesOnSameAnchorPoint?.field ?? anchoredMatch.field,
		1,
		config,
	)

	const startTime = changeByOneCycleTime(
		lastMatchesOnSameAnchorPoint?.startTime ?? anchoredMatch?.startTime,
		1,
		config,
	)

	const order = lastMatchesOnSameAnchorPoint?.rematchAnchorPoint?.order ?? 1

	await breaksCollection.updateOne({ _id: anchorPoint.breakId }, [
		{
			$set: {
				startTime: {
					$dateToString: {
						format: "%Y-%m-%dT%H:%M:%S",
						date: {
							$dateAdd: {
								startDate: { $toDate: "$startTime" },
								unit: "minute",
								amount: config.cycleTime,
							},
						},
					},
				},
			},
		},
	])

	return {
		field,
		order,
		startTime,
	}
}) satisfies MatchRescheduleAdditionalInformationCallback
