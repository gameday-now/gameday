import z from "zod"
import { breakZod } from "./break"
import { eventConfigZod } from "./event"
import { matchZod } from "./match"

export const queuerResponseZod = z.object({
	matches: matchZod.array(),
	breaks: z.record(breakZod),
	config: eventConfigZod.nullable(),
})

export type QueuerResponse = z.infer<typeof queuerResponseZod>
