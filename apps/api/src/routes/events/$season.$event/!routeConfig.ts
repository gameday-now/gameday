import { InitialCallback, RouteConfig } from "@/lib/actionSocket/types"
import { getSeasonCollection } from "@/lib/events"
import { Event } from "@gameday/models"

export const initialCallback = (async ({ send, data: { params, mongo } }) => {
	const searchParams = new URLSearchParams(params)
	const season = searchParams.get("season")
	const eventCode = searchParams.get("event")
	if (!season || !eventCode) {
		send({
			type: "error",
			message: "Season not found",
		})
		throw Error("Season not found")
	}

	const seasonCollection = await getSeasonCollection({
		season: season ?? "",
		mongo,
	})

	return { seasonCollection, eventCode }
}) satisfies InitialCallback

export type EventRouteConfig = RouteConfig<typeof initialCallback, Event, {}>
