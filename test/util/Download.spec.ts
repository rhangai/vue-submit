import { createWrapper } from "../lib";
import fileDownload from "js-file-download";

jest.mock("js-file-download", () => {
	return jest.fn((data, filename) => {});
});

describe("Download", () => {
	it("should do basic downloads", async () => {
		const blobFile = new Blob(["file"], { type: "text/plain" });
		const axios = jest.fn(() => {
			return {
				headers: {
					"content-disposition": "filename=file.txt",
				},
				data: blobFile,
			};
		});
		const { wrapper } = createWrapper({ axios: axios as any });
		await wrapper.vm.$submit("form", {
			download: true,
		});

		const mockFileDownload: jest.Mock = fileDownload as any;
		expect(mockFileDownload.mock.calls[0]).toEqual([blobFile, "file.txt"]);
	});

	it("should save with filename", async () => {
		const myFilename = "my-filename";
		const blobFile = new Blob(["file"], { type: "text/plain" });
		const axios = jest.fn(() => {
			return {
				headers: {
					"content-disposition": "filename=file.txt",
				},
				data: blobFile,
			};
		});
		const { wrapper } = createWrapper({ axios: axios as any });
		await wrapper.vm.$submit("form", {
			download: myFilename,
		});
		const mockFileDownload: jest.Mock = fileDownload as any;
		expect(mockFileDownload.mock.calls[0]).toEqual([blobFile, myFilename]);
	});

	it("should save with forced", async () => {
		const myFilename = "my-filename";
		const blobFile = new Blob(["file"], { type: "text/plain" });
		const axios = jest.fn(() => ({ data: blobFile }));
		const { wrapper } = createWrapper({ axios: axios as any });
		await wrapper.vm.$submit("form", {
			download: { force: true, filename: myFilename },
		});
		const mockFileDownload: jest.Mock = fileDownload as any;
		expect(mockFileDownload.mock.calls[0]).toEqual([blobFile, myFilename]);
	});

	it("should throw on invalid options", async () => {
		const invalidDownloadOptions = [100, []];
		for (const options of invalidDownloadOptions) {
			const blobFile = new Blob(["file"], { type: "text/plain" });
			const axios = jest.fn(() => {
				return {
					headers: {
						"content-disposition": "filename=file.txt",
					},
					data: blobFile,
				};
			});
			const { wrapper } = createWrapper({ axios: axios as any });
			const promiseSubmit = wrapper.vm.$submit("form", {
				download: options as any,
			});
			await expect(promiseSubmit).rejects.toBeInstanceOf(Error);
		}
	});

	it("should throw on invalid content disposition", async () => {
		const blobFile = new Blob(["file"], { type: "text/plain" });
		const axios = jest.fn(() => ({ data: blobFile }));
		const { wrapper } = createWrapper({ axios: axios as any });
		const promiseSubmit = wrapper.vm.$submit("form", {
			download: true,
		});
		await expect(promiseSubmit).rejects.toBeInstanceOf(Error);
	});

	it("should throw on invalid filename with force", async () => {
		const blobFile = new Blob(["file"], { type: "text/plain" });
		const axios = jest.fn(() => ({ data: blobFile }));
		const { wrapper } = createWrapper({ axios: axios as any });
		const promiseSubmit = wrapper.vm.$submit("form", {
			download: { force: true, filename: "" },
		});

		await expect(promiseSubmit).rejects.toBeInstanceOf(Error);
	});
});
