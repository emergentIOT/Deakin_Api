FROM node:8.15

RUN apt-get update 
#RUN apt-get install vim

#Create app directory
WORKDIR ./ai-api-server

# Install app dependencies
COPY raml ./raml
COPY src ./src
# Wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY process*.json ./
COPY *.js ./

RUN npm --version; \
    node --version

RUN npm config set registry https://artifactory.its.deakin.edu.au/api/npm/des-inno-npm
RUN npm config set _auth anNob3R0b246QVAzVjlrV2J6MjcyVnFkdkVzU0oxS2g0UlpI
RUN npm config set email joel.shotton@deakin.edu.au
RUN npm config set always-auth true    

RUN npm -l install
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