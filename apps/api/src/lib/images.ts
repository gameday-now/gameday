import { config } from "@/config"
import { Event } from "@gameday/models"
import axios from "axios"

type SearchQuery = {
	query?: {
		search: { title: string }[]
	}
}
type PageResult = {
	originalimage?: {
		source?: string
	}
}

const imageGetter = axios.create({
	baseURL: config.IMAGES_ENDPOINT,
	timeout: 5000,
})

export const getImage = async (event: Event) => {
	const srsearch = `${event.city.replaceAll(" ", "+")}+${event.country.replaceAll(" ", "+")}`
	const { data: searchQuery } = await imageGetter.get<SearchQuery>(
		`/w/api.php`,
		{
			params: {
				action: "query",
				list: "search",
				srsearch,
				format: "json",
				origin: "*",
			},
		},
	)
	const imagePageName = searchQuery.query?.search[0]?.title.replaceAll(
		" ",
		"_",
	)
	const { data: res } = await imageGetter.get<PageResult>(
		`/api/rest_v1/page/summary/${imagePageName}`,
	)
	return res.originalimage?.source
}
