import { sortMatchesAsc } from "@/lib/sort"
import { Match } from "@gameday/models"
import { Collection } from "mongodb"
import {
	changeByOneCycleTime,
	getField,
	matchesOnTheSameAnchorPointQuery,
	MatchRescheduleAdditionalInformationCallback,
} from "./!scheduleRematch.utils"

const getOneMatchAfter = async (
	matchesCollection: Collection<Match>,
	matchId: string,
): Promise<Match | undefined> => {
	const matches = (
		await matchesCollection
			.find({
				rematchAnchorPoint: { $eq: null },
			})
			.toArray()
	).sort(sortMatchesAsc)

	const currentMatch = matches.findIndex(
		({ description }) => matchId === description,
	)
	return matches[currentMatch + 1]
}

export default (async ({
	initialData: { breaksCollection, matchesCollection },
	request: { anchorPoint },
	matchesOnSameAnchorPoint,
	config,
}) => {
	if (anchorPoint.type !== "after_break") {
		throw new Error("anchorPoint.type is not after_break")
	}
	const lastMatchesOnSameAnchorPoint = matchesOnSameAnchorPoint[0]
	const anchoredBreak = await breaksCollection.findOne({
		_id: anchorPoint.breakId,
	})
	const anchoredMatch = await matchesCollection.findOne({
		description: anchoredBreak?.afterMatchId,
	})
	const matchAfterBreak = await getOneMatchAfter(
		matchesCollection,
		anchoredBreak?.afterMatchId ?? "",
	)

	if (!anchoredBreak || !anchoredMatch || !matchAfterBreak) {
		throw new Error(
			"anchoredBreak, anchoredMatch or matchAfterBreak are undefined",
		)
	}

	const field = getField(matchAfterBreak.field, -1, config)
	const startTime = changeByOneCycleTime(
		matchAfterBreak.startTime,
		-1,
		config,
	)

	const order = lastMatchesOnSameAnchorPoint?.rematchAnchorPoint?.order ?? 1

	await matchesCollection.updateMany(
		matchesOnTheSameAnchorPointQuery(anchorPoint),
		[
			{
				$set: {
					startTime: {
						$dateToString: {
							format: "%Y-%m-%dT%H:%M:%S",
							date: {
								$dateAdd: {
									startDate: { $toDate: "$startTime" },
									unit: "minute",
									amount: config.cycleTime * -1,
								},
							},
						},
					},
					field: {
						$add: [
							{
								$mod: [
									{
										$add: [
											{ $subtract: ["$field", 1] },
											-1,
											config.fields,
										],
									},
									config.fields,
								],
							},
							1,
						],
					},
				},
			},
		],
	)

	await breaksCollection.updateOne({ _id: anchorPoint.breakId }, [
		{
			$set: {
				endTime: {
					$dateToString: {
						format: "%Y-%m-%dT%H:%M:%S",
						date: {
							$dateAdd: {
								startDate: { $toDate: "$endTime" },
								unit: "minute",
								amount: config.cycleTime * -1,
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
