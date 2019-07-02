export = exports;
declare const exports :{
	
	version :string,
	
	buffer2number (buffer :Buffer, startsWithASCII? :boolean) :number,
	
	buffer2string (buffer :Buffer, options? :Options) :string,
	
	buffer2object (buffer :Buffer, options? :Options) :{ BOM :'' | '\uFEFF', UTF :'' | '8' | '16LE' | '16BE', string :string },
	
	string2array (string :string, crlf? :boolean) :string[],
	
	NON_SCALAR :RegExp,
	
	default :typeof exports,
	
};

type Options = {
	swappable? :boolean,
	stripBOM? :boolean,// = true
	startsWithASCII? :boolean,
	throwError? :boolean,// = true
};
