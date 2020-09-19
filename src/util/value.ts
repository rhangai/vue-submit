export type ValueOrCallback<Result, Param> =
	| Result
	| Promise<Result>
	| ((param: Param) => Result | Promise<Result>);

export async function valueOrCallback<Result, Param>(
	value: ValueOrCallback<Result, Param>,
	param: Param
): Promise<Result> {
	if (typeof value === "function") {
		return (value as any)(param);
	}
	return value;
}
