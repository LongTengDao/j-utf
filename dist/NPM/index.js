﻿'use strict';

var version = '3.1.0';

var hasOwnProperty = Object.prototype.hasOwnProperty;

var undefined$1 = void 0;

var from = (
	/*! j-globals: Buffer.from (fallback) */
	typeof Buffer==='function' && /*#__PURE__*/ hasOwnProperty.call(Buffer, 'from') ? Buffer.from : undefined$1
	/*¡ j-globals: Buffer.from (fallback) */
);

var RegExp_prototype = RegExp.prototype;

var NON_SCALAR = (
	'unicode' in RegExp_prototype
		? RegExp('[\\uD800-\\uDFFF]', 'u')
		: /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/
);

// \u{110000}-\u{FFFFFFFF} -> \uFFFD

function buffer2number (buffer        , startsWithASCII          )         {
	var ucs               ;
	var swapped                    ;
	var length         = buffer.length;
	if ( !length ) { return -1; }
	var firstByte         = buffer[0];
	if ( firstByte===0xEF ) {
		if ( length===1 || buffer[1]!==0xBB ) { return 1; }
		if ( length===2 || buffer[2]!==0xBF ) { return 2; }
	}
	else if ( firstByte===0xFF ) {
		if ( length===1 || buffer[1]!==0xFE ) { return 1; }
		if ( length%2 ) { return length; }
		ucs = 2;
	}
	else if ( firstByte===0xFE ) {
		if ( length===1 || buffer[1]!==0xFF ) { return 1; }
		if ( length%2 ) { return length; }
		ucs = 2;
		swapped = buffer.swap16();
	}
	else if ( startsWithASCII ) {
		if ( firstByte===0x00 ) {
			if ( length>2 && buffer[2]===0x00 ) { return 2; }
			if ( length%2 ) { return length; }
			ucs = 2;
			swapped = buffer.swap16();
		}
		else if ( length>1 && buffer[1]===0x00 ) {
			if ( length>3 && buffer[3]===0x00 ) { return 3; }
			if ( length%2 ) { return length; }
			ucs = 2;
		}
	}
	var string        ;
	var coded        ;
	if ( ucs ) {
		coded = from(string = buffer.toString('ucs2'), 'ucs2');
		if ( swapped ) {
			coded.swap16();
			buffer.swap16();
		}
	}
	else { coded = from(string = buffer.toString()); }
	var codedLength         = coded.length;
	var index = 0;
	if ( codedLength===length ) {
		for ( ; index<length; ++index ) {
			if ( coded[index]!==buffer[index] ) { return index; }
		}
		return string.search(NON_SCALAR);
	}
	if ( length>codedLength ) { length = codedLength; }
	for ( ; index<length; ++index ) {
		if ( coded[index]!==buffer[index] ) { return index; }
	}
	return index;
}

function buffer2string (buffer        , options          )         {
	
	var length         = buffer.length;
	if ( !length ) { return ''; }
	
	var encoding                    ;
	var swapped                    ;
	
	
	
	var throwError          = !options || options.throwError!==false;
	
	var firstByte         = buffer[0];
	if ( firstByte===0xEF ) {
		if ( length>2 && buffer[1]===0xBB && buffer[2]===0xBF ) {
			if ( !options || options.stripBOM!==false ) { buffer = buffer.slice(3); }
			
			
		}
		else {
			if ( throwError ) { throw Error('残破的 UTF-8 BOM 头'); }
			
			
		}
	}
	else if ( firstByte===0xFF ) {
		if ( length>1 && buffer[1]===0xFE ) {
			if ( throwError && length%2 ) { throw Error('UTF-16 的字节数必须为 2 的倍数'); }
			if ( !options || options.stripBOM!==false ) { buffer = buffer.slice(2); }
			encoding = 'ucs2';
			
			
		}
		else {
			if ( throwError ) { throw Error('残破的 UTF-16LE BOM 头'); }
			
			
		}
	}
	else if ( firstByte===0xFE ) {
		if ( length>1 && buffer[1]===0xFF ) {
			if ( throwError && length%2 ) { throw Error('UTF-16 的字节数必须为 2 的倍数'); }
			buffer.swap16();
			if ( options ) {
				if ( !options.swappable ) { swapped = buffer; }
				if ( options.stripBOM!==false ) { buffer = buffer.slice(2); }
			}
			else {
				swapped = buffer;
				buffer = buffer.slice(2);
			}
			encoding = 'ucs2';
			
			
		}
		else {
			if ( throwError ) { throw Error('残破的 UTF-16BE BOM 头'); }
			
			
		}
	}
	else if ( options && options.startsWithASCII ) {
		if ( firstByte===0x00 ) {
			if ( throwError ) {
				if ( length>2 && buffer[2]===0x00 ) { throw Error('暂不支持 UTF-32 编码'); }
				if ( length%2 ) { throw Error('UTF-16 的字节数必须为 2 的倍数'); }
			}
			buffer.swap16();
			if ( !options.swappable ) { swapped = buffer; }
			encoding = 'ucs2';
			
		}
		else if ( length>1 && buffer[1]===0x00 ) {
			if ( throwError ) {
				if ( length>3 && buffer[3]===0x00 ) { throw Error('暂不支持 UTF-32 编码'); }
				if ( length%2 ) { throw Error('UTF-16 的字节数必须为 2 的倍数'); }
			}
			encoding = 'ucs2';
			
		}
		
		
		
		
	}
	
	
	
	
	
	var string         = encoding ? buffer.toString(encoding) : buffer.toString();
	if ( throwError ) {
		if ( from(string, encoding).equals(buffer) ) {
			swapped && swapped.swap16();
			if ( NON_SCALAR.test(string) ) { throw Error('代理对码点不能单独出现'); }
		}
		else {
			swapped && swapped.swap16();
			throw Error('文件中存在超出 Unicode 表示范围的内容');
		}
	}
	else { swapped && swapped.swap16(); }
	return string;
	
}

