import type { SubmitManager } from "./SubmitManager";
import { VueSubmitOptions } from "./Types";

export type SubmissionOptions = {
	hooks: {
		beforeSubmit?(context: any): void;
		afterSubmit?(context: any): void;
		error?(error: Error, context: any): void;
	};
};

export class Submission {
	constructor(
		private readonly submitManager: SubmitManager,
		private readonly options: SubmissionOptions
	) {}

	submit<Data = unknown>(requestOptions: VueSubmitOptions<Data>, context?: any) {}
}
