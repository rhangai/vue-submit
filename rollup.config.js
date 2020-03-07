import pluginCommonJs from "@rollup/plugin-commonjs";
import pluginNodeResolve from "@rollup/plugin-node-resolve";
import pluginTypescript from "@rollup/plugin-typescript";
import pluginBabel from "rollup-plugin-babel";

export default [
	{
		input: "src/index.ts",
		external: ["vue"],
		output: {
			file: "dist/vue-submit.js",
			format: "esm",
			sourcemap: true
		},
		plugins: [
			//
			pluginNodeResolve(),
			pluginCommonJs(),
			pluginTypescript()
		]
	},
	{
		input: "src/index.ts",
		external: ["vue"],
		output: {
			name: "VueSubmit",
			file: "dist/vue-submit.umd.js",
			format: "umd"
		},
		plugins: [
			//
			pluginNodeResolve(),
			pluginCommonJs(),
			pluginTypescript(),
			pluginBabel({
				exclude: "node_modules/**",
				extensions: [".js", ".ts"]
			})
		]
	}
];
