FROM node:6 AS builder

WORKDIR scraaaam

RUN npm set progress=false && npm config set depth 0

RUN npm install --global --silent gulp-cli > /dev/null

COPY package.json .

RUN npm install --silent > /dev/null

COPY protractor.conf.js .
COPY .babelrc .
COPY ./test/e2e ./test/e2e

ENTRYPOINT ["npm", "run", "e2e-test"]