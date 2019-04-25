import { SubmitOptions, SubmitOptionsFramework, SubmitDownloadOptions } from "../index.d";


export { SubmitOptions, SubmitOptionsFramework, SubmitDownloadOptions };

export type SubmitErrorHandler = ( vm: any, error: any ) => any;

export interface SubmitManagerCompatOptions {
	Promise?: PromiseConstructor,
	assign?:  ( ...args: any ) => any,
};

export interface SubmitManagerConstructorOptions {
	//! Framework to set
	framework?: SubmitOptionsFramework,
	//! Error handler for unknown errors
	errorHandler?: SubmitErrorHandler,
	//! Confirmation function to be called on the confirmation step
	confirmation?: ( vm: any, confirmationData: any ) => any,
	confirmationDefaults?: any,
	//! Notification function to be called on notify step
	notify?: ( vm: any, notifyData: any, notifyDefaults?: any ) => any,
	notifyDefaults?: any,
	notifyDefaultsError?: any,
	notifyDefaultsErrorValidation?: any,
	//! Set the request function
	request?: ( vm: any, requestData: any ) => any,
	requestDefaults?: any,
	//! Sentry support
	sentry: any,
	//! Compatibility options { Promise } for now
	compat: SubmitManagerCompatOptions,
};
