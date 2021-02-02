'use strict';

const utilWs = require('du-utils').UtilWs();
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('interactive-video-ws');
const async = require('async');
const qaService = require('./QaService');
const fs = require('fs');
const path = require('path');


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
    server.put(server.getPath('/iv/answer-question/:iVideoId'), answerQuestion);
    server.get(server.getPath('/iv/srtToJson/:iVideoId'), srtToJson);

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
    
    exports.getIVideoById(req.params.iVideoId, (err, ivideo) => {
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
 * Load ivideo from DB
 * @param {*} iVideoId 
 * @param {*} cb 
 */
exports.getIVideoById = function(iVideoId, cb) {
    IVideo.findById(iVideoId).lean().exec(cb);
}

/**
 * Load ivideo from DB
 * @param {*} iVideoId 
 * @param {*} cb 
 */
exports.getIVideoByQuizId = function(quizId, cb) {
    IVideo.findOne({quizId}).lean().exec(cb);
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
         
         qaService.answerQuestions(req.body.transcription, req.body.question, function(err, result) {
 
             if (utilWs.handleError('iv.answerQuestion', res, err)) {
                 return;
             }
             
             utilWs.sendSuccess('iv.answerQuestion', {success: true, data: result.answerText}, res, true);                      
         })
         
    //});
 
 }

const srtToJson = async function(req, res) {
    let srtFile = fs.readFileSync('mock-data/ivideo/sample011_1.srt', 'utf8');
    let jsonData = parseSrtToJson(srtFile);

    utilWs.sendSuccess('iv.srtToJson', {success: true, data: jsonData}, res, true);
}


const getSeconds = function (time) {
    var hms = time;
    var a = hms.split(':');
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    return seconds;

}

const parseSrtToJson = function (content) {
    var quotesArray = [];
    var lines = content.split('\r\n');
    var currentQuoteNumber = 0;
    //Define the different lines in .srt file.
    var lineTypes = {
      INDEX : 0,
      TIMECODE: 1,
      TEXT: 2
    };
    //Assign the lineTypes for paring
    var nextLineType = lineTypes.INDEX;
  
    //loop over the whole file
    for(var n in lines) {
      //Get each line
      var line = lines[n].toString();
      //Convert it to line number for parsing with lineTypes
      var quoteNumber = parseInt(line, 10) - 1;
        if (line == '')  nextLineType = lineTypes.INDEX;
        else if (nextLineType == lineTypes.INDEX && quoteNumber !== NaN) {
            currentQuoteNumber = quoteNumber;
            /*
            i: Number, s: Start time, e: End Time, w: Text or string
            */
            var quote = { i: '', s: '', e: '', w: '' };
            quotesArray[currentQuoteNumber] = quote;
            quotesArray[currentQuoteNumber].i = parseInt(quoteNumber.toString()) - 1;
            //Once Number is parsed, change it to line with time given
            nextLineType = lineTypes.TIMECODE;
        } else if (nextLineType == lineTypes.TIMECODE) {
            var timeCode = line.split(' --> ');
            var startTime = timeCode[0].split(',');
            var endTime = timeCode[1].split(',');
            quotesArray[currentQuoteNumber].s  = getSeconds(startTime[0]) + startTime[1];
            quotesArray[currentQuoteNumber].e  = getSeconds(endTime[0]) + endTime[1];
            //Once time is parsed change it for text to be parsed
            nextLineType = lineTypes.TEXT;
        } else if (nextLineType == lineTypes.TEXT) {
            if (quotesArray[currentQuoteNumber].w != '') {
              quotesArray[currentQuoteNumber].w += ' ';
        }
        quotesArray[currentQuoteNumber].w += line;
      }
    }
    return quotesArray;
 }

