import Vue, { VueConstructor } from "vue";
import { isVuelidate } from "./util/Vuelidate";
import {
	VueSubmitOptions,
	VueSubmitResult,
	VueSubmitPluginOptions,
	VueSubmitValueOrCallback,
	VueSubmitNotification,
	VueSubmitNotificationOptions,
	VueSubmitResultResponse,
	VueSubmitConfirmation,
	VueSubmitConfirmationOptions
} from "../types/vue-submit";
import { AxiosInstance } from "axios";
import { ValidatorError, ConfirmationAbortError } from "./Error";
import { download } from "./util/Download";

export class VueSubmitSubmission {
	constructor(
		//
		private readonly vue: VueConstructor,
		private readonly vm: Vue,
		private readonly pluginOptions: VueSubmitPluginOptions,
		private readonly key: string,
		private readonly options: VueSubmitOptions
	) {}

	/**
	 * Destroy this submission
	 */
	destroy() {}

	async submit(): Promise<void> {
		let error: Error | null = null;
		let response: VueSubmitResultResponse | null = null;
		try {
			await this.validate();

			// Confirm the submission
			const isConfirmation = await this.confirmation();
			if (!isConfirmation) return;

			// Perform the request
			response = await this.submitRequest();
		} catch (err) {
			error = err;
			// @ts-ignore
			if (error.response) response = error.response;
		}

		// Perform notifications
		const result = await this.submitFinish(error, response);
		if (result.notification) {
			await this.pluginOptions.notify?.(this.vm, result);
		}

		// Check final status
		if (result.error) {
			throw result.error;
		}
	}

	/// Validate the submission
	private async validate() {
		const isValid = await this.validateValidator(this.options.validator);
		if (!isValid) throw new ValidatorError(`Invalid`);
	}

	/**
	 * Validate before every item on the validator
	 * @param validator
	 */
	private async validateValidator(validator: unknown | unknown[]): Promise<boolean> {
		if (validator == null) return true;
		if (Array.isArray(validator)) {
			const isValidMap = await Promise.all(validator.map(v => this.validateValidator(v)));
			return isValidMap.indexOf(false) < 0;
		}
		if (validator === true) {
			return true;
		}
		if (validator === false) {
			return false;
		}

		if (typeof validator === "function") {
			const validatorResult = await validator();
			return this.validateValidator(validatorResult);
		}

		if (isVuelidate(validator)) {
			validator.$touch();
			if (validator.$pending) {
				await new Promise((resolve, reject) => {
					let unwatch: any = null;
					const onDestroy = () => {
						unwatch();
						reject(new Error(`Component destroyed`));
					};
					unwatch = this.vm.$watch(
						() => validator.$pending,
						(isPending: boolean) => {
							if (!isPending) {
								resolve();
								unwatch();
								this.vm.$off("hook:beforeDestroy", onDestroy);
							}
						}
					);
					this.vm.$on("hook:beforeDestroy", onDestroy);
				});
			}
			return !validator.$invalid;
		}
		throw new Error(`Invalid validator`);
	}

	private async confirmation(): Promise<boolean> {
		if (!this.options.confirmation) return true;
		if (typeof this.options.confirmation === "function") {
			return !!(await this.options.confirmation(this.vm, options =>
				this.confirmationHandler(options)
			));
		}
		return this.confirmationHandler(this.options.confirmation);
	}

	private async confirmationHandler(
		confirmation: VueSubmitConfirmation | undefined
	): Promise<boolean> {
		const confirmationNormalized = this.confirmationNormalize(confirmation);
		if (!confirmationNormalized) return true;
		if (!this.pluginOptions.confirmation) return true;
		return !!(await this.pluginOptions.confirmation(this.vm, confirmationNormalized));
	}

	private confirmationNormalize(
		confirmation: VueSubmitConfirmation | undefined
	): VueSubmitConfirmationOptions | false {
		if (confirmation === true) {
			return {};
		} else if (!confirmation) {
			return false;
		} else if (typeof confirmation === "string") {
			return { message: confirmation };
		}
		return confirmation;
	}

	/**
	 * Perform the submission request
	 */
	private async submitRequest(): Promise<VueSubmitResultResponse | null> {
		// Perform a custom request
		if (this.options.request) {
			await this.options.request(this.options);
			return null;
		}

		// Get the axios instance
		const axios: AxiosInstance =
			this.options.axios || this.pluginOptions.axios || (this.vm as any).$axios;
		if (!axios) throw new Error(`Invalid $axios for vue-submit`);

		// Try to download using axios
		if (this.options.download) {
			await download(axios, this.options);
			return null;
		}

		// Perform the request using axios
		return axios.request({
			method: "post",
			...this.options
		});
	}

	private async transform(data: any): Promise<any> {
		return data;
	}

	private async submitFinish(
		error: Error | null,
		response: VueSubmitResultResponse | null
	): Promise<VueSubmitResult> {
		let data: any = response?.data;
		if (!error) {
			try {
				data = await this.transform(data);
			} catch (err) {
				error = err;
			}
		}
		const result: VueSubmitResult = {
			data,
			response,
			error,
			notification: null
		};
		const callback = error ? this.options.error : this.options.success;
		const notification = await this.submitFinishCallback(callback, result);
		return { ...result, notification: this.notificationNormalize(notification) };
	}

	private async submitFinishCallback(
		valueOrCallback: VueSubmitValueOrCallback<VueSubmitNotification, VueSubmitResult>,
		result: VueSubmitResult
	): Promise<VueSubmitNotification> {
		if (typeof valueOrCallback === "function") {
			return valueOrCallback(result);
		}
		return valueOrCallback;
	}

	private notificationNormalize(
		notification: VueSubmitNotification
	): VueSubmitNotificationOptions | null {
		if (notification === false) {
			return null;
		} else if (notification === true || notification == null) {
			return {};
		} else if (typeof notification === "string") {
			return { message: notification };
		}
		return notification;
	}
}
