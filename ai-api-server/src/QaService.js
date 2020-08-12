'use strict';

const fetch = require('node-fetch');
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('qg-service');
const dbService = require('du-dbservice').DbService();
const querystring = require('querystring');

const questionGenerationAiUrl = utils.getConfig('QUESTION_GENERATION_AI_URL', utils.CONFIG_REQUIRED);
const answerTokenGenerationAiUrl = utils.getConfig('ANSWER_TOKEN_GENERATION_AI_URL', utils.CONFIG_REQUIRED);
const questionAnswerAiUrl = utils.getConfig('QUESTION_ANSWER_AI_URL', utils.CONFIG_REQUIRED);

const QG_AI_CACHE_NAME = "QG_AI";
const TG_AI_CACHE_NAME = "TG_AI";

const GET_RESULT_REGEXP = /<label id="ans1">((.|\n|\r|\f|\t)*?)<\/label>/mi;
const NEW_LINES_REGEXP = /(?:\r\n|\r|\n)/g;

const BATCH_QG_QUEUE = [];

const cleanUpText = function(text) {
    return text.replace(NEW_LINES_REGEXP, ' ');
}

/*
 * The MongooseJS collection schema definition.
 */
const QuizSchema = { 
    name: {
        type: String,
        required: true
    },
    plainText: {
        type: String,
        required: true
    }, 
    richText: {
        type: String,
        required: false
    },
    tokens: [
        {
            questionToken: String, 
            answerToken: String,
            status: String // pending, processing, processed, error 
        }
    ]
};

