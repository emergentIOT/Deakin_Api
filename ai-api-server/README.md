# AI API Server

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
ai-api-server:QUESTION_ANSWER_AI_URL=http://research-gpu-poc-fs1.its.deakin.edu.au:8889/
```

Run server (Ensure DCM is open)

```
npm run start-nodemon
```

Load test data - gitlab dev enviroment
```
cd test-postman
newman run --iteration-data ivideo-list-init-sample-data.json --environment [client-api-gitlab-dev|client-api-local].postman_environment.json Deakin\ AI\ -\ Client\ Interactive\ Video\ API\ Populate.postman_collection.json
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

## API Documenation

http://localhost:7040/api/v1/server/apidoc
