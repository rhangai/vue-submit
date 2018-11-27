vue-submit
=======================

Helper for requests with confirmation, notification and loading status.

### Instalation ###

```js
import Vue from 'vue';
import VueSubmit from 'vue-submit';

// Default options
Vue.use( VueSubmit );

// Or by using a framework name
Vue.use( VueSubmit, "buefy" );

// Or using full options 
Vue.use( VueSubmit, {
	//! Framework to set
	framework?: SubmitOptionsFramework,
	//! Confirmation function to be called on the confirmation step
	confirmation?: ( vm: any, confirmationData: any ) => any,
	confirmationDefaults?: any,
	//! Notification function to be called on notify step
	notify?: ( vm: any, notifyData: any, notifyDefaults?: any ) => any,
	notifyDefaults?: any,
	notifyDefaultError?: any,
	notifyDefaultErrorValidation?: any,
	//! Set the request function
	request?: ( vm: any, requestData: any ) => any,
	requestDefaults?: any,
	//! Compatibility options { Promise } for now
	compat: SubmitManagerCompatOptions,
}); 
```

### Usage ####
```js

this.$submit( "name", {
	//! The validator to use (vuelidate compatible)
	validator?: any,
	//! Set to false if you do not want to trigger the loading bar from nuxt
	loading?:   Boolean,
	//! Override the request functions
	request?: ( vm: any, requestData: any ) => any,
	//! Function to be called on success
	success?: ( result: any ) => any,
	//! Confirmation object passed to constructor
	confirmation?: any,
	//! Notify options on success and errors
	notify?: any,
	notifyError?: any,
});
```

