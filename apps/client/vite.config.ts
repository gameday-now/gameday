import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { join } from "path"
import { fileURLToPath } from "url"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import svgr from "vite-plugin-svgr"
import manifest from "./manifest"

export default defineConfig({
	plugins: [
		VitePWA({
			devOptions: {
				enabled: true,
				resolveTempFolder: () => join(__dirname, ".pwa"),
			},
			workbox: {
				disableDevLogs: true,
			},
			manifest,
		}),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
			routesDirectory: "src/routes",
			generatedRouteTree: "src/routeTree.gen.ts",
			disableLogging: true,
		}),
		svgr(),
		react(),
	],
	server: {
		port: 3000,
		strictPort: true,
		proxy: {
			"^/api/.*": {
				target: "ws://localhost:3002",
				changeOrigin: true,
				secure: false,
				ws: true,
			},
		},
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	publicDir: join(__dirname, "public"),
	build: {
		outDir: join(__dirname, "..", "api", "public"),
	},
})
