export const version :'3.2.0';

export function buffer2number (buffer :Buffer, startsWithASCII? :boolean) :number;

export function buffer2string (buffer :Buffer, options? :Options) :string;

export function buffer2object (buffer :Buffer, options? :Options) :{ BOM :'' | '\uFEFF', UTF :'' | '8' | '16LE' | '16BE', string :string };

export function string2array (string :string, crlf? :boolean) :string[];

export const NON_SCALAR :RegExp;

export default exports;
declare const exports :{
	version :string,
	buffer2number :typeof buffer2number,
	buffer2object :typeof buffer2object,
	buffer2string :typeof buffer2string,
	string2array :typeof string2array,
	NON_SCALAR :typeof NON_SCALAR,
	default :typeof exports,
};

type Options = {
	swappable? :boolean,
	stripBOM? :boolean,// = true
	startsWithASCII? :boolean,
	throwError? :boolean,// = true
};
