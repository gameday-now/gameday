import { z } from "zod"
import { newBreakZod } from "../break"
import { matchTeamStatusZod, newRematchZod } from "../match"

export const updateAttendanceZod = z.object({
	type: z.literal("updateAttendance"),
	matchId: z.string(),
	teamNumber: z.number(),
	attendance: matchTeamStatusZod,
})

export type UpdateAttendance = z.infer<typeof updateAttendanceZod>

export const promoteToDeckZod = z.object({
	type: z.literal("promoteToDeck"),
	matchId: z.string(),
})

export type PromoteToDeck = z.infer<typeof promoteToDeckZod>

export const beginQueuingZod = z.object({
	type: z.literal("beginQueuing"),
	matchId: z.string(),
})

export type BeginQueuing = z.infer<typeof beginQueuingZod>

export const addBreakZod = z
	.object({
		type: z.literal("addBreak"),
	})
	.merge(newBreakZod)

export type AddBreak = z.infer<typeof addBreakZod>

export const scheduleRematchZod = z
	.object({
		type: z.literal("scheduleRematch"),
	})
	.merge(newRematchZod)

export type ScheduleRematch = z.infer<typeof scheduleRematchZod>

export const reviewScheduleZod = z.object({
	type: z.literal("reviewSchedule"),
	breaks: newBreakZod.array(),
})

export type ReviewSchedule = z.infer<typeof reviewScheduleZod>
