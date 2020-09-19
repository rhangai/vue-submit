import { SubmitManager } from "./SubmitManager";
import { VueSubmitConfirmation, VueSubmitNotification } from "./Types";

export type VueSubmitContext = {
	submitManager: SubmitManager;
};

export type VueSubmitPluginOptions = {
	notify(notification: VueSubmitNotification): Promise<void>;
	confirm(confirmation: VueSubmitConfirmation): Promise<boolean>;
};

export const VueSubmitPlugin = {
	install(vue: any, pluginOptions: VueSubmitPluginOptions) {
		/* eslint-disable no-param-reassign */
		vue.prototype.$submitContext = {
			submitManager: new SubmitManager({
				notify: pluginOptions.notify,
				confirm: pluginOptions.confirm,
			}),
		} as VueSubmitContext;
		vue.prototype.$submit = function vueSubmit(key: string, options: any) {
			if (!this.$submitSubmission) {
				const submitManager = this.$submitContext.submitManager as SubmitManager;
				this.$submitSubmission = submitManager.createSubmission({
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
