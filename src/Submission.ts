import { Submit, SubmitOptions, SubmitOptionsCompat } from "./Submit";


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
			.then( () => true );
	}

	loaderCheck(): boolean {
		return !!( this.options.loading !== false && this.vm.$nuxt && this.vm.$nuxt.$loading );
	}
	loaderStart() {
		if ( !this.hasLoader )
			return;
		this.vm.$nuxt.$loading.start();
	}
	loaderFinish( err ) {
		if ( !this.hasLoader )
			return;
		if ( err )
			this.vm.$nuxt.$loading.fail();
		this.vm.$nuxt.$loading.finish();
	}

};