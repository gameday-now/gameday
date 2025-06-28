import Google from "@/assets/google.svg?react"
import Logo from "@/assets/logo.svg?react"
import AboutFooter from "@/components/aboutFooter"
import { Button } from "@/components/ui/button"
import { auth, googleProvider } from "@/firebase"
import useCurrentUser from "@/hooks/useCurrentUser"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { signInAnonymously, signInWithPopup } from "firebase/auth"
import { useEffect } from "react"

export const Route = createFileRoute("/login")({
	component: RouteComponent,
})

function RouteComponent() {
	const search = useSearch({ from: "/login" })
	const navigate = useNavigate()
	const { user, isLoading } = useCurrentUser()
	useEffect(() => {
		if (!isLoading && user) {
			if ("returnTo" in search && typeof search.returnTo === "string") {
				void navigate({
					to: search.returnTo,
					reloadDocument: true,
				})
			} else {
				void navigate({
					to: "/",
					reloadDocument: true,
				})
			}
		}
	}, [user, isLoading])

	return (
		<div className="w-screen h-screen flex justify-between items-center flex-col gap-4">
			<div className="flex justify-center items-center flex-col gap-4 h-full">
				<Logo className="h-25" />
				<h1 className="text-4xl">
					<span className="text-secondary-foreground font-[outfit]">
						Welcome
					</span>{" "}
					<span className="text-primary font-[outfit] font-semibold">
						Back
					</span>
				</h1>
				<div className="my-2 flex flex-col gap-4">
					<Button
						variant="outline"
						onClick={() => {
							void signInAnonymously(auth)
						}}
					>
						Create Temporary Account
					</Button>
					<Button
						variant="outline"
						onClick={() => {
							signInWithPopup(auth, googleProvider)
						}}
					>
						Sign in with Google <Google />
					</Button>
				</div>
			</div>
			<AboutFooter className="mb-10" />
		</div>
	)
}
