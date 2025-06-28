export interface SeasonInfo {
	name: string
	apiVersion: string
	serviceMainifestName: string
	serviceMainifestVersion: string
	codePackageName: string
	codePackageVersion: string
	status: string
	currentSeason: number
	maxSeason: number
}

export interface EventInfo {
	eventId: string
	code: string
	divisionCode: string
	name: string
	remote: boolean
	hybrid: boolean
	fieldCount: number
	published: boolean
	type: string
	typeName: string
	regionCode: string
	leagueCode: string
	districtCode: string
	venue: string
	address: string
	city: string
	stateprov: string
	country: string
	website: string
	liveStreamUrl: string
	coordinates: unknown // Not needed
	webcasts: string[]
	timezone: string
	dateStart: string
	dateEnd: string
}

export interface EventsListing {
	events: EventInfo[]
	eventCount: number
}

export interface TeamListing {
	teamNumber: number
	displayTeamNumber: string
	station: string
	surrogate: boolean
	noShow: boolean
	onField: boolean
	teamName: string
}

export interface HybridTeamListing extends TeamListing {
	dq: boolean
}

export interface ScheduleMatchInfo {
	description: string
	field: string
	tournamentLevel: string
	startTime: string
	series: number
	matchNumber: number
	teams: TeamListing[]
	modifiedOn: string
}

export interface Schedule {
	schedule: ScheduleMatchInfo[]
}

export interface HybridMatchInfo {
	description: string
	tournamentLevel: "QUALIFICATION" | "PLAYOFF"
	series: number
	matchNumber: number
	startTime: string
	actualStartTime: string
	postResultTime: string
	scoreRedFinal: number
	scoreRedFoul: number
	scoreRedAuto: number
	scoreBlueFinal: number
	scoreBlueFoul: number
	scoreBlueAuto: number
	scoreBlueDriveControlled: number
	scoreBlueEndgame: number
	redWins: boolean
	blueWins: boolean
	teams: HybridTeamListing[]
}

export interface HybridSchedule {
	schedule: HybridMatchInfo[]
}

export interface ListedTeam {
	teamNumber: number
	displayTeamNumber: string
	nameFull: string
	nameShort: string
	schoolName: string
	city: string
	stateProv: string
	country: string
	website: string
	rookieYear: number
	robotName: string
	districtCode: string
	homeCMP: string
	homeRegion: string
	displayLocation: string
}

export interface TeamListings {
	teams: ListedTeam[]
	teamCountTotal: number
	teamCountPage: number
	pageCurrent: number
	pageTotal: number
}

export interface FTCMatch extends HybridMatchInfo {
	field: number
	teams: (HybridTeamListing & { id: string })[]
}
