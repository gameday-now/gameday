import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EventConfig, Match, NewBreak, newBreakZod } from "@gameday/models"
import { useForm } from "@tanstack/react-form"
import { Fragment, useMemo } from "react"
import { z } from "zod"
import BreakBlockC from "./breakBlock"
import MatchBlockC from "./matchBlock"
import { extractBreakBlocks, extractMatchBlocks } from "./utils"

export default ({
	matches,
	config,
	reviewSchedule,
}: {
	matches: Match[]
	config: EventConfig
	reviewSchedule: (breaks: NewBreak[]) => Promise<void>
}) => {
	const { matchBlocks, breakBlocks } = useMemo(() => {
		const matchBlocks = extractMatchBlocks(matches, config)
		const breakBlocks = extractBreakBlocks(matchBlocks)
		return { matchBlocks, breakBlocks }
	}, [matches, config])

	const validator = z.object({
		breaks: newBreakZod.array(),
	})

	const form = useForm({
		defaultValues: {
			breaks: breakBlocks.map((block) => ({
				title: "",
				startTime: block.startTime,
				endTime: block.endTime,
				afterMatchId: block.afterMatchId,
			})),
		},
		validators: {
			onMount: validator,
			onChange: validator,
			onBlur: validator,
		},
		onSubmit: async ({ value: { breaks } }) => {
			try {
				await reviewSchedule(newBreakZod.array().parse(breaks))
			} catch {}
		},
	})

	return (
		<>
			<div className="text-center mt-2">
				Hey Lead Queuer, please review the schedule for this event. If
				you need any changes, please contact your Scorekeeper.
			</div>
			<div className="flex justify-center gap-4">
				<Badge className="text-sm">Matches: {matches.length}</Badge>
				<Badge className="text-sm">Fields: {config.fields}</Badge>
				<Badge className="text-sm">
					Cycle Time: {config.cycleTime}m
				</Badge>
			</div>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					e.stopPropagation()
					form.handleSubmit()
				}}
				className="contents"
			>
				{matchBlocks.map((block, index) => (
					<Fragment key={block.id}>
						<MatchBlockC matchBlock={block} />
						{breakBlocks[index] && (
							<form.Field name={`breaks[${index}].title`}>
								{(field) => (
									<BreakBlockC
										breakBlock={breakBlocks[index]}
										titleValue={field.state.value}
										setTitleValue={field.setValue}
									/>
								)}
							</form.Field>
						)}
					</Fragment>
				))}
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
							className="mt-4 mb-20"
							disabled={!canSubmit || !isDirty}
						>
							{isSubmitting
								? "..."
								: "Finish Review & Enable Schedule"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</>
	)
}
