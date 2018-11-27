import { SubmitManager } from "./SubmitManager";
import { SubmitOptionsFramework } from "./Options";

export function createDefaultsVanilla( submitManager: SubmitManager ) {
	return {
		request( vm, options ) {
			const requestOptions = Object.assign( {}, options );
			if ( typeof(requestOptions.data) === 'function' )
				requestOptions.data = requestOptions.data.call( vm, vm, options );
			return vm.$axios( requestOptions );
		},
	};
};
export function createDefaultsBuefy( submitManager: SubmitManager, parentDefaults: any ) {
	return {
		notify( vm, notifyData ) {
			if ( typeof(notifyData) === 'function' )
				notifyData = notifyData.call( vm, vm, notifyData );
			if ( !notifyData )
				return;
			if ( typeof(notifyData) === 'string' )
				notifyData = { message: notifyData };
			vm.$toast.open( notifyData );
		},
	};
};

export  default function createDefaults( submitManager: SubmitManager, mode: SubmitOptionsFramework = null  ) {
	let defaults: any = createDefaultsVanilla( submitManager );
	if ( mode === 'buefy' )
		defaults = Object.assign( defaults, createDefaultsBuefy( submitManager, defaults ) );
	return defaults;
};