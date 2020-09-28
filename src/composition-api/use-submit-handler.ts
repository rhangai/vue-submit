// eslint-disable-next-line import/no-extraneous-dependencies
import { ref, computed, provide, markRaw, nextTick, reactive } from "@vue/composition-api";
import { VueSubmitConfirmationItem, VueSubmitNotificationItem } from "../component";
import { SubmitManager } from "../submit-manager";
import { VueSubmitContext, VueSubmitHandlerOptions, VUE_SUBMIT_KEY } from "./types";

/**
 * Create a new submit handler using the context
 * @param options
 */
export function useSubmitHandlerRaw(options?: Partial<VueSubmitHandlerOptions> | null) {
	const submitManager = new SubmitManager();
	provide<VueSubmitContext>(VUE_SUBMIT_KEY, { submitManager });
	if (options) {
		submitManager.setRequestFunction(options.request ?? null);
		submitManager.setNotificationCallback(options.notificationCallback ?? null);
		submitManager.setConfirmationCallback(options.confirmationCallback ?? null);
	}
	return {
		submitManager,
	};
}

/**
 * Create a new submit handler using the context
 * @param options
 */
export function useSubmitHandler(options: VueSubmitHandlerOptions) {
	const { submitManager } = useSubmitHandlerRaw();

	const submitConfirmationsMut = ref<VueSubmitConfirmationItem[]>([]);
	const submitNotificationsMut = ref<VueSubmitNotificationItem[]>([]);

	submitManager.setRequestFunction(options.request);

	if (options.notificationCallback) {
		submitManager.setNotificationCallback(options.notificationCallback);
	} else {
		let notificationId = 1;
		submitManager.setNotificationCallback((notification, result) => {
			let item: VueSubmitNotificationItem;
			let isClosed = false;
			// eslint-disable-next-line no-plusplus
			const thisNotificationId = notificationId++;
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
				item.active = false;
			};
			item = reactive({
				id: thisNotificationId,
				active: false,
				notification: markRaw(notification),
				result: markRaw(result),
				error: result.error ? markRaw(result.error) : null,
				close,
			});
			submitNotificationsMut.value.push(item);
			nextTick(() => {
				item.active = true;
			});
		});
	}

	if (options.confirmationCallback) {
		submitManager.setConfirmationCallback(options.confirmationCallback);
	} else {
		let confirmationId = 1;
		submitManager.setConfirmationCallback((confirmation) => {
			return new Promise((resolve) => {
				let item: VueSubmitConfirmationItem;
				// eslint-disable-next-line no-plusplus
				const thisConfirmationId = confirmationId++;

				const clearItem = () => {
					const items: any[] = submitConfirmationsMut.value;
					const newItems = items.filter((i) => i.id !== thisConfirmationId);
					submitConfirmationsMut.value = newItems;
				};

				const resolveConfirmation = (status: boolean, delay?: number | null) => {
					resolve(!!status);
					if (!delay) {
						clearItem();
						return;
					}
					setTimeout(clearItem, delay);
					item.active = false;
				};
				const confirm = (delay?: number | null) => {
					resolveConfirmation(true, delay);
				};
				const cancel = (delay?: number | null) => {
					resolveConfirmation(false, delay);
				};
				item = reactive({
					id: thisConfirmationId,
					active: false,
					confirmation: markRaw(confirmation),
					resolve: resolveConfirmation,
					confirm,
					cancel,
				});
				submitConfirmationsMut.value.push(item);
				nextTick(() => {
					item.active = true;
				});
			});
		});
	}

	return {
		submitConfirmations: computed(() => submitConfirmationsMut.value),
		submitNotifications: computed(() => submitNotificationsMut.value),
	};
}
