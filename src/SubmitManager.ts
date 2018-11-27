import { Submission } from "./Submission";
import { ValidatorError } from "./Error";
import { SubmitOptions } from './Options';
import createDefaults from "./Defaults";

export const ERROR_STATUS = {
	ERROR:     "ERROR",
	VALIDATOR: "VALIDATOR",
};

export interface SubmitManagerCompatOptions {
	Promise?: PromiseConstructor,
	assign?:  ( ...args: any ) => any,
};
export interface SubmitManagerConstructorOptions {
	compat: SubmitManagerCompatOptions,
	confirmation?: ( vm: any, confirmationData: any ) => any,
	notify?: ( vm: any, notifyData: any ) => any,
	request?: ( vm: any, requestData: any ) => any,
	requestDefaults?: any,
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
		const defaults = createDefaults( this, opt.mode );

		const compat: any = opt.compat || {};
		return {
			request: opt.request || defaults.request,
			notify:  opt.notify || defaults.notify,
			compat: {
				Promise: compat.Promise || (<any> window).Promise,
				assign:  compat.assign  || Object.assign,
			},
		};
	}

	submit( vm, name, submitOptions: SubmitOptions ) {
		if ( vm.$data.$submitting[name] )
			return this.options.compat.Promise.resolve( false );
		const submission = new Submission( this, vm, submitOptions );
		return submission.submit();
	}

	doConfirmation( vm: any, submitOptions: SubmitOptions, confirmationData: any ) {
		if ( !this.options.confirmation )
			return;
		return this.options.confirmation.call( vm, vm, confirmationData );
	}
	doNotify( vm: any, submitOptions: SubmitOptions, notifyData: any ) {
		if ( !this.options.notify )
			return;
		return this.options.notify.call( vm, vm, notifyData );
	}
	doRequest( vm: any, submitOptions: SubmitOptions, requestData: any ) {
		const request = submitOptions.request || this.options.request;
		if ( !request )
			return;
		requestData = this.options.compat.assign( {}, this.options.requestDefaults, requestData );
		return request.call( vm, vm, requestData );
	}

	/**
	 * Install the vue application
	 * 
	 * @param vue 
	 * @param options 
	 */
	static install( vue, options: any ) {
		const submitManager = new SubmitManager( vue, options );
		Object.defineProperty( vue.prototype, "$submit", {
			configurable: true,
			value( name, options ) { return submitManager.submit( this, name, options ); },
		});
		Object.defineProperty( vue.prototype, "$submitting", {
			configurable: true,
			get() {
				return this.$data.$submitting;
			},
		});
		Object.defineProperty( vue.prototype, "$submitError", {
			configurable: true,
			get() {
				return this.$data.$submitError;
			},
		});
		vue.mixin({
			data() { 
				return { 
					$submitting:  {},
					$submitError: {},
				};
			},
		});
	}
};