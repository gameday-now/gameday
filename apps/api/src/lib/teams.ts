import { Team, TeamList, teamListZod, teamZod } from "@gameday/models"
import { AnyBulkWriteOperation, Collection } from "mongodb"
import { deepDiff } from "./objectUtils"

export const getAllTeams = async (
	teamsCollection: Collection<Team>,
): Promise<Team[]> =>
	teamZod.array().parse(await teamsCollection.find().toArray())

export const getAllTeamLists = async (
	teamsListsCollection: Collection<TeamList>,
): Promise<TeamList[]> =>
	teamListZod
		.array()
		.parse(
			await teamsListsCollection
				.find()
				.sort({ creationDate: -1 })
				.toArray(),
		)

export const mergeTeams = (receivedTeams: Team[], storedTeams: Team[]) => {
	const bulkOps: AnyBulkWriteOperation<Team>[] = []
	// Keep track "touched" teams. At the end of the process, all "untouched" teams will be deleted
	const touchedTeams: Record<string, boolean> = {}

	for (const receivedTeam of receivedTeams) {
		// Find existing team from stored teams
		const currentTeam = storedTeams.find(
			({ teamNumber }) => receivedTeam.teamNumber === teamNumber,
		)

		if (!currentTeam) {
			// This team does not exists, need to create it
			bulkOps.push({
				insertOne: {
					document: {
						...receivedTeam,
					},
				},
			})
		} else {
			touchedTeams[receivedTeam.teamNumber] = true

			const newObject = deepDiff(currentTeam, receivedTeam)

			bulkOps.push({
				updateOne: {
					filter: { teamNumber: currentTeam.teamNumber },
					update: { $set: newObject },
				},
			})
		}
	}

	const teamsToRemove = storedTeams
		.filter(({ teamNumber }) => !(teamNumber in touchedTeams))
		.map<AnyBulkWriteOperation<Team>>(({ teamNumber }) => ({
			deleteOne: {
				filter: { teamNumber },
			},
		}))

	return [...bulkOps, ...teamsToRemove]
}
