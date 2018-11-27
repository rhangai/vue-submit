export type SubmitOptionsFramework = "buefy";

export interface SubmitOptions {
	framework?: SubmitOptionsFramework,
	validator?: any,
	loading?:   Boolean,
	request?: ( vm: any, requestData: any ) => any,
	confirmation?: any,
	notify?: any,
	notifyError?: any,
};