'use strict';

const utilWs = require('du-utils').UtilWs();
const logger = require('du-logger').LoggingService('fb-ws');

/**
 * Install Web Service API
 */
exports.installWs = async function (server) {
    server.get(server.getPath('/fs/send-feedback'), sendFeedback);
    logger.info('Feedback service api installed at /fs');
};

/**
 * GET
 * /send-feedback
 * Send feedback.
 */
const sendFeedback = async function (req, res) {
    let question = req.query.question;
    let feedback = req.query.feedback;

    // Store response in MongoDB or Firebase here...

    utilWs.sendSuccess('fs.sendFeedback', { success: true, data: {"response": "Feedback received"} }, res, true);
}
