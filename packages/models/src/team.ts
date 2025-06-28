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
