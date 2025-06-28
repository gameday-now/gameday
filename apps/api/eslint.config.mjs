import antfu from "@antfu/eslint-config"

export default antfu({
	files: ["**/*.js", "**/*.ts"],
	rules: {
		"node/prefer-global/process": "off",
		"no-console": "off",
		"antfu/no-top-level-await": "off",
	},
})
