import Gear from "@/assets/gear.svg?react"
import { cn } from "@/lib/utils"

const LogoLoadingSpinner = ({ className }: { className?: string }) => (
	<Gear className={cn("animate-loading", className)} />
)

export default LogoLoadingSpinner
