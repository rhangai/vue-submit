export class ValidatorError extends Error {
	constructor( msg: string = "" ) {
		super( msg );
		if ( Object.setPrototypeOf ) Object.setPrototypeOf(this, new.target.prototype);
		else this.__proto__ = new.target.prototype;
	}
	private __proto__: any;
};