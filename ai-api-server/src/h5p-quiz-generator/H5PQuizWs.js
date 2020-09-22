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
const { error } = require('console');

const HOST_URL = utils.getConfig('HOST_URL', utils.CONFIG_REQUIRED);

/**
 * Install Web Service API
 */
exports.installWs = async function(server) {

    server.get(server.getPath('/h5p/generate-quiz/:quizId'), generateQuiz);
    
    
    logger.info('H5P quiz generator installed at /iv');

};


/**
 * GET
 * /h5p/generate-quiz/:quizId
 */
const generateQuiz = async function(req, res) {

    loadQuiz(req.params.quizId, (err, data) => {
        if (utilWs.handleError('h5p.loadQuiz', res, err)) {
            return;
        }
        
        let template = '';
        if (utils.isNotNull(data.ivideo)) { // if has ivideo use iv-multiple-choice template
            template = 'iv-multiple-choice';
            data.ivideo.videoUrl = HOST_URL + data.ivideo.videoUrl;
        } else { // otherwse use plain multiple choice.
            template = 'question-set-multiple-choice';
        }

        let templatePath = path.join(__dirname, `templates/${template}/content/content.json.template`);
        logger.info(`Load template: ${templatePath}`);
        let contentJson = fs.readFileSync(templatePath, 'utf8');
        let contentJsonString = ejs.render(contentJson, data);
        let contentJsonRendered;
        try {
            contentJsonRendered = JSON.parse(contentJsonString);
        } catch(e) {
            let errorJson = path.join(__dirname, 'error.json');
            fs.writeFileSync(errorJson, contentJsonString);
            logger.error(`Problem parsing JSON from rendered content, see file '${errorJson}'`, e);
            utilWs.handleError('h5p.loadQuiz - Problem parsing JSON from rendered content', res, e);
            return;
        }

        let h5pJson = fs.readFileSync(path.join(__dirname, `templates/${template}/h5p.json.template`), 'utf8');
        let h5pJsonRendered = JSON.parse(ejs.render(h5pJson, data));
    
        // console.log("content", contentJsonRendered.interactiveVideo.assets.interactions.length);
        // contentJsonRendered.interactiveVideo.assets.interactions.forEach(interaction => console.log("interaction", interaction.action.params.answers) );
    
        logger.info(`Succeffully rendered template: ${template}`);
        
        if (req.query.isTest) {
            // if in test mode just return the content json.
            utilWs.sendSuccess('h5p.generateQuiz', {success: true, data: contentJsonRendered}, res, true);
        } else {
            // return zip / h5p file
            let returnType = req.query.isReturnTypeZip ? 'zip' : 'h5p';
            let zipFileName = toSaveFileName(data.quiz.name);
            let mcqTemplatePath = `./src/h5p-quiz-generator/templates/${template}`;
            let zip = createH5pPackage(mcqTemplatePath, contentJsonRendered, h5pJsonRendered);
            res.set('Content-Type', 'application/zip');
            res.set('Content-Disposition', `attachment; filename=${zipFileName}.${returnType}`);
            res.send(zip.toBuffer());
        }
        

    });
   
}

/**
 * Load the quiz and the video if associated
 * @param {*} quizId 
 * @param {*} cb 
 */
const loadQuiz = function(quizId, cb) {
    let data = {};

    quizService.getQuizById(quizId, (err1, result1) => {
        if (err1) {
            return cb(err1);
        }
        if (utils.isNull(result1)) {
            return cb(`Quiz with id '${quizId}' not found.`);
        }
        data.quiz = result1;

        data.quiz.tokens.forEach(token => {
            token.answerToken = toFirstCharacterUpperCase(token.answerToken);
        });


        iVideoService.getIVideoByQuizId(quizId, (err2, result2) => {
    
            if (err2) {
                return cb(err2);
            }
            if (utils.isNotNull(result2)) {
                
                data.ivideo = result2;
                
                // if there is an ivideo load transcription data
                loadTranscriptionData(data.ivideo, data.quiz, (err) => {
                    if (err) {
                        return cb(err);
                    }
                    cb(null, data);
                });
                
            } else {
                cb(null, data);
            }
    
        });

    });
    
    

}

const createH5pPackage = function(templatePath, contentJson, h5pJson) {

    var zip = new AdmZip();
    zip.addLocalFolder(templatePath);
    zip.deleteFile('content/content.json.template');
    zip.deleteFile('content/');
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
        });
        quiz.startTime = msToSeconds(transciptionBlocks[0].s);
        quiz.endTime = msToSeconds(transciptionBlocks[transciptionBlocks.length - 1].e);
        cb();
    })
}

const getTranscription = function(iVideo, cb) {
    fetch("http://127.0.0.1:7040" + iVideo.transcriptionUrl, {
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
    str = str.replace(/ /g, '-');
    str = str.replace(/\-\-/, '-');
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