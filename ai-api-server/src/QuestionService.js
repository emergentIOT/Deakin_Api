'use strict';

const utilWs = require('du-utils').UtilWs();
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('qg-ws');
const cacheService = require('./CacheService');
const aiUtils = require('./AiUtils');
const fetch = require('node-fetch');

const questionServiceAiUrl = utils.getConfig('QUESTION_SERVICE_AI_URL', utils.CONFIG_REQUIRED);
const QS_AI_CACHE_NAME = "QS_AI";

/**
 * Install Web Service API
 */
exports.installWs = async function (server) {

    server.get(server.getPath('/qs/ask-question'), askQuestion);

    logger.info('Question service api installed at /qs');

};

/**
 * GET
 * /ask-question
 * Get quiz.
 */
const askQuestion = async function (req, res) {

    let { question, context_ref, context_type, method, isDryRun } = req.query;

    if (isDryRun) {
        let data = { 
            answer: `Echo: ${question}, context_ref = ${context_ref}, context_type = ${context_type}`, 
            confidence_score: "1.0",
            entities: "[CLS] O O O O [SEP]",
            faq_class: "unit_chair",
            input: question
        };
        utilWs.sendSuccess('qs.askQuestion', { success: true, data }, res, true);
        return;
    }

    fetchAskQuestion(question, context_type, context_ref, (err, result) => {
        if (utilWs.handleError('qs.askQuestion', res, err)) {
            return;
        }
        utilWs.sendSuccess('qs.askQuestion', { success: true, data: result }, res, true);
        
    });



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
    

        fetch(questionServiceAiUrl, {
            headers: {
                "content-type": "application/json",
            },
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
                cb(null, {...json})
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