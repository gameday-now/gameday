import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useQueuer } from "@/hooks/useQueuer"
import { cn } from "@/lib/utils"
import { Match, MatchStatus } from "@gameday/models"
import { differenceInMinutes, format } from "date-fns"
import title from "title"
import TeamRow from "./teamRow"

const matchStatusColors: Record<MatchStatus, string> = {
	scheduled: "border-l-gray-400",
	now_queuing: "border-l-blue-500",
	on_deck: "border-l-green-200",
	in_match: "border-l-gray-200",
	completed: "border-l-gray-200",
}

export default ({
	match,
	updateAttendance,
	openLeadQueuerActions,
	canSchedule,
	canBreak,
}: {
	match: Match
	updateAttendance: ReturnType<typeof useQueuer>["updateAttendance"]
	openLeadQueuerActions: (match: Match) => void
	canSchedule: boolean
	canBreak: boolean
}) => {
	const startTime = new Date(match.startTime)
	const actualStartTime = match.actualStartTime
		? new Date(match.actualStartTime)
		: null
	const startDifference = actualStartTime
		? differenceInMinutes(actualStartTime, startTime, {
				roundingMethod: "floor",
			})
		: null

	return (
		<Card
			id={`queue_card_${match.description}`}
			className={`border-l-4 scroll-mt-22 ${matchStatusColors[match.status]}`}
		>
			<CardContent>
				<div className="flex flex-row items-start justify-between mb-8">
					<div>
						<h3 className="text-lg font-semibold">{match.title}</h3>
						{match.tournamentLevel === "PLAYOFF" && (
							<h4 className="text-sm">{match.description}</h4>
						)}

						<h4 className="text-sm text-gray-500">
							Field {match.field}
						</h4>

						<p className="text-sm text-gray-500 flex gap-1">
							<span
								className={cn({
									"line-through": startDifference,
								})}
							>
								{format(startTime, "HH:mm")}
							</span>
							{startDifference !== null &&
								startDifference !== 0 &&
								actualStartTime !== null && (
									<>
										<span>
											{format(actualStartTime, "HH:mm")}
										</span>
										<span>
											(
											{startDifference > 0
												? `${startDifference}m`
												: `${-startDifference}m`}
											{startDifference > 0
												? " late"
												: " early"}
											)
										</span>
									</>
								)}
						</p>
					</div>
					<div className="mt-2 sm:mt-0">
						<Badge variant="outline">
							{title(match.status.replace("_", " "))}
						</Badge>
					</div>
				</div>

				<div className="grid sm:grid-cols-2 gap-4">
					<div className="space-y-2">
						<div className="text-sm font-medium text-red-600">
							Red Alliance
						</div>
						{match.teams
							.filter((team) => team.station.startsWith("Red"))
							.map((team, index) => (
								<TeamRow
									key={index}
									team={team}
									alliance="red"
									match={match}
									updateAttendance={updateAttendance}
								/>
							))}
					</div>

					<div className="space-y-2">
						<div className="text-sm font-medium text-blue-600">
							Blue Alliance
						</div>
						{match.teams
							.filter((team) => team.station.startsWith("Blue"))
							.map((team, index) => (
								<TeamRow
									updateAttendance={updateAttendance}
									key={index}
									team={team}
									alliance="blue"
									match={match}
								/>
							))}
					</div>
				</div>
				{(canSchedule || canBreak) && (
					<div className="mt-3">
						<Button
							className="w-full"
							variant="outline"
							onClick={() => {
								openLeadQueuerActions(match)
							}}
						>
							Lead Queuer Actions
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
