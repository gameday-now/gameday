import { z } from "zod"
import { matchTeamZod } from "./team"
import { deepPartial } from "./utils"

export const matchTeamStatusZod = z
	.enum(["present", "driver_only"])
	.or(z.null())

export type MatchTeamStatus = z.infer<typeof matchTeamStatusZod>

const implicitMatchStatusZod = z.enum(["now_queuing", "on_deck"])

export type ImplicitMatchStatus = z.infer<typeof implicitMatchStatusZod>

const matchStatusZod = z
	.enum(["scheduled", "in_match", "completed"])
	.or(implicitMatchStatusZod)

export type MatchStatus = z.infer<typeof matchStatusZod>

export const rematchAnchorPointZod = z.object({
	type: z.enum(["before_break", "after_break", "after_last_qual"]),
	breakId: z.string(),
	order: z.number().int().nonnegative(),
})

export type RematchAnchorPoint = z.infer<typeof rematchAnchorPointZod>

export const rematchAnchorPointWithoutOrderZod = rematchAnchorPointZod.omit({
	order: true,
})

export type RematchAnchorPointWithoutOrder = z.infer<
	typeof rematchAnchorPointWithoutOrderZod
>

export const matchZod = z.object({
	description: z.string(),
	originalMatchDescription: z.string(),
	rematchAnchorPoint: rematchAnchorPointZod.optional().nullable(),
	title: z.string(),
	series: z.number(),
	matchNumber: z.number(),
	startTime: z.string(),
	tournamentLevel: z.enum(["QUALIFICATION", "PLAYOFF"]),
	actualStartTime: z.string().nullable(),
	postResultTime: z.string().nullable(),
	field: z.number(),
	status: matchStatusZod,
	gameday: z
		.object({
			status: implicitMatchStatusZod.optional(),
			teams: z
				.record(
					z.coerce.number(),
					z.object({
						attendance: matchTeamStatusZod.optional(),
					}),
				)
				.optional(),
		})
		.optional(),
	teams: z.array(matchTeamZod),
})

export const partialMatchZod = deepPartial(matchZod)

export type Match = z.infer<typeof matchZod>

export const newRematchZod = z.object({
	originalMatchId: z.string(),
	anchorPoint: rematchAnchorPointWithoutOrderZod,
})

export type NewRematch = z.infer<typeof newRematchZod>
