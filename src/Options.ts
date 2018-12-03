export type SubmitOptionsFramework = "buefy";

export interface SubmitOptions {
	//! The validator to use (vuelidate compatible)
	validator?: any,
	//! Set to false if you do not want to trigger the loading bar from nuxt
	loading?:   Boolean,
	//! Override the request functions
	request?: false | (( vm: any, requestData: any ) => any),
	//! Function to be called on success
	success?: ( result: any ) => any,
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
	//! Compatibility options { Promise } for now
	compat: SubmitManagerCompatOptions,
};
