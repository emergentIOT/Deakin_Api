# AI API Server

## Install and run

Assumes an instance of mongodb running locally

```
npm install
```

Add npm config to ~/.npmrc

```
registry=https://artifactory.its.deakin.edu.au/api/npm/pals-npm

ai-api-server:MONGO_DATABASE=aiDb
ai-api-server:QUESTION_GENERATION_AI_URL=http://research-gpu-poc-fs1.its.deakin.edu.au:8888/
ai-api-server:QUESTION_ANSWER_AI_URL=http://research-gpu-poc-fs1.its.deakin.edu.au:8889/
```

Run server

```
npm run start-nodemon
```

## Run Tests

Install postman for desktop

Import collection 'test-postman/Deakin AI - QA.postman_collection.json'

Can run individually defaults are set in Save Text -> Pre-request Script

Or run multiple tests by Running Collection and selection data file 'test-postman/test-data1.json' in the Collection Runner

## API Documenation

http://localhost:7040/api/v1/server/apidoc