const AiCacheSchema = {
    name: {
        type: String,
        index: true, 
        required: true
    }, // cache name, example QG_AI (question generation AI), QA_AI (question answer AI)
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

dbService.schema('Quiz', QuizSchema);
dbService.schema('AiCache', AiCacheSchema);
let Quiz = dbService.getModel('Quiz');
let AiCache = dbService.getModel('AiCache');
exports.Quiz = Quiz;

/**
 * Save quiz to Mongo.
 * @param {String} message message to save to database.
 * @param  {Function} cb callback.
 */
exports.saveQuiz = function(quiz, cb) {

    let { name, plainText, richText, answerTokens, _id } = quiz;

    let tokens = [];
    if (answerTokens) {
        answerTokens.forEach(value => {
            if (utils.isNotEmpty(value)) {
                tokens.push({answerToken: value.trim()})
            }
        });
    }

    console.log("saveQuiz", _id, tokens);
    let entity = {name, plainText, richText, tokens};
    if (utils.isNotEmpty(_id)) {
        entity._id = _id;
    }
    dbService.save('Quiz', entity, function(err, result) {

        if (cb) {
            cb(err, result);

            return;
        }
    });
};

/**
 * Get quiz from Mongo
 * @param {String} quizId the quiz quiz id
 */
exports.getQuizById = function(quizId, cb) {
    dbService.get(Quiz, quizId, cb);
}

/**
 * Get quiz tokens (question and answers) from Mongo
 * @param {String} quizId the quiz quiz id
 */
exports.getQuizTokens = function(quizId, cb) {
    Quiz.findById(quizId, "tokens", cb);
}

/**
 * Delete quiz from Mongo
 * @param {String} quizId the quiz quiz id
 */
exports.deleteQuizById = function(quizId, cb) {
    dbService.remove(Quiz, { _id: quizId }, cb);
}

exports.generateQuestion = function(plainText, answerToken, isDryRun, batchQueue, batchCount, batchSize, cb) {

    if (plainText.indexOf(answerToken) == -1) {
        cb(`Invalid answer token "${answerToken}"`);
        return;
    }

    plainText = cleanUpText(plainText);
    answerToken = cleanUpText(answerToken);
    let plainTextHash = utils.hash(plainText);
    let answerTokenHash = utils.hash(answerToken);

    checkCache(QG_AI_CACHE_NAME, plainTextHash, answerTokenHash, (err, result) => {

        if (result) {
            cb(null, result);
            return;
        } else if (err) {
            cb(err);
            return;
        }

        batchQueue.push({plainText, plainTextHash, answerToken, answerTokenHash, callback: cb});

        if (batchCount == batchSize) {
            // last call in the batch now call AI service using list of tokens that where not already cached.

            let answerTokens = [];
            batchQueue.forEach(data => {
                answerTokens.push(data.answerToken);
            });

            if (isDryRun) {
                batchQueue.forEach(data => {
                    saveCache(QG_AI_CACHE_NAME, data.plainTextHash, data.answerTokenHash, {questionText: 'Dry Run Cached'});
                    data.callback(null, {questionText: 'Dry Run'});
                });
                return;
            }


            generateQuestionFetch(plainText, answerTokens, (err, result) => {
                if (err) {
                    batchQueue.forEach(data => {
                        data.callback(err);
                    });
                    return;
                }

                batchQueue.forEach((data, index) => {
                    let questionText = result.questions[index];
                    data.callback(null, {questionText});
                    saveCache(QG_AI_CACHE_NAME, data.plainTextHash, data.answerTokenHash, {questionText});
                });

            });


        }

        
    });
    
}

const generateQuestionFetch = function(plainText, answerTokens, cb) {

    
    let payload = {
        context: plainText,
        answer_token: answerTokens
    };
    logger.info(`Calling QG AI service: ${questionGenerationAiUrl}`, JSON.stringify(payload));
    
    fetch(questionGenerationAiUrl, {
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(payload),
        method: "POST"
    }).then(res => res.json())
      .then(json => {

        try {

            logger.info("QG AI service result: ", json);

            cb(null, {questions: json.questions});
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

/**                                                                                   
 ************************************************************************************* 
 */

exports.generateAnswerTokens = function(plainText, isDryRun, cb) {
    plainText  = cleanUpText(plainText);
    let plainTextHash = utils.hash(plainText);
    
    checkCache(TG_AI_CACHE_NAME, plainTextHash, null, (err, result) => {

        if (result) {
            cb(null, result);
            return;
        } else if (err) {
            cb(err);
            return;
        }

        if (isDryRun) {
            
            let textArray = plainText.split(/\b\s+\b/ig);
            textArray = textArray.sort((a, b) => {
                return b.length - a.length;
            });
            let numberOfTokens = Math.min(5, textArray.length);
            let listTokenSuggestions = [];
            for (let i = 0; i < numberOfTokens; i++) {
                listTokenSuggestions.push(textArray[i]);
            }

            saveCache(TG_AI_CACHE_NAME, plainTextHash, null, {answerTokens: listTokenSuggestions});
            cb(null, {answerTokens: listTokenSuggestions});
            
            return;
        }

        generateAnswerTokensFetch(plainText, (err, result) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null, result);
            saveCache(TG_AI_CACHE_NAME, plainTextHash, null, result);
        });


    })
}

const generateAnswerTokensFetch = function(plainText, cb) {

    
    let payload = {
        context: plainText
    };
    logger.info(`Calling TG AI service: ${answerTokenGenerationAiUrl}`, JSON.stringify(payload));
    
    fetch(answerTokenGenerationAiUrl, {
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(payload),
        method: "POST"
    }).then(res => res.json())
      .then(json => {

        try {

            logger.info("TG AI service result: ", json);

            cb(null, {answerTokens: json.answer_tokens});
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

            if (utils.isEmpty(result)) {
                logger.warn('Empty result: ', body);
            }
    
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

const saveCache = function (cacheName, input1Hash, input2Hash,  data) {

    dbService.upsert(AiCache, 
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

const checkCache = function(cacheName, input1Hash, input2Hash, cb) {
    AiCache.findOne({name: cacheName, input1Hash, input2Hash}, (err, result) => {
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