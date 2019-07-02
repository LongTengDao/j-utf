import Error from '.Error';
import from from '.Buffer.from?';

import NON_SCALAR from './NON_SCALAR';

export default function buffer2string (buffer :Buffer, options? :Options) :string {
	
	var length :number = buffer.length;
	if ( !length ) { return ''; }
	
	var encoding :undefined | 'ucs2';
	var swapped :undefined | Buffer;
	
	
	
	var throwError :boolean = !options || options.throwError!==false;
	
	var firstByte :number = buffer[0];
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
	
	
	
	
	
	var string :string = encoding ? buffer.toString(encoding) : buffer.toString();
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
	
};

type Options = {
	swappable? :boolean,
	stripBOM? :boolean,// = true
	startsWithASCII? :boolean,
	throwError? :boolean,// = true
};
