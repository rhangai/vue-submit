import * as fileDownload from 'js-file-download';

/// Tipo de opções de download
export type SubmitDownloadOptions = {
	force?: boolean;
	filename: string;
}

/**
 * Download a file using an axios instance
 * @param axiosInstance 
 * @param options 
 */
export async function AxiosDownload( axiosInstance: any, options: any ) : Promise<void> {
	const download: SubmitDownloadOptions = normalizeDownloadOptions( options.download );
	options = Object.assign( {}, options, {
		responseType: 'blob',
	});
	const response = await axiosInstance.request( options );

	const contentDispositionFilename = getContentDisposition( response );
	if ( ( contentDispositionFilename === null ) && !download.force ) 
		throw new Error( "Invalid file download" );

	const filename = download.filename || contentDispositionFilename;
	(<any> fileDownload)( response.data, filename );
}

/**
 * Get the content disposition
 * @param response 
 * @return 
 */
function getContentDisposition( response: any ) : string|null {
	if ( response.headers['content-disposition'] ) {
		const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
		const matches = filenameRegex.exec( response.headers['content-disposition']  );
		if (matches != null && matches[1]) { 
			const filename = matches[1].replace(/['"]/g, '');
			return decodeURIComponent( filename );
		}
	}
	return null;
}

/**
 * Normalize download options
 * 
 * @param downloadOptions The options passed to the download object
 */
function normalizeDownloadOptions(downloadOptions: any): SubmitDownloadOptions {
	if ( typeof(downloadOptions) === 'string' ) {
		return { filename: downloadOptions };
	} else if ( downloadOptions === true ) {
		return { filename: null };
	} else if ( typeof downloadOptions === 'object' ) {
		return downloadOptions;
	}
	throw new Error( "Invalid download options" );
}