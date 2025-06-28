import { getActiveEvents, getSeasonCollection } from "@/lib/events"
import { getSeasonInfo } from "@/lib/ftc"
import { syncAllEvents, syncEvent } from "@/lib/sync"
import cron from "@elysiajs/cron"
import Elysia from "elysia"
import { logger } from "./logger"
import mongo from "./mongo"

export default new Elysia().use(mongo).use((app) =>
	app
		.use(
			cron({
				name: "All Events Sync",
				pattern: "0 * * * *",
				run: async () => {
					await syncAllEvents({
						mongo: app.decorator.mongo,
						log: logger,
					})
				},
			}),
		)
		.use(
			cron({
				name: "Active Events Sync",
				pattern: "*/5 * * * * *",
				protect: true,
				run: async () => {
					const { currentSeason } = await getSeasonInfo()
					const seasonCollection = await getSeasonCollection({
						mongo: app.decorator.mongo,
						season: String(currentSeason),
					})
					const events = await getActiveEvents(seasonCollection)
					for (const { code } of events) {
						logger.info(`${currentSeason} ${code}`)
						await syncEvent({
							eventCode: code,
							season: String(currentSeason),
							log: logger,
							mongo: app.decorator.mongo,
						})
					}
				},
			}),
		),
)
