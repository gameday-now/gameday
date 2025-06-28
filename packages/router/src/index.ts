// Forked from https://github.com/kravetsone/elysia-autoload

import {
	type BaseMacro,
	Elysia,
	type InputSchema,
	type LocalHook,
	type RouteSchema,
	type SingletonBase,
} from "elysia"
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"
import type { SoftString } from "./types"
import {
	addRelativeIfNotDot,
	fixSlashes,
	getPath,
	globSync,
	sortByNestedParams,
	transformToUrl,
} from "./utils"

export type * from "./types"

export type SchemaHandler = ({
	path,
	url,
}: {
	path: string
	url: string
}) => LocalHook<
	InputSchema,
	RouteSchema,
	SingletonBase,
	Record<string, Error>,
	BaseMacro,
	""
>

export interface TypesOptions {
	output?: string | string[]
	typeName?: string
	useExport?: boolean
}

export interface AutoloadOptions {
	pattern?: string
	dir?: string
	prefix?: string
	types?: TypesOptions | true
	/**
	 * Throws an error if no matches are found.
	 * @default true
	 */
	failGlob?: boolean
	/**
	 * import a specific `export` from a file
	 * @example import first export
	 * ```ts
	 * import: (file) => Object.keys(file).at(0) || "default",
	 * ```
	 * @default "default"
	 */
	// biome-ignore lint/suspicious/noExplicitAny: import return any
	import?: SoftString<"default"> | ((file: any) => string)
	/**
	 * Skip imports where needed `export` not defined
	 * @default false
	 */
	skipImportErrors?: boolean
}

const DIR_ROUTES_DEFAULT = "./routes"
const TYPES_OUTPUT_DEFAULT = "./routes-types.ts"
const TYPES_TYPENAME_DEFAULT = "Routes"
const TYPES_OBJECT_DEFAULT = {
	output: [TYPES_OUTPUT_DEFAULT],
	typeName: TYPES_TYPENAME_DEFAULT,
} satisfies TypesOptions

export async function autoload(options: AutoloadOptions = {}) {
	const { pattern, prefix } = options
	const failGlob = options.failGlob ?? true
	const getImportName = options?.import ?? "default"

	const dir = options.dir ?? DIR_ROUTES_DEFAULT
	// some strange code to provide defaults
	const types: (Omit<TypesOptions, "output"> & { output: string[] }) | false =
		options.types
			? options.types !== true
				? {
						...TYPES_OBJECT_DEFAULT,
						...options.types,
						// This code allows you to omit the output data or specify it as an string[] or string.
						output: !options.types.output
							? [TYPES_OUTPUT_DEFAULT]
							: Array.isArray(options.types.output)
								? options.types.output
								: [options.types.output],
					}
				: TYPES_OBJECT_DEFAULT
			: false

	const directoryPath = getPath(dir)

	if (!fs.existsSync(directoryPath))
		throw new Error(`Directory ${directoryPath} doesn't exists`)
	if (!fs.statSync(directoryPath).isDirectory())
		throw new Error(`${directoryPath} isn't a directory`)

	const plugin = new Elysia({
		name: "router",
		prefix: fixSlashes(prefix),
		seed: {
			pattern,
			dir,
			prefix,
			types,
		},
	})

	const globPattern = pattern || "**/*.{ts,tsx,js,jsx,mjs,cjs}"
	const globOptions = { cwd: directoryPath }

	const files = globSync(globPattern, globOptions)
	if (failGlob && files.length === 0)
		throw new Error(
			`No matches found in ${directoryPath}. You can disable this error by setting the failGlob parameter to false in the options of autoload plugin`,
		)

	const paths: [path: string, exportName: string][] = []

	for (const filePath of sortByNestedParams(files)) {
		const fullPath = path.join(directoryPath, filePath)
		if (path.parse(filePath).name.startsWith("!")) {
			continue
		}
		const file = await import(pathToFileURL(fullPath).href)

		const importName =
			typeof getImportName === "string"
				? getImportName
				: getImportName(file)

		const importedValue = file[importName]
		if (!importedValue) {
			if (options?.skipImportErrors) continue
			throw new Error(`${filePath} don't provide export ${importName}`)
		}

		const url = transformToUrl(filePath)

		if (typeof importedValue === "function")
			if (importedValue.length > 0) {
				plugin.group(url, {}, importedValue)
			} else {
				plugin.group(url, {}, (app) => app.use(importedValue()))
			}
		else if (importedValue instanceof Elysia)
			// @ts-expect-error
			plugin.group(url, {}, groupOptions, (app) => app.use(importedValue))

		if (types) paths.push([fullPath.replace(directoryPath, ""), importName])
	}

	if (types) {
		for await (const outputPath of types.output) {
			const outputAbsolutePath = getPath(outputPath)

			const imports: string[] = paths.map(
				([x, exportName], index) =>
					`import type ${exportName === "default" ? `Route${index}` : `{ ${exportName} as Route${index} }`} from "${addRelativeIfNotDot(
						path
							.relative(
								path.dirname(outputAbsolutePath),
								directoryPath + x.replace(/\.(ts|tsx)$/, ""),
							)
							.replaceAll("\\", "/"),
					)}";`,
			)

			const input = [
				`import type { ElysiaWithBaseUrl } from "@gameday/router"`,
				imports.join("\n"),
				"",
				!types.useExport ? "declare global {" : "",
				`    export type ${types.typeName} = ${paths
					.map(
						([x], index) =>
							`ElysiaWithBaseUrl<"${
								((prefix?.endsWith("/")
									? prefix.slice(0, -1)
									: prefix) ?? "") + transformToUrl(x) || "/"
							}", typeof Route${index}>`,
					)
					.join("\n              & ")}`,
				!types.useExport ? "}" : "",
			].join("\n")
			if (typeof Bun === "undefined") {
				fs.writeFileSync(outputAbsolutePath, input)
			} else {
				await Bun.write(outputAbsolutePath, input)
			}
		}
	}

	return plugin
}
