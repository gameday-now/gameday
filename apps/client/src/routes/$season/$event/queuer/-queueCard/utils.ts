import { format, parse, setHours, setMinutes, setSeconds } from "date-fns"

export const mergeDateAndTime = (
	dateString: string,
	timeString: string,
): string => {
	const baseDate = parse(dateString, "yyyy-MM-dd'T'HH:mm:ss", new Date())
	const [hours, minutes] = timeString.split(":").map(Number)

	const dateWithTime = setSeconds(
		setMinutes(setHours(baseDate, hours), minutes),
		0,
	)

	return format(dateWithTime, "yyyy-MM-dd'T'HH:mm:ss")
}
