# AI API Server

## Deployment

LOCAL: http://localhost:7040
DEV: https://des-inno-ai-api.its.deakin.edu.au

## Install and run

Assumes an instance of mongodb running locally

```
npm install
```

Add npm config to ~/.npmrc

```
registry=https://artifactory.its.deakin.edu.au/api/npm/des-inno-npm

ai-api-server:MONGO_DATABASE=aiDb
ai-api-server:QUESTION_GENERATION_AI_URL=http://research-gpu-poc-fs1.its.deakin.edu.au:8888/
ai-api-server:QUESTION_ANSWER_AI_URL=http://research-gpu-poc-fs1.its.deakin.edu.au:8892
ai-api-server:ANSWER_TOKEN_GENERATION_AI_URL=http://research-gpu-poc-fs1.its.deakin.edu.au:8891/
ai-api-server:QUESTION_SERVICE_AI_URL=http://research-gpu-poc-fs1.its.deakin.edu.au:8893/
ai-api-server:HOST_URL=http://localhost:7040
```

Run server (Ensure DCM is open)

```
npm run start-nodemon
```

Load test data
```
npm run load-test-data-[local|dev]
```

## Run Tests

Install postman for desktop

Import collection 'test-postman/Deakin AI - Client API.postman_collection.json'

Can run individually defaults are set in Save Text -> Pre-request Script

'Deakin AI - Service API - Question Generation.json' can run multiple iterations using data file 'test-postman/test-data-question-generation.json' in the Collection Runner

Run using command line
```
newman run --iteration-data test-data-question-generation.json --environment ai-env-1.postman_environment.json Deakin\ AI\ -\ Service\ API\ -\ Question\ Generation.postman_collection.json
```

With livereload
```
nodemon -d 4 -x 'newman run --environment test-postman/client-api-local.postman_environment.json test-postman/Deakin\ AI\ -\ Client\ H5P\ API.postman_collection.json' 

nodemon -d 4 -x 'newman run --environment test-postman/client-api-local.postman_environment.json test-postman/Deakin\ AI\ -\ Client\ Question\ Service\ API.postman_collection.json'
```


## API Documenation

http://localhost:7040/api/v1/server/apidoc
https://des-inno-ai-api.its.deakin.edu.au/api/v1/server/apidoc



# Interactive Media Transcription

## How to get a Lecture video:
1. [SIT124 TRI-1 2019 - 03-04-2019](https://deakin365.sharepoint.com/sites/EmergentTech/Shared%20Documents/General/Video%20Transcription/Lecture%20Videos%20from%20D2L/03-04-2019.mp4)
2. [SIT124 TRI-1 2019 - 03-18-2019](https://deakin365.sharepoint.com/sites/EmergentTech/Shared%20Documents/General/Video%20Transcription/Lecture%20Videos%20from%20D2L/03-18-2019.mp4)
3. [SIT124 TRI-1 2019 - 03-25-2019](https://deakin365.sharepoint.com/sites/EmergentTech/Shared%20Documents/General/Video%20Transcription/Lecture%20Videos%20from%20D2L/03-25-2019.mp4)
4. [SIT124 TRI-1 2019 - 04-01-2019](https://deakin365.sharepoint.com/sites/EmergentTech/Shared%20Documents/General/Video%20Transcription/Lecture%20Videos%20from%20D2L/04-01-2019.mp4)
5. [SIT124 TRI-1 2019 - 04-08-2019](https://deakin365.sharepoint.com/sites/EmergentTech/Shared%20Documents/General/Video%20Transcription/Lecture%20Videos%20from%20D2L/04-08-2019.mp4)
6. [SIT124 TRI-1 2019 - 04-15-2019](https://deakin365.sharepoint.com/sites/EmergentTech/Shared%20Documents/General/Video%20Transcription/Lecture%20Videos%20from%20D2L/04-15-2019.mp4)
7. [SIT124 TRI-1 2019 - 04-29-2019](https://deakin365.sharepoint.com/sites/EmergentTech/Shared%20Documents/General/Video%20Transcription/Lecture%20Videos%20from%20D2L/04-29-2019.mp4)
8. [SIT124 TRI-1 2019 - 05-13-2019](https://deakin365.sharepoint.com/sites/EmergentTech/Shared%20Documents/General/Video%20Transcription/Lecture%20Videos%20from%20D2L/05-13-2019.mp4)
9. [SIT124 TRI-1 2019 - 06-05-2019](https://deakin365.sharepoint.com/sites/EmergentTech/Shared%20Documents/General/Video%20Transcription/Lecture%20Videos%20from%20D2L/06-05-2019.mp4)
10. Sample (clipped) video with its transcription is in the `assets` folder of this repo

## How to get transcription for Lecture video:
1. Go to: `https://video-uat.deakin.edu.au/`
2. Click Add New -> Media Upload
3. Request for Transcription

