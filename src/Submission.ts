import { SubmitManager } from "./SubmitManager";
import { ValidatorError } from "./Error";
import { SubmitOptions, SubmitManagerCompatOptions } from "./Options";

export class Submission {

	private parent: SubmitManager;
	private vm: any;
	private options: SubmitOptions;
	readonly compat:  SubmitManagerCompatOptions;
	readonly hasLoader: Boolean;

	constructor( parent: SubmitManager, vm: any, options: SubmitOptions ) {
		this.parent   = parent;
		this.vm       = vm;
		this.options  = options;
		this.compat   = parent.options.compat;
		this.hasLoader = this.loaderCheck();
	}

	submit() {
		const { Promise } = this.compat;
		if ( this.vm.$data.$submitting[name] )
			return Promise.resolve( false );
		return Promise.resolve()
			.then( () => this.loaderStart() )
			.then( () => this.validatorRun() )
			.then( () => this.confirmationRun() )
			.then( ( confirmation: any ) => {
				if ( confirmation === false )
					return;
				return Promise.resolve( this.requestRun() )
					.then( () => this.submitFinish() );
			})
			.catch( ( err ) => this.submitFinish( err ) );
	}
	submitFinish( err = null ) {
		const { Promise } = this.compat;
		return Promise.resolve()
			.then( () => this.notify( err ) ).catch( () => null )
			.then( () => this.loaderFinish( err ) );
	}

	/**
	 * Loader functions
	 */
	loaderCheck(): boolean {
		return !!( this.options.loading !== false && this.vm.$nuxt && this.vm.$nuxt.$loading );
	}
	loaderStart() {
		if ( !this.hasLoader )
			return;
		this.vm.$nuxt.$loading.start();
	}
	loaderFinish( err = null ) {
		if ( !this.hasLoader )
			return;
		if ( err )
			this.vm.$nuxt.$loading.fail();
		this.vm.$nuxt.$loading.finish();
	}

	/**
	 * Validate the parameter
	 */
	validatorRun() {
		if ( !this.options.validator )
			return;

		let validator: any = this.options.validator;
		if ( typeof(validator) === 'function' )
			validator = validator.call( this );

		if ( validator === false ) {
			throw new ValidatorError;
		} else if( validator === true ) {
		} else if ( this.options.validator.$touch ) {
			this.options.validator.$touch();
			if ( this.options.validator.$invalid )
				throw new ValidatorError;
		} else if ( validator )
			throw new Error( "Invalid type of validator" );
	}
	/**
	 * Confirm the action somehow
	 */
	confirmationRun() {
		if ( !this.options.confirmation )
			return true;
		return this.parent.doConfirmation( this.vm, this.options, this.options );
	}
	/**
	 * Run the request
	 */
	requestRun() {
		return this.parent.doRequest( this.vm, this.options, this.options );
	}
	/**
	 * Notify
	 */
	notify( err ) {
		if ( !err ) {
			this.parent.doNotify( this.vm, this.options, this.options.notify );
		} else if ( err instanceof ValidatorError ) {
			this.parent.doNotify( this.vm, this.options, this.parent.options.notifyDefaultErrorValidation );
		} else {
			this.parent.doNotify( this.vm, this.options, this.options.notifyError || this.parent.options.notifyDefaultError );
		}
	}

};