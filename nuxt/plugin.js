import Vue from 'vue';
import VueSubmit from <%= JSON.stringify( options.path.resolve( __dirname, "../" ) ) %>;

Vue.use( VueSubmit, <%= JSON.stringify( options.options ) %> );