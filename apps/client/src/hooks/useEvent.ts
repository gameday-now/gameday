import { Event } from "@gameday/models"
import useGenericConnection from "./useGenericConnection"

export const useEvent = ({
	season,
	event,
}: {
	season: string
	event: string
}) => {
	const { data } = useGenericConnection<Event>(`events/${season}/${event}`)

	return {
		event: data,
	}
}
