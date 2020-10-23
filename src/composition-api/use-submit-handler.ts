// eslint-disable-next-line import/no-extraneous-dependencies
import { provide } from "@vue/composition-api";
import { SubmitManager } from "../submit-manager";
import { VueSubmitContext, VueSubmitHandlerOptions, VUE_SUBMIT_KEY } from "./types";

/**
 * Create a new submit handler using the context
 * @param options
 */
export function useSubmitHandler(options: VueSubmitHandlerOptions) {
	const submitManager = new SubmitManager();
	provide<VueSubmitContext>(VUE_SUBMIT_KEY, { submitManager });
	submitManager.setRequestFunction(options.request);
	submitManager.setErrorHandler(options.errorHandler ?? null);
	submitManager.setNotificationCallback(options.notify ?? null);
	submitManager.setConfirmationCallback(options.confirm ?? null);
	return {
		submitManager,
	};
}
