import { createWrapper } from "./util";

describe("VueSubmit", () => {
	it("should setup properly", () => {
		const { wrapper } = createWrapper();
		expect(wrapper.vm).toHaveProperty("$submit");
		expect(wrapper.vm.$submit).toBeInstanceOf(Function);
		expect(wrapper.vm.$submit).toHaveProperty("serializeFormData");
	});

	it("should submit", async () => {
		const { wrapper, mocks } = createWrapper({
			component: v =>
				v.extend({
					template: "<div />",
					data: () => ({ requested: false }),
					methods: {
						submit() {
							return this.$submit("form", {
								data: 100,
								confirmation: "test-confirmation",
								success: () => ({ message: "test-notify" }),
							});
						},
					},
				}),
		});
		await wrapper.vm.submit();
		expect(mocks.axios).toHaveBeenCalledWith({ method: "post", data: 100 });
		expect(mocks.confirmation.mock.calls[0][1]).toMatchObject({
			message: "test-confirmation",
		});
		expect(mocks.notify.mock.calls[0][1]).toMatchObject({
			notification: { message: "test-notify" },
		});
	});
});
