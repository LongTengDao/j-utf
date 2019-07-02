import RegExp from '.RegExp';
import RegExp_prototype from '.RegExp.prototype';

export default (
	'unicode' in RegExp_prototype
		? RegExp('[\\uD800-\\uDFFF]', 'u')
		: /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/
);

// \u{110000}-\u{FFFFFFFF} -> \uFFFD
