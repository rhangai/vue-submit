import { createWrapper } from "./lib";

describe("VueSubmit", () => {
	it("should setup properly", () => {
		const { wrapper } = createWrapper();
		expect(wrapper.vm).toHaveProperty("$submit");
		expect(wrapper.vm.$submit).toBeInstanceOf(Function);
		expect(wrapper.vm.$submit).toHaveProperty("serializeFormData");
	});

	it("should submit", async () => {
		const formName = "form" + Math.random();

		const { wrapper, mocks } = createWrapper({
			component: v =>
				v.extend({
					template: "<div>{{ requested ? 'success' : 'waiting' }}</div>",
					data: () => ({ requested: false }),
					methods: {
						submit() {
							return this.$submit(formName, {
								data: 100,
								confirmation: "test-confirmation",
								success: () => {
									this.requested = true;
									return { message: "test-notify" };
								},
							});
						},
					},
				}),
		});
		expect(wrapper.html()).toBe("<div>waiting</div>");

		// Test wheter the $submitting variable is updated
		expect(wrapper.vm.$submitting[formName]).toBeFalsy();
		const promise = wrapper.vm.submit();
		expect(wrapper.vm.$submitting[formName]).toBeTruthy();
		await promise;

		// Validate the requests
		expect(mocks.axios).toHaveBeenCalledWith({ method: "post", data: 100 });
		expect(mocks.confirmation.mock.calls[0][1]).toMatchObject({
			message: "test-confirmation",
		});
		expect(mocks.notify.mock.calls[0][1]).toMatchObject({
			notification: { message: "test-notify" },
		});
		expect(wrapper.html()).toBe("<div>success</div>");

		// Destroy the wrapper
		wrapper.destroy();
	});
});
