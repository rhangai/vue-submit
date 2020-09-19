// eslint-disable-next-line import/no-extraneous-dependencies
import { inject, ref, computed, provide } from "@vue/composition-api";
import {
	VueSubmitPlugin as ParentVueSubmitPlugin,
	VueSubmitContext,
	VueSubmitPluginOptions,
} from "../Plugin";

const VUE_SUBMIT_KEY = "VUE_SUBMIT_KEY";

export const VueSubmitPlugin = {
	install(vue: any, options: VueSubmitPluginOptions) {
		ParentVueSubmitPlugin.install(vue, options);
	},
};

export function provideSubmit(vue: any) {
	provide(VUE_SUBMIT_KEY, vue.$submitContext);
}

export function useSubmit(options: any) {
	const context = inject<VueSubmitContext | null>(VUE_SUBMIT_KEY, null);
	if (!context) {
		throw new Error(
			`Invalid vue-submit context. Did you call "provideSubmit" on a parent element?`
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
				submitErrorMut.value = error;
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
