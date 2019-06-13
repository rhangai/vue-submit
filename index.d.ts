import Vue from 'vue';
import { AxiosRequestConfig } from 'axios';

/// Framework
export type SubmitOptionsFramework = "buefy";

/// Options for download
export type SubmitDownloadOptions = {
	force?: boolean;
	filename: string;
}

/// Callback types
export type SubmitOptionsSuccessCallback = (result: any) => any;
export type SubmitOptionsSetupCallback = (vm: any) => any;

/// Options for submit
export type SubmitOptions = {
	//! Options for downloading files
	download?: SubmitDownloadOptions | string | boolean;
	//! The validator to use (vuelidate compatible)
	validator?: any,
	//! Set to false if you do not want to trigger the loading bar from nuxt
	loading?:   Boolean,
	//! Set to true if you never want to return from the submit in case of success.
	forever?:   Boolean,
	//! Override the request functions
	request?: false | (( vm: any, requestData: any ) => any),
	//! Function to be called right before the request
	setup?: SubmitOptionsSetupCallback,
	//! Function to be called on success
	success?: SubmitOptionsSuccessCallback | string | object,
	//! Confirmation object passed to constructor
	confirmation?: any,
	//! Notify options on success and errors
	notify?: any,
	notifyError?: any,
};

/// Vue submitinterface
export interface VueSubmit {
	/// VueSubmit interface
	(name: string, options: SubmitOptions & AxiosRequestConfig): Promise<any>;
	/// Serialize a data into a form data
	serializeFormData(data: any): FormData;
}

/// Extends the vue type to use the submit
declare module 'vue/types/vue' {
	interface Vue {
		/**
		 * Submit a new ajax request
		 * 
		 * @param name Name of the key to submit
		 * @param options Options passed through the request function 
		 */
		$submit: VueSubmit;
		/**
		 * Submitting object
		 */
		$submitting: { [key: string]: boolean };
		/**
		 * Errors when submitting
		 */
		$submitError: { [key: string]: any };
	}
}