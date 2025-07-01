import type { ElysiaApp } from "@/server"

export default (app: ElysiaApp) =>
	app.get("", async ({ status }) => status(200, { status: "ok" }))
