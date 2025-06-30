import { config } from "@/config"
import type { ElysiaApp } from "@/server"
import { Box } from "@sinclair/typebox-adapter"
import z from "zod"

export default (app: ElysiaApp) =>
	app.post(
		"",
		async ({ body: { token }, firebase, log, status, cookie, permit }) => {
			try {
				log.info("Login attempt started")
				const { uid } = await firebase.auth.verifyIdToken(token)
				log.info(`Successfully verified token for user ${uid}`)
				cookie.session?.set({
					value: token,
					httpOnly: true,
					secure: config.NODE_ENV === "production",
					sameSite: "lax",
					path: "/",
					expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), //Two Days
				})
				const firebaseUser = await firebase.auth.getUser(uid)
				const [first_name, ...last_name] =
					firebaseUser.displayName?.split(" ") ?? [
						"Temporary",
						"User",
					]
				log.info(
					`Successfully retrieved user ${first_name} ${last_name.join(" ")}`,
				)
				log.info(`Syncing user ${uid} with Permit PDP`)
				const syncResult = await permit.api.users.sync({
					key: uid,
					first_name,
					last_name: last_name.join(" "),
					email: firebaseUser.email,
				})
				log.info(
					`User ${uid} synced with Permit PDP successfully ${syncResult.user.environment_id}`,
				)
				return status(200, { success: true })
			} catch (error) {
				log.error(error)
				return status(403, { success: false, message: "Unauthorized" })
			}
		},
		{ body: Box(z.object({ token: z.string() })) },
	)
