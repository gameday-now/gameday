import { z } from "zod"

export const actionRequestZod = z.object({
	actionId: z.string().uuid().nullable(),
	type: z.string(),
})

export type ActionRequest = z.infer<typeof actionRequestZod>

export const actionResponseZod = z.object({
	actionId: z.string().uuid().nullable().optional(),
	type: z.enum(["data", "error", "response", "permissions"]),
	message: z.string().optional(),
	data: z.any().optional(),
})

export type ActionResponse = z.infer<typeof actionResponseZod>
