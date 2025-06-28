import { InitialCallback, RouteConfig } from "@/lib/actionSocket/types"
import { getSeasonCollection } from "@/lib/events"
import { Event } from "@gameday/models"

export const initialCallback = (async ({ send, data: { params, mongo } }) => {
	const searchParams = new URLSearchParams(params)
	const season = searchParams.get("season")
	if (!season) {
		send({
			type: "error",
			message: "Season not provided",
		})
		throw Error("Season not provided")
	}

	const seasonCollection = await getSeasonCollection({
		mongo: mongo,
		season,
	})
	return { seasonCollection, season }
}) satisfies InitialCallback

export type SeasonRouteConfig = RouteConfig<typeof initialCallback, Event[], {}>
