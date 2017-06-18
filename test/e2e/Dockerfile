FROM node:6

WORKDIR scraaaam/test/e2e

RUN npm set progress=false && npm config set depth 0

COPY package.json .

RUN npm install --silent > /dev/null

COPY . .

ENTRYPOINT ["npm", "start"]