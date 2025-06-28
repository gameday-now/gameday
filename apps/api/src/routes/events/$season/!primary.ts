import { PrimaryDataCallback } from "@/lib/actionSocket/types"
import { getActiveEvents } from "@/lib/events"
import { ICheckQuery } from "@/plugins/permit"
import { eventZod } from "@gameday/models"
import { SeasonRouteConfig } from "./!routeConfig"

export default (async ({
	data,
	initialData: { seasonCollection, season },
	uid,
}) => {
	const { permit } = data
	const events = await getActiveEvents(seasonCollection)
	const permitted = await permit.bulkCheck(
		events.map<ICheckQuery>((event) => ({
			user: uid,
			action: "read",
			resource: {
				type: "event",
				key: event.code,
				tenant: season,
			},
		})),
	)
	return eventZod.array().parse(events.filter((_, index) => permitted[index]))
}) satisfies PrimaryDataCallback<SeasonRouteConfig>
