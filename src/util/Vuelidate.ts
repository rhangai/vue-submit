type VuelidateLike = {
	$pending: boolean;
	$invalid: boolean;
	$touch: () => void;
};

export function isVuelidate(input: any): input is VuelidateLike {
	return !!input.$touch;
}
