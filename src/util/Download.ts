import * as fileDownload from 'js-file-download';

/**
 * Download a file using an axios instance
 * @param axiosInstance 
 * @param options 
 */
export async function AxiosDownload( axiosInstance: any, options: any ) : Promise<void> {
	options = Object.assign( {}, options, {
		responseType: 'blob',
	});
	const response = await axiosInstance.request( options );

	const contentDispositionFilename = getContentDisposition( response );
	if ( ( contentDispositionFilename === null ) && !options.force ) 
		throw new Error( "Invalid file download" );

	const filename = options.filename || contentDispositionFilename;
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
