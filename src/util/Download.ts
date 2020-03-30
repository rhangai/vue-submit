import fileDownload from "js-file-download";
import { VueSubmitOptions, VueSubmitAxiosLike } from "../../types/vue-submit";
import { getAxiosOptions } from "./Axios";

/// Tipo de opções de download
export type SubmitDownloadOptions = {
	force?: boolean;
	filename: string | null;
};

/**
 * Download a file using an axios instance
 * @param axiosInstance
 * @param options
 */
export async function download(
	axiosInstance: VueSubmitAxiosLike,
	options: VueSubmitOptions
): Promise<void> {
	const download: SubmitDownloadOptions = normalizeDownloadOptions(
		options.download!
	);
	// Perform the request using axios
	const axiosOptions = await getAxiosOptions(options, {
		method: "post",
		responseType: "blob",
	});
	const response = await axiosInstance(axiosOptions);

	const contentDispositionFilename = getContentDisposition(response);
	if (contentDispositionFilename === null && !download.force)
		throw new Error("Invalid file download");

	const filename = download.filename || contentDispositionFilename;
	if (!filename) throw new Error(`Invalid filename for download`);
	fileDownload(response.data, filename);
}

/**
 * Get the content disposition
 * @param response
 * @return
 */
function getContentDisposition(response: any): string | null {
	if (response.headers && response.headers["content-disposition"]) {
		const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
		const matches = filenameRegex.exec(response.headers["content-disposition"]);
		if (matches != null && matches[1]) {
			const filename = matches[1].replace(/['"]/g, "");
			return decodeURIComponent(filename);
		}
	}
	return null;
}

/**
 * Normalize download options
 *
 * @param downloadOptions The options passed to the download object
 */
function normalizeDownloadOptions(
	downloadOptions: boolean | string | SubmitDownloadOptions
): SubmitDownloadOptions {
	if (typeof downloadOptions === "string") {
		return { filename: downloadOptions };
	} else if (downloadOptions === true) {
		return { filename: null };
	} else if (typeof downloadOptions === "object") {
		if (Array.isArray(downloadOptions))
			throw new Error("Invalid download options");
		return downloadOptions;
	}
	throw new Error("Invalid download options");
}
