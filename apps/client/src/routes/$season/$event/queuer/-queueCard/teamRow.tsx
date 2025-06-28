import { Button } from "@/components/ui/button"
import { useQueuer } from "@/hooks/useQueuer"
import { cn } from "@/lib/utils"
import { Match, MatchTeam } from "@gameday/models"
import { Bot, User, X } from "lucide-react"
import { useState } from "react"

export default ({
	match,
	team,
	alliance,
	updateAttendance,
}: {
	match: Match
	team: MatchTeam
	alliance: "red" | "blue"
	updateAttendance: ReturnType<typeof useQueuer>["updateAttendance"]
}) => {
	const [isLoading, setIsLoading] = useState(false)
	const attendance = match.gameday?.teams?.[team.teamNumber]?.attendance
	const activeQueuing =
		match.status === "on_deck" || match.status === "now_queuing"
	const handleAttendanceChange = async () => {
		if (!activeQueuing) {
			return
		}
		setIsLoading(true)
		try {
			await updateAttendance(
				match.description,
				team.teamNumber,
				attendance === "present"
					? "driver_only"
					: attendance === "driver_only"
						? null
						: "present",
			)
		} catch (error) {
			console.error("Error updating attendance:", error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div
			className={`flex items-center justify-between ${alliance === "red" ? "bg-red-50" : "bg-blue-50"} px-4 py-2 rounded`}
		>
			<div className={team.noShow ? "line-through text-gray-500" : ""}>
				<div className="font-medium">
					Team {team.teamNumber}
					{team.surrogate ? "*" : ""}
				</div>
				<div className="text-sm text-gray-600">{team.teamName}</div>
			</div>
			{(match.gameday?.status === "on_deck" ||
				match.gameday?.status === "now_queuing") && (
				<Button
					loading={isLoading}
					onClick={handleAttendanceChange}
					variant={activeQueuing ? "default" : "ghost"}
					disabled={!activeQueuing}
					className={cn(
						"disabled:!opacity-100 disabled:!bg-transparent",
						{
							"bg-red-200 hover:bg-red-300":
								attendance == null && activeQueuing,
							"!text-red-700": attendance == null,
							"bg-yellow-200 hover:bg-yellow-300":
								attendance === "driver_only" && activeQueuing,
							"text-yellow-700": attendance === "driver_only",
							"bg-green-200 hover:bg-green-300":
								attendance === "present" && activeQueuing,
							"text-green-700 ": attendance === "present",
						},
					)}
					size="sm"
				>
					{attendance === "present" && activeQueuing && (
						<>
							Present
							<Bot className="h-4 w-4" />
						</>
					)}
					{attendance === "driver_only" && (
						<>
							Driver Only
							<User className="h-4 w-4" />
						</>
					)}
					{attendance == null && (
						<>
							Missing
							<X className="h-4 w-4" />
						</>
					)}
				</Button>
			)}
		</div>
	)
}
