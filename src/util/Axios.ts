import { AxiosRequestConfig } from "axios";
import { VueSubmitOptions } from "../../types/vue-submit";

export async function getAxiosOptions(
	options: VueSubmitOptions,
	defaults?: Partial<AxiosRequestConfig>
): Promise<AxiosRequestConfig> {
	defaults = defaults || { method: "post" };
	const config: VueSubmitOptions = { ...defaults, ...options };
	delete config.axios;
	delete config.request;
	delete config.validator;
	delete config.confirmation;
	delete config.download;
	delete config.success;
	delete config.error;
	if (typeof config.data === "function") {
		config.data = await config.data();
	}
	return config;
}
