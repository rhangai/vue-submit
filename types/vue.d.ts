import Vue from "vue";
import { VueSubmitCallback } from "./vue-submit";

declare module "vue/types/vue" {
	interface Vue {
		$submit?: VueSubmitCallback;
	}
}
