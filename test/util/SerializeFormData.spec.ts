import { createWrapper } from "../lib";

describe("serializeFormData", () => {
	it("should get form data", () => {
		const { wrapper } = createWrapper();

		const file = new File([], "test-file");
		const formData = wrapper.vm.$submit.serializeFormData({
			a: 12345,
			b: "string",
			file,
			nested: {
				child: "child",
			},
			array: [1, "string", file],
			skip: null,
		});
		expect(formData.get("a")).toBe("12345");
		expect(formData.get("b")).toBe("string");
		expect(formData.get("nested")).toBeNull();
		expect(formData.get("nested[child]")).toBe("child");
		expect(formData.get("file")).toBe(file);
		expect(formData.getAll("array[]")).toEqual(["1", "string", file]);
		expect(formData.get("skip")).toBeNull();
	});
});
