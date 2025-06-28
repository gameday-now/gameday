import { z } from "zod"

export const breakZod = z.object({
	_id: z.string(),
	afterMatchId: z.string().min(1),
	title: z.string().min(1),
	startTime: z.string(),
	endTime: z.string(),
})

export type Break = z.infer<typeof breakZod>

export const newBreakZod = breakZod.omit({
	_id: true,
})

export type NewBreak = z.infer<typeof newBreakZod>
