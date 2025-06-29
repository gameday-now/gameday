import LogoLoadingSpinner from "@/components/logoLoadingSpinner"
import PageContainer from "@/components/pageContainer"
import { Card, CardContent } from "@/components/ui/card"
import { useEvent } from "@/hooks/useEvent"
import { FileRouteTypes } from "@/routeTree.gen"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ClipboardList, createLucideIcon, Users } from "lucide-react"

export const Route = createFileRoute("/$season/$event/")({
	component: RouteComponent,
})

const screens: {
	name: string
	Icon: ReturnType<typeof createLucideIcon>
	link: FileRouteTypes["to"]
}[] = [
	{
		name: "Teams",
		Icon: ClipboardList,
		link: "/$season/$event/teams",
	},
	{
		name: "Field Queue",
		Icon: Users,
		link: "/$season/$event/queuer",
	},
]

function RouteComponent() {
	const { season, event: eventCode } = Route.useParams()
	const { event } = useEvent({ season, event: eventCode })
	return !event ? (
		<div className="h-[80vh] w-full flex justify-center items-center">
			<LogoLoadingSpinner className="w-10" />
		</div>
	) : (
		<>
			<div
				style={{
					backgroundImage: `url(${event?.gamedayImage})`,
				}}
				className="relative text-center w-full h-50 py-4 pb-6 bg-cover text-secondary-foreground bg-center"
			>
				<div className="absolute inset-0 bg-linear-to-b from-black/30 to-black/80 justify-end items-start p-4 flex flex-col gap-0">
					<h1 className="text-center text-2xl text-white">
						{event?.name}
					</h1>
					<h3 className="text-center text-sm text-white">
						{`${event?.city}, ${event?.country}`}
					</h3>
				</div>
			</div>
			<PageContainer>
				<div className="flex flex-wrap gap-2 justify-center">
					{screens.map(({ name, Icon, link }) => {
						return (
							<Link
								key={name}
								className="contents"
								to={link}
								params={{
									season,
									event: eventCode,
								}}
							>
								<Card className="grow w-full p-0">
									<CardContent className="flex gap-2 items-center p-2 m-2 justify-start h-full">
										<Icon className="size-5" />
										{name}
									</CardContent>
								</Card>
							</Link>
						)
					})}
				</div>
			</PageContainer>
		</>
	)
}
