import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Match, NewBreak, newBreakZod } from "@gameday/models"
import { useForm } from "@tanstack/react-form"
import { addMinutes, format } from "date-fns"
import { Dispatch, SetStateAction, useState } from "react"
import { mergeDateAndTime } from "./utils"

export default ({
	match,
	disabled,
	cycleTime,
	createBreak,
	setIsDrawerOpen,
}: {
	match: Match
	disabled: boolean
	cycleTime: number
	setIsDrawerOpen: Dispatch<SetStateAction<boolean>>
	createBreak: (values: NewBreak) => Promise<void>
}) => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>()
	const form = useForm({
		defaultValues: {
			title: "",
			afterMatchId: match.description,
			startTime: format(addMinutes(match.startTime, cycleTime), "HH:mm"),
			endTime: format(addMinutes(match.startTime, 45), "HH:mm"),
		} satisfies NewBreak,
		validators: {
			onChange: newBreakZod,
			onMount: newBreakZod,
			onBlur: newBreakZod,
		},
		onSubmit: async ({ value }) => {
			try {
				await createBreak({
					...value,
					startTime: mergeDateAndTime(
						match.startTime,
						value.startTime,
					),
					endTime: mergeDateAndTime(match.startTime, value.endTime),
				})
				setIsModalOpen(false)
				setIsDrawerOpen(false)
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
				<Button variant="outline" disabled={disabled}>
					Add break after match
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add new break</DialogTitle>
					<DialogDescription>
						after match {match.title}
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
					className="contents"
				>
					<div className="w-full">
						<label>Title</label>
						<form.Field name="title">
							{(field) => (
								<Input
									value={field.state.value}
									onBlur={field.handleBlur}
									placeholder="Lunch Break"
									onChange={(e) =>
										field.handleChange(e.target.value)
									}
								/>
							)}
						</form.Field>
					</div>
					<div className="flex justify-center gap-2">
						<div className="w-full">
							<label>From</label>
							<form.Field name="startTime">
								{(field) => (
									<Input
										type="time"
										step="1"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(e.target.value)
										}
										className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
									/>
								)}
							</form.Field>
						</div>
						<div className="w-full">
							<label>To</label>
							<form.Field name="endTime">
								{(field) => (
									<Input
										type="time"
										step="1"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(e.target.value)
										}
										className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
									/>
								)}
							</form.Field>
						</div>
					</div>

					<form.Subscribe
						selector={(state) => [
							state.canSubmit,
							state.isSubmitting,
							state.isDirty,
						]}
						children={([canSubmit, isSubmitting, isDirty]) => (
							<Button
								type="submit"
								disabled={!canSubmit || !isDirty}
								variant="outline"
							>
								{isSubmitting ? "..." : "Add Break"}
							</Button>
						)}
					/>
				</form>
			</DialogContent>
		</Dialog>
	)
}
