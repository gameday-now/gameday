import BackTo from "@/components/backTo"
import BreakCard from "@/components/breakCard"
import ConfirmationSlide from "@/components/confirmationSlide"
import FixedFooter from "@/components/fixedFooter"
import LoadingSpinner from "@/components/loadingSpinner"
import PageContainer from "@/components/pageContainer"
import ScrollTop from "@/components/scrollTop"
import { Button } from "@/components/ui/button"
import useLeadQueuerActions from "@/hooks/useLeadQueuerActions"
import { useQueuer } from "@/hooks/useQueuer"
import QueueCard from "@/routes/$season/$event/queuer/-queueCard"
import LeadQueuerActions from "@/routes/$season/$event/queuer/-queueCard/leadQueuerActions"
import {
	ADD_BREAK_PERMISSION,
	REVIEW_EVENT_SCHEDULE_PERMISSION,
	SCHEDULE_REMATCH_PERMISSION,
} from "@gameday/models"
import { createFileRoute } from "@tanstack/react-router"
import { Fragment, useEffect, useMemo, useState } from "react"
import FloatingCycleTime from "./-main/floatingCycleTime"
import { shouldInsertBreak } from "./-main/utils"
import ScheduleReview from "./-scheduleReview"

export const Route = createFileRoute("/$season/$event/queuer/")({
	component: RouteComponent,
})

