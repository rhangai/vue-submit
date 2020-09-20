import { Submission, SubmissionOptions } from "./Submission";
import {
	VueSubmitConfirmation,
	VueSubmitConfirmationValue,
	VueSubmitNotification,
	VueSubmitNotificationValue,
	VueSubmitResult,
} from "./Types";
import { valueOrCallback, ValueOrCallback } from "./util/value";

export type SubmitManagerNotificationCallback = (
	notification: VueSubmitNotification,
	result: VueSubmitResult
) => Promise<void>;

export type SubmitManagerConfirmationCallback = (
	confirmation: VueSubmitConfirmation
) => Promise<boolean>;

export class SubmitManager {
	private requestFn: ((options: any) => any) | null = null;

	private confirmationCallback: SubmitManagerConfirmationCallback | null = null;

	private notificationCallback: SubmitManagerNotificationCallback | null = null;

	setRequestFunction(requestFn: ((options: any) => any) | null) {
		this.requestFn = requestFn;
	}

	callRequestFunction(options: any) {
		if (!this.requestFn) throw new Error(`Invalid request funciton`);
		return this.requestFn(options);
	}

	setNotificationCallback(callback: SubmitManagerNotificationCallback | null) {
		this.notificationCallback = callback;
	}

	/// Set the confirmation callback
	setConfirmationCallback(callback: SubmitManagerConfirmationCallback | null) {
		this.confirmationCallback = callback;
	}

	/**
	 * Create a new submission
	 * @param options The submission options
	 */
	createSubmission(submissionOptions: SubmissionOptions): Submission {
		return new Submission(this, submissionOptions);
	}

	/**
	 * Notify the status of the submission
	 */
	async notify(
		notificationValue: ValueOrCallback<VueSubmitNotificationValue, VueSubmitResult>,
		result: VueSubmitResult
	) {
		const value = await valueOrCallback(notificationValue, result);
		const notification = this.normalizeNotification(value);
		if (notification) {
			await this.notificationCallback?.(notification, result);
		}
	}

	private normalizeNotification(value: VueSubmitNotificationValue): VueSubmitNotification | null {
		if (value == null || value === true) return { message: null };
		if (value === false) return null;
		if (typeof value === "string") return { message: value };
		return value;
	}

	/**
	 * Ask for confirmation
	 */
	async confirm(confirmationValue: VueSubmitConfirmationValue): Promise<boolean> {
		if (!confirmationValue) return true;
		if (confirmationValue === true) {
			if (!this.confirmationCallback) return true;
			return this.confirmationCallback({ message: null });
		}
		if (typeof confirmationValue === "string") {
			if (!this.confirmationCallback) return true;
			return this.confirmationCallback({ message: confirmationValue });
		}
		if (typeof confirmationValue === "function") {
			return confirmationValue({ defaultConfirmation: this.confirm.bind(this) });
		}
		return true;
	}
}
