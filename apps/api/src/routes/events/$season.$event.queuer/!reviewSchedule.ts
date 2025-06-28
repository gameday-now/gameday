import { SocketError } from "@/lib/actionSocket/error"
import { ActionDeclaration } from "@/lib/actionSocket/types"
import { REVIEW_EVENT_SCHEDULE_PERMISSION } from "@gameday/models"
import { QueuerRouteConfig } from "./!routeConfig"

export default {
	permission: REVIEW_EVENT_SCHEDULE_PERMISSION,
	fn: async ({
		initialData: {
			matchesCollection,
			breaksCollection,
			eventConfigCollection,
		},
		request,
	}) => {
		const { breaks } = request

		const configs = await eventConfigCollection.find().toArray()

		if (configs.length !== 1 || configs[0]!.leadQueuerReviewed) {
			throw new SocketError({
				message: "Event schedule has already been reviewed",
			})
		}

		const foundBreaks = await breaksCollection
			.find({
				_id: { $in: breaks.map((b) => b.afterMatchId) },
			})
			.toArray()

		if (foundBreaks.length > 0) {
			throw new SocketError({
				message: "Some of the breaks already exist",
			})
		}

		const match = await matchesCollection
			.find({
				description: { $in: breaks.map((b) => b.afterMatchId) },
			})
			.toArray()

		if (!match) {
			throw new SocketError({
				message: "One or more matches not found",
			})
		}

		await eventConfigCollection.updateMany(
			{},
			{
				$set: {
					leadQueuerReviewed: true,
				},
			},
		)

		await breaksCollection.insertMany(
			breaks.map((b) => ({
				_id: b.afterMatchId,
				...b,
			})),
		)

		return {
			type: "response",
			message: "Ok",
		}
	},
} satisfies ActionDeclaration<QueuerRouteConfig, "reviewSchedule">
