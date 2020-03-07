import { AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios";

export type VueSubmitPluginOptions = {
	axios?: AxiosInstance;
	notify?: (error: Error | null, result: VueSubmitResult | null) => void | Promise<void>;
};

export type VueSubmitErrorOptions = {
	error: Error;
	isValidatorError: boolean;
};

export type VueSubmitOptions = AxiosRequestConfig & {
	axios?: AxiosInstance;
	validator?: unknown | unknown[];
	onError?: (options: VueSubmitErrorOptions) => unknown | Promise<unknown>;
	onSuccess?: (result: VueSubmitResult) => unknown | Promise<unknown>;
};

export type VueSubmitResult = AxiosResponse & {};

export type VueSubmitSerializeFormDataInput =
	| string
	| File
	| number
	| undefined
	| { [key: string]: VueSubmitSerializeFormDataInput }
	| Array<VueSubmitSerializeFormDataInput>;

export type VueSubmitCallback = {
	(name: string, options: VueSubmitOptions): Promise<VueSubmitResult | null>;
	serializeFormData(input: Record<string, VueSubmitSerializeFormDataInput>): FormData;
};
