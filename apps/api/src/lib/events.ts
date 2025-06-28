import { Event, EventInfo, partialEventZod } from "@gameday/models"
import { subDays } from "date-fns"
import { AnyBulkWriteOperation, Collection, MongoClient } from "mongodb"
import { deepDiff } from "./objectUtils"

export const getSeasonCollection = async ({
	season,
	mongo,
}: {
	season: string
	mongo: MongoClient
}) => {
	const eventsDatabase = mongo.db("events")
	const foundCollections = await eventsDatabase
		.listCollections({ name: season }, { nameOnly: true })
		.toArray()
	if (!foundCollections.find((collection) => collection.name === season)) {
		throw Error("Season not found")
	}
	return eventsDatabase.collection<Event>(season)
}

export const mergeEvents = (
	receivedEvents: EventInfo[],
	storedEvents: Event[],
) => {
	const bulkOps: AnyBulkWriteOperation<Event>[] = []
	// Keep track "touched" events. At the end of the process, all "untouched" events will be deleted
	const touchedEvents: Record<string, boolean> = {}

	for (const receivedEvent of receivedEvents) {
		// Find existing event from stored events
		const currentEvent = storedEvents.find(
			({ code }) => receivedEvent.code === code,
		)

		if (!currentEvent) {
			// This event does not exists, need to create it
			bulkOps.push({
				insertOne: {
					document: {
						...receivedEvent,
					},
				},
			})
		} else {
			touchedEvents[receivedEvent.code] = true
			const newObject = deepDiff(
				currentEvent,
				partialEventZod.parse(receivedEvent),
			)

			bulkOps.push({
				updateOne: {
					filter: { code: currentEvent.code },
					update: { $set: newObject },
				},
			})
		}
	}

	const eventsToRemove = storedEvents
		.filter(({ code }) => !(code in touchedEvents))
		.map<AnyBulkWriteOperation<Event>>(({ code }) => ({
			deleteOne: {
				filter: { code },
			},
		}))

	return [...bulkOps, ...eventsToRemove]
}

export const getActiveEvents = async (seasonCollection: Collection<Event>) =>
	await seasonCollection
		.find({
			gamedayActive: true,
			dateEnd: {
				$gte: new Date(
					subDays(new Date(), 8).toDateString(),
				).toISOString(),
			},
		})
		.toArray()
