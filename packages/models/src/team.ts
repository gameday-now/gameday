import { z } from "zod"

export const teamZod = z.object({
	displayTeamNumber: z.string(),
	teamNumber: z.number(),
	teamName: z.string(),
})

export type Team = z.infer<typeof teamZod>

export const matchTeamZod = z.object({
	id: z.string(),
	teamNumber: z.number(),
	teamName: z.string(),
	station: z.string(),
	surrogate: z.boolean(),
	noShow: z.boolean(),
})

export type MatchTeam = z.infer<typeof matchTeamZod>

export const teamListZod = z.object({
	_id: z.string(),
	creationDate: z.date(),
	listName: z.string(),
	listChecks: z.record(z.boolean()).optional(),
})

export type TeamList = z.infer<typeof teamListZod>

export const teamsResponseZod = z.object({
	teams: teamZod.array(),
	teamLists: teamListZod.array(),
})

export type TeamsResponse = z.infer<typeof teamsResponseZod>

export const newTeamListZod = z.object({
	listName: z.string().min(1),
})

export type NewTeamList = z.infer<typeof newTeamListZod>
