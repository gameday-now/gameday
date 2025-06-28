import serviceAccount from "@/adminsdk.json"
import Elysia from "elysia"
import admin from "firebase-admin"

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as object),
})

export type Firebase = { auth: ReturnType<typeof admin.auth> }

export default new Elysia()
	.decorate(() => ({
		firebase: { auth: admin.auth() } as Firebase,
	}))
	.as("global")
