import { Submission } from "./Submission";
import { ValidatorError } from "./Error";

export const ERROR_STATUS = {
	ERROR:     "ERROR",
	VALIDATOR: "VALIDATOR",
};

export interface SubmitOptionsCompat {
	Promise?: PromiseConstructor,
	assign?:  ( ...args: any ) => any,
};
export interface SubmitConstructorOptions {
	compat: SubmitOptionsCompat,
};
export interface SubmitOptions {
	validator?: any,
	loading?:   Boolean,
};

export class Submit {
	static ValidatorError = ValidatorError;

	readonly Vue: any;
	readonly options: SubmitConstructorOptions;

	constructor( Vue, options: SubmitConstructorOptions|null = null ) {
		this.Vue     = Vue;
		this.options = this.normalizeOptions( options );
	}
	private normalizeOptions( options: SubmitConstructorOptions|null ): SubmitConstructorOptions {
		const opt: any    = options || {};
		const compat: any = opt.compat || {};
		return {
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

	static install( vue, options: any ) {
		const submit = new Submit( vue, options );
		Object.defineProperty( vue.prototype, "$submit", {
			configurable: true,
			value( name, options ) { return submit.submit( this, name, options ); },
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