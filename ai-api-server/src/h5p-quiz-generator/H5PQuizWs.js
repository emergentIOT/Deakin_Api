'use strict';

const utilWs = require('du-utils').UtilWs();
const utils = require('du-utils').UtilGeneral();
const logger = require('du-logger').LoggingService('h5p-quiz-generation-ws');
const async = require('async');
const fetch = require('node-fetch');
const AdmZip = require("adm-zip");
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const iVideoService = require('../IVideoWs');
const quizService = require('../QaService');

const HOST_URL = utils.getConfig('HOST_URL', utils.CONFIG_REQUIRED);

/**
 * Install Web Service API
 */
exports.installWs = async function(server) {

    server.get(server.getPath('/h5p/generate-quiz/:resourceId'), generateQuiz);
    
    
    logger.info('H5P quiz generator installed at /iv');

};


/**
 * GET
 * /h5p/generate-quiz/:resourceId
 */
const generateQuiz = async function(req, res) {

    loadIVideoAndQuiz(req.params.resourceId, (err, data) => {
        if (utilWs.handleError('h5p.loadIVideoAndQuiz', res, err)) {
            return;
        }
        
        data.ivideo.videoUrl = HOST_URL + data.ivideo.videoUrl;

        let contentJson = fs.readFileSync(path.join(__dirname, 'templates/iv-multiple-choice/content/content.json.template'), 'utf8');
        let contentJsonRendered = JSON.parse(ejs.render(contentJson, data));

        let h5pJson = fs.readFileSync(path.join(__dirname, 'templates/iv-multiple-choice/h5p.json.template'), 'utf8');
        let h5pJsonRendered = JSON.parse(ejs.render(h5pJson, data));
    
        console.log("content", contentJsonRendered.interactiveVideo.assets.interactions.length);
        // contentJsonRendered.interactiveVideo.assets.interactions.forEach(interaction => console.log("interaction", interaction.action.params.answers) );
    
        if (req.query.isTest) {
            // if in test mode just return the content json.
            utilWs.sendSuccess('h5p.generateQuiz', {success: true, data: contentJsonRendered}, res, true);
        } else {
            // return zip / h5p file
            let returnType = req.query.isReturnTypeZip ? 'zip' : 'h5p';
            let zipFileName = toSaveFileName(data.quiz.name);
            let mcqTemplatePath = "./src/h5p-quiz-generator/templates/iv-multiple-choice";
            let zip = createH5pPackage(mcqTemplatePath, contentJsonRendered, h5pJsonRendered);
            res.set('Content-Type', 'application/zip');
            res.set('Content-Disposition', `attachment; filename=${zipFileName}.${returnType}`);
            res.send(zip.toBuffer());
        }
        

    });



   
}

const loadIVideoAndQuiz = function(iVideoId, cb) {
    let data = {};
    
    iVideoService.getIVideoById(iVideoId, (err1, result1) => {
    
        if (err1) {
            return cb(err1);
        }
        if (utils.isNull(result1)) {
            return cb(`IVideo with id '${iVideoId}' not found.`);
        }
        data.ivideo = result1;
        
        quizService.getQuizById(data.ivideo.quizId, (err2, result2) => {
            if (err2) {
                return cb(err2);
            }
            if (utils.isNull(result2)) {
                return cb(`Quiz with id '${data.ivideo.quizId}' not found.`);
            }
            data.quiz = result2;
            loadTranscriptionData(data.ivideo, data.quiz, (err) => {
                if (err) {
                    return cb(err);
                }
                cb(null, data);
            })
        });

    });

}

const createH5pPackage = function(templatePath, contentJson, h5pJson) {

    var zip = new AdmZip();
    zip.addLocalFolder(templatePath);
    zip.deleteFile('content/content.json.template');
    zip.deleteFile('h5p.json.template')
    zip.addFile('content/content.json', Buffer.from(JSON.stringify(contentJson, null, 4)));
    zip.addFile('h5p.json', Buffer.from(JSON.stringify(h5pJson, null, 4)));
    return zip; 

}

const loadTranscriptionData = function(iVideo, quiz, cb) {

    getTranscription(iVideo, (err, transciptionBlocks) => {
        if (err) {
            return cb(err);
        }
        quiz.tokens.forEach(token => {
            let matchedBlockIndex = calcMatchedBlockIndexes(token.answerToken, transciptionBlocks);
            if (matchedBlockIndex.length > 0) {
                token.startTime = msToSeconds(transciptionBlocks[matchedBlockIndex[0]].s);
                token.endTime = msToSeconds(transciptionBlocks[matchedBlockIndex[matchedBlockIndex.length - 1]].e);
            } else {
                logger.warn(`Failed to match transcription block for answer ${token.answerToken}`, token);
                token.startTime = msToSeconds(transciptionBlocks[transciptionBlocks.length - 1].e);
                token.endTime = msToSeconds(transciptionBlocks[transciptionBlocks.length - 1].e);
            }
            token.answerToken = toFirstCharacterUpperCase(token.answerToken);
        });
        quiz.startTime = msToSeconds(transciptionBlocks[0].s);
        quiz.endTime = msToSeconds(transciptionBlocks[transciptionBlocks.length - 1].e);
        console.log('quiz', quiz);
        cb();
    })
}

const getTranscription = function(iVideo, cb) {
    fetch(HOST_URL + iVideo.transcriptionUrl, {
        headers: {
            "content-type": "application/json",
        },
        method: "get"
    })
    .then(res => res.json())
    .then(json => {
        try {
            cb(null, json)
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

const calcMatchedBlockIndexes = function(answerText, transcriptionBlocks) {

    var answerTextSplit = answerText.split(' ');

    var matchedBlockIndexes = [];

    transcriptionBlocks.forEach((item, index) => {

      if (matchedBlockIndexes.length == 0) {
        matchedBlockIndexes = [];
        if (item.w == answerTextSplit[0]) {
          var tillRun = (index + answerTextSplit.length) - 1;
          matchedBlockIndexes.push(index);

          var answerTextSplitIndex = 1;
          for (var i = index + 1; i <= tillRun; i++) {
            if (wordEquals(answerTextSplit[answerTextSplitIndex], transcriptionBlocks[i].w)) {
              matchedBlockIndexes.push(i);
            }
            else {
              console.log('Did not match', answerTextSplit[answerTextSplitIndex] , transcriptionBlocks[i].w);
              matchedBlockIndexes = [];
              break;
            }

            answerTextSplitIndex++;
          }
        }
      }

    });

    return matchedBlockIndexes;

}

const wordEquals = function(w1, w2) {
    w1 = w1.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    w2 = w2.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    return w1 == w2;
}

const toSaveFileName = function(str) {
    str = str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    str = str.replace(' ', '-');
    str = str.replace('--', '-');
    return str;
}

const msToSeconds = function(ms) {
      return Math.round(ms / 1000);
}

const toFirstCharacterUpperCase = function(str) {
    if (utils.isEmpty(str)) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}