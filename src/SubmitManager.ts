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
	private confirmationCallback: SubmitManagerConfirmationCallback | null = null;

	private notificationCallback: SubmitManagerNotificationCallback | null = null;

	createSubmission(options: SubmissionOptions): Submission {
		return new Submission(this, options);
	}

	setNotificationCallback(callback: SubmitManagerNotificationCallback | null) {
		this.notificationCallback = callback;
	}

	setConfirmationCallback(callback: SubmitManagerConfirmationCallback | null) {
		this.confirmationCallback = callback;
	}

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
