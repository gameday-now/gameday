import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Break, Match, NewRematch, newRematchZod } from "@gameday/models"
import { useForm } from "@tanstack/react-form"
import { addMinutes, format, subMinutes } from "date-fns"
import { Dispatch, SetStateAction, useState } from "react"

export default ({
	match,
	disabled,
	scheduleRematch,
	setIsDrawerOpen,
	breaks,
	cycleTime,
}: {
	match: Match
	disabled: boolean
	setIsDrawerOpen: Dispatch<SetStateAction<boolean>>
	scheduleRematch: (values: NewRematch) => Promise<void>
	breaks: Record<string, Break> | undefined
	cycleTime: number
}) => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>()
	const form = useForm({
		defaultValues: {
			anchorPoint: {
				breakId: "",
				type: "",
			},
			originalMatchId: match.description,
		},
		validators: {
			onChange: newRematchZod,
			onMount: newRematchZod,
			onBlur: newRematchZod,
		},
		onSubmit: async ({ value }) => {
			try {
				await scheduleRematch(newRematchZod.parse(value))
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
					Schedule Rematch
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Schedule Rematch</DialogTitle>
					<DialogDescription>for {match.title}</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
					className="contents"
				>
					{breaks && (
						<form.Field name="anchorPoint">
							{(field) => (
								<>
									{Object.values(breaks).map(
										({
											_id,
											title,
											startTime,
											endTime,
										}) => {
											const beforeBreakSelected =
												field.state.value?.type ===
													"before_break" &&
												field.state.value.breakId ===
													_id
											const afterBreakSelected =
												field.state.value?.type ===
													"after_break" &&
												field.state.value.breakId ===
													_id
											return (
												<div className="border rounded-md flex flex-col items-center gap-4 p-4 shadow">
													<div className="text-center">
														<div>{title}</div>
														<div>
															<span
																className={cn({
																	"line-through":
																		beforeBreakSelected ||
																		afterBreakSelected,
																})}
															>
																<span>
																	{format(
																		startTime,
																		"HH:mm",
																	)}
																</span>
																<span>
																	{" - "}
																</span>
																<span>
																	{format(
																		endTime,
																		"HH:mm",
																	)}
																</span>
															</span>
															{(beforeBreakSelected ||
																afterBreakSelected) && (
																<span>
																	<span>
																		{format(
																			addMinutes(
																				startTime,
																				beforeBreakSelected
																					? cycleTime
																					: 0,
																			),
																			" HH:mm",
																		)}
																	</span>

																	<span>
																		{" - "}
																	</span>
																	<span>
																		{format(
																			subMinutes(
																				endTime,
																				afterBreakSelected
																					? cycleTime
																					: 0,
																			),
																			"HH:mm ",
																		)}
																	</span>
																</span>
															)}
														</div>
													</div>
													<div className="flex gap-2">
														<Button
															type="button"
															variant={
																beforeBreakSelected
																	? "default"
																	: "outline"
															}
															onClick={() => {
																field.setValue({
																	type: "before_break",
																	breakId:
																		_id,
																})
															}}
														>
															Before break
														</Button>
														<Button
															type="button"
															variant={
																afterBreakSelected
																	? "default"
																	: "outline"
															}
															onClick={() => {
																field.setValue({
																	type: "after_break",
																	breakId:
																		_id,
																})
															}}
														>
															After break
														</Button>
													</div>
												</div>
											)
										},
									)}
									<Button
										type="button"
										variant={
											field.state.value.type ===
											"after_last_qual"
												? "default"
												: "outline"
										}
										onClick={() => {
											field.setValue({
												type: "after_last_qual",
												breakId: "",
											})
										}}
									>
										After last qualification
									</Button>
								</>
							)}
						</form.Field>
					)}

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
								{isSubmitting ? "..." : "Schedule"}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</DialogContent>
		</Dialog>
	)
}
