export type SubmitOptionsFramework = "buefy";

export type ErrorHandler = ( vm: any, error: any ) => any;
export type SubmitOptionsSuccessCallback = ( result: any ) => any;

export interface SubmitOptions {
	//! The validator to use (vuelidate compatible)
	validator?: any,
	//! Set to false if you do not want to trigger the loading bar from nuxt
	loading?:   Boolean,
	//! Set to true if you never want to return from the submit in case of success.
	forever?:   Boolean,
	//! Override the request functions
	request?: false | (( vm: any, requestData: any ) => any),
	//! Function to be called on success
	success?: SubmitOptionsSuccessCallback | string | object,
	//! Confirmation object passed to constructor
	confirmation?: any,
	//! Notify options on success and errors
	notify?: any,
	notifyError?: any,
};

export interface SubmitManagerCompatOptions {
	Promise?: PromiseConstructor,
	assign?:  ( ...args: any ) => any,
};

export interface SubmitManagerConstructorOptions {
	//! Framework to set
	framework?: SubmitOptionsFramework,
	//! Error handler for unknown errors
	errorHandler?: ErrorHandler,
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
