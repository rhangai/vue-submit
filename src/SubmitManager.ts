import { Submission, SubmissionOptions } from "./Submission";
import { VueSubmitConfirmation, VueSubmitNotification } from "./Types";

export type SubmitManagerOptions = {
	notify(notification: VueSubmitNotification): Promise<void>;
	confirm(confirmation: VueSubmitConfirmation): Promise<boolean>;
};

export class SubmitManager {
	constructor(private readonly options: SubmitManagerOptions) {}

	createSubmission(options: SubmissionOptions): Submission {
		return new Submission(this, options);
	}
}
