// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-unused-vars
import Vue from "vue";
import type { VueSubmitOptions } from "../types";

interface VueSubmitProperties {
	/**
	 * @deprecated Use the new composition-api
	 */
	$submit<Data = unknown>(key: string, options: VueSubmitOptions<Data>): Promise<void>;
	$submitting: Record<string, boolean>;
	$submitErrors: Record<string, Error>;
}

declare module "vue/types/vue" {
	interface Vue extends VueSubmitProperties {}
}