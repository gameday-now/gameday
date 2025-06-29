import { SocketError } from "@/lib/actionSocket/error"
import { ActionDeclaration } from "@/lib/actionSocket/types"
import { DELETE_TEAM_LIST_PERMISSION } from "@gameday/models"
import { TeamsRouteConfig } from "./!routeConfig"

export default {
	permission: DELETE_TEAM_LIST_PERMISSION,
	fn: async ({ initialData: { teamListsCollection }, request }) => {
		const { _id } = request

		const response = await teamListsCollection.deleteOne({
			_id,
		})

		if (response.deletedCount === 0) {
			throw new SocketError({
				message: "List not found",
			})
		}

		return {
			type: "response",
			message: "Ok",
		}
	},
} satisfies ActionDeclaration<TeamsRouteConfig, "deleteList">
