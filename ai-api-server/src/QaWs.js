'use strict';

const utilWs = require('du-utils').UtilWs();
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('qg-ws');
var qaService = require('./QaService');


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

    server.put(server.getPath('/qa/text'), saveText);
    server.get(server.getPath('/qa/text/:resourceId'), getText);
    server.delete(server.getPath('/qa/text/:resourceId'), delText);
    server.get(server.getPath('/qa/generate-question/:resourceId'), generateQuestion);
    server.get(server.getPath('/qa/answer-question/:resourceId'), answerQuestion);
    logger.info('Web services api installed at /qa');

};

/**
 * PUT
 * /text
 * Save context (artical text).
 */
const saveText = async function(req, res) {

    qaService.saveText(req.body.plainText, function(err, result) {
        return utilWs.sendSuccess('qg.saveText', {resourceId: result.id}, res, true);
    });

}

/**
 * GET
 * /text/:resourceId
 * Get context (artical text).
 */
const getText = async function(req, res) {
    
    qaService.getTextById(req.params.resourceId, function(err, resourceText) {
        if (utilWs.handleError('qg.getText', res, err)) {
            return;
        }
        if (utils.isNull(resourceText)) {
            utilWs.sendUserError('qg.generateQuestion', "Resource not found.", res);
            return;
        }
        utilWs.sendSuccess('qg.getText', {success: true, resourceText: resourceText}, res, true);                      
    });

}

/**
 * DEL
 * /text/:resourceId
 * Save context (artical text).
 */
const delText = async function(req, res) {
    qaService.deleteTextById(req.params.resourceId, function(err, result) {
        if (utilWs.handleError('qg.delText', res, err)) {
            return;
        }
        utilWs.sendSuccess('qg.delText', {success: true, result: result}, res, true);                      
    });
}

/**
 * GET
 * /generate-question
 * Generate a question from resource id and an anwser token.
 */
const generateQuestion = async function(req, res) {
 
    qaService.getTextById(req.params.resourceId, function(err, resourceText) {
        if (utilWs.handleError('qg.generateQuestion', res, err)) {
            return;
        }

        if (utils.isNull(resourceText)) {
            utilWs.sendUserError('qg.generateQuestion', "Resource not found.", res);
            return;
        }

        qaService.generateQuestions(resourceText.plainText, req.query.answerToken, function(err, result) {

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
 * Answer a question from resource id and a question token.
 */
const answerQuestion = async function(req, res) {
 
    qaService.getTextById(req.params.resourceId, function(err, resourceText) {
        if (utilWs.handleError('qg.answerQuestion', res, err)) {
            return;
        }

        if (utils.isNull(resourceText)) {
            utilWs.sendUserError('qg.generateQuestion', "Resource not found.", res);
            return;
        }

        qaService.answerQuestions(resourceText.plainText, req.query.questionToken, function(err, result) {

            if (utilWs.handleError('qg.answerQuestion', res, err)) {
                return;
            }
            
            utilWs.sendSuccess('qg.answerQuestion', {success: true, answerText: result.answerText}, res, true);                      
        })
        
    });

}

