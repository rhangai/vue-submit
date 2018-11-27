import path from 'path';

export default function nuxtVueSubmit( options ) {
	this.addPlugin({
		src: path.resolve( __dirname, 'plugin.js' ),
		options: {
			path,
			options: options,
		}
	});
}