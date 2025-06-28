import { logger } from "@/plugins/logger.ts"
import { config } from "./config.ts"
import { app } from "./server.ts"

const signals = ["SIGINT", "SIGTERM"]

for (const signal of signals) {
	process.on(signal, async () => {
		logger.fatal(`Received ${signal}. Initiating graceful shutdown...`)
		await app.stop()
		process.exit(0)
	})
}

process.on("uncaughtException", (error) => {
	logger.error(error)
})

process.on("unhandledRejection", (error) => {
	logger.error(error)
})

app.listen(config.PORT, () => {
	logger.info(`🦊 Server started at ${app.server?.url.origin}`)
})
