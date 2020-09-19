// eslint-disable-next-line import/no-extraneous-dependencies
import { inject, ref, computed, provide, markRaw } from "@vue/composition-api";
import { SubmitManager } from "src/SubmitManager";

const VUE_SUBMIT_KEY = "VUE_SUBMIT_KEY";

export type VueSubmitContext = {
	submitManager: SubmitManager;
};

export function useSubmitProviderRaw() {
	const submitManager = new SubmitManager();
	provide<VueSubmitContext>(VUE_SUBMIT_KEY, { submitManager });
	return {
		submitManager,
	};
}

export function useSubmitProvider() {
	const { submitManager } = useSubmitProviderRaw();

	const submitConfirmationsMut = ref<unknown[]>([]);
	const submitNotificationsMut = ref<unknown[]>([]);

	submitManager.setNotificationCallback((notification, result) => {
		return new Promise((resolve) => {
			let item: any;
			const close = () => {
				const newItems = submitNotificationsMut.value.filter((i) => i !== item);
				submitNotificationsMut.value = newItems;
				resolve();
			};
			item = markRaw({ notification, result, close });
			submitNotificationsMut.value.push(item);
		});
	});

	submitManager.setConfirmationCallback((confirmation) => {
		return new Promise((resolve) => {
			let item: any;
			const clearItem = () => {
				const newItems = submitConfirmationsMut.value.filter((i) => i !== item);
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
			item = markRaw({ confirmation, confirm, cancel });
			submitConfirmationsMut.value.push(item);
		});
	});

	return {
		submitConfirmations: computed(() => submitConfirmationsMut.value),
		submitNotifications: computed(() => submitNotificationsMut.value),
	};
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
