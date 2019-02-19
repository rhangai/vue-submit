import { SubmitManager } from "./SubmitManager";
import { ValidatorError } from "./Error";
import { SubmitOptions, SubmitManagerCompatOptions } from "./Options";

export class Submission {

	private readonly parent: SubmitManager;
	private readonly vm: any;
	private readonly name: string;
	private readonly options: SubmitOptions;
	private readonly hasLoader: Boolean;
	private readonly compat:  SubmitManagerCompatOptions;

	constructor( parent: SubmitManager, vm: any, name: string, options: SubmitOptions ) {
		this.parent   = parent;
		this.vm       = vm;
		this.name     = name;
		this.options  = options;
		this.compat   = parent.options.compat;
		this.hasLoader = this.loaderCheck();
	}

	submit() {
		const { Promise } = this.compat;
		if ( this.vm.$data.$submitting[this.name] )
			return Promise.resolve( false );
		this.vm.$set( this.vm.$data.$submitting, this.name, true );
		this.vm.$set( this.vm.$data.$submitError, this.name, false );
		return Promise.resolve()
			.then( () => this.loaderStart() )
			.then( () => this.validatorRun() )
			.then( () => this.confirmationRun() )
			.then( ( confirmation: any ) => {
				if ( confirmation === false )
					return false;
				return Promise.resolve( this.requestRun() )
					.then( ( result ) => this.successRun( result ) )
					.then( () => true );
			})
			.then( ( hasSubmitted ) => this.submitFinish( null, !hasSubmitted ), ( err ) => this.submitFinish( err ) );
	}
	submitFinish( err = null, skipped = false ) {
		const { Promise } = this.compat;
		return Promise.resolve()
			.then( () => {
				if ( !skipped )
					return this.notify( err );
			} ).catch( () => null )
			.then( () => this.loaderFinish( err ) ).catch( () => null )
			.then( () => {
				this.vm.$set( this.vm.$data.$submitting, this.name, false );
				this.vm.$set( this.vm.$data.$submitError, this.name, err );
			});
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
		} else if ( validator.$touch ) {
			validator.$touch();
			if ( validator.$invalid )
				throw new ValidatorError;
		} else if ( validator )
			throw new Error( "Invalid type of validator" );
	}
	/**
	 * Confirm the action somehow
	 */
	confirmationRun() {
		return this.parent.doConfirmation( this.vm, this.options, this.options.confirmation );
	}
	/**
	 * Run the request
	 */
	requestRun() {
		return this.parent.doRequest(this.vm, this.options, this.options);
	}
	/**
	 * Run the success
	 */
	successRun( result: any ) {
		const noop = () => null;

		// Wether to call the forever callback
		let isForever: boolean = !!this.options.forever;

		let successCallback = null;
		if ( this.options.success ) {
			if ( typeof( this.options.success ) === 'function' ) {
				successCallback = this.options.success;
			} else if ( this.vm.$router ) {
				successCallback = () => this.vm.$router.push( this.options.success );
				isForever = true;
			}
		}

		// Check 
		let foreverCallback = null;
		if ( isForever ) 
			foreverCallback = () => new this.compat.Promise(noop);

		return this.compat.Promise.resolve()
			.then( successCallback || noop )
			.then( foreverCallback || noop );
	}
	/**
	 * Notify
	 */
	notify( err: Error | null ) {
		// Notify the success state
		if ( !err ) {
			this.parent.doNotify( this.vm, this.options, this.options.notify );
			return;
		}
		const validationError = ( err instanceof ValidatorError );
		const errorContext = { error: err, validationError };

		// Normalize error data
		let notifyError: any = this.options.notifyError;
		if ( typeof(notifyError) === 'function' ) {
			notifyError = this.options.notifyError.call(null, errorContext);
		} else if ( validationError ) {
			notifyError = {};
		}

		// Get the error defaults
		let notifyErrorDefaults: any = validationError ? this.parent.options.notifyDefaultsErrorValidation : this.parent.options.notifyDefaultsError;
		if ( typeof(notifyErrorDefaults) === 'function' )
			notifyErrorDefaults = notifyErrorDefaults.call( null, errorContext );

		// Notify the error
		this.parent.doNotify( this.vm, this.options, notifyError, notifyErrorDefaults );
	}

};