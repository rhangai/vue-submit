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
	/**
	 * Axios instance to use on the current request
	 */
	axios?: AxiosInstance;
	/**
	 * Function to perform the request
	 */
	request?: (options: VueSubmitOptions) => unknown;
	/**
	 * Validators to verify
	 *
	 * - function: Must return true/false or Promise
	 * - vuelidate: Allows vuelidate validators instances
	 * - Array: Array of validators to test
	 */
	validator?: unknown | unknown[];
	/**
	 * Options to show a confirmation dialog to the user.
	 *
	 * Confirmation must be one of the following
	 * - false | null | undefined: Will skip confirmation
	 * - true: Will be converted to { message: null }
	 * - string: Will be converted to { message: string }
	 * - function: Must return a boolean or a Promise<boolean> that indicates wheter or not the user
	 *   confirmed the operation. The function will accept the vue instance and the default confirmation handler
	 */
	confirmation?:
		| VueSubmitConfirmation
		| ((
				vm: Vue,
				defaultConfirmation: (confirmation: VueSubmitConfirmation) => Promise<boolean>
		  ) => boolean | Promise<boolean>);
	/**
	 * Triggers/Expects a download when performing the request.
	 */
	download?: boolean | string | { force?: boolean; filename: string | null };
	/**
	 * Callback on success / Options to notify in case of success
	 *
	 * This functions also returns the notification
	 */
	success?: VueSubmitValueOrCallback<VueSubmitNotification, VueSubmitResult>;
	/**
	 * Callback on error
	 *
	 * This functions also returns the notification
	 */
	error?: VueSubmitValueOrCallback<VueSubmitNotification, VueSubmitResult>;
};

export type VueSubmitResultResponse = { data: any };
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
