
declare module '.Buffer.from?' { export default Buffer.from; }

declare module '.Error' { export default Error; }

declare module '.Object.prototype.hasOwnProperty' { export default Object.prototype.hasOwnProperty; }

declare module '.RegExp' { export default RegExp; }
declare module '.RegExp.prototype' { export default RegExp.prototype;
	export { default as compile } from '.RegExp.prototype.compile';
	export { default as exec } from '.RegExp.prototype.exec';
	export { default as source } from '.RegExp.prototype.source';
	export { default as test } from '.RegExp.prototype.test';
	export { default as toString } from '.RegExp.prototype.toString';
}
declare module '.RegExp.prototype.compile' { export default RegExp.prototype.compile; }
declare module '.RegExp.prototype.exec' { export default RegExp.prototype.exec; }
declare module '.RegExp.prototype.source' { export default RegExp.prototype.source; }
declare module '.RegExp.prototype.test' { export default RegExp.prototype.test; }
declare module '.RegExp.prototype.toString' { export default RegExp.prototype.toString; }

declare module '.undefined' { export default undefined; }
