import path from 'path';

export default function nuxtVueSubmit( options ) {
	this.addPlugin({
		src: path.resolve( __dirname, 'plugin.js' ),
		options: {
			module: path.resolve( __dirname, '../' ),
			options: options,
		}
	});
}