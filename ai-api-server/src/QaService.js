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

/*
 * The MongooseJS collection schema definition.
 */
const Schema = { 
    name: String,
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

dbService.schema('Quiz', Schema);
let Quiz = dbService.getModel('Quiz');
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

exports.generateQuestion = function(plainText, answerToken, cb) {

    if (plainText.indexOf(answerToken) == -1) {
        cb(`Invalid answer token "${answerToken}"`);
        return;
    }

    let formData = {
        context: plainText.replace(NEW_LINES_REGEXP, ' '),
        ans_tok: answerToken.replace(NEW_LINES_REGEXP, ' ')
    };
    logger.info("Calling AI service: ", formData);
    // cb(null, {questionText: "Dry Run"});
    // return;
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

            if (utils.isEmpty(result)) {
                logger.warn('Empty result: ', body);
            }

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