function RouteComponent() {
	const [initialScroll, setInitialScroll] = useState<boolean>(false)
	const {
		selectedMatchId,
		openLeadQueuerActions,
		setIsDrawerOpen,
		isDrawerOpen,
	} = useLeadQueuerActions()
	const { season, event } = Route.useParams()
	const {
		response,
		updateAttendance,
		promoteToDeck,
		beginQueuing,
		scheduleRematch,
		permissions,
		reviewSchedule,
	} = useQueuer({
		season,
		event,
	})
	const {
		matches,
		matchesOnDeck,
		queuingMatch,
		proposeQueueMatch,
		generatedPlayoffMatches,
		config,
	} = useMemo(() => {
		const matches = response?.matches

		const matchesOnDeck = matches?.filter(
			({ status }) => status === "on_deck",
		)

		const found = matches?.filter(({ status }) => status === "now_queuing")
		const queuingMatch = found && found.length > 0 ? found[0] : null

		const proposeQueueMatch = matches?.find(
			({ status }) => status === "scheduled",
		)

		const generatedPlayoffMatches = !!matches?.find(
			({ tournamentLevel }) => tournamentLevel === "PLAYOFF",
		)

		return {
			matches,
			matchesOnDeck,
			queuingMatch,
			proposeQueueMatch,
			generatedPlayoffMatches,
			config: response?.config,
		}
	}, [response?.matches])

	const canBreak = !!permissions?.includes(ADD_BREAK_PERMISSION)
	const canSchedule = !!permissions?.includes(SCHEDULE_REMATCH_PERMISSION)

	const scrollToCard = (matchId: string) => {
		const selectedCard = document.getElementById(`queue_card_${matchId}`)
		if (selectedCard) {
			selectedCard.scrollIntoView({ behavior: "smooth", block: "start" })
		}
	}

	const scrollToLastMatch = () => {
		if (matches && matches.length > 0) {
			scrollToCard(matches[matches.length - 1].description)
		}
	}

	useEffect(() => {
		if (queuingMatch) {
			scrollToCard(queuingMatch.description)
			setInitialScroll(true)
		}
	}, [queuingMatch?.description])

	useEffect(() => {
		if (
			!initialScroll &&
			!queuingMatch &&
			!proposeQueueMatch &&
			matches &&
			matches.length > 0
		) {
			scrollToLastMatch()
			setInitialScroll(true)
		}
	}, [matches])

	const selectedMatch = useMemo(() => {
		if (selectedMatchId && matches) {
			return matches.find(
				({ description }) => description === selectedMatchId,
			)
		}
		return undefined
	}, [selectedMatchId, matches])

	if (!matches) {
		return (
			<div className="text-center py-12 rounded-lg w-full flex justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	return (
		<PageContainer>
			<ScrollTop />
			<BackTo name={event.toUpperCase()} route={`/${season}/${event}`} />
			<div className="pt-2 text-center">
				<h2 className="text-xl font-semibold">Field Queue</h2>
				{config?.leadQueuerReviewed && (
					<p className="text-gray-500 mb-4">
						Showing {matches.length} matches
					</p>
				)}
			</div>

			<div className="flex flex-col gap-4">
				{config?.leadQueuerReviewed && (
					<>
						<FloatingCycleTime config={config} />
						{matches.map((match) => {
							const breakToInsert = shouldInsertBreak(
								match,
								matches,
								response?.breaks ?? {},
							)
							return (
								<Fragment key={`${match.description}`}>
									<QueueCard
										canBreak={canBreak}
										canSchedule={canSchedule}
										openLeadQueuerActions={
											openLeadQueuerActions
										}
										match={match}
										updateAttendance={updateAttendance}
									/>
									{match.gameday?.status ===
										"now_queuing" && (
										// <Button
										//   onClick={() => promoteToDeck(match._id)}
										//   className="bg-blue-600 hover:bg-blue-700 w-full max-w-md mx-auto py-6"
										//   size="lg"
										// >
										//   <PlayCircle className="w-5 h-5 mr-2" />
										//   Queue Next Match
										// </Button>
										<ConfirmationSlide
											onConfirm={() =>
												promoteToDeck(match.description)
											}
											highlighted={
												(matchesOnDeck?.length ?? 0) ===
												0
											}
										>
											Queue Next Match
										</ConfirmationSlide>
									)}

									{breakToInsert && (
										<BreakCard break={breakToInsert} />
									)}
								</Fragment>
							)
						})}
					</>
				)}

				{matches.length === 0 && (
					<div className="text-center py-24">
						<p className="text-gray-500">
							{config?.leadQueuerReviewed === false &&
							!permissions?.includes(
								REVIEW_EVENT_SCHEDULE_PERMISSION,
							) ? (
								<>
									Waiting for lead queuer to review the event
									schedule.
								</>
							) : (
								<>No matches available</>
							)}
						</p>
					</div>
				)}
				{config?.leadQueuerReviewed === false &&
					permissions?.includes(REVIEW_EVENT_SCHEDULE_PERMISSION) && (
						<ScheduleReview
							config={config}
							matches={matches}
							reviewSchedule={reviewSchedule}
						/>
					)}
			</div>
			{config?.leadQueuerReviewed && (
				<FixedFooter>
					{queuingMatch && (
						<>
							<div className="flex flex-col justify-center">
								<div className="text-sm">Queuing now</div>
								<div className="text-xl">
									{queuingMatch?.title}
								</div>
							</div>
							<div className="flex flex-col justify-center">
								{queuingMatch && (
									<Button
										variant="outline"
										onClick={() => {
											if (queuingMatch) {
												scrollToCard(
													queuingMatch?.description,
												)
											}
										}}
									>
										Go to match
									</Button>
								)}
							</div>
						</>
					)}
					{!queuingMatch && proposeQueueMatch && (
						<Button
							className="w-full"
							variant="outline"
							onClick={() => {
								beginQueuing(proposeQueueMatch.description)
							}}
						>
							Begin Queuing for Match {proposeQueueMatch.title}
						</Button>
					)}
					{!queuingMatch && !proposeQueueMatch && (
						<>
							<div className="text-sm w-full">
								Waiting for more matches
							</div>
							<div className="flex flex-col justify-center">
								{matches && matches.length > 0 && (
									<Button
										variant="outline"
										onClick={() => {
											scrollToLastMatch()
										}}
									>
										Go to Last Match
									</Button>
								)}
							</div>
						</>
					)}
				</FixedFooter>
			)}

			{(canBreak || canSchedule) && selectedMatch && (
				<LeadQueuerActions
					breaks={response?.breaks}
					generatedPlayoffMatches={generatedPlayoffMatches}
					canBreak={canBreak}
					cycleTime={config?.cycleTime ?? 0}
					canSchedule={canSchedule}
					setIsDrawerOpen={setIsDrawerOpen}
					isDrawerOpen={isDrawerOpen}
					scheduleRematch={scheduleRematch}
					selectedMatch={selectedMatch}
					breakAfterMatch={
						!!response?.breaks[selectedMatch.description]
					}
				/>
			)}
		</PageContainer>
	)
}
