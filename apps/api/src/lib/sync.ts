import { Event, EventConfig, Match, Team } from "@gameday/models"
import { MongoClient } from "mongodb"
import { Logger } from "pino"
import { mergeEvents } from "./events"
import { getEvents, getMatches, getSeasonInfo, getTeams } from "./ftc"
import { analyzeCycleTime, getAllMatches, mergeMatches } from "./matches"
import { getAllTeams, mergeTeams } from "./teams"

export const syncAllEvents = async ({
	log,
	mongo,
}: {
	log: Logger
	mongo: MongoClient
}) => {
	log.info("Starting events sync")
	try {
		const { currentSeason } = await getSeasonInfo()
		log.info(`Received current season: ${currentSeason}`)
		const receivedEvents = await getEvents(currentSeason)
		log.info(`Received ${receivedEvents.length} events`)
		log.info("Getting events from Mongo")
		const database = mongo.db("events")
		const season = database.collection<Event>(`${currentSeason}`)
		const storedEvents = await season.find().toArray()
		log.info(`Received ${storedEvents.length} events`)
		const bulkOps = mergeEvents(receivedEvents, storedEvents)
		const result = await season.bulkWrite(bulkOps)
		if (
			result.deletedCount > 0 ||
			result.insertedCount > 0 ||
			result.modifiedCount > 0
		) {
			log.info("Bulk operation result")
			log.info(result)
		} else {
			log.info("Events unchanged")
		}
		log.info("Done")
	} catch (error) {
		log.error("Error during events sync")
		log.error(error)
	}
}

export const syncEvent = async ({
	log,
	mongo,
	season,
	eventCode,
}: {
	log: Logger
	mongo: MongoClient
	season: string
	eventCode: string
}) => {
	const events_database = mongo.db("events")
	const seasonCollection = events_database.collection(season ?? "")
	const event = await seasonCollection.findOne({
		gamedayActive: true,
		code: eventCode,
	})
	if (!event || !eventCode || !season || isNaN(Number(season))) {
		throw Error("Event not found")
	}
	log.info("Starting matches sync")
	const database = mongo.db(`${season}_${eventCode}`)
	const matchesCollection = database.collection<Match>("matches")
	const qualSchedule = await getMatches(Number(season), eventCode, "qual")
	const playoffSchedule = await getMatches(
		Number(season),
		eventCode,
		"playoff",
	)
	const storedMatches = await getAllMatches(matchesCollection)
	const receivedMatches = [...qualSchedule, ...playoffSchedule]
	const matchBulkOps = mergeMatches(receivedMatches, storedMatches)
	if (matchBulkOps.length > 0) {
		const matchesResult = await matchesCollection.bulkWrite(matchBulkOps)
		if (
			matchesResult.deletedCount > 0 ||
			matchesResult.insertedCount > 0 ||
			matchesResult.modifiedCount > 0
		) {
			log.info("Bulk operation result")
			log.info(matchesResult)
			const newMatches = await getAllMatches(matchesCollection)
			const eventConfigCollection =
				database.collection<EventConfig>("config")
			if (newMatches.length > 0) {
				const { cycleTime, potentialBreaks, fields } =
					analyzeCycleTime(newMatches)
				await eventConfigCollection.updateOne(
					{},
					{
						$set: {
							cycleTime,
							potentialBreaks,
							fields,
						},
						$setOnInsert: {
							leadQueuerReviewed: false,
						},
					},
					{ upsert: true },
				)
			} else {
				await eventConfigCollection.deleteMany()
			}
		} else {
			log.info("Matches unchanged")
		}
	} else {
		log.info("No matches generated")
	}
	log.info("Done")

	const teamsCollection = database.collection<Team>("teams")
	const receivedTeams = await getTeams(Number(season), eventCode)
	const storedTeams = await getAllTeams(teamsCollection)
	log.info(`${receivedTeams.length} teams are registered on this event`)
	const teamBulkOps = mergeTeams(receivedTeams, storedTeams)
	if (teamBulkOps.length > 0) {
		const teamsResult = await teamsCollection.bulkWrite(teamBulkOps)
		if (
			teamsResult.deletedCount > 0 ||
			teamsResult.insertedCount > 0 ||
			teamsResult.modifiedCount > 0
		) {
			log.info("Bulk operation result")
			log.info(teamsResult)
		} else {
			log.info("Teams unchanged")
		}
	} else {
		log.info("No teams assigned")
	}
	log.info("Done")
}
