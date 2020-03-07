import { VueSubmitSerializeFormDataInput } from "../../types/vue-submit";

function serializeFormDataImpl(
	formData: FormData,
	propertyPath: string[],
	input: VueSubmitSerializeFormDataInput
) {}

export function serializeFormData(
	input: Record<string, VueSubmitSerializeFormDataInput>
): FormData {
	const formData = new FormData();
	serializeFormDataImpl(formData, [], input);
	return formData;
}
