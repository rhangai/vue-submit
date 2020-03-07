import Vue, { VueConstructor } from "vue";
import { isVuelidate } from "./util/Vuelidate";
import { VueSubmitOptions, VueSubmitResult, VueSubmitPluginOptions } from "../types/vue-submit";
import { AxiosInstance } from "axios";
import { ValidatorError } from "./Error";

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

	async submit(): Promise<VueSubmitResult | null> {
		let error: Error | null = null;
		let result: VueSubmitResult | null = null;
		try {
			await this.validate();

			// Confirm the submission
			const isConfirmationSuccess = await this.confirmation();
			if (!isConfirmationSuccess) return null;

			// Perform the request
			result = await this.submitRequest();
		} catch (err) {
			error = err;
		}

		// Perform notifications
		await this.pluginOptions.notify?.(error, result);
		await this.submitFinish(error, result);

		// Check final status
		if (error) {
			throw error;
		}
		return result;
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
		return true;
	}

	/**
	 *
	 */
	private async submitRequest(): Promise<VueSubmitResult> {
		// @ts-ignore
		const axios: AxiosInstance = this.options.axios || this.pluginOptions.axios || this.$axios;
		if (!axios) throw new Error(`Invalid $axios for vue-submit`);
		const result = axios.request(this.options);
		return {
			...result
		};
	}

	private async submitFinish(error: Error | null, result: VueSubmitResult | null) {
		if (error) {
			const isValidatorError = error instanceof ValidatorError;
			const notifyOptions = await this.options.onError?.({ error, isValidatorError });
			return { error, notifyOptions, status: "error" };
		} else {
			const notifyOptions = await this.options.onSuccess?.(result!);
			return { notifyOptions, status: "success" };
		}
	}
}
