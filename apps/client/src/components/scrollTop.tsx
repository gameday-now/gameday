import { Button } from "@/components/ui/button"
import useTopFloat from "@/hooks/useTopFloat"
import { cn } from "@/lib/utils"
import { ArrowUp } from "lucide-react"

const ScrollTop = () => {
	const showScroll = useTopFloat()

	const onClick = () => {
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	return (
		<Button
			className={cn("fixed top-4 right-4 size-10 duration-300 z-10", {
				"opacity-0 pointer-events-none": !showScroll,
				"opacity-100": showScroll,
			})}
			variant="outline"
			onClick={onClick}
		>
			<ArrowUp />
		</Button>
	)
}

export default ScrollTop
