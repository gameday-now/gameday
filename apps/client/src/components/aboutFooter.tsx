import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default ({ className }: { className?: string }) => (
	<>
		<div
			className={cn(
				"text-sm text-center flex flex-col items-center",
				className,
			)}
		>
			<div>Gameday.now is open source</div>
			<div>
				Data provided by{" "}
				<a
					className="text-primary underline"
					target="_blank"
					href="https://ftc-events.firstinspires.org/services/API"
				>
					ftc.events API
				</a>
			</div>
			<div className="flex gap-2">
				<Dialog>
					<DialogTrigger asChild>
						<a className="text-primary underline">Learn more</a>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>About Gameday</DialogTitle>
							<div className="text-left flex flex-col gap-8">
								<div>
									Gameday is an open-source platform for
									managing FTC events. It provides a
									user-friendly interface for volunteers to
									manage their schedules, teams, and other
									important information.
								</div>
								<div>
									Gameday was inspired by{" "}
									<a
										href="https://frc.nexus"
										target="_blank"
										className="text-primary underline"
									>
										frc.nexus
									</a>{" "}
									, but we are not affiliated.
								</div>
								<div className="text-xs mt-2 text-center">
									FIRST® and FIRST® Tech Challenge, are
									registered trademarks of For Inspiration and
									Recognition of Science and Technology
									(FIRST), which is not overseeing, involved
									with, or responsible for this website.
								</div>
							</div>
						</DialogHeader>
					</DialogContent>
				</Dialog>
				<a
					className="text-primary underline"
					target="_blank"
					href="https://github.com/gameday-now"
				>
					GitHub
				</a>
				<a
					className="text-primary underline"
					target="_blank"
					href="mailto:contact@gameday.now"
				>
					Contact
				</a>
			</div>
		</div>
	</>
)
