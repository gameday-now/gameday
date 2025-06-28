import { Card, CardContent } from "@/components/ui/card"
import useIOSPadding from "@/hooks/useIOSPadding"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const FixedFooter = ({ children }: { children: ReactNode }) => {
	const { addPadding } = useIOSPadding()

	return (
		<>
			<div
				className={cn({
					"h-25": addPadding,
					"h-20": !addPadding,
				})}
			/>
			<Card
				className={cn(
					"fixed bottom-0 left-0 w-screen rounded-none p-4 px-5",
					{
						"h-25": addPadding,
						"h-20": !addPadding,
					},
				)}
			>
				<CardContent
					className={cn(
						"h-full m-0 p-0 px-1 flex justify-between items-center",
						{
							"pb-5": addPadding,
						},
					)}
				>
					{children}
				</CardContent>
			</Card>
		</>
	)
}

export default FixedFooter
