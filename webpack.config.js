const path = require( "path" );

const isDev = process.env.NODE_ENV !== 'production';
const mode  = isDev ? 'development' : 'production';

module.exports = {
	entry: './src/index.ts',
	mode,
	target: 'web',
	output: {
		filename: 'vue-submit.js',
		libraryTarget: 'umd',
		library: 'VueSubmit',
	},
	module: {
		rules: [{
			test: /\.tsx?/,
			use: 'ts-loader',
			include: path.resolve( __dirname, 'src' ),
		}],
	},
	resolve: {
		extensions: [ '.ts', '.js' ],
	}
};