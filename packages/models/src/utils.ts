import z, {
	ZodArray,
	ZodDiscriminatedUnion,
	ZodIntersection,
	ZodLazy,
	ZodNullable,
	ZodObject,
	ZodOptional,
	ZodRawShape,
	ZodRecord,
	ZodTuple,
	ZodTupleItems,
	ZodTypeAny,
	ZodUnion,
} from "zod"

export type DeepPartial<T extends ZodTypeAny> =
	T extends ZodObject<ZodRawShape>
		? ZodObject<
				{
					[k in keyof T["shape"]]: ZodOptional<
						DeepPartial<T["shape"][k]>
					>
				},
				T["_def"]["unknownKeys"],
				T["_def"]["catchall"]
			>
		: T extends ZodArray<infer Type, infer Card>
			? ZodArray<DeepPartial<Type>, Card>
			: T extends ZodOptional<infer Type>
				? ZodOptional<DeepPartial<Type>>
				: T extends ZodNullable<infer Type>
					? ZodNullable<DeepPartial<Type>>
					: T extends ZodTuple<infer Items>
						? {
								[k in keyof Items]: Items[k] extends ZodTypeAny
									? DeepPartial<Items[k]>
									: never
							} extends infer PI
							? PI extends ZodTupleItems
								? ZodTuple<PI>
								: never
							: never
						: T

export const deepPartial = <T extends ZodTypeAny>(
	schema: T,
): DeepPartial<T> => {
	if (schema instanceof ZodObject) {
		const shape = schema.shape
		const newShape: Record<string, any> = {}

		for (const key in shape) {
			newShape[key] = deepPartial(shape[key]).optional()
		}

		return z.object(newShape).partial() as any
	} else if (schema instanceof ZodArray) {
		return z.array(deepPartial(schema.element)).optional() as any
	} else if (schema instanceof ZodUnion) {
		return z.union(schema.options.map(deepPartial)).optional() as any
	} else if (schema instanceof ZodIntersection) {
		return z
			.intersection(
				deepPartial(schema._def.left),
				deepPartial(schema._def.right),
			)
			.optional() as any
	} else if (schema instanceof ZodRecord) {
		return z.record(deepPartial(schema.valueSchema)).optional() as any
	} else if (schema instanceof ZodTuple) {
		return z.tuple(schema.items.map(deepPartial) as any).optional() as any
	} else if (schema instanceof ZodLazy) {
		return z.lazy(() => deepPartial(schema._def.getter())).optional() as any
	} else if (schema instanceof ZodDiscriminatedUnion) {
		const options = schema.options.map((option: any) => {
			if (option instanceof ZodObject) {
				const shape = option.shape
				const newShape: Record<string, any> = {}

				for (const key in shape) {
					if (key === schema.discriminator) {
						newShape[key] = shape[key]
					} else {
						newShape[key] = deepPartial(shape[key]).optional()
					}
				}

				return z.object(newShape)
			}
			return deepPartial(option)
		})

		return z.discriminatedUnion(schema.discriminator, options) as any
	} else {
		return schema.optional() as any
	}
}
