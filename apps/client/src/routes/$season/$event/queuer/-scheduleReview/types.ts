export type MatchBlock = {
	id: string
	index: number
	startTime: string
	endTime: string
	firstMatch: string
	lastMatch: string
	totalMatches: number
}

export type BreakBlock = {
	id: string
	index: number
	startTime: string
	endTime: string
	afterMatchId: string
}
