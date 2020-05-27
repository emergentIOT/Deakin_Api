'use strict';

const utilWs = require('du-utils').UtilWs();
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('qg-ws');
const async = require('async');
const qaService = require('./QaService');

const Quiz = qaService.Quiz;

/**
 * Install User Permission Web Service API
 */
exports.installQaWs = async function(server) {

    // var jwtExpressOptions = {
    //     secret: secret,
    //     credentialsRequired: true, // false = allow non-JWTToken authorised calls to API (ie Anonymous User).
    //     requestProperty: 'auth' //  req.user is set for token payload when successfull // (user is jwt-express default.)
    // };
    // server.use("/api", expressJWT(jwtExpressOptions).unless({ path: "/api/v1/user-permission/generate-token" }));

    server.put(server.getPath('/qa/quiz'), saveQuiz);
    server.get(server.getPath('/qa/quiz/:quizId'), getQuiz);
    server.delete(server.getPath('/qa/quiz/:quizId'), delQuiz);
    server.get(server.getPath('/qa/generate-question/:quizId'), generateQuestion);
    server.put(server.getPath('/qa/generate-questions/:quizId'), generateQuestions);
    server.get(server.getPath('/qa/answer-question/:quizId'), answerQuestion);
    logger.info('Web services api installed at /qa');

};

/**
 * PUT
 * /quiz
 * Save quiz text and tokens.
 */
const saveQuiz = async function(req, res) {
    qaService.saveQuiz(req.body, function(err, result) {
        if (utilWs.handleError('qg.saveQuiz', res, err)) {
            return;
        }
        return utilWs.sendSuccess('qg.saveQuiz', {quizId: result.id}, res, true);
    });

}

/**
 * GET
 * /quiz/:quizId
 * Get quiz.
 */
const getQuiz = async function(req, res) {
    
    qaService.getQuizById(req.params.quizId, function(err, quiz) {
        if (utilWs.handleError('qg.getQuiz', res, err)) {
            return;
        }
        if (utils.isNull(quiz)) {
            utilWs.sendUserError('qg.generateQuestion', "Quiz not found.", res);
            return;
        }
        utilWs.sendSuccess('qg.getQuiz', {success: true, quiz: quiz}, res, true);                      
    });

}

/**
 * DEL
 * /quiz/:quizId
 * Delete quiz.
 */
const delQuiz = async function(req, res) {
    qaService.deleteQuizById(req.params.quizId, function(err, result) {
        if (utilWs.handleError('qg.delQuiz', res, err)) {
            return;
        }
        utilWs.sendSuccess('qg.delQuiz', {success: true, result: result}, res, true);                      
    });
}

/**
 * GET
 * /generate-question
 * Generate question tokens for all answer tokens in quiz.
 */
const generateQuestions = async function(req, res) {
 
    qaService.getQuizById(req.params.quizId, function(err, quiz) {
        if (utilWs.handleError('qg.generateQuestion', res, err)) {
            return;
        }

        if (utils.isNull(quiz)) {
            utilWs.sendUserError('qg.generateQuestion', "Quiz not found.", res);
            return;
        }


        Quiz.update({_id: quiz._id}, {'$set': {
            'tokens.$[].status': 'pending', 
            'tokens.$[].questionToken': ''
        }}, function(err) {

            if (err) {
                logger.error('qg.generateQuestion-update-status: ' + err);
                return;
            }

            async.eachLimit(quiz.tokens, 1, (token, callback) => {

                Quiz.update({_id: quiz._id, 'tokens._id': token._id}, {'$set': {
                    'tokens.$.status': 'processing'
                }}, function(err) {
                    if (err) {
                        logger.error('qg.generateQuestion-update-token-question: ' + err);
                        callback(err);
                        return;
                    }
console.log("token", token.answerToken);
                    qaService.generateQuestion(quiz.plainText, token.answerToken, function(err, result) {
                        if (err) {
                            logger.error('qg.generateQuestion-generate-queston: ' + err);
                            callback(err);
                            return;
                        }
                        Quiz.update({_id: quiz._id, 'tokens._id': token._id}, {'$set': {
                            'tokens.$.status': 'processed',
                            'tokens.$.questionToken': result.questionText,
                        }}, function(err) {
                            if (err) {
                                logger.error('qg.generateQuestion-update-token-question: ' + err);
                                callback(err);
                                return;
                            }
                            callback();
                        });
                    });
                });
            });

        });

        

        utilWs.sendSuccess('qg.generateQuestion', {success: true}, res, true); 
        // utilWs.sendSuccess('qg.generateQuestion', {success: true, questionText: result.questionText}, res, true);                      
        
    });

}

/**
 * GET
 * /generate-question
 * Generate a question from quiz id and an anwser token.
 */
const generateQuestion = async function(req, res) {
 
    qaService.getQuizById(req.params.quizId, function(err, quiz) {
        if (utilWs.handleError('qg.generateQuestion', res, err)) {
            return;
        }

        if (utils.isNull(quiz)) {
            utilWs.sendUserError('qg.generateQuestion', "Quiz not found.", res);
            return;
        }

        qaService.generateQuestion(quiz.plainText, req.query.answerToken, function(err, result) {

            if (utilWs.handleError('qg.generateQuestion', res, err)) {
                return;
            }
            
            utilWs.sendSuccess('qg.generateQuestion', {success: true, questionText: result.questionText}, res, true);                      
        })
        
    });

}

/**
 * GET
 * /answer-question
 * Answer a question from quiz id and a question token.
 */
const answerQuestion = async function(req, res) {
 
    qaService.getQuizById(req.params.quizId, function(err, quiz) {
        if (utilWs.handleError('qg.answerQuestion', res, err)) {
            return;
        }

        if (utils.isNull(quiz)) {
            utilWs.sendUserError('qg.generateQuestion', "Quiz not found.", res);
            return;
        }

        qaService.answerQuestions(quiz.plainText, req.query.questionToken, function(err, result) {

            if (utilWs.handleError('qg.answerQuestion', res, err)) {
                return;
            }
            
            utilWs.sendSuccess('qg.answerQuestion', {success: true, answerText: result.answerText}, res, true);                      
        })
        
    });

}

