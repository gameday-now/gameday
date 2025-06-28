import { Firebase } from "@/plugins/firebase"
import { parse } from "cookie"
import { Permit } from "permitio"

export const getSession = (request: Request) =>
	parse(request.headers.get("cookie") ?? "")?.["session"]

export const getUserId = async ({
	session,
	firebase,
}: {
	firebase: Firebase
	session: string | undefined
}) => {
	try {
		const verifiedSession = await firebase.auth.verifyIdToken(session ?? "")
		return verifiedSession.uid
	} catch {
		return null
	}
}

export const checkPermission = async ({
	permit,
	uid,
	permission,
	season,
	resourceKey,
	resourceType,
}: {
	permit: Permit
	uid: string
	permission: string
	resourceType: string
	resourceKey: string
	season: string
}) =>
	await permit.check(uid, permission, {
		type: resourceType,
		tenant: season,
		key: resourceKey,
	})

export const getAllowedPermissions = async ({
	permit,
	uid,
	season,
	resourceKey,
	resourceType,
}: {
	permit: Permit
	uid: string
	resourceType: string
	resourceKey: string
	season: string
}) => {
	const response = await permit.getUserPermissions(
		{ key: uid },
		[season],
		[`${resourceType}:${resourceKey}`],
	)
	if (!response) {
		return []
	}
	const keys = Object.keys(response)
	return [
		...new Set(
			keys.reduce<string[]>(
				(all, key) => [...all, ...(response[key]?.permissions ?? [])],
				[],
			),
		),
	].map((permission) => permission.replace(`${resourceType}:`, ""))
}
