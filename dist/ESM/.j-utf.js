﻿/*!
 * 模块名称：j-utf
 * 模块功能：UTF 相关共享实用程序。从属于“简计划”。
   　　　　　UTF util. Belong to "Plan J".
 * 模块版本：3.2.0
 * 许可条款：LGPL-3.0
 * 所属作者：龙腾道 <LongTengDao@LongTengDao.com> (www.LongTengDao.com)
 * 问题反馈：https://GitHub.com/LongTengDao/j-utf/issues
 * 项目主页：https://GitHub.com/LongTengDao/j-utf/
 */

import from from '.Buffer.from?';
import RegExp from '.RegExp';
import RegExp_prototype from '.RegExp.prototype';
import Error from '.Error';
import Default from '.default?=';

var version = '3.2.0';

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcnNpb24/dGV4dCIsIk5PTl9TQ0FMQVIudHMiLCJidWZmZXIybnVtYmVyLnRzIiwiYnVmZmVyMnN0cmluZy50cyIsImJ1ZmZlcjJvYmplY3QudHMiLCJzdHJpbmcyYXJyYXkudHMiLCJleHBvcnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgJzMuMi4wJzsiLCJpbXBvcnQgUmVnRXhwIGZyb20gJy5SZWdFeHAnO1xuaW1wb3J0IFJlZ0V4cF9wcm90b3R5cGUgZnJvbSAnLlJlZ0V4cC5wcm90b3R5cGUnO1xuXG5leHBvcnQgZGVmYXVsdCAoXG5cdCd1bmljb2RlJyBpbiBSZWdFeHBfcHJvdG90eXBlXG5cdFx0PyBSZWdFeHAoJ1tcXFxcdUQ4MDAtXFxcXHVERkZGXScsICd1Jylcblx0XHQ6IC9bXFx1RDgwMC1cXHVEQkZGXSg/IVtcXHVEQzAwLVxcdURGRkZdKXwoPzpbXlxcdUQ4MDAtXFx1REJGRl18XilbXFx1REMwMC1cXHVERkZGXS9cbik7XG5cbi8vIFxcdXsxMTAwMDB9LVxcdXtGRkZGRkZGRn0gLT4gXFx1RkZGRFxuIiwiaW1wb3J0IGZyb20gZnJvbSAnLkJ1ZmZlci5mcm9tPyc7XG5cbmltcG9ydCBOT05fU0NBTEFSIGZyb20gJy4vTk9OX1NDQUxBUic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJ1ZmZlcjJudW1iZXIgKGJ1ZmZlciAgICAgICAgLCBzdGFydHNXaXRoQVNDSUkgICAgICAgICAgKSAgICAgICAgIHtcblx0dmFyIHVjcyAgICAgICAgICAgICAgIDtcblx0dmFyIHN3YXBwZWQgICAgICAgICAgICAgICAgICAgIDtcblx0dmFyIGxlbmd0aCAgICAgICAgID0gYnVmZmVyLmxlbmd0aDtcblx0aWYgKCAhbGVuZ3RoICkgeyByZXR1cm4gLTE7IH1cblx0dmFyIGZpcnN0Qnl0ZSAgICAgICAgID0gYnVmZmVyWzBdO1xuXHRpZiAoIGZpcnN0Qnl0ZT09PTB4RUYgKSB7XG5cdFx0aWYgKCBsZW5ndGg9PT0xIHx8IGJ1ZmZlclsxXSE9PTB4QkIgKSB7IHJldHVybiAxOyB9XG5cdFx0aWYgKCBsZW5ndGg9PT0yIHx8IGJ1ZmZlclsyXSE9PTB4QkYgKSB7IHJldHVybiAyOyB9XG5cdH1cblx0ZWxzZSBpZiAoIGZpcnN0Qnl0ZT09PTB4RkYgKSB7XG5cdFx0aWYgKCBsZW5ndGg9PT0xIHx8IGJ1ZmZlclsxXSE9PTB4RkUgKSB7IHJldHVybiAxOyB9XG5cdFx0aWYgKCBsZW5ndGglMiApIHsgcmV0dXJuIGxlbmd0aDsgfVxuXHRcdHVjcyA9IDI7XG5cdH1cblx0ZWxzZSBpZiAoIGZpcnN0Qnl0ZT09PTB4RkUgKSB7XG5cdFx0aWYgKCBsZW5ndGg9PT0xIHx8IGJ1ZmZlclsxXSE9PTB4RkYgKSB7IHJldHVybiAxOyB9XG5cdFx0aWYgKCBsZW5ndGglMiApIHsgcmV0dXJuIGxlbmd0aDsgfVxuXHRcdHVjcyA9IDI7XG5cdFx0c3dhcHBlZCA9IGJ1ZmZlci5zd2FwMTYoKTtcblx0fVxuXHRlbHNlIGlmICggc3RhcnRzV2l0aEFTQ0lJICkge1xuXHRcdGlmICggZmlyc3RCeXRlPT09MHgwMCApIHtcblx0XHRcdGlmICggbGVuZ3RoPjIgJiYgYnVmZmVyWzJdPT09MHgwMCApIHsgcmV0dXJuIDI7IH1cblx0XHRcdGlmICggbGVuZ3RoJTIgKSB7IHJldHVybiBsZW5ndGg7IH1cblx0XHRcdHVjcyA9IDI7XG5cdFx0XHRzd2FwcGVkID0gYnVmZmVyLnN3YXAxNigpO1xuXHRcdH1cblx0XHRlbHNlIGlmICggbGVuZ3RoPjEgJiYgYnVmZmVyWzFdPT09MHgwMCApIHtcblx0XHRcdGlmICggbGVuZ3RoPjMgJiYgYnVmZmVyWzNdPT09MHgwMCApIHsgcmV0dXJuIDM7IH1cblx0XHRcdGlmICggbGVuZ3RoJTIgKSB7IHJldHVybiBsZW5ndGg7IH1cblx0XHRcdHVjcyA9IDI7XG5cdFx0fVxuXHR9XG5cdHZhciBzdHJpbmcgICAgICAgIDtcblx0dmFyIGNvZGVkICAgICAgICA7XG5cdGlmICggdWNzICkge1xuXHRcdGNvZGVkID0gZnJvbShzdHJpbmcgPSBidWZmZXIudG9TdHJpbmcoJ3VjczInKSwgJ3VjczInKTtcblx0XHRpZiAoIHN3YXBwZWQgKSB7XG5cdFx0XHRjb2RlZC5zd2FwMTYoKTtcblx0XHRcdGJ1ZmZlci5zd2FwMTYoKTtcblx0XHR9XG5cdH1cblx0ZWxzZSB7IGNvZGVkID0gZnJvbShzdHJpbmcgPSBidWZmZXIudG9TdHJpbmcoKSk7IH1cblx0dmFyIGNvZGVkTGVuZ3RoICAgICAgICAgPSBjb2RlZC5sZW5ndGg7XG5cdHZhciBpbmRleCA9IDA7XG5cdGlmICggY29kZWRMZW5ndGg9PT1sZW5ndGggKSB7XG5cdFx0Zm9yICggOyBpbmRleDxsZW5ndGg7ICsraW5kZXggKSB7XG5cdFx0XHRpZiAoIGNvZGVkW2luZGV4XSE9PWJ1ZmZlcltpbmRleF0gKSB7IHJldHVybiBpbmRleDsgfVxuXHRcdH1cblx0XHRyZXR1cm4gc3RyaW5nLnNlYXJjaChOT05fU0NBTEFSKTtcblx0fVxuXHRpZiAoIGxlbmd0aD5jb2RlZExlbmd0aCApIHsgbGVuZ3RoID0gY29kZWRMZW5ndGg7IH1cblx0Zm9yICggOyBpbmRleDxsZW5ndGg7ICsraW5kZXggKSB7XG5cdFx0aWYgKCBjb2RlZFtpbmRleF0hPT1idWZmZXJbaW5kZXhdICkgeyByZXR1cm4gaW5kZXg7IH1cblx0fVxuXHRyZXR1cm4gaW5kZXg7XG59O1xuIiwiaW1wb3J0IEVycm9yIGZyb20gJy5FcnJvcic7XG5pbXBvcnQgZnJvbSBmcm9tICcuQnVmZmVyLmZyb20/JztcblxuaW1wb3J0IE5PTl9TQ0FMQVIgZnJvbSAnLi9OT05fU0NBTEFSJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYnVmZmVyMnN0cmluZyAoYnVmZmVyICAgICAgICAsIG9wdGlvbnMgICAgICAgICAgKSAgICAgICAgIHtcblx0XG5cdHZhciBsZW5ndGggICAgICAgICA9IGJ1ZmZlci5sZW5ndGg7XG5cdGlmICggIWxlbmd0aCApIHsgcmV0dXJuICcnOyB9XG5cdFxuXHR2YXIgZW5jb2RpbmcgICAgICAgICAgICAgICAgICAgIDtcblx0dmFyIHN3YXBwZWQgICAgICAgICAgICAgICAgICAgIDtcblx0XG5cdFxuXHRcblx0dmFyIHRocm93RXJyb3IgICAgICAgICAgPSAhb3B0aW9ucyB8fCBvcHRpb25zLnRocm93RXJyb3IhPT1mYWxzZTtcblx0XG5cdHZhciBmaXJzdEJ5dGUgICAgICAgICA9IGJ1ZmZlclswXTtcblx0aWYgKCBmaXJzdEJ5dGU9PT0weEVGICkge1xuXHRcdGlmICggbGVuZ3RoPjIgJiYgYnVmZmVyWzFdPT09MHhCQiAmJiBidWZmZXJbMl09PT0weEJGICkge1xuXHRcdFx0aWYgKCAhb3B0aW9ucyB8fCBvcHRpb25zLnN0cmlwQk9NIT09ZmFsc2UgKSB7IGJ1ZmZlciA9IGJ1ZmZlci5zbGljZSgzKTsgfVxuXHRcdFx0XG5cdFx0XHRcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAoIHRocm93RXJyb3IgKSB7IHRocm93IEVycm9yKCfmrovnoLTnmoQgVVRGLTggQk9NIOWktCcpOyB9XG5cdFx0XHRcblx0XHRcdFxuXHRcdH1cblx0fVxuXHRlbHNlIGlmICggZmlyc3RCeXRlPT09MHhGRiApIHtcblx0XHRpZiAoIGxlbmd0aD4xICYmIGJ1ZmZlclsxXT09PTB4RkUgKSB7XG5cdFx0XHRpZiAoIHRocm93RXJyb3IgJiYgbGVuZ3RoJTIgKSB7IHRocm93IEVycm9yKCdVVEYtMTYg55qE5a2X6IqC5pWw5b+F6aG75Li6IDIg55qE5YCN5pWwJyk7IH1cblx0XHRcdGlmICggIW9wdGlvbnMgfHwgb3B0aW9ucy5zdHJpcEJPTSE9PWZhbHNlICkgeyBidWZmZXIgPSBidWZmZXIuc2xpY2UoMik7IH1cblx0XHRcdGVuY29kaW5nID0gJ3VjczInO1xuXHRcdFx0XG5cdFx0XHRcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAoIHRocm93RXJyb3IgKSB7IHRocm93IEVycm9yKCfmrovnoLTnmoQgVVRGLTE2TEUgQk9NIOWktCcpOyB9XG5cdFx0XHRcblx0XHRcdFxuXHRcdH1cblx0fVxuXHRlbHNlIGlmICggZmlyc3RCeXRlPT09MHhGRSApIHtcblx0XHRpZiAoIGxlbmd0aD4xICYmIGJ1ZmZlclsxXT09PTB4RkYgKSB7XG5cdFx0XHRpZiAoIHRocm93RXJyb3IgJiYgbGVuZ3RoJTIgKSB7IHRocm93IEVycm9yKCdVVEYtMTYg55qE5a2X6IqC5pWw5b+F6aG75Li6IDIg55qE5YCN5pWwJyk7IH1cblx0XHRcdGJ1ZmZlci5zd2FwMTYoKTtcblx0XHRcdGlmICggb3B0aW9ucyApIHtcblx0XHRcdFx0aWYgKCAhb3B0aW9ucy5zd2FwcGFibGUgKSB7IHN3YXBwZWQgPSBidWZmZXI7IH1cblx0XHRcdFx0aWYgKCBvcHRpb25zLnN0cmlwQk9NIT09ZmFsc2UgKSB7IGJ1ZmZlciA9IGJ1ZmZlci5zbGljZSgyKTsgfVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHN3YXBwZWQgPSBidWZmZXI7XG5cdFx0XHRcdGJ1ZmZlciA9IGJ1ZmZlci5zbGljZSgyKTtcblx0XHRcdH1cblx0XHRcdGVuY29kaW5nID0gJ3VjczInO1xuXHRcdFx0XG5cdFx0XHRcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAoIHRocm93RXJyb3IgKSB7IHRocm93IEVycm9yKCfmrovnoLTnmoQgVVRGLTE2QkUgQk9NIOWktCcpOyB9XG5cdFx0XHRcblx0XHRcdFxuXHRcdH1cblx0fVxuXHRlbHNlIGlmICggb3B0aW9ucyAmJiBvcHRpb25zLnN0YXJ0c1dpdGhBU0NJSSApIHtcblx0XHRpZiAoIGZpcnN0Qnl0ZT09PTB4MDAgKSB7XG5cdFx0XHRpZiAoIHRocm93RXJyb3IgKSB7XG5cdFx0XHRcdGlmICggbGVuZ3RoPjIgJiYgYnVmZmVyWzJdPT09MHgwMCApIHsgdGhyb3cgRXJyb3IoJ+aaguS4jeaUr+aMgSBVVEYtMzIg57yW56CBJyk7IH1cblx0XHRcdFx0aWYgKCBsZW5ndGglMiApIHsgdGhyb3cgRXJyb3IoJ1VURi0xNiDnmoTlrZfoioLmlbDlv4XpobvkuLogMiDnmoTlgI3mlbAnKTsgfVxuXHRcdFx0fVxuXHRcdFx0YnVmZmVyLnN3YXAxNigpO1xuXHRcdFx0aWYgKCAhb3B0aW9ucy5zd2FwcGFibGUgKSB7IHN3YXBwZWQgPSBidWZmZXI7IH1cblx0XHRcdGVuY29kaW5nID0gJ3VjczInO1xuXHRcdFx0XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCBsZW5ndGg+MSAmJiBidWZmZXJbMV09PT0weDAwICkge1xuXHRcdFx0aWYgKCB0aHJvd0Vycm9yICkge1xuXHRcdFx0XHRpZiAoIGxlbmd0aD4zICYmIGJ1ZmZlclszXT09PTB4MDAgKSB7IHRocm93IEVycm9yKCfmmoLkuI3mlK/mjIEgVVRGLTMyIOe8lueggScpOyB9XG5cdFx0XHRcdGlmICggbGVuZ3RoJTIgKSB7IHRocm93IEVycm9yKCdVVEYtMTYg55qE5a2X6IqC5pWw5b+F6aG75Li6IDIg55qE5YCN5pWwJyk7IH1cblx0XHRcdH1cblx0XHRcdGVuY29kaW5nID0gJ3VjczInO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdFxuXHRcdFxuXHRcdFxuXHR9XG5cdFxuXHRcblx0XG5cdFxuXHRcblx0dmFyIHN0cmluZyAgICAgICAgID0gZW5jb2RpbmcgPyBidWZmZXIudG9TdHJpbmcoZW5jb2RpbmcpIDogYnVmZmVyLnRvU3RyaW5nKCk7XG5cdGlmICggdGhyb3dFcnJvciApIHtcblx0XHRpZiAoIGZyb20oc3RyaW5nLCBlbmNvZGluZykuZXF1YWxzKGJ1ZmZlcikgKSB7XG5cdFx0XHRzd2FwcGVkICYmIHN3YXBwZWQuc3dhcDE2KCk7XG5cdFx0XHRpZiAoIE5PTl9TQ0FMQVIudGVzdChzdHJpbmcpICkgeyB0aHJvdyBFcnJvcign5Luj55CG5a+556CB54K55LiN6IO95Y2V54us5Ye6546wJyk7IH1cblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRzd2FwcGVkICYmIHN3YXBwZWQuc3dhcDE2KCk7XG5cdFx0XHR0aHJvdyBFcnJvcign5paH5Lu25Lit5a2Y5Zyo6LaF5Ye6IFVuaWNvZGUg6KGo56S66IyD5Zu055qE5YaF5a65Jyk7XG5cdFx0fVxuXHR9XG5cdGVsc2UgeyBzd2FwcGVkICYmIHN3YXBwZWQuc3dhcDE2KCk7IH1cblx0cmV0dXJuIHN0cmluZztcblx0XG59O1xuXG4gICAgICAgICAgICAgICAgXG5cdCAgICAgICAgICAgICAgICAgICAgXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICBcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIFxuIiwiaW1wb3J0IEVycm9yIGZyb20gJy5FcnJvcic7XG5pbXBvcnQgZnJvbSBmcm9tICcuQnVmZmVyLmZyb20/JztcblxuaW1wb3J0IE5PTl9TQ0FMQVIgZnJvbSAnLi9OT05fU0NBTEFSJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYnVmZmVyMm9iamVjdCAoYnVmZmVyICAgICAgICAsIG9wdGlvbnMgICAgICAgICAgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuXHRcblx0dmFyIGxlbmd0aCAgICAgICAgID0gYnVmZmVyLmxlbmd0aDtcblx0aWYgKCAhbGVuZ3RoICkgeyByZXR1cm4geyBCT006ICcnLCBVVEY6ICcnLCBzdHJpbmc6ICcnIH07IH1cblx0XG5cdHZhciBlbmNvZGluZyAgICAgICAgICAgICAgICAgICAgO1xuXHR2YXIgc3dhcHBlZCAgICAgICAgICAgICAgICAgICAgO1xuXHR2YXIgQk9NICAgICAgICAgICAgICAgO1xuXHR2YXIgVVRGICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtcblx0XG5cdHZhciB0aHJvd0Vycm9yICAgICAgICAgID0gIW9wdGlvbnMgfHwgb3B0aW9ucy50aHJvd0Vycm9yIT09ZmFsc2U7XG5cdFxuXHR2YXIgZmlyc3RCeXRlICAgICAgICAgPSBidWZmZXJbMF07XG5cdGlmICggZmlyc3RCeXRlPT09MHhFRiApIHtcblx0XHRpZiAoIGxlbmd0aD4yICYmIGJ1ZmZlclsxXT09PTB4QkIgJiYgYnVmZmVyWzJdPT09MHhCRiApIHtcblx0XHRcdGlmICggIW9wdGlvbnMgfHwgb3B0aW9ucy5zdHJpcEJPTSE9PWZhbHNlICkgeyBidWZmZXIgPSBidWZmZXIuc2xpY2UoMyk7IH1cblx0XHRcdEJPTSA9ICdcXHVGRUZGJztcblx0XHRcdFVURiA9ICc4Jztcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAoIHRocm93RXJyb3IgKSB7IHRocm93IEVycm9yKCfmrovnoLTnmoQgVVRGLTggQk9NIOWktCcpOyB9XG5cdFx0XHRCT00gPSAnJztcblx0XHRcdFVURiA9ICcnO1xuXHRcdH1cblx0fVxuXHRlbHNlIGlmICggZmlyc3RCeXRlPT09MHhGRiApIHtcblx0XHRpZiAoIGxlbmd0aD4xICYmIGJ1ZmZlclsxXT09PTB4RkUgKSB7XG5cdFx0XHRpZiAoIHRocm93RXJyb3IgJiYgbGVuZ3RoJTIgKSB7IHRocm93IEVycm9yKCdVVEYtMTYg55qE5a2X6IqC5pWw5b+F6aG75Li6IDIg55qE5YCN5pWwJyk7IH1cblx0XHRcdGlmICggIW9wdGlvbnMgfHwgb3B0aW9ucy5zdHJpcEJPTSE9PWZhbHNlICkgeyBidWZmZXIgPSBidWZmZXIuc2xpY2UoMik7IH1cblx0XHRcdGVuY29kaW5nID0gJ3VjczInO1xuXHRcdFx0Qk9NID0gJ1xcdUZFRkYnO1xuXHRcdFx0VVRGID0gJzE2TEUnO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGlmICggdGhyb3dFcnJvciApIHsgdGhyb3cgRXJyb3IoJ+aui+egtOeahCBVVEYtMTZMRSBCT00g5aS0Jyk7IH1cblx0XHRcdEJPTSA9ICcnO1xuXHRcdFx0VVRGID0gJyc7XG5cdFx0fVxuXHR9XG5cdGVsc2UgaWYgKCBmaXJzdEJ5dGU9PT0weEZFICkge1xuXHRcdGlmICggbGVuZ3RoPjEgJiYgYnVmZmVyWzFdPT09MHhGRiApIHtcblx0XHRcdGlmICggdGhyb3dFcnJvciAmJiBsZW5ndGglMiApIHsgdGhyb3cgRXJyb3IoJ1VURi0xNiDnmoTlrZfoioLmlbDlv4XpobvkuLogMiDnmoTlgI3mlbAnKTsgfVxuXHRcdFx0YnVmZmVyLnN3YXAxNigpO1xuXHRcdFx0aWYgKCBvcHRpb25zICkge1xuXHRcdFx0XHRpZiAoICFvcHRpb25zLnN3YXBwYWJsZSApIHsgc3dhcHBlZCA9IGJ1ZmZlcjsgfVxuXHRcdFx0XHRpZiAoIG9wdGlvbnMuc3RyaXBCT00hPT1mYWxzZSApIHsgYnVmZmVyID0gYnVmZmVyLnNsaWNlKDIpOyB9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0c3dhcHBlZCA9IGJ1ZmZlcjtcblx0XHRcdFx0YnVmZmVyID0gYnVmZmVyLnNsaWNlKDIpO1xuXHRcdFx0fVxuXHRcdFx0ZW5jb2RpbmcgPSAndWNzMic7XG5cdFx0XHRCT00gPSAnXFx1RkVGRic7XG5cdFx0XHRVVEYgPSAnMTZCRSc7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKCB0aHJvd0Vycm9yICkgeyB0aHJvdyBFcnJvcign5q6L56C055qEIFVURi0xNkJFIEJPTSDlpLQnKTsgfVxuXHRcdFx0Qk9NID0gJyc7XG5cdFx0XHRVVEYgPSAnJztcblx0XHR9XG5cdH1cblx0ZWxzZSBpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5zdGFydHNXaXRoQVNDSUkgKSB7XG5cdFx0aWYgKCBmaXJzdEJ5dGU9PT0weDAwICkge1xuXHRcdFx0aWYgKCB0aHJvd0Vycm9yICkge1xuXHRcdFx0XHRpZiAoIGxlbmd0aD4yICYmIGJ1ZmZlclsyXT09PTB4MDAgKSB7IHRocm93IEVycm9yKCfmmoLkuI3mlK/mjIEgVVRGLTMyIOe8lueggScpOyB9XG5cdFx0XHRcdGlmICggbGVuZ3RoJTIgKSB7IHRocm93IEVycm9yKCdVVEYtMTYg55qE5a2X6IqC5pWw5b+F6aG75Li6IDIg55qE5YCN5pWwJyk7IH1cblx0XHRcdH1cblx0XHRcdGJ1ZmZlci5zd2FwMTYoKTtcblx0XHRcdGlmICggIW9wdGlvbnMuc3dhcHBhYmxlICkgeyBzd2FwcGVkID0gYnVmZmVyOyB9XG5cdFx0XHRlbmNvZGluZyA9ICd1Y3MyJztcblx0XHRcdFVURiA9ICcxNkJFJztcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIGxlbmd0aD4xICYmIGJ1ZmZlclsxXT09PTB4MDAgKSB7XG5cdFx0XHRpZiAoIHRocm93RXJyb3IgKSB7XG5cdFx0XHRcdGlmICggbGVuZ3RoPjMgJiYgYnVmZmVyWzNdPT09MHgwMCApIHsgdGhyb3cgRXJyb3IoJ+aaguS4jeaUr+aMgSBVVEYtMzIg57yW56CBJyk7IH1cblx0XHRcdFx0aWYgKCBsZW5ndGglMiApIHsgdGhyb3cgRXJyb3IoJ1VURi0xNiDnmoTlrZfoioLmlbDlv4XpobvkuLogMiDnmoTlgI3mlbAnKTsgfVxuXHRcdFx0fVxuXHRcdFx0ZW5jb2RpbmcgPSAndWNzMic7XG5cdFx0XHRVVEYgPSAnMTZMRSc7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0VVRGID0gJzgnO1xuXHRcdH1cblx0XHRCT00gPSAnJztcblx0fVxuXHRlbHNlIHtcblx0XHRCT00gPSAnJztcblx0XHRVVEYgPSAnJztcblx0fVxuXHRcblx0dmFyIHN0cmluZyAgICAgICAgID0gZW5jb2RpbmcgPyBidWZmZXIudG9TdHJpbmcoZW5jb2RpbmcpIDogYnVmZmVyLnRvU3RyaW5nKCk7XG5cdGlmICggdGhyb3dFcnJvciApIHtcblx0XHRpZiAoIGZyb20oc3RyaW5nLCBlbmNvZGluZykuZXF1YWxzKGJ1ZmZlcikgKSB7XG5cdFx0XHRzd2FwcGVkICYmIHN3YXBwZWQuc3dhcDE2KCk7XG5cdFx0XHRpZiAoIE5PTl9TQ0FMQVIudGVzdChzdHJpbmcpICkgeyB0aHJvdyBFcnJvcign5Luj55CG5a+556CB54K55LiN6IO95Y2V54us5Ye6546wJyk7IH1cblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRzd2FwcGVkICYmIHN3YXBwZWQuc3dhcDE2KCk7XG5cdFx0XHR0aHJvdyBFcnJvcign5paH5Lu25Lit5a2Y5Zyo6LaF5Ye6IFVuaWNvZGUg6KGo56S66IyD5Zu055qE5YaF5a65Jyk7XG5cdFx0fVxuXHR9XG5cdGVsc2UgeyBzd2FwcGVkICYmIHN3YXBwZWQuc3dhcDE2KCk7IH1cblx0cmV0dXJuIHsgQk9NLCBVVEYsIHN0cmluZyB9O1xuXHRcbn07XG5cbiAgICAgICAgICAgICAgICBcblx0ICAgICAgICAgICAgICAgICAgICBcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgXG4iLCJpbXBvcnQgUmVnRXhwIGZyb20gJy5SZWdFeHAnO1xuaW1wb3J0IFJlZ0V4cF9wcm90b3R5cGUgZnJvbSAnLlJlZ0V4cC5wcm90b3R5cGUnO1xuXG52YXIgUE9JTlRTID1cblx0J2RvdEFsbCcgaW4gUmVnRXhwX3Byb3RvdHlwZSAmJiAndW5pY29kZScgaW4gUmVnRXhwX3Byb3RvdHlwZSA/IFJlZ0V4cCgnLicsICdnc3UnKSA6XG5cdFx0J2JpbmQnIGluIFJlZ0V4cCA/IFJlZ0V4cCgnW1xcXFx1RDgwMC1cXFxcdURCRkZdW1xcXFx1REMwMC1cXFxcdURGRkZdfFteXS8nLCAnZycpIDpcblx0XHRcdC9bXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZdfFtcXHNcXFNdL2c7XG5cbnZhciBQT0lOVFNfQ1JMRiA9XG5cdCdkb3RBbGwnIGluIFJlZ0V4cF9wcm90b3R5cGUgJiYgJ3VuaWNvZGUnIGluIFJlZ0V4cF9wcm90b3R5cGUgPyBSZWdFeHAoJ1xcXFxyXFxcXG58LicsICdnc3UnKSA6XG5cdFx0J2JpbmQnIGluIFJlZ0V4cCA/IFJlZ0V4cCgnXFxcXHJcXFxcbnxbXFxcXHVEODAwLVxcXFx1REJGRl1bXFxcXHVEQzAwLVxcXFx1REZGRl18W15dLycsICdnJykgOlxuXHRcdFx0L1xcclxcbnxbXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZdfFtcXHNcXFNdL2c7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN0cmluZzJhcnJheSAoc3RyaW5nICAgICAgICAsIGNybGYgICAgICAgICAgKSAgICAgICAgICAge1xuXHRyZXR1cm4gc3RyaW5nID8gc3RyaW5nLm1hdGNoKGNybGYgPyBQT0lOVFNfQ1JMRiA6IFBPSU5UUykgIDogW107XG59O1xuIiwiaW1wb3J0IHZlcnNpb24gZnJvbSAnLi92ZXJzaW9uP3RleHQnO1xyXG5pbXBvcnQgYnVmZmVyMm51bWJlciBmcm9tICcuL2J1ZmZlcjJudW1iZXInO1xyXG5pbXBvcnQgYnVmZmVyMnN0cmluZyBmcm9tICcuL2J1ZmZlcjJzdHJpbmcnO1xyXG5pbXBvcnQgYnVmZmVyMm9iamVjdCBmcm9tICcuL2J1ZmZlcjJvYmplY3QnO1xyXG5pbXBvcnQgc3RyaW5nMmFycmF5IGZyb20gJy4vc3RyaW5nMmFycmF5JztcclxuaW1wb3J0IE5PTl9TQ0FMQVIgZnJvbSAnLi9OT05fU0NBTEFSJztcclxuXHJcbmV4cG9ydCB7XHJcblx0dmVyc2lvbixcclxuXHRidWZmZXIybnVtYmVyLFxyXG5cdGJ1ZmZlcjJvYmplY3QsXHJcblx0YnVmZmVyMnN0cmluZyxcclxuXHRzdHJpbmcyYXJyYXksXHJcblx0Tk9OX1NDQUxBUixcclxufTtcclxuXHJcbmltcG9ydCBEZWZhdWx0IGZyb20gJy5kZWZhdWx0Pz0nO1xyXG5leHBvcnQgZGVmYXVsdCBEZWZhdWx0KHtcclxuXHR2ZXJzaW9uOiB2ZXJzaW9uLFxyXG5cdGJ1ZmZlcjJudW1iZXI6IGJ1ZmZlcjJudW1iZXIsXHJcblx0YnVmZmVyMm9iamVjdDogYnVmZmVyMm9iamVjdCxcclxuXHRidWZmZXIyc3RyaW5nOiBidWZmZXIyc3RyaW5nLFxyXG5cdHN0cmluZzJhcnJheTogc3RyaW5nMmFycmF5LFxyXG5cdE5PTl9TQ0FMQVI6IE5PTl9TQ0FMQVJcclxufSk7XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGNBQWUsT0FBTzs7c0JBQUMsdEJDR3ZCLGlCQUFlO0NBQ2QsU0FBUyxJQUFJLGdCQUFnQjtJQUMxQixNQUFNLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDO0lBQ2hDLDBF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TSxDQUFDLFFBQVEsRUFBRSxDQUFDO0NBQzlFLEtBQUssVUFBVSxHQUFHO0VBQ2pCLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUc7R0FDNUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUM1QixLQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFO0dBQzlEO09BQ0k7R0FDSixPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0dBQzVCLE1BQU0sS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7R0FDdkM7RUFDRDtNQUNJLEVBQUUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFO0NBQ3JDLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDOztDQUU1Qjs7QUMxR0QsSUFBSSxNQUFNO0NBQ1QsUUFBUSxJQUFJLGdCQUFnQixJQUFJLFNBQVMsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztFQUNqRixNQUFNLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyx5Q0FBeUMsRUFBRSxHQUFHLENBQUM7R0FDeEUsd0NBQXdDLENBQUM7O0FBRTVDLElBQUksV0FBVztDQUNkLFFBQVEsSUFBSSxnQkFBZ0IsSUFBSSxTQUFTLElBQUksZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUM7RUFDeEYsTUFBTSxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsZ0RBQWdELEVBQUUsR0FBRyxDQUFDO0dBQy9FLDZDQUE2QyxDQUFDOztBQUVqRCxBQUFlLFNBQVMsWUFBWSxFQUFFLE1BQU0sVUFBVSxJQUFJLHNCQUFzQjtDQUMvRSxPQUFPLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ2hFOztBQ0VELGNBQWUsT0FBTyxDQUFDO0NBQ3RCLE9BQU8sRUFBRSxPQUFPO0NBQ2hCLGFBQWEsRUFBRSxhQUFhO0NBQzVCLGFBQWEsRUFBRSxhQUFhO0NBQzVCLGFBQWEsRUFBRSxhQUFhO0NBQzVCLFlBQVksRUFBRSxZQUFZO0NBQzFCLFVBQVUsRUFBRSxVQUFVO0NBQ3RCLENBQUMsQ0FBQzs7Ozs7Ozs7OyIsInNvdXJjZVJvb3QiOiIuLi8uLi9zcmMvIn0=