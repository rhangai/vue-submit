import { Submit, SubmitOptions, SubmitOptionsCompat } from "./Submit";
import { ValidatorError } from "./Error";


export class Submission {

	private parent: Submit;
	private vm: any;
	private options: SubmitOptions;
	readonly compat:  SubmitOptionsCompat;
	readonly hasLoader: Boolean;

	constructor( parent: Submit, vm: any, options: SubmitOptions ) {
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
			.then( () => this.loaderFinish(), ( err ) => this.loaderFinish( err ) );
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
	 * 
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

};