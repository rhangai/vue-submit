export class ValidatorError extends Error {
	isValidator = true;
}

export class ConfirmationAbortError extends Error {
	isAbort = true;
}
