// Forked from https://github.com/kravetsone/elysia-autoload

import fs from "node:fs"
import path from "path"

export const getPath = (dir: string) => {
	const argv1 = process.argv[1]!
	if (path.isAbsolute(dir)) return dir
	if (path.isAbsolute(argv1)) return path.join(argv1, "..", dir)

	return path.join(process.cwd(), argv1, "..", dir)
}

// Inspired by https://github.com/wobsoriano/elysia-autoroutes/blob/main/src/utils/transformPathToUrl.ts#L4C31-L4C31
export const transformToUrl = (path: string) =>
	path
		// Clean the url extensions
		.replace(/\.(ts|tsx|js|jsx|mjs|cjs)$/u, "")
		.replace(/\./g, "/")
		// Fix windows slashes
		.replaceAll("\\", "/")
		// Handle wild card based routes - users/[...id]/profile.ts -> users/*/profile
		.replaceAll(/\[\.\.\..*\]/gu, "*")
		// Handle generic square bracket based routes - users/[id]/index.ts -> users/:id
		.replaceAll(/\[(.*?)\]/gu, (_: string, match: string) => `:${match}`)
		.replaceAll(/\$(.*?)/gu, (_: string, match: string) => `:${match}`)
		.replace(/\/?\((.*)\)/, "")
		// Handle the case when multiple parameters are present in one file
		// users / [id] - [name].ts to users /: id -:name and users / [id] - [name] / [age].ts to users /: id -: name /: age
		.replaceAll("]-[", "-:")
		.replaceAll("]/", "/")
		.replaceAll(/\[|\]/gu, "")
		// remove index from end of path
		.replace(/\/?index$/, "")

const getParamsCount = (path: string) => path.match(/\[(.*?)\]/gu)?.length || 0

export const sortByNestedParams = (routes: string[]): string[] =>
	routes.sort((a, b) => getParamsCount(a) - getParamsCount(b))

export const fixSlashes = (prefix?: string) =>
	!prefix?.endsWith("/") ? prefix : prefix + "/"

export const addRelativeIfNotDot = (path: string) =>
	path.at(0) !== "." ? `./${path}` : path

export const IS_BUN = typeof Bun !== "undefined"

export const globSync = (globPattern: string, globOptions: { cwd?: string }) =>
	IS_BUN
		? Array.from(new Bun.Glob(globPattern).scanSync(globOptions))
		: fs.globSync(globPattern, globOptions)
