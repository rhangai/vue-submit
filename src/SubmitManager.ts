import { Submission } from "./Submission";
import { ValidatorError } from "./Error";
import { SubmitOptions, SubmitManagerCompatOptions, SubmitManagerConstructorOptions } from './Options';
import createDefaults from "./defaults";

declare var global: any;

export const ERROR_STATUS = {
	ERROR:     "ERROR",
	VALIDATOR: "VALIDATOR",
};


export class SubmitManager {
	static ValidatorError = ValidatorError;

	readonly Vue: any;
	readonly options: SubmitManagerConstructorOptions;

	constructor( Vue, options: SubmitManagerConstructorOptions|null = null ) {
		this.Vue     = Vue;
		this.options = this.normalizeOptions( options );
	}
	private normalizeOptions( options: SubmitManagerConstructorOptions|null ): SubmitManagerConstructorOptions {
		const opt: any = options || {};
		const defaults = createDefaults( this, opt.framework );

		const compat: any = opt.compat || {};
		return {
			errorHandler: opt.errorHandler || function( vm: any, err: any ) { console.error( err ); },
			confirmation: opt.confirmation || defaults.confirmation,
			notify:  opt.notify || defaults.notify,
			notifyDefaultsError:  opt.notifyDefaultsError || defaults.notifyDefaultsError,
			notifyDefaultsErrorValidation:  opt.notifyDefaultsErrorValidation || defaults.notifyDefaultsErrorValidation,
			request: opt.request || defaults.request,
			requestDefaults: opt.requestDefaults || defaults.requestDefaults,
			sentry: opt.sentry,
			compat: {
				Promise: compat.Promise || (<any> global).Promise,
				assign:  compat.assign  || Object.assign,
			},
		};
	}

	submit( vm, name: string, submitOptions: SubmitOptions ) {
		if ( vm.$data.$submitting[name] )
			return this.options.compat.Promise.resolve( false );
		const submission = new Submission( this, vm, name, submitOptions );
		return submission.submit();
	}

	doConfirmation( vm: any, submitOptions: SubmitOptions, confirmationData: any ) {
		if ( !this.options.confirmation )
			return;
		return this.options.confirmation.call( vm, vm, confirmationData );
	}
	doNotify( vm: any, submitOptions: SubmitOptions, notifyData: any, notifyDefaults?: any ) {
		if ( !this.options.notify )
			return;
		return this.options.notify.call( vm, vm, notifyData, notifyDefaults );
	}
	doRequest( vm: any, submitOptions: SubmitOptions, requestData: any ) {
		if ( submitOptions.request === false )
			return;
		const request = submitOptions.request || this.options.request;
		if ( !request )
			return;
		requestData = this.options.compat.assign( {}, this.options.requestDefaults, requestData );
		return request.call( vm, vm, requestData );
	}

	errorHandler( vm: any, err: any ) {
		if ( err )
			return this.options.errorHandler!.call( null, vm, err );
	}

	captureException( vm: any, err: any ) {
		if ( !err )
			return;
		if ( this.options.sentry === false )
			return;

		// Check if is default sentry
		const isDefaultSentry: boolean = this.options.sentry === true || this.options.sentry == null;
		if ( isDefaultSentry ) {
			if ( !vm.$sentry )
				return;
			vm.$sentry.captureException( err );
			return;
		}

		// Capture the sentry
		this.options.sentry.captureException( err );
	}
};