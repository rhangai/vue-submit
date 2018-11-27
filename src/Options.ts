export type SubmitOptionsFramework = "buefy";

export interface SubmitOptions {
	validator?: any,
	loading?:   Boolean,
	request?: ( vm: any, requestData: any ) => any,
	success?: ( result: any ) => any,
	confirmation?: any,
	notify?: any,
	notifyError?: any,
};

export interface SubmitManagerCompatOptions {
	Promise?: PromiseConstructor,
	assign?:  ( ...args: any ) => any,
};

export interface SubmitManagerConstructorOptions {
	framework?: SubmitOptionsFramework,
	compat: SubmitManagerCompatOptions,
	confirmation?: ( vm: any, confirmationData: any ) => any,
	confirmationDefaults?: any,
	notify?: ( vm: any, notifyData: any ) => any,
	notifyDefaults?: any,
	notifyDefaultError?: any,
	notifyDefaultErrorValidation?: any,
	request?: ( vm: any, requestData: any ) => any,
	requestDefaults?: any,
};
