import { VueSubmitSerializeFormDataInput } from "../../types/vue-submit";

function serializeFormDataImpl(
	formData: FormData,
	property: string,
	input: VueSubmitSerializeFormDataInput
) {
	if (input == null) return;
	if (Array.isArray(input)) {
		input.forEach((v, i) => {
			serializeFormDataImpl(formData, `${property}[]`, v);
		});
	} else if (input instanceof File) {
		formData.append(property, input);
	} else if (typeof input === "number" || typeof input === "string") {
		formData.append(property, `${input}`);
	} else if (typeof input === "object") {
		for (const key in input) {
			serializeFormDataImpl(formData, `${property}[${key}]`, input[key]);
		}
	}
}

export function serializeFormData(
	input: Record<string, VueSubmitSerializeFormDataInput>
): FormData {
	const formData = new FormData();
	for (const key in input) {
		serializeFormDataImpl(formData, key, input[key]);
	}
	return formData;
}
