import { format } from "date-fns"
import { ArrowDown } from "lucide-react"
import { MatchBlock } from "./types"

export default ({
	matchBlock: {
		index,
		firstMatch,
		lastMatch,
		totalMatches,
		startTime,
		endTime,
	},
}: {
	matchBlock: MatchBlock
}) => {
	return (
		<div className="shadow-md rounded-md border text-center p-4">
			<div className="font-semibold mb-2">
				Match Block #{index} - {totalMatches} matches
			</div>
			<div className="flex flex-col items-center gap-1">
				<div>{format(startTime, "HH:mm")}</div>
				<div>{firstMatch}</div>
				<ArrowDown />
				<div>{lastMatch}</div>
				<div>{format(endTime, "HH:mm")}</div>
			</div>
		</div>
	)
}
