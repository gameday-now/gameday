import { Input } from "@/components/ui/input"
import { differenceInMinutes, format } from "date-fns"
import { BreakBlock } from "./types"

export default ({
	breakBlock: { index, startTime, endTime },
	titleValue,
	setTitleValue,
}: {
	breakBlock: BreakBlock
	titleValue: string
	setTitleValue: (value: string) => void
}) => {
	return (
		<div className="flex flex-col items-center gap-1 shadow-md rounded-md border text-center p-4">
			<div className="font-semibold">Break Block #{index}</div>
			<div className="flex justify-center gap-1 mb-2">
				<div>{format(startTime, "HH:mm")}</div>
				<div>-</div>
				<div>{format(endTime, "HH:mm")}</div>
				<div>({differenceInMinutes(endTime, startTime)}m)</div>
			</div>
			<Input
				className="text-center"
				placeholder="Break name (publicly visible)"
				value={titleValue}
				onChange={(e) => setTitleValue(e.target.value)}
			/>
		</div>
	)
}
