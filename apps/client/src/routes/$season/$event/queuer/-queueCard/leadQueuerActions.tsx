import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer"
import useIOSPadding from "@/hooks/useIOSPadding"
import { cn } from "@/lib/utils"
import { Break, Match, NewRematch } from "@gameday/models"
import { Dispatch, SetStateAction } from "react"
import title from "title"
import ScheduleRematchDialog from "./scheduleRematchDialog"

export default ({
	scheduleRematch,
	isDrawerOpen,
	setIsDrawerOpen,
	selectedMatch,
	canSchedule,
	generatedPlayoffMatches,
	cycleTime,
	breaks,
}: {
	selectedMatch: Match
	scheduleRematch: (values: NewRematch) => Promise<void>
	isDrawerOpen: boolean
	setIsDrawerOpen: Dispatch<SetStateAction<boolean>>
	breakAfterMatch: boolean
	canBreak: boolean
	canSchedule: boolean
	generatedPlayoffMatches: boolean
	cycleTime: number
	breaks: Record<string, Break> | undefined
}) => {
	const { addPadding } = useIOSPadding()

	return (
		<>
			<Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
				<DrawerContent
					className={cn("px-2", {
						"pb-8": addPadding,
					})}
				>
					<DrawerHeader className="!text-start pb-2">
						<DrawerTitle>{selectedMatch.title}</DrawerTitle>
						<DrawerDescription>
							{title(selectedMatch.status)}
						</DrawerDescription>
					</DrawerHeader>
					<DrawerFooter>
						{selectedMatch.tournamentLevel !== "PLAYOFF" &&
							canSchedule && (
								<ScheduleRematchDialog
									breaks={breaks}
									match={selectedMatch}
									scheduleRematch={scheduleRematch}
									cycleTime={cycleTime}
									setIsDrawerOpen={setIsDrawerOpen}
									disabled={
										generatedPlayoffMatches ||
										selectedMatch.status !== "completed"
									}
								/>
							)}
						{/* {canBreak && (
							<AddBreakDialog
								match={selectedMatch}
								createBreak={createBreak}
								cycleTime={cycleTime}
								setIsDrawerOpen={setIsDrawerOpen}
								disabled={breakAfterMatch}
							/>
						)} */}
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	)
}
