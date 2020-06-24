'use strict';

const fetch = require('node-fetch');
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('qg-service');
const dbService = require('du-dbservice').DbService();
const querystring = require('querystring');

const questionGenerationAiUrl = utils.getConfig('QUESTION_GENERATION_AI_URL', utils.CONFIG_REQUIRED);
const questionAnswerAiUrl = utils.getConfig('QUESTION_ANSWER_AI_URL', utils.CONFIG_REQUIRED);


const GET_RESULT_REGEXP = /<label id="ans1">((.|\n|\r|\f|\t)*?)<\/label>/mi;
const NEW_LINES_REGEXP = /(?:\r\n|\r|\n)/g;

const BATCH_QG_QUEUE = [];

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
        required: true
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

    plainText = plainText.replace(NEW_LINES_REGEXP, ' ');
    answerToken = answerToken.replace(NEW_LINES_REGEXP, ' ');
    let plainTextHash = utils.hash(plainText);
    let answerTokenHash = utils.hash(answerToken);

    generateQuestionCheckCache(plainTextHash, answerTokenHash, (err, result) => {

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
                    generateQuestionSaveCache(data.plainTextHash, data.answerTokenHash, 'Dry Run Cached');
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
                    generateQuestionSaveCache(data.plainTextHash, data.answerTokenHash, questionText);
                });

            });


        }

        
    });
    
}

const generateQuestionSaveCache = function (plainTextHash, answerTokenHash,  questionText) {

    dbService.upsert(AiCache, 
        {
            name: "QG_AI", 
            input1Hash: plainTextHash, 
            input2Hash: answerTokenHash
        }, 
        {
            name: "QG_AI", 
            input1Hash: plainTextHash, 
            input2Hash: answerTokenHash, 
            data: {questionText}
        },
        (err, result) => {
            if (err) {
                logger.error("Error saving cache: ", err);
            }
    });
}

const generateQuestionCheckCache = function(plainTextHash, answerTokenHash, cb) {
    AiCache.findOne({name: "QG_AI", input1Hash: plainTextHash, input2Hash: answerTokenHash}, (err, result) => {
        if (err) {
            cb(err);
            return;
        }
        if (result && result.data && utils.isNotEmpty(result.data.questionText)) {
            cb(null, result.data);
        } else {
            cb(null, null);
        }
    });
}

const generateQuestionFetch = function(plainText, answerTokens, cb) {

    
    let payload = {
        context: plainText,
        answer_token: answerTokens
    };
    logger.info("Calling AI service: ", JSON.stringify(payload));
    
    fetch(questionGenerationAiUrl, {
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(payload),
        method: "POST"
    }).then(res => res.json())
      .then(json => {

        try {

            logger.info("AI service result: ", json);

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