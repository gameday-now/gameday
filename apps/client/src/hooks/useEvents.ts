import { Event } from "@gameday/models"
import useGenericConnection from "./useGenericConnection"

export const useEvents = () => {
	const { data } = useGenericConnection<Event[]>("events/2024")

	return {
		events: data,
	}
}
