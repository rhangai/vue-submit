export type VueSubmitOptions = {
	validator: unknown | unknown[];
};

export type VueSubmitResult = {};

export type VueSubmitSerializeFormDataInput =
	| string
	| File
	| number
	| undefined
	| { [key: string]: VueSubmitSerializeFormDataInput }
	| Array<VueSubmitSerializeFormDataInput>;

export type VueSubmitCallback = {
	(name: string, options: VueSubmitOptions): Promise<VueSubmitResult>;
	serializeFormData(input: Record<string, VueSubmitSerializeFormDataInput>): FormData;
};
