// eslint-disable-next-line import/no-extraneous-dependencies
import { ref, computed, provide, markRaw, nextTick } from "@vue/composition-api";
import { SubmitManager } from "../submit-manager";
import { VueSubmitContext, VueSubmitProviderOptions, VUE_SUBMIT_KEY } from "./types";

export function useSubmitHandlerRaw() {
	const submitManager = new SubmitManager();
	provide<VueSubmitContext>(VUE_SUBMIT_KEY, { submitManager });
	return {
		submitManager,
	};
}

/**
 * Create a new submit handler using the context
 * @param options
 */
export function useSubmitHandler(options: VueSubmitProviderOptions) {
	const { submitManager } = useSubmitHandlerRaw();

	const submitConfirmationsMut = ref<unknown[]>([]);
	const submitNotificationsMut = ref<unknown[]>([]);

	submitManager.setRequestFunction(options.request);

	let notificationId = 1;
	submitManager.setNotificationCallback((notification, result) => {
		let isClosed = false;
		// eslint-disable-next-line no-plusplus
		const thisNotificationId = notificationId++;

		const active = ref(false);

		const removeNotification = () => {
			const items: any[] = submitNotificationsMut.value;
			const newItems = items.filter((i) => i.id !== thisNotificationId);
			submitNotificationsMut.value = newItems;
		};

		const close = (delay?: number | null) => {
			if (isClosed) return;
			isClosed = true;
			if (!delay) {
				removeNotification();
				return;
			}
			setTimeout(removeNotification, delay);
			active.value = false;
		};
		const item = markRaw({
			id: thisNotificationId,
			active,
			notification,
			result,
			close,
		});
		submitNotificationsMut.value.push(item);
		nextTick(() => {
			active.value = true;
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
