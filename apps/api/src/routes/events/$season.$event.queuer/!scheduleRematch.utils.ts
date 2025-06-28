import { ActionDeclaration } from "@/lib/actionSocket/types"
import {
	EventConfig,
	Match,
	RematchAnchorPointWithoutOrder,
} from "@gameday/models"
import { addMinutes, format, subMinutes } from "date-fns"
import { WithId } from "mongodb"
import { QueuerRouteConfig } from "./!routeConfig"

export const changeByOneCycleTime = (
	startTime: string,
	offset: 1 | -1,
	{ cycleTime }: EventConfig,
) =>
	format(
		(offset === 1 ? addMinutes : subMinutes)(startTime, cycleTime ?? 0),
		"yyyy-MM-dd'T'HH:mm:ss",
	)

export const getField = (
	currentField: number,
	offset: 1 | -1,
	{ fields }: EventConfig,
) => (fields <= 1 ? 1 : ((currentField - 1 + offset + fields) % fields) + 1)

export type additionalInformation = {
	startTime: string
	field: number
	order: number
}

export type MatchRescheduleAdditionalInformationCallback = (
	params: Parameters<
		ActionDeclaration<QueuerRouteConfig, "scheduleRematch">["fn"]
	>[0] & {
		matchesOnSameAnchorPoint: WithId<Match>[]
		config: EventConfig
	},
) => Promise<additionalInformation>

export const matchesOnTheSameAnchorPointQuery = (
	anchorPoint: RematchAnchorPointWithoutOrder,
) => ({
	"rematchAnchorPoint.type": anchorPoint.type,
	...("breakId" in anchorPoint
		? { "rematchAnchorPoint.breakId": anchorPoint.breakId }
		: {}),
})
