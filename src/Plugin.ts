import Vue, { VueConstructor } from "vue";
import { VueSubmitOptions, VueSubmitManager } from "./VueSubmit";

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
	static createSubmit(vue: VueConstructor, vm: Vue) {
		const instance = new VueSubmitManager(vue, vm);
		const submit = function(name: string, options: VueSubmitOptions) {
			return instance.submit(name, options);
		};
		submit.$instance = instance;
		return submit;
	}
	static install(vue: VueConstructor): void {
		defineProperty(vue.prototype, "$submit", function(self: Vue) {
			return VueSubmitPlugin.createSubmit(vue, this);
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
