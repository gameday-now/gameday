import type { ElysiaApp } from "@/server"
import { ActionResponse } from "@gameday/models"
import { ElysiaWS } from "elysia/ws"
import { ChangeStream } from "mongodb"
import { z } from "zod"

export type UserID = string
export type RouteConfig<
	InitialData extends InitialCallback = InitialCallback<any>,
	Data = any,
	Actions extends SocketActions = any,
> = {
	initialData: Awaited<ReturnType<InitialData>>
	data: Data
	actions: Actions
}

type ContextData = Parameters<
	NonNullable<Parameters<ElysiaApp["ws"]>[1]["open"]>
>[0]["data"]

export type SocketActions = Record<string, z.AnyZodObject>

export type ActionDeclaration<
	Config extends RouteConfig,
	K extends keyof Config["actions"],
> = {
	permission?: string
	fn: ({}: {
		data: ContextData
		request: z.infer<Config["actions"][K]>
		initialData: Config["initialData"]
		uid: UserID
	}) => Promise<Omit<ActionResponse, "actionId">>
}

export type InitialCallback<InitialData = {}> = ({}: {
	send: ElysiaWS["send"]
	data: ContextData
	uid: UserID
}) => Promise<NonNullable<InitialData>>

export type PrimaryDataCallback<Config extends RouteConfig> = ({}: {
	initialData: Config["initialData"]
	data: ContextData
	uid: UserID
}) => Promise<Config["data"] | undefined>

export type AuthorizationResponse = {
	basePermission: string
	season: string
	resourceType: string
	resourceKey: string
}

export type Authorization = ({}: {
	data: ContextData
	uid: UserID
}) => Promise<AuthorizationResponse>

export type Watcher<Config extends RouteConfig> = ({}: {
	sendPrimaryData: () => void
	data: ContextData
	initialData: Config["initialData"]
}) => ChangeStream | ChangeStream[]

export type ActionSocket = <Config extends RouteConfig>(params: {
	authorization?: Authorization
	initialCallback: InitialCallback<Config["initialData"]>
	watcher: Watcher<Config>
	primaryDataCallback: PrimaryDataCallback<Config>
	actions: Config["actions"]
	callbacks: {
		[K in keyof Config["actions"]]: ActionDeclaration<Config, K>
	}
	onDestroy?: ({}: {
		initialData: Config["initialData"] | null
		data: ContextData
	}) => Promise<void>
}) => void
