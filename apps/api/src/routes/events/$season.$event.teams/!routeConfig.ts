import {
	InitialCallback,
	RouteConfig,
	SocketActions,
} from "@/lib/actionSocket/types"
import {
	addListZod,
	deleteListZod,
	markTeamZod,
	Team,
	TeamList,
	TeamsResponse,
} from "@gameday/models"

export const actions = {
	markTeam: markTeamZod,
	addList: addListZod,
	deleteList: deleteListZod,
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
	const teamsCollection = eventsDatabase.collection<Team>("teams")
	const teamListsCollection = eventsDatabase.collection<TeamList>("teamLists")

	return {
		teamsCollection,
		teamListsCollection,
	}
}) satisfies InitialCallback

export type TeamsRouteConfig = RouteConfig<
	typeof initialCallback,
	TeamsResponse,
	typeof actions
>
