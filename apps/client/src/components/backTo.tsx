import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

const BackTo = ({ name, route }: { route: string; name: string }) => (
	<div className="flex text-sm items-center gap-1 mb-2 cursor-pointer">
		<Link to={route} className="contents">
			<ArrowLeft className="size-5" /> Back to {name}
		</Link>
	</div>
)

export default BackTo
