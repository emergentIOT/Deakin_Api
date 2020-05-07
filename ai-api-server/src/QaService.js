'use strict';

const fetch = require('node-fetch');
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('qg-service');
const dbService = require('du-dbservice').DbService();
const querystring = require('querystring');

const questionGenerationAiUrl = utils.getConfig('QUESTION_GENERATION_AI_URL', utils.CONFIG_REQUIRED);
const questionAnswerAiUrl = utils.getConfig('QUESTION_ANSWER_AI_URL', utils.CONFIG_REQUIRED);


const GET_RESULT_REGEXP = /<label id="ans1">((.|\n)*?)<\/label>/gm;

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

        const GET_RESULT_REGEXP = /<label id="ans1">((.|\n)*?)<\/label>/gm;

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

exports.generateQuestions = function(plainText, answerToken, cb) {

    if (plainText.indexOf(answerToken) == -1) {
        cb("Invalid answer token");
    }

    let formData = {
        context: plainText,
        ans_tok: answerToken
    };
    
    fetch(questionGenerationAiUrl, {
        headers: {
            "content-type": "application/x-www-form-urlencoded",
        },
        body: querystring.stringify(formData),
        method: "POST"
    }).then(res => res.text())
      .then(body => {

        try {
            let match = GET_RESULT_REGEXP.exec(body);
            let result = '';
            if (utils.isNotNull(match) && match.length > 1) {
                result = match[1].trim();
            }
    
            logger.info(match);

            cb(null, {questionText: result});
        } catch(err) {
            cb(err);
        }

    }).catch(err => {
        if (err) {
            cb(err);
            return;
        }
    });
}

exports.answerQuestions = function(plainText, questionToken, cb) {

    let formData = {
        context: plainText,
        question_tok: questionToken
    };

    logger.info(formData);
    
    fetch(questionAnswerAiUrl, {
        headers: {
            "content-type": "application/x-www-form-urlencoded",
        },
        body: querystring.stringify(formData),
        method: "POST"
    }).then(res => res.text())
      .then(body => {

        try {
            let match = GET_RESULT_REGEXP.exec(body);
            let result = '';
            if (utils.isNotNull(match) && match.length > 1) {
                result = match[1].trim();
            }
            logger.info(match); 
    
            cb(null, {answerText: result});
        } catch(err) {
            cb(err);
        }

    }).catch(err => {
        if (err) {
            cb(err);
            return;
        }
    });

}