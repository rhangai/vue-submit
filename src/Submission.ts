import type { SubmitManager } from "./SubmitManager";
import { VueSubmitOptions } from "./Types";

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
			await this.doSubmit(requestOptions);
			this.options.hooks.afterSubmit(context);
		} catch (err) {
			this.options.hooks.error(err, context);
		}
	}
}
