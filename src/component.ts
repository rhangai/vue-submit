import { VueSubmitResult } from "./types";

export type VueSubmitNotificationItem = {
	id: number;
	active: boolean;
	notification: unknown;
	result: VueSubmitResult;
	error: Error | null;
	close(delay?: number | null): void;
};

export type VueSubmitConfirmationItem = {
	id: number;
	active: boolean;
	confirmation: unknown;
	resolve(confirmed: boolean, delay?: number | null): void;
	confirm(delay?: number | null): void;
	cancel(delay?: number | null): void;
};
