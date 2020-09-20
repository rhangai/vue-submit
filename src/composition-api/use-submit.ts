// eslint-disable-next-line import/no-extraneous-dependencies
import { inject, ref, computed, markRaw } from "@vue/composition-api";
import type { VueSubmitRequestOptions } from "@rhangai/vue-submit/types/request";
import { VueSubmitOptions } from "../Types";
import { VueSubmitContext, VUE_SUBMIT_KEY } from "./types";

/**
 * Use the submit funcition
 * @param options
 */
export function useSubmit<Data = unknown, RequestOptions = VueSubmitRequestOptions>(
	options: VueSubmitOptions<Data, RequestOptions>
) {
	const context = inject<VueSubmitContext | null>(VUE_SUBMIT_KEY, null);
	if (!context) {
		throw new Error(
			`Invalid vue-submit context. Did you call "useSubmitProvider" on a parent element?`
		);
	}
	const { submitManager } = context;

	const submittingMut = ref(false);
	const submitErrorMut = ref<Error | null>(null);

	const submission = submitManager.createSubmission({
		skip() {
			return submittingMut.value;
		},
		hooks: {
			beforeSubmit() {
				submittingMut.value = true;
				submitErrorMut.value = null;
			},
			afterSubmit() {
				submittingMut.value = false;
			},
			error(error: Error) {
				submittingMut.value = false;
				submitErrorMut.value = markRaw(error);
			},
		},
	});

	const submit = () => {
		return submission.submit(options);
	};

	return {
		submit,
		submitting: computed(() => submittingMut.value),
		submitError: computed(() => submitErrorMut.value),
	};
}
