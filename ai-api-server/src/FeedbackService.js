'use strict';

const utilWs = require('du-utils').UtilWs();
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('fb-ws');
const dbService = require('du-dbservice').DbService();
const { Client } = require('@elastic/elasticsearch');

const elasticSearchFeedBackServer = utils.getConfig('ELASTIC_SEARCH_FEEDBACK_SERVER');
const saveToElastic = utils.isNotNull(elasticSearchFeedBackServer);
let elasticClient;
if (saveToElastic) {
    elasticClient = new Client({ 
        node: elasticSearchFeedBackServer,
        auth: {
            username: utils.getConfig('ELASTIC_SEARCH_FEEDBACK_USERNAME'),
            password: utils.getConfig('ELASTIC_SEARCH_FEEDBACK_PASSWORD')
        }
    });
}

/*
 * The MongooseJS collection schema definition.
 */
let QuestionAnswerLogSchema = { 
    clientRef: { // example ms-chat-bot, d2l-chat-bot
        type: String,
        required: true
    },
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

QuestionAnswerLogSchema = dbService.schema('QuestionAnswerLog', QuestionAnswerLogSchema);

QuestionAnswerLogSchema.index(
    { 
        clientRef: 'text', 
        contextRef: 'text', 
        contextType: 'text',
        question: 'text',
        answer: 'text',
        faqClass: 'text'
    }
);

let QuestionAnswerLog = dbService.getModel('QuestionAnswerLog');
exports.QuestionAnswerLog = QuestionAnswerLog;

// test on change steaming
// const changeStream = QuestionAnswerLog.watch();
// changeStream.on('change', next => {
//   // process next document
//   logger.info('on change', JSON.stringify(next, null, 4));
// });


/**
 * Install Web Service API
 */
exports.installWs = async function (server) {
    server.get(server.getPath('/fs/send-feedback'), sendFeedback);
    server.get(server.getPath('/fs/list'), listFeedback);
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


    if (transactionId === "none") {
        utilWs.sendSuccess('fs.sendFeedback', { success: false, data: { "message": "Feedback ignored"} }, res, true);
        return;
    }
    
    let entity = {_id: transactionId, feedbackScore};

    dbService.save('QuestionAnswerLog', entity, function(err, result) {
        if (utilWs.handleError('fs.saveFeedback#questionAnswerLog', res, err)) {
            return;
        }
        utilWs.sendSuccess('fs.sendFeedback', { success: true, data: { "message": "Feedback saved"} }, res, true);
    });
    
}


exports.saveQuestionAnswer = async function({ clientRef, contextRef, contextType, question, answer,
                                        confidenceScore, entities, faqClass, isFromCache }, cb) {
    
    
    let entity = {
        clientRef, contextRef, contextType, question, answer, confidenceScore, entities, faqClass, isFromCache
    };

    dbService.save('QuestionAnswerLog', entity,  (err, result) => {
        sendToElastic(result._id).then(()=>{
            if (cb) {
                cb(err, result );
                return;
            }
        }).catch(err =>{
            if (cb) {
                cb(err);
            }
        });
    }); 

}

async function sendToElastic(_id) {
    if (!saveToElastic) {
        return;
    }
    let entity = await QuestionAnswerLog.findOne({_id}).lean().exec();
    delete entity._id;// remove _id as elastic adds its own
    try {
        let result = await elasticClient.index({
            index: 'question-answer-log',
            // type: '_doc', // uncomment this line if you are using {es} ≤ 6
            body: { ...entity }
        });
        logger.debug('object saved to elastic', entity);
    } catch (err) {
        logger.error(err);
    }
}

module.exports.loadAllToElastic = async function () {
    let entityList = await QuestionAnswerLog.find({}).lean().exec();
    for (let entity of entityList) {
        let id = entity._id;
        delete entity._id;// remove _id as elastic adds its own
        try {
            let result = await client.index({
                index: 'question-answer-log',
                // type: '_doc', // uncomment this line if you are using {es} ≤ 6
                body: { ...entity }
            });
            logger.info(`object saved to elastic, id = ${id}`);
            logger.debug('object saved to elastic', entity);
        } catch (err) {
            logger.error(err);
        }
    }
}

// async function saveQuestionState(threadId, {answered, feedBackReceived, subject, botReplyPostId, answerText, ignore}) {
//     // Convert callback to promise
//     return new Promise((resolve, reject) => {
//         return dbService.upsert('D2lQuestionState', {threadId}, {answered, feedBackReceived, subject, botReplyPostId, answerText, ignore}, (err, result) => {
//             return err ? reject(err) : resolve(result);
//         });
//     });
// };

/**
 * GET
 * /quizzes
 * Search and list quizzes.
 */
const listFeedback = async function(req, res){ 
    let page = utils.notNull(Number(req.query.page), 1);
    let limit = utils.notNull(Number(req.query.limit), 1000);
    
    //Search Query
    let search = req.query.search;
    // let searchResultRegExp = new RegExp(search, "i");
    
    let query = {};
    let sort = { _id : -1 };
        
    if (utils.isNotNull(req.query.search)) {
        query.$text = { $search: search };
    }

    if (utils.isNotNull(req.body.sort)) {
        sort = req.body.sort;
    }

    if (utils.isNotNull(req.body.query)) {
        query = {...query, ...req.body.query}
    }
          
    QuestionAnswerLog.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort(sort)
        .exec((err, result) => {
        QuestionAnswerLog.count(query).exec((err, count) => {
            utilWs.sendSuccess('fs.list', {
                
                page: page,
                limit: limit,
                totalCount: count,
                data: result,

            }, res, true);
        });
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