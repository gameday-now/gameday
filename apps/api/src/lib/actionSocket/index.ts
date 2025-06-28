import type { ElysiaApp } from "@/server"
import { actionRequestZod } from "@gameday/models"
import { ChangeStream } from "mongodb"
import {
	checkPermission,
	getAllowedPermissions,
	getSession,
	getUserId,
} from "./auth"
import {
	DAuthorizationError,
	DUnauthenticated,
	DUnauthorized,
	handleError,
	Unauthorized,
} from "./error"
import { ActionSocket } from "./types"

const actionSocket: ActionSocket =
	({
		authorization,
		initialCallback,
		watcher,
		actions,
		primaryDataCallback,
		callbacks,
		onDestroy,
	}) =>
	(app: ElysiaApp) =>
		app
			.state("watcher", {} as ChangeStream | ChangeStream[] | undefined)
			.state("uid", "")
			.state("initialData", {})
			.ws("", {
				open: async (ws) => {
					const { data, send, id: connectionId } = ws
					const { log, firebase, store, request, permit } = data
					try {
						const session = getSession(request)
						const uid = await getUserId({ firebase, session })
						if (!uid) {
							throw DUnauthenticated
						}
						if (authorization) {
							const {
								basePermission,
								resourceKey,
								season,
								resourceType,
							} = await authorization({ data, uid })
							const allowed = await checkPermission({
								permit,
								uid,
								permission: basePermission,
								resourceKey,
								resourceType,
								season,
							})
							if (!allowed) {
								throw DUnauthorized
							}
							const permissions = await getAllowedPermissions({
								permit,
								resourceKey,
								resourceType,
								season,
								uid,
							})
							send({
								type: "permissions",
								data: permissions,
							})
						}
						log.info(`<${connectionId}> Opening connection`)
						const initialData = await initialCallback({
							send,
							data,
							uid,
						})
						const sendPrimaryData = async () => {
							const primaryDataResult = await primaryDataCallback(
								{
									data,
									initialData,
									uid,
								},
							)
							send({
								type: "data",
								data: primaryDataResult,
							})
						}
						await sendPrimaryData()
						store.watcher = watcher({
							data,
							initialData,
							sendPrimaryData,
						})
						store.uid = uid
						store.initialData = initialData
					} catch (e) {
						if (handleError(e, null, ws)) {
							return
						}
					}
				},
				close: ({ data, id: connectionId }) => {
					const { store, log } = data
					store.initialData
					log.info(`<${connectionId}> Closing Connection`)
					if (store.watcher && Array.isArray(store.watcher)) {
						store.watcher.forEach((watch) => {
							watch.close()
						})
					} else {
						store.watcher?.close()
					}
					onDestroy?.({ initialData: store.initialData, data })
				},
				message: async (ws, message) => {
					const { data, id: connectionId, send } = ws
					const { log, store, permit } = data
					const { uid, initialData } = store
					log.info(`<${connectionId}> Incoming action`)
					const { error, data: actionMessage } =
						actionRequestZod.safeParse(message)
					if (error) {
						log.error(error)
						send({
							type: "error",
							actionId: null,
							message: error.format(),
						})
						return
					}
					const { actionId, type } = actionMessage
					try {
						log.info(
							`<${connectionId}> ${type} action (${actionId})`,
						)
						const action = actions[type]
						const callback = callbacks[type]
						const callbackFunction = callback?.fn
						const callbackPermission = callback?.permission
						if (!action || !callback || !callbackFunction) {
							send({
								type: "error",
								actionId,
								message: `Action ${type} not found. The available actions are: ${Object.keys(actions).join(",")}`,
							})
							return
						}

						if (callbackPermission) {
							if (!authorization) {
								throw DAuthorizationError
							}
							const { resourceKey, season, resourceType } =
								await authorization({ data, uid })
							const allowed = await checkPermission({
								permit,
								uid,
								permission: callbackPermission,
								resourceKey,
								resourceType,
								season,
							})

							if (!allowed) {
								throw Unauthorized
							}
						}

						const {
							success: dataParseSuccess,
							error: dataParseError,
							data: dataRequest,
						} = action.safeParse(message)
						if (!dataParseSuccess) {
							send({
								type: "error",
								actionId,
								message: JSON.stringify(
									dataParseError.format(),
								),
							})
							return
						}
						const response = await callbackFunction({
							data,
							initialData,
							request: dataRequest,
							uid,
						})
						const primaryData = await primaryDataCallback({
							data,
							initialData,
							uid,
						})
						send({
							data: primaryData,
							type: "data",
						})
						send({
							...response,
							actionId,
						})
					} catch (e) {
						if (handleError(e, actionId, ws)) {
							return
						}
					}
				},
			})

export default actionSocket
