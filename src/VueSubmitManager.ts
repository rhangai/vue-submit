import Vue, { VueConstructor } from "vue";
import {
	VueSubmitOptions,
	VueSubmitResult,
	VueSubmitPluginOptions,
} from "../types/vue-submit";
import { VueSubmitSubmission } from "./VueSubmitSubmission";

export class VueSubmitManager {
	/// Map of pending submission
	private readonly submissions: Record<string, VueSubmitSubmission | null> = {};

	constructor(
		//
		private readonly vue: VueConstructor,
		private readonly vm: Vue,
		private readonly pluginOptions: VueSubmitPluginOptions
	) {
		this.vm.$on("hook:beforeDestroy", () => {
			this.destroy();
		});
	}

	/**
	 *
	 */
	destroy() {
		for (const key in this.submissions) {
			this.submissions[key]?.destroy();
		}
	}

	/**
	 *
	 * @param key
	 * @param options
	 */
	async submit(key: string, options: VueSubmitOptions): Promise<void> {
		if (this.vm.$data.$submitting[key]) {
			throw new Error(`Already submitting`);
		}

		const submission = new VueSubmitSubmission(
			this.vue,
			this.vm,
			this.pluginOptions,
			key,
			options
		);
		this.submissions[key] = submission;
		try {
			this.vm.$set(this.vm.$submitErrors, key, null);
			this.vm.$set(this.vm.$submitting, key, true);
			options.hookBeforeSubmit?.();
			return await submission.submit();
		} catch (error) {
			this.vm.$set(this.vm.$submitErrors, key, error);
			options.hookErrorSubmit?.(error);
			throw error;
		} finally {
			this.submissions[key] = null;
			this.vm.$set(this.vm.$submitting, key, false);
			options.hookAfterSubmit?.();
		}
	}
}
