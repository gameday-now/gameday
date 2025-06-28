import { SocketError } from "@/lib/actionSocket/error"
import { ActionDeclaration } from "@/lib/actionSocket/types"
import {
	RematchAnchorPoint,
	SCHEDULE_REMATCH_PERMISSION,
} from "@gameday/models"
import { QueuerRouteConfig } from "./!routeConfig"
import ScheduleRematchAfterBreak from "./!scheduleRematch.afterBreak"
import ScheduleRematchAfterLastQual from "./!scheduleRematch.afterLastQual"
import ScheduleRematchBeforeBreak from "./!scheduleRematch.beforeBreak"
import {
	matchesOnTheSameAnchorPointQuery,
	MatchRescheduleAdditionalInformationCallback,
} from "./!scheduleRematch.utils"

export default {
	permission: SCHEDULE_REMATCH_PERMISSION,
	fn: async (params) => {
		const { initialData, request } = params
		const { matchesCollection, eventConfigCollection, breaksCollection } =
			initialData
		const { anchorPoint, originalMatchId } = request
		const newMatchId = `${originalMatchId} - Rematch`
		const config = await eventConfigCollection.findOne()

		if (!config) {
			throw new SocketError({
				message: "Event config not found",
			})
		}

		const foundRematch = await matchesCollection.findOne({
			description: newMatchId,
		})

		if (foundRematch) {
			throw new SocketError({
				message: "Rematch already exists",
			})
		}

		const originalMatch = await matchesCollection.findOne({
			description: originalMatchId,
		})

		if (!originalMatch) {
			throw new SocketError({
				message: "Original Match not found",
			})
		}

		if (
			anchorPoint.type === "after_break" ||
			anchorPoint.type === "before_break"
		) {
			const anchoredBreak = await breaksCollection.findOne({
				_id: anchorPoint.breakId,
			})
			if (!anchoredBreak) {
				throw new SocketError({
					message: "Break not found",
				})
			}
		}

		const matchesOnSameAnchorPoint = (
			await matchesCollection
				.find(matchesOnTheSameAnchorPointQuery(anchorPoint))
				.toArray()
		).sort(
			({ rematchAnchorPoint: a }, { rematchAnchorPoint: b }) =>
				(b?.order ?? 0) - (a?.order ?? 0),
		)

		const additionalInformationGetter: Record<
			RematchAnchorPoint["type"],
			MatchRescheduleAdditionalInformationCallback
		> = {
			before_break: ScheduleRematchBeforeBreak,
			after_break: ScheduleRematchAfterBreak,
			after_last_qual: ScheduleRematchAfterLastQual,
		}

		const additionalInformation = await additionalInformationGetter[
			anchorPoint.type
		]({
			...params,
			matchesOnSameAnchorPoint,
			config,
		})

		await matchesCollection.insertOne({
			description: `${originalMatch.description} - Rematch`,
			series: originalMatch.series,
			startTime: additionalInformation.startTime,
			field: additionalInformation.field,
			rematchAnchorPoint: {
				...anchorPoint,
				order: additionalInformation.order,
			},
			actualStartTime: null,
			matchNumber: originalMatch.matchNumber,
			postResultTime: null,
			tournamentLevel: originalMatch.tournamentLevel,
			teams: originalMatch.teams,
			title: `${originalMatch.title} - Rematch`,
			originalMatchDescription: originalMatch.description,
			status: "scheduled",
		})

		return {
			type: "response",
			message: "Ok",
		}
	},
} satisfies ActionDeclaration<QueuerRouteConfig, "scheduleRematch">
