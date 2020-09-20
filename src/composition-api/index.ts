/// <reference path="../../types/request.d.ts" />
// eslint-disable-next-line import/no-extraneous-dependencies
import { inject, ref, computed, provide, markRaw } from "@vue/composition-api";
import type { VueSubmitRequestOptions } from "@rhangai/vue-submit/types/request";
import { SubmitManager } from "../SubmitManager";
import { VueSubmitOptions } from "../Types";

const VUE_SUBMIT_KEY = "VUE_SUBMIT_KEY";

export type VueSubmitContext = {
	submitManager: SubmitManager;
};

export type VueSubmitProviderOptions = {
	request(options: any): any;
};

export function useSubmitProviderRaw() {
	const submitManager = new SubmitManager();
	provide<VueSubmitContext>(VUE_SUBMIT_KEY, { submitManager });
	return {
		submitManager,
	};
}

export function useSubmitProvider(options: VueSubmitProviderOptions) {
	const { submitManager } = useSubmitProviderRaw();

	const submitConfirmationsMut = ref<unknown[]>([]);
	const submitNotificationsMut = ref<unknown[]>([]);

	submitManager.setRequestFunction(options.request);

	let notificationId = 1;
	submitManager.setNotificationCallback((notification, result) => {
		return new Promise((resolve) => {
			// eslint-disable-next-line no-plusplus
			const thisNotificationId = notificationId++;
			const close = () => {
				const items: any[] = submitNotificationsMut.value;
				const newItems = items.filter((i) => i.id !== thisNotificationId);
				submitNotificationsMut.value = newItems;
				resolve();
			};
			const item = markRaw({ id: thisNotificationId, notification, result, close });
			submitNotificationsMut.value.push(item);
		});
	});

	let confirmationId = 1;
	submitManager.setConfirmationCallback((confirmation) => {
		return new Promise((resolve) => {
			// eslint-disable-next-line no-plusplus
			const thisConfirmationId = confirmationId++;

			const clearItem = () => {
				const items: any[] = submitConfirmationsMut.value;
				const newItems = items.filter((i) => i.id !== thisConfirmationId);
				submitConfirmationsMut.value = newItems;
			};
			const confirm = () => {
				clearItem();
				resolve(true);
			};
			const cancel = () => {
				clearItem();
				resolve(false);
			};
			const item = markRaw({ confirmation, confirm, cancel });
			submitConfirmationsMut.value.push(item);
		});
	});

	return {
		submitConfirmations: computed(() => submitConfirmationsMut.value),
		submitNotifications: computed(() => submitNotificationsMut.value),
	};
}

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
