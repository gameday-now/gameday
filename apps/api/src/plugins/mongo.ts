import { config } from "@/config"
import Elysia from "elysia"
import { MongoClient } from "mongodb"

export default new Elysia()
	.decorate("mongo", new MongoClient(config.MONGO_URI ?? ""))
	.as("global")
