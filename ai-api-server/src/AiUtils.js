'use strict';

const NEW_LINES_REGEXP = /(?:\r\n|\r|\n)/g;

exports.cleanUpText = function(text) {
    return text.replace(NEW_LINES_REGEXP, ' ');
}