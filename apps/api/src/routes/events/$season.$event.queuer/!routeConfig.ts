import {
	InitialCallback,
	RouteConfig,
	SocketActions,
} from "@/lib/actionSocket/types"
import {
	addBreakZod,
	beginQueuingZod,
	Break,
	EventConfig,
	Match,
	promoteToDeckZod,
	QueuerResponse,
	reviewScheduleZod,
	scheduleRematchZod,
	updateAttendanceZod,
} from "@gameday/models"

export const actions = {
	updateAttendance: updateAttendanceZod,
	promoteToDeck: promoteToDeckZod,
	beginQueuing: beginQueuingZod,
	addBreak: addBreakZod,
	scheduleRematch: scheduleRematchZod,
	reviewSchedule: reviewScheduleZod,
} satisfies SocketActions

export const initialCallback = (async ({ send, data: { params, mongo } }) => {
	const searchParams = new URLSearchParams(params)
	const season = searchParams.get("season")
	const eventCode = searchParams.get("event")?.toUpperCase()
	const { databases } = await mongo.db().admin().listDatabases()
	const eventDatabaseName = `${season}_${eventCode}`
	const eventDatabase = databases.find((db) => db.name === eventDatabaseName)
	if (!eventDatabase || !season || !eventCode) {
		send({
			type: "error",
			message: "Event database not found",
		})
		throw Error("Event database not found")
	}
	const eventsDatabase = mongo.db(`${season}_${eventCode}`)
	const matchesCollection = eventsDatabase.collection<Match>("matches")
	const breaksCollection = eventsDatabase.collection<Break>("breaks")
	const eventConfigCollection =
		eventsDatabase.collection<EventConfig>("config")

	return {
		matchesCollection,
		breaksCollection,
		eventConfigCollection,
		season,
		eventCode,
	}
}) satisfies InitialCallback

export type QueuerRouteConfig = RouteConfig<
	typeof initialCallback,
	QueuerResponse,
	typeof actions
>
