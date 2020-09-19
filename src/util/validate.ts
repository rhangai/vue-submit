export type VueSubmitValidateLike = { validate(): boolean };
export type VueSubmitVuelidateLike = { $touch(): boolean; $invalid: boolean };

export function isValidateLike(v: unknown): v is VueSubmitValidateLike {
	if (!v || typeof v !== "object") return false;
	return typeof (v as any).validate === "function";
}

export function isVuelidateLike(v: unknown): v is VueSubmitVuelidateLike {
	if (!v || typeof v !== "object") return false;
	return typeof (v as any).$touch === "function";
}
