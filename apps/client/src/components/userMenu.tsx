import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { auth } from "@/firebase"
import { cn } from "@/lib/utils"
import { MeRole } from "@gameday/models"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import Avvvatars from "avvvatars-react"
import { User, signOut } from "firebase/auth"
import { Fragment, useState } from "react"
import title from "title"

const UserMenu = ({ user, roles }: { user: User; roles: MeRole[] }) => {
	const navigate = useNavigate()
	const router = useRouterState()
	const [showSignOutDialog, setShowSignOutDialog] = useState<boolean>(false)
	const onSignoutHandler = ({ override }: { override: boolean }) => {
		if (user.isAnonymous && !override) {
			setShowSignOutDialog(true)
		} else {
			void signOut(auth)
			void navigate({
				to: "/login",
				reloadDocument: true,
				search: { returnTo: router.location.pathname },
			})
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Avvvatars
						value={
							user.isAnonymous
								? "TA"
								: (user.displayName ?? user.email ?? user.uid)
						}
						style="character"
						size={32}
					/>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="end" forceMount>
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">
								{user.isAnonymous
									? "Temporary Account"
									: user.displayName}
							</p>
							<p className="text-xs leading-none text-muted-foreground">
								{user.isAnonymous
									? "This account is not registered"
									: user.email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{roles.map(({ id, name, resource }) => (
						<Fragment key={id}>
							<DropdownMenuLabel>
								<p className="text-sm font-normal leading-none">
									{`${name} `}
									<span
										className={cn(
											"text-xs leading-none font-light text-muted-foreground",
											{
												"text-primary": !resource,
											},
										)}
									>
										{resource
											? `${title(resource.name)}#${resource.key}`
											: "Super Role"}
									</span>
								</p>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
						</Fragment>
					))}

					<DropdownMenuItem
						onClick={() => onSignoutHandler({ override: false })}
					>
						Sign out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<AlertDialog
				open={showSignOutDialog}
				onOpenChange={setShowSignOutDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This account is not registered with gameday.now.
							Once you sign out of the account, you will lose all
							permissions.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => onSignoutHandler({ override: true })}
						>
							Sign Out
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}

export default UserMenu
