FROM node:8.15

RUN apt-get update 
#RUN apt-get install vim

#Create app directory
WORKDIR ./api-server

# Install app dependencies
COPY raml ./raml
COPY lib ./lib
# Wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY process*.json ./
COPY *.js ./
COPY connection-org*.json ./
COPY crypto-config ./crypto-config

RUN npm config set registry https://artifactory.deakin.edu.au/api/npm/emergtech-dev
    

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

RUN echo "{ \
    \"bigdata1\": \"asAi2(wr@LW\", \
    \"bigdata2\": \"asAi2(wr@LW\" \
}" >  ~/.apiUsers.json

CMD [ "npm", "run", "start-server" ]