FROM node:6

WORKDIR scraaaam/test/perceptual

RUN npm set progress=false && npm config set depth 0

COPY package.json .

RUN npm install --silent > /dev/null

RUN apt-get update &&\
    apt-get install -y xvfb

COPY . .

ENTRYPOINT ["npm", "start"]
