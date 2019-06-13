export function isPlainObject(obj: any): obj is Object {
	return Object.prototype.toString.call(obj) === '[object Object]';

}