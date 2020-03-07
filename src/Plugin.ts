import Vue, { VueConstructor } from "vue";
import { VueSubmitManager } from "./VueSubmit";
import { VueSubmitCallback, VueSubmitOptions } from "../types/vue-submit";
import { serializeFormData } from "./util/SerializeFormData";

function defineProperty(proto: any, name: string, getter: (self: any) => unknown) {
	Object.defineProperty(proto, name, {
		configurable: true,
		writable: false,
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
	static createSubmit(vue: VueConstructor, vm: Vue): VueSubmitCallback {
		const instance = new VueSubmitManager(vue, vm);
		const submit = function(name: string, options: VueSubmitOptions) {
			return instance.submit(name, options);
		};
		submit.serializeFormData = serializeFormData;
		submit.$instance = instance;
		return submit;
	}
	static install(vue: VueConstructor): void {
		defineProperty(vue.prototype, "$submit", function(self: Vue) {
			return VueSubmitPlugin.createSubmit(vue, self);
		});
		defineProperty(vue.prototype, "$submitting", function(self: Vue) {
			// @ts-ignore
			return self.$submit.$instance.submitting;
		});
		defineProperty(vue.prototype, "$submitErrors", function(self: Vue) {
			// @ts-ignore
			return self.$submit.$instance.errors;
		});
	}
}
