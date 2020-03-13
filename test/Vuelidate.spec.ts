import { createWrapper } from "./lib";
import { required } from "vuelidate/lib/validators";
import Vuelidate from "vuelidate";

describe("VueSubmit + Vuelidate", () => {
	it("should setup properly", () => {
		const { wrapper } = createWrapper({
			setup: v => v.use(Vuelidate),
			component: v =>
				v.extend({
					template: `<div />`,
					validations: {
						value: { required },
					},
					data: () => ({ value: null }),
				}),
		});
		expect(wrapper.vm).toHaveProperty("$v");
		expect(wrapper.vm.$v).toHaveProperty("value");
	});

	it("should submit", async () => {
		const { wrapper, mocks } = createWrapper({
			setup: v => v.use(Vuelidate),
			component: v =>
				v.extend({
					template: `<div />`,
					validations: {
						value: { required },
						test: { required },
					},
					data: () => ({ value: null as number | null, test: 999 }),
				}),
		});

		expect(wrapper.vm.$v.value?.$dirty).toBe(false);
		expect(wrapper.vm.$v.value?.$invalid).toBe(true);
		expect(wrapper.vm.$v.value?.$error).toBe(false);
		expect(wrapper.vm.$v.test?.$dirty).toBe(false);
		expect(wrapper.vm.$v.test?.$invalid).toBe(false);
		expect(wrapper.vm.$v.test?.$error).toBe(false);
		wrapper.vm.value = 100;
		await wrapper.vm.$submit("form", {
			validator: wrapper.vm.$v,
		});
		expect(mocks.axios).toHaveBeenCalled();
		expect(wrapper.vm.$v.value?.$dirty).toBe(true);
		expect(wrapper.vm.$v.value?.$invalid).toBe(false);
		expect(wrapper.vm.$v.value?.$error).toBe(false);
		expect(wrapper.vm.$v.test?.$dirty).toBe(true);
		expect(wrapper.vm.$v.test?.$invalid).toBe(false);
		expect(wrapper.vm.$v.test?.$error).toBe(false);
	});

	it("should do async validations", async () => {
		const { wrapper } = createWrapper({
			setup: v => v.use(Vuelidate),
			component: v =>
				v.extend({
					template: `<div />`,
					validations: {
						promise: {
							required: (async () => {
								return new Promise(resolve =>
									setTimeout(() => resolve(true), 100)
								);
							}) as any,
						},
					},
					data: () => ({ promise: 0 }),
				}),
		});

		wrapper.vm.promise += 1;
		expect(wrapper.vm.$v.promise?.$pending).toBe(true);
		await wrapper.vm.$submit("form", {
			validator: [wrapper.vm.$v],
		});
		expect(wrapper.vm.$v.promise?.$dirty).toBe(true);
		expect(wrapper.vm.$v.promise?.$invalid).toBe(false);
		expect(wrapper.vm.$v.promise?.$error).toBe(false);
		expect(wrapper.vm.$v.promise?.$pending).toBe(false);
	});

	it("should do mixed validations", async () => {
		const { wrapper } = createWrapper({
			setup: v => v.use(Vuelidate),
			component: v =>
				v.extend({
					template: `<div />`,
					validations: {
						childA: { name: { required } },
						childB: { name: { required } },
						childC: { name: { required } },
					},
					data: () => ({
						childA: { name: "john" },
						childB: {},
						childC: { name: "mary" },
					}),
				}),
		});

		const mockValidator = jest.fn(() => true);
		const mockAsyncValidator = jest.fn(() => {
			return new Promise(resolve => setTimeout(() => resolve(true), 100));
		});
		await wrapper.vm.$submit("form", {
			validator: [
				wrapper.vm.$v.childA,
				wrapper.vm.$v.childC,
				true,
				mockValidator,
				mockAsyncValidator,
			],
		});
		expect(wrapper.vm.$v.childA?.$dirty).toBe(true);
		expect(wrapper.vm.$v.childB?.$dirty).toBe(false);
		expect(wrapper.vm.$v.childC?.$dirty).toBe(true);
		expect(mockValidator).toBeCalledTimes(1);
		expect(mockAsyncValidator).toBeCalledTimes(1);
	});

	it("should reject invalid validators", async () => {
		const validValidators = [true, () => true];
		const invalidValidators = [false, () => false, {}, 100];

		for (const invalid of invalidValidators) {
			const { wrapper } = createWrapper({
				setup: v => v.use(Vuelidate),
			});
			const submitPromise = wrapper.vm.$submit("form", {
				validator: [...validValidators, invalid],
			});
			await expect(submitPromise).rejects.toBeInstanceOf(Error);
		}
	});

	it("should reject async validations on component destroy", async () => {
		const { wrapper } = createWrapper({
			setup: v => v.use(Vuelidate),
			component: v =>
				v.extend({
					template: `<div />`,
					validations: {
						promise: {
							required: (async () => {
								return new Promise(resolve =>
									setTimeout(() => resolve(true), 100)
								);
							}) as any,
						},
					},
					data: () => ({ promise: 0 }),
				}),
		});

		wrapper.vm.promise += 1;
		expect(wrapper.vm.$v.promise?.$pending).toBe(true);
		const submitPromise = wrapper.vm.$submit("form", {
			validator: [wrapper.vm.$v],
		});
		wrapper.destroy();
		await expect(submitPromise).rejects.toBeInstanceOf(Error);
	});
});
