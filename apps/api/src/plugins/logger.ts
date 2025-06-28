import { wrap } from "@bogeychan/elysia-logger"
import Elysia from "elysia"
import { pino } from "pino"

export const logger = pino({
	level: "debug",
	transport: {
		target: "pino-pretty",
		options: {
			translateTime: "HH:MM:ss Z",
			ignore: "pid,hostname",
		},
	},
})

export default new Elysia()
	.use(wrap(logger, { autoLogging: false }))
	.as("global")
