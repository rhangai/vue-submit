import { SubmitManager } from "./SubmitManager";

export default function createDefaults( submitManager: SubmitManager ) {
	return {
		request( vm, options ) {
			const requestOptions = Object.assign( {}, options );
			if ( typeof(requestOptions.data) === 'function' )
				requestOptions.data = requestOptions.data.call( vm, vm, options );
			return vm.$axios( requestOptions );
		},
	};
}