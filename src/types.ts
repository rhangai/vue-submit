/// <reference path="./request.ts" />
// eslint-disable-next-line import/no-extraneous-dependencies
import type { VueSubmitRequestOptions } from "@rhangai/vue-submit/lib/request";
import { ValueOrCallback } from "./util/value";

export type VueSubmitDownloadOptions = {
	force?: boolean;
	filename: string | null;
};

export type VueSubmitNotification = {
	message?: string | null;
	[key: string]: any;
};

export type VueSubmitNotificationValue =
	| undefined
	| null
	| boolean
	| string
	| VueSubmitNotification;

/**
 * Confirmation type
 */
export type VueSubmitConfirmation = {
	message?: string | null;
	[key: string]: any;
};

export type VueSubmitConfirmationCallbackParams = {
	defaultConfirmation: (confirmation: VueSubmitConfirmationValue) => Promise<boolean>;
};
export type VueSubmitConfirmationCallback = (
	params: VueSubmitConfirmationCallbackParams
) => boolean | Promise<boolean>;

export type VueSubmitConfirmationValue =
	| undefined
	| null
	| boolean
	| string
	| VueSubmitConfirmation;

/**
 * Submit result
 */
export type VueSubmitResult = {
	data: unknown;
	error: Error | null;
	response: unknown;
};

/**
 * Submit result
 */
type VueSubmitValidateLike = { validate(): boolean | Promise<boolean> };
type VueSubmitVuelidateLike = { $touch(): boolean; $invalid: boolean };
export type VueSubmitValidateItem =
	| boolean
	| Promise<boolean>
	| VueSubmitValidateLike
	| VueSubmitVuelidateLike;

/**
 * Callback parameters
 */
export type VueSubmitOptionsDataCallbackParams = {
	serializeFormData(obj: any): FormData;
};

export type VueSubmitOptions<Data = unknown, RequestOptions = VueSubmitRequestOptions> = Omit<
	RequestOptions,
	"data" | "validate" | "confirmation" | "onSuccess" | "onError"
> & {
	/**
	 * The data to use on submission
	 */
	data?: ValueOrCallback<Data, VueSubmitOptionsDataCallbackParams>;
	/**
	 * Validators to verify
	 *
	 * - function: Must return true/false or Promise
	 * - vuelidate: Allows vuelidate validators instances
	 * - Array: Array of validators to test
	 */
	validate?:
		| ValueOrCallback<VueSubmitValidateItem, undefined>
		| ValueOrCallback<VueSubmitValidateItem, undefined>[];
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
	confirmation?: VueSubmitConfirmationValue | VueSubmitConfirmationCallback;
	/**
	 * Callback on success / Options to notify in case of success
	 *
	 * This functions also returns the notification
	 */
	onSuccess?: ValueOrCallback<VueSubmitNotificationValue, VueSubmitResult>;
	/**
	 * Callback on error
	 *
	 * This functions also returns the notification
	 */
	onError?: ValueOrCallback<VueSubmitNotificationValue, VueSubmitResult>;
};
