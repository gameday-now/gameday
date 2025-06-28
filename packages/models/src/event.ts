import { z } from "zod"
import { deepPartial } from "./utils"

export const eventZod = z.object({
	code: z.string(),
	name: z.string(),
	typeName: z.string(),
	venue: z.string().nullable(),
	address: z.string().nullable(),
	city: z.string(),
	country: z.string(),
	dateStart: z.string(),
	dateEnd: z.string(),
	gamedayActive: z.boolean().optional(),
	gamedayImage: z.string().optional().nullable(),
})

export const partialEventZod = deepPartial(eventZod)

export type Event = z.infer<typeof eventZod>

export const eventConfigZod = z.object({
	cycleTime: z.number(),
	potentialBreaks: z.string().array(),
	fields: z.number(),
	leadQueuerReviewed: z.boolean(),
})

export type EventConfig = z.infer<typeof eventConfigZod>
