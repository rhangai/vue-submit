
import { SubmitManager } from "../SubmitManager";

export function createDefaultsBuefy( submitManager: SubmitManager, parentDefaults: any ) {
	return {
		confirmation( vm, confirmationData ) {
			if ( typeof(confirmationData) === 'function' )
				confirmationData = confirmationData.call( vm, vm );
			if ( confirmationData == null || confirmationData === true )
				return true;
			else if ( confirmationData === false )
				return false;
			if ( typeof(confirmationData) === 'string' )
				confirmationData = { message: confirmationData };

			return new Promise( function( resolve, reject ) {
				const confirmationDefaults = typeof(submitManager.options.confirmationDefaults) === 'function' ?
					submitManager.options.confirmationDefaults.call( vm, confirmationData ) :
					submitManager.options.confirmationDefaults;

				let dialog = vm.$dialog.confirm({
					title: "Confirmação",
					confirmText: "OK",
					cancelText: "Cancelar",
					hasIcon: true,
					scroll: 'keep',
					icon: confirmationData.icon || (confirmationData.type == "is-danger" ? "alert-decagram" : "information" ),
					...confirmationDefaults,
					...confirmationData,
					onConfirm: () => { resolve( true ); },
					onCancel:  () => { resolve( false ); },
				});
				const closeDialog = function() {
					if ( dialog ) {
						dialog.close();
						dialog = null;
					}
					vm.$off( 'hook:beforeDestroy', closeDialog );
				};
				vm.$once( 'hook:beforeDestroy', closeDialog );
				dialog.$once( 'hook:beforeDestroy', () => vm.$off( 'hook:beforeDestroy', closeDialog ) );
			});
		},
		notify( vm, notifyData, notifyDefaults ) {
			if ( typeof(notifyData) === 'function' )
				notifyData = notifyData.call( vm, vm, notifyData );
			if ( !notifyData )
				return;
			if ( typeof(notifyData) === 'string' )
				notifyData = { message: notifyData };
			const notifyGlobalDefaults = typeof(submitManager.options.notifyDefaults) === 'function' ?
				submitManager.options.notifyDefaults.call( vm, notifyData ) :
				submitManager.options.notifyDefaults;
			vm.$toast.open({ 
				queue: false,
				...notifyGlobalDefaults, 
				...notifyDefaults,
				...notifyData,
			});
		},
		notifyDefaultsError: { type: 'is-danger', message: "Ocorreu um Erro." },
		notifyDefaultsErrorValidation: { type: 'is-danger', message: "Verifique os campos e tente novamente." },
	};
};