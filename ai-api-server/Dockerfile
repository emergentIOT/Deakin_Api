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
RUN npm config set ai-api-server:QUESTION_ANSWER_AI_URL http://research-gpu-poc-fs1.its.deakin.edu.au:8889/
RUN npm config set ai-api-server:QNA_BOT_AI_URL https://des-inno-qnabot.its.deakin.edu.au/

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