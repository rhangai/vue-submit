import { VueSubmit, VueSubmitPluginOptions } from "../src";
import { createLocalVue, mount, Wrapper } from "@vue/test-utils";
import Vue, { VueConstructor } from "vue";

type CreateVueOptions<V extends Vue> = VueSubmitPluginOptions & {
	setup?: (v: VueConstructor<Vue>) => unknown;
};
type CreateWrapperOptions<V extends Vue> = CreateVueOptions<V> & {
	component?: (v: VueConstructor<Vue>) => VueConstructor<V>;
};

type CreateWrapperResult<V extends Vue> = {
	wrapper: Wrapper<V>;
	vue: VueConstructor;
	mocks: {
		axios: jest.Mock;
		confirmation: jest.Mock;
		notify: jest.Mock;
	};
};

function createVue(options?: CreateVueOptions<Vue>) {
	const mocks = {
		axios: jest.fn(_ => ({ data: {} })),
		confirmation: jest.fn((a, b) => true),
		notify: jest.fn((a, b) => {}),
	};
	options = {
		...mocks,
		...options,
	};
	const vue = createLocalVue();
	vue.use(VueSubmit, options);
	options.setup?.(vue);
	return { vue, mocks };
}

export function createWrapper<V extends Vue>(
	options?: CreateWrapperOptions<V>
): CreateWrapperResult<V> {
	const { vue, mocks } = createVue(options);
	const component =
		options?.component?.(vue) ??
		vue.extend({
			template: "<div />",
		});
	const wrapper = mount(component, { localVue: vue });
	return { wrapper: wrapper as any, vue, mocks };
}
