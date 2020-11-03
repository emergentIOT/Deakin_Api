'use strict';

const utilWs = require('du-utils').UtilWs();
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('qg-ws');
const cacheService = require('./CacheService');
const aiUtils = require('./AiUtils');
const fetch = require('node-fetch');
const feedbackService = require('./FeedbackService');

const questionServiceAiUrl = utils.getConfig('QUESTION_SERVICE_AI_URL', utils.CONFIG_REQUIRED);
const questionServiceAiHost = utils.getConfig('QUESTION_SERVICE_AI_HOST');
const QS_AI_CACHE_NAME = "QS_AI";
const QS_UNIT_DATA = {};

/**
 * Install Web Service API
 */
exports.installWs = async function (server) {

    server.get(server.getPath('/qs/ask-question'), askQuestion);

    logger.info('Question service api installed at /qs');


    loadQsData();
};

const loadQsData = function() {
    QS_UNIT_DATA["test_001"] = require("./qs-data/test_001.json");
}

/**
 * GET
 * /ask-question
 * Get quiz.
 */
const askQuestion = async function (req, res) {

    let { question, context_ref, context_type, method, isDryRun } = req.query;
    context_ref = utils.toLowerCase(context_ref);
    context_type = utils.toLowerCase(context_type);
    method = utils.toLowerCase(method);

    if (isDryRun) {
        let data = { 
            answer: `Echo: ${question}, context_ref = ${context_ref}, context_type = ${context_type}`, 
            transactionId: "0"
        };
        utilWs.sendSuccess('qs.askQuestion', { success: true, data }, res, true);
        return;
    }

    fetchAskQuestion(question, context_type, context_ref, (err, result) => {
        if (handleError('qs.askQuestion#fetchAskQuestion', res, err, question, context_type, context_ref)) {
            return;
        }
        let processesAnswerResult = processAnswer(context_ref, context_type, result);
        if (handleError('qs.askQuestion#processAnswer', res, processesAnswerResult.message, question, context_type, context_ref)) {
            return;
        }
        let saveResult = {
            contextRef: context_ref, 
            contextType: context_type, 
            question, 
            answer: processesAnswerResult.answer,
            confidenceScore: utils.notNull(result.confidence_score, 0),
            entities: result.entities,
            faqClass: result.faq_class,
            isFromCache: result.isFromCache
        }
        feedbackService.saveQuestionAnswer(saveResult, (err, result) => {
            if (handleError('qs.askQuestion#saveQuestionAnswer', res, err, question, context_type, context_ref)) {
                return;
            }
            utilWs.sendSuccess('qs.askQuestion', {
                success: true,
                data: {
                    answer: processesAnswerResult.answer,
                    transactionId: result._id
                }
            }, res, true);
        });
        
    });

}

const handleError = function(domain, res, err, question, contextType, contextRef) {
    if (err) {
        logger.error(`${domain}: question = ${question}, context_type = ${contextType}, context_ref = ${contextRef}`);
        logger.error(`${domain}: ${err}`);
        let payload = {
            success: false,
            data: {
                message: `${err}`,
                answer: "Unexpected error with service.",
                transactionId: 0
            }
        };
        res.json(payload);
        return true;
    }
    return false;
}
/**
 * 
 * @param {answer: "", confidence_score: "1.0", entities: "[CLS] O O O O [SEP]", faq_class: "unit_chair"} result 
 */
const processAnswer = function (contextRef, contextType, result) {
    let {confidence_score, entities, faq_class, entity_mapping} = result;
    
    let unitData = QS_UNIT_DATA[contextRef];
    if (utils.isNull(unitData)) {
        return { success: false, message: `Cannot found unit data for ref = ${contextRef}`};
    }
    let faqClass = unitData[utils.toLowerCase(faq_class)];
    if (utils.isNull(faqClass)) {
        return { success: false, message: `Cannot found faq_class for ref = ${contextRef}, faq_class = ${faqClass}`};
    }
    let answer = faqClass;
    if (typeof answer != 'string') {
        answer = utils.toString(Object.values(faqClass), "\n");
    }
    return { success: true, answer};
}


const fetchAskQuestion = function(question, context_type, context_ref, cb) {

    question  = aiUtils.cleanUpText(question);
    let questionHash = cacheService.hashContent(question);
    let contextHash = cacheService.hashContent(context_type + context_ref);
    
    
    const payload = {
        question
    }
    
    cacheService.checkCache(QS_AI_CACHE_NAME, questionHash, contextHash, (err, result) => {
        
        
        if (result) {
            cb(null, result);
            return;
        } else if (err) {
            cb(err);
            return;
        } 
    
        let headers = {
            "content-type": "application/json",
        };
        if (utils.isNotNull(questionServiceAiHost)) {
            headers["HOST"] = questionServiceAiHost;
        }
        fetch(questionServiceAiUrl, {
            headers,
            body: JSON.stringify(payload),
            method: "POST"
        })
        .then(res => res.json())
        .then(json => {
            try {
                logger.info("QS AI service result: ", json);

                if (utils.isEmpty(json.answer)) {
                    logger.warn('Empty result: ', json);
                }
                cb(null, {isFromCache: false, ...json})
                cacheService.saveCache(QS_AI_CACHE_NAME, questionHash, contextHash, {...json});
            } catch(err) {
                cb(err);
            }
        
        }).catch(err => {
            if (err) {
                cb(err);
                return;
            }
        });
    });

}