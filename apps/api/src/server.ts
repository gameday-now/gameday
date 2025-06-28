import cron from "@/plugins/cron"
import firebasePlugin from "@/plugins/firebase"
import loggerPlugin, { logger } from "@/plugins/logger"
import mongoPlugin from "@/plugins/mongo"
import permitPlugin from "@/plugins/permit"
import { cors } from "@elysiajs/cors"
import { serverTiming } from "@elysiajs/server-timing"
import staticPlugin from "@elysiajs/static"
import { swagger } from "@elysiajs/swagger"
import { autoload } from "@gameday/router"
import { Elysia } from "elysia"

export const app = new Elysia()
	.use(
		serverTiming({
			report: false,
			trace: { total: true },
		}),
	)
	.use(mongoPlugin)
	.use(loggerPlugin)
	.use(permitPlugin)
	.use(firebasePlugin)
	.use(cors({ origin: "*" }))
	.use(swagger())
	.onBeforeHandle(({ request }) => {
		logger.info(
			`Request received ${request.method} ${new URL(request.url).pathname}`,
		)
	})
	.use(cron)
	.use(
		await autoload({
			prefix: "/api",
		}),
	)
	.use(
		staticPlugin({
			prefix: "/",
		}),
	)
	.get("/*", () => Bun.file(`./public/index.html`))

export type ElysiaApp = typeof app
