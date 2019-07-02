import from from '.Buffer.from?';

import NON_SCALAR from './NON_SCALAR';

export default function buffer2number (buffer :Buffer, startsWithASCII? :boolean) :number {
	var ucs :undefined | 2;
	var swapped :undefined | Buffer;
	var length :number = buffer.length;
	if ( !length ) { return -1; }
	var firstByte :number = buffer[0];
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
	var string :string;
	var coded :Buffer;
	if ( ucs ) {
		coded = from(string = buffer.toString('ucs2'), 'ucs2');
		if ( swapped ) {
			coded.swap16();
			buffer.swap16();
		}
	}
	else { coded = from(string = buffer.toString()); }
	var codedLength :number = coded.length;
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
};
