import { getSession, getUserId } from "@/lib/actionSocket/auth"
import { getSeasonInfo } from "@/lib/ftc"
import type { ElysiaApp } from "@/server"
import { meResponseZod, MeRole } from "@gameday/models"
import { Box } from "@sinclair/typebox-adapter"
import z from "zod"

export default (app: ElysiaApp) =>
	app.get(
		"",
		async ({ request, firebase, log, status, permit }) => {
			try {
				const session = getSession(request)
				const uid = await getUserId({ firebase, session })
				if (!uid) {
					return status(401, {
						success: false,
						message: "Unauthenticated",
					})
				}
				const { currentSeason } = await getSeasonInfo()
				const user = await permit.api.users.get(uid)
				const roles = await permit.api.users.getAssignedRoles({
					user: uid,
					tenant: String(currentSeason),
					detailed: true,
				})

				return status(
					200,
					meResponseZod.parse({
						firstName: user.first_name,
						lastName: user.last_name,
						roles: roles
							.map<MeRole>(
								({ id, role, tenant, resource_instance }) => ({
									id,
									name: role.name,
									season: tenant.name,
									resource: resource_instance
										? {
												key: resource_instance.key,
												name: resource_instance.resource,
											}
										: undefined,
								}),
							)
							.sort(
								(a, b) =>
									(a.resource ? 1 : 0) - (b.resource ? 1 : 0),
							),
					}),
				)
			} catch (error) {
				log.error(error)
				return status(401, {
					success: false,
					message: "Unauthenticated",
				})
			}
		},
		{ body: Box(z.object({ token: z.string() })) },
	)
