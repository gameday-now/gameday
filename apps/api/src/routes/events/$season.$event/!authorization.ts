import { DUnauthorized } from "@/lib/actionSocket/error"
import { Authorization } from "@/lib/actionSocket/types"

export default (async ({ data: { params } }) => {
	const searchParams = new URLSearchParams(params)
	const season = searchParams.get("season")
	const eventCode = searchParams.get("event")
	if (!season || !eventCode) {
		throw DUnauthorized
	}
	return {
		basePermission: "read",
		resourceKey: eventCode,
		resourceType: "event",
		season,
	}
}) satisfies Authorization