function buffer2object (buffer        , options          )                                                                          {
	
	var length         = buffer.length;
	if ( !length ) { return { BOM: '', UTF: '', string: '' }; }
	
	var encoding                    ;
	var swapped                    ;
	var BOM               ;
	var UTF                            ;
	
	var throwError          = !options || options.throwError!==false;
	
	var firstByte         = buffer[0];
	if ( firstByte===0xEF ) {
		if ( length>2 && buffer[1]===0xBB && buffer[2]===0xBF ) {
			if ( !options || options.stripBOM!==false ) { buffer = buffer.slice(3); }
			BOM = '\uFEFF';
			UTF = '8';
		}
		else {
			if ( throwError ) { throw Error('残破的 UTF-8 BOM 头'); }
			BOM = '';
			UTF = '';
		}
	}
	else if ( firstByte===0xFF ) {
		if ( length>1 && buffer[1]===0xFE ) {
			if ( throwError && length%2 ) { throw Error('UTF-16 的字节数必须为 2 的倍数'); }
			if ( !options || options.stripBOM!==false ) { buffer = buffer.slice(2); }
			encoding = 'ucs2';
			BOM = '\uFEFF';
			UTF = '16LE';
		}
		else {
			if ( throwError ) { throw Error('残破的 UTF-16LE BOM 头'); }
			BOM = '';
			UTF = '';
		}
	}
	else if ( firstByte===0xFE ) {
		if ( length>1 && buffer[1]===0xFF ) {
			if ( throwError && length%2 ) { throw Error('UTF-16 的字节数必须为 2 的倍数'); }
			buffer.swap16();
			if ( options ) {
				if ( !options.swappable ) { swapped = buffer; }
				if ( options.stripBOM!==false ) { buffer = buffer.slice(2); }
			}
			else {
				swapped = buffer;
				buffer = buffer.slice(2);
			}
			encoding = 'ucs2';
			BOM = '\uFEFF';
			UTF = '16BE';
		}
		else {
			if ( throwError ) { throw Error('残破的 UTF-16BE BOM 头'); }
			BOM = '';
			UTF = '';
		}
	}
	else if ( options && options.startsWithASCII ) {
		if ( firstByte===0x00 ) {
			if ( throwError ) {
				if ( length>2 && buffer[2]===0x00 ) { throw Error('暂不支持 UTF-32 编码'); }
				if ( length%2 ) { throw Error('UTF-16 的字节数必须为 2 的倍数'); }
			}
			buffer.swap16();
			if ( !options.swappable ) { swapped = buffer; }
			encoding = 'ucs2';
			UTF = '16BE';
		}
		else if ( length>1 && buffer[1]===0x00 ) {
			if ( throwError ) {
				if ( length>3 && buffer[3]===0x00 ) { throw Error('暂不支持 UTF-32 编码'); }
				if ( length%2 ) { throw Error('UTF-16 的字节数必须为 2 的倍数'); }
			}
			encoding = 'ucs2';
			UTF = '16LE';
		}
		else {
			UTF = '8';
		}
		BOM = '';
	}
	else {
		BOM = '';
		UTF = '';
	}
	
	var string         = encoding ? buffer.toString(encoding) : buffer.toString();
	if ( throwError ) {
		if ( from(string, encoding).equals(buffer) ) {
			swapped && swapped.swap16();
			if ( NON_SCALAR.test(string) ) { throw Error('代理对码点不能单独出现'); }
		}
		else {
			swapped && swapped.swap16();
			throw Error('文件中存在超出 Unicode 表示范围的内容');
		}
	}
	else { swapped && swapped.swap16(); }
	return { BOM, UTF, string };
	
}

var POINTS =
	'dotAll' in RegExp_prototype && 'unicode' in RegExp_prototype ? RegExp('.', 'gsu') :
		'bind' in RegExp ? RegExp('[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[^]/', 'g') :
			/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S]/g;

var POINTS_CRLF =
	'dotAll' in RegExp_prototype && 'unicode' in RegExp_prototype ? RegExp('\\r\\n|.', 'gsu') :
		'bind' in RegExp ? RegExp('\\r\\n|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[^]/', 'g') :
			/\r\n|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S]/g;

function string2array (string        , crlf          )           {
	return string ? string.match(crlf ? POINTS_CRLF : POINTS)  : [];
}

var _export = (
	/*#__PURE__*/
	function (UTF) { return UTF['default'] = UTF; }({
		version: version,
		buffer2number: buffer2number,
		buffer2object: buffer2object,
		buffer2string: buffer2string,
		string2array: string2array,
		NON_SCALAR: NON_SCALAR,
		'default': {}                                
	})
);

module.exports = _export;

//# sourceMappingURL=index.js.map