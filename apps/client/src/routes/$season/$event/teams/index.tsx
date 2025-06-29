import BackTo from "@/components/backTo"
import LogoLoadingSpinner from "@/components/logoLoadingSpinner"
import PageContainer from "@/components/pageContainer"
import ScrollTop from "@/components/scrollTop"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { useTeams } from "@/hooks/useTeams"
import {
	ADD_TEAM_LIST_PERMISSION,
	DELETE_TEAM_LIST_PERMISSION,
} from "@gameday/models"
import { createFileRoute } from "@tanstack/react-router"
import title from "title"
import AddTeamList from "./-addTeamList"
import DeleteTeamList from "./-deleteTeamList"
import TeamCheckbox from "./-teamCheckbox"

export const Route = createFileRoute("/$season/$event/teams/")({
	component: RouteComponent,
})

function RouteComponent() {
	const { season, event } = Route.useParams()
	const { response, markTeam, permissions, addList, deleteList } = useTeams({
		season,
		event,
	})

	const teams = response?.teams
	const teamLists = response?.teamLists
	const canAddLists = permissions?.includes(ADD_TEAM_LIST_PERMISSION) ?? false
	const canDeleteLists =
		permissions?.includes(DELETE_TEAM_LIST_PERMISSION) ?? false
	if (!teams || !teamLists) {
		return (
			<div className="text-center h-[calc(100vh_-_70px)] rounded-lg w-full flex flex-col justify-center items-center">
				<LogoLoadingSpinner className="w-10" />
			</div>
		)
	}

	return (
		<PageContainer>
			<ScrollTop />
			<BackTo name={event.toUpperCase()} route={`/${season}/${event}`} />
			<div className="pt-2 text-center">
				<h2 className="text-xl font-semibold">{teams.length} Teams</h2>
			</div>

			<div className="overflow-x-auto mt-2">
				<Table className="mb-2">
					<TableHeader>
						<TableRow>
							<TableHead className="sticky top-auto left-0 bg-gray-50 z-10">
								#
							</TableHead>
							<TableHead>Name</TableHead>
							{canAddLists && (
								<TableHead>
									<AddTeamList addList={addList} />
								</TableHead>
							)}
							{teamLists.map((list) => (
								<TableHead
									key={list._id}
									className="text-center"
								>
									<Popover>
										<PopoverTrigger className="underline decoration-dashed">
											{title(list.listName)}
										</PopoverTrigger>
										<PopoverContent
											side="top"
											className="w-fit text-center text-sm flex gap-2 items-center justify-center"
										>
											{`${
												Object.values(
													list.listChecks ?? {},
												).filter((checked) => checked)
													.length
											} / ${teams.length}`}

											{canDeleteLists && (
												<DeleteTeamList
													teamList={list}
													deleteList={deleteList}
												/>
											)}
										</PopoverContent>
									</Popover>
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{teams.map(
							({ teamName, teamNumber, displayTeamNumber }) => (
								<TableRow key={teamNumber}>
									<TableCell className="z-10 sticky font-medium left-0 bg-gray-50 h-12">
										{teamNumber}
									</TableCell>
									<TableCell className="font-medium">
										{teamName}
									</TableCell>
									{canAddLists && <TableCell />}
									{teamLists.map(({ _id, listChecks }) => (
										<TableCell
											key={_id}
											className="text-center h-12"
										>
											<TeamCheckbox
												markTeam={markTeam}
												teamNumber={teamNumber}
												listId={_id}
												checked={
													listChecks?.[
														displayTeamNumber
													] ?? false
												}
											/>
										</TableCell>
									))}
								</TableRow>
							),
						)}
					</TableBody>
				</Table>
			</div>
		</PageContainer>
	)
}
