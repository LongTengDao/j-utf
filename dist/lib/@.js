'use strict';

const { from } = Buffer;

exports.toStringFollowBOM = (buffer,swapDirectly)=>{
	switch( buffer[0] ){
		case 0xEF: if( buffer[1]===0xBB && buffer[2]===0xBF ){ return buffer.slice(3).toString('utf8'); } break;
		case 0xFF: if( buffer[1]===0xFE ){ return buffer.slice(2).toString('ucs2'); } break;
		case 0xFE: if( buffer[1]===0xFF ){ buffer = ( swapDirectly ? buffer : from(buffer) ).swap16(); return buffer.slice(2).toString('ucs2'); } break;
	}
	return buffer.toString();
};

exports.toStringWithBOM = (buffer,swapDirectly)=>{
	switch( buffer[0] ){
		case 0xEF: if( buffer[1]===0xBB && buffer[2]===0xBF ){ return buffer.toString('utf8'); } break;
		case 0xFF: if( buffer[1]===0xFE ){ return buffer.toString('ucs2'); } break;
		case 0xFE: if( buffer[1]===0xFF ){ buffer = ( swapDirectly ? buffer : from(buffer) ).swap16(); return buffer.toString('ucs2'); } break;
	}
	return buffer.toString();
};

exports.BOM = '\uFEFF';
