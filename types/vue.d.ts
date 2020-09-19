import Vue from "vue";
import { VueSubmitOptions } from "../dist/Types";

declare module "vue/types/vue" {
	interface Vue {
		$submit<Data = unknown>(options: VueSubmitOptions<Data>): Promise<void>;
		$submitting: Record<string, boolean>;
		$submitErrors: Record<string, Error>;
	}
}
