# REF: https://medium.com/@tiangolo/angular-in-docker-with-nginx-supporting-environments-built-with-multi-stage-docker-builds-bb9f1724e984

# FROM trion/nginx-angular
# COPY dist /usr/share/nginx/html/
# CMD sed -i "s/listen 8080/listen ${PORT:-8080}/" /etc/nginx/conf.d/default.conf && exec nginx -g "daemon off;"


# FROM docker-hub.artifactory.its.deakin.edu.au/node:12-alpine as build-stage
FROM tiangolo/node-frontend:10 as build-stage

WORKDIR /app
# RUN npm config set registry https://artifactory.its.deakin.edu.au/api/npm/deakin-npm
# RUN npm config set _auth anNob3R0b246QVAzVjlrV2J6MjcyVnFkdkVzU0oxS2g0UlpI
# RUN npm config set email joel.shotton@deakin.edu.au
# RUN npm config set always-auth true   
COPY package*.json .npmrc /app/
RUN npm ci

COPY ./ /app/

ARG configuration=production

RUN npm run config-dev
RUN npm run build-prod -- --output-path=./dist/out --configuration $configuration

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15
COPY --from=build-stage /app/dist/out/ /usr/share/nginx/html
# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY --from=build-stage  /app/nginx.conf /etc/nginx/conf.d/default.conf