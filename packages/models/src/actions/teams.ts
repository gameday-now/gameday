import { z } from "zod"
import { newTeamListZod, teamListZod } from "../team"

export const markTeamZod = z.object({
	type: z.literal("markTeam"),
	teamNumber: z.number(),
	checked: z.boolean(),
	listId: z.string(),
})

export type MarkTeam = z.infer<typeof markTeamZod>

export const addListZod = z
	.object({
		type: z.literal("addList"),
	})
	.merge(newTeamListZod)

export type AddList = z.infer<typeof addListZod>

export const deleteListZod = z
	.object({
		type: z.literal("deleteList"),
	})
	.merge(teamListZod.pick({ _id: true }).required())

export type DeleteList = z.infer<typeof deleteListZod>
