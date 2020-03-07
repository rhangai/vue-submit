import Vue from "vue";
import { AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios";

export type VueSubmitValueOrCallback<T, Arg> = T | ((arg: Arg) => T | Promise<T>);

export type VueSubmitPluginOptions = {
	axios?: AxiosInstance;
	notify?: (vm: Vue, result: VueSubmitResult) => void | Promise<void>;
	confirmation?: (vm: Vue, options: VueSubmitConfirmationOptions) => Promise<boolean>;
};

export type VueSubmitConfirmationOptions = {
	message?: string | null;
	[key: string]: any;
};
export type VueSubmitConfirmation =
	| boolean
	| null
	| undefined
	| string
	| VueSubmitConfirmationOptions;

export type VueSubmitNotificationOptions = {
	message?: string | null;
	[key: string]: any;
};
export type VueSubmitNotification =
	| null
	| undefined
	| boolean
	| string
	| VueSubmitNotificationOptions;

export type VueSubmitOptions = AxiosRequestConfig & {
	axios?: AxiosInstance;
	validator?: unknown | unknown[];
	confirmation?: VueSubmitConfirmation | (() => boolean | Promise<boolean>);
	error?: VueSubmitValueOrCallback<VueSubmitNotification, VueSubmitResult>;
	success?: VueSubmitValueOrCallback<VueSubmitNotification, VueSubmitResult>;
};

export type VueSubmitResultResponse = AxiosResponse;

export type VueSubmitResult = {
	data: any;
	response: VueSubmitResultResponse | null;
	error: Error | null;
	notification: VueSubmitNotificationOptions | null;
};

export type VueSubmitSerializeFormDataInput =
	| string
	| File
	| number
	| undefined
	| { [key: string]: VueSubmitSerializeFormDataInput }
	| Array<VueSubmitSerializeFormDataInput>;

export type VueSubmitFunction = {
	(name: string, options: VueSubmitOptions): Promise<void>;
	serializeFormData(input: Record<string, VueSubmitSerializeFormDataInput>): FormData;
};
