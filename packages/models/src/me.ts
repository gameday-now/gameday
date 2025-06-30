import z from "zod"

export const meRoleResource = z.object({
	key: z.string(),
	name: z.string(),
})

export const meRoleZod = z.object({
	id: z.string(),
	name: z.string(),
	season: z.string(),
	resource: meRoleResource.optional(),
})

export type MeRole = z.infer<typeof meRoleZod>

export const meResponseZod = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	roles: meRoleZod.array(),
})

export type MeResponse = z.infer<typeof meResponseZod>
