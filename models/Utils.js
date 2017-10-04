var validator = require('validator');
var sanitizeHtml = require('sanitize-html');

var Utils = function() {
};

Utils.sanitizeURL = function(text, maxURLSize) {
    if (maxURLSize) {
        text = text.substring(0,maxURLSize);
    }
    text = text.trim().replace(/\s+|'/gm, "_");
    text = text.replace(/à|ä|á|â/gmi, "a");
    text = text.replace(/é|è|ê/gmi, "e");
    text = text.replace(/ï|ì|í|î/gmi, "i");
    text = text.replace(/ö|ó|ò|ô/gmi, "o");
    text = text.replace(/ü|ú|ù|û/gmi, "u");
    text = text.replace(/ç/gmi, "c");
    text = validator.whitelist(text, "\\w"); // remove everything that is not alphanumeric
    text = text.replace(/^_+|_+$/gm, ""); //remove starting, ending underscores
    text = text.replace(/_+/gm, "_"); // transform all ___ into _
    if (/^\w+$/.test(text)) {
        return text;
    }
    throw Error("URL could not be sanitized");

};
Utils.decode = function(text) {
    text = text.replace(/&lt;/gm, '<');
    text = text.replace(/&gt;/gm, '>');
    return text;
}
Utils.sanitizeHtml = function(text) {

    return sanitizeHtml(Utils.decode(text), {
        allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'img', 'br',
            'font', 'h1', 'h2', 'h3', 'p', 'u', 'strike', 'ol', 'li',
            'div', 'blockquote', 'sup', 'ul'],
        allowedAttributes: {
            'a': [ 'href' ],
            img: ['src', 'height', 'width', 'unselectable', 'title'],
            font: ['style', 'color', 'size'],
            div: ['align']
        }
    });
}

module.exports = Utils;