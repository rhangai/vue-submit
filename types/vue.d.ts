import Vue from "vue";
import { VueSubmitFunction } from "./vue-submit";

declare module "vue/types/vue" {
	interface Vue {
		$submit?: VueSubmitFunction;
		$submitting: Record<string, boolean>;
		$submitErrors: Record<string, Error>;
	}
}
