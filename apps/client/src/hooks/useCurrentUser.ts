import { auth } from "@/firebase"
import { MeResponse, MeRole } from "@gameday/models"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import axios from "axios"
import {
	browserLocalPersistence,
	onAuthStateChanged,
	User,
} from "firebase/auth"
import { useEffect, useState } from "react"

const useCurrentUser = () => {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [isSettingPersistence, setIsSettingPersistence] =
		useState<boolean>(true)
	const [user, setUser] = useState<User | null>()
	const [roles, setRoles] = useState<MeRole[]>([])
	const router = useRouterState()
	const navigate = useNavigate()

	const authStateChanged = async (user: User | null) => {
		if (user) {
			const idToken = await user.getIdToken()
			try {
				await axios.post("/api/login", {
					token: idToken,
				})
				const {
					data: { roles },
				} = await axios.get<MeResponse>("/api/me")
				setRoles(roles)
			} catch {}
		}
		setUser(user)
		if (!user && router.location.pathname !== "/login") {
			await navigate({
				to: "/login",
				search: { returnTo: router.location.pathname },
			})
		}
		setIsLoading(false)
	}

	useEffect(() => {
		auth.setPersistence(browserLocalPersistence).then(() => {
			setIsSettingPersistence(false)
		})
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			void authStateChanged(user)
		})
		return () => {
			unsubscribe()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return { isLoading: isLoading || isSettingPersistence, user, roles }
}

export default useCurrentUser
