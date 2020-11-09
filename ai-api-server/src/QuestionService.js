'use strict';

const utilWs = require('du-utils').UtilWs();
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('qg-ws');
const cacheService = require('./CacheService');
const aiUtils = require('./AiUtils');
const fetch = require('node-fetch');
const feedbackService = require('./FeedbackService');
const dbService = require('du-dbservice').DbService();

const questionServiceAiUrl = utils.getConfig('QUESTION_SERVICE_AI_URL', utils.CONFIG_REQUIRED);
const questionServiceAiHost = utils.getConfig('QUESTION_SERVICE_AI_HOST');
const QS_AI_CACHE_NAME = "QS_AI";

let QS_CLASS_DATA = {};

/*
 * The MongooseJS collection schema definition.
 */
const ClassDataSchema = { 
    ref: {
        type: String,
        require: true
    },
    data: {}
}

dbService.schema('ClassData', ClassDataSchema);
let ClassData = dbService.getModel('ClassData');
exports.ClassData = ClassData;

/**
 * Install Web Service API
 */
exports.installWs = async function (server) {

    server.get(server.getPath('/qs/ask-question'), askQuestion);
    server.put(server.getPath('/qs/class-data/:ref'), saveClassData);
    server.get(server.getPath('/qs/class-data/:ref'), getClassData);

    logger.info('Question service api installed at /qs');


    loadQsData();
};

const loadQsData = function() {
    ClassData.find({}).lean().exec((err, results) => {
        if (err) {
            throw err;
        }
        results.forEach(result => {
            QS_CLASS_DATA[result.ref] = result.data;
            let numberOfClasses = utils.sizeMap(result.data);
            logger.info(`Classification data loaded for ${result.ref}, number of classes ${numberOfClasses}`);
        });
    });
}

/**
 * PUT
 * /class-data
 * Save classification data.
 */
const saveClassData = async function(req, res) {

    let ref = req.params.ref;
    let data = req.body;
    logger.debug("saveClassData", ref, data);
    let entity = {ref, data};

    if (utils.isNull(ref)) {
        utilWs.handleError('qs.saveClassData', res, "Class data set reference is null");
        return;
    }

    if (utils.isNull(data)) {
        utilWs.handleError('qs.saveClassData', res, "Class data set is null");
        return;
    }
   
    dbService.upsert('ClassData', {ref: ref}, entity, (err, result) => {

        if (utilWs.handleError('qs.saveClassData', res, err)) {
            return;
        }

        QS_CLASS_DATA = {};
        loadQsData();

        return utilWs.sendSuccess('qs.saveClassData', {data: result._id}, res, true);

    });

}

/**
 * GET
 * /class-data/:ref
 * Get class data.
 */
const getClassData = async function(req, res) {
    
    ClassData.findOne({ref: req.params.ref}).lean().exec((err, classData) => {
        if (utilWs.handleError('qs.getClassData', res, err)) {
            return;
        }
        if (utils.isNull(classData)) {
            utilWs.sendUserError('qs.getClassData', `Class data not found for ref = ${req.params.ref}`, res);
            return;
        }
        utilWs.sendSuccess('qs.getClassData', {success: true, data: classData}, res, true);                      
    });

}

/**
 * GET
 * /ask-question
 * Get quiz.
 */
const askQuestion = async function (req, res) {

    let { question, context_ref, context_type, client_ref, method, is_dry_run } = req.query;
    context_ref = utils.toLowerCase(context_ref);
    context_type = utils.toLowerCase(context_type);
    method = utils.toLowerCase(method);

    if (is_dry_run) {
        let data = { 
            answer: `Echo: ${question}, context_ref = ${context_ref}, context_type = ${context_type}`, 
            transactionId: "none"
        };
        utilWs.sendSuccess('qs.askQuestion', { success: true, data }, res, true);
        return;
    }

    fetchAskQuestion(question, context_type, context_ref, (err, result) => {
        if (handleError('qs.askQuestion#fetchAskQuestion', res, err, question, context_type, context_ref)) {
            return;
        }
        let processesAnswerResult = processAnswer(context_ref, context_type, result);
        if (handleError('qs.askQuestion#processAnswer', res, processesAnswerResult.message, question, 
                            context_type, context_ref, processesAnswerResult.noValueForClass)) {
            return;
        }
        let saveResult = {
            clientRef: client_ref,
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

const handleError = function(domain, res, err, question, contextType, contextRef, noValueForClass) {
    if (err) {
        logger.error(`${domain}: question = ${question}, context_type = ${contextType}, context_ref = ${contextRef}`);
        logger.error(`${domain}: ${err}`);
        let payload = {
            success: false,
            data: {
                message: `${err}`,
                answer: "Unexpected error with service.",
                transactionId: "none"
            }
        };
        if (noValueForClass) {
            payload.data.noValueForClass = noValueForClass;
        }
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
    faq_class = utils.toLowerCase(faq_class);
    
    let classData = QS_CLASS_DATA[contextRef];
    if (utils.isNull(classData)) {
        return { success: false, message: `Cannot find context = ${contextRef}`};
    }
    let classValue = classData[faq_class];
    if (utils.isNull(classValue)) {
        return { success: false, noValueForClass: faq_class, message: `Cannot find class for context = ${contextRef} and class = ${faq_class}`};
    }
    if (utils.isEmpty(classValue)) {
        return { success: false, noValueForClass: faq_class, message: `Class has no value for context = ${contextRef} and class = ${faq_class}`};
    }
    let answer = classValue;
    if (typeof answer != 'string') {
        answer = utils.toString(Object.values(classValue), "\n\n");
        logger.info(answer)
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