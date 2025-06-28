import { config } from "@/config"
import Elysia from "elysia"
import { Context, IAction, IResource, IUser, Permit } from "permitio"

export interface ICheckQuery {
	user: IUser | string
	action: IAction | string
	resource: IResource | string
	context?: Context
}

export default new Elysia()
	.decorate(
		"permit",
		new Permit({
			pdp: config.PERMIT_DPD_URI,
			token: config.PERMIT_TOKEN,
		}),
	)
	.as("global")
