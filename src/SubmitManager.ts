import { Submission, SubmissionOptions } from "./Submission";

export class SubmitManager {
	createSubmission(options: SubmissionOptions): Submission {
		return new Submission(this, options);
	}
}
