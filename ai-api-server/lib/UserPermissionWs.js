'use strict';

const utilWs = require('du-utils').UtilWs();
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('user-permission-ws');



/**
 * GET
 * /generate-token
 * Generate a JWS token for API access
 */
const generateToken = async function(req, res) {
    // if (utils.isEmpty(req.query.userName)) {
    //     utilWs.sendUserError('user-permission', "URL parameter 'userName' is empty. Please ensure 'userName' and 'password' are passed in correctly",res);
    //     return;
    // }

    
    const returner = {
        success: true
    };

    utilWs.sendSuccess('user-permission.generateToken', returner, res);
}


