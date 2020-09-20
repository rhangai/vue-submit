import type { VueConstructor } from "vue";
import {
	SubmitManager,
	SubmitManagerConfirmationCallback,
	SubmitManagerNotificationCallback,
} from "./SubmitManager";

export type VueSubmitPluginOptions = {
	request(options: any): any;
	confirmationCallback?: SubmitManagerConfirmationCallback | null;
	notificationCallback?: SubmitManagerNotificationCallback | null;
};

export const VueSubmitPlugin = {
	/**
	 * Install the plugin
	 *
	 * It sets $submit, $submitting and $submitErrors to be used globally
	 */
	install(vue: VueConstructor, pluginOptions: VueSubmitPluginOptions) {
		const submitManager = new SubmitManager();
		submitManager.setRequestFunction(pluginOptions.request);
		submitManager.setConfirmationCallback(pluginOptions.confirmationCallback ?? null);
		submitManager.setNotificationCallback(pluginOptions.notificationCallback ?? null);

		// eslint-disable-next-line no-param-reassign
		vue.prototype.$submitManager = submitManager;

		// eslint-disable-next-line no-param-reassign
		vue.prototype.$submit = function vueSubmit(key: string, options: any) {
			if (!this.$submitSubmission) {
				let component = this;
				let thisSubmitManager: SubmitManager | null = null;
				while (component) {
					thisSubmitManager = component.$data.$submitManager;
					if (thisSubmitManager) break;
					component = component.$parent;
				}
				if (!thisSubmitManager) thisSubmitManager = submitManager;
				this.$submitSubmission = thisSubmitManager.createSubmission({
					skip: ({ key: submitKey }) => {
						return this.$data.$submitting[submitKey];
					},
					hooks: {
						beforeSubmit: ({ key: submitKey }) => {
							vue.set(this.$data.$submitting, submitKey, true);
							vue.set(this.$data.$submitErrors, submitKey, null);
						},
						afterSubmit: ({ key: submitKey }) => {
							vue.set(this.$data.$submitting, submitKey, false);
						},
						error: (error: Error, { key: submitKey }) => {
							vue.set(this.$data.$submitting, submitKey, false);
							vue.set(this.$data.$submitErrors, submitKey, error);
						},
					},
				});
			}
			return this.$submitSubmission.submit(options, { key });
		};

		vue.mixin({
			data() {
				return {
					$submitting: {},
					$submitErrors: {},
				};
			},
		});
		Object.defineProperty(vue.prototype, "$submitting", {
			get() {
				return this.$data.$submitting;
			},
		});
		Object.defineProperty(vue.prototype, "$submitErrors", {
			get() {
				return this.$data.$submitErrors;
			},
		});
	},
};
