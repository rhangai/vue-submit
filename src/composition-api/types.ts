import { SubmitManager, SubmitManagerRequestFunction } from "../SubmitManager";

export const VUE_SUBMIT_KEY = "VUE_SUBMIT_KEY";

export type VueSubmitContext = {
	submitManager: SubmitManager;
};

export type VueSubmitProviderOptions = {
	request: SubmitManagerRequestFunction;
};
