'use strict';

const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('cache-service');
const dbService = require('du-dbservice').DbService();

const CacheSchema = {
    name: {
        type: String,
        index: true, 
        required: true
    }, // cache name
    input1Hash: {
        type: String,
        index: true, 
        required: true
    },
    input2Hash: {
        type: String,
        index: true
    },
    data: {}
}

dbService.schema('Cache', CacheSchema);
let Cache = dbService.getModel('Cache');

exports.hashContent = function(str) {
    return utils.hash(str);
}

exports.saveCache = function (cacheName, input1Hash, input2Hash,  data) {

    dbService.upsert(Cache, 
        {
            name: cacheName, 
            input1Hash, 
            input2Hash
        }, 
        {
            name: cacheName, 
            input1Hash, 
            input2Hash, 
            data
        },
        (err, result) => {
            if (err) {
                logger.error("Error saving cache: ", err);
            }
    });
}

exports.checkCache = function(cacheName, input1Hash, input2Hash, cb) {
    Cache.findOne({name: cacheName, input1Hash, input2Hash}, (err, result) => {
        if (err) {
            cb(err);
            return;
        }
        if (result && result.data) {
            cb(null, result.data);
        } else {
            cb(null, null);
        }
    });
}