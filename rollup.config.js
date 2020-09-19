import pluginCommonJs from "@rollup/plugin-commonjs";
import pluginNodeResolve from "@rollup/plugin-node-resolve";
import pluginTypescript from "@rollup/plugin-typescript";
import pluginBabel from "rollup-plugin-babel";

export default [
	{
		input: "src/index.ts",
		external: ["vue"],
		output: {
			name: "VueSubmit",
			file: "dist/bundle/vue-submit.umd.js",
			format: "umd",
		},
		plugins: [
			//
			pluginNodeResolve(),
			pluginCommonJs(),
			pluginTypescript(),
			pluginBabel({
				exclude: "node_modules/**",
				runtimeHelpers: true,
				extensions: [".js", ".ts"],
			}),
		],
	},
	{
		input: "src/composition-api/index.ts",
		external: ["vue", "@vue/composition-api"],
		output: {
			name: "VueSubmit",
			file: "dist/bundle/vue-submit.composition-api.umd.js",
			format: "umd",
			globals: {
				"@vue/composition-api": "VueCompositionAPI",
			},
		},
		plugins: [
			//
			pluginNodeResolve(),
			pluginCommonJs(),
			pluginTypescript(),
			pluginBabel({
				exclude: "node_modules/**",
				runtimeHelpers: true,
				extensions: [".js", ".ts"],
			}),
		],
	},
];
