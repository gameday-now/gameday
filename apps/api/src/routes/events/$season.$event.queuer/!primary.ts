import { PrimaryDataCallback } from "@/lib/actionSocket/types"
import { getAllMatches } from "@/lib/matches"
import { arrayToRecord } from "@/lib/objectUtils"
import { sortMatchesWithAnchored } from "@/lib/sort"
import {
	breakZod,
	matchZod,
	queuerResponseZod,
	REVIEW_EVENT_SCHEDULE_PERMISSION,
} from "@gameday/models"
import { QueuerRouteConfig } from "./!routeConfig"

export default (async ({
	data,
	uid,
	initialData: {
		matchesCollection,
		breaksCollection,
		eventConfigCollection,
		season,
		eventCode,
	},
}) => {
	const { log } = data
	try {
		const config = await eventConfigCollection.findOne()
		const matches = await (async () => {
			const matches = await getAllMatches(matchesCollection)
			if (!config?.leadQueuerReviewed) {
				const canReview = await data.permit.check(
					uid,
					REVIEW_EVENT_SCHEDULE_PERMISSION,
					{
						type: "event",
						key: eventCode,
						tenant: season,
					},
				)
				if (!canReview) {
					return []
				}
			}
			return matches
		})()
		const breaks = await breaksCollection.find().toArray()
		return queuerResponseZod.parse({
			matches: sortMatchesWithAnchored(matchZod.array().parse(matches)),
			breaks: arrayToRecord(
				breakZod.array().parse(breaks),
				"afterMatchId",
			),
			config,
		})
	} catch (error) {
		log.warn(error)
	}
}) satisfies PrimaryDataCallback<QueuerRouteConfig>
