'use strict';

const utilWs = require('du-utils').UtilWs();
const logger = require('du-logger').LoggingService('fb-ws');
const dbService = require('du-dbservice').DbService();

/*
 * The MongooseJS collection schema definition.
 */
const QuestionAnswerLogSchema = { 
    contextRef: {
        type: String,
        required: true
    },
    contextType: {
        type: String,
        required: true
    }, 
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }, 
    confidenceScore: {
        type: Number,
        required: true
    }, 
    entities: {
        type: String,
        required: true
    }, 
    faqClass: {
        type: String,
        required: true
    },
    feedbackScore: Number,
    isFromCache: Boolean
};

dbService.schema('QuestionAnswerLog', QuestionAnswerLogSchema);
let QuestionAnswerLog = dbService.getModel('QuestionAnswerLog');
exports.QuestionAnswerLog = QuestionAnswerLog;


/**
 * Install Web Service API
 */
exports.installWs = async function (server) {
    server.get(server.getPath('/fs/send-feedback'), sendFeedback);
    logger.info('Feedback service api installed at /fs');
};

/**
 * GET
 * /send-feedback
 * Send feedback.
 */
const sendFeedback = async function (req, res) {
    let transactionId = req.query.transactionId;
    let feedbackScore = parseBoolean(req.query.feedback) ? 1 : 0;

    let entity = {_id: transactionId, feedbackScore};
    // Store response in MongoDB or Firebase here...

    dbService.save('QuestionAnswerLog', entity, function(err, result) {
        if (utilWs.handleError('fs.saveFeedback#questionAnswerLog', res, err)) {
            return;
        }
        utilWs.sendSuccess('fs.sendFeedback', { success: true, data: { "message": "Feedback received"} }, res, true);
    });
    
}


exports.saveQuestionAnswer = function({ contextRef, contextType, question, answer,
                                        confidenceScore, entities, faqClass, isFromCache }, cb) {
    
    
    let entity = {
        contextRef, contextType, question, answer, confidenceScore, entities, faqClass, isFromCache
    };

    dbService.save('QuestionAnswerLog', entity, function(err, result) {
        if (cb) {
            cb(err, result );
            return;
        }
    });

}

const parseBoolean = function(value) {

    if (!value) {
        return false;
    } else if (typeof value === 'boolean') {
        return value;
    }

    value = '' + value.toUpperCase();

    switch (value) {
        case 'YES':
        case '1':
        case 'ON':
        case 'TRUE':
            return true;

        default:
            return false;
    }
};