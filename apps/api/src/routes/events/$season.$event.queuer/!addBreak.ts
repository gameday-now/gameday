import { SocketError } from "@/lib/actionSocket/error"
import { ActionDeclaration } from "@/lib/actionSocket/types"
import { ADD_BREAK_PERMISSION } from "@gameday/models"
import { QueuerRouteConfig } from "./!routeConfig"

export default {
	permission: ADD_BREAK_PERMISSION,
	fn: async ({
		initialData: { matchesCollection, breaksCollection },
		request,
	}) => {
		const { afterMatchId } = request
		const foundBreak = await breaksCollection.findOne({
			_id: afterMatchId,
		})

		if (foundBreak) {
			throw new SocketError({
				message: "Break already exists",
			})
		}

		const match = await matchesCollection.findOne({
			description: afterMatchId,
		})

		if (!match) {
			throw new SocketError({
				message: "Match not found",
			})
		}

		await breaksCollection.insertOne({
			_id: afterMatchId,
			...request,
		})

		return {
			type: "response",
			message: "Ok",
		}
	},
} satisfies ActionDeclaration<QueuerRouteConfig, "addBreak">
