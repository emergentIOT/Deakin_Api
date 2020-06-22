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


    server.get(server.getPath('/qa/quizzes'), quizzes);
    server.put(server.getPath('/qa/quiz'), saveQuiz);
    server.get(server.getPath('/qa/quiz/:quizId'), getQuiz);
    server.get(server.getPath('/qa/quiz-tokens/:quizId'), getQuizTokens);
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
        return utilWs.sendSuccess('qg.saveQuiz', {data: result._id}, res, true);
    });

}

/**
 * GET
 * /quizzes
 * Search and list quizzes.
 */
const quizzes = async function(req, res) {
    
    Quiz.find({}, (err, result) => {
        if (utilWs.handleError('qg.quizzes', res, err)) {
            return;
        }

        utilWs.sendSuccess('qg.quizzes', {success: true, data: result}, res, true);                      
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
            utilWs.sendUserError('qg.getQuiz', "Quiz not found.", res);
            return;
        }
        utilWs.sendSuccess('qg.getQuiz', {success: true, data: quiz}, res, true);                      
    });

}

/**
 * GET
 * /quiz/:quizId
 * Get quiz.
 */
const getQuizTokens = async function(req, res) {
    
    qaService.getQuizTokens(req.params.quizId, function(err, quiz) {
        if (utilWs.handleError('qg.getQuizTokens', res, err)) {
            return;
        }
        if (utils.isNull(quiz)) {
            utilWs.sendUserError('qg.getQuizTokens', "Quiz not found.", res);
            return;
        }
        utilWs.sendSuccess('qg.getQuizTokens', {success: true, data: quiz}, res, true);                      
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
        utilWs.sendSuccess('qg.delQuiz', {success: true, data: result}, res, true);                      
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
                logger.error('qg.generateQuestions-update-status: ' + err);
                return;
            }

            quiz.tokens.forEach(token => console.log(`qg.generateQuestions-pending: quizId = ${quiz._id}, answerToken = ${token.answerToken}`));
            
            async.eachLimit(quiz.tokens, 1, (token, callback) => {

                Quiz.update({_id: quiz._id, 'tokens._id': token._id}, {'$set': {
                    'tokens.$.status': 'processing'
                }}, function(err) {
                    if (err) {
                        logger.error('qg.generateQuestion-update-token-question: ' + err);
                        callback(err);
                        return;
                    }
                    logger.info(`qg.generateQuestions-processing: quizId = ${quiz._id}, tokenId = ${token._id}, answerToken = ${token.answerToken}`);
                    qaService.generateQuestion(quiz.plainText, token.answerToken, function(err, result) {
                        let status = 'processed';
                        let questionText = "";
                        if (err) {
                            logger.error('qg.generateQuestion-generate-queston: ' + err);
                            questionText = "Error: " + err;
                            status = 'error';
                        } else {
                            questionText = result.questionText;
                        }
                        Quiz.update({_id: quiz._id, 'tokens._id': token._id}, {'$set': {
                            'tokens.$.status': status,
                            'tokens.$.questionToken': questionText,
                        }}, function(err, result2) {
                            if (err) {
                                logger.error('qg.generateQuestion-update-token-question: ' + err);
                                callback(err);
                                return;
                            }
                            logger.info(`qg.generateQuestions-processed: quizId = ${quiz._id}, tokenId = ${token._id}, ${questionText} ${token.answerToken}`, 
                                            result2);
                            callback();
                        });
                    });
                });
            });

        });

        

        utilWs.sendSuccess('qg.generateQuestion', {success: true, data:  quiz._id}, res, true); 
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
            
            utilWs.sendSuccess('qg.generateQuestion', {success: true, data: result.questionText}, res, true);                      
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
            
            utilWs.sendSuccess('qg.answerQuestion', {success: true, data: result.answerText}, res, true);                      
        })
        
    });

}

