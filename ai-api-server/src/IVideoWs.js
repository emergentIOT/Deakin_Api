'use strict';

const utilWs = require('du-utils').UtilWs();
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('interactive-video-ws');
const async = require('async');
const qaService = require('./QaService');

/*
 * The MongooseJS collection schema definition.
 */
const IVideoSchema = { 
    name: {
        type: String,
        required: true
    },    
    description: String,
    transcriptionUrl: String,
    videoUrl: String,
    quizId: String,
    questions: [
        {
            questionText: String, 
            answerText: String,
        }
    ]
};
dbService.schema('IVideo', IVideoSchema);
let IVideo = dbService.getModel('IVideo');

/**
 * Install User Permission Web Service API
 */
exports.installWs = async function(server) {

    server.get(server.getPath('/iv/ivideos'), ivideos);
    server.put(server.getPath('/iv/ivideo'), saveIVideo);
    server.get(server.getPath('/iv/ivideo/:iVideoId'), getIVideo);
    server.delete(server.getPath('/iv/ivideo/:iVideoId'), delIVideo);
    server.get(server.getPath('/iv/answer-question/:iVideoId'), answerQuestion);
    
    logger.info('Interactive video web services installed at /iv');

};

/**
 * PUT
 * /ivideo
 * Save interactive video.
 */
const saveIVideo = async function(req, res) {

    let { name, description, transcriptionUrl, videoUrl, questions, quizId, _id } = req.body;

    logger.debug("saveIVideo", _id, questions);
    let entity = {name, description, transcriptionUrl, videoUrl, questions};
    if (utils.isNotEmpty(_id)) {
        entity._id = _id;
    }
    if (utils.isNotEmpty(quizId)) {
        entity.quizId = quizId;
    }
    dbService.save('IVideo', entity, (err, result) => {

        if (utilWs.handleError('iv.saveIVideo', res, err)) {
            return;
        }
        return utilWs.sendSuccess('iv.saveIVideo', {data: result._id}, res, true);

    });

}

/**
 * GET
 * /ivideos
 * Search and list quizzes.
 */
const ivideos = async function(req, res) {
    
    IVideo.find({}, (err, result) => {
        if (utilWs.handleError('iv.ivideos', res, err)) {
            return;
        }

        utilWs.sendSuccess('iv.ivideos', {success: true, data: result}, res, true);                      
    });

}

/**
 * GET
 * /ivideo/:iVideoId
 * Get interactive video.
 */
const getIVideo = async function(req, res) {
    
    IVideo.findById(req.params.iVideoId, (err, ivideo) => {
        if (utilWs.handleError('iv.getIVideo', res, err)) {
            return;
        }
        if (utils.isNull(ivideo)) {
            utilWs.sendUserError('iv.getIVideo', "Interactive video not found.", res);
            return;
        }
        utilWs.sendSuccess('iv.getIVideo', {success: true, data: ivideo}, res, true);                      
    });

}

/**
 * DEL
 * /ivideo/:iVideoId
 * Delete interactive video.
 */
const delIVideo = async function(req, res) {
    IVideo.remove({_id: req.params.iVideoId }, (err, result) => {
        if (utilWs.handleError('iv.delIVideo', res, err)) {
            return;
        }
        utilWs.sendSuccess('iv.delIVideo', {success: true, data: result}, res, true);                      
    });
}


/**
 * GET
 * /answer-question
 * Answer a question from iVideo id and a question token.
 */
const answerQuestion = async function(req, res) {
     
    /*IVideo.findById(req.params.iVideoId, function(err, ivideo) {
        console.log("IVideo found", ivideo);
        if (utilWs.handleError('iv.IVideo', res, err)) {
             return;
         }
 
         if (utils.isNull(ivideo)) {
             utilWs.sendUserError('iv.getIVideo', "iVideo not found.", res);
             return;
         }*/
         
         qaService.answerQuestions(req.query.transcription, req.query.question, function(err, result) {
 
             if (utilWs.handleError('iv.answerQuestion', res, err)) {
                 return;
             }
             
             utilWs.sendSuccess('iv.answerQuestion', {success: true, data: result.answerText}, res, true);                      
         })
         
    //});
 
 }