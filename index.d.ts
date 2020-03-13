import { VueConstructor } from "vue";
import { VueSubmitPluginOptions } from "./types/vue-submit";
import "./types/vue";

export { VueSubmitPluginOptions };

export type VueSubmitPlugin = {
	/**
	 *
	 * @param vue
	 * @param options
	 */
	install(vue: VueConstructor, options?: VueSubmitPluginOptions): void;
};

export const VueSubmit: VueSubmitPlugin;
