import hero from "@/assets/hero.png"
import AboutFooter from "@/components/aboutFooter"
import LogoLoadingSpinner from "@/components/logoLoadingSpinner"
import PageContainer from "@/components/pageContainer"
import { Card, CardContent } from "@/components/ui/card"
import { useEvents } from "@/hooks/useEvents"
import { createFileRoute, Link } from "@tanstack/react-router"
export const Route = createFileRoute("/")({
	component: Index,
})

function Index() {
	const { events } = useEvents()

	return (
		<div className="flex flex-col w-full items-center h-[calc(100vh_-_70px)]">
			<div
				style={{
					backgroundImage: `url(${hero})`,
				}}
				className="text-center w-full py-4 pb-6 bg-cover text-secondary-foreground"
			>
				<h1 className="text-2xl mt-4 font-[outfit]">
					Welcome to Gameday
				</h1>
				<h3 className="mb-2">Select an event to start</h3>
			</div>
			<div className="grow w-full flex flex-col justify-between gap-6">
				<PageContainer className="flex flex-col gap-2 h-full w-full">
					{!events && (
						<div className="flex w-full justify-center mt-30">
							<LogoLoadingSpinner className="w-10" />
						</div>
					)}
					{events?.length === 0 && (
						<div className="text-center w-75 mx-auto text-sm">
							You don’t have permission to view events for this
							season. Please ask your FTA to assign the
							appropriate permissions, or contact us for
							assistance at{" "}
							<a
								href="mailto:contact@gameday.now"
								className="text-primary underline"
							>
								contact@gameday.now
							</a>
						</div>
					)}
					{events &&
						events.map((event) => (
							<Link
								key={event.code}
								to="/$season/$event"
								params={{
									season: "2024",
									event: event.code,
								}}
							>
								<Card className="w-full h-full">
									<CardContent>
										<div className="text-start w-full">
											<h5 className="text">
												{`${event.name} `}
												<span className="text-xs text-gray-600">
													#{event.code}
												</span>
											</h5>
											<div className="font-light text-sm">
												{event.venue}
											</div>
											<div className="font-light text-sm">
												{`${event.address}, ${event.city}, ${event.country}`}
											</div>
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
				</PageContainer>
				<AboutFooter className="mb-8" />
			</div>
		</div>
	)
}
