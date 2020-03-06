import Vue, { VueConstructor } from "vue";
import { isVuelidate } from "./util/Vuelidate";

export type VueSubmitOptions = {
	validator: unknown | unknown[];
};

export class VueSubmitManager {
	public readonly submitting: { [key: string]: boolean };
	public readonly submitErrors: { [key: string]: Error };

	constructor(
		//
		private readonly vue: VueConstructor,
		private readonly vm: Vue
	) {
		this.submitting = vue.observable({});
		this.submitErrors = vue.observable({});
	}

	async submit(name: string, options: VueSubmitOptions) {
		if (this.submitting[name]) {
			throw new Error(`Already submitting`);
		}
		try {
			this.submitting[name] = true;
			const isValid = await this.submitValidate(options.validator);
			if (!isValid) throw new Error(`Invalid`);
		} finally {
			this.submitting[name] = false;
		}
	}

	private async submitValidate(validator: unknown | unknown[]): Promise<boolean> {
		if (validator == null) return true;
		if (Array.isArray(validator)) {
			const isValidMap = await Promise.all(validator.map(v => this.submitValidate(v)));
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
			return this.submitValidate(validatorResult);
		}

		if (isVuelidate(validator)) {
			validator.$touch();
			if (validator.$pending) {
				await new Promise((resolve, reject) => {
					let unwatch = null;
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
}
