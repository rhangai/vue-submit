import type { SubmitManager } from "./SubmitManager";
import { VueSubmitOptions, VueSubmitResult, VueSubmitValidateItem } from "./Types";
import { isValidateLike, isVuelidateLike } from "./util/validate";
import { valueOrCallback, ValueOrCallback } from "./util/value";

export type SubmissionOptions = {
	skip(context: any): boolean;
	hooks: {
		beforeSubmit(context: any): void;
		afterSubmit(context: any): void;
		error(error: Error, context: any): void;
	};
};

export class Submission {
	constructor(
		private readonly submitManager: SubmitManager,
		private readonly options: SubmissionOptions
	) {}

	async submit<Data = unknown>(requestOptions: VueSubmitOptions<Data>, context?: any) {
		const isSkip = this.options.skip(context);
		if (isSkip) return;
		try {
			this.options.hooks.beforeSubmit(context);
			const result = await this.doSubmit(requestOptions);
			this.options.hooks.afterSubmit(context);
			if (result) {
				await this.submitManager.notify(requestOptions.success, result);
			}
		} catch (err) {
			this.options.hooks.error(err, context);
			await this.submitManager.notify(requestOptions.error, {
				data: null,
				error: err,
				response: null,
			});
		}
	}

	/**
	 *
	 * @param requestOptions
	 */
	private async doSubmit<Data>(
		requestOptions: VueSubmitOptions<Data>
	): Promise<VueSubmitResult | null> {
		if (requestOptions.validate) {
			const isValid = await this.doValidate([].concat(requestOptions.validate as any));
			if (!isValid) throw new Error(`Invalid`);
		}

		const isConfirmed = await this.submitManager.confirm(requestOptions.confirmation);
		if (!isConfirmed) return null;

		return null;
	}

	/**
	 * Validate every item on the validate options
	 * @param items
	 */
	private async doValidate(
		items: ValueOrCallback<VueSubmitValidateItem, undefined>[]
	): Promise<boolean> {
		let isValid = true;
		for (let i = 0; i <= items.length; ++i) {
			const item = await valueOrCallback(items[i], undefined);
			if (item === false) {
				isValid = false;
			} else if (item === true) {
				continue;
			} else if (isValidateLike(item)) {
				const isItemValid = await item.validate();
				if (isItemValid === false) {
					isValid = false;
				}
			} else if (isVuelidateLike(item)) {
				item.$touch();
				if (item.$invalid) {
					isValid = false;
				}
			} else {
				throw new Error(`Invalid value for validate.`);
			}
		}
		return isValid;
	}
}
