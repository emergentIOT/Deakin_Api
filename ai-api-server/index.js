'use strict';

const server = require('du-server').create('IDR Content Server');
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('api-server');
const async = require('async');
const qaWs = require('./src/QaWs');
const iVideoWs = require('./src/IVideoWs')
const h5pQuizWs = require('./src/h5p-quiz-generator/H5PQuizWs');
const questionService = require('./src/QuestionService');
const feedbackService = require('./src/FeedbackService');

// Make sure server is ran on a known and supported NodeJS Version.
utils.assertNodeRuntime();

// Add this to the VERY top of the first file loaded in your app
// var apm = require('elastic-apm-node').start({
//     // Override service name from package.json
//     // Allowed characters: a-z, A-Z, 0-9, -, _, and space
//     // serviceName: '',

//     // Use if APM Server requires a token
//     // secretToken: '',

//     // Set custom APM Server URL (default: http://localhost:8200)
//     serverUrl: 'http://des-inno-docker-fs1.its.deakin.edu.au:9000/'
// })

//
// Server Bootstrap Sequence.
//

// Install RAML API for Web Service API validation.
const installRAML = function(done) {
    logger.info('Initialising RAML Validation Middleware');
    server.installRAML('raml/api-combined.raml', function(err, server) {
        if (err) {
            logger.error('Error: ' + err);
            logger.error(err.stack);
        }
        done(err, server);
    });
};

// Install Server Web Service.
// Server param comes from previous step, ie done(err -->server<--)
const installWebServices = function(server, done) {
    //logger.info('Initialising Web Service APIs.');
    try {
        // Single Signon Login Service.
        //var loginService = userWs.createSSOLoginService();

        // JWT Session Management.
        // var jwtSessionService = userWs.createJWTSessionService();
        // jwtSessionService.addPathExclusions(userWs.getSessionExcludedPaths(server));
        // jwtSessionService.addPathExclusions(server.getSessionExcludedPaths());
        // // ignore la for now.
        // jwtSessionService.addPathExclusions([/.*\/la\/.*/]);
        // // bind session service to path /api minus the exclusions above.
        // jwtSessionService.installSessionService('/api', server);

        // server.installAPIDocsWs('raml/api-combined.raml');

        qaWs.installWs(server);
        iVideoWs.installWs(server);
        h5pQuizWs.installWs(server);
        questionService.installWs(server);
        feedbackService.installWs(server);

        server.addStatic('/mock-data', 'mock-data');
       
        done(null, server);
        return;
    } catch (err) {
        if (err) {
            logger.error('Error: ' + err);
            logger.error(err.stack);
        }
        done(err);
        return;
    }
};

// Start Server listening.
const startListening = function(server, done) {
    server.listen(function() {
        done();
    });
};

//
// Commence bootstrap sequence.
//
async.waterfall([installRAML, installWebServices, startListening], 
    function(err) {
        //
        // Boot sequence complete.
        //
        if (err) {
            logger.error('Error: ' + err);
            logger.error(err.stack);
            process.exit(1); // eslint-disable-line
        }
        logger.info('Server Started');
    }
);