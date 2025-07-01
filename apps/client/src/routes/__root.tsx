import Icon from "@/assets/icon.svg?react"
import LogoLoading from "@/assets/logoLoading"
import UserMenu from "@/components/userMenu"
import useCurrentUser from "@/hooks/useCurrentUser"
import {
	Link,
	Outlet,
	createRootRoute,
	useRouterState,
} from "@tanstack/react-router"
import { detect } from "detect-browser"
import { useState } from "react"
import PWAPrompt from "react-ios-pwa-prompt"

export const Route = createRootRoute({
	component: () => {
		const router = useRouterState()
		const [showPWAPrompt, setShowPWAPrompt] = useState<boolean>(true)
		const { user, isLoading, roles } = useCurrentUser()

		return (
			<>
				{isLoading && (
					<div className="w-screen h-screen flex justify-center items-center">
						<LogoLoading className="w-40" />
					</div>
				)}
				{!isLoading && router.location.pathname === "/login" && (
					<Outlet />
				)}
				{router.location.pathname !== "/login" && user && (
					<div className="min-h-screen bg-gray-50">
						<header className="bg-white border-b">
							<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
								<div className="py-4">
									<div className="flex items-center justify-between mx-2">
										<Link
											to="/"
											className="contents"
											reloadDocument
										>
											<div className="flex gap-2 items-center ">
												<Icon className="w-10" />
												<div className="flex flex-col gap-0">
													<h1 className="text-l p-0 font-bold text-secondary-foreground font-[outfit]">
														Gameday
													</h1>
												</div>
											</div>
										</Link>
										<UserMenu user={user} roles={roles} />
									</div>
								</div>
							</div>
						</header>
						<main>
							<Outlet />
							{detect()?.os === "iOS" &&
								detect()?.type === "browser" && (
									<PWAPrompt
										copySubtitle="https://gameday.now"
										appIconPath="https://gameday.now/icons/ios/72.png"
										isShown={showPWAPrompt}
										onClose={() => {
											setShowPWAPrompt(false)
										}}
									/>
								)}
						</main>
					</div>
				)}
			</>
		)
	},
})
