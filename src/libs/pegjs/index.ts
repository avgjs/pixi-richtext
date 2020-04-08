require("./parser.js");

declare namespace UBBParser {
    function parse(data: string): any;
}  

exports.UBBParser = window.UBBParser;