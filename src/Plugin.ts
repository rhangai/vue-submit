import { SubmitManager } from "./SubmitManager";

export type VueSubmitContext = {
	submitManager: SubmitManager;
};

export type VueSubmitPluginOptions = {};

export const VueSubmit = {
	install(vue: any, pluginOptions: VueSubmitPluginOptions) {
		vue.prototype.$submitContext = {
			submitManager: new SubmitManager(),
		} as VueSubmitContext;
		vue.prototype.$submit = function (key: string, options: any) {
			if (!this.$submitSubmission) {
				const submitManager = this.$submitContext.submitManager as SubmitManager;
				this.$submitSubmission = submitManager.createSubmission({
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
