FROM node:8.15

RUN apt-get update 

#Create app directory
WORKDIR ./ai-api-server

# Install app dependencies
COPY raml ./raml
COPY src ./src
COPY mock-data ./mock-data
COPY *.js ./

# Wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json .npmrc process*.json ./

RUN npm --version; \
    node --version


RUN npm config set ai-api-server:MONGO_HOST ai-api-mongo
RUN npm config set ai-api-server:MONGO_DATABASE aiDb
RUN npm config set ai-api-server:QUESTION_GENERATION_AI_URL http://research-gpu-poc-fs1.its.deakin.edu.au:8888/
RUN npm config set ai-api-server:ANSWER_TOKEN_GENERATION_AI_URL http://research-gpu-poc-fs1.its.deakin.edu.au:8891/
RUN npm config set ai-api-server:QUESTION_ANSWER_AI_URL http://research-gpu-poc-fs1.its.deakin.edu.au:8894/
#RUN npm config set ai-api-server:QUESTION_SERVICE_AI_URL http://research-gpu-poc-fs1.its.deakin.edu.au:8893/
#RUN npm config set ai-api-server:QUESTION_SERVICE_AI_URL http://research-gpu-poc-fs1.its.deakin.edu.au/
RUN npm config set ai-api-server:QUESTION_SERVICE_AI_URL https://des-inno-faq.its.deakin.edu.au
RUN npm config set ai-api-server:QUESTION_SERVICE_AI_HOST des-inno-faq.its.deakin.edu.au
RUN npm config set ai-api-server:HOST_URL https://des-inno-ai-api.its.deakin.edu.au
RUN npm config set ai-api-server:QUESTION_SERVICE_CONFIDENCE_SCORE_LIMIT 0.2

RUN npm config set ai-api-server:APM_SERVER_URL http://des-inno-kibana.australiasoutheast.cloudapp.azure.com:8200
RUN npm config set ai-api-server:APM_SERVER_SECRET_TOKEN bOXt3wsI3GW2uQxxWb
RUN npm config set ai-api-server:ELASTIC_SEARCH_FEEDBACK_SERVER http://des-inno-elastic.australiasoutheast.cloudapp.azure.com:9200
RUN npm config set ai-api-server:ELASTIC_SEARCH_FEEDBACK_USERNAME node_client
RUN npm config set ai-api-server:ELASTIC_SEARCH_FEEDBACK_PASSWORD kyYfRX8gb4VvYPU

RUN npm install
# RUN npm ci --only=production

# Note cd out as npm local install will get messed up with global install
RUN cd ../ && npm install -g pm2@2
# If you are building your code for production

EXPOSE 7040

RUN ls -al; \
    pm2 --version; \
    npm --version; \
    node --version; \
    npm list --depth=1; exit 0

CMD [ "npm", "run", "start-server" ]