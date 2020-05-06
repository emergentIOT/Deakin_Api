'use strict';

var logger = require('du-logger').LoggingService('du-example');
var dbService = require('du-dbservice').DbService();

/**
 * MongooseJS model name.
 * @type {String}
 */
exports.ResourceText = 'ResourceText';

/*
 * The MongooseJS collection schema definition.
 */
exports.Schema = { 
    plainText: {
        type: String,
        required: true
    } 
};

dbService.schema(exports.ResourceText, exports.Schema);

/**
 * Save text to Mongo.
 * @param {String} message message to save to database.
 * @param  {Function} cb callback.
 */
exports.saveText = function(plainText, cb) {

    var entity = { plainText: plainText };

    dbService.save(exports.ResourceText, entity, function(err, result) {

        if (err) {
            logger.error('saveText', 'Error saving resource text');
        }

        if (cb) {
            cb(err, result);

            return;
        }
    });
};

/**
 * Get text from Mongo
 * @param {String} resourceId the text resource id
 */
exports.getTextById = function(resourceId, cb) {
    dbService.get(exports.ResourceText, resourceId, cb);
}

/**
 * Delete text from Mongo
 * @param {String} resourceId the text resource id
 */
exports.deleteTextById = function(resourceId, cb) {
    dbService.remove(exports.ResourceText, { _id: resourceId }, cb);
}