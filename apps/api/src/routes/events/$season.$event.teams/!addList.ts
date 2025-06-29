import { ActionDeclaration } from "@/lib/actionSocket/types"
import { ADD_TEAM_LIST_PERMISSION } from "@gameday/models"
import { v4 as uuid } from "uuid"
import { TeamsRouteConfig } from "./!routeConfig"

export default {
	permission: ADD_TEAM_LIST_PERMISSION,
	fn: async ({ initialData: { teamListsCollection }, request }) => {
		const { listName } = request

		await teamListsCollection.insertOne({
			_id: uuid(),
			creationDate: new Date(),
			listName,
		})

		return {
			type: "response",
			message: "Ok",
		}
	},
} satisfies ActionDeclaration<TeamsRouteConfig, "addList">
