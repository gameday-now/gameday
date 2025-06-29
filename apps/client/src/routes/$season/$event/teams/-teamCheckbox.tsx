import LoadingSpinner from "@/components/loadingSpinner"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

export default ({
	markTeam,
	checked,
	teamNumber,
	listId,
}: {
	markTeam: (
		checked: boolean,
		listId: string,
		teamNumber: number,
	) => Promise<void>
	checked: boolean
	teamNumber: number
	listId: string
}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const clickHandler = async (checked: boolean) => {
		setIsLoading(true)
		await markTeam(checked, listId, teamNumber)
		setIsLoading(false)
	}

	return (
		<div className="relative w-full h-6">
			<Checkbox
				className="size-6"
				disabled={isLoading}
				checked={checked}
				onCheckedChange={clickHandler}
			/>
			{isLoading && (
				<LoadingSpinner className="absolute top-1 left-1/2 -translate-x-1/2 size-4 pointer-events-none text-primary" />
			)}
		</div>
	)
}
