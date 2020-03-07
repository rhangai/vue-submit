export type VueSubmitVuelidateLike = {
	$pending: boolean;
	$invalid: boolean;
	$touch: () => void;
};

export function isVuelidate(input: any): input is VueSubmitVuelidateLike {
	return !!input.$touch;
}
