/** 
 * Javascript file for string utility functions
 */


var keywordExtractor = require('keyword-extractor');
 
var exports = module.exports = {};
 
exports.extractKeywordsFromString = function(string) {
    var keywords = keywordExtractor.extract(string, {
       language:  "english",
       remove_digits: true,
       return_changed_case: true,
       remove_duplicates: true
    });
    
    return keywords;
};
    
/**
 * This regex matches and removes any URL that starts with http:// or https:// or ftp:// 
 * and matches up to next space character OR end of input. 
 * [\n\S]+ will match across multi lines as well.This
 * */

exports.removeLinksFromString = function(string) {
    var stringWithLinksRemoved = string.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
    return stringWithLinksRemoved;
};

/*
* This function strips numbers/ @mentions/ hashtags/ special characters from string
*/

exports.cleanUpString = function(string) {
    var stringWithNumbersRemoved = string.replace(/[0-9]/g, '');
    
    var stringWithSpecialCharachtersRemoved = stringWithNumbersRemoved.replace(/[^a-zA-Z ]/g, '');
    
    return stringWithSpecialCharachtersRemoved;
}



