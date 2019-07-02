import version from './version?text';
import buffer2number from './buffer2number';
import buffer2string from './buffer2string';
import buffer2object from './buffer2object';
import string2array from './string2array';
import NON_SCALAR from './NON_SCALAR';

export {
	version,
	buffer2number,
	buffer2object,
	buffer2string,
	string2array,
	NON_SCALAR,
};

export default (
	/*#__PURE__*/
	function (UTF) { return UTF['default'] = UTF; }({
		version: version,
		buffer2number: buffer2number,
		buffer2object: buffer2object,
		buffer2string: buffer2string,
		string2array: string2array,
		NON_SCALAR: NON_SCALAR,
		'default': {} as typeof import('./default.d')
	})
);
