'use strict';

const utilWs = require('du-utils').UtilWs();
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('qg-ws');
var qgService = require('./QgService');


/**
 * Install User Permission Web Service API
 */
exports.installQgWs = async function(server) {

    // var jwtExpressOptions = {
    //     secret: secret,
    //     credentialsRequired: true, // false = allow non-JWTToken authorised calls to API (ie Anonymous User).
    //     requestProperty: 'auth' //  req.user is set for token payload when successfull // (user is jwt-express default.)
    // };
    // server.use("/api", expressJWT(jwtExpressOptions).unless({ path: "/api/v1/user-permission/generate-token" }));

    server.put(server.getPath('/qg/text'), saveText);
    server.get(server.getPath('/qg/text/:resourceId'), getText);
    server.delete(server.getPath('/qg/text/:resourceId'), delText);
    server.get(server.getPath('/qg/generate-question/:resourceId'), generateQuestion);
    logger.info('Web services api installed at /qg');

};

/**
 * PUT
 * /text
 * Save context (artical text).
 */
const saveText = async function(req, res) {

    qgService.saveText(req.body.plainText, function(err, result) {
        return utilWs.sendSuccess('qg.saveText', {resourceId: result.id}, res, true);
    });

}

/**
 * GET
 * /text/:resourceId
 * Get context (artical text).
 */
const getText = async function(req, res) {
    
    qgService.getTextById(req.params.resourceId, function(err, resourceText) {
        if (utilWs.handleError('qg.getText', res, err)) {
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
    qgService.deleteTextById(req.params.resourceId, function(err, result) {
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
    // if (utils.isEmpty(req.query.userName)) {
    //     utilWs.sendUserError('user-permission', "URL parameter 'userName' is empty. Please ensure 'userName' and 'password' are passed in correctly",res);
    //     return;
    // }

    qgService.getTextById(req.params.resourceId, function(err, resourceText) {
        if (utilWs.handleError('qg.generateQuestion', res, err)) {
            return;
        }


        
        utilWs.sendSuccess('qg.generateQuestion', {success: true, resourceText: resourceText}, res, true);                      
    });


}


