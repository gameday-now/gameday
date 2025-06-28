import { config } from "@/config"
import {
	EventsListing,
	FTCMatch,
	HybridSchedule,
	ListedTeam,
	Schedule,
	SeasonInfo,
	TeamListings,
	teamZod,
} from "@gameday/models"
import axios from "axios"
import z from "zod"
import { arrayToRecord } from "./objectUtils"
import { asc } from "./sort"

const ftc = axios.create({
	baseURL: config.FTC_API_ENDPOINT,
	timeout: 5000,
	headers: {
		Authorization: `Basic ${config.FTC_API_KEY}`,
	},
})

const paginatedQuery = async <
	T extends { pageCurrent: number; pageTotal: number },
	Q,
>(
	arrayKey: keyof Omit<T, "pageCurrent" | "pageTotal">,
	url: Parameters<typeof ftc.get>[0],
	config: Parameters<typeof ftc.get>[1],
	currentPage: number = 1,
): Promise<Q[]> => {
	const response = (
		await ftc.get<T>(url, {
			...(config ?? {}),
			params: {
				...(config?.params ?? {}),
				page: currentPage,
			},
		})
	).data
	if (response.pageCurrent !== 0 && currentPage !== response.pageCurrent) {
		throw new Error(
			`Current page mismatch (probably page query param is not "page")`,
		)
	}
	if (!Array.isArray(response[arrayKey])) {
		throw new Error(
			`Key ${String(arrayKey)} is not an array (page: ${currentPage}, ${typeof response[arrayKey]})`,
		)
	}
	if (currentPage < response.pageTotal) {
		const nextPage = (await paginatedQuery(
			arrayKey,
			url,
			config,
			currentPage + 1,
		)) as Q[]
		return [...(response[arrayKey] as Q[]), ...nextPage]
	}
	return response[arrayKey]
}

export const getSeasonInfo = async (): Promise<SeasonInfo> =>
	(await ftc.get<SeasonInfo>("")).data

export const getEvents = async (season: number) => {
	const { events } = (await ftc.get<EventsListing>(`/${season}/events`)).data
	return events
}

export const getMatches = async (
	season: number,
	eventCode: string,
	tournamentLevel: "qual" | "playoff",
): Promise<FTCMatch[]> => {
	const { schedule: hybrid } = (
		await ftc.get<HybridSchedule>(
			`/${season}/schedule/${eventCode}/${tournamentLevel}/hybrid`,
		)
	).data

	const { schedule } = (
		await ftc.get<Schedule>(
			`/${season}/schedule/${eventCode}?tournamentLevel=${tournamentLevel}`,
		)
	).data

	const scheduleRecord = arrayToRecord(schedule, "description")

	return hybrid.map((match) => ({
		...match,
		field: Number(scheduleRecord[match.description]?.field ?? 0),
		teams: match.teams.map((team) => ({
			id: team.displayTeamNumber,
			...team,
		})),
	}))
}

export const getTeams = async (season: number, eventCode: string) => {
	const teams = await paginatedQuery<TeamListings, ListedTeam>(
		"teams",
		`/${season}/teams`,
		{
			params: {
				eventCode,
			},
		},
	)

	return z
		.object({
			displayTeamNumber: z.string(),
			teamNumber: z.number(),
			nameShort: z.string(),
		})
		.transform((val) => ({ ...val, teamName: val.nameShort }))
		.pipe(teamZod)
		.array()
		.parse(teams)
		.sort(asc("teamNumber"))
}
