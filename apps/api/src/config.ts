import env from "env-var"

export const config = {
	NODE_ENV: env
		.get("NODE_ENV")
		.default("development")
		.asEnum(["production", "test", "development"]),
	PORT: env.get("PORT").default(3000).asPortNumber(),
	MONGO_URI: env.get("MONGO_URI").asUrlString(),
	FTC_API_ENDPOINT: env.get("FTC_API_ENDPOINT").asUrlString(),
	FTC_API_KEY: env.get("FTC_API_KEY").asString(),
	PERMIT_DPD_URI: env.get("PERMIT_DPD_URI").asUrlString(),
	PERMIT_TOKEN: env.get("PERMIT_TOKEN").asString(),
	IMAGES_ENDPOINT: env.get("IMAGES_ENDPOINT").asUrlString(),
}
