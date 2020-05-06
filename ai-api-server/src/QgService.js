'use strict';

const fetch = require('node-fetch');
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('qg-service');
const dbService = require('du-dbservice').DbService();

const qgAiUrl = utils.getConfig('QG_AI_URL', utils.CONFIG_REQUIRED);

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




exports.generateQuestions = function(plainText, token, cb) {

    if (plainText.indexOf(token) == -1) {
        cb("Invalid token");
    }

    fetch("http://research-gpu-poc-fs1.its.deakin.edu.au:8888/", {
        headers: {
            "content-type": "application/x-www-form-urlencoded",
        },
        body: "context=The+Normans+%28Norman%3A+Nourmands%3B+French%3A+Normands%3B+Latin%3A+Normanni%29+were+the+people+who+in+the+10th+and+11th+centuries+gave+their+name+to+Normandy%2C+a+region+in+France.+They+were+descended+from+Norse+%28%22Norman%22+comes+from+%22Norseman%22%29+raiders+and+pirates+from+Denmark%2C+Iceland+and+Norway+who%2C+under+their+leader+Rollo%2C+agreed+to+swear+fealty+to+King+Charles+III+of+West+Francia.+Through+generations+of+assimilation+and+mixing+with+the+native+Frankish+and+Roman-Gaulish+populations%2C+their+descendants+would+gradually+merge+with+the+Carolingian-based+cultures+of+West+Francia.+The+distinct+cultural+and+ethnic+identity+of+the+Normans+emerged+initially+in+the+first+half+of+the+10th+century%2C+and+it+continued+to+evolve+over+the+succeeding+centuries.&ans_tok=Normans",
        method: "POST"
    }).then(res => res.text())
      .then(body => {

        logger.info(body);

        cb(null, {questionText: "Hello"});

    }).catch(err => {
        if (err) {
            cb(err);
            return;
        }
    });

    // let formData = {
    //     context: plainText,
    //     ans_tok: token
    // };

    // logger.info("Submiting request to qa AI: " + qgAiUrl);
    // logger.info(formData);

    // request.post(qgAiUrl, formData, function (err, response, body) {

    //     if (err) {
    //         cb(err);
    //         return;
    //     }

    //     if (typeof body === 'string') {
    //         cb(body);
    //         return;
    //     }

    //     let result = null;

    //     try {
    //         result = JSON.parse(body);
    //     } catch (e) {
    //         cb(e);
    //         return;
    //     }

    //     cb(null, result);
    // });



}