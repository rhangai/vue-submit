// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-unused-vars
import Vue from "vue";
import type { VueSubmitOptions } from "../dist/Types";

declare module "vue/types/vue" {
	interface Vue {
		$submit<Data = unknown>(options: VueSubmitOptions<Data>): Promise<void>;
		$submitting: Record<string, boolean>;
		$submitErrors: Record<string, Error>;
	}
}
