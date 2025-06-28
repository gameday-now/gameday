import {
	AddBreak,
	BeginQueuing,
	MatchTeamStatus,
	NewBreak,
	NewRematch,
	PromoteToDeck,
	QueuerResponse,
	ReviewSchedule,
	ScheduleRematch,
	UpdateAttendance,
} from "@gameday/models"
import useGenericConnection from "./useGenericConnection"

export const useQueuer = ({
	season,
	event,
}: {
	season: string
	event: string
}) => {
	const { data, sendAction, permissions } =
		useGenericConnection<QueuerResponse>(`events/${season}/${event}/queuer`)

	const updateAttendance = async (
		matchId: string,
		teamNumber: number,
		attendance: MatchTeamStatus,
	) => {
		await sendAction<UpdateAttendance>({
			type: "updateAttendance",
			matchId,
			teamNumber,
			attendance,
		})
	}

	const promoteToDeck = async (matchId: string) => {
		await sendAction<PromoteToDeck>({
			type: "promoteToDeck",
			matchId,
		})
	}

	const beginQueuing = async (matchId: string) => {
		await sendAction<BeginQueuing>({
			type: "beginQueuing",
			matchId,
		})
	}

	const addBreak = async (values: NewBreak) => {
		await sendAction<AddBreak>({
			type: "addBreak",
			...values,
		})
	}

	const scheduleRematch = async (values: NewRematch) => {
		await sendAction<ScheduleRematch>({
			type: "scheduleRematch",
			...values,
		})
	}

	const reviewSchedule = async (breaks: NewBreak[]) => {
		await sendAction<ReviewSchedule>({
			type: "reviewSchedule",
			breaks,
		})
	}

	return {
		permissions,
		response: data,
		updateAttendance,
		promoteToDeck,
		beginQueuing,
		addBreak,
		scheduleRematch,
		reviewSchedule,
	}
}
