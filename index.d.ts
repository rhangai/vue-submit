import { VueConstructor } from "vue";
import { VueSubmitPluginOptions } from "./types/vue-submit";

export type VueSubmit = {
	install(vue: VueConstructor, options?: VueSubmitPluginOptions): void;
};
