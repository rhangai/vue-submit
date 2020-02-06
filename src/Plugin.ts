import { VueSubmit } from "..";
import { isPlainObject } from "./util/isObject";
import { SubmitManager } from "./SubmitManager";

export class VueSubmitPlugin {
	/**
	 * Create the VueSubmitInterface
	 */
	private static createSubmitInterface(submitManager: SubmitManager): VueSubmit {
		const vueSubmit = function(name: string, options: any) {
			return submitManager.submit(this, name, options);
		};
		/// Create the serializer
		const formDataAppend = (formData: FormData, parentKey: string, value: any) => {
			if (isPlainObject(value)) {
				for (const key in value) {
					const item = value[key];
					let itemKey = parentKey ? `${parentKey}[${key}]` : key;
					formDataAppend(formData, itemKey, item);
				}
			} else if (Array.isArray(value)) {
				for (let i = 0; i < value.length; ++i) {
					const item = value[i];
					let itemKey = parentKey ? `${parentKey}[${i}]` : `${i}`;
					formDataAppend(formData, itemKey, item);
				}
			} else if (value === true) {
				formData.append(parentKey, "1");
			} else if (value === false) {
				formData.append(parentKey, "0");
			} else {
				formData.append(parentKey, value);
			}
		};
		vueSubmit.serializeFormData = (data: any) => {
			const formData = new FormData();
			formDataAppend(formData, null, data);
			return formData;
		};
		return vueSubmit;
	}

	/**
	 * Install the vue application
	 *
	 * @param vue
	 * @param options
	 */
	static install(vue, options: any) {
		if (typeof options === "string") options = { framework: options };

		const submitManager = new SubmitManager(vue, options);
		Object.defineProperty(vue.prototype, "$submit", {
			configurable: true,
			value: this.createSubmitInterface(submitManager)
		});
		Object.defineProperty(vue.prototype, "$submitting", {
			configurable: true,
			get() {
				return this.$data.$submitting;
			}
		});
		Object.defineProperty(vue.prototype, "$submitError", {
			configurable: true,
			get() {
				return this.$data.$submitError;
			}
		});
		vue.mixin({
			data() {
				return {
					$submitting: {},
					$submitError: {}
				};
			}
		});
	}
}
