import { PrimaryDataCallback } from "@/lib/actionSocket/types"
import { getImage } from "@/lib/images"
import { eventZod } from "@gameday/models"
import { EventRouteConfig } from "./!routeConfig"

export default (async ({
	data,
	initialData: { seasonCollection, eventCode },
}) => {
	const queryResponse = await seasonCollection.findOne({
		code: eventCode.toUpperCase(),
	})
	const event = eventZod.parse(queryResponse)
	if (!event.gamedayImage) {
		const image = await getImage(event)
		data.log.info(`${event.city}: ${image}`)
		await seasonCollection.updateOne(
			{ code: eventCode.toUpperCase() },
			{
				$set: {
					[`gamedayImage`]: image,
				},
			},
		)
		return { ...event, gamedayImage: image }
	}

	return event
}) satisfies PrimaryDataCallback<EventRouteConfig>
