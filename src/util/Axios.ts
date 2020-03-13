import { AxiosRequestConfig } from "axios";

export function getAxiosOptions(
	options: any,
	defaults?: any
): AxiosRequestConfig {
	defaults = defaults || { method: "post" };
	const config = { ...defaults, ...options };
	delete config.axios;
	delete config.request;
	delete config.validator;
	delete config.confirmation;
	delete config.download;
	delete config.success;
	delete config.error;
	return config;
}
