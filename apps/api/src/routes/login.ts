import type { ElysiaApp } from "@/server"
import { Box } from "@sinclair/typebox-adapter"
import z from "zod"

export default (app: ElysiaApp) =>
	app.post(
		"",
		async ({ body: { token }, firebase, log, status, cookie, permit }) => {
			try {
				const { uid } = await firebase.auth.verifyIdToken(token)
				cookie.session?.set({
					value: token,
					httpOnly: true,
					// secure: true,
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
				await permit.api.users.sync({
					key: uid,
					first_name,
					last_name: last_name.join(" "),
					email: firebaseUser.email,
				})
				return status(200, { success: true })
			} catch (error) {
				log.error(error)
				return status(401, { success: false, message: "Unauthorized" })
			}
		},
		{ body: Box(z.object({ token: z.string() })) },
	)
