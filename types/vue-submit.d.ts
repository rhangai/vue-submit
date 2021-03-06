import Vue from "vue";
import { AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios";

export type VueSubmitValueOrCallback<T, Arg> =
	| T
	| ((arg: Arg) => T | Promise<T>);

export type VueSubmitPluginOptions = {
	axios?: VueSubmitAxiosLike;
	request?: (context: VueSubmitContext) => unknown;
	notify?: (vm: Vue, result: VueSubmitResult) => void | Promise<void>;
	confirmation?: (
		vm: Vue,
		options: VueSubmitConfirmation
	) => boolean | Promise<boolean>;
};

export type VueSubmitConfirmation = {
	message?: string | null;
	[key: string]: any;
};
export type VueSubmitConfirmationResult =
	| boolean
	| null
	| undefined
	| string
	| VueSubmitConfirmation;

export type VueSubmitNotification = {
	message?: string | null;
	[key: string]: any;
};
export type VueSubmitNotificationResult =
	| null
	| undefined
	| boolean
	| string
	| VueSubmitNotification;

export type VueSubmitContext = {
	vm: Vue;
	options: VueSubmitOptions;
};

export type VueSubmitAxiosLike = (
	config: AxiosRequestConfig
) => VueSubmitResultResponse | Promise<VueSubmitResultResponse>;

export type VueSubmitOptions<Data = unknown> = Omit<
	AxiosRequestConfig,
	"data"
> & {
	/**
	 * Axios instance to use on the current request
	 */
	axios?: VueSubmitAxiosLike;
	/**
	 * The data to use on submission
	 */
	data?: Data | (() => Data | Promise<Data>);
	/**
	 * Function to perform the request
	 */
	request?: (context: VueSubmitContext) => unknown;
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
		| VueSubmitConfirmationResult
		| ((
				vm: Vue,
				defaultConfirmation: (
					confirmation: VueSubmitConfirmationResult
				) => Promise<boolean>
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
	success?: VueSubmitValueOrCallback<
		VueSubmitNotificationResult,
		VueSubmitResult
	>;
	/**
	 * Callback on error
	 *
	 * This functions also returns the notification
	 */
	error?: VueSubmitValueOrCallback<
		VueSubmitNotificationResult,
		VueSubmitResult
	>;
	/**
	 * Hooks
	 */
	hookBeforeSubmit?: () => void;
	hookAfterSubmit?: () => void;
	hookErrorSubmit?: (error: Error) => void;
};

export type VueSubmitResultResponse = { data: any };
export type VueSubmitResult = {
	data: any;
	response: VueSubmitResultResponse | null;
	error: Error | null;
	notification: VueSubmitNotification | null;
};

type VueSubmitSerializeFormDataInputPrimitive =
	| string
	| File
	| number
	| null
	| undefined;

export type VueSubmitSerializeFormDataInput =
	| VueSubmitSerializeFormDataInputPrimitive
	| { [key: string]: VueSubmitSerializeFormDataInput }
	| Array<VueSubmitSerializeFormDataInputPrimitive>;

/**
 * The vue submit function
 */
export type VueSubmitFunction = {
	<Data = unknown>(name: string, options: VueSubmitOptions<Data>): Promise<
		void
	>;
	/**
	 * Serialize the form data
	 * @param input
	 */
	serializeFormData(
		input: Record<string, VueSubmitSerializeFormDataInput>
	): FormData;
};
