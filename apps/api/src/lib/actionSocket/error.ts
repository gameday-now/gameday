import { ElysiaApp } from "@/server"

export class SocketError extends Error {
	public closeCode?: number
	constructor({
		message,
		closeCode,
	}: {
		message: string
		closeCode?: number
	}) {
		super(message)
		this.name = "SocketError"
		this.closeCode = closeCode
	}
}

export const DUnauthenticated = new SocketError({
	message: "Unauthenticated",
	closeCode: 4401,
})
export const DUnauthorized = new SocketError({
	message: "Unauthorized",
	closeCode: 4403,
})

export const DAuthorizationError = new SocketError({
	message: "Authorization Error",
	closeCode: 4500,
})

export const Unauthorized = new SocketError({
	message: "Unauthorized",
})

type ContextData =
	| Parameters<NonNullable<Parameters<ElysiaApp["ws"]>[1]["open"]>>[0]
	| Parameters<NonNullable<Parameters<ElysiaApp["ws"]>[1]["message"]>>[0]
	| Parameters<NonNullable<Parameters<ElysiaApp["ws"]>[1]["close"]>>[0]

export const handleError = (
	error: unknown,
	actionId: string | null,
	ws: ContextData,
) => {
	if (error instanceof SocketError) {
		const { message, closeCode } = error
		ws.data.log.warn(`${message} error`)
		ws.send({
			type: "error",
			actionId,
			message,
		})
		if (closeCode) {
			ws.close(closeCode, message)
		} else {
			return false
		}
	} else {
		ws.data.log.error(`${error} is not SocketError`)
		ws.close(4500, "Unknown Error")
	}
	return true
}
