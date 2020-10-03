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
nodemon -d 4 -x 'newman run --environment st-postman/client-api-local.postman_environment.json test-postman/Deakin\ AI\ -\ Client\ H5P\ API.postman_collection.json' 
```

## API Documenation

http://localhost:7040/api/v1/server/apidoc
https://des-inno-ai-api.its.deakin.edu.au/api/v1/server/apidoc
