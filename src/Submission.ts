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
					.then( ( result ) => {
						if ( this.options.success )
							return this.options.success.call( this.vm, result );
					}).then( () => true );
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
		return this.parent.doRequest( this.vm, this.options, this.options );
	}
	/**
	 * Notify
	 */
	notify( err ) {
		if ( !err ) {
			this.parent.doNotify( this.vm, this.options, this.options.notify );
		} else if ( err instanceof ValidatorError ) {
			this.parent.doNotify( this.vm, this.options, this.parent.options.notifyDefaultsErrorValidation );
		} else {
			this.parent.doNotify( this.vm, this.options, this.options.notifyError, this.parent.options.notifyDefaultsError );
		}
	}

};