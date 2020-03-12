import Vue, { VueConstructor } from "vue";
import { VueSubmitManager } from "./VueSubmitManager";
import {
	VueSubmitFunction,
	VueSubmitOptions,
	VueSubmitPluginOptions
} from "../types/vue-submit";
import { serializeFormData } from "./util/SerializeFormData";

/**
 * Defines a new property
 * @param target The prototype
 * @param name Name of the property
 * @param getter The getter function
 */
function defineProperty(
	target: any,
	name: string,
	getter: (self: any) => unknown
) {
	Object.defineProperty(target, name, {
		configurable: true,
		get() {
			const value = getter(this);
			Object.defineProperty(this, name, {
				configurable: false,
				writable: false,
				value
			});
			return value;
		}
	});
}
export class VueSubmitPlugin {
	static createSubmit(
		vue: VueConstructor,
		vm: Vue,
		pluginOptions: VueSubmitPluginOptions
	): VueSubmitFunction {
		const instance = new VueSubmitManager(vue, vm, pluginOptions);
		const submit = function(name: string, options: VueSubmitOptions) {
			return instance.submit(name, options);
		};
		submit.serializeFormData = serializeFormData;
		submit.$instance = instance;
		return submit;
	}
	static install(
		vue: VueConstructor,
		pluginOptions: VueSubmitPluginOptions = {}
	): void {
		defineProperty(vue.prototype, "$submit", function(self: Vue) {
			return VueSubmitPlugin.createSubmit(vue, self, pluginOptions);
		});
		Object.defineProperty(vue.prototype, "$submitting", {
			get() {
				return this.$data.$submitting;
			}
		});
		Object.defineProperty(vue.prototype, "$submitErrors", {
			get() {
				return this.$data.$submitErrors;
			}
		});
		vue.mixin({
			data() {
				return {
					$submitting: {},
					$submitErrors: {}
				};
			}
		});
	}
}
