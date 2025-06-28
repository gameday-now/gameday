import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const PageContainer = ({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) => (
	<div
		className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", className)}
	>
		{children}
	</div>
)

export default PageContainer
