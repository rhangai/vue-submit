import { VueConstructor } from "vue";
import { VueSubmitPluginOptions } from "./types/vue-submit";

export type VueSubmitPlugin = {
	install(vue: VueConstructor, options?: VueSubmitPluginOptions): void;
};

export const VueSubmit: VueSubmitPlugin;
