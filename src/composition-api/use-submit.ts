// eslint-disable-next-line import/no-extraneous-dependencies
import { inject, ref, computed, markRaw, set } from "@vue/composition-api";
import type { VueSubmitRequestOptions } from "@rhangai/vue-submit/lib/request";
import { VueSubmitOptions } from "../types";
import { VUE_SUBMIT_KEY } from "./types";

/**
 * Use the submit funcition
 * @param options
 */
export function useSubmit<Data = unknown, RequestOptions = VueSubmitRequestOptions>(
	options:
		| VueSubmitOptions<Data, RequestOptions>
		| ((param?: unknown) => VueSubmitOptions<Data, RequestOptions>)
) {
	const context = inject(VUE_SUBMIT_KEY, null);
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

	const submit = (param?: unknown) => {
		return submission.submit(() => {
			return typeof options === "function" ? options(param) : options;
		});
	};

	const submitThrows = async (param?: unknown) => {
		const result = await submission.submit(() => {
			return typeof options === "function" ? options(param) : options;
		});
		if (result.skip) return result;
		if (result.error) throw result.error;
		return result;
	};

	return {
		submit,
		submitThrows,
		submitting: computed(() => submittingMut.value),
		submitError: computed(() => submitErrorMut.value),
	};
}

/**
 * Use the submit funcition when multiples requests are expected, allowing each one have a submission key
 * @param options
 */
export function useSubmitMultiple<Data = unknown, RequestOptions = VueSubmitRequestOptions>(
	options:
		| VueSubmitOptions<Data, RequestOptions>
		| ((param?: unknown) => VueSubmitOptions<Data, RequestOptions>)
) {
	const context = inject(VUE_SUBMIT_KEY, null);
	if (!context) {
		throw new Error(
			`Invalid vue-submit context. Did you call "useSubmitProvider" on a parent element?`
		);
	}
	const { submitManager } = context;

	const submittingMut = ref<Record<string, boolean>>({});
	const submitErrorMut = ref<Record<string, Error | null>>({});

	const submission = submitManager.createSubmission({
		skip({ key }) {
			return !!submittingMut.value[key];
		},
		hooks: {
			beforeSubmit({ key }) {
				set(submittingMut.value, key, true);
				set(submitErrorMut.value, key, null);
			},
			afterSubmit({ key }) {
				set(submittingMut.value, key, false);
			},
			error(error: Error, { key }) {
				set(submittingMut.value, key, false);
				set(submitErrorMut.value, key, markRaw(error));
			},
		},
	});

	const submit = (key: string, param?: unknown) => {
		return submission.submit(
			() => {
				return typeof options === "function" ? options(param) : options;
			},
			{ key }
		);
	};

	return {
		submit,
		submitting: computed(() => submittingMut.value),
		submittingAny: computed(() => {
			return !!Object.values(submittingMut.value).find((v) => v === true);
		}),
		submitError: computed(() => submitErrorMut.value),
		submitErrorAny: computed(() => {
			return Object.values(submitErrorMut.value).find((v) => v != null) ?? null;
		}),
	};
}
