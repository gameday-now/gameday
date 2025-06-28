import { DUnauthorized } from "@/lib/actionSocket/error"
import { Authorization } from "@/lib/actionSocket/types"
import { USE_QUEUER_PAGE_PERMISSION } from "@gameday/models"

export default (async ({ data: { params } }) => {
	const searchParams = new URLSearchParams(params)
	const season = searchParams.get("season")
	const eventCode = searchParams.get("event")
	if (!season || !eventCode) {
		throw DUnauthorized
	}
	return {
		basePermission: USE_QUEUER_PAGE_PERMISSION,
		resourceKey: eventCode,
		resourceType: "event",
		season,
	}
}) satisfies Authorization
