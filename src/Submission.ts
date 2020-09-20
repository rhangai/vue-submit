import type { SubmitManager } from "./SubmitManager";
import { VueSubmitOptions, VueSubmitResult, VueSubmitValidateItem } from "./Types";
import { isValidateLike, isVuelidateLike } from "./util/validate";
import { valueOrCallback, ValueOrCallback } from "./util/value";
import { serializeFormData } from "./util/form-data";

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
		private readonly submissionOptions: SubmissionOptions
	) {}

	async submit<Data = unknown>(options: VueSubmitOptions<Data>, context?: any) {
		const isSkip = this.submissionOptions.skip(context);
		if (isSkip) return;
		try {
			this.submissionOptions.hooks.beforeSubmit(context);
			const result = await this.doSubmit(options);
			this.submissionOptions.hooks.afterSubmit(context);
			if (result) {
				await this.submitManager.notify(options.onSuccess, result);
			}
		} catch (err) {
			this.submissionOptions.hooks.error(err, context);
			await this.submitManager.notify(options.onError, {
				data: null,
				error: err,
				response: null,
			});
		}
	}

	/**
	 * Perform the submission.
	 *   - Validate the fields
	 *   - Ask for confirmation
	 *   - Perform the request
	 */
	private async doSubmit<Data>(
		options: VueSubmitOptions<Data>,
		context?: any
	): Promise<VueSubmitResult | null> {
		if (options.validate) {
			const isValid = await this.doValidate([].concat(options.validate as any));
			if (!isValid) throw new Error(`Invalid`);
		}

		const isConfirmed = await this.submitManager.confirm(options.confirmation);
		if (!isConfirmed) return null;

		const response = await this.doRequest(options, context);
		return {
			data: (response as any)?.data ?? null,
			error: null,
			response,
		};
	}

	/**
	 * Validate every item on the validate options
	 * @param items
	 */
	private async doValidate(
		items: ValueOrCallback<VueSubmitValidateItem, undefined>[]
	): Promise<boolean> {
		let isValid = true;
		for (let i = 0; i < items.length; ++i) {
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

	/**
	 * Validate every item on the validate options
	 * @param items
	 */
	private async doRequest<Data>(options: VueSubmitOptions<Data>, context?: any): Promise<unknown> {
		const requestOptions = { ...options };
		delete requestOptions.data;
		delete requestOptions.validate;
		delete requestOptions.confirmation;
		delete requestOptions.onSuccess;
		delete requestOptions.onError;

		const data = await valueOrCallback(options.data, {
			serializeFormData,
		});

		return this.submitManager.callRequestFunction({
			data,
			options: requestOptions,
			context,
		});
	}
}
