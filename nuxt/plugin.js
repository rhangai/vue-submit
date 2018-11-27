import Vue from 'vue';
import VueSubmit from <%= JSON.stringify( options.module ) %>;

Vue.use( VueSubmit, <%= JSON.stringify( options.options ) %> );