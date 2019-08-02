/*!
 * 模块名称：j-utf
 * 模块功能：UTF 相关共享实用程序。从属于“简计划”。
   　　　　　UTF util. Belong to "Plan J".
 * 模块版本：3.2.0
 * 许可条款：LGPL-3.0
 * 所属作者：龙腾道 <LongTengDao@LongTengDao.com> (www.LongTengDao.com)
 * 问题反馈：https://GitHub.com/LongTengDao/j-utf/issues
 * 项目主页：https://GitHub.com/LongTengDao/j-utf/
 */

var version = '3.2.0';

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

var create = Object.create || (
	/*! j-globals: Object.create (polyfill) */
	/*#__PURE__*/ function () {
		var NULL;
		if ( document.domain ) {
			try { dom = new ActiveXObject('htmlfile'); }
			catch (error) { }
		}
		if ( dom ) {
			dom.write('<script><\/script>');
			dom.close();
			NULL = dom.parentWindow.Object.prototype;
		}
		else {
			dom = document.createElement('iframe');
			dom.setAttribute('style', 'display:none !important;_display:none;');//dom.style.display = 'none';
			var parent = document.body || document.documentElement;
			parent.appendChild(dom);
			dom.src = 'javascript:';
			NULL = dom.contentWindow.Object.prototype;
			parent.removeChild(dom);
		}
		var dom = null;
		delete NULL.constructor;
		delete NULL.hasOwnProperty;
		delete NULL.isPrototypeOf;
		delete NULL.propertyIsEnumerable;
		delete NULL.toLocaleString;
		delete NULL.toString;
		delete NULL.valueOf;
		var Null = function () {};
		Null.prototype = NULL;
		var constructor = function () {};
		function __PURE__ (o, properties) {
			if ( properties!==undefined$1 ) { throw TypeError('CAN NOT defineProperties in ES 3 Object.create polyfill'); }
			if ( o===null ) { return new Null; }
			if ( typeof o!=='object' && typeof o!=='function' ) { throw TypeError('Object prototype may only be an Object or null: '+o); }
			constructor.prototype = o;
			var created = new constructor;
			constructor.prototype = NULL;
			return created;
		}
		return function create (o, properties) {
			return /*#__PURE__*/ __PURE__(o, properties);
		};
	}()
	/*¡ j-globals: Object.create (polyfill) */
);

var assign = Object.assign;

var toStringTag = typeof Symbol!=='undefined' ? Symbol.toStringTag : undefined;

var defineProperty = Object.defineProperty;

var freeze = Object.freeze;

var seal = Object.seal;

var Default = (
	/*! j-globals: default (internal) */
	function Default (exports, addOnOrigin) {
		return /*#__PURE__*/ function Module (exports, addOnOrigin) {
			if ( !addOnOrigin ) { addOnOrigin = exports; exports = create(null); }
			if ( assign ) { assign(exports, addOnOrigin); }
			else {
				for ( var key in addOnOrigin ) { if ( hasOwnProperty.call(addOnOrigin, key) ) { exports[key] = addOnOrigin[key]; } }
				if ( !{ 'toString': null }.propertyIsEnumerable('toString') ) {
					var keys = [ 'constructor', 'propertyIsEnumerable', 'isPrototypeOf', 'hasOwnProperty', 'valueOf', 'toLocaleString', 'toString' ];
					while ( key = keys.pop() ) { if ( hasOwnProperty.call(addOnOrigin, key) ) { exports[key] = addOnOrigin[key]; } }
				}
			}
			exports['default'] = exports;
			if ( seal ) {
				typeof exports==='function' && exports.prototype && seal(exports.prototype);
				if ( toStringTag ) {
					var descriptor = create(null);
					descriptor.value = 'Module';
					defineProperty(exports, toStringTag, descriptor);
				}
				freeze(exports);
			}
			return exports;
		}(exports, addOnOrigin);
	}
	/*¡ j-globals: default (internal) */
);

var _export = Default({
	version: version,
	buffer2number: buffer2number,
	buffer2object: buffer2object,
	buffer2string: buffer2string,
	string2array: string2array,
	NON_SCALAR: NON_SCALAR
});

export default _export;
export { NON_SCALAR, buffer2number, buffer2object, buffer2string, string2array, version };

/*¡ j-utf */

//# sourceMappingURL=index.mjs.map