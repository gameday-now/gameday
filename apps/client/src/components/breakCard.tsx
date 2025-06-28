import { Card, CardContent } from "@/components/ui/card"
import { Break } from "@gameday/models"
import { differenceInMinutes, format } from "date-fns"

const BreakCard = ({ break: b }: { break: Break }) => {
	const { _id, title } = b
	const startTime = new Date(b.startTime)
	const endTime = new Date(b.endTime)
	return (
		<Card id={`break_card_${_id}`} className={`scroll-mt-14 p-4 my-6`}>
			<CardContent>
				<div className="flex flex-row items-start justify-center text-center">
					<div>
						<h3 className="text-lg font-semibold">{title}</h3>
						<p className="text-sm text-gray-500 flex gap-1">
							<span>
								{format(startTime, "HH:mm")} -{" "}
								{format(endTime, "HH:mm")} (
								{differenceInMinutes(endTime, startTime)}m)
							</span>
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default BreakCard
