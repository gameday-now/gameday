import { ActionRequest, actionResponseZod } from "@gameday/models"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import useWebSocket from "react-use-websocket"
import { v4 as uuid } from "uuid"

const useGenericConnection = <T>(endpoint: string) => {
	const navigate = useNavigate()
	const router = useRouterState()
	const pendingActions = useRef<Record<string, () => void>>({})
	const { lastJsonMessage, sendJsonMessage } = useWebSocket<T>(
		`${location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/${endpoint}`,
		{
			share: true,
			shouldReconnect: () => true,
			reconnectInterval: 3000,
			onOpen: () => {
				Object.keys(pendingActions.current).forEach((key) => {
					pendingActions.current[key]?.()
				})
			},
			onClose: (e) => {
				if (e.code === 4401) {
					void navigate({
						to: "/login",
						reloadDocument: true,
						search: { returnTo: router.location.pathname },
					})
				}
			},
		},
	)
	const [data, setData] = useState<T | undefined>(undefined)
	const [permissions, setPermissions] = useState<string[] | undefined>(
		undefined,
	)
	useEffect(() => {
		if (lastJsonMessage) {
			const { type, data, actionId, message } =
				actionResponseZod.parse(lastJsonMessage)
			if (type === "data") {
				setData(data)
			} else if (type === "permissions") {
				setPermissions(data)
			} else {
				if (actionId && actionId in pendingActions.current) {
					pendingActions.current[actionId]()
				}

				if (type === "error") {
					console.error("Error from server:", message)
				}
			}
		}
	})

	const sendAction = async <A extends Omit<ActionRequest, "actionId">>(
		request: A,
	) => {
		const actionId = uuid()
		sendJsonMessage({ ...request, actionId })
		await new Promise<void>((resolve) => {
			pendingActions.current[actionId] = resolve
		})
		delete pendingActions.current[actionId]
	}

	return { data, sendAction, permissions }
}

export default useGenericConnection
