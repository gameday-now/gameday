import { Badge } from "@/components/ui/badge"
import useTopFloat from "@/hooks/useTopFloat"
import { cn } from "@/lib/utils"
import { EventConfig } from "@gameday/models"

export default ({ config }: { config: EventConfig }) => {
	const showScroll = useTopFloat()

	return (
		<div
			className={cn(
				"fixed top-4 left-4 !duration-300 z-10 flex flex-col gap-1",
				{
					"opacity-0 pointer-events-none": !showScroll,
					"opacity-100": showScroll,
				},
			)}
		>
			<Badge className="text-sm shadow">
				Cycle Time: {config.cycleTime}m
			</Badge>
		</div>
	)
}
