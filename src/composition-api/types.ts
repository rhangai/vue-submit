// eslint-disable-next-line import/no-extraneous-dependencies
import { InjectionKey } from "@vue/composition-api";
import {
	SubmitManager,
	SubmitManagerConfirmationCallback,
	SubmitManagerErrorHandler,
	SubmitManagerNotificationCallback,
	SubmitManagerRequestFunction,
} from "../submit-manager";

export const VUE_SUBMIT_KEY: InjectionKey<VueSubmitContext> = "VUE_SUBMIT_KEY" as any;

export type VueSubmitContext = {
	submitManager: SubmitManager;
};

export type VueSubmitHandlerOptions = {
	request: SubmitManagerRequestFunction;
	errorHandler?: SubmitManagerErrorHandler | null;
	confirmationCallback?: SubmitManagerConfirmationCallback | null;
	notificationCallback?: SubmitManagerNotificationCallback | null;
};
