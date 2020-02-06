import { SubmitManager } from "../SubmitManager";
import { AxiosDownload } from "../util/Download";

export function createDefaultsVanilla(submitManager: SubmitManager) {
	return {
		request(vm, options) {
			if (typeof options.data === "function") {
				const data = options.data.call(vm, vm, { ...options });
				options = { ...options, data };
			}
			const axios = options.axios || vm.$axios;
			return options.download ? AxiosDownload(axios, options) : axios(options);
		}
	};
}
