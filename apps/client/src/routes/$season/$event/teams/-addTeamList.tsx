import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { NewTeamList, newTeamListZod } from "@gameday/models"
import { useForm } from "@tanstack/react-form"
import { Plus } from "lucide-react"
import { useState } from "react"

export default ({
	addList,
}: {
	addList: (newTeamList: NewTeamList) => Promise<void>
}) => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>()
	const form = useForm({
		defaultValues: {
			listName: "",
		},
		validators: {
			onMount: newTeamListZod,
			onChange: newTeamListZod,
			onBlur: newTeamListZod,
		},
		onSubmit: async ({ value }) => {
			try {
				await addList(value)
				setIsModalOpen(false)
			} catch {}
		},
	})
	const modalOpenChangeHandler = (state: boolean) => {
		setIsModalOpen(state)
		form.reset()
	}

	return (
		<Dialog open={isModalOpen} onOpenChange={modalOpenChangeHandler}>
			<DialogTrigger asChild>
				<Button className="size-5 p-3">
					<Plus className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
					className="contents"
				>
					<DialogHeader>
						<DialogTitle>New List</DialogTitle>
					</DialogHeader>
					<form.Field name="listName">
						{(field) => (
							<Input
								value={field.state.value}
								onChange={(e) => field.setValue(e.target.value)}
								placeholder="List name..."
							/>
						)}
					</form.Field>
					<form.Subscribe
						selector={(state) => [
							state.canSubmit,
							state.isSubmitting,
							state.isDirty,
						]}
					>
						{([canSubmit, isSubmitting, isDirty]) => (
							<Button
								type="submit"
								disabled={!canSubmit || !isDirty}
								variant="outline"
							>
								{isSubmitting ? "..." : "Create"}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</DialogContent>
		</Dialog>
	)
}
