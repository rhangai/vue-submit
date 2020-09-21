// eslint-disable-next-line import/no-extraneous-dependencies
import { defineComponent } from "@vue/composition-api";
import { SubmitManager } from "../submit-manager";
import { VUE_SUBMIT_KEY, VueSubmitHandlerOptions } from "./types";

export function submitHandlerCompatMixin(options: VueSubmitHandlerOptions) {
	return defineComponent({
		provide() {
			return {
				[VUE_SUBMIT_KEY as any]: {
					submitManager: this.$data.$submitManager,
				},
			};
		},
		data() {
			return {
				submitConfirmationId: 1,
				submitConfirmations: [] as unknown[],
				submitNotificationId: 1,
				submitNotifications: [] as unknown[],
				$submitManager: new SubmitManager(),
			};
		},
		created(this: any) {
			const submitManager = this.$data.$submitManager as SubmitManager;
			submitManager.setRequestFunction(options.request);
			submitManager.setConfirmationCallback((confirmation) =>
				this.onSubmitConfirmation(confirmation)
			);
			submitManager.setNotificationCallback((notification, result) =>
				this.onSubmitNotification(notification, result)
			);
		},
		methods: {
			onSubmitConfirmation(confirmation: any) {
				return new Promise((resolve) => {
					// eslint-disable-next-line no-plusplus
					const thisConfirmationId = this.submitConfirmationId++;

					const clearItem = () => {
						const items: any[] = this.submitConfirmations;
						const newItems = items.filter((i) => i.id !== thisConfirmationId);
						this.submitConfirmations = newItems;
					};
					const confirm = () => {
						clearItem();
						resolve(true);
					};
					const cancel = () => {
						clearItem();
						resolve(false);
					};
					const item = Object.freeze({ confirmation, confirm, cancel });
					this.submitConfirmations.push(item);
				});
			},
			onSubmitNotification(notification: any, result: any) {
				return new Promise((resolve) => {
					// eslint-disable-next-line no-plusplus
					const thisNotificationId = this.submitNotificationId++;
					const close = () => {
						const items: any[] = this.submitNotifications;
						const newItems = items.filter((i) => i.id !== thisNotificationId);
						this.submitNotifications = newItems;
						resolve();
					};
					const item = Object.freeze({ id: thisNotificationId, notification, result, close });
					this.submitNotifications.push(item);
				});
			},
		},
	});
}
