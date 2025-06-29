import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { TeamList } from "@gameday/models"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import title from "title"

export default ({
	teamList,
	deleteList,
}: {
	teamList: TeamList
	deleteList: (teamListId: string) => Promise<void>
}) => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const onDelete = async () => {
		try {
			setIsLoading(true)
			await deleteList(teamList._id)
			setIsModalOpen(false)
		} catch {}
		setIsLoading(false)
	}

	return (
		<AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
			<AlertDialogTrigger asChild>
				<Button className="size-5 p-3" variant="destructive">
					<Trash2 className="size-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Delete "{title(teamList.listName)}" List
					</AlertDialogTitle>
				</AlertDialogHeader>
				<AlertDialogDescription>
					Are you sure you want to delete this list? This action
					cannot be undone.
				</AlertDialogDescription>
				<div className="flex gap-2 w-full">
					<AlertDialogCancel asChild>
						<Button variant="outline" className="grow">
							Cancel
						</Button>
					</AlertDialogCancel>
					<Button
						variant="destructive"
						className="grow"
						disabled={isLoading}
						onClick={onDelete}
					>
						{isLoading ? "..." : "Delete"}
					</Button>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	)
}
