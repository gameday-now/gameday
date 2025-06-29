import {
	AddList,
	DeleteList,
	MarkTeam,
	NewTeamList,
	TeamsResponse,
} from "@gameday/models"
import useGenericConnection from "./useGenericConnection"

export const useTeams = ({
	season,
	event,
}: {
	season: string
	event: string
}) => {
	const { data, permissions, sendAction } =
		useGenericConnection<TeamsResponse>(`events/${season}/${event}/teams`)

	const markTeam = async (
		checked: boolean,
		listId: string,
		teamNumber: number,
	) => {
		await sendAction<MarkTeam>({
			type: "markTeam",
			checked,
			teamNumber,
			listId,
		})
	}

	const addList = async (newTeamList: NewTeamList) => {
		await sendAction<AddList>({
			type: "addList",
			...newTeamList,
		})
	}

	const deleteList = async (listId: string) => {
		await sendAction<DeleteList>({
			type: "deleteList",
			_id: listId,
		})
	}

	return {
		permissions,
		response: data,
		markTeam,
		addList,
		deleteList,
	}
}